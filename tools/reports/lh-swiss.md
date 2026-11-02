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

