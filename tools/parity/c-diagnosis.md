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

---

# C1-C3 diagnosis (code-only sub-agents, 2026-10-23; C4 not diagnosed yet)

## C1 Hub (68 pages): diagnosis

This was code-only analysis. I read shots, live screenshots, snapshots, content and the saved live CSS (`tools/source-export/static/app.8c42f486.css`). Nothing in the repo was edited, run against live, imported or previewed. Coordinates are page pixels in the 1425 px live layout at 1440 unless noted.

**How old the shots are.** at/de/additional-services and de/de/speisen-und-getraenke were shot after their latest import and preview, so they are current. at/de/flughafeninformation is stale: shot 10-22 23:25, preview 10-22 21:02, re-imported 10-23 11:43 and not previewed since. The same holds for its de/de, de/en and gb/en siblings, all overview-travel-information, services-at-the-airport and meetings-and-events pages, and de/en and de/de digital-self-services and lounges. The stale shots still show what the replica renders today: the current `content/*.plain.html` has every pattern below as default content or as an empty block. at/de/flughafeninformation really has no blocks now (only grey section metadata).

**Harness note.** Two live captures are unreliable at 768. The flughafeninformation and airport-information shots have no teaser images (lazy loading never ran), and the additional-services shots are missing most tile icons. So the live 768 heights are too small and the 768 ratios overstate the gap.

---

### C1.1 Image teaser column views directly under `.container-content` are not mapped (main cause of flughafeninformation, 2.36x)
- **Cause:** the hub cards-teaser selectors are `.section-content > .twocolumn|.threecolumn:has(.column-view-item > .image + .headline)`. On these pages the column views sit directly in `.container-content`, with no `.section`/`.section-content` around them. The columns-media `.container-content > .twocolumn:not(:has(.column-view-item > .image + .headline))` excludes them on purpose, and `.fourcolumn` is not mapped at all. So every teaser (image, h2, text, link) becomes a full-width default-content stack.
- **Evidence (at/de/flughafeninformation):** the snapshot has `.container-content > .twocolumn` (2 items), then `.fourcolumn` (4 items, `h2.heading-small`), then a separator, then `.twocolumn` (2), then `.onecolumn.container-gray`.
  - Live 1440: 2-up images at x 88-702 and 723-1336 (y 393-656); 4-up images at 88-384, 405-702, 723-1019 and 1040-1336 (y 1033-1160, 20 px gutters); divider at y 1461; next images at y 1527.
  - Replica: one image of about 1249 px width per teaser, stacked. Heights are 3307 (live) vs 7799 (replica). The first divergence is at y=400.
- **Fix (importer; needs re-import):**
  - In `tools/importer/page-templates.json`, hub, `cards-teaser` instances, replace the two entries with:
    ```
    ":is(.section-content, .container-content) > .twocolumn:has(.column-view-item > .image + .headline)",
    ":is(.section-content, .container-content) > .threecolumn:has(.column-view-item > .image + .headline)",
    ":is(.section-content, .container-content) > .fourcolumn:has(.column-view-item > .image + .headline)"
    ```
  - In `tools/importer/parsers/cards-teaser.js`:
    `const variants = element.classList.contains('threecolumn') ? ['three-up'] : element.classList.contains('fourcolumn') ? ['four-up'] : [];`
  - The existing merge logic joins adjacent same-variant tables, as on overview-manage. The 2-up and 4-up tables differ in variant, so they are not merged.
  - Regenerate the import script and bundle: `node tools/importer/build-import-script.js hub`, then `build-bundles.mjs`.
- **Block CSS needed (`blocks/cards-teaser/cards-teaser.css`):**
  - Change `.cards-teaser:not(.three-up) > ul > li:nth-child(2n + 3)` to `.cards-teaser:not(.three-up, .four-up) > ul > li:nth-child(2n + 3)`, both in the base rule and in the 768 reset.
  - Change the 768 rule `.cards-teaser.three-up > ul { row-gap: 46px }` to `.cards-teaser:is(.three-up, .four-up) > ul`.
  - Add in the 1025 media query: `.cards-teaser.four-up > ul { grid-template-columns: repeat(4, minmax(0, 1fr)); row-gap: 66px; }`
  - Titles keep the `{heading-small}` marker, which wins over the `:where()` title rules.
  - Spacing to check afterwards: live has 82 px from the last 2-up link line to the 4-up images. The existing `.cards-teaser-wrapper + .cards-teaser-wrapper > .cards-teaser { margin-top: 91px }` gives 91 px, so it may need a four-up exception.
- **Pages (16):**
  - `{de/en,gb/en}/airport-information`, `{de/de,at/de}/flughafeninformation` (2-up + 4-up + 2-up)
  - `*/overview-travel-information` (4 pages, 3 x 2-up)
  - `{de/en,gb/en}/services-at-the-airport`, `{de/de,at/de}/services-am-flughafen` (3 x 2-up; the last one has 1 item)
  - `*/digital-self-services` (4 pages, only the final 3-up "This might also interest you")
- **Spot-check:** at/de/flughafeninformation at 1440 (4-up at the x positions above), de/en/overview-travel-information, de/de/services-am-flughafen.

### C1.2 Service icon tiles `a.teaser.usp` are not mapped (main cause of additional-services, 1.72x)
- **Cause:** `.threecolumn` and `.fourcolumn` of `a.teaser.usp` (inside `h3.teaser-heading`: `.image-wrapper img` and `.teaser-heading-text`) match no hub selector. carousel-cards only takes `a.teaser.card`. The content holds 17 `<h3><a><picture>…</picture>Label</a></h3>` in a row: the icons render at their natural size (ink 101 px, live 50 px) with the label below and to the right, one tile per row of about 205 px.
- **Evidence:**
  - Live CSS: `.teaser.usp { padding-top: .6rem; text-align: center }`; `.teaser.usp .image-wrapper { width: 8.8rem; height: 8.8rem; margin: 0 auto }` (from 376px); `.teaser.usp .teaser-heading { font-weight: 400; margin-bottom: 1rem }`; `.teaser .teaser-heading { LufthansaHead; font-size: calc(2rem + .4*(100vw - 37.5rem)/106.5), 2.4rem from 1281px; line-height: 110% }`.
  - Grid: `col-md-6 col-lg` with 20 px gutters; items 30 px apart below 768 and 20 px from 768.
  - Live at/de, first row:
    - 1440: stage ends at y 830; icon ink 930-979; label ink 1022-1043; 3 columns centred at x 289 / 712 / 1135; next stage at 1137. The 4-column row is centred at 236 / 554 / 871 / 1187.
    - 768: stage ends at 852; icon ink 952; label 1044-1062; 2 per row (centres 195 / 557); row pitch 148.
    - 390 (375 px content): icon ink 1160; label 1252; one per row with a pitch of 157.
  - Replica (current shot): icons ink 924-1024, labels at x 269+, total height 7689 vs 4476.
- **Fix (importer):**
  - In `page-templates.json`, hub blocks, add `{ "name": "cards-icon", "instances": [":is(.threecolumn, .fourcolumn):has(a.teaser.usp)"] }`.
  - In `tools/importer/parsers/cards-icon.js`:
    - Add `if (!tiles.length) tiles = [...element.querySelectorAll('a.teaser.usp')];` before the `li, .teasericon` fallback. The label (h3 text), link and image are then read correctly.
    - Pass the variants: `variants = element.querySelector('a.teaser.usp') ? ['usp', ...(element.matches('.fourcolumn') ? ['four-up'] : [])] : []`.
  - Rebuild `import-hub.js` (it then imports the cards-icon parser).
- **Block CSS (`blocks/cards-icon/cards-icon.css`, add):**
```css
/* option usp: Lufthansa a.teaser.usp (additional-services): no box, 88px icon centred over a
   regular LufthansaHead label; equal columns 20px apart, 1 / 2 from 768px / 3 (four-up 4) from
   1025px; label + 10px + 30px (20px from 768px) to the next tile (live pitch 157 / 148) */
.cards-icon.usp > ul { display: grid; grid-template-columns: minmax(0, 1fr); gap: 30px 20px; }
.cards-icon.usp > ul > li { width: auto; }
.cards-icon.usp .cards-icon-tile,
.cards-icon.usp a.cards-icon-tile:hover {
  padding: 6px 0 0; border: 0; border-radius: 0; background: none; box-shadow: none;
}
.cards-icon.usp .cards-icon-icon { margin: 0; padding: 0; }
.cards-icon.usp .cards-icon-icon .icon,
.cards-icon.usp .cards-icon-icon picture,
.cards-icon.usp .cards-icon-icon > img { width: 88px; height: 88px; }
.cards-icon.usp .cards-icon-label {
  margin-bottom: 10px; font-size: calc(20px + 4 * (100vw - 375px) / 1065);
  font-weight: 400; line-height: 110%;
}
@media (width >= 768px) {
  .cards-icon.usp > ul { grid-template-columns: repeat(2, minmax(0, 1fr)); row-gap: 20px; }
}
@media (width >= 1025px) {
  .cards-icon.usp > ul { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .cards-icon.usp.four-up > ul { grid-template-columns: repeat(4, minmax(0, 1fr)); }
}
@media (width >= 1281px) { .cards-icon.usp .cards-icon-label { font-size: 24px; } }
```
  - After the re-import, each tile row gets its own wrapper: +24 px (`div + div`), and the following spacer wrapper +8 px. Check the stage-to-icon spacing against live: icon ink 100 px below the stage at 1440, 100 px at 768, 39 px at 390. Adjust `.cards-icon-wrapper` if needed.
- **Pages (4):** `*/additional-services` (17 tiles each in 5 rows). The de/de and de/en pages show only 1.18x because their stages are taller.
- **Spot-check:** at/de/additional-services at 1440/768/390.

### C1.3 `.herobanner` (expanding image panes) is not mapped, and there is no block for it (speisen from y=1200; reiseklassen from y=400)
- **Cause:** `.herobanner .dcep-hero-banner` has 4 `.hero-item` panes. Each pane holds `.hero-accordion-header-button` (the tab label, e.g. "First Class"), `h3.hero-header` ("Feinster Genuss"), `p.hero-paragraph` (optional), `maui-button-link` "Menüs entdecken" and a pane image. None of the 13 templates maps it and no block exists. The replica stacks 4 x (h2, h3, outlined link, roughly 1249 x 540 image).
- **Evidence:**
  - Live de/de/speisen-und-getraenke at 1440: the banner is full-bleed, x 0-1425, y 1275-1994 (720 px = 80vh). Panes use `flex: 5` active vs 1 (890 / 178 px). 768: 753 x 810 (90vh), `flex-grow: 4` (430 / 108). 390: stacked vertically, 810 high, active pane about 506 px, the others about 101 px.
  - Replica: about 3800 px for the same content (First Class heading at about 1230, the next heading at about 5030), against about 800 px live.
  - Live CSS (in `app.8c42f486.css`, `.hero-banner …`):
    - `.hero-container { display: flex; flex-direction: column (row from 768); height: 100vh; max-height: 90vh (85vh from 1025, 80vh from 1281); min-height: 60vh }`
    - `.hero-items-contents { position: absolute; padding: 5rem 2rem 2rem 4.8rem }`, then `8rem 2rem 4rem 5rem` from 768 and `6rem 2rem 4rem 5rem` from 1025.
    - `.hero-header { LufthansaHead 700, white, calc(3.6rem + 1.2*(100vw - 37.5rem)/106.5) / 5rem line; 10rem / 10rem from 1025 }`
    - `.hero-subheading { absolute; left: 5rem; bottom: 1rem / 3rem / 4rem; max-width: 14 / 16 / 18rem; LufthansaHead 300, 20 to 24px }`
    - `.transparent-overlay { background: <data-dcep transparentOverlay>; mix-blend-mode: multiply }`. The colour is `#946E57` on food-and-beverages and `#6F625A` on travel-classes.
    - `.hero-banner { margin-bottom: 2.4rem }`
    - Inactive panes show only the tab label. Hovering or clicking a pane expands it (`flex` transition .5s).
- **Fix (new block plus importer):**
  - New block `blocks/hero-banner/` with one row per pane: image | h2 tab label, h3 headline, optional p, link. The JS sets the first pane active and activates a pane on click/hover (`aria-expanded`). CSS follows the rules above.
  - New parser `tools/importer/parsers/hero-banner.js`, mapping `.herobanner:has(.dcep-hero-banner)`. It should carry the overlay colour, for example as an option or config row.
  - The button hrefs are raw AEM paths, e.g. `/content/lh/markets/de/de/during-your-trip/food-and-beverages/menus-travelclasses/menus-first-class`. The current content already links to `https://www.lufthansa.com/content/lh/markets/...`. Map them to the public paths if possible.
  - Panel height depends on the viewport (vh), so the replica capture height must equal the live one (900).
- **Pages (8):** `*/food-and-beverages|speisen-und-getraenke`, `*/lufthansa-travel-classes|lufthansa-reiseklassen`. These are the only snapshots in the whole site with `.herobanner`.
- **Spot-check:** de/de/speisen-und-getraenke and de/de/lufthansa-reiseklassen at 1440/768/390.

### C1.4 `.accordion` is not mapped in the hub: FAQ questions are lost and all answers are expanded
- **Cause:** hub has no accordion-columns mapping (info, form, homepage and flight-status have `.accordion`). The question text sits in `maui-collapsible-item[headline]`, so default-content conversion drops it and leaves only the answers. de/de/speisen "Häufig gestellte Fragen": live 88-1336 is a collapsed list of 15 questions (about 900 px). The replica has bare answer paragraphs from about y 6000 to past the 8000 px cap.
- **Fix (importer):** add `{ "name": "accordion-columns", "instances": [".accordion"] }` to the hub blocks. The parser already reads the `headline` attribute and adds `limited-width` inside `maui-limited-width` (lounges). Rebuild import-hub.
- **Pages (8):** `*/food-and-beverages|speisen-und-getraenke` (FAQ), `*/lounges` ("Lounge-News", 6 items, inside the grey `.onecolumn`).
- **Spot-check:** de/de/speisen-und-getraenke (the questions are present), de/en/lounges.

### C1.5 Missing content: a `.twocolumn` of `a.teaser.card` becomes an empty columns-media
- **Cause:** the hub columns-media instance `.section-content > .twocolumn:not(:has(.column-view-item > .image + .headline))` has no `.teaser` exclusion. It matches the "Mehr Informationen zu unseren Bordmenüs" twocolumn of 2 `a.teaser.card` (Kindermenüs, Spezialmenüs), and the parser writes `<div class="columns-media"></div>`. Both cards are missing. Live: 2 bordered cards at x 88-702 and 723-1336, y 3051 to about 3540.
- **Fix (importer):**
  - In page-templates.json, hub, add `".twocolumn:has(a.teaser.card)"` to carousel-cards and append `:not(:has(.teaser))` to that columns-media instance.
  - In `parsers/carousel-cards.js` (line 206): `element.matches('.fourcolumn') ? ['grid', 'four-up'] : element.matches('.twocolumn') ? ['grid', 'two-up'] : ['grid']`.
- **Block CSS (`blocks/carousel-cards/carousel-cards.css`):** `@media (width >= 1025px) { .carousel-cards.grid.two-up .carousel-cards-track { grid-template-columns: repeat(2, minmax(0, 1fr)); } }`. Without it the 2 cards would sit in 3 columns.
- **Pages (4):** `*/food-and-beverages|speisen-und-getraenke`. These are the only hub content files with an empty block.
- **Spot-check:** de/de/speisen-und-getraenke at 1440 (two 615 px cards).

### C1.6 `a.teaser.partner` icon rows are not mapped: SVG icons render content-wide (digital-self-services 1.79x from y=1800)
- **Cause:** `.onecolumn > item > h2 + .threecolumn + .threecolumn` of `a.teaser.partner` (`img.icon-svg` + `.teaser-heading-text` + `.desc-inline`). Each threecolumn has 2 items and an empty third column. Default content renders `h4 > a > picture(svg)`; the SVGs have no intrinsic size and fill the column (about 1140 px).
- **Evidence:** live CSS `.teaser.partner .icon-svg { position: absolute; left: 0; 4.8rem x 4.8rem }`, `.teaser-heading` and `.teaser-description { margin-left: 5.1rem }`, heading 700 20 to 24px, description LufthansaText 1.6rem/150%. At 1440 the text starts at x 140 and 563 (a 3-column grid, items in columns 1-2).
- **Fix (importer plus block option):**
  - Map `.onecolumn .column-view-item > :is(.threecolumn, .twocolumn):has(a.teaser.partner)` to cards-icon-text.
  - Add a parser branch for `a.teaser.partner`: icon from `img.icon-svg, .image-wrapper img`, kept as an `<img>`. The AirCore branch would turn `laptop-check-in-confirmation.svg` into a `:token:` that has no file in `/icons/`. Title from `.teaser-heading-text`, description from `.desc-inline`. Add option `partner`.
  - CSS in `blocks/cards-icon-text/cards-icon-text.css`: `.cards-icon-text.partner > ul` as a grid of 1 column, 2 from 768 and 3 from 1025, 20 px gap; icon padding-right 3px; title LufthansaHead 700 `calc(20px + 4*(100vw - 375px)/1065)` (24px from 1281), 110% line height, colour deepblue; body 16px/150%, weight 400.
- **Pages:** `*/digital-self-services` (4 pages, 16 tiles each). There are 28 snapshots site-wide with partner teasers; C8 noted the hrefless kind.

### C1.7 Smaller causes found on the way
- **Travel classes sub-navigation (reiseklassen from y=400):** `maui-sub-navigation` (Lufthansa Reiseklassen | First | Business | Premium Economy | Economy) is not imported. The replica content starts about 104 px higher at 1440. A `profile-nav` block already renders this pattern. Map `.subnav-wrapper maui-sub-navigation` to profile-nav. The tab hrefs are AEM paths (`/de/de/prepare-for-your-trip/travel-classes…`) and need mapping to the public paths for the active tab. Affects 4 hub pages and 28 other pages (first/business/premium-economy/economy-class, flynet, internet-overview, lhg-wifi).
- **meetings-and-events (1.35x from y=600, 4 pages):**
  - The logo `.fourcolumn` (4 images, `.carousel` with a desktop row and a swiper copy) is stacked at natural size. Live has 4 logos about 300 px wide in one row. Fix: map `.container-content > .fourcolumn:has(> .column-view > .carousel)` to columns-media. Its parser already skips the mobile copy and takes the desktop `.column-view-item`s.
  - The "01 / 02 / 03" steps (`.onecolumn > item > .threecolumn` with carousel, image + h3 + text + button) are stacked. Fix: map `.container-content > .onecolumn > .column-view > .row > .column-view-item > .threecolumn:has(.column-view-item > .image + .headline)` to cards-teaser three-up. I checked that the swiper copy contains no `.column-view-item`.
- **lounges (4 pages):** besides C1.4, the "Access to our lounges" `.onecolumn > item > .twocolumn` (image | text) is stacked. Fix: copy info's columns-media instance `:is(.section-content, .container-content) > .onecolumn > .column-view > .row > .column-view-item > :is(.twocolumn, .threecolumn, .fourcolumn):not(:has(…))` to hub. Its `.teaser`/`.carousel` exclusions keep C1.6 and meetings out.
- **Chat widget imported as content:** de/en/overview-travel-information ends with "Lufthansa Chat Assistant / Hi, I'm Elisa…". The snapshot was taken with the Cognigy chat open (`body > div > div > .webchat-root #webchatWindow`). Fix in `transformers/lufthansa-cleanup.js` beforeTransform: remove `.webchat-root`. Eight snapshots have an open chat: this one, plus de/de and gb/en refund, de/de, de/en and gb/en refund-form, and gb/en and at/de support/feedback-and-contact-airlines.
- **Not a cause:** special-needs and betreuungsbedarf (0.7x) shots predate the 15:15 form re-import, which is already in fixes.json. miles-and-more (0.92x) is shorter, not taller, and I did not investigate it.

### Which pages each cause affects
| cause | pages |
|---|---|
| C1.1 container-level teasers | 16 (airport-information x4, overview-travel-information x4, services-at-the-airport x4, digital-self-services x4 last row) |
| C1.2 usp tiles | 4 additional-services |
| C1.3 herobanner | 8 (food-and-beverages x4, travel-classes x4) |
| C1.4 accordion | 8 (food-and-beverages x4, lounges x4) |
| C1.5 empty columns-media (missing cards) | 4 food-and-beverages |
| C1.6 partner tiles | 4 digital-self-services |
| C1.7 sub-nav / meetings / lounges nested / webchat | 4 / 4 / 4 / 1 |

The other hub pages (baggage/gepaeck, flights/fluege, overview-flights, overview-manage, overview-special-request, services-on-board) are at 0.96-1.0x and share none of these causes. Every fix except harness changes needs a hub re-import: `build-import-script.js hub`, the bundle rebuild, then import.

Scratch helpers are in `/tmp` (`tree.js`, `sig.js`, `ink.js`, `rowbg.js`, `snip.js`, `show.js`); the full per-page structure list is `/tmp/sig-all.txt`.
## C2 Campaign template: page start (diagnosis only)

**Summary.** The stage itself matches live. Its height (810, or 350 for `narrow`), its position (y182 at 1440/768) and the stage text are within 1px of live. Example: de/en/100-years h1 ink 493-529 live vs 494-529 replica, subline 570-593 vs 569-594, x89. The breadcrumb is also unchanged. The divergence at y=200-400 has two sources:
- **The stage video frame** (C2-1). This is the whole y=200 band on all three named pages.
- **A fixed 64px gap under the stage** (C2-2). This is the first real layout cause. On at/de/100-years/cabin-design it starts the running offset at every width; on de/en/100-years and menu-on-board only at 390.

Below that come the intro indent (C2-3) and three smaller causes further down (C2-4 to C2-6).

**Staleness.** Campaign content was imported 02:25-02:34 and previewed 02:36-02:47. The shots were taken 07:14-09:11, so they are current for the three named pages. Exceptions where the shot predates the content: destinations and stopover pages (content 13:45/16:12), and at/de and gb/en, which mostly have no replica shots. Code commits after the shots don't affect the page start:
- 823f08e: video code moved to `styles/media.css`.
- 9f95930: `{limited-width}`, only takes effect after a re-import.
- f060c5e: AirCore section styles.

None of them touches `hero-campaign` or section spacing.

### Running offset after the stage (replica minus live, ink y)

| page | width | gap under stage (live / replica) | further down |
|---|---|---|---|
| de/en/100-years | 1440 | 64 / 64 (signet at 1056 on both) | intro text −9 (x88 vs x168); sidebar image −17; "A century…" image −72 (2083 vs 2155) |
| | 768 | 64 / 64 | text −8, 3 lines vs 4; sidebar −43 |
| | 390 | 44 / 64 (**+20**) | header 140 vs 144 (−4, every template); text +28, 6 lines vs 10; sidebar −61 |
| de/de/…/history/menu-on-board | 1440 / 768 | 71 / 71 (text at 1063 on both) | collage −26 (C2-5) |
| | 390 | 51 / 71 (**+20**) | |
| at/de/100-years/cabin-design | all widths | 68 / 132 (**+64**) | the whole page is shifted +64 |

There is also a constant ~7px gap I could not explain without rendering the page. It sits between the signet image and the intro text on 100-years: live 104 (40 + 24 + 40, confirmed at all three widths), replica 88 by the CSS but ~94-95 measured. It needs a DevTools check on a fresh capture.

### C2-1 Stage video frame (can't be fixed in the page; affects the comparison)
- **Evidence:** the first live stage is a playing `.dcep-moving-image` video and the replica plays the same mp4, so each capture shows a different frame. On video stages, bands 1-4 differ by 0.30-0.83. On pages whose stage is a still image (crane, global-network, campaigns) the same bands differ by only 0.01-0.15. impossible.md already lists this ("hero videos captured at whatever frame").
- **Pages (28):** the 7 video-stage pages (100-years, 100-years/cabin-design, chronicle, destinations, fleet, history, history/menu-on-board) × 4 locales (de/en, de/de, at/de, gb/en). 36 video stages in total in campaign content.
- **Fix (harness, not the site):**
  - For the existing shots: mask the stage box when it holds a video (`.cms-inspiration-teaser:has(video)` / `.hero-campaign:has(video)`; 1440: y182-991 or 182-531 for narrow).
  - On the next live recapture, run `video.pause(); video.currentTime = 0` and wait for `seeked` on both sides. Both sides use the same mp4, so the frames would match and the stage text would stay comparable.

### C2-2 The gap under the stage is a fixed 64px; on live it depends on the page's markup
- **Cause:** `blocks/hero-campaign/hero-campaign.css` (end of file) sets `main > .section > .hero-campaign-wrapper + div { margin-top: 64px }` and `main > .section:has(> .hero-campaign-wrapper:last-child) { margin-bottom: 64px }`. On live the gap is the sum of:
  - `.mb-default` (24px) on the stage section's wrapper, which is sometimes missing (`<div class=" ">`);
  - any separators inside the stage section (`.hr-no-layout` with `margin-bottom: 60px`, plus the 1px divider);
  - the next AEM section's `.section-padding-y-regular` (20px, or 40px from 768px).
- **Importer side:** `lufthansa-sections.js` (around lines 173-181) skips the `padded` style after an unpadded stage. It also adds no section break after the stage, so on menu-on-board, crane and history the next content shares the stage's section.
- **Measured** (ink gap under the stage, live / replica, 1440 · 768 · 390; ink starts about 7px below the box):

| group (live markup) | pages | live | replica | after fix |
|---|---|---|---|---|
| A: `.mb-default`, no separator, next section padded | 100-years, history/menu-on-board, campaigns, chronicle ×4 = 16 | 65·64·44 | 64·64·64 | 24+40 / 24+20 |
| C: no `.mb-default`, 60px separator | cabin-design ×4 | 68·68·68 | 132·132·132 | 61 |
| D: `.mb-default`, separator, next padded | destinations ×4 | 133·132·111 | 101·101·100 | 61+24+40 / +20 |
| E: `.mb-default`, separator, next unpadded | fleet ×4 (+9/+8/+8); history ×4 (+39/+40/+40) | 91 / 86 | 100 / 125 | 61+24 |
| F: no `.mb-default`, next padded | crane ×4 | 47·47·27 | 71·71·71 | 40 / 20 |
| G: no `.mb-default`, next unpadded (sidebar 40/20) | global-network ×4 | 46·46·25 | 111·110·89 | sidebar only |
| stopover ×4 | — | already = live | | unchanged |

- **Fix: importer plus CSS, keyed on a new section style.** Pages that are not re-imported keep the 64px rules.
  1. `tools/importer/transformers/lufthansa-sections.js`, in `beforeTransform` after the padded loop:
     ```js
     // a stage (.inspirationteaser) is an AEM section of its own: style stage (+ flush without
     // .mb-default, + before-padded when the next AEM section is .section-padding-y-regular and not
     // grey); a break after it so the next AEM section never shares the stage's section
     const stage = (s) => !!s.querySelector(':scope > div > .section-content > .inspirationteaser');
     aemSections.forEach((s, i) => {
       if (!stage(s)) return;
       const next = aemSections[i + 1];
       const styles = ['stage'];
       if (!s.querySelector(':scope > .mb-default')) styles.push('flush');
       if (next && padded(next) && !grey(next)) styles.push('before-padded');
       const start = createBreak(document);
       start.setAttribute(SOURCE_STYLE, styles.join(' '));
       s.before(start);
       if (next) next.before(createBreak(document));
     });
     ```
     Empty and duplicate breaks are already merged by `dropEmptyBreaks`. A first-section style works through the existing FIRST logic. Separators inside the stage section stay `{spacer-N}` right after the hero.
  2. `blocks/hero-campaign/hero-campaign.css`, appended after the 64px rules. The equal-specificity rule is later in the cascade, and the `:last-child` selector outranks the spacer-only-wrapper rule in styles.css (0,4,2):
     ```css
     /* section style stage: separators directly under the stage; the section ends with .mb-default
        (none with flush) plus, with before-padded, the next section's 2rem / 4rem (768px+) */
     main > .section.stage > .hero-campaign-wrapper + div,
     main > .section.stage > .hero-campaign-wrapper + .default-content-wrapper:last-child { margin-top: 0; }
     main > .section.stage:has(> .hero-campaign-wrapper) { margin-bottom: var(--spacing-default); }
     main > .section.stage.before-padded:has(> .hero-campaign-wrapper) { margin-bottom: calc(var(--spacing-default) + var(--section-padding)); }
     main > .section.stage.flush:has(> .hero-campaign-wrapper) { margin-bottom: 0; }
     main > .section.stage.flush.before-padded:has(> .hero-campaign-wrapper) { margin-bottom: var(--section-padding); }
     ```
- **Other templates:** the same live structures appear there (first stages: 64 like group A in info/fleet, 14 `.mb-default` + 40px separator such as my-bookings → 65, 4 additional-services with a 60px separator hidden below 768px → 61 / 0, first-class 80-150px separators). So a re-import is needed for every template that has hero-campaign: campaign 48, info 92, fleet 20, hub 8, form 4, app-entry 4 (176 pages).
- **Spot-checks:** de/en/100-years, de/de/100-years/history/menu-on-board, at/de/100-years/cabin-design, de/en/100-years/{destinations, fleet, history, crane, global-network}, de/de/book-and-manage/stopover (should be unchanged), de/en/my-bookings, de/de/additional-services, de/en/boeing787, de/en/first-class, de/en/discover-lufthansa/new-onboard-experience (stages further down the page).

### C2-3 Intro paragraph indent is dropped
- **Evidence:** live `<p style="margin-left: 80.0px">` sits in `.richtext.limited-width`. Live text starts at x168 at 1440 (x104 at 768, x102 at 390); the replica starts at x88/24/22. Line counts: 3/4/10 live vs 3/3/6 replica, so −27px at 768 and about −108px at 390.
- **Pages:** campaign 4 (`{de/en, de/de, at/de, gb/en}/100-years`). Info 4 (`assistenzhunde`, 40px, 8 paragraphs each).
- **Fix (needs a re-import):**
  - Cleanup paragraph styles (around line 1006-1050): an inline `margin-left: Npx` on a `.richtext` p appends the token `indent-N`.
  - `scripts.js`: add `indent-\d{1,3}` to `PARAGRAPH_STYLE`; for that token set `class="indent"` and `--indent: Npx`.
  - `styles.css`:
    ```css
    main .default-content-wrapper > p.indent { margin-left: var(--indent); }
    @media (width >= 1025px) { main .default-content-wrapper > p.indent:not(.full-width) { max-width: calc(66% - var(--indent)); } }
    ```
  - Expected: 744px at x168 at 1440 (66% − 80, like live); auto width minus 80 below 1025px.

### C2-4 Sidebar inside a one-column view (100-years ×4; follow-up, below the page start)
- Live wraps "Under the symbol of the crane" in `.onecolumn > .column-view:only-child`, which gets `.section-content .column>.column-view:only-child{padding-block:3.2rem}`. The `.sidebar-content` image also keeps `.image .image-wrapper{margin-bottom:4rem}` (it is a flex item).
- Live: 136px from text to image, 156px from image to the next image (40 + 20 + 32 + 24 + 40, the next section is padded).
- Replica: 128 (−8) and 94 (−62).
- The replica's 48px section gap vs live's 24px `.mb-default` means a new `columns-media` option needs local measurement before I can give exact numbers.

### C2-5 25px separators are dropped
- `SEPARATOR_MIN_SPACE = 50` in `lufthansa-cleanup.js` drops the default 2.5rem separators. On live these add 26px to the text's 24px margin.
- On menu-on-board the collage sits 26px too high at 1440 and 768: 1215 vs 1241.
- Such separators appear on 52 campaign pages (268 separators), 220 info pages (653) and others.
- Keeping them as `{spacer-25}` is a candidate fix. It needs broad re-verification because the D14 spacer arithmetic assumes component spacing.

### C2-6 Moving images imported as click-to-play
- `parsers/columns-media.js` (around line 208) treats `.moving-image-play-button` as "no autoplay". The newer snapshots show that toggle on the same component that has no button in de/en (same config).
- Live at/de/100-years shows the video playing: a waving flag, while the poster shows a man at a cockpit window. The replica shows the poster with a square play button.
- **Affected:** 9 campaign pages, 11 videos (de/de, at/de and gb/en 100-years and cabin-design, plus de/de, at/de and gb/en chronicle). Insights also has 11 videos on 9 pages.
- **Fix:** always write `{autoplay muted loop}` for `.dcep-moving-image` videos and ignore the toggle. Re-import needed.

**Outside C2:** the header is 140px vs 144px at 390 on every template (homepage and baggage show the same −4). The replica is also laid out 15px wider at every width (1264 vs 1249 content); that's the comparison-width issue another agent is fixing.

Scratch scripts are in /tmp (`after.js`, `stage2.js`, `rows.js`, `white.js`, `mi.js`, `sep.js`); `/tmp/stage-detail.tsv` holds the per-stage classification. No repo files were changed.
## C3 Insights (128 pages, template `insights`)

This was code-only: I read the shots, the live screenshots, the raw snapshots and the live CSS (`tools/source-export/static/app.5ad288dc.css`) as files, and fetched the previewed HTML of de/en eat-see-do-berlin once. No repo file was edited. Coordinates are page pixels.

**Shots and staleness.** 69 of the 128 pages have a compare in `/tmp/pages.json`. The other 59 (at/de and gb/en articles, tags, highlights) have no compare yet. 29 of the 69 are stale (content or preview newer than the shot), including de/en eat-see-do-berlin, whose shots are from 10-22 23:06.

Since the stale shots, no commit has touched `blocks/article-header`, `blocks/price-bar` or the article CSS (last change 99d8c36, 10-22 15:18). The live preview of de/en eat-see-do-berlin has the same article header as the shot: a `full-bleed` section, no tags in the content, tags only as `meta property="article:tag"`. So causes 1-4 below apply to the replica as it renders now.

**Not a harness offset on these pages.** The replica article shots were taken at the same width as live (`*-eds.png.json`: contentWidth 1425/753/375, `contentWidthMatched: true`). So the ~8 px stage height and the 7.5 px image offset on article pages come from the block (cause 3), not the comparison.

**First divergent band.** At 1440: 9 at y0 (cause 5), 23 at y200-400, the rest 600-4000. At 768: 9 at y0, 27 at 200-400. At 390: 9 at y0, 29 at y200, partly from the 4 px header (see the last section). The late bands (essentials-*, know-before-you-go) are only the 0.3 threshold: text-heavy bands stay under it even though everything below the stage is shifted.

On de/en eat-see-do-berlin at 1440, causes 1-4 add up to -65 -21 -31 +8 +8 = -101 px. The measured offset of the first h3 is -102 px (live 1426, replica 1324). On 7-people at 390 they add up to -137 px, plus 4 px from the header, against -141 measured.

### 1. Tag chips never render on aem.page (96 article pages)
- **Cause:** `blocks/article-header/article-header.js` line 116 reads `getMetadata('tags')`. The pipeline writes the Tags row as `<meta property="article:tag">` (one per tag), and there is no `meta name="tags"`.
  - Locally the shim `applyDocumentMetadata` in `scripts/scripts.js` writes `name="tags"`, which is why chips show on localhost but not on preview.
- **Evidence:** live chips "Food / Eat See Do / Berlin" are 40 px tall:
  - 1440: y 885-924;
  - 768: y 572-611 at x 83;
  - 390: y 466-505.
  - The replica has none, so the h1 and everything below sit 65 px higher (5 + 40 + 20).
  - All 96 article documents have a `tags` row.
- **Fix (JS only, no re-import):** line 116:
  ```js
  const tags = (getMetadata('tags') || getMetadata('article:tag')).split(',').map((t) => t.trim()).filter(Boolean);
  ```

### 2. Article header panel uses the full page width, not the content column (96 pages)
- **Cause:** the sections transformer gives `.image-wrapper.full-width-bg` the style `full-bleed`, and the whole `article-header` block sits in that section. `main > .section.full-bleed > div { max-width: none; padding: 0 }` removes the layout margin. The panel's `margin: -12% 4.1667% 0; padding-inline: 4.1667%` and the intro's 10%/80% are then taken from 1425 px instead of 1249 px (live `.article-content` sits in `.container-content`).
- **Evidence (live vs replica):**

  | width | live | replica |
  |---|---|---|
  | 1440 panel x | 140-1285 | 59-1366 |
  | 1440 h1 x | 192 | 118 |
  | 1440 intro | 296-1129 (832 wide) | 237-1188 (951 wide) |
  | 1440 panel top | 854 (12% of 1249 = 150) | 12% of 1425 = 171, 21 px higher |
  | 768 panel | 53-700 | 31-722 |
  | 768 h1 / intro x | 85 / 142 | 66 / 129 |
  | 390 text x | 22-353 | 0-375 |

  Because the intro is wider it wraps into fewer lines:
  - Berlin at 1440: 9 lines instead of 10.
  - 7-people at 1440: 5 instead of 6.
  - 7-people at 390: h1 3 lines instead of 4, intro 9 instead of 11.
- **Fix (CSS only, no re-import):** in `styles/styles.css`, extend the existing breadcrumb rule (line 718):
  ```css
  /* article pages: the header panel keeps the content column (live .article-content inside
     .container-content); the feature image breaks out by itself (article-header-media) */
  main > .section.full-bleed > :is(.breadcrumb-wrapper, .article-header-wrapper) {
    max-width: var(--content-max-width);
    padding: 0 var(--layout-margin);
  }
  ```
  - Selector check: specificity (0,3,1) beats `main > .section.full-bleed > div` (0,2,2), and `margin: 0 auto` stays.
  - The rule only reaches the 96 article sections. Other full-bleed sections are 27 image-only stages and 72 AirCore flight-search sections, plus the 4 author pages (cause 6), none with an article-header.
  - `.article-header-media` keeps breaking out with `calc(50% - 50vw ...)`.
  - Expected after the fix, at 1440 (1249 column): panel 140-1285, h1 x 192, intro 832 wide. At 768: 53-700, intro x 142. At 390: x 22.

### 3. Feature image is 100vw wide (scrollbar not subtracted), stage 8 px too tall (96 pages)
- **Cause:** `updateScrollbar()` (article-header.js lines 270-275) runs during decorate, while the body is still hidden and the page has no scrollbar yet, so `--article-header-scrollbar` stays 0. The scrollbar appears later without a resize event. The image is therefore `100vw` wide (1440/768/390 px in a 1425/753/375 layout), cropped about 7.5 px on each side.
- **Evidence:** image heights live vs replica:
  - 1440: 202-1003 (802 = 1425×9/16) vs 202-1011 (810 = 1440×9/16);
  - 768: 424 vs 432;
  - 390: 211 vs 219.
- **Fix (JS only):** replace `window.addEventListener('resize', updateScrollbar, { passive: true });` with:
  ```js
  // the scrollbar appears after decorate (body still hidden) without a resize event
  new ResizeObserver(updateScrollbar).observe(document.documentElement);
  ```

### 4. Byline to body 8 px too far (96 pages)
- **Evidence:** from the byline glyph top to the first body element:

  | page | width | live | replica |
  |---|---|---|---|
  | 7-people (h3 first) | 1440 | 66 | 74 |
  | Berlin (h3 first) | 1440 | 67 | 75 |
  | Berlin | 768 | 63 | 71 |
  | 7-people | 390 | 62 | 70 |
  | flying-high (p first) | 1440 | 69 | 78 |

  44 pages start the body with an h3, 52 with a p.
- **Cause:** the replica gap is meta `margin-bottom: 40px` plus the 48 px section gap (the empty price-bar section collapses into it) = 88. Live is 80.
- **Fix (CSS only):** `blocks/article-header/article-header.css` line 100, `.article-header .article-header-meta { margin: 0 0 32px; }`, with the comment `/* live 80px to the first component: 32 + the 48px section gap */`.
- **Spot-checks for 1-4** (live = expected):
  - de/en eat-see-do-berlin at 1440: chips 885, h1 glyph 953, intro 1022 (10 lines), byline 1359, h3 1426.
  - The same page at 768: chips 572, h1 639, intro x 142, y 700, h3 1217.
  - de/en 7-people at 1440: intro 1075 (6 lines), h3 1355.
  - de/en 7-people at 390: replica = live minus the 4 px header (h3 1086).
  - flying-high at 1440: first p at 1235.

### 5. 9 de/de live captures are unstyled (capture issue, not the replica)
- **Pages:** de/de articles/authors/florian-tomberg, articles/explore-flying, its 5 articles (7-people, anniversary-super-crane-special, essentials-future-of-flying, flying-high-christoph-quarch, inflight-entertainment-vr-experience), and explore-the-world/a-perfect-day-barcelona-in-one-day and a-perfect-day-berlin-in-one-day.
- **Evidence:** the JPGs were captured 2026-10-22 04:54-04:57 at 1440/768/390. Header, chips and h1 render without the app CSS (white rows 0-20 and a skip-link list, a 45 px header bar, h1 at body size, collapsed footer). These are exactly the 9 pages with first band y0 and ratios of 0.78-1.49.
- **Fix:** recapture these 9 (harness). de/de explore-the-world already has new PNGs (B10) and is fine.
- **Author page 1.26x:** this is the unstyled capture. Live is 1473 px because of the 45 px header and roughly 230 px collapsed footer; the replica has a 122 px header and a roughly 560 px footer. The article list is not the reason: live and replica both lack it (the snapshot holds the "Loading..." loader, B10 open).
  - Replica-side problems, which still need a working snapshot: the content contains `<p>Loading...</p>` and an empty `<div class="carousel-cards"></div>`. de/en's replica (3259 px) shows about 1400 px of list and slider are missing on de/de.

### 6. Author pages: the whole page is in the banner's full-bleed section (4 pages)
- **Cause:** `styledRegions` in `tools/importer/transformers/lufthansa-sections.js` walks up from the banner `.image-wrapper.full-width-bg` to the child of `.container-content`, which is the whole `.author-details-page`. So the h1, bio, article list and author slider all end up in the full-bleed section, at x=0 with no layout margin (live h1 at x 192, bio 296-1129).
- **Fix (importer, then re-import the 4 author pages):** add `.author-details-page` to `REGION_STOP` (line 41), so that only `.author-feature-image` becomes full-bleed.
  - Then style the author content from the live CSS: `.author-content` has padding 6rem 0 and, from 768px, margin- and padding-inline 4.1667%; the h1 is 2.8-3.6rem with 4rem below; `.richtext` is 10%/80%.
  - Default-content CSS for this: children `margin-inline: 8.333%`, the bio p `16.667%`.
- **Spot-check:** de/en authors/florian-tomberg at 1440.

### 7. Author quotes imported as plain paragraphs (28 pages)
- **Pages:** flying-high-christoph-quarch, inflight-entertainment-vr-experience, on-the-scene-caspar-plautz-munich, on-the-scene-food-trends-istanbul, stop-over-tokyo, what-i-learned-living-in-barcelona and allegris-premium-economy-san-diego, in 4 locales each.
- **Live:** `.authorquote .author-quote`, CSS `margin: 6rem 0` (8rem from 768px), `max-width: 62.2rem`, quote LufthansaHead bold 2.8-3.6rem/110%, subline LufthansaText 300 16px/150% with 1rem above.
  - Measured on on-the-scene: quote at x 234 / 104 / 38 (article column + 40/20/16 px), lines 39.6 px apart at 1440; the paragraph before ends 1416 and the quote starts at 1508.
  - The replica shows `<p>"…"</p><p>Dominik Klier</p>` as body text.
- **Fix (importer + CSS):** in `lufthansa-cleanup`, turn `.dcep-author-quote` into `<blockquote><p>{quote-text}</p><p>{subline-text}</p></blockquote>`, then re-import. In `styles/styles.css`:
  ```css
  main:has(.article-header) .default-content-wrapper > blockquote { max-width: 622px; margin: 60px 0 60px 16px; padding: 0; }
  main:has(.article-header) .default-content-wrapper > blockquote > p:first-child { margin: 0; font-family: var(--heading-font-family); font-size: var(--heading-font-size-xl); font-weight: 700; line-height: 1.1; }
  main:has(.article-header) .default-content-wrapper > blockquote > p + p { margin: 10px 0 0; font-family: var(--body-font-family); font-size: 16px; font-weight: 300; line-height: 1.5; }
  @media (width >= 768px) { main:has(.article-header) .default-content-wrapper > blockquote { margin: 80px 0 80px calc(8.333% + 20px); } }
  @media (width >= 1025px) { main:has(.article-header) .default-content-wrapper > blockquote { margin-left: calc(8.333% + 40px); } }
  ```

### 8. Parallax images at their natural height instead of a 500 px window (8 pages, 24 images)
- **Pages:** picture-perfect-austin (5 images) and stop-over-tokyo (1), in 4 locales.
- **Live:** `.parallax .parallax-content { height: 50rem }` at all widths. Measured on de/de austin: 1714-2217 and 2467-2967 at 1440, 1864-2365 at 390.
- **Replica:** 1587-2318 (732 = 1053×1000/1440), so +232 px per image at 1440 and about -270 px at 390.
- **Fix (importer + scripts + CSS):** cleanup appends `{parallax}` to the image paragraph when `data-dcep` has `isParallaxEnabled: true`, then re-import. Add `parallax` to `PARAGRAPH_STYLE` in `scripts/scripts.js` (line 204). Then:
  ```css
  main .default-content-wrapper > p.parallax img { height: 500px; object-fit: cover; }
  ```

### 9. Article image galleries: images side by side and captions dropped (48 pages)
- **Pages:** 12 articles × 4 locales whose `columns-media` cell holds two pictures (anniversary-super-crane-special, a-perfect-day ×2, be-picky ×2, in-my-hood ×2, on-the-scene ×2, picture-perfect-austin, what-i-learned ×2).
- **Live (austin at 1440):** left column 192-702 with a 1:1 image at 3200-3714 and its caption. Right column 722-1232 with two 1920×823 images stacked (3203-3425 and 3504-3729), each with a caption about 10 px below.
- **Replica:** the right images sit side by side in `.columns-media-multi` (107 px tall) and there are no captions.
- **Fix (importer + block, re-import):** the columns-media parser keeps the figcaption `maui-caption` as `<p>… {caption}</p>` after each image. It writes a new option `stacked` when one `.column-view-item` holds several `.image` components. Block CSS: `.columns-media.stacked .columns-media-multi { flex-direction: column; }` with the caption 10 px below and about 54 px to the next image.
  - Keep the default side-by-side: 100-years and fleet/cabin pages (98 blocks) use it.

### 10. Category and tag pages: three unmapped components (24 page-slots, 20 distinct pages)
- **(a) Two-column image and text teasers stacked** (12 pages: highlights, highlights/all-it-takes-is-a-yes, tags/munich, ×4 locales).
  - Insights only maps `.twocolumn` inside `.article-content`. Live: image and text side by side in a grey band. Replica: full-width image, then text. This is the highlights 1.12x at y800 and all-it-takes 1.19x.
  - **Fix (importer):** add the info-template instance `:is(.section-content, .container-content) > .twocolumn:not(:has(.table, .teaser, .poimapping, .stage, …))` to insights `columns-media` (same exclusion list as info, keeping `.videoViewer`).
- **(b) Accordions flattened** (8 pages: tags ×4, explore-the-world ×4).
  - Live has 3 columns of collapsed `maui-collapsible-item`s (North America, Europe, Asia...; rows 51 px apart, columns at x 102/496/920). The replica drops the headlines and lists everything (172 / 148 list items). This explains most of tags at 4.03x.
  - **Fix (importer):** map `.accordion` in insights to accordion-columns (the parser gives the options `faq spaced`).
  - Optional block option: wrap consecutive accordions of one column view in a 3-column grid from 768px, the way `carousel-lightbox-pair` wraps the half-width slideshows.
- **(c) Podcast carousel stacked** (explore-the-world ×4, 17 `a.teaser.card` slides, live 297.25 px + 20 px, 4 per view plus a peek).
  - The replica stacks the 1000×1000 images one per row, which is the 1.27x (already noted as open in B10).
  - **Fix (importer):** add `.carousel:has(.swiper-multi-slide a.teaser.card)` to insights `carousel-cards`, the same selector and branch as campaign item 4 (four-up carousel).

### Known or out of scope (not counted above)
- **POI maps hidden for lack of recorded points (B8):** 28 insights pages.
- **Result count, search and pagination of the blog lists not imported (item 2):** explore-flying ×4 at 0.95.
- **Price bar shows no price ("Round trip from 141.26 €\*" on live):** on all 57 price-bar pages the price stays hidden in the shots (no fare answer). This is data, not layout, and the bar is fixed so it moves nothing.
- **Site-wide, 390 only:** the header is 140 px against live 144 (`--nav-height: 140px`, `styles/styles.css` line 104). Everything at 390 sits 4 px high, which explains part of the y=200 bands at 390 on every template.

**Scratch scripts:** /tmp/c3rows.js, /tmp/c3col.js, /tmp/c3count.js, /tmp/c3fb.js, /tmp/c3unstyled.js, /tmp/c3twocol.js, /tmp/c3gal.js.
## C4 Info (676 pages, template `info`)

Code-only, 2026-10-23: shots, live screenshots, raw snapshots, `content/*.plain.html` and the live CSS
(`tools/source-export/static/app.8c42f486.css`, `index.KLnJf0H_.css`) read as files. Nothing was
captured, imported or previewed. Coordinates are page pixels (1440 = the 1425 px live layout).

**Sample.** 354 of the 676 pages have compares (1009 page-widths; at/de and gb/en only 24). I read
side by side and measured ink rows on: the two examples (de/de kinder-an-bord 1440/390, de/en
flying-with-small-children 1440), the worst (de/de first-class-terminal, de/en economy-class,
first-class, business-class, pax-receipt, travelling-with-special-requirements@768, shopping,
traveltricks, lounge-companions, cash-and-miles), the median band (upgrade-info, admission-rules,
get-your-guide, internet-overview, menus-on-long-haul-flights) and at/de, gb/en first-class. The
structural counts below come from scanning all 676 snapshots (`/tmp/c4/causes.js`).

**Staleness.** 427 of the 1009 info shots are older than the current content (imported 10-23
03:09-05:00, a few later); 752 are older than the latest preview (10-23 17:00-18:30). Every cause
below was checked against the current content and code, not only the shot.

**Harness, all widths: the replica is laid out 15 px wider than live.** In every info shot, old
and new (de/en europcar 10-23 20:10 too), the replica content runs 88-1352 at 1440 (1264 px), 24-744
at 768 and 22-368 at 390, against 88-1337 / 24-729 / 22-353 live; the header ink ends at 1339 vs
1325 (de/de kinder-an-bord). `contentWidthMatched` is true in the metrics, so the layout widens
during the full-page screenshot (no scrollbar while the viewport is the page height) despite the
`overflow-y: scroll` style in `capture.js`. Text wraps into fewer lines in the replica, worst at
390, where the column is 4.5 % wider (345 vs 331 px): kinder-an-bord 390, row 1 text 6 vs 7 lines.
This is part of "mobile is worse" and of every height deficit below.
- **Hand-over (harness):** check `document.documentElement.clientWidth` right before
  `page.screenshot`, or shoot viewport-height tiles instead of `fullPage`.

### C4-1 Column-view padding is missing (429 pages, 1751 column views; the main y≈400-1200 cause)
- **Cause:** live `.section-content .column>.column-view:only-child { padding-top: 3.2rem;
  padding-bottom: 3.2rem }` at every width (specificity 0,4,0 beats the `:first-child` /
  `:last-child` zero rules). Every one/two/three/four-column view in an AEM section has 32 px above
  and below its content, and its last component has no margin. The replica has nothing for it:
  - columns-media from a top-level `.twocolumn`/`.threecolumn`/`.fourcolumn`: wrapper margin 24
    only;
  - a `.onecolumn` is flattened into default content: `* + h2 { margin-top: 40px }` (20 below
    768) is all the space it gets, and inside the column the same rule adds 16 px too much;
  - grey bands that are one column view: section padding 40 only.
- **Evidence:**
  - kinder-an-bord 1440: intro text ink bottom 396 → first image 456 live, 424 replica (−32);
    the same at 390: 475 → 539 live, 471 → 503 (−32). Rows to rows are fine (64 live, block gap
    66). Last link → footer: 32 + 5 live, 47 + 5 replica.
  - flying-with-small-children 1440, image → onecolumn h2: 804 → 883 live, 809 → 857 (−26 with
    the 5 px taller replica image); onecolumn end → accordion −24; grey teaser band: title 77 px
    and cards' end 72 px from the band edges live, 47 / 40 replica.
  - economy-class grey band (one `.twocolumn` in a grey AEM section): content 72 / 70 px from
    the band edges live, 40 / 40 replica.
  - get-your-guide: image 674 → text 754 live, 678 → 710 replica (−48: `.image-wrapper`
    margin 4rem + 32 vs 24); mid-column h2 after a list: 33 live, 50 replica (+17).
  - admission-rules (six onecolumns): first text 314 live, 282 replica.
  - C7 measured the same 31 px on fleet (h2 → first columns-media row 72 vs 41).
- **Fix, part 1 (importer + block, implemented):**
  - `tools/importer/parsers/columns-media.js`: option `padded` when the source is a top-level
    column view (`.section-content > .column > .column-view:only-child`), without a column title,
    not grey, not an article.
  - `blocks/columns-media/columns-media.css`: `.columns-media.padded { padding: 32px 0 8px }`.
    That gives 56 after text (24 + 32), 64 after a heading (32 + 32), 32 to the next component
    (8 + 24) and 56 at the end of a section (8 + 48). Merged rows keep the 66 px gap (live 64).
- **Fix, part 2 (importer + CSS, implemented):**
  - `tools/importer/transformers/lufthansa-sections.js`: a grey region that is one top-level
    column view (the column view itself grey, or the grey AEM section's only component) gets the
    extra style `column-view`.
  - `styles/styles.css`: `main > .section.grey.column-view { padding: calc(var(--section-padding) + 32px) 0 }`.
- **Hand-over (not implemented):**
  - one-column views flattened into default content (262 pages, 744 views);
  - titled two-column views, whose title is default content before the block (97 pages, 140);
  - column views of `.container-content` (no `.section-content`: `.column-view` padding 4rem/2rem,
    from 768px).

  These need either a section per column view or a start/end marker on the first and last
  element. Both change many tuned spacings (`* + h2`, padded sections) and need a browser pass.
  Expected live values: text → onecolumn 56, image → onecolumn 72, onecolumn → onecolumn 64,
  inside a column h2 after text 24, last column → next 32.
- **Pages:**
  - part 1: 247 pages (620 untitled column views that are not grey);
  - part 2: 142 pages (180 grey regions: a top-level grey column view or a grey AEM section of
    one column view; teaser bands "This may also be of interest to you", grey image/text rows).
  - Other templates get both on their next import (part 1 / part 2 pages): hub 24 / 18,
    campaign 48 / 24, fleet 20 / 20 (the C7 31 px), legal 12 / 2, form 4 / 0, app-entry 8 / 8.
    Insights articles are excluded; flight-status is not affected (its column views are nested in
    a onecolumn, C6 compensates there).
- **Spot-check:** de/de/kinder-an-bord 1440 (first image at 456, footer 37 px under the last
  link) and 390 (image at 539); de/en/flying-with-small-children 1440 (band title 77 px under the
  band top).

### C4-2 The sub-page navigation is lost: content is full width, its links end the page (180 pages)
- **Cause:** `.contentpage-wrapper.has-subnav` pages have
  `.content-wrapper > .container-subnav > nav.subpage`: "More information around this topic",
  the parent page's title and its child pages, the current one bold without a link. The cleanup
  removes the nav's `<header>` (the chrome selector `header`), and the remaining `<ul>` becomes a
  bullet list after the content.
- **Live CSS:**
  - from 768px: `.container-subnav { position: absolute; inset: -20px 0 auto auto; width: 25%;
    padding-left: 10px }`, `.subpage { padding: 15px; margin-bottom: 2rem }`;
  - every component is `width: 75%; padding-right: 10px`, a column view row 75%;
  - `.subpage header span` 16px/150%, `h2` LufthansaHead 300 22-28px with 1rem above;
  - `li { padding: 2.4rem 1rem 1rem; border-bottom: 1px solid #ccc }`, the first li 1rem on top;
  - `a` 18px/150% regular with a chevron; `.active span` bold, no chevron.
  - Below 768px the nav follows the content, with no padding.
- **Evidence (de/en/upgrade-info, 1440):**
  - live image 88-1014 x 275-570 (927 = 75 % − 10) and nav text x 1060-1307 from y 276;
  - replica image 88-1351 x 275-678, so 108 px taller, every text line wider, and 8 bullet
    links at the end (y 1490-1770);
  - at 390, live list rows are 62 / 89 px with chevrons at x 338.
  - 180 pages have the nav; no stage, teaser band or padded section among them. Median at 1440 is
    28.6 % with the nav against 19.1 % without it.
- **Fix (implemented):**
  - new parser `tools/importer/parsers/subpage-nav.js` (eyebrow, title, list; the current page
    `<strong>`), mapped as `.container-subnav:has(nav.subpage)` in info, in its own last section;
  - new block `blocks/subpage-nav` (box, chevrons, from 768px absolute at the content's top
    right, 20 px above the first element after the h1);
  - `styles/styles.css`: on `main:has(.subpage-nav)` from 768px, everything else ends 25 % + 10 px
    before the column's right edge, and running text loses its 66 % limit (the live 75 % wins
    over `.limited-width`).
- **Spot-check:** de/en/upgrade-info at 1440 (image 927 wide, nav at x 1050) and 390 (bordered
  list after the text, 20 px above the footer); gb/en/tiere-als-uebergepaeck.

### C4-3 Tables are flattened into paragraphs (64 pages, 108 tables)
- **Cause:** info maps no `div.table` (`.cms-table-maui-wrapper > maui-table`). Only fleet maps it,
  to table-striped. The rows become runs of text and stray footnote digits ("✓ ✓ First Class
  passengers ... 1").
- **Evidence:**
  - de/en/admission-rules 1440: "Lounge access on departure" with an 8-row zebra table
    (`maui-table equalcolumns`, header row #f5f5f5, 91 px rows) from 1084 to 1881 live; the
    replica has 28 short paragraphs (993-1890), and the page is 7798 vs 7261 px.
  - lounge-companions: three tables of two rows, rendered as one line each.
  - Live h2 → table is 65 px, the same as fleet's 67 that table-striped already uses.
- **Fix (implemented):** `page-templates.json` info: `table-striped` for
  `div.table:has(.cms-table-maui-wrapper):not(.accordion div.table)`, listed after
  accordion-columns. 156 more tables sit in accordion panels on 24 pages (collapsed on live; the
  accordion parser still flattens them, hand-over). The header row is kept as the first, grey row,
  as live draws it.
- **Spot-check:** de/en/admission-rules 1440 (table 1084-1881), de/en/lounge-companions.

### C4-4 Three- and four-column rows are three/four wide at 768 (163 pages; CSS only)
- **Cause:** every `.threecolumn`/`.fourcolumn` item is `col-md-6 col-lg`, so 2 per row from
  768px and all in one row only from 1025px. `columns-media` uses `repeat(--columns-media-cols)`
  from 768px.
- **Evidence (travelling-with-special-requirements 768):**
  - live: 2 per row (images x 24-366 and 388-729); the third item at y 869 under the first, 44 px
    after the link above (link `.maui-link` 2.4rem + item 2rem);
  - replica: 3 per row, 3226 → 2226 px.
- **Fix (implemented):** `blocks/columns-media/columns-media.css`: rows with 3+ cells
  `repeat(2, …)` and row-gap 44px from 768px, `--columns-media-cols` from 1025px.
- **Pages:** 163 info, 4 hub, 4 form (current content, no re-import needed).
- **Spot-check:** de/en/travelling-with-special-requirements 768,
  de/en/during-your-trip/internet-overview 768.

### C4-5 Travel-class sub-navigation missing (28 pages)
- **Evidence:** `.subnav-wrapper maui-sub-navigation` (Lufthansa Travel Classes | First | Business
  | Premium Economy | Economy, or Internet | Wi-Fi | FlyNet): live grey bar 122-185 at 1440,
  active underline at 182-185, x 88-321. Content starts 63 px lower than in the replica (de/en
  first-class stage at 210 live, 147 replica). C1.7 mapped it in the hub only.
- **Fix (implemented):** profile-nav for `.subnav-wrapper maui-sub-navigation` in info (parser and
  block from C1.7).
- **Pages:** first-, business-, premium-economy-, economy-class, the first-class sub-pages,
  internet-overview, lhg-wifi, flynet (×4 locales).
- **Spot-check:** de/en/first-class 1440 (stage at 210).

### C4-6 Single-slide image carousels stacked (12 pages)
- **Evidence:** business-class, economy-class and first-class-terminal ×4 have one `.carousel
  .swiper-single-slide`: on live, 4 collage slides one at a time with dots. The replica stacks all
  4 (economy-class 1440: about 590 px live, about 2600 px replica).
- **Fix (implemented):** `carousel-images` for `.carousel:has(.swiper-single-slide)` in info, the
  same selector as campaign and insights. columns-media already excludes `.carousel`.
- **Spot-check:** de/en/economy-class 1440.

### C4-7 Teaser band titles lose their size class (60 pages)
- **Evidence:** "This may also be of interest to you" is `h2.heading-small` (28px light). The
  carousel-cards parser keeps the class only on article pages, so the replica draws a 36px
  heading-medium: ink 26 px tall, x 88-495 live; 32 px, x 88-610 replica (flying-with-small-children).
- **Fix (implemented):** `parsers/carousel-cards.js` always keeps the `heading-*` class of the
  column title. The cleanup's marker writes `{heading-small}` only when it differs from the level's
  default.
- **Pages:** 60 info (h2.heading-small 34, h3.heading-small 26); hub 4 (h3.heading-medium) on its
  next import.

### C4-8 Author quotes outside articles imported as one body line (20 pages)
- **Evidence:** `.section-narrow .dcep-author-quote` (de/en first-class: "In Lufthansa First
  Class, a world awaits you ..."):
  - live: LufthansaHead bold 36px, 4 lines at x 441-980 (y 2298-2449) in the 720 px narrow
    section, 128 / 116 px from the images around it;
  - replica: one 18px line at x 89, about 280 px shorter.
  - C3-7 converts quotes on article pages only.
- **Fix (implemented):** the cleanup converts every `.dcep-author-quote` to a `<blockquote>`.
  `styles.css` styles non-article quotes as `.author-quote` in `.section-narrow`: max-width
  min(622px, 720px − 2 × margin), centred like the narrow section, 60px (80px from 768px) above
  and below.
- **Pages:** first-class, first-class-terminal, carbon-offsetting climate-protection-projects and
  saf, child-in-businessclass ×4. Campaign's 20 quote pages get it on their next import.

### C4-9 Grey band at the end of the page: 48 px white before the footer (77 pages)
- **Evidence:** flying-with-small-children 1440: live band 2145-2709 with the footer at 2710; the
  replica band ends 2630, then 48 px of white. 77 info pages end with a grey band without
  `.mb-default` (flush), 28 with it (24 px).
- **Fix (implemented):** the sections transformer adds `flush` to a grey region whose AEM section
  has no `.mb-default`. `styles.css`: `main > .section.grey:last-child { margin-bottom: 24px }`,
  `.grey.flush:last-child { margin-bottom: 0 }`. The 24 px rule works without a re-import on every
  template (info 105, campaign 24, hub 6, fleet 4, app-entry 4, legal 2 pages end grey).

### C4-10 Smaller causes (not implemented)
- **25 px separators dropped (C2-5):** 351 pages, 1348 separators. Before an h2 the
  `* + h2` 40 px hides most of it (get-your-guide button → h2: 56 live, 46 replica). Before text
  it costs 26 px. This needs the same re-verification as C2-5.
- **Image before a column view:** `.image .image-wrapper { margin-bottom: 4rem }` against the
  replica's 24px (116 pages, title-intro-image-body layout; part of the C4-1 hand-over).
- **Passenger receipt form** (`passenger-receipt-portal`, 4 pages: pax-receipt, rechnungsbeleg):
  the form is not imported (an app widget, 500 px). The first AEM section is padded (h1 40 px
  lower on live).
- **Nested icon rows** (shopping ×4, passengers-with-sensory-impairment ×4): a `.fourcolumn` in a
  `.fourcolumn` with 1/4-width SVG icons is excluded from columns-media, so the icons render
  content-wide (shopping 1.35x).
- **Image + headline carousels without teasers** (traveltricks ×4) and onboard-delights ×4 are
  stacked full width.
- 390 header 140 vs 144 (site-wide, known).

### Which pages each cause affects (info)
| cause | pages | needs |
|---|---|---|
| C4-1 column-view padding (all) | 429 | part 1 + 2 re-import, rest hand-over |
| — part 1 untitled columns-media | 247 | re-import |
| — part 2 grey band = one column view | 142 | re-import |
| C4-2 sub-page navigation | 180 | re-import |
| C4-3 tables | 64 | re-import |
| C4-4 3/4-cell rows at 768 | 163 | none (CSS) |
| C4-5 travel-class sub-navigation | 28 | re-import |
| C4-6 single-slide carousels | 12 | re-import |
| C4-7 teaser band title size | 60 | re-import |
| C4-8 author quotes | 20 | re-import |
| C4-9 last grey band | 77 flush / 28 | CSS now (24 px), re-import for 0 |
| harness 15 px wider layout | all | capture fix |

Scratch scripts are in /tmp/c4: `causes.js` (per-cause page lists → `causes-info.json`),
`cvctx.js`, `greycv.js`, `lastgrey.js`, `tables.js`, `ink.cjs`, `bands.cjs` and `sbs.sh`.
