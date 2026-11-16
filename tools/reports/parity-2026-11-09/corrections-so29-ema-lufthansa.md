# Corrections, standing order 29 (ema-lufthansa, 2026-11-16)

Order 28 found that my scratch measuring script, host-eval.mjs, refused airline hosts only with Chromium's
--host-resolver-rules. This machine reaches the web through an HTTPS proxy, which resolves names itself, so the rule
never applied, and a measured page could load whatever it asks from an airline host. This file lists every figure in
my reports and delta lists of orders 24 to 28 that came from that script, measured again with the hosts refused per
request. The corrected figure stands next to the old one.

## 1. The scratch scripts

Every scratch script that starts a browser was found (105 of them; recordings and downloads left out of the search).
Each one now refuses airline hosts per request and counts what it refused, or it is gone:

- **Patched (5):**
  - .scratch/offline/tools/host-eval.mjs: blockAirlines(context), a route abort per request, counted per load (REFUSED_LOG);
  - .scratch/offline/b585/rec-eval.mjs (the recording renderer): only 127.0.0.1 gets through, everything else is aborted;
  - .scratch/offline/tools/crop.mjs and .scratch/offline/b607/crop.mjs: only data: URLs, the rest aborted and counted;
  - .scratch/offline/b608/arial-batch.mjs (order 24's Liberation census): blockAirlines per context, the count in its result.
- **Deleted (100):** every other script that launched a browser, plus the folders .scratch/offline/b608/wt and
  .scratch/offline/b530/clean. The other scratch scripts left (e.g. pix.mjs reads PNGs with sharp) launch no browser,
  and none was run tonight except the measuring tools named here.
- **New tonight:** .scratch/offline/b613/what-refused.mjs lists what a page asks from airline hosts, all of it refused.
- **Not affected, never were:** the repo's tools/parity/capture.js (ownHostFilter), which order 27's sweep, order 28's
  phone sweep and tonight's ITA and TAP sweeps used.
- After the cleanup, a search for chromium, playwright or puppeteer in .scratch finds only these five, the new lister and
  three vendored libraries (axe, the help center's bundle), which don't launch anything.

## 2. Which figures came from the old script

| order | where | what |
|---|---|---|
| 24 | fonts-so24-liberation.txt; finish-ita.txt (the 8 phone rows) | the Liberation census over every finish list's rows (arial-batch.mjs) |
| 24 | delta-so24-brussels-checked-baggage-narrow-titles.txt; finish-brussels.txt | the -011 pages re-measured; narrow-titles gated (before / with) |
| 24 | brussels-so24-accordion-titles.txt | the 39 phone pages with the all-accordions draft |
| 24 | finish-b2b.txt; the report | wifi's scoped rule (4469 / 6495; celebrating-shared-stories and our-european-fares unchanged) |
| 25 | finish-b2b.txt | the 15 HOLD rows re-measured (intermediaries 9101) |
| 25 | finish-brussels.txt; brussels-so25-button-wrap.txt; delta-so25-brussels-spacers.txt; delta-so25-brussels-refund-spacer.txt | the 52 HOLD rows re-measured, the button-wrap gate, the spacer rows |
| 26 | delta-so26-brussels-lost-content.txt; delta-so26-discover-lost-content.txt; the report | the drafts' heights; B2B's button wrap 9101 -> 9125 |
| 26 | cut-labels-so26.txt | the cut-label census (b610/cut.js on every recorded page, both widths) |
| 27 | finish-ita.txt; finish-discover.txt | the ita-parity-009 and discover-parity-004 figures |
| 28 | delta-so28-b2b-swiss-senses-seatmap-link.txt; delta-so28-swiss-help-center-pictures.txt | measured after the 22:40 UTC fix (request-level refusal): measured again anyway |

Not from it: order 27's sweep (sweep-so27-brands.md) and order 28's phone sweep (capture-phone-window-so28.txt) used
capture.js. Order 26's lost-content census read our served pages' documents with curl from our hosts only (no
browser, nothing the pages ask from other hosts).

## 3. Method of the new measurement

- **Script and settings:** host-eval.mjs as patched, between about 02:10 and 03:50 UTC on 2026-11-16, on main as
  deployed (NO_LOCAL_CSS), the recordings' windows (1440 x 900, 390 x 844), every airline-host request refused and
  counted.
- **ITA's phone rows** were taken with the Liberation face, as they were then (arial-batch.mjs, patched).
- **"Before" figures** of rows that are live now were measured on main's stylesheet with the rule taken out:
  narrow-titles and the phone button wrap (CSS_ROOT).
- **Scope:** 412 page-widths in all, each list's own, plus the finish lists' rows. The figures are in
  .scratch/offline/b613, outside git.

**What the pages ask from airline hosts (now refused, then loaded through the proxy):**
- www.lufthansa.com's label, catalogue and destination-finder APIs: the fare teasers, the flight search, the
  check-in-times component and the finder, on the homepages, the offers pages and a few info pages;
- the Travel ID APIs: help-center topics, login status and the questionnaire;
- Brussels' chat script (www.brusselsairlines.com/digitalassistant);
- the help centers' stage and FAQs pictures: SWISS, ITA and Brussels write them from their www.

The equal figures below show that the API calls gave our pages nothing either way: they answer www's origin only, so
those parts drew in their no-answer state then as now. The pictures and the chat script are not such calls, and they
did load. Only the pictures change a height.

**Requests per list (page-widths, how many ask an airline host today, the requests refused):**

| list | page-widths | asking | refused | hosts |
|---|---|---|---|---|
| the finish lists (every row: order 24's census and the re-measures of orders 24, 25 and 27) | 244 | 111 | 1,346 | www.lufthansa.com 1,237, api.travelid.austrian.com 72, www.brusselsairlines.com 27, www.austrian.com 5, api.travelid.ita-airways.com 3, www.ita-airways.com 2 |
| fonts-so24-liberation.txt | 16 | 5 | 17 | api.travelid.austrian.com 12, api.travelid.ita-airways.com 3, www.ita-airways.com 2 |
| delta-so24-brussels-checked-baggage-narrow-titles.txt | 10 | 10 | 10 | www.brusselsairlines.com 10 (the chat script) |
| brussels-so24-accordion-titles.txt | 39 | 16 | 38 | www.lufthansa.com 18, www.brusselsairlines.com 12, api.travelid.brusselsairlines.com 6, brusselsairlines.com 2 (contact's stage picture) |
| delta-so25-brussels-spacers.txt | 6 | 0 | 0 | |
| delta-so25-brussels-refund-spacer.txt | 2 | 0 | 0 | |
| brussels-so25-button-wrap.txt | 5 | 4 | 16 | www.lufthansa.com 14, www.brusselsairlines.com 2 |
| delta-so26-brussels-lost-content.txt | 2 | 0 | 0 | |
| delta-so26-discover-lost-content.txt | 4 | 0 | 0 | |
| delta-so28-b2b-swiss-senses-seatmap-link.txt | 2 | 0 | 0 | |
| wifi, celebrating-shared-stories, our-european-fares (order 24 item 3) | 8 | 0 | 0 | |

## 4. Result

- **One figure was wrong, and the gate of one READY row no longer holds:** ITA /it/en/help-and-contact at 390.
  - Order 24's Liberation census had it +2.75 -> +0.00 % (3136 -> 3052), and finish-ita.txt made it READY.
  - Both figures included www's two help-center pictures, main.png and faq.png from www.ita-airways.com.
  - With them refused: 2993 with the system's fonts and 2909 with the face, against www's 3052 (-4.69 %).
  - Its 1440 width, which every order since 15 counted within 2 %, is 2096 against 2254 (-7.01 %).
  - **The fix, the same as SWISS's of order 28:** the block points those two pictures at copies in lh-ita's DA, but only
    a copy that loads (blocks/micro-frontend, the ITA design's checkedPictures; test
    micro-frontend-ita-pictures-so29). Until then the page draws as today: as served and with the change, it/en
    2096 / 2993 and it/it 2194 / 3066 measure the same.
  - **The helper's list:** delta-so29-ita-help-center-pictures.txt, HOLD until the two files are on the drop. They are
    requested in capture-requests-ema-lufthansa.txt; its header names the backup.
  - Both finish-ita.txt rows are HOLD now.
- **Every other figure of orders 24 to 28 stands.** On the pages that ask an airline host, the corrected figure equals
  the old one wherever nothing has changed since:
  - narrow-titles' before / with: 4662 / 4758, 4938 / 4986, 4820 / 4844, 4868 / 4892, 4765 / 4861, the same to the pixel;
  - the button wrap's with-figures, e.g. be/fr checked-baggage 5004 and cancel-and-refund 2359;
  - the Brussels HOLD rows (offers 4326, the homepages, check-in-times, service-charges, student-fares);
  - ITA alghero 1440 (2321);
  - SWISS's help pages (1988 without the copies, as order 28 measured; 2116 / 2346 with them, now that they are live).
  - Where a figure differs, it is because of code or rows that went live after it was taken (the tables say which). None
    of those pages makes an airline-host request that changes its height.
- **Outside orders 24 to 28, seen in passing:**
  - Brussels /ke/en/homepage at 1440 is READY in finish-brussels.txt with order 19's figure. That figure was taken with
    the finder's answers replayed (4038 with P57). As served tonight, in the no-answer state, it measures 4304 (+4.72 %).
    This isn't the leak (the finder's API refuses our hosts either way); its READY gate was a with-answers gate.
    Flagged for a look against the order-19 list (brussels-so19-homepages.txt), not changed tonight.
  - The finish lists' headers (orders 14 and 15) said "airline hosts refused". Each now carries a correction line that
    says what the re-measure found.

## 5. The "refused" and "no request to an airline host" lines, corrected

- **ema-lufthansa.md, orders 24, 25, 26 and 27:** each "Hosts" line now says that the order's host-eval loads could
  reach airline hosts through the proxy, and points here for the counts.
- **finish-b2b, -brussels, -discover, -ita, -swiss, -tap.txt:** a correction line at the end of each header.
- **delta-so28-b2b-swiss-senses-seatmap-link.txt and delta-so28-swiss-help-center-pictures.txt** say "airline hosts
  refused (at the request level)". They were measured after the fix, and tonight's counts confirm it (0 and 3 to 5
  requests, all refused). Unchanged.
- **sweep-so27-brands.md** says "no request to www" (capture.js): right. Unchanged.

## 6. The finish-list rows orders 24 to 28 measured: old figure and corrected figure

The old figure is as the list had it before tonight. The corrected figure is measured tonight with airline hosts
refused per request. "Asked" counts the requests to airline hosts on that load, all of them refused.

| brand | status | page | width | www px | old (orders 24 to 28) | corrected | asked an airline host today | old vs corrected |
|---|---|---|---|---|---|---|---|---|
| Group for Business | HOLD | /de/en/program/experts/on-board/meals-on-board | 390 | 1405 | 1329 (-5.41 %) | 1329 (-5.41 %) | 0 | same |
| Group for Business | HOLD | /de/en/allegris/corporates-start-of-booking | 390 | 7326 | 7489 (+2.22 %) | 7489 (+2.22 %) | 0 | same |
| Group for Business | HOLD | /de/en/program/experts/on-board/entertainment-on-board | 1440 | 1932 | 1838 (-4.87 %) | 1838 (-4.87 %) | 0 | same |
| Group for Business | READY | /de/en/allegris/intermediaries-start-of-booking | 390 | 9053 | 9101 (+0.53 %) | 9125 (+0.80 %) | 0 | B2B's phone button wrap since order 26, as its gate's figure |
| Group for Business | HOLD | /de/en/program/experts/route-network/lufthansa/kuala-lumpur | 1440 | 5179 | 4774 (-7.82 %) | 4774 (-7.82 %) | 0 | same |
| Group for Business | HOLD | /de/de/about-us/lhg-history | 1440 | 1748 | 1676 (-4.12 %) | 1676 (-4.12 %) | 0 | same |
| Group for Business | HOLD | /xx/en/program/experts/on-board/meals-on-board | 390 | 1405 | 1329 (-5.41 %) | 1329 (-5.41 %) | 0 | same |
| Group for Business | HOLD | /ch/en/program/experts/on-board/meals-on-board | 390 | 1405 | 1329 (-5.41 %) | 1329 (-5.41 %) | 0 | same |
| Group for Business | READY | /de/en/travel-solutions/lufthansa-group-wifi | 1440 | 4476 | 4469 (-0.16 %) | 4469 (-0.16 %) | 0 | same |
| Group for Business | HOLD | /de/en/news/lhg-ita-airways | 1440 | 4432 | 4600 (+3.79 %) | 4600 (+3.79 %) | 0 | same |
| Group for Business | HOLD | /de/en/news/celebrating-shared-stories/sap | 1440 | 6211 | 6420 (+3.36 %) | 6420 (+3.36 %) | 0 | same |
| Group for Business | HOLD | /de/en/about-us/lhg-history | 1440 | 1690 | 1642 (-2.84 %) | 1642 (-2.84 %) | 0 | same |
| Group for Business | READY | /gb/en/program/experts/programs-and-groups | 390 | 7043 | 6865 (-2.53 %) | 6961 (-1.16 %) | 0 | order 28's delta row, live (6961, as gated) |
| Group for Business | HOLD | /de/de/program/partner-plus-benefit | 390 | 5361 | 5230 (-2.44 %) | 5230 (-2.44 %) | 0 | same |
| Group for Business | HOLD | /de/en/program/experts/route-network/lufthansa/kuala-lumpur | 390 | 5588 | 5724 (+2.43 %) | 5724 (+2.43 %) | 0 | same |
| Group for Business | HOLD | /de/en/allegris/video-gallery | 1440 | 3477 | 3549 (+2.07 %) | 3549 (+2.07 %) | 0 | same |
| Group for Business | HOLD | /de/de/about-us | 390 | 3497 | 3425 (-2.06 %) | 3425 (-2.06 %) | 0 | same |
| Brussels | HOLD | /be/en/local-page/offers | 1440 | 4630 | 4326 (-6.57 %) | 4326 (-6.57 %) | 26 (www.lufthansa.com 26) | same |
| Brussels | READY | /be/en/legal-notices | 1440 | 1428 | 1330 (-6.86 %) | 1428 (+0.00 %) | 0 | its order-24/25 delta row, live: equal to the list's with-figure (the old figure is the list's before) |
| Brussels | HOLD | /fr/fr/homepage | 390 | 5464 | 5241 (-4.08 %) | 5241 (-4.08 %) | 27 (www.lufthansa.com 26, www.brusselsairlines.com 1) | same |
| Brussels | HOLD | /be/fr/my-bookings/cancel-and-refund-requests | 1440 | 1758 | 1684 (-4.21 %) | 1684 (-4.21 %) | 1 (www.brusselsairlines.com 1) | same |
| Brussels | HOLD | /ke/en/homepage | 390 | 5227 | 5028 (-3.81 %) | 5028 (-3.81 %) | 24 (www.lufthansa.com 23, www.brusselsairlines.com 1) | same |
| Brussels | HOLD | /be/en/contact/service-charges | 1440 | 1677 | 1626 (-3.04 %) | 1626 (-3.04 %) | 1 (www.brusselsairlines.com 1) | same |
| Brussels | HOLD | /be/nl/contact/service-charges | 1440 | 1715 | 1663 (-3.03 %) | 1663 (-3.03 %) | 1 (www.brusselsairlines.com 1) | same |
| Brussels | HOLD | /be/fr/my-bookings/cancel-and-refund-requests | 390 | 2408 | 2341 (-2.78 %) | 2359 (-2.03 %) | 1 (www.brusselsairlines.com 1) | the phone button wrap since order 26 (0bbff184), as its gate's with-figure |
| Brussels | HOLD | /be/en/my-bookings/cancel-and-refund-requests | 1440 | 1642 | 1594 (-2.92 %) | 1594 (-2.92 %) | 1 (www.brusselsairlines.com 1) | same |
| Brussels | READY | /be/en/farealert/unsubscribe-failure | 1440 | 940 | 907 (-3.51 %) | 939 (-0.11 %) | 0 | its order-24/25 delta row, live: equal to the list's with-figure (the old figure is the list's before) |
| Brussels | READY | /de/de/extra-services/baggage/checked-baggage | 390 | 4969 | 4868 (-2.03 %) | 4892 (-1.55 %) | 1 (www.brusselsairlines.com 1) | its order-24/25 delta row, live: equal to the list's with-figure (the old figure is the list's before) |
| Brussels | READY | /be/en/legal-notices/refund-for-cancelled-flights | 1440 | 1579 | 1546 (-2.09 %) | 1577 (-0.13 %) | 0 | its order-24/25 delta row, live: equal to the list's with-figure (the old figure is the list's before) |
| Brussels | READY | /be/fr/travel-classes | 1440 | 1336 | 1303 (-2.47 %) | 1336 (+0.00 %) | 0 | its order-24/25 delta row, live: equal to the list's with-figure (the old figure is the list's before) |
| Brussels | HOLD | /be/fr/extra-services/baggage/checked-baggage | 1440 | 4016 | 3918 (-2.44 %) | 3918 (-2.44 %) | 1 (www.brusselsairlines.com 1) | same |
| Brussels | READY | /be/en/farealert/unsubscribe-failure | 390 | 1358 | 1328 (-2.21 %) | 1357 (-0.07 %) | 0 | its order-24/25 delta row, live: equal to the list's with-figure (the old figure is the list's before) |
| Brussels | READY | /it/it/extra-services/baggage/checked-baggage | 390 | 4914 | 4765 (-3.03 %) | 4861 (-1.08 %) | 1 (www.brusselsairlines.com 1) | its order-24/25 delta row, live: equal to the list's with-figure (the old figure is the list's before) |
| Brussels | READY | /be/en/legal-notices | 390 | 1867 | 1827 (-2.14 %) | 1867 (+0.00 %) | 0 | its order-24/25 delta row, live: equal to the list's with-figure (the old figure is the list's before) |
| Brussels | HOLD | /be/en/travel-classes/economy | 390 | 5073 | 4966 (-2.11 %) | 4966 (-2.11 %) | 0 | same |
| Brussels | HOLD | /be/en/local-page/student-fares | 1440 | 5153 | 5259 (+2.06 %) | 5259 (+2.06 %) | 8 (www.lufthansa.com 8) | same |
| Brussels | HOLD | /be/fr/extra-services/baggage/checked-baggage | 390 | 5131 | 4986 (-2.83 %) | 5004 (-2.48 %) | 1 (www.brusselsairlines.com 1) | narrow-titles (order 24) and the phone button wrap (order 26), both live: equal to brussels-so25-button-wrap.txt's with-figure |
| Discover | READY | /de/en/book/baggage/excess-baggage | 1440 | 2701 | 2715 (+0.52 %) | 2715 (+0.52 %) | 0 | same |
| Discover | READY | /de/en/discover/travel-classes/business-class | 1440 | 4233 | 4217 (-0.38 %) | 4217 (-0.38 %) | 0 | same |
| ITA | READY | /it/en/book-and-prepare/other-requests/families-and-children/baggage-and-strollers | 390 | 7882 | 7809 (-0.93 %) | 7851 (-0.39 %) with the face | 0 | today's ITA code (the footer fixes and the hidden-separator rule since order 24); no airline request on this page, so not the leak |
| ITA | READY | /it/en/world-of-ita-airways/discover-ita-airways/fleet/long-haul | 1440 | 3526 | 3508 (-0.51 %) | 3508 (-0.51 %) | 0 | same |
| ITA | READY | /it/en/help-and-contact | 390 | 3052 | 3052 (+0.00 %) | 2909 (-4.69 %) with the face | 5 (api.travelid.ita-airways.com 3, www.ita-airways.com 2) | THE LEAK: the old figure had www's two help-center pictures (main.png, faq.png from www.ita-airways.com); refused now |
| ITA | READY | /it/en/support/utilities/invoicing | 390 | 3608 | 3612 (+0.11 %) | 3630 (+0.61 %) with the face | 0 | today's ITA code (the footer fixes and the hidden-separator rule since order 24); no airline request on this page, so not the leak |
| ITA | READY | /it/en/book-and-prepare/travel-information/baggage/electronic-devices-and-batteries | 390 | 8029 | 7914 (-1.43 %) | 7987 (-0.52 %) with the face | 0 | today's ITA code (the footer fixes and the hidden-separator rule since order 24); no airline request on this page, so not the leak |
| ITA | READY | /it/en/book-and-prepare/travel-information/entry-regulations/entry-regulations-schengen/entry-exit-system | 390 | 9309 | 9073 (-2.54 %) | 9225 (-0.90 %) with the face | 0 | today's ITA code (the footer fixes and the hidden-separator rule since order 24); no airline request on this page, so not the leak |
| ITA | READY | /it/en/corporate-b2b | 1440 | 1492 | 1493 (+0.07 %) | 1493 (+0.07 %) | 0 | same |
| ITA | READY | /it/en/book-and-prepare/offers/territorial-continuity/alghero | 1440 | 2328 | 2321 (-0.30 %) | 2321 (-0.30 %) | 8 (www.lufthansa.com 8) | same |
| ITA | READY | /it/en/world-of-ita-airways/discover-ita-airways/fleet/long-haul | 390 | 2809 | 2808 (-0.04 %) | 2808 (-0.04 %) with the face | 0 | same |
| ITA | READY | /it/en/world-of-ita-airways/discover-ita-airways/fleet/short-haul | 390 | 2955 | 2930 (-0.85 %) | 2972 (+0.58 %) with the face | 0 | today's ITA code (the footer fixes and the hidden-separator rule since order 24); no airline request on this page, so not the leak |
| ITA | READY | /it/en/world-of-ita-airways/discover-ita-airways/ita-airways-app | 390 | 5197 | 5230 (+0.63 %) | 5224 (+0.52 %) with the face | 0 | today's ITA code (the footer fixes and the hidden-separator rule since order 24); no airline request on this page, so not the leak |

## 7. The lists of orders 24 to 28: old figure and corrected figure

The corrected figures are 1440 / 390 unless a width is given. "Asked" is the number of requests to airline hosts on the
load, all of them refused.

**fonts-so24-liberation.txt** (390; system fonts -> Liberation face):

| page | www | old | corrected | asked | note |
|---|---|---|---|---|---|
| ITA baggage-and-strollers | 7882 | 7893 -> 7809 | 7935 -> 7851 | 0 | today's ITA code (+42 px); not the leak |
| ITA help-and-contact | 3052 | 3136 -> 3052 | 2993 -> 2909 | 5 | **the leak**: www's help-center pictures had loaded; READY no longer holds (see 4) |
| ITA invoicing | 3608 | 3696 -> 3612 | 3714 -> 3630 | 0 | today's ITA code; +0.61 % |
| ITA electronic-devices-and-batteries | 8029 | 7998 -> 7914 | 8071 -> 7987 | 0 | today's ITA code; -0.52 % |
| ITA entry-exit-system | 9309 | 9157 -> 9073 | 9309 -> 9225 | 0 | today's ITA code; -0.90 % |
| ITA fleet/long-haul | 2809 | 2850 -> 2766 | 2892 -> 2808 | 0 | today's ITA code; -0.04 % |
| ITA fleet/short-haul | 2955 | 3014 -> 2930 | 3056 -> 2972 | 0 | today's ITA code; +0.58 % |
| ITA ita-airways-app | 5197 | 5314 -> 5230 | 5308 -> 5224 | 0 | today's ITA code; +0.52 % |
| Austrian gr/el baggage 1440 / 390 | 4441 / 6248 | 4553 -> 4424 / 6421 -> 6215 | the same | 0 | |
| Austrian gr/el contact 1440 / 390 | 2459 / 3172 | 2540 -> 2470 / 3245 -> 3189 | the same | 3 / 3 | Travel ID only |
| Austrian ru/ru baggage 1440 / 390 | 4422 / 6200 | 4577 -> 4429 / 6435 -> 6160 | the same | 0 | |
| Austrian ru/ru contact 1440 / 390 | 2508 / 3232 | 2540 -> 2519 / 3300 -> 3223 | the same | 3 / 3 | Travel ID only |

**delta-so24-brussels-checked-baggage-narrow-titles.txt** (READY, live). The before was re-measured on main's stylesheet
without narrow-titles and without order 26's button wrap; the with on main without the button wrap:

| page | old ours / with the delta | corrected ours / with | asked |
|---|---|---|---|
| be/en | 3915 / 4662 -> 3915 / 4758 | 3915 / 4662 -> 3915 / 4758 | 1 (the chat script) |
| be/fr | 3918 / 4938 -> 3918 / 4986 | 3918 / 4938 -> 3918 / 4986 (5004 with the button wrap) | 1 |
| be/nl | 3928 / 4820 -> 3928 / 4844 | 3928 / 4820 -> 3928 / 4844 | 1 |
| de/de | 3928 / 4868 -> 3928 / 4892 | 3928 / 4868 -> 3928 / 4892 | 1 |
| it/it | 3952 / 4765 -> 3952 / 4861 | 3952 / 4765 -> 3952 / 4861 | 1 |

**brussels-so24-accordion-titles.txt** (39 phone pages, HOLD, the rule never shipped):
- 32 pages measure as listed. 16 of the 39 ask an airline host: www.lufthansa.com 18 requests, www.brusselsairlines.com
  12, Travel ID 6, the contact stage picture 2.
- The other 7 are taller by exactly what has gone live since:
  - narrow-titles on the five checked-baggage pages (the list above);
  - the phone button wrap on be/fr upgrades (7221 -> 7239) and be/fr cancel-and-refund (2341 -> 2359).
- The draft's two columns (padding-right 54 / 69) are not re-measured. The rule stays HOLD, and the old figures of those
  pages don't move with the fault.

**brussels-so25-button-wrap.txt** (390, READY, live since 0bbff184). The before was re-measured on main's stylesheet
without the rule:

| page | old before -> with | corrected before -> with | asked |
|---|---|---|---|
| be/en manchester-football-trip | 6609 -> 6627 | 6609 -> 6627 | 7 (www.lufthansa.com) |
| be/fr vibrant-senegal | 16481 -> 16499 | 16481 -> 16499 | 7 |
| be/fr checked-baggage | 4986 -> 5004 | 4986 -> 5004 | 1 |
| be/fr upgrades | 7221 -> 7239 | 7221 -> 7239 | 0 |
| be/fr cancel-and-refund-requests | 2341 -> 2359 | 2341 -> 2359 | 1 |

**delta-so25-brussels-spacers.txt and delta-so25-brussels-refund-spacer.txt** (READY, live). None of these pages asks an
airline host, so the fault could not touch their figures. The with-figures as served tonight:
- farealert/unsubscribe-failure 939 / 1357;
- legal-notices 1428 / 1867;
- be/fr travel-classes 1336 / 2427;
- refund-for-cancelled-flights 1577 / 2368.

All equal to the lists.

**delta-so26-brussels-lost-content.txt, delta-so26-discover-lost-content.txt** (READY, live; no airline request):
- travel-id 2291 / 3326;
- Discover customer-service de/en 4414 / 6297 and de/de 4352 / 6229.

All equal to the drafts' figures.

**Order 26's B2B button wrap** (Allegris intermediaries 390, 9101 -> 9125): 9125 as served, no airline request.

**cut-labels-so26.txt:** the census, re-run tonight with the patched script, is in section 8.

**Order 24 item 3, wifi** (no airline request): 4469 / 6495, as reported. celebrating-shared-stories de/de 7600 /
11858, de/en 8208 / 12196 and our-european-fares de/de 9506 / 13355 are unchanged by the rule (it doesn't reach them).

**Order 27, finish-ita.txt and finish-discover.txt** (no picture or label request changes them):

| page | old | corrected | asked |
|---|---|---|---|
| ITA fleet/long-haul | 3508 / 2808 (face) | 3508 / 2808 (face; 2892 system) | 0 |
| ITA alghero | 2321 / 3507 (face) | 2321 / 3507 (face) | 8 at 1440 (www.lufthansa.com labels) |
| ITA corporate-b2b | 1493 / 2545 (face) | 1493 / 2545 (face) | 0 |
| Discover excess-baggage | 2715 / 2472 | 2715 / 2472 | 0 |
| Discover business-class | 4217 / 3218 | 4217 / 3218 | 0 |

**Order 28** (measured after the fix; again tonight, the same): seat-map 6291 / 7193 (0); SWISS contact-us en 1988 /
2194 without the copies (order 28). Tonight, with the copies live, it is 2116 / 2346, the gate's with-figures (5
refused: Travel ID 3 and the app's own first requests for swiss.com's pictures 2).

## 8. cut-labels-so26.txt, the census re-run

Order 26's probe (b610/cut.js) ran again tonight with the patched script, on the same pages and widths, plus
Brussels at 390, which order 26 had taken from order 25's button census.

| brand, width | pages | cut elements, order 26 | tonight |
|---|---|---|---|
| Group for Business 1440 | 80 | 0 | 0 |
| Group for Business 390 | 80 | 1 | 0: the Allegris intermediaries label wraps now (B2B's phone rule, order 26) |
| Brussels 1440 | 101 | 11 | 11, the same visually hidden labels |
| Brussels 390 | 101 | (order 25: buttons only) | 12 |
| Discover 1440 / 390 | 25 / 25 | 4 / 4 | 4 / 4, the same |
| SWISS 1440 / 390 | 28 / 28 | 2 / 2 | 2 / 2, the same |

Brussels at 390 is new coverage:
- 11 of its 12 hits are the visually hidden date labels of the flight search and the forms (1 px, clip inset 50 %), as
  at 1440.
- The 12th is dsar-start's "Booking reference/ Miles & More number" placeholder label (282 of 300 px). www cuts it too:
  its recording shows "Miles & More numb", clipped without the ellipsis. That is www's state, nothing to fix.

The census's result stands: no visible cut label left that www doesn't cut as well.
