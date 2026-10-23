# cards-icon-text

Custom **cards** block. Purpose: transparent link cards with an icon left of a bold title and a short description.

## Authoring (Document Authoring)

Model: `standalone`

Single block table. Content: 2 columns, one row per card. Cell 1: icon (:icon-name: token, e.g. :alert:, or a small image). Cell 2: H3 title, description paragraph(s), link. The last link of the row makes the whole card clickable; if its text equals the title it is not repeated, otherwise its text is shown as a link line under the description. Cells may be merged or missing: the first icon/image is the icon, the rest is the body; a card without a link is not clickable. No label rows; all texts are authored.

## Supported variations

| Variation | Option class |
| --- | --- |
| Partner tiles (Lufthansa a.teaser.partner, /digital-self-services): 48px icon image left of a deep-blue title (LufthansaHead bold 20px to 24px) and a 16px description, both 51px from the card edge; equal columns 20px apart: 1 per row, 2 from 768px, 3 from 1025px (a source row of 2 tiles fills the first two columns) | `partner` |

## Universal Editor fields

N/A (Document Authoring project)
