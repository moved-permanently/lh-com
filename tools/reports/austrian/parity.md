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
| 26 | Contact: a stage with the help search, three columns of topics with icons, "Is there a topic missing?" (Yes, No, a note, Next), an FAQs card | the help app (micro-frontend) and the FAQ accordions | document; design | mine (feedback); the user's capture (FAQs card); lh-com (stage, topics) | feedback fixed: the feedback block with www's question, answers and note in both contact pages (www's second questionnaire page is not built; the block is render-only). The FAQs card: fixed (brief 394): www's info card in a grey band at the end of both contact pages, the picture left and a white panel with "FAQs", the line and "Go to FAQs" / "Zu den FAQs" to www's https://www.austrian.com/AT/en/footer-pages/faq and /AT/de/footer-pages/faq (the replica has no such page); columns-media option panel in Austrian's theme (test/austrian-394.test.mjs). Stage and topic columns: fixed (38fe066, brief 397): the help app renders on austrian.turnsthe.page from its own /digitalhangar/ with the OS data copies (87335767), maui-theme-os (os-fonts.css, icon.library.OS.js), X-Line b, help-center-web 4.3.2: the stage photo across the page, the search card, "Select your request" with the topics in three columns at 1440 and as full-width rows at 390 (the rules end at the screen's edge, a3ff993; their colour from the design system's maui-theme-os, as www), at/en and at/de at 390 and 1440. Compared with austrian-parity-001's contact shots (at/en, at/de at 390 and 1440, 2026-11-05; the archive's own render, nothing loaded from www): the stage, the search card, the topic list (three columns at 1440, full-width rows at 390), fonts and icons as www's. Two differences: (1) the FAQs card shows twice, the app's own (in its grey band, www's) and the document's columns-media panel section of brief 394, written while the app did not render; it needs to go from both contact documents now (lh-austrian at/en and at/de contact, the section after the feedback; the block's shows list only reaches its own section), open: the documents' owner; (2) www's questionnaire sits above the FAQs band, ours (the feedback block) below it, because the app draws its FAQs card at its end and www's questionnaire service refuses our host: open, as on ITA. The live parts (topics from the Travel ID service, the login status, www's questionnaire) refuse our host, as on SWISS, Brussels and ITA; on aem.page and localhost the module from austrian.turnsthe.page is refused (no CORS header) and the fallback stays Brief 406: the documents' own FAQs section taken out of at/en and at/de (the help app shows its FAQs card itself, so it showed twice; on preview, preview-paths-406.txt). The questionnaire stays below the help app: www puts it above the FAQs band, but that card is the help app's own (micro-frontend, ema-adobe), not our documents or theme |
| 27 | Desktop menu's Tab order (accessibility finding 1) | – | shared | lh-com shared code (one EMA, later) | fixed (0ce5698, every brand), as finding 1 |
| 28 | Font metrics | the fallback font in local screens | environment | – | not a difference: the host serves CoreSans and Portada |

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
