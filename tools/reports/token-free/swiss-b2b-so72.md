# Standing order 72: the Group for Business table box against www's new table recordings, the SWISS aside column's causes, three held rules, the reach of orders 70 to 72 (2026-11-19)

Code: styles/themes/b2b.css, styles/themes/swiss.css, test/swiss-b2b-so72.test.mjs (and order 71's test for the table
rule). Every rule is token-free: theme CSS, nothing in a document. No row in this order.

**Method** (as order 71):
- **Loads:** every page-width measured only once every section has loaded (so71/full.mjs, copied to so72): scrolled
  through once, every section and block loaded, every picture complete, the height the same for 5 reads 800 ms apart.
  Consent accepted, unhinted text, 844 / 900 px windows.
- **Per rule:** an in-page style tag on top of the load, the height read after each step; then the code as a CODE
  override of this checkout's blocks, scripts and styles, against the live code in separate loads.
- **Gate:** across all recorded page-widths of the brand, |after %| - |before %| <= 0.5 against today's served page,
  and the sum of |% off www| down.
  - SWISS: 168 page-widths.
  - Group for Business: 198, which is order 71's 184 plus this order's 14 table page-widths (b2b-parity-018).
- **Requests:** airline hosts, www.* and lh-proxy refused per request and counted. None was sent.
- **Positions:** where a page drifts, our boxes (headings, paragraphs, list items, pictures, tables, buttons) are matched
  to www's measurement-JSON boxes by text (so72/bcmp.py), and www's PNGs are read for what the JSONs don't hold
  (pictures, buttons, tab bars).

## Item 1: the Group for Business table box (scoped to five-column tables, shipped)

**The recordings.**
- tables-recordings-2026-11-19.json was up at 04:47 CET. b2b-parity-018.tar.gz downloaded with sha256 5d43884f…650fc0,
  as the index gives.
- Extracted into parity-588/so64/arch/b2b-parity-018, and its 14 page-widths added to the brand's index (so64/b2b-rec.tsv,
  198 rows).
- Each width is its own load (the archive's README).
- The A350-1000 news page is recorded at its double-hyphen URL. Ours answers that URL with a 301 to the single-hyphen
  path, and the page-widths are read at the double-hyphen URL.

**www draws these tables at their own height.** Every maui-table box is its rows plus 40 px above and below:

| Page (1440) | www box (rows) | Ours with the 840 box (rows) | Ours at its own height (rows) |
| --- | --- | --- | --- |
| carry-on-baggage (en) t1 | 640 (224 / 156 / 180) | 840 (369 / 216 / 255) | 528 (232 / 136 / 160) |
| carry-on-baggage (en) t2 | 416 (88 / 248) | 840 (215 / 625) | 344 (88 / 256) |
| carry-on-baggage (en) t3 | 630 (156 / 204 / 190) | 840 (227 / 307 / 307) | 504 (136 / 184 / 184) |
| carry-on-baggage (de) t1 | 640 (224 / 156 / 180) | 840 (369 / 216 / 255) | 528 (232 / 136 / 160) |
| carry-on-baggage (de) t2 | 416 (88 / 248) | 840 (215 / 625) | 344 (88 / 256) |
| carry-on-baggage (de) t3 | 576 (112 / 228 / 156) | 840 (171 / 404 / 264) | 432 (88 / 208 / 136) |
| cash-and-points (en) t1 | 688 (112 / 112 / 112 / 136 / 136) | 840 (132 / 168 / 168 / 204 / 168) | 560 (88 / 112 / 112 / 136 / 112) |
| cash-and-points (de) t1 | 760 (112 / 136 / 136 / 160 / 136) | 840 (138 / 168 / 168 / 198 / 168) | 680 (112 / 136 / 136 / 160 / 136) |
| zurich-airport (en) t1 | 656 (112 / 88 / 88 / 88 / 88 / 112) | 840 (139 / 140 / 140 / 140 / 140 / 140) | 533 (88 / 89 / 89 / 89 / 89 / 89) |
| rail-fly (de) t1 | 553 (121 / 88 / 88 / 88 / 88) | 840 (81 / 248 / 170 / 170 / 170) | 473 (81 / 128 / 88 / 88 / 88) |
| new-lufthansa-airbus-a350-1000--more-pre (de) t1 | 520 (88 / 88 / 88 / 88 / 88) | 840 (168 / 168 / 168 / 168 / 168) | 440 (88 / 88 / 88 / 88 / 88) |

- **kuala-lumpur's rows are tall on www because of their content.** Each of its www cells holds two empty paragraphs
  (`<p>&nbsp;</p>`) above its text and two below (b2b-parity-007's HTML). Our copy has the text only.
- That is why the 840 px box suited kuala-lumpur and no other page.
- No structural feature of our documents marks those empty lines. Of the tables the box reaches, kuala-lumpur's is the
  only one that is short and has five columns. The other five-column tables are privacy's and our-european-fares'
  business table, and both are taller than the box, so they stay as they are.

**The two options, gated in the same load on all 198 page-widths:**

| Option | Moved | Closer | More than 0.5 points further | Sum of \|%\| |
| --- | --- | --- | --- | --- |
| Take the box back | 8 | 6 | 2: kuala-lumpur 1440 +5.45, cash-and-points de/en 1440 +4.24 | 345.02 -> 269.56 |
| The box only for a five-column table | 7 | 6 | 1: cash-and-points de/en 1440 +4.24 | 345.02 -> 264.12 |

- **Neither option passes the gate.** cash-and-points de/en 1440 gets further from www with any table that www draws
  at its own height.
- **Why:** that page is short of www for another reason. Under "Cash & Points: points redemption reimagined", www embeds
  its YouTube video (an iframe), and our copy has the link alone: -330 px.
- Its German copy has the same table and the same missing video, and is 305 px long (its FAQ answers stand as plain
  paragraphs where www has the accordion).
- With the 840 box, the English copy's table made up for the missing video. The German copy's table, also 840 px, took
  that page further from www.
- The two copies have the same table, so no structural rule can treat them differently.
- **Shipped: the box only for a five-column table.** It is the option closest to www: six page-widths 2.3 to 25.3
  points closer, kuala-lumpur kept, the sum down by 80.9 points.
- **The one page-width it takes further is cash-and-points de/en 1440: -5.07 -> -9.31 %, because of the missing video.**
  That is the only exception to the gate in this order. It is in the content list (item 5).

| Page-width | www | Today (840 box) | Now |
| --- | --- | --- | --- |
| /de/de/program/experts/at-the-airport/arrival-departure/rail-fly 1440 | 2,414 | 2,675 (+10.81 %) | 2,308 (-4.39 %) |
| /de/de/program/experts/baggage/carry-on-baggage 1440 | 4,798 | 6,176 (+28.72 %) | 4,960 (+3.38 %) |
| /de/de/program/experts/news/new-lufthansa-airbus-a350-1000--more-premium-options-to-asia 1440 | 2,058 | 3,227 (+56.80 %) | 2,827 (+37.37 %) |
| /de/de/program/partner-plus-benefit/cash-and-points 1440 | 6,839 | 7,144 (+4.46 %) | 6,984 (+2.12 %) |
| /de/en/program/experts/at-the-airport/hubs/zurich-airport 1440 | 2,604 | 2,852 (+9.52 %) | 2,545 (-2.27 %) |
| /de/en/program/experts/baggage/carry-on-baggage 1440 | 4,699 | 5,969 (+27.03 %) | 4,825 (+2.68 %) |
| /de/en/program/partner-plus-benefit/cash-and-points 1440 | 6,603 | 6,268 (-5.07 %) | 5,988 (-9.31 %) |

**The 23 tables in 17 documents** (served, 1440, the same load before and after):

| Document | Cols | Rows | Box before | Rows before | Box now | Rows now |
| --- | --- | --- | --- | --- | --- | --- |
| /cn/en/program/partner-plus-benefit/cash-and-points | 3 | 5 | 840 | 132 / 168 / 168 / 204 / 168 | 560 | 88 / 112 / 112 / 136 / 112 |
| /de/de/program/partner-plus-benefit/cash-and-points | 3 | 5 | 840 | 138 / 168 / 168 / 198 / 168 | 680 | 112 / 136 / 136 / 160 / 136 |
| /de/en/program/partner-plus-benefit/cash-and-points | 3 | 5 | 840 | 132 / 168 / 168 / 204 / 168 | 560 | 88 / 112 / 112 / 136 / 112 |
| /xx/de/program/partner-plus-benefit/cash-and-points | 3 | 5 | 840 | 138 / 168 / 168 / 198 / 168 | 680 | 112 / 136 / 136 / 160 / 136 |
| /xx/en/program/partner-plus-benefit/cash-and-points | 3 | 5 | 840 | 132 / 168 / 168 / 204 / 168 | 560 | 88 / 112 / 112 / 136 / 112 |
| /de/de/program/experts/baggage/carry-on-baggage | 3 | 3 | 840 | 369 / 216 / 255 | 528 | 232 / 136 / 160 |
| /de/de/program/experts/baggage/carry-on-baggage | 4 | 2 | 840 | 215 / 625 | 344 | 88 / 256 |
| /de/de/program/experts/baggage/carry-on-baggage | 4 | 3 | 840 | 171 / 404 / 264 | 432 | 88 / 208 / 136 |
| /de/en/program/experts/baggage/carry-on-baggage | 3 | 3 | 840 | 369 / 216 / 255 | 528 | 232 / 136 / 160 |
| /de/en/program/experts/baggage/carry-on-baggage | 4 | 2 | 840 | 215 / 625 | 344 | 88 / 256 |
| /de/en/program/experts/baggage/carry-on-baggage | 4 | 3 | 840 | 227 / 307 / 307 | 504 | 136 / 184 / 184 |
| /xx/en/program/experts/baggage/carry-on-baggage | 3 | 3 | 840 | 369 / 216 / 255 | 528 | 232 / 136 / 160 |
| /xx/en/program/experts/baggage/carry-on-baggage | 4 | 2 | 840 | 215 / 625 | 344 | 88 / 256 |
| /xx/en/program/experts/baggage/carry-on-baggage | 4 | 3 | 840 | 227 / 307 / 307 | 504 | 136 / 184 / 184 |
| /de/de/program/experts/at-the-airport/hubs/zurich-airport | 4 | 6 | 840 | 139 / 140 / 140 / 140 / 140 / 140 | 533 | 88 / 89 / 89 / 89 / 89 / 89 |
| /de/en/program/experts/at-the-airport/hubs/zurich-airport | 4 | 6 | 840 | 139 / 140 / 140 / 140 / 140 / 140 | 533 | 88 / 89 / 89 / 89 / 89 / 89 |
| /de/de/program/experts/at-the-airport/arrival-departure/rail-fly | 3 | 5 | 840 | 81 / 248 / 170 / 170 / 170 | 473 | 81 / 128 / 88 / 88 / 88 |
| /xx/de/program/experts/at-the-airport/arrival-departure/rail-fly | 3 | 5 | 840 | 81 / 248 / 170 / 170 / 170 | 473 | 81 / 128 / 88 / 88 / 88 |
| /de/de/program/experts/news/new-lufthansa-airbus-a350-1000-more-premium-options-to-asia | 2 | 5 | 840 | 168 / 168 / 168 / 168 / 168 | 440 | 88 / 88 / 88 / 88 / 88 |
| /de/en/program/experts/news/new-lufthansa-airbus-a350-1000-more-premium-options-to-asia | 2 | 5 | 840 | 168 / 168 / 168 / 168 / 168 | 440 | 88 / 88 / 88 / 88 / 88 |
| /de/de/program/experts/route-network/lufthansa/kuala-lumpur | 5 | 3 | 840 | 237 / 302 / 302 | 840 | 237 / 302 / 302 |
| /de/en/program/experts/route-network/lufthansa/kuala-lumpur | 5 | 3 | 840 | 237 / 302 / 302 | 840 | 237 / 302 / 302 |
| /xx/de/program/experts/route-network/lufthansa/kuala-lumpur | 5 | 3 | 840 | 237 / 302 / 302 | 840 | 237 / 302 / 302 |

**Seen on the way (not changed in this order):**
- **The phone tables.** At 390, www draws these tables at full height (carry-on-baggage 712 / 488 / 774 px boxes).
  Ours keep the 840 px scroll box, with taller rows (carry-on-baggage 352 / 232 / 280 against www's 248 / 156 / 228).
  carry-on-baggage 390 is +14.28 / +16.22 %, cash-and-points de/de 390 +11.96 % and zurich-airport 390 +8.53 %. That is
  the next table question.
- **The A350-1000 news at 1440** (+37.37 % after the change) is long for its layout. www's footer is at 1,709 px at
  1440 against 2,298 at 390, and its table box is 622 px wide: www sets the article and its table side by side at
  1440, and ours stacks them.

## Item 2: the 794 px aside column (still HOLD) and the causes closed on the way

**For each failing 1440 page-width:** our boxes with the column (order 71's padding-right 48 px from 1025 px) matched
to www's. Each row names the first box that moves off www and by how much, what it is, and what follows.

| Page-width (1440) | First box that moves (with the column) | Kind | Then |
| --- | --- | --- | --- |
| newsletter | The sign-up text. Ours sits in a sidebar Columns Media 622 px wide (586 with the column), www's in the 794 px column. Its list wraps: +8 at the first list, +52 by "Sind Sie bereit". | Styling: the column narrows a column that is already narrower than www's | +79 at "Sie haben sich bereits": our document opens a new section there, www keeps it in the same container (content) |
| swiss-first (de) | The column's first H2, -37: www 101 px under the stage picture, ours 64 | Styling (tried: see below) | -20 at the first card row's H3 (closed: rule 3); -64 at the page end |
| miles-and-more | The column's first H2, -48 under the lead: the order 71 lead gap didn't reach it, because its column is split into section parts | Styling (closed: rule 1) | -21 / -12 in the aside's teasers; -136 at the end with the column, the six card pictures 1,566 -> 1,473 px |
| swiss-premium-economy | The lead, -42: www has an empty `<p>&nbsp;</p>` line between the title and the lead, our copy doesn't | Content | -20 at the first card row's H3 (closed: rule 3); -36 at the page end |
| food-and-beverage | The column's first H2, -99 under the stage: www has a divider section there (maui-divider) and 99 px; our document's stage section is flush (no gap) | Content: www's divider module | flat -99 to the FAQ, then +15 (www's FAQ H2 40 px tall) and +36 at the end |
| green-fare | Its first H2, -12, and its H3s, -32. www's are heading-medium (40 px lines) and heading-small (31 px), ours heading-small and copytext-large | Content: www's authored heading classes, which no carrier gives | -86 and -56 at the two fare summary tables |
| accessible-travel | "Assistance at the airport", +18: www 58 px under the note, ours 76 | Styling (not closed) | +12 to +30 per section after it; the standalone links are 22 px lines on ours, 18 on www ("Find out more about Hidden Disabilities Sunflower") |

**Closed on the way (shipped, SWISS rules):**
1. **The lead gap through section parts.** A with-aside section split into parts whose first part opens with its H2 gets
   order 71's 96 / 76 px under the lead.
   - 5 page-widths moved, all closer: miles-and-more 1440 -2.57 -> -1.17 %, 390 -1.58 -> -1.04 %; health-and-travel
     1440 -6.25 -> -4.73 %, 390 -1.46 -> -0.88 %; online-check-in de 390 +0.29 -> -0.14 %.
2. **The tab bar under the lead (from 1025 px).** www's tab underline is 88 / 89 px under the lead on every recorded
   tabbed page (swiss-business, swiss-economy, baggage-irregularities, animals-travelling, entertainment-on-board).
   Ours is 113.
   - So a tab set right under the lead sits 24 px under it, not 48.
   - Not when the tab panel opens with an embed. Below its tab bar, entertainment-on-board's panel starts 93 px down on
     www (ours 72), and the tab bar alone took that short page 0.94 points further.
   - swiss-business 1440 +2.15 -> +1.63 %; baggage-irregularities de 1440 +1.22 -> +0.60 %; swiss-economy de 1440
     +1.50 -> +0.90 %; animals-travelling 1440 -1.76 -> -2.23 % (+0.47).
3. **The card row's heading in the column (from 1025 px).** The H3 that opens a Columns Media card row after the column's
   running text sits 52 px under it: www's column-view heading. That is 52 on swiss-first, swiss-premium-economy and
   swiss-economy, where ours is 32.
   - swiss-first 1440 -1.11 -> -0.65 %; swiss-premium-economy 1440 -0.51 -> -0.02 %.
   - Alone, it takes swiss-economy de 1440 +0.50 points further (+0.90 -> +1.40 %, long elsewhere). With rule 2 that page
     ends at +1.40 against today's +1.50, closer.
- **Tried and not shipped:**
  - **The gap under a stage before the column** (100 px from 1025): food-and-beverage went +0.34 -> +2.57 %. Its gap on
    www is a divider module (content), and our document's stage section is flush.
  - **Keeping the newsletter's sidebar Columns Media out of the column:** inert while the column is held.

**The column again, with rules 1 to 3 and the usp cards (item 3) in, all 168 page-widths in the same load:** 17
moved, 9 closer, 7 more than 0.5 points further. The sum goes 541.00 -> 540.12.

| Failing 1440 | www | Today, with this order's rules | With the column | Points | What is left |
| --- | --- | --- | --- | --- | --- |
| swiss-premium-economy | 4,120 | 4,119 (-0.02 %) | 4,045 (-1.82 %) | +1.80 | www's empty line above the lead (content, -42); with that closed, the column takes the page to www's row pitch |
| swiss-first (de) | 4,322 | 4,294 (-0.65 %) | 4,220 (-2.36 %) | +1.71 | the stage gap (-37) and the page end (-64) |
| miles-and-more | 3,427 | 3,387 (-1.17 %) | 3,340 (-2.54 %) | +1.37 | the six pictures shrink 93 px; -64 at the end |
| accessible-travel | 6,680 | 6,704 (+0.36 %) | 6,770 (+1.35 %) | +0.99 | text wraps at 794 px as www's, and our paragraph and link lines are taller (styling, not closed) |
| unaccompanied-minors (de) | 3,414 | 3,393 (-0.62 %) | 3,459 (+1.32 %) | +0.70 | the table and text wrap: the page is long with it |
| food-and-beverage | 4,473 | 4,488 (+0.34 %) | 4,428 (-1.01 %) | +0.67 | www's divider module (content, -99) |
| green-fare | 6,240 | 6,070 (-2.72 %) | 6,029 (-3.38 %) | +0.66 | www's heading classes (content) and the fare tables |

- newsletter no longer fails. Its sign-up column is out of the column rule as tried (+0 at 1440).
- **The column stays held.** In four of the seven failures, what is left is content: premium-economy's empty line,
  food-and-beverage's divider, green-fare's heading classes, and the swiss-first and miles-and-more page ends under the
  aside. The column can only pass once those are closed, or once the user accepts content-driven failures.

## Item 3: the three rules tried in order 71

**B2B, the 11 px under a stacked button on phones (shipped, scoped).**
- **What sets the two groups apart is what follows the text cell.** These are the 43 stacked texts ending with a button
  on the 99 recorded B2B phone page-widths.
- **Text followed by its own picture** (the row's picture cell; 18 texts): www draws 11 px, read from the PNGs.
  - kuala-lumpur both rows: 10 / 11 px.
  - route-network: 11 (its outline button 4,283-4,332, the picture from 4,343).
  - celebrating-shared-stories: 11.
  - Ours: 36.
- **Text followed by another card's text** (25 texts: hygiene-and-safety's briefing cards, the partner-plus-benefit and
  experts stages, travel-id, businesstogo): www keeps the card gap (36 to 175 px on ours). Order 71's rule cut those
  to 11, and those were the 10 failures (hygiene-and-safety 390 -0.60 -> -3.04 %).
- **help-alliance's text is followed by its video player** (Columns Media iframe-player). That one stays as it is.
- **The rule:** below 768 px, a stacked text that ends with a button sits 11 px above its own picture (a cell with a
  picture: help-alliance's player cell has none).
- **Gate (all 198 B2B page-widths, same load):** 12 moved, 5 closer, none more than 0.5 points further (worst
  partner-plus-benefit de/en 390 +0.49). The sum goes 263.49 -> 263.10.
  - kuala-lumpur 390: +3.79 -> +2.90 %.
  - de/en homepage 390: +0.75 -> -0.20 %.
  - route-network 390: +1.20 / +1.17 -> +0.77 / +0.74 %.

**B2B, the footer 21 px under a closing card grid on phones (HOLD).**
- www's phone end under a closing Carousel Cards grid isn't one value, for the same block shapes:
  - 21 px: lhg-history de/de and de/en (grid four-up), alliances-and-joint-ventures and lhg-history-booking (grid
    two-up), discover-airlines (grid), travel-management (grid four-up).
  - More: 82 on experts (grid), 69 on experts/news (grid four-up), 62 on travel-classes-and-booking (grid).
  - Ours: 48 on all of them.
- No class, card count or section shape separates the two groups (four-up is in both, and plain grid too). The
  difference sits in what www draws under the grid, which the recordings don't show as a box.
- The two pages that failed in order 71 are short of www for other reasons:
  - lhg-history de/en 390: its H1 is 22 px higher than www's. Its from-768 Spacer row doesn't cover phones.
  - alliances-and-joint-ventures 390: -35 px before "Beyond the skies".
- A 21 px rule would need those closed first. Held, with no rule.

**SWISS, the usp teaser cards (shipped).**
- **www's phone layout, from the recorded 390s** (ch/de and ch/en terms-conditions, swiss-parity-002b; a resize of the
  1440 load):
  - One teaser per row, the icon centred over its title, the title centred, 180 px pitch.
  - The teaser box (www's teaser-heading) is 346 x 150 px: the icon 64 px with 12 above, 20 to the title, the title's
    22 px line, 12 under it, 20 padding.
  - At 1440: 408 x 154 px, title 24/26.4 px, 218 px pitch.
  - Order 71's note that "icon and text share rows" was a misread of the crop.
- **Ours, by computed style:** the teaser 155.1 / 159.4 px.
  - The title is 24.1 / 28.4 px tall: the link's inline box is taller than the 22 / 26.4 px line.
  - 15 px under the title.
  - The title 310 / 372 px wide inside the body's 18 px sides. That is why two titles wrap at 1440 where www wraps
    one.
- **The rule:** the usp title the teaser's full width, the link aligned to the line's top (the line box its own line
  height), 12 px under the title.
- **In-page and in the gate:** ch/en 390 3,234 -> 3,147 (www 3,147, 0.00 %); ch/de 390 +3.53 -> +1.43 %; ch/de 1440
  +3.25 -> +1.93 %; ch/en 1440 +3.52 -> +2.18 %. The 1440s keep about 35 px: the last row's two-line title and the page
  end.
- **Reach:** the usp grids in the census (item 4). None of the other recorded SWISS pages moved.

## Item 4: the reach of the rules of orders 70 to 72

In the addendum below, which comes after this push. The census of the served documents was still running.

## The code against live (this push)

The code as a CODE override of this checkout, against today's live code, on every recorded page-width, every section
loaded:
- **SWISS (168):** 14 moved, 13 closer, none more than 0.5 points further (the most is animals-travelling 1440, +0.47).
  The sum goes 553.34 -> 540.06 and the median 1.01 -> 0.89 %.
- **Group for Business (198):** 19 moved, 11 closer, one more than 0.5 points further: cash-and-points de/en 1440,
  +4.24 (item 1). The sum goes 342.32 -> 261.02 and the median 0.52 -> 0.49 %.
  - On order 71's 184 page-widths: 144.06 -> 143.68, median 0.47 -> 0.46 %.
  - The eight businesstogo page-widths were read again with their Turnstile challenge aborted on both sides (the
    challenge's 71 px came and went between loads). With it aborted the code doesn't move them.
- Every height matched the in-page steps' to the px.

## Item 5: the next 20 per brand (ranks 41 to 60, today as served, every section loaded)

Causes from our boxes matched to www's by text (so72/causes.py: the largest changes of the offset between neighbouring
matches, www's y in brackets). This order's rules close some of them, as the last column says.

**SWISS:**

| # | Page-width | % | Where the offset changes | Kind |
| --- | --- | --- | --- | --- |
| 41 | magazine swiss-behind-the-wings 1440 | +2.45 | the related list ("Weitere Beiträge" to "Flugbetrieb zum Zuschauen"): +687 / +454 / -656 | content: www's related stories differ |
| 42 | de/de homepage 390 | -2.37 | the stage and its flight search (above "Winterangebote"), then the page end | function: the flight search entry (as us/en, order 71) |
| 43 | magazine a350-special-livery en 1440 | -2.35 | "More Stories" to the footer -773 | content: www's longer related list (as the de copy, order 71) |
| 44 | imprint de 1440 | +2.32 | +29 from the last block to the footer, +9 / +5 in the contact blocks | styling: the page end (390 has +44, order 71) |
| 45 | swiss-business de 1440 | +2.15 | +35 under the tab set, -32 at the first H3, +56 at the end | styling: rule 2 (item 2) closes 24: +1.63 % |
| 46 | vouchers 390 | +2.12 | +145 from the FAQ to the footer | styling: the FAQ accordion's end |
| 47 | animals-travelling 390 | -2.06 | -89 at "Bringing pets to SWISS Lounges", -84 at "Recommendation – animals in the cabin" | spread over the open tab panel |
| 48 | swiss-premium-economy 390 | -2.02 | -50 at the lead (www's empty line), -90 from the last card to the footer | content (the empty line); the page end |
| 49 | privacy-statement 390 | -2.01 | -90 at the second paragraph, -78 / -99 in sections 4 and 5 of a 29,546 px text | spread: running text |
| 50 | magazine jungfrau-region 1440 | +2.01 | the related stories (+399) | content |
| 51 | airport de 390 | -1.95 | -22 at "Flughafen Genf", -51 at the page end | the page end |
| 52 | online-check-in de 1440 | -1.93 | -94 at "So erhalten Sie Ihre Bordkarte" (the booking lookup), -55 before the Travel ID section | function: the check-in entry |
| 53 | magazine/en 1440 | -1.91 | -218 / -106 / -70 at the story sections | content: www's story grid and ad slots |
| 54 | internet-overview de 390 | +1.87 | +49 from the title to the overview, +39 / +38 per section | styling: the section gaps on this page (order 71: +13 to +19 per section) |
| 55 | mobile-apps 390 | -1.78 | -50 from the last section to the footer | the page end |
| 56 | entertainment-on-board de 1440 | -1.76 | -24 at "SWISS Kids", -44 at the end | the tab panel opens 93 px under www's tab bar (ours 72; item 2) |
| 57 | animals-travelling 1440 | -1.76 | +130 at "Travel documents and regulations", -110 / -67 in the cargo sections | the open tab panel's sections |
| 58 | advance-seat-reservation 1440 | -1.71 | -87 at "Book a Classic Seat now", -37 / -36 further down | spread over the seat cards |
| 59 | travel-regulations de 390 | -1.71 | -75 from the last link list to the footer | the page end |
| 60 | faq 1440 | +1.68 | +24 / +15 / +20 in the four topic sections | styling: the topic teasers' rows |

**Group for Business:**

| # | Page-width | % | Where the offset changes | Kind |
| --- | --- | --- | --- | --- |
| 41, 49 | route-network de/en, de/de 390 | +1.20, +1.17 | +43 from the intro ("Via our five European hubs") to "Enjoy the benefits", +27 / +26 at the schedule news | styling: the stacked button rule (item 3) takes them to +0.77 / +0.74 % |
| 42 | lhg-invoice-receipt-download de/en 1440 | +1.20 | +33 from the title's section to the footer | the page end |
| 43, 44 | special-assistance-and-services de/en, xx/en 1440 | +1.19 | +24 from the title to "Forms" (the intro), +15 to the first UMNR section | styling: the intro (390 +25, order 71) |
| 45 | SWISS Senses intermediaries de/de 390 | +1.18 | +42 / +52 in the last sections ("So geht es mit SWISS Senses weiter") | the last section: see 51-56 |
| 46, 47, 48 | entertainment-on-board ch, de, xx/en 390 | +1.18 | +17 from the title to "eJournals", +12 at the end | the title's section (not traced further) |
| 50 | contact de/de 1440 | -1.14 | -240 / -141 in the contact info blocks | layout: www's contact tiles |
| 51-54, 56 | Allegris start-of-booking (de/en, xx/de, de/de at 390 and 1440) | +1.09 to +1.14 | +88 to +97 from "What's next for Lufthansa Allegris" to the footer | styling: in that last section, an empty 40 px paragraph under the H1 and over the picture (+53 against www's 8 px), then the grey card band 617 px against www's 548 (+69), less 37 under the picture |
| 55 | lufthansa-group-airlines de/de 1440 | -1.11 | -40 at "All it takes is a yes" | one section |
| 57, 59 | partner-plus-benefit de/en 390, de/de 1440 | -1.09, -0.99 | -82 under "Cash & Points – the new payment option" | content: its video (as cash-and-points: the YouTube link stands as a link) |
| 58 | SWISS Senses corporates xx/en 390 | +1.02 | -81 at "Rebookings and refunds", +72 / +42 in the last sections | as 45 |
| 60 | discover-airlines ch/en 390 | -0.98 | -29 at the end (the closing card grid: www 21, ours 48; item 3) | the card grid end |

- **Rules found here and shipped:** route-network's stacked button (item 3) and swiss-business' tab bar (item 2).
- **Not written:**
  - The Allegris last section. Its empty 40 px paragraph is in the documents; dropping it would take a document change,
    and this order writes no rows.
  - The page ends. They vary 29 to 145 px with no shared shape.

**Content and function differences (no rows):**

| Page | Width | Difference |
| --- | --- | --- |
| Group for Business cash-and-points (de/en, de/de and their copies) | 1440 / 390 | www embeds its YouTube video under "Cash & Points: points redemption reimagined" (-330 px at 1440); ours has the link. The German copy's FAQ answers stand as plain paragraphs (www: an accordion, +633 px on ours) |
| Group for Business partner-plus-benefit (de/en, de/de) | 390 / 1440 | the same video under "Cash & Points – the new payment option" (-82) |
| Group for Business kuala-lumpur | 1440 | www's table cells carry two empty lines above and below their text (the rows 258 / 282 / 302 px); the 840 px box stands in for them |
| Group for Business A350-1000 news (de/de) | 1440 | www sets the article and its table side by side (+37.37 % after the table change) |
| SWISS swiss-premium-economy | 1440 / 390 | www's empty line between the title and the lead (-42 / -50) |
| SWISS food-and-beverage | 1440 | www's divider section between the stage and the column (-99) |
| SWISS green-fare | 1440 | www's H2s heading-medium and H3s heading-small (authored), ours heading-small / copytext-large |
| SWISS newsletter | 1440 | "Sie haben sich bereits…" in its own section on ours (+79 px of section gap) |
| SWISS magazine pages (behind-the-wings, a350-special-livery en, jungfrau-region, magazine/en) | 1440 | www's related stories and story grid |
| SWISS de/de homepage, online-check-in | 390 / 1440 | the flight search and the check-in entry (apps) |

