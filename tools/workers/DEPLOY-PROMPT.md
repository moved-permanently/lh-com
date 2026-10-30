# Deploy and verify the lh-proxy worker

The worker deploys automatically from GitHub Actions; a local agent only needs to make sure the
pipeline works and verify the result. Paste this into your local agent, run from a clone of
`moved-permanently/lh-com` (branch `main`).

---

Make sure the lh-proxy Cloudflare Worker (`tools/workers/lh-proxy/`) is deployed and working.

1. **How it deploys.** `.github/workflows/deploy-lh-proxy.yaml` runs on every push to `main`
   that changes `tools/workers/lh-proxy/**` or the workflow file, and on manual dispatch. It
   runs `npm test` in `tools/workers/lh-proxy/` (node:test, no dependencies), then
   `npx -y wrangler@4 deploy` in the Cloudflare account (`tools/workers/README.md` "Account"),
   the repository variable `CLOUDFLARE_ACCOUNT_ID_BENPETER`.
2. **Credentials.** The repository secret `CLOUDFLARE_API_TOKEN_BENPETER` must exist (Settings →
   Secrets and variables → Actions) with *Workers Scripts: Edit* on the account. If a run fails at
   "Check Cloudflare credentials", add the secret and re-run the workflow (Actions →
   "Deploy lh-proxy" → Run workflow). No other secrets are needed.
3. **Variables** live in `tools/workers/lh-proxy/wrangler.toml` `[vars]`; change them there
   and push (that triggers a deploy):
   - `UPSTREAM_ORIGIN = "https://www.lufthansa.com"`
   - `ALLOWED_ORIGIN_PATTERN = "^https://[a-z0-9-]+--(lh-com|lh-flynet)--moved-permanently\\.(aem\\.(page|live)|(stage-)?(preview|ue)\\.da\\.(live|page))$"` (aem.page/live and the DA preview, Quick Edit and UE hosts)
   - `EXTRA_ALLOWED_ORIGINS = "https://lufthansa.turnsthe.page,https://lufthansa-edge.turnsthe.page,https://lufthansa-cn.turnsthe.page,https://discover.turnsthe.page,http://localhost:3000"` (comma list)
   - `CACHE_TTL = "300"` (seconds; the Cache API has no effect on `*.workers.dev`)
   - `UPSTREAM_TIMEOUT_MS` (default 8000)
4. **Routes.** The worker is served at `https://lh-proxy.benpeter.workers.dev`. The allowlist
   (see `tools/workers/lh-proxy/README.md`) forwards only these `/service/api/*` routes:
   suggestions/airports, catalogs, defaultAirport, labels, lhg-fare-teaser, destinationfinder,
   plus `/aircore/weather/` and `/aircore/geolocation/`.
5. **Verify** with `W=https://lh-proxy.benpeter.workers.dev` and
   `O=https://main--lh-com--moved-permanently.aem.page`:
   - `curl -i $W/health` should return 200 `{"ok":true,"upstream":"https://www.lufthansa.com"}`.
   - `curl -i $W/nope` should return 404 `{"error":"not-allowed"}`.
   - `curl -i -H "Origin: https://evil.example" $W/health` should return 403 `{"error":"origin-not-allowed"}`.
   - `curl -i -X OPTIONS -H "Origin: $O" -H "Access-Control-Request-Method: POST" $W/service/api/lhg-fare-teaser/fareteaser/offers/FRA`
     should return 204 with `Access-Control-Allow-Origin: $O`.
   - `curl -i -H "Origin: $O" -H "X-LH-Market: at/de" "$W/service/api/defaultAirport"` (should answer Vienna once upstream lets the worker through) and
     `curl -i -H "Origin: $O" "$W/service/api/suggestions/airports?searchTerm=fra"` should return
     200 with JSON if Lufthansa lets the worker through. Today they answer
     **502 `{"error":"upstream-blocked","status":403}`**: Lufthansa's Cloudflare refuses the
     worker. That is expected; the widgets then use the responses recorded in `data/recorded/`.
   - `head -c 70000 /dev/zero | curl -i -X POST --data-binary @- -H "Content-Type: application/json" $W/service/api/lhg-fare-teaser/fareteaser/manual`
     should return 413.
6. **Site wiring.** `scripts/lh-data.js` already has
   `PROXY_ORIGIN = 'https://lh-proxy.benpeter.workers.dev'`. In the browser, on
   `$O/de/en/homepage`, the flight-search and fare-teaser calls go to `$W` (200, or 502 followed
   by a request to `/data/recorded/...`).
7. **Report back:** the latest "Deploy lh-proxy" run (commit, conclusion) and the status of each
   curl in step 5.

Don't change the allowlist, CORS or header handling without updating the tests in
`tools/workers/lh-proxy/test/`.
