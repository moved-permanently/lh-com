# lufthansa.com's collapse pass: the harness's job (the last brand, the largest pass)

The job is for the local lufthansa.com harness: a separate agent with a fresh clone and the DA token. It should be
able to follow this page without asking. The pass is shaped like ITA's ([harness-pass-ita.md](harness-pass-ita.md)).
It turns the style markers of lufthansa.com's DA documents (site lh-com) into the theme's defaults and carriers.

lufthansa.com is the largest pass: 6,752 of the 7,587 sitemap pages carry markers, plus 74 app screens
(marker-census.mjs, 2026-11-09). It is also the brand with the most carrier kinds: the column view carrier, video
options, parallax, the from-768 Spacer and the app screens' blocks. So this page adds checks that catch a wrong
carrier early (section 4).

The pass runs in three steps, in this order, and never otherwise:

1. **The collapse pass on DA** (this page): download, collapse, check, back up, upload, preview, check. Nothing is
   published.
2. **The switch merged**: the user merges `token-free-lufthansa-live` into main. lufthansa.com's theme goes live in
   code.
3. **Publish**: lufthansa.com's changed documents go live, last of all brands (section 7).

Until step 2 the preview of `main` shows the collapsed documents with the theme off, so they look wrong there. The
page checks therefore read the switch branch's preview, which has the theme on. Live pages don't change until step 3.

## 1. The clone

```
git clone https://github.com/moved-permanently/lh-com.git && cd lh-com
git checkout main
# must contain: 56b60faf (the theme rules), 6d1bb8a0 (the collapse fix, the loss and page checks),
# d1bd76e7 (the column view carrier), fa26e255 (no sections-m on /100-years, captions in block cells),
# the from-768 option (test/spacer-from-768-508.test.mjs) and the carrier check (test/carrier-check-508.test.mjs:
# tools/importer/carrier-check.mjs and the column view fix it found)
for c in 56b60faf 6d1bb8a0 d1bd76e7 fa26e255; do git merge-base --is-ancestor $c HEAD || echo "missing $c"; done
test -f test/spacer-from-768-508.test.mjs && test -f test/carrier-check-508.test.mjs && echo ok
npm ci
```

- Node 20 or later.
- For the page checks: a Chromium for playwright-core (`npx playwright-core install chromium`, or `CHROMIUM_PATH=<chrome>`).
- The branch `token-free-lufthansa-live` must not be merged, checked out or changed by the harness. Its preview is
  all the harness uses: `https://token-free-lufthansa-live--lh-com--moved-permanently.aem.page`.
- The R2 snapshots are not needed (no import runs). During the pass no lufthansa.com re-import may run: the theme is
  off on main, so an import would write markers again.
- No requests to www.lufthansa.com. The host for the page checks is `https://lufthansa.turnsthe.page` (the published
  documents, theme off).

## 2. The documents

- DA site: org `moved-permanently`, site `lh-com`. Source API:
  `https://admin.da.live/source/moved-permanently/lh-com/<path>.html`, `Authorization: Bearer $DA_TOKEN`.
- **The list is DA's own.** Start from `tools/reports/token-free/lh-com-census-paths.txt`: 6,826 paths in release
  order (de/en, de/de, then the other markets, the 74 app screens `/content/mobile/…` last). These are the previewed
  documents with markers on 2026-11-09.
  1. Download every listed path. A listed path that DA doesn't have is recorded and skipped.
  2. Run `marker-collapse-cli.mjs --check` over the download. Documents without markers drop out of the list
     (someone may have edited them since the census).
  3. Download the site's whole tree once and `--check` it too. A DA document with markers that isn't listed is not
     touched: record it for the report.
  4. Leave out `/migration-status/**` always. The author and tech guides quote markers as examples (the loss check
     fails on 3 of them, and 2 keep a marker by design).
- The workspace has 4,874 of the census's documents. The others (about 1,950, mostly other markets' book-and-manage,
  prepare-for-your-trip, fleet and 100-years pages) were never imported here. So the numbers below are the
  workspace's, and DA's will be larger in proportion.

## 3. Phase A, local only (no DA writes): download, collapse, check, all at once

The collapse must see all documents in one run. It rewrites links to another document's old heading ids, which is
only possible within the run.

```
mkdir -p work/lh/before work/lh/after
# every path of the list: GET the DA source, saved byte for byte as work/lh/before/<path>.plain.html
node --max-old-space-size=4096 tools/importer/marker-collapse-cli.mjs --content work/lh/before --brand lufthansa --force \
  --list work/lh/list.txt --out work/lh/after --report work/lh/report.json --paths work/lh/changed.txt --pages work/lh/pages.jsonl
node --max-old-space-size=2048 tools/importer/collapse-loss-check.mjs --before work/lh/before --after work/lh/after \
  --list work/lh/changed.txt --out work/lh/loss.json
node --max-old-space-size=2048 tools/importer/carrier-check.mjs --before work/lh/before --after work/lh/after \
  --list work/lh/changed.txt --reports tools/importer/reports --out work/lh/carrier.json \
  --max insights=5,info=31,none=50,legal=16,campaign=18,hub=10,app-screen=9,fleet=2,form=1,app-entry=3,flight-status=1,homepage=0 \
  --never homepage:column-view,app-screen:column-view
```

The collapse took 3 minutes for the workspace's 5,153 documents, with the larger heap.

What the run must report. These are the workspace's numbers (5,153 documents, main as of this page). DA's run covers
about a third more documents:

| | the workspace |
| --- | --- |
| documents changed | 5,153 of 5,153 |
| markers | 35,258: 14,915 theme (the marker goes), 20,283 as carriers, 60 for a person |
| for a person | 58 "caption after no image" (the eat-see-do articles' credits) and 2 more; listed in the report, not a stop |
| marker left, not idempotent, errors | 2 (both in /migration-status/, left out of the pass), 0, 0 |
| carriers written | 17,683 (with 6,222 italic captions, each a paragraph's own style) |
| the loss check | 0 failed without /migration-status/; 116 documents already had several H1s (notes) |
| the carrier check | 0 failed, 9 over their class's maximum (all /mk/ articles without an import report, below) |

Carriers written, by kind (the workspace's report):

| kind | count |
| --- | --- |
| Section Metadata styles | column-view 2,729, flush 1,973, wide-text 1,267, divider 948, padded 871, space-below-m 439, small-print 319, space-m 289, parallax 250, h3-large 85, h2-compact 73, divider-below 65, space-below-l 54, narrow 36, space-l 16 |
| Spacer / Divider blocks | Divider 563, Spacer 410, Spacer (from-768) 319, Spacer (l, from-768) 47, Spacer (l) 8 |
| block options | title-large 97, space-m 81, title-compact 58, background-video 45, divider-above 39, mobile-video 36 |
| app screens (68 in the workspace) | App Spacer (medium) 201, App Text (small) 52, App Spacer (medium, v2) 48, App Spacer (x-small) 24 |
| other | form Default 18, the page's Headings row 1 |

What a changed document gains, per class (the import reports' template; carrier-check's counting):

| class | documents | gain nothing | median | 95 % at most | most (where) | main carriers |
| --- | --- | --- | --- | --- | --- | --- |
| insights | 2,773 | 1,769 | 0 | 2 | 5 (the stop-over articles) | Divider block 733, parallax 250, divider 169, wide-text 41, mobile-video 36 |
| info | 1,318 | 84 | 3 | 17 | 31 (europa-tarife-economy-class) | column-view 2,319, flush 1,671, wide-text 953, padded 686, small-print 198 |
| none (no template) | 349 | 65 | 2 | 14 | 50 (/mk/ …explore-the-world-manual) | column-view 410, flush 302, padded 185, wide-text 184 |
| legal | 163 | 93 | 0 | 7 | 16 (terms-and-conditions-lh) | Divider block 184, wide-text 24, Spacer (from-768) 8 |
| campaign | 147 | 43 | 1 | 18 | 18 (100-years/fleet) | space-below-m 152, Spacer 129, space-m 74 (style and option), Spacer (from-768) 68, background-video 32 |
| hub | 92 | 40 | 1 | 10 | 10 (additional-services) | Spacer (from-768) 80, Divider block 32, Spacer 17, space-m 12 |
| app screen | 68 | 0 | 5 | 9 | 9 (a-perfect-day-in-…) | App Spacer and App Text blocks only |
| fleet | 49 | 0 | 1 | 2 | 2 | title-large 48 |
| form, app-entry, flight status | 44, 40, 8 | 10, 16, 0 | 1 | 1 to 3 | 1, 3, 1 | space-below-m / -l, Spacer |
| homepage | 8 | 8 | 0 | 0 | 0 | none |

Documents with a from-768 Spacer: 54 in the workspace (366 runs; additional-services has ten). With a video
option: 72. With a column view: 1,228.

Stop before phase B if any of these is off:
- a loss-check failure;
- a marker left, an error, or a document "for a person" that isn't a caption after no image;
- carriers written more than 10 % above the workspace's rate (17,683 for 5,153 documents: about 3.4 per document);
- any carrier-check failure that isn't "over the class's maximum" (section 4).

## 4. The carrier checks (they catch a wrong carrier before any upload)

`carrier-check.mjs` compares each collapsed document with its download. These fail a document, and each one stops
the pass:

- **An unknown carrier**: a section style the site doesn't read (scripts/style-markers.js SECTION_STYLES and flush),
  or a Spacer / Divider / App block option it doesn't know. The importers' own styles (grey, column-band) are
  copied when a section splits, and are not counted.
- **A carrier without its marks**: column-view or flush without `{column-start…}` / `{column-end…}` marks; a
  from-768 block without `{spacer-N from-768}` separators; background-video without `{autoplay …}`; mobile-video
  without `{mobile}`; parallax or narrow without their marks; app blocks without the app's `{spacer: …}` /
  `{small}`.
- **A column view gone wrong**: a column-view section with nothing but separators, or a column view of the
  collapse's that is flush although it is the page's last section. (Before the check existed, the column view
  carrier wrote flush on /ir/en/tehran-frankfurt-restart and moved its page metadata into a section of its own,
  because of a stray `{column-end-outer}`. Fixed with test/carrier-check-508.test.mjs.)
- **Flush new on a section that isn't a column view.** The importers write `flush, column-view, grey` themselves;
  those are left alone.
- **A carrier its class never gets**: a column view on a homepage or an app screen.

**Over the class's maximum** (the table above, `--max`) lists the document without stopping. Look at every one
before phase B: open the before and after side by side and check that the gained carriers follow its marks. In the
workspace these are 9 /mk/ articles that have no import report: they fall back to "insights", and their column marks
became column views as on any page. A document without an import report is classed by its path: an `/articles/`
path is insights, anything else is none.

In phase B the three checks run again on every document that is collapsed again (step 2 below).

## 5. Phase B, in batches: back up, upload, preview, check

The batches follow the list's order. The first batch is a canary of 20 drawn from every page type; after it come 100
documents per batch. The canary (the paths must be in DA's list; replace one that isn't with another of its type):

| # | path | type | why |
| --- | --- | --- | --- |
| 1 | /de/en/100-years/chronicle | campaign | column views, background videos |
| 2 | /de/en/book-and-manage/stopover | campaign | 6 from-768 Spacers, a column view |
| 3 | /de/en/100-years/fleet | campaign | the most carriers of its type (18) |
| 4 | /de/en/additional-services | hub | ten from-768 Spacers (+8.2 % at 390 without them) |
| 5 | /de/en/miles-and-more | hub | column views (the handover's mapping) |
| 6 | /de/en/europa-tarife-economy-class | info | the most carriers of all (31) |
| 7 | /de/en/travel-agencies | info | column views (-11.6 % before the carrier) |
| 8 | /de/en/accessible-travel | info | the importers' flush grey section beside a column view |
| 9 | /de/en/login | none | no template |
| 10 | /de/en/articles/explore-the-world/essentials-ny-facts | insights | mobile-video |
| 11 | /de/en/articles/explore-the-world/picture-perfect-boston | insights | parallax |
| 12 | /de/en/articles/explore-the-world/in-my-hood-chiswick-london | insights | ema-adobe's worst heading shift |
| 13 | /de/en/terms-and-conditions-lh | legal | Divider blocks (16) |
| 14 | /de/en/advance-seat-reservations-terms-and-conditions | legal | +7.4 % in ema-adobe's check |
| 15 | /de/en/seat-maps | fleet | title-large |
| 16 | /de/en/feedback-past-flight | form | form defaults |
| 17 | /de/en/flight-search | app-entry | |
| 18 | /de/en/timetable-and-flight-status | flight status | Spacer (l) |
| 19 | /de/en/homepage | homepage | gains nothing |
| 20 | /content/mobile/lh/de/articles/a-perfect-day-in-frankfurt | app screen | App Spacer, App Text |

For each batch:

1. **Back up in DA.** POST each document's download (`work/lh/before/<path>.plain.html`) to
   `/.token-free-backup/2026-11-lufthansa/<path>.html` on the same DA site. Then GET it back: it must be equal byte
   for byte. Keep `work/lh/before/` too.
2. **Read DA again before uploading.** If a document differs from `work/lh/before/` (someone edited it since phase
   A), don't upload it. Collapse it again on its own, run the three checks on it, and record it.
3. **Upload** `work/lh/after/<path>.plain.html`, its `<body>…</body>` part, as DA's source. GET it back: it must
   equal what was sent.
4. **Preview**: `POST https://admin.hlx.page/preview/moved-permanently/lh-com/main/<path>`; it must answer 200.
5. **Page checks** on the switch branch's preview against the host:
   ```
   node tools/importer/pass-widths.mjs --paths work/lh/batch-NN.txt --host https://lufthansa.turnsthe.page \
     --preview https://token-free-lufthansa-live--lh-com--moved-permanently.aem.page --out work/lh/batch-NN-widths.json
   ```
   - The canary's 19 web pages at 1440 and 390, in full.
   - Each later batch: the fast checks for every page (`--widths none`: preview 200, `.plain.html` 200, no
     `about:error`, one h1 where the published page had one). Then widths for 10 of its pages: those over their
     class's maximum, those with a column view, a from-768 Spacer or a video option, then the batch's first pages.
   - Flagged: more than 3 % off in height, or a heading more than 40 px off.
6. **App screens** (the canary's one, then the 74 as one batch, last):
   `node tools/workers/lh-edge/compare-sdui.mjs --origin https://main--lh-com--moved-permanently.aem.page`
   before the batch's upload and after its preview. The two reports
   (tools/reports/lh-edge/compare-sdui.md) must list the same differences. An app screen's collapse doesn't depend on
   the theme switch.

**The numbers to hold the pages to**: ema-adobe's lh-com-pass-check.md, mean height difference per page type, as
measured again after the from-768 option (its section "After the "from 768 px" Spacer option", brief 521):

| type | mean (lh-com-pass-check.md) | known flagged pages, accepted |
| --- | --- | --- |
| campaign | 1.5 % | chronicle and global-network on a heading 77-406 px off (column views B, heading sizes D); stopover +1.9 % at both widths (heading sizes) |
| hub | 0.8 % | baggage 1440 (a heading 80 px down), miles-and-more's headings within 48 px; additional-services 0 % at both widths |
| info | 0.9 % | giftvoucher, payment-options-at-the-airport, first-class-terminal (a heading 54-108 px off) |
| legal | 2.7 % | advance-seat-reservations-terms-and-conditions +7.4 / +6.5 % (a 100 px separator becomes L) |
| insights | 2.0 % | the Related Articles divider (+26 px), the 40-60 px separators growing to M (+51 px) |
| fleet | 0.6 % | 320 at 390, a heading 84 px off |
| form, app-entry, flight status, homepage | 0.0 to 0.9 % | none |

flights and culinaryjourney render differently from the host anyway (live offers, a micro-frontend). Leave them
out of the width checks: run only the fast checks on them.

### The stop rule

Stop means: finish the document in hand, start no new batch, and report. Stop on any one of these:

- a loss-check or carrier-check failure (section 4), or an uploaded document that doesn't read back equal;
- a preview or `.plain.html` that isn't 200 after one retry, or an `about:error`: more than 2 in a batch;
- a page whose published version had one h1 and whose preview doesn't;
- a page more than 10 % off, or with a heading more than 400 px off, that isn't one of the accepted pages above;
- a page type whose batch sample comes out more than 2 points above its mean in the table;
- more than 3 flagged pages in a batch's width sample with a cause unlike the accepted ones;
- an app screen difference in compare-sdui that the before report didn't have.

## 6. Rollback

For one batch or the whole pass:
1. POST each document's backup (`/.token-free-backup/2026-11-lufthansa/<path>.html`, or `work/lh/before/`) back to
   `<path>.html`. GET it back: it must be equal.
2. Preview it again (`admin.hlx.page/preview/…`). For app screens, run compare-sdui once more.
3. If the pass had already gone live (step 3):
   - first revert the switch: `git revert -m 1 <merge commit> && git push origin main`;
   - then publish the restored documents again (`POST https://admin.hlx.page/live/moved-permanently/lh-com/main/<path>`).

Never publish collapsed documents while the switch is off on main.

## 7. After the pass

- **Report**: `work/lh/report.json`, `loss.json`, `carrier.json`, every batch's widths file, the two compare-sdui
  reports, the skipped and re-collapsed paths, and DA's documents with markers that weren't listed.
- **The user merges** `token-free-lufthansa-live`.
- **Publish last of all brands**: only after every other brand's pass has gone live. 100 per batch, in the list's
  order, the app screens last. After each batch, run the fast checks on the host:
  `pass-widths.mjs --host https://lufthansa.turnsthe.page --preview https://lufthansa.turnsthe.page --widths none`.
  lh-edge serves the app screens from the published documents, so after their batch run
  `compare-sdui.mjs --host <lh-edge host>` as well.
- **Count what is left**: `node tools/importer/marker-census.mjs --site lh-com` (it should show no markers on live
  outside /migration-status/).
