# C5-C9 diagnosis (Ben's 12:04 list)

Code-only analysis, 2026-10-23: shots, live screenshots and raw live snapshots read as files, previewed
`.plain.html` of 5 pages fetched once each. No captures, imports, uploads or previews were run.
Coordinates are page pixels at 1440 unless noted (live screenshots of these pages are 1425 px wide,
except the homepages, see C5).

## How old the shots are

This morning's re-import rewrote `content/` 02:52-05:59 UTC (fleet 02:52, homepages 05:08-05:10, legal
05:13, flight status 05:40). For most of these pages the re-import was **not uploaded or previewed**:
`da-upload-state.json` still has the mtime of the 2026-10-22 import (19:15-20:22), so `main--` serves the
version uploaded 2026-10-22 20:23-21:48.

| item | shots (eds capture) | content in the preview | newer than the re-import? |
| --- | --- | --- | --- |
| C5 homepages | 2026-10-22 23:00-23:04 | upload 10-22 20:24 | no; re-import not previewed |
| C6 flight status | 2026-10-22 23:09-23:56 | upload 10-22 20:24-21:40 | no; re-import not previewed |
| C7 fleet 320/32n | 2026-10-23 07:17-09:12 | upload 10-23 02:55 (re-import) | **yes** |
| C7 de/en/359 | 2026-10-22 23:05 | upload 10-22 20:24 | no |
| C8 legal | 2026-10-22 23:17-23:35 | upload 10-22 21:00/21:18 | no; re-import not previewed |
| C9 AirCore | 2026-10-22 23:59 - 10-23 00:07 | upload 10-22 21:46-21:48 | no AirCore re-import this morning |

The previewed `.plain.html` of de/de homepage, de/de flugplan-und-flugstatus, de/de
sitzplatzreservierungen-konditionen and lhg/at/de/dest/cy/new-york has the same blocks and sections as
the local re-import (only `<picture>` expansion and metadata differ), so the causes below hold for both.
Code changed after the old shots (B2-B7, sections `padded` 060b14b, columns-media 9f95930), but none of
it touches the rules below.

---

## C5 Homepage (de/en, de/de, at/de, gb/en)

**Harness, all four, all bands: the live 1440 PNGs have a 15 px scrollbar gutter.**
`source-export/pages/{de/en,de/de,at/de,gb/en}/homepage/screenshot.png` are 1440 px wide, but columns
1425-1439 are white on every row (even in the navy header). The live layout was 1425 px wide. The replica
was shot at contentWidth 1440 (`progress.json` eds `contentWidth: 1440`), so everything centred is offset
by 7.5 px, and the 3:1 stage is 480 px high instead of 475 px (live 331-805 / 335-809, replica 335-814).
At 1440 the layout margin is 88 px, so the content column is 1249 px live and 1264 px in the replica. That
is why the 5 service tiles ("Suchen Sie mehr als nur einen Flug?", 236 px + 20 px gap each = 1260 px) fit
on one row in the replica, while live wraps "Alle Extra-Services" to a second row. This explains about
180 px of the 0.9x height. These are the only 4 of the 92 live `screenshot.png` files with this gutter.
The 768/390 PNGs and all `.jpg` captures have none.
- **Hand-over (harness):** capture the replica for these 4 page-widths at 1425 px content width, or crop
  the 15 px gutter from the live PNGs, then recompare.

**de/de (first band y=600) and at/de: options row 4 px too tall.** Live de/de, at/de and gb/en have no
"Nur Direktflüge" checkbox: the From label is at y=236 (768) and the stage at 331 (1440). On de/en, which
has the checkbox, they are at 240 and 335. The replica uses de/en's row everywhere (241 / 335). Live CSS:
`.custom-checkbox.btn-nonstop-only { margin-bottom: 2.4rem }` (from 768px) ends the row, but without the
checkbox `.triptype-dropdown-wrapper .selectable { margin-bottom: 2rem }` ends it. Together with the
gutter's +5 px stage, the shift reaches the 600-800 band on de/de.
- **Fixed (pushed, 4af00b0):** `blocks/flight-search/flight-search.css`, from 768px
  `.flight-search .flight-search-options:not(:has(.flight-search-nonstop)) { margin-bottom: 20px }`.
  AirCore keeps its own row margin (`body.aircore ...` has higher specificity).
  Affects (no Nonstop label, not AirCore): de/de, at/de, gb/en homepage; standalone de/de and at/de
  hotelangebote, de/en and gb/en hotel-offers, de/de and gb/en book-and-manage/stopover. Spot-check:
  de/de/homepage@768 (From label at 236), de/de/hotelangebote@1440.

**at/de (first band y=400): the stage card is white on live, dark blue in the replica.** The live
promotion teaser of at/de has `"isInverted": false` and renders
`<div class="mst-card non-inverted ...">`. The other three markets have `isInverted: true` and
`.mst-card.container-brand`. Live CSS: `.mst-card-container .non-inverted { background-color: #fff }`,
with `.display-text` and `.mst-title { color: #05164d }` and the link not inverted. The replica always
draws the brand card (y 438-712 at 1440, the whole 400-800 band). Content has no variant: local and
preview `hero-card-overlay` on at/de are without variant.
- **Hand-over (importer):** `tools/importer/parsers/hero-card-overlay.js`, next to the `right` /
  `no mobile image` variants:
  `if (card.classList.contains('non-inverted') || teaser.isInverted === false) variants.push('light');`
  Then re-import at/de/homepage. Block CSS for the variant (not pushed, it needs the re-import), for
  `blocks/hero-card-overlay/hero-card-overlay.css`:
  ```css
  /* light: .mst-card.non-inverted (promotionTeaser.isInverted false): white card, #05164d text */
  .hero-card-overlay.light .hero-card-overlay-card { background-color: var(--lh-white); color: var(--lh-deepblue); }
  .hero-card-overlay.light .hero-card-overlay-card :is(h1, h2, h3, h4, h5, h6) { color: var(--lh-deepblue); }
  .hero-card-overlay.light .hero-card-overlay-card a:any-link:not(.button),
  .hero-card-overlay.light .hero-card-overlay-conditions summary { color: var(--link-color); }
  .hero-card-overlay.light .hero-card-overlay-card a:not(.button):hover,
  .hero-card-overlay.light .hero-card-overlay-conditions summary:hover { color: var(--link-hover-color); }
  .hero-card-overlay.light .hero-card-overlay-card a:focus-visible { outline-color: var(--focus-color); }
  ```
  plus a README variant entry. Other pages with `isInverted: false`: none among the 4 homepage snapshots
  (de/de, de/en, gb/en are `true`).

**gb/en (first band y=200): the live capture is broken, not the replica.** In all live gb/en captures
(1440 and 768) the stage image did not load: a broken-image icon on white at y 335-805, with only the
card drawn. The replica shows the skier image correctly. At 390 the stage has no image
(`no-mobile-image`), and there gb/en first differs at 1600.
- **Hand-over (harness):** recapture the live gb/en homepage (or mask the stage) before judging it.

Smaller differences: the en submit button is "Search flights" on live (prerendered `maui-button`) but
"Find flights" in the replica (`flightmanager.flight.searchButton.default` of the recorded label bundle).
Importer: write `Submit label | Search flights` from the prerendered button text. The remaining height
loss further down on de/de at 1440 (to recheck after the gutter recapture): carousel-cards to
destination-finder heading is 131 px live (dots 2085 to heading 2216) vs 56 px; destination-finder
buttons to the next heading is 141 px vs 80 px; the footer bottom links wrap to 2 rows on live.

## C6 Flight status (4 pages, first band y=1000)

One cause with two parts, both in the white space right under the flight-status widget (de/de, ink rows):

| | live 1440 | eds 1440 | live 768 | eds 768 | live 390 | eds 390 |
| --- | --- | --- | --- | --- | --- | --- |
| widget divider to "Nach dem Login ..." | 742 -> 853 (111) | 742 -> 807 (65) | 742 -> 852 (110) | 728 -> 793 (65) | 776 -> 840 (64) | 768 -> 821 (53) |
| "Meine Buchungen" link to first columns-media image | 921 -> 1014 (93) | 876 -> 929 (53) | 921 -> 1014 (93) | 862 -> 915 (53) | 932 -> 1024 (92) | 917 -> 970 (53) |

1. Live markup: `<div class="hr mb-md-10">`, where `.mb-md-10 { margin-bottom: 8rem !important }`
   (80 px, the block had 60 px), followed by a separate `.separator .hr.hr-no-layout` (transparent
   1 px divider + `.hr { margin-bottom: 2.5rem }`) on all four pages. The importer drops that separator.
   Below 768px it is 25 px (`.hr`) + 26 px.
2. The columns-media below is `.onecolumn > .column-view > ... > .twocolumn > .column-view`, and
   `.section-content .column > .column-view:only-child { padding: 3.2rem 0 }` applies at every width.
   The replica has the plain 48 px section gap there.
- **Fixed (pushed, 4af00b0):** `blocks/flight-status/flight-status.css`: `.flight-status` margin-bottom
  59 px (<768) / 106 px (>=768; was 60), and
  `main > .section.flight-status-container + .section { margin-bottom: 88px }`. Expected: text 64 / 110 /
  110 px and image 93 px below the link, so the pages get 86 px (1440) / 50 px (390) taller. They were 79 /
  59 px short. Affects only the 4 flight status pages (de/de, at/de flugplan-und-flugstatus, de/en, gb/en
  timetable-and-flight-status), the only users of the block. If the importer later writes the dropped
  separator as `{spacer}`, lower the 106/59 by 26 px.

## C7 Fleet (/de/de/320, /at/de/320, /at/de/32n; /de/en/359 close)

These shots are current (07:17-09:12, after the 02:55 fleet upload). From the "Besonderheiten des
Airbus ..." h2 down to the second media row, three gaps are short (at/de/320, 1440, ink rows):

| gap | live | eds | missing |
| --- | --- | --- | --- |
| sidebar text end to h2 | 713 -> 871 | 712 -> 858 | 13 |
| h2 to first columns-media row (image top) | 897 -> 969 (72) | 882 -> 923 (41) | 31 |
| first columns-media row to the `columns-media sidebar` row (image bottom to image top) | 1313 -> 1426 (113) | 1271 -> 1336 (65) | 48 |

Together that is 92 px, which is the whole height gap (6034 vs 5941). de/de/320 has the same numbers
(h2 1331 vs 1318, h2 to image 72 vs 41). The replica draws the h2 in the same size as live (36 px,
margin 32 px).
- Cause of the 31 px: the live `.twocolumn > .column-view:only-child` has `padding: 3.2rem 0` at every
  width (it beats `.column-view { padding: 2rem/4rem 0 1rem/2rem }`). `columns-media` has no top or
  bottom padding for it. Inside a section it starts right after the heading margin. The 48 px between
  the two rows are the same 32 px bottom padding plus the `airem-sidebar` start.
- /de/en/359 is close because it has no columns-media.
- **Not pushed, hand-over:** the change belongs in `blocks/columns-media/columns-media.css`
  (`.columns-media:not(.sidebar)` padding 32 px top and bottom, minus whatever section gap or margin is
  already there). 296 pages have a heading directly followed by a columns-media (fleet, 100-years, info
  pages, imprint, AirCore ...), and many columns-media spacings were tuned by measurement (row gap 66 px,
  sidebar 40/46 px, imprint sections). It needs a browser spot-check across templates, so I did not ship
  it blind. Spot-check pages: at/de/320, de/de/32n, de/en/imprint, de/en/timetable-and-flight-status
  (C6 already adds 88 px there; drop that rule if columns-media gets the padding), de/de/additional-services.

## C8 Legal sitzplatzreservierungen-konditionen (de/de, at/de; 0.81x)

**Missing content, importer.** Live has four topic tiles in a `.twocolumn`. Each is a
`<a rel="noopener noreferrer" class="teaser partner">` **without href** holding
`h3.heading-copytext-large.teaser-heading` (`img.icon.icon-svg` such as
`/content/dam/lh/icons/money-hand-refund.svg` + "RÜCKERSTATTUNG"), `.teaser-description p.desc-inline`
(2-3 lines) and a decorative `.teaser-link-text` "Weitere Fragen". After it come a `.separator
.hr-no-layout` and the real `.link` "Weitere Fragen". The replica (preview and local re-import) keeps
only the 4 links. The icon, uppercase heading and description of every tile are gone, so the tiles are
about 75 px shorter each (live 1627 vs 1324 px).
- **Hand-over (importer):** the columns-media (twocolumn) parser must keep `a.teaser:not([href])`
  content (icon + h3 + description) in the cell and drop its `.teaser-link-text`. The same pattern
  (hrefless teasers) is in 34 snapshots. The other 4 seat-reservation-conditions pages lose the tiles
  the same way: de/en, gb/en advance-seat-reservations-terms-and-conditions (0.39, 1603 vs 1324).
  Others to check: */gefaehrliche-gegenstaende (57), */electronic-devices-and-batteries (39),
  */entry-exit-system (4), */book-and-manage/stopover (4), */giftvoucher (3), */handgepaeck,
  carry-on-baggage, and de/en, gb/en 320, 32n, boeing787 (1 each). After the re-import the block may
  need styles for an icon in an h3 (24 px icon, 18 px bold heading).

## C9 AirCore AT/GB (first band y=0)

**Geo banner, both in the live capture and in the content.** The live AT/GB snapshots were recorded
from a German IP and contain
`<div class="geobanner-sticky-wrapper"><div class="wrong-geolocation-banner container">` ("Sie sind in
Deutschland. Sie haben die Möglichkeit, das Land zu wechseln." [Land wechseln] [Auf Seite bleiben];
en: "You are in Germany ..."). In the live screenshot it is a 98 px white strip above the header (header
at 98-220), so every row is offset from y=0. The importer wrote it as the first two paragraphs of
section 0 ("Land wechseln" bold, "Auf Seite bleiben" italic link), so the replica shows them as text
under the header (y 122-190). The de/de and de/en counterparts have no banner, which is why they only
differ from 2800-6800.
- Affected (exactly these 18, live 1440 capture and content both): lhg/at/de dest/c/{grossbritannien,
  indien, italien, japan, spanien, usa}, dest/co/{europa, nord-und-suedamerika}, dest/cy/{amman,
  barcelona, london, los-angeles, new-york, palma-de-mallorca, paris, rom, tokio}, and
  lhg/gb/en/o-d/cy-cy/frankfurt-london.
- **Hand-over (importer):** remove `.geobanner-sticky-wrapper, .geobanner-placeholder` in the AirCore
  cleanup transformer, then re-import the 18 pages. **Hand-over (harness):** the live captures still
  carry the 98 px banner, so recapture them with the banner closed (`.close`, "Auf Seite bleiben") or
  crop 98 px from the top. Otherwise the pages keep diverging from y=0 after the content fix.
- Also seen, not AT/GB specific: the first breadcrumb item is the root page title ("Flüge weltweit
  buchen bei der Weltentdecker | Lufthansa") instead of live "Reiseziele" / "Travel destinations". The
  /lhg/{cc}/{ll} overview pages have no `Breadcrumb title` metadata (importer, overview template). The
  dest pages prefill the origin (Wien / Frankfurt), while the live AirCore flight search shows an empty
  "Von". The gb/en route page's stage card is imported as paragraphs: AirCore route template, owned by
  the importer agent.
