# Brussels Airlines's collapse pass, the harness's result (2026-11-09, lh-brussels, harness-pass-brussels.md; nothing published)

**All 1,252 documents of the census (census-lh-brussels-paths.txt, DA's own tree) are collapsed, uploaded and previewed**: 0 held, 0 errors, 0 loss-check failures, 0 edits by anyone but benp@adobe.com (every document's version list was read in its batch: no other editor, no mail needed).

| | |
| --- | --- |
| DA documents read (whole tree) | 1,898 (1,252 with markers, none unlisted) |
| markers | 7,221: theme 5,605, carriers 1,616 (1,085 written), for a person 0, left 0, not idempotent 0, errors 0. The census said 7,119 (5,473 + 1,616 + 30 for a person): the 30 captions under paragraphs with two photos now take the theme's small-copy paragraph (61e81113), and 102 more theme markers come from the marks in block cells (54303323) |
| carriers written | 1,085, rows as the census (Spacer 365, Divider 99, Spacer (from-768) 11, Spacer (l) 9, wide-text 114, padded 105, ...); at most 11 in a document |
| loss check / carrier check (all 1,252) | 0 failed / 0 failed; 29 documents with several H1s before (notes, several-h1.txt, the collapse keeps every H1) |
| batches | canary 20, 12 x 100, 1 x 32 (14 batches): each document backed up in DA (/.token-free-backup/2026-11-brussels/<path>.html, read back equal) and in notes/_backup/2026-11-09-brussels-collapse/, uploaded (read back equal), previewed 200 |
| fast checks (200, .plain.html, about:error, one h1), all 1,252 on the switch branch's preview | 0 problems |
| width checks (canary 20 in full, then 10 pages a batch; 1440 + 390) | 150 pages, 300 measurements, 183 flagged (> 3 % or a heading > 40 px: the known kinds, our-company +80 px heading (a card's link line), small separators, heading gaps) |
| over 10 % after the by-hand re-measure | 1 page: /be/fr/special-care/families-and-children/baby-and-child-equipment/child-restraint-devices, -12.3 % at 1440 (host 1,756 vs preview 1,540 px), no Spacer block (over10.tsv). The other -11 to -13 % readings (airport-info, lounges, travel-classes, lufthansa-group, special-care, flying-with-us, all with a heading -40 px) were the host measured before it rendered: re-measured within 10 %. All are in the publish list |
| 30 captions a person must place | the three travel articles (the-gambia 6, the-ultimate-itinerary-in-kenya 3, vibrant-senegal 1, each in en/fr/nl): set in italics as the marker did |
| from-768 | 35 separators in 9 documents: 24 go, 11 become Spacer (from-768) |
| DA equals the collapsed copy at the end | 1,244 of 1,252; the other 8 were changed in DA after the census by the Cargo-stories helper (online-check-in-options in be/en, be/fr, be/nl, de/de, it/it, es/es: the check-in option as www's; /be/en/plan-your-trip/travel-regulations: one Spacer; /be/en/articles/the-gambia: space-m): DA's collapsed copy plus ema-cashub's importer delta, collapsed with the same tool, loss check 0 (state a46f95f7, notes/_backup/2026-11-09-brussels-536/). They stay as they are and are in the list |

Publish: publish-brussels-collapse.txt (1,252 paths in the census's release order) and work/brussels/publish-brussels-collapse-batchNN.txt per batch (00-13). Until the switch merge (token-free-brussels-live into main) the preview of main shows the collapsed documents with Brussels's theme off.
Rollback: POST /.token-free-backup/2026-11-brussels/<path>.html back to <path>.html and preview again (the 8 above: notes/_backup/2026-11-09-brussels-536/ for their state before the 536 re-import).
