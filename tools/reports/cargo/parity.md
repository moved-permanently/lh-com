# Lufthansa Cargo against www: parity pass 1 (brief 417)

cargo.turnsthe.page (lh-cargo, lh-com's code) against www.lufthansa-cargo.com, en and de at 390
and 1440, 24 pages (12 per language):

- the homepage (www `/en`, `/de`; ours `/<ll>/home`);
- `support-and-contact` (also the contact page), the Feedback/Complaints form (www:
  `support-and-contact?reason=General%20request&subreason=Feedback%20%2F%20Complaints`, the form
  as a dialog; ours `/<ll>/contact-us?reason=…`);
- `fleet-ulds/fleet`, `ebooking-info`, `industries-in-focus`;
- `ci/whats-up-now`, `ci/newsroom`, `ci/facts-figures`, `ci/sustainable-development-goals`;
- `notification-overview`;
- story 142 (www `/en/-/142.-arctic-temperatures-on-board`, `/de/-/142.-arktische-temperaturen-an-bord`;
  ours `/<ll>/news/142-…`).

States: each homepage menu panel at 1440, the 390 menu with Book & Track expanded, the Track tab's
air waybill field and the footer search focused, the cookie dialog.

## How it was compared (2026-11-06)

- **www:** the user's capture cargo-parity-001.tar.gz (sha256 `b92605df…85243c84`, checked; README,
  manifest, 48 full-page screens, HTML and measurements, the states, 35 stylesheets and the fonts).
  The agent loaded nothing from www.
- **Ours, before:** cargo.turnsthe.page at both widths, the same measurements (header, h1-h4 type,
  main, sections, buttons, footer, scrollWidth) and full-page screens side by side with www's.
- **Ours, with the fixes:** a local dev server with the working tree's code and lh-cargo's preview
  content (the re-imported documents uploaded and previewed first), measured and screened again.
- Measured at 390 and 1440 only. The theme takes the phone values below 768 px (www's main
  breakpoint) and the desktop values from there.
- Documents re-imported from the Cargo snapshots: cargo-snapshots-001 (the delivery, 80 pages) and
  cargo-snapshots-002 (es, fr, it, pt), with the German pages the snapshots lack taken from the
  parity capture's own HTML (a rendered page of the same day). There is no asset map on this
  machine, so the importer now takes each file's copy that lh-cargo's DA already has, by
  cargo-assets.mjs's name (`--known-from`, row 23).
- Booking, tracking, eServices and the portal stay links to www (decided): no row builds them.

## Rows

Kind: **theme** = `styles/themes/cargo.css` (tokens and body.brand-cargo rules) and Cargo's header
settings (`scripts/brands.js`); **shared** = lh-com's shared code (brand-neutral); **import** =
`tools/importer/cargo-*.mjs` and the documents it writes; **document** = lh-cargo documents;
**design** = something www builds that lh-com has no block or option for; **data** = what the page
loads from a service; **decided** = the user's decision.

| Row | What www shows | What ours showed | Kind | Owner | Status |
| --- | --- | --- | --- | --- | --- |
| 1 | Header bar 90 px (60 on phones), the logo 257 x 30 at 24 px (205 x 24 at 16 px); Book & Track, Info-Hub and Cargo inside in the bar (LufthansaHead Light 18/24 #ebebeb, the open one outlined), then Support & Contact, the bell, the globe "EN" and Login; on phones Login, Support & Contact and the menu in one row | 122 px (168: the tools wrapped and a row of quick links Book, Track, Schedule), a Menu button opening lh-com's dark flyout, the language only in the flyout | theme | mine | fixed: 90 / 60 px, the logo and tools as www's, the menu items in the bar (`header.menu: 'bar'`), the language button in the bar (`header.languages: 'bar'`), no quick links row; on phones the bell and the language in the menu; round 3: from 768 to 1024 px www's 60 px bar with 24 px sides (www's CSS at those widths, ema-adobe's homepage pass), 90 px from 1025 px |
| 2 | Menu panel: white under the bar, four 306 px columns 24 px apart, titles LufthansaHead Bold 18/24 over a light rule, links 14/18 #52627c 29 px apart; a "Close ✕" link, a lock icon at the portal links, the note "Some services may be limited based on your access…" | lh-com's dark side flyout with two panes | theme; shared; document | mine | fixed (brief 422): the Close link (header.menuClose, header-bar-menu.js) and the access note (the nav documents' menu paragraph) in each panel, the panel #f5f5f5 with its sections in one row (Cargo inside's five), the lock at www's portal links (:lock: in the nav documents, cargo-nav.mjs); en and de navs re-made and uploaded; es, fr, it, pt: the harness (cargo-nav.mjs); the phone menu (below 1025 px): the access note once below it, as www's, and its text navy on the white flyout (it was #ebebeb, the bar's light text, since the bar menu came: hardly readable) |
| 3 | Type: h1 LufthansaHead Bold 42/48 (32/36 on phones), h2 Bold 32/36 (28/32), h3 Light 28/32 (24/28), card titles (h4) Bold 18/24; copy LufthansaText 18/24; 20 px below headings and paragraphs | h1 48/52.8, h2 36/39.6 Light, h3 24/26.4 Bold, copy 18/27, 32-40 px margins | theme | mine | fixed |
| 4 | Grid: 72 px margins at 1440 (content 1296 px), 16 px on phones | 88 px, 22 px | theme | mine | fixed: round 3 measured www's grid with its captured CSS from 390 to 1920 px: 16 px margins on phones, 24 px from 768 px, 48 px from 1025 px, from 1281 px the content 1296 px wide in the middle with at least 16 px beside it (72 px at 1440, 312 at 1920); ours the same at every width |
| 5 | Buttons 50 px, 18/24 bold, padding 10 30, 4 px corners | 48 px, 16 px | theme | mine | fixed |
| 6 | Footer: three link columns across the width (416 px), titles 18/24 bold, links 14/18 regular with a lock at portal links; the social icons at the right end of the legal row; the logo row with the Lufthansa Cargo and "Member of Lufthansa Group" marks and Cargo iQ's logo | three narrow columns and an empty quarter, 24 px titles, the social links as a text row, the logo row as text links | theme; document | mine | fixed: columns, type and the social links' place (417); brief 422: the social links as icons, the logo row's Lufthansa Group and IATA Cargo iQ marks (icon tokens), the lock at the portal links (footer.js, brand-neutral); en and de footers uploaded; es, fr, it, pt: the harness (cargo-nav.mjs) |
| 7 | Cookie dialog: Usercentrics "Cookie Settings" with Deny and Accept all on the first visit; "Cookie Settings" in the legal row | no consent dialog for Cargo (`scripts/brands.js`: "shows no cookie banner", written before www had one); the legal row's Cookie Settings hidden | shared; theme | mine | fixed (brief 422): Cargo has the brand sites' consent handling without OneTrust (scripts/brands.js consent 'fallback'): the look-alike banner on a first visit, the footer's Cookie Settings its preference center, Cargo's data protection, cookie and imprint pages in it; not Usercentrics; the banner's lang attribute is its texts' language now (it was "en" on German and other pages for every brand, scripts/consent-banner.js) |
| 8 | German Support & Contact: the English body and contact form under the German header and footer (`lang="de-DE"`); the German menu's Support & Contact and Feedback/Complaints stay German | `/de/support-and-contact` a redirect to the English page, `/de/contact-us` 404, the German nav linking the English pages | import; document | mine | fixed: `/de/support-and-contact` and `/de/contact-us` (www's English form, German header and footer), the German nav's three links, the redirect row out of lh-cargo's `/redirects` sheet (DA and preview; the published sheet keeps it until the user publishes) |
| 9 | Breadcrumb under the bar on inner pages (Home > Info-Hub > Fleet & ULD > Our fleet) | none | import; theme | mine | fixed (brief 422): www's breadcrumb as the breadcrumb block where it stands (Home and the hub pages linked, the menu's section labels as text), 14/18 whale blue and grey; 43 inner pages and the two notifications pages re-imported and uploaded |
| 10 | Homepage: a three-slide hero slider (arrows, dots), the headline at the top; the booking widget (tabs Booking, Track, Schedule, Stations) over the hero's foot | the first slide as hero-campaign, the other two as cards-teaser (overlay) below it; the four portal links as cards-icon tiles and the air waybill form | decided; design | the user; open | booking and tracking stay links to www (decided). Fixed (brief 425): the stage is hero-campaign (slider) with the three slides (the import wrote slide 1 as the stage, 2 and 3 as cards), Cargo's look in the block's CSS: 617 px (749 below 768 px), the text 40 px from the top (20), 856 px wide, the subline 28/32, the dots under it at the left, the arrows www's 50 x 49 grey squares 8 px in, right under the header; the widget cards-icon (widget) (the four links to www as tabs side by side, icons only below 768 px) with the Track form as its panel, a white card over the stage's foot. Checked on a local dev server with main's code plus the commit and lh-cargo's preview content, en and de at 1440 and 390, against cargo-parity-001: stage 0,90 1440 x 617 (www 90, 617), the card 72,536 1296 wide (www 72,536 1296), at 390 the stage 749 and the card at 16,498 (www 498). Differs: the card's panel is the Track form (www's first tab, Booking, shows the booking fields; the tabs are links, decided); the stage's button stays the theme's primary (www: a white outline) Round 3: the stage's button as www's "Explore more" outline (2 px #ebebeb, #ccc text, regular 18/24, 165 x 50), not the theme's yellow (cargo.css) |
| 11 | Homepage "Latest news": two news cards from the Mynewsdesk feed | "Read all news" and the Mynewsdesk link only | data; design | open | fixed (brief 425): new block news-feed reads Mynewsdesk's pressroom list (the one www's homepage script reads; it answers any origin), the page language's two newest releases as www's cards (the picture 320 px 17:10 beside the text from 768 px, 16:9 above it on phones; "Press Release - 02 NOV 26 \| 14:30" / "Pressemitteilung - …", the title 18/24 bold, Read more / Mehr lesen), then "Read all news" to /en/ci/newsroom (/de/ci/newsroom). Checked on a local dev server with main's code plus the commit and lh-cargo's preview content, en and de at 1440 and 390, against cargo-parity-001: the cards 636 px at x 72 and 732, 24 px apart (www 72, 732), the same two releases as www's capture showed in each language (live feed, 2026-11-06). Differs: Read more opens the release on Mynewsdesk (www: its embedded newsroom, row 20). As on www, the feed is read before any consent (Cargo has no consent dialog, row 7) |
| 12 | Homepage bands: Infrastructure on a light blue gradient with station counters and icons next to the map; Products, Speeds and Add-on Services on a dark band with icon rows; About Lufthansa Cargo on a dark band with a key facts row; the ULD teaser full width | plain columns, the counters and products as bullet lists | design | open | fixed except the icons (brief 425): columns-media (band ...), Cargo's look in the block's CSS: a band across the screen behind the column, 40 px above and below; gradient (www's 90deg rgba(132,154,194,.6) to #f5f5f5 over the screen's width) with stats for Infrastructure (the text 856 px, the two counters 28/32 between #52627c rules, the regions three to a row with dividers, 636 px beside the 419 px map); dark (#05164d, white) with features for Products, Speeds and Add-on Services (the heading row, then each row under a rule, 416 px of text, the items 88 px wide) and with facts for About (640 px, 856 px wide, five key facts with rules). Checked on a local dev server with main's code plus the commit and lh-cargo's preview content, en and de at 1440 and 390, against cargo-parity-001: Infrastructure 714 px high (www 713), About 640 (640), no sideways scroll. Icons and the products band's artwork (brief 429): www's SVGs (cargo-media-001) in lh-cargo's DA under /documents/ and previewed (the site serves them; tools/reports/cargo/media-001.tsv), drawn by columns-media's CSS as www does: with the new option icons (columns-media (band, gradient, stats, icons) and (band, dark, features, icons), written by the importer) each product, speed and add-on item's 88 px icon over its label, cut from www's three sprites at www's positions, the item known by its link; the counters' 40 px icons from the infra sprite in www's order, the regions' labels on two lines as www's spans; the products band's OurProduct-BG.svg across the screen (75% / cover) in a layer as wide as the layout (--columns-media-viewport, set by columns-media on its band blocks). Checked on a local dev server with the commit and lh-cargo's preview content and files, en and de at 1440 and 390, against cargo-parity-001: 19 product icons and 7 counter icons, eight items to a row at 1440 (www eight), three at 390 (www three), the artwork 1440 wide at x 0 (390 at 390), no sideways scroll. Brief 430: the products band as www's .ourProducts (measured on cargo-parity-001 rendered with its own stylesheets): the links LufthansaText bold 14/18 with a 16 px arrow, the rows back to back under their rules, 20 px in, 20 px above and below on phones: 756 px at 1440 (www 757; rows 289, 147, 145 as www's), 1609 at 390 (1617). The about band's artwork in a smaller form, the same picture: www's two SVGs' vector part as SVGs of their own (2 KB each) and their embedded grain PNG on its own (www's bytes), multiplied over the vector as the SVGs do (pixel-identical to www's SVG at 1280 and 1440; at 390 the grain noise placed a little differently, the mean colour the same within 0.03 of 255); the band's type and spacing as www's: 640 px at 1440, 714 at 390 (www 640, 714), five facts to a row (two on phones). Brief 430, the rest of the homepage as www's (cargo-parity-001's screenshots and its own stylesheets), Cargo only in the blocks, the options written by the importer (homepage-only components): the fleet tiles cards-teaser (overlay, fleet): www's mosaic from 768 px (416 x 548, 856 x 265, two 416 x 263 at 1440, as www's), stacked 212 px cards on phones, the photos untinted, www's line, corners and shadow; the eServices slider carousel-cards (slides): two 636 px slides to the row (the third peeking), the 16:9 photo with 5 px corners, www's text, 50 px grey arrows 8 px from the screen's edges (32 px at the top right on phones), dots; the ULD teaser hero-card-overlay (plain): the photo 640 px high, the text on it in deep blue, centred (as www's at 1440 and 390). Differs: the phones' ULD photo is the desktop one cropped (www's Teaser-ULD-Mobile@2x.jpg is not in lh-cargo's DA); the slider's dots are one per slide (www: per page); the gap between the homepage's components is 20 px at 1440 (www 40: its boxes' padding; Cargo's --spacing-default token, cargo.css) |
| 13 | eServices slider pictures | none in our first screens | none | | not a difference: the pictures load once the carousel scrolls into view (our capture had scrolled past them) |
| 14 | Story 142: each passage once, two text columns on desktop, the text boxes over the pictures | every passage twice (www's phone copy, `d-block d-sm-none`, and the desktop table), the desktop text as a grey striped table | import; design | mine | fixed: the phone copies and the two text columns (417); the picture modules as hero-card-overlay (light) (422); round 3: as www's .module--story, up to 1354 px wide in the middle and as tall as the picture (852 px for story 142's first at 1440, www 853), the box 376 px, 83 px in and 50 px down, white at 90 %, the title 33 px, the text 16/24; up to 1024 px the box under the picture on www's grey band, 68 px from the sides (cargo.css only: the 745 stories the harness re-imports get it without a new import) |
| 15 | SDG goals: five collapsed rows, each an icon, a bold lead-in and its text, a toggle; light grey rows 135 px apart (the icon 28 px and 16/20 text on phones) | every goal open: big icons, pictures and lists one after the other (5x the page height) | import; theme | mine | fixed: www's icon collapsibles (`LhcIconCollapsible`) as accordion-columns (faq) items titled by the icon and the line; grey rows, the 126 px icon, 20/24 text (28 px, 16/20 on phones) |
| 16 | Our fleet: "Our fleet in detail" above the fleet cards | below them | import | mine | fixed: on the page's top level a heading before a component stays above its block (`flow`); 13 documents re-imported with their headings in www's order (fleet, ULDs, Facts & Figures, Support & Contact, ONE Record, eFreight and others) |
| 17 | Facts & Figures at 390: no sideways scroll | 483 px wide (the timeline carousel's 25 dots in one row) | shared | mine | fixed: the carousel dots wrap (brand-neutral) |
| 18 | Facts & Figures: a full-bleed video hero with the title over it, the key facts slider over a picture, the Executive Board on a dark band with an accordion, the timeline over a photo | a short hero with the dark title over the picture, carousels without backgrounds, the board as a picture and a list | theme; import; design | mine; the harness | part fixed: the video header (422); round 3: the Executive Board and Compliance as www's image lists (section image-list: the band's picture, the heading and the items over its left half, one item's text at a time in a white panel over the right half; on phones the picture with the heading on its foot, the items below), their texts imported (www keeps them only in its phone copies; the "lorem" placeholder out); the timeline as www's (carousel-cards (timeline): cards above and below a white line in turn, on phones down a navy line). Open: the key facts slider's photo behind the slides (Facts_BG_Paralaxe_01_864px.jpg) and its phone version (Mobile_facts_BG_01.jpg with icons), the timeline's photo (History_Slider_BG.jpg: the band grey meanwhile), the board members' and compliance pictures (6): not in lh-cargo's DA, for the harness (cargo-assets.mjs --download, then the page's re-import) |
| 19 | What's up now?: a full-bleed hero and edge-to-edge tiles with their captions over the pictures | contained cards with the text below the pictures | import; theme | mine | fixed (brief 422): the tiles as cards-teaser (overlay, mosaic): edge to edge, www's 526 / 214 px rows (285 / 174 on phones), the title and an outlined button on a navy band at the bottom, the full-height video header (row 18) |
| 20 | Newsroom: the Mynewsdesk app embedded (after consent) | a link to the newsroom on Mynewsdesk | design; decided | mine; the user | built (brief 422): blocks/newsroom behind the site flag newsroom (lh-cargo /config/flags, no row: the link as today), as www: #mnd-script and the newsroom's hosted_newsroom.js (the English or the German newsroom, from the page), only after consent to third-party content (C0005); en and de re-imported and uploaded (es, fr, it, pt: the harness). The flag is the user's |
| 21 | Support & Contact: the topic finder in a card with chips, the topics as tabs with a list and a panel, "Contact us" on a dark band with a photo, technical support and the local sales contact | the topic filter, the topics as an accordion, a grey band, no technical support or sales contact rows | design; import | mine | fixed (round 3): the topic finder and the tabs at once, as www: accordion-columns (faq, tabs, filter), the field a finder over the tabs (typing lists the matching topics of every tab with their links under it; brand-neutral), in www's card, the tabs a third of the row each; "Contact us" on its navy band (section contact); technical support (text, phone, opening hours) beside "Find your local sales contact" (columns (support); the station search a link to www's station finder, decided). Differs: inside a tab the topics stay one under the other (www: a list and the selected topic's links beside it); "Contact us"'s photo is not in lh-cargo's DA; www's chips (popular topics) are not imported |
| 22 | Contact form: a dialog over Support & Contact, its fields in a three-column grid | a page of its own, one narrow column | theme; shared | mine | fixed (round 3): the form opens as a dialog over Support & Contact, as www (its links open /modals/contact-us: scripts/fragment-dialog.js; the link's reason and subreason preselected: the dialog hands the link's query to the form, brand-neutral), 900 px wide, the card across it; its fields in three columns from 768 px on the page too (the round-2 rule never applied: the core form's fields were display: block). The menus' Feedback/Complaints link still opens the form page |
| 23 | (tooling) | without the asset map a re-import linked every picture and document to www | import | mine | fixed: `cargo-import.mjs --known-from <DA copies>` takes the copy lh-cargo's DA has (the upload state's media, the DA documents' links) by cargo-assets.mjs's name |
| 24 | Industries in focus: the industry cards boxed (border, shadow) | flat cards | import; theme | mine | fixed (brief 422): www's lcagCard rows as cards-teaser (boxed): a white card with www's border and shadow, 20 px inside, the titles 18/24 bold (industries en, de) |
| 25 | eBooking: the features list beside its picture | stacked | import; theme | mine | fixed: www's text one third, picture right (Text-Image-horizontal-CF7) as columns-media (wide-media) (422); round 3: www's col-4 | col-8, the text 416 px and the picture 856 px of 1296, 24 px between (Cargo's theme; lh-com's wide-media 25 | 75) |
| 26 | Notifications: the hero picture and the breadcrumb above the list; the list on a grey band | no hero, no breadcrumb | document | mine; the harness | part fixed (brief 422): the breadcrumb (cargo-notifications.mjs overviewPage); the header picture is not in lh-cargo's DA yet: the harness (cargo-assets.mjs --download, then cargo-notifications.mjs) adds it |
| 27 | Footer search focused: the field white with its label above | a white ring | theme | mine | fixed (brief 422): the field white with www's glow, whale blue text and line, 10 px inside |
| 28 | The header stays at the top when the page scrolls | it scrolls away | theme | mine | fixed (brief 422): Cargo's bar never hides while scrolling |
| 29 | Booking, tracking, eServices and the portal | links to www | decided | the user | as decided: links to www, not built |

## Documents changed (uploaded to DA and previewed, not published)

- Batch 1: `/en/news/142-arctic-temperatures-on-board`, `/de/news/142-arktische-temperaturen-an-bord`,
  `/de/support-and-contact`, `/de/contact-us`, `/de/nav`; the `/redirects` sheet (the
  `/de/support-and-contact` row out: 646 to 645 rows).
- Batch 2: `/en/cookie-information`, `/en/onerecord`, `/en/eservices-app`, `/en/support-and-contact`,
  `/en/industries-healthcare`, `/en/ci/facts-figures`, `/en/ci/fleet-infrastructure`,
  `/en/ci/environmental`, `/en/eservices/efreight`, `/en/fleet-ulds/fleet`, `/en/fleet-ulds/ulds`,
  `/de/ci/facts-figures`, `/de/fleet-ulds/fleet`, `/en/news/the-value-of-the-rose-17`.
- Batch 3: `/en/ci/sustainable-development-goals`, `/de/ci/sustainable-development-goals`.

Every re-imported document was compared with its DA copy before the upload: of the 70 pages with a
source here, the 56 whose text, files and blocks came out the same were not sent; the 16 of batches
2 and 3 differ only as the rows say (the order, the phone copies, the SDG accordion). Batch 1's are
the new German pages, the German nav's three links and story 142 (rows 8 and 14).

## Round 2 (brief 422, 2026-11-06): the inner pages

Theme (`styles/themes/cargo.css`) and Cargo's settings, tests in `test/cargo-parity-417.test.mjs`
(round 2 rows), `test/cargo-import-417.test.mjs`, `test/cargo-nav-422.test.mjs`,
`test/header-bar-menu.test.mjs`, `test/embed-newsroom.test.mjs`, `test/consent-brand.test.mjs`.
Shared code, brand-neutral: the bar menu's Close and note options (`header.menuClose`), the lock
after links whose text holds `:lock:` (bar menu and footer, `icons/lock.svg`), the nav sections'
classifier (`blocks/header/header-sections.js`: the tools are the section whose own items carry
icons, so a mega menu's locks don't make it the tools), consent's fallback-only mode
(`consent: 'fallback'`), the newsroom block (`blocks/newsroom`) behind its site flag.
The homepage is ema-adobe's this round: no homepage document was sent.

Documents uploaded to DA and previewed, not published, in release order:

1. Newsroom: `/en/ci/newsroom`, `/de/ci/newsroom` (the newsroom block; with the flag off they
   show the link as before).
2. Nav and footer: `/en/nav`, `/en/footer`, `/de/nav`, `/de/footer` (locks, the menu note, the
   social and logo icons; they need the code of brief 422: before it, the nav's lock icons would
   make the header take the menu for the tools).
3. Inner pages (breadcrumbs, boxed cards, the eBooking columns, What's up tiles, story boxes): 47
   documents.

The paths in this order: `tools/importer/cargo-runs/publish-422.txt` (55).
4. Notifications: `/en/notification-overview`, `/de/notification-overview` (the breadcrumb).

For the harness (not in the snapshots here): the 745 other transport stories
(`tools/importer/cargo-runs/stories-reimport-422.txt`; with our paths:
`stories-reimport-422.tsv`); the es, fr, it and pt navs, footers and newsrooms (`cargo-nav.mjs`,
`cargo-import.mjs`); the notifications header picture (`cargo-assets.mjs --download`, then
`cargo-notifications.mjs`).

## Round 3 (2026-11-06): the bar, the grid, the slide button, rows 4, 14, 18, 21, 22, 25

www's capture (cargo-parity-001) rendered locally with its own CSS (the archive's serve.py, run
from a copy) gave the widths it does not show: the bar 60 px up to 1024 px (ema-adobe's homepage
pass), the grid's margins from 390 to 1920 px. www itself answers this machine with Cloudflare's
challenge (403): no capture of it. Theme: styles/themes/cargo.css (tests: test/cargo-round3.test.mjs,
test/cargo-parity-417.test.mjs). Brand-neutral: accordion-columns' exclusive option and the filter as
a finder over tabs; a dialog link's query reaching the form (fragment.js, fragment-dialog.js,
form.js). Importer: cargo-import.mjs (image lists, timeline, Support & Contact), cargo-contact-form.mjs
(the dialog document), cargo-paths.mjs (/modals/contact-us), sites/lh-cargo.json (its pattern).

CSS only (live with the code, no document): the bar, the grid, the slide button, the story pictures
(the 745 stories the harness re-imports get them as they are), eBooking's columns, the contact
form page's three columns.

Documents uploaded to DA and previewed, not published, in release order:
`tools/importer/cargo-runs/publish-r3.txt` (5: /modals/contact-us, /en/ and /de/support-and-contact,
/en/ and /de/ci/facts-figures).

For the harness (files not in lh-cargo's DA; cargo-assets.mjs --download, then the page's re-import):
Facts & Figures' board members' and compliance pictures (6, in the item texts: left out of the
uploaded documents meanwhile), the key facts' photo (Facts_BG_Paralaxe_01_864px.jpg) and phone
version (Mobile_facts_BG_01.jpg), the timeline's photo (History_Slider_BG.jpg); Support & Contact's
"Contact us" photo (/documents/20184/042b0cfe-5e6c-74b0-8652-a93835861949). The backgrounds and the
contact photo need the importer to use them too (open).

