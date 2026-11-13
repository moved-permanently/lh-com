# SWISS's collapse pass: result (local brand harness, 2026-11-09)

Run after [harness-pass-swiss.md](harness-pass-swiss.md). Collapse tool from main ace9e7ee (contains 54303323 and 61e81113); switch branch `token-free-swiss-live` 32f6b893 (main merged), not touched. Nothing published.

## Phase A (local, the 2,647 census documents downloaded from DA)

| | expected | got |
| --- | --- | --- |
| documents changed | 2,647 | 2,647 |
| markers | 19,417: 14,171 theme, 5,246 carriers, 0 for a person | 19,417: 14,171 / 5,246 / 0 |
| carriers written | 2,663 | 2,663 |
| marker left, not idempotent, errors | 0, 0, 0 | 0, 0, 0 |
| loss check | 0 failed; several-H1 notes 390 | 2,647 checked, 0 failed, 390 notes |
| carrier check | 0 failed | 2,647 checked, 0 failed |
| per document | 1,628 gain nothing, median 0, max 26 | 1,628, 0, 26 (/kr/ko/discover/swiss-senses/business and its ch/* copies) |

`<img>` tags before/after the collapse: identical on 2,634 of 2,647; the other 13 differ only in the escaping of an `&` in the alt text (equal after unescaping).

## Phase B (canary 20, then 26 x 100 and 27)

- Backup: every document to DA `/.token-free-backup/2026-11-swiss/<path>.html` (read back equal) and locally `notes/_backup/2026-11-09-swiss-collapse/lh-swiss/` (31 MB). Studio stopped the run twice (during batch 26 and again after it); batch 26 was resumed without backing up a second time (a document whose DA copy already equals the collapsed copy is only previewed), its backups verified equal to the census copies.
- **2,647 of 2,647** uploaded (read back equal), previewed 200. DA-changed since the census 0, other editors 0, errors 0, loss-check failures 0. Final read of DA: all 2,647 equal to the collapsed copy.
- **Picture check** (preview vs live media hashes, every batch): 2,647 equal to live, 0 differed, 0 pinned (SWISS's pictures are stable on preview). Final check over all 2,647: equal.
- Fast checks (preview 200, `.plain.html` 200, no `about:error`, h1): 0 problems on all 2,647.
- Width checks on the switch branch's preview vs swiss.turnsthe.page: 290 pages, 580 measurements (canary 20 pages in full, 10 pages per later batch). Median 0.0 %, 491 within 3 %, 578 within 10 %.
  - Raw readings over 10 %: /br/pt/pix at 1440 (+73.5 %, a measurement artifact; re-measured within 10 %) and /br/pt/local-page/ski-campaign-2026 at 1440 (+10.5 %, re-measured under 10 %). No page stays above 10 %.
  - Heading offsets above 400 px: /ch/*/discover/swiss-senses/business (-419 px, height -2.3 %; the document with 26 carriers) and /ch/{de,el,fr,it,ja}/fly/flight-information/swiss-app (heading -426 to -616 px, height -3.9 to -6.9 %). swiss-app carries 2 column views (column-start/end with heading-small) and 7 separator markers that become the theme's defaults (3 x spacer-25, 2 x spacer-80, 1 each of 60, 40, 20); the pass adds 2 Section Metadata styles, a Spacer block and a column-view option. It is the theme's column view and separators, not a loss (loss check passes). For information; included in the publish list.
- Stop rule: not triggered.

## Publish

Master list (release order, 2,647 paths): `swiss-publish-collapse.txt` (same folder); per-batch lists `work/swiss/publish-swiss-collapse-batch00..27.txt` (28 files). Staged only for the switch merge, published by the round right after.

## Rollback

POST each document's backup back (DA `/.token-free-backup/2026-11-swiss/<path>.html` or the local folder), preview; if live already has the collapsed documents, revert the switch first.
