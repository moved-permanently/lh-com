# SWISS (the markets and the sub-sites /corporate and /medicalservices)'s collapse pass: the harness's job

The job is for the local brand harness, after [harness-pass-ita.md](harness-pass-ita.md)'s pattern: a separate agent
with a fresh clone and the DA token. It should be able to follow this page without asking. The pass turns the style
markers of SWISS (the markets and the sub-sites /corporate and /medicalservices)'s DA documents (site lh-swiss) into the theme's defaults and carriers. It runs in three steps, in
this order, and never otherwise:

1. **The collapse pass on DA** (this page): download, collapse, check, back up, upload, preview, check. Nothing is
   published.
2. **The switch merged**: the user merges `token-free-swiss-live` into main. SWISS's theme goes live in code.
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
- The branch `token-free-swiss-live` (head 17da6b5b, today's main merged in) must not be merged, checked out or changed
  by the harness. Its preview is all the harness uses: `https://token-free-swiss-live--lh-swiss--moved-permanently.aem.page`.
- swiss-import.mjs is ema-lufthansa's; no SWISS import may run during the pass.

## 2. The documents

- DA site: org `moved-permanently`, site `lh-swiss`. Source API: `https://admin.da.live/source/moved-permanently/lh-swiss/<path>.html`.
- **The list**: `tools/reports/token-free/census-lh-swiss-paths.txt`, **2,647 paths** in release order: DA's own census
  (2026-11-09).
  - How it was made: DA's whole tree read with `node tools/importer/da-tree-read.mjs --site lh-swiss` (GET only;
    5,170 documents), then the collapse's dry run over it (`marker-collapse-cli.mjs --brand swiss --force`).
  - The earlier list: collapse-lh-swiss-paths.txt (21), -swiss-mk- (474) and -swiss-sub- (186), 681 together (the workspace). DA has 1,967 more: the markets' pages the workspace never imported (2,461 market documents in 214 roots, the sub-sites 186: /corporate 119 in de, en, fr; /medicalservices 67 in de, en).
  - What the documents carry: the common families; SWISS's FAQ hub teaser groups (the theme's teaser-groups rule); 31 background videos.
- A listed path that DA doesn't have is recorded and skipped. A DA document with markers that isn't listed is not
  touched: record it (`marker-collapse-cli.mjs --check` on it).

## 3. Phase A, local only (no DA writes): download, collapse, check, all 2,647 at once

```
mkdir -p work/swiss
node tools/importer/da-tree-read.mjs --site lh-swiss --out work/swiss/before      # or GET each listed path
node --max-old-space-size=3072 tools/importer/marker-collapse-cli.mjs --content work/swiss/before --brand swiss --force \
  --list tools/reports/token-free/census-lh-swiss-paths.txt --out work/swiss/after \
  --report work/swiss/report.json --paths work/swiss/changed.txt --pages work/swiss/pages.jsonl
node tools/importer/collapse-loss-check.mjs --before work/swiss/before --after work/swiss/after \
  --list work/swiss/changed.txt --out work/swiss/loss.json
node tools/importer/carrier-check.mjs --before work/swiss/before --after work/swiss/after \
  --list work/swiss/changed.txt --out work/swiss/carrier.json
```

What the run must report. These are the census's numbers, from the same dry run on DA's documents of today:

| | expected |
| --- | --- |
| documents changed | 2,647 (of 5,170 in the tree) |
| markers | 19,417: 14,171 theme (the marker goes), 5,246 as carriers, 0 for a person |
| marker left, not idempotent, errors | 0, 0, 0 |
| carriers written | 2,663: Section Metadata styles: wide-text 524, space-below-l 495, space-l 403, space-below-m 272, space-m 237, h3-large 64, h2-large 34, divider-below 16, padded 11, divider 3, h2-compact 1; Spacer / Divider blocks: Spacer 232, Divider 95, Spacer (l) 81, Spacer (from-768) 22; block options: divider-above 31, background-video 31, space-m 30, title-large 16, space-l 10; other: italic caption 25, form Default 24, list or quote (indent) 6 |
| the loss check | 0 failed; documents that already had several H1s (notes): 390 |
| the carrier check | 0 failed |
| per document | 1,628 gain nothing; median 0, 95 % at most 3, at most 26 (/kr/ko/discover/swiss-senses/business) |
| from-768 | 44 such separators in 22 documents (22 under 32 px go, the others become Spacer (from-768)) |

Stop before phase B if any row is off: a loss-check or carrier-check failure, a marker left, an error, a
document "for a person" the list in section 7 doesn't name, carriers written more than 10 % above
2,663, or a document with more than 31 carriers.

## 4. Phase B, in batches: back up, upload, preview, check

The first batch is a canary of 20 documents with every check: the documents with the most carriers first, then
one of each root's first documents. After it come 100 documents per batch (2,627 documents, 27 batches).

**The backup**: `/.token-free-backup/2026-11-swiss/<path>.html` on the same DA site, 25.9 MB for the 2,647
documents. At the ITA pass's rate (about 7 documents a minute, checks included) the pass takes about 6.3 hours.

Per batch:
1. **Back up in DA**: POST each download to the backup folder, GET it back, equal byte for byte. Keep `work/swiss/before/`.
2. **Read DA again before uploading**: a document that differs from the download is not uploaded. Collapse it again on its own, check it, and record it.
3. **Upload** `work/swiss/after/<path>.plain.html`'s `<body>…</body>` part; GET it back: equal to what was sent.
4. **Preview**: `POST https://admin.hlx.page/preview/moved-permanently/lh-swiss/main/<path>`, 200.
5. **Page checks** on the switch branch's preview against the host:
   ```
   node tools/importer/pass-widths.mjs --paths work/swiss/batch-NN.txt --host https://swiss.turnsthe.page \
     --preview https://token-free-swiss-live--lh-swiss--moved-permanently.aem.page --out work/swiss/batch-NN-widths.json
   ```
   - The canary at 1440 and 390 in full. Each later batch: the fast checks for every page (`--widths none`: preview
     200, `.plain.html` 200, no `about:error`, one h1 where the published page had one), then widths for 10 of its
     pages: those with carriers first, then the batch's first pages.
   - Flagged: more than 3 % off in height, or a heading more than 40 px off.

What is known and accepted (swiss-pass-check.md, swiss-mk-pass-check.md and swiss-sub-pass-check.md). These can be flagged without stopping the pass:
- B, the FAQ hub's groups: -73 px at 1440, -90 to -121 px at 390 (-3.4 % / -1.9 %).
- D and C, the carry-on baggage pages: +2.5 % to +3.7 % (H3 large for a section, 50 / 100 px separators to M / L).
- E, the market homepages render 47 px (1440) and 90 px (390) differently locally than on the host before the collapse; the pass moves them +16 to +66 px.
- D, headings in blocks one step from the default: prepare-lxmas-2024 +9.2 %.
- The sub-sites: the media-request success pages -4 % (a 26 px separator), the careers pages' H3s.

### The stop rule

Stop means: finish the document in hand, start no new batch, and report. Stop on any one of these:
- a loss-check or carrier-check failure, or an uploaded document that doesn't read back equal;
- a preview or `.plain.html` that isn't 200 after one retry, or an `about:error`: more than 2 in a batch;
- a page whose published version had one h1 and whose preview doesn't;
- a page more than 10 % off, or with a heading more than 400 px off, that isn't one of the accepted pages above;
- more than 3 flagged pages in a batch's width sample with a cause unlike the accepted ones.

## 5. Rollback

For one batch or the whole pass:
1. POST each document's backup (`/.token-free-backup/2026-11-swiss/<path>.html`, or `work/swiss/before/`) back to
   `<path>.html`; GET it back: equal.
2. Preview it again.
3. If the pass had already gone live: first revert the switch (`git revert -m 1 <merge commit> && git push origin
   main`), then publish the restored documents again.

Never publish collapsed documents while the switch is off on main.

## 6. After the pass

- **Report**: report.json, loss.json, carrier.json, every batch's widths file, the skipped and re-collapsed paths, DA's documents with markers that weren't listed.
- **The user merges** `token-free-swiss-live` (it touches scripts/style-markers.js: the lh-edge deploy runs; smoke the hosts before and after).
- **Publish** the changed documents, 100 per batch, in the list's order; after each batch the fast checks on the host (`--preview https://swiss.turnsthe.page --widths none`).
- **Count what is left**: `node tools/importer/marker-census.mjs --site lh-swiss` (none on live).

## 7. What the census found that needs a decision

- **Several H1s before the pass: 390 documents**, the most of any brand. The collapse keeps every H1, and the loss check lists them as notes. The page check's "one H1 where the published page had one" holds for the rest. Whether those pages should have one H1 is a content question for SWISS, not the pass's.
- **from-768**: 44 such separators in 22 documents. 22 are under 32 px and go; 22 become Spacer (from-768).
- /kr/ko/discover/swiss-senses/business gains 26 carriers, the most of any SWISS document. It is listed for a look at the canary (section 4).
- The `{ut}` in /ae/fr/local-page/black-friday is a typo in the text ("comme{ut} SWISS"), not a marker: it stays.

The brands helper takes the passes one after another after ITA: TAP, Brussels Airlines, Austrian Airlines, SWISS, Lufthansa Group for Business, Lufthansa Cargo, Air Dolomiti. Next after this one: Lufthansa Group for Business.
