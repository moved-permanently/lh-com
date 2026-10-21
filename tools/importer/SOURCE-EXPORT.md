# Source export from www.lufthansa.com

Cloudflare blocks the migration agent's browser on www.lufthansa.com, so the live pages come
either through open access (an allowlisted IP or bypass rule; nothing below is needed then) or
as an export from a browser that gets through. This file describes the export.

`node tools/importer/build-export-manifest.js` regenerates the lists from the migration scope:

- `export-urls.txt`: 2,407 URLs (1,176 AEM pages + 35 AirCore de/en pages, their `.model.json`,
  16 sitemaps, 4 nav roots).
- `export-manifest.json`: the same URLs with their template group and locale, plus the 8 HAR
  captures described below.

## Layout

Put everything in `tools/source-export/` (served by nothing: it is in `.hlxignore`):

```
tools/source-export/
  pages/de/en/homepage.html              page HTML, mirroring the live path
  pages/de/en/homepage.model.json        AEM component tree
  pages/de/en/configuration/commonheader/...   nav pages (HTML and .model.json)
  sitemaps/sitemap_lh_de_en.xml.gz       sitemaps under their original file names
  sitemaps/de_dest_en_sitemap.xml
  har/de-en/homepage.har                 HAR captures, one folder per locale
  shots/de/en/homepage/1440.png          screenshots (only without open access)
  bundles/export-0000.ndjson             output of export-in-browser.js (optional)
```

## Ways to produce it

1. **Console exporter (pages, model.json, sitemaps).** Open any www.lufthansa.com page in a
   browser that gets through, answer the cookie dialog, paste `export-in-browser.js` into the
   DevTools console, click the button, and choose `export-urls.txt`. It fetches one URL every
   2.5 s (about 1 h 40 min in total), downloads `export-NNNN.ndjson` every 100 responses,
   resumes after a reload and stops at the first block. Put the downloads in `bundles/` and run
   `node tools/importer/serve-export.mjs --unpack`.
2. **HAR captures (live data).** For each locale's homepage and flight search page (8 in
   total, listed in `export-manifest.json`), record a HAR in DevTools → Network ("Save all as
   HAR with content") while you:
   - type an origin and a destination into the flight search,
   - open the calendar and the passenger selector,
   - scroll until the fare teasers and the destination finder have loaded,
   - open the country selector.

   `node tools/importer/record-live-data.mjs` turns them into `data/recorded/`. The homepages
   cover the home airports FRA, VIE and LHR. For MUC, also capture `/de/de/homepage` once with
   Munich chosen as the origin.
3. **Screenshots (visual parity, only without open access).** Full-page PNGs at 1440, 768 and
   390 px wide, cookie dialog dismissed, height capped at 8000 px, at
   `shots/{path}/{width}.png`. They're needed for every de/en and de/de page, plus the homepage
   and two pages per template group in at/de and gb/en.

## Using the export

`node tools/importer/serve-export.mjs` serves the export at `http://localhost:4100` under the
live paths. Images, CSS, JS and fonts redirect to www.lufthansa.com, which serves static files
to any client. The import and the parity harness then use `http://localhost:4100` in place of
`https://www.lufthansa.com`.
