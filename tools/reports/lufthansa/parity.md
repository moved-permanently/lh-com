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
| A1 | Carousel dots are 8 x 8 px targets 16 px apart (target-size, 2.5.8): carousel-cards (homepage topics, articles podcasts and authors), carousel-images (campaigns), columns-media slider ("Show image", online-check-in at 390) | 5 per language | shared (blocks/carousel-*, columns-media) | decision for the user | open: www's dots are the same 8 x 8 px, 16 px apart (swiper bullets, capture); 87f5d985 (brief 374) gave SWISS, Austrian, ITA, Brussels, Discover and Cargo 24 px targets with the 8 px dot drawn inside and kept lh-com, TAP and Air Dolomiti as they were. To extend it to lh-com: add lh-com to that rule (the dots then stand 24 px apart instead of www's 16) |
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
| 4 | Articles: the article list | titles LufthansaHead 36/39.6 light; the date line LufthansaHead 24/26.4 bold; descriptions 18/27; 40 px padding around each item; "571 Blog entries" (bold count) | titles 28 px drawn bold (the title link's 700); date line LufthansaText 18 bold; descriptions 16/24; no padding; "559 Results found" | shared | blog-overview (SWISS's magazine with 26 documents and Brussels use it with this look) | open, for the user: Lufthansa's values as the block's base would change SWISS's magazine and Brussels too (no theme overrides it) |
| 5 | Articles: which articles, how many | www's index | ours (559) | data | - | not a difference |
| 6 | 100 Years: the teaser cards' buttons ("Discover stories", "More about our milestones", "To the Anniversary Fleet", "To the history of the crane") | outlined secondary buttons | arrow links (cards-teaser drops the authored italic) | shared, brand-neutral | blocks/cards-teaser | fixed: an italic CTA stays a secondary button; plain and bold CTAs (TAP's, Brussels') stay arrow links (test/cards-teaser-secondary.test.mjs) |
| 7 | 100 Jahre (de/de): culinary journey, "Lufthansa Geschichten auf Reise", "Meilensteine über den Wolken" | picture and text side by side; the two as a two-up | full-width picture and text one under the other (the German import left them as default content; page 1755 px taller) | document | mine | fixed: as de/en, columns-media (padded) and the first two cards of the cards-teaser; 8372 px against www's 8635 |
| 8 | Campaigns, 1970s: "Es ist nicht der Champagner …" poster | under the text, beside "No caviar this time, thanks!" | missing | document | mine | fixed: poster 08 under the text (both languages) |
| 9 | Travelling with children: "Children's corner" / "Kinderecke" | one card in the left half of a two-column view | the card across the width (562 px picture) | document | mine | fixed: the row's empty second cell (622 px at 1440, as the other cards) |
| 10 | Footer: Star Alliance mark | "STAR ALLIANCE" and the star (maui-graphic star-alliance-logo-horizontal-transparent) | "A STAR ALLIANCE MEMBER" (the page decorates the :star-alliance: token before the footer's variant would apply) | document | mine | fixed: `:star-alliance-horizontal:` in both footers, as Austrian's |
| 11 | Menu: the cart | bar "Shopping cart preview" / "Warenkorb-Vorschau", menu "Your Cart" / "Ihr Warenkorb" | the menu read "Shopping cart preview" too (lh-com was left out: no capture of lufthansa.com's menu until now) | shared | blocks/header (header-tools.js) | fixed: lh-com in CART_TEXT_BRANDS (test/header-tool-roles.test.mjs) |
| 12 | Homepage: "Exclusive Offers & Benefits" (four small cards: Lufthansa Surprise, Gift Cards, Student Fares, Miles & More Credit Cards) | a grey band under the flight offers | none | data | - | not added: a Monetate test (`vt-comm551-offers`, pictures from sb.monetate.net) injected by www's personalisation, not authored content. The user decides whether to author it |
| 13 | Homepage: the hero, the deal prices, "Flight offers from Frankfurt" | Black Friday gift cards; prices; a row of destination cards | Kuala Lumpur; no prices; one placeholder card | data | - | not a difference: the campaign changes, and the fare and offer APIs do not answer this environment |
| 14 | Column-view spacing on miles-and-more, 100-years, additional-services, baggage | each column view 32 px above and below (64 px between sections) | 40 px (the h2's margin); 16-30 px less per section, -206 px on miles-and-more | document (import) | lh-com importer: column-view markers ({column-start} / {column-end}) are written for the info template only (COLUMN_MARK_TEMPLATES) | open, for the user: enable the markers for these templates and re-import, or mark the documents |
| 15 | Online check-in at 390: the check-in form | both items ("Booking reference or ticket number", "Tour operator travel") closed | tabs, the first open with the form and the four steps (page 1690 px taller) | shared | blocks/booking-lookup | open, for the user: www's maui-accordion starts closed on phones; ours is a tab set (one always selected) drawn as rows; closed rows need a disclosure pattern below 768 px |
| 16 | Online check-in at 1440: under the app band | "You can check in online…" 17 px below the band | 53 px (+36) | theme or document | mine | open: not traced in this brief |
| 17 | Miles & More, "This might also interest you" at 390 | a slider, one card at a time | the three cards stacked (+446 px) | shared | carousel-cards (grid) | open, for the user (as the shared carousel rows of the other brands) |
| 18 | Travellers panel | a modal: tabs "Travel details" / "Redeem miles", fare benefits, access code | lh-com's popover panel | shared | flight search (ema-cashub) | left (as Discover row 25) |
| 19 | Help & contact | the help app with its stage photo (h1 at 443 px) | the help app without the stage (h1 at 147 px) | shared | micro-frontend (ema-adobe) | left |
| 20 | Footer: the country button | "Deutschland \| English" on most pages ("Germany \| English" on the homepage) | "Germany \| English" | shared | blocks/footer | open, low: www is not consistent |
| 21 | Flight search page: "Miles & More Credit Card" link | the plain arrow | the external-link arrow (the link leaves lufthansa.com) | shared | cards-teaser | open, low |
| 22 | Smaller spacing differences: additional-services icon rows (~10 px each), travel classes (the title 40 px higher under the subnav), the Miami article (87 px less above "Our recommendations"), baggage (51 px less above "Baggage services") | | | theme / document | mine | open: measured, not traced in this brief |

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
