# Block library check

2026-10-27. 116 library variants: 80 OK on the named pages, 9 with named pages that differ, 0 with a library error, 1 notes, 26 second structures. "Blocks differing" counts every block of the variant on all pages that does not resolve against the library table (tools/reports/block-library.json lists them); "Other rows" counts rows of multi blocks with another cell count than the item (label, intro or config rows), which the sidebar shows as items without editable fields.

SECOND: a later library entry of the same variant (another structure its pages use, for inserting it); the Block Inspector edits every block of a variant with the first entry (library.js getBlockFieldTemplate). "No entry fits" counts the blocks of a variant that none of its entries fits.

| Variant | Result | Detail | Blocks differing / all | No entry fits | Other rows (multi) |
| --- | --- | --- | --- | --- | --- |
| accordion-columns | OK | checked /de/en/discover-lufthansa/miles-and-more-credit-card, /de/de/discover-lufthansa/miles-and-more-credit-card, /at/de/discover-lufthansa/miles-and-more-credit-card | 0 / 8 |  |  |
| accordion-columns (faq) | PAGES | /de/en/advance-seat-reservation: row 1 cell 2 "Text": list, the library text \| /de/de/advance-seat-reservation: row 1 cell 2 "Text": list, the library text \| /at/de/advance-seat-reservation: row 1 cell 2 "Text": list, the library text | 18 / 107 |  |  |
| accordion-columns (spaced) | PAGES | /de/de/dangerous-dogs: row 1 cell 2 "Text": list, the library text \| /at/de/dangerous-dogs: row 1 cell 2 "Text": list, the library text | 8 / 32 |  |  |
| accordion-columns (faq, spaced) | OK | checked /de/en/bid-upgrade, /de/de/bid-upgrade, /at/de/bid-upgrade | 48 / 140 | 20 |  |
| accordion-columns (faq, spaced) [Accordion columns (faq, spaced): text | list] | SECOND | fits 28 of the 140 blocks of the variant (accordion-columns (faq, spaced) fits the others or none); not used by the Block Inspector, which edits the variant with its first entry | fits 28 / 140 |  |  |
| accordion-columns (faq, limited-width) | OK | checked /de/en/addresses-worldwide, /de/de/adressen-weltweit, /at/de/adressen-weltweit | 8 / 44 |  |  |
| accordion-columns (faq, column) | OK | checked /de/en/articles/explore-the-world, /de/de/articles/explore-the-world, /at/de/articles/explore-the-world | 12 / 36 | 0 |  |
| accordion-columns (faq, column) [Accordion columns (faq, column): text | list] | SECOND | fits 12 of the 36 blocks of the variant (accordion-columns (faq, column) fits the others or none); not used by the Block Inspector, which edits the variant with its first entry | fits 12 / 36 |  |  |
| accordion-columns (faq, limited-width, spaced) | OK | checked /de/en/baggage-irregularities, /de/de/baggage-irregularities, /at/de/baggage-irregularities | 8 / 98 |  |  |
| app-article-list | OK | checked /content/mobile/lh/de/articles/africa | 0 / 14 |  |  |
| app-links | OK | checked /content/mobile/lh/de/articles/a-perfect-day-in-chicago | 0 / 130 |  |  |
| app-offer | OK | checked /content/mobile/lh/de/articles/a-perfect-day-in-chicago | 0 / 50 |  |  |
| app-service | OK | checked /content/mobile/lh/de/homepage | 0 / 2 |  |  |
| app-teaser-slider | OK | checked /content/mobile/lh/de/homepage | 0 / 2 |  |  |
| article-header | OK | checked /de/en/articles/explore-flying/7-people-who-shaped-lufthansa-history, /de/de/articles/explore-flying/7-people-who-shaped-lufthansa-history, /at/de/articles/explore-flying/7-people-who-shaped-lufthansa-history | 0 / 2230 | 0 |  |
| article-header [Article header with video] | SECOND | fits 194 of the 2230 blocks of the variant (article-header fits the others or none); not used by the Block Inspector, which edits the variant with its first entry | fits 194 / 2230 |  |  |
| blog-overview | OK | checked /de/en/articles/authors/alexandra-mikamo, /de/de/articles/authors/alexandra-mikamo, /at/de/articles/authors/alexandra-mikamo | 28 / 527 | 0 |  |
| blog-overview [Blog overview: 4 rows] | SECOND | fits 24 of the 527 blocks of the variant (blog-overview fits the others or none); not used by the Block Inspector, which edits the variant with its first entry | fits 24 / 527 |  |  |
| blog-overview [Blog overview: text | text / text | text] | SECOND | fits 4 of the 527 blocks of the variant (blog-overview fits the others or none); not used by the Block Inspector, which edits the variant with its first entry | fits 4 / 527 |  |  |
| booking-lookup | OK | checked /de/en/online-check-in, /de/de/online-check-in, /at/de/online-check-in | 0 / 4 |  |  |
| booking-lookup (my-bookings) | OK | checked /de/en/book-and-manage/booking-services/manage-my-bookings, /de/de/book-and-manage/booking-services/manage-my-bookings, /at/de/book-and-manage/booking-services/manage-my-bookings | 0 / 4 |  |  |
| car-rental | OK | checked /de/en/europcar, /de/de/europcar, /at/de/europcar | 0 / 16 |  |  |
| cards-icon-text (partner) | OK | checked /de/en/digital-self-services, /de/de/digital-self-services, /at/de/digital-self-services | 0 / 34 |  |  |
| cards-icon | OK | checked /de/en/homepage, /de/de/homepage, /at/de/homepage | 0 / 4 |  |  |
| cards-icon (usp) | OK | checked /de/en/additional-services, /de/de/additional-services, /at/de/additional-services | 0 / 12 |  |  |
| cards-icon (usp, four-up) | OK | checked /de/en/additional-services, /de/de/additional-services, /at/de/additional-services | 0 / 8 |  |  |
| cards-steps | OK | checked /de/en/online-check-in, /de/de/online-check-in, /at/de/online-check-in | 0 / 4 |  |  |
| cards-teaser | OK | checked /de/en/100-years/cabin-design, /de/de/100-years/cabin-design, /at/de/100-years/cabin-design | 8 / 74 |  |  |
| cards-teaser (three-up) | OK | checked /de/en/baggage, /de/de/digital-self-services, /at/de/digital-self-services | 4 / 24 |  |  |
| cards-teaser (overlay) | OK | checked /de/en/articles/explore-flying, /de/de/articles/explore-flying, /at/de/articles/explore-flying | 2 / 20 |  |  |
| cards-teaser (four-up) | OK | checked /de/en/airport-information, /de/de/flughafeninformation, /at/de/flughafeninformation | 0 / 4 |  |  |
| cards-teaser (three-up, overlay) | OK | checked /de/en/articles/highlights-european-championship, /de/de/articles/highlights-european-championship, /at/de/articles/highlights-european-championship | 0 / 499 |  |  |
| cards | OK | checked /index | 0 / 1 |  |  |
| carousel-cards | OK | checked /de/en/homepage, /de/de/homepage, /at/de/homepage | 0 / 4 |  |  |
| carousel-cards (article) | OK | checked /de/en/articles/explore-flying/a-girl-named-lufthansa, /de/de/articles/explore-flying/a-girl-named-lufthansa, /at/de/articles/explore-flying/a-girl-named-lufthansa | 220 / 552 | 0 |  |
| carousel-cards (article) [Carousel cards (article): text | text] | SECOND | fits 220 of the 552 blocks of the variant (carousel-cards (article) fits the others or none); not used by the Block Inspector, which edits the variant with its first entry | fits 220 / 552 |  |  |
| carousel-cards (grid) | OK | checked /de/en/accessible-travel, /de/de/accessible-travel, /at/de/accessible-travel | 12 / 96 | 0 |  |
| carousel-cards (grid) [Carousel cards (grid): text | text] | SECOND | fits 12 of the 96 blocks of the variant (carousel-cards (grid) fits the others or none); not used by the Block Inspector, which edits the variant with its first entry | fits 12 / 96 |  |  |
| carousel-cards (four-up) | PAGES | /de/en/320: no item row (9 rows, none with 1 cells) \| /de/de/320: no item row (9 rows, none with 1 cells) \| /at/de/320: no item row (9 rows, none with 1 cells) | 34 / 74 | 0 | 328 |
| carousel-cards (four-up) [Carousel cards (four-up): image | text] | SECOND | fits 34 of the 74 blocks of the variant (carousel-cards (four-up) fits the others or none); not used by the Block Inspector, which edits the variant with its first entry | fits 34 / 74 |  |  |
| carousel-cards (grid, four-up) | OK | checked /de/en/accessible-travel, /de/de/accessible-travel, /at/de/accessible-travel | 6 / 44 | 0 |  |
| carousel-cards (grid, four-up) [Carousel cards (grid, four-up): text | text] | SECOND | fits 6 of the 44 blocks of the variant (carousel-cards (grid, four-up) fits the others or none); not used by the Block Inspector, which edits the variant with its first entry | fits 6 / 44 |  |  |
| carousel-cards (four-up, authors) | NOTE | no fields: multi block whose pages have no rows (the extension needs a first item) | - / 36 pages |  |  |
| carousel-cards (grid, two-up) | OK | checked /de/en/food-and-beverages, /de/de/speisen-und-getraenke, /at/de/speisen-und-getraenke | 0 / 4 |  |  |
| carousel-images | OK | checked /de/en/100-years/cabin-design, /de/de/100-years/cabin-design, /at/de/100-years/cabin-design | 0 / 256 |  |  |
| carousel-lightbox | OK | checked /de/en/320, /de/de/320, /at/de/320 | 6 / 20 | 0 |  |
| carousel-lightbox [Carousel lightbox: image | text / text | text] | SECOND | fits 4 of the 20 blocks of the variant (carousel-lightbox fits the others or none); not used by the Block Inspector, which edits the variant with its first entry | fits 4 / 20 |  |  |
| carousel-lightbox [Carousel lightbox: 4 rows] | SECOND | fits 2 of the 20 blocks of the variant (carousel-lightbox fits the others or none); not used by the Block Inspector, which edits the variant with its first entry | fits 2 / 20 |  |  |
| carousel-lightbox (half) | OK | checked /de/en/744, /de/de/744, /at/de/744 | 0 / 8 |  |  |
| columns-logos | OK | checked /de/en/fragments/payment-social, /de/de/fragments/payment-social, /at/de/fragments/payment-social | 0 / 8 |  |  |
| columns-media | PAGES | /de/en/100-years/cabin-design: row 1 cell 1 "Image": text, the library image; row 1 cell 2 "Text": image, the library text \| /de/de/100-years/cabin-design: row 1 cell 1 "Image": text, the library image; row 1 cell 2 "Text": image, the library text \| /at/de/100-years/cabin-design: row 1 cell 1 "Image": text, the library image; row 1 cell 2 "Text": image, the library text | 884 / 3452 | 400 |  |
| columns-media [Columns media: image] | SECOND | fits 306 of the 3452 blocks of the variant (columns-media fits the others or none); not used by the Block Inspector, which edits the variant with its first entry | fits 306 / 3452 |  |  |
| columns-media [Columns media: text | image] | SECOND | fits 178 of the 3452 blocks of the variant (columns-media fits the others or none); not used by the Block Inspector, which edits the variant with its first entry | fits 178 / 3452 |  |  |
| columns-media (stacked) | OK | checked /de/en/articles/explore-flying/a-girl-named-lufthansa, /de/de/articles/explore-flying/a-girl-named-lufthansa, /at/de/articles/explore-flying/a-girl-named-lufthansa | 0 / 1226 |  |  |
| columns-media (padded) | PAGES | /de/en/100-years/cabin-design: row 1 cell 1 "Image": text, the library image; row 1 cell 2 "Text": image, the library text \| /de/de/100-years/cabin-design: row 1 cell 1 "Image": text, the library image; row 1 cell 2 "Text": image, the library text \| /at/de/100-years/cabin-design: row 1 cell 1 "Image": text, the library image; row 1 cell 2 "Text": image, the library text | 674 / 1103 | 366 |  |
| columns-media (padded) [Columns media (padded): text | image] | SECOND | fits 186 of the 1103 blocks of the variant (columns-media (padded) fits the others or none); not used by the Block Inspector, which edits the variant with its first entry | fits 186 / 1103 |  |  |
| columns-media (padded) [Columns media (padded): text | text] | SECOND | fits 122 of the 1103 blocks of the variant (columns-media (padded) fits the others or none); not used by the Block Inspector, which edits the variant with its first entry | fits 122 / 1103 |  |  |
| columns-media (sidebar) | OK | checked /de/en/100-years/cabin-design, /de/de/100-years/cabin-design, /at/de/100-years/cabin-design | 152 / 314 | 30 |  |
| columns-media (sidebar) [Columns media (sidebar): text | image] | SECOND | fits 94 of the 314 blocks of the variant (columns-media (sidebar) fits the others or none); not used by the Block Inspector, which edits the variant with its first entry | fits 94 / 314 |  |  |
| columns-media (sidebar) [Columns media (sidebar): text | text] | SECOND | fits 28 of the 314 blocks of the variant (columns-media (sidebar) fits the others or none); not used by the Block Inspector, which edits the variant with its first entry | fits 28 / 314 |  |  |
| columns-media (nested-2) | OK | checked /de/en/passengers-with-sensory-impairment, /de/de/digital-travel-companion, /at/de/digital-travel-companion | 0 / 6 |  |  |
| columns-media (cell-slider) | OK | checked /de/en/onboard-delights, /de/de/onboard-delights, /at/de/onboard-delights | 0 / 4 |  |  |
| columns-media (slider) | OK | checked /de/en/online-check-in, /de/de/online-check-in, /at/de/online-check-in | 0 / 4 |  |  |
| columns-media (nested-4, padded) | OK | checked /de/en/shopping, /de/de/shopping, /at/de/shopping | 0 / 4 |  |  |
| columns-media (stacked, padded) | OK | checked /de/en/onboard-delights, /de/de/onboard-delights, /at/de/onboard-delights | 0 / 4 |  |  |
| columns-media (sidebar, padded, before-padded) | OK | checked /de/en/100-years, /de/de/100-years, /at/de/100-years | 0 / 4 |  |  |
| columns | OK | checked /index | 0 / 1 |  |  |
| destination-finder | PAGES | /de/en/homepage: 10 rows, the library has 7 | 1 / 4 | 0 |  |
| destination-finder [Destination finder: 10 rows] | SECOND | fits 1 of the 4 blocks of the variant (destination-finder fits the others or none); not used by the Block Inspector, which edits the variant with its first entry | fits 1 / 4 |  |  |
| destination-finder (grid) | PAGES | /at/de/fluege: 5 rows, the library has 7 | 1 / 4 | 0 |  |
| destination-finder (grid) [Destination finder (grid): 5 rows] | SECOND | fits 1 of the 4 blocks of the variant (destination-finder (grid) fits the others or none); not used by the Block Inspector, which edits the variant with its first entry | fits 1 / 4 |  |  |
| destination-offer | OK | checked /de/en/book-and-manage/destination, /de/de/book-and-manage/destination, /at/de/book-and-manage/destination | 0 / 4 |  |  |
| ejournals | OK | checked /de/en/unterhaltung-an-bord, /de/de/unterhaltung-an-bord, /at/de/unterhaltung-an-bord | 0 / 4 |  |  |
| embed | OK | checked /de/en/lufthansa-express-rail, /de/de/fliegen-mit-kindern, /at/de/fliegen-mit-kindern | 0 / 12 |  |  |
| fare-teaser | OK | checked /de/en/articles/highlights/all-it-takes-is-a-yes, /de/de/articles/highlights/all-it-takes-is-a-yes, /at/de/articles/highlights/all-it-takes-is-a-yes | 0 / 9 |  |  |
| feedback | OK | checked /de/en/book-and-manage/destination, /de/de/book-and-manage/destination, /at/de/book-and-manage/destination | 0 / 16 |  |  |
| flash-teaser | OK | checked /de/en/homepage, /de/de/homepage, /at/de/homepage | 0 / 4 |  |  |
| flight-search | OK | checked /de/en/homepage, /de/de/homepage, /at/de/homepage | 0 / 4 |  |  |
| flight-search (standalone) | OK | checked /de/en/book-and-manage/stopover, /de/de/book-and-manage/stopover, /at/de/book-and-manage/stopover | 3 / 23 |  |  |
| flight-status | OK | checked /de/en/timetable-and-flight-status, /de/de/flugplan-und-flugstatus, /at/de/flugplan-und-flugstatus | 0 / 4 |  |  |
| form | OK | checked /de/en/feedback, /de/de/feedback, /at/de/feedback | 0 / 4 |  |  |
| form (core) | PAGES | /de/en/add-sports-baggage: row 23 cell 1 "Label": list, the library text; row 35 cell 1 "Label": list, the library text \| /de/de/anmeldung-tiere-frachtraum: row 19 cell 1 "Label": list, the library text \| /at/de/anmeldung-tiere-frachtraum: row 19 cell 1 "Label": list, the library text | 12 / 36 |  |  |
| fragment | OK | checked /content/lh/markets/de/en/during-your-trip/lounges/loungenet/fra-first-class-lounge-b | 0 / 2 |  |  |
| hero-banner | OK | checked /de/en/food-and-beverages, /de/de/lufthansa-reiseklassen, /at/de/lufthansa-reiseklassen | 0 / 8 |  |  |
| hero-campaign | OK | checked /de/en/100-years/cabin-design, /de/de/100-years/cabin-design | 0 / 119 |  |  |
| hero-campaign (narrow) | OK | checked /de/en/book-and-manage/stopover, /de/de/farealert/best-price-alert, /at/de/100-years/cabin-design | 0 / 131 |  |  |
| hero-campaign (right) | OK | checked /de/en/100-years/campaigns, /de/de/100-years/campaigns | 0 / 31 |  |  |
| hero-campaign (card) | OK | checked /de/en/economy-class, /de/de/economy-class | 0 / 4 |  |  |
| hero-campaign (right, narrow) | OK | checked /de/de/boeing787, /at/de/100-years/campaigns | 0 / 39 |  |  |
| hero-campaign (right, card) | OK | checked /de/en/100-years/history, /de/de/100-years/history | 0 / 6 |  |  |
| hero-campaign (right, regular) | OK | checked /gb/en/local-page/ski-campaign-2026 | 0 / 1 |  |  |
| hero-card-overlay | OK | checked /de/en/fragments/stage-promotions, /de/de/fragments/stage-promotions, /at/de/fragments/stage-promotions | 0 / 4 |  |  |
| hero-card-overlay (no-mobile-image) | OK | checked /de/en/fragments/stage-promotions, /de/de/fragments/stage-promotions | 0 / 2 |  |  |
| hero-card-overlay (light) | OK | checked /at/de/fragments/stage-promotions | 0 / 1 |  |  |
| hero-card-overlay (right, no-mobile-image) | OK | checked /gb/en/fragments/stage-promotions | 0 / 1 |  |  |
| jump-links | OK | checked /de/en/admission-rules, /de/de/admission-rules, /at/de/admission-rules | 0 / 32 |  |  |
| jump-links (columns) | OK | checked /de/en/100-years/chronicle, /de/de/100-years/chronicle, /at/de/100-years/chronicle | 0 / 8 |  |  |
| lounge-finder | OK | checked /de/en/lounges, /de/de/lounges, /at/de/lounges | 0 / 8 |  |  |
| message-center | OK | checked /de/en/prepare-for-your-trip/current-travel-information, /de/de/prepare-for-your-trip/current-travel-information, /at/de/prepare-for-your-trip/current-travel-information | 0 / 4 |  |  |
| poi-map | OK | checked /de/en/100-years/destinations, /de/de/100-years/destinations, /at/de/100-years/destinations | 4 / 686 | 0 | 4696 |
| poi-map [Poi map: text | text | text] | SECOND | fits 662 of the 686 blocks of the variant (poi-map fits the others or none); not used by the Block Inspector, which edits the variant with its first entry | fits 662 / 686 |  |  |
| price-bar | OK | checked /de/en/articles/explore-flying/business-class-culinary-journey-with-johann-lafer, /de/de/articles/explore-flying/business-class-culinary-journey-with-johann-lafer, /at/de/articles/explore-flying/business-class-culinary-journey-with-johann-lafer | 0 / 1642 |  |  |
| profile-nav | OK | checked /de/en/business-class, /de/de/business-class, /at/de/business-class | 0 / 32 |  |  |
| profile-tabs (content) | OK | checked /de/en/lufthansa-am-flughafen-frankfurt, /de/de/lufthansa-am-flughafen-frankfurt, /at/de/lufthansa-am-flughafen-frankfurt | 8 / 12 | 0 |  |
| profile-tabs (content) [Profile tabs (content): text | image, text | text] | SECOND | fits 4 of the 12 blocks of the variant (profile-tabs (content) fits the others or none); not used by the Block Inspector, which edits the variant with its first entry | fits 4 / 12 |  |  |
| profile-tabs (content) [Profile tabs (content): text | list | text] | SECOND | fits 4 of the 12 blocks of the variant (profile-tabs (content) fits the others or none); not used by the Block Inspector, which edits the variant with its first entry | fits 4 / 12 |  |  |
| related-articles | OK | checked /de/en/articles/explore-flying/7-people-who-shaped-lufthansa-history, /de/de/articles/explore-flying/7-people-who-shaped-lufthansa-history, /at/de/articles/explore-flying/7-people-who-shaped-lufthansa-history | 0 / 2112 |  |  |
| search-results | OK | checked /de/en/support/search/search-result, /de/de/support/search/search-result, /at/de/support/search/search-result | 0 / 4 |  |  |
| stage-promotions | OK | checked /de/en/homepage, /de/de/homepage, /at/de/homepage | 0 / 4 |  |  |
| subpage-nav | OK | checked /de/en/affiliatemarketing, /de/de/affiliatemarketing, /at/de/affiliatemarketing | 0 / 200 |  |  |
| table-striped | OK | checked /de/en/320, /de/de/320, /at/de/320 | 57 / 117 | 17 | 456 |
| table-striped [Table striped: text | text | text] | SECOND | fits 24 of the 117 blocks of the variant (table-striped fits the others or none); not used by the Block Inspector, which edits the variant with its first entry | fits 24 / 117 |  |  |
| table-striped [Table striped: text | text | text | text] | SECOND | fits 16 of the 117 blocks of the variant (table-striped fits the others or none); not used by the Block Inspector, which edits the variant with its first entry | fits 16 / 117 |  |  |
| table-striped (header) | PAGES | /de/en/cookie-policy: no item row (10 rows, none with 2 cells); no item row (11 rows, none with 2 cells) \| /de/de/cookie-policy: no item row (10 rows, none with 2 cells); no item row (11 rows, none with 2 cells) \| /at/de/cookie-policy: no item row (10 rows, none with 2 cells); no item row (11 rows, none with 2 cells) | 24 / 40 | 16 | 256 |
| table-striped (header) [Table striped (header): text | text | text | text | text] | SECOND | fits 4 of the 40 blocks of the variant (table-striped (header) fits the others or none); not used by the Block Inspector, which edits the variant with its first entry | fits 4 / 40 |  |  |
| table-striped (header) [Table striped (header): text | text | text | text] | SECOND | fits 4 of the 40 blocks of the variant (table-striped (header) fits the others or none); not used by the Block Inspector, which edits the variant with its first entry | fits 4 / 40 |  |  |
