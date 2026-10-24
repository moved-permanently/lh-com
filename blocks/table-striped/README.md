# table-striped

Custom **table** block. Purpose: header-less key/value specification table with zebra rows.

## Authoring (Document Authoring)

Model: `standalone`

Single block table. Content: One row per table row; without an option every row is data. Option `header` ("Table Striped (header)"): the first row is the column header row. Any number of cells per row; typically 2 (Cell 1: label, Cell 2: value). A short text first cell (not a number) becomes a row header (th scope=row) when the row has 2 or more cells. Rows with fewer cells than the widest row stretch their last cell across the remaining columns. Empty rows are ignored. Cell content (text, links, lists) is kept as authored; zero-width characters are removed.

## Layout

67px (70px from 768px) below the heading above it, 80px below an image (fleet "Technical data"). Equal columns on every breakpoint, as in the live captures (390: value text at x208 of 375, "Max. take-off weight" on two lines on live too).

## Supported variations

No variations.

### header ("Table Striped (header)")

The first row holds the column titles, drawn as the Lufthansa `maui-table-head`: white, 20px light, a 1px #ccc line under them and 40px of white before the first (grey) data row; the table starts 40px under its heading; row headers in the first column are bold (`type="emphasized"`). The importer sets it for every live table with a `maui-table-head` (green-fare, flynet, tiere-als-handgepaeck: info; cookie-policy: legal).

## Universal Editor fields

N/A (Document Authoring project)
