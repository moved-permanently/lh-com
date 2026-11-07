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
