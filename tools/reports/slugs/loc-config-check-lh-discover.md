# translate.json against the localisation app (adobe/da-nx 69006f3b), site lh-discover

2026-11-09T00:17:35.850Z

translate.json: tools/loc/sites/lh-discover/translate.json (the language roots of lh-discover: /de/en, /de/de, /xx/fr).

All checks pass.

- OK   sheet config: 11 rows, total 11
- OK   sheet languages: 3 rows, total 3
- OK   sheet custom-doc-rules: 20 rows, total 20
- OK   sheet dnt-sheet-rules: 1 rows, total 1
- OK   translate.conflict.behavior default: merge
- OK   rollout.conflict.behavior default: merge
- OK   copy.conflict.behavior default: merge
- OK   sync.conflict.behavior default: merge
- OK   service: {"name":"Google","envs":{"prod":{"origin":"https://translate.da.live/google","link":"https://cloud.google.com/translate/docs/overview"}}}
- OK   source.language.detect is read and on (isSourceDetectEnabled, da-nx #793 + #870, release 1.29.1): true
- OK   source.language -> the English row at /de/en (every project's default source): {"name":"English","code":"en","location":"/de/en"}
- OK   the source row has no source of its own and no rollout locale; every other row is a translation from it: [["en","","de/en",[]],["de","de/en","de/de",[]],["fr","de/en","xx/fr",[]]]
- OK   no rollout rows or locales (option B: every language root holds a full copy; lh-edge serves the market roots): [["de/en>de/de","translation"],["de/en>xx/fr","translation"]]
- OK   every location is a root of its own (no root inside another): de/en, de/de, xx/fr
- OK   Skip is the first action of every row (a new project preselects it); the source row has Skip only, the others Skip|Translate: en:skip de:skip|translate fr:skip|translate
- OK   unique codes (options.js matches languages by code); no waiting languages (no "source language" column): en,de,fr
- OK   /de/en URLs: source /de/en (resolveSourceLang), every other row Skip|Translate: /de/en; German:skip|translate, French:skip|translate
- OK   translate /de/en/zz-check-page into German -> /de/de/zz-check-page.html (getSaveDestPath: the same slug, only the root changes): /de/de/zz-check-page.html
- OK   translate /de/en/zz-check-page into French -> /xx/fr/zz-check-page.html (getSaveDestPath: the same slug, only the root changes): /xx/fr/zz-check-page.html
- OK   /de/en URLs with every translation set -> translate view: translate
- OK   /de/de URLs: the app finds the source /de/de and offers no action (no translation starts there, no rollout is set up): /de/de; no rows
- OK   mixed /de/en and /de/de URLs: refused, the message names the URL to uncheck: URLs come from more than one source root (/de/en, /de/de). To keep /de/en, uncheck: /de/de/zz-check-page. Otherwise create a separate project for each root.
- OK   /us/en/zz-check-page matches no source root: Sync copies it into /de/en/us/en/zz-check-page.html: never put market URLs in a project: detected false; view sync; /de/en/us/en/zz-check-page.html
- OK   rules on a poi-map table: tr/no/tr | no/tr | ROW | no/tr (expected tr/no/tr | no/tr | ROW | no/tr)
- OK   rules on a hero-banner table: tr/tr | ROW (expected tr/tr | ROW)
- OK   rules on a carousel-lightbox table: tr/tr | no/tr (expected tr/tr | no/tr)
- OK   rules on a price-bar table: ROW | no/tr (expected ROW | no/tr)
- OK   rules on a blog-overview table: BLOCK | BLOCK (expected BLOCK | BLOCK)
- OK   rules on a security-waiting-time table (the site's own block): ROW | ROW | no/tr (expected ROW | ROW | no/tr)
- OK   rules on a lounge-finder table (the site's own block): no/tr (expected no/tr)
- OK   metadata of /de/en/homepage: only display texts translated: Title, Description, og:title, Breadcrumb title

## What reaches the translation service (addDnt on lh-com pages)

row/col and text of the cells that stay translatable, per block (other blocks: everything but the block name is translated)

| page | block | translatable cells |
|---|---|---|
| /de/en/homepage | flash-teaser | nothing |
| /de/en/homepage | flight-search | 1/2 "Flights"; 2/2 "Round trip"; 3/2 "Economy, 1 traveller"; 4/2 "Nonstop only"; 5/2 "Explore our destinations."; 6/2 "yes" |
| /de/en/homepage | section-metadata | nothing |
| /de/en/homepage | hero-card-overlay | 2/1 "Swap grey skies for blueSunshine, palm trees and t" |
| /de/en/homepage | fare-teaser | 6/2 "Round trip from"; 7/2 "https://www.discover-airlines.com/de/en/book/desti"; 8/2 "ConditionsThe prices displayed may vary and should" |
| /de/en/homepage | destination-finder | 1/2 "Flight offers from"; 3/2 "Please choose an origin city for fares for your re"; 4/2 "Round trip, One way"; 6/2 "yes"; 7/2 "Round trip from"; 8/2 "For all flight routes and prices, visit ourOffers " (+3) |
| /de/en/homepage | cards-icon | 1/2 "Pre-order food"; 2/2 "Traveling with pets"; 3/2 "Baggage"; 4/2 "Book an upgrade"; 5/2 "Destinations" |
| /de/en/homepage | metadata | 1/2 "Book tickets online now and fly out into the world"; 2/2 "Discover Airlines flies from Frankfurt and Munich "; 4/2 "Fly on vacation with Discover Airlines"; 5/2 "Home" |
