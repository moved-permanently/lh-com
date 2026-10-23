# profile-tabs

Tabs of the bookings page ("Upcoming" / "Past"): live `maui-tab-control-responsive navigation-mode="deeplink"` on `/{cc}/{ll}/profile/bookinglist`.

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

No variations.

## Universal Editor fields

N/A (Document Authoring project)
