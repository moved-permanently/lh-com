# ITA Airways on lh-com's code (lh-ita)

2026-10-30. Site `moved-permanently/lh-ita` (repoless, lh-com's code), preview
`https://main--lh-ita--moved-permanently.aem.page/`. Nothing on `.aem.live`. DA uploads and
previews run as IMS user benp@adobe.com (client `experience-catalyst-prod`, admin.hlx.page
`/profile`). Built the way Discover was (`tools/reports/lh-discover.md`, `discover-full.md`):
scope, plan, capture through one warm Bright Data session, offline import with lh-com's
importers, DAM copies, checks, `da-upload.mjs --site lh-ita`.

## How www.ita-airways.com answers

- Plain requests: `/it/en/homepage` 403 "Blocked" (an HTML block page, title `Blocked`);
  `robots.txt` 200. `.migration/project.json` has `sites.lh-ita.botProtected: true`.
- Bright Data browser: 200, but the page's `load` event never comes (90 s timeouts):
  `bd-session.mjs` / `bd-fetch.mjs --wait-until domcontentloaded` (new option, default `load`).
  The block page's title `Blocked` counts as a block in both tools.
- Blocks in the warm session, each followed by a 30-minute stop: after 90 sitemap files in
  8 minutes (403 at `sitemap_ita_mv_en.xml.gz`, 02:50); after 32 pages in 22 minutes (403 at
  `/it/en/support/support-faq/baggage-faq`, 03:43); one GET of a video under a wrong (Edge
  Delivery) name (403, 04:33). Pace: pages every 6-10 s, files every 5-10 s.
- One plain GET of the header logo SVG (by mistake, outside the session): 200 `image/svg+xml`.
  Edge Delivery's own image fetch from www works (all page images arrive in lh-ita's media).
- `/sitemap/sitemap_ita.xml.gz`: 128 market files (64 roots, `_<cc>_<ll>` and `_1`); the five
  `xx_es`, `xx_fr`, `xx_ja`, `xx_nl`, `xx_pt` files write `https://prod-www.ita-airways.com/...`
  (taken as www). The AirCore index is never read.

## Theme `ita`

`scripts/brand.js` `ita: { name: 'ITA Airways' }`; lh-ita's `/metadata.json` has `brand ita`.
`styles/themes/ita.css` (tokens and the brand's font faces): text and headings `#0b2340`, ITA blue
`#0171cf` (header bar, footer, primary button, links), hover `#01569d`, focus `#040f72`, greys
`#f8f8f9 #f3f3f4 #e7e7ea #d1d1d5 #a4a4ad #72727f`, success `#05663f`, error `#b01411` (lh-com's
blocks have no warning colour: `#ffa23a` is unused), header bar `#0171cf` with white text. Fonts:
www's mausy v1.40.1 `OpenSans-Regular.woff` (300 and 400) and `OpenSans-Bold.woff` (700) in
`fonts/ita/`, body and headings `opensans, arial, helvetica, mammilessymbol, sans-serif`
(Discover's fallbacks), all headings bold. Buttons: primary white on `#0171cf`, secondary
`#0171cf` on white, 8 px radius, 2 px border, 48 px high. Footer: link area `#0171cf` with white
text, logo row `#0b2340`, Star Alliance white.

New hooks in shared code, default today's value (lh-com checked unchanged in the preview):
`--button-primary-text`, `--button-secondary-color`, `--button-secondary-hover`,
`--button-radius`, `--button-min-height` (styles.css and the widget buttons), `--heading-light-weight`
(h2, heading-medium, heading-small), `--footer-surface`, `--footer-muted-text`,
`--footer-line-color`, `--footer-field-color`, `--footer-logos-surface`,
`--footer-star-alliance-filter`. Footer block: optional sections with Style `badges` (payment
logos, social links) and `note` (the company line); without them the footer is as before.
Flight-search: an optional `Shop` row (an `https://shop.*` availability URL); without it
shop.lufthansa.com as before. Icons `car-front`, `water-sport`, `product-insurance` added to
`/icons` (www's design-system drawings in lh-com's icon form, like Discover's).

## Nav and footer (it/en)

`tools/importer/ita-nav.mjs` from the homepage snapshot: the white logo
`/etc/designs/ita/clientlib-all/vite/img/ita-airways-header.svg`, the quick actions, the menu 1:1
from the header's JSON (`common-header-nav-horizontal`: 3 top items, 10 columns with their own
links, 57 links), accessibility, help, cart (www's homepage), Travel ID login (www's), the
country and language with the selector's countries (links to www). Footer: "Italy | English",
four link lists, payment methods (5) and "Stay up to date" (6), the legal row (12, cookie
settings opens the consent manager), the company line, the dark logo row (ITA, member of
Lufthansa Group, Star Alliance). PayPal's white SVG holds a 56 KB embedded PNG, which Edge
Delivery refuses at preview (409): the document uses a PNG of the same drawing
(`/media-da/ita/paypal-white.png`, uploaded with the footer).
ITA's roots are not in lh-com's locale table (`/it/en` resolves to lh-com's `/de/en`), so every
lh-ita document carries `nav` and `footer` metadata rows for its root.

## Batch 1 (it/en): `content-sites/lh-ita/runs/batch-01.txt`

37 pages, uploaded and previewed with nav and footer (39 documents, all 200 on the preview).
Each document has `markets` metadata: the market roots of its language whose sitemap has the
same page (35 English roots for most it/en pages).

/it/en/homepage, /it/en/support/utilities/contact,
/it/en/world-of-ita-airways/discover-ita-airways/roma-fiumicino,
/it/en/book-and-prepare/travel-information/baggage,
/it/en/manage-my-bookings/extra-services/seats-selection,
/it/en/book-and-prepare/travel-information/at-the-airport/lounges,
/it/en/manage-my-bookings/partners,
/it/en/book-and-prepare/travel-information/baggage/restricted-and-prohibited-items,
/it/en/world-of-ita-airways/services-on-board/catering/children-meals,
/it/en/book-and-prepare/travel-information/at-the-airport/priority/priority-gates,
/it/en/manage-my-bookings/partners/car-rental, /it/en/book-and-prepare/other-requests/accessible-travel,
/it/en/help-and-contact, /it/en/book-and-prepare/book-flights,
/it/en/manage-my-bookings/manage/check-in, /it/en/manage-my-bookings/manage/flight-status,
/it/en/manage-my-bookings/manage/manage-my-bookings, /it/en/manage-my-bookings/manage/change-and-refund,
/it/en/book-and-prepare/offers-and-destinations,
/it/en/world-of-ita-airways/discover-ita-airways/ita-airways-app,
/it/en/support/utilities/payment-methods, /it/en/legal, /it/en/legal/passenger-rights,
/it/en/legal/cookie-policy, /it/en/legal/conditions-of-carriage-group/conditions-of-carriage-ita,
/it/en/legal/accessibility-statement, /it/en/legal/imprint,
/it/en/legal/data-protection-overview/data-protection-ita,
/it/en/book-and-prepare/travel-information/baggage/checked-baggage,
/it/en/book-and-prepare/travel-information/baggage/carry-on-baggage,
/it/en/world-of-ita-airways/discover-ita-airways/fleet/long-haul,
/it/en/world-of-ita-airways/travel-classes/business-long-haul, /it/en/support/support-faq/baggage-faq,
/it/en/world-of-ita-airways/discover-ita-airways/sustainability/female-talent,
/it/en/book-and-prepare/travel-information/at-the-airport/digital-newsstand,
/it/en/book-and-prepare/travel-information/at-the-airport/security-waiting-times,
/it/en/book-and-prepare/offers/mice

Components to blocks: teasers in column views -> carousel-cards (ITA's two-column teaser rows
read as three-column ones, `ita-import.mjs withTeaserColumns`), accordion -> accordion-columns,
table -> table-striped, sidebar -> columns-media, flight manager -> flight-search (Shop row
`https://shop.ita-airways.com/booking/availability`, default origin Rome), fare teaser ->
destination-finder, lounge finder, car rental, flight status, ejournals (digital newsstand),
check-in entry -> booking-lookup, help centre -> help-center (a rendered snapshot: the app is
empty in the first capture; `ita-assets.mjs --render`), booking login widget -> carousel-cards
(lh-com's mapping) with "Enter booking code" to the page on www, security waiting times -> a link
to the page on www, the homepage flash teaser empty (no messages on lh-ita). MICE: form block
with `form` config `ita-mice`, preview only.

Checks (`ita-check.mjs`, `ita-shots.mjs`): every block loads, no broken images, no script
errors at 1440 and 390 px; text coverage against www 90-100 % except widgets that draw their own
labels (car rental, destination finder, booking, newsstand login, the help feedback box) and the
homepage's flash teaser messages. Pairs (www left, preview right):
`content-sites/lh-ita/runs/shots/<path>-<width>.jpg`.

## Pages with problems

- `/it/en/book-and-prepare/offers/mice`: form preview only; www's form posts to its own AEM path
  (`/content/ita/markets/it/en/book-and-prepare/offers/mice.html`) and names no thank-you or
  error page, so the document has the `form` row only. lh-forms has to learn `ita-mice`.
- `/it/en/manage-my-bookings/manage/check-in`: www's check-in hand-off target is not in the page
  (and the form is not submitted), so a valid search opens the page on www (Submit URL row),
  none of the entered data in the URL.
- Flight search (homepage, book-flights): the hand-off to shop.ita-airways.com uses lh-com's
  shop payload at `https://shop.ita-airways.com/booking/availability` (the same booking platform;
  not verified with a search). Labels, airport names and prices come from lh-com's Lufthansa
  APIs, which answer neither lh-ita's origin (CORS of www.lufthansa.com's service API) nor
  lh-proxy (allows lh-com and lh-flynet hosts): the destination finder shows no prices, the
  flight search lh-com's built-in labels (as on lh-discover).
- `/it/en/world-of-ita-airways/discover-ita-airways/sustainability/female-talent`: the video
  and its tracks wait for AEM (below); www's two-column text with the SDG images and the badge
  stacks on the preview (columns-media's media column).
- Layout differences seen in the pairs: www's flight-search fields are boxed (lh-com's are
  underlined); the destination finder's "Flight offers from" is light (its own weight, no hook);
  www rounds images; tables bold their first column on the preview. Several info pages are 1.3-2x
  taller at 1440 than www: lh-com's spacing and stacked column views (fleet/long-haul,
  ita-airways-app, female-talent, check-in, manage-my-bookings).
- Header: www's top items open horizontal drop-downs (`common-header-nav-horizontal`); lh-com's
  header shows them in its slide-in menu, column headings as text (the documents keep their
  links, as lh-com's nav documents do).

## Large files for AEM (Edge Delivery can't hold them)

| page | edsDamPath | www path | bytes |
| --- | --- | --- | ---: |
| `/it/en/world-of-ita-airways/discover-ita-airways/sustainability/female-talent` | `/content/dam/ita/videos/world-of-ita-airways/discover-ita-airways/sustainability/female-talent/ita-allebambinechevolano-def-16x19-vers-1.mp4` | `/content/dam/ita/videos/world-of-ita-airways/discover-ita-airways/sustainability/female-talent/ITA_AlleBambineCheVolano_DEF_16x19_vers_1.mp4` | 146,728,263 (Content-Range, not downloaded) |
| same | `/content/dam/ita/videos/world-of-ita-airways/discover-ita-airways/sustainability/female-talent/bambine-che-volano-sub-en.vtt` | `/content/dam/ita/videos/world-of-ita-airways/discover-ita-airways/sustainability/female-talent/Bambine_che_volano_SUB_EN.vtt` | 2,092 |
| same | `/content/dam/ita/videos/world-of-ita-airways/discover-ita-airways/sustainability/female-talent/bambine-che-volano-ad-en.vtt` | `/content/dam/ita/videos/world-of-ita-airways/discover-ita-airways/sustainability/female-talent/Bambine_che_volano_AD_EN.vtt` | 1,333 |

In lh-ita's DA and previewed (relative links): 13 PDFs (42 KB to 2.1 MB) and the video's poster.

## For the Workers and shared config (not changed here)

- lh-forms: the form id `ita-mice` and lh-ita's origins (preview only until then).
- lh-proxy / the Lufthansa service API: lh-ita's preview origin, if the flight search, airport
  names and the destination finder's prices should work on lh-ita.
- lh-edge's DAM route: an lh-ita host, if www's DAM URLs should answer there as on
  discover.turnsthe.page.
