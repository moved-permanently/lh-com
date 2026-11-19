# Standing order 71: SWISS FAQ headlines and phone title, the late SWISS loads, two Group for Business rules (2026-11-19)

Code: THEMES.swiss rules `accordion-headings` (scripts/style-markers.js, scripts/token-free.js), styles/themes/swiss.css,
styles/themes/b2b.css, test/swiss-b2b-so71.test.mjs (and order 70's test for the phone title). Every rule is token-free:
a theme rule or theme CSS, nothing in a document.

**Method.**
- **Loads:** every page-width measured only once every section has loaded (so71/full.mjs): the page scrolled through
  once, every `.section` `data-section-status="loaded"`, every block loaded, every picture complete, then the height the
  same for 5 reads 800 ms apart. Consent accepted, unhinted text, the 844 / 900 px windows.
- **Per rule:** an in-page step (a style tag, or a script doing what the theme rule does) on top of the load, the
  height read after each step; then the code as a CODE override of this checkout's blocks, scripts and styles against
  the live code in separate loads.
- **Gate:** across all recorded page-widths of the brand, |after %| - |before %| <= 0.5 against today's served page,
  and the sum of |% off www| down. SWISS: 168 page-widths (swiss-parity-001, -002a, -002b). Group for Business: 184
  (b2b-parity-001 to -017).
- **Requests:** airline hosts, www.* and lh-proxy refused per request and counted. None was sent.

## Item 2: the FAQ headlines and the phone title (shipped)

**What sets refunds' and payment-options' H2s apart.**
- On www every customer-support H2 is heading-medium: faq's four in a four-column view, feedback's two as section
  headlines, refunds' and payment-options' as headlines in the column beside the sidebar. So the class alone does not
  separate them.
- On our pages the place does:

| Page-width | Our H2 | Neighbour | Section |
| --- | --- | --- | --- |
| refunds 390 | "Optionen für Ihre Rückerstattung" | right before the FAQ accordion | the with-aside section |
| payment-options 390 | "Payments at the airport" | right after the FAQ accordion | the with-aside section |
| faq 1440 | "Book", "Prepare", "On board", "SWISS Choice" | H3 topic teasers after each (their column view) | the title's section |
| feedback 390 | the two contact-form H2s | paragraphs after each | an h3-large section |

- **The rule:** a flow page's H2 right before or right after an accordion in its section gets heading-medium. Not in a
  tab panel: baggage-irregularities' FAQ headlines are heading-medium on www as well, but that page is already 47 px
  long at 1440 (+54 px after its FAQ accordion). With them the rule took it +0.73 points further.
- **Reach:** at most 139 of the 5,335 served SWISS copies (18 Nov), 217 H2s. A .plain.html doesn't carry the page
  type, so this counts every page, flow or not.

**The phone title:** 30 px under its picture below 768 px (www's 30). From 768 px it stays 31 px (order 70).

**Gate (code against live, 168 page-widths):** 28 moved, 14 closer, none more than 0.5 points further (the most is
mobile-apps 390, +0.38). The sum of |%| goes 582.27 -> 578.11.

| Page-width | www | Today | Now | Points |
| --- | --- | --- | --- | --- |
| refunds 1440 | 1,989 | 1,888 (-5.08 %) | 1,917 (-3.62 %) | -1.46 |
| refunds 390 | 1,934 | 1,909 (-1.29 %) | 1,912 (-1.14 %) | -0.16 |
| payment-options 1440 | 2,365 | 2,251 (-4.82 %) | 2,279 (-3.64 %) | -1.18 |
| payment-options 390 | 1,990 | 1,941 (-2.46 %) | 1,938 (-2.61 %) | +0.15 |
| miles-and-more 1440 | 3,427 | 3,310 (-3.41 %) | 3,339 (-2.57 %) | -0.85 |
| duty-free-shop 390 | 1,173 | 1,186 (+1.11 %) | 1,176 (+0.26 %) | -0.85 |
| mobile-apps 390 | 2,643 | 2,578 (-2.46 %) | 2,568 (-2.84 %) | +0.38 |

The other 21 page-widths:
- 18 move by the phone title alone (-10 px each).
- miles-and-more 390 and health-and-travel 390 move by the H2 and the title together (-4 / -3).
- arrival-departure 390 moves +6: the title's -10, and +16 in its flight status entry below it (the same in one load).

## Item 3: the SWISS homepages, offers and culinaryjourney, every section loaded

Two passes each, with the code before order 70 (50e7c40d^) as a CODE override and with today's live code. Every
section, block and picture loaded on all 12 page-widths. The two passes gave the same heights.

| Page-width | www | Before order 70 | Today (live) | Points |
| --- | --- | --- | --- | --- |
| ch/de homepage 1440 | 4,480 | 4,436 (-0.98 %) | 4,436 | 0 |
| ch/de homepage 390 | 5,141 | 5,180 (+0.76 %) | 5,172 (+0.60 %) | -0.16 |
| ch/en homepage 1440 | 4,412 | 4,346 (-1.50 %) | 4,346 | 0 |
| ch/en homepage 390 | 5,010 | 5,147 (+2.73 %) | 5,139 (+2.57 %) | -0.16 |
| de/de homepage 1440 | 4,480 | 4,425 (-1.23 %) | 4,425 | 0 |
| de/de homepage 390 | 5,196 | 5,081 (-2.21 %) | 5,073 (-2.37 %) | +0.15 |
| us/en homepage 1440 | 4,467 | 4,327 (-3.13 %) | 4,327 | 0 |
| us/en homepage 390 | 4,920 | 4,760 (-3.25 %) | 4,752 (-3.41 %) | +0.16 |
| ch/en offers 1440 | 32,383 | 2,311 (-92.86 %) | 2,311 | 0 |
| ch/en offers 390 | 31,952 | 1,593 (-95.01 %) | 1,585 (-95.04 %) | +0.03 |
| culinaryjourney 1440 | 1,277 | 1,275 (-0.16 %) | 1,275 | 0 |
| culinaryjourney 390 | 1,396 | 1,521 (+8.95 %) | 1,513 (+8.38 %) | -0.57 |

- Only the phone footer (-8 px) moves them. Every 1440 is unchanged.
- None is more than 0.16 points further, so nothing needed closing.
- This order's rules don't move these 12 either.

## Item 4: Group for Business (shipped)

**Short tables (from 768 px):** a table shorter than its box fills it, as www's maui-table does.
- How: the box 840 px tall and the rows sharing the rest.
- kuala-lumpur 1440: www's rows are 258 / 282 / 302 px; ours go from 88 / 112 / 112 to 237 / 302 / 302. The page goes
  4,774 -> 5,302 against www's 5,179 (-7.82 -> +2.37 %).
- kuala-lumpur 390 is unchanged at 5,800 (+3.79 %): its table is already as tall as its box there. our-european-fares'
  tables are longer than the box, so they don't change.
- **Reach:** 33 tables in 25 of the 733 served B2B documents. Of the recorded ones, only kuala-lumpur's is shorter than
  its box.

**The phone tab list.** www's phone tab set is a collapsible list. For each recorded tab set, its first item's distance
under the H1, www against ours:

| Page (390) | www | Ours | What ends the section before it |
| --- | --- | --- | --- |
| meals-on-board (ch, de, xx en) | 215 | 194 | the title's running-text paragraph |
| news (de/de, de/en, mx, xx) | 414 / 418 | 415 / 419 | the H2 that introduces the tabs |
| programs-and-groups (de/en, xx/en) | 378 | 378 | a picture |
| Allegris start-of-booking (de/de, xx/de; de/en) | 801; 829 | 815; 844 | an H3 |
| SWISS Senses start-of-booking (8 copies) | 4,764 to 5,395 | en 25 to 50 px above www's, de 17 to 68 px below | an H2 |
| entertainment-on-board | 951 | 979 | a column view |

- So www's extra 20 px is only after running text.
- The census of all 733 served B2B documents finds that shape in exactly three: the meals-on-board copies.
- Before the other tab sets www's offset equals ours, is smaller, or (SWISS Senses, thousands of px down the page)
  changes with the content above. Those sets follow an H2 or H3, a picture, a column view or an accordion
  (special-assistance). Order 70's 20 px for every tab set failed 15 of the 34.
- **The rule:** below 768 px, a tab set right after a section that ends with a plain paragraph starts 20 px lower.
  meals-on-board 390 goes 1,329 -> 1,349 against www's 1,405 (-5.41 -> -3.99 %), on all three copies. The 31 other
  recorded tabbed page-widths don't move.

**Gate (all 184 recorded B2B page-widths, in the same load, then the code on the 40 tabbed and table page-widths):**
4 moved, 4 closer, none further. The sum of |%| goes 167.12 -> 157.41. The code gave the same heights to the px.

## Item 5: the SWISS aside column at www's 794 px (HOLD)

- **www's column is 794 px wide (x 88)** on every recorded sidebar page. That includes the seven that fail (the
  measurement JSONs' sidebar-content headings and texts).
- The 794 px column puts the column's own content at www's size: green-fare's three pictures go 369 -> 348 px, and
  www's are 348 (read from www's PNG).
- **The rule as tried (padding-right 48 px on the non-aside parts from 1025 px), in the same load on all 168:**
  17 moved, 9 closer, 7 more than 0.5 points further. The sum goes 582.27 -> 582.60.

| Failing 1440 | www | Today | With the column | Points | What moves |
| --- | --- | --- | --- | --- | --- |
| newsletter | 2,015 | 2,111 (+4.76 %) | 2,177 (+8.04 %) | +3.28 | the form's text wraps (+66); the page is long by the form (+98) |
| swiss-premium-economy | 4,120 | 4,051 (-1.67 %) | 3,977 (-3.47 %) | +1.80 | 8 pictures shrink (1,645 -> 1,549); the page is short |
| swiss-first (de) | 4,322 | 4,274 (-1.11 %) | 4,200 (-2.82 %) | +1.71 | pictures shrink; the page is short |
| miles-and-more | 3,427 | 3,310 (-3.41 %) | 3,264 (-4.76 %) | +1.34 | 6 pictures shrink (1,566 -> 1,473); the page is short |
| accessible-travel | 6,680 | 6,704 (+0.36 %) | 6,770 (+1.35 %) | +0.99 | text and table wrap (+66); the page is long |
| food-and-beverage | 4,473 | 4,488 (+0.34 %) | 4,428 (-1.01 %) | +0.67 | pictures shrink past www |
| green-fare | 6,240 | 6,070 (-2.72 %) | 6,029 (-3.38 %) | +0.66 | 3 pictures shrink to www's 348; the page is short |

- **What they have in common:** each is already off www for another reason, in the direction the narrower column
  moves it. Picture pages get shorter and text pages taller, and these seven start out short (pictures) or long (text).
- The nine that move closer are the reverse: swiss-business, swiss-economy, recraft, baggage-irregularities and
  new-destinations are long with pictures; online-check-in, unaccompanied-minors, advance-seat-reservation and
  animals-travelling are short with text.
- None of the features I looked at separates the two groups: the column's blocks (both groups have Columns Media
  picture columns: swiss-first fails where swiss-business passes), the aside's height, how many aside sections there
  are, and the share of pictures against text.
- A scope that keeps the seven at today's column would be a list of pages, not a rule. It stays held until their own
  causes are closed (newsletter's form +98, the picture pages' shortfalls above their columns).

## Item 6: the next 20 per brand (ranks 21 to 40, today as served, every section loaded)

Causes from our headings matched to www's recorded ones by text: where the offset to www changes.

**SWISS:**

| # | Page-width | % | Cause |
| --- | --- | --- | --- |
| 21 | payment-options 1440 | -4.82 | -72 px from the title to the first accordion item (www's accordion starts lower); -36 at "Payments at the airport" (item 2 closes 28 of it) |
| 22 | newsletter 1440 | +4.76 | the newsletter form +98 px |
| 23 | entertainment-on-board 390 | -3.91 | the first tab's open panel: -28 to its H2, -37 to "SWISS Kids", -85 from there to the next tab |
| 24 | new-destinations 1440 | +3.57 | the Toulouse section +258 px (from "Ihr nächstes Reiseziel" to "Rijeka") |
| 25, 26, 30, 40 | terms-conditions de 390, en 1440, de 1440, en 390 | +3.53, +3.52, +3.25, +2.76 | the four topic cards' section: +60 / +76 px to the footer (www draws each card's icon inside its heading) |
| 27, 33 | us/en homepage 390, 1440 | -3.41, -3.13 | above "Winter deals" -129 / -29 px (the stage and its flight search), -56 / -110 px at the page end |
| 28 | miles-and-more 1440 | -3.41 | spread: -48 under the title, -49 before "Travel with privileges", -47 at the end (item 2: -2.57) |
| 29 | imprint 390 | +3.28 | +44 px from the last contact block to the footer, +8 at "Registereintragung" |
| 31 | online-check-in 1440 | -3.22 | -100 px from the title to "So erhalten Sie Ihre Bordkarte" (the booking lookup), -55 before the Travel ID section |
| 32 | a350-special-livery de 1440 | -3.16 | the article body -102 px to "Weitere Beiträge"; www's related list is longer (item 7) |
| 34 | internet-overview 390 | +3.08 | +49 from the title to the overview, then +13 to +19 per section, +40 at the end |
| 35 | arrival-departure 390 | -3.08 | the flight status entry -94 px under the title (www's app), +37 at the end |
| 36 | travel-insurances 390 | +3.06 | +85 px from "Versicherungsbedingungen" to the footer |
| 37 | accessibility-statement 1440 | -2.93 | -12 to -58 px per section: the running text shorter than www's, most in "Description of how the service meets the requirements" |
| 38 | swiss-airrail 1440 | -2.92 | -80 under the title (the intro), -165 in "Travelling by SWISS Air Rail" |
| 39 | new-destinations 390 | +2.84 | +50, +40 and +73 in the destination sections |

**Group for Business (with this order's rules):**

| # | Page-width | % | Cause |
| --- | --- | --- | --- |
| 21 | special-assistance-and-services xx/en 390 (de/en, the same, is 20) | +1.99 | +25 px from the title to "Forms" (the intro) |
| 22, 23 | meals-on-board 1440 (ch, de) | -1.96 | -30 under the title, -53 at the end (the last tab panel) |
| 24 | lhg-history de/de 390 | +1.93 | +80 from the title to the first card (the intro), +29 at the end |
| 25 | SWISS Senses intermediaries de/de 390 | +1.91 | +34 at the key points, +53 before "Exklusive Vorteile", +28 and +52 in the last sections |
| 26 | lhg-history de/de 1440 | +1.89 | +19 at the title (www's breadcrumb gap), +8 at the end |
| 27 | contact 390 | +1.88 | +60 at "Passenger Receipts for Austrian Airlines", +43 at the end |
| 28, 29 | Allegris corporates xx/de, de/de 390 | +1.85, +1.84 | +53 before "Exklusive Vorteile für Statuskund:innen", +94 in the last section (the cards) |
| 30, 31 | businesstogo 390 (de/en, xx/en) | +1.78 | +96 px at the contact form ("Any questions?" to the FAQ), +48 at "Unlock smarter business travel" |
| 32 | program/experts 1440 | -1.70 | +38 under the title, then -32 and -53 in the cards ("Explore content by airline") |
| 33, 34 | travel-id-now-required 1440 (de/en, de/de) | +1.67, +1.66 | +39 px from the last heading's section to the footer |
| 35 | lhg-history-booking 390 | +1.64 | +28 at "The age of online access", +45 at the end |
| 36 | help-alliance 1440 | -1.62 | -40 px, all in the one section above the footer |
| 37 | lhg-invoice-receipt-download de/de 390 | +1.61 | +38 px from the title's section to the footer |
| 38 | travel-management 1440 | -1.56 | -40 before "This might interest you" |
| 39 | SWISS Senses corporates xx/de 390 | +1.52 | +58 at the key points, -81 then +53 around "Exklusive Vorteile", +44 at the end |
| 40 | lhg-history-booking 1440 | +1.38 | +26 at "The age of online access", +23 at the end |

**A rule that might fit, not tried:** the start-of-booking pages (Allegris, SWISS Senses) have +53 px before
"Exklusive Vorteile für Statuskund:innen" on all five recorded 390s. That section is a Columns Media followed by the H2
that opens the status tabs. I didn't split it further.

## Item 7: content and function differences (no rows)

| Page | Width | www | Ours | Difference |
| --- | --- | --- | --- | --- |
| SWISS /ch/en/offers | 1440 / 390 | 32,383 / 31,952 | 2,311 / 1,585 | www lists every priced fare (its fares API); ours is the finder without the list (-92.86 / -95.04 %) |
| SWISS /ch/de/book-and-manage/pax-receipt | 1440 / 390 | 2,234 / 2,402 | 1,682 / 1,707 | www's receipt request form (about 800 px) where ours has two links (-24.71 / -28.93 %) |
| SWISS magazine overviews (/magazine/de, /en, /de/inside-swiss, /en/travel) | 390 | 10,414; 10,381; 10,413; 9,990 | 8,959; 8,959; 9,181; 8,785 | the "Advertisement" slots in the story grids (about 300 px and a label, two per page): -13.97, -13.70, -11.83, -12.06 % |
| SWISS magazine articles (a350-special-livery de, en; hello-boston) | 390 | 7,834; 7,936; 6,809 | 6,695; 6,836; 5,913 | an ad slot in the article: -14.54, -13.86, -13.16 % |
| SWISS a350-special-livery de | 1440 | 6,860 | 6,643 | www's related list ("Weitere Beiträge") holds more stories: 736 px more from the list to the footer (-3.16 %) |
| SWISS culinaryjourney | 390 | 1,396 | 1,513 | the micro-frontend's entry screen (+8.38 %) |
| SWISS arrival-departure | 390 | 1,690 | 1,644 | the flight status app's entry under the title, 94 px shorter than www's |
| Group for Business meals-on-board (ch, de, xx en) | 390 | 1,405 | 1,349 | www's tab list has 10 items (51 px each, 390 to the footer at 900), ours 9: -51 of the -56 px |
