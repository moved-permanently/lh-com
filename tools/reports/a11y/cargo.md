# Lufthansa Cargo: accessibility (brief 370)

Shared findings and how it was checked: [README](README.md).

Host: cargo.turnsthe.page, at 390 and 1440. Pages:

- `/en/home`
- `/en/contact-us`
- `/en/add-on-services/insurance`

## Findings

| Finding | WCAG | Pages, widths | Status | Owner |
| --- | --- | --- | --- | --- |
| Card carousel dots too small and close (`carousel-cards-dot` x3) | 2.5.8 | homepage, 390 | left as www (Group frontend bullets 8 px, 4 px margins) | www's design; the user's call (code: lh-com) |

## Otherwise

Contact and insurance pages: no violations. Header menu by keyboard: fine. No flight search and no alert strip. **No skip links: www.lufthansa-cargo.com has none (its 404 captures), so the replica has none either.**
