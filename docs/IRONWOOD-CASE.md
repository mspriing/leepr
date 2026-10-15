# Ironwood Case Runs

Snapshot, 15 October 2026. These figures come from the `ironwood-case` branch of leepr. The site is entered as `us-pa-northampton` and compared against Columbus, OH and Northern Virginia. A different number in a later snapshot reflects newer inputs rather than a correction to this one.

## Setup

- Phase 1 at 480 MW of total site power, which is 384 MW of equipment load at a design PUE of 1.25.
- Twenty years, matching the anchor customer's power agreement.
- A 10% discount rate, in line with KGE's investment threshold.
- The hybrid design priced as construction cost times 1.09, following the case's estimate of about 9% above the base plan.

## Results

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

## Limits

- These are total campus costs for whoever owns the data center. KGE's return depends on its power and infrastructure contracts, which leepr does not model.
- leepr does not price who pays for grid upgrades or how those costs could reach household bills.
- Turner & Townsend lists no Pennsylvania market, so the build cost uses Columbus as a proxy. The range runs from $8,360 to $12,900 per kW.
- The case's 12% IRR and 10% threshold stay as the case gives them.

## Sources

- Power price: EIA retail sales API, Pennsylvania industrial, https://api.eia.gov/v2/electricity/retail-sales/data/
- Property tax: Northampton County Bill 897-2025, https://www.norcopa.gov/corecode/uploads/document6/uploaded_pdfs/corecode/Bill897-2025%20-%202026%20Real%20Estate%20Tax%20Millage%20Rate_2316.pdf
- Common level ratio factor 6.21 for 2026-27, https://www.lebanoncountypa.gov/getmedia/a05484bf-da82-405a-931e-c3b9b48b4010/26-27-Common-Level-Ratio-(CLR)-Real-Estate-Valuation-Factors.pdf
- Land: LandSearch Northampton County industrial listings, https://www.landsearch.com/industrial/northampton-county-pa
- Build cost: Turner & Townsend Data Centre Construction Cost Index 2025-2026, https://reports.turnerandtownsend.com/data-centre-construction-cost-index-2025/data-centre-cost-trends
- Water: Pennsylvania-American Water tariff Supplement 70, https://www.puc.pa.gov/pcdocs/1943572.pdf
- Grid timing: Electrical Contractor, 17 August 2026, https://www.ecmag.com/magazine/articles/article-detail/how-long-does-it-take-to-power-a-data-center
- Data center incentives: PA Department of Revenue program guidelines, https://www.pa.gov/agencies/revenue/business-tax-credits-and-economic-development-programs/business-tax-credits-and-incentives/computer-data-center-equipment-program

Every figure's full derivation is in the `us-pa-northampton` entry of `data/regions.json`.

## Rerun

From the `backend` folder, run `npx tsx src/scripts/ironwoodCase.ts`. The full results land in `backend/case-output/`.
