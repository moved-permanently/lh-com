# reimport-530-b2b-nested: the nested column view as columns-media (nested) on the two B2B documents: uploaded and previewed, not published

Snapshots: b2b-snapshots-010 (R2 drop, sha256 be8f4246...ccda0, manifest sha256 checked), 2 of 2, 200. Importer b2b-import.mjs at origin/main 98dd7f61 (contains 00dcd156). Recordings b2b-parity-002 (sha256 77ebf729...a07f) available.
Method as the other re-imports: DA's copy plus the delta of commit 00dcd156 (import of the same snapshot at the commit before and at the commit), DA's metadata block verbatim. The delta is one class: `columns-media` becomes `columns-media nested` on both documents. 0 words lost.
- /de/en/travel-solutions/lufthansa-group-airlines and /de/de/travel-solutions/lufthansa-group-airlines uploaded, previewed; read back equal 2/2, preview 200, one h1, no about:error, media 200.
- Rendered 1440 / 390, preview vs live: de/en 4,063 / 5,336 vs 4,132 / 5,336 (-69 px as the brief's 4,108 to 4,039); de/de 4,073 / 5,456 vs 4,142 / 5,456 (the brief's 4,142 to 4,073; www 4,071). 390 unchanged.
Backup: notes/_backup/2026-11-09-job6-b2b-nested/ (2 x 200).
