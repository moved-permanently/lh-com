# table-deals

Custom **table** block. Purpose: list of frozen last-minute flight deals, each row one link with a bold price, partly revealed by a Show more button.

## Authoring (Document Authoring)

Model: `standalone`

Single block table. Content: One row per deal, no header row, 4 cells: Origin | Destination | Date | Price (cells map to these columns by position; extra cells render below as extra text, missing cells leave the column empty). The first link found in any cell of the row becomes the whole-row link (rel=nofollow; links inside cells are unwrapped); a row without a link renders as plain text. Optional config rows with exactly 2 cells, before or after the deals, are never rendered as deals: 'Visible rows | 5' (number of rows shown before the button, default 5) and 'Show more label | Show more' (defaults: EN 'Show more', DE 'Mehr anzeigen'). The Show more button reveals all remaining rows and is omitted when all rows are visible. Empty rows are ignored. Prices and dates are authored text.

## Supported variations

No variations.

## Universal Editor fields

N/A (Document Authoring project)
