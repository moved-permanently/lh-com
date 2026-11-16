# lufthansa.com insights, campaign, hub and homepage pages, standing order 34 (2026-11-15)

ema-adobe's page types, swept as ema-test swept the info pages tonight (sweep-so32-lh-info.md): every page of the
insights, campaign, hub and homepage templates (tools/importer/page-templates.json) that has a recording, 143 pages,
286 page-widths, as published on lufthansa.turnsthe.page with the code deployed at 22:40-23:05 CET (main at 9e3f1ae),
at 1440 and 390, against its newest recording (tools/parity/compare.js; the first 8,000 px). Newest recording, in this
order: tonight's lh-parity-008 / 010 (allegris-new-york, livery-iconic-moments; sha256 as in the brief), lh-parity-007
(2026-11-15, explore-flying and explore-the-world), lh-parity-004a/b (11-09), lh-parity-002a-d and -003 (11-06);
lh-snapshots-115 holds none of these pages. The live boxes each capture records (video stages, live widgets such as the
homepage's offers) are masked (--mask <capture>.json), as ema-test did; the 11-09 baseline did not mask them. Text with
geometricPrecision rendering on both sides (logs/b539/geo.css), as in every gate since standing order 21. No request to
www or any airline host; all 286 answers 200. Runner: logs/b634/sweep-shard.sh (4 shards), ranking logs/b634/rank.py
(not in git).

## Per template

| Template | Page-widths | Median % now | >= 20 % | >= 15 % | >= 10 % | Median 11-09 (sweep-lh-baseline.md, the same pages) |
| --- | --- | --- | --- | --- | --- | --- |
| insights | 92 | 7.5 | 7 | 13 | 28 | 13.1 (64 page-widths) |
| campaign | 72 | 7.5 | 0 | 3 | 13 | 14.2 (42 page-widths) |
| hub | 120 | 5.0 | 2 | 2 | 5 | 7.9 (30 page-widths) |
| homepage | 2 | 5.7 | 0 | 0 | 0 | 8.4 (2 page-widths) |
| all | 286 | 5.9 | 9 | 18 | 46 | 12.6 |

Against sweep-lh-baseline.md (11-09, 138 of these page-widths): 104 are 2 points or more closer to www now, 0
2 points or more further. Against sweep-lh-004.md (11-09, the lh-parity-004 pages, 140 of these page-widths):
median 10.5 then, 5.7 now. The rest have no figure there (their recording is newer, or the
baseline did not list them: the 004 pages, tonight's recordings).

## Every page-width at 12 % or more, worst first

| Page | Template | Width | % | Height www / ours | Masked % | Recording | 11-09 baseline | 11-09 lh-004 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| /de/en/articles/explore-flying/livery-iconic-moments | insights | 1440 | 29.8 | 17187/8000 | 0.0 | lh-parity-008 |  |  |
| /gb/en/articles/highlights/allegris-new-york | insights | 1440 | 25.6 | 6945/6723 | 7.1 | lh-parity-008 |  |  |
| /de/en/articles/explore-the-world/picture-perfect-austin | insights | 390 | 25.2 | 8000/8000 | 2.1 | lh-parity-002 | 30.6 |  |
| /de/de/flughafeninformation | hub | 390 | 24.8 | 5882/5882 | 0.0 | lh-parity-004 |  | 25.0 |
| /at/de/flughafeninformation | hub | 390 | 24.8 | 5882/5882 | 0.0 | lh-parity-004 |  | 25.0 |
| /de/en/articles/explore-flying/livery-iconic-moments | insights | 390 | 24.2 | 25049/8000 | 0.0 | lh-parity-008 |  |  |
| /at/de/articles/highlights/allegris-new-york | insights | 1440 | 24.1 | 7080/6897 | 7.0 | lh-parity-008 |  |  |
| /de/en/articles/highlights/allegris-new-york | insights | 1440 | 24.0 | 6945/6794 | 7.1 | lh-parity-008 |  |  |
| /de/de/articles/highlights/allegris-new-york | insights | 1440 | 22.4 | 7080/6969 | 7.0 | lh-parity-008 |  |  |
| /de/en/100-years | campaign | 390 | 19.6 | 8000/8000 | 10.1 | lh-parity-002 | 20.1 |  |
| /de/en/articles/explore-the-world/picture-perfect-austin | insights | 1440 | 18.1 | 7969/7969 | 6.2 | lh-parity-002 | 23.0 |  |
| /de/en/culinaryjourney | campaign | 390 | 16.9 | 1911/1911 | 0.0 | lh-parity-002 | 19.9 |  |
| /de/en/articles/tags/munich | insights | 390 | 16.6 | 8000/8000 | 19.7 | lh-parity-002 | 17.9 |  |
| /gb/en/articles/highlights/allegris-new-york | insights | 390 | 16.4 | 7663/7558 | 14.8 | lh-parity-008 |  |  |
| /at/de/articles/highlights/allegris-new-york | insights | 390 | 16.2 | 8227/8000 | 14.2 | lh-parity-008 |  |  |
| /de/de/articles/highlights/allegris-new-york | insights | 390 | 15.2 | 8227/8000 | 14.2 | lh-parity-008 |  |  |
| /de/en/articles/highlights/allegris-new-york | insights | 390 | 15.1 | 7663/7617 | 14.8 | lh-parity-008 |  |  |
| /de/en/100-years/global-network | campaign | 390 | 15.0 | 8000/8000 | 0.0 | lh-parity-002 | 17.5 |  |
| /de/en/book-and-manage/stopover | campaign | 390 | 14.0 | 8000/8000 | 5.3 | lh-parity-002 | 15.2 |  |
| /gb/en/articles/highlights/all-it-takes-is-a-yes | insights | 390 | 14.0 | 7444/7444 | 5.8 | lh-parity-004 |  | 15.4 |
| /de/en/articles/highlights/all-it-takes-is-a-yes | insights | 390 | 13.8 | 7444/7444 | 5.8 | lh-parity-002 | 15.3 |  |
| /de/en/100-years/global-network | campaign | 1440 | 13.6 | 8000/8000 | 0.0 | lh-parity-002 | 14.6 |  |
| /de/en/100-years/cabin-design | campaign | 390 | 13.3 | 8000/8000 | 10.1 | lh-parity-002 | 16.2 |  |
| /at/de/articles/highlights/all-it-takes-is-a-yes | insights | 390 | 13.1 | 7952/7952 | 5.4 | lh-parity-004 |  | 14.9 |
| /de/en/articles/tags/munich | insights | 1440 | 13.1 | 7421/7421 | 15.6 | lh-parity-002 | 15.0 |  |
| /de/de/articles/highlights/all-it-takes-is-a-yes | insights | 390 | 13.1 | 7952/7952 | 5.4 | lh-parity-004 |  | 14.9 |
| /de/en/articles/explore-the-world/what-i-learned-living-in-barcelona | insights | 390 | 12.7 | 8000/8000 | 12.3 | lh-parity-002 | 19.1 |  |
| /de/en/articles/tags/allegris | insights | 1440 | 12.5 | 7492/7360 | 31.7 | lh-parity-002 | 23.2 |  |
| /de/en/100-years/chronicle | campaign | 1440 | 12.2 | 8000/8000 | 20.3 | lh-parity-002 | 15.0 |  |
| /at/de/articles/tags/allegris | insights | 1440 | 12.1 | 7467/7396 | 31.3 | lh-parity-004 |  | 24.3 |
| /de/de/articles/tags/allegris | insights | 1440 | 12.1 | 7467/7396 | 31.3 | lh-parity-004 |  | 24.3 |
| /de/en/articles/explore-flying/anniversary-super-crane-special | insights | 390 | 12.0 | 8000/8000 | 0.0 | lh-parity-002 | 13.2 |  |

## Moved most since the 11-09 baseline (2 points or more)

| Page | Width | 11-09 | now |
| --- | --- | --- | --- |
| /de/en/airport-information | 390 | 25.4 | 5.6 |
| /de/en/articles/explore-the-world/a-perfect-day-barcelona-in-one-day | 1440 | 21.4 | 2.4 |
| /de/en/100-years/destinations | 1440 | 18.3 | 0.8 |
| /de/en/articles/explore-the-world/a-perfect-day-berlin-in-one-day | 1440 | 18.6 | 2.0 |
| /de/en/most-significant-route | 1440 | 18.3 | 2.6 |
| /de/en/discover-lufthansa/take-off | 1440 | 19.6 | 4.5 |
| /de/en/articles/explore-flying | 390 | 21.1 | 7.8 |
| /de/en/discover-lufthansa/take-off | 390 | 19.3 | 6.3 |
| /de/en/book-and-manage/stopover/neuschwanstein | 1440 | 17.6 | 4.8 |
| /de/en/overview-special-request | 390 | 18.4 | 5.8 |
| /de/en/articles/tags/allegris | 390 | 19.8 | 7.3 |
| /de/en/book-and-manage/stopover/bayerischer-hof | 1440 | 17.5 | 5.1 |
| /de/en/articles/explore-the-world/be-picky-barcelona-insider-tips | 390 | 21.2 | 9.5 |
| /de/en/articles/explore-the-world/eat-see-do-algiers | 390 | 20.0 | 9.2 |
| /de/en/articles/tags/allegris | 1440 | 23.2 | 12.5 |
| /de/en/100-years/campaigns | 1440 | 15.6 | 4.9 |
| /de/en/articles/explore-the-world/on-the-scene-caspar-plautz-munich | 1440 | 13.5 | 3.1 |
| /de/en/articles/explore-flying/7-people-who-shaped-lufthansa-history | 390 | 13.7 | 3.3 |
| /de/en/100-years/history/menu-on-board | 390 | 19.8 | 9.5 |
| /de/en/book-and-manage/stopover/zugspitze | 1440 | 14.8 | 4.5 |

## The worst ten, each with its cause and fix

Read the baseline column with the masking in mind: part of the 104 is the live boxes masked now and not then.

| # | Page-width | % | Cause (located) | Fix |
| --- | --- | --- | --- | --- |
| 1 | /de/en/articles/explore-flying/livery-iconic-moments 1440 | 29.8 | Content: www has extended the article. Our copy carries 115 of www's 193 sentences (59.6 %) and 28 pictures, www 46; "21 min read" against our 13. | Re-import from tonight's recording: reimport-so34-livery-iconic-moments-lh-com.txt, READY. An offline import of lh-parity-008's saved page with main's insights bundle carries 193 of 193 sentences and 46 pictures, with 0 requests out. The pixel gate follows the upload, which brings the 18 new pictures. |
| 2 | /gb/en/articles/highlights/allegris-new-york 1440 | 25.6 | The video player: www draws it 16:9 (its config's aspectRatio), ours takes the poster's 1920x823 shape because the video paragraph has no size token. The page is 222 px short. | delta-so34-allegris-video-ratio-lh-com.txt: the marker with size-1920x1080. 29 READY rows: new-york, business-class-shanghai and business-san-diego in at/de, de/de, de/en, gb/en, xx/es, xx/fr, xx/it and fr/fr (DA only), and premium-economy-san-diego in ar/es, es/es, xx/fr, xx/it and fr/fr (its de/en, de/de, at/de and gb/en have the token already). Draft gate: 26.3 / 16.6 -> 11.0 / 12.3 at 1440 / 390. |
| 3 | /de/en/articles/explore-the-world/picture-perfect-austin 390 | 25.2 | Hardly any drift (+4 to +12 px). The galleries (columns-media stacked): on phones our pictures run to the right edge with a wider crop than www's. | Columns Media: in handover-so33-ema-test.txt (item 5). |
| 4-5 | /de/de and /at/de flughafeninformation 390 | 24.8 | The H1 "Flughafeninformationen" is wider than the phone: www lets it overflow and clips its last letter, ours breaks the word onto a second line. That is +40 px, and everything below sits 40-69 px lower. | None. Matching www would hide text (a clipped H1), which a fix must not do; ours is the readable form. |
| 6 | /de/en/articles/explore-flying/livery-iconic-moments 390 | 24.2 | As #1 (www 25,049 px). | As #1. |
| 7-9 | /at/de, /de/en, /de/de articles/highlights/allegris-new-york 1440 | 24.1, 24.0, 22.4 | As #2. | As #2. Draft gate: at/de 24.7 / 16.4 -> 10.5 / 12.3, de/en 24.7 / 15.3 -> 9.0 / 10.9, de/de 23.1 / 15.4 -> 10.1 / 11.2. xx/it (lh-parity-010) 36.7 / 33.4 -> 28.5 / 30.8; that version is still 735 px short at 1440 (other content, open). |
| 10 | /de/en/100-years 390 | 19.6 | Small drift (-24 / -30 px). www's recording draws the campaign's headings in a fallback face (Arial-like, not LufthansaHead): a recording artefact. 10.1 % of the page is masked video stages. | None: no layout cause. |

The rows reach only the documents they list. No shared code changed tonight, so no no-breakage render was needed. The
next ones, below the ten (13-17 %), checked afterwards:
- the allegris-new-york 390 versions: #2's rows (15.3-16.6 -> 10.9-12.3);
- culinaryjourney 390 (16.9): section spacing (the H1 24 px low, a white gap of about 46 px between the form's grey area
  and the grey "Need help?" section): in the hand-over (item 6);
- book-and-manage/stopover 390 (14.0, drift to -93 px in the lower half): its carousel-cards slides are of equal height
  and about 32 px shorter than www's, because our text runs narrower than www's (sweep-lh-004.md's open cause: 18 px
  LufthansaText 1.3-1.4 % narrower), so the tallest card wraps a line less. Checked tonight: our font files are
  byte for byte www's (LufthansaTextWeb-Regular / -Bold and LufthansaHeadWeb-Light .woff2: the same sha256 as
  lh-parity-008's www files, mausy v1.41.0 there, v1.38.0 here), so the narrower text is the drawing (the recordings'
  machine against this one), not our site;
- tags/munich: the article list's content; the 100-years pages: campaign videos masked, drawn content.

## The next 20 places (standing order 38, item 2)

These are the 20 page-widths ranked highest in this sweep that orders 34 to 37 had not handled. Order 34 handled the
worst ten, the allegris-new-york 390 versions, culinaryjourney 390, stopover 390 and tags/munich 390. That leaves
ranks 11, 18 and 20 to 37. Each was measured again as served at 09:40 CET (the same figures as the sweep, to 0.1),
with its drift steps (logs/b460/offsets.mjs), box values from injected queries and www's bd-snapshots (logs/b638,
not in git).

| Rank | Page-width | % | Cause (located) | Fix |
| --- | --- | --- | --- | --- |
| 11 | /de/en/articles/explore-the-world/picture-perfect-austin 1440 | 18.1 | The galleries (columns-media), as at 390: their rows alternately 84 px taller and back (+84, +1, +84, +1, +69, -16 px). | Columns Media: hand-over item 5, extended to 1440. |
| 18, 22 | /de/en/100-years/global-network 390 / 1440 | 15.0 / 13.6 | 35 of www's 37 picture captions are missing (www's snapshot: 37 maui-caption, our copy 2), -78 px by y 1,920 at 390. www's recording also draws the campaign's headings in a fallback face (order 34, #10). | The 100-years captions stay as they are on the owner's word (order 31); no row. The face is the recording's. |
| 20, 21, 24, 25 | /gb/en, /de/en, /at/de, /de/de articles/highlights/all-it-takes-is-a-yes 390 | 14.0, 13.8, 13.1, 13.1 | A campaign page in the article folder. www's recording draws its headings in a fallback face (Arial-like, as 100-years). Its "To the article" links have no arrow on www. Drift within +50 px. | No fix for the face (the recording's). The arrows: a link without an icon is a www component we don't mark, so no row (item 3's mark would cover it). |
| 23 | /de/en/100-years/cabin-design 390 | 13.3 | As #18: 11 captions missing (www 11, ours 0), plus the fallback face. | As #18. |
| 26 | /de/en/articles/tags/munich 1440 | 13.1 | The article list: www's and ours list other articles in another order (+47 to +105 px through the list); order 34 found the same at 390. | No fix: the list follows our article index, www's follows its own. |
| 27 | /de/en/articles/explore-the-world/what-i-learned-living-in-barcelona 390 | 12.7 | (1) The author quote: www's .author-quote has mx-3, 16 px on both sides; our article blockquote (styles.css) has 16 px on the left only, so its text box is 16 px wider and the quote runs a line shorter (-31 px). (2) 20 px less from the caption above to the quote. (3) The body text breaks a word earlier on www, the open font-width question (order 34). | (1) **Located, not shipped:** margin-right 16px on phones. It reaches 601 documents with an author quote, and their no-breakage renders don't fit this order; the gate on the 10 recorded ones comes first. |
| 28, 30, 31 | /de/en, /at/de, /de/de articles/tags/allegris 1440 | 12.5, 12.1, 12.1 | The wide stage teaser below the list ("Lufthansa Allegris - The New Long-Haul Experience"): www draws it under .gradient-black-vertical, ours under www's horizontal gradient, the one our option wide always uses. | **Shipped** (f7da9b9): cards-teaser option vertical, used by no other page, and delta-so38-allegris-teaser-vertical-lh-com.txt, 6 READY. de/en 12.5 / 7.3 -> 10.9 / 6.9 %, de/de and at/de 12.1 / 6.3 -> 10.6 / 6.0, gb/en 10.6 / 4.3 -> 9.0 / 3.9. |
| 29 | /de/en/100-years/chronicle 1440 | 12.2 | (1) Its three jump links stand 215 px apart on www and spread over the row in ours (430 px). (2) The stage below them starts 37 px higher. (3) 3 captions missing (as #18). | (1)-(2) Not tonight: the jump-links block's layout reaches every page with jump links. (3) As #18. |
| 32 | /de/en/articles/explore-flying/anniversary-super-crane-special 390 | 12.0 | After the separator above "An Iconic Design to Celebrate Lufthansa's 100th Anniversary", 19 px more than www before the heading; captions 4 px lower each. | The separator's space: hand-over item 15. |
| 33 | /de/en/100-years 1440 | 11.9 | Drift within 24 px; the campaign's videos (masked) and www's fallback face (order 34, #10). | None. |
| 34 | /de/en/book-and-manage/stopover 1440 | 11.8 | The carousel cards about 32 px shorter than www's, as order 34 found at 390: our text runs narrower (the font-width question; our font files are www's, byte for byte), -72 px by y 7,680. | No fix: the drawing, not our site. |
| 35 | /de/en/100-years/fleet 1440 | 11.4 | The aircraft rows: our text column about 625 px wide, www's about 410 (Columns Media), so the rows end 30-99 px shorter. | Columns Media: hand-over item 15. |
| 36 | /de/en/munich-fair 1440 | 11.3 | (1) The last section's two text columns stand side by side on www and stacked in ours (+90 px). (2) The grey section's heading wraps in ours (two lines, www one). | (1) Hand-over item 15 (a two-column Columns Media block). (2) The headings' two-thirds width on campaign pages (brief 506), not tonight. |
| 37 | /de/en/articles/explore-the-world/a-perfect-day-barcelona-in-one-day 390 | 11.1 | Steps of -22 to +24 px; pictures and dense text. | None: under 1 % of the page. |
