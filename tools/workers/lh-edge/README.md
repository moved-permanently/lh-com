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
| secret `ORIGIN_AUTHENTICATION` | `Authorization: token …` towards the origin, when the site needs one |

## Routes (first match wins, `src/index.js` `ROUTES`)

| Route | Match | Answer |
| --- | --- | --- |
| `well-known` | `/.well-known/assetlinks.json`, `/.well-known/apple-app-site-association` | www's files byte for byte (`src/well-known.js`, generated from `tools/source-export/feeds/well-known/` by `build-well-known.mjs`), `application/json` |
| `message-center` | `/graphql/execute.json/Message-Center/*` | the messages Worker through the service binding `MESSAGES` |
| `solo` | GET/HEAD `<path>.solo_continue`, `.solo.continue`, `.solo.continue.solo_continue`, `.solo_continue.html`, `.solo_continue.genapp.html` | the page in the app view, see below |
| `pass-through` | everything else | the Edge Delivery origin |

Packages 2 to 6 add their routes before `pass-through`.

## Pass-through (Adobe's reference Worker)

`src/edge.js` follows https://github.com/adobe/aem-cloudflare-prod-worker (`src/index.mjs`):

- other ports: 301 to 443; `/drafts/`: 404; `/.rum/`, `/.optel/`: only GET, POST, OPTIONS;
- query parameters: media (`/media_<hash>…`) keep `format`, `height`, `optimize`, `width`; `.json` keeps `limit`, `offset`, `sheet`; everything else loses its query (the browser still has it: `?channel=app`, `?stage-time=` are read by the page scripts); parameters sorted;
- origin request: host `ORIGIN`, `X-Forwarded-Host`, `X-BYO-CDN-Type: cloudflare`, `X-Push-Invalidation: enabled`, `cf.cacheEverything`;
- answer: a 301 gets the original query appended to a `location` without one; a 304 loses `Content-Security-Policy`; `age` and `x-robots-tag` are removed.

Deviations: `X-Forwarded-Host` is the var `PUBLIC_HOST` (fallback: the request's host, as the reference) because one Worker answers on several hosts (workers.dev, the demo host) for one public site; the origin var is `ORIGIN` (reference: `ORIGIN_HOSTNAME`); the sheets the Worker reads itself (the alias sheet) are fetched past Cloudflare's cache (`cache: 'no-store'`, origin sends `max-age=7200`) and kept 60 s in the isolate. With `cacheEverything`, the edge keeps pages until push invalidation purges them: set up push invalidation for the zone the demo host is on (https://www.aem.live/docs/setup-byo-cdn-push-invalidation#cloudflare), else published changes show only after the origin's `max-age`.

## The app's web view (`src/solo.js`)

1. The suffix is stripped (all five forms; a trailing slash too): the app path.
2. The alias sheet (`ALIAS_SHEET`, columns `locale`, `app-path`, `page`, `note`) maps the app path exactly to the replica page (`/de/de/book-and-manage/timetable-and-flight-status/flight-disruptions` → `/de/de/flugunregelmaessigkeiten`); a path without a row is looked up as it is.
3. The page is fetched from the origin and answered in place (status 200, no redirect). A missing page answers the origin's 404 (as www); a redirect of the site goes to the solo form of its target.
4. HTMLRewriter: `<meta name="channel" content="app">` and `<meta name="app-close-url" content="https://<WWW_HOST>.solo_continue/">` first in `<head>` (`scripts/channel.js` reads the metadata: no header, footer, breadcrumb or consent, as with `?channel=app`); links: page links on this host and on `WWW_HOST` get the `.solo_continue` form (query and fragment kept), homepage links (`/`, `/{cc}/{ll}`, `/{cc}/{ll}/homepage`) the close URL, links containing `/logout`, files, other hosts and anchors stay; relative media and links (`./media_…`) are made root-relative against the page's own path (the solo URL of an alias sits in another folder).
5. In the browser, `scripts/channel.js` applies the same link rules on click to links the page scripts render later.

## Tests and deployment

`npm test` (Node 24, no install; `fetch` mocked, `test/htmlrewriter-shim.mjs` stands in for the runtime's HTMLRewriter): one test per route and the pass-through. `.github/workflows/deploy-lh-edge.yaml` tests and deploys on pushes to main that touch this folder (secret `CLOUDFLARE_API_TOKEN`).

`compare-solo.mjs` compares the solo pages with www's recorded ones (`tools/source-export/feeds/webviews/www-solo-pages.json`).
