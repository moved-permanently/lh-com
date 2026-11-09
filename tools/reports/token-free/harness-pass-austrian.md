# Austrian Airlines's collapse pass: the harness's job

The job is for the local brand harness, after [harness-pass-ita.md](harness-pass-ita.md)'s pattern: a separate agent
with a fresh clone and the DA token. It should be able to follow this page without asking. The pass turns the style
markers of Austrian Airlines's DA documents (site lh-austrian) into the theme's defaults and carriers. It runs in three steps, in
this order, and never otherwise:

1. **The collapse pass on DA** (this page): download, collapse, check, back up, upload, preview, check. Nothing is
   published.
2. **The switch merged**: the user merges `token-free-austrian-live` into main. Austrian Airlines's theme goes live in code.
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
- The branch `token-free-austrian-live` (head 2700b095, today's main merged in) must not be merged, checked out or changed
  by the harness. Its preview is all the harness uses: `https://token-free-austrian-live--lh-austrian--moved-permanently.aem.page`.
- The Austrian importer and theme files are ema-cashub's; no Austrian import may run during the pass.

## 2. The documents

- DA site: org `moved-permanently`, site `lh-austrian`. Source API: `https://admin.da.live/source/moved-permanently/lh-austrian/<path>.html`.
- **The list**: `tools/reports/token-free/census-lh-austrian-paths.txt`, **2,036 paths** in release order: DA's own census
  (2026-11-09).
  - How it was made: DA's whole tree read with `node tools/importer/da-tree-read.mjs --site lh-austrian` (GET only;
    2,550 documents), then the collapse's dry run over it (`marker-collapse-cli.mjs --brand austrian --force`).
  - The earlier list: collapse-lh-austrian-paths.txt, 1,893 (the workspace). DA has 143 more, none gone.
  - What the documents carry: the common families; Austrian's intro after the H1 (`{copytext-large}`: the theme's rule).
- A listed path that DA doesn't have is recorded and skipped. A DA document with markers that isn't listed is not
  touched: record it (`marker-collapse-cli.mjs --check` on it).

## 3. Phase A, local only (no DA writes): download, collapse, check, all 2,036 at once

```
mkdir -p work/austrian
node tools/importer/da-tree-read.mjs --site lh-austrian --out work/austrian/before      # or GET each listed path
node --max-old-space-size=3072 tools/importer/marker-collapse-cli.mjs --content work/austrian/before --brand austrian --force \
  --list tools/reports/token-free/census-lh-austrian-paths.txt --out work/austrian/after \
  --report work/austrian/report.json --paths work/austrian/changed.txt --pages work/austrian/pages.jsonl
node tools/importer/collapse-loss-check.mjs --before work/austrian/before --after work/austrian/after \
  --list work/austrian/changed.txt --out work/austrian/loss.json
node tools/importer/carrier-check.mjs --before work/austrian/before --after work/austrian/after \
  --list work/austrian/changed.txt --out work/austrian/carrier.json
```

What the run must report. These are the census's numbers, from the same dry run on DA's documents of today:

| | expected |
| --- | --- |
| documents changed | 2,036 (of 2,550 in the tree) |
| markers | 20,226: 18,019 theme (the marker goes), 2,207 as carriers, 0 for a person |
| marker left, not idempotent, errors | 0, 0, 0 |
| carriers written | 1,447: Section Metadata styles: divider 438, wide-text 175, space-m 133, space-below-m 87, h2-compact 66, space-below-l 65, space-l 20, divider-below 12, padded 10, h3-large 1; Spacer / Divider blocks: Spacer 212, Divider 154, Spacer (from-768) 20, Spacer (l) 2; block options: space-m 29, title-compact 12, divider-above 1; other: italic caption 10 |
| the loss check | 0 failed; documents that already had several H1s (notes): 2 |
| the carrier check | 0 failed |
| per document | 1,151 gain nothing; median 0, 95 % at most 3, at most 5 (/ru/ru/travel-briefing) |
| from-768 | 123 such separators in 30 documents (103 under 32 px go, the others become Spacer (from-768)) |

Stop before phase B if any row is off: a loss-check or carrier-check failure, a marker left, an error, a
document "for a person" the list in section 7 doesn't name, carriers written more than 10 % above
1,447, or a document with more than 15 carriers.

## 4. Phase B, in batches: back up, upload, preview, check

The first batch is a canary of 20 documents with every check: the documents with the most carriers first, then
one of each root's first documents. After it come 100 documents per batch (2,016 documents, 21 batches).

**The backup**: `/.token-free-backup/2026-11-austrian/<path>.html` on the same DA site, 23.8 MB for the 2,036
documents. At the ITA pass's rate (about 7 documents a minute, checks included) the pass takes about 4.8 hours.

Per batch:
1. **Back up in DA**: POST each download to the backup folder, GET it back, equal byte for byte. Keep `work/austrian/before/`.
2. **Read DA again before uploading**: a document that differs from the download is not uploaded. Collapse it again on its own, check it, and record it.
3. **Upload** `work/austrian/after/<path>.plain.html`'s `<body>…</body>` part; GET it back: equal to what was sent.
4. **Preview**: `POST https://admin.hlx.page/preview/moved-permanently/lh-austrian/main/<path>`, 200.
5. **Page checks** on the switch branch's preview against the host:
   ```
   node tools/importer/pass-widths.mjs --paths work/austrian/batch-NN.txt --host https://austrian.turnsthe.page \
     --preview https://token-free-austrian-live--lh-austrian--moved-permanently.aem.page --out work/austrian/batch-NN-widths.json
   ```
   - The canary at 1440 and 390 in full. Each later batch: the fast checks for every page (`--widths none`: preview
     200, `.plain.html` 200, no `about:error`, one h1 where the published page had one), then widths for 10 of its
     pages: those with carriers first, then the batch's first pages.
   - Flagged: more than 3 % off in height, or a heading more than 40 px off.

What is known and accepted (austrian-pass-check.md). These can be flagged without stopping the pass:
- B, text in column views: Austrian puts each heading and its text in a column view of its own. Between two such groups www has 80 px, the theme 32: data-protection-rights -10.7 % at 1440, miles-and-more -3.4 %, lounges -4.6 %.
- C, small separators: lounges -78 px, culinary services -78 px, climate projects -130 px.
- D, heading sizes: flight-status -68 px at 390.
- R, the theme's heading gap: voucher conditions +2.3 %.

### The stop rule

Stop means: finish the document in hand, start no new batch, and report. Stop on any one of these:
- a loss-check or carrier-check failure, or an uploaded document that doesn't read back equal;
- a preview or `.plain.html` that isn't 200 after one retry, or an `about:error`: more than 2 in a batch;
- a page whose published version had one h1 and whose preview doesn't;
- a page more than 10 % off, or with a heading more than 400 px off, that isn't one of the accepted pages above;
- more than 3 flagged pages in a batch's width sample with a cause unlike the accepted ones.

## 5. Rollback

For one batch or the whole pass:
1. POST each document's backup (`/.token-free-backup/2026-11-austrian/<path>.html`, or `work/austrian/before/`) back to
   `<path>.html`; GET it back: equal.
2. Preview it again.
3. If the pass had already gone live: first revert the switch (`git revert -m 1 <merge commit> && git push origin
   main`), then publish the restored documents again.

Never publish collapsed documents while the switch is off on main.

## 6. After the pass

- **Report**: report.json, loss.json, carrier.json, every batch's widths file, the skipped and re-collapsed paths, DA's documents with markers that weren't listed.
- **The user merges** `token-free-austrian-live` (it touches scripts/style-markers.js: the lh-edge deploy runs; smoke the hosts before and after).
- **Publish** the changed documents, 100 per batch, in the list's order; after each batch the fast checks on the host (`--preview https://austrian.turnsthe.page --widths none`).
- **Count what is left**: `node tools/importer/marker-census.mjs --site lh-austrian` (none on live).

## 7. What the census found that needs a decision

- **from-768**: 123 such separators in 30 documents. 103 are under 32 px and go; 20 become Spacer (from-768).
- **Several H1s before the pass**: 2 documents (notes).
- data-protection-rights at -10.7 % is over the stop rule's 10 %. It is accepted (cause B, above), and the stop rule names it.

The brands helper takes the passes one after another after ITA: TAP, Brussels Airlines, Austrian Airlines, SWISS, Lufthansa Group for Business, Lufthansa Cargo, Air Dolomiti. Next after this one: SWISS.
