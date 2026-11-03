# lh-swiss: SWISS's magazine (/magazine/de, /magazine/en)

2026-11-03. From the capture's swiss-snapshots-033 to 036 (600 pages) and 038 to 040 (360 pages,
English), sha256 as given and each file's against its manifest; no request to www.swiss.com. On
lh-swiss under www's paths: `/magazine/de/...` and `/magazine/en/...`. Uploaded to DA and previewed
(955 pages, 4 nav and footer documents), not published. Not imported
(`tools/reports/lh-swiss-mag-not-imported.tsv`): the capture's four `/ch/` pages (ema-cashub's) and
en's `rethinking-old-seat-covers`, which www leaves empty.

| | de | en |
| --- | --- | --- |
| articles | 463 | 462 |
| overview pages (front, sections, categories) | 13 | 13 |
| other pages (contact, print) | 2 | 2 |

## The look where www's differs from the main site's

- `scripts/site-languages.js` SUB_SITES: the magazine as the third sub-site (de "German", en
  "English", www's names), its front page `/magazine/<ll>` (a page itself, not `/homepage`).
- Header (nav document per language, `tools/importer/swiss-magazine-nav.mjs`): the "Swiss
  Magazine" logo to the front page, www's top links in the bar (Inside SWISS, Reisen / Travel,
  Schweiz / Switzerland), the language list in the bar, the menu (www's off-canvas menu): each
  section with its categories, then Kontakt, Flug buchen, Print. www's "Download Stories" (offline
  reading) is not built.
- Footer: the social row (seven, lh-swiss's icons), the SWISS logo and Star Alliance, the legal row
  (Lufthansa Group, Sitemap, Rechtliches, Datenschutz, Flüge, privacy settings), "© Swiss
  International Air Lines".

## Pages (lh-com's blocks)

- Article: article-header (hero picture, tags, h1, lead), the body as text with pictures and their
  captions (www's © line kept), quote, carousel-images, embed (190 YouTube videos, 10 Google Maps),
  buttons as links, www's credits as the closing lines, "Weitere Beiträge" / "More stories" as
  related-articles (by shared tags, then the category, from the magazine's index). Metadata: tags,
  category, publication date (717 of 925 articles, en's two-digit years read too; www names none
  for 208), author (790), card image, the lead as description. Links between the magazine's pages
  relative where both are imported (the earlier documents relinked after 038 to 040).
- Overview pages: the featured story as the page's h1 (hero-card-overlay), the top stories
  (carousel-cards, www's curated picks), each teaser row a blog-overview list over the magazine's
  index: a section's or category's newest five on the front and section pages; a category page all
  of its articles with "Load more".
- `helix-query.yaml` magazine-de and magazine-en (`/magazine/<ll>/query-index.json`). **The
  overview lists and the related stories stay empty until the pages are published** (the index
  fills on publish); articles without a date come last in the lists.

## Checked

Renders on the branch at 1440 and 390 (no horizontal overflow; nav, footer, blocks loaded).
lufthansa.com's 19 comparison pages and the brand homepages equal (stylesheet order and rotation
state only). Ten-host smoke and swiss.turnsthe.page around the lh-edge deploy (764c2ce0): 0
differences. swiss.turnsthe.page answers the magazine once it is published (live tier).
038 to 040: an English article renders as the German ones (nav, footer, blocks).

## For the capture

- `tools/reports/lh-swiss-mag-dam.tsv`: 4,650 files lh-swiss's DA lacks (3,567 jpg, 868 jpeg,
  212 png, 3 PDFs; each image's original asset, not www's renditions); 14 are in DA already.
  `tools/reports/lh-swiss-mag-dam-new.tsv`: the 68 of them that 038 to 040 add (the English
  articles mostly show the German ones' pictures). **Until
  they are in DA the magazine's pages show no pictures**; they show once the copies are uploaded and
  the pages previewed again. PDFs go to the AEM publish tier if they are over Edge Delivery's limit
  (20 MB). No videos (all are YouTube).
- `tools/reports/lh-swiss-mag-missing-pages.tsv`: 4 linked pages the capture lacks (3 English
  articles, 1 German); the links point to www.
- www's tag pages (`/magazine/<ll>/tags?tag=…`) are not in the capture; the tags show on the
  articles without a link.

## Redirect rows for you

`tools/reports/lh-swiss-mag-redirects.tsv`: `/magazine` to `/magazine/de` and 300 articles whose
www path has leading, trailing or double hyphens or underscores (`-777-gins-…-` to `777-gins-…`);
`tools/reports/lh-swiss-mag-redirects-new.tsv`: the 102 of them 038 to 040 add.
