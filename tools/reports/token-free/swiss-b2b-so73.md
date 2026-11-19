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
