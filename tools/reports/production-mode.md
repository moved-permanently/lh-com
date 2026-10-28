# Production mode: the checklist

What changes when the site and lh-edge answer on a production host (www.lufthansa.com, behind Lufthansa's own Cloudflare zone running lh-edge), and how to check each part. Nothing here is on yet: every demo host behaves as before, and lh-edge's production settings are all off.

## 1. The site code: demo host or not (`scripts/demo.js`)

`isDemoHost()` is true on `localhost`/`127.0.0.1`, `*.bbird.live` (lhcom, lhedge, lhcn), `*.aem.page`, `*.aem.live`, `*.hlx.page`, `*.hlx.live` and `*.workers.dev`. Any other host is a production host. Tests: `test/demo-hosts.test.mjs`.

### Switched by host (off on a production host)

| Part | Where | On a demo host | On a production host | How to check (production host) |
| --- | --- | --- | --- | --- |
| Showcase notice ("not an official Lufthansa website") | `scripts/scripts.js` `loadDelayed` | shown after LCP | not shown | no `dialog.showcase-notice` in the DOM after 10 s |
| FlyNet sample flight ("Sample data") | `blocks/header/header.js` | the flight bar on FlyNet pages | no flight bar (FlyNet's own data comes later) | a page with metadata `channel: flynet` (every page of the lh-flynet site): no `.nav-flight` |
| Recorded answers shown when www can't be called | `scripts/lh-data.js` `lhFetch`, `lhRecorded` | the recordings under `/data/recorded/` as fallbacks | none: a failing call fails (the block shows its empty or error state) | network panel: no request to `/data/recorded/` |
| The cross-origin proxy and calls to www | `scripts/lh-data.js` | direct calls to www or `lh-proxy.aem-poc-lab.workers.dev` | every route same-origin with the market's `X-Portal-*` headers, cookies `same-origin` | network panel: `/service/...` requests on the page's host only, none to `workers.dev` or www |
| Points of interest from the recordings only | `scripts/lh-data.js` | recorded | the live route, same-origin | `poi-map` page: `/service/secured/api/pointsOfInterest/...` same-origin |
| Tester overrides in localStorage (`lh-proxy`, `lh-live-origin`, `lh-forms`, `lh-forms-sitekey`) | `scripts/lh-data.js`, `scripts/lh-forms.js` | honoured | ignored | set them in the console, reload: no change |
| The demo forms worker (`lhforms.bbird.live`) | `scripts/lh-forms.js`, `blocks/form/form.js` | config and submissions there | the endpoint of `<meta name="forms-endpoint">`; without one no config read, the bot check off, a submission is not sent (the form's error message) | feedback form: no request to `bbird.live`; with the meta, `<endpoint>/config` and `/submit` |
| Client-side root redirect (`/` to the market's homepage) | `scripts/scripts.js` | the page redirects | not run: lh-edge's `entry` route answers `/` with a 302 | `curl -sI https://<host>/` 302 from lh-edge, no `/index` page load |
| The OneTrust look-alike consent banner | `scripts/consent.js` `showFallback` | shown when OneTrust doesn't run (its `.lufthansa.com` cookies don't work on demo hosts) | not shown: OneTrust's own banner | first visit: OneTrust's banner, no `lh-consent-fallback` class on `<html>` |
| The channels demo block | `blocks/channels-demo/channels-demo.js` | the phone frames | empty | a page with the block renders nothing there |

### Listed, not switched (with the reason)

| Part | Where | Why it stays | What production needs |
| --- | --- | --- | --- |
| "Preview form, nothing is sent" for forms other than the core ones | form block | no backend exists for them; a switch would only hide the message | a form backend per form, then the form id in lh-forms |
| Hand-offs to `LIVE_ORIGIN` (`https://www.lufthansa.com`, `scripts/locale.js`): booking lookup, the flight search's hotel and car tabs, car rental, flight status, e-journals, the header's "other countries", the footer's consent link, the not-found page's search and help links | those blocks | on www they become same-host links to the current apps, which is right while those apps stay on the current origin | route them in lh-edge to the default origin (`DEFAULT_ORIGIN`, their paths not in `paths`) until the apps migrate |
| Built-in label copies | blocks with `pickLabels` defaults | fallbacks when the label service doesn't answer; the same text as www's | none |
| Time travel (`?time-travel=`, `?stage-time=`) | `scripts/clock.js` | already limited to `*.aem.page` and localhost | none |
| The `/content` prefix on localhost | `scripts/scripts.js`, `scripts/locale.js` | local development only (the path never starts with `/content` elsewhere) | none |
| The `SITE_HOST` patterns (aem.page/live, bbird.live) | link rewriting | they only match demo hosts; harmless on www | none |
| Channels (app, FlyNet) | `scripts/channel.js` | chosen by page metadata and `?channel=`, not by host | none |
| The not-found page's capture | `scripts/not-found.js` | same-origin, the page's own content | none |

## 2. lh-edge on a production host (`tools/workers/lh-edge`)

All settings are vars in `wrangler.toml` or the `ROUTER` KV entry; see the README's "Production mode" and "Referrer check".

| Setting | Demo (today) | Production | Check |
| --- | --- | --- | --- |
| `DEFAULT_ORIGIN` | `""` (Edge Delivery answers everything) | the current origin's host | a path not in `paths`: `x-lh-edge-router: default` and the current origin's page |
| `ROUTER` KV / `ROUTER_CONFIG` | none | `{"paths": {...}, "routes": {...}}` | `npx wrangler kv key get --binding ROUTER router` |
| `ROUTER_KILL` | `""` | `""` (`"on"` or `{"kill": true}` for the kill switch) | every answer `x-lh-edge-router: default` |
| `ROUTER_HEADER` | `""` | e.g. `x-lh-edge-router` | `curl -sI` shows it on every answer |
| `DEMO_HOSTS` / `PRODUCTION_HOSTS` | `""` | demo: the bbird.live hosts; production: `www.lufthansa.com` | demo answers carry `X-Robots-Tag: noindex`, www's don't |
| `REFERRER_FILTER`, `REFERRER_ALLOW_HOSTS`, `REFERRER_ALLOW_EMPTY` | `off`, `""`, `false` | `on`, the group's hosts (example list in `wrangler.toml`), as www's Sling filter | a browser POST to `.changelocale` with `Referer: https://example.com/` 403, with the own host 200 |
| `PILOT_HOSTS`, `PILOT_COUNTRIES_BY_HOST` | lhedge all pilot roots; lhcom `ch` | the roots that are live | the market root's pages and the sitemap index |
| `EDGE_TTL` | `60` | `""` (the reference behaviour with push invalidation) | `cache-control` of a page: the origin's `max-age` |
| `PUSH_INVALIDATION` | (on) | on, into Lufthansa's zone | a publish purges the page within seconds |
| `PUBLIC_HOST` / `X-LH-Public-Host` | lhcom's CDN sends it | `www.lufthansa.com` (or the zone sends it) | absolute URLs in sitemaps and `csi-offline` name www |

## 3. Before and after every change

1. `node tools/workers/lh-edge/smoke.mjs --host https://<host> --check` before the deploy (0 differ against `tools/workers/lh-edge/smoke/<host>.json`).
2. Deploy (merge to `main`; the lh-edge workflow deploys when `tools/workers/lh-edge/**` changes, not for `smoke/**`).
3. The same smoke check after it; an expected change: `--update` and commit the baseline with the change.
4. Site code: `node tools/markets/compare-roots.mjs` between main's preview and the branch's (the four roots unchanged).
5. Rollback: git revert of the push (lh-edge redeploys); a route or path: its KV entry (no deploy).
