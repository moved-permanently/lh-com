# TAP's collapse pass: result (local brand harness, 2026-11-09)

Run after [harness-pass-tap.md](harness-pass-tap.md). Collapse tool from main 3891be5a (contains 54303323 and 61e81113). Nothing published; the switch branch `token-free-tap-live` was not touched.

## Phase A (local, 156 census documents downloaded from DA)

| | expected | got |
| --- | --- | --- |
| documents changed | 156 | 156 |
| markers | 447, all theme | 447 theme, 0 carriers, 0 for a person |
| marker left / not idempotent / errors | 0 / 0 / 0 | 0 / 0 / 0 |
| loss check | 0 failed | 156 checked, 0 failed, 0 several-H1 notes |
| carrier check | 0 failed | 156 checked, 0 failed |
| from-768 | 0 | 0 |

## Phase B (batches: canary 20, then 100 and 36)

- Backup: every document to DA `/.token-free-backup/2026-11-tap/<path>.html` (read back equal) and locally `notes/_backup/2026-11-09-tap-collapse/lh-tap/` (12 MB).
- 156 of 156 uploaded (read back equal, checked again at the end: DA equals the collapsed copy for all 156), previewed 200. DA-changed since the census: 0 (no other editors). Errors 0, loss-check failures 0.
- Fast checks (preview 200, `.plain.html` 200, no `about:error`, h1 count) on all 156: 0 problems.
- Width checks on the switch branch's preview (token-free-tap-live) against tap.turnsthe.page at 1440 and 390: 40 pages, 80 measurements (canary 20 pages in full, 10 each in the later batches). Height: median +0.4 %, range -0.9 % to +2.1 % (largest: en-pt/pt-pt donate-miles at 1440), none above 3 %. One -98.7 % reading (/pt-pt/destinos/inspire-se at 1440) was a measurement artifact; re-measured it is within 1 %.
- Heading offsets above 40 px on 42 of the measurements (max 372 px, on the inspiration page and its category fragments, which stack many accordion paragraph gaps; page height is equal): the accepted cause, the paragraph gap that replaces a blank line. None above 400 px.
- Over-10 % pages: none. Stop rule: not triggered.

## Publish

Master list (release order, 156 paths): `tap-publish-collapse.txt` (same folder); per-batch lists in the harness workspace `work/tap/publish-tap-collapse-batch00|01|02.txt`. The documents are staged only for the switch merge, published by the round right after.

## Rollback

POST each document's backup back (DA `/.token-free-backup/2026-11-tap/<path>.html`, or `notes/_backup/2026-11-09-tap-collapse/lh-tap/`), preview, and if live already has them revert the switch first.
