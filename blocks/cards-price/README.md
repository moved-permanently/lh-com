# cards-price

Custom **cards** block. Purpose: grid of destination or origin tiles with a frozen authored lowest price.

## Authoring (Document Authoring)

Model: `standalone`

Single block table. Content: 2 columns, one row per tile. Cell 1: optional square image (alt = city name; may be empty). Cell 2: the label as a link to the city/route page (a paragraph, not a heading), followed by an optional price paragraph exactly as rendered on the source with the amount in bold, e.g. "from **454 €**" / "ab **1.488 €**" (frozen authored text; no live price calls, so wording and currency come from the authored content in every locale). No image (empty cell 1 or a single text cell) renders a text-only tile; no link renders a non-clickable tile; extra paragraphs are shown as further price lines. Empty rows are skipped. All tiles show at every width (the live tiles marked `.mobile-hidden` are not hidden on the live site either). No label rows; no built-in UI strings.

## Supported variations

No variations. Documents imported before 2026-10-22 may carry the former option `mobile-limit`; it no longer changes anything (re-import drops it).

## Universal Editor fields

N/A (Document Authoring project)
