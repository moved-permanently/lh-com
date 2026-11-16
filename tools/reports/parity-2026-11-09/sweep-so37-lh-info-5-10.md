# lufthansa.com info page-widths between 5 and 10 % (standing order 37, item 3, 2026-11-16)

**Measurement.** Taken as served on lufthansa.turnsthe.page, 2026-11-16 ~04:00-04:15 UTC.
- Setup: full Chrome, the drops' fonts, live boxes masked, against each page's newest recording (lh-parity-002 for these).
- Re-measured: the 220 page-widths that order 32's sweep had read between 4 and 12 %.
- Taken from earlier measurements: the pages order 36 changed, measured live this morning (aviation-group 1440 5.37, travelling-healthy 1440 6.80, carry-on-baggage 7.31 / 6.48, lounge-companions 390 7.08, internet-overview 1440 5.16).
- Result: 155 of the 220 now read between 5 and 10 %, 21 read 10-12.3 % (the 10-20 list's ground) and 44 under 5.

**Fixes.** Each fix is a row in delta-so37-lh-com-rows.txt. Base and trial were served from an html folder as full pages, in standards mode, so the base reads the host's own figure.

**Every phone capture of ours.** Our "DEMO / Not a Lufthansa website" badge sits at about y 800 in each 390 capture. It is not masked and costs 0.1-0.3 points a phone page. It is a showcase label, not a layout difference, and is left as it is.

## The worst ten

| # | Page-width | % | Cause (located) | Fix |
| --- | --- | --- | --- | --- |
| 1 | /de/en/schengen 390 | 9.92 | www sets "List of current Schengen member states" about 100 px under the IATA link, ours 24 px. The page ends 98 px short at 390 and 71 at 1440. The grey EES box's text starts about 9 px lower on ours. | READY row ({spacer-80} before the line): 9.92 -> 6.88 %, 1440 8.57 -> 4.69. |
| 2 | /de/en/arrival-services 390 | 9.85 | Two of the limousine paragraphs wrap one line more on ours: in the same 358 px column and the same font, "buses." and one other last word drop to a new line where www's line just fits. That is a sub-pixel text-width difference. The grey band and everything after it stands 47 px lower; the gaps match within 16 px. | None in layout: the column width and gaps match, and the width difference is in the text rendering (under 1 % of a line). |
| 3 | /de/en/lufthansa-am-flughafen-frankfurt 390 | 9.79 | Content: our document's bag-drop texts are worded differently from the recording's. For example, "Priority/HON imprint ... priority unloading at your destination airport" here against www's "... checked in your regular baggage". The paragraphs wrap to different lengths, so the drift swings +54 / -81 / -240 / +159 px. | None from layout. The wording is the document's (DA). A content sync would be an import question, not a parity row. |
| 4 | /de/en/gefaehrliche-gegenstaende 1440 | 9.76 | Two differences. (1) The symbol legend in the grey band: www pairs the items in two columns ("In or as checked baggage" beside "NOT in or as checked baggage"), ours flows them in three columns, so the rows differ (-94 / +113 px). (2) In the open accordion, www's list runs the full content width, ours a narrower column, so the list wraps to about twice the lines (+150 to +260 px). | Not shipped: both are block layouts shared by other documents (Cards Icon Text column count in a grey column band; the accordion panel's text width). Each needs its census and gate. |
| 5 | /de/en/tiere-als-uebergepaeck 390 | 9.68 | The price table: www keeps 200 px columns and scrolls sideways, ours squeezed three columns into 346 px, with its header cells nine lines high. Also: the video and text at y 800 (and the badge), and the subpage navigation at the foot. | READY row (option wide-columns on the table): 9.68 -> 9.62 %, 1440 unchanged. The header is now 190 px shorter, while www's header is still about 60 px taller than ours (its header text wraps less). |
| 6 | /de/en/first-class 1440 | 9.63 | As order 34: its two poi-map widgets draw OpenStreetMap tiles, which are refused in captures. The stage frames differ. The drift stays within 10-34 px. | None. |
| 7 | /de/en/doctor-on-board-news 390 | 9.61 | In the grey contact box, ours draws the running-text arrow before the e-mail link ("email: -> medicaloperation@dlh.de"), and the link then wraps to its own line; www's mailto link has no arrow. The box is one line taller (+18 px), then "This may also interest you" follows. | Not shipped: no arrow on mailto links in running text is a styles.css rule for every lufthansa.com document with an e-mail link in its text. It needs its census and gate. |
| 8 | /de/en/affiliatemarketing 390 | 9.51 | Its 15 country links each wrap to two lines. Ours stand 54 px a link (27 px lines), www's about 48, so the drift grows by 6 px a link to +100 px. | Not shipped: the line height of a wrapped link paragraph on phones is shared by every link list, which needs its census. |
| 9 | /de/en/book-and-manage/digital-self-services/airline-apps 390 | 9.41 | Per app tile, the drift alternates +27 px at the app icon and -16 px after its two download links: ours stands the icon picture taller and the links closer. | Not located to a rule tonight. Cards of their own (shared by the airline-apps pages); left for a measured look. |
| 10 | /de/en/book-and-manage/flights/ana 1440 | 9.38 | The information teasers' Columns Media has four cells in its second row, so its first row (three teasers and an empty cell) is a quarter wide each. www sets those three a third wide, so ours wrap to more lines (+118 / +207 px). | READY row (the first row as its own block, without the empty cell): 9.38 -> 6.40 %, 390 8.54 -> 8.48. |

Next in line: voluntary-rebooking 390 (9.32), flying-with-small-children 390 (9.29), lufthansa-express-bus 1440 (9.25).
