# lufthansa.com re-check against lh-parity-002a-d and -003 (brief 505)

Every lufthansa.com page lh-parity-002a-d and -003 hold (296 pages, all published on lufthansa.turnsthe.page), the
published page with the code deployed on 2026-11-08 at 16:4x UTC (before this brief's commits), at 1440 and 390,
against the parity captures (tools/parity/compare.js, the first 8,000 px). 592 page-widths. Owners as the briefs name
them (brief 497: ema-lufthansa for lufthansa.com's info, legal and form templates; app-entry and fleet ema-cashub as in
sweep-lh-swiss.md). Runner:
logs/b505/sweep-shard.sh (logs/b500/cap-pub.sh NOLOCAL=1), ranking logs/b505/rank.mjs. The figures after a fix come from
the working copy's code on the same published documents (or the importer's draft where DA's document waits for a
re-import, marked so).

## Per template

| Template | Owner | Page-widths | Median % | >= 20 % |
| --- | --- | --- | --- | --- |
| info | ema-lufthansa | 346 | 9.1 | 26 |
| insights | ema-adobe | 64 | 13.4 | 11 |
| legal | ema-lufthansa | 58 | 7.6 | 1 |
| campaign | ema-adobe | 42 | 15.2 | 5 |
| hub | ema-adobe | 32 | 11.9 | 8 |
| form | ema-lufthansa | 18 | 11.1 | 2 |
| fleet | ema-cashub | 16 | 17.7 | 1 |
| app-entry | ema-cashub | 12 | 11.3 | 3 |
| flight-status | ema-cashub | 2 | 12.8 | 0 |
| homepage | ema-adobe | 2 | 8.5 | 0 |

## The worst in my areas (campaign, hub, insights; with table-striped, video, footers, cards-icon, chips)

| Page | Template | Width | % | Cause / status |
| --- | --- | --- | --- | --- |
| /de/en/overview-manage | hub | 390 | 40.4 | DA's document is stale (the Check-in card's picture); reimport-497 part 2 (its 085 draft 19.6 / 20.2 %) |
| /de/en/articles/explore-the-world/picture-perfect-austin | insights | 390 | 30.6 | capture: parallax pictures (www's crop follows the scroll position); drift under 20px |
| /de/en/discover-lufthansa/new-onboard-experience | campaign | 1440 | 29.8 | DA's document predates briefs 484-500 (draft 8.9 / 11.7 %): re-import (reimport-484/488 lists) |
| /de/en/articles/tags/allegris | insights | 1440 | 28 | tag chips fixed (3b22ecc, 34.3 -> 28.0); left: www's "Conditions" button opens an empty modal (not imported, +45px), the pagination's look, a link 12px closer to its picture |
| /de/en/discover-lufthansa/new-onboard-experience | campaign | 390 | 27.5 | DA's document predates briefs 484-500 (draft 8.9 / 11.7 %): re-import (reimport-484/488 lists) |
| /de/en/additional-services | hub | 1440 | 27.1 | fixed in code (9c5d045); re-imported (049e070, previewed, not published): preview 6.1 / 14.5 % |
| /de/en/book-and-manage/stopover | campaign | 1440 | 27.1 | fixed 87e11df: the step cards without the column view's 3.2rem -> 13.3 % |
| /de/en/digital-self-services | hub | 390 | 27 | fixed in code (c870ad7, bd5d03c); the harness re-imported it (049e070, previewed, not published): preview 8.1 / 9.1 % |
| /de/en/airport-information | hub | 390 | 25.4 | intro to the first card picture 8px short (spacious cards; overview-travel-information measures right) |
| /de/en/discover-lufthansa/take-off | campaign | 390 | 24.5 | fixed edd5d2e (intro picture 4rem) -> 19.3 %; earlier 1615085 (rows) |
| /de/en/meetings-and-events | hub | 1440 | 24.5 | hub switch (2416546); re-imported (049e070, previewed, not published): preview 10.2 / 12.7 % |
| /de/en/articles/tags/allegris | insights | 390 | 24.5 | tag chips fixed (3b22ecc, 34.3 -> 28.0); left: www's "Conditions" button opens an empty modal (not imported, +45px), the pagination's look, a link 12px closer to its picture |
| /de/en/articles/tags/munich | insights | 390 | 24.2 | fixed 4d620d5 (24px before the grey band) -> 15.0 / 17.9 %; title: www's "Munich&nbsp;-&nbsp;a", the import writes plain spaces (helix-importer's conversion, every template) |
| /de/en/overview-special-request | hub | 390 | 24.1 | fixed eea5da7: h2 card titles next to h3 cards drawn 22px (www heading-medium) -> 18.4 % |
| /de/en/articles/highlights/all-it-takes-is-a-yes | insights | 1440 | 24 | DA's document predates brief 488 (draft 11.5 / 15.3 %): re-import (reimport-488) |
| /de/en/articles/tags/munich | insights | 1440 | 24 | fixed 4d620d5 (24px before the grey band) -> 15.0 / 17.9 %; title: www's "Munich&nbsp;-&nbsp;a", the import writes plain spaces (helix-importer's conversion, every template) |
| /de/en/food-and-beverages | hub | 390 | 23.8 | hub switch; re-imported (049e070, previewed): preview 8.7 / 11.5 %; 099171e (cards ending a section, 32px under): 9.0 % at 1440 (the step -32 -> -8px, an earlier +51/+19px surplus no longer compensated) |
| /de/en/articles/explore-the-world/picture-perfect-austin | insights | 1440 | 23.4 | capture: parallax pictures (www's crop follows the scroll position); drift under 20px |
| /de/en/articles/highlights/allegris-premium-economy-san-diego | insights | 1440 | 23.4 | DA's document predates brief 488 (video size; draft 15.8 / 14.7 %): re-import (reimport-488 part B) |
| /de/en/articles/explore-the-world/a-perfect-day-barcelona-in-one-day | insights | 1440 | 21.4 | not diagnosed |
| /de/en/articles/explore-the-world/be-picky-barcelona-insider-tips | insights | 390 | 21.2 | not diagnosed |
| /de/en/articles/explore-flying | insights | 390 | 21.1 | not diagnosed |
| /de/en/overview-manage | hub | 1440 | 20.7 | DA's document is stale (the Check-in card's picture); reimport-497 part 2 (its 085 draft 19.6 / 20.2 %) |
| /de/en/100-years | campaign | 390 | 20.1 | capture: the stage video's frame and www's font fallback (Arial) in the capture; one -24px step |
| /de/en/culinaryjourney | campaign | 390 | 19.9 | micro-frontend (the culinary app's own layout) |
| /de/en/100-years/history/menu-on-board | campaign | 390 | 19.8 | not diagnosed |
| /de/en/articles/explore-the-world/eat-see-do-algiers | insights | 390 | 19.7 | not diagnosed |
| /de/en/discover-lufthansa/take-off | campaign | 1440 | 19.6 | not diagnosed |
| /de/en/articles/explore-the-world/what-i-learned-living-in-barcelona | insights | 390 | 19.1 | not diagnosed |
| /de/en/additional-services | hub | 390 | 18.8 | fixed in code (9c5d045); re-imported (049e070, previewed, not published): preview 6.1 / 14.5 % |

## Every page-width at 15 % or more, worst first

| Page | Template | Owner | Width | % | Height www / ours | Cause |
| --- | --- | --- | --- | --- | --- | --- |
| /de/en/prepare-for-your-trip/special-travel-needs/medical-travel-companions | info | ema-lufthansa | 390 | 44.3 | 2747/3547 | not diagnosed (owner) |
| /de/en/overview-manage | hub | ema-adobe | 390 | 40.4 | 4356/4532 | DA's document is stale (the Check-in card's picture); reimport-497 part 2 (its 085 draft 19.6 / 20.2 %) |
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
| /de/en/articles/explore-the-world/picture-perfect-austin | insights | ema-adobe | 390 | 30.6 | 8000/8000 | capture: parallax pictures (www's crop follows the scroll position); drift under 20px |
| /de/en/discover-lufthansa/new-onboard-experience | campaign | ema-adobe | 1440 | 29.8 | 8000/8000 | DA's document predates briefs 484-500 (draft 8.9 / 11.7 %): re-import (reimport-484/488 lists) |
| /de/en/feedback/feedbackai | form | ema-lufthansa | 1440 | 29.6 | 1027/900 | not diagnosed (owner) |
| /de/en/lufthansa-business-class-on-long-haul-routes | info | ema-lufthansa | 1440 | 29 | 3169/3306 | not diagnosed (owner) |
| /de/en/articles/tags/allegris | insights | ema-adobe | 1440 | 28 | 7492/7308 | tag chips fixed (3b22ecc, 34.3 -> 28.0); left: www's "Conditions" button opens an empty modal (not imported, +45px), the pagination's look, a link 12px closer to its picture |
| /de/en/first-class | info | ema-lufthansa | 390 | 27.7 | 8000/8000 | not diagnosed (owner) |
| /de/en/discover-lufthansa/new-onboard-experience | campaign | ema-adobe | 390 | 27.5 | 8000/8000 | DA's document predates briefs 484-500 (draft 8.9 / 11.7 %): re-import (reimport-484/488 lists) |
| /de/en/my-logbook | app-entry | ema-cashub | 390 | 27.2 | 3445/3273 | not diagnosed (owner) |
| /de/en/additional-services | hub | ema-adobe | 1440 | 27.1 | 6773/6630 | fixed in code (9c5d045); re-imported (049e070, previewed, not published): preview 6.1 / 14.5 % |
| /de/en/book-and-manage/stopover | campaign | ema-adobe | 1440 | 27.1 | 8000/8000 | fixed 87e11df: the step cards without the column view's 3.2rem -> 13.3 % |
| /de/en/digital-self-services | hub | ema-adobe | 390 | 27 | 5489/6091 | fixed in code (c870ad7, bd5d03c); the harness re-imported it (049e070, previewed, not published): preview 8.1 / 9.1 % |
| /de/en/tips-senior-travellers | info | ema-lufthansa | 1440 | 25.5 | 8000/8000 | not diagnosed (owner) |
| /de/en/airport-information | hub | ema-adobe | 390 | 25.4 | 5465/5517 | intro to the first card picture 8px short (spacious cards; overview-travel-information measures right) |
| /de/en/feedback/feedbackai | form | ema-lufthansa | 390 | 24.8 | 1153/1031 | not diagnosed (owner) |
| /de/en/discover-lufthansa/take-off | campaign | ema-adobe | 390 | 24.5 | 6888/6830 | fixed edd5d2e (intro picture 4rem) -> 19.3 %; earlier 1615085 (rows) |
| /de/en/meetings-and-events | hub | ema-adobe | 1440 | 24.5 | 3534/3131 | hub switch (2416546); re-imported (049e070, previewed, not published): preview 10.2 / 12.7 % |
| /de/en/articles/tags/allegris | insights | ema-adobe | 390 | 24.5 | 7897/7769 | tag chips fixed (3b22ecc, 34.3 -> 28.0); left: www's "Conditions" button opens an empty modal (not imported, +45px), the pagination's look, a link 12px closer to its picture |
| /de/en/prepare-for-your-trip/travelling-with-children/planning-with-kids | info | ema-lufthansa | 390 | 24.5 | 4750/4510 | not diagnosed (owner) |
| /de/en/childrens-menus-on-board | info | ema-lufthansa | 390 | 24.2 | 5392/5314 | not diagnosed (owner) |
| /de/en/articles/tags/munich | insights | ema-adobe | 390 | 24.2 | 8000/8000 | fixed 4d620d5 (24px before the grey band) -> 15.0 / 17.9 %; title: www's "Munich&nbsp;-&nbsp;a", the import writes plain spaces (helix-importer's conversion, every template) |
| /de/en/overview-special-request | hub | ema-adobe | 390 | 24.1 | 3936/3867 | fixed eea5da7: h2 card titles next to h3 cards drawn 22px (www heading-medium) -> 18.4 % |
| /de/en/articles/highlights/all-it-takes-is-a-yes | insights | ema-adobe | 1440 | 24 | 6737/6657 | DA's document predates brief 488 (draft 11.5 / 15.3 %): re-import (reimport-488) |
| /de/en/book-and-manage/flights/giftvoucher | info | ema-lufthansa | 390 | 24 | 6926/6716 | not diagnosed (owner) |
| /de/en/articles/tags/munich | insights | ema-adobe | 1440 | 24 | 7421/7544 | fixed 4d620d5 (24px before the grey band) -> 15.0 / 17.9 %; title: www's "Munich&nbsp;-&nbsp;a", the import writes plain spaces (helix-importer's conversion, every template) |
| /de/en/food-and-beverages | hub | ema-adobe | 390 | 23.8 | 6683/6548 | hub switch; re-imported (049e070, previewed): preview 8.7 / 11.5 %; 099171e (cards ending a section, 32px under): 9.0 % at 1440 (the step -32 -> -8px, an earlier +51/+19px surplus no longer compensated) |
| /de/en/articles/explore-the-world/picture-perfect-austin | insights | ema-adobe | 1440 | 23.4 | 7969/8000 | capture: parallax pictures (www's crop follows the scroll position); drift under 20px |
| /de/en/articles/highlights/allegris-premium-economy-san-diego | insights | ema-adobe | 1440 | 23.4 | 6730/6678 | DA's document predates brief 488 (video size; draft 15.8 / 14.7 %): re-import (reimport-488 part B) |
| /de/en/exclusive-charter | info | ema-lufthansa | 390 | 23.4 | 2705/2778 | not diagnosed (owner) |
| /de/en/economy-class | info | ema-lufthansa | 1440 | 23.2 | 8000/8000 | not diagnosed (owner) |
| /de/en/premium-economy-class | info | ema-lufthansa | 390 | 23.2 | 8000/8000 | not diagnosed (owner) |
| /de/en/advance-seat-reservation | info | ema-lufthansa | 390 | 22.6 | 8000/8000 | not diagnosed (owner) |
| /de/en/during-your-trip/internet-overview | info | ema-lufthansa | 390 | 22.5 | 4671/4733 | not diagnosed (owner) |
| /de/en/entryprocesses | info | ema-lufthansa | 390 | 22.4 | 5147/5142 | not diagnosed (owner) |
| /de/en/discover-lufthansa/miles-and-more-credit-card | info | ema-lufthansa | 390 | 21.7 | 8000/8000 | not diagnosed (owner) |
| /de/en/articles/explore-the-world/a-perfect-day-barcelona-in-one-day | insights | ema-adobe | 1440 | 21.4 | 7608/7489 | not diagnosed |
| /de/en/articles/explore-the-world/be-picky-barcelona-insider-tips | insights | ema-adobe | 390 | 21.2 | 7635/7746 | not diagnosed |
| /de/en/articles/explore-flying | insights | ema-adobe | 390 | 21.1 | 6633/6792 | not diagnosed |
| /de/en/data-collection-canada | legal | ema-lufthansa | 1440 | 20.8 | 4277/3979 | not diagnosed (owner) |
| /de/en/my-logbook | app-entry | ema-cashub | 1440 | 20.8 | 3111/3014 | not diagnosed (owner) |
| /de/en/overview-manage | hub | ema-adobe | 1440 | 20.7 | 3284/3350 | DA's document is stale (the Check-in card's picture); reimport-497 part 2 (its 085 draft 19.6 / 20.2 %) |
| /de/en/boeing787 | fleet | ema-cashub | 390 | 20.5 | 8000/8000 | not diagnosed (owner) |
| /de/en/traveltricks | info | ema-lufthansa | 1440 | 20.5 | 3772/3692 | not diagnosed (owner) |
| /de/en/first-class | info | ema-lufthansa | 1440 | 20.4 | 8000/8000 | not diagnosed (owner) |
| /de/en/100-years | campaign | ema-adobe | 390 | 20.1 | 8000/8000 | capture: the stage video's frame and www's font fallback (Arial) in the capture; one -24px step |
| /de/en/culinaryjourney | campaign | ema-adobe | 390 | 19.9 | 1911/2045 | micro-frontend (the culinary app's own layout) |
| /de/en/business-class-on-short-and-medium-haul | info | ema-lufthansa | 390 | 19.8 | 3900/3958 | not diagnosed (owner) |
| /de/en/lufthansa-terminal-muenchen | info | ema-lufthansa | 390 | 19.8 | 6614/6374 | not diagnosed (owner) |
| /de/en/100-years/history/menu-on-board | campaign | ema-adobe | 390 | 19.8 | 8000/8000 | not diagnosed |
| /de/en/articles/explore-the-world/eat-see-do-algiers | insights | ema-adobe | 390 | 19.7 | 8000/8000 | not diagnosed |
| /de/en/green-fare | info | ema-lufthansa | 390 | 19.7 | 7325/6876 | not diagnosed (owner) |
| /de/en/discover-lufthansa/take-off | campaign | ema-adobe | 1440 | 19.6 | 4512/4578 | not diagnosed |
| /de/en/free2move | info | ema-lufthansa | 1440 | 19.4 | 3054/2917 | not diagnosed (owner) |
| /de/en/32n | fleet | ema-cashub | 390 | 19.3 | 6954/7113 | not diagnosed (owner) |
| /de/en/320 | fleet | ema-cashub | 390 | 19.3 | 6758/6930 | not diagnosed (owner) |
| /de/en/prepare-for-your-trip/entry-regulations/entering-schengen/entry-exit-system | info | ema-lufthansa | 390 | 19.3 | 8000/8000 | not diagnosed (owner) |
| /de/en/articles/explore-the-world/what-i-learned-living-in-barcelona | insights | ema-adobe | 390 | 19.1 | 8000/8000 | not diagnosed |
| /de/en/744 | fleet | ema-cashub | 390 | 19.1 | 3255/3479 | not diagnosed (owner) |
| /de/en/baggage-irregularities | info | ema-lufthansa | 390 | 19 | 5161/4865 | not diagnosed (owner) |
| /de/en/data-collection-canada | legal | ema-lufthansa | 390 | 18.9 | 5488/5379 | not diagnosed (owner) |
| /de/en/carry-on-baggage | info | ema-lufthansa | 1440 | 18.9 | 6601/6300 | not diagnosed (owner) |
| /de/en/32n | fleet | ema-cashub | 1440 | 18.8 | 6501/6671 | not diagnosed (owner) |
| /de/en/additional-services | hub | ema-adobe | 390 | 18.8 | 8000/8000 | fixed in code (9c5d045); re-imported (049e070, previewed, not published): preview 6.1 / 14.5 % |
| /de/en/data-collection-usa | legal | ema-lufthansa | 390 | 18.7 | 7392/7102 | not diagnosed (owner) |
| /de/en/unterhaltung-an-bord | info | ema-lufthansa | 390 | 18.7 | 3681/3482 | not diagnosed (owner) |
| /de/en/100-years/destinations | campaign | ema-adobe | 1440 | 18.6 | 8000/8000 | a cell heading with .limited-width ("Rio de Janeiro: ...", 1 of 7 heading-large in cells): the importer keeps no width marker in block cells (needs the cleanup's or columns-media's marker) |
| /de/en/articles/explore-the-world/a-perfect-day-berlin-in-one-day | insights | ema-adobe | 1440 | 18.6 | 8000/7975 | poi-map (www's Google map vs our OpenStreetMap box, its caption column) and the related-article cards |
| /de/en/premium-economy-class | info | ema-lufthansa | 1440 | 18.6 | 7074/7138 | not diagnosed (owner) |
| /de/en/unterhaltung-an-bord | info | ema-lufthansa | 1440 | 18.6 | 2960/3104 | not diagnosed (owner) |
| /de/en/menus-on-long-haul-flights | info | ema-lufthansa | 390 | 18.3 | 4584/4678 | not diagnosed (owner) |
| /de/en/most-significant-route | campaign | ema-adobe | 1440 | 18.3 | 2583/2411 | accordion-columns: 41px more above it and 15 below on www; list spacing in text (shared default content) |
| /de/en/arrival-services | info | ema-lufthansa | 1440 | 18.2 | 3726/3854 | not diagnosed (owner) |
| /de/en/book-and-manage/additional-services/travel-insurances | info | ema-lufthansa | 1440 | 18.1 | 2769/2910 | not diagnosed (owner) |
| /de/en/320 | fleet | ema-cashub | 1440 | 18.1 | 6415/6610 | not diagnosed (owner) |
| /de/en/100-years/campaigns | campaign | ema-adobe | 390 | 18 | 8000/8000 | not diagnosed |
| /de/en/cancellations-and-refunds | info | ema-lufthansa | 390 | 18 | 3130/3070 | not diagnosed (owner) |
| /de/en/359 | fleet | ema-cashub | 390 | 17.9 | 3019/3234 | not diagnosed (owner) |
| /de/en/during-your-trip/lhg-wifi | info | ema-lufthansa | 390 | 17.9 | 6043/6289 | not diagnosed (owner) |
| /de/en/lufthansa-am-flughafen-frankfurt | info | ema-lufthansa | 1440 | 17.9 | 4115/4350 | not diagnosed (owner) |
| /de/en/articles/highlights/all-it-takes-is-a-yes | insights | ema-adobe | 390 | 17.8 | 7444/7441 | DA's document predates brief 488 (draft 11.5 / 15.3 %): re-import (reimport-488) |
| /de/en/during-your-trip/lhg-wifi | info | ema-lufthansa | 1440 | 17.8 | 3979/4182 | not diagnosed (owner) |
| /de/en/359 | fleet | ema-cashub | 1440 | 17.7 | 3409/3694 | not diagnosed (owner) |
| /de/en/articles/explore-the-world/be-picky-frankfurt-insider-tips | insights | ema-adobe | 390 | 17.6 | 5101/5167 | not diagnosed |
| /de/en/food-and-beverages | hub | ema-adobe | 1440 | 17.6 | 5085/4986 | hub switch; re-imported (049e070, previewed): preview 8.7 / 11.5 %; 099171e (cards ending a section, 32px under): 9.0 % at 1440 (the step -32 -> -8px, an earlier +51/+19px surplus no longer compensated) |
| /de/en/book-and-manage/stopover/neuschwanstein | campaign | ema-adobe | 1440 | 17.6 | 2999/3098 | not diagnosed |
| /de/en/articles/highlights/allegris-premium-economy-san-diego | insights | ema-adobe | 390 | 17.6 | 7206/7305 | DA's document predates brief 488 (video size; draft 15.8 / 14.7 %): re-import (reimport-488 part B) |
| /de/en/book-and-manage/stopover/bayerischer-hof | campaign | ema-adobe | 1440 | 17.5 | 2935/3026 | not diagnosed |
| /de/en/100-years/global-network | campaign | ema-adobe | 390 | 17.5 | 8000/8000 | not diagnosed |
| /de/en/articles/explore-the-world/a-perfect-day-barcelona-in-one-day | insights | ema-adobe | 390 | 17.4 | 8000/8000 | not diagnosed |
| /de/en/book-and-manage/stopover/zugspitze | campaign | ema-adobe | 390 | 17.2 | 3991/4115 | not diagnosed |
| /de/en/exclusive-charter | info | ema-lufthansa | 1440 | 17.1 | 2095/2183 | not diagnosed (owner) |
| /de/en/medikamenten-transport | info | ema-lufthansa | 390 | 17 | 4154/4105 | not diagnosed (owner) |
| /de/en/articles/explore-the-world/on-the-scene-caspar-plautz-munich | insights | ema-adobe | 390 | 16.9 | 6746/6847 | not diagnosed |
| /de/en/book-and-manage/additional-services/travel-insurances | info | ema-lufthansa | 390 | 16.9 | 3488/3583 | not diagnosed (owner) |
| /de/en/boeing787 | fleet | ema-cashub | 1440 | 16.9 | 7544/7737 | not diagnosed (owner) |
| /de/en/frankfurt-fair | campaign | ema-adobe | 1440 | 16.9 | 3524/3279 | not diagnosed |
| /de/en/discover-lufthansa/lufthansa-fleet/351 | fleet | ema-cashub | 1440 | 16.9 | 7761/7633 | not diagnosed (owner) |
| /de/en/entryprocesses | info | ema-lufthansa | 1440 | 16.9 | 2779/2833 | not diagnosed (owner) |
| /de/en/lufthansa-guide-service | info | ema-lufthansa | 390 | 16.8 | 5471/5894 | not diagnosed (owner) |
| /de/en/first-class-terminal | info | ema-lufthansa | 1440 | 16.7 | 8000/8000 | not diagnosed (owner) |
| /de/en/articles/explore-the-world/eat-see-do-berlin | insights | ema-adobe | 390 | 16.7 | 8000/8000 | not diagnosed |
| /de/en/feedback | form | ema-lufthansa | 390 | 16.6 | 3698/3476 | not diagnosed (owner) |
| /de/en/100-years/crane | campaign | ema-adobe | 390 | 16.6 | 8000/8000 | not diagnosed |
| /de/en/articles/explore-the-world | insights | ema-adobe | 390 | 16.6 | 8000/8000 | not diagnosed |
| /de/en/lufthansa-am-flughafen-frankfurt | info | ema-lufthansa | 390 | 16.6 | 6758/6604 | not diagnosed (owner) |
| /de/en/lh-rentalcar | info | ema-lufthansa | 390 | 16.5 | 3591/3472 | not diagnosed (owner) |
| /de/en/wheelchair-batteries | info | ema-lufthansa | 390 | 16.4 | 4738/4449 | not diagnosed (owner) |
| /de/en/100-years/cabin-design | campaign | ema-adobe | 390 | 16.2 | 8000/8000 | not diagnosed |
| /de/en/book-and-manage/rebook | info | ema-lufthansa | 1440 | 16.1 | 1860/1782 | not diagnosed (owner) |
| /de/en/lufthansa-aviation-group | info | ema-lufthansa | 1440 | 15.9 | 2750/2703 | not diagnosed (owner) |
| /de/en/farealert/best-price-alert | form | ema-lufthansa | 390 | 15.8 | 5363/5270 | not diagnosed (owner) |
| /de/en/744 | fleet | ema-cashub | 1440 | 15.7 | 3319/3524 | not diagnosed (owner) |
| /de/en/common/seatreservation-condtions/seat-reservations | legal | ema-lufthansa | 390 | 15.7 | 4095/3951 | not diagnosed (owner) |
| /de/en/discover-lufthansa/lufthansa-fleet/351 | fleet | ema-cashub | 390 | 15.7 | 8000/8000 | not diagnosed (owner) |
| /de/en/100-years/campaigns | campaign | ema-adobe | 1440 | 15.6 | 8000/8000 | not diagnosed |
| /de/en/articles/explore-the-world/a-perfect-day-berlin-in-one-day | insights | ema-adobe | 390 | 15.5 | 8000/8000 | poi-map (www's Google map vs our OpenStreetMap box, its caption column) and the related-article cards |
| /de/en/book-and-manage/flights/wetlease-hub | info | ema-lufthansa | 390 | 15.5 | 3399/3346 | not diagnosed (owner) |
| /de/en/green-fare | info | ema-lufthansa | 1440 | 15.5 | 5691/5522 | not diagnosed (owner) |
| /de/en/data-collection-usa | legal | ema-lufthansa | 1440 | 15.4 | 5295/5076 | not diagnosed (owner) |
| /de/en/articles/explore-the-world | insights | ema-adobe | 1440 | 15.4 | 6344/6270 | not diagnosed |
| /de/en/tips-senior-travellers | info | ema-lufthansa | 390 | 15.4 | 8000/8000 | not diagnosed (owner) |
| /de/en/travelling-with-special-requirements | info | ema-lufthansa | 390 | 15.3 | 3926/3897 | not diagnosed (owner) |
| /de/en/articles/explore-flying/essentials-future-of-flying | insights | ema-adobe | 390 | 15.3 | 5715/5891 | not diagnosed |
| /de/en/100-years/destinations | campaign | ema-adobe | 390 | 15.2 | 8000/8000 | a cell heading with .limited-width ("Rio de Janeiro: ...", 1 of 7 heading-large in cells): the importer keeps no width marker in block cells (needs the cleanup's or columns-media's marker) |
| /de/en/articles/explore-the-world/know-before-you-go-berlin | insights | ema-adobe | 390 | 15.2 | 7415/7490 | not diagnosed |
| /de/en/book-and-manage/rebook | info | ema-lufthansa | 390 | 15.2 | 2374/2343 | not diagnosed (owner) |
| /de/en/book-and-manage/stopover | campaign | ema-adobe | 390 | 15.2 | 8000/8000 | not diagnosed |
| /de/en/wheelchair-batteries | info | ema-lufthansa | 1440 | 15.1 | 3540/3300 | not diagnosed (owner) |
| /de/en/100-years/chronicle | campaign | ema-adobe | 1440 | 15 | 8000/8000 | not diagnosed |
| /de/en/support/feedback-and-contact-airlines | info | ema-lufthansa | 390 | 15 | 4183/3985 | not diagnosed (owner) |

