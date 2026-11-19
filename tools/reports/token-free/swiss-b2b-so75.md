# Standing order 75: the SWISS column, two new block options, rail-fly's icons, the closing list (2026-11-19)

Code: styles/themes/swiss.css (the column), styles/themes/b2b.css and scripts/style-markers.js (the options),
test/swiss-b2b-so75.test.mjs. Lists: tools/reports/parity-2026-11-09/delta-so75-b2b-narrow-text, -padded-cells,
-rail-fly-icons (.txt, .json); closing-so75-ema-cashub.txt.

Method as order 74 (tools/reports/token-free/swiss-b2b-so74.md):
- every section loaded;
- candidates toggled in the same load;
- the shipped code gated with the code itself against live;
- drafts from fresh served copies, with the unchanged copy drafted first;
- airline hosts, www.* and lh-proxy refused per request, none sent.

## Item 1: the SWISS column (shipped, with your word on the content-caused page-widths)

**The rule (swiss.css, from 1025 px):**
- the column beside the aside at www's 794 px (padding 48 px right);
- in a tab panel at www's 781 px (62 px);
- not a sidebar Columns Media.
- A last sidebar section whose column ends with a card row (a Columns Media right before the aside), or with an
  accordion in its last part, keeps 64 px more above the footer. That is www's space under swiss-first's last card row
  (www 114 px, ours about 50).

**The three steps, toggled cumulatively in one load on all 84 recorded 1440 page-widths** (390 doesn't move):

| Step | Moved | Closer | More than 0.5 points further | Sum (84 at 1440) |
| --- | --- | --- | --- | --- |
| 794 px, not in a tab panel | 14 | 5 | 8 | 209.93 -> 215.29 |
| + 781 px in tab panels | 18 | 9 | 8 | -> 210.71 |
| + the page end under a card row | 18 | 10 | 6 (miles-and-more +1.37 among them) | -> 207.68 |
| + the page end under an accordion part | 18 | 11 | 5 | -> **205.81** |

**With the code itself:** the same heights to the px on all 84. SWISS's sum over all 168 page-widths goes down by
4.12.

**The five page-widths that end further: accepted, as you set, for content outside the column.**

| Page-width (1440) | www | Before | With the column | Points | The content |
| --- | --- | --- | --- | --- | --- |
| ch/de newsletter | 2,015 | 2,043 (+1.39 %) | 2,065 (+2.48 %) | +1.09 | the form (long) |
| ch/en accessible-travel | 6,680 | 6,704 (+0.36 %) | 6,770 (+1.35 %) | +0.99 | a long page the narrower text makes longer (its link and paragraph lines) |
| ch/de unaccompanied-minors | 3,414 | 3,393 (-0.62 %) | 3,459 (+1.32 %) | +0.70 | the same (its table and text wrap) |
| ch/en food-and-beverage | 4,473 | 4,488 (+0.34 %) | 4,428 (-1.01 %) | +0.67 | www's divider module (-99) |
| ch/en green-fare | 6,240 | 6,150 (-1.44 %) | 6,109 (-2.10 %) | +0.66 | its fare tables (-86 / -56) |

**Closer, among others:**
- animals-travelling -2.23 -> -0.04 %;
- online-check-in de -1.93 -> -0.32 %;
- swiss-recraft-collection +1.68 -> -0.72 %;
- swiss-business +1.63 -> -0.84 %;
- swiss-economy +1.40 -> -0.58 %;
- miles-and-more -1.17 -> -0.67 %;
- premium-economy stays within the gate (-0.02 -> -0.27 %).

**Reach:** see item 5 (the census of the 1,253 served SWISS documents with an aside).

## Item 2: the two block options (shipped) and their READY lists

**The census of where www draws each layout:**
- **Narrower card text.** Every richtext limited-width in a two- to four-column view of the 18 B2B recordings: 30 of
  1,891 column-view texts. They were matched by text to every Columns Media of the 729 served documents:
  - the alliances page's Joint Venture cards (4 of 4 texts);
  - carry-on-baggage's Eurowings bags (3 of 3) in de/de, de/en and xx/en.
  - carry-on-baggage's "Non-compliant …" block is mixed on www (3 of 6 texts limited), so it is left out.
- **Blank lines in table cells.** Every maui-table cell of the recordings: only kuala-lumpur's flight table draws empty
  paragraphs around its cells' text. Its three copies (de/de, de/en, xx/de) carry it.
  - entertainment-on-board's and special-assistance's tables with empty lines sit inside closed accordions and draw
    nothing at load.
- No www pages beyond the recordings are on disk. The census reaches the unrecorded copies through their shared text.

**The options:**
- **narrow-text** (Columns Media, from 1025 px): its cells' running text over two thirds of the cell.
- **padded-cells** (Table Striped): 117 px above and below each cell's text, www's two blank lines. The table keeps its
  own height, not the five-column 840 px box.
- Both are registered in scripts/style-markers.js (BLOCK_OPTIONS, with labels) and drawn in b2b.css. They are inert
  until a document carries them.

**READY lists** (px as served -> with the row, www in brackets; with the code itself the same heights to the px):

| List | Document | 1440 | 390 |
| --- | --- | --- | --- |
| delta-so75-b2b-narrow-text | de/en lhg-history-alliances-and-joint-ventures | 5,017 -> 5,113 (5,171: -2.98 -> -1.12 %) | 6,029 unchanged (6,051) |
| | de/de carry-on-baggage | 4,756 -> 4,780 (4,798: -0.88 -> -0.38 %) | 6,578 unchanged (6,555) |
| | de/en carry-on-baggage | 4,617 -> 4,631 (4,699: -1.75 -> -1.45 %) | 6,557 unchanged (6,630) |
| | xx/en carry-on-baggage (not recorded) | 4,617 -> 4,631 | unchanged |
| delta-so75-b2b-padded-cells | de/en kuala-lumpur | 5,302 -> 5,284 (5,179: +2.37 -> +2.03 %) | 5,750 unchanged (5,588) |
| | de/de, xx/de kuala-lumpur (not recorded) | 5,360 -> 5,342 | unchanged |

**Dry runs** on DA's current copies (one GET per document, one per command, 13:40 CET): 1 inserted each, back byte for
byte; a second run 1 present each.

## Item 3: rail-fly's icons (the row written, HOLD)

**What www draws:** each of the three advantages is an imagelinklist headline, h4 heading-copytext-large
limited-width with its 24 px icon before the text. Our de/de and xx/de copies have the texts without the icons.

**The row** puts each icon at the start of its H4 (delta-so75-b2b-rail-fly-icons, with each picture's www source and
DA path):

| Picture | Source on www | DA path (lh-b2b) |
| --- | --- | --- |
| 1, "Bequem reisen …" | https://business.lufthansagroup.com/content/dam/lh/icons/irreg/lh-icon-train-front.svg | /media-da/b2b/icons/lh-icon-train-front.svg |
| 2, "Rail&Fly kann …" | https://business.lufthansagroup.com/content/dam/lh/icons/lh-icon-voucher.svg | /media-da/b2b/icons/lh-icon-voucher.svg |
| 3, "Freie Zugwahl …" | https://business.lufthansagroup.com/content/dam/lh/icons/train-side-a.svg | /media-da/b2b/icons/train-side-a.svg |

**Drafted** with a 24 x 24 stand-in icon and a rule for a heading that opens with a picture in a Columns Media cell:
the icon 24 px, 12 px to the text, two thirds of the cell from 1025 px.

| Rule variant | 1440 | 390 |
| --- | --- | --- |
| icon2 | 2,308 -> 2,402 (www 2,414: -4.39 -> -0.50 %) | 3,082 -> 3,196 (www 3,076: +0.20 -> +3.90 %) |
| icon3 (the headings at www's ~20 px lines) | -1.49 % | +2.47 % |

- **HOLD:** 390 fails the gate.
  - www sets the three stacked headlines in about 404 px; ours with the icons take about 500.
  - The stacked cells keep their gaps.
- The rule stays out of b2b.css while the row is held.
- Dry run on DA's two copies (13:40 CET): 3 inserted each, back byte for byte, 3 present on a second run.

## Item 4: the closing list

tools/reports/parity-2026-11-09/closing-so75-ema-cashub.txt holds every recorded page-width still more than 3 % off
www, with this order's code and rows (SWISS 1440 with the column, 390 with this order's code; Group for Business with
the code and the served rows, the option rows as drafted), each with its cause class.

- **SWISS: 21 page-widths.**
  - live data 2: the offers fare list;
  - function 5: pax-receipt's form, culinaryjourney's entry screen, us/en homepage's flight search and check-in;
  - Lufthansa side 13: the magazine's story grids, related stories and ad slots;
  - pattern under 3 page-widths 1: health-and-travel 1440 -4.32 %.
- **Group for Business: 5 page-widths.**
  - content 4: rail-fly 1440 -4.39 %, whose icons are missing (the row is held for 390); meals-on-board 390 -3.99 %,
    three copies, www's empty accordion item;
  - pattern under 3 page-widths 1: cash-and-points de/en 1440 -3.57 %, the quote's column view.
- travel-regulations and entertainment-on-board are under 3 % now: order 73's page-end rows are served (-2.07 % /
  -0.99 %).

## Item 5: reach

| Rule | Documents it applies to (census on the decorated pages) |
| --- | --- |
| SWISS column at 794 px | 1,007 of the 1,253 served SWISS documents with an aside (1,040 sections) |
| SWISS column at 781 px in a tab panel | 285 (748 panels) |
| SWISS page end under a card row | 140 |
| SWISS page end under an accordion part | 5: miles-and-more ch/de, en, fr, it; previous-day-check-in ch/en |
| B2B narrow-text, padded-cells | only the documents of their READY lists (4 / 3) |

**Unrecorded column samples** (8 documents at 1440, live against the code):
- immigration-regulations-uk it, baggage-tags it, sports-equipment it, simplified-onboard-service ja (tab panels),
  food-and-beverage/swiss-economy it and golf-traveller ja (card-row ends), previous-day-check-in en and miles-and-more de
  (accordion-part ends).
- Each gets longer by +16 to +121 px, as the narrower column wraps the text.
- The breakage flags are the same live and with the code.

## Sum and median at the end of order 75 (all recorded page-widths, every section loaded)

| Brand | Order 74 start (10:05 CET) | Order 74 end | Order 75 end | Lufthansa's part | Ours |
| --- | --- | --- | --- | --- | --- |
| SWISS (168) | 529.24, median 0.84 % | 526.05, median 0.79 % | 514.64, median 0.73 % | 38 page-widths, 407.78 | 130, 106.86 |
| Group for Business (198) | 172.27, median 0.49 % | 145.86, median 0.39 % | 142.86, median 0.38 % | 21, 26.38 | 177, 116.47 |

- **SWISS:** -11.41 since order 74's end. Of that, 4.12 is the column; the rest is order 73's page-end rows, now
  served, and load-to-load variation.
- **Group for Business:** -3.00, the option rows as drafted.
