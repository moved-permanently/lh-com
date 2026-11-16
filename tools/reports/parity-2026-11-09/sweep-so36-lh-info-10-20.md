# lufthansa.com info page-widths between 10 and 20 % (standing order 36, item 3, 2026-11-16)

Measured as served on lufthansa.turnsthe.page (2026-11-16 ~00:37-00:44 UTC, after round 462): full Chrome, the drops' fonts,
live boxes masked, against lh-parity-002 (2026-11-06), the 66 page-widths of order 35's figures at 10 % or more.
The car-rental pages are measured again with the partner widget let through (order 32's scratch tools copy):
without it lh-rentalcar 390 reads 45.2, hertz 38.0 and sixt 32.0 (the widget refused, a third of the page missing).

Fixes are rows in delta-so36-lh-com-rows.txt (READY: both widths gated on html-folder renders of the published copy,
base and trial in the same round; folder bases can read a little off the host's, as carry-on-baggage's 18.58 / 16.09).

## Already located before tonight (not counted in the ten)

| Page-width | % | Where |
| --- | --- | --- |
| /de/en/first-class 390 | 18.3 | order 35: drift 10-39 px, two OpenStreetMap widgets refused |
| /de/en/first-class-terminal 390 | 18.2 | order 35: stage video frames (masked), drift |
| both LoungeNet first class lounges 390 | 17.6 | order 35: teasers within 3-5 px, high-contrast pictures |
| /de/en/lufthansa-business-class-on-long-haul-routes 390 | 16.1 | order 35: the YouTube embed refused in captures |
| /de/en/book-and-manage/flights/giftvoucher 390 | 14.3 | order 33: height within 8 px, no action |

## The worst ten

| # | Page-width | % | Cause (located) | Fix |
| --- | --- | --- | --- | --- |
| 1 | /de/en/with-children-at-the-airport 390 | 17.7 | The recording is older than www's page: lh-parity-002 still has the paragraph on the hubs' touchpoints and its "Munich Airport" / "Frankfurt Airport" links, which www dropped after 11-06 (the newer lh-snapshots-115 lacks them, as ours does); the offset jumps by 190-320 px exactly there. | None: ours is www's current page. Against lh-snapshots-115 order 32 read 8.7 % (its 390 is a resize from 1440). |
| 2 | /de/en/unterhaltung-an-bord 1440 | 16.5 | The stage picture 50 px lower (a {spacer-25} under the H1, then the section gap); in the first tab www sets "Audiobooks and music" and "The online guide..." as a row of two teasers about 100 px under the first, ours runs them on as text. | READY row: 16.52 -> 11.20 % (390 15.40 -> 13.79). |
| 3 | /de/en/lh-rentalcar 390 | 16.3 | Half the page (50.6 %) is the partner widget (direct-ux.meili.travel), a live third-party form, masked. Ours ends 38 px higher at the widget's end, growing to 130 px by the footer. | None found tonight: the widget is the partner's and differs by session. The drift below it (teaser cards, about 24-30 px each for Hertz and SIXT) is not located further. hertz 390 11.7 and sixt 11.0 have the same widget. |
| 4 | /de/en/carry-on-baggage 1440 | 16.1 | Desktop gaps: www's class columns stand 32 px further under "Short- and medium-haul" and "Long-haul", and its H2s 30-40 px further from the block above ("Non-compliant...", "Stowing...", "FAQs..."). | READY row (five desktop spacers): 18.58 -> 10.57 % on the folder base, 390 unchanged. Left: www lines up the class columns' items across the columns (one grid row each), ours lets each column run on; not fixed. |
| 5 | /de/en/lufthansa-aviation-group 1440 | 15.7 | Between the company card rows ours leaves 66 px from a row's last link to the next pictures, www about 90 (21 px a row). Ending the block between rows took the page further (27.6 %). | Option wide-rows (Columns Media, from 768 px, this commit) and its READY row: 15.74 -> 5.37 %, 390 unchanged. |
| 6 | /de/en/travelling-healthy 390 | 15.5 | Its two partner tile rows are two Cards Icon Text blocks, so the digital-self-services spacing applies (56 px between the rows, 60 under the last); www's tiles run on, and the gap under "Medical Equipment" is 24 px shorter. www's own tile texts are clipped at the right edge in its recording (not copied). | READY row (one block, gap-after-small on that section): 15.48 -> 11.52 %, 1440 6.85 -> 6.80. |
| 7 | /de/en/unterhaltung-an-bord 390 | 15.4 | The same as 2: the stage picture 48 px lower; www's 100 px before the teaser row. | The same row: 15.40 -> 13.79 %. |
| 8 | /de/en/lounge-companions 390 | 14.3 | Its price tables: www keeps 200 px columns and lets the table scroll sideways ("Lufthansa Welco..." cut at the edge), ours squeezed two and three columns into 358 px (up to five lines a cell). The existing rule (brief 582) does this only from four columns. | Option wide-columns (Table Striped, below 768 px, this commit) on its three tables, READY row: 14.26 -> 7.08 %, 1440 unchanged. Not made general: two- and three-column tables elsewhere were not gated. |
| 9 | /de/en/during-your-trip/internet-overview 390 | 14.2 | The stage (Hero Campaign regular) on phones: ours sets the text at 22 px on 24 px lines (www's smaller, on about 27 px lines) and the title about 20 px higher; the stage is about 15 px taller. Windows at y 400-500 read 20-24 %, the rest of the page within 2-3 %. | Not shipped: the change is the phone style of every lufthansa.com Hero Campaign regular stage, which needs its census and gate. Proposed: text 18 px light on 27 px, the title 20 px lower. |
| 10 | /de/en/with-children-at-the-airport 1440 | 14.2 | As 1: the recording predates www's change. | None: against lh-snapshots-115's 1440 recording 4.99 %. |

Next in line: /de/en/lufthansa-aviation-group 390 (14.1: per card 2-8 px, the external-link icons drawn differently, the
showcase badge over a picture), /de/en/advance-seat-reservation 1440 (14.0), entry-exit-system 390 (13.7).
