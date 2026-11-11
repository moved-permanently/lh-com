# Ranking after brief 588 (ema-cashub): Austrian (all 48 roots without a recording before), Brussels (all 47 recorded pages), Discover (all 26 recorded pages)

Page height, ours on our host (austrian / brussels / discover.turnsthe.page) against the recordings, 1440 and 390, worst-first by the larger of the two;
(px) is the page difference. Probe: the page scrolled, then measured once every section is loaded and its height has not changed for 3 s
(the first Austrian run without that wait gave -55 to -81 % on 9 roots: pages measured before they finished; discarded). Every www request
refused and counted: Austrian 1,977, Brussels 192, Discover in its section. Widgets that take their data from www's APIs in the browser (the
fare teaser, the destination finder, the flight search's prices) render their empty state under that rule: on the homepages those bands are
not comparable until a capture of our own page with the APIs allowed (capture-list-584-brands.txt rows 77-80).

## Austrian, 48 roots (austrian-parity-008: 31, -009: 9 (md, me, mk, nl, no, pl, pt, ro, rs: -008 marks them not asked), -010: 7, -011: ru)

| root | 1440 | 390 | cause |
|---|---|---|---|
| /ge/en/homepage | -23.7 % (-1105) | -15.3 % (-872) | not traced |
| /ch/en/homepage | -18.8 % (-893) | -5.7 % (-330) | G2 (as above) |
| /cz/en/homepage | -18.8 % (-893) | -5.6 % (-325) | G2: as G1, and our destination finder's empty state 292 px (941 in G1: its fallback differs per origin); www's finder about 1,160 px. Widget state |
| /fr/en/homepage | -18.8 % (-893) | -5.6 % (-325) | G2: as G1, and our destination finder's empty state 292 px (941 in G1: its fallback differs per origin); www's finder about 1,160 px. Widget state |
| /it/en/homepage | -18.8 % (-893) | -5.7 % (-330) | G2 (as above) |
| /md/en/homepage | -18.8 % (-893) | -5.6 % (-325) | G2: as G1, and our destination finder's empty state 292 px (941 in G1: its fallback differs per origin); www's finder about 1,160 px. Widget state |
| /pl/en/homepage | -18.8 % (-893) | -5.6 % (-325) | G2: as G1, and our destination finder's empty state 292 px (941 in G1: its fallback differs per origin); www's finder about 1,160 px. Widget state |
| /ro/en/homepage | -18.8 % (-893) | -5.6 % (-325) | G2: as G1, and our destination finder's empty state 292 px (941 in G1: its fallback differs per origin); www's finder about 1,160 px. Widget state |
| /rs/en/homepage | -18.8 % (-893) | -5.6 % (-325) | G2: as G1, and our destination finder's empty state 292 px (941 in G1: its fallback differs per origin); www's finder about 1,160 px. Widget state |
| /au/en/homepage | -12.3 % (-541) | +3.9 % (+203) | not traced |
| /tr/en/homepage | +3.0 % (+132) | +12.3 % (+648) | G3: tr, me, xk, jp: +108 to +132 at 1440, +585 to +648 at 390: one cause, not traced |
| /me/en/homepage | +2.5 % (+108) | +11.9 % (+624) | G3: tr, me, xk, jp: +108 to +132 at 1440, +585 to +648 at 390: one cause, not traced |
| /xk/en/homepage | +2.5 % (+108) | +11.9 % (+624) | G3: tr, me, xk, jp: +108 to +132 at 1440, +585 to +648 at 390: one cause, not traced |
| /ch/de/homepage | -11.7 % (-519) | +5.4 % (+292) | not traced |
| /jp/en/homepage | +2.5 % (+108) | +11.0 % (+585) | G3: tr, me, xk, jp: +108 to +132 at 1440, +585 to +648 at 390: one cause, not traced |
| /pt/en/homepage | -9.8 % (-456) | -7.9 % (-451) | not traced |
| /xx/en/homepage | -8.5 % (-301) | -8.3 % (-407) | not traced |
| /by/ru/homepage | +3.2 % (+115) | +7.6 % (+407) | not traced |
| /ch/fr/homepage | -7.3 % (-370) | -2.5 % (-158) | not traced |
| /sk/en/homepage | -5.3 % (-264) | +0.6 % (+35) | not traced |
| /am/en/homepage | -5.1 % (-244) | +1.7 % (+96) | G1: stage to "Winter deals" -71 (www draws its quick-actions row between stage and fare teaser, ours the flight search above the stage: -28 and -43), the fare teaser band -72, the destination finder (www: no origin chosen; ours: the root origin, empty: widget state, see below), -137 under "Looking for more than just a flight?" |
| /ba/en/homepage | -5.1 % (-244) | +1.7 % (+96) | G1: stage to "Winter deals" -71 (www draws its quick-actions row between stage and fare teaser, ours the flight search above the stage: -28 and -43), the fare teaser band -72, the destination finder (www: no origin chosen; ours: the root origin, empty: widget state, see below), -137 under "Looking for more than just a flight?" |
| /be/en/homepage | -5.1 % (-244) | +1.7 % (+96) | G1: stage to "Winter deals" -71 (www draws its quick-actions row between stage and fare teaser, ours the flight search above the stage: -28 and -43), the fare teaser band -72, the destination finder (www: no origin chosen; ours: the root origin, empty: widget state, see below), -137 under "Looking for more than just a flight?" |
| /bg/en/homepage | -5.1 % (-244) | +1.7 % (+96) | G1: stage to "Winter deals" -71 (www draws its quick-actions row between stage and fare teaser, ours the flight search above the stage: -28 and -43), the fare teaser band -72, the destination finder (www: no origin chosen; ours: the root origin, empty: widget state, see below), -137 under "Looking for more than just a flight?" |
| /cy/en/homepage | -5.1 % (-244) | +1.7 % (+96) | G1: stage to "Winter deals" -71 (www draws its quick-actions row between stage and fare teaser, ours the flight search above the stage: -28 and -43), the fare teaser band -72, the destination finder (www: no origin chosen; ours: the root origin, empty: widget state, see below), -137 under "Looking for more than just a flight?" |
| /de/en/homepage | -5.1 % (-244) | +1.4 % (+79) | G1 at 1440 (the same -244); its 390 differs from G1's +91 / +96: not traced |
| /dk/en/homepage | -5.1 % (-244) | +1.7 % (+96) | G1: stage to "Winter deals" -71 (www draws its quick-actions row between stage and fare teaser, ours the flight search above the stage: -28 and -43), the fare teaser band -72, the destination finder (www: no origin chosen; ours: the root origin, empty: widget state, see below), -137 under "Looking for more than just a flight?" |
| /eg/en/homepage | -5.1 % (-244) | +2.3 % (+136) | G1 at 1440 (the same -244); its 390 differs from G1's +91 / +96: not traced |
| /es/en/homepage | -5.1 % (-244) | +1.7 % (+96) | G1: stage to "Winter deals" -71 (www draws its quick-actions row between stage and fare teaser, ours the flight search above the stage: -28 and -43), the fare teaser band -72, the destination finder (www: no origin chosen; ours: the root origin, empty: widget state, see below), -137 under "Looking for more than just a flight?" |
| /gb/en/homepage | -5.1 % (-244) | -2.3 % (-131) | G1 at 1440 (the same -244); its 390 differs from G1's +91 / +96: not traced |
| /gr/en/homepage | -5.1 % (-244) | +1.7 % (+96) | G1: stage to "Winter deals" -71 (www draws its quick-actions row between stage and fare teaser, ours the flight search above the stage: -28 and -43), the fare teaser band -72, the destination finder (www: no origin chosen; ours: the root origin, empty: widget state, see below), -137 under "Looking for more than just a flight?" |
| /hr/en/homepage | -5.1 % (-244) | +1.7 % (+96) | G1: stage to "Winter deals" -71 (www draws its quick-actions row between stage and fare teaser, ours the flight search above the stage: -28 and -43), the fare teaser band -72, the destination finder (www: no origin chosen; ours: the root origin, empty: widget state, see below), -137 under "Looking for more than just a flight?" |
| /iq/en/homepage | -5.1 % (-244) | +1.7 % (+96) | G1: stage to "Winter deals" -71 (www draws its quick-actions row between stage and fare teaser, ours the flight search above the stage: -28 and -43), the fare teaser band -72, the destination finder (www: no origin chosen; ours: the root origin, empty: widget state, see below), -137 under "Looking for more than just a flight?" |
| /ir/en/homepage | -5.1 % (-244) | +1.7 % (+96) | G1: stage to "Winter deals" -71 (www draws its quick-actions row between stage and fare teaser, ours the flight search above the stage: -28 and -43), the fare teaser band -72, the destination finder (www: no origin chosen; ours: the root origin, empty: widget state, see below), -137 under "Looking for more than just a flight?" |
| /jo/en/homepage | -5.1 % (-244) | +1.7 % (+96) | G1: stage to "Winter deals" -71 (www draws its quick-actions row between stage and fare teaser, ours the flight search above the stage: -28 and -43), the fare teaser band -72, the destination finder (www: no origin chosen; ours: the root origin, empty: widget state, see below), -137 under "Looking for more than just a flight?" |
| /lt/en/homepage | -5.1 % (-244) | +1.7 % (+96) | G1: stage to "Winter deals" -71 (www draws its quick-actions row between stage and fare teaser, ours the flight search above the stage: -28 and -43), the fare teaser band -72, the destination finder (www: no origin chosen; ours: the root origin, empty: widget state, see below), -137 under "Looking for more than just a flight?" |
| /mk/en/homepage | -5.1 % (-244) | +1.7 % (+96) | G1: stage to "Winter deals" -71 (www draws its quick-actions row between stage and fare teaser, ours the flight search above the stage: -28 and -43), the fare teaser band -72, the destination finder (www: no origin chosen; ours: the root origin, empty: widget state, see below), -137 under "Looking for more than just a flight?" |
| /nl/en/homepage | -5.1 % (-244) | +1.7 % (+96) | G1: stage to "Winter deals" -71 (www draws its quick-actions row between stage and fare teaser, ours the flight search above the stage: -28 and -43), the fare teaser band -72, the destination finder (www: no origin chosen; ours: the root origin, empty: widget state, see below), -137 under "Looking for more than just a flight?" |
| /no/en/homepage | -5.1 % (-244) | +1.7 % (+96) | G1: stage to "Winter deals" -71 (www draws its quick-actions row between stage and fare teaser, ours the flight search above the stage: -28 and -43), the fare teaser band -72, the destination finder (www: no origin chosen; ours: the root origin, empty: widget state, see below), -137 under "Looking for more than just a flight?" |
| /se/en/homepage | -5.1 % (-244) | +1.7 % (+96) | G1: stage to "Winter deals" -71 (www draws its quick-actions row between stage and fare teaser, ours the flight search above the stage: -28 and -43), the fare teaser band -72, the destination finder (www: no origin chosen; ours: the root origin, empty: widget state, see below), -137 under "Looking for more than just a flight?" |
| /si/en/homepage | -5.1 % (-244) | +1.7 % (+96) | G1: stage to "Winter deals" -71 (www draws its quick-actions row between stage and fare teaser, ours the flight search above the stage: -28 and -43), the fare teaser band -72, the destination finder (www: no origin chosen; ours: the root origin, empty: widget state, see below), -137 under "Looking for more than just a flight?" |
| /ca/fr/homepage | -4.5 % (-151) | -4.8 % (-229) | not traced |
| /ch/it/homepage | -4.1 % (-197) | +2.9 % (+173) | not traced |
| /de/de/homepage | -4.1 % (-198) | +3.5 % (+209) | not traced |
| /by/en/homepage | +0.1 % (+3) | +2.8 % (+145) | same numbers as ru/en: one cause, not traced |
| /ua/en/homepage | -2.8 % (-119) | +0.4 % (+22) | not traced |
| /ru/en/homepage | +0.1 % (+3) | +2.8 % (+145) | same numbers as by/en: one cause, not traced |
| /ca/en/homepage | -0.4 % (-13) | +2.1 % (+92) | not traced |

Groups: G1 = 21 roots at -244 / +91 to +96 px (the -244 shared at 1440 by gb/en too); G2 = 8 roots at -893 / -330. Both groups' static
part (about -143 px before "Discover Austrian" at 1440) is the quick-actions row's place and the fare teaser band; the rest is the finder's
state. No fix tonight: the quick actions' order is an importer question for every Austrian homepage (at/de and at/en are in
austrian-parity-003 and were within 3 % in the ranking of 570), and the finder and fare teaser need the capture of rows 77-80.

## Brussels, the 47 recorded pages (brussels-parity-004, -005, -006), after tonight's re-imports of reimport-570 (in-column, 81 documents) and the six tab tables

| page | 1440 | 390 | cause, status |
|---|---|---|---|
| /be/fr/extra-services/baggage/problems-with-your-baggage | -17.4 % (-455) | -28.5 % (-1080) | not traced (h1 at www's y) |
| /be/fr/my-bookings/cancel-and-refund-requests | -25.4 % (-447) | -20.4 % (-491) | the h1 -44 / -30: READY in reimport-588-brussels-sidebar-h1 (74a1657c); the rest the accordions' text column (the brief after 540) and content |
| /be/fr/book-a-flight/our-payment-methods | -24.7 % (-927) | -16.9 % (-913) | BUILT, FLAG OFF (ce584e22): www's 750 px country-picker iframe of webv4.brusselsairlines.com behind the site flag brussels-payment-picker; with the flag off the import's link stays (today's page); with it on (simulated) -24.7 -> -5.7 % at 1440 |
| /be/en/my-bookings/cancel-and-refund-requests | -22.4 % (-368) | -19.8 % (-425) | as be/fr |
| /be/en/local-page/offers | -9.0 % (-419) | -4.9 % (-307) | not traced (the finder / flight search widgets: state) |
| /be/en/contact/service-charges | -8.6 % (-144) | -4.6 % (-100) | the h1 -44 / -30: READY in reimport-588 (about +2.6 / +1.4 points) |
| /be/nl/contact/service-charges | -8.5 % (-145) | -4.8 % (-105) | as be/en |
| /be/fr/special-care/families-and-children | -6.8 % (-128) | -3.1 % (-119) | re-imported with in-column (0e8882ca..): -9.1 -> -6.8 / -3.7 -> -3.1 %; the rest www's two empty lines in the sidebar (the collapse drops spacers in block cells) |
| /il/en/rebooking-request-birthright | +6.1 % (+115) | +4.3 % (+122) | the 71 px Turnstile box in our capture (subtract: about +2.3 / +1.8 %); the last 27 / 30 px: the wide-text section's 48 px under the last text, www about 20 (one page: no rule) |
| /be/en/check-in-options-and-info/check-in-times | -3.3 % (-85) | -5.5 % (-240) | not traced |
| /be/en/articles/the-gambia | -3.7 % (-334) | - | under 3 % or not traced |
| /am/en/non-encrypt-mail/contact-form-error | +0.0 % (+0) | +3.7 % (+46) | the sidebar block's bottom padding (94 px from the last text to the footer, www 42 at 1440); not changed (one page) |
| /be/en/my-bookings/emergency-contact | +2.9 % (+72) | +3.6 % (+116) | Turnstile box (71 px): about 0 / +1.9 % without it |
| /be/fr/articles/vibrant-senegal | -3.5 % (-377) | - | under 3 % or not traced |
| /be/en/farealert/unsubscribe-failure | -3.5 % (-33) | -2.2 % (-30) | under 3 % or not traced |
| /be/en/extra-services/baggage/checked-baggage | -1.4 % (-57) | +3.0 % (+163) | tab tables re-imported (ee74f88b): from +7.5..+9.3 / +12.4..+15.3 % |
| /be/en/local-page/chase-the-sun-across-spain | +2.1 % (+110) | +2.7 % (+246) | under 3 % or not traced |
| /be/en/jobs/core-values | -0.5 % (-15) | +2.6 % (+118) | under 3 % or not traced |
| /be/nl/extra-services/baggage/checked-baggage | -2.5 % (-98) | +2.5 % (+139) | tab tables re-imported (ee74f88b): from +7.5..+9.3 / +12.4..+15.3 % |
| /de/de/extra-services/baggage/checked-baggage | -2.5 % (-98) | +2.5 % (+144) | tab tables re-imported (ee74f88b): from +7.5..+9.3 / +12.4..+15.3 % |
| /es/es/extra-services/baggage/checked-baggage | -1.2 % (-50) | +2.5 % (+139) | tab tables re-imported (ee74f88b): from +7.5..+9.3 / +12.4..+15.3 % |
| /be/en/contact/feedback/general/other | +1.4 % (+90) | +2.4 % (+180) | Turnstile box (71 px): about +0.3 / +1.3 % without it |
| /be/fr/extra-services/baggage/checked-baggage | -2.4 % (-98) | +0.9 % (+54) | tab tables re-imported (ee74f88b): from +7.5..+9.3 / +12.4..+15.3 % |
| /it/it/extra-services/baggage/checked-baggage | -2.4 % (-98) | +1.7 % (+96) | tab tables re-imported (ee74f88b): from +7.5..+9.3 / +12.4..+15.3 % |
| /be/fr/extra-services/baggage | -2.4 % (-42) | -0.0 % (-1) | in-column re-imported: h1 and text at www's y |
| /be/nl/special-care/pets | -2.4 % (-42) | -2.2 % (-69) | in-column re-imported: h1 and text at www's y |
| /it/it/extra-services/meals | +1.2 % (+20) | -2.3 % (-79) | under 3 % or not traced |
| /be/en/local-page/student-fares | +2.1 % (+106) | -0.4 % (-29) | under 3 % or not traced |
| /be/en/check-in-options-and-info/check-in-at-the-airport | -1.2 % (-30) | -2.0 % (-58) | under 3 % or not traced |

Pages within 2 % at both widths: /be/en/legal-notices/dsar-start, /de/de/extra-services/lounges, /be/en/travel-classes, /be/en/lufthansa-group/lufthansa-group/ita-airways, /be/en/book-a-flight/groups-and-charter/charter, /be/en/lufthansa-group/star-alliance, /be/en/extra-services/meals/bon, /be/en/contact, /be/en/contact/feedback, /be/en/our-company/organisation, /be/en/travel-comfortably-from-lille, /es/es/plan-your-trip, /be/fr/contact/feedback, /be/en/flying-with-us/romantic-getaways, /be/en/contact, /de/de/legal-notices/dsar-start, /be/fr/legal-notices, /be/en/jobs/mpl-cadet-program.


## Discover, the 26 recorded pages (discover-parity-001; 193 www requests refused)

Discover's importer and theme are ema-lufthansa's (standing rule): the rows are in rows-for-ema-lufthansa.md (D1 to D9).

| page | 1440 | 390 | row, cause |
|---|---|---|---|
| /de/de/book/flights/offers | -70.6 % (-5829) | -83.9 % (-12424) | widget state: the page is one destination finder, ours empty (www's offers API refused); www 8,300 / 14,800 px of offers |
| /de/en/book/flights/offers | -70.3 % (-5892) | -82.5 % (-11677) | widget state: the page is one destination finder, ours empty (www's offers API refused); www 8,300 / 14,800 px of offers |
| /de/de/book/special-requests/families | -6.6 % (-376) | -3.5 % (-287) | D1 (rows-for-ema-lufthansa.md) |
| /de/en/travel-inspiration/inspiration/destinations/punta-cana | -0.3 % (-16) | +6.3 % (+344) | D3 (rows-for-ema-lufthansa.md) |
| /de/de/discover/services-on-board/entertainment | -1.4 % (-52) | +6.3 % (+340) | D4 (rows-for-ema-lufthansa.md) |
| /de/en/book/special-requests/families | -6.1 % (-347) | -2.6 % (-211) | D1 (rows-for-ema-lufthansa.md) |
| /de/de/travel-inspiration/inspiration/destinations/punta-cana | -1.2 % (-55) | +6.0 % (+328) | D3 (rows-for-ema-lufthansa.md) |
| /de/en/my-bookings/manage/customer-service | -5.9 % (-260) | -2.8 % (-176) | D2 (rows-for-ema-lufthansa.md) |
| /de/de/my-bookings/manage/customer-service | -5.8 % (-249) | -3.0 % (-188) | D2 (rows-for-ema-lufthansa.md) |
| /de/de/book/flights/flight-search | -4.7 % (-61) | +3.0 % (+58) | D5 (rows-for-ema-lufthansa.md) |
| /de/en/book/flights/flight-search | -4.5 % (-61) | -3.1 % (-69) | D5 (rows-for-ema-lufthansa.md) |
| /de/de/my-bookings/check-in | +0.6 % (+14) | +4.2 % (+124) | D8 (rows-for-ema-lufthansa.md) |
| /de/de/book/baggage | -4.1 % (-171) | +3.4 % (+182) | D7 (rows-for-ema-lufthansa.md) |
| /de/en/homepage | -4.0 % (-172) | -1.0 % (-59) | D6 (rows-for-ema-lufthansa.md) |
| /de/de/my-bookings/services/additional-services | -3.9 % (-159) | -0.3 % (-14) | D9 (rows-for-ema-lufthansa.md) |
| /de/de/homepage | -3.8 % (-161) | +1.4 % (+75) | D6 (rows-for-ema-lufthansa.md) |
| /de/en/discover/services-on-board/entertainment | -3.2 % (-118) | +3.0 % (+164) | D4 (rows-for-ema-lufthansa.md) |
| /de/de/travel-inspiration/inspiration/destinations/santorini | +1.8 % (+137) | +3.2 % (+293) | under 3 % or not traced |
| /de/en/my-bookings/check-in | +1.3 % (+32) | +3.1 % (+98) | D8 (rows-for-ema-lufthansa.md) |
| /de/en/book/baggage | -2.9 % (-123) | +3.0 % (+162) | D7 (rows-for-ema-lufthansa.md) |
| /de/en/my-bookings/services/additional-services | -2.8 % (-102) | +0.1 % (+4) | D9 (rows-for-ema-lufthansa.md) |
| /de/en/discover/travel-classes/business-class | -2.7 % (-114) | +0.8 % (+24) | under 3 % or not traced |
| /de/en/travel-inspiration/inspiration/destinations/santorini | +1.2 % (+89) | +2.5 % (+228) | under 3 % or not traced |
| /de/de/discover/travel-classes/business-class | -2.0 % (-82) | +2.1 % (+66) | under 3 % or not traced |
| /de/de/my-bookings/check-in/check-in-at-the-airport | +0.0 % (+1) | +1.8 % (+39) | under 3 % or not traced |
| /de/en/my-bookings/check-in/check-in-at-the-airport | +0.0 % (+1) | -0.2 % (-5) | under 3 % or not traced |
