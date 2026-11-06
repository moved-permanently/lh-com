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
empty tabs, screen-reader words), bda2b87 (sections split off a tab).

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
3. ch/zh, ch/ru, ch/ja, ch/el, kr/ko, corporate (en, de, fr) and 19 market pages: 549 documents
   (state below when done).
The path list of batches 1 and 2: [../swiss/preview-paths-432.txt](../swiss/preview-paths-432.txt).
Checked on main--lh-swiss--moved-permanently.aem.page: the 23 pilot pages at 1440 and 390 measure as
they did locally (all 46 pairs the same ratio, no broken images); a French page's blocks as its
document.

Rollback: per page, upload DA's earlier copy (logs/b432/da/<path>.html, not committed: kept on this
machine) and preview it; the code: `git revert` of the commits above (the documents then show
the earlier layout's blocks without the SWISS styling).

Open (rows 30 to 36 of parity.md): 50 ch/en+de pages whose sidebar the step leaves as it is (the
content starts inside a block, or the aside is only partly in the document); the aside's video
card (www plays the video in the card); grey boxes covering part of a tab panel; Miles & More's
tier headings in a tab set (0.87); the offers page's fares (data); new destinations and accessible
travel at 1440 (1.14, 1.13), not looked at yet.

The restart in the afternoon (about 12:00 to 15:50 UTC) stopped the local servers and a batch run;
the uploads had finished, the batch was run again.

## 3. SWISS accessibility pass

axe-core 4.10.2 (from npm, sha512 as the registry's), WCAG 2.0 to 2.2 A and AA, on the 84 SWISS pages
of swiss-parity-001 and -002 (ch/en, ch/de, 10 magazine pages) at 390 and 1440 on
main--lh-swiss--moved-permanently.aem.page, after the documents of item 2 were previewed.
- A first run counted no violations but tested little: the DEMO notice is a modal dialog, so the
  page behind it is inert and axe skips it. Run again with the notice acknowledged (its own
  localStorage key, as after its button): **0 violations on all 168 page-widths**, all 200.
- Items axe asks a person to review: (in progress, listed below when the run is done).

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
