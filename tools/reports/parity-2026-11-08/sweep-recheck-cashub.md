# Brief 510: TAP, Brussels, Austrian and ITA against the recordings (ema-cashub)

Today's previews (`main--lh-<site>--moved-permanently.aem.page`) against the recorded www pages, offline, at 1440
and 390 px: the page height (scrollHeight), worst first by the larger of the two widths, across the four brands.

- **Recordings:** TAP from brief 478's www capture (2026-11-08, `migration-work/parity-478/caps/www`); Brussels, Austrian
  and ITA from brief 497's archives (`migration-work/parity-497/inventory.json`).
- **Ours:** captured on the previews with the settle method (consent, scroll steps, images, fonts). TAP's market roots
  have no preview document (/en-us and /en-us/promos, lh-edge serves them from market copies): captured from
  tap.turnsthe.page.
- **After values (→):** a local dev server with this tree (main at 42d30cf3): every Brussels page (its two rows of
  item 3) and the three TAP promos pages (item 2).
- **Hosts:** the previews, tap.turnsthe.page, localhost. No request went to www or to any brand's www host.

234 pages: TAP 41, Brussels 83, Austrian 82, ITA 28; 161 at 2 % or more (now), 67 at 5 % or more.

## Rows fixed (brand-scoped, one commit each)

| Commit | Brand | Row | Pages | 1440 before → after | 390 before → after |
| --- | --- | --- | --- | --- | --- |
| `1d4290c5` | TAP | a heading alone over a market section's card list: www's heading-to-card gap (tap.css) | 14 (promos, Miles&Go offer lists) | heading to first card 81 → 57 px (www 58); /en-pt/promos +2.2 → +1.4 % | 48 → 28 px (www 28); +1.4 → +0.9 % |
| `2904fd29` | Brussels | the h1 on phones: 10 px above the breadcrumb, 40 above a sidebar intro (brussels.css) | 73 recorded | unchanged (phones only) | sidebar pages: h1 offset median -30 → 0 px, within 10 px 2 → 27 of 30; default content -16 → -9 px |
| `42d30cf3` | Brussels | overview pages: the space below the last card grid (brussels.css) | 202 documents, 25 recorded | gap error 64 → 23 px; page height mean \|diff\| 6.6 → 3.4 % | gap error 125 → 45 px; 5.5 → 2.2 % |

All Brussels pages, mean |page height difference|: 1440 6.21 → 5.21 %, 390 6.15 → 4.49 % (82 pages with both widths).

The brief asked for the ten worst rows whose cause sits in the brand's own CSS or importer. Going down the ranking,
these three were the only causes in TAP's, Brussels' or Austrian's own CSS that serve more than one page. The other
rows above 5 % are live data, third-party widgets, recording state (open accordions, loading placeholders, an unscrolled
pin), document content, importer carriers (phone sliders, boxed teasers, a picture beside its text) or other agents'
blocks. Their causes and owners are listed in the table below.

## The ranking

Height: www / ours (difference) → after. Owner: who would change it; "none" for recording or data artefacts.

| Rank | Brand | Path | 1440 | 390 | Cause | Owner |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Brussels | /be/en/book-a-flight/our-destinations | 32059 / 2204 (-93.1 %) | 33015 / 1969 (-94.0 %) | live data: www's destination list (186 to 312 pictures), ours the static page (the local server's 390 value, 16,590 px, renders more of the list and is not from this brief's rules) | not a layout cause (a data feature) |
| 2 | Austrian | /at/de/angebote-destinationen | 32933 / 10420 (-68.4 %) | 32487 / 18270 (-43.8 %) | live data: www's offers finder (a fares grid of 150 to 312 pictures), ours the static page | not a layout cause (a data feature) |
| 3 | Brussels | /be/fr/book-a-flight/our-payment-methods | 3752 / 2674 (-28.7 %) → 2674 (-28.7 %) | 5390 / 4505 (-16.4 %) → 4515 (-16.2 %) | www's payment methods widget (about 900 px, empty in the recording) where ours has its link; the optional fees in a half-width column on www | widget: not a theme cause (brief 497) |
| 4 | Brussels | /be/fr/extra-services/baggage/problems-with-your-baggage | 2619 / 2118 (-19.1 %) → 2118 (-19.1 %) | 3789 / 2696 (-28.8 %) → 2706 (-28.6 %) | state: the recording has the first two accordion panels open, ours all closed | none (recording state) |
| 5 | Brussels | /be/fr/extra-services/inflight-services | 2900 / 2977 (+2.7 %) → 2977 (+2.7 %) | 2902 / 3661 (+26.2 %) → 3671 (+26.5 %) | phones: www's "Autres sujets" teasers are a swipe slider (one card and dots, about 450 px), ours a plain grid four-up stacked (1,150 px) | Brussels importer (brussels-import.mjs: the phone-slider option); out of this brief's Brussels scope (brussels.css only) |
| 6 | Brussels | /be/en/my-bookings/cancel-and-refund-requests | 1642 / 1238 (-24.6 %) → 1238 (-24.6 %) | 2142 / 1691 (-21.1 %) → 1701 (-20.6 %) | state: the recording has one accordion panel open and the chat assistant's panel; ours closed | none (recording state) |
| 7 | Austrian | /at/en/contact | 2438 / 1960 (-19.6 %) | 3022 / 2316 (-23.4 %) | content: the preview document's contact app is 180 px with a static accordion after it; live (brief 497) had the 1,306 px app | Austrian contact document (who re-imported it; not this brief's) |
| 8 | Austrian | /at/de/contact | 2459 / 1960 (-20.3 %) | 3130 / 2403 (-23.2 %) | content: as /at/en/contact | Austrian contact document |
| 9 | Austrian | /at/de/unterhaltung-an-bord | 2749 / 2248 (-18.2 %) | 3128 / 2558 (-18.2 %) | www: about 500 px of empty space under the highlights' button (an empty component in the recording) | none (recording) |
| 10 | TAP | /pt-pt/informacoes/bagagem | 2544 / 2100 (-17.5 %) | 3329 / 2913 (-12.5 %) | the LUGGit widget (third party) on www | none (third party) |
| 11 | ITA | /it/it/help-and-contact | 2374 / 1971 (-17.0 %) | 3189 / 2759 (-13.5 %) | not investigated (ITA: ranking only) | ema-test (ITA's theme switch) |
| 12 | TAP | /en-pt/information/baggage | 2528 / 2100 (-16.9 %) | 3274 / 2875 (-12.2 %) | the LUGGit widget (third party) on www | none (third party) |
| 13 | ITA | /it/en/help-and-contact | 2254 / 1929 (-14.4 %) | 3052 / 2559 (-16.2 %) | not investigated (ITA: ranking only) | ema-test (ITA's theme switch) |
| 14 | TAP | /pl-pl | 4585 / 3934 (-14.2 %) | 4441 / 4453 (+0.3 %) | 1440: the recording is unscrolled under www's GSAP pin (4,596 px; www scrolled is 4,041, ours 3,948 = -2.3 %); 390 within 0.3 % | none (recording artefact, brief 483) |
| 15 | TAP | /de-de | 4596 / 3948 (-14.1 %) | 4454 / 4466 (+0.3 %) | 1440: the recording is unscrolled under www's GSAP pin (4,596 px; www scrolled is 4,041, ours 3,948 = -2.3 %); 390 within 0.3 % | none (recording artefact, brief 483) |
| 16 | TAP | /es-es | 4577 / 3948 (-13.7 %) | 4475 / 4487 (+0.3 %) | 1440: the recording is unscrolled under www's GSAP pin (4,596 px; www scrolled is 4,041, ours 3,948 = -2.3 %); 390 within 0.3 % | none (recording artefact, brief 483) |
| 17 | TAP | /it-it | 4577 / 3948 (-13.7 %) | 4433 / 4445 (+0.3 %) | 1440: the recording is unscrolled under www's GSAP pin (4,596 px; www scrolled is 4,041, ours 3,948 = -2.3 %); 390 within 0.3 % | none (recording artefact, brief 483) |
| 18 | TAP | /en-us | 4569 / 3948 (-13.6 %) | 4873 / 4885 (+0.2 %) | 1440: the recording is unscrolled under www's GSAP pin (4,596 px; www scrolled is 4,041, ours 3,948 = -2.3 %); 390 within 0.3 %; ours from tap.turnsthe.page (no preview document) | none (recording artefact, brief 483) |
| 19 | TAP | /fr-fr | 4629 / 4000 (-13.6 %) | 4506 / 4518 (+0.3 %) | 1440: the recording is unscrolled under www's GSAP pin (4,596 px; www scrolled is 4,041, ours 3,948 = -2.3 %); 390 within 0.3 % | none (recording artefact, brief 483) |
| 20 | TAP | /pt-br | 4569 / 3948 (-13.6 %) | 4928 / 4940 (+0.2 %) | 1440: the recording is unscrolled under www's GSAP pin (4,596 px; www scrolled is 4,041, ours 3,948 = -2.3 %); 390 within 0.3 % | none (recording artefact, brief 483) |
| 21 | Austrian | /at/en/baggage | 4319 / 4257 (-1.4 %) | 6673 / 5775 (-13.5 %) | phones: www draws the teasers as boxed cards (shadow, 21 px inside, a 284 px text column); ours flat at 358 px. The other 32 recorded pages with the same grid (columns-media padded) are within 2.5 %, so nothing in our markup tells this one apart | Austrian importer (a block option for the boxed teasers) |
| 22 | TAP | /en-pt | 4621 / 4000 (-13.4 %) | 5016 / 5025 (+0.2 %) | 1440: the recording is unscrolled under www's GSAP pin (4,596 px; www scrolled is 4,041, ours 3,948 = -2.3 %); 390 within 0.3 % | none (recording artefact, brief 483) |
| 23 | TAP | /pt-pt | 4621 / 4000 (-13.4 %) | 5141 / 5151 (+0.2 %) | 1440: the recording is unscrolled under www's GSAP pin (4,596 px; www scrolled is 4,041, ours 3,948 = -2.3 %); 390 within 0.3 % | none (recording artefact, brief 483) |
| 24 | TAP | /pt-br/ajuda | 3275 / 3682 (+12.4 %) | 6509 / 6480 (-0.4 %) | 1440: the recording has the contact finder still loading (grey placeholders); at 390, loaded, ours is within 20 px | none (recording) |
| 25 | Austrian | /at/en/fly/flight-information/flight-irregularities | 1321 / 1219 (-7.7 %) | 1736 / 1556 (-10.4 %) | live data: the current-information feed under the h1 (www 507 px to the footer, ours 406) | not a layout cause |
| 26 | Brussels | /be/en/book-a-flight/groups-and-charter/meetings-and-events | 2897 / 2799 (-3.4 %) → 2799 (-3.4 %) | 3526 / 3883 (+10.1 %) → 3893 (+10.4 %) | phones: www's three step cards are a swipe slider (all three at one height), ours stacked (+347 px before "Benefits") | Brussels importer (phone-slider option) |
| 27 | Brussels | /be/en/extra-services/travel-insurances | 2210 / 2387 (+8.0 %) → 2387 (+8.0 %) | 3885 / 4272 (+10.0 %) → 4272 (+10.0 %) | the h1's padded section before a one-line grey band: 156 / 128 px around the band's text against www's 80 / 80 (1440); the only recorded page with this pair | brussels.css, but one page: no shared rule |
| 28 | Brussels | /be/fr/special-care/families-and-children | 1892 / 1641 (-13.3 %) → 1705 (-9.9 %) | 3804 / 3497 (-8.1 %) → 3657 (-3.9 %) | the intro to the first card (www 155 / 149 px: a separator and a no-break-space line ours doesn't carry); the bottom gap fixed (42d30cf3) | no carrier (brief 505 / 510 item 3) |
| 29 | Brussels | /be/fr/contact | 1715 / 1629 (-5.0 %) → 1629 (-5.0 %) | 2466 / 2223 (-9.9 %) → 2223 (-9.9 %) | the contact app (ours has no headings in it; www's h1 and two h2 inside the app): 390 -226 px to the footer | not investigated further (batch 2: one page, no shared rule) |
| 30 | Brussels | /be/fr/extra-services/beobank-mastercard | 6458 / 6927 (+7.3 %) → 6927 (+7.3 %) | 11205 / 12266 (+9.5 %) → 12276 (+9.6 %) | 390: +80 px between the borrowing notice and the h1, +60 and +58 before the next two headings, then even | not investigated further (batch 2) |
| 31 | Austrian | /at/de/homepage | 4934 / 4464 (-9.5 %) | 6186 / 5707 (-7.7 %) | homepage: live widgets (booking, offers) | ema-adobe (homepage template) |
| 32 | Austrian | /at/en/homepage | 4885 / 4438 (-9.2 %) | 6039 / 5539 (-8.3 %) | homepage: live widgets (booking, offers) | ema-adobe (homepage template) |
| 33 | Brussels | /be/en/contact | 1633 / 1629 (-0.2 %) → 1629 (-0.2 %) | 2257 / 2059 (-8.8 %) → 2059 (-8.8 %) | as /be/fr/contact (390 -199 px to the footer) | not investigated further (batch 2) |
| 34 | Brussels | /be/fr/flying-with-us/new-destinations | 4623 / 5030 (+8.8 %) → 5030 (+8.8 %) | 4833 / 4471 (-7.5 %) | 1440: +48 px before Kilimanjaro, +184 more before Nairobi (the destination blocks taller) | not investigated further (batch 2) |
| 35 | Austrian | /at/en/plan/special-requirements/travelling-with-animals | 6122 / 6661 (+8.8 %) | 8674 / 8255 (-4.8 %) | 1440: www has the cabin picture beside its text (picture right, caption), ours full width under it (+421 px before "Tips") | Austrian importer / ema-test (a picture-beside-text carrier) |
| 36 | Brussels | /be/en/special-care/families-and-children | 1814 / 1600 (-11.8 %) → 1664 (-8.3 %) | 3640 / 3353 (-7.9 %) → 3513 (-3.5 %) | as fr | no carrier |
| 37 | Brussels | /be/fr/check-in-options-and-info/online-check-in-options | 4617 / 4556 (-1.3 %) → 4556 (-1.3 %) | 7246 / 6637 (-8.4 %) → 6647 (-8.3 %) | 390: -285 px in the block after "Comment faire", 20 to 40 px per step card, -200 before the app question | not investigated further (batch 2) |
| 38 | Brussels | /be/fr/legal-notices | 1471 / 1349 (-8.3 %) → 1349 (-8.3 %) | 1971 / 1865 (-5.4 %) → 1875 (-4.9 %) | 1440: the h1 84 px higher than www's (www has something above it); 390 -4.9 % | not investigated further |
| 39 | Austrian | /at/de/legal | 1803 / 1766 (-2.1 %) | 2819 / 2592 (-8.1 %) | the four icon tiles (cards-icon usp four-up): www 225 px apart on phones, ours 160; at 1440 the row 107 px shorter | ema-adobe (cards-icon padding) |
| 40 | Austrian | /at/de/book/additional-services/seat-reservation | 9984 / 9387 (-6.0 %) | 14680 / 13512 (-8.0 %) | each seat section 15 to 60 px shorter, growing down the page; the h3 card rows aren't headings in ours | not investigated further |
| 41 | Brussels | /be/fr/book-a-flight/connecting-africa | 4106 / 3785 (-7.8 %) → 3785 (-7.8 %) | 7872 / 7422 (-5.7 %) → 7432 (-5.6 %) | the advantages' cards before "Autres sujets" (-221 px at 1440, -384 at 390) | not investigated further |
| 42 | Brussels | /be/en/extra-services/meals/special-meals | 2446 / 2255 (-7.8 %) → 2255 (-7.8 %) | 3518 / 3348 (-4.8 %) → 3358 (-4.5 %) | the space before "Related topics" after accordions (-54 px at 1440, -34 at 390); across the 16 recorded pages with that heading the jump is -63 to +80 px at 1440 (photo galleries before it +80): no one rule; 20 to 35 px less after each accordion | not ruled (batch 2) |
| 43 | Brussels | /be/fr/book-a-flight/flight-search | 1163 / 1074 (-7.7 %) → 1074 (-7.7 %) | 1748 / 1703 (-2.6 %) → 1733 (-0.9 %) | not investigated | - |
| 44 | Brussels | /be/fr/my-bookings/invoices | 1505 / 1393 (-7.4 %) → 1393 (-7.4 %) | 2292 / 2176 (-5.1 %) → 2206 (-3.8 %) | not investigated | - |
| 45 | Brussels | /be/en/book-a-flight/connecting-africa | 3980 / 3696 (-7.1 %) → 3696 (-7.1 %) | 7454 / 7049 (-5.4 %) → 7059 (-5.3 %) | as fr (-221 / -386 px before "Related topics") | not investigated further |
| 46 | Austrian | /at/en/premium-economy-class | 6689 / 6301 (-5.8 %) | 6346 / 5893 (-7.1 %) | the four h3 cards under "Services" (-152 px at 1440) | not investigated further |
| 47 | Austrian | /at/de/gesundes-reisen | 6739 / 7218 (+7.1 %) | 9455 / 9552 (+1.0 %) | 1440: each section 30 to 100 px taller from "Medizinische Reisebegleiter" on (+415 px by the FAQ) | not investigated further (batch 3) |
| 48 | Brussels | /be/en/jobs | 2062 / 2002 (-2.9 %) → 2002 (-2.9 %) | 3189 / 2968 (-6.9 %) → 2968 (-6.9 %) | 390: the three section headings aren't headings in ours (www h2); -221 px to the footer | not investigated further (batch 3) |
| 49 | Austrian | /at/en/online-check-in | 4476 / 4350 (-2.8 %) | 5845 / 5439 (-6.9 %) | 390: the block under the h1 76 px shorter and 39 more before the steps; the four steps match www | not investigated further (batch 3) |
| 50 | Brussels | /be/en/services-on-board | 1125 / 1116 (-0.8 %) → 1180 (+4.9 %) | 1865 / 1833 (-1.7 %) → 1993 (+6.9 %) | the bottom-gap rule (42d30cf3) overshoots here: www 61 / 101 px below the last grid | brussels.css (accepted: the median rule) |
| 51 | Brussels | /be/fr/flying-with-us/welcome-brussels-airlines | 6270 / 5864 (-6.5 %) → 5864 (-6.5 %) | 10337 / 9912 (-4.1 %) → 9912 (-4.1 %) | not investigated | - |
| 52 | Brussels | /fr/fr/homepage | 4214 / 4171 (-1.0 %) → 4171 (-1.0 %) | 5464 / 5810 (+6.3 %) → 5810 (+6.3 %) | homepage: live widgets (stage campaign, destination finder, fares) | ema-adobe |
| 53 | Austrian | /at/de/bearbeitungsgebuehren | 3140 / 3311 (+5.4 %) | 4125 / 4384 (+6.3 %) | content: www's page continues with a second h1 block ("Zahlungs-Möglichkeiten") ours doesn't have; above it ours is within 30 px | content (not a layout cause) |
| 54 | Austrian | /at/en/economy-class | 4134 / 4003 (-3.2 %) | 5414 / 5086 (-6.1 %) | 390: the h3 card rows (Melangerie, eJournals, Internet; Culinary delights) shorter: -47 and -60 px, -132 before "This may also interest you" | not investigated further (batch 3) |
| 55 | Brussels | /be/fr/plan-your-trip/airport-info | 1388 / 1241 (-10.6 %) → 1305 (-6.0 %) | 2731 / 2625 (-3.9 %) → 2785 (+2.0 %) | overview page: the space below the last grid fixed (42d30cf3); what is left is the intro to the first card (www's separators and empty lines, no carrier: item 3) | no carrier |
| 56 | Brussels | /be/fr/check-in-options-and-info?country=BE&language=FR | 1708 / 1545 (-9.5 %) → 1609 (-5.8 %) | 3129 / 2857 (-8.7 %) → 3017 (-3.6 %) | overview page: the space below the last grid fixed (42d30cf3); what is left is the intro to the first card (www's separators and empty lines, no carrier: item 3) | no carrier |
| 57 | Brussels | /be/fr/special-care/pets | 1708 / 1545 (-9.5 %) → 1609 (-5.8 %) | 3153 / 2882 (-8.6 %) → 3042 (-3.5 %) | overview page: the space below the last grid fixed (42d30cf3); what is left is the intro to the first card (www's separators and empty lines, no carrier: item 3) | no carrier |
| 58 | Brussels | /be/fr/legal-notices/imprint | 2056 / 1936 (-5.8 %) → 1936 (-5.8 %) | 2492 / 2368 (-5.0 %) → 2398 (-3.8 %) | not investigated | - |
| 59 | Austrian | /at/de/check-in | 2758 / 2655 (-3.7 %) | 4129 / 3903 (-5.5 %) | not investigated | - |
| 60 | Brussels | /ke/en/homepage | 4110 / 4067 (-1.0 %) → 4067 (-1.0 %) | 5227 / 5502 (+5.3 %) → 5502 (+5.3 %) | homepage: live widgets | ema-adobe |
| 61 | Brussels | /be/en/flying-with-us/the-belgian-icons | 1519 / 1438 (-5.3 %) → 1438 (-5.3 %) | 2982 / 2866 (-3.9 %) → 2876 (-3.6 %) | not investigated | - |
| 62 | Austrian | /de/de/homepage | 4794 / 4631 (-3.4 %) | 5915 / 6227 (+5.3 %) | homepage: live widgets | ema-adobe |
| 63 | Brussels | /be/fr/flying-with-us/art-design | 4831 / 4581 (-5.2 %) → 4581 (-5.2 %) | 6043 / 6007 (-0.6 %) → 6007 (-0.6 %) | not investigated | - |
| 64 | Brussels | /us/en/homepage | 4147 / 4104 (-1.0 %) → 4104 (-1.0 %) | 5340 / 5615 (+5.1 %) → 5615 (+5.1 %) | homepage: live widgets | ema-adobe |
| 65 | Austrian | /at/de/book/rebook | 2162 / 2052 (-5.1 %) | 2846 / 2772 (-2.6 %) | not investigated | - |
| 66 | Brussels | /be/en/book-a-flight/rebook | 1656 / 1573 (-5.0 %) → 1573 (-5.0 %) | 2400 / 2350 (-2.1 %) → 2360 (-1.7 %) | not investigated | - |
| 67 | ITA | /it/it/homepage | 4345 / 4267 (-1.8 %) | 5065 / 5320 (+5.0 %) | homepage (ITA: ranking only) | ema-test / ema-adobe |
| 68 | Brussels | /be/en/plan-your-trip/travel-regulations | 4354 / 4142 (-4.9 %) → 4142 (-4.9 %) | 7142 / 6889 (-3.5 %) → 6899 (-3.4 %) | not investigated | - |
| 69 | Brussels | /be/fr/travel-classes | 1336 / 1208 (-9.6 %) → 1272 (-4.8 %) | 2472 / 2283 (-7.6 %) → 2443 (-1.2 %) | overview page: the space below the last grid fixed (42d30cf3); what is left is the intro to the first card (www's separators and empty lines, no carrier: item 3) | no carrier |
| 70 | Austrian | /at/de/familien | 2408 / 2371 (-1.5 %) | 3146 / 2995 (-4.8 %) | not investigated | - |
| 71 | Brussels | /be/fr/book-a-flight/groups-and-charter | 1415 / 1284 (-9.3 %) → 1348 (-4.7 %) | 2859 / 2714 (-5.1 %) → 2874 (+0.5 %) | overview page: the space below the last grid fixed (42d30cf3); what is left is the intro to the first card (www's separators and empty lines, no carrier: item 3) | no carrier |
| 72 | Brussels | /be/fr/flying-with-us | 1609 / 1469 (-8.7 %) → 1533 (-4.7 %) | 2875 / 2696 (-6.2 %) → 2856 (-0.7 %) | overview page: the space below the last grid fixed (42d30cf3); what is left is the intro to the first card (www's separators and empty lines, no carrier: item 3) | no carrier |
| 73 | Brussels | /be/en/book-a-flight/groups-and-charter/groups | 3072 / 2928 (-4.7 %) → 2928 (-4.7 %) | 4545 / 4500 (-1.0 %) → 4510 (-0.8 %) | not investigated | - |
| 74 | TAP | /it-it/destinazioni | 2990 / 2848 (-4.7 %) | 5108 / 5251 (+2.8 %) | not investigated | - |
| 75 | Brussels | /be/en/book-a-flight/flightvoucher | 2835 / 2769 (-2.3 %) → 2769 (-2.3 %) | 4241 / 4041 (-4.7 %) → 4051 (-4.5 %) | not investigated | - |
| 76 | Austrian | /at/en/book/additional-services/extra-services | 4414 / 4376 (-0.9 %) | 6780 / 6479 (-4.4 %) | not investigated | - |
| 77 | Brussels | /be/fr/homepage | 4197 / 4020 (-4.2 %) → 4020 (-4.2 %) | 5482 / 5327 (-2.8 %) → 5327 (-2.8 %) | homepage: live widgets | ema-adobe |
| 78 | Brussels | /be/en/articles/the-gambia | 9056 / 8674 (-4.2 %) → 8674 (-4.2 %) | 13055 / 12778 (-2.1 %) → 12778 (-2.1 %) | not investigated | - |
| 79 | Brussels | /be/en/travel-classes/green-fare | 5504 / 5273 (-4.2 %) → 5273 (-4.2 %) | 7745 / 7928 (+2.4 %) → 7928 (+2.4 %) | not investigated | - |
| 80 | Austrian | /at/en/accessible-travel | 12856 / 13028 (+1.3 %) | 19404 / 18589 (-4.2 %) | not investigated | - |
| 81 | Austrian | /at/en/entryregulations | 5539 / 5326 (-3.8 %) | 7236 / 6933 (-4.2 %) | not investigated | - |
| 82 | ITA | /it/it/manage-my-bookings/manage | 2037 / 2052 (+0.7 %) | 4022 / 4190 (+4.2 %) | not investigated (ITA: ranking only) | ema-test (ITA's theme switch) |
| 83 | Brussels | /be/fr/extra-services/meals | 1630 / 1536 (-5.8 %) → 1600 (-1.8 %) | 3519 / 3217 (-8.6 %) → 3377 (-4.0 %) | overview page: the space below the last grid fixed (42d30cf3); what is left is the intro to the first card (www's separators and empty lines, no carrier: item 3) | no carrier |
| 84 | Austrian | /at/de/discover/inspiration/fly-with-austrian | 4649 / 4462 (-4.0 %) | 9114 / 8768 (-3.8 %) | not investigated | - |
| 85 | Brussels | /be/fr/extra-services/lounges | 1383 / 1265 (-8.5 %) → 1329 (-3.9 %) | 2450 / 2314 (-5.6 %) → 2474 (+1.0 %) | overview page: the space below the last grid fixed (42d30cf3); what is left is the intro to the first card (www's separators and empty lines, no carrier: item 3) | no carrier |
| 86 | Brussels | /be/fr/plan-your-trip/express-rail | 3356 / 3255 (-3.0 %) → 3255 (-3.0 %) | 5599 / 5368 (-4.1 %) → 5378 (-3.9 %) | not investigated | - |
| 87 | Brussels | /be/fr/articles/vibrant-senegal | 10888 / 10464 (-3.9 %) → 10464 (-3.9 %) | 16436 / 16161 (-1.7 %) → 16161 (-1.7 %) | not investigated | - |
| 88 | Austrian | /at/de/pre-order-food | 4243 / 4116 (-3.0 %) | 5884 / 5652 (-3.9 %) | not investigated | - |
| 89 | ITA | /it/it/world-of-ita-airways/travel-classes | 2353 / 2368 (+0.6 %) | 3611 / 3751 (+3.9 %) | not investigated (ITA: ranking only) | ema-test (ITA's theme switch) |
| 90 | Brussels | /be/en/homepage | 4110 / 3955 (-3.8 %) → 3955 (-3.8 %) | 5294 / 5110 (-3.5 %) → 5110 (-3.5 %) | homepage: live widgets | ema-adobe |
| 91 | Austrian | /at/en/discover/inspiration/fly-with-austrian | 4507 / 4347 (-3.6 %) | 8696 / 8371 (-3.7 %) | not investigated | - |
| 92 | Austrian | /at/de/flugstatus-und-flugplan | 3494 / 3500 (+0.2 %) | 4729 / 4554 (-3.7 %) | not investigated | - |
| 93 | Austrian | /at/en/book/flights/new-destinations | 9862 / 9500 (-3.7 %) | 18991 / 18289 (-3.7 %) | not investigated | - |
| 94 | Brussels | /be/en/my-bookings | 1467 / 1420 (-3.2 %) → 1484 (+1.2 %) | 3638 / 3614 (-0.7 %) → 3774 (+3.7 %) | overview page: the space below the last grid fixed (42d30cf3); what is left is the intro to the first card (www's separators and empty lines, no carrier: item 3) | no carrier |
| 95 | Brussels | /be/en/check-in-options-and-info?country=BE&language=EN | 1597 / 1532 (-4.1 %) → 1596 (-0.1 %) | 3132 / 2858 (-8.7 %) → 3018 (-3.6 %) | overview page: the space below the last grid fixed (42d30cf3); what is left is the intro to the first card (www's separators and empty lines, no carrier: item 3) | no carrier |
| 96 | Austrian | /ch/en/homepage | 4745 / 4581 (-3.5 %) | 5789 / 5998 (+3.6 %) | homepage: live widgets | ema-adobe |
| 97 | Austrian | /at/de/missing-baggage | 4603 / 4771 (+3.6 %) | 6522 / 6464 (-0.9 %) | not investigated | - |
| 98 | Austrian | /at/de/culinaryjourney | 1539 / 1485 (-3.5 %) | 2081 / 2126 (+2.2 %) | not investigated | - |
| 99 | Brussels | /be/en/book-a-flight | 1418 / 1402 (-1.1 %) → 1466 (+3.4 %) | 3092 / 2976 (-3.8 %) → 3126 (+1.1 %) | overview page: the space below the last grid fixed (42d30cf3); what is left is the intro to the first card (www's separators and empty lines, no carrier: item 3) | no carrier |
| 100 | Austrian | /at/en/book/flights/giftvoucher | 4065 / 3927 (-3.4 %) | 5756 / 5687 (-1.2 %) | not investigated | - |
| 101 | Brussels | /be/en/lufthansa-group | 1357 / 1248 (-8.0 %) → 1312 (-3.3 %) | 2169 / 1979 (-8.8 %) → 2139 (-1.4 %) | overview page: the space below the last grid fixed (42d30cf3); what is left is the intro to the first card (www's separators and empty lines, no carrier: item 3) | no carrier |
| 102 | Brussels | /be/en/plan-your-trip/travel-briefing | 4297 / 4226 (-1.7 %) → 4226 (-1.7 %) | 7657 / 7391 (-3.5 %) → 7401 (-3.3 %) | not investigated | - |
| 103 | ITA | /it/it/book-and-prepare/travel-information/baggage/carry-on-baggage | 3277 / 3278 (+0.0 %) | 4321 / 4465 (+3.3 %) | not investigated (ITA: ranking only) | ema-test (ITA's theme switch) |
| 104 | TAP | /fr-fr/informations-enregistrement | 2810 / 2716 (-3.3 %) | 3507 / 3512 (+0.1 %) | not investigated | - |
| 105 | Brussels | /be/en/travel-classes | 1331 / 1224 (-8.0 %) → 1288 (-3.2 %) | 2380 / 2235 (-6.1 %) → 2395 (+0.6 %) | overview page: the space below the last grid fixed (42d30cf3); what is left is the intro to the first card (www's separators and empty lines, no carrier: item 3) | no carrier |
| 106 | Brussels | /be/fr/my-bookings | 1521 / 1437 (-5.5 %) → 1501 (-1.3 %) | 3658 / 3614 (-1.2 %) → 3774 (+3.2 %) | overview page: the space below the last grid fixed (42d30cf3); what is left is the intro to the first card (www's separators and empty lines, no carrier: item 3) | no carrier |
| 107 | Austrian | /at/en/payment-options | 2644 / 2560 (-3.2 %) | 3292 / 3251 (-1.2 %) | not investigated | - |
| 108 | TAP | /de-de/hilfe | 3304 / 3411 (+3.2 %) | 6395 / 6350 (-0.7 %) | not investigated | - |
| 109 | Austrian | /at/en/legal/conditions-of-carriage | 3036 / 2941 (-3.1 %) | 4276 / 4231 (-1.1 %) | not investigated | - |
| 110 | Austrian | /at/en/imprint | 3688 / 3802 (+3.1 %) | 4757 / 4898 (+3.0 %) | not investigated | - |
| 111 | Austrian | /at/en/special-requirements | 3784 / 3672 (-3.0 %) | 5456 / 5337 (-2.2 %) | not investigated | - |
| 112 | Austrian | /at/de/business-class | 6179 / 6006 (-2.8 %) | 10445 / 10127 (-3.0 %) | not investigated | - |
| 113 | Austrian | /at/de/fly/on-board/internet-overview | 3289 / 3191 (-3.0 %) | 4007 / 3968 (-1.0 %) | not investigated | - |
| 114 | ITA | /it/it/world-of-ita-airways/discover-ita-airways | 2623 / 2678 (+2.1 %) | 4671 / 4811 (+3.0 %) | not investigated (ITA: ranking only) | ema-test (ITA's theme switch) |
| 115 | ITA | /it/en/book-and-prepare/travel-information/check-in-information/online-check-in | 3069 / 2976 (-3.0 %) | 3990 / 3975 (-0.4 %) | not investigated (ITA: ranking only) | ema-test (ITA's theme switch) |
| 116 | TAP | /fr-fr/miles-and-go | 3839 / 3724 (-3.0 %) | 4368 / 4290 (-1.8 %) | not investigated | - |
| 117 | Brussels | /be/en/articles | 4635 / 4715 (+1.7 %) → 4715 (+1.7 %) | 7814 / 8035 (+2.8 %) → 8045 (+3.0 %) | not investigated | - |
| 118 | Brussels | /be/fr/plan-your-trip | 1598 / 1487 (-6.9 %) → 1551 (-2.9 %) | 2886 / 2736 (-5.2 %) → 2896 (+0.3 %) | overview page: the space below the last grid fixed (42d30cf3); what is left is the intro to the first card (www's separators and empty lines, no carrier: item 3) | no carrier |
| 119 | Brussels | /be/fr/extra-services/upgrades | 4136 / 4017 (-2.9 %) → 4017 (-2.9 %) | 7185 / 7118 (-0.9 %) → 7148 (-0.5 %) | not investigated | - |
| 120 | Brussels | /be/fr/special-care/families-and-children/children-travelling-alone | 5942 / 5772 (-2.9 %) → 5772 (-2.9 %) | 8183 / 8193 (+0.1 %) → 8203 (+0.2 %) | not investigated | - |
| 121 | ITA | /it/en/homepage | 4136 / 4017 (-2.9 %) | 4920 / 4984 (+1.3 %) | not investigated (ITA: ranking only) | ema-test (ITA's theme switch) |
| 122 | ITA | /it/it/book-and-prepare/other-requests | 2192 / 2183 (-0.4 %) | 4291 / 4416 (+2.9 %) | not investigated (ITA: ranking only) | ema-test (ITA's theme switch) |
| 123 | Brussels | /be/fr/articles | 4740 / 4783 (+0.9 %) → 4783 (+0.9 %) | 8049 / 8272 (+2.8 %) → 8282 (+2.9 %) | not investigated | - |
| 124 | Brussels | /be/en/travel-classes/economy | 3186 / 3097 (-2.8 %) → 3097 (-2.8 %) | 5073 / 4946 (-2.5 %) → 4946 (-2.5 %) | not investigated | - |
| 125 | ITA | /it/en/manage-my-bookings/extra-services | 2060 / 2003 (-2.8 %) | 3713 / 3650 (-1.7 %) | not investigated (ITA: ranking only) | ema-test (ITA's theme switch) |
| 126 | Brussels | /be/en/register-newsletter | 1802 / 1851 (+2.7 %) → 1851 (+2.7 %) | 2362 / 2399 (+1.6 %) → 2399 (+1.6 %) | not investigated | - |
| 127 | Austrian | /at/de/upgrades | 8281 / 8056 (-2.7 %) | 11262 / 11074 (-1.7 %) | not investigated | - |
| 128 | Brussels | /be/en/extra-services/seat-reservation | 6305 / 6144 (-2.6 %) → 6144 (-2.6 %) | 9529 / 9635 (+1.1 %) → 9645 (+1.2 %) | not investigated | - |
| 129 | Austrian | /at/en/plan/special-requirements/healthy-travel/doctor-on-board/doctor-on-board-news | 2896 / 2972 (+2.6 %) | 3083 / 3038 (-1.5 %) | not investigated | - |
| 130 | Austrian | /at/de/notfallkontakt | 3045 / 3061 (+0.5 %) | 3542 / 3633 (+2.6 %) | not investigated | - |
| 131 | Austrian | /at/de/rechnungsbeleg | 2277 / 2336 (+2.6 %) | 2949 / 2973 (+0.8 %) | not investigated | - |
| 132 | Brussels | /be/en/extra-services | 1475 / 1420 (-3.7 %) → 1484 (+0.6 %) | 3216 / 3138 (-2.4 %) → 3298 (+2.5 %) | overview page: the space below the last grid fixed (42d30cf3); what is left is the intro to the first card (www's separators and empty lines, no carrier: item 3) | no carrier |
| 133 | Brussels | /be/en/plan-your-trip/arrivals-and-departures | 1258 / 1227 (-2.5 %) → 1227 (-2.5 %) | 1561 / 1529 (-2.0 %) → 1539 (-1.4 %) | not investigated | - |
| 134 | Austrian | /at/en/unaccompanied-minors | 6231 / 6111 (-1.9 %) | 8487 / 8275 (-2.5 %) | not investigated | - |
| 135 | Brussels | /be/en/flying-with-us/our-fleet | 1287 / 1192 (-7.4 %) → 1256 (-2.4 %) | 2680 / 2570 (-4.1 %) → 2730 (+1.9 %) | overview page: the space below the last grid fixed (42d30cf3); what is left is the intro to the first card (www's separators and empty lines, no carrier: item 3) | no carrier |
| 136 | Austrian | /at/en/book/overview-services-on-board | 2422 / 2399 (-0.9 %) | 2921 / 2850 (-2.4 %) | not investigated | - |
| 137 | Austrian | /at/de/book/overview-services-on-board | 2447 / 2423 (-1.0 %) | 2969 / 2898 (-2.4 %) | not investigated | - |
| 138 | ITA | /it/en/book-and-prepare/flights-overview | 2036 / 1987 (-2.4 %) | 3675 / 3628 (-1.3 %) | not investigated (ITA: ranking only) | ema-test (ITA's theme switch) |
| 139 | ITA | /it/en/book-and-prepare/offers | 2120 / 2070 (-2.4 %) | 4006 / 3999 (-0.2 %) | not investigated (ITA: ranking only) | ema-test (ITA's theme switch) |
| 140 | ITA | /it/it/book-and-prepare/flights-overview | 2078 / 2029 (-2.4 %) | 3760 / 3776 (+0.4 %) | not investigated (ITA: ranking only) | ema-test (ITA's theme switch) |
| 141 | ITA | /it/it/book-and-prepare/travel-information | 2140 / 2147 (+0.3 %) | 3835 / 3928 (+2.4 %) | not investigated (ITA: ranking only) | ema-test (ITA's theme switch) |
| 142 | Brussels | /be/fr/articles/milan-citytrip | 6007 / 5871 (-2.3 %) → 5871 (-2.3 %) | 8693 / 8583 (-1.3 %) → 8583 (-1.3 %) | not investigated | - |
| 143 | Austrian | /at/en/faq | 2533 / 2592 (+2.3 %) | 3903 / 3872 (-0.8 %) | not investigated | - |
| 144 | Austrian | /at/de/travel-briefing | 6990 / 6956 (-0.5 %) | 8335 / 8146 (-2.3 %) | not investigated | - |
| 145 | Austrian | /at/en/book/additional-services/travel-insurances | 2895 / 2963 (+2.3 %) | 3762 / 3734 (-0.7 %) | not investigated | - |
| 146 | Austrian | /at/en/discover/inspiration | 1712 / 1742 (+1.8 %) | 1841 / 1799 (-2.3 %) | not investigated | - |
| 147 | Austrian | /at/en/emergency-contact | 3009 / 3037 (+0.9 %) | 3415 / 3492 (+2.3 %) | not investigated | - |
| 148 | ITA | /it/en/manage-my-bookings/manage | 1981 / 1997 (+0.8 %) | 3967 / 4059 (+2.3 %) | not investigated (ITA: ranking only) | ema-test (ITA's theme switch) |
| 149 | ITA | /it/it/book-and-prepare/offers | 2187 / 2136 (-2.3 %) | 4187 / 4243 (+1.3 %) | not investigated (ITA: ranking only) | ema-test (ITA's theme switch) |
| 150 | TAP | /en-us/promos | 2748 / 2810 (+2.3 %) | 3809 / 3806 (-0.1 %) | not investigated; ours from tap.turnsthe.page (no preview document) | - |
| 151 | Brussels | /be/fr/articles/discover-warsaw | 8161 / 8341 (+2.2 %) → 8341 (+2.2 %) | 6506 / 6611 (+1.6 %) → 6611 (+1.6 %) | not investigated | - |
| 152 | Brussels | /be/en/articles/milan-citytrip | 5796 / 5668 (-2.2 %) → 5668 (-2.2 %) | 8291 / 8190 (-1.2 %) → 8190 (-1.2 %) | not investigated | - |
| 153 | Austrian | /at/en/fly/travel-classes | 2414 / 2415 (+0.0 %) | 2889 / 2826 (-2.2 %) | not investigated | - |
| 154 | Austrian | /at/de/fly/travel-classes | 2414 / 2415 (+0.0 %) | 2889 / 2826 (-2.2 %) | not investigated | - |
| 155 | Austrian | /at/de/lhg-staralliance-partner | 7230 / 7386 (+2.2 %) | 12070 / 11800 (-2.2 %) | not investigated | - |
| 156 | Brussels | /be/en/special-care | 1475 / 1420 (-3.7 %) → 1484 (+0.6 %) | 2805 / 2704 (-3.6 %) → 2864 (+2.1 %) | overview page: the space below the last grid fixed (42d30cf3); what is left is the intro to the first card (www's separators and empty lines, no carrier: item 3) | no carrier |
| 157 | Brussels | /be/en/extra-services/upgrades | 3957 / 3873 (-2.1 %) → 3873 (-2.1 %) | 6649 / 6565 (-1.3 %) → 6595 (-0.8 %) | not investigated | - |
| 158 | TAP | /en-pt/check-in-information | 2700 / 2644 (-2.1 %) | 3182 / 3139 (-1.4 %) | not investigated | - |
| 159 | TAP | /pt-pt/informacoes-check-in | 2770 / 2713 (-2.1 %) | 3307 / 3304 (-0.1 %) | not investigated | - |
| 160 | Austrian | /at/de/anreise-abreise | 3105 / 3087 (-0.6 %) | 3759 / 3683 (-2.0 %) | not investigated | - |
| 161 | Austrian | /at/de/book/groups-and-enterprises/group-travel-and-charter | 2432 / 2421 (-0.5 %) | 2997 / 2937 (-2.0 %) | not investigated | - |
| 162 | Austrian | /at/de/zusatzgepaeck | 2916 / 2894 (-0.8 %) | 4106 / 4028 (-1.9 %) | not investigated | - |
| 163 | ITA | /it/en/world-of-ita-airways/discover-ita-airways | 2557 / 2606 (+1.9 %) | 4617 / 4637 (+0.4 %) | not investigated (ITA: ranking only) | ema-test (ITA's theme switch) |
| 164 | ITA | /it/en/book-and-prepare/travel-information/baggage/carry-on-baggage | 3266 / 3267 (+0.0 %) | 4213 / 4294 (+1.9 %) | not investigated (ITA: ranking only) | ema-test (ITA's theme switch) |
| 165 | ITA | /it/it/manage-my-bookings/partners | 2561 / 2513 (-1.9 %) | 5002 / 5043 (+0.8 %) | not investigated (ITA: ranking only) | ema-test (ITA's theme switch) |
| 166 | Brussels | /be/en/extra-services/meals | 1548 / 1512 (-2.3 %) → 1576 (+1.8 %) | 3391 / 3169 (-6.5 %) → 3329 (-1.8 %) | overview page: the space below the last grid fixed (42d30cf3); what is left is the intro to the first card (www's separators and empty lines, no carrier: item 3) | no carrier |
| 167 | Brussels | /be/en/special-care/special-assistance | 1641 / 1547 (-5.7 %) → 1611 (-1.8 %) | 3724 / 3512 (-5.7 %) → 3672 (-1.4 %) | overview page: the space below the last grid fixed (42d30cf3); what is left is the intro to the first card (www's separators and empty lines, no carrier: item 3) | no carrier |
| 168 | Austrian | /at/de/book/groups-and-enterprises/corporate-customers | 2664 / 2615 (-1.8 %) | 4095 / 4041 (-1.3 %) | not investigated | - |
| 169 | ITA | /it/it/world-of-ita-airways/services-on-board | 2126 / 2117 (-0.4 %) | 3425 / 3488 (+1.8 %) | not investigated (ITA: ranking only) | ema-test (ITA's theme switch) |
| 170 | ITA | /it/en/world-of-ita-airways/travel-classes | 2311 / 2326 (+0.6 %) | 3518 / 3577 (+1.7 %) | not investigated (ITA: ranking only) | ema-test (ITA's theme switch) |
| 171 | ITA | /it/it/manage-my-bookings/extra-services | 2102 / 2109 (+0.3 %) | 3822 / 3886 (+1.7 %) | not investigated (ITA: ranking only) | ema-test (ITA's theme switch) |
| 172 | TAP | /en-pt/bookings/tap-fares | 3088 / 3142 (+1.7 %) | 3326 / 3328 (+0.1 %) | not investigated | - |
| 173 | TAP | /es-es/miles-and-go | 3812 / 3766 (-1.2 %) | 4392 / 4317 (-1.7 %) | not investigated | - |
| 174 | TAP | /pt-pt/reservas/tarifas-tap | 3088 / 3142 (+1.7 %) | 3394 / 3407 (+0.4 %) | not investigated | - |
| 175 | TAP | /de-de/miles-and-go | 3818 / 3758 (-1.6 %) | 4354 / 4304 (-1.1 %) | not investigated | - |
| 176 | Austrian | /at/en/book/overview-inspiration | 1777 / 1750 (-1.5 %) | 2299 / 2273 (-1.1 %) | not investigated | - |
| 177 | Austrian | /at/de/book/overview-inspiration | 1777 / 1750 (-1.5 %) | 2347 / 2321 (-1.1 %) | not investigated | - |
| 178 | Austrian | /at/en/fly/on-board/culinary-services | 8422 / 8343 (-0.9 %) | 9166 / 9029 (-1.5 %) | not investigated | - |
| 179 | ITA | /it/en/book-and-prepare/other-requests | 2150 / 2141 (-0.4 %) | 4185 / 4247 (+1.5 %) | not investigated (ITA: ranking only) | ema-test (ITA's theme switch) |
| 180 | TAP | /es-es/promos | 2767 / 2830 (+2.3 %) → 2807 (+1.4 %) | 3972 / 3935 (-0.9 %) → 3915 (-1.4 %) | as en-pt (fixed, 1d4290c5) | fixed |
| 181 | TAP | /en-pt/promos | 2796 / 2858 (+2.2 %) → 2835 (+1.4 %) | 4009 / 4065 (+1.4 %) → 4045 (+0.9 %) | the heading over the market sections' cards (fixed, 1d4290c5) | fixed |
| 182 | TAP | /pt-pt/promos | 2796 / 2858 (+2.2 %) → 2835 (+1.4 %) | 4028 / 4007 (-0.5 %) → 3987 (-1.0 %) | as en-pt (fixed, 1d4290c5) | fixed |
| 183 | Brussels | /be/fr/our-company | 6004 / 5937 (-1.1 %) → 5937 (-1.1 %) | 9803 / 9652 (-1.5 %) → 9662 (-1.4 %) | not investigated | - |
| 184 | Austrian | /at/de/datenschutz | 16293 / 16517 (+1.4 %) | 31178 / 31328 (+0.5 %) | not investigated | - |
| 185 | ITA | /it/it/book-and-prepare/travel-information/check-in-information/online-check-in | 2715 / 2678 (-1.4 %) | 4152 / 4197 (+1.1 %) | not investigated (ITA: ranking only) | ema-test (ITA's theme switch) |
| 186 | TAP | /en-pt/help | 3661 / 3643 (-0.5 %) | 6407 / 6318 (-1.4 %) | not investigated | - |
| 187 | TAP | /pt-pt/miles-and-go | 3773 / 3764 (-0.2 %) | 4753 / 4688 (-1.4 %) | not investigated | - |
| 188 | TAP | /en-pt/destinations | 2990 / 3028 (+1.3 %) | 5116 / 5121 (+0.1 %) | not investigated | - |
| 189 | TAP | /pl-pl/informacje-prawne | 1896 / 1920 (+1.3 %) | 2672 / 2663 (-0.3 %) | not investigated | - |
| 190 | TAP | /pt-br/miles-and-go | 3791 / 3742 (-1.3 %) | 4757 / 4699 (-1.2 %) | not investigated | - |
| 191 | TAP | /pt-pt/destinos | 2990 / 3028 (+1.3 %) | 5084 / 5098 (+0.3 %) | not investigated | - |
| 192 | Austrian | /at/en/book/overview-manage | 3693 / 3648 (-1.2 %) | 5103 / 5051 (-1.0 %) | not investigated | - |
| 193 | Austrian | /at/en/austrian-app | 5359 / 5425 (+1.2 %) | 6703 / 6637 (-1.0 %) | not investigated | - |
| 194 | TAP | /en-pt/legal-info | 1888 / 1910 (+1.2 %) | 2596 / 2586 (-0.4 %) | not investigated | - |
| 195 | TAP | /pt-pt/info-legal | 1888 / 1910 (+1.2 %) | 2644 / 2634 (-0.4 %) | not investigated | - |
| 196 | Brussels | /be/fr/articles/lyon | 9723 / 9619 (-1.1 %) → 9619 (-1.1 %) | 7690 / 7661 (-0.4 %) → 7661 (-0.4 %) | not investigated | - |
| 197 | Austrian | /at/de/besondere-anforderungen | 3736 / 3696 (-1.1 %) | 5497 / 5450 (-0.9 %) | not investigated | - |
| 198 | TAP | /pt-pt/ajuda | 3642 / 3643 (+0.0 %) | 6422 / 6352 (-1.1 %) | not investigated | - |
| 199 | Brussels | /be/en/articles/lyon | 9555 / 9459 (-1.0 %) → 9459 (-1.0 %) | 7192 / 7202 (+0.1 %) → 7202 (+0.1 %) | not investigated | - |
| 200 | Austrian | /at/en/book/flights | 3575 / 3609 (+1.0 %) | 4693 / 4674 (-0.4 %) | not investigated | - |
| 201 | Austrian | /at/de/anfrage-rueckerstattung | 2197 / 2186 (-0.5 %) | 2515 / 2540 (+1.0 %) | not investigated | - |
| 202 | Austrian | /at/en/company | 3249 / 3282 (+1.0 %) | 4035 / 3993 (-1.0 %) | not investigated | - |
| 203 | Austrian | /at/en/sustainable-flying | 4275 / 4278 (+0.1 %) | 5929 / 5868 (-1.0 %) | not investigated | - |
| 204 | Austrian | /at/de/book/flights | 3600 / 3633 (+0.9 %) | 4850 / 4831 (-0.4 %) | not investigated | - |
| 205 | Austrian | /at/en/international-lounges | 3192 / 3187 (-0.2 %) | 3568 / 3537 (-0.9 %) | not investigated | - |
| 206 | TAP | /en-pt/miles-and-go | 3770 / 3740 (-0.8 %) | 4747 / 4706 (-0.9 %) | not investigated | - |
| 207 | TAP | /pl-pl/pomoc | 3145 / 3145 (+0.0 %) | 5695 / 5646 (-0.9 %) | not investigated | - |
| 208 | Brussels | /be/fr/travel-classes/business | 6458 / 6438 (-0.3 %) → 6438 (-0.3 %) | 8976 / 8905 (-0.8 %) → 8905 (-0.8 %) | not investigated | - |
| 209 | Brussels | /be/en/our-company/accessibility-statement | 5823 / 5872 (+0.8 %) → 5872 (+0.8 %) | 9253 / 9287 (+0.4 %) → 9297 (+0.5 %) | not investigated | - |
| 210 | Brussels | /be/en/articles/valencia-like-a-local | 6295 / 6308 (+0.2 %) → 6308 (+0.2 %) | 4715 / 4754 (+0.8 %) → 4754 (+0.8 %) | not investigated | - |
| 211 | TAP | /es-es/ayuda | 3197 / 3204 (+0.2 %) | 5913 / 5867 (-0.8 %) | not investigated | - |
| 212 | TAP | /it-it/assistenza | 3255 / 3262 (+0.2 %) | 5932 / 5887 (-0.8 %) | not investigated | - |
| 213 | Brussels | /be/fr/register-newsletter | 1964 / 1976 (+0.6 %) → 1976 (+0.6 %) | 2598 / 2615 (+0.7 %) → 2615 (+0.7 %) | not investigated | - |
| 214 | TAP | /de-de/reiseziele | 2990 / 3011 (+0.7 %) | 5156 / 5177 (+0.4 %) | not investigated | - |
| 215 | Brussels | /be/en/extra-services/baggage | 1594 / 1529 (-4.1 %) → 1593 (-0.1 %) | 3655 / 3473 (-5.0 %) → 3633 (-0.6 %) | overview page: the space below the last grid fixed (42d30cf3); what is left is the intro to the first card (www's separators and empty lines, no carrier: item 3) | no carrier |
| 216 | Brussels | /be/fr/book-a-flight | 1493 / 1420 (-4.9 %) → 1484 (-0.6 %) | 3147 / 2992 (-4.9 %) → 3142 (-0.2 %) | overview page: the space below the last grid fixed (42d30cf3); what is left is the intro to the first card (www's separators and empty lines, no carrier: item 3) | no carrier |
| 217 | Austrian | /at/en/book/overview-travel-information | 2996 / 3015 (+0.6 %) | 4069 / 4076 (+0.2 %) | not investigated | - |
| 218 | Austrian | /at/de/book/overview-travel-information | 3044 / 3063 (+0.6 %) | 4135 / 4141 (+0.1 %) | not investigated | - |
| 219 | Austrian | /at/en/footer-pages/subscribe-newsletter | 2133 / 2125 (-0.4 %) | 2625 / 2609 (-0.6 %) | not investigated | - |
| 220 | Austrian | /at/en/at-the-airport | 2957 / 2976 (+0.6 %) | 4154 / 4165 (+0.3 %) | not investigated | - |
| 221 | Austrian | /at/de/legal/passenger-rights | 11067 / 11110 (+0.4 %) | 18875 / 18753 (-0.6 %) | not investigated | - |
| 222 | Austrian | /at/de/footer-pages/accessibility-statement | 6756 / 6755 (-0.0 %) | 10387 / 10449 (+0.6 %) | not investigated | - |
| 223 | ITA | /it/en/world-of-ita-airways/services-on-board | 2060 / 2051 (-0.4 %) | 3268 / 3286 (+0.6 %) | not investigated (ITA: ranking only) | ema-test (ITA's theme switch) |
| 224 | Austrian | /at/en/book/overview-extra-services | 3604 / 3594 (-0.3 %) | 4964 / 4940 (-0.5 %) | not investigated | - |
| 225 | Austrian | /at/de/book/overview-extra-services | 3669 / 3657 (-0.3 %) | 5155 / 5130 (-0.5 %) | not investigated | - |
| 226 | Austrian | /at/de/schwangere-frauen | 4294 / 4307 (+0.3 %) | 5716 / 5689 (-0.5 %) | not investigated | - |
| 227 | Brussels | /be/fr/travel-classes/premium-economy | 4620 / 4609 (-0.2 %) → 4609 (-0.2 %) | 6224 / 6249 (+0.4 %) → 6249 (+0.4 %) | not investigated | - |
| 228 | Austrian | /at/de/book/overview-manage | 3721 / 3711 (-0.3 %) | 5259 / 5243 (-0.3 %) | not investigated | - |
| 229 | Austrian | /at/en/green-fare | 6482 / 6462 (-0.3 %) | 7637 / 7638 (+0.0 %) | not investigated | - |
| 230 | ITA | /it/en/book-and-prepare/travel-information | 2036 / 2043 (+0.3 %) | 3611 / 3612 (+0.0 %) | not investigated (ITA: ranking only) | ema-test (ITA's theme switch) |
| 231 | ITA | /it/en/manage-my-bookings/partners | 2471 / 2463 (-0.3 %) | 4493 / 4496 (+0.1 %) | not investigated (ITA: ranking only) | ema-test (ITA's theme switch) |
| 232 | TAP | /fr-fr/aide | 3404 / 3411 (+0.2 %) | 6279 / 6258 (-0.3 %) | not investigated | - |
| 233 | Austrian | /at/en/aircraft-fleet | 3618 / 3612 (-0.2 %) | 5522 / 5510 (-0.2 %) | not investigated | - |
| 234 | Brussels | /be/en/legal-notices/data-protection-and-privacy-notice | 16274 / 16276 (+0.0 %) → 16276 (+0.0 %) | 29975 / 30010 (+0.1 %) → 30010 (+0.1 %) | not investigated | - |
