# car-rental

Custom **car-rental** block. Purpose: the Meili car rental search of the Lufthansa partner pages (`.meilicarrental > .dcep-meili-car-rental`): Meili's own app, mounted exactly as the live page mounts it; a look-alike of the empty search form that opens the live page when the app cannot run.

## Authoring (Document Authoring)

Model: `standalone`. 2 columns, label | value, all rows optional:

| Row | Value | Default |
| --- | --- | --- |
| Partner ID | Meili partner touchpoint (data-dcep `ptid`): 105.14 SIXT, 105.13 Hertz, 105.12 Europcar, 105.11 mietwagenangebote / lh-rentalcar | by page name (sixt, hertz, europcar, mietwagenangebote, lh-rentalcar) |
| Script | Meili loader (data-dcep `meiliUrl`); only `https://*.meili.travel/*.js` is accepted | https://direct-ux.meili.travel/index.js |
| Locale | `de-DE` style tag | `{lang}-{COUNTRY}` of the page (de-DE, en-DE, de-AT, en-GB), as the live component |
| Fallback link | link to the live page | https://www.lufthansa.com + the page path |

Any text of the fallback form can be overridden with a row of the same name: Form label, Different drop-off label, Location label, Location placeholder, Pick-up date label, Drop-off date label, Pick-up time label, Drop-off time label, Time label, Age label, Miles label, Residency label, Submit label, Submit aria label, Live hint. Defaults: the live Meili texts of the de/de and de/en snapshots (English for `en` pages, German for `de`).

## Behaviour

- Markup as the live component (dcep chunk `f8f2260d`, `MeiliCarRental`): `<div class="meili-car-rental"><div id="mli-root" data-ptid="105.14" data-locale="de-DE"></div></div>`; data-currency is added by the app itself.
- index.js is loaded once per page (skipped when `#mli-script` or the same script already exists) when the block comes within 600px of the viewport. The live page loads it without waiting for the cookie consent (no OneTrust gate), so this block does not wait either. The app then loads Meili's main.*.js / index.*.css from static-cdn.meili.travel, calls car-api-gw.meili.travel (CORS `*`), and renders the promo banner, the search form, the disclaimer and the partner texts.
- decorate() does not wait for the mount in the browser: aem.js keeps the section hidden until its blocks are decorated, and a hidden block never comes near the viewport (waiting kept the whole page hidden).
- Mounted = `#mli-root.mli-loaded` (or `#mli-app` inside): `data-state="mounted"`, `data-lh-source="live"`.
- Script error, or no mount after 8 s: the fallback form (`data-state="fallback"`, `data-lh-source="none"`, `data-lh-sources="meili:script-error|timeout"`). If the app still mounts within 30 s, the fallback is removed again.
- Fallback form: the empty Meili form (checkbox "drop off at a different location", location field with its placeholder, pick-up and drop-off date with time 10:00, age checkbox ticked, miles checkbox, "I live in" with the market's country, yellow "Search" button). The dates are the app's default search computed at view time (tomorrow, tomorrow + 5 days, "Fr., 23. Okt." / "Fri, 23 Oct" / "Fri 23 Oct"), never the capture day. Every field and the button are submit buttons of a GET form whose action is the live page, where the real widget runs; nothing is sent, nothing is typed. A visually hidden hint ("Opens the car rental search on lufthansa.com") describes them for screen readers.
- Only one `#mli-root` per page works (the app looks it up by id); a second block shows the fallback.

Cannot match live: in the fallback, Meili's promo banner, promo texts, disclaimer, feature list and the partner texts (SIXT advantages, status match, ABG) are missing: they are Meili partner content of the day, delivered by the app, not by Lufthansa. "I live in" shows the market's country (the app shows the visitor's country by geo). Local check (2026-10-23, http://localhost:3000/content/de/de/sixt): index.js, main.*.js, the partner CSS and content-cdn config load and the app mounts (`.mli-loaded`, the search form with the de-DE texts), but car-api-gw.meili.travel (`/api/v1/config`, `/config/content`, `/profile`) and tagging-app answer without `Access-Control-Allow-Origin` for the localhost origin, so the partner config (promo banner, texts) is missing there; whether aem.page is allowed shows on the preview.

## Import

Source: `.meilicarrental > .dcep-meili-car-rental` on 16 pages: /{de/de,de/en,at/de,gb/en}/{sixt,hertz,europcar} and /{de/de,at/de}/mietwagenangebote, /{de/en,gb/en}/lh-rentalcar. `data-dcep` = `{"meiliUrl": "https://direct-ux.meili.travel/index.js", "ptid": "105.14"}`.

- Drop everything inside `.meilicarrental` (the rendered app: `<h1>Meili Suche</h1>`, the promo heading and texts, the banner image from content-cdn.meili.travel, "[ ]" / "[x]", the field texts, the capture-day dates "Fr., 23. Okt.", the disclaimer, the feature list, the partner texts). None of it is authored content.
- Write one `car-rental` block with the rows `Partner ID | {data-dcep ptid}` and `Fallback link | <a href="https://www.lufthansa.com/{cc}/{ll}/{page}">https://www.lufthansa.com/{cc}/{ll}/{page}</a>` (the live URL of the same page). Write `Script | {meiliUrl}` only when meiliUrl differs from https://direct-ux.meili.travel/index.js (currently never). No Locale row (the page locale gives it).
- Keep the breadcrumb metadata and the page title as now; the page has no other content.
- Nothing to record: Meili's API is not a lufthansa.com route.

## Universal Editor fields

N/A (Document Authoring project)
