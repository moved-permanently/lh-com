# SWISS: the Bengaluru promotion www no longer shows (brief 505, item 3)

The re-check (sweep-recheck.md) found /ch/en/book-and-manage/partner-offers/swiss-airrail drawing its flight search over a Bengaluru promotion (a video, "Discover India / From 27 October, fly from Zurich to vibrant Bengaluru") that www's recording does not have. Nothing was changed here: the list is for a re-import from a newer capture of www.

## Where it comes from

- **The capture:** the importer's snapshots of www.swiss.com (content-sites/lh-swiss/snapshots, 2026-11-02 and -03; the market pages' from swiss-market-import.mjs's own). Their flight manager's `promotionTeaser` was `mainstage-starlink-261026` (title "Discover India", the Bengaluru header video as its moving image); the homepages' stage the same campaign.
- **The importer steps:** swiss-import.mjs `withFlightSearchVideo` (the moving image as the flight search's Background image and Background video rows) and `withFlightSearchTeaser` (the teaser's title, text and link as its Background teaser row), both also called by swiss-market-import.mjs; the homepages' stage by the hero parser and `withHeroVideo` (hero-card-overlay). They read the snapshot as captured: right on 2026-11-02, stale once www changed the campaign.
- **www since** (the recordings, no new request):
  - /ch/de/homepage (swiss-parity-001): `nov-flash-sale` "Bis zum 8. November buchen und vom Angebot profitieren" / "CHF 40 sparen mit dem Code NOV40", moving image: none
  - /ch/en/book-and-manage/partner-offers/swiss-airrail (swiss-parity-002b): `nov-flash-sale` "Book by November 8th to enjoy the offer" / "Save CHF 40 with code NOV40", moving image: none
  - /ch/en/homepage (swiss-parity-001): `nov-flash-sale` "Book by November 8th to enjoy the offer" / "Save CHF 40 with code NOV40", moving image: none
  - /de/de/homepage (swiss-parity-002a): `mainstage-gc-familypromo-021126` "Familienzeit in der Ferne" / "Bis zu 50 % Kinderrabatt", moving image: none
  - /us/en/homepage (swiss-parity-002a): `skicampainmst` "SWISS - The skier's airline" / "Your winter sports gear flies free*", moving image: none

So on 2026-11-05/06 www's ch flight manager carried the NOV40 flash sale without a moving image (no band), de/de a family promotion, us/en the ski campaign; nowhere the Bengaluru one.

## The documents (52 with the flight search band, 34 homepages with the stage)

**Flight search with the Bengaluru band** (Background image, video and teaser rows); recorded: swiss-airrail (www: none):

- /ca/en/local-page/swiss-student-fares
- /ca/en/yul-to-zrh-april23
- /ca/fr/yul-to-zrh-april23
- /ch/de/book-and-manage/advanced-search
- /ch/de/book-and-manage/flights
- /ch/de/book-and-manage/partner-offers/swiss-airrail
- /ch/de/customer-support/faq/payment-options/cash-and-miles
- /ch/de/local-page/black-friday
- /ch/el/book-and-manage/advanced-search
- /ch/el/book-and-manage/flights
- /ch/el/book-and-manage/partner-offers/swiss-airrail
- /ch/el/customer-support/faq/payment-options/cash-and-miles
- /ch/en/book-and-manage/advanced-search
- /ch/en/book-and-manage/flights
- /ch/en/book-and-manage/partner-offers/swiss-airrail
- /ch/en/customer-support/faq/payment-options/cash-and-miles
- /ch/es/book-and-manage/advanced-search
- /ch/es/book-and-manage/flights
- /ch/es/book-and-manage/partner-offers/swiss-airrail
- /ch/es/customer-support/faq/payment-options/cash-and-miles
- /ch/es/local-page/black-friday
- /ch/fr/book-and-manage/advanced-search
- /ch/fr/book-and-manage/flights
- /ch/fr/book-and-manage/partner-offers/swiss-airrail
- /ch/fr/customer-support/faq/payment-options/cash-and-miles
- /ch/it/book-and-manage/advanced-search
- /ch/it/book-and-manage/flights
- /ch/it/book-and-manage/partner-offers/swiss-airrail
- /ch/it/customer-support/faq/payment-options/cash-and-miles
- /ch/ja/book-and-manage/advanced-search
- /ch/ja/book-and-manage/flights
- /ch/ja/book-and-manage/partner-offers/swiss-airrail
- /ch/ja/customer-support/faq/payment-options/cash-and-miles
- /ch/pt/book-and-manage/advanced-search
- /ch/pt/book-and-manage/flights
- /ch/pt/book-and-manage/partner-offers/swiss-airrail
- /ch/pt/customer-support/faq/payment-options/cash-and-miles
- /ch/ru/book-and-manage/advanced-search
- /ch/ru/book-and-manage/flights
- /ch/ru/book-and-manage/partner-offers/swiss-airrail
- /ch/ru/customer-support/faq/payment-options/cash-and-miles
- /ch/zh/book-and-manage/advanced-search
- /ch/zh/book-and-manage/flights
- /ch/zh/book-and-manage/partner-offers/swiss-airrail
- /ch/zh/customer-support/faq/payment-options/cash-and-miles
- /cn/en/local-page/cnypromocode26
- /cn/en/local-page/promocode-pe-business-lx-in
- /cn/en/local-page/swiss-senses-promo
- /cn/zh/local-page/cnypromocode26
- /cn/zh/local-page/promocode-pe-business-lx-in
- /kr/it/book-and-manage/flights
- /th/en/local-page/promo-code-th-europe3000-lx

**Homepages whose stage (hero-card-overlay) is the Bengaluru campaign**; recorded: /ch/de and /ch/en (www: the NOV40 flash sale); /de/de and /us/en are recorded with their own campaigns and match www:

- /ca/de/homepage
- /ca/en/homepage
- /ca/fr/homepage
- /ca/it/homepage
- /ch/de/homepage
- /ch/el/homepage
- /ch/en/homepage
- /ch/es/homepage
- /ch/fr/homepage
- /ch/it/homepage
- /ch/ja/homepage
- /ch/pt/homepage
- /ch/ru/homepage
- /ch/zh/homepage
- /cn/en/homepage
- /cn/zh/homepage
- /hk/zh/homepage
- /in/en/homepage
- /it/de/homepage
- /it/fr/homepage
- /jp/de/homepage
- /jp/en/homepage
- /jp/fr/homepage
- /jp/it/homepage
- /jp/ja/homepage
- /kr/fr/homepage
- /kr/it/homepage
- /ru/ru/homepage
- /sg/zh/homepage
- /th/en/homepage
- /us/de/homepage
- /us/es/homepage
- /us/fr/homepage
- /us/it/homepage

Not stale: the magazine (/magazine/de, /magazine/en lead with a Bengaluru story on www too), the new-destinations pages and the Bengaluru articles and FAQs (content about the route; /ch/de/discover/new-destinations shows it on www).

The pages without a recording (all but four) are listed on the evidence of the recorded ones: the flight manager's promotion is the market's, so its 2026-11-02 campaign is very likely gone there too. A re-import of these documents needs captures of www taken after the change (the snapshots on this machine are from 2026-11-02/03); swiss-import.mjs and swiss-market-import.mjs are ema-lufthansa's this round.
