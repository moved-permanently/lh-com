# Austrian Airlines: austrian.turnsthe.page and www.austrian.com

Site lh-austrian, host austrian.turnsthe.page, live in 64 roots since 2026-10-31. This report
holds the accessibility pass (brief 382) and the parity rows from the capture of www.austrian.com
(`austrian-parity-001`, briefs 385 and 386). www refuses agents' browsers, so www is compared from
the capture only.

Rows: what www shows, what ours shows, kind (theme, variant, import, document, shared code,
www's design), owner and status.

## Accessibility (brief 382, 2026-11-05)

**How:** axe-core 4.10.2, WCAG 2.0, 2.1 and 2.2, A and AA (`wcag2a`, `wcag2aa`, `wcag21a`,
`wcag21aa`, `wcag22a`, `wcag22aa`), on austrian.turnsthe.page (main's code, the published
documents), at 390 and 1440, one page at a time. Each page was scrolled
through so lazy blocks loaded, after the cookie choice "Only necessary"; the cookie dialog itself
was checked on the homepages before it was closed. Plus a keyboard pass on the homepages.

**Pages** (22, at/en and at/de each):
- the homepage (`/homepage`);
- the menu's three tabs, the first page of each group: Flights (`/book/flights`), Travel
  information (`/book/overview-travel-information`), Manage (`/book/overview-manage`), Extra
  services (`/book/overview-extra-services`), Travel classes (`/fly/travel-classes`), Services on
  board (`/book/overview-services-on-board`), Inspiration (`/book/overview-inspiration`);
- the contact page (`/contact`);
- an info page (`/baggage`, `/gepaeck`) and an article
  (`/discover/inspiration/fly-with-austrian`).

### Results

- **axe:** no violations on any of the 22 pages at either width (44 runs), nor in the cookie
  dialog. Every run passed 13 rules on the page's content (main held 300 to 3,200 characters
  and up to 8 blocks), so the runs saw the pages. The one "needs review" item: the showcase
  notice's text (#1a1a1a on white) over the page, which axe cannot measure; it reads fine.
- **ema-adobe's carousel dots (87f5d985):** the homepage's card carousel dots are 24 px targets;
  the 2.5.8 finding of brief 370 is gone.
- **ema-cashub's inert flyout (d81e71f9):** the menu flyout is `inert` and hidden when closed; a
  Tab pressed while it closes goes on to the page, not into the flyout (1440 and 390).

### Keyboard pass

| Part | What happens | Status |
| --- | --- | --- |
| Showcase notice | a modal dialog, `lang="en"` on the German pages (WCAG 3.1.2 holds), the focus on its button | fine |
| Cookie dialog | a modal dialog, the focus kept in its six controls | fine |
| Skip links | "Go to navigation", "Go to main content", "Go to end of page" (German: "Zur Navigation" …) first, each with a ring | fine |
| Header | logo, the quick links, Help & contact, Login, Menu, each with a ring, in the order they show | fine |
| Menu, 390 | Enter opens it with the focus on the first tab; Enter on a tab moves the focus to its first link; Escape closes it and returns the focus to Menu | fine |
| Menu, 1440 | as at 390, but after Enter on a tab the Tab key goes through the other tabs and the bar's tools before the open panel's links | finding 1 |
| Alert strip | "Current restrictions on rail services to Vienna Airport": a link right after the header, with a ring | fine |
| Flight search | every field named (trip type, travellers, non-stop, From, To, the two dates, Search); the travellers panel opens with Enter, Tab walks its controls, Escape closes it and returns the focus | fine |
| Airport list | could not be checked from here (finding 3) | not checked |
| Fare tiles | each tile a link; the focus ring is drawn round the whole card | fine |
| Cookie choice made | the focus stays on the page's body; the next Tab starts at the skip links | finding 2 |

### Findings

| # | Finding | WCAG | Kind | Owner | Status |
| --- | --- | --- | --- | --- | --- |
| 1 | Desktop menu: the open panel's links come after the other tabs and the bar's tools in the Tab order (the panel follows them in the DOM); at 390 the focus goes into the panel | 2.4.3 (advisory) | shared code (blocks/header, every brand) | lh-com shared code | fixed (0ce5698, every brand): the open panel's links right after its tab, Shift+Tab back, Escape closes the panel (the focus on its tab), then the menu |
| 2 | After the cookie choice the focus stays on the page body instead of a named place | 2.4.3 (advisory) | shared code (the consent dialog) | lh-com shared code | fixed (c5c97cf, every brand): after a choice the focus returns where it was, or to the first skip link when the dialog opened on load |
| 3 | The airport list: from this environment www.lufthansa.com answers the airport and label calls with Cloudflare's 403 page (the browser reports a CORS failure), and a production host uses no recordings, so no list opens here | – | environment | – | not checked; brief 370's keyboard pass and the functions report found it working |

Nothing to fix in Austrian's theme (`styles/themes/austrian.css`); Austrian has no brand-scoped
block variants. www's own design found in the parity pass: rows 8 and 26 below.

## Parity (briefs 385 and 386, 2026-11-05)

### How it was compared

- **www:** the user's capture `austrian-parity-001.tar.gz` (sha256 `f59a943d…327d`, checked): the
  same 22 pages at 1440 x 900 and 390 x 844 (full-page PNGs, HTML, shadow HTML), the homepages'
  states (menu tabs, travellers, airports), www's CSS and fonts. The agent did not load www. The
  capture was served locally without its scripts (www's own `serve.py` was not run); www's maui
  components that draw only with their scripts (the divider, the feedback questionnaire, the Star
  Alliance graphic) were read from the markup, not measured.
- **Ours, before the fixes:** the preview and austrian.turnsthe.page (main's code) at both widths.
- **Ours, with the fixes:** a local dev server with the working tree's code and the preview's
  content; the changed documents first from a local folder (with the brand's metadata added in the
  browser), then on the preview after the upload. Locally Austrian's fonts answer 404 (the host
  serves them), so www's CoreSans and Portada were loaded from the capture: sizes, weights,
  colours and boxes were compared, not glyph widths.
- ema-adobe's "DEMO | Not a <brand> website" badge (brief 386) is ours and left out of the
  comparison.

Kind: **theme** = `styles/themes/austrian.css` (tokens and body.brand-austrian rules); **shared** =
lh-com's shared code, brand-neutral; **document** = the lh-austrian documents of at/en and at/de;
**data** = what the page loads from Group services; **design** = something www builds that the
replica has no block for.

| Row | What www shows | What ours shows | Kind | Owner | Status |
| --- | --- | --- | --- | --- | --- |
| 1 | Header bar 113 px (137 on phones), logo 163 x 24 (122 x 18 on phones), quick links 16/24 regular #4d4d4d tracked 0.4 px (14 px on phones), a 1 px #d1d1d1 rule | lh-com's bar: 122 px (140 on phones), bold links, its logo size | theme, shared tokens | mine | fixed (113 and 137 px measured) |
| 2 | Menu white: tabs red Portada, group headings CoreSans 24/26.4 500 (20/22 on phones), links and extras 16/24 regular #4d4d4d, #d1d1d1 rules, close and back as 28 px #4d4d4d squares | lh-com's dark flyout | theme, shared (flyout tokens) | mine | fixed |
| 3 | Header icons: www's own wheelchair, help, cart, login and globe | lh-com's icons | shared | lh-com shared code (blocks/header) | the header part fixed (9f93486, every brand): an item names its role with a marker (":austrian-cart: Your Cart {cart}"), so a brand icon keeps the cart, locale and login behaviour. www's five SVGs are not in the repo (kept locally, not committed): the icons themselves open |
| 4 | The cart item "Your Cart" / "Ihr Warenkorb" | "Shopping cart preview" / "Warenkorb-Vorschau" | document | mine | fixed in the at/en and at/de navs |
| 5 | Burger icon: www's own lines (maui list-menu: three 1 px lines, 10 of 16 units wide; each brand's www draws its own) | lh-com's 1.6 px stroke lines | theme | mine | fixed (brief 406): www's list-menu path as the button's mask, 24 px at every width (lh-com's 30 px on phones) |
| 6 | Alert strip: 16/24 regular #333 in a 50 px #f6f6f6 box (from 768 px), the search 23 px below (14 px from 768) | bold, lh-com's spacing | theme | mine | fixed |
| 7 | Flight search: boxed fields (56 px, #f6f6f6, 1 px #262626, 8 px corners, the label inside), the dates one 50 px box, the swap a 32 px #4d4d4d disc; on phones From and To one box with the swap on the line; options row #4d4d4d 16 px regular; FIND FLIGHTS in capitals 500, tracked 1.3 px; the article's tabs in capitals, the chosen one red | lh-com's underlined fields, the swap between them | theme | mine | fixed (fields 301/56 at 1440; From 384, To 439 and the swap at x 281 at 390, as www's) |
| 8 | Travellers: a modal | lh-com's popover panel | design | flight search group variant (travellers-dialog.js, travellers-miles.js) | fixed: the window (brief 388, 1050 px as www's since 2fc1d630) and its Redeem miles tab (capture redeem-miles-002): "Continue with login" to /at/en/login and /at/de/anmeldung, "Become a member" to austrian.miles-and-more.com's row/<ll> enrolment, "Search award flights" to miles-and-more.com/de/de; Austrian's look (CoreSans capital tabs with a 3 px red line, Portada headline, outlined checks, capital buttons) |
| 9 | Headings black, h2 and h3 700; the headline titles (fare teaser, flight offers) #1a1a1a 500 | lh-com's navy and light headings | theme | mine | fixed |
| 10 | Winter deals: boxed cards (150 px image left, 1 px #d1d1d1, 4 px corners), the city 18/19.8 500, the price 16 px 500 | unboxed rows | theme; data | mine; the user (prices) | fixed (layout); prices: done, checked by the user on austrian.turnsthe.page in a real browser (2026-11-05 13:2x): the fare teaser shows live prices in both languages (from Vienna: Naples 97 EUR, Los Angeles 679 EUR …) |
| 11 | Conditions labels regular, tracked 0.4 px | bold | theme | mine | fixed |
| 12 | Flight offers: chips #4d4d4d 500, the chosen one red, the origin red; offer cards with prices | lh-com's chips; empty here | theme; data | mine; the user (offers) | fixed (chips, origin); offers: done, the destination finder shows live prices in both languages (the user's check on austrian.turnsthe.page, 2026-11-05 13:2x) |
| 13 | Looking for more: white tiles (1 px #d1d1d1, 8 px corners, a soft shadow), labels 18/19.8 500 #1a1a1a, www's black icons | grey tiles, lh-com's navy icons | theme, document | mine | fixed: www's icons from the capture as `icons/austrian-{hotel,car-rental,airport-parking,tours,plus-circle}.svg`, the homepages' tiles use `:austrian-hotel:` etc. (48 x 48 on the preview) |
| 14 | The footnote and "General Conditions" below the tiles; "General Conditions" a link that opens the text | both under the flight offers; the conditions as text | document; shared | mine (position); lh-com (the link) | position fixed in both homepages. The link fixed (9b47738, scripts/fragment-dialog.js): "General Conditions" / "Allgemeine Bedingungen" opens /at/en (de)/modals/general-conditions as a dialog; on preview (tools/reports/general-conditions/preview-paths.txt) |
| 15 | Popular destinations: CoreSans 24/28 500; the contact page's FAQ accordions 18 px regular #4d4d4d | lh-com's accordion titles | theme | mine | fixed |
| 16 | Card carousels: links regular, tracked; slides with a #d1d1d1 border and soft shadow | lh-com's bold links | theme | mine | fixed |
| 16a | The carousels' current dot Austrian red | #1a1a1a (`--lh-deepblue`, Austrian's text colour) | shared | lh-com shared code (blocks/carousel-cards, ema-adobe's 24 px dots of 87f5d985) | fixed (c73f6f1): the carousels' dot tokens; Austrian's theme sets --carousel-dot-current-color #d81e05 |
| 17 | Article cards: each card ends in a link ("More about carry-on baggage" …, "Zu unseren Handgepäckbestimmungen" …) | no link rows | document | mine | fixed: the 12 cards of at/en and at/de `/discover/inspiration/fly-with-austrian` with www's link texts (16/24 regular #4d4d4d) |
| 18 | Article cards (a.teaser): copy Portada 18/27 black, titles Portada 28/30.8 (22/24.2 on phones) 21 px above it, 6 px corners, the text 31 px from the card's edge | CoreSans 16/24, titles 24 px, 4 px corners, 21 px in | theme | mine | fixed (brief 406): measured equal at 1440 and 390 on the preview of /at/en/discover/inspiration/fly-with-austrian |
| 19 | A divider above "This may also interest you": www's screen at 1440 shows a 1 px #b0b0b0 line across the content (two rows of #d7d7d7, a line between pixels; one #b0b0b0 row at 390), 95 px under the stage band (76 on phones), the heading 61 px below | the document's `{divider-25}`: a #d1d1d1 line 24 px under the band, the heading 26 px below | theme, document | mine | fixed (brief 406): the theme's divider #b0b0b0; the at/en and at/de documents `{spacer-51}`, `{spacer-18 from-768}`, `{divider-60}`: 95 / 76 px above, 61 below, measured on the preview |
| 20 | Breadcrumb 16/24 regular #4d4d4d, the current page red; the first crumb "Homepage" in both languages | lh-com's look; "Home" in de, no home crumb in en | theme, document | mine | fixed: the homepages' metadata `Breadcrumb Title` "Homepage" (de's older "Home" row removed); the preview shows "Homepage › Inspiration › Good reasons to take off with Austrian" and "Homepage › Gute Gründe mit Austrian abzuheben" |
| 21 | Footer: headings CoreSans 18/19.8 regular without a rule, links 14/21 regular, tracked | lh-com's headings with a rule | theme | mine | fixed |
| 22 | Footer: no search row | "Search for topic" / "Suche nach Thema" | document | mine | fixed: the row removed from both footers |
| 23 | Footer: the horizontal Star Alliance mark, 128 px wide | the square mark | document, theme | mine | fixed: `:star-alliance-horizontal:` in both footers, 128 x 17 |
| 24 | Footer legal links from the link columns' edge (x 409 at 1440), wrapping in two lines, one per line on phones; no rule above them nor above the badges | lh-com's legal row from the page's edge (x 88) under the badges' rule, a row on phones | theme | mine | fixed (brief 406): the legal links in the columns' grid track from 1025 px, no indent, a column on phones, no rules |
| 25 | Klarna badge's size in the payment badges: every badge 27 x 27 px, 44 px apart (Klarna's logo inside its square) | 32 px high, Klarna 75 px wide, Apple Pay 46, 48 px apart | theme | mine | fixed (brief 406): every badge 27 x 27 (object-fit contain), 17 px apart; the social icons alike |
| 26 | Contact: a stage with the help search, three columns of topics with icons, "Is there a topic missing?" (Yes, No, a note, Next), an FAQs card | the help app (micro-frontend) and the FAQ accordions | document; design | mine (feedback); the user's capture (FAQs card); lh-com (stage, topics) | feedback fixed: the feedback block with www's question, answers and note in both contact pages (www's second questionnaire page is not built; the block is render-only). The FAQs card: fixed (brief 394): www's info card in a grey band at the end of both contact pages, the picture left and a white panel with "FAQs", the line and "Go to FAQs" / "Zu den FAQs" to www's https://www.austrian.com/AT/en/footer-pages/faq and /AT/de/footer-pages/faq (the replica has no such page); columns-media option panel in Austrian's theme (test/austrian-394.test.mjs). Stage and topic columns: fixed (38fe066, brief 397): the help app renders on austrian.turnsthe.page from its own /digitalhangar/ with the OS data copies (87335767), maui-theme-os (os-fonts.css, icon.library.OS.js), X-Line b, help-center-web 4.3.2: the stage photo across the page, the search card, "Select your request" with the topics in three columns at 1440 and as full-width rows at 390 (the rules end at the screen's edge, a3ff993; their colour from the design system's maui-theme-os, as www), at/en and at/de at 390 and 1440. Compared with austrian-parity-001's contact shots (at/en, at/de at 390 and 1440, 2026-11-05; the archive's own render, nothing loaded from www): the stage, the search card, the topic list (three columns at 1440, full-width rows at 390), fonts and icons as www's. Two differences: (1) the FAQs card shows twice, the app's own (in its grey band, www's) and the document's columns-media panel section of brief 394, written while the app did not render; it needs to go from both contact documents now (lh-austrian at/en and at/de contact, the section after the feedback; the block's shows list only reaches its own section), open: the documents' owner; since gone (brief 419: neither contact document carries the panel section in DA, on preview or live, read 2026-11-06; the app's own FAQs card shows once); (2) www's questionnaire sits above the FAQs band, ours (the feedback block) below it, because the app draws its FAQs card at its end and www's questionnaire service refuses our host: open, as on ITA. The live parts (topics from the Travel ID service, the login status, www's questionnaire) refuse our host, as on SWISS, Brussels and ITA; on aem.page and localhost the module from austrian.turnsthe.page is refused (no CORS header) and the fallback stays Brief 406: the documents' own FAQs section taken out of at/en and at/de (the help app shows its FAQs card itself, so it showed twice; on preview, preview-paths-406.txt). The questionnaire stays below the help app: www puts it above the FAQs band, but that card is the help app's own (micro-frontend, ema-adobe), not our documents or theme |
| 27 | Desktop menu's Tab order (accessibility finding 1) | – | shared | lh-com shared code (one EMA, later) | fixed (0ce5698, every brand), as finding 1 |
| 28 | Font metrics | the fallback font in local screens | environment | – | the host serves CoreSans and Portada; but 213 documents' headings did not use Portada (row 29) |
| 29 | Headings (every page with www's digital assistant: 213 documents) | Portada | LufthansaHead: lh-com's cleanup gives these pages "Theme: digital-assistant", and styles.css set lufthansa.com's assistant face over the theme's heading font | shared | lh-com shared code | fixed (71cbf543, brand-neutral: the rule is lufthansa.com's only; Brussels' 467 and SWISS's 22 such documents get their own faces back too) |
| 30 | Pages with the check-in entry or the timetable (/at/en/online-check-in, /at/de/flugstatus-und-flugplan; 39 documents in all markets) | the four-column steps, the accordion, the Travel ID columns, the card row | only the booking-lookup / flight status, the rest as text: lh-com's app-entry and flight-status templates map lufthansa.com's hub pages | import | mine | fixed (663b69a0): two Austrian templates, info's mappings plus that block (tools/importer/austrian-templates.mjs); the two captured pages re-imported |
| 31 | Teaser cards' link line ("→ Zur Reisevorbereitung") | shown under the description | missing: the parser drops .teaser-link-text (hidden on lufthansa.com) | import | mine | fixed (663b69a0): Austrian's import marks its cards, the parser keeps a marked card's line |
| 32 | Two-column teaser rows (/at/de/familien, /at/de/check-in, extra-services) | two cards a row (624 px) | three a row (406 px) | import | mine | fixed (663b69a0): the converted views marked two-up |
| 33 | The intro under the title (p.copytext-large, 200 times on at/en and at/de) | Portada 18 / 27 | CoreSans 16 / 24: lh-com's cleanup marks copytext-large only with a link | import, theme | mine | fixed (663b69a0): the Austrian import writes the marker, the theme sets it; in the re-imported documents |
| 34 | Default h3 / h4 (www's heading-copytext-large: "Find your booking", "Gegenmaßnahmen") | CoreSans 500, 16 / 17.6 on phones, 18 / 19.8 from 1025 px | Portada 700 20-24 px | theme | mine | fixed (663b69a0) |
| 35 | Lists | items 5 px apart | 34 px (the item's 10 plus its paragraph's 24) | theme | mine | fixed (663b69a0) |
| 36 | Steps in a tab panel (/at/de/missing-baggage: four numbered columns in the first tab) | four columns | stacked, one column | import | mine | fixed (brief 438): the tab panel's bare wrapper unwrapped in the import (withPanelWrappersUnwrapped), the steps a four-column columns-media at 1440 as www (4561 / 4604 px), stacked at 390 as www; re-imported, uploaded and previewed |
| 37 | /at/en/fly/on-board/culinary-services: the stage and the expanding three-panel teaser ("Little treats. Great delight.", Economy / Premium Economy / Business) | a full-bleed stage picture, three panels side by side that widen on hover | the stage in the content's width, the panels as three stacked pictures | design | mine | fixed (brief 444): www's .herobanner is the component lh-com's hero-banner block was built for; the import maps it (template austrian-hero-banner: info plus hub's hero-banner), the theme sets www's headline (48 / 50 below 1025 px), button gap and tab labels; 720 px at 1440 (panes 1029 / 206 / 206, www 1028 / 206 / 206), 760 at 390x844 (543 / 109 / 109); the page 8244 / 8791 px, www 8422 / 9166; re-imported, uploaded and previewed |
| 38 | /at/de/angebote-destinationen (32,933 px), /at/en/book/flights/new-destinations | www's offers and destinations app (the list of every route), the destinations' maps in accordions | a link to the app on www; the maps as poi-map blocks | live / data | – | as before: the offers list is www's app (a link out) |
| 39 | /at/en/austrian-app: QR code and store badge pairs | 56 px QR codes beside small badges, two pairs side by side | each picture full width, stacked (+1,438 px) | import | mine | fixed (brief 438): a one-column view nested in a one-column view's item unwrapped in the import (withNestedOnecolumnUnwrapped), so the QR / badge pair is a two-column columns-media (two pictures side by side at 1440, stacked at 390 as www); the tab panels text beside picture as www; 5266 / 5360 px at 1440 (6797 before); re-imported, uploaded and previewed |
| 40 | /at/en/book/flights/giftvoucher: "How does it work?" | three icon steps in a slider (40 px icons) on phones, a row from 768 px | cards with full-width icons (+1,779 px at 390) | import, design | mine | fixed (brief 438): the partner teasers out of www's carousel in the import (withPartnerCarousels), cards-icon-text partner rows (32 px icons beside the titles) with the section title kept, the copy Portada 18 / 27 (theme); 3773 / 4066 px at 1440, 5474 / 5756 at 390 (4192 / 7685 before); re-imported, uploaded and previewed |
| 41 | /at/de/bearbeitungsgebuehren: the card row | in a grey band | on white | import | mine | fixed (brief 438): the band was grey already; the three cards a row from 1025 px though one has no picture (theme: a grid mixing picture and text-only cards keeps three), a one-card slider below 1025 px as www (the import marks a column view with www's .hidden-lg-up swiper copy, the carousel-cards parser adds phone-slider); 3139 / 3141 px at 1440, 4090 / 4125 at 390 (3785 / 5051 before); re-imported, uploaded and previewed |
| 42 | /at/de/culinaryjourney, /at/en/book/flights/new-destinations | – | not re-imported: today's import would drop the culinary hub's micro-frontend block (added to DA outside this importer) and new-destinations' two poi maps (they sit in accordion items; the accordion parser keeps them inside now) | import | mine (culinaryjourney), lh-com's accordion parser (new-destinations) | fixed (brief 444): culinaryjourney's hub on lh-com's mfe template (micro-frontend culinary-hub), no link-out; new-destinations' accordion split before each item with a map, the map a poi-map block of its own with its points (austrian-poi-points.json), the open items open-first as www; both re-imported (20 documents, nothing lost against DA), uploaded and previewed |
| 43 | Tab sets whose panels hold a grey band (/at/de/missing-baggage, travelling-with-animals, unterhaltung-an-bord, austrian-app) | – | re-imported today, the band's section lost its Tab and Tabs rows (lh-com's lufthansa-sections.js now makes Tab sections itself, 515475be, besides Austrian's own markers), so everything after the band showed under every tab (+2,600 to +7,900 px) | import | lh-com's sections transformer (ema-cashub) with Austrian's tab markers (mine) | fixed (brief 444): lufthansa-sections.js gives a break inside a tab panel the panel's Tab (lh-com's own panels and the marked ones, with Tabs), and a marked panel that holds a break ends at the next marker; withTabRuns removed. The four tab pages import as DA has them |
| 44 | /at/en/homepage, /at/de/homepage: the fare teaser's title ("Winter deals", "Winterangebote") | www's maui-headline format heading-xl: Portada 500, 36 / 39.6 px at 1440 (28 / 30.8 at 390), 20 px above the fares | the theme's default h3, CoreSans 500 18 px, 30 px above | theme | mine | fixed (brief after 471, the parity sweep `tools/reports/parity-2026-11-08/sweep-austrian-brussels.md`): the theme sets the fare-teaser section's last heading as www's (test/austrian-fare-teaser-heading.test.mjs); CSS only, no document changes. The homepages' remaining -8 to -10 % are www's live alert strip, the changed stage campaign and the offers that did not load (the sweep file) |
| 45 | The page title on every Austrian content page; fly-with-austrian's card grid | the title (.contentpage h1.heading-large) 36 px above the content, 60 px from 1281 px; the card rows (column views) 32 px below the intro and above the next content | 32 to 40 px; the grid 24 px under the intro, 24 px over "Book your next trip" | theme | mine | fixed (brief after 474; test/austrian-title-cards-spacing.test.mjs): measured on austrian.turnsthe.page with the rules injected, footer top against www at 1440: special-requirements -132 to -112 px, overview-manage -65 to -45, extra-services -29 to -9, fly/travel-classes -19 to +1, services-on-board -43 to -23, overview-inspiration -45 to -25, fly-with-austrian -235 to -159; book/flights +15 to +35 and overview-travel-information 0 to +20 (their first component already sat lower than www's); at 390 +4 px each. CSS only |
| 46 | Intro paragraphs (p.copytext-large) on 1,175 Austrian documents, e.g. fly-with-austrian | Portada 18 / 27 | CoreSans 16 / 24: the documents carry no "{copytext-large}" (imported before withCopytextLarge, 663b69a0, or carried over by a later pass); fly-with-austrian also without its phone slider at 390 (+438 px) | document | mine (re-import) | open: a re-import with main's importer marks them (checked on fly-with-austrian and airbus-a320-200 in a scratch import); list in two parts `tools/reports/parity-2026-11-08/reimport-austrian-intro.txt` (A 636 imported before the marker; B 539 from later passes on DA). fly-with-austrian 1440 after 45 and the re-import: about -126 px, of which 72 px the page end (flight-search.css drops the section margin, not mine; `tools/reports/parity-2026-11-08/sweep-austrian-brussels.md`) |
| 47 | fly-with-austrian 1440 (and every Austrian section with blocks after a standalone flight search) | the last cards 72 px above the footer; a section that goes on after the search keeps its gap | the cards on the footer: flight-search.css drops the margin of any section with a standalone search from 768 px | theme | mine (the user chose Austrian only) | fixed (brief after 475, 573b5547 and 769cf7b9; test/flight-search-section-gap.test.mjs): the Austrian theme gives such a section its 40 px (not after a lone separator), and a grid ending the last section the column view's 32 px; measured with the rules on austrian.turnsthe.page: 72 px (www 72). flight-search.css unchanged, so lufthansa.com, ITA, Brussels, SWISS and TAP stay as they are |
| 48 | fly-with-austrian 390: the reason cards | stacked (only "This may also interest you" is a phone slider), 68 px apart, the next three-column view 77 px below | stacked 40 px apart, 64 px between the grids; the last grid stacked too (the document predates the phone slider) | theme / document | mine | fixed (brief after 475, 207f6234; test/austrian-stacked-cards.test.mjs): stacked grid cards 68 px apart below 768 px, the next grid 77 px; the titles within 7 px of www's pitch. The last grid: a re-import (the importer already marks it phone-slider), the 10 fly-with-austrian documents in `tools/reports/parity-2026-11-08/reimport-austrian-fly-with-austrian.txt` (re-imported and previewed by the harness with reimport-austrian-intro.txt part A, d80aa805; not published) |
| 49 | The intro paragraph (p.copytext-large, "{copytext-large}" in the 609 documents of round 74) | Portada 400 18 / 27 px at 1440 and 390, letter spacing 0.19 px | the same size and line height (the theme rule since 663b69a0; checked on 9 live pages at both widths), letter spacing 0.05 px | theme | mine | fixed (brief after 479; test/austrian-intro-letter-spacing.test.mjs): www's 0.19 px. The size was already www's: nothing to republish |
| 50 | online-check-in's end (the nine documents with option steps; standing order 14, against austrian-parity-017's full-page screenshots scanned row by row: the offline render cannot rebuild the maui components) | the FAQ button 84 px over "Experience a seamless travel experience with Travel ID"; the Travel ID row 140 px over the divider line at 1440, 122 at 390 | 34 (the H2's 32 over the button's 24); 48 / 51 (the section's 48) | theme | ema-cashub | done: the H2 82 px under the button, the divider section 140 px under the steps section from 1025 px, 119 below (scoped to sections with a steps row). at/en 1440 4,298 -> 4,440 (www 4,477; -4.00 -> -0.83 %), 390 5,591 -> 5,712 (www 5,846; -4.36 -> -2.29 %: the rest is the card carousel's end on phones, every page's); at/de and jp/ja the same +142 / +121. The "Austrian App" heading is www's since standing order 8 (size and both gaps, checked on the screenshots). No document change |
| 51 | A column view's title (our Columns Media text column h3: entryregulations, travel-id, doctor-on-board, the Schengen page, austrian-app and four more; 18 of austrian-parity-015's h3s) | www's maui headline heading-small: Portada 700, 28 / 30.8 px with 36 px under it from 1025 px, 22 / 24.2 with 24 on phones | the default h3, CoreSans 500 18 / 19.8 with 32 | theme | ema-cashub | done (standing order 15): the 122 recorded widths, homepages aside (their destination finder's empty state, www's APIs refused): 10 closer, 2 further; entryregulations 1440 -4.51 -> -3.97 %, 390 -4.26 -> -3.90, doctor-on-board 390 -3.55 -> -2.80, the Schengen page 390 -2.52 -> -2.20; travel-id 1440 +6.77 -> +7.30 (too tall elsewhere). The numbered steps keep their rule. No document change |
| 52 | "This may also interest you" (a divider section's heading over a card carousel: entryregulations, sustainable-flying, doctor-on-board, online-check-in) | heading-small: 28 / 30.8 px with 36 under it from 1025 px, 22 / 24.2 with 24 on phones (the homepages' "Discover Austrian" heading-medium, 51 recordings) | heading-medium | theme | ema-cashub | done (standing order 15, with 53; numbers under 53) |
| 53 | A phone slider's dots (the card carousels at 390; www's screenshots, entryregulations) | 67 px under the cards, 82 over what follows | 23 and 56 | code (blocks/carousel-cards/carousel-cards.css, brand-scoped, since 55714cf3: a theme sets dot tokens only; the drawn dot unchanged) | ema-cashub | done (standing order 15, with 52): the 122 widths, homepages aside: 5 closer, 4 further by at most 0.11 points; doctor-on-board 390 -2.80 -> -1.60 %, travel-id 390 -4.16 -> -3.52, online-check-in 390 -2.19 -> -1.63, entryregulations 390 -3.90 -> -3.44, accessible-travel 390 -7.07 -> -6.85. No document change |
| 54 | A padded column view after a block or text (Columns Media option padded: entryregulations, culinary-services, bangkok-airways, travel-id) | lower: entryregulations' titles 489 px apart across the boundary at 390 (446 within a block), 102 px from a column's last line to the first picture at 1440; culinary's hero text to it 99 | the option's 32 px (lufthansa.com's 3.2rem): 439 / 59 / 56 | theme (82 px on phones, 75 from 1025 px; after a heading as before; not in a section with a separator style above) | ema-cashub | done (standing order 15): the 122 widths, homepages aside: 7 closer, 1 further; bangkok-airways 1440 -11.84 -> -10.68 %, 390 -6.84 -> -5.76, entryregulations 1440 -4.06 -> -3.29, 390 -3.44 -> -2.75, culinary-services 1440 -1.85 -> -1.34, 390 -2.43 -> -1.89, travel-id 390 -3.52 -> -2.79; travel-id 1440 +7.30 -> +8.05 (too tall elsewhere). A first version without the separator exception made austrian-app 1.41 points worse. No document change |
| 55 | A tab panel of text and a picture (travel-id's "Website", "Chat assistant", "App", "FlyNet"; standing order 16, item 2) | from 1025 px www's two-column view: the text 622 px wide on the left, the picture beside it, both from the top; the heading heading-small | the picture full width under the text (+468 px in the stretch at 1440) | theme (from 1025 px; phones as before) | ema-cashub | done (standing order 16): travel-id 1440 6,174 -> 5,733 px (www 5,714; +8.05 -> +0.33 %); the other 121 recorded widths unchanged. No document change |

### Documents on preview (not published)

The ten documents of `preview-paths.txt` were uploaded to DA (lh-austrian) and previewed on
main--lh-austrian--moved-permanently.aem.page with `tools/importer/da-upload.mjs --site
lh-austrian`; the preview's text matches the local documents (the metadata moves into the head).
Publishing is the user's.

Correction (brief 394): the uploads of `/at/en/nav` and `/at/de/nav` were built on local copies older
than DA and put "My flights" back to www's `/deeplink/cockpit`, undoing 369/373's `/at/en/login` and
`/at/de/anmeldung`; the user fixed both in DA before publishing. Since then each document is read
from DA before an edit and checked unchanged just before the upload.

Brief 394: `/at/en/contact` and `/at/de/contact` (the FAQs card, row 26) read from DA, uploaded and
previewed, not published (`preview-paths-394.txt`).

### Commits

- e849a467: the theme rows, www's five tile icons, `test/austrian-parity-386.test.mjs`, these rows,
  `preview-paths.txt` and lh-austrian's upload state.
- The commit after it: the Star Alliance mark's ratio (aem.js gives icon images 16 x 16, so the
  lazy image held a 128 px square on the preview until it loaded) and this section.

### Checked after the push (e849a467)

- **main--lh-austrian--moved-permanently.aem.page** (main's code, the changed documents) and
  **austrian.turnsthe.page** (main's code, the published documents) at 1440 and 390: the bar
  113 / 137 px, the logo 163 x 24 / 122 x 18, From 56 px high with the swap at x 383 / 281, CoreSans
  and Portada loaded from the site's host. The preview also shows the changed documents: the tiles'
  icons 48 x 48, the article's 12 card links, "Homepage" first in the breadcrumb, "Your Cart" /
  "Ihr Warenkorb". austrian.turnsthe.page still shows the published documents (the old cart label,
  "Home", the square Star Alliance mark) until they are published.
- **The other brands** (swiss, brussels, ita, tap, discover, airdolomiti, cargo, b2b and
  lufthansa.turnsthe.page/de/en/homepage, 1440): each its own brand class, Austrian's theme not
  loaded, header, blocks and footer rendered, no page errors. One "failed to load module for
  footer" on swiss and discover on the first load did not come back on the next two loads (both
  footers loaded); the commit touched no footer code. lufthansa.turnsthe.page's root redirects to
  www.lufthansa.com, so lh-com was checked on /de/en/homepage.

## Parity, deeper pages (austrian-parity-002, offline package 2026-11-06)

- **www:** the user's capture `austrian-parity-002a.tar.gz` (sha256 `ea26c50e…9527`) and
  `austrian-parity-002b.tar.gz` (sha256 `a79e58fa…3454`), both checked: 31 and 29 other pages
  (deeper menu pages, help and contact subpages, legal, forms, article-like pages, /de/de and /ch/en
  homepages), one load each, 1440 then 390. Served locally without its scripts (not its own
  `serve.py`); www not loaded.
- **Ours:** austrian.turnsthe.page and main--lh-austrian--moved-permanently.aem.page (equal before
  the changes), every page at both widths; heights, the measured type and side-by-side screenshots.
- Rows 29-43 above. Documents: 42 of the 60 re-imported from the Austrian snapshots
  (`tools/importer/bd-snapshots/www.austrian.com`), uploaded and previewed, not published
  (`preview-paths-002.txt`); 12 came out unchanged; culinaryjourney and new-destinations kept as DA
  has them (row 42); four tab pages uploaded, then restored to their versions before (row 43).

## Accessibility, deeper pages (offline package 2026-11-06, item 5)

axe on the 60 pages of austrian-parity-002 on main--lh-austrian--moved-permanently.aem.page at 1440 and
390: link-name on 7 pages (linked teaser pictures without alt text: fixed brand-neutrally in
columns-media, 6 pages clean; /at/de/lhg-staralliance-partner's airline logos: alt texts since brief 438,
5616b6ef, 0 linked pictures without one on the preview of at/de and at/en); target-size of the bar's logo link
at 390 (122 x 18 px, www's size): fixed in the brief after 462 (70d0f480), a 24 px target, the logo where it was. Details in
`tools/reports/offline-2026-11-06/ema-test.md`, item 5.
