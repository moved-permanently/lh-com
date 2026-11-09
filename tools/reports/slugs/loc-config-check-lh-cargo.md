# translate.json against the localisation app (adobe/da-nx 69006f3b), site lh-cargo

2026-11-09T00:17:36.374Z

translate.json: tools/loc/sites/lh-cargo/translate.json (the language roots of lh-cargo: /en, /de).

All checks pass.

- OK   sheet config: 11 rows, total 11
- OK   sheet languages: 2 rows, total 2
- OK   sheet custom-doc-rules: 22 rows, total 22
- OK   sheet dnt-sheet-rules: 1 rows, total 1
- OK   translate.conflict.behavior default: merge
- OK   rollout.conflict.behavior default: merge
- OK   copy.conflict.behavior default: merge
- OK   sync.conflict.behavior default: merge
- OK   service: {"name":"Google","envs":{"prod":{"origin":"https://translate.da.live/google","link":"https://cloud.google.com/translate/docs/overview"}}}
- OK   source.language.detect is read and on (isSourceDetectEnabled, da-nx #793 + #870, release 1.29.1): true
- OK   source.language -> the English row at /en (every project's default source): {"name":"English","code":"en","location":"/en"}
- OK   the source row has no source of its own and no rollout locale; every other row is a translation from it: [["en","","en",[]],["de","en","de",[]]]
- OK   no rollout rows or locales (option B: every language root holds a full copy; lh-edge serves the market roots): [["en>de","translation"]]
- OK   every location is a root of its own (no root inside another): en, de
- OK   Skip is the first action of every row (a new project preselects it); the source row has Skip only, the others Skip|Translate: en:skip de:skip|translate
- OK   unique codes (options.js matches languages by code); no waiting languages (no "source language" column): en,de
- OK   /en URLs: source /en (resolveSourceLang), every other row Skip|Translate: /en; German:skip|translate
- OK   translate /en/zz-check-page into German -> /de/zz-check-page.html (getSaveDestPath: the same slug, only the root changes): /de/zz-check-page.html
- OK   /en URLs with every translation set -> translate view: translate
- OK   /de URLs: the app finds the source /de and offers no action (no translation starts there, no rollout is set up): /de; no rows
- OK   mixed /en and /de URLs: refused, the message names the URL to uncheck: URLs come from more than one source root (/en, /de). To keep /en, uncheck: /de/zz-check-page. Otherwise create a separate project for each root.
- OK   /fr/zz-check-page matches no source root: Sync copies it into /en/fr/zz-check-page.html: never put market URLs in a project: detected false; view sync; /en/fr/zz-check-page.html
- OK   rules on a poi-map table: tr/no/tr | no/tr | ROW | no/tr (expected tr/no/tr | no/tr | ROW | no/tr)
- OK   rules on a hero-banner table: tr/tr | ROW (expected tr/tr | ROW)
- OK   rules on a carousel-lightbox table: tr/tr | no/tr (expected tr/tr | no/tr)
- OK   rules on a price-bar table: ROW | no/tr (expected ROW | no/tr)
- OK   rules on a blog-overview table: BLOCK | BLOCK (expected BLOCK | BLOCK)
- OK   rules on a news-feed table (the site's own block): ROW | ROW | no/tr (expected ROW | ROW | no/tr)
- OK   rules on a newsletter-form table (the site's own block): ROW | ROW | no/tr (expected ROW | ROW | no/tr)
- OK   rules on a newsroom table (the site's own block): ROW | no/tr (expected ROW | no/tr)
- OK   rules on a notifications table (the site's own block): no/tr (expected no/tr)
- OK   metadata of /en/home: only display texts translated: Title, Description

## What reaches the translation service (addDnt on lh-com pages)

row/col and text of the cells that stay translatable, per block (other blocks: everything but the block name is translated)

| page | block | translatable cells |
|---|---|---|
| /en/home | hero-campaign | 2/1 "Boost your booking: Add-on Service Emergency.Your "; 4/1 "eAWB Data CaptureIncrease your efficiency with our"; 6/1 "New eBookingSmart Offers. Intuitive bookings. Tail" |
| /en/home | cards-icon | 1/2 "Booking"; 2/2 "Track"; 3/2 "Schedule"; 4/2 "Stations" |
| /en/home | booking-lookup | 1/2 "Track your shipment"; 2/2 "Create bookingeBooking dashboard"; 3/2 "AWB Prefix"; 4/2 "020"; 5/2 "Air waybill number"; 6/2 "Please enter a valid AWB prefix" (+2) |
| /en/home | news-feed | nothing |
| /en/home | hero-card-overlay | 2/1 "The right ULDs for every cargoWe carry more than 3" |
| /en/home | metadata | 1/2 "Your expert for air freight - Lufthansa Cargo"; 2/2 "Put your trust in the professionals at Lufthansa C" |
