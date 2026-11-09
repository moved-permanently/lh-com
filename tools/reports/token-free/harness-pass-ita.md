# ITA's collapse pass: the harness's job (the first brand through token-free styling's step 2)

The job is for a local import harness: a separate agent with a fresh clone, the R2 snapshots and the DA token. It
should be able to follow this page without asking. The pass turns the style markers of ITA's DA documents (lh-ita)
into the theme's defaults and carriers. It runs in three steps, in this order, and never otherwise:

1. **The collapse pass on DA** (this page): download, collapse, check, back up, upload, preview, check. Nothing is
   published.
2. **The switch merged**: the user merges `token-free-ita-live` into main (`git merge --no-ff
   origin/token-free-ita-live`). ITA's theme goes live in code.
3. **Publish**: ITA's changed documents go live (below, "After the pass").

Until step 2 the preview of `main` shows ITA's collapsed documents with ITA's theme off, so they look wrong there.
The page checks below therefore read the switch branch's preview, which has the theme on. Live pages
(ita.turnsthe.page, `*.aem.live`) don't change until step 3.

## 1. The clone

```
git clone https://github.com/moved-permanently/lh-com.git && cd lh-com
git checkout main      # must contain 6d1bb8a0 (the collapse fix, the loss and page checks), 56b60faf (the theme rules)
                       # and the from-768 option (test/spacer-from-768-508.test.mjs: 33 of ITA's documents, from-768-check.md)
git merge-base --is-ancestor 6d1bb8a0 HEAD && git merge-base --is-ancestor 56b60faf HEAD && test -f test/spacer-from-768-508.test.mjs && echo ok
npm ci
```

- Node 20 or later.
- For the page checks: a Chromium for playwright-core (`npx playwright-core install chromium`, or `CHROMIUM_PATH=<chrome>`).
- The branch `token-free-ita-live` (head 76d8fd18: main at be71a181 merged in, with the from-768 option) must not be merged, checked out or changed by the harness. Its
  preview is all the harness uses: `https://token-free-ita-live--lh-ita--moved-permanently.aem.page`.
- The R2 snapshots are not needed for this pass (no import runs).
- During the pass no ITA re-import may run. ITA's theme is off on main, so an import would write markers again.

## 2. The documents

- DA site: org `moved-permanently`, site `lh-ita`. Source API: `https://admin.da.live/source/moved-permanently/lh-ita/<path>.html`,
  `Authorization: Bearer $DA_TOKEN`.
- The pass's documents: `tools/reports/token-free/census-lh-ita-paths.txt`, **2,195 paths**, the DA documents
  with markers (DA's own census, 2026-11-09). They are in release order: de/en, de/de, then the other markets, and
  each root's documents of the earlier workspace list come first.
  - The census: DA's whole tree read with `tools/importer/da-tree-read.mjs --site lh-ita` (GET only; 2,776
    documents, 23 MB, 3 minutes), then the collapse's dry run over it. For the documents the pass had already
    collapsed, the backups in `/.token-free-backup/2026-11-ita/` were used. It matches the harness's own census:
    2,195 documents, 22,198 markers.
  - The earlier list, `collapse-lh-ita-paths.txt` (2,083, the workspace's documents), lacks 112 of them. None of
    them is missing from DA. They are documents this workspace has no copy of:
    - /ve/en: 33;
    - profile/travel-id, its privacy policy and terms, profile/account-statement and profile/miles-and-more: nine
      roots each;
    - legal/passenger-rights, conditions-of-carriage-ita and baggage-assistance: four each;
    - lounges and accessible-travel: three each;
    - the login and registration pages (login, profile/login, registo, iscrizione, connexion, inicio-de-sesion):
      one `{spacer-N}` each, no H1;
    - more single pages.

    None of them needs to be left alone. Their markers are the common ones (`{full-width}` 2,937, `{heading-small}`
    234, separators 168, `{limited-width}` 94, `{heading-copytext-large}` 94, column marks 42). The loss and carrier
    checks pass on all 112: 78 gain nothing, the others 68 carriers in all, at most 4. 54 of them were uploaded by
    none of this workspace's upload states (2026-11-01). Their owner is unknown here, and their markers are the
    same kinds.
- A listed path that DA doesn't have is recorded and skipped. A DA document with markers that isn't listed is not
  touched: record it (`marker-collapse-cli.mjs --check` on it).

## 3. Phase A, local only (no DA writes): download, collapse, check, all 2,195 at once

The collapse must see all documents in one run. It rewrites links to another document's old heading ids, which is
only possible within the run. So collapse everything first, then upload in batches.

```
mkdir -p work/ita/before work/ita/after
# every path of the list: GET the DA source, saved byte for byte as work/ita/before/<path>.plain.html (DA's <body>…</body>)
node tools/importer/marker-collapse-cli.mjs --content work/ita/before --brand ita --force \
  --list tools/reports/token-free/census-lh-ita-paths.txt --out work/ita/after \
  --report work/ita/report.json --paths work/ita/changed.txt --pages work/ita/pages.jsonl
node tools/importer/collapse-loss-check.mjs --before work/ita/before --after work/ita/after \
  --list work/ita/changed.txt --out work/ita/loss.json
```

What the run must report (`work/ita/report.json`). These are DA's numbers from the census, the same dry run:

| | expected |
| --- | --- |
| documents changed | 2,195 (of 2,776 in the tree) |
| markers | 22,198: 20,974 theme (the marker goes), 1,224 as carriers, 0 for a person |
| marker left, not idempotent, errors | 0, 0, 0 |
| carriers written | 704: Section Metadata styles h2-compact 204, divider-below 67, small-print 23, space-m 22, h3-large 9, space-below-m 9; Spacer blocks 127, Spacer (from-768) 25, Spacer (l, from-768) 8, Divider blocks 117; block options title-large 40, title-compact 29, divider-above 19; the page's Headings row 3; form Default 2 |
| the loss check | 0 failed (`collapse-loss-check` exits 0). The documents that already had several H1s are listed as notes: 42. `carrier-check.mjs` (harness-pass-lufthansa.md, section 4): 0 failed. |

What a changed document gains: 0 for 1,816 of the 2,195; median 0, 95 % at most 2, at most 13 (the nine
terms-and-conditions-of-use pages). The from-768 documents: 33 carry such separators, 24 gain a Spacer (from-768)
block, and the other nine have only 25 px ones, which go. Per document class, from the workspace's earlier list
(the import reports' template):

| class | documents | carriers per document |
| --- | --- | --- |
| info | 1,980 | 0 for 1,643 of them (markers gone, nothing added); median 0, 95 % at most 2, at most 13 (the nine terms-and-conditions-of-use pages: their numbered chapters' Spacer and Divider blocks) |
| homepage | 67 | 0 for 59; at most 3 (space-m, space-below-l) |
| app-entry, flight-status, hub, others | 36 | 0 |

In every changed document:
- no `{…}` style marker is left; data placeholders such as `{origin}` stay;
- headings keep their level, and their ids lose the marker's part (`about-heading-small` becomes `about`);
- running text loses `{full-width}`, because ITA's theme is wide;
- a page with column marks gains the Metadata row `Theme: flow-spacing`;
- the carriers are only Section Metadata `Style` values, block options in a block's name (`Columns Media
  (title-large)`), Spacer / Divider blocks, and a form's Default column.

Stop before phase B if any row above is off. That means: a loss-check failure, a marker left, an error or a
document "for a person", carriers written more than 10 % above 704, or a document with more than 15 carriers.

## 4. Phase B, in batches: back up, upload, preview, check

The batches follow the paths file's order. The first batch is 20 documents, a canary with every check. After it come
100 documents per batch. Per batch:

1. **Back up in DA.** POST each document's original (`work/ita/before/<path>.plain.html`, as downloaded) to
   `/.token-free-backup/2026-11-ita/<path>.html` on the same DA site. Then GET it back and compare: it must be equal
   byte for byte. Keep `work/ita/before/` too.
2. **Read DA again before uploading.** If a document differs from `work/ita/before/` (someone edited it since phase
   A), don't upload it. Collapse it again on its own, check it, and record it.
3. **Upload** `work/ita/after/<path>.plain.html` as DA's source shape. The collapse writes a whole document
   (`<html><head></head><body>…</body></html>`); send the `<body>…</body>` part. GET it back: it must equal what was
   sent.
4. **Preview**: `POST https://admin.hlx.page/preview/moved-permanently/lh-ita/main/<path>` with the token the harness
   previews with today; it must answer 200.
5. **Page checks** on the switch branch's preview against the host's published page:
   ```
   node tools/importer/pass-widths.mjs --paths work/ita/batch-NN.txt --host https://ita.turnsthe.page \
     --preview https://token-free-ita-live--lh-ita--moved-permanently.aem.page --out work/ita/batch-NN-widths.json
   ```
   - The canary batch is checked at 1440 and 390 in full.
   - Each later batch runs the fast checks for every page (`--widths none`: preview 200, `.plain.html` 200, no
     `about:error`, one h1 where the published page had one), then widths for 10 of its pages: every page with
     carriers first, then the batch's first pages.
   - Flagged: more than 3 % off in height, or a heading more than 40 px off.

What is known and accepted (tools/reports/token-free/ita-pass-check.md, decisions.md). These pages can be flagged
without stopping the pass:
- **Running text over the whole width**: ITA's default; 488 two-thirds paragraphs become wide (airline-partners
  -7.6 % at 1440).
- **Column groups that end inside running text** lose their padding (cookie-policy -5.1 %, -405 px).
- **Separators of 0-31 px** go (youth -62 px).
- **Heading sizes one step from the default** take the default (check-in +42 px at 390).

### The stop rule

Stop means: finish the document in hand, start no new batch, and report. Stop on any one of these:

- a loss-check failure, or an uploaded document that doesn't read back equal;
- a preview or `.plain.html` that isn't 200 after one retry, or an `about:error`: more than 2 in a batch;
- a page whose published version had one h1 and whose preview doesn't;
- a page more than 10 % off, or with a heading more than 400 px off;
- more than 3 flagged pages in a batch's width sample that aren't one of the known kinds above (with a cause unlike
  A to D in ita-pass-check.md).

## 5. Rollback

For one batch or the whole pass:
1. POST each document's backup (`/.token-free-backup/2026-11-ita/<path>.html`, or `work/ita/before/`) back to
   `<path>.html`. GET it back: it must be equal.
2. Preview it again (`admin.hlx.page/preview/…`).
3. If the pass had already gone live (step 3 above):
   - first revert the switch: `git revert -m 1 <merge commit> && git push origin main`;
   - then publish the restored documents again (`POST https://admin.hlx.page/live/moved-permanently/lh-ita/main/<path>`).

Never publish collapsed documents while the switch is off on main.

## 6. After the pass

- **Report**: `work/ita/report.json`, `loss.json`, every batch's widths file, the skipped and re-collapsed paths, and
  DA's documents with markers that weren't listed.
- **The user merges** `token-free-ita-live`.
- **Publish** the changed documents (`admin.hlx.page/live/…`), 100 per batch, in the paths file's order. After each
  batch, run the fast checks on the host: `pass-widths.mjs --host https://ita.turnsthe.page --preview
  https://ita.turnsthe.page --widths none`.
- **Count what is left**: `node tools/importer/marker-census.mjs --site lh-ita` (step 4's census; it should show no
  ITA markers on live).

## The next brands: deltas

Every brand's switch branch is in place (the brief after 506; Air Dolomiti's since the brief after 520). Each merges
on its own after its pass, without conflicts. Every brand now has a page of its own with DA's census, which takes the
place of its row below: harness-pass-tap.md, -brussels, -austrian, -swiss (the brief after 520), -b2b, -cargo,
-airdolomiti (ema-adobe's, brief 531), -discover and -lufthansa. The brands helper's order after ITA: TAP, Brussels,
Austrian, SWISS, Group for Business, Cargo, Air Dolomiti. The table as it was:

| brand | DA site | paths file (documents) | switch branch | branch preview | host | expected carriers written | pass check |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Discover | lh-discover | DA's own list: the workspace's collapse-lh-discover-paths.txt has 24, the census finds 470 previewed documents with markers | token-free-discover-live | token-free-discover-live--lh-discover--moved-permanently.aem.page | discover.turnsthe.page | 6 (20 documents none, at most 2) | discover-pass-check.md, harness-pass-discover.md |
| TAP | lh-tap | DA's own list: the workspace's collapse-lh-tap-paths.txt has 0, but the census finds 156 previewed pages with `{blank}` (447) | token-free-tap-live | token-free-tap-live--lh-tap--moved-permanently.aem.page | tap.turnsthe.page | 0 (`{blank}` becomes a paragraph gap: theme) | tap-pass-check.md (ema-cashub's) |
| SWISS | lh-swiss | collapse-lh-swiss-paths.txt (21), -swiss-mk- (474) and -swiss-sub- (186), one pass | token-free-swiss-live | token-free-swiss-live--lh-swiss--moved-permanently.aem.page | swiss.turnsthe.page | 513 | swiss-, swiss-mk-, swiss-sub-pass-check.md |
| Austrian | lh-austrian | collapse-lh-austrian-paths.txt (1,893) | token-free-austrian-live | token-free-austrian-live--lh-austrian--moved-permanently.aem.page | austrian.turnsthe.page | 1,414 | austrian-pass-check.md |
| Brussels | lh-brussels | collapse-lh-brussels-paths.txt (1,070) | token-free-brussels-live | token-free-brussels-live--lh-brussels--moved-permanently.aem.page | brussels.turnsthe.page | 962 | brussels-pass-check.md |
| B2B | lh-b2b | collapse-lh-b2b-paths.txt (644; the census finds 679 previewed documents with markers) | token-free-b2b-live | token-free-b2b-live--lh-b2b--moved-permanently.aem.page | b2b.turnsthe.page | 773 | b2b-pass-check.md |
| Cargo | lh-cargo | DA's own list: no workspace list; the census finds 22 previewed pages with video settings (60) | token-free-cargo-live | token-free-cargo-live--lh-cargo--moved-permanently.aem.page | cargo.turnsthe.page | from that check | none yet |
| lufthansa.com (last) | lh-com | DA's own list, from lh-com-census-paths.txt (6,752 pages and 74 app screens) | token-free-lufthansa-live | token-free-lufthansa-live--lh-com--moved-permanently.aem.page | lufthansa.turnsthe.page | 17,683 for the workspace's 5,153 documents | lh-com-pass-check.md (ema-adobe's); its own page: harness-pass-lufthansa.md |

TAP's branch can merge now: ema-cashub's b848bbd5 no longer pins TAP's switch in test/tap-collapse-505.test.mjs.
With all nine branches merged onto main (65123e78) the token-free tests pass, TAP's included.
