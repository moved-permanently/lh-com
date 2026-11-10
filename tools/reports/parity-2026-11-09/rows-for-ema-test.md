# Rows for ema-test from ema-lufthansa

Things found in ema-lufthansa's brands that sit in ema-test's files (scripts/style-markers.js, scripts/token-free.js,
tools/importer/marker-collapse.mjs and its CLI). ema-lufthansa does not change those files; each row says what was
found, the evidence and what would follow www.

## 1. ITA: the headings of www's column views are heading-small (2026-11-10)

- **Found:** ITA's two-column headings render at 36 px where www's are 28 (/it/en/support/utilities/invoicing, "Flight
  Certification"; the "Related" headings over the teaser rows). The size is lost on purpose in the import's last step:
  marker-collapse.mjs (THEMES.ita live) turns a size one step from the level's default into the default (decision D
  of tools/reports/token-free/ita-pass-check.md). Shown with an offline test import of the recording's page
  (ita-parity-004, ita-import.mjs mappedOf, import-info.bundle.js, every request aborted): the columns-media parser
  keeps www's h2.heading-small, the document comes out without a marker.
- **Evidence:** ita-parity-004 and -003: 12 of the 13 headings inside www's two/three/four-column views (teaser titles
  left out) are heading-small (9 H2s on 9 pages: "Related", "Flight Certification", …; 3 H3s on the Miles & More
  page); one H3 is heading-medium. More pages are on capture-list-585-brands.txt (A, 22 pages).
- **What would follow www:** a context default for ITA's column views: an H2 (and H3) in a column view in heading-small.
  On the rendered page that is two places: (a) a heading in a Columns Media block's text, (b) the section's own heading
  right before a Carousel Cards grid ("Related"). ema-lufthansa's ITA theme covers (a) for unmarked headings from
  ITA row 31 on (a block's headings get no default class at runtime); (b) gets its heading-medium class from
  token-free.js applyThemeRules, which the theme cannot tell from an authored one, so it is left to THEMES.ita.
