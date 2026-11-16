# lufthansa.com insights, campaign, hub and homepage pages, standing order 44 (2026-11-16/17)

ema-adobe's page types swept again as served now, with tonight's rules live: every page of the insights, campaign, hub
and homepage templates that has a recording on this machine, 138 pages, 276 page-widths. Published copies on
lufthansa.turnsthe.page with the code deployed at 23:35 CET (main at 7fc4d6e), at 1440 and 390, against each page's
newest recording here (tools/parity/compare.js; the first 8,000 px; the captures' live boxes masked; text with
geometricPrecision on both sides, logs/b539/geo.css), as sweep-so34-lh-adobe.md was. All 276 answered 200. No request
to www or any airline host.

Recordings:
- lh-parity-004a/b (11-09) where there is one, else lh-parity-002a-d and -003 (11-06);
- /de/en/articles/explore-flying and explore-the-world: their lh-parity-007 recordings (11-15) are gone from this
  machine, so lh-parity-002c is used. The Captures child's fresh first loads replace it (item 3);
- not swept: the five lh-parity-008 pages (livery-iconic-moments, allegris-new-york in de/en, de/de, at/de, gb/en),
  10 page-widths. Their recordings are gone too; they come with the Captures archive (item 3).

Second loads:
- de/de all-it-takes-is-a-yes 1440: the first load's fare teaser drew fewer offers (17.8 %, 6.6 on the second);
- de/de 100-years/destinations 1440: the first load timed out;
- at/de discover-lufthansa/new-onboard-experience 1440: the first load caught a slider picture half drawn (9.1, 4.5
  on the second);
- gb/en all-it-takes-is-a-yes 1440: 17.8 on both loads (see #6).

The homepage: www's recording carries the "Information on flights to Dubai" flash notice that www ended on 11-16. As
the order asks, it is left out: the notice's band is cut from the recording (1440: rows 157-201, 45 px; 390: rows
179-267, 89 px; logs/b644/cutrows.cjs), and the rest of the page then aligns within 12 px. The homepage reads 4.8 %
(1440) and 5.7 % (390) that way; against the uncut recording it reads 12.1 / 11.0.

Ranking: logs/b644/rank.py, the runner logs/b644/sweep-shard.sh (4 shards); captures and diffs in logs/b644 (not in
git).

## Per template

| Template | Page-widths | Median % now | >= 15 % | >= 10 % | >= 7 % | Median in sweep-so34 (the same page-widths) |
| --- | --- | --- | --- | --- | --- | --- |
| insights | 82 | 6.6 | 4 | 15 | 37 | 7.0 |
| campaign | 72 | 7.3 | 3 | 12 | 38 | 7.5 |
| hub | 120 | 4.9 | 2 | 5 | 21 | 5.0 |
| homepage | 2 | 5.2 | 0 | 0 | 0 | 5.7 |
| all | 276 | 5.7 | 9 | 32 | 96 | 5.8 |

Against sweep-so34-lh-adobe.md (11-15, the same 276 page-widths): 28 are 0.5 points or more closer, 242 within 0.5, 6
further by 0.5 or more. All six are load or recording differences, not our layout ("The six that moved further" below).

## The worst 20, located (standing order 44, item 2)

No row or rule passed tonight. Every cause below was located again on tonight's captures (drift steps and crops in
logs/b644); most are the ones sweep-so34 found, and they are unchanged.

| Rank | Page-width | % | Cause (located) | Fix |
| --- | --- | --- | --- | --- |
| 1, 5 | /de/en/articles/explore-the-world/picture-perfect-austin 390 / 1440 | 25.4 / 18.8 | The galleries (columns-media stacked): on phones our pictures run to the right edge with a wider crop than www's; at 1440 the gallery rows step +84 / -16 px in turn. At 1440 the Price Bar is not drawn tonight (+0.7 since sweep-so34, the only change in our capture). | Columns Media: hand-over item 5 (ema-test). The Price Bar: none (www's prices, refused here). |
| 2, 3 | /at/de, /de/de flughafeninformation 390 | 24.8 | The H1 "Flughafeninformationen" is wider than the phone. www lets it overflow and clips its last letter; ours breaks the word onto a second line (+40 px, the rest 40-69 px lower). | None: matching www would hide text. |
| 4 | /de/en/100-years 390 | 19.7 | Drift -30 px. www's recording draws the campaign headings in a fallback face (not LufthansaHead); 10.1 % is masked video stages. | None: the recording's face. |
| 6 | /gb/en/articles/highlights/all-it-takes-is-a-yes 1440 | 17.8 (10.6 in sweep-so34) | The fare teaser drew 345 px of offers on both loads tonight, www's recording 486 (all 7 offers; order 40 saw ours at 486 too). Everything below sits 131-140 px higher. de/en and at/de 1440 read 6.6, the figure order 40's rows promised; de/de read 6.6 on its second load. | None: the offers come from www's prices in the browser, refused here. A real-browser check is the migration session's. |
| 7 | /de/en/culinaryjourney 390 | 16.9 | Section spacing: the H1 25 px low, then +81 px from a white gap between the form's grey area and the grey "Need help?" section. | Hand-over item 6 (ema-test). |
| 8, 15 | /de/en/articles/tags/munich 390 / 1440 | 16.6 / 13.1 | The article list's content: newer articles than the recording, the drift rising card by card (+46 to +105). | None: content. |
| 9, 11 | /de/en/100-years/global-network 390 / 1440 | 15.0 / 13.6 | 35 of www's 37 picture captions are missing (-78 px by y 1,920 at 390), and the recording's fallback face. | The owner's decision on the 100-years captions (order 31). |
| 10 | /de/en/book-and-manage/stopover 390 | 14.0 | The carousel-cards slides are equal height and about 32 px shorter than www's: our text runs narrower (the font-width question; our font files are www's), so the tallest card wraps a line less. Drift to -93 px. | None (the drawing). |
| 12, 13, 16, 17 | /gb/en, /de/en, /at/de, /de/de articles/highlights/all-it-takes-is-a-yes 390 | 13.6, 13.4, 12.8, 12.8 | The recording's fallback face on the campaign headings; the "To the article" links have no arrow on www. Drift within +57 px. | None: the face is the recording's; the arrowless link is a www component we don't mark (order 38). |
| 14 | /de/en/100-years/cabin-design 390 | 13.3 | 11 captions missing (www 11, ours 0), the fallback face, and 10.1 % masked video. | The owner's decision (as #9). |
| 18 | /de/en/articles/explore-the-world/what-i-learned-living-in-barcelona 390 | 12.4 | (1) 20 px less from the caption row to the author quote (a columns-media picture row). (2) The body text breaks a word earlier on www (the font width). The quote's own indent was fixed in order 39 (12.7 -> 12.4). | (1) Hand-over item 21. (2) None. |
| 19 | /de/en/100-years/chronicle 1440 | 12.2 | (1) Its three jump links stand 215 px apart on www and spread over the row in ours. (2) The stage below starts 37 px higher. (3) 3 captions missing. | (1)-(2) Not tonight: the jump-link block reaches every page with jump links. (3) The owner's decision. |
| 20 | /de/en/100-years 1440 | 11.9 | As #4 (drift -24 px, then within 17). | None. |

## The six that moved further

- picture-perfect-austin 1440 (+0.7), eat-see-do-algiers 1440 (+0.7), stop-over-tokyo 1440 (+0.9) and
  what-i-learned-living-in-barcelona 1440 (+0.8): each of our captures is pixel-identical to sweep-so34's, except the
  Price Bar band at y 800. The bar draws no price tonight and hides itself; that is expected with airline hosts
  refused.
- gb/en all-it-takes-is-a-yes 1440 (+7.2): the fare teaser's offers (#6).
- /de/en/articles/explore-flying 390 (+0.9): another recording (lh-parity-002c here, lh-parity-007 in sweep-so34).

## Every page-width, worst first

| Rank | Page | Template | Width | % | Height www / ours | Masked % | Recording | sweep-so34 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | /de/en/articles/explore-the-world/picture-perfect-austin | insights | 390 | 25.4 | 8000/8000 | 0.0 | lh-parity-002 | 25.2 |
| 2 | /at/de/flughafeninformation | hub | 390 | 24.8 | 5882/5882 | 0.0 | lh-parity-004 | 24.8 |
| 3 | /de/de/flughafeninformation | hub | 390 | 24.8 | 5882/5882 | 0.0 | lh-parity-004 | 24.8 |
| 4 | /de/en/100-years | campaign | 390 | 19.7 | 8000/8000 | 10.1 | lh-parity-002 | 19.6 |
| 5 | /de/en/articles/explore-the-world/picture-perfect-austin | insights | 1440 | 18.8 | 7969/7969 | 5.1 | lh-parity-002 | 18.1 |
| 6 | /gb/en/articles/highlights/all-it-takes-is-a-yes | insights | 1440 | 17.8 | 6737/6605 | 4.5 | lh-parity-004 (second load) | 10.6 |
| 7 | /de/en/culinaryjourney | campaign | 390 | 16.9 | 1911/1911 | 0.0 | lh-parity-002 | 16.9 |
| 8 | /de/en/articles/tags/munich | insights | 390 | 16.6 | 8000/8000 | 19.7 | lh-parity-002 | 16.6 |
| 9 | /de/en/100-years/global-network | campaign | 390 | 15.0 | 8000/8000 | 0.0 | lh-parity-002 | 15.0 |
| 10 | /de/en/book-and-manage/stopover | campaign | 390 | 14.0 | 8000/8000 | 5.3 | lh-parity-002 | 14.0 |
| 11 | /de/en/100-years/global-network | campaign | 1440 | 13.6 | 8000/8000 | 0.0 | lh-parity-002 | 13.6 |
| 12 | /gb/en/articles/highlights/all-it-takes-is-a-yes | insights | 390 | 13.6 | 7444/7444 | 5.8 | lh-parity-004 | 14.0 |
| 13 | /de/en/articles/highlights/all-it-takes-is-a-yes | insights | 390 | 13.4 | 7444/7444 | 5.8 | lh-parity-002 | 13.8 |
| 14 | /de/en/100-years/cabin-design | campaign | 390 | 13.3 | 8000/8000 | 10.1 | lh-parity-002 | 13.3 |
| 15 | /de/en/articles/tags/munich | insights | 1440 | 13.1 | 7421/7421 | 15.6 | lh-parity-002 | 13.1 |
| 16 | /at/de/articles/highlights/all-it-takes-is-a-yes | insights | 390 | 12.8 | 7952/7952 | 5.4 | lh-parity-004 | 13.1 |
| 17 | /de/de/articles/highlights/all-it-takes-is-a-yes | insights | 390 | 12.8 | 7952/7952 | 5.4 | lh-parity-004 | 13.1 |
| 18 | /de/en/articles/explore-the-world/what-i-learned-living-in-barcelona | insights | 390 | 12.4 | 8000/8000 | 9.9 | lh-parity-002 | 12.7 |
| 19 | /de/en/100-years/chronicle | campaign | 1440 | 12.2 | 8000/8000 | 20.3 | lh-parity-002 | 12.2 |
| 20 | /de/en/100-years | campaign | 1440 | 11.9 | 8000/8000 | 10.1 | lh-parity-002 | 11.9 |
| 21 | /de/en/book-and-manage/stopover | campaign | 1440 | 11.8 | 8000/8000 | 2.4 | lh-parity-002 | 11.8 |
| 22 | /de/en/100-years/fleet | campaign | 1440 | 11.4 | 8000/8000 | 8.0 | lh-parity-002 | 11.4 |
| 23 | /de/en/munich-fair | campaign | 1440 | 11.3 | 2322/2322 | 0.0 | lh-parity-002 | 11.3 |
| 24 | /de/en/articles/explore-the-world/a-perfect-day-barcelona-in-one-day | insights | 390 | 11.1 | 8000/8000 | 14.1 | lh-parity-002 | 11.1 |
| 25 | /de/en/lufthansa-city/culinaryjourney | campaign | 390 | 11.1 | 1736/1736 | 0.0 | lh-parity-002 | 11.1 |
| 26 | /de/en/articles/explore-flying/anniversary-super-crane-special | insights | 390 | 10.8 | 8000/8000 | 0.0 | lh-parity-002 | 12.0 |
| 27 | /at/de/articles/tags/allegris | insights | 1440 | 10.6 | 7467/7396 | 31.3 | lh-parity-004 | 12.1 |
| 28 | /de/de/articles/tags/allegris | insights | 1440 | 10.6 | 7467/7396 | 31.3 | lh-parity-004 | 12.1 |
| 29 | /at/de/overview-travel-information | hub | 390 | 10.1 | 4041/4041 | 0.0 | lh-parity-004 | 10.1 |
| 30 | /de/de/overview-travel-information | hub | 390 | 10.1 | 4041/4041 | 0.0 | lh-parity-004 | 10.1 |
| 31 | /gb/en/overview-travel-information | hub | 390 | 10.1 | 3950/3950 | 0.0 | lh-parity-004 | 10.1 |
| 32 | /de/en/articles/explore-the-world/a-perfect-day-berlin-in-one-day | insights | 390 | 10.0 | 8000/8000 | 12.5 | lh-parity-002 | 10.0 |
| 33 | /de/en/100-years/campaigns | campaign | 390 | 9.5 | 8000/8000 | 0.0 | lh-parity-002 | 10.4 |
| 34 | /de/en/100-years/crane | campaign | 390 | 9.5 | 8000/8000 | 0.0 | lh-parity-002 | 9.5 |
| 35 | /de/en/100-years/history/menu-on-board | campaign | 390 | 9.5 | 8000/8000 | 10.1 | lh-parity-002 | 9.5 |
| 36 | /de/en/articles/explore-the-world/be-picky-barcelona-insider-tips | insights | 390 | 9.5 | 7635/7635 | 15.2 | lh-parity-002 | 9.5 |
| 37 | /de/en/articles/highlights/allegris-premium-economy-san-diego | insights | 1440 | 9.5 | 6730/6730 | 6.0 | lh-parity-002 | 9.5 |
| 38 | /gb/en/100-years/crane | campaign | 390 | 9.5 | 8000/8000 | 0.0 | lh-parity-004 | 9.5 |
| 39 | /at/de/100-years/crane | campaign | 390 | 9.4 | 8000/8000 | 0.0 | lh-parity-004 | 9.4 |
| 40 | /de/de/100-years/crane | campaign | 390 | 9.4 | 8000/8000 | 0.0 | lh-parity-004 | 9.4 |
| 41 | /de/en/articles/explore-the-world/eat-see-do-algiers | insights | 390 | 9.2 | 8000/8000 | 13.5 | lh-parity-002 | 9.2 |
| 42 | /de/en/articles/tags/allegris | insights | 1440 | 9.0 | 7492/7412 | 31.7 | lh-parity-002 | 12.5 |
| 43 | /gb/en/articles/tags/allegris | insights | 1440 | 9.0 | 7492/7412 | 31.7 | lh-parity-004 | 10.6 |
| 44 | /de/en/articles/explore-flying | insights | 390 | 8.7 | 6633/6633 | 62.3 | lh-parity-002 | 7.8 |
| 45 | /de/en/articles/explore-the-world/stop-over-tokyo | insights | 390 | 8.7 | 7337/7337 | 15.1 | lh-parity-002 | 8.8 |
| 46 | /de/en/articles/explore-the-world/eat-see-do-berlin | insights | 390 | 8.5 | 8000/8000 | 0.7 | lh-parity-002 | 8.4 |
| 47 | /at/de/discover-lufthansa/new-onboard-experience | campaign | 390 | 8.3 | 8000/8000 | 0.0 | lh-parity-004 | 8.3 |
| 48 | /de/de/discover-lufthansa/new-onboard-experience | campaign | 390 | 8.3 | 8000/8000 | 0.0 | lh-parity-004 | 8.3 |
| 49 | /de/en/articles/explore-the-world/know-before-you-go-algiers | insights | 390 | 8.2 | 7470/7470 | 14.5 | lh-parity-002 | 8.2 |
| 50 | /de/en/100-years/destinations | campaign | 390 | 8.1 | 8000/8000 | 0.0 | lh-parity-002 | 8.1 |
| 51 | /de/en/articles/explore-the-world | insights | 1440 | 8.1 | 6344/6258 | 50.3 | lh-parity-002 | 7.7 |
| 52 | /de/en/articles/explore-the-world/know-before-you-go-berlin | insights | 390 | 8.1 | 7415/7415 | 14.2 | lh-parity-002 | 8.0 |
| 53 | /gb/en/100-years/destinations | campaign | 390 | 8.1 | 8000/8000 | 0.0 | lh-parity-004 | 8.1 |
| 54 | /at/de/100-years/crane | campaign | 1440 | 8.0 | 8000/8000 | 0.0 | lh-parity-004 | 8.0 |
| 55 | /at/de/100-years/destinations | campaign | 390 | 8.0 | 8000/8000 | 0.0 | lh-parity-004 | 8.0 |
| 56 | /de/de/100-years/crane | campaign | 1440 | 8.0 | 8000/8000 | 0.0 | lh-parity-004 | 8.0 |
| 57 | /de/de/100-years/destinations | campaign | 390 | 8.0 | 8000/8000 | 0.0 | lh-parity-004 | 8.0 |
| 58 | /de/en/lufthansa-city/culinaryjourney | campaign | 1440 | 8.0 | 1359/1335 | 0.0 | lh-parity-002 | 8.0 |
| 59 | /de/en/lufthansa-travel-classes | hub | 390 | 8.0 | 4688/4688 | 0.0 | lh-parity-002 | 8.0 |
| 60 | /de/en/services-at-the-airport | hub | 390 | 8.0 | 3411/3382 | 0.0 | lh-parity-002 | 8.0 |
| 61 | /gb/en/lufthansa-travel-classes | hub | 390 | 8.0 | 4688/4688 | 0.0 | lh-parity-004 | 8.0 |
| 62 | /at/de/lufthansa-reiseklassen | hub | 390 | 7.9 | 4787/4787 | 0.0 | lh-parity-004 | 7.9 |
| 63 | /de/de/lufthansa-reiseklassen | hub | 390 | 7.9 | 4787/4787 | 0.0 | lh-parity-004 | 7.9 |
| 64 | /de/en/articles/explore-the-world/be-picky-frankfurt-insider-tips | insights | 390 | 7.9 | 5101/5101 | 19.0 | lh-parity-002 | 7.9 |
| 65 | /de/de/speisen-und-getraenke | hub | 390 | 7.8 | 7101/7101 | 0.0 | lh-parity-004 | 7.8 |
| 66 | /de/en/100-years/crane | campaign | 1440 | 7.8 | 8000/8000 | 0.0 | lh-parity-002 | 7.8 |
| 67 | /de/en/articles/explore-the-world/what-i-learned-living-in-frankfurt | insights | 390 | 7.8 | 6027/6027 | 16.1 | lh-parity-002 | 7.8 |
| 68 | /gb/en/100-years/crane | campaign | 1440 | 7.8 | 8000/8000 | 0.0 | lh-parity-004 | 7.8 |
| 69 | /de/en/articles/explore-flying/anniversary-super-crane-special | insights | 1440 | 7.7 | 7218/7218 | 5.9 | lh-parity-002 | 7.7 |
| 70 | /de/en/articles/explore-the-world/eat-see-do-algiers | insights | 1440 | 7.7 | 6548/6527 | 5.6 | lh-parity-002 | 7.0 |
| 71 | /de/en/articles/explore-the-world/in-my-hood-chiswick-london | insights | 390 | 7.7 | 7210/7210 | 24.2 | lh-parity-002 | 7.5 |
| 72 | /de/en/frankfurt-fair | campaign | 1440 | 7.7 | 3524/3448 | 0.0 | lh-parity-002 | 7.7 |
| 73 | /gb/en/frankfurt-fair | campaign | 1440 | 7.7 | 3524/3448 | 0.0 | lh-parity-004 | 7.7 |
| 74 | /at/de/frankfurt-fair | campaign | 390 | 7.6 | 5439/5435 | 0.0 | lh-parity-004 | 7.6 |
| 75 | /at/de/speisen-und-getraenke | hub | 390 | 7.6 | 7101/7101 | 0.0 | lh-parity-004 | 7.6 |
| 76 | /de/de/frankfurt-fair | campaign | 390 | 7.6 | 5439/5435 | 0.0 | lh-parity-004 | 7.6 |
| 77 | /de/en/articles/explore-the-world | insights | 390 | 7.6 | 8000/8000 | 56.8 | lh-parity-002 | 7.4 |
| 78 | /de/en/articles/explore-the-world/on-the-scene-caspar-plautz-munich | insights | 390 | 7.6 | 6746/6746 | 26.7 | lh-parity-002 | 7.7 |
| 79 | /de/en/articles/explore-the-world/stop-over-tokyo | insights | 1440 | 7.6 | 6251/6240 | 5.9 | lh-parity-002 | 6.7 |
| 80 | /at/de/services-am-flughafen | hub | 390 | 7.5 | 3622/3619 | 0.0 | lh-parity-004 | 7.5 |
| 81 | /de/de/services-am-flughafen | hub | 390 | 7.5 | 3622/3619 | 0.0 | lh-parity-004 | 7.5 |
| 82 | /de/en/discover-lufthansa/new-onboard-experience | campaign | 390 | 7.5 | 8000/8000 | 0.0 | lh-parity-002 | 7.5 |
| 83 | /gb/en/discover-lufthansa/new-onboard-experience | campaign | 390 | 7.5 | 8000/8000 | 0.0 | lh-parity-004 | 7.5 |
| 84 | /gb/en/services-at-the-airport | hub | 390 | 7.5 | 3411/3409 | 0.0 | lh-parity-004 | 7.5 |
| 85 | /de/en/articles/highlights/allegris-premium-economy-san-diego | insights | 390 | 7.3 | 7206/7206 | 14.2 | lh-parity-002 | 7.3 |
| 86 | /de/en/frankfurt-fair | campaign | 390 | 7.3 | 5310/5305 | 0.0 | lh-parity-002 | 7.3 |
| 87 | /gb/en/frankfurt-fair | campaign | 390 | 7.3 | 5310/5305 | 0.0 | lh-parity-004 | 7.3 |
| 88 | /at/de/digital-self-services | hub | 390 | 7.2 | 5651/5631 | 0.0 | lh-parity-004 | 7.2 |
| 89 | /de/de/digital-self-services | hub | 390 | 7.2 | 5651/5631 | 0.0 | lh-parity-004 | 7.2 |
| 90 | /de/en/articles/explore-the-world/essentials-barcelona-facts | insights | 390 | 7.2 | 5986/5986 | 19.4 | lh-parity-002 | 7.3 |
| 91 | /de/en/articles/explore-the-world/what-i-learned-living-in-barcelona | insights | 1440 | 7.1 | 5915/5882 | 6.9 | lh-parity-002 | 6.3 |
| 92 | /gb/en/digital-self-services | hub | 390 | 7.1 | 5489/5469 | 0.0 | lh-parity-004 | 7.1 |
| 93 | /de/en/100-years/chronicle | campaign | 390 | 7.0 | 8000/8000 | 10.1 | lh-parity-002 | 7.0 |
| 94 | /de/en/digital-self-services | hub | 390 | 7.0 | 5489/5469 | 0.0 | lh-parity-002 | 7.0 |
| 95 | /de/en/food-and-beverages | hub | 390 | 7.0 | 6683/6683 | 0.0 | lh-parity-002 | 7.0 |
| 96 | /gb/en/food-and-beverages | hub | 390 | 7.0 | 6683/6683 | 0.0 | lh-parity-004 | 7.0 |
| 97 | /at/de/articles/highlights/allegris-premium-economy-san-diego | insights | 1440 | 6.9 | 6921/6921 | 6.2 | lh-parity-004 | 6.9 |
| 98 | /at/de/betreuungsbedarf | hub | 390 | 6.9 | 7247/7247 | 0.0 | lh-parity-004 | 8.4 |
| 99 | /de/de/articles/highlights/allegris-premium-economy-san-diego | insights | 1440 | 6.9 | 6921/6921 | 6.2 | lh-parity-004 | 6.9 |
| 100 | /de/de/betreuungsbedarf | hub | 390 | 6.9 | 7247/7246 | 0.0 | lh-parity-004 | 7.8 |
| 101 | /at/de/additional-services | hub | 390 | 6.8 | 8000/8000 | 0.0 | lh-parity-004 | 6.8 |
| 102 | /de/de/additional-services | hub | 390 | 6.8 | 8000/8000 | 0.0 | lh-parity-004 | 6.8 |
| 103 | /de/en/special-needs | hub | 390 | 6.8 | 6966/6966 | 0.0 | lh-parity-002 | 8.6 |
| 104 | /gb/en/special-needs | hub | 390 | 6.8 | 6966/6966 | 0.0 | lh-parity-004 | 8.6 |
| 105 | /de/en/additional-services | hub | 390 | 6.7 | 8000/8000 | 0.0 | lh-parity-002 | 6.7 |
| 106 | /gb/en/additional-services | hub | 390 | 6.7 | 8000/8000 | 0.0 | lh-parity-004 | 6.7 |
| 107 | /at/de/articles/highlights/all-it-takes-is-a-yes | insights | 1440 | 6.6 | 6791/6791 | 6.3 | lh-parity-004 | 9.7 |
| 108 | /at/de/articles/tags/allegris | insights | 390 | 6.6 | 8000/8000 | 45.1 | lh-parity-004 | 6.3 |
| 109 | /de/de/articles/highlights/all-it-takes-is-a-yes | insights | 1440 | 6.6 | 6791/6791 | 6.3 | lh-parity-004 (second load) | 9.7 |
| 110 | /de/en/articles/highlights/all-it-takes-is-a-yes | insights | 1440 | 6.6 | 6737/6737 | 6.4 | lh-parity-002 | 10.6 |
| 111 | /at/de/frankfurt-fair | campaign | 1440 | 6.5 | 3501/3451 | 0.0 | lh-parity-004 | 6.5 |
| 112 | /de/de/frankfurt-fair | campaign | 1440 | 6.5 | 3501/3451 | 0.0 | lh-parity-004 | 6.5 |
| 113 | /de/en/100-years/fleet | campaign | 390 | 6.4 | 8000/8000 | 8.0 | lh-parity-002 | 7.9 |
| 114 | /de/en/discover-lufthansa/take-off | campaign | 390 | 6.3 | 6888/6888 | 0.0 | lh-parity-002 | 6.3 |
| 115 | /de/en/discover-lufthansa/new-onboard-experience | campaign | 1440 | 6.2 | 8000/8000 | 0.0 | lh-parity-002 | 6.2 |
| 116 | /gb/en/discover-lufthansa/new-onboard-experience | campaign | 1440 | 6.2 | 8000/8000 | 0.0 | lh-parity-004 | 6.2 |
| 117 | /at/de/meetings-and-events | hub | 390 | 6.1 | 4130/4130 | 0.0 | lh-parity-004 | 6.3 |
| 118 | /de/de/meetings-and-events | hub | 390 | 6.1 | 4130/4130 | 0.0 | lh-parity-004 | 6.3 |
| 119 | /de/en/articles/explore-the-world/be-picky-barcelona-insider-tips | insights | 1440 | 6.1 | 5062/5042 | 9.8 | lh-parity-002 | 6.0 |
| 120 | /de/en/munich-fair | campaign | 390 | 6.1 | 3143/3143 | 0.0 | lh-parity-002 | 6.1 |
| 121 | /de/de/articles/tags/allegris | insights | 390 | 6.0 | 8000/8000 | 45.1 | lh-parity-004 | 6.3 |
| 122 | /de/en/most-significant-route | campaign | 390 | 6.0 | 2783/2780 | 0.0 | lh-parity-002 | 6.0 |
| 123 | /gb/en/most-significant-route | campaign | 390 | 6.0 | 2783/2780 | 0.0 | lh-parity-004 | 6.0 |
| 124 | /at/de/bedeutsamste-strecken | campaign | 390 | 5.9 | 2878/2875 | 0.0 | lh-parity-004 | 5.9 |
| 125 | /de/de/bedeutsamste-strecken | campaign | 390 | 5.9 | 2878/2875 | 0.0 | lh-parity-004 | 5.9 |
| 126 | /de/en/100-years/cabin-design | campaign | 1440 | 5.9 | 8000/8000 | 10.1 | lh-parity-002 | 6.1 |
| 127 | /de/en/100-years/history | campaign | 390 | 5.9 | 8000/8000 | 10.1 | lh-parity-002 | 5.9 |
| 128 | /de/en/additional-services | hub | 1440 | 5.8 | 6773/6766 | 0.0 | lh-parity-002 | 5.8 |
| 129 | /de/en/articles/explore-flying/flying-high-christoph-quarch | insights | 1440 | 5.8 | 5407/5400 | 7.9 | lh-parity-002 | 5.8 |
| 130 | /de/en/overview-special-request | hub | 390 | 5.8 | 3936/3936 | 0.0 | lh-parity-002 | 5.8 |
| 131 | /gb/en/additional-services | hub | 1440 | 5.8 | 6773/6766 | 0.0 | lh-parity-004 | 5.8 |
| 132 | /gb/en/overview-special-request | hub | 390 | 5.8 | 3936/3936 | 0.0 | lh-parity-004 | 5.8 |
| 133 | /at/de/additional-services | hub | 1440 | 5.7 | 6773/6766 | 0.0 | lh-parity-004 | 5.7 |
| 134 | /at/de/articles/highlights/allegris-premium-economy-san-diego | insights | 390 | 5.7 | 7820/7820 | 13.1 | lh-parity-004 | 5.7 |
| 135 | /at/de/overview-flights | hub | 390 | 5.7 | 3612/3601 | 0.0 | lh-parity-004 | 5.7 |
| 136 | /de/de/additional-services | hub | 1440 | 5.7 | 6773/6766 | 0.0 | lh-parity-004 | 5.7 |
| 137 | /de/de/overview-flights | hub | 390 | 5.7 | 3612/3601 | 0.0 | lh-parity-004 | 5.7 |
| 138 | /de/en/homepage | homepage | 390 | 5.7 | 6086/6076 | 26.9 | lh-parity-002 (notice cut) | 5.4 |
| 139 | /de/en/meetings-and-events | hub | 390 | 5.7 | 3869/3869 | 0.0 | lh-parity-002 | 6.0 |
| 140 | /de/en/overview-flights | hub | 390 | 5.7 | 3517/3506 | 0.0 | lh-parity-002 | 5.7 |
| 141 | /gb/en/articles/highlights/allegris-premium-economy-san-diego | insights | 390 | 5.7 | 7206/7206 | 14.2 | lh-parity-004 | 5.7 |
| 142 | /gb/en/meetings-and-events | hub | 390 | 5.7 | 3869/3869 | 0.0 | lh-parity-004 | 6.0 |
| 143 | /gb/en/overview-flights | hub | 390 | 5.7 | 3517/3506 | 0.0 | lh-parity-004 | 5.7 |
| 144 | /at/de/overview-special-request | hub | 390 | 5.6 | 4027/4027 | 0.0 | lh-parity-004 | 5.6 |
| 145 | /at/de/overview-travel-information | hub | 1440 | 5.6 | 2840/2840 | 0.0 | lh-parity-004 | 5.6 |
| 146 | /de/de/overview-special-request | hub | 390 | 5.6 | 4027/4027 | 0.0 | lh-parity-004 | 5.6 |
| 147 | /de/de/overview-travel-information | hub | 1440 | 5.6 | 2840/2840 | 0.0 | lh-parity-004 | 5.6 |
| 148 | /de/en/airport-information | hub | 390 | 5.6 | 5465/5465 | 0.0 | lh-parity-002 | 5.6 |
| 149 | /de/en/articles/explore-flying/flying-high-christoph-quarch | insights | 390 | 5.6 | 6410/6402 | 15.4 | lh-parity-002 | 9.3 |
| 150 | /de/en/articles/explore-the-world/in-my-hood-district-zurich | insights | 390 | 5.6 | 8000/8000 | 25.7 | lh-parity-002 | 5.6 |
| 151 | /de/en/services-on-board | hub | 390 | 5.6 | 3993/3991 | 0.0 | lh-parity-002 | 5.6 |
| 152 | /gb/en/airport-information | hub | 390 | 5.6 | 5465/5465 | 0.0 | lh-parity-004 | 5.6 |
| 153 | /gb/en/services-on-board | hub | 390 | 5.6 | 3993/3991 | 0.0 | lh-parity-004 | 5.6 |
| 154 | /at/de/services-an-bord | hub | 390 | 5.5 | 4088/4086 | 0.0 | lh-parity-004 | 5.5 |
| 155 | /de/de/services-an-bord | hub | 390 | 5.5 | 4088/4086 | 0.0 | lh-parity-004 | 5.5 |
| 156 | /gb/en/overview-travel-information | hub | 1440 | 5.5 | 2840/2840 | 0.0 | lh-parity-004 | 5.5 |
| 157 | /de/de/articles/highlights/allegris-premium-economy-san-diego | insights | 390 | 5.4 | 7820/7820 | 13.1 | lh-parity-004 | 5.4 |
| 158 | /de/en/miles-and-more | hub | 390 | 5.2 | 4188/4188 | 0.0 | lh-parity-002 | 5.2 |
| 159 | /gb/en/miles-and-more | hub | 390 | 5.2 | 4188/4188 | 0.0 | lh-parity-004 | 5.2 |
| 160 | /de/en/articles/explore-flying/essentials-future-of-flying | insights | 390 | 5.1 | 5715/5715 | 18.3 | lh-parity-002 | 5.1 |
| 161 | /de/en/book-and-manage/stopover/bayerischer-hof | campaign | 1440 | 5.1 | 2935/2935 | 11.1 | lh-parity-002 | 5.1 |
| 162 | /at/de/miles-and-more | hub | 390 | 5.0 | 4511/4511 | 0.0 | lh-parity-004 | 5.0 |
| 163 | /de/de/miles-and-more | hub | 390 | 5.0 | 4511/4511 | 0.0 | lh-parity-004 | 5.0 |
| 164 | /de/en/articles/explore-the-world/essentials-frankfurt-facts | insights | 1440 | 5.0 | 5130/5130 | 7.9 | lh-parity-002 | 5.2 |
| 165 | /de/en/articles/explore-the-world/on-the-scene-food-trends-istanbul | insights | 1440 | 5.0 | 5289/5217 | 18.2 | lh-parity-002 | 5.0 |
| 166 | /de/en/baggage | hub | 390 | 5.0 | 7339/7339 | 0.0 | lh-parity-002 | 5.0 |
| 167 | /gb/en/articles/highlights/allegris-premium-economy-san-diego | insights | 1440 | 5.0 | 6730/6730 | 6.0 | lh-parity-004 | 5.0 |
| 168 | /gb/en/baggage | hub | 390 | 5.0 | 7339/7339 | 0.0 | lh-parity-004 | 5.0 |
| 169 | /de/en/100-years/campaigns | campaign | 1440 | 4.9 | 8000/8000 | 0.0 | lh-parity-002 | 4.9 |
| 170 | /at/de/gepaeck | hub | 390 | 4.8 | 7511/7511 | 0.0 | lh-parity-004 | 4.8 |
| 171 | /de/de/gepaeck | hub | 390 | 4.8 | 7511/7511 | 0.0 | lh-parity-004 | 4.8 |
| 172 | /de/en/book-and-manage/stopover/neuschwanstein | campaign | 1440 | 4.8 | 2999/2999 | 10.9 | lh-parity-002 | 4.8 |
| 173 | /de/en/homepage | homepage | 1440 | 4.8 | 5020/4996 | 28.1 | lh-parity-002 (notice cut) | 6.0 |
| 174 | /de/en/articles/explore-the-world/know-before-you-go-berlin | insights | 1440 | 4.6 | 7488/7458 | 6.1 | lh-parity-002 | 4.6 |
| 175 | /de/en/articles/explore-the-world/what-i-learned-living-in-frankfurt | insights | 1440 | 4.6 | 4526/4519 | 9.0 | lh-parity-002 | 4.6 |
| 176 | /gb/en/articles/tags/allegris | insights | 390 | 4.6 | 7897/7893 | 44.8 | lh-parity-004 | 4.3 |
| 177 | /at/de/discover-lufthansa/new-onboard-experience | campaign | 1440 | 4.5 | 8000/8000 | 0.0 | lh-parity-004 (second load) | 4.5 |
| 178 | /de/de/discover-lufthansa/new-onboard-experience | campaign | 1440 | 4.5 | 8000/8000 | 0.0 | lh-parity-004 | 4.5 |
| 179 | /de/en/articles/authors/florian-tomberg | insights | 390 | 4.5 | 3801/3801 | 41.6 | lh-parity-002 | 4.5 |
| 180 | /de/en/book-and-manage/stopover/zugspitze | campaign | 1440 | 4.5 | 3055/3055 | 10.7 | lh-parity-002 | 4.5 |
| 181 | /de/en/discover-lufthansa/take-off | campaign | 1440 | 4.5 | 4512/4512 | 0.0 | lh-parity-002 | 4.5 |
| 182 | /de/en/articles/explore-the-world/on-the-scene-food-trends-istanbul | insights | 390 | 4.4 | 7097/7097 | 26.0 | lh-parity-002 | 4.4 |
| 183 | /de/en/articles/explore-the-world/know-before-you-go-algiers | insights | 1440 | 4.3 | 7447/7417 | 6.2 | lh-parity-002 | 4.3 |
| 184 | /gb/en/special-needs | hub | 1440 | 4.2 | 5271/5271 | 0.0 | lh-parity-004 | 5.3 |
| 185 | /de/en/articles/explore-the-world/eat-see-do-berlin | insights | 1440 | 4.1 | 7064/7064 | 7.0 | lh-parity-002 | 4.1 |
| 186 | /de/en/book-and-manage/stopover/bayerischer-hof | campaign | 390 | 4.1 | 4036/4036 | 11.0 | lh-parity-002 | 4.1 |
| 187 | /de/en/special-needs | hub | 1440 | 4.1 | 5271/5271 | 0.0 | lh-parity-002 | 5.3 |
| 188 | /at/de/lufthansa-reiseklassen | hub | 1440 | 3.9 | 3295/3290 | 0.0 | lh-parity-004 | 3.9 |
| 189 | /de/de/lufthansa-reiseklassen | hub | 1440 | 3.9 | 3295/3290 | 0.0 | lh-parity-004 | 3.9 |
| 190 | /de/en/articles/explore-the-world/essentials-frankfurt-facts | insights | 390 | 3.9 | 5001/5001 | 19.4 | lh-parity-002 | 3.9 |
| 191 | /de/en/articles/tags/allegris | insights | 390 | 3.9 | 7897/7893 | 44.8 | lh-parity-002 | 7.3 |
| 192 | /de/en/lufthansa-travel-classes | hub | 1440 | 3.9 | 3295/3290 | 0.0 | lh-parity-002 | 3.9 |
| 193 | /gb/en/lufthansa-travel-classes | hub | 1440 | 3.9 | 3295/3290 | 0.0 | lh-parity-004 | 3.9 |
| 194 | /de/en/airport-information | hub | 1440 | 3.8 | 3232/3230 | 0.0 | lh-parity-002 | 3.8 |
| 195 | /gb/en/airport-information | hub | 1440 | 3.8 | 3232/3230 | 0.0 | lh-parity-004 | 3.8 |
| 196 | /de/en/articles/explore-the-world/in-my-hood-district-zurich | insights | 1440 | 3.6 | 5455/5440 | 17.6 | lh-parity-002 | 3.6 |
| 197 | /de/en/digital-self-services | hub | 1440 | 3.5 | 4430/4430 | 0.0 | lh-parity-002 | 3.5 |
| 198 | /at/de/gepaeck | hub | 1440 | 3.4 | 4727/4727 | 0.0 | lh-parity-004 | 3.4 |
| 199 | /de/de/gepaeck | hub | 1440 | 3.4 | 4727/4727 | 0.0 | lh-parity-004 | 3.4 |
| 200 | /de/en/articles/explore-flying/7-people-who-shaped-lufthansa-history | insights | 390 | 3.3 | 8000/8000 | 0.0 | lh-parity-002 | 3.3 |
| 201 | /de/en/articles/explore-the-world/in-my-hood-chiswick-london | insights | 1440 | 3.3 | 5212/5180 | 18.5 | lh-parity-002 | 3.3 |
| 202 | /de/en/book-and-manage/stopover/zugspitze | campaign | 390 | 3.3 | 3991/3991 | 11.1 | lh-parity-002 | 8.9 |
| 203 | /at/de/flughafeninformation | hub | 1440 | 3.1 | 3281/3281 | 0.0 | lh-parity-004 | 3.1 |
| 204 | /de/de/flughafeninformation | hub | 1440 | 3.1 | 3281/3281 | 0.0 | lh-parity-004 | 3.1 |
| 205 | /de/en/articles/explore-the-world/on-the-scene-caspar-plautz-munich | insights | 1440 | 3.1 | 5162/5146 | 19.4 | lh-parity-002 | 3.1 |
| 206 | /de/en/articles/authors/florian-tomberg | insights | 1440 | 3.0 | 3437/3437 | 36.2 | lh-parity-002 | 7.5 |
| 207 | /de/en/articles/explore-the-world/essentials-barcelona-facts | insights | 1440 | 3.0 | 5395/5387 | 9.2 | lh-parity-002 | 3.4 |
| 208 | /at/de/digital-self-services | hub | 1440 | 2.9 | 4548/4541 | 0.0 | lh-parity-004 | 2.9 |
| 209 | /de/de/digital-self-services | hub | 1440 | 2.9 | 4548/4541 | 0.0 | lh-parity-004 | 2.9 |
| 210 | /de/en/articles/tags | insights | 390 | 2.9 | 2469/2469 | 0.0 | lh-parity-002 | 2.9 |
| 211 | /gb/en/digital-self-services | hub | 1440 | 2.9 | 4471/4463 | 0.0 | lh-parity-004 | 2.9 |
| 212 | /de/en/articles/explore-the-world/be-picky-frankfurt-insider-tips | insights | 1440 | 2.8 | 3841/3833 | 10.5 | lh-parity-002 | 2.8 |
| 213 | /de/en/services-on-board | hub | 1440 | 2.8 | 2789/2781 | 0.0 | lh-parity-002 | 2.8 |
| 214 | /gb/en/services-on-board | hub | 1440 | 2.8 | 2789/2781 | 0.0 | lh-parity-004 | 2.8 |
| 215 | /at/de/bedeutsamste-strecken | campaign | 1440 | 2.7 | 2475/2466 | 0.0 | lh-parity-004 | 2.7 |
| 216 | /at/de/meetings-and-events | hub | 1440 | 2.7 | 3615/3609 | 0.0 | lh-parity-004 | 4.1 |
| 217 | /at/de/overview-flights | hub | 1440 | 2.7 | 2730/2730 | 0.0 | lh-parity-004 | 2.7 |
| 218 | /at/de/services-an-bord | hub | 1440 | 2.7 | 2856/2847 | 0.0 | lh-parity-004 | 2.7 |
| 219 | /de/de/bedeutsamste-strecken | campaign | 1440 | 2.7 | 2475/2466 | 0.0 | lh-parity-004 | 2.7 |
| 220 | /de/de/meetings-and-events | hub | 1440 | 2.7 | 3615/3609 | 0.0 | lh-parity-004 | 4.1 |
| 221 | /de/de/overview-flights | hub | 1440 | 2.7 | 2730/2730 | 0.0 | lh-parity-004 | 2.7 |
| 222 | /de/de/services-an-bord | hub | 1440 | 2.7 | 2856/2847 | 0.0 | lh-parity-004 | 2.7 |
| 223 | /de/en/articles/explore-flying/essentials-future-of-flying | insights | 1440 | 2.7 | 5733/5733 | 7.5 | lh-parity-002 | 2.7 |
| 224 | /de/en/book-and-manage/stopover/neuschwanstein | campaign | 390 | 2.7 | 3727/3727 | 11.9 | lh-parity-002 | 2.7 |
| 225 | /de/en/overview-flights | hub | 1440 | 2.7 | 2703/2703 | 0.0 | lh-parity-002 | 2.7 |
| 226 | /gb/en/overview-flights | hub | 1440 | 2.7 | 2703/2703 | 0.0 | lh-parity-004 | 2.7 |
| 227 | /at/de/betreuungsbedarf | hub | 1440 | 2.6 | 5387/5383 | 0.0 | lh-parity-004 | 3.6 |
| 228 | /de/de/betreuungsbedarf | hub | 1440 | 2.6 | 5387/5383 | 0.0 | lh-parity-004 | 3.6 |
| 229 | /de/en/meetings-and-events | hub | 1440 | 2.6 | 3534/3528 | 0.0 | lh-parity-002 | 3.9 |
| 230 | /de/en/most-significant-route | campaign | 1440 | 2.6 | 2583/2574 | 0.0 | lh-parity-002 | 2.6 |
| 231 | /de/en/overview-travel-information | hub | 390 | 2.6 | 3950/3950 | 0.0 | lh-parity-003 | 2.6 |
| 232 | /gb/en/meetings-and-events | hub | 1440 | 2.6 | 3534/3528 | 0.0 | lh-parity-004 | 3.9 |
| 233 | /gb/en/most-significant-route | campaign | 1440 | 2.6 | 2583/2574 | 0.0 | lh-parity-004 | 2.6 |
| 234 | /de/en/overview-special-request | hub | 1440 | 2.5 | 2754/2746 | 0.0 | lh-parity-002 | 2.5 |
| 235 | /gb/en/overview-special-request | hub | 1440 | 2.5 | 2754/2746 | 0.0 | lh-parity-004 | 2.5 |
| 236 | /at/de/overview-special-request | hub | 1440 | 2.4 | 2781/2773 | 0.0 | lh-parity-004 | 2.4 |
| 237 | /at/de/speisen-und-getraenke | hub | 1440 | 2.4 | 5112/5112 | 0.0 | lh-parity-004 | 2.4 |
| 238 | /de/de/overview-special-request | hub | 1440 | 2.4 | 2781/2773 | 0.0 | lh-parity-004 | 2.4 |
| 239 | /de/de/speisen-und-getraenke | hub | 1440 | 2.4 | 5112/5112 | 0.0 | lh-parity-004 | 2.4 |
| 240 | /de/en/articles/explore-the-world/a-perfect-day-barcelona-in-one-day | insights | 1440 | 2.4 | 7608/7608 | 13.2 | lh-parity-002 | 2.4 |
| 241 | /de/en/culinaryjourney | campaign | 1440 | 2.4 | 1586/1586 | 0.0 | lh-parity-002 | 2.4 |
| 242 | /de/en/miles-and-more | hub | 1440 | 2.4 | 3406/3406 | 0.0 | lh-parity-002 | 2.4 |
| 243 | /at/de/miles-and-more | hub | 1440 | 2.3 | 3487/3487 | 0.0 | lh-parity-004 | 2.3 |
| 244 | /de/de/miles-and-more | hub | 1440 | 2.3 | 3487/3487 | 0.0 | lh-parity-004 | 2.3 |
| 245 | /gb/en/miles-and-more | hub | 1440 | 2.3 | 3406/3406 | 0.0 | lh-parity-004 | 2.3 |
| 246 | /de/en/100-years/history/menu-on-board | campaign | 1440 | 2.2 | 8000/8000 | 10.1 | lh-parity-002 | 2.2 |
| 247 | /de/en/food-and-beverages | hub | 1440 | 2.2 | 5085/5085 | 0.0 | lh-parity-002 | 2.2 |
| 248 | /gb/en/food-and-beverages | hub | 1440 | 2.2 | 5085/5085 | 0.0 | lh-parity-004 | 2.2 |
| 249 | /de/en/articles/explore-flying/inflight-entertainment-vr-experience | insights | 1440 | 2.1 | 7854/7854 | 5.5 | lh-parity-002 | 2.1 |
| 250 | /de/en/articles/explore-the-world/a-perfect-day-berlin-in-one-day | insights | 1440 | 2.0 | 8000/8000 | 12.5 | lh-parity-002 | 2.0 |
| 251 | /de/en/overview-travel-information | hub | 1440 | 1.9 | 2840/2840 | 0.0 | lh-parity-003 | 1.9 |
| 252 | /de/en/baggage | hub | 1440 | 1.7 | 4630/4627 | 0.0 | lh-parity-002 | 1.7 |
| 253 | /gb/en/baggage | hub | 1440 | 1.7 | 4630/4627 | 0.0 | lh-parity-004 | 1.7 |
| 254 | /at/de/services-am-flughafen | hub | 1440 | 1.5 | 2849/2849 | 0.0 | lh-parity-004 | 1.5 |
| 255 | /de/de/services-am-flughafen | hub | 1440 | 1.5 | 2849/2849 | 0.0 | lh-parity-004 | 1.5 |
| 256 | /de/en/services-at-the-airport | hub | 1440 | 1.4 | 2822/2822 | 0.0 | lh-parity-002 | 1.4 |
| 257 | /gb/en/services-at-the-airport | hub | 1440 | 1.4 | 2822/2822 | 0.0 | lh-parity-004 | 1.4 |
| 258 | /de/en/articles/explore-flying/7-people-who-shaped-lufthansa-history | insights | 1440 | 1.3 | 8000/8000 | 0.0 | lh-parity-002 | 1.3 |
| 259 | /de/en/articles/highlights | insights | 1440 | 1.3 | 6838/6838 | 55.6 | lh-parity-002 | 1.3 |
| 260 | /de/en/articles/tags | insights | 1440 | 1.2 | 1986/1986 | 0.0 | lh-parity-002 | 1.2 |
| 261 | /de/en/articles/explore-flying | insights | 1440 | 1.1 | 5525/5523 | 50.5 | lh-parity-002 | 4.3 |
| 262 | /de/en/100-years/history | campaign | 1440 | 1.0 | 8000/8000 | 10.1 | lh-parity-002 | 1.0 |
| 263 | /de/en/articles/explore-flying/inflight-entertainment-vr-experience | insights | 390 | 0.9 | 8000/8000 | 0.0 | lh-parity-002 | 1.0 |
| 264 | /de/en/100-years/destinations | campaign | 1440 | 0.8 | 8000/8000 | 0.0 | lh-parity-002 | 0.8 |
| 265 | /gb/en/100-years/destinations | campaign | 1440 | 0.8 | 8000/8000 | 0.0 | lh-parity-004 | 0.8 |
| 266 | /at/de/100-years/destinations | campaign | 1440 | 0.7 | 8000/8000 | 0.0 | lh-parity-004 | 0.7 |
| 267 | /de/de/100-years/destinations | campaign | 1440 | 0.7 | 8000/8000 | 0.0 | lh-parity-004 (second load) | 0.7 |
| 268 | /de/en/articles/highlights | insights | 390 | 0.7 | 8000/8000 | 69.2 | lh-parity-002 | 0.7 |
| 269 | /at/de/fluege | hub | 390 | 0.1 | 8000/8000 | 85.7 | lh-parity-004 | 0.1 |
| 270 | /de/de/fluege | hub | 390 | 0.1 | 8000/8000 | 85.7 | lh-parity-004 | 0.1 |
| 271 | /de/en/flights | hub | 390 | 0.1 | 8000/8000 | 85.4 | lh-parity-004 | 0.1 |
| 272 | /gb/en/flights | hub | 390 | 0.1 | 8000/8000 | 85.4 | lh-parity-004 | 0.1 |
| 273 | /at/de/fluege | hub | 1440 | 0.0 | 8000/8000 | 84.2 | lh-parity-004 | 0.0 |
| 274 | /de/de/fluege | hub | 1440 | 0.0 | 8000/8000 | 84.2 | lh-parity-004 | 0.0 |
| 275 | /de/en/flights | hub | 1440 | 0.0 | 8000/8000 | 83.7 | lh-parity-004 | 0.0 |
| 276 | /gb/en/flights | hub | 1440 | 0.0 | 8000/8000 | 83.7 | lh-parity-004 | 0.0 |
