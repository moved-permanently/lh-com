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

## After the "from 768 px" Spacer option (brief 521, ema-test's 2963500)

The collapse now writes a run of `{spacer-N from-768}` as a Spacer with the option from-768 (hidden below 768 px). The
pass check run again for the three sample documents with from-768 separators: the 37 documents collapsed with main's
collapse as of 2963500 (305 markers: 144 to the theme, 161 to carriers, 131 written; none left, idempotent), those three
rendered against today's published pages with the theme forced live in the browser only (logs/b521/pcc, not in git):

| page | width | before (main as of 142a2d2) | with from-768 |
| --- | --- | --- | --- |
| /de/en/additional-services (10 from-768 separators) | 1440 | 0 % / 0 px | 0 % / 0 px |
| /de/en/additional-services | 390 | +8.2 % / 0 px **flagged** | 0 % / 0 px |
| /de/en/book-and-manage/stopover (6) | 1440 | +1.9 % / 224 px **flagged** | +1.9 % / 224 px **flagged** |
| /de/en/book-and-manage/stopover | 390 | +3.9 % / 622 px **flagged** | +1.9 % / 296 px **flagged** |
| /de/en/first-class-terminal (3) | 1440 | -1.0 % / -108 px **flagged** | -1.0 % / -108 px **flagged** |
| /de/en/first-class-terminal | 390 | -0.6 % / -57 px **flagged** | -0.6 % / -57 px **flagged** |

Per page type with these and /100-years without sections-m (ema-test's fa26e25; the numbers "today + item 2" below),
the other pages as measured with main as of 142a2d2 (logs/b521/pc-summary-521.mjs):

| page type | page widths | flagged | mean height difference | E (left out) |
| --- | --- | --- | --- | --- |
| campaign | 8 | 7 | 1.5 % | 2 |
| fleet | 4 | 2 | 0.6 % | 0 |
| info | 16 | 9 | 0.9 % | 0 |
| hub | 12 | 5 | 0.8 % | 2 |
| legal | 6 | 2 | 2.7 % | 0 |
| form | 4 | 0 | 0.3 % | 0 |
| insights | 12 | 8 | 2.0 % | 0 |
| app-entry | 4 | 0 | 0.7 % | 0 |
| flight-status | 2 | 0 | 0.0 % | 0 |
| homepage | 2 | 0 | 0.9 % | 0 |

stopover stays flagged on its headings (its heading-small H2s take heading-medium, near values: D +64 / +68 px);
first-class-terminal's three from-768 separators are 14-17 px, each beside an ordinary one ({spacer-0}, -53, -43): 0-31
px go as before, so nothing changes there; its column marks (B -56) and separators (C) as before. Not measured again here: insights after fa26e25's captions
in block cells and the divider before Related Articles (handover items 4 and 5).

## Insights after ema-test's captions and divider changes (brief 526, fa26e25)

ema-test's fa26e25 put three of the handover's items into their files: no `sections-m` on /100-years, captions in block
cells (an italic paragraph after a picture in a Columns Media cell gets the caption style), and no ruled-chapters
divider before the Related Articles section. The six insights documents of the sample collapsed again with main's
collapse (as of be71a18: 305 markers, 144 to the theme, 161 to carriers, none left, idempotent) and rendered against
today's published pages with today's code, the theme forced live in the browser only (logs/b526/pcd, not in git):

| page | width | before (main as of 142a2d2) | now |
| --- | --- | --- | --- |
| /de/en/articles/authors/florian-tomberg | 1440 | 0 % / 0 px | 0 % / 0 px |
| /de/en/articles/authors/florian-tomberg | 390 | 0 % / 0 px | 0 % / 0 px |
| /de/en/articles/explore-flying/flying-high-christoph-quarch | 1440 | +1.1 % / 50 px **flagged** | +0.5 % / 24 px |
| /de/en/articles/explore-flying/flying-high-christoph-quarch | 390 | +0.9 % / 50 px **flagged** | +0.4 % / 24 px |
| /de/en/articles/explore-the-world/be-picky-barcelona-insider-tips | 1440 | +3.9 % / 162 px **flagged** | +2.9 % / 122 px **flagged** |
| /de/en/articles/explore-the-world/be-picky-barcelona-insider-tips | 390 | +4.1 % / 278 px **flagged** | +2.0 % / 136 px **flagged** |
| /de/en/articles/explore-the-world/in-my-hood-chiswick-london | 1440 | +3.0 % / 125 px **flagged** | +2.3 % / 97 px **flagged** |
| /de/en/articles/explore-the-world/in-my-hood-chiswick-london | 390 | +5.0 % / 310 px **flagged** | +1.5 % / 96 px **flagged** |
| /de/en/articles/explore-the-world/on-the-scene-food-trends-istanbul | 1440 | +0.6 % / 26 px | +0.6 % / 24 px |
| /de/en/articles/explore-the-world/on-the-scene-food-trends-istanbul | 390 | +3.8 % / 236 px **flagged** | +0.4 % / 22 px |
| /de/en/articles/highlights | 1440 | +0.2 % / 0 px | +0.2 % / 0 px |
| /de/en/articles/highlights | 390 | +1.2 % / 90 px **flagged** | +1.2 % / 90 px **flagged** |

**Insights: 12 page-widths, 5 flagged (was 8), mean height difference 1.0 % (was 2.0 %).** food-trends' info box is back
(the captions in its cells), the 24-26 px of the Related Articles divider are gone from every article. Left on the two
flagged articles: their separators (C +25 / +26: 40-60 px ones grow to M) and the rest (R +45 to +88: be-picky's and
chiswick's "About" boxes, the text below their last chapter); highlights at 390, R +93 (the tag chips wrap differently).

A note on the method: the Price Bar (be-picky's and food-trends' "Round trip from ... €" fares, 90 px at 1440, 165 at
390) is drawn on the host but not in any render that puts a document into the page as `<main>`: not in the collapsed
one, and not in the render of the uncollapsed document with the theme off either (cap-e of brief 507). So it is the
method's, not the collapse's or the theme's, and it is the same before and after; those two pages' collapsed heights
come out 90 / 165 px short of what the switch would draw.

With insights at 1.0 %, the page types: campaign 1.5 %, hub 0.8 %, info 0.9 %, legal 2.7 %, insights 1.0 %, the rest
0.0-0.9 %.

## Legal and insights: the three biggest differences (brief 526 item 3)

Legal measured again with today's code (logs/b526/pcd): advance-seat-reservations-terms-and-conditions +7.4 / +6.5 %,
seat-reservations +1.4 / +1.1 %, passenger-rights 0 / 0 % (legal 2.7 % as before). The three biggest of the two page
types, after 8696468:

1. **The ruled chapters' section gap** (insights, every article with chapters): fixed, 8696468 (styles.css, live
   theme only). www draws a chapter's rule 24 px under the text before it; the collapsed page had a section gap (48 px):
   +24 px per chapter. With the rule: flying-high and food-trends 0 %, be-picky +2.9 -> +1.2 % (1440) / +2.0 -> +0.9 %
   (390), chiswick +2.3 -> +1.2 % / +1.5 -> +0.8 %. **Insights: 12 page-widths, mean height difference 0.5 %** (was 1.0).
2. **advance-seat-reservations-terms-and-conditions** (legal, +62 / +101 px): its Columns Media's four cells carry
   `{copytext-medium}` (16 px text); the collapse drops it, a near value of the theme's text size (18 px), so the
   block is 42 px (1440) / 81 px (390) taller, and its `{spacer-100}` becomes L (120 px, +20). Both are Ben's rule (near
   values collapse); nothing to change.
3. **The chapter rule at www's own section boundaries** (insights: be-picky's "This may also be of interest to you",
   +25 px): ema-test's token-free.js prepends the chapter divider to every section that opens with a heading, also to
   www's teaser section (a heading and its carousel-cards), which www draws without a rule. The exact change is item 7
   of [the handover](lh-com-handover-ema-test.md). seat-reservations' +27 / +32 px are its headings' sizes (D, near
   values).

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
  heading 54-57 px off (within 0.9 % in height). The carrier stays on info pages (answered below, brief 515).
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

## Answered (brief 515): Ben's rule, nothing goes back to him

Both questions are answered by Ben's rule (near values collapse to the common style; nothing stays an exception):

1. **The column view carrier stays on every lufthansa.com page type**, as main's collapse writes it (d1bd76e): hub,
   info, legal, fleet and campaign pages with column marks alike. The reason: the carrier is lufthansa.com's common
   style for www's column views, one rule for the brand; a hub-only condition would itself be the exception (the
   theme's page types can't tell hub from fleet or legal pages either). The cost measured here: info at 0.9 % mean
   height difference instead of 3.0 % (9 of 16 page-widths flagged instead of 12), fleet 0.6 % instead of 0.8 %,
   legal unchanged (no marks). Nothing changes in the code: main does this today. decisions.md (ema-test's) gets the
   wording through [the handover](lh-com-handover-ema-test.md), item 6.
2. **Headings with www's limited width: dropped, as now.** No heading style for the minority (14 of 173 section H2s
   on www): their width is a near value of the text width, so they collapse to it. The cost: miles-and-more's first
   H2 at 1440, A -39 px (8.4 points in the first run, mostly the column views', since the carrier is in the collapse).

## Every page-width, worst first

| page | type | width | first run: vs host / worst heading | main today | today + item 2 | causes (main today, px) |
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
