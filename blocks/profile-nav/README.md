# profile-nav

Sub-navigation of the profile pages (Overview, Bookings, Profile, Miles & More): live `maui-sub-navigation` between header and content on `/{cc}/{ll}/profile/travel-cockpit`, `bookinglist`, `my-account` and `account-statement`.

## Authoring (Document Authoring)

Model: `standalone`

One block with one cell holding a list of links, one per tab, in tab order. The tab whose link points at the current page is the active one (path compared without `.html` and trailing slash), so all four pages carry the same block. Put the block alone in the first section of the page.

| profile-nav |
| --- |
| • [Overview](/de/en/profile/travel-cockpit) • [Bookings](/de/en/profile/bookinglist) • [Profile](/de/en/profile/my-account) • [Miles & More](/de/en/profile/account-statement) |

## Layout

- Full-width grey bar (`--lh-grey-1`) directly under the header; the next section starts 25px below it (20px below 1024px).
- From 1024px: tabs in the content column, 20px padding, 18px light grey labels; the active tab bold deep blue over a 4px deep blue bar (`aria-current="page"`).
- Below 1024px: a 49px button with the active tab's label and a chevron; it opens the tabs as a list over the content (48px rows, the current page marble blue). Escape or a click outside closes it.

## Supported variations

No variations.

## Universal Editor fields

N/A (Document Authoring project)
