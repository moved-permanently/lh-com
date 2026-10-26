# Block library check

2026-10-26. 91 library variants: 78 OK on the named pages, 12 with named pages that differ, 0 with a library error, 1 notes. "Blocks differing" counts every block of the variant on all pages that does not resolve against the library table (tools/reports/block-library.json lists them); "Other rows" counts rows of multi blocks with another cell count than the item (label, intro or config rows), which the sidebar shows as items without editable fields.

| Variant | Result | Detail | Blocks differing / all | Other rows (multi) |
| --- | --- | --- | --- | --- |
| accordion-columns | PAGES | /de/en/discover-lufthansa/miles-and-more-credit-card: row 1 cell 2: 6 fields, the library 8 \| /de/de/discover-lufthansa/miles-and-more-credit-card: row 1 cell 2: 6 fields, the library 8 \| /at/de/discover-lufthansa/miles-and-more-credit-card: row 1 cell 2: 6 fields, the library 8 | 4 / 8 |  |
| accordion-columns (faq) | PAGES | /de/en/advance-seat-reservation: row 1 cell 2 "Text": list, the library text \| /de/de/advance-seat-reservation: row 1 cell 2 "Text": list, the library text \| /at/de/advance-seat-reservation: row 1 cell 2 "Text": list, the library text | 18 / 107 |  |
| accordion-columns (spaced) | PAGES | /de/de/dangerous-dogs: row 1 cell 2 "Text": list, the library text \| /at/de/dangerous-dogs: row 1 cell 2 "Text": list, the library text | 8 / 32 |  |
| accordion-columns (faq, spaced) | OK | checked /de/en/bid-upgrade, /de/de/bid-upgrade, /at/de/bid-upgrade | 48 / 140 |  |
| accordion-columns (faq, limited-width) | OK | checked /de/en/addresses-worldwide, /de/de/adressen-weltweit, /at/de/adressen-weltweit | 8 / 44 |  |
| accordion-columns (faq, column) | OK | checked /de/en/articles/explore-the-world, /de/de/articles/explore-the-world, /at/de/articles/explore-the-world | 12 / 36 |  |
| accordion-columns (faq, limited-width, spaced) | OK | checked /de/en/baggage-irregularities, /de/de/baggage-irregularities, /at/de/baggage-irregularities | 8 / 98 |  |
| app-article-list | OK | checked /content/mobile/lh/de/articles/africa | 0 / 14 |  |
| app-links | OK | checked /content/mobile/lh/de/articles/a-perfect-day-in-chicago | 0 / 130 |  |
| app-offer | OK | checked /content/mobile/lh/de/articles/a-perfect-day-in-chicago | 0 / 50 |  |
| app-service | OK | checked /content/mobile/lh/de/homepage | 0 / 2 |  |
| app-teaser-slider | OK | checked /content/mobile/lh/de/homepage | 0 / 2 |  |
| article-header | OK | checked /de/en/articles/explore-flying/7-people-who-shaped-lufthansa-history, /de/de/articles/explore-flying/7-people-who-shaped-lufthansa-history, /at/de/articles/explore-flying/7-people-who-shaped-lufthansa-history | 0 / 2036 |  |
| article-header [Article header with video] | OK | checked /de/en/articles/explore-flying/allegris-first-class-reasons-for-allegris-first-class, /de/de/articles/explore-flying/allegris-first-class-reasons-for-allegris-first-class, /at/de/articles/explore-flying/allegris-first-class-reasons-for-allegris-first-class | 0 / 194 |  |
| blog-overview | OK | checked /de/en/articles/authors/alexandra-mikamo, /de/de/articles/authors/alexandra-mikamo, /at/de/articles/authors/alexandra-mikamo | 28 / 527 |  |
| booking-lookup | OK | checked /de/en/online-check-in, /de/de/online-check-in, /at/de/online-check-in | 0 / 4 |  |
| booking-lookup (my-bookings) | OK | checked /de/en/book-and-manage/booking-services/manage-my-bookings, /de/de/book-and-manage/booking-services/manage-my-bookings, /at/de/book-and-manage/booking-services/manage-my-bookings | 0 / 4 |  |
| car-rental | OK | checked /de/en/europcar, /de/de/europcar, /at/de/europcar | 0 / 16 |  |
| cards-icon-text (partner) | OK | checked /de/en/digital-self-services, /de/de/digital-self-services, /at/de/digital-self-services | 0 / 34 |  |
| cards-icon | OK | checked /de/en/homepage, /de/de/homepage, /at/de/homepage | 0 / 4 |  |
| cards-icon (usp) | OK | checked /de/en/additional-services, /de/de/additional-services, /at/de/additional-services | 0 / 12 |  |
| cards-icon (usp, four-up) | OK | checked /de/en/additional-services, /de/de/additional-services, /at/de/additional-services | 0 / 8 |  |
| cards-steps | OK | checked /de/en/online-check-in, /de/de/online-check-in, /at/de/online-check-in | 0 / 4 |  |
| cards-teaser | OK | checked /de/en/100-years/cabin-design, /de/de/100-years/cabin-design, /at/de/100-years/cabin-design | 8 / 74 |  |
| cards-teaser (three-up) | OK | checked /de/en/baggage, /de/de/digital-self-services, /at/de/digital-self-services | 0 / 24 |  |
| cards-teaser (overlay) | OK | checked /de/en/articles/explore-flying, /de/de/articles/explore-flying, /at/de/articles/explore-flying | 0 / 20 |  |
| cards-teaser (four-up) | OK | checked /de/en/airport-information, /de/de/flughafeninformation, /at/de/flughafeninformation | 0 / 4 |  |
| cards-teaser (three-up, overlay) | OK | checked /de/en/articles/highlights-european-championship, /de/de/articles/highlights-european-championship, /at/de/articles/highlights-european-championship | 0 / 499 |  |
| cards | OK | checked /index | 0 / 1 |  |
| carousel-cards | OK | checked /de/en/homepage, /de/de/homepage, /at/de/homepage | 0 / 4 |  |
| carousel-cards (article) | OK | checked /de/en/articles/explore-flying/a-girl-named-lufthansa, /de/de/articles/explore-flying/a-girl-named-lufthansa, /at/de/articles/explore-flying/a-girl-named-lufthansa | 220 / 552 |  |
| carousel-cards (grid) | OK | checked /de/en/accessible-travel, /de/de/accessible-travel, /at/de/accessible-travel | 12 / 96 |  |
| carousel-cards (four-up) | OK | checked /de/en/320, /de/de/320, /at/de/320 | 0 / 74 | 240 |
| carousel-cards (grid, four-up) | OK | checked /de/en/accessible-travel, /de/de/accessible-travel, /at/de/accessible-travel | 6 / 44 |  |
| carousel-cards (four-up, authors) | NOTE | no fields: multi block whose pages have no rows (the extension needs a first item) | - / 36 pages |  |
| carousel-cards (grid, two-up) | OK | checked /de/en/food-and-beverages, /de/de/speisen-und-getraenke, /at/de/speisen-und-getraenke | 0 / 4 |  |
| carousel-images | OK | checked /de/en/100-years/cabin-design, /de/de/100-years/cabin-design, /at/de/100-years/cabin-design | 0 / 256 |  |
| carousel-lightbox | OK | checked /de/en/320, /de/de/320, /at/de/320 | 6 / 20 |  |
| carousel-lightbox (half) | OK | checked /de/en/744, /de/de/744, /at/de/744 | 0 / 8 |  |
| columns-logos | OK | checked /de/en/fragments/payment-social, /de/de/fragments/payment-social, /at/de/fragments/payment-social | 0 / 8 |  |
| columns-media | PAGES | /de/en/100-years/cabin-design: row 1 cell 1 "Image": text, the library image; row 1 cell 2 "Text": image, the library text \| /de/de/100-years/cabin-design: row 1 cell 1 "Image": text, the library image; row 1 cell 2 "Text": image, the library text \| /at/de/100-years/cabin-design: row 1 cell 1 "Image": text, the library image; row 1 cell 2 "Text": image, the library text | 884 / 3452 |  |
| columns-media (stacked) | OK | checked /de/en/articles/explore-flying/a-girl-named-lufthansa, /de/de/articles/explore-flying/a-girl-named-lufthansa, /at/de/articles/explore-flying/a-girl-named-lufthansa | 0 / 1226 |  |
| columns-media (padded) | PAGES | /de/en/100-years/cabin-design: row 1 cell 1 "Image": text, the library image; row 1 cell 2 "Text": image, the library text \| /de/de/100-years/cabin-design: row 1 cell 1 "Image": text, the library image; row 1 cell 2 "Text": image, the library text \| /at/de/100-years/cabin-design: row 1 cell 1 "Image": text, the library image; row 1 cell 2 "Text": image, the library text | 674 / 1103 |  |
| columns-media (sidebar) | OK | checked /de/en/100-years/cabin-design, /de/de/100-years/cabin-design, /at/de/100-years/cabin-design | 152 / 314 |  |
| columns-media (nested-2) | OK | checked /de/en/passengers-with-sensory-impairment, /de/de/digital-travel-companion, /at/de/digital-travel-companion | 0 / 6 |  |
| columns-media (cell-slider) | OK | checked /de/en/onboard-delights, /de/de/onboard-delights, /at/de/onboard-delights | 0 / 4 |  |
| columns-media (slider) | OK | checked /de/en/online-check-in, /de/de/online-check-in, /at/de/online-check-in | 0 / 4 |  |
| columns-media (nested-4, padded) | OK | checked /de/en/shopping, /de/de/shopping, /at/de/shopping | 0 / 4 |  |
| columns-media (stacked, padded) | OK | checked /de/en/onboard-delights, /de/de/onboard-delights, /at/de/onboard-delights | 0 / 4 |  |
| columns-media (sidebar, padded, before-padded) | OK | checked /de/en/100-years, /de/de/100-years, /at/de/100-years | 0 / 4 |  |
| columns | OK | checked /index | 0 / 1 |  |
| destination-finder | PAGES | /de/en/homepage: 10 rows, the library has 7 | 1 / 4 |  |
| destination-finder (grid) | PAGES | /at/de/fluege: 5 rows, the library has 7 | 1 / 4 |  |
| destination-offer | OK | checked /de/en/book-and-manage/destination, /de/de/book-and-manage/destination, /at/de/book-and-manage/destination | 0 / 4 |  |
| ejournals | OK | checked /de/en/unterhaltung-an-bord, /de/de/unterhaltung-an-bord, /at/de/unterhaltung-an-bord | 0 / 4 |  |
| embed | OK | checked /de/en/lufthansa-express-rail, /de/de/fliegen-mit-kindern, /at/de/fliegen-mit-kindern | 0 / 12 |  |
| fare-teaser | OK | checked /de/en/articles/highlights/all-it-takes-is-a-yes, /de/de/articles/highlights/all-it-takes-is-a-yes, /at/de/articles/highlights/all-it-takes-is-a-yes | 0 / 9 |  |
| feedback | OK | checked /de/en/book-and-manage/destination, /de/de/book-and-manage/destination, /at/de/book-and-manage/destination | 0 / 16 |  |
| flash-teaser | OK | checked /de/en/homepage, /de/de/homepage, /at/de/homepage | 0 / 4 |  |
| flight-search | PAGES | /de/en/homepage: 5 rows, the library has 4 | 1 / 4 |  |
| flight-search (standalone) | PAGES | /de/de/book-and-manage/stopover: 4 rows, the library has 5 | 12 / 23 |  |
| flight-status | OK | checked /de/en/timetable-and-flight-status, /de/de/flugplan-und-flugstatus, /at/de/flugplan-und-flugstatus | 0 / 4 |  |
| form | OK | checked /de/en/feedback, /de/de/feedback, /at/de/feedback | 0 / 4 |  |
| form (core) | PAGES | /de/en/add-sports-baggage: row 23 cell 1 "Label": list, the library text; row 35 cell 1 "Label": list, the library text \| /de/de/anmeldung-tiere-frachtraum: row 19 cell 1 "Label": list, the library text \| /at/de/anmeldung-tiere-frachtraum: row 19 cell 1 "Label": list, the library text | 12 / 36 |  |
| fragment | OK | checked /content/lh/markets/de/en/during-your-trip/lounges/loungenet/fra-first-class-lounge-b | 0 / 2 |  |
| hero-banner | OK | checked /de/en/food-and-beverages, /de/de/lufthansa-reiseklassen, /at/de/lufthansa-reiseklassen | 0 / 8 |  |
| hero-campaign | OK | checked /de/en/100-years/cabin-design, /de/de/100-years/cabin-design | 0 / 119 |  |
| hero-campaign (narrow) | OK | checked /de/en/book-and-manage/stopover, /de/de/farealert/best-price-alert, /at/de/100-years/cabin-design | 0 / 131 |  |
| hero-campaign (right) | OK | checked /de/en/100-years/campaigns, /de/de/100-years/campaigns | 0 / 31 |  |
| hero-campaign (card) | OK | checked /de/en/economy-class, /de/de/economy-class | 0 / 4 |  |
| hero-campaign (right, narrow) | OK | checked /de/de/boeing787, /at/de/100-years/campaigns | 0 / 39 |  |
| hero-campaign (right, card) | OK | checked /de/en/100-years/history, /de/de/100-years/history | 0 / 6 |  |
| hero-campaign (right, regular) | OK | checked /gb/en/local-page/ski-campaign-2026 | 0 / 1 |  |
| hero-card-overlay | OK | checked /de/en/fragments/stage-promotions, /de/de/fragments/stage-promotions, /at/de/fragments/stage-promotions | 0 / 4 |  |
| hero-card-overlay (no-mobile-image) | OK | checked /de/en/fragments/stage-promotions, /de/de/fragments/stage-promotions | 0 / 2 |  |
| hero-card-overlay (light) | OK | checked /at/de/fragments/stage-promotions | 0 / 1 |  |
| hero-card-overlay (right, no-mobile-image) | OK | checked /gb/en/fragments/stage-promotions | 0 / 1 |  |
| jump-links | OK | checked /de/en/admission-rules, /de/de/admission-rules, /at/de/admission-rules | 0 / 32 |  |
| jump-links (columns) | OK | checked /de/en/100-years/chronicle, /de/de/100-years/chronicle, /at/de/100-years/chronicle | 0 / 8 |  |
| lounge-finder | OK | checked /de/en/lounges, /de/de/lounges, /at/de/lounges | 0 / 8 |  |
| message-center | OK | checked /de/en/prepare-for-your-trip/current-travel-information, /de/de/prepare-for-your-trip/current-travel-information, /at/de/prepare-for-your-trip/current-travel-information | 0 / 4 |  |
| poi-map | OK | checked /de/en/100-years/destinations, /de/de/100-years/destinations, /at/de/100-years/destinations | 0 / 686 | 1326 |
| price-bar | OK | checked /de/en/articles/explore-flying/business-class-culinary-journey-with-johann-lafer, /de/de/articles/explore-flying/business-class-culinary-journey-with-johann-lafer, /at/de/articles/explore-flying/business-class-culinary-journey-with-johann-lafer | 0 / 1642 |  |
| profile-nav | OK | checked /de/en/business-class, /de/de/business-class, /at/de/business-class | 0 / 32 |  |
| profile-tabs (content) | PAGES | /de/en/lufthansa-am-flughafen-frankfurt: row 1 cell 2 "Panel": text, the library list \| /de/de/lufthansa-am-flughafen-frankfurt: row 1 cell 2 "Panel": text, the library list \| /at/de/lufthansa-am-flughafen-frankfurt: row 1 cell 2 "Panel": text, the library list | 8 / 12 |  |
| related-articles | OK | checked /de/en/articles/explore-flying/7-people-who-shaped-lufthansa-history, /de/de/articles/explore-flying/7-people-who-shaped-lufthansa-history, /at/de/articles/explore-flying/7-people-who-shaped-lufthansa-history | 0 / 2112 |  |
| search-results | OK | checked /de/en/support/search/search-result, /de/de/support/search/search-result, /at/de/support/search/search-result | 0 / 4 |  |
| stage-promotions | OK | checked /de/en/homepage, /de/de/homepage, /at/de/homepage | 0 / 4 |  |
| subpage-nav | OK | checked /de/en/affiliatemarketing, /de/de/affiliatemarketing, /at/de/affiliatemarketing | 0 / 200 |  |
| table-striped | OK | checked /de/en/320, /de/de/320, /at/de/320 | 4 / 117 | 456 |
| table-striped (header) | PAGES | /de/en/cookie-policy: row 2 cell 2 "Column 2": list, the library text; row 2 cell 5 "Column 5": list, the library text \| /de/de/cookie-policy: row 2 cell 2 "Column 2": list, the library text; row 2 cell 5 "Column 5": list, the library text \| /at/de/cookie-policy: row 2 cell 2 "Column 2": list, the library text; row 2 cell 5 "Column 5": list, the library text | 16 / 40 | 148 |
