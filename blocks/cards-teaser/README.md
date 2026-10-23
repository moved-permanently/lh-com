# cards-teaser

Custom **cards** block. Purpose: borderless image teaser grid linking to sub-pages.

## Authoring (Document Authoring)

Model: `standalone`

Single block table. Content: 2 columns, one row per card. Cell 1: image (alt required). Cell 2: heading (any level; H3 recommended, H2 on campaign pages), description paragraph(s), CTA link as the last paragraph (rendered as an arrow link; authored bold/italic button formatting is dropped). Cells may be merged or missing: the first picture of the row is the media, everything else is the body; a row without an image renders text only. Default 2 per row from 768px; option three-up = 2 per row from 768px, 3 per row from 1025px, with a smaller bold title; option four-up (Lufthansa .fourcolumn, /at/de/flughafeninformation) = 2 per row from 768px, 4 per row from 1025px, title size as the default (the importer adds {heading-small} for h2.heading-small). Titles render light (Lufthansa heading-small); a block whose card titles are all H2 renders them at the larger H2 size (heading-medium). A size marker at the end of a title ({heading-small}, README "Heading styles") wins over these sizes: the importer writes it from the Lufthansa class where it differs from the level (my-bookings three-up cards: h3.heading-small, 28px light). A teaser block right after another one starts 91px below its last link (my-bookings two-up then three-up); a four-up block 82px. Option overlay (Lufthansa stage teaser tiles, Insights 'Explore more': /de/en/articles/explore-flying, highlights): the heading (bold 20px to 24px) and the CTA link text (light 22px to 28px) sit white on a dark gradient over the image, 20px (40px from 768px) from the top left; the whole tile is the CTA link, no arrow; tiles stack 20px apart on mobile, two (three-up: three from 1025px) per row from 768px, 20px gutter (explore-flying 1440: 615x264 tiles). No label rows; all texts are authored.

## Supported variations

| Variation | Option class |
| --- | --- |
| Three up | `three-up` |
| Four up | `four-up` |
| Overlay (text on the image, whole tile linked) | `overlay` |

With `overlay`, tiles that end their section (Insights "Explore more" above the footer) leave 41px below them (21px below 768px) instead of the 48px section gap, as the live column view.

## Universal Editor fields

N/A (Document Authoring project)
