# related-articles

Custom **related-articles** block. Purpose: row of related article cards built from authored links, enriched from the heads of the linked pages.

## Authoring (Document Authoring)

Model: `standalone`

Single block table, optional rows. The block shows three related articles. Rows an editor adds are fixed picks and come first, in authored order (1 or 2 columns, one row per article: cell 1 (optional) the card image, cell 2 a link to the article (link text = card title) and optionally a byline paragraph 'date | reading time | author'; a row may also hold several links, one card each; duplicates are dropped). The rest is picked when the page is viewed from the locale's article index (`/{cc}/{ll}/articles/query-index.json`, `fetch(url, { cache: 'no-cache' })`): two articles that share tags with the page (its `tag-ids` metadata), the ones with more shared priority-1 tags first, then priority-2 tags, then any shared tags, then the newest; and one more of the page's category (`category` metadata, else the path), the newest not shown yet (www fills its third card at random). With fewer matches the newest of the category, then of the locale fill up. Priority tags: the sheet `/articles/config/tag-priority` (columns `locale`, `priority-1`, `priority-2`, comma lists of tag ids such as `articles:munich`; the importer's copy is `tools/importer/tag-priority-sheet.json`); without the sheet all shared tags count the same. The importer writes the empty block. Image, byline and title of a card come from the index; an authored link to a page outside the index reads them from the head of the linked page (pages of this site only; www.lufthansa.com links show only the authored values). Dates as www's cards: 'September 10, 2026' (en), '10. September 2026' (de). Links to pages of the site are made relative; no link opens a new tab. Titles are cut after three lines. The section heading ('Related Articles') stays default content above the block; a section with nothing to show (no index yet) is hidden. `data-lh-source`: `live` when the index answered, `none` when not. No options.

## Supported variations

No variations.

## Universal Editor fields

N/A (Document Authoring project)
