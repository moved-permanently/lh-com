# Widget research: Meili car rental, POI map, AirCore route sections

Research notes for blocks not built yet (2026-10-23). Sources: the raw live snapshots
(`tools/importer/bd-snapshots/www.lufthansa.com/...`), the current imports (`content/...`) and the
live static bundles under `https://www.lufthansa.com/etc/designs/dcep/clientlib-all/vite/js/`
(chunk names below; they change with every Lufthansa deployment, two builds are in the
snapshots: lounges pages load `d9631429`/`a931ccd9`, the newer pages `3a0cbbb8`/`e16045b7`).

## (a) Meili car rental (`.meilicarrental > .dcep-meili-car-rental`)

### Pages and config

| Page | data-dcep ptid | Rendered `#mli-root` |
| --- | --- | --- |
| /{de/de,de/en,at/de,gb/en}/sixt | 105.14 | `data-ptid="105.14" data-locale="de-DE" data-currency="EUR"` (de-DE, en-DE, de-AT, en-GB) |
| /{…}/hertz | 105.13 | same pattern |
| /{…}/europcar | 105.12 | same pattern |
| /{de/de,at/de}/mietwagenangebote, /{de/en,gb/en}/lh-rentalcar | 105.11 | same pattern |

`data-dcep` is always `{ "meiliUrl": "https://direct-ux.meili.travel/index.js", "ptid": "1xx.xx" }`.
`data-currency` is EUR in every market, gb/en included (set by the Meili app, not by Lufthansa).

### How the dcep bundle mounts it (chunk `f8f2260d.chunk.js`, component `MeiliCarRental`)

The whole component is:

```js
s = ({ meiliId, meiliUrl, ptid, locale }) => (loadScript(meiliUrl),
  <div className="meili-car-rental"><div id={meiliId} data-ptid={ptid} data-locale={locale} /></div>)
// meiliId = "mli-root", locale = `${language}-${country}` of the page ("de-DE", "en-DE", "de-AT", "en-GB")
```

So the markup an EDS block needs is exactly:

```html
<div class="meili-car-rental"><div id="mli-root" data-ptid="105.14" data-locale="de-DE"></div></div>
<script src="https://direct-ux.meili.travel/index.js"></script>  <!-- injected once -->
```

Only one `#mli-root` per page is supported (the app looks it up by id).

### index.js and the app

- `https://direct-ux.meili.travel/index.js` (541 bytes, `cache-control: no-cache`) is a loader: unless
  `#mli-script` exists it appends `<script type="module" id="mli-script"
  src="https://static-cdn.meili.travel/assets/car/main.DdEu4zI5.js">` and the stylesheet
  `https://static-cdn.meili.travel/assets/car/index.C-ldZ9dq.css`, sets `globalThis.MEILI_APP = "direct"`
  and dispatches `MEILI_LOAD_LISTENER` (`{ reloadApp: true }`). The hashed file names change with
  Meili releases, so always load index.js, never main.*.js directly.
- main.*.js (715 KB, app v1.261.1) reads `#mli-root`'s dataset (ptid, locale, optional `params`
  JSON, `meilitype`, …), `location.origin/pathname/search` (used only to fill URL templates and the
  page context), and calls `https://car-api-gw.meili.travel/api/v1/{config,config/content,locations,avail,costs,…}`
  with headers `ptid`, `x-api-key` (a public key built into the bundle), `Accept-Language`,
  `app-version`, `app-timestamp`.
- No origin check in the client code: the only `location.origin` test switches Datadog logging off
  for some other partners (croatiaairlines, sas). `REACT_APP_TARGET_ORIGINS` is
  `https://portal.meili.travel` (postMessage for the Meili portal preview), unrelated.
- CORS: `OPTIONS https://car-api-gw.meili.travel/api/v1/config` with `Origin:
  https://main--lh-com--moved-permanently.aem.page` answers 200 with
  `access-control-allow-origin: *`, `-headers: *`, `-methods: GET,POST,OPTIONS` (the same as
  for www.lufthansa.com; tested with curl, 2026-10-23). Whether the config call itself checks
  ptid against the Origin/Referer on the server is unknown until a browser runs it
  (a GET was not sent).
- CSP of index.js's own response (`frame-ancestors 'self' https://*.meili.travel`) only concerns
  framing that URL, not running the script on another page. aem.page sends no CSP that blocks it
  (check `head.html` if one is added).
- The app injects a `<style>:root{--mli-brand-…}</style>` with the Lufthansa colours, fonts and
  button styles (partner config), and a promo banner from
  `https://content-cdn.meili.travel/partner_content/105/promo/…/banner-1.png`.

Conclusion: index.js is a public script that should run on aem.page as is; the block only has
to create the two divs and load the script (after consent? The live page loads it without waiting
for OneTrust; Meili loads Datadog and its own tagging `tagging-app.meili.travel`). To verify in a
browser: the app reaches `.mli-loaded` and the search form (`form.mli-search-form`) appears;
watch for a 4xx from `car-api-gw.meili.travel/api/v1/config`.

### Handoff if it cannot run

The deeplink base (`REACT_APP_DEEPLINK_URL`) comes from the partner config at run time
(`/api/v1/config`), it is not in the bundle (only the dev value
`https://dev-direct-ux.meili.travel`), so there is no known Meili URL to send a visitor to.
Fallback: a primary button to the live page (`https://www.lufthansa.com/{cc}/{ll}/sixt` etc.),
which mounts the same widget. Proposed block `car-rental-search`: rows `Partner ID | 105.14`
(ptid), optional `Script | https://direct-ux.meili.travel/index.js`, `Fallback link | <a>`;
decorate writes `#mli-root` with `data-locale` = `{lang}-{COUNTRY}` of the page, loads the script
once, and shows the fallback link when `#mli-root` has no `.mli-loaded` after ~8 s. Mark
`data-lh-source="live"` when it mounted, `none` otherwise.

### Import (mapping notes)

- Source `.meilicarrental > .dcep-meili-car-rental`; read `data-dcep` JSON (`ptid`, `meiliUrl`).
- The current imports (e.g. `content/de/de/sixt.plain.html`) contain the rendered Meili app as
  text: `<h1>Meili Suche</h1>`, the promo heading, "[ ]", "Abhol- und Rückgabeort", "Nach Standort
  suchen ...", the dates of the capture day, etc. The parser must drop everything inside
  `.dcep-meili-car-rental` and write the block with the `Partner ID` row (and `Fallback link` = the
  live page URL of the same path) instead.

## (b) POI map (`.poimapping > .dcep-poi-mapping`)

### How the bundle loads the points (chunk `1ad93a8d.chunk.js`, `PointsOfInterest`; map view `5e1bfdb4.chunk.js`; Google Maps loader `093a60c6.chunk.js`)

- `data-dcep` `{"id": "<base64>"}`; the id is the base64 of the component's JCR path
  (`/content/lh/markets/{cc}/{ll}/…/jcr:content/…/poimapping`), passed unchanged.
- Points: saga `fetchPointOfInterest` → API `pointsOfInterest_id_get`
  = **GET `https://www.lufthansa.com/service/api/pointsOfInterest/{id}`** (path parameter `id` =
  the base64 string; whether the API client percent-encodes a trailing `=` as `%3D` is not
  verified: the list below is encoded, check the recorded URL against the live request), standard `/service/api` base with the X-Portal-* headers, 429 → reCAPTCHA retry
  (`x-captcha-*` headers), response cached client-side under the name `apiPoi`. Not the
  `.model.json` of the path. Answer: `{"pointsOfInterest":[{"lat":…, "lng":…, "title":"…",
  "link":"…"?, "linkLabel":"…"?, "linkExternal":true|false?}]}` (fields read by the selectors;
  `topDeal` is only used by the centring helper).
- Labels: `labels/common` (`common.misc.poi.loading` "Loading...",
  `common.servicing.default.googleMapsApiKey` = `AIzaSyBt5V5k5u7EORTgOsHSMqhdCcAJKRPsgAg`, recorded
  for all four markets); the map is not drawn when the key label is missing.
- Tiles: Google Maps JavaScript API (`@react-google-maps` style loader, `region` = market country
  (default DE), `language` = page language), raster tiles `maps.googleapis.com/maps/vt?…&key=…`
  as seen in the snapshots, a custom `StyledMapType` (lightened geometry, no POI/transit/road
  labels, water `#90ACA8`, roads white), `disableDefaultUI: true`, `minZoom 2`, `maxZoom 10`
  (store default; the POI view passes `maxZoom 22`), `fitBounds` over all points (one zoom level
  out when more than one cluster).
- UI: own zoom buttons top left (`.zoom-control` with `.btn-zoom-in` / `.btn-zoom-out`, maui
  icons icon-plus / icon-minus, sr-only "Zoom in" / "Zoom out"), markers are overlay divs
  (`.mapview-marker > .pin-marker` with maui `icon-location-pin`, size large, focusable,
  `role="group"`); hover or focus opens a bubble (`.popup-bubble-content`) with the title and,
  when `link` is set, a "visit website" service link (`linkLabel` or the common label), new tab
  when `linkExternal`. The map pans so the bubble stays inside.
- The Google key is most likely restricted to lufthansa.com referrers; on aem.page expect
  `RefererNotAllowedMapError` (untested). A replica needs either its own key or another tile
  source (OpenStreetMap raster tiles `https://tile.openstreetmap.org/{z}/{x}/{y}.png` with
  attribution; no build step, so a small hand-written tile grid or a vendored Leaflet under
  `/scripts/vendor/`).

### Pages and ids (13 maps per market, 12 pages; first-class has two, one per timetable tab)

Marker counts are the `.mapview-marker` overlays in the snapshot (0 = the map had not loaded at
capture time, or a hidden tab), so they are a lower bound of the points.

| Page | JCR path (decoded id) | Markers in snapshot |
| --- | --- | --- |
| /at/de/100-years/destinations | `/content/lh/markets/at/de/100-years/destinations/jcr:content/par/section_666067596/section-parsys/poimapping` | 12 |
| /at/de/articles/explore-the-world | `/content/lh/markets/at/de/articles/explore-the-world/jcr:content/par/poimapping_copy` | 95 |
| /at/de/articles/explore-the-world/a-perfect-day-barcelona-in-one-day | `/content/lh/markets/at/de/articles/explore-the-world/a-perfect-day-barcelona-in-one-day/jcr:content/articlecontentfragment/par5/twocolumn/col1/poimapping` | 8 |
| /at/de/articles/explore-the-world/a-perfect-day-berlin-in-one-day | `/content/lh/markets/at/de/articles/explore-the-world/a-perfect-day-berlin-in-one-day/jcr:content/articlecontentfragment/par5/twocolumn_copy/col1/poimapping` | 9 |
| /at/de/articles/explore-the-world/in-my-hood-chiswick-london | `/content/lh/markets/at/de/articles/explore-the-world/in-my-hood-chiswick-london/jcr:content/articlecontentfragment/par3/twocolumn/col1/poimapping` | 5 |
| /at/de/articles/explore-the-world/in-my-hood-district-zurich | `/content/lh/markets/at/de/articles/explore-the-world/in-my-hood-district-zurich/jcr:content/articlecontentfragment/par5/twocolumn/col1/poimapping` | 11 |
| /at/de/articles/explore-the-world/on-the-scene-caspar-plautz-munich | `/content/lh/markets/at/de/articles/explore-the-world/on-the-scene-caspar-plautz-munich/jcr:content/articlecontentfragment/par2/twocolumn_203210593/col1/poimapping` | 3 |
| /at/de/articles/explore-the-world/on-the-scene-food-trends-istanbul | `/content/lh/markets/at/de/articles/explore-the-world/on-the-scene-food-trends-istanbul/jcr:content/articlecontentfragment/par2/twocolumn_2121703285/col1/poimapping` | 3 |
| /at/de/book-and-manage/stopover/bayerischer-hof | `/content/lh/markets/at/de/book-and-manage/stopover/bayerischer-hof/jcr:content/par/section_copy/section-parsys/sidebar/sidebar-content/poimapping_copy` | 1 |
| /at/de/book-and-manage/stopover/neuschwanstein | `/content/lh/markets/at/de/book-and-manage/stopover/neuschwanstein/jcr:content/par/section/section-parsys/sidebar/sidebar-content/poimapping_copy` | 1 |
| /at/de/book-and-manage/stopover/zugspitze | `/content/lh/markets/at/de/book-and-manage/stopover/zugspitze/jcr:content/par/section/section-parsys/sidebar_copy/sidebar-content/poimapping_copy` | 1 |
| /at/de/first-class | `/content/lh/markets/at/de/prepare-for-your-trip/travel-classes/first-class/jcr:content/par/section_150135901_co_1166480146/section-parsys/tabs_copy_copy/onecolumn_813116419/col1/poimapping` | 20 |
| /at/de/first-class | `/content/lh/markets/at/de/prepare-for-your-trip/travel-classes/first-class/jcr:content/par/section_150135901_co_1166480146/section-parsys/tabs_copy_copy/onecolumn/col1/poimapping_copy` | 0 |
| /de/de/100-years/destinations | `/content/lh/markets/de/de/100-years/destinations/jcr:content/par/section_666067596/section-parsys/poimapping` | 0 |
| /de/de/articles/explore-the-world | `/content/lh/markets/de/de/articles/explore-the-world/jcr:content/par/poimapping_copy` | 0 |
| /de/de/articles/explore-the-world/a-perfect-day-barcelona-in-one-day | `/content/lh/markets/de/de/articles/explore-the-world/a-perfect-day-barcelona-in-one-day/jcr:content/articlecontentfragment/par5/twocolumn/col1/poimapping` | 0 |
| /de/de/articles/explore-the-world/a-perfect-day-berlin-in-one-day | `/content/lh/markets/de/de/articles/explore-the-world/a-perfect-day-berlin-in-one-day/jcr:content/articlecontentfragment/par5/twocolumn_copy/col1/poimapping` | 0 |
| /de/de/articles/explore-the-world/in-my-hood-chiswick-london | `/content/lh/markets/de/de/articles/explore-the-world/in-my-hood-chiswick-london/jcr:content/articlecontentfragment/par3/twocolumn/col1/poimapping` | 0 |
| /de/de/articles/explore-the-world/in-my-hood-district-zurich | `/content/lh/markets/de/de/articles/explore-the-world/in-my-hood-district-zurich/jcr:content/articlecontentfragment/par5/twocolumn/col1/poimapping` | 0 |
| /de/de/articles/explore-the-world/on-the-scene-caspar-plautz-munich | `/content/lh/markets/de/de/articles/explore-the-world/on-the-scene-caspar-plautz-munich/jcr:content/articlecontentfragment/par2/twocolumn_203210593/col1/poimapping` | 3 |
| /de/de/articles/explore-the-world/on-the-scene-food-trends-istanbul | `/content/lh/markets/de/de/articles/explore-the-world/on-the-scene-food-trends-istanbul/jcr:content/articlecontentfragment/par2/twocolumn_2121703285/col1/poimapping` | 3 |
| /de/de/book-and-manage/stopover/bayerischer-hof | `/content/lh/markets/de/de/book-and-manage/stopover/bayerischer-hof/jcr:content/par/section_copy/section-parsys/sidebar/sidebar-content/poimapping_copy` | 1 |
| /de/de/book-and-manage/stopover/neuschwanstein | `/content/lh/markets/de/de/book-and-manage/stopover/neuschwanstein/jcr:content/par/section/section-parsys/sidebar/sidebar-content/poimapping_copy` | 1 |
| /de/de/book-and-manage/stopover/zugspitze | `/content/lh/markets/de/de/book-and-manage/stopover/zugspitze/jcr:content/par/section/section-parsys/sidebar_copy/sidebar-content/poimapping_copy` | 1 |
| /de/de/first-class | `/content/lh/markets/de/de/prepare-for-your-trip/travel-classes/first-class/jcr:content/par/section_150135901_co_1166480146/section-parsys/tabs_copy_copy/onecolumn_813116419/col1/poimapping` | 20 |
| /de/de/first-class | `/content/lh/markets/de/de/prepare-for-your-trip/travel-classes/first-class/jcr:content/par/section_150135901_co_1166480146/section-parsys/tabs_copy_copy/onecolumn/col1/poimapping_copy` | 0 |
| /de/en/100-years/destinations | `/content/lh/markets/de/en/100-years/destinations/jcr:content/par/section_666067596/section-parsys/poimapping` | 12 |
| /de/en/articles/explore-the-world | `/content/lh/markets/de/en/articles/explore-the-world/jcr:content/par/poimapping_copy` | 95 |
| /de/en/articles/explore-the-world/a-perfect-day-barcelona-in-one-day | `/content/lh/markets/de/en/articles/explore-the-world/a-perfect-day-barcelona-in-one-day/jcr:content/articlecontentfragment/par5/twocolumn/col1/poimapping` | 8 |
| /de/en/articles/explore-the-world/a-perfect-day-berlin-in-one-day | `/content/lh/markets/de/en/articles/explore-the-world/a-perfect-day-berlin-in-one-day/jcr:content/articlecontentfragment/par5/twocolumn_copy/col1/poimapping` | 9 |
| /de/en/articles/explore-the-world/in-my-hood-chiswick-london | `/content/lh/markets/de/en/articles/explore-the-world/in-my-hood-chiswick-london/jcr:content/articlecontentfragment/par3/twocolumn/col1/poimapping` | 5 |
| /de/en/articles/explore-the-world/in-my-hood-district-zurich | `/content/lh/markets/de/en/articles/explore-the-world/in-my-hood-district-zurich/jcr:content/articlecontentfragment/par5/twocolumn/col1/poimapping` | 11 |
| /de/en/articles/explore-the-world/on-the-scene-caspar-plautz-munich | `/content/lh/markets/de/en/articles/explore-the-world/on-the-scene-caspar-plautz-munich/jcr:content/articlecontentfragment/par2/twocolumn_203210593/col1/poimapping` | 3 |
| /de/en/articles/explore-the-world/on-the-scene-food-trends-istanbul | `/content/lh/markets/de/en/articles/explore-the-world/on-the-scene-food-trends-istanbul/jcr:content/articlecontentfragment/par2/twocolumn_2121703285/col1/poimapping` | 3 |
| /de/en/book-and-manage/stopover/bayerischer-hof | `/content/lh/markets/de/en/book-and-manage/stopover/bayerischer-hof/jcr:content/par/section_copy/section-parsys/sidebar/sidebar-content/poimapping_copy` | 1 |
| /de/en/book-and-manage/stopover/neuschwanstein | `/content/lh/markets/de/en/book-and-manage/stopover/neuschwanstein/jcr:content/par/section/section-parsys/sidebar/sidebar-content/poimapping_copy` | 0 |
| /de/en/book-and-manage/stopover/zugspitze | `/content/lh/markets/de/en/book-and-manage/stopover/zugspitze/jcr:content/par/section/section-parsys/sidebar_copy/sidebar-content/poimapping_copy` | 0 |
| /de/en/first-class | `/content/lh/markets/de/en/prepare-for-your-trip/travel-classes/first-class/jcr:content/par/section_150135901_co_1652012784/section-parsys/tabs_copy_copy/onecolumn_813116419/col1/poimapping` | 0 |
| /de/en/first-class | `/content/lh/markets/de/en/prepare-for-your-trip/travel-classes/first-class/jcr:content/par/section_150135901_co_1652012784/section-parsys/tabs_copy_copy/onecolumn/col1/poimapping_copy` | 0 |
| /gb/en/100-years/destinations | `/content/lh/markets/gb/en/100-years/destinations/jcr:content/par/section_666067596/section-parsys/poimapping` | 12 |
| /gb/en/articles/explore-the-world | `/content/lh/markets/gb/en/articles/explore-the-world/jcr:content/par/poimapping_copy` | 0 |
| /gb/en/articles/explore-the-world/a-perfect-day-barcelona-in-one-day | `/content/lh/markets/gb/en/articles/explore-the-world/a-perfect-day-barcelona-in-one-day/jcr:content/articlecontentfragment/par5/twocolumn/col1/poimapping` | 8 |
| /gb/en/articles/explore-the-world/a-perfect-day-berlin-in-one-day | `/content/lh/markets/gb/en/articles/explore-the-world/a-perfect-day-berlin-in-one-day/jcr:content/articlecontentfragment/par5/twocolumn_copy/col1/poimapping` | 9 |
| /gb/en/articles/explore-the-world/in-my-hood-chiswick-london | `/content/lh/markets/gb/en/articles/explore-the-world/in-my-hood-chiswick-london/jcr:content/articlecontentfragment/par3/twocolumn/col1/poimapping` | 5 |
| /gb/en/articles/explore-the-world/in-my-hood-district-zurich | `/content/lh/markets/gb/en/articles/explore-the-world/in-my-hood-district-zurich/jcr:content/articlecontentfragment/par5/twocolumn/col1/poimapping` | 11 |
| /gb/en/articles/explore-the-world/on-the-scene-caspar-plautz-munich | `/content/lh/markets/gb/en/articles/explore-the-world/on-the-scene-caspar-plautz-munich/jcr:content/articlecontentfragment/par2/twocolumn_203210593/col1/poimapping` | 3 |
| /gb/en/articles/explore-the-world/on-the-scene-food-trends-istanbul | `/content/lh/markets/gb/en/articles/explore-the-world/on-the-scene-food-trends-istanbul/jcr:content/articlecontentfragment/par2/twocolumn_2121703285/col1/poimapping` | 3 |
| /gb/en/book-and-manage/stopover/bayerischer-hof | `/content/lh/markets/gb/en/book-and-manage/stopover/bayerischer-hof/jcr:content/par/section_copy/section-parsys/sidebar/sidebar-content/poimapping_copy` | 0 |
| /gb/en/book-and-manage/stopover/neuschwanstein | `/content/lh/markets/gb/en/book-and-manage/stopover/neuschwanstein/jcr:content/par/section/section-parsys/sidebar/sidebar-content/poimapping_copy` | 0 |
| /gb/en/book-and-manage/stopover/zugspitze | `/content/lh/markets/gb/en/book-and-manage/stopover/zugspitze/jcr:content/par/section/section-parsys/sidebar_copy/sidebar-content/poimapping_copy` | 0 |
| /gb/en/first-class | `/content/lh/markets/gb/en/prepare-for-your-trip/travel-classes/first-class/jcr:content/par/section_150135901_co_1652012784/section-parsys/tabs_copy_copy/onecolumn_813116419/col1/poimapping` | 20 |
| /gb/en/first-class | `/content/lh/markets/gb/en/prepare-for-your-trip/travel-classes/first-class/jcr:content/par/section_150135901_co_1652012784/section-parsys/tabs_copy_copy/onecolumn/col1/poimapping_copy` | 0 |

Responses to record (GET, with the market's X-Portal-* headers, one per map; the id is market-specific):

- https://www.lufthansa.com/service/api/pointsOfInterest/L2NvbnRlbnQvbGgvbWFya2V0cy9hdC9kZS8xMDAteWVhcnMvZGVzdGluYXRpb25zL2pjcjpjb250ZW50L3Bhci9zZWN0aW9uXzY2NjA2NzU5Ni9zZWN0aW9uLXBhcnN5cy9wb2ltYXBwaW5n
- https://www.lufthansa.com/service/api/pointsOfInterest/L2NvbnRlbnQvbGgvbWFya2V0cy9hdC9kZS9hcnRpY2xlcy9leHBsb3JlLXRoZS13b3JsZC9qY3I6Y29udGVudC9wYXIvcG9pbWFwcGluZ19jb3B5
- https://www.lufthansa.com/service/api/pointsOfInterest/L2NvbnRlbnQvbGgvbWFya2V0cy9hdC9kZS9hcnRpY2xlcy9leHBsb3JlLXRoZS13b3JsZC9hLXBlcmZlY3QtZGF5LWJhcmNlbG9uYS1pbi1vbmUtZGF5L2pjcjpjb250ZW50L2FydGljbGVjb250ZW50ZnJhZ21lbnQvcGFyNS90d29jb2x1bW4vY29sMS9wb2ltYXBwaW5n
- https://www.lufthansa.com/service/api/pointsOfInterest/L2NvbnRlbnQvbGgvbWFya2V0cy9hdC9kZS9hcnRpY2xlcy9leHBsb3JlLXRoZS13b3JsZC9hLXBlcmZlY3QtZGF5LWJlcmxpbi1pbi1vbmUtZGF5L2pjcjpjb250ZW50L2FydGljbGVjb250ZW50ZnJhZ21lbnQvcGFyNS90d29jb2x1bW5fY29weS9jb2wxL3BvaW1hcHBpbmc%3D
- https://www.lufthansa.com/service/api/pointsOfInterest/L2NvbnRlbnQvbGgvbWFya2V0cy9hdC9kZS9hcnRpY2xlcy9leHBsb3JlLXRoZS13b3JsZC9pbi1teS1ob29kLWNoaXN3aWNrLWxvbmRvbi9qY3I6Y29udGVudC9hcnRpY2xlY29udGVudGZyYWdtZW50L3BhcjMvdHdvY29sdW1uL2NvbDEvcG9pbWFwcGluZw%3D%3D
- https://www.lufthansa.com/service/api/pointsOfInterest/L2NvbnRlbnQvbGgvbWFya2V0cy9hdC9kZS9hcnRpY2xlcy9leHBsb3JlLXRoZS13b3JsZC9pbi1teS1ob29kLWRpc3RyaWN0LXp1cmljaC9qY3I6Y29udGVudC9hcnRpY2xlY29udGVudGZyYWdtZW50L3BhcjUvdHdvY29sdW1uL2NvbDEvcG9pbWFwcGluZw%3D%3D
- https://www.lufthansa.com/service/api/pointsOfInterest/L2NvbnRlbnQvbGgvbWFya2V0cy9hdC9kZS9hcnRpY2xlcy9leHBsb3JlLXRoZS13b3JsZC9vbi10aGUtc2NlbmUtY2FzcGFyLXBsYXV0ei1tdW5pY2gvamNyOmNvbnRlbnQvYXJ0aWNsZWNvbnRlbnRmcmFnbWVudC9wYXIyL3R3b2NvbHVtbl8yMDMyMTA1OTMvY29sMS9wb2ltYXBwaW5n
- https://www.lufthansa.com/service/api/pointsOfInterest/L2NvbnRlbnQvbGgvbWFya2V0cy9hdC9kZS9hcnRpY2xlcy9leHBsb3JlLXRoZS13b3JsZC9vbi10aGUtc2NlbmUtZm9vZC10cmVuZHMtaXN0YW5idWwvamNyOmNvbnRlbnQvYXJ0aWNsZWNvbnRlbnRmcmFnbWVudC9wYXIyL3R3b2NvbHVtbl8yMTIxNzAzMjg1L2NvbDEvcG9pbWFwcGluZw%3D%3D
- https://www.lufthansa.com/service/api/pointsOfInterest/L2NvbnRlbnQvbGgvbWFya2V0cy9hdC9kZS9ib29rLWFuZC1tYW5hZ2Uvc3RvcG92ZXIvYmF5ZXJpc2NoZXItaG9mL2pjcjpjb250ZW50L3Bhci9zZWN0aW9uX2NvcHkvc2VjdGlvbi1wYXJzeXMvc2lkZWJhci9zaWRlYmFyLWNvbnRlbnQvcG9pbWFwcGluZ19jb3B5
- https://www.lufthansa.com/service/api/pointsOfInterest/L2NvbnRlbnQvbGgvbWFya2V0cy9hdC9kZS9ib29rLWFuZC1tYW5hZ2Uvc3RvcG92ZXIvbmV1c2Nod2Fuc3RlaW4vamNyOmNvbnRlbnQvcGFyL3NlY3Rpb24vc2VjdGlvbi1wYXJzeXMvc2lkZWJhci9zaWRlYmFyLWNvbnRlbnQvcG9pbWFwcGluZ19jb3B5
- https://www.lufthansa.com/service/api/pointsOfInterest/L2NvbnRlbnQvbGgvbWFya2V0cy9hdC9kZS9ib29rLWFuZC1tYW5hZ2Uvc3RvcG92ZXIvenVnc3BpdHplL2pjcjpjb250ZW50L3Bhci9zZWN0aW9uL3NlY3Rpb24tcGFyc3lzL3NpZGViYXJfY29weS9zaWRlYmFyLWNvbnRlbnQvcG9pbWFwcGluZ19jb3B5
- https://www.lufthansa.com/service/api/pointsOfInterest/L2NvbnRlbnQvbGgvbWFya2V0cy9hdC9kZS9wcmVwYXJlLWZvci15b3VyLXRyaXAvdHJhdmVsLWNsYXNzZXMvZmlyc3QtY2xhc3MvamNyOmNvbnRlbnQvcGFyL3NlY3Rpb25fMTUwMTM1OTAxX2NvXzExNjY0ODAxNDYvc2VjdGlvbi1wYXJzeXMvdGFic19jb3B5X2NvcHkvb25lY29sdW1uXzgxMzExNjQxOS9jb2wxL3BvaW1hcHBpbmc%3D
- https://www.lufthansa.com/service/api/pointsOfInterest/L2NvbnRlbnQvbGgvbWFya2V0cy9hdC9kZS9wcmVwYXJlLWZvci15b3VyLXRyaXAvdHJhdmVsLWNsYXNzZXMvZmlyc3QtY2xhc3MvamNyOmNvbnRlbnQvcGFyL3NlY3Rpb25fMTUwMTM1OTAxX2NvXzExNjY0ODAxNDYvc2VjdGlvbi1wYXJzeXMvdGFic19jb3B5X2NvcHkvb25lY29sdW1uL2NvbDEvcG9pbWFwcGluZ19jb3B5
- https://www.lufthansa.com/service/api/pointsOfInterest/L2NvbnRlbnQvbGgvbWFya2V0cy9kZS9kZS8xMDAteWVhcnMvZGVzdGluYXRpb25zL2pjcjpjb250ZW50L3Bhci9zZWN0aW9uXzY2NjA2NzU5Ni9zZWN0aW9uLXBhcnN5cy9wb2ltYXBwaW5n
- https://www.lufthansa.com/service/api/pointsOfInterest/L2NvbnRlbnQvbGgvbWFya2V0cy9kZS9kZS9hcnRpY2xlcy9leHBsb3JlLXRoZS13b3JsZC9qY3I6Y29udGVudC9wYXIvcG9pbWFwcGluZ19jb3B5
- https://www.lufthansa.com/service/api/pointsOfInterest/L2NvbnRlbnQvbGgvbWFya2V0cy9kZS9kZS9hcnRpY2xlcy9leHBsb3JlLXRoZS13b3JsZC9hLXBlcmZlY3QtZGF5LWJhcmNlbG9uYS1pbi1vbmUtZGF5L2pjcjpjb250ZW50L2FydGljbGVjb250ZW50ZnJhZ21lbnQvcGFyNS90d29jb2x1bW4vY29sMS9wb2ltYXBwaW5n
- https://www.lufthansa.com/service/api/pointsOfInterest/L2NvbnRlbnQvbGgvbWFya2V0cy9kZS9kZS9hcnRpY2xlcy9leHBsb3JlLXRoZS13b3JsZC9hLXBlcmZlY3QtZGF5LWJlcmxpbi1pbi1vbmUtZGF5L2pjcjpjb250ZW50L2FydGljbGVjb250ZW50ZnJhZ21lbnQvcGFyNS90d29jb2x1bW5fY29weS9jb2wxL3BvaW1hcHBpbmc%3D
- https://www.lufthansa.com/service/api/pointsOfInterest/L2NvbnRlbnQvbGgvbWFya2V0cy9kZS9kZS9hcnRpY2xlcy9leHBsb3JlLXRoZS13b3JsZC9pbi1teS1ob29kLWNoaXN3aWNrLWxvbmRvbi9qY3I6Y29udGVudC9hcnRpY2xlY29udGVudGZyYWdtZW50L3BhcjMvdHdvY29sdW1uL2NvbDEvcG9pbWFwcGluZw%3D%3D
- https://www.lufthansa.com/service/api/pointsOfInterest/L2NvbnRlbnQvbGgvbWFya2V0cy9kZS9kZS9hcnRpY2xlcy9leHBsb3JlLXRoZS13b3JsZC9pbi1teS1ob29kLWRpc3RyaWN0LXp1cmljaC9qY3I6Y29udGVudC9hcnRpY2xlY29udGVudGZyYWdtZW50L3BhcjUvdHdvY29sdW1uL2NvbDEvcG9pbWFwcGluZw%3D%3D
- https://www.lufthansa.com/service/api/pointsOfInterest/L2NvbnRlbnQvbGgvbWFya2V0cy9kZS9kZS9hcnRpY2xlcy9leHBsb3JlLXRoZS13b3JsZC9vbi10aGUtc2NlbmUtY2FzcGFyLXBsYXV0ei1tdW5pY2gvamNyOmNvbnRlbnQvYXJ0aWNsZWNvbnRlbnRmcmFnbWVudC9wYXIyL3R3b2NvbHVtbl8yMDMyMTA1OTMvY29sMS9wb2ltYXBwaW5n
- https://www.lufthansa.com/service/api/pointsOfInterest/L2NvbnRlbnQvbGgvbWFya2V0cy9kZS9kZS9hcnRpY2xlcy9leHBsb3JlLXRoZS13b3JsZC9vbi10aGUtc2NlbmUtZm9vZC10cmVuZHMtaXN0YW5idWwvamNyOmNvbnRlbnQvYXJ0aWNsZWNvbnRlbnRmcmFnbWVudC9wYXIyL3R3b2NvbHVtbl8yMTIxNzAzMjg1L2NvbDEvcG9pbWFwcGluZw%3D%3D
- https://www.lufthansa.com/service/api/pointsOfInterest/L2NvbnRlbnQvbGgvbWFya2V0cy9kZS9kZS9ib29rLWFuZC1tYW5hZ2Uvc3RvcG92ZXIvYmF5ZXJpc2NoZXItaG9mL2pjcjpjb250ZW50L3Bhci9zZWN0aW9uX2NvcHkvc2VjdGlvbi1wYXJzeXMvc2lkZWJhci9zaWRlYmFyLWNvbnRlbnQvcG9pbWFwcGluZ19jb3B5
- https://www.lufthansa.com/service/api/pointsOfInterest/L2NvbnRlbnQvbGgvbWFya2V0cy9kZS9kZS9ib29rLWFuZC1tYW5hZ2Uvc3RvcG92ZXIvbmV1c2Nod2Fuc3RlaW4vamNyOmNvbnRlbnQvcGFyL3NlY3Rpb24vc2VjdGlvbi1wYXJzeXMvc2lkZWJhci9zaWRlYmFyLWNvbnRlbnQvcG9pbWFwcGluZ19jb3B5
- https://www.lufthansa.com/service/api/pointsOfInterest/L2NvbnRlbnQvbGgvbWFya2V0cy9kZS9kZS9ib29rLWFuZC1tYW5hZ2Uvc3RvcG92ZXIvenVnc3BpdHplL2pjcjpjb250ZW50L3Bhci9zZWN0aW9uL3NlY3Rpb24tcGFyc3lzL3NpZGViYXJfY29weS9zaWRlYmFyLWNvbnRlbnQvcG9pbWFwcGluZ19jb3B5
- https://www.lufthansa.com/service/api/pointsOfInterest/L2NvbnRlbnQvbGgvbWFya2V0cy9kZS9kZS9wcmVwYXJlLWZvci15b3VyLXRyaXAvdHJhdmVsLWNsYXNzZXMvZmlyc3QtY2xhc3MvamNyOmNvbnRlbnQvcGFyL3NlY3Rpb25fMTUwMTM1OTAxX2NvXzExNjY0ODAxNDYvc2VjdGlvbi1wYXJzeXMvdGFic19jb3B5X2NvcHkvb25lY29sdW1uXzgxMzExNjQxOS9jb2wxL3BvaW1hcHBpbmc%3D
- https://www.lufthansa.com/service/api/pointsOfInterest/L2NvbnRlbnQvbGgvbWFya2V0cy9kZS9kZS9wcmVwYXJlLWZvci15b3VyLXRyaXAvdHJhdmVsLWNsYXNzZXMvZmlyc3QtY2xhc3MvamNyOmNvbnRlbnQvcGFyL3NlY3Rpb25fMTUwMTM1OTAxX2NvXzExNjY0ODAxNDYvc2VjdGlvbi1wYXJzeXMvdGFic19jb3B5X2NvcHkvb25lY29sdW1uL2NvbDEvcG9pbWFwcGluZ19jb3B5
- https://www.lufthansa.com/service/api/pointsOfInterest/L2NvbnRlbnQvbGgvbWFya2V0cy9kZS9lbi8xMDAteWVhcnMvZGVzdGluYXRpb25zL2pjcjpjb250ZW50L3Bhci9zZWN0aW9uXzY2NjA2NzU5Ni9zZWN0aW9uLXBhcnN5cy9wb2ltYXBwaW5n
- https://www.lufthansa.com/service/api/pointsOfInterest/L2NvbnRlbnQvbGgvbWFya2V0cy9kZS9lbi9hcnRpY2xlcy9leHBsb3JlLXRoZS13b3JsZC9qY3I6Y29udGVudC9wYXIvcG9pbWFwcGluZ19jb3B5
- https://www.lufthansa.com/service/api/pointsOfInterest/L2NvbnRlbnQvbGgvbWFya2V0cy9kZS9lbi9hcnRpY2xlcy9leHBsb3JlLXRoZS13b3JsZC9hLXBlcmZlY3QtZGF5LWJhcmNlbG9uYS1pbi1vbmUtZGF5L2pjcjpjb250ZW50L2FydGljbGVjb250ZW50ZnJhZ21lbnQvcGFyNS90d29jb2x1bW4vY29sMS9wb2ltYXBwaW5n
- https://www.lufthansa.com/service/api/pointsOfInterest/L2NvbnRlbnQvbGgvbWFya2V0cy9kZS9lbi9hcnRpY2xlcy9leHBsb3JlLXRoZS13b3JsZC9hLXBlcmZlY3QtZGF5LWJlcmxpbi1pbi1vbmUtZGF5L2pjcjpjb250ZW50L2FydGljbGVjb250ZW50ZnJhZ21lbnQvcGFyNS90d29jb2x1bW5fY29weS9jb2wxL3BvaW1hcHBpbmc%3D
- https://www.lufthansa.com/service/api/pointsOfInterest/L2NvbnRlbnQvbGgvbWFya2V0cy9kZS9lbi9hcnRpY2xlcy9leHBsb3JlLXRoZS13b3JsZC9pbi1teS1ob29kLWNoaXN3aWNrLWxvbmRvbi9qY3I6Y29udGVudC9hcnRpY2xlY29udGVudGZyYWdtZW50L3BhcjMvdHdvY29sdW1uL2NvbDEvcG9pbWFwcGluZw%3D%3D
- https://www.lufthansa.com/service/api/pointsOfInterest/L2NvbnRlbnQvbGgvbWFya2V0cy9kZS9lbi9hcnRpY2xlcy9leHBsb3JlLXRoZS13b3JsZC9pbi1teS1ob29kLWRpc3RyaWN0LXp1cmljaC9qY3I6Y29udGVudC9hcnRpY2xlY29udGVudGZyYWdtZW50L3BhcjUvdHdvY29sdW1uL2NvbDEvcG9pbWFwcGluZw%3D%3D
- https://www.lufthansa.com/service/api/pointsOfInterest/L2NvbnRlbnQvbGgvbWFya2V0cy9kZS9lbi9hcnRpY2xlcy9leHBsb3JlLXRoZS13b3JsZC9vbi10aGUtc2NlbmUtY2FzcGFyLXBsYXV0ei1tdW5pY2gvamNyOmNvbnRlbnQvYXJ0aWNsZWNvbnRlbnRmcmFnbWVudC9wYXIyL3R3b2NvbHVtbl8yMDMyMTA1OTMvY29sMS9wb2ltYXBwaW5n
- https://www.lufthansa.com/service/api/pointsOfInterest/L2NvbnRlbnQvbGgvbWFya2V0cy9kZS9lbi9hcnRpY2xlcy9leHBsb3JlLXRoZS13b3JsZC9vbi10aGUtc2NlbmUtZm9vZC10cmVuZHMtaXN0YW5idWwvamNyOmNvbnRlbnQvYXJ0aWNsZWNvbnRlbnRmcmFnbWVudC9wYXIyL3R3b2NvbHVtbl8yMTIxNzAzMjg1L2NvbDEvcG9pbWFwcGluZw%3D%3D
- https://www.lufthansa.com/service/api/pointsOfInterest/L2NvbnRlbnQvbGgvbWFya2V0cy9kZS9lbi9ib29rLWFuZC1tYW5hZ2Uvc3RvcG92ZXIvYmF5ZXJpc2NoZXItaG9mL2pjcjpjb250ZW50L3Bhci9zZWN0aW9uX2NvcHkvc2VjdGlvbi1wYXJzeXMvc2lkZWJhci9zaWRlYmFyLWNvbnRlbnQvcG9pbWFwcGluZ19jb3B5
- https://www.lufthansa.com/service/api/pointsOfInterest/L2NvbnRlbnQvbGgvbWFya2V0cy9kZS9lbi9ib29rLWFuZC1tYW5hZ2Uvc3RvcG92ZXIvbmV1c2Nod2Fuc3RlaW4vamNyOmNvbnRlbnQvcGFyL3NlY3Rpb24vc2VjdGlvbi1wYXJzeXMvc2lkZWJhci9zaWRlYmFyLWNvbnRlbnQvcG9pbWFwcGluZ19jb3B5
- https://www.lufthansa.com/service/api/pointsOfInterest/L2NvbnRlbnQvbGgvbWFya2V0cy9kZS9lbi9ib29rLWFuZC1tYW5hZ2Uvc3RvcG92ZXIvenVnc3BpdHplL2pjcjpjb250ZW50L3Bhci9zZWN0aW9uL3NlY3Rpb24tcGFyc3lzL3NpZGViYXJfY29weS9zaWRlYmFyLWNvbnRlbnQvcG9pbWFwcGluZ19jb3B5
- https://www.lufthansa.com/service/api/pointsOfInterest/L2NvbnRlbnQvbGgvbWFya2V0cy9kZS9lbi9wcmVwYXJlLWZvci15b3VyLXRyaXAvdHJhdmVsLWNsYXNzZXMvZmlyc3QtY2xhc3MvamNyOmNvbnRlbnQvcGFyL3NlY3Rpb25fMTUwMTM1OTAxX2NvXzE2NTIwMTI3ODQvc2VjdGlvbi1wYXJzeXMvdGFic19jb3B5X2NvcHkvb25lY29sdW1uXzgxMzExNjQxOS9jb2wxL3BvaW1hcHBpbmc%3D
- https://www.lufthansa.com/service/api/pointsOfInterest/L2NvbnRlbnQvbGgvbWFya2V0cy9kZS9lbi9wcmVwYXJlLWZvci15b3VyLXRyaXAvdHJhdmVsLWNsYXNzZXMvZmlyc3QtY2xhc3MvamNyOmNvbnRlbnQvcGFyL3NlY3Rpb25fMTUwMTM1OTAxX2NvXzE2NTIwMTI3ODQvc2VjdGlvbi1wYXJzeXMvdGFic19jb3B5X2NvcHkvb25lY29sdW1uL2NvbDEvcG9pbWFwcGluZ19jb3B5
- https://www.lufthansa.com/service/api/pointsOfInterest/L2NvbnRlbnQvbGgvbWFya2V0cy9nYi9lbi8xMDAteWVhcnMvZGVzdGluYXRpb25zL2pjcjpjb250ZW50L3Bhci9zZWN0aW9uXzY2NjA2NzU5Ni9zZWN0aW9uLXBhcnN5cy9wb2ltYXBwaW5n
- https://www.lufthansa.com/service/api/pointsOfInterest/L2NvbnRlbnQvbGgvbWFya2V0cy9nYi9lbi9hcnRpY2xlcy9leHBsb3JlLXRoZS13b3JsZC9qY3I6Y29udGVudC9wYXIvcG9pbWFwcGluZ19jb3B5
- https://www.lufthansa.com/service/api/pointsOfInterest/L2NvbnRlbnQvbGgvbWFya2V0cy9nYi9lbi9hcnRpY2xlcy9leHBsb3JlLXRoZS13b3JsZC9hLXBlcmZlY3QtZGF5LWJhcmNlbG9uYS1pbi1vbmUtZGF5L2pjcjpjb250ZW50L2FydGljbGVjb250ZW50ZnJhZ21lbnQvcGFyNS90d29jb2x1bW4vY29sMS9wb2ltYXBwaW5n
- https://www.lufthansa.com/service/api/pointsOfInterest/L2NvbnRlbnQvbGgvbWFya2V0cy9nYi9lbi9hcnRpY2xlcy9leHBsb3JlLXRoZS13b3JsZC9hLXBlcmZlY3QtZGF5LWJlcmxpbi1pbi1vbmUtZGF5L2pjcjpjb250ZW50L2FydGljbGVjb250ZW50ZnJhZ21lbnQvcGFyNS90d29jb2x1bW5fY29weS9jb2wxL3BvaW1hcHBpbmc%3D
- https://www.lufthansa.com/service/api/pointsOfInterest/L2NvbnRlbnQvbGgvbWFya2V0cy9nYi9lbi9hcnRpY2xlcy9leHBsb3JlLXRoZS13b3JsZC9pbi1teS1ob29kLWNoaXN3aWNrLWxvbmRvbi9qY3I6Y29udGVudC9hcnRpY2xlY29udGVudGZyYWdtZW50L3BhcjMvdHdvY29sdW1uL2NvbDEvcG9pbWFwcGluZw%3D%3D
- https://www.lufthansa.com/service/api/pointsOfInterest/L2NvbnRlbnQvbGgvbWFya2V0cy9nYi9lbi9hcnRpY2xlcy9leHBsb3JlLXRoZS13b3JsZC9pbi1teS1ob29kLWRpc3RyaWN0LXp1cmljaC9qY3I6Y29udGVudC9hcnRpY2xlY29udGVudGZyYWdtZW50L3BhcjUvdHdvY29sdW1uL2NvbDEvcG9pbWFwcGluZw%3D%3D
- https://www.lufthansa.com/service/api/pointsOfInterest/L2NvbnRlbnQvbGgvbWFya2V0cy9nYi9lbi9hcnRpY2xlcy9leHBsb3JlLXRoZS13b3JsZC9vbi10aGUtc2NlbmUtY2FzcGFyLXBsYXV0ei1tdW5pY2gvamNyOmNvbnRlbnQvYXJ0aWNsZWNvbnRlbnRmcmFnbWVudC9wYXIyL3R3b2NvbHVtbl8yMDMyMTA1OTMvY29sMS9wb2ltYXBwaW5n
- https://www.lufthansa.com/service/api/pointsOfInterest/L2NvbnRlbnQvbGgvbWFya2V0cy9nYi9lbi9hcnRpY2xlcy9leHBsb3JlLXRoZS13b3JsZC9vbi10aGUtc2NlbmUtZm9vZC10cmVuZHMtaXN0YW5idWwvamNyOmNvbnRlbnQvYXJ0aWNsZWNvbnRlbnRmcmFnbWVudC9wYXIyL3R3b2NvbHVtbl8yMTIxNzAzMjg1L2NvbDEvcG9pbWFwcGluZw%3D%3D
- https://www.lufthansa.com/service/api/pointsOfInterest/L2NvbnRlbnQvbGgvbWFya2V0cy9nYi9lbi9ib29rLWFuZC1tYW5hZ2Uvc3RvcG92ZXIvYmF5ZXJpc2NoZXItaG9mL2pjcjpjb250ZW50L3Bhci9zZWN0aW9uX2NvcHkvc2VjdGlvbi1wYXJzeXMvc2lkZWJhci9zaWRlYmFyLWNvbnRlbnQvcG9pbWFwcGluZ19jb3B5
- https://www.lufthansa.com/service/api/pointsOfInterest/L2NvbnRlbnQvbGgvbWFya2V0cy9nYi9lbi9ib29rLWFuZC1tYW5hZ2Uvc3RvcG92ZXIvbmV1c2Nod2Fuc3RlaW4vamNyOmNvbnRlbnQvcGFyL3NlY3Rpb24vc2VjdGlvbi1wYXJzeXMvc2lkZWJhci9zaWRlYmFyLWNvbnRlbnQvcG9pbWFwcGluZ19jb3B5
- https://www.lufthansa.com/service/api/pointsOfInterest/L2NvbnRlbnQvbGgvbWFya2V0cy9nYi9lbi9ib29rLWFuZC1tYW5hZ2Uvc3RvcG92ZXIvenVnc3BpdHplL2pjcjpjb250ZW50L3Bhci9zZWN0aW9uL3NlY3Rpb24tcGFyc3lzL3NpZGViYXJfY29weS9zaWRlYmFyLWNvbnRlbnQvcG9pbWFwcGluZ19jb3B5
- https://www.lufthansa.com/service/api/pointsOfInterest/L2NvbnRlbnQvbGgvbWFya2V0cy9nYi9lbi9wcmVwYXJlLWZvci15b3VyLXRyaXAvdHJhdmVsLWNsYXNzZXMvZmlyc3QtY2xhc3MvamNyOmNvbnRlbnQvcGFyL3NlY3Rpb25fMTUwMTM1OTAxX2NvXzE2NTIwMTI3ODQvc2VjdGlvbi1wYXJzeXMvdGFic19jb3B5X2NvcHkvb25lY29sdW1uXzgxMzExNjQxOS9jb2wxL3BvaW1hcHBpbmc%3D
- https://www.lufthansa.com/service/api/pointsOfInterest/L2NvbnRlbnQvbGgvbWFya2V0cy9nYi9lbi9wcmVwYXJlLWZvci15b3VyLXRyaXAvdHJhdmVsLWNsYXNzZXMvZmlyc3QtY2xhc3MvamNyOmNvbnRlbnQvcGFyL3NlY3Rpb25fMTUwMTM1OTAxX2NvXzE2NTIwMTI3ODQvc2VjdGlvbi1wYXJzeXMvdGFic19jb3B5X2NvcHkvb25lY29sdW1uL2NvbDEvcG9pbWFwcGluZ19jb3B5

`pointsOfInterest` is neither in the recorder's RECORDABLE routes
(`tools/importer/record-live-data.mjs`) nor in `DIRECT_ROUTES` (`scripts/lh-data.js`); both need
`pointsOfInterest/` added before these answers can be recorded and replayed (CORS of the route
from aem.page untested).

### Proposed block `poi-map`

Frozen data as authored rows (like table-deals), the live answer only as an optional refresh:
rows `Title | Lat, Lng | Link (optional)`; options `Zoom | auto` (fit bounds), `Tiles | google|osm`.
Rendering: map with the live style, zoom buttons, pin markers, bubble on hover/focus, list of
the same points below the map for keyboard and screen-reader users (and as the no-JS / no-tiles
fallback). Parser: one row per point of the recorded `pointsOfInterest/{id}` answer (the snapshot
has no titles: the bubbles render only on hover), so the recordings come first.

Import: the current imports contain the rendered Google map as text ("Zoom inZoom out", the
keyboard shortcut table "Nach rechts / Nach oben …", "Kurzbefehle", "Kartendaten ©2026 Google",
tile images with the API key, e.g. `content/de/de/first-class.plain.html`). The parser must drop
everything inside `.dcep-poi-mapping` and write the block from the data-dcep id instead (row
`Source | <decoded JCR path>` until the points are recorded).

## (c) AirCore route pages (`/lhg/{cc}/{ll}/o-d/cy-cy/*`)

Snapshots used: `lhg/de/en/o-d/cy-cy/frankfurt-new-york.html`, `lhg/de/de/o-d/cy-cy/frankfurt-london.html`,
`lhg/gb/en/o-d/cy-cy/frankfurt-london.html` (plus `frankfurt-tokyo`, `munich-los-angeles`,
`muenchen-los-angeles` for edge cases). All 18 city-city routes have the fare chart and the price
alert; the flight plan is on 7 of 9 routes per language (none on Berlin–Rome, Hamburg–Palma);
the c-c (country) pages have none of the three. Order inside `#content.main.ond-redesign >
.container`, each in a `div.mb-10`: `.flight-info-cards-wrapper`, `.best-price-per-month-wrapper`,
`section.last-minute-deals`, `.price-alert-wrapper`, `div.column.event` (flight plan),
`.flight-benefits-wrapper`.

Current import: the aircore-route template was built from a c-c page (`#content > .faq`,
`#content > .icon-links`, …); on cy-cy pages those elements sit under `#content > .container >
.mb-10 > …`, so nothing but `flight-search` matches and all three sections arrive as loose
paragraphs (also FAQ, icon links, benefits, and `section.last-minute-deals`, which the existing
`parsers/table-deals.js` already handles on destination pages).

### Monthly fare chart: `section.best-price-per-month`

```html
<section class="best-price-per-month" data-best-price-per-month data-origin-iata="FRA" data-destination-iata="NYC"
  data-origin-city="Frankfurt" data-destination-city="New York" data-trip-duration="14" data-best-price-label="Best price"
  data-from-label="from" data-initial-class="E" data-cabin-labels='{"E":"Economy Class","N":"Premium Economy Class",…}'
  data-api-url="/bestprice/bestPricePerMonth" data-api-lang="en" data-api-country-code="de" data-api-trip-type="RT">
 <div class="bppm-loader" …></div>
 <div class="bppm-header"><h2 class="bppm-headline">Lowest available fares</h2>
   <p class="bppm-subhead">from Frankfurt to New York, 1 traveller, Economy Class, 14 days</p></div>
 <div class="bppm-slider"><template data-bppm-tpl-card>…</template>
  <button class="bppm-arrow bppm-arrow-prev" aria-label="Previous slide" hidden></button>
  <div class="bppm-track">
   <div class="bppm-column has-year" style="--bppm-anti:3.44rem;--bppm-pct:80%"><div class="bppm-year">2026</div>
    <div class="bppm-column-inner"><div class="bppm-anti"></div>
     <a class="bppm-card" href="/aircore/deeplink/redirect/en/de/FRA/JFK/31.10.2026/14.11.2026/RT">
      <span class="bppm-price-group"><span class="bppm-from">from</span><span class="bppm-price">672 €</span></span>
      <span class="bppm-spacer"></span><span class="bppm-month">Oct.</span><span class="bppm-date">31 Oct.</span></a></div></div>
   … 12 columns; best: a.bppm-card.is-best + span.bppm-badge "Best price"; empty month: div.bppm-card--empty (month only)
  </div><button class="bppm-arrow bppm-arrow-next" aria-label="Next slide"></button></div></section>
```

- 12 months from the capture month; the year only on the first column of a year; ties can give
  several `is-best`; bar height `--bppm-pct` ≈ 65 % (cheapest) … 100 % (dearest), empty months 82 %.
- Deep link `/aircore/deeplink/redirect/{lang}/{cc}/{ORIG}/{DEST airport}/{out dd.mm.yyyy}/{back = out + 14 days}/RT`.
- German: "Günstigster Preis pro Monat", "Bestpreis", months "Okt.", "Mär.", "Mai"; gb/en shows €.
- No trip type or cabin switch in the DOM; no disclaimer. The track is filled by script
  (templates, loader, `data-api-url`) but complete in the snapshots.

Proposed block `table-price-months` (frozen rows): default content before it = the H2 and the
subhead; one row per month, 4 cells `Year | Month | Date | Price link` (year only where it
changes, the link text "from 672 €" on the deep link; a trailing "Best price" (bold) marks a best
month; an empty price cell = grey empty month); option rows `Best price label`, `Previous label`,
`Next label`. The block computes the bar heights from the prices (65 % + 35 % × (p − min) / (max − min),
empty 82 %), slider with arrows, whole card is the link (`rel=nofollow`).
Parser: `section.best-price-per-month` (replace `.best-price-per-month-wrapper`): heading
`.bppm-headline`, subhead `.bppm-subhead`, rows from `.bppm-track > .bppm-column` (skip
`template`): `.bppm-year` (nbsp → empty), `.bppm-month`, `.bppm-date`, `.bppm-from` + `.bppm-price`
in `a.bppm-card[href]`, `.is-best` → `.bppm-badge-inner` text, `.bppm-card--empty` → month only;
`Best price label` from `data-best-price-label`, arrow labels from the buttons' aria-label.

### Best price alert

Not a form: `<div class="price-alert-wrapper"><a href="https://www.lufthansa.com/de/en/book-and-manage/offers-and-destination?OriginCode=FRA&BpsDestination=NYC&ActiveTab=fareAlert&utm_medium=organic&utm_source=aircore&utm_campaign=LH_DE_EN_aircore_best_price_alert" class="btn-secondary" target="_blank" rel="nofollow">Best price alert</a></div>`
(English label in every market; path and campaign follow the market; centred by
`.ond-redesign .price-alert-wrapper { display: flex; justify-content: center }`).
No block: default content `<p><em><a …>Best price alert</a></em></p>` (secondary button), which the
current import already produces; only the centring is missing (a section style, e.g.
`centered`) and the new tab.

### Flight plan (`h2#flightplan-section` + `.fp.flight-table-wrapper`)

```html
<nav class="fp-nav"><ul role="tablist">
 <li class="fp-nav-element outbound-nav active" role="tab" aria-selected="true" aria-controls="outFlights" id="tab-outFlights"><span>Frankfurt</span> <span class="lh lh-airplane-outbound"></span> <span>New York</span></li>
 <li class="fp-nav-element return-flight-nav" role="tab" aria-selected="false" aria-controls="inFlights" id="tab-inFlights">…</li>
 <li class="moving-bar on-active" style="width:241px;left:0"></li></ul></nav>
<div class="fp-tab visible" role="tabpanel" id="outFlights"><div class="read-more" data-visible-count="6">
 <div class="fp-row" tabindex="0" aria-label="LH400: Frankfurt - New York 10:55 - 13:35; Flight duration: 08:40">
  <div class="fp-cell"><div><div class="times"><div>10:55<br>FRA</div><div class="icon">✈</div><div>13:35<br>JFK</div></div><div class="operated"> Operated by: UA </div></div></div>
  <div class="fp-cell flight-info"><div><div>Flight duration: 08:40</div><div>LH400</div></div></div>
  <div class="fp-cell flight-schedule"><div><div><span data-weekday="1">Mo</span><span>-</span></div><div><span data-weekday="3">We</span><span class="lh lh-airplane-outbound"></span></div>…</div></div>
 </div>…</div><div class="fp-disclaimer">Please note that the flight schedule changes regularly.</div></div>
<div class="fp-tab" role="tabpanel" id="inFlights">…</div>
```

Columns: departure time + airport, arrival time + airport, operated by (optional), duration,
flight number, 7 weekdays Mon–Sun (plane icon = operates, "-" = not). Rows: FRA–NYC 4+4, FRA–LON
6+6, FRA–TYO 3+3, MUC–LAX 1+1; all static in the DOM (only the moving bar, tab switching and the
`today` weekday class are script). The return rows' aria-label is wrong on the source (outbound
direction). German: "Flugplan", "Flugdauer:", "Durchgeführt von:", Mo Di Mi Do Fr Sa So.

Proposed block `table-flightplan` (frozen rows, tabs): default content before it = the H2 (keep
id `flightplan`, the info card links to it). Rows: a tab row `Tab | Frankfurt → New York` starts
each direction; flight rows with 6 cells `Departure (10:55 FRA) | Arrival (13:35 JFK) | Flight
(LH400) | Duration (08:40) | Operated by (UA or empty) | Days (We, Th, Fr, Sa)`; options `Weekdays
| Mo, Tu, We, Th, Fr, Sa, Su`, `Duration label`, `Operated by label`, `Visible rows | 6`,
`Disclaimer | …`. Block: ARIA tabs with the moving underline, Mon–Sun always drawn (listed days get
the plane, others "-"), today highlighted at runtime, disclaimer under each panel.
Parser: `#content .column.event:has(.fp.flight-table-wrapper)`; tabs from `.fp-nav
li.fp-nav-element` (two `span:not(.lh)` texts joined with " → "; panel by `aria-controls`); rows
from `#outFlights .fp-row` then `#inFlights .fp-row`: `.times > div:nth-child(1|3)` (split on
`<br>`), `.operated` minus the label, `.flight-info > div > div:first-child` minus the label (the
label goes to `Duration label`), `.flight-info > div > div:last-child`, days =
`span[data-weekday]` followed by `span.lh-airplane-outbound`; weekday labels from all seven
`span[data-weekday]` texts (source order 1…6, 0); the first `.fp-disclaimer`; `Visible rows`
from `.read-more[data-visible-count]`. Never use the row aria-label.

Template: point the cy-cy selectors at `#content .container > .mb-10 > …` (or a separate cy-cy
template) and add `section.last-minute-deals` → `table-deals`.

Done (B11, 2026-10-23): the aircore-route template maps `section.best-price-per-month` →
table-price-months, the flight plan column → table-flightplan, `section.last-minute-deals` →
table-deals, and the cy-cy `.icon-links`, `.faq-wrapper > .faq`, `.internal-links` under
`#content > .container`; cy-cy section breaks: hero offer card, title + fares + deals, price
alert (section style `centered, new-tab`), flight plan + benefits, visual split (full-bleed),
useful information, FAQ, top connections. The c-c pages keep their output.
