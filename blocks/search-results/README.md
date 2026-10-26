# search-results

www's site search result page (`/{cc}/{ll}/support/search/search-result?query=...`, `.dcep-search-results-aem`): a search field, "Your search for **phrase**", the number of results, ten results per page (up to 30) with the page title as headline, an excerpt with the matched words in bold and the link, numbered pages below.

## Authoring (Document Authoring)

Model: `standalone`, as the block library's search block: one optional row with the query index to search (a path or URL on this site), else the locale's search index `/{cc}/{ll}/search-index.json`. The importer writes `/{cc}/{ll}/search-index.json`.

Label rows (optional, `label | text`): Input label, Search button label, Search for label (`{QUERY}`), Results label (`{NUMBER}`), No results label, Failed label, Failed sr label, Success sr label, Pagination label, Previous label, Next label, Page label (`{PAGE}`). Precedence: authored row, then www's labels (`searchResultsAEM`, `searchBar`: GET /service/api/labels/searchResultsAEM/lh/{lang}), then the built-in copies of www's texts (recorded 2026-10-26).

## Behaviour

- The phrase is the page URL's `query` parameter (the header and footer search lead there); the field submits to the same page with the new phrase (in the app view the page keeps its app form, `.solo_continue` or `?channel=app`; result links stay in the app view through scripts/channel.js).
- Results: the locale's search index, fetched with `fetch(url, { cache: 'no-cache' })`, scored by `scripts/site-search.js` (the same as lh-edge's `POST /service/secured/api/search`): case and accent folding, every term must match, a word starting with the term matches (German compounds: "Gepäck" finds "Gepäckstück"), BM25F over title, headings, page path, description and content. Pages with `hide-in-search: true` are left out.
- No results: "No results found. Please refine your search and try again." An empty query: www's search refuses it and the page says "Your search results could not be loaded."; the block does the same, without fetching the index. Index not reachable: the same text.
- `data-lh-source` / `data-lh-sources`: `live` or `none` for the index and the label bundle.

## Index

`helix-query.yaml` `search-<cc>-<ll>` (target `/<cc>/<ll>/search-index.json`): every page of the locale except nav, footer, fragments, drafts, form confirmation pages, the search page itself and the article configuration. Fields: title, description, image, headings (h1 to h3, list), content (paragraphs, list items and links alone in a block cell, list), parent, hide-in-search, lastModified. Rows exist once the pages are published.
