# columns-media

Custom **columns** block. Purpose: text beside media (image, several images, linked image or click-to-play video), one row per pair.

## Authoring (Document Authoring)

Model: `standalone`

Single block table. Content: 2 columns, one or more rows (one row per text/media pair). Each cell is either media or text: a cell holding only pictures and links is media, any other cell is text, so text | text and image | image are also valid. Cell order sets the media side. Media cell: one image; or several images (shown side by side, e.g. photo + QR code); or a linked image (an image wrapped in a link, or an image with a bare link (link text = URL) in the same paragraph, which then wraps the image; a link with real link text stays a visible link); or a video: poster image plus a link to an .mp4 file, rendered as the poster with a play button (bottom left) that replaces it with an inline video with controls (looping). The play button's accessible name is the .mp4 link text when it is not a URL, otherwise the locale default 'Play video' (EN) / 'Video abspielen' (DE). Text cell: headings, paragraphs, lists, links (bold link = primary button, italic = secondary). Option wide-media: media column about 73%, text about 27% at desktop, media shown first on mobile. Without the option the columns are equal and mobile keeps the authored order. Rows or cells left empty are dropped; a row with a single cell spans the full width; rows with more than two cells get equal columns. External links open in a new tab. Section style 'grey' (Section Metadata) gives the grey band..

## Supported variations

| Variation | Option class |
| --- | --- |
| Wide media (73/27) | `wide-media` |

## Universal Editor fields

N/A (Document Authoring project)
