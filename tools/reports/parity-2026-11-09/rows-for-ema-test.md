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

## 2. Discover: column-view heading sizes are mixed on www (2026-11-10)

- **Found:** /de/de/discover/services-on-board/entertainment +5.9 % at 390: www's column-view H3s are
  heading-copytext-large (16 px bold at 390), ours render 22 px light (the Columns Media block's heading size), the H2s
  heading-small on www (22 px), ours 28. The markers that carried the sizes went in the collapse (one step from the
  default, decision D).
- **Evidence:** discover-parity-001, headings in www's two/three/four-column views (teaser titles left out): H3 34
  heading-copytext-large, 10 heading-small (all on customer service); H2 22 heading-copytext-large, 12 heading-small.
  A single theme size helps some pages and hurts others (customer service at 390 -188 -> -276 px with copytext-large).
- **What would follow www:** keeping www's size where it is not the block's default (a marker, or a block option the
  collapse writes), rather than one default for all column-view headings.


## 2. Brussels: www's empty paragraphs in rich text, about 16 px each, dropped by the import and not carried by the collapse (from ema-cashub, 2026-11-11)

- **Found:** in the rich text of www's Brussels pages an empty paragraph (`<p></p>`, no no-break space) still takes about
  16 px. On /be/en/legal-notices/short-notice-eu-us (brussels-parity-007, 1440) the first paragraph ends at 481 px and the
  next starts at 541 (60 px) with two `<p></p>` between them; ours 28 px (no empty paragraph). The import drops them
  (helix-importer's preprocessing drops empty paragraphs; `nbsp-guard.mjs` emptyLineSpacers only takes `<p>&nbsp;</p>`), and
  a spacer marker of 31 px or less would not survive marker-collapse.mjs either (collapseSeparators: `px <= 31` is size
  none, removed).
- **Evidence, the four pages where it shows** (ours on brussels.turnsthe.page against brussels-parity-007 at 1440; the
  test was www's 938 px text column for the sidebar-h1 sections' text, which takes the pages' extra wrapping away and
  leaves what the missing spacing costs):

| page | `<p></p>` outside panels on www | 1440 now | with www's text column |
|---|---|---|---|
| /ao/fr/legal-notices/aviation-services-law | 3 | -1.2 % | -5.5 % |
| /be/en/legal-notices/us-customer-service-plan | 2 | -0.7 % | -2.0 % |
| /be/en/legal-notices/short-notice-eu-us | 3 | -10.0 % | -6.4 % (better: its h1 wraps as www's) |
| /be/en/legal-notices/privacy-notice-applicants | 0 (5 `<p>&nbsp;</p>`: the empty-line spacer's case) | -2.5 % | -5.6 % |

  /be/en/legal-notices/brussels-airlines-responsible-disclosure-statement also got worse with the column (-0.5 -> -1.8 %)
  and has no empty paragraph: another cause, not this row.
- **What would follow www:** an empty paragraph of www's rich text written as a small gap the collapse keeps (a 16 px
  spacer or the paragraph margin), so that the sidebar-h1 sections can then take www's text column (the h1 and the text in
  938 px, as www's sidebar; tried in ema-cashub's brief after 593 and not shipped because of these pages).
