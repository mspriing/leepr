/**
 * backend/tests/ironwoodEnergy.test.ts
 *
 * Guards on the Ironwood energy options model.
 *
 * 1. Every input carries a source, a date and a working, and sits inside its
 *    own range.
 * 2. The model's figures match arithmetic done longhand from the inputs, so a
 *    change to the data or the code cannot move the numbers the team presents
 *    without this file failing.
 * 3. The model reads the grid connection estimate from regions.json, so the
 *    cost runs and the energy runs cannot drift apart.
 */

import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { loadParams, runEnergy, gasLcoe, withValues, sensitivities, HOURS, LB_PER_METRIC_TON } from '../src/scripts/ironwoodEnergy.js'

const ROOT = resolve(import.meta.dirname, '../..')
const params = loadParams()
const v = (k: string) => params[k].value
const crf = (r: number, n: number) => (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)

describe('energy inputs', () => {
  it('every input is sourced, dated, explained and inside its range', () => {
    for (const [k, p] of Object.entries(params)) {
      expect(p.source_url, k).toMatch(/^https:\/\//)
      expect(p.source_url, k).not.toMatch(/example\.com|placeholder/i)
      expect(p.last_verified, k).toMatch(/^\d{4}(-\d{2})?$/)
      expect(p.method.trim().length, k).toBeGreaterThan(20)
      if (p.low != null)  expect(p.low,  k).toBeLessThanOrEqual(p.value)
      if (p.high != null) expect(p.high, k).toBeGreaterThanOrEqual(p.value)
    }
  })

  it('takes the grid connection estimate from regions.json', () => {
    const regions = JSON.parse(readFileSync(resolve(ROOT, 'data/regions.json'), 'utf8'))
    expect(v('grid_connection_years')).toBe(regions['us-pa-northampton'].grid_interconnection_years.value)
  })
})

describe('energy figures against longhand arithmetic', () => {
  const s = runEnergy(v('phase1_mw'))
  const opt = (id: string) => s.options.find((o) => o.id === id)!
  const mwh = v('phase1_mw') * HOURS * v('load_factor')

  it('sizes annual energy from the peak and the load factor', () => {
    expect(s.annual_mwh).toBeCloseTo(mwh, 3)
  })

  it('prices onsite gas from its parts', () => {
    const r = v('gas_redundancy_factor')
    const capital = (v('gas_capex_usd_per_kw') * r * crf(v('discount_rate'), v('gas_plant_life_years')) + v('gas_fixed_om_usd_per_kw_yr') * r) / (HOURS * v('gas_capacity_factor') / 1000)
    const fuel = v('gas_heat_rate_btu_per_kwh') / 1000 * v('gas_price_usd_per_mmbtu')
    expect(gasLcoe(params)).toBeCloseTo(capital + fuel + v('gas_variable_om_usd_per_mwh'), 6)
    expect(opt('gas').annual_co2_tonnes).toBeCloseTo(mwh * v('gas_heat_rate_btu_per_kwh') / 1000 * v('gas_co2_lb_per_mmbtu') / LB_PER_METRIC_TON, 0)
  })

  it('prices the emergency battery and the capacity it avoids', () => {
    const capex = v('phase1_mw') * v('curtailment_event_hours') * 1000 * v('battery_capex_usd_per_kwh')
    const perYear = capex * crf(v('discount_rate'), v('battery_life_years')) + capex * v('battery_fixed_om_share')
    const saved = v('phase1_mw') * v('flexible_peak_reduction_share') * v('capacity_price_usd_per_mw_day') * 365
    expect(opt('flexible').usd_per_mwh).toBeCloseTo(v('grid_price_usd_per_mwh') + (perYear - saved) / mwh, 6)
    expect(s.capacity_cost_usd_per_year).toBeCloseTo(v('phase1_mw') * v('capacity_price_usd_per_mw_day') * 365, 0)
  })

  it('prices clean contracts as the gap between contract and market price', () => {
    const adder = v('clean_contract_share') * (v('ppa_price_usd_per_mwh') - v('wholesale_energy_usd_per_mwh'))
    expect(opt('clean').usd_per_mwh).toBeCloseTo(v('grid_price_usd_per_mwh') + adder, 6)
    expect(opt('clean').co2_vs_grid_pct).toBeCloseTo(-v('clean_contract_share') * 100, 6)
  })

  it('scales linearly to the full campus', () => {
    const full = runEnergy(v('full_build_mw'))
    const ratio = v('full_build_mw') / v('phase1_mw')
    for (const o of full.options) {
      expect(o.usd_per_mwh).toBeCloseTo(opt(o.id).usd_per_mwh, 6)
      expect(o.annual_cost_usd).toBeCloseTo(opt(o.id).annual_cost_usd * ratio, 0)
    }
  })

  it('only the options carrying the 2035 clean share meet it', () => {
    expect(s.options.filter((o) => o.meets_clean_firm_2035).map((o) => o.id).sort()).toEqual(['clean', 'hybrid'])
  })
})

describe('sensitivities', () => {
  it('moves one input at a time and leaves the base inputs untouched', () => {
    const before = JSON.stringify(params)
    const rows = sensitivities(params)
    expect(rows.length).toBeGreaterThan(5)
    expect(JSON.stringify(params)).toBe(before)
    const gasHigh = rows.find((r) => r.input === 'gas_price_usd_per_mmbtu' && r.to === params.gas_price_usd_per_mmbtu.high)!
    expect(gasHigh.usd_per_mwh).toBeCloseTo(gasLcoe(withValues(params, { gas_price_usd_per_mmbtu: params.gas_price_usd_per_mmbtu.high! })), 6)
  })
})
