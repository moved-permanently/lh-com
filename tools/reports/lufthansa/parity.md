# Lufthansa: lufthansa.turnsthe.page and www.lufthansa.com (brief 401)

Site lh-com, host lufthansa.turnsthe.page (it signs in through IMS on the main host, so every check
here ran on main--lh-com--moved-permanently.aem.live, which serves the same pages, or on a local
server with this branch's code and the edited documents). www is compared from the user's capture
`lufthansa-parity-001` only (taken 2026-11-05 16:45-17:00 UTC; nothing loaded from www).

Pages (15 per language, at 1440 x 900 and 390 x 844): `homepage`, `flight-search` | `flugsuche`,
`all-check-in`, `travelling-with-children` | `fliegen-mit-kindern`, `online-check-in`,
`additional-services`, `lufthansa-travel-classes` | `lufthansa-reiseklassen`, `services-on-board` |
`services-an-bord`, `articles`, `miles-and-more`, `100-years`, `100-years/campaigns`,
`help-and-contact`, `baggage` | `gepaeck`, `articles/explore-the-world/on-the-scene-sports-miami`;
the homepage states (menu, its first tab, travellers panel, "To" after one letter).

Lufthansa's theme is the default theme (styles.css, fonts.css): every brand inherits it.

## Accessibility (2026-11-05)

**How:** axe-core 4.10.2, WCAG 2.0, 2.1 and 2.2, A and AA (`wcag2a`, `wcag2aa`, `wcag21a`,
`wcag21aa`, `wcag22aa`), one page at a time, each scrolled through so lazy blocks loaded, after the
showcase notice and the cookie choice "Only necessary". Before the fixes: the 30 pages at both widths
on aem.live (60 runs). After them: the 13 changed pages at both widths on the local server (26 runs).

| # | What | Pages | Kind | Owner | Status |
| --- | --- | --- | --- | --- | --- |
| A1 | Carousel dots are 8 x 8 px targets 16 px apart (target-size, 2.5.8): carousel-cards (homepage topics, articles podcasts and authors), carousel-images (campaigns), columns-media slider ("Show image", online-check-in at 390) | 5 per language | shared (blocks/carousel-*, columns-media) | decision for the user | fixed (brief 404, the user's decision): lh-com's body is marked body.brand-lufthansa (scripts/brand.js) and added to 87f5d985's rule: 24 px targets with the 8 px dot drawn inside, 24 px apart; columns-media's slider dots ("Show image") the same for lh-com (test/lufthansa-404.test.mjs, test/carousel-dots-374.test.mjs) |
| A2 | Linked pictures without a name (link-name, 4.1.2): the Late-night check-in and Unaccompanied children cards' pictures link with alt "" (as www's, whose picture links are slot triggers) | all-check-in, travelling-with-children (en, de) | document | lh-com documents | fixed: the card's title as the alt ("Late-night check-in", "Vorabend Check-in", "Unaccompanied children", "Alleinreisende Kinder") |
| A3 | "Go to login" in the check-in form's login notice is a 20 px high target (target-size) | online-check-in | shared, brand-neutral | blocks/booking-lookup | fixed: a 24 px target, 2 px each taken from the space above (13 -> 11) and the notice's padding below (17 -> 15), so text and notice stay where they were (test/lufthansa-401.test.mjs) |
| A4 | The columns-media slider's strip scrolls at 390 but cannot be focused (scrollable-region-focusable, 2.1.1) | online-check-in | shared, brand-neutral | blocks/columns-media | fixed: below 1025 px (where it scrolls) the strip is a Tab stop, the arrow keys scroll it; from 1025 px none (test/columns-media-slider-focus.test.mjs) |

After the fixes: A2, A3 and A4 gone in every run; the only violations left are A1's dots (and, on the
local server only, `document-title` on the campaigns pages: the html-folder server leaves their title
out; aem.live serves "Campaigns | Lufthansa"). Per run results: `logs/lh/axe-*.json`,
`logs/lh/axe-local.txt` (not in git).

**Keyboard pass** (homepage, de/en, 1440 and 390, on aem.live; today's shared fixes checked, not
changed):

- **Showcase notice and cookie dialog:** the notice holds the focus at load ("I understand"); after it
  the cookie dialog takes the focus, Tab walks Privacy Policy, Cookie Policy, Imprint, Manage
  preferences, Only necessary, Accept all and wraps inside the dialog; after "Only necessary" the
  dialog closes and the focus goes back where it was before the dialogs, the page (c5c97cf).
- **Menu** (0ce56989): Enter on Menu opens it with the focus on the first tab (aria-expanded true);
  Tab goes through the four tabs, Accessible travel, Help & contact, the cart, the country button,
  Login, Close, and wraps; Enter on a tab and Tab go into its panel's links first; Escape closes it,
  the focus back on Menu (aria-expanded false).
- **Bar roles** (9f934865): the bar's cart is named "Shopping cart preview", the help and
  accessibility items by their labels.
- **Flight search:** trip type, travellers, nonstop, From, swap, To, one Tab stop per date field
  (Departure, Return, each named by its label through aria-labelledby, 3ba047f7), Find flights;
  the travellers panel opens with Enter, Tab reaches its buttons and the class select, Escape closes
  it with the focus back on its button (9b47738's dialog focus). "To" after one letter: no list, as
  on www.
- **Alert strip:** "Attention: Information on flights to Dubai" is one link, reached right after the
  bar, with the focus ring; no close button, as on www.
- Every stop has a visible ring (the fare teaser cards draw theirs on ::after, 2 px #0968f6).

## Parity rows

Kinds: **theme** (styles.css / fonts.css, every brand), **document** (the lh-com documents of de/en
and de/de), **shared** (a block every brand uses), **data** (live data or campaigns that change).

| # | Where | www.lufthansa.com | ours (before) | Kind | Owner | Status |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Pages with the digital assistant (Theme: digital-assistant: all-check-in, travelling-with-children, baggage, both languages, and every other document with that theme) | headings light (h2 / h3 at weight 300); its lh.css adds a LufthansaHead face without a weight (400) on the Bold file after the design system's 300 / 400 Light faces | every head-font weight drawn Bold (lufthansahead-digital-assistant 100-900 on the Bold file) | theme | mine (styles/fonts.css) | fixed: the assistant face 100-300 Light, 400-900 Bold, as www's font matching (test/lufthansa-401.test.mjs, test/fonts-css.test.mjs) |
| 2 | Articles: the stage | the four-panel stage (dcep-hero-banner: What the Hack, Discover Vancouver, Lufthansa Allegris, Perfect Day, each with its line and button to its tag page) above the h1 | "Loading..." (the import caught www's placeholder), no stage; the h1 693 px higher | document | mine | fixed: hero-banner with www's four panels (both languages); the h1 at 891 px as www's |
| 3 | Articles: "Sketching Serenity" / "Entspannung auf Papier" | tall picture teaser, white card: title, "Inspired by Lufthansa Allegris", text, yellow "Read article" | the picture and a heading only | document | mine | fixed: hero-campaign (card) with www's texts and primary button |
| 4 | Articles: the article list | titles LufthansaHead 36/39.6 light; the date line LufthansaHead 24/26.4 bold; descriptions 18/27; 40 px padding around each item; "571 Blog entries" (bold count) | titles 28 px drawn bold (the title link's 700); date line LufthansaText 18 bold; descriptions 16/24; no padding; "559 Results found" | shared | blog-overview (SWISS's magazine with 26 documents and Brussels use it with this look) | fixed (brief 404), lh-com only (body.brand-lufthansa, not the grid variant; SWISS's magazine and Brussels unchanged): titles LufthansaHead 36/39.6 light (28.1 at 390), 30 px below, the link not bold; date line LufthansaHead 24/26.4 bold (20.1); descriptions 18/27; the items touch, 40 px around each from 1025 px (20 px above and below on phones), the block without its side padding; the count line LufthansaHead light with the number bold, "{TOTAL} Blog entries" / "{TOTAL} Blogeinträge" authored in both documents (Results label) |
| 5 | Articles: which articles, how many | www's index | ours (559) | data | - | not a difference |
| 6 | 100 Years: the teaser cards' buttons ("Discover stories", "More about our milestones", "To the Anniversary Fleet", "To the history of the crane") | outlined secondary buttons | arrow links (cards-teaser drops the authored italic) | shared, brand-neutral | blocks/cards-teaser | fixed: an italic CTA stays a secondary button; plain and bold CTAs (TAP's, Brussels') stay arrow links (test/cards-teaser-secondary.test.mjs) |
| 7 | 100 Jahre (de/de): culinary journey, "Lufthansa Geschichten auf Reise", "Meilensteine über den Wolken" | picture and text side by side; the two as a two-up | full-width picture and text one under the other (the German import left them as default content; page 1755 px taller) | document | mine | fixed: as de/en, columns-media (padded) and the first two cards of the cards-teaser; 8372 px against www's 8635 |
| 8 | Campaigns, 1970s: "Es ist nicht der Champagner …" poster | under the text, beside "No caviar this time, thanks!" | missing | document | mine | fixed: poster 08 under the text (both languages) |
| 9 | Travelling with children: "Children's corner" / "Kinderecke" | one card in the left half of a two-column view | the card across the width (562 px picture) | document | mine | fixed: the row's empty second cell (622 px at 1440, as the other cards) |
| 10 | Footer: Star Alliance mark | "STAR ALLIANCE" and the star (maui-graphic star-alliance-logo-horizontal-transparent) | "A STAR ALLIANCE MEMBER" (the page decorates the :star-alliance: token before the footer's variant would apply) | document | mine | fixed: `:star-alliance-horizontal:` in both footers, as Austrian's |
| 11 | Menu: the cart | bar "Shopping cart preview" / "Warenkorb-Vorschau", menu "Your Cart" / "Ihr Warenkorb" | the menu read "Shopping cart preview" too (lh-com was left out: no capture of lufthansa.com's menu until now) | shared | blocks/header (header-tools.js) | fixed: lh-com in CART_TEXT_BRANDS (test/header-tool-roles.test.mjs) |
| 12 | Homepage: "Exclusive Offers & Benefits" (four small cards: Lufthansa Surprise, Gift Cards, Student Fares, Miles & More Credit Cards) | a grey band under the flight offers | none | data | - | stays out (the user's decision): a Monetate test, not authored content |
| 13 | Homepage: the hero, the deal prices, "Flight offers from Frankfurt" | Black Friday gift cards; prices; a row of destination cards | Kuala Lumpur; no prices; one placeholder card | data | - | not a difference: the campaign changes, and the fare and offer APIs do not answer this environment |
| 14 | Column-view spacing on miles-and-more, 100-years, additional-services, baggage | each column view 32 px above and below (64 px between sections) | 40 px (the h2's margin); 16-30 px less per section, -206 px on miles-and-more | document (import) | lh-com importer: column-view markers ({column-start} / {column-end}) are written for the info template only (COLUMN_MARK_TEMPLATES) | fixed where the importer would have marked (brief 404): miles-and-more (en, de) carries the {column-start} / {column-end} markers of its three column views (the fourth is the cards carousel, a block); sections now 469-470 px apart as www's (they were 16-30 px short). 100-years, additional-services and baggage: every column view there is a block (cards-teaser, hero-campaign, cards-icon), which the importer never marks, so their gaps are block spacing (rows 22, 23) |
| 15 | Online check-in at 390: the check-in form | both items ("Booking reference or ticket number", "Tour operator travel") closed | tabs, the first open with the form and the four steps (page 1690 px taller) | shared | blocks/booking-lookup | fixed (brief 404), lh-com only (Discover's captures show the same maui-tab-control-panel-responsive collapsed, but for section tabs, not this form; Austrian's capture has none): below 768 px the tabs are disclosure buttons (aria-expanded, no tab roles), both closed at first, each opening its own panel; from 768 px the tab set (test/booking-lookup-collapsible.test.mjs) |
| 16 | Online check-in at 1440: under the app band | "You can check in online…" 17 px below the band | 53 px (+36) | theme or document | mine | fixed (brief 404), brand-neutral: columns-media's slider kept its stacked 68 px under the text cell beside the pictures too; now only below 768 px (the app band 351 px instead of 419 at 1440) |
| 17 | Miles & More, "This might also interest you" at 390 | a slider, one card at a time | the three cards stacked (+446 px) | shared | carousel-cards (grid) | fixed (brief 404): carousel-cards option phone-slider (opt-in, brand-neutral code): below 1025 px the four-up carousel (one card per view on phones, the next peeking, dots), from 1025 px the grid; set on both Miles & More documents (test/carousel-cards-phone-slider.test.mjs) |
| 18 | Travellers panel | a modal: tabs "Travel details" / "Redeem miles", fare benefits, access code | lh-com's popover panel | shared | flight search (ema-cashub) | left (as Discover row 25) |
| 19 | Help & contact | the help app with its stage photo (h1 at 443 px) | the help app without the stage (h1 at 147 px) | shared | micro-frontend (ema-adobe) | left |
| 20 | Footer: the country button | "Deutschland \| English" on most pages ("Germany \| English" on the homepage) | "Germany \| English" | shared | blocks/footer | stays (the user's decision: www is not consistent) |
| 21 | Flight search page: "Miles & More Credit Card" link | the plain arrow | the external-link arrow (the link leaves lufthansa.com) | shared | cards-teaser | fixed (brief 404), lh-com only: www's teaser cards keep variant hyper (the plain arrow) also for a new tab (the only new-tab teaser CTA in the capture); its external arrow belongs to link lists |
| 22 | Smaller spacing differences: additional-services icon rows (~10 px each), travel classes (the title 40 px higher under the subnav), the Miami article (87 px less above "Our recommendations"), baggage (51 px less above "Baggage services") | | | theme / document | mine | fixed (brief 404): baggage's card titles (a {heading-small} title lost its 32 px to the card's element rule, cards-teaser, brand-neutral: the markers win as styles.css promises); travel classes (the title's section padded as www's section-content, both documents: h1 at 251 px as www's); the Miami article's related articles had no heading (row 24). Brief 407 (85b75ed6): additional-services' icon tiles 120 px at 1440 as www's (two-line labels 147), not 130 / 157: from 1025 px dcep's column view drops its items' last bottom margin (every dcep brand, so cards-icon usp brand-neutral); 390 unchanged (126 px, 156 apart as www's). Left: the Miami map's height (the capture renders no map without its script) |
| 23 | Carry-on baggage (/de/en/carry-on-baggage, /de/de/handgepaeck) | the TSA notice as a partner teaser (48 px icon left of title and text); the travel classes as a four-column view of icon link lists (26 px icons before "1 personal item"); the stowing tips 01-03 in three columns; 6,601 px at 1440 (the user's check) | the icons drawn across the column (1264 px), every class one under the other, the tips stacked: 21,029 / 22,606 px | theme, document | mine | fixed (brief 404): an icon in a default-content heading 26 px before the text, every brand (styles.css: an SVG without its own width filled the column); the TSA notice as cards-icon-text partner (one tile across the row); the classes as columns-media option link-list (www's .link-list.nav-link-list headings, two per row from 768 px); the tips as a three-cell columns-media; 8,152 px at 1440. www answered the one allowed load with 403 (headless), the capture has no such page: the components from the captured CSS and Brussels' snapshot of its carry-on page (the same components); the rest (the video, the remaining sections) not compared |
| 24 | Article pages: the related articles' heading | "Related Articles" / "Ähnliche Artikel" (maui-headline h3 at the h2 size) | the cards without a heading (the import left it out) | document | mine | fixed on the Miami article (en, de; brief 404). Brief 407: 530 de/en and 526 de/de article documents with the related articles lack the heading (the local tree; a DA sample of 12 agrees; the articles indexes list 560 / 557 articles): too many to edit here, so tools/importer/related-articles-heading.mjs (7252e82e) for the user's local harness: reads from DA, writes the changed documents and changes.tsv / changed-paths.txt to a folder, uploads nothing |
| 25 | The other brands' carry-on pages (Austrian, Brussels, SWISS: the same flattened import) | as row 23 | the heading icons fixed by row 23's theme rule; the TSA notice's icon still across the column, the classes and tips one under the other | document | the brand sites' documents (not in this brief) | fixed in the documents (brief 407): the 27 carry-on documents of Austrian (10: /<cc>/<ll>/handgepaeck), Brussels (6: .../extra-services/baggage/carry-on-baggage) and SWISS (11: /ch/<ll> and /kr/ko .../prepare/baggage/hand-baggage) as lh-com's: the TSA notice as cards-icon-text partner, the 3 + 4 classes as columns-media link-list, Brussels' tips 01-03 in three columns; read from DA first (unchanged since the user's publishing, again just before the upload), uploaded and previewed (preview-paths-407.txt of tools/reports/austrian, brussels, swiss), DA equal to local afterwards. 1440 on preview: at/en 10,467 to 7,905 px, Brussels be/fr 7,456 (be/en was 10,786), SWISS ch/de 7,304 (ch/en was 9,638); the TSA icon 48 px, not 1,264 |

Same as www (checked): the header bar, the menu's tabs, panels and additional links (but row 11),
the flight search form, the alert strip, the footer columns and legal links, the 100 Years stage and
its "100" divider, the campaigns posters' order, the Business and travel class stages, the baggage
cards, the online check-in steps.

### Documents on preview (not published)

The 11 documents of `preview-paths-401.txt` (de/en and de/de footers, all-check-in,
travelling-with-children | fliegen-mit-kindern, articles, 100-years/campaigns, and de/de 100-years)
were read from DA (unchanged since; checked again just before the upload), changed by a scratch
script, uploaded and previewed with `tools/importer/da-upload.mjs --site lh-com --content-dir
content-sites/lh-com/content`. Publishing is the user's.

Brief 404: the 10 documents of `preview-paths-404.txt` (carry-on baggage | handgepaeck,
miles-and-more, articles, lufthansa-travel-classes | lufthansa-reiseklassen, the Miami article, in
de/en and de/de) were read from DA (articles unchanged since brief 401's upload, published by the
user; checked again just before the upload), changed by scratch scripts (the column markers placed
as the importer's markColumnViews / placeColumnMarks would from the capture's column views),
uploaded and previewed with `tools/importer/da-upload.mjs --site lh-com --content-dir
content-sites/lh-com/content`. Publishing is the user's.

Brief 407: rows 22 (the icon tiles, 85b75ed6), 24 (the tool, 7252e82e: `node
tools/importer/related-articles-heading.mjs --lang en,de --out <dir>`, or `--list <paths.txt>`;
`--from <dir>` reads a folder of DA documents instead of DA) and 25 (27 documents of three brand
sites, uploaded and previewed, not published).
