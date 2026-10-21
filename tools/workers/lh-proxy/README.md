# lh-proxy

A Cloudflare Worker for the lufthansa.com replica (`moved-permanently/lh-com`). Widgets on
`https://{branch}--lh-com--moved-permanently.aem.page` / `.aem.live` call Lufthansa's
same-origin APIs, which are cross-origin on those hosts. This worker forwards an allowlist of
routes to `UPSTREAM_ORIGIN` and adds CORS. It has no dependencies.

## Behaviour

- `GET /health` returns `200 {"ok":true,"upstream":"..."}`.
- Only allowlisted method and path pairs are forwarded. The query string passes through
  unchanged. Anything else returns `404 {"error":"not-allowed"}`.
- CORS: an `Origin` is allowed if it matches `ALLOWED_ORIGIN_PATTERN` or is listed in
  `EXTRA_ALLOWED_ORIGINS`. The worker echoes the origin and sets `Vary: Origin`. Preflight
  requests get `204`. A disallowed origin gets `403 {"error":"origin-not-allowed"}`. Requests
  with no `Origin` header (curl, for example) are allowed, but still only on allowlisted routes.
- Upstream requests carry only `Accept`, `Accept-Language` and `Content-Type`. `Origin` and
  `Referer` are set to the upstream origin. Cookies and `Authorization` are never forwarded.
  When `Accept-Language` is missing, the worker derives one from the path lang (labels route)
  or the `?lang=` parameter, and falls back to `en-US`.
- `X-LH-Market: {country}/{lang}` (sent by `scripts/lh-data.js`, e.g. `de/de`) sets the upstream
  `Referer` to that market's homepage, because catalogs, fares and defaults carry no market
  parameter; the market is also part of the cache key. Invalid values are ignored.
- POST bodies larger than 64 KB get `413`. If upstream takes longer than `UPSTREAM_TIMEOUT_MS`,
  the worker returns `504 {"error":"upstream-timeout"}`. A network error returns `502 upstream-error`.
- Cloudflare challenges and blocks (403 or 503 with `text/html`, or `cf-mitigated: challenge`)
  become `502 {"error":"upstream-blocked","status":N}`, so the client falls back to recorded data.
- Every other upstream status passes through with its body. The worker removes `Set-Cookie` and
  any upstream `Access-Control-*` headers. Redirects are not followed; the 3xx is passed through.
- Every response carries `x-lh-proxy: 1`. Forwarded responses also carry
  `x-lh-proxy-upstream-status`, and `x-lh-proxy-cache: HIT|MISS` when caching is on.
- GET responses with status 200 are cached in `caches.default` for `CACHE_TTL` seconds. The cache
  key is the full upstream URL, and CORS headers are added after the lookup. On `*.workers.dev`
  the Cache API does nothing, so caching needs a custom domain.

## Allowlist

| Method | Path |
| --- | --- |
| GET | `/service/api/suggestions/airports` |
| GET | `/service/api/catalogs/(airlines\|airportnames\|calendar\|localeData\|conditions\|regions\|affinities\|countryselector)(/...)?` |
| GET | `/service/api/defaultAirport` |
| GET | `/service/api/labels/{component}/lh/{lang}` (component `[A-Za-z0-9_-]+`, lang `[a-z]{2}`) |
| POST | `/service/api/lhg-fare-teaser/fareteaser/offers/{origin}` (origin `[A-Z]{3}`) |
| POST | `/service/api/lhg-fare-teaser/fareteaser/manual` |
| GET | `/service/api/lhg-fare-teaser/fareteaser/recommend` |
| GET | `/service/api/destinationfinder/campaign/{origin}` |
| GET | `/service/api/destinationfinder/destination/finder/{origin}/{region}` |
| GET | `/aircore/weather/...` |
| GET | `/aircore/geolocation/...` |

The source of truth is the `ALLOWLIST` table at the top of `src/index.js`. Paths that contain
encoded slashes or backslashes (`%2f`, `%5c`, `\`) are always rejected.

## Variables (`wrangler.toml` `[vars]`)

| Name | Default |
| --- | --- |
| `UPSTREAM_ORIGIN` | `https://www.lufthansa.com` |
| `ALLOWED_ORIGIN_PATTERN` | `^https://[a-z0-9-]+--(lh-com\|lh-flynet)--moved-permanently\.(aem\.(page\|live)\|(stage-)?(preview\|ue)\.da\.(live\|page))$` (aem.page/live plus DA preview, Quick Edit and UE hosts) |
| `EXTRA_ALLOWED_ORIGINS` | `http://localhost:3000` (comma-separated) |
| `CACHE_TTL` | `300` (seconds; `0` disables caching) |
| `UPSTREAM_TIMEOUT_MS` | `8000` |

## Tests

From the repo root (Node 24, no install needed):

```sh
node --test tools/workers/lh-proxy/test/
npx eslint tools/workers
```

The tests stub `globalThis.fetch` and `globalThis.caches`, so they make no network requests.

## Deployment

The worker deploys itself: every push to `main` that changes `tools/workers/lh-proxy/**` (or
`.github/workflows/deploy-lh-proxy.yaml`) runs the "Deploy lh-proxy" workflow, which runs
`npm test` in this folder and then `npx wrangler@4 deploy` to the Blackbird Cloudflare account
(repository secret `CLOUDFLARE_API_TOKEN`). It can also be started by hand (workflow_dispatch).

- URL: https://lh-proxy.aem-poc-lab.workers.dev (`/health` answers `{"ok":true,...}`)
- The site's live-data client uses it by default: `PROXY_ORIGIN` in `scripts/lh-data.js`.
- After a worker change, check the run under Actions → "Deploy lh-proxy", then
  `curl https://lh-proxy.aem-poc-lab.workers.dev/health`.
- Lufthansa's Cloudflare currently refuses the worker's upstream calls, so data routes answer
  `502 {"error":"upstream-blocked"}` and the widgets use the responses recorded in
  `data/recorded/`. That is expected; nothing to fix in the worker.
