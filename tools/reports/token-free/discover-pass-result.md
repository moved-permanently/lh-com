# Discover's collapse pass: result (local brand harness, 2026-11-09)

Run after [harness-pass-discover.md](harness-pass-discover.md). Collapse tool from main ace9e7ee (contains 54303323 and 61e81113); switch branch `token-free-discover-live` dcdaeb53 (main merged), not touched. Nothing published.

## Phase A (local, DA's whole tree)

- Census: DA's tree listed and read with the harness's own GET client (`da-tree-read.mjs` sends no Authorization header, so it got 401): **617 documents** in lh-discover. The collapse ran over all 617 in one run (`--brand discover --force`).
- **491 documents changed**, 126 carry no marker. Markers 4,575: 4,281 theme, 294 carriers (271 written), 0 for a person. Left 0, not idempotent 0, errors 0.
- Loss check: 491 checked, 0 failed, 0 several-H1 notes. Carrier check: 491 checked, 0 failed. At most 4 carriers on a page; 153 pages gain carriers.
- from-768: 5 separators in 4 documents (accessibility-statement de/de, de/en, xx/fr; us/de customer-service); the tool converts them.
- The pass list is the changed paths in release order (de/en, de/de, then the others).
- `<img>` tags before and after the collapse: identical on 491 of 491 (the collapse never touches pictures).

## Phase B (canary 20, then 4 x 100 and 71)

- Backup: every document to DA `/.token-free-backup/2026-11-discover/<path>.html` (read back equal) and locally `notes/_backup/2026-11-09-discover-collapse/lh-discover/`.
- **491 of 491** uploaded (read back equal), previewed 200. DA-changed since the census 0, other editors 0, errors 0, loss-check failures 0. Final read of DA: 485 equal to the collapsed copy, 6 equal except picture references (see next).
- **Picture check** (new standing check after the star-alliance finding; all 491 documents reference `www.discover-airlines.com` pictures, which a preview fetches again): preview vs live media hashes per document. 6 documents differed (atlantic-canada and calgary in de/en, de/de, xx/fr: 2 pictures each batch-wise); each was pinned to live's `./media_<hash>` references (+ `#width/#height`), read back, previewed, and re-checked equal. Final check over all 491: **491 equal to live**.
- Fast checks (preview 200, `.plain.html` 200, no `about:error`, h1): 0 problems on all 491.
- Width checks on the switch branch's preview vs discover.turnsthe.page: 70 pages, 139 measurements (canary 20 pages in full, 10 per later batch). Median -2.3 %, 133 within 10 %, 69 within 3 %. Raw readings over 10 % (6): /de/en/wildlife-and-nature at 1440 (-100 %) and /xx/en/homepage at 390 (+129.5 %) were measurement artifacts (re-measured within 10 %); electronic-bag-tags -6.9 %, discover-usa +7.1 % and us/de customer-service -8.2 % re-measured under 10 %; **express-rail** (/de/en and /xx/fr, 1440): -10.0 % (host 5,583 px, preview 5,024), heading -575 px. It carries 9 column marks (column-start/end-outer with heading-small) and no Spacer: the theme's column view, not a loss (loss check passes). Heading offsets above 400 px: express-rail x2 and us/de customer-service (-428 px, same family). Listed in `work/discover/over10.tsv` for information and included in the publish list.
- Stop rule: not triggered.

## Publish

Master list (release order, 491 paths): `discover-publish-collapse.txt` (same folder); per-batch lists `work/discover/publish-discover-collapse-batch00..05.txt`. Staged only for the switch merge, published by the round right after.

## Rollback

POST each document's backup back (DA `/.token-free-backup/2026-11-discover/<path>.html` or the local folder), preview; if live has them, revert the switch first.
