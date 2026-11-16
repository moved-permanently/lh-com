# Brand sweep, ranks 130 to 149, and special-assistance at 1440 (ema-lufthansa, standing order 38, 2026-11-16)

## Item 1: Group for Business special-assistance-and-services, 9,414 px at 1440 against 1,480 at 390

**Recordings.** The page is recorded at 390 only:
- b2b-parity-004 and -005 (/de/en, /xx/en);
- b2b-parity-014: phone first loads of both, www 1,458.

No 1440 load of it is on our drop.

**Located, as served (~22:00 UTC, airline hosts refused per request):**
- **The page is tall at 1440 because of its tabs.** Under the grey "Forms" band, five section tabs ("Traveling with kids", "Traveling with pets", "Traveling healthy", "Accessible travel ...", "Doctors on Board"). At 1440 the first tab is open; its panel holds six news items and is 8,147 px tall.
- **Each news item draws its picture across the whole 1,264 px content width.** The item is a heading, its date and text, then a picture paragraph 791 to 949 px tall: six pictures, about 5,300 px.
- **On www each news item is a two-column view** (div.twocolumn > div.column-view > two div.col-md-6 column-view-item; in the recorded HTML of b2b-parity-014): the text on the left, the picture in the right half. At 1440 the picture is half as wide and stands beside the text, not under it.
- **The other tabs' items are built the same way** (the doctor programme, the animals, medical and accessibility items).
- **At 390 nothing is hidden that www shows.** On www the tabs are a list of collapsed items (div.collapsibleitem.b2b.collapsed in the recorded HTML; its headings 51 px apart). Ours draws the same closed accordion: five panels, 51 to 75 px each, 1,480 against www's 1,458. That is +1.51 % with this order's live Forms row.

**The cause:** the import kept each news item's text and picture but not its two-column view. At 1440 our first panel stacks six full-width pictures where www sets them beside their text. 390 is right, so the 6:1 ratio is ours being too tall at 1440, not phones losing content.

**No row this order.** The fix is a document change: each news item becomes a two-column Columns Media row (text | picture), in all five panels of both documents. Without a 1440 recording of www there is nothing to gate it against at that width, so no row can be READY. A 1440 first load of both pages, with the first tab open as a visitor sees it, is in capture-requests-ema-lufthansa.txt (order 38's lines).

## Ranks 130 to 149

**How they were taken:** the ranking continues sweep-so37-ranks-110-129.md. All twenty were captured again at ~22:00 UTC with main as deployed (capture.js, airline hosts refused per request), and each gave its order-35 figure. They were located the same way: www's recorded marks against ours, and the footer top and height from one load per page.

**Result:**
- **Delta rows:** delta-so38-brussels-checked-baggage-limited-headings.txt, ranks 141 to 143 and be/fr (rank 60 of sweep-so30). Four READY, es/es HOLD.
  - www draws the page's first two headings 834 px wide, so the second one ("What if I exceed the limits ...") takes two lines in every language but English; ours drew it 1,264 px wide on one line.
  - The {limited-width} marker gives www's 834 px from 1025 px.
  - 1440: be/fr -2.44 -> -1.44 %, be/nl and de/de -1.60 -> -0.60 %, it/it -1.59 -> -0.60 %.
  - 390 is equal in all of them.
- **No row, explained:** the other sixteen.

| # | brand | page | width | recording | www px | ours px | ours vs www | located | row / rule |
|---|---|---|---|---|---|---|---|---|---|
| 130 | Group for Business | /de/en/news/travel-id-now-required-for-online-check-in | 1440 | b2b-parity-001 | 2520 | 2562 | +1.67 % | Text and the "Travel ID benefits" heading at www's places (0 px). The footer stands 39 px lower (2,221 against 2,182), after the article's last block. The footer +3. | none |
| 131 | Group for Business | /de/de/news/travel-id-now-required-for-online-check-in | 1440 | b2b-parity-001 | 2530 | 2572 | +1.66 % | as rank 130 in German | none |
| 132 | Group for Business | /de/en/program/experts | 1440 | b2b-parity-001 | 4952 | 4870 | -1.66 % | +36 before "Product & service news", -6, -32. Then -180 at the "Subscribe to the eXperts newsletter" button and +129 to "Explore content by airline": the newsletter band is laid out differently. The footer -85 (4,529 against 4,614). | none: the steps cancel in part |
| 133 | Group for Business | /de/de/program/businesstogo | 1440 | b2b-parity-009 | 5069 | 4986 | -1.64 % | -72 before "Lösungen für alle", +12, -348 at "Maximale Kostenersparnis", then +217, +161, +1, +25 to the FAQ and the closing band. The page's tab and slider content draws in its own time (another load: 5,057, the footer -14). | none: the steps cancel |
| 134 | Group for Business | /xx/de/program/businesstogo | 1440 | b2b-parity-009 | 5069 | 4986 | -1.64 % | as rank 133 | none |
| 135 | Brussels | /be/en/travel-comfortably-from-lille | 390 | brussels-parity-004 | 5179 | 5263 | +1.62 % | Within ±18 px of www's at each heading to "Related topics". The footer stands 82 px lower (4,432 against 4,350): +78 in the related-topics cards. | none |
| 136 | Brussels | /be/en/lufthansa-group/lufthansa-group/ita-airways | 1440 | brussels-parity-004 | 3641 | 3582 | -1.62 % | +16 in the intro, -83 before "FAQs", +8 in the FAQ; the footer -59. | none |
| 137 | Discover | /de/de/travel-inspiration/inspiration/destinations/santorini | 1440 | discover-parity-001 | 7666 | 7790 | +1.62 % | Title as www's. +45 before "Wieso nach Santorini", -44 at "Perivolos Beach", small steps, +45 before "Getting around", +76 from there to the footer (+124). | none: spread over the page |
| 138 | Group for Business | /ch/en/program/experts/on-board/meals-on-board | 1440 | b2b-parity-010 | 2910 | 2863 | -1.62 % | As rank 95 (de/en): -30 above the first airline heading, +6 at each one after, the footer -59. The footer itself +12. | none |
| 139 | Brussels | /fr/fr/homepage | 1440 | brussels-parity-003 | 4214 | 4146 | -1.61 % | As rank 118 (be/en): -53 at "Actualités", -86, -95 at the conditions link, the footer -67. | none |
| 140 | Brussels | /be/en/contact/service-charges | 390 | brussels-parity-004 | 2172 | 2137 | -1.61 % | As rank 109 (be/nl): -8 at "Optional Payment Charge", the footer -37. | none |
| 141 | Brussels | /be/nl/extra-services/baggage/checked-baggage | 1440 | brussels-parity-005 | 3992 | 3928 | -1.60 % | -40 px under "Wat als ik de limieten ... overschrijd?": www's heading is 834 px wide and takes two lines. Then -21 at the "Nu toevoegen" button, +61 before "Goed om te weten", the footer -61. | READY row: -0.60 % |
| 142 | Brussels | /de/de/extra-services/baggage/checked-baggage | 1440 | brussels-parity-005 | 3992 | 3928 | -1.60 % | as rank 141 in German | READY row: -0.60 % |
| 143 | Brussels | /it/it/extra-services/baggage/checked-baggage | 1440 | brussels-parity-005 | 4016 | 3952 | -1.59 % | as rank 141 in Italian | READY row: -0.60 % |
| 144 | Group for Business | /de/en/program/partner-plus-benefit | 390 | b2b-parity-001 | 5061 | 4982 | -1.56 % | +30 after the intro, -313 at "Cash & Points", +246 after it, -25, the footer -76. A Columns Media teaser row stacks differently at 390, and the steps cancel. | none |
| 145 | Group for Business | /de/en/travel-management | 1440 | b2b-parity-007 | 2565 | 2525 | -1.56 % | Title as www's. -10 at the guide heading, -39 before "This might interest you", the footer -42. | none |
| 146 | Brussels | /de/de/extra-services/baggage/checked-baggage | 390 | brussels-parity-011 | 4969 | 4892 | -1.55 % | -17 before the excess heading, -21 at the button, +53 before "Wissenswertes", +51 before "Verwandte Themen", the footer -54. The German footer is 23 px shorter (831 against 854). This order's row does not reach 390. | none |
| 147 | Brussels | /be/nl/special-care/pets | 1440 | brussels-parity-006 | 1728 | 1702 | -1.50 % | The footer stands 23 px higher, in the page's one section; the footer -3. | none |
| 148 | Brussels | /be/fr/extra-services/baggage | 1440 | brussels-parity-006 | 1734 | 1708 | -1.50 % | The footer stands 23 px higher, in the page's one section; the footer -3. | none |
| 149 | Brussels | /be/en/contact/feedback/general/other | 390 | brussels-parity-004 | 7400 | 7509 | +1.47 % | The feedback form draws in its own time (another load: 7,580). By capture.js the footer stands 107 px lower. | none: the form |
