# Standing order 73: the content differences as READY rows for SWISS and Group for Business (2026-11-19)

Code: styles/themes/b2b.css (two option rules that only reach documents carrying the options; inert until the rows land),
test/swiss-b2b-so73.test.mjs. Lists: tools/reports/parity-2026-11-09/delta-so73-*.txt with their .json.
Every row is token-free: a block, a block option, a section style, or a block taken out. No marker goes in.

**Method:**
- **Census:** every served document fetched once from b2b.turnsthe.page (733) and swiss.turnsthe.page (5,335) at about
  08:05 CET, read with linkedom (so73/vcen.mjs).
- **Renders:** so73/fulld.mjs, which is order 71's full.mjs plus DOCS=<dir>: a page whose draft exists gets that main.
  - A page-width is read only once every section, block and picture has loaded and the height has held for 5 reads.
  - Unhinted text, consent accepted.
  - Airline hosts, www.* and lh-proxy are refused per request. None was sent.
  - The control (as served) and the draft run in the same batch.
- **Code:** the B2B rows' CSS is in this checkout and was used as a CODE override for the drafts that need it.
- **Gate:** across the brand's recorded page-widths, |after %| - |before %| <= 0.5, and the sum of |% off www| down.
  - A row moves only its own document. Its recorded page-widths are its gate.
  - The unrecorded copies are listed with their px as served and with the row.
- **DA:** read only, one GET per document. Every row was dry-run on DA's current copy with
  tools/importer/text-inserts-apply.mjs:
  - inserted once, and "without the inserts DA's copy byte for byte: true";
  - a second run says "present";
  - no {…} in any insert.

## Item 1: videos (www embeds, ours shows a link)

**Census:**
- **Group for Business:** 81 documents have a video link outside their footer, and all 81 were rendered at 1440.
  - www's side: the recordings b2b-parity-001 to -018 (www's iframes and video elements).
  - A plain link where www embeds: cash-and-points de/en and de/de, plus their xx/en and xx/de copies. That is 4
    documents.
- **SWISS:** 293 documents have a video link outside an Embed block, and all 293 were rendered at 1440.
  - www's side: the import snapshots of www.swiss.com (2,812 ch/<lang> pages; 73 with a YouTube iframe, 177 with video
    elements), matched to every served copy of the page.
  - A plain link where www embeds: /ch/de/womenseuro22 only (1 document).
- **Not rows:**
  - B2B:
    - partner-plus-benefit: www's recording has a picture teaser there, not a video.
    - The SWISS experts page's picture, H4 and paragraph each link to a video. That is a teaser as imported, and the
      page is not recorded.
    - The share link on entertainment-on-board, and the card links on first-class and the mx news page.
  - SWISS:
    - The teaser cards' "Watch on YouTube" links: www's teasers carry the player and the link, and so do ours.
    - new-lounges-zurich's link to its mini series: www has a link there too.
    - The magazine's links in running text: there is no www DOM on disk for them.
  - Players with 0 x 0 px boxes on swiss-economy, food-and-beverage/swiss-business and baggage-irregularities are inside
    tab panels that are closed.

**The size www calls for:**
- B2B: www's iframe component, at most 560 px wide and 315 px tall at every width, at the text's left edge.
- Our Embed block draws 16:9 over the content width, which is 1264 x 711 at 1440.
- So the rows use the Embed with **option small**: the b2b.css rule `body.brand-b2b main .embed.small
  .media-embed-youtube` sets max-width 560 px, height 315 px.
- Without the option, de/en 1440 gets +701 px and de/de 1440 goes +10.25 points.

**READY lists:**

| List | Path | 1440: www / as served / with the row | 390: www / as served / with the row |
| --- | --- | --- | --- |
| delta-so73-b2b-video-embeds | /de/en/program/partner-plus-benefit/cash-and-points | 6,603 / 5,988 (-9.31 %) / 6,293 (-4.69 %) | 8,957 / 8,559 (-4.44 %) / 8,846 (-1.24 %) |
| delta-so73-b2b-video-embeds | /xx/en/program/partner-plus-benefit/cash-and-points | not recorded / 5,988 / 6,293 (+305) | not recorded / 8,559 / 8,846 (+287) |
| delta-so73-b2b-content (with the FAQ, item 2) | /de/de/program/partner-plus-benefit/cash-and-points | 6,839 / 6,984 (+2.12 %) / 6,681 (-2.31 %) | 9,519 / 10,657 (+11.96 %) / 9,568 (+0.51 %) |
| delta-so73-b2b-content (with the FAQ, item 2) | /xx/de/program/partner-plus-benefit/cash-and-points | not recorded / 6,984 / 6,681 (-303) | not recorded / 10,657 / 9,568 (-1,089) |
| delta-so73-swiss-video-embeds | /ch/de/womenseuro22 | not recorded / 1,937 / 2,404 (+467: www's 16:9 player over the column) | not recorded / 1,835 / 1,960 (+125) |

- **HOLD:** the de/de and xx/de video alone, in the video list. It takes de/de 1440 +2.12 -> +6.58 % (+4.46 points),
  because that copy is long for its FAQ. It is READY only together with the FAQ, in the content list.

## Item 2: content causes a row closes

| Brand / page | Cause (www) | Row | Recorded page-widths: www / as served / with the row |
| --- | --- | --- | --- |
| B2B cash-and-points de/de (and xx/de) | www's FAQ is an accordion of five questions. Ours has the five answers as plain paragraphs without their questions (+633 px) | accordion-columns faq with www's questions, plus item 1's video | 1440 6,839 / 6,984 (+2.12 %) / 6,681 (-2.31 %) (+0.19 points); 390 9,519 / 10,657 (+11.96 %) / 9,568 (+0.51 %) (-11.44) |
| B2B A350-1000 news de/de (and de/en) | www's two-column view: the text and its table on the left, the picture on the right | Table Striped option beside-end, first row picture / text, then the table's rows; b2b.css draws it as www's maui-table | 1440 2,058 / 2,827 (+37.37 %) / 2,071 (+0.63 %) (-36.73); 390 2,803 / 2,797 (-0.21 %) / 2,797 (0) |
| SWISS green-fare (10 copies) | www's H3s are heading-small; ours are copytext-large | section style h3-large on the first column section | ch/en 1440 6,240 / 6,070 (-2.72 %) / 6,150 (-1.44 %) (-1.28); 390 7,481 / 7,490 (+0.12 %) / 7,517 (+0.48 %) (+0.36) |
| SWISS new-destinations (11 copies) | A grey section holds only a Spacer block (L, 185 px drawn) before the Rijeka stage; www has 136 px | that section goes | ch/de 1440 6,070 / 6,287 (+3.57 %) / 6,102 (+0.53 %) (-3.05); 390 5,676 / 5,837 (+2.84 %) / 5,692 (+0.28 %) (-2.55) |
| SWISS newsletter (11 copies) | www's sign-up text runs in the column. Ours sits in a 622 px sidebar Columns Media with an empty second cell | the cell's content as the section's own text | ch/de 1440 2,015 / 2,111 (+4.76 %) / 2,043 (+1.39 %) (-3.37); 390 2,176 / 2,199 (+1.06 %) / 2,163 (-0.60 %) (-0.46) |

**The A350 option's code** (b2b.css):
- From 768 px: the rows at their own height (padding-bottom 32 px instead of the campaign spec tables' 68), in a box
  40 px taller above and below (www's maui-table box).
- Below 768 px: the stack has the served copy's gaps. The table is 67 px under the text, and the picture is 40 px under
  the table at its own aspect, with no margin after it.
- Without this code the row takes 390 +2.43 points further.
- Reach: no served B2B document carries beside or beside-end today.

**Held, with figures:**
- **SWISS green-fare h2-large** (www's H2s are heading-medium): 390 +0.12 -> +4.46 % (+4.34 points). 1440 alone would be
  -2.72 -> +0.58 %.
- **SWISS newsletter, also joining "Sie haben sich bereits…" into the column:** 1440 +0.20 %, but 390 -1.70 % (+0.64
  points).
- **SWISS food-and-beverage under its flush stage** (www's divider module, -99 px):

  | Carrier | 1440 | 390 |
  | --- | --- | --- |
  | The stage not flush | +0.34 -> +2.57 % | +0.34 -> +0.70 % |
  | Divider above the column | +1.63 % | +1.20 % |
  | Both | +3.87 % | +1.56 % |

  Today's page is +0.34 % at both widths, so this waits for the 794 px column.
- **SWISS new-destinations with the Spacer block M** instead of taking the section out: -60 px, 1440 +2.59 %. The section
  gone is closer.

The rest of ranks 1 to 60 that a row could touch:
- swiss-premium-economy: www's empty line above the lead. Putting one in would be a marker.
- kuala-lumpur: www's empty lines in its table cells. Same.
- The magazine's related stories and ad slots: www's own content and function.

None of these gets a row.

## Item 2, continued: four more rows (pushed with item 3)

| List | Path | 1440: www / as served / with the row | 390: www / as served / with the row |
| --- | --- | --- | --- |
| delta-so73-swiss-page-ends | /ch/de/prepare/travel-regulations (and its 9 copies, not recorded: +53 / +73 px, ch/es +45 / +45) | 1,547 / 1,462 (-5.49 %) / 1,515 (-2.07 %) | 2,696 / 2,650 (-1.71 %) / 2,723 (+1.00 %) |
| delta-so73-swiss-page-ends | /ch/de/fly/on-board/entertainment-on-board | 2,554 / 2,509 (-1.76 %) / 2,602 (+1.88 %) (+0.12 points) | 2,837 / 2,716 (-4.27 %) / 2,809 (-0.99 %) |
| delta-so73-b2b-headings | /de/en/news/celebrating-shared-stories/sap | 6,211 / 6,420 (+3.36 %) / 6,331 (+1.93 %) | 8,819 / 9,016 (+2.23 %) / 8,930 (+1.26 %) |

- **travel-regulations:** www ends the page with an empty four-column view after the cards, in every ch/<lang> import
  snapshot. The row puts a Spacer block (M) at the end of the last section. As a section of its own, 390 would go
  +1.08 points further.
- **entertainment-on-board ch/de:** www ends the page with an empty padded section after the tab set. That is the German
  page only; the other snapshots end at the tab set. The row adds a section that holds a Spacer block (M).
- **sap:** www's H2s are heading-small. The row adds section style h2-compact to the two sections that hold them.
  - The German copy (not recorded, with no www classes on disk) is not in the row. Drafted the same way it goes
    6,822 to 6,733 / 9,984 to 9,866.

## Item 3: market copies against their source

**Method:**
- Pairs: every market-root document whose path exists in the source of its language. Not nav, footer or fragments.
  - SWISS: /<market>/<lang>/<path> against /ch/<lang>/<path>. That gives 243 pairs, 216 of them homepages.
  - B2B: /<market>/<lang>/<path> against /de/<lang>/<path>. That gives 115 pairs.
- Every copy and every source was rendered at 1440 and 390 with every section loaded: 556 + 436 loads.
- Turnstile was aborted on B2B. The doubtful loads were read again alone, and every one came back the same.
- The documents were compared by sections and their classes, blocks with options, headings by level, pictures and text
  length.
- The full list, with every page-width more than 1 % apart and its cause, is
  tools/reports/token-free/swiss-b2b-so73-pairs.tsv.

**SWISS: 486 page-widths, 459 more than 1 % apart.**
- **421 of them are the 216 market homepages:** -38.37 to +9.75 %, median -4.77 %.
  - Each was imported from its own www page, with its own offers and fewer sections than ch's.
  - The two recorded ones draw their own www page: de/de 1440 -1.23 %, us/en 1440 -3.13 %. www's us/en is 4,467 at 1440
    against ch/en's 4,412, ours 4,327 / 4,346.
- **37 are other pages whose copy text is the market's own:**
  - vouchers ca/en, ca/fr: +47 to +73 %, with an FAQ and a Columns Media of their own;
  - airportr gb/en: -37 / -45 %, a shorter page;
  - the kr/it and kr/fr legal and conditions pages: other versions;
  - hold-the-booking ca/us: prices in their currency;
  - ro/de fly/on-board: its own cards;
  - and the rest.
- **1 is drift:** /ar/de/terms-conditions/legal-notice 390 +1.01 %, and the documents are identical.
  - The breadcrumb's first item is the market homepage's whole title, two lines on phones. 29 of the 32 market de/en
    homepages with pages under them lack the source's Breadcrumb title "Home".
  - READY: **delta-so73-swiss-market-breadcrumb** (29 homepages). The homepages draw as before.
  - Under them, with the label set in the page: ar/de legal-notice 390 2,612 to 2,588 (the source draws 2,586), ar/de
    profile-conditions 3,355 to 3,331, ro/de fly/on-board 4,129 to 4,105. English labels fit on one line.

**Group for Business: 227 page-widths, 43 more than 1 % apart.**
- **Drift, rows READY in delta-so73-b2b-market-copies:**
  - xx/en and xx/de news, 1440 -1.13 / -1.09 %. Empty tab sections, wide-text tab sections, and the metadata in a section
    of its own. With the row: 4,130 to 4,177 and 4,284 to 4,331, the sources to the px. 390 is recorded (b2b-parity-004)
    and unchanged.
  - al/de video-gallery, 1440 -4.73 %. The stage picture is linked to www's broken /gc/null/de. With the link taken off:
    3,324 to 3,489, the source to the px. 390 unchanged.
- **Data:** xx/de and xx/en contact, 390 -6.15 / -6.56 %, with identical documents. The hotline finder has no opening
  hours for the xx market: the hours table is missing (-256 px).
- **www's own differences:** gb/en programs-and-groups. www itself draws gb/en 7,043 and de/en 1,364 at 390
  (b2b-parity-013).
- **The copies' own content (38 page-widths):**
  - the al/de pages: more cards, other texts;
  - the ch/en experts pages: other sections and pictures;
  - cn/en cash-and-points: a video;
  - mx/en privacy and news;
  - the us/en and ca/en homepages;
  - the SWISS Senses start-of-booking xx/en copies: newer text;
  - entertainment-on-board ch/en and xx/en at 1440: extra panels and market sections. At 390 all three draw www's 2,039
    within 24 px.

## Item 4: what is left between each brand and www

**How this is figured:**
- Today's heights are every recorded page-width with every section loaded, at about 09:00 CET (SWISS 168, Group for
  Business 198).
- "With the rows" puts this order's READY rows in: their drafts' heights on the page-widths they move.
- Each remaining page-width was put on one side by its cause, found in orders 70 to 73:
  - **Ours:** a row or a theme rule can still close it.
  - **Lufthansa's:** content, live data or a function that only Lufthansa or their systems decide.
- The two sides add up to the brand's sum of |% off www|.

### SWISS: today 539.74 (median 0.89 %), with this order's rows 522.09 (median 0.84 %)

**Lufthansa's: 38 page-widths, 409.51 of the 522.09 (78 %).**

| Page | Width | www / ours | % off | What decides it |
| --- | --- | --- | --- | --- |
| /ch/en/offers | 390 / 1440 | 31,952 / 1,585; 32,383 / 2,311 | -95.04 / -92.86 | live data: www lists every priced fare from its fares API |
| /ch/de/book-and-manage/pax-receipt | 390 / 1440 | 2,402 / 1,707; 2,234 / 1,682 | -28.93 / -24.71 | function: www's receipt request form (about 800 px); ours links to it |
| magazine overview, /travel, /inside-swiss (de, en) | 390 | 10,414 / 8,959 and alike | -11.83 to -13.97 | content and function: www's story grid with advertisement slots |
| magazine articles (a350-special-livery de/en, hello-boston, up-front-and-flying-high, jungfrau-region, behind-the-wings) | 390 / 1440 | e.g. 7,834 / 6,695 | -14.54 to +7.86 | content: www's related stories under the article (ad slots on phones) |
| /ch/de/culinaryjourney | 390 | 1,396 / 1,513 | +8.38 | function: the micro-frontend's entry screen |
| homepages ch/en, us/en, de/de | 390 / 1440 | e.g. us/en 4,920 / 4,752 | -3.41 to +2.57 | function: the stage's flight search and the check-in entry (apps) |
| arrival-departure, online-check-in | 390 / 1440 | 1,690 / 1,644; 3,728 / 3,656 | -2.72 / -1.93 | function: the flight status and check-in entries |

**Ours: 130 page-widths, 112.61.**
- 45 are more than 1 % off, for 81.94 of the sum. The furthest, with their causes:
  - **The held 794 px column.** 7 page-widths would go +0.66 to +1.80 points further today (order 72). It waits for the
    content in four of them: premium-economy's empty line, food-and-beverage's divider, and the swiss-first and
    miles-and-more page ends.
  - **Styling still open (theme rules):**
    - health-and-travel en 1440 -4.73 %: the aside's teasers and the page end (-112);
    - imprint de 390 +3.28 % and 1440 +2.32 %: the page end (+44 / +29);
    - accessibility-statement 1440 -2.93 % and privacy-statement 1440 -2.52 % / 390 -2.01 %: running-text line heights;
    - animals-travelling 1440 -2.23 % / 390 -2.06 %: the open tab panel's sections;
    - group-travel-and-charter 1440 -2.46 %; rebook 390 +2.66 %; terms-conditions de/en 1440 +1.93 / +2.18 %; the
      vouchers FAQ end 390 +2.12 %.
  - **Not traced yet:** swiss-airrail 1440 -2.92 % (-80 px in the intro, -165 in "Travelling by SWISS Air Rail").
- **Content that only a marker could carry** (so no row under the token-free rule): swiss-premium-economy 390 -2.02 %,
  which is www's empty line above the lead.
- **SWISS is done on our side when** the column and those rules have shipped. What then remains is the 409.51 above
  plus the content-only lines.

### Group for Business: today 228.07 (median 0.49 %), with this order's rows 169.86 (median 0.49 %)

**Lufthansa's: 16 page-widths, 11.91.**
- The contact pages' hotline data and www's contact tiles: contact de/en 390 +1.88 %, 1440 -1.21 %; de/de 1440 -1.14 %.
- The homepages' login and search entries: de/de 1440 -1.28 %.
- businesstogo's core form (Turnstile).

**Ours: 182 page-widths, 158.07.**
- 60 are more than 1 % off, for 121.75 of the sum. The furthest, with their causes:
  - **cash-and-points de/en 1440 -4.69 %** after the video row: the 840 px table box against www's rows (order 72).
  - **rail-fly de/de 1440 -4.39 %:** -58 and -50 px at the H2s after its header-row tables.
  - **meals-on-board 390 -3.99 %** (three copies): the tab set.
  - **lhg-ita-airways en 1440 +3.79 % / 390 +2.68 %:** 24 px more before each news H2 (a B2B rule).
  - **carry-on-baggage** de/de +3.38 / +3.16 %, de/en +2.68 / +2.10 %: the table boxes.
  - **lhg-history-alliances 1440 -2.98 %:** -110 at "Beyond the skies".
  - **our-european-fares 390 +2.53 % (de +2.16 %):** +240 at "Exclusive benefits for status customers".
- **Held from order 72:** the footer under a closing card grid (www's 21 to 82 px), and the Allegris last section's H1
  gap.
- **Content that only a marker could carry:** kuala-lumpur +2.90 / +2.37 %, www's empty lines in the table cells.
- **Group for Business is done on our side when** those rules have shipped. Below them the brand's median is already
  0.49 %, and Lufthansa's part is small (11.91).
