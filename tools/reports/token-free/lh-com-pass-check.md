# lufthansa.com's collapse pass: a check before the switch (brief 507 item 2)

ema-adobe, 2026-11-09. lufthansa.com is the last brand in the plan's order; the method is ema-test's
([b2b-pass-check.md](b2b-pass-check.md)). 37 published documents (the page types in proportion, each at least once: info
8, insights 6, campaign 5, hub 7 (two de/de), legal 3, fleet 2, form 2, app-entry 2, flight status 1, homepage 1; the
recorded de/en pages the collapse changes, tools/reports/token-free/collapse-lh-com-paths.txt), each at 1440 and 390,
rendered three ways on lufthansa.turnsthe.page with the working copy's code:

- **host**: the published page (DA's document, markers, theme off);
- **E**: the same published document (its `.plain.html`, its head's theme / headings metas) as `<main>`, theme off:
  it renders as the host except flights (the destination finder's live offers) and culinaryjourney (a micro-frontend),
  both left out below; chronicle -0.3 % at 390;
- **collapsed + live**: that document with its metas as a Metadata block through `marker-collapse-cli.mjs --brand
  lufthansa --force` (read-only: 37 documents, 321 markers; with main's collapse as of 142a2d2: 161 to the theme, 160 to
  carriers (130 written), none for a person, none left, idempotent; the first run, before ema-test's d1bd76e and 6d1bb8a:
  204 / 117), the theme forced live in the browser only (`scripts/style-markers.js` answered with `live: true`;
  the repository's switch stays off).

Flagged: the page more than 3 % taller or shorter than the host, or a heading more than 40 px off. Causes from the
element-by-element comparison (px, estimates): **A** text width, **B** column views (the marks' paddings), **C**
separators, **D** heading sizes, **R** the rest (block layouts, wrapping). Scratch: logs/b507/pc-*.sh / .mjs,
logs/b507/capture-live.cjs (not in git).


Three runs, the same documents and host renders:

- **first run**: main's collapse before ema-test's d1bd76e (the column view carrier in the collapse) and 6d1bb8a (an
  article's order after a chapter split);
- **main today**: main's collapse as of 142a2d2, with both: the column marks become column-view sections on every
  lufthansa.com page type (`THEMES.lufthansa.columnViews.carrier`), the chapter split keeps the order;
- **today + item 2**: main today without `sections-m` on /100-years ([handover](lh-com-handover-ema-test.md) item 2),
  the rule removed in the browser only.

The host renders are taken again with the deployed code of 142a2d2 (the related-articles and bold CTA rules in both
sides). Noise: chronicle's lazy photos load late in some captures (a 535 px photo at 1440, 0 px high in one run): its
figures move up to 1 point between runs; the table takes the run in which every photo loaded at 1440.

## Per page type

| page type | page widths | flagged: first run | flagged: main today | flagged: today + item 2 | mean height difference: first run | main today | today + item 2 | E (left out) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| campaign | 8 | 8 | 8 | 7 | 5.8 % | 5.5 % | 1.8 % | 2 |
| fleet | 4 | 2 | 2 | 2 | 0.8 % | 0.6 % | 0.6 % | 0 |
| info | 16 | 12 | 9 | 9 | 3.0 % | 0.9 % | 0.9 % | 0 |
| hub | 12 | 9 | 6 | 6 | 4.0 % | 1.5 % | 1.5 % | 2 |
| legal | 6 | 2 | 2 | 2 | 2.7 % | 2.7 % | 2.7 % | 0 |
| form | 4 | 0 | 0 | 0 | 0.7 % | 0.3 % | 0.3 % | 0 |
| insights | 12 | 8 | 8 | 8 | 2.0 % | 2.0 % | 2.0 % | 0 |
| app-entry | 4 | 0 | 0 | 0 | 0.7 % | 0.7 % | 0.7 % | 0 |
| flight-status | 2 | 0 | 0 | 0 | 0.0 % | 0.0 % | 0.0 % | 0 |
| homepage | 2 | 0 | 0 | 0 | 0.9 % | 0.9 % | 0.9 % | 0 |

## Causes, by page type (main today)

- **campaign** (8 page-widths; mine): the /100-years pages grow 3-9 %: `sections-m` adds 61 px at every section start,
  where campaign-sections already draws www's spacing (item 2: -0.2 to -2.3 % without it; chronicle and global-network
  stay flagged on a heading 77-406 px off, the column views' B and the heading sizes D, within 2.3 % in height).
  stopover +1.9 / +3.9 %: its `{spacer-60 from-768}` show on phones (decision 3) and its heading-small H2s take
  heading-medium (near values).
- **hub** (12; mine): the carrier in the collapse brings miles-and-more de/en to +0.4 / +0.5 % (first run -6.9 / -4.1),
  de/de +1.8 / +0.5 (-6.7 / -3.7), de/de meetings-and-events -0.5 / -0.1 (-10.7 / -2.2), as the handover's mapping
  measured. additional-services +8.2 % at 390: its ten `{spacer-60 from-768}` show on phones (decision 3). Still
  flagged: baggage 1440 (a heading 80 px down, B +40), miles-and-more's headings within 48 px.
- **insights** (12; mine): the order is right now (6d1bb8a): the worst heading shift on chiswick 1261 -> 310 px,
  be-picky-barcelona 1619 -> 278 at 390. Left: the Related Articles section gets a divider www doesn't draw (+26 px,
  item 5); captions in Columns Media cells lose their style (food-trends +188 px at 390, item 4); C +51 / +52 on the
  articles' separators (decision 4's dropped 21-31 px ones are on www, 40-60 px ones grow to M).
- **info** (16; ema-lufthansa's template): the carrier applies here too since d1bd76e: travel-agencies -11.6 -> -1.3 %
  at 1440 (-7.4 -> -0.4 at 390), lufthansa-corporate-customers -5.3 -> -0.6, flightreservation-priceguarantee -3.9 ->
  -1.2, accessible-travel -2.7 -> -0.4; payment-options-at-the-airport and first-class-terminal at 390 now flagged on a
  heading 54-57 px off (within 0.9 % in height). Ben's question 1 below.
- **legal** (6; ema-lufthansa): advance-seat-reservations-terms-and-conditions +7.4 / +6.5 %: a 100 px separator
  becomes L (120) and its Columns Media 42 px taller (cell heading sizes).
- **fleet** (4; ema-cashub): 320 -1.5 -> -0.8 % at 1440 with the carrier (-1.5 -> -1.4 at 390), still flagged on a
  heading 48-84 px off.
- **form, app-entry, flight status, homepage**: within 1.3 %, nothing flagged.

## Fixed (ours)

Nothing in lufthansa.com's rule files: every difference above is the collapse's or the theme's (ema-test's files,
the handover), a decision already made (Ben's rule, decisions 1-4) or another template's. The carrier's CSS (brief 506)
is what the collapse's carrier needs on lufthansa.com's side, and it is on main. This brief's three commits (0369cb9,
fc1f4f7, 142a2d2; tools/reports/parity-2026-11-09/sweep-lh-baseline.md) are parity fixes on today's pages; they change
both sides of this check alike.

## For Ben

1. **The column view carrier on lufthansa.com's info, legal and fleet pages.** Ben named the hub pages an exception to
   decision 1 (brief 511); main's collapse (d1bd76e) writes the carrier for every lufthansa.com page with column marks.
   Measured on the sample: info 9 of 16 page-widths flagged, mean height difference 0.9 % (without the carrier there:
   12 of 16, 3.0 %; travel-agencies -11.6 %, lufthansa-corporate-customers -5.3 %), fleet 0.6 % (0.8 %), legal
   unchanged (no marks). Options: (a) the exception for hub pages only, as named (a condition in the collapse,
   ema-test's: the theme's page types tell the info pages (`flow`) from the rest, not hub from fleet or legal, so
   "not on info pages" is what a condition can say today; info back to decision 1, the cost above); (b) the exception for every lufthansa.com page with
   column marks, as main does today (decisions.md then names it so). No change of mine either way: the carrier's CSS
   is brand-wide.
2. **Headings outside column views with www's limited width** (14 of 173 section H2s on www; miles-and-more's first H2
   at 1440: A -39 px today, the first run's -174 px mostly the column views'): the collapse drops limited-width ("near value" of the text width). Options:
   (a) as it is; (b) a heading style for the minority (an exception by Ben's rule).

## Every page-width, worst first

| --- | --- | --- | --- | --- | --- | --- |
| /de/en/flights (E) | hub | 390 | -77.1 % / -14790 px **flagged** | -77.1 % / -14790 px **flagged** | = | C -89, D +51, R -14809 |
| /de/en/flights (E) | hub | 1440 | -71.2 % / -7799 px **flagged** | -71.2 % / -7799 px **flagged** | = | C -89, D +18, R -7825 |
| /de/en/culinaryjourney (E) | campaign | 390 | -36.8 % / -377 px **flagged** | -36.8 % / -377 px **flagged** | = | R -377 |
| /de/en/100-years/chronicle | campaign | 1440 | +11 % / 3573 px **flagged** | +9.4 % / 3038 px **flagged** | -0.2 % / -77 px **flagged** | A +27, B +2335, C +361, D -52, R +520 |
| /de/en/100-years | campaign | 1440 | +8.9 % / 666 px **flagged** | +8.9 % / 666 px **flagged** | -0.6 % / 0 px | A +27, B +392, C +69, R +179 |
| /de/en/culinaryjourney (E) | campaign | 1440 | -8.2 % / -63 px **flagged** | -8.2 % / -63 px **flagged** | = | R -63 |
| /de/en/additional-services | hub | 390 | +8.2 % / 0 px **flagged** | +8.2 % / 0 px **flagged** | = | C +309, R +240 |
| /de/en/100-years/chronicle | campaign | 390 | +8.1 % / 3447 px **flagged** | +7.6 % / 3214 px **flagged** | -1.2 % / -385 px **flagged** | B +2812, C +361, D -36, R +83 |
| /de/en/advance-seat-reservations-terms-and-conditions | legal | 1440 | +7.4 % / 0 px **flagged** | +7.4 % / 0 px **flagged** | = | R +42 |
| /de/en/advance-seat-reservations-terms-and-conditions | legal | 390 | +6.5 % / 0 px **flagged** | +6.5 % / 0 px **flagged** | = | R +81 |
| /de/en/100-years | campaign | 390 | +6.3 % / 585 px **flagged** | +6.3 % / 585 px **flagged** | -1.7 % / -81 px **flagged** | A -81, B +392, C +69, R +179 |
| /de/en/articles/explore-the-world/in-my-hood-chiswick-london | insights | 390 | +5 % / 1261 px **flagged** | +5 % / 310 px **flagged** | = | B +25, C +52, R +233 |
| /de/en/articles/explore-the-world/be-picky-barcelona-insider-tips | insights | 390 | +4.1 % / 1619 px **flagged** | +4.1 % / 278 px **flagged** | = | C +52, D +38, R +188 |
| /de/en/book-and-manage/stopover | campaign | 390 | +3.9 % / 622 px **flagged** | +3.9 % / 622 px **flagged** | = | B +214, D +64, R +355 |
| /de/en/articles/explore-the-world/be-picky-barcelona-insider-tips | insights | 1440 | +3.9 % / 896 px **flagged** | +3.9 % / 162 px **flagged** | = | C +51, D +9, R +104 |
| /de/en/articles/explore-the-world/on-the-scene-food-trends-istanbul | insights | 390 | +3.8 % / 236 px **flagged** | +3.8 % / 236 px **flagged** | = | C +26, R +210 |
| /de/en/100-years/global-network | campaign | 1440 | +3.4 % / 522 px **flagged** | +3.4 % / 522 px **flagged** | -2.2 % / -356 px **flagged** | B +201, C +66, D -39, R +309 |
| /de/en/articles/explore-the-world/in-my-hood-chiswick-london | insights | 1440 | +3 % / 738 px **flagged** | +3 % / 125 px **flagged** | = | B +23, C +51, R +51 |
| /de/en/100-years/global-network | campaign | 390 | +2.6 % / 438 px **flagged** | +2.6 % / 438 px **flagged** | -2.3 % / -406 px **flagged** | B +217, C +66, D -115, R +300 |
| /de/en/book-and-manage/flights/giftvoucher | info | 1440 | +2.1 % / 64 px **flagged** | +2.1 % / 64 px **flagged** | = | B +16, D +18, R +32 |
| /de/en/baggage | hub | 1440 | +2.1 % / 80 px **flagged** | +2.1 % / 80 px **flagged** | = | B +40, R +40 |
| /de/en/lufthansa-travel-classes | hub | 390 | +2.1 % / -5 px | +2.1 % / -5 px | = | B +41, D +57, R -21 |
| /de/en/book-and-manage/stopover | campaign | 1440 | +1.9 % / 224 px **flagged** | +1.9 % / 224 px **flagged** | = | B +89, D +68, R +75 |
| /de/en/book-and-manage/flights/giftvoucher | info | 390 | +1.9 % / 68 px **flagged** | +1.9 % / 68 px **flagged** | = | B +16, D +51, R +36 |
| /de/de/miles-and-more | hub | 1440 | -6.7 % / -175 px **flagged** | +1.8 % / 48 px **flagged** | = | B +192, R -144 |
| /de/en/320 | fleet | 390 | -1.5 % / -88 px **flagged** | -1.4 % / -84 px **flagged** | = | B -64, R -20 |
| /de/en/common/seatreservation-condtions/seat-reservations | legal | 1440 | +1.4 % / 18 px | +1.4 % / 18 px | = | D +27 |
| /de/en/travel-agencies | info | 1440 | -11.6 % / -32 px **flagged** | -1.3 % / 32 px | = | A -32, B +96, R -77 |
| /de/en/feedback | form | 1440 | +1.3 % / 27 px | +1.3 % / 27 px | = | A +27 |
| /de/en/flight-search | app-entry | 1440 | -1.3 % / -26 px | -1.3 % / -26 px | = | C -26, D +9 |
| /de/en/flight-search | app-entry | 390 | +1.3 % / -10 px | +1.3 % / -10 px | = | B +18, C -26, D +38 |
| /de/en/homepage | homepage | 1440 | -1.3 % / -30 px | -1.3 % / -30 px | = | B -49 |
| /de/en/discover-lufthansa/flightreservation-priceguarantee | info | 1440 | -3.9 % / -51 px **flagged** | -1.2 % / -22 px | = | A -64, B +33, C +10, R -8 |
| /de/en/baggage | hub | 390 | +1.2 % / 75 px **flagged** | +1.2 % / 75 px **flagged** | = | B +40, R +35 |
| /de/en/articles/highlights | insights | 390 | +1.2 % / 90 px **flagged** | +1.2 % / 90 px **flagged** | = | R +93 |
| /de/en/common/seatreservation-condtions/seat-reservations | legal | 390 | +1.1 % / 21 px | +1.1 % / 21 px | = | B +11, D +21 |
| /de/en/articles/explore-flying/flying-high-christoph-quarch | insights | 1440 | +1.1 % / 50 px **flagged** | +1.1 % / 50 px **flagged** | = | C +26, R +24 |
| /de/en/first-class-terminal | info | 1440 | -0.8 % / -84 px **flagged** | -1 % / -108 px **flagged** | = | B -56, C -28, R -32 |
| /de/en/payment-options-at-the-airport | info | 390 | -1.5 % / 30 px | +0.9 % / 54 px **flagged** | = | B +33, R -11 |
| /de/en/prepare-for-your-trip/special-travel-needs/travel-with-needs/visual-impairment | info | 1440 | -0.9 % / 52 px **flagged** | -0.9 % / 52 px **flagged** | = | B +32, C -52, D -10, R -15 |
| /de/en/articles/explore-flying/flying-high-christoph-quarch | insights | 390 | +0.9 % / 50 px **flagged** | +0.9 % / 50 px **flagged** | = | C +26, R +24 |
| /de/en/320 | fleet | 1440 | -1.5 % / -88 px **flagged** | -0.8 % / -48 px **flagged** | = | B -8, R -40 |
| /de/en/accessible-travel | info | 390 | -1.1 % / -102 px **flagged** | -0.7 % / 84 px **flagged** | = | B +56, C -52, R -64 |
| /de/en/discover-lufthansa/flightreservation-priceguarantee | info | 390 | -2.8 % / -41 px **flagged** | -0.7 % / -22 px | = | B +32, C +10, R -65 |
| /de/en/first-class-terminal | info | 390 | -0.3 % / -33 px | -0.6 % / -57 px **flagged** | = | B -56, C +23, R -24 |
| /de/en/lufthansa-corporate-customers | info | 1440 | -5.3 % / 0 px **flagged** | -0.6 % / 24 px | = | A -40, B +64, R -40 |
| /de/en/articles/explore-the-world/on-the-scene-food-trends-istanbul | insights | 1440 | +0.6 % / 26 px | +0.6 % / 26 px | = | C +26 |
| /de/en/lufthansa-corporate-customers | info | 390 | -1.8 % / 0 px | -0.5 % / 4 px | = | B +24, R -40 |
| /de/en/payment-options-at-the-airport | info | 1440 | -2.8 % / 16 px | +0.5 % / 40 px | = | A -32, B +32, R +9 |
| /de/en/miles-and-more | hub | 390 | -4.1 % / -96 px **flagged** | +0.5 % / 48 px **flagged** | = | B +192, R -175 |
| /de/en/homepage | homepage | 390 | +0.5 % / 0 px | +0.5 % / 0 px | = | B -29, R +57 |
| /de/de/miles-and-more | hub | 390 | -3.7 % / -96 px **flagged** | +0.5 % / 48 px **flagged** | = | B +192, R -175 |
| /de/de/meetings-and-events | hub | 1440 | -10.7 % / -225 px **flagged** | -0.5 % / 28 px | = | B +260, R -272 |
| /de/en/accessible-travel | info | 1440 | -2.7 % / -112 px **flagged** | -0.4 % / 91 px **flagged** | = | A +34, B +56, C -52, D -10, R -47 |
| /de/en/prepare-for-your-trip/special-travel-needs/travel-with-needs/visual-impairment | info | 390 | -0.4 % / 43 px **flagged** | -0.4 % / 43 px **flagged** | = | B +33, C -52, R -10 |
| /de/en/travel-agencies | info | 390 | -7.4 % / -32 px **flagged** | -0.4 % / 32 px | = | B +96, R -100 |
| /de/en/miles-and-more | hub | 1440 | -6.9 % / -175 px **flagged** | +0.4 % / -8 px | = | A -39, B +191, R -143 |
| /de/en/articles/highlights | insights | 1440 | +0.2 % / 0 px | +0.2 % / 0 px | = | D +9 |
| /de/en/lufthansa-travel-classes | hub | 1440 | +0.1 % / 0 px | +0.1 % / 0 px | = | B +55, D +13, R -64 |
| /de/de/meetings-and-events | hub | 390 | -2.2 % / -54 px **flagged** | -0.1 % / 18 px | = | B +140, R -142 |
| /de/en/discover-lufthansa/lufthansa-fleet/351 | fleet | 1440 | 0 % / 0 px | 0 % / 0 px | = |  |
| /de/en/discover-lufthansa/lufthansa-fleet/351 | fleet | 390 | 0 % / 0 px | 0 % / 0 px | = |  |
| /de/en/additional-services | hub | 1440 | 0 % / 0 px | 0 % / 0 px | = |  |
| /de/en/passenger-rights | legal | 1440 | 0 % / 0 px | 0 % / 0 px | = |  |
| /de/en/passenger-rights | legal | 390 | 0 % / 0 px | 0 % / 0 px | = |  |
| /de/en/anmeldung-tiere-frachtraum | form | 1440 | +1.3 % / 0 px | 0 % / 0 px | = |  |
| /de/en/anmeldung-tiere-frachtraum | form | 390 | 0 % / 0 px | 0 % / 0 px | = |  |
| /de/en/feedback | form | 390 | 0 % / 0 px | 0 % / 0 px | = |  |
| /de/en/articles/authors/florian-tomberg | insights | 1440 | 0 % / 0 px | 0 % / 0 px | = |  |
| /de/en/articles/authors/florian-tomberg | insights | 390 | 0 % / 0 px | 0 % / 0 px | = |  |
| /de/en/my-logbook | app-entry | 1440 | 0 % / 0 px | 0 % / 0 px | = |  |
| /de/en/my-logbook | app-entry | 390 | 0 % / 0 px | 0 % / 0 px | = |  |
| /de/en/timetable-and-flight-status | flight-status | 1440 | 0 % / 0 px | 0 % / 0 px | = |  |
| /de/en/timetable-and-flight-status | flight-status | 390 | 0 % / 0 px | 0 % / 0 px | = |  |
