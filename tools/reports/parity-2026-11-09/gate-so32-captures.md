# Gate, standing order 32: the capture archives on the drop (ema-lufthansa, 2026-11-16)

The first archives from order 31's capture lines, on the drop by 10:55 UTC: ita-parity-011, brussels-parity-012, brussels-parity-013 and b2b-parity-014. Each sha256 is equal to its sidecar. Named in standing order 33, each sha256 equal to the order's: ita-parity-011 840ed65a6e5434c2f6cddbc25dfd3b5cec2d3ca73ebfce7bbfb625d81cb8fba1, brussels-parity-013 901c77e490f75638450a1cfdd0da3959733bbf1b36a306efd8e172bfc703f8b1, b2b-parity-014 53206b38699bd9c3489d29f9ca02df7eb46b79eaded257ba85022f130179e89f. brussels-parity-012 (sha256 d9ec3340a2cfb36750d9ca20ab08f30d58b2b4197fe307a830ccd9a66027080e, as its sidecar) is not from order 31's lines: it was recorded on 2026-11-15 at about 17:55 UTC and already held 13 of them, which is why those lines were not recorded again. The order notes three pictures still incomplete after the scroll on business-class-medium-haul 390. Our live page matches that recording within 20 px at every heading (H1 -2, "Airbus A321neo" -20, the footer -32), so they moved no layout. 43 page-widths, every one its own first load (manifest: loadedSeparately; 390 x 844, or 1440 x 900 for ITA it/it help-and-contact). Ours: capture.js on the brand host, airline hosts refused per request; ITA's phone figures with the Liberation face, as finish-ita measures them. "Old" is the gap against the resized recording the archive replaces (orders 27 and 29).

Result:
- The first loads match the resizes to within a few px on 39 of the 43. Their causes stand as located.
- **One new cause of ours:** ITA business-class-medium-haul 390 (+34.89 %). www's first load opens none of its travel-class tab panels on phones. Its row is READY, with this order's inert block option.
- **One ITA row moves inside 2 % against its first load:** checked-baggage 390 (www 5000 against the resize's 5234; ours with the route tabs live +1.94 %, against the resize -3.10 %).
- **ITA it/it help-and-contact, recorded at last:** 1440 -1.64 %, 390 +0.50 % with the help pictures live, so order 30's picture row holds on it/it too.

| page | width | archive | www px | ours px | now | against the old resize | cause / fix |
|---|---|---|---|---|---|---|---|
| ita /it/en/world-of-ita-airways/travel-classes/business-class-medium-haul | 390 | ita-parity-011 | 4919 | 6635 | +34.89 % | ita-parity-005 www 6741 (-1.57 %)  face | **ours: row READY** (delta-so32-ita-business-class-phone-tabs-closed.txt): www's first load opens no tab panel on phones, ours the first; with the row 4886 (-0.67 %) |
| brussels /be/fr/book-a-flight/our-payment-methods | 390 | brussels-parity-012 | 5393 | 4477 | -16.98 % | brussels-parity-004 www 5390 (-16.94 %) | owner decision: the payment-picker iframe behind the brussels-payment-picker flag (off) |
| brussels /be/en/check-in-options-and-info/check-in-times | 390 | brussels-parity-012 | 4354 | 4108 | -5.65 % | brussels-parity-004 www 4348 (-5.52 %) | live data: the checkin-deadlines block's no-answer state |
| b2b /xx/en/program/experts/on-board/meals-on-board | 390 | b2b-parity-014 | 1405 | 1329 | -5.41 % | b2b-parity-005 www 1405 (-5.41 %) | www's empty ninth tab item and 22 px above the tab set (order 25); no rule passes |
| brussels /be/en/local-page/offers | 390 | brussels-parity-012 | 6236 | 5922 | -5.04 % | brussels-parity-004 www 6229 (-4.93 %) | live data: the finder and flight search |
| brussels /am/en/non-encrypt-mail/contact-form-error | 390 | brussels-parity-012 | 1250 | 1290 | +3.20 % | brussels-parity-004 www 1244 (+3.70 %) | Columns Media's phone padding: rows-for-ema-test.md row 13 |
| brussels /be/en/local-page/chase-the-sun-across-spain | 390 | brussels-parity-012 | 8991 | 9243 | +2.80 % | brussels-parity-004 www 8997 (+2.73 %) | the eclipse city list (+215 px) and the closing flight-search band's subheading on three lines (+103): one page; the flight-search widget's fields are live data |
| brussels /be/en/jobs/core-values | 390 | brussels-parity-012 | 4527 | 4650 | +2.72 % | brussels-parity-004 www 4532 (+2.60 %) | about 20 px more at each of five sections: the sections' phone spacing, within 2 % on every other Brussels page, so not one rule |
| brussels /it/it/extra-services/meals | 390 | brussels-parity-012 | 3416 | 3337 | -2.31 % | brussels-parity-006 www 3416 (-2.31 %) | the phone teaser ending (www 187 to 248 px, ours 178): the rule fails the gate (order 22) |
| brussels /it/it/legal-notices/special-assistance-legal-guidelines | 390 | brussels-parity-012 | 2256 | 2204 | -2.30 % | brussels-parity-007 www 2256 (-2.30 %) | the sidebar-h1 accordion ending: no scope separates it from five legal pages that end as www's (order 22) |
| brussels /be/nl/special-care/pets | 390 | brussels-parity-012 | 3099 | 3030 | -2.23 % | brussels-parity-006 www 3099 (-2.23 %) | the phone teaser ending, as it/it meals |
| brussels /be/fr/my-bookings/cancel-and-refund-requests | 390 | brussels-parity-012 | 2408 | 2359 | -2.03 % | brussels-parity-006 www 2408 (-2.03 %) | the accordions' text column (P56 and the button wrap live) |
| b2b /xx/en/program/experts/special-assistance-and-services | 390 | b2b-parity-014 | 1458 | 1487 | +1.99 % | b2b-parity-005 www 1458 (+1.99 %) | within 2 % |
| b2b /de/en/program/experts/special-assistance-and-services | 390 | b2b-parity-014 | 1458 | 1487 | +1.99 % | b2b-parity-005 www 1458 (+1.99 %) | within 2 % |
| b2b /de/en/news/celebrating-shared-stories/sap | 390 | b2b-parity-014 | 8819 | 8992 | +1.96 % | b2b-parity-007 www 8819 (+1.96 %) | within 2 % |
| brussels /ao/fr/legal-notices/aviation-services-law | 390 | brussels-parity-013 | 4771 | 4678 | -1.95 % | brussels-parity-007 www 4771 (-1.95 %) | within 2 % |
| ita /it/en/book-and-prepare/travel-information/baggage/checked-baggage | 390 | ita-parity-011 | 5000 | 5097 | +1.94 % | ita-parity-005 www 5234 (-3.10 %)  face | within 2 % |
| brussels /de/de/extra-services/lounges | 390 | brussels-parity-013 | 2401 | 2447 | +1.92 % | brussels-parity-006 www 2401 (+1.92 %) | within 2 % |
| b2b /de/en/news/lhg-ita-airways | 390 | b2b-parity-014 | 6073 | 6188 | +1.89 % | b2b-parity-003 www 6073 (+1.89 %) | within 2 % |
| brussels /be/nl/contact/service-charges | 390 | brussels-parity-013 | 2177 | 2137 | -1.84 % | brussels-parity-006 www 2177 (-1.84 %) | within 2 % |
| brussels /be/en/contact/service-charges | 390 | brussels-parity-013 | 2177 | 2137 | -1.84 % | brussels-parity-004 www 2172 (-1.61 %) | within 2 % |
| b2b /xx/de/travel-management/hygiene-and-safety | 390 | b2b-parity-014 | 3170 | 3115 | -1.74 % | b2b-parity-006 www 3170 (-1.74 %) | within 2 % |
| b2b /de/de/travel-management/hygiene-and-safety | 390 | b2b-parity-014 | 3170 | 3115 | -1.74 % | b2b-parity-006 www 3170 (-1.74 %) | within 2 % |
| brussels /be/en/legal-notices/israel-cancellation-policy | 390 | brussels-parity-013 | 2576 | 2532 | -1.71 % | brussels-parity-007 www 2576 (-1.71 %) | within 2 % |
| brussels /be/en/legal-notices/short-notice-eu-us | 390 | brussels-parity-013 | 3064 | 3012 | -1.70 % | brussels-parity-007 www 3064 (-1.70 %) | within 2 % |
| brussels /de/de/legal-notices/dsar-start | 390 | brussels-parity-013 | 4798 | 4717 | -1.69 % | brussels-parity-006 www 4798 (-1.69 %) | within 2 % |
| ita /it/it/help-and-contact | 1440 | ita-parity-011 | 2375 | 2336 | -1.64 % | no recording  face | within 2 % |
| brussels /il/en/rebooking-request-birthright | 390 | brussels-parity-012 | 2855 | 2899 | +1.54 % | brussels-parity-004 www 2848 (+1.79 %) | within 2 % |
| brussels /be/en/travel-comfortably-from-lille | 390 | brussels-parity-013 | 5184 | 5263 | +1.52 % | brussels-parity-004 www 5179 (+1.62 %) | within 2 % |
| b2b /de/de/travel-solutions/our-european-fares | 390 | b2b-parity-014 | 13164 | 13355 | +1.45 % | b2b-parity-007 www 13164 (+1.45 %) | within 2 % |
| brussels /be/en/legal-notices/us-traveling-with-disabilities | 390 | brussels-parity-013 | 1874 | 1847 | -1.44 % | brussels-parity-007 www 1874 (-1.44 %) | within 2 % |
| brussels /be/en/contact/feedback/general/other | 390 | brussels-parity-012 | 7406 | 7509 | +1.39 % | brussels-parity-004 www 7400 (+1.47 %) | within 2 % |
| b2b /xx/en/travel-solutions/swiss-senses/corporates-start-of-booking | 390 | b2b-parity-014 | 6458 | 6544 | +1.33 % | b2b-parity-005 www 6458 (+1.33 %) | within 2 % |
| b2b /xx/de/travel-solutions/swiss-senses/intermediaries-start-of-booking | 390 | b2b-parity-014 | 7117 | 7209 | +1.29 % | b2b-parity-005 www 7117 (+1.29 %) | within 2 % |
| brussels /be/en/extra-services/meals/bon | 390 | brussels-parity-013 | 6886 | 6798 | -1.28 % | brussels-parity-004 www 6894 (-1.39 %) | within 2 % |
| b2b /xx/en/travel-solutions/swiss-senses/intermediaries-start-of-booking | 390 | b2b-parity-014 | 6779 | 6865 | +1.27 % | b2b-parity-005 www 6779 (+1.27 %) | within 2 % |
| brussels /be/en/legal-notices/us-customer-service-plan | 390 | brussels-parity-013 | 2768 | 2734 | -1.23 % | brussels-parity-007 www 2768 (-1.23 %) | within 2 % |
| brussels /be/en/jobs/mpl-cadet-program | 390 | brussels-parity-013 | 9951 | 10072 | +1.22 % | brussels-parity-004 www 9947 (+1.26 %) | within 2 % |
| brussels /be/en/my-bookings/emergency-contact | 390 | brussels-parity-012 | 3204 | 3242 | +1.19 % | brussels-parity-004 www 3197 (+1.41 %) | within 2 % |
| brussels /be/fr/special-care/families-and-children | 390 | brussels-parity-012 | 3809 | 3788 | -0.55 % | brussels-parity-001 www 3804 (-3.13 %) | within 2 % |
| brussels /be/en/farealert/unsubscribe-failure | 390 | brussels-parity-012 | 1364 | 1357 | -0.51 % | brussels-parity-004 www 1358 (-0.07 %) | within 2 % |
| ita /it/it/help-and-contact | 390 | ita-parity-011 | 3193 | 3209 | +0.50 % | no recording  face | within 2 % |
| brussels /be/en/legal-notices | 390 | brussels-parity-012 | 1867 | 1867 | +0.00 % | brussels-parity-007 www 1867 (+0.00 %) | within 2 % |
