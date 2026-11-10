# Rows for ema-lufthansa (from ema-cashub's sweeps; Discover's importer and theme files are yours)

Measured on discover.turnsthe.page against the R2 drop's discover-parity-001 (26 pages, 1440 and 390; every www request
refused and counted), ours against www, page height. Causes in shared code ema-cashub fixes itself; the rows below are in
Discover's own files or need your decision. Updated as the sweep goes on; the full ranking:
tools/reports/parity-2026-11-09/ranking-570-austrian-brussels-discover.md.

| # | page | 1440 | 390 | cause, where it is |
|---|---|---|---|---|
| D1 | /de/de/book/special-requests/families (and /de/en) | -9.1 % (-8.1 %) | -5.6 % (-5.2 %) | (a) content drift: www's "Auf einen Blick" list text is longer now (the Babys item a full paragraph): a re-import from the recording would bring it. (b) In the accordions ("Gepäckbestimmungen für Kinder") www spaces list items about 34 px apart and paragraphs further, and indents the panel's content (x 57 against the title's 50 at half scale); ours 24 px, not indented: Discover theme. |
| D2 | /de/en/my-bookings/manage/customer-service (and /de/de) | -7.6 % (-6.5 %) | -3.5 % (-3.0 %) | -135 px before "Refunds" at 1440 (-89 at 390), the contact options above it; not traced further. |
| D3 | /de/en/travel-inspiration/inspiration/destinations/punta-cana (and /de/de) | -0.5 % (-1.4 %) | +5.9 % (+5.1 %) | 390 only; not traced. |
| D4 | /de/de/discover/services-on-board/entertainment (and /de/en) | -1.6 % (-3.5 %) | +5.9 % (+2.6 %) | not traced. |
| D5 | /de/de/book/flights/flight-search (and /de/en) | -5.0 % (-4.8 %) | +3.0 % (-3.1 %) | not traced. |
| D6 | /de/en/homepage (and /de/de) | -4.7 % (-4.1 %) | -1.0 % (+1.4 %) | -184 px before "Looking for more than just a flight" at 1440, the "Greatness is a Group effort" band and the three cards above it; not traced further. |
| D7 | /de/de/book/baggage (and /de/en) | -4.6 % (-4.6 %) | +3.4 % (+3.0 %) | not traced. |
| D8 | /de/de/my-bookings/check-in (and /de/en) | +0.4 % (+1.2 %) | +4.2 % (+3.1 %) | 390; not traced. |
| D9 | /de/de/my-bookings/services/additional-services | -3.9 % | -0.8 % | not traced. |

Tab controls: all 7 Discover pages with a tab control in the recordings have tab sections (the audit of 570).

## D2 to D9 measured (the brief after 588, item 4)

Again on discover.turnsthe.page against discover-parity-001 (1440 and 390), today after your a46f654d, d76a3d39, f3e44340
and 7a0e7014: every heading of ours paired by text with www's, the running difference (ours minus www, px) where it
changes. The sections between two headings are where each row's height goes. Every www request refused (none made).

| # | page | 1440 now | 390 now | where it builds up |
|---|---|---|---|---|
| D2 | /de/en/my-bookings/manage/customer-service | -5.9 % (was -7.6) | -2.8 % (was -3.5) | The two contact rows (columns-media) -24 at 1440 (-10 to -42 at 390). Then "Refunds" -89 (-67 more in the WhatsApp / baggage side-picture row and the gap to the h2), "Rebooking a flight" -120: www's Refunds has two h3, "Travel agency tickets" and "Tickets on lufthansa.com", which are not headings in ours; "FAQs" -153 (-33 more), www's FAQ questions are h3 too. |
| D3 | /de/en/.../destinations/punta-cana | -0.3 % | +6.3 % | The h1 under its eyebrow h2 +36 / +55 (the eyebrow-to-h1 gap: ours 67 / 73, www 44 / 30). The five picture-and-text rows (columns-media, h4 titles): -112 px at 1440, +182 at 390 (about +36 a row on phones). "Getting there", "Entry regulations", "E-tickets" are headings on www, not in ours. |
| D4 | /de/de/discover/services-on-board/entertainment | -1.4 % | +6.3 % | 390: each columns-media row about +50 (the second card row +51, Onboard Cloud +51, Discover FlyNet +50): the picture or the gap above the text on phones. 1440: the two text sections (Kopfhörer, Steckdosen) +66 / +9, then the three blocks -31, -45 and -44 (Onboard Cloud, FlyNet, Fußballfieber). |
| D5 | /de/de/book/flights/flight-search | -4.7 % | +3.0 % | 1440: the footer 60 px higher, the h2 already -26: the widget area (the fare calendar) 34 px shorter. 390: our footer starts 51 px higher but is 109 px taller than www's. |
| D6 | /de/en/homepage | -4.0 % | -1.0 % | Between "Explore more topics" (-30) and "Looking for more than just a flight?" (-192): -162 px at 1440 in the teaser cards and the destination finder; www's finder ("Flight offers from", origin not chosen) shows its result cards (the 2794 headings), ours its Frankfurt state. 390 -70 there. |
| D7 | /de/de/book/baggage | -4.1 % | +3.4 % | Between the h1 and "Zusätzliches Gepäck": -125 at 1440, +117 at 390 (the intro's link cards); after it constant. www's teaser grid has five more headings at 2425-2680 (Gepäckbeleg, Handgepäck, Gefährliche Gegenstände, Elektronische Geräte ...): the grid's content differs. |
| D8 | /de/de/my-bookings/check-in | +0.6 % | +4.2 % | 390: the second check-in card +40 under the first (+48 in that row), the footer +77. 1440 within 22 px. |
| D9 | /de/de/my-bookings/services/additional-services | -3.9 % | -0.3 % | 1440 only: everything from the first card row on is 118 px higher (h1 -6): the space between the h1 and the card grid. The grid itself matches (rows 498 px apart on both). 390: -20 there, then within 20. |
