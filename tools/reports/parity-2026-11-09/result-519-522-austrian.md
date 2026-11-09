# Austrian re-imports 519 (carousel titles) and 522 (tab columns): uploaded and previewed, not published

Snapshots: the 32 pages' own snapshots from austrian-snapshots-001, -002, -005 to -015 (R2 drop, 13 archives, sha256 checked against deliveries). Importer austrian-import.mjs at origin/main 44a93d74.

Main's import differs from DA's older copies by much more than the two briefs (hero-banner, column markers, no-break spaces, fragment-slides, card link lines), so each document is DA's copy plus the delta of the brief's own change: the same snapshot imported at the commit before and at the commit (d6517227 for 519, 762510ab for 522), 3-way line merge into DA's body, DA's metadata block verbatim.

- 519, premium-economy-class at/en, at/de: four slide titles (h3 "Luxurious extras" ... "More Comfort in Every Detail") above their texts; uploaded.
- 519, the ten culinary-services copies: the import is identical before and after the change (www's slides have no headline component): not uploaded, unchanged.
- 522, online-check-in (10 languages): the Tour Operator Booking tab's text and picture as a columns-media; uploaded.
- 522, travelling-with-animals (10 languages): the cabin-pets, two-pets and carrier tabs' text and picture as columns-media, plus the no-break spaces the same commit carries; uploaded. Tool bug found: the info bundle at 762510ab drops the carrier picture's caption ("Maximum 8 kg (pet incl. soft travel carrier)", `{caption}`) in the new columns-media cell; the caption is re-inserted from DA's copy on all ten (0 words lost). The bundle needs the caption kept in a columns-media picture cell.

Read back equal 22/22, preview 200, no about:error, media 200. Rendered 1440 / 390 (preview vs live): premium-economy at/en 5,653 / 5,771 vs 5,590 / 5,699; animals at/en 6,029 / 8,377 vs 6,000 / 8,208 (text and carrier picture side by side at 1440); online-check-in at/en 4,198 / 5,495 vs 4,310 / 5,535.
Backup: notes/_backup/2026-11-09-job2-austrian-519-522/ (32 x 200).
