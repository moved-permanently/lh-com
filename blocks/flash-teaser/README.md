# flash-teaser

Custom block. Purpose: the one-line strip of current travel information, alerts and promotions at the top of the homepage content (live `.dcep-flash-teaser`, the "flash teaser"; on 2026-10-25 de/en showed "Information on flights to Dubai").

## Authoring (Document Authoring)

Model: `standalone`. Place an empty `flash-teaser` block at the top of the homepage content (before the flight search). Optional row:

| Row | Value | Default |
| --- | --- | --- |
| Types | comma list of `irreg`, `tech-outage`, `promo` | all three |

The messages are not authored here: they come from the Message Center (`/message-center/<type>/<id>/<lang>` documents, listed in `/message-center/index.json`), see `scripts/message-center.js`.

## Behaviour

- Messages: tenant `lh`, the page's market and language (the English row when a message has none in the page's language), touchpoint `web`, inside their `from`/`to` window (UTC). Order: irreg high, tech-outage high, irreg low, tech-outage low, promo high, promo low; newest first within a rank (`from`, else `lastModified`). Promotions only while no irregularity or outage is shown.
- The index is fetched with `cache: 'no-cache'` (the JSON is served with `max-age=7200`; a withdrawn message would otherwise stay up to 2 hours). `scripts.js` starts the request before the first section loads.
- One slide per message: icon (warning for high, info for low, sale for promotions), headline, linked to the message's `link`, else the tenant's current travel information page (`/message-center/config/cti-pages.json`, `webPath`) for the page's locale, with `#<id>` (the message center item opens there).
- Look (live app.css, measured at 1440 / 768 / 390): content column, 44px high (86px below 768px), 14px padding left / 18px right; LufthansaText 14px/18px bold; `#f5f5f5`, high irregularities and outages `#cc000012` with red (`#c00`) text and icon; the text is cut to one line from 768px and to 4 lines below.
- Controls (more than one message), left to right as www's `.dcep-flash-teaser`: the countdown ring with play/pause inside it, the pager `1/2` (the digit rolls in vertically in 0.45 s when the message changes), previous/next as up/down chevrons stacked (from 1025px; below that only ring and pager). The ring: SVG 24 x 24 rotated to start at 12 o'clock, two circles r 11.25, stroke 1.5, no fill: the track in the control colour at 20 %, the progress in the control colour (darker on hover), `stroke-dashoffset` from the circumference (70.69, empty) to 0 (full); the 16px play/pause icon over it. Control colours: Lufthansa `#52627c`, hover `#414e63`; SWISS `#6f6660`, hover `#554e49`; Austrian `#4d4d4d`, hover `#ac1804` (recorded live CSS, its theme's); the other brands their theme's control (`--lh-whale-blue`) and hover (`--link-hover-color`) colours (no recorded live CSS).
- Carousel (more than one message), as www: the ring fills over 7 s and drives the rotation (one clock, requestAnimationFrame: a hidden tab pauses both); full, the message goes out (0.2 s) and the next comes in, the ring empty again. Mouse over the message holds ring and rotation where they are (leaving goes on from there); pause holds them and shows play, play goes on from that point. Previous/next, arrow keys (left/up, right/down), swipe and keyboard focus moving into a message stop the rotation as a visitor's own move: the ring goes back to empty, the icon shows play, only play starts it again (from empty). No ring and no controls for a single message. Ours, not www's: visitors who prefer reduced motion get it stopped (the ring empty with the play icon; it fills only after play) and no slide, pager or exit animation.
- Accessibility: `role="region"`, `aria-roledescription="carousel"`, slides `role="group"` / `aria-roledescription="slide"`, labels from `labels/flashteaser` ("Current travel information, alerts and promotions", "Message {CURRENT} of {TOTAL}", "Attention", "Promotion", previous/next, start/stop rotation; built-in copies of the recorded bundle until it loads); the slides are `aria-live="off"` while rotating and `polite` when stopped or held; a polite status announces manual changes and start/stop. The ring is decoration (`aria-hidden="true"`); the button keeps its start/stop label.
- No close button; nothing stored in cookies or storage. No message: the block and its wrapper take no space.
- Layout stability: the block waits for the index before its section shows (sections show once their blocks are loaded), so the flight search is never pushed down after it painted; the strip has a fixed height, so rotation never moves anything (the 24px ring fits in the 44px / 86px strip).

## Import

`.flashteasercore > .dcep-flash-teaser` (homepage template) becomes one empty block (`tools/importer/parsers/flash-teaser.js`).

## Universal Editor fields

N/A (Document Authoring project)
