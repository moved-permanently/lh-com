# Cargo transport stories re-import (job stories-422), result of 2026-11-09 (harness run, times CET)

Snapshots: R2 archives cargo-snapshots-006 to -014 (prefix cfMvBgDxLdLhJcuXIBy-8_iZ), archive sha256 and every page's sha256
from the manifests checked (740 of 740). The list has 745 URLs: 740 captured, 5 answer 404 on www.
Method: main's cargo-import.mjs (a3341ed6, contains 72026ccf; no marker collapse for Cargo), `--known-from` DA's copies, the www
pictures DA has no copy of dropped (the 62 files are in stories-422-www-only-pictures-dropped.txt; 59 of them are the files www
answers 404 for, see work/local-import-brands/capture/media-404.txt), then `da-upload.mjs --sink` (the exact upload body, no request
to DA) compared byte for byte with DA's current copy.

Result: 740 of 740 documents are byte-equal to DA's copy, so nothing was uploaded, previewed or put on a publish list (batches of
100 in list order: b01-b07 = 100 each, b08 = 40). DA already holds what the importer writes today from today's captures; the visible
text of the import also equals the text of the page on aem.page (740/740), and aem.page equals aem.live byte for byte (740/740),
so nothing is waiting between DA, preview and live either.

Checks on the 740 pages as they are on aem.page: HTTP 200, one h1, no about:error, no picture hosted on www in DA's copies. Render
sample (headless Chrome, 1440 and 390, 10 pages: one per batch plus two): 20 of 20 renders, 0 broken pictures, no about:error, one h1.

The 5 pages that answer 404 on www have no DA document, no preview and no live page (DA 404 / 404 / 404), so there was nothing to leave
alone: de/news/aenderungen-im-vorstand-der-lufthansa-cargo-zum-1-august-2018-geplant, continent-of-opportunities-21,
cool-cooler-opticooler-9, it-does-fly-54, lufthansa-cargo-erhaelt-oekoglobe-preis (www URLs in the list's .tsv).
