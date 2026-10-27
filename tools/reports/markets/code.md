# Code that assumes the four roots (all markets, package 1, part b)

2026-10-27. Read only: nothing was changed. Today's roots: `/de/en`, `/de/de`, `/at/de`, `/gb/en`.
Each entry: where, what it fixes to the four roots, what it needs for any number of roots.

## The central change: one locale table as data

`scripts/locale.js` 8-23 `LOCALES` (country, lang, homeAirport, currency per root) and
`DEFAULT_LOCALE = 'de/de'`. `getLocale()` (30-49) knows only these keys: any other root borrows a
migrated locale of the same language, else de/de, so `/fr/fr/…` today renders with German
labels, the `/de/de/nav` and `/de/de/footer`, FRA, EUR and `X-Portal-Site: DE`; `/us/en` and
`/ch/en` render as de/en. Most code below reads `getLocale()` or `LOCALES`, so a table with one
row per root (country, lang, name, homeAirport, currency, timeZone, shopLang, date style,
hreflang) fixes many places at once. lh-edge bundles `scripts/locale.js` (entry, changelocale,
llms, g4t, select-language, sdui-web), so the table must be readable by the browser and by the
worker: a JSON file in the code (imported at build time by the worker, fetched or imported by the
page), not only a DA sheet.

## Page code (scripts/, blocks/, widgets/)

| Where | Fixed today | Needs |
| --- | --- | --- |
| `scripts/locale.js` 8-23, 38-43 | `LOCALES`, `DEFAULT_LOCALE`, same-language borrowing | the table above; borrowing only for market-only pages |
| `scripts/locale.js` 81-95 | `/data/locale-map.json` (counterpart pages) | nothing in code; the map regenerated with every root (linear `find`: index by path once there are many roots) |
| `scripts/clock.js` 24-29 (and stage-promotions) | `MARKET_TIME_ZONES` de, at, gb | `timeZone` per root (a default zone for us, ca, br, au …) |
| `scripts/lh-api.js` 669 | currency symbol before the price when `lang === 'en'` | `Intl.NumberFormat` parts or a column |
| `scripts/lh-data.js` 104-113, 338-342 | `X-Portal-*` headers and Accept-Language from `LOCALES` (unknown market: none; destinationfinder answers 400 without) | the table |
| `scripts/lh-data.js` 324, 392; `scripts/lh-api.js` 760-788; `data/recorded/` | recorded API answers for the 4 markets only | record per root, or no offline fallback there |
| `scripts/shop-handoff.js` 11-16 | `SHOP_LANG` for 4 roots (3 unverified) | `shopLang` per root |
| `scripts/channel.js` 24; `blocks/header/header.js` 672 | `FLYNET_LOCALES` de/en, de/de | nothing (lh-flynet, not a lufthansa.com root) |
| `scripts/scripts.js` 421-425 | `/` → `/de/de/homepage` in the browser | keep as fallback (lh-edge redirects by geo) |
| `scripts/not-found.js` 19-44, 84, 102 | texts en, de with slugs `flugsuche`, `meine-buchungen`; outside `LOCALES` → `/de/en/` | texts per language, slugs from the locale map |
| `scripts/articles.js` 159-183 | `MONTHS` en, de; US date style for en outside de/at/ch | `Intl.DateTimeFormat(lang-COUNTRY)` |
| `scripts/consent-banner.js` 10-60, 100-103, 289 | fallback banner texts en, de; links `/xx/en`, `/de/de` | texts per language (OneTrust has them), links per root |
| `scripts/media.js` 24-32 | video labels en, de | labels per language |
| `scripts/site-search.js` 31-35, 108-113 | stopwords en, de; plural suffixes; Latin-only folding (also lh-edge search) | stopwords per language; a tokenizer for ja, zh, ko |
| `scripts/lh-forms.js` 20-32 | `FORM_IDS` by English and German slugs | slugs of the other languages, or a metadata field |
| `scripts/block-config.js` 78-85 | label fallback to English for every other language | nothing (it is why new languages show English) |
| `blocks/header/header.js` 29-67, 256-275 | `LOCALE_NAMES` (4), `LABELS` en, de, dialog lists every key of `LOCALES` | names per root; labels per language; with many roots a country select plus that country's languages (as www) |
| `blocks/footer/footer.js` 16-23 | labels en, de | labels per language |
| about 20 blocks with en/de label dictionaries: flash-teaser, flight-status, lounge-finder, search-results, booking-lookup, form, destination-finder, destination-offer, fare-teaser, price-bar, flight-search, blog-overview, article-header, carousel-cards/-images/-lightbox, columns-media, hero-campaign, poi-map, ejournals, car-rental | other languages fall back to English | labels per language (www's label services `/service/api/labels/<app>/lh/<lang>` have them; a labels sheet per language) |
| `blocks/car-rental/car-rental.js` 33-46, 201 | country names de, at, gb; partner ids by slug | `Intl.DisplayNames`; slugs per language |
| `blocks/article-header/article-header.js` 84, 90 | `de-AT` special case, `d. month yyyy` | `Intl` per root |
| `blocks/form/form-rules.js` 228-231 | date mask `DD.MM.YYYY` (de) or `DD/MM/YYYY` | per root (us `MM/DD/YYYY`) |
| `blocks/breadcrumb/breadcrumb.js` 150 | aria label de or en | labels per language |
| `widgets/lh-app/lh-app.json` 20-30, 96-120 | labels en, de; `X-Language-Country` and script versions per 4 roots | a row per root or derive from lang and country |
| fine as they are | stage-promotions document path, message-center and flash-teaser (market and language from the path, English fallback), related-articles, search-results paths, `${locale.base}/nav` and `/footer` (need the documents), slugs like `timetable-and-flight-status` (same in every market of a language: verify per language) | – |

## Edge Delivery configuration

| Where | Fixed today | Needs |
| --- | --- | --- |
| `helix-sitemap.yaml` 14-34 | 4 `languages` blocks (source `/<cc>/<ll>/search-index.json`, `sitemap_lh_<cc>_<ll>.xml`, hreflang, alternate) | one block per root, generated from the table |
| `sitemap/sitemap_lh.xml` | static index of the 4 sitemaps | generated (www's index lists split files `_1`, `_2`: one file per root is enough below 50,000 URLs) |
| `helix-query.yaml` 100-430 | `articles-*` and `article-authors-*` × 4 (copies) | generated from one template per root |
| `helix-query.yaml` 786-1060 | `search-*` × 4 (search, sitemaps, llms.txt, lh-edge search, page check) | generated from one template per root |
| fine | `message-center`, `app-screens`, feeds, `xf`, `fleet` (wildcards); `head.html` | – |
| `404.html` 79 | link to `/de/de/homepage` | a neutral link (`/`) |
| `data/locale-map.json` | 319 rows with the keys of the 4 roots | regenerated from the new scope |
| `llms.txt` 19-31, `de/llms.txt` | "Germany is the only active market" | generated per market (lh-edge's generated `/<cc>/llms.txt` already works per root) |

## Workers

| Where | Fixed today | Needs |
| --- | --- | --- |
| lh-edge `entry.js` 19-25 | `MARKETS` de, at, gb, us, xx (default language and order for `/`, `/<cc>`, `/<cc>/<ll>`; also g4t, select-language) | www's market → languages list (the sitemap dataset) as data |
| lh-edge `entry.js` 76-120, `changelocale.js` 41-70, `g4t.js` 22-31 | local vs www by `LOCALES`; `.changelocale` by the locale map | the table and the map |
| lh-edge `select-language.js` 14-45 | 12 language names, no market defaults, languages filtered by `LOCALES` | `Intl.DisplayNames`; defaults per market |
| lh-edge `search.js` 25, 37-44 | its own list of the 4 roots | the shared table |
| lh-edge `llms.js` 23-40 | country names at, de, gb; languages de, en | names from the table or `Intl.DisplayNames` |
| lh-edge `booking.js` 20-59 | default airports DE, AT, GB (sheet `/app/config/default-airports`, else FRA) | a sheet row per market |
| lh-edge `sdui-web.js` 37, 345 | "read article" label en, de; 404 outside `LOCALES` | labels per language |
| lh-edge `web-pages.js` | 633 generated paths of the 4 roots | regenerated from the new scope |
| lh-edge `owa.js` 208-215 | per root `nav`, `footer`, `owa-tracking` rows | the documents and rows |
| fine | aircraft, offline, events, solo, backends, login, mfe, alias, sitemap, xf, well-known, graphql, sdui | – |
| lh-forms `src/index.js` 55, 562 | `LOCALES` de-en, de-de, at-de, gb-en; any other → 400 `unknown-locale` | accept any `xx-yy` (a form on a new root fails today) |
| lh-forms `src/index.js` 22-54, 577 | form titles en, de for the e-mail subject | titles per language, or English |
| lh-messages, lh-proxy | generic (markets from each message; any `xx/yy` cache key); lh-proxy derives Accept-Language from the language only | nothing (optionally the market's region) |

## Importer and tools

| Where | Fixed today | Needs |
| --- | --- | --- |
| `tools/migration-scope/pages.csv` | wide format `template_group,de_en,de_de,at_de,gb_en` | the long format (`path, locale, group`) `local-pages.csv` already uses, or one column per root |
| `tools/importer/build-locale-map.js` 13-15, `build-scope-paths.js` 18 (local vs www links in `lufthansa-cleanup.js`), `build-export-manifest.js` 13-55, `build-page-templates.js` 15 | the four columns | the root list from the scope |
| `tools/importer/head-metadata.mjs` 105-120 | columns by position; `primary-language-url` always de/en; nav/footer borrowed for us/en | a source page per language family (one per language, e.g. fr/fr for ch/fr, be/fr) |
| `tools/importer/da-upload-sites.mjs` 27 | `LOCALE_DOC` regex of the 4 roots: nav, footer and fragments of any other root are never uploaded | `[a-z]{2}\/[a-z]{2}` |
| 11 more importer scripts with their own list of the 4 roots: build-upload-list, add-fleet-metadata, build-search-index, build-article-index (and compare-articles), build-owa-sheet, build-tag-priority, article-scope, nav-report, record-live-data, bd-record-404, bd-record-api (origins per root) | – | the shared root list |
| `tools/importer/import-nav.js` 35-40 | locale labels | names per root |
| `tools/importer/parsers/aem-paths.js` 32 | travel-classes slug de or en | slugs per language from the path map |
| `tools/loc/translate.json` 64-86 | 2 languages: English (`/de/en` → `/gb/en`), German (`/de/en` → `/de/de` → `/at/de`) | one row per language with its primary root and rollout targets |
| `tools/loc/` link-lib, link-step, slug-lib, slug-step, regional-diff, marker-check, check-config | the pairs de/de→at/de, de/en→gb/en, de/en→de/de | pairs generated from the translate.json rows |
| `tools/page-check/page-check.js` 16, 136 | the 4 search indexes (links into new roots would be flagged as broken) | the shared list |
| `tools/library/check-fields.mjs` 41, `build-library.mjs` 37; `tools/parity/build-jobs.mjs` 42; lh-edge `compare-sitemap.mjs`, `compare-search.mjs` | sample and comparison locales | low priority |
| tests under `test/` and `tools/workers/*/test` | expect the 4 roots | updated with the code |

## Content-side configuration (DA)

| What | Today | Needs |
| --- | --- | --- |
| `/<cc>/<ll>/nav`, `/footer`, `/fragments/stage-promotions`, homepage | the 4 roots (us/en borrows de/en through metadata) | one set per root; nav links re-pointed as more pages migrate |
| `/redirects` (seed `tools/importer/redirects-sheet.json`) | 32 rows, 8 per root (login, activation, support, 5 fleet) | the same rows per root, generated |
| `/app/config/default-airports` | DE, AT, GB | a row per market |
| `/app/config/webview-aliases`, `/app/config/owa-tracking` | rows per root (owa: 127 per root, recorded) | rows per root |
| `/articles/config/tag-priority` | 4 rows | a row per root |
| `tools/importer/stage-promotions.json` | 4 roots | entries per root |
| Message Center | `markets` lists, `{cc}/{ll}` in cti-pages | nothing (messages in languages not authored fall back to English) |
| `/metadata` (bulk) | not in the repo | check in DA for per-root rows |
