# Air Dolomiti against www: parity

airdolomiti.turnsthe.page (lh-airdolomiti) compared with www.airdolomiti.it / .eu / .de, at 390 px
first, then at 1440 px:

- **2026-11-04, brief 351:** 19 pages, viewport screens side by side (ours on the left, www's consent
  window and chat button hidden).
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
| 4 | Breadcrumb | "Home \| Orario Voli" under the header on every inner page and at every width | none | fixed: ac06caa4 (test c762ac11), look 1ccf46c4; 1557 documents with Parent / Breadcrumb Title rows | lh-com migration agent |
| 5 | Header on phones | logo, search and menu only | a quick-links row under the logo | fixed, 1ccf46c4. 355: the gap the hidden row left under the bar closed (the header 74px high, 86px from 768px, 120px from 1025px), f0f9621d | lh-com migration agent |
| 6 | Baggage and contact link tiles | image cards with the title as a beige chip; the whole card links; a sideways row on phones | image, bold title and an arrow link | fixed, 1ccf46c4 | lh-com migration agent |
| 7 | Stage titles (fleet): weight | light 300 | bold 700 | fixed, 1ccf46c4 | lh-com migration agent |
| 8 | Stage (fleet): size and box | as high as the window under the bar, a 50 % black veil, the title navy in a centred 80 % white box, 38px / 40px (65px / 72px at 1440) | 350px high, white text on the photo | fixed, 04a68b91 | lh-com migration agent |
| 9 | Header on desktop | a menu in the bar, "Esplora / Prenota e Gestisci / In viaggio", each opening a panel: link columns, an image card, the teal "Azioni Rapide" column with icons. Outlined square tools: assistance, search, accessibility, language. 120px bar | quick links and "Menu" | fixed: the Air Dolomiti header variant f0f9621d (tests 87b22712), its quick actions as Edge Delivery renders them c1dfeb60. The nav documents (it, en, de) carry the card pictures, the quick-action icons and the search tool; on preview | lh-com migration agent |
| 10 | Homepage alert strip | US travel attestation alert at the top | the flash-teaser block shows nothing | open: the Message Center content and code for tenant airdolomiti | ema-adobe |
| 11 | Homepage stage and flight search (1440) | the search box on the bottom of the stage photo, a 243px teal band under it with the shortcuts | the search as a separate block under the stage and band | fixed: 7422a9de, 4cb85c76 (136px over the photo, 73px into the band) | lh-com migration agent |
| 12 | Flight search form | boxed fields 56px high with their labels above, the passengers as a field, a teal 56px button; at 1440 one white row with the trip type as a tab and an arrow end | underlined fields, the dates as one field | fixed: 7422a9de (Air Dolomiti rules only, no change to the block). The trip type stays a drop-down in a tab (www: two radio tabs) | ema-adobe (the block's markup) |
| 13 | Homepage on phones: "Prenota il tuo volo" | a white card on the stage opening the search as an overlay | the search form inline under the band | open: needs the flight search block's behaviour (an overlay), not rules | ema-adobe (blocks/flight-search) |
| 14 | "Gestisci al meglio il tuo viaggio" shortcuts | outlined pills without icons, as wide as their text (152 x 66, 266 x 66), one row that scrolls sideways on phones, beside the label at 1440 | a 2 x 2 grid of icon tiles on phones; icon buttons of equal width at 1440 | fixed, 04a68b91 | lh-com migration agent |
| 15 | Homepage offers | grey cards (#f4f4f4, 10px radius) that are one link: route, price, fare in capitals; the text over the picture on phones, beside it at 1440 | white cards, the picture on top, price and fare in one line, a separate arrow link | fixed: carousel-cards (promo) d90df76a (test bbd9d3e4), look 70dfe307; the three homepages on preview. "Vedi tutto (3)" and the arrows stay under the cards (www: beside the heading) | lh-com migration agent |
| 16 | eSIM | the Breeze widget with the plans | the "Find your eSIM plan" link: the esim-widget block is behind the site flag `esim-widget`, which is off | open: you check the widget on preview and set the flag | the user |
| 17 | Blog posts: top | no feature picture, no category chip, the title first, the reading time alone (16px), the text in a 1200px column from the left | the feature picture, the chip, date and reading time, the text centred in two thirds | fixed, 70dfe307 | lh-com migration agent |
| 18 | Footer (1440) | outlined pills at the top right; the company links (no title) with the address and payment logos under them; three columns a row (contacts, news, routes; assistance, legal) with 14px regular titles; a dark teal band with the white logo and round social links; the company line on a grey bar | the search field, five titled columns, a row of text buttons with small icons, a separate legal row, a white logo row | fixed: the footer documents 62277212 (test dfbcfb1b: legal links as the column "Info legali", buttons, social links and payments as three badge sections), the layout 70dfe307; on preview. Phones keep the accordion (with "Info legali" now one of its rows) | lh-com migration agent |
| 19 | Newsletter strip above the footer | "Iscriviti alla nostra newsletter", a line of text and an email field (300 x 82, the teal envelope) | a link "Iscriviti alla nostra newsletter" | fixed: d90df76a (test bbd9d3e4), 70dfe307; 283 documents on preview. Open: www's field takes the address in place; ours is a link drawn as the field that opens the subscription form | lh-com migration agent (a small block; outside 355's files) |
| 20 | Fleet stage: breadcrumb | the trail in white on the top of the stage photo | the trail above the stage | open (minor) | lh-com migration agent |

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
