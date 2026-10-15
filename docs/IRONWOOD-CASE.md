# Ironwood Case Runs

## Snapshot 3, 15 October 2026

This snapshot confirms three sources and fixes outdated Columbus and Northern Virginia data inside leepr. Snapshots 1 and 2 further down describe earlier states of the data.

| Tax case | Ironwood base | Hybrid | Columbus | Northern Virginia |
|---|---|---|---|---|
| No abatements | $23,392 | $24,442 | $24,137 | $30,604 |
| Columbus abated | $23,392 | $24,442 | $22,123 | $30,604 |
| Each abated | $22,930 | $23,939 | $22,123 | $30,604 |

Each figure is the 20-year cost per kW at a 10% discount rate. The Hybrid column is Ironwood under the chief engineer's design.

- With no abatements, Ironwood costs 3.1% less than Columbus because its property tax runs about $55M a year lower.
- If Columbus receives the 15-year, 100% abatement New Albany gave Microsoft, it costs 5.7% less than Ironwood's base design and 10.5% below the hybrid.
- An extended LERTA at Ironwood still leaves Columbus 3.6% cheaper.
- The hybrid design adds about $340M to the build and about $400M over 20 years, which turns Ironwood's 3.1% lead into a 1.3% gap.

### Changes from Snapshot 2

- Upper Mount Bethel's millage is now 8.5 from the township's website, and the Bangor Area School District figure is 57.4 for 2025-26, so Ironwood's tax rate moves from 1.218% to 1.235% of market value.
- Northampton County withdrew its repeal of the River Pointe LERTA on 21 May 2026, so the abatement stands through the end of 2027.
- WOSU confirms the Microsoft abatement, and Ohio has not changed its law on local property tax abatements. Governor DeWine paused only the state sales tax exemption.
- Six metros, Columbus and Northern Virginia among them, plus the ERCOT site carried hand-entered hazard scores on an outdated scale. They now carry FEMA's county scores.
- Those six metros also now use their state's industrial power price and grid mix. The Columbus figure of 5.9 cents matched Ohio's transportation rate instead of its industrial price of 7.03.
- After those fixes, leepr's stored data and the matched comparison give nearly the same result for Ironwood and Columbus.
- The utility serving the site remains unconfirmed, since Met-Ed lists the township and PPL Electric holds a 2026 easement there.

### Sources

- Township millage: https://www.umbt.org/?page_id=1680
- LERTA repeal withdrawn: WFMZ, 21 May 2026, https://www.wfmz.com/news/area/lehighvalley/northampton-county/northampton-county-extends-protections-for-election-workers/article_37f2d455-0b52-47ab-b2d4-cc559c618036.html
- Microsoft abatement: WOSU, 2 October 2024, https://www.wosu.org/2024-10-02/new-albany-city-council-approves-15-year-tax-break-for-420-million-microsoft-data-center
- Ohio sales tax pause: Statehouse News Bureau, 6 August 2026, https://www.statenews.org/government-politics/2026-08-06/dewine-ohio-data-center-tax-break-is-for-next-governor-to-decide-on
- Industrial power prices: EIA Electric Power Annual, Table 2.10, https://www.eia.gov/electricity/annual/html/epa_02_10.html
- Met-Ed service area: https://www.firstenergycorp.com/content/dam/customer/get-help/files/PASmartMeter/2018-19-ME-Communities%2002-19-19.pdf

Rerun steps are the same as in Snapshot 2.

## Snapshot 2, 15 October 2026

These figures come from the `ironwood-case` branch of leepr. The site is entered as `us-pa-northampton`. This snapshot puts county hazard scores on every site, recomputes Ironwood's network latency from the hub list leepr uses everywhere else, and introduces three property tax cases. Snapshot 1 further down describes the data before those changes, so a different number there belongs to that earlier state.

### Setup

- Phase 1 at 480 MW of total site power, which is 384 MW of equipment load at a design PUE of 1.25.
- Twenty years, matching the anchor customer's power agreement, and a 10% discount rate in line with KGE's investment threshold.
- The hybrid design priced as construction cost times 1.09, following the case's estimate of about 9% above the base plan.
- Power price, grid mix and staff cost from one statewide series for every site, and hazard risk from the FEMA county release of December 2025. The July entries for Columbus and Northern Virginia carry an outdated power price and older hazard scores, so I compared the sites on matched data.

### Results

| Tax case | Ironwood base | Hybrid | Columbus | Northern Virginia |
|---|---|---|---|---|
| No abatements | $23,378 | $24,426 | $24,137 | $30,604 |
| Columbus abated | $23,378 | $24,426 | $22,123 | $30,604 |
| Each abated | $22,922 | $23,930 | $22,123 | $30,604 |

Each figure is the 20-year cost per kW of building and running the campus, discounted at 10%. The Hybrid column is Ironwood under the chief engineer's design. "Columbus abated" gives that site a 100% property tax abatement for 15 years, the terms Ohio granted Microsoft's New Albany data center. "Each abated" also extends Ironwood's LERTA, which at a 10% discount rate is worth about five years of full abatement.

Property tax decides whether Ironwood beats Columbus. With no abatements, Ironwood's base design costs 3.1% less than Columbus because Northampton County taxes about 1.22% of market value against 2.62% in Columbus, a gap of about $56M a year. If the customer receives the Ohio terms, Columbus becomes 5.7% cheaper than Ironwood's base design and 10.4% below the hybrid. An extended LERTA narrows that lead to 3.6%, yet Columbus still comes out ahead. Matching Ohio with a larger tax break would take that money out of the township and school district budgets that residents rely on.

The hybrid design adds about $340M to the build and about $400M to the 20-year cost, roughly 4.5% per kW. With no abatements, that premium turns Ironwood's 3.1% advantage over Columbus into a 1.2% disadvantage.

Power is the largest cost at 4.2 TWh a year, or about $394M at Pennsylvania's 2025 industrial average of 9.36 cents. Every one-cent change in the power price moves the annual cost by about $42M.

leepr carries a grid connection estimate of 4 years for Ironwood (low 2, high 7). The case's 12-month slip limit is small next to that spread, and leepr has no time dimension, so the hybrid design's delay of up to 14 months is outside these figures.

I would quote cost per kW instead of leepr's weighted rank for this comparison. The rank scales every factor between the best and worst of the locations in the run, so with three sites a small gap becomes a full point. For example, Columbus scores zero on renewables at 2.5% against 3.1% at Ironwood, which is why the rank keeps the Pennsylvania site first even in the cases where Ohio costs less.

On leepr's stored entries, Columbus comes out 8.8% cheaper than Ironwood's base design due to its older 5.9 cent power price. The stored hazard scores for Columbus (2.8) and Northern Virginia (2.0) also come from an older source, while leepr's ingest is written to produce the county figures (9.81 and 7.81), so I would use the matched results above.

### Changes from Snapshot 1

- Ironwood's hazard score is now 9.0, from Northampton County's FEMA National Risk Index rating of 90.0, instead of blank.
- Ironwood's latency is now 5.2 ms to Equinix Ashburn, the nearest hub in leepr's list. Snapshot 1 used 2.2 ms to the New York and New Jersey exchanges, which leepr's list does not carry, so its point about Ironwood's closeness to those hubs no longer holds.
- The matched comparison now uses county hazard scores for every site instead of state averages, which big cities dominate.
- The three tax cases are new, and the hybrid design now carries a cost range instead of one point.

### Limits

- These are total campus costs for whoever owns the data center. KGE's return depends on its power and infrastructure contracts, which leepr does not model.
- leepr does not price who pays for grid upgrades or how those costs could reach household bills.
- Turner & Townsend lists no Pennsylvania market, so the build cost uses Columbus as a proxy. The range runs from $8,360 to $12,900 per kW.
- One run of leepr tops out at 500 MW of equipment load. Every per-kW figure scales with size, so these figures hold for the full 2,000 MW campus as well.
- The case's 12% IRR and 10% threshold stay as the case gives them.

### Sources

- Hazard risk: FEMA National Risk Index counties, December 2025 release, https://services.arcgis.com/XG15cJAlne2vxtgt/arcgis/rest/services/National_Risk_Index_Counties/FeatureServer
- Ohio abatement: Axios Columbus, 17 October 2024, https://www.axios.com/local/columbus/2024/10/17/data-centers-ohio-microsoft-amazon-google
- The remaining sources are listed under Snapshot 1, and each figure's derivation is in the `us-pa-northampton` entry of `data/regions.json`.

### Rerun

From the `backend` folder, run `npx tsx src/scripts/ironwoodCase.ts`. The full results land in `backend/case-output/`, and `summary.json` there holds every figure above. Running `npx vitest run tests/ironwoodCase.test.ts` checks the Ironwood numbers against longhand arithmetic.

## Snapshot 1, 15 October 2026

These figures come from the `ironwood-case` branch of leepr. The site is entered as `us-pa-northampton` and compared against Columbus, OH and Northern Virginia. A different number in a later snapshot reflects newer inputs rather than a correction to this one.

### Setup

- Phase 1 at 480 MW of total site power, which is 384 MW of equipment load at a design PUE of 1.25.
- Twenty years, matching the anchor customer's power agreement.
- A 10% discount rate, in line with KGE's investment threshold.
- The hybrid design priced as construction cost times 1.09, following the case's estimate of about 9% above the base plan.

### Results

I compared the three sites on the same statewide series for power price, grid mix, hazard risk and staff cost. The Columbus and Northern Virginia entries in leepr were collected in July from older sources. For example, the Ohio entry carries a 5.9 cent power price against the state's 2025 industrial average of 8.52 cents, so the matched run gives the fairer comparison.

| Site | Cost per kW | Build | Running | Rank |
|---|---|---|---|---|
| Ironwood, base design | $23,378 | $3.79B | $610M a year | 1 |
| Ironwood, hybrid design | $24,426 | $4.13B | $617M a year | 1 |
| Columbus, OH | $24,137 | $3.88B | $633M a year | 2 |
| Northern Virginia | $30,604 | $6.22B | $650M a year | 3 |

Cost per kW is the 20-year total of building and running the campus, discounted at 10% and divided by equipment load. Each Ironwood design was run separately against the same two competitors.

Under the base design, Ironwood costs about 3% less than Columbus over 20 years. Most of that gap comes from property tax because Northampton County charges about 1.22% of market value while the Columbus rate is 2.62%, a difference worth about $56M a year on a campus of this size. As a result, Ironwood keeps first place unless its build cost climbs about 20% or its power price rises about 27%.

The hybrid design adds about $340M to the build and about $400M to the 20-year cost. That premium moves Ironwood from 3% cheaper than Columbus to about 1% more expensive. Ironwood still ranks first on the weighted score because it is close to the New York and New Jersey interconnection hubs and carries a higher renewable share, yet a customer comparing cost alone would find Columbus slightly lower. The hybrid design also leaves less margin, since the order flips if Ironwood's build cost climbs another 10% or its power price rises 15%.

Power is the largest cost at 4.2 TWh a year, or about $394M at Pennsylvania's 2025 industrial average of 9.36 cents. Every one-cent change in the power price moves the annual cost by about $42M.

leepr now carries a grid connection estimate of 4 years for Ironwood (low 2, high 7), drawn from JLL's 2026 national average and the Dominion figure for Northern Virginia. The case's 12-month slip limit is small next to that spread. leepr has no time dimension, so the hybrid design's delay of up to 14 months is outside these figures.

On leepr's stored entries, Columbus comes out cheapest at $21,492 per kW against $23,378 for Ironwood due to the older 5.9 cent power price. Ironwood leads that version only because its hazard risk score is blank, so I would use it for cost alone.

### Limits

- These are total campus costs for whoever owns the data center. KGE's return depends on its power and infrastructure contracts, which leepr does not model.
- leepr does not price who pays for grid upgrades or how those costs could reach household bills.
- Turner & Townsend lists no Pennsylvania market, so the build cost uses Columbus as a proxy. The range runs from $8,360 to $12,900 per kW.
- The case's 12% IRR and 10% threshold stay as the case gives them.

### Sources

- Power price: EIA retail sales API, Pennsylvania industrial, https://api.eia.gov/v2/electricity/retail-sales/data/
- Property tax: Northampton County Bill 897-2025, https://www.norcopa.gov/corecode/uploads/document6/uploaded_pdfs/corecode/Bill897-2025%20-%202026%20Real%20Estate%20Tax%20Millage%20Rate_2316.pdf
- Common level ratio factor 6.21 for 2026-27, https://www.lebanoncountypa.gov/getmedia/a05484bf-da82-405a-931e-c3b9b48b4010/26-27-Common-Level-Ratio-(CLR)-Real-Estate-Valuation-Factors.pdf
- Land: LandSearch Northampton County industrial listings, https://www.landsearch.com/industrial/northampton-county-pa
- Build cost: Turner & Townsend Data Centre Construction Cost Index 2025-2026, https://reports.turnerandtownsend.com/data-centre-construction-cost-index-2025/data-centre-cost-trends
- Water: Pennsylvania-American Water tariff Supplement 70, https://www.puc.pa.gov/pcdocs/1943572.pdf
- Grid timing: Electrical Contractor, 17 August 2026, https://www.ecmag.com/magazine/articles/article-detail/how-long-does-it-take-to-power-a-data-center
- Data center incentives: PA Department of Revenue program guidelines, https://www.pa.gov/agencies/revenue/business-tax-credits-and-economic-development-programs/business-tax-credits-and-incentives/computer-data-center-equipment-program

Every figure's full derivation is in the `us-pa-northampton` entry of `data/regions.json`.
