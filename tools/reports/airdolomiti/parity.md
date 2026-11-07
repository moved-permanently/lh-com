# Air Dolomiti against www: parity

airdolomiti.turnsthe.page (lh-airdolomiti) compared with www.airdolomiti.it / .eu / .de, at 390 px
first, then at 1440 px:

- **2026-11-04, brief 351:** 19 pages, viewport screens side by side (ours on the left, www's consent
  window and chat button hidden).
- **2026-11-05, brief 356:** the search box (www's radio tabs, the phone card and its panel), the
  newsletter field, the offers' "Vedi tutto (3)" and the fleet's breadcrumb. www's widget, slider and
  strip were measured again at 390 and 1440. Ours was checked locally (code from the repo, documents
  from the importer) before each push, then on preview in it, en and de. lufthansa.turnsthe.page's
  and ita.turnsthe.page's homepage flight search kept the same structure and boxes at 390 and 1440.
- **2026-11-04, brief 355:** the rows left open by 351. www's menu, homepage, baggage, fleet, news
  article and footer were measured again: the computed boxes and type of the menu panels, the
  booking widget, the service shortcuts, the offers cards, the stage title, the newsletter strip
  and the footer. Ours was checked locally (code from the repo, the site's preview content)
  before each push, then on main--lh-airdolomiti--moved-permanently.aem.page.

Each run: one www page every 12 s or more, one browser at a time. The screenshots are outside git
(`airdolomiti-views/`, next to the repo).

## Pages compared (19, at 390 and 1440)

| Page | it | en | de |
| --- | --- | --- | --- |
| Homepage | `/` | `/en` | `/de` |
| Timetable | `/orario-voli` | `/en/flight-timetables` | |
| Manage booking | `/gestione-prenotazione-volo` | `/en/manage-flight-booking` | |
| Newsletter | `/iscrizione-newsletter` | `/en/newsletter-subscription` | |
| eSIM | (none on www) | `/en/extra-services/plans-esim` | `/de/zusatzleistungen/esim` |
| Baggage | `/bagagli` | `/en/baggage` | |
| Fleet | `/flotta` | `/en/fleet` | |
| Contact | `/supporto-e-contatti` | `/en/support-and-contacts` | |
| News article | `/articoli/travellers/bambini-a-bordo-giochi-passatempo-e-gadget-imperdibili` | `/en/articles/travellers-en/children-on-board-games-entertainment-and-unmissable-gadgets` | |

www has no Italian eSIM page, so the German one was compared instead.

## Differences

State: **fixed** (in code or documents, with the commits), **open** (with its owner).

All rows' fixes are Air Dolomiti only:

- rules under `body.brand-airdolomiti` in `styles/themes/airdolomiti.css` (scripts/brand.js loads it
  only on lh-airdolomiti);
- the header variant `blocks/header/header-airdolomiti.*`, which header.js loads only for the
  brand `airdolomiti`;
- the site's importer (`tools/importer/airdolomiti-import.mjs`, `airdolomiti-nav.mjs`) and its
  documents.

| # | Where | www | Ours (before) | State | Owner |
| --- | --- | --- | --- | --- | --- |
| 1 | Page titles (h1 of inner pages) | light 300, 38px / 46px at every width; subtitle 22px / 30px | bold 700, 36px at 390 and 48px at 1440; subtitle 16px | fixed, 1ccf46c4 | lh-com migration agent |
| 2 | Section headings (h2) | light 300, 38px / 46px at 390 and 42px / 50px at 1440 | 28px at 390, 36px at 1440 | fixed, 1ccf46c4 | lh-com migration agent |
| 3 | Blog posts: title and lead h3 | title semibold 600, 38px / 40px (65px / 72px at 1440); lead h3 regular 400, 26px / 32px (35px / 40px) | title bold 36px; lead h3 bold 20px | fixed, 1ccf46c4 | lh-com migration agent |
| 4 | Breadcrumb | "Home \| Orario Voli" under the header on every inner page and at every width | none | fixed: ac06caa4 (test c762ac11), look 1ccf46c4; 1557 documents with Parent / Breadcrumb Title rows. The English and German homepages as their Parent by their address, /en/ and /de/ (613bec49 test, 4833a764; 245 documents). 2026-11-05: blocks/breadcrumb kept dropping the slash and fetched /en, which aem.page answers with 404, so those trails missed "Home" on preview: the block now fetches the parent as written and, on a 404, once with the slash toggled (d43b973a, its test before). Checked on preview and live: en and de "Home | ..."; lufthansa, swiss and tap trails unchanged. /en/assistance (its document still names /en) shows "Home" on both hosts through the retry, so it needs no upload | lh-com migration agent |
| 5 | Header on phones | logo, search and menu only | a quick-links row under the logo | fixed, 1ccf46c4. 355: the gap the hidden row left under the bar closed (the header 74px high, 86px from 768px, 120px from 1025px), f0f9621d | lh-com migration agent |
| 6 | Baggage and contact link tiles | image cards with the title as a beige chip; the whole card links; a sideways row on phones | image, bold title and an arrow link | fixed, 1ccf46c4 | lh-com migration agent |
| 7 | Stage titles (fleet): weight | light 300 | bold 700 | fixed, 1ccf46c4 | lh-com migration agent |
| 8 | Stage (fleet): size and box | as high as the window under the bar, a 50 % black veil, the title navy in a centred 80 % white box, 38px / 40px (65px / 72px at 1440) | 350px high, white text on the photo | fixed, 04a68b91 | lh-com migration agent |
| 9 | Header on desktop | a menu in the bar, "Esplora / Prenota e Gestisci / In viaggio", each opening a panel: link columns, an image card, the teal "Azioni Rapide" column with icons. Outlined square tools: assistance, search, accessibility, language. 120px bar | quick links and "Menu" | fixed: the Air Dolomiti header variant f0f9621d (tests 87b22712), its quick actions as Edge Delivery renders them c1dfeb60. The nav documents (it, en, de) carry the card pictures, the quick-action icons and the search tool; on preview | lh-com migration agent |
| 10 | Homepage alert strip | US travel attestation alert at the top | the flash-teaser block shows nothing | fixed: the Message Center sync copies www's alert (it, en, de), live since 2026-11-04 | ema-adobe |
| 11 | Homepage stage and flight search (1440) | the search box on the bottom of the stage photo, a 243px teal band under it with the shortcuts | the search as a separate block under the stage and band | fixed: 7422a9de, 4cb85c76 (136px over the photo, 73px into the band) | lh-com migration agent |
| 12 | Flight search form | boxed fields 56px high with their labels above, the passengers as a field, a teal 56px button; the trip type as two radio tabs (a teal ring, the chosen one semibold teal); at 1440 one white row with the two tabs on top and an arrow end | underlined fields, the dates as one field, the trip type a drop-down | fixed: fields 7422a9de; 356: the radio tabs as the variant airdolomiti of the block (flight-search-airdolomiti.js f1172492 test, 3aadbf34; documents 3b45772a test, 00bd6771; 197 documents on preview). The hand-off to Air Dolomiti's booking is the same as before (checked: it-IT, en-GB, de-DE, one way) | lh-com migration agent |
| 13 | Pages with the booking widget on phones: "Prenota il tuo volo" | a white card ("Book your flight", "Jetzt buchen") on the homepage's stage, half over the photo, opening the search as a full-screen white panel with a round close button; on the booking and route pages the card where the search is | the search form inline | fixed in 356: the variant's Open label (the card, the panel above the bar, Escape and the close button, the focus back on the card), 3aadbf34, 2a6ea9e5; on preview with row 12's documents | lh-com migration agent |
| 14 | "Gestisci al meglio il tuo viaggio" shortcuts | outlined pills without icons, as wide as their text (152 x 66, 266 x 66), one row that scrolls sideways on phones, beside the label at 1440 | a 2 x 2 grid of icon tiles on phones; icon buttons of equal width at 1440 | fixed, 04a68b91 | lh-com migration agent |
| 15 | Homepage offers | grey cards (#f4f4f4, 10px radius) that are one link: route, price, fare in capitals; the text over the picture on phones, beside it at 1440; "Vedi tutto (3)" beside the heading at 1440, under the cards with two round arrows on phones | white cards, the picture on top, price and fare in one line, a separate arrow link; "Vedi tutto" and dots under the cards | fixed: the cards d90df76a, 70dfe307; 356: the link's number ("Vedi tutto (3)") d0362679 test, 4833a764, its place and the arrows fb9e2ee5; the three homepages on preview | lh-com migration agent |
| 16 | eSIM | the Breeze widget with the plans | the "Find your eSIM plan" link: the esim-widget block is behind the site flag `esim-widget`, which is off | open: you check the widget on preview and set the flag | the user |
| 17 | Blog posts: top | no feature picture, no category chip, the title first, the reading time alone (16px), the text in a 1200px column from the left | the feature picture, the chip, date and reading time, the text centred in two thirds | fixed, 70dfe307 | lh-com migration agent |
| 18 | Footer (1440) | outlined pills at the top right; the company links (no title) with the address and payment logos under them; three columns a row (contacts, news, routes; assistance, legal) with 14px regular titles; a dark teal band with the white logo and round social links; the company line on a grey bar | the search field, five titled columns, a row of text buttons with small icons, a separate legal row, a white logo row | fixed: the footer documents 62277212 (test dfbcfb1b: legal links as the column "Info legali", buttons, social links and payments as three badge sections), the layout 70dfe307; on preview. Phones keep the accordion (with "Info legali" now one of its rows) | lh-com migration agent |
| 19 | Newsletter strip above the footer | "Iscriviti alla nostra newsletter", a line of text and an email field (300 x 82, the teal envelope) that takes the address | a link "Iscriviti alla nostra newsletter" | fixed: the strip d90df76a, 70dfe307; 356: the field as the block newsletter-signup (0fbc6936 test, 735d679b): an email field and its envelope button open the sign-up page (/iscrizione-newsletter, /en/newsletter-subscription, /de/newsletter-anmeldung) with ?email=, and the sign-up form takes it (Rules prefill=email, 625e9f26; 283 strips and the three sign-up pages on preview). Nothing is sent from the strip; the sign-up page's form sends, as before | lh-com migration agent |
| 20 | Fleet stage: breadcrumb | the trail in white on the top of the stage photo, the stage right under the bar | the trail above the stage | fixed in 356, fb9e2ee5 | lh-com migration agent |

## Accessibility (2026-11-05)

How it was checked:

- **axe-core 4.10.2** (the npm tarball, its sha512 checked against the registry): WCAG 2.0, 2.1 and
  2.2 A and AA, at 390 x 844 and 1440 x 900, the page scrolled through and settled.
  - **Pages:** the three homepages, the travel information pages (`/informazioni-aggiornate`,
    `/en/current-flight-information`, `/de/fluginformationen`) and the article in each language,
    on airdolomiti.turnsthe.page.
  - **The fixes:** checked again on a local dev server (the working tree's code, the importer's
    documents) before the push, then on preview.
- **Keyboard pass at both widths:**
  - the Tab order from the top of the homepages;
  - the desktop menu: Enter opens it, Tab goes into the panel, Escape closes it and gives the focus
    back;
  - the search: the tabs (arrow keys), its fields, and on phones the card, the panel and its close
    button;
  - the newsletter field and its button;
  - the alert strip's link.

A ring shows on every focus stop and every control is named, except where the rows below say
otherwise.

| # | Finding | WCAG | Where | State | Owner |
| --- | --- | --- | --- | --- | --- |
| A1 | The homepage destinations' dots: 8 x 8px targets (axe target-size, all three homepages at 390; en and de at 1440). www has no dots there: four cards a row at 1440, "vedi tutte (2)" and two 40px round arrows on phones | 2.5.8 | the destinations slider | fixed: carousel-cards (destinations) as www's (eaafb6d3 test, 2d48d773); axe clean on the local and preview pages | lh-com migration agent |
| A2 | The header tools were focused in another order than they show (assistance, accessibility, language, search; shown: assistance, search, accessibility, language) | 2.4.3 | blocks/header/header-airdolomiti.* | fixed: the DOM in the shown order, no CSS reordering (10b7af40 test, 13c861e6) | lh-com migration agent |
| A3 | The search: the passengers field focused before the airports, shown after the dates | 2.4.3 | flight-search-airdolomiti.js | fixed: the passengers before the button in the DOM (10b7af40, 13c861e6) | lh-com migration agent |
| A4 | The open phone search panel: Tab left it for the page behind it; no dialog semantics | 2.4.3, 4.1.2 | flight-search-airdolomiti.js | fixed: a modal dialog named by the card ("Prenota il tuo volo"), Tab and Shift+Tab kept inside, Escape and the close button as before (10b7af40, 13c861e6) | lh-com migration agent |
| A5 | The phone card "Prenota il tuo volo": its focus ring cut off by the arrow shape (clip-path) | 2.4.7 | styles/themes/airdolomiti.css | fixed: the ring inside the card (2d48d773) | lh-com migration agent |
| A6 | The date fields take four Tab stops each (day, month, year, the picker) | — | the browser's date field | fixed in the flight search (3ba047f7, every brand): one stop per date, a readonly field opening the calendar | lh-com shared block (flight search) |
| A7 | No violations on the travel information pages and the articles at either width | — | — | — | — |

## Pass 2 (2026-11-07, brief 447): airdolomiti-parity-001

**The archive.** 48 pages (it, en, de; the homepage, the destinations hub and a destination, a
service page, the fleet, the blog list and an article, booking, routes, baggage, on board, travel
information, assistance, support and contacts, manage booking, the timetable) at 1440 and 390, plus
the homepages' 21 menu states (the desktop panels at 1440, the phone menu and its sections at 390).
It was captured from www.airdolomiti.it / .eu / .de on 2026-11-07, with its own stylesheets and
measurements, and served from this machine (requests off it aborted).

**How it was compared.**
- Ours: a local dev server while working (the tree's code, the site's preview content), then
  main--lh-airdolomiti--moved-permanently.aem.page after each push.
- Per page and width: every visible text line's box and type, matched by text; backgrounds and
  borders box by box; page height, title, headings, text passages and first copy (bcompare.py).
- The 48 pages at both widths: 11 of 96 page-widths matched before, 42 of 96 after.

Code only. Each fix is matched on markup the documents already have, Air Dolomiti only
(`body.brand-airdolomiti`, header-airdolomiti.*), except row 49, which is the shared
destination-finder block.

| # | Where | www | Ours (before) | State | Owner |
| --- | --- | --- | --- | --- | --- |
| 21 | Page width | 90vw below 930 px, 95vw from 930 px, at most 1440 px (36 px in at 1440, 19.5 at 390) | 5vw everywhere (72 px in at 1440): the 2.5vw rule came before the 5vw default in the file | fixed, 75ddd523 | lh-com migration agent |
| 22 | Page titles | 38/46, 42/50 from 930 px; 25 px under them, 20 from 930 px (TitleMargin) | 38/46 at every width, 40 px under | fixed, 75ddd523 | lh-com migration agent |
| 23 | Section headings | most 34/42, 38/46 from 930 px (MiniCardSlider, Title, CosaFareCarroussel, CenteredBlock); the text blocks' and the destination grid's 38/46, 42/50 | 38/46, 42/50 from 1025 px | fixed, 0f22c8b6 | lh-com migration agent |
| 24 | Bar on phones | 80 px (20 px above and below), logo 169 x 32 at x 19 | 74 px, logo 153 x 28 at x 22 | fixed, 75ddd523 | lh-com migration agent |
| 25 | Bar from 1025 px | logo 8 px above the middle | centred | fixed, 75ddd523 | lh-com migration agent |
| 26 | Desktop panels | bold links 36 px under the column above; the card 350 px with a 226 px title chip and www's solid button (teal 16/22 500, 18px 40px, the arrow 16 px after); "View all" underlined | 30 px; 314 px card, navy 15 px button with a chevron; "View all" plain | fixed, 75ddd523: the three panels within 1 px of www's | lh-com migration agent |
| 27 | Phone menu | a white page over the screen: "Close" with a circled cross; the search field; the quick actions on teal (half the screen); the three items opening their columns in place, one at a time; the languages behind the current one ("EN", a globe) | lh-com's flyout: the items sliding in their columns, the tools and languages as links | fixed, 75ddd523 (header-airdolomiti.js buildAirDolomitiPhoneMenu): the three sections at 390 to the pixel; axe 0 violations; Tab kept inside, Escape and Close back to the Menu button | lh-com migration agent |
| 28 | Phone menu and bar: www's extras | the bar's "Book your flight" plane button; the menu's text size setting ("Dimensions") | the accessibility settings button in the bar | open: moving the accessibility settings into the menu, and the bar's booking button, are feature work | lh-com migration agent |
| 29 | Phone bar: menu icon | three 31 px lines | lh-com's 16 x 12 burger | open (minor; the shared icon) | lh-com migration agent |
| 30 | Footer from 1025 px | 85 px in; the pills across the columns (69 px); the company quarter with a faint line; links underlined, 16/22, back to back; external links' icon; payment logos three a row; white social circles; www's logo with "Member of LUFTHANSA GROUP" | 80 / 88 px in, row 18's layout | fixed, 75ddd523: every part within 0 to 4 px of www's at 1440 | lh-com migration agent |
| 31 | Footer below 768 px | one teal column: the company links, the five sections as rows in capitals (www's order), the address and payment logos centred, the dark band with the stacked logo and 40 px circles, the company line | lh-com's accordions with the search field, the pills and a white logo row | fixed, 75ddd523: 1046 px high on both, each line within 1 px | lh-com migration agent |
| 32 | Footer 768 to 1024 px | the phone footer up to 929 px | lh-com's tablet columns | open | lh-com migration agent |
| 33 | Footer: "Change Cookie Settings" | a link to the consent settings | none (Air Dolomiti has no consent tool here, so the link is left out) | open: your decision | the user |
| 34 | Running-text links | underlined, without arrows (RichText a) | bold, lh-com's small arrow before them | fixed, 75ddd523 | lh-com migration agent |
| 35 | Text hubs (destinations, flights to Europe, assistance; the fleet's text) | www's TitleDescriptionTextCta: a centred 70vw column from 930 px, the text 22/37.4 with a blank line between paragraphs | the text 16/27.2 at two thirds of the width from the left | fixed, 75ddd523 (the lines word for word as www's at 1440 and 390) | lh-com migration agent |
| 36 | Booking widget strip | the flight search bar under the header on the hubs and destination pages (DisplayBookingWidget) | a "Book your flight" button above the title (the importer's) | open: the importer (the flight-search block as on the homepage), then an upload | lh-com migration agent |
| 37 | Destination hub: cards | www's CardNews: white, shadowed, 470 px, the picture 60%, title 20/26, the line grey and underlined, one link | the picture at its own height, a bold title, the line and an arrow link | fixed, 0f22c8b6 | lh-com migration agent |
| 38 | Destination hub: paging | 15 cards a page with page numbers | all 24 at once (the page 3400 px taller at 1440) | open: a paging option in cards-teaser | lh-com migration agent |
| 39 | Manage booking | title and line centred in 50vw; the line 16/22, 40 px over the form (TitleDescriptionPnr) | left, the line 22/30 | fixed, 75ddd523 | lh-com migration agent |
| 40 | Manage booking: text | 19.44/33 | 16/27.2 | open | lh-com migration agent |
| 41 | FAQ pages (lounges, seat reservation, parking) | www's HalfPage: the title 34/42 (38/46 from 930 px), 2 px apart; light accordion titles with the teal arrow; from 930 px the grey help card (410 px) beside them | one column, bold accordion titles, the card under them | fixed, 75ddd523 | lh-com migration agent |
| 42 | Breadcrumb | the middle level ("Home \| Servizi \| Parcheggi Convenzionati") | "Home \| Parcheggi Convenzionati" | open: the documents' Parent rows (importer), then an upload | lh-com migration agent |
| 43 | Destination stage | www's HeroSecond: the picture across the screen under a 50% veil, the lines centred in a light box (title 64.8/72 light); the price and button on a white bar | a navy card on the left, the title white and bold | fixed, 75ddd523 | lh-com migration agent |
| 44 | Destination stage: links | "What to do / see / eat" as white pills inside the stage | tiles under the stage | open | lh-com migration agent |
| 45 | Destination stage: price bar | fixed at the screen's foot (from 530 px), a fixed button on phones | at the stage's foot | open: kept in the page on purpose (a fixed bar covers content) | lh-com migration agent |
| 46 | Baggage | the cards 40 px under the title's line | 24 px | fixed, 75ddd523 | lh-com migration agent |
| 47 | In-flight entertainment | its lead 28.08 px (DescritionNews) | 16 px | open | lh-com migration agent |
| 48 | Blog list | first heading "Categorie / Categories / Kategorien" (43.2 px) | the h1 "Articoli / Articles / Artikel" | open: the documents | lh-com migration agent |
| 49 | Destination finder (shared) | (Brussels) a polite live region after the trip type chips | none | fixed, a5a14127 (every brand) | lh-com migration agent |
| 50 | Italian timetable | the FAQ pages' title (34 px) on /orario-voli only | the page title as en/de's | open: no marker in the document | lh-com migration agent |
| 51 | Page heights left | booking, the timetable, assistance and the article shorter than www's; flights to Europe longer | | open: per block, next pass | lh-com migration agent |
| 52 | Homepage title | no h1 on www | a hidden h1 "Air Dolomiti" | kept (a page heading for screen readers) | — |

| # | Finding | WCAG | Where | State | Owner |
| --- | --- | --- | --- | --- | --- |
| A8 | The phone footer shows its sections in www's order (CSS order) while Tab follows the documents' (Contacts, Travel tips, Routes, Passenger Assistance, Legal info), and reaches the social links before the logo | 2.4.3 | the footer documents | open: the footer documents in www's order would make both the same (an upload) | lh-com migration agent |

## Checks

- **Lint and tests:** the full suite before each push, after each rebase (254 files, 0 fail at
  the last push).
- **Smoke:** the lh-edge smoke on the brand hosts (lufthansa, lufthansa-edge, lufthansa-cn,
  discover, ita, austrian, cargo, airdolomiti, tap) before and after each push.
  - 351: the same answers, except on tap.turnsthe.page, whose `/en-pt` and `/pt-pt` answers
    alternate between two versions between runs with no push in between (seen again in 355),
    TAP's own content.
  - 355: the same answers after both pushes, TAP included at the second.
- **Publishing:** airdolomiti.turnsthe.page serves the published site. The previewed documents
  show there after publishing; until then they show on main--lh-airdolomiti--moved-permanently.aem.page.
  The code rules are live on both hosts.
- **Pages without breadcrumb rows:** the search pages and the newsletter confirmation pages (3
  languages each) have no www snapshot.
