# Brussels re-imports 519 (card links) and 522 (fact columns): uploaded and previewed, not published

Snapshots: brussels-snapshots-001, -002, -004 to -010 (R2 drop, sha256 checked), 20 of the 24 listed pages. Importer brussels-import.mjs at origin/main ba060f72.
Method as the Austrian re-imports (result-519-522-austrian.md): DA's copy plus the delta of the brief's own commit (import of the same snapshot at the commit before and at the commit: 8247a50f for 519, 4ce3096f for 522), 3-way line merge, DA's metadata block verbatim.

- 519 card links, 14 documents (be/en + be/fr jobs; connecting-africa and our-company in be/en, be/fr, be/nl, de/de, es/es, it/it): each card's link line after its description ("Fasten up for perks", "Entdecken Sie unsere Reiseziele!", ...); uploaded. 0 words lost.
- 522 fact columns, 6 documents (new-destinations in be/en, be/fr, be/nl, de/de, es/es, it/it): the destination facts as columns-media of label and value pairs instead of stacked h4; uploaded. The only difference in DA's words is the style token `column-spaced` of the closing marker `{column-end column-spaced}`, which the commit's import writes as `{column-end}` with the new `{column-start-outer}` / `{column-end-outer}` markers.
- Not imported (no snapshot): /bf/en and /bf/fr connecting-africa and our-company (the bf root's own copies were never captured; they are not on capture-list-austrian-brussels.txt): work/local-import-brands-b/no-snapshot.txt.

Read back equal 20/20, preview 200, one h1, no about:error, media 200. Rendered 1440 / 390 (preview vs live): be/en jobs 2,068 / 3,136 vs 2,012 / 2,968; be/en our-company 5,052 / 8,638 vs 4,884 / 7,966; be/en new-destinations 3,824 / 4,249 vs 4,185 / 4,041; de/de connecting-africa 4,005 / 7,685 vs 3,942 / 7,461.
Backup: notes/_backup/2026-11-09-job3-brussels-519-522/ (20 x 200).
