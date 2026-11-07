# Market-diff pilot, 2026-11-07 (ema-cashub)

`bin/md-run.sh runs/<key> <host> <warm-up> 500 lists/<key>/urls-pilot.txt` per host, then `bin/md-status.mjs`. Browser:
Playwright's Chromium 1208 already installed in this environment (`/ms-playwright`, matching playwright-core 1.58.2),
headless (no display); nothing installed. ITA, TAP and SWISS started side by side at 18:55 UTC, Group for Business and
lufthansa.com at 18:57 (two waves, to stay within this session's 5 GB memory limit).

| Host | Pages of the pilot | Answered | Challenged / blocked | Errors | md-run exit | First challenge: HTTP, cf-mitigated, title |
| --- | ---: | ---: | --- | ---: | ---: | --- |
| www.ita-airways.com | 100 | 0 | the warm-up page /it/en/homepage | 0 | 4 | 403, challenge, "Just a moment..." (18:55:36Z) |
| www.flytap.com | 100 | 100 (+1 redirect) | none | 0 | 0 | - (101 requests in 2.9 min) |
| www.swiss.com | 100 | 0 | the warm-up page /ch/en/homepage | 0 | 4 | 403, challenge, "Just a moment..." (18:55:35Z) |
| business.lufthansagroup.com | 100 | 0 | the warm-up page /de/en/homepage | 0 | 4 | 403, challenge, "Just a moment..." (18:57:32Z) |
| www.lufthansa.com | 100 | 0 | the warm-up page /de/en/homepage | 0 | 4 | 403, challenge, "Just a moment..." (18:57:32Z) |

- Four hosts challenge the first request of this environment's browser (the warm-up page, before any page of the list):
  not a rate limit. They are not started again today.
- www.flytap.com passed: its full fetch, compare, replica check, report and import follow.
- Run folders (fetched pages, `fetch.jsonl`, logs, browser profiles) stay in `tools/market-diff/runs/` (gitignored).
