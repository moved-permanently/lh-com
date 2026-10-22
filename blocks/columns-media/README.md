# columns-media

Custom **columns** block. Purpose: text beside media (image, several images, linked image or click-to-play video), one row per pair.

## Authoring (Document Authoring)

Model: `standalone`

Single block table. Content: 2 columns, one or more rows (one row per text/media pair). Each cell is either media or text: a cell holding only pictures and links is media, any other cell is text, so text | text and image | image are also valid. Cell order sets the media side. Media cell: one image; or several images (shown side by side, e.g. photo + QR code); or a linked image (an image wrapped in a link, or an image with a bare link (link text = URL) in the same paragraph, which then wraps the image; a link with real link text stays a visible link); or a video: poster image plus a link to an .mp4 file, rendered as the poster with a play button (bottom left) that replaces it with an inline video with controls (looping). Playback settings follow the link in the same paragraph as a marker, any of `autoplay`, `muted`, `loop`, `controls`, `round-play-button`: `{autoplay muted loop}` (Lufthansa moving image) plays by itself, muted, looping, without controls or button, once it comes near the viewport (with reduced motion: a play button instead); `{controls round-play-button}` (Lufthansa video viewer) shows a 90px round play button in the middle of the poster and plays with controls, not looping, sound on. Without a marker: square button, controls, looping. The importer writes the source's settings. The play button's accessible name is the .mp4 link text when it is not a URL, otherwise the locale default 'Play video' (EN) / 'Video abspielen' (DE). Text cell: headings, paragraphs, lists, links (bold link = primary button, italic = secondary). Option wide-media: media column 75%, text 25% from 768px, media shown first on mobile. Option sidebar (Lufthansa `.airem-sidebar`): the first cell 75%, the second 25% from 768px whatever they hold (text | links, text | image, image | text), 40px above and 46px below the row (20px / 36px on mobile), stacked in the authored order with 40px between; an empty second cell keeps its column. A link alone in its paragraph whose target is on the page (`#heading-id`) shows a down arrow (jump links next to the intro: /de/de/additional-services, /de/en/boeing787). Option slider (Lufthansa column view with carousel behaviour): below 1025px several images in one media cell are slides, one image at a time, with dots under it (68px below the image) that show the other images; from 1025px they stay side by side (/de/en/online-check-in app teaser: photo, QR code on the second slide). Without an option the columns are equal and mobile keeps the authored order. Rows or cells left empty are dropped; a row with a single cell spans the full width; rows with more than two cells get equal columns. External links open in a new tab. Section style 'grey' (Section Metadata) gives the grey band..

## Supported variations

| Variation | Option class |
| --- | --- |
| Wide media (75/25) | `wide-media` |
| Sidebar (first cell 75%, second 25%) | `sidebar` |
| Slider (several images in a media cell: slides with dots below 1025px) | `slider` |

## Universal Editor fields

N/A (Document Authoring project)
