# cards-teaser

Custom **cards** block. Purpose: borderless image teaser grid linking to sub-pages.

## Authoring (Document Authoring)

Model: `standalone`

Single block table. Content: 2 columns, one row per card. Cell 1: image (alt required). Cell 2: heading (any level; H3 recommended, H2 on campaign pages), description paragraph(s), CTA link as the last paragraph (rendered as an arrow link; authored bold/italic button formatting is dropped). Cells may be merged or missing: the first picture of the row is the media, everything else is the body; a row without an image renders text only. Default 2 per row from 768px; option three-up = 2 per row from 768px, 3 per row from 1025px, with a smaller bold title. Titles render light (Lufthansa heading-small); a block whose card titles are all H2 renders them at the larger H2 size (heading-medium). A size marker at the end of a title ({heading-small}, README "Heading styles") wins over these sizes: the importer writes it from the Lufthansa class where it differs from the level (my-bookings three-up cards: h3.heading-small, 28px light). A teaser block right after another one starts 91px below its last link (my-bookings two-up then three-up). No label rows; all texts are authored.

## Supported variations

| Variation | Option class |
| --- | --- |
| Three up | `three-up` |

## Universal Editor fields

N/A (Document Authoring project)
