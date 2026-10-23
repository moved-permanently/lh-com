# hero-card-overlay

Custom **hero** block. Purpose: promotion stage: full-bleed background image with a solid dark text card overlaid on the left (or on the right).

## Authoring (Document Authoring)

Model: `standalone`

Single block table. Content: 1 column. Row 1: background image. Row 2: optional eyebrow paragraph, heading (H1 or H2), optional text, CTA link(s). The first image anywhere is the background; everything else goes into the card, so cell order and count do not matter. CTA: a plain link is a navigation link with an arrow, an italic link an outlined (inverted) button, a bold link a primary button. Optional two-column row `Conditions | title + text`: the first paragraph (e.g. **Conditions**) becomes a small disclosure link under the CTA that opens the rest of the cell (the live card opens these terms in a dialog).

The importer writes the promotion teaser of `.mainstageteaser`: `maui-button-link` CTAs as buttons (type secondary: italic), the `termsandcondition` link label with `promotionTeaser.termsAndConditions` (headline + text) as the Conditions row, the variant `right` for `.mst-card.align-self-end` (`promotionTeaser.alignment` right), `light` for `.mst-card.non-inverted` (`promotionTeaser.isInverted` false) and `no mobile image` for `promotionTeaser.displayImageOnMobile` false.

## Supported variations

### right ("Hero Card Overlay (right)")

From 1025px the card sits on the right edge of the content column (gb/en ski campaign: x762-1352 at 1440) instead of the left. Below 1025px the card is under the image as in the default.

### light ("Hero Card Overlay (light)")

White card with dark blue (#05164d) eyebrow, heading and text, and normal (not inverted) blue links, as the live `.mst-card.non-inverted` (at/de homepage Starlink teaser). Combines with `right`.

## Universal Editor fields

N/A (Document Authoring project)
