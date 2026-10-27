# ch pilot under choice B: market route, `markets`, sitemaps, checks, sweep

2026-10-27. Nothing published. ch/en and ch/de stay `pilot` in the locale table.

## The route (lh-edge `src/markets.js`, README "Market roots")

- A root with `documents: language` in the locale table (`tools/markets/locale-data.json`: ch/en,
  ch/de; the four roots `own`) is answered for `/<cc>/<ll>/<path>`:
  1. from its own document, when the origin answers anything but 404 (pages, redirect rows);
  2. else from its language version's (de/en, de/de):
     - only when the language index has the page and `markets` allows the country;
     - the page's own `<meta name="markets">` counts too, since the index only takes it on publish;
     - what the index leaves out on purpose (nav, footer, fragments, form confirmations,
       `support/search`, `articles/config`) comes without that check;
  3. else the language version's redirect, moved into the market root;
  4. else the origin's 404.
- In the HTML:
  - links into the language version become the market root's where the market serves the target;
  - www links into it (pages that were not migrated) go to www's market root;
  - canonical and og:url name the market URL;
  - hreflang lists the page in de/en, de/de, ch/en and ch/de (translated slugs paired by
    `primary-language-url`);
  - nav and footer are the market root's.
- JSON (`search-index.json`, `articles/query-index.json`): the language rows the market serves,
  paths rewritten; the search index also gets the root's own pages (index `market-pages`).
- Cache: through `originFetch`, so EDGE_TTL applies and the origin's `cache-tag` (the language
  page's) is kept.
- Pilot rows only on `PILOT_HOSTS` (lhedge.bbird.live). lhcom.bbird.live sends
  `X-LH-Public-Host: lhcom.bbird.live` and is unchanged.
- Entry redirects on lhedge: `/ch` goes to `/ch/de/homepage` (Accept-Language `en`:
  `/ch/en/homepage`); `/ch/en` and `/ch/de` go to their homepages.
- Commits: 0c8bd11, 2b575b1, and the www-link rule with this report.

## `markets`

- A page metadata field on the language versions:
  - an include list `de, at` or an exclude list `-ch, -us`;
  - empty means every market of the language;
  - documented in `AUTHORING.md`.
- `helix-query.yaml`:
  - search-de-en and search-de-de get a `markets` column (extended, not replaced);
  - new index `market-pages`: the own documents of market roots.
- Seed (`tools/markets/seed-markets.mjs`, from www's sitemap dataset):
  - www lists almost every migrated page in 90+ of the 96 market roots of its language, so the
    seed set `markets` on only **2 pages**: `/de/en/event/dghm-2026` and `/de/de/event/dghm-2026`
    (value `de`; no other market has them);
  - 13 de/en and 15 de/de pages are unknown to the dataset (forms, refunds, help, which www keeps
    out of its sitemaps) and were left alone;
  - written as: labelled DA version, local document, upload and preview, then a read-back with
    the row and no lost block. Preview only.
- The language indexes and `market-pages` are filled on **publish** (the admin index API reads
  the published page). Until then the route reads `markets` from the page itself, and the ch
  sitemaps and search index lack the ch own pages.

## Sitemaps

- `/sitemap/sitemap_lh_ch_en.xml` (964 URLs) and `/sitemap/sitemap_lh_ch_de.xml` (967 URLs),
  plus `.xml.gz` of each:
  - the language pages the root serves, without `page-robots` noindex;
  - `lastmod` and alternates as in `helix-sitemap.yaml`;
  - URLs on www.lufthansa.com.
- `/sitemap/sitemap_lh.xml(.gz)` on lhedge: the static index with the two ch sitemaps added.
- On lhcom (and wherever no market root is served): the static files, unchanged. Robots and
  noindex are unchanged.

## Checks

**Against the preview origin** (wrangler dev, `ORIGIN` = main--lh-com--moved-permanently.aem.page;
`tools/markets/check-market-route.mjs`, result `ch-route-check.json`):

| | www URLs | 200 | 301 | 404 |
| --- | --- | --- | --- | --- |
| ch/en | 1,058 | 962 | 0 | 96 |
| ch/de | 1,054 | 958 | 1 | 95 |

- Every 200 has the ch URL as canonical.
- The 404s match the replica's language versions:
  - 83 per root are pages the replica has in neither de/en nor de/de (not migrated: aircraft-code
    pages such as `/ch/en/319`, older articles and tags, stopover partners, `configuration/…`,
    `raffle-team-yes`; the same paths 404 on lhcom's de/en today);
  - 13 and 12 are the login and profile pages (left alone).
- The 301 is `/ch/de/support/support`, the redirect row of `/de/de/support/support`, moved to ch.
- Content: all 39 ch captures (19 ch/en, 20 ch/de, from today) answer 200 with the ch canonical.
  35 have the same H1 as www. The other 4 also differ on de/en and de/de, so they are not caused
  by the route:
  - the 2 homepages: www's H1 is the logo;
  - `flights` and `fluege`: the first heading of the imported document.
- Heading share: the share of www's headings in our answer is the same for each ch page as for
  its de page (the replica's de/en or de/de page against the capture it was imported from), e.g.
  baggage 26 % = 26 %. There were only 19 and 20 ch captures, not 115.
- Links: every root-relative link of the ch homepages, navs and footers answers 200 (homepages
  8 + 8, navs 60 + 60, footers 17 + 17).
  - Before the fix, 4 were 404. My pilot documents had relative links to two pages the replica
    doesn't have (`payment-options`, `offers-and-destination`); they are now on www as on de/en.
  - The ch/de nav and footer linked `/ch/de/flights` instead of `/ch/de/fluege`.
  - `root-docs.mjs` is fixed; the 6 documents were re-uploaded and previewed.

**On lhedge.bbird.live after each deploy** (`tools/workers/lh-edge/smoke.mjs`, 48 answers; the
baseline was taken twice, with no noise):

- 43 are byte-identical: the four roots' pages, nav, footer and 404, app screens, GraphQL feeds,
  DAM, llms, search, service worker.
- The 5 intended changes: `/ch`, `/ch/en`, `/ch/de` go to the local homepages, and
  `sitemap_lh.xml(.gz)` lists the ch sitemaps.
- On lhcom.bbird.live: 48 of 48 unchanged.

## Sweep (`tools/markets/sweep-ch.mjs`, `ch-sweep.md`)

- 20 pages over 10 page types (www has no ch page of the mfe type), in ch/en and ch/de: 40 pages.
- Each ch page was compared with www's de/en or de/de page:
  - 1 de/de reference is from today; the Bright Data session was blocked twice (403), so the
    captures stopped there;
  - the other references are the 21/22 Oct captures the language documents come from.
- 13 rows differ:
  - homepages (2): already ch documents;
  - `accessible-travel` (2): masking only (`dlh.de` reads as the country code);
  - `additional-services`, `100-years`, `320`, `32n` (8) and ch/de `stopover` (1): nothing that
    only ch has; ch lacks one to five lead texts the 21/22 Oct de pages have. Whether www's de
    pages still have them today is open (the session was blocked). No ch documents were made.
- From the earlier sample with today's de/de capture: **`/ch/de/fluege`** has an
  "Einreisebestimmungen" teaser where de/de has "Parken am Terminal" (a German parking offer).
  ch/en flights has the same teaser as de/en.
  - New ch document `/ch/de/fluege`: de/de's document with ch links and the teaser swapped. A
    fresh import would have lost de/de's later fixes (labels, disclaimer).
  - Uploaded and previewed; added to `tools/importer/sites/lh-com.json`.

## Before the publish

Publishing the 16 ch documents and the 2 seeded pages fills `market-pages` and the `markets`
column. Until then, lhedge (live origin) answers `/ch/<ll>/homepage` and the navs from de/en and
de/de, and the ch own pages answer 404 there.

## Left out

- The 83 + 83 pages not migrated in either language version (as for de/en and de/de).
- hreflang to at/de and gb/en (they have their own indexes; not read by the route).
- Routes before the market route keep their answers for ch paths: `.solo` pages, `.sdui`, OWA
  JSON, `.mfe.html`, `.csi-offline.json`.
- `/ch/llms.txt`.
- The remaining same-day de captures (blocked).
- ch/fr and ch/it (no language version yet).
