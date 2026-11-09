# Recordings for the 8 campaign re-imports (brief 515 item 4)

ema-adobe, 2026-11-09. For the comparison after the harness imports
[reimport-507-campaign-lh-com.txt](../parity-2026-11-08/reimport-507-campaign-lh-com.txt) (frankfurt-fair and
most-significant-route on four roots; after ITA's pass). Checked on this machine; nothing fetched.

| document | recording | widths (page height) | taken |
| --- | --- | --- | --- |
| /de/en/frankfurt-fair | lh-parity-002c: `logs/b460/lh-parity-002c/tools/source-export/pages/de/en/frankfurt-fair/` (screenshot.png, screenshot-768.png, screenshot-390.png, capture.json) | 1440 (3,524), 768 (4,107), 390 (5,310) | 2026-11-06 04:08 UTC |
| /de/en/most-significant-route | lh-parity-002c: `logs/b460/lh-parity-002c/tools/source-export/pages/de/en/most-significant-route/` (the same four files) | 1440 (2,583), 768 (2,457), 390 (2,783) | 2026-11-06 04:08 UTC |
| /de/de/frankfurt-fair, /at/de/frankfurt-fair, /gb/en/frankfurt-fair | none | - | - |
| /de/de/bedeutsamste-strecken, /at/de/bedeutsamste-strecken, /gb/en/most-significant-route | none | - | - |

- The archive: `logs/b460/lh-parity-002c/lh-parity-002c.tar.gz` (sha256 `e29026fe5688d0afd4d7…`), unpacked beside it;
  `logs/b470/pages-lh.tsv` lists both pages with their recording paths (the rows the sweeps use).
- The six documents without a recording are in no capture archive here (lufthansa-parity-001, lh-parity-002a-d, -003,
  lh-snapshots-061, s062, s085 checked). They have Bright Data HTML snapshots only (tools/importer/bd-snapshots,
  2026-10-21: the import's source, no picture). Their comparison after the re-import can be: (a) the drafts against the
  published page on lufthansa.turnsthe.page (the same document before and after); (b) gb/en against de/en's recording
  as a stand-in (the same English text and layout on www; not a recording of gb/en); (c) a capture of the six, which needs
  a request to www: yours to ask for, not taken.
- Measured before the re-import, on drafts of the de/en documents (brief 507): frankfurt-fair 16.9 -> 7.5 % at 1440,
  8.0 -> 7.1 % at 390; most-significant-route 18.3 -> 10.5 % and 9.2 -> 6.8 %.
