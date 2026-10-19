/**
 * Ironwood energy options: Business with Integrity case competition, Fall 2026.
 *
 * Compares the power supply options the case names for the Ironwood campus
 * (Upper Mount Bethel, Northampton County, PA):
 *
 *   grid       buy everything from the PJM grid through the local utility
 *   gas        build onsite natural gas generation and run off it
 *   clean      grid power plus clean-energy contracts and a battery
 *   flexible   grid power, with the campus cutting its grid draw during the
 *              few grid-emergency hours a year, a battery carrying the load so
 *              the servers never stop
 *   hybrid     the chief engineer's package: flexible plus clean contracts
 *
 * For each it reports the cost per MWh and per year, CO2 per year, the years
 * until first power, and the peak load the campus adds to PJM, for phase 1
 * (480 MW) and the full campus (2,000 MW).
 *
 * Every input lives in data/cases/ironwood-energy.json with its source, date
 * and working, the same way regions.json carries the cost drivers. Nothing
 * here is a bare number except unit conversions.
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

const HOURS = 8_760
const LB_PER_METRIC_TON = 2_204.62

export function loadParams(): Params {
  const here = dirname(fileURLToPath(import.meta.url))
  const path = resolve(here, '../../../data/cases/ironwood-energy.json')
  const raw = JSON.parse(readFileSync(path, 'utf8')) as { params: Params }
  return raw.params
}

export type OptionId = 'grid' | 'gas' | 'clean' | 'flexible' | 'hybrid'
export type Point = 'value' | 'low' | 'high'

export interface OptionResult {
  id:                OptionId
  label:             string
  usd_per_mwh:       number
  annual_cost_usd:   number
  annual_co2_tonnes: number
  co2_vs_grid_pct:   number
  years_to_power:    number
  pjm_peak_added_mw: number
  battery_mwh:       number
  notes:             string[]
}

export interface Scenario {
  facility_mw:  number
  annual_mwh:   number
  options:      OptionResult[]
  clean_firm:   Array<{ year: number; share: number; mwh: number }>
  capacity_cost_usd_per_year: number
}

/**
 * Pick one point of a parameter's range. A missing low or high falls back to
 * the value, so a parameter without a range is held fixed.
 */
function pick(p: Param, at: Point): number {
  if (at === 'low')  return p.low  ?? p.value
  if (at === 'high') return p.high ?? p.value
  return p.value
}

/**
 * Levelized cost of onsite gas in $/MWh from its parts: capital recovered over
 * the plant's life at the discount rate, fixed O&M, fuel and variable O&M.
 * Computed rather than borrowed from a published LCOE so the gas price and the
 * capacity factor can move, and checked against Lazard's published range.
 */
export function gasLcoe(params: Params, at: Point = 'value', gasPricePerMMBtu?: number): number {
  const r     = params.discount_rate.value
  const n     = params.gas_plant_life_years.value
  const crf   = (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
  const capex = pick(params.gas_capex_usd_per_kw, at) * params.gas_redundancy_factor.value
  const fom   = params.gas_fixed_om_usd_per_kw_yr.value * params.gas_redundancy_factor.value
  const cf    = params.gas_capacity_factor.value
  const mwhPerKwYear = (HOURS * cf) / 1000
  const capital = (capex * crf + fom) / mwhPerKwYear
  const fuel = (params.gas_heat_rate_btu_per_kwh.value / 1000) * (gasPricePerMMBtu ?? pick(params.gas_price_usd_per_mmbtu, at))
  return capital + fuel + params.gas_variable_om_usd_per_mwh.value
}

export function runEnergy(facilityMw: number, at: Point = 'value', params: Params = loadParams()): Scenario {
  const P = (k: string) => {
    const p = params[k]
    if (!p) throw new Error(`ironwood-energy.json is missing ${k}`)
    return pick(p, at)
  }
  const annualMwh = facilityMw * HOURS * P('load_factor')

  // ── Grid ──────────────────────────────────────────────────────────────────
  const gridPrice  = P('grid_price_usd_per_mwh')
  const gridCo2Lb  = P('grid_co2_lb_per_mwh')
  const gridTonnes = (annualMwh * gridCo2Lb) / LB_PER_METRIC_TON
  const gridYears  = P('grid_connection_years')
  const capacityCost = facilityMw * P('capacity_price_usd_per_mw_day') * 365

  // ── Onsite gas ────────────────────────────────────────────────────────────
  const gasPrice  = gasLcoe(params, at)
  const gasCo2Lb  = (params.gas_heat_rate_btu_per_kwh.value / 1000) * params.gas_co2_lb_per_mmbtu.value
  const gasTonnes = (annualMwh * gasCo2Lb) / LB_PER_METRIC_TON
  const gasYears  = P('gas_years_to_power')

  // ── Battery sized for grid emergencies ────────────────────────────────────
  // Carries the whole campus for the longest curtailment event the flexibility
  // study reports, so the servers keep running while the grid draw falls.
  const batteryMwh   = facilityMw * P('curtailment_event_hours')
  const batteryCapex = batteryMwh * 1000 * P('battery_capex_usd_per_kwh')
  const r = params.discount_rate.value
  const life = params.battery_life_years.value
  const crf = (r * Math.pow(1 + r, life)) / (Math.pow(1 + r, life) - 1)
  const batteryPerYear = batteryCapex * crf * (1 + params.battery_fixed_om_share.value)
  const batteryPerMwh  = batteryPerYear / annualMwh

  // ── Clean contracts ───────────────────────────────────────────────────────
  // A virtual PPA settles against the market: the campus pays the contract
  // price and receives the market price for the contracted share, so the net
  // cost is the gap between the two on that share. Emissions are counted on a
  // market basis, which is how the customer reports against its carbon goal.
  const cleanShare   = P('clean_contract_share')
  const ppaGap       = P('ppa_price_usd_per_mwh') - P('wholesale_energy_usd_per_mwh')
  const cleanAdder   = cleanShare * ppaGap
  const cleanTonnes  = gridTonnes * (1 - cleanShare)

  // ── Flexible load ─────────────────────────────────────────────────────────
  // Accepting curtailment lets the campus connect ahead of the full upgrade
  // and removes its peak from the capacity PJM must buy for those hours.
  const flexYears   = Math.max(0, gridYears - P('flexible_years_saved'))
  const flexPeakMw  = facilityMw * (1 - P('flexible_peak_reduction_share'))
  const flexCapSave = (facilityMw - flexPeakMw) * P('capacity_price_usd_per_mw_day') * 365 / annualMwh

  const options: OptionResult[] = [
    {
      id: 'grid', label: 'Grid only',
      usd_per_mwh: gridPrice, annual_cost_usd: gridPrice * annualMwh,
      annual_co2_tonnes: gridTonnes, co2_vs_grid_pct: 0,
      years_to_power: gridYears, pjm_peak_added_mw: facilityMw, battery_mwh: 0,
      notes: ['Full campus peak lands on PJM in every hour, including grid emergencies.'],
    },
    {
      id: 'gas', label: 'Onsite gas',
      usd_per_mwh: gasPrice, annual_cost_usd: gasPrice * annualMwh,
      annual_co2_tonnes: gasTonnes, co2_vs_grid_pct: pct(gasTonnes, gridTonnes),
      years_to_power: gasYears, pjm_peak_added_mw: 0, battery_mwh: 0,
      notes: ['Built with spare units so one can be down for maintenance without stopping the campus.'],
    },
    {
      id: 'clean', label: 'Grid + clean contracts + battery',
      usd_per_mwh: gridPrice + cleanAdder + batteryPerMwh, annual_cost_usd: (gridPrice + cleanAdder + batteryPerMwh) * annualMwh,
      annual_co2_tonnes: cleanTonnes, co2_vs_grid_pct: pct(cleanTonnes, gridTonnes),
      years_to_power: gridYears, pjm_peak_added_mw: facilityMw, battery_mwh: batteryMwh,
      notes: ['The battery here covers outages only; it is not offered to PJM as load reduction.'],
    },
    {
      id: 'flexible', label: 'Grid + emergency load reduction',
      usd_per_mwh: gridPrice + batteryPerMwh - flexCapSave, annual_cost_usd: (gridPrice + batteryPerMwh - flexCapSave) * annualMwh,
      annual_co2_tonnes: gridTonnes, co2_vs_grid_pct: 0,
      years_to_power: flexYears, pjm_peak_added_mw: flexPeakMw, battery_mwh: batteryMwh,
      notes: ['The battery carries the servers through each grid emergency, so operations never stop.'],
    },
    {
      id: 'hybrid', label: 'Hybrid (engineer\'s design)',
      usd_per_mwh: gridPrice + cleanAdder + batteryPerMwh - flexCapSave,
      annual_cost_usd: (gridPrice + cleanAdder + batteryPerMwh - flexCapSave) * annualMwh,
      annual_co2_tonnes: cleanTonnes, co2_vs_grid_pct: pct(cleanTonnes, gridTonnes),
      years_to_power: flexYears, pjm_peak_added_mw: flexPeakMw, battery_mwh: batteryMwh,
      notes: ['Flexible load plus clean contracts, the energy half of the case\'s hybrid design.'],
    },
  ]

  const clean_firm = (['clean_firm_2027', 'clean_firm_2030', 'clean_firm_2035'] as const).map((k) => ({
    year: Number(k.slice(-4)), share: params[k].value, mwh: params[k].value * annualMwh,
  }))

  return { facility_mw: facilityMw, annual_mwh: annualMwh, options, clean_firm, capacity_cost_usd_per_year: capacityCost }
}

function pct(a: number, b: number): number { return b === 0 ? 0 : (a / b - 1) * 100 }

const M = (n: number) => `$${(n / 1e6).toFixed(0)}M`
const T = (n: number) => `${(n / 1e6).toFixed(2)}M t`

async function main() {
  const params = loadParams()
  const outDir = resolve(process.cwd(), 'case-output')
  mkdirSync(outDir, { recursive: true })
  const result: Record<string, Scenario> = {}
  for (const mw of [params.phase1_mw.value, params.full_build_mw.value]) {
    for (const at of ['value', 'low', 'high'] as Point[]) {
      const s = runEnergy(mw, at, params)
      result[`${mw}MW-${at}`] = s
      if (at !== 'value') continue
      console.log(`\n=== ${mw} MW, ${(s.annual_mwh / 1e6).toFixed(2)} TWh a year ===`)
      for (const o of s.options) {
        console.log(`${o.label.padEnd(36)} $${o.usd_per_mwh.toFixed(1)}/MWh  ${M(o.annual_cost_usd)}/yr  CO2 ${T(o.annual_co2_tonnes)} (${o.co2_vs_grid_pct.toFixed(0)}%)  power in ${o.years_to_power.toFixed(1)} yr  PJM peak ${o.pjm_peak_added_mw.toFixed(0)} MW  battery ${o.battery_mwh.toFixed(0)} MWh`)
      }
      console.log(`capacity cost at the auction price: ${M(s.capacity_cost_usd_per_year)}/yr`)
      for (const c of s.clean_firm) console.log(`clean firm ${c.year}: ${(c.share * 100).toFixed(1)}% = ${(c.mwh / 1e3).toFixed(0)} GWh`)
    }
  }
  writeFileSync(resolve(outDir, 'energy-summary.json'), JSON.stringify({ generated_at: new Date().toISOString(), result }, null, 2))
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((e) => { console.error(e); process.exit(1) })
}
