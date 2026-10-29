# lh-edge

The router Worker in front of lh-com. Clients of www.lufthansa.com ask URLs that the Edge Delivery site alone does not answer (the app's web view, JSON feeds, App Links files); lh-edge answers them with www's shapes and passes everything else to the Edge Delivery origin like Adobe's reference Worker.

URL: the workers.dev host of the account (`workers_dev = true`); a demo host on bbird.live is attached in the Cloudflare dashboard. No routes or custom domains in `wrangler.toml`.

## Two accounts (the parallel run, `../README.md` "Two accounts")

lh-edge deploys to Blackbird and to the second Cloudflare account with the same code and vars;
the second account's config replaces the KV id of EVENTS (`accounts/benpeter.sed`: KV
`lh-events-state`). Its bindings go by name there too (lh-messages, lh-backends, lh-forms'
BotCheck, the R2 bucket `lh-dam-media`); its second deploy leg waits until lh-backends, lh-forms
and lh-messages exist in the account.

lufthansa.turnsthe.page is the demo's main host; the bbird.live hosts are the old ones and keep
answering as before until they are retired. Hosts on turnsthe.page follow the brand pattern
`<brand>.turnsthe.page` and `<brand>-<role>.turnsthe.page` (the brands: `scripts/demo.js`
`TURNSTHE_PAGE_BRANDS`, `../README.md` "Brand hosts"); the head-URL rewrite below runs on them.

| Blackbird | Second account | Treatment (vars) |
| --- | --- | --- |
| lhedge.bbird.live | lufthansa-edge.turnsthe.page | `PILOT_HOSTS` (every pilot root), `ALIAS_REWRITE_HOSTS` |
| lhcom.bbird.live (through Adobe's CDN) | lufthansa.turnsthe.page (`FRONT_DOOR_HOSTS`, below) | `PILOT_COUNTRIES_BY_HOST` (ch), `ALIAS_REWRITE_HOSTS` |
| lhcn.bbird.live | lufthansa-cn.turnsthe.page | `ALIAS_HOSTS` |
| lh-edge.aem-poc-lab.workers.dev | lh-edge.benpeter.workers.dev | (none) |

Secrets in the second account (set there, not by the workflow): `AUDIT_LOG_KEY` and
`WEBHOOK_TOKEN` (the publish events; the site config's webhook must point at that account's host
to use them); `EVENTS_SINK_URL` stays unset; `ORIGIN_AUTHENTICATION` only if the origin needs a
token (as on Blackbird). Rollback: git revert (both accounts redeploy).

## Head URLs (`src/head-urls.js`, `HEAD_URLS_FROM`)

The site config's production host is still lhcom.bbird.live (lhcom's CDN purge depends on it), so
Edge Delivery writes `https://lhcom.bbird.live/...` into every page's `link[rel=canonical]`,
`link[rel=alternate]` (hreflang), `meta[property=og:url]`, `og:image`, `og:image:*` and
`twitter:*`. On an HTML answer whose request host is a turnsthe.page brand host
(`scripts/demo.js` `TURNSTHE_PAGE_BRANDS`) a streaming HTMLRewriter moves those absolute URLs of
`HEAD_URLS_FROM` (`lhcom.bbird.live`) to the request's host; on an alias host (lufthansa-cn) to
its brand's main host (lufthansa.turnsthe.page), as an alias keeps one canonical host. Body links,
other head elements, `.plain.html` and non-HTML answers are untouched. On every other host, the
bbird.live hosts included (also with a forged `X-LH-Public-Host`), no rewriter is made. CPU per
page: 1.0 to 1.9 ms with the tests' JavaScript HTMLRewriter, 1.3 to 2.4 ms with lol-html's
WebAssembly build (19 to 44 KB pages), upper bounds for workerd's native rewriter; the turnsthe.page
hosts run on Workers Paid. **It goes away** when the production host moves to turnsthe.page: set
`HEAD_URLS_FROM = ""` (or drop the module). The smoke check masks the replica's host names, so it
does not show the rewrite; `tools/workers/lh-edge/test/head-urls.test.mjs` does.

## Front door (`src/front-door.js`, `FRONT_DOOR_HOSTS`)

On lufthansa.turnsthe.page lh-edge is the front door and stands in for the CDN that sits in
front of lhcom.bbird.live (scdemos/demo `workers/adobe/config/cdn.yaml`, origin selectors
`lhcom-*`, copied in `EDGE_PATHS` and `GATE_PATH`):
- the paths those rules send to lh-edge (solo pages; feeds: app screens, DAM, GraphQL, well-known,
  login link, search, default airport, booking list, the kiosk; www endpoints: entry redirects,
  fragment catalog, service worker, gzipped sitemaps, llms.txt, captcha, market pages as app
  screens and offline lists, aircraft lists, changelocale, mfe; the ch market and its sitemaps;
  service endpoints `/service/secured/api/*`, `/sso/*`, `/deeplink/*`, `/apps/dcep/deeplink/*`,
  `/apps/selectlanguage`, `*.v2.sdui`): the routes below, with `X-LH-Public-Host` set to the host
  (a client's own value is replaced, as the CDN rule set it);
- `/migration-status*` and `/_lh-auth/*`: lh-backends' gate over BACKENDS with `X-LH-Public-Host`
  (the gate trusts lufthansa.turnsthe.page), cookies and Set-Cookie passed on;
- everything else: the pass-through (the reference Worker) and not the routes, so paths lh-edge
  answers on lhedge but lhcom leaves to the origin answer as on lhcom (the short
  `/<cc>/<ll>/<page>.sdui` 404, pilot roots other than ch, `/loginservice` from the origin).

Freshness: pages within `EDGE_TTL` (60 s) as on every host; the pass-through sends
`x-push-invalidation: enabled` and the origin's cache tags reach Cloudflare's cache, so once the
site's push invalidation targets the turnsthe.page zone a publish shows within seconds.

Headers that differ from lhcom.bbird.live (bodies are the same apart from the host name):

| Header | lhcom.bbird.live (Adobe's CDN) | lufthansa.turnsthe.page (lh-edge) |
| --- | --- | --- |
| `cache-control` of pages, `.plain.html`, JSON | the origin's `max-age=7200, must-revalidate` | capped to `EDGE_TTL`: `max-age=60, must-revalidate` |
| `cdn-cache-control` | none | `max-age=60, must-revalidate` (pages), the origin's `max-age=172800` (sitemap XML, robots.txt) |
| `x-robots-tag` (the origin's `noindex, nofollow` on `.plain.html`) | kept | removed, as the reference Worker removes it |
| `server`, `cf-cache-status`, `cf-ray` | none | Cloudflare's |
| `via` (`1.1 varnish`), `x-cache-tag`, `surrogate-key`, `fastly-debug-*` | removed | the origin's, passed on |
| `vary` | `Accept-Encoding` | the origin's `Accept-Encoding,X-Forwarded-Host` |
| `accept-ranges: bytes` (static files), `x-skyint-fetch-pass` (paths sent to lh-edge), `fastly-restarts` | the CDN's | none |

And `/` (entry redirect by `CF-IPCountry`): lhcom's CDN reaches lh-edge from a US data centre, so
lhcom sends every visitor to www's us/en homepage; the front door sees the visitor's country.

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

## Alias hosts (`src/alias.js`, brief 94)

A request whose host is in `ALIAS_HOSTS` (demo `lhcn.bbird.live`, the replica's www.lufthansa.cn) is
routed exactly like one to the main host: same routes, same origin, same Workers behind them. On its
answers:

- `text/html`: absolute `href`, `src`, `srcset` and `action` URLs whose host is in
  `ALIAS_REWRITE_HOSTS` (the replica's own hosts, demo `lhcom.bbird.live,lhedge.bbird.live`) point at
  the alias host, so visitors stay on it. `<link rel="canonical">` and `<link rel="alternate"
  hreflang>` stay (one canonical host for search engines); links to other hosts stay
  (`www.lufthansa.com`: pages the replica does not have would 404 on the alias); relative links and
  meta tags are untouched.
- `text/html` gets `Cache-Control: public, max-age=28800` (`ALIAS_HTML_CACHE_CONTROL`; www's .cn host
  sends 8 hours, the .com host 300 s). Other answers keep their own headers.
- A redirect to one of `ALIAS_REWRITE_HOSTS` goes to the alias host; `/` redirects like `/` on the
  main host (no `cn` market).

Hosts without an entry in `ALIAS_HOSTS` are not touched. The alias host is attached to the Worker as
a custom domain in the Cloudflare dashboard (as the main host).

## URL forms (`src/url-forms.js`, `URL_FORMS`)

Before the routes (and before the front door's rules), other spellings of a page URL answer one 301 to the page, as
www answers them (`tools/source-export/feeds/url-forms`, recorded 2026-10-29):

| Request | www | Here |
| --- | --- | --- |
| upper case in a page path (`/de/en/Homepage`) | 301 to lower case | 301 to lower case (not under `lufthansa-fleet`, as www) |
| `<page>.html`, `<page>/` | 200 with the page (canonical without the suffix) | 301 to `<page>` |
| `<page>.nocache.html` | 200 with the page | 301 to `<page>` |
| `/content/lh/markets/<cc>/<ll>/<page>` | 200 with the page | 301 to `/<cc>/<ll>/<page>` |
| `/content/lh/markets/<cc>/<ll>/<page>.html` | 302 to the long path | 301 to `/<cc>/<ll>/<page>` |
| `.external.html`, `.solo.html`, `.sdui.html` | 200 | 404, as before |

A 301 instead of www's 200: under the suffixed or long URL the page breaks, its images are relative (`./media_…`) and the
site's scripts read the path (the form block's form id, the language switch, the sub-page navigation). Combined forms
take one hop (`/DE/EN/Carry-On-Baggage.html` to `/de/en/carry-on-baggage`); the query is kept. Page paths only:
`/<cc>/<ll>/…` (a country code) or `/content/lh/markets/<cc>/<ll>/…` whose last segment has no dot once the suffix
is gone, so `.plain.html`, `.sdui`, `.solo_continue`, `.csi-*.json`, `.mfe.html`, `.changelocale`, `.aircraft.json`
and every file keep their answers, and nothing under the code paths, `/drafts`, `/content/dam`, `/content/mobile`,
`/content/experience-fragments`, `/service`, `/deeplink`, `/graphql`, `/api`, `/etc`, the sitemaps, `/.well-known`,
`/migration-status*`, `/_lh-auth` and lh-backends' families; `/<cc>/<ll>[/]` stays the entry redirect's
(`test/url-forms.test.mjs` checks every one). `URL_FORMS = "off"` turns it off. Structural AEM paths
(`/de/en/prepare-for-your-trip/baggage/carry-on-baggage`) answer 301 to the vanity URL through the redirects sheet
(`tools/reports/structural-redirects.tsv`), so a long structural path takes two hops.

## Routes (first match wins, `src/index.js` `ROUTES`)

| Route | Match | Answer |
| --- | --- | --- |
| `events` | GET/HEAD `/_lh/events.json` | the last 500 publish events, newest first (`src/events.js`, see "Publish events"); `cache-control: no-store` |
| `events-webhook` | POST `/_lh/events/webhook` | the site config's webhook: reads the audit log range of its `nextToken` (see "Publish events") |
| `csi-xf` | GET/HEAD `/content/experience-fragments/<folder>.csi-xf.json` | www's fragment catalog of a folder (`src/xf.js`), from the query index `/xf/query-index.json` (documents under `/xf/` with `xf-path`, `xf-kind`, `xf-tags`; `tools/importer/build-xf-docs.mjs`): sub-folders nested, `experienceFragments` with `sdui` links and variants; `no-cache, no-store, must-revalidate`, `Pragma: no-cache`, `Expires: 0`; outside `/content/experience-fragments/lh/` 400 `{}` |
| `aircraft` | GET/HEAD `<any page>.aircraft.json` | `{"aircrafts":[{name, title, url}]}`: the aircraft pages of the page's locale in the fleet overview's order (`src/aircraft.js`), from the query index `/fleet-index.json` (metadata `aircraft-code`, `aircraft-order`; `tools/importer/add-fleet-metadata.mjs`); `application/json`, no cache headers; empty for a locale without fleet pages |
| `changelocale` | POST `<page>.changelocale`, `<page>.changelocale.html` | www's country and language selector (`src/changelocale.js`): JSON `{"geolocation":true,...}` answers `{"country":"<CDN country, lower case, or empty>"}`; a form with `country` and `language` answers 302 to the page's counterpart (`/data/locale-map.json`), else the locale's homepage (www's for markets the replica does not have), the other fields as the query, and sets `dcep.prehpsettings=<cc>/<ll>` (Path=/, 400 days, Secure, not HttpOnly); only `language` valid keeps the market; any other body 400 |
| `market-sitemap` | GET/HEAD `/sitemap/sitemap_lh.xml(.gz)`, `/sitemap/sitemap_lh_<cc>_<ll>.xml(.gz)` of a market root | where the host serves market roots (see "Market roots"): the market root's sitemap and the index with it, generated; elsewhere the `sitemap-gz` route or the pass-through, as before |
| `sitemap-gz` | GET/HEAD `/sitemap/<name>.xml.gz` | the origin's `/sitemap/<name>.xml` gzipped (`src/sitemap.js`): the locale sitemaps of `helix-sitemap.yaml` and the static index `/sitemap/sitemap_lh.xml`; `application/octet-stream` as www, `public, max-age=14400`; the plain `.xml` names pass through |
| `llms` | GET/HEAD `/<cc>/llms.txt`, `/<cc>/<ll>/llms.txt` | a static file at the path wins (the curated `/llms.txt`, `/de/llms.txt`); otherwise generated from the locale indexes (`src/llms.js`, columns `llms-include`, `llms-title`, `llms-description`, `llms-category`, `ai-guidance`, see `AUTHORING.md`): title line, per locale the homepage's `ai-guidance`, one section per category with `- [title](url): description` lines (ordered by category and title), a line to `https://www.lufthansa.com/llms.txt`; `text/plain`, `public, max-age=3600` and an hour in the edge cache; 404 for a market without a replica locale |
| `service-worker` | GET/HEAD `/service-worker.js` | www's file (the code repository's `/service-worker.js`, from the origin) with `application/javascript`, `public, max-age=21600` |
| `well-known` | `/.well-known/assetlinks.json`, `/.well-known/apple-app-site-association` | www's files byte for byte (`src/well-known.js`, generated from `tools/source-export/feeds/well-known/` by `build-well-known.mjs`), `application/json` |
| `message-center` | `/graphql/execute.json/Message-Center/*` (also under `/api/content/graphql/execute.json/`, handed on in the `/graphql/` form) | the messages Worker through the service binding `MESSAGES` |
| `graphql` | GET/HEAD/OPTIONS `/graphql/execute.json/<config>/<query>[;name=value...]` and www's alias `/api/content/graphql/execute.json/...` (same answers; the trip management app asks for its labels there) (other configurations than Message-Center) | www's persisted queries from the structured content under `/data/` (`src/graphql.js`, see "GraphQL feeds"); `application/json`, `cache-control: public, max-age=120` |
| `sdui` | GET/HEAD `/content/mobile/<...>[.v2][.ios][.nocache].sdui` (the markers in any order, each once) | the app screen, rendered from the document and the index (`src/sdui.js`, see `SDUI.md`): `v2` the v2 format (`ios` has no effect there); `ios` without `v2` www's iOS v1 layout (text runs in `paddedColumn`s, screen links `.ios.sdui`, no `LARGE` spacers at the ends of a page); `nocache` the same body with `Cache-Control: max-age=600`; without it no `Cache-Control`, as www; `application/json`; 404 without a document |
| `sdui-web` | GET/HEAD `/content/lh/markets/<cc>/<ll>/<path>[.v2][.ios][.nocache].sdui` | web pages as SDUI: articles and www's content pages, from the page's `.plain.html` (`src/sdui-web.js`, see `SDUI.md`); other pages 404 |
| `sdui-web-short` | GET/HEAD `/<cc>/<ll>/<path>[markers].sdui` | the page's HTML, as www |
| `search` | POST `/service/secured/api/search` | www's site search API from the locale's search index (`src/search.js`, see "Site search"); `application/json`, no `cache-control` |
| `csi-offline` | GET/HEAD `/content/lh/markets/<cc>/<ll>/<page>.csi-offline.json` (the short form `/<cc>/<ll>/<page>.csi-offline.json` answers 404, as www) | www's offline page list (`src/offline.js`): `{"targetPage": "https://<public host>/<cc>/<ll>/<page>", "resources": [...]}`, root-relative and deduplicated: the head's scripts, stylesheets, manifest and icons, `/styles/fonts.css` and `lazy-styles.css`, the header and footer blocks, `/blocks/<name>/<name>.js` and `.css` of each block on the page, its images (img src, first srcset URL); `cache-control: no-cache, no-store, must-revalidate`; unknown page 404 |
| `mfe` | any method: `<page>.mfe.html` (also under `/content/lh/markets`) | www's micro-frontend hand-off (`src/mfe.js`): POST form fields (urlencoded or multipart, at most 64 KB) to a page with the metadata `post-handler: true` answers 200 with the page and the remaining fields as JSON in the `micro-frontend` block's `data-config` (HTML-escaped), `cache-control: private, no-store`; dropped are names that look like a credential or control field (password, token, secret, cookie, authorization, session, redirect, host, script and the like, a leading `_`) or contain `:` or other characters than letters, digits, `-`, `_`, `.`, files, and values longer than 256 characters after HTML escaping; multi-value fields joined with `,`; at most 50 fields. Other pages (and missing ones) 403 `text/plain`; GET/HEAD like the page; other methods 405 |
| `captcha-verify` | any method: `/service/secured/api/captcha/verify` | www's bot check URL: POST with the form field `token` (a Turnstile token, urlencoded or multipart), checked by lh-forms over the service binding `BOT_CHECK` (entrypoint `BotCheck`; the Turnstile secret stays in lh-forms); always `200 application/json` `{"success":true}` or `{"success":false}` (no token, another method, a body over 16 KB, no binding or a failed call: false), `Access-Control-Allow-Origin: *`, `no-store` (`src/captcha.js`) |
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
| `backends` | any method: `/service/secured/api/*` (but the four above, `search` and `captcha-verify`), `/apps/dcep/deeplink/*` (but the kiosk), `/deeplink/*`, `/sso/*`, `/loginservice`, `/seatmap/*`, `/_lh-backends/*` | lh-backends through the service binding `BACKENDS`, unchanged (`src/backends.js`) |
| `market` | any method: `/<cc>/<ll>/<path>` of a market root (locale table `documents: language`: ch/en, ch/de) | GET/HEAD on a host that serves the root: its own document, else its language version's (`src/markets.js`, see "Market roots"); otherwise the pass-through, unchanged |
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
- Videos over 36 MB, the subtitles (`.vtt`) and PDFs over 20 MB, which Edge Delivery can't hold, are objects of the R2 bucket bound as `DAM_MEDIA` (`lh-dam-media`, `wrangler.toml`), key = the Edge Delivery name without the leading slash (`src/dam-media.js`, in `DAM_STEPS` after the AEM step below): `.vtt` as `text/vtt; charset=utf-8`, `.mp4` as `video/mp4` and `.pdf` as `application/pdf` with range requests (206, `content-range`, `accept-ranges: bytes`), 30 days; a missing object goes on to the DA copies (most PDFs: Edge Delivery holds them up to 20 MB). Only `.mp4`, `.vtt` and `.pdf` are looked up there.
- Ahead of R2: the same files published on an AEM as a Cloud Service environment (var `AEM_PUBLISH`, the publish tier's origin; `""`: R2 only), `src/dam-aem.js`, the first of `DAM_STEPS`. GET and HEAD of `.mp4` and `.vtt`, and of a `.pdf` only when R2 has its key; the request goes to `${AEM_PUBLISH}${edsDamPath(asset)}` with only `range`, `if-none-match` and `if-modified-since`, its headers within 5 s (`AEM_HEADER_TIMEOUT_MS`), the body streamed. Used when AEM answers 200 or 206 with the file's media type, 304 or 416, with the R2 step's headers (`content-length`, `content-range`, `etag`, `last-modified` from AEM; `x-lh-edge-route: dam-aem`); anything else (404, 5xx, a timeout, a hibernated sandbox's 200 `text/html` for every path) and R2 answers as before. The sandbox hibernates after 8 hours without requests: `src/aem-keepalive.js`, in the poller's run (lh-messages' minute cron, `EventsRelay.poll`, both accounts) of minute 17 of each hour, sends one GET per URL of `AEM_KEEPALIVE_URLS` (comma list; `""`: none) with `?keepalive=<epoch seconds>` and `cache: 'no-store'`, logged as `aem-keepalive <url> <status> <content-type>`; its errors never reach the relay.
- `DAM_STEPS` (exported by `src/dam.js`) run before the copies: a step `async (request, env, ctx, { asset, rendition, valid, url })` returns a Response or `null`. The lookup of the synced brand assets (`/content/dam/<tenant>/images/frontify/...`) goes there.

The copies are served from `ORIGIN` (aem.live): a copy answers once it is published.

## Site search (`src/search.js`)

`POST /service/secured/api/search` with `{"phrase": "..."}` and `X-Portal: LH`, `X-Portal-Site`, `X-Portal-Language` answers as www: `{"results": [{"link", "headline", "description"}], "total", "pageSize": 10}`, at most 30 results, `content-type: application/json`, no `cache-control`; without the X-Portal headers or the phrase 400 `{"error":"Invalid input","errors":[],"validationErrors":[]}` (www's answers: `tools/source-export/feeds/search/`).

- Data: the locale's search index `/<cc>/<ll>/search-index.json` (helix-query.yaml `search-<cc>-<ll>`), read through the edge cache and kept for a minute per isolate; it fills when pages are published.
- Scoring: `scripts/site-search.js`, the same as the site's `search-results` block (folding, every term must match, BM25F over title, headings, path, description and content, excerpt with the matches in `<strong>`). Pages with the metadata `hide-in-search: true` are left out.
- `link` is the page's path on this site: www sends its AEM paths (`/content/lh/markets/de/en/...`), which this site doesn't serve.
- Markets without a replica of their own (`X-Portal-Site: CH` ...) search the migrated locale of the same language (de/de, de/en).
- `compare-search.mjs --host https://lhedge.bbird.live` (or `--local`, the Worker in Node with the indexes computed from the local documents by `tools/importer/build-search-index.mjs`) compares the answers with www's for the recorded phrases.
- CPU (Workers Free, 10 ms): preparing an index takes about 550 ms and a search 30 to 90 ms, so the answer comes from prebuilt search data when it is the index's state (`src/search-data.js`): per locale the searchable pages with their word counts, the sorted vocabulary, the words' occurrences (`postings.bin`, read as bytes) and the excerpt texts, built with `scripts/site-search.js` by `build-search-data.mjs` in the GitHub Action `.github/workflows/search-data.yaml` (every 10 minutes and by hand; it replaces the branch `search-data` with one commit only when the data changed; served from `search-data--lh-com--moved-permanently.aem.live`). A search reads only its terms' occurrences and its results' texts and adds the counts in the words' order, so the answer is the same byte for byte. It is used only while its stamp (rows, newest and summed `lastModified`) equals the lean model index's and its format and `scripts/site-search.js` hash (`SEARCH_CODE`, checked by `test/search-data.test.mjs`) are this version's; else, and with the var `SEARCH_DATA=off`, the index as before. `compare-search-data.mjs [--reference <site-search.js>]` compares both paths on thousands of phrases with the live indexes.

## lh-backends (`src/backends.js`)

www answers a set of server endpoints that are not pages: REST calls of its own front end, partner and app deeplinks, the Travel ID return and logout, Amadeus' late login, the seat map. Another Worker, lh-backends, answers them for the replica; lh-edge hands them over unchanged through the service binding `BACKENDS` (method, path, query, headers and body, any method) and returns its answer as it is, `Set-Cookie` included and nothing cached here. The `backends` route comes after every route of lh-edge, so the endpoints lh-edge answers itself (search, default airport, booking list, login link, the Good for Train kiosk) stay here; the login return (`/` or a page with `code` and a page path in `state`) is checked before the entry redirects. Without the binding: 503 `{"error":"backends-not-bound"}`. The same binding answers the synced Frontify brand assets first (`/content/dam/<tenant>/(images|videos)/frontify/...`, see "DAM URLs").

## Entry redirects (`src/entry.js`)

Before any page lookup: `/<cc>/<ll>` and `/<cc>/<ll>/` answer 302 to `/<cc>/<ll>/homepage` (query kept) for the replica's locales, else to www's homepage for that market and language (as `scripts/locale.js` does for links). `/<two letters>` that is no country (ISO 3166-1, plus `xx`), such as `/en`, is left to the origin (404, as www). `/<cc>` takes the language from the saved choice (cookie `dcep.prehpsettings`, `<cc>/<ll>`) when its country matches, else the first `Accept-Language` language the market offers (`MARKETS`), else the market's default language (www's `/de` lands on `/de/de/en/homepage`, a 404: not copied). `/` takes the market from the saved choice, else `CF-IPCountry`, else the international market: www's `/xx/en/homepage?showLanguageSelection=true`. On the alias hosts (the China hosts lhcn.bbird.live and lufthansa-cn.turnsthe.page) `/` goes to `/<ALIAS_HOME_ROOT>/homepage` (`cn/en`, as www's China host) once that root is in the locale table (`aliasHome`); until then by country as above. With a pilot `cn/en` row the China hosts serve it (`PILOT_COUNTRIES_BY_HOST` `cn`). Answers carry `cache-control: private, no-store` and `Vary: Cookie, Accept-Language`. aem.live and lhcom.bbird.live don't send `/` through lh-edge: the client-side redirect of `/` in `scripts/scripts.js` stays.

Market roots the host serves (see "Market roots") count as the replica's locales here: on `PILOT_HOSTS` `/ch`, `/ch/en`, `/ch/de` go to `/ch/<ll>/homepage` (`/ch` by the saved choice, else `Accept-Language`, else the country's first row in the locale table, German); on other hosts to www as before.

## Market roots (`src/markets.js`)

Ben's choice B (2026-10-27): one DA document per language page; a market root holds its own documents only where it differs (homepage, own pages, local versions). A root with `documents: language` in the locale table (`tools/markets/locale-data.json`, generated into `scripts/locale-table.js`) is answered from its language version (`LANGUAGE_VERSIONS`: en `de/en`, de `de/de`). For GET/HEAD `/<cc>/<ll>/<path>`:

1. The root's own document: the origin's answer for the path, unless it is 404 (pages, `.plain.html`, JSON, the redirect sheet's rows: a market path with another slug gets a document of its own or a redirect row, not code).
2. Else the language version's document, if the language's query index (`/<version>/search-index.json`) has the page and its `markets` field allows the country (`AUTHORING.md`): include `de, at`, exclude `-ch, -us`, empty every market of the language. What the index leaves out on purpose (nav, footer, fragments, form confirmations, `support/search`, `articles/config`) comes from the language version without that check. In the HTML (HTMLRewriter): links into the language version become the market root's where the market serves the target (the link step's rule, `tools/loc/link-lib.mjs`), the site's own hosts are stripped from links and images, `canonical` and `og:url` name the market URL (the origin's canonical host), `nav`/`footer`/`parent` metadata the market root's, and hreflang alternates are added from the indexes: the page in every language version and served market root, translated slugs paired by `primary-language-url` (at/de and gb/en have their own indexes and are not listed). Nav and footer are the root's own documents (`header.js`/`footer.js` load `/<cc>/<ll>/nav`).
3. A path the language index doesn't have: the language version's redirect (redirect sheet) into the market root, else the origin's 404 for the market path, as www.

JSON under the root (`search-index.json`, `articles/query-index.json` …) without an own file: the language version's sheet, rows whose `markets` excludes the country left out, path values rewritten as links, paged by the request's `offset`/`limit`; `search-index.json` gets the root's own pages from the index `/market-pages.json` (`helix-query.yaml` `market-pages`: every two-letter root but the four with their own indexes). Media and other files pass through. Made from the sheet's bytes (decoding a 4.5 MB index alone takes about 10 ms): rows copied as they are, found with single-byte `indexOf`, a rewritten path patched in place (the language version's prefix and the root's are as long), only rows with a `markets` value parsed; a sheet shaped otherwise, and the var `MARKET_MODEL=full`, is parsed as before. JSON.stringify of a parsed origin sheet gives the origin's bytes, so the answer is the same.

Caching: every origin request goes through `originFetch` (edge cache `EDGE_TTL`, `cache-tag` of the origin answer kept: the language page's tags, so a publish of the language page purges every market copy where push invalidation runs). The indexes are kept a minute per isolate as compact maps (path, markets, robots, primary-language-url, lastModified); concurrent readers share one pending read.

CPU (Workers Free: 10 ms per request): the model comes from lean query indexes, `src/market-lean.js`: `helix-query.yaml` `market-model-<cc>-<ll>` / `market-model-own` (`/market-model/<cc>-<ll>.json`, `/market-model/own.json`: markets, robots, primary-language-url, lastModified) and `market-llms-*` (`/market-llms/…`: title, description, markets, the llms columns, for `llms.txt`), defined by `tools/markets/lean-indexes.mjs` as the full indexes they mirror. They are read as text, never parsed whole on a page's path: a row is found by its `{"path":"…",`, the path set is built at the third lookup, only the rows with markets, robots or primary-language-url are parsed; the sitemaps parse a source whole. A lean source counts only while its total equals its full index's (read past the end: no rows), so one still filling after a definition change is not used; then, and with the var `MARKET_MODEL=full`, the model comes from the full search indexes as before. `node --import ./test/cloudflare-workers-shim.mjs bench-market.mjs [--compare]` measures the CPU of both paths with the real indexes (and compares their answers byte for byte); lean sources it makes from the full indexes until they are filled.

Sitemaps: `/sitemap/sitemap_lh_<cc>_<ll>.xml` (and `.xml.gz`) of a served root: the language pages it serves and its own pages, without `page-robots` noindex, `lastmod` and alternates as `helix-sitemap.yaml`, URLs on `https://<WWW_HOST>`. `/sitemap/sitemap_lh.xml(.gz)`: the origin's static index with the served roots' sitemaps added in order. Robots (`robots.txt`, the noindex metadata) are unchanged. URLs per file: at most 6,400 alternates a file (`SITEMAP_ALTERNATES`: each URL lists the two language versions, at/de, gb/en and every served root, 64 today, so 100 URLs as before), fewer URLs as roots are added, so a file's size and CPU stay at today's; the var `MARKET_SITEMAP=fixed` keeps 100.

The sitemap index built ahead (`src/sitemap-index.js`): the index lists every file of every root, and with the alternates budget each root gets more files as roots are added, so its size grows with the square of the roots (143 KB with 100 roots, 503 KB with 187); made and gzipped per request it would cost 16 to 24 ms of CPU with 187. The GitHub Action `.github/workflows/sitemap-index.yaml` (`build-sitemap-index.mjs`: on pushes that touch the locale table, lh-edge's code or vars or the static index, every 10 minutes and by hand) makes it with lh-edge's code and vars from the origin for each host of `PILOT_HOSTS` and `PILOT_COUNTRIES_BY_HOST`, and keeps it and its gzip (Node's, the same bytes as the runtime's `CompressionStream`) on the branch `sitemap-index` (served from `sitemap-index--lh-com--moved-permanently.aem.live`, replaced with one commit only when the files changed) under a key: sha256 of the static index, `WWW_HOST`, the served roots and each root's number of files. lh-edge works the key out from the model (the counts only, no index text and no gzip) and serves the stored bytes while there is a file of that key (header `x-lh-edge-sitemap-index: stored`); else (a publish or a locale-table change the Action hasn't seen yet, the var `SITEMAP_INDEX=off`) it makes the index as before (`made`), the same bytes. Market sitemap files are unchanged. The sitemaps' edge cache key has the public host and a hash of the locale table, so a batch deploy is seen at once in every data centre (before, an older index could be served for up to an hour). `bench-market.mjs --roots 187` projects the CPU with synthetic pilot rows, `--stored off` measures the made index.

Sections for some markets only: Edge Delivery renders a section's section metadata as attributes of its `<div>` (`data-markets="-de"`); the market route leaves out the sections whose `markets` excludes the root (`dropMarketSections` in `scripts/market-rules.js`, also the site's rule: `scripts/scripts.js` drops them for the root it renders).

The routes ahead of `market` answer a served market root's paths by the same rule (`siteFetch` in `src/markets.js`: the market route's answer for the page, `.plain.html` or sheet; every other path exactly the `originFetch` as before): the app view (`.solo_continue` and its spellings), `.sdui` (short spelling: the page; full content path: rendered from the market page's `.plain.html` and the market root's article and search indexes, content pages by the language version's list), `.csi-offline.json`, `.mfe.html`, `.aircraft.json` (the language version's aircraft under the market root's paths), the OWA header and footer JSON (the root's nav and footer through the market route; tracking rows of the language version where the root has none, their URLs moved to the root) and `llms.txt` (`/<cc>/llms.txt`, `/<cc>/<ll>/llms.txt` from the market route's search index; `ai-guidance` only from the root's own homepage row in `/market-pages.json`, never the language version's). hreflang of market copies also lists the roots with their own documents (at/de, gb/en) where their search index has the same path (read with a scan for the path values: a fifth of a JSON parse's CPU time); the four roots' own pages don't list market roots.

Pilot rows (`status: pilot`) are served only where the public host (see "Public host") is one of `PILOT_HOSTS` (`lhedge.bbird.live`, every pilot root), or one of `PILOT_COUNTRIES_BY_HOST` (`host=cc|cc; host2=cc`: only those countries' pilot roots; `lhcom.bbird.live=ch`, as lhcom's CDN sends only `/ch/...` and the sitemaps to lh-edge, so its sitemap index lists ch and no other pilot root). lhcom.bbird.live sends `X-LH-Public-Host: lhcom.bbird.live`. The site code does not link pilot roots (they are no `LOCALES`). Rollback for a host: remove it from the var and deploy.

Test against the preview origin (documents on preview only):

```sh
wrangler dev --port 8787 --local-upstream lhedge.bbird.live --var ORIGIN:main--lh-com--moved-permanently.aem.page
node tools/markets/check-market-route.mjs --base http://localhost:8787 --root ch/en --root ch/de --links /ch/en/homepage
```

## Login link (`src/login.js`)

`GET /service/secured/api/core/authenticate/loginPageUrl?state=<page>` answers www's JSON `{"loginPageUrl": "<Travel ID authorize URL>"}`, built from public parameters only: client id, redirect URI and scopes from the vars `TRAVELID_AUTHORIZE_URL`, `TRAVELID_CLIENT_ID`, `TRAVELID_REDIRECT_URI`, `TRAVELID_SCOPE` (www's values when unset), country and language from `X-Portal-Site` and `X-Portal-Language`, `state` from the query. Headers as www: `cache-control: private, no-cache, no-store, must-revalidate`, `access-control-allow-origin: *`. Without the X-Portal headers, as www: 500 `text/html;charset=iso-8859-1` with www's error page (the recording in `tools/source-export/feeds/login/loginpageurl.json` without the script www's CDN adds). The header block's login link asks for it (and falls back to the link of the nav document where nothing answers).

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

## Production mode (`src/router.js`)

In production Lufthansa's own Cloudflare zone is the front door and runs lh-edge, Edge Delivery behind it as in Adobe's reference Worker, with push invalidation into that zone. Traffic moves path by path from the current origin to Edge Delivery; which answer a request gets is configuration, not code. Everything is off by default: without the settings below every request is routed exactly as before (the route table, then the Edge Delivery pass-through), and the dispatch adds about 0.01 ms of CPU with all of it on (no parse of anything large: the KV entry is read once per isolate per 30 s).

| Setting | Where | Default | Production |
| --- | --- | --- | --- |
| `DEFAULT_ORIGIN` | var | `""`: Edge Delivery (the pass-through) | the current origin's host, e.g. `origin-www.lufthansa.com` (never the zone's own host: a loop). Then Edge Delivery answers only the configured `paths` |
| `ROUTER` | KV binding, key `router` | not bound | the switches below without a deploy |
| `ROUTER_CONFIG` | var | `""` | the same JSON as the KV entry (a deploy); the KV entry wins |
| `ROUTER_KILL` | var | `""` | `"on"`: every request to the default origin (a deploy; the KV entry's `"kill": true` without one) |
| `ROUTER_HEADER` | var | `""` | e.g. `x-lh-edge-router`: on every answer, the route that answered (`default` for the default origin) |
| `DEMO_HOSTS` | var | `""` | demo hosts, e.g. `lhedge.bbird.live,lhcom.bbird.live,lhcn.bbird.live`: `X-Robots-Tag: noindex` on their answers |
| `PRODUCTION_HOSTS` | var | `""` | e.g. `www.lufthansa.com`: never noindex, even when also a demo host |

The KV entry (JSON):

```json
{"kill": false,
 "routes": {"sdui": "on", "solo": 25, "graphql": "off"},
 "paths": {"/de/en/baggage": "on", "/de/en/book-and-manage/**": 25}}
```

- `routes`: a route by its name (`ROUTES` in `src/index.js`) on (as configured or not listed), off (falls to the default origin, not the next route) or a percentage: that share of visitors, decided once per visitor by the cookie `lhe-<name>` (1 in, 0 out, 30 days).
- `paths` (only with `DEFAULT_ORIGIN`): the paths the pass-through to Edge Delivery claims, exact or a prefix ending `/**` (the longest pattern wins), values as for routes (cookie `lhe-path<pattern>`). Every other path no route claims goes to the default origin.
- `kill`: everything to the default origin at once.

Moving one route (or path) to Edge Delivery, e.g. `/de/en/baggage`, without a deploy:

```sh
# 10 % of visitors first (sticky), then everyone
npx wrangler kv key put --binding ROUTER router '{"paths":{"/de/en/baggage":10}}'
npx wrangler kv key put --binding ROUTER router '{"paths":{"/de/en/baggage":"on"}}'
# check: the route header names pass-through for it, default for the rest
curl -sI https://www.lufthansa.com/de/en/baggage | grep -i x-lh-edge-router
```

Rollback of that path: `"off"` (or remove it) in the entry; everything at once: `{"kill": true}` (or `ROUTER_KILL = "on"` and a deploy). The edge reads a changed entry within a minute (KV cache 60 s, isolate 30 s). Rollback of the code: git revert (lh-edge redeploys).

## Referrer check (`src/referrer.js`)

The state-changing POSTs lh-edge answers itself (`.changelocale`, `.mfe.html` posts, the Good for Train kiosk `/apps/dcep/deeplink/goodfortrain/stele`) can be checked as AEM's Sling referrer filter checks them on www (production's filter: a browser POST to /deeplink/partner with Referer example.com 403, austrian.com and flyedelweiss.com 200). `REFERRER_FILTER` `off` (default, every demo host) | `on`; `REFERRER_ALLOW_HOSTS` exact (`www.example.com`) or wildcard (`*.example.com`: subdomains; not `x.example.com.other.test`); `REFERRER_ALLOW_EMPTY` `true` | `false`. Referer first, then Origin; a relative value, the literal Origin `null` and the request's own public host pass; only browsers (User-Agent with `Mozilla` or `Opera`) are checked; a refusal answers 403 (`x-lh-edge-route: referrer-filter`). An example list is in `wrangler.toml`.

## Smoke check (`smoke.mjs`)

Records per request status, location, content type, content range and a body hash (nonces masked) for today's paths: the four roots, app screens (SDUI, solo), GraphQL feeds and the Message Center, DAM images, a DAM video with `Range: bytes=0-99` and its subtitles, entry redirects, the ch market roots, sitemaps, llms, the well-known files and the server endpoints lh-edge answers (search, login link, default airport, booking list, the kiosk POST). Baselines per host are in `smoke/<host>.json` (lhedge.bbird.live, lhcom.bbird.live and their twins lufthansa-edge.turnsthe.page, lufthansa.turnsthe.page). The replica's own host names (both families) are masked as `HOST` in bodies and locations, so a host and its twin share one baseline: `--derive` writes the twins' files from their hosts' (`TWINS` in `smoke.mjs`), and the first run against a new host shows only real differences.

```sh
node tools/workers/lh-edge/smoke.mjs --host https://lhedge.bbird.live --check    # against smoke/lhedge.bbird.live.json
node tools/workers/lh-edge/smoke.mjs --host https://lhcom.bbird.live --check
node tools/workers/lh-edge/smoke.mjs --host https://lhedge.bbird.live --update   # a new baseline (after an intended change)
node tools/workers/lh-edge/smoke.mjs --host https://lhedge.bbird.live --out before.json
node tools/workers/lh-edge/smoke.mjs --compare before.json after.json
```

`--check` exits 1 on a difference and lists new and missing checks; `--video` and `--subtitle` choose another DAM video. Run it before and after every deploy; a deploy that changes an answer on purpose updates the baseline in the same commit.

## Tests and deployment

`npm test` (Node 24, no install; `fetch` mocked, `test/htmlrewriter-shim.mjs` stands in for the runtime's HTMLRewriter, `test/cloudflare-workers-shim.mjs` (a loader hook) for `cloudflare:workers`): one test per route and the pass-through. `.github/workflows/deploy-lh-edge.yaml` tests and deploys on pushes to main that touch this folder (secret `CLOUDFLARE_API_TOKEN`).

`compare-solo.mjs --host <lh-edge host> [--aliases tools/source-export/feeds/webviews/webview-aliases.csv]` renders every solo URL of www's recording (`tools/source-export/feeds/webviews/www-solo-pages.json`) on the lh-edge host in a headless browser and compares title, headings, the text of `<main>` (as recorded: textContent without scripts and styles; Dice coefficient of word bigrams), links that leave the app view, and whether header, footer, breadcrumb or consent render. `--aliases` requests the alias target directly (before the alias sheet is published). Output: `tools/reports/lh-edge/compare-solo.md` and `.json`.
