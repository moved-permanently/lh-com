# TAP's collapse pass: the harness's job

The job is for the local brand harness, after [harness-pass-ita.md](harness-pass-ita.md)'s pattern: a separate agent
with a fresh clone and the DA token. It should be able to follow this page without asking. The pass turns the style
markers of TAP's DA documents (site lh-tap) into the theme's defaults and carriers. It runs in three steps, in
this order, and never otherwise:

1. **The collapse pass on DA** (this page): download, collapse, check, back up, upload, preview, check. Nothing is
   published.
2. **The switch merged**: the user merges `token-free-tap-live` into main. TAP's theme goes live in code.
3. **Publish**: the changed documents go live (section 6).

Until step 2 the preview of `main` shows the collapsed documents with the theme off. The page checks therefore read
the switch branch's preview, which has the theme on.

**Ready to start**: yes, after ITA (the brands helper's order, section 7). Nothing in this page waits for anyone.

## 1. The clone

```
git clone https://github.com/moved-permanently/lh-com.git && cd lh-com
git checkout main      # must contain the from-768 option and the block-cell marks (the brief after 520, item 4)
test -f test/spacer-from-768-508.test.mjs && test -f test/cell-marks-520.test.mjs && echo ok
npm ci
```

- Node 20 or later; a Chromium for playwright-core (`npx playwright-core install chromium`, or `CHROMIUM_PATH`).
- The branch `token-free-tap-live` (head 3d92339c, today's main merged in) must not be merged, checked out or changed
  by the harness. Its preview is all the harness uses: `https://token-free-tap-live--lh-tap--moved-permanently.aem.page`.
- TAP's own importers (tap-import.mjs, tap-markets.mjs: ema-cashub's) collapse as their last step once TAP's theme is live; no TAP import may run during the pass.

## 2. The documents

- DA site: org `moved-permanently`, site `lh-tap`. Source API: `https://admin.da.live/source/moved-permanently/lh-tap/<path>.html`.
- **The list**: `tools/reports/token-free/census-lh-tap-paths.txt`, **156 paths** in release order: DA's own census
  (2026-11-09).
  - How it was made: DA's whole tree read with `node tools/importer/da-tree-read.mjs --site lh-tap` (GET only;
    1,929 documents), then the collapse's dry run over it (`marker-collapse-cli.mjs --brand tap --force`).
  - The earlier list: none (the workspace's copies hold 3 blank lines, not DA's).
  - What the documents carry: only `<p><sub>{blank}</sub></p>` (a blank line in a cell): it becomes the theme's paragraph gap, the paragraph goes.
- A listed path that DA doesn't have is recorded and skipped. A DA document with markers that isn't listed is not
  touched: record it (`marker-collapse-cli.mjs --check` on it).

## 3. Phase A, local only (no DA writes): download, collapse, check, all 156 at once

```
mkdir -p work/tap
node tools/importer/da-tree-read.mjs --site lh-tap --out work/tap/before      # or GET each listed path
node --max-old-space-size=3072 tools/importer/marker-collapse-cli.mjs --content work/tap/before --brand tap --force \
  --list tools/reports/token-free/census-lh-tap-paths.txt --out work/tap/after \
  --report work/tap/report.json --paths work/tap/changed.txt --pages work/tap/pages.jsonl
node tools/importer/collapse-loss-check.mjs --before work/tap/before --after work/tap/after \
  --list work/tap/changed.txt --out work/tap/loss.json
node tools/importer/carrier-check.mjs --before work/tap/before --after work/tap/after \
  --list work/tap/changed.txt --out work/tap/carrier.json
```

What the run must report. These are the census's numbers, from the same dry run on DA's documents of today:

| | expected |
| --- | --- |
| documents changed | 156 (of 1,915 in the tree) |
| markers | 447: 447 theme (the marker goes), 0 as carriers, 0 for a person |
| marker left, not idempotent, errors | 0, 0, 0 |
| carriers written | 0: none |
| the loss check | 0 failed; documents that already had several H1s (notes): 0 |
| the carrier check | 0 failed |
| per document | 156 gain nothing; median 0, 95 % at most 0, at most 0 (/pt-pt/reservas/time-to-think) |
| from-768 | 0 such separators in 0 documents (0 under 32 px go, the others become Spacer (from-768)) |

Stop before phase B if any row is off: a loss-check or carrier-check failure, a marker left, an error, a
document "for a person" the list in section 7 doesn't name, carriers written more than 10 % above
0, or a document with more than 15 carriers.

## 4. Phase B, in batches: back up, upload, preview, check

The first batch is a canary of 20 documents with every check: the documents with the most carriers first, then
one of each root's first documents. After it come 100 documents per batch (136 documents, 2 batches).

**The backup**: `/.token-free-backup/2026-11-tap/<path>.html` on the same DA site, 12.1 MB for the 156
documents. At the ITA pass's rate (about 7 documents a minute, checks included) the pass takes about 22 minutes.

Per batch:
1. **Back up in DA**: POST each download to the backup folder, GET it back, equal byte for byte. Keep `work/tap/before/`.
2. **Read DA again before uploading**: a document that differs from the download is not uploaded. Collapse it again on its own, check it, and record it.
3. **Upload** `work/tap/after/<path>.plain.html`'s `<body>…</body>` part; GET it back: equal to what was sent.
4. **Preview**: `POST https://admin.hlx.page/preview/moved-permanently/lh-tap/main/<path>`, 200.
5. **Page checks** on the switch branch's preview against the host:
   ```
   node tools/importer/pass-widths.mjs --paths work/tap/batch-NN.txt --host https://tap.turnsthe.page \
     --preview https://token-free-tap-live--lh-tap--moved-permanently.aem.page --out work/tap/batch-NN-widths.json
   ```
   - The canary at 1440 and 390 in full. Each later batch: the fast checks for every page (`--widths none`: preview
     200, `.plain.html` 200, no `about:error`, one h1 where the published page had one), then widths for 10 of its
     pages: those with carriers first, then the batch's first pages.
   - Flagged: more than 3 % off in height, or a heading more than 40 px off.

What is known and accepted (tap-pass-check.md (ema-cashub's)). These can be flagged without stopping the pass:
- The paragraph gap instead of a blank line: up to +1.7 % in height (donate-miles), 0 blank lines and 0 markers left (tap-pass-check.md's render check).
- The fragments (/<market>/fragments/…, 67 of the 156) are collapsed with the rest; a page that includes one is checked through the page (pass-widths reads the page, which loads its fragments).

### The stop rule

Stop means: finish the document in hand, start no new batch, and report. Stop on any one of these:
- a loss-check or carrier-check failure, or an uploaded document that doesn't read back equal;
- a preview or `.plain.html` that isn't 200 after one retry, or an `about:error`: more than 2 in a batch;
- a page whose published version had one h1 and whose preview doesn't;
- a page more than 10 % off, or with a heading more than 400 px off, that isn't one of the accepted pages above;
- more than 3 flagged pages in a batch's width sample with a cause unlike the accepted ones.

## 5. Rollback

For one batch or the whole pass:
1. POST each document's backup (`/.token-free-backup/2026-11-tap/<path>.html`, or `work/tap/before/`) back to
   `<path>.html`; GET it back: equal.
2. Preview it again.
3. If the pass had already gone live: first revert the switch (`git revert -m 1 <merge commit> && git push origin
   main`), then publish the restored documents again.

Never publish collapsed documents while the switch is off on main.

## 6. After the pass

- **Report**: report.json, loss.json, carrier.json, every batch's widths file, the skipped and re-collapsed paths, DA's documents with markers that weren't listed.
- **The user merges** `token-free-tap-live` (it touches scripts/style-markers.js: the lh-edge deploy runs; smoke the hosts before and after).
- **Publish** the changed documents, 100 per batch, in the list's order; after each batch the fast checks on the host (`--preview https://tap.turnsthe.page --widths none`).
- **Count what is left**: `node tools/importer/marker-census.mjs --site lh-tap` (none on live).

## 7. What the census found that needs a decision

- Nothing: no carriers, no from-768, no document with several H1s.

The brands helper takes the passes one after another after ITA: TAP, Brussels Airlines, Austrian Airlines, SWISS, Lufthansa Group for Business, Lufthansa Cargo, Air Dolomiti. Next after this one: Brussels Airlines.
