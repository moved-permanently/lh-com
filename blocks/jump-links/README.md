# jump-links

Custom block. Purpose: links to places on the same page (the Lufthansa "anchor-down" navigation links: "↓ To types of baggage  ↓ To baggage services" on /de/en/baggage).

## Authoring (Document Authoring)

Model: `standalone`

One link per row; the link target is an anchor on the page (`#types-of-baggage`, the id Edge Delivery gives the heading). Every link of the block becomes one item, whatever rows or cells it was authored in; rows without a link are ignored, a block without links is removed.

Imported by `tools/importer/transformers/lufthansa-cleanup.js` (convertJumpLinks) from link lists (`.imagelinklist`) and column views whose links are all `maui-navigation-link variant="anchor-down"`. Jump links in a sidebar next to the intro (`.airem-sidebar`) are a Columns Media (sidebar) block with the links in the second cell instead.

## Behaviour

Each link with a down arrow before its label, in one row that wraps (20px between links, 20px below each line).

## Supported variations

| Variation | Option class |
| --- | --- |
| Equal columns, one per link (stacked below 768px, two per row from 768px, all in one row from 1025px) | `columns` |

## Universal Editor fields

N/A (Document Authoring project)
