# lh-swiss: SWISS's market versions

2026-11-02. From the capture's swiss-snapshots-030 (104 pages only the market versions have),
-031 (150 market homepages) and -032 (66), sha256 as given and each file against its manifest; no
request to www.swiss.com. ema-cashub keeps ch/<ll> (the language versions), the shared SWISS
importer steps and es, zh, pt, el, ja, ru; the market roots are built on top of ch/en, ch/de,
ch/fr and ch/it.

## Roots and the switch

- 216 roots in the capture: 51 countries in each of en, de, fr, it (204, built), and 12 in languages
  lh-swiss has not yet (`lh-swiss-markets-held.tsv`: es 4, zh 3, pt 2, el, ja, ru, with their 20 own
  pages; not imported until ema-cashub has the language).
- The 204 are the roots ch/<ll>'s documents already name in their `markets` rows (ch/en's 51 English
  roots: the same set).
- `scripts/brands.js` SWISS_MARKETS: per root www's selector label (as www writes it, e.g. at/en
  "Österreich | English") and its homepage's flight search origin (none on the ca roots: the hub).
- `SWISS_MARKETS_LIVE` (false): off, SWISS's table is ch's four roots exactly as before:
  swiss.turnsthe.page answers as today and the country dialog sends the other countries to
  www.swiss.com. To turn it on once the documents are published: set it to `true` (one line;
  lh-edge deploys with it), and the dialog lists them and lh-edge serves them. Roots of a language
  lh-swiss lacks never join.

## The language versions' index (lh-edge)

The market route reads the language versions' index, which lh-swiss did not have. A
`search-ch-<ll>` index would also give lh-com's origin a `/ch/<ll>/search-index.json` (helix-query.yaml
serves every site; lh-com's ch/en and ch/de are market roots whose index lh-edge builds), so SWISS's
are `/ch/<ll>/language-index.json` (`language-ch-<ll>`, the ten ch languages), read for
`/<version>/search-index.json` on SWISS's hosts (`SITE_INDEX_PATHS`). They fill on publish or an
index job: the published ch documents need one of the two before the switch is turned on.
SWISS lists hreflang alternates as Austrian and Brussels (`ALTERNATES_SITES`), once it has market roots.

## Documents (DA lh-swiss, previewed, not published)

- Per root its homepage and own pages (288: 204 homepages, 84 own pages), with lh-com's homepage
  and info imports and swiss-import.mjs's page steps (`tools/importer/swiss-market-import.mjs`).
- Its own steps: the flight search's default origin from the root's own fare teaser ("Frankfurt
  (FRA)"; a fare teaser drawn in the browser: its configured code "FRA"; never www's origin field,
  which held the capture session's airport, nor the destination finder's parsed first airport,
  which it replaces too); one h1 a page; links to the root's pages relative (its own documents and
  ch/<ll>'s pages its markets lists, an empty markets row every root of the language), the rest on
  www; images from their place in DA.
- Per root its nav and footer (408 documents) from its own homepage (swiss-nav.mjs's builders,
  `tools/importer/swiss-market-nav.mjs`): its menu, quick actions and footer, with the same links.
- `/us/en/local-pages/baggage-&-other-fees` is the document `baggage-and-other-fees`
  (`lh-swiss-markets-redirects.tsv`).

## Lists for you

- `lh-swiss-markets-dam.tsv`: 107 files lh-swiss's DA lacks (92 jpg, 6 svg, 4 PDFs, 3 png, 1 jpeg,
  1 mp4: AEM if over 36 MiB); 41 are in DA already.
- `lh-swiss-markets-missing-pages.tsv`: 482 linked pages of the market roots the site will not serve
  (ch has no document of them, or its markets leaves the root out): mostly
  customer-support/travel-and-corona/travel-briefing (204 roots) and profile/travel-id (200).
- `lh-swiss-markets-redirects.tsv`: 1 row. The roots' entry paths (`/<cc>/<ll>`, `/<cc>`) come with
  the switch (lh-edge's SITE_ENTRIES from the rows).
- `lh-swiss-markets-held.tsv`: the 12 held roots.

## 2026-11-03: held pages, es and pt, the "&" address, forms

- The seven held pages imported again with the rule for images www answers 404
  (`tools/importer/swiss-sub-dam.mjs` GONE_IMAGES: the six files still missing in lh-swiss's DA
  after the capture's upload): al/fr aig-travel-insurance (the AIG logo), al/fr and al/it
  prepare-lxmas-2024 (the fondue teaser), br/en homepage (the BTG terminal picture), dk/en
  ski-campaign-2025 and gb/en ski-campaign (the winter stage picture), gb/en swiss-summit-lounge
  (the newsletter header). Each lost that one picture and nothing else; uploaded and previewed.
- es and pt: ar/es, br/es, es/es, us/es, br/pt, pt/pt (6 homepages, 11 own pages, their nav and
  footer: 29 documents) uploaded and previewed. Their rows are in `scripts/brands.js`
  SWISS_MARKETS behind `SWISS_MARKET_LANGUAGES_LIVE` (en, de, fr, it): add 'es' and 'pt' once the
  documents are published. es/es and pt/pt `feedback` are www's questionnaire widget only, empty
  here as al/it's. br/pt terminal-btg without the BTG picture (the same 404). Their 6 new files
  for the capture: `tools/reports/lh-swiss-markets-es-pt-dam.tsv`.
- `/us/en/local-pages/baggage-&-other-fees` (and `%26`): a 301 on swiss.turnsthe.page to
  `/us/en/local-pages/baggage-and-other-fees` (lh-edge, src/url-forms.js ampersandTarget); the
  redirect row in `lh-swiss-markets-redirects.tsv` is not needed.
- lh-forms: swiss-pax-receipt-request, swiss-refundable-travel-credit,
  swiss-invoice-request-hungary, swiss-klook added (deployed); their five pages unchanged.

## 2026-11-03: zh and ja market roots; Korea (kr/ko)

- cn/zh, hk/zh, sg/zh, jp/ja: 4 homepages and 7 own pages with their nav and footer (19
  documents) uploaded and previewed. Their rows are in `scripts/brands.js` SWISS_MARKETS behind
  `SWISS_MARKET_LANGUAGES_LIVE`: add 'zh' and 'ja' once published. 2 new files for the capture:
  `tools/reports/lh-swiss-markets-zh-ja-dam.tsv`.
- kr/ko (swiss-snapshots-028 and -029, 278 pages, sha256 as given and each file against its
  manifest): all its pages as its own documents (ko is no SWISS language version), with its nav
  and footer: 280 documents uploaded, 279 previewed. Behind `SWISS_OWN_ROOTS_LIVE` ([]): until
  'kr/ko' is listed it is a pilot (its pages render with their own row on preview; the country
  dialog and lh-edge as before); then it joins next to kr/en as "대한민국 | 한국어".
  - flight search: Seoul (SEL) as the homepage's origin, as www's.
  - forms: 18 pages; 17 on SWISS's known ids, swiss-hyundai26-application added to lh-forms
    (deployed); www's own Korean field messages.
  - labels: Korean in every built-in label table (header, footer, form, flight search, passenger
    picker and the other blocks), www's own wording where it has one.
  - fonts: as www, SWISS's own (CH Sans via the design system) with the browser's fallback for
    Hangul; www loads no Korean web font.
  - `/kr/ko/customer-support/faq`: uploaded, its preview refused (409 from the content bus):
    its icon `product-voucher.svg` is not in DA yet (on the list); preview it again once it is.
  - `tools/reports/lh-swiss-kr-ko-dam.tsv`: 30 files for the capture under www's own names (11
    jpg, 1 svg, 16 mp4 and 2 PDFs for the AEM tier if over the limits); 781 of its files are in
    DA already (ch's).
  - `tools/reports/lh-swiss-kr-ko-missing-pages.tsv`: 14 linked pages the capture lacks (among
    them the login page, which lh-swiss serves for ch only); no redirect rows needed.

## 2026-11-03: the market index gap; links to pages we serve

- lh-edge (8b8416b3, deployed): SWISS's market roots under the paths the shared market-pages index
  leaves out (de/en, de/de, at/de, gb/en, it/en, it/it, fr/fr, es/es, br/pt, cn/zh, jp/ja) get
  their own pages from their own `search-<cc>-<ll>` index, merged into SWISS's
  `/market-pages.json` read; their search index is built as the other market roots' (de/en: 326
  rows, was 3; es/es 270, was 5; br/pt 270). ITA's and the other sites' indexes as they are;
  `helix-query.yaml` unchanged. SWISS has no sitemaps on its host (`/sitemap.xml` 404, none in
  robots.txt): nothing to add there.
- Relinked and uploaded, previewed (`tools/reports/lh-swiss-markets-relinked.tsv`, 487
  documents, 486 previewed): 477 links to www's `/deeplink/cockpit` in 228 documents (every
  market nav, kr/ko's pages) now on our host with their `country` and `language`; 876 links in
  130 documents to pages the site serves relative (the es, pt, zh, ja and kr/ko roots' navs,
  footers and pages, whose ch pages were not yet in `runs/markets.json`); br/pt's footer PDF
  (condições gerais) from DA; the Parent metadata of 139 documents as a plain path (kr/en
  klook's breadcrumb). The navs' magazine link as it was. `/kr/ko/customer-support/faq` still
  waits for its icon `product-voucher.svg` in DA (preview 409).
