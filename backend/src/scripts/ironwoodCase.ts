/**
 * Ironwood case runs — Business with Integrity case competition, Fall 2026.
 *
 * Prices the Ironwood site (Upper Mount Bethel, Northampton County, PA) against
 * the two PJM markets a data center customer would most plausibly move to:
 * Columbus, OH and Northern Virginia. Runs the deterministic engine only, no
 * LLM, and prints a summary plus the full JSON to case-output/.
 *
 *   npx tsx src/scripts/ironwoodCase.ts
 *
 * Phase 1 sizing. The case gives a 480 MW initial substation. That is total
 * site power, so equipment load is 480 MW / PUE. At the default design PUE of
 * 1.25 that is 384 MW, which is what capacity_kw takes.
 *
 * Twenty years matches the anchor customer's 20-year power agreement. Ten
 * percent is KGE's investment threshold from the case, used here as the
 * discount rate so a cost NPV is read at the same hurdle.
 *
 * Two data views:
 *   stored       — every site uses its own entry in data/regions.json.
 *   like-for-like — power price, grid mix, hazard risk and staff cost come from
 *                   the same statewide series for all three sites. The Columbus
 *                   and Northern Virginia metro entries were hand-collected in
 *                   July from older or different sources (Columbus power 5.9
 *                   cents vs Ohio's 2025 industrial average of 8.52), so the
 *                   stored view flatters them against a site priced in 2026.
 *
 * Two designs at Ironwood:
 *   base   — the case's base plan.
 *   hybrid — the chief engineer's design, about 9% above the base plan. Priced
 *            here as construction x 1.09. The case also says it could delay
 *            phase 1 by up to 14 months; this engine has no time dimension, so
 *            the delay is not in these figures.
 */

import { mkdirSync, writeFileSync } from 'fs'
import { resolve } from 'path'
import { runEngine } from '../engine/index.js'
import type { EstimateInput } from '../schemas/input.js'
import type { EstimateOutput } from '../schemas/output.js'

const FACILITY_KW   = 480_000
const DESIGN_PUE    = 1.25
const CAPACITY_KW   = FACILITY_KW / DESIGN_PUE   // 384,000 kW of equipment load
const HYBRID_FACTOR = 1.09
const IRONWOOD_BUILD_PER_KW = 9_800

type Overrides = NonNullable<EstimateInput['sites'][number]['overrides']>

// Statewide series, 2025 EIA industrial price, 2024 EIA generation mix,
// FEMA NRI population-weighted state score, BLS OEWS state staff index.
// Values are copied from the us-oh / us-va / us-pa entries in regions.json.
const STATEWIDE: Record<string, Overrides> = {
  ironwood: { power_rate_usd_per_kwh: 0.0936, renewable_pct: 0.0309, low_carbon_pct: 0.3432, risk_score: 8.74, staff_cost_index: 1.004 },
  columbus: { power_rate_usd_per_kwh: 0.0852, renewable_pct: 0.0251, low_carbon_pct: 0.1508, risk_score: 7.90, staff_cost_index: 1.025 },
  nova:     { power_rate_usd_per_kwh: 0.0945, renewable_pct: 0.0457, low_carbon_pct: 0.3275, risk_score: 6.26, staff_cost_index: 1.079 },
}

function input(view: 'stored' | 'like-for-like', design: 'base' | 'hybrid'): EstimateInput {
  const ironwoodOv: Overrides = {
    ...(view === 'like-for-like' ? STATEWIDE.ironwood : {}),
    ...(design === 'hybrid' ? { construction_cost_per_kw: Math.round(IRONWOOD_BUILD_PER_KW * HYBRID_FACTOR) } : {}),
  }
  return {
    project: {
      name:           `Ironwood phase 1 (${view}, ${design} design)`,
      capacity_kw:    CAPACITY_KW,
      design_pue:     DESIGN_PUE,
      design_wue:     0.4,
      lifetime_years: 20,
      discount_rate:  0.10,
      occupancy_pct:  0.85,
      weights:        { total_cost: 0.50, risk: 0.20, sustainability: 0.15, latency: 0.15 },
    },
    sites: [
      { site_id: 'ironwood', label: 'Ironwood (Upper Mount Bethel, PA)', region_key: 'us-pa-northampton', overrides: ironwoodOv },
      { site_id: 'columbus', label: 'Columbus, OH',      region_key: 'us-oh-columbus',  overrides: view === 'like-for-like' ? STATEWIDE.columbus : {} },
      { site_id: 'nova',     label: 'Northern Virginia', region_key: 'us-va-northern', overrides: view === 'like-for-like' ? STATEWIDE.nova : {} },
    ],
  }
}

const M = (n: number) => `$${(n / 1e6).toFixed(0)}M`
const B = (n: number) => `$${(n / 1e9).toFixed(2)}B`

function summarise(title: string, out: EstimateOutput): string {
  const lines = [`\n=== ${title} ===`]
  for (const id of out.ranking) {
    const s = out.sites[id]
    lines.push(
      `#${s.rank} ${out.site_labels[id].padEnd(34)} score ${s.weighted_score.toFixed(3)}` +
      ` | build ${B(s.capex.total_usd)} | run ${M(s.opex_annual.total_usd)}/yr (power ${M(s.opex_annual.power_usd)})` +
      ` | 20-yr cost ${B(-s.finance.npv_usd)} = $${Math.round(s.finance.lifetime_cost_per_kw).toLocaleString()}/kW` +
      ` [range $${Math.round(s.finance.ranges.low.lifetime_per_kw).toLocaleString()}-$${Math.round(s.finance.ranges.high.lifetime_per_kw).toLocaleString()}]`,
    )
  }
  lines.push(`flip: ${out.flip_sentence}`)
  for (const f of out.sensitivity) {
    lines.push(`  ${f.driver}: ${f.current_value} -> ${f.flip_value} (${f.pct_change == null ? f.absolute_change : f.pct_change.toFixed(1) + '%'})${f.stable ? ' stable' : ''} [${f.affected_sites.join(',')}]`)
  }
  if (out.data_gaps.length) lines.push(`gaps: ${out.data_gaps.map((g) => `${g.site_id}:${g.driver}`).join(', ')}`)
  return lines.join('\n')
}

async function main() {
  const outDir = resolve(process.cwd(), 'case-output')
  mkdirSync(outDir, { recursive: true })
  const runs: Array<[string, 'stored' | 'like-for-like', 'base' | 'hybrid']> = [
    ['stored-base', 'stored', 'base'],
    ['stored-hybrid', 'stored', 'hybrid'],
    ['likeforlike-base', 'like-for-like', 'base'],
    ['likeforlike-hybrid', 'like-for-like', 'hybrid'],
  ]
  for (const [name, view, design] of runs) {
    const out = await runEngine(input(view, design), { forceFallback: true, skipCache: true })
    writeFileSync(resolve(outDir, `${name}.json`), JSON.stringify(out, null, 2))
    console.log(summarise(`${view} data, ${design} design`, out))
  }
  const energyKwh = CAPACITY_KW * DESIGN_PUE * 8760
  console.log(`\nPhase 1 energy: ${(energyKwh / 1e9).toFixed(2)} TWh a year (${CAPACITY_KW / 1000} MW equipment x PUE ${DESIGN_PUE} x 8,760 h)`)
}

main().catch((e) => { console.error(e); process.exit(1) })
