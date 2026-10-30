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
The three files above are on the AEM environment (2026-10-30, answering through lh-edge's
dam-aem route).

Batches 2-22, for AEM before they go live (new):

| page | edsDamPath | www path | bytes |
| --- | --- | --- | ---: |
| `/it/it/world-of-ita-airways/discover-ita-airways/inspired-by-alitalia` | `/content/dam/ita/videos/world-of-ita-airways/discover-ita-airways/inspired-by-alitalia/24-09-video-logo.mp4` | `/content/dam/ita/videos/world-of-ita-airways/discover-ita-airways/inspired-by-alitalia/24_09_Video_Logo.mp4` | 129,545,286 (Content-Range, not downloaded) |
| `/it/it/world-of-ita-airways/discover-ita-airways/sustainability/female-talent` | `/content/dam/ita/videos/world-of-ita-airways/discover-ita-airways/sustainability/female-talent/bambine-che-volano-sub-it.vtt` | `/content/dam/ita/videos/world-of-ita-airways/discover-ita-airways/sustainability/female-talent/Bambine_che_volano_SUB_IT.vtt` | 2,190 |
| same | `/content/dam/ita/videos/world-of-ita-airways/discover-ita-airways/sustainability/female-talent/bambine-che-volano-ad-it.vtt` | `/content/dam/ita/videos/world-of-ita-airways/discover-ita-airways/sustainability/female-talent/Bambine_che_volano_AD_IT.vtt` | 1,455 |

The it/it and fr/fr female-talent pages link the same video as it/en (on AEM already); fr/fr
uses the English tracks, as www does. Per batch: `content-sites/lh-ita/runs/batch-NN-aem.tsv`.

## Batches 2-22 (2026-10-30): the Studio capture

Source: the Studio's rendered pages (`ita-snapshots-001` to `-006`, 800 pages: it/it 270, it/en
199, fr/fr 230, es/es 101), every file checked against its manifest (bytes, sha256), placed
with `tools/importer/ita-studio.mjs --place` where lh-ita had no snapshot (797; the it/it,
fr/fr and es/es homepages replace own captures whose flight search had come out in English,
kept in `content-sites/lh-ita/own-replaced/`), recorded in the capture state (source studio,
capture time); cleaned.html and metadata.json built offline (`--pages`, nothing loaded from www).
Own captures only for the gaps (the nav and footer targets the sitemaps miss): 41 pages and one
404, plus 4 fresh captures for the comparison below (kept apart, not imported); with the DAM
files about 330 requests in this turn's sessions, no 403.

Check of five pages, Studio against own captures (it/it homepage; fresh captures of
offers-and-destinations, flight-status, check-in, checked-baggage): the same components, images
(real URLs, no placeholders) and data-dcep; no OneTrust markup (only its stylesheet, as in own
captures). The importers make byte-identical documents of flight-status, check-in and
checked-baggage, one fare footnote character differs on offers-and-destinations (its lazily
loaded destination tiles never reach the document), and the homepage is better from the Studio
(the flight search's Italian labels). Fixed on lh-ita's side: the Studio files keep www's
scripts; ita-import strips them before the import (as bd-session saves its own).

`tools/importer/ita-batch.mjs` runs a batch end to end. Previewed (documents with the roots'
nav and footer and documents a DAM switch changed): 2: 43, 3: 42, 4: 42, 5: 43, 6: 42, 7: 42,
8: 42, 9: 45, 10: 42, 11: 41, 12: 42, 13: 42, 14: 44, 15: 42, 16: 42, 17: 42, 18: 42, 19: 42,
20: 45, 21: 42, 22: 42; every document 200 on the preview, no www.lufthansa.com link made or
lost; spot checks at 1440 and 390 (preview only, the Studio has no screenshots): every block
loads, no broken images, no script errors. DAM: 300 files linked so far, 285 in lh-ita's DA,
6 for AEM, 9 that www answers 404 for (their links stay www's own, as on Discover).

Left out on the way:
- `/it/it/iscrizione`, `/fr/fr/connexion`, `/es/es/inicio-de-sesion`: the login page in those
  languages (www's hreflang group of `/profile/login`, the login widget); the Studio's lists
  keep them. They were imported, uploaded and previewed in batches 4, 16 and 22 before the rule
  (`ita-scope.mjs`: also `/registo`) caught them; now out of the allowlist and the batch lists,
  still in lh-ita's DA on preview (not published): to be left out of publishing, or deleted.
- `/it/it/homepage/teasers/irreg_teaser`, `/it/en/homepage/teasers/irreg_teaser`: the homepage's
  irregularity teaser fragment, no page body.
- `/it/it/local-page/ministero-interno-amministrazione-centrale`,
  `/it/it/local-page/ministero-istruzione-merito`: 403 every time.
- `/it/en/legal/services-statement`: 404 on www (it/en's footer links it; only it/it has it).

## Batches 23-60 (2026-10-30): the rest of the Studio capture

Source: `ita-snapshots-007` to `-016` (1,498 pages, every file checked against its manifest),
1,484 placed; kept own captures: 9 es/es legal pages (batch 22's gaps) and the nl/nl, br/pt,
gr/el, jp/ja and it/en homepages (the same content as the Studio's); de/de's homepage replaced
(its flight search had come out in English). The 216 pages the Studio found absent (404: 206
xx/* own pages, 8 English `homepage-new`, `/gr/el/legal/company-transparency`,
`/mv/en/testinggg`) are recorded as 404 (`ita-studio.mjs --absent`) and left out, with the
three pages www blocks every time (the two ministero pages,
`/us/en/local-page/national-italian-american-foundation`). A market root's homepage is now its
own document (64 roots, each with its own nav and footer); the reference homepages carry no
`markets` row any more (it/en, it/it, fr/fr, es/es re-imported and previewed again).
`/al/it`, `/be/it`, `/ch/it/homepage-new` (a variant homepage, 200 on www) are those roots' own
pages, imported with the homepage template. Left out as a draft:
`/mv/en/Ita-draft-page-inspiration/draft-promo-page`.

Previewed: 38 batches, 1,691 documents with the roots' nav and footer (23: 42, 24: 42, 25: 42,
26: 45, 27: 42, 28: 42, 29: 42, 30: 42, 31: 44, 32: 43, 33: 42, 34: 42, 35: 42, 36: 42, 37: 42,
38: 45, 39: 42, 40: 42, 41: 42, 42: 42, 43: 42, 44: 44, 45: 42, 46: 42, 47: 42, 48: 42, 49: 45,
50: 42, 51: 42, 52: 42, 53: 42, 54: 41, 55: 48, 56: 81, 57: 72, 58: 63, 59: 52, 60: 18), every
document 200, no www.lufthansa.com link made or lost. Own captures: the reference roots' nav and
footer targets (28 pages) and one xx/el page. 404 on www (no document, the links stay www's):
`/gr/el/book-and-prepare/offers/youth-offers` (gr/el's menu), `/jp/ja/support/utilities/invoicing`
(jp/ja's footer), `/xx/el/legal/company-transparency`. DAM: 303 files linked, 288 in lh-ita's DA,
6 for AEM (all on AEM already), 9 that www answers 404 for. Spot checks at 1440 and 390 (preview
only): every block loads, no broken images; one script error once at 390 on
`/br/pt/legal/additional-bag-during-check-in-conditions`, not reproduced; one load timeout at
1440 on `/jp/ja/support/support-faq/ita-airways-business-faq`, clean on the second load (2,431
runs in all for batches 23-60).

The import reports: the bulk importer writes them to lh-com's `tools/importer/reports/<path>`;
on six paths both sites have (`/at/de/homepage`, `/de/de/homepage`, `/de/de/help-and-contact`,
`/de/en/homepage`, `/gb/en/homepage`, `/gb/en/feedback`) ITA's run overwrote lh-com's reports in
the working tree and moved them away (never committed; restored from git). `ita-import.mjs` now
sets lh-com's reports aside during the import (c29049ec).

The login pages `/it/it/iscrizione`, `/fr/fr/connexion`, `/es/es/inicio-de-sesion`: off live
(by hand), no document links them (the it/it sitemap page links www's `/it/it/profile/login`);
the environment's permission check refused the preview delete (2026-10-30); taken off preview
and out of DA by hand, with the seven xx bookinglist pages (now left out by `ita-scope.mjs`, gone
from the allowlist and the upload state; all ten answer 404 on preview and live).

## Roots and lh-edge (2026-10-30)

www's 64 roots (`content-sites/lh-ita/scope.json`): the nine reference roots hold the language
documents; a market root uses its language's reference root for every page its sitemap shares
with it (the document's `markets` row) and holds its own homepage and own pages. lh-edge's ITA
entry (`tools/workers/lh-edge/src/sites.js`, read only) has 59 of them; **missing: at/de, ch/de,
xx/de (German), xx/el (Greek), be/nl (Dutch)**. Their documents are on lh-ita (own homepage and
pages, nav and footer, and the reference documents' `markets` rows name them).

| root | language | documents from | own documents | in lh-edge sites.js |
| --- | --- | --- | ---: | --- |
| at/de | German | de/de | 2 | **missing** |
| ch/de | German | de/de | 1 | **missing** |
| xx/de | German | de/de | 1 | **missing** |
| xx/el | Greek | gr/el | 2 | **missing** |
| be/nl | Dutch | nl/nl | 1 | **missing** |
| de/de | German | (reference) | 0 | yes |
| gr/el | Greek | (reference) | 0 | yes |
| ae/en | English | it/en | 2 | yes |
| al/en | English | it/en | 1 | yes |
| ar/en | English | it/en | 1 | yes |
| at/en | English | it/en | 1 | yes |
| au/en | English | it/en | 2 | yes |
| be/en | English | it/en | 3 | yes |
| bg/en | English | it/en | 10 | yes |
| br/en | English | it/en | 2 | yes |
| ca/en | English | it/en | 1 | yes |
| ch/en | English | it/en | 1 | yes |
| de/en | English | it/en | 1 | yes |
| do/en | English | it/en | 1 | yes |
| dz/en | English | it/en | 2 | yes |
| eg/en | English | it/en | 2 | yes |
| es/en | English | it/en | 1 | yes |
| fr/en | English | it/en | 1 | yes |
| gb/en | English | it/en | 2 | yes |
| gh/en | English | it/en | 2 | yes |
| gr/en | English | it/en | 2 | yes |
| hr/en | English | it/en | 2 | yes |
| il/en | English | it/en | 4 | yes |
| in/en | English | it/en | 2 | yes |
| it/en | English | (reference) | 0 | yes |
| jp/en | English | it/en | 2 | yes |
| ly/en | English | it/en | 2 | yes |
| mt/en | English | it/en | 11 | yes |
| mu/en | English | it/en | 2 | yes |
| mv/en | English | it/en | 3 | yes |
| nl/en | English | it/en | 1 | yes |
| sa/en | English | it/en | 1 | yes |
| sn/en | English | it/en | 1 | yes |
| th/en | English | it/en | 2 | yes |
| tn/en | English | it/en | 1 | yes |
| us/en | English | it/en | 5 | yes |
| ve/en | English | it/en | 10 | yes |
| xx/en | English | it/en | 16 | yes |
| ar/es | Spanish | es/es | 1 | yes |
| do/es | Spanish | es/es | 5 | yes |
| es/es | Spanish | (reference) | 0 | yes |
| xx/es | Spanish | es/es | 10 | yes |
| be/fr | French | fr/fr | 1 | yes |
| ca/fr | French | fr/fr | 1 | yes |
| ch/fr | French | fr/fr | 1 | yes |
| fr/fr | French | (reference) | 0 | yes |
| tn/fr | French | fr/fr | 1 | yes |
| xx/fr | French | fr/fr | 10 | yes |
| al/it | Italian | it/it | 2 | yes |
| be/it | Italian | it/it | 2 | yes |
| ch/it | Italian | it/it | 3 | yes |
| it/it | Italian | (reference) | 0 | yes |
| xx/it | Italian | it/it | 7 | yes |
| jp/ja | Japanese | (reference) | 0 | yes |
| xx/ja | Japanese | jp/ja | 5 | yes |
| nl/nl | Dutch | (reference) | 0 | yes |
| xx/nl | Dutch | nl/nl | 5 | yes |
| br/pt | Portuguese | (reference) | 0 | yes |
| xx/pt | Portuguese | br/pt | 8 | yes |

## Completeness (2026-10-30)

In scope: the documents of the plan (`ita-plan.mjs`): a reference root's pages, a market root's own
pages and homepage (its shared pages are its language's documents). Left out: the sitemap URLs the
rules leave out (`ita-scope.mjs leftOut`: 404 = the Studio found them absent; blocked = 403 every
time). Preview 200: `.plain.html` on main--lh-ita--moved-permanently.aem.page answers 200 now. The
128 nav and footer documents (64 roots) answer 200 too. Not in the table, gone from preview and DA
(taken out by hand): the three localized login pages and the seven xx bookinglist pages.

| root | kind | in scope | documents | preview 200 | left out (by rule) | in scope, no document |
| --- | --- | ---: | ---: | ---: | --- | --- |
| ae/en | market | 2 | 2 | 2 | teaser fragment 1, configuration 1, login/profile 16 |  |
| al/en | market | 1 | 1 | 1 | teaser fragment 1, configuration 1, login/profile 16 |  |
| al/it | market | 2 | 2 | 2 | teaser fragment 1, login/profile 16 |  |
| ar/en | market | 1 | 1 | 1 | teaser fragment 1, configuration 1, login/profile 16 |  |
| ar/es | market | 1 | 1 | 1 | login/profile 17 |  |
| at/de | market | 2 | 2 | 2 | configuration 1, login/profile 15 |  |
| at/en | market | 1 | 1 | 1 | teaser fragment 1, configuration 1, login/profile 16 |  |
| au/en | market | 2 | 2 | 2 | teaser fragment 1, configuration 1, login/profile 16, 404 1 |  |
| be/en | market | 3 | 3 | 3 | teaser fragment 1, configuration 1, login/profile 16, 404 1 |  |
| be/fr | market | 1 | 1 | 1 | configuration 1, login/profile 17 |  |
| be/it | market | 2 | 2 | 2 | teaser fragment 1, login/profile 16 |  |
| be/nl | market | 1 | 1 | 1 | configuration 2, login/profile 19 |  |
| bg/en | market | 10 | 10 | 10 | teaser fragment 1, configuration 1, login/profile 16 |  |
| br/en | market | 2 | 2 | 2 | teaser fragment 1, configuration 1, login/profile 16, feedbackai 1 |  |
| br/pt | reference | 242 | 242 | 242 | login/profile 18, feedbackai 1 |  |
| ca/en | market | 1 | 1 | 1 | teaser fragment 1, configuration 1, login/profile 16, descoped 1 |  |
| ca/fr | market | 1 | 1 | 1 | configuration 1, login/profile 16 |  |
| ch/de | market | 1 | 1 | 1 | configuration 1, login/profile 15, feedbackai 1, descoped 2 |  |
| ch/en | market | 1 | 1 | 1 | teaser fragment 1, configuration 1, login/profile 16, feedbackai 1, descoped 1 |  |
| ch/fr | market | 1 | 1 | 1 | configuration 1, login/profile 17, feedbackai 1 |  |
| ch/it | market | 3 | 3 | 3 | teaser fragment 1, login/profile 16, feedbackai 1 |  |
| de/de | reference | 232 | 232 | 232 | configuration 1, login/profile 15, feedbackai 1, descoped 1 |  |
| de/en | market | 1 | 1 | 1 | teaser fragment 1, configuration 1, login/profile 16, feedbackai 2, descoped 1 |  |
| do/en | market | 1 | 1 | 1 | teaser fragment 1, configuration 1, login/profile 16, feedbackai 1 |  |
| do/es | market | 5 | 5 | 5 | login/profile 17 |  |
| dz/en | market | 2 | 2 | 2 | teaser fragment 1, configuration 1, login/profile 16 |  |
| eg/en | market | 2 | 2 | 2 | teaser fragment 1, configuration 1, login/profile 16, 404 1 |  |
| es/en | market | 1 | 1 | 1 | teaser fragment 1, configuration 1, login/profile 16, feedbackai 1 |  |
| es/es | reference | 236 | 236 | 236 | login/profile 17, feedbackai 1 |  |
| fr/en | market | 1 | 1 | 1 | teaser fragment 1, configuration 1, login/profile 16, feedbackai 1 |  |
| fr/fr | reference | 237 | 237 | 237 | configuration 1, login/profile 17, feedbackai 1 |  |
| gb/en | market | 2 | 2 | 2 | teaser fragment 1, configuration 1, login/profile 16, descoped 1, feedbackai 1 |  |
| gh/en | market | 2 | 2 | 2 | teaser fragment 1, configuration 1, login/profile 16, 404 1 |  |
| gr/el | reference | 228 | 227 | 227 | login/profile 15, 404 1, feedbackai 1 | /gr/el/book-and-prepare/offers/youth-offers (404 on www (own capture)) |
| gr/en | market | 2 | 2 | 2 | teaser fragment 1, configuration 1, login/profile 16 |  |
| hr/en | market | 2 | 2 | 2 | teaser fragment 1, configuration 1, login/profile 16, 404 1 |  |
| il/en | market | 4 | 4 | 4 | teaser fragment 1, configuration 1, login/profile 16, 404 1, descoped 6 |  |
| in/en | market | 2 | 2 | 2 | teaser fragment 1, configuration 1, login/profile 16, 404 1 |  |
| it/en | reference | 246 | 245 | 245 | teaser fragment 1, configuration 1, login/profile 16, feedbackai 1 | /it/en/legal/services-statement (404 on www (own capture)) |
| it/it | reference | 280 | 280 | 280 | teaser fragment 1, login/profile 16, feedbackai 1, blocked 2 |  |
| jp/en | market | 2 | 2 | 2 | teaser fragment 1, configuration 1, login/profile 16, feedbackai 1 |  |
| jp/ja | reference | 244 | 243 | 243 | configuration 2, login/profile 18, feedbackai 1 | /jp/ja/support/utilities/invoicing (404 on www (own capture)) |
| ly/en | market | 2 | 2 | 2 | teaser fragment 1, configuration 1, login/profile 16 |  |
| mt/en | market | 11 | 11 | 11 | teaser fragment 1, configuration 1, login/profile 16 |  |
| mu/en | market | 2 | 2 | 2 | teaser fragment 1, configuration 1, login/profile 16 |  |
| mv/en | market | 3 | 3 | 3 | teaser fragment 1, configuration 1, login/profile 16, feedbackai 1, draft 1, 404 2 |  |
| nl/en | market | 1 | 1 | 1 | teaser fragment 1, configuration 1, login/profile 16, feedbackai 1 |  |
| nl/nl | reference | 244 | 244 | 244 | configuration 2, login/profile 19, feedbackai 1 |  |
| sa/en | market | 1 | 1 | 1 | teaser fragment 1, configuration 1, login/profile 16 |  |
| sn/en | market | 1 | 1 | 1 | teaser fragment 1, configuration 1, login/profile 16 |  |
| th/en | market | 2 | 2 | 2 | teaser fragment 1, configuration 1, login/profile 16 |  |
| tn/en | market | 1 | 1 | 1 | teaser fragment 1, configuration 1, login/profile 16 |  |
| tn/fr | market | 1 | 1 | 1 | configuration 1, login/profile 17 |  |
| us/en | market | 5 | 5 | 5 | teaser fragment 1, configuration 1, login/profile 16, blocked 1, feedbackai 1 |  |
| ve/en | market | 10 | 10 | 10 | teaser fragment 1, configuration 1, login/profile 16 |  |
| xx/de | market | 1 | 1 | 1 | configuration 1, login/profile 15 |  |
| xx/el | market | 2 | 1 | 1 | login/profile 15, feedbackai 1 | /xx/el/legal/company-transparency (404 on www (own capture)) |
| xx/en | market | 16 | 16 | 16 | 404 28, configuration 6, login/profile 18 |  |
| xx/es | market | 10 | 10 | 10 | configuration 6, login/profile 16, 404 28 |  |
| xx/fr | market | 10 | 10 | 10 | configuration 6, login/profile 17, 404 30 |  |
| xx/it | market | 7 | 7 | 7 | 404 30, configuration 6, login/profile 18 |  |
| xx/ja | market | 5 | 5 | 5 | 404 31, configuration 6, login/profile 17 |  |
| xx/nl | market | 5 | 5 | 5 | 404 30, configuration 6, login/profile 17 |  |
| xx/pt | market | 8 | 8 | 8 | configuration 6, login/profile 18, 404 29 |  |
| **all 64** | | **2361** | **2357** | **2357** | 404 216, teaser fragment 39, configuration 92, login/profile 1044, feedbackai 25, descoped 13, blocked 3, draft 1 | 4 (404 on www) |

## For the Workers and shared config (not changed here)

- lh-forms: the form id `ita-mice` and lh-ita's origins (preview only until then).
- lh-proxy / the Lufthansa service API: lh-ita's preview origin, if the flight search, airport
  names and the destination finder's prices should work on lh-ita.
- lh-edge's DAM route: an lh-ita host, if www's DAM URLs should answer there as on
  discover.turnsthe.page.
- lh-edge's ITA roots: at/de, ch/de, xx/de, xx/el, be/nl (see Roots and lh-edge).
