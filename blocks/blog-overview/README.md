# blog-overview

Custom **blog-overview** block. Purpose: the Lufthansa Insights article list (www's `.dcep-blog-overview`) on category overviews, tag pages and author pages: a live list over all articles of the locale, read from the article index when the page is viewed. New articles show up once they are published (the index fills on publish).

## Authoring (Document Authoring)

Model: `standalone`

Single block table, key | value rows; every row is optional. The options are www's widget configuration (`data-dcep`), which the importer copies:

| Key | Value | www |
| --- | --- | --- |
| Category | the category's path segment: `explore-the-world`, `explore-flying`, `highlights` (www's `highlights-em` is accepted) | `categoryId` |
| Tag | a tag id, `articles:munich` (`munich` is accepted) | `selectedTag` |
| Author | an author id, `lh/florian-tomberg` | `authorId` (base64 on www) |
| Page size | cards per page (default 6) | `paginationSize` |
| Hide filter | `true`: no result count, search field or category filter | `hideFilter` |

The set options all apply (a tag page with Category and Tag lists the category's articles with that tag, as www's configuration asks). Labels: any of `Results label` ("{TOTAL} Results found"), `Search label`, `Categories label`, `All categories label`, `Read label`, `Read screen reader label` ("Read '{TITLE}'"), `No results label`, `Current page label`, `Pagination label`, `Tags label`, `Previous label`, `Next label`, `Page label` may be authored as a row; otherwise www's label bundle `blogOverview` (GET `/service/api/labels/blogOverview/lh/{lang}`, recorded answer as fallback) and then built-in English and German defaults are used.

Behaviour:
- Source: `/{cc}/{ll}/articles/query-index.json` (helix-query.yaml `articles-<cc>-<ll>`, rows with page-type `article`), fetched with `fetch(url, { cache: 'no-cache' })`.
- Order: newest publication date first, articles without a date last.
- Category filter: All Categories plus the categories (English / German names as on www; a new category shows its id in title case); preselected with the Category option.
- Search: free text over title, description, tag titles, keywords and destinations; every word must match (accents and case ignored), as you type.
- Paging: Page size cards per page, numbered pages with gaps (1 2 3 … 71) and previous / next; the total count ("421 Results found") above the list. Filter, search and page are kept in the history state (back to the list restores them).
- Empty state: "Oops. We didn't write any blogs to this topic yet." (also when the index cannot be read).
- Card: the feature image (linked), the tag chips, the title (linked), "date | reading time | author" (de: "21. Oktober 2026", de/en: "21. October 2026", gb/en and English author pages: "October 21, 2026"), the description and "Read article". Rows alternate text | image and image | text from 768px; the image is above the text on mobile.
- `data-lh-source` on the block: `live` when the index answered, `none` when not.

## Example

| blog-overview | |
| --- | --- |
| Category | explore-the-world |
| Page size | 6 |
| Hide filter | false |

Tag page `/de/en/articles/tags/munich`: Category `explore-the-world`, Tag `articles:munich`, Page size `3`, Hide filter `true`. Author page `/de/en/articles/authors/florian-tomberg`: Author `lh/florian-tomberg`, Page size `6`, Hide filter `true`.

## Supported variations

No variations.

## Universal Editor fields

N/A (Document Authoring project)
