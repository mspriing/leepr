# Ironwood Energy Options

## Snapshot 1, 19 October 2026

These figures come from `backend/src/scripts/ironwoodEnergy.ts` on the `ironwood-case` branch, using the inputs in `data/cases/ironwood-energy.json`. A different number in a later snapshot reflects newer inputs rather than a correction to this one.

### Phase 1 (480 MW)

| Option | Per MWh | Per year | CO2 per year | Years to power | 2035 clean step |
|---|---|---|---|---|---|
| Grid only | $93.6 | $394M | 1.14M t | 4 | No |
| Onsite gas engines | $67.1 | $282M | 1.85M t | 2.5 | No |
| Grid + clean contracts | $103.3 | $434M | 0.77M t | 4 | Yes |
| Grid + emergency battery | $103.9 | $437M | 1.14M t | 3 | No |
| Hybrid | $113.6 | $478M | 0.77M t | 3 | Yes |

The per-MWh figures hold for the full 2,000 MW campus, and the yearly totals scale by about 4.2.

### Findings

- Phase 1 alone equals 7% of the capacity PJM fell short on in its 2028/29 auction, and the full campus would match 29%.
- At PJM's current auction price, phase 1 carries a capacity charge of about $57M a year.
- PJM's market monitor attributes $29.4B, or 46%, of capacity charges across the last four auctions to data center load, which is the cost residents and the 600-person manufacturer are worried about.
- Onsite gas is the cheapest option only when the plant buys gas near the Henry Hub price. At the price Pennsylvania industrial users paid in 2024, gas rises to $112 per MWh, above the grid.
- Onsite gas emits 62% more CO2 than the grid average, although 18% less than the plants that ramp up to serve new load.
- A 4-hour battery lets the campus drop off the grid in an emergency while its servers keep running. That arrangement gives the customer continuous power while letting the grid cut load at the same time.
- A 2-hour battery covers the average emergency of 1.7 to 2.1 hours that Duke University found, and with it the flexible option costs $92.0 per MWh, slightly below grid only.
- Clean contracts sized to the state's 32% firm share cut CO2 by 32% and add about $10 per MWh.
- The hybrid costs about 21% more per MWh than grid only, yet it alone meets the 2035 clean step, leaves PJM's system during emergencies and could connect sooner.
- Pennsylvania's GRID Standards require 420 GWh of clean firm energy for phase 1 in 2027, rising to 1,346 GWh by 2035.

### Limits

- Onsite gas is priced as a reciprocating engine plant from EIA's 2019 cost figures. Market quotes run higher, and the high case at $2,400 per kW puts gas at $76 per MWh.
- The one-year head start for a flexible campus is an assumption because PJM has not published how much sooner such a load connects.
- Clean contracts use the PJM solar price as a benchmark, since no public index prices firm carbon-free power such as nuclear.
- The campus is assumed to draw its full peak in every hour, the same convention the cost runs use.

### Sources

- Capacity prices and the 2028/29 shortfall: PJM Base Residual Auction report, https://www.pjm.com/-/media/DotCom/markets-ops/rpm/rpm-auction-info/2028-2029/2028-2029-bra-results-report.pdf
- Data center share of capacity charges: PJM Independent Market Monitor, 27 July 2026, https://www.pjm.com/-/media/DotCom/committees-groups/committees/mc/2026/20260727-web/item-02---marketing-monitoring-report---presentation.pdf
- Wholesale power price: 2025 State of the Market report, https://www.pjm.com/-/media/DotCom/committees-groups/committees/mc/2026/20260424-special/2025-annual-state-of-the-market-report-for-pjm.pdf
- Grid emissions: EPA eGRID2023, RFC East, https://www.epa.gov/system/files/documents/2025-06/summary_tables_rev2.pdf
- Load flexibility: Duke University, Rethinking Load Growth, via POWER, https://www.powermag.com/duke-researchers-grid-flexibility-key-to-accommodate-load-growth
- PJM large load rules: Board letter, 16 January 2026, https://www.pjm.com/-/media/DotCom/about-pjm/who-we-are/public-disclosures/2026/20260116-pjm-board-letter-re-results-of-the-cifp-process-large-load-additions.pdf
- Clean firm steps: PA GRID Standards, https://dced.pa.gov/business-assistance/data-center-resources/grid-standards/
- Gas engine costs: EIA capital cost report, https://www.eia.gov/analysis/studies/powerplants/capitalcost/pdf/capital_cost_AEO2020.pdf
- Gas price: EIA Short-Term Energy Outlook, https://www.eia.gov/outlooks/steo/report/natgas.php
- Gas engine timing: Power Engineering, 16 April 2026, https://www.power-eng.com/gas/data-center-power-crunch-lifts-engines-aeroderivatives-into-larger-role/
- Battery cost: NREL 2025 battery cost update, https://docs.nrel.gov/docs/fy25osti/93281.pdf
- Clean contract price: LevelTen via pv magazine USA, https://pv-magazine-usa.com/2026/01/30/uncertainty-looms-as-solar-ppa-prices-climb-for-second-straight-quarter/
- Every input's full derivation is in `data/cases/ironwood-energy.json`.

### Rerun

From the `backend` folder, run `npx tsx src/scripts/ironwoodEnergy.ts`. Running `npx vitest run tests/ironwoodEnergy.test.ts` checks every figure against longhand arithmetic.
