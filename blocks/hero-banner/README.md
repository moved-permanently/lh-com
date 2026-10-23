# hero-banner

Custom **hero** block. Purpose: full-bleed row of expanding image panes, one per topic (travel class), the active pane wide with a large headline, a short text and a button, the others narrow with their label only.

## Authoring (Document Authoring)

Model: `standalone`

Single block table. Content: one row per pane. Cell 1: image. Cell 2: H2 tab label (shown at the bottom left of every pane, the button that opens it), H3 headline, optional text paragraph(s), link as the last paragraph (the button). Cells may be merged or missing: the first image of the row is the pane image; with two or more headings the first is the label and the next the headline; with one heading it is the headline and the label; a pane without a link has no button. Optional config row `Overlay | #6F625A`: the colour multiplied onto the images (default #6F625A; Lufthansa uses it on /de/de/speisen-und-getraenke and /de/de/lufthansa-reiseklassen). No label rows; all texts are authored.

| hero-banner | |
| --- | --- |
| (image) | ## First Class ### Lufthansa First Class Maximale Privatsphäre – exklusiver Service. *[Luxus entdecken](/de/de/first-class)* |
| (image) | ## Business Class ### Lufthansa Business Class … |
| Overlay | #6F625A |

## Layout

- Full-bleed (the layout width, scrollbar excluded). Height 100vh within 60vh to 90vh (85vh from 1025px, 80vh from 1281px): 720px high at 1440x900.
- From 768px panes side by side: the active pane takes 4 (5 from 1025px) shares, the others 1 each (1440: 890 / 178px; 768: 430 / 108px). Below 768px the panes are stacked, the active one 5 shares high (390: 506 / 101px).
- The first pane is active. Clicking a pane or its label, or hovering it with a mouse, makes it active (0.5s transition); its headline, text and button fade in.
- Active pane: headline LufthansaHead bold white, 36px to 48px on a 50px line, 100px / 100px from 1025px, 35vw wide from 1281px; text bold 20px to 24px; white outlined button. Content 50px from the left (48px below 768px), 60px from the top (80px at 768px, 50px below).
- Labels LufthansaHead light 20px to 24px, white, 50px from the left, 40px (30px at 768px, 10px below) from the bottom.

## Supported variations

No variations.

## Universal Editor fields

N/A (Document Authoring project)
