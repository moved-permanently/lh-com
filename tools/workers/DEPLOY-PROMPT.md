# Deploy the lh-proxy worker

Paste this into your local agent, run from a clone of `moved-permanently/lh-com` (branch
`main`) on a machine that is logged in to the Cloudflare account that should host the worker
(`npx wrangler whoami`).

---

Deploy the Cloudflare Worker in `tools/workers/lh-proxy/` and connect the site to it.

1. **Check the code.** Run `node --test tools/workers/lh-proxy/test/` from the repo root. All
   tests must pass. The worker has no dependencies and no build step.
2. **Pick the host.**
   - **Recommended: a custom domain** such as `lh-proxy.<your-zone>`. Uncomment the `routes`
     block in `tools/workers/lh-proxy/wrangler.toml` and set
     `{ pattern = "lh-proxy.<your-zone>", custom_domain = true }`. Caching only works on a
     custom domain; on `*.workers.dev` the Cache API does nothing.
   - **Otherwise `workers.dev`:** leave `routes` commented and use the
     `https://lh-proxy.<subdomain>.workers.dev` URL that wrangler prints.

   Add `account_id` to `wrangler.toml` if the login has more than one account.
3. **Review the variables** in `[vars]` and keep the defaults unless you have a reason:
   - `UPSTREAM_ORIGIN = "https://www.lufthansa.com"`
   - `ALLOWED_ORIGIN_PATTERN = "^https://[a-z0-9-]+--lh-com--moved-permanently\\.aem\\.(page|live)$"`
     covers every branch on aem.page and aem.live.
   - `EXTRA_ALLOWED_ORIGINS = "http://localhost:3000"` is a comma list, for local development.
   - `CACHE_TTL = "300"` is in seconds; `0` turns caching off.
   - `UPSTREAM_TIMEOUT_MS` defaults to 8000.

   No secrets are needed.
4. **Deploy:** `cd tools/workers/lh-proxy && npx -y wrangler@latest deploy`. Note the worker URL
   as `W`.
5. **Verify** with `O=https://main--lh-com--moved-permanently.aem.page`:
   - `curl -i $W/health` should return 200 `{"ok":true,"upstream":"https://www.lufthansa.com"}`.
   - `curl -i $W/nope` should return 404 `{"error":"not-allowed"}`.
   - `curl -i -H "Origin: https://evil.example" $W/health` should return 403 `{"error":"origin-not-allowed"}`.
   - `curl -i -X OPTIONS -H "Origin: $O" -H "Access-Control-Request-Method: POST" $W/service/api/lhg-fare-teaser/fareteaser/offers/FRA`
     should return 204 with `Access-Control-Allow-Origin: $O`.
   - `curl -i -H "Origin: $O" "$W/service/api/suggestions/airports?searchTerm=fra"` should return
     200 with JSON and `x-lh-proxy-upstream-status: 200`. A repeat should show
     `x-lh-proxy-cache: HIT` (custom domain only).
   - `curl -i -H "Origin: $O" "$W/service/api/defaultAirport"`
   - `head -c 70000 /dev/zero | curl -i -X POST --data-binary @- -H "Content-Type: application/json" $W/service/api/lhg-fare-teaser/fareteaser/manual`
     should return 413.

   If the data calls return **502 `{"error":"upstream-blocked"}`**, Lufthansa's Cloudflare is
   blocking the worker. That is expected and harmless: the widgets fall back to the responses
   recorded in `data/recorded/`. Still connect the worker (step 6), so the site goes live
   automatically if Lufthansa allowlists it later. Report the result either way.
6. **Connect the site.** In `scripts/lh-data.js`, set `export const PROXY_ORIGIN = '<W>';` (no
   trailing slash). Run `npx eslint scripts/lh-data.js`, commit
   ("chore: point widgets at the deployed lh-proxy worker") and push to `main`. Code goes live
   on aem.page with the push; no content needs re-previewing.
7. **Verify in the browser.** Open `https://main--lh-com--moved-permanently.aem.page/de/en/homepage`.
   In DevTools → Network, the flight-search and fare-teaser calls go to `W` and return 200, or
   502 followed by a request to `/data/recorded/...` if upstream is blocked. Typing an airport in
   the flight search shows suggestions in both cases. Do the same on `/gb/en/homepage` (prices
   in GBP).
8. **Report back:** the worker URL, the status of each curl in step 5, and the commit hash of
   step 6.

Don't change the allowlist, CORS or header handling without updating the tests in
`tools/workers/lh-proxy/test/`.
