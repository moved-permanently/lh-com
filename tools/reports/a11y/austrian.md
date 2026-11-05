# Austrian Airlines: accessibility (brief 370)

Shared findings and how it was checked: [README](README.md).

Host: austrian.turnsthe.page, at 390 and 1440. Pages:

- `/at/en/homepage`
- `/at/en/contact`
- `/at/en/baggage`

## Findings

| Finding | WCAG | Pages, widths | Status | Owner |
| --- | --- | --- | --- | --- |
| No skip links (www: navigation, main content, search, footer) | 2.4.1 | every page | fixed: www's own wording in 10 languages ("… / Go to end of page") | lh-com shared code |
| Travellers panel stays open when the focus leaves it | 2.4.3 | homepage, both | fixed | lh-com shared code |
| Date fields' calendar stop without a ring | 2.4.7 | homepage, both | fixed | lh-com shared code |
| Card carousel dots too small and close (`carousel-cards-dot` x6) | 2.5.8 | homepage, 390 and 1440 | left as www (Group frontend bullets 8 px, 4 px margins) | www's design; the user's call (code: lh-com) |

## Otherwise

Contact and baggage pages: no violations. The header menu, the flight search and the alert strip (none showing on the day) by keyboard: fine. The alert strip's control colour (#4d4d4d, recorded from www) is 7.4:1.
