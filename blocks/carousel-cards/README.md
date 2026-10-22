# carousel-cards

Custom **carousel** block. Purpose: horizontal carousel of bordered teaser cards, several visible at once, mixed widths.

## Authoring (Document Authoring)

Model: `standalone`

Single block table. Content: One row per slide. Cell 1: image. Cell 2: optional eyebrow paragraph, heading, description, CTA link. Optional cell 3: 'wide' for a wide card (default compact). Cells may be missing; a slide without an image renders text only. Optional label rows (2 cells, no image): Carousel label, Previous label, Next label, Slide label ('{n} of {total}'). UI strings have built-in English and German defaults chosen by the page language; any can be overridden with a row of the same name.

## Supported variations

- `article` (Carousel Cards (article)): Lufthansa Insights articles ('This may also be of interest to you'). No carousel: the cards sit in the article column (83.333% of the content width, centred, from 768px), stacked on mobile, two per row from 768px, three from 1025px, 20px apart; 16:9 images, 1px #b0b0b0 border, 4px radius, titles LufthansaHead bold 20px to 24px. The importer writes it for the teaser rows inside articles; the heading above keeps its size marker ({heading-small}, 28px light) and takes the same column. Other pages keep the default carousel.

## Universal Editor fields

N/A (Document Authoring project)
