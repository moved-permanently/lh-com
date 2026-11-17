# lufthansa.com's token-free switch, measured again on today's main (standing order 55 item 1)

ema-adobe, 2026-11-17/18. Supersedes the measurements of [lufthansa-switch-plan-558.md](lufthansa-switch-plan-558.md)
(10/11 Nov). Nothing is switched on main: `THEMES.lufthansa` has no `live` there.

## 1. The branch

`token-free-lufthansa-live` is rebuilt from today's main (192f617): the one line `live: true` in
`scripts/style-markers.js` (THEMES.lufthansa) and every import bundle rebuilt (14; all of them changed against main,
B5: main's bundles were behind their sources). Pushed as 6c838dd (it replaced f2139516, 1,650 commits behind); never
merged. Branch lint exit 0.

## 2. How it was measured

- **Documents.** The 378 recorded lufthansa.com pages on this machine (lh-parity-002a-d, -003, -004a/b, -015), read
  from our host as `.plain.html`: 374 answer 200, 335 carry markers today. Each with a Metadata block holding the
  page's Theme (from its head), collapsed with the branch's `marker-collapse-cli.mjs --brand lufthansa --force`:
  335 changed, 3,621 markers (1,111 theme, 2,510 carriers), 1 left, 0 not idempotent, 0 errors. The collapsed
  Metadata rows (Theme flow-spacing and the like) go into the page head (logs/b655/capture-dm.cjs, capture-d with
  LOCAL_ROOT and logs/b596's .meta.json step).
- **Sample.** 81 of the 335 pages, both widths (162 page-widths): the 10 Nov plan's 8 pages, the 36 hub and campaign
  pages with column marks (logs/b582/b1-pages.txt), 40 more at random (seed 55). One capture pair per page-width takes
  about a minute; all 670 page-widths did not fit the order.
- **Sides.** Today: the published document as `<main>` with the deployed code. Switched: the collapsed document with
  the branch's code (served from the worktree). M at 40: the same with `SPACE.m` 40 instead of 60 (a copy of the
  branch's code, measurement only). Every host but ours and aem refused; geo.css on both sides; the first 8,000 px
  against the newest recording (tools/parity/compare.js).
- **Control.** overview-special-request, travel-classes, reiseklassen and the other documents whose markers are
  theme-only read the same to the decimal (baggage 1.70 today as in the 10 Nov plan).

## 3. Result

162 page-widths (sum of % off www; median):

| | today | switched, M 60 | switched, M 40 |
| --- | --- | --- | --- |
| sum | 1,137.0 | 1,500.9 | (152 with both) 1,090.9 / 1,422.2 / 1,382.6 |
| median | 5.17 | 6.58 | 6.33 |
| worse than today by more than 0.5 | | 92 | 83 |

Verdicts (table below): 70 not worse; 5 brought back by M at 40 alone (B2); 15 B2 in part, then a rest; 72 not B2.
12 page-widths read worse with M at 40 than at 60 (stopover, gepaeck 1440 and others: www's separators there are 60).

**The switch is not ready.** The gaps beyond B2, worst first:
- **Headings drawn full width** (the collapse drops `{limited-width}`, plan 558 §6 D): miles-and-more (gb/en, de/en
  1440 2.3 -> 18.6; de/de, at/de 2.3 -> 12.6): its H2s 834 px wide on www and today, 1,264 switched, a line shorter
  each; together with the carrier view's 32 px padding and the carousel section in h3-large. A trial without the
  carrier view's padding on campaign views (logs/b655/t1.css) took it to 29.9: the padding is right, the width is not.
  Limited-width H2s are 85 of 1,633 H2s on the 335 pages (22 of 399 on campaign pages), so the width is no theme
  default; it needs a carrier (a section style or block option for two-thirds headings), which the collapse does not
  write yet.
- **The card H2s marked heading-small** (B3): airport-information 390 5.6 -> 15.7 (M 40 15.0): its "Berlin / Dusseldorf
  / Vienna / Zurich Airport" card H2s; card H2s in Cards Teaser are unmarked in 161 of 178, so no default; a carrier
  again.
- **The column view carrier on hub pages** (B1): digital-self-services x4 2.9 -> 7.4 (1440) and 5.6 -> 10.0 (390); with
  M at 40 5.8 / 9.1. The view's opening separator section (61 px, a divider in M) and the view sections 16 px lower;
  the B1 code of order 582 (0346b0c, d085603) is on main; what is left is B2 and the views' last section (+41).
- **Legal and receipt pages**: terms-of-service-group (390 4.8 -> 14.9, 1440 4.5 -> 13.7), business-terms-and-conditions,
  pax-receipt (6.5 -> 11.7): their info-page column marks (plan 558 §6: info pages need carrier rules of their own).
- **Campaign and fleet pages**: first-class (390 16.7 -> 26.4), allegris-premium-economy-san-diego at/de (3.5 -> 15.9),
  100-years/crane 1440 (7.8 -> 18.8), flight-search (7.1 -> 15.1), my-bookings 1440 (1.2 -> 6.3): per page (B4).

No carrier rule is pushed to the branch tonight: none of the candidates closes its pages without a carrier the collapse
does not yet write (two-thirds headings, compact card titles), and the order's gate (every recorded page-width with
markers, none worse by more than 0.5) is far from met.

## 4. B2: M at 60 against M at 40 (Ben's decision 3; nothing changed)

Per page-width where the separators matter (switched with M at 60 vs M at 40, against today):

| Page-width | today | M 60 | M 40 | M 40 against M 60 |
| --- | --- | --- | --- | --- |
| /gb/en/food-and-beverages 390 | 6.71 | 21.97 | 5.27 | -16.70 |
| /gb/en/food-and-beverages 1440 | 2.19 | 17.34 | 4.23 | -13.11 |
| /gb/en/baggage 1440 | 1.70 | 11.96 | 1.97 | -9.99 |
| /gb/en/airport-information 390 | 5.64 | 15.69 | 14.99 | -0.70 |
| /de/en/terms-of-service-group 1440 | 4.54 | 13.66 | 18.90 | +5.24 |
| /gb/en/baggage 390 | 5.01 | 13.80 | 6.14 | -7.66 |
| /de/de/gepaeck 390 | 4.84 | 13.09 | 6.20 | -6.89 |
| /de/en/first-class 1440 | 8.83 | 15.84 | 13.30 | -2.54 |
| /at/de/flughafeninformation 1440 | 3.07 | 8.51 | 7.37 | -1.14 |
| /de/en/my-bookings 1440 | 1.20 | 6.34 | 5.18 | -1.16 |
| /de/en/digital-self-services 1440 | 3.46 | 8.13 | 6.70 | -1.43 |
| /de/de/digital-self-services 390 | 5.57 | 10.05 | 9.13 | -0.92 |
| /at/de/digital-self-services 390 | 5.57 | 10.05 | 9.13 | -0.92 |
| /de/en/digital-self-services 390 | 5.54 | 9.98 | 9.04 | -0.94 |
| /gb/en/digital-self-services 1440 | 2.90 | 7.34 | 5.82 | -1.52 |
| /de/de/digital-self-services 1440 | 2.93 | 7.37 | 5.85 | -1.52 |
| /at/de/digital-self-services 1440 | 2.93 | 7.37 | 5.85 | -1.52 |
| /gb/en/digital-self-services 390 | 5.55 | 9.98 | 9.05 | -0.93 |
| /de/en/prepare-for-your-trip/baggage/sport-baggage/register-sports-baggage/confirmation 1440 | 2.08 | 6.34 | 8.90 | +2.56 |
| /de/en/book-and-manage/stopover 1440 | 11.82 | 15.27 | 28.14 | +12.87 |
| /de/en/book-and-manage/stopover 390 | 14.00 | 16.75 | 19.68 | +2.93 |
| /de/de/gepaeck 1440 | 3.37 | 5.50 | 7.89 | +2.39 |
| /de/en/boeing787 390 | 7.44 | 9.39 | 7.69 | -1.70 |
| /de/en/boeing787 1440 | 5.42 | 7.19 | 4.70 | -2.49 |
| /de/en/lufthansa-express-bus 1440 | 4.12 | 5.73 | 5.02 | -0.71 |
| /de/en/my-bookings 390 | 8.21 | 9.53 | 8.18 | -1.35 |
| /de/en/tips-senior-travellers 1440 | 6.30 | 7.54 | 10.26 | +2.72 |
| /de/en/prepare-for-your-trip/baggage/sport-baggage/register-sports-baggage/confirmation 390 | 5.06 | 6.16 | 8.27 | +2.11 |
| /de/en/passenger-rights 1440 | 3.07 | 3.50 | 4.37 | +0.87 |
| /de/en/flights 390 | 44.84 | 44.87 | 45.52 | +0.65 |
| /gb/en/airport-information 1440 | 3.84 | 3.81 | 4.97 | +1.16 |
| /de/en/passenger-rights 390 | 6.09 | 5.34 | 6.57 | +1.23 |
| /de/en/common/accessibility-statement 1440 | 6.73 | 5.95 | 5.37 | -0.58 |
| /de/en/tips-senior-travellers 390 | 12.20 | 11.17 | 12.66 | +1.49 |

## 5. All 162 page-widths

| Page-width | today | switched M 60 | switched M 40 | heights today / M 60 | verdict |
| --- | --- | --- | --- | --- | --- |
| /gb/en/miles-and-more 1440 | 2.33 | 18.58 | 18.58 | 3410 / 3313 | not B2 |
| /de/en/miles-and-more 1440 | 2.42 | 18.63 | 18.63 | 3410 / 3313 | not B2 |
| /gb/en/food-and-beverages 390 | 6.71 | 21.97 | 5.27 | 6742 / 6792 | B2 alone (M at 40 brings it back) |
| /gb/en/food-and-beverages 1440 | 2.19 | 17.34 | 4.23 | 5087 / 5137 | B2 in part, then the rest |
| /at/de/articles/highlights/allegris-premium-economy-san-diego 1440 | 3.53 | 15.92 | 15.92 | 6965 / 7029 | not B2 |
| /de/en/100-years/crane 1440 | 7.79 | 18.82 | 18.82 | 9782 / 9575 | not B2 |
| /gb/en/baggage 1440 | 1.7 | 11.96 | 1.97 | 4627 / 4707 | B2 alone (M at 40 brings it back) |
| /de/de/miles-and-more 1440 | 2.34 | 12.6 | 12.6 | 3491 / 3394 | not B2 |
| /at/de/miles-and-more 1440 | 2.34 | 12.6 | 12.6 | 3491 / 3394 | not B2 |
| /de/en/terms-of-service-group 390 | 4.75 | 14.94 | 14.94 | 3981 / 3799 | not B2 |
| /gb/en/airport-information 390 | 5.64 | 15.69 | 14.99 | 5480 / 5512 | B2 in part, then the rest |
| /de/en/first-class 390 | 16.73 | 26.35 | 26.35 | 23860 / 25070 | not B2 |
| /de/en/terms-of-service-group 1440 | 4.54 | 13.66 | 18.9 | 2221 / 2117 | not B2 |
| /gb/en/baggage 390 | 5.01 | 13.8 | 6.14 | 7340 / 7416 | B2 in part, then the rest |
| /at/de/articles/highlights/allegris-premium-economy-san-diego 390 | 5.55 | 14.3 | 14.3 | 7871 / 7921 | not B2 |
| /de/de/gepaeck 390 | 4.84 | 13.09 | 6.2 | 7521 / 7563 | B2 in part, then the rest |
| /de/en/flight-search 390 | 7.05 | 15.05 | 15.05 | 3411 / 3442 | not B2 |
| /de/en/first-class 1440 | 8.83 | 15.84 | 13.3 | 21195 / 21597 | B2 in part, then the rest |
| /de/en/flight-search 1440 | 4.62 | 11.14 | 11.14 | 2071 / 2053 | not B2 |
| /at/de/flughafeninformation 1440 | 3.07 | 8.51 | 7.37 | 3282 / 3300 | B2 in part, then the rest |
| /de/en/book-and-manage/pax-receipt 390 | 6.5 | 11.7 | 11.7 | 2492 / 2555 | not B2 |
| /de/en/my-bookings 1440 | 1.2 | 6.34 | 5.18 | 3647 / 3667 | B2 in part, then the rest |
| /de/en/digital-self-services 1440 | 3.46 | 8.13 | 6.7 | 4463 / 4512 | B2 in part, then the rest |
| /de/de/digital-self-services 390 | 5.57 | 10.05 | 9.13 | 5645 / 5712 | B2 in part, then the rest |
| /at/de/digital-self-services 390 | 5.57 | 10.05 | 9.13 | 5645 / 5712 | B2 in part, then the rest |
| /de/en/digital-self-services 390 | 5.54 | 9.98 | 9.04 | 5483 / 5550 | B2 in part, then the rest |
| /gb/en/digital-self-services 1440 | 2.9 | 7.34 | 5.82 | 4463 / 4512 | B2 in part, then the rest |
| /de/de/digital-self-services 1440 | 2.93 | 7.37 | 5.85 | 4541 / 4589 | B2 in part, then the rest |
| /at/de/digital-self-services 1440 | 2.93 | 7.37 | 5.85 | 4541 / 4589 | B2 in part, then the rest |
| /gb/en/digital-self-services 390 | 5.55 | 9.98 | 9.05 | 5483 / 5550 | B2 in part, then the rest |
| /de/en/first-class-valet-parking-service 1440 | 2.15 | 6.53 | 6.53 | 1731 / 1763 | not B2 |
| /de/en/menus-travel-classes 1440 | 1.58 | 5.87 | 5.87 | 2250 / 2298 | not B2 |
| /de/en/prepare-for-your-trip/baggage/sport-baggage/register-sports-baggage/confirmation 1440 | 2.08 | 6.34 | 8.9 | 1465 / 1431 | not B2 |
| /de/en/book-and-manage/flights/ana 390 | 8.35 | 12.35 | 12.35 | 5138 / 5080 | not B2 |
| /de/en/lufthansa-aviation-group 1440 | 5.38 | 9.37 | 9.37 | 2751 / 2799 | not B2 |
| /at/de/miles-and-more 390 | 5.03 | 9.01 | 9.01 | 4516 / 4465 | not B2 |
| /de/de/miles-and-more 390 | 5.04 | 9.01 | 9.01 | 4516 / 4465 | not B2 |
| /de/en/book-and-manage/pax-receipt 1440 | 4.86 | 8.81 | 8.81 | 2113 / 2153 | not B2 |
| /de/en/business-terms-and-conditions 1440 | 2.32 | 6.0 | 6.0 | 1789 / 1811 | not B2 |
| /at/de/flughafeninformation 390 | 24.76 | 28.31 | 27.82 | 5942 / 5975 | not B2 |
| /de/en/business-terms-and-conditions 390 | 4.68 | 8.15 | 8.15 | 2902 / 2924 | not B2 |
| /de/en/book-and-manage/stopover 1440 | 11.82 | 15.27 | 28.14 | 13090 / 13322 | not B2 |
| /de/en/first-class-comfort 1440 | 4.84 | 8.18 | 8.18 | 2793 / 2841 | not B2 |
| /de/en/upgrade-first-class 1440 | 4.76 | 7.84 | 7.84 | 2521 / 2560 | not B2 |
| /de/en/100-years/crane 390 | 9.46 | 12.53 | 12.53 | 10981 / 10886 | not B2 |
| /de/en/upgrade-info 1440 | 2.78 | 5.77 | 5.77 | 2260 / 2221 | not B2 |
| /de/en/book-and-manage/stopover 390 | 14.0 | 16.75 | 19.68 | 17448 / 17792 | not B2 |
| /de/en/articles/highlights 390 | 0.66 | 3.25 | 3.25 | 9456 / 9556 | not B2 |
| /de/en/menus-travel-classes 390 | 3.97 | 6.5 | 6.5 | 3111 / 3159 | not B2 |
| /de/en/discover-lufthansa/lufthansa-fleet/351 1440 | 4.88 | 7.4 | 7.4 | 7756 / 7783 | not B2 |
| /de/en/security-fast-lanes 390 | 6.0 | 8.31 | 8.31 | 3554 / 3562 | not B2 |
| /de/de/gepaeck 1440 | 3.37 | 5.5 | 7.89 | 4727 / 4726 | not B2 |
| /de/en/lufthansa-express-bus 390 | 8.9 | 10.92 | 10.68 | 7794 / 7820 | not B2 |
| /de/en/boeing787 390 | 7.44 | 9.39 | 7.69 | 8326 / 8364 | B2 alone (M at 40 brings it back) |
| /de/en/first-class-comfort 390 | 3.13 | 5.06 | 5.06 | 3408 / 3432 | not B2 |
| /de/en/boeing787 1440 | 5.42 | 7.19 | 4.7 | 7520 / 7564 | B2 alone (M at 40 brings it back) |
| /de/en/first-class-valet-parking-service 390 | 5.13 | 6.87 | 6.87 | 2483 / 2491 | not B2 |
| /de/de/meetings-and-events 1440 | 2.74 | 4.44 | 4.44 | 3609 / 3582 | not B2 |
| /at/de/meetings-and-events 1440 | 2.74 | 4.44 | 4.44 | 3609 / 3582 | not B2 |
| /de/en/common/agb-extra-services-at-online-check-in/conditions-seat-reservation 1440 | 5.53 | 7.21 | 7.21 | 2675 / 2693 | not B2 |
| /de/en/meetings-and-events-delegates 1440 | 2.07 | 3.72 | 3.72 | 2314 / 2322 | not B2 |
| /xx/es/meetings-and-events 1440 | 2.77 | 4.41 | 4.41 | 3608 / 3581 | not B2 |
| /de/en/upgrade-info 390 | 5.55 | 7.16 | 7.16 | 3261 / 3285 | not B2 |
| /de/en/lufthansa-express-bus 1440 | 4.12 | 5.73 | 5.02 | 4897 / 4923 | B2 in part, then the rest |
| /de/en/book-and-manage/stopover/zugspitze 390 | 3.33 | 4.93 | 4.93 | 4004 / 4011 | not B2 |
| /xx/ru/meetings-and-events 1440 | 3.1 | 4.69 | 4.69 | 3689 / 3662 | not B2 |
| /fr/fr/meetings-and-events 1440 | 3.11 | 4.69 | 4.69 | 3715 / 3688 | not B2 |
| /xx/fr/meetings-and-events 1440 | 3.07 | 4.65 | 4.65 | 3715 / 3688 | not B2 |
| /de/en/miles-and-more 390 | 5.16 | 6.61 | 6.61 | 4193 / 4173 | not B2 |
| /gb/en/miles-and-more 390 | 5.17 | 6.61 | 6.61 | 4193 / 4173 | not B2 |
| /de/de/frankfurt-fair 390 | 6.09 | 7.49 | 7.49 | 5451 / 5490 | not B2 |
| /de/en/all-check-in 390 | 5.17 | 6.57 | 6.57 | 3330 / 3362 | not B2 |
| /at/de/frankfurt-fair 390 | 6.09 | 7.48 | 7.48 | 5451 / 5490 | not B2 |
| /de/en/fmg-valet-parking-service 1440 | 1.96 | 3.29 | 3.29 | 2959 / 2940 | not B2 |
| /de/en/my-bookings 390 | 8.21 | 9.53 | 8.18 | 5315 / 5354 | B2 alone (M at 40 brings it back) |
| /de/en/discover-lufthansa/lufthansa-fleet/351 390 | 8.53 | 9.79 | 9.79 | 8627 / 8607 | not B2 |
| /de/en/tips-senior-travellers 1440 | 6.3 | 7.54 | 10.26 | 13166 / 13133 | not B2 |
| /de/en/prepare-for-your-trip/baggage/sport-baggage/register-sports-baggage/confirmation 390 | 5.06 | 6.16 | 8.27 | 1809 / 1799 | not B2 |
| /de/en/upgrade-first-class 390 | 5.32 | 6.32 | 6.32 | 3772 / 3755 | not B2 |
| /de/en/book-and-manage/stopover/neuschwanstein 390 | 2.72 | 3.6 | 3.6 | 3732 / 3739 | not B2 |
| /de/en/all-check-in 1440 | 3.14 | 4.02 | 4.02 | 2817 / 2826 | not B2 |
| /de/en/anmeldung-tiere-frachtraum 1440 | 3.47 | 4.35 | 4.35 | 6474 / 6503 | not B2 |
| /de/en/articles/highlights 1440 | 1.3 | 2.14 | 2.14 | 6844 / 6853 | not B2 |
| /de/en/anmeldung-tiere-frachtraum 390 | 7.28 | 8.04 | 8.04 | 8726 / 8755 | not B2 |
| /de/en/common/agb-extra-services-at-online-check-in/conditions-seat-reservation 390 | 9.36 | 10.11 | 10.11 | 3568 / 3620 | not B2 |
| /de/en/100-years/chronicle 1440 | 12.22 | 12.96 | 13.18 | 34698 / 34687 | not B2 |
| /gb/en/frankfurt-fair 390 | 5.91 | 6.58 | 6.58 | 5321 / 5336 | not B2 |
| /de/en/frankfurt-fair 390 | 5.9 | 6.57 | 6.57 | 5321 / 5336 | not B2 |
| /de/en/book-and-manage/stopover/bayerischer-hof 390 | 4.12 | 4.76 | 4.76 | 4047 / 4036 | not B2 |
| /gb/en/frankfurt-fair 1440 | 4.74 | 5.36 | 5.36 | 3503 / 3492 | not B2 |
| /de/en/frankfurt-fair 1440 | 4.74 | 5.35 | 5.35 | 3503 / 3492 | not B2 |
| /de/en/green-fare 1440 | 2.67 | 3.18 | 3.18 | 5671 / 5647 | not B2 |
| /de/en/admission-rules 1440 | 3.06 | 3.55 | 3.55 | 7205 / 7186 | not worse |
| /de/en/passenger-rights 1440 | 3.07 | 3.5 | 4.37 | 5803 / 5783 | not worse |
| /de/de/fluege 1440 | 33.76 | 34.18 | 34.18 | 3892 / 3940 | not worse |
| /de/en/book-and-manage/stopover/bayerischer-hof 1440 | 5.08 | 5.45 | 5.45 | 2950 / 2950 | not worse |
| /de/en/rail-fly-terms-and-conditions 1440 | 5.11 | 5.47 | 5.47 | 3000 / 3048 | not worse |
| /de/en/cookie-policy 390 | 6.06 | 6.33 | 6.33 | 12411 / 12212 | not worse |
| /de/en/meetings-and-events-delegates 390 | 6.03 | 6.29 | 6.29 | 2909 / 2893 | not worse |
| /de/en/green-fare 390 | 4.34 | 4.58 | 4.58 | 7320 / 7312 | not worse |
| /de/de/frankfurt-fair 1440 | 3.83 | 4.07 | 4.07 | 3506 / 3495 | not worse |
| /at/de/frankfurt-fair 1440 | 3.84 | 4.07 | 4.07 | 3506 / 3495 | not worse |
| /de/en/book-and-manage/stopover/neuschwanstein 1440 | 4.8 | 5.0 | 5.0 | 3012 / 3012 | not worse |
| /de/en/book-and-manage/stopover/zugspitze 1440 | 4.53 | 4.73 | 4.73 | 3069 / 3069 | not worse |
| /de/en/100-years/chronicle 390 | 7.03 | 7.22 | 7.22 | 43634 / 43401 | not worse |
| /de/en/fmg-valet-parking-service 390 | 4.68 | 4.81 | 4.81 | 3737 / 3742 | not worse |
| /gb/en/flights 390 | 43.82 | 43.94 | 44.27 | 5132 / 5206 | not worse |
| /de/en/articles/explore-flying/flying-high-christoph-quarch 390 | 5.63 | 5.72 | 5.72 | 6402 / 6398 | not worse |
| /de/de/bedeutsamste-strecken 1440 | 2.71 | 2.77 | 2.77 | 2466 / 2466 | not worse |
| /at/de/bedeutsamste-strecken 1440 | 2.71 | 2.77 | 2.77 | 2466 / 2466 | not worse |
| /de/en/flights 390 | 44.84 | 44.87 | 45.52 | 5341 / 5355 | not worse |
| /gb/en/lufthansa-travel-classes 390 | 8.02 | 8.02 | 8.02 | 4688 / 4688 | not worse |
| /gb/en/overview-special-request 390 | 5.79 | 5.79 | 5.79 | 3936 / 3936 | not worse |
| /de/de/lufthansa-reiseklassen 390 | 7.95 | 7.95 | 7.95 | 4787 / 4787 | not worse |
| /at/de/lufthansa-reiseklassen 390 | 7.95 | 7.95 | 7.95 | 4787 / 4787 | not worse |
| /de/de/meetings-and-events 390 | 6.11 | 6.11 | 6.11 | 4149 / 4149 | not worse |
| /at/de/meetings-and-events 390 | 6.11 | 6.11 | 6.11 | 4149 / 4149 | not worse |
| /gb/en/meetings-and-events 390 | 5.75 | 5.75 | 5.75 | 3888 / 3888 | not worse |
| /de/de/bedeutsamste-strecken 390 | 5.94 | 5.94 | 5.94 | 2875 / 2875 | not worse |
| /at/de/bedeutsamste-strecken 390 | 5.94 | 5.94 | 5.94 | 2875 / 2875 | not worse |
| /gb/en/most-significant-route 390 | 5.99 | 5.99 | 5.99 | 2780 / 2780 | not worse |
| /fr/fr/meetings-and-events 390 | 6.04 | 6.04 | 6.04 | 4355 / 4355 | not worse |
| /xx/es/meetings-and-events 390 | 6.23 | 6.23 | 6.23 | 4109 / 4109 | not worse |
| /xx/fr/meetings-and-events 390 | 6.05 | 6.05 | 6.05 | 4355 / 4355 | not worse |
| /de/en/lufthansa-travel-classes 390 | 8.01 | 8.01 | 8.01 | 4688 / 4688 | not worse |
| /de/en/meetings-and-events 390 | 5.74 | 5.74 | 5.74 | 3888 / 3888 | not worse |
| /de/en/most-significant-route 390 | 5.98 | 5.98 | 5.98 | 2780 / 2780 | not worse |
| /de/de/overview-special-request 390 | 5.61 | 5.61 | 5.61 | 4028 / 4028 | not worse |
| /de/de/services-am-flughafen 390 | 7.47 | 7.47 | 7.47 | 3619 / 3619 | not worse |
| /xx/ru/meetings-and-events 390 | 6.92 | 6.92 | 6.92 | 4370 / 4370 | not worse |
| /de/en/common/accessibility-statement 390 | 7.42 | 7.42 | 7.42 | 9987 / 9987 | not worse |
| /de/en/book-and-manage/rebook 390 | 6.62 | 6.62 | 6.62 | 2407 / 2407 | not worse |
| /gb/en/lufthansa-travel-classes 1440 | 3.85 | 3.85 | 3.85 | 3290 / 3290 | not worse |
| /gb/en/overview-special-request 1440 | 2.46 | 2.46 | 2.46 | 2746 / 2746 | not worse |
| /de/de/lufthansa-reiseklassen 1440 | 3.88 | 3.88 | 3.88 | 3290 / 3290 | not worse |
| /at/de/lufthansa-reiseklassen 1440 | 3.88 | 3.88 | 3.88 | 3290 / 3290 | not worse |
| /gb/en/meetings-and-events 1440 | 2.56 | 2.56 | 2.56 | 3528 / 3528 | not worse |
| /gb/en/most-significant-route 1440 | 2.56 | 2.56 | 2.56 | 2574 / 2574 | not worse |
| /de/en/lufthansa-travel-classes 1440 | 3.86 | 3.86 | 3.86 | 3290 / 3290 | not worse |
| /de/en/most-significant-route 1440 | 2.56 | 2.56 | 2.56 | 2574 / 2574 | not worse |
| /de/de/overview-special-request 1440 | 2.45 | 2.45 | 2.45 | 2773 / 2773 | not worse |
| /de/de/services-am-flughafen 1440 | 1.48 | 1.48 | 1.48 | 2851 / 2851 | not worse |
| /de/en/book-and-manage/rebook 1440 | 4.33 | 4.33 | 4.33 | 1886 / 1886 | not worse |
| /de/en/articles/explore-flying/flying-high-christoph-quarch 1440 | 5.76 | 5.76 | 5.76 | 5400 / 5400 | not worse |
| /gb/en/flights 1440 | 33.08 | 33.07 | 33.12 | 3898 / 3932 | not worse |
| /de/en/cookie-policy 1440 | 2.98 | 2.97 | 2.97 | 9862 / 9726 | not worse |
| /gb/en/airport-information 1440 | 3.84 | 3.81 | 4.97 | 3230 / 3209 | not worse |
| /de/en/flights 1440 | 34.1 | 34.06 | 33.87 | 4107 / 4081 | not worse |
| /de/en/passengers-using-wheelchairs 1440 | 4.51 | 4.47 | 4.46 | 11169 / 11123 | not worse |
| /de/en/book-and-manage/flights/ana 1440 | 6.35 | 6.22 | 6.22 | 3363 / 3363 | not worse |
| /at/de/fluege 390 | 43.93 | 43.69 | 43.69 | 5370 / 5375 | not worse |
| /at/de/fluege 1440 | 34.14 | 33.71 | 33.71 | 4063 / 3957 | not worse |
| /de/de/fluege 390 | 45.79 | 45.2 | 45.2 | 5260 / 5385 | not worse |
| /de/en/passengers-using-wheelchairs 390 | 7.53 | 6.82 | 6.82 | 20239 / 20234 | not worse |
| /de/en/passenger-rights 390 | 6.09 | 5.34 | 6.57 | 9121 / 9117 | not worse |
| /de/en/common/accessibility-statement 1440 | 6.73 | 5.95 | 5.37 | 6600 / 6561 | not worse |
| /de/en/lufthansa-aviation-group 390 | 14.04 | 13.25 | 13.25 | 3783 / 3831 | not worse |
| /de/en/admission-rules 390 | 5.6 | 4.72 | 4.72 | 8342 / 8415 | not worse |
| /de/en/tips-senior-travellers 390 | 12.2 | 11.17 | 12.66 | 20297 / 20300 | not worse |
| /de/en/rail-fly-terms-and-conditions 390 | 8.6 | 7.51 | 7.51 | 5131 / 5179 | not worse |
| /de/en/security-fast-lanes 1440 | 5.27 | 3.7 | 3.7 | 3006 / 3038 | not worse |
| /de/en/meetings-and-events 1440 | 14.34 | 2.56 | 2.56 | 3528 / 3528 | not worse |

## 6. What is left

1. Carriers the collapse does not write yet: two-thirds headings (limited-width on campaign and info pages), compact card titles (heading-small card H2s), the info pages' column-mark carriers (plan 558 §6 1-6).
2. Then lufthansa-scoped carrier rules on the branch for B1 and B3, gated on all 670 recorded page-widths with markers.
3. B2 is Ben's decision 3: the table in §4 is the cost per page.
4. The 254 recorded pages with markers outside the sample, and the info pages, before any canary.
