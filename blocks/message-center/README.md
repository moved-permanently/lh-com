# message-center

Custom block. Purpose: the current irregularity and outage messages as collapsible items at the top of the current travel information page, above its standing accordion items (live `.messagecenterwrapper > maui-collapsible-item`).

## Authoring (Document Authoring)

Model: `standalone`. Place an empty `message-center` block above the page's accordion. Optional row:

| Row | Value | Default |
| --- | --- | --- |
| Types | comma list of `irreg`, `tech-outage`, `promo` | `irreg, tech-outage` |

The messages come from the Message Center (`/message-center/index.json`, see `scripts/message-center.js` and the flash-teaser README for the filter and the order).

## Behaviour

- One item per message, id `message-center-item-<id>` (the message id from its path). It opens (and scrolls into view, focus on its header) when the URL hash is `#<id>`, on load and on `hashchange`; the flash teaser links there.
- High criticality: the 24px warning icon and the red header text (live `.mcm-critically-high`); low: navy, no icon.
- The body is the message's details page (`details` field, e.g. `/message-center/details/test-1/en`), its `.plain.html` fetched with `cache: 'no-cache'`. A message without details page shows its headline only (not collapsible).
- Look (measured on /de/en 2026-10-25): 74.2% of the content column from 768px (live sidebar content, 927 of 1249px), header 13px padding, LufthansaHead 18px/24px bold, 24px chevron; body 18px/27px, paragraphs 24px apart, bold `#52627c` links; 60px to the standing accordion. No message: no space.

## Import

The `.sidebar` that holds `.messagecenterwrapper` (info template, the four current travel information pages) becomes one empty block (`tools/importer/parsers/message-center.js`).

## Universal Editor fields

N/A (Document Authoring project)
