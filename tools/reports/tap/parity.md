# TAP: www.flytap.com and tap.turnsthe.page side by side

Status of 2026-11-04 (rows updated on 2026-11-05 from the user's checks: brief 394 at the end). Compared at 1440 and 390 px, the pt-pt pages: the homepage,
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
| 1 | Header, all pages | a white pill bar floating over the stage, the five tabs in the bar (Planear viagem, Os meus voos, Check-in, TAP Miles&Go, Ajuda), search, account and language icons; each tab opens a white rounded panel of link columns and a green banner card | a full-width bar with the quick actions (Gerir reserva, Check-in), the tabs in a dark side drawer behind Menu | theme (floating bar) + function (tabs in the bar: lh-com's bar menu, `header.menu: 'bar'`) | done: the bar in tap.css; the tabs in the bar (F1: 36ec98e2 the menu, b7fd82a6 the market button): the pill 1120 x 70 at 160,120 with radius 999 and the five tabs at 1440, the pill with logo, search, account and burger at 390. Checked again on tap.turnsthe.page/pt-pt at 1440 and 390 (brief 419). |
| 2 | Homepage stage | an inset stage (16 px from the sides, 32 px corners) with a green swoosh, white text, a white pill button, dots and pause at the bottom; the booking box overlaps its foot | a full-bleed 810 px stage, green button | variant (hero-campaign `inset`) + theme (button, type) | done: type and button in tap.css; the inset stage (V1, 077d0941): 16 px from the sides, 32 px corners, the booking box over its foot. Checked again on tap.turnsthe.page/pt-pt at 1440 and 390 (brief 419). |
| 3 | Homepage booking box | trip type, origin, destination, dates, passengers, Pesquisar; service tabs above it (Reservar voo, Fazer Check-in, Gerir reserva, Estado do voo) | nothing | function | fixed: the `booking-box` block on the seven homepages (f94aa639; ema-adobe's block, booking-spec.md 5.1) |
| 4 | Alerts | a ticker above the header ("2/8 Aviso de Viagem …", Ver todos) and a notice bar (Intermediação de Crédito) | nothing | function + import | done: the alerts bar (562d1e1f), the alerts pages with the message-center block (2ebcb631, 57150fe2), the notice strip under it (b9d689da); checked on tap.turnsthe.page against www.flytap.com at 390 and 1440 (brief 378), /pt-pt |
| 5 | Content width | 1120 px content in a 1240 px container | 1264 px content at 1440 | theme | fixed |
| 6 | Headings | bold GT Flexa 40 px h1 and h2, 28 / 24 px on phones | h1 48 px, h2 light 300 | theme | fixed |
| 7 | Buttons | 40 px pills, 15 px regular labels; white pill on pictures | 48 px bold green pills everywhere | theme | fixed (on pictures: white, TAP-scoped) |
| 8 | Service chips (homepage, under the stage) | one row of white pill chips, icon left of the label, arrows | a grid of large square tiles (cards-icon) | variant (cards-icon `chips`) | done (V2: 3d00b1aa, the extras' pill carousel); checked on tap.turnsthe.page against www.flytap.com at 390 and 1440 (brief 378), /pt-pt |
| 9 | Miles&Go card (homepage) | one card: light green panel, small Miles&Go logo, title, lead, text, button; the photo right behind a green chevron | four cards (the other three are for other member states), each logo stretched to the column's width | import + pictures + variant | done: the import (the first card only, the logo out of the stretched cell); the panel and chevron (V3, 58c6ab0f, columns-media panel). Checked again on tap.turnsthe.page/pt-pt at 1440 and 390 (brief 419). |
| 10 | Mercados de Natal banner (homepage) | a 1120 px rounded banner, white text straight on the picture, white pill button | a full-bleed picture with a dark text box | variant (hero-card-overlay `inset`, text without box) | done (V4: 58c6ab0f, the banner in the column, the text on the picture, the white pill); checked on tap.turnsthe.page against www.flytap.com at 390 and 1440 (brief 378), /pt-pt |
| 11 | "Planeie a sua viagem" cards | four cards in a row, picture with 16 px corners, title centred under it | a carousel of large cards, 32 px corners, title left | theme (radii) | done: the radii; the centred titles (V5, 0e6d2737). Checked again on tap.turnsthe.page/pt-pt at 1440 and 390 (brief 419). |
| 12 | Footer | two rounded cards (link columns; a side card with the logo, "Siga-nos" and its icons, "TAP App" and the store badges), then a rounded copyright bar "© 2026, TAP. Todos os direitos reservados." with Star Alliance | one grey band, the store links as text, the social icons nearly invisible (drawn #EBEBEB for a dark footer), no copyright | import (headings, store badges, copyright) + theme (icons) + variant (the card layout) | done: the import and icons; the cards (V6, 58c6ab0f; Star Alliance 40662f20): the columns card at radius 32, the side card at 24, the copyright bar. Checked again on tap.turnsthe.page/pt-pt at 1440 and 390 (brief 419). |
| 13 | Breadcrumbs, inner pages | home icon > ancestors > page, under the header | none | import (lh-com's breadcrumb from Parent metadata) | fixed |
| 14 | Page titles (ajuda, a-bordo, bagagem, miles-and-go) | the H1 and its lead centred | left | variant (section style `centered`) | done (V7: 0e6d2737, the titles and leads centred); checked on tap.turnsthe.page against www.flytap.com at 390 and 1440 (brief 378): a-bordo, ajuda, miles-and-go |
| 15 | Help cards (ajuda) | three per row, white, shadow, 24 px corners, no border, small buttons with a chevron | four per row, 1 px border, square corners | import (cards with the option three-up: itemsPerRow) + theme (TAP-scoped: three to a row, shadow, corners) | fixed; the chevron came with 0e6d273 (16 px, 8 px gap, black label); brief 416: as www's at 1440 and 390 (www.flytap.com/pt-pt/ajuda, en-pt/help): Material's chevron_right in a 24 px box 4 px after the label, label and chevron in gray-1200 #424045 (tap.css, the three-up and two-up cards' buttons); checked with the rules on tap.turnsthe.page before the push, after it on the host |
| 16 | Link lists (bagagem, ajuda) | a grid of grey rounded tiles, three per row, a chevron each | a bulleted list | import (cards-icon tiles) | fixed |
| 17 | Accordions (ajuda, informacoes, info-legal) | items on a grey rounded panel (#f7f7f8, 24 px), dividers | items on the page background | theme (TAP-scoped panel) | fixed |
| 18 | Inner-page banners (miles-and-go, stopover, destinos) | the carousel inset in the content column, 32 px corners, arrows and dots inside | full-bleed narrow stage | variant (hero-campaign `inset`) | done (V1: 077d0941 the stage, 0e6d2737 the inner banners): 1176 px at x 132 at 1440 as www (miles-and-go); checked on tap.turnsthe.page against www.flytap.com at 390 and 1440 (brief 378): miles-and-go, a-bordo |
| 19 | Image-only page banners (bagagem, info-legal, extras) | a rounded picture in the content column above the title | a full-bleed narrow stage without text | import (a picture in the content) + theme (its corners) | fixed |
| 20 | Explore Miles&Go (miles-and-go) | a picture left, an accordion of link groups right | a picture and open lists | import (accordion-columns faq for the groups) | fixed |
| 21 | Category cards (a-bordo, informacoes) | a white tab label over the picture's top edge, the sub-links in a card list with chevrons | the label as a green heading under the picture, bullets | variant (cards-teaser `tab-label`) | done (V5: 0e6d2737, the category cards' tab labels and list panels); checked on tap.turnsthe.page against www.flytap.com at 390 and 1440 (brief 378): a-bordo |
| 22 | Pictures | the pictures at their size | missing ones (aem.flytap.com) left out; logos stretched | pictures | done (brief 394): no picture missing any more: media 019 and 023 brought the last ones in; `missing-pictures.txt` lists none since fc5f00e1 |
| 23 | Mobile header | a pill with logo, search, account, burger | a bar with a second row of quick actions | theme (floating bar) + function (F1) | done (brief 378, tap.css): the bar never hides on scroll, as www's; on the homepage it rises with the page to 16 px from the top (from 1025 px a scroll-linked animation; without one, as before); checked on tap.turnsthe.page against www.flytap.com at 390 and 1440 (brief 378): /pt-pt, a-bordo (120, 70, 16 px at 0, 50, 104 px scrolled, as www) |
| 24 | Search, account, language icons | in the bar | – | function | done (F1: 36ec98e2 the menu, b7fd82a6 the market button; search and account links to www as decided); checked on tap.turnsthe.page against www.flytap.com at 390 and 1440 (brief 378). Left, content: live's /pt-pt/nav has no flag row yet (the preview's has), so live shows a globe until the nav documents are published |
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
| 39 | Breadcrumb's place under the header | 176 px from the top (the bar and its green quick-action tab above it) | the tab and the trail at 176 px since b7fd82a6; left: the tab 196 px on phones, its corners and icons, the trail's 20 px rows | header (TAP variant) | fixed (brief 356: rows 72, 73) |
| 40 | Help centre contacts (ajuda) | a country / city picker with phone numbers, opening hours and desks | a link to www ("See on flytap.com") | variant (hotline-finder on brand tap) + data (a contacts sheet per root) | done (brief 362): the eight help pages' hotline-finder on `/<version>/help/contacts.json` with www's picture (tap-import.mjs), on preview: pt-pt opens on Portugal / Lisboa, pt-br on Brasil / Rio de Janeiro - Centro, en-pt with Spain on Alicante (+34 901 888 607, +34 900 053 913), as www |
| 41 | LUGGit (bagagem) | the LUGGit booking widget | a link to www | app | as decided (brief 378): stays a link to www |
| 42 | Stopover video (stopover) | a 32 px-rounded video, its title over it | columns-media: the video, the title beside it | import (ema-lufthansa) | the form done in the import (brief 341; checked at 1440 and 390, brief 357): hero-card-overlay, 32 px corners, the title over the picture, 1120 wide, the play control. Done (brief 368; checked at 1440 and 390): the video's frame 420 px at every width, its title 44 px from the top and 64 px in from 1024 px (24 px at 390), as www |
| 43 | FAQ teaser card (stopover) | a #fcfcfc card with a 4 px green left edge, an outline button over its width | a heading, a line and a green button | import (a section style) | done (40662f20 the section style `info-card`, bcc1246c the import writes it): #fcfcfc, 4 px green edge, the outline button as www; checked on tap.turnsthe.page against www.flytap.com at 390 and 1440 (brief 378), /pt-pt/stopover. (At 1440 our Inter sets its line 2 % wider, so it takes two lines and the card is 168 px against 147) |
| 44 | A lone button under the text (stopover "Book now") | centred | at the left | import (no marker in the content tells it from left-aligned ones) | done (40662f20 the section style `centred-button`, bcc1246c the import writes it): "Reservar agora" centred as www (720 / 195 px); checked on tap.turnsthe.page against www.flytap.com at 390 and 1440 (brief 378), /pt-pt/stopover |
| 45 | Destinations map and cards (destinos) | Smartvel's map, filter chips and destination cards | the continents as an accordion, the get-inspired banner | variant (poi-map on brand tap) + data (a destinations sheet per root) | map done (brief 339); the destination cards: the destination-grid block (row 84, 6d07793c); the eight sheets and the block on the pages: ema-lufthansa |
| 46 | Homepage Miles&Go cards | four cards stacked as on www | the visitor's card as text and a picture | import: drafts/miles-go-stack (ema-lufthansa's importer) | settled (brief 394): the four-card Miles&Go stack is on www, tap.turnsthe.page and the preview (live since 4 November, brief 341) |
| 47 | Christmas banner title on phones | "Christmas Markets / in Europe" | "Christmas / Markets in Europe" (the same 32 / 38.4, 500, -2 %, 310 px box) | theme: not the fonts (www's files, sha256 equal) but lh-com's text-wrap: balance on the hero card | fixed (brief 339) |
| 48 | Market roots' homepage stage (es-mx, es-ar, pt-ao) | a fare carousel ("Voos desde 1 616 149 Kz", "Vuelos desde MX$34,391"), www's prices per market | no stage: the booking box at the top | import (ema-lufthansa: the roots' stage slides; the prices are www's live fares) | done (brief 394): es-mx, es-ar, pt-ao and the other roots whose stage was mostly destination slides show Portugal Stopover and the destinations with their photos, "book now" to the root's booking box; the fares stay with TAP. Live 5 November 09:03 CET |
| 49 | Market roots' fourth Miles&Go card (pt-br, fr-ca, pt-ao) | four cards, the fourth the market's credit card (TAP BTG Pactual Black, Cartes de Crédit, VISA TAP Gold) | three cards (en-us has its fourth) | import (ema-lufthansa) | done (brief 341, on the live site since its publication): pt-br, fr-ca and pt-ao show the four cards, the fourth the market's credit card (www's rule: ca, pt, br, us, ao); checked rendered on tap.turnsthe.page, 2026-11-04 (brief 354) |
| 50 | Market roots' Miles&Go section served | the four cards | tap.turnsthe.page serves mostly the published one card (`columns-media`), now and then the four-card stack (`columns-media stack`), with the same last-modified (pt-br, de-ch, en-gb, rechecked at 17:30). The preview has the stack. | publishing the roots' homepages | fixed (the steering session: /en-gb, /de-ch, /pt-ao, /en-us and /fr-fr, three requests each, the stack every time) |
| 51 | Market roots' alerts bar (en-gb and others) | the root's own alerts ("Measures Related to Ebola Outbreak", 3/6) | another market's ("… for Travel to the US", 2/7) | alerts bar (ema-adobe) | as www (the steering session: www's /en-gb shows the US advisory too, on every root; the same 6 alerts in the same order. The 2/7 was read while TAP's maintenance notice still showed; it expired at 16:25) |
| 52 | Market roots' `html lang` | the market's (`pt-ao`, `en-gb`, `de-ch` …) | the language (`pt`, `en`, `de`) | scripts (ema-adobe) | fixed (de7fabe9: pt-ao, en-gb, de-ch, en-us) |
| 53 | Market roots' footer | "Cookie settings" in the second column; Star Alliance as www's picture; Google Play before App Store | no cookie settings link; "A Star Alliance member"; App Store first | import (ema-lufthansa: the footer documents) | done: Google Play before the App Store (9ca05435), Star Alliance www's 140 x 20 logo (40662f20); the cookie settings link stays out as decided (no consent tool); checked on tap.turnsthe.page against www.flytap.com at 390 and 1440 (brief 378), /pt-ao |
| 54 | Market roots' help contacts | the finder with the market's country and city first (Schweiz / Genf, Angola / Luanda) | "See on flytap.com" | the eight sheets are in DA (brief 352); the help documents (ema-lufthansa) | done (brief 362): a root is answered from its language version's help page and the block picks the root's country: de-ch on Schweiz / Genf (+41 432 107 138), checked with preview's /de-de/hilfe under /de-ch/hilfe; on tap.turnsthe.page once the eight help pages are published |
| 55 | Contacts picture | a green chevron line over the picture's right edge | none | theme (TAP-scoped, hotline-finder-tap) | fixed (brief 344) |
| 56 | Booking box's selects | a green triangle as the selects' arrow | a chevron | booking box (TAP-scoped rules) | fixed (brief 352) |
| 57 | Footer's Star Alliance logo (ema-lufthansa's 336) | www's picture, "STAR ALLIANCE" and the star, 140 x 20 | lh-com's "A STAR ALLIANCE MEMBER", 205 x 20 | footer (TAP variant) | fixed (brief 352) |
| 58 | Stopover's centred button (ema-lufthansa's 336) | "Reservar agora" centred 32 px under the text, the electric green pill, 16 / 500 | at the left, TAP green, 15 / 400 | theme (`centred-button`) | fixed (brief 352) |
| 59 | Stopover's FAQ card (ema-lufthansa's 336) | a light card with a 4 px green edge, 567 px, centred; title 18 / 500, text 14 / 21 grey, an outline button | plain text and a primary button | theme (`info-card`) | fixed (brief 352) |
| 60 | Feature card titles (ema-lufthansa's 350, Ispirati finding 167) | H3, GT Flexa 24 / 28.8 bold | H2 (40 / 48 at 1440) | theme: the H3's TAP style is in (brief 352); the documents' H2 to H3 (ema-lufthansa) | done (theme 352, the documents' H3 357): feature card titles GT Flexa 24 / 28.8 700 as www; checked on tap.turnsthe.page against www.flytap.com at 390 and 1440 (brief 378) (1440), /pt-pt/destinos/inspire-se |
| 61 | Rich text's subscript and superscript (Extras' "Para extras de bagagem …", 265 pages) | plain text at the text's size | `<sub>` / `<sup>`: small and lowered | import (ema-lufthansa) | fixed (brief 357) |
| 62 | Heading levels: hero card, video banner, info alert | H3, H3, H4 (43, 14 and 130 of all in the captures) | H2, H2, H3 | import (ema-lufthansa) | fixed (brief 357) |
| 63 | Info alert ("Informação importante": check-in information, insurance, time to think … 152 pages) | a 1120 px box (`rounded-xs p-4 bg-info-subtle border-l-[4px] border-info-press`): light info blue, a 4 px info-blue left edge, an info icon, the title an H4 (`text-title-2xs font-medium`), a close button | lh-com's grey full-width band (section style `highlight`) | theme (ema-test: `body.brand-tap main .section.highlight`); the close button a function | done (brief 374): ema-test's info-alert on all 152 pages with one, every version (tap-import.mjs); checked at 1440 and 390 on /pt-pt/informacoes-check-in, /en-pt/bookings/insurances and /de-de/check-in-informationen: the same box, colours, 4 px edge, corners and H4 as www, the close button closes; www's 30 not dismissable (insurance …) are `info-alert (static)`, row 101 |
| 64 | Miles&Go's picture and accordion ("Explorar o TAP Miles&Go", every version) | the next heading 80 px under the picture | the next heading beside the picture, the section 69 px shorter than the picture | theme (ema-test): tap.css's `main > .section:has(> .default-content-wrapper:has(…) + …)::after` nests `:has()`, so the browser drops it; e.g. `body.brand-tap main > .section:has(> .default-content-wrapper > p:last-child > picture):has(> .accordion-columns-wrapper > .accordion-columns.faq)::after` | done (brief 368): two `:has()` side by side, as proposed; the next heading 80 px under the picture at 1440, as www |
| 65 | FAQ (perguntas-frequentes, every version) | the categories as pills; under the chosen one its subcategories in a list on the left, their questions on the right (2,009 px at 1440) | every category, subcategory and question one after another (20,430 px) | variant (ema-test: `accordion-columns (tabs)` has one row of tabs, www's picker two levels) | done (brief 368; checked at 1440 and 390): `accordion-columns-tap.js` on the FAQ page only (its slug in TAP's languages): the categories as pills, the chosen one's title centred, its subcategories as vertical tabs (398 px card) beside the questions from 1024 px and a select on phones; a #hash of a category or subcategory picks it. `accordion-columns.js` (shared) only hands a TAP page's FAQ blocks to it |
| 66 | Extras' click-to-call card (CoreMedia 2023-flight-extra, 28 pages; the 2020 to 2022 c2call teasers alike) | "Dê um boost à sua viagem": a phone field, "Ligue-me", the hours, an agent's photo; a floating "Ligamos grátis" button | "Ver em flytap.com" | new block (ema-test): a callback form of TAP's CoreMedia Engagement Cloud, nothing in the capture to import | done and live (brief 394): the click-to-call cards on 74 pages, published 5 November around 14:45 CET; four pages have none, as on www |
| 67 | Card grids (cards-teaser three-up: reservas, informações, gerir reserva …) | rows 281 px apart at 1440 and 390, the first 426 px from the top at 1440 | 323 px at 1440, 294 at 390; the first at 396 | theme (ema-test) | done (brief 368): the rows 24 px apart, 281 px at 1440 and 390, as www; the first row 8 px higher than www's, left |
| 68 | A page's top banner (hero-campaign narrow: extras, bagagem, Miles&Go …) | 1120 x 305 at 1440 | 1176 x 404 | theme (ema-test) | done (brief 368; checked at 1440): a single banner 1120 x 305 from 1024 px, its title and lead centred (32 / 38.4 700, 18 / 27), 64 px under the trail (a slider 96, 48 under it) |
| 69 | Body text (every page, every width) | Inter with www's body letter-spacing -1 % (the stopover card's text on one line in 515 px) | no letter-spacing: 1 % wider (that text on two lines, labels a few px wider) | theme | fixed (brief 356) |
| 70 | Header on phones | the logo 130 x 17; search, person and menu 4 px apart, www's drawings (Material's person and menu, light) | 166 x 21; 8 px apart; lh-com's search, a filled login icon, a small burger | header (TAP variant) | fixed (brief 356) |
| 71 | Homepage with the extra strip on phones (pt-pt, en-pt, fr-fr) | the alerts, the strip, then the bar 16 px under it (120 px), the stage at 200 | the bar under the alerts (68 px), the strip under the bar | header (TAP variant) and theme | fixed (brief 356) |
| 72 | Quick-action tab (inner pages) | 180 px on phones (12 px inside, 4 px apart), 56 px high with 48 px corners at 1440, www's four drawings; the open menu's card over it | 196 px, 55 px with 32 px corners, Material's icons; the tab over the open menu | header (TAP variant) | fixed (brief 356) |
| 73 | Breadcrumb and the title under it | 26 px rows 6 px apart, Inter 14 / 21, the house in a 24 px box, chevrons 6 px either side; the title 24 px under it on phones, 64 px at 1440; the trail at 176 px on Miles&Go too | 20 px rows, 8 px either side; the title 48 px under it; Miles&Go's trail 24 px lower | theme | fixed (brief 356) |
| 74 | A single inner banner on phones (altitude-film-festival) | 380 px high, 24 px inside, the title 32 / 38.4 500, the lead 16 / 24 600, centred; the title 32 px under it | 267 px, 16 px inside, 28 / 34 700 and 20 / 30, at the top; 64 px | theme | fixed (brief 356) |
| 75 | Booking box on phones | origin and destination 245 px with the swap button beside them, 12 px between the fields, inputs 20 px under their labels, the dates 44 px, the search 12 px under the passengers; Material's sync icon turned 25 degrees; values #020817; the search label 500; the corporate link regular | every field 310 px, 16 px apart, 24 px under the labels, 52 px dates; arrows ⇄; #424045; 400; bold | booking box (TAP rules) | fixed (brief 356) |
| 76 | Help cards (help, stopover) | the button 48 px under the text, 40 px, 15 / 500; 24 px under it; shadow 0 2px 8px 10 % | 24 px under, 43 px, 400; 47 px under it; 0 2px 16px 8 % | theme | fixed (brief 356) |
| 77 | Footer on phones | the social icons 44 px from one to the next | 48 px | footer (TAP rules) | fixed (brief 356) |
| 78 | Miles&Go cards' buttons (homepages) | 15 / 500 | 15 / 400 | theme | fixed (brief 356) |
| 79 | Booking box's airport list (open) | the list filtered to the field's value (Madrid: MAD, MSN), as wide as the field, a clear button and the arrow in a light green circle | every airport from A, 310 px, the value selected | `scripts/airport-combobox.js` (shared, not in my files; ema-adobe) | done in my files (brief 368): `airport-match.js` as www's booking widget's matcher (its rules, weights and order, ties by city as plain strings; "Lisboa, Portugal" gives LIS, FLN and IND on focus as www: the list for the airport's code), the list `width: 100%` at 1440; a search hands over as before. Left: www's destination list is TAP's routes from the origin (destinationSearch, 3 for "Mad"), ours the full airports sheet (6); that needs a destinationSearch capture per origin |
| 80 | Stage controls on phones (homepages, slider banners) | Material's thin chevrons, the last slide's next button a grey disc | lucide's 2 px chevrons, no disabled state | theme and the stage's TAP variant | fixed (brief 363) |
| 81 | A single inner banner's picture on phones (altitude-film-festival) | a flat 20 % black veil (`bg-overlay-image-subtle`) | a dark gradient over its top half | theme | fixed (brief 363; the phone crop: row 94) |
| 82 | Footer documents (es-es and others) | YouTube before LinkedIn; "© 2026, TAP." in bold | LinkedIn first; the note plain | import (ema-lufthansa: the footer documents) | fixed (brief 362: tap-nav.mjs, the 8 language and 132 root footers) |
| 83 | Homepage stages (es-es) | three slides | two (pt-ao none: row 48) | import (ema-lufthansa) | closed (brief 394): es-es has three slides, published 5 November 07:29 CET; all 137 roots' stages are www's of 5 November (tap-snapshots-024), live since 09:03 CET |
| 84 | Destinations page (en-pt/destinations, every version) | www's destination grid: filters, 16 destination cards, the continents' lists (5,084 px at 390) | the title, the lead and the inspiration banner (2,668 px) | import, perhaps a new block (ema-lufthansa) | live (brief 394): the destination grid on the 8 destinations pages, without photos; open: the Smartvel photos (the question about them is still open) |
| 85 | Homepage headings (every root) | "Planeie a sua viagem ao detalhe" an H1; the Miles&Go cards' second lines H2 (Inter 14 / 21 600) | H2; paragraphs | import (ema-lufthansa; row 62 covers the hero card's H3) | the documents done (brief 362: the card list's title the H1 on all 145 homepages, www's on all 145; no hidden H1; the Miles&Go second lines H2). Theme done (brief 372; checked at 390 and 1440 on the eight homepages): the H1 takes the carousel heading's rule (`… > :is(h1, h2, h3):last-child`: 28 / 33.6 at 390, 40 / 48 from 1024 px, centred, www's place: y 1087 on pt-pt at 1440, as www), the second lines `.columns-media-text :is(h2, h3) + h2` Inter 600, 14 / 21 and 20 / 30, -1 %, as www. Today's live pages unchanged (main's code and this one give the same values on live content) |
| 86 | Stage and card carousel dots (homepages, slider banners) | 40 px buttons, an 8 px dot inside | 8 px buttons (axe target-size, WCAG 2.5.8: 78 nodes on 22 page-widths) | theme | fixed (brief 363: 24 px targets, the dot drawn inside) |
| 87 | Booking box: a focused field | www's line in TAP's dark green (`focus:border-primary`) | a 1 px #65c922 line, 2.3:1 on white, no other ring | booking box (TAP rules) | fixed (brief 363: 2 px #397213) |
| 88 | Booking box: the calendar and the keyboard | — | Tab past its last button leaves it open over the next fields (WCAG 2.4.11) | booking box (TAP variant) | fixed (brief 363: it closes, the focus stays where it went; Escape as before) |
| 89 | Phone menu by keyboard | — | the card sits before its button, so Tab went past it to the quick-action tab under it; Escape did nothing | header (TAP variant) | fixed (brief 363: the focus goes to the card's first item, Escape anywhere closes it and returns to the button, the tab inert while it is open) |
| 90 | Skip link | "Skip to main content" first in the page | none (first stop the alerts bar) | header (TAP variant) | fixed (brief 363: in the page's language, to main) |
| 91 | Booking box: the empty dates field | "Selecionar datas" #b0aeb4 on white (2.19:1) | the same | www's design (axe flags ours, not www's) | as www |
| 92 | Help page heading levels | H1, then the cards' H3 with no H2 (axe heading-order on www too) | the same | www's design / import (ema-lufthansa) | as www |
| 93 | Alerts bar rotation | every 5 s, no pause button (stops on hover and focus) | the same: stops on hover and focus, off under reduced motion | `blocks/flash-teaser/flash-teaser-tap.js` (ema-adobe), if a pause button is wanted (WCAG 2.2.2) | as www |
| 94 | A single inner banner's picture on phones (altitude-film-festival) | a phone crop (1280 x 630) | the 1920 x 450 desktop picture | import (ema-lufthansa: the banner's phone image) | the import ready, off (brief 363): www's hero cards (98) and stage / carousel slides (113) carry a phone rendition (imageMobile, www's below 728 px; 41 distinct files, all in our picture archives); with `phonePictures` tap-import.mjs writes it as the picture cell's second picture. Block (ema-test): hero-campaign and hero-card-overlay keep a second picture as content today; once they show it as the phone picture below 728 px (`<source media="(min-width: 728px)">` the first), ema-lufthansa switches the import on and uploads the pages. Checked /pt-pt/a-bordo/altitude-film-festival: at 390 www 728 x 358 of the 1280 x 630, ours 750 x 176 of the 1920 x 450 in the 358 x 380 box Blocks done (brief 372; checked at 390 and 1440): on TAP, hero-campaign (a single banner and the slider's slides) and hero-card-overlay take the picture cell's second picture as the phone one, one `<picture>` with the first's sources from 768 px (`(min-width: 768px)`) and the phone picture's below; elsewhere as before. ema-lufthansa can switch the import's phonePictures on. Import on (brief 374): the language import and the market merge pass phonePictures; /pt-pt/a-bordo/altitude-film-festival at 390 shows the phone rendition (750 x 369 of the 1280 x 630) as www, at 1440 1120 x 305 as www. The homepages' slides wait for their publication |
| 95 | Comparison tables' cells (the fares on tarifas-tap, the Clubs on club, the extras' tables) | ✓ and ✕ icons, a note as an (i) tooltip; after the table "Legenda" (✓ Serviço incluído, ✕ Serviço não incluído) and "Notas", each an H2 | the raw "[yes]", "[no]" and "value|note" | import (ema-lufthansa) | fixed (brief 363: ✓ / ✕, the note under its value, www's legend and notes in its texts) |
| 96 | Comparison tables' column headings (the Club's prices) | "Club Basic" over "109 EUR / ano" … "1 189 EUR / ano" and Platinum+'s "Oferta limitada" | the Club's name only | import (ema-lufthansa) | fixed (brief 363) |
| 97 | Footnote marks in card texts (Wi-Fi's data packages, bagagem de mão …) | left out ("emojis incluídos ."; 126 of 126 in generic, simple and feature cards) | "(1)", "(2)" | import (ema-lufthansa) | fixed (brief 363; rich text and accordions keep them, as www mostly does) |
| 98 | Card lists of one a row (itemsPerRow 1: Wi-Fi's data packages; 16 lists) | one full-width card a row | two a row | import + theme | done (brief 378, tap.css): one-up one card a row at every width, 24 px between the cells, the text 40 px above the foot; checked on the local preview (this branch's code) against www.flytap.com at 390 and 1440: pt-pt, en-pt and pt-br Wi-Fi (326 / 1088 px wide, 56 px apart, 157 / 133 px high as www) |
| 99 | Fare comparison's look (tarifas-tap, every version) | route-group pills over cabin tabs, the fares as columns with coloured tops, ✓ in green circles, the notes as (i) tooltips, a "Comparar tarifas" filter; 3,088 px at 1440 | the route groups as H2s, the notes in the cells (7,328 px at 1440) | variant (ema-test: table-striped matrix in TAP's look, tooltips, the filter a function) | live (brief 394): the fare pages in `fare-comparison` on all 8 versions; page heights against www: pt-pt 3,102 px vs 3,088 at 1440; at 390 pt-pt 3,489 vs 3,410, en-pt 3,423 vs 3,367 |
| 100 | Banners' and slides' phone pictures (row 94's follow-up) | the phone rendition below 728 px | the desktop picture | block (ema-test: hero-campaign, hero-card-overlay); then the import (ema-lufthansa) | done for the inner pages (137756ba the blocks, 9bad231f below 728 px as www, d2e8ecb5 the import on); the homepages' stage slides still have one picture each (preview and live): their import, ema-lufthansa |
| 101 | Info alerts www shows without a close button (dismissable false: the insurance pages and others, 30 of 152) | no close button | a close button | import + block | done (brief 380): `info-alert (static)` has no close button, as www; every alert's text as www lays it out (no room kept for the close, the list in a 12 px margin and padding, Inter 500). Checked at 390 and 1440 on the local preview against www.flytap.com: /en-pt/bookings/insurances (static) and /pt-pt/informacoes-check-in. Left, content: www's check-in alert joins its two sentences where our document has a line break (ema-lufthansa); www's insurance text sits in an inline 11 pt span (22 px lines), which documents do not carry |
| 102 | Miles&Go partners page (round 3) | a two-level picker: the category pills, the partners on the left, the chosen partner's details on the right | one list | TAP's theme, importer and documents (ema-lufthansa) | fixed and live (brief 386 round 3, 12a7895b) |
| 103 | Inner pages' slider text (round 3) | the text of www's swiper on inner pages (miles-and-go and others) | lh-com's slider text | TAP's theme (ema-lufthansa) | fixed and live (brief 386 round 3, 4c151e97) |
| 104 | Info card (round 3) | www's CardInfoBlock ("Milhas necessárias por zona" on the buy-ticket page) | a plain card | TAP's theme (ema-lufthansa) | fixed and live (brief 386 round 3, b107eeac) |
| 105 | Inner pages' spacing (round 3) | www's components' spacing on the inner pages | lh-com's spacing | TAP's theme (ema-lufthansa) | fixed and live (brief 386 round 3, 2620d755 with row 67); 161 px short on the hand baggage page at 390 in the user's check (ema-lufthansa, brief 393); 2e28a112 (TAP's theme, on main since 5 November) gives its footer -39 px at 390 and -56 at 1440 (not measured by the lh-com migration agent) |
| 106 | Feature card's picture frame (round 3) | the picture in www's green chevron frame (the Star Alliance partners card) | no frame | TAP's theme (ema-lufthansa) | fixed and live (brief 386 round 3, 1887f4db) |
| 107 | Comparison tables' notes (R4-1, round 4: the Club's on miles-and-go/club; the fare pages) | each note behind a 24 px (i) 8 px after its label, value or column heading, the note in a tooltip | table-striped: the note in italics under its text | shared code (table-striped, brand-neutral) | fixed (brief 403, 9220be1): a cell ending in a line break and italic text shows the text and an (i) ("Mais informações", "More information" …), the note in the block's tooltip; the Club's tables 7 notes, its rows www's height (90 px, not 232); fare-comparison had its (i)s already. Checked on tap.turnsthe.page at 1440 and 390, /pt-pt and /en-pt/miles-and-go/club: no italics left, no sideways scroll. Brief 406 (cccb87f): a column heading's (i) ("Club Platinum+") at the cell's top right beside the heading as www's, no longer on a line of its own at 1440; the heading row 141 px as before (checked on tap.turnsthe.page at 1440 and 390) |
| 108 | Fare tables' Legend and Notes headings (R4-2) | H2s | H3s | shared code (fare-comparison) | fixed (brief 403, 9220be1): H2s, the look unchanged (14/21 600 at the same place); checked on /pt-pt/reservas/tarifas-tap and /en-pt/bookings/tap-fares at 1440 and 390 |
| 109 | Help page's contact headings (R4-3: Contact Center, Lost & Found …) | H2s | H3s | TAP's hotline-finder (hotline-finder-tap.js) | fixed (brief 403, 9220be1): H2s, the look unchanged (24 px 500 green, same place); checked on /pt-pt/ajuda and /en-pt/help at 1440 and 390 |
| 110 | Economy Prime pages' comparison table (R4-8: Prime / Top Prime, /pt-pt/a-bordo/economy-prime, /en-pt/on-board/economy-prime) | as on the fare pages: card columns from 1024 px, the phone table with its scroll buttons, ✓ / ✕ icons, the legend and notes in a box under it; 1,263 px at 1440, 1,006 at 390 (pt-pt) | table-striped in an 840 px box and a 263 px legend under it (1440), 1,103 px at 390 | shared code, TAP-scoped (table-striped-tap.js, fare-comparison's one-table form) | fixed (brief 406, c3555af): on brand tap such a table becomes a fare-comparison block of one table, the legend and notes its caption box; 1,270 px at 1440 and 994 / 952 at 390 (pt-pt / en-pt) on tap.turnsthe.page after the push. The phone rows as www's (label cells 8 px all round, ✓ in a 24 px box), which also brings the fare pages' phone table to www's (pt-pt 696 px, www 707; en-pt 641, www 640). The Club's tables (matrix) stay table-striped |
| 111 | Entertainment pages' news (R4-10: cards-teaser option slider, /pt-pt/a-bordo/entretenimento, /en-pt/on-board/entertainment) | from 728 px a round previous and next (40 px, #f7f7f8, Material's chevron at weight 300) 16 px either side of the row, three cards in view from 1024 px (two below), one a step, bullets under the row; the slider 60 px inside its column at 1440 (the row 888 px), 48 px up; a grid on phones | one row of four from 1024 px scrolled inside the list, no controls | shared code, TAP-scoped (cards-teaser-tap.js, tap.css) | fixed (brief 407, aed8177f): measured on www.flytap.com/pt-pt/a-bordo/entretenimento at 1440, 1280, 1024, 768 and 390 (two loads); on the local preview with this code at the same widths: the row 888 px, the buttons at x 220 and 1180, the cards 32 px under the heading, as www's at 1440 and 1280; previous unavailable at the start (aria-disabled, the focus kept), one card a step, the bullets follow; phones the grid; axe clean at 1440 and 390 (pt-pt, en-pt) |
| 112 | Destinations pages' widget (sweep 2026-11-08, tools/reports/parity-2026-11-08/sweep-tap.md: /en-pt/destinations, /pt-pt/destinos and every version) | Smartvel's Explore&Go as one piece: from 1024 px the list a 365 px column (one card a row, the picture 150 x 150) scrolling in a box as high as the 790 px map 16 px beside it, the search 302 px; on phones the map (358 x 523) between the bar and the list | the grid of three a row (two on phones), the map in its own section below it with its region pills (3,789 px at 1440, www 2,990) | TAP's block (destination-grid placeMap, destination-grid.css) | fixed (brief 478): the page's poi-map moves into the grid between the bar and the list and is loaded there, its section goes; measured on www.flytap.com/en-pt/destinations at 1440 and 390; on the local preview with this code: 2,865 px at 1440, the pixels 28.9 to 22.5 % (390: 46.3 to 39 %). Left: Smartvel's map style and zoom, the cards' order on www's phones, the chips' icons |
| 113 | Card lists www swipes on phones (mobileType slider: promos' News & Highlights, the Miles Store, partners, payment methods, donate miles; 24 documents) | one card a view with dots below 1025 px (the current dot a green pill) | the cards one under the other (en-pt promos 4,370 px at 390, www 4,009) | importer (tap-import.mjs: cards-teaser option phone-slider) + TAP's dots (tap.css) | fixed (brief 478): the option from mobileType slider; on the local preview with the document as the importer writes it 3,993 px, the pixels 22.4 to 18.6 %; 6 documents set in DA (publish-list-tap-478.txt), 18 for the harness (reimport-tap-478.txt) |
| 114 | The picture over an inner page's title (bagagem, info-legal and their versions) | the picture where a first title starts (226 px on phones, 266 at 1440), the title 32 px under it on phones, 64 at 1440 | the picture 40 px higher at 1440, the title 48 px under it at both widths | TAP-scoped CSS (tap.css) | fixed (brief 478): picture and h1 at www's positions on en-pt baggage, en-pt and pt-pt legal hubs at 1440 and 390 (local preview); the legal hub's pixels 14.7 to 10.7 % at 1440 |
| 115 | Homepages' Miles&Go cards (all nine: pt-pt, en-pt, es-es, fr-fr, de-de, it-it, pl-pl, pt-br, en-us) | from 1280 px a GSAP pin: every card but the last held for 1000 px of scroll, the next sliding over the one before, the last card right after (the region 2,160 px with three or four cards); from 1024 px a column 16 px apart | flat cards (n x 580 + gaps; a deck of sticky cards at 48 to 138 px from 1024 px): ±5 to 9 % page height at 1440 | TAP-scoped (columns-media-tap.js pinStack, loaded on brand tap; tap.css) | fixed (brief 480): every card but the last in a pin box of 580 + 1000 px, its cards sticky at 160 px a step apart (1000 px over the steps), the tones kept; local preview: pt-pt 4,836 to 4,580 px and de-de 4,197 to 4,553 (www 4,621 and 4,596); 390 unchanged. Left: www fades the next card in (ours visible below the pin); the pin's top on www not measured (ours centres the 580 px card in a 900 px window) |
| 116 | Stage and banner slides' titles (homepages' stage, the inner pages' banners) | in a span, no heading | h2s (three or four extra on every homepage) | TAP-scoped (hero-campaign-tap.js plainTitles; tap.css) | fixed (brief 480): a slide's h2 to h6 a paragraph hero-campaign-heading (content and id kept), an h1 kept; the look unchanged (the TAP rules name the class) |
| 117 | A banner carousel of one slide (/fr-fr, /de-de, /es-es miles-and-go and 37 more documents) | as several slides without the controls: 1,176 x 404 with the green wedge at 1440, 358 x 259 at 390 | a plain narrow banner, 1,120 x 305 (380 on phones), no wedge | importer (tap-import.mjs) | fixed (brief 480): always the option slider (the TAP slider's one-slide case); local preview of fr-fr miles-and-go: the banner at www's place and size at both widths, the page -7.7 to -3 % at 1440; 2 documents set in DA (publish-list-tap-480.txt), 38 for the harness (reimport-tap-480.txt) |
| 118 | Help centre's FAQ title to its panel (help, ajuda and the versions) | 32 px less than the sections' gap from 768 px (the heading wrapper's md:-mb-8) | the sections' 64 px: the contacts and all below 32 px lower at 1440 | TAP-scoped CSS (tap.css) | fixed (brief 480) from 1025 px: the section closing with the title 32 px from the FAQ panel; local preview: every heading of en-pt, pt-pt and pt-br help at www's place at 1440 (pt-pt's pixels 5.7 to 3 %). The sweep's "pt-br lists three contact groups where www shows one" was www's finder still loading in the capture (grey placeholders): not a difference |
| 119 | Homepages whose stage is the first section (de-de, es-es, it-it, pl-pl, pt-br, en-us) | the stage right under the alerts bar (and the header's room on phones) | 25 px lower (styles.css's first-section offset; the link strip's homepages had it undone already) | TAP-scoped CSS (tap.css) | fixed (brief 480): the title at www's place within 8 px at 1440 and 390 (was 17 to 31 px lower); de-de's pixels 30.6 to 20.5 % at 390, 26.6 to 18.8 % at 1440 |
| 120 | Two-up text cards (promos' offers and every two-a-row list of text cards) | rows 24 px apart (gap-6), the cards' 16 px margins aside | 66 px (cards-teaser.css's lufthansa.com value): the second row 43 px lower | TAP-scoped CSS (tap.css) | fixed (brief 480) from 768 px; local preview of en-pt promos at 1440: the second row at 996 (www 995), the pixels 11.6 to 8.1 % |
| 121 | Homepages' pinned Miles&Go cards while scrolling (row 115; www.flytap.com/pt-pt and /de-de at 1440, 100 px steps through the pin) | the stack held at 160 px; each next card 30 px below the one before (190, 220 px), coming in at the front card's bottom edge with its opacity from 0 to 1, settled about 200 px (second) and 380 px (third) into the pin; the last card sliding up over the stack (305 px from the top 700 px into the pin), the page 580 px shorter once scrolled (4,041 against 4,621 px unscrolled) | the cards at 160 px, coming up at the scroll's pace without a fade, the second settled 500 (pt-pt) or 1000 px (de-de) in, the last card after the pin | TAP-scoped CSS (tap.css; columns-media-tap.js without the step) | fixed (brief 483): 30 px apart, the fade a scroll timeline (none without one or for reduced motion), the second settled 290 px in, the third 400, the last card 580 px up: 300 px from the top 700 px in, the stack and it leaving together, the page's end 22 px from www's. Left: www's cards move faster than the scroll and the stack closes up to 160 px just before the last card |
| 122 | TAP slides on phones (the Miles&Go banners, the homepages' stage) | 259 px high whatever the text: the text runs over the area (en-pt miles-and-go's button to 494 px, the slide to 485) | the slide growing with its text (284 px on en-pt and pt-br miles-and-go: the title 25 px lower) | TAP-scoped CSS (tap.css) | fixed (brief 483): 259 px below 1024 px; local preview: the h1 at www's 597 px on en-pt and pt-br miles-and-go, the homepages' within 4 px |
| 123 | Text cards one under the other on phones (promos' offers and every two-a-row list of text cards) | 24 px between them (gap-6), the cards' 16 px margins aside: one card's start 587 px after the one before at 390 | 563 px (no gap below 768 px) | TAP-scoped CSS (tap.css; row 120's rule at every width) | fixed (brief 483): pt-pt promos at 390 on the local preview, the cards at www's 1,045, 1,579 and 2,166 px |
| 124 | Miles&Go tier cards on phones (miles-and-go and the versions) | a swiper: 247 px cards 24 px apart, under them previous, a dot per card and next (40 px, green chevrons, the unavailable one faded) | a row to swipe 16 px apart, no controls: the next section 120 px higher at 390 | TAP-scoped (blocks/cards/cards-tap.js, loaded by cards.js on brand tap for a list of cards with a picture; tap.css) | fixed (brief 483): the controls and the 24 px; local preview: the next section 56 (pt-pt) and 69 px (fr-fr) higher than www's. Left: www's tallest card is taller (its benefits' lines and heading) |
| 125 | The picture above an inner page's title on phones (bagagem, info-legal and 52 more documents) | the banner's phone picture (imageMobile) below 728 px | the desktop picture in the content (one picture a paragraph, no phone one) | importer (tap-import.mjs) | fixed (brief 488): the page's first picture-only hero card a one-row hero-campaign narrow of both pictures in a section of its own (the narrow banner already sits at www's places: 1,120 x 305 at 266 px and the title at 635 at 1440, 358 x 380 at 226 and 638 at 390; checked on the local preview for en-pt baggage, en-pt and pt-pt legal hubs); re-import list reimport-tap-488-legal.txt (54) |
| 126 | Inspiration pages' articles (es-es/destinos/inspirate, de-de/reiseziele/inspirieren) | a country's articles an accordion; an opened article's card lists (162 a language) swiped on phones | the articles' sections inside the accordion cells (no block in a cell: the card lists plain text) | importer (tap-import.mjs) + TAP's accordion (accordion-columns-tap.js loadPanelFragments) | fixed (brief 488): an article a fragment document of its own (108 a language), its sections as blocks (the card lists cards-teaser phone-slider), its accordion panel naming it as code (scripts.js loads every /fragments/ link with the page), loaded when its item opens; draft of es-es checked at 1440 and 390 (no article loads before its item opens). Re-import list reimport-tap-488-inspire.txt (216 articles, 22 categories, 2 pages; 6 old category fragments no longer written) |
| 127 | /en-pt at 1440: "www shrank from 4,836 to 4,000 px" (the standing order of 2026-11-10, item 3a) | www's recordings (tap-parity-001 and -002): 4,621 px, a capture that did not scroll: www's GSAP pin-spacer keeps 1,580 px for the Miles&Go cards until the page is scrolled through them; scrolled, www's page is 4,041 px (brief 483, row 121, measured while scrolling) | ours 4,836 (2026-11-08) -> 4,000: the change was ours, ed2c5846 (row 121: the pinned cards as www's while scrolling, the last card over the stack) | none | mine | as www's: ours 4,000 against www's scrolled 4,041 (-1 %); nothing on www changed; the sweep's 4,621 is the unscrolled capture |
| 128 | /en-pt/destinations/get-inspired's recording (tap-parity-002) | (unknown) | the recording unreliable: about 1,500 pictures not loaded on www's side (the user's count), www 5,582 / 4,957 px at 1440 / 390 against ours 39,589 / 42,993: not a measure | recording | mine | marked unreliable, out of the ranking; no other recording in the R2 drop has the page (tap-parity-001 has none); capture list capture-567-tap-get-inspired.txt for the next window (the pictures waited for, scrolled through) |
| 129 | The market comparison's import rows (tools/reports/market-diff/tap/import-list.tsv, brief 488; the standing order of 2026-11-10, item 3c) | www serves roots another variant of a language page without a rule: the version page local to its home market (pt-pt payment methods for 57 roots, en-pt payment methods 58, assistance animals 56, the club pages 55 each, pt-pt promos 14, ...), groups sharing a variant (en and pt /miles-and-go/promo, 8 roots each), single roots with their own page (34) | tap-markets.mjs kept the language version for every market where no rule explains a difference (a drift note) | importer | mine | step written (test/tap-market-groups-567.test.mjs): tools/markets/tap-market-groups.mjs turns the comparison into tools/reports/market-diff/tap/market-groups.json (17 language pages, 36 groups of 352 roots by the comparison's variant hash; 34 own documents of 21 roots; the alerts page left out: Message Center); tap-markets.mjs gives a group whose capture differs in a slot its unit with its countries and the language version's unit every other country, and adds the own documents to the roots' own pages. Nothing live changes before the run: reimport-567-tap-markets.txt (17 + 34), capture-567-tap-market-groups.txt (70) |
| 130 | The FAQ pages' categories under the title (the fresh ranking: /en-pt/help/frequently-asked-questions +3.5 % at 1440, tap-parity-002) | www's title (h1 pb-8) and its category chips 32 px under it | the title's section kept the sections' 64 px: the chips and everything under them 32 px lower | theme | mine | fixed (test/tap-faq-gap-567.test.mjs): from 768 px the section before the FAQ picker 32 px over it. 1440 2,079 -> 2,047 (www 2,009) on en-pt, pt-pt and es-es alike; 390 unchanged (already www's: "Before the flight" at 698 on both) |
| 131 | The footer (the fresh ranking: every recorded page at 1440 37 to 38 px taller from the footer, tap-parity-002; after row 130 the FAQ pages' whole gap) | www's links text-body-s (14 / 21 px, rows 44 px apart, none under the last), the cards at the footer's top (lg:mt-16 under the page): cards 431 px, the bar's foot 517 px under the footer's top | 16 / 24 px links ("TAP Miles&Go Terms and Conditions" on two lines), 16 px over the cards from 1024 px | theme | mine | fixed (test/tap-footer-links-567.test.mjs): the link rows as www's (Lisbon, Porto, Rio 1,558 / 1,602 / 1,822 against www's 1,556 / 1,600 / 1,820 offline), the cards 431 px as the recording's. 1440 -39 px on every page: FAQ 2,047 -> 2,008 (www 2,009), en-pt 4,000 -> 3,961, baggage 2,100 -> 2,061, miles-and-go 3,740 -> 3,701 (3,770), fly-business 5,094 -> 5,055 (4,942); 390 unchanged (the columns are closed accordions there). Also seen, not changed: www's "Cookies Settings" row (a consent button) is not in our footer document; "© 2026, TAP." is bold on www |
| 132 | The footer's copyright and "Cookies Settings" row (the open row of the rule-6 sweep; the user's decision of 2026-11-10) | "© 2026, TAP." in bold before "All rights reserved."; a "Cookies Settings" row in the second column | the copyright plain (the footer document has it bold, the shared footer builds its note from the text); no cookie row | code; document | mine | copyright fixed (test/tap-footer-note-585.test.mjs): footer-tap.js sets the note's leading "© <year>, TAP." in bold (TAP only; height unchanged, FAQ 2,008 at 1440). The cookie row stays open, with the reason: our TAP site has no consent tool (scripts/brands.js: no OneTrust id, no fallback banner; www.flytap.com loads none of its own in the captures), so a "#privacy-settings" row would open nothing and scripts/consent.js hidePrivacySettings takes such a row out; and the row is a footer document change, which waits for an upload that this order does not allow. What www's row opens is on capture-list-585-brands.txt (B) |
| 133 | A feature card's footnote (the night's ranking: /en-pt/on-board/fly-business +2.3 % at 1440, tap-parity-002) | www's ComponentFeatureCardModel's complementaryNote under the card's two columns, the page's width, text-body-s (14 px; a phone copy and a desktop copy) | in the card's text cell at 16 px: the text column 2 lines longer | document (importer) + theme | ema-cashub | fixed (standing order 9, test/tap-feature-note-133.test.mjs): the importer writes the note as the card's second row, one text cell; tap.css draws it the whole width at 14 / 24 px, 8 px under the first row. fly-business with the structure simulated: the note at 1008 px at 1440 as www's, 5,055 -> 5,019 px (www 4,942), 390 8,325 -> 8,313 (8,224). The note is on three pages in all eight languages (fly-business, locate-baggage, special meals; auctions' is empty): tools/reports/parity-2026-11-09/reimport-so9-tap-feature-note-133.txt, 24 READY |
| 134 | The inspiration pages' categories (row 128's get-inspired, now recorded: tap-parity-004, /en-pt/destinations/get-inspired 5,582 px at 1440, 4,957 at 390) | www's category chips (Adventure, Shopping, Culture …) over one category at a time (its countries a list beside its articles) | every category one under the other: 39,550 / 42,994 px | document (importer); shared code | mine | importer fixed (test/tap-inspire-tabs-585.test.mjs): each category of a CategoryAccordion a section of its own with Tab / Tabs metadata, so section-tabs.js makes them one tab set (chips from 768 px, closed accordion items below it, as www's TAP tabs); with the shared tabs' closed-item class (the commit before) a fragment in a closed item stays hidden. Drafted on our host: 1440 39,550 -> 8,321, 390 42,994 -> 9,311 (www 5,582 / 4,957; the rest is a category's countries stacked where www lists them beside the articles: next). Re-import list: tools/reports/parity-2026-11-09/reimport-585-tap-inspiration-tabs.txt (the six inspiration pages; their fragment documents unchanged) |
| 135 | A page's trail inside its fragments (seen on /en-pt/destinations/get-inspired with row 134's tabs: the trail at the top of every category panel) | one trail, under the bar | the page's trail again in every fragment (15 on the page): scripts.js buildBreadcrumb adds it to the first section of every main it decorates, and fragment.js decorates each fragment's own main | shared code | mine (scripts.js, every brand) | fixed (test/fragment-no-breadcrumb-585.test.mjs): only the page's own main gets the trail. get-inspired drafted: 15 trails -> 1, 1440 8,321 -> 8,255 px. Every brand's page that holds fragment blocks and has a Parent loses its duplicate trails |
| 136 | The inspiration categories' look (row 134's tab set; tap-parity-004 at 1440) | pills (40 px, 1 px #e0dfe2, the chosen one #65c922) centred in two rows under the centred "Destinations and tips not to be missed", the chosen category's title centred 28 / 33.6 under them (www's FAQ picker look, row 65) | the shared tab list's underlined tabs across the width, the titles left | theme | mine | fixed (test/tap-inspire-chips-585.test.mjs): the set "categories"'s tab list as pills (720 px wide at most, 8 / 16 px apart), its titles centred; other tab sets as before. Drafted on en-pt: heights unchanged (8,257 at 1440). The countries: row 137 |
| 137 | The inspiration categories' countries (tap-parity-004 at 1440) | www's FAQ picker's second level: the category's countries a list on the left (vertical tabs, the chosen one green, a chevron), the chosen country's articles beside it, one country at a time; on phones a select | every country one under the other in the category's fragment | code | mine | fixed (test/tap-inspire-countries-585.test.mjs): a FAQ block in a fragment of an inspiration page builds that fragment's subcategory picker (accordion-columns-tap.js buildSubPicker, the FAQ page's classes and look); the page's own main, the FAQ and the partners pages as before. Drafted on en-pt with row 134's document: 1440 8,257 -> 6,194 (www 5,582); 390 9,311 (the categories closed there). A category over several fragments (culture, culture-2, -3; beach, beach-2) gets a list per fragment: decided (ema-cashub, standing order 9) no merge in the code: only DA's pre-488 fragments of en-pt, pt-pt, pt-br and fr-fr are split; the importer writes each category one fragment (about 5 KB) with www's countries, all 11 categories of the six pages checked against the captures; the re-import reimport-so9-tap-inspiration.txt (its 44 categories and 4 pages) ends the split |
| 138 | Text cards one a row (the fresh ranking of standing order 9: /pt-pt/reservas/time-to-think -4.2 % at 1440, tap-parity-001; the same cards on time-to-think in all eight languages) | www's text card (SimpleGenericCardModel, itemsPerRow 1): the title text-title-xs medium 24 / 28.8, 8 px over the text, an empty button row's 48 px under the text, 24 px padding; the cards 32 px under the heading | the title 20 / 24 bold 24 px over the text, the card 24 px under the text, 64 px under the heading | theme | ema-cashub | fixed (test/tap-one-up-cards-138.test.mjs): tap.css for cards one-up only (row 27's title, the gap, the foot without a button). Every step title within 8 px of www's at 1440; the page 2,117 -> 2,196 (www 2,209), 390 2,945 -> 3,063 (3,032: one paragraph wraps to one more line on ours, and the paragraph gap is brief 505's 36 px against www's 24, shared by all cards, kept) |
| 139 | A heading with its description (ComponentHeadingSectionModel's headingSectionDescription: 119 headings on 95 language pages; the fresh ranking: /pt-pt/gerir-reserva/extras/upgrades/leiloes +3.1 % at 1440, the only page over 3 %) | the description 16 px under the heading (mt-4; the same on bagagem-mao and en-pt miles-and-go, and in rich texts' h2 + text, en-pt baggage), the next component 32 px under the description | 32 px under the heading, the next block 64 px under the text | document (importer) + theme | ema-cashub | open: our documents cannot tell a heading's own description from the next component's text (time-to-think's heading then a separate rich text is 32 px on www, as ours), so a CSS rule on h2 + p would make other pages worse. Candidate (not shipped; migration-work/parity-588/row139-wip): the importer ends the heading's section after the description (style heading-section, not in tab sections or cells), the theme 16 / 32 px. Drafts: auctions 2,730 -> 2,682 at 1440 (www 2,649), 3,352 -> 3,340 at 390 (3,352); bagagem-mao and en-pt miles-and-go unchanged in drafts (not understood when the session restarted). Also seen: a fresh import of en-pt miles-and-go renders 6,271 px at 390 against 4,730 live (www 4,747): check before any re-import of that page |

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

**Status (brief 378, checked on tap.turnsthe.page against www.flytap.com at 390 and 1440):** all
eleven are built.
- F1: TAP's own menu (header-tap.js, 36ec98e2) and the market button (b7fd82a6); search and
  account stay links to www. The bar now stays on screen as www's (row 23).
- F2: the booking box (c47261e5; the matcher and list as www's, 8b8411e0).
- F3: the alerts bar (562d1e1f), the alerts pages (2ebcb631) and the notice strip (b9d689da).
- F4: the language switch per root (f39078a9, d23fd1f1), every root in the country selector
  (ad191b50).
- V1: the stage (077d0941) and the inner banners inset (0e6d2737).
- V2: the chips (3d00b1aa).
- V3: the Miles&Go cards (58c6ab0f, columns-media stack).
- V4: the Christmas banner (58c6ab0f).
- V5: the category cards (0e6d2737).
- V6: the footer cards (58c6ab0f; Star Alliance 40662f20).
- V7: centred titles (0e6d2737).

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

## Brief 352: the help contacts sheets, the stopover's styles, the footer logo, the booking box (rows 54, 56 to 60)

### The help contacts sheets, all eight language versions

`tools/tap-data/contacts-sheet.mjs` builds them from the capture `tap-help-contacts-001.tar.gz`
(sha256 checked). It reads www's answer to `retrieve-contacts` per language and the capture's flat
rows, which supply the labels. It writes the rows in the order www's finder (`ContactsByCountry`)
shows them, logged out:
- the countries in the answer's order;
- the cities without "NA", the default city the country's `defaultCity` (else the first);
- a city's locations: first the "NA" place's ones whose title the city has not, then the city's
  own, contact-center first; only locations with a telephone, an e-mail or an address;
- a location: its description, telephones ("+" before a bare number, as www), WhatsApp numbers,
  address (the company first), e-mails, schedule; the HTML as text, www's line breaks kept.

| Path | Countries | Rows |
| --- | --- | --- |
| `/pt-pt/help/contacts.json` | 86 | 711 |
| `/en-pt/help/contacts.json` | 86 | 711 |
| `/es-es/help/contacts.json` | 86 | 736 |
| `/fr-fr/help/contacts.json` | 86 | 736 |
| `/de-de/help/contacts.json` | 86 | 735 |
| `/it-it/help/contacts.json` | 86 | 734 |
| `/pl-pl/help/contacts.json` | 86 | 737 |
| `/pt-br/help/contacts.json` | 86 | 711 |

All eight are uploaded to DA (lh-tap) and previewed, not published. The served JSON equals the
local file for each. The draft's sample sheet (`/drafts/help-contacts-en-pt.json`) is replaced by
en-pt's real sheet. The draft page still carries its brief 339 note calling the sheet a sample.

hotline-finder on tap reads the new `default` column: the default city comes first. It shows one
label over a kind's entries, the company with the address, and the schedule in a column of its own
from 1024 px.

### The draft against www's help page (390 and 1440)

- **Portugal / Lisbon (en-pt):** the same four groups, entries, notes and schedules in www's order,
  with the city select on Lisbon.
- **Brazil (en-pt):** "Rio de Janeiro - Center" first, as www. The 23 cities are in www's order.
  The same three groups, including www's "+0 800 …" numbers.
- **Spain (en-pt, twelve cities):** Alicante first, as www, with the same two groups.
- **Brazil (pt-br):** www's country order, the 23 cities in www's order, "Rio de Janeiro - Centro"
  first. The same texts in Portuguese.
- **Layout matched to www's measurements:**
  - the picture is 358 x 420 on phones and 538 x 275 at 1440, with 44 px to the finder;
  - the pills are 52 px and 24 px apart;
  - there are 16 px from a label to its values;
  - schedules and notes are 13 / 19.5 on phones and 12 / 18 at 1440 (the 1024 px breakpoint is
    assumed).

### The stopover, the footer, the booking box (rows 56 to 60)

- **Rows 58 and 59**, `/pt-pt/stopover` at 390 and 1440. The centred button is now 32 px under the
  text, centred, on #9efd38. The FAQ card is at 437 / 567 (www 436 / 567) and full width on phones.
  Its title, text and outline button match www's sizes.
  - Left over: the card's text wraps onto a second line here (Inter at 14 px needs 523 px, the card
    gives 515), so the card is 168 px tall where www's is 147.
  - Left over: the button labels are a few pixels wider than www's.
- **Row 57:** www's own SVG (plain paths) is `icons/tap-star-alliance.svg`. The TAP footer swaps the
  picture in. Row 53's documents are unchanged.
- **Row 56:** lucide's chevron, filled as www's: 20 px, #397213, the passengers' at half strength.
  The rules are in `blocks/booking-box/booking-box.css` under `body.brand-tap`.
- **Row 60:** www's feature card title is an H3, 24 / 28.8 bold, 16 px over its text. lh-com's
  columns-media H3 is light at 24 px (20 on phones), so a TAP style for it is in. Switching the
  title to an H3 in the page gives www's size at both widths.

### For ema-lufthansa (content)

- **The help pages:** `/pt-pt/ajuda`, `/en-pt/help`, `/es-es/ayuda`, `/fr-fr/aide`, `/de-de/hilfe`,
  `/it-it/assistenza`, `/pl-pl/pomoc` and `/pt-br/ajuda`.
  - Under the contacts heading (Contactos, Contacts, Kontakte, Contatti, Kontakt, Contatos), the
    "See on flytap.com" paragraph becomes a `hotline-finder` block with two rows:
    - `Sheet | /<version>/help/contacts.json`;
    - `Image | ` www's `help_contact_center_tap.jpg`, with its alt text.
  - A market root's help page takes its language version's sheet; the block picks the market's
    country.
- **Row 60:** feature card titles from H2 to H3 (Ispirati and the same cards elsewhere).
- **Row 53**, unchanged: the footer documents.

### Checks (brief 352)

- **Lint:** passes (eslint and stylelint).
- **Full suite:** 247 of 248 test files before the rebase onto main, 250 of 251 after it.
  `test/library-entries.test.mjs` fails only in this workspace, because it reads the untracked
  local `content/library/blocks` (as in brief 344).
- **Tests:** `test/tap-352.test.mjs` covers the sheet tool (www's merge, filter and order, the
  default city, the telephones, the text), the finder (default city, one label per kind, company
  with the address, the schedule column) and the CSS rules of rows 56 to 60.
- **Other sites:** every new rule starts with `body.brand-tap` (checked by `test/brand.test.mjs` for
  the theme, and by hand for the booking box's four rules), and the JS changes run only on brand
  tap (`hotline-finder-tap.js`, `footer-tap.js`). So lufthansa.com's 19 pages and the other brands
  are unchanged by construction. They were not compared in a browser this time.

Screenshots (not committed, can be lost on a restart): `/tmp/tap-352/cmp`.

Rollback: `git revert` of the commits. The DA sheets keep their versions in DA.

## Brief 356: row 39 and TAP at 390 (rows 39, 50 to 52, 69 to 85)

### Rows closed

- **Row 39:** the quick-action tab and the trail at 176 px were already on main (b7fd82a6). What was
  left is now rows 72 and 73.
- **Rows 50 to 52:** closed with the steering session's checks of tonight.
  - Row 50: the four-card stack on /en-gb, /de-ch, /pt-ao, /en-us and /fr-fr, three requests each.
  - Row 51: as www.
  - Row 52: de7fabe9.

### What was compared, at 390 x 844

www.flytap.com against the preview (the language versions and the inner pages) and
tap.turnsthe.page (the market roots: the preview has no market pages). A phone's user agent:
www serves its old mobile site to HeadlessChrome. One www page every 10 s or more.

- **The eight homepages:** pt-pt, en-pt, es-es, fr-fr, de-de, it-it, pl-pl and pt-br.
- **Three market roots:** de-ch, pt-ao and en-us.
- **Five inner pages:**
  - an article: `/en-pt/on-board/altitude-film-festival`;
  - Miles&Go: `/en-pt/miles-and-go`;
  - help: `/en-pt/help`;
  - stopover: `/pt-pt/stopover`;
  - a destination page: `/en-pt/destinations`.

Each page:
- the first screen, the menu open, the page in 844 px slices and the footer;
- on a homepage, the booking box closed and with the origin open;
- the headings' and buttons' boxes and styles.

### What the pages show after the fixes (local preview, 390)

- **Homepage with the strip (pt-pt):** the strip at 52 to 104 px, the bar at 120 px and the stage at
  200 px, as www.
- **es-es:** the tools at 238, 282 and 326 px, as www. The booking box's labels and fields as www,
  2 px higher.
- **Help:** the trail at 176 to 202 px and the title at 226 px, as www. At 1440 the title is at 266 px,
  as www.
- **Article:** the trail 53 px high, the banner at 253 px and 380 px high, the title at 665 px, as www.
- **Miles&Go:** the banner at 226 px and the title at 597 px, as www.
- **Stopover:** the title at 645 px, as www. The FAQ card's text now fits on its line, and the labels
  are as wide as www's (rows 69 and 59).

### For ema-lufthansa (content)

- **Row 82:** the footer documents. YouTube before LinkedIn; "© 2026, TAP." in bold.
- **Row 83:** es-es's stage has three slides on www (pt-ao has no stage: row 48).
- **Row 84:** the destinations page's grid (filters, destination cards, the continents' lists).
- **Row 85:** the homepage headings. "Planeie a sua viagem ao detalhe" is an H1, and the Miles&Go
  cards' second lines are H2.

### Outside my files

- **Row 79:** the airport list's filter and width live in `scripts/airport-combobox.js`, a shared
  script.
- No change was needed in `blocks/header/header.js`. The TAP header's icons come from its own tool
  list and from `buildTapMenu` (`header-tap.js`). The tab's corners and size are in `header-tap.css`,
  TAP's own stylesheet beside it.
- The airport sheets show TAP's own data as originSearch answers it, e.g. AAC "El Arish" under
  Spain. It is not a difference from www.

### Checks (brief 356)

- **Lint:** passes (eslint and stylelint).
- **Full suite:** 256 of 257 test files pass. `test/library-entries.test.mjs` fails only in this workspace, because it
  reads the untracked local `content/library/blocks` (as in briefs 344 and 352).
- **Tests:** `test/tap-356.test.mjs` covers:
  - the header's icons, the menu icon, the tab's icons and size, the strip class and its offset;
  - the trail and title rules, the single banner, the booking box's stacked rules;
  - the help cards, the footer's icons, the Miles&Go buttons and the menu over the tab.
  - `test/tap-first-screen.test.mjs` now expects www's icon names.
- **Other sites:** every new rule starts with `body.brand-tap` (`test/brand.test.mjs` for the theme;
  the booking box's and header-tap.css's by their selectors). The JS runs only on brand tap. So
  lufthansa.com's 19 pages and the other brands are unchanged by construction. They were not
  compared in a browser this time.

Screenshots (not committed, can be lost on a restart): `/tmp/tap-356/p`.

Rollback: `git revert` of the commits.

## Brief 363: rows 80 and 81, accessibility on TAP (rows 80, 81, 86 to 94)

### Rows 80 and 81

- **Row 80:** www's previous and next are Material Symbols' chevrons at weight 300, 24 px, in #397213,
  on a white disc from 1024 px. At the ends of the stage www's swiper disables the button: a #c6c5c9
  disc at 20 % opacity.
  - Ours now draws the same chevron and colour at both widths.
  - `hero-campaign-tap.js` gives TAP its own previous and next. They don't wrap; the button at an end
    is `aria-disabled`, keeps the focus and does nothing. The rotation still starts over from the
    last slide.
- **Row 81:** www puts a flat 20 % black veil over the article banner (`bg-overlay-image-subtle`), not
  a plain picture and not a gradient. Ours now does the same at both widths. www's phone picture is a
  different crop (row 94, content).
- Checked at 390 and 1440 on the local preview (this branch's code, the preview's content) against
  www.flytap.com: es-es and Miles&Go for the arrows, altitude-film-festival for the veil.

### Accessibility: what was checked

- **Pages:** the eight homepages, de-ch, pt-ao and the five inner pages of brief 362, at 390 and 1440.
- **axe-core 4.10.2:** WCAG 2.0, 2.1 and 2.2 A and AA, plus best practices.
  - Language versions and inner pages on the local preview (this branch's code, the preview's content).
  - de-ch and pt-ao on tap.turnsthe.page (main's code; the preview has no market pages).
  - www.flytap.com on 11 of the same pages at both widths, one page every 10 s or more.
- **Open states, at both widths:** the desktop menu panel and the phone menu card, the calendar, the
  passengers, the airport list, the other three tabs and the demo notice.
- **Keyboard pass:**
  - the homepage at 1440: 70 Tab stops, the focus ring of each;
  - the help page at 390 and 1440: the skip link and the phone menu;
  - the booking box's airport list, calendar, passengers and tabs (arrow keys);
  - the market button;
  - Escape on each of them.

### Results

- **Before:** two WCAG failures on our side.
  - target-size: 78 nodes, the dots.
  - color-contrast: 20 nodes, the empty dates field (www's own colour: row 91).
  - Plus one best-practice note: heading-order on the help page (row 92).
- **After:** only the dates field's colour and the help page's heading order remain. Both are www's.
- **Keyboard, before:**
  - the four booking fields had no visible focus beyond a light-green line (row 87);
  - the calendar stayed open after Tab left it (row 88);
  - the phone menu's order and Escape (row 89);
  - no skip link (row 90).
- **Fine already:**
  - the desktop menu: Enter opens a panel, Tab enters it, Escape closes it and returns the focus;
  - the airport list: Escape closes it, the focus stays;
  - the passengers: Escape closes them and returns the focus;
  - the tabs: arrow keys;
  - the market list: Escape closes it;
  - the alerts bar: named buttons, a green ring, stops on focus;
  - every control has a name.
- **www's own findings, not ours** (for the record, not changed):
  - untranslated labels ("aria.pause-slider", "aria.slide-navigation 1");
  - the bar's search, login and market have no focus ring;
  - `aria-hidden` content that takes the focus;
  - nested interactive controls;
  - grey country names on the destinations cards (2.84:1).

### For other owners

- **Row 93:** a pause button for the alerts bar's rotation, if wanted (`flash-teaser-tap.js`,
  ema-adobe). www has none.
- **Row 94:** the article banner's phone picture (ema-lufthansa).
- **Rows 91 and 92:** www's design. The empty dates field's grey would need a TAP design decision.

Screenshots (not committed, can be lost on a restart): `/tmp/tap-363`.

### Checks (brief 363)

- **Lint:** passes (eslint and stylelint).
- **Full suite:** 259 of 260 test files pass. `test/library-entries.test.mjs` fails only in this
  workspace, because it reads the untracked local `content/library/blocks`. A clean clone passes it.
- **Tests:** `test/tap-363.test.mjs`. `test/tap-menu.test.mjs`, `test/tap-first-screen.test.mjs`,
  `test/booking-box-block.test.mjs` and the hero-campaign tests are unchanged and pass.
- **Other sites:** every new rule is under `body.brand-tap`. The JS changes are in TAP's variants:
  the stage's `hero-campaign-tap.js`, `header-tap.js` and the TAP booking box. So the other
  brands are unchanged by construction. They were not compared in a browser.

Rollback: `git revert` of the commits.

## Brief 368: TAP's stopover video, info alert, FAQ, click-to-call, grids, banners, airport list (rows 42, 63 to 68, 79, 91 to 94)

Checked at 390 and 1440 on the local preview (this branch's code, the preview's content) against
www.flytap.com: the stopover and Miles&Go pages, check-in-information, the FAQ page, the seats page,
reservas and the extras and altitude-film-festival banners. One www page every 10 s or more; a
phone browser's user agent at 390 (www serves its old mobile site to a headless one).

- **Row 42:** ema-lufthansa's proposal, as it stands: the video's frame 420 px high, its title 44 px
  from the top and 64 px in from 1024 px. At 390 the title stays 24 px in, as www.
- **Row 63:** the new TAP block `info-alert`. How www keeps it closed: it doesn't. Its close button
  hides the alert in the page; nothing is written to a cookie, localStorage or sessionStorage, and
  the next load shows it again. Ours does the same. The pages need the highlight sections imported
  as `info-alert` blocks (ema-lufthansa).
- **Row 64:** the working selector, two `:has()` side by side; the next heading 80 px under the
  picture.
- **Row 65:** `blocks/accordion-columns/accordion-columns-tap.js`, on the FAQ page only. The shared
  `accordion-columns.js` gets a four-line hook that hands a TAP page's FAQ blocks to it.
- **Row 66:** the new TAP block `click-to-call`. www's card is CoreMedia Engagement Cloud's widget
  (`cdn.engagement.coremedia.cloud`), which sends the number to TAP's call-back service. The replica
  has no such service, so the button opens the page on www (a new tab) and sends nothing typed
  here. Not drawn: the green wedge and the floating button. The 28 extras pages need the block
  (ema-lufthansa).
- **Rows 67 and 68:** the grids' rows 281 px apart at both widths; a single banner 1120 x 305.
- **Row 79:** `airport-match.js` as www's booking widget's matcher; the list as wide as its field.
  - "Lisboa, Portugal" now lists LIS, and on focus LIS, FLN and IND, as www: with an airport chosen,
    www lists the matches for its code.
  - "Mad" in the destination still lists 6 to www's 3. www's destination list is TAP's routes from
    the origin (its destinationSearch); ours is the airports sheet, the same as www's origin list.
    That takes a destinationSearch capture per origin.
  - A search hands over as before (LIS to MAD, booking.flytap.com's deeplink): checked on the local
    preview.
- **Rows 91, 92 and 93:** as www. **Row 94** is ema-lufthansa's: the import is ready and off, waiting
  on hero-campaign and hero-card-overlay showing the second picture on phones (not in this brief).

## Brief 372: the homepage headings (row 85)

- **Row 85:** the theme rules for ema-lufthansa's homepage documents (on preview, not yet published).
  - The H1 "Planeie a sua viagem ao detalhe" over the carousel takes the rule its H2 had, so it gets
    the same size and place (28 / 33.6 on phones, 40 / 48 from 1024 px, centred).
  - The Miles&Go cards' second lines, an H2 after the card's title, get www's Inter 600 at 14 / 21
    and 20 / 30.
  - **Checked:** the eight homepages (pt-pt, en-pt, es-es, fr-fr, de-de, it-it, pl-pl, pt-br) at 390
    and 1440 on the local preview (this branch's code, the preview's content), against
    www.flytap.com/pt-pt at both widths.
  - **No change on live until publishing:** the same eight pages on live content with this branch's
    code (a local server on aem.live) and on tap.turnsthe.page (main's code) give the same values:
    the H2 and the bold paragraphs as today.
  - Left: at 390 the H1 sits 6 px lower than www's (1473 to 1467 on pt-pt), as the H2 does today.
- **Row 94, the blocks' part:** on TAP, hero-campaign (a single banner and every slide of the
  slider) and hero-card-overlay take the second picture in the picture's cell as the phone
  picture: one `<picture>`, the first picture's sources from 768 px, the phone picture's below, the
  first picture's alt text, the phone picture's size. Other brands, and TAP banners with one
  picture, stay as they were.
  - **Checked:** on the local preview (this branch's code) at 390 and 1440, using
    altitude-film-festival's banner rebuilt with a second picture. The phone file loads at 390,
    the desktop file at 1440, and no picture is left in the text.
  - Next, import (ema-lufthansa): switch phonePictures on and upload the pages.
- **Row 84, the destination-grid block:** www's grid is Smartvel's Explore&Go widget. The block
  draws it from a sheet per version, `/<version>/destinations/destination-grid.json`.
  - **The sheet:** `tools/tap-data/destination-grid-sheet.mjs` writes it from the capture
    (tap-smartvel-001, sha256 checked; its README gives the requests and the filter rules). A row
    each: 89 destinations in the widget's order, its 9 chips, 4 areas and the widget's texts in
    the version's language. All eight versions give 89 destinations, each with its area.
  - **The block:** a search box, Filters, and the category chips (several selected: the
    destinations with all of them, as www). The Filters panel has the areas (Worldwide first), the
    categories, Clear and Apply. The cards show the city, the country and www's 200 characters of
    text, 16 at a time with "Load more destinations"; each city links to its page on www.
  - **Pictures:** none. Smartvel's are licensed and Ben decides; the sheet's image column stays
    empty and the cards show their text. `--photos yes` would write the covers, left on
    Smartvel's CDN. The test fixture (pt-pt's sheet, 20 destinations) has no picture.
  - **Not as www:** the map beside the list (the page's poi-map has the destinations), the panel a
    card opens (places, events, travel tips; our card links to www's city page instead), the
    chips' icons. The country is #757575 rather than www's #999, for 4.5:1 contrast.
  - **Checked:** on the local preview (this branch's code) at 390 and 1440, the block on
    /pt-pt/destinos with pt-pt's full sheet, against www.flytap.com/pt-pt/destinos. Two columns
    of cards on phones, three from 1024 px. Load more, the panel (Africa, then Praia), Clear,
    Escape and the search ("sao": the six São cities) all work. axe (WCAG 2.2 AA and best
    practices) finds nothing in the block.
  - **Next, import (ema-lufthansa):** the eight sheets (`--capture <tap-smartvel-001>/smartvel
    --version <version>`) and the block on the eight destinations pages.

## Brief 378: one card a row, the phone picture at 728 px, the stopover's styles, the open rows

- **Row 98:** `one-up` is one card a row at every width on TAP (cards-teaser and cards), 24 px
  between the cells, the text 40 px above the card's foot. On the local preview the Wi-Fi packages
  of pt-pt, en-pt and pt-br measure as www's at 390 and 1440 (326 / 1088 px wide, 56 px apart,
  157 / 133 px high).
- **The phone picture** now switches below 728 px, www's breakpoint (hero-campaign and
  hero-card-overlay on TAP): on altitude-film-festival the phone file at 727 px, the wide one at
  728 and 1440.
- **Rows 43 and 44:** the two section styles were already there (40662f20, brief 352) and the
  import already writes them (bcc1246c): `info-card` (the FAQ teaser card) and `centred-button`
  (a lone button centred). The stopover documents carry both on preview and live; both match www
  at 390 and 1440. The rows were not marked; they are now.
- **Row 23:** the bar stays on screen as www's. lh-com's header hides it while scrolling down; on
  TAP it stays, and on the homepage it rises with the page to 16 px from the top (from 1025 px
  with a scroll-linked animation, in tap.css; a browser without one keeps the bar in the stage).
  `test/brand.test.mjs` now checks rules inside `@supports` and allows `@keyframes` named after
  the brand.
- **The open rows and specs:** each compared on tap.turnsthe.page and www.flytap.com at 390 and
  1440 on the pages it names (one www page every 10 s or more), and set to what holds now, with
  its commit. F1 to F4 and V1 to V7 are built (above). Left for others: row 83 and the homepages'
  phone pictures (row 100), ema-lufthansa; the destination grid's sheets and pages (row 45),
  ema-lufthansa; live's nav documents with the market's flag (row 24), publishing; row 99,
  ema-adobe. Row 41 (LUGGit) stays a link to www.

## Brief 380: info alerts without a close button, the click-to-call card from the capture

- **Row 101:** the option `static` leaves the close button out, as www does for the 30 alerts its
  data marks `dismissable: false`. Measuring www showed two more differences, now fixed for every
  alert: www keeps no room for the close at the right (ours kept 32 px, so texts wrapped earlier),
  and its list sits in a 12 px margin and 12 px padding, 4 px under the title, in Inter 500.
- **Row 66:** the click-to-call block rebuilt from the BySide capture (tap-byside-001, sha256
  checked; its CSS in the `widget.php` answers): the card with its fields, the two pictures, the
  small print and the floating button. The button's text follows the opening hours in Lisbon time.
  The button opens the page on www in a new tab; nothing typed is sent. The table the block reads
  is in `blocks/click-to-call/README.md`.
- **Checked:** on the local preview (this branch's code) at 390 and 1440. The alerts against
  www.flytap.com: /en-pt/bookings/insurances and /pt-pt/informacoes-check-in. The card injected
  on /pt-pt/gerir-reserva/extras with the pt-pt 2023-flight-extra card's texts and pictures,
  against the capture's screenshots: the same positions within a few pixels; the floating button
  207 x 54 against 205 x 54.

## Brief 394: the rows settled since brief 380 (the user's facts, 5 November)

Rows changed in the table: 22 (no picture missing, media 019 and 023), 46 (the Miles&Go stack settled),
48 (the market roots' stages: Portugal Stopover and the destinations, fares stay with TAP), 66 (the
click-to-call cards live on 74 pages), 83 (closed: es-es three slides; all 137 roots' stages www's of
5 November), 84 (the destination grid live, the Smartvel photos still open), 99 (the fare pages live,
the page heights), and rows 102 to 106 added for ema-lufthansa's round 3 (partners picker, inner
slider, info card, spacing, chevron frame: fixed and live; the spacing 161 px short on the hand
baggage page at 390 in the user's check, brief 393; 2e28a112, pulled before this push, gives -39 px). ema-lufthansa reports TAP's work; this file is kept by the
lh-com migration agent. Not checked by the agent in this brief: the facts are the user's (live
checks on www.flytap.com and tap.turnsthe.page).

## Brief 403: round 4's shared rows (rows 107 to 109)

ema-lufthansa's round 4 named three rows for shared code (R4-1 to R4-3, rows 107 to 109): the
tables' notes behind an (i), the fare tables' Legend and Notes as H2s, the help contacts' headings
as H2s. Compared with www.flytap.com in the agent's browser at 1440 and 390 (the Club's and the
fare tables' (i)s, 24 px, 8 px after the text; Legenda and Notas H2s, 14/21 600) and checked on
tap.turnsthe.page after the push (9220be1) on the pt-pt and en-pt pages of each row, at 1440 and
390. The notes' (i) is brand-neutral: no other brand's table has a note so written (300 local
documents). Nothing was uploaded: the code reads the documents as they are.

## Brief 406: R4-8 and the Club's heading (rows 110 and 107)

Row 110 (R4-8): the Economy Prime pages' table drawn as www's fare tables (a fare-comparison of one
table, its legend and notes in the caption box; TAP-scoped, no document changed). Row 107: the
Club's column heading keeps its (i) beside the heading. Compared with www.flytap.com in the
agent's browser and checked on tap.turnsthe.page after the push (bae28c8), pt-pt and en-pt, 1440
and 390.

## Brief 407: R4-10, the entertainment's news (row 111)

Row 111 (R4-10): the news list (the importer's option slider) as www's swiper: previous, next and
bullets from 728 px, three cards in view from 1024 px (R4-4's one row of four was not www's), the
slider inside its column as www's. TAP-scoped (blocks/cards-teaser/cards-teaser-tap.js, loaded on
brand tap only; tap.css); no document changed. Compared with www.flytap.com in the agent's browser
(two loads, 10 s apart) and checked with this code on TAP's preview content, pt-pt and en-pt, 1440
and 390.
