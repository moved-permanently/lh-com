# ITA Airways: accessibility (brief 370)

Shared findings and how it was checked: [README](README.md).

Host: ita.turnsthe.page, at 390 and 1440. Pages:

- `/it/en/homepage`
- `/it/en/support/utilities/contact`
- `/it/en/book-and-prepare/travel-information/at-the-airport`

## Findings

| Finding | WCAG | Pages, widths | Status | Owner |
| --- | --- | --- | --- | --- |
| No skip links (www: navigation, main content, search, footer) | 2.4.1 | every page | fixed: www's wording in 9 languages | lh-com shared code |
| Travellers panel stays open when the focus leaves it | 2.4.3 | homepage, both | fixed | lh-com shared code |
| Date fields' calendar stop without a ring | 2.4.7 | homepage, both | fixed | lh-com shared code |
| Alert strip pager "1/4" #0171cf on the red tint #fbeded: 4.32:1 (on its grey 4.52) | 1.4.3 | homepage, both | fixed: the controls ITA's link hover blue #01569d (6.5:1), hover its dark blue. The old colour was the theme's guess (no recorded ITA CSS) | lh-com shared code (`blocks/flash-teaser/flash-teaser.css`) |
| Footer language button #ebebeb on ITA blue: 4.13:1 | 1.4.3 | all three pages, both | fixed: white (4.92:1), as the rest of ITA's footer | lh-com (`styles/themes/ita.css`) |
| Alert strip previous / next chevrons 24 × 18, stacked | 2.5.8 | homepage, 1440 | left as www: the strip's stacked 18 px chevrons are www's message center (recorded on lufthansa.com); ITA's own www not readable (403) | www's design; the user's call (code: lh-com) |
| Card carousel dots too small and close (`carousel-cards-dot` x6 to 8) | 2.5.8 | homepage, 390 and 1440 | left as www (Group frontend bullets 8 px, 4 px margins) | www's design; the user's call (code: lh-com) |

## Otherwise

Contact and airport pages: only the footer finding, fixed. The alert strip by keyboard: Next moves 1/4 to 2/4, the buttons have rings.
