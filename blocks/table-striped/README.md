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

### matrix ("Table Striped (header, matrix)")

Wide comparison tables (first user: the functions table, /migration-status/functions: 39 functions by 7 airlines). No change to the content: it reads the table and its links' titles as authored. `table-striped-matrix.js`, loaded only by the tables with the option.

- Sticky first column: the first cell of every row (`table-striped-sticky`) stays in place while the table scrolls sideways inside the block, at every width; opaque in its row's stripe so the columns scrolling under it do not show through, a 1px line on its right. The table fills its box and scrolls once the box is narrower than its columns need (first column 9.5rem below 768px, else 14rem; every other column 7.5rem). The stripes and the header row as option `header`'s; body cells padded 20px 16px.
- Tooltips from the link titles: every link with a `title` in the table shows it in a small dark box with white text and an arrow (max. 28rem or the table area), below the link (above it when there is no room), shifted to stay inside the scrolling area and the viewport; on hover (devices that hover), on keyboard focus, and on a first tap (it does not follow the link; a second tap on the same link does). Escape and a tap or click elsewhere close it. `role="tooltip"`, the link's `aria-describedby` while it shows; the title moves into the tooltip (`data-tooltip`), so the browser shows no tooltip of its own; a link without text of its own keeps the title as its name (`aria-label`). Links outside the block (a legend above it) are left as they are.

Without `matrix` the block renders exactly as before.

## Universal Editor fields

N/A (Document Authoring project)
