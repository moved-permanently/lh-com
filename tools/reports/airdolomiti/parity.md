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
| 4 | Breadcrumb | "Home \| Orario Voli" under the header on every inner page and at every width | none | fixed: ac06caa4 (test c762ac11), look 1ccf46c4; 1557 documents with Parent / Breadcrumb Title rows. 356: the English and German pages' Parent now names the homepage by its address, /en/ and /de/ (613bec49 test, 4833a764; 245 documents on preview, /en/assistance held back by the upload's guard, which reads the change as a link back to www). Open: on aem.page those trails still miss "Home": blocks/breadcrumb drops the slash before fetching the parent (sitePath) and aem.page answers /en and /de with 404; the published host redirects them, so the live trails are whole | the breadcrumb block's owner (shared code, outside 356's files) |
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
