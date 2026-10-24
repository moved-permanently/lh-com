# profile-tabs

Tabs of the bookings page ("Upcoming" / "Past"): live `maui-tab-control-responsive navigation-mode="deeplink"` on `/{cc}/{ll}/profile/bookinglist`; with option `content` the same tabs holding page content (info template, /onboard-delights).

## Authoring (Document Authoring)

Model: `standalone`

One row per tab: cell 1 the tab label, cell 2 the panel content (any content; on the bookings page the widget links of the gate and the app). An optional cell 3 sets the deep link id. Without it the id follows the position: first tab `upcoming`, second `past` (live uses these hashes in every language), further tabs the label as a class name.

| profile-tabs | |
| --- | --- |
| Upcoming | /widgets/lh-app/lh-app.html?app=login-gate<br>/widgets/lh-app/lh-app.html?app=my-trips&id=1 |
| Past | /widgets/lh-app/lh-app.html?app=login-gate<br>/widgets/lh-app/lh-app.html?app=past-trips&id=2 |

Widget links in the panels become widgets (`buildWidgetAutoBlocks`); the block loads them itself.

## Behaviour

- WAI-ARIA tabs: `role=tablist/tab/tabpanel`, the panel id is the deep link id, arrow keys, Home and End move between tabs.
- `#upcoming` / `#past` in the URL select a tab on load and on `hashchange`; selecting a tab writes its hash (`history.replaceState`).
- From 768px: tabs spread over the content width (64px, 18px labels, the selected one bold deep blue over a 4px bar on a 1px grey line), the panel 20px below.
- Below 768px: an accordion (bold 18px headers with a chevron between 1px grey lines), all closed unless the URL names a tab.

## Supported variations

| Variation | Option class |
| --- | --- |
| Tabs of page content (Lufthansa `.tabs.panelcontainer`: image, heading, text per tab; /de/en/onboard-delights "Fresh on board") | `content` |

Option `content`: the panel's image runs over the panel width with 40px to the heading below it, a paragraph ending in `{limited-width}` takes two thirds of the width from 1025px; from 768px the image starts 52px under the tab bar and the panel ends 7px under its last line; below 768px the first panel is open on load (as live), its image 23px under the header, 51px from the last line to the next header. The importer writes the live `navigation-id` as the deep link id (cell 3: `1`, `2`, `3`).

## Universal Editor fields

N/A (Document Authoring project)
