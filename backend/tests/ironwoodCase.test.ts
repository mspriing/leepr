/**
 * backend/tests/ironwoodCase.test.ts
 *
 * Guards on the Ironwood case site (us-pa-northampton) and the script that
 * prices it for the Business with Integrity case competition.
 *
 * 1. The region is complete and honest: every figure the engine needs is
 *    present, nothing points at a placeholder, and every modeled figure says
 *    how it was worked out.
 * 2. It stays off the website. It is marked case_only, and the coverage counts
 *    the site publishes must keep matching the regions the site draws.
 * 3. The engine's Ironwood figures match arithmetic done longhand from the
 *    dataset, so a later change to the data or the engine cannot move the
 *    numbers the team presents without this file failing.
 * 4. The scenario switches do what the script says they do.
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { runEngine, COST_DRIVERS } from '../src/engine/index.js'
import { _resetRegionsCache, loadRegions } from '../src/regions.js'
import { MAINTENANCE_RATE, BASE_STAFF_COST_PER_KW, BASE_CONNECTIVITY_PER_KW, ACRES_PER_MW } from '../src/engine/assumptions.js'
import {
  caseInput, hybridBuildPerKw, CAPACITY_KW, DESIGN_PUE, HYBRID_FACTOR,
  OHIO_ABATEMENT_YEARS, LERTA_EQUIVALENT_YEARS,
} from '../src/scripts/ironwoodCase.js'

const ROOT = resolve(import.meta.dirname, '../..')
const raw = JSON.parse(readFileSync(resolve(ROOT, 'data/regions.json'), 'utf8'))
const KEY = 'us-pa-northampton'

beforeEach(() => _resetRegionsCache())

describe('the Ironwood region', () => {
  it('validates and can be priced', () => {
    const region = loadRegions()[KEY]
    expect(region).toBeDefined()
    expect(region.precision).toBe('metro')
    expect(region.parent_state).toBe('us-pa')
    for (const d of COST_DRIVERS) expect(region[d].value, d).not.toBeNull()
  })

  it('carries a source on every figure and a method on every modeled one', () => {
    for (const [name, cell] of Object.entries(raw[KEY] as Record<string, any>)) {
      if (!cell || typeof cell !== 'object' || !('basis' in cell)) continue
      expect(cell.source_url, name).not.toMatch(/example\.com|placeholder/i)
      if (cell.basis === 'modeled') expect(cell.method?.trim(), name).toBeTruthy()
      if (cell.value !== null && cell.low != null) expect(cell.low, name).toBeLessThanOrEqual(cell.value)
      if (cell.value !== null && cell.high != null) expect(cell.high, name).toBeGreaterThanOrEqual(cell.value)
    }
  })

  it('has no empty driver the ranker would silently drop', () => {
    const empty = Object.entries(raw[KEY] as Record<string, any>)
      .filter(([, c]) => c && typeof c === 'object' && 'basis' in c && c.value === null)
      .map(([n]) => n)
    expect(empty).toEqual([])
  })
})

describe('keeping the case site off the website', () => {
  it('is marked case_only', () => {
    expect(raw[KEY].case_only).toBe(true)
  })

  it('leaves the published coverage counts matching the regions the site shows', () => {
    const coverage = readFileSync(resolve(ROOT, 'frontend/src/data/coverage.ts'), 'utf8')
    const published = Number(coverage.match(/"regions":\s*(\d+)/)?.[1])
    const shown = Object.values(raw as Record<string, any>).filter((r) => r.case_only !== true).length
    expect(published).toBe(shown)
  })

  it('is not in the map data', () => {
    const geo = JSON.parse(readFileSync(resolve(ROOT, 'frontend/data/us-geo.json'), 'utf8'))
    expect(geo[KEY]).toBeUndefined()
  })
})

describe('Ironwood figures against longhand arithmetic', () => {
  const r = raw[KEY]
  const v = (name: string) => r[name].value as number

  it('prices the base design as the dataset says', async () => {
    const out = await runEngine(caseInput('stored', 'base', 'none'), { forceFallback: true, skipCache: true })
    const site = out.sites.ironwood
    expect(out.unevaluable.map((u) => u.site_id)).not.toContain('ironwood')

    const acres = (CAPACITY_KW / 1000) * ACRES_PER_MW
    const build = acres * v('land_cost_per_acre_usd') + CAPACITY_KW * v('construction_cost_per_kw')
    const power = CAPACITY_KW * DESIGN_PUE * 8760 * v('power_rate_usd_per_kwh')
    const staff = CAPACITY_KW * BASE_STAFF_COST_PER_KW * v('staff_cost_index')
    const tax   = build * v('tax_rate')
    const water = (CAPACITY_KW * (DESIGN_PUE - 1) * 8760 * 0.4 / 3785.4) * v('water_rate_usd_per_kgal')
    const running = power + staff + tax + water + build * MAINTENANCE_RATE + CAPACITY_KW * BASE_CONNECTIVITY_PER_KW

    expect(site.capex.total_usd).toBeCloseTo(build, -1)
    expect(site.opex_annual.power_usd).toBeCloseTo(power, -1)
    expect(site.opex_annual.taxes_usd).toBeCloseTo(tax, -1)
    expect(site.opex_annual.total_usd).toBeCloseTo(running, -1)

    // Twenty years at 10%, no abatement, so the running cost is a flat annuity.
    const annuity = (1 - Math.pow(1.1, -20)) / 0.1
    expect(site.finance.lifetime_cost_per_kw).toBeCloseTo((build + running * annuity) / CAPACITY_KW, 0)
  })

  it('prices the hybrid design at construction times 1.09', async () => {
    expect(hybridBuildPerKw()).toBe(Math.round(v('construction_cost_per_kw') * HYBRID_FACTOR))
    const out = await runEngine(caseInput('stored', 'hybrid', 'none'), { forceFallback: true, skipCache: true })
    expect(out.sites.ironwood.capex.construction_usd).toBeCloseTo(CAPACITY_KW * hybridBuildPerKw(), -1)
  })
})

describe('scenario switches', () => {
  const r = raw[KEY]

  it('matched view reads statewide series from the dataset, not from constants', async () => {
    const input = caseInput('matched', 'base', 'none')
    const columbus = input.sites.find((s) => s.site_id === 'columbus')!
    expect(columbus.overrides?.power_rate_usd_per_kwh).toBe(raw['us-oh'].power_rate_usd_per_kwh.value)
    expect(columbus.overrides?.staff_cost_index).toBe(raw['us-oh'].staff_cost_index.value)
    const ironwood = input.sites.find((s) => s.site_id === 'ironwood')!
    expect(ironwood.overrides?.risk_score).toBe(r.risk_score.value)
  })

  it('ohio tax case removes Columbus property tax only, both adds the LERTA years', async () => {
    const ohio = caseInput('matched', 'base', 'ohio')
    expect(ohio.sites.find((s) => s.site_id === 'columbus')!.overrides?.tax_abatement_years).toBe(OHIO_ABATEMENT_YEARS)
    expect(ohio.sites.find((s) => s.site_id === 'ironwood')!.overrides?.tax_abatement_years).toBeUndefined()
    const both = caseInput('matched', 'base', 'both')
    expect(both.sites.find((s) => s.site_id === 'ironwood')!.overrides?.tax_abatement_years).toBe(LERTA_EQUIVALENT_YEARS)
    expect(LERTA_EQUIVALENT_YEARS).toBeLessThanOrEqual(r.tax_abatement_years.high)

    const out = await runEngine(ohio, { forceFallback: true, skipCache: true })
    expect(out.sites.columbus.opex_annual.taxes_usd).toBe(0)
    expect(out.sites.ironwood.opex_annual.taxes_usd).toBeGreaterThan(0)
  })
})
