/**
 * Ironwood energy options: Business with Integrity case competition, Fall 2026.
 *
 * Compares the power supply options the case names for the Ironwood campus
 * (Upper Mount Bethel, Northampton County, PA):
 *
 *   grid      buy everything from the PJM grid through the local utility
 *   gas       build an onsite natural gas engine plant and run off it
 *   clean     grid power plus clean-energy contracts sized to Pennsylvania's
 *             2035 clean firm share
 *   flexible  grid power, with a 4-hour battery that carries the campus during
 *             grid emergencies so its grid draw falls to zero on call while the
 *             servers keep running
 *   hybrid    the energy half of the chief engineer's design: flexible plus
 *             clean contracts
 *
 * For each it reports the cost per MWh and per year, CO2 per year, the years
 * until first power, the peak the campus adds to PJM in an emergency, and
 * whether it meets the state's 2035 clean firm step, for phase 1 (480 MW) and
 * the full campus (2,000 MW). A sensitivity list moves one input at a time.
 *
 * Every input lives in data/cases/ironwood-energy.json with its source, date
 * and working, the same way regions.json carries the cost drivers.
 *
 *   npx tsx src/scripts/ironwoodEnergy.ts
 */

import { readFileSync, mkdirSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath, pathToFileURL } from 'url'

export interface Param {
  value: number
  low?: number | null
  high?: number | null
  unit: string
  source_url: string
  last_verified: string
  basis: 'sourced' | 'modeled' | 'assumed'
  method: string
}

export type Params = Record<string, Param>

export const HOURS = 8_760
export const LB_PER_METRIC_TON = 2_204.62

export function loadParams(): Params {
  const here = dirname(fileURLToPath(import.meta.url))
  const path = resolve(here, '../../../data/cases/ironwood-energy.json')
  return (JSON.parse(readFileSync(path, 'utf8')) as { params: Params }).params
}

/** A copy of the inputs with some values replaced, for one-at-a-time sensitivities. */
export function withValues(params: Params, values: Record<string, number>): Params {
  const out: Params = { ...params }
  for (const [k, v] of Object.entries(values)) {
    if (!out[k]) throw new Error(`unknown input ${k}`)
    out[k] = { ...out[k], value: v }
  }
  return out
}

export type OptionId = 'grid' | 'gas' | 'clean' | 'flexible' | 'hybrid'

export interface OptionResult {
  id:                   OptionId
  label:                string
  usd_per_mwh:          number
  annual_cost_usd:      number
  annual_co2_tonnes:    number
  co2_vs_grid_pct:      number
  years_to_power:       number
  emergency_peak_mw:    number
  battery_mwh:          number
  meets_clean_firm_2035: boolean
}

export interface Scenario {
  facility_mw:                number
  annual_mwh:                 number
  options:                    OptionResult[]
  clean_firm:                 Array<{ year: number; share: number; mwh: number }>
  capacity_cost_usd_per_year: number
  share_of_pjm_shortfall:     number
  curtailed_mwh_per_year:     number
}

const crf = (r: number, n: number) => (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)

/**
 * Levelized cost of onsite gas in $/MWh: capital recovered over the contract
 * at the discount rate, fixed O&M on the spare capacity too, fuel and variable
 * O&M. Built from parts rather than borrowed from a published LCOE so the gas
 * price, spare capacity and plant cost can each move.
 */
export function gasLcoe(params: Params): number {
  const v = (k: string) => params[k].value
  const redundancy = v('gas_redundancy_factor')
  const mwhPerKwYear = (HOURS * v('gas_capacity_factor')) / 1000
  const capital = (v('gas_capex_usd_per_kw') * redundancy * crf(v('discount_rate'), v('gas_plant_life_years'))
    + v('gas_fixed_om_usd_per_kw_yr') * redundancy) / mwhPerKwYear
  const fuel = (v('gas_heat_rate_btu_per_kwh') / 1000) * v('gas_price_usd_per_mmbtu')
  return capital + fuel + v('gas_variable_om_usd_per_mwh')
}

export function runEnergy(facilityMw: number, params: Params = loadParams()): Scenario {
  const v = (k: string) => {
    const p = params[k]
    if (!p) throw new Error(`ironwood-energy.json is missing ${k}`)
    return p.value
  }
  const annualMwh = facilityMw * HOURS * v('load_factor')

  // Grid
  const gridPrice  = v('grid_price_usd_per_mwh')
  const gridTonnes = (annualMwh * v('grid_co2_lb_per_mwh')) / LB_PER_METRIC_TON
  const gridYears  = v('grid_connection_years')
  const capacityPerYear = facilityMw * v('capacity_price_usd_per_mw_day') * 365

  // Onsite gas
  const gasPrice  = gasLcoe(params)
  const gasTonnes = (annualMwh * (v('gas_heat_rate_btu_per_kwh') / 1000) * v('gas_co2_lb_per_mmbtu')) / LB_PER_METRIC_TON

  // Battery that carries the whole campus through a grid emergency
  const batteryMwh   = facilityMw * v('curtailment_event_hours')
  const batteryCapex = batteryMwh * 1000 * v('battery_capex_usd_per_kwh')
  const batteryPerYear = batteryCapex * crf(v('discount_rate'), v('battery_life_years'))
    + batteryCapex * v('battery_fixed_om_share')
  const batteryPerMwh = batteryPerYear / annualMwh

  // Clean contracts: a virtual PPA pays the contract price and receives the
  // market price on the contracted share, so the net cost is the gap between
  // the two on that share. Emissions are counted on a market basis.
  const cleanShare  = v('clean_contract_share')
  const cleanAdder  = cleanShare * (v('ppa_price_usd_per_mwh') - v('wholesale_energy_usd_per_mwh'))
  const cleanTonnes = gridTonnes * (1 - cleanShare)

  // Flexible load: off the grid in emergencies, so the capacity charge tied to
  // the system peak falls by the share of the peak the battery removes.
  const peakCut       = v('flexible_peak_reduction_share')
  const flexPeakMw    = facilityMw * (1 - peakCut)
  const capacitySaved = (facilityMw - flexPeakMw) * v('capacity_price_usd_per_mw_day') * 365 / annualMwh
  const flexYears     = Math.max(0, gridYears - v('flexible_years_saved'))

  const meets = cleanShare >= v('clean_firm_2035')
  const option = (id: OptionId, label: string, perMwh: number, tonnes: number, years: number, peak: number, battery: number, clean: boolean): OptionResult => ({
    id, label, usd_per_mwh: perMwh, annual_cost_usd: perMwh * annualMwh,
    annual_co2_tonnes: tonnes, co2_vs_grid_pct: (tonnes / gridTonnes - 1) * 100,
    years_to_power: years, emergency_peak_mw: peak, battery_mwh: battery, meets_clean_firm_2035: clean,
  })

  const options = [
    option('grid',     'Grid only',                        gridPrice,                                  gridTonnes,  gridYears, facilityMw, 0,          false),
    option('gas',      'Onsite gas engines',               gasPrice,                                   gasTonnes,   v('gas_years_to_power'), 0, 0,     false),
    option('clean',    'Grid + clean contracts',           gridPrice + cleanAdder,                     cleanTonnes, gridYears, facilityMw, 0,          meets),
    option('flexible', 'Grid + battery for emergencies',   gridPrice + batteryPerMwh - capacitySaved,  gridTonnes,  flexYears, flexPeakMw, batteryMwh, false),
    option('hybrid',   'Hybrid (flexible + clean)',        gridPrice + cleanAdder + batteryPerMwh - capacitySaved, cleanTonnes, flexYears, flexPeakMw, batteryMwh, meets),
  ]

  return {
    facility_mw: facilityMw,
    annual_mwh: annualMwh,
    options,
    clean_firm: [2027, 2030, 2035].map((year) => ({ year, share: v(`clean_firm_${year}`), mwh: v(`clean_firm_${year}`) * annualMwh })),
    capacity_cost_usd_per_year: capacityPerYear,
    share_of_pjm_shortfall: facilityMw / v('pjm_shortfall_2028_mw'),
    curtailed_mwh_per_year: annualMwh * v('curtailment_share_of_energy'),
  }
}

/** One input at a time, to its low or high end, for phase 1. */
export function sensitivities(params: Params = loadParams()) {
  const mw = params.phase1_mw.value
  const base = runEnergy(mw, params)
  const rows: Array<{ input: string; to: number; option: OptionId; usd_per_mwh: number; change: number }> = []
  const cases: Array<[string, 'low' | 'high', OptionId[]]> = [
    ['gas_price_usd_per_mmbtu',      'high', ['gas']],
    ['gas_price_usd_per_mmbtu',      'low',  ['gas']],
    ['gas_capex_usd_per_kw',         'high', ['gas']],
    ['battery_capex_usd_per_kwh',    'low',  ['flexible', 'hybrid']],
    ['battery_capex_usd_per_kwh',    'high', ['flexible', 'hybrid']],
    ['curtailment_event_hours',      'low',  ['flexible', 'hybrid']],
    ['grid_price_usd_per_mwh',       'high', ['grid', 'clean', 'flexible', 'hybrid']],
    ['wholesale_energy_usd_per_mwh', 'high', ['clean', 'hybrid']],
    ['ppa_price_usd_per_mwh',        'low',  ['clean', 'hybrid']],
  ]
  for (const [input, end, ids] of cases) {
    const to = params[input][end]
    if (to === null || to === undefined) continue
    const s = runEnergy(mw, withValues(params, { [input]: to }))
    for (const id of ids) {
      const now = s.options.find((o) => o.id === id)!.usd_per_mwh
      const was = base.options.find((o) => o.id === id)!.usd_per_mwh
      rows.push({ input, to, option: id, usd_per_mwh: now, change: now - was })
    }
  }
  return rows
}

const M = (n: number) => `$${(n / 1e6).toFixed(0)}M`

async function main() {
  const params = loadParams()
  const outDir = resolve(process.cwd(), 'case-output')
  mkdirSync(outDir, { recursive: true })
  const scenarios = [params.phase1_mw.value, params.full_build_mw.value].map((mw) => runEnergy(mw, params))
  for (const s of scenarios) {
    console.log(`\n=== ${s.facility_mw} MW, ${(s.annual_mwh / 1e6).toFixed(2)} TWh a year, ${(s.share_of_pjm_shortfall * 100).toFixed(1)}% of PJM's 2028/29 shortfall ===`)
    for (const o of s.options) {
      console.log(`${o.label.padEnd(32)} $${o.usd_per_mwh.toFixed(1)}/MWh  ${M(o.annual_cost_usd)}/yr  CO2 ${(o.annual_co2_tonnes / 1e6).toFixed(2)}M t (${o.co2_vs_grid_pct >= 0 ? '+' : ''}${o.co2_vs_grid_pct.toFixed(0)}%)  power in ${o.years_to_power} yr  emergency peak ${o.emergency_peak_mw.toFixed(0)} MW  battery ${o.battery_mwh.toFixed(0)} MWh  2035 clean firm ${o.meets_clean_firm_2035 ? 'yes' : 'no'}`)
    }
    console.log(`capacity charge at the auction price: ${M(s.capacity_cost_usd_per_year)}/yr; curtailed energy ${(s.curtailed_mwh_per_year / 1e3).toFixed(0)} GWh/yr`)
    for (const c of s.clean_firm) console.log(`clean firm ${c.year}: ${(c.share * 100).toFixed(1)}% = ${(c.mwh / 1e3).toFixed(0)} GWh`)
  }
  const sens = sensitivities(params)
  console.log('\n=== Phase 1 sensitivities ===')
  for (const r of sens) console.log(`${r.input} -> ${r.to}: ${r.option} $${r.usd_per_mwh.toFixed(1)}/MWh (${r.change >= 0 ? '+' : ''}${r.change.toFixed(1)})`)
  writeFileSync(resolve(outDir, 'energy-summary.json'), JSON.stringify({ generated_at: new Date().toISOString(), scenarios, sensitivities: sens }, null, 2))
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((e) => { console.error(e); process.exit(1) })
}
