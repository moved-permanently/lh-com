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
