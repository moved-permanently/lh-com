# TAP: www.flytap.com and tap.turnsthe.page side by side

Status of 2026-11-04. Compared at 1440 and 390 px, the pt-pt pages: the homepage,
`/pt-pt/miles-and-go`, `/pt-pt/a-bordo`, `/pt-pt/informacoes/bagagem`, `/pt-pt/ajuda`,
`/pt-pt/stopover`, the header with its menu open and the footer. TAP's cookie banner answered
necessary-only. www.flytap.com answered every request normally (a real browser, one page at a
time). The screenshots stay in the session's logs (`migration-work/tap/parity/`, not in git).

Classes: **theme** (`styles/themes/tap.css`: tokens, and TAP-scoped rules as
`styles/themes/discover.css` has them), **import** (the importer can pick an existing block or
option that fits better), **variant** (an existing lh-com block needs a TAP option), **new block**,
**pictures**, **function** (behaviour). Variant, new block and function rows are specified for
ema-adobe at the end; they are not built here.

## TAP's values next to lh-com's tokens

From TAP's public stylesheet (`/_next/static/css/86708601e3be1e13.css`, its Tailwind design
tokens) and the computed styles of the pages above.

| What | TAP | lh-com token | tap.css before | tap.css now |
| --- | --- | --- | --- | --- |
| Text, headings | `#424045` (gray-1200, content-neutral) | `--text-color`, `--heading-color` | #424045 | #424045 |
| Strong text | `#37363a` (gray-1400) | `--lh-midnight` | #020817 | #37363a |
| Primary action | `#65c922` (primary-900), hover `#85f029` (primary-700) | `--lh-yellow`, `--lh-sunglow-yellow` | #65c922, #7cde3a | #65c922, #85f029 |
| Electric green (search, highlights) | `#9efd38` (primary-600) | `--button-accent-color` | #65c922 | #9efd38 |
| Links | `#397213` (primary-1300), hover `#2c570f` (primary-1400) | `--link-color`, `--link-hover-color` | #397213, #489018 | #397213, #2c570f |
| Light green surface | `#f5fff0` (primary-50) | (section style light) | – | `--lh-grey-1` stays #f7f7f8 |
| Quiet surface | `#f7f7f8` (gray-100, surface-strong) | `--lh-grey-1` | #f2f2f3 | #f7f7f8 |
| Footer, panels | `#f2f2f3` (gray-200) | `--footer-surface` | #f2f2f3 | #f2f2f3 |
| Borders | `#e0dfe2` (gray-400, border) | `--border-color`, `--lh-grey-2` | #e0dfe2 | #e0dfe2 |
| Radii | 4 / 8 / 16 / 24 / 32 / 999 px (xs, s, m, l, xl, round) | `--radius-s`, `--radius-m`, `--radius-l` | – / – / 32 | 8 / 16 / 24 |
| Container | 1240 px wide, padding 16 px (to 984), 32 px (984), 60 px (1240) | `--content-max-width`, `--layout-margin` | 1440 px, lh-com's margins | 1240 px, 16 / 32 / 60 |
| h1 | GT Flexa 40 / 48 px, 700 (phones 28 / 33.6) | `--heading-font-size-xxl` | 36 to 48 | 28 to 40 |
| h2 | GT Flexa 40 / 48 px, 700 (phones 24 / 28.8) | `--heading-font-size-xl`, `--heading-light-weight` | 28 to 36, 300 | 24 to 40, 700 |
| h3 (cards, banners) | GT Flexa 24 px (title-xs) to 32 px | `--heading-font-size-l`, `-m` | lh-com's | 20 to 24, 18 to 20 |
| Body | Inter 16 / 24 px | `--body-font-size-m`, `--body-line-height` | 16, 1.5 | 16, 1.5 |
| Lead | Inter 20 / 30 px, 600 | (hero subtitle) | GT Flexa 28 / 300 | Inter 20 / 600 |
| Buttons | 40 px high, Inter 15 px, 400, padding 0 24 px, pill | `--button-min-height`, `--button-font-size`, `--button-padding`, `--button-radius` | 48 px, 15, 700, 8 24 | 40 px, 15, 400 (TAP-scoped rule), 0 24 |
| Header bar | white pill floating 16 px from the top, shadow | `--header-bar-inset`, `--header-bar-radius`, `--header-bar-shadow` | full-width bar | 16 px, 32 px, shadow |

## The gaps, by visual impact (above the fold and the homepage first)

| # | Where | www.flytap.com | tap.turnsthe.page (before) | Class | State |
| --- | --- | --- | --- | --- | --- |
| 1 | Header, all pages | a white pill bar floating over the stage, the five tabs in the bar (Planear viagem, Os meus voos, Check-in, TAP Miles&Go, Ajuda), search, account and language icons; each tab opens a white rounded panel of link columns and a green banner card | a full-width bar with the quick actions (Gerir reserva, Check-in), the tabs in a dark side drawer behind Menu | theme (floating bar) + function (tabs in the bar: lh-com's bar menu, `header.menu: 'bar'`) | bar: fixed in tap.css; tabs: spec F1 |
| 2 | Homepage stage | an inset stage (16 px from the sides, 32 px corners) with a green swoosh, white text, a white pill button, dots and pause at the bottom; the booking box overlaps its foot | a full-bleed 810 px stage, green button | variant (hero-campaign `inset`) + theme (button, type) | type and button: fixed; inset: spec V1 |
| 3 | Homepage booking box | trip type, origin, destination, dates, passengers, Pesquisar; service tabs above it (Reservar voo, Fazer Check-in, Gerir reserva, Estado do voo) | nothing | function | fixed: the `booking-box` block on the seven homepages (f94aa639; ema-adobe's block, booking-spec.md 5.1) |
| 4 | Alerts | a ticker above the header ("2/8 Aviso de Viagem …", Ver todos) and a notice bar (Intermediação de Crédito) | nothing | function + import | the bar: ema-adobe's (live since 04:57); the alerts pages: the message-center block (current alerts, opens `#<id>`); the notice strip: authored on pt-pt, en-pt, fr-fr (below, The extra link strip) |
| 5 | Content width | 1120 px content in a 1240 px container | 1264 px content at 1440 | theme | fixed |
| 6 | Headings | bold GT Flexa 40 px h1 and h2, 28 / 24 px on phones | h1 48 px, h2 light 300 | theme | fixed |
| 7 | Buttons | 40 px pills, 15 px regular labels; white pill on pictures | 48 px bold green pills everywhere | theme | fixed (on pictures: white, TAP-scoped) |
| 8 | Service chips (homepage, under the stage) | one row of white pill chips, icon left of the label, arrows | a grid of large square tiles (cards-icon) | variant (cards-icon `chips`) | spec V2 |
| 9 | Miles&Go card (homepage) | one card: light green panel, small Miles&Go logo, title, lead, text, button; the photo right behind a green chevron | four cards (the other three are for other member states), each logo stretched to the column's width | import + pictures + variant | import: the first card only, logo out of the stretched cell (fixed); the panel and chevron: spec V3 |
| 10 | Mercados de Natal banner (homepage) | a 1120 px rounded banner, white text straight on the picture, white pill button | a full-bleed picture with a dark text box | variant (hero-card-overlay `inset`, text without box) | spec V4 |
| 11 | "Planeie a sua viagem" cards | four cards in a row, picture with 16 px corners, title centred under it | a carousel of large cards, 32 px corners, title left | theme (radii) | radii fixed; centring: spec V5 |
| 12 | Footer | two rounded cards (link columns; a side card with the logo, "Siga-nos" and its icons, "TAP App" and the store badges), then a rounded copyright bar "© 2026, TAP. Todos os direitos reservados." with Star Alliance | one grey band, the store links as text, the social icons nearly invisible (drawn #EBEBEB for a dark footer), no copyright | import (headings, store badges, copyright) + theme (icons) + variant (the card layout) | import and icons: fixed; cards: spec V6 |
| 13 | Breadcrumbs, inner pages | home icon > ancestors > page, under the header | none | import (lh-com's breadcrumb from Parent metadata) | fixed |
| 14 | Page titles (ajuda, a-bordo, bagagem, miles-and-go) | the H1 and its lead centred | left | variant (section style `centered`) | spec V7 |
| 15 | Help cards (ajuda) | three per row, white, shadow, 24 px corners, no border, small buttons with a chevron | four per row, 1 px border, square corners | import (cards with the option three-up: itemsPerRow) + theme (TAP-scoped: three to a row, shadow, corners) | fixed (the chevron in the button: not yet) |
| 16 | Link lists (bagagem, ajuda) | a grid of grey rounded tiles, three per row, a chevron each | a bulleted list | import (cards-icon tiles) | fixed |
| 17 | Accordions (ajuda, informacoes, info-legal) | items on a grey rounded panel (#f7f7f8, 24 px), dividers | items on the page background | theme (TAP-scoped panel) | fixed |
| 18 | Inner-page banners (miles-and-go, stopover, destinos) | the carousel inset in the content column, 32 px corners, arrows and dots inside | full-bleed narrow stage | variant (hero-campaign `inset`) | spec V1 |
| 19 | Image-only page banners (bagagem, info-legal, extras) | a rounded picture in the content column above the title | a full-bleed narrow stage without text | import (a picture in the content) + theme (its corners) | fixed |
| 20 | Explore Miles&Go (miles-and-go) | a picture left, an accordion of link groups right | a picture and open lists | import (accordion-columns faq for the groups) | fixed |
| 21 | Category cards (a-bordo, informacoes) | a white tab label over the picture's top edge, the sub-links in a card list with chevrons | the label as a green heading under the picture, bullets | variant (cards-teaser `tab-label`) | spec V5 |
| 22 | Pictures | the pictures at their size | missing ones (aem.flytap.com) left out; logos stretched | pictures | aem-dam and full size placed; names with spaces and accents found; none wider than www's but the stages (below, Pictures) |
| 23 | Mobile header | a pill with logo, search, account, burger | a bar with a second row of quick actions | theme (floating bar) + function (F1) | partly with row 1 |
| 24 | Search, account, language icons | in the bar | – | function | spec F1 (search and account stay links to www) |
| 25 | Stage and inner banners: the step between slides | swiper speed 1200, ease: the neighbouring slide slides in from the side over 1.2 s (at rest one slide, nothing peeks) | the browser's smooth scroll, about 0.4 s | function (hero-campaign-tap.js `createSlide`; hero-campaign.js lets a brand replace `motion.scroll`) | fixed (brief 336); reduced motion: the step at once |
| 26 | Headings | GT Flexa at -2 % letter spacing; inner pages: the H1 40 / 48 in 726 px at every width, section H2 32 / 38.4, an H2 right under the H1 centred | no letter spacing; H1 28 and H2 24 on phones, H2 40 at 1440; the H1 over the whole column | theme (TAP-scoped) | fixed (brief 336) |
| 27 | Text cards' titles and buttons (ajuda's help cards, stopover's steps) | GT Flexa 24 / 28.8, 500, 8 px above the text; a long label wraps inside the button | 18 / 700 with 24 px below; a long label overflowing the card | theme | fixed (brief 336) |
| 28 | FAQ accordions (ajuda, stopover, destinos) | a #fcfcfc panel, 32 px corners (16 on phones), 16 / 32 px inside; questions Inter 16 / 24 semibold, 12 px high; a line between items only; a dark green chevron | a #f7f7f8 panel, 24 px corners; questions GT Flexa 18 bold; lines above the first and under the last | theme | fixed (brief 336) |
| 29 | Link-list tiles (bagagem, ajuda, a-bordo, miles-and-go) | grey #f7f7f8 tiles, 8 px corners, a 56 px row inside 8 px, the label left in Inter 16 regular, a chevron at the right; 1 / 2 / 3 to a row | bordered pills with a shadow, the label centred in GT Flexa bold | theme | fixed (brief 336) |
| 30 | Picture above the title (bagagem, info-legal) | 380 px high on phones, 305 at 1440, cut to fit | the picture's own ratio (84 px high on phones) | theme | fixed (brief 336) |
| 31 | Text cards with a picture (miles-and-go's advantages, stopover's advantages and reasons) | a card 16 px inside its column, 16 px corners, shadow 0 8 16 / 10 %; the picture 326 × 183; the title GT Flexa 24 / 500; an outline pill (1 px #65c922, 42 px, 15 / 500) with a chevron | no card; an 18 px bold title; an arrow link | theme | fixed (brief 336) |
| 32 | Miles&Go tier cards (miles-and-go) | an 8 px top edge in the tier's colour (#55aa1c, #a4a6a8, #ae975d, #47454a), 16 px corners, 24 px inside, each as tall as its text; the logo 65 px high; chevrons in the tier's colour before 14 / 21 lines; the title 18 / 500; the link centred; on phones a row of 247 px cards | white cards of one height, a small logo (83 px wide), bullets, stacked on phones | theme | fixed (brief 336); www's dots under the phone row: not built (the row scrolls) |
| 33 | Links in running text (stopover, destinos) | underlined, regular, TAP's dark green, no icon | bold, not underlined, lh-com's arrow before them | theme | fixed (brief 336) |
| 34 | Footer | outline social glyphs (24 px, #424045); 64 px from the page at 1440, 32 on phones | lh-com's round icons; 112 px from the page | function (footer-tap.js, icons/tap-*.svg) + theme | fixed (brief 336); the store badges' order and Star Alliance in the bar: the footer document (ema-lufthansa) |
| 35 | Breadcrumb | the whole trail on phones too: a house, chevrons, the page in semibold (Inter 14 / 20, #424045) | on phones only a back link to the parent; the homepage as text | theme | fixed (brief 336) |
| 36 | Explore Miles&Go (miles-and-go, row 20) | from 1024 px the picture at the left (512 × 288), the list beside it from the column's middle; no panel, a line under every item, the names GT Flexa 600 (24 px; 16 on phones), a dark chevron | the list in a grey panel under the picture | theme | fixed (brief 336) |
| 37 | Inner banners on phones | the title 32 px, the lead Inter 20 / 30 | the homepage stage's 24 and 18 | theme | fixed (brief 336) |
| 38 | Running text width | the content's whole width (1120 px at 1440) | two thirds (lh-com's limited width) | theme | fixed (brief 336) |
| 39 | Breadcrumb's place under the header | 176 px from the top (the bar and its green quick-action tab above it) | 96 to 120 px (no quick-action tab) | header (ema-lufthansa) | open |
| 40 | Help centre contacts (ajuda) | a country / city picker with phone numbers, opening hours and desks | a link to www ("See on flytap.com") | variant (hotline-finder on brand tap) + data (a contacts sheet per root) | block built (brief 339), the draft with a sample in DA, previewed (brief 344); the data: the contacts capture (row 54) |
| 41 | LUGGit (bagagem) | the LUGGit booking widget | a link to www | app | open |
| 42 | Stopover video (stopover) | a 32 px-rounded video, its title over it | columns-media: the video, the title beside it | import (ema-lufthansa) | open |
| 43 | FAQ teaser card (stopover) | a #fcfcfc card with a 4 px green left edge, an outline button over its width | a heading, a line and a green button | import (a section style) | open |
| 44 | A lone button under the text (stopover "Book now") | centred | at the left | import (no marker in the content tells it from left-aligned ones) | open |
| 45 | Destinations map and cards (destinos) | Smartvel's map, filter chips and destination cards | the continents as an accordion, the get-inspired banner | variant (poi-map on brand tap) + data (a destinations sheet per root) | map built (brief 339); the draft and the eight versions' sheets in DA, previewed (brief 344); the `poi-map` row on the pages: ema-lufthansa; Smartvel's cards and themes stay www's |
| 46 | Homepage Miles&Go cards | four cards stacked as on www | the visitor's card as text and a picture | import: drafts/miles-go-stack (ema-lufthansa's importer) | open |
| 47 | Christmas banner title on phones | "Christmas Markets / in Europe" | "Christmas / Markets in Europe" (the same 32 / 38.4, 500, -2 %, 310 px box) | theme: not the fonts (www's files, sha256 equal) but lh-com's text-wrap: balance on the hero card | fixed (brief 339) |
| 48 | Market roots' homepage stage (es-mx, es-ar, pt-ao) | a fare carousel ("Voos desde 1 616 149 Kz", "Vuelos desde MX$34,391"), www's prices per market | no stage: the booking box at the top | import (ema-lufthansa: the roots' stage slides; the prices are www's live fares) | open |
| 49 | Market roots' fourth Miles&Go card (pt-br, fr-ca, pt-ao) | four cards, the fourth the market's credit card (TAP BTG Pactual Black, Cartes de Crédit, VISA TAP Gold) | three cards (en-us has its fourth) | import (ema-lufthansa) | open |
| 50 | Market roots' Miles&Go section served | the four cards | tap.turnsthe.page serves mostly the published one card (`columns-media`), now and then the four-card stack (`columns-media stack`), with the same last-modified (pt-br, de-ch, en-gb, rechecked at 17:30). The preview has the stack. | publishing the roots' homepages; if it still alternates after that, the edge cache (ema-adobe) | open |
| 51 | Market roots' alerts bar (en-gb and others) | the root's own alerts ("Measures Related to Ebola Outbreak", 3/6) | another market's ("… for Travel to the US", 2/7) | alerts bar (ema-adobe) | open |
| 52 | Market roots' `html lang` | the market's (`pt-ao`, `en-gb`, `de-ch` …) | the language (`pt`, `en`, `de`) | scripts (ema-adobe) | open |
| 53 | Market roots' footer | "Cookie settings" in the second column; Star Alliance as www's picture; Google Play before App Store | no cookie settings link; "A Star Alliance member"; App Store first | import (ema-lufthansa: the footer documents) | open |
| 54 | Market roots' help contacts | the finder with the market's country and city first (Schweiz / Genf, Angola / Luanda) | "See on flytap.com" | data: the contacts capture (the block and its sheet are ready, row 40) | open |
| 55 | Contacts picture | a green chevron line over the picture's right edge | none | theme (TAP-scoped, hotline-finder-tap) | fixed (brief 344) |
| 56 | Booking box's selects | a green triangle as the selects' arrow | a chevron | booking box (ema-adobe) | open |

## What was fixed (commits)

- 5fc6a748: the theme (tokens: container, headings, buttons, floating bar, radii, palette;
  TAP-scoped rules: the stage's lead and white button, the footer's icons, the accordion panel,
  the content pictures' corners).
- 4bcaecbc: the importer and nav tool (booking slot, breadcrumbs, the visitor's Miles&Go card,
  link-list tiles, image-only banners, the explore accordion; the footer's "Siga-nos", "TAP App",
  store badges and copyright).
- 74932f1b: the text cards (`cards` three-up and four-up, with TAP's card look) and the booking
  slot as a panel.
- The documents of all seven languages, imported again and previewed (state commits after each
  upload).

Not fixable from the theme or the importer (specs below): the bar menu (F1), the booking box
(F2), the alerts (F3), the inset stages and banners (V1, V4), the service chips (V2), the
Miles&Go panel (V3), the category cards' tab labels and centred titles (V5), the footer cards
(V6), the centred page titles (V7).

## The booking box (was: the booking slot)

The placeholder section (`booking-slot`, a link to www's box) is gone. Since f94aa639 the importer
writes the `booking-box` block table (booking-spec.md 5.1) in a section of its own right after the
stage on each of the seven homepages:
- Format, Market and Language from the root, the default origin from the market (LIS, MAD, PAR,
  FRA, FCO, WAW), its name from the root's airport sheet;
- Airports `/<root>/booking/airports.json`, the four tabs and the label rows in the root's
  language (www's texts, else booking-labels.json).

www's box anchors (`#special-anchor-book-flight`, `-check-in`, `-my-travels`, `-flight-status`) on
any page or link go to the root homepage's box (`/pt-pt#check-in`). The homepages were uploaded and
previewed on 2026-11-04; publishing is the user's.

## Specs for ema-adobe (shared code; not built here)

**F1, the header's bar menu for TAP.** `scripts/brands.js` `tap`: `header: { menu: 'bar' }`, the
bar menu Lufthansa Group for Business uses (`blocks/header/header-bar-menu.js`). The nav
documents already have the shape it reads: the third section's top items with their groups and
links, and a banner group, "Novo sistema EES" / "TAP Miles&Go". Wanted beyond business.lgfb's:
- the group's banner as a green card in the panel (picture, title, text, button);
- search, account and language as icons at the bar's right. Search and account stay links to
  www.flytap.com.

Pages: every lh-tap page.

**F2, TAP's booking box.** On the homepage under the stage, like www's:
- trip type (round trip, one way, multi-city), origin with an airport search (default Lisboa),
  destination, dates (one range picker), passengers (adults, children, infants), "Pesquisar";
- above it, the service tabs Reservar voo, Fazer Check-in, Gerir reserva, Estado do voo. The last
  three are links to www's check-in, manage-booking and flight-status pages.
- The hand-off to TAP's booking engine is open (you are finding it out).

Built by ema-adobe as `booking-box` (blocks/booking-box/README.md); the homepages carry its table
(above).

**F3, TAP's alerts.** pageProps.alerts (title, criticality, a link to `/alertas-e-informacoes#<id>`)
as a ticker above the header ("1/8", previous and next, "Ver todos"), plus the notice bar
(Intermediação de Crédito, Saiba mais). Content: the alerts page's accordion (already imported,
`/pt-pt/alertas-e-informacoes`) or a sheet. Pages: all.

**F4, the language switch per root (pt-br; ema-test, pt-br.md 2 and 3).** `blocks/header` reads
the page's `alternate-<lang>` metadata and `scripts/site-languages.js` lists TAP by language, so
two roots of one language (pt-pt, pt-br) can't both be in the switch. The documents now carry both
keys: `Alternate <ll>-<cc>` for every counterpart root, and `Alternate <lang>` only for the root the
switch has for that language (pt: pt-pt), so the header works as it does today. Wanted: the header
reads `alternate-<ll>-<cc>` first for a site whose languages have a country (the `tap` list), and
the list gains pt-br (and en-br) with their countries. On www each market has two languages, its
own and English, so pt-br's switch offers English (en-br, on www until lh-tap has it); the nav
tool writes that per root now. Pages: all lh-tap pages.

**V1, hero-campaign `inset`.** The stage inside the content column, 16 px from the viewport's
sides on phones, the content width from 984 px. Also:
- 32 px corners;
- the dots, arrows and pause inside the picture's lower edge;
- optional: TAP's green swoosh as a decorative SVG, from a theme token;
- the CTA as a white pill on the picture.

Content model unchanged (options `inset`, with `slider`, `narrow`). Pages: the seven homepages,
miles-and-go, stopover, destinos, inspire-se and every page with a BannerCarousel.

**V2, cards-icon `chips`.** One row of pill chips (white, 1 px border #e0dfe2, icon 24 px left of a
14 px label), scrolling sideways with previous and next arrows; the same rows as cards-icon. Pages:
the seven homepages (AuxiliaryCarousel).

**V3, columns-media `panel`.** The text cell on a light green panel (#f5fff0, 32 px corners for
the row), a small logo picture at most 160 px wide before the heading, the media cell clipped by a
chevron at its left edge (a theme token for the shape). Rows as columns-media. Pages: the
homepages (Miles&Go card), miles-and-go.

**V4, hero-card-overlay `inset`.** The banner in the content column with 32 px corners, the text
straight on the picture (no box) over a dark gradient from the left, a white pill button. Pages:
the homepages (HeroCard), destinos.

**V5, cards-teaser `tab-label` and `centered`.**
- `tab-label`: the card's first heading as a white tab over the picture's top edge (centred, 8 px
  corners, 14 px caps), the card's list as a white panel of rows with a chevron each.
- `centered`: titles centred under the picture.

Pages: a-bordo, informacoes, gerir-reserva, reservas (GenericCard2), the homepages (ClientNeeds).

**V6, footer cards.** The footer's columns in a rounded card (24 px, #f2f2f3), the badges section
in a side card (logo, its headings in green, icons, store badges), and the note as a rounded bar
below both (#e0dfe2, copyright left, Star Alliance right). Content model unchanged (the sections
and styles the footer reads today). Pages: all.

**V7, section style `centered`.** A section's default content centred: headings and paragraphs at
most 720 px wide in the middle. TAP's Heading components have `textAlign: center`; the importer
would write the style. Pages: about 40 % of TAP's pages (help, on board, baggage, Miles&Go,
promotions).

## Pictures

- **aem.flytap.com** (rich text pictures, held until 2026-11-03): the capture's `aem-dam` segment
  (tap-media-013, 182 files; 44 not fetched) placed in all seven languages.
- **Full size:** pic.flytap.com pictures again at 2,560 px (media 015 to 017, 839 files). All
  seven languages imported with them; the upload finished on 2026-11-04 (830 documents up to date
  in DA and previewed, none published). TAP's originals are small (median 1,110 px), so most
  files are no larger than before.
- **aem.flytap.com names with spaces or accents** (ema-test, pt-br.md 1): the archives keep the URL
  as fetched (two slashes, percent-encoded), the rich text names the DAM path (one slash, plain).
  The importer now also looks a picture up by the decoded path with the slashes collapsed (NFC):
  in the seven folders the pictures without a local copy went from 139 (105 on aem.flytap.com) to
  79 (45 on aem.flytap.com, 33 on pic.flytap.com, 1 on an AEM publish host). Those 79 are in no
  archive; they are listed for the capture in `missing-pictures.txt` (URL, then the documents).
- **No picture wider than www shows it** (40 pages, 1440 and 390 px, our pictures paired with
  www's by order, alt and aspect ratio). Wider before: the three-up card pictures (360 against
  325 px), the homepage's "Planeie a sua viagem" cards (394 against 262), the Miles&Go tier logos
  (262 against 212, files 234 px wide), the explore picture beside its accordion (1120 against 512).
  Fixed in tap.css (TAP-scoped): the card grids' 24 px gaps and 16 px insets, four homepage cards
  to a row at 28:12, the logos in a 62 px row, the explore picture at half the column. Still wider:
  the stages and banners (hero-campaign, hero-card-overlay: full bleed against www's inset 1,376
  and 1,176 px), which are ema-test's hero work (V1, V4), and on phones the stopover's
  columns-media cards (358 against 326). Not compared: our pictures without a counterpart found
  on www (about 1 in 5).

## The extra link strip (pageProps.extraAlert)

www shows it on the root homepages only, right under the alerts bar and above the header: a full-width
#ebf2ff strip, 52 px, the message as a link (Inter 16/24 semibold, 13 px on phones) and a pill to the
same page. pt-pt and en-pt: "Intermediação de Crédito" / "Credit Intermediation" with "Saiba mais" /
"Find out more"; fr-fr: "Droits des passagers". The importer writes it as the homepage's first section
(style `extra-alert`): a `columns` block, the message a plain link, the pill a secondary button; tap.css
gives it www's look. Placement: as content it sits at the top of `main`, so at 1440 px it is 25 px under the
alerts bar (the space the first screen keeps above the stage, with the header floating in the stage
below it), and on phones under the header instead of above it. Exact placement would be code: the header
(ema-test) or the alerts bar (ema-adobe) moving a `.section.extra-alert` above the header.

## The alerts pages

The seven alerts pages (`/pt-pt/alertas-e-informacoes` … `/pl-pl/ostrzezenia-i-informacje`) have the
`message-center` block (Types irreg, tech-outage) in place of the static accordion of the capture: they
show lh-tap's current alerts in weight order and open `#<id>` from the alerts bar's links (checked with the
local code: 8 items on pt-pt and en-pt, `#power-banks` and `#phishing-scheme` open). The block keeps
lufthansa.com's width (74.2 % of the column from 768 px).

## Brief 336: phones first, then 1440 (rows 25 to 47)

Compared on 2026-11-04 at 390 and 1440 px, www.flytap.com against tap.turnsthe.page (before)
and the branch preview `cmp-336--lh-tap--moved-permanently.aem.page` (after):
- the eight homepages;
- in pt-pt and en-pt: ajuda / help, a-bordo / on-board, bagagem / baggage, miles-and-go,
  stopover, destinos / destinations.

The fixes are all TAP-scoped: `body.brand-tap` rules in `styles/themes/tap.css`, TAP's own
modules `hero-campaign-tap.js` and `footer-tap.js`, and `icons/tap-*.svg`. One shared change:
`hero-campaign.js` hands the slider's scroll to `motion.scroll`, which brand tap replaces.
Every other brand keeps the browser's smooth scroll.

Left as it was: the extra link strip's place on phones (as asked), TAP's market roots, the
header (`header-tap.*`), and the importer (`tools/importer/tap-*`). The open rows above say
whose they are.

**The neighbouring slide (row 25).** www's swiper (slidesPerView 1, spaceBetween 0, speed 1200)
shows one slide at rest. The neighbour comes in from the side during the 1.2 s step. Ours now
steps the same way. The track is scrolled with ease and its snapping is off while it moves. A
swipe or the wheel stops it. Under reduced motion it moves at once. The banner's slides are
square inside the rounded frame, so the seam between them is straight while one slides in.

**The homepages.** The stage and the cards are unchanged, apart from the slide, the headings'
-2 % and the footer. The eight homepages at 390 and 1440 on the branch:
- no script errors;
- no horizontal overflow;
- the section headings 28 / 40 px as before.

The 12 inner pages, at both widths:
- the H1 at 40 px;
- the whole trail;
- no overflow.

Screenshots (not committed), in `/tmp/tap-336`:
- **Before:** `cmp390/*.png` (www at the left, tap.turnsthe.page at the right).
- **After:** `after390/*.png` and `after1440/*.png` (www at the left, the branch code at the
  right).
- **The slide:** `slide-before-main-300ms.png` and `slide-after-branch-300ms.png`, and the same
  at 600 ms.
- **The explore list:** `after1440/explore.png`.

Checks:
- **Lint:** eslint and stylelint pass.
- **Tests:** `test/tap-parity-336.test.mjs` (the slide with a hand-moved clock, TAP's next
  button against another brand's, the footer's icons, the rules).
- **Full suite, after the final rebase:** 239 of 240 test files pass.
  `test/library-entries.test.mjs` fails only in this workspace: it reads the untracked local
  `content/library/blocks`. In a clean worktree of the same commit it passes 7 of 7.
- **lufthansa.com's 19 comparison pages:** 19 of 19 equal on the branch, with a warm cache. The
  first, cold capture showed `/de/en/homepage`'s stylesheets in another order.
- **Brand homepages:** Discover, Austrian, Brussels, Lufthansa Group for Business, Cargo, Air
  Dolomiti and ITA are equal. SWISS differs only in the flash teaser's progress ring, which is
  timing.
- **lh-edge:** no file on its deploy paths changed.

Rollback: `git revert` of the commits.

## Brief 339: the headings' line breaks, the destinations map, the help contacts (rows 47, 45, 40)

Code only, all TAP-scoped, nothing published. Every other brand's poi-map and hotline-finder are
unchanged.

### Row 47: the fonts are www's, the wrapping was not

www.flytap.com's stylesheet (`/_next/static/css/86708601e3be1e13.css`) loads its `tap` font
from three files: `58f00d2219f5e110-s.p.ttf` (400), `ddf52e3354263f0b-s.p.ttf` (500) and
`b3b32643e73e0a8d-s.p.ttf` (700). Inter is `e4af272ccee01ff0-s.p.woff2`, the latin range. I
fetched each file once on 2026-11-04. Each one has the same sha256 and size as ours in
`fonts/tap/`:

| File | Bytes | sha256 |
| --- | --- | --- |
| `GTFlexa-400.ttf` | 145,079 | `f1b507fd…510ea3` |
| `GTFlexa-500.ttf` | 147,643 | `33179f5f…8d172c` |
| `GTFlexa-700.ttf` | 169,007 | `e5c22056…32ef419` |
| `Inter-latin.woff2` | 48,432 | `c9407645…44c3e4` |

The `@font-face` rules match too:
- `font-display: swap`, truetype for the 400, 500 and 700 weights;
- no `font-feature-settings`;
- www's `font-style: semibold` and `bold` are not valid values, so the browser treats them as
  normal;
- www's `size-adjust` (105.27 %) and its overrides apply only to its Arial fallback, "tap
  Fallback", which shows until the font loads. I left them out: ours falls back to Arial too.

Both sites measure the heading at 427.7 px on one line. The difference was in the wrapping:
lh-com balances the hero card's title and eyebrow (`text-wrap: balance`), while www wraps
greedily. Brand tap now wraps them greedily too.

lh-com's phone rule still hyphenates words of 14 letters or more, so a long word cannot push the
page sideways (`test/heading-wrap.test.mjs` keeps brand themes from turning it off). www
hyphenates nothing, but none of the compared headings has a word that long.

**Check:** I compared every h1 to h4 on `/en-pt`, `/en-pt/stopover`, `/en-pt/miles-and-go` and
`/pt-pt/ajuda` at 390 and 1440, 94 headings in all. 93 have as many lines as on www. The one
that differs is stopover's video title, which sits in a box of another shape (row 42, import).

### Row 45: the destinations map

**The data.** www's map is Smartvel's widget (`<exploreandgo>`, its script from
cdn.smartvel.com). Its points are not in the page. The page's `__NEXT_DATA__` in the capture
archives (tap-snapshots-001 `pt-pt/destinos`, -003 `en-pt/destinations`) holds the destinations:
- `ComponentAccordionItemsListModel`, three regions with 89 destinations;
- each destination a city, its country and the two flights links.

`tools/tap-data/destinations-sheet.mjs` places each destination by its airport:
- the city's name is matched to the root's recorded airport sheet
  (`content-sites/lh-tap/runs/airports/<root>.json`, TAP's city codes), the destination's
  country first ("Boa Vista" is Cape Verde's BVC, not Brazil's BVB);
- a city code (NYC, LON) is placed at the mean of its airports, leaving out the odd one (the
  sheet's NYC lists YYY, a Canadian code);
- the coordinates come from OurAirports' public `airports.csv` (public domain), fetched once;
- 16 names that differ are kept in the tool's `PLACES`.

No TAP API is called. en-pt and pt-pt both give 89 of 89 destinations, with the same set of
codes.

**The block.** poi-map on brand tap, with a sheet as its Source (`poi-map-tap.js`):
- a green dot per destination;
- the bubble "Accra, Ghana" with "Flights to Accra", linking to www's flights page (in the
  page's language);
- zoom buttons as white circles at the top right;
- above the map, "All" and one button per region; a region shows its dots and fits the map to
  them.

The tiles are OpenStreetMap's: CARTO's light tiles now answer "API key required".

**Not as www:** Smartvel's search box, its theme chips (Christmas Markets …) and its destination
cards with pictures and texts. Their data is Smartvel's and is not in the captures.

**The content change, for ema-lufthansa (`tools/importer/tap-*`):**
- **Where:** on each root's destinations page (`/en-pt/destinations`, `/pt-pt/destinos` …), in
  place of the "See on flytap.com" paragraph (www's `ComponentWidgetFreeBlockModel` with
  `exploreandgo`).
- **The block table:**

  | poi-map | |
  | --- | --- |
  | Source | `/<root>/destinations/destinations-map.json` |

- **The sheet:** one per root, `/<root>/destinations/destinations-map.json`, from that root's
  captured destinations page: `node tools/tap-data/destinations-sheet.mjs --root <root> --page
  <capture> --airports content-sites/lh-tap/runs/airports/<root>.json --ourairports
  <airports.csv> --out <sheet>`. Columns: region, city, country, code, lat, lng, link,
  countryLink. The tool prints any name it cannot place; add it to `PLACES`.

**The draft:** `/drafts/destinations-map` and its sheet `/drafts/destinations-map-en-pt.json`,
the en-pt page with the block in place. Both are local copies in
`content-sites/lh-tap-draft/drafts/`. The upload to Document Authoring (DA) was blocked by the
remote-content guard, so they are not in DA yet. I checked the block on a local copy, with TAP's
brand set in the test browser.

### Row 40: the help contacts

**What www shows:** `ComponentContactsByCountryModel` (folder `contacts`), a country select and
a city select. Under them, the place's groups (TAP Miles&Go Customer Service, Contact Center,
Customer Service Desk, Lost & Found …), each with a telephone, its note, a schedule or an
address.

**The data is not in the captures.** The page loads it after it renders. The archives hold only
www's labels: `contact.contact-center`, `contact.atendimento-tap-milesgo`,
`contact.balcao-de-servico-ao-cliente`, `contact.lost-and-found`, `contact.phone.whatsapp` …,
plus "Select country" and "Schedule". A capture of the finder per country and city (or of its
data request) is needed. I did not call TAP's live API.

**The block.** hotline-finder on brand tap (`hotline-finder-tap.js`):
- the picture with 8 px corners, beside the finder from 1024 px;
- the country and city selects as green-edged pills;
- the market's country first;
- each group's title in GT Flexa 24 / 500, dark green;
- the entries with icons, labels, values (telephones as links) and notes, two to a row from
  768 px.

**The content change, for ema-lufthansa:**
- **Where:** on each root's help page, the Contacts section (`/en-pt/help`, `/pt-pt/ajuda` …),
  in place of "See on flytap.com".
- **The block table:**

  | hotline-finder | |
  | --- | --- |
  | Sheet | `/<root>/help/contacts.json` |
  | Image | www's `help-contact-center-tap.jpg` |

- **The sheet:** one per root, one row per entry. Columns:
  - country (ISO code);
  - name (the country's name in the root's language);
  - city;
  - group (www's contact type, in the root's language);
  - kind (text, phone, whatsapp, email, address, schedule, link);
  - label (optional);
  - value;
  - note.

**The draft:** `/drafts/help-contacts` and `/drafts/help-contacts-en-pt.json`, local copies in
`content-sites/lh-tap-draft/drafts/`, not uploaded (the guard). The sheet is a SAMPLE: Portugal /
Lisbon's seven entries as www's help page showed them on 2026-11-04 (brief 336's screenshots).
It is there only to test the block until a capture holds every country.

### Checks

Screenshots (not committed), in `/tmp/tap-339`:
- **The map, local:** `map-local-*.png`.
- **The contacts, local:** `contacts-local-*.png`.
- **The Christmas banner:** `xmas-before-390.png` (tap.turnsthe.page) and `xmas-after-390.png`
  (the branch), next to www's.

Tests: `test/tap-339.test.mjs`. It covers:
- the font hashes;
- the sheet tool on a fixture (nested spans, the country's Boa Vista, NYC without YYY, the
  hand-kept names, unplaced names);
- the map's sheet, its bubbles and its region buttons;
- the contacts grouping and the finder's selects;
- the two blocks hand brand tap to their variants only;
- the new rules all under `body.brand-tap`.

Comparisons, main against the branch `cmp-339`:
- **lufthansa.com's 19 pages:** 19 of 19 equal with a warm cache.
- **poi-map's lufthansa.com pages** (`/de/en/100-years/destinations`,
  `/de/en/articles/explore-the-world`, `/at/de/first-class` and its Barcelona article): 4 of 4
  equal on the first capture. On the second, the Barcelona page's stylesheets loaded in another
  order (timing).
- **lh-b2b's hotline-finder pages** (`/de/en/about-us/contact`, `/xx/en/about-us/contact`):
  2 of 2 equal.
- **The other brands' homepages:** equal. ITA and SWISS differ only in the flash teaser's progress
  ring; Air Dolomiti only in its stylesheets' order (timing).
- **The Christmas banner on phones:** "Christmas Markets / in Europe" as www's.

Rollback: `git revert` of the commit.

## Brief 344: the drafts in DA, the eight destinations sheets, the market roots (rows 48 to 56)

### The drafts

Uploaded to Document Authoring (DA, lh-tap) and previewed on 2026-11-04. Not published. Both
pages read back from DA the same as their local copies in `content-sites/lh-tap-draft/drafts/`.

| Draft | Preview |
| --- | --- |
| destinations map | https://main--lh-tap--moved-permanently.aem.page/drafts/destinations-map |
| its sheet (89 rows) | https://main--lh-tap--moved-permanently.aem.page/drafts/destinations-map-en-pt.json |
| help contacts | https://main--lh-tap--moved-permanently.aem.page/drafts/help-contacts |
| its sheet (the Portugal / Lisbon sample, 7 rows) | https://main--lh-tap--moved-permanently.aem.page/drafts/help-contacts-en-pt.json |

On the preview, the map has 89 dots and the region buttons. The finder starts with Portugal and
shows its four groups. The drafts' path has no root, so their labels are TAP's default language,
Portuguese.

### The destinations sheets, all eight language versions

`/<version>/destinations/destinations-map.json` in DA lh-tap, previewed only. Each preview's rows
are the same as the local copy (`content-sites/lh-tap/content/<version>/destinations/`).

The sheets come from each version's captured destinations page, its own city names and links:
- pt-pt: destinos (archive 001);
- en-pt: destinations (003);
- es-es: destinos (006);
- fr-fr: destinations (008);
- de-de: reiseziele (010);
- it-it: destinazioni (012);
- pl-pl: miejsca-docelowe (013);
- pt-br: destinos (014).

| Version | Destinations on www | In the sheet | Not placed |
| --- | --- | --- | --- |
| pt-pt | 89 | 89 | – |
| en-pt | 89 | 89 | – |
| es-es | 89 | 89 | – |
| fr-fr | 89 | 89 | – |
| de-de | 90 (Alicante as well) | 90 | – |
| it-it | 89 (Belém twice, São Paulo missing: www's list) | 88 (Belém once) | – |
| pl-pl | 88 (no Reykjavik) | 88 (40 of them without a link, as on www) | – |
| pt-br | 88 (no Manaus) | 88 | – |

The tool now reads every version's list as www has it:
- names linked or not;
- pl-pl's two destinations in one paragraph, split at the line break;
- the same destination twice kept once.

It places each name by these sources, in order:
1. the root's airport sheet;
2. the other languages' sheets, within the country;
3. the name in the flights link ("loty-do-nowy-jork");
4. the hand-kept `PLACES`, which now holds 38 names.

Each version prefers the codes en-pt placed (`--known`). That fixes es-es's Santa Maria (the
Azores', not Brazil's), Boa Vista (Cape Verde's), Valencia (Spain's) and Manchester (England's).
Every version's set of codes is en-pt's, apart from the differences between www's lists noted in
the table. pt-br reads its DA airport sheet (`/pt-br/booking/airports.json`).

### The market roots against www

Ten roots, 2026-11-04, at 390 and 1440: pt-br, en-us, fr-ca, de-ch, es-mx, pt-ao, en-gb, fr-be,
de-at, es-ar. For each, the homepage and its help page. One www page every 10.5 s or more, 40 in
all.

Same section by section on all ten help pages (the finder aside):
- the title and lead;
- the six help cards;
- the FAQ;
- the link tiles;
- requests and complaints.

On the homepages the stage, booking box, pills, plan-your-trip cards and Christmas banner have
TAP's look as on the language versions. The Miles&Go cards are the stack at 1440, but row 50 has
the page served both ways. The differences are rows 48 to 56; one is TAP-scoped code (row 55).

Not differences:
- A stage caught mid-slide in a screenshot: the 5 s rotation and its 1.2 s slide. At rest
  `scrollLeft` is a multiple of the slide width.
- www's Miles&Go cards below the first one look blank at 1440: they fade in as they scroll into
  view.

Screenshots: the comparison's side-by-side images (`/tmp/tap-344/cmp`, www left, ours right) were
lost when the work environment restarted. The rows above were written from them and from the
pages' outlines, before the restart. After the restart I checked our side again with plain
requests, without www (rows 48 to 50, 17:30). Row 55's before and after: `/tmp/tap-346`.

### For ema-lufthansa (content)

- Rows 48, 49 and 53, the roots' documents. The stage on es-mx, es-ar and pt-ao. The fourth
  Miles&Go card on pt-br, fr-ca and pt-ao. The footer's cookie settings, Star Alliance picture and
  store order.
- `poi-map` with `Source | /<version>/destinations/destinations-map.json` on the eight destinations
  pages (the sheets are in DA).

### For ema-adobe

- Row 50: the edge serving two versions of the same page.
- Row 51: the alerts per market.
- Row 52: `html lang`.
- Row 56: the booking box's select arrow.

### Checks (brief 344)

- **Lint:** passes.
- **Full suite:** 245 of 246 test files pass after the final rebase. `test/library-entries.test.mjs` fails only in this
  workspace, because it reads the untracked local `content/library/blocks`. In a clean worktree of
  the commit it passes 7 of 7.
- **Tests:** `test/tap-344.test.mjs` covers the paragraph parser, the link names, the DA airport
  sheet and the placing order, plus the chevron rule.
- **Comparisons**, main against the branch `cmp-344`, with a warm cache:
  - lufthansa.com's 19 pages are equal;
  - Discover, Austrian, Brussels, Lufthansa Group for Business and Cargo are equal;
  - ITA and SWISS differ only in the flash teaser's progress ring, and Air Dolomiti only in the
    order of its stylesheets (timing).

Rollback: `git revert` of the commit. The DA sheets and drafts keep their earlier versions in DA.
