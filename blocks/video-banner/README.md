# video-banner

TAP's YouTube banner, as www.flytap.com draws it on Economy Prime and For Life
(tools/reports/tap/parity.md R4-9): www's poster in a 380 px frame with 32 px corners, the title
over it and a play button. YouTube loads only on play.

## The table

One row:

| Cell | Content | Without it |
| --- | --- | --- |
| Poster (optional) | www's poster picture (the banner's `backgroundImage`) | a dark frame |
| Text | the title (H3) and a link to the YouTube video; the link's text is the button's (www's `watch-video`: "Ver vídeo", "Watch video"…) | — |

The importer (tools/importer/tap-import.mjs, `ComponentBannerVideoModel` with a `youtubeUrl`)
writes it.

## Behaviour

- The frame: 380 px high, 32 px corners; the poster fills it under a 20 % veil.
- The title: white, 32 / 38.4 (700 from 1024 px, 500 below), 64 px in and 44 px down from 1024 px,
  24 / 24 on phones.
- The button: a white outline pill (40 px, Inter 16) with the play icon at the frame's foot, the
  whole width on phones.
- Play: the player (youtube-nocookie.com, autoplay) takes the frame, the poster and the text make
  way, and the player takes the focus. Nothing loads from YouTube before.
- A link that is no YouTube video leaves the block as authored.

## Not as www

- www loads its player under the poster before play and grows the frame to 476 px at 1440 when it
  plays (its "panoramic"); here the player loads on play and the frame stays 380 px.
- For Life has no poster on www, which shows YouTube's own preview there; here the frame is dark.
