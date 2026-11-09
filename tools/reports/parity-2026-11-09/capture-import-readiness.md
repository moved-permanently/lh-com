# The capture round after 15:00 CET: what imports each capture (ema-lufthansa, the brief after 526 item 2)

For every page on capture-list-brands.txt (52, ema-lufthansa's) and capture-list-austrian-brussels.txt (56, ema-cashub's):
the importer and template that take the capture, what could go wrong, and who fixes it, so that the import after the
capture is mechanical. Nothing was captured; no request to any www. Dry run: /ch/en/homepage imported from the held
snapshot (brief 503's swiss-snapshots, the Bengaluru promotion) with swiss-import.mjs, against DA's copy (a read of
admin.da.live/source). Re-import lists are published as they stand (Ben's rule of today).

## ema-lufthansa's list (52)

| Pages | Importer, template | After the capture | Known gaps | Who fixes |
| --- | --- | --- | --- | --- |
| SWISS homepages, the ten reference roots ch/de, en, fr, it, es, pt, zh, ja, el, ru (page source) | swiss-import.mjs, homepage (import-homepage.bundle.js); then general-conditions-dialogs.mjs --host www.swiss.com (the dialog documents) | take them off the "# wait" lines of reimport-518-swiss-homepages.txt and import | the dry run against DA's copy: the stage's video was lost (fixed, 58a7fb1f), the icon tiles came as lufthansa.com's (fixed, SWISS row 46); left: (1) the footer disclaimer and its "General Conditions" link, where www's markup has them (after the destination finder, before the tiles; the link at /{cc}/{ll}/fragments/modals/{label}), while DA's ch/en and ch/de have them at the page's end (SWISS row 14's hand fix from the 2026-11-05 recording): the capture's /ch/en recording settles which; (2) the Breadcrumb title row (Home) DA has comes from a breadcrumb trail the homepage snapshots lack: the homepage hides its breadcrumb, nothing visible; (3) the promotion: the capture brings www's current one (2026-11-05: the NOV40 flash sale, no moving image): the stage without a video, the Bengaluru band gone | ema-lufthansa (1: the recording decides, then one rule); the harness imports |
| SWISS homepages, the 30 market roots (page source) | swiss-market-import.mjs (the market roots' own homepages), homepage | as above | the market importer's chain lacked the conditions step (withFinderConditions, brief 518) and the icon step (withSwissIcons): wired in (SWISS row 47); the default origin per market (withMarketOrigin) as before | ema-lufthansa (done); the harness imports |
| SWISS /ch/en/help-center, ITA /it/en/help-and-contact, Austrian /at/en/help-center, Brussels /be/en/contact (1440, 390) | recordings only (no re-import): the micro-frontend block (help-center-web) | measure the app's shadow h1 box and the header's bottom; set the offset per brand | the app draws in the browser: the recording must wait for help-center-web's shadow root; SWISS's page has no section padding (lufthansa.com's 56 / 36 px rule does not carry over) | ema-lufthansa (the micro-frontend block's per-brand offset); ITA, Austrian, Brussels rows: ema-cashub |
| Air Dolomiti /en/destinations (1440, 390, the booking bar stuck) | recording only: airdolomiti-import.mjs already writes www's display-booking-widget as flight-search (airdolomiti strip) (row 36; the document has it) | the stuck bar's box and the h1's top | no rule makes the strip sticky or compact yet (no position: sticky in flight-search or airdolomiti.css): a theme rule after the recording, no re-import | ema-lufthansa |
| Cargo /en/ci/facts-figures (1440, 390) | recording only: cargo-import.mjs's timeline | each timeline item's box after www's script | the heights come from www's script: a cargo.css rule after the recording | ema-lufthansa |
| Air Dolomiti de/flug-status, de/reisenformationen/schwangere-und-kinder, de/reisenformationen/tiere-an-bord, en/destinations/florence/what-to-see (page source with __NEXT_DATA__) | airdolomiti-import.mjs (from www's __NEXT_DATA__) | re-import the four (the importer decides the title fallback against www's Title block from the data) | the capture must keep the __NEXT_DATA__ script (a page source, not a rendered DOM without scripts) | the harness imports |
| Air Dolomiti en/articles/destinations/street-food-in-munich (1440, 390, __NEXT_DATA__) | airdolomiti-import.mjs, article | compare the h3's block and its photo | if www's block is a heading with a picture, the importer writes the h3 with the photo as today (row 74: the 26 px icon size); a picture block of its own would need a mapping | ema-lufthansa |
| Discover /de/en/book/baggage/excess-baggage (page source) | discover-import.mjs, info | read what www has before "This might also be of interest to you" | the empty accordion is dropped since b99ee4c0; if www has an accordion with items there, the importer misses them (a parser fix) | ema-lufthansa |

## ema-cashub's list (56)

| Pages | Importer, template | After the capture | Known gaps | Who fixes |
| --- | --- | --- | --- | --- |
| Austrian baggage: at/en, at/de/gepaeck, fr/fr, it/it, es/es, pl/pl, ru/ru, gr/el, jp/ja, cn/zh (1440, 390) | austrian-import.mjs, info | the boxed teasers (reimport-austrian-boxed-teasers.txt) | the harness's snapshot is older than www | ema-cashub |
| Austrian, part A: bearbeitungsgebuehren, unterhaltung-an-bord, culinary-services, online-check-in (the Tour Operator tab open) | austrian-import.mjs, info / info-faq | as each line of the list says | an open tab or panel must be captured as the list says | ema-cashub |
| Austrian, part B (one page per unrecorded type): local-page (info, info-faq, hub), book (checkin, form), book-and-manage (info), fly (form), footer-pages (form), plan (info), legal (form), local-pages (info), hu/en invoice request (form), th/en promptpay, us/en ski campaign (hub) | austrian-import.mjs, the template on each line | rank, then fix per type | forms: the lh-forms ids (preview only until lh-forms knows them) | ema-cashub |
| Brussels, part A: articles the-gambia and vibrant-senegal (the price bar), cancel-and-refund-requests (panels closed), our-payment-methods (the widget), problems-with-your-baggage (panels closed), legal-notices, families-and-children (no-break spaces) | brussels-import.mjs, article / info / info-faq | as each line says | panels and the chat assistant must be closed for the capture | ema-cashub |
| Brussels, part B (one page per unrecorded type): non-encrypt-mail, book-a-flight (form), check-in-options-and-info (info, info-faq), contact (info, form, info-faq), extra-services (info-gallery), farealert, flying-with-us (article), jobs (info, info-faq), legal-notices (form), local-page (hub, info, info-faq), lufthansa-group (info-faq, info), my-bookings (form), our-company (info), top (info-faq, form) | brussels-import.mjs, the template on each line | rank, then fix per type | as above | ema-cashub |

## Fixed for the round (ema-lufthansa, one commit each)

- 58a7fb1f (SWISS row 45): swiss-import.mjs withHeroVideo matches the stage picture as www's rendition (the dry run lost the video).
- d12d59d9 (SWISS row 46): swiss-import.mjs withSwissIcons, the tiles' SWISS icons (the dry run brought lufthansa.com's back).
- ce8ba142 (SWISS row 47): swiss-market-import.mjs runs withFinderConditions and withSwissIcons for the market homepages.

Air Dolomiti, Cargo, Discover and B2B: nothing on the lists needs an importer change before the capture (the AD hub's booking
strip is a block the importer already writes; the rest are recordings or re-imports through the importers as they are).
The ten SWISS reference roots and the 30 market roots are re-imported from the capture with
parity-2026-11-08/reimport-518-swiss-homepages.txt (its 40 "# wait (capture)" lines taken off), and published as they stand.
