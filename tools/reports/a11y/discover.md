# Discover Airlines: accessibility (brief 370)

Shared findings and how it was checked: [README](README.md).

Host: discover.turnsthe.page, at 390 and 1440. Pages:

- `/de/en/homepage`
- `/de/en/my-bookings/manage/customer-service/service-center`
- `/de/en/book/baggage/carry-on-baggage`

## Findings

| Finding | WCAG | Pages, widths | Status | Owner |
| --- | --- | --- | --- | --- |
| No skip links (www: navigation, main content, search, footer) | 2.4.1 | every page | fixed: www's wording in de, en, fr | lh-com shared code |
| Travellers panel stays open when the focus leaves it | 2.4.3 | homepage, both | fixed | lh-com shared code |
| Date fields' calendar stop without a ring | 2.4.7 | homepage, both | fixed | lh-com shared code |
| The baggage table scrolls in its box but is no Tab stop (`scrollable-region-focusable`) | 2.1.1 | carry-on baggage, 390 | fixed: a striped table that scrolls is a Tab stop with a ring, one that fits none | lh-com shared code (`blocks/table-striped`) |
| Card carousel dots too small and close (`carousel-cards-dot` x5) | 2.5.8 | homepage, 390 and 1440 | left as www (Group frontend bullets 8 px, 4 px margins) | www's design; the user's call (code: lh-com) |

## Otherwise

Service centre page: no violations. Header menu and flight search by keyboard: fine. The footer's language button (#ebebeb on #003e7b) is 8.9:1.
