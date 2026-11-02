# lh-swiss: SWISS's sub-sites (corporate, medical services)

2026-11-02. From the capture's swiss-snapshots-025 (corporate, 150 pages), -026 (1 page) and -027
(medical services, 92 pages), sha256 as given and each file's against the manifest; no request to
www.swiss.com. On lh-swiss under www's paths: `/corporate/<ll>/` (en, de, fr) and
`/medicalservices/<ll>/` (en, de). The main site's ch/en and ch/de (ema-cashub's) are untouched.
Uploaded to DA and previewed (253 documents: 243 pages, 10 nav and footer), not published.

## The look where www's differs from the main site's

- `scripts/site-languages.js` SUB_SITES: each sub-site's path, languages and header style.
  `getLocale` gives a sub-site page the language of its path (it took ch/en before: English labels,
  ch/en's nav), the sub-site's language as its base (`/corporate/de/nav`, `/corporate/de/footer`),
  its languages for the header's switch (the same slugs in each language).
- Header: the menu in the bar (Company, Media, Careers; Health, Travel, Occupation, Aviation), as
  www's sub-site header, with lh-b2b's bar menu in SWISS's square corners and light grey (www's
  header styles are not in the capture); "Book flight" to the main site; the language list in the
  bar (`blocks/header/header-languages.js`: www's "EN" with the globe, the other languages, the
  page's counterpart once probed); a search button on corporate only (www's medical search has no
  results page); the logo to the main site's homepage (www's `/<ll>/homepage`; fr: www's).
- Footer: the main site's footer document shape with the sub-sites' columns (swiss.com, SWISS group,
  Lufthansa group, Newsletter), the social row, the logo row with Star Alliance, the legal links.

## Pages

lh-com's info import with swiss-import.mjs's page steps, and the sub-sites' own
(`tools/importer/swiss-sub-import.mjs`): www's chrome out; the forms' date picker out; one h1 a page
(www's teaser headings are h1: h3); the success rows from the forms' `:redirect`; www's broken
`/medicalservices/null/<ll>.html` image links unwrapped; links between the sub-sites' captured pages
and to the main site's pages relative; DAM links site-relative; images from their place in DA.
Blocks: carousel-cards grids, columns-media (and sidebar), table-striped, accordion-columns,
embed (YouTube, Google Maps), Tab sections (33 corporate pages), form, search-results.

## Forms (lh-forms, deployed; preview only until your test)

`swiss-media-permission` (en de fr; five PDF or JPEG files, 3,700,000 bytes each),
`swiss-media-request-form` (en de fr), `swiss-contact-corporate-procurement` (en): the default
recipients, the subject in the page's language. Their success pages are imported (media request en
de fr, procurement en); the permission form goes to the media request's success page, as on www.

## Search

`helix-query.yaml` search-corporate-en, -de, -fr (`/corporate/<ll>/search-index.json`): they fill on
publish; until then the search page finds nothing.

## For the capture

- `tools/reports/lh-swiss-sub-dam.tsv`: 256 files lh-swiss's DA lacks (216 jpg, 32 PDFs, 5 mp4, 2
  svg, 1 png); the images show once their copies are in DA and the pages are previewed again. PDFs and
  videos go to the AEM publish tier if they are over Edge Delivery's limits (mp4 36 MiB, PDF 20 MB),
  which only their sizes tell. 27 files are in DA already (the main site's copies).
- `tools/reports/lh-swiss-sub-missing-pages.tsv`: 7 linked pages the capture lacks (the corporate
  menu's Partner & alliances and codeshare partners, en de fr; medical en's SAF/MEDIF page).

## Redirect rows for you

`tools/reports/lh-swiss-sub-redirects.tsv`: `/corporate`, `/corporate/<ll>`, `/medicalservices`,
`/medicalservices/<ll>` to their homepages (7 rows).
