# Block library check

2026-11-04. 124 library variants: 81 OK on the named pages, 10 with named pages that differ, 0 with a library error, 1 notes, 32 second structures. "Blocks differing" counts every block of the variant on all pages that does not resolve against the library table (tools/reports/block-library.json lists them); "Other rows" counts rows of multi blocks with another cell count than the item (label, intro or config rows), which the sidebar shows as items without editable fields.

SECOND: a later library entry of the same variant (another structure its pages use, for inserting it); the Block Inspector edits every block of a variant with the first entry (library.js getBlockFieldTemplate). "No entry fits" counts the blocks of a variant that none of its entries fits.

| Variant | Result | Detail | Blocks differing / all | No entry fits | Other rows (multi) |
| --- | --- | --- | --- | --- | --- |
| accordion-columns | OK | checked /de/en/discover-lufthansa/miles-and-more-credit-card, /de/de/discover-lufthansa/miles-and-more-credit-card, /at/de/discover-lufthansa/miles-and-more-credit-card | 2 / 13 |  |  |
| accordion-columns (faq) | PAGES | /de/en/advance-seat-reservation: row 1 cell 2 "Text": list, the library text \| /de/de/advance-seat-reservation: row 1 cell 2 "Text": list, the library text \| /at/de/advance-seat-reservation: row 1 cell 2 "Text": list, the library text | 25 / 173 |  |  |
| accordion-columns (faq, spaced) | OK | checked /de/en/bid-upgrade, /de/de/bid-upgrade, /at/de/bid-upgrade | 96 / 310 | 47 |  |
| accordion-columns (faq, spaced) [Accordion columns (faq, spaced): text | list] | SECOND | fits 49 of the 310 blocks of the variant (accordion-columns (faq, spaced) fits the others or none); not used by the Block Inspector, which edits the variant with its first entry | fits 49 / 310 |  |  |
| accordion-columns (faq, limited-width) | OK | checked /de/en/addresses-worldwide, /de/de/adressen-weltweit, /at/de/adressen-weltweit | 14 / 94 |  |  |
| accordion-columns (faq, column) | OK | checked /de/en/articles/explore-the-world, /de/de/articles/explore-the-world, /at/de/articles/explore-the-world | 12 / 39 | 0 |  |
| accordion-columns (faq, column) [Accordion columns (faq, column): text | list] | SECOND | fits 12 of the 39 blocks of the variant (accordion-columns (faq, column) fits the others or none); not used by the Block Inspector, which edits the variant with its first entry | fits 12 / 39 |  |  |
| accordion-columns (faq, limited-width, spaced) | OK | checked /de/en/baggage-irregularities, /de/de/baggage-irregularities, /at/de/baggage-irregularities | 14 / 170 |  |  |
| app-article-list | OK | checked /content/mobile/lh/de/articles/africa | 0 / 14 |  |  |
| app-links | OK | checked /content/mobile/lh/de/articles/a-perfect-day-in-chicago | 0 / 130 |  |  |
| app-offer | OK | checked /content/mobile/lh/de/articles/a-perfect-day-in-chicago | 6 / 56 | 0 |  |
| app-offer [App offer: 7 rows] | SECOND | fits 6 of the 56 blocks of the variant (app-offer fits the others or none); not used by the Block Inspector, which edits the variant with its first entry | fits 6 / 56 |  |  |
| app-service | OK | checked /content/mobile/lh/de/homepage | 0 / 3 |  |  |
| app-teaser-slider | OK | checked /content/mobile/lh/de/homepage | 0 / 2 |  |  |
| article-header | OK | checked /de/en/articles/explore-flying/7-people-who-shaped-lufthansa-history, /de/de/articles/explore-flying/7-people-who-shaped-lufthansa-history, /at/de/articles/explore-flying/7-people-who-shaped-lufthansa-history | 0 / 2230 | 0 |  |
| article-header [Article header with video] | SECOND | fits 194 of the 2230 blocks of the variant (article-header fits the others or none); not used by the Block Inspector, which edits the variant with its first entry | fits 194 / 2230 |  |  |
| blog-overview | OK | checked /de/en/articles/authors/alexandra-mikamo, /de/de/articles/authors/alexandra-mikamo, /at/de/articles/authors/alexandra-mikamo | 28 / 527 | 0 |  |
| blog-overview [Blog overview: 4 rows] | SECOND | fits 24 of the 527 blocks of the variant (blog-overview fits the others or none); not used by the Block Inspector, which edits the variant with its first entry | fits 24 / 527 |  |  |
| blog-overview [Blog overview: text | text / text | text] | SECOND | fits 4 of the 527 blocks of the variant (blog-overview fits the others or none); not used by the Block Inspector, which edits the variant with its first entry | fits 4 / 527 |  |  |
| booking-lookup | OK | checked /de/en/online-check-in, /de/de/online-check-in, /at/de/online-check-in | 0 / 7 |  |  |
| booking-lookup (my-bookings) | OK | checked /de/en/book-and-manage/booking-services/manage-my-bookings, /de/de/book-and-manage/booking-services/manage-my-bookings, /at/de/book-and-manage/booking-services/manage-my-bookings | 0 / 4 |  |  |
| car-rental | OK | checked /de/en/europcar, /de/de/europcar, /at/de/europcar | 0 / 28 |  |  |
| cards-icon-text (partner) | OK | checked /de/en/digital-self-services, /de/de/digital-self-services, /at/de/digital-self-services | 0 / 75 |  |  |
| cards-icon | OK | checked /de/en/homepage, /de/de/homepage, /ae/de/homepage | 0 / 138 |  |  |
| cards-icon (usp) | OK | checked /de/en/additional-services, /de/de/additional-services, /at/de/additional-services | 0 / 21 |  |  |
| cards-icon (usp, four-up) | OK | checked /de/en/additional-services, /de/de/additional-services, /at/de/additional-services | 0 / 14 |  |  |
| cards-steps | OK | checked /de/en/online-check-in, /de/de/online-check-in, /at/de/online-check-in | 0 / 7 |  |  |
| cards-teaser | OK | checked /de/en/100-years/cabin-design, /de/de/100-years/cabin-design, /at/de/100-years/cabin-design | 14 / 128 |  |  |
| cards-teaser (three-up) | OK | checked /de/en/baggage, /de/de/digital-self-services, /ae/en/longed-for-destinations-at-a-glance | 7 / 43 |  |  |
| cards-teaser (overlay) | OK | checked /de/en/articles/explore-flying, /de/de/articles/explore-flying, /at/de/articles/explore-flying | 2 / 20 |  |  |
| cards-teaser (four-up) | OK | checked /de/en/airport-information, /de/de/flughafeninformation, /at/de/flughafeninformation | 0 / 7 |  |  |
| cards-teaser (three-up, overlay) | OK | checked /de/en/articles/highlights-european-championship, /de/de/articles/highlights-european-championship, /at/de/articles/highlights-european-championship | 0 / 499 |  |  |
| carousel-cards | OK | checked /de/en/homepage, /de/de/homepage, /ae/de/homepage | 4 / 142 | 0 | 16 |
| carousel-cards [Carousel cards: image | text] | SECOND | fits 4 of the 142 blocks of the variant (carousel-cards fits the others or none); not used by the Block Inspector, which edits the variant with its first entry | fits 4 / 142 |  |  |
| carousel-cards (article) | OK | checked /de/en/articles/explore-flying/a-girl-named-lufthansa, /de/de/articles/explore-flying/a-girl-named-lufthansa, /at/de/articles/explore-flying/a-girl-named-lufthansa | 220 / 552 | 0 |  |
| carousel-cards (article) [Carousel cards (article): text | text] | SECOND | fits 220 of the 552 blocks of the variant (carousel-cards (article) fits the others or none); not used by the Block Inspector, which edits the variant with its first entry | fits 220 / 552 |  |  |
| carousel-cards (grid) | OK | checked /de/en/accessible-travel, /de/de/accessible-travel, /at/de/accessible-travel | 25 / 168 | 0 |  |
| carousel-cards (grid) [Carousel cards (grid): text | text] | SECOND | fits 25 of the 168 blocks of the variant (carousel-cards (grid) fits the others or none); not used by the Block Inspector, which edits the variant with its first entry | fits 25 / 168 |  |  |
| carousel-cards (four-up) | OK | checked /de/en/320, /de/de/320, /at/de/320 | 40 / 92 | 0 | 240 |
| carousel-cards (four-up) [Carousel cards (four-up): image, text] | SECOND | fits 40 of the 92 blocks of the variant (carousel-cards (four-up) fits the others or none); not used by the Block Inspector, which edits the variant with its first entry | fits 40 / 92 |  |  |
| carousel-cards (grid, four-up) | OK | checked /de/en/accessible-travel, /de/de/accessible-travel, /at/de/accessible-travel | 10 / 83 | 0 |  |
| carousel-cards (grid, four-up) [Carousel cards (grid, four-up): text | text] | SECOND | fits 10 of the 83 blocks of the variant (carousel-cards (grid, four-up) fits the others or none); not used by the Block Inspector, which edits the variant with its first entry | fits 10 / 83 |  |  |
| carousel-cards (four-up, authors) | NOTE | no fields: multi block whose pages have no rows (the extension needs a first item) | - / 36 pages |  |  |
| carousel-cards (grid, two-up) | OK | checked /de/en/food-and-beverages, /de/de/speisen-und-getraenke, /at/de/speisen-und-getraenke | 0 / 7 |  |  |
| carousel-images | OK | checked /de/en/100-years/cabin-design, /de/de/100-years/cabin-design, /at/de/100-years/cabin-design | 0 / 325 |  |  |
| carousel-lightbox | OK | checked /de/en/320, /de/de/320, /at/de/320 | 9 / 35 | 2 |  |
| carousel-lightbox [Carousel lightbox: image | text / text | text] | SECOND | fits 7 of the 35 blocks of the variant (carousel-lightbox fits the others or none); not used by the Block Inspector, which edits the variant with its first entry | fits 7 / 35 |  |  |
| carousel-lightbox (half) | OK | checked /de/en/744, /de/de/744, /at/de/744 | 0 / 14 |  |  |
| checkin-deadlines | OK | checked /xx/hk/prepare-for-your-trip/all-check-in/check-in-information | 0 / 3 |  |  |
| columns-logos | OK | checked /de/en/homepage, /de/de/homepage, /ae/de/homepage | 0 / 138 |  |  |
| columns-media | PAGES | /de/en/100-years/cabin-design: row 1 cell 1 "Image": text, the library image; row 1 cell 2 "Text": image, the library text \| /de/de/100-years/cabin-design: row 1 cell 1 "Image": text, the library image; row 1 cell 2 "Text": image, the library text \| /ae/en/longed-for-destinations-at-a-glance: row 1: 4 cells, the library 2 | 1290 / 3927 | 658 |  |
| columns-media [Columns media: image] | SECOND | fits 348 of the 3927 blocks of the variant (columns-media fits the others or none); not used by the Block Inspector, which edits the variant with its first entry | fits 348 / 3927 |  |  |
| columns-media [Columns media: text | image] | SECOND | fits 284 of the 3927 blocks of the variant (columns-media fits the others or none); not used by the Block Inspector, which edits the variant with its first entry | fits 284 / 3927 |  |  |
| columns-media (padded) | PAGES | /de/en/100-years/cabin-design: row 1 cell 1 "Image": text, the library image; row 1 cell 2 "Text": image, the library text \| /de/de/100-years/cabin-design: row 1 cell 1 "Image": text, the library image; row 1 cell 2 "Text": image, the library text \| /at/de/100-years/cabin-design: row 1 cell 1 "Image": text, the library image; row 1 cell 2 "Text": image, the library text | 1155 / 1738 | 614 |  |
| columns-media (padded) [Columns media (padded): text | image] | SECOND | fits 329 of the 1738 blocks of the variant (columns-media (padded) fits the others or none); not used by the Block Inspector, which edits the variant with its first entry | fits 329 / 1738 |  |  |
| columns-media (padded) [Columns media (padded): text | text] | SECOND | fits 212 of the 1738 blocks of the variant (columns-media (padded) fits the others or none); not used by the Block Inspector, which edits the variant with its first entry | fits 212 / 1738 |  |  |
| columns-media (stacked) | OK | checked /de/en/articles/explore-flying/a-girl-named-lufthansa, /de/de/articles/explore-flying/a-girl-named-lufthansa, /at/de/articles/explore-flying/a-girl-named-lufthansa | 0 / 1226 |  |  |
| columns-media (sidebar) | OK | checked /de/en/100-years/cabin-design, /de/de/100-years/cabin-design, /at/de/100-years/cabin-design | 269 / 549 | 51 |  |
| columns-media (sidebar) [Columns media (sidebar): text | image] | SECOND | fits 169 of the 549 blocks of the variant (columns-media (sidebar) fits the others or none); not used by the Block Inspector, which edits the variant with its first entry | fits 169 / 549 |  |  |
| columns-media (sidebar) [Columns media (sidebar): text | text] | SECOND | fits 49 of the 549 blocks of the variant (columns-media (sidebar) fits the others or none); not used by the Block Inspector, which edits the variant with its first entry | fits 49 / 549 |  |  |
| columns-media (nested-2) | OK | checked /de/en/passengers-with-sensory-impairment, /de/de/digital-travel-companion, /at/de/digital-travel-companion | 0 / 9 |  |  |
| columns-media (cell-slider) | OK | checked /de/en/onboard-delights, /de/de/onboard-delights, /at/de/onboard-delights | 0 / 7 |  |  |
| columns-media (slider) | OK | checked /de/en/online-check-in, /de/de/online-check-in, /at/de/online-check-in | 0 / 7 |  |  |
| columns-media (stacked, padded) | OK | checked /de/en/onboard-delights, /de/de/onboard-delights, /at/de/onboard-delights | 1 / 8 | 0 |  |
| columns-media (stacked, padded) [Columns media (stacked, padded): text | image | image | image] | SECOND | fits 1 of the 8 blocks of the variant (columns-media (stacked, padded) fits the others or none); not used by the Block Inspector, which edits the variant with its first entry | fits 1 / 8 |  |  |
| columns-media (nested-4, padded) | OK | checked /de/en/shopping, /de/de/shopping, /at/de/shopping | 0 / 7 |  |  |
| columns-media (sidebar, padded, before-padded) | OK | checked /de/en/100-years, /de/de/100-years, /at/de/100-years | 0 / 7 |  |  |
| destination-finder | PAGES | /de/de/homepage: 7 rows, the library has 10 \| /ae/de/homepage: 7 rows, the library has 10 | 52 / 134 | 19 |  |
| destination-finder [Destination finder: 7 rows] | SECOND | fits 24 of the 134 blocks of the variant (destination-finder fits the others or none); not used by the Block Inspector, which edits the variant with its first entry | fits 24 / 134 |  |  |
| destination-finder [Destination finder: 3 rows] | SECOND | fits 9 of the 134 blocks of the variant (destination-finder fits the others or none); not used by the Block Inspector, which edits the variant with its first entry | fits 9 / 134 |  |  |
| destination-finder (grid) | PAGES | /at/de/fluege: 5 rows, the library has 7 | 5 / 10 | 1 |  |
| destination-finder (grid) [Destination finder (grid): 6 rows] | SECOND | fits 3 of the 10 blocks of the variant (destination-finder (grid) fits the others or none); not used by the Block Inspector, which edits the variant with its first entry | fits 3 / 10 |  |  |
| destination-finder (grid) [Destination finder (grid): 5 rows] | SECOND | fits 1 of the 10 blocks of the variant (destination-finder (grid) fits the others or none); not used by the Block Inspector, which edits the variant with its first entry | fits 1 / 10 |  |  |
| destination-offer | OK | checked /de/en/book-and-manage/destination, /de/de/book-and-manage/destination, /at/de/book-and-manage/destination | 0 / 4 |  |  |
| ejournals | OK | checked /de/en/unterhaltung-an-bord, /de/de/unterhaltung-an-bord, /at/de/unterhaltung-an-bord | 0 / 7 |  |  |
| embed | OK | checked /de/en/lufthansa-express-rail, /de/de/fliegen-mit-kindern, /at/de/fliegen-mit-kindern | 0 / 21 |  |  |
| fare-teaser | PAGES | /ae/de/homepage: 6 rows, the library has 7 | 21 / 147 | 1 |  |
| fare-teaser [Fare teaser: 6 rows] | SECOND | fits 20 of the 147 blocks of the variant (fare-teaser fits the others or none); not used by the Block Inspector, which edits the variant with its first entry | fits 20 / 147 |  |  |
| feedback | OK | checked /de/en/book-and-manage/destination, /de/de/book-and-manage/destination, /at/de/book-and-manage/destination | 0 / 18 |  |  |
| flash-teaser | OK | checked /de/en/homepage, /de/de/homepage, /ae/de/homepage | 0 / 138 |  |  |
| flight-search | OK | checked /de/en/homepage, /de/de/homepage, /ae/de/homepage | 0 / 138 |  |  |
| flight-search (standalone) | OK | checked /de/en/book-and-manage/stopover, /de/de/book-and-manage/stopover, /at/de/book-and-manage/stopover | 6 / 46 |  |  |
| flight-status | OK | checked /de/en/timetable-and-flight-status, /de/de/flugplan-und-flugstatus, /at/de/flugplan-und-flugstatus | 0 / 7 |  |  |
| form | OK | checked /de/en/feedback, /de/de/feedback, /at/de/feedback | 0 / 4 |  |  |
| form (core) | PAGES | /de/en/add-sports-baggage: row 23 cell 1 "Label": list, the library text; row 35 cell 1 "Label": list, the library text \| /de/de/anmeldung-tiere-frachtraum: row 19 cell 1 "Label": list, the library text \| /at/de/anmeldung-tiere-frachtraum: row 19 cell 1 "Label": list, the library text | 21 / 64 |  |  |
| fragment | OK | checked /content/lh/markets/de/en/during-your-trip/lounges/loungenet/fra-first-class-lounge-b | 0 / 2 |  |  |
| hero-banner | OK | checked /de/en/food-and-beverages, /de/de/lufthansa-reiseklassen, /at/de/lufthansa-reiseklassen | 0 / 14 |  |  |
| hero-campaign | OK | checked /de/en/100-years/cabin-design, /de/de/100-years/cabin-design, /xx/hk/100-years/cabin-design | 0 / 253 |  |  |
| hero-campaign (narrow) | OK | checked /de/en/book-and-manage/stopover, /de/de/farealert/best-price-alert, /at/de/100-years/cabin-design | 0 / 132 |  |  |
| hero-campaign (right) | OK | checked /de/en/100-years/campaigns, /de/de/100-years/campaigns, /xx/hk/100-years/campaigns | 0 / 68 |  |  |
| hero-campaign (regular) | OK | checked /xx/hk/discover-lufthansa/new-onboard-experience | 0 / 40 |  |  |
| hero-campaign (card) | OK | checked /de/en/economy-class, /de/de/economy-class, /xx/hk/economy-class | 0 / 10 |  |  |
| hero-campaign (right, narrow) | OK | checked /de/de/boeing787, /at/de/100-years/campaigns | 0 / 39 |  |  |
| hero-campaign (right, card) | OK | checked /de/en/100-years/history, /de/de/100-years/history, /xx/hk/100-years/history | 0 / 13 |  |  |
| hero-campaign (right, regular) | OK | checked /gb/en/local-page/ski-campaign-2026 | 0 / 10 |  |  |
| hero-card-overlay | OK | checked /de/en/fragments/stage-promotions, /de/de/fragments/stage-promotions, /at/de/fragments/stage-promotions | 0 / 7 |  |  |
| hero-card-overlay (light) | OK | checked /ae/de/homepage | 0 / 118 |  |  |
| hero-card-overlay (no-mobile-image) | OK | checked /de/en/fragments/stage-promotions, /de/de/fragments/stage-promotions, /se/en/homepage | 0 / 3 |  |  |
| hero-card-overlay (right, light) | OK | checked /ae/en/homepage | 0 / 9 |  |  |
| hero-card-overlay (right, no-mobile-image) | OK | checked /dk/en/homepage | 0 / 5 |  |  |
| jump-links | OK | checked /de/en/admission-rules, /de/de/admission-rules, /at/de/admission-rules | 0 / 51 |  |  |
| jump-links (columns) | OK | checked /de/en/100-years/chronicle, /de/de/100-years/chronicle, /at/de/100-years/chronicle | 0 / 14 |  |  |
| lounge-finder | OK | checked /de/en/lounges, /de/de/lounges, /at/de/lounges | 0 / 12 |  |  |
| message-center | OK | checked /de/en/prepare-for-your-trip/current-travel-information, /de/de/prepare-for-your-trip/current-travel-information, /at/de/prepare-for-your-trip/current-travel-information | 0 / 7 |  |  |
| micro-frontend | PAGES | /de/en/book-and-manage/trip-management: 1 rows, the library has 3 \| /de/de/book-and-manage/trip-management: 1 rows, the library has 3 \| /at/de/book-and-manage/trip-management: 1 rows, the library has 3 | 4 / 9 | 0 |  |
| micro-frontend [Micro frontend: text] | SECOND | fits 4 of the 9 blocks of the variant (micro-frontend fits the others or none); not used by the Block Inspector, which edits the variant with its first entry | fits 4 / 9 |  |  |
| poi-map | PAGES | /de/en/100-years/destinations: no item row (1 rows, none with 3 cells) \| /de/de/100-years/destinations: no item row (1 rows, none with 3 cells) \| /at/de/100-years/destinations: no item row (1 rows, none with 3 cells) | 44 / 706 | 0 | 1346 |
| poi-map [Poi map: text | text] | SECOND | fits 702 of the 706 blocks of the variant (poi-map fits the others or none); not used by the Block Inspector, which edits the variant with its first entry | fits 702 / 706 |  |  |
| price-bar | OK | checked /de/en/articles/explore-flying/business-class-culinary-journey-with-johann-lafer, /de/de/articles/explore-flying/business-class-culinary-journey-with-johann-lafer, /at/de/articles/explore-flying/business-class-culinary-journey-with-johann-lafer | 0 / 1642 |  |  |
| profile-nav | OK | checked /de/en/business-class, /de/de/business-class, /at/de/business-class | 0 / 68 |  |  |
| profile-tabs | OK | checked /de/en/profile/bookinglist, /de/de/profile/bookinglist, /at/de/profile/bookinglist | 0 / 4 |  |  |
| profile-tabs (content) | OK | checked /de/en/lufthansa-am-flughafen-frankfurt, /de/de/lufthansa-am-flughafen-frankfurt, /at/de/lufthansa-am-flughafen-frankfurt | 14 / 21 | 0 |  |
| profile-tabs (content) [Profile tabs (content): text | image, text | text] | SECOND | fits 7 of the 21 blocks of the variant (profile-tabs (content) fits the others or none); not used by the Block Inspector, which edits the variant with its first entry | fits 7 / 21 |  |  |
| profile-tabs (content) [Profile tabs (content): text | list | text] | SECOND | fits 7 of the 21 blocks of the variant (profile-tabs (content) fits the others or none); not used by the Block Inspector, which edits the variant with its first entry | fits 7 / 21 |  |  |
| related-articles | OK | checked /de/en/articles/explore-flying/7-people-who-shaped-lufthansa-history, /de/de/articles/explore-flying/7-people-who-shaped-lufthansa-history, /at/de/articles/explore-flying/7-people-who-shaped-lufthansa-history | 0 / 2112 |  |  |
| search-results | OK | checked /de/en/support/search/search-result, /de/de/support/search/search-result, /at/de/support/search/search-result | 0 / 4 |  |  |
| stage-promotions | OK | checked /de/en/homepage, /de/de/homepage, /at/de/homepage | 0 / 4 |  |  |
| subpage-nav | OK | checked /de/en/affiliatemarketing, /de/de/affiliatemarketing, /at/de/affiliatemarketing | 0 / 353 |  |  |
| table-striped | OK | checked /de/en/320, /de/de/320, /at/de/320 | 121 / 229 | 35 | 1002 |
| table-striped [Table striped: text | text | text] | SECOND | fits 52 of the 229 blocks of the variant (table-striped fits the others or none); not used by the Block Inspector, which edits the variant with its first entry | fits 52 / 229 |  |  |
| table-striped [Table striped: text | text | text | text] | SECOND | fits 34 of the 229 blocks of the variant (table-striped fits the others or none); not used by the Block Inspector, which edits the variant with its first entry | fits 34 / 229 |  |  |
| table-striped (header) | PAGES | /de/en/cookie-policy: no item row (10 rows, none with 2 cells); no item row (11 rows, none with 2 cells) \| /de/de/cookie-policy: no item row (10 rows, none with 2 cells); no item row (11 rows, none with 2 cells) | 42 / 67 | 28 | 445 |
| table-striped (header) [Table striped (header): text | text | text | text | text] | SECOND | fits 7 of the 67 blocks of the variant (table-striped (header) fits the others or none); not used by the Block Inspector, which edits the variant with its first entry | fits 7 / 67 |  |  |
| table-striped (header) [Table striped (header): text | text | text | text] | SECOND | fits 7 of the 67 blocks of the variant (table-striped (header) fits the others or none); not used by the Block Inspector, which edits the variant with its first entry | fits 7 / 67 |  |  |
