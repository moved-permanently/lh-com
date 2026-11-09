# Brief 518, the 40 SWISS homepages that waited for a capture: uploaded and previewed, not published

Snapshots: swiss-snapshots-047 (R2 drop, sha256 e47d7df1...cf28, 41 pages, manifest sha256 checked), 40 of the 40 listed `# wait (capture)` homepages. Importer swiss-import.mjs at origin/main f8349f2a.
Method as job C (result-518-swiss-homepages): DA's copy; the footer note, its paragraphs and the dialog link come from the import. On these pages the import's destination finder has no trailing Conditions row (DA has one), so DA's finder row stays and the span from the footer note to the section's end (the note, the "Allgemeine Bedingungen" label, the conditions paragraphs of the page flow) is replaced by the import's note and the link to the dialog document. Per page word check: every word dropped is in the root's dialog document or the new note: 38 of 38 pass, 0 held.

- 38 dialog documents (new, all 404 in DA before) uploaded and previewed first: /<cc>/<ll>/fragments/modals/<label> for the roots of the 38 homepages.
- 38 homepages patched, uploaded, previewed, read back equal 38/38, preview 200, no about:error. Picture check (picture-check.py, standing step): 40 of 40 ok, pictures equal DA's (src and alt, in order), 0 www-hosted pictures on preview.
- 2 homepages unchanged, not uploaded: no footer disclaimer on www (the two without a dialog).
- Rendered 1440 / 390, preview vs live: /us/de 4,176 / 5,145 vs 4,335 / 5,659; /ch/en 4,227 / 5,194 vs 4,231 / 5,224; /ru/ru 4,148 / 5,345 vs 4,308 / 5,906 (the conditions text leaves the page flow).
- The Bengaluru promotion of the snapshots (28 of 41) is not applied: only the fares text, note and dialog link are taken from the import.
Backup: notes/_backup/2026-11-09-job4-swiss-homepages/ (40 homepages 200, 38 dialog paths 404). Allowlist: +38 dialog paths.
