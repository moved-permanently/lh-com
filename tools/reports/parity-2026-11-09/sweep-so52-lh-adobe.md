# lufthansa.com insights, campaign, hub and homepage pages, standing order 52 (2026-11-17, about 14:10-15:20 CET)

sweep-so44-lh-adobe.md measured again as served, with the code deployed after 197f797 (this order's heading rules) and
everything shipped since order 44 (ema-test's caption, author-quote, article-heading, article-end and hub-stage rules;
order 49's video still): the same 276 page-widths plus lh-parity-015's 10 (livery-iconic-moments, allegris-new-york
de/en, de/de, at/de, gb/en), 286 in all, at 1440 and 390, against each page's newest recording (tools/parity/compare.js,
the first 8,000 px, the captures' live boxes masked, logs/b539/geo.css on both sides). All 286 answered 200. The homepage
again against its recording with the ended Dubai notice cut (logs/b644/home-*-nonotice.png).

Every host but ours and aem refused in the browser (capture-d.cjs since order 48), as the orders ask. Order 44's sweep
still let www answer the page's own calls, so three kinds of page-width read further now without any change to the page
(same document, same heights or the box's height alone):
- fluege / flights (4 pages x 2 widths): the destination finder draws no results without www's data (622 px at 390
  against 7,725 in order 44); 0.0-0.1 % then, 33-46 % now;
- culinaryjourney (2 pages x 2 widths): www's micro-frontend draws 400 px instead of 777 (390) / 463 (1440);
- Insights articles at 1440 (10 page-widths, +0.5 to +1.1): the Price Bar is not drawn without www's prices, so its
  90 px band is no longer masked; the same heights and drift as order 44 (logs/b460/offsets.mjs on both captures);
  the homepage 1440 4.8 -> 6.3 the same way (29 px shorter at the flight widget).
Without the first two kinds: 274 page-widths, median 5.6 %, 83 at 7 % or more (order 44's 96 included them at 0-17 %).

Closer by 0.5 or more since order 44: 32 page-widths (allegris-new-york x8 9-11 -> 3.1-5.2, allegris-premium-economy-san-diego,
what-i-learned-living-in-barcelona 1440 7.1 -> 4.9, munich-fair 1440 11.3 -> 9.8, frankfurt-fair 1440 x4, explore-the-world
1440, digital-self-services 390 x4 and others). Further by 0.5 or more: 22, all of the three kinds above.

Every page-width at 7 % or more has a located cause: the sweep-so44 places (its cause and fix columns hold) or one of the
three kinds above. One rule came out of it after this table was measured: frankfurt-fair's text sits 16 / 15 px
lower under the stage picture on www, and 40 px under the picture before a column view of full-width text took the 4
locales 390 7.3-7.6 -> 5.9-6.1 and 1440 4.5-5.6 -> 3.8-4.7 (f6c5de4; gate-so52-adobe-heading-gaps.txt). The other tries
are in the final section of ema-adobe.md (item 20's 1440 half: further on 7 page-widths, not shipped).

Runner logs/b652/sweep-shard.sh (4 shards), ranking logs/b652/rank.py; captures and diffs in logs/b652/sweep (not in git).

## Per template

| Template | Page-widths | Median % now | >= 15 % | >= 10 % | >= 7 % | Median in order 44 (the same page-widths) |
| --- | --- | --- | --- | --- | --- | --- |
| insights | 92 | 5.5 | 3 | 14 | 35 | 7.0 |
| campaign | 72 | 7.2 | 5 | 13 | 37 | 7.3 |
| hub | 120 | 5.5 | 10 | 13 | 23 | 4.9 |
| homepage | 2 | 6.0 | 0 | 0 | 0 | 5.2 |
| all | 286 | 5.6 | 18 | 40 | 95 | 5.7 |

## The 95 page-widths at 7 % or more, with their cause

| # | Page-width | % now | % order 44 | Cause and fix |
| --- | --- | --- | --- | --- |
| 1 | /de/de/fluege 390 | 45.8 | 0.1 | The destination finder draws no results: its data comes from www, refused per request since order 48 (622 px at 390 against 7,725 with data in order 44, which allowed it). Not the page. |
| 2 | /de/en/flights 390 | 44.8 | 0.1 | The destination finder draws no results: its data comes from www, refused per request since order 48 (622 px at 390 against 7,725 with data in order 44, which allowed it). Not the page. |
| 3 | /at/de/fluege 390 | 43.9 | 0.1 | The destination finder draws no results: its data comes from www, refused per request since order 48 (622 px at 390 against 7,725 with data in order 44, which allowed it). Not the page. |
| 4 | /gb/en/flights 390 | 43.8 | 0.1 | The destination finder draws no results: its data comes from www, refused per request since order 48 (622 px at 390 against 7,725 with data in order 44, which allowed it). Not the page. |
| 5 | /de/en/lufthansa-city/culinaryjourney 390 | 38.1 | 11.1 | The micro-frontend (www's app) draws 400 px instead of 777 with www refused (order 44 allowed it). Not the page. |
| 6 | /at/de/fluege 1440 | 34.1 | 0.0 | The destination finder draws no results: its data comes from www, refused per request since order 48 (622 px at 390 against 7,725 with data in order 44, which allowed it). Not the page. |
| 7 | /de/en/flights 1440 | 34.1 | 0.0 | The destination finder draws no results: its data comes from www, refused per request since order 48 (622 px at 390 against 7,725 with data in order 44, which allowed it). Not the page. |
| 8 | /de/de/fluege 1440 | 33.8 | 0.0 | The destination finder draws no results: its data comes from www, refused per request since order 48 (622 px at 390 against 7,725 with data in order 44, which allowed it). Not the page. |
| 9 | /gb/en/flights 1440 | 33.1 | 0.0 | The destination finder draws no results: its data comes from www, refused per request since order 48 (622 px at 390 against 7,725 with data in order 44, which allowed it). Not the page. |
| 10 | /de/en/culinaryjourney 390 | 32.6 | 16.9 | The micro-frontend (www's app) draws 400 px instead of 777 with www refused (order 44 allowed it). Not the page. |
| 11 | /de/en/articles/explore-the-world/picture-perfect-austin 390 | 25.4 | 25.4 | sweep-so44 #1, 5: The galleries (columns-media stacked): on phones our pictures run to the right edge with a wider crop than www's; at 1440 the gallery rows step +84 /  Fix: Columns Media: hand-over item 5 (ema-test). The Price Bar: none (www's prices, r |
| 12 | /at/de/flughafeninformation 390 | 24.8 | 24.8 | sweep-so44 #2, 3: The H1 "Flughafeninformationen" is wider than the phone. www lets it overflow and clips its last letter; ours breaks the word onto a second line (+40  Fix: None: matching www would hide text. |
| 13 | /de/de/flughafeninformation 390 | 24.8 | 24.8 | sweep-so44 #2, 3: The H1 "Flughafeninformationen" is wider than the phone. www lets it overflow and clips its last letter; ours breaks the word onto a second line (+40  Fix: None: matching www would hide text. |
| 14 | /de/en/100-years 390 | 19.7 | 19.7 | sweep-so44 #4: Drift -30 px. www's recording draws the campaign headings in a fallback face (not LufthansaHead); 10.1 % is masked video stages. Fix: None: the recording's face. |
| 15 | /de/en/articles/explore-the-world/picture-perfect-austin 1440 | 18.8 | 18.8 | sweep-so44 #1, 5: The galleries (columns-media stacked): on phones our pictures run to the right edge with a wider crop than www's; at 1440 the gallery rows step +84 /  Fix: Columns Media: hand-over item 5 (ema-test). The Price Bar: none (www's prices, r |
| 16 | /de/en/articles/tags/munich 390 | 16.6 | 16.6 | sweep-so44 #8, 15: The article list's content: newer articles than the recording, the drift rising card by card (+46 to +105). Fix: None: content. |
| 17 | /de/en/lufthansa-city/culinaryjourney 1440 | 15.3 | 8.0 | The micro-frontend (www's app) draws 400 px instead of 463 with www refused (order 44 allowed it), the page 63 px shorter; before that, sweep-so44's hand-over item 6. |
| 18 | /de/en/100-years/global-network 390 | 15.0 | 15.0 | sweep-so44 #9, 11: 35 of www's 37 picture captions are missing (-78 px by y 1,920 at 390), and the recording's fallback face. Fix: The owner's decision on the 100-years captions (order 31). |
| 19 | /de/en/book-and-manage/stopover 390 | 14.0 | 14.0 | sweep-so44 #10: The carousel-cards slides are equal height and about 32 px shorter than www's: our text runs narrower (the font-width question; our font files are www Fix: None (the drawing). |
| 20 | /de/en/100-years/global-network 1440 | 13.6 | 13.6 | sweep-so44 #9, 11: 35 of www's 37 picture captions are missing (-78 px by y 1,920 at 390), and the recording's fallback face. Fix: The owner's decision on the 100-years captions (order 31). |
| 21 | /gb/en/articles/highlights/all-it-takes-is-a-yes 390 | 13.6 | 13.6 | sweep-so44 #12, 13, 16, 17: The recording's fallback face on the campaign headings; the "To the article" links have no arrow on www. Drift within +57 px. Fix: None: the face is the recording's; the arrowless link is a www component we don' |
| 22 | /de/en/articles/highlights/all-it-takes-is-a-yes 390 | 13.4 | 13.4 | sweep-so44 #12, 13, 16, 17: The recording's fallback face on the campaign headings; the "To the article" links have no arrow on www. Drift within +57 px. Fix: None: the face is the recording's; the arrowless link is a www component we don' |
| 23 | /de/en/100-years/cabin-design 390 | 13.3 | 13.3 | sweep-so44 #14: 11 captions missing (www 11, ours 0), the fallback face, and 10.1 % masked video. Fix: The owner's decision (as #9). |
| 24 | /de/en/articles/tags/munich 1440 | 13.1 | 13.1 | sweep-so44 #8, 15: The article list's content: newer articles than the recording, the drift rising card by card (+46 to +105). Fix: None: content. |
| 25 | /at/de/articles/highlights/all-it-takes-is-a-yes 390 | 12.8 | 12.8 | sweep-so44 #12, 13, 16, 17: The recording's fallback face on the campaign headings; the "To the article" links have no arrow on www. Drift within +57 px. Fix: None: the face is the recording's; the arrowless link is a www component we don' |
| 26 | /de/de/articles/highlights/all-it-takes-is-a-yes 390 | 12.8 | 12.8 | sweep-so44 #12, 13, 16, 17: The recording's fallback face on the campaign headings; the "To the article" links have no arrow on www. Drift within +57 px. Fix: None: the face is the recording's; the arrowless link is a www component we don' |
| 27 | /de/en/100-years/chronicle 1440 | 12.2 | 12.2 | sweep-so44 #19: (1) Its three jump links stand 215 px apart on www and spread over the row in ours. (2) The stage below starts 37 px higher. (3) 3 captions missing. Fix: (1) Located tonight: on www the three links are a three-column view nested in th |
| 28 | /de/en/100-years 1440 | 12.0 | 11.9 | sweep-so44 #20: As #4 (drift -24 px, then within 17). Fix: None. |
| 29 | /de/en/book-and-manage/stopover 1440 | 11.8 | 11.8 | sweep-so44 #21: As #10 at 1440: the carousel cards' text runs narrower (the font width), the drift to -72 px in the lower half. Fix: None (the drawing). |
| 30 | /de/en/articles/explore-the-world/what-i-learned-living-in-barcelona 390 | 11.7 | 12.4 | sweep-so44 #18: (1) 20 px less from the caption row to the author quote (a columns-media picture row). (2) The body text breaks a word earlier on www (the font width) Fix: (1) Hand-over item 21. (2) None. |
| 31 | /de/en/100-years/fleet 1440 | 11.4 | 11.4 | sweep-so44 #24: The aircraft rows: our text column wider than www's (Columns Media), so the rows end 30-99 px shorter; drift to -216. Fix: Columns Media: hand-over item 15. |
| 32 | /de/en/articles/explore-the-world/a-perfect-day-barcelona-in-one-day 390 | 11.3 | 11.1 | sweep-so44 #26, 37: Within 24 px. The bands are the photo rows and their captions: the pictures' crops, and the caption spacing within 3 px. Fix: Columns Media photo captions: ema-test's item 17. |
| 33 | /de/en/articles/explore-flying/anniversary-super-crane-special 390 | 10.8 | 10.8 | sweep-so44 #28: Within 28 px; the bands are spread evenly over text and photos. Fix: None: under 1 % per step. |
| 34 | /at/de/articles/tags/allegris 1440 | 10.6 | 10.6 | sweep-so44 #29, 31: -27 px at the stage, then -44 to -74 from the grey "Tauchen Sie tiefer in die Welt von Lufthansa Allegris ein" band on: ours starts the band 15 px soo Fix: Hand-over item 22 (section gap). |
| 35 | /de/de/articles/tags/allegris 1440 | 10.6 | 10.6 | sweep-so44 #29, 31: -27 px at the stage, then -44 to -74 from the grey "Tauchen Sie tiefer in die Welt von Lufthansa Allegris ein" band on: ours starts the band 15 px soo Fix: Hand-over item 22 (section gap). |
| 36 | /de/en/culinaryjourney 1440 | 10.5 | 2.4 | The micro-frontend (www's app) draws 400 px instead of 463 with www refused (order 44 allowed it), the page 63 px shorter; before that, sweep-so44's hand-over item 6. |
| 37 | /at/de/overview-travel-information 390 | 10.1 | 10.1 | sweep-so44 #34-36: the recording has www's chat assistant open over the first screen; below it within 6 px. Fix: none (the recording's state). |
| 38 | /de/de/overview-travel-information 390 | 10.1 | 10.1 | as #37. |
| 39 | /gb/en/overview-travel-information 390 | 10.1 | 10.1 | as #37. |
| 40 | /de/en/articles/explore-the-world/a-perfect-day-berlin-in-one-day 390 | 10.0 | 10.0 | sweep-so44 #26, 37: Columns Media photo captions (ema-test's item 17). |
| 41 | /de/en/munich-fair 1440 | 9.8 | 11.3 | sweep-so44 #25: (1) 55 px less from the stage picture to the first text (www 84 px, ours 29). (2) The grey band's H2 "From the airport to Messe München (Munich Trade  Fix: (1)-(2) Hand-over item 22 (section gap, heading width). (3) None. |
| 42 | /de/en/articles/explore-the-world/be-picky-barcelona-insider-tips 390 | 9.7 | 9.5 | sweep-so44 #42: The pictures and captions sit 4-8 px lower than www's, within 22 px; the figure is the photos' detail at that offset. Fix: None. |
| 43 | /de/en/100-years/campaigns 390 | 9.5 | 9.5 | sweep-so44 #39: Within 24 px since orders 40-41's slider and quote rules. The recording's fallback face on the campaign headings (as #4). Fix: None. |
| 44 | /de/en/100-years/crane 390 | 9.5 | 9.5 | sweep-so44 #40: Picture captions missing (the owner's decision, order 31), the recording's face; drift within 14 px, -55 at the end. Fix: The owner's decision. |
| 45 | /de/en/100-years/history/menu-on-board 390 | 9.5 | 9.5 | sweep-so44 #41: 12 picture captions missing (www 12, ours 0); drift within 30 px (one -274 step at 5,840 is the offsets matching a repeated picture, gone at the next  Fix: The owner's decision on the 100-years captions (order 31). |
| 46 | /gb/en/100-years/crane 390 | 9.5 | 9.5 | sweep-so44 #44-46: 5 picture captions missing (the owner's decision, order 31), the recording's fallback face. |
| 47 | /at/de/100-years/crane 390 | 9.4 | 9.4 | as #46. |
| 48 | /de/de/100-years/crane 390 | 9.4 | 9.4 | as #46. |
| 49 | /de/en/articles/explore-the-world/eat-see-do-algiers 390 | 9.4 | 9.2 | sweep-so44 #48: The "This may also be of interest to you" cards stand 2 px lower each, +32 at the end. Fix: None: under 1 % (order 41, item 3). |
| 50 | /de/en/articles/tags/allegris 1440 | 9.0 | 9.0 | sweep-so44 #49, 50: The stage -27 px, then -43 to -80 from the grey band on (as #29: the band starts 15 px sooner). de/en's "Conditions" row is live (12.5 in sweep-so34). Fix: Hand-over item 22. |
| 51 | /gb/en/articles/tags/allegris 1440 | 9.0 | 9.0 | sweep-so44 #49, 50: The stage -27 px, then -43 to -80 from the grey band on (as #29: the band starts 15 px sooner). de/en's "Conditions" row is live (12.5 in sweep-so34). Fix: Hand-over item 22. |
| 52 | /de/en/articles/explore-the-world/stop-over-tokyo 390 | 8.9 | 8.7 | sweep-so44 #51: The portrait picture: www's phone crop (faces higher); +92 at 4,480 is the offsets on that picture, back to -12 next; the end +37-42. Fix: None: www's rendition. |
| 53 | /de/en/articles/explore-flying/livery-iconic-moments 390 | 8.7 | 8.7 | sweep-so44 #53: Within 15 px on the first 8,000 px (first screen masked). Photos. Fix: None. |
| 54 | /de/en/articles/explore-the-world/eat-see-do-berlin 390 | 8.5 | 8.5 | sweep-so44 #52: No drift until the end (+31 px): the bordered cards, about 2 px per card. Fix: None: under 1 %. |
| 55 | /at/de/discover-lufthansa/new-onboard-experience 390 | 8.3 | 8.3 | sweep-so44 #54, 55: Within 11 px; the collage after the awards badge 11 px higher. Fix: None: under 1 %. |
| 56 | /de/de/discover-lufthansa/new-onboard-experience 390 | 8.3 | 8.3 | sweep-so44 #54, 55: Within 11 px; the collage after the awards badge 11 px higher. Fix: None: under 1 %. |
| 57 | /de/en/100-years/destinations 390 | 8.1 | 8.1 | sweep-so44 #58, 60: Within 15 px; the recording's fallback face on the headings. Fix: None: the recording's face. |
| 58 | /de/en/articles/explore-the-world/be-picky-frankfurt-insider-tips 390 | 8.1 | 7.9 | sweep-so44 #71: Within 12 px; photos. Fix: None. |
| 59 | /de/en/articles/explore-the-world/know-before-you-go-algiers 390 | 8.1 | 8.2 | sweep-so44 #57, 59: (1) 21-44 px more above "Related Articles". (2) The "Find your flight" button's steps (order 41, item 3). Fix: (1) Hand-over item 17. (2) None. |
| 60 | /de/en/articles/highlights/allegris-premium-economy-san-diego 1440 | 8.1 | 9.5 | sweep-so44 #43: www's recording shows a frame of the playing video, ours the poster; within 16 px. The poster heading's width is hand-over item 19. Fix: None for the frame; item 19. |
| 61 | /gb/en/100-years/destinations 390 | 8.1 | 8.1 | sweep-so44 #58, 60: Within 15 px; the recording's fallback face on the headings. Fix: None: the recording's face. |
| 62 | /at/de/100-years/crane 1440 | 8.0 | 8.0 | sweep-so44 #61, 63, 73, 76: 5 picture captions missing; drift within 32 px. Fix: The owner's decision (order 31). |
| 63 | /at/de/100-years/destinations 390 | 8.0 | 8.0 | sweep-so44 #62, 64: Within 15 px; the recording's fallback face on the headings. Fix: None. |
| 64 | /de/de/100-years/crane 1440 | 8.0 | 8.0 | sweep-so44 #61, 63, 73, 76: 5 picture captions missing; drift within 32 px. Fix: The owner's decision (order 31). |
| 65 | /de/de/100-years/destinations 390 | 8.0 | 8.0 | sweep-so44 #62, 64: Within 15 px; the recording's fallback face on the headings. Fix: None. |
| 66 | /de/en/lufthansa-travel-classes 390 | 8.0 | 8.0 | sweep-so44 #66-70: within 12 px; the stage tiles' photos under their dark overlay. Fix: none. |
| 67 | /de/en/services-at-the-airport 390 | 8.0 | 8.0 | sweep-so44 #67: The text runs a word wider per line (the font width); the page ends 34 px sooner after the last card. Fix: None for the font; hand-over item 17. |
| 68 | /gb/en/lufthansa-travel-classes 390 | 8.0 | 8.0 | as #66. |
| 69 | /at/de/lufthansa-reiseklassen 390 | 7.9 | 7.9 | sweep-so44 #66, 68, 69, 70: Within 12 px; the stage tiles' photos under their dark overlay. Fix: None. |
| 70 | /de/de/lufthansa-reiseklassen 390 | 7.9 | 7.9 | sweep-so44 #66, 68, 69, 70: Within 12 px; the stage tiles' photos under their dark overlay. Fix: None. |
| 71 | /de/en/100-years/crane 1440 | 7.8 | 7.8 | sweep-so44 #61, 63, 73, 76: 5 picture captions missing; drift within 32 px. Fix: The owner's decision (order 31). |
| 72 | /gb/en/100-years/crane 1440 | 7.8 | 7.8 | sweep-so44 #61, 63, 73, 76: 5 picture captions missing; drift within 32 px. Fix: The owner's decision (order 31). |
| 73 | /de/en/articles/explore-flying/anniversary-super-crane-special 1440 | 7.7 | 7.7 | sweep-so44 #77: Within 31 px; photos. Fix: None. |
| 74 | /de/en/articles/explore-the-world/eat-see-do-algiers 1440 | 7.7 | 7.7 | sweep-so44 #79: Our capture is sweep-so34's but for the Price Bar band at y 800: the bar draws no price with airline hosts refused and hides (7.0 in sweep-so34, when  Fix: None: expected with prices refused. |
| 75 | /de/en/articles/explore-the-world/in-my-hood-chiswick-london 390 | 7.7 | 7.7 | sweep-so44 #80: Within 23 px until the related cards (+48), then back to 0; photos. Fix: None. |
| 76 | /de/en/articles/explore-the-world/know-before-you-go-berlin 390 | 7.7 | 8.1 | sweep-so44 #57, 59: more above Related Articles (item 17); the Find your flight button's steps. |
| 77 | /at/de/frankfurt-fair 390 | 7.6 | 7.6 | sweep-so44 #83, 85, 95, 96: Within 37 px (the stage), then within 18. Fix: None. |
| 78 | /de/de/frankfurt-fair 390 | 7.6 | 7.6 | sweep-so44 #83, 85, 95, 96: Within 37 px (the stage), then within 18. Fix: None. |
| 79 | /de/de/speisen-und-getraenke 390 | 7.6 | 7.8 | sweep-so44 #72: 30 px less above "Häufig gestellte Fragen"; one question wraps a line more. Fix: Hand-over item 18. |
| 80 | /de/en/articles/explore-the-world/on-the-scene-caspar-plautz-munich 390 | 7.6 | 7.6 | sweep-so44 #86: The article end (item 20's link), 23 px more above "Related Articles" (item 17), the third related article another one. Fix: Items 20 and 17. |
| 81 | /de/en/articles/explore-the-world/stop-over-tokyo 1440 | 7.6 | 7.6 | sweep-so44 #87: The Price Bar not drawn with prices refused (6.7 in sweep-so34, when it drew one); www's 1440 portrait crop. Fix: None. |
| 82 | /de/en/articles/explore-the-world/what-i-learned-living-in-frankfurt 390 | 7.6 | 7.8 | sweep-so44 #75: The article-end teaser's link (item 20), 22 px more above "Related Articles" (item 17), the related cards' order. Fix: Items 20 and 17; the rest none. |
| 83 | /at/de/services-am-flughafen 390 | 7.5 | 7.5 | sweep-so44 #88-92: within 26 px; the text a word wider per line (the font width). Fix: none. |
| 84 | /de/de/services-am-flughafen 390 | 7.5 | 7.5 | as #83. |
| 85 | /de/en/discover-lufthansa/new-onboard-experience 390 | 7.5 | 7.5 | sweep-so44 #90, 91: Within 8 px; the collage. Fix: None. |
| 86 | /gb/en/discover-lufthansa/new-onboard-experience 390 | 7.5 | 7.5 | sweep-so44 #90, 91: Within 8 px; the collage. Fix: None. |
| 87 | /gb/en/services-at-the-airport 390 | 7.5 | 7.5 | sweep-so44 #88, 89, 92: Within 26 px; the text a word wider per line (the font width). Fix: None. |
| 88 | /at/de/speisen-und-getraenke 390 | 7.4 | 7.6 | sweep-so44 #84: 30 px less above the FAQ heading; one question wraps a line more. Fix: Hand-over item 18. |
| 89 | /de/en/articles/explore-the-world 390 | 7.4 | 7.4 | sweep-so44 #93: The map (OpenStreetMap against Google Maps), 35 px less above "Discover your dream destinations with us!", the list's content. Fix: None for the map and list; item 18. |
| 90 | /de/en/articles/explore-the-world/essentials-barcelona-facts 390 | 7.4 | 7.2 | sweep-so44 #99: The inline link "→ history" wraps a line more; the illustration 10 px lower; item 20's link; 22 px more above "Related Articles". Fix: Items 20 and 17; the rest under 1 %. |
| 91 | /de/en/frankfurt-fair 390 | 7.3 | 7.3 | sweep-so44 #83, 85, 95, 96: Within 37 px (the stage), then within 18. Fix: None. |
| 92 | /gb/en/frankfurt-fair 390 | 7.3 | 7.3 | sweep-so44 #83, 85, 95, 96: Within 37 px (the stage), then within 18. Fix: None. |
| 93 | /de/en/articles/explore-flying 390 | 7.2 | 7.8 | sweep-so44 #74: (1) The first screen: our H1 8 px lower (see the lh-parity-015 section). (2) From 4,800 px on +136 to +171: the article list holds one article more (8 Fix: (1) A heading's space after a stage picture: for ema-test's heading rules, item  |
| 94 | /de/en/articles/explore-the-world/be-picky-barcelona-insider-tips 1440 | 7.2 | 6.1 | New at 7 %: the Price Bar is not drawn with www refused, so its 90 px band is no longer masked (order 44: drawn and masked); same height and drift as order 44. Not the page. |
| 95 | /de/en/100-years/chronicle 390 | 7.0 | 7.0 | Within 14 px (drift 0 / -14 / +9), 10 % masked; the 100-years pages' recording face and captions (the owner's decision). Fix: none. |


## All 286 page-widths

| # | Page | Template | Width | % now | Heights www/ours | Masked % | Status | Recording | % order 44 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | /de/de/fluege | hub | 390 | 45.8 | 8000/5260 | 6.9 | 200 | lh-parity-004 | 0.1 |
| 2 | /de/en/flights | hub | 390 | 44.8 | 8000/5341 | 6.9 | 200 | lh-parity-004 | 0.1 |
| 3 | /at/de/fluege | hub | 390 | 43.9 | 8000/5370 | 6.9 | 200 | lh-parity-004 | 0.1 |
| 4 | /gb/en/flights | hub | 390 | 43.8 | 8000/5132 | 6.9 | 200 | lh-parity-004 | 0.1 |
| 5 | /de/en/lufthansa-city/culinaryjourney | campaign | 390 | 38.1 | 1736/1420 | 0.0 | 200 | lh-parity-002 | 11.1 |
| 6 | /at/de/fluege | hub | 1440 | 34.1 | 8000/4063 | 13.1 | 200 | lh-parity-004 | 0.0 |
| 7 | /de/en/flights | hub | 1440 | 34.1 | 8000/4107 | 13.1 | 200 | lh-parity-004 | 0.0 |
| 8 | /de/de/fluege | hub | 1440 | 33.8 | 8000/3892 | 13.1 | 200 | lh-parity-004 | 0.0 |
| 9 | /gb/en/flights | hub | 1440 | 33.1 | 8000/3898 | 13.1 | 200 | lh-parity-004 | 0.0 |
| 10 | /de/en/culinaryjourney | campaign | 390 | 32.6 | 1911/1620 | 0.0 | 200 | lh-parity-002 | 16.9 |
| 11 | /de/en/articles/explore-the-world/picture-perfect-austin | insights | 390 | 25.4 | 8000/8000 | 0.0 | 200 | lh-parity-002 | 25.4 |
| 12 | /at/de/flughafeninformation | hub | 390 | 24.8 | 5882/5882 | 0.0 | 200 | lh-parity-004 | 24.8 |
| 13 | /de/de/flughafeninformation | hub | 390 | 24.8 | 5882/5882 | 0.0 | 200 | lh-parity-004 | 24.8 |
| 14 | /de/en/100-years | campaign | 390 | 19.7 | 8000/8000 | 10.1 | 200 | lh-parity-002 | 19.7 |
| 15 | /de/en/articles/explore-the-world/picture-perfect-austin | insights | 1440 | 18.8 | 7969/7969 | 5.1 | 200 | lh-parity-002 | 18.8 |
| 16 | /de/en/articles/tags/munich | insights | 390 | 16.6 | 8000/8000 | 19.7 | 200 | lh-parity-002 | 16.6 |
| 17 | /de/en/lufthansa-city/culinaryjourney | campaign | 1440 | 15.3 | 1359/1271 | 0.0 | 200 | lh-parity-002 | 8.0 |
| 18 | /de/en/100-years/global-network | campaign | 390 | 15.0 | 8000/8000 | 0.0 | 200 | lh-parity-002 | 15.0 |
| 19 | /de/en/book-and-manage/stopover | campaign | 390 | 14.0 | 8000/8000 | 5.3 | 200 | lh-parity-002 | 14.0 |
| 20 | /de/en/100-years/global-network | campaign | 1440 | 13.6 | 8000/8000 | 0.0 | 200 | lh-parity-002 | 13.6 |
| 21 | /gb/en/articles/highlights/all-it-takes-is-a-yes | insights | 390 | 13.6 | 7444/7444 | 5.8 | 200 | lh-parity-004 | 13.6 |
| 22 | /de/en/articles/highlights/all-it-takes-is-a-yes | insights | 390 | 13.4 | 7444/7444 | 5.8 | 200 | lh-parity-002 | 13.4 |
| 23 | /de/en/100-years/cabin-design | campaign | 390 | 13.3 | 8000/8000 | 10.1 | 200 | lh-parity-002 | 13.3 |
| 24 | /de/en/articles/tags/munich | insights | 1440 | 13.1 | 7421/7421 | 15.6 | 200 | lh-parity-002 | 13.1 |
| 25 | /at/de/articles/highlights/all-it-takes-is-a-yes | insights | 390 | 12.8 | 7952/7952 | 5.4 | 200 | lh-parity-004 | 12.8 |
| 26 | /de/de/articles/highlights/all-it-takes-is-a-yes | insights | 390 | 12.8 | 7952/7952 | 5.4 | 200 | lh-parity-004 | 12.8 |
| 27 | /de/en/100-years/chronicle | campaign | 1440 | 12.2 | 8000/8000 | 20.3 | 200 | lh-parity-002 | 12.2 |
| 28 | /de/en/100-years | campaign | 1440 | 12.0 | 8000/8000 | 10.1 | 200 | lh-parity-002 | 11.9 |
| 29 | /de/en/book-and-manage/stopover | campaign | 1440 | 11.8 | 8000/8000 | 2.4 | 200 | lh-parity-002 | 11.8 |
| 30 | /de/en/articles/explore-the-world/what-i-learned-living-in-barcelona | insights | 390 | 11.7 | 8000/8000 | 9.7 | 200 | lh-parity-002 | 12.4 |
| 31 | /de/en/100-years/fleet | campaign | 1440 | 11.4 | 8000/8000 | 8.0 | 200 | lh-parity-002 | 11.4 |
| 32 | /de/en/articles/explore-the-world/a-perfect-day-barcelona-in-one-day | insights | 390 | 11.3 | 8000/8000 | 12.1 | 200 | lh-parity-002 | 11.1 |
| 33 | /de/en/articles/explore-flying/anniversary-super-crane-special | insights | 390 | 10.8 | 8000/8000 | 0.0 | 200 | lh-parity-002 | 10.8 |
| 34 | /at/de/articles/tags/allegris | insights | 1440 | 10.6 | 7467/7396 | 31.3 | 200 | lh-parity-004 | 10.6 |
| 35 | /de/de/articles/tags/allegris | insights | 1440 | 10.6 | 7467/7396 | 31.3 | 200 | lh-parity-004 | 10.6 |
| 36 | /de/en/culinaryjourney | campaign | 1440 | 10.5 | 1586/1524 | 0.0 | 200 | lh-parity-002 | 2.4 |
| 37 | /at/de/overview-travel-information | hub | 390 | 10.1 | 4041/4041 | 0.0 | 200 | lh-parity-004 | 10.1 |
| 38 | /de/de/overview-travel-information | hub | 390 | 10.1 | 4041/4041 | 0.0 | 200 | lh-parity-004 | 10.1 |
| 39 | /gb/en/overview-travel-information | hub | 390 | 10.1 | 3950/3950 | 0.0 | 200 | lh-parity-004 | 10.1 |
| 40 | /de/en/articles/explore-the-world/a-perfect-day-berlin-in-one-day | insights | 390 | 10.0 | 8000/8000 | 12.5 | 200 | lh-parity-002 | 10.0 |
| 41 | /de/en/munich-fair | campaign | 1440 | 9.8 | 2322/2322 | 0.0 | 200 | lh-parity-002 | 11.3 |
| 42 | /de/en/articles/explore-the-world/be-picky-barcelona-insider-tips | insights | 390 | 9.7 | 7635/7635 | 13.1 | 200 | lh-parity-002 | 9.5 |
| 43 | /de/en/100-years/campaigns | campaign | 390 | 9.5 | 8000/8000 | 0.0 | 200 | lh-parity-002 | 9.5 |
| 44 | /de/en/100-years/crane | campaign | 390 | 9.5 | 8000/8000 | 0.0 | 200 | lh-parity-002 | 9.5 |
| 45 | /de/en/100-years/history/menu-on-board | campaign | 390 | 9.5 | 8000/8000 | 10.1 | 200 | lh-parity-002 | 9.5 |
| 46 | /gb/en/100-years/crane | campaign | 390 | 9.5 | 8000/8000 | 0.0 | 200 | lh-parity-004 | 9.5 |
| 47 | /at/de/100-years/crane | campaign | 390 | 9.4 | 8000/8000 | 0.0 | 200 | lh-parity-004 | 9.4 |
| 48 | /de/de/100-years/crane | campaign | 390 | 9.4 | 8000/8000 | 0.0 | 200 | lh-parity-004 | 9.4 |
| 49 | /de/en/articles/explore-the-world/eat-see-do-algiers | insights | 390 | 9.4 | 8000/8000 | 11.4 | 200 | lh-parity-002 | 9.2 |
| 50 | /de/en/articles/tags/allegris | insights | 1440 | 9.0 | 7492/7412 | 31.7 | 200 | lh-parity-002 | 9.0 |
| 51 | /gb/en/articles/tags/allegris | insights | 1440 | 9.0 | 7492/7412 | 31.7 | 200 | lh-parity-004 | 9.0 |
| 52 | /de/en/articles/explore-the-world/stop-over-tokyo | insights | 390 | 8.9 | 7337/7337 | 12.9 | 200 | lh-parity-002 | 8.7 |
| 53 | /de/en/articles/explore-flying/livery-iconic-moments | insights | 390 | 8.7 | 25051/8000 | 0.0 | 200 | lh-parity-015 | 8.7 |
| 54 | /de/en/articles/explore-the-world/eat-see-do-berlin | insights | 390 | 8.5 | 8000/8000 | 0.7 | 200 | lh-parity-002 | 8.5 |
| 55 | /at/de/discover-lufthansa/new-onboard-experience | campaign | 390 | 8.3 | 8000/8000 | 0.0 | 200 | lh-parity-004 | 8.3 |
| 56 | /de/de/discover-lufthansa/new-onboard-experience | campaign | 390 | 8.3 | 8000/8000 | 0.0 | 200 | lh-parity-004 | 8.3 |
| 57 | /de/en/100-years/destinations | campaign | 390 | 8.1 | 8000/8000 | 0.0 | 200 | lh-parity-002 | 8.1 |
| 58 | /de/en/articles/explore-the-world/be-picky-frankfurt-insider-tips | insights | 390 | 8.1 | 5101/5101 | 19.0 | 200 | lh-parity-002 | 7.9 |
| 59 | /de/en/articles/explore-the-world/know-before-you-go-algiers | insights | 390 | 8.1 | 7470/7470 | 14.1 | 200 | lh-parity-002 | 8.2 |
| 60 | /de/en/articles/highlights/allegris-premium-economy-san-diego | insights | 1440 | 8.1 | 6730/6730 | 6.0 | 200 | lh-parity-002 | 9.5 |
| 61 | /gb/en/100-years/destinations | campaign | 390 | 8.1 | 8000/8000 | 0.0 | 200 | lh-parity-004 | 8.1 |
| 62 | /at/de/100-years/crane | campaign | 1440 | 8.0 | 8000/8000 | 0.0 | 200 | lh-parity-004 | 8.0 |
| 63 | /at/de/100-years/destinations | campaign | 390 | 8.0 | 8000/8000 | 0.0 | 200 | lh-parity-004 | 8.0 |
| 64 | /de/de/100-years/crane | campaign | 1440 | 8.0 | 8000/8000 | 0.0 | 200 | lh-parity-004 | 8.0 |
| 65 | /de/de/100-years/destinations | campaign | 390 | 8.0 | 8000/8000 | 0.0 | 200 | lh-parity-004 | 8.0 |
| 66 | /de/en/lufthansa-travel-classes | hub | 390 | 8.0 | 4688/4688 | 0.0 | 200 | lh-parity-002 | 8.0 |
| 67 | /de/en/services-at-the-airport | hub | 390 | 8.0 | 3411/3382 | 0.0 | 200 | lh-parity-002 | 8.0 |
| 68 | /gb/en/lufthansa-travel-classes | hub | 390 | 8.0 | 4688/4688 | 0.0 | 200 | lh-parity-004 | 8.0 |
| 69 | /at/de/lufthansa-reiseklassen | hub | 390 | 7.9 | 4787/4787 | 0.0 | 200 | lh-parity-004 | 7.9 |
| 70 | /de/de/lufthansa-reiseklassen | hub | 390 | 7.9 | 4787/4787 | 0.0 | 200 | lh-parity-004 | 7.9 |
| 71 | /de/en/100-years/crane | campaign | 1440 | 7.8 | 8000/8000 | 0.0 | 200 | lh-parity-002 | 7.8 |
| 72 | /gb/en/100-years/crane | campaign | 1440 | 7.8 | 8000/8000 | 0.0 | 200 | lh-parity-004 | 7.8 |
| 73 | /de/en/articles/explore-flying/anniversary-super-crane-special | insights | 1440 | 7.7 | 7218/7218 | 5.9 | 200 | lh-parity-002 | 7.7 |
| 74 | /de/en/articles/explore-the-world/eat-see-do-algiers | insights | 1440 | 7.7 | 6548/6527 | 5.6 | 200 | lh-parity-002 | 7.7 |
| 75 | /de/en/articles/explore-the-world/in-my-hood-chiswick-london | insights | 390 | 7.7 | 7210/7210 | 24.2 | 200 | lh-parity-002 | 7.7 |
| 76 | /de/en/articles/explore-the-world/know-before-you-go-berlin | insights | 390 | 7.7 | 7415/7415 | 14.2 | 200 | lh-parity-002 | 8.1 |
| 77 | /at/de/frankfurt-fair | campaign | 390 | 7.6 | 5439/5435 | 0.0 | 200 | lh-parity-004 | 7.6 |
| 78 | /de/de/frankfurt-fair | campaign | 390 | 7.6 | 5439/5435 | 0.0 | 200 | lh-parity-004 | 7.6 |
| 79 | /de/de/speisen-und-getraenke | hub | 390 | 7.6 | 7101/7101 | 0.0 | 200 | lh-parity-004 | 7.8 |
| 80 | /de/en/articles/explore-the-world/on-the-scene-caspar-plautz-munich | insights | 390 | 7.6 | 6746/6746 | 24.2 | 200 | lh-parity-002 | 7.6 |
| 81 | /de/en/articles/explore-the-world/stop-over-tokyo | insights | 1440 | 7.6 | 6251/6240 | 5.9 | 200 | lh-parity-002 | 7.6 |
| 82 | /de/en/articles/explore-the-world/what-i-learned-living-in-frankfurt | insights | 390 | 7.6 | 6027/6027 | 16.1 | 200 | lh-parity-002 | 7.8 |
| 83 | /at/de/services-am-flughafen | hub | 390 | 7.5 | 3622/3619 | 0.0 | 200 | lh-parity-004 | 7.5 |
| 84 | /de/de/services-am-flughafen | hub | 390 | 7.5 | 3622/3619 | 0.0 | 200 | lh-parity-004 | 7.5 |
| 85 | /de/en/discover-lufthansa/new-onboard-experience | campaign | 390 | 7.5 | 8000/8000 | 0.0 | 200 | lh-parity-002 | 7.5 |
| 86 | /gb/en/discover-lufthansa/new-onboard-experience | campaign | 390 | 7.5 | 8000/8000 | 0.0 | 200 | lh-parity-004 | 7.5 |
| 87 | /gb/en/services-at-the-airport | hub | 390 | 7.5 | 3411/3409 | 0.0 | 200 | lh-parity-004 | 7.5 |
| 88 | /at/de/speisen-und-getraenke | hub | 390 | 7.4 | 7101/7101 | 0.0 | 200 | lh-parity-004 | 7.6 |
| 89 | /de/en/articles/explore-the-world | insights | 390 | 7.4 | 8156/8000 | 56.8 | 200 | lh-parity-015 | 7.4 |
| 90 | /de/en/articles/explore-the-world/essentials-barcelona-facts | insights | 390 | 7.4 | 5986/5986 | 16.7 | 200 | lh-parity-002 | 7.2 |
| 91 | /de/en/frankfurt-fair | campaign | 390 | 7.3 | 5310/5305 | 0.0 | 200 | lh-parity-002 | 7.3 |
| 92 | /gb/en/frankfurt-fair | campaign | 390 | 7.3 | 5310/5305 | 0.0 | 200 | lh-parity-004 | 7.3 |
| 93 | /de/en/articles/explore-flying | insights | 390 | 7.2 | 6650/6650 | 62.1 | 200 | lh-parity-015 | 7.8 |
| 94 | /de/en/articles/explore-the-world/be-picky-barcelona-insider-tips | insights | 1440 | 7.2 | 5062/5042 | 8.0 | 200 | lh-parity-002 | 6.1 |
| 95 | /de/en/100-years/chronicle | campaign | 390 | 7.0 | 8000/8000 | 10.1 | 200 | lh-parity-002 | 7.0 |
| 96 | /at/de/betreuungsbedarf | hub | 390 | 6.9 | 7247/7247 | 0.0 | 200 | lh-parity-004 | 6.9 |
| 97 | /de/de/betreuungsbedarf | hub | 390 | 6.9 | 7247/7246 | 0.0 | 200 | lh-parity-004 | 6.9 |
| 98 | /at/de/additional-services | hub | 390 | 6.8 | 8000/8000 | 0.0 | 200 | lh-parity-004 | 6.8 |
| 99 | /de/de/additional-services | hub | 390 | 6.8 | 8000/8000 | 0.0 | 200 | lh-parity-004 | 6.8 |
| 100 | /de/en/special-needs | hub | 390 | 6.8 | 6966/6966 | 0.0 | 200 | lh-parity-002 | 6.8 |
| 101 | /gb/en/special-needs | hub | 390 | 6.8 | 6966/6966 | 0.0 | 200 | lh-parity-004 | 6.8 |
| 102 | /de/en/additional-services | hub | 390 | 6.7 | 8000/8000 | 0.0 | 200 | lh-parity-002 | 6.7 |
| 103 | /de/en/articles/highlights/allegris-premium-economy-san-diego | insights | 390 | 6.7 | 7206/7206 | 14.2 | 200 | lh-parity-002 | 7.3 |
| 104 | /de/en/food-and-beverages | hub | 390 | 6.7 | 6683/6683 | 0.0 | 200 | lh-parity-002 | 7.0 |
| 105 | /gb/en/additional-services | hub | 390 | 6.7 | 8000/8000 | 0.0 | 200 | lh-parity-004 | 6.7 |
| 106 | /gb/en/food-and-beverages | hub | 390 | 6.7 | 6683/6683 | 0.0 | 200 | lh-parity-004 | 7.0 |
| 107 | /at/de/articles/highlights/all-it-takes-is-a-yes | insights | 1440 | 6.6 | 6791/6791 | 6.3 | 200 | lh-parity-004 | 6.6 |
| 108 | /de/de/articles/highlights/all-it-takes-is-a-yes | insights | 1440 | 6.6 | 6791/6791 | 6.3 | 200 | lh-parity-004 | 6.6 |
| 109 | /de/en/articles/highlights/all-it-takes-is-a-yes | insights | 1440 | 6.6 | 6737/6737 | 6.4 | 200 | lh-parity-002 | 6.6 |
| 110 | /gb/en/articles/highlights/all-it-takes-is-a-yes | insights | 1440 | 6.6 | 6737/6737 | 6.4 | 200 | lh-parity-004 | 17.8 |
| 111 | /de/en/100-years/fleet | campaign | 390 | 6.4 | 8000/8000 | 8.0 | 200 | lh-parity-002 | 6.4 |
| 112 | /de/en/100-years/cabin-design | campaign | 1440 | 6.3 | 8000/8000 | 10.1 | 200 | lh-parity-002 | 5.9 |
| 113 | /de/en/homepage | homepage | 1440 | 6.3 | 5020/4967 | 27.5 | 200 | lh-parity-002 (notice cut) | 4.8 |
| 114 | /de/en/discover-lufthansa/new-onboard-experience | campaign | 1440 | 6.2 | 8000/8000 | 0.0 | 200 | lh-parity-002 | 6.2 |
| 115 | /gb/en/discover-lufthansa/new-onboard-experience | campaign | 1440 | 6.2 | 8000/8000 | 0.0 | 200 | lh-parity-004 | 6.2 |
| 116 | /at/de/meetings-and-events | hub | 390 | 6.1 | 4130/4130 | 0.0 | 200 | lh-parity-004 | 6.1 |
| 117 | /de/de/meetings-and-events | hub | 390 | 6.1 | 4130/4130 | 0.0 | 200 | lh-parity-004 | 6.1 |
| 118 | /de/en/munich-fair | campaign | 390 | 6.1 | 3143/3143 | 0.0 | 200 | lh-parity-002 | 6.1 |
| 119 | /at/de/articles/tags/allegris | insights | 390 | 6.0 | 8000/8000 | 45.1 | 200 | lh-parity-004 | 6.6 |
| 120 | /de/de/articles/tags/allegris | insights | 390 | 6.0 | 8000/8000 | 45.1 | 200 | lh-parity-004 | 6.0 |
| 121 | /de/en/most-significant-route | campaign | 390 | 6.0 | 2783/2780 | 0.0 | 200 | lh-parity-002 | 6.0 |
| 122 | /gb/en/most-significant-route | campaign | 390 | 6.0 | 2783/2780 | 0.0 | 200 | lh-parity-004 | 6.0 |
| 123 | /at/de/bedeutsamste-strecken | campaign | 390 | 5.9 | 2878/2875 | 0.0 | 200 | lh-parity-004 | 5.9 |
| 124 | /de/de/bedeutsamste-strecken | campaign | 390 | 5.9 | 2878/2875 | 0.0 | 200 | lh-parity-004 | 5.9 |
| 125 | /de/en/100-years/history | campaign | 390 | 5.9 | 8000/8000 | 10.1 | 200 | lh-parity-002 | 5.9 |
| 126 | /de/en/articles/explore-the-world/on-the-scene-food-trends-istanbul | insights | 1440 | 5.9 | 5289/5217 | 16.5 | 200 | lh-parity-002 | 5.0 |
| 127 | /de/en/additional-services | hub | 1440 | 5.8 | 6773/6766 | 0.0 | 200 | lh-parity-002 | 5.8 |
| 128 | /de/en/articles/explore-flying/flying-high-christoph-quarch | insights | 1440 | 5.8 | 5407/5400 | 7.9 | 200 | lh-parity-002 | 5.8 |
| 129 | /de/en/overview-special-request | hub | 390 | 5.8 | 3936/3936 | 0.0 | 200 | lh-parity-002 | 5.8 |
| 130 | /gb/en/additional-services | hub | 1440 | 5.8 | 6773/6766 | 0.0 | 200 | lh-parity-004 | 5.8 |
| 131 | /gb/en/overview-special-request | hub | 390 | 5.8 | 3936/3936 | 0.0 | 200 | lh-parity-004 | 5.8 |
| 132 | /at/de/additional-services | hub | 1440 | 5.7 | 6773/6766 | 0.0 | 200 | lh-parity-004 | 5.7 |
| 133 | /at/de/overview-flights | hub | 390 | 5.7 | 3612/3601 | 0.0 | 200 | lh-parity-004 | 5.7 |
| 134 | /de/de/additional-services | hub | 1440 | 5.7 | 6773/6766 | 0.0 | 200 | lh-parity-004 | 5.7 |
| 135 | /de/de/overview-flights | hub | 390 | 5.7 | 3612/3601 | 0.0 | 200 | lh-parity-004 | 5.7 |
| 136 | /de/en/homepage | homepage | 390 | 5.7 | 6086/6076 | 26.9 | 200 | lh-parity-002 (notice cut) | 5.7 |
| 137 | /de/en/meetings-and-events | hub | 390 | 5.7 | 3869/3869 | 0.0 | 200 | lh-parity-002 | 5.7 |
| 138 | /de/en/overview-flights | hub | 390 | 5.7 | 3517/3506 | 0.0 | 200 | lh-parity-002 | 5.7 |
| 139 | /gb/en/meetings-and-events | hub | 390 | 5.7 | 3869/3869 | 0.0 | 200 | lh-parity-004 | 5.7 |
| 140 | /gb/en/overview-flights | hub | 390 | 5.7 | 3517/3506 | 0.0 | 200 | lh-parity-004 | 5.7 |
| 141 | /at/de/digital-self-services | hub | 390 | 5.6 | 5651/5645 | 0.0 | 200 | lh-parity-004 | 7.2 |
| 142 | /at/de/overview-special-request | hub | 390 | 5.6 | 4027/4027 | 0.0 | 200 | lh-parity-004 | 5.6 |
| 143 | /at/de/overview-travel-information | hub | 1440 | 5.6 | 2840/2840 | 0.0 | 200 | lh-parity-004 | 5.6 |
| 144 | /de/de/digital-self-services | hub | 390 | 5.6 | 5651/5645 | 0.0 | 200 | lh-parity-004 | 7.2 |
| 145 | /de/de/overview-special-request | hub | 390 | 5.6 | 4027/4027 | 0.0 | 200 | lh-parity-004 | 5.6 |
| 146 | /de/de/overview-travel-information | hub | 1440 | 5.6 | 2840/2840 | 0.0 | 200 | lh-parity-004 | 5.6 |
| 147 | /de/en/airport-information | hub | 390 | 5.6 | 5465/5465 | 0.0 | 200 | lh-parity-002 | 5.6 |
| 148 | /de/en/articles/explore-flying/flying-high-christoph-quarch | insights | 390 | 5.6 | 6410/6402 | 15.4 | 200 | lh-parity-002 | 5.6 |
| 149 | /de/en/frankfurt-fair | campaign | 1440 | 5.6 | 3524/3487 | 0.0 | 200 | lh-parity-002 | 7.7 |
| 150 | /de/en/services-on-board | hub | 390 | 5.6 | 3993/3991 | 0.0 | 200 | lh-parity-002 | 5.6 |
| 151 | /gb/en/airport-information | hub | 390 | 5.6 | 5465/5465 | 0.0 | 200 | lh-parity-004 | 5.6 |
| 152 | /gb/en/digital-self-services | hub | 390 | 5.6 | 5489/5483 | 0.0 | 200 | lh-parity-004 | 7.1 |
| 153 | /gb/en/frankfurt-fair | campaign | 1440 | 5.6 | 3524/3487 | 0.0 | 200 | lh-parity-004 | 7.7 |
| 154 | /gb/en/services-on-board | hub | 390 | 5.6 | 3993/3991 | 0.0 | 200 | lh-parity-004 | 5.6 |
| 155 | /at/de/services-an-bord | hub | 390 | 5.5 | 4088/4086 | 0.0 | 200 | lh-parity-004 | 5.5 |
| 156 | /de/de/services-an-bord | hub | 390 | 5.5 | 4088/4086 | 0.0 | 200 | lh-parity-004 | 5.5 |
| 157 | /de/en/articles/explore-flying/livery-iconic-moments | insights | 1440 | 5.5 | 17187/8000 | 0.0 | 200 | lh-parity-015 | 5.5 |
| 158 | /de/en/articles/explore-the-world | insights | 1440 | 5.5 | 6333/6284 | 50.3 | 200 | lh-parity-015 | 7.7 |
| 159 | /de/en/digital-self-services | hub | 390 | 5.5 | 5489/5483 | 0.0 | 200 | lh-parity-002 | 7.0 |
| 160 | /gb/en/overview-travel-information | hub | 1440 | 5.5 | 2840/2840 | 0.0 | 200 | lh-parity-004 | 5.5 |
| 161 | /de/en/articles/explore-the-world/in-my-hood-district-zurich | insights | 390 | 5.4 | 8000/8000 | 25.7 | 200 | lh-parity-002 | 5.6 |
| 162 | /de/en/articles/explore-the-world/essentials-frankfurt-facts | insights | 1440 | 5.3 | 5130/5130 | 7.9 | 200 | lh-parity-002 | 5.0 |
| 163 | /de/en/miles-and-more | hub | 390 | 5.2 | 4188/4188 | 0.0 | 200 | lh-parity-002 | 5.2 |
| 164 | /gb/en/miles-and-more | hub | 390 | 5.2 | 4188/4188 | 0.0 | 200 | lh-parity-004 | 5.2 |
| 165 | /at/de/articles/highlights/allegris-premium-economy-san-diego | insights | 390 | 5.1 | 7820/7820 | 13.1 | 200 | lh-parity-004 | 5.7 |
| 166 | /de/en/book-and-manage/stopover/bayerischer-hof | campaign | 1440 | 5.1 | 2935/2935 | 11.1 | 200 | lh-parity-002 | 5.1 |
| 167 | /gb/en/articles/highlights/allegris-premium-economy-san-diego | insights | 390 | 5.1 | 7206/7206 | 14.2 | 200 | lh-parity-004 | 5.7 |
| 168 | /at/de/miles-and-more | hub | 390 | 5.0 | 4511/4511 | 0.0 | 200 | lh-parity-004 | 5.0 |
| 169 | /de/de/miles-and-more | hub | 390 | 5.0 | 4511/4511 | 0.0 | 200 | lh-parity-004 | 5.0 |
| 170 | /de/en/baggage | hub | 390 | 5.0 | 7339/7339 | 0.0 | 200 | lh-parity-002 | 5.0 |
| 171 | /gb/en/baggage | hub | 390 | 5.0 | 7339/7339 | 0.0 | 200 | lh-parity-004 | 5.0 |
| 172 | /de/en/100-years/campaigns | campaign | 1440 | 4.9 | 8000/8000 | 0.0 | 200 | lh-parity-002 | 4.9 |
| 173 | /de/en/articles/explore-flying/essentials-future-of-flying | insights | 390 | 4.9 | 5715/5715 | 18.3 | 200 | lh-parity-002 | 5.1 |
| 174 | /de/en/articles/explore-the-world/eat-see-do-berlin | insights | 1440 | 4.9 | 7064/7064 | 5.7 | 200 | lh-parity-002 | 4.1 |
| 175 | /de/en/articles/explore-the-world/on-the-scene-food-trends-istanbul | insights | 390 | 4.9 | 7097/7090 | 23.7 | 200 | lh-parity-002 | 4.4 |
| 176 | /de/en/articles/explore-the-world/what-i-learned-living-in-barcelona | insights | 1440 | 4.9 | 5915/5915 | 6.9 | 200 | lh-parity-002 | 7.1 |
| 177 | /at/de/gepaeck | hub | 390 | 4.8 | 7511/7511 | 0.0 | 200 | lh-parity-004 | 4.8 |
| 178 | /de/de/articles/highlights/allegris-premium-economy-san-diego | insights | 390 | 4.8 | 7820/7820 | 13.1 | 200 | lh-parity-004 | 5.4 |
| 179 | /de/de/gepaeck | hub | 390 | 4.8 | 7511/7511 | 0.0 | 200 | lh-parity-004 | 4.8 |
| 180 | /de/en/book-and-manage/stopover/neuschwanstein | campaign | 1440 | 4.8 | 2999/2999 | 10.9 | 200 | lh-parity-002 | 4.8 |
| 181 | /de/en/discover-lufthansa/take-off | campaign | 390 | 4.8 | 6895/6895 | 0.0 | 200 | lh-parity-015 | 4.8 |
| 182 | /at/de/articles/highlights/allegris-new-york | insights | 390 | 4.7 | 8227/8000 | 12.1 | 200 | lh-parity-015 | 11.1 |
| 183 | /de/de/articles/highlights/allegris-new-york | insights | 390 | 4.7 | 8227/8000 | 12.1 | 200 | lh-parity-015 | 11.1 |
| 184 | /de/en/articles/explore-the-world/know-before-you-go-berlin | insights | 1440 | 4.6 | 7488/7458 | 6.1 | 200 | lh-parity-002 | 4.6 |
| 185 | /de/en/articles/explore-the-world/what-i-learned-living-in-frankfurt | insights | 1440 | 4.6 | 4526/4519 | 9.0 | 200 | lh-parity-002 | 4.6 |
| 186 | /at/de/discover-lufthansa/new-onboard-experience | campaign | 1440 | 4.5 | 8000/8000 | 0.0 | 200 | lh-parity-004 | 4.5 |
| 187 | /at/de/frankfurt-fair | campaign | 1440 | 4.5 | 3501/3490 | 0.0 | 200 | lh-parity-004 | 6.5 |
| 188 | /de/de/discover-lufthansa/new-onboard-experience | campaign | 1440 | 4.5 | 8000/8000 | 0.0 | 200 | lh-parity-004 | 4.5 |
| 189 | /de/de/frankfurt-fair | campaign | 1440 | 4.5 | 3501/3490 | 0.0 | 200 | lh-parity-004 | 6.5 |
| 190 | /de/en/articles/authors/florian-tomberg | insights | 390 | 4.5 | 3801/3801 | 41.6 | 200 | lh-parity-002 | 4.5 |
| 191 | /de/en/book-and-manage/stopover/zugspitze | campaign | 1440 | 4.5 | 3055/3055 | 10.7 | 200 | lh-parity-002 | 4.5 |
| 192 | /de/en/articles/explore-flying | insights | 1440 | 4.3 | 5489/5489 | 50.8 | 200 | lh-parity-015 | 4.3 |
| 193 | /de/en/articles/explore-the-world/in-my-hood-chiswick-london | insights | 1440 | 4.3 | 5212/5180 | 16.8 | 200 | lh-parity-002 | 3.3 |
| 194 | /de/en/articles/explore-the-world/know-before-you-go-algiers | insights | 1440 | 4.3 | 7447/7417 | 6.2 | 200 | lh-parity-002 | 4.3 |
| 195 | /de/en/articles/highlights/allegris-new-york | insights | 390 | 4.2 | 7663/7663 | 12.7 | 200 | lh-parity-015 | 10.9 |
| 196 | /gb/en/articles/highlights/allegris-new-york | insights | 390 | 4.2 | 7663/7663 | 12.7 | 200 | lh-parity-015 | 10.9 |
| 197 | /gb/en/special-needs | hub | 1440 | 4.2 | 5271/5271 | 0.0 | 200 | lh-parity-004 | 4.2 |
| 198 | /de/en/articles/explore-the-world/on-the-scene-caspar-plautz-munich | insights | 1440 | 4.1 | 5162/5146 | 17.7 | 200 | lh-parity-002 | 3.1 |
| 199 | /de/en/book-and-manage/stopover/bayerischer-hof | campaign | 390 | 4.1 | 4036/4036 | 11.0 | 200 | lh-parity-002 | 4.1 |
| 200 | /de/en/special-needs | hub | 1440 | 4.1 | 5271/5250 | 0.0 | 200 | lh-parity-002 | 4.1 |
| 201 | /at/de/lufthansa-reiseklassen | hub | 1440 | 3.9 | 3295/3290 | 0.0 | 200 | lh-parity-004 | 3.9 |
| 202 | /de/de/lufthansa-reiseklassen | hub | 1440 | 3.9 | 3295/3290 | 0.0 | 200 | lh-parity-004 | 3.9 |
| 203 | /de/en/articles/explore-the-world/essentials-barcelona-facts | insights | 1440 | 3.9 | 5395/5387 | 7.5 | 200 | lh-parity-002 | 3.0 |
| 204 | /de/en/articles/tags/allegris | insights | 390 | 3.9 | 7897/7893 | 44.8 | 200 | lh-parity-002 | 3.9 |
| 205 | /de/en/lufthansa-travel-classes | hub | 1440 | 3.9 | 3295/3290 | 0.0 | 200 | lh-parity-002 | 3.9 |
| 206 | /gb/en/articles/tags/allegris | insights | 390 | 3.9 | 7897/7893 | 44.8 | 200 | lh-parity-004 | 4.6 |
| 207 | /gb/en/lufthansa-travel-classes | hub | 1440 | 3.9 | 3295/3290 | 0.0 | 200 | lh-parity-004 | 3.9 |
| 208 | /de/en/airport-information | hub | 1440 | 3.8 | 3232/3230 | 0.0 | 200 | lh-parity-002 | 3.8 |
| 209 | /gb/en/airport-information | hub | 1440 | 3.8 | 3232/3230 | 0.0 | 200 | lh-parity-004 | 3.8 |
| 210 | /de/en/articles/explore-the-world/essentials-frankfurt-facts | insights | 390 | 3.7 | 5001/5001 | 19.4 | 200 | lh-parity-002 | 3.9 |
| 211 | /de/en/articles/explore-the-world/in-my-hood-district-zurich | insights | 1440 | 3.6 | 5455/5440 | 17.6 | 200 | lh-parity-002 | 3.6 |
| 212 | /gb/en/articles/highlights/allegris-premium-economy-san-diego | insights | 1440 | 3.6 | 6730/6730 | 6.0 | 200 | lh-parity-004 | 5.0 |
| 213 | /at/de/articles/highlights/allegris-premium-economy-san-diego | insights | 1440 | 3.5 | 6921/6921 | 6.2 | 200 | lh-parity-004 | 6.9 |
| 214 | /de/de/articles/highlights/allegris-premium-economy-san-diego | insights | 1440 | 3.5 | 6921/6921 | 6.2 | 200 | lh-parity-004 | 6.9 |
| 215 | /de/en/digital-self-services | hub | 1440 | 3.5 | 4430/4430 | 0.0 | 200 | lh-parity-002 | 3.5 |
| 216 | /at/de/gepaeck | hub | 1440 | 3.4 | 4727/4727 | 0.0 | 200 | lh-parity-004 | 3.4 |
| 217 | /de/de/gepaeck | hub | 1440 | 3.4 | 4727/4727 | 0.0 | 200 | lh-parity-004 | 3.4 |
| 218 | /de/en/articles/explore-flying/7-people-who-shaped-lufthansa-history | insights | 390 | 3.3 | 8000/8000 | 0.0 | 200 | lh-parity-002 | 3.3 |
| 219 | /de/en/book-and-manage/stopover/zugspitze | campaign | 390 | 3.3 | 3991/3991 | 11.1 | 200 | lh-parity-002 | 3.3 |
| 220 | /gb/en/articles/highlights/allegris-new-york | insights | 1440 | 3.2 | 6945/6945 | 5.8 | 200 | lh-parity-015 | 9.0 |
| 221 | /at/de/articles/highlights/allegris-new-york | insights | 1440 | 3.1 | 7080/7080 | 5.7 | 200 | lh-parity-015 | 9.1 |
| 222 | /at/de/flughafeninformation | hub | 1440 | 3.1 | 3281/3281 | 0.0 | 200 | lh-parity-004 | 3.1 |
| 223 | /de/de/articles/highlights/allegris-new-york | insights | 1440 | 3.1 | 7080/7080 | 5.7 | 200 | lh-parity-015 | 9.1 |
| 224 | /de/de/flughafeninformation | hub | 1440 | 3.1 | 3281/3281 | 0.0 | 200 | lh-parity-004 | 3.1 |
| 225 | /de/en/articles/explore-the-world/a-perfect-day-barcelona-in-one-day | insights | 1440 | 3.1 | 7608/7608 | 12.0 | 200 | lh-parity-002 | 2.4 |
| 226 | /de/en/articles/highlights/allegris-new-york | insights | 1440 | 3.1 | 6945/6945 | 5.8 | 200 | lh-parity-015 | 9.0 |
| 227 | /de/en/articles/authors/florian-tomberg | insights | 1440 | 3.0 | 3437/3437 | 36.2 | 200 | lh-parity-002 | 3.0 |
| 228 | /at/de/digital-self-services | hub | 1440 | 2.9 | 4548/4541 | 0.0 | 200 | lh-parity-004 | 2.9 |
| 229 | /de/de/digital-self-services | hub | 1440 | 2.9 | 4548/4541 | 0.0 | 200 | lh-parity-004 | 2.9 |
| 230 | /de/en/articles/tags | insights | 390 | 2.9 | 2469/2469 | 0.0 | 200 | lh-parity-002 | 2.9 |
| 231 | /gb/en/digital-self-services | hub | 1440 | 2.9 | 4471/4463 | 0.0 | 200 | lh-parity-004 | 2.9 |
| 232 | /de/en/articles/explore-the-world/be-picky-frankfurt-insider-tips | insights | 1440 | 2.8 | 3841/3833 | 10.5 | 200 | lh-parity-002 | 2.8 |
| 233 | /de/en/services-on-board | hub | 1440 | 2.8 | 2789/2781 | 0.0 | 200 | lh-parity-002 | 2.8 |
| 234 | /gb/en/services-on-board | hub | 1440 | 2.8 | 2789/2781 | 0.0 | 200 | lh-parity-004 | 2.8 |
| 235 | /at/de/bedeutsamste-strecken | campaign | 1440 | 2.7 | 2475/2466 | 0.0 | 200 | lh-parity-004 | 2.7 |
| 236 | /at/de/meetings-and-events | hub | 1440 | 2.7 | 3615/3609 | 0.0 | 200 | lh-parity-004 | 2.7 |
| 237 | /at/de/overview-flights | hub | 1440 | 2.7 | 2730/2730 | 0.0 | 200 | lh-parity-004 | 2.7 |
| 238 | /at/de/services-an-bord | hub | 1440 | 2.7 | 2856/2847 | 0.0 | 200 | lh-parity-004 | 2.7 |
| 239 | /de/de/bedeutsamste-strecken | campaign | 1440 | 2.7 | 2475/2466 | 0.0 | 200 | lh-parity-004 | 2.7 |
| 240 | /de/de/meetings-and-events | hub | 1440 | 2.7 | 3615/3609 | 0.0 | 200 | lh-parity-004 | 2.7 |
| 241 | /de/de/overview-flights | hub | 1440 | 2.7 | 2730/2730 | 0.0 | 200 | lh-parity-004 | 2.7 |
| 242 | /de/de/services-an-bord | hub | 1440 | 2.7 | 2856/2847 | 0.0 | 200 | lh-parity-004 | 2.7 |
| 243 | /de/en/articles/explore-flying/essentials-future-of-flying | insights | 1440 | 2.7 | 5733/5733 | 7.5 | 200 | lh-parity-002 | 2.7 |
| 244 | /de/en/articles/explore-the-world/a-perfect-day-berlin-in-one-day | insights | 1440 | 2.7 | 8000/8000 | 11.4 | 200 | lh-parity-002 | 2.0 |
| 245 | /de/en/book-and-manage/stopover/neuschwanstein | campaign | 390 | 2.7 | 3727/3727 | 11.9 | 200 | lh-parity-002 | 2.7 |
| 246 | /de/en/overview-flights | hub | 1440 | 2.7 | 2703/2703 | 0.0 | 200 | lh-parity-002 | 2.7 |
| 247 | /gb/en/overview-flights | hub | 1440 | 2.7 | 2703/2703 | 0.0 | 200 | lh-parity-004 | 2.7 |
| 248 | /at/de/betreuungsbedarf | hub | 1440 | 2.6 | 5387/5383 | 0.0 | 200 | lh-parity-004 | 2.6 |
| 249 | /de/de/betreuungsbedarf | hub | 1440 | 2.6 | 5387/5383 | 0.0 | 200 | lh-parity-004 | 2.6 |
| 250 | /de/en/meetings-and-events | hub | 1440 | 2.6 | 3534/3528 | 0.0 | 200 | lh-parity-002 | 2.6 |
| 251 | /de/en/most-significant-route | campaign | 1440 | 2.6 | 2583/2574 | 0.0 | 200 | lh-parity-002 | 2.6 |
| 252 | /de/en/overview-travel-information | hub | 390 | 2.6 | 3950/3950 | 0.0 | 200 | lh-parity-003 | 2.6 |
| 253 | /gb/en/meetings-and-events | hub | 1440 | 2.6 | 3534/3528 | 0.0 | 200 | lh-parity-004 | 2.6 |
| 254 | /gb/en/most-significant-route | campaign | 1440 | 2.6 | 2583/2574 | 0.0 | 200 | lh-parity-004 | 2.6 |
| 255 | /de/en/overview-special-request | hub | 1440 | 2.5 | 2754/2746 | 0.0 | 200 | lh-parity-002 | 2.5 |
| 256 | /gb/en/overview-special-request | hub | 1440 | 2.5 | 2754/2746 | 0.0 | 200 | lh-parity-004 | 2.5 |
| 257 | /at/de/overview-special-request | hub | 1440 | 2.4 | 2781/2773 | 0.0 | 200 | lh-parity-004 | 2.4 |
| 258 | /at/de/speisen-und-getraenke | hub | 1440 | 2.4 | 5112/5112 | 0.0 | 200 | lh-parity-004 | 2.4 |
| 259 | /de/de/overview-special-request | hub | 1440 | 2.4 | 2781/2773 | 0.0 | 200 | lh-parity-004 | 2.4 |
| 260 | /de/de/speisen-und-getraenke | hub | 1440 | 2.4 | 5112/5112 | 0.0 | 200 | lh-parity-004 | 2.4 |
| 261 | /de/en/miles-and-more | hub | 1440 | 2.4 | 3406/3406 | 0.0 | 200 | lh-parity-002 | 2.4 |
| 262 | /at/de/miles-and-more | hub | 1440 | 2.3 | 3487/3487 | 0.0 | 200 | lh-parity-004 | 2.3 |
| 263 | /de/de/miles-and-more | hub | 1440 | 2.3 | 3487/3487 | 0.0 | 200 | lh-parity-004 | 2.3 |
| 264 | /gb/en/miles-and-more | hub | 1440 | 2.3 | 3406/3406 | 0.0 | 200 | lh-parity-004 | 2.3 |
| 265 | /de/en/100-years/history/menu-on-board | campaign | 1440 | 2.2 | 8000/8000 | 10.1 | 200 | lh-parity-002 | 2.2 |
| 266 | /de/en/food-and-beverages | hub | 1440 | 2.2 | 5085/5085 | 0.0 | 200 | lh-parity-002 | 2.2 |
| 267 | /gb/en/food-and-beverages | hub | 1440 | 2.2 | 5085/5085 | 0.0 | 200 | lh-parity-004 | 2.2 |
| 268 | /de/en/articles/explore-flying/inflight-entertainment-vr-experience | insights | 1440 | 2.1 | 7854/7854 | 5.5 | 200 | lh-parity-002 | 2.1 |
| 269 | /de/en/overview-travel-information | hub | 1440 | 1.9 | 2840/2840 | 0.0 | 200 | lh-parity-003 | 1.9 |
| 270 | /de/en/discover-lufthansa/take-off | campaign | 1440 | 1.8 | 4514/4514 | 0.0 | 200 | lh-parity-015 | 1.8 |
| 271 | /de/en/baggage | hub | 1440 | 1.7 | 4630/4627 | 0.0 | 200 | lh-parity-002 | 1.7 |
| 272 | /gb/en/baggage | hub | 1440 | 1.7 | 4630/4627 | 0.0 | 200 | lh-parity-004 | 1.7 |
| 273 | /at/de/services-am-flughafen | hub | 1440 | 1.5 | 2849/2849 | 0.0 | 200 | lh-parity-004 | 1.5 |
| 274 | /de/de/services-am-flughafen | hub | 1440 | 1.5 | 2849/2849 | 0.0 | 200 | lh-parity-004 | 1.5 |
| 275 | /de/en/services-at-the-airport | hub | 1440 | 1.4 | 2822/2822 | 0.0 | 200 | lh-parity-002 | 1.4 |
| 276 | /gb/en/services-at-the-airport | hub | 1440 | 1.4 | 2822/2822 | 0.0 | 200 | lh-parity-004 | 1.4 |
| 277 | /de/en/articles/explore-flying/7-people-who-shaped-lufthansa-history | insights | 1440 | 1.3 | 8000/8000 | 0.0 | 200 | lh-parity-002 | 1.3 |
| 278 | /de/en/articles/highlights | insights | 1440 | 1.3 | 6838/6838 | 55.6 | 200 | lh-parity-002 | 1.3 |
| 279 | /de/en/articles/tags | insights | 1440 | 1.2 | 1986/1986 | 0.0 | 200 | lh-parity-002 | 1.2 |
| 280 | /de/en/100-years/history | campaign | 1440 | 1.0 | 8000/8000 | 10.1 | 200 | lh-parity-002 | 1.0 |
| 281 | /de/en/articles/explore-flying/inflight-entertainment-vr-experience | insights | 390 | 0.9 | 8000/8000 | 0.0 | 200 | lh-parity-002 | 0.9 |
| 282 | /de/en/100-years/destinations | campaign | 1440 | 0.8 | 8000/8000 | 0.0 | 200 | lh-parity-002 | 0.8 |
| 283 | /gb/en/100-years/destinations | campaign | 1440 | 0.8 | 8000/8000 | 0.0 | 200 | lh-parity-004 | 0.8 |
| 284 | /at/de/100-years/destinations | campaign | 1440 | 0.7 | 8000/8000 | 0.0 | 200 | lh-parity-004 | 0.7 |
| 285 | /de/de/100-years/destinations | campaign | 1440 | 0.7 | 8000/8000 | 0.0 | 200 | lh-parity-004 | 0.7 |
| 286 | /de/en/articles/highlights | insights | 390 | 0.7 | 8000/8000 | 69.2 | 200 | lh-parity-002 | 0.7 |

## Standing order 53: the same captures with www's refused widgets taken out on both sides

The sweep above compared our captures, drawn with www refused, against recordings drawn with www's data. Here the
same captures and recordings (no new capture) are compared again so that a refused widget neither adds nor hides
height (logs/b653/remask.cjs, remask2.cjs):
- where a widget changes the page's height (the destination finder on fluege / flights and the homepage, the
  culinaryjourney micro-frontend), its rows are cut from both images: from the recording at order 44's box (drawn
  with www's data then, aligned with the recording) and from ours at today's box. fluege / flights' recordings end
  inside the finder (8,000 px), so ours is compared over the recording's remaining height;
- where it keeps the height (the Price Bar band at 810 / 735 px, fare teasers, the article teasers that come from www),
  order 44's box is masked on both sides in addition to the capture's own live boxes, as order 44 masked it;
- every other page-width keeps its figure above (248 of 286: nothing to add).

All 286 page-widths: median 5.6 %, 84 at 7 % or more (95 before), 30 at 10 % or more, 8 at 15 % or more. Without
fluege, flights and culinaryjourney: 274, median 5.6 %, 81 at 7 % or more (83 before).
Against order 44: 33 page-widths closer by 0.5 or more. 11 still read further by 0.5 or more:
- fluege / flights x8 0.0-0.1 -> 0.5-1.4: only the strip above the finder is left to compare (order 44 masked 85 % of
  the page);
- lufthansa-city/culinaryjourney 390 11.1 -> 14.4 and the homepage 1440 4.8 -> 5.9: after the cut, their other
  content (culinaryjourney: the part above and below the micro-frontend; the homepage: the teasers around the finder);
- essentials-barcelona-facts 1440 3.0 -> 3.6.

| Page-width | Sweep above % | With the widgets out % | How |
| --- | --- | --- | --- |
| /de/en/homepage 1440 | 6.3 | 5.9 | cut 2245+990 / 2245+960 |
| /de/en/flights 1440 | 34.1 | 0.6 | cut 368+7632 / 368+1191 |
| /de/en/flights 390 | 44.8 | 1.4 | cut 295+7705 / 295+622 |
| /de/de/fluege 1440 | 33.8 | 0.6 | cut 328+7672 / 328+1191 |
| /de/de/fluege 390 | 45.8 | 1.4 | cut 275+7725 / 275+622 |
| /at/de/fluege 1440 | 34.1 | 0.6 | cut 328+7672 / 328+1191 |
| /at/de/fluege 390 | 43.9 | 1.4 | cut 275+7725 / 275+622 |
| /gb/en/flights 1440 | 33.1 | 0.5 | cut 368+7632 / 368+1191 |
| /gb/en/flights 390 | 43.8 | 1.3 | cut 295+7705 / 295+622 |
| /de/en/culinaryjourney 1440 | 10.5 | 1.1 | cut 147+463 / 147+400 |
| /de/en/culinaryjourney 390 | 32.6 | 16.6 | cut 169+777 / 169+400 |
| /de/en/lufthansa-city/culinaryjourney 1440 | 15.3 | 8.3 | cut 147+463 / 147+400 |
| /de/en/lufthansa-city/culinaryjourney 390 | 38.1 | 14.4 | cut 169+777 / 169+400 |
| /de/en/articles/explore-flying 390 | 7.2 | 7.1 | masked [data-lh-source]@795+4122,[data-lh-source]@5012+533 |
| /de/en/articles/explore-flying/essentials-future-of-flying 390 | 4.9 | 4.9 | masked [data-lh-source]@3880+1177 |
| /de/en/articles/explore-the-world 1440 | 5.5 | 5.5 | masked [data-lh-source]@1648+2633,[data-lh-source]@4396+499 |
| /de/en/articles/explore-the-world/a-perfect-day-barcelona-in-one-day 1440 | 3.1 | 2.3 | masked .price-bar@810+90 |
| /de/en/articles/explore-the-world/a-perfect-day-barcelona-in-one-day 390 | 11.3 | 11.0 | masked .price-bar@735+165 |
| /de/en/articles/explore-the-world/a-perfect-day-berlin-in-one-day 1440 | 2.7 | 2.0 | masked .price-bar@810+90 |
| /de/en/articles/explore-the-world/be-picky-barcelona-insider-tips 1440 | 7.2 | 6.0 | masked .price-bar@810+90 |
| /de/en/articles/explore-the-world/be-picky-barcelona-insider-tips 390 | 9.7 | 9.3 | masked .price-bar@735+165,[data-lh-source]@5735+1125 |
| /de/en/articles/explore-the-world/be-picky-frankfurt-insider-tips 390 | 8.1 | 8.0 | masked [data-lh-source]@3214+1094 |
| /de/en/articles/explore-the-world/eat-see-do-algiers 390 | 9.4 | 9.0 | masked .price-bar@735+165,[data-lh-source]@6538+1032 |
| /de/en/articles/explore-the-world/eat-see-do-berlin 1440 | 4.9 | 4.1 | masked .price-bar@810+90 |
| /de/en/articles/explore-the-world/eat-see-do-berlin 390 | 8.5 | 8.5 | masked [data-lh-source]@7941+59 |
| /de/en/articles/explore-the-world/essentials-barcelona-facts 1440 | 3.9 | 3.6 | masked .price-bar@810+90 |
| /de/en/articles/explore-the-world/essentials-barcelona-facts 390 | 7.4 | 6.9 | masked .price-bar@735+165,[data-lh-source]@4118+1125 |
| /de/en/articles/explore-the-world/essentials-frankfurt-facts 390 | 3.7 | 3.7 | masked [data-lh-source]@3134+1094 |
| /de/en/articles/explore-the-world/in-my-hood-chiswick-london 1440 | 4.3 | 3.3 | masked .price-bar@810+90 |
| /de/en/articles/explore-the-world/in-my-hood-chiswick-london 390 | 7.7 | 7.7 | masked [data-lh-source]@5334+1085 |
| /de/en/articles/explore-the-world/in-my-hood-district-zurich 390 | 5.4 | 5.4 | masked [data-lh-source]@6223+1094 |
| /de/en/articles/explore-the-world/know-before-you-go-algiers 390 | 8.1 | 8.0 | masked .price-bar@735+165,[data-lh-source]@5652+1032 |
| /de/en/articles/explore-the-world/know-before-you-go-berlin 390 | 7.7 | 7.7 | masked [data-lh-source]@5597+1032 |
| /de/en/articles/explore-the-world/on-the-scene-caspar-plautz-munich 1440 | 4.1 | 3.0 | masked .price-bar@810+90 |
| /de/en/articles/explore-the-world/on-the-scene-caspar-plautz-munich 390 | 7.6 | 7.3 | masked .price-bar@735+165,[data-lh-source]@4942+1063 |
| /de/en/articles/explore-the-world/on-the-scene-food-trends-istanbul 1440 | 5.9 | 4.9 | masked .price-bar@810+90 |
| /de/en/articles/explore-the-world/on-the-scene-food-trends-istanbul 390 | 4.9 | 4.5 | masked .price-bar@735+165,[data-lh-source]@5231+1063 |
| /de/en/articles/explore-the-world/stop-over-tokyo 390 | 8.9 | 8.6 | masked .price-bar@735+165,[data-lh-source]@5519+1063 |
| /de/en/articles/explore-the-world/what-i-learned-living-in-barcelona 1440 | 4.9 | 4.9 | masked [data-lh-source]@4744+462 |
| /de/en/articles/explore-the-world/what-i-learned-living-in-barcelona 390 | 11.7 | 11.7 | masked [data-lh-source]@7109+891 |
| /de/en/articles/explore-the-world/what-i-learned-living-in-frankfurt 390 | 7.6 | 7.6 | masked [data-lh-source]@4202+1093 |
| /de/de/articles/highlights/all-it-takes-is-a-yes 1440 | 6.6 | 6.6 | masked .fare-teaser@3336+345 |
| /gb/en/articles/highlights/all-it-takes-is-a-yes 1440 | 6.6 | 6.6 | masked .fare-teaser@3282+345 |
| /de/en/articles/highlights/allegris-premium-economy-san-diego 390 | 6.7 | 6.7 | masked [data-lh-source]@5336+1156 |
| /de/de/articles/highlights/allegris-premium-economy-san-diego 1440 | 3.5 | 3.5 | masked [data-lh-source]@5841+487 |
| /de/de/articles/highlights/allegris-premium-economy-san-diego 390 | 4.8 | 4.8 | masked [data-lh-source]@5851+1156 |
| /at/de/articles/highlights/allegris-premium-economy-san-diego 1440 | 3.5 | 3.5 | masked [data-lh-source]@5841+487 |
| /at/de/articles/highlights/allegris-premium-economy-san-diego 390 | 5.1 | 5.1 | masked [data-lh-source]@5878+1156 |
| /gb/en/articles/highlights/allegris-premium-economy-san-diego 390 | 5.1 | 5.1 | masked [data-lh-source]@5336+1156 |
