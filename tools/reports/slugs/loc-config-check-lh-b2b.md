# translate.json against the localisation app (adobe/da-nx 69006f3b), site lh-b2b

2026-11-09T00:17:36.978Z

translate.json: tools/loc/sites/lh-b2b/translate.json (the language roots of lh-b2b: /de/en, /de/de).

All checks pass.

- OK   sheet config: 11 rows, total 11
- OK   sheet languages: 2 rows, total 2
- OK   sheet custom-doc-rules: 20 rows, total 20
- OK   sheet dnt-sheet-rules: 1 rows, total 1
- OK   translate.conflict.behavior default: merge
- OK   rollout.conflict.behavior default: merge
- OK   copy.conflict.behavior default: merge
- OK   sync.conflict.behavior default: merge
- OK   service: {"name":"Google","envs":{"prod":{"origin":"https://translate.da.live/google","link":"https://cloud.google.com/translate/docs/overview"}}}
- OK   source.language.detect is read and on (isSourceDetectEnabled, da-nx #793 + #870, release 1.29.1): true
- OK   source.language -> the English row at /de/en (every project's default source): {"name":"English","code":"en","location":"/de/en"}
- OK   the source row has no source of its own and no rollout locale; every other row is a translation from it: [["en","","de/en",[]],["de","de/en","de/de",[]]]
- OK   no rollout rows or locales (option B: every language root holds a full copy; lh-edge serves the market roots): [["de/en>de/de","translation"]]
- OK   every location is a root of its own (no root inside another): de/en, de/de
- OK   Skip is the first action of every row (a new project preselects it); the source row has Skip only, the others Skip|Translate: en:skip de:skip|translate
- OK   unique codes (options.js matches languages by code); no waiting languages (no "source language" column): en,de
- OK   /de/en URLs: source /de/en (resolveSourceLang), every other row Skip|Translate: /de/en; German:skip|translate
- OK   translate /de/en/zz-check-page into German -> /de/de/zz-check-page.html (getSaveDestPath: the same slug, only the root changes): /de/de/zz-check-page.html
- OK   /de/en URLs with every translation set -> translate view: translate
- OK   /de/de URLs: the app finds the source /de/de and offers no action (no translation starts there, no rollout is set up): /de/de; no rows
- OK   mixed /de/en and /de/de URLs: refused, the message names the URL to uncheck: URLs come from more than one source root (/de/en, /de/de). To keep /de/en, uncheck: /de/de/zz-check-page. Otherwise create a separate project for each root.
- OK   /xx/en/zz-check-page matches no source root: Sync copies it into /de/en/xx/en/zz-check-page.html: never put market URLs in a project: detected false; view sync; /de/en/xx/en/zz-check-page.html
- OK   rules on a poi-map table: tr/no/tr | no/tr | ROW | no/tr (expected tr/no/tr | no/tr | ROW | no/tr)
- OK   rules on a hero-banner table: tr/tr | ROW (expected tr/tr | ROW)
- OK   rules on a carousel-lightbox table: tr/tr | no/tr (expected tr/tr | no/tr)
- OK   rules on a price-bar table: ROW | no/tr (expected ROW | no/tr)
- OK   rules on a blog-overview table: BLOCK | BLOCK (expected BLOCK | BLOCK)
- OK   rules on a b2b-login table (the site's own block): no/tr (expected no/tr)
- OK   rules on a b2b-member table (the site's own block): no/tr (expected no/tr)
- OK   rules on a hotline-finder table (the site's own block): ROW | ROW | no/tr (expected ROW | ROW | no/tr)
- OK   metadata of /de/en/homepage: only display texts translated: Title, og:title, Breadcrumb title

## What reaches the translation service (addDnt on lh-com pages)

row/col and text of the cells that stay translatable, per block (other blocks: everything but the block name is translated)

| page | block | translatable cells |
|---|---|---|
| /de/en/homepage | cards-icon-text | 1/2 "Travel ID – one login, lots of optionsWith Travel "; 2/2 "Joint ventures: Teaming up the worldThrough our fo"; 3/2 "Route network: Limitless connectionsDiscover the L"; 4/2 "Sustainability: More travel optionsDiscover how in"; 1/2 "Lufthansa Group for Business on LinkedInFollow us " |
| /de/en/homepage | metadata | 4/2 "Welcome to Lufthansa Group for Business | Lufthans"; 6/2 "Welcome to Lufthansa Group for Business"; 8/2 "Home" |
