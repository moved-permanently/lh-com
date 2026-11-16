# Regression check, standing order 35 (ema-lufthansa, 2026-11-16)

The 89 page-widths of sweep-so30-brands.md, captured again on 2026-11-16 at about 16:00 to 16:15 UTC on their brand hosts with main as deployed (capture.js, airline hosts refused per request), against the same recordings. Today's code includes the Brussels closing-sidebar rule (42 px above the footer on phones), the B2B cover-16x9 option, and lufthansa.com's rules. Each page-width is compared with its last figure on the same recording: order 30's sweep, or its later re-capture in orders 31 to 34. "Further" = |now| - |last|, in points.

Result:
- **No page-width is more than 0.5 points further from www than its last figure.**
- **Three captures were glitches** and were taken again: SWISS /ch/en/help-center 390 drew 844 px, the window height, and Group for Business partner-plus-benefit 390 and Brussels be/en check-in-options-and-info 390 returned nothing. Captured again, all three measure as their last figures (+0.86 %, -2.44 %, -4.66 %).
- **Five page-widths moved closer:**
  - Brussels contact-form-error 390: +3.70 -> +0.32 % (the closing-sidebar rule);
  - Group for Business entertainment-on-board 1440: -4.87 -> -0.52 % (the cover-16x9 option on the eJournals picture, rows-for-ema-test.md row 12);
  - de/de lhg-history 1440: -4.12 -> -0.80 %;
  - connecting-africa 1440: -2.54 -> +0.00 % (orders 33 and 34's rows);
  - student-fares 1440: +2.06 -> +1.34 % (order 34's row).
- **No fix or reverse is needed.**

| brand | page | width | recording | www px | last px | last vs www | from | now px | now vs www | further (points) |
|---|---|---|---|---|---|---|---|---|---|---|
| Group for Business | /de/en/program/experts/on-board/entertainment-on-board | 1440 | b2b-parity-007 | 1932 | 1838 | -4.87 % | order 31 | 1922 | -0.52 % | -4.35 |
| Brussels | /am/en/non-encrypt-mail/contact-form-error | 390 | brussels-parity-004 | 1244 | 1290 | +3.70 % | order 32 | 1248 | +0.32 % | -3.38 |
| Group for Business | /de/de/about-us/lhg-history | 1440 | b2b-parity-006 | 1748 | 1676 | -4.12 % | order 31 | 1734 | -0.80 % | -3.32 |
| Brussels | /be/en/book-a-flight/connecting-africa | 1440 | brussels-parity-001 | 3980 | 3879 | -2.54 % | order 33 | 3980 | +0.00 % | -2.54 |
| Brussels | /be/en/local-page/student-fares | 1440 | brussels-parity-004 | 5153 | 5259 | +2.06 % | order 34 | 5222 | +1.34 % | -0.72 |
| Group for Business | /ch/en/program/experts/on-board/meals-on-board | 390 | b2b-parity-010 | 1405 | 1329 | -5.41 % | order 31 | 1329 | -5.41 % | +0.00 |
| Group for Business | /de/de/about-us | 390 | b2b-parity-001 | 3497 | 3425 | -2.06 % | order 34 | 3425 | -2.06 % | +0.00 |
| Group for Business | /de/de/lhg4b-search/lhg4b-search-prelogin | 390 | b2b-parity-001 | 844 | 844 | +0.00 % | order 34 | 844 | +0.00 % | +0.00 |
| Group for Business | /de/de/travel-solutions/swiss-senses/intermediaries-start-of-booking | 390 | b2b-parity-005 | 7117 | 7193 | +1.07 % | order 34 | 7193 | +1.07 % | +0.00 |
| Group for Business | /de/en/about-us/lhg-history | 1440 | b2b-parity-003 | 1690 | 1642 | -2.84 % | order 32 | 1642 | -2.84 % | +0.00 |
| Group for Business | /de/en/allegris/corporates-start-of-booking | 390 | b2b-parity-012 | 7326 | 7489 | +2.22 % | order 34 | 7489 | +2.22 % | +0.00 |
| Group for Business | /de/en/allegris/video-gallery | 1440 | b2b-parity-006 | 3477 | 3549 | +2.07 % | order 34 | 3549 | +2.07 % | +0.00 |
| Group for Business | /de/en/lhg4b-search/lhg4b-search-prelogin | 390 | b2b-parity-001 | 844 | 844 | +0.00 % | order 34 | 844 | +0.00 % | +0.00 |
| Group for Business | /de/en/news/celebrating-shared-stories/sap | 1440 | b2b-parity-007 | 6211 | 6420 | +3.36 % | order 32 | 6420 | +3.36 % | +0.00 |
| Group for Business | /de/en/news/lhg-ita-airways | 1440 | b2b-parity-003 | 4432 | 4600 | +3.79 % | order 32 | 4600 | +3.79 % | +0.00 |
| Group for Business | /de/en/program/experts/on-board/meals-on-board | 390 | b2b-parity-010 | 1405 | 1329 | -5.41 % | order 31 | 1329 | -5.41 % | +0.00 |
| Group for Business | /de/en/program/experts/route-network/lufthansa/kuala-lumpur | 1440 | b2b-parity-007 | 5179 | 4774 | -7.82 % | order 31 | 4774 | -7.82 % | +0.00 |
| Group for Business | /de/en/program/experts/route-network/lufthansa/kuala-lumpur | 390 | b2b-parity-013 | 5588 | 5724 | +2.43 % | order 33 | 5724 | +2.43 % | +0.00 |
| Group for Business | /xx/en/program/experts/on-board/meals-on-board | 390 | b2b-parity-005 | 1405 | 1329 | -5.41 % | order 31 | 1329 | -5.41 % | +0.00 |
| Brussels | /be/en/articles/bike-the-city | 1440 | brussels-parity-010 | 4082 | 3989 | -2.28 % | order 33 | 3989 | -2.28 % | +0.00 |
| Brussels | /be/en/book-a-flight | 1440 | brussels-parity-001 | 1418 | 1476 | +4.09 % | order 31 | 1476 | +4.09 % | +0.00 |
| Brussels | /be/en/check-in-options-and-info/check-in-times | 1440 | brussels-parity-004 | 2601 | 2516 | -3.27 % | order 32 | 2516 | -3.27 % | +0.00 |
| Brussels | /be/en/check-in-options-and-info/check-in-times | 390 | brussels-parity-004 | 4348 | 4108 | -5.52 % | order 31 | 4108 | -5.52 % | +0.00 |
| Brussels | /be/en/contact/service-charges | 1440 | brussels-parity-004 | 1677 | 1626 | -3.04 % | order 32 | 1626 | -3.04 % | +0.00 |
| Brussels | /be/en/extra-services/meals | 390 | brussels-parity-001 | 3391 | 3313 | -2.30 % | order 33 | 3313 | -2.30 % | +0.00 |
| Brussels | /be/en/homepage | 390 | brussels-parity-001 | 5294 | 5094 | -3.78 % | order 32 | 5094 | -3.78 % | +0.00 |
| Brussels | /be/en/jobs/core-values | 390 | brussels-parity-004 | 4532 | 4650 | +2.60 % | order 33 | 4650 | +2.60 % | +0.00 |
| Brussels | /be/en/legal-notices/short-notice-eu-us | 1440 | brussels-parity-007 | 1956 | 1908 | -2.45 % | order 33 | 1908 | -2.45 % | +0.00 |
| Brussels | /be/en/legal-notices/us-traveling-with-disabilities | 1440 | brussels-parity-007 | 1317 | 1280 | -2.81 % | order 32 | 1280 | -2.81 % | +0.00 |
| Brussels | /be/en/local-page/chase-the-sun-across-spain | 1440 | brussels-parity-004 | 5225 | 5335 | +2.11 % | order 34 | 5335 | +2.11 % | +0.00 |
| Brussels | /be/en/local-page/chase-the-sun-across-spain | 390 | brussels-parity-004 | 8997 | 9243 | +2.73 % | order 33 | 9243 | +2.73 % | +0.00 |
| Brussels | /be/en/local-page/offers | 1440 | brussels-parity-004 | 4630 | 4326 | -6.57 % | order 31 | 4326 | -6.57 % | +0.00 |
| Brussels | /be/en/local-page/offers | 390 | brussels-parity-004 | 6229 | 5922 | -4.93 % | order 31 | 5922 | -4.93 % | +0.00 |
| Brussels | /be/en/my-bookings | 390 | brussels-parity-001 | 3638 | 3774 | +3.74 % | order 32 | 3774 | +3.74 % | +0.00 |
| Brussels | /be/en/my-bookings/cancel-and-refund-requests | 1440 | brussels-parity-004 | 1642 | 1594 | -2.92 % | order 32 | 1594 | -2.92 % | +0.00 |
| Brussels | /be/en/special-care/families-and-children | 1440 | brussels-parity-001 | 1814 | 1809 | -0.28 % | order 31 | 1809 | -0.28 % | +0.00 |
| Brussels | /be/en/special-care/families-and-children | 390 | brussels-parity-001 | 3640 | 3644 | +0.11 % | order 33 | 3644 | +0.11 % | +0.00 |
| Brussels | /be/en/travel-classes/economy | 390 | brussels-parity-003 | 5073 | 4966 | -2.11 % | order 34 | 4966 | -2.11 % | +0.00 |
| Brussels | /be/fr/book-a-flight | 1440 | brussels-parity-001 | 1493 | 1531 | +2.55 % | order 33 | 1531 | +2.55 % | +0.00 |
| Brussels | /be/fr/book-a-flight/our-payment-methods | 1440 | brussels-parity-004 | 3752 | 2825 | -24.71 % | order 30 | 2825 | -24.71 % | +0.00 |
| Brussels | /be/fr/book-a-flight/our-payment-methods | 390 | brussels-parity-004 | 5390 | 4477 | -16.94 % | order 30 | 4477 | -16.94 % | +0.00 |
| Brussels | /be/fr/check-in-options-and-info | 390 | brussels-parity-001 | 3129 | 3045 | -2.68 % | order 33 | 3045 | -2.68 % | +0.00 |
| Brussels | /be/fr/extra-services/baggage/checked-baggage | 1440 | brussels-parity-005 | 4016 | 3918 | -2.44 % | order 33 | 3918 | -2.44 % | +0.00 |
| Brussels | /be/fr/extra-services/baggage/checked-baggage | 390 | brussels-parity-011 | 5131 | 5004 | -2.48 % | order 33 | 5004 | -2.48 % | +0.00 |
| Brussels | /be/fr/extra-services/meals | 390 | brussels-parity-001 | 3519 | 3361 | -4.49 % | order 31 | 3361 | -4.49 % | +0.00 |
| Brussels | /be/fr/homepage | 390 | brussels-parity-001 | 5482 | 5311 | -3.12 % | order 32 | 5311 | -3.12 % | +0.00 |
| Brussels | /be/fr/my-bookings | 390 | brussels-parity-001 | 3658 | 3774 | +3.17 % | order 32 | 3774 | +3.17 % | +0.00 |
| Brussels | /be/fr/my-bookings/cancel-and-refund-requests | 1440 | brussels-parity-006 | 1758 | 1684 | -4.21 % | order 31 | 1684 | -4.21 % | +0.00 |
| Brussels | /be/fr/my-bookings/cancel-and-refund-requests | 390 | brussels-parity-006 | 2408 | 2359 | -2.03 % | order 34 | 2359 | -2.03 % | +0.00 |
| Brussels | /be/fr/our-company | 1440 | brussels-parity-003 | 6004 | 6269 | +4.41 % | order 31 | 6269 | +4.41 % | +0.00 |
| Brussels | /be/fr/our-company | 390 | brussels-parity-003 | 9803 | 10456 | +6.66 % | order 31 | 10456 | +6.66 % | +0.00 |
| Brussels | /be/fr/special-care/families-and-children | 1440 | brussels-parity-004 | 1892 | 1887 | -0.26 % | order 31 | 1887 | -0.26 % | +0.00 |
| Brussels | /be/fr/special-care/families-and-children | 390 | brussels-parity-001 | 3804 | 3788 | -0.42 % | order 32 | 3788 | -0.42 % | +0.00 |
| Brussels | /be/fr/travel-classes/business | 390 | brussels-parity-003 | 8976 | 8796 | -2.01 % | order 34 | 8796 | -2.01 % | +0.00 |
| Brussels | /be/nl/contact/service-charges | 1440 | brussels-parity-006 | 1715 | 1663 | -3.03 % | order 32 | 1663 | -3.03 % | +0.00 |
| Brussels | /be/nl/special-care/pets | 390 | brussels-parity-006 | 3099 | 3030 | -2.23 % | order 34 | 3030 | -2.23 % | +0.00 |
| Brussels | /de/de/legal-notices/dsar-start | 1440 | brussels-parity-006 | 3272 | 3195 | -2.35 % | order 33 | 3195 | -2.35 % | +0.00 |
| Brussels | /fr/fr/homepage | 390 | brussels-parity-003 | 5464 | 5241 | -4.08 % | order 32 | 5241 | -4.08 % | +0.00 |
| Brussels | /il/en/rebooking-request-birthright | 1440 | brussels-parity-004 | 1899 | 1943 | +2.32 % | order 33 | 1943 | +2.32 % | +0.00 |
| Brussels | /it/it/extra-services/meals | 390 | brussels-parity-006 | 3416 | 3337 | -2.31 % | order 33 | 3337 | -2.31 % | +0.00 |
| Brussels | /it/it/legal-notices/special-assistance-legal-guidelines | 1440 | brussels-parity-007 | 1519 | 1474 | -2.96 % | order 32 | 1474 | -2.96 % | +0.00 |
| Brussels | /it/it/legal-notices/special-assistance-legal-guidelines | 390 | brussels-parity-007 | 2256 | 2204 | -2.30 % | order 33 | 2204 | -2.30 % | +0.00 |
| Brussels | /ke/en/homepage | 1440 | brussels-parity-003 | 4110 | 4304 | +4.72 % | order 31 | 4304 | +4.72 % | +0.00 |
| Brussels | /ke/en/homepage | 390 | brussels-parity-003 | 5227 | 5028 | -3.81 % | order 32 | 5028 | -3.81 % | +0.00 |
| Discover | /de/de/book/flights/offers | 1440 | discover-parity-001 | 8261 | 2432 | -70.56 % | order 30 | 2432 | -70.56 % | +0.00 |
| Discover | /de/de/book/flights/offers | 390 | discover-parity-001 | 14807 | 2251 | -84.80 % | order 30 | 2251 | -84.80 % | +0.00 |
| Discover | /de/de/discover/services-on-board/entertainment | 390 | discover-parity-001 | 5381 | 5528 | +2.73 % | order 33 | 5528 | +2.73 % | +0.00 |
| Discover | /de/en/book/flights/flight-search | 390 | discover-parity-001 | 2210 | 2141 | -3.12 % | order 32 | 2141 | -3.12 % | +0.00 |
| Discover | /de/en/book/flights/offers | 1440 | discover-parity-001 | 8386 | 2494 | -70.26 % | order 30 | 2494 | -70.26 % | +0.00 |
| Discover | /de/en/book/flights/offers | 390 | discover-parity-001 | 14160 | 2371 | -83.26 % | order 30 | 2371 | -83.26 % | +0.00 |
| Discover | /de/en/discover/services-on-board/entertainment | 1440 | discover-parity-001 | 3725 | 3633 | -2.47 % | order 33 | 3633 | -2.47 % | +0.00 |
| Discover | /de/en/travel-inspiration/inspiration/destinations/punta-cana | 390 | discover-parity-001 | 5434 | 5586 | +2.80 % | order 32 | 5586 | +2.80 % | +0.00 |
| SWISS | /ch/de/customer-support/contact-us | 1440 | swiss-parity-001 | 2143 | 2116 | -1.26 % | order 34 | 2116 | -1.26 % | +0.00 |
| SWISS | /ch/de/customer-support/contact-us | 390 | swiss-parity-001 | 2409 | 2429 | +0.83 % | order 34 | 2429 | +0.83 % | +0.00 |
| SWISS | /ch/en/customer-support/contact-us | 1440 | swiss-parity-001 | 2116 | 2116 | +0.00 % | order 34 | 2116 | +0.00 % | +0.00 |
| SWISS | /ch/en/customer-support/contact-us | 390 | swiss-parity-001 | 2326 | 2346 | +0.86 % | order 34 | 2346 | +0.86 % | +0.00 |
| SWISS | /ch/en/help-center | 1440 | swiss-parity-003 | 2116 | 2116 | +0.00 % | order 34 | 2116 | +0.00 % | +0.00 |
| SWISS | /ch/en/help-center | 390 | swiss-parity-003 | 2326 | 2346 | +0.86 % | order 34 | 2346 | +0.86 % | +0.00 |
| SWISS | /ch/en/offers | 1440 | swiss-parity-008 | 51105 | 2311 | -95.48 % | order 30 | 2311 | -95.48 % | +0.00 |
| SWISS | /ch/en/offers | 390 | swiss-parity-008 | 90776 | 1593 | -98.25 % | order 30 | 1593 | -98.25 % | +0.00 |
| SWISS | /magazine/de | 390 | swiss-parity-001 | 10414 | 8967 | -13.89 % | order 30 | 8967 | -13.89 % | +0.00 |
| SWISS | /magazine/de/inside-swiss/behind-the-scenes/a350-special-livery | 1440 | swiss-parity-001 | 6860 | 6619 | -3.51 % | order 32 | 6619 | -3.51 % | +0.00 |
| SWISS | /magazine/de/inside-swiss/behind-the-scenes/a350-special-livery | 390 | swiss-parity-001 | 7834 | 6729 | -14.11 % | order 30 | 6729 | -14.11 % | +0.00 |
| SWISS | /magazine/en | 1440 | swiss-parity-001 | 7022 | 6864 | -2.25 % | order 34 | 6864 | -2.25 % | +0.00 |
| SWISS | /magazine/en | 390 | swiss-parity-001 | 10381 | 8967 | -13.62 % | order 31 | 8967 | -13.62 % | +0.00 |
| SWISS | /magazine/en/inside-swiss/behind-the-scenes/a350-special-livery | 1440 | swiss-parity-001 | 6925 | 6763 | -2.34 % | order 33 | 6763 | -2.34 % | +0.00 |
| SWISS | /magazine/en/inside-swiss/behind-the-scenes/a350-special-livery | 390 | swiss-parity-001 | 7936 | 6844 | -13.76 % | order 31 | 6844 | -13.76 % | +0.00 |
| Group for Business | /de/de/program/partner-plus-benefit | 390 | b2b-parity-001 | 5361 | 5230 | -2.44 % | order 33 | 5230 | -2.44 % | +0.00 |
| Brussels | /be/en/check-in-options-and-info | 390 | brussels-parity-001 | 3132 | 2986 | -4.66 % | order 31 | 2986 | -4.66 % | +0.00 |

## The other 409 page-widths of order 27's sweep

Today's shared rules could also take a page-width that was within 2 % out of it, so all 409 that order 27's sweep had within 2 % were captured again too (2026-11-16 ~16:15 to 16:50 UTC, the same method). Each is compared with its last figure on the same recording: order 27's sweep, or order 28's phone sweep with the 844 px window.

Result:
- **Two captures were glitches** and were taken again: Discover /de/en/homepage 1440 drew 900 px, and Group for Business special-assistance-and-services 390 drew 844 px. Captured again, both measure as their last figures.
- **Four page-widths are further, three of them by more than 0.5 points: SWISS /ch/de and /ch/en homepage.**
  - 1440: -1.67 -> -2.63 % and -1.62 -> -2.59 %.
  - 390: +0.56 -> -1.09 % (de) and +0.61 -> -1.06 % (en, 0.45 points).
  - **Located:** the boxes of both captures compared. The flash-teaser strip above the flight search held "Information on flights to Dubai" (44 px at 1440, about 85 at 390) and is empty today; every box after it moved up by that much.
  - **The cause is not code.** The strip draws the Message Center index (lufthansa.turnsthe.page/message-center/index.json), which no longer has that message (11 rows, none for SWISS).
  - The message is in lh-com's DA (/message-center/irreg/information-on-flights-to-dubai/en and /de, tenants lx, no end date; read about 16:50 UTC). It answers 200 on aem.page but 404 on aem.live: it is not published any more, so the index (which fills on publish) dropped it.
  - www's recordings (swiss-parity-001 and -008) show the notice.
  - **Fix:** publish the two message documents again, the helper's or the store owner's call: it is live data of the message store, not a page or rule of mine. I publish nothing. No code reverse applies.
- **Below 0.5 points:** Brussels connecting-africa 390 (+0.43) and student-fares 390 (+0.32) are my rows of orders 33 and 34, as gated. Nothing else moved further by more than 0.3 points.
- **No other page-width left 2 %.**

| brand | page | width | recording | www px | last px | last vs www | from | now px | now vs www | further (points) |
|---|---|---|---|---|---|---|---|---|---|---|
| SWISS | /ch/en/homepage | 1440 | swiss-parity-008 | 4433 | 4361 | -1.62 % | order 27 | 4318 | -2.59 % | +0.97 |
| SWISS | /ch/de/homepage | 1440 | swiss-parity-001 | 4480 | 4405 | -1.67 % | order 27 | 4362 | -2.63 % | +0.96 |
| SWISS | /ch/de/homepage | 390 | swiss-parity-001 | 5141 | 5170 | +0.56 % | order 28 | 5085 | -1.09 % | +0.53 |
| SWISS | /ch/en/homepage | 390 | swiss-parity-008 | 5086 | 5117 | +0.61 % | order 28 | 5032 | -1.06 % | +0.45 |
| Brussels | /be/en/book-a-flight/connecting-africa | 390 | brussels-parity-001 | 7454 | 7507 | +0.71 % | order 28 | 7539 | +1.14 % | +0.43 |
| Brussels | /be/en/local-page/student-fares | 390 | brussels-parity-011 | 7722 | 7736 | +0.18 % | order 28 | 7683 | -0.51 % | +0.32 |
| Group for Business | /ch/en/program/experts/airlines-at-a-glance/discover-airlines | 1440 | b2b-parity-006 | 2272 | 2282 | +0.44 % | order 27 | 2282 | +0.44 % | +0.00 |
| Group for Business | /ch/en/program/experts/airlines-at-a-glance/discover-airlines | 390 | b2b-parity-006 | 3460 | 3425 | -1.01 % | order 28 | 3425 | -1.01 % | +0.00 |
| Group for Business | /ch/en/program/experts/airlines-at-a-glance/eurowings | 1440 | b2b-parity-006 | 2203 | 2213 | +0.45 % | order 27 | 2213 | +0.45 % | +0.00 |
| Group for Business | /ch/en/program/experts/airlines-at-a-glance/eurowings | 390 | b2b-parity-006 | 3606 | 3601 | -0.14 % | order 28 | 3601 | -0.14 % | +0.00 |
| Group for Business | /ch/en/program/experts/on-board/entertainment-on-board | 390 | b2b-parity-005 | 2039 | 2063 | +1.18 % | order 28 | 2063 | +1.18 % | +0.00 |
| Group for Business | /ch/en/program/experts/on-board/meals-on-board | 1440 | b2b-parity-010 | 2910 | 2863 | -1.62 % | order 27 | 2863 | -1.62 % | +0.00 |
| Group for Business | /de/de/about-us | 1440 | b2b-parity-001 | 2771 | 2758 | -0.47 % | order 27 | 2758 | -0.47 % | +0.00 |
| Group for Business | /de/de/about-us/contact | 1440 | b2b-parity-001 | 3499 | 3455 | -1.26 % | order 27 | 3455 | -1.26 % | +0.00 |
| Group for Business | /de/de/about-us/contact | 390 | b2b-parity-001 | 4153 | 4130 | -0.55 % | order 28 | 4130 | -0.55 % | +0.00 |
| Group for Business | /de/de/about-us/lhg-history | 390 | b2b-parity-006 | 4308 | 4331 | +0.53 % | order 28 | 4331 | +0.53 % | +0.00 |
| Group for Business | /de/de/allegris/corporates-start-of-booking | 1440 | b2b-parity-012 | 7038 | 7133 | +1.35 % | order 27 | 7133 | +1.35 % | +0.00 |
| Group for Business | /de/de/allegris/corporates-start-of-booking | 390 | b2b-parity-012 | 7407 | 7411 | +0.05 % | order 28 | 7411 | +0.05 % | +0.00 |
| Group for Business | /de/de/allegris/intermediaries-start-of-booking | 390 | b2b-parity-005 | 9254 | 9328 | +0.80 % | order 28 | 9328 | +0.80 % | +0.00 |
| Group for Business | /de/de/homepage | 1440 | b2b-parity-001 | 5379 | 5336 | -0.80 % | order 27 | 5336 | -0.80 % | +0.00 |
| Group for Business | /de/de/homepage | 390 | b2b-parity-001 | 8273 | 8324 | +0.62 % | order 28 | 8324 | +0.62 % | +0.00 |
| Group for Business | /de/de/lhg4b-search/lhg4b-search-prelogin | 1440 | b2b-parity-001 | 900 | 900 | +0.00 % | order 27 | 900 | +0.00 % | +0.00 |
| Group for Business | /de/de/news | 1440 | b2b-parity-001 | 4316 | 4331 | +0.35 % | order 27 | 4331 | +0.35 % | +0.00 |
| Group for Business | /de/de/news | 390 | b2b-parity-001 | 1294 | 1292 | -0.15 % | order 28 | 1292 | -0.15 % | +0.00 |
| Group for Business | /de/de/news/celebrating-shared-stories | 1440 | b2b-parity-001 | 7754 | 7600 | -1.99 % | order 27 | 7600 | -1.99 % | +0.00 |
| Group for Business | /de/de/news/celebrating-shared-stories | 390 | b2b-parity-001 | 12092 | 11858 | -1.94 % | order 28 | 11858 | -1.94 % | +0.00 |
| Group for Business | /de/de/news/lhg-invoice-receipt-download | 1440 | b2b-parity-006 | 1504 | 1518 | +0.93 % | order 27 | 1518 | +0.93 % | +0.00 |
| Group for Business | /de/de/news/lhg-invoice-receipt-download | 390 | b2b-parity-006 | 2302 | 2315 | +0.56 % | order 28 | 2315 | +0.56 % | +0.00 |
| Group for Business | /de/de/news/travel-id-now-required-for-online-check-in | 1440 | b2b-parity-001 | 2530 | 2572 | +1.66 % | order 27 | 2572 | +1.66 % | +0.00 |
| Group for Business | /de/de/news/travel-id-now-required-for-online-check-in | 390 | b2b-parity-001 | 4605 | 4619 | +0.30 % | order 28 | 4619 | +0.30 % | +0.00 |
| Group for Business | /de/de/program/businesstogo | 1440 | b2b-parity-009 | 5069 | 4986 | -1.64 % | order 27 | 4986 | -1.64 % | +0.00 |
| Group for Business | /de/de/program/businesstogo | 390 | b2b-parity-009 | 7283 | 7216 | -0.92 % | order 28 | 7216 | -0.92 % | +0.00 |
| Group for Business | /de/de/program/experts | 1440 | b2b-parity-001 | 4931 | 4978 | +0.95 % | order 27 | 4978 | +0.95 % | +0.00 |
| Group for Business | /de/de/program/experts | 390 | b2b-parity-001 | 9807 | 9802 | -0.05 % | order 28 | 9802 | -0.05 % | +0.00 |
| Group for Business | /de/de/program/experts/airlines-at-a-glance/airdolomiti | 1440 | b2b-parity-006 | 1697 | 1697 | +0.00 % | order 27 | 1697 | +0.00 % | +0.00 |
| Group for Business | /de/de/program/experts/airlines-at-a-glance/airdolomiti | 390 | b2b-parity-006 | 2744 | 2741 | -0.11 % | order 28 | 2741 | -0.11 % | +0.00 |
| Group for Business | /de/de/program/experts/airlines-at-a-glance/austrian-airlines | 1440 | b2b-parity-006 | 2203 | 2204 | +0.05 % | order 27 | 2204 | +0.05 % | +0.00 |
| Group for Business | /de/de/program/experts/airlines-at-a-glance/austrian-airlines | 390 | b2b-parity-006 | 3571 | 3566 | -0.14 % | order 28 | 3566 | -0.14 % | +0.00 |
| Group for Business | /de/de/program/experts/airlines-at-a-glance/brussels-airlines | 1440 | b2b-parity-006 | 1756 | 1757 | +0.06 % | order 27 | 1757 | +0.06 % | +0.00 |
| Group for Business | /de/de/program/experts/airlines-at-a-glance/brussels-airlines | 390 | b2b-parity-006 | 2841 | 2814 | -0.95 % | order 28 | 2814 | -0.95 % | +0.00 |
| Group for Business | /de/de/program/experts/airlines-at-a-glance/discover-airlines | 1440 | b2b-parity-006 | 2194 | 2194 | +0.00 % | order 27 | 2194 | +0.00 % | +0.00 |
| Group for Business | /de/de/program/experts/airlines-at-a-glance/discover-airlines | 390 | b2b-parity-006 | 3637 | 3632 | -0.14 % | order 28 | 3632 | -0.14 % | +0.00 |
| Group for Business | /de/de/program/experts/airlines-at-a-glance/edelweiss | 1440 | b2b-parity-006 | 1718 | 1718 | +0.00 % | order 27 | 1718 | +0.00 % | +0.00 |
| Group for Business | /de/de/program/experts/airlines-at-a-glance/edelweiss | 390 | b2b-parity-006 | 2772 | 2769 | -0.11 % | order 28 | 2769 | -0.11 % | +0.00 |
| Group for Business | /de/de/program/experts/airlines-at-a-glance/eurowings | 1440 | b2b-parity-006 | 2237 | 2237 | +0.00 % | order 27 | 2237 | +0.00 % | +0.00 |
| Group for Business | /de/de/program/experts/airlines-at-a-glance/eurowings | 390 | b2b-parity-006 | 3702 | 3697 | -0.14 % | order 28 | 3697 | -0.14 % | +0.00 |
| Group for Business | /de/de/program/experts/airlines-at-a-glance/lufthansa | 1440 | b2b-parity-006 | 1693 | 1694 | +0.06 % | order 27 | 1694 | +0.06 % | +0.00 |
| Group for Business | /de/de/program/experts/airlines-at-a-glance/lufthansa | 390 | b2b-parity-006 | 2744 | 2741 | -0.11 % | order 28 | 2741 | -0.11 % | +0.00 |
| Group for Business | /de/de/program/experts/airlines-at-a-glance/swiss | 1440 | b2b-parity-006 | 1695 | 1695 | +0.00 % | order 27 | 1695 | +0.00 % | +0.00 |
| Group for Business | /de/de/program/experts/airlines-at-a-glance/swiss | 390 | b2b-parity-006 | 2746 | 2743 | -0.11 % | order 28 | 2743 | -0.11 % | +0.00 |
| Group for Business | /de/de/program/experts/news | 1440 | b2b-parity-001 | 5375 | 5361 | -0.26 % | order 27 | 5361 | -0.26 % | +0.00 |
| Group for Business | /de/de/program/experts/news | 390 | b2b-parity-001 | 18044 | 18002 | -0.23 % | order 28 | 18002 | -0.23 % | +0.00 |
| Group for Business | /de/de/program/partner-plus-benefit | 1440 | b2b-parity-001 | 3349 | 3316 | -0.99 % | order 27 | 3316 | -0.99 % | +0.00 |
| Group for Business | /de/de/travel-management/hygiene-and-safety | 1440 | b2b-parity-006 | 2986 | 2981 | -0.17 % | order 27 | 2981 | -0.17 % | +0.00 |
| Group for Business | /de/de/travel-management/hygiene-and-safety | 390 | b2b-parity-006 | 3170 | 3115 | -1.74 % | order 28 | 3115 | -1.74 % | +0.00 |
| Group for Business | /de/de/travel-management/route-network | 1440 | b2b-parity-001 | 4173 | 4164 | -0.22 % | order 27 | 4164 | -0.22 % | +0.00 |
| Group for Business | /de/de/travel-management/route-network | 390 | b2b-parity-001 | 5915 | 6025 | +1.86 % | order 28 | 6025 | +1.86 % | +0.00 |
| Group for Business | /de/de/travel-solutions/lufthansa-group-airlines | 1440 | b2b-parity-002 | 4071 | 4069 | -0.05 % | order 27 | 4069 | -0.05 % | +0.00 |
| Group for Business | /de/de/travel-solutions/lufthansa-group-airlines | 390 | b2b-parity-001 | 5454 | 5393 | -1.12 % | order 28 | 5393 | -1.12 % | +0.00 |
| Group for Business | /de/de/travel-solutions/ndc | 1440 | b2b-parity-001 | 1693 | 1677 | -0.95 % | order 27 | 1677 | -0.95 % | +0.00 |
| Group for Business | /de/de/travel-solutions/ndc | 390 | b2b-parity-001 | 2107 | 2109 | +0.09 % | order 28 | 2109 | +0.09 % | +0.00 |
| Group for Business | /de/de/travel-solutions/our-european-fares | 1440 | b2b-parity-007 | 9525 | 9506 | -0.20 % | order 27 | 9506 | -0.20 % | +0.00 |
| Group for Business | /de/de/travel-solutions/our-european-fares | 390 | b2b-parity-007 | 13164 | 13355 | +1.45 % | order 28 | 13355 | +1.45 % | +0.00 |
| Group for Business | /de/de/travel-solutions/swiss-senses/corporates-start-of-booking | 390 | b2b-parity-005 | 6656 | 6656 | +0.00 % | order 28 | 6656 | +0.00 % | +0.00 |
| Group for Business | /de/en/about-us | 1440 | b2b-parity-001 | 2761 | 2748 | -0.47 % | order 27 | 2748 | -0.47 % | +0.00 |
| Group for Business | /de/en/about-us | 390 | b2b-parity-001 | 3305 | 3281 | -0.73 % | order 28 | 3281 | -0.73 % | +0.00 |
| Group for Business | /de/en/about-us/contact | 1440 | b2b-parity-001 | 3070 | 3033 | -1.21 % | order 27 | 3033 | -1.21 % | +0.00 |
| Group for Business | /de/en/about-us/contact | 390 | b2b-parity-001 | 3832 | 3904 | +1.88 % | order 28 | 3904 | +1.88 % | +0.00 |
| Group for Business | /de/en/about-us/help-alliance | 1440 | b2b-parity-003 | 2347 | 2340 | -0.30 % | order 27 | 2340 | -0.30 % | +0.00 |
| Group for Business | /de/en/about-us/help-alliance | 390 | b2b-parity-013 | 3348 | 3326 | -0.66 % | order 28 | 3326 | -0.66 % | +0.00 |
| Group for Business | /de/en/about-us/joint-ventures | 1440 | b2b-parity-007 | 2591 | 2603 | +0.46 % | order 27 | 2603 | +0.46 % | +0.00 |
| Group for Business | /de/en/about-us/joint-ventures | 390 | b2b-parity-007 | 3235 | 3240 | +0.15 % | order 28 | 3240 | +0.15 % | +0.00 |
| Group for Business | /de/en/about-us/joint-ventures/japan-joint-venture | 1440 | b2b-parity-003 | 5037 | 5011 | -0.52 % | order 27 | 5011 | -0.52 % | +0.00 |
| Group for Business | /de/en/about-us/joint-ventures/japan-joint-venture | 390 | b2b-parity-003 | 7967 | 7956 | -0.14 % | order 28 | 7956 | -0.14 % | +0.00 |
| Group for Business | /de/en/about-us/lhg-history | 390 | b2b-parity-003 | 4212 | 4219 | +0.17 % | order 28 | 4219 | +0.17 % | +0.00 |
| Group for Business | /de/en/about-us/lhg-history/lhg-history-alliances-and-joint-ventures | 1440 | b2b-parity-003 | 5171 | 5113 | -1.12 % | order 27 | 5113 | -1.12 % | +0.00 |
| Group for Business | /de/en/about-us/lhg-history/lhg-history-alliances-and-joint-ventures | 390 | b2b-parity-003 | 6051 | 6061 | +0.17 % | order 28 | 6061 | +0.17 % | +0.00 |
| Group for Business | /de/en/about-us/lhg-history/lhg-history-booking | 1440 | b2b-parity-007 | 3687 | 3738 | +1.38 % | order 27 | 3738 | +1.38 % | +0.00 |
| Group for Business | /de/en/about-us/lhg-history/lhg-history-booking | 390 | b2b-parity-007 | 4159 | 4202 | +1.03 % | order 28 | 4202 | +1.03 % | +0.00 |
| Group for Business | /de/en/allegris/corporates-start-of-booking | 1440 | b2b-parity-012 | 7001 | 7092 | +1.30 % | order 27 | 7092 | +1.30 % | +0.00 |
| Group for Business | /de/en/allegris/intermediaries-start-of-booking | 1440 | b2b-parity-012 | 7869 | 7911 | +0.53 % | order 27 | 7911 | +0.53 % | +0.00 |
| Group for Business | /de/en/allegris/intermediaries-start-of-booking | 390 | b2b-parity-012 | 9053 | 9125 | +0.80 % | order 28 | 9125 | +0.80 % | +0.00 |
| Group for Business | /de/en/allegris/video-gallery | 390 | b2b-parity-006 | 3745 | 3733 | -0.32 % | order 28 | 3733 | -0.32 % | +0.00 |
| Group for Business | /de/en/homepage | 1440 | b2b-parity-001 | 5200 | 5189 | -0.21 % | order 27 | 5189 | -0.21 % | +0.00 |
| Group for Business | /de/en/homepage | 390 | b2b-parity-001 | 7892 | 7879 | -0.16 % | order 28 | 7879 | -0.16 % | +0.00 |
| Group for Business | /de/en/lhg4b-search/lhg4b-search-prelogin | 1440 | b2b-parity-001 | 900 | 900 | +0.00 % | order 27 | 900 | +0.00 % | +0.00 |
| Group for Business | /de/en/news | 1440 | b2b-parity-001 | 4161 | 4177 | +0.38 % | order 27 | 4177 | +0.38 % | +0.00 |
| Group for Business | /de/en/news | 390 | b2b-parity-001 | 1298 | 1296 | -0.15 % | order 28 | 1296 | -0.15 % | +0.00 |
| Group for Business | /de/en/news/celebrating-shared-stories | 1440 | b2b-parity-001 | 8265 | 8208 | -0.69 % | order 27 | 8208 | -0.69 % | +0.00 |
| Group for Business | /de/en/news/celebrating-shared-stories | 390 | b2b-parity-001 | 12438 | 12196 | -1.95 % | order 28 | 12196 | -1.95 % | +0.00 |
| Group for Business | /de/en/news/celebrating-shared-stories/sap | 390 | b2b-parity-007 | 8819 | 8992 | +1.96 % | order 28 | 8992 | +1.96 % | +0.00 |
| Group for Business | /de/en/news/lhg-invoice-receipt-download | 1440 | b2b-parity-006 | 1419 | 1436 | +1.20 % | order 27 | 1436 | +1.20 % | +0.00 |
| Group for Business | /de/en/news/lhg-invoice-receipt-download | 390 | b2b-parity-006 | 2142 | 2134 | -0.37 % | order 28 | 2134 | -0.37 % | +0.00 |
| Group for Business | /de/en/news/lhg-ita-airways | 390 | b2b-parity-003 | 6073 | 6188 | +1.89 % | order 28 | 6188 | +1.89 % | +0.00 |
| Group for Business | /de/en/news/travel-id-now-required-for-online-check-in | 1440 | b2b-parity-001 | 2520 | 2562 | +1.67 % | order 27 | 2562 | +1.67 % | +0.00 |
| Group for Business | /de/en/news/travel-id-now-required-for-online-check-in | 390 | b2b-parity-001 | 4457 | 4495 | +0.85 % | order 28 | 4495 | +0.85 % | +0.00 |
| Group for Business | /de/en/program | 1440 | b2b-parity-007 | 2057 | 2059 | +0.10 % | order 27 | 2059 | +0.10 % | +0.00 |
| Group for Business | /de/en/program | 390 | b2b-parity-013 | 2449 | 2444 | -0.20 % | order 28 | 2444 | -0.20 % | +0.00 |
| Group for Business | /de/en/program/businesstogo | 1440 | b2b-parity-009 | 4931 | 4903 | -0.57 % | order 27 | 4903 | -0.57 % | +0.00 |
| Group for Business | /de/en/program/businesstogo | 390 | b2b-parity-009 | 6685 | 6701 | +0.24 % | order 28 | 6701 | +0.24 % | +0.00 |
| Group for Business | /de/en/program/experts | 1440 | b2b-parity-001 | 4952 | 4870 | -1.66 % | order 27 | 4870 | -1.66 % | +0.00 |
| Group for Business | /de/en/program/experts/airlines-at-a-glance/airdolomiti | 1440 | b2b-parity-006 | 1687 | 1687 | +0.00 % | order 27 | 1687 | +0.00 % | +0.00 |
| Group for Business | /de/en/program/experts/airlines-at-a-glance/airdolomiti | 390 | b2b-parity-006 | 2744 | 2741 | -0.11 % | order 28 | 2741 | -0.11 % | +0.00 |
| Group for Business | /de/en/program/experts/airlines-at-a-glance/austrian-airlines | 1440 | b2b-parity-006 | 2169 | 2170 | +0.05 % | order 27 | 2170 | +0.05 % | +0.00 |
| Group for Business | /de/en/program/experts/airlines-at-a-glance/austrian-airlines | 390 | b2b-parity-006 | 3547 | 3542 | -0.14 % | order 28 | 3542 | -0.14 % | +0.00 |
| Group for Business | /de/en/program/experts/airlines-at-a-glance/brussels-airlines | 1440 | b2b-parity-006 | 1722 | 1723 | +0.06 % | order 27 | 1723 | +0.06 % | +0.00 |
| Group for Business | /de/en/program/experts/airlines-at-a-glance/brussels-airlines | 390 | b2b-parity-006 | 2817 | 2814 | -0.11 % | order 28 | 2814 | -0.11 % | +0.00 |
| Group for Business | /de/en/program/experts/airlines-at-a-glance/discover-airlines | 1440 | b2b-parity-006 | 2239 | 2247 | +0.36 % | order 27 | 2247 | +0.36 % | +0.00 |
| Group for Business | /de/en/program/experts/airlines-at-a-glance/discover-airlines | 390 | b2b-parity-006 | 3628 | 3651 | +0.63 % | order 28 | 3651 | +0.63 % | +0.00 |
| Group for Business | /de/en/program/experts/airlines-at-a-glance/edelweiss | 1440 | b2b-parity-006 | 1708 | 1708 | +0.00 % | order 27 | 1708 | +0.00 % | +0.00 |
| Group for Business | /de/en/program/experts/airlines-at-a-glance/edelweiss | 390 | b2b-parity-006 | 2772 | 2769 | -0.11 % | order 28 | 2769 | -0.11 % | +0.00 |
| Group for Business | /de/en/program/experts/airlines-at-a-glance/eurowings | 1440 | b2b-parity-006 | 2203 | 2203 | +0.00 % | order 27 | 2203 | +0.00 % | +0.00 |
| Group for Business | /de/en/program/experts/airlines-at-a-glance/eurowings | 390 | b2b-parity-006 | 3606 | 3601 | -0.14 % | order 28 | 3601 | -0.14 % | +0.00 |
| Group for Business | /de/en/program/experts/airlines-at-a-glance/lufthansa | 1440 | b2b-parity-006 | 1683 | 1684 | +0.06 % | order 27 | 1684 | +0.06 % | +0.00 |
| Group for Business | /de/en/program/experts/airlines-at-a-glance/lufthansa | 390 | b2b-parity-006 | 2744 | 2741 | -0.11 % | order 28 | 2741 | -0.11 % | +0.00 |
| Group for Business | /de/en/program/experts/airlines-at-a-glance/swiss | 1440 | b2b-parity-006 | 1685 | 1685 | +0.00 % | order 27 | 1685 | +0.00 % | +0.00 |
| Group for Business | /de/en/program/experts/airlines-at-a-glance/swiss | 390 | b2b-parity-006 | 2746 | 2743 | -0.11 % | order 28 | 2743 | -0.11 % | +0.00 |
| Group for Business | /de/en/program/experts/news | 1440 | b2b-parity-001 | 5089 | 5123 | +0.67 % | order 27 | 5123 | +0.67 % | +0.00 |
| Group for Business | /de/en/program/experts/news | 390 | b2b-parity-001 | 15698 | 15680 | -0.11 % | order 28 | 15680 | -0.11 % | +0.00 |
| Group for Business | /de/en/program/experts/on-board/entertainment-on-board | 390 | b2b-parity-013 | 2039 | 2063 | +1.18 % | order 28 | 2063 | +1.18 % | +0.00 |
| Group for Business | /de/en/program/experts/on-board/meals-on-board | 1440 | b2b-parity-010 | 2910 | 2853 | -1.96 % | order 27 | 2853 | -1.96 % | +0.00 |
| Group for Business | /de/en/program/experts/on-board/travel-classes-and-booking | 1440 | b2b-parity-003 | 1595 | 1606 | +0.69 % | order 27 | 1606 | +0.69 % | +0.00 |
| Group for Business | /de/en/program/experts/on-board/travel-classes-and-booking | 390 | b2b-parity-003 | 2840 | 2823 | -0.60 % | order 28 | 2823 | -0.60 % | +0.00 |
| Group for Business | /de/en/program/experts/programs-and-groups | 390 | b2b-parity-013 | 1364 | 1360 | -0.29 % | order 28 | 1360 | -0.29 % | +0.00 |
| Group for Business | /de/en/program/experts/special-assistance-and-services | 390 | b2b-parity-005 | 1458 | 1487 | +1.99 % | order 28 | 1487 | +1.99 % | +0.00 |
| Group for Business | /de/en/program/partner-plus-benefit | 1440 | b2b-parity-001 | 3287 | 3274 | -0.40 % | order 27 | 3274 | -0.40 % | +0.00 |
| Group for Business | /de/en/program/partner-plus-benefit | 390 | b2b-parity-001 | 5061 | 4982 | -1.56 % | order 28 | 4982 | -1.56 % | +0.00 |
| Group for Business | /de/en/travel-management | 1440 | b2b-parity-007 | 2565 | 2525 | -1.56 % | order 27 | 2525 | -1.56 % | +0.00 |
| Group for Business | /de/en/travel-management | 390 | b2b-parity-007 | 4064 | 4085 | +0.52 % | order 28 | 4085 | +0.52 % | +0.00 |
| Group for Business | /de/en/travel-management/hygiene-and-safety | 1440 | b2b-parity-006 | 2952 | 2947 | -0.17 % | order 27 | 2947 | -0.17 % | +0.00 |
| Group for Business | /de/en/travel-management/hygiene-and-safety | 390 | b2b-parity-006 | 3090 | 3071 | -0.61 % | order 28 | 3071 | -0.61 % | +0.00 |
| Group for Business | /de/en/travel-management/route-network | 1440 | b2b-parity-001 | 4037 | 4071 | +0.84 % | order 27 | 4071 | +0.84 % | +0.00 |
| Group for Business | /de/en/travel-management/route-network | 390 | b2b-parity-001 | 5739 | 5849 | +1.92 % | order 28 | 5849 | +1.92 % | +0.00 |
| Group for Business | /de/en/travel-solutions/lufthansa-group-airlines | 1440 | b2b-parity-002 | 4013 | 4035 | +0.55 % | order 27 | 4035 | +0.55 % | +0.00 |
| Group for Business | /de/en/travel-solutions/lufthansa-group-airlines | 390 | b2b-parity-001 | 5286 | 5273 | -0.25 % | order 28 | 5273 | -0.25 % | +0.00 |
| Group for Business | /de/en/travel-solutions/lufthansa-group-wifi | 1440 | b2b-parity-007 | 4476 | 4469 | -0.16 % | order 27 | 4469 | -0.16 % | +0.00 |
| Group for Business | /de/en/travel-solutions/lufthansa-group-wifi | 390 | b2b-parity-007 | 6532 | 6495 | -0.57 % | order 28 | 6495 | -0.57 % | +0.00 |
| Group for Business | /de/en/travel-solutions/ndc | 1440 | b2b-parity-001 | 1635 | 1643 | +0.49 % | order 27 | 1643 | +0.49 % | +0.00 |
| Group for Business | /de/en/travel-solutions/ndc | 390 | b2b-parity-001 | 1963 | 1965 | +0.10 % | order 28 | 1965 | +0.10 % | +0.00 |
| Group for Business | /de/en/travel-solutions/our-european-fares | 1440 | b2b-parity-007 | 9102 | 9203 | +1.11 % | order 27 | 9203 | +1.11 % | +0.00 |
| Group for Business | /de/en/travel-solutions/our-european-fares | 390 | b2b-parity-007 | 12053 | 12166 | +0.94 % | order 28 | 12166 | +0.94 % | +0.00 |
| Group for Business | /de/en/travel-solutions/swiss-senses/corporates-start-of-booking | 390 | b2b-parity-005 | 6458 | 6472 | +0.22 % | order 28 | 6472 | +0.22 % | +0.00 |
| Group for Business | /de/en/travel-solutions/swiss-senses/intermediaries-start-of-booking | 390 | b2b-parity-005 | 6779 | 6793 | +0.21 % | order 28 | 6793 | +0.21 % | +0.00 |
| Group for Business | /gb/en/program/experts/programs-and-groups | 390 | b2b-parity-013 | 7043 | 6961 | -1.16 % | order 28 | 6961 | -1.16 % | +0.00 |
| Group for Business | /mx/en/news | 390 | b2b-parity-005 | 1299 | 1296 | -0.23 % | order 28 | 1296 | -0.23 % | +0.00 |
| Group for Business | /xx/de/allegris/corporates-start-of-booking | 390 | b2b-parity-005 | 7406 | 7411 | +0.07 % | order 28 | 7411 | +0.07 % | +0.00 |
| Group for Business | /xx/de/allegris/intermediaries-start-of-booking | 390 | b2b-parity-005 | 9254 | 9328 | +0.80 % | order 28 | 9328 | +0.80 % | +0.00 |
| Group for Business | /xx/de/news | 390 | b2b-parity-005 | 1295 | 1292 | -0.23 % | order 28 | 1292 | -0.23 % | +0.00 |
| Group for Business | /xx/de/program/businesstogo | 1440 | b2b-parity-009 | 5069 | 4986 | -1.64 % | order 27 | 4986 | -1.64 % | +0.00 |
| Group for Business | /xx/de/program/businesstogo | 390 | b2b-parity-009 | 7283 | 7216 | -0.92 % | order 28 | 7216 | -0.92 % | +0.00 |
| Group for Business | /xx/de/program/experts/airlines-at-a-glance/brussels-airlines | 1440 | b2b-parity-006 | 1756 | 1757 | +0.06 % | order 27 | 1757 | +0.06 % | +0.00 |
| Group for Business | /xx/de/program/experts/airlines-at-a-glance/brussels-airlines | 390 | b2b-parity-006 | 2841 | 2814 | -0.95 % | order 28 | 2814 | -0.95 % | +0.00 |
| Group for Business | /xx/de/program/experts/airlines-at-a-glance/lufthansa | 1440 | b2b-parity-006 | 1693 | 1694 | +0.06 % | order 27 | 1694 | +0.06 % | +0.00 |
| Group for Business | /xx/de/program/experts/airlines-at-a-glance/lufthansa | 390 | b2b-parity-006 | 2744 | 2741 | -0.11 % | order 28 | 2741 | -0.11 % | +0.00 |
| Group for Business | /xx/de/program/experts/airlines-at-a-glance/swiss | 1440 | b2b-parity-006 | 1695 | 1695 | +0.00 % | order 27 | 1695 | +0.00 % | +0.00 |
| Group for Business | /xx/de/program/experts/airlines-at-a-glance/swiss | 390 | b2b-parity-006 | 2746 | 2743 | -0.11 % | order 28 | 2743 | -0.11 % | +0.00 |
| Group for Business | /xx/de/travel-management/hygiene-and-safety | 1440 | b2b-parity-006 | 2986 | 2981 | -0.17 % | order 27 | 2981 | -0.17 % | +0.00 |
| Group for Business | /xx/de/travel-management/hygiene-and-safety | 390 | b2b-parity-006 | 3170 | 3115 | -1.74 % | order 28 | 3115 | -1.74 % | +0.00 |
| Group for Business | /xx/de/travel-solutions/swiss-senses/corporates-start-of-booking | 390 | b2b-parity-005 | 6656 | 6672 | +0.24 % | order 28 | 6672 | +0.24 % | +0.00 |
| Group for Business | /xx/de/travel-solutions/swiss-senses/intermediaries-start-of-booking | 390 | b2b-parity-005 | 7117 | 7209 | +1.29 % | order 28 | 7209 | +1.29 % | +0.00 |
| Group for Business | /xx/en/news | 390 | b2b-parity-005 | 1299 | 1296 | -0.23 % | order 28 | 1296 | -0.23 % | +0.00 |
| Group for Business | /xx/en/program/businesstogo | 1440 | b2b-parity-009 | 4931 | 4903 | -0.57 % | order 27 | 4903 | -0.57 % | +0.00 |
| Group for Business | /xx/en/program/businesstogo | 390 | b2b-parity-009 | 6685 | 6701 | +0.24 % | order 28 | 6701 | +0.24 % | +0.00 |
| Group for Business | /xx/en/program/experts/on-board/entertainment-on-board | 390 | b2b-parity-005 | 2039 | 2063 | +1.18 % | order 28 | 2063 | +1.18 % | +0.00 |
| Group for Business | /xx/en/program/experts/programs-and-groups | 390 | b2b-parity-013 | 1364 | 1360 | -0.29 % | order 28 | 1360 | -0.29 % | +0.00 |
| Group for Business | /xx/en/program/experts/special-assistance-and-services | 390 | b2b-parity-005 | 1458 | 1487 | +1.99 % | order 28 | 1487 | +1.99 % | +0.00 |
| Group for Business | /xx/en/travel-management/hygiene-and-safety | 1440 | b2b-parity-006 | 2952 | 2947 | -0.17 % | order 27 | 2947 | -0.17 % | +0.00 |
| Group for Business | /xx/en/travel-management/hygiene-and-safety | 390 | b2b-parity-006 | 3090 | 3071 | -0.61 % | order 28 | 3071 | -0.61 % | +0.00 |
| Group for Business | /xx/en/travel-solutions/swiss-senses/corporates-start-of-booking | 390 | b2b-parity-005 | 6458 | 6544 | +1.33 % | order 28 | 6544 | +1.33 % | +0.00 |
| Group for Business | /xx/en/travel-solutions/swiss-senses/intermediaries-start-of-booking | 390 | b2b-parity-005 | 6779 | 6865 | +1.27 % | order 28 | 6865 | +1.27 % | +0.00 |
| Brussels | /am/en/non-encrypt-mail/contact-form-error | 1440 | brussels-parity-004 | 900 | 900 | +0.00 % | order 27 | 900 | +0.00 % | +0.00 |
| Brussels | /ao/fr/legal-notices/aviation-services-law | 1440 | brussels-parity-007 | 2682 | 2635 | -1.75 % | order 27 | 2635 | -1.75 % | +0.00 |
| Brussels | /ao/fr/legal-notices/aviation-services-law | 390 | brussels-parity-007 | 4771 | 4678 | -1.95 % | order 28 | 4678 | -1.95 % | +0.00 |
| Brussels | /be/en/articles | 1440 | brussels-parity-003 | 4635 | 4717 | +1.77 % | order 27 | 4717 | +1.77 % | +0.00 |
| Brussels | /be/en/articles | 390 | brussels-parity-003 | 7814 | 7896 | +1.05 % | order 28 | 7896 | +1.05 % | +0.00 |
| Brussels | /be/en/articles/bike-the-city | 390 | brussels-parity-010 | 5981 | 5995 | +0.23 % | order 28 | 5995 | +0.23 % | +0.00 |
| Brussels | /be/en/articles/discover-warsaw | 1440 | brussels-parity-010 | 8194 | 8159 | -0.43 % | order 27 | 8159 | -0.43 % | +0.00 |
| Brussels | /be/en/articles/discover-warsaw | 390 | brussels-parity-010 | 6338 | 6310 | -0.44 % | order 28 | 6310 | -0.44 % | +0.00 |
| Brussels | /be/en/articles/lyon | 1440 | brussels-parity-010 | 9554 | 9625 | +0.74 % | order 27 | 9625 | +0.74 % | +0.00 |
| Brussels | /be/en/articles/lyon | 390 | brussels-parity-001 | 7192 | 7219 | +0.38 % | order 28 | 7219 | +0.38 % | +0.00 |
| Brussels | /be/en/articles/manchester-football-trip | 1440 | brussels-parity-010 | 4736 | 4712 | -0.51 % | order 27 | 4712 | -0.51 % | +0.00 |
| Brussels | /be/en/articles/manchester-football-trip | 390 | brussels-parity-010 | 6659 | 6627 | -0.48 % | order 28 | 6627 | -0.48 % | +0.00 |
| Brussels | /be/en/articles/milan-citytrip | 1440 | brussels-parity-010 | 5795 | 5762 | -0.57 % | order 27 | 5762 | -0.57 % | +0.00 |
| Brussels | /be/en/articles/milan-citytrip | 390 | brussels-parity-003 | 8291 | 8190 | -1.22 % | order 28 | 8190 | -1.22 % | +0.00 |
| Brussels | /be/en/articles/mini-holiday | 1440 | brussels-parity-010 | 3860 | 3886 | +0.67 % | order 27 | 3886 | +0.67 % | +0.00 |
| Brussels | /be/en/articles/mini-holiday | 390 | brussels-parity-010 | 5617 | 5621 | +0.07 % | order 28 | 5621 | +0.07 % | +0.00 |
| Brussels | /be/en/articles/prague-fairytale-charm-with-an-edge | 1440 | brussels-parity-010 | 4516 | 4499 | -0.38 % | order 27 | 4499 | -0.38 % | +0.00 |
| Brussels | /be/en/articles/prague-fairytale-charm-with-an-edge | 390 | brussels-parity-010 | 5995 | 5989 | -0.10 % | order 28 | 5989 | -0.10 % | +0.00 |
| Brussels | /be/en/articles/sun-in-march | 1440 | brussels-parity-010 | 4094 | 4128 | +0.83 % | order 27 | 4128 | +0.83 % | +0.00 |
| Brussels | /be/en/articles/sun-in-march | 390 | brussels-parity-010 | 6096 | 6152 | +0.92 % | order 28 | 6152 | +0.92 % | +0.00 |
| Brussels | /be/en/articles/tenerife | 1440 | brussels-parity-010 | 5128 | 5137 | +0.18 % | order 27 | 5137 | +0.18 % | +0.00 |
| Brussels | /be/en/articles/tenerife | 390 | brussels-parity-010 | 6598 | 6618 | +0.30 % | order 28 | 6618 | +0.30 % | +0.00 |
| Brussels | /be/en/articles/the-gambia | 1440 | brussels-parity-009 | 9055 | 9124 | +0.76 % | order 27 | 9124 | +0.76 % | +0.00 |
| Brussels | /be/en/articles/the-gambia | 390 | brussels-parity-009 | 13059 | 13071 | +0.09 % | order 28 | 13071 | +0.09 % | +0.00 |
| Brussels | /be/en/articles/the-ultimate-itinerary-in-kenya | 1440 | brussels-parity-010 | 8911 | 8977 | +0.74 % | order 27 | 8977 | +0.74 % | +0.00 |
| Brussels | /be/en/articles/the-ultimate-itinerary-in-kenya | 390 | brussels-parity-010 | 13998 | 14058 | +0.43 % | order 28 | 14058 | +0.43 % | +0.00 |
| Brussels | /be/en/articles/valencia-like-a-local | 1440 | brussels-parity-010 | 6293 | 6318 | +0.40 % | order 27 | 6318 | +0.40 % | +0.00 |
| Brussels | /be/en/articles/valencia-like-a-local | 390 | brussels-parity-010 | 4719 | 4754 | +0.74 % | order 28 | 4754 | +0.74 % | +0.00 |
| Brussels | /be/en/articles/vilnius-steals-your-heart | 1440 | brussels-parity-010 | 7549 | 7598 | +0.65 % | order 27 | 7598 | +0.65 % | +0.00 |
| Brussels | /be/en/articles/vilnius-steals-your-heart | 390 | brussels-parity-010 | 6193 | 6251 | +0.94 % | order 28 | 6251 | +0.94 % | +0.00 |
| Brussels | /be/en/articles/your-summer-in-athens-starts-here | 1440 | brussels-parity-010 | 7994 | 8149 | +1.94 % | order 27 | 8149 | +1.94 % | +0.00 |
| Brussels | /be/en/articles/your-summer-in-athens-starts-here | 390 | brussels-parity-010 | 7084 | 7153 | +0.97 % | order 28 | 7153 | +0.97 % | +0.00 |
| Brussels | /be/en/book-a-flight | 390 | brussels-parity-001 | 3092 | 3126 | +1.10 % | order 28 | 3126 | +1.10 % | +0.00 |
| Brussels | /be/en/book-a-flight/groups-and-charter/charter | 1440 | brussels-parity-004 | 3251 | 3210 | -1.26 % | order 27 | 3210 | -1.26 % | +0.00 |
| Brussels | /be/en/book-a-flight/groups-and-charter/charter | 390 | brussels-parity-004 | 3707 | 3691 | -0.43 % | order 28 | 3691 | -0.43 % | +0.00 |
| Brussels | /be/en/check-in-options-and-info | 1440 | brussels-parity-001 | 1597 | 1570 | -1.69 % | order 27 | 1570 | -1.69 % | +0.00 |
| Brussels | /be/en/check-in-options-and-info/check-in-at-the-airport | 1440 | brussels-parity-004 | 2477 | 2493 | +0.65 % | order 27 | 2493 | +0.65 % | +0.00 |
| Brussels | /be/en/check-in-options-and-info/check-in-at-the-airport | 390 | brussels-parity-004 | 2876 | 2852 | -0.83 % | order 28 | 2852 | -0.83 % | +0.00 |
| Brussels | /be/en/contact | 1440 | brussels-parity-006 | 1635 | 1652 | +1.04 % | order 27 | 1652 | +1.04 % | +0.00 |
| Brussels | /be/en/contact | 390 | brussels-parity-001 | 2257 | 2266 | +0.40 % | order 28 | 2266 | +0.40 % | +0.00 |
| Brussels | /be/en/contact/feedback | 1440 | brussels-parity-004 | 1425 | 1425 | +0.00 % | order 27 | 1425 | +0.00 % | +0.00 |
| Brussels | /be/en/contact/feedback | 390 | brussels-parity-004 | 1912 | 1890 | -1.15 % | order 28 | 1890 | -1.15 % | +0.00 |
| Brussels | /be/en/contact/feedback/general/other | 1440 | brussels-parity-004 | 6497 | 6516 | +0.29 % | order 27 | 6516 | +0.29 % | +0.00 |
| Brussels | /be/en/contact/feedback/general/other | 390 | brussels-parity-004 | 7400 | 7509 | +1.47 % | order 28 | 7509 | +1.47 % | +0.00 |
| Brussels | /be/en/contact/service-charges | 390 | brussels-parity-004 | 2172 | 2137 | -1.61 % | order 28 | 2137 | -1.61 % | +0.00 |
| Brussels | /be/en/extra-services/baggage/checked-baggage | 1440 | brussels-parity-005 | 3938 | 3915 | -0.58 % | order 27 | 3915 | -0.58 % | +0.00 |
| Brussels | /be/en/extra-services/baggage/checked-baggage | 390 | brussels-parity-011 | 4720 | 4758 | +0.81 % | order 28 | 4758 | +0.81 % | +0.00 |
| Brussels | /be/en/extra-services/meals | 1440 | brussels-parity-001 | 1548 | 1570 | +1.42 % | order 27 | 1570 | +1.42 % | +0.00 |
| Brussels | /be/en/extra-services/meals/bon | 1440 | brussels-parity-004 | 4821 | 4810 | -0.23 % | order 27 | 4810 | -0.23 % | +0.00 |
| Brussels | /be/en/extra-services/meals/bon | 390 | brussels-parity-004 | 6894 | 6798 | -1.39 % | order 28 | 6798 | -1.39 % | +0.00 |
| Brussels | /be/en/extra-services/upgrades | 1440 | brussels-parity-001 | 3957 | 3967 | +0.25 % | order 27 | 3967 | +0.25 % | +0.00 |
| Brussels | /be/en/extra-services/upgrades | 390 | brussels-parity-001 | 6649 | 6668 | +0.29 % | order 28 | 6668 | +0.29 % | +0.00 |
| Brussels | /be/en/farealert/unsubscribe-failure | 1440 | brussels-parity-004 | 940 | 939 | -0.11 % | order 27 | 939 | -0.11 % | +0.00 |
| Brussels | /be/en/farealert/unsubscribe-failure | 390 | brussels-parity-004 | 1358 | 1357 | -0.07 % | order 28 | 1357 | -0.07 % | +0.00 |
| Brussels | /be/en/flying-with-us/romantic-getaways | 1440 | brussels-parity-004 | 5215 | 5179 | -0.69 % | order 27 | 5179 | -0.69 % | +0.00 |
| Brussels | /be/en/flying-with-us/romantic-getaways | 390 | brussels-parity-004 | 4887 | 4880 | -0.14 % | order 28 | 4880 | -0.14 % | +0.00 |
| Brussels | /be/en/homepage | 1440 | brussels-parity-001 | 4110 | 4038 | -1.75 % | order 27 | 4038 | -1.75 % | +0.00 |
| Brussels | /be/en/jobs/core-values | 1440 | brussels-parity-004 | 3068 | 3053 | -0.49 % | order 27 | 3053 | -0.49 % | +0.00 |
| Brussels | /be/en/jobs/mpl-cadet-program | 1440 | brussels-parity-004 | 6842 | 6873 | +0.45 % | order 27 | 6873 | +0.45 % | +0.00 |
| Brussels | /be/en/jobs/mpl-cadet-program | 390 | brussels-parity-004 | 9947 | 10072 | +1.26 % | order 28 | 10072 | +1.26 % | +0.00 |
| Brussels | /be/en/legal-notices | 1440 | brussels-parity-007 | 1428 | 1428 | +0.00 % | order 27 | 1428 | +0.00 % | +0.00 |
| Brussels | /be/en/legal-notices | 390 | brussels-parity-007 | 1867 | 1867 | +0.00 % | order 28 | 1867 | +0.00 % | +0.00 |
| Brussels | /be/en/legal-notices/brussels-airlines-responsible-disclosure-statement | 1440 | brussels-parity-007 | 1843 | 1829 | -0.76 % | order 27 | 1829 | -0.76 % | +0.00 |
| Brussels | /be/en/legal-notices/brussels-airlines-responsible-disclosure-statement | 390 | brussels-parity-007 | 2683 | 2670 | -0.48 % | order 28 | 2670 | -0.48 % | +0.00 |
| Brussels | /be/en/legal-notices/dsar-start | 1440 | brussels-parity-004 | 2983 | 2927 | -1.88 % | order 27 | 2927 | -1.88 % | +0.00 |
| Brussels | /be/en/legal-notices/dsar-start | 390 | brussels-parity-004 | 4096 | 4101 | +0.12 % | order 28 | 4101 | +0.12 % | +0.00 |
| Brussels | /be/en/legal-notices/israel-cancellation-policy | 1440 | brussels-parity-007 | 1697 | 1666 | -1.83 % | order 27 | 1666 | -1.83 % | +0.00 |
| Brussels | /be/en/legal-notices/israel-cancellation-policy | 390 | brussels-parity-007 | 2576 | 2532 | -1.71 % | order 28 | 2532 | -1.71 % | +0.00 |
| Brussels | /be/en/legal-notices/liability | 1440 | brussels-parity-007 | 1421 | 1407 | -0.99 % | order 27 | 1407 | -0.99 % | +0.00 |
| Brussels | /be/en/legal-notices/liability | 390 | brussels-parity-007 | 1844 | 1839 | -0.27 % | order 28 | 1839 | -0.27 % | +0.00 |
| Brussels | /be/en/legal-notices/privacy-notice-applicants | 1440 | brussels-parity-007 | 3331 | 3327 | -0.12 % | order 27 | 3327 | -0.12 % | +0.00 |
| Brussels | /be/en/legal-notices/privacy-notice-applicants | 390 | brussels-parity-007 | 5577 | 5583 | +0.11 % | order 28 | 5583 | +0.11 % | +0.00 |
| Brussels | /be/en/legal-notices/refund-for-cancelled-flights | 1440 | brussels-parity-007 | 1579 | 1577 | -0.13 % | order 27 | 1577 | -0.13 % | +0.00 |
| Brussels | /be/en/legal-notices/refund-for-cancelled-flights | 390 | brussels-parity-007 | 2388 | 2368 | -0.84 % | order 28 | 2368 | -0.84 % | +0.00 |
| Brussels | /be/en/legal-notices/short-notice-eu-us | 390 | brussels-parity-007 | 3064 | 3012 | -1.70 % | order 28 | 3012 | -1.70 % | +0.00 |
| Brussels | /be/en/legal-notices/terms-and-conditions-conditions-of-carriage | 1440 | brussels-parity-007 | 28478 | 28352 | -0.44 % | order 27 | 28352 | -0.44 % | +0.00 |
| Brussels | /be/en/legal-notices/terms-and-conditions-conditions-of-carriage | 390 | brussels-parity-007 | 59474 | 59226 | -0.42 % | order 28 | 59226 | -0.42 % | +0.00 |
| Brussels | /be/en/legal-notices/terms-of-use | 1440 | brussels-parity-007 | 4512 | 4492 | -0.44 % | order 27 | 4492 | -0.44 % | +0.00 |
| Brussels | /be/en/legal-notices/terms-of-use | 390 | brussels-parity-007 | 9481 | 9461 | -0.21 % | order 28 | 9461 | -0.21 % | +0.00 |
| Brussels | /be/en/legal-notices/travel-id | 1440 | brussels-parity-007 | 2305 | 2291 | -0.61 % | order 27 | 2291 | -0.61 % | +0.00 |
| Brussels | /be/en/legal-notices/travel-id | 390 | brussels-parity-007 | 3336 | 3326 | -0.30 % | order 28 | 3326 | -0.30 % | +0.00 |
| Brussels | /be/en/legal-notices/us-contingency-plan-for-lengthy-tarmac-delays | 1440 | brussels-parity-007 | 1694 | 1692 | -0.12 % | order 27 | 1692 | -0.12 % | +0.00 |
| Brussels | /be/en/legal-notices/us-contingency-plan-for-lengthy-tarmac-delays | 390 | brussels-parity-007 | 2447 | 2456 | +0.37 % | order 28 | 2456 | +0.37 % | +0.00 |
| Brussels | /be/en/legal-notices/us-customer-service-plan | 1440 | brussels-parity-007 | 1779 | 1763 | -0.90 % | order 27 | 1763 | -0.90 % | +0.00 |
| Brussels | /be/en/legal-notices/us-customer-service-plan | 390 | brussels-parity-007 | 2768 | 2734 | -1.23 % | order 28 | 2734 | -1.23 % | +0.00 |
| Brussels | /be/en/legal-notices/us-traveling-with-disabilities | 390 | brussels-parity-007 | 1874 | 1847 | -1.44 % | order 28 | 1847 | -1.44 % | +0.00 |
| Brussels | /be/en/legal-notices/voucher-conditions/terms-and-conditions-of-use-for-the-compensation-voucher | 1440 | brussels-parity-007 | 3696 | 3712 | +0.43 % | order 27 | 3712 | +0.43 % | +0.00 |
| Brussels | /be/en/legal-notices/voucher-conditions/terms-and-conditions-of-use-for-the-compensation-voucher | 390 | brussels-parity-007 | 7134 | 7156 | +0.31 % | order 28 | 7156 | +0.31 % | +0.00 |
| Brussels | /be/en/legal-notices/voucher-conditions/terms-and-conditions-of-use-for-the-refund-voucher | 1440 | brussels-parity-007 | 3518 | 3533 | +0.43 % | order 27 | 3533 | +0.43 % | +0.00 |
| Brussels | /be/en/legal-notices/voucher-conditions/terms-and-conditions-of-use-for-the-refund-voucher | 390 | brussels-parity-007 | 6536 | 6557 | +0.32 % | order 28 | 6557 | +0.32 % | +0.00 |
| Brussels | /be/en/lufthansa-group/lufthansa-group/ita-airways | 1440 | brussels-parity-004 | 3641 | 3582 | -1.62 % | order 27 | 3582 | -1.62 % | +0.00 |
| Brussels | /be/en/lufthansa-group/lufthansa-group/ita-airways | 390 | brussels-parity-004 | 5523 | 5515 | -0.14 % | order 28 | 5515 | -0.14 % | +0.00 |
| Brussels | /be/en/lufthansa-group/star-alliance | 1440 | brussels-parity-004 | 5842 | 5758 | -1.44 % | order 27 | 5758 | -1.44 % | +0.00 |
| Brussels | /be/en/lufthansa-group/star-alliance | 390 | brussels-parity-004 | 11057 | 11114 | +0.52 % | order 28 | 11114 | +0.52 % | +0.00 |
| Brussels | /be/en/my-bookings | 1440 | brussels-parity-001 | 1467 | 1494 | +1.84 % | order 27 | 1494 | +1.84 % | +0.00 |
| Brussels | /be/en/my-bookings/cancel-and-refund-requests | 390 | brussels-parity-004 | 2142 | 2118 | -1.12 % | order 28 | 2118 | -1.12 % | +0.00 |
| Brussels | /be/en/my-bookings/emergency-contact | 1440 | brussels-parity-004 | 2521 | 2522 | +0.04 % | order 27 | 2522 | +0.04 % | +0.00 |
| Brussels | /be/en/my-bookings/emergency-contact | 390 | brussels-parity-004 | 3197 | 3242 | +1.41 % | order 28 | 3242 | +1.41 % | +0.00 |
| Brussels | /be/en/our-company/organisation | 1440 | brussels-parity-004 | 3299 | 3340 | +1.24 % | order 27 | 3340 | +1.24 % | +0.00 |
| Brussels | /be/en/our-company/organisation | 390 | brussels-parity-004 | 5218 | 5257 | +0.75 % | order 28 | 5257 | +0.75 % | +0.00 |
| Brussels | /be/en/travel-classes | 1440 | brussels-parity-006 | 1333 | 1310 | -1.73 % | order 27 | 1310 | -1.73 % | +0.00 |
| Brussels | /be/en/travel-classes | 390 | brussels-parity-001 | 2380 | 2423 | +1.81 % | order 28 | 2423 | +1.81 % | +0.00 |
| Brussels | /be/en/travel-classes/economy | 1440 | brussels-parity-003 | 3186 | 3127 | -1.85 % | order 27 | 3127 | -1.85 % | +0.00 |
| Brussels | /be/en/travel-comfortably-from-lille | 1440 | brussels-parity-004 | 3130 | 3140 | +0.32 % | order 27 | 3140 | +0.32 % | +0.00 |
| Brussels | /be/en/travel-comfortably-from-lille | 390 | brussels-parity-004 | 5179 | 5263 | +1.62 % | order 28 | 5263 | +1.62 % | +0.00 |
| Brussels | /be/fr/articles | 1440 | brussels-parity-003 | 4740 | 4821 | +1.71 % | order 27 | 4821 | +1.71 % | +0.00 |
| Brussels | /be/fr/articles | 390 | brussels-parity-003 | 8049 | 8188 | +1.73 % | order 28 | 8188 | +1.73 % | +0.00 |
| Brussels | /be/fr/articles/lyon | 1440 | brussels-parity-001 | 9723 | 9817 | +0.97 % | order 27 | 9817 | +0.97 % | +0.00 |
| Brussels | /be/fr/articles/lyon | 390 | brussels-parity-001 | 7690 | 7691 | +0.01 % | order 28 | 7691 | +0.01 % | +0.00 |
| Brussels | /be/fr/articles/milan-citytrip | 1440 | brussels-parity-003 | 6007 | 6002 | -0.08 % | order 27 | 6002 | -0.08 % | +0.00 |
| Brussels | /be/fr/articles/milan-citytrip | 390 | brussels-parity-003 | 8693 | 8637 | -0.64 % | order 28 | 8637 | -0.64 % | +0.00 |
| Brussels | /be/fr/articles/vibrant-senegal | 1440 | brussels-parity-009 | 10887 | 10981 | +0.86 % | order 27 | 10981 | +0.86 % | +0.00 |
| Brussels | /be/fr/articles/vibrant-senegal | 390 | brussels-parity-009 | 16435 | 16499 | +0.39 % | order 28 | 16499 | +0.39 % | +0.00 |
| Brussels | /be/fr/book-a-flight | 390 | brussels-parity-001 | 3147 | 3142 | -0.16 % | order 28 | 3142 | -0.16 % | +0.00 |
| Brussels | /be/fr/book-a-flight/connecting-africa | 1440 | brussels-parity-001 | 4106 | 4069 | -0.90 % | order 27 | 4069 | -0.90 % | +0.00 |
| Brussels | /be/fr/book-a-flight/connecting-africa | 390 | brussels-parity-001 | 7872 | 7858 | -0.18 % | order 28 | 7858 | -0.18 % | +0.00 |
| Brussels | /be/fr/check-in-options-and-info | 1440 | brussels-parity-001 | 1708 | 1684 | -1.41 % | order 27 | 1684 | -1.41 % | +0.00 |
| Brussels | /be/fr/contact | 1440 | brussels-parity-001 | 1715 | 1734 | +1.11 % | order 27 | 1734 | +1.11 % | +0.00 |
| Brussels | /be/fr/contact | 390 | brussels-parity-001 | 2466 | 2456 | -0.41 % | order 28 | 2456 | -0.41 % | +0.00 |
| Brussels | /be/fr/contact/feedback | 1440 | brussels-parity-006 | 1465 | 1462 | -0.20 % | order 27 | 1462 | -0.20 % | +0.00 |
| Brussels | /be/fr/contact/feedback | 390 | brussels-parity-006 | 2049 | 2025 | -1.17 % | order 28 | 2025 | -1.17 % | +0.00 |
| Brussels | /be/fr/extra-services/baggage | 1440 | brussels-parity-006 | 1734 | 1708 | -1.50 % | order 27 | 1708 | -1.50 % | +0.00 |
| Brussels | /be/fr/extra-services/baggage | 390 | brussels-parity-006 | 3701 | 3700 | -0.03 % | order 28 | 3700 | -0.03 % | +0.00 |
| Brussels | /be/fr/extra-services/baggage/problems-with-your-baggage | 1440 | brussels-parity-004 | 2619 | 2600 | -0.73 % | order 27 | 2600 | -0.73 % | +0.00 |
| Brussels | /be/fr/extra-services/baggage/problems-with-your-baggage | 390 | brussels-parity-004 | 3789 | 3781 | -0.21 % | order 28 | 3781 | -0.21 % | +0.00 |
| Brussels | /be/fr/extra-services/meals | 1440 | brussels-parity-001 | 1630 | 1631 | +0.06 % | order 27 | 1631 | +0.06 % | +0.00 |
| Brussels | /be/fr/extra-services/upgrades | 1440 | brussels-parity-001 | 4136 | 4124 | -0.29 % | order 27 | 4124 | -0.29 % | +0.00 |
| Brussels | /be/fr/extra-services/upgrades | 390 | brussels-parity-001 | 7185 | 7239 | +0.75 % | order 28 | 7239 | +0.75 % | +0.00 |
| Brussels | /be/fr/homepage | 1440 | brussels-parity-001 | 4197 | 4159 | -0.91 % | order 27 | 4159 | -0.91 % | +0.00 |
| Brussels | /be/fr/legal-notices | 1440 | brussels-parity-009 | 1466 | 1469 | +0.20 % | order 27 | 1469 | +0.20 % | +0.00 |
| Brussels | /be/fr/legal-notices | 390 | brussels-parity-009 | 1971 | 1980 | +0.46 % | order 28 | 1980 | +0.46 % | +0.00 |
| Brussels | /be/fr/my-bookings | 1440 | brussels-parity-001 | 1521 | 1548 | +1.78 % | order 27 | 1548 | +1.78 % | +0.00 |
| Brussels | /be/fr/travel-classes | 1440 | brussels-parity-001 | 1336 | 1336 | +0.00 % | order 27 | 1336 | +0.00 % | +0.00 |
| Brussels | /be/fr/travel-classes | 390 | brussels-parity-001 | 2472 | 2427 | -1.82 % | order 28 | 2427 | -1.82 % | +0.00 |
| Brussels | /be/fr/travel-classes/business | 1440 | brussels-parity-003 | 6458 | 6449 | -0.14 % | order 27 | 6449 | -0.14 % | +0.00 |
| Brussels | /be/fr/travel-classes/premium-economy | 1440 | brussels-parity-003 | 4620 | 4664 | +0.95 % | order 27 | 4664 | +0.95 % | +0.00 |
| Brussels | /be/fr/travel-classes/premium-economy | 390 | brussels-parity-003 | 6224 | 6257 | +0.53 % | order 28 | 6257 | +0.53 % | +0.00 |
| Brussels | /be/nl/contact/service-charges | 390 | brussels-parity-006 | 2177 | 2137 | -1.84 % | order 28 | 2137 | -1.84 % | +0.00 |
| Brussels | /be/nl/extra-services/baggage/checked-baggage | 1440 | brussels-parity-005 | 3992 | 3928 | -1.60 % | order 27 | 3928 | -1.60 % | +0.00 |
| Brussels | /be/nl/extra-services/baggage/checked-baggage | 390 | brussels-parity-011 | 4902 | 4844 | -1.18 % | order 28 | 4844 | -1.18 % | +0.00 |
| Brussels | /be/nl/special-care/pets | 1440 | brussels-parity-006 | 1728 | 1702 | -1.50 % | order 27 | 1702 | -1.50 % | +0.00 |
| Brussels | /de/de/extra-services/baggage/checked-baggage | 1440 | brussels-parity-005 | 3992 | 3928 | -1.60 % | order 27 | 3928 | -1.60 % | +0.00 |
| Brussels | /de/de/extra-services/baggage/checked-baggage | 390 | brussels-parity-011 | 4969 | 4892 | -1.55 % | order 28 | 4892 | -1.55 % | +0.00 |
| Brussels | /de/de/extra-services/lounges | 1440 | brussels-parity-006 | 1344 | 1347 | +0.22 % | order 27 | 1347 | +0.22 % | +0.00 |
| Brussels | /de/de/extra-services/lounges | 390 | brussels-parity-006 | 2401 | 2447 | +1.92 % | order 28 | 2447 | +1.92 % | +0.00 |
| Brussels | /de/de/legal-notices/dsar-start | 390 | brussels-parity-006 | 4798 | 4717 | -1.69 % | order 28 | 4717 | -1.69 % | +0.00 |
| Brussels | /es/es/extra-services/baggage/checked-baggage | 1440 | brussels-parity-005 | 4016 | 4000 | -0.40 % | order 27 | 4000 | -0.40 % | +0.00 |
| Brussels | /es/es/extra-services/baggage/checked-baggage | 390 | brussels-parity-011 | 4919 | 4837 | -1.67 % | order 28 | 4837 | -1.67 % | +0.00 |
| Brussels | /es/es/plan-your-trip | 1440 | brussels-parity-006 | 1629 | 1626 | -0.18 % | order 27 | 1626 | -0.18 % | +0.00 |
| Brussels | /es/es/plan-your-trip | 390 | brussels-parity-006 | 2901 | 2924 | +0.79 % | order 28 | 2924 | +0.79 % | +0.00 |
| Brussels | /fr/fr/homepage | 1440 | brussels-parity-003 | 4214 | 4146 | -1.61 % | order 27 | 4146 | -1.61 % | +0.00 |
| Brussels | /il/en/rebooking-request-birthright | 390 | brussels-parity-004 | 2848 | 2899 | +1.79 % | order 28 | 2899 | +1.79 % | +0.00 |
| Brussels | /it/it/extra-services/baggage/checked-baggage | 1440 | brussels-parity-005 | 4016 | 3952 | -1.59 % | order 27 | 3952 | -1.59 % | +0.00 |
| Brussels | /it/it/extra-services/baggage/checked-baggage | 390 | brussels-parity-011 | 4914 | 4861 | -1.08 % | order 28 | 4861 | -1.08 % | +0.00 |
| Brussels | /it/it/extra-services/meals | 1440 | brussels-parity-006 | 1611 | 1631 | +1.24 % | order 27 | 1631 | +1.24 % | +0.00 |
| Discover | /de/de/book/baggage | 1440 | discover-parity-001 | 4158 | 4088 | -1.68 % | order 27 | 4088 | -1.68 % | +0.00 |
| Discover | /de/de/book/baggage | 390 | discover-parity-001 | 5383 | 5383 | +0.00 % | order 28 | 5383 | +0.00 % | +0.00 |
| Discover | /de/de/book/flights/flight-search | 1440 | discover-parity-001 | 1305 | 1304 | -0.08 % | order 27 | 1304 | -0.08 % | +0.00 |
| Discover | /de/de/book/flights/flight-search | 390 | discover-parity-001 | 1962 | 1958 | -0.20 % | order 28 | 1958 | -0.20 % | +0.00 |
| Discover | /de/de/book/special-requests/families | 1440 | discover-parity-001 | 5658 | 5704 | +0.81 % | order 27 | 5704 | +0.81 % | +0.00 |
| Discover | /de/de/book/special-requests/families | 390 | discover-parity-001 | 8148 | 8206 | +0.71 % | order 28 | 8206 | +0.71 % | +0.00 |
| Discover | /de/de/discover/services-on-board/entertainment | 1440 | discover-parity-001 | 3612 | 3586 | -0.72 % | order 27 | 3586 | -0.72 % | +0.00 |
| Discover | /de/de/discover/travel-classes/business-class | 1440 | discover-parity-001 | 4203 | 4217 | +0.33 % | order 27 | 4217 | +0.33 % | +0.00 |
| Discover | /de/de/discover/travel-classes/business-class | 390 | discover-parity-001 | 3071 | 3075 | +0.13 % | order 28 | 3075 | +0.13 % | +0.00 |
| Discover | /de/de/homepage | 1440 | discover-parity-001 | 4260 | 4216 | -1.03 % | order 27 | 4216 | -1.03 % | +0.00 |
| Discover | /de/de/homepage | 390 | discover-parity-001 | 5550 | 5551 | +0.02 % | order 28 | 5551 | +0.02 % | +0.00 |
| Discover | /de/de/my-bookings/check-in | 1440 | discover-parity-001 | 2335 | 2351 | +0.69 % | order 27 | 2351 | +0.69 % | +0.00 |
| Discover | /de/de/my-bookings/check-in | 390 | discover-parity-001 | 2985 | 2990 | +0.17 % | order 28 | 2990 | +0.17 % | +0.00 |
| Discover | /de/de/my-bookings/check-in/check-in-at-the-airport | 1440 | discover-parity-001 | 4079 | 4077 | -0.05 % | order 27 | 4077 | -0.05 % | +0.00 |
| Discover | /de/de/my-bookings/check-in/check-in-at-the-airport | 390 | discover-parity-001 | 2117 | 2094 | -1.09 % | order 28 | 2094 | -1.09 % | +0.00 |
| Discover | /de/de/my-bookings/manage/customer-service | 1440 | discover-parity-001 | 4302 | 4352 | +1.16 % | order 27 | 4352 | +1.16 % | +0.00 |
| Discover | /de/de/my-bookings/manage/customer-service | 390 | discover-parity-001 | 6322 | 6229 | -1.47 % | order 28 | 6229 | -1.47 % | +0.00 |
| Discover | /de/de/my-bookings/services/additional-services | 1440 | discover-parity-001 | 4093 | 4052 | -1.00 % | order 27 | 4052 | -1.00 % | +0.00 |
| Discover | /de/de/my-bookings/services/additional-services | 390 | discover-parity-001 | 4571 | 4535 | -0.79 % | order 28 | 4535 | -0.79 % | +0.00 |
| Discover | /de/de/travel-inspiration/inspiration/destinations/punta-cana | 1440 | discover-parity-001 | 4666 | 4684 | +0.39 % | order 27 | 4684 | +0.39 % | +0.00 |
| Discover | /de/de/travel-inspiration/inspiration/destinations/punta-cana | 390 | discover-parity-001 | 5485 | 5558 | +1.33 % | order 28 | 5558 | +1.33 % | +0.00 |
| Discover | /de/de/travel-inspiration/inspiration/destinations/santorini | 1440 | discover-parity-001 | 7666 | 7790 | +1.62 % | order 27 | 7790 | +1.62 % | +0.00 |
| Discover | /de/de/travel-inspiration/inspiration/destinations/santorini | 390 | discover-parity-001 | 9275 | 9347 | +0.78 % | order 28 | 9347 | +0.78 % | +0.00 |
| Discover | /de/en/book/baggage | 1440 | discover-parity-001 | 4196 | 4163 | -0.79 % | order 27 | 4163 | -0.79 % | +0.00 |
| Discover | /de/en/book/baggage | 390 | discover-parity-001 | 5449 | 5461 | +0.22 % | order 28 | 5461 | +0.22 % | +0.00 |
| Discover | /de/en/book/baggage/excess-baggage | 1440 | discover-parity-004 | 2701 | 2715 | +0.52 % | order 27 | 2715 | +0.52 % | +0.00 |
| Discover | /de/en/book/baggage/excess-baggage | 390 | discover-parity-004 | 2487 | 2472 | -0.60 % | order 28 | 2472 | -0.60 % | +0.00 |
| Discover | /de/en/book/flights/flight-search | 1440 | discover-parity-001 | 1367 | 1366 | -0.07 % | order 27 | 1366 | -0.07 % | +0.00 |
| Discover | /de/en/book/special-requests/families | 1440 | discover-parity-001 | 5698 | 5615 | -1.46 % | order 27 | 5615 | -1.46 % | +0.00 |
| Discover | /de/en/book/special-requests/families | 390 | discover-parity-001 | 8108 | 8226 | +1.46 % | order 28 | 8226 | +1.46 % | +0.00 |
| Discover | /de/en/discover/services-on-board/entertainment | 390 | discover-parity-001 | 5482 | 5554 | +1.31 % | order 28 | 5554 | +1.31 % | +0.00 |
| Discover | /de/en/discover/travel-classes/business-class | 1440 | discover-parity-004 | 4233 | 4217 | -0.38 % | order 27 | 4217 | -0.38 % | +0.00 |
| Discover | /de/en/discover/travel-classes/business-class | 390 | discover-parity-004 | 3193 | 3218 | +0.78 % | order 28 | 3218 | +0.78 % | +0.00 |
| Discover | /de/en/homepage | 1440 | discover-parity-001 | 4285 | 4287 | +0.05 % | order 27 | 4287 | +0.05 % | +0.00 |
| Discover | /de/en/homepage | 390 | discover-parity-001 | 5648 | 5666 | +0.32 % | order 28 | 5666 | +0.32 % | +0.00 |
| Discover | /de/en/my-bookings/check-in | 1440 | discover-parity-001 | 2373 | 2389 | +0.67 % | order 27 | 2389 | +0.67 % | +0.00 |
| Discover | /de/en/my-bookings/check-in | 390 | discover-parity-001 | 3153 | 3176 | +0.73 % | order 28 | 3176 | +0.73 % | +0.00 |
| Discover | /de/en/my-bookings/check-in/check-in-at-the-airport | 1440 | discover-parity-001 | 4033 | 4031 | -0.05 % | order 27 | 4031 | -0.05 % | +0.00 |
| Discover | /de/en/my-bookings/check-in/check-in-at-the-airport | 390 | discover-parity-001 | 2303 | 2298 | -0.22 % | order 28 | 2298 | -0.22 % | +0.00 |
| Discover | /de/en/my-bookings/manage/customer-service | 1440 | discover-parity-001 | 4375 | 4414 | +0.89 % | order 27 | 4414 | +0.89 % | +0.00 |
| Discover | /de/en/my-bookings/manage/customer-service | 390 | discover-parity-001 | 6316 | 6297 | -0.30 % | order 28 | 6297 | -0.30 % | +0.00 |
| Discover | /de/en/my-bookings/services/additional-services | 1440 | discover-parity-001 | 3656 | 3672 | +0.44 % | order 27 | 3672 | +0.44 % | +0.00 |
| Discover | /de/en/my-bookings/services/additional-services | 390 | discover-parity-001 | 4386 | 4402 | +0.36 % | order 28 | 4402 | +0.36 % | +0.00 |
| Discover | /de/en/travel-inspiration/inspiration/destinations/punta-cana | 1440 | discover-parity-001 | 4689 | 4679 | -0.21 % | order 27 | 4679 | -0.21 % | +0.00 |
| Discover | /de/en/travel-inspiration/inspiration/destinations/santorini | 1440 | discover-parity-001 | 7656 | 7732 | +0.99 % | order 27 | 7732 | +0.99 % | +0.00 |
| Discover | /de/en/travel-inspiration/inspiration/destinations/santorini | 390 | discover-parity-001 | 9123 | 9192 | +0.76 % | order 28 | 9192 | +0.76 % | +0.00 |
| SWISS | /ch/de/book-and-manage/overview-extra-services | 1440 | swiss-parity-001 | 3071 | 3037 | -1.11 % | order 27 | 3037 | -1.11 % | +0.00 |
| SWISS | /ch/de/book-and-manage/overview-extra-services | 390 | swiss-parity-001 | 6423 | 6414 | -0.14 % | order 28 | 6414 | -0.14 % | +0.00 |
| SWISS | /ch/de/book-and-manage/overview-manage | 1440 | swiss-parity-001 | 2437 | 2405 | -1.31 % | order 27 | 2405 | -1.31 % | +0.00 |
| SWISS | /ch/de/book-and-manage/overview-manage | 390 | swiss-parity-001 | 4851 | 4865 | +0.29 % | order 28 | 4865 | +0.29 % | +0.00 |
| SWISS | /ch/de/discover/overview-inspiration | 1440 | swiss-parity-001 | 1465 | 1439 | -1.77 % | order 27 | 1439 | -1.77 % | +0.00 |
| SWISS | /ch/de/discover/overview-inspiration | 390 | swiss-parity-001 | 2645 | 2644 | -0.04 % | order 28 | 2644 | -0.04 % | +0.00 |
| SWISS | /ch/de/fly/on-board | 1440 | swiss-parity-001 | 1448 | 1421 | -1.86 % | order 27 | 1421 | -1.86 % | +0.00 |
| SWISS | /ch/de/fly/on-board | 390 | swiss-parity-001 | 2235 | 2256 | +0.94 % | order 28 | 2256 | +0.94 % | +0.00 |
| SWISS | /ch/de/fly/on-board/travel-classes | 1440 | swiss-parity-001 | 1988 | 1960 | -1.41 % | order 27 | 1960 | -1.41 % | +0.00 |
| SWISS | /ch/de/fly/on-board/travel-classes | 390 | swiss-parity-001 | 2741 | 2717 | -0.88 % | order 28 | 2717 | -0.88 % | +0.00 |
| SWISS | /ch/de/prepare/overview-flights | 1440 | swiss-parity-001 | 1892 | 1880 | -0.63 % | order 27 | 1880 | -0.63 % | +0.00 |
| SWISS | /ch/de/prepare/overview-flights | 390 | swiss-parity-001 | 3374 | 3382 | +0.24 % | order 28 | 3382 | +0.24 % | +0.00 |
| SWISS | /ch/de/prepare/overview-travel-information | 1440 | swiss-parity-001 | 1944 | 1916 | -1.44 % | order 27 | 1916 | -1.44 % | +0.00 |
| SWISS | /ch/de/prepare/overview-travel-information | 390 | swiss-parity-001 | 3453 | 3449 | -0.12 % | order 28 | 3449 | -0.12 % | +0.00 |
| SWISS | /ch/de/prepare/special-care | 1440 | swiss-parity-001 | 1966 | 1938 | -1.42 % | order 27 | 1938 | -1.42 % | +0.00 |
| SWISS | /ch/de/prepare/special-care | 390 | swiss-parity-001 | 3585 | 3584 | -0.03 % | order 28 | 3584 | -0.03 % | +0.00 |
| SWISS | /ch/en/book-and-manage | 1440 | swiss-parity-005 | 1272 | 1269 | -0.24 % | order 27 | 1269 | -0.24 % | +0.00 |
| SWISS | /ch/en/book-and-manage | 390 | swiss-parity-005 | 1776 | 1769 | -0.39 % | order 28 | 1769 | -0.39 % | +0.00 |
| SWISS | /ch/en/book-and-manage/overview-extra-services | 1440 | swiss-parity-001 | 2956 | 2949 | -0.24 % | order 27 | 2949 | -0.24 % | +0.00 |
| SWISS | /ch/en/book-and-manage/overview-extra-services | 390 | swiss-parity-001 | 6203 | 6171 | -0.52 % | order 28 | 6171 | -0.52 % | +0.00 |
| SWISS | /ch/en/book-and-manage/overview-manage | 1440 | swiss-parity-001 | 2362 | 2357 | -0.21 % | order 27 | 2357 | -0.21 % | +0.00 |
| SWISS | /ch/en/book-and-manage/overview-manage | 390 | swiss-parity-001 | 4719 | 4711 | -0.17 % | order 28 | 4711 | -0.17 % | +0.00 |
| SWISS | /ch/en/discover/overview-inspiration | 1440 | swiss-parity-001 | 1394 | 1394 | +0.00 % | order 27 | 1394 | +0.00 % | +0.00 |
| SWISS | /ch/en/discover/overview-inspiration | 390 | swiss-parity-001 | 2557 | 2575 | +0.70 % | order 28 | 2575 | +0.70 % | +0.00 |
| SWISS | /ch/en/fly/on-board | 1440 | swiss-parity-001 | 1399 | 1399 | +0.00 % | order 27 | 1399 | +0.00 % | +0.00 |
| SWISS | /ch/en/fly/on-board | 390 | swiss-parity-001 | 2191 | 2212 | +0.96 % | order 28 | 2212 | +0.96 % | +0.00 |
| SWISS | /ch/en/fly/on-board/travel-classes | 1440 | swiss-parity-001 | 1938 | 1938 | +0.00 % | order 27 | 1938 | +0.00 % | +0.00 |
| SWISS | /ch/en/fly/on-board/travel-classes | 390 | swiss-parity-001 | 2697 | 2673 | -0.89 % | order 28 | 2673 | -0.89 % | +0.00 |
| SWISS | /ch/en/prepare | 1440 | swiss-parity-005 | 1268 | 1269 | +0.08 % | order 27 | 1269 | +0.08 % | +0.00 |
| SWISS | /ch/en/prepare | 390 | swiss-parity-005 | 1732 | 1753 | +1.21 % | order 28 | 1753 | +1.21 % | +0.00 |
| SWISS | /ch/en/prepare/overview-flights | 1440 | swiss-parity-001 | 1862 | 1861 | -0.05 % | order 27 | 1861 | -0.05 % | +0.00 |
| SWISS | /ch/en/prepare/overview-flights | 390 | swiss-parity-001 | 3328 | 3316 | -0.36 % | order 28 | 3316 | -0.36 % | +0.00 |
| SWISS | /ch/en/prepare/overview-travel-information | 1440 | swiss-parity-001 | 1916 | 1916 | +0.00 % | order 27 | 1916 | +0.00 % | +0.00 |
| SWISS | /ch/en/prepare/overview-travel-information | 390 | swiss-parity-001 | 3387 | 3405 | +0.53 % | order 28 | 3405 | +0.53 % | +0.00 |
| SWISS | /ch/en/prepare/special-care | 1440 | swiss-parity-001 | 1938 | 1938 | +0.00 % | order 27 | 1938 | +0.00 % | +0.00 |
| SWISS | /ch/en/prepare/special-care | 390 | swiss-parity-001 | 3497 | 3499 | +0.06 % | order 28 | 3499 | +0.06 % | +0.00 |
| SWISS | /magazine/de | 1440 | swiss-parity-001 | 6975 | 6901 | -1.06 % | order 27 | 6901 | -1.06 % | +0.00 |
| Group for Business | /de/en/program/experts | 390 | b2b-parity-001 | 9638 | 9574 | -0.66 % | order 28 | 9582 | -0.58 % | -0.08 |

## Video-gallery 390 against its phone first load

b2b-parity-016 (sha256 9ebf4357ffceea3b1f4b5b90827696094ed167de4ced55e2e2462cd874bda169, equal to its sidecar; not yet named) records /de/en/allegris/video-gallery at 390 as its own first load: www 3745, the same as the resize. The drafted ending row (the page metadata moved into the closing grey section, so the empty last section goes) still takes 390 from 3733 to 3709 (-0.32 -> -0.96 %, 0.64 points further). It fails the band-end gate against the first load as well, so no row is written. 1440 stays +2.07 %: the closing grey band meets the footer on www, which no row or rule that passes the gate gives us (order 25).
