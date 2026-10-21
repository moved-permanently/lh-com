# related-articles

Custom **related-articles** block. Purpose: row of related article cards built from authored links and the query index.

## Authoring (Document Authoring)

Model: `standalone`

Single block table. Content: 1 column. One or more rows holding links to article pages (one link per row, or several links / a list in one cell); every link becomes one card, in authored order, duplicates dropped. For each link the block looks up the page in /query-index.json (columns path, title, image, publication-date, reading-time, author) and shows a 16:9 image, a byline 'date | reading time | author' (date formatted per page locale; missing parts omitted) and the title; the whole card is linked. Links missing from the index, or pages without an index, show the link text as title with an empty image box. The section heading ('This may also be of interest to you') stays default content above the block. No options..

## Supported variations

No variations.

## Universal Editor fields

N/A (Document Authoring project)
