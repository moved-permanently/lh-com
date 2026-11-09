# ITA's collapse pass, the harness's result (2026-11-09, lh-ita, harness-pass-ita.md; nothing published)

**All 2,195 documents of the census (census-lh-ita-paths.txt, DA's own tree) are collapsed, uploaded and previewed**: 0 held, 0 not attempted, 0 errors, 0 loss-check failures, 0 documents changed in DA between the census and the upload, 0 edits by anyone but benp@adobe.com (the version lists of all 2,195 were read: no other editor; no mail needed).

| | |
| --- | --- |
| DA documents read (whole tree) | 2,776 (2,195 with markers) |
| markers | 22,199: theme 20,975, carriers 1,224 (704 written), for a person 0, left 0, not idempotent 0, errors 0 |
| loss check (all 2,195) | checked 2,195, failed 0, 42 documents with several H1s before (notes) |
| batches | canary 20, 22 batches of 100 (the last 42), the 33 from-768 documents last (the switch branch had main merged, 14:43 CET) |
| per document | backed up in DA (/.token-free-backup/2026-11-ita/<path>.html, read back equal) and in notes/_backup/2026-11-09-ita-collapse/; uploaded (read back equal); previewed 200 |
| fast checks (200, .plain.html, about:error, one h1), 2,179 documents on the switch branch's preview | 1 problem: /fr/fr/support/utilities/discount-code showed about:error: its picture is a www.ita-airways.com transform URL that www no longer serves to the preview (before, after and live have no about:error; live holds the media bus file). Fixed: the src switched to ./media_16172ffe13bad42bdd4de83982a086d8e22ccaf4c.jpg (live's own reference), re-uploaded and previewed: 0 about:error |
| width checks (10 pages a batch, 1440 + 390) | 240 pages, 477 measurements, 178 flagged (> 3 % or a heading > 40 px; the known kinds: running text wide, separators of 0-31 px gone, heading gaps) |
| over 10 % after the by-hand re-measure | 1 page: /it/en/legal/terms-and-conditions-of-use, +10.8 % at 390 (host 17,750 vs preview 19,659 px), 13 Spacer blocks (the 13 {spacer-40}); the nine terms pages carry 13 Spacer blocks each (only it/en was in a width sample). One more entry in over10.tsv, /it/it/.../entertainment-on-board @1440 (+52.6 %), was the host measured before it rendered: re-measured 4,051 vs 4,054 px (+0.1 %). They are in the publish list like all others (nothing is left at preview) |
| the from-768 documents (33) | on the branch with main merged: width sample 10 pages, at most 3.5 % off the host's height |
| collapse tool | main at 1095e07d (54303323: marks inside block cells): re-run over all 2,776: one document differs from the first run, /xx/en/book-and-prepare/group-travel-and-charter/group-travel ({copytext-small} in a form note label), uploaded with the new tool's output |

Publish: publish-ita-collapse.txt (2,195 paths in the census's release order) and publish-ita-collapse-batchNN.txt per batch (00-22, 768). The collapsed documents are for the switch merge (token-free-ita-live into main) and then the publish rounds; until the merge the preview of main shows them with ITA's theme off.

Rollback: POST /.token-free-backup/2026-11-ita/<path>.html back to <path>.html and preview again.
