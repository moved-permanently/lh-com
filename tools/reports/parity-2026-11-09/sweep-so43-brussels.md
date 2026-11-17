# Brussels: standing order 43 (2026-11-17)

ema-lufthansa, about 20:00 to 20:45 UTC. All figures are as served on brussels.turnsthe.page, main as deployed, in full Chrome with airline hosts refused per request. Each height was taken only once the page had been scrolled through and had held for 2 s. Recordings: the newest per page and width in brussels-parity-001 to -014 (no newer Brussels archive has arrived since order 42). Nothing was uploaded, previewed or published, and DA was neither read nor written.

## 1. Rank 187's phone footer rule: HOLD, by the same page-width as in order 42

- **Gate.** All 208 recorded Brussels page-widths (104 pages at 390 and 1440), each measured with the rule added as a style tag in the same load, and with it removed again:
  - 175 are unchanged;
  - 21 are closer to www;
  - 11 move further by at most 0.5 points;
  - 1 moves further by more: /be/fr/extra-services/baggage at 390, −0.03 → +0.57 % (ours 3,700 → 3,722, www 3,701 in brussels-parity-006, a 390 resize of its 1440 load).
- **Locale census.** Every Brussels locale's homepage at 390 (98 markets), with and without the rule in the same load:
  - footers are 794 to 905 px;
  - with the rule, 28 locales gain one wrapped legal line (+22 px): ao/fr, at/de, be/fr, bf/fr, bi/fr, bj/fr, ca/fr, cd/fr, ch/de, ch/fr, ch/it, ci/fr, cm/fr, de/de, fr/fr, gh/fr, gm/fr, gn/fr, it/it, jp/fr, lr/fr, lu/fr, ma/fr, rw/fr, sl/fr, sn/fr, tg/fr, ug/fr;
  - 70 are unchanged, and none overflows;
  - five loads that were still growing (es/en, fi/en, fr/fr, th/en and tg/en) were measured again and settled.
- **Held.** The rule stays out of the theme. The phone first load of be/fr/extra-services/baggage requested in order 42 (capture-requests-ema-lufthansa.txt) still decides it.

## 2. Recorded page-widths more than 2 % off, worst first

43 page-widths are more than 2 % off as served.

- **READY:** three new rows in delta-so43-brussels-page-ends.txt, each a spacer pair after the page's last block, giving www's gap to the footer. All six recorded page-widths that reach them come closer or stay equal:
  - be/en check-in-options-and-info at 390;
  - be/fr check-in-options-and-info at 390;
  - be/en us-traveling-with-disabilities at 390 and 1440.
  finish-brussels.txt marks the three READY.
- **The rest:** listed with the cause the finish list located (owner decisions, www's live data and script-drawn cards, page endings no single rule separates), or one line why not. Rows already READY from earlier orders that still show here are form pages whose height changes from load to load, or rows not yet applied.

Columns: page, width, ours as served (www, recording), difference, status, cause.

| page | width | ours (www, recording) | % | status | cause, or why no row |
|---|---|---|---|---|---|
| /be/fr/homepage | 1440 | 1331 (4197, brussels-parity-001) | -68.29 % | READY | with the cards counted (www's recorded slider cards and the page's teaser routes answered in the measuring browser) 4053 (-3.43 %): not the live data alone; the slider's space, the cards and, on ke/en, the teaser's routes from 768… |
| /prod/content/v3assets/misc/fop/new/fop_standalone_1_en.html | 390 | 1237 (844, brussels-parity-008) | +46.56 % | - | www's payment-method country picker, recorded on its own (webv4 host); a page of www's payment service, held as owner decision with our-payment-methods (flag brussels-payment-picker) |
| /be/fr/book-a-flight/our-payment-methods | 1440 | 2825 (3752, brussels-parity-004) | -24.71 % | HOLD | owner decision: www's 750 px country-picker iframe of its payment service, built behind the site flag brussels-payment-picker (ce584e22), the flag off; with it on -24.7 -> -5.7 % at 1440 (ranking-588). Located: -749 px before "Fra… |
| /be/fr/book-a-flight/our-payment-methods | 390 | 4501 (5393, brussels-parity-012) | -16.54 % | HOLD | owner decision: www's 750 px country-picker iframe of its payment service, built behind the site flag brussels-payment-picker (ce584e22), the flag off; with it on -24.7 -> -5.7 % at 1440 (ranking-588). Located: -792 px before "Fra… |
| /be/fr/our-company | 390 | 10456 (9803, brussels-parity-003) | +6.66 % | HOLD | code, an owner decision: www cuts the 'Le saviez-vous' cards' text off after three lines with an ellipsis (the rest behind each card's link; seen in the recording's own screenshot at 390); ours shows the whole text, up to five lin… |
| /be/en/local-page/offers | 1440 | 4326 (4630, brussels-parity-004) | -6.57 % | HOLD | re-measured as served (2026-11-15 ~15:30 UTC, NO_LOCAL_CSS): 4326 px, -6.57 % (listed 4211); the cause as located below |
| /be/en/check-in-options-and-info/check-in-times | 390 | 4108 (4354, brussels-parity-012) | -5.65 % | HOLD | document: www shows a collapsed check-in times component ('Show', about 260 px on phones) where the import made a 'Check-in times' link; the component's data is www's. Located: -259 px before "Related topics", +73 px before the fo… |
| /be/en/local-page/offers | 390 | 5922 (6236, brussels-parity-012) | -5.04 % | HOLD | counted with its recorded cards 3945 / 5481 (-14.79 / -12.01 %); Brussels P57 takes 1440 to 4060 (-12.31 %); the rest the flight-search widget's no-API state; brussels-so19-homepages.txt |
| /ke/en/homepage | 1440 | 4304 (4110, brussels-parity-003) | +4.72 % | HOLD | HOLD, live data; no fix exists. As served on brussels.turnsthe.page (airline hosts refused per request) 4304 against www's 4110 (+4.72 %); located: +241 px, all of it in the "Winter deals" fare teaser before "Current topics and ne… |
| /be/en/check-in-options-and-info?country=BE&language=EN | 390 | 2986 (3132, brussels-parity-001) | -4.66 % | READY | READY row (delta-so43-brussels-page-ends): www keeps about 247 px under the last card, ours 184; with the row 3049 (-2.65 %); the rest is 32 px above the H1 and a few px per card |
| /be/fr/extra-services/meals | 390 | 3361 (3519, brussels-parity-001) | -4.49 % | HOLD | one more attempt (brussels-so22-code-groups.txt): the pages closer and further all end with the same block, no scope separates them; held |
| /be/fr/my-bookings/cancel-and-refund-requests | 1440 | 1684 (1758, brussels-parity-006) | -4.21 % | HOLD | re-measured as served (2026-11-15 ~15:30 UTC, NO_LOCAL_CSS): 1684 px, -4.21 % (listed 1672); the cause as located below |
| /be/en/book-a-flight | 1440 | 1476 (1418, brussels-parity-001) | +4.09 % | HOLD | code, no rule passes: the page ends with a teaser row; at 1440 www keeps 82 px under it, ours 112 (the padded section's 64 px), while other teaser endings at 1440 differ the other way (families: www 130, ours 112). Located: +56 px… |
| /il/en/rebooking-request-birthright | 390 | 2970 (2855, brussels-parity-012) | +4.03 % | READY | within 2 % as served in both engines (the headless shell gives 2,899 too); the old 2,970 was one load of the form, which draws in its own time |
| /be/fr/our-company | 1440 | 6245 (6004, brussels-parity-003) | +4.01 % | HOLD | code, an owner decision: www cuts the 'Le saviez-vous' cards' text off after three lines with an ellipsis (the rest behind each card's link; seen in the recording's own screenshot at 390); ours shows the whole text, up to five lin… |
| /ke/en/homepage | 390 | 5028 (5227, brussels-parity-003) | -3.81 % | HOLD | re-measured as served (2026-11-15 ~15:30 UTC, NO_LOCAL_CSS): 5028 px, -3.81 % (listed 5452); the cause as located below |
| /be/en/my-bookings | 390 | 3774 (3638, brussels-parity-001) | +3.74 % | HOLD | code, no one rule: three places (www's screenshot at 390): +46 px from the H1 to the first card (www 110, ours 156), +3 px per card over eight cards (pitch 303 against 300), and +95 px under the last card (www 83 px to the footer,… |
| /it/it/legal-notices/special-assistance-legal-guidelines | 390 | 2180 (2256, brussels-parity-012) | -3.37 % | HOLD | one more attempt (brussels-so22-code-groups.txt): these pages and the five matching ones end the same way, no scope separates them; held |
| /be/en/check-in-options-and-info/check-in-times | 1440 | 2516 (2601, brussels-parity-004) | -3.27 % | HOLD | document: www shows a collapsed check-in times component ('Show', about 260 px on phones) where the import made a 'Check-in times' link; the component's data is www's. Located: -43 px before "Related topics", -29 px before "When c… |
| /be/en/contact/service-charges | 1440 | 1626 (1677, brussels-parity-004) | -3.04 % | HOLD | re-measured as served (2026-11-15 ~15:30 UTC, NO_LOCAL_CSS): 1626 px, -3.04 % (listed 1614); the cause as located below |
| /be/nl/contact/service-charges | 1440 | 1663 (1715, brussels-parity-006) | -3.03 % | HOLD | re-measured as served (2026-11-15 ~15:30 UTC, NO_LOCAL_CSS): 1663 px, -3.03 % (listed 1651); the cause as located below |
| /it/it/legal-notices/special-assistance-legal-guidelines | 1440 | 1474 (1519, brussels-parity-007) | -2.96 % | HOLD | one more attempt (brussels-so22-code-groups.txt): these pages and the five matching ones end the same way, no scope separates them; held |
| /be/en/my-bookings/cancel-and-refund-requests | 1440 | 1594 (1642, brussels-parity-004) | -2.92 % | HOLD | re-measured as served (2026-11-15 ~15:30 UTC, NO_LOCAL_CSS): 1594 px, -2.92 % (listed 1582); the cause as located below |
| /be/en/my-bookings/emergency-contact | 1440 | 2593 (2521, brussels-parity-004) | +2.86 % | READY | within 2 % in both engines |
| /be/en/legal-notices/us-traveling-with-disabilities | 1440 | 1280 (1317, brussels-parity-007) | -2.81 % | READY | READY row (delta-so43-brussels-page-ends): www keeps 37 px more under the closing accordion; with the row 1317 (+0.00 %) |
| /be/en/local-page/chase-the-sun-across-spain | 390 | 9243 (8991, brussels-parity-012) | +2.80 % | HOLD | one page, two places (against www's live measurement and its screenshot at 390): the eclipse city list about +215 px above 'Ready to explore Spain?', and the closing flight-search band +103 px (its subheading on three lines, www t… |
| /be/en/legal-notices/us-traveling-with-disabilities | 390 | 1823 (1874, brussels-parity-013) | -2.72 % | READY | READY row (delta-so43-brussels-page-ends): www keeps 51 px more under the closing accordion; with the row 1870 (-0.21 %) |
| /be/fr/check-in-options-and-info?country=BE&language=FR | 390 | 3045 (3129, brussels-parity-001) | -2.68 % | READY | READY row (delta-so43-brussels-page-ends): the same page end as be/en; with the row 3128 (-0.03 %) |
| /be/en/my-bookings/emergency-contact | 390 | 3289 (3204, brussels-parity-012) | +2.65 % | READY | within 2 % by capture.js in both engines; the old 3,313 was one load of the contact form |
| /be/fr/book-a-flight | 1440 | 1531 (1493, brussels-parity-001) | +2.55 % | HOLD | code, no rule passes: the page ends with a teaser row; at 1440 www keeps 82 px under it, ours 112 (the padded section's 64 px), while other teaser endings at 1440 differ the other way (families: www 130, ours 112). Located: +36 px… |
| /fr/fr/homepage | 390 | 5326 (5464, brussels-parity-003) | -2.53 % | HOLD | re-measured as served (2026-11-15 ~15:30 UTC, NO_LOCAL_CSS): 5241 px, -4.08 % (listed 5761); the cause as located below |
| /be/en/legal-notices/short-notice-eu-us | 1440 | 1908 (1956, brussels-parity-007) | -2.45 % | HOLD | one more attempt (brussels-so22-code-groups.txt): these pages and the five matching ones end the same way, no scope separates them; held |
| /be/fr/contact/feedback | 390 | 2001 (2049, brussels-parity-014) | -2.34 % | - | not located this order: 10 px above the H1 (ours lower) and 24 px less before the footer (ours 1171, www 1195); the form's own spacing, under 2.5 % |
| /il/en/rebooking-request-birthright | 1440 | 1943 (1899, brussels-parity-004) | +2.32 % | HOLD | our own form's bot check: the Cloudflare Turnstile box (71 px) on our form, which www has not (ranking-588); the rest the form section's spacing under its last text (one page each) |
| /it/it/extra-services/meals | 390 | 3337 (3416, brussels-parity-012) | -2.31 % | HOLD | one more attempt (brussels-so22-code-groups.txt): the pages closer and further all end with the same block, no scope separates them; held |
| /be/en/extra-services/meals | 390 | 3313 (3391, brussels-parity-001) | -2.30 % | HOLD | one more attempt (brussels-so22-code-groups.txt): the pages closer and further all end with the same block, no scope separates them; held |
| /be/en/articles/bike-the-city | 1440 | 3989 (4082, brussels-parity-010) | -2.28 % | HOLD | located: www puts the six bold city headings on a line of their own, DA's copy runs them into the text; a delta row (delta-so33-brussels-bike-the-city-heading-breaks.txt) takes 1440 to 4109 (+0.66 %) but 390 0.81 points further ag… |
| /be/nl/special-care/pets | 390 | 3030 (3099, brussels-parity-012) | -2.23 % | HOLD | one more attempt (brussels-so22-code-groups.txt): the pages closer and further all end with the same block, no scope separates them; held |
| /be/en/jobs/core-values | 390 | 4626 (4527, brussels-parity-012) | +2.19 % | HOLD | no single cause, 390 only: about 20 px more at each of the page's five sections (+25, +13, +19, +19 px before their H2s, +39 before the footer): the sections' spacing on phones; the same gap on every Brussels page is within 2 % el… |
| /be/en/homepage | 390 | 5179 (5294, brussels-parity-001) | -2.17 % | HOLD | with the cards counted (www's recorded slider cards and the page's teaser routes answered in the measuring browser) 5094 (-3.78 %): not the live data alone; the slider's space, the cards and, on ke/en, the teaser's routes from 768… |
| /be/en/contact/feedback/general/other | 390 | 7566 (7406, brussels-parity-012) | +2.16 % | READY | within 2 % by capture.js (the feedback form draws in its own time; 7,509 in the shell) |
| /be/en/local-page/chase-the-sun-across-spain | 1440 | 5335 (5225, brussels-parity-004) | +2.11 % | HOLD | one page, two places (against www's live measurement and its screenshot at 390): the eclipse city list about +215 px above 'Ready to explore Spain?', and the closing flight-search band +103 px (its subheading on three lines, www t… |
| /be/fr/my-bookings/cancel-and-refund-requests | 390 | 2359 (2408, brussels-parity-012) | -2.03 % | HOLD | as served 2341, -2.78 %; its 'Demander un remboursement en ligne' button is cut by the ellipsis as be/fr checked-baggage's; the wrap rule takes it to -2.03 % but is HOLD (brussels-so25-button-wrap.txt) |
