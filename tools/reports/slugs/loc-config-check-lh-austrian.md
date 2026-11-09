# translate.json against the localisation app (adobe/da-nx 69006f3b), site lh-austrian

2026-11-09T00:17:34.471Z

translate.json: tools/loc/sites/lh-austrian/translate.json (the language roots of lh-austrian: /at/en, /at/de, /fr/fr, /it/it, /es/es, /gr/el, /jp/ja, /pl/pl, /ru/ru, /cn/zh).

All checks pass.

- OK   sheet config: 11 rows, total 11
- OK   sheet languages: 10 rows, total 10
- OK   sheet custom-doc-rules: 21 rows, total 21
- OK   sheet dnt-sheet-rules: 1 rows, total 1
- OK   translate.conflict.behavior default: merge
- OK   rollout.conflict.behavior default: merge
- OK   copy.conflict.behavior default: merge
- OK   sync.conflict.behavior default: merge
- OK   service: {"name":"Google","envs":{"prod":{"origin":"https://translate.da.live/google","link":"https://cloud.google.com/translate/docs/overview"}}}
- OK   source.language.detect is read and on (isSourceDetectEnabled, da-nx #793 + #870, release 1.29.1): true
- OK   source.language -> the English row at /at/en (every project's default source): {"name":"English","code":"en","location":"/at/en"}
- OK   the source row has no source of its own and no rollout locale; every other row is a translation from it: [["en","","at/en",[]],["de","at/en","at/de",[]],["fr","at/en","fr/fr",[]],["it","at/en","it/it",[]],["es","at/en","es/es",[]],["el","at/en","gr/el",[]],["ja","at/en","jp/ja",[]],["pl","at/en","pl/pl",[]],["ru","at/en","ru/ru",[]],["zh","at/en","cn/zh",[]]]
- OK   no rollout rows or locales (option B: every language root holds a full copy; lh-edge serves the market roots): [["at/en>at/de","translation"],["at/en>fr/fr","translation"],["at/en>it/it","translation"],["at/en>es/es","translation"],["at/en>gr/el","translation"],["at/en>jp/ja","translation"],["at/en>pl/pl","translation"],["at/en>ru/ru","translation"],["at/en>cn/zh","translation"]]
- OK   every location is a root of its own (no root inside another): at/en, at/de, fr/fr, it/it, es/es, gr/el, jp/ja, pl/pl, ru/ru, cn/zh
- OK   Skip is the first action of every row (a new project preselects it); the source row has Skip only, the others Skip|Translate: en:skip de:skip|translate fr:skip|translate it:skip|translate es:skip|translate el:skip|translate ja:skip|translate pl:skip|translate ru:skip|translate zh:skip|translate
- OK   unique codes (options.js matches languages by code); no waiting languages (no "source language" column): en,de,fr,it,es,el,ja,pl,ru,zh
- OK   /at/en URLs: source /at/en (resolveSourceLang), every other row Skip|Translate: /at/en; German:skip|translate, French:skip|translate, Italian:skip|translate, Spanish:skip|translate, Greek:skip|translate, Japanese:skip|translate, Polish:skip|translate, Russian:skip|translate, Chinese:skip|translate
- OK   translate /at/en/zz-check-page into German -> /at/de/zz-check-page.html (getSaveDestPath: the same slug, only the root changes): /at/de/zz-check-page.html
- OK   translate /at/en/zz-check-page into French -> /fr/fr/zz-check-page.html (getSaveDestPath: the same slug, only the root changes): /fr/fr/zz-check-page.html
- OK   translate /at/en/zz-check-page into Italian -> /it/it/zz-check-page.html (getSaveDestPath: the same slug, only the root changes): /it/it/zz-check-page.html
- OK   translate /at/en/zz-check-page into Spanish -> /es/es/zz-check-page.html (getSaveDestPath: the same slug, only the root changes): /es/es/zz-check-page.html
- OK   translate /at/en/zz-check-page into Greek -> /gr/el/zz-check-page.html (getSaveDestPath: the same slug, only the root changes): /gr/el/zz-check-page.html
- OK   translate /at/en/zz-check-page into Japanese -> /jp/ja/zz-check-page.html (getSaveDestPath: the same slug, only the root changes): /jp/ja/zz-check-page.html
- OK   translate /at/en/zz-check-page into Polish -> /pl/pl/zz-check-page.html (getSaveDestPath: the same slug, only the root changes): /pl/pl/zz-check-page.html
- OK   translate /at/en/zz-check-page into Russian -> /ru/ru/zz-check-page.html (getSaveDestPath: the same slug, only the root changes): /ru/ru/zz-check-page.html
- OK   translate /at/en/zz-check-page into Chinese -> /cn/zh/zz-check-page.html (getSaveDestPath: the same slug, only the root changes): /cn/zh/zz-check-page.html
- OK   /at/en URLs with every translation set -> translate view: translate
- OK   /at/de URLs: the app finds the source /at/de and offers no action (no translation starts there, no rollout is set up): /at/de; no rows
- OK   mixed /at/en and /at/de URLs: refused, the message names the URL to uncheck: URLs come from more than one source root (/at/en, /at/de). To keep /at/en, uncheck: /at/de/zz-check-page. Otherwise create a separate project for each root.
- OK   /ch/de/zz-check-page matches no source root: Sync copies it into /at/en/ch/de/zz-check-page.html: never put market URLs in a project: detected false; view sync; /at/en/ch/de/zz-check-page.html
- OK   rules on a poi-map table: tr/no/tr | no/tr | ROW | no/tr (expected tr/no/tr | no/tr | ROW | no/tr)
- OK   rules on a hero-banner table: tr/tr | ROW (expected tr/tr | ROW)
- OK   rules on a carousel-lightbox table: tr/tr | no/tr (expected tr/tr | no/tr)
- OK   rules on a price-bar table: ROW | no/tr (expected ROW | no/tr)
- OK   rules on a blog-overview table: BLOCK | BLOCK (expected BLOCK | BLOCK)
- OK   rules on a lounge-finder table (the site's own block): no/tr (expected no/tr)
- OK   rules on a ejournals table (the site's own block): ROW | ROW | no/tr (expected ROW | ROW | no/tr)
- OK   rules on a checkin-deadlines table (the site's own block): ROW | no/tr (expected ROW | no/tr)
- OK   metadata of /at/en/baggage: only display texts translated: Title, Description, og:title, Parent title, Breadcrumb title
- OK   metadata of /at/en/homepage: only display texts translated: Breadcrumb Title, Title, Description, og:title

## What reaches the translation service (addDnt on lh-com pages)

row/col and text of the cells that stay translatable, per block (other blocks: everything but the block name is translated)

| page | block | translatable cells |
|---|---|---|
| /at/en/baggage | metadata | 4/2 "All the information you need about baggage | Austr"; 5/2 "Prepare for your trip and find out about the diffe"; 7/2 "All the information you need about baggage"; 10/2 "Homepage"; 11/2 "Baggage" |
| /at/en/homepage | flash-teaser | nothing |
| /at/en/homepage | flight-search | 1/2 "https://shop.austrian.com/booking/availability"; 2/2 "Vienna (VIE)"; 3/2 "Flights"; 4/2 "Round trip"; 5/2 "Economy, 1 traveller"; 6/2 "Nonstop only" (+3) |
| /at/en/homepage | hero-card-overlay | 2/1 "Win a travel voucher worth €500North America, your" |
| /at/en/homepage | fare-teaser | 6/2 "Round trip from"; 7/2 "https://www.austrian.com/at/en/book/destination?Or"; 8/2 "ConditionsThe prices displayed may vary and should" |
| /at/en/homepage | destination-finder | 1/2 "Flight offers from"; 3/2 "Please choose an origin city for fares for your re"; 4/2 "Round trip, One way"; 6/2 "Round trip from"; 7/2 "For all flight routes and prices, visit ourOffers "; 8/2 "All offers & destinations" (+2) |
| /at/en/homepage | cards-icon | 1/2 "Hotels"; 2/2 "Rental car"; 3/2 "Parking at the airport"; 4/2 "Tours & activities"; 5/2 "All extra services" |
| /at/en/homepage | metadata | 1/2 "Homepage"; 4/2 "Book flights now - explore dream destinations with"; 5/2 "Travel with Austrian Airlines to over 120 destinat"; 7/2 "Book flights now - explore dream destinations with" |
