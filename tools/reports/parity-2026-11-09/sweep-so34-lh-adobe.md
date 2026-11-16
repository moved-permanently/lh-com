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

## Places 39 to 58 (standing order 39, item 4)

These are the next 20 page-widths of this sweep after the ones order 38 covered (its ranks 11 to 37). Each was
measured again as served at 12:10 CET with the same method, with its drift steps and www's bd-snapshots (logs/b639,
not in git).

| Rank | Page-width | Sweep -> now % | Cause (located) | Fix |
| --- | --- | --- | --- | --- |
| 39, 47 | /de/en, /at/de articles/highlights/all-it-takes-is-a-yes 1440 | 10.6 -> 20.5, 9.7 -> 20.4 | The fare teaser ("Our recommendations") is a live box: today our host drew 4 offers in it, where www's recording and our de/de copy drew 7. That makes the page 132-142 px short from y 3,440 on. The rest as #40. | No fix: live fares, which this machine doesn't ask for; the next load can draw 7 again. |
| 40, 48 | /gb/en, /de/de articles/highlights/all-it-takes-is-a-yes 1440 | 10.6 -> 10.6, 9.7 -> 9.7 | www's recording draws this campaign's headings in a fallback face (Arial-like, as 100-years, order 34 #10); drift within 16 px. | No fix: the recording's face. |
| 41 | /gb/en/articles/tags/allegris 1440 | 10.6 -> 9.0 | The wide teaser's gradient. | Fixed: order 38's vertical row, live. |
| 42 | /de/en/100-years/campaigns 390 | 10.4 -> 10.4 | The poster slider stands 35 px nearer its heading than on www (www 85 px from the subheading to the first poster, ours 50). Below it the text follows at www's distance (71 / 70 px). www's headings are in the recording's fallback face. | Not tonight: the slider's space above it on this one campaign page; it needs its own gate. |
| 43-45 | /at/de, /de/de, /gb/en overview-travel-information 390 | 10.1 -> 10.1 | www's 390 recordings have the Lufthansa Chat Assistant panel open over the top of the page (the 0-800 px bands 57-67 % off). Below it the page is within 6 px. | No fix: the recording's state. |
| 46 | /de/en/articles/explore-the-world/a-perfect-day-berlin-in-one-day 390 | 10.0 -> 9.8 | Steps of -23 to +24 px; the figure is photos a few pixels off. | None. |
| 49, 53-55 | /de/en, /gb/en, /at/de, /de/de 100-years/crane 390 | 9.5, 9.5, 9.4, 9.4 | www's 5 picture captions are missing (our copies have 0), plus www's recorded fallback face. Drift within 14 px, then -55 near the end. | The 100-years captions stay as they are on the owner's word (order 31); the face is the recording's. |
| 50 | /de/en/100-years/history/menu-on-board 390 | 9.5 -> 9.5 | 12 picture captions missing (www 12, ours 0); the top matches. | As #49. |
| 51 | /de/en/articles/explore-the-world/be-picky-barcelona-insider-tips 390 | 9.5 -> 9.8 | The pictures and captions sit 4-8 px lower than www's; the figure is the photos' detail at that offset. | None. |
| 52 | /de/en/articles/highlights/allegris-premium-economy-san-diego 1440 | 9.5 -> 9.5 | The video: www's recording shows a frame of the playing video (its player had loaded the stream, full 16:9). Ours shows the poster, the same portrait file (1920x823) www's player names as its poster, letterboxed in the 16:9 box. | No fix: a moment of the video, not a layout difference. |
| 56 | /de/en/articles/explore-flying/flying-high-christoph-quarch 390 | 9.3 -> 9.3 | (1) The author quote runs a line shorter than www's (www indents it 16 px on both sides, ours on the left only), -31 px. (2) 16 px less from the first picture to the text below it. | (1) **Shipped with item 2:** the quote's right margin on phones, 9.3 -> 5.6. (2) Not tonight. |
| 57 | /de/en/articles/explore-the-world/eat-see-do-algiers 390 | 9.2 -> 9.2 | The "This may also be of interest to you" cards: each picture 2 px taller than www's; within 32 px overall. | None. |
| 58 | /de/en/book-and-manage/stopover/zugspitze 390 | 8.9 -> 8.9 | 32 px more after the map (a columns-media sidebar block with-map) than on www; the map is the same height. | Columns Media: hand-over item 16. |

## Places 59 to 78 (standing order 40, item 2)

These are the next 20 page-widths of this sweep, measured again as served at 15:45 CET. Two first loads stopped on a
block timeout (gb/en special-needs 15.5 %, de/de crane 1440 21.3 %); they were loaded again and read as below. Drift
steps, bands and crops are in logs/b640 (not in git).

| Rank | Page-width | Sweep -> now % | Cause (located) | Fix |
| --- | --- | --- | --- | --- |
| 59 | /de/en/articles/explore-the-world/stop-over-tokyo 390 | 8.8 -> 8.7 | (1) The portrait picture ("fashion influencers"): www shows another crop of it on phones (faces higher, the top cut). (2) The author quote (fixed by order 39's rule). | (1) No fix in layout: www's phone rendition of the picture. |
| 60, 61 | /de/en, /gb/en special-needs 390 | 8.6 -> 6.8 | The core form. Order 37's section spacing took 1.8; within 16 px now, apart from +50 at one step (a radio question, 2,960 px). | None more (the form's field spacing measured worse when closed, order 37). |
| 62 | /at/de/betreuungsbedarf 390 | 8.4 -> 6.9 | As #60. | As #60. |
| 63 | /de/en/articles/explore-the-world/eat-see-do-berlin 390 | 8.4 -> 8.4 | No drift until the end (+31 px). The "This may also be of interest to you" cards: each picture 4-6 px taller than www's (bordered cards). The rest is photos. | Not tonight: the cards' picture ratio; small. |
| 64, 65 | /at/de, /de/de discover-lufthansa/new-onboard-experience 390 | 8.3 -> 8.3 | Within 11 px; the picture collage after the awards badge sits 11 px higher. | None: under 1 %. |
| 66, 73 | /de/en/articles/explore-the-world/know-before-you-go-algiers / -berlin 390 | 8.2 -> 8.3, 8.0 -> 8.0 | (1) 22 px more than www above "Related Articles". (2) The "Find your flight" button 15 px lower. | (1) Hand-over item 17 (section gap). (2) Not tonight. |
| 67, 68, 70, 72 | /de/en, /gb/en, /at/de, /de/de 100-years/destinations 390 | 8.1, 8.1, 8.0, 8.0 | Within 15 px (the picture collage 14 px higher). www's recording draws the campaign headings in its fallback face. No captions on www either. | No fix: the recording's face. |
| 69, 71 | /at/de, /de/de 100-years/crane 1440 | 8.0 -> 8.0 | 5 picture captions missing (owner's decision, order 31); drift within 32 px. | The owner's decision. |
| 74 | /de/en/lufthansa-city/culinaryjourney 1440 | 8.0 -> 8.0 | The H1's section starts 38 px higher than www's, then 24 px. | Already in the hand-over (item 6, section spacing). |
| 75, 77 | /de/en, /gb/en lufthansa-travel-classes 390 | 8.0 -> 8.0 | Within 11 px; the stage tiles' photos under their dark overlay. | None. |
| 76 | /de/en/services-at-the-airport 390 | 8.0 -> 8.0 | (1) Our text runs a word wider per line than www's, so each paragraph is a line shorter (the open font-width question; our font files are www's). (2) The page ends 34 px sooner after the last card. | (1) No fix (the drawing). (2) Hand-over item 17. |
| 78 | /at/de/lufthansa-reiseklassen 390 | 7.9 -> 7.9 | As #75. | None. |

## Places 79 to 98 (standing order 41, item 4)

These are the next 20 page-widths of this sweep, measured again as served at 18:50 CET. Five first loads were redone:
two Frankfurt Fair loads timed out, and /de/de/betreuungsbedarf 390 stopped at 900 px. The sweep's lh-parity-007
recordings of the two Insights hubs were in /tmp, and a restart wiped them, so these two are measured against
lh-parity-002's recordings of the same pages (the figures are not the sweep's). Drift steps, bands and crops are in
logs/b641 (not in git).

| Rank | Page-width | Sweep -> now % | Cause (located) | Fix |
| --- | --- | --- | --- | --- |
| 79 | /de/de/lufthansa-reiseklassen 390 | 7.9 -> 7.9 | Within 12 px; the stage tiles' photos under their dark overlay (as #75). | None. |
| 80 | /de/en/100-years/fleet 390 | 7.9 -> 7.9 | The aircraft spec tables: each row 37-38 px shorter than www's. www's cell keeps its paragraph's margin inside, as at 1440, where we have the rule (brief 500), but not on phones. So each table's box ended up to 115 px short of www's 840 px scrolling box: -140 after the first table. | Shipped: the same 68 px under the text on phones (table-striped, beside options only). Gate: 7.9 -> 6.4, the drift within 40 px, 1440 11.4 -> 11.4; the 6 other fleet documents rendered with and without, no breakage. |
| 81 | /de/en/articles/explore-the-world/be-picky-frankfurt-insider-tips 390 | 7.9 -> 7.9 | Within 12 px throughout; the rest is photos. | None. |
| 82 | /de/de/betreuungsbedarf 390 | 7.8 -> 6.9 | The core form (as #60): order 37's section spacing took 0.9. | None more. |
| 83, 94 | /de/de, /at/de speisen-und-getraenke 390 | 7.8, 7.6 -> 7.8, 7.6 | (1) 30 px less above "Häufig gestellte Fragen" after the last card (www 70 px from the card's foot to the heading, ours 40). (2) One FAQ question wraps a line more (the chevron's column). | (1) Hand-over item 18 (section gap). (2) None: under 1 %. |
| 84, 87 | /de/en, /gb/en 100-years/crane 1440 | 7.8 -> 7.8 | 5 picture captions missing (owner's decision, order 31); drift within 32 px. | The owner's decision. |
| 85 | /de/en/articles/explore-flying 390 | 7.8 -> 8.7 (vs lh-parity-002) | The article list: ours lists newer articles (October 2026) than the recording does. This is content, not layout. | None. |
| 86 | /de/en/articles/explore-the-world/what-i-learned-living-in-frankfurt 390 | 7.8 -> 7.8 | (1) The article end "Ready to discover the world?": "Find flight" and "Back to overview" 10-15 px lower (www's small arrow beside the link; ours is the standard link arrow). (2) 22 px more above "Related Articles". (3) The related cards come in another order (the index's). | (1) No fix, as item 3's button (below). (2) Hand-over item 17. (3) None: content. |
| 88 | /de/en/articles/explore-flying/anniversary-super-crane-special 1440 | 7.7 -> 7.7 | Within 31 px; photos. | None. |
| 89 | /de/en/articles/explore-the-world 1440 | 7.7 -> 8.1 (vs lh-parity-002) | (1) 26 px less above "Discover your dream destinations with us!" (www 93 px from the text to the heading, ours 67). (2) The results list holds other articles (433 vs 421 results). | (1) Hand-over item 18. (2) None: content. |
| 90 | /de/en/articles/explore-the-world/on-the-scene-caspar-plautz-munich 390 | 7.7 -> 7.6 | As #86: 6 px more before "Back to overview", 23 px more above "Related Articles", about 2 px more per related card. The third related article is another one (Toronto, not Zagreb). | Hand-over item 17; the rest none. |
| 91, 92 | /de/en, /gb/en frankfurt-fair 1440 | 7.7 -> 7.7 | (1) 39 px less above "The benefits of travelling with Lufthansa to Messe Frankfurt" (www 113 px from the text to the heading, ours 74). (2) The four benefit cards' columns are about 9 px wider than www's, so their texts wrap differently. The page ends 76 px shorter. | (1) Hand-over item 18. (2) Not tonight. |
| 93, 95 | /at/de, /de/de frankfurt-fair 390 | 7.6 -> 7.6 | Within 37 px (the stage, then within 18). | None. |
| 96, 97 | /at/de, /de/de services-am-flughafen 390 | 7.5 -> 7.5 | Within 26 px; the text runs a word wider per line, as #76. | None (the drawing). |
| 98 | /de/en/articles/authors/florian-tomberg 1440 | 7.5 -> 7.5 | The "Our Authors" cards: www's are 119 px taller (61 px more under the portrait, 42 px more under the text, and a fourth line of text). www's stylesheet has no such space: its card and image components (maui-card height full, maui-image) size themselves. On /de/en/articles/explore-flying at 1440, www's cards are as tall as ours. | No fix passes. A rule with 60 px under the portrait and under the text: florian-tomberg 1440 7.5 -> 2.9 and explore-the-world 1440 8.1 -> 4.2, but florian-tomberg 390 4.5 -> 8.4, explore-flying 1440 1.1 -> 7.4 and 390 8.7 -> 9.2, explore-the-world 390 7.6 -> 8.8. Not shipped. |

## Places 99 to 118 (standing order 42, item 3)

These are the next 20 page-widths of this sweep, measured again as served at 21:15 CET. The sweep's lh-parity-007
recording of /de/en/articles/explore-the-world 390 is gone, so that page is measured against lh-parity-002's. Drift
steps, bands and crops are in logs/b642 (not in git).

| Rank | Page-width | Sweep -> now % | Cause (located) | Fix |
| --- | --- | --- | --- | --- |
| 99 | /de/en/articles/explore-the-world/in-my-hood-chiswick-london 390 | 7.5 -> 7.5 | Within 23 px until the related cards (+48), then back to 0. Photos. | None. |
| 100, 101 | /de/en, /gb/en discover-lufthansa/new-onboard-experience 390 | 7.5 -> 7.5 | Within 8 px (as #64): photos and the picture collage. | None. |
| 102 | /gb/en/services-at-the-airport 390 | 7.5 -> 7.5 | Within 26 px; the text runs a word wider per line (as #76). | None (the drawing). |
| 103 | /de/en/articles/explore-the-world 390 | 7.4 -> 7.6 (vs lh-parity-002) | (1) 35 px less above "Discover your dream destinations with us!" (as #89 at 1440). (2) The results list holds other articles (+139 from 3,920). | (1) Hand-over item 18 (ema-test). (2) None: content. |
| 104 | /de/en/articles/explore-the-world/essentials-barcelona-facts 390 | 7.3 -> 7.6 | (1) A paragraph with the inline link "→ history" wraps one line more than www's (the inline link's arrow is wider). (2) The illustration sits 10 px lower. (3) At the article's end, www's "Find flight" is a text link with the small inline arrow; ours is a standalone link (big arrow, 27 px line), 5-10 px lower. (4) 22 px more above "Related Articles". | (1)-(2) Not tonight (under 1 % each). (3) Hand-over item 20 (Columns Media). (4) Hand-over item 17. |
| 105 | /de/en/articles/highlights/allegris-premium-economy-san-diego 390 | 7.3 -> 7.3 | The related cards: newer articles than the recording (+53 to +83 from 5,680). Above them within 16 px. | None: content. |
| 106 | /de/en/articles/tags/allegris 390 | 7.3 -> 6.9 | (1) The grey band's Allegris teaser lacks its "Conditions" label: gb/en, at/de and de/de got it in the 546 re-import, de/en was not on that list. So the page ends 64-87 px short. (2) Before the band, within 55 px (the article cards). | (1) READY row: delta-so42-adobe-tags-allegris-conditions.txt. As a draft: 1440 10.9 -> 9.0, 390 6.9 -> 3.9. |
| 107, 108 | /de/en, /gb/en frankfurt-fair 390 | 7.3 -> 7.3 | Within 37 px (the stage), then within 18 (as #93). | None. |
| 109-111, 114 | /at/de, /de/de, /gb/en, /de/en digital-self-services 390 | 7.2, 7.2, 7.1, 7.0 -> the same | Within 35 px. The step: 21 px less from the separator to "Das könnte Sie auch interessieren" / "You might also be interested in" (www 58 px, ours 37). | Hand-over item 19 (a heading after a separator, ema-test's heading spacing). |
| 112 | /de/en/100-years/chronicle 390 | 7.0 -> 7.0 | Within 14 px. Photos. | None. |
| 113 | /de/en/articles/explore-the-world/eat-see-do-algiers 1440 | 7.0 -> 6.9 | Within 20 px. Photos. | None. |
| 115, 116 | /de/en, /gb/en food-and-beverages 390 | 7.0 -> 7.0 | The English version of #83: 32 px less above the FAQ heading after the last card; one FAQ question wraps a line more. | Hand-over item 18; the rest none. |
| 117, 118 | /at/de, /de/de articles/highlights/allegris-premium-economy-san-diego 1440 | 6.9 -> 6.9 | (1) www's heading "Zum Download des Posters einfach auf das Bild klicken" runs the page's width (from x 133, one line); ours runs the text column (from x 207) and wraps to two lines: +30. (2) The separator after it is the page's width on www, the text column's on ours. (3) The related cards (as #105). | (1)-(2) Hand-over item 19 (heading width, ema-test's heading rules). (3) None: content. |

## Places 119 to 148 (standing order 43, item 1)

These are the next 30 page-widths of this sweep, measured again as served at 22:40 CET. Drift steps, bands and crops
are in logs/b643 (not in git).

| Rank | Page-width | Sweep -> now % | Cause (located) | Fix |
| --- | --- | --- | --- | --- |
| 119-121, 123 | /at/de, /de/de, /de/en, /gb/en additional-services 390 | 6.8, 6.8, 6.7, 6.7 -> the same | Within 13 px throughout. The worst bands are text on a photo (the "Well looked after on your trip" teaser): ours sits 4-7 px higher over a textured picture. | None: under 1 %. |
| 145, 148 | /de/en, /gb/en additional-services 1440 | 5.8 -> 5.8 | As above: within 7 px; the teaser's text wraps a word differently over the photo. | None. |
| 122 | /de/en/articles/explore-the-world/stop-over-tokyo 1440 | 6.7 -> 7.6 | (1) Since the sweep only one thing changed in ours: the Price Bar ("Tokyo, round trip from 982 €") is not drawn tonight. Its price call returned nothing (data source "none"), so the bar hid. Everything else in our capture is pixel-identical to the sweep's. (2) The portrait picture: www's 1440 rendition is cropped lower (as #59 at 390). | (1) None in layout: the price feed (not verifiable from here, no requests to airline hosts). (2) None: www's rendition. |
| 130 | /de/en/articles/explore-the-world/what-i-learned-living-in-barcelona 1440 | 6.3 -> 7.1 | (1) The Price Bar, as #122. (2) 28 px less above the author quote after the two-picture row (www 100 px from the captions to the quote, ours 70). | (1) None. (2) Hand-over item 21: the quote follows a columns-media stacked picture row, so it is Columns Media's boundary. |
| 124, 125 | /at/de, /de/de frankfurt-fair 1440 | 6.5 -> 6.5 | As #91: less above the first heading after the intro text, the benefit cards' columns wider. | Hand-over item 18. |
| 126, 128 | /at/de, /de/de articles/tags/allegris 390 | 6.3 -> 6.0, 6.6 | The "Conditions" label is in place on both. Within 55 px (the article cards), the page ends level. The 0.3 either way is load noise. | None. |
| 127, 129, 138, 140 | /at/de, /de/de, /de/en, /gb/en meetings-and-events 390 | 6.3, 6.3, 6.0, 6.0 -> 6.1, 6.1, 5.7, 5.7 | Within 14 px; the bands spread evenly over text and photos. | None. |
| 131 | /de/en/discover-lufthansa/take-off 390 | 6.3 -> 6.3 | www changed the content after our snapshot: "More about Impact Fares" and another picture. Our copy and the 10-22 snapshot have "Green Fares". Layout within 18 px. | A content refresh (a new capture of www), not a row from here. |
| 132, 133 | /de/en, /gb/en discover-lufthansa/new-onboard-experience 1440 | 6.2 -> 6.2 | Within 5 px after the stage. Photos. | None. |
| 134 | /de/en/100-years/cabin-design 1440 | 6.1 -> 6.0 | The film still: www's recording caught another frame of the cabin video. Drift within 14 px. | None. |
| 135 | /de/en/munich-fair 390 | 6.1 -> 6.1 | 36 px less from the stage picture to the first text (www 73, ours 37); then 29 px more from the text to the grey band, so it evens out. | Hand-over item 21 (section gaps, both directions). |
| 136 | /de/en/articles/explore-the-world/be-picky-barcelona-insider-tips 1440 | 6.0 -> 6.1 | The article-end teaser (Columns Media): its picture is 20 px shorter than www's, and its "Find flight" is the item 20 link. Then 17 px more above "Related Articles". | Hand-over items 20 and 17. |
| 137 | /de/en/homepage 1440 | 6.0 -> 12.1 (13.2 on a second load) | www's recording has a flash notice ("Information on flights to Dubai", 44 px) above the flight search. Our flash teaser (the Message Center index) holds no current message tonight, so everything below sits 44 px higher. The deals' prices are live on both and differ. | None: the current messages decide. |
| 139, 141-143 | /de/en, /gb/en most-significant-route, /at/de, /de/de bedeutsamste-strecken 390 | 6.0, 6.0, 5.9, 5.9 -> the same | The stopover example: www's paragraph before the list ends in two line breaks and the one after starts with one. So www has about 28 px more above and below the list, and its bullets sit inside (a wider indent). Our page is as tall as www's anyway (2,780 / 2,783), because ours leaves 29 px more before the footer. | No row passes. "{spacer-27}" before and after the list made all eight page-widths worse (390 6.0 -> 7.6, 1440 2.6 -> 5.3). |
| 144 | /de/en/100-years/history 390 | 5.9 -> 5.9 | Within 14 px; the route map picture 7 px higher. | None. |
| 146 | /de/en/articles/explore-flying/flying-high-christoph-quarch 1440 | 5.8 -> 5.8 | The header picture is 12 px shorter than www's, and 10 px less from it to the text: -22, then within 32. | None: under 1 %. |
| 147 | /de/en/overview-special-request 390 | 5.8 -> 5.8 | Within 13 px. Text. | None. |
