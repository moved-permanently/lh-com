# related-articles

Custom **related-articles** block. Purpose: row of related article cards built from authored links, enriched from the heads of the linked pages.

## Authoring (Document Authoring)

Model: `standalone`

Single block table. Content: 1 or 2 columns, one row per related article: cell 1 (optional) the card image, cell 2 a link to the article (link text = card title) and optionally a byline paragraph 'date | reading time | author' (printed as authored). Rows may also hold several links / a list (one card per link, without authored image or byline). Cards keep the authored order, duplicates are dropped. Whatever a row leaves out (image, byline, title when the link text is the URL) is read at runtime from the head of the linked page, for pages of this site only: og:image, publication-date (formatted per page language, e.g. 'August 20, 2026' / '20. August 2026'), reading-time, author, og:title (cached per tab in sessionStorage). Articles outside the site (www.lufthansa.com links) show only the authored values, so the importer writes image and byline for every card. Links to pages of the site are made relative; no link opens a new tab (as on lufthansa.com). Empty bylines take no space; titles are cut after three lines. The section heading ('Related Articles') stays default content above the block. No options.

## Supported variations

No variations.

## Universal Editor fields

N/A (Document Authoring project)
