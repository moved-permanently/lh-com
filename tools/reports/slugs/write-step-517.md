# One slug in every language: the write step (the brief after 516, ema-cashub)

Ben's rule: a page has the slug it has in English in every language of an airline; www's translated URLs answer a 301 to it.
The maps (`tools/slugs/<site>.json`, README there) are read, never written; every flag stays off. Nothing visible changes
while the flags are off: each change below is inert until a move round switches an entry on.

## What the write step does now

| Step | Where | With every flag off |
| --- | --- | --- |
| A page is written at `writeTarget(path)`: the canonical path for an active alias, else its path | `tools/importer/da-upload.mjs` with `tools/importer/slug-write.mjs` | every page at its www path, byte for byte as before |
| Internal links (relative `href`, and the path as link text: the Parent row) go to the canonical path for active aliases | `tools/importer/own-links.mjs` `withCanonicalLinks`, called by da-upload | links as they were |
| Guard: a write to a localized slug of an active entry is refused, with the canonical path | da-upload, beside `appShell`, `allowed` and `AUTHOR_EDITS` | nothing refused |
| The login and profile shells stay refused under their canonical path (`/de/de/anmeldung` is `/de/de/login`) | da-upload | as before |
| Two local documents for one page (its www slug and its canonical path) are refused | da-upload | none today (lh-com 191 localized documents, SWISS 2, Austrian 11: 0 twins) |
| An author's hold follows the page (`holdAt`: at the target, its www path, or any www path of the target) | slug-write.mjs | holds where they were |
| The state is keyed by the target, with the links that moved (a flag switched on later sends again the pages that link to a moved page) | da-upload | old entries unchanged: nothing is sent again |
| Unmapped pages: a page of a mapped root that the map does not know | `tools/reports/slugs/unmapped-<site>.json` (merged per path; `$SLUG_REPORT` for another file) | listed, nothing moves |

**Snapshots, archives and the local document trees stay keyed by the www path.** An unmapped page moves to its English slug
only where its document names its English page (`primary-language-url`, written by `head-metadata.mjs` on lh-com's de/de
and at/de pages) and its root's flag is on. Otherwise it keeps its path.

**TAP, Air Dolomiti and ITA have no map.** Their every allowlist path is written at itself, their app-shell decisions and
their documents' links are unchanged (test/slug-write.test.mjs; test/da-upload-slugs.test.mjs: a TAP document's bytes at
its path).

**New options of da-upload:**
- `--sink <dir>`: offline. Each body is written to `<dir>/<path>.html` with the state in `<dir>/da-upload-state.json`; no
  request to DA, admin.hlx.page or any host, no preview.
- `--slug-map <file>`: a copy of the map, for example a test copy with flags on.
- `--keep-paths`: no mapping, so the guard is the check.

**Test mode:** under the test runner (`NODE_TEST_CONTEXT`) or with `DA_UPLOAD_TEST`, da-upload refuses to run without
`--dry-run` or `--sink`, before anything is read or sent.

## Offline proof (item 5)

Every run is `da-upload --sink` with a test copy of the site's map with **every root flag on**, run twice (the second must
write nothing new), plus once with the map as it is (flags off). The check (`verify.mjs`): every written path is canonical,
and every relative internal link is canonical. No request to any host.

| Airline | Documents (where from) | Pages | Written at the canonical path | Relative links / moved | Not canonical | Second run | Flags off |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Lufthansa | content/ (the importer's output, 6,370 documents) | 300 | 150 | 2,507 / 847 | 0 | 0 written | 300 at their www path, bodies unchanged |
| Lufthansa (first run) | content/ | 80 | 40 | 978 / 244 | 0 | 0 written | 80 unchanged |
| SWISS | content-sites/lh-swiss (4,044) | 40 | 2 | 312 / 1 | 0 | 0 written | 40 unchanged |
| Austrian | built offline from brief 497's recordings: mappedOf and the templates' bundles, 82 documents | 60 | 11 | 84 / 10 | 0 | 0 written | 60 unchanged |
| Brussels | built offline from brief 497's recordings, 81 documents | 30 | 0 | 5 / 0 | 0 | 0 written | 30 unchanged |
| Cargo | content-sites/lh-cargo (925) | 25 | 0 | 4 / 0 | 0 | 0 written | 25 unchanged |
| Group for Business | content-sites/lh-b2b (22 allowed: all of them) | 22 | 0 | 58 / 0 | 0 | 0 written | 22 unchanged |
| Discover | no document, snapshot or archive on disk | allowlist 563 paths | 0 | - | 0 | - | - |

- Brussels, Discover, Cargo and Group for Business list no group, so nothing moved and the guard never fired.
- **Unmapped pages:** SWISS 6 (none verified), Austrian 2 (none verified), the others 0. With every flag on they kept their
  paths (no verified English page).
- The Austrian and Brussels builds used the bundles of `tools/importer` offline (`--html-dir` and `botProtected`, no live
  fallback in any run). The bulk importer's per-page reports in `tools/importer/reports` were set aside and put back.

## The tools that compare our pages with www (item 6)

| Tool | Pairing | Check from files on disk |
| --- | --- | --- |
| Parity sweep (`tools/parity/build-jobs.mjs`) | a job keeps www's path (its captures); its `edsUrl` is our page where the write step puts it (`tools/parity/pair.mjs edsUrlOf`: writeTarget) | the run on disk (`tools/parity/jobs.json`): flags off, every job pairs as it did; a copy with de/de and at/de on, the localized pages pair with their canonical path (test/parity-jobs-slugs.test.mjs). A fresh build-jobs on this machine finds no faithful capture, 0 jobs, so the committed run is the one checked. |
| page-check (`tools/page-check`) | no change: it checks our pages' links against our page paths, and the write step makes those links canonical | the broken-link check on the 300 Lufthansa dry-run pages: 825 broken links with flags off and 825 with them on (links to pages without a local document, unrelated) |
| market-diff (`tools/market-diff`, ema-lufthansa's) | the pair (root page, version page) is two www paths and stays right. **Change for ema-lufthansa (not made):** `bin/md-replica-check.mjs`, after `const rest = short(r.rootPath);`, should ask our replica at `slugMapOf(site).canonicalOf(rest)` (`tools/importer/slug-write.mjs`; the site from `--host`: www.lufthansa.com lh-com, www.swiss.com lh-swiss, business.lufthansagroup.com lh-b2b; none for TAP and ITA). Without it a moved page answers its old path with a redirect. | `lists/lh/pairs-pending.tsv.gz`: 6,499 of 173,479 pairs have a localized root page (and version page), all of them paired back by `wwwPathsOf` and `canonicalOf(…, {all: true})`; SWISS 0 of 36,205, Group for Business 0 of 47,364 |

## Scripts that write around the guard (item 7)

They call DA or admin.hlx.page themselves, not through da-upload. The migration session routes them.

**Page documents and previews by path (the guard matters once a round is on):**
- `tools/loc/slug-step.mjs`: DA POST of a copy, then DELETE (retired).
- `tools/channels/apply.sh`: DA POST of documents, then preview.
- `tools/reports/functions/publish.sh`: DA PUT of `/migration-status/functions`, then preview and live.
- `tools/admin/shared/admin.js` `daSource`: the admin apps' DA source calls, any method, with the editor's token.
- `tools/apps/publish-requests-inbox/api.js`, `tools/apps/publish-requests-inbox-v2/api.js` and
  `tools/plugins/request-for-publish/utils.js`: preview and publish of requested paths.
- `tools/importer/tap-airports.mjs` (sheets, then preview) and `tools/importer/b2b-hotlines.mjs` (a sheet and images).
- Scratch: `migration-work/lh-swiss/repreview.sh` and `migration-work/airdolomiti/repreview.sh` (preview POST per path);
  `migration-work/cargo/patch7.py` (patches a script's preview call).

**Media only (paths under the media trees, not page slugs):** `tools/importer/dam-copy.mjs` (also DELETEs source and
preview), `swiss-dam.mjs`, `ita-dam.mjs`, `discover-dam.mjs`, `brussels-dam.mjs`, `b2b-dam.mjs`, `austrian-dam.mjs`,
`cargo-assets.mjs`, `airdolomiti-assets.mjs` and `aircore-images.mjs`.

**Not on this machine:** the harness's own scripts (`work/local-import-brands/`, `notes/_backup/`). They need the same
check where they live.

## Limits

- Absolute www links to a localized slug stay absolute: www answers them with its 301.
- The local preview of a document tree (aem up on content/) still serves the www paths. After a round, DA holds the page at
  its canonical path.
