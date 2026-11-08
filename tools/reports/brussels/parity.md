# Brussels Airlines against www: parity

brussels.turnsthe.page (lh-brussels; live in be/en and be/fr since 2026-11-01) compared with
www.brusselsairlines.com at 390 and 1440 px.

## Parity

www refuses this environment's browser: 403 with Cloudflare's "Security check" on the be/en
homepage on 2026-11-05, on the first request, with no retry and no proxy. The user captured the
pages (`brussels-parity-001.tar.gz`, sha256 0a19e359…73e9ed: 22 pages at both widths, the menu
tabs, the travellers panel and the airport list, www's stylesheets, fonts and computed styles).
The rows below compare that capture, its HTML rendered with its own CSS and fonts (no scripts),
with ours: brussels.turnsthe.page before the fixes, and main's code plus the theme changes
through a local dev server on lh-brussels' preview after them.

Pages, both languages (our paths are www's):

- `/be/<ll>/homepage`
- the menu tabs' first pages:
  - `book-a-flight`
  - `check-in-options-and-info?country=BE&language=<LL>`
  - `special-care/families-and-children`
  - `my-bookings`
  - `extra-services/upgrades`
  - `travel-classes`
  - `extra-services/meals`
  - `book-a-flight/connecting-africa`
- `contact`
- `articles/lyon`
- the footer, on the homepages.

Kinds: **theme** (styles/themes/brussels.css), **document** (lh-brussels in DA, uploaded and
previewed, not published), **shared code** (lh-com's blocks, every brand), **environment** (this
network or the services behind it). Sizes are 390 / 1440 px. The theme fixes are 5098fd4f and
the commit after it (the feedback question); the documents (be/en and be/fr: homepage, nav,
contact) are on preview, listed in `preview-378.txt`. Brief 388 (P12, P16, P23, P24, P26, P27): the documents in
`preview-388.txt`, the commits in its report.

| # | Where | www | Ours (before) | Kind | Owner | Status |
| --- | --- | --- | --- | --- | --- | --- |
| P1 | Page titles (h1, heading-large), every content page and the article | Brussels red #e5002b, uppercase; 36 / 48 px; 26 / 28 px below | #1a1a1a, as written; 32 / 40 px below | theme | Brussels theme | fixed |
| P2 | Headings' space below | heading-medium 22 / 26 px, heading-small 18 / 22 px | 28 / 32, 24 / 32 | theme | Brussels theme | fixed (sizes already the same) |
| P3 | heading-copytext-large (h3/h4 by default, the article's date) | 16 / 17.6 px, 18 / 19.8 px; 14 / 16 px below | 20 / 22 px, 24 / 26.4 px; 24 px below | theme | Brussels theme | fixed (the token: every block that reads it) |
| P4 | Copy (.richtext p, li) | 18 / 24 px; paragraphs 16 / 20 px apart, items 10 px | 16 / 24 px; 24 px apart | theme | Brussels theme | fixed |
| P5 | Buttons (maui-button, maui-button-link) | 18 / 22 px regular, 10 px 33 px, 6 px radius, 50 px high ("Book your upgrade now!" 263 x 50) | 16 / 24 px bold, 11 px 30 px, 4 px radius | theme | Brussels theme | fixed (263 x 50 now) |
| P6 | Breadcrumb, first crumb | "Home" / "Accueil" | the homepage's title ("Discover the world – book flights…", "Découvrez le monde…"), two lines on phones | document | lh-brussels documents | fixed: `Breadcrumb Title` on be/en and be/fr/homepage. The other markets' homepages (be/nl and the rest) have the same gap; their labels are not in the capture |
| P7 | Breadcrumb style | every crumb and chevron sn-blue-3 #0a1f62, 16 / 24 px, the current page bold; phones "< Home" | 14 / 20 px, the link red, the current #1a1a1a | theme | Brussels theme | fixed |
| P8 | Teaser cards (link cards on the hubs and under "Related topics") | border 1 px #e8e8e8, 6 px radius, shadow 0 2px 4px rgb(5 20 70 / 10%); title 14 / 15.4 px and 16 / 17.6 px bold uppercase; stacked cards 64 px apart, rows 85 px | #b0b0b0, 4 px, 0 1px 4px #0003; title 20 / 24 px; 40 / 64 px | theme | Brussels theme | fixed |
| P9 | Wide teasers' eyebrow ("Snow season is calling") | regular, uppercase | bold, as written | theme | Brussels theme | fixed |
| P10 | Icon tiles ("Looking for more than just a flight?") | white, 2 px radius, label sn-blue-4 #051446 | sngrey1, 8 px radius, label #1a1a1a | theme | Brussels theme | fixed |
| P11 | Stage card headline (homepages) | uppercase (display-text) | as written | theme | Brussels theme | fixed |
| P12 | Stage card content (homepages) | "Family time, far away / UP TO 50% OFF FOR KIDS" (fr "En famille, loin de tout / Jusqu’à -50 % pour les enfants") | "Limited-time offer / 10 % off to Kinshasa with FIH10" | document | lh-brussels documents | fixed (brief 388): be/en and be/fr homepage, the card's image, eyebrow, headline and link from the capture's HTML ("Book now" / "Découvrez plus" to www's family-promo-2026) |
| P13 | "Winter deals" (the fare teaser's title) | bold (maui-headline h3, 36 px) | light (300) | theme | Brussels theme | fixed |
| P14 | Fare teaser prices, destination finder (homepages) | prices and destinations | the cards without prices, the finder empty | environment | — | environment, no change (A5) |
| P15 | Article: title, intro, date | title red uppercase; intro 20 / 30 px regular; date 16 / 18 px bold | title #1a1a1a; intro 22 / 24.3 px and 28 / 30.8 px light; date 20 / 24 px | theme | Brussels theme | fixed |
| P16 | Article date format | "May 11, 2026" (be/fr "11 mai 2026") | "11. May 2026" | shared code | lh-com shared code (article-header) | fixed (brief 388): each language's own long date (Intl), every brand alike; English in de, at, ch markets day-dot-month as www.lufthansa.com's de/en and www.swiss.com's ch/en ("16. October 2025"). Lufthansa's English pages elsewhere (gb/en) now "September 7, 2026", as www's English lists |
| P17 | Menu panel | white; tabs 28 / 30.8 px bold sn-blue-3 (the open one sn-blue-4); group titles sngrey8; links and extras red 16 / 22 px regular, 16 px apart; a sngrey2 line between the columns and above Login; close and back 32 px squares with a 2 px red border, 6 px radius; phones: the tab's name 20 px over the panel | #1a1a1a panel, white text; links 18 / 27 px bold, 14 px apart; extras 14 px bold; white icons without a box | theme | Brussels theme | fixed |
| P18 | Menu cart entry | "Your Cart" / "Votre panier" | "Shopping cart preview" / "Aperçu du panier" | document | lh-brussels documents | fixed: be/en/nav and be/fr/nav. The other markets' navs: the same label, not in the capture. Since 9f93486 the header also names the bar's icon as www ("Shopping cart preview" / "Aperçu du panier") and keeps "Your Cart" / "Votre panier" in the menu |
| P19 | Header bar's foot | a 1 px #c5c5c5 rule | none | theme | Brussels theme | fixed |
| P20 | Flight search fields | boxed: sngrey1, 1 px sngrey8 border, 8 px radius (dates 6 px), 50 px high, the label 14 / 21 px sngrey7 inside; phones: From and To one box of two rows, the swap on the line between them; swap a 32 px white circle with a 2 px sn-blue-4 border; calendar icon sn-blue-3 | underlined fields, the label above; a half border; swap a bare icon; calendar red | theme | Brussels theme | fixed |
| P21 | Flight search options row and button | 16 px regular; checkbox 1 px border, 2 px radius; button 18 / 22 px regular, 6 px radius | the trip type 16 px bold, the travellers and nonstop 14 px bold; 2 px border; button bold | theme | Brussels theme | fixed |
| P22 | Flight search labels | en "Economy, 1 traveller"; fr "Economy, 1 Voyageur", "Départ - retour", "Rechercher" | "Economy, 1 Traveller"; "Economy, 1 passager", "Aller - Retour", "Rechercher des vols" | document | lh-brussels documents | fixed: the block's label rows on be/en and be/fr/homepage |
| P23 | Phones, fr: "Vols directs uniquement" | on its own line under the travellers | wraps to two lines beside them | theme | Brussels theme | fixed (brief 388): on fr phones the nonstop choice on its own line, 30 px under the travellers; en keeps one row |
| P24 | Travellers panel | a modal: tabs Travel details / Redeem miles, a travel class select, steppers, "Alternative fare selection" (three radios), an access code field, Continue; Redeem miles: a headline, Cash & Miles ("Continue with login", "Become a member") and Book Award Flights ("Search award flights") | lh-com's dropdown: steppers, a class select, Done | shared code | flight search group variant (travellers-dialog.js, travellers-miles.js; Brussels, SWISS, Austrian) | fixed: the window in brief 388; the Redeem miles tab after it (capture redeem-miles-001): "Continue with login" to the replica's /be/<ll>/profile/login (Travel ID returns only to www), "Become a member" to brusselsairlines.miles-and-more.com's row/<ll> enrolment, "Search award flights" to miles-and-more.com/be/en (every language, as www). On be/fr www's "Devenir membre" goes to /content/sn/gc/fr (an internal path, broken): here the French enrolment page. The access code hands off as universalCode, the name of www's form field, only when filled |
| P25 | Contact | "Is there a topic missing?" (18 px bold), a 14 px note ("Please note that your feedback will not be answered…"), Yes / No as a square segmented control, 48 px high, sn-blue-3 | none | document, theme | lh-brussels documents; Brussels theme | fixed: the feedback block (ema-adobe's, brief 380) on be/en and be/fr/contact with www's texts; its Brussels look in the theme. Render-only, as on SWISS: nothing is sent |
| P26 | Copy column on content pages | the content of www's second sidebar (upgrades: "How can I acquire" to "Good to know") and connecting-africa's whole page in a 927 px column at 1440; the other pages' sidebars hold only the title and intro | the first section 938 px (columns-media sidebar), the rest 1264 px | document, theme | lh-brussels documents; Brussels theme | fixed (brief 388): section style `sidebar` (938 px from 768 px, as the columns-media sidebar) on be/en and be/fr upgrades (its second part) and connecting-africa |
| P27 | Homepage conditions | the footer disclaimer after the icon tiles: the prices note and "General Conditions", a link that opens the text in a dialog | the note, the title and the full text under the destination finder | document | lh-brussels documents; a dialog link is lh-com shared code | the place fixed (brief 388): its own section after the icon tiles on be/en and be/fr. Fixed (brief 416, documents only: scripts/fragment-dialog.js of 392 opens a /modals/ link as a dialog on every brand): the text in /be/en/modals/general-conditions and /be/fr/modals/general-conditions ("General Conditions", "Conditions générales"; noindex), the homepages' section the prices note and a link to it; uploaded and previewed (the modals first; tools/reports/brussels/conditions-preview-paths.txt), the allowlist names the two. On main--lh-brussels--moved-permanently.aem.page at 1440 and 390, en and fr: the link opens the dialog (800 px at 1440, 352 at 390), named by its heading, the focus on Close / Fermer, back on the link after Escape, no sideways scroll. The other 96 Brussels homepages have the prices note only, no conditions (DA read 2026-11-06). Rollback: the homepages' DA versions before (the text paragraph back), the modals deleted (the user's) |
| P28 | Footer | — | the same (links, columns, social icons, legal row) | — | — | no change |
| P29 | be/fr | the same layout, longer labels | the same as be/en after the fixes | — | — | checked at 390: the homepage, the menu, the breadcrumb ("Accueil"), the flight search labels |

## Accessibility (2026-11-05)

How it was checked, on brussels.turnsthe.page (the published site, main's code):

- **axe-core 4.10.2** (the npm tarball, its sha512 checked against the registry): WCAG 2.0, 2.1 and
  2.2 A and AA, at 390 x 844 and 1440 x 900, on the 22 pages above.
  - The page was scrolled through and settled.
  - First run (its consent click blocked by the showcase notice, so the OneTrust banner stayed
    open): only A1.
  - Second run, the consent stored, after ema-adobe's 87f5d985: no violations on the 22 pages at
    either width.
  - With the OneTrust banner open (both homepages): nothing more.
- **Keyboard pass, both homepages at both widths:**
  - the Tab order from the top, each stop's name and ring;
  - the menu: Enter opens it, the focus goes in, Tab through it, Escape and the close button
    close it;
  - the flight search: its fields, the travellers panel (Enter, Tab, Escape), the date fields;
  - the alert strip: none on the day (no alert in the Message Center for `sn`).

Every focus stop has a visible ring and a name.

| # | Finding | WCAG | Pages, widths | State | Owner |
| --- | --- | --- | --- | --- | --- |
| A1 | Carousel dots 8 x 8px: the homepages' card carousel (`carousel-cards-dot`, 6) and the Lyon article's image carousel (`carousel-images-dot`, 30) | 2.5.8 | both homepages and both Lyon articles, 390 and 1440 | fixed by ema-adobe in 87f5d985 (brief 377, during this pass): 24 x 24px targets; the second axe run, after it, finds none | ema-adobe (shared carousel code) |
| A2 | The menu's flyout, closing, stays in the Tab order: during its 0.8 s slide-out, Tab reaches its close button and items off-screen (9 controls; Lufthansa's has 10, so every brand) | 2.4.3, 2.4.7 | both homepages, 390 and 1440 | fixed in 4e999266 (test) and d81e71f9: inert from the moment it starts closing, not inert when it opens. Checked after the push on brussels (1440), lufthansa (1440) and ita (390): Tab 100 ms after Escape lands outside the flyout; every host's smoke the same | lh-com shared code (header) |
| A3 | Phones: the travellers button and "Nonstop only" come in the Tab order before From and To, but show under the dates | 2.4.3 | both homepages, 390 | www's design, no change: the capture's DOM has the options row before the fields, as ours | — |
| A4 | The destination finder at 390: "All offers & destinations" (shown above "Conditions") comes after it in the Tab order | 2.4.3 | both homepages, 390 | fixed (brief 406, every brand): www's DOM has the link before `.recommender-footer-conditional-content` on all five brands' captures; the footer now has the controls and the link before the disclaimer and Conditions, from 768 px the notes drawn first (CSS order), as www's reversed footer | lh-com shared code (destination finder) |
| A5 | The fare teaser's route links named by the airport codes alone ("BRU WAS"): the prices, and with them the card's label ("Round trip from …"), do not load. Its request (`lh-proxy…/lhg-fare-teaser/fareteaser/recommend`) has answered 502 since 29 October; the site then uses its recorded list | 2.4.4 (with the prices missing) | both homepages | environment, no change | — |
| A6 | The airport list could not be tried by keyboard here: www.lufthansa.com's Cloudflare refuses non-browser clients and this environment (`/service/api/suggestions/airports`: 403 on the CORS preflight, from every origin), so no suggestions show. The list's keys (arrows, Enter, Escape) were checked on the other brands in brief 370 | — | — | environment, no change | — |

No accessibility finding lies in Brussels' own theme or brand-scoped variants. The parity fixes
keep the focus rings: the boxed fields show a 2 px sngrey8 ring inside the box (the dates on the
whole box), the menu's close and back buttons the default ring. The login page's booking code form
(ema-adobe's) was left as it is.

### The travellers window (brief 388, P24)

Checked open, on brussels.turnsthe.page (be/en, be/fr), swiss.turnsthe.page (ch/de) and
austrian.turnsthe.page (at/en) at 1440 and 390, after the push:

- axe-core 4.10.2 (WCAG 2.0 to 2.2 A and AA) on the dialog: no violations; color-contrast left
  undecided on four elements (the travel class box's chevron image, overlaps). Measured by hand:
  the lowest is 4.81:1 (Brussels' red link and Continue), the grey labels and hints 5.49:1 or more.
- Keyboard: Enter on the traveller line opens a modal dialog named by its tab ("Travel details");
  the focus starts on the travel class; Tab runs through the window only (the page behind is
  inert; after the last control the browser's own toolbar, as for every native modal dialog);
  Escape and the close button close it without the changes, Continue with them; the focus goes
  back to the line.

### The Redeem miles tab (after brief 388, capture redeem-miles-001)

Checked locally (main's code plus the tab, lh-brussels' and lh-swiss' preview) at 1440 and 390 on
be/en, be/fr, ch/en and ch/de against the capture's screenshots: the parts within 2 px of www's
(be/fr's window 788 px high as www's); keyboard: the right arrow opens the tab, the focused tab
shows a 2 px ring, Tab then reaches "Continue with login", "Become a member" and "Search award
flights"; axe-core 4.10.2 on the open panel: no violations (contrast left undecided on a few
items over the grid, dark text on white).

### The date fields (flight search, every brand)

www's date field (the parity captures' shadow HTML, every brand) is one readonly text input
"Departure - Return" and its "Select date" button: two stops. Ours were Chromium's native date
inputs, four stops each (day, month, year, the picker). Since 3ba047f7 each date is one stop: a
readonly field named by its label that opens the browser's calendar (Enter, Space, Alt+Down, a
click), Delete clears it; the label floats above an empty field, the date then under it. Checked
after the push on brussels (be/fr), lufthansa, swiss, austrian, ita, discover and airdolomiti
(its phone panel too) at 390 and 1440: two date stops in the search's Tab order, a ring on the
field or its box, no overlap, axe on the dates: no violations.

## Pass 2 (brussels-parity-002, offline package 2026-11-06)

The user's capture `brussels-parity-002a.tar.gz` (sha256 d81b5e3f…) and `-002b` (7c7591fd…): 58 more
pages (deeper pages of every menu section, help and contact, legal, a form page, articles, the
us/en, ke/en and fr/fr homepages; en and fr), compared at 1440 and 390 with lh-brussels' preview:
the capture's measurements (heights, headings, copy, breadcrumb) against ours, www's text (its
flattened shadow HTML between header and footer) against our pages' text, and its screenshots.
Before the fixes 75 of the 116 page-widths showed no difference; after them 83 (the rest below).
The Studio's snapshots for the re-imports: `brussels-snapshots-001` to `-012` (1504 pages, the R2
drop; no sha256 files next to them).

| # | Where | www | Ours (before) | Kind | Owner | Status |
| --- | --- | --- | --- | --- | --- | --- |
| P30 | Pages with a photo gallery (58 across the markets: the travel classes, the Belgian icons, the lounges, belgian-star-chefs, …) | picture and text rows, teaser cards, tabs, the gallery | the gallery, the rest as plain content (lh-com's fleet template, taken for the gallery, has none of the other parsers): /be/fr/travel-classes/business 15924 px high (www 6458) | import | Brussels importer | fixed (4d56b6e): the info template, the gallery spliced in from a fleet import of the page; business now as high as www's |
| P31 | Pages with tab panels of column views (38, e.g. new-destinations: Intercontinental / En Europe) | one panel at a time | both panels one under the other, as plain content (15446 px, www 4623) | import | shared import bundles | fixed: main's bundles were built before 515475be (tab panels as Tab sections); built from main's sources (upstream meanwhile) they import as tabs: 5401 px |
| P32 | Travel class pages' stage | right under the class tabs, 810 px at 1440 (16:9), 804 px on phones, the title in capitals 48 / 36 px | 350 px, 25 px below the tabs, 42 px as written | theme | Brussels theme | fixed (c5050dd) |
| P33 | Travel class pages' tabs | labels #0a1f62, the chosen one bold over a 3 px red line | grey labels, a black line | theme | Brussels theme | fixed (c5050dd) |
| P34 | Gift card (/be/en/book-a-flight/flightvoucher): "Your Gift Card" | each card's icon, title, text and button | icon and title only | import | lh-com's cards-icon-text parser (ema-cashub) | fixed in the parser in 6b3c3df9 (test/cards-icon-text-partner.test.mjs): each card's icon, title, text and button; the documents re-imported since (be/en, be/fr, be/nl, de/de, es/es, it/it checked on preview, the brief after 467) |
| P35 | Children travelling alone (fr): "Un formulaire supplémentaire devant être rempli…" | the list item's text around its link | the link alone | import | lh-com's accordion parser (ema-cashub) | fixed in the parser in 6b3c3df9 (test/accordion-columns-list-text.test.mjs): the list item's text around its link; the six languages' documents have it on preview (checked in the brief after 467) |
| P36 | Problems with your baggage (fr): its three tabs (accordions in each) | one tab at a time | the three one under the other (3617 px, www 2619) | import | lh-com's sections transformer (ema-cashub) | fixed in the transformer in 6b3c3df9 (test/importer-tab-sections.test.mjs): a tab control whose panels hold accordions becomes Tab sections; the 24 captured pages with it (problems-with-your-baggage, carry-on-baggage, brussels-airport-lounges, climate-protection-projects in 6 languages) import with 2 or 3 Tab sections now, their documents still have none: tools/reports/brussels/reimport-after-467.txt |
| P37 | Travel regulations (en) | six picture and text rows | not imported as rows (7077 px, www 4354) | import | lh-com's columns-media selectors (ema-cashub) | fixed in the info template in 6b3c3df9 (test/legal-accordions.test.mjs): the picture and text items as columns-media rows, two a row; the document on preview has them (3481 px at 1440, www 4354; 7077 before), checked in the brief after 467 |
| P38 | www's newer text | our-company "reste toujours", the class pages' stage text, the fr/fr and ke/en homepages' stage and teasers ("Jusqu'à -50 % pour les enfants", Laponie) | the Studio's snapshot of 2026-10-31 | document | the user (a new snapshot) | open: not in the snapshots; a re-import needs a newer capture. brussels-snapshots-013 (brief 442) holds 36 other pages (the replica's 404 gap), none of these. Pages a capture needs: /be/fr/our-company, /be/en/travel-classes/economy, /be/fr/travel-classes/business, /be/fr/travel-classes/premium-economy, /fr/fr (homepage), /ke/en (homepage) Brief 443: fixed with brussels-snapshots-014 (the ten pages re-imported, uploaded and previewed): our-company's "46 avions" and "reste toujours", the class pages' stage texts, fr/fr's "Jusqu'à -50 % pour les enfants" and Laponie, ke/en's "Up to 50% off for kids", as brussels-parity-003. www's stage there is now "tall" (inspiration-teaser-tall, no longer narrow): the Brussels theme gives every stage's title www's look (white, capitals, 48 / 52.8 px, 36 / 39.6 px on phones; the business title was red, 42 px). Against parity-003 at 1440 and 390 (local dev server with the code): the four pages without differences; fr/fr at 1440 lacks only www's destination finder's status line ("Les offres pour Aller-retour sont affichées", the shared block's) |
| P39 | Our destinations, Cancel and refund requests | the destination finder's list (32059 px), the chat assistant "Charlie" | the finder without results, no chat | environment | — | environment, no change (the services behind them) |
| P40 | Beobank Mastercard (fr): the title | #1a1a1a | Brussels red (P1) | theme | Brussels theme | fixed: www's h1 takes its look from the heading style its author chose (h1.headline.heading-medium here: 36 px, #1a1a1a; heading-large, 48 px Brussels red, on the 51 other captured pages with a title). The document already has it ({heading-medium}); the theme made every h1 red. Red now only for titles without a smaller style. Locally with lh-brussels' preview content: 1440 #1a1a1a 36 / 39.6 px (www the same), 390 28.1 / 30.9 px (www 28 / 30.8); baggage's title still red |
| P41 | Online check-in options (fr), Our payment methods (fr), the articles hub (fr) | 4617, 3752, 4740 px | 7031, 2674, 10862 px | import / document | lh-com (ema-cashub) / Brussels | online check-in options fixed, 2ff55ae2 (test/app-entry-teaser-cards.test.mjs): the app-entry template maps www's four-column teaser cards to carousel-cards as info does; imported from the be/fr snapshot: carousel-cards (grid, four-up); the 6 captured language versions to re-import (reimport-after-467.txt; /nl/nl has no snapshot). Payment methods: every passage there, accordion included (shorter because the accordion is closed and the picture rows lower); not ours to fix. The articles hub: lists more articles than www's first page; www's newest, Milan, is not imported (needs a newer capture; brussels-snapshots-013, brief 442: not in it). Pages a capture needs: /be/fr/articles and /be/fr/articles/milan-citytrip (and, to keep both hubs alike, /be/en/articles with its Milan article) Brief 443: the Milan articles (/be/fr and /be/en/articles/milan-citytrip) imported from brussels-snapshots-014, uploaded and previewed (as parity-003 at 1440 and 390); the hubs (blog-overview) list the articles of the site's query index, so Milan shows there once the two articles are published and indexed |
| P42 | Our destinations (be/en, be/fr): the page title | "Best offers" / "Meilleures offres", h1 48 px Brussels red (the finder's own maui-headline) | no h1 (axe page-has-heading-one) | import | Brussels importer | fixed: the be/en and be/fr captures have the finder unrendered, so the import had no title (es/es, rendered, has it). brussels-import.mjs withFinderTitle gives a finder page without an h1 www's title in its language; added to DA's current copies (nothing else changed), uploaded and previewed: 1440 y 182, 53 px high (www 186, 53), 390 y 196, 40 px (www 216, 40). be/nl and it/it our-destinations still have none: no capture shows the Dutch or Italian label |
| P43 | Photo galleries in their section (/be/fr/travel-classes/business, premium-economy, 57 pages of the site) | the preview the content's width (about 1,250 px at 1440) | half width from 768 px (622 px at 1440; lufthansa.com's .col-md-6 slideshow): business 5960 / 6458 px, premium-economy 4248 / 4620 px | block / import | Brussels importer, carousel-lightbox | fixed (brief after 471, the parity sweep `tools/reports/parity-2026-11-08/sweep-austrian-brussels.md`): the carousel-lightbox parser gives a brusselsairlines.com slideshow outside a column view option wide, the full width from 768 px (test/brussels-gallery-wide.test.mjs; lufthansa.com's slideshows keep half); measured with the rule injected on brussels.turnsthe.page: 6321 and 4609 px. 51 documents to re-import (`tools/reports/parity-2026-11-08/reimport-brussels-galleries.txt`; the 6 trident pages of the 57 have no carousel-lightbox) |
| P44 | /be/fr/travel-classes/business at 390 (the sweep's row 9), premium-economy; every Brussels tab set below 768 px; lists in copy | the open accordion panel's content 20 px further in (maui-collapsible-item's pane 5px 20px 30px), 47 px below its header, 94 px to the next; a separator between the merged two-column rows (24 px more per row at 1440, 34 at 390), one ending a text item (the paragraph keeps its 16 px); list items 10 px apart | 8285 px at 390 (www 8976, footer top 7589 / 8127), 5960 at 1440: the content edge to edge, rows 66 px apart, list items 16 px | import / theme | Brussels importer (lufthansa-cleanup, columns-media parser: brusselsairlines.com only), Brussels theme | fixed (brief after 474, 9fd81c8a; test/brussels-separated-rows.test.mjs): the cleanup marks the column view after a default separator (data-lh-separated) and turns one that ends a text item into "{spacer-0}"; the parser gives the merged block option separated (columns-media.css: 90 px, 100 px below 768 px); the theme insets the open panel and drops li > p's margin. Measured on brussels.turnsthe.page with the rules and the re-import simulated: business 390 8872 px (-1.2 %; footer top 8176 / 8127), 1440 6438 (-0.3 %, with P43's wide gallery); premium-economy 4609 / 4620 at 1440, footer top +0.9 % at 390. The theme part is live; 4 documents to re-import (the harness's gallery re-import, 87b50477, ran before this change): `tools/reports/parity-2026-11-08/reimport-brussels-separated.txt`. The rest at 390: the footer, 133-153 px shorter on every Brussels page (www 829 / 849 px, ours 696; the footer is not mine; `tools/reports/parity-2026-11-08/sweep-austrian-brussels.md`) |

Documents re-imported, uploaded and previewed, not published: `preview-offline-2026-11-06.txt` (87;
each against DA's copy: no passage, picture or metadata row lost).
