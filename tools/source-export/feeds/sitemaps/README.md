# www.lufthansa.com XML sitemaps (all markets and languages)

A compact dataset built from the public XML sitemaps of `https://www.lufthansa.com` (the AEM pages,
`/<cc>/<ll>/...`). It answers two questions without fetching www: which market-language roots exist,
and which URLs of different roots are the same page (they list each other as hreflang alternates).

## Source and fetch

- Sitemap index: `https://www.lufthansa.com/sitemap/sitemap_lh.xml.gz`, the `Sitemap:` line of www's
  `robots.txt` (the uncompressed `/sitemap/sitemap_lh.xml` answers 404). The index lists 499 files,
  `sitemap_lh_<cc>_<ll>.xml.gz` and their splits `sitemap_lh_<cc>_<ll>_<n>.xml.gz`; all its `<lastmod>`
  values are 2026-10-25T22:00Z.
- `robots.txt` also names `/aircore/sitemaps/sitemap-index.xml` (the AirCore `/lhg/` pages). That one is
  not part of this dataset.
- Fetched on 2026-10-27 from a browser tab on www (same-origin GET, no login), one request at a time with
  2 seconds between the end of one response and the next request (about 2.2 s per file):
  - the index and its 499 files: 14:01-14:20 UTC, all 200;
  - the roots missing from the index (see below): 14:21-15:06 UTC, 1,202 requests: 1,044 files answered 200,
    158 answered 404 (the 404 after the last numbered file of each root ends the probe for that root).
  - No 403, 429 or challenge page, no failed request, so no gaps.
- 1,543 sitemap files, 226.7 MB gzipped (73.8 MB from the index, 153.0 MB found by probing). The raw
  files and the fetch manifest are kept outside git.

### The index is cut off

The index stops after `sitemap_lh_es_de_3.xml.gz`: it holds 499 entries in alphabetical order and covers
83 roots, `ae/de` to `es/de` (`es/de` only partly). The files of the other roots exist under the same
naming scheme and answer 200 on www, so they were fetched by probing. For each root that appears in an
hreflang alternate but not in the index, the probe asked for `sitemap_lh_<cc>_<ll>.xml.gz`, then `_1`,
`_2`, ... until the first 404 (for `es/de` from `_4` on). Every probed root had files: 157 roots plus the
rest of `es/de`. A search engine that follows only the index sees a third of www's sitemap files.

## Files

| file | what |
|---|---|
| `roots.json` | every market-language root seen as a `<loc>` or in an alternate: `root` (`cc/ll`), `hreflang` values that point to it, `sitemapFiles`, `inIndex` (listed in the index), `ownSitemap`, `urlCount` (distinct `<loc>` URLs), `alternateOnlyCount` (URLs seen only as an alternate), `groupCount`, `marketOnlyCount` |
| `groups.json.gz` | gzipped JSON `{ groups: [...] }`, one entry per page group (below) |
| `market-only.json` | `{ roots: { "cc/ll": [[path, lastmod], ...] } }`: URLs that belong to no group |
| `stats.json` | counts, gaps and the oddities listed below, with the full lists |
| `build.mjs` | the build script (plain Node, no dependencies) |

### Groups

Every `<url>` entry links its `<loc>` to each `xhtml:link rel="alternate"` href in it. A group is a
connected set of URLs under those links, taken over all files at once (union-find), so a page joins a group
even when only one side lists the other. Paths are www paths without the host.

```json
{
  "id": 976,
  "key": "/de/en/homepage",
  "size": 253,
  "paths": { "ae/de": "/ae/de/homepage", "de/en": "/de/en/homepage", "gb/en": "/gb/en/homepage" },
  "lastmod": { "ae/de": "2026-10-23T22:02:38Z" }
}
```

(Shortened: the real entry has 253 paths.)

- `key`: the group's `de/en` path, else its `de/de` path, else its first path. Groups are sorted by `key`;
  `id` is the position in that order and changes when the data is rebuilt.
- `paths`: one path per root. When a group holds two URLs of the same root, the value is an array. That
  happens in 2 groups: `/343` with `/34p` in every root, and `/ae/de/flights` with `/ae/de/fluege`.
- `lastmod`: the sitemap `<lastmod>` per root, only for URLs that are a `<loc>` somewhere (the newest value
  when a URL is listed twice).
- Paths under `/null/null/` and `/xx/<ll>/` appear only as alternates (see below); they stay in the groups
  as www has them.

A URL that has no alternates of its own and is no other URL's alternate is market-only and goes to
`market-only.json`.

To find the other-language versions of a replica page, look up the group whose `paths["de/en"]` (or
`de/de`, `at/de`, `gb/en`) is the page's www path.

## Counts (2026-10-27)

| | |
|---|---|
| `<url>` entries / distinct `<loc>` URLs | 221,802 / 220,154 (1,648 URLs are listed in two files) |
| alternate links | 46,660,514 |
| distinct URLs (locs and alternates) | 230,171 (10,017 only as alternates) |
| roots | 253: 240 with their own sitemap files (83 in the index, 157 found by probing), 13 only as alternates |
| groups | 1,932 (2 to 482 URLs, median 196) |
| market-only URLs | 2,590: en 1,433, de 1,117, pt 9, es 8, zh 5, fr 4, ja 4, ko 3, ru 3, hk 2, it 2 |

The four replica locales:

| root | URLs in its sitemaps | only as alternates | groups | market-only |
|---|---|---|---|---|
| `de/en` | 1,066 | 15 | 1,063 | 17 |
| `de/de` | 1,049 | 19 | 1,057 | 9 |
| `at/de` | 1,037 | 21 | 1,054 | 2 |
| `gb/en` | 1,043 | 17 | 1,055 | 4 |

## Oddities in www's sitemaps

- The index is cut off after 499 entries (above).
- 40 files were last written on 2026-09-18/19, while all others date from 2026-10-23/24: the `_7` file of
  23 English roots and `de_de_7`, plus `mk_de_7` to `_12` and `mk_en_8` to `_17`. They look like leftovers
  that www no longer rewrites. 1,944 URLs appear only in these files (1,805 of them `mk` configuration
  pages, the rest test and campaign pages such as `/de/en/dcep_ams_28-07-2026_04-07-57`); they may be gone.
  `stats.json` lists the files (`staleFiles`) and the URLs (`urlsOnlyInStaleFiles`).
- `mk/en` (18 files, 2,890 URLs), `mk/de` (13 files, 1,511) and `us/de` (13 files, 2,794) are larger than
  the other roots (329 to about 1,070 URLs) because they list AEM configuration pages,
  `/<cc>/<ll>/configuration/seo-pages/...`: 1,803, 643 and 1,778 of them (for `mk` mostly from the leftover
  files). These are most of the market-only URLs of `mk/en` (1,286) and `us/de` (1,037). Every other root
  lists 5 configuration pages.
- `xx/<ll>`: 13 roots (`xx/de`, `xx/el`, `xx/en`, `xx/es`, `xx/fr`, `xx/hk`, `xx/it`, `xx/ja`, `xx/ko`,
  `xx/pl`, `xx/pt`, `xx/ru`, `xx/zh`) appear only as the targets of language-only hreflang values (`en`,
  `de`, `zh`, ...). They have no sitemap file.
- `/null/null/home` and `/null/null/oneTrip` are alternates in the groups of `/de/en/homepage` and
  `/de/en/during-your-trip`.
- The language segment `hk` is not an ISO 639-1 code: `cn/hk`, `hk/hk`, `tw/hk`, `xx/hk` (hreflang `zh-HK`).
- 931 alternate links are one-sided (A lists B, B is a `<loc>` whose entry does not list A); `stats.json`
  has a sample (mostly `mk/de` to `us/de` configuration pages).
- The base file of a root can be tiny: `sitemap_lh_us_de.xml.gz` holds one URL (the homepage with its
  alternates); the pages follow in `_1` and later.

## Rebuild

The build reads the raw files as fetched and a manifest of the fetch:

```sh
node tools/source-export/feeds/sitemaps/build.mjs <raw-dir> <manifest.json> tools/source-export/feeds/sitemaps
```

- `<raw-dir>`: `sitemap_lh.xml.gz` and every `sitemap_lh_*.xml.gz`, byte for byte as www sent them.
- `<manifest.json>`: `{ started, ended, items: [{ file, url, status, bytes, sha256, fetchedAt, source,
  lastModified }] }`, one item per request. `source` is `robots` (the index), `index` (listed in the index)
  or `probe` (found by probing). A probe that answers 404 ends a root; any other answer than 200 is listed
  as a gap in `stats.json`. `lastModified` (the response header) is used to find leftover files.

It takes about a minute and under 1 GB of memory for the 2026-10-27 files; the output is the same on
every run. To fetch again: request the index
and its files, then probe the roots that `roots.json` shows with `inIndex: false`, from a browser tab on www
(www's bot protection refuses other clients), at the same pace.
