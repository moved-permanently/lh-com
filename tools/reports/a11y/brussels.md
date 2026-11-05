# Brussels Airlines: accessibility (brief 370)

Shared findings and how it was checked: [README](README.md).

Host: brussels.turnsthe.page, at 390 and 1440. Pages:

- `/be/en/homepage`
- `/be/en/contact`
- `/be/en/articles/lyon`

## Findings

| Finding | WCAG | Pages, widths | Status | Owner |
| --- | --- | --- | --- | --- |
| No skip links (www: navigation, main content, search, footer) | 2.4.1 | every page | fixed: www's wording in 6 languages | lh-com shared code |
| Travellers panel stays open when the focus leaves it | 2.4.3 | homepage, both | fixed | lh-com shared code |
| Date fields' calendar stop without a ring | 2.4.7 | homepage, both | fixed | lh-com shared code |
| Image carousel: slides `li role=group` in a `ul` (`list` x6) | 1.3.1 | Lyon article, both | fixed: track and slides are `div`s, the dots stay a list | lh-com shared code (`blocks/carousel-images`) |
| Image carousel track scrolls (arrow keys) but is no Tab stop (`scrollable-region-focusable` x6) | 2.1.1 | Lyon article, both | fixed: the track is a Tab stop with a ring | lh-com shared code |
| Image carousel dots (`carousel-images-dot` x30) | 2.5.8 | Lyon article, both | left as www (the same Group swiper bullets) | www's design; the user's call (code: lh-com) |
| Alert strip controls #e5002b: 4.41:1 on its grey, 4.22 on its red tint (no alert on the day, so axe saw none) | 1.4.3 | any page with an alert | fixed: Brussels' link hover red #ac0020, hover its dark grey | lh-com shared code (`blocks/flash-teaser/flash-teaser.css`) |
| Card carousel dots too small and close (`carousel-cards-dot` x6) | 2.5.8 | homepage, 390 and 1440 | left as www (Group frontend bullets 8 px, 4 px margins) | www's design; the user's call (code: lh-com) |

## Otherwise

Contact page: no violations. Header menu and flight search by keyboard: fine.
