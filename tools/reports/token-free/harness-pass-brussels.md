# Brussels Airlines's collapse pass: the harness's job

The job is for the local brand harness, after [harness-pass-ita.md](harness-pass-ita.md)'s pattern: a separate agent
with a fresh clone and the DA token. It should be able to follow this page without asking. The pass turns the style
markers of Brussels Airlines's DA documents (site lh-brussels) into the theme's defaults and carriers. It runs in three steps, in
this order, and never otherwise:

1. **The collapse pass on DA** (this page): download, collapse, check, back up, upload, preview, check. Nothing is
   published.
2. **The switch merged**: the user merges `token-free-brussels-live` into main. Brussels Airlines's theme goes live in code.
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
- The branch `token-free-brussels-live` (head 5ddc21b3, today's main merged in) must not be merged, checked out or changed
  by the harness. Its preview is all the harness uses: `https://token-free-brussels-live--lh-brussels--moved-permanently.aem.page`.
- The Brussels importer and theme files are ema-cashub's; no Brussels import may run during the pass.

## 2. The documents

- DA site: org `moved-permanently`, site `lh-brussels`. Source API: `https://admin.da.live/source/moved-permanently/lh-brussels/<path>.html`.
- **The list**: `tools/reports/token-free/census-lh-brussels-paths.txt`, **1,252 paths** in release order: DA's own census
  (2026-11-09).
  - How it was made: DA's whole tree read with `node tools/importer/da-tree-read.mjs --site lh-brussels` (GET only;
    1,898 documents), then the collapse's dry run over it (`marker-collapse-cli.mjs --brand brussels --force`).
  - The earlier list: collapse-lh-brussels-paths.txt, 1,070 (the workspace). DA has 184 more; two of the old list (/be/en/homepage, /be/fr/homepage) carry no marker in DA any more.
  - What the documents carry: the common families; form `{selected}` (139 form Default carriers), captions, separators.
- A listed path that DA doesn't have is recorded and skipped. A DA document with markers that isn't listed is not
  touched: record it (`marker-collapse-cli.mjs --check` on it).

## 3. Phase A, local only (no DA writes): download, collapse, check, all 1,252 at once

```
mkdir -p work/brussels
node tools/importer/da-tree-read.mjs --site lh-brussels --out work/brussels/before      # or GET each listed path
node --max-old-space-size=3072 tools/importer/marker-collapse-cli.mjs --content work/brussels/before --brand brussels --force \
  --list tools/reports/token-free/census-lh-brussels-paths.txt --out work/brussels/after \
  --report work/brussels/report.json --paths work/brussels/changed.txt --pages work/brussels/pages.jsonl
node tools/importer/collapse-loss-check.mjs --before work/brussels/before --after work/brussels/after \
  --list work/brussels/changed.txt --out work/brussels/loss.json
node tools/importer/carrier-check.mjs --before work/brussels/before --after work/brussels/after \
  --list work/brussels/changed.txt --out work/brussels/carrier.json
```

What the run must report. These are the census's numbers, from the same dry run on DA's documents of today:

| | expected |
| --- | --- |
| documents changed | 1,252 (of 1,898 in the tree) |
| markers | 7,119: 5,473 theme (the marker goes), 1,616 as carriers, 30 for a person |
| marker left, not idempotent, errors | 0, 0, 0 |
| carriers written | 1,085: Spacer / Divider blocks: Spacer 365, Divider 99, Spacer (from-768) 11, Spacer (l) 9; Section Metadata styles: wide-text 114, padded 105, space-m 57, space-below-m 53, space-below-l 17, divider 6, h2-compact 3; block options: divider-above 9, space-m 7; other: form Default 139, italic caption 85, list or quote (indent) 6 |
| the loss check | 0 failed; documents that already had several H1s (notes): 29 |
| the carrier check | 0 failed |
| per document | 741 gain nothing; median 0, 95 % at most 3, at most 11 (/ci/en/contest-rules-brussels-airlines-semaine-ivoirienne-culture-2023) |
| from-768 | 35 such separators in 9 documents (24 under 32 px go, the others become Spacer (from-768)) |

Stop before phase B if any row is off: a loss-check or carrier-check failure, a marker left, an error, a
document "for a person" the list in section 7 doesn't name, carriers written more than 10 % above
1,085, or a document with more than 16 carriers.

## 4. Phase B, in batches: back up, upload, preview, check

The first batch is a canary of 20 documents with every check: the documents with the most carriers first, then
one of each root's first documents. After it come 100 documents per batch (1,232 documents, 13 batches).

**The backup**: `/.token-free-backup/2026-11-brussels/<path>.html` on the same DA site, 12.4 MB for the 1,252
documents. At the ITA pass's rate (about 7 documents a minute, checks included) the pass takes about 3.0 hours.

Per batch:
1. **Back up in DA**: POST each download to the backup folder, GET it back, equal byte for byte. Keep `work/brussels/before/`.
2. **Read DA again before uploading**: a document that differs from the download is not uploaded. Collapse it again on its own, check it, and record it.
3. **Upload** `work/brussels/after/<path>.plain.html`'s `<body>…</body>` part; GET it back: equal to what was sent.
4. **Preview**: `POST https://admin.hlx.page/preview/moved-permanently/lh-brussels/main/<path>`, 200.
5. **Page checks** on the switch branch's preview against the host:
   ```
   node tools/importer/pass-widths.mjs --paths work/brussels/batch-NN.txt --host https://brussels.turnsthe.page \
     --preview https://token-free-brussels-live--lh-brussels--moved-permanently.aem.page --out work/brussels/batch-NN-widths.json
   ```
   - The canary at 1440 and 390 in full. Each later batch: the fast checks for every page (`--widths none`: preview
     200, `.plain.html` 200, no `about:error`, one h1 where the published page had one), then widths for 10 of its
     pages: those with carriers first, then the batch's first pages.
   - Flagged: more than 3 % off in height, or a heading more than 40 px off.

What is known and accepted (brussels-pass-check.md). These can be flagged without stopping the pass:
- C, small separators (0-31 px go): the A330 fleet page -3.5 % / -5.1 %, the Kinshasa lounge -123 px.
- D, heading sizes one step from the default take it: online-check-in-options -2.3 %.
- A and B: seat-reservation +2.6 % at 1440 (small print at the text width, column groups without their padding).
- B: lhg-hub-airport-info, a column view's 80 px (-4.1 % of a short page).

### The stop rule

Stop means: finish the document in hand, start no new batch, and report. Stop on any one of these:
- a loss-check or carrier-check failure, or an uploaded document that doesn't read back equal;
- a preview or `.plain.html` that isn't 200 after one retry, or an `about:error`: more than 2 in a batch;
- a page whose published version had one h1 and whose preview doesn't;
- a page more than 10 % off, or with a heading more than 400 px off, that isn't one of the accepted pages above;
- more than 3 flagged pages in a batch's width sample with a cause unlike the accepted ones.

## 5. Rollback

For one batch or the whole pass:
1. POST each document's backup (`/.token-free-backup/2026-11-brussels/<path>.html`, or `work/brussels/before/`) back to
   `<path>.html`; GET it back: equal.
2. Preview it again.
3. If the pass had already gone live: first revert the switch (`git revert -m 1 <merge commit> && git push origin
   main`), then publish the restored documents again.

Never publish collapsed documents while the switch is off on main.

## 6. After the pass

- **Report**: report.json, loss.json, carrier.json, every batch's widths file, the skipped and re-collapsed paths, DA's documents with markers that weren't listed.
- **The user merges** `token-free-brussels-live` (it touches scripts/style-markers.js: the lh-edge deploy runs; smoke the hosts before and after).
- **Publish** the changed documents, 100 per batch, in the list's order; after each batch the fast checks on the host (`--preview https://brussels.turnsthe.page --widths none`).
- **Count what is left**: `node tools/importer/marker-census.mjs --site lh-brussels` (none on live).

## 7. What the census found that needs a decision

- **30 captions a person must place** (for a person): three travel articles in English, French and Dutch (/be/<en|fr|nl>/articles/the-gambia 6 each, the-ultimate-itinerary-in-kenya 3, vibrant-senegal 1). Each follows a paragraph with two photos side by side, not one, so it is no figure caption (the same articles' captions under one photo become figure captions). The collapse sets them in italics, as the marker did, and they stay under the photos. A person decides whether to split such a pair so the caption becomes a figure caption. Not a stop.
- **from-768**: 35 such separators in 9 documents. 24 are under 32 px and go; 11 become Spacer (from-768).
- **Several H1s before the pass**: 29 documents (notes; the collapse keeps every H1).

The brands helper takes the passes one after another after ITA: TAP, Brussels Airlines, Austrian Airlines, SWISS, Lufthansa Group for Business, Lufthansa Cargo, Air Dolomiti. Next after this one: Austrian Airlines.
