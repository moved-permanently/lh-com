# lh-messages

A Cloudflare Worker that serves the lh-com Message Center as public JSON in the shapes of www.lufthansa.com's persisted queries (`/graphql/execute.json/Message-Center/*`), which the apps and other clients read. The website itself reads the query index directly (`scripts/message-center.js`).

URL: https://lh-messages.aem-poc-lab.workers.dev (`workers_dev = true`, no routes).

## Source

`SOURCE_ORIGIN` (`[vars]`, default `https://main--lh-com--moved-permanently.aem.live`: published messages only):

- `/message-center/index.json`: one row per message and language (`path` = `/message-center/<type>/<id>/<lang>`, headline, criticality, tenants, markets, touchpoints, link, details, from, to, push, internal-title, lastModified);
- the details pages (`details` field, `.plain.html`), for `outage-b2b`;
- `/message-center/config/cti-pages.json` (`tenant`, `webPath`, `contentPath`).

Each is cached in the isolate for at most 30 s (and asked from the CDN with a 30 s TTL).

## Routes

| Path (`/graphql/execute.json/Message-Center/…`) | Answer |
| --- | --- |
| `lhgIrregMessageList` | `{"data":{"lhgMessageList":{"items":[…]}}}`, type `irreg` |
| `lhgTechOutageMessageList` | the same, type `tech-outage` |
| `lhgMessageListWithCalendar` | the same, all types |
| `outage-b2b` | tech-outage messages tagged `tenant/b2b`: items `{language, title, description: {plaintext}}` (title = headline, plaintext = the details page as text) |
| `CTI_Pages_for_APP`, `CTI%20Pages%20for%20tenants` | `{"data":{"linkConfigForMessageCenterList":{"items":[{"_path","_variation","_metadata","<tenant>PageReference":{"_path"}}]}}}` from the sheet's `contentPath` |

Persisted query parameters after `;` are ignored. Other paths: 404.

Message items, keys in www's order: `_path` (`/content/dam/lufthansa-group/message-center/<type>/<id>`), `_tags` (`lufthansa-group:tenant/<x>`, `lufthansa-group:markets/<cc>` (none when the message is for all markets), `lufthansa-group:touchpoint/<x>`), `language` (from the path), `headline`, `criticality`, `link` (`null` when empty), `activatedAt` (when the worker first saw the message active, from KV; before the first cron run its last modification), `_metadata` (`stringMetadata` title = internal-title and description `""`; `calendarMetadata` `jcr:created` = activatedAt, as the index has no creation time, and `cq:lastModified` = lastModified). One item per message and language; ordered by path, the English variation first (as www). The lists contain only the messages of the index (published) inside their `from`/`to` window (from inclusive, to exclusive, UTC). CTI page references are ordered as on www (ita, four_y, sn, lx, os, lh), other tenants after them.

Headers: `content-type: application/json`, `cache-control: public, max-age=120` (as www), `last-modified` (the newest message). CORS (`Access-Control-Allow-Origin`) only for the lh-com hosts: `ALLOWED_ORIGIN_PATTERN` (`{branch}--lh-com--moved-permanently.aem.page|live`) and `EXTRA_ALLOWED_ORIGINS` (`https://lhcom.bbird.live`, `http://localhost:3000`); other origins get the JSON without CORS headers (clients that are not browsers are not affected).

## Cron and KV

Every minute (`[triggers] crons`) the worker compares the active messages of the index with the last state in KV (`STATE`, namespace `lh-messages-state`, key `state`: `activatedAt` per message and language, and the active messages with their fields). It writes KV only when something changed (Workers Free: a small daily write quota).

The same cron also polls lh-edge's publish event relay (package 6): service binding `EVENTS_RELAY` to lh-edge's RPC entrypoint `EventsRelay`, `poll()` (lh-edge README, "Publish events"), because the account's five cron triggers are all in use. The poll runs next to the message cron in its own `waitUntil`; an error in one does not stop the other, and without the binding nothing is called.

## Push

For messages with `push` set, when they become active and when they disappear (withdrawn or past `to`), the worker sends `pushPayload(message, action)` (the message fields plus `action` `PUBLISH` / `UNPUBLISH`; one small function, the real format comes later) as a JSON POST to the secret `PUSH_TARGET`. While `PUSH_TARGET` is unset it only logs what it would send.

## Tests and deployment

`npm test` in this folder (Node 24, no install): shapes and key order against the www fixture (`test/fixtures/www-message-center-2026-10-25.json`), tags, `_path`, ordering, the window, CTI pages, outage-b2b, routes and CORS, the 30 s source cache, the cron diff and KV writes, the push stub. `fetch` and KV are mocked.

`.github/workflows/deploy-lh-messages.yaml` runs the tests and `wrangler deploy` on every push to main that touches this folder, with the repository secret `CLOUDFLARE_API_TOKEN` (same account as lh-proxy).

`node tools/workers/lh-messages/compare-www.mjs` compares the deployed worker with the recorded www answers: the JSON shape of every route, and, for messages both have (same id and language), every field.
