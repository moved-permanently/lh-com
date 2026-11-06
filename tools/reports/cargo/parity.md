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
| 1 | Header bar 90 px (60 on phones), the logo 257 x 30 at 24 px (205 x 24 at 16 px); Book & Track, Info-Hub and Cargo inside in the bar (LufthansaHead Light 18/24 #ebebeb, the open one outlined), then Support & Contact, the bell, the globe "EN" and Login; on phones Login, Support & Contact and the menu in one row | 122 px (168: the tools wrapped and a row of quick links Book, Track, Schedule), a Menu button opening lh-com's dark flyout, the language only in the flyout | theme | mine | fixed: 90 / 60 px, the logo and tools as www's, the menu items in the bar (`header.menu: 'bar'`), the language button in the bar (`header.languages: 'bar'`), no quick links row; on phones the bell and the language in the menu |
| 2 | Menu panel: white under the bar, four 306 px columns 24 px apart, titles LufthansaHead Bold 18/24 over a light rule, links 14/18 #52627c 29 px apart; a "Close ✕" link, a lock icon at the portal links, the note "Some services may be limited based on your access…" | lh-com's dark side flyout with two panes | theme; design | mine; open | panel, columns, titles and links fixed. The Close link, the lock icons and the note are open: the shared bar menu has no close link (Escape, a second click or a click outside close it), the nav documents carry no lock marks or note |
| 3 | Type: h1 LufthansaHead Bold 42/48 (32/36 on phones), h2 Bold 32/36 (28/32), h3 Light 28/32 (24/28), card titles (h4) Bold 18/24; copy LufthansaText 18/24; 20 px below headings and paragraphs | h1 48/52.8, h2 36/39.6 Light, h3 24/26.4 Bold, copy 18/27, 32-40 px margins | theme | mine | fixed |
| 4 | Grid: 72 px margins at 1440 (content 1296 px), 16 px on phones | 88 px, 22 px | theme | mine | fixed (768-1280 px: lh-com's margins, not measured) |
| 5 | Buttons 50 px, 18/24 bold, padding 10 30, 4 px corners | 48 px, 16 px | theme | mine | fixed |
| 6 | Footer: three link columns across the width (416 px), titles 18/24 bold, links 14/18 regular with a lock at portal links; the social icons at the right end of the legal row; the logo row with the Lufthansa Cargo and "Member of Lufthansa Group" marks and Cargo iQ's logo | three narrow columns and an empty quarter, 24 px titles, the social links as a text row, the logo row as text links | theme; document | mine; open | columns, type and the social links' place fixed. Open (footer documents, `cargo-nav.mjs`): the social links as icons (lh-com has `facebook`, `youtube`, `instagram`, `linkedin`), the logo row's graphics, the lock icons |
| 7 | Cookie dialog: Usercentrics "Cookie Settings" with Deny and Accept all on the first visit; "Cookie Settings" in the legal row | no consent dialog for Cargo (`scripts/brands.js`: "shows no cookie banner", written before www had one); the legal row's Cookie Settings hidden | decided | the user | open: whether Cargo gets a consent dialog (and whose) is the user's call |
| 8 | German Support & Contact: the English body and contact form under the German header and footer (`lang="de-DE"`); the German menu's Support & Contact and Feedback/Complaints stay German | `/de/support-and-contact` a redirect to the English page, `/de/contact-us` 404, the German nav linking the English pages | import; document | mine | fixed: `/de/support-and-contact` and `/de/contact-us` (www's English form, German header and footer), the German nav's three links, the redirect row out of lh-cargo's `/redirects` sheet (DA and preview; the published sheet keeps it until the user publishes) |
| 9 | Breadcrumb under the bar on inner pages (Home > Info-Hub > Fleet & ULD > Our fleet) | none | import; design | open | open: the importer drops www's breadcrumb (`eportalBreadcrumb`); lh-com's breadcrumb needs the pages' Parent metadata and a Cargo theme row |
| 10 | Homepage: a three-slide hero slider (arrows, dots), the headline at the top; the booking widget (tabs Booking, Track, Schedule, Stations) over the hero's foot | the first slide as hero-campaign, the other two as cards-teaser (overlay) below it; the four portal links as cards-icon tiles and the air waybill form | decided; design | the user; open | booking and tracking stay links to www (decided). The slider and the widget's place over the hero are open (a hero carousel option) |
| 11 | Homepage "Latest news": two news cards from the Mynewsdesk feed | "Read all news" and the Mynewsdesk link only | data; design | open | open: a news feed block for Mynewsdesk |
| 12 | Homepage bands: Infrastructure on a light blue gradient with station counters and icons next to the map; Products, Speeds and Add-on Services on a dark band with icon rows; About Lufthansa Cargo on a dark band with a key facts row; the ULD teaser full width | plain columns, the counters and products as bullet lists | design | open | open (section styles and an icon list option) |
| 13 | eServices slider pictures | none in our first screens | none | | not a difference: the pictures load once the carousel scrolls into view (our capture had scrolled past them) |
| 14 | Story 142: each passage once, two text columns on desktop, the text boxes over the pictures | every passage twice (www's phone copy, `d-block d-sm-none`, and the desktop table), the desktop text as a grey striped table | import; design | mine; open | fixed: www's phone-only copies left out, the story headline from the imported copy, the layout table (`rmsDiariesTable`) as columns-media; story 142 (en, de) and "The value of the rose" re-imported. The boxes over the pictures are open (design). The other stories (not in the snapshots here) need the harness's re-import |
| 15 | SDG goals: five collapsed rows, each an icon, a bold lead-in and its text, a toggle; light grey rows 135 px apart (the icon 28 px and 16/20 text on phones) | every goal open: big icons, pictures and lists one after the other (5x the page height) | import; theme | mine | fixed: www's icon collapsibles (`LhcIconCollapsible`) as accordion-columns (faq) items titled by the icon and the line; grey rows, the 126 px icon, 20/24 text (28 px, 16/20 on phones) |
| 16 | Our fleet: "Our fleet in detail" above the fleet cards | below them | import | mine | fixed: on the page's top level a heading before a component stays above its block (`flow`); 13 documents re-imported with their headings in www's order (fleet, ULDs, Facts & Figures, Support & Contact, ONE Record, eFreight and others) |
| 17 | Facts & Figures at 390: no sideways scroll | 483 px wide (the timeline carousel's 25 dots in one row) | shared | mine | fixed: the carousel dots wrap (brand-neutral) |
| 18 | Facts & Figures: a full-bleed video hero with the title over it, the key facts slider over a picture, the Executive Board on a dark band with an accordion, the timeline over a photo | a short hero with the dark title over the picture, carousels without backgrounds, the board as a picture and a list | design | open | open |
| 19 | What's up now?: a full-bleed hero and edge-to-edge tiles with their captions over the pictures | contained cards with the text below the pictures | import; design | open | open (cards-teaser (overlay) and a full-width section would come close) |
| 20 | Newsroom: the Mynewsdesk app embedded (after consent) | a link to the newsroom on Mynewsdesk | design; decided | the user | open: embedding Mynewsdesk needs a consent decision (row 7) |
| 21 | Support & Contact: the topic finder in a card with chips, the topics as tabs with a list and a panel, "Contact us" on a dark band with a photo, technical support and the local sales contact | the topic filter, the topics as an accordion, a grey band, no technical support or sales contact rows | design; decided | open; the user | open. The local sales contact's station search is portal function (decided: a link) |
| 22 | Contact form: a dialog over Support & Contact, its fields in a three-column grid | a page of its own, one narrow column | design; theme | open | open (a grid for the form's fields is possible in the theme; the dialog is design) |
| 23 | (tooling) | without the asset map a re-import linked every picture and document to www | import | mine | fixed: `cargo-import.mjs --known-from <DA copies>` takes the copy lh-cargo's DA has (the upload state's media, the DA documents' links) by cargo-assets.mjs's name |
| 24 | Industries in focus: the industry cards boxed (border, shadow) | flat cards | theme | open | open |
| 25 | eBooking: the features list beside its picture | stacked | import | open | open |
| 26 | Notifications: the hero picture and the breadcrumb above the list; the list on a grey band | no hero, no breadcrumb | document | open | open |
| 27 | Footer search focused: the field white with its label above | a white ring | theme | open | open |
| 28 | The header stays at the top when the page scrolls | it scrolls away | theme; shared | open | open (lh-com's header has no sticky option yet) |
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
