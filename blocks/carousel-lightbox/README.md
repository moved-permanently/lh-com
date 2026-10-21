# carousel-lightbox

Custom **carousel** block. Purpose: inline image preview with a zoom icon that opens all slides in a modal carousel.

## Authoring (Document Authoring)

Model: `standalone`

Single block table. Content: One row per slide. Cell 1: image (required, with alt text; rows without an image are not slides). Cell 2 (optional): caption shown under the image in the lightbox. The first slide's image is the inline preview button. Optional label rows (2 cells, no image) for UI strings, with defaults by page language: Open label (EN 'Enlarge image', DE 'Bild vergrößern'), Close label ('Close' / 'Schließen'), Previous label ('Previous image' / 'Vorheriges Bild'), Next label ('Next image' / 'Nächstes Bild'), Dialog label ('Image gallery' / 'Bildergalerie'), Slide label ('{n} of {total}' / '{n} von {total}'; also the visible counter under the image). Other rows without an image are ignored; a block without any image is hidden.

## Supported variations

No variations.

## Universal Editor fields

N/A (Document Authoring project)
