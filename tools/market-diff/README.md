# tools/market-diff

Compares every www page of a market root (`/ch/de/...`, TAP: `/en-us/...`) with the same page of its language version
(`/de/de/...`, `/en-pt/...`) and lists what the replica has to import as the root's own content. Our replica answers a market
root's page from the language version's document unless the root has its own document or a section of the version
document carries `markets` for it; where www's root page differs (a local phone number, prices in local currency, a legal
paragraph), the replica shows the version's text until the root's content is imported.

Each tool has its usage in its header. All of them are Node scripts (ES modules).

## Setup

- `npm ci` in the repository root installs `linkedom` and `playwright-core` (root devDependencies); this folder's
  `package.json` names the same two.
- A browser for `md-fetch.mjs`: `npx playwright install chromium` (Playwright's own Chromium), or pass `--chrome <path>`
  (or set `MD_CHROME`) for an installed Chrome or Chromium. On Linux without a display the browser runs headless by itself;
  `--headless` forces it anywhere.
- Run folders go under `tools/market-diff/runs/` (gitignored): fetched page bodies, `fetch.jsonl`, `fetch.log` and the
  browser profile never go into git.

## Airlines

| key | host | warm-up page | profile | replica | language versions |
| --- | --- | --- | --- | --- | --- |
| lh | www.lufthansa.com | /de/en/homepage | aem-html | https://lufthansa.turnsthe.page | de/en, de/de, xx/&lt;ll&gt; (asked by the long path `/content/lh/markets/xx/<ll>/...`) |
| swiss | www.swiss.com | /ch/en/homepage | aem-html | https://swiss.turnsthe.page | ch/&lt;ll&gt; |
| b2b | business.lufthansagroup.com | /de/en/homepage | aem-html | https://b2b.turnsthe.page | de/en, de/de; rest of world xx/en, xx/de |
| ita | www.ita-airways.com | /it/en/homepage | aem-html | https://ita.turnsthe.page | it/en, it/it, fr/fr, es/es, de/de, nl/nl, br/pt, gr/el, jp/ja |
| tap | www.flytap.com | /en-pt | tap-next | https://tap.turnsthe.page | pt-pt, en-pt, es-es, fr-fr, de-de, it-it, pl-pl, pt-br |

Austrian, Brussels and Discover are compared already; Cargo and Air Dolomiti have no market roots.

## Lists (`lists/<key>/`)

Built from the pair lists of 2026-11-07 and what a first fetch run had already read (`md-pending.mjs`):

- `pairs-pending.tsv.gz`: the pairs still to compare (root, version, root_path, version_path, rest, source). It holds every
  pair that run had not read in full, plus the pairs it had read whose comparison was not "same", so that a new run fetches
  their pages again and its report and import cover them. The pairs that run found the same are left out
  (`pending-summary.json`: `done`).
- `urls-pilot.txt`: the first 100 paths of that list in fetch order, for a first look at a host.
- `pairs-summary.json`, `not-served.tsv.gz`: the pair list's counts and the www pages of market roots that our replica
  does not serve at all (for the report).

`md-order.mjs` turns `pairs-pending.tsv.gz` into the fetch list (each version page, then its roots; service pages first,
short codes next, editorial pages last). Every tool that reads a list reads `.gz` files directly.

## Steps for one airline (`A` = key, values from the table)

```
cd tools/market-diff
# pilot: 100 pages, then a status line (answered, blocked, the first block's status and title)
bash bin/md-run.sh runs/A HOST WARM 500 lists/A/urls-pilot.txt
node bin/md-status.mjs --run runs/A --urls lists/A/urls-pilot.txt
# full fetch (same run folder: what the pilot read is skipped)
node bin/md-order.mjs --pairs lists/A/pairs-pending.tsv.gz --out runs/A-urls.txt
bash bin/md-run.sh runs/A HOST WARM 500 runs/A-urls.txt
# compare, check the differing pairs against our replica, report
node bin/md-compare.mjs --pairs lists/A/pairs-pending.tsv.gz --fetch runs/A --out runs/A-compare --host HOST --profile PROFILE
node bin/md-replica-check.mjs --results runs/A-compare --fetch runs/A --replica REPLICA --host HOST --profile PROFILE
node bin/md-report.mjs --airline 'NAME' --runs runs/A-compare --out ../reports/market-diff/A \
  --pairs-summary lists/A/pairs-summary.json --not-served lists/A/not-served.tsv.gz --summary ../reports/market-diff/A/summary.md
# check of the normaliser on pairs of this run (exit 0: every planted change found, no noise flagged)
node bin/md-selftest.mjs --pairs lists/A/pairs-pending.tsv.gz --fetch runs/A --host HOST --profile PROFILE --max 15
```

A pair stays two www paths. `md-replica-check.mjs` asks our replica where the write step puts a page
(`lib/replica-paths.mjs`: the write target in the site's slug map `tools/slugs/<site>.json`, found by `--host`): the
canonical path once a root's flag is on, else the www path. With every flag off every request is as before.
`--slug-map <file>` takes another copy of the map, for example a test copy with flags on.

`md-run.sh` runs one stream per host (a second start on the same host exits 6); streams on different hosts may run side
by side. It asks one page at a time, 500 ms start to start (2 pages a second), inside a browser tab that has opened the
host's warm-up page (same-origin `fetch` of the raw server HTML; no rendering). It stops at the first block: a Cloudflare
challenge page ("Just a moment"), a `cf-mitigated` header, 429 or any 403. Exit codes: 0 done, 2 stopped by a `STOP`
file in the run folder or a limit, 3 blocked, 4 the warm-up page is blocked, 5 the warm-up page failed without a block
(network, timeout), 6 another stream holds the host. A stopped run resumes where it stopped (`fetch.jsonl`).

## Resuming the runs (the comparison after 15:00 CET, 2026-11-09)

The pilot of 2026-11-07 (`../reports/market-diff/pilot.md`) stopped at the warm-up page on four hosts; TAP was fetched in
full (`../reports/market-diff/tap/`). Each runner starts again from a clean checkout with the commands below (`npm ci` in
the repository root first): the same run folder skips what it has read (`fetch.jsonl`), a new one starts at the list's top.
Different hosts may run side by side; two waves stay within a 5 GB memory limit (ITA, TAP and SWISS, then B2B and
lufthansa.com). An exit 4 (the warm-up page blocked) means the host still challenges: stop that runner for the day.

```
cd tools/market-diff && mkdir -p runs
# one runner: pilot, status, full fetch, compare, replica check (slug-aware for lh, swiss, b2b: the write target in
# ../slugs/<site>.json, found by --host; ITA and TAP have no map), report
run() { # key host warm-up profile replica name
  bash bin/md-run.sh runs/$1 $2 $3 500 lists/$1/urls-pilot.txt || return
  node bin/md-status.mjs --run runs/$1 --urls lists/$1/urls-pilot.txt
  node bin/md-order.mjs --pairs lists/$1/pairs-pending.tsv.gz --out runs/$1-urls.txt
  bash bin/md-run.sh runs/$1 $2 $3 500 runs/$1-urls.txt || return
  node bin/md-compare.mjs --pairs lists/$1/pairs-pending.tsv.gz --fetch runs/$1 --out runs/$1-compare --host $2 --profile $4
  node bin/md-replica-check.mjs --results runs/$1-compare --fetch runs/$1 --replica $5 --host $2 --profile $4
  node bin/md-report.mjs --airline "$6" --runs runs/$1-compare --out ../reports/market-diff/$1 \
    --pairs-summary lists/$1/pairs-summary.json --not-served lists/$1/not-served.tsv.gz --summary ../reports/market-diff/$1/summary.md
}
# wave 1
run ita www.ita-airways.com /it/en/homepage aem-html https://ita.turnsthe.page 'ITA Airways' > runs/ita.out 2>&1 &
run tap www.flytap.com /en-pt tap-next https://tap.turnsthe.page 'TAP Air Portugal' > runs/tap.out 2>&1 &
run swiss www.swiss.com /ch/en/homepage aem-html https://swiss.turnsthe.page 'SWISS' > runs/swiss.out 2>&1 &
wait
# wave 2
run b2b business.lufthansagroup.com /de/en/homepage aem-html https://b2b.turnsthe.page 'Lufthansa Group for Business' > runs/b2b.out 2>&1 &
run lh www.lufthansa.com /de/en/homepage aem-html https://lufthansa.turnsthe.page 'Lufthansa' > runs/lh.out 2>&1 &
wait
# progress of a runner at any time; a graceful stop: touch runs/<key>/STOP (remove it before the next start)
node bin/md-status.mjs --run runs/lh --urls runs/lh-urls.txt
```

TAP has no `not-served.tsv.gz` (md-report then leaves that section empty). The lists are 173,479 pending pairs (lh), 36,205
(swiss), 47,364 (b2b), 6,927 (ita) and 5,801 (tap); at 2 pages a second the fetch of lufthansa.com's list takes days, so
its runner resumes in the same run folder after each stop.

## Pages for the importers

`md-export-snapshots.mjs` writes fetched pages as `tools/importer/bd-snapshots/<host>/<path>.html` (gitignored), with
Cloudflare's e-mail protection undone, so the site's importer reads them like captured pages. The HTML is the server's:
widgets the browser renders (flight search, destination finder, feedback) are empty in it.

## What the classes mean

`lib/verdict.mjs`, first match wins: `differs/content` (text or images differ: import or fix), `differs/meta` (title or
description), `differs/widget` (a widget's settings or an app widget on one side only: review, usually import),
`differs/version-missing` (www has the root page but no version page), `differs/links` (a link target differs: import when
a phone, mail or external link differs), `differs/attributes` (alt texts, tooltips, form values: review), `same/*`
(nothing to do), `missing/*` (www redirects or lacks the root page: a separate decision), `unknown/*` (no verdict yet).
The normaliser drops what the replica re-creates or what changes per request: links into the root's own tree and into
other market roots, ids, tracking attributes, market codes in widget settings, date formats, markup around the same text.

`md-report.mjs` groups the roots of each version page by their content: `own document` (one root differs),
`one document with markets` (several roots show the same variant), `version-local` (most roots agree with each other and
differ from the version: the version carries its home market's content).
