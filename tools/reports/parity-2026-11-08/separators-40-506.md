# 40 px separators in the collapse (brief 506 item 2)

ema-adobe, 2026-11-08. The collapse maps every separator of 32-89 px to M, which the theme draws as 60 px
(`style-markers.js` `SPACE.m`; `token-free.js` `separatorFor` draws `SPACE[space]`, not the theme's own
`separators.m`). www's 40 px separators come out 20 px larger each. Ben's rule: near values go to the brand default,
no exceptions, a theme rule before an exception. Result: **no lufthansa.com page-type or section-edge rule brings the
40 px pages back without moving the 60 px ones by as much; M stays 60, and the cost per page is below.**

## How lufthansa.com uses the M band

Published documents (296 lufthansa.com pages of lh-parity-002a-d and -003), separators of 32-89 px:

| Size | Count |
| --- | --- |
| 40 | 59 |
| 60 (11 of them from 768 px) | 57 |
| 50 | 33 |
| 70 | 19 |
| 80 | 18 |
| 35, 42, 55 | 9 |

Median 50, mean 54. By template: info 40 (40 of 99), campaign 60 (38 of 72), hub 60 (11 of 17). By the carrier the
collapse gives them: at a section's end 60 (41) against 40 (16); at a section's start 40 (15), 50 (12), 60 / 70 (5
each), 80 (2); as a Spacer block 40 and 50 (11 each), 60 (8), 80 (4); before a block 40 (4), 60 / 80 (3 each). No page
type and no section edge has one size: a 40 there is as often a 50 or 60.

Hub previews (68 hub pages, re-imported): `{spacer-60 from-768}` 80, `{spacer-40}` 19 (baggage, food-and-beverages,
speisen-und-getraenke, gepaeck on their roots), `{spacer-70}` 4, `{spacer-35}` 3.

## Measured: M drawn at 60 (today), 50, 40

Drafts from the captures (lh-snapshots-062 / -085, bd-snapshots), collapsed with `collapseHtml(…, { force: true })`,
rendered on lufthansa.turnsthe.page with `body.theme-live`; M's separators redrawn at 50 or 40 px after the page has
loaded. Against lh-parity-002, 1440 / 390 (%). Marks: today's import, before the collapse.

| Page | Template | Marks | M 60 | M 50 | M 40 | What 60 costs against 40 (points) |
| --- | --- | --- | --- | --- | --- | --- |
| /de/en/baggage | hub | 6.4 / 9.5 | 14.4 / 12.4 | 10.9 / 10.6 | 6.4 / 9.6 | 8.0 / 2.8 |
| /de/en/food-and-beverages | hub | 9.9 / 10.9 | 23.9 / 28.5 | 20.5 / 27.4 | 16.8 / 25.4 | 7.1 / 3.1 |
| /de/en/discover-lufthansa/new-onboard-experience | campaign | 8.9 / 11.7 | 34.9 / 37.1 | 25.9 / 36.5 | 8.4 / 34.9 | 26.5 / 2.2 |
| /de/en/economy-class | info | 22.0 / 33.1 | 22.4 / 32.8 | 21.9 / 32.5 | 21.4 / 32.1 | 1.0 / 0.7 |
| /de/en/accessible-travel | info | 5.9 / 6.2 | 11.9 / 6.4 | 12.1 / 6.6 | 12.4 / 6.7 | -0.5 / -0.3 |
| /de/en/first-class | info | 20.4 / 27.7 | 25.7 / 32.5 | 28.7 / 31.1 | 31.0 / 30.2 | -5.3 / 2.3 |
| /de/en/onboard-delights | info | 11.3 / 14.3 | 15.3 / 15.6 | 16.5 / 17.3 | 19.1 / 17.6 | -3.8 / -2.0 |
| /de/en/additional-services | hub | 7.0 / 15.1 | 7.0 / 47.7 | 20.7 / 44.0 | 31.3 / 40.5 | -24.3 / 7.2 |
| /de/en/book-and-manage/stopover | campaign | 58.5 / 40.9 | 57.3 / 43.0 | 58.3 / 42.9 | 58.3 / 42.2 | -1.0 / 0.8 |
| /de/en/miles-and-more | hub | 7.2 / 13.9 | 14.6 / 11.9 | 14.6 / 11.9 | 14.6 / 11.9 | 0 / 0 |

- A lufthansa.com M of 40 would bring baggage back to today's result (6.4 / 9.6) and new-onboard-experience at 1440
  (8.4), and costs additional-services 24 points at 1440 (its separators are 60) and first-class and onboard-delights
  4-5 (their 40s sit next to 70s and 80s). 50 halves both sides. Info pages, the one template where 40 is the commonest
  size, gain nothing from it (economy-class 1.0 point, the others lose).
- So, by the rule, M stays 60 on lufthansa.com and the 40 px pages carry the cost: up to 8.0 points at 1440 for baggage
  (2.8 at 390), 7.1 / 3.1 for food-and-beverages, 26.5 / 2.2 for new-onboard-experience (its 40s are section gaps
  between six chapters).
- The /100-years pages are left out: their sections' spacing is the page type's theme rule (`sections-m`), which
  `token-free.js` applies only for a live theme, so this render (theme class on, theme not live) can't show it.

## A bigger separator cost: "from-768" goes

The collapse draws `{spacer-N from-768}` at every width; ema-test's decision 3 (tools/reports/token-free/decisions.md,
the brief after 506) keeps it so ("from 768" is a near value of the separator itself; a Spacer option for it would be
an exception). Its cost on lufthansa.com: additional-services' ten `{spacer-60 from-768}` (www shows them from 768 px
only) put 60 px each into the phone layout, 15.1 % -> 47.7 % at 390 (32.6 points; the drift +60 px per separator from
1600 px down). The 80 such separators of the hub previews are on additional-services' documents (4 roots) and the four
xx translations.

## Pages with 40 px separators (published documents)

info: economy-class, first-class, childrens-menus-on-board, premium-economy-class, baggage-irregularities,
unterhaltung-an-bord, medikamenten-transport, onboard-delights, travel-with-needs/cognitive-impairment, economy-basic,
special-meals, travel-with-needs/visual-impairment, lufthansa-express-rail, upgrade-to-premium-economy-class,
travel-with-needs/travel-companion, travel-with-needs/hearing-impairment, uebergepaeck, europa-tarife-economy-class,
automatic-check-in, passengers-using-wheelchairs, passengers-with-sensory-impairment, accessible-travel (22);
campaign: discover-lufthansa/new-onboard-experience, 100-years/global-network, 100-years/cabin-design,
100-years/chronicle (4); hub: food-and-beverages, baggage (2; on preview also speisen-und-getraenke and gepaeck on
their roots); fleet: boeing787; app-entry: my-bookings (all /de/en).

Runner: logs/b506/sep-run.sh (sep-positions.mjs, sep-by-template.mjs for the counts).
