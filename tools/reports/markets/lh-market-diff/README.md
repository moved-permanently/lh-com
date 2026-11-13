# lufthansa.com market comparison: offline results (2026-11-10)

Offline results of the comparison of 134,000 fetched www.lufthansa.com pages (market roots against their language versions). Everything here is read from these files; **nothing in this folder needs access to www.lufthansa.com**, DA or any airline host.

## Files

| file | what |
| --- | --- |
| `rulings.md` | the rulings: classes, rules (D1, W1, L1, R1 to R3b, W2 to W4), evidence, what needs importer work, what stays unruled. Read sections 3 and 4 first |
| `decisions-log.txt` | the decisions behind the rulings, in order |
| `rulings-stats.json` | counts per class and per rule |
| `import-rows.tsv` | the 254 import rows, all columns except `fetched_body` (that column pointed into a private folder on the analysis Mac) |
| `import-rows-importer-work.tsv` | the 62 rows that need importer work first (shared variant 25, markets section on a version page 23, widget setting 14), same columns |
| `evidence/<root>/<page>.txt` | the comparison evidence text of those 62 rows (59 files: three root/page pairs occur in two rows each). For a version-page row (root de/de, de/en, xx/ru, xx/es, xx/fr) the file is the evidence of one covered root against that version page (a covered root from `markets` when one exists). Full files, no cut: the total is far below 3 MB |
| `../../markets/capture-lists/lh-com-own-documents-priority1.txt` | the 93 priority-1 own-document rows as a capture list: www_path, root, da_path, version page it differs from |

## Counts (rulings.md)

7,454 compared difference pairs: IGNORE date format 4,818, IGNORE promotion teaser 466, IGNORE link only 191, IGNORE media only 56, IGNORE meta only 7, IGNORE time-bound drift 0, MARKETS SECTION on a version page 1,548, SHARED VARIANT 109, OWN DOCUMENT 192, WIDGET SETTING 65, NOT RULED 2. The review list (1,011 pairs): IGNORE link only 997, NOT RULED 14. These become 254 import rows: own document 192, shared variant 25, markets section on a version page 23, widget setting 14; by priority 130 / 20 / 104 (1 = the 46 priority roots, 2 = other complete roots, 3 = partial roots). 128,859 of 205,068 pairs were compared (63 %).

## import-rows.tsv columns

`priority` (1 to 3), `root` (market root, e.g. pt/en), `da_path` (DA path the document gets; for a shared variant the first root of the group), `action` (own document | shared variant | markets section on a version page | markets section (widget setting)), `markets` (root list for a shared variant or widget setting), `roots_covered` (number of roots the row stands for), `version` (the language version page the root differs from, e.g. ae/en), `page` (path without root), `template` and `template_source` (page type and how sure: page-templates.json, same page on another locale, or heuristic), `importer` (what is needed), `www_path` (page on www), `archive` (capture archive holding it, if any), `archive_of` (root page or version page).

## Removed or changed

- `fetched_body` column dropped from both TSV files (private path).
- No line was removed from any copy: grep for email addresses, `cookie`, `/Users/`, `Bearer` and `api key` found nothing. Plain matches of the word "token" (in diff headers "from token 44") and `@` (HTML attribute names in the evidence) are not credentials and stay.
- `rulings.md`, `decisions-log.txt` and `rulings-stats.json` are copied unchanged; they mention the analysis folders (`lh/run/bodies`, `compare/`) by name only. Those bodies (1.9 GB), the classifier's data and the run folder are not part of this repo.
