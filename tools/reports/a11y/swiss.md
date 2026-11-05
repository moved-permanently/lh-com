# SWISS: accessibility (brief 370)

Shared findings and how it was checked: [README](README.md).

Host: swiss.turnsthe.page, at 390 and 1440. Pages:

- `/ch/en/homepage`
- `/ch/en/customer-support/contact-us`
- `/ch/en/prepare/baggage`

## Findings

| Finding | WCAG | Pages, widths | Status | Owner |
| --- | --- | --- | --- | --- |
| No skip links (www: navigation, main content, search, footer) | 2.4.1 | every page | fixed: www's wording in 11 languages ("Go to navigation / Go to main content / Go to footer"; kr/ko in English as www) | lh-com shared code |
| Travellers panel stays open when the focus leaves it | 2.4.3 | homepage, both | fixed | lh-com shared code |
| Date fields' calendar stop without a ring | 2.4.7 | homepage, both | fixed | lh-com shared code |
| Card carousel dots too small and close (`carousel-cards-dot` x6) | 2.5.8 | homepage, 390 and 1440 | left as www (Group frontend bullets 8 px, 4 px margins) | www's design; the user's call (code: lh-com) |

## Otherwise

Contact and baggage pages: no violations at either width. Header menu, flight search, the alert strip's link: by keyboard, with rings. The header loads about 5 s after the page (after the stage video), so the first Tab stops land on the alert strip and the flight search until then. That is the page's load order, not a finding.
