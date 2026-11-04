# Air Dolomiti against www: parity

airdolomiti.turnsthe.page (lh-airdolomiti) compared with www.airdolomiti.it / .eu / .de on
2026-11-04: at 390 px first, then at 1440 px. Viewport screens side by side, ours on the left. On www the
consent window and the chat button were hidden. The computed type of the titles, headings, cards and
breadcrumb was measured on both sites. One www page every 12 s, one browser at a time. The
screenshots are outside git (`airdolomiti-views/`, next to the repo).

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

State: **fixed** (in code or documents, with the commit), **open** (with its owner).

| # | Where | www | Ours (before) | State | Owner |
| --- | --- | --- | --- | --- | --- |
| 1 | Page titles (h1 of inner pages) | light 300, 38px / 46px at every width; subtitle 22px / 30px | bold 700, 36px at 390 and 48px at 1440; subtitle 16px | fixed, 1ccf46c4 (styles/themes/airdolomiti.css) | lh-com migration agent |
| 2 | Section headings (h2) | light 300, 38px / 46px at 390 and 42px / 50px at 1440 | 28px at 390, 36px at 1440 | fixed, 1ccf46c4 | lh-com migration agent |
| 3 | Blog posts: title and lead h3 | title semibold 600, 38px / 40px (65px / 72px at 1440); lead h3 regular 400, 26px / 32px (35px / 40px) | title bold 36px; lead h3 bold 20px | fixed, 1ccf46c4 | lh-com migration agent |
| 4 | Breadcrumb | "Home \| Orario Voli" under the header on every inner page and at every width: 15px midnight navy, parents semibold, a bar between the items | none (the documents had no Parent rows) | fixed: importer and test ac06caa4 (c762ac11 red), look 1ccf46c4; 1557 documents re-imported with Parent / Breadcrumb Title rows (homepages "Home"), uploaded to DA and previewed (not published) | lh-com migration agent |
| 5 | Header on phones | logo, search and menu only | a quick-links row under the logo (Prenota un volo, Stato volo, Gestione) | fixed, 1ccf46c4 (hidden below 768px) | lh-com migration agent |
| 6 | Baggage and contact link tiles | image cards with the title as a beige chip (80% opaque, 10px radius) on the image; the whole card links; a sideways row on phones (325 x 225 cards), 3 per row at 1440 | image, bold title and an arrow link, stacked | fixed, 1ccf46c4 | lh-com migration agent |
| 7 | Stage titles (fleet) | light 300 | bold 700 | fixed, 1ccf46c4 (weight) | lh-com migration agent |
| 8 | Stage title size and box (fleet, 1440) | 65px / 72px, dark text in a translucent white box | 42px, white text on the image | open | lh-com migration agent (AD hero-campaign variant) |
| 9 | Header on desktop | mega menu "Esplora / Prenota e Gestisci / In viaggio"; accessibility, search, login and language icons | quick links and "Menu" | open | ema-adobe (shared header code), then the nav document (lh-com migration agent) |
| 10 | Homepage alert strip | US travel attestation alert at the top | the flash-teaser block shows nothing | open: the Message Center content for tenant airdolomiti | ema-adobe / steering session |
| 11 | Homepage stage and flight search | larger image, a "Prenota il tuo volo" card on phones; the search overlaps the stage at 1440 | the flight search as a separate block below the stage | open | ema-adobe (blocks/flight-search); the stage CTA lh-com migration agent |
| 12 | Flight search form | radio buttons for the trip type, boxed fields | a dropdown, other field style | open | ema-adobe (blocks/flight-search) |
| 13 | "Gestisci al meglio il tuo viaggio" tiles on phones | one row of pills | a 2 x 2 grid (at 1440 the same) | open | lh-com migration agent (AD CSS) |
| 14 | Homepage offers carousel | text above the image on a beige card, arrow buttons, "Vedi tutto (3)" | image on top, white card, dots | open | lh-com migration agent (AD carousel-cards variant) |
| 15 | eSIM | the Breeze widget (`<breeze-widget>`) with the plans | the "Find your eSIM plan" link to www: the esim-widget block is behind the site flag `esim-widget`, which is off | open: turn the site flag on (a third-party script on the site) | the user (site config decision); the block is ready |
| 16 | Blog posts on phones | no featured image, the reading time only | featured image, category chip and date | open (minor) | lh-com migration agent (article-header for the site) |
| 17 | Blog post title position at 1440 | title at the top, full width | below the featured image | open | lh-com migration agent |
| 18 | Footer | 4 link columns, then a dark band with the logo, "Member of Lufthansa Group" and large social circles, then the copyright | headings, a quick-links row with small icons, a white logo row | open | lh-com migration agent (footer document from airdolomiti-nav.mjs and AD CSS) |
| 19 | Newsletter strip above the footer | "Iscriviti alla nostra newsletter" with an email field on many pages | a link "Iscriviti alla nostra newsletter" | open | lh-com migration agent (footer/nav document) |

Rows 1-7 are scoped to the site: rules under `body.brand-airdolomiti` in the theme file that
scripts/brand.js loads only on lh-airdolomiti, plus its importer and documents. The lh-edge smoke
(lufthansa, lufthansa-edge, lufthansa-cn, discover, ita, austrian, cargo, airdolomiti) gave the
same answers before and after the push. On tap.turnsthe.page one answer changed (`/en-pt`): TAP's
own commits (1f4bf6f2, a223086a) landed in the same window, and the theme file never loads there.

airdolomiti.turnsthe.page serves the published site, so the new documents show there only after
publishing. Until then, check them on main--lh-airdolomiti--moved-permanently.aem.page. The code
rules are live on both hosts.

The search pages and the newsletter confirmation pages (3 languages each) have no www snapshot.
They carry no breadcrumb rows.
