# Offline package 2026-11-06: ema-adobe (SWISS, Cargo's homepage blocks)

Running report, committed as the work goes. Nothing is published: documents and files are uploaded
to DA and previewed (da-upload.mjs), checked on the aem.page preview hosts. Release order for the
user: code (on main) first, then files, then the pages that use them.

## 1. Brief 431: Cargo's About artwork, Products band, homepage pass (done)

What: www's two About SVGs (292 KB, refused by the preview: 409) in a smaller form (their vector
part as SVGs of their own, their embedded grain PNG on its own, multiplied over the vector by CSS:
pixel-identical to www's SVG on desktop); the Products and About bands' type and spacing as www's;
the rest of the homepage as www's: the fleet tiles' mosaic (cards-teaser (overlay, fleet)), the
eServices slider (carousel-cards (slides)) and the ULD teaser (hero-card-overlay (plain)). Cargo only,
in the blocks' CSS; the options written by tools/importer/cargo-import.mjs.

Commits (main): 3968652 (artwork, Products and About bands), a8f0146 (state: the three files),
83e8a92 (fleet, eServices, ULD), 8cddc7f (state: /en/home, /de/home).

Preview paths, in release order (code on main):
1. files: `/documents/about-bg-desktop-vector-da7231.svg`, `/documents/about-bg-mobile-vector-cfeaac.svg`,
   `/documents/about-bg-grain-bedb93.png`
2. pages: `/en/home`, `/de/home`

Checked (main--lh-cargo--moved-permanently.aem.page, en and de, 1440 and 390, against cargo-parity-001
rendered with its own stylesheets and its screenshots): Products 756 px at 1440 (www 757; rows 289,
147, 145 as www's), About 640 / 714 (www 640 / 714), the fleet mosaic 416 x 548, 856 x 265, two
416 x 263 (as www's), the eServices slides 636 px with www's arrows, the ULD teaser 640 px; no
sideways scroll. Live (cargo.turnsthe.page) already shows the bands' measures; the about artwork
there waits for the three files (404 until published, the band stays #05164d).

Open: the gap between the homepage's components is 20 px at 1440 (www 40: its boxes' padding),
Cargo's --spacing-default token in cargo.css (ema-lufthansa's); the phones' ULD photo is the desktop
one cropped (www's Teaser-ULD-Mobile@2x.jpg is not in lh-cargo's DA: needs the file); the eServices
dots are one per slide (www: per page).

## 2. SWISS, deeper visual parity (swiss-parity-002)

swiss-parity-002a and -002b found in the drop at 09:05 UTC (sha256 checked); swiss-parity-001
downloaded again (its hash as parity.md records it). All 60 pages measured at 1440 and 390 on
swiss.turnsthe.page and on lh-swiss's aem.page; www read from the captures only (rendered by a
local server that blocks every outgoing request). The rows: [../swiss/parity.md](../swiss/parity.md),
pass 2 (rows 22 to 36).

What was ours, and fixed:
- **www's sidebar** (airem-sidebar on 1,262 of the 4,641 snapshot pages): the content two thirds
  beside an aside a third wide (40 px in) from 768 px. The import had it flattened at the full
  width. tools/importer/swiss-sidebar.mjs makes the content a section and the aside a section with
  the style sidebar-aside (scripts/section-aside.js shows it beside the content).
- **the aside's teaser cards** as www's framed cards (cards-teaser rows, SWISS styling).
- **www's column views**: image | text rows, image | image (Recraft's two by two), and two- to
  four-column views of text items (baggage irregularities' four steps) as columns-media rows.
- **tabs the import broke**: an empty tab panel (animals travelling) and sections split off a tab
  (entertainment's eJournals), which showed under every tab.
- **SWISS type**: the text's h3 / h4 (16 / 18 px), the standalone links (warm grey with www's
  triangle, not red bold arrows).

Commits (main, each with lint, the full suite and the smoke before and after):
86ce78b (sidebar step, decorateMain order: asides before tab sets), d085a29 (image | text views),
54b91c4 (the sidebar look, aside cards, h3 / h4, links; image pairs), 4029b37 (text column views,
empty tabs, screen-reader words), e482bfe (sections split off a tab), 1180c48 (a picture opening
the sidebar's content). SWISS has no smoke baseline: after each push its live and preview hosts
answered as before and served the new theme (logs/b432/swiss-smoke.sh).

Pilot (23 pages, ours on the local server with the new documents, height against www's):
Business 1.74 -> 0.94, Economy 1.77 -> 0.96, advance seat reservation 1.72 -> 0.98, Recraft
3.28 -> 1.09, entertainment 3.31 -> 0.98, baggage irregularities 2.17 -> 1.01, animals 1.69 ->
1.09, online check-in 1.28 -> 0.94, AirRail 1.24 -> 1.06, upgrade 1.55 -> 0.96; at 390 all
between 0.87 and 1.04.

Documents (uploaded to lh-swiss's DA and previewed, not published; release order: the code above is
on main, no new files, then these pages). Before each batch every DA document was compared with the
copy the step started from (logs/b432/da/, the rollback per page): none had changed (the 23 pilot
pages were last changed by my own upload at 10:20 UTC).
1. ch/en, ch/de: 190 documents, 190 previewed, 0 problems.
2. ch/fr, ch/it, ch/es, ch/pt: 366 documents, 366 previewed, 0 problems.
3. ch/zh, ch/ru, ch/ja, ch/el, kr/ko, corporate (en, de, fr) and 19 market pages: 549 documents,
   549 previewed, 0 problems.
4. new destinations in the 11 languages again, after 1180c48 (the Toulouse photo): 11 documents,
   11 previewed, 0 problems (each last changed in DA by my own upload of batches 1 to 3).
In all 1,105 documents ([../swiss/preview-paths-432.txt](../swiss/preview-paths-432.txt), one path
per line; batch 4's paths are among them).
Checked on main--lh-swiss--moved-permanently.aem.page: the 23 pilot pages at 1440 and 390 measure as
they did locally (all 46 pairs the same ratio, no broken images); a French page's blocks as its
document.

Rollback: per page, upload DA's earlier copy (logs/b432/da/<path>.html, not committed: kept on this
machine) and preview it; the code: `git revert` of the commits above (the documents then show
the earlier layout's blocks without the SWISS styling).

Open (rows 30 to 36 of parity.md): 50 ch/en+de pages whose sidebar the step leaves as it is (the
content starts inside a block, or the aside is only partly in the document); the aside's video
card (www plays the video in the card); grey boxes covering part of a tab panel; Miles & More's
tier headings in a tab set (0.87); the offers page's fares (data); accessible travel at 1440
(1.13: its sidebar starts with texts and a grey section before www's first heading; the step joins
parts of one section only). New destinations: fixed (1.14 -> 1.04 on aem.page).

The restart in the afternoon (about 12:00 to 15:50 UTC) stopped the local servers and a batch run;
the uploads had finished, the batch was run again.

## 3. SWISS accessibility pass

axe-core 4.10.2 (from npm, sha512 as the registry's), WCAG 2.0 to 2.2 A and AA, on the 84 SWISS pages
of swiss-parity-001 and -002 (ch/en, ch/de, 10 magazine pages) at 390 and 1440 on
main--lh-swiss--moved-permanently.aem.page, after the documents of item 2 were previewed.
- A first run counted no violations but tested little: the DEMO notice is a modal dialog, so the
  page behind it is inert and axe skips it. Run again with the notice acknowledged (its own
  localStorage key, as after its button): **0 violations on all 168 page-widths**, all 200.
- **Fixed (ours, shared, brand-neutral):** frames with a title of their own. The magazine's
  "SWISS behind the wings" had 18 YouTube frames all titled "YouTube-Video" (frame-title-unique);
  scripts/media.js now numbers the next ones (4e55b9a, test/media-embed-titles.test.mjs, failing
  first). Locally: 19 frames, 19 titles.
- **The rest (needs review, listed in parity.md):** OneTrust's banner (an aria-label on a div
  without a role, every page; not ours); colour contrast axe cannot decide where that banner
  overlaps the page; the flight search's travellers button names a dialog id that exists only
  once the dialog has opened (10 pages; ours, left: aria-valid-attr-value is a review item, the
  dialog is there when the button opens it); the date field's contrast behind its floating label.

## 4. ITA regression compare (ita-parity-001)

The 26 pages measured on ita.turnsthe.page (current code, published documents) at 1440 and 390
against the capture: all 52 pairs between 0.95 and 1.05 of www's height, no broken images, no
sideways scroll. Look-alike scores of the full-page screens picked out travel classes:
- **Fixed:** world-of-ita-airways/travel-classes (it/en, it/it) showed its two teaser rows on a
  three-column grid (two 408 px cards, an empty third) where www has two 622 px cards per row.
  Not a regression (brief 391's "before" shot has it too) but ours: ITA's importer turns the
  two-column view into a three-column one without the two-up mark. e546500 marks it
  (test/ita-teaser-two-up.test.mjs, failing first); the two documents got the option directly
  (the ITA snapshots are not in this checkout), uploaded to lh-ita's DA and previewed, not
  published. On main--lh-ita--moved-permanently.aem.page: 622 + 622 px at 1440, 350 + 350 at 768,
  stacked at 390. Rollback: `git revert e546500`; the documents' earlier copies are in
  logs/b432/ita-da/ (this machine).
  Preview paths: `/it/en/world-of-ita-airways/travel-classes`, `/it/it/world-of-ita-airways/travel-classes`.
- Known rows, unchanged: the help page's questionnaire after the app (row 14), the homepage's
  fares (data), the carry-on page's accordion titles (not headings, the text present).
- No regression found.

## After the offline window (brief 437)

Functional work first, then visual parity. Nothing published; uploads to DA and preview only.
Each push: lint and the full suite before it, the smoke before and after it (every brand's
lh-edge host the same before and after), SWISS's and TAP's hosts checked after it.

### 1. Cargo homepage: the phones' ULD photo (done)

- cargo-media-002.tar.gz (sha256 343c4945…5f5c, checked): only `Teaser-ULD-Mobile@2x.jpg` taken
  (750 x 1280, sha256 70fc5b7e… as its manifest entry); the other ten are ema-lufthansa's.
- www's `.teaserULD` is one picture: the phone file up to 767 px, the desktop one from 768 px; the
  teaser stays 640 px high at every width.
- Code: 3c4c099, hero-card-overlay's phone picture with its width per brand (TAP 728 px as before,
  Cargo 768 px); test/cargo-uld-phone.test.mjs (failing first); test/tap-378.test.mjs's source check
  follows the per-brand form (TAP's behaviour test unchanged and passing).
- Documents: the ULD teaser's picture cell got the phone picture second (DA's current homepages,
  unchanged since my copies; the local copies in content-sites/ were older and were replaced by
  DA's). Uploaded and previewed, release order: the code (on main), the file, the pages:
  1. `/media-da/cargo/teaser-uld-mobile-2x-36ef8d7e.jpg` (Cargo's naming, cargo-assets.mjs edsName)
  2. `/en/home`, `/de/home`
- Checked on main--lh-cargo--moved-permanently.aem.page: the phone photo at 390 and 767, the desktop
  one at 768 and 1440 (en, de); the card at www's place (184 px down at 390, 272 high); the
  preview's image byte for byte the file; DA's documents as the local ones.
- For ema-lufthansa (the Cargo importer is theirs): a re-import of the homepages drops the phone
  picture unless cargo-import.mjs writes it as the cell's second picture.
- Rollback: `git revert 3c4c099`; the homepages' earlier DA copies in logs/b437/da/ (this machine).

### 2. TAP Message Center (done)

- a. The box anchors: www.flytap.com's alert texts link `#special-anchor-flight-status` and
  `-my-travels` (Madeira's details, 7 languages); www's script opens its booking box on that tab
  (tools/reports/tap/booking-spec.md 2.4; tap-snapshots-001's pages link these anchors so). Ours now
  go to the root homepage's box tab, `/<root>#flight-status` and `/<root>#my-travels` (as TAP's
  importer writes them for the pages): in the alerts page's texts, as a message's link (the strip)
  and on the details page itself. TAP only; checked: pt-pt's alerts page links `/pt-pt#flight-status`
  and `/pt-pt#my-travels`, which open "Estado do voo" and "Gerir reserva".
- b. Same weight: TAP's ties now the older first (/pt-il: ASL of 2024-12-19, then Madeira).
  lufthansa.com's own order is unchanged: its captures (the Message Center export of 2026-10-25,
  lufthansa-parity-001's homepages) hold one message only, so nothing shows how www sorts its
  ties; the change stays with the tenants that sort by weight (TAP).
- Code: f7908a5 (scripts/message-center.js, scripts/scripts.js), test/tap-message-anchors.test.mjs
  (failing first). No documents.
- Checked on main--lh-tap--moved-permanently.aem.page and tap.turnsthe.page after the push: /pt-il's
  strip ASL then Madeira; pt-pt's alerts page with the mapped links.
- Rollback: `git revert f7908a5`.

### 3. SWISS parity, open rows of pass 2 (rows 30 to 34 of ../swiss/parity.md)

- Row 30, sidebars the step left: lh-com's columns-media sidebar blocks (the competitions' terms,
  helvetic's CO2 offset) now become www's sections; a content opening with a block (an FAQ
  accordion, icon cards) or with a paragraph for www's heading starts there. ch/en+de: pages with a
  skipped sidebar 50 -> 37, sidebars 242 -> 255. Left: sidebars in a tab with content after them
  (20), asides and content ends the documents don't have as www does (12), first texts the
  documents have otherwise (20: an FAQ accordion's group label for www's question, texts the
  import left out). Those pages keep the full-width layout.
- Row 31, the aside's video card: the video plays in the card (cards-teaser builds the player from a
  video link alone in the first cell; brand-neutral). Premium Economy: 379 x 213 (www 383 x 215).
- Row 32, grey boxes in a tab panel: the content splits at www's box into parts of the same tab;
  scripts/section-aside.js (every brand) joins a panel's parts beside the aside, each with its own
  styles; the grey part as www's box. Animals travelling: grey from the panel's top to "Assistance
  dogs", the rest white, the aside beside both; entertainment's eJournals: the notice grey.
  Pages without tab parts as before (ITA's carry-on page checked: its 3 : 1 sidebar unchanged).
- Row 34, Miles & More: www opens the first tier (maui-collapsible-item expanded): the accordion
  gets open-first (16 on ch/en+de); the aside's link list as www's (no bullets, warm grey, up-right
  off-site). Miles & More 0.87 -> 1.06 at 1440, 0.87 -> 0.97 at 390. The tier names are accordion
  titles on www as well (row 33).
- Code: 283360b (rows 30, 31, 34), 67a4107 (row 32). Tests failing first:
  test/swiss-sidebar.test.mjs, test/swiss-sidebar-look.test.mjs, test/cards-teaser-video.test.mjs,
  test/section-aside.test.mjs.
- Documents: the step again on every language from DA's original copies; each new output compared
  with DA's current document, and DA's last change checked to be my own upload (or DA still the
  original): 196 to upload, none changed by anyone else, 196 uploaded and previewed, 0 problems
  (ch/en+de 37, ch/fr, it, es, pt 59, the others 100). Paths: [../swiss/preview-paths-437.txt](../swiss/preview-paths-437.txt)
  (release order: the code above on main, no new files, these pages).
- Checked on main--lh-swiss--moved-permanently.aem.page: Premium Economy's video card, Miles & More
  (en, fr) with its first tier open and the grey links, a competition's sidebar, animals' grey box,
  as on the local server.
- Rollback: `git revert 67a4107 283360b`; per page DA's earlier version (my uploads of the
  offline package, or the copies in logs/b432/da/).

### 4. ITA, the open rows that are mine (done as far as they can be)

- Order by height ratio: ita-parity-001's 26 pages on the current code (after item 1 of the offline
  package's travel classes fix) are all within 0.95 to 1.05 of www's height at 1440 and 390 on the
  live host (on the preview the help page measures 0.83 to 0.86: its app renders only on the live
  host, row 14). So the open rows were taken as they stand: 14 (help page) and 8 (offers).
- Row 14: the FAQs card on its band across the page as www's: styles/themes/ita.css (862eca0,
  test/ita-help-band.test.mjs failing first); checked on ita.turnsthe.page (it/en 1440, it/it 390).
  Left: www's questionnaire sits above the card; ours is the feedback block after the help app,
  because www's questionnaire service refuses our host.
- Row 8: the offer cards need ITA's fare service, which refuses the agent and foreign
  origins; unchanged, your browser check stands.
- No documents. Rollback: `git revert 862eca0`.

### Still open after brief 437

- SWISS row 30's remaining 37 pages, row 33 (accordion titles as headings, shared), row 37
  (accessible travel: its sidebar starts with texts and a grey section before www's first heading).
- Cargo: the homepage's phone picture comes from the document; a re-import keeps it only if
  ema-lufthansa's cargo-import.mjs writes it.
- ITA row 14's questionnaire place, row 8's fares (both need www's services).


## Brief 440 (Cargo homepage, SWISS's last rows)

Same rules: tests first, brand-scoped CSS, lint and the full suite before each push, the smoke of
every brand before and after each push (the same before and after each time), SWISS's, TAP's and
Cargo's preview and live hosts checked by hand after the pushes; upload and preview only.

### 1. Cargo homepage spacing (done, 9a2349f)

- www (cargo-parity-001's CSS): every homepage component is a box 40 px above and below its content
  (`.whiteBgBox` padding-block 40px, 20px below 1025px), one after the other; ours had lh-com's 20 px
  wrapper gap and 48 px section gap. Per component in its block's CSS, the homepage only
  (`main:has(.news-feed)`); `--spacing-default` untouched.
- Below 768 px the Infrastructure band's rows as www's (24 / 28 px counters, 61 px rows, no list
  gaps); below 1025 px its box 20 px above and below.
- News to footer against www (preview and cargo.turnsthe.page after the push, the same as locally):
  en 1440 -101 -> +11 px (each component within 9 px), de 1440 -102 -> +10, en 390 +225 -> +75,
  de 390 +249 -> +99.
- Left, not spacing: the documents' "Show the map on www.lufthansa-cargo.com" link under the stats
  (68 px at 390, not on www; the Cargo importer's, ema-lufthansa's); the news cards' live texts
  (de +37 at 390); and the booking strip, where www opens the Booking tab's form and ours the
  tracking form (73 px shorter at 1440).
- Rollback: `git revert 9a2349f`.
- The Cargo importer now writes the ULD teaser's phone picture (ema-lufthansa's e0d6a35), so a
  re-import keeps it.

### 2. Cargo eServices dots (done, ca50617)

- carousel-cards' slides option counts the slides in view as four-up does: 2 dots at 1440 ("1 of
  2", "2 of 2"), 3 on phones, as www; checked on preview and live. Rollback: `git revert ca50617`.

### 3. SWISS row 33, accordion titles as headings (closed: www's are not headings)

- On www every accordion title is `maui-headline type="none"`, which renders a `div`, no heading
  element or role: all 155 accordion items of the 60 captured SWISS pages. The 8 "missing
  headings" of food and beverage came from the capture's measurement, which lists every
  maui-headline whatever its type.
- axe on food and beverage and the payment options FAQ (aem.page, 390 and 1440): 0 violations;
  needs review only OneTrust's banner.
- Decision (yours, asked at the end of the brief): keep as www. The shared accordion stays as it is;
  row 33 closed. No commit.

### 4. SWISS row 37, accessible travel (done, 5a8f7cb)

- A sidebar whose content has texts before its first heading starts at the first text; outside a
  tab www's grey box is a part (section style `sidebar-part`, scripts/section-aside.js joins such
  parts beside the aside, every brand; pages without the style as before, ITA's sidebar checked);
  SWISS's sidebar text over its content column as www's (1,750 of 1,761 texts in www's sidebars
  run the column; ours were two thirds: 556 px lines where www has 784).
- Local, the pilot pages at 1440: accessible travel 1.13 -> 1.03, animals 1.12 -> 1.00, Recraft
  1.09 -> 1.04; online check-in 0.94 -> 0.87: its form now in the content column beside the aside as
  www, its text over the column; what is left is the import's (no accordion for www's open "So
  funktioniert es", the form without www's field hints).
- Rollback: `git revert 5a8f7cb`.

### 5. SWISS row 30, sidebars in a tab with content after them (done, 3997f61)

- That content is now a section with the panel's Tab rows after the aside: section-tabs.js shows it
  in the panel, as www. The 20 such sidebars on 8 ch/en+de pages placed; no word of DA's documents
  lost (219 changed pages compared word for word); the tabs and panels checked locally.
- ch/en+de: pages with a skipped sidebar 37 -> 21 (with item 4), sidebars 263 -> 283. Left: 12
  sidebars whose first text the document has otherwise (an FAQ accordion's group label for www's
  question, texts the import left out), 8 asides and 4 content ends the documents don't have as
  www shows them.
- Rollback: `git revert 3997f61` (importer only; the documents: DA's earlier versions).

### Documents (SWISS)

- 336 uploaded and previewed, 0 problems; nothing published. Paths, in release order (the code
  above on main, no new files, these pages): [../swiss/preview-paths-440.txt](../swiss/preview-paths-440.txt).
- Checked on main--lh-swiss--moved-permanently.aem.page: accessible travel 1.03 of www's height at
  1440 and 390 (the grey box only the notice, the aside level with the intro); airbus long-haul's
  four tabs, each panel's aside beside its sidebar and the rest of the panel after it; online
  check-in 0.87 at 1440 (see item 4).

- The step again on every language from DA's original copies; each new output compared with DA's
  current document and its last change: 336 to upload; 8 left out because someone else changed them
  in DA at 21:23 UTC today (/al/de/prepare-lxmas-2024,
  /al/de/prepare/travel-regulations/immigration-regulations-worldwide1,
  /al/en/customer-support/travel-and-corona/travel-briefing/destinations-masks,
  /al/fr/book-and-manage/conditions/aig-travel-insurance, /al/fr/book-and-manage/swiss-choice/privacy-seat,
  /al/fr/prepare-lxmas-2024, /al/it/book-and-manage/swiss-choice/privacy-seat, /al/it/prepare-lxmas-2024).
- Noted for its owner: test/own-links.test.mjs fails on a clean checkout of origin/main (ownPages,
  /xx/en/about-us/contact), with or without my commits; it passes in this workspace.
