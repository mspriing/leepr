/**
 * Ironwood case runs: Business with Integrity case competition, Fall 2026.
 *
 * Prices the Ironwood site (Upper Mount Bethel, Northampton County, PA) against
 * the two PJM markets a data center customer would most plausibly move to:
 * Columbus, OH and Northern Virginia. Runs the deterministic engine only, no
 * LLM, prints a summary, and writes every run plus summary.json to
 * backend/case-output/.
 *
 *   npx tsx src/scripts/ironwoodCase.ts
 *
 * Phase 1 sizing. The case gives a 480 MW initial substation. That is total
 * site power, so equipment load is 480 MW / PUE. At the default design PUE of
 * 1.25 that is 384 MW, which is what capacity_kw takes. Every per-kW figure is
 * linear in capacity, so it holds for the full 2,000 MW build as well; the
 * engine itself caps a single run at 500 MW of equipment load.
 *
 * Twenty years matches the anchor customer's 20-year power agreement. Ten
 * percent is KGE's investment threshold from the case, used here as the
 * discount rate so a cost NPV is read at the same hurdle.
 *
 * Two data views:
 *   stored   every site uses its own entry in data/regions.json.
 *   matched  power price, grid mix and staff cost come from the same statewide
 *            series for all three sites. Since the October data fix the stored
 *            power and grid mix already match; staff cost is the remaining
 *            difference, because Columbus and Northern Virginia carry metro
 *            wage indices and Ironwood only a state one.
 *
 * Two designs at Ironwood:
 *   base     the case's base plan.
 *   hybrid   the chief engineer's design, about 9% above the base plan, priced
 *            as construction x 1.09. The case also says it could delay phase 1
 *            by up to 14 months; the engine has no time dimension, so the delay
 *            is not in these figures.
 *
 * Three property tax cases:
 *   none     no abatement anywhere (the engine's default).
 *   ohio     Columbus gets a 100% property tax abatement for 15 years, the
 *            terms New Albany City Council approved for Microsoft's data center
 *            (WOSU, 2 Oct 2024; Axios Columbus, 17 Oct 2024). Ohio law on local
 *            abatements is unchanged as of Sept 2026; only the state sales tax
 *            exemption is paused. Ironwood gets none: its LERTA runs to the end
 *            of 2027, before the campus would be taxed, and the Aug 2026 MOU
 *            dropped the extension.
 *   both     Columbus as above, and Ironwood's LERTA extended, which at 10% is
 *            worth about 5 full years (see tax_abatement_years in regions.json).
 */

import { mkdirSync, writeFileSync } from 'fs'
import { resolve } from 'path'
import { pathToFileURL } from 'url'
import { runEngine } from '../engine/index.js'
import { loadRegions } from '../regions.js'
import type { EstimateInput } from '../schemas/input.js'
import type { EstimateOutput } from '../schemas/output.js'

export type View   = 'stored' | 'matched'
export type Design = 'base' | 'hybrid'
export type TaxCase = 'none' | 'ohio' | 'both'
type Overrides = NonNullable<EstimateInput['sites'][number]['overrides']>

export const FACILITY_KW   = 480_000
export const DESIGN_PUE    = 1.25
export const CAPACITY_KW   = FACILITY_KW / DESIGN_PUE   // 384,000 kW of equipment load
export const HYBRID_FACTOR = 1.09
export const OHIO_ABATEMENT_YEARS  = 15
export const LERTA_EQUIVALENT_YEARS = 5

export const SITES = {
  ironwood: { region: 'us-pa-northampton', state: 'us-pa', label: 'Ironwood (Upper Mount Bethel, PA)' },
  columbus: { region: 'us-oh-columbus',    state: 'us-oh', label: 'Columbus, OH' },
  nova:     { region: 'us-va-northern',    state: 'us-va', label: 'Northern Virginia' },
} as const
type SiteId = keyof typeof SITES

function value(regionKey: string, field: string): number {
  const region = loadRegions()[regionKey] as unknown as Record<string, { value: number | null }>
  const v = region?.[field]?.value
  if (v === null || v === undefined) throw new Error(`${regionKey}.${field} has no value in regions.json`)
  return v
}

/** Statewide series plus each site's county hazard score, read live so they never drift from the data. */
function matchedOverrides(id: SiteId): Overrides {
  const state = SITES[id].state
  return {
    power_rate_usd_per_kwh: value(state, 'power_rate_usd_per_kwh'),
    renewable_pct:          value(state, 'renewable_pct'),
    low_carbon_pct:         value(state, 'low_carbon_pct'),
    staff_cost_index:       value(state, 'staff_cost_index'),
    risk_score:             value(SITES[id].region, 'risk_score'),
  }
}

function abatement(id: SiteId, tax: TaxCase): Overrides {
  if (id === 'columbus' && tax !== 'none') return { tax_abatement_years: OHIO_ABATEMENT_YEARS }
  if (id === 'ironwood' && tax === 'both') return { tax_abatement_years: LERTA_EQUIVALENT_YEARS }
  return {}
}

/** Hybrid build cost at one point of Ironwood's construction range. */
export function hybridBuildPerKw(point: 'value' | 'low' | 'high' = 'value'): number {
  const driver = loadRegions()[SITES.ironwood.region].construction_cost_per_kw
  const base = point === 'value' ? driver.value : driver[point]
  if (base === null || base === undefined) throw new Error(`Ironwood construction ${point} is missing`)
  return Math.round(base * HYBRID_FACTOR)
}

export function caseInput(
  view: View, design: Design, tax: TaxCase,
  hybridPoint: 'value' | 'low' | 'high' = 'value',
): EstimateInput {
  const site = (id: SiteId) => ({
    site_id: id,
    label: SITES[id].label,
    region_key: SITES[id].region,
    overrides: {
      ...(view === 'matched' ? matchedOverrides(id) : {}),
      ...abatement(id, tax),
      ...(id === 'ironwood' && design === 'hybrid'
        ? { construction_cost_per_kw: hybridBuildPerKw(hybridPoint) } : {}),
    } satisfies Overrides,
  })
  return {
    project: {
      name:           `Ironwood phase 1 (${view} data, ${design} design, tax case ${tax})`,
      capacity_kw:    CAPACITY_KW,
      design_pue:     DESIGN_PUE,
      design_wue:     0.4,
      lifetime_years: 20,
      discount_rate:  0.10,
      occupancy_pct:  0.85,
      weights:        { total_cost: 0.50, risk: 0.20, sustainability: 0.15, latency: 0.15 },
    },
    sites: [site('ironwood'), site('columbus'), site('nova')],
  }
}

export interface CaseRow {
  run:       string
  view:      View
  design:    Design
  tax:       TaxCase
  ranking:   string[]
  score:     Record<string, number>
  per_kw:    Record<string, number>
  per_kw_low:  Record<string, number>
  per_kw_high: Record<string, number>
  build_usd: Record<string, number>
  running_usd_year1: Record<string, number>
  power_usd_year1:   Record<string, number>
  tax_usd_year1:     Record<string, number>
  flip:      string
  data_gaps: string[]
}

const RUNS: Array<[View, Design, TaxCase]> = [
  ['stored',  'base',   'none'],
  ['stored',  'hybrid', 'none'],
  ['matched', 'base',   'none'],
  ['matched', 'hybrid', 'none'],
  ['matched', 'base',   'ohio'],
  ['matched', 'hybrid', 'ohio'],
  ['matched', 'base',   'both'],
  ['matched', 'hybrid', 'both'],
]

const byId = <T>(out: EstimateOutput, pick: (s: EstimateOutput['sites'][string]) => T) =>
  Object.fromEntries(Object.entries(out.sites).map(([id, s]) => [id, pick(s)])) as Record<string, T>

export async function runCase(): Promise<{ rows: CaseRow[]; outputs: Record<string, EstimateOutput> }> {
  const rows: CaseRow[] = []
  const outputs: Record<string, EstimateOutput> = {}
  const engine = (input: EstimateInput) => runEngine(input, { forceFallback: true, skipCache: true })

  for (const [view, design, tax] of RUNS) {
    const run = `${view}-${design}-${tax}`
    const out = await engine(caseInput(view, design, tax))
    outputs[run] = out
    const low  = byId(out, (s) => s.finance.ranges.low.lifetime_per_kw)
    const high = byId(out, (s) => s.finance.ranges.high.lifetime_per_kw)

    // An override pins a driver, so the engine reports no range for it. The
    // hybrid build cost is an override, so Ironwood's range is rebuilt here by
    // running the low and high ends of its construction range through the
    // same multiplier.
    if (design === 'hybrid') {
      const lo = await engine(caseInput(view, design, tax, 'low'))
      const hi = await engine(caseInput(view, design, tax, 'high'))
      low.ironwood  = Math.min(lo.sites.ironwood.finance.ranges.low.lifetime_per_kw,  out.sites.ironwood.finance.ranges.low.lifetime_per_kw)
      high.ironwood = Math.max(hi.sites.ironwood.finance.ranges.high.lifetime_per_kw, out.sites.ironwood.finance.ranges.high.lifetime_per_kw)
    }

    rows.push({
      run, view, design, tax,
      ranking:   out.ranking,
      score:     byId(out, (s) => s.weighted_score),
      per_kw:    byId(out, (s) => s.finance.lifetime_cost_per_kw),
      per_kw_low: low,
      per_kw_high: high,
      build_usd: byId(out, (s) => s.capex.total_usd),
      running_usd_year1: byId(out, (s) => s.opex_annual.total_usd),
      power_usd_year1:   byId(out, (s) => s.opex_annual.power_usd),
      tax_usd_year1:     byId(out, (s) => s.opex_annual.taxes_usd),
      flip:      out.flip_sentence,
      data_gaps: out.data_gaps.map((g) => `${g.site_id}:${g.driver}`),
    })
  }
  return { rows, outputs }
}

const K = (n: number) => `$${Math.round(n).toLocaleString('en-US')}`
const M = (n: number) => `$${(n / 1e6).toFixed(0)}M`
const B = (n: number) => `$${(n / 1e9).toFixed(2)}B`

async function main() {
  const outDir = resolve(process.cwd(), 'case-output')
  mkdirSync(outDir, { recursive: true })
  const { rows, outputs } = await runCase()
  for (const [run, out] of Object.entries(outputs)) {
    writeFileSync(resolve(outDir, `${run}.json`), JSON.stringify(out, null, 2))
  }
  writeFileSync(resolve(outDir, 'summary.json'), JSON.stringify({
    generated_at: new Date().toISOString(),
    capacity_kw: CAPACITY_KW, design_pue: DESIGN_PUE, lifetime_years: 20, discount_rate: 0.10,
    rows,
  }, null, 2))

  for (const r of rows) {
    console.log(`\n=== ${r.view} data, ${r.design} design, tax case ${r.tax} ===`)
    for (const id of r.ranking) {
      console.log(
        `#${r.ranking.indexOf(id) + 1} ${id.padEnd(9)} score ${r.score[id].toFixed(3)}` +
        ` | ${K(r.per_kw[id])}/kW [${K(r.per_kw_low[id])}-${K(r.per_kw_high[id])}]` +
        ` | build ${B(r.build_usd[id])} | year-1 run ${M(r.running_usd_year1[id])}` +
        ` (power ${M(r.power_usd_year1[id])}, tax ${M(r.tax_usd_year1[id])})`)
    }
    console.log(`flip: ${r.flip}`)
    if (r.data_gaps.length) console.log(`gaps: ${r.data_gaps.join(', ')}`)
  }
  const energyKwh = CAPACITY_KW * DESIGN_PUE * 8760
  console.log(`\nPhase 1 energy: ${(energyKwh / 1e9).toFixed(2)} TWh a year (${CAPACITY_KW / 1000} MW equipment x PUE ${DESIGN_PUE} x 8,760 h)`)
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((e) => { console.error(e); process.exit(1) })
}
