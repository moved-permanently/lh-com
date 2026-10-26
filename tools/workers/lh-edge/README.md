# lh-edge

The router Worker in front of lh-com. Clients of www.lufthansa.com ask URLs that the Edge Delivery site alone does not answer (the app's web view, JSON feeds, App Links files); lh-edge answers them with www's shapes and passes everything else to the Edge Delivery origin like Adobe's reference Worker.

URL: the workers.dev host of the account (`workers_dev = true`); a demo host on bbird.live is attached in the Cloudflare dashboard. No routes or custom domains in `wrangler.toml`.

## Portability

Standard Workers APIs only (fetch, Request/Response, HTMLRewriter, service bindings). Hosts and origins are `[vars]`, the optional origin token is a secret, the binding has a generic name (`MESSAGES`); no workers.dev host or account in the code. To move it: deploy the folder to the other account, bind `MESSAGES` to that account's messages Worker, set the vars.

| Var | Meaning |
| --- | --- |
| `ORIGIN` | the Edge Delivery origin host (`main--lh-com--moved-permanently.aem.live`; must be `main--*--*.aem.live`, as in the reference) |
| `PUBLIC_HOST` | `X-Forwarded-Host` towards the origin (empty: the request's host) |
| `WWW_HOST` | the host whose `https://<host>.solo_continue/` closes the app's web view; www page links in solo pages get its solo form (`www.lufthansa.com`) |
| `ALIAS_SHEET` | the alias sheet of the web view paths (`/app/config/webview-aliases.json`) |
| `PUSH_INVALIDATION` | `disabled` turns off `X-Push-Invalidation` (lower environments only) |
| `SDUI_WEB_LINKS` | web links in app screens: `external` (as www today: v1 `showWebScreen` `externalBrowser`, v2 `openUrl` `SELF`, the www URL) or `solo` (`AIR_EM` and the `<page>.solo.continue` URL on the public host) |
| `EDGE_TTL` | seconds: caps the edge cache of origin answers (`cf.cacheTtlByStatus`: 2xx `EDGE_TTL`, 404 60 s) and the `max-age` pages and JSON send to browsers, for hosts without push invalidation (the demo host; `60`); empty: the reference behaviour (the origin's `max-age`, purged by push invalidation) |
| `EDGE_CACHE_VERSION` | added to every origin request lh-edge caches at the edge as `?lh-edge-cache=<value>` (Cloudflare's cache key is the URL); **a new value drops lh-edge's edge cache** (see "Dropping the edge cache"); empty: not added |
| `CORS_ORIGINS` | GraphQL feeds: origins that get `Access-Control-Allow-Origin` (comma list: a domain is the domain and its subdomains, `*` one label, `localhost` any port; https only except localhost): the group's domains, the lh-com hosts, localhost |
| secret `ORIGIN_AUTHENTICATION` | `Authorization: token …` towards the origin, when the site needs one |

## Routes (first match wins, `src/index.js` `ROUTES`)

| Route | Match | Answer |
| --- | --- | --- |
| `well-known` | `/.well-known/assetlinks.json`, `/.well-known/apple-app-site-association` | www's files byte for byte (`src/well-known.js`, generated from `tools/source-export/feeds/well-known/` by `build-well-known.mjs`), `application/json` |
| `message-center` | `/graphql/execute.json/Message-Center/*` | the messages Worker through the service binding `MESSAGES` |
| `graphql` | GET/HEAD/OPTIONS `/graphql/execute.json/<config>/<query>[;name=value...]` (other configurations than Message-Center) | www's persisted queries from the structured content under `/data/` (`src/graphql.js`, see "GraphQL feeds"); `application/json`, `cache-control: public, max-age=120` |
| `sdui` | GET/HEAD `/content/mobile/<...>.sdui`, `.v2.sdui` | the app screen, rendered from the document and the index (`src/sdui.js`, see `SDUI.md`); `application/json`, `cache-control: public, max-age=60`; 404 without a document |
| `solo` | GET/HEAD `<path>.solo_continue`, `.solo.continue`, `.solo.continue.solo_continue`, `.solo_continue.html`, `.solo_continue.genapp.html` | the page in the app view, see below |
| `pass-through` | everything else | the Edge Delivery origin |

Packages 2 to 6 add their routes before `pass-through`.

## Pass-through (Adobe's reference Worker)

`src/edge.js` follows https://github.com/adobe/aem-cloudflare-prod-worker (`src/index.mjs`):

- other ports: 301 to 443; `/drafts/`: 404; `/.rum/`, `/.optel/`: only GET, POST, OPTIONS;
- query parameters: media (`/media_<hash>…`) keep `format`, `height`, `optimize`, `width`; `.json` keeps `limit`, `offset`, `sheet`; everything else loses its query (the browser still has it: `?channel=app`, `?stage-time=` are read by the page scripts); parameters sorted;
- origin request: host `ORIGIN`, `X-Forwarded-Host`, `X-BYO-CDN-Type: cloudflare`, `X-Push-Invalidation: enabled`, `cf.cacheEverything`;
- answer: a 301 gets the original query appended to a `location` without one; a 304 loses `Content-Security-Policy`; `age` and `x-robots-tag` are removed.

Deviations: `X-Forwarded-Host` is the var `PUBLIC_HOST` (fallback: the request's host, as the reference) because one Worker answers on several hosts (workers.dev, the demo host) for one public site; the origin var is `ORIGIN` (reference: `ORIGIN_HOSTNAME`); the sheets the Worker reads itself (the alias sheet) are fetched past Cloudflare's cache (`cache: 'no-store'`, origin sends `max-age=7200`) and kept 60 s in the isolate. With `cacheEverything` alone the edge keeps pages for the origin's `max-age` (7200 s) until push invalidation purges them. The demo host has no push invalidation, so `EDGE_TTL = "60"` caps it: a publish shows within about a minute. For a zone with push invalidation set `EDGE_TTL` empty.

## Dropping the edge cache

Custom cache keys and per-host purge aren't available on this Cloudflare plan, and an entry keeps the lifetime it was stored with: an entry stored before `EDGE_TTL` (under aem.live's `cdn-cache-control: max-age=172800`) stays for two days. To drop everything lh-edge has cached, set `EDGE_CACHE_VERSION` in `wrangler.toml` to a new value (a date and a letter, `2026-10-25b`) and deploy: every cached origin request carries `?lh-edge-cache=<value>`, so no old entry is used again (old entries expire by themselves). aem.live ignores the parameter on pages, `.plain.html`, JSON (with `limit`/`offset`/`sheet`), code and media (`width`/`format`/`optimize` still apply); on redirects it echoes it in `location`, and lh-edge removes it there. Requests past the edge cache (the alias sheet, the screen index) and other methods than GET/HEAD don't carry it.

## The app's web view (`src/solo.js`)

1. The suffix is stripped (all five forms; a trailing slash too): the app path.
2. The alias sheet (`ALIAS_SHEET`, columns `locale`, `app-path`, `page`, `note`) maps the app path exactly to the replica page (`/de/de/book-and-manage/timetable-and-flight-status/flight-disruptions` → `/de/de/flugunregelmaessigkeiten`); a path without a row is looked up as it is.
3. The page is fetched from the origin and answered in place (status 200, no redirect). A missing page answers the origin's 404 (as www); a redirect of the site goes to the solo form of its target.
4. HTMLRewriter: `<meta name="channel" content="app">` and `<meta name="app-close-url" content="https://<WWW_HOST>.solo_continue/">` first in `<head>` (`scripts/channel.js` reads the metadata: no header, footer, breadcrumb or consent, as with `?channel=app`); links: page links on this host and on `WWW_HOST` get the `.solo_continue` form (query and fragment kept), homepage links (`/`, `/{cc}/{ll}`, `/{cc}/{ll}/homepage`) the close URL, links containing `/logout`, files, other hosts and anchors stay; relative media and links (`./media_…`) are made root-relative against the page's own path (the solo URL of an alias sits in another folder).
5. In the browser, `scripts/channel.js` applies the same link rules on click to links the page scripts render later.

## GraphQL feeds (`src/graphql.js`)

The structured data Lufthansa backends and the app's server-side services read from www as JSON, `GET /graphql/execute.json/<config>/<query>[;name=value...]`. The data lives in Document Authoring as structured content (one document per item under `/data/...`, mirroring the AEM paths under `/content/dam/...`; schemas `/.da/forms/schemas/lh-*`, defined in `tools/feeds/schemas.mjs`), indexed per model (`helix-query.yaml`, indexes `feed-*`). lh-edge reads the indexes past the edge cache (30 s in the isolate; a publish shows within about a minute), the documents from the index's `html` property (the form editor's format, `src/daform.js`), the rich texts from the companion documents' index.

| Query | Answer |
| --- | --- |
| `mobileapp/whatsnewList` | `whatsnewList.items` (list fields: `__typename`, `_path`, `releaseVersion`, `date`, `headline`, `shortText.plaintext`, `longText.html`, `image._path`, `_tags`, `featureFlagName`) of the `locale` folder (none: all), tagged with `client`, newest `date` first, `limit`. www does not apply `tenant` to this list (recorded: an android/lh list holds items tagged lx only) |
| `mobileapp/whatsNewListEarlyAccess`, `whatsNewListNonEarlyAccess` | the same filter with the pop-up fields (`activationDate`, `ImageLH`, `imageLX`, `imageSN`, `imageOS`, `imageAZ`); NonEarlyAccess drops items tagged `mobile-app:early-access` |
| `mobileapp/getStartPopupEarlyAccess`, `getStartPopupNonEarlyAccess` | items tagged `mobile-app:start-popup`, `client` **and** `tenant`, `activationDate` at or before `to`, newest activation first |
| `mobileapp/getItemByID` | `whatsnewByPath.item` by `id` (the `_path`); unknown: www's "did not yield a Content Fragment" error |
| `BenefitCard/BenefitItemsList` | `benefititemList.items` under the `langPath` folder, `airline` when given |
| `AllegrisUpgrade/AllegrisAircraftsList` | `allegrisaircraftList.items` of the `airline` (case-insensitive) |
| `Travel-Regulations/TravelRegulationsByPath` | `travelRegulationsList.items`: without `path` the master of every country (by path); with `path` the country's master, with `includedVariations=true` all its variations |
| `Travel-Regulations/TravelRegulationByPathAndVariation` | `travelRegulationsByPath.item`: one variation of the country at `path` |
| `Ancillary-on-TMC/get-ancillaries-catalogs` | `ancillaryCatalogList.items`: every service with every variation |
| `Ancillary-on-TMC/tmc-translations` | `tmcTranslationsByPath.item` (`_path`, `_variation`, `translations.<locale>.<key>`) from the sheet `/data/lufthansa-group/ancillary/tmc/tmc-web-translations/tmc-translations` (key x 31 locales) |
| `Orchestrator-Services/SDUI-Service-List` | `sduiServiceList.items` |
| `B2BNeo/getFeatureFlag` | `featureFlagList.items`; `description` as `html`, `markdown`, `plaintext` and `json` from the plain text |
| `B2BNeo/getFreeFlightConfig`, `getAllFooterLogos` | as recorded (`src/graphql-fixed.js`) |

Required variable missing (`getItemByID` without `id`, `BenefitItemsList` without `langPath`, `AllegrisAircraftsList` without `airline`, `TravelRegulationByPathAndVariation` without `path`, `getLoginConfigByPath` without `path`): www's GraphQL error, HTTP 200. Failing on www, answered as www: `Travel-Regulations/TravelRegulationList` and `BenefitCard/benefitcardimageList` 500 (validation error, no cache-control), `B2BNeo/getLoginConfig` 200 (missing fragment), `B2BNeo/getLoginConfigByPath` without `path` 200 (variable error). Any other configuration or query name (also the ones only test systems have, e.g. `Ancillary-on-TMC/tmc-translations-v2`): 404 with AEM's "Configuration: '<config>' and Query Name: '<query>' does not resolve to an existing Persistent Query" (lh-messages answers an unknown `Message-Center/<query>` the same way). Bodies: `build-graphql-fixed.mjs` writes them from the recording.

Variables are `;name=value` path parameters, URL-decoded (`/` and `%2F` in a path value are the same; www answers 404 to `%2F`). Headers: `content-type: application/json`, `cache-control: public, max-age=120`, `last-modified`: the newest change of the data in the answer (not www's query edit time). CORS: `CORS_ORIGINS`.

### Data feeds (the indexes themselves)

Each index JSON is a plain feed a backend can read (fields of the documents plus `html`, `lastModified`; `?offset=&limit=`):

| Feed | URL |
| --- | --- |
| What's new | `/data/lufthansa-group/mobileapp/whats-new/query-index.json` |
| Upgrade benefits | `/data/lufthansa-group/ancillary/upgrade/benefitcard/benefititems/query-index.json` |
| Allegris aircraft | `/data/lufthansa-group/ancillary/allegris-upgrade/aircraft/query-index.json` |
| Travel regulations | `/data/content-fragments/travelready-infohub/query-index.json` |
| Trip Management catalog | `/data/lufthansa-group/ancillary/tmc/catalog/query-index.json` |
| Trip Management strings (sheet) | `/data/lufthansa-group/ancillary/tmc/tmc-web-translations/tmc-translations.json` |
| SDUI services | `/data/content-fragments/orchestrator-services/sdui-services/query-index.json` |
| B2B Neo feature flags | `/data/hcl/content-fragments/query-index.json` |
| Rich texts (companion documents) | `/data/details/query-index.json` |

`compare-graphql.mjs` (`--host <lh-edge>` or `--local`) compares every recorded URL with www's answer field by field; the deliberate differences are listed in the script.

## Public host

Absolute links of the app screens (other screens, images) use `X-LH-Public-Host` (a CDN in front that sends chosen paths to lh-edge), else `X-Forwarded-Host`, else `PUBLIC_HOST`, else the request's host.

## Tests and deployment

`npm test` (Node 24, no install; `fetch` mocked, `test/htmlrewriter-shim.mjs` stands in for the runtime's HTMLRewriter): one test per route and the pass-through. `.github/workflows/deploy-lh-edge.yaml` tests and deploys on pushes to main that touch this folder (secret `CLOUDFLARE_API_TOKEN`).

`compare-solo.mjs --host <lh-edge host> [--aliases tools/source-export/feeds/webviews/webview-aliases.csv]` renders every solo URL of www's recording (`tools/source-export/feeds/webviews/www-solo-pages.json`) on the lh-edge host in a headless browser and compares title, headings, the text of `<main>` (as recorded: textContent without scripts and styles; Dice coefficient of word bigrams), links that leave the app view, and whether header, footer, breadcrumb or consent render. `--aliases` requests the alias target directly (before the alias sheet is published). Output: `tools/reports/lh-edge/compare-solo.md` and `.json`.
