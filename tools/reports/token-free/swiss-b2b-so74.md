# Standing order 74: SWISS and Group for Business, our part (2026-11-19)

Code: styles/themes/b2b.css, styles/themes/swiss.css, test/swiss-b2b-so74.test.mjs. Lists:
tools/reports/parity-2026-11-09/delta-so74-b2b-spacing-lost.{txt,json}, spacing-lost-so74.txt.

**Method.**
- Heights are page-widths with every section, block and picture loaded (so74/fulld.mjs, order 71's full load).
- Candidates were gated alone in the same load: each CSS step is followed by a step that takes it out again (pop.js),
  and the height after it equals the height before (checked on every row).
- Shipped rules were gated again with the code itself (a copy of this worktree's blocks, scripts and styles served in
  place of the host's) against the live host on all recorded page-widths of the brand.
- Gate: on every recorded page-width |% after| - |% before| <= 0.5, and the brand's sum of |% off www| down.
- Where a page drifts: our boxes matched to www's recorded boxes by text (bcmp.py), and www's full-page PNG cropped
  next to a shot of ours (crop.mjs, shot.mjs; www read only from the recordings on disk).
- Every render refused airline hosts, www.* and lh-proxy per request. None was sent.

**Baseline (10:05 CET, every section loaded):** SWISS 168 page-widths, sum 529.24, median 0.84 %; Group for Business
198, sum 172.27, median 0.49 %. Order 73's SWISS content rows were served by then; its page-end list (travel-regulations,
entertainment-on-board de) was not.

## Item 1: SWISS

### The 794 px column (HOLD again, with the scopes tried)

www's recorded sidebar pages draw their column text at 794 px when the column is not a tab panel, and at 781 px in a
tab panel (741 px inside its parts): swiss-business, swiss-economy, entertainment-on-board, baggage-irregularities,
animals-travelling. Ours is 843 px on every sidebar page. Three scopes, toggled on all 84 recorded 1440 page-widths
(below 1025 px nothing changes):

| Scope | Moved | Closer | More than 0.5 points further | Sum of \|%\| (84 at 1440) |
| --- | --- | --- | --- | --- |
| A: the column, not in a tab panel, not a sidebar Columns Media | 14 | 5 | 8 (worst premium-economy +1.80) | 216.06 -> 221.41 |
| C: A for the running text only (default content) | 10 | 4 | 5 (worst accessible-travel +1.32) | 216.06 -> 219.32 |
| D: A for the blocks only (card rows, tables) | 7 | 2 | 4 (worst premium-economy +2.33) | 216.06 -> 220.52 |

- With the column the rows draw at www's pitch: swiss-first's column boxes sit 1 px from www's from the stage to the
  last card row. What fails is outside the column: each failing page is off www for another reason, in the
  direction the narrower column moves it.
  - premium-economy: www's empty line above the lead (-42, item 4).
  - swiss-first, miles-and-more: the page end under the last card row (www 114 px, ours about 50).
  - food-and-beverage: www's divider module (-99).
  - green-fare: the fare tables (-86 / -56).
  - newsletter: the form (long).
  - unaccompanied-minors, accessible-travel: long pages that the narrower text makes longer.
- **The page end under the column** (tried with the column, from 1025 px): the last sidebar section 64 px longer at
  its end, as www's space under swiss-first's last card row. On all 84 1440 page-widths it fails alone (7 further, worst
  additional-bag and upgrade-options +2.01: their columns end with text, and www draws no such space there), and with
  the column (8 further). Where the column ends with a card row (swiss-first, premium-economy) it is the right space:
  swiss-first with the column -1.53 % would be -0.05 %, premium-economy -1.82 % -> -0.27 %. The column would still fail
  newsletter, unaccompanied-minors, miles-and-more, food-and-beverage, green-fare and accessible-travel.
- **So the column stays held.** It can pass only with the content causes closed (premium-economy's line,
  food-and-beverage's divider, green-fare's fare tables, newsletter's form) or with your word on those pages.

### Shipped: a footnote list at the page end in small print (swiss.css)

- www draws the "1." footnote under ch/de imprint's supervisory authority in copytext-small; ours drew it as body
  text (crops of swiss-parity-002a's 390 PNG and ours side by side).
- The rule: on a page whose text holds a footnote link (`a[href^="#"] > sup`), a numbered list that ends the page's
  last section is small print.
- Reach: of the 5,335 served SWISS documents 57 have a footnote link; on the decorated pages the rule matches one list,
  in ch/de terms-conditions/imprint (census on all 57).
- Gate: ch/de imprint 1440 2,247 -> 2,244 (www 2,196: +2.32 -> +2.19 %), 390 2,204 -> 2,196 (www 2,134: +3.28 ->
  +2.91 %). No other recorded page-width has the shape. With the code itself: 2,244 / 2,196, to the px.

### Shipped: a Profile Tabs panel's lists over two thirds of the content (swiss.css, from 1025 px)

- swiss-airrail traced: -165 at 1440 in "Travelling by SWISS Air Rail". www's tab panel text is a richtext
  limited-width, two thirds of the content; ours ran the panel's list over the whole 1264 px (crops of
  swiss-parity-002b's 1440 PNG and ours). new-destinations' tabs on www are limited-width too.
- The rule: a list in a Profile Tabs (content) panel at 66 % from 1025 px, as the running text elsewhere.
- Gate (in-page toggle on the recorded page-widths with a Profile Tabs panel; no other page has one):
  - ch/en swiss-airrail 1440: 6,086 -> 6,284 (www 6,269: -2.92 -> +0.24 %).
  - ch/de new-destinations 1440: unchanged.
  - 390: unchanged (from 1025 px).
- The panel's paragraphs too: held. new-destinations 1440 would go +0.53 -> +1.61 %.
- Reach: 121 lists in 33 of the 55 served documents with Profile Tabs (the airrail, payment-options-at-the-airport and
  swiss-senses destinations copies).
- Samples (5 unrecorded documents, 1440 and 390): ch/de swiss-airrail 1440 +154 px, the others unchanged. The flags
  are the same live and with the code (screen-reader labels, the hero's crop, 16 px card overlaps on swiss-senses
  business), so none comes from the rule.

### Traced, not shipped

| Page-width | www / ours | Where it drifts | What was tried |
| --- | --- | --- | --- |
| swiss-airrail 1440 | 6,269 / 6,086 (-2.92 %) | the intro, -40: www's paragraph before the flight search is the lead (copytext-large 18 / 30, 120 px), ours body text (66 px); then -40 above "Your benefits"; -165 in "Travelling by SWISS Air Rail" (+165 at 390; shipped above for 1440) | the title's paragraph as the lead when a Columns Media, a flight search or a heading follows it, where www draws a lead on 4 of 6 recorded pages with that shape (group-travel-and-charter, rebook, swiss-airrail, arrival-departure; imprint and the FAQ hub not): 1440 all closer or within, but 390 group-travel-and-charter +1.97, rebook +1.16, swiss-airrail +0.66 (long at 390 for other reasons): HOLD |
| privacy-statement 1440 / 390 | 16,127 / 15,720 (-2.52 %); 29,546 / 28,951 (-2.01 %) | www's H2s heading-medium (40 px lines, ours 31), its H3s heading-small (31 px, ours 20) | the row h3-large on its section (all 11 copies): it draws heading-medium (40 px) on this page, not www's heading-small: 1440 -> 16,515 (+2.41 %), 390 -> 29,867 (+1.09 %). Closer in height, wrong in size: HOLD |
| accessibility-statement 1440 | 5,901 / 5,728 (-2.93 %) | www's H2s heading-medium (40 / 79 px, ours 31): -12 to -58 per H2 | no carrier: on SWISS flow pages h2-large draws heading-large, and the default is heading-small |
| health-and-travel 1440 | 3,150 / 3,001 (-4.73 %) | the page end (the column's last part) | the page-end rule above: -4.73 -> -2.70 %, but it fails elsewhere |
| imprint | +2.32 / +3.28 % | the footnote list (shipped above) and the H3s' text lines | - |

## Item 2: Group for Business

### Shipped (b2b.css): four gaps as www's

| Rule | www (recordings) | Ours before | Reach (729 served documents, decorated) |
| --- | --- | --- | --- |
| 1. A table followed by a heading: 71 px under its last row | maui-table box = rows + 40 above and below, the heading 31 under the box (cash-and-points de/en, de/de 1440: 71) | 40 | 5 documents: the cash-and-points copies (cn/en, de/de, de/en, xx/de, xx/en) |
| 2. A button right before a Spacer: no margin of its own | the link component has none; the Spacer is the gap (lhg-ita-airways: button to H2 68 px) | 92 | 25 in 23 documents |
| 3. An accordion right before a Spacer: no block gap above it | the same (lhg-ita-airways' route accordions: 76 / 140 px to the next heading) | 104 / 164 | 31 in 21 documents |
| 4. A column view that opens right after an accordion: no 40 px edge | www's view starts at the accordion's end (carry-on-baggage: "Non-compliant…" 213 px under the H2 above the accordion, ours 349) | 40 px mark | 36 in 30 documents |

**Gates** (code against live, every section loaded, all 198 recorded page-widths):

| Rules | Moved | Closer | Most further | Sum of \|% off www\| |
| --- | --- | --- | --- | --- |
| 1 to 3 | 7 | 3 | +0.48 (program/experts 1440) | 169.86 -> 167.11 |
| 4, on top of 1 to 3 | 21 | 18 | +0.03 (intermediaries-start-of-booking de/en 1440) | 167.11 -> 154.50 |

- lhg-ita-airways (the news H2 gap): 1440 4,600 -> 4,504 (www 4,432: +3.79 -> +1.62 %), 390 6,236 -> 6,140 (www 6,073:
  +2.68 -> +1.10 %). What is left: +54 before the first H2, the lead section's Spacer and section gap above the grey
  band (taking the section gap away there fails 6 page-widths: celebrating-shared-stories, cash-and-points).
- carry-on-baggage: de/en 1440 4,825 -> 4,761 (www 4,699: +2.68 -> +1.32 %), de/de 4,960 -> 4,896 (www 4,798: +3.38
  -> +2.04 %); 390 de/en +2.10 -> +1.43 %, de/de +3.16 -> +2.49 %.
- cash-and-points de/en 1440 6,293 -> 6,276 (-4.69 -> -4.95 %, +0.26: the table rule +31, the button and accordion
  rules -24 each).
- Every moved page-width matched its in-page toggle to the px with the code itself.

### Tried and held (in-page toggles, all 198 page-widths)

| Candidate | Result |
| --- | --- |
| 40 px more under every table (www's box = rows + 80) | 12 moved, 7 further: carry-on-baggage +2.50 / +2.55 (1440), +1.83 / +1.81 (390); our-european-fares +0.84 / +0.88; kuala-lumpur +0.77. Our carry-on rows are shorter than www's but the page is long elsewhere; held, rule 1 is the part that passes |
| rail-fly's header-row table 72 px under the H2 and 40 px under the table | 1440 2,308 -> 2,340 (www 2,414: -4.39 -> -3.06 %), 390 3,082 -> 3,114 (www 3,076: +0.20 -> +1.24 %, +1.04): HOLD |
| A spaced accordion without its 40 px above and below | carry-on-baggage de/en 1440 +2.68 -> +0.13 %, but businesstogo de/de, de/en, xx/de 1440 +0.79 / +0.81 / +0.79: HOLD |
| Any block before a Spacer without a gap | lhg-history de/en 1440 +1.42, 390 +0.57: held; rule 3 is the accordion part |
| A section ending in a Spacer before a grey band without its section gap | 14 moved, 6 further (celebrating-shared-stories +0.62 to +0.90, cash-and-points +0.54 to +0.73): HOLD |

### What the rest is (traced, no rule)

- **carry-on-baggage** (still +1.3 to +2.5 %): www's table cells set their two lines 34 px apart and pad more below
  (row "1 personal item / max. 40 x 30 x 15 cm": 156 px on www, 136 ours, lines 48 px apart on ours); the
  accordion's spaced option (40 px above and below).
- **our-european-fares 390 +2.53 % (de +2.16 %):** +240 (de +113) inside the fare-structure part, between "Discover our
  short- and medium-haul fare structure" and "Exclusive benefits for status customers".
- **lhg-history-alliances 1440 -2.98 %:** -110 between "Deepening ties" and "Beyond the skies".
  - www's four Joint Venture cards set their text limited-width, two thirds of each card (b2b-parity-003's HTML: richtext
    limited-width in a three-column view), so each text runs two or three lines longer. Ours runs the full card width.
  - The document had {limited-width} on those four texts until the cleanup took the markers out (so66's copy of 17
    Nov). Nothing draws it now, and no carrier gives a card's text that width.
  - It is not www's rule for card text: of 1,891 column-view texts in the B2B recordings, 30 are limited-width, in 7
    page-recordings. So it would take a new Columns Media option for one document. Not written; it is in the
    spacing-lost list's spirit (a width marker, not a spacer).
- **cash-and-points' customer quote (READY: delta-so74-b2b-quote-author):**
  - Our five copies run the author's name and company together ("Karsten WestermannCimpress Deutschland GmbH"). The
    import lost www's line break, and the row puts it back.
  - de/en 1440 6,276 -> 6,295 (www 6,603: -4.95 -> -4.66 %), 390 8,829 -> 8,847 (-1.43 -> -1.23 %).
  - de/de 1440 6,664 -> 6,683 (-2.56 -> -2.28 %), 390 9,551 -> 9,569 (+0.34 -> +0.53 %, +0.19).
  - The unrecorded xx/en, xx/de and cn/en copies: +18 / +19 px each.
  - Dry run on DA's five copies (one GET each, 11:47 CET): 1 inserted each, back byte for byte, a second run 1 present.
  - What is left at the quote: www's column view, 82 px above the quote (ours 36) and 88 px below the author (ours 26).
    Moving the quote into the author's section (space-m) would put it in that section's small print, which www
    doesn't. Not in the row.
- **kuala-lumpur** (+2.37 / +2.90 %): see item 4.
- **The card-grid footer** (order 72's hold): www's 21 to 82 px for the same block shapes; not tried again.
- **meals-on-board 390 -3.99 %, 1440 -1.96 %** (three copies): www's accordion has an item with an empty title between
  Eurowings and Lufthansa, one row more (about 56 px, b2b-parity-010's 390 PNG). Content on www's side, and an empty
  item is nothing a row should add: Lufthansa's part.

### The Allegris last section: no row possible

The order asks for READY rows that remove the empty 40 px paragraph under the H1. **That paragraph is not in the
documents.** Under "What's next for Lufthansa Allegris" the served copy (and DA's) has the H1 and then the Columns
Media, nothing between. The 40 px is the column view's start mark that token-free.js draws before a Columns Media in
the page's flow (B2B's columnViews). Order 72's line "Its empty 40 px paragraph is in the documents" was wrong. A row
can't take out what the code draws; the theme rule for it (the H1 gap at 16 px) was held in order 72 (9 page-widths
further: contact, lhg-invoice-receipt-download, partner-plus-benefit, where www's gap is ours).

## Item 3: spacing lost when markers came out

The census, the list and its groups are in tools/reports/parity-2026-11-09/spacing-lost-so74.txt.
- Source: the served copies of 17 Nov (so67 SWISS 5,332, so66 B2B 733) still held the markers earlier rows had put in;
  today's copies (19 Nov) hold none. 18 SWISS spacer markers in 12 documents, 38 B2B spacer and column markers in 18
  documents.
- The documents from before the collapse pass (9 Nov) are only in DA's backup folders. Reading them would take one read
  per document, and a loop of DA reads is refused here. The pass itself was checked document by document when it ran.
- **SWISS:** every one is drawn: the aside starts by the Spacer block plus order 69's rule, the fleet hub's two by order
  67's rule.
- **B2B:** 9 places in 8 documents draw nothing now.

**READY: delta-so74-b2b-spacing-lost** (a Spacer block at the marker's place; px as served -> with the row, www):

| Document | 1440 | 390 |
| --- | --- | --- |
| /de/de/homepage (Spacer from-768 for {spacer-25 from-768}) | 5,310 -> 5,371 (5,379: -1.28 -> -0.15 %) | 8,249 (unchanged) |
| /de/en/homepage (the same) | 5,163 -> 5,224 (5,200: -0.71 -> +0.46 %) | 7,876 (unchanged) |
| /de/de/travel-solutions/lufthansa-group-airlines ({spacer-30}) | 4,026 -> 4,087 (4,071: -1.11 -> +0.39 %) | 5,386 -> 5,447 (5,454: -1.25 -> -0.13 %) |
| /de/en/about-us/help-alliance ({spacer-30}) | 2,309 -> 2,370 (2,347: -1.62 -> +0.98 %) | 3,319 -> 3,380 (3,348: -0.87 -> +0.96 %, +0.09) |

- Drafts: the served copy with the Spacer block, the unchanged copy drafted first (equal to the served heights).
- Dry run on DA's current copies (four read-only GETs, one per command, 10:39 CET): "1 inserted" each, back byte for
  byte; a second run "1 present" each.

**Held:**
- **lufthansa-group-airlines de/en:** 1440 4,016 -> 4,077 (www 4,013: +0.07 -> +1.59 %).
- **/de/en/program:** the carrier draws 85 px where the markers drew 17. The height gets closer (1440 -2.33 -> +1.80 %),
  but the gap would be wrong.
- **Not restored:** lhg-history de/de and intermediaries-start-of-booking (already long), and celebrating de/de (a
  Spacer there does not move the page).

## Item 4: premium-economy's empty line, kuala-lumpur's empty cell lines

- **premium-economy:** www draws the space. Its lead's richtext starts with `<p>&nbsp;</p>`, one blank line, 42 px
  between the title and the lead.
  - No block option or section style draws a blank line between a title and its lead.
  - A Spacer block there draws 61 px. It also breaks the lead rules, which read `h1 + p`.
  - So no row. It is content only a marker could carry.
- **kuala-lumpur:** www draws the space too. Each of its table cells holds two `<p>&nbsp;</p>` above its text and two
  below (b2b-parity-007's HTML), and its rows are 258 / 282 / 302 px at 1440.
  - Today's five-column 840 px box (order 72) stands in for them at 1440: ours 840, www 842.
  - The page's +2.37 % (1440) and +2.90 % (390) come from around the table: +16 at the first H3, +59 by "Experience a
    new kind of travel" (the table's section), +37 by "Malaysia: A fascinating destination".
  - A block option could carry the cell lines, such as a Table Striped option that pads its cells by two lines. None
    exists. It would reach the three kuala-lumpur copies only, and at 1440 the box already does it. No row.

## Item 5: reach of the rules shipped in this order

**Census:** every served Group for Business document (729), and the 57 served SWISS documents with a footnote link
(the SWISS rule needs one). Each rule's own selector was counted on the decorated page (1440, pictures not loaded).

| Rule | Documents with an element it applies to |
| --- | --- |
| SWISS footnote list in small print | 1 (ch/de terms-conditions/imprint) |
| B2B 1, table before a heading | 5 (the cash-and-points copies) |
| B2B 2, button before a Spacer | 23 (25 elements) |
| B2B 3, accordion before a Spacer | 21 (31 elements) |
| B2B 4, column view after an accordion | 30 (36 elements; on some the mark already drew 0) |

**Unrecorded samples:** 17 documents at 1440 and 390, rendered with the code, every section loaded, then checked for
overlaps, blocks outside the viewport, clipped text and empty runs.
- Rules 1 to 3 (11 documents): cn/en and xx/de cash-and-points, book-a-group, mice de/de, corporate-preferred,
  25-years-partner-plus-benefit de/de, lhg-summer-flightplan, the lufthansa and swiss travel-classes-and-booking pages,
  route-network, lhg-ita-airways de/de.
  - Each moves by what the rules give: -8 to -96 px.
  - 0 flags.
- Rule 4 (6 unrecorded page-widths): xx/en carry-on-baggage 1440 and 390, xx/en and de/de swiss-senses
  corporates-start-of-booking 1440, xx/de Allegris corporates- and intermediaries-start-of-booking 1440.
  - Each -64 at 1440 (-44 at 390), as the recorded copies.
  - 0 flags.
- Five more documents where the census finds rule 4's element (codeshares, the two EES news, baggage-irregularities,
  discover-airlines): the mark already draws 0 there, so nothing moves.

**Also tried for Group for Business:** 80 px under a table followed by a footnote paragraph (zurich-airport): carry-on-baggage de/en 1440 +1.32 -> +2.17 % (the note after its second table is set in <sup> too, as small print): HOLD.
