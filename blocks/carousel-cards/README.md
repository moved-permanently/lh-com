# carousel-cards

Custom **carousel** block. Purpose: horizontal carousel of bordered teaser cards, several visible at once, mixed widths.

## Authoring (Document Authoring)

Model: `standalone`

Single block table. Content: One row per slide. Cell 1: image. Cell 2: optional eyebrow paragraph, heading, description, CTA link. Optional cell 3: 'wide' for a wide card (default compact). Cells may be missing; a slide without an image renders text only. Optional label rows (2 cells, no image): Carousel label, Previous label, Next label, Slide label ('{n} of {total}'). UI strings have built-in English and German defaults chosen by the page language; any can be overridden with a row of the same name.

## Supported variations

- `article` (Carousel Cards (article)): Lufthansa Insights articles ('This may also be of interest to you'). No carousel: the cards sit in the article column (83.333% of the content width, centred, from 768px), stacked on mobile, two per row from 768px, three from 1025px, 20px apart; 16:9 images, 1px #b0b0b0 border, 4px radius, titles LufthansaHead bold 20px to 24px. The importer writes it for the teaser rows inside articles; the heading above keeps its size marker ({heading-small}, 28px light) and takes the same column. Other pages keep the default carousel.
- `grid` (Carousel Cards (grid)): Lufthansa column views of teaser cards (a.teaser.card in .threecolumn / .fourcolumn: accessible-travel assistance cards, /fluege Travel ID / Parken am Terminal / Digitale Services, "This may also be of interest"). No carousel: cards in rows in the content width, stacked 40px apart on mobile, two per row from 768px, three from 1025px, 20px apart; consecutive grid blocks (one per source row) 64px apart. Same card as `article`, but images at their own aspect ratio, titles 20px to 24px bold 10px above the description, which sits at the bottom of the card. Text-only cards (no image; my-bookings login strip) have a #dcdcdc border, square corners, 40px padding (20px 10px below 768px), titles 20px above the text, two per row from 768px. Bold / italic links in a card stay buttons (as wide as the label, no 150px minimum; an outlined button spans the card below 768px), plain links are arrow CTAs.
- `four-up` (Carousel Cards (four-up)): a carousel of the same teaser cards with one card per view on mobile, two from 768px, four from 1025px (next card peeking into the page margin), arrows from 1025px, one dot per page of cards (boeing787 "Other Aircraft Types in our Fleet": 9 cards, 3 dots at 1440, 5 at 768, 9 on mobile). With `grid`: four cards per row instead of three (accessible-travel "Further information on travel and health").

- `authors` (Carousel Cards (four-up, authors)): Lufthansa Insights author slider ('Our Authors' on /de/en/articles/explore-flying, explore-the-world, authors pages). With `four-up`: the square portrait 10px inside the card, the author name (linked heading) LufthansaHead bold 20px to 24px with 20px above and below, the description LufthansaHead 16px to 18px; 24px from the cards to the dots, 93px below the block (/explore-flying 1440: cards 297x453, 'Explore more' 99px below the dots, as on live).

Video cards: a row whose cell holds a poster image and a link to an .mp4 file (settings marker as in columns-media, `{controls round-play-button}`) is a video card: the 16:9 poster with the 90px round play button, no border or text, played in place with controls. With `four-up` (Lufthansa video viewers in a multi-slide swiper, /articles/tags/munich 'Dive Deeper' six episodes): 297x167 cards at 1440 four per view + peek, dots 40px below the cards, 70px to the next heading, 53px below the text above from 768px.

The importer writes `grid` / `grid, four-up` / `four-up` for a.teaser.card column views and multi-slide swipers (heading linked to the card target, source heading level, h1/h2 card titles as h3; the hidden "Explore the aircraft" link text is not imported) and `grid` for the my-bookings login cards (title, text, bold link = yellow Login button, italic link = outlined "Enter booking code" button; that button opens a booking code dialog on live which the replica does not have, so it links to #booking-code).

## Universal Editor fields

N/A (Document Authoring project)
