# translate.json against the localisation app (adobe/da-nx 69006f3b), site lh-swiss

2026-11-09T00:17:34.952Z

translate.json: tools/loc/sites/lh-swiss/translate.json (the language roots of lh-swiss: /ch/en, /ch/de, /ch/fr, /ch/it, /ch/es, /ch/ru, /ch/pt, /ch/el, /ch/zh, /ch/ja, /kr/ko).

All checks pass.

- OK   sheet config: 11 rows, total 11
- OK   sheet languages: 11 rows, total 11
- OK   sheet custom-doc-rules: 21 rows, total 21
- OK   sheet dnt-sheet-rules: 1 rows, total 1
- OK   translate.conflict.behavior default: merge
- OK   rollout.conflict.behavior default: merge
- OK   copy.conflict.behavior default: merge
- OK   sync.conflict.behavior default: merge
- OK   service: {"name":"Google","envs":{"prod":{"origin":"https://translate.da.live/google","link":"https://cloud.google.com/translate/docs/overview"}}}
- OK   source.language.detect is read and on (isSourceDetectEnabled, da-nx #793 + #870, release 1.29.1): true
- OK   source.language -> the English row at /ch/en (every project's default source): {"name":"English","code":"en","location":"/ch/en"}
- OK   the source row has no source of its own and no rollout locale; every other row is a translation from it: [["en","","ch/en",[]],["de","ch/en","ch/de",[]],["fr","ch/en","ch/fr",[]],["it","ch/en","ch/it",[]],["es","ch/en","ch/es",[]],["ru","ch/en","ch/ru",[]],["pt","ch/en","ch/pt",[]],["el","ch/en","ch/el",[]],["zh","ch/en","ch/zh",[]],["ja","ch/en","ch/ja",[]],["ko","ch/en","kr/ko",[]]]
- OK   no rollout rows or locales (option B: every language root holds a full copy; lh-edge serves the market roots): [["ch/en>ch/de","translation"],["ch/en>ch/fr","translation"],["ch/en>ch/it","translation"],["ch/en>ch/es","translation"],["ch/en>ch/ru","translation"],["ch/en>ch/pt","translation"],["ch/en>ch/el","translation"],["ch/en>ch/zh","translation"],["ch/en>ch/ja","translation"],["ch/en>kr/ko","translation"]]
- OK   every location is a root of its own (no root inside another): ch/en, ch/de, ch/fr, ch/it, ch/es, ch/ru, ch/pt, ch/el, ch/zh, ch/ja, kr/ko
- OK   Skip is the first action of every row (a new project preselects it); the source row has Skip only, the others Skip|Translate: en:skip de:skip|translate fr:skip|translate it:skip|translate es:skip|translate ru:skip|translate pt:skip|translate el:skip|translate zh:skip|translate ja:skip|translate ko:skip|translate
- OK   unique codes (options.js matches languages by code); no waiting languages (no "source language" column): en,de,fr,it,es,ru,pt,el,zh,ja,ko
- OK   /ch/en URLs: source /ch/en (resolveSourceLang), every other row Skip|Translate: /ch/en; German:skip|translate, French:skip|translate, Italian:skip|translate, Spanish:skip|translate, Russian:skip|translate, Portuguese:skip|translate, Greek:skip|translate, Chinese:skip|translate, Japanese:skip|translate, Korean:skip|translate
- OK   translate /ch/en/zz-check-page into German -> /ch/de/zz-check-page.html (getSaveDestPath: the same slug, only the root changes): /ch/de/zz-check-page.html
- OK   translate /ch/en/zz-check-page into French -> /ch/fr/zz-check-page.html (getSaveDestPath: the same slug, only the root changes): /ch/fr/zz-check-page.html
- OK   translate /ch/en/zz-check-page into Italian -> /ch/it/zz-check-page.html (getSaveDestPath: the same slug, only the root changes): /ch/it/zz-check-page.html
- OK   translate /ch/en/zz-check-page into Spanish -> /ch/es/zz-check-page.html (getSaveDestPath: the same slug, only the root changes): /ch/es/zz-check-page.html
- OK   translate /ch/en/zz-check-page into Russian -> /ch/ru/zz-check-page.html (getSaveDestPath: the same slug, only the root changes): /ch/ru/zz-check-page.html
- OK   translate /ch/en/zz-check-page into Portuguese -> /ch/pt/zz-check-page.html (getSaveDestPath: the same slug, only the root changes): /ch/pt/zz-check-page.html
- OK   translate /ch/en/zz-check-page into Greek -> /ch/el/zz-check-page.html (getSaveDestPath: the same slug, only the root changes): /ch/el/zz-check-page.html
- OK   translate /ch/en/zz-check-page into Chinese -> /ch/zh/zz-check-page.html (getSaveDestPath: the same slug, only the root changes): /ch/zh/zz-check-page.html
- OK   translate /ch/en/zz-check-page into Japanese -> /ch/ja/zz-check-page.html (getSaveDestPath: the same slug, only the root changes): /ch/ja/zz-check-page.html
- OK   translate /ch/en/zz-check-page into Korean -> /kr/ko/zz-check-page.html (getSaveDestPath: the same slug, only the root changes): /kr/ko/zz-check-page.html
- OK   /ch/en URLs with every translation set -> translate view: translate
- OK   /ch/de URLs: the app finds the source /ch/de and offers no action (no translation starts there, no rollout is set up): /ch/de; no rows
- OK   mixed /ch/en and /ch/de URLs: refused, the message names the URL to uncheck: URLs come from more than one source root (/ch/en, /ch/de). To keep /ch/en, uncheck: /ch/de/zz-check-page. Otherwise create a separate project for each root.
- OK   /de/en/zz-check-page matches no source root: Sync copies it into /ch/en/de/en/zz-check-page.html: never put market URLs in a project: detected false; view sync; /ch/en/de/en/zz-check-page.html
- OK   rules on a poi-map table: tr/no/tr | no/tr | ROW | no/tr (expected tr/no/tr | no/tr | ROW | no/tr)
- OK   rules on a hero-banner table: tr/tr | ROW (expected tr/tr | ROW)
- OK   rules on a carousel-lightbox table: tr/tr | no/tr (expected tr/tr | no/tr)
- OK   rules on a price-bar table: ROW | no/tr (expected ROW | no/tr)
- OK   rules on a blog-overview table: BLOCK | BLOCK (expected BLOCK | BLOCK)
- OK   rules on a lounge-finder table (the site's own block): no/tr (expected no/tr)
- OK   rules on a ejournals table (the site's own block): ROW | ROW | no/tr (expected ROW | ROW | no/tr)
- OK   rules on a checkin-deadlines table (the site's own block): ROW | no/tr (expected ROW | no/tr)
- OK   metadata of /ch/en/homepage: only display texts translated: Title, Description, og:title, Breadcrumb title

## What reaches the translation service (addDnt on lh-com pages)

row/col and text of the cells that stay translatable, per block (other blocks: everything but the block name is translated)

| page | block | translatable cells |
|---|---|---|
| /ch/en/homepage | flash-teaser | nothing |
| /ch/en/homepage | flight-search | 1/2 "https://shop.swiss.com/booking/availability"; 2/2 "Zurich (ZRH)"; 3/2 "Flights"; 4/2 "Round trip"; 5/2 "Economy, 1 traveller"; 6/2 "yes" (+8) |
| /ch/en/homepage | hero-card-overlay | 1/1 "/content/dam/lx/video/bengaluru-header-video-80174"; 2/1 "Discover IndiaFrom 27 October, fly from Zurich to " |
| /ch/en/homepage | fare-teaser | 6/2 "Round trip from"; 7/2 "ConditionsThe prices displayed may vary and should" |
| /ch/en/homepage | destination-finder | 1/2 "Flight offers from"; 3/2 "Please choose an origin city for fares for your re"; 4/2 "Round trip, One way"; 6/2 "Round trip from"; 7/2 "For all flight routes and prices, visit ourOffers "; 8/2 "All offers & destinations" (+2) |
| /ch/en/homepage | cards-icon | 1/2 "Hotels"; 2/2 "Rental car"; 3/2 "Parking at the airport"; 4/2 "Tours & activities"; 5/2 "All extra services" |
| /ch/en/homepage | metadata | 3/2 "Book flights with SWISS - your journey starts here"; 4/2 "Fly with SWISS to exciting destinations worldwide "; 6/2 "Book flights with SWISS - your journey starts here"; 7/2 "Home" |
