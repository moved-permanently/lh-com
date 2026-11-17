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
- not swept in order 44 (added in order 45 against lh-parity-014, below): the five lh-parity-008 pages (livery-iconic-moments, allegris-new-york in de/en, de/de, at/de, gb/en),
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
| 19 | /de/en/100-years/chronicle 1440 | 12.2 | (1) Its three jump links stand 215 px apart on www and spread over the row in ours. (2) The stage below starts 37 px higher. (3) 3 captions missing. | (1) Located tonight: on www the three links are a three-column view nested in the first half of a two-column view (bd-snapshot), so they span half the row. As a trial (the list at half width from 768px) ours stand where www's do, within 3 px, but the page still reads 12.2 at 1440 (390 7.0, unchanged): the links are a few pixels of text. A block option plus 16 chronicle rows for no measurable gain, so no row. (2) Not tonight. (3) The owner's decision. |
| 20 | /de/en/100-years 1440 | 11.9 | As #4 (drift -24 px, then within 17). | None. |

## The six that moved further

- picture-perfect-austin 1440 (+0.7), eat-see-do-algiers 1440 (+0.7), stop-over-tokyo 1440 (+0.9) and
  what-i-learned-living-in-barcelona 1440 (+0.8): each of our captures is pixel-identical to sweep-so34's, except the
  Price Bar band at y 800. The bar draws no price tonight and hides itself; that is expected with airline hosts
  refused.
- gb/en all-it-takes-is-a-yes 1440 (+7.2): the fare teaser's offers (#6).
- /de/en/articles/explore-flying 390 (+0.9): another recording (lh-parity-002c here, lh-parity-007 in sweep-so34).

## lh-parity-014: the hubs and the lh-parity-008 pages (standing order 45, item 1)

lh-parity-014 (sha256 bc98b993..., 8 pages, one fresh load each at 1440 and 390) brings new recordings of the two Insights
hubs and of the five lh-parity-008 pages, plus take-off. The 16 page-widths were captured on our host at 01:05 CET with
the same runner. Every one of the archive's loads shows the OneTrust "Privacy Settings" dialog open over the first
screen (rows 0-899 at 1440 and 0-843 at 390, the page dimmed behind it), although the README says the banner was
accepted. So the first screen is masked on both sides (logs/b645/fold-<width>.json, beside the live boxes); "whole" is
the figure without that mask. The ranking below now holds these 16 instead of the hubs' and take-off's older
recordings: 286 page-widths. (The per-template table above is order 44's 276.)

| Page | Width | % (first screen masked) | Unmasked part only % | Masked % | Height www / ours | Before |
| --- | --- | --- | --- | --- | --- | --- |
| /de/en/articles/explore-flying | 1440 | 4.1 | 12.5 | 67.2 | 5489/5489 | 1.1 vs lh-parity-002 |
| /de/en/articles/explore-flying | 390 | 7.1 | 27.6 | 74.1 | 6650/6650 | 8.7 vs lh-parity-002 |
| /de/en/articles/explore-the-world | 1440 | 7.6 | 18.0 | 57.6 | 6333/6258 | 8.1 vs lh-parity-002 |
| /de/en/articles/explore-the-world | 390 | 7.4 | 19.3 | 61.8 | 8156/8000 | 7.6 vs lh-parity-002 |
| /de/en/articles/explore-flying/livery-iconic-moments | 1440 | 5.4 | 6.1 | 11.3 | 17187/8000 | not swept |
| /de/en/articles/explore-flying/livery-iconic-moments | 390 | 8.4 | 9.4 | 10.5 | 25051/8000 | not swept |
| /de/en/articles/highlights/allegris-new-york | 1440 | 8.3 | 10.2 | 18.8 | 6945/6935 | not swept |
| /de/en/articles/highlights/allegris-new-york | 390 | 10.3 | 13.7 | 24.4 | 7663/7663 | not swept |
| /de/de/articles/highlights/allegris-new-york | 1440 | 9.3 | 11.4 | 18.4 | 7080/7080 | not swept |
| /de/de/articles/highlights/allegris-new-york | 390 | 10.6 | 13.8 | 23.4 | 8227/8000 | not swept |
| /at/de/articles/highlights/allegris-new-york | 1440 | 9.8 | 12.0 | 18.4 | 7080/7038 | not swept |
| /at/de/articles/highlights/allegris-new-york | 390 | 11.7 | 15.3 | 23.4 | 8227/8000 | not swept |
| /gb/en/articles/highlights/allegris-new-york | 1440 | 10.2 | 12.5 | 18.8 | 6945/6864 | not swept |
| /gb/en/articles/highlights/allegris-new-york | 390 | 11.7 | 15.5 | 24.4 | 7663/7604 | not swept |
| /de/en/discover-lufthansa/take-off | 1440 | 3.9 | 4.9 | 19.9 | 4514/4514 | 4.5 vs lh-parity-002 |
| /de/en/discover-lufthansa/take-off | 390 | 6.3 | 7.2 | 12.2 | 6895/6895 | 6.3 vs lh-parity-002 |

- The hubs are now 4.1-7.6 %. Most of each hub (57-74 %) is its live article list, masked as in every gate.
- livery-iconic-moments: 5.4 / 8.4 % on the first 8,000 px (sweep-so34 had 29.8 / 24.2 against lh-parity-008). The re-import (order 34) and the related-cards row (order 37) are live.
- allegris-new-york: 8.3-10.2 % at 1440 and 10.3-11.7 % at 390, with the video ratio rows (order 34) live. at/de and gb/en lack the related cards' heading (places 22-23 below).
- take-off: 3.9 / 6.3 %, and with item 2's row 1.6 / 4.6 (delta-so45-adobe-take-off-impact-fares.txt).

## lh-parity-015: the same 8 pages, whole page (standing order 47, item 1)

lh-parity-015 (sha256 64c1967d..., the same 8 pages and 16 loads as lh-parity-014; each load a first visit, the OneTrust
dialog closed with a real click before recording) checked here too: the header is undimmed on all 16 (5,22,77 at 20,20,
as on our host). Our pages captured at 04:05 CET, with round 514's rows (take-off, allegris-new-york at/de and gb/en) and
round 516's batch 01 live. Whole page, no first-screen mask; the live boxes masked as in every gate. "First screen" is the
first 900 px (1440) / 844 px (390) alone.

| Page | Width | Whole page % | First screen % | Masked % | Height www / ours | lh-parity-014 (first screen masked) |
| --- | --- | --- | --- | --- | --- | --- |
| /de/en/articles/explore-flying | 1440 | 4.3 | 1.3 | 50.8 | 5489/5489 | 4.1 |
| /de/en/articles/explore-flying | 390 | 7.8 | 5.3 | 62.1 | 6650/6650 | 7.1 |
| /de/en/articles/explore-the-world | 1440 | 7.7 | 3.2 | 50.3 | 6333/6258 | 7.6 |
| /de/en/articles/explore-the-world | 390 | 7.4 | 6.0 | 56.8 | 8156/8000 | 7.4 |
| /de/en/articles/explore-flying/livery-iconic-moments | 1440 | 5.5 | 0.7 | 0.0 | 17187/8000 | 5.4 |
| /de/en/articles/explore-flying/livery-iconic-moments | 390 | 8.7 | 2.9 | 0.0 | 25051/8000 | 8.4 |
| /de/en/articles/highlights/allegris-new-york | 1440 | 9.0 | 5.9 | 5.8 | 6945/6935 | 8.3 |
| /de/en/articles/highlights/allegris-new-york | 390 | 10.9 | 3.6 | 12.7 | 7663/7663 | 10.3 |
| /de/de/articles/highlights/allegris-new-york | 1440 | 9.1 | 5.9 | 5.7 | 7080/7070 | 9.3 |
| /de/de/articles/highlights/allegris-new-york | 390 | 11.1 | 3.7 | 12.1 | 8227/8000 | 10.6 |
| /at/de/articles/highlights/allegris-new-york | 1440 | 9.1 | 5.9 | 5.7 | 7080/7070 | 9.8 |
| /at/de/articles/highlights/allegris-new-york | 390 | 11.1 | 3.7 | 12.1 | 8227/8000 | 11.7 |
| /gb/en/articles/highlights/allegris-new-york | 1440 | 9.0 | 5.9 | 5.8 | 6945/6935 | 10.2 |
| /gb/en/articles/highlights/allegris-new-york | 390 | 10.9 | 3.6 | 12.7 | 7663/7663 | 11.7 |
| /de/en/discover-lufthansa/take-off | 1440 | 1.8 | 0.5 | 0.0 | 4514/4514 | 3.9 |
| /de/en/discover-lufthansa/take-off | 390 | 4.8 | 0.8 | 0.0 | 6895/6895 | 6.3 |

Where the first screen differs from www, now that it is visible:
- allegris-new-york at 1440 (5.9 %): www draws its sticky Price Bar ("New York, round trip from 574.29 €", Find Flights)
  under the stage; ours hides the bar, because its price comes from www in the browser and is refused here. Our article card
  then starts where www's bar is. At 390 (3.6-3.7 %) the bar sits below the first screen on both.
- explore-the-world (1440 3.2, 390 6.0 %): the map. www draws Google Maps (its tiles and outline pins, a wider view down to
  South Africa at 390); ours draws OpenStreetMap tiles with filled pins at another zoom. By design (the poi-map block).
- explore-flying 390 (5.3 %): our H1 sits 8 px lower under the stage picture, and the results line reads 83 (www 82, the
  list's content).
- On every page: www's "Feedback" tab on the right edge (a www survey widget, not ours) and our DEMO badge; livery and
  take-off are within 0.5-2.9 % otherwise.

The ranking below holds these 16 whole-page figures instead of lh-parity-014's masked ones. (Places 21 to 60 below were
numbered on the ranking of their order; places 61 to 80 on this one.)

## allegris-new-york against lh-parity-015, by region (standing order 48, item 1)

The four versions captured as served at 05:05 CET (logs/b648/cap) and compared with lh-parity-015 in 10 px bands, the
live boxes masked as in every gate. Each band's mismatched pixels go to the region it falls in: www's sticky Price Bar
rows (drawn over the first screen's foot on www: rows 810-899 at 1440, 679-843 at 390), then our page's regions from its
DOM (logs/b648/q-regions.js). The figures are points of the whole page (they add up to its %).

| Version | Width | Whole page % | header | stage | Price Bar (www) | body text | body pictures | article-end teaser | related cards | footer | other |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| de/en | 1440 | 9.0 | 0.01 | 0.09 | 0.74 | 1.61 | 4.47 | 0.41 | 1.02 | 0.63 | 0.08 |
| de/en | 390 | 10.7 | 0.04 | 0.12 | 0.18 | 4.85 | 2.39 | 2.02 | 0.14 | 0.83 | 0.09 |
| de/de | 1440 | 9.1 | 0.01 | 0.1 | 0.72 | 1.86 | 4.27 | 0.4 | 1.04 | 0.62 | 0.07 |
| de/de | 390 | 10.9 | 0.03 | 0.14 | 0.19 | 4.83 | 2.28 | 1.95 | 0.18 | 1.26 | 0.03 |
| at/de | 1440 | 9.1 | 0.01 | 0.1 | 0.72 | 1.86 | 4.27 | 0.4 | 1.04 | 0.62 | 0.07 |
| at/de | 390 | 11.1 | 0.03 | 0.29 | 0.24 | 4.83 | 2.28 | 1.95 | 0.18 | 1.26 | 0.03 |
| gb/en | 1440 | 9.0 | 0.01 | 0.09 | 0.74 | 1.61 | 4.47 | 0.41 | 1.02 | 0.63 | 0.08 |
| gb/en | 390 | 10.9 | 0.03 | 0.29 | 0.24 | 4.85 | 2.39 | 2.02 | 0.14 | 0.84 | 0.09 |

What each region holds, and whether a row or rule of ours could close it:
- **Body pictures (4.3-4.5 points at 1440, 2.3-2.4 at 390).**
  - (1) The video "Take one!": www's player (video.js, preload metadata) paints the video's first 16:9 frame behind its
    21:9 poster, so the letterbox strips show the scene. Ours sets the poster on the video element and draws the strips
    black. That is 1.3 points at 1440 (two 70 px strips across the 1,052 px player) and 0.45 at 390. Closable in our
    code: scripts/media.js createVideo() (preload metadata and the poster as an overlay, not the poster attribute). It is
    the shared video code, every video on the site, and it would make every capture load the mp4. Not gated tonight; a
    proposal.
  - (2) The rest is the pictures below standing 26 px higher than www's, from y 2,160 at 1440 / 1,760 at 390 on. The
    video's caption has 28 px less below it than www's (www 74 px from the caption to the next text, ours 46): a Columns
    Media caption gap, ema-test's item 17.
- **Body text (1.6-1.9 at 1440, 4.8-4.9 at 390).** The same 26 px step: every line below the video's caption is offset
  by it, and at 390 that is most of the page. Item 17 again; no row of ours.
- **Article-end teaser (0.4 at 1440, 2.0 at 390).** The "Ready to discover the world?" teaser: www's "Find flight" is a
  text link with the small arrow, ours a standalone link (hand-over item 20), and the step above it.
- **Related cards (1.0 at 1440, 0.1-0.2 at 390).** Other, newer articles than www's three (content). None.
- **Price Bar (0.7 at 1440, 0.2 at 390).** www's bar with its price; ours hides it with the price refused here. None.
- **Footer (0.6-1.3).** The footer sits 10-11 px off with the drift above it; it closes with item 17.
- **Header and stage (0.1-0.3).** Within a few pixels.

So, of about 9 points at 1440: about 1.3 is ours to close (the video letterbox, a scripts/media.js change, not gated);
about 5-6 follow ema-test's item 17; the Price Bar and the related cards' content stay.

## Places 21 to 40 (standing order 45, item 3)

Places in the ranking below, with the lh-parity-014 page-widths in it. Drift steps and crops are in logs/b645 (not in git).

| Rank | Page-width | % | Cause (located) | Fix |
| --- | --- | --- | --- | --- |
| 21 | /de/en/book-and-manage/stopover 1440 | 11.8 | As #10 at 1440: the carousel cards' text runs narrower (the font width), the drift to -72 px in the lower half. | None (the drawing). |
| 22, 23 | /at/de, /gb/en articles/highlights/allegris-new-york 390 | 11.7 | (1) No heading before the related cards ("Ähnliche Artikel" / "Related Articles"): de/de and de/en have it, www shows it on all four, about 60 px. (2) The related cards are other, newer articles. (3) The article-end "Flug suchen" / "Find flight" link (hand-over item 20). | (1) READY rows: delta-so45-adobe-related-heading.txt (390 11.8 -> 10.7, 11.9 -> 10.5). The same gap on 1,053 at/de and gb/en articles, listed. (2) None: content. (3) Item 20. |
| 24 | /de/en/100-years/fleet 1440 | 11.4 | The aircraft rows: our text column wider than www's (Columns Media), so the rows end 30-99 px shorter; drift to -216. | Columns Media: hand-over item 15. |
| 25 | /de/en/munich-fair 1440 | 11.3 | (1) 55 px less from the stage picture to the first text (www 84 px, ours 29). (2) The grey band's H2 "From the airport to Messe München (Munich Trade Fair)/ICM" wraps to two lines in ours (one on www). (3) www's link carries another icon. | (1)-(2) Hand-over item 22 (section gap, heading width). (3) None. |
| 26, 37 | /de/en/articles/explore-the-world/a-perfect-day-barcelona-in-one-day, -berlin-in-one-day 390 | 11.1, 10.0 | Within 24 px. The bands are the photo rows and their captions: the pictures' crops, and the caption spacing within 3 px. | Columns Media photo captions: ema-test's item 17. |
| 27 | /de/en/lufthansa-city/culinaryjourney 390 | 11.1 | Section spacing: +55 px from the form's grey area to the next section (as #7). | Hand-over item 6. |
| 28 | /de/en/articles/explore-flying/anniversary-super-crane-special 390 | 10.8 | Within 28 px; the bands are spread evenly over text and photos. | None: under 1 % per step. |
| 29, 31 | /at/de, /de/de articles/tags/allegris 1440 | 10.6 | -27 px at the stage, then -44 to -74 from the grey "Tauchen Sie tiefer in die Welt von Lufthansa Allegris ein" band on: ours starts the band 15 px sooner after the picture above it. | Hand-over item 22 (section gap). |
| 30, 32 | /de/de, /de/en articles/highlights/allegris-new-york 390 | 10.6, 10.3 | As #22 without the heading gap: the related cards are other articles; item 20's link. | None: content; item 20. |
| 33, 38 | /gb/en, /at/de articles/highlights/allegris-new-york 1440 | 10.2, 9.8 | As #22. | READY rows (1440 10.2 -> 8.3, 9.8 -> 9.3). |
| 34-36 | /at/de, /de/de, /gb/en overview-travel-information 390 | 10.1 | www's lh-parity-004 recording has the Lufthansa chat assistant ("Hallo, ich bin Elisa") open over the first screen. Below it, within 6 px. | None: the recording's state. |
| 39 | /de/en/100-years/campaigns 390 | 9.5 | Within 24 px since orders 40-41's slider and quote rules. The recording's fallback face on the campaign headings (as #4). | None. |
| 40 | /de/en/100-years/crane 390 | 9.5 | Picture captions missing (the owner's decision, order 31), the recording's face; drift within 14 px, -55 at the end. | The owner's decision. |

## Places 41 to 60 (standing order 46, item 3)

Places in the ranking below (with the lh-parity-014 page-widths in it). Tonight's drift steps on order 44's captures
are in logs/b646/drift (not in git); most of these were located before, in sweep-so34-lh-adobe.md, and are unchanged.

| Rank | Page-width | % | Cause (located) | Fix |
| --- | --- | --- | --- | --- |
| 41 | /de/en/100-years/history/menu-on-board 390 | 9.5 | 12 picture captions missing (www 12, ours 0); drift within 30 px (one -274 step at 5,840 is the offsets matching a repeated picture, gone at the next step). | The owner's decision on the 100-years captions (order 31). |
| 42 | /de/en/articles/explore-the-world/be-picky-barcelona-insider-tips 390 | 9.5 | The pictures and captions sit 4-8 px lower than www's, within 22 px; the figure is the photos' detail at that offset. | None. |
| 43 | /de/en/articles/highlights/allegris-premium-economy-san-diego 1440 | 9.5 | www's recording shows a frame of the playing video, ours the poster; within 16 px. The poster heading's width is hand-over item 19. | None for the frame; item 19. |
| 44-46 | /gb/en, /at/de, /de/de 100-years/crane 390 | 9.5, 9.4, 9.4 | 5 picture captions missing, the recording's fallback face; within 14 px, -55 near the end. | The owner's decision. |
| 47, 56 | /de/de, /de/en articles/highlights/allegris-new-york 1440 | 9.3, 8.3 | Within 30 px (first screen masked, lh-parity-014); the related cards are other, newer articles; the article-end link (item 20). | None: content; item 20. |
| 48 | /de/en/articles/explore-the-world/eat-see-do-algiers 390 | 9.2 | The "This may also be of interest to you" cards stand 2 px lower each, +32 at the end. | None: under 1 % (order 41, item 3). |
| 49, 50 | /de/en, /gb/en articles/tags/allegris 1440 | 9.0 | The stage -27 px, then -43 to -80 from the grey band on (as #29: the band starts 15 px sooner). de/en's "Conditions" row is live (12.5 in sweep-so34). | Hand-over item 22. |
| 51 | /de/en/articles/explore-the-world/stop-over-tokyo 390 | 8.7 | The portrait picture: www's phone crop (faces higher); +92 at 4,480 is the offsets on that picture, back to -12 next; the end +37-42. | None: www's rendition. |
| 52 | /de/en/articles/explore-the-world/eat-see-do-berlin 390 | 8.5 | No drift until the end (+31 px): the bordered cards, about 2 px per card. | None: under 1 %. |
| 53 | /de/en/articles/explore-flying/livery-iconic-moments 390 | 8.4 | Within 15 px on the first 8,000 px (first screen masked). Photos. | None. |
| 54, 55 | /at/de, /de/de discover-lufthansa/new-onboard-experience 390 | 8.3 | Within 11 px; the collage after the awards badge 11 px higher. | None: under 1 %. |
| 57, 59 | /de/en/articles/explore-the-world/know-before-you-go-algiers, -berlin 390 | 8.2, 8.1 | (1) 21-44 px more above "Related Articles". (2) The "Find your flight" button's steps (order 41, item 3). | (1) Hand-over item 17. (2) None. |
| 58, 60 | /de/en, /gb/en 100-years/destinations 390 | 8.1 | Within 15 px; the recording's fallback face on the headings. | None: the recording's face. |

## Places 61 to 80 (standing order 47, item 3)

Places in the ranking below (with lh-parity-015's whole-page figures in it). All were located before (sweep-so34
places 59-118, order 44's worst 20); tonight's drift on the two hubs against lh-parity-015 is in logs/b647.

| Rank | Page-width | % | Cause (located) | Fix |
| --- | --- | --- | --- | --- |
| 61, 63, 73, 76 | /at/de, /de/de, /de/en, /gb/en 100-years/crane 1440 | 8.0, 8.0, 7.8, 7.8 | 5 picture captions missing; drift within 32 px. | The owner's decision (order 31). |
| 62, 64 | /at/de, /de/de 100-years/destinations 390 | 8.0 | Within 15 px; the recording's fallback face on the headings. | None. |
| 65 | /de/en/lufthansa-city/culinaryjourney 1440 | 8.0 | The H1's section starts 38 px higher than www's, then 24 px. | Hand-over item 6. |
| 66, 68, 69, 70 | /de/en, /gb/en lufthansa-travel-classes, /at/de, /de/de lufthansa-reiseklassen 390 | 8.0, 8.0, 7.9, 7.9 | Within 12 px; the stage tiles' photos under their dark overlay. | None. |
| 67 | /de/en/services-at-the-airport 390 | 8.0 | The text runs a word wider per line (the font width); the page ends 34 px sooner after the last card. | None for the font; hand-over item 17. |
| 71 | /de/en/articles/explore-the-world/be-picky-frankfurt-insider-tips 390 | 7.9 | Within 12 px; photos. | None. |
| 72 | /de/de/speisen-und-getraenke 390 | 7.8 | 30 px less above "Häufig gestellte Fragen"; one question wraps a line more. | Hand-over item 18. |
| 74 | /de/en/articles/explore-flying 390 | 7.8 (lh-parity-015, whole page) | (1) The first screen: our H1 8 px lower (see the lh-parity-015 section). (2) From 4,800 px on +136 to +171: the article list holds one article more (83 vs 82) and its cards are live boxes, masked. | (1) A heading's space after a stage picture: for ema-test's heading rules, item 23. (2) None: content. |
| 75 | /de/en/articles/explore-the-world/what-i-learned-living-in-frankfurt 390 | 7.8 | The article-end teaser's link (item 20), 22 px more above "Related Articles" (item 17), the related cards' order. | Items 20 and 17; the rest none. |
| 77 | /de/en/articles/explore-flying/anniversary-super-crane-special 1440 | 7.7 | Within 31 px; photos. | None. |
| 78 | /de/en/articles/explore-the-world 1440 | 7.7 (lh-parity-015, whole page) | (1) The map (OpenStreetMap against www's Google Maps). (2) 26 px less above "Discover your dream destinations with us!". (3) The results list's content (drift -175 to -68). | (1) None: by design. (2) Hand-over item 18. (3) None. |
| 79 | /de/en/articles/explore-the-world/eat-see-do-algiers 1440 | 7.7 | Our capture is sweep-so34's but for the Price Bar band at y 800: the bar draws no price with airline hosts refused and hides (7.0 in sweep-so34, when it drew one). | None: expected with prices refused. |
| 80 | /de/en/articles/explore-the-world/in-my-hood-chiswick-london 390 | 7.7 | Within 23 px until the related cards (+48), then back to 0; photos. | None. |

## Places 81 to 100 (standing order 48, item 3)

Places in the ranking below (order 47's). All were located in sweep-so34-lh-adobe.md (places 79-118) or in order 47's
lh-parity-015 section, and are unchanged.

| Rank | Page-width | % | Cause (located) | Fix |
| --- | --- | --- | --- | --- |
| 81, 82 | /de/en, /gb/en frankfurt-fair 1440 | 7.7 | 39 px less above "The benefits of travelling with Lufthansa to Messe Frankfurt"; the benefit cards' columns 9 px wider. | Hand-over item 18; the columns not tonight (Columns Media). |
| 83, 85, 95, 96 | /at/de, /de/de, /de/en, /gb/en frankfurt-fair 390 | 7.6, 7.6, 7.3, 7.3 | Within 37 px (the stage), then within 18. | None. |
| 84 | /at/de/speisen-und-getraenke 390 | 7.6 | 30 px less above the FAQ heading; one question wraps a line more. | Hand-over item 18. |
| 86 | /de/en/articles/explore-the-world/on-the-scene-caspar-plautz-munich 390 | 7.6 | The article end (item 20's link), 23 px more above "Related Articles" (item 17), the third related article another one. | Items 20 and 17. |
| 87 | /de/en/articles/explore-the-world/stop-over-tokyo 1440 | 7.6 | The Price Bar not drawn with prices refused (6.7 in sweep-so34, when it drew one); www's 1440 portrait crop. | None. |
| 88, 89, 92 | /at/de, /de/de services-am-flughafen, /gb/en services-at-the-airport 390 | 7.5 | Within 26 px; the text a word wider per line (the font width). | None. |
| 90, 91 | /de/en, /gb/en discover-lufthansa/new-onboard-experience 390 | 7.5 | Within 8 px; the collage. | None. |
| 93 | /de/en/articles/explore-the-world 390 | 7.4 (lh-parity-015) | The map (OpenStreetMap against Google Maps), 35 px less above "Discover your dream destinations with us!", the list's content. | None for the map and list; item 18. |
| 94 | /de/en/articles/highlights/allegris-premium-economy-san-diego 390 | 7.3 | The related cards: newer articles than the recording's. | None: content. |
| 97, 98 | /at/de, /de/de digital-self-services 390 | 7.2 | 21 px less from the separator to "Das könnte Sie auch interessieren". | Hand-over item 19. |
| 99 | /de/en/articles/explore-the-world/essentials-barcelona-facts 390 | 7.2 | The inline link "→ history" wraps a line more; the illustration 10 px lower; item 20's link; 22 px more above "Related Articles". | Items 20 and 17; the rest under 1 %. |
| 100 | /de/en/articles/explore-the-world/what-i-learned-living-in-barcelona 1440 | 7.1 | The Price Bar not drawn (6.3 in sweep-so34); 28 px less above the author quote after the picture row (item 21). | Item 21; the bar none. |

## Every page-width, worst first

| Rank | Page | Template | Width | % | Height www / ours | Masked % | Recording | Before |
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
| 24 | /at/de/articles/highlights/allegris-new-york | insights | 390 | 11.1 | 8227/8000 | 12.1 | lh-parity-015 | 11.7 (lh-parity-014, first screen masked) |
| 25 | /de/de/articles/highlights/allegris-new-york | insights | 390 | 11.1 | 8227/8000 | 12.1 | lh-parity-015 | 10.6 (lh-parity-014, first screen masked) |
| 26 | /de/en/articles/explore-the-world/a-perfect-day-barcelona-in-one-day | insights | 390 | 11.1 | 8000/8000 | 14.1 | lh-parity-002 | 11.1 |
| 27 | /de/en/lufthansa-city/culinaryjourney | campaign | 390 | 11.1 | 1736/1736 | 0.0 | lh-parity-002 | 11.1 |
| 28 | /de/en/articles/highlights/allegris-new-york | insights | 390 | 10.9 | 7663/7663 | 12.7 | lh-parity-015 | 10.3 (lh-parity-014, first screen masked) |
| 29 | /gb/en/articles/highlights/allegris-new-york | insights | 390 | 10.9 | 7663/7663 | 12.7 | lh-parity-015 | 11.7 (lh-parity-014, first screen masked) |
| 30 | /de/en/articles/explore-flying/anniversary-super-crane-special | insights | 390 | 10.8 | 8000/8000 | 0.0 | lh-parity-002 | 12.0 |
| 31 | /at/de/articles/tags/allegris | insights | 1440 | 10.6 | 7467/7396 | 31.3 | lh-parity-004 | 12.1 |
| 32 | /de/de/articles/tags/allegris | insights | 1440 | 10.6 | 7467/7396 | 31.3 | lh-parity-004 | 12.1 |
| 33 | /at/de/overview-travel-information | hub | 390 | 10.1 | 4041/4041 | 0.0 | lh-parity-004 | 10.1 |
| 34 | /de/de/overview-travel-information | hub | 390 | 10.1 | 4041/4041 | 0.0 | lh-parity-004 | 10.1 |
| 35 | /gb/en/overview-travel-information | hub | 390 | 10.1 | 3950/3950 | 0.0 | lh-parity-004 | 10.1 |
| 36 | /de/en/articles/explore-the-world/a-perfect-day-berlin-in-one-day | insights | 390 | 10.0 | 8000/8000 | 12.5 | lh-parity-002 | 10.0 |
| 37 | /de/en/100-years/campaigns | campaign | 390 | 9.5 | 8000/8000 | 0.0 | lh-parity-002 | 10.4 |
| 38 | /de/en/100-years/crane | campaign | 390 | 9.5 | 8000/8000 | 0.0 | lh-parity-002 | 9.5 |
| 39 | /de/en/100-years/history/menu-on-board | campaign | 390 | 9.5 | 8000/8000 | 10.1 | lh-parity-002 | 9.5 |
| 40 | /de/en/articles/explore-the-world/be-picky-barcelona-insider-tips | insights | 390 | 9.5 | 7635/7635 | 15.2 | lh-parity-002 | 9.5 |
| 41 | /de/en/articles/highlights/allegris-premium-economy-san-diego | insights | 1440 | 9.5 | 6730/6730 | 6.0 | lh-parity-002 | 9.5 |
| 42 | /gb/en/100-years/crane | campaign | 390 | 9.5 | 8000/8000 | 0.0 | lh-parity-004 | 9.5 |
| 43 | /at/de/100-years/crane | campaign | 390 | 9.4 | 8000/8000 | 0.0 | lh-parity-004 | 9.4 |
| 44 | /de/de/100-years/crane | campaign | 390 | 9.4 | 8000/8000 | 0.0 | lh-parity-004 | 9.4 |
| 45 | /de/en/articles/explore-the-world/eat-see-do-algiers | insights | 390 | 9.2 | 8000/8000 | 13.5 | lh-parity-002 | 9.2 |
| 46 | /at/de/articles/highlights/allegris-new-york | insights | 1440 | 9.1 | 7080/7070 | 5.7 | lh-parity-015 | 9.8 (lh-parity-014, first screen masked) |
| 47 | /de/de/articles/highlights/allegris-new-york | insights | 1440 | 9.1 | 7080/7070 | 5.7 | lh-parity-015 | 9.3 (lh-parity-014, first screen masked) |
| 48 | /de/en/articles/highlights/allegris-new-york | insights | 1440 | 9.0 | 6945/6935 | 5.8 | lh-parity-015 | 8.3 (lh-parity-014, first screen masked) |
| 49 | /de/en/articles/tags/allegris | insights | 1440 | 9.0 | 7492/7412 | 31.7 | lh-parity-002 | 12.5 |
| 50 | /gb/en/articles/highlights/allegris-new-york | insights | 1440 | 9.0 | 6945/6935 | 5.8 | lh-parity-015 | 10.2 (lh-parity-014, first screen masked) |
| 51 | /gb/en/articles/tags/allegris | insights | 1440 | 9.0 | 7492/7412 | 31.7 | lh-parity-004 | 10.6 |
| 52 | /de/en/articles/explore-flying/livery-iconic-moments | insights | 390 | 8.7 | 25051/8000 | 0.0 | lh-parity-015 | 8.4 (lh-parity-014, first screen masked) |
| 53 | /de/en/articles/explore-the-world/stop-over-tokyo | insights | 390 | 8.7 | 7337/7337 | 15.1 | lh-parity-002 | 8.8 |
| 54 | /de/en/articles/explore-the-world/eat-see-do-berlin | insights | 390 | 8.5 | 8000/8000 | 0.7 | lh-parity-002 | 8.4 |
| 55 | /at/de/discover-lufthansa/new-onboard-experience | campaign | 390 | 8.3 | 8000/8000 | 0.0 | lh-parity-004 | 8.3 |
| 56 | /de/de/discover-lufthansa/new-onboard-experience | campaign | 390 | 8.3 | 8000/8000 | 0.0 | lh-parity-004 | 8.3 |
| 57 | /de/en/articles/explore-the-world/know-before-you-go-algiers | insights | 390 | 8.2 | 7470/7470 | 14.5 | lh-parity-002 | 8.2 |
| 58 | /de/en/100-years/destinations | campaign | 390 | 8.1 | 8000/8000 | 0.0 | lh-parity-002 | 8.1 |
| 59 | /de/en/articles/explore-the-world/know-before-you-go-berlin | insights | 390 | 8.1 | 7415/7415 | 14.2 | lh-parity-002 | 8.0 |
| 60 | /gb/en/100-years/destinations | campaign | 390 | 8.1 | 8000/8000 | 0.0 | lh-parity-004 | 8.1 |
| 61 | /at/de/100-years/crane | campaign | 1440 | 8.0 | 8000/8000 | 0.0 | lh-parity-004 | 8.0 |
| 62 | /at/de/100-years/destinations | campaign | 390 | 8.0 | 8000/8000 | 0.0 | lh-parity-004 | 8.0 |
| 63 | /de/de/100-years/crane | campaign | 1440 | 8.0 | 8000/8000 | 0.0 | lh-parity-004 | 8.0 |
| 64 | /de/de/100-years/destinations | campaign | 390 | 8.0 | 8000/8000 | 0.0 | lh-parity-004 | 8.0 |
| 65 | /de/en/lufthansa-city/culinaryjourney | campaign | 1440 | 8.0 | 1359/1335 | 0.0 | lh-parity-002 | 8.0 |
| 66 | /de/en/lufthansa-travel-classes | hub | 390 | 8.0 | 4688/4688 | 0.0 | lh-parity-002 | 8.0 |
| 67 | /de/en/services-at-the-airport | hub | 390 | 8.0 | 3411/3382 | 0.0 | lh-parity-002 | 8.0 |
| 68 | /gb/en/lufthansa-travel-classes | hub | 390 | 8.0 | 4688/4688 | 0.0 | lh-parity-004 | 8.0 |
| 69 | /at/de/lufthansa-reiseklassen | hub | 390 | 7.9 | 4787/4787 | 0.0 | lh-parity-004 | 7.9 |
| 70 | /de/de/lufthansa-reiseklassen | hub | 390 | 7.9 | 4787/4787 | 0.0 | lh-parity-004 | 7.9 |
| 71 | /de/en/articles/explore-the-world/be-picky-frankfurt-insider-tips | insights | 390 | 7.9 | 5101/5101 | 19.0 | lh-parity-002 | 7.9 |
| 72 | /de/de/speisen-und-getraenke | hub | 390 | 7.8 | 7101/7101 | 0.0 | lh-parity-004 | 7.8 |
| 73 | /de/en/100-years/crane | campaign | 1440 | 7.8 | 8000/8000 | 0.0 | lh-parity-002 | 7.8 |
| 74 | /de/en/articles/explore-flying | insights | 390 | 7.8 | 6650/6650 | 62.1 | lh-parity-015 | 7.1 (lh-parity-014, first screen masked) |
| 75 | /de/en/articles/explore-the-world/what-i-learned-living-in-frankfurt | insights | 390 | 7.8 | 6027/6027 | 16.1 | lh-parity-002 | 7.8 |
| 76 | /gb/en/100-years/crane | campaign | 1440 | 7.8 | 8000/8000 | 0.0 | lh-parity-004 | 7.8 |
| 77 | /de/en/articles/explore-flying/anniversary-super-crane-special | insights | 1440 | 7.7 | 7218/7218 | 5.9 | lh-parity-002 | 7.7 |
| 78 | /de/en/articles/explore-the-world | insights | 1440 | 7.7 | 6333/6258 | 50.3 | lh-parity-015 | 7.6 (lh-parity-014, first screen masked) |
| 79 | /de/en/articles/explore-the-world/eat-see-do-algiers | insights | 1440 | 7.7 | 6548/6527 | 5.6 | lh-parity-002 | 7.0 |
| 80 | /de/en/articles/explore-the-world/in-my-hood-chiswick-london | insights | 390 | 7.7 | 7210/7210 | 24.2 | lh-parity-002 | 7.5 |
| 81 | /de/en/frankfurt-fair | campaign | 1440 | 7.7 | 3524/3448 | 0.0 | lh-parity-002 | 7.7 |
| 82 | /gb/en/frankfurt-fair | campaign | 1440 | 7.7 | 3524/3448 | 0.0 | lh-parity-004 | 7.7 |
| 83 | /at/de/frankfurt-fair | campaign | 390 | 7.6 | 5439/5435 | 0.0 | lh-parity-004 | 7.6 |
| 84 | /at/de/speisen-und-getraenke | hub | 390 | 7.6 | 7101/7101 | 0.0 | lh-parity-004 | 7.6 |
| 85 | /de/de/frankfurt-fair | campaign | 390 | 7.6 | 5439/5435 | 0.0 | lh-parity-004 | 7.6 |
| 86 | /de/en/articles/explore-the-world/on-the-scene-caspar-plautz-munich | insights | 390 | 7.6 | 6746/6746 | 26.7 | lh-parity-002 | 7.7 |
| 87 | /de/en/articles/explore-the-world/stop-over-tokyo | insights | 1440 | 7.6 | 6251/6240 | 5.9 | lh-parity-002 | 6.7 |
| 88 | /at/de/services-am-flughafen | hub | 390 | 7.5 | 3622/3619 | 0.0 | lh-parity-004 | 7.5 |
| 89 | /de/de/services-am-flughafen | hub | 390 | 7.5 | 3622/3619 | 0.0 | lh-parity-004 | 7.5 |
| 90 | /de/en/discover-lufthansa/new-onboard-experience | campaign | 390 | 7.5 | 8000/8000 | 0.0 | lh-parity-002 | 7.5 |
| 91 | /gb/en/discover-lufthansa/new-onboard-experience | campaign | 390 | 7.5 | 8000/8000 | 0.0 | lh-parity-004 | 7.5 |
| 92 | /gb/en/services-at-the-airport | hub | 390 | 7.5 | 3411/3409 | 0.0 | lh-parity-004 | 7.5 |
| 93 | /de/en/articles/explore-the-world | insights | 390 | 7.4 | 8156/8000 | 56.8 | lh-parity-015 | 7.4 (lh-parity-014, first screen masked) |
| 94 | /de/en/articles/highlights/allegris-premium-economy-san-diego | insights | 390 | 7.3 | 7206/7206 | 14.2 | lh-parity-002 | 7.3 |
| 95 | /de/en/frankfurt-fair | campaign | 390 | 7.3 | 5310/5305 | 0.0 | lh-parity-002 | 7.3 |
| 96 | /gb/en/frankfurt-fair | campaign | 390 | 7.3 | 5310/5305 | 0.0 | lh-parity-004 | 7.3 |
| 97 | /at/de/digital-self-services | hub | 390 | 7.2 | 5651/5631 | 0.0 | lh-parity-004 | 7.2 |
| 98 | /de/de/digital-self-services | hub | 390 | 7.2 | 5651/5631 | 0.0 | lh-parity-004 | 7.2 |
| 99 | /de/en/articles/explore-the-world/essentials-barcelona-facts | insights | 390 | 7.2 | 5986/5986 | 19.4 | lh-parity-002 | 7.3 |
| 100 | /de/en/articles/explore-the-world/what-i-learned-living-in-barcelona | insights | 1440 | 7.1 | 5915/5882 | 6.9 | lh-parity-002 | 6.3 |
| 101 | /gb/en/digital-self-services | hub | 390 | 7.1 | 5489/5469 | 0.0 | lh-parity-004 | 7.1 |
| 102 | /de/en/100-years/chronicle | campaign | 390 | 7.0 | 8000/8000 | 10.1 | lh-parity-002 | 7.0 |
| 103 | /de/en/digital-self-services | hub | 390 | 7.0 | 5489/5469 | 0.0 | lh-parity-002 | 7.0 |
| 104 | /de/en/food-and-beverages | hub | 390 | 7.0 | 6683/6683 | 0.0 | lh-parity-002 | 7.0 |
| 105 | /gb/en/food-and-beverages | hub | 390 | 7.0 | 6683/6683 | 0.0 | lh-parity-004 | 7.0 |
| 106 | /at/de/articles/highlights/allegris-premium-economy-san-diego | insights | 1440 | 6.9 | 6921/6921 | 6.2 | lh-parity-004 | 6.9 |
| 107 | /at/de/betreuungsbedarf | hub | 390 | 6.9 | 7247/7247 | 0.0 | lh-parity-004 | 8.4 |
| 108 | /de/de/articles/highlights/allegris-premium-economy-san-diego | insights | 1440 | 6.9 | 6921/6921 | 6.2 | lh-parity-004 | 6.9 |
| 109 | /de/de/betreuungsbedarf | hub | 390 | 6.9 | 7247/7246 | 0.0 | lh-parity-004 | 7.8 |
| 110 | /at/de/additional-services | hub | 390 | 6.8 | 8000/8000 | 0.0 | lh-parity-004 | 6.8 |
| 111 | /de/de/additional-services | hub | 390 | 6.8 | 8000/8000 | 0.0 | lh-parity-004 | 6.8 |
| 112 | /de/en/special-needs | hub | 390 | 6.8 | 6966/6966 | 0.0 | lh-parity-002 | 8.6 |
| 113 | /gb/en/special-needs | hub | 390 | 6.8 | 6966/6966 | 0.0 | lh-parity-004 | 8.6 |
| 114 | /de/en/additional-services | hub | 390 | 6.7 | 8000/8000 | 0.0 | lh-parity-002 | 6.7 |
| 115 | /gb/en/additional-services | hub | 390 | 6.7 | 8000/8000 | 0.0 | lh-parity-004 | 6.7 |
| 116 | /at/de/articles/highlights/all-it-takes-is-a-yes | insights | 1440 | 6.6 | 6791/6791 | 6.3 | lh-parity-004 | 9.7 |
| 117 | /at/de/articles/tags/allegris | insights | 390 | 6.6 | 8000/8000 | 45.1 | lh-parity-004 | 6.3 |
| 118 | /de/de/articles/highlights/all-it-takes-is-a-yes | insights | 1440 | 6.6 | 6791/6791 | 6.3 | lh-parity-004 (second load) | 9.7 |
| 119 | /de/en/articles/highlights/all-it-takes-is-a-yes | insights | 1440 | 6.6 | 6737/6737 | 6.4 | lh-parity-002 | 10.6 |
| 120 | /at/de/frankfurt-fair | campaign | 1440 | 6.5 | 3501/3451 | 0.0 | lh-parity-004 | 6.5 |
| 121 | /de/de/frankfurt-fair | campaign | 1440 | 6.5 | 3501/3451 | 0.0 | lh-parity-004 | 6.5 |
| 122 | /de/en/100-years/fleet | campaign | 390 | 6.4 | 8000/8000 | 8.0 | lh-parity-002 | 7.9 |
| 123 | /de/en/discover-lufthansa/new-onboard-experience | campaign | 1440 | 6.2 | 8000/8000 | 0.0 | lh-parity-002 | 6.2 |
| 124 | /gb/en/discover-lufthansa/new-onboard-experience | campaign | 1440 | 6.2 | 8000/8000 | 0.0 | lh-parity-004 | 6.2 |
| 125 | /at/de/meetings-and-events | hub | 390 | 6.1 | 4130/4130 | 0.0 | lh-parity-004 | 6.3 |
| 126 | /de/de/meetings-and-events | hub | 390 | 6.1 | 4130/4130 | 0.0 | lh-parity-004 | 6.3 |
| 127 | /de/en/articles/explore-the-world/be-picky-barcelona-insider-tips | insights | 1440 | 6.1 | 5062/5042 | 9.8 | lh-parity-002 | 6.0 |
| 128 | /de/en/munich-fair | campaign | 390 | 6.1 | 3143/3143 | 0.0 | lh-parity-002 | 6.1 |
| 129 | /de/de/articles/tags/allegris | insights | 390 | 6.0 | 8000/8000 | 45.1 | lh-parity-004 | 6.3 |
| 130 | /de/en/most-significant-route | campaign | 390 | 6.0 | 2783/2780 | 0.0 | lh-parity-002 | 6.0 |
| 131 | /gb/en/most-significant-route | campaign | 390 | 6.0 | 2783/2780 | 0.0 | lh-parity-004 | 6.0 |
| 132 | /at/de/bedeutsamste-strecken | campaign | 390 | 5.9 | 2878/2875 | 0.0 | lh-parity-004 | 5.9 |
| 133 | /de/de/bedeutsamste-strecken | campaign | 390 | 5.9 | 2878/2875 | 0.0 | lh-parity-004 | 5.9 |
| 134 | /de/en/100-years/cabin-design | campaign | 1440 | 5.9 | 8000/8000 | 10.1 | lh-parity-002 | 6.1 |
| 135 | /de/en/100-years/history | campaign | 390 | 5.9 | 8000/8000 | 10.1 | lh-parity-002 | 5.9 |
| 136 | /de/en/additional-services | hub | 1440 | 5.8 | 6773/6766 | 0.0 | lh-parity-002 | 5.8 |
| 137 | /de/en/articles/explore-flying/flying-high-christoph-quarch | insights | 1440 | 5.8 | 5407/5400 | 7.9 | lh-parity-002 | 5.8 |
| 138 | /de/en/overview-special-request | hub | 390 | 5.8 | 3936/3936 | 0.0 | lh-parity-002 | 5.8 |
| 139 | /gb/en/additional-services | hub | 1440 | 5.8 | 6773/6766 | 0.0 | lh-parity-004 | 5.8 |
| 140 | /gb/en/overview-special-request | hub | 390 | 5.8 | 3936/3936 | 0.0 | lh-parity-004 | 5.8 |
| 141 | /at/de/additional-services | hub | 1440 | 5.7 | 6773/6766 | 0.0 | lh-parity-004 | 5.7 |
| 142 | /at/de/articles/highlights/allegris-premium-economy-san-diego | insights | 390 | 5.7 | 7820/7820 | 13.1 | lh-parity-004 | 5.7 |
| 143 | /at/de/overview-flights | hub | 390 | 5.7 | 3612/3601 | 0.0 | lh-parity-004 | 5.7 |
| 144 | /de/de/additional-services | hub | 1440 | 5.7 | 6773/6766 | 0.0 | lh-parity-004 | 5.7 |
| 145 | /de/de/overview-flights | hub | 390 | 5.7 | 3612/3601 | 0.0 | lh-parity-004 | 5.7 |
| 146 | /de/en/homepage | homepage | 390 | 5.7 | 6086/6076 | 26.9 | lh-parity-002 (notice cut) | 5.4 |
| 147 | /de/en/meetings-and-events | hub | 390 | 5.7 | 3869/3869 | 0.0 | lh-parity-002 | 6.0 |
| 148 | /de/en/overview-flights | hub | 390 | 5.7 | 3517/3506 | 0.0 | lh-parity-002 | 5.7 |
| 149 | /gb/en/articles/highlights/allegris-premium-economy-san-diego | insights | 390 | 5.7 | 7206/7206 | 14.2 | lh-parity-004 | 5.7 |
| 150 | /gb/en/meetings-and-events | hub | 390 | 5.7 | 3869/3869 | 0.0 | lh-parity-004 | 6.0 |
| 151 | /gb/en/overview-flights | hub | 390 | 5.7 | 3517/3506 | 0.0 | lh-parity-004 | 5.7 |
| 152 | /at/de/overview-special-request | hub | 390 | 5.6 | 4027/4027 | 0.0 | lh-parity-004 | 5.6 |
| 153 | /at/de/overview-travel-information | hub | 1440 | 5.6 | 2840/2840 | 0.0 | lh-parity-004 | 5.6 |
| 154 | /de/de/overview-special-request | hub | 390 | 5.6 | 4027/4027 | 0.0 | lh-parity-004 | 5.6 |
| 155 | /de/de/overview-travel-information | hub | 1440 | 5.6 | 2840/2840 | 0.0 | lh-parity-004 | 5.6 |
| 156 | /de/en/airport-information | hub | 390 | 5.6 | 5465/5465 | 0.0 | lh-parity-002 | 5.6 |
| 157 | /de/en/articles/explore-flying/flying-high-christoph-quarch | insights | 390 | 5.6 | 6410/6402 | 15.4 | lh-parity-002 | 9.3 |
| 158 | /de/en/articles/explore-the-world/in-my-hood-district-zurich | insights | 390 | 5.6 | 8000/8000 | 25.7 | lh-parity-002 | 5.6 |
| 159 | /de/en/services-on-board | hub | 390 | 5.6 | 3993/3991 | 0.0 | lh-parity-002 | 5.6 |
| 160 | /gb/en/airport-information | hub | 390 | 5.6 | 5465/5465 | 0.0 | lh-parity-004 | 5.6 |
| 161 | /gb/en/services-on-board | hub | 390 | 5.6 | 3993/3991 | 0.0 | lh-parity-004 | 5.6 |
| 162 | /at/de/services-an-bord | hub | 390 | 5.5 | 4088/4086 | 0.0 | lh-parity-004 | 5.5 |
| 163 | /de/de/services-an-bord | hub | 390 | 5.5 | 4088/4086 | 0.0 | lh-parity-004 | 5.5 |
| 164 | /de/en/articles/explore-flying/livery-iconic-moments | insights | 1440 | 5.5 | 17187/8000 | 0.0 | lh-parity-015 | 5.4 (lh-parity-014, first screen masked) |
| 165 | /gb/en/overview-travel-information | hub | 1440 | 5.5 | 2840/2840 | 0.0 | lh-parity-004 | 5.5 |
| 166 | /de/de/articles/highlights/allegris-premium-economy-san-diego | insights | 390 | 5.4 | 7820/7820 | 13.1 | lh-parity-004 | 5.4 |
| 167 | /de/en/miles-and-more | hub | 390 | 5.2 | 4188/4188 | 0.0 | lh-parity-002 | 5.2 |
| 168 | /gb/en/miles-and-more | hub | 390 | 5.2 | 4188/4188 | 0.0 | lh-parity-004 | 5.2 |
| 169 | /de/en/articles/explore-flying/essentials-future-of-flying | insights | 390 | 5.1 | 5715/5715 | 18.3 | lh-parity-002 | 5.1 |
| 170 | /de/en/book-and-manage/stopover/bayerischer-hof | campaign | 1440 | 5.1 | 2935/2935 | 11.1 | lh-parity-002 | 5.1 |
| 171 | /at/de/miles-and-more | hub | 390 | 5.0 | 4511/4511 | 0.0 | lh-parity-004 | 5.0 |
| 172 | /de/de/miles-and-more | hub | 390 | 5.0 | 4511/4511 | 0.0 | lh-parity-004 | 5.0 |
| 173 | /de/en/articles/explore-the-world/essentials-frankfurt-facts | insights | 1440 | 5.0 | 5130/5130 | 7.9 | lh-parity-002 | 5.2 |
| 174 | /de/en/articles/explore-the-world/on-the-scene-food-trends-istanbul | insights | 1440 | 5.0 | 5289/5217 | 18.2 | lh-parity-002 | 5.0 |
| 175 | /de/en/baggage | hub | 390 | 5.0 | 7339/7339 | 0.0 | lh-parity-002 | 5.0 |
| 176 | /gb/en/articles/highlights/allegris-premium-economy-san-diego | insights | 1440 | 5.0 | 6730/6730 | 6.0 | lh-parity-004 | 5.0 |
| 177 | /gb/en/baggage | hub | 390 | 5.0 | 7339/7339 | 0.0 | lh-parity-004 | 5.0 |
| 178 | /de/en/100-years/campaigns | campaign | 1440 | 4.9 | 8000/8000 | 0.0 | lh-parity-002 | 4.9 |
| 179 | /at/de/gepaeck | hub | 390 | 4.8 | 7511/7511 | 0.0 | lh-parity-004 | 4.8 |
| 180 | /de/de/gepaeck | hub | 390 | 4.8 | 7511/7511 | 0.0 | lh-parity-004 | 4.8 |
| 181 | /de/en/book-and-manage/stopover/neuschwanstein | campaign | 1440 | 4.8 | 2999/2999 | 10.9 | lh-parity-002 | 4.8 |
| 182 | /de/en/discover-lufthansa/take-off | campaign | 390 | 4.8 | 6895/6895 | 0.0 | lh-parity-015 | 6.3 (lh-parity-014, first screen masked) |
| 183 | /de/en/homepage | homepage | 1440 | 4.8 | 5020/4996 | 28.1 | lh-parity-002 (notice cut) | 6.0 |
| 184 | /de/en/articles/explore-the-world/know-before-you-go-berlin | insights | 1440 | 4.6 | 7488/7458 | 6.1 | lh-parity-002 | 4.6 |
| 185 | /de/en/articles/explore-the-world/what-i-learned-living-in-frankfurt | insights | 1440 | 4.6 | 4526/4519 | 9.0 | lh-parity-002 | 4.6 |
| 186 | /gb/en/articles/tags/allegris | insights | 390 | 4.6 | 7897/7893 | 44.8 | lh-parity-004 | 4.3 |
| 187 | /at/de/discover-lufthansa/new-onboard-experience | campaign | 1440 | 4.5 | 8000/8000 | 0.0 | lh-parity-004 (second load) | 4.5 |
| 188 | /de/de/discover-lufthansa/new-onboard-experience | campaign | 1440 | 4.5 | 8000/8000 | 0.0 | lh-parity-004 | 4.5 |
| 189 | /de/en/articles/authors/florian-tomberg | insights | 390 | 4.5 | 3801/3801 | 41.6 | lh-parity-002 | 4.5 |
| 190 | /de/en/book-and-manage/stopover/zugspitze | campaign | 1440 | 4.5 | 3055/3055 | 10.7 | lh-parity-002 | 4.5 |
| 191 | /de/en/articles/explore-the-world/on-the-scene-food-trends-istanbul | insights | 390 | 4.4 | 7097/7097 | 26.0 | lh-parity-002 | 4.4 |
| 192 | /de/en/articles/explore-flying | insights | 1440 | 4.3 | 5489/5489 | 50.8 | lh-parity-015 | 4.1 (lh-parity-014, first screen masked) |
| 193 | /de/en/articles/explore-the-world/know-before-you-go-algiers | insights | 1440 | 4.3 | 7447/7417 | 6.2 | lh-parity-002 | 4.3 |
| 194 | /gb/en/special-needs | hub | 1440 | 4.2 | 5271/5271 | 0.0 | lh-parity-004 | 5.3 |
| 195 | /de/en/articles/explore-the-world/eat-see-do-berlin | insights | 1440 | 4.1 | 7064/7064 | 7.0 | lh-parity-002 | 4.1 |
| 196 | /de/en/book-and-manage/stopover/bayerischer-hof | campaign | 390 | 4.1 | 4036/4036 | 11.0 | lh-parity-002 | 4.1 |
| 197 | /de/en/special-needs | hub | 1440 | 4.1 | 5271/5271 | 0.0 | lh-parity-002 | 5.3 |
| 198 | /at/de/lufthansa-reiseklassen | hub | 1440 | 3.9 | 3295/3290 | 0.0 | lh-parity-004 | 3.9 |
| 199 | /de/de/lufthansa-reiseklassen | hub | 1440 | 3.9 | 3295/3290 | 0.0 | lh-parity-004 | 3.9 |
| 200 | /de/en/articles/explore-the-world/essentials-frankfurt-facts | insights | 390 | 3.9 | 5001/5001 | 19.4 | lh-parity-002 | 3.9 |
| 201 | /de/en/articles/tags/allegris | insights | 390 | 3.9 | 7897/7893 | 44.8 | lh-parity-002 | 7.3 |
| 202 | /de/en/lufthansa-travel-classes | hub | 1440 | 3.9 | 3295/3290 | 0.0 | lh-parity-002 | 3.9 |
| 203 | /gb/en/lufthansa-travel-classes | hub | 1440 | 3.9 | 3295/3290 | 0.0 | lh-parity-004 | 3.9 |
| 204 | /de/en/airport-information | hub | 1440 | 3.8 | 3232/3230 | 0.0 | lh-parity-002 | 3.8 |
| 205 | /gb/en/airport-information | hub | 1440 | 3.8 | 3232/3230 | 0.0 | lh-parity-004 | 3.8 |
| 206 | /de/en/articles/explore-the-world/in-my-hood-district-zurich | insights | 1440 | 3.6 | 5455/5440 | 17.6 | lh-parity-002 | 3.6 |
| 207 | /de/en/digital-self-services | hub | 1440 | 3.5 | 4430/4430 | 0.0 | lh-parity-002 | 3.5 |
| 208 | /at/de/gepaeck | hub | 1440 | 3.4 | 4727/4727 | 0.0 | lh-parity-004 | 3.4 |
| 209 | /de/de/gepaeck | hub | 1440 | 3.4 | 4727/4727 | 0.0 | lh-parity-004 | 3.4 |
| 210 | /de/en/articles/explore-flying/7-people-who-shaped-lufthansa-history | insights | 390 | 3.3 | 8000/8000 | 0.0 | lh-parity-002 | 3.3 |
| 211 | /de/en/articles/explore-the-world/in-my-hood-chiswick-london | insights | 1440 | 3.3 | 5212/5180 | 18.5 | lh-parity-002 | 3.3 |
| 212 | /de/en/book-and-manage/stopover/zugspitze | campaign | 390 | 3.3 | 3991/3991 | 11.1 | lh-parity-002 | 8.9 |
| 213 | /at/de/flughafeninformation | hub | 1440 | 3.1 | 3281/3281 | 0.0 | lh-parity-004 | 3.1 |
| 214 | /de/de/flughafeninformation | hub | 1440 | 3.1 | 3281/3281 | 0.0 | lh-parity-004 | 3.1 |
| 215 | /de/en/articles/explore-the-world/on-the-scene-caspar-plautz-munich | insights | 1440 | 3.1 | 5162/5146 | 19.4 | lh-parity-002 | 3.1 |
| 216 | /de/en/articles/authors/florian-tomberg | insights | 1440 | 3.0 | 3437/3437 | 36.2 | lh-parity-002 | 7.5 |
| 217 | /de/en/articles/explore-the-world/essentials-barcelona-facts | insights | 1440 | 3.0 | 5395/5387 | 9.2 | lh-parity-002 | 3.4 |
| 218 | /at/de/digital-self-services | hub | 1440 | 2.9 | 4548/4541 | 0.0 | lh-parity-004 | 2.9 |
| 219 | /de/de/digital-self-services | hub | 1440 | 2.9 | 4548/4541 | 0.0 | lh-parity-004 | 2.9 |
| 220 | /de/en/articles/tags | insights | 390 | 2.9 | 2469/2469 | 0.0 | lh-parity-002 | 2.9 |
| 221 | /gb/en/digital-self-services | hub | 1440 | 2.9 | 4471/4463 | 0.0 | lh-parity-004 | 2.9 |
| 222 | /de/en/articles/explore-the-world/be-picky-frankfurt-insider-tips | insights | 1440 | 2.8 | 3841/3833 | 10.5 | lh-parity-002 | 2.8 |
| 223 | /de/en/services-on-board | hub | 1440 | 2.8 | 2789/2781 | 0.0 | lh-parity-002 | 2.8 |
| 224 | /gb/en/services-on-board | hub | 1440 | 2.8 | 2789/2781 | 0.0 | lh-parity-004 | 2.8 |
| 225 | /at/de/bedeutsamste-strecken | campaign | 1440 | 2.7 | 2475/2466 | 0.0 | lh-parity-004 | 2.7 |
| 226 | /at/de/meetings-and-events | hub | 1440 | 2.7 | 3615/3609 | 0.0 | lh-parity-004 | 4.1 |
| 227 | /at/de/overview-flights | hub | 1440 | 2.7 | 2730/2730 | 0.0 | lh-parity-004 | 2.7 |
| 228 | /at/de/services-an-bord | hub | 1440 | 2.7 | 2856/2847 | 0.0 | lh-parity-004 | 2.7 |
| 229 | /de/de/bedeutsamste-strecken | campaign | 1440 | 2.7 | 2475/2466 | 0.0 | lh-parity-004 | 2.7 |
| 230 | /de/de/meetings-and-events | hub | 1440 | 2.7 | 3615/3609 | 0.0 | lh-parity-004 | 4.1 |
| 231 | /de/de/overview-flights | hub | 1440 | 2.7 | 2730/2730 | 0.0 | lh-parity-004 | 2.7 |
| 232 | /de/de/services-an-bord | hub | 1440 | 2.7 | 2856/2847 | 0.0 | lh-parity-004 | 2.7 |
| 233 | /de/en/articles/explore-flying/essentials-future-of-flying | insights | 1440 | 2.7 | 5733/5733 | 7.5 | lh-parity-002 | 2.7 |
| 234 | /de/en/book-and-manage/stopover/neuschwanstein | campaign | 390 | 2.7 | 3727/3727 | 11.9 | lh-parity-002 | 2.7 |
| 235 | /de/en/overview-flights | hub | 1440 | 2.7 | 2703/2703 | 0.0 | lh-parity-002 | 2.7 |
| 236 | /gb/en/overview-flights | hub | 1440 | 2.7 | 2703/2703 | 0.0 | lh-parity-004 | 2.7 |
| 237 | /at/de/betreuungsbedarf | hub | 1440 | 2.6 | 5387/5383 | 0.0 | lh-parity-004 | 3.6 |
| 238 | /de/de/betreuungsbedarf | hub | 1440 | 2.6 | 5387/5383 | 0.0 | lh-parity-004 | 3.6 |
| 239 | /de/en/meetings-and-events | hub | 1440 | 2.6 | 3534/3528 | 0.0 | lh-parity-002 | 3.9 |
| 240 | /de/en/most-significant-route | campaign | 1440 | 2.6 | 2583/2574 | 0.0 | lh-parity-002 | 2.6 |
| 241 | /de/en/overview-travel-information | hub | 390 | 2.6 | 3950/3950 | 0.0 | lh-parity-003 | 2.6 |
| 242 | /gb/en/meetings-and-events | hub | 1440 | 2.6 | 3534/3528 | 0.0 | lh-parity-004 | 3.9 |
| 243 | /gb/en/most-significant-route | campaign | 1440 | 2.6 | 2583/2574 | 0.0 | lh-parity-004 | 2.6 |
| 244 | /de/en/overview-special-request | hub | 1440 | 2.5 | 2754/2746 | 0.0 | lh-parity-002 | 2.5 |
| 245 | /gb/en/overview-special-request | hub | 1440 | 2.5 | 2754/2746 | 0.0 | lh-parity-004 | 2.5 |
| 246 | /at/de/overview-special-request | hub | 1440 | 2.4 | 2781/2773 | 0.0 | lh-parity-004 | 2.4 |
| 247 | /at/de/speisen-und-getraenke | hub | 1440 | 2.4 | 5112/5112 | 0.0 | lh-parity-004 | 2.4 |
| 248 | /de/de/overview-special-request | hub | 1440 | 2.4 | 2781/2773 | 0.0 | lh-parity-004 | 2.4 |
| 249 | /de/de/speisen-und-getraenke | hub | 1440 | 2.4 | 5112/5112 | 0.0 | lh-parity-004 | 2.4 |
| 250 | /de/en/articles/explore-the-world/a-perfect-day-barcelona-in-one-day | insights | 1440 | 2.4 | 7608/7608 | 13.2 | lh-parity-002 | 2.4 |
| 251 | /de/en/culinaryjourney | campaign | 1440 | 2.4 | 1586/1586 | 0.0 | lh-parity-002 | 2.4 |
| 252 | /de/en/miles-and-more | hub | 1440 | 2.4 | 3406/3406 | 0.0 | lh-parity-002 | 2.4 |
| 253 | /at/de/miles-and-more | hub | 1440 | 2.3 | 3487/3487 | 0.0 | lh-parity-004 | 2.3 |
| 254 | /de/de/miles-and-more | hub | 1440 | 2.3 | 3487/3487 | 0.0 | lh-parity-004 | 2.3 |
| 255 | /gb/en/miles-and-more | hub | 1440 | 2.3 | 3406/3406 | 0.0 | lh-parity-004 | 2.3 |
| 256 | /de/en/100-years/history/menu-on-board | campaign | 1440 | 2.2 | 8000/8000 | 10.1 | lh-parity-002 | 2.2 |
| 257 | /de/en/food-and-beverages | hub | 1440 | 2.2 | 5085/5085 | 0.0 | lh-parity-002 | 2.2 |
| 258 | /gb/en/food-and-beverages | hub | 1440 | 2.2 | 5085/5085 | 0.0 | lh-parity-004 | 2.2 |
| 259 | /de/en/articles/explore-flying/inflight-entertainment-vr-experience | insights | 1440 | 2.1 | 7854/7854 | 5.5 | lh-parity-002 | 2.1 |
| 260 | /de/en/articles/explore-the-world/a-perfect-day-berlin-in-one-day | insights | 1440 | 2.0 | 8000/8000 | 12.5 | lh-parity-002 | 2.0 |
| 261 | /de/en/overview-travel-information | hub | 1440 | 1.9 | 2840/2840 | 0.0 | lh-parity-003 | 1.9 |
| 262 | /de/en/discover-lufthansa/take-off | campaign | 1440 | 1.8 | 4514/4514 | 0.0 | lh-parity-015 | 3.9 (lh-parity-014, first screen masked) |
| 263 | /de/en/baggage | hub | 1440 | 1.7 | 4630/4627 | 0.0 | lh-parity-002 | 1.7 |
| 264 | /gb/en/baggage | hub | 1440 | 1.7 | 4630/4627 | 0.0 | lh-parity-004 | 1.7 |
| 265 | /at/de/services-am-flughafen | hub | 1440 | 1.5 | 2849/2849 | 0.0 | lh-parity-004 | 1.5 |
| 266 | /de/de/services-am-flughafen | hub | 1440 | 1.5 | 2849/2849 | 0.0 | lh-parity-004 | 1.5 |
| 267 | /de/en/services-at-the-airport | hub | 1440 | 1.4 | 2822/2822 | 0.0 | lh-parity-002 | 1.4 |
| 268 | /gb/en/services-at-the-airport | hub | 1440 | 1.4 | 2822/2822 | 0.0 | lh-parity-004 | 1.4 |
| 269 | /de/en/articles/explore-flying/7-people-who-shaped-lufthansa-history | insights | 1440 | 1.3 | 8000/8000 | 0.0 | lh-parity-002 | 1.3 |
| 270 | /de/en/articles/highlights | insights | 1440 | 1.3 | 6838/6838 | 55.6 | lh-parity-002 | 1.3 |
| 271 | /de/en/articles/tags | insights | 1440 | 1.2 | 1986/1986 | 0.0 | lh-parity-002 | 1.2 |
| 272 | /de/en/100-years/history | campaign | 1440 | 1.0 | 8000/8000 | 10.1 | lh-parity-002 | 1.0 |
| 273 | /de/en/articles/explore-flying/inflight-entertainment-vr-experience | insights | 390 | 0.9 | 8000/8000 | 0.0 | lh-parity-002 | 1.0 |
| 274 | /de/en/100-years/destinations | campaign | 1440 | 0.8 | 8000/8000 | 0.0 | lh-parity-002 | 0.8 |
| 275 | /gb/en/100-years/destinations | campaign | 1440 | 0.8 | 8000/8000 | 0.0 | lh-parity-004 | 0.8 |
| 276 | /at/de/100-years/destinations | campaign | 1440 | 0.7 | 8000/8000 | 0.0 | lh-parity-004 | 0.7 |
| 277 | /de/de/100-years/destinations | campaign | 1440 | 0.7 | 8000/8000 | 0.0 | lh-parity-004 (second load) | 0.7 |
| 278 | /de/en/articles/highlights | insights | 390 | 0.7 | 8000/8000 | 69.2 | lh-parity-002 | 0.7 |
| 279 | /at/de/fluege | hub | 390 | 0.1 | 8000/8000 | 85.7 | lh-parity-004 | 0.1 |
| 280 | /de/de/fluege | hub | 390 | 0.1 | 8000/8000 | 85.7 | lh-parity-004 | 0.1 |
| 281 | /de/en/flights | hub | 390 | 0.1 | 8000/8000 | 85.4 | lh-parity-004 | 0.1 |
| 282 | /gb/en/flights | hub | 390 | 0.1 | 8000/8000 | 85.4 | lh-parity-004 | 0.1 |
| 283 | /at/de/fluege | hub | 1440 | 0.0 | 8000/8000 | 84.2 | lh-parity-004 | 0.0 |
| 284 | /de/de/fluege | hub | 1440 | 0.0 | 8000/8000 | 84.2 | lh-parity-004 | 0.0 |
| 285 | /de/en/flights | hub | 1440 | 0.0 | 8000/8000 | 83.7 | lh-parity-004 | 0.0 |
| 286 | /gb/en/flights | hub | 1440 | 0.0 | 8000/8000 | 83.7 | lh-parity-004 | 0.0 |
