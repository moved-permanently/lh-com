# embed

Custom **embed** block. Purpose: an embedded third-party player: a YouTube video or a Lufthansa in-flight entertainment widget.

## Authoring (Document Authoring)

Model: `standalone`

Single block table. Content: one row, one cell with the link:

- YouTube: any video URL (`https://www.youtube.com/watch?v=…`, `https://youtu.be/…`, `https://www.youtube-nocookie.com/embed/…`; `start` / `t` in seconds is kept). Always shown as a `youtube-nocookie.com` player, 16:9 over the content width (Lufthansa `.video-player`: lufthansa-express-rail 'the perfect connection between train and plane').
- In-flight entertainment widget: `https://www.lufthansa-inflightentertainment.com/en/widgets/?id=…&type=film-bucket&lang=de` (id, type and lang as on the live page). 520px high and at most 1240px wide, as the Lufthansa iframe component (unterhaltung-an-bord 'In-flight entertainment highlights' id 9933, travelling-with-children / fliegen-mit-kindern 'On-board entertainment' id 10391).

A link text other than the URL becomes the player's title (screen readers); otherwise "YouTube video" / "In-flight entertainment" (German: "YouTube-Video" / "Bordunterhaltung"). Other links are not embedded (the block keeps nothing). 40px below the player (`margin-bottom: 4rem`).

The same link alone in a paragraph inside an `accordion-columns` panel or a `columns-media` cell is shown as the player too (`scripts/media.js`, styles in `styles/media.css`; flight-disruptions, traveltricks, lufthansa-business-class-on-long-haul-routes). The iframe loads lazily.

The importer writes the block for `.video` (YouTube iframe) and `.iframe` (in-flight entertainment widget) components outside accordions and column views (info template).

## Supported variations

No variations.

## Universal Editor fields

N/A (Document Authoring project)
