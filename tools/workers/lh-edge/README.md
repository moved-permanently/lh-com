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
| `EVENTS_LOG`, `EVENTS_SITE` | publish events: the audit log URL (`https://admin.hlx.page/log/<org>/<site>/main`) and `<org>/<site>`, which the webhook body must name |
| KV `EVENTS`; secrets `AUDIT_LOG_KEY`, `WEBHOOK_TOKEN`, `EVENTS_SINK_URL` | publish events: the relay's state (one key); the site's API key with the author role (reads the audit log); the site config webhook's token; optional: where each event is POSTed (unset: logged) |

## Routes (first match wins, `src/index.js` `ROUTES`)

| Route | Match | Answer |
| --- | --- | --- |
| `events` | GET/HEAD `/_lh/events.json` | the last 500 publish events, newest first (`src/events.js`, see "Publish events"); `cache-control: no-store` |
| `events-webhook` | POST `/_lh/events/webhook` | the site config's webhook: reads the audit log range of its `nextToken` (see "Publish events") |
| `csi-xf` | GET/HEAD `/content/experience-fragments/<folder>.csi-xf.json` | www's fragment catalog of a folder (`src/xf.js`), from the query index `/xf/query-index.json` (documents under `/xf/` with `xf-path`, `xf-kind`, `xf-tags`; `tools/importer/build-xf-docs.mjs`): sub-folders nested, `experienceFragments` with `sdui` links and variants; `no-cache, no-store, must-revalidate`, `Pragma: no-cache`, `Expires: 0`; outside `/content/experience-fragments/lh/` 400 `{}` |
| `aircraft` | GET/HEAD `<any page>.aircraft.json` | `{"aircrafts":[{name, title, url}]}`: the aircraft pages of the page's locale in the fleet overview's order (`src/aircraft.js`), from the query index `/fleet-index.json` (metadata `aircraft-code`, `aircraft-order`; `tools/importer/add-fleet-metadata.mjs`); `application/json`, no cache headers; empty for a locale without fleet pages |
| `service-worker` | GET/HEAD `/service-worker.js` | www's file (the code repository's `/service-worker.js`, from the origin) with `application/javascript`, `public, max-age=21600` |
| `well-known` | `/.well-known/assetlinks.json`, `/.well-known/apple-app-site-association` | www's files byte for byte (`src/well-known.js`, generated from `tools/source-export/feeds/well-known/` by `build-well-known.mjs`), `application/json` |
| `message-center` | `/graphql/execute.json/Message-Center/*` | the messages Worker through the service binding `MESSAGES` |
| `graphql` | GET/HEAD/OPTIONS `/graphql/execute.json/<config>/<query>[;name=value...]` (other configurations than Message-Center) | www's persisted queries from the structured content under `/data/` (`src/graphql.js`, see "GraphQL feeds"); `application/json`, `cache-control: public, max-age=120` |
| `sdui` | GET/HEAD `/content/mobile/<...>[.v2][.ios][.nocache].sdui` (the markers in any order, each once) | the app screen, rendered from the document and the index (`src/sdui.js`, see `SDUI.md`): `v2` the v2 format (`ios` has no effect there); `ios` without `v2` www's iOS v1 layout (text runs in `paddedColumn`s, screen links `.ios.sdui`, no `LARGE` spacers at the ends of a page); `nocache` the same body with `Cache-Control: max-age=600`; without it no `Cache-Control`, as www; `application/json`; 404 without a document |
| `search` | POST `/service/secured/api/search` | www's site search API from the locale's search index (`src/search.js`, see "Site search"); `application/json`, no `cache-control` |
| `login-url` | GET `/service/secured/api/core/authenticate/loginPageUrl?state=...` | www's login link (`src/login.js`, see "Login link") |
| `default-airport` | GET `/service/secured/api/core/booking/defaultairport` | the market's default airports (`src/booking.js`, see "Small endpoints") |
| `booking-list` | GET `/service/secured/api/core/booking/bookinglist` | 204, as www |
| `g4t-kiosk` | POST `/apps/dcep/deeplink/goodfortrain/stele` | a page that stores the booking pair in sessionStorage and goes on to the kiosk page in the app view (`src/g4t.js`) |
| `select-language` | GET `/apps/selectlanguage?tenant=&country=` | the market's languages (`src/select-language.js`) |
| `owa` | GET `/content/lh/markets/<cc>/<ll>/<page>.csi-owa-{header,footer,portal-config}.json` | www's header and footer JSON from the nav and footer documents (`src/owa.js`, see "Header and footer JSON") |
| `dam` | GET/HEAD `/content/dam/*` | www's DAM URLs from the copies in Document Authoring (`src/dam.js`, see "DAM URLs") |
| `solo` | GET/HEAD `<path>.solo_continue`, `.solo.continue`, `.solo.continue.solo_continue`, `.solo_continue.html`, `.solo_continue.genapp.html` | the page in the app view, see below |
| `login-return` | GET/HEAD `/` or `/<cc>/<ll>/...` with `code` and `state=/<cc>/...` | lh-backends (the return from the login provider), before the entry redirects |
| `entry` | GET/HEAD `/`, `/<cc>`, `/<cc>/<ll>` (with or without `/`) | 302 to the homepage of the market and language (`src/entry.js`, see "Entry redirects") |
| `backends` | any method: `/service/secured/api/*` (but the four above and `search`), `/apps/dcep/deeplink/*` (but the kiosk), `/deeplink/*`, `/sso/*`, `/loginservice`, `/seatmap/*`, `/_lh-backends/*` | lh-backends through the service binding `BACKENDS`, unchanged (`src/backends.js`) |
| `pass-through` | everything else | the Edge Delivery origin |

Packages add their routes before `login-return`, `entry` and `backends`; `pass-through` comes last.

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

## DAM URLs (`src/dam.js`)

Image and file URLs under `https://www.lufthansa.com/content/dam/...` keep working on lh-com: the app, the AirCore pages on www, backends and old e-mails load them directly. The files are copies in Document Authoring under their old paths (`tools/importer/dam-copy.mjs`, report `tools/reports/dam/dam-copy.md`), named by `scripts/dam-path.js`, one function for the copies, this route and the site:

- The path is decoded first (`%20`, `'`, umlauts never reach Edge Delivery), then named as Edge Delivery's admin names it: the file name lower case, accents dropped, every other character run one `-` (helix-shared-string `sanitizeName`), the extension lower case; folders lower case (Document Authoring), and a folder admin refuses (characters other than `a-z0-9_.-`: `eat-see-do-bogotá`, en dashes, no-break spaces) is named like a file. Where two www paths give one name, `scripts/dam-collisions.js` gives the later one its own (generated by the copy script).
- `<asset>.transform/lh-dcep-transform-width-<n>/img.<ext>`: the media with `width=<n>` (180, 360, 720, 1440, 2560; 2880 adds `height=2880`), `format=webply` (webp), `jpeg` (jpg), none (png), `optimize=medium`; another rendition name answers 404 as on www. Without a rendition: the original file. The site's own form (`/content/dam/<name>?width=...&format=...`) keeps its media parameters.
- Edge Delivery answers an asset path with a 301 to its media (`media_<hash>.<ext>`); the route follows it (same origin, at most three hops) and returns the bytes with `cache-control: public, max-age=2592000`; 404s `max-age=60`.
- A missing image under `/content/dam/(lh|lx|bel|four_y|ita|austrian/global)/images/offers/` answers 302 as www: to `/content/dam/lufthansa-group/images/destination/<name>.jpg` when that copy exists (not for ita and four_y), else to `<tenant>/images/offers/fallback/generic<suffix>.jpg` (`zzq-square.jpg` gives `generic-square.jpg`), the rendition kept. As on www, the other airlines' fallbacks go to their sites (`www.swiss.com`, `www.austrian.com`, `www.brusselsairlines.com`, `www.ita-airways.com`, `www.discover-airlines.com`); Lufthansa's stay on the request's host.
- Videos over 36 MB and the subtitles (`.vtt`), which Edge Delivery can't hold, are objects of the R2 bucket bound as `DAM_MEDIA` (`lh-dam-media`, `wrangler.toml`), key = the Edge Delivery name without the leading slash (`src/dam-media.js`, the first of `DAM_STEPS`): `.vtt` as `text/vtt; charset=utf-8`, `.mp4` as `video/mp4` with range requests (206, `content-range`, `accept-ranges: bytes`), 30 days; a missing object goes on to the DA copies. Only `.mp4` and `.vtt` are looked up there.
- `DAM_STEPS` (exported by `src/dam.js`) run before the copies: a step `async (request, env, ctx, { asset, rendition, valid, url })` returns a Response or `null`. The lookup of the synced brand assets (`/content/dam/<tenant>/images/frontify/...`) goes there.

The copies are served from `ORIGIN` (aem.live): a copy answers once it is published.

## Site search (`src/search.js`)

`POST /service/secured/api/search` with `{"phrase": "..."}` and `X-Portal: LH`, `X-Portal-Site`, `X-Portal-Language` answers as www: `{"results": [{"link", "headline", "description"}], "total", "pageSize": 10}`, at most 30 results, `content-type: application/json`, no `cache-control`; without the X-Portal headers or the phrase 400 `{"error":"Invalid input","errors":[],"validationErrors":[]}` (www's answers: `tools/source-export/feeds/search/`).

- Data: the locale's search index `/<cc>/<ll>/search-index.json` (helix-query.yaml `search-<cc>-<ll>`), read through the edge cache and kept for a minute per isolate; it fills when pages are published.
- Scoring: `scripts/site-search.js`, the same as the site's `search-results` block (folding, every term must match, BM25F over title, headings, path, description and content, excerpt with the matches in `<strong>`). Pages with the metadata `hide-in-search: true` are left out.
- `link` is the page's path on this site: www sends its AEM paths (`/content/lh/markets/de/en/...`), which this site doesn't serve.
- Markets without a replica of their own (`X-Portal-Site: CH` ...) search the migrated locale of the same language (de/de, de/en).
- `compare-search.mjs --host https://lhedge.bbird.live` (or `--local`, the Worker in Node with the indexes computed from the local documents by `tools/importer/build-search-index.mjs`) compares the answers with www's for the recorded phrases.

## lh-backends (`src/backends.js`)

www answers a set of server endpoints that are not pages: REST calls of its own front end, partner and app deeplinks, the Travel ID return and logout, Amadeus' late login, the seat map. Another Worker, lh-backends, answers them for the replica; lh-edge hands them over unchanged through the service binding `BACKENDS` (method, path, query, headers and body, any method) and returns its answer as it is, `Set-Cookie` included and nothing cached here. The `backends` route comes after every route of lh-edge, so the endpoints lh-edge answers itself (search, default airport, booking list, login link, the Good for Train kiosk) stay here; the login return (`/` or a page with `code` and a page path in `state`) is checked before the entry redirects. Without the binding: 503 `{"error":"backends-not-bound"}`. The same binding answers the synced Frontify brand assets first (`/content/dam/<tenant>/(images|videos)/frontify/...`, see "DAM URLs").

## Entry redirects (`src/entry.js`)

Before any page lookup: `/<cc>/<ll>` and `/<cc>/<ll>/` answer 302 to `/<cc>/<ll>/homepage` (query kept) for the replica's locales, else to www's homepage for that market and language (as `scripts/locale.js` does for links). `/<two letters>` that is no country (ISO 3166-1, plus `xx`), such as `/en`, is left to the origin (404, as www). `/<cc>` takes the language from the saved choice (cookie `dcep.prehpsettings`, `<cc>/<ll>`) when its country matches, else the first `Accept-Language` language the market offers (`MARKETS`), else the market's default language (www's `/de` lands on `/de/de/en/homepage`, a 404: not copied). `/` takes the market from the saved choice, else `CF-IPCountry`, else the international market: www's `/xx/en/homepage?showLanguageSelection=true`. Answers carry `cache-control: private, no-store` and `Vary: Cookie, Accept-Language`. aem.live and lhcom.bbird.live don't send `/` through lh-edge: the client-side redirect of `/` in `scripts/scripts.js` stays.

## Login link (`src/login.js`)

`GET /service/secured/api/core/authenticate/loginPageUrl?state=<page>` answers www's JSON `{"loginPageUrl": "<Travel ID authorize URL>"}`, built from public parameters only: client id, redirect URI and scopes from the vars `TRAVELID_AUTHORIZE_URL`, `TRAVELID_CLIENT_ID`, `TRAVELID_REDIRECT_URI`, `TRAVELID_SCOPE` (www's values when unset), country and language from `X-Portal-Site` and `X-Portal-Language`, `state` from the query. Headers as www: `cache-control: private, no-cache, no-store, must-revalidate`, `access-control-allow-origin: *`. Without the X-Portal headers www answers 500 with an HTML page; here 400 `{"error":"missing-headers"}`. The header block's login link asks for it (and falls back to the link of the nav document where nothing answers).

## Header and footer JSON (`src/owa.js`)

`/content/lh/markets/<cc>/<ll>/<page>.csi-owa-header.json` and `.csi-owa-footer.json` answer www's JSON (its field names and order) built from `/<cc>/<ll>/nav` and `/<cc>/<ll>/footer` (`content-type: application/json;charset=utf-8`, `cache-control: max-age=300, public`); `.csi-owa-portal-config.json` answers `{"appShellJs":"","remoteEntries":[]}`, as every brand today. The vanity form (`/de/en/homepage.csi-owa-header.json`) is not answered here (404 from the origin, as www). The tracking ids (`dataIdentifierTrack`, `eventId`) and the values the documents don't hold (logo and flyout image paths, alt texts) come from the sheet `/app/config/owa-tracking` (columns locale, part, key, track, url, text; keys `quick/<label>`, `menu/<top>/<group>/<link>`, `tool/accessibility`, `tool/support`, `list<n>/<text>`, `field:<name>`), seeded from www's answers by `tools/importer/build-owa-sheet.mjs` (file `tools/importer/owa-tracking-sheet.json`); `url` and `text` there override the document where www's answer differs from it (trailing spaces, `.html`, a missing fragment). `compare-owa.mjs` compares header, footer and login with www's recordings.

## Small endpoints

- `GET /service/secured/api/core/booking/defaultairport` (`src/booking.js`): with `X-Portal: LH`, `X-Portal-Site`, `X-Portal-Language` 200 `{"globalDefaultAirport": {iataCode, name}, "marketDefaultAirport": {iataCode, name}}` for the market of `X-Portal-Site` from the sheet `/app/config/default-airports` (market, global IATA, global name, market IATA, market name; until it exists its seed DE/AT/GB; a market not in it: FRA Frankfurt); without the headers 400 `{"error":"Missing headers","errors":[],"validationErrors":[]}`; both `cache-control: private, no-cache, no-store, must-revalidate`. Seed file: `tools/importer/default-airports-sheet.json`.
- `GET /service/secured/api/core/booking/bookinglist`: 204, empty body, same cache-control; the caller's user agent is logged (console only).
- `POST /apps/dcep/deeplink/goodfortrain/stele` (`src/g4t.js`, Good for Train kiosks): form fields `Country`, `Language`, `Filekey`, `Ticketnumber`, `Lastname`; the answer is www's small HTML page: it stores the booking pair in `sessionStorage` (key `dcep-session-storage/<name>`, value the JSON string: `pnrfilekey` and `lastname`, or without a file key `ticketnumber` and `lastname`; nothing without a last name), then sets `window.location` to `/<cc>/<ll>/common/g4t-kiosk.solo_continue` (a plain GET; www has no such page today, so the replica's 404 as www). Unknown country: de; unknown language: the market's default. Nothing logged or cached.
- `GET /apps/selectlanguage?tenant=<tenant>&country=<cc>` (`src/select-language.js`): `{"languages":[{"code","name","isDefault"}]}` for the replica's languages of the market (English language names, `isDefault` false), empty for other markets, another tenant than `lh` or no parameters; `cache-control: max-age=604800`.

## Publish events (`src/events.js`, package 6)

www's authoring system posts one JSON message per page or fragment it publishes or withdraws: `{contentType: PAGE|EXP_FRAGMENT|CONTENT_FRAGMENT, contentPath, contentChangeType: CREATE_MODIFY|DELETE, env}`. lh-edge makes the same messages from lh-com's own publishing, read from the site's audit log (`EVENTS_LOG`, header `authorization: token <AUDIT_LOG_KEY>`, `limit=200` per read so one run stays within the CPU limit):

- **Poller:** the RPC entrypoint `EventsRelay` (`export class EventsRelay` in `src/index.js`, no route: reachable only over a service binding). lh-messages' every-minute cron calls `env.EVENTS_RELAY.poll()` (the account's five cron triggers are all in use). It reads from the stored position: the next page of a stored window (`from`, `to`, `nextToken`), else from the last `to` minus 60 s (the first run: the last 60 s) to now.
- **Webhook:** `POST /_lh/events/webhook`, body `{org, site, nextToken}`, header `authorization: token <WEBHOOK_TOKEN>` (compared in constant time; 401 without or with a wrong token, 400 for another org/site, 503 without the secret). It reads the range of its `nextToken` and does not move the poller, which stays as the safety net.
- **Kept:** per-resource entries with `route: live`: publish (`POST`, 200) and unpublish (`DELETE`, 204). Not kept: preview, bulk requests (202 with `paths`), job summaries (`job`, `path: /*`), snapshots, sheets (`.json`), media and other files, and every path the mapping does not know.
- **Deduplicated:** an entry already stored (the overlap reads it again) and the same path and change within 120 s.
- **Mapping version 1** (`mapPath`, `MAPPING_VERSION`; `contentChangeType` `CREATE_MODIFY` for publish, `DELETE` for unpublish; `env` `prod`):

| Edge Delivery path | `contentType` | `contentPath` |
| --- | --- | --- |
| `/<cc>/<ll>` and `/<cc>/<ll>/<page>` | `PAGE` | `/content/lh/markets/<cc>/<ll>[/<page>]` |
| `/content/lh/markets/...` (LoungeNet), `/content/mobile/...` (app pages) | `PAGE` | the same path |
| `/<cc>/<ll>/nav`, `/<cc>/<ll>/footer`, `/<cc>/<ll>/fragments/<name>` | `EXP_FRAGMENT` | `/content/experience-fragments/lh/markets/<cc>/<ll>/<nav, footer or name>` |
| `/data/<path>`, `/data/details/<path>` (a fragment's long texts) | `CONTENT_FRAGMENT` | `/content/dam/<path>` |
| `/message-center/<type>/<id>/<ll>` | `CONTENT_FRAGMENT` | `/content/dam/lufthansa-group/message-center/<type>/<id>` (lh-messages' `_path`; the languages are variations of one fragment) |
| `/message-center/config/cti-pages.json` | `CONTENT_FRAGMENT` | `/content/dam/lufthansa-group/message-center/config/cti-pages-for-all-tenants` |
| other `/message-center/...` documents | `CONTENT_FRAGMENT` | `/content/dam/lufthansa-group/message-center/...` |
| sheets, `/content/dam/*` files, `/lhg/`, `/drafts/`, `/library/`, `/.helix/`, root documents | none | |

- **State:** KV `EVENTS`, one key `state`: `{position, events}` (the last 500 events). Written only when events were added, the position moved to another page of the log or back to its live end, or it is older than 6 hours; never on a quiet poll.
- **Output:** `GET /_lh/events.json`: `{mappingVersion, position, total, events}`, the events newest first with their AEM fields, `timestamp` and Edge Delivery `path`. Each new event is POSTed to `EVENTS_SINK_URL` as the four AEM fields, up to 5 tries (1, 2, 4, 8 s back-off; 4xx other than 429 not retried), in `waitUntil`; without the secret the relay logs what it would send.

## Public host

Absolute links of the app screens (other screens, images) use `X-LH-Public-Host` (a CDN in front that sends chosen paths to lh-edge), else `X-Forwarded-Host`, else `PUBLIC_HOST`, else the request's host.

## Tests and deployment

`npm test` (Node 24, no install; `fetch` mocked, `test/htmlrewriter-shim.mjs` stands in for the runtime's HTMLRewriter, `test/cloudflare-workers-shim.mjs` (a loader hook) for `cloudflare:workers`): one test per route and the pass-through. `.github/workflows/deploy-lh-edge.yaml` tests and deploys on pushes to main that touch this folder (secret `CLOUDFLARE_API_TOKEN`).

`compare-solo.mjs --host <lh-edge host> [--aliases tools/source-export/feeds/webviews/webview-aliases.csv]` renders every solo URL of www's recording (`tools/source-export/feeds/webviews/www-solo-pages.json`) on the lh-edge host in a headless browser and compares title, headings, the text of `<main>` (as recorded: textContent without scripts and styles; Dice coefficient of word bigrams), links that leave the app view, and whether header, footer, breadcrumb or consent render. `--aliases` requests the alias target directly (before the alias sheet is published). Output: `tools/reports/lh-edge/compare-solo.md` and `.json`.
