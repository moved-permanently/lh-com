# lh-swiss (SWISS)

Site `moved-permanently/lh-swiss`, repoless on lh-com's code, content in DA
`moved-permanently/lh-swiss`; `/metadata.json` sets robots noindex and brand `swiss`.

## Theme `swiss` (2026-11-02)

Sources: the group design system's `/digitalhangar/design-system/releases/mausy-v1.40.1/standalone/css/swiss.css`
(theme `maui-theme-lx`, one request, 200); www.swiss.com's ch/en homepage answered the first page
load with Cloudflare's "Just a moment..." (403), so nothing else was loaded from www. The look comes
from the theme file, the groundwork's measurements and the rendered snapshots of `/ch/en/homepage`
and `/ch/de/homepage` (swiss-snapshots-001.tar.gz, cookies rejected; read offline: their CSS stays on
www, so they give the structure, texts, classes and links, not computed styles).

`scripts/brands.js` `swiss`: name SWISS, OneTrust `01994cb2-f461-7489-80cc-e1ce655a86bc` (the
snapshots' data-domain-script), Message Center tenant `lx`, www `www.swiss.com`, portal `LX` (the
pages' meta X-Portal), airline `LX`, hub `ZRH` (GVA the second one: the roots' airports come with
`BRAND_SITES`), the fallback cookie banner's links: the footer's privacy statement and imprint
under `/ch/<ll>/terms-conditions` (en, de; no cookie page of its own; other languages: en's).

`styles/themes/swiss.css`, tokens only, on lh-com's names as `brussels.css`:

| What | Value (design-system token) |
| --- | --- |
| Fonts | CH Sans, `.woff` only: SwissHead 300/400/700 (`chsans-light|regular|bold-webfont.woff`), SwissText 400/700, at www's path `/digitalhangar/design-system/releases/mausy-v1.40.1/standalone/fonts/swiss/` first (the replica's own host), `https://www.swiss.com/...` second |
| Text, headings | `#101010` (lxgrey8); headings SwissHead 700, line height 1.1 (h2 36/39.6 at 1440), 0.7 px tracking; copy SwissText 16/22, 0.6 px |
| Actions, links, selection | `#c00` (lx-red), hover `#900` (berry-red) |
| Buttons | square (radius 0), 50 px, 18 px bold, padding 8 px 30 px; primary white on red; secondary and the buttonsecondary fill warm grey `#6f6660`, hover pine grey `#554e49` |
| Greys | `#f2f2f2 #f2f2f2 #ccc #ccc #929292 #929292 #666 #101010` (lxgrey1 to 8) |
| Messages, focus | error `#ab3b35` (on `#f8ded6`), success `#477c00` (on `#f2f5ee`); info `#2c6187` on `#e8f5fc` and warning on `#feeea4` have no lh-com token; focus `#0968f6` |
| Header | white bar, a 1 px `#ccc` rule under it (`--header-bar-shadow`), quick actions warm grey, hover pine grey; logo 28 px high (www's `swiss-logo.svg` 121×28); 121 px from 768 px |
| Footer | white, a 1 px `#ccc` rule on top; headings `#101010` 18 px bold without a rule under them; links warm grey 16/22 regular, hover pine grey; logo row white, the logo 20 px (80×20) |
| Main-stage card | hero-card-overlay's light variant (white, 8 px radius from 768 px, 40/48 px padding): the documents choose it |

Shared code, additive (each default is today's value): `styles/styles.css` `--body-letter-spacing`
and `--heading-letter-spacing` (no fallback: unset, the property inherits as before),
`--button-font-size` (default the body size), `--button-padding` (default 11px 30px);
`blocks/footer/footer.css` `--footer-text-color` (default #fff), `--footer-link-color` and
`--footer-link-hover-color` (default the footer text), `--footer-top-line` (default none),
`--footer-locale-color` and `--footer-locale-hover-color` (defaults #ebebeb, #fff).

`scripts/brand-icons.js` `swiss`: `/etc/designs/lx/favicon.ico` (image/ico) and
`/etc/designs/lx/manifest.json` ("SWISS", short "LX"); `etc/designs/lx/` holds www's favicon, manifest,
its three icons (`clientlib-all/img/icon_16x16.png`, `icon_32x32.png`, `icon_192x192.png`) and the logo
`clientlib-all/vite/img/swiss-logo.svg`, byte for byte from swiss-assets-002.tar.gz (nothing hot-linked
to www.swiss.com).

Open:
- Not this repository's part of lh-swiss: lh-edge's `swiss.turnsthe.page` entry (`SITE_HOSTS`,
  `SITE_ORIGINS`, `SITE_WWW_HOSTS`) and `SITE_DESIGN_HOSTS` `swiss=www.swiss.com`, so the CH Sans
  files and the design system answer from the site's own host (until then the fonts come from
  www.swiss.com's absolute URL); `helix-query.yaml` for lh-swiss's indexes.
- From the snapshots, for the nav and footer documents (the kickoff): the footer's four columns
  (About us, Services, Customer support, Stay informed), the social row (LinkedIn, Instagram,
  TikTok, Facebook, X, Threads, YouTube: `/content/dam/lx/icons/footer-*.svg`), the sub-footer:
  SWISS logo 80×20, "Member of Lufthansa Group", Star Alliance, then Imprint, Legal, Data
  protection, Change Privacy Settings (lh-com's footer has the legal row above the logos).

## Content pilot: ch/en and ch/de (2026-11-02)

From the Studio's five snapshot archives only (603 pages, sha256 as the brief; no page of
www.swiss.com was loaded). Never published: DA and preview only.

Tooling (`tools/importer/swiss-*.mjs`, from Brussels'): `swiss-studio` places the archives and
records each page's list (01 to 10, c1, x01); `swiss-scope` (reference roots ch/<ll> and kr/ko,
`markets` per document, own documents and market homepages for later roots; every archive page
is in scope) and `swiss-plan` (the batches 01 to 10 and the archives' c1 and x01, pilot roots
only); `swiss-import` (offline, CSP, Bright Data off), `swiss-nav`, `swiss-dam` (plain GETs, 5 to
7 s apart, stop at the first 403/429/503/challenge; `--known` takes the groundwork's sizes;
`--switch --pending` shows images from their place in DA so the preview asks nothing of www),
`swiss-dam-preview` (images the preview already holds, copied from our own preview host),
`swiss-check`, `swiss-batch` (no capture). Test: `test/swiss-tools.test.mjs`.

`BRAND_SITES.swiss`: ch/en and ch/de (own documents), names "Switzerland | English" and
"Switzerland | Deutsch" (the homepages' line; ch/de's says Switzerland too), airports ZRH; every
other root of the dialog links to its homepage on www.swiss.com.

Nav and footer (ch/en, ch/de, 1:1 from the homepage snapshots): logo, Book, My flights (www's
cockpit deep link), Check-in, Flight status; Accessible travel, Help & Contact, cart (www),
Login (Travel ID, www), Menu; the menu's 3 items, 9 columns, 51 links with "SWISS Magazine"
(www links); "Flight vouchers" unwrapped from urldefense.com to the root's
book-and-manage/offers/vouchers page. Footer: 4 columns, 7 social icons (Style badges), the logo
row (SWISS, member of Lufthansa Group, Star Alliance), the legal links ("Change Privacy
Settings" opens the consent dialog). The documents keep www's order (logos before the legal
links); `blocks/footer` renders the legal links above the logo row regardless. Proposed, not
added: when a footer document's logos section comes before its legal section (only SWISS's do),
the block shows the logo row in the legal row's place, SWISS logo and Lufthansa Group left,
legal links in the middle, Star Alliance right as www's sub-footer; other footers unchanged (a
DOM test per brand).

Batches (`content-sites/lh-swiss/runs/batch-N.txt`; what each batch previewed in
`batch-N-paths.txt`): 01 77, 02 74, 03 51, 04 51, 05 51, 06 49, 07 46, 08 46, 09 46, 10 45, c1 29,
x01 37: 602 documents plus 4 nav and footer documents, all preview 200. c1's 30th page
(`/ch/fr/local-page/swiss-nati-women/confirmation`) waits for ch/fr.

Components as Austrian and Brussels: columns-media for the column views, the sidebar; tabs
that hold columns, accordions or tables become their panels one after the other (the tab labels
go, as on Austrian); authorquote as blockquotes; the homepage set; the help centre through the
help-center parser (micro-frontend with its fallback, accordion-columns); inpagewidget, ghost
and ppfi-web-component left out. Class C links to www: the PNR search, the passenger receipt
portal, the rebook logins and ch/de's refund login (their intro text, then the link), the FAQ
search bar, www's AR viewer iframe. The check-in deadline search is `checkin-deadlines`, the
culinary hub `micro-frontend`.

Embeds (lh-com 0fc6a48c, b6d5b86e): `www.swiss-inflightentertainment.com` widgets as the
in-flight entertainment widget and `https://www.google.com/maps/embed?pb=` (type google-maps,
400 px) in `scripts/media.js` and the importer; Lufthansa's widget and other Maps links as
before. Eight-host smoke before and after: 0 differences; the 19 pages and the seven brand
homepages equal apart from the head's stylesheet order.

Redirects (`runs/redirects.tsv`): `/ch/en/various/GVA-2022-Inspiration` to
`/ch/en/various/gva-2022-inspiration`, `/ch/en/local-page/newsletter-sustainability/thank-you-for-your-subscription-`
to the same path without the trailing hyphen.

Forms (`runs/forms.tsv`): 41 form documents, ids `swiss-<page>` (ch/en and ch/de share one),
preview only: 17 service forms (the groundwork's 15 plus x01's group travel request and data
protection form) and 6 raffles (a350-geneve keeps www's 7 November). lh-forms needs: the lh-swiss
hosts (`main--lh-swiss--moved-permanently.aem.page`, later `swiss.turnsthe.page`) in its origins
and bot check, the ids, and a decision on the file drop: 5 forms take up to 5 files of 3.7 MB
each (loss of personal item: 2 MB) where lh-forms takes 3.5 MB per submission; the three claim
forms have 127 to 145 fields with repeating passenger groups.

DAM: 1,082 files. 448 in DA (51 fetched from www before the stop, the SWISS logo from the
repository, 422 images copied from the preview), 75 for the AEM sandbox (`runs/aem-files.tsv`,
`batch-N-aem.tsv`: 30 mp4 over 36 MiB including the homepage hero
`Bengaluru Header Video_8017471.mp4`, 2 PDFs over 20 MB, 43 .vtt; 6,188,388,126 bytes for the mp4s
and PDFs), 559 not fetched (`runs/dam-not-fetched.tsv`, per batch `batch-N-not-fetched.tsv`: 403
jpg, 49 svg, 25 png, 64 PDFs, 18 mp4). Images not in DA show as missing on the preview until their
copy is uploaded and the page previewed again.

What answered differently:
- The DAM downloads stopped at the 52nd request with a 403, on a one-byte GET of
  `/content/dam/lx/videos/260408-swiss-air-rail-en.mp4`, the Edge Delivery spelling of www's
  `260408 SWISS Air Rail EN.mp4` (the tool had read the name only up to its space; fixed); no
  request to www after that.
- From batch 06 on the DAM list step failed (two www PDFs, `lhg-power-of-attorney-form-en.pdf`
  and `-form--en.pdf`, share one Edge Delivery name) and the runner went on: 122 documents went
  to DA with www's image URLs, and their preview loaded those images from www.swiss.com. The
  images were then copied from our preview into DA, the documents switched and previewed again;
  the runner now stops a batch when the list fails.
- hero-card-overlay shows the hero's poster, not its video (11 pages); the video is listed for AEM.
- The fare teasers' destination squares (`/content/dam/lx/images/offers/destination/*-square.jpg`)
  and the culinary hub's script load from the site's own host: 404 on the preview until
  swiss.turnsthe.page proxies www's DAM and design paths.
- Three www.lufthansa.com links that www writes with http or without www are https and www
  after the import (same targets).
- `/ch/en/feedback` holds only www's questionnaire without a configuration: metadata only.

Pages the archives lack (linked from pilot pages): ch/en 8: prepare/baggage/checked-baggage/baggage-calculator,
customer-support/travel-and-corona/travel-briefing, customer-support/travel-and-corona/free-neighbouring-seat,
book-and-manage/digital-self-services, customer-support/travel-and-corona/travel-regulations,
customer-support/contact-us/application-for-compensation-in-the-event-of-flight-irregularities,
customer-support/help-center, customer-support/contact-us/excess-baggage-form. ch/de 13:
book-and-manage/pax-receipt/pax-receipt-request, prepare/baggage/checked-baggage/baggage-calculator,
customer-support/contact-us/excess-baggage-form, customer-support/travel-and-corona/old-travel-briefing,
customer-support/travel-and-corona/free-neighbouring-seat, customer-support/travel-and-corona/travel-briefing,
book-and-manage/digital-self-services, customer-support/travel-and-corona/travel-regulations,
customer-support/contact-us/application-for-compensation-in-the-event-of-flight-irregularities,
customer-support/help-center, customer-support/travel-and-corona/travel-planning/current-destinations,
discover/summer-timetable, local-page/montreux-jazz-festival-2023.

## Host, forms, sub-footer, hero video (brief 255, 2026-11-02)

No request to www.swiss.com in this step. Capture lists (df2e9dd6, `tools/reports/`):
`lh-swiss-dam-not-fetched.tsv` (559: www URL, DA path, first batch, kind, pages; the two www PDFs
`lhg-power-of-attorney-form-en.pdf` and `-form--en.pdf` share one DA path),
`lh-swiss-aem-files.tsv` (75: www URL, the /content/dam path the documents link, bytes from the
groundwork where it measured them), `lh-swiss-missing-pages.tsv` (21 with the pilot pages linking
them), `lh-swiss-redirects.tsv` (2).

lh-edge (24d9972a, deployed): `swiss.turnsthe.page` in `SITE_HOSTS`, origin
`main--lh-swiss--moved-permanently.aem.live`, www `www.swiss.com`, design host `www.lufthansa.com`
(the same mausy-v1.40.1 release has `fonts/swiss/`, CH Sans, byte for byte the sizes www serves,
and the culinary hub's script); `swiss` in the demo host list; entry paths as www sends them: `/`,
`/ch/en` to ch/en's homepage, `/ch`, `/ch/de` to ch/de's, `/xx/en`, `/xx/de` (and `/homepage`
below them) and the sub-sites' `/en/homepage`, `/de/homepage` to `/ch/<ll>/homepage`; favicon and
manifest from `/etc/designs/lx/`. Nine-host smoke before and after: 0 differences on every host.
The host answers from aem.live: until lh-swiss is published it shows the origin's 404.

lh-forms (1c96e03b, deployed): origins lh-swiss's aem.page, aem.live and DA hosts and
`https://swiss.turnsthe.page` (preflights 204; a look-alike 403); 23 ids `swiss-<page name>`
(17 service forms, 6 raffles), titles the pages' h1 (en, de), recipients the default one; file
rules as www's: `swiss-general-request`, `swiss-feedback-past-flight`,
`swiss-request-for-refund-of-expenses` PNG, JPEG, PDF 5 x 3,700,000; `swiss-loss-of-personal-item-form`
5 x 2,048,000; `swiss-data-protection-form` PDF, JPEG, PNG 5 x 3,000,000; 18.5 MB in all as
Austrian's; the other forms take no files. The three claim forms are as www has them: their
flights (1 to 4) and passengers (1 to 7) are groups a visitor adds (the form block's repeatable
sections, `repeat=4`, `repeat=7`). Turnstile: lh-swiss's hosts still to be added to the widget's
hostnames in the dashboard. The 41 form documents previewed again (200); preview only.

Footer (14f71525): a document with its logos before its legal links gets the logo row in the
legal row's place: SWISS logo and member of Lufthansa Group left, the legal links in the middle,
Star Alliance right from 1025 px, stacked below; every other brand's footer decorates to the
markup of before (a test per brand).

Hero (14f71525): a hero linking an .mp4 plays it muted, looped and inline over its picture (the
poster until it plays), the picture alone with prefers-reduced-motion; every other hero as
before. The ch/en and ch/de homepages link `/content/dam/lx/video/bengaluru-header-video-8017471.mp4`
(uploaded and previewed); on the preview the video answers 404 and the poster stays, on the host
lh-edge's dam-aem route serves it once it is on the AEM sandbox. The nine flight pages that show
the same video behind www's flight manager have no hero: their flight search is as before.

The 19 comparison pages and the seven brand homepages (main against the branch): equal apart from
the head's stylesheet order.

## Tabs that hold blocks, the flight search's video (brief 260, 2026-11-02)

Tabs (2b35553d, 1848ed7d, e3541b5c): `scripts/section-tabs.js` makes consecutive sections with
the section metadata `Tab` (the label; `Tabs` the set's number) one tab set, each panel a section
of its own so it holds any block. From 768px a tab list (role tablist, aria-selected,
aria-controls, a roving tabindex, arrow keys, Home and End; the panels role tabpanel, the others
hidden), below 768px an accordion (a toggle with aria-expanded over each panel, the first open);
a deep link into a panel selects its tab. The look (`styles/section-tabs.css`): www's maui tab
control, 64px tabs, the active one bold over a 4px bar on the 1px grey line under the content
width; the bar is the design system's selection colour (`--section-tabs-bar`: SWISS lx-red #c00,
Austrian os-red #d81e05 from the mausy-v1.40.1 theme files on www.lufthansa.com; else Lufthansa's
deep blue). Pages without Tab sections are untouched. The importer (`withTabMarkers`,
`splitTabSections`) makes www's tab sets that hold blocks (59 of 78; the 19 text-only ones stay
profile-tabs) into Tab sections, with www's labels on all 59 documents (`runs/r260-tabs.tsv`).

Flight search: a `Background video` row plays an mp4 over the `Background image` band (muted,
looped, inline, the image its poster; the image alone with prefers-reduced-motion). The importer
(`withFlightSearchVideo`) writes both rows from www's flight manager's promotion teaser on the 9
pages without a hero (ch/en and ch/de advanced-search, flights, partner-offers/swiss-airrail,
customer-support/faq/payment-options/cash-and-miles; ch/de local-page/black-friday), the video at
`/content/dam/lx/video/bengaluru-header-video-8017471.mp4` (the AEM sandbox; 404 on the preview,
the poster stays). The teaser's card text (title, "Book your flight") is not imported.

Documents re-imported and previewed: 68 (59 tab, 9 flight search; `runs/batch-r260.txt`) plus the
ch/en and ch/de nav and footer. Austrian: no snapshots or documents in this workspace, so its
documents are as before; its theme has the bar colour, and austrian-import.mjs can take
`withTabMarkers` and `splitTabSections` as they are.

## DAM files from the capture, form fixes, footer test (brief 262, 2026-11-02)

DAM: the archive `swiss-dam-001.tar.gz` (sha256 checked) placed its 527 files under their
`/content/dam` paths; in lh-swiss's DA under their Edge Delivery names (`scripts/dam-path.js`)
and previewed, the documents' images switched from www to them. Three needed a change:
`/content/dam/lx/icons/product-voucher.svg` (409 at preview) is a PNG of its visible layers
(`/media-da/swiss/product-voucher.png`, the two faq documents);
`/content/dam/lh/images/illustrations/LH-PETC-bag-illustration` (an asset without an extension)
is named with its rendition's (`.jpg`, `swiss-dam.mjs` assetOf); `A350_SWISS_First_21.mp4` (a
QuickTime file, 409) and the 2 too large for Edge Delivery are on the AEM list
(`lh-swiss-aem-files.tsv`, 78 files). The 30 www no longer has: 29 images without another size or
crop in the capture, dropped from their documents (`swiss-dam.mjs` withoutGoneImages: swiss-app's
18 screenshots, special-livery's St. Moritz, swiss-senses' 2024-061, swiss-business' amenity kit
and continental meal, saf and overview-flights' 436555062 crops, tsa-pre-check's formular,
the new-destinations teaser, lxmaswithyou's lxmas-2023, hold-the-booking's blurred image), and
the PDF `lhg-power-of-attorney-form-en.pdf`, its link left to www. No document shows an image
from www now. The held list's 231 pages: `lh-swiss-held-images-complete.tsv` (199 complete, 24
wait for AEM files, 8 form pages).

Success pages: a form whose confirmation page the site does not have (not in the capture) has no
success row: the form shows its success message in the page's language in its place
(`swiss-import.mjs` withOwnSuccess; the confirmation in the form's own root, successOf). For the
capture: ch/de `.../ad-plattforms/ad-plattforms-contact/confirmation`, ch/en and ch/de
`.../group-travel/group-travel-request-success`, ch/en and ch/de
`customer-support/contact-us/data-protection-form/form-success`, ch/de
`customer-support/refunds/confirmation`, ch/en
`customer-support/contact-us/technical-support/technical-support-success`, ch/en
`local-page/swiss-nati-women/confirmation` (www's form goes to ch/fr's). The loss-of-personal-item
forms go to request-for-refund-of-expenses/confirmation as on www (www has no page of their own).

Validation messages: www's ch/en raffle forms carry ch/fr's French messages (some on the wrong
field), the ch/en technical-support and general-request forms German ones; a message in another
language than the page's is SWISS's wording for its field, else the form block's own message
(`swiss-import.mjs` withPageLanguageMessages; 10 documents).

Typing before the dialogs close: what is typed stays; OneTrust's banner moves the focus into
itself when it opens (about 1.1 s on a first visit), covers the page and does not give it back
when it closes (OneTrust's behaviour, left as it is). The showcase notice opened over it at 1.8 s
and took the focus too; on SWISS it now waits while a form field has the focus
(`scripts/showcase-notice.js`; the other brands as before).

## Destination images, large heroes, the flight search's teaser text (brief 263, 2026-11-02)

Destination images: the fare teaser, slider and grid read SWISS's own folder
`/content/dam/lx/images/offers/destination` (`scripts/brands.js` destinationImages; www's fare
widgets' imageBaseUrl in the snapshots, `{code}-square.jpg` as Lufthansa's). For the capture:
`lh-swiss-destination-images.tsv`, 732 codes: the 39 the snapshots' widgets show (SWISS also uses
city codes: LON, NYC, ROM, SAO, BUH), 2 more with a stage image, the rest from lh-com's destination
image lists; www does not have every code. Until the files are in DA the images stay missing.

Large images: of the images shown full width (hero-card-overlay, hero-campaign, the flight
search's background, carousel-images, stage sections) one was copied from a rendition under
1,400 px while www offers a wider one: the Bengaluru picture
(`frontify_variations/6/c-1455672767-478966716.jpg`), 720 px, www 2560 px, the hero of both
homepages and the flight-search background of the 9 flight pages (`lh-swiss-large-images.tsv`).
Black Friday's own header (1,395 px) is www's original; booking-lookup's and the sections' small
pictures are www's 2560 rendition of small assets.

The flight search's teaser text: a `Background teaser` row (eyebrow, heading, link) shows as a card
in the band above the search, from www's flight manager's promotionTeaser (title, displayText,
link; `swiss-import.mjs` withFlightSearchTeaser) on the 9 flight pages. The snapshots carry the
teaser's data, not its rendered look (www's flight manager draws it in the browser), so the card
is SWISS's main-stage teaser card for the same teaser (light, 8 px radius, 40/48 px). Pages
without the row: the band as before.

The showcase notice waits while a form field has the focus on every brand.

## Functions scan: apps, fallbacks, offers, links, chatbot, cart, sub-footer (brief 264, 2026-11-02)

- Apps: the help center and the culinary hub load their scripts and design system from the page's
  own `/digitalhangar/` on the hosts that serve it (swiss.turnsthe.page: lh-edge answers it from
  www.swiss.com), with SWISS's release and theme as its www's app pages (mausy-v1.40.1,
  `swiss.css`); no visitor's browser asks www.swiss.com there. Preview hosts (aem.page) have no
  `/digitalhangar/` and keep www's. The culinary hub runs from our host; the help center's script
  does too, but www answers lh-edge 403 for its data files (features, texts), so it shows the
  topics fallback: `lh-swiss-digitalhangar-files.tsv` for the capture.
- lh-edge: a missing `/content/dam/lx/images/offers/*` image falls back on our own host
  (`/content/dam/lx/images/offers/fallback/generic-<suffix>.jpg`), never www.swiss.com; the
  generic square and panorama images are on the capture list (`lh-swiss-destination-images.tsv`).
- Offers (ch/en, ch/de): `destination-finder grid` with www's settings (trip duration 14, 6
  highlighted offers, their priority, the destination page). The cleanup had removed www's
  unrendered grid before its parser; `withOffersGridConfig` keeps it now.
- The flight search's group booking link and "Explore our destinations" go to our group travel and
  offers pages (11 documents; `withOwnFlightSearchLinks`).
- `/ch/<ll>/customer-support/chatbot`: two rows in `lh-swiss-redirects.tsv` to www's web chat, as
  www redirects (the site has no chat of its own).
- The cart: as on www a button that opens www's empty cart (title, text, "Explore all offers"),
  from the nav's cart sub-list (`blocks/header/header-cart.js`); other brands' cart links as before.
- The sub-footer's legal links: the arrow beside the text (the logos' block rule no longer applies
  to them), 1440 and 390.

## Destination squares, the large hero, confirmations, login pages, app scripts (brief 270, 2026-11-02)

- `swiss-dam-002` (sha256 checked): the 41 destination squares and the 2560 px Bengaluru picture in
  lh-swiss's DA under their `/content/dam` paths, previewed; the picture replaces the 720 px copy
  (same DA name), the 11 documents of `lh-swiss-large-images.tsv` previewed again (2000 px on the
  preview). The homepages' fare teaser shows its six squares on the preview; the slider and the grid
  wait for the fares API, which the preview hosts can't reach.
- `swiss-snapshots-020`: the 6 confirmation pages imported and previewed; 7 forms link them as their
  success page (the ch/de local-page group travel form too, as www). ch/de ad-plattforms-contact and
  ch/en swiss-nati-women keep the form's own message (no page of theirs: ch/en's and ch/fr's only).
- `lh-swiss.json` served: `/deeplink/cockpit`, `/{root}/login`, `/{root}/profile/travel-cockpit`,
  `bookinglist`, `account-statement`, `my-account/**`, `travel-id/**` (each 200 on
  swiss.turnsthe.page; the deep link with www's query); `swiss-nav.mjs` writes the menu's cockpit
  links as `/<root>/login`, as the menus on DA. 53 page documents still link www's cockpit, login or
  profile pages: relative on their next import.
- lh-app: SWISS's app scripts and design system load from the page's own `/digitalhangar/` on
  swiss.turnsthe.page (`ownScriptHosts`; all 14 answer 200 there), from www.swiss.com on the
  aem.page previews; the other brands as before.
- lh-edge: the help center's data files (`COPIES`) answer from our copy at
  `/digitalhangar-copies/...` when one is committed; without one www's answer as before.

## ch/fr and ch/it; the help center's data; served links (briefs 272, 276, 2026-11-02)

From the Studio's archives 006 to 009 only (sha256 as the brief; no page of www.swiss.com
loaded; DAM downloads stay stopped at the pilot's 403). DA and preview only, not published.

- `BRAND_SITES.swiss`: ch/fr and ch/it with their own documents (fr-CH, it-CH), www's dialog
  names "Suisse | Français" and "Suisse | Italiano", airports GVA and ZRH; lh-edge's entry paths
  for them as www (`/ch/<ll>`, `/xx/<ll>[/homepage]`, `/<ll>/homepage`).
- Scope: ch/fr 302 documents, ch/it 275 (the archives' extra lists p11, x11, p15, x15 as batches:
  `swiss-plan.mjs` IMPORTED_ROOTS). Batches 11 to 14, p11, x11, c11 (ch/fr: 301 pages, nav and
  footer) and 15 to 18, p15, x15 (ch/it: 275 pages, nav and footer), every page preview 200.
- Nav and footer 1:1 from the homepages (3 items, 9 columns, 51 links; cart dialog in the
  language; "Mes vols" / "I miei voli" the cockpit deep link, made relative: the login and profile
  pages are ch/en's and ch/de's only, `lh-swiss.json` served by name).
- Flight search: Genève (GVA) on ch/fr, Zurigo (ZRH) on ch/it.
- Forms: 38 (ch/fr 21, ch/it 17), `swiss-` ids (two new: the ch/fr raffles
  swiss-match-de-preparation-pour-les-championnats-europeens-2025, swiss-swiss-ice-hockey-games-2025);
  21 link their own confirmation page; 9 keep the form's message (their confirmation is not in the
  capture). www's technical support, general request and accessible travel forms carry German
  messages on every language: SWISS's French and Italian wording per field.
- For the capture: `lh-swiss-fr-it-capture.tsv` (69 DAM files, 19 pages without a snapshot, 9
  confirmation pages); 8 more AEM files in `lh-swiss-aem-files.tsv`; 1 redirect row.
- Help center: `digitalhangar-copies/` holds features, en and de (capture swiss-dam-003); it runs on
  swiss.turnsthe.page in German with every topic; in English its topics wait for
  `topics_en.json` (www refuses it to lh-edge; the copy step takes topics/ too).
- Served links: 49 documents' links to www's cockpit, login and profile pages relative; 4 keep
  www's `/ch/<ll>/profile/profile-login` (404 on our host).

## ch/es and ch/pt behind the language switch (brief 279, 2026-11-02)

From the Studio's archives 011, 012 (Spanish) and 016, 017 (Portuguese) only (sha256 as the
brief; no request to www.swiss.com; DAM downloads stay stopped at the pilot's 403). DA and
preview only, not published.

- The switch: `scripts/brands.js` SWISS_LANGUAGES (es: ch/es "Suiza | Español", pt: ch/pt
  "Suiça | Português" as the homepages' footer line writes it; both Zurich) and
  SWISS_LANGUAGES_LIVE (empty). Off, a language is a pilot (`BRAND_SITES.swiss.pilots`): its pages
  render with their own row (lang, nav and footer, name, airport: `scripts/locale.js` withPilots),
  while the rows and versions, the country dialog, the links to its homepage (www) and lh-edge's
  entries and routes stay as before. To go live after publishing: add `'es'` (and/or `'pt'`) to
  SWISS_LANGUAGES_LIVE; the root then joins as ch/fr and ch/it did (rows, versions, the `xx` and
  language-only entry paths), and its market roots with SWISS_MARKETS_LIVE.
- Scope: ch/es 272 documents, ch/pt 270; batches 19 to 22, p19, x19 (ch/es) and 27 to 30, p27, x27
  (ch/pt), every page and both roots' nav and footer preview 200 (546 documents).
- Nav and footer 1:1 from the homepages (3 items, 9 columns, 51 links; "Mis vuelos" / "Os meus
  voos" the cockpit deep link, relative).
- Flight search: "Zurich (ZRH)" on ch/es (www's field says Zurich), "Zurique (ZRH)" on ch/pt.
- Forms: 32 (16 per root, all ids lh-forms knows; no raffles); 16 link their own confirmation
  page; 8 keep the form's message (their confirmation is not in the capture). www's German (and
  two English) messages on the technical support, general request and accessible travel forms:
  SWISS's Spanish and Portuguese wording per field (6 documents).
- For the capture: `lh-swiss-es-pt-capture.tsv` (31 DAM files, 14 pages without a snapshot, 8
  confirmation pages); no new AEM files (the 35 the pages use are in `lh-swiss-aem-files.tsv`); no
  new redirect rows.

## ch/zh and ch/ja behind the language switch; two raffles, the bare cockpit links (brief 28x, 2026-11-03)

From the Studio's archives 014, 015 (Chinese) and 021, 022 (Japanese) only (sha256 as the brief; no
request to www.swiss.com). DA and preview only, not published. ch/es and ch/pt went live with the
switch on (838dedba).

- The switch: `SWISS_LANGUAGES` with zh (ch/zh "瑞士 (Switzerland) | 简体中文") and ja (ch/ja
  "Switzerland | 日本語"), both Zurich; off (pilots), so swiss.turnsthe.page answers as before
  (`/ch/zh`, `/xx/ja`, `/ja/homepage` ... 404). The switch tests read `SWISS_LANGUAGES_LIVE`: to go
  live, add `'zh'` and/or `'ja'` there; `test/brand-swiss.test.mjs`,
  `test/swiss-markets-switch.test.mjs` and lh-edge's `sites-swiss.test.mjs` name ch's roots and
  need them added.
- Scope: ch/zh 270 documents, ch/ja 268; batches 23 to 26, p23, x23 (ch/zh) and 35 to 38, p35, x35
  (ch/ja), every page and both roots' nav and footer preview 200 (542 documents).
- Nav and footer 1:1 from the homepages ("我的航班" / "私のフライト" the cockpit deep link); ch/zh's
  X icon has an empty alt on www: its title "Twitter" names it (`swiss-nav.mjs`).
- Flight search: "苏黎世 (ZRH)" on ch/zh, "チューリッヒ (ZRH)" on ch/ja, as the homepages' field.
- Fonts: www's zh and ja pages load the same stylesheets as ch/de (mausy's swiss.css, lx-fonts.css:
  CH Sans with Arial and Helvetica after it) and no CJK font: the browser's system fonts set the
  Chinese and Japanese characters. The theme does the same; nothing added.
- Forms: 32 (16 per root, all ids lh-forms knows); 20 link their own confirmation page; 12 keep
  the form's message (confirmation not in the capture). www's German and English messages:
  SWISS's Chinese and Japanese wording per field (5 documents); kana marks a Japanese message,
  请/您 a Chinese one.
- For the capture: `lh-swiss-zh-ja-capture.tsv` (30 DAM files, 14 pages without a snapshot, 12
  confirmation pages); no new AEM files or redirect rows.
- lh-forms: ch/fr's raffles `swiss-swiss-ice-hockey-games-2025` and
  `swiss-match-de-preparation-pour-les-championnats-europeens-2025` known (their pages' h1; the
  hockey page's says 2024), deployed.
- Cockpit links without a query (`/ch/<ll>/book-and-manage/overview-manage`, two each, en de fr it
  es pt) carry `?country=CH&language=<LL>` (`swiss-import.mjs` withCockpitQuery); no other
  document had one.

## ch/el and ch/ru behind the language switch; the images lost to DA names (brief 283, 2026-11-03)

From the Studio's archives 018, 019 (Greek), 023, 024 (Russian) and 041 only (sha256 as the brief;
no request to www.swiss.com). DA and preview only, not published.

- Images dropped by DA names: swiss-dam-001 had asked www for 21 files under their DA-normalised
  names (404: www serves its files only under its own names, "01-Check-in EN(1440x720).png",
  "..._Amenity_Kit_Inbound_3-(1).jpg", "LX image (3_1) BLURRED.jpg"); the file list kept those names
  because the snapshot scan stopped at ")", so the switch counted the images as gone and left them
  out. `swiss-dam.mjs` ownNames reads names with parentheses; the 21 records are marked
  `www-404-da-name` in the DAM state; all 21 files are in lh-swiss's DA. 28 documents imported again
  with them (swiss-app, swiss-business and hold-the-booking on the eight roots, four refund and
  feedback forms), uploaded and previewed: the swiss-app screenshots, the amenity kit and the
  others show (every image of the two ch/es pages answers 200 on preview).
- Capture lists name www's own URL (the DA path next to it); the earlier lists and
  `lh-swiss-aem-files.tsv` already did (checked against the snapshots); only the pilot's DAM
  state had DA names.
- swiss-snapshots-041: the four ch/es and ch/pt confirmation pages (group travel request, data
  protection form), imported; their forms link them (4 documents).
- The switch: `SWISS_LANGUAGES` with el (ch/el "Ελβετία | Ελληνικά") and ru (ch/ru "Switzerland |
  Русский"), both Zurich; off (pilots): swiss.turnsthe.page answers as before (`/ch/el`, `/xx/ru`,
  `/ru/homepage` ... 404). To go live: `'el'`/`'ru'` in `SWISS_LANGUAGES_LIVE`;
  `test/brand-swiss.test.mjs` and lh-edge's `sites-swiss.test.mjs` use ru as "a language SWISS has
  no root for" and name ch's roots.
- Scope: ch/el 269 documents, ch/ru 271; batches 31 to 34, p31, x31 (ch/el) and 39 to 42, p39, x39
  (ch/ru), every page and both roots' nav and footer preview 200 (544 documents).
- Nav and footer 1:1 from the homepages ("Οι πτήσεις μου" / "Мои рейсы" the cockpit deep link).
- Flight search: "Ζυρίχη (ZRH)" on ch/el, "Цюрих (ZRH)" on ch/ru, as the homepages' field.
- Fonts: www's el and ru pages load the same stylesheets as ch/de (mausy's swiss.css, lx-fonts.css:
  CH Sans with Arial and Helvetica after it), no Greek or Cyrillic face of their own; the theme
  does the same, nothing added.
- Forms: 32 (16 per root, all ids lh-forms knows); 20 link their own confirmation page; 12 keep
  the form's message. www's German and English messages: SWISS's Greek and Russian wording per
  field (Greek and Cyrillic letters mark the language). "Wählen Sie ..." is German too: the
  technical support form's "Wählen Sie die Zeit des Vorfalls" also left the en, es, fr, it, ja, pt
  and zh documents (7 documents, uploaded and previewed).
- For the capture: `lh-swiss-el-ru-capture.tsv` (32 DAM files, 14 pages without a snapshot, 12
  confirmation pages), www's own URLs; no new AEM files or redirect rows.
