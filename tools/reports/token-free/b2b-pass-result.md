# Lufthansa Group for Business's collapse pass, the harness's result (2026-11-09, lh-b2b, harness-pass-b2b.md; nothing published)

**All 679 documents of DA's own census are collapsed, uploaded and previewed**: 0 held, 0 errors, 0 loss-check failures, 0 edits by anyone but benp@adobe.com (every version list read in its batch: no other editor, no mail needed), 0 documents changed in DA between the census and the upload.

| | |
| --- | --- |
| DA documents read (whole tree) | 733 (679 with markers; the Theme row is in DA's source, so the collapse took the 729 flow pages for flow pages) |
| markers | 5,708: theme 3,588, carriers 2,120 (854 written, the guide's 853 plus one), for a person 0, left 0, not idempotent 0, errors 0 |
| carriers per document | at most 16 (/xx/en/program/experts/special-assistance-and-services, /de/en/program/experts/...): within the user's limit of 17 |
| loss check / carrier check (all 679) | 0 failed / 0 failed; 58 documents with several H1s before (notes, several-h1.txt) |
| batches | canary 20 in full, 6 x 100, 1 x 59 (8 batches): each document backed up in DA (/.token-free-backup/2026-11-b2b/<path>.html, read back equal) and in notes/_backup/2026-11-09-b2b-collapse/, uploaded (read back equal), previewed 200 |
| fast checks (all 679 on the switch branch's preview) | 2 problems, not from the collapse: /al/de and /al/en/the-sounds-of-wellbeing/continent-america-africa show `about:error` pictures (www picture URLs the preview cannot fetch); the pictures are identical before and after, and the live host b2b.turnsthe.page has the same `about:error`. In the list; a content question for the pictures' owner |
| width checks (canary 20 in full, then 10 pages a batch; 1440 + 390) | 90 pages, 180 measurements, 84 flagged (> 3 % or a heading > 40 px; none above 10 %): 0 pages over 10 %, over10.tsv empty |
| DA equals the collapsed copy at the end | 679 of 679 |

Publish: publish-b2b-collapse.txt (679 paths in the census's release order) and work/b2b/publish-b2b-collapse-batchNN.txt per batch (00-07). Until the switch merge (token-free-b2b-live into main) the preview of main shows the collapsed documents with B2B's theme off.
Rollback: POST /.token-free-backup/2026-11-b2b/<path>.html back to <path>.html and preview again.
