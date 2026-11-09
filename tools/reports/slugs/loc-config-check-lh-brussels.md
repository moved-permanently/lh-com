# translate.json against the localisation app (adobe/da-nx 69006f3b), site lh-brussels

2026-11-09T00:17:35.403Z

translate.json: tools/loc/sites/lh-brussels/translate.json (the language roots of lh-brussels: /be/en, /be/fr, /be/nl, /it/it, /de/de, /es/es).

All checks pass.

- OK   sheet config: 11 rows, total 11
- OK   sheet languages: 6 rows, total 6
- OK   sheet custom-doc-rules: 20 rows, total 20
- OK   sheet dnt-sheet-rules: 1 rows, total 1
- OK   translate.conflict.behavior default: merge
- OK   rollout.conflict.behavior default: merge
- OK   copy.conflict.behavior default: merge
- OK   sync.conflict.behavior default: merge
- OK   service: {"name":"Google","envs":{"prod":{"origin":"https://translate.da.live/google","link":"https://cloud.google.com/translate/docs/overview"}}}
- OK   source.language.detect is read and on (isSourceDetectEnabled, da-nx #793 + #870, release 1.29.1): true
- OK   source.language -> the English row at /be/en (every project's default source): {"name":"English","code":"en","location":"/be/en"}
- OK   the source row has no source of its own and no rollout locale; every other row is a translation from it: [["en","","be/en",[]],["fr","be/en","be/fr",[]],["nl","be/en","be/nl",[]],["it","be/en","it/it",[]],["de","be/en","de/de",[]],["es","be/en","es/es",[]]]
- OK   no rollout rows or locales (option B: every language root holds a full copy; lh-edge serves the market roots): [["be/en>be/fr","translation"],["be/en>be/nl","translation"],["be/en>it/it","translation"],["be/en>de/de","translation"],["be/en>es/es","translation"]]
- OK   every location is a root of its own (no root inside another): be/en, be/fr, be/nl, it/it, de/de, es/es
- OK   Skip is the first action of every row (a new project preselects it); the source row has Skip only, the others Skip|Translate: en:skip fr:skip|translate nl:skip|translate it:skip|translate de:skip|translate es:skip|translate
- OK   unique codes (options.js matches languages by code); no waiting languages (no "source language" column): en,fr,nl,it,de,es
- OK   /be/en URLs: source /be/en (resolveSourceLang), every other row Skip|Translate: /be/en; French:skip|translate, Dutch:skip|translate, Italian:skip|translate, German:skip|translate, Spanish:skip|translate
- OK   translate /be/en/zz-check-page into French -> /be/fr/zz-check-page.html (getSaveDestPath: the same slug, only the root changes): /be/fr/zz-check-page.html
- OK   translate /be/en/zz-check-page into Dutch -> /be/nl/zz-check-page.html (getSaveDestPath: the same slug, only the root changes): /be/nl/zz-check-page.html
- OK   translate /be/en/zz-check-page into Italian -> /it/it/zz-check-page.html (getSaveDestPath: the same slug, only the root changes): /it/it/zz-check-page.html
- OK   translate /be/en/zz-check-page into German -> /de/de/zz-check-page.html (getSaveDestPath: the same slug, only the root changes): /de/de/zz-check-page.html
- OK   translate /be/en/zz-check-page into Spanish -> /es/es/zz-check-page.html (getSaveDestPath: the same slug, only the root changes): /es/es/zz-check-page.html
- OK   /be/en URLs with every translation set -> translate view: translate
- OK   /be/fr URLs: the app finds the source /be/fr and offers no action (no translation starts there, no rollout is set up): /be/fr; no rows
- OK   mixed /be/en and /be/fr URLs: refused, the message names the URL to uncheck: URLs come from more than one source root (/be/en, /be/fr). To keep /be/en, uncheck: /be/fr/zz-check-page. Otherwise create a separate project for each root.
- OK   /fr/fr/zz-check-page matches no source root: Sync copies it into /be/en/fr/fr/zz-check-page.html: never put market URLs in a project: detected false; view sync; /be/en/fr/fr/zz-check-page.html
- OK   rules on a poi-map table: tr/no/tr | no/tr | ROW | no/tr (expected tr/no/tr | no/tr | ROW | no/tr)
- OK   rules on a hero-banner table: tr/tr | ROW (expected tr/tr | ROW)
- OK   rules on a carousel-lightbox table: tr/tr | no/tr (expected tr/tr | no/tr)
- OK   rules on a price-bar table: ROW | no/tr (expected ROW | no/tr)
- OK   rules on a blog-overview table: BLOCK | BLOCK (expected BLOCK | BLOCK)
- OK   rules on a lounge-finder table (the site's own block): no/tr (expected no/tr)
- OK   rules on a ejournals table (the site's own block): ROW | ROW | no/tr (expected ROW | ROW | no/tr)
- OK   metadata of /be/en/homepage: only display texts translated: Title, Description, og:title, Breadcrumb Title

## What reaches the translation service (addDnt on lh-com pages)

row/col and text of the cells that stay translatable, per block (other blocks: everything but the block name is translated)

| page | block | translatable cells |
|---|---|---|
| /be/en/homepage | flash-teaser | nothing |
| /be/en/homepage | flight-search | 1/2 "https://shop.brusselsairlines.com/booking/availabi"; 2/2 "Brussels (BRU)"; 3/2 "Flights"; 4/2 "Round trip"; 5/2 "Economy, 1 traveller"; 6/2 "{CABIN}, {COUNT} traveller" (+5) |
| /be/en/homepage | section-metadata | nothing |
| /be/en/homepage | hero-card-overlay | 2/1 "Family time, far awayUp to 50% off for kidsBook no" |
| /be/en/homepage | fare-teaser | 6/2 "ConditionsThe prices displayed may vary and should" |
| /be/en/homepage | destination-finder | 1/2 "Flight offers from"; 3/2 "Please choose an origin city for fares for your re"; 4/2 "Round trip, One way"; 6/2 "Round trip from"; 7/2 "For all flight routes and prices, visit ourOffers "; 8/2 "All offers & destinations" (+2) |
| /be/en/homepage | cards-icon | 1/2 "Hotels"; 2/2 "Rental car"; 3/2 "Parking at the airport"; 4/2 "Tours and activities"; 5/2 "All extra services" |
| /be/en/homepage | metadata | 4/2 "Discover the world – book flights with Brussels Ai"; 5/2 "Plan your next adventure with Brussels Airlines ✈️"; 7/2 "Discover the world – book flights with Brussels Ai"; 8/2 "Home" |
