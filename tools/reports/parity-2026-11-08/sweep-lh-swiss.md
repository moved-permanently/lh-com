# Visual parity sweep: lufthansa.com and SWISS (brief 472, 2026-11-07/08)

Every captured page of www against ours on the replica hosts, at 1440 and 390, worst first.

## Sources

- lufthansa.com: the capture `parity-full-2026-11-06`, lh-parity-002a to -002d and lh-parity-003
  (part e, which replaces six pages of 002: the chat panel closed). 296 pages (www answered the
  other jobs with a redirect or an error). sha256 of lh-parity-003 `67912ec2…6a900`, as in
  lh-deliveries.json (no `.sha256` file on the drop: `.tar.gz.sha256`, `.sha256` and `.sha256sum`
  answer 404). 002a to -002d were already on this machine, checked in brief 460.
- SWISS: swiss-parity-001 (2026-11-05), 24 pages (ch/en, ch/de, the magazine). sha256 `75a70815…b976f`,
  the one recorded in swiss/parity.md (no `.sha256` on the drop either).
- No www page was requested. Ours: lufthansa.turnsthe.page and swiss.turnsthe.page (code on main
  at e5c9ba9..b8c415e, the documents on preview).

## Method

- Ours captured with tools/parity/capture.js's settle steps: consent stored, blocks loaded, fonts,
  a scroll through the page, images complete, one-shot SVG animations, back to the top; desktop
  Chrome UA, device scale factor 1. Viewports 1440 x 900 and 390 x 900 (SWISS 390 x 844, as its
  capture). www's 390 shots come from a resize after the 1440 load (capture.json `loadedBy`); ours
  load fresh at each width.
- Pixel difference: compare.js with our live-widget mask (flight search, fare teaser, destination
  finder, price bar, flight status, recorded data, video stages), as for baggage in brief 467.
  www's lufthansa.com shots stop at 8,000 px; the difference covers that part.
- Page height: www's recorded scrollHeight against ours.
- Positions: our h1/h2, block tops and pictures are measured in the same load as our screenshot and
  located in www's screenshot: a strip of ours (half scale, grey) searched at the same x within the
  page's height difference + 300 px, preferring the shift nearest the last one found. "First drift"
  is the first element 16 px or more off; "largest step" is where neighbouring elements part most
  (that is where a cause sits). Pictures: top and bottom edge located, so a height difference shows.
  SWISS h1/h2 are also matched by text against the boxes www recorded (exact).
- Four pairs came out at the viewport height (900 px) in the first run: the page had not rendered
  yet. They were captured again and are in the tables with the second capture (essentials-frankfurt-
  facts 390, manage-my-bookings 1440, group-travel 1440; feedbackai 1440 stays 900, see below).

Positions inside live widgets can match the wrong row; the price bar's "48 px" on Insights articles
is one: what follows it sits within 2 to 8 px of www's.

## Overview

| Site | Template | Pages | Median diff 1440 | Median diff 390 | Page-widths ≥ 20 % |
| --- | --- | --- | --- | --- | --- |
| lufthansa.com | info | 171 | 8.4 | 10.5 | 34 |
| lufthansa.com | insights | 32 | 10.5 | 14.8 | 10 |
| lufthansa.com | legal | 29 | 6.6 | 8.5 | 3 |
| lufthansa.com | campaign | 21 | 18 | 19.1 | 18 |
| lufthansa.com | hub | 16 | 10.5 | 13.7 | 8 |
| lufthansa.com | fleet | 8 | 12.8 | 15.7 | 1 |
| lufthansa.com | form | 8 | 8.4 | 11.1 | 2 |
| lufthansa.com | app-entry | 6 | 8.6 | 11.4 | 3 |
| lufthansa.com | lounge pages | 3 | 32.2 | 36.7 | 4 |
| lufthansa.com | homepage | 1 | 8.4 | 8.5 | 0 |
| lufthansa.com | flight-status | 1 | 4.3 | 12.8 | 0 |
| SWISS | main site | 20 | 7.9 | 16.9 | 8 |
| SWISS | magazine | 4 | 22.7 | 32.2 | 6 |

## Fixed this round (mine)

| Cause | Pages | Fix | Documents |
| --- | --- | --- | --- |
| The campaign template had no accordion mapping: www's accordions lost their titles and were flattened into the page | most-significant-route (+1,420 px at 390), stopover (+2,652 px at 1440) | template: `.accordion` to accordion-columns, as info, hub, legal do (test/campaign-accordions-472) | 14 (re-import) |
| The campaign template had no table mapping, and its two-column selector took views with a table: 100 Years fleet lost its 15 spec tables | 100-years/fleet (9,685 px shorter at 1440) | template: tables to table-striped as info, a view with a table left out of columns-media as fleet does (test/campaign-tables-472) | 7 (re-import) |
| Insights: the text after the "This may also be of interest to you" cards ran at the cards' 83.333% (same section) instead of two thirds | a-perfect-day Barcelona, Berlin (1440) | styles.css (test/insights-text-after-cards-472): Barcelona 27.5 → 21.4 %, Berlin 24.5 → 18.1 %, heights within 120 px; the other 30 Insights pages unchanged | none |
| A stale document: frankfurt-fair's benefits grid and text columns flattened (imported before today's importer gets them; the draft has the cards-teaser and columns-media) | frankfurt-fair (+856 px at 1440) | none needed | 7 (re-import) |

Re-import list (28, release order): [reimport-472-lh-com.txt](reimport-472-lh-com.txt). Each page
was drafted offline from its snapshot with the rebuilt campaign bundle (no request leaves: the
page's URL answered from the snapshot, all else aborted) and compared with its preview document:
the 21 de/en campaign documents differ only on these pages (plus new-onboard-experience and
100-years/fleet's hero option `regular`, which comes from a newer www page than the snapshot here:
the harness's current snapshots keep it). stopover's hero becomes `narrow` (today's parser).

## Mine, open

- SWISS menu pages' card grids (swiss row 42): www has two column-view spacings, a wrapper with
  class `section` (manage, extra services: 32 px above and below; the first card 72 px under the H1
  at 390) and a plain one (special requests, travel information, travel classes, on board: 20 / 10
  px, about 60 px). Our documents don't tell them apart. One theme rule for both (72 px, 84 / 86 px
  between grids, 15 px titles, 32 px card gap) fixed half the pages and broke the other half (mean
  14.7 → 14.8 %): reverted. Next: the SWISS importer marks each grid from www's wrapper (as
  withTwoUpCards does), then a rule per kind; 16 documents.
- lufthansa.com overview-manage: www's 2026-11-06 page shows the Check-in card without its picture;
  our document (snapshot 2026-10-21) has it. A fresh snapshot of /de/en/overview-manage decides.
- meetings-and-events (hub): "Request offer now" is a link where www has its yellow button; the
  steps' spacing.
- 100 Years chronicle, cabin-design, campaigns, destinations, global-network: 800 to 3,100 px
  shorter than www's, no accordions or tables on www; not diagnosed this round.
- SWISS magazine: www's ad slots (left out by design, row 20) make most of the difference; the
  article's subheads are smaller on www.
- Live data, as before: SWISS homepage (destination finder, fare teaser), lufthansa.com flights
  (the destination finder's result count: ours 5,012 px taller at 390).

## For you: causes in other agents' files (not changed)

ema-cashub (info, legal, form, app-entry, fleet):

| Page | Template | Width: height ours − www | www (snapshot) | ours (document) |
| --- | --- | --- | --- | --- |
| /de/en/advance-seat-reservation | info | 1440: -604, 390: -799 | 6 accordion items, 5 tab controls | 1 accordion block |
| /de/en/baggage-irregularities | info | 1440: +1,740 | 12 items, 4 tab controls | 3 accordion blocks |
| /de/en/carry-on-baggage | info | 390: -627 | 4 items, 4 tab controls | 2 accordion blocks |
| /de/en/gefaehrliche-gegenstaende | info | 1440: -731, 390: -1,484 | 27 items | 1 accordion block |
| /de/en/lufthansa-express-bus | info | 1440: +1,821 | 7 items | 2 accordion blocks |
| /de/en/passengers-using-wheelchairs | info | 1440: +1,539, 390: +2,655 | 4 items, 4 tab controls | 2 accordion blocks |
| /de/en/travelling-healthy | info | 1440: -542, 390: -566 | 14 items | 2 accordion blocks |
| /de/en/first-class | info | 1440: -907, 390: -832 | 3 tab controls | no tab sections |
| /de/en/lufthansa-terminal-muenchen | info | 1440: +1,403 | 3 tab controls | no tab sections |
| /de/en/onboard-delights | info | 390: -603 | 4 tab controls | no tab sections |
| /de/en/lufthansa-group-star-alliance-and-partner-airlines | info | 1440: +8,116, 390: -542 | no accordions, no tabs | not diagnosed |
| /de/en/schengen, advice-for-travellers-with-special-needs-to-and-from-the-usa, …/cognitive-impairment | info | 1440: +738, +669, +810 | no accordions, no tabs | not diagnosed |
| /de/en/business-class-on-short-and-medium-haul | info | 390: +247 (45.5 %, the sweep's worst) | | the columns-media rows from "Relaxation right from the start" on, 188 px lower |
| /de/en/data-collection-usa, data-collection-canada | legal | 1440: +2,282, +1,466 | | not diagnosed |
| /de/en/cookie-policy, terms-and-conditions-lh | legal | -695 / -851, 390: -510 | | not diagnosed |
| /de/en/online-check-in | app-entry | 390: -1,632 | 3 tab controls | www's panels at 390 |
| /de/en/book-and-manage/booking-services/manage-my-bookings | app-entry | 1440: +3 (2.4 % after the recapture) | | fine |
| /de/en/feedback/feedbackai | form | 1440: 900 vs 1,027 | | our page renders only the viewport (the form app's content missing) |

ema-test: nothing this round. The Insights width cause comes from sections merged by
lufthansa-sections.js (cards and text in one section); it is fixed in CSS, the transformer unchanged.

Not this sweep's to change: the two loungenet first-class lounge pages (fra-first-class-lounge-b,
muc-first-class-lounge) are the same page on www (equal heights) and on ours.

## Every page and width, worst first

Columns: diff % (masked); heights (8000+ = past www's capture limit; the difference in brackets is
the full scrollHeight); h1 offset (ours − www, px); first element 16 px or more off; the largest
step between neighbours (ours − www); pictures located in www's screenshot and how many differ in
height; the cause where found.

### lufthansa.com (296 pages, 592 page-widths)

| Page | Template | Width | Diff % | Height www → ours | h1 | First drift ≥16 px (ours vs www) | Largest step | Pictures found, height differs | Cause |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| /de/en/business-class-on-short-and-medium-haul | info | 390 | 45.5 | 3900 → 4147 (+247) | - | picture "in columns-media 346x149" +188 | "Relaxation right from the start" → picture "in columns-media 346x149" +188 | 5/6 |  |
| /de/en/100-years/fleet | campaign | 1440 | 38.5 | 8000+ → 8000+ (-9685) | - | h2 "Junkers F 13" -28 | "columns-media" → h2 "Quiet turboprop over Europe" -124 | 0/9 | www's 15 spec tables missing: no table mapping in the campaign template (fixed, brief 472: re-import) |
| /de/en/online-check-in | app-entry | 390 | 37.4 | 5650 → 4018 (-1632) | - | picture "in columns-media.slider 346x260" +16 | "Check in online now" → block "columns-media" -1668 | 6/7 | app-entry (ema-cashub): www's three tab panels at 390 (1,632 px taller) |
| /de/en/overview-manage | hub | 390 | 37.4 | 4356 → 4460 (+104) | 0 | h2 "Check-in" +176 | "Manage" → h2 "Check-in" +176 | 6/7 | www (2026-11-06) shows the Check-in card without its picture, our document (snapshot 2026-10-21) has it: a fresh snapshot decides |
| /de/en/articles/tags/allegris | insights | 1440 | 37.3 | 7492 → 7032 (-460) | - | block "columns-media" -16 | "Find Out More About the Lufthansa " → picture "in section 1264x542" -28 | 8/10, 1 differ | its document was re-imported during the sweep (brief 464 list: the More Stories tiles); the later run measured 34.3 % (1440) and 30.4 % (390) |
| /content/lh/markets/de/en/during-your-trip/lounges/loungenet/fra-first-class-lounge-b | lounge | 390 | 36.7 | 6129 → 6296 (+167) | 0 | picture "in columns-media 346x148" -82 | "in columns-media 346x149" → picture "in columns-media 346x149" +488 | 13/15 | lounge pages: www captured the same page under both paths (equal heights) |
| /content/lh/markets/de/en/during-your-trip/lounges/loungenet/muc-first-class-lounge | lounge | 390 | 36.7 | 6129 → 6296 (+167) | 0 | picture "in columns-media 346x148" -82 | "in columns-media 346x149" → picture "in columns-media 346x149" +488 | 13/15 | lounge pages: www captured the same page under both paths (equal heights) |
| /de/en/articles/tags/allegris | insights | 390 | 36.5 | 7897 → 7432 (-465) | -16 | h1 "Lufthansa Allegris - A New Flight " -16 | "in blog-overview.blog-overview-ima" → picture "in section 346x149" -54 | 9/10 | its document was re-imported during the sweep (brief 464 list: the More Stories tiles); the later run measured 34.3 % (1440) and 30.4 % (390) |
| /de/en/most-significant-route | campaign | 390 | 34.4 | 2783 → 4203 (+1420) | - | picture "in section 346x148" +28 | "breadcrumb" → picture "in section 346x148" +28 | 1/1 | its accordion flattened into the page: no accordion mapping in the campaign template (fixed, brief 472: re-import) |
| /de/en/economy-class | info | 390 | 34.1 | 8000+ → 8000+ (+203) | - | block "hero-campaign" +20 | "in columns-media 346x195" → block "columns-media.padded" +46 | 9/14 |  |
| /de/en/discover-lufthansa/take-off | campaign | 390 | 33.9 | 6888 → 6734 (-154) | 0 | block "cards-teaser.spacious" -28 | "Travel ID: one login – lots of opt" → picture "in cards-teaser.spacious 346x148" -50 | 10/11 |  |
| /de/en/data-collection-canada | legal | 1440 | 33.4 | 4277 → 5743 (+1466) | 0 | h2 "Requirements for entry or transit " -40 | "Requirements for entry or transit " → h2 "Electronic Travel Authorization (e" -50 | 1/4 | legal (ema-cashub): page 500-2,300 px off www's height; not diagnosed |
| /de/en/100-years/campaigns | campaign | 390 | 33.1 | 8000+ → 8000+ (-830) | - | picture "in section 346x236" -46 | "in columns-media.padded 346x517" → picture "in columns-media.padded 346x525" -58 | 4/12 | page 800-3,100 px shorter than www's; not diagnosed this round (campaign, mine) |
| /de/en/schengen | info | 1440 | 32.8 | 3112 → 3850 (+738) | - | picture "in columns-media 622x267" +24 | "Entry into the “Schengen Area” in " → picture "in columns-media 622x267" +24 | 2/2 | info (ema-cashub): page 670-8,100 px taller than www's; not diagnosed (no accordions or tabs on www) |
| /de/en/book-and-manage/flights/wetlease-hub | info | 1440 | 32.5 | 2943 → 3394 (+451) | - | block "hero-campaign.right" +22 | - | 1/2 |  |
| /content/lh/markets/de/en/during-your-trip/lounges/loungenet/fra-first-class-lounge-b | lounge | 1440 | 32.2 | 4286 → 4662 (+376) | - | picture "in columns-media 408x175" -36 | "in columns-media 408x175" → h2 "Lufthansa Allegris First Class" +472 | 11/15 | lounge pages: www captured the same page under both paths (equal heights) |
| /content/lh/markets/de/en/during-your-trip/lounges/loungenet/muc-first-class-lounge | lounge | 1440 | 32.2 | 4286 → 4662 (+376) | - | picture "in columns-media 408x175" -36 | "in columns-media 408x175" → h2 "Lufthansa Allegris First Class" +472 | 11/15 | lounge pages: www captured the same page under both paths (equal heights) |
| /de/en/first-class-terminal | info | 390 | 32.2 | 8000+ → 8000+ (+236) | - | block "hero-campaign" +36 | "in section 346x195" → block "columns-media" +52 | 9/15, 1 differ |  |
| /de/en/travelling-healthy | info | 390 | 32.2 | 4656 → 4090 (-566) | 0 | h2 "Medical care form" -80 | "accordion-columns.faq.spaced" → h2 "Medical care form" -84 | 1/4 | info (ema-cashub): www's accordions and tabs not all imported as accordion blocks / tab sections (counts in the list below) |
| /de/en/lufthansa-express-bus | info | 1440 | 32.1 | 4884 → 6705 (+1821) | - | h2 "Book Lufthansa Express Bus" -44 | "Book Lufthansa Express Bus" → block "columns-media" +1838 | 1/11 | info (ema-cashub): www's accordions and tabs not all imported as accordion blocks / tab sections (counts in the list below) |
| /de/en/shopping | info | 390 | 31.9 | 8000+ → 8000+ (-201) | - | block "hero-campaign" -166 | "columns-media.nested-4.padded" → block "hero-campaign" -166 | 6/12 |  |
| /de/en/travelling-healthy | info | 1440 | 31.6 | 3846 → 3304 (-542) | 0 | block "accordion-columns.faq.spaced" +20 | "accordion-columns.faq.spaced" → h2 "Medical care form" +84 | 1/4 | info (ema-cashub): www's accordions and tabs not all imported as accordion blocks / tab sections (counts in the list below) |
| /de/en/data-collection-usa | legal | 1440 | 31.1 | 5295 → 7577 (+2282) | - | picture "in section 1264x542" -26 | "in section 1264x542" → h2 "Requirements for a visa-free entry" +1250 | 1/4 | legal (ema-cashub): page 500-2,300 px off www's height; not diagnosed |
| /de/en/traveltricks | info | 390 | 30.9 | 4536 → 4360 (-176) | 0 | picture "in columns-media 346x180" -212 | "in section 346x111" → picture "in columns-media 346x180" -212 | 5/6 |  |
| /de/en/articles/explore-the-world/picture-perfect-austin | insights | 390 | 30.6 | 8000+ → 8000+ (+189) | 0 | block "columns-media" +20 | - | 4/10 |  |
| /de/en/advance-seat-reservation | info | 1440 | 30.3 | 8000+ → 8000+ (-604) | 0 | h2 "European flights (incl. Middle Eas" +20 | "Back Seat" → block "accordion-columns.faq" +138 | 5/13 | info (ema-cashub): www's accordions and tabs not all imported as accordion blocks / tab sections (counts in the list below) |
| /de/en/100-years/destinations | campaign | 1440 | 30.1 | 8000+ → 8000+ (-1476) | - | block "hero-campaign" -16 | "in section 1264x711" → block "columns-media.sidebar" -178 | 7/9 | page 800-3,100 px shorter than www's; not diagnosed this round (campaign, mine) |
| /de/en/discover-lufthansa/new-onboard-experience | campaign | 390 | 30 | 8000+ → 8000+ (-396) | - | block "columns-media.padded" +24 | "in columns-media.padded 346x231" → picture "in columns-media.sidebar 346x346" -66 | 8/17 |  |
| /de/en/book-and-manage/stopover | campaign | 1440 | 29.7 | 8000+ → 8000+ (+2652) | - | block "columns-media.padded" +32 | "in section 1050x525" → block "carousel-cards.four-up" +68 | 16/26, 1 differ | FAQ accordions flattened into the page: the campaign template had no accordion mapping (fixed, brief 472: re-import) |
| /de/en/feedback/feedbackai | form | 1440 | 29.6 | 1027 → 900 (-127) | - | - | - | 0/0 | form (ema-cashub): our page renders 900 px (the form app's content missing) |
| /de/en/tips-senior-travellers | info | 1440 | 29.4 | 8000+ → 8000+ (-423) | - | block "carousel-cards.grid.four-up" -32 | "columns-media.padded" → h2 "Find your airport lounge" -64 | 9/11 |  |
| /de/en/lufthansa-business-class-on-long-haul-routes | info | 1440 | 29 | 3169 → 3306 (+137) | - | picture "in columns-media 622x267" +24 | "in columns-media 622x267" → h2 "Benefits of Business Class" +90 | 5/5 |  |
| /de/en/frankfurt-fair | campaign | 1440 | 28.5 | 3524 → 4380 (+856) | - | - | - | 1/5 | document older than the importer: the benefits grid and the three text columns flattened (re-import) |
| /de/en/first-class | info | 390 | 27.7 | 8000+ → 8000+ (-832) | - | block "hero-campaign.regular" -20 | "in columns-media 346x195" → block "columns-media.padded" -58 | 10/12 | info (ema-cashub): www's tab controls shown one under the other (counts below) |
| /de/en/discover-lufthansa/new-onboard-experience | campaign | 1440 | 27.6 | 8000+ → 8000+ (-447) | - | block "columns-media.padded" +24 | "in columns-media.padded 622x415" → block "columns-media.sidebar" -64 | 12/19 |  |
| /de/en/articles/explore-the-world/a-perfect-day-barcelona-in-one-day | insights | 1440 | 27.5 | 7608 → 7273 (-335) | -2 | block "price-bar.price-bar-visible" -48 | "in columns-media.stacked 517x221" → block "columns-media" -196 | 11/25 | article text after the "may also interest you" cards at 83% instead of two thirds (fixed, brief 472: CSS; 27.5 → 21.4 %, 24.5 → 18.1 %) |
| /de/en/lufthansa-terminal-muenchen | info | 1440 | 27.5 | 4265 → 5668 (+1403) | 0 | h2 "Check-in and gate areas" -68 | "Accessible travel" → h2 "Other services at Munich Airport" +1456 | 1/5 | info (ema-cashub): www's tab controls shown one under the other (counts below) |
| /de/en/my-logbook | app-entry | 390 | 27.2 | 3445 → 3273 (-172) | 0 | h2 "Welcome on board!" -48 | "in section 346x148" → h2 "Just ask your parents…" -56 | 3/3 |  |
| /de/en/additional-services | hub | 1440 | 27.1 | 6773 → 6630 (-143) | - | block "hero-campaign" +26 | "A good journey starts with the rig" → block "cards-icon.usp.four-up" -44 | 7/22 |  |
| /de/en/gefaehrliche-gegenstaende | info | 1440 | 26.6 | 5024 → 4293 (-731) | 0 | block "accordion-columns.faq" +36 | "Further information" → block "columns-media" -680 | 3/3 | info (ema-cashub): www's accordions and tabs not all imported as accordion blocks / tab sections (counts in the list below) |
| /de/en/digital-self-services | hub | 1440 | 26.4 | 4430 → 3933 (-497) | 0 | h2 "Shortly before your flight" +34 | "cards-icon-text.partner" → block "cards-icon-text.partner" -56 | 4/4 |  |
| /de/en/advance-seat-reservation | info | 390 | 25.6 | 8000+ → 8000+ (-799) | 0 | - | - | 1/11 | info (ema-cashub): www's accordions and tabs not all imported as accordion blocks / tab sections (counts in the list below) |
| /de/en/airport-information | hub | 390 | 25.4 | 5465 → 5517 (+52) | - | block "cards-teaser.spacious" -26 | "breadcrumb" → block "cards-teaser.spacious" -26 | 8/8 |  |
| /de/en/articles/tags/munich | insights | 1440 | 25.1 | 7421 → 7574 (+153) | - | h2 "Highlights to Listen to – the Audi" +24 | "in columns-media 622x267" → h2 "Two Days for the Highlights – That" +88 | 16/18 |  |
| /de/en/100-years/cabin-design | campaign | 390 | 24.9 | 8000+ → 8000+ (-905) | - | block "hero-campaign.hero-campaign-video-" -48 | "in hero-campaign.hero-campaign-vid" → picture "in section 346x172" +52 | 8/15 | page 800-3,100 px shorter than www's; not diagnosed this round (campaign, mine) |
| /de/en/100-years/fleet | campaign | 390 | 24.9 | 8000+ → 8000+ (-16146) | -24 | h1 "Pioneers of passenger aviation" -24 | "Pioneers of passenger aviation" → picture "in section 346x195" -58 | 3/11, 1 differ | www's 15 spec tables missing: no table mapping in the campaign template (fixed, brief 472: re-import) |
| /de/en/100-years/history | campaign | 390 | 24.9 | 8000+ → 8000+ (+68) | - | block "columns-media.padded" +22 | "in columns-media.padded 346x195" → block "cards-teaser" +44 | 9/11 |  |
| /de/en/feedback/feedbackai | form | 390 | 24.8 | 1153 → 1031 (-122) | - | - | - | 0/0 | form (ema-cashub): our page renders 900 px (the form app's content missing) |
| /de/en/articles/explore-the-world/a-perfect-day-berlin-in-one-day | insights | 1440 | 24.5 | 8000+ → 7759+ (-306) | -2 | block "price-bar.price-bar-visible" -48 | "in carousel-cards.article 336x189" → block "columns-media.stacked" -162 | 11/22 | article text after the "may also interest you" cards at 83% instead of two thirds (fixed, brief 472: CSS; 27.5 → 21.4 %, 24.5 → 18.1 %) |
| /de/en/meetings-and-events | hub | 1440 | 24.5 | 3534 → 3131 (-403) | - | block "columns-media" -56 | "cards-teaser.three-up.phone-slider" → h2 "Benefits" -150 | 3/8 | "Request offer now" a link, not www's yellow button; the steps' spacing (hub, mine: open) |
| /de/en/prepare-for-your-trip/travelling-with-children/planning-with-kids | info | 390 | 24.5 | 4750 → 4510 (-240) | 0 | block "columns-media.padded" -242 | "in section 346x111" → block "columns-media.padded" -242 | 3/3 |  |
| /de/en/100-years/campaigns | campaign | 1440 | 24.2 | 8000+ → 8000+ (-814) | - | picture "in section 1264x862" -66 | "in columns-media.padded 622x69" → block "columns-media.padded" +212 | 8/14 | page 800-3,100 px shorter than www's; not diagnosed this round (campaign, mine) |
| /de/en/childrens-menus-on-board | info | 390 | 24.2 | 5392 → 5314 (-78) | - | picture "in columns-media.padded 346x149" -100 | "Children’s menus – great taste for" → picture "in columns-media.padded 346x149" -102 | 5/5 |  |
| /de/en/overview-special-request | hub | 390 | 24.1 | 3936 → 3867 (-69) | 0 | h2 "Families" +16 | "Families" → picture "in cards-teaser 346x149" -52 | 6/6 |  |
| /de/en/articles/highlights/all-it-takes-is-a-yes | insights | 1440 | 24 | 6737 → 6663 (-74) | -82 | block "columns-media" -16 | "1. Increase Adaptability" → h2 "2. Become More Resilient" -40 | 12/17 |  |
| /de/en/book-and-manage/flights/giftvoucher | info | 390 | 24 | 6926 → 6716 (-210) | +26 | block "hero-campaign.regular" +26 | "hero-campaign.regular" → picture "in hero-campaign.regular 390x640" -442 | 5/5, 1 differ |  |
| /de/en/baggage-irregularities | info | 1440 | 23.8 | 3922 → 5662 (+1740) | 0 | h2 "Delayed baggage" +34 | "Procedure for delayed baggage" → h2 "Frequently asked questions about d" +1810 | 0/6 | info (ema-cashub): www's accordions and tabs not all imported as accordion blocks / tab sections (counts in the list below) |
| /de/en/food-and-beverages | hub | 390 | 23.8 | 6683 → 6548 (-135) | 0 | block "hero-banner" -42 | "in hero-banner 390x101" → picture "in columns-media 346x231" -82 | 7/8 |  |
| /de/en/lufthansa-terminal-muenchen | info | 390 | 23.7 | 6614 → 7083 (+469) | - | block "columns-media" +440 | "in section 346x111" → block "columns-media" +440 | 3/5 | info (ema-cashub): www's tab controls shown one under the other (counts below) |
| /de/en/lufthansa-business-class-on-long-haul-routes | info | 390 | 23.6 | 4467 → 4560 (+93) | - | h2 "Benefits of Business Class" +60 | "in columns-media 346x149" → h2 "Benefits of Business Class" +46 | 5/5 |  |
| /de/en/articles/highlights/allegris-premium-economy-san-diego | insights | 1440 | 23.4 | 6730 → 6678 (-52) | - | block "columns-media" +40 | "in columns-media 1053x452" → picture "in section 1053x452" -172 | 7/12, 1 differ |  |
| /de/en/exclusive-charter | info | 390 | 23.4 | 2705 → 2778 (+73) | - | h2 "This might also be of interest to " +68 | "in section 346x111" → h2 "This might also be of interest to " +68 | 3/4 |  |
| /de/en/economy-class | info | 1440 | 23.2 | 8000+ → 8000+ (+149) | +16 | block "hero-campaign" +20 | "in columns-media 622x350" → block "columns-media.padded" +48 | 13/17 |  |
| /de/en/premium-economy-class | info | 390 | 23.2 | 8000+ → 8000+ (+117) | - | block "hero-campaign" +20 | "in columns-media 346x195" → block "columns-media.padded" +48 | 10/12 |  |
| /de/en/articles/explore-the-world/picture-perfect-austin | insights | 1440 | 23 | 7969 → 8000+ (+55) | - | block "columns-media" -42 | "in columns-media.stacked 517x221" → block "columns-media" -34 | 4/13 |  |
| /de/en/during-your-trip/internet-overview | info | 390 | 22.5 | 4671 → 4733 (+62) | - | block "hero-campaign.regular" +20 | "profile-nav" → block "hero-campaign.regular" +20 | 6/6 |  |
| /de/en/entryprocesses | info | 390 | 22.4 | 5147 → 5142 (-5) | - | block "columns-media" +16 | "in columns-media 346x148" → h2 "Travel regulations for popular des" +50 | 7/8 |  |
| /de/en/most-significant-route | campaign | 1440 | 22.3 | 2583 → 2839 (+256) | - | h2 "Stopover" +302 | "in section 1144x490" → h2 "Stopover" +302 | 1/1, 1 differ | its accordion flattened into the page: no accordion mapping in the campaign template (fixed, brief 472: re-import) |
| /de/en/advice-for-travellers-with-special-needs-to-and-from-the-usa | info | 1440 | 22 | 6113 → 6782 (+669) | - | h2 "Please tell us in advance" +26 | "columns-media" → block "carousel-cards.grid.four-up" +828 | 7/13 | info (ema-cashub): page 670-8,100 px taller than www's; not diagnosed (no accordions or tabs on www) |
| /de/en/data-collection-canada | legal | 390 | 21.7 | 5488 → 5319 (-169) | 0 | h2 "Electronic Travel Authorization (e" -44 | "in section 346x149" → picture "in section 346x148" -52 | 4/4 | legal (ema-cashub): page 500-2,300 px off www's height; not diagnosed |
| /de/en/discover-lufthansa/miles-and-more-credit-card | info | 390 | 21.7 | 8000+ → 8000+ (-210) | -132 | picture "in columns-media.padded 346x149" -34 | "in columns-media.padded 346x149" → picture "in columns-media.padded 346x149" -60 | 7/7 |  |
| /de/en/baggage-irregularities | info | 390 | 21.4 | 5161 → 4783 (-378) | 0 | block "columns-media" -76 | "in section 346x111" → block "columns-media" -76 | 1/6 | info (ema-cashub): www's accordions and tabs not all imported as accordion blocks / tab sections (counts in the list below) |
| /de/en/100-years/chronicle | campaign | 1440 | 21.3 | 8000+ → 8000+ (-3119) | -156 | block "hero-campaign" -28 | "1934" → block "columns-media.padded" -48 | 11/13 | page 800-3,100 px shorter than www's; not diagnosed this round (campaign, mine) |
| /de/en/100-years | campaign | 390 | 21.1 | 8000+ → 8000+ (+15) | - | block "columns-media.padded" +24 | "in columns-media.sidebar 346x195" → block "hero-campaign.right.card" +32 | 6/10 |  |
| /de/en/articles/explore-the-world/be-picky-barcelona-insider-tips | insights | 390 | 21.1 | 7635 → 7746 (+111) | - | block "columns-media.stacked" +42 | "in carousel-cards.article 344x194" → block "columns-media.stacked" +30 | 9/11 |  |
| /de/en/my-logbook | app-entry | 1440 | 20.8 | 3111 → 3014 (-97) | 0 | h2 "Welcome on board!" -32 | "in section 938x402" → h2 "Just ask your parents…" -36 | 3/3 |  |
| /de/en/overview-manage | hub | 1440 | 20.7 | 3284 → 3350 (+66) | 0 | h2 "Check-in" +314 | "in cards-teaser.spacious 622x267" → h2 "Check-in" +306 | 6/7 | www (2026-11-06) shows the Check-in card without its picture, our document (snapshot 2026-10-21) has it: a fresh snapshot decides |
| /de/en/boeing787 | fleet | 390 | 20.5 | 8000+ → 8000+ (+222) | - | h2 "Boeing 787-9" -38 | "in carousel-lightbox 346x149" → picture "in columns-media 346x195" +116 | 7/17 |  |
| /de/en/book-and-manage/flights/ana/faq | info | 1440 | 20.4 | 3281 → 2993 (-288) | - | block "accordion-columns.faq.limited-widt" -16 | "Check-in" → h2 "Indirect flights" -64 | 0/0 |  |
| /de/en/first-class | info | 1440 | 20.4 | 8000+ → 8000+ (-907) | 0 | block "hero-campaign.regular" -24 | "in columns-media 1264x711" → block "columns-media.padded" -34 | 10/12 | info (ema-cashub): www's tab controls shown one under the other (counts below) |
| /de/en/100-years/cabin-design | campaign | 1440 | 20.1 | 8000+ → 8000+ (-1215) | - | block "columns-media.padded" -34 | "in columns-media.padded 622x350" → picture "in columns-media.padded 622x69" -78 | 13/19 | page 800-3,100 px shorter than www's; not diagnosed this round (campaign, mine) |
| /de/en/100-years/global-network | campaign | 390 | 20 | 8000+ → 8000+ (-430) | -38 | block "carousel-images" -112 | "in columns-media.sidebar 346x231" → block "carousel-images" -122 | 7/23 | page 800-3,100 px shorter than www's; not diagnosed this round (campaign, mine) |
| /de/en/traveltricks | info | 1440 | 20 | 3772 → 3701 (-71) | - | block "columns-media" -54 | "in section 1264x405" → block "columns-media" -54 | 6/6 |  |
| /de/en/articles/explore-the-world/eat-see-do-algiers | insights | 390 | 19.9 | 8000+ → 8000+ (+88) | - | picture "in section 346x148" +42 | "in carousel-cards.article 344x194" → picture "in section 346x148" +28 | 7/11 |  |
| /de/en/culinaryjourney | campaign | 390 | 19.9 | 1911 → 2045 (+134) | - | block "micro-frontend" +26 | "micro-frontend" → h2 "Need help?" +54 | 0/0 |  |
| /de/en/green-fare | info | 390 | 19.7 | 7325 → 6876 (-449) | - | h2 "Contribute to future CO2 emission " -550 | "breadcrumb" → h2 "Contribute to future CO2 emission " -550 | 0/3 |  |
| /de/en/discover-lufthansa/take-off | campaign | 1440 | 19.6 | 4512 → 4578 (+66) | - | picture "in cards-teaser.spacious 622x267" +24 | "More sustainable air travel" → picture "in cards-teaser.spacious 622x267" +18 | 10/11 |  |
| /de/en/articles/tags/munich | insights | 390 | 19.5 | 8000+ → 8000+ (+68) | - | h2 "Highlights to Listen to – the Audi" -16 | "in blog-overview.blog-overview-ima" → picture "in blog-overview.blog-overview-ima" -46 | 13/18 |  |
| /de/en/free2move | info | 1440 | 19.4 | 3054 → 2917 (-137) | 0 | picture "in section 1264x404" -40 | "Book Free2move" → block "columns-media" -82 | 1/5 |  |
| /de/en/secure-flight | info | 1440 | 19.4 | 1247 → 1376 (+129) | 0 | - | - | 0/0 |  |
| /de/en/prepare-for-your-trip/entry-regulations/entering-schengen/entry-exit-system | info | 390 | 19.3 | 8000+ → 8000+ (-270) | - | picture "in columns-media.padded 346x231" -282 | "columns-media" → picture "in columns-media.padded 346x231" -278 | 5/8 |  |
| /de/en/100-years/history/menu-on-board | campaign | 390 | 19.1 | 8000+ → 8000+ (+22) | 0 | h2 "Induglence in the early years" +28 | "in section 346x175" → h2 "Induglence in the early years" +28 | 11/16 |  |
| /de/en/articles/explore-the-world/what-i-learned-living-in-barcelona | insights | 390 | 19.1 | 8000+ → 8000+ (+77) | - | block "columns-media.stacked" +44 | "in columns-media 346x149" → picture "in related-articles 326x183" +84 | 8/11 |  |
| /de/en/carry-on-baggage | info | 1440 | 18.9 | 6601 → 6300 (-301) | - | block "cards-icon-text.partner" +22 | "cards-icon-text.partner" → block "columns-media.link-list" -88 | 2/12 | info (ema-cashub): www's accordions and tabs not all imported as accordion blocks / tab sections (counts in the list below) |
| /de/en/additional-services | hub | 390 | 18.8 | 8000+ → 8000+ (-88) | - | block "hero-campaign" +26 | "cards-icon.usp" → picture "in cards-icon.usp 88x88" -32 | 6/22, 1 differ |  |
| /de/en/unterhaltung-an-bord | info | 390 | 18.7 | 3681 → 3482 (-199) | 0 | - | - | 0/1 |  |
| /de/en/premium-economy-class | info | 1440 | 18.6 | 7074 → 7138 (+64) | +26 | block "hero-campaign" +16 | "in columns-media 622x350" → block "columns-media.padded" +46 | 11/13 |  |
| /de/en/unterhaltung-an-bord | info | 1440 | 18.6 | 2960 → 3104 (+144) | 0 | picture "in section 1440x462" +44 | "Lufthansa in-flight entertainment" → picture "in section 1440x462" +44 | 1/1 |  |
| /de/en/gefaehrliche-gegenstaende | info | 390 | 18.5 | 8000+ → 7061+ (-1484) | 0 | block "cards-icon-text.partner" +40 | "Further information" → picture "in columns-media 346x149" -722 | 1/3, 1 differ | info (ema-cashub): www's accordions and tabs not all imported as accordion blocks / tab sections (counts in the list below) |
| /de/en/lufthansa-group-star-alliance-and-partner-airlines | info | 1440 | 18.4 | 6036 → 8000+ (+8116) | - | - | - | 1/23 | info (ema-cashub): page 670-8,100 px taller than www's; not diagnosed (no accordions or tabs on www) |
| /de/en/menus-on-long-haul-flights | info | 390 | 18.3 | 4584 → 4678 (+94) | - | picture "in columns-media 346x148" +24 | "in columns-media 346x149" → block "columns-media" +46 | 7/7 |  |
| /de/en/arrival-services | info | 1440 | 18.2 | 3726 → 3854 (+128) | 0 | h2 "Complimentary: a stay in one of ou" +48 | "Complimentary: a stay in one of ou" → block "columns-media.padded" +60 | 2/2 |  |
| /de/en/book-and-manage/additional-services/travel-insurances | info | 1440 | 18.1 | 2769 → 2910 (+141) | 0 | h2 "Travel Guard* - Travel Care" +70 | "The right insurance cover for your" → h2 "Travel Guard* - Travel Care" +70 | 3/3 |  |
| /de/en/100-years/global-network | campaign | 1440 | 18 | 8000+ → 8000+ (-908) | 0 | block "columns-media.sidebar" +26 | "in columns-media.sidebar 938x339" → h1 "1933-1945" +88 | 8/23 | page 800-3,100 px shorter than www's; not diagnosed this round (campaign, mine) |
| /de/en/cancellations-and-refunds | info | 390 | 18 | 3130 → 3070 (-60) | - | h2 "This might also be of interest to " -40 | "Options for your refund" → h2 "This might also be of interest to " -40 | 4/4 |  |
| /de/en/during-your-trip/lhg-wifi | info | 390 | 17.9 | 6043 → 6289 (+246) | - | block "hero-campaign.regular" +20 | "columns-media.padded" → picture "in columns-media 346x149" +40 | 2/8 |  |
| /de/en/lufthansa-am-flughafen-frankfurt | info | 1440 | 17.9 | 4115 → 4350 (+235) | - | h2 "First Class Check-in Area" +30 | "Bag drop-off" → h2 "Time slot for security check" +192 | 1/3 |  |
| /de/en/articles/highlights/all-it-takes-is-a-yes | insights | 390 | 17.8 | 7444 → 7467 (+23) | - | block "columns-media" -16 | "Explore more" → picture "in cards-teaser.overlay 346x149" +226 | 8/13 |  |
| /de/en/during-your-trip/lhg-wifi | info | 1440 | 17.8 | 3979 → 4182 (+203) | +24 | block "hero-campaign.regular" +22 | "columns-media.padded" → h2 "Frequently Asked Questions" +82 | 1/8 |  |
| /de/en/articles/explore-the-world/a-perfect-day-barcelona-in-one-day | insights | 390 | 17.6 | 8000+ → 8000+ (+65) | - | picture "in section 346x148" +32 | "in section 256x256" → block "carousel-cards.article" -38 | 9/18 |  |
| /de/en/articles/explore-the-world/be-picky-frankfurt-insider-tips | insights | 390 | 17.6 | 5101 → 5167 (+66) | - | block "columns-media" +20 | - | 5/8 |  |
| /de/en/articles/highlights/allegris-premium-economy-san-diego | insights | 390 | 17.6 | 7206 → 7305 (+99) | 0 | picture "in section 346x148" -38 | "in columns-media 346x149" → picture "in related-articles 326x183" +56 | 6/12 |  |
| /de/en/book-and-manage/stopover/neuschwanstein | campaign | 1440 | 17.6 | 2999 → 3098 (+99) | - | h2 "Book a stopover in Munich" +50 | "in section 256x256" → h2 "Book a stopover in Munich" +60 | 2/21 |  |
| /de/en/food-and-beverages | hub | 1440 | 17.6 | 5085 → 4986 (-99) | - | block "hero-banner" -42 | "in hero-banner 180x720" → h2 "Culinary journey: all routes lead " -58 | 8/8 |  |
| /de/en/book-and-manage/stopover/bayerischer-hof | campaign | 1440 | 17.5 | 2935 → 3026 (+91) | - | picture "in section 256x256" +98 | "in section 256x256" → picture "in section 256x256" -130 | 3/21, 1 differ |  |
| /de/en/book-and-manage/stopover | campaign | 390 | 17.4 | 8000+ → 8000+ (+5295) | - | block "hero-campaign" +26 | "in carousel-cards.four-up 344x344" → block "carousel-cards.grid" -94 | 4/21 | FAQ accordions flattened into the page: the campaign template had no accordion mapping (fixed, brief 472: re-import) |
| /de/en/book-and-manage/flights/wetlease-hub | info | 390 | 17.3 | 3399 → 3310 (-89) | - | h2 "Our wet lease partners" +32 | "Our wet lease partners" → block "columns-media" -32 | 1/2, 1 differ |  |
| /de/en/book-and-manage/stopover/zugspitze | campaign | 390 | 17.2 | 3991 → 4115 (+124) | 0 | picture "in section 346x111" +16 | "in section 256x256" → picture "in columns-media 346x149" -236 | 3/9, 1 differ |  |
| /de/en/exclusive-charter | info | 1440 | 17.1 | 2095 → 2183 (+88) | 0 | block "columns-media" +86 | "in section 1264x405" → block "columns-media" +86 | 2/4 |  |
| /de/en/320 | fleet | 390 | 17 | 6758 → 6866 (+108) | - | picture "in columns-media.padded 346x195" -24 | "in carousel-lightbox 346x166" → h2 "Seat maps of the Airbus A320-200 f" +74 | 5/15 |  |
| /de/en/medikamenten-transport | info | 390 | 17 | 4154 → 4105 (-49) | - | block "columns-media.padded" -54 | "How it works" → block "columns-media.padded" -50 | 5/5 |  |
| /de/en/articles/explore-the-world/eat-see-do-berlin | insights | 390 | 16.9 | 8000+ → 8000+ (+89) | - | picture "in section 346x148" +40 | "in carousel-cards.article 344x194" → picture "in section 346x148" +28 | 8/8 |  |
| /de/en/articles/explore-the-world/on-the-scene-caspar-plautz-munich | insights | 390 | 16.9 | 6746 → 6847 (+101) | - | block "related-articles" +16 | "in columns-media 346x149" → block "related-articles" +22 | 7/14 |  |
| /de/en/boeing787 | fleet | 1440 | 16.9 | 7544 → 7737 (+193) | - | h2 "Boeing 787-9" -48 | "in carousel-lightbox 622x269" → h2 "Downloadable seat maps of the Boei" +70 | 11/17 |  |
| /de/en/book-and-manage/additional-services/travel-insurances | info | 390 | 16.9 | 3488 → 3583 (+95) | - | h2 "Terms and conditions of insurance" +72 | "breadcrumb" → h2 "Terms and conditions of insurance" +72 | 1/3 |  |
| /de/en/business-class-on-short-and-medium-haul | info | 1440 | 16.9 | 2867 → 2836 (-31) | - | picture "in columns-media 622x267" -16 | "in columns-media 622x267" → picture "in columns-media 622x267" -16 | 5/6 |  |
| /de/en/discover-lufthansa/lufthansa-fleet/351 | fleet | 1440 | 16.9 | 7761 → 7633 (-128) | - | block "carousel-lightbox" +38 | "in carousel-lightbox 622x266" → h2 "Seat maps of the Airbus A350-1000 " -272 | 11/17 |  |
| /de/en/entryprocesses | info | 1440 | 16.9 | 2779 → 2833 (+54) | - | h2 "Travel regulations for popular des" +54 | "in columns-media 622x267" → h2 "Travel regulations for popular des" +46 | 7/8 |  |
| /de/en/100-years | campaign | 1440 | 16.8 | 8000+ → 8000+ (-83) | - | block "cards-teaser" +22 | "More about Lufthansa’s 100th anniv" → picture "in section 1264x101" -66 | 9/12 |  |
| /de/en/lufthansa-guide-service | info | 390 | 16.8 | 5471 → 5894 (+423) | 0 | block "table-striped" +20 | "table-striped" → h2 "Lufthansa Guides meeting and escor" +172 | 0/0 |  |
| /de/en/32n | fleet | 390 | 16.7 | 6954 → 7049 (+95) | - | picture "in columns-media.padded 346x195" -20 | "in carousel-lightbox 346x149" → h2 "Seat maps of the Airbus A320neo fo" +72 | 6/15 |  |
| /de/en/digital-self-services | hub | 390 | 16.7 | 5489 → 5627 (+138) | 0 | block "jump-links" -16 | "cards-icon-text.partner" → h2 "Other services" -222 | 1/4 |  |
| /de/en/first-class-terminal | info | 1440 | 16.7 | 8000+ → 8000+ (+172) | - | block "hero-campaign" +24 | "in section 1264x711" → block "columns-media" +48 | 8/14, 1 differ |  |
| /de/en/feedback | info | 390 | 16.6 | 3698 → 3476 (-222) | - | h2 "Flight disruptions: compensation a" -32 | "Flight disruptions: compensation a" → h2 "Other contact forms" -154 | 0/0 |  |
| /de/en/lufthansa-am-flughafen-frankfurt | info | 390 | 16.6 | 6758 → 6604 (-154) | 0 | h2 "Bag drop-off" -50 | "Bag drop-off" → h2 "Time slot for security check" -52 | 3/3 |  |
| /de/en/lh-rentalcar | info | 390 | 16.5 | 3591 → 3472 (-119) | 0 | h2 "Europcar" -26 | "in car-rental 346x148" → h2 "Hertz" -48 | 4/4 |  |
| /de/en/wheelchair-batteries | info | 390 | 16.4 | 4738 → 4449 (-289) | - | h2 "Wheelchairs driven by a non-spilla" -132 | "breadcrumb" → h2 "Wheelchairs driven by a non-spilla" -132 | 0/0 |  |
| /de/en/book-and-manage/rebook | info | 1440 | 16.1 | 1860 → 1782 (-78) | 0 | block "columns-media.padded" -24 | "Your flight was cancelled" → h2 "Not sure which applies?" -64 | 2/2 |  |
| /de/en/lufthansa-aviation-group | info | 1440 | 15.9 | 2750 → 2703 (-47) | - | picture "in columns-media 622x267" -20 | "Lufthansa Cargo" → picture "in columns-media 622x267" -20 | 6/6 |  |
| /de/en/100-years/history | campaign | 1440 | 15.8 | 8000+ → 8000+ (+9) | - | block "cards-teaser" +62 | "in columns-media.padded 622x350" → block "cards-teaser" +64 | 12/14 |  |
| /de/en/farealert/best-price-alert | form | 390 | 15.8 | 5363 → 5270 (-93) | - | picture "in columns-media.padded 346x368" -40 | "Sign in with Travel ID or subscrib" → picture "in columns-media.padded 346x368" -26 | 4/5 |  |
| /de/en/prepare-for-your-trip/special-travel-needs/travel-with-needs/cognitive-impairment | info | 1440 | 15.8 | 7577 → 8000+ (+810) | - | h2 "Travelling with a companion" -16 | "columns-media.padded" → block "columns-media.sidebar" -42 | 5/13 | info (ema-cashub): page 670-8,100 px taller than www's; not diagnosed (no accordions or tabs on www) |
| /de/en/terms-of-service-group | legal | 390 | 15.8 | 3976 → 3788 (-188) | 0 | h2 "Discover Airlines" -36 | "Brussels Airlines" → h2 "Eurowings" -52 | 0/0 |  |
| /de/en/terms-of-use | legal | 1440 | 15.8 | 3671 → 3932 (+261) | 0 | h2 "1. General" -24 | "2. Proprietary rights" → h2 "3. Permissible use" +42 | 0/0 |  |
| /de/en/common/seatreservation-condtions/seat-reservations | legal | 390 | 15.7 | 4095 → 3951 (-144) | - | h2 "My booking" -68 | "Seat selection" → h2 "My booking" -68 | 0/0 |  |
| /de/en/discover-lufthansa/lufthansa-fleet/351 | fleet | 390 | 15.7 | 8000+ → 8000+ (+157) | - | block "carousel-lightbox" +26 | "in carousel-lightbox 346x148" → h2 "Seat maps of the Airbus A350-1000 " +56 | 6/17 |  |
| /de/en/articles/explore-the-world/a-perfect-day-berlin-in-one-day | insights | 390 | 15.5 | 8000+ → 8000+ (+56) | - | picture "in section 346x148" +30 | "in section 256x256" → h2 "Our recommendations" -84 | 11/18 |  |
| /de/en/green-fare | info | 1440 | 15.5 | 5691 → 5522 (-169) | - | h2 "Contribute to future CO2 emission " -224 | "breadcrumb" → h2 "Contribute to future CO2 emission " -224 | 2/3, 1 differ |  |
| /de/en/articles/explore-the-world | insights | 1440 | 15.4 | 6344 → 6270 (-74) | -68 | picture "in poi-map 256x256" -30 | "in section 256x256" → h2 "Discover your dream destinations w" +122 | 8/47, 2 differ |  |
| /de/en/tips-senior-travellers | info | 390 | 15.4 | 8000+ → 8000+ (-279) | - | block "carousel-cards.grid.four-up" -32 | "columns-media.padded" → block "columns-media" -52 | 7/7 |  |
| /de/en/100-years/history/menu-on-board | campaign | 1440 | 15.3 | 8000+ → 8000+ (+16) | - | block "columns-media.sidebar" +16 | "in columns-media.sidebar 938x489" → h2 "The table settings" -32 | 8/15 |  |
| /de/en/articles/explore-flying/essentials-future-of-flying | insights | 390 | 15.3 | 5715 → 5891 (+176) | - | block "columns-media" +34 | "in section 346x148" → block "columns-media" +28 | 4/9 |  |
| /de/en/travelling-with-special-requirements | info | 390 | 15.3 | 3926 → 3897 (-29) | - | block "columns-media" -32 | "breadcrumb" → block "columns-media" -32 | 5/6 |  |
| /de/en/book-and-manage/rebook | info | 390 | 15.2 | 2374 → 2343 (-31) | - | block "columns-media.padded" -24 | "in columns-media.padded 346x149" → h2 "Not sure which applies?" -44 | 2/2 |  |
| /de/en/articles/explore-the-world/know-before-you-go-berlin | insights | 390 | 15.1 | 7415 → 7490 (+75) | - | picture "in section 346x148" +24 | "in section 346x148" → picture "in section 346x148" -26 | 4/11 |  |
| /de/en/wheelchair-batteries | info | 1440 | 15.1 | 3540 → 3300 (-240) | - | - | - | 0/0 |  |
| /de/en/100-years/crane | campaign | 390 | 15 | 8000+ → 8000+ (-192) | - | picture "in columns-media.padded 346x149" -32 | "columns-media.padded" → picture "in columns-media.padded 346x149" -42 | 8/14 |  |
| /de/en/support/feedback-and-contact-airlines | info | 390 | 15 | 4183 → 3985 (-198) | - | - | - | 0/7 |  |
| /de/en/free2move | info | 390 | 14.9 | 4380 → 4261 (-119) | 0 | picture "in section 346x111" -20 | "columns-media.padded" → h2 "Book Free2move" -64 | 1/5 |  |
| /de/en/100-years/chronicle | campaign | 390 | 14.8 | 8000+ → 8000+ (-1329) | -52 | block "jump-links.columns" -20 | "in columns-media.padded 346x149" → h2 "1933" -44 | 8/11 | page 800-3,100 px shorter than www's; not diagnosed this round (campaign, mine) |
| /de/en/articles/explore-the-world/what-i-learned-living-in-frankfurt | insights | 390 | 14.8 | 6027 → 6154 (+127) | - | block "columns-media" +20 | "in related-articles 326x183" → picture "in related-articles 326x183" +738 | 6/8 |  |
| /de/en/book-and-manage/stopover/zugspitze | campaign | 1440 | 14.8 | 3055 → 3145 (+90) | - | picture "in section 256x256" -114 | "in section 256x256" → picture "in section 256x256" -316 | 7/21, 5 differ |  |
| /de/en/discover-lufthansa/miles-and-more-credit-card | info | 1440 | 14.7 | 5118 → 4945 (-173) | -38 | picture "in columns-media.padded 622x267" -30 | "in columns-media.padded 622x267" → picture "in columns-media.padded 622x267" -30 | 7/7 |  |
| /de/en/articles/authors/florian-tomberg | insights | 390 | 14.6 | 3801 → 3712 (-89) | -44 | picture "in section 390x125" -20 | "in section 390x125" → h1 "All articles from Florian Tomberg" -24 | 3/8 |  |
| /de/en/doctor-on-board | info | 390 | 14.6 | 4812 → 5073 (+261) | - | h2 "Liability and insurance" +70 | "in section 346x114" → h2 "Liability and insurance" +70 | 1/1 |  |
| /de/en/during-your-trip/internet-overview | info | 1440 | 14.6 | 3133 → 3167 (+34) | - | block "hero-campaign.regular" +24 | "profile-nav" → block "hero-campaign.regular" +24 | 6/6 |  |
| /de/en/frankfurt-fair | campaign | 390 | 14.6 | 5310 → 5092 (-218) | 0 | block "subpage-nav" -224 | "in section 346x149" → block "subpage-nav" -224 | 1/5 | document older than the importer: the benefits grid and the three text columns flattened (re-import) |
| /de/en/hotel-offers | info | 390 | 14.6 | 4538 → 4527 (-11) | 0 | block "flight-search.standalone" -18 | "flight-search.standalone" → h2 "Earn miles with every stay" +68 | 5/5 |  |
| /de/en/prepare-for-your-trip/special-travel-needs/medical-travel-companions | info | 390 | 14.6 | 2747 → 2778 (+31) | - | picture "in section 346x111" +26 | "breadcrumb" → picture "in section 346x111" +26 | 2/4 |  |
| /de/en/check-in-baggage | info | 1440 | 14.5 | 3440 → 3472 (+32) | 0 | picture "in section 1264x542" +26 | "Baggage drop" → picture "in section 1264x542" +26 | 1/2 |  |
| /de/en/lufthansa-travel-classes | hub | 390 | 14.5 | 4688 → 4728 (+40) | 0 | block "columns-media.padded" -20 | "in hero-banner 390x101" → block "columns-media.padded" -22 | 9/9 |  |
| /de/en/prepare-for-your-trip/baggage/baggage-irregularities/report-baggage | form | 1440 | 14.5 | 2679 → 2538 (-141) | 0 | block "columns-media" -40 | "Quick help with delayed or damaged" → block "columns-media" -40 | 0/8 |  |
| /de/en/prepare-for-your-trip/baggage/baggage-irregularities/report-baggage | form | 390 | 14.5 | 4933 → 4726 (-207) | 0 | block "columns-media" -20 | "Quick help with delayed or damaged" → block "columns-media" -20 | 0/8 |  |
| /de/en/prepare-for-your-trip/getting-to-and-from-the-airport/lufthansa-express-rail-briefing | info | 390 | 14.5 | 3561 → 3453 (-108) | - | picture "in columns-media.padded 346x148" -138 | "breadcrumb" → picture "in columns-media.padded 346x148" -138 | 0/2 |  |
| /de/en/discover-lufthansa/flightreservation-priceguarantee | info | 390 | 14.4 | 4784 → 4733 (-51) | 0 | picture "in section 346x111" -26 | "columns-media" → h2 "Frequently Asked Questions" -44 | 2/6 |  |
| /de/en/hertz | info | 390 | 14.3 | 3787 → 3728 (-59) | 0 | picture "in car-rental 346x148" -70 | "Search" → picture "in car-rental 346x148" -70 | 1/1 |  |
| /de/en/lufthansa-at-berlin-airport | info | 390 | 14.3 | 4307 → 4462 (+155) | - | h2 "BER Runway" +16 | "in columns-media 346x149" → h2 "Getting there" +160 | 2/3 |  |
| /de/en/lufthansa-aviation-group | info | 390 | 14.3 | 3807 → 3800 (-7) | 0 | picture "in columns-media 346x149" +30 | "in columns-media 346x149" → picture "in columns-media 346x149" +20 | 6/6 |  |
| /de/en/onboard-delights | info | 390 | 14.3 | 8000+ → 8000+ (-603) | - | picture "in hero-campaign.right.regular 390" -24 | "in columns-media.stacked.padded 34" → h2 "Catering on board: just the way yo" +144 | 6/8, 1 differ | info (ema-cashub): www's tab controls shown one under the other (counts below) |
| /de/en/articles/explore-the-world/stop-over-tokyo | insights | 390 | 14.2 | 7337 → 7441 (+104) | - | - | - | 3/9 |  |
| /de/en/cancellations-and-refunds | info | 1440 | 14.1 | 2396 → 2309 (-87) | - | block "columns-media" -60 | "This might also be of interest to " → block "columns-media" -60 | 4/4 |  |
| /de/en/prepare-for-your-trip/baggage/baggage-irregularities/delayed-baggage-lhg | info | 390 | 14.1 | 4442 → 4249 (-193) | 0 | - | - | 0/7 |  |
| /de/en/check-in-with-the-family | info | 390 | 14 | 3295 → 3275 (-20) | 0 | block "columns-media.padded" -24 | "Simply check in from home or en ro" → block "columns-media.padded" -24 | 3/3 |  |
| /de/en/doctor-on-board-news | info | 1440 | 14 | 2450 → 2568 (+118) | - | h2 "This may also interest you" +16 | "accordion-columns.faq.spaced" → h2 "This may also interest you" +30 | 4/4 |  |
| /de/en/book-and-manage/flights/ana | info | 390 | 13.8 | 5116 → 5052 (-64) | 0 | block "columns-media.padded" -20 | "columns-media.padded" → h2 "What you need to remember" -40 | 2/2 |  |
| /de/en/common/compensation-voucher | legal | 390 | 13.8 | 6707 → 6465 (-242) | 0 | h2 "5. Refunds" -92 | "6. Liability" → h2 "10. Final provisions" -130 | 0/0 |  |
| /de/en/lufthansa-express-rail | info | 1440 | 13.8 | 7692 → 7828 (+136) | - | block "columns-media" -80 | "Frequently Asked Questions" → h2 "Lufthansa Express Rail – the perfe" +116 | 3/10 |  |
| /de/en/terms-of-service-group | legal | 1440 | 13.8 | 2237 → 2125 (-112) | - | h2 "Austrian Airlines" -18 | "Brussels Airlines" → h2 "Discover Airlines" -32 | 0/0 |  |
| /de/en/articles/explore-flying/7-people-who-shaped-lufthansa-history | insights | 390 | 13.7 | 8000+ → 8000+ (+51) | 0 | picture "in section 346x148" -18 | "100 Years of Lufthansa: Seven Peop" → picture "in section 346x148" -18 | 6/7 |  |
| /de/en/doctor-on-board | info | 1440 | 13.7 | 3872 → 4117 (+245) | - | h2 "Doctor on Board courses" +24 | "Liability and insurance" → h2 "Doctor on Board – good to know" +110 | 1/1 |  |
| /de/en/special-needs | hub | 390 | 13.7 | 6966 → 6690 (-276) | 0 | h2 "Message" -318 | "Register your assistance requireme" → h2 "Message" -318 | 0/0 |  |
| /de/en/articles/explore-the-world | insights | 390 | 13.6 | 8000+ → 8000+ (+64) | +24 | picture "in section 256x256" -34 | "accordion-columns.faq.column" → h2 "Explore more" +46 | 5/35, 2 differ |  |
| /de/en/articles/explore-the-world/know-before-you-go-algiers | insights | 390 | 13.6 | 7470 → 7544 (+74) | - | picture "in section 346x148" +30 | "price-bar.price-bar-visible" → picture "in section 346x148" +30 | 4/11 |  |
| /de/en/childrens-menus-on-board | info | 1440 | 13.6 | 3971 → 3945 (-26) | - | block "columns-media.padded" -40 | "in hero-campaign 1440x810" → block "columns-media.padded" -40 | 5/5 |  |
| /de/en/arrival-services | info | 390 | 13.5 | 4619 → 4722 (+103) | - | block "columns-media.padded" +80 | "From the aircraft straight to the " → block "columns-media.padded" +80 | 2/2 |  |
| /de/en/articles/authors/florian-tomberg | insights | 1440 | 13.5 | 3437 → 3322 (-115) | -20 | h1 "Florian Tomberg" -20 | "Florian Tomberg" → block "blog-overview.blog-overview-image-" -24 | 6/8 |  |
| /de/en/articles/explore-the-world/essentials-barcelona-facts | insights | 390 | 13.5 | 5986 → 6103 (+117) | 0 | picture "in section 346x148" +32 | "in columns-media 346x149" → block "related-articles" +24 | 4/8 |  |
| /de/en/feedback | info | 1440 | 13.3 | 3075 → 2897 (-178) | 0 | h2 "Flight disruptions: compensation a" -32 | "Baggage irregularities: reimbursem" → h2 "Other contact forms" -100 | 0/0 |  |
| /de/en/lounge-companions | info | 390 | 13.3 | 4765 → 4995 (+230) | 0 | h2 "People accompanying Senators²/⁴: B" +30 | "People accompanying Senators²/⁴: B" → h2 "People accompanying Frequent Trave" +136 | 1/1 |  |
| /de/en/articles/explore-flying/anniversary-super-crane-special | insights | 390 | 13.2 | 8000+ → 8000+ (+163) | 0 | block "columns-media" +28 | "in carousel-images 285x160" → block "columns-media" +20 | 5/9 |  |
| /de/en/munich-fair | campaign | 1440 | 13.2 | 2322 → 2451 (+129) | - | - | - | 1/1 |  |
| /de/en/prepare-for-your-trip/entry-regulations/entering-schengen/entry-exit-system | info | 1440 | 13.2 | 5590 → 5473 (-117) | - | h2 "Important information for entering" -124 | "columns-media" → h2 "Important information for entering" -120 | 5/8 |  |
| /de/en/prepare-for-your-trip/travelling-with-children/child-in-businessclass | info | 390 | 13.2 | 5792 → 5931 (+139) | 0 | block "columns-media.padded" +40 | "in columns-media.padded 346x202" → block "columns-media.padded" +46 | 1/7 |  |
| /de/en/articles/explore-the-world/in-my-hood-chiswick-london | insights | 390 | 13.1 | 7210 → 7216 (+6) | - | picture "in section 256x256" +16 | "in section 256x256" → block "columns-media" -46 | 6/14 |  |
| /de/en/book-and-manage/rebook/involuntary-rebooking | info | 1440 | 13.1 | 4804 → 5065 (+261) | 0 | h2 "What this means for your trip" -24 | "Continue with your rebooking" → block "carousel-cards.grid" +86 | 4/11 |  |
| /de/en/book-and-manage/rebook/involuntary-rebooking | info | 390 | 13.1 | 7558 → 7859 (+301) | 0 | h2 "Available options for your booking" +24 | "in columns-media.padded 346x53" → h2 "Continue with your rebooking" +118 | 4/11 |  |
| /de/en/flight-search | app-entry | 1440 | 13.1 | 2064 → 2111 (+47) | 0 | block "cards-teaser.three-up" +32 | "This might also be of interest to " → block "cards-teaser.three-up" +32 | 4/4 |  |
| /de/en/32n | fleet | 1440 | 13 | 6501 → 6567 (+66) | - | block "columns-media.sidebar" -78 | "in carousel-lightbox 622x269" → h2 "Seat maps of the Airbus A320neo fo" +72 | 11/15 |  |
| /de/en/prepare-for-your-trip/baggage/baggage-irregularities/faq-baggage-delay | info | 390 | 13 | 4804 → 4704 (-100) | 0 | h2 "Baggage status tracing" -42 | "Report delayed baggage online" → h2 "Baggage status tracing" -46 | 0/0 |  |
| /de/en/articles/explore-the-world/in-my-hood-district-zurich | insights | 390 | 12.9 | 8000+ → 8000+ (+74) | - | block "columns-media" -34 | "in columns-media.stacked 346x148" → block "columns-media" -46 | 6/14 |  |
| /de/en/flying-with-small-children | info | 390 | 12.9 | 4326 → 4407 (+81) | - | block "carousel-cards.phone-slider.four-u" +82 | "Important information about flying" → block "carousel-cards.phone-slider.four-u" +82 | 2/4 |  |
| /de/en/320 | fleet | 1440 | 12.8 | 6415 → 6506 (+91) | - | block "columns-media.sidebar" -54 | "in carousel-lightbox 622x298" → h2 "Seat maps of the Airbus A320-200 f" +72 | 10/15 |  |
| /de/en/prepare-for-your-trip/getting-to-and-from-the-airport/lufthansa-express-bus-briefing | info | 390 | 12.8 | 3396 → 3278 (-118) | 0 | - | - | 1/1 |  |
| /de/en/timetable-and-flight-status | flight-status | 390 | 12.8 | 3861 → 3824 (-37) | - | picture "in columns-media 346x148" -34 | "Airport information" → picture "in columns-media 346x148" -26 | 3/3 |  |
| /de/en/add-sports-baggage | info | 390 | 12.7 | 5317 → 5127 (-190) | - | - | - | 0/0 |  |
| /de/en/articles/explore-the-world/eat-see-do-algiers | insights | 1440 | 12.7 | 6548 → 6549 (+1) | -2 | picture "in section 1053x452" -24 | "This may also be of interest to yo" → block "carousel-cards.article" -20 | 7/11 |  |
| /de/en/services-at-the-airport | hub | 390 | 12.7 | 3411 → 3365 (-46) | 0 | picture "in cards-teaser.spacious 346x148" -18 | - | 4/4 |  |
| /de/en/articles/explore-the-world/in-my-hood-chiswick-london | insights | 1440 | 12.6 | 5212 → 5105 (-107) | - | block "price-bar.price-bar-visible" -48 | "in section 256x256" → block "columns-media" -100 | 6/17 |  |
| /de/en/articles/explore-the-world/on-the-scene-caspar-plautz-munich | insights | 1440 | 12.6 | 5162 → 5091 (-71) | - | block "columns-media" -128 | "in poi-map.poi-map-with-aside 256x" → block "columns-media" -120 | 8/20 |  |
| /de/en/book-and-manage/flights/giftvoucher | info | 1440 | 12.6 | 4431 → 4374 (-57) | - | block "columns-media.padded" +16 | "accordion-columns.faq" → h2 "The perfect gift for any occasion" -56 | 5/5, 1 differ |  |
| /de/en/overview-travel-information | hub | 390 | 12.6 | 3950 → 3932 (-18) | - | picture "in cards-teaser.spacious 346x148" -26 | "Lounges" → picture "in cards-teaser.spacious 346x148" -28 | 5/6 |  |
| /de/en/100-years/destinations | campaign | 390 | 12.5 | 8000+ → 8000+ (-368) | - | block "columns-media.sidebar" -22 | "Rio de Janeiro: Party like World C" → block "columns-media.sidebar" -34 | 6/8 | page 800-3,100 px shorter than www's; not diagnosed this round (campaign, mine) |
| /de/en/book-and-manage/stopover/neuschwanstein | campaign | 390 | 12.5 | 3727 → 3767 (+40) | - | block "columns-media.sidebar" -26 | "in section 256x256" → picture "in columns-media 346x149" +208 | 2/9 |  |
| /de/en/miles-and-more | hub | 390 | 12.5 | 4188 → 4106 (-82) | - | block "carousel-cards.phone-slider.four-u" -28 | "Discover the world of Miles & More" → block "carousel-cards.phone-slider.four-u" -22 | 2/4 |  |
| /de/en/prepare-for-your-trip/travel-classes/economy-basic | info | 390 | 12.5 | 4969 → 4933 (-36) | 0 | block "columns-media.padded" -54 | "Baggage in Economy Basic Fare" → block "columns-media.padded" -54 | 2/3 |  |
| /de/en/special-meals | info | 390 | 12.5 | 7047 → 7098 (+51) | - | picture "in columns-media 346x231" +36 | "table-striped" → picture "in columns-media 346x231" +46 | 4/4 |  |
| /de/en/articles/tags | insights | 390 | 12.4 | 2469 → 2449 (-20) | 0 | h2 "Explore more" -26 | "accordion-columns.faq.column" → h2 "Explore more" -24 | 2/2 |  |
| /de/en/advance-seat-reservations-terms-and-conditions | legal | 1440 | 12.3 | 1602 → 1681 (+79) | 0 | block "columns-media.padded" +24 | "FAQs seat reservations" → block "columns-media.padded" +24 | 0/0 |  |
| /de/en/articles/explore-flying/flying-high-christoph-quarch | insights | 390 | 12.3 | 6410 → 6374 (-36) | 0 | picture "in section 346x195" -24 | "in section 346x195" → picture "in related-articles 326x183" +334 | 4/6 |  |
| /de/en/discover-lufthansa/carbon-offsetting/climate-protection-projects | info | 1440 | 12.3 | 4495 → 4382 (-113) | - | h2 "A key step towards a lower-emissio" -94 | "in section 960x308" → h2 "A key step towards a lower-emissio" -94 | 0/1 |  |
| /de/en/lufthansa-corporate-customers | info | 390 | 12.3 | 4115 → 4120 (+5) | 0 | picture "in columns-media 346x148" +22 | "in columns-media 346x148" → picture "in columns-media 346x148" +26 | 5/5 |  |
| /de/en/lufthansa-group-star-alliance-and-partner-airlines | info | 390 | 12.3 | 8000+ → 8000+ (-542) | 0 | h2 "About Star Alliance" -24 | "in section 346x87" → picture "in section 346x87" -64 | 14/34, 2 differ | info (ema-cashub): page 670-8,100 px taller than www's; not diagnosed (no accordions or tabs on www) |
| /de/en/menus-travel-classes | info | 390 | 12.3 | 3106 → 3135 (+29) | - | picture "in columns-media 346x148" +26 | "in columns-media 346x148" → picture "in columns-media 346x148" +26 | 4/4 |  |
| /de/en/prepare-for-your-trip/travelling-with-children/child-in-businessclass | info | 1440 | 12.3 | 5226 → 5055 (-171) | - | picture "in columns-media.padded 622x363" -30 | "in columns-media.padded 622x363" → h2 "One adult with two children" -50 | 7/7 |  |
| /de/en/book-and-manage/flights/ana/faq | info | 390 | 12.2 | 4158 → 4080 (-78) | 0 | h2 "Additional and special services" +24 | "Additional and special services" → h2 "Check-in" -44 | 0/0 |  |
| /de/en/flight-disruptions | info | 390 | 12.1 | 7895 → 7922 (+27) | 0 | block "columns-media.padded" -56 | "Flights delayed and cancelled at s" → block "columns-media.padded" -56 | 8/12 |  |
| /de/en/articles/explore-the-world/be-picky-barcelona-insider-tips | insights | 1440 | 12 | 5062 → 5031 (-31) | - | block "columns-media.stacked" -16 | "in columns-media.stacked 517x221" → block "columns-media" -56 | 9/11 |  |
| /de/en/lufthansa-travel-classes | hub | 1440 | 12 | 3295 → 3328 (+33) | - | block "hero-banner" -16 | "in columns-media.padded 622x267" → picture "in columns-media 622x350" +34 | 8/9 |  |
| /de/en/lufthansa-at-zuerich-airport | info | 390 | 11.9 | 3051 → 3020 (-31) | - | h2 "Terminal 1 at Zurich Airport" -26 | "breadcrumb" → h2 "Terminal 1 at Zurich Airport" -26 | 0/1 |  |
| /de/en/articles/explore-the-world/essentials-frankfurt-facts | insights | 390 | 11.8 | 5001 → 5086 (+85) | - | block "related-articles" +30 | "in columns-media 346x149" → block "related-articles" +22 | 6/8 |  |
| /de/en/book-and-manage/stopover/bayerischer-hof | campaign | 390 | 11.8 | 4036 → 4099 (+63) | - | picture "in section 346x111" +16 | "in section 256x256" → picture "in section 256x256" -274 | 4/12, 2 differ |  |
| /de/en/flight-disruptions | info | 1440 | 11.7 | 4866 → 4940 (+74) | - | h2 "Compensation in the event of delay" +74 | "Passenger rights" → h2 "Compensation in the event of delay" +74 | 5/12 |  |
| /de/en/prepare-for-your-trip/baggage/baggage-irregularities/faq-damaged-baggage | info | 390 | 11.6 | 2677 → 2747 (+70) | 0 | - | - | 0/0 |  |
| /de/en/business-terms-and-conditions | legal | 1440 | 11.5 | 1790 → 1721 (-69) | - | - | - | 0/0 |  |
| /de/en/common/agb-extra-services-at-online-check-in | legal | 390 | 11.5 | 2630 → 2558 (-72) | 0 | h2 "Seat selection in online check-in" -36 | "in section 346x111" → h2 "Seat selection in online check-in" -36 | 1/1 |  |
| /de/en/articles/explore-the-world/on-the-scene-food-trends-istanbul | insights | 390 | 11.4 | 7097 → 7136 (+39) | - | block "related-articles" +16 | "in columns-media 346x149" → block "related-articles" +22 | 6/12 |  |
| /de/en/farealert/best-price-alert | form | 1440 | 11.4 | 4372 → 4271 (-101) | - | h2 "Sign in with Travel ID or subscrib" -46 | "in columns-media.padded 622x391" → h2 "Sign in with Travel ID or subscrib" -46 | 4/5 |  |
| /de/en/hotel-offers | info | 1440 | 11.4 | 3435 → 3385 (-50) | 0 | h2 "Earn miles with every stay" +16 | "Be inspired" → block "columns-media" -30 | 5/5 |  |
| /de/en/lufthansa-express-bus | info | 390 | 11.4 | 7755 → 7832 (+77) | 0 | picture "in section 346x148" +34 | "Flight via Frankfurt (FRA)" → h2 "Flight via Munich Airport (MUC)" +44 | 5/11 | info (ema-cashub): www's accordions and tabs not all imported as accordion blocks / tab sections (counts in the list below) |
| /de/en/pre-check-in | app-entry | 390 | 11.4 | 3554 → 3460 (-94) | - | block "subpage-nav" -46 | "in section 346x111" → block "subpage-nav" -46 | 1/1 |  |
| /de/en/schengen | info | 390 | 11.4 | 4525 → 4387 (-138) | 0 | - | - | 2/2 | info (ema-cashub): page 670-8,100 px taller than www's; not diagnosed (no accordions or tabs on www) |
| /de/en/travelling-with-children | info | 390 | 11.4 | 6271 → 6253 (-18) | 0 | block "columns-media.padded" -32 | "On-board entertainment" → block "columns-media.padded" +38 | 8/8 |  |
| /de/en/discover-lufthansa/carbon-offsetting/faq-saf | info | 390 | 11.3 | 2473 → 2449 (-24) | 0 | - | - | 0/0 |  |
| /de/en/discover-lufthansa/lufthansa-group-airlines/ita-airways | info | 390 | 11.3 | 5478 → 5493 (+15) | - | picture "in columns-media 346x148" +28 | "in columns-media 346x148" → picture "in columns-media 346x148" +26 | 5/5 |  |
| /de/en/flight-search | app-entry | 390 | 11.3 | 3403 → 3431 (+28) | 0 | - | - | 3/4 |  |
| /de/en/menus-on-long-haul-flights | info | 1440 | 11.3 | 3246 → 3291 (+45) | - | picture "in columns-media 622x267" -16 | "in columns-media 622x267" → block "columns-media" +46 | 7/7 |  |
| /de/en/onboard-delights | info | 1440 | 11.3 | 7322 → 7359 (+37) | - | h2 "Catering on board: just the way yo" +28 | "in columns-media.stacked.padded 62" → h2 "Catering on board: just the way yo" +30 | 10/11 | info (ema-cashub): www's tab controls shown one under the other (counts below) |
| /de/en/prepare-for-your-trip/special-travel-needs/travel-with-needs/special-needs-online-form/confirmation | info | 1440 | 11.3 | 1065 → 1113 (+48) | 0 | - | - | 0/0 |  |
| /de/en/discover-lufthansa/carbon-offsetting/climate-protection-projects | info | 390 | 11.2 | 6082 → 5963 (-119) | 0 | block "accordion-columns.faq.spaced" +54 | "accordion-columns.faq.spaced" → block "accordion-columns.faq.spaced" +52 | 1/1 |  |
| /de/en/lufthansa-express | info | 390 | 11.2 | 6402 → 6468 (+66) | - | block "columns-media" +26 | "in columns-media 346x148" → h2 "This might also interest you" +38 | 6/10 |  |
| /de/en/prepare-for-your-trip/special-travel-needs/travel-with-needs/visual-impairment | info | 1440 | 11.2 | 5774 → 5642 (-132) | - | h2 "Assistance on your trip" +26 | "Please tell us in advance" → block "columns-media" -110 | 11/14 |  |
| /de/en/baggage | hub | 1440 | 11.1 | 4630 → 4729 (+99) | 0 | block "cards-teaser" +30 | "in cards-teaser 622x267" → h2 "Further information" +56 | 3/12 |  |
| /de/en/feedback-past-flight | form | 390 | 11.1 | 6942 → 7188 (+246) | - | h2 "For whom are you submitting this r" +24 | "Personal details" → h2 "Attachments" +38 | 0/0 |  |
| /de/en/seat-maps | fleet | 390 | 11.1 | 5741 → 5746 (+5) | - | block "hero-campaign" +38 | "breadcrumb" → block "hero-campaign" +38 | 0/12 |  |
| /de/en/sixt | info | 390 | 11.1 | 4344 → 4298 (-46) | 0 | picture "in car-rental 346x111" -36 | "car-rental" → picture "in car-rental 346x111" -36 | 1/1 |  |
| /de/en/articles/explore-the-world/essentials-frankfurt-facts | insights | 1440 | 11 | 5130 → 5200 (+70) | -2 | picture "in related-articles 400x225" +22 | - | 4/8 |  |
| /de/en/book-and-manage/passenger-receipt-90days/confirmation | info | 390 | 11 | 1304 → 1359 (+55) | - | - | - | 0/0 |  |
| /de/en/prepare-for-your-trip/current-travel-information | info | 390 | 11 | 1453 → 1494 (+41) | 0 | - | - | 0/0 |  |
| /de/en/prepare-for-your-trip/special-travel-needs/travel-with-needs/special-needs-online-form/confirmation | info | 390 | 11 | 1308 → 1362 (+54) | - | - | - | 0/0 |  |
| /de/en/upgrade-options | info | 390 | 11 | 4852 → 4932 (+80) | 0 | h2 "Upgrade to First Class" -16 | "in columns-media 346x149" → h2 "Need help?" +42 | 3/4 |  |
| /de/en/articles/highlights | insights | 1440 | 10.9 | 6838 → 6786 (-52) | - | block "blog-overview" +42 | "in columns-media 622x267" → block "blog-overview" +34 | 15/16, 1 differ |  |
| /de/en/book-and-manage/passenger-receipt-90days/confirmation | info | 1440 | 10.9 | 1114 → 1164 (+50) | 0 | - | - | 0/0 |  |
| /de/en/check-in-with-the-family | info | 1440 | 10.8 | 2538 → 2514 (-24) | - | block "columns-media.padded" -22 | "Simply check in from home or en ro" → block "columns-media.padded" -22 | 2/3 |  |
| /de/en/lufthansa-city/culinaryjourney | campaign | 390 | 10.8 | 1736 → 1797 (+61) | - | - | - | 0/0 |  |
| /de/en/travel-expense-management | info | 1440 | 10.8 | 2948 → 2918 (-30) | 0 | - | - | 0/1 |  |
| /de/en/articles/explore-flying/inflight-entertainment-vr-experience | insights | 390 | 10.7 | 8000+ → 8000+ (+112) | 0 | block "columns-media" +36 | "in section 346x346" → block "columns-media" +28 | 3/4 |  |
| /de/en/data-collection-usa | legal | 390 | 10.7 | 7392 → 7361 (-31) | 0 | picture "in section 346x149" -26 | "table-striped" → h2 "ESTA travel permit" +158 | 3/4 | legal (ema-cashub): page 500-2,300 px off www's height; not diagnosed |
| /de/en/during-your-trip/food-and-beverages/onboard-delights/faq | info | 390 | 10.7 | 2453 → 2411 (-42) | 0 | - | - | 0/0 |  |
| /de/en/upgrade-to-premium-economy-class | info | 390 | 10.7 | 3121 → 3145 (+24) | 0 | picture "in columns-media 346x149" +16 | "in columns-media 346x149" → block "columns-media" +18 | 4/4 |  |
| /de/en/flying-with-small-children | info | 1440 | 10.6 | 3393 → 3475 (+82) | - | h2 "This may also be of interest to yo" +32 | "Important information about flying" → h2 "This may also be of interest to yo" +32 | 4/4 |  |
| /de/en/medikamenten-transport | info | 1440 | 10.6 | 2842 → 2790 (-52) | - | block "columns-media.padded" -50 | "How it works" → block "columns-media.padded" -50 | 4/5 |  |
| /de/en/prepare-for-your-trip/special-travel-needs/travel-with-needs/travel-companion | info | 390 | 10.6 | 8000+ → 8000+ (-13) | - | block "columns-media" -28 | "columns-media.padded" → h2 "Further information on travel and " -52 | 5/9 |  |
| /de/en/support/contact/contact-form-confirmation | info | 390 | 10.6 | 1328 → 1382 (+54) | - | - | - | 0/0 |  |
| /de/en/articles/explore-the-world/what-i-learned-living-in-barcelona | insights | 1440 | 10.5 | 5915 → 5898 (-17) | -2 | block "columns-media.stacked" -16 | "in columns-media.stacked 517x221" → block "columns-media" -60 | 7/11 |  |
| /de/en/miles-and-more | hub | 1440 | 10.5 | 3406 → 3329 (-77) | - | block "carousel-cards.grid.phone-slider" -54 | "Discover the world of Miles & More" → block "carousel-cards.grid.phone-slider" -54 | 4/4 |  |
| /de/en/passenger-rights | legal | 1440 | 10.5 | 5804 → 5574 (-230) | 0 | h2 "Refunds" -18 | "Overbooking" → h2 "Cancellation" -82 | 0/0 |  |
| /de/en/prepare-for-your-trip/baggage/electronic-devices-and-batteries | info | 390 | 10.5 | 7096 → 7143 (+47) | 0 | block "cards-icon-text.partner" +40 | "Electronic devices and batteries" → block "cards-icon-text.partner" +40 | 3/3 |  |
| /de/en/upgrades-at-online-check-in | info | 390 | 10.5 | 3904 → 4016 (+112) | 0 | h2 "Upgrade benefits" -16 | "Upgrade benefits" → h2 "Please note" +44 | 1/1 |  |
| /de/en/articles/explore-the-world/eat-see-do-berlin | insights | 1440 | 10.4 | 7064 → 7171 (+107) | -2 | picture "in related-articles 400x225" +18 | "in section 1053x452" → h2 "This may also be of interest to yo" -16 | 9/11 |  |
| /de/en/prepare-for-your-trip/baggage/sport-baggage/register-sporting-firearm/confirmation | info | 1440 | 10.4 | 1216 → 1266 (+50) | 0 | - | - | 0/0 |  |
| /de/en/prepare-for-your-trip/baggage/sport-baggage/register-sports-baggage/confirmation | info | 390 | 10.4 | 1800 → 1857 (+57) | - | - | - | 0/0 |  |
| /de/en/terms-of-use | legal | 390 | 10.4 | 5735 → 5859 (+124) | 0 | h2 "1. General" -20 | "3. Permissible use" → h2 "7. Legal disclaimer" +50 | 0/0 |  |
| /de/en/upgrade-business-class-long-haul | info | 1440 | 10.4 | 2418 → 2513 (+95) | - | h2 "Further information about your upg" +46 | "accordion-columns.faq.spaced" → h2 "Further information about your upg" +48 | 1/1 |  |
| /de/en/upgrade-first-class | info | 1440 | 10.4 | 2498 → 2593 (+95) | - | - | - | 1/1 |  |
| /de/en/articles/explore-the-world/stop-over-tokyo | insights | 1440 | 10.3 | 6251 → 6284 (+33) | -2 | block "columns-media" -26 | "in section 874x874" → block "columns-media" -32 | 4/9 |  |
| /de/en/prepare-for-your-trip/baggage/travelling-with-animals/register-animal-cargo-hold/confirmation | info | 1440 | 10.3 | 1216 → 1266 (+50) | 0 | - | - | 0/0 |  |
| /de/en/prepare-for-your-trip/baggage/travelling-with-animals/register-animal/confirmation | info | 1440 | 10.3 | 1216 → 1266 (+50) | 0 | - | - | 0/0 |  |
| /de/en/rail-fly-terms-and-conditions | legal | 390 | 10.3 | 5144 → 5091 (-53) | 0 | h2 "1. Applicability" -32 | "Terms of use for RAIL&FLY online t" → h2 "1. Applicability" -32 | 0/0 |  |
| /de/en/support/contact/contact-form-confirmation | info | 1440 | 10.3 | 1139 → 1187 (+48) | 0 | - | - | 0/0 |  |
| /de/en/articles/explore-flying | insights | 390 | 10.2 | 6633 → 6660 (+27) | -14 | block "blog-overview" +32 | "carousel-cards.four-up.authors" → h2 "Explore more" +36 | 3/14 |  |
| /de/en/prepare-for-your-trip/baggage/sport-baggage/register-sporting-firearm/confirmation | info | 390 | 10.2 | 1568 → 1623 (+55) | - | - | - | 0/0 |  |
| /de/en/prepare-for-your-trip/travelling-with-children/planning-with-kids | info | 1440 | 10.2 | 3256 → 3222 (-34) | - | block "columns-media.padded" -52 | "Important information about flying" → block "columns-media.padded" -52 | 3/3 |  |
| /de/en/upgrade-premium-economy-class | info | 1440 | 10.2 | 2444 → 2538 (+94) | - | h2 "Further information about your upg" +44 | "accordion-columns.faq.spaced" → h2 "Further information about your upg" +48 | 1/1 |  |
| /de/en/common/agb-extra-services-at-online-check-in/conditions-seat-reservation | legal | 390 | 10.1 | 3555 → 3568 (+13) | 0 | h2 "General conditions" -16 | "in section 346x111" → h2 "General conditions" -16 | 1/1 |  |
| /de/en/prepare-for-your-trip/baggage/travelling-with-animals/register-animal-cargo-hold/confirmation | info | 390 | 10.1 | 1568 → 1623 (+55) | - | - | - | 0/0 |  |
| /de/en/prepare-for-your-trip/baggage/travelling-with-animals/register-animal/confirmation | info | 390 | 10.1 | 1568 → 1623 (+55) | - | - | - | 0/0 |  |
| /de/en/prepare-for-your-trip/special-travel-needs/travel-with-needs/hearing-impairment | info | 390 | 10.1 | 8000+ → 8000+ (-57) | -20 | h1 "Services for passengers with heari" -20 | "columns-media.padded" → block "carousel-cards.grid.four-up" -54 | 5/11 |  |
| /de/en/special-meals | info | 1440 | 10.1 | 5051 → 5098 (+47) | - | picture "in columns-media 622x415" +26 | "table-striped" → picture "in columns-media 622x415" +32 | 4/4, 1 differ |  |
| /de/en/articles/explore-flying/anniversary-super-crane-special | insights | 1440 | 10 | 7218 → 7328 (+110) | - | block "columns-media.stacked" -38 | "article-header" → block "columns-media.stacked" -38 | 4/12 |  |
| /de/en/common/privacy-statement/privacy-statement-group | legal | 390 | 10 | 1881 → 1924 (+43) | - | - | - | 0/0 |  |
| /de/en/common/seatreservation-condtions/seat-reservations | legal | 1440 | 10 | 2884 → 2812 (-72) | 0 | h2 "Seat selection" +16 | "Seat Reservations" → h2 "Seat selection" +16 | 0/0 |  |
| /de/en/prepare-for-your-trip/baggage/electronic-devices-and-batteries | info | 1440 | 10 | 4398 → 4496 (+98) | 0 | h2 "Further information" +96 | "Electronic devices and batteries" → h2 "Further information" +96 | 2/3 |  |
| /de/en/tiere-als-uebergepaeck | info | 390 | 10 | 8000+ → 8000+ (+54) | 0 | block "columns-media" -20 | "Conditions" → block "accordion-columns.faq.spaced" +222 | 2/4 |  |
| /de/en/book-and-manage/rebook/voluntary-rebooking | info | 390 | 9.9 | 8000+ → 8000+ (-475) | - | block "columns-media.padded" +68 | "columns-media.padded" → picture "in columns-media.padded 346x53" -360 | 7/16 |  |
| /de/en/datenschutz | legal | 390 | 9.9 | 1789 → 1830 (+41) | - | - | - | 0/0 |  |
| /de/en/articles/explore-the-world/on-the-scene-food-trends-istanbul | insights | 1440 | 9.8 | 5289 → 5206 (-83) | - | picture "in poi-map.poi-map-with-aside 256x" -20 | "in section 256x256" → block "columns-media" -54 | 8/20, 1 differ |  |
| /de/en/book-and-manage/digital-self-services/airline-apps | info | 390 | 9.8 | 3444 → 3471 (+27) | 0 | picture "in columns-media 346x288" +44 | "columns-media" → picture "in columns-media 346x288" +44 | 0/4 |  |
| /de/en/cash-and-miles | info | 1440 | 9.7 | 3041 → 2943 (-98) | - | h2 "Promotion: Discover North America " +16 | "Promotion: Discover North America " → h2 "Book your flight with Cash & Miles" -40 | 1/1 |  |
| /de/en/first-class-lounges | info | 390 | 9.7 | 6137 → 6033 (-104) | - | h2 "First Class Lounges worldwide" -50 | "Pre-flight dinner in New York" → h2 "Reserved parking spaces in Dusseld" -58 | 1/1 |  |
| /de/en/passenger-receipt-90 | info | 390 | 9.7 | 4018 → 4093 (+75) | 0 | - | - | 0/0 |  |
| /de/en/upgrade-business-class-long-haul | info | 390 | 9.7 | 3613 → 3690 (+77) | 0 | block "subpage-nav" +68 | "How to book your upgrade" → block "subpage-nav" +68 | 1/1 |  |
| /de/en/upgrade-premium-economy-class | info | 390 | 9.6 | 3683 → 3759 (+76) | 0 | h2 "Further information about your upg" +44 | "How to book your upgrade on long-h" → h2 "Further information about your upg" +44 | 1/1 |  |
| /de/en/affiliatemarketing | info | 390 | 9.5 | 4005 → 4085 (+80) | - | block "subpage-nav" -18 | "subpage-nav" → h2 "Business Services" +92 | 0/0 |  |
| /de/en/articles/highlights | insights | 390 | 9.5 | 8000+ → 8000+ (-108) | - | picture "in columns-media 346x149" -20 | "in blog-overview 346x195" → picture "in blog-overview 346x195" -70 | 13/13 |  |
| /de/en/lufthansa-express | info | 1440 | 9.5 | 4122 → 4185 (+63) | - | block "columns-media" +24 | "columns-media" → h2 "This might also interest you" +38 | 4/10 |  |
| /de/en/rail-and-fly | info | 390 | 9.5 | 6638 → 6614 (-24) | 0 | h2 "Book Rail&Fly directly with your f" -68 | "in section 346x111" → h2 "Book Rail&Fly directly with your f" -68 | 3/7 |  |
| /de/en/upgrade-first-class | info | 390 | 9.5 | 3764 → 3840 (+76) | 0 | block "subpage-nav" -46 | "subpage-nav" → h2 "Upgrade options" +116 | 1/1 |  |
| /de/en/book-and-manage/rebook/voluntary-rebooking | info | 1440 | 9.4 | 6046 → 5926 (-120) | 0 | h2 "Fly on your terms" -24 | "accordion-columns.faq" → h2 "Good to know" -292 | 8/16 |  |
| /de/en/cash-and-miles | info | 390 | 9.4 | 4197 → 4162 (-35) | 0 | block "subpage-nav" +16 | - | 0/1 |  |
| /de/en/doctor-on-board-news | info | 390 | 9.4 | 2383 → 2412 (+29) | 0 | - | - | 2/4 |  |
| /de/en/lufthansa-corporate-customers | info | 1440 | 9.4 | 3383 → 3348 (-35) | - | picture "in columns-media 622x267" -18 | "in columns-media 622x267" → picture "in columns-media 622x267" -16 | 5/5 |  |
| /de/en/baggage | hub | 390 | 9.2 | 7339 → 7335 (-4) | 0 | picture "in columns-media.padded 346x231" -42 | "in cards-teaser 346x148" → h2 "Further information" +34 | 10/12 |  |
| /de/en/business-terms-and-conditions | legal | 390 | 9.2 | 2897 → 2874 (-23) | 0 | - | - | 0/0 |  |
| /de/en/culinaryjourney | campaign | 1440 | 9.2 | 1586 → 1635 (+49) | - | - | - | 0/0 |  |
| /de/en/prepare-for-your-trip/baggage/sport-baggage/register-sports-baggage/confirmation | info | 1440 | 9.2 | 1462 → 1513 (+51) | 0 | - | - | 0/0 |  |
| /de/en/advice-for-travellers-with-special-needs-to-and-from-the-usa | info | 390 | 9.1 | 8000+ → 8000+ (-368) | - | picture "in columns-media.padded 346x43" -16 | "in carousel-cards.grid 344x229" → block "columns-media" -132 | 0/11 | info (ema-cashub): page 670-8,100 px taller than www's; not diagnosed (no accordions or tabs on www) |
| /de/en/articles/explore-the-world/know-before-you-go-berlin | insights | 1440 | 9.1 | 7488 → 7523 (+35) | -2 | block "price-bar.price-bar-visible" -48 | "article-header" → block "price-bar.price-bar-visible" -48 | 1/11 |  |
| /de/en/book-and-manage/pax-receipt | info | 390 | 9.1 | 2484 → 2515 (+31) | 0 | - | - | 0/0 |  |
| /de/en/common/privacy-statement/privacy-statement-group | legal | 1440 | 9.1 | 1476 → 1434 (-42) | - | - | - | 0/0 |  |
| /de/en/prepare-for-your-trip/special-travel-needs/travel-with-needs/travel-companion | info | 1440 | 9.1 | 4888 → 4817 (-71) | - | h2 "You can notify us of your assistan" -16 | "columns-media.padded" → h2 "Further information on travel and " -54 | 8/9 |  |
| /de/en/100-years/crane | campaign | 1440 | 9 | 8000+ → 8000+ (-104) | - | block "columns-media.padded" -34 | "columns-media.padded" → picture "in section 1264x758" -72 | 7/16 |  |
| /de/en/book-and-manage/flights/helvetic | info | 390 | 9 | 7455 → 7493 (+38) | 0 | - | - | 8/9 |  |
| /de/en/upgrade-to-premium-economy-class | info | 1440 | 9 | 2309 → 2331 (+22) | - | block "columns-media" +22 | "How to book your upgrade" → block "columns-media" +28 | 4/4 |  |
| /de/en/with-children-at-the-airport | info | 390 | 9 | 4239 → 4210 (-29) | - | block "columns-media.padded" -32 | "Good to know" → h2 "Separate children’s area in the Bu" +48 | 2/2 |  |
| /de/en/dangerous-dogs | info | 390 | 8.9 | 3934 → 3975 (+41) | 0 | h2 "Information about travelling with " +22 | "Information about travelling with " → h2 "Information about travelling with " -38 | 0/1 |  |
| /de/en/discover-lufthansa/carbon-offsetting/saf | info | 390 | 8.9 | 5123 → 5159 (+36) | - | h2 "How does Lufthansa Group determine" +32 | "Why is SAF not yet used on all fli" → h2 "How does Lufthansa Group determine" +34 | 2/2 |  |
| /de/en/faq-password-security | legal | 390 | 8.9 | 1589 → 1579 (-10) | 0 | - | - | 0/0 |  |
| /de/en/meetings-and-events | hub | 390 | 8.9 | 3869 → 3907 (+38) | 0 | block "columns-media" -36 | "in columns-media 346x49" → block "cards-teaser.three-up.phone-slider" +208 | 1/8 | "Request offer now" a link, not www's yellow button; the steps' spacing (hub, mine: open) |
| /de/en/shopping | info | 1440 | 8.9 | 5703 → 5650 (-53) | - | h2 "You decide: your selection, your l" -42 | "in columns-media.padded 622x415" → h2 "You decide: your selection, your l" -42 | 12/12 |  |
| /de/en/tiere-als-uebergepaeck | info | 1440 | 8.9 | 6123 → 6015 (-108) | - | h2 "Conditions" -20 | "in columns-media.padded 464x238" → block "columns-media.padded" -72 | 1/4, 1 differ |  |
| /de/en/besondere-befoerderungsbedingungen-bus | legal | 390 | 8.8 | 8000+ → 8000+ (-257) | - | h2 "3. Validity, rebooking and refunds" -38 | "3. Validity, rebooking and refunds" → h2 "6. Carriage of children" -108 | 0/0 |  |
| /de/en/europcar | info | 1440 | 8.8 | 2980 → 3020 (+40) | 0 | - | - | 1/1 |  |
| /de/en/articles/explore-the-world/know-before-you-go-algiers | insights | 1440 | 8.7 | 7447 → 7482 (+35) | -2 | h2 "This may also be of interest to yo" +16 | "in section 1053x452" → h2 "This may also be of interest to yo" +18 | 2/11 |  |
| /de/en/book-and-manage/flights/ana | info | 1440 | 8.7 | 3402 → 3340 (-62) | 0 | h2 "The Lufthansa and ANA apps" -16 | "in columns-media 622x267" → h2 "FAQs on travel with Lufthansa and " -22 | 2/2 |  |
| /de/en/fly-more-sustainabl | info | 390 | 8.7 | 5940 → 5982 (+42) | - | h2 "SAF questions and answers" +34 | "columns-media" → h2 "SAF questions and answers" +22 | 1/1 |  |
| /de/en/overview-special-request | hub | 1440 | 8.7 | 2754 → 2728 (-26) | 0 | h2 "Families" +16 | "Families" → picture "in cards-teaser 622x267" -24 | 6/6 |  |
| /de/en/upgrade-options | info | 1440 | 8.7 | 3531 → 3607 (+76) | 0 | h2 "Need help?" +26 | "in columns-media 622x267" → h2 "Need help?" +40 | 4/4 |  |
| /de/en/upgrade-to-business-class | info | 1440 | 8.7 | 2450 → 2518 (+68) | - | - | - | 1/1 |  |
| /de/en/assistenzhunde | info | 1440 | 8.6 | 2389 → 2328 (-61) | 0 | block "accordion-columns.faq" -28 | "Assistance dogs" → block "accordion-columns.faq" -28 | 0/0 |  |
| /de/en/online-check-in | app-entry | 1440 | 8.6 | 3564 → 3583 (+19) | 0 | picture "in columns-media.slider 301x226" -24 | "in columns-media.slider 301x226" → h2 "Check in online now" +54 | 4/7 |  |
| /de/en/prepare-for-your-trip/special-travel-needs/travel-with-needs/hearing-impairment | info | 1440 | 8.6 | 5353 → 5282 (-71) | - | block "columns-media.sidebar" -40 | "columns-media.padded" → block "carousel-cards.grid.four-up" -56 | 11/13 |  |
| /content/lh/markets/de/en/during-your-trip/lounges/loungenet | lounge | 390 | 8.5 | 1038 → 1060 (+22) | 0 | - | - | 0/0 |  |
| /de/en/common/accessibility-statement | legal | 390 | 8.5 | 8000+ → 8000+ (-15) | 0 | - | - | 0/0 |  |
| /de/en/homepage | homepage | 390 | 8.5 | 6175 → 6120 (-55) | - | block "hero-card-overlay.no-mobile-image." +16 | "cards-icon" → block "columns-logos.columns-logos-2-cols" -100 | 2/25 |  |
| /de/en/lufthansa-first-class-fleet | fleet | 1440 | 8.5 | 4157 → 4218 (+61) | - | - | - | 3/5 |  |
| /de/en/prepare-for-your-trip/getting-to-and-from-the-airport/lufthansa-express-rail-briefing | info | 1440 | 8.5 | 2649 → 2612 (-37) | - | picture "in columns-media.padded 622x267" -62 | "breadcrumb" → picture "in columns-media.padded 622x267" -62 | 1/2 |  |
| /de/en/register-animal-cabin | form | 390 | 8.5 | 7485 → 7436 (-49) | 0 | block "form.core" -42 | "Register your pet for carriage in " → block "form.core" -42 | 0/0 |  |
| /de/en/support/contact/passenger-duty-united-kingdom | info | 390 | 8.5 | 2566 → 2603 (+37) | - | - | - | 0/0 |  |
| /de/en/uebergepaeck | info | 390 | 8.5 | 4747 → 4812 (+65) | 0 | block "subpage-nav" +32 | "Booking and prices" → block "subpage-nav" +32 | 1/2 |  |
| /de/en/advance-seat-reservations-terms-and-conditions | legal | 390 | 8.4 | 2521 → 2558 (+37) | 0 | block "columns-media.padded" +24 | "FAQs seat reservations" → block "columns-media.padded" +24 | 0/0 |  |
| /de/en/assistenzhunde | info | 390 | 8.4 | 3621 → 3655 (+34) | - | h2 "You have the following options for" -28 | "breadcrumb" → h2 "You have the following options for" -28 | 0/0 |  |
| /de/en/check-in-baggage | info | 390 | 8.4 | 3293 → 3311 (+18) | - | h2 "How to use bag drop kiosks at the " +16 | "in section 346x148" → h2 "How to use bag drop kiosks at the " +16 | 2/2, 1 differ |  |
| /de/en/data-protection-information | legal | 390 | 8.4 | 8000+ → 8000+ (-459) | - | - | - | 0/0 |  |
| /de/en/feedback-past-flight | form | 1440 | 8.4 | 5979 → 6196 (+217) | 0 | h2 "For whom are you submitting this r" +18 | "Your feedback" → h2 "Attachments" +46 | 0/0 |  |
| /de/en/homepage | homepage | 1440 | 8.4 | 5065 → 4998 (-67) | - | h2 "Flight offers from Frankfurt" +32 | "destination-finder" → h2 "Exclusive Offers & Benefits" -56 | 10/29 |  |
| /de/en/menus-travel-classes | info | 1440 | 8.4 | 2251 → 2234 (-17) | - | picture "in columns-media 622x267" -16 | "Menus in Business Class" → picture "in columns-media 622x267" -16 | 4/4 |  |
| /de/en/prepare-for-your-trip/baggage/baggage-irregularities/faq-baggage-delay | info | 1440 | 8.4 | 3704 → 3620 (-84) | - | h2 "Report delayed baggage online" -16 | "accordion-columns.faq.limited-widt" → h2 "Compensation for baggage delays" -32 | 0/0 |  |
| /de/en/unaccompanied-minors | info | 1440 | 8.4 | 7499 → 7290 (-209) | - | h2 "Are additional fees charged for un" -60 | "Are additional fees charged for un" → h2 "Booking" -80 | 1/1 |  |
| /de/en/articles/explore-flying/7-people-who-shaped-lufthansa-history | insights | 1440 | 8.3 | 8000+ → 8000+ (+35) | - | picture "in section 1053x452" +30 | "in section 1053x452" → picture "in section 1053x452" +22 | 6/8 |  |
| /de/en/book-and-manage/flights/lufthansa-voucher | info | 390 | 8.3 | 1333 → 1358 (+25) | 0 | - | - | 0/0 |  |
| /de/en/business-services | info | 390 | 8.3 | 1073 → 1095 (+22) | - | - | - | 0/0 |  |
| /de/en/faq-data-security | legal | 1440 | 8.3 | 1324 → 1292 (-32) | 0 | - | - | 0/0 |  |
| /de/en/lufthansa-express-rail | info | 390 | 8.3 | 8000+ → 8000+ (-147) | 0 | h2 "Your benefits with Lufthansa Expre" +56 | "Your benefits with Lufthansa Expre" → h2 "Book Lufthansa Express Rail" -118 | 0/6 |  |
| /de/en/prepare-for-your-trip/baggage/sport-baggage/register-ammunition | form | 1440 | 8.3 | 4204 → 4327 (+123) | - | h2 "Register ammunition" +20 | "General information" → h2 "Register ammunition" +18 | 0/0 |  |
| /de/en/travel-agencies | info | 390 | 8.3 | 2313 → 2307 (-6) | - | - | - | 2/2 |  |
| /de/en/articles/explore-the-world/be-picky-frankfurt-insider-tips | insights | 1440 | 8.2 | 3841 → 3856 (+15) | -2 | block "columns-media" -42 | "in columns-media.stacked 517x221" → block "columns-media" -34 | 5/8 |  |
| /de/en/articles/explore-the-world/in-my-hood-district-zurich | insights | 1440 | 8.2 | 5455 → 5412 (-43) | - | picture "in section 256x256" -24 | "in section 256x256" → h2 "Our recommendations" -42 | 6/17 |  |
| /de/en/bid-upgrade | info | 390 | 8.2 | 5041 → 5020 (-21) | 0 | h2 "The selection of upgrades" -18 | "How to make your offer" → h2 "The selection of upgrades" -18 | 1/1 |  |
| /de/en/europa-tarife-economy-class | info | 390 | 8.2 | 7419 → 7412 (-7) | 0 | h2 "Economy Light" -28 | "Economy Light" → h2 "Economy Comfort" -44 | 1/1 |  |
| /de/en/mobility-partner-program-healthcare | info | 1440 | 8.2 | 3576 → 3506 (-70) | - | h2 "Medical Operation Centre" -116 | "Lufthansa Medical Services" → h2 "Medical Operation Centre" -116 | 1/2 |  |
| /de/en/add-sports-baggage | info | 1440 | 8.1 | 4337 → 4204 (-133) | 0 | h2 "Register sports baggage" +18 | "Register sports baggage" → h2 "Terms and conditions of use" -262 | 0/0 |  |
| /de/en/faq-password-security | legal | 1440 | 8.1 | 1330 → 1298 (-32) | 0 | block "accordion-columns.faq.limited-widt" -40 | "FAQs on password security" → block "accordion-columns.faq.limited-widt" -40 | 0/0 |  |
| /de/en/passenger-receipt-90 | info | 1440 | 8.1 | 3317 → 3423 (+106) | 0 | h2 "Receipt information" +20 | "Personal information" → h2 "Receipt information" +20 | 0/0 |  |
| /de/en/passengers-with-sensory-impairment | info | 1440 | 8.1 | 8000+ → 8000+ (-153) | 0 | h2 "Assistance on your trip" -40 | "Please tell us in advance" → block "columns-media" -104 | 14/16 |  |
| /de/en/pre-check-in | app-entry | 1440 | 8.1 | 2386 → 2324 (-62) | 0 | - | - | 1/1 |  |
| /de/en/refund | info | 390 | 8.1 | 3193 → 3250 (+57) | 0 | - | - | 0/0 |  |
| /de/en/lufthansa-city/culinaryjourney | campaign | 1440 | 8 | 1359 → 1335 (-24) | - | block "micro-frontend" -40 | - | 0/0 |  |
| /de/en/rail-and-fly | info | 1440 | 8 | 4714 → 4633 (-81) | - | block "columns-media" -72 | "Book Rail&Fly directly with your f" → block "columns-media" -80 | 3/7 |  |
| /de/en/sports-baggage | info | 390 | 8 | 7690 → 7621 (-69) | 0 | h2 "Taking musical instruments with yo" -52 | "columns-media" → h2 "Taking musical instruments with yo" -38 | 1/4 |  |
| /de/en/upgrade-info | info | 390 | 8 | 3246 → 3288 (+42) | 0 | h2 "Cancellation and refund of tickets" +28 | "Rebooking tickets" → h2 "Cancellation and refund of tickets" +28 | 1/1 |  |
| /de/en/discover-lufthansa/carbon-offsetting/environmental-cost-surcharge | info | 1440 | 7.9 | 2279 → 2217 (-62) | 0 | - | - | 0/0 |  |
| /de/en/payment-options-at-the-airport | info | 390 | 7.9 | 3340 → 3291 (-49) | - | - | "Please note:" → block "profile-tabs.content" -24 | 0/0 |  |
| /de/en/prepare-for-your-trip/baggage/sport-baggage/register-ammunition | form | 390 | 7.9 | 5998 → 6042 (+44) | 0 | h2 "Register ammunition" +20 | - | 0/0 |  |
| /de/en/prepare-for-your-trip/special-travel-needs/medical-travel-companions | info | 1440 | 7.9 | 2544 → 2553 (+9) | 0 | h2 "Services at a glance" -24 | "in section 1264x405" → h2 "Services at a glance" -24 | 4/4 |  |
| /de/en/travel-id-terms-conditions | legal | 390 | 7.9 | 8000+ → 8000+ (-138) | - | h2 "1. Scope" -16 | "5. Use of your Travel ID profile" → h2 "6. Blocking and deleting your Trav" -28 | 0/0 |  |
| /de/en/airport-information | hub | 1440 | 7.8 | 3232 → 3290 (+58) | 0 | - | - | 7/8 |  |
| /de/en/automatic-check-in | info | 390 | 7.8 | 4537 → 4497 (-40) | - | block "subpage-nav" -46 | "in section 346x149" → block "subpage-nav" -46 | 1/1 |  |
| /de/en/common | legal | 390 | 7.8 | 1113 → 1135 (+22) | 0 | - | - | 0/0 |  |
| /de/en/general-conditions-currency-conversion | legal | 390 | 7.8 | 2807 → 2780 (-27) | 0 | h2 "Refunds" -22 | "General terms and conditions for c" → h2 "Refunds" -22 | 0/0 |  |
| /de/en/upgrade-to-business-class | info | 390 | 7.8 | 3725 → 3750 (+25) | 0 | block "subpage-nav" +16 | "How to book your upgrade on flight" → block "subpage-nav" +16 | 1/1 |  |
| /de/en/upgrades-at-online-check-in | info | 1440 | 7.8 | 3250 → 3337 (+87) | 0 | - | - | 1/1 |  |
| /de/en/articles/explore-flying/essentials-future-of-flying | insights | 1440 | 7.7 | 5733 → 5806 (+73) | - | - | - | 1/9 |  |
| /de/en/services-munich-airport | info | 390 | 7.7 | 2089 → 2079 (-10) | - | block "accordion-columns.faq.spaced" +16 | "subpage-nav" → h2 "Munich Airport" -32 | 1/1 |  |
| /de/en/sepa-terms-and-conditions-b | legal | 390 | 7.6 | 2728 → 2738 (+10) | - | h2 "Authorisation for direct debiting " -20 | "breadcrumb" → h2 "Authorisation for direct debiting " -20 | 0/0 |  |
| /de/en/all-check-in | info | 390 | 7.5 | 3323 → 3354 (+31) | 0 | - | - | 5/5 |  |
| /de/en/articles/explore-flying/flying-high-christoph-quarch | insights | 1440 | 7.5 | 5407 → 5390 (-17) | - | - | - | 1/6 |  |
| /de/en/book-and-manage/booking-services/manage-my-bookings | app-entry | 390 | 7.5 | 1517 → 1542 (+25) | 0 | - | - | 0/0 |  |
| /de/en/faq-ejournals | info | 1440 | 7.5 | 1566 → 1537 (-29) | - | block "accordion-columns.faq.limited-widt" -16 | "breadcrumb" → block "accordion-columns.faq.limited-widt" -16 | 0/0 |  |
| /de/en/passengers-using-wheelchairs | info | 390 | 7.5 | 8000+ → 8000+ (+2655) | - | h2 "Straight to the point" -36 | "in columns-media.padded 346x43" → block "columns-media" -84 | 1/4 | info (ema-cashub): www's accordions and tabs not all imported as accordion blocks / tab sections (counts in the list below) |
| /de/en/prepare-for-your-trip/baggage/baggage-irregularities/faq-damaged-baggage | info | 1440 | 7.5 | 2238 → 2287 (+49) | - | h2 "Report damaged baggage online" +24 | "accordion-columns.faq.limited-widt" → h2 "Report damaged baggage online" +24 | 0/0 |  |
| /de/en/prepare-for-your-trip/entry-regulations/immigration-regulations-uk | info | 390 | 7.5 | 3066 → 3097 (+31) | 0 | - | - | 1/1 |  |
| /de/en/travel-expense-management | info | 390 | 7.5 | 3548 → 3589 (+41) | - | - | - | 1/1 |  |
| /de/en/articles/explore-the-world/what-i-learned-living-in-frankfurt | insights | 1440 | 7.4 | 4526 → 4542 (+16) | -2 | block "columns-media" -40 | "in columns-media.stacked 517x221" → block "columns-media" -32 | 4/8 |  |
| /de/en/meetings-and-events-organisers | info | 390 | 7.4 | 4061 → 4089 (+28) | - | - | - | 1/1 |  |
| /de/en/partner | info | 390 | 7.4 | 3435 → 3425 (-10) | 0 | - | - | 4/5 |  |
| /de/en/passenger-rights | legal | 390 | 7.4 | 8000+ → 8000+ (-307) | 0 | h2 "Refunds" -18 | "Overbooking" → h2 "Cancellation" -96 | 0/0 |  |
| /de/en/support/feedback-and-contact-airlines | info | 1440 | 7.4 | 1986 → 1943 (-43) | - | - | - | 0/7 |  |
| /de/en/common/imprint/lufthansa-insights-imprint | legal | 390 | 7.3 | 4837 → 4795 (-42) | - | h2 "Registration" +18 | "Publisher" → h2 "Registered office" -50 | 0/0 |  |
| /de/en/discover-lufthansa/lufthansa-group-airlines/ita-airways | info | 1440 | 7.3 | 3770 → 3757 (-13) | - | - | - | 5/5 |  |
| /de/en/anmeldung-tiere-frachtraum | form | 390 | 7.2 | 8000+ → 8000+ (-12) | - | block "form.core" -30 | "breadcrumb" → block "form.core" -30 | 0/0 |  |
| /de/en/general-conditions-currency-conversion | legal | 1440 | 7.2 | 1968 → 1927 (-41) | - | - | - | 0/0 |  |
| /de/en/meetings-and-events-delegates | info | 390 | 7.2 | 2878 → 2909 (+31) | - | - | - | 1/1 |  |
| /de/en/prepare-for-your-trip/special-travel-needs/travel-with-needs/cognitive-impairment | info | 390 | 7.2 | 8000+ → 8000+ (-255) | - | block "columns-media.sidebar" +18 | "Please let us know in advance" → block "columns-media" -58 | 1/6 | info (ema-cashub): page 670-8,100 px taller than www's; not diagnosed (no accordions or tabs on www) |
| /de/en/security-fast-lanes | info | 390 | 7.2 | 3495 → 3554 (+59) | 0 | block "accordion-columns.faq.spaced" -32 | "accordion-columns.faq.spaced" → block "accordion-columns.faq.spaced" -32 | 1/1 |  |
| /de/en/articles/explore-flying/inflight-entertainment-vr-experience | insights | 1440 | 7.1 | 7854 → 7872 (+18) | - | block "columns-media" -40 | "in section 1053x1053" → block "columns-media" -44 | 4/7 |  |
| /de/en/book-and-manage/pax-receipt/invoices-different-countries | info | 390 | 7.1 | 2271 → 2262 (-9) | - | h2 "Choose a country" -22 | - | 0/0 |  |
| /de/en/common/compensation-voucher | legal | 1440 | 7.1 | 4206 → 4136 (-70) | - | h2 "1. General" +16 | "2. Receipt of the Lufthansa.com vo" → h2 "5. Refunds" -30 | 0/0 |  |
| /de/en/lufthansa-first-class-fleet | fleet | 390 | 7.1 | 4241 → 4242 (+1) | 0 | picture "in section 346x111" -28 | "First Class on the A340-600" → picture "in section 346x111" -26 | 4/5 |  |
| /de/en/prepare-for-your-trip/baggage/baggage-irregularities/delayed-baggage-lhg | info | 1440 | 7.1 | 2714 → 2675 (-39) | 0 | - | - | 0/7 |  |
| /de/en/seat-maps | fleet | 1440 | 7.1 | 4894 → 4909 (+15) | - | h2 "Airbus" -16 | "in columns-media.padded 622x267" → h2 "Boeing" -22 | 2/12 |  |
| /de/en/travelling-with-animals | info | 390 | 7.1 | 3813 → 3798 (-15) | - | block "subpage-nav" +18 | "What travel options are there for " → block "subpage-nav" +16 | 0/1 |  |
| /de/en/articles/explore-the-world/essentials-barcelona-facts | insights | 1440 | 7 | 5395 → 5460 (+65) | -2 | picture "in related-articles 400x225" +16 | - | 2/8 |  |
| /de/en/carry-on-baggage | info | 390 | 7 | 8000+ → 8000+ (-627) | - | block "columns-media" -266 | "columns-media.link-list" → block "columns-media" -266 | 1/12 | info (ema-cashub): www's accordions and tabs not all imported as accordion blocks / tab sections (counts in the list below) |
| /de/en/common/accessibility-statement | legal | 1440 | 7 | 6502 → 6600 (+98) | 0 | h2 "Scope of this information" +16 | "Scope of this information" → h2 "General description of the service" +26 | 0/0 |  |
| /de/en/digital-baggage-services | info | 390 | 7 | 4836 → 4869 (+33) | 0 | - | - | 1/2 |  |
| /de/en/my-bookings | app-entry | 390 | 7 | 5334 → 5322 (-12) | 0 | block "carousel-cards.grid" -38 | "Log in now and add baggage" → block "carousel-cards.grid" -38 | 3/6 |  |
| /de/en/payment-options-at-the-airport | info | 1440 | 7 | 2542 → 2477 (-65) | 0 | h2 "Credit cards" +22 | "Please note:" → block "profile-tabs.content" -20 | 0/0 |  |
| /de/en/sepa-terms-and-conditions | legal | 390 | 7 | 2472 → 2485 (+13) | - | h2 "Authorisation for direct debiting" -20 | "breadcrumb" → h2 "Authorisation for direct debiting" -20 | 0/0 |  |
| /de/en/terms-and-conditions-lh | legal | 390 | 7 | 8000+ → 8000+ (-510) | 0 | h2 "Article 2: Scope" -96 | "General conditions of carriage for" → h2 "Article 2: Scope" -96 | 0/0 | legal (ema-cashub): page 500-2,300 px off www's height; not diagnosed |
| /de/en/lufthansa-first-class-entertainment | info | 1440 | 6.9 | 3099 → 3064 (-35) | 0 | - | - | 2/3 |  |
| /de/en/children-on-board | info | 390 | 6.8 | 3639 → 3639 (0) | 0 | h2 "Keeping children entertained on lo" -24 | "Child restraint systems" → h2 "Keeping children entertained on lo" -26 | 3/3 |  |
| /de/en/passengers-with-sensory-impairment | info | 390 | 6.8 | 8000+ → 8000+ (-185) | 0 | block "columns-media.padded" -20 | "in columns-media.padded 346x77" → block "columns-media" -82 | 4/9 |  |
| /de/en/travelling-with-special-requirements | info | 1440 | 6.8 | 2119 → 2103 (-16) | - | picture "in columns-media 408x175" -16 | "Older travellers" → picture "in columns-media 408x175" -16 | 5/6 |  |
| /de/en/refund | info | 1440 | 6.7 | 2415 → 2467 (+52) | 0 | - | - | 0/0 |  |
| /de/en/mobility-partner-program-healthcare | info | 390 | 6.6 | 4741 → 4755 (+14) | 0 | h2 "Extra oxygen on board" -26 | "Medical Operation Centre" → h2 "Good to know: additional services" +48 | 2/2 |  |
| /de/en/munich-fair | campaign | 390 | 6.6 | 3143 → 3157 (+14) | 0 | - | "From the airport to Messe München " → block "subpage-nav" +16 | 1/1 |  |
| /de/en/online-check-in-info | info | 390 | 6.6 | 3001 → 3001 (0) | - | - | - | 1/1 |  |
| /de/en/overview-flights | hub | 390 | 6.6 | 3517 → 3506 (-11) | 0 | - | - | 4/5 |  |
| /de/en/prepare-for-your-trip/baggage/baggage-conditions | legal | 1440 | 6.6 | 2124 → 2154 (+30) | - | h2 "Following conditions must be fulfi" +16 | "breadcrumb" → h2 "Following conditions must be fulfi" +16 | 0/0 |  |
| /de/en/prepare-for-your-trip/special-travel-needs/travel-with-needs/visual-impairment | info | 390 | 6.6 | 8000+ → 8000+ (-23) | 0 | picture "in columns-media.padded 346x77" +24 | "Here’s how to notify us of your as" → block "columns-media" -32 | 4/10 |  |
| /de/en/744 | fleet | 390 | 6.5 | 3255 → 3273 (+18) | 0 | h2 "Technical data" +22 | - | 1/3 |  |
| /de/en/europcar | info | 390 | 6.5 | 4331 → 4353 (+22) | 0 | - | - | 1/1 |  |
| /de/en/lufthansa-at-vienna-airport | info | 390 | 6.5 | 3001 → 2999 (-2) | - | - | - | 1/1 |  |
| /de/en/lufthansa-first-class-entertainment | info | 390 | 6.5 | 3806 → 3793 (-13) | - | block "subpage-nav" -18 | "Every moment belongs to you" → block "subpage-nav" -18 | 3/3 |  |
| /de/en/services-at-frankfurt-airport | info | 390 | 6.5 | 3232 → 3232 (0) | 0 | - | - | 2/2 |  |
| /de/en/tiere-als-handgepaeck | info | 390 | 6.5 | 5330 → 5372 (+42) | - | h2 "Checklist" -52 | "Prices" → h2 "Checklist" -52 | 1/1 |  |
| /de/en/book-and-manage/flights/lufthansa-voucher | info | 1440 | 6.4 | 1095 → 1110 (+15) | - | - | - | 0/0 |  |
| /de/en/electronic-bag-tags | info | 390 | 6.4 | 3797 → 3813 (+16) | 0 | - | - | 1/4 |  |
| /de/en/fia-valet-service | info | 390 | 6.4 | 4897 → 4887 (-10) | 0 | - | - | 1/1 |  |
| /de/en/services-on-board | hub | 390 | 6.4 | 3993 → 3991 (-2) | - | - | - | 6/6 |  |
| /de/en/unaccompanied-minors | info | 390 | 6.4 | 8000+ → 8000+ (+39) | 0 | h2 "Important travel documents and car" -56 | "table-striped" → h2 "Booking" +90 | 1/1 |  |
| /de/en/book-and-manage/flights/air-baltic | info | 390 | 6.3 | 8000+ → 8000+ (-86) | - | h2 "About airBaltic" -20 | "Seamless booking experience" → picture "in columns-media 346x43" -82 | 1/13 |  |
| /de/en/cookie-policy | legal | 390 | 6.3 | 8000+ → 8000+ (-851) | 0 | h2 "Glossary" -296 | "table-striped.header" → block "table-striped.header" +498 | 0/0 | legal (ema-cashub): page 500-2,300 px off www's height; not diagnosed |
| /de/en/faq-data-security | legal | 390 | 6.3 | 1550 → 1564 (+14) | 0 | - | - | 0/0 |  |
| /de/en/accessible-travel | info | 390 | 6.2 | 8000+ → 8000+ (-53) | 0 | h2 "Assistance for accessible travel" +24 | "in carousel-cards.grid 344x229" → h2 "Here’s how to notify us of your as" -66 | 1/13 |  |
| /de/en/book-and-manage/cancellation-and-refund/refund/refund-form | form | 390 | 6.2 | 4978 → 4982 (+4) | 0 | h2 "Terms and conditions for refunds" -32 | "Refunds" → h2 "Terms and conditions for refunds" -32 | 0/0 |  |
| /de/en/digital-baggage-services | info | 1440 | 6.2 | 3751 → 3720 (-31) | - | block "accordion-columns.faq.spaced" -24 | "Baggage" → block "accordion-columns.faq.spaced" -24 | 1/2 |  |
| /de/en/discover-lufthansa/carbon-offsetting/faq-saf | info | 1440 | 6.2 | 1760 → 1775 (+15) | - | - | - | 0/0 |  |
| /de/en/group-travel | info | 1440 | 6.2 | 7474 → 7664 (+190) | 0 | h2 "Group information" +18 | "Flight information" → h2 "Terms and conditions for group tra" +58 | 1/1 |  |
| /de/en/imprint | legal | 390 | 6.2 | 4067 → 4075 (+8) | 0 | block "columns-media.padded" +36 | "Legal notice" → block "columns-media.padded" +36 | 0/0 |  |
| /de/en/register-animal-cabin | form | 1440 | 6.2 | 5508 → 5616 (+108) | - | block "form.core" -20 | "breadcrumb" → block "form.core" -20 | 0/0 |  |
| /de/en/sports-baggage | info | 1440 | 6.2 | 4884 → 4808 (-76) | - | block "accordion-columns.faq.spaced" -76 | "accordion-columns.faq.spaced" → block "accordion-columns.faq.spaced" -76 | 0/4 |  |
| /de/en/support/contact/passenger-duty-united-kingdom | info | 1440 | 6.2 | 1814 → 1842 (+28) | 0 | - | - | 0/0 |  |
| /de/en/common/agb-extra-services-at-online-check-in | legal | 1440 | 6.1 | 2330 → 2286 (-44) | - | h2 "Add extra baggage items at the onl" -16 | - | 1/1 |  |
| /de/en/discover-lufthansa/carbon-offsetting/environmental-cost-surcharge | info | 390 | 6.1 | 2835 → 2834 (-1) | - | - | - | 0/0 |  |
| /de/en/fly-more-sustainabl | info | 1440 | 6.1 | 4133 → 4185 (+52) | 0 | h2 "Your options to support more susta" +32 | "columns-media" → block "accordion-columns.faq" +66 | 1/1 |  |
| /de/en/prepare-for-your-trip/baggage/baggage-conditions | legal | 390 | 6.1 | 3394 → 3414 (+20) | 0 | - | - | 0/0 |  |
| /de/en/travelling-with-children | info | 1440 | 6.1 | 5297 → 5299 (+2) | 0 | block "columns-media.padded" -36 | "On-board entertainment" → block "columns-media.padded" +38 | 8/8 |  |
| /de/en/admission-rules | info | 390 | 6 | 8000+ → 8000+ (-75) | 0 | h2 "Lounge access on arrival" -50 | "table-striped" → h2 "Lounge access on arrival" -52 | 1/1 |  |
| /de/en/first-class-valet-parking-service | info | 390 | 6 | 2465 → 2483 (+18) | 0 | - | - | 1/1 |  |
| /de/en/accessible-travel | info | 1440 | 5.9 | 5529 → 5505 (-24) | 0 | h2 "Assistance for accessible travel" +24 | "columns-media" → block "carousel-cards.grid.four-up" -32 | 8/17 |  |
| /de/en/discover-lufthansa/flightreservation-priceguarantee | info | 1440 | 5.9 | 3743 → 3704 (-39) | 0 | - | - | 2/6 |  |
| /de/en/first-class-lounges | info | 1440 | 5.9 | 4022 → 3968 (-54) | 0 | - | - | 1/1 |  |
| /de/en/first-class-valet-parking-service | info | 1440 | 5.9 | 1728 → 1755 (+27) | 0 | - | - | 1/1 |  |
| /de/en/fmg-valet-parking-service | info | 390 | 5.9 | 3729 → 3737 (+8) | 0 | - | - | 1/1 |  |
| /de/en/hertz | info | 1440 | 5.9 | 2994 → 3015 (+21) | 0 | - | - | 1/1 |  |
| /de/en/common/agb-extra-services-at-online-check-in/conditions-seat-reservation | legal | 1440 | 5.8 | 2636 → 2675 (+39) | - | h2 "General conditions" +16 | "Conditions when changing a seat" → h2 "General conditions" +16 | 1/1 |  |
| /de/en/security-check-time-slot | info | 1440 | 5.7 | 2837 → 2892 (+55) | - | block "table-striped" +56 | "Reserve your time slot in advance" → block "table-striped" +56 | 1/1 |  |
| /de/en/faq-ejournals | info | 390 | 5.6 | 1999 → 2012 (+13) | 0 | - | - | 0/0 |  |
| /de/en/fliegen-mit-baby | info | 1440 | 5.6 | 2265 → 2233 (-32) | - | - | - | 1/1 |  |
| /de/en/addresses-worldwide | info | 390 | 5.5 | 1399 → 1417 (+18) | 0 | block "accordion-columns.faq.limited-widt" +170 | "Addresses worldwide" → block "accordion-columns.faq.limited-widt" +170 | 0/0 |  |
| /de/en/boarding | info | 390 | 5.5 | 4483 → 4510 (+27) | - | h2 "Further boarding services" +20 | "breadcrumb" → h2 "Further boarding services" +20 | 0/0 |  |
| /de/en/services-at-frankfurt-airport | info | 1440 | 5.5 | 2275 → 2273 (-2) | - | - | - | 0/2 |  |
| /de/en/discover-lufthansa/carbon-offsetting/saf | info | 1440 | 5.4 | 3573 → 3602 (+29) | - | h2 "How does Lufthansa Group determine" +30 | "Why is SAF not yet used on all fli" → h2 "How does Lufthansa Group determine" +32 | 2/2 |  |
| /de/en/group-travel | info | 390 | 5.4 | 8000+ → 8000+ (-5) | 0 | h2 "Flight information" +42 | "Flight information" → h2 "FAQs" -66 | 1/1 |  |
| /de/en/secure-flight | info | 390 | 5.4 | 2055 → 2060 (+5) | 0 | - | - | 0/0 |  |
| /de/en/book-and-manage/additional-services/get-your-guide | info | 390 | 5.3 | 2305 → 2310 (+5) | 0 | - | - | 1/1 |  |
| /de/en/book-and-manage/pax-receipt | info | 1440 | 5.3 | 2088 → 2113 (+25) | 0 | - | - | 0/0 |  |
| /de/en/lufthansa-at-duesseldorf-airport | info | 390 | 5.3 | 3895 → 3902 (+7) | 0 | - | - | 1/1 |  |
| /de/en/security-fast-lanes | info | 1440 | 5.3 | 3053 → 3006 (-47) | - | - | - | 1/1 |  |
| /de/en/sepa-terms-and-conditions | legal | 1440 | 5.3 | 1794 → 1811 (+17) | - | h2 "Authorisation for direct debiting" -40 | "breadcrumb" → h2 "Authorisation for direct debiting" -40 | 0/0 |  |
| /de/en/special-needs | hub | 1440 | 5.3 | 5271 → 5195 (-76) | - | h2 "Mobility impairments" -150 | "Personal details" → h2 "Mobility impairments" -150 | 0/0 |  |
| /de/en/book-and-manage/cancellation-and-refund/refund/refund-form | form | 1440 | 5.2 | 3928 → 3985 (+57) | 0 | h2 "Terms and conditions for refunds" -16 | "Terms and conditions for refunds" → block "form.core" -26 | 0/0 |  |
| /de/en/first-class-comfort | info | 1440 | 5.2 | 2785 → 2793 (+8) | - | - | - | 3/3 |  |
| /de/en/fliegen-mit-baby | info | 390 | 5.2 | 2876 → 2885 (+9) | - | - | - | 1/1 |  |
| /de/en/security-check-time-slot | info | 390 | 5.2 | 2956 → 2987 (+31) | - | h2 "All the airports with time-slot ac" +28 | "Reserve your time slot in advance" → h2 "All the airports with time-slot ac" +28 | 1/1 |  |
| /de/en/book-and-manage/flights/helvetic | info | 1440 | 5.1 | 5260 → 5276 (+16) | - | - | - | 9/9 |  |
| /de/en/rail-fly-terms-and-conditions | legal | 1440 | 5.1 | 3017 → 3008 (-9) | - | h2 "1. Applicability" -32 | "breadcrumb" → h2 "1. Applicability" -32 | 0/0 |  |
| /de/en/sepa-terms-and-conditions-b | legal | 1440 | 5.1 | 1902 → 1916 (+14) | - | h2 "Address disclosure authorisation" -28 | "breadcrumb" → h2 "Address disclosure authorisation" -28 | 0/0 |  |
| /de/en/book-and-manage/flights/air-baltic | info | 1440 | 5 | 6493 → 6547 (+54) | - | block "columns-media.padded" -28 | "Prepare for your journey" → block "columns-media.padded" +34 | 13/16 |  |
| /de/en/children-on-board | info | 1440 | 5 | 2380 → 2404 (+24) | 0 | h2 "Your little ones are our big prior" +26 | "On board with children and babies" → h2 "Your little ones are our big prior" +26 | 3/3 |  |
| /de/en/first-class-comfort | info | 390 | 5 | 3403 → 3408 (+5) | 0 | - | - | 3/3 |  |
| /content/lh/markets/de/en/during-your-trip/lounges/loungenet | lounge | 1440 | 4.9 | 916 → 924 (+8) | 0 | - | - | 0/0 |  |
| /de/en/359 | fleet | 390 | 4.8 | 3019 → 3024 (+5) | - | - | "Seat maps of the Airbus A350-900 t" → h2 "Technical data" +16 | 1/2 |  |
| /de/en/admission-rules | info | 1440 | 4.8 | 7245 → 7143 (-102) | 0 | block "table-striped" -28 | "Lounge access for your travel comp" → block "table-striped" -46 | 1/1 |  |
| /de/en/europa-tarife-economy-class | info | 1440 | 4.8 | 5442 → 5493 (+51) | 0 | - | - | 1/1 |  |
| /de/en/first-class-personal-assistant | info | 390 | 4.8 | 3095 → 3101 (+6) | - | - | - | 1/1 |  |
| /de/en/lufthansa-guide-service | info | 1440 | 4.8 | 3850 → 3804 (-46) | - | block "table-striped" -16 | - | 0/0 |  |
| /de/en/book-and-manage/digital-self-services/airline-apps | info | 1440 | 4.7 | 1690 → 1687 (-3) | 0 | h2 "Download your airline’s app now:" +20 | "columns-media" → picture "in columns-media 301x251" +22 | 0/4 |  |
| /de/en/common | legal | 1440 | 4.7 | 951 → 959 (+8) | 0 | - | - | 0/0 |  |
| /de/en/business-services | info | 1440 | 4.6 | 951 → 959 (+8) | 0 | - | - | 0/0 |  |
| /de/en/group-travel-and-charter | info | 390 | 4.6 | 1991 → 1996 (+5) | - | - | - | 2/2 |  |
| /de/en/services-munich-airport | info | 1440 | 4.6 | 1922 → 1907 (-15) | 0 | - | - | 1/1 |  |
| /de/en/passengers-using-wheelchairs | info | 1440 | 4.5 | 8000+ → 8000+ (+1539) | - | h2 "Straight to the point" -66 | "Straight to the point" → block "columns-media.padded" +120 | 7/11 | info (ema-cashub): www's accordions and tabs not all imported as accordion blocks / tab sections (counts in the list below) |
| /de/en/uebergepaeck | info | 1440 | 4.5 | 3210 → 3191 (-19) | 0 | - | - | 1/2 |  |
| /de/en/data-protection-information | legal | 1440 | 4.4 | 8000+ → 8000+ (-224) | 0 | h2 "1. Who is the data controller?" -16 | "1. Who is the data controller?" → h2 "2. Who can I contact?" -52 | 0/0 |  |
| /de/en/with-children-at-the-airport | info | 1440 | 4.4 | 3131 → 3144 (+13) | 0 | block "columns-media.padded" -30 | "Separate children’s area in the Bu" → block "columns-media" +64 | 2/2 |  |
| /de/en/affiliatemarketing | info | 1440 | 4.3 | 2826 → 2808 (-18) | - | - | - | 0/0 |  |
| /de/en/anmeldung-tiere-frachtraum | form | 1440 | 4.3 | 6445 → 6501 (+56) | - | block "form.core" -38 | "Register cat or dog" → h2 "Terms and conditions of use" -56 | 0/0 |  |
| /de/en/besondere-befoerderungsbedingungen-bus | legal | 1440 | 4.3 | 8000+ → 8000+ (-444) | - | h2 "2. Tickets and payment" -104 | "breadcrumb" → h2 "2. Tickets and payment" -104 | 0/0 |  |
| /de/en/prepare-for-your-trip/current-travel-information | info | 1440 | 4.3 | 1261 → 1270 (+9) | - | - | - | 0/0 |  |
| /de/en/prepare-for-your-trip/getting-to-and-from-the-airport/lufthansa-express-bus-briefing | info | 1440 | 4.3 | 2521 → 2536 (+15) | - | - | - | 1/1 |  |
| /de/en/timetable-and-flight-status | flight-status | 1440 | 4.3 | 3075 → 3090 (+15) | 0 | - | - | 3/3 |  |
| /de/en/imprint | legal | 1440 | 4.2 | 2466 → 2475 (+9) | 0 | block "columns-media.padded" +32 | "Registration" → block "columns-media.padded" +24 | 0/0 |  |
| /de/en/lounge-companions | info | 1440 | 4.2 | 3473 → 3495 (+22) | - | block "table-striped" +16 | - | 1/1 |  |
| /de/en/lufthansa-at-berlin-airport | info | 1440 | 4.2 | 2913 → 2919 (+6) | - | - | - | 1/3 |  |
| /de/en/lufthansa-at-duesseldorf-airport | info | 1440 | 4.2 | 2879 → 2900 (+21) | - | - | - | 1/1 |  |
| /de/en/travel-id-terms-conditions | legal | 1440 | 4.2 | 8000+ → 8000+ (+95) | 0 | h2 "2. Registration for Travel ID" +42 | "1. Scope" → h2 "2. Registration for Travel ID" +48 | 0/0 |  |
| /de/en/fia-valet-service | info | 1440 | 4.1 | 3456 → 3437 (-19) | - | - | - | 1/1 |  |
| /de/en/lufthansa-at-vienna-airport | info | 1440 | 4.1 | 2490 → 2507 (+17) | - | - | - | 1/1 |  |
| /de/en/partner | info | 1440 | 4.1 | 2666 → 2684 (+18) | 0 | - | - | 5/5 |  |
| /de/en/my-bookings | app-entry | 1440 | 4 | 3647 → 3654 (+7) | 0 | block "carousel-cards.grid" -18 | "Log in now and add baggage" → block "carousel-cards.grid" -18 | 2/6 |  |
| /de/en/prepare-for-your-trip/entry-regulations/immigration-regulations-uk | info | 1440 | 4 | 2551 → 2566 (+15) | - | - | - | 1/1 |  |
| /de/en/services-at-the-airport | hub | 1440 | 4 | 2822 → 2815 (-7) | 0 | h2 "Security Fast Lanes" +16 | "Security Fast Lanes" → picture "in cards-teaser.spacious 622x267" -24 | 4/4 |  |
| /de/en/sixt | info | 1440 | 4 | 3001 → 2990 (-11) | 0 | picture "in car-rental 1264x405" -16 | "Search" → picture "in car-rental 1264x405" -16 | 1/1 |  |
| /de/en/744 | fleet | 1440 | 3.8 | 3319 → 3283 (-36) | 0 | - | - | 2/3 |  |
| /de/en/electronic-bag-tags | info | 1440 | 3.8 | 2877 → 2858 (-19) | 0 | block "accordion-columns.faq.limited-widt" -28 | "columns-media" → block "accordion-columns.faq.limited-widt" -28 | 1/4 |  |
| /de/en/dangerous-dogs | info | 1440 | 3.7 | 2406 → 2408 (+2) | - | - | - | 0/1 |  |
| /de/en/lufthansa-at-zuerich-airport | info | 1440 | 3.7 | 2544 → 2558 (+14) | - | - | - | 1/1 |  |
| /de/en/online-check-in-info | info | 1440 | 3.7 | 2668 → 2655 (-13) | 0 | h2 "Availability of online check-in" +26 | "in section 1264x542" → h2 "Availability of online check-in" +26 | 1/1 |  |
| /de/en/terms-and-conditions-lh | legal | 1440 | 3.6 | 8000+ → 8000+ (-120) | - | h2 "General Conditions of Carriage for" -70 | "breadcrumb" → h2 "General Conditions of Carriage for" -70 | 0/0 | legal (ema-cashub): page 500-2,300 px off www's height; not diagnosed |
| /de/en/359 | fleet | 1440 | 3.5 | 3409 → 3373 (-36) | 0 | - | - | 1/2 |  |
| /de/en/addresses-worldwide | info | 1440 | 3.5 | 1257 → 1249 (-8) | 0 | - | - | 0/0 |  |
| /de/en/all-check-in | info | 1440 | 3.5 | 2794 → 2817 (+23) | 0 | - | - | 5/5 |  |
| /de/en/datenschutz | legal | 1440 | 3.5 | 1523 → 1516 (-7) | 0 | - | - | 0/0 |  |
| /de/en/articles/explore-flying | insights | 1440 | 3.4 | 5525 → 5532 (+7) | +12 | block "blog-overview" +36 | "in blog-overview 582x327" → h1 "Our Authors" -44 | 6/14 |  |
| /de/en/automatic-check-in | info | 1440 | 3.4 | 2987 → 2980 (-7) | 0 | - | - | 1/1 |  |
| /de/en/book-and-manage/pax-receipt/invoices-different-countries | info | 1440 | 3.4 | 2059 → 2045 (-14) | 0 | h2 "Choose a country" -22 | "Invoices for different countries" → h2 "Choose a country" -22 | 0/0 |  |
| /de/en/prepare-for-your-trip/travel-classes/economy-basic | info | 1440 | 3.4 | 4101 → 4082 (-19) | 0 | - | - | 2/3 |  |
| /de/en/services-on-board | hub | 1440 | 3.4 | 2789 → 2781 (-8) | 0 | - | - | 6/6 |  |
| /de/en/common/imprint/lufthansa-insights-imprint | legal | 1440 | 3.3 | 2903 → 2908 (+5) | - | block "columns-media.padded" +32 | "Publisher" → h2 "Publishing support, design and pro" -28 | 0/0 |  |
| /de/en/travel-agencies | info | 1440 | 3.3 | 1737 → 1731 (-6) | 0 | - | - | 2/2 |  |
| /de/en/overview-flights | hub | 1440 | 3.2 | 2703 → 2719 (+16) | 0 | - | - | 5/5 |  |
| /de/en/upgrade-info | info | 1440 | 3.2 | 2255 → 2260 (+5) | - | - | - | 1/1 |  |
| /de/en/cookie-policy | legal | 1440 | 3 | 8000+ → 8000+ (-695) | 0 | h2 "What are cookies and how do they w" +28 | "What are cookies and how do they w" → h2 "Glossary" -176 | 0/0 | legal (ema-cashub): page 500-2,300 px off www's height; not diagnosed |
| /de/en/meetings-and-events-organisers | info | 1440 | 2.9 | 2888 → 2886 (-2) | 0 | - | - | 1/1 |  |
| /de/en/bid-upgrade | info | 1440 | 2.8 | 3888 → 3889 (+1) | - | - | - | 1/1 |  |
| /de/en/meetings-and-events-delegates | info | 1440 | 2.8 | 2312 → 2314 (+2) | - | - | - | 1/1 |  |
| /de/en/tiere-als-handgepaeck | info | 1440 | 2.7 | 4245 → 4243 (-2) | - | - | - | 1/1 |  |
| /de/en/boarding | info | 1440 | 2.5 | 3181 → 3185 (+4) | 0 | - | - | 0/0 |  |
| /de/en/fmg-valet-parking-service | info | 1440 | 2.5 | 2956 → 2959 (+3) | - | - | - | 1/1 |  |
| /de/en/overview-travel-information | hub | 1440 | 2.5 | 2840 → 2842 (+2) | 0 | - | - | 5/6 |  |
| /de/en/book-and-manage/booking-services/manage-my-bookings | app-entry | 1440 | 2.4 | 1422 → 1425 (+3) | 0 | - | - | 0/0 |  |
| /de/en/first-class-personal-assistant | info | 1440 | 2.1 | 2210 → 2210 (0) | - | - | - | 1/1 |  |
| /de/en/group-travel-and-charter | info | 1440 | 2.1 | 1521 → 1520 (-1) | 0 | - | - | 2/2 |  |
| /de/en/travelling-with-animals | info | 1440 | 2.1 | 2654 → 2655 (+1) | - | - | - | 0/1 |  |
| /de/en/book-and-manage/additional-services/get-your-guide | info | 1440 | 2 | 1969 → 1969 (0) | - | - | - | 1/1 |  |
| /de/en/lh-rentalcar | info | 1440 | 2 | 2376 → 2374 (-2) | 0 | - | - | 3/4 |  |
| /de/en/during-your-trip/food-and-beverages/onboard-delights/faq | info | 1440 | 1.8 | 1936 → 1936 (0) | 0 | - | - | 0/0 |  |
| /de/en/articles/tags | insights | 1440 | 1.6 | 1986 → 1988 (+2) | - | - | - | 2/2 |  |
| /de/en/flights | hub | 390 | 1.3 | 8000+ → 8000+ (+5012) | -20 | h1 "Best offers" -20 | "in destination-finder.grid 167x167" → picture "in destination-finder.grid 167x167" -340 | 3/48 | the destination finder's results (live data, masked) differ in count; ours 5,012 px taller at 390 |
| /de/en/flights | hub | 1440 | 0.7 | 8000+ → 8000+ (-767) | -40 | h1 "Best offers" -40 | "in destination-finder.grid 222x222" → picture "in destination-finder.grid 222x222" -422 | 1/84 | the destination finder's results (live data, masked) differ in count; ours 5,012 px taller at 390 |

### SWISS (24 pages, 48 page-widths)

| Page | Template | Width | Diff % | Height www → ours | h1 | First drift ≥16 px (ours vs www) | Largest step | Pictures found, height differs | Cause |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| /magazine/de/inside-swiss/behind-the-scenes/a350-special-livery | magazine | 390 | 32.9 | 7834 → 6729 (-1105) | +49 | h1 "Freddie Mercury, Helvetia und ein " +49 | "Weitere Beiträge" → picture "in related-articles 358x239" +749 | 2/8, 1 differ | www's advertisement slots (left out by design, row 20); the article's subheads smaller on www |
| /magazine/en/inside-swiss/behind-the-scenes/a350-special-livery | magazine | 390 | 32.2 | 7936 → 6844 (-1092) | +49 | h1 "SWISS to fly Freddie Mercury, Helv" +49 | "More Stories" → picture "in related-articles 358x239" +781 | 2/8, 1 differ | www's advertisement slots (left out by design, row 20); the article's subheads smaller on www |
| /ch/de/homepage | swiss | 1440 | 28.6 | 4480 → 4305 (-175) | - | block "fare-teaser" -16 | "in destination-finder 370x555" → h2 "Suchen Sie mehr als nur einen Flug" -84 | 5/29 | live widgets: destination finder and fare teaser (data, rows 13 and 35); the flight search 34 px lower at 390 |
| /ch/en/homepage | swiss | 1440 | 28.5 | 4412 → 4280 (-132) | - | block "fare-teaser" -16 | "in destination-finder 370x555" → h2 "Looking for more than just a fligh" -74 | 5/29 | live widgets: destination finder and fare teaser (data, rows 13 and 35); the flight search 34 px lower at 390 |
| /ch/en/book-and-manage/overview-extra-services | swiss | 390 | 27.2 | 6203 → 6032 (-171) | 0 | block "carousel-cards.grid" -24 | "Extra services" → block "carousel-cards.grid" -24 | 11/11 | card grids: www has two column-view spacings (wrapper .section: 32/32 px, first card 72 px under the H1 at 390; plain: 20/10 px, about 60 px) that our documents don't tell apart; one theme rule can't fit both (tried, reverted); proposal: the SWISS importer marks the grid, then theme rules |
| /ch/en/book-and-manage/overview-manage | swiss | 390 | 25.3 | 4719 → 4689 (-30) | 0 | block "carousel-cards.grid" -28 | "Manage" → block "carousel-cards.grid" -28 | 9/9 | card grids: www has two column-view spacings (wrapper .section: 32/32 px, first card 72 px under the H1 at 390; plain: 20/10 px, about 60 px) that our documents don't tell apart; one theme rule can't fit both (tried, reverted); proposal: the SWISS importer marks the grid, then theme rules |
| /magazine/de/inside-swiss/behind-the-scenes/a350-special-livery | magazine | 1440 | 23.1 | 6860 → 6269 (-591) | -3 | picture "in section 766x766" -346 | "Weitere Beiträge" → picture "in related-articles 371x247" +415 | 2/8, 1 differ | www's advertisement slots (left out by design, row 20); the article's subheads smaller on www |
| /magazine/en/inside-swiss/behind-the-scenes/a350-special-livery | magazine | 1440 | 22.7 | 6925 → 6362 (-563) | -3 | picture "in section 638x359" -74 | "More Stories" → picture "in related-articles 371x247" +452 | 2/8, 1 differ | www's advertisement slots (left out by design, row 20); the article's subheads smaller on www |
| /magazine/en | magazine | 390 | 21.6 | 8000+ → 8967 (-1414) | - | h2 "Inside SWISS" -374 | "in section 358x537" → h2 "Switzerland" -1684 | 5/25 | magazine home: www's ad slots and longer story lists (row 20) |
| /magazine/de | magazine | 390 | 21.3 | 8000+ → 8967 (-1447) | - | h2 "Inside SWISS" -374 | "in section 358x537" → h2 "Schweiz" -1718 | 5/25 | magazine home: www's ad slots and longer story lists (row 20) |
| /ch/en/discover/overview-inspiration | swiss | 390 | 20.7 | 2557 → 2593 (+36) | 0 | block "carousel-cards.grid.four-up" -16 | "in carousel-cards.grid.four-up 344" → picture "in carousel-cards.grid.four-up 344" -18 | 4/4 | card grids: www has two column-view spacings (wrapper .section: 32/32 px, first card 72 px under the H1 at 390; plain: 20/10 px, about 60 px) that our documents don't tell apart; one theme rule can't fit both (tried, reverted); proposal: the SWISS importer marks the grid, then theme rules |
| /ch/de/homepage | swiss | 390 | 20.5 | 5141 → 5300 (+159) | - | block "flight-search.flight-search-deferr" +34 | "flight-search.flight-search-deferr" → block "fare-teaser" +150 | 2/26 | live widgets: destination finder and fare teaser (data, rows 13 and 35); the flight search 34 px lower at 390 |
| /ch/de/book-and-manage/overview-manage | swiss | 390 | 20.5 | 4851 → 4843 (-8) | 0 | block "carousel-cards.grid" -28 | "Verwalten" → block "carousel-cards.grid" -28 | 9/9 | card grids: www has two column-view spacings (wrapper .section: 32/32 px, first card 72 px under the H1 at 390; plain: 20/10 px, about 60 px) that our documents don't tell apart; one theme rule can't fit both (tried, reverted); proposal: the SWISS importer marks the grid, then theme rules |
| /ch/de/book-and-manage/overview-extra-services | swiss | 390 | 20.2 | 6423 → 6275 (-148) | 0 | block "carousel-cards.grid" -24 | "Zusatzleistungen" → block "carousel-cards.grid" -24 | 11/11 | card grids: www has two column-view spacings (wrapper .section: 32/32 px, first card 72 px under the H1 at 390; plain: 20/10 px, about 60 px) that our documents don't tell apart; one theme rule can't fit both (tried, reverted); proposal: the SWISS importer marks the grid, then theme rules |
| /ch/en/homepage | swiss | 390 | 19.4 | 5010 → 5240 (+230) | - | block "flight-search.flight-search-deferr" +34 | "flight-search.flight-search-deferr" → block "fare-teaser" +172 | 1/26 | live widgets: destination finder and fare teaser (data, rows 13 and 35); the flight search 34 px lower at 390 |
| /ch/en/prepare/special-care | swiss | 390 | 17.7 | 3497 → 3539 (+42) | 0 | block "carousel-cards.grid" -16 | "in carousel-cards.grid 344x172" → block "carousel-cards.grid" +20 | 6/6 | card grids: www has two column-view spacings (wrapper .section: 32/32 px, first card 72 px under the H1 at 390; plain: 20/10 px, about 60 px) that our documents don't tell apart; one theme rule can't fit both (tried, reverted); proposal: the SWISS importer marks the grid, then theme rules |
| /ch/de/prepare/special-care | swiss | 390 | 17.7 | 3585 → 3624 (+39) | 0 | block "carousel-cards.grid" -16 | "in carousel-cards.grid 344x172" → block "carousel-cards.grid" +22 | 6/6 | card grids: www has two column-view spacings (wrapper .section: 32/32 px, first card 72 px under the H1 at 390; plain: 20/10 px, about 60 px) that our documents don't tell apart; one theme rule can't fit both (tried, reverted); proposal: the SWISS importer marks the grid, then theme rules |
| /ch/en/prepare/overview-flights | swiss | 390 | 16.9 | 3328 → 3326 (-2) | 0 | block "carousel-cards.grid" -24 | "Flights - your journey starts here" → block "carousel-cards.grid" -24 | 5/5 | card grids: www has two column-view spacings (wrapper .section: 32/32 px, first card 72 px under the H1 at 390; plain: 20/10 px, about 60 px) that our documents don't tell apart; one theme rule can't fit both (tried, reverted); proposal: the SWISS importer marks the grid, then theme rules |
| /ch/de/prepare/overview-flights | swiss | 390 | 16.6 | 3374 → 3392 (+18) | 0 | block "carousel-cards.grid" -24 | "Flüge - Ihre Reise beginnt hier" → block "carousel-cards.grid" -24 | 5/5 | card grids: www has two column-view spacings (wrapper .section: 32/32 px, first card 72 px under the H1 at 390; plain: 20/10 px, about 60 px) that our documents don't tell apart; one theme rule can't fit both (tried, reverted); proposal: the SWISS importer marks the grid, then theme rules |
| /ch/en/prepare/overview-travel-information | swiss | 390 | 15.9 | 3387 → 3445 (+58) | 0 | block "carousel-cards.grid" -16 | "in carousel-cards.grid 344x172" → block "carousel-cards.grid" +18 | 6/6 | card grids: www has two column-view spacings (wrapper .section: 32/32 px, first card 72 px under the H1 at 390; plain: 20/10 px, about 60 px) that our documents don't tell apart; one theme rule can't fit both (tried, reverted); proposal: the SWISS importer marks the grid, then theme rules |
| /ch/en/fly/on-board/travel-classes | swiss | 390 | 15.2 | 2697 → 2705 (+8) | 0 | block "carousel-cards.grid" -16 | "in carousel-cards.grid 344x172" → block "carousel-cards.grid" +18 | 4/4 | card grids: www has two column-view spacings (wrapper .section: 32/32 px, first card 72 px under the H1 at 390; plain: 20/10 px, about 60 px) that our documents don't tell apart; one theme rule can't fit both (tried, reverted); proposal: the SWISS importer marks the grid, then theme rules |
| /ch/de/fly/on-board/travel-classes | swiss | 390 | 15.2 | 2741 → 2749 (+8) | 0 | block "carousel-cards.grid" -16 | "in carousel-cards.grid 344x172" → block "carousel-cards.grid" +18 | 4/4 | card grids: www has two column-view spacings (wrapper .section: 32/32 px, first card 72 px under the H1 at 390; plain: 20/10 px, about 60 px) that our documents don't tell apart; one theme rule can't fit both (tried, reverted); proposal: the SWISS importer marks the grid, then theme rules |
| /ch/de/customer-support/contact-us | swiss | 390 | 14.3 | 2409 → 2449 (+40) | - | picture "in micro-frontend 344x153" -196 | "in section 375x210" → picture "in micro-frontend 344x153" -196 | 2/2 | the help app's stage photo (row 19, open) |
| /ch/de/prepare/overview-travel-information | swiss | 390 | 14.2 | 3453 → 3489 (+36) | 0 | block "carousel-cards.grid" -16 | "Reiseinformationen" → block "carousel-cards.grid" -16 | 6/6 | card grids: www has two column-view spacings (wrapper .section: 32/32 px, first card 72 px under the H1 at 390; plain: 20/10 px, about 60 px) that our documents don't tell apart; one theme rule can't fit both (tried, reverted); proposal: the SWISS importer marks the grid, then theme rules |
| /ch/en/customer-support/contact-us | swiss | 390 | 14.1 | 2326 → 2366 (+40) | - | picture "in micro-frontend 344x153" -196 | "in section 375x210" → picture "in micro-frontend 344x153" -196 | 2/2 | the help app's stage photo (row 19, open) |
| /ch/de/discover/overview-inspiration | swiss | 390 | 12.4 | 2645 → 2662 (+17) | 0 | block "carousel-cards.grid.four-up" -16 | "Inspiration" → block "carousel-cards.grid.four-up" -16 | 4/4 | card grids: www has two column-view spacings (wrapper .section: 32/32 px, first card 72 px under the H1 at 390; plain: 20/10 px, about 60 px) that our documents don't tell apart; one theme rule can't fit both (tried, reverted); proposal: the SWISS importer marks the grid, then theme rules |
| /ch/de/book-and-manage/overview-extra-services | swiss | 1440 | 12.2 | 3071 → 3017 (-54) | -1 | picture "in carousel-cards.grid 406x203" -40 | "in carousel-cards.grid 406x203" → picture "in carousel-cards.grid 406x203" -28 | 10/11 | card grids: www has two column-view spacings (wrapper .section: 32/32 px, first card 72 px under the H1 at 390; plain: 20/10 px, about 60 px) that our documents don't tell apart; one theme rule can't fit both (tried, reverted); proposal: the SWISS importer marks the grid, then theme rules |
| /ch/en/fly/on-board | swiss | 390 | 12.1 | 2191 → 2226 (+35) | 0 | block "carousel-cards.grid" -16 | "Services on board" → block "carousel-cards.grid" -16 | 3/3 | card grids: www has two column-view spacings (wrapper .section: 32/32 px, first card 72 px under the H1 at 390; plain: 20/10 px, about 60 px) that our documents don't tell apart; one theme rule can't fit both (tried, reverted); proposal: the SWISS importer marks the grid, then theme rules |
| /ch/de/fly/on-board | swiss | 390 | 12.1 | 2235 → 2270 (+35) | 0 | block "carousel-cards.grid" -16 | "Services an Bord" → block "carousel-cards.grid" -16 | 3/3 | card grids: www has two column-view spacings (wrapper .section: 32/32 px, first card 72 px under the H1 at 390; plain: 20/10 px, about 60 px) that our documents don't tell apart; one theme rule can't fit both (tried, reverted); proposal: the SWISS importer marks the grid, then theme rules |
| /ch/en/book-and-manage/overview-extra-services | swiss | 1440 | 11.4 | 2956 → 2929 (-27) | -1 | picture "in carousel-cards.grid 406x203" -18 | - | 11/11 | card grids: www has two column-view spacings (wrapper .section: 32/32 px, first card 72 px under the H1 at 390; plain: 20/10 px, about 60 px) that our documents don't tell apart; one theme rule can't fit both (tried, reverted); proposal: the SWISS importer marks the grid, then theme rules |
| /ch/de/customer-support/contact-us | swiss | 1440 | 10.3 | 2143 → 2112 (-31) | - | picture "in micro-frontend 631x280" -172 | "in section 1425x375" → picture "in micro-frontend 631x280" -172 | 2/2 | the help app's stage photo (row 19, open) |
| /ch/en/customer-support/contact-us | swiss | 1440 | 10.2 | 2116 → 2112 (-4) | - | picture "in micro-frontend 631x280" -172 | "in section 1425x375" → picture "in micro-frontend 631x280" -172 | 2/2 | the help app's stage photo (row 19, open) |
| /magazine/en | magazine | 1440 | 10 | 7022 → 6864 (-158) | - | h2 "Inside SWISS" -223 | "in carousel-cards 392x261" → h2 "Inside SWISS" -217 | 5/25 | magazine home: www's ad slots and longer story lists (row 20) |
| /magazine/de | magazine | 1440 | 9.3 | 6975 → 6901 (-74) | - | h2 "Inside SWISS" -223 | "in carousel-cards 392x261" → h2 "Inside SWISS" -217 | 6/25 | magazine home: www's ad slots and longer story lists (row 20) |
| /ch/de/prepare/special-care | swiss | 1440 | 9.1 | 1966 → 1919 (-47) | -1 | block "carousel-cards.grid" -22 | "in carousel-cards.grid 406x203" → block "carousel-cards.grid" -22 | 6/6 | card grids: www has two column-view spacings (wrapper .section: 32/32 px, first card 72 px under the H1 at 390; plain: 20/10 px, about 60 px) that our documents don't tell apart; one theme rule can't fit both (tried, reverted); proposal: the SWISS importer marks the grid, then theme rules |
| /ch/en/prepare/special-care | swiss | 1440 | 9 | 1938 → 1919 (-19) | -1 | block "carousel-cards.grid" -24 | "in carousel-cards.grid 406x203" → block "carousel-cards.grid" -24 | 6/6 | card grids: www has two column-view spacings (wrapper .section: 32/32 px, first card 72 px under the H1 at 390; plain: 20/10 px, about 60 px) that our documents don't tell apart; one theme rule can't fit both (tried, reverted); proposal: the SWISS importer marks the grid, then theme rules |
| /ch/de/prepare/overview-travel-information | swiss | 1440 | 8.8 | 1944 → 1897 (-47) | -1 | block "carousel-cards.grid" -22 | "in carousel-cards.grid 406x203" → block "carousel-cards.grid" -20 | 6/6 | card grids: www has two column-view spacings (wrapper .section: 32/32 px, first card 72 px under the H1 at 390; plain: 20/10 px, about 60 px) that our documents don't tell apart; one theme rule can't fit both (tried, reverted); proposal: the SWISS importer marks the grid, then theme rules |
| /ch/en/prepare/overview-travel-information | swiss | 1440 | 7.9 | 1916 → 1897 (-19) | -1 | block "carousel-cards.grid" -22 | "in carousel-cards.grid 406x203" → block "carousel-cards.grid" -22 | 6/6 | card grids: www has two column-view spacings (wrapper .section: 32/32 px, first card 72 px under the H1 at 390; plain: 20/10 px, about 60 px) that our documents don't tell apart; one theme rule can't fit both (tried, reverted); proposal: the SWISS importer marks the grid, then theme rules |
| /ch/de/book-and-manage/overview-manage | swiss | 1440 | 6.6 | 2437 → 2397 (-40) | -1 | - | - | 9/9 | card grids: www has two column-view spacings (wrapper .section: 32/32 px, first card 72 px under the H1 at 390; plain: 20/10 px, about 60 px) that our documents don't tell apart; one theme rule can't fit both (tried, reverted); proposal: the SWISS importer marks the grid, then theme rules |
| /ch/en/book-and-manage/overview-manage | swiss | 1440 | 6.5 | 2362 → 2349 (-13) | -1 | - | - | 9/9 | card grids: www has two column-view spacings (wrapper .section: 32/32 px, first card 72 px under the H1 at 390; plain: 20/10 px, about 60 px) that our documents don't tell apart; one theme rule can't fit both (tried, reverted); proposal: the SWISS importer marks the grid, then theme rules |
| /ch/en/prepare/overview-flights | swiss | 1440 | 5 | 1862 → 1851 (-11) | 0 | - | - | 5/5 | card grids: www has two column-view spacings (wrapper .section: 32/32 px, first card 72 px under the H1 at 390; plain: 20/10 px, about 60 px) that our documents don't tell apart; one theme rule can't fit both (tried, reverted); proposal: the SWISS importer marks the grid, then theme rules |
| /ch/en/fly/on-board/travel-classes | swiss | 1440 | 4.8 | 1938 → 1919 (-19) | -1 | block "carousel-cards.grid" -22 | "in carousel-cards.grid 406x203" → block "carousel-cards.grid" -22 | 4/4 | card grids: www has two column-view spacings (wrapper .section: 32/32 px, first card 72 px under the H1 at 390; plain: 20/10 px, about 60 px) that our documents don't tell apart; one theme rule can't fit both (tried, reverted); proposal: the SWISS importer marks the grid, then theme rules |
| /ch/de/fly/on-board/travel-classes | swiss | 1440 | 4.8 | 1988 → 1941 (-47) | -1 | block "carousel-cards.grid" -22 | "in carousel-cards.grid 406x203" → block "carousel-cards.grid" -22 | 4/4 | card grids: www has two column-view spacings (wrapper .section: 32/32 px, first card 72 px under the H1 at 390; plain: 20/10 px, about 60 px) that our documents don't tell apart; one theme rule can't fit both (tried, reverted); proposal: the SWISS importer marks the grid, then theme rules |
| /ch/de/prepare/overview-flights | swiss | 1440 | 4.7 | 1892 → 1870 (-22) | 0 | - | - | 5/5 | card grids: www has two column-view spacings (wrapper .section: 32/32 px, first card 72 px under the H1 at 390; plain: 20/10 px, about 60 px) that our documents don't tell apart; one theme rule can't fit both (tried, reverted); proposal: the SWISS importer marks the grid, then theme rules |
| /ch/de/discover/overview-inspiration | swiss | 1440 | 4.3 | 1465 → 1442 (-23) | -1 | - | - | 4/4 | card grids: www has two column-view spacings (wrapper .section: 32/32 px, first card 72 px under the H1 at 390; plain: 20/10 px, about 60 px) that our documents don't tell apart; one theme rule can't fit both (tried, reverted); proposal: the SWISS importer marks the grid, then theme rules |
| /ch/en/discover/overview-inspiration | swiss | 1440 | 4 | 1394 → 1397 (+3) | -1 | - | - | 4/4 | card grids: www has two column-view spacings (wrapper .section: 32/32 px, first card 72 px under the H1 at 390; plain: 20/10 px, about 60 px) that our documents don't tell apart; one theme rule can't fit both (tried, reverted); proposal: the SWISS importer marks the grid, then theme rules |
| /ch/en/fly/on-board | swiss | 1440 | 3.7 | 1399 → 1402 (+3) | -1 | - | - | 3/3 | card grids: www has two column-view spacings (wrapper .section: 32/32 px, first card 72 px under the H1 at 390; plain: 20/10 px, about 60 px) that our documents don't tell apart; one theme rule can't fit both (tried, reverted); proposal: the SWISS importer marks the grid, then theme rules |
| /ch/de/fly/on-board | swiss | 1440 | 3.7 | 1448 → 1424 (-24) | -1 | - | - | 3/3 | card grids: www has two column-view spacings (wrapper .section: 32/32 px, first card 72 px under the H1 at 390; plain: 20/10 px, about 60 px) that our documents don't tell apart; one theme rule can't fit both (tried, reverted); proposal: the SWISS importer marks the grid, then theme rules |
