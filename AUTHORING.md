# Authoring notes: page metadata of lh-com

Rows of a page's **Metadata** table (key | value) that the site and lh-edge read beyond the usual Title, Description and
Image. Keys are written as shown (lower case with hyphens). The locale query indexes (`search-<cc>-<ll>`,
`helix-query.yaml`) collect them when a page is **published**; preview alone does not change the indexes.

## llms.txt (AMS rest A8)

lh-edge builds `/<cc>/llms.txt` (every locale of the market) and `/<cc>/<ll>/llms.txt` from these fields. The curated
`/llms.txt` and `/de/llms.txt` stay static files and are not generated.

| Key | Value | Used for |
| --- | --- | --- |
| `llms-include` | `true` or `false` (empty: false) | only pages with `true` are listed |
| `llms-title` | a short title | the link text; empty: the page title without " \| Lufthansa" |
| `llms-description` | one sentence | the text after the link; empty: the page's description |
| `llms-category` | a short group name, e.g. `Booking`, `Baggage` (`Buchung`, `Gepäck` on German pages) | one section per category, sections and pages in alphabetical order; a page without a category is not listed |
| `ai-guidance` | a short paragraph, **on the locale's homepage only** | printed under the locale's heading: how an assistant should point travellers to support in that market |

Example (`/at/de/gepaeck`):

| Metadata | |
| --- | --- |
| llms-include | true |
| llms-category | Gepäck |
| llms-title | Gepäck Übersicht |
| llms-description | Freigepäck, Handgepäck und Sondergepäck auf einen Blick. |

## XML sitemaps (AMS rest A7)

| Key | Value | Used for |
| --- | --- | --- |
| `page-robots` | the page's own robots value, e.g. `noindex, nofollow` | the sitemaps leave out pages whose `page-robots` contains `noindex`. Set it together with `Robots`: until go-live the site-wide `/metadata.json` sets `noindex` on every page, so the sitemaps cannot read `Robots` |
| `primary-language-url` | the de/en page this page translates, e.g. `/de/en/baggage` | pairs pages with translated slugs (`/de/de/gepaeck`) as alternates in the sitemaps |
| `Canonical` | a URL | the canonical link (only where it differs from the page itself) |

## Market roots (`markets`)

Market roots such as ch/en and ch/de have no copy of every page: lh-edge answers them from the language version (de/en
for English, de/de for German, `tools/workers/lh-edge/README.md` "Market roots"). `markets` on a **language version's**
page says which markets of its language get it:

| Key | Value | Used for |
| --- | --- | --- |
| `markets` | empty: every market of the language; an include list of countries `de, at`; an exclude list `-ch, -us` | a market root not allowed answers 404 for the page, leaves it out of its sitemap and search index, and links to it stay on the language version |

A market that needs its own version of a page gets a document at its own path (`/ch/de/<path>`): it wins over the
language page, whatever `markets` says. A market page with another slug on www gets its own document or a row in the
redirect sheet. The field was seeded once from www's sitemaps (`tools/markets/seed-markets.mjs`); from then on it is kept
here. The language index takes the value when the page is **published**.

## Fleet pages (AMS rest A3)

| Key | Value | Used for |
| --- | --- | --- |
| `aircraft-code` | the IATA aircraft type code in lower case, e.g. `359`, `32n`, `789` | `<page>.aircraft.json`, the flight status' fleet links, the redirect `/<cc>/<ll>/discover-lufthansa/lufthansa-fleet/<code>` |
| `aircraft-order` | a number | the order of the aircraft list (the fleet overview's order) |

## Experience fragment documents (`/xf/`, AMS rest A3)

| Key | Value |
| --- | --- |
| `xf-path` | the fragment's AEM path `/content/experience-fragments/...` (folder names of AEM such as `_100_years_of_luftha` kept) |
| `xf-kind` | `fragment`, `variant` (a document below its fragment, e.g. `.../cash-miles/master`) or `folder` (a folder without fragments) |
| `xf-tags` | tags as `Title\|id` pairs, comma separated, e.g. `Web\|experience-fragments:variation/web` |
