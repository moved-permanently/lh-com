# lufthansa.com baseline after the hub and video documents went live (brief 507)

Every lufthansa.com page lh-parity-002a-d and -003 hold (296, all published on lufthansa.turnsthe.page) at 1440 and 390,
the published page with the deployed code (2026-11-09, before this brief's commits; the 23 hub documents live since
21:20, the 22 video documents since 21:40), against the recordings (tools/parity/compare.js, the first 8,000 px). 592
page-widths. Runner: logs/b507/sweep-shard.sh (logs/b500/cap-pub.sh NOLOCAL=1), ranking logs/b507/rank.mjs. Owners as
the briefs name them (brief 497: ema-lufthansa for info, legal and form; app-entry, fleet, flight status ema-cashub).

## Per template

| Template | Owner | Page-widths | Median % | >= 20 % |
| --- | --- | --- | --- | --- |
| info | ema-lufthansa | 346 | 9.1 | 26 |
| insights | ema-adobe | 64 | 13.2 | 7 |
| legal | ema-lufthansa | 58 | 7.6 | 1 |
| campaign | ema-adobe | 42 | 14.5 | 1 |
| hub | ema-adobe | 32 | 8.9 | 3 |
| form | ema-lufthansa | 18 | 11.1 | 2 |
| fleet | ema-cashub | 16 | 17.7 | 1 |
| app-entry | ema-cashub | 12 | 11.3 | 3 |
| flight-status | ema-cashub | 2 | 12.8 | 0 |
| homepage | ema-adobe | 2 | 8.5 | 0 |

## What moved since brief 505's sweep (2 points or more: 29)

| Page | Template | Width | 505 | now |
| --- | --- | --- | --- | --- |
| /de/en/additional-services | hub | 1440 | 27.1 | 6.1 |
| /de/en/discover-lufthansa/new-onboard-experience | campaign | 1440 | 29.8 | 8.9 |
| /de/en/digital-self-services | hub | 390 | 27 | 9.1 |
| /de/en/discover-lufthansa/new-onboard-experience | campaign | 390 | 27.5 | 11.7 |
| /de/en/meetings-and-events | hub | 1440 | 24.5 | 10.2 |
| /de/en/book-and-manage/stopover | campaign | 1440 | 27.1 | 13.3 |
| /de/en/articles/highlights/all-it-takes-is-a-yes | insights | 1440 | 24 | 11.5 |
| /de/en/food-and-beverages | hub | 390 | 23.8 | 11.5 |
| /de/en/articles/tags/munich | insights | 1440 | 24 | 15 |
| /de/en/lufthansa-travel-classes | hub | 1440 | 12 | 3 |
| /de/en/food-and-beverages | hub | 1440 | 17.6 | 9 |
| /de/en/articles/highlights/allegris-premium-economy-san-diego | insights | 1440 | 23.4 | 15.8 |
| /de/en/lufthansa-travel-classes | hub | 390 | 14.5 | 7.8 |
| /de/en/articles/highlights | insights | 1440 | 9.2 | 2.5 |
| /de/en/articles/tags/munich | insights | 390 | 24.2 | 17.9 |
| /de/en/overview-special-request | hub | 1440 | 8.7 | 2.9 |
| /de/en/overview-special-request | hub | 390 | 24.1 | 18.4 |
| /de/en/baggage | hub | 1440 | 11.1 | 5.4 |
| /de/en/discover-lufthansa/take-off | campaign | 390 | 24.5 | 19.3 |
| /de/en/digital-self-services | hub | 1440 | 13.2 | 8.1 |
| /de/en/articles/tags/allegris | insights | 1440 | 28 | 23.2 |
| /de/en/articles/tags/allegris | insights | 390 | 24.5 | 19.8 |
| /de/en/additional-services | hub | 390 | 18.8 | 14.5 |
| /de/en/articles/highlights/allegris-premium-economy-san-diego | insights | 390 | 17.6 | 14.7 |
| /de/en/articles/highlights/all-it-takes-is-a-yes | insights | 390 | 17.8 | 15.3 |
| /de/en/100-years/crane | campaign | 1440 | 12.2 | 9.9 |
| /de/en/services-at-the-airport | hub | 1440 | 4 | 1.9 |
| /de/en/miles-and-more | hub | 390 | 12.5 | 14.6 |
| /de/en/meetings-and-events | hub | 390 | 8.9 | 12.7 |

## Fixed this brief (three, not ten)

- 0369cb9 (lh-com styles): Insights articles on phones, no section gap under the related articles that end the page: eat-see-do-algiers 20.0 -> 19.3 %, be-picky-frankfurt-insider-tips 17.6 -> 15.6 % (390); 1440 unchanged.
- fc1f4f7 (cards-teaser, theme token): a bold card CTA is a primary button where the theme asks for it: meetings-and-events 10.2 -> 9.0 % (1440); 390 12.7 -> 14.5 % (the partner logos, Columns Media, another owner).
- 142a2d2 (campaign importer): campaign pages of one AEM section get the hub's column view sections: drafts frankfurt-fair 16.9 -> 7.5 / 8.0 -> 7.1 %, most-significant-route 18.3 -> 10.5 / 9.2 -> 6.8 %; needs the re-import of tools/reports/parity-2026-11-08/reimport-507-campaign-lh-com.txt (8 documents); munich-fair excluded (worse with it).

The other worst rows of my templates have causes outside my files or in the data (the table below names each): a stale document (overview-manage), the recording's parallax (picture-perfect-austin), the stopover sub-pages and the Barcelona / Berlin articles' poi-map, the culinaryjourney micro-frontend, Columns Media's logo slider, explore-flying's index data, menu-on-board's font wrapping (www's fonts). No fix of mine would move them without a new document or another owner's block.

## The worst in my areas (campaign, hub, insights; with table-striped, video, footers, cards-icon, chips)

| Page | Template | Width | % | Cause / status |
| --- | --- | --- | --- | --- |
| /de/en/overview-manage | hub | 390 | 40.4 | DA's document is stale (the Check-in card's picture); the harness holds its re-import (the import only drops DA's own fixes) |
| /de/en/articles/explore-the-world/picture-perfect-austin | insights | 390 | 30.6 | capture: parallax pictures (www's crop follows the scroll position) |
| /de/en/airport-information | hub | 390 | 25.4 | one line of the intro more on www (narrower text), the cards within a few px each; no structural cause |
| /de/en/articles/tags/allegris | insights | 1440 | 23.2 | www's "Conditions" button opens an empty modal (not imported, +45px), the pagination's look, a link 12px closer to its picture (brief 505) |
| /de/en/articles/explore-the-world/picture-perfect-austin | insights | 1440 | 23 | capture: parallax pictures (www's crop follows the scroll position) |
| /de/en/articles/explore-the-world/a-perfect-day-barcelona-in-one-day | insights | 1440 | 21.4 | poi-map (www's Google map, ours OpenStreetMap; another owner's block) and the related cards (index data) |
| /de/en/articles/explore-the-world/be-picky-barcelona-insider-tips | insights | 390 | 21.2 | poi-map and the related cards (index data) |
| /de/en/articles/explore-flying | insights | 390 | 21.1 | the list shows other articles first (index data); the filters drawn as boxes, www's maui inputs as underlines with a "Categories" label (about 23px; listed, not fixed) |
| /de/en/overview-manage | hub | 1440 | 20.7 | DA's document is stale (the Check-in card's picture); the harness holds its re-import (the import only drops DA's own fixes) |
| /de/en/100-years | campaign | 390 | 20.1 | capture: the stage video's frame and www's font fallback; one -24px step |
| /de/en/articles/explore-the-world/eat-see-do-algiers | insights | 390 | 20 | fixed 0369cb9 (no section gap under the related articles on phones) -> 19.3 %; the rest: the related cards (index data) |
| /de/en/culinaryjourney | campaign | 390 | 19.9 | micro-frontend (the culinary app's own layout) |
| /de/en/100-years/history/menu-on-board | campaign | 390 | 19.8 | running text wraps differently (font metrics in the capture), no spacing step |
| /de/en/articles/tags/allegris | insights | 390 | 19.8 | www's "Conditions" button opens an empty modal (not imported, +45px), the pagination's look, a link 12px closer to its picture (brief 505) |
| /de/en/discover-lufthansa/take-off | campaign | 1440 | 19.6 | not diagnosed |
| /de/en/discover-lufthansa/take-off | campaign | 390 | 19.3 | not diagnosed |
| /de/en/articles/explore-the-world/what-i-learned-living-in-barcelona | insights | 390 | 19.1 | not diagnosed |
| /de/en/articles/explore-the-world/a-perfect-day-berlin-in-one-day | insights | 1440 | 18.6 | poi-map and the related cards (index data) |
| /de/en/overview-special-request | hub | 390 | 18.4 | not diagnosed |
| /de/en/100-years/destinations | campaign | 1440 | 18.3 | a cell heading with .limited-width keeps no width marker in a block (importer, brief 505) |
| /de/en/most-significant-route | campaign | 1440 | 18.3 | fixed 142a2d2, drafts 18.3 -> 10.5 / 9.2 -> 6.8 %; reimport-507-campaign-lh-com.txt |
| /de/en/100-years/campaigns | campaign | 390 | 18 | not diagnosed |
| /de/en/articles/tags/munich | insights | 390 | 17.9 | not diagnosed |
| /de/en/articles/explore-the-world/a-perfect-day-barcelona-in-one-day | insights | 390 | 17.6 | poi-map (www's Google map, ours OpenStreetMap; another owner's block) and the related cards (index data) |
| /de/en/articles/explore-the-world/be-picky-frankfurt-insider-tips | insights | 390 | 17.6 | fixed 0369cb9 -> 15.6 % |
| /de/en/book-and-manage/stopover/neuschwanstein | campaign | 1440 | 17.6 | poi-map: www's map in the two-thirds column, ours the full width; its tiles differ (Google / OpenStreetMap) |
| /de/en/book-and-manage/stopover/bayerischer-hof | campaign | 1440 | 17.5 | poi-map (as neuschwanstein) |
| /de/en/100-years/global-network | campaign | 390 | 17.5 | not diagnosed |
| /de/en/book-and-manage/stopover/zugspitze | campaign | 390 | 17.2 | poi-map (as neuschwanstein) |
| /de/en/frankfurt-fair | campaign | 1440 | 16.9 | fixed 142a2d2 (campaign pages of one AEM section get the hub's column view sections), drafts 16.9 -> 7.5 / 8.0 -> 7.1 %; DA's documents wait for reimport-507-campaign-lh-com.txt |

## Every page-width at 15 % or more, worst first

| Page | Template | Owner | Width | % | Height www / ours | Cause |
| --- | --- | --- | --- | --- | --- | --- |
| /de/en/prepare-for-your-trip/special-travel-needs/medical-travel-companions | info | ema-lufthansa | 390 | 44.3 | 2747/3547 | not diagnosed (owner) |
| /de/en/overview-manage | hub | ema-adobe | 390 | 40.4 | 4356/4532 | DA's document is stale (the Check-in card's picture); the harness holds its re-import (the import only drops DA's own fixes) |
| /de/en/online-check-in | app-entry | ema-cashub | 390 | 37.4 | 5650/4018 | not diagnosed (owner) |
| /content/lh/markets/de/en/during-your-trip/lounges/loungenet/muc-first-class-lounge | info | ema-lufthansa | 390 | 36.7 | 6129/6296 | not diagnosed (owner) |
| /content/lh/markets/de/en/during-your-trip/lounges/loungenet/fra-first-class-lounge-b | info | ema-lufthansa | 390 | 36.7 | 6129/6296 | not diagnosed (owner) |
| /de/en/economy-class | info | ema-lufthansa | 390 | 34.1 | 8000/8000 | not diagnosed (owner) |
| /de/en/schengen | info | ema-lufthansa | 1440 | 32.8 | 3112/3850 | not diagnosed (owner) |
| /content/lh/markets/de/en/during-your-trip/lounges/loungenet/muc-first-class-lounge | info | ema-lufthansa | 1440 | 32.2 | 4286/4662 | not diagnosed (owner) |
| /de/en/first-class-terminal | info | ema-lufthansa | 390 | 32.2 | 8000/8000 | not diagnosed (owner) |
| /de/en/traveltricks | info | ema-lufthansa | 390 | 32.2 | 4536/4319 | not diagnosed (owner) |
| /content/lh/markets/de/en/during-your-trip/lounges/loungenet/fra-first-class-lounge-b | info | ema-lufthansa | 1440 | 32.2 | 4286/4662 | not diagnosed (owner) |
| /de/en/shopping | info | ema-lufthansa | 390 | 31.9 | 8000/8000 | not diagnosed (owner) |
| /de/en/lufthansa-business-class-on-long-haul-routes | info | ema-lufthansa | 390 | 31.3 | 4467/4612 | not diagnosed (owner) |
| /de/en/articles/explore-the-world/picture-perfect-austin | insights | ema-adobe | 390 | 30.6 | 8000/8000 | capture: parallax pictures (www's crop follows the scroll position) |
| /de/en/feedback/feedbackai | form | ema-lufthansa | 1440 | 29.6 | 1027/900 | not diagnosed (owner) |
| /de/en/lufthansa-business-class-on-long-haul-routes | info | ema-lufthansa | 1440 | 29 | 3169/3306 | not diagnosed (owner) |
| /de/en/first-class | info | ema-lufthansa | 390 | 27.7 | 8000/8000 | not diagnosed (owner) |
| /de/en/my-logbook | app-entry | ema-cashub | 390 | 27.2 | 3445/3273 | not diagnosed (owner) |
| /de/en/tips-senior-travellers | info | ema-lufthansa | 1440 | 25.5 | 8000/8000 | not diagnosed (owner) |
| /de/en/airport-information | hub | ema-adobe | 390 | 25.4 | 5465/5517 | one line of the intro more on www (narrower text), the cards within a few px each; no structural cause |
| /de/en/feedback/feedbackai | form | ema-lufthansa | 390 | 24.8 | 1153/1031 | not diagnosed (owner) |
| /de/en/prepare-for-your-trip/travelling-with-children/planning-with-kids | info | ema-lufthansa | 390 | 24.5 | 4750/4510 | not diagnosed (owner) |
| /de/en/childrens-menus-on-board | info | ema-lufthansa | 390 | 24.2 | 5392/5314 | not diagnosed (owner) |
| /de/en/book-and-manage/flights/giftvoucher | info | ema-lufthansa | 390 | 24 | 6926/6716 | not diagnosed (owner) |
| /de/en/exclusive-charter | info | ema-lufthansa | 390 | 23.4 | 2705/2778 | not diagnosed (owner) |
| /de/en/economy-class | info | ema-lufthansa | 1440 | 23.2 | 8000/8000 | not diagnosed (owner) |
| /de/en/articles/tags/allegris | insights | ema-adobe | 1440 | 23.2 | 7492/7324 | www's "Conditions" button opens an empty modal (not imported, +45px), the pagination's look, a link 12px closer to its picture (brief 505) |
| /de/en/premium-economy-class | info | ema-lufthansa | 390 | 23.2 | 8000/8000 | not diagnosed (owner) |
| /de/en/articles/explore-the-world/picture-perfect-austin | insights | ema-adobe | 1440 | 23 | 7969/8000 | capture: parallax pictures (www's crop follows the scroll position) |
| /de/en/advance-seat-reservation | info | ema-lufthansa | 390 | 22.6 | 8000/8000 | not diagnosed (owner) |
| /de/en/during-your-trip/internet-overview | info | ema-lufthansa | 390 | 22.5 | 4671/4733 | not diagnosed (owner) |
| /de/en/entryprocesses | info | ema-lufthansa | 390 | 22.4 | 5147/5142 | not diagnosed (owner) |
| /de/en/discover-lufthansa/miles-and-more-credit-card | info | ema-lufthansa | 390 | 21.7 | 8000/8000 | not diagnosed (owner) |
| /de/en/articles/explore-the-world/a-perfect-day-barcelona-in-one-day | insights | ema-adobe | 1440 | 21.4 | 7608/7489 | poi-map (www's Google map, ours OpenStreetMap; another owner's block) and the related cards (index data) |
| /de/en/articles/explore-the-world/be-picky-barcelona-insider-tips | insights | ema-adobe | 390 | 21.2 | 7635/7746 | poi-map and the related cards (index data) |
| /de/en/articles/explore-flying | insights | ema-adobe | 390 | 21.1 | 6633/6792 | the list shows other articles first (index data); the filters drawn as boxes, www's maui inputs as underlines with a "Categories" label (about 23px; listed, not fixed) |
| /de/en/data-collection-canada | legal | ema-lufthansa | 1440 | 20.8 | 4277/3979 | not diagnosed (owner) |
| /de/en/my-logbook | app-entry | ema-cashub | 1440 | 20.8 | 3111/3014 | not diagnosed (owner) |
| /de/en/overview-manage | hub | ema-adobe | 1440 | 20.7 | 3284/3350 | DA's document is stale (the Check-in card's picture); the harness holds its re-import (the import only drops DA's own fixes) |
| /de/en/boeing787 | fleet | ema-cashub | 390 | 20.5 | 8000/8000 | not diagnosed (owner) |
| /de/en/traveltricks | info | ema-lufthansa | 1440 | 20.5 | 3772/3692 | not diagnosed (owner) |
| /de/en/first-class | info | ema-lufthansa | 1440 | 20.4 | 8000/8000 | not diagnosed (owner) |
| /de/en/100-years | campaign | ema-adobe | 390 | 20.1 | 8000/8000 | capture: the stage video's frame and www's font fallback; one -24px step |
| /de/en/articles/explore-the-world/eat-see-do-algiers | insights | ema-adobe | 390 | 20 | 8000/8000 | fixed 0369cb9 (no section gap under the related articles on phones) -> 19.3 %; the rest: the related cards (index data) |
| /de/en/culinaryjourney | campaign | ema-adobe | 390 | 19.9 | 1911/2045 | micro-frontend (the culinary app's own layout) |
| /de/en/business-class-on-short-and-medium-haul | info | ema-lufthansa | 390 | 19.8 | 3900/3958 | not diagnosed (owner) |
| /de/en/lufthansa-terminal-muenchen | info | ema-lufthansa | 390 | 19.8 | 6614/6374 | not diagnosed (owner) |
| /de/en/100-years/history/menu-on-board | campaign | ema-adobe | 390 | 19.8 | 8000/8000 | running text wraps differently (font metrics in the capture), no spacing step |
| /de/en/articles/tags/allegris | insights | ema-adobe | 390 | 19.8 | 7897/7785 | www's "Conditions" button opens an empty modal (not imported, +45px), the pagination's look, a link 12px closer to its picture (brief 505) |
| /de/en/green-fare | info | ema-lufthansa | 390 | 19.7 | 7325/6876 | not diagnosed (owner) |
| /de/en/discover-lufthansa/take-off | campaign | ema-adobe | 1440 | 19.6 | 4512/4578 | not diagnosed |
| /de/en/free2move | info | ema-lufthansa | 1440 | 19.4 | 3054/2917 | not diagnosed (owner) |
| /de/en/32n | fleet | ema-cashub | 390 | 19.3 | 6954/7113 | not diagnosed (owner) |
| /de/en/discover-lufthansa/take-off | campaign | ema-adobe | 390 | 19.3 | 6888/6846 | not diagnosed |
| /de/en/320 | fleet | ema-cashub | 390 | 19.3 | 6758/6930 | not diagnosed (owner) |
| /de/en/prepare-for-your-trip/entry-regulations/entering-schengen/entry-exit-system | info | ema-lufthansa | 390 | 19.3 | 8000/8000 | not diagnosed (owner) |
| /de/en/articles/explore-the-world/what-i-learned-living-in-barcelona | insights | ema-adobe | 390 | 19.1 | 8000/8000 | not diagnosed |
| /de/en/744 | fleet | ema-cashub | 390 | 19.1 | 3255/3479 | not diagnosed (owner) |
| /de/en/baggage-irregularities | info | ema-lufthansa | 390 | 19 | 5161/4865 | not diagnosed (owner) |
| /de/en/data-collection-canada | legal | ema-lufthansa | 390 | 18.9 | 5488/5379 | not diagnosed (owner) |
| /de/en/carry-on-baggage | info | ema-lufthansa | 1440 | 18.9 | 6601/6300 | not diagnosed (owner) |
| /de/en/32n | fleet | ema-cashub | 1440 | 18.8 | 6501/6671 | not diagnosed (owner) |
| /de/en/data-collection-usa | legal | ema-lufthansa | 390 | 18.7 | 7392/7102 | not diagnosed (owner) |
| /de/en/unterhaltung-an-bord | info | ema-lufthansa | 390 | 18.7 | 3681/3482 | not diagnosed (owner) |
| /de/en/articles/explore-the-world/a-perfect-day-berlin-in-one-day | insights | ema-adobe | 1440 | 18.6 | 8000/7975 | poi-map and the related cards (index data) |
| /de/en/premium-economy-class | info | ema-lufthansa | 1440 | 18.6 | 7074/7138 | not diagnosed (owner) |
| /de/en/unterhaltung-an-bord | info | ema-lufthansa | 1440 | 18.6 | 2960/3104 | not diagnosed (owner) |
| /de/en/overview-special-request | hub | ema-adobe | 390 | 18.4 | 3936/3909 | not diagnosed |
| /de/en/100-years/destinations | campaign | ema-adobe | 1440 | 18.3 | 8000/8000 | a cell heading with .limited-width keeps no width marker in a block (importer, brief 505) |
| /de/en/menus-on-long-haul-flights | info | ema-lufthansa | 390 | 18.3 | 4584/4678 | not diagnosed (owner) |
| /de/en/most-significant-route | campaign | ema-adobe | 1440 | 18.3 | 2583/2411 | fixed 142a2d2, drafts 18.3 -> 10.5 / 9.2 -> 6.8 %; reimport-507-campaign-lh-com.txt |
| /de/en/arrival-services | info | ema-lufthansa | 1440 | 18.2 | 3726/3854 | not diagnosed (owner) |
| /de/en/book-and-manage/additional-services/travel-insurances | info | ema-lufthansa | 1440 | 18.1 | 2769/2910 | not diagnosed (owner) |
| /de/en/320 | fleet | ema-cashub | 1440 | 18.1 | 6415/6610 | not diagnosed (owner) |
| /de/en/100-years/campaigns | campaign | ema-adobe | 390 | 18 | 8000/8000 | not diagnosed |
| /de/en/cancellations-and-refunds | info | ema-lufthansa | 390 | 18 | 3130/3070 | not diagnosed (owner) |
| /de/en/359 | fleet | ema-cashub | 390 | 17.9 | 3019/3234 | not diagnosed (owner) |
| /de/en/articles/tags/munich | insights | ema-adobe | 390 | 17.9 | 8000/8000 | not diagnosed |
| /de/en/during-your-trip/lhg-wifi | info | ema-lufthansa | 390 | 17.9 | 6043/6289 | not diagnosed (owner) |
| /de/en/lufthansa-am-flughafen-frankfurt | info | ema-lufthansa | 1440 | 17.9 | 4115/4350 | not diagnosed (owner) |
| /de/en/during-your-trip/lhg-wifi | info | ema-lufthansa | 1440 | 17.8 | 3979/4182 | not diagnosed (owner) |
| /de/en/359 | fleet | ema-cashub | 1440 | 17.7 | 3409/3694 | not diagnosed (owner) |
| /de/en/articles/explore-the-world/a-perfect-day-barcelona-in-one-day | insights | ema-adobe | 390 | 17.6 | 8000/8000 | poi-map (www's Google map, ours OpenStreetMap; another owner's block) and the related cards (index data) |
| /de/en/articles/explore-the-world/be-picky-frankfurt-insider-tips | insights | ema-adobe | 390 | 17.6 | 5101/5167 | fixed 0369cb9 -> 15.6 % |
| /de/en/book-and-manage/stopover/neuschwanstein | campaign | ema-adobe | 1440 | 17.6 | 2999/3098 | poi-map: www's map in the two-thirds column, ours the full width; its tiles differ (Google / OpenStreetMap) |
| /de/en/book-and-manage/stopover/bayerischer-hof | campaign | ema-adobe | 1440 | 17.5 | 2935/3026 | poi-map (as neuschwanstein) |
| /de/en/100-years/global-network | campaign | ema-adobe | 390 | 17.5 | 8000/8000 | not diagnosed |
| /de/en/book-and-manage/stopover/zugspitze | campaign | ema-adobe | 390 | 17.2 | 3991/4115 | poi-map (as neuschwanstein) |
| /de/en/exclusive-charter | info | ema-lufthansa | 1440 | 17.1 | 2095/2183 | not diagnosed (owner) |
| /de/en/medikamenten-transport | info | ema-lufthansa | 390 | 17 | 4154/4105 | not diagnosed (owner) |
| /de/en/book-and-manage/additional-services/travel-insurances | info | ema-lufthansa | 390 | 16.9 | 3488/3583 | not diagnosed (owner) |
| /de/en/boeing787 | fleet | ema-cashub | 1440 | 16.9 | 7544/7737 | not diagnosed (owner) |
| /de/en/frankfurt-fair | campaign | ema-adobe | 1440 | 16.9 | 3524/3279 | fixed 142a2d2 (campaign pages of one AEM section get the hub's column view sections), drafts 16.9 -> 7.5 / 8.0 -> 7.1 %; DA's documents wait for reimport-507-campaign-lh-com.txt |
| /de/en/articles/explore-the-world/eat-see-do-berlin | insights | ema-adobe | 390 | 16.9 | 8000/8000 | not diagnosed |
| /de/en/discover-lufthansa/lufthansa-fleet/351 | fleet | ema-cashub | 1440 | 16.9 | 7761/7633 | not diagnosed (owner) |
| /de/en/entryprocesses | info | ema-lufthansa | 1440 | 16.9 | 2779/2833 | not diagnosed (owner) |
| /de/en/articles/explore-the-world/on-the-scene-caspar-plautz-munich | insights | ema-adobe | 390 | 16.8 | 6746/6847 | not diagnosed |
| /de/en/lufthansa-guide-service | info | ema-lufthansa | 390 | 16.8 | 5471/5894 | not diagnosed (owner) |
| /de/en/first-class-terminal | info | ema-lufthansa | 1440 | 16.7 | 8000/8000 | not diagnosed (owner) |
| /de/en/feedback | form | ema-lufthansa | 390 | 16.6 | 3698/3476 | not diagnosed (owner) |
| /de/en/articles/explore-the-world | insights | ema-adobe | 390 | 16.6 | 8000/8000 | not diagnosed |
| /de/en/lufthansa-am-flughafen-frankfurt | info | ema-lufthansa | 390 | 16.6 | 6758/6604 | not diagnosed (owner) |
| /de/en/lh-rentalcar | info | ema-lufthansa | 390 | 16.5 | 3591/3472 | not diagnosed (owner) |
| /de/en/wheelchair-batteries | info | ema-lufthansa | 390 | 16.4 | 4738/4449 | not diagnosed (owner) |
| /de/en/100-years/cabin-design | campaign | ema-adobe | 390 | 16.2 | 8000/8000 | not diagnosed |
| /de/en/book-and-manage/rebook | info | ema-lufthansa | 1440 | 16.1 | 1860/1782 | not diagnosed (owner) |
| /de/en/lufthansa-aviation-group | info | ema-lufthansa | 1440 | 15.9 | 2750/2703 | not diagnosed (owner) |
| /de/en/farealert/best-price-alert | form | ema-lufthansa | 390 | 15.8 | 5363/5270 | not diagnosed (owner) |
| /de/en/articles/highlights/allegris-premium-economy-san-diego | insights | ema-adobe | 1440 | 15.8 | 6730/6819 | not diagnosed |
| /de/en/744 | fleet | ema-cashub | 1440 | 15.7 | 3319/3524 | not diagnosed (owner) |
| /de/en/common/seatreservation-condtions/seat-reservations | legal | ema-lufthansa | 390 | 15.7 | 4095/3951 | not diagnosed (owner) |
| /de/en/discover-lufthansa/lufthansa-fleet/351 | fleet | ema-cashub | 390 | 15.7 | 8000/8000 | not diagnosed (owner) |
| /de/en/100-years/campaigns | campaign | ema-adobe | 1440 | 15.6 | 8000/8000 | not diagnosed |
| /de/en/articles/explore-the-world/a-perfect-day-berlin-in-one-day | insights | ema-adobe | 390 | 15.5 | 8000/8000 | poi-map and the related cards (index data) |
| /de/en/book-and-manage/flights/wetlease-hub | info | ema-lufthansa | 390 | 15.5 | 3399/3346 | not diagnosed (owner) |
| /de/en/green-fare | info | ema-lufthansa | 1440 | 15.5 | 5691/5522 | not diagnosed (owner) |
| /de/en/data-collection-usa | legal | ema-lufthansa | 1440 | 15.4 | 5295/5076 | not diagnosed (owner) |
| /de/en/100-years/crane | campaign | ema-adobe | 390 | 15.4 | 8000/8000 | not diagnosed |
| /de/en/articles/explore-the-world | insights | ema-adobe | 1440 | 15.4 | 6344/6270 | not diagnosed |
| /de/en/tips-senior-travellers | info | ema-lufthansa | 390 | 15.4 | 8000/8000 | not diagnosed (owner) |
| /de/en/travelling-with-special-requirements | info | ema-lufthansa | 390 | 15.3 | 3926/3897 | not diagnosed (owner) |
| /de/en/articles/highlights/all-it-takes-is-a-yes | insights | ema-adobe | 390 | 15.3 | 7444/7473 | not diagnosed |
| /de/en/articles/explore-flying/essentials-future-of-flying | insights | ema-adobe | 390 | 15.3 | 5715/5891 | not diagnosed |
| /de/en/book-and-manage/rebook | info | ema-lufthansa | 390 | 15.2 | 2374/2343 | not diagnosed (owner) |
| /de/en/book-and-manage/stopover | campaign | ema-adobe | 390 | 15.2 | 8000/8000 | not diagnosed |
| /de/en/wheelchair-batteries | info | ema-lufthansa | 1440 | 15.1 | 3540/3300 | not diagnosed (owner) |
| /de/en/articles/explore-the-world/know-before-you-go-berlin | insights | ema-adobe | 390 | 15.1 | 7415/7490 | not diagnosed |
| /de/en/100-years/chronicle | campaign | ema-adobe | 1440 | 15 | 8000/8000 | not diagnosed |
| /de/en/support/feedback-and-contact-airlines | info | ema-lufthansa | 390 | 15 | 4183/3985 | not diagnosed (owner) |
| /de/en/articles/tags/munich | insights | ema-adobe | 1440 | 15 | 7421/7472 | not diagnosed |

## Pages without a recording (listed, not measured)

The hub template's documents and reimport-488 part B's video documents that lh-parity-002a-d / -003 don't hold (the
recorded ones, all de/en, are in the sweep above):

- hub: 68, recorded 16, without a recording 52
  - recorded: /de/en/baggage /de/en/additional-services /de/en/airport-information /de/en/digital-self-services /de/en/flights /de/en/food-and-beverages /de/en/lufthansa-travel-classes /de/en/meetings-and-events /de/en/miles-and-more /de/en/overview-flights /de/en/overview-manage /de/en/overview-special-request /de/en/overview-travel-information /de/en/services-at-the-airport /de/en/services-on-board /de/en/special-needs
  - without: /de/de/additional-services /at/de/additional-services /gb/en/additional-services /de/de/flughafeninformation /at/de/flughafeninformation /gb/en/airport-information /de/de/gepaeck /at/de/gepaeck /gb/en/baggage /de/de/digital-self-services /at/de/digital-self-services /gb/en/digital-self-services /de/de/fluege /at/de/fluege /gb/en/flights /de/de/speisen-und-getraenke /at/de/speisen-und-getraenke /gb/en/food-and-beverages /de/en/lounges /de/de/lounges /at/de/lounges /gb/en/lounges /de/de/lufthansa-reiseklassen /at/de/lufthansa-reiseklassen /gb/en/lufthansa-travel-classes /de/de/meetings-and-events /at/de/meetings-and-events /gb/en/meetings-and-events /de/de/miles-and-more /at/de/miles-and-more /gb/en/miles-and-more /de/de/overview-flights /at/de/overview-flights /gb/en/overview-flights /de/de/overview-manage /at/de/overview-manage /gb/en/overview-manage /de/de/overview-special-request /at/de/overview-special-request /gb/en/overview-special-request /de/de/overview-travel-information /at/de/overview-travel-information /gb/en/overview-travel-information /de/de/services-am-flughafen /at/de/services-am-flughafen /gb/en/services-at-the-airport /de/de/services-an-bord /at/de/services-an-bord /gb/en/services-on-board /de/de/betreuungsbedarf /at/de/betreuungsbedarf /gb/en/special-needs
- video (reimport-488 part B): 24, recorded 6, without a recording 18
  - recorded: /de/en/100-years/crane /de/en/100-years/destinations /de/en/articles/highlights/all-it-takes-is-a-yes /de/en/articles/highlights/allegris-premium-economy-san-diego /de/en/articles/tags/allegris /de/en/discover-lufthansa/new-onboard-experience
  - without: /de/de/100-years/crane /de/de/100-years/destinations /de/de/articles/highlights/all-it-takes-is-a-yes /de/de/articles/highlights/allegris-premium-economy-san-diego /de/de/articles/tags/allegris /de/de/discover-lufthansa/new-onboard-experience /at/de/100-years/crane /at/de/100-years/destinations /at/de/articles/highlights/all-it-takes-is-a-yes /at/de/articles/highlights/allegris-premium-economy-san-diego /at/de/articles/tags/allegris /at/de/discover-lufthansa/new-onboard-experience /gb/en/100-years/crane /gb/en/100-years/destinations /gb/en/articles/highlights/all-it-takes-is-a-yes /gb/en/articles/highlights/allegris-premium-economy-san-diego /gb/en/articles/tags/allegris /gb/en/discover-lufthansa/new-onboard-experience

