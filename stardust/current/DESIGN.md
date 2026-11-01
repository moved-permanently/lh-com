# Lufthansa (lh-com): current design

Descriptive snapshot of the replica's design for the OF1 layer (the generative page `/of1`, its
templates and the CTA template). Source: lh-com's deployed tokens in `styles/styles.css` (`:root`),
which follow the Lufthansa design system, and the rendered preview of `/de/en/homepage`. Tokens as
data: `DESIGN.json` next to this file.

## Colour

- Deep blue `#05164d` for text, headings and dark surfaces; white backgrounds, light grey
  `#f5f5f5` for quiet sections.
- Yellow `#ffad00` (hover `#ffbd32`) for the main call to action, with deep blue text on it.
- Whale blue `#52627c` for secondary text and links; grey borders `#cccccc`.

## Type

- Headings: Lufthansa Head, bold, line height 1.1, fluid sizes (h1 36 to 48 px).
- Body: Lufthansa Text, 18 px copy, 16 and 14 px for controls and small print, line height 1.5.

## Shape and space

- Small radii: 4 px on buttons and inputs, 8 px on cards; light deep-blue shadows.
- Content up to 1440 px wide, side margins 10 to 88 px by breakpoint, 48 px between sections.

## Components

- Buttons: 50 px high, 4 px radius; primary yellow, secondary white with a deep blue border,
  accent deep blue with white text.
- Heroes: full-width photography of cabins, lounges and destinations with a text card.
- Cards: photo on top, heading and one or two lines of copy, a text link.

## Voice

Calm, precise and service-minded; premium without superlatives. The brand voice for generated copy
is the DA document `/of1/brand-voice`.
