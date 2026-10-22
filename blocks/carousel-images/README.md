# carousel-images

Custom **carousel** block. Purpose: image carousel, one slide at a time (Lufthansa `.new-carousel` `.swiper-single-slide`): the current image centred, its neighbours peeking in at the sides, an optional caption under each image, next/previous arrows from 1025px and dots.

## Authoring (Document Authoring)

Model: `standalone`

Single block table, 2 columns. One row per slide: cell 1 the image (with alt text), cell 2 an optional caption (text, may hold links; leave empty for none). Rows without an image are not slides. Optional label rows (2 cells, no image) for UI strings, with defaults by page language: Carousel label (EN 'Image carousel', DE 'Bilderkarussell'), Previous label ('Previous slide' / 'Vorheriges Bild'), Next label ('Next slide' / 'Nächstes Bild'), Slide label ('{n} of {total}' / '{n} von {total}'). A block with one image shows it without controls; without any image the block is hidden.

## Behaviour

Slides are (container width - 4px) / 1.2 wide (1050px at 1440px), 20px apart, images in their own proportions (2:1 on the 100 years pages: 1050 x 525); the track runs into the page margin. In Insights articles the block takes the article column (83.333% from 768px). Scrolling snaps to the centred slide; arrows (from 1025px), dots and the arrow keys move one slide. Captions are LufthansaText 14px bold, 10px under the image.

## Supported variations

No variations.

## Universal Editor fields

N/A (Document Authoring project)
