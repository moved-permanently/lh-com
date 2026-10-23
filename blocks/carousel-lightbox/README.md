# carousel-lightbox

Custom **carousel** block. Purpose: inline image preview with a zoom icon that opens all slides in a modal carousel.

## Authoring (Document Authoring)

Model: `standalone`

Single block table. Content: One row per slide. Cell 1: image (required, with alt text; rows without an image are not slides). Cell 2 (optional): caption shown under the image in the lightbox. The first slide's image is the inline preview button. Optional label rows (2 cells, no image) for UI strings, with defaults by page language: Open label (EN 'Enlarge image', DE 'Bild vergrößern'), Close label ('Close' / 'Schließen'), Previous label ('Previous image' / 'Vorheriges Bild'), Next label ('Next image' / 'Nächstes Bild'), Dialog label ('Image gallery' / 'Bildergalerie'), Slide label ('{n} of {total}' / '{n} von {total}'; also the visible counter under the image). Optional intro row(s) before the first slide (1 cell, no image, not a label row): headings and text shown above the preview, in the preview's column (half width from 768px). Rows without an image after the first slide are ignored; a block without any image is hidden.

## Layout

Zoom icon: the Lufthansa icon-photo-gallery glyph (a filled picture with a cut-out sun and mountains, one frame corner behind it) in a 60px #0009 circle. Spacing as on the fleet pages: with an intro row (the headline sits in the slideshow's column, /359) 46px (72px from 768px) below the section heading and 95px (120px) to the next section; without (headline above the block, /boeing787) 55px below it and 108px (72px from 768px) to the next heading; two blocks in a row 40px apart.

## Supported variations

| Variation | Option class |
| --- | --- |
| Half: two slideshows side by side from 768px (two consecutive blocks with this option share one row, 20px apart; stacked below 768px) | `half` |

The importer writes `half` for two slideshows of one Lufthansa column view (/de/en/744 'Main deck' | 'Upper deck': 614px each at 1440).

## Universal Editor fields

N/A (Document Authoring project)
