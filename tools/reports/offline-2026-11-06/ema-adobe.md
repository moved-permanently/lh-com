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

## Brief 445 (SWISS: long pages, online check-in, /al/ pages, row 30, test fixtures, the 60 pages)

Same rules: tests first, brand-scoped CSS, lint and the full suite before each push, the smoke of
every brand before and after each push, SWISS's and TAP's hosts checked by hand after the pushes;
upload and preview only, nothing published. Two pushes: `f551b02..ffd9d6d` (items 1, 2, 4, 5) and
`52c9e0d..392ff5c` (item 6). The smoke after each was the same as before on every brand (after the
first push two lufthansa-edge ch sitemap hashes changed, as they do between any two runs while
others publish; they don't come from the market route).

### 1. SWISS pages missing from their language index (done, 10fb774)

- Cause confirmed: Edge Delivery leaves a page out of a query index when its record is over
  100 KB. The admin index API's record for /ch/el/terms-conditions/privacy-statement is 100,029
  bytes; 96,329 of them are the `content` column (every main p and li). The largest record that is
  indexed: 90,131 bytes (ch/ru). So the page is in no language-ch-el row, and lh-edge's market
  route answered 404 on gr/el.
- Every site scanned (DA's documents against the live indexes with a `content` column; the record
  size measured as the indexer takes it). Pages missing because of their size:
  - SWISS: /ch/el/terms-conditions/privacy-statement (99 KB), /ch/el/terms-conditions/conditions-of-carriage
    (127 KB) and /ch/ru/terms-conditions/conditions-of-carriage (121 KB), language-ch-el and -ru;
  - ITA: /gr/el/legal/conditions-of-carriage-group/conditions-of-carriage-ita (136 KB, search-gr-el;
    no 404: xx/el has its own document);
  - TAP: the six miles-and-go partner pages (137 to 430 KB) are missing from the shared
    market-pages index only, which TAP's routes don't read;
  - lh-com, Cargo, Austrian, Brussels, Discover, Air Dolomiti, B2B: none.
- Fix: the market route, when the language index lacks a page, already read the language
  version's document for its redirect. A 200 there is now answered as an indexed page is: the
  page's markets metadata is checked, and the version's drafts and .plain.html are excluded. A
  smaller `content` selection would not keep every record under 100 KB (a 300-character cap per
  paragraph still leaves 88 KB of Greek), so the indexes stay as they are. Test:
  tools/workers/lh-edge/test/market-unindexed.test.mjs.
- On swiss.turnsthe.page after the deploy: /gr/el/terms-conditions/privacy-statement and
  /gr/el/terms-conditions/conditions-of-carriage answer 200 (x-lh-edge-route market). /cy/el/…
  stays 404 by design: cy/el is not served on SWISS's host (its homepage is 404 too), and the
  page's markets row lists gr/el only.
- Still missing, by the same cause: these pages are in no search data and no market sitemap, and
  links on other pages point at the language version's URL.
- Rollback: `git revert 10fb774` (lh-edge redeploys on the push).

### 2. SWISS online check-in (done, d39c382)

- The form as www's: booking code or ticket number (13 characters), first name and last name,
  with www's hints under the two name fields (12/17 px, 6 px under the field), and no tour
  operator checkbox. This is booking-lookup `my-bookings` with the new option `checkin`;
  my-bookings without the option is as before.
- "So funktioniert es" is an accordion-columns block with open-first. swiss-import.mjs:
  withCheckinFields and withSwissAccordions, both in the import pipeline.
- The 11 check-in documents (ch/de, el, en, es, fr, it, ja, pt, ru, zh and kr/ko) were rebuilt from
  DA's current copies, uploaded and previewed. No word lost.
- On the preview: three fields with the hints, and the accordion open in the content column.
  ch/de is 0.93 of www's height at 1440 (the rest is the Travel ID view's picture) and 0.99 at 390.
  The field style (www's boxed grey fields; ours underlined) is unchanged: it is lh-com's
  booking-lookup look.
- Rollback: `git revert d39c382`. For the documents, DA's earlier versions are in logs/b445/da/.

### 3. The eight /al/ pages (done, documents only)

- Seven of the eight already are brief 440's step result: DA's current copy with its new markets
  rows equals the step on brief 432's original, apart from the metadata block.
- One page differed: /al/de/prepare/travel-regulations/immigration-regulations-worldwide1. Rebuilt
  as the step on its original with DA's current metadata block. The diff is the step's alone: the
  sidebar now starts at the content's first text, as brief 440's item 4 does. The markets rows
  (4 roots) are kept. Uploaded and previewed.

### 4. SWISS row 30, the last 21 pages (done, ffd9d6d)

- Placed now: 19 of the 21 pages, from brief 432's originals with DA's current metadata. Of
  these, 16 had DA as brief 440 left it; the step's new rules:
  - www's first heading is not an h1, so the document's h1 (the page title) is not the start;
  - a first text inside a block (an FAQ accordion's answer, the booking login's text) starts at
    that block;
  - in lh-com's columns-media sidebar block, a text-only cell becomes a paragraph;
  - without an aside, the content ends before the next sidebar's start, at its last text the
    document has, together with the blocks that render www's later texts (the fare teasers);
  - www's video player controls ("Subtitles off, selected") are not counted as text;
  - otherwise the sidebar starts at its first sentence the document has.
- Current information (en, de): the import had left out www's whole sidebar. Its two-item
  accordion is now imported after the title and the message center (withSwissAccordions). www's
  live notices (Dubai flights, Edelweiss maintenance) stay the message center's.
- No word lost; the other 333 ch/en and ch/de pages are as brief 440 left them.
- Left: /ch/en/various/airportr and /ch/de/various/airportr. Their sidebar content is a two-tab
  view (Departure and Arrival service) with the aside after the tabs; the step places sidebars
  within one section.
- The same rules would place the sidebars on 81 more pages in the other languages (and move 3
  corporate pages' sidebar start from the title to www's h2). They are ready, not uploaded: say if
  you want them.
- Rollback: `git revert ffd9d6d` (importer only).

### 5. Test fixtures (done, 80b890b)

- own-links.test.mjs wrote its documents under the current directory and read them from the
  repository's content-sites/. Its documents are now test/fixtures/own-links/content, and the CLI
  runs by its path.
- cargo-kf-phone-442 (ema-lufthansa's) failed wherever content-sites/lh-cargo/assets/files.json
  exists: that asset map makes the Facts & Figures link site-relative. The test now sets its own
  site data (no asset map; DA's files from test/fixtures/cargo-kf-phone-442/known.json). It also
  checks the 777F slide's icon and www's link. cargo-import.mjs is unchanged.
- Checked:
  - both tests pass on a clean checkout of origin/main, run from the checkout and from /tmp;
  - origin/main's cargo test fails with a simulated asset map, and the new one passes.
- Rollback: `git revert 80b890b`.

### 6. The 60 swiss-parity-002 pages on the preview (c8fbca6, 392ff5c)

- First measurement (main--lh-swiss, 1440 and 390, after items 1 to 4): 59 page widths more than
  5% off www's height. Fixed:
  - the second-level menu pages' cards end with www's link row (withCardLinks; 8 pages in ch/en
    and ch/de): baggage 0.91 -> 1.00, airport 0.92 -> 0.98;
  - the legal page's icon teasers as www's (withUspTeasers, carousel-cards option usp): 1.75 ->
    1.02 at 1440, 2.05 -> 1.01 at 390;
  - the FAQ hub's topic teasers (www's usp teasers too): 0.82 -> 1.03, 0.69 -> 1.01;
  - the headings' space below as www's (h2 20 px, 40 px from 1025 px; heading-small 20 px):
    imprint 1.07 -> 1.03 at 1440.
- After the push and the 18 documents: 41 page widths (24 pages) still more than 5% off. One line
  each; "seen" means checked on a side-by-side screenshot:
  - ch/en/offers 0.07 / 0.05: www's destination finder with fares (row 35, data);
  - ch/de/discover/a350 0.31 / 0.31, swiss-senses 0.64 / 0.65: www's scroll-driven full-screen
    stages (each section about one and a half viewports); ours static bands. Design, not quick
    (seen);
  - ch/de/book-and-manage/pax-receipt 0.77 / 0.74: www's receipt request form; ours links to it on
    www (a link-out by design) (seen);
  - magazine: inside-swiss 390 0.87, behind-the-wings 1440 0.95, jungfrau-region 0.85 / 0.93,
    travel 390 0.87, hello-boston 0.91 / 0.90: www's article pictures run the whole column with
    taller More Stories cards; ours sit in the text column (rows 20 and 21's magazine design; seen
    on jungfrau);
  - swiss-business 0.94 / 0.95, swiss-economy 1440 0.95, premium-economy 0.92 / 0.94,
    health-and-travel 1440 0.94, upgrade-options 0.94 / 0.94, green-fare 1440 0.94,
    entertainment 390 0.93: the sidebar's image | text rows are each about 20 px shorter than
    www's (seen on Business and Premium Economy);
  - food-and-beverage 0.86 / 0.92: as above, and www's stage with the title over the picture is
    taller (seen);
  - ch/de/fly/check-in/online-check-in 1440 0.93: the Travel ID view's picture is lower than www's
    (seen);
  - ch/de/prepare/travel-regulations 1440 0.93, ch/en/discover/fleet 0.92 / 0.95: www shows these
    cards two to a row; ours sit in a three-column grid, so the cards are narrower and their
    pictures lower. The carousel-cards option two-up would do it; quick, next round (fleet seen);
  - ch/de/…/travel-insurances 1.06 / 1.09, imprint 390 1.05, ch/en/customer-support/feedback 1.05 /
    1.06: our paragraph and phone footer rows are a little taller (seen on the insurances page);
  - ch/en/…/swiss-airrail 1440 1.06: the text block's lines are longer (not verified in detail);
  - ch/de/culinaryjourney 390 1.09: the booking form's fields are 58 px rows with a 24 px reserve
    (www's 50 px boxed fields) (seen);
  - de/de and us/en homepages 390 1.10 / 1.08: General Conditions shows as text, where www opens
    a dialog (row 14, lh-com's dialog);
  - ch/en/…/mobile-apps 390 0.95: not looked at.
- The heading spacing moved 19 page widths away from www's height by 1 to 2 percent. All of them
  are pages shorter than www's for the reasons above.
- Rollback: `git revert 392ff5c` (spacing), `git revert c8fbca6` (cards, icon teasers, FAQ hub;
  the documents: DA's earlier versions in logs/b445/da/).

### Documents (SWISS)

- 49 uploaded and previewed, 0 problems; nothing published. In release order (both pushes are on
  main): [../swiss/preview-paths-445.txt](../swiss/preview-paths-445.txt). Items 2 to 4 are the
  first 31 paths: the 11 check-in pages, the 19 row-30 pages, then the /al/ page. Item 6 is the
  last 18: ch/en's eight menu pages and its legal page, then ch/de's.
- No word of DA's documents lost (49 pages compared word for word).

### Summary

| Item | Commit | What | Rollback |
| --- | --- | --- | --- |
| 1 | 10fb774 | lh-edge: a page the language index lacks (records over 100 KB) served from the language version | `git revert 10fb774` |
| 2 | d39c382 | check-in form (first name, hints, option checkin), open accordion; 11 documents | revert; DA's earlier versions |
| 3 | (documents) | /al/de/…/immigration-regulations-worldwide1 with the 440 step, markets kept; 7 already done | DA's earlier version |
| 4 | ffd9d6d | row 30: 19 of 21 pages placed (airportr en/de left) | revert; DA's earlier versions |
| 5 | 80b890b | own-links and cargo-kf-phone-442 with their own fixtures | `git revert 80b890b` |
| 6 | c8fbca6, 392ff5c | card link rows, icon teasers (legal, FAQ hub), heading spacing; 18 documents | revert each; DA's earlier versions |

## Brief 450 (lufthansa.com my/en Message Center; SWISS row 30, fleet, airportr, the pinned stages)

Same rules: tests first, brand-scoped CSS (shared code only as options or with every brand's smoke),
lint and the full suite before the push, the smoke of every brand before and after, SWISS's and
TAP's hosts by hand; upload and preview only, nothing published.

- One code push, after a pull: `72ec765..9d89b91`.
- The smoke after was the same as before on every brand (the differing counts are the same rows
  in both runs).

### 1. Message Center, my/en (done: the page's document; no code, no message data)

- On www the flash teaser's messages are built on the server. Each homepage's
  `.dcep-flash-teaser` carries them in its `data-dcep` (`flashTeaserMessages`).
  - In the recorded my/en homepage (2026-10-29, and your 2026-11-06 recording) that list holds
    only the MYR 450 promo.
  - On all 220 other recorded homepages (tools/importer/bd-snapshots, tools/source-export/pages)
    it holds the Dubai notice: my/de, sg/en, th/en, kr/en and every other root.
- The message data can't explain that. Both Dubai messages have no markets (`markets` [] in
  /message-center/index.json; on www no `lufthansa-group:markets/…` tag) and both have an `en`
  document. No field of either could leave out my/en alone without leaving out my/de or sg/en
  too. The difference is the my/en page's own flash teaser on www.
- Fix: lh-com's own /my/en/homepage document's flash-teaser block gets the row `Types | promo`
  (blocks/flash-teaser's option). It was made from DA's current copy (rollback:
  logs/b450/da/my/en/homepage.html), uploaded and previewed.
- On main--lh-com--moved-permanently.aem.page (Chrome, 1440):
  - my/en: "Promotion: Save an extra MYR 450 on flights to Europe with promo code KULDEAL";
  - my/de: "Achtung: Information über den Flugverkehr nach Dubai";
  - kr/ko: "주의: Information on flights to Dubai" (its promo held back, as before);
  - sg/en: the Dubai notice.
- A re-import of my/en would drop the row: lh-com's flash-teaser parser writes an empty block.
- No message document to change.

### 2. SWISS row 30, the other languages (done, documents only)

- The 81 pages built in brief 445: ch/el 9, es 8, fr 11, it 9, ja 7, pt 9, ru 8, zh 8, kr/ko 9,
  and corporate de, en and fr procurement.
- Rebuilt from brief 432's originals with DA's current metadata. Every DA copy was as brief 440 had
  left it; no word lost. Uploaded and previewed; all 81 have their sidebar-aside on the preview.
- The 3 corporate lat-switzerland pages (sidebar start moved from the title to www's h2) were not
  among the 81 and stay as they are.

### 3. Two cards to a row (done, 4c274bf, 9d89b91)

- Fleet: www's two cards are a two-column teaser view; withTeaserColumns had made it a
  three-column grid. swiss-import.mjs withTwoUpCards gives such a grid the existing
  carousel-cards option two-up.
  - 11 fleet pages: ch/de, el, en, es, fr, it, ja, pt, ru, zh and kr/ko.
  - In the 9 non-English, non-German languages the cards also get www's link rows (brief 445's
    withCardLinks).
  - ch/en on the preview: 0.92 -> 0.945 at 1440, 0.95 -> 0.955 at 390. What's left is www's taller
    card body and 90 px more before the footer.
- Travel regulations: www shows its cards four to a row too (a fourcolumn view). My 445 line that
  put it with fleet was wrong, so its layout stays.
  - Its titles broke "Einreisebestimmunge n": lh-com's 0.7 px heading tracking and the card's
    259 px text width. SWISS's card titles are now tracked 0.3 px, as www's teaser headings, and
    the grid cards' text is as wide as www's (18 px padding inside the 1 px border).
  - The theme sets no wrapping rule (test/heading-wrap.test.mjs).
  - ch/de stays 0.93: 80 px less space before the footer, and www's footer is 25 px taller in
    German.

### 4. SWISS row 30, airportr (done, 81a813f)

- www: the sidebar's content is the intro, "Your benefits", and "Departure and arrival services"
  with two tabs; the "Travel lighter, stay informed" teaser sits beside all of it.
- Importer (swiss-sidebar.mjs withTabSidebar): when the aside follows the tab panels after the
  content's section, the content starts at its first text, the panels become parts of it (their
  Tab rows plus the style sidebar-part), then the aside (sidebar-aside) and what follows.
- Shared code, every brand:
  - section-aside.js: sidebar-part sections also join when they are tab panels, each part keeping
    its data-tab and data-tabs;
  - section-tabs.js: a set's panels can be such parts (the tab list goes before the first, and the
    grid rows are counted again); a part that is no panel ends no set.
- Sections without the style are as before, and a tab set going on after a panel in parts is
  tested. On brief 432's originals only airportr in ch/en, ch/de and ch/fr changes; the other
  2,030 pages are as before.
- Preview, ch/en, de and fr: the aside beside the content, both tabs inside the content column,
  4 grid rows.
- Rollback: `git revert 81a813f`, and DA's earlier versions.

### 5. The next largest: A350 and SWISS Senses (done, f91a605)

- www's .inspiration-teaser-animation stages are pinned by GSAP. Each stays at the top of the
  window while the page scrolls on by half of the window's and the stage's height together:
  810 + 855 px at a 900 px window, 640 + 770 px for SWISS Senses. The full-page captures show
  that as white space.
- blocks/hero-campaign has a new option, pinned: the stage is sticky at the top and its wrapper
  that much longer. swiss-import.mjs withPinnedTeasers sets pinned and www's height option per
  teaser.
- ch/de's A350 is tall (810) on www's 2026-11-06 capture, but narrow (350) in the snapshot of
  11-02. It was rebuilt from the capture.
- 11 pages: ch/de A350, and SWISS Senses in ch/de, el, en, es, fr, it, ja, pt, ru, zh.
- Preview, 900 px window:
  - A350 0.31 -> 1.00 at 1440, 1.02 at 390 (www's capture had an 844 px window);
  - SWISS Senses 0.64 -> 1.006 at 1440, 1.02 at 390.
- The other languages' A350 pages stay narrow: their snapshots are from 11-02. A fresh capture
  would show whether www changed them too.
- Next, not done: the magazine galleries (jungfrau-region 0.85, inside-swiss 0.87, travel 0.87,
  hello-boston 0.90). www's slides are as wide as the 766 px column, with square pictures and
  the next slide peeking in; ours are 529 px and 3:2, so about half as tall.
- Rollback: `git revert f91a605`, and DA's earlier versions.

### Documents

- lh-com: 1 (/my/en/homepage).
- lh-swiss: 106, uploaded and previewed, 0 problems, nothing published.
  - Release order (the code is on main): [../swiss/preview-paths-450.txt](../swiss/preview-paths-450.txt).
  - The 81 row-30 pages, the 11 fleet pages, the 3 airportr pages, then the 11 pinned-stage pages.
  - No word of DA's documents lost.

| Item | Commit | What | Rollback |
| --- | --- | --- | --- |
| 1 | (document) | my/en homepage flash teaser `Types \| promo`, as www's server list | DA's earlier version (logs/b450/da) |
| 2 | (documents) | row 30's 81 other-language pages | DA's earlier versions |
| 3 | 4c274bf, 9d89b91 | fleet two-up in 11 languages; card titles tracked 0.3 px, grid card text 261 px | revert each; DA's earlier versions |
| 4 | 81a813f | sidebars with a tab set (airportr en, de, fr) | `git revert 81a813f`; DA's earlier versions |
| 5 | f91a605 | hero-campaign pinned; A350 de and SWISS Senses in 10 languages | `git revert f91a605`; DA's earlier versions |

## Brief 455 (my/en flash teaser on re-import; SWISS message center, magazine galleries, stages)

Same rules: tests first, brand-scoped CSS (shared code only as options or scoped to a layout,
with every brand's smoke), lint and the full suite before the push, the smoke of every brand
before and after, SWISS's and TAP's hosts by hand; upload and preview only, nothing published.

- One code push, after a pull: `8779dde..53034eb`.
- The smoke after it was the same as before on every brand.

### 1. my/en's flash teaser survives a re-import (done, 1592e8f)

- The flash-teaser parser takes the strip's own setting from www's homepage, that is from the
  message list www writes into the page on the server. A list that holds promotions and no
  irregularity or outage gives `Types | promo`. Any other list, or no list, gives the empty block
  as before.
- Tested with the my/en and my/de homepage snapshots (fixtures in test/fixtures/flash-teaser).
  Over all 225 recorded homepage snapshots, only my/en gets the row; the others come out as today.
  The import-homepage bundle is rebuilt.
- Caveat: a homepage captured while no alert is live anywhere, and showing a promotion, would also
  get `Types | promo`. None of the 225 recorded homepages is like that.

### 2. The message center in the sidebar column (done, 137bbb0)

- swiss-sidebar.mjs: when www's sidebar content opens with the message center, the document's
  message-center block right before the content's start belongs to the content.
- message-center.css: inside a section beside an aside, the block takes the content column's
  width. Everywhere else it keeps lh-com's 74.2 % from 768 px.
- The 11 current information documents (ch/de, el, en, es, fr, it, ja, pt, ru, zh and kr/ko) were
  rebuilt. DA's copies were exactly as I had uploaded them; no word lost.
- On the preview at 1440 (ch/de, ch/fr, kr/ko), the message center sits in the content column:
  843 px wide (was 938 px), the same width as the accordion below it.
- Other brands: of their current travel information pages, only SWISS's have both a message
  center and a sidebar. lufthansa.com, Austrian, Brussels and ITA have a message center but no
  sidebar. lufthansa.com's de/en page keeps its 938 px message center.

### 3. SWISS magazine galleries (done, 6b596e5)

- In articles, the gallery now matches www: each slide is the copy column's width (766 px at 1440)
  from its left edge, the pictures are square, and the next slide peeks in 24 px on, up to the
  window's edge. The arrows step one slide.
- Preview: jungfrau region 0.85 -> 0.98 at 1440 and 0.93 -> 0.99 at 390.
- hello Boston's galleries are the same now; the rest of its gap is www's ad slots and its larger
  More stories cards.
- inside-swiss and travel are landing pages without a gallery. They are 0.99 at 1440 and stay
  0.87 at 390, for a reason not yet looked at.

### 4. The next largest: onboard catering (done, 53034eb)

- Between the snapshots (11-02) and the parity capture (11-06), www gave onboard catering's stage
  the tall size and an intro paragraph, and the A350's five stages a paragraph and a button each.
  Ours lacked those texts.
- swiss-import.mjs has a new step, withTeaserTexts: www's teaser paragraphs and button go after the
  heading of the block whose heading matches, when the block lacks that text.
- Rebuilt from the capture: ch/en onboard catering, and ch/de A350 with its texts.
- Preview, onboard catering: 0.86 -> 0.965 at 1440 and 0.92 -> 0.99 at 390. A350: 1.00 at 1440.
- Only these two of the 60 parity pages differ between snapshot and capture. Other languages'
  pages would need a fresh capture.

### Documents

- lh-swiss: 13 uploaded and previewed, 0 problems, nothing published. In release order (the code
  is on main): [../swiss/preview-paths-455.txt](../swiss/preview-paths-455.txt).
  - The 11 current information pages, then A350 de and onboard catering en.
- lh-com: nothing new. my/en's homepage document already has the row from brief 450, and a
  re-import now keeps it.

| Item | Commit | What | Rollback |
| --- | --- | --- | --- |
| 1 | 1592e8f | flash-teaser parser: Types from www's server list (promotions only: promo) | `git revert 1592e8f` |
| 2 | 137bbb0 | the message center in a sidebar's content column; 11 documents | revert; DA's earlier versions |
| 3 | 6b596e5 | magazine article galleries as www's | `git revert 6b596e5` |
| 4 | 53034eb | withTeaserTexts; onboard catering en and A350 de | revert; DA's earlier versions |

## Brief 453 (your 452's follow-up: SWISS chat link, magazine landings at 390, fresh stages)

(My last section was headed "Brief 455"; it was your brief 452.)

Same rules: tests first, brand-scoped CSS, lint and the full suite before the push, the smoke of
every brand before and after it, SWISS's and TAP's hosts by hand; upload and preview only, nothing
published.

- One code push, after a pull: `1bcb579..ed9be02`. Your 0db5ce5 (the pinned stages' spacer) was
  already on main below my commits.
- The smoke after was the same as before on every brand.

### 1. The chat assistant link (done, 831a324, 8a92580)

- Cause: my brief 445 step (withSwissAccordions, current information's imported accordion) made
  every www link relative. That turned www's
  `https://www.swiss.com/digitalassistant/webchat.html` into `/digitalassistant/webchat.html`,
  which answers 404 on swiss.turnsthe.page, on 8 pages: ch/el, es, it, ja, pt, ru, zh and kr/ko.
- Fix (swiss-sidebar.mjs `wwwHref`):
  - a www link stays relative only when the replica serves its path (`<cc>/<ll>`, /magazine,
    /corporate, /medicalservices);
  - www's AEM path `/content/lx/markets/<cc>/<ll>/…` becomes the page's own path;
  - every other www link stays on www.swiss.com, also when www wrote it relative;
  - withTeaserTexts' button links go through the same rule.
- Other www-only paths the import makes relative: none. I checked every relative link in the
  SWISS documents (DA's originals and all my uploads since) against swiss.turnsthe.page:
  /deeplink, /corporate, /medicalservices and /content/dam answer 200, /content/lx/markets
  301s to the page, and only /digitalassistant answered 404.
- da-upload refused the 8 documents: its check that a local copy doesn't take back to www a link
  DA has relative did its job. It now has an option `--keep-www <path prefix,…>`: the given
  prefixes are left out of the check. Without the option it works as before.
- The 8 pages were rebuilt (DA's copies were exactly as I'd uploaded them; no word lost), then
  uploaded and previewed with `--keep-www /digitalassistant/`.
- On the preview, all 8 now link `https://www.swiss.com/digitalassistant/webchat.html`. Their
  login links went from `/content/lx/markets/ch/en/profile/login…` to `/ch/en/profile/login…`.

### 2. inside-swiss and travel at 390 (cause found; the fix is your decision)

- The main cause is www's advertisement slots. My brief 400 magazine design leaves them out.
  - On www each slot is a grid cell (`col-12 col-md-6 has-ad`).
  - At 1440 a slot sits in a card's place, so the heights match (0.99).
  - At 390 each slot is a row of its own, about 380 to 460 px.
  - travel has 2 such rows, inside-swiss 3.
- The rest comes from two things:
  - each card is about 12 px shorter than www's;
  - the card lists differ: on travel, www shows Florence where ours shows Bologna. That is
    content, not layout.
- Options:
  - keep the slots out, as now (www's own grey "Advertisement" placeholder only shows while no ad
    loads);
  - or reserve their space on phones with an empty slot.
- Nothing changed yet.

### 3. Stages from the fresh capture (done, ed9be02 and documents)

- swiss-snapshots-046 (2026-11-07, all 22 pages captured: A350 and onboard catering in the 11
  language versions) is in logs/b453/snap046.
- Both pages were rebuilt in every language from DA's current copies, as for ch/de and ch/en:
  www's stage heights and pins (withPinnedTeasers) and their texts and buttons (withTeaserTexts).
  20 documents changed; ch/de A350 and ch/en onboard catering were already right. No word lost.
- Fix along the way: ch/es and ch/ru write `Airbus&nbsp;A350-900`, so withPinnedTeasers now
  reads www's headings as text.
- Preview at 1440: ch/fr A350 8,324 px and ch/ja 8,308 (www's ch/de 8,283); onboard catering
  ch/de 4,344 and ch/it 4,317 (www's ch/en 4,473).

### 4. Next largest (done, 2a26e44, 97de029)

- Booking lookup fields as www's maui-input: a 50 px box, #f2f2f2 with a 1 px warm grey border,
  the label inside, 20 px to the next field, 250 px wide from 1025 px. The check-in hints are
  untracked, so they break over two lines as on www. Applies to online check-in and manage
  bookings.
  - The culinary journey form is a micro-frontend, not this block, so its 1.09 at 390 stays.
- Paragraphs 20 px apart, as www's `.richtext p` on all 60 parity pages (lh-com's are 24 px).
  - Travel insurances: 1.09 -> 1.08 at 390.
  - Locally with both changes: 20 page widths nearer www's height and 17 a little further (1 to 2
    percent, all pages already shorter than www's for other reasons).
- Still more than 5 % off (33 widths): the rows listed in briefs 445 and 450, plus the magazine
  ads above.

### Documents

- lh-swiss: 28 uploaded and previewed, 0 problems, nothing published. In release order (the code
  is on main): [../swiss/preview-paths-453.txt](../swiss/preview-paths-453.txt).
  - The 8 current information pages first; they can be released now.
  - Then the 20 stage pages.

| Item | Commit | What | Rollback |
| --- | --- | --- | --- |
| 1 | 831a324, 8a92580 | wwwHref (www-only paths absolute); da-upload --keep-www; 8 documents | revert each; DA's earlier versions (logs/b453/da) |
| 2 | — | cause: www's ad slots at 390 (decision pending) | — |
| 3 | ed9be02 | stage headings as text; 20 documents from swiss-snapshots-046 | revert; DA's earlier versions |
| 4 | 2a26e44, 97de029 | booking lookup fields as www's; paragraphs 20 px apart | revert each |

### Brief 453, item 2 after your answer (done, 8960b01)

- The ad slots stay out (your answer: keep them out).
- The cards were 9 px closer than www's on phones (65 px from a card's label to the next picture
  on www, 56 on ours). The magazine lists' and More Stories' cards are now 56 px apart below
  768 px; 1440 is as before.
- On the preview, travel is 0.88 at 390 (8,793 px, was 8,685); locally inside-swiss is 0.88 too.
  What's left is the ad rows and one card more on www (content).
- A second push after a pull: `a17b2d8..8960b01`. The smoke after was the same as before on
  every brand; SWISS's and TAP's hosts checked by hand.

## Brief 460 (lufthansa.com visual parity, de/en first)

Same rules: tests first, brand-scoped CSS, lint and the full suite before the push, the smoke of
every brand before and after it, SWISS's and TAP's hosts by hand. Nothing uploaded or published:
DA access was off (admin.da.live answered 401), so the documents below are a list for your
harness.

- One code push, after a pull: `a011927..e00ed69` (75c9418, 5b8e3e1, e00ed69).
- The smoke after was the same as before on every brand, except one 503 on austrian's `/ch/de`.
  It answered 302 as before on three rechecks, so I read it as transient.
- Measured with tools/parity capture.js and compare.js `--mask` against the www captures of
  2026-11-06 (lh-parity-002a to -002d and -003, sha256 checked).

### 1. Homepage de/en (done, 75c9418; the document needs a re-import)

- What changed:
  - The 50.0 / 46.1 / 45.0 % of 2026-11-06 came from the published document of before the
    offline package's re-import.
  - With today's document the page was already 16.5 / 13.9 / 10.2 % on the preview before this
    brief (16.5 % on aem.live too).
  - www itself changed in one place: a new footer disclaimer (`.footerdisclaimer`, the DESY
    component, "MAUI -> DESY migration switch, phase 1, LHG-first").
- Fixed (lufthansa.com only, unless noted):
  - The section after the stage is 32 px lower. www's empty quick-actions row ends with a
    transparent 30 px separator; this was 32 px short since 10-25.
  - The destination finder is 85 px further under the news carousel (69 px on phones). www has
    the same separator plus the finder's section.
  - A fare-teaser row without a price is as tall as a priced row (147 -> 142 px; every brand).
  - The footer's STAR ALLIANCE graphic was 0 x 0. lh-com's de/en footer document holds the
    horizontal token, which no default rule sized; it is now sized for every brand without its
    own rule.
  - The legal links are 10 px from their arrow, so the row wraps "Change Privacy Settings" as
    www does. The footer is now 676 px at 1440, as www's.
  - www's footer disclaimer:
    - The cleanup makes the note small print and "General Conditions" a link to
      `/de/en/fragments/modals/general-conditions`, which fragment-dialog.js opens as a dialog,
      as www opens its maui-modal. The conditions text leaves the page.
    - `tools/importer/general-conditions-dialogs.mjs` writes that dialog document from the
      snapshots after the import.
    - The fragment auto-block now leaves `/modals/` links to the dialog (scripts.js).
    - The link is 14 px bold with the dialog icon, spaced as www's: 73 / 6 / 24 px, and 53 px
      above on phones.
- Numbers (1440 / 768 / 390):

  | Version | Whole page | Above the finder | 1440, aligned at the footer |
  | --- | --- | --- | --- |
  | preview, today's document, before | 16.5 / 13.9 / 10.2 % | | |
  | preview, today's document, after the push | 6.6 / 5.3 / 10.1 % | | |
  | the re-imported document (draft on a local server, main's code) | 14.5 / 17.2 / 20.5 % | 5.1 / 5.0 / 5.3 % | 2.1 % (service tiles to the end) |

  The whole-page score gets worse with the correct disclaimer. The page below the finder is
  194 px shorter than www's at 1440, and the long conditions text used to make up for that:
  - the finder's empty state is about 86 px shorter than www's full grid. That is live data:
    the offers API doesn't answer here;
  - www's "Exclusive Offers & Benefits" is about 128 px taller (decision below).
- Decision for you:
  - www's "Exclusive Offers & Benefits" is a Monetate experiment (`section.vt-comm551-offers`,
    images from sb.monetate.net), injected in the browser. It is not in www's AEM content.
  - The 11-06 import took it as a plain list with title and text run together ("Lufthansa
    SurpriseChoose…").
  - Either render it as www's four cards in a grey band, or leave the experiment out of the
    document.
- Live data, left as it is: the fare prices and the destination finder's offers. The flash
  teaser's messages come from the Message Center index, so they are content, not live data.

### 2. Campaign template (one shared cause fixed, 5b8e3e1; one for you to sequence)

- Today on the preview at 1440, the worst pages:

  | Page | 1440 |
  | --- | --- |
  | 100-years/fleet | 38.5 % |
  | menu-on-board | 34.2 % |
  | destinations | 30.1 % |
  | stopover | 29.7 % |
  | new-onboard-experience | 28.8 % |
  | frankfurt-fair | 27.8 % |

  Most of the others are now below 25 % (the 11-06 run had stopover at 56.5 % and take-off at
  51.5 %). Every width: logs/b460 (not committed).
- Fixed in the importer: the separator between a text and an image or image carousel.
  - www puts a transparent separator (2.5rem, 40 px on some pages) between the 100-years texts
    and their carousels or collage images.
  - The cleanup dropped it, so each carousel or collage was 26 px too high.
  - The campaign template now keeps it. Checked on drafts of crane and menu-on-board: the
    -26 px step is gone.
  - It needs the campaign bundle rebuilt. I didn't rebuild it, because ema-cashub's campaign
    parsers are in flight.
  - Then 46 documents (7 pages in 7 locales) need a re-import:
    [reimport-460-lh-com.txt](reimport-460-lh-com.txt), part 3.
- For you to sequence (ema-cashub's area): the campaign template has no columns-media selector
  for top-level three- and four-column views. The info, fleet and form templates have one.
  - Those rows are flattened into one column on frankfurt-fair (ours 815 px taller), 100-years
    fleet (three images stacked full width), chronicle and new-onboard-experience.
  - The fix is info's selector `:is(.section-content, .container-content) > :is(.threecolumn,
    .fourcolumn):not(:has(…))` in page-templates.json's campaign entry, then a bundle rebuild
    and the 4 pages in every locale.
- Not layout:
  - The 100-years stages are videos: another frame on every capture (impossible.md).
  - The stopover pages' maps are a different map provider's tiles: about 600 px that cannot
    match. I suggest masking `.poi-map` in capture.js; I didn't change the scoring.

### 3. Hub at 390 and insights (one fix, e00ed69; the rest is per page)

- Hub at 390 today:

  | Page | 390 |
  | --- | --- |
  | airport-information | 25.5 % |
  | overview-special-request | 24.1 % |
  | food-and-beverages | 23.8 % |
  | overview-manage | 23.1 % |
  | meetings-and-events | 22.2 % |
  | additional-services | 18.8 % |

  The other 10 are at 16.7 % or below.
  - overview-manage lost its option spacious on the preview. DA's copy of 11-06 17:48, from
    ema-cashub's items-45 upload, has a plain cards-teaser, so its rows sit 40 px lower. It
    needs a re-import with the hub bundle (list, part 2).
  - baggage: below 768 px each grid right under a heading sits 34 px lower than www's (3 times
    on the page). The cause is lh-com's 32 px top padding for grids, measured at 1440. That
    pattern (a heading right before a cards-teaser) is in 568 documents across templates, so I
    didn't change it without a cross-template run.
  - The rest differs page by page (no offset shared by more than one page).
  - www's phone captures carry the Feedback side tab and, on baggage, the chat button.
- Insights:
  - Fixed: an image right before a heading now keeps www's 3.6rem image margin (40 px here,
    was 24). Each such pair had moved the rest of the article 16 px up.
    - know-before-you-go-berlin: 24.7 -> 18.5 % (1440), 27.1 -> 21.5 % (768), 25.8 -> 19.9 %
      (390).
    - know-before-you-go-algiers: 24.3 -> 17.3 %, 26.8 -> 21.9 %, 27.0 -> 20.8 %.
    - essentials-future-of-flying and essentials-barcelona-facts: their 16 px steps are gone.
      Their later offsets had been hidden by them, so at 390 the numbers went up (14.1 -> 15.3 %,
      10.5 -> 13.5 %); barcelona-facts 768 went 8.6 -> 6.1 %.
  - Found, not changed:
    - Both know-before-you-go pages have an empty heading on www (`h3` with `&nbsp;`) between
      the article header and the first image: 43 px the import drops.
    - On tags/allegris, www's article list starts image | text, ours text | image (33.3 % at
      1440). It is the only tag page with a list among the captures, so I didn't flip the
      block's order on one sample.

### 4. Fresh run of the changed pages (on the preview after the push)

| Page | 1440 | 768 | 390 |
| --- | --- | --- | --- |
| homepage | 16.5 -> 6.6 % | 13.9 -> 5.3 % | 10.2 -> 10.1 % |
| know-before-you-go-berlin | 24.7 -> 18.5 % | 27.1 -> 21.5 % | 25.8 -> 19.9 % |
| know-before-you-go-algiers | 24.3 -> 17.3 % | 26.8 -> 21.9 % | 27.0 -> 20.8 % |
| essentials-future-of-flying | 7.7 -> 7.7 % | | 14.1 -> 15.3 % |
| essentials-barcelona-facts | 7.6 -> 7.6 % | 8.6 -> 6.1 % | 10.5 -> 13.5 % |

- Campaign at 1440: the footer is now www's height on every page. Pages that were already
  taller than www's moved 41 px further from it: the stopover subpages 13.4-16.2 -> 14.7-17.5 %,
  munich-fair 11.7 -> 13.2 %. lufthansa-city/culinaryjourney went 10.9 -> 8.0 %.

### Documents

- None uploaded (DA access off). For your harness, in release order:
  [reimport-460-lh-com.txt](reimport-460-lh-com.txt), 49 documents.
  1. The dialog document `/de/en/fragments/modals/general-conditions` before `/de/en/homepage`.
  2. `/de/en/overview-manage`.
  3. The 46 campaign pages, once the campaign bundle is rebuilt.

| Item | Commit | What | Rollback |
| --- | --- | --- | --- |
| 1 | 75c9418 | homepage spacing, fare-row height, footer disclaimer import and dialog link, footer logo and legal row | revert |
| 2 | 5b8e3e1 | campaign: the separator before an image or carousel kept | revert |
| 2 | — | campaign column views (page-templates.json, ema-cashub's area) | — |
| 3 | e00ed69 | insights: an image before a heading 40 px above it | revert |

Checked on: main--lh-com--moved-permanently.aem.page (all captures, before and after the push);
aem.live (the homepage at 1440); a local server with main's code and the preview's documents
(port 3001); one with the draft documents (port 3002, the homepage with the disclaimer, crane,
menu-on-board); the ten turnsthe.page hosts (smoke); lh-swiss's preview (swiss-smoke) and
tap.turnsthe.page/pt-pt (200).

### Brief 460, item 1 after your answer (done, 8510d01)

- www's "Exclusive Offers & Benefits" is rendered as its four cards (your answer: render www's
  four cards).
  - The cleanup turns the Monetate section into a grey band with the headline and a Cards Icon
    Text block with the new option `mini`: one row per card, the round image | title, text and
    link.
  - The option takes the experiment's own CSS (from lh-snapshots-061):
    - white cards, 8 px radius, a soft shadow, 20 px padding;
    - a 56 px round image, an 18 px bold title, a 14 px text;
    - 4 a row from 1200 px, 2 from 768 px, 1 below.
  - The homepage bundle is rebuilt. The homepage re-import in
    [reimport-460-lh-com.txt](reimport-460-lh-com.txt) now brings it too. Its images are on
    sb.monetate.net, so postprocess-media has to take them in.
- On a draft of the re-imported homepage (the disclaimer and the cards, main's code):
  - the band is 428 / 683 px at 768 / 390 (www's 429 / 683);
  - at 1440 it is 304 px (www's 324): this renderer wraps one card's text a line shorter;
  - the page is 8.5 / 8.5 / 8.3 % at 1440 / 768 / 390, against 14.5 / 17.2 / 20.5 % without the
    cards. The rest is mostly the destination finder's empty state (live data).
- A push after a pull: `14479de..8510d01`. The smoke after was the same as before on every brand;
  SWISS's and TAP's hosts checked by hand.

## Brief 461 (Brussels upgrade links per root; the de/en pages still failing)

- DA access: a read-only list of `/moved-permanently/lh-com/de/en` on admin.da.live answered
  **200**. Nothing was uploaded.
- One push after a pull: `4590b97..de25d27` (7d9be6b, 29d9ca5, de25d27). Lint and the full suite
  passed before it (lh-edge 64 files, site 489, 0 failing).

### 1. Brussels: each market root links its own upgrade artifact (done, 29d9ca5; deployed)

- lh-edge's market route, brussels only: when it serves a language version's (or a donor's)
  document on a market root, a link starting with
  `/artifacts/flight-upgrades/fix-price-upgrade/<version cc>-<ll>` (on www.brusselsairlines.com or
  relative) gets the serving root's `<cc>-<ll>`. Nothing else is rewritten.
- Which roots have an artifact: www's upgrades pages of all 92 market roots, read over Bright Data
  (logs/b461; two sessions, the first one died after 72 pages).
  - 90 link their own artifact, and each artifact answered 200 from the page.
  - bf/en and bf/fr link none on www. They keep the version's link
    (`UPGRADE_ARTIFACT_MISSING`). Here they have documents of their own, served as they are, and
    those hold no artifact link, as www.
  - A fetch of an artifact from another root's page got a Cloudflare challenge, so I read each
    root from its own page.
- Checked on brussels.turnsthe.page after the deploy:
  - lv/en, cd/fr, ao/fr, de/en, us/en, at/de, ch/de, ch/it and nl/nl link their own
    (lv-en … nl-nl);
  - be/en, be/fr and de/de keep theirs;
  - bf/en and bf/fr have none.
- Smoke after the deploy:
  - The ten hosts with a baseline were as before. austrian's and austrian-cn's
    /de/en/search-index.json changed with the Austrian agent's upload (4590b97); austrian-cn's
    two 503s were in the before run only.
  - brussels and swiss have no committed baseline: their answers after are recorded in
    logs/smoke/b461-after-*.json (97 checks each, statuses as the other brands').
  - SWISS's hosts were checked by hand. tap.turnsthe.page/pt-pt answers 200 (TAP's committed
    baseline still expects 404).

### 2. lufthansa.com de/en pages still failing (my templates: hub, insights)

- Fresh run on the preview: hub at 1440 and 768, insights at all widths (logs/b461).
- Insights: 42 of 96 page-widths over 20 % (47 before e00ed69).
- Fixed:
  - **Hub steps (7d9be6b):** the cards-teaser parser dropped every item of a column view nested
    in a one-column view. /de/en/meetings-and-events' "01 Send enquiry / 02 / 03" came out as an
    empty block (37.4 % at 768, 34.4 % at 1440). 4 documents to re-import.
  - **Insights, image before a bold-paragraph heading (7d9be6b):** www's 40 px too.
    picture-perfect-austin: 23.7 / 29.9 / 32.8 -> 22.9 / 26.7 / 30.6 % (1440 / 768 / 390), on the
    preview after the push. The rule is two selectors now: the version with a `:has()` inside a
    `:has()` would have been dropped by browsers, so the test checks for that.
    essentials-frankfurt-facts: its steps are gone, but the later offsets they had hidden show:
    9.0 / 8.4 / 13.3 -> 10.8 / 11.1 / 11.8 %.
  - **Insights, empty headline (7d9be6b):** www's `h3` holding `&nbsp;` before the first image
    is now "{spacer-42}". Measured in the preview page: the image 1313 -> 1356 px at 1440 (www's
    1356). 11 documents (both know-before-you-go pages in 4 locales, be-picky-frankfurt in 3) to
    re-import.
  - **Tag and author lists start with the picture, as www's (de25d27):** tags/allegris,
    tags/munich, authors/florian-tomberg. The scores do not move: the list is a live block that
    capture.js masks.
- Left, not mine to change or not layout:
  - overview-manage (25.2 % at 768) is in your harness's re-import now.
  - a-perfect-day-barcelona and -berlin: the map's tiles (third party).
  - all-it-takes-is-a-yes: a video frame and the live fares.
  - tags/munich: a teaser text block below the image that www doesn't show there (to look at).
  - baggage at 390: grids under a heading 34 px low; the pattern is in 568 documents across
    templates, so it needs a cross-template run first.

### Documents

- None uploaded. For your harness:
  [reimport-461-lh-com.txt](reimport-461-lh-com.txt), 15 documents (4 hub, 11 insights; no order
  between them).

| Item | Commit | What |
| --- | --- | --- |
| 1 | 29d9ca5 | lh-edge: Brussels roots' own fix-price-upgrade artifact (deployed) |
| 2 | 7d9be6b | cards-teaser nested views; insights image before bold heading; empty headline spacer; hub, insights, homepage bundles |
| 2 | de25d27 | blog-overview: tag and author lists picture first |

Checked on:
- brussels.turnsthe.page: 14 roots by hand, plus the smoke;
- www.brusselsairlines.com: all 92 roots' upgrades pages over Bright Data;
- main--lh-com--moved-permanently.aem.page: the captures, and probes of the spacer and the list
  order;
- a local server with main's code (port 3001);
- the ten turnsthe.page hosts with baselines (smoke), lh-swiss's preview (swiss-smoke), and
  tap.turnsthe.page.

## Brief 464 (offer-card pictures, footer icons and legal row, media.lufthansa.com, Insights stage teasers)

- Noted for good: no Bright Data reads of www, for any brand. www pages come as an archive from
  your capture; I'll give you the list.
- One code push after a pull: `327d3fe..7992a5c` (7152e27, c5d1d42, 20120b2, 80d6b20, 7992a5c).
  Lint and the full suite passed before it (lh-edge 64 files, site 500 and 501, 0 failing).
- Smoke after the push: the ten hosts with a baseline as before. brussels and swiss match their
  brief 463b recordings (97 checks each, 0 differ). SWISS's hosts were checked by hand, and
  tap.turnsthe.page/pt-pt answers 200.

### 1. Offer-card pictures (done, 7152e27)

- Cause: the tracking filter ran after convertOfferCards and took the four sb.monetate.net
  pictures out of the block.
- Fix: the conversion marks its pictures, and the filter keeps marked ones (and drops the
  marker). The page's other Monetate images still go.
- The new test runs both hooks of the cleanup on www's whole de/en homepage of 2026-11-06
  (lh-snapshots-061, gzipped fixture). Homepage bundle rebuilt.

### 2. Payment and social icons keep their PNG copies (done, c5d1d42)

- The 13 copies DA and live use, `/media-da/<md5 of the www URL>.png` (made 2026-10-21), are now
  in tools/importer/png-copies/.
- postprocess-media writes that copy for such an SVG instead of keeping the SVG or rasterizing
  it anew. A document may hold the www URL or a snapshot import's local copy of the SVG
  (recognised by its bytes). The Instagram logo is among the 13.

### 3. media.lufthansa.com in switch-dam-media (done, 20120b2)

- A video link on media.lufthansa.com/content/dam/… is treated like www's: the same dam-path.js
  name.
- A link text that was the address becomes the copy's path, as your switch did.
- Viewer configs and text tracks on that host are read the same way. No documents changed here.

### 4. Footer: "Change Privacy Settings" wraps at 1440 (done, 80d6b20)

- 75c9418 had put the row's text where www's is (Imprint at x 127 in both captures). The last
  item still fitted or not by about 8 px, depending on the renderer: in a headless browser it
  wrapped (preview, live and lufthansa.turnsthe.page), in your check it did not.
- The row now has 20 px less room on the right from 1025 px, so it wraps in any renderer.

### 5. all-it-takes-is-a-yes and ema-cashub's columns-media heading fix

- The fix (22f09f80, 9d25c98e) styles unmarked h3s in columns-media, outside Insights
  (`main:not(:has(.article-header))`). This page's column headings are h2s, so it doesn't
  change this page.
- On the preview its numbered sections render as www's: same headings and sizes, and the same
  picture and text sides.
- What differed was the lone stage teaser ("Lufthansa Insights / Ready for new adventures?"),
  now fixed under item 6. No re-import for the heading fix.

### 6. Open parity rows

- **tags/munich's extra teaser text (done, 7992a5c):**
  - Cause: it is www's stage teaser, with text over the picture and a button, which the import
    had flattened into a picture, two headings and a link.
  - Same pattern on tags/allegris, all-it-takes-is-a-yes, winter-destinations and one be-picky
    page: 17 documents over the snapshots.
  - The insights template now gives such a stage to the cards-teaser parser: one overlay card
    with the new option `wide` (across the row, www's horizontal gradient, subheadline light,
    white outlined button). Checked on a draft of tags/munich: as www's at 1440.
  - The three de/en documents are in DA with the block, built from DA's own copies (a rollback
    is in logs/b464/da); uploaded and previewed, not published. DA's copies match the local
    ones.

  | Page | Before (1440 / 768 / 390) | After |
  | --- | --- | --- |
  | tags/munich | 30.2 / 25.8 / 22.3 % | 25.1 / 20.7 / 19.5 % |
  | all-it-takes-is-a-yes | 26.7 / 26.0 / 22.4 % | 24.0 / 26.5 / 17.8 % |
  | tags/allegris | 32.6 / 19.2 / 31.3 % | 37.3 / 24.0 / 36.5 % |

  tags/allegris got worse: its "More Stories" tiles are an empty block in its document (the
  nested-view bug fixed in 7d9be6b), and the page now lines up differently around them. Its
  re-import brings the tiles. Three more meetings-and-events documents (xx/es, xx/fr, fr/fr)
  had the same empty block and are on the list too.
- **baggage's grids 34 px low at 390 (cause found, nothing changed; scope below):**
  - Cause: under a heading at <768 px, our grid starts 60 px below the heading (its 28 px margin,
    then lh-com's 32 px top padding for grids, measured at 1440). www has 40 px, because its
    column view has no top padding on phones and its items 12 px.
  - After a text, the same 32 px matches www at 390 (services-on-board).
  - Scope: a heading directly before a grid (not overlay) is in **36 documents**: traveltricks,
    online-check-in and digital-self-services (7 locales each), baggage/gepaeck (7),
    flight-search/flugsuche (7) and longed-for-destinations-at-a-glance (1). online-check-in and
    flight-search are ema-cashub's templates.
  - Proposed: below 768 px, a grid right after a heading starts 12 px under it. It is one
    lufthansa.com rule; it changes those 36 pages at 390 and nothing at 768 or 1440.
  - Your go, and whether ema-cashub should check online-check-in and flight-search first.

### Documents

- 3 uploaded and previewed, nothing published, in release order:
  [preview-paths-464.txt](preview-paths-464.txt) (the code is on main).
- For your harness: [reimport-464-lh-com.txt](reimport-464-lh-com.txt), 20 documents (17 Insights,
  3 hub).

| Item | Commit | What |
| --- | --- | --- |
| 1 | 7152e27 | offer-card pictures through the whole cleanup |
| 2 | c5d1d42 | payment and social icons: the PNG copies |
| 3 | 20120b2 | switch-dam-media: media.lufthansa.com as www |
| 4 | 80d6b20 | footer legal row wraps in any renderer |
| 6 | 7992a5c | Insights lone stage teaser as one wide overlay card; 3 documents |

Checked on:
- main--lh-com--moved-permanently.aem.page: probes, the captures before and after, the three
  documents;
- main--lh-com--moved-permanently.aem.live and lufthansa.turnsthe.page: the legal row at 1440;
- admin.da.live: DA's copies read, then uploaded;
- a local server with the draft (port 3002);
- the ten turnsthe.page hosts with baselines, plus brussels and swiss against their recordings;
- lh-swiss's preview (swiss-smoke) and tap.turnsthe.page.

## Brief 467 (grids under headings at 390, SWISS two-up, open parity rows)

- Left from the last turn, not in git: the generated import reports under tools/importer/reports
  (never committed) and the scratch in logs/b460, logs/b461 and logs/b464. Nothing was unpushed.
- One code push after a pull: `2ff55ae..e5c9ba9` (73c2ea5, e5c9ba9). Lint and the full suite
  passed before it (lh-edge 64 files, site 507, 0 failing). The deploy serves the new rule.
- Smoke before and after: the ten hosts with a baseline match their before run, check for
  check. brussels and swiss match their brief 464 recordings (97 checks each, 0 differ).
  SWISS's hosts were checked by hand (swiss-smoke as before), and tap.turnsthe.page/pt-pt
  answers 200.

### 1. Grids under a heading at 390 (done, 73c2ea5)

- The rule from brief 464, lufthansa.com only: below 768 px, a grid (not overlay, not
  spacious) right after a heading starts 12 px under it, so heading to first picture is www's
  40 px. After a text, and from 768 px, the 32 px stay. The test came first.
- ema-cashub's two templates (online-check-in, flight-search): I checked them and changed no
  template; their documents are untouched, only the rule applies.
- Measured against www's captures (lh-parity-002), before (preview) and after (local, then
  preview after the push, the same numbers):

  | Page | 1440 | 768 | 390 |
  | --- | --- | --- | --- |
  | baggage | 11.1 → 11.1 % | 11.5 → 11.5 % | 10.3 → 9.2 % |
  | flight-search | 13.1 → 13.1 % | 14.0 → 14.0 % | 17.7 → 11.3 % |
  | online-check-in | 8.6 → 8.6 % | 14.5 → 14.5 % | 37.4 → 37.4 % |
  | traveltricks | 20.0 → 20.0 % | 32.9 → 32.9 % | 30.9 → 30.9 % |

  - baggage (and gepaeck): its three grids now sit 40 px under their headings, as on www.
  - flight-search: the grid's step at 390 went from +31 to +11 px.
  - online-check-in: its grid is 41 px under the heading now; the page's 390 difference is
    elsewhere (www's page is 1,600 px taller there).
  - traveltricks: its grid is spacious, so the rule leaves it alone; unchanged, as expected.
  - 768 and 1440 are unchanged on all four.
- No re-imports: CSS only.

### 2. SWISS row 41: cards two to a row (done, e5c9ba9 and 27 documents)

- The fleet and travel regulations hubs already had it: the fleet two-up since brief 450, and
  travel regulations is four to a row on www too, as ours.
- The documents still showing www's two-column card views three to a row were imported before
  withTwoUpCards. Across the 456 snapshot pages with such views, 27 were still missing it:
  airbus-longhaul in 12 languages, the new destinations pages, corporate careers and SDG, and
  one local page.
- Test first: withTwoUpCards on DA's copy of /ch/en/discover/fleet/airbus-longhaul and www's
  page: three grids get two-up, nothing else changes, and running it again changes nothing.
- The 27 were built from DA's own copies (a rollback is in logs/b467/da), uploaded and
  previewed, not published. DA's copies match the local ones.

### 3. Open parity rows

- lufthansa row 12 (the Monetate offer block) now records your later answer (www's four cards,
  8510d01, pictures kept by 7152e27).
- lufthansa row 19 (help & contact without its stage photo): the cause is found.
  - On lufthansa.turnsthe.page the help app's script loads, but
    /digitalhangar/cs-help-center/feature-manager/LH/features.json answers 403 through lh-edge
    (www refuses lh-edge's fetch), so the app shows its fallback.
  - On aem.page the script itself is CORS-blocked.
  - lh-edge already serves recorded copies of these files for LX, OS and ITA, but LH has none.
  - The fix needs LH's files as an archive: [capture-467-lh-help-center.txt](capture-467-lh-help-center.txt),
    25 www URLs (features.json, plus topics and translations for 12 languages).
- What stays open: lufthansa row 18 (the travellers panel, ema-cashub's flight search) and SWISS
  row 35 (offer fares, data I can't verify).

### Documents

- 27 SWISS documents uploaded and previewed, nothing published, in release order:
  [../swiss/preview-paths-467.txt](../swiss/preview-paths-467.txt) (the code is on main).
- lh-com: none (CSS only). No harness re-imports.

| Item | Commit | What |
| --- | --- | --- |
| 1 | 73c2ea5 | lufthansa.com: a grid under a heading 40 px down on phones |
| 2 | e5c9ba9 | SWISS withTwoUpCards test; 27 documents two-up |

Checked on:
- main--lh-com--moved-permanently.aem.page: the four pages at 1440, 768 and 390, before and
  after the push;
- a local server with the draft (port 3001);
- lufthansa.turnsthe.page and aem.page: the help app's requests (row 19);
- admin.da.live: DA's copies of the 27 SWISS documents read, then uploaded;
  main--lh-swiss--moved-permanently.aem.page: those 27 previewed;
- the ten turnsthe.page hosts with baselines, plus brussels and swiss against their recordings;
- lh-swiss's preview (swiss-smoke) and tap.turnsthe.page.

## Brief 472 (visual parity sweep of lufthansa.com and SWISS)

- Left from the last turn, not in git: the generated import reports under tools/importer/reports
  (never committed) and the scratch in logs/b460, b461, b464 and b467 (with the 27 SWISS rollback
  copies). Nothing was unpushed. This turn's scratch is in logs/b470 (captures, analysis, drafts).
- One code push after a pull: `9a2b720..c20b77e` (240924c, c20b77e). Lint and the full suite
  passed before it (lh-edge 64 files, site 519, 0 failing). The new rule is served on aem.page,
  aem.live and lufthansa.turnsthe.page.
- Smoke before and after: the ten hosts with a baseline match their before run, check for check;
  brussels and swiss match their brief 467 recordings (97 checks each, 0 differ); SWISS's hosts
  by hand (swiss-smoke as before) and tap.turnsthe.page/pt-pt answers 200.

### 1. The sweep

- Archives: lh-parity-003 checks against its record in lh-deliveries.json (`67912ec2…6a900`);
  swiss-parity-001 against the one in swiss/parity.md (`75a70815…b976f`). The drop has no
  `.sha256` files for either (`.tar.gz.sha256`, `.sha256`, `.sha256sum` answer 404).
- lh-parity-003 is part e of the 2026-11-06 capture (6 pages that replace 002's), so the sweep
  took the whole capture: 296 lufthansa.com pages (002a to -002d, already here) and SWISS's 24, at
  1440 and 390, ours on lufthansa.turnsthe.page and swiss.turnsthe.page with capture.js's settle
  steps. No www page was requested.
- Measured: page height, the pixel difference with the live-widget mask (as baggage), and where
  each of our h1/h2, block tops and pictures sits in www's screenshot (image matching; SWISS
  headings also against www's recorded boxes).
- One slip to report: to try the draft rules I first ran 64 Insights and 49 SWISS captures on a
  local server. There our themes' fonts fall back to www's address (www.lufthansa.com,
  www.swiss.com), so those captures fetched the font files from www. I stopped that run and
  measured on the turnsthe.page hosts with the draft CSS injected instead.
- The file: [../parity-2026-11-08/sweep-lh-swiss.md](../parity-2026-11-08/sweep-lh-swiss.md),
  one line per page and width (640), worst first, the cause where found, and the list for you.

Top 10 (page and width, difference, cause):

| # | Page | Width | Diff | Cause |
| --- | --- | --- | --- | --- |
| 1 | /de/en/business-class-on-short-and-medium-haul (info) | 390 | 45.5 % | the columns-media rows from "Relaxation right from the start" on 188 px lower (ema-cashub, not diagnosed) |
| 2 | /de/en/100-years/fleet (campaign) | 1440 | 38.5 % | www's 15 spec tables missing: fixed in the template, re-import |
| 3 | /de/en/online-check-in (app-entry) | 390 | 37.4 % | www's three tab panels (ema-cashub) |
| 4 | /de/en/overview-manage (hub) | 390 | 37.4 % | www's 2026-11-06 page shows Check-in without its picture; a fresh snapshot decides |
| 5 | /de/en/articles/tags/allegris (insights) | 1440 | 37.3 % | re-imported during the sweep (brief 464 list); 34.3 % in the later run |
| 6 | loungenet fra-first-class-lounge-b (lounge) | 390 | 36.7 % | not diagnosed (the same page twice on www) |
| 7 | loungenet muc-first-class-lounge (lounge) | 390 | 36.7 % | as 6 |
| 8 | /de/en/articles/tags/allegris (insights) | 390 | 36.5 % | as 5 (30.4 % later) |
| 9 | /de/en/most-significant-route (campaign) | 390 | 34.4 % | the accordion flattened: fixed in the template, re-import |
| 10 | /de/en/economy-class (info) | 390 | 34.1 % | not diagnosed (ema-cashub) |

SWISS's worst are the magazine article at 390 (32.9 %, 32.2 %: www's ad slots, left out by design).

### 2. Fixes (mine)

- **Campaign template (240924c):** two mappings it lacked.
  - Accordions: www's accordions on most-significant-route and stopover lost their titles and were
    flattened (+1,420 px at 390; +2,652 px at 1440). Mapped to accordion-columns as the other
    templates do.
  - Tables: 100-years/fleet's 15 spec tables never reached the documents (9,685 px shorter at
    1440). Mapped to table-striped, and a view with a table is left out of columns-media.
  - Drafted offline from the snapshots with the rebuilt bundle: of the 21 de/en campaign
    documents only these pages change, plus frankfurt-fair, which is older than today's importer
    (its benefits grid and text columns flattened).
- **Insights (c20b77e):** the text after the "This may also be of interest to you" cards ran at the
  cards' width instead of two thirds. Barcelona 27.5 → 21.9 %, Berlin 24.5 → 18.6 % at 1440 on
  lufthansa.turnsthe.page after the deploy; 390 unchanged; the other 30 Insights pages as before
  (draft run).
- **SWISS card grids (swiss row 42, open):** www has two column-view spacings (a wrapper with class
  `section`: the first card 72 px under the H1 at 390; a plain one: about 60 px), and our documents
  don't tell them apart. One theme rule for both fixed half the hubs and broke the other half
  (mean 14.7 → 14.8 %), so I reverted it. Next: the SWISS importer marks each grid from www's
  wrapper, then a rule per kind (16 documents).
- Parity rows: lufthansa 26 to 28, swiss 42.

### 3. For you

- Causes in other agents' files, with www's and our counts: in the sweep file ("For you").
  ema-cashub: 18 info, legal, app-entry and form pages (accordions and tabs not imported as such,
  pages 500 to 8,100 px off, feedbackai rendering only its viewport). ema-test: nothing.
- A fresh snapshot of www's /de/en/overview-manage (is the Check-in picture gone?).

### Documents

- None uploaded this round.
- For your harness: [../parity-2026-11-08/reimport-472-lh-com.txt](../parity-2026-11-08/reimport-472-lh-com.txt),
  28 documents in release order (the accordion pages' 14 versions, 100-years/fleet's 7,
  frankfurt-fair's 7). stopover's hero becomes `narrow` (today's parser).

| Item | Commit | What |
| --- | --- | --- |
| 2 | 240924c | campaign template: accordions and spec tables kept |
| 2 | c20b77e | Insights: article text two thirds after the cards too |

Checked on:
- lufthansa.turnsthe.page and swiss.turnsthe.page: the sweep (640 page-widths), the draft rules
  injected, and the two Insights pages after the deploy;
- main--lh-com--moved-permanently.aem.page: the documents' current blocks (.plain.html), the
  served styles; aem.live: the served styles;
- an offline browser (every request aborted): 21 campaign drafts from the bd-snapshots;
- the archive's own HTML and CSS, rendered locally (no requests out): SWISS's card styles and
  column views;
- a local server (ports 3011, 3012): the first draft run, stopped (see the slip above);
- the ten turnsthe.page hosts with baselines, plus brussels and swiss against their recordings;
- lh-swiss's preview (swiss-smoke) and tap.turnsthe.page.

## Brief 474 (Brussels articles hub and homepages, brand homepages and footers, SWISS row 42, 100 Years)

- Left from the last turn, not in git: the generated import reports under tools/importer/reports
  (never committed) and the scratch in logs/b460, b461, b464, b467 and b470. Nothing was unpushed.
  This turn's scratch is in logs/b474 (captures, drafts, the DA rollback copies of the five documents).
- One code push after a pull: `4c901fc..4710b79` (d74d2e4, a7156d3, c5da53b, 145fbe3, 4710b79).
  Lint and the full suite passed before it (lh-edge 64 files, site 531, 0 failing). The new rules and
  the fare teaser's change are served on swiss, brussels, discover and airdolomiti.turnsthe.page and
  on aem.page.
- Smoke before and after: the ten hosts with a baseline match their before run, check for
  check; brussels and swiss match their brief 472 recordings (97 checks each, 0 differ); SWISS's
  hosts by hand (swiss-smoke as before) and tap.turnsthe.page/pt-pt answers 200.
- Captures: brussels-parity-003 (`f78cf1fc…ecb7e`), airdolomiti-parity-001 (`a2b8d33e…7df3`), both
  equal to their .sha256; discover-parity-001 (`b08cb37e…a2b330eb`, no .sha256: as recorded in
  ema-lufthansa's sweep); cargo-parity-001 and ita-parity-002 from brief 425. No www page was
  requested; www's values come from the captures' screenshots and their HTML and CSS rendered
  locally with every other host refused.
- An interrupted `git stash -u` before the pull removed my new tests and the untracked reports from
  the tree for a moment; all restored from the stash, nothing lost.

### 1. Brussels

- **Articles hub at 1440 (P45, d74d2e4):** the insights template now maps a three-column view of videos
  to one columns-media row; the three documents (be/en, be/fr, be/nl) changed the same way in DA,
  uploaded and previewed. be/en: 4,687 px at 1440 against www's 4,635 (was 10,838).
- **Articles hub's cards (P46, a7156d3):** www's card type and spacing (40 px padded, title 20/22 with
  30 px under it, the date line 20/22, the teaser 18/24, pictures 16:9; 24/26.4 and 18/19.8 from
  768 px). Card to card within 2 px of www's at 390 and 1440, en and fr (were 57-84 px short at 390).
- **Kenya and France homepages (P47, a7156d3):** the +239 px was the deals: ours kept the authored
  routes the fare service had no fare for (eleven rows; www shows the six priced ones). The fare
  teaser now drops such routes once the service has answered live (all stay without an answer), and
  Brussels' deals are www's boxed cards (125 px pictures, the price right). The prices are live and
  answered only some of the agent's runs; on the run with prices, five of eleven dropped out, and
  the cards look as www's.

### 2. Homepages and footers

- **Discover's footer on phones (row 32, c5da53b):** 1,274 px against www's 1,271 (was 802).
- **Discover's homepage (row 33):** the document's {spacer-60} doubled the space under the stage;
  out of de/en and de/de, uploaded and previewed: "Economy Class Offers" 5 / 13 px off www's at
  1440 / 390 (was 65 / 73).
- **Air Dolomiti's footer on phones (row 61, c5da53b):** www's light teal ">" arrow, down while open
  (drawn in the theme; www's file is not in the capture).
- **Air Dolomiti's homepage (row 62):** www's new layout keeps the same nine blocks and their data,
  so a re-import gives the same document; the look of the blocks must change (for you, below).
- **ITA's footer at 1440:** the columns already sit where www's do (x 91, 409, 730, 1052); the rest is
  Arial drawn on macOS in the capture against Linux in ours (the theme uses Arial as www does, whose
  LufthansaText never loads). Nothing to change.
- **Cargo's homepage:** within 0.5-1.3 % in height; the slider and the news change by load.

### 3. SWISS row 42 (145fbe3)

- Measured on www's screenshots by the cards' frames: views in a section component put the first card
  72 px under the H1 on phones (73 from 768 px), 65 / 64 px between grids; plain views 60 / 80 and
  41 / 81; both 31 px between cards on phones, titles 15 px over the text.
- The importer marks a plain view's grid plain-view (withPlainViews); the theme spaces each kind.
  With the rules injected and the option set, the frames sit within 1-2 px of www's on manage, extra
  services, special requests, travel information and travel classes at 390 and 1440.
- 277 documents (473 grids) take the option on re-import:
  [../swiss/reimport-474-swiss.txt](../swiss/reimport-474-swiss.txt). Until then their grids get the
  section kind's spacing (at 1440 the first card 7 px higher than www's; on phones about as now).

### 4. lufthansa.com 100 Years and take-off

- **take-off:** its rows are the same views as travel information's (which match www's exactly); the
  per-row differences are text wrapping one line longer or shorter. No layout cause.
- **100-years/campaigns (and chronicle):** the drift is 40-70 px at each component boundary, most
  above the decade-title pictures; www's spacing there needs its rendered HTML and CSS, which no
  capture on this machine has: on the capture list ([capture-474.txt](capture-474.txt)).

### For you

- **Air Dolomiti's homepage blocks (ema-lufthansa's):** the promotions as tall cards (316 x 500 at
  1440, carousel-cards promo); eSIM and Miles & More as picture tiles with the title and button on the
  picture (cards-teaser); the Lufthansa Group strip as a beige text box beside its picture
  (hero-card-overlay: www's backgroundImageLeft, the importer already reads it); the services as
  picture tiles with the text on them (cards-teaser).
- **Capture list:** capture-474.txt (100 Years campaigns and chronicle, rendered; Air Dolomiti's
  arrow.svg).
- **Public client ids in fixtures:** I blanked www's public Travel ID client id in four of my fixtures
  (4710b79; git history keeps the old copies). Others still carry it: test/fixtures/importer-rows
  (three online-check-in pages) and test/fixtures/lh-app/lufthansa-04601cc.ndjson.

### Documents

- 5 uploaded and previewed, nothing published, in release order:
  [../brussels/preview-paths-474.txt](../brussels/preview-paths-474.txt) (3) and
  [../discover/preview-paths-474.txt](../discover/preview-paths-474.txt) (2). DA matches the local
  copies; rollbacks in logs/b474/da.
- For your harness: [../swiss/reimport-474-swiss.txt](../swiss/reimport-474-swiss.txt), 277 SWISS
  documents.

| Item | Commit | What |
| --- | --- | --- |
| 1 | d74d2e4 | insights: a three-column view of videos as one row |
| 1 | a7156d3 | fare teaser: unpriced routes out after a live answer; Brussels' deals and article cards |
| 2 | c5da53b | Discover's and Air Dolomiti's footers on phones |
| 3 | 145fbe3 | SWISS grids by www's two kinds of view |
| - | 4710b79 | fixtures: www's public client id blanked |
| - | (docs) | campaign, hub, homepage and insights bundles rebuilt with a904be8's accordion parser |

Checked on:
- brussels, discover, airdolomiti, swiss and ita.turnsthe.page: the captures, the draft rules injected
  (and the option / unpriced drop by script), the served code after the push;
- main--lh-brussels--, main--lh-discover--moved-permanently.aem.page: the five documents, rendered with
  www's hosts refused;
- admin.da.live: the five documents read, then uploaded and previewed;
- the captures' HTML and CSS rendered locally (no request out): Brussels' cards and deals, Discover's
  footer, SWISS's views, ITA's footer;
- the ten turnsthe.page hosts with baselines, plus brussels and swiss against their recordings;
- lh-swiss's preview (swiss-smoke) and tap.turnsthe.page.

## Brief 478 (100 Years fleet tables, Brussels footer, fixtures' client ids, sweep rows)

- Left from the last turn, not in git: the generated import reports under tools/importer/reports
  (never committed) and the scratch in logs/b460, b461, b464, b467, b470 and b474. Nothing was
  unpushed. This turn's scratch is in logs/b478 (drafts, renders, measurements).
- One code push after a pull: `09ce978..0c601aa` (bc0eb5a, e7c6e59, 23dd6d3, 0c601aa). Lint and
  the full suite passed before it (lh-edge 64 files, site 544, 0 failing). The new rules and the
  block change are served on lufthansa and brussels.turnsthe.page and on aem.page.
- Smoke before and after: the ten hosts with a baseline: the same counts before and after; on the
  three lufthansa hosts /de/en/search-index.json and the de/en sitemap hash differently between the two
  runs (content published in between: round 73 and the harness's re-imports; no code of this push
  reads them). brussels and swiss match their brief 474 recordings (97 checks each, 0 differ); SWISS's
  hosts by hand (swiss-smoke as before) and tap.turnsthe.page/pt-pt answers 200.
- No www page was requested: lh-snapshots-062 and lh-parity-002 / -003, brussels-parity-003.

### 1. 100 Years fleet's spec tables (row 43; bc0eb5a)

- www (lh-snapshots-062, lh-parity-002): each of the 15 tables is in a two-column view with its
  picture or text, picture | table (9), table | picture (Focke-Wulf A 17a, "Big birds across the
  Atlantic", the three-engine globetrotter), text | picture + table and the like. From 768 px side by
  side (622 px each, 20 px apart at 1440, the table 39 px under the column's top), below stacked (the
  picture 90 px over the table, pictures 16:9).
- Now: the campaign template's parser table-beside makes each view one table-striped block with the
  option beside (partner left) or beside-end (right): its first row the partner column and what sits
  above the table, then the table's rows. table-striped lays the option out as www; without it the
  block is as before (TAP's and every other table).
- Drafted offline from the snapshot with the rebuilt bundle and rendered locally (www's hosts
  refused): 15 tables, 12 beside, 3 beside-end, side by side at 1440 and stacked at 390.
- Documents: the 7 language versions for your harness,
  [../parity-2026-11-08/reimport-478-lh-com.txt](../parity-2026-11-08/reimport-478-lh-com.txt).

### 2. Brussels' footer on phones (P48; e7c6e59)

- www's rows 40 px high one every 60 px and 32 px in, "Social media" 14/15.4 bold, the legal links 78 px
  under the icons, the dark band 58 px past them, the logo band 42 px padded. With the rules injected
  on brussels.turnsthe.page: 831 px against www's 829 (/be/en/articles/milan-citytrip; was 696),
  every row within 3 px.

### 3. The public client ids in the other fixtures (23dd6d3)

- Blanked in test/fixtures/importer-rows (three online check-in pages) and
  test/fixtures/lh-app/lufthansa-04601cc.ndjson; no fixture in the repo holds one now (git history
  keeps the old copies). The ndjson is a recording the apps' current output is compared with, and the
  code still builds those URLs with the id, so test/lh-app-brands.test.mjs blanks the same ids in its
  fresh output before comparing (16 of 16 pass).

### 4. The next rows over 10 % (sweep-lh-swiss.md, mine)

- overview-manage (37 %): waits for the fresh snapshot (on your capture list).
- take-off (34 %): no layout cause (text wrapping per row, brief 474).
- picture-perfect-austin (31 % at 390): the page matches www's (height within 2 %); the difference is
  its photos shifted by about 12 px, which the pixel count weighs heavily. No cause.
- 100 Years campaigns, new-onboard-experience, destinations, cabin-design, chronicle, history (20-33 %):
  one shared cause, the spacing between the campaign components (steps of 40-66 px at each boundary,
  shorter at 390, mixed at 1440). New this round: www's 2026-11-06 stylesheets are in lh-parity-003's
  html/css, and lh-snapshots-062 links exactly those files, so a snapshot renders locally with www's
  own CSS (no request out). On campaigns at 390 it shows the rhythm (each component its own section,
  24 px apart, a text or picture section padded 20 / 20, a column view 32 / 32 more), which explains
  the steps at 390. The 1440 side needs the same component-by-component table; next round with this
  method. The capture request for these pages (capture-474, item 1) may not be needed any more.

### Documents

- None uploaded this round.
- For your harness: [../parity-2026-11-08/reimport-478-lh-com.txt](../parity-2026-11-08/reimport-478-lh-com.txt),
  7 documents (100-years/fleet: de/en, de/de, at/de, gb/en, fr/fr, xx/es, xx/fr).

| Item | Commit | What |
| --- | --- | --- |
| 1 | bc0eb5a | campaign importer, table-striped: spec tables beside their partner |
| 2 | e7c6e59 | Brussels' footer on phones |
| 3 | 23dd6d3 | fixtures: the remaining public client ids blanked |
| - | 0c601aa | campaign script and bundle rebuilt on bb2400f |

Checked on:
- lh-snapshots-062 and the lh-parity-002 / -003 screenshots: www's fleet views and their spacing;
- the snapshot rendered locally with lh-parity-003's CSS (no request out): the campaign components;
- an offline browser (every request aborted): the fleet draft; a local server with the draft,
  rendered with www's hosts refused;
- brussels.turnsthe.page: the footer before and with the rules injected; brussels-parity-003's CSS
  rendered locally;
- the ten turnsthe.page hosts with baselines, plus brussels and swiss against their recordings;
- lh-swiss's preview (swiss-smoke) and tap.turnsthe.page.

## Brief 484 (2026-11-08): campaign section spacing, hub and Insights rows

Left from 482: the generated import reports and the scratch in logs/b460 to b478 (not committed);
nothing unpushed.

### 1. Campaign section spacing (rows 45, 46; 4bed4bf, 1136e14)

- Method: lh-snapshots-062 rendered locally with lh-parity-003's CSS, its pictures replaced by
  placeholders of our pictures' sizes (the same 29 pictures in the same order on campaigns), so
  heights around pictures match; per AEM section and per component against our page and against
  the importer's draft, which is rendered on lufthansa.turnsthe.page as `<main>` (route on the
  document, nothing from www). Then the same drafts with the CSS injected, captured against
  lh-parity-002 (compare.js, 8,000 px, vh 900; offsets.mjs for the drift).
- Cause: lufthansa-sections keeps an unpadded AEM section with the one before it. On campaigns
  www's 20 AEM sections came in as 9 of ours, so every merged boundary lost or gained www's padding
  (2rem / 4rem) and .mb-default (2.4rem). The whole page was within 8 px of www's at 1440 only
  because steps of +155 and -160 px cancelled out.
- Fix: the campaign template's own transformer (campaign-sections; page-templates.json
  `"transformers"`, which build-import-script.js now runs after the shared ones) makes every AEM
  section a section of ours: style campaign-section + padded + spaced / flush. With them go the
  template's unstyled breaks inside an AEM section and the cleanup's quote and carousel spacers (the
  neighbour's padding is real now). A trailing empty paragraph becomes a 51 px spacer, a trailing
  empty separator its own spacer. styles.css (lufthansa.com) sets the rest, measured per component:
  no section gap; the last component's margin stays in the section (live's clearfix); quotes with
  .author-quote's side margins and subline; a picture's 4rem before more content; a column view's
  3.2rem under its last row; teaser cards spaced like a column view; nothing extra after a sidebar.
- A quote under the text of a sidebar ("There's no better way to fly.") was missing on every
  campaigns page (and on the carbon-offsetting saf pages): the columns-media parser keeps it now.
- One thing the local render got wrong: www's separators are maui-divider web components (shadow
  DOM, a 1 px box), so paragraph margins don't collapse through them on www. A collapse rule derived
  from the script-free render made crane and menu-on-board worse against the captures; it was taken
  out and the spacers keep their N + 1 px.
- Against lh-parity-002 (whole page % / drift steps px), published page, then draft + CSS:

| Page | 1440 | 390 |
| --- | --- | --- |
| 100-years/campaigns | 24.2 / 553 → 29.9 / 226 | 33.1 / 287 → 27.6 / 221 |
| 100-years | 16.8 / 243 → 13.5 / 112 | 21.1 / 173 → 20.2 / 24 |
| 100-years/cabin-design | 19.9 / 265 → 13.8 / 59 | 24.9 / 577 → 24.3 / 423 |
| 100-years/chronicle | 21.3 / 416 → 15.0 / 61 | 14.8 / 183 → 21.1 / 233 |
| 100-years/crane | 9.0 / 224 → 11.8 / 284 | 15.0 / 208 → 16.5 / 292 |
| 100-years/destinations | 30.1 / 353 → 18.6 / 225 | 12.5 / 138 → 15.2 / 154 |
| 100-years/fleet | 25.6 / 621 → 25.2 / 595 | 14.0 / 1423 → 9.1 / 1865 |
| 100-years/global-network | 18.0 / 472 → 13.9 / 264 | 20.0 / 522 → 19.7 / 925 |
| 100-years/history | 15.8 / 187 → 1.9 / 0 | 24.9 / 150 → 8.2 / 21 |
| 100-years/history/menu-on-board | 15.3 / 90 → 9.7 / 74 | 19.1 / 831 → 19.8 / 109 |
| discover-lufthansa/new-onboard-experience | 27.6 / 572 → 25.7 / 360 | 30.0 / 401 → 27.6 / 296 |

- Higher after: campaigns at 1440 (whole page; its drift fell from 553 to 226 px, but two nested
  column views, open below, no longer have errors to cancel them), crane, and chronicle,
  destinations and global-network at 390. Still open, all outside this rule: on campaigns, a
  [empty | picture] view and a sidebar inside a column (www draws the picture at half or three
  quarters of the column, ours across it: +184 and +128 px at 1440); on chronicle at 390, the jump
  links' list height; and carousels everywhere (www's script sizes them, so the local render can't
  show them).
- Documents: 48 campaign documents (12 pages × de/en, de/de, at/de, gb/en), de/en first:
  [../parity-2026-11-08/reimport-484-lh-com.txt](../parity-2026-11-08/reimport-484-lh-com.txt). 32 of
  them are also on ema-test's reimport-lh-com-padded-sections.txt, which your harness ran in
  e844428 with the bundle before this one: those 32 need this import again (the bundle pushed here
  keeps that padding rule). 36 campaign pages
  don't change (one AEM section, or none: stopover hotels, the fairs, take-off,
  most-significant-route, culinaryjourney), and menu-card has no snapshot. The drafts were built
  from lh-snapshots-062 for de/en, which is what the published new-onboard-experience and fleet came
  from: the 2026-10-21 snapshots don't have their hero's option regular or one picture.

### 2. Hub and Insights rows over 10 %

Only additional-services and food-and-beverages (hub) are in lh-snapshots-062. The other rows'
snapshots (2026-10-21) render with that day's CSS from tools/source-export/static (v1.38.0
lufthansa.css, index.KLnJf0H_, app.5ad288dc), which works too.

- additional-services (27.1 % / 18.8 %): www's bands are a stage, a 60 px separator, a three- or
  four-column view of icon links, then another 60 px separator. The column view has 3.2rem above and
  below (184 px high, ours 120 in cards-icon.usp), so ours is 30 px short per band, -143 px over five
  bands. cards-icon is ema-test's (list below).
- food-and-beverages (17.6 % / 23.8 %): www's 40 px separators between the components are dropped
  (the cleanup keeps 50 px and more) and the sections merged. The campaign transformer settles it:
  as a draft with the hub template opted in, 12.0 % / 11.4 %, no drift to 2,240 px. I did not opt hub
  in: it changes 20 hub documents, additional-services gets worse until cards-icon has its padding,
  and lufthansa-travel-classes (1440) and miles-and-more (390) measured worse from 2026-10-21
  sources. Next round, once cards-icon has the column view's padding.
- Insights, allegris-premium-economy-san-diego (23.4 %): the video viewer. www's video.js player
  takes the video's own size (16:9 here), while our poster has its own (1920x823): 141 px short at
  1440. A 16:9 rule for lufthansa.com's viewer brought it to 15.8 % / 14.7 %, but took
  all-it-takes-is-a-yes from 24.0 to 35.3 %: its player follows the video's size once the metadata
  loads, and the snapshot records only the default 1920x1080. So the rule was taken out (not
  committed). The importer would need each video's real size, which isn't in the archives.
- tags/munich (+7 to +24 px per list row, jumps of +86 / +88), all-it-takes-is-a-yes and
  picture-perfect-austin: drift found, causes not settled this round. digital-self-services,
  meetings-and-events, airport-information and overview-special-request: their drafts from the
  2026-10-21 snapshots are the published documents (no AEM section boundaries this rule changes).

### For others (not changed)

- ema-test (cards-icon): an icon-link view of its own in an AEM section (www's .threecolumn /
  .fourcolumn column view) has the column view's 3.2rem above and below. additional-services at
  1440: 120 px where www's view is 184. It's hidden today by the section gap; it matters once a
  template keeps www's sections.
- Info's owner (ema-cashub / ema-lufthansa): the 4 carbon-offsetting/saf documents (de/en, de/de,
  at/de, gb/en) get their missing quote with the next info import (columns-media parser,
  4bed4bf); the info bundle needs rebuilding first.
- Observation: tools/importer/import-hub.js lacks the generator's onLoad hook (the cleanup's
  marking of empty first paragraphs never runs for hub imports). It's mine; I'll rebuild it with a
  measured re-import next round.

| Item | Commit | What |
| --- | --- | --- |
| 1 | 4bed4bf | columns-media: an author quote in a column or sidebar kept |
| 1 | 1136e14 | campaign-sections transformer, generator option, styles.css campaign-section |

## Brief 488 (2026-11-08): beside-end on phones, the campaign regressions, video sizes, Insights spacing

Left from 486: the generated import reports and the scratch in logs/b460 to logs/b484 (not
committed); the two reverted trials (16:9 video rule, hub opt-in) never committed; nothing unpushed.

Method this round: each importer draft as `<main>` on lufthansa.turnsthe.page with the working copy's
`/blocks`, `/scripts` and `/styles` routed in (logs/b484/capture-d.cjs `--main` `--local`), captured
against lh-parity-002 (compare.js, 8,000 px, vh 900) and the drift read with offsets.mjs. The
script-free local render of www's CSS stayed a diagnosis tool only: it has no shadow DOM (www's
separators are maui-divider boxes, its links maui components) and no carousels.

### 1. table-striped beside-end below 768 px (row 47; da17419)

- The option reordered the partner with `order`, which only applied in the grid from 768 px, so on
  phones the three right-hand partners sat on their tables. Now a flex column: the table 96 px under
  the text, the picture 74 px under the table, as www's Focke-Wulf at 390 (lh-parity-002c). With the
  CSS injected: 96 / 74 px on all three; the 12 beside tables unchanged. No document change.

### 2. The campaign pages 486 made worse, and the open items (row 48; 11014a6, e650caa)

- crane: www's empty separators (maui-divider's 1 px box, then the .hr's margin) also open sections
  and sit between components; the cleanup drops them under 50 px. Every empty separator of a campaign
  section is a spacer now, drawn as live's (1 px, its margin collapsing with what follows).
- new-onboard-experience: the unpadded intro section had our 48 px section gap; it's a
  campaign-section now.
- chronicle at 390: the jump links' column view stacks its empty second column under the links on
  www (89 px to the next section, ours 43).
- Nested pictures (campaigns): a [empty | picture] view and a picture-only sidebar inside a column
  are drawn at half / three quarters of the column from 768 px (parser markers, block classes).
- Published → draft against lh-parity-002 (whole page % / drift steps px):

| Page | 1440 | 390 |
| --- | --- | --- |
| 100-years/campaigns | 24.2 / 553 → 15.6 / 170 | 33.1 / 287 → 27.6 / 221 |
| 100-years | 16.8 / 243 → 13.8 / 88 | 21.1 / 173 → 20.2 / 24 |
| cabin-design | 19.9 / 265 → 13.8 / 59 | 24.9 / 577 → 24.3 / 423 |
| chronicle | 21.3 / 416 → 15.0 / 61 | 14.8 / 183 → 8.9 / 187 |
| crane | 9.0 / 224 → 9.9 / 115 | 15.0 / 208 → 15.4 / 138 |
| destinations | 30.1 / 353 → 18.3 / 183 | 12.5 / 138 → 14.5 / 68 |
| fleet | 25.6 / 621 → 25.4 / 595 | 14.0 / 1423 → 9.1 / 1068 |
| global-network | 18.0 / 472 → 14.6 / 212 | 20.0 / 522 → 17.5 / 254 |
| history | 15.8 / 187 → 1.9 / 0 | 24.9 / 150 → 8.2 / 21 |
| history/menu-on-board | 15.3 / 90 → 9.7 / 74 | 19.1 / 831 → 19.8 / 109 |
| new-onboard-experience | 27.6 / 572 → 20.7 / 168 | 30.0 / 401 → 23.2 / 103 |

- Still above the published page's whole-page %: crane (+0.9 / +0.4), destinations at 390 (+2.0)
  and menu-on-board at 390 (+0.7), each with lower drift than before (the published page's errors
  cancelled out). The tests for the separators and the first section were written after the
  measurements (test/campaign-sections-488), not before.

### 3. The video player at the video's own size (row 49; e650caa)

- Proposal, built: tools/importer/video-sizes.mjs reads each video viewer's video width and height
  from the file's MP4 header (tools/importer/mp4-size.mjs: moov > trak > tkhd, rotation respected;
  range requests on the site's own copy on lh-edge, or a local copy such as lh-snapshots-085's
  dam/, sha256 checked) into tools/importer/parsers/video-sizes.js. The viewer parsers add
  `size-WxH` to the video's settings marker; scripts/media.js gives the player that aspect before the
  video loads; styles/media.css draws it black with the poster contained, as www's video.js.
- 48 of the 60 viewer videos read (45 × 1920x1080, one 1920x1150, two 3840x2160); 12 aren't on
  lh-edge (the us-com hero videos and the Euro Cup player videos), so they keep the poster's size.
- allegris-premium-economy-san-diego 23.4 → 15.8 % (1440), 17.6 → 14.7 % (390); all-it-takes-is-a-yes
  unchanged by it. Its video and its poster are both 16:9. Correction to my 486 report: the 35 %
  capture I blamed on the 16:9 rule was 284 px short, a page that hadn't finished loading. The rule
  couldn't change that video.
- Before importing the 24 video documents (part B of the list): the token `size-\d{2,5}x\d{2,5}` has
  to be in scripts/style-markers.js (ema-test's file), or lh-edge's app JSON and the loc marker check
  keep the marker as text. media.js accepts it already.

### 4. tags/munich, all-it-takes-is-a-yes, picture-perfect-austin (row 50; 0d199b5)

- all-it-takes-is-a-yes and tags/munich have no AEM sections on www (components straight in
  .container-content, like the highlights and tags pages). Their spacing comes from the components
  (a headline no margin above, an image 4rem below, column views 2rem / 4rem). The Insights template's
  own transformer gives such pages Theme insights-flow, which styles.css spaces so.
- all-it-takes-is-a-yes 24.0 → 15.2 % (1440), 17.8 → 18.3 % (390); tags/munich 24.9 → 24.0 % /
  23.7 → 22.4 %; tags/allegris 34.3 → 29.8 % / 30.4 → 27.0 %; highlights 10.9 → 11.5 % / 9.5 → 8.0 %;
  explore-flying unchanged; explore-the-world 15.4 → 17.9 % at 1440 (a column title 16 px higher:
  not on the list). tags/munich still has +24 px at the audio guide's column title, +46 at the
  "A Perfect Day" stage card and +34 / +48 in the story list: not settled.
- picture-perfect-austin: not settled. An article, its drift alternates +83 / -83 px over the
  repeating gallery rows (offsets' matching), no layout step found.

### Documents

- [../parity-2026-11-08/reimport-488-lh-com.txt](../parity-2026-11-08/reimport-488-lh-com.txt), 64 in
  release order (de/en first in each part). Part A: 40 now (32 campaign, tags/munich and highlights
  × 4). Part B: 24 after the marker token (12 campaign with video viewers, allegris-premium-economy-
  san-diego, all-it-takes-is-a-yes and tags/allegris × 4). 44 of the campaign ones were on
  reimport-484 too: one import after this push replaces that.
- Not mine, for their owners' next import: info's baggage-irregularities (4) and handgepaeck (2)
  get a taller video player (16:9, posters wider), the other info video pages only the marker; the
  info bundle needs rebuilding (columns-media / media-nodes parsers). The two loungenet First Class
  lounge pages (info) get the half-width picture of their nested view.

| Item | Commit | What |
| --- | --- | --- |
| 1 | da17419 | table-striped beside-end below 768 px |
| 2 | 11014a6 | campaign separators, the intro section, the jump links' stacked column |
| 2, 3 | e650caa | narrow pictures in columns; video player at the video's size |
| 4 | 0d199b5 | Insights pages without AEM sections: Theme insights-flow |

## Brief 493 (2026-11-08): SWISS upgrade links, the shared market index, bundles, the Bright Data snapshots

Left from 492: the generated import reports and the scratch in logs/b484 and logs/b488 (with
lh-snapshots-085 in logs/b488/dl and /tmp/b488dam); one reverted Insights column-title rule never
committed; nothing unpushed.

### 1. SWISS per-root upgrade links (d7210ee)

- swiss is in lh-edge's UPGRADE_ARTIFACT_SITES now (Brussels' 29d9ca5 mechanism): a market root
  served ch's language version links its own .../fix-price-upgrade/<cc>-<ll>. On
  swiss.turnsthe.page after the deploy: cz/it → cz-it, de/de → de-de, gb/en → gb-en, hk/zh → hk-zh
  (before: ch-it, ch-de, ch-en). No root is listed as lacking its artifact; I read no www page this
  round, so a root whose artifact www doesn't have would now link a missing one. A sample checked
  on www (one root per language) would settle it.
- Smoke before and after: the same counts on every host; brussels and swiss 0 of 97 differ from
  their recordings; swiss-smoke and TAP unchanged.

### 2. The shared index and SWISS's own documents at ITA's and Austrian's language-version paths

- Already in place since 8b8416b (2026-11-03): lh-edge's sites.js lists the roots helix-query.yaml's
  market-pages index leaves out (MARKET_INDEX_EXCLUDED_ROOTS), and for SWISS, where they are market
  roots, swiss.turnsthe.page's /market-pages.json merges in those roots' own search indexes
  (/br/pt/search-index.json etc., which helix-query.yaml defines for every site). Other sites'
  indexes are unchanged.
- The origin's /market-pages.json has 4,600 rows (what you saw); the host's has 4,644. All five new
  documents (br/pt advance-seat-reservation, cn/zh swiss-premium-economy, gr/el, jp/ja and ru/ru
  medical-travel-companions) are in it, in their roots' sitemaps, and answer 200. llms.txt lists none
  of them, as for the roots' other own pages (llms-include only).
- No code change, nothing to republish.

### 3. Hub, insights and fleet bundles (76ca558)

- All three already carried 7f1038f (ema-cashub's ec12449 rebuilt every bundle). Hub and fleet
  lacked e650caa (narrow pictures, the video size marker) and were rebuilt. Every page imported
  offline with main's bundle and with the new one: hub 68 of 68 and fleet 32 of 32 identical, so
  nothing to re-import. Insights was rebuilt in 492.

### 4. Hub on the new section handling

- Not started: ema-test's cards-icon padding isn't on main (blocks/cards-icon last changed 5cf7e6b,
  2026-11-06).

### 5. The Bright Data snapshots

- tools/importer/bd-snapshots/: www.lufthansa.com has 3,397 pages (228 roots, 2026-10-21 to
  2026-11-03, 8.5 GB with bd-session's page folders); www.discover-airlines.com has 562 (9 roots,
  2026-10-27 to 2026-11-01, 125 MB).
- 391 lufthansa.com pages are already in lh-snapshots archives, matched by URL against the 104
  manifests in the R2 drop (read from the start of each archive's stream, nothing else downloaded).
- The 3,568 others are packed into lh-bd-ema-001 to -016: 5,366 MB in all, each under 495 MB,
  manifest first, bd-session layout. They're in logs/b493/bd-archives (outside git), not uploaded.
- Names, sizes, sha256 and the per-root table:
  [../bd-snapshots/lh-bd-ema.md](../bd-snapshots/lh-bd-ema.md). Discover's 562 are all in
  lh-bd-ema-016.

| Item | Commit | What |
| --- | --- | --- |
| 1 | d7210ee | lh-edge: SWISS market roots link their own upgrade artifact |
| 3 | 76ca558 | hub and fleet bundles rebuilt (output unchanged) |

## Brief 497 (2026-11-08): hub on the section handling, breadcrumbs on market roots, lh-b2b's own index

Left from 496: the generated import reports; the scratch in logs/b484, logs/b488 and logs/b493 (with
the 16 lh-bd-ema archives in logs/b493/bd-archives, kept on purpose) and /tmp/b488dam; nothing
unpushed.

### 1. Hub on the section handling (2416546)

- page-templates.json hub "transformers": campaign-sections, hub-column-views, theme-separators.
  - campaign-sections as on campaign pages, ema-lufthansa's file unchanged (its ff48495 is in the
    bundle): each AEM section its own section, separators as spacers. ema-test's cards-icon
    padding (35e34400) was the precondition.
  - hub-column-views (new): www's column views of their own get the cleanup's data-lh-column, and the
    cleanup's placeColumnMarks (every template) writes "{column-start}" / "{column-end}" as on info
    pages, without "Theme: flow-spacing". The rule is lufthansa-cleanup's markColumnViews, mirrored
    (transformers can't import; the cleanup is ema-cashub's and marks info and fleet only).
    /de/en and /de/de miles-and-more: DA's three marks again; xx/es and xx/fr (from
    lh-snapshots-085) the same three.
  - theme-separators (new; any template can opt in): token-free step 1 carries the theme's M, L
    and Divider as the purpose blocks Spacer, Spacer (l) and Divider, so "{spacer-60}",
    "{spacer-120}" and "{divider-25}" are written as those blocks. On hub that is one rule (the
    "{divider-25}" above "This might also interest you", 14 documents). The two renders of
    miles-and-more are identical at 1440 and 390 (0.0 %). The other separators hub writes (25, 40,
    50, "60 from-768") have no carrier and keep their markers. Heading and width markers come from
    the shared cleanup; page-type rules stay off (step 2).
- Measured: each page imported offline from its freshest snapshot (lh-snapshots-085 for
  miles-and-more and overview-manage, lh-snapshots-062 for additional-services and
  food-and-beverages, bd-snapshots for the rest). The draft goes in as `<main>` on
  lufthansa.turnsthe.page with the working copy's code, against lh-parity-002. Figures are main's
  bundle -> this one:

| de/en page | 1440 | 390 |
| --- | --- | --- |
| miles-and-more | 12.7 -> 10.0 % | 21.2 -> 15.3 % |
| food-and-beverages | 17.6 -> 8.7 % | 23.8 -> 10.9 % |
| lufthansa-travel-classes | 26.1 -> 20.1 % | 21.1 -> 11.5 % |
| additional-services | 35.1 -> 31.3 % | 33.2 -> 22.7 % |
| digital-self-services | 29.0 -> 24.6 % | 27.4 -> 25.7 % |
| meetings-and-events | 24.5 -> 10.2 % | 8.9 -> 12.7 % |
| flights | 38.4 -> 38.8 % | 48.0 -> 47.6 % |
| baggage | 11.1 -> 17.5 % | 9.2 -> 12.5 % |

  - baggage, worse: main's draft was 7 px short at the grey "Baggage services" band. That hid +8 px
    at the separator after the link list and +4 px under the H1, which now has a section of its own.
    The band itself is right now (60 px, www 59). Open: the link list's spacer.
  - meetings-and-events at 390: its snapshot is from 2026-10-21 and isn't www's page of 11-06 (a
    yellow button there, a link in ours; +175 px before the change), so 390 says little.
  - flights: www's page runs past 8,000 px, ours stops at 4,060; the change doesn't touch that.
  - lounges and the de/de, at/de and gb/en copies: not in lh-parity-002 (no measurement).
- 40 of 68 hub documents change. With the 6 xx language versions (in reimport-490 but not in
  page-templates.json): 46, [reimport-497-lh-com.txt](../parity-2026-11-08/reimport-497-lh-com.txt).
  The bundle's output is the same as the measured trial's on all 68 pages.
- reimport-490-lh-com.txt's hub documents (14 of its 25): /de/en, /de/de, /at/de, /gb/en, /xx/es and
  /xx/fr miles-and-more; /de/en, /de/de, /gb/en, /at/de, /xx/el, /xx/it, /xx/ja and /xx/zh
  additional-services. They are part 1 of reimport-497. The harness's d18da32 uploaded the
  other 11.

### 2. Breadcrumbs on market roots (2321eca)

- Cause: a page's Parent is often the whole trail ("/de/en/homepage, /de/en/program, …";
  blocks/breadcrumb splits it at ", "). lh-edge's marketHtml rewrote `<meta name="parent">` as a
  single link, so a list never matched a path.
- Every brand had the gap. Root views still linking the language version, sampled before the fix:
  - b2b kw/en: 214 of 241 pages with a list;
  - SWISS gb/en: 121 of 121;
  - Brussels gb/en: 91 of 100;
  - ITA us/en: 182 of 186.
- Fix (brand-neutral): each entry is rewritten as a link is; the separators stay.
- On the hosts after the deploy, the same samples:
  - b2b 0, SWISS 0, ITA 0;
  - Brussels 1: /gb/en/book-a-flight/our-promotions/family-and-friends-faq keeps
    /be/en/book-a-flight/our-promotions, a bf/en-only page gb/en doesn't serve (404), as any link to
    it does;
  - the brief's munich-airport page links /kw/en all the way up.

### 3. lh-b2b gb/en's own document (557c12b)

- Answering the page doesn't need the index: lh-edge serves a root's own document first whenever
  the origin has one, and b2b's root search index already takes in the root's own index (gb/en: 1
  row, at/de: 4).
- The market model's own documents do come from /market-pages.json, and that feeds the root's
  sitemap: gb/en's sitemap listed the page with de/en's date (2026-11-02), and a page only gb/en has
  would be missing from it.
- b2b joins SWISS in MARKET_EXTRA_INDEX_SITES: its /market-pages.json adds the at/de, gb/en and it/en
  search indexes (it/en has none: 404, skipped).
- On b2b.turnsthe.page after the deploy: market-pages.json has the 5 rows; gb/en's sitemap shows
  programs-and-groups with 2026-11-08.

### Checks

- Lint in a clean worktree and the full suite before each push (lh-edge 69 files; site 578 files,
  582 after the rebase onto the others' commits; 0 failing); lh-edge 406 tests.
- Smoke on every host before and after the lh-edge push; SWISS and TAP by hand.
- Hosts: b2b, swiss, brussels and ita.turnsthe.page (items 2 and 3); lufthansa.turnsthe.page (item
  1's drafts, nothing changed there). DA read only (miles-and-more, and the column marks of the 20
  documents that get them).

| Item | Commit | What |
| --- | --- | --- |
| 1 | 2416546 | hub: campaign-sections, hub-column-views, theme-separators; bundle |
| 2 | 2321eca | lh-edge: a Parent list on a market root links the root, every entry |
| 3 | 557c12b | lh-edge: lh-b2b's market roots under excluded paths read their own index |

## Brief 500 (2026-11-08): hub parity rows, five campaign and insights rows, the hub column-view gap

Left from 499: the generated import reports; the scratch in logs/b484, logs/b488, logs/b493 (with the 16 lh-bd-ema
archives in logs/b493/bd-archives, kept on purpose) and logs/b497 (with lh-snapshots-085's pages in logs/b497/s085);
/tmp/b488dam; nothing unpushed.

Method: each page's draft from its freshest saved snapshot (lh-snapshots-085, then -062, then bd-snapshots) with the
importer's output before the collapse, as `<main>` on lufthansa.turnsthe.page with the working copy's code, against
lh-parity-002 (whole-page % and drift steps). Since ema-test's 72026cc the collapse only runs for a live theme, so
these drafts are what an import writes today; the committed hub bundle gives byte-identical output. Where the
harness has re-imported a page from a fresher snapshot than mine (stopover, 2026-10-21 here), the published
document with the working copy's code instead. No request to www; the local renders of www's saved pages only for
diagnosis.

### 1. Hub rows (one commit each; all CSS but additional-services)

| Row | Commit | Cause and fix | 1440 | 390 |
| --- | --- | --- | --- | --- |
| baggage | f20204b | the H1 as a section of its own kept our 48px section gap (H1's own margin now); our wrapper gap after jump links before a separator (none now); a column title's 32px plus the grid's 32px over the cards (8px now, from 768px, also in a grey band of such a page) | 17.5 -> 6.4 % | 12.5 -> 9.5 % |
| flights | c3d943b | the destination finder's title: the finder's padded section above it, its space under it | 38.8 -> 39.1 % (drift at the top -41 / -73 -> 0 / +21px) | 47.6 -> 46.9 % |
| additional-services | 9c5d045 | campaign-sections' separator components made the tiles' column view look shared: the cards-icon parser's padded option lost (importer); then the separators' wrapper gap after padded tiles (none now) | 31.3 -> 7.0 % | 22.7 -> 15.1 % |
| lufthansa-travel-classes | cb308d5 | www's padded first section under the class tabs (campaign-sections takes only an unpadded one): the tabs' section 45 / 65px, the title section 20 / 40px before the next; under the Hero Banner 43 / 50px | 20.1 -> 7.6 % | 11.5 -> 12.9 % (the banner's own step -19 -> 0; later steps it offset, +18 / +17, remain) |
| digital-self-services | c870ad7 | partner rows nested in titled groups: 20 / 40px under the title, 56 between rows, 60 / 39 under the last | 24.6 -> 8.2 % | 25.7 -> 9.1 % |

- Every rule is scoped to the structure it was measured on. The selectors' matches over the 37 campaign and hub pages
  lh-parity-002 has: baggage's three rules match baggage, miles-and-more (the title rule) and
  new-onboard-experience (title and jump links: 20.7 -> 8.9 % / 23.2 -> 11.7 %); the travel-classes rules only that
  page; the partner rules only the seven versions of digital-self-services; the finder rule the 18 flights documents.
- flights stays high: its offers are live data (our finder shows "No results" for this machine) and the finder's own
  phone layout (the block's, not mine) differs. digital-self-services: www's dividers span the two-thirds column,
  ours the full width (open).
- Found on the way, ema-test's area: had the collapse run (ac3ff61 before 72026cc), www's 40px separators would come
  out as M (60px): baggage 17.5 -> 22.7 % / 12.5 -> 17.7 %, the page 80-240px longer. A theme with M = 40 on hub and
  campaign pages, or 40px as its own size, would keep them.

Documents: additional-services' 8 (part 1 of reimport-497-lh-com.txt) need 9c5d045's parser; part 2 gets one more,
/de/en/overview-manage (stale on DA: its draft from lh-snapshots-085 19.6 % at 390, the published document 37.4 %).
The harness's list now has 47 documents in release order.

### 2. Five campaign and insights rows (worst first, with current documents and code)

| Row | Commit | Cause and fix | Before -> after |
| --- | --- | --- | --- |
| 100-years/campaigns 390 | 94b968c | a narrow picture's nested view padding on phones (67 / 42px above it); a lone quote 93px under what's above it | 27.6 -> 19.8 % (18.0 with 93db9c9) |
| 100-years/fleet 1440 | c9b015a | www's maui-table rows 36px taller (the cell's paragraph margin inside): spec tables' cells 68px under their text from 768px | 25.4 -> 13.9 % (390 9.1, unchanged) |
| 100-years/cabin-design 390 | 93db9c9 | a [picture | empty] row: www stacks the empty column with its margins (52px under it on phones) | 24.1 -> 16.2 % |
| discover-lufthansa/take-off 390 | 1615085, 18a7d3b | spacious rows 79px apart on www, ours 55: 66px above a row's first card on phones (brief 424's test follows) | 33.9 -> 24.5 % |
| articles/tags/allegris | 3b22ecc | tag chips as www's maui tags (40px tall, 16 / 24px text) | 29.8 -> 23.2 % / 27.0 -> 19.8 % |

- Side effects measured: take-off's rule: overview-travel-information 12.6 -> 11.9, services-at-the-airport 12.7 ->
  10.1, frankfurt-fair 10.0 -> 9.0, four pages unchanged, overview-manage's stale document 37.4 -> 40.4 (its fresh
  draft 19.6 before and after). The chips: highlights 11.5 -> 9.2 (1440), explore-the-world 20.6 -> 17.4 (390),
  explore-flying 20.9 -> 19.4 / 25.4 -> 20.5, tags unchanged, tags/munich 22.4 -> 24.2 at 390, where ours already
  runs long before its list (its sections' text wrapping).
- stopover (58.4 % as a draft) was a stale snapshot: the harness's re-import of 490 brought the stage text; the
  published page is 27.1 / 15.2 %. Not taken. Neither picture-perfect-austin (its draft capture failed twice here;
  brief 488 found no layout step) nor the pages whose fixes wait for re-imports (all-it-takes-is-a-yes, allegris-
  premium-economy-san-diego, new-onboard-experience: their drafts are 9-16 points better than DA's documents).
- CSS only: no document changes for item 2.

### 3. The hub column-view gap (ema-test, brief 503)

- ema-test's rule came with 6e427298 (pulled before my push): on a page with column views that isn't a flow page,
  the collapse writes Theme flow-spacing, and a live theme gives an H2 / H3 after other content 32px above
  (--theme-heading-gap). I measured my hub output with it: the drafts collapsed by main's collapse (forced as for a
  live lufthansa.com) and rendered with body.theme-live added. Today's marks against that:

| Page | 1440 marks -> collapsed + rule | 390 marks -> collapsed + rule |
| --- | --- | --- |
| miles-and-more | 9.0 -> 27.1 % | 13.9 -> 21.5 % |
| meetings-and-events | 10.2 -> 25.2 % | 12.7 -> 10.1 % |
| digital-self-services | 8.2 -> 12.3 % | 9.1 -> 8.6 % |

- So together they don't give www's spacing yet, at 1440 above all. On miles-and-more:
  - the views' H2s lose their limited width (they wrap as www's only with "{limited-width}");
  - between two views www has 64px (each view's 32), the rule gives 32;
  - the last view loses its 32px under it.
- What it needs to give, measured: www pads a column view of its own in an AEM section 32px (3.2rem) above and below
  at every width; two such views 64px apart; under running text before the first view the text's margin and 32. Our
  hub output carries this today as "{column-start}" / "{column-end}" (hub-column-views, the cleanup's
  placeColumnMarks).
- Without the rule (the collapse before 6e427298) those marks go ("theme", 6 / 8 / 10 on miles-and-more,
  digital-self-services, meetings-and-events) and nothing marks the views: the column views' H2s are plain H2s
  next to intro H2s in the same section (miles-and-more: "The frequent flyer and awards programme" is no view, the
  next three are). With today's CSS the collapsed drafts measure miles-and-more 9.0 -> 25.8 % / 13.9 -> 22.5 %,
  meetings-and-events 10.2 -> 25.1 % at 1440, digital-self-services 8.2 -> 12.8 % / 9.1 -> 10.3 %.
- So a rule on H2s alone can't give www's spacing. Proposal: the collapse turns a column view of its own into a
  carrier the theme reads (a section style for the view, e.g. "Column view", or a section of its own per view); the
  hub transformer already knows each view (data-lh-column) and can write its break and style for it. I can add that
  to hub-column-views as soon as the carrier's name is settled.
- Until then nothing changes on screen: lufthansa.com's theme isn't live, so hub imports keep their marks (72026cc).
  lufthansa.com's switch should wait for this carrier (or for a hub rule that gives 64 / 32px and the H2's width).

### Checks

- Lint in a clean worktree and the full suite before the push (lh-edge 69 files, site 601, 0 failing); smoke on
  every host before (16:57) and after the push; SWISS and TAP by hand.
- On lufthansa.turnsthe.page after the push, published documents with the deployed code against lh-parity-002:
  take-off 24.5 % (390), fleet 13.9 % (1440), 100-years/campaigns 18.0 % (390), cabin-design 16.2 % (390),
  tags/allegris 28.0 % (1440, its published document; 34.3 before). The hub rows wait for their re-imports (drafts
  as above).

| Item | Commit | What |
| --- | --- | --- |
| 1 | f20204b | baggage: title section, jump links, column titles before cards |
| 1 | c3d943b | flights: the destination finder's title |
| 1 | 9c5d045 | additional-services: cards-icon padded with separator components (parser, bundles), the separators' gap |
| 1 | cb308d5 | travel classes: the tabs, the title section, the Hero Banner |
| 1 | c870ad7 | digital services: partner rows |
| 2 | 94b968c | 100-years/campaigns: narrow pictures and lone quotes on phones |
| 2 | c9b015a | fleet: spec rows' height from 768px |
| 2 | 93db9c9 | cabin-design: [picture, empty] rows on phones |
| 2 | 1615085, 18a7d3b | take-off: spacious rows on phones (and brief 424's test) |
| 2 | 3b22ecc | tags/allegris: tag chips |

## Brief 505 (2026-11-08): the remaining rows, the published re-check, the xx additional-services documents

Left from 504: the generated import reports; the scratch in logs/b500 (with the no-collapse bundles), logs/b484,
logs/b488, logs/b493 (with the 16 lh-bd-ema archives), logs/b497 (with s085); /tmp/b488dam; nothing unpushed.

Method: published documents on lufthansa.turnsthe.page against lh-parity-002a-d / -003 (whole-page % and drift
steps; logs/b500/cap-pub.sh), importer drafts as `<main>` where DA's document waits for a re-import, and, since the
harness's 049e070 (reimport-497, previewed, not published), the previewed documents from
main--lh-com--moved-permanently.aem.page as `<main>` on lufthansa.turnsthe.page (logs/b505/cap-prev.sh; only the
`.plain.html` and page head over curl, no preview page in a browser since those load www's fonts). No request to www;
nothing published.

### 1. The remaining rows (one commit each, CSS)

| Row | Commit | Cause and fix | Before -> after |
| --- | --- | --- | --- |
| digital-self-services, the dividers | bd5d03c | www's .hr.limited-width between the partner groups: 66 % from 1025px | 8.2 -> 8.1 % (1440; 1px lines), 390 unchanged |
| tags/munich, 390 | 4d620d5 | insights-flow: before a grey band only the text's 2.4rem (not before an in-column grey box) | 24.2 -> 17.9 % (390), 24.0 -> 15.0 % (1440) |
| take-off, 390 | edd5d2e | below 768px the intro picture after the title keeps www's 4rem (pages of spacious cards) | 24.5 -> 19.3 % (390), 1440 unchanged 19.6 % |
| lufthansa-travel-classes, 390 | 26dca44 | a grey band before a padded campaign-section keeps 32px | 12.9 -> 7.1 % (390), 7.6 -> 4.2 % (1440), drafts |
| tags/allegris, 1440 | - | analysed, no fix: www's "Conditions" button under the stage teaser opens an empty modal (`<p><br></p>`; the import leaves it out, +45px on www), the pagination's look, a link 12px closer to its picture | 28.0 % (published), draft 23.2 % |

- tags/munich's rule also helps highlights (9.2 -> 2.5 % / 8.1 -> 7.4 %) and all-it-takes-is-a-yes (15.2 -> 11.5 % /
  18.3 -> 15.3 %); tags, explore-flying, explore-the-world and tags/allegris unchanged.
- tags/munich's title is still 40px short at 390: www writes "Munich&nbsp;–&nbsp;a" and the import writes plain spaces.
  That is helix-importer's HTML-to-Markdown step: the same with an empty import script, so for every template and
  site (not one of our transformers).
- travel classes' rule matches four 100 Years pages too (fleet, global-network, cabin-design, menu-on-board): unchanged
  at both widths on their published documents.

### 2. The published re-check (tools/reports/parity-2026-11-08/sweep-lh-recheck.md)

- 296 pages (all published), 592 page-widths, the deployed code before this brief's commits. Per template median: info
  9.1 %, legal 7.6, insights 13.4, campaign 15.2, hub 11.9, form 11.1, fleet 17.7, app-entry 11.3.
- Fixed from it:
  - overview-special-request (eea5da7: h2 card titles next to h3 cards 22px, www's heading-medium): 24.1 -> 18.4 % at
    390, 8.7 -> 2.9 % at 1440; services-at-the-airport 4.0 -> 1.9 % at 1440, 10.1 -> 11.6 % at 390 (its small titles
    had offset a +22px step);
  - stopover (87e11df: the step cards with the column view's 3.2rem from 768px): 27.1 -> 13.3 % at 1440;
  - Carousel Cards that end a campaign-section (099171e: www's column view's 3.2rem under them from 768px, whatever is
    before them; found on the harness's previewed miles-and-more, which ends 94px short: 48px of it my draft method
    had hidden with an empty last section): miles-and-more 11.6 -> 9.9 % at 1440, food-and-beverages 8.7 -> 9.0 % (its
    step at the section end -32 -> -8px; an earlier +51 / +19px surplus is no longer compensated), stopover unchanged.
  - With item 1's: munich, take-off, travel classes, digital-self-services. Seven rows, not ten.
- The hub documents of reimport-497 are re-imported and previewed by the harness (049e070), not published. Measured on
  their previews: digital-self-services 8.1 / 9.1 %, additional-services 6.1 / 14.5, baggage 5.4 / 8.9,
  meetings-and-events 10.2 / 12.7, food-and-beverages 9.0 / 11.5, miles-and-more 9.9 / 16.0 (1440 / 390, deployed
  code). Their published rows in the sweep fall as soon as they're published.
- The rest of the worst in my areas, with their causes (the report has every one):
  - documents to re-import: overview-manage (stale; the harness held it), new-onboard-experience, all-it-takes-is-a-yes
    and allegris-premium-economy-san-diego (their drafts 9-16 points better than DA's documents);
  - capture artefacts: picture-perfect-austin (parallax pictures), 100-years at 390 (the stage video's frame, www's
    font fallback), flights (live offers);
  - other owners' blocks: the culinary micro-frontend (both culinaryjourney pages), most-significant-route's
    accordion-columns, the Berlin and Barcelona articles' poi-map;
  - an importer gap: a cell heading with www's .limited-width keeps no width marker in a block (100-years/destinations'
    "Rio de Janeiro: Party like World Cup winners"; 1 of 7 heading-large in two-column cells has it);
  - open: miles-and-more at 390, the phone slider's dots ~52px lower on www and ~52px more under them.
- The carousel ending is no rule for every template: info pages run a grey band into the footer on www (gap 0) or end
  as ours do; fleet and flying-with-small-children already have more than www's 72px. The rule is campaign-section
  only.

### 3. The four xx additional-services documents

- DA's xx/el, xx/it, xx/ja and xx/zh additional-services have de/en's structure: the same 11 sections, the same blocks
  with the same row and cell counts, the same separator markers (only the metadata block in a section of its own).
- Their www pages are in lh-snapshots-039 (xx/el), -032 (xx/it), -046 (xx/ja) and -019 (xx/zh), captured 2026-11-03.
  xx/el's page from lh-snapshots-039 (streamed from the R2 drop, nothing from www) through main's hub bundle: de/en's
  structure, all five tile blocks `padded`, the campaign sections as de/en's.
- So the harness can import all four from those archives with main's hub bundle (template hub; page-templates.json
  doesn't list them, so run them with the hub bundle by name). Nothing else is needed. 049e070's state has the four
  uploaded and previewed (18:24-18:25 UTC); their previews match de/en's skeleton block for block (sections, blocks
  with options and rows, markers), translated.

### Checks

- Lint in a clean worktree and the full suite before each push (lh-edge 69 files, site 612 / 616, 0 failing; the first
  run caught test/lufthansa-parity-cards-teaser.test.mjs pinning the old h2 title selector, updated inside eea5da7);
  smoke on every host before (19:22, 20:21) and after each push: the same as before on every host; Brussels and
  SWISS 0 of 97 differ; swiss-smoke 8 x 200, 2 x 302, 2 x 404 as before; TAP 200.
- On lufthansa.turnsthe.page after the pushes, deployed code: munich 15.0 / 17.9 %, take-off 19.3 (390) / 19.6
  (1440), overview-special-request 2.9 / 18.4, stopover 13.3 / 15.2, services-at-the-airport 1.9 / 11.6, highlights
  2.5 / 7.4, tags/allegris 28.0 (1440); the previewed hub documents as above.

| Item | Commit | What |
| --- | --- | --- |
| 1 | bd5d03c | digital services: group dividers two thirds wide |
| 1 | 4d620d5 | insights-flow: only the text's 2.4rem before a grey band (tags/munich) |
| 1 | edd5d2e | take-off: the intro picture's 4rem on phones |
| 1 | 26dca44 | travel classes: a grey band before a padded campaign-section |
| 2 | eea5da7 | cards-teaser: h2 titles next to h3 titles (overview-special-request) |
| 2 | 87e11df | stopover: the step cards' column-view padding |
| 2 | 099171e | Carousel Cards ending a campaign-section: 32px under them (miles-and-more, food-and-beverages) |

Documents: none new from this brief (all CSS). reimport-497-lh-com.txt stays at 47 (the harness's 049e070 did 23 of
them; publish list work/local-import/publish-497-lh-com.txt is the harness's). The four xx additional-services
documents come from lh-snapshots-039 / -032 / -046 / -019 with the hub bundle.

## Brief 506 (2026-11-08): the column view carrier, 40 px separators, the slider dots, the market index, the held hub documents

Left from 505: the generated import reports; the scratch in logs/b505, logs/b500, logs/b484, logs/b488, logs/b493 (with
the 16 lh-bd-ema archives), logs/b497 (with s085); /tmp/b488dam and the commit-message files; nothing unpushed.

Method: drafts from the captures (lh-snapshots-085 / -062, bd-snapshots) through the hub bundle; the collapse run
read-only (`collapseHtml(..., { force: true })`, logs/b506/collapse.mjs), the collapsed draft rendered on
lufthansa.turnsthe.page with `body.theme-live` and the theme's heading gap; against lh-parity-002 at 1440 and 390. No
request to www; nothing published; no file of ema-test's, ema-lufthansa's or ema-cashub's changed.

### 1. The column view carrier (7438076)

- hub-column-views (afterTransform, after the cleanup wrote the marks and the sections exist) makes each column view a
  section of its own: its AEM section's styles plus `column-view`; a view directly in the container also `padded`;
  `flush` where more of its AEM section follows; separators right before a view open its section; www's column wrapper
  is the view's extent. The marks stay (today's documents render exactly as before: same heights on all four pages
  with marks); the collapse removes them.
- styles.css (lufthansa.com): a `column-view` section 32 px above and below (64 between two, 32 under the last), its
  last element without margin, its headings two thirds wide from 1025 px; `column-view padded` the section padding;
  24 px before a view; not on grey bands, and the paddings not while a mark is in the section.
- Collapsed, 1440 / 390 (marks today; no carrier): miles-and-more 14.6 / 11.9 % (7.2 / 13.9; 25.4 / 21.5),
  meetings-and-events 9.6 / 13.8 (10.2 / 12.7; 25.2 / 10.1), digital-self-services 10.6 / 8.1 (8.2 / 9.1; 12.2 / 8.6),
  flights 38.7 / 45.6 (39.1 / 46.9; 39.2 / 45.8). miles-and-more's 8.4 points at 1440 are its first H2 outside the
  views (the collapse drops limited-width: 6.2 % with it two thirds wide).
- ema-test: the DA library's label "Column view" needs `SECTION_STYLE_LABELS` (and `SECTION_STYLES`) in
  scripts/style-markers.js; the exact change and its expected output in
  tools/reports/parity-2026-11-08/column-view-handover.md, with two notes for the switch (an outer view a separator
  opens isn't padded by the collapse; limited-width outside views). Nothing else of ema-test's has to change.
- ema-test's decision 1 (tools/reports/token-free/decisions.md, pushed during this brief) says text in column views
  loses its padding, with no carrier per group; it was written for the brand sites. lufthansa.com's carrier is this
  brief's item 1 and touches only lufthansa.com (its hub transformer, its CSS); the handover names the tension: Ben's to
  settle whether decision 1 names lufthansa.com's hub pages or the carrier goes.
- Documents: tools/reports/parity-2026-11-08/reimport-506-column-view-lh-com.txt (12, release order: miles-and-more on 6
  roots, meetings-and-events on 4, digital-self-services on 2); flights (2) once imported (item 5).

### 2. 40 px separators (tools/reports/parity-2026-11-08/separators-40-506.md)

- No lufthansa.com page-type or section-edge rule: the M band's sizes are mixed in every page type and at every place
  the collapse puts a carrier (info 40, campaign and hub 60; section ends 60, starts 40 / 50). An M of 40 brings baggage
  back to today (6.4 / 9.6 %) and costs additional-services 24 points at 1440 and first-class / onboard-delights 4-5.
- So M stays 60 (Ben's rule) and costs, against an M of 40, at 1440 / 390: baggage 8.0 / 2.8 points, food-and-beverages
  7.1 / 3.1, new-onboard-experience 26.5 / 2.2, economy-class 1.0 / 0.7; the others gain from 60. Pages with 40 px
  separators: 30 published de/en documents (listed in the report) and 7 hub previews.
- The collapse draws `{spacer-N from-768}` at every width, as ema-test's decision 3 keeps it: on lufthansa.com that
  costs additional-services 32.6 points at 390 (15.1 -> 47.7 %, ten of them).

### 3. miles-and-more at 390 (c174800)

- www's slides there are experience fragments: each slide 30 px taller than its teaser (www's own render), so the dots
  sit 56 px under the cards (ours 21). Plain teaser slides (flying-with-small-children, doctor-on-board-news) have them
  20 px under, as ours. Only miles-and-more has fragment slides (1 of 312 de/en pages).
- The carousel-cards parser writes option `fragment-slides` (brand-neutral: what www's markup is); lufthansa.com's CSS
  puts the dots 30 px lower below 768 px. 390: 13.9 -> 12.6 % (collapsed 11.9 -> 10.7), dots 52 px under the cards;
  1440 unchanged. Documents: miles-and-more's 6 (in reimport-506's list).

### 4. Market-pages index

- swiss.turnsthe.page/market-pages.json (4,644 rows, read in 10 pages of 500): br/pt advance-seat-reservation, cn/zh
  swiss-premium-economy, gr/el, jp/ja and ru/ru medical-travel-companions all listed; b2b.turnsthe.page (125 rows):
  gb/en programs-and-groups listed. The raw shared index (main--lh-swiss / main--lh-b2b--moved-permanently.aem.live,
  4,600 / 120 rows) leaves those roots out by design; their search indexes hold them and lh-edge merges them
  (MARKET_EXTRA_INDEXES, brief 497). Nothing to finish, nothing a publish has to fill.

### 5. The held hub documents (tools/reports/parity-2026-11-08/held-hub-documents-506.md; c23899d)

- None of the five is in the lh-snapshots archives the harness holds; all are in the Bright Data captures lh-bd-ema-004
  (de/de) and -005 (de/en), rendered, and import complete from there with main's hub bundle.
- speisen-und-getraenke and both travel-classes pages: the server HTML carries the Hero Banner's panes as data-dcep
  JSON; the new hub transformer hub-dcep-render builds www's rendered panes from it (byte-identical imports against the
  captures). The harness can import these three from its server HTML with main's hub bundle.
- flights and fluege: the finder's configuration is in the server HTML, its texts aren't (they vary per page), the
  feedback question comes from an API: only the capture helps (lh-bd-ema-005 / -004, once their upload links are there).

### Checks

- Lint in a clean worktree and the full suite before the push (lh-edge 69 files, site 622 / 628 after the rebases onto
  ema-test's theme commits, 0 failing); the hub bundle rebuilt from the merged sources at each rebase (equal to a fresh
  build at the pushed head); smoke on every host before (22:49) and after (23:36): the same as before everywhere,
  Brussels and SWISS 0 of 97 differ, swiss-smoke 8 x 200, 2 x 302, 2 x 404 as before, TAP 200.
- ema-test's new collapse (51a1eb8, 56b60fa, f418f61) gives byte-identical output on the lufthansa.com drafts measured
  here, so the collapsed figures stand.
- On lufthansa.turnsthe.page with the deployed code before and after the push, the published documents (the harness's
  hub documents live since 21:20): miles-and-more 9.9 / 16.0 %, meetings-and-events 10.2 / 12.7, digital-self-services
  8.1 / 9.1, baggage 5.4 / 8.9, food-and-beverages 9.0 / 11.5, additional-services 6.1 / 14.5, flying-with-small-children
  10.6 / 12.9, onboard-delights 11.3 / 14.3, stopover 13.3 / 15.2: identical before and after (no document carries the
  new styles yet; the marks win where they are).
- swiss.turnsthe.page and b2b.turnsthe.page market-pages.json (item 4); main--lh-swiss / main--lh-b2b--moved-permanently
  .aem.live's raw index for comparison; main--lh-com--moved-permanently.aem.page .plain.html (curl) for the column marks
  of the 68 hub documents.

| Item | Commit | What |
| --- | --- | --- |
| 1 | 7438076 | the column view carrier: section style column-view (hub-column-views, styles.css, hub bundle) |
| 5 | c23899d | hub-dcep-render: Hero Banner panes from data-dcep (page-templates.json, import-hub.js, hub bundle) |
| 3 | c174800 | carousel-cards option fragment-slides, the dots on phones |
| docs | (this commit) | this section, parity rows 59-62, the handover, the separator and held-document reports, reimport-506 |

Documents: reimport-506-column-view-lh-com.txt (12, release order). The three Hero Banner documents of item 5
(/de/de/speisen-und-getraenke, /de/en/lufthansa-travel-classes, /de/de/lufthansa-reiseklassen) can now be imported from
the harness's server HTML; flights and fluege wait for lh-bd-ema-004 / -005.

## Brief 507 (2026-11-09): the baseline after the hub and video documents, lufthansa.com's pass check

Left from 506: the generated import reports; the scratch in logs/b506, logs/b505, logs/b500, logs/b484, logs/b488,
logs/b493 (with the 16 lh-bd-ema archives, kept for the rollback windows); /tmp/b488dam and the commit-message files;
nothing unpushed.

Method: no request to www; nothing published or uploaded; no file of ema-test's, ema-lufthansa's or ema-cashub's
changed. Lint (clean worktree) and both suites before the push (lh-edge 69 files, site 646, 0 failing); smoke before
and after on the ten hosts with baselines (same answers), Brussels and SWISS against brief 506's runs (0 of 97
differ), swiss-smoke and TAP by hand (as before).

### 1. The baseline (tools/reports/parity-2026-11-09/sweep-lh-baseline.md)

- The 296 lufthansa.com pages of lh-parity-002a-d / -003 on lufthansa.turnsthe.page, 1440 and 390, with the deployed
  code, against the recordings; 52 hub and 18 video documents without a recording listed, not measured.
- Hub median 11.9 -> 8.9 % with the published hub documents; 29 page-widths moved 2 points or more.
- Three fixes, not ten: 0369cb9 (Insights articles at 390, no section gap under the related articles that end the
  page), fc1f4f7 (cards-teaser: a bold CTA is a primary button where the theme's token asks: meetings-and-events),
  142a2d2 (the campaign template runs hub-column-views on pages without campaign sections: frankfurt-fair,
  most-significant-route; munich-fair worse with it, excluded). The other worst rows of my templates have causes in
  the data or other owners' blocks (named per row in the report).
- Documents: tools/reports/parity-2026-11-08/reimport-507-campaign-lh-com.txt (8, release order), for the harness.

### 2. The pass check (tools/reports/token-free/lh-com-pass-check.md, lh-com-handover-ema-test.md)

- 37 published documents, 10 page types, the collapse read-only (`--force`), the theme forced live in the browser
  only; run again on main's collapse after ema-test's d1bd76e (the carrier) and 6d1bb8a (the chapter order), both
  pushed during the brief and both items of my handover: mean height difference campaign 5.5 %, legal 2.7, insights
  2.0, hub 1.5, info 0.9, the rest under 1.
- No rule needed in lufthansa.com's rule files. Handover left: items 2 (no `sections-m` on /100-years: campaign 5.5 ->
  1.8 %), 4 (captions in block cells), 5 (the ruled chapters' divider before Related Articles).
- For Ben: the carrier on info and fleet pages too (main does it; Ben named hub pages) or hub only (info 0.9 -> 3.0 %);
  limited-width headings.
- Parity rows 63-66 (tools/reports/lufthansa/parity.md).

## Brief 515 (2026-11-09): brand fonts on two hosts, Discover's desktop footer, two shared-block rows, the recordings

Left from 507: the generated import reports; the scratch in logs/b507, b506, b505, b500, b484, b488; logs/b493 with the
16 lh-bd-ema archives (rollback windows); the draft test moved to logs/b506/drafts; /tmp/b488dam and the commit-message
files; nothing unpushed.

Method: no request to www or any brand's www host; nothing uploaded or published; lint (clean worktree) and both
suites before the push (lh-edge 70 files, site 648, 0 failing); smoke before and after on the ten hosts with
baselines, Brussels, SWISS and TAP; swiss-smoke and TAP by hand.

### 1. Brand fonts on airdolomiti and tap (e222602, lh-edge)

- wrangler.toml SITE_DESIGN_HOSTS airdolomiti=www.lufthansa.com; tap=www.lufthansa.com: /digitalhangar/ as on the
  other brand hosts (a release file kept a year in the zone's cache). Tests first (test/plain-sites-fonts-515.test.mjs;
  plain-sites and tap-site pinned "no design host").
- Checked with curl after the deploy: the five files fonts.css names (LufthansaHeadWeb-Light, -Bold, LufthansaTextWeb-
  Light, -Regular, -Bold) 200 font/woff2, x-lh-edge-route digitalhangar, cache-control a year, on both hosts; the bytes
  as the capture archives' copies. Smoke: the two hosts' font check 404 -> 200, nothing else changed.
- What asks for them: on Air Dolomiti the fallback consent banner (styles/consent-banner.css: --lh-consent-head
  lufthansahead, --lh-consent-text lufthansatext, for every brand); the theme's text is Euclid Circular B. On TAP's
  /pt-pt no element asked for them in my run (GT Flexa / Inter). Whether the banner should take the brand's fonts is the
  banner owner's call; the host answer stays either way.
- Note: lh-edge reads the files from www.lufthansa.com on a cache miss, as for the other brand hosts: the dependency on
  www moves into the zone's cache (a year), it doesn't go away.

### 2. Discover's footer from 768 px (8510214, styles/themes/discover.css: Discover row 41)

- discover-parity-001 at 1440 (its shadow HTML rendered locally): www's footer 731 px on de/en pages, 669 on de/de;
  ours 541 / 503. One cause: brief 474 matched the footer on phones only; from 768 px it kept lh-com's spacing (titles
  40 px under the top, not 84; links 49 under the titles, not 60; a divider and 30 px before the legal links, not 72 and
  no line; legal rows touching, not 24 apart; the logo band 79 px, not 110).
- On discover.turnsthe.page after the deploy: 731 px (de/en homepage, baggage), 669 (de/de homepage) at 1440; 390
  unchanged. ema-lufthansa: the change is the one @media (width >= 768px) footer block of Discover's theme file.

### 3. Two rows in shared blocks (tools/reports/parity-2026-11-09/shared-blocks-515.md; parity rows 67, 68)

- meetings-and-events' partner logos at 390: www's four-column carousel view of image-only items, one logo with dots;
  ours stacked (the columns-media parser gives cell-slider only to media | text items). The exact parser change for
  ema-cashub; with the option on the document 14.5 -> 7.6 % at 390, 1440 unchanged. Documents after it:
  tools/reports/parity-2026-11-09/reimport-515-meetings-logos-lh-com.txt (7).
- menu-on-board at 390: the capture's text rendering (macOS Chrome against Linux Chromium; height within 27 px), no
  block. Found on the way: the import framework drops www's no-break spaces (html2md / md2da); measured, not the row's
  cause; a decision for the user.

### 4. Recordings for the 8 re-imports (tools/reports/parity-2026-11-09/reimport-507-recordings.md)

- lh-parity-002c has /de/en/frankfurt-fair and /de/en/most-significant-route (1440, 768, 390; 2026-11-06); the de/de,
  at/de and gb/en documents have no recording here, Bright Data snapshots only.

### Ben's two answers

- Written into tools/reports/token-free/lh-com-pass-check.md ("Answered (brief 515)") and, for decisions.md, into the
  handover to ema-test (item 6, the exact lines).
