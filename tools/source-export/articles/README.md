# Lufthansa Insights: www export of all articles

All public article pages of `https://www.lufthansa.com` in de/en, de/de, at/de and gb/en, recorded from a browser
tab on www (same-origin GET, no cookies, one request every 2 to 4 seconds), 2026-10-25 20:20 UTC to 2026-10-26
01:00 UTC. No Bright Data. Source of the full article import; nothing here is published.

| path | what |
|---|---|
| `api/articleblog-<cc>-<ll>.json` | www's article list API per locale (all articles with path, title, date, tags, author) |
| `api/categories-<cc>-<ll>.json` | www's category list per locale |
| `urls-<cc>-<ll>.csv` | every URL fetched: path, kind (article, category, tag, author, other), status, title, post date. A redirect is written out in the status column |
| `bundles/articles-NNNN.ndjson.gz` | the HTML of every fetched URL, one JSON line each (`kind`, `url`, `status`, `contentType`, `base64`, `text`, `fetchedAt`), the line format of `tools/importer/export-in-browser.js`. 0000-0023 articles (0023: three at/de articles fetched a second time after a failed fetch), 0024-0038 category, tag, author and other pages. Not-found answers are included |
| `poi/<cc>-<ll>.ndjson` | the map-point answers of every page with a map, one line per page, in the layout of `tools/importer/bd-record-api.mjs` (`method`, `url`, `status`, `text`, `locale`, `referer`, `recordedAt`) |

## Counts

| locale | articles | category | tag | author | other |
|---|---|---|---|---|---|
| de/en | 559 | 6: 5 ok, 1 not found | 124: 123 ok, 1 not found | 222: 5 ok, 198 not found, 19 redirect | 7: 4 ok, 3 not found |
| de/de | 556 | 5 ok | 123 ok | 221: 5 ok, 195 not found, 21 redirect | 7: 4 ok, 3 not found |
| at/de | 556 | 5 ok | 123 ok | 221: 5 ok, 195 not found, 21 redirect | 3: 2 ok, 1 not found |
| gb/en | 559 | 6: 5 ok, 1 not found | 123: 122 ok, 1 not found | 222: 5 ok, 198 not found, 19 redirect | 3: 2 ok, 1 not found |

Map points: de/en 167 pages (1,179 points), de/de 164 (1,169), at/de 164 (1,169), gb/en 167 (1,179); every page with
a map has one, every answer was 200.

## Using it

- `serve-export.mjs --unpack` reads `bundles/*.ndjson`, not `.ndjson.gz`: decompress the bundles into a folder
  (`gunzip -k`) and pass it with `--src`, or teach the script to read `.gz`.
- `record-live-data.mjs` reads `<src>/api/**/*.ndjson`: copy `poi/*.ndjson` there (for example
  `tools/source-export/api/articles-poi/`) before running it. About 7 answers per locale are already in
  `data/recorded`; the first answer found wins, so the duplicates do no harm.
- `.model.json` was not exported: the Insights importer doesn't read it.

## What www does

- Categories: `/articles`, `/articles/explore-the-world`, `/articles/explore-flying`, `/articles/highlights`,
  `/articles/highlights-european-championship`. The English category API calls highlights `highlights-em`, but
  `/articles/highlights-em` is not found; those articles live under `/articles/highlights/...` (21 under
  `/articles/highlights-european-championship/...`).
- Tag pages: `/<cc>/<ll>/articles/tags/<tag id>` (the tag `targetUrl` in the API). Author pages:
  `/<cc>/<ll>/articles/authors/<author id without "lh/">`; only five authors have one, in every locale:
  florian-tomberg, florian-schwebel, julia-buth, till-weisbrod, alexandra-mikamo. Author ids with accents, spaces or
  curly quotes redirect, and the follow-up fetch fails.
- gb/en has the same 559 article paths as de/en, at/de the same 556 as de/de; after normalising market paths, date
  format and random ids, 317 (gb/en) and 319 (at/de) pages are identical, the rest differ only in the related
  articles (www picks them at random on each render).
- Only in English: 4 art-journey articles under `/articles/highlights/`. Only in German:
  `be-picky-mexico-city-insidertipps`.
- www errors not to copy: the de/en Toronto article has a German `<title>` ("Toronto an einem Tag"); the gb/en API
  lists the tag `chennai`, whose page is not found; de/en article HTML links to `/de/en/articles/tags/art.` (trailing
  dot, not found).
