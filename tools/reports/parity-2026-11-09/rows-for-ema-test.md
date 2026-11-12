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

## 3. Discover: www's heading-copytext-large headings render as plain headings (2026-11-11)

- **Found:** www's H2s and H3s marked heading-copytext-large (16 / 17.6 px bold at 390, 18 / 19.8 px bold at 1440, 12
  / 24 px under them) render as the level's default on our Discover pages: an H2 in default content 22 / 24.3 light (the
  eyebrow over /de/en/.../punta-cana's title: two lines where www's is one, the title 55 px lower at 390), an H2 in a
  Columns Media block 28 / 30.9 light, an H3 there 22 / 24.3 light. Only the card titles (additional services, 14 / 15.4
  bold) come out small. This widens row 2 (column views only): the default content's are lost the same way.
- **Evidence:** discover-parity-001: 55 such headings on 17 of the 26 recorded pages (de and en: baggage 1, families 2,
  entertainment 4, business class 3, check-in 2, check-in at the airport 4, additional services 7 / 8, Punta Cana 2,
  Santorini 4); ours measured with main's CSS on additional services, Santorini, check-in and baggage (2026-11-11 23:15
  UTC). Punta Cana at 390 +6.3 % (en) / +4.8 % (de) in the fresh ranking, the eyebrow its first difference.
- **What would follow www:** the marker kept for heading-copytext-large (it is not one step from a level's default, so
  decision D should not collapse it; worth checking where it goes); ema-lufthansa's Discover theme has no unmarked rule
  for it, as an eyebrow cannot be told from a section heading without the marker.

## 4. Discover: www's separators between components need a carrier in the collapse (2026-11-12)

- **Found:** www.discover-airlines.com's .separator (.hr-no-layout: no line; .hr's margin-bottom 30 px on Discover)
  adds 31 px between two components (customer service: the accordion's end to "Rebooking a flight" 71 px on www, 40
  ours; 1 to 7 separators on 20 of the 26 recorded pages, discover-parity-001). The cleanup now keeps them for Discover
  as "{spacer-30}" (ema-lufthansa, standing order 5, item 1, tools/importer/transformers/lufthansa-cleanup.js), but
  collapseSeparators removes a run of 31 px or less (size "none") unless textSpacers is on and both neighbours are
  running text; Discover's neighbours are blocks and headings (an accordion, a column view, then a headline or the
  search bar), and THEMES.discover has no textSpacers. A Spacer M would be 60 px (SPACE.m), twice www's.
- **Evidence:** offline: the cleanup alone on the 26 recordings (main's against the new one, Discover URLs: 16 pages
  with new or resized markers, all "{spacer-30}" or "{divider-30}"); collapseHtml on a Discover document with
  "{spacer-30}" between an accordion and an H2: removed; "{spacer-40}": Spacer M; "{divider-30}": Divider.
- **What would follow www:** on Discover, a separator run of 31 px or less between two components kept as one
  "{spacer-N}" (as textSpacers does between running text), or a theme size for Discover's separators. Then the
  documents of reimport-588-discover-separators.txt are READY.

## 5. Brussels: www's small separators between a text and the next heading need a carrier in the collapse (2026-11-12)

- **Found:** www.brusselsairlines.com's .separator (.hr-no-layout, no line; an inline margin-bottom of 11 to 30 px)
  between a text component and the next headline component: the heading 48 to 51 px under the paragraph on www (28 px separators), 32
  ours (/be/en/contact/service-charges "Ticket service fee for other countries" 513 on www at 1440, 496 ours; 598 / 585
  at 390). In the recordings (brussels-parity-003 to -006) 47 such separators of 31 px or less before a headline,
  26 of them after a text, on 14 pages: service-charges en and nl, checked-baggage in six languages (2 each), check-in
  times (4), check-in at the airport (3), charter, our-company/organisation, travel-classes economy (2) and
  premium-economy. Shared with the ranking: service-charges en / nl -6.0 / -5.9 % at 1440, checked-baggage -1.2 to
  -2.5 % at 1440.
- **Evidence:** the cleanup (tools/importer/transformers/lufthansa-cleanup.js, an info page) keeps such a separator
  as "{spacer-28}" (offline, www's sidebar structure); collapseHtml with brand brussels removes "{spacer-28}" between a
  paragraph and an H2 and between a list and an H3 (size "none"; textSpacers needs running text on both sides, and an
  H2 is not running text; THEMES.brussels has no componentSpacers). The service-charges document with
  "<p>{spacer-28}</p>" before the H2, served CSS: the heading at 513 at 1440 (www 513) and 598 at 390 (www 598); the page
  1577 -> 1594 at 1440 (www 1677), 2102 -> 2115 at 390 (www 2172).
- **What would follow www:** on Brussels, a run of 31 px or less between running text and the next heading kept as
  one "{spacer-N}" (textSpacers with a heading counted as running text after it, or componentSpacers on
  THEMES.brussels). Then the documents of reimport-589-brussels-heading-spacers.txt can be re-imported and measured.
  Not traced here: an offline import of check-in-at-the-airport's raw recording (not through brussels-import.mjs's
  mapping) gave no spacer even before the collapse; ema-lufthansa checks that once the collapse carries it.
- **Also (2026-11-12, after ce2e5d0c):** 8 more such separators follow a block, not a text: after the tab control on
  checked-baggage in six languages (18 px before "What if I exceed the limits for checked baggage?"), after the accordion on service-charges en and nl (8 px
  before "Optional Payment Charge"). The cleanup drops those itself on Brussels (ema-lufthansa's; it would keep them as
  Discover's once the collapse carries a spacer between two components there: componentSpacers on THEMES.brussels).
- **Done (standing order 8, 2026-11-12, ema-test):** the collapse keeps them on Brussels (textSpacers: running text
  then a heading); for DA's copies the delta (text-spacers-apply.mjs, rows of kind separator, data
  brussels-heading-spacers-so8.json). reimport-589-brussels-heading-spacers.txt: 9 READY, 2 HOLD (be/fr premium-economy,
  be/fr checked-baggage 390 +0.66), 3 with nothing to apply. service-charges en's heading at 513 at 1440, as www's.

## 6. ITA: column-view heading sizes need their marker in the collapse (2026-11-12, standing order 7)

- **Found:** www.ita-airways.com's column-view headlines come in two sizes: heading-medium (36 / 39.6 px at 1440) and
  heading-small (28 / 30.8). On the H2s in column-view items of ita-parity-002 to -005: heading-medium 40 on 9 pages
  (support/utilities/contact 26, entry-regulations 6, business-class-medium-haul 3, checked-baggage 2, lounges, the app,
  unaccompanied minors), heading-small 11 on 7 pages. The import's collapse (marker-collapse.mjs, THEMES.ita, decision
  D) turns a size one step from the level's default into the default, so both come out unmarked; ITA row 31
  (ita.css) then shows every unmarked Columns Media H2 at heading-small's size (right for row 31's 12 of 13 on -003 /
  -004, wrong for -005's contact page: 36 px headings at 28, the page -7.8 % at 1440 and -10.0 % at 390).
- **Evidence:** an offline import of the contact recording with main's info bundle: `<h2 id="albania">Albania</h2>`, no
  marker; our host at 1440: 28 px / 30.8, www's 36 / 39.6 (the shadow render of the recording, headline
  heading-medium); the row step 234 px against www's 265.
- **What would follow www:** on ITA, a heading's size marker kept inside a Columns Media cell (heading-small and
  heading-medium both), as the theme's default there is not the level's. ema-lufthansa then drops row 31's guess (an
  unmarked H2 in a Columns Media cell at heading-small) and the documents re-import (DA's market sections: through a
  delta like ita-tabs-apply.mjs).
