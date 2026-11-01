# hero-card-overlay

Custom **hero** block. Purpose: promotion stage: full-bleed background image with a solid dark text card overlaid on the left (or on the right).

## Authoring (Document Authoring)

Model: `standalone`

Single block table. Content: 1 column. Row 1: background image. Row 2: optional eyebrow paragraph, heading (H1 or H2), optional text, CTA link(s). The first image anywhere is the background; everything else goes into the card, so cell order and count do not matter. CTA: a plain link is a navigation link with an arrow, an italic link an outlined (inverted) button, a bold link a primary button. Optional two-column row `Conditions | title + text`: the first paragraph (e.g. **Conditions**) becomes a small disclosure link under the CTA that opens the rest of the cell (the live card opens these terms in a dialog).

Optional two-column row `End time | <time>`: a countdown in the card (after the text, before the CTA), as www's main stage teaser counts down to its campaign's end (`promotionTeaser.linkModeConfig.campaignConfig`, `campaignType` running, `campaignEndTime`). The time as www writes it, `2026-11-01T23:59:00.000-05:00`, or with an offset (`2026-11-02T05:59+01:00`, `…Z`), or without one in the market's local time (`2026-11-02 05:59`, `02.11.2026 05:59`: Europe/Berlin on de pages, Europe/Vienna on at pages). Where lufthansa.com has no time zone for the market (e.g. Austrian's and ITA's `us/*` roots) write the offset: a local time gives no timer there. The countdown ticks every second; with a day or more left it shows days : hours : minutes, else hours : minutes : seconds, two digits each, with www's labels (`labels/countdown`: Days, Hours, Minutes, Seconds; built-in English and German copies where the label service doesn't answer). Once the end has passed the countdown is gone and the teaser stays as it is (www shows a link-mode teaser whatever its campaign's state). An empty or unreadable time, or a time already past: no timer, the card as without the row. The page's clock is `scripts/clock.js` (on preview hosts `?time-travel=2026-11-02T05:00` shows the countdown at that moment).

| hero-card-overlay | |
| --- | --- |
| *image* | |
| *eyebrow, heading, text, CTA* | |
| End time | 2026-11-01T23:59:00.000-05:00 |

The importer writes the promotion teaser of `.mainstageteaser`: `maui-button-link` CTAs as buttons (type secondary: italic), the `termsandcondition` link label with `promotionTeaser.termsAndConditions` (headline + text) as the Conditions row, the variant `right` for `.mst-card.align-self-end` (`promotionTeaser.alignment` right), `light` for `.mst-card.non-inverted` (`promotionTeaser.isInverted` false) and `no mobile image` for `promotionTeaser.displayImageOnMobile` false.

## Supported variations

### right ("Hero Card Overlay (right)")

From 1025px the card sits on the right edge of the content column (gb/en ski campaign: x762-1352 at 1440) instead of the left. Below 1025px the card is under the image as in the default.

### light ("Hero Card Overlay (light)")

White card with dark blue (#05164d) eyebrow, heading and text, and normal (not inverted) blue links, as the live `.mst-card.non-inverted` (at/de homepage Starlink teaser). Combines with `right`.

## Universal Editor fields

N/A (Document Authoring project)
