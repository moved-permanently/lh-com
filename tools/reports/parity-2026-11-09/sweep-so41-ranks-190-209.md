# Brand sweep, ranks 190 to 209 (ema-lufthansa, standing order 41, 2026-11-17)

## How the ranks were taken

The ranking continues sweep-so40-ranks-170-189.md. All twenty were captured in full Chrome (capture.js PARITY_CHROME=1, ~05:00 UTC, main as deployed, airline hosts refused per request). Each footer top and height comes from one full-Chrome load per page (host-eval HOST_CHROME=1).

## Result

- **No row or rule: every rank is within 2 % in Chrome or explained.** Most of the steps sit between the last block and the footer, in single-section pages with no marks to place them further.
- **Four ranks are Discover's** (199, 206, 208, 209), which is ema-test's area.
- **Two are within 1 % now through earlier rules:** 197 and 202 (order 37's SWISS footer rule). One more (195) is within 1 % in Chrome, as engines-so40-chrome-shell.md lists.
- **One is outside 2 % in Chrome:** 200, it/it checked-baggage 390. Its cause is the closing related-topics band, as finish-brussels.txt says.

| # | brand | page | width | recording | www px | ours (Chrome) | ours vs www | located | row / rule |
|---|---|---|---|---|---|---|---|---|---|
| 190 | Brussels | /be/en/contact/feedback | 390 | brussels-parity-004 | 1912 | 1890 | -1.15 % | The footer stands 25 px higher, in the page's one section (the concern links); the footer +3 | none |
| 191 | Brussels | /be/en/book-a-flight/connecting-africa | 390 | brussels-parity-001 | 7454 | 7515 | +0.82 % | Within 1 % in Chrome. The footer stands 59 px lower, from orders 33 and 34's sidebar rows (closer at 1440). | none |
| 192 | Group for Business | /de/en/about-us/lhg-history/lhg-history-alliances-and-joint-ventures | 1440 | b2b-parity-003 | 5171 | 5113 | -1.12 % | The footer stands 60 px higher, in the history timeline. One first Chrome load drew 4,664 (bad load); captured again: 5,113 in both engines. | none |
| 193 | Brussels | /be/en/my-bookings/cancel-and-refund-requests | 390 | brussels-parity-004 | 2142 | 2118 | -1.12 % | The footer stands 26 px higher, in the one section; the footer +2 | none |
| 194 | Group for Business | /de/de/travel-solutions/lufthansa-group-airlines | 390 | b2b-parity-001 | 5454 | 5417 | -0.68 % | Within 1 % in Chrome (the shell gave -1.12 %); the footer stands 34 px higher | none |
| 195 | Group for Business | /de/en/travel-solutions/our-european-fares | 1440 | b2b-parity-007 | 9102 | 9102 | +0.00 % | www's height in Chrome; the shell gives 9,203 (+1.11 %) | none |
| 196 | Brussels | /be/fr/contact | 1440 | brussels-parity-001 | 1715 | 1734 | +1.11 % | The footer stands 20 px lower, in the one section; the footer -1 | none |
| 197 | SWISS | /ch/de/book-and-manage/overview-extra-services | 1440 | swiss-parity-001 | 3071 | 3061 | -0.33 % | Within 1 %: order 37's footer rule (the German legal links' second line) | fixed (order 37's rule) |
| 198 | Brussels | /be/en/book-a-flight | 390 | brussels-parity-001 | 3092 | 3126 | +1.10 % | The footer stands 32 px lower, in the card section; the footer +2 | none |
| 199 | Discover | /de/de/my-bookings/check-in/check-in-at-the-airport | 390 | discover-parity-001 | 2117 | 2094 | -1.09 % | The footer -8; the German footer is 15 px shorter | none: Discover is ema-test's |
| 200 | Brussels | /it/it/extra-services/baggage/checked-baggage | 390 | brussels-parity-011 | 4914 | 4813 | -2.06 % | The closing related-topics band (www about 80 px from its heading to the first card and 135 under the last, ours 38 and 49). The footer stands 78 px higher; the Italian footer is 23 px shorter (rank 187's legal links). | none: finish-brussels.txt HOLD |
| 201 | SWISS | /ch/en/homepage | 1440 | swiss-parity-010 | 4365 | 4299 | -1.51 % | Within 2 % against swiss-parity-010 (Chrome 4,299, the shell 4,318): the homepage's spread (order 36) | none |
| 202 | SWISS | /magazine/de | 1440 | swiss-parity-001 | 6975 | 6925 | -0.72 % | Within 1 %: order 37's footer rule. www's advertisement slots make up the rest. | fixed (order 37's rule) |
| 203 | Brussels | /be/en/articles | 390 | brussels-parity-003 | 7814 | 7920 | +1.36 % | The footer stands 103 px lower: the articles overview's end, as ranks 116, 121 and 123 | none |
| 204 | Brussels | /be/en/contact | 1440 | brussels-parity-006 | 1635 | 1652 | +1.04 % | The footer stands 19 px lower, in the one section | none |
| 205 | Group for Business | /de/en/about-us/lhg-history/lhg-history-booking | 390 | b2b-parity-007 | 4159 | 4226 | +1.61 % | The footer stands 70 px lower, in the page's one booking section (its 1440 width is +1.38 %, rank 164) | none |
| 206 | Discover | /de/de/homepage | 1440 | discover-parity-001 | 4260 | 4216 | -1.03 % | The footer stands 43 px higher | none: Discover is ema-test's |
| 207 | Group for Business | /ch/en/program/experts/airlines-at-a-glance/discover-airlines | 390 | b2b-parity-006 | 3460 | 3425 | -1.01 % | The footer stands 32 px higher | none |
| 208 | Discover | /de/de/my-bookings/services/additional-services | 1440 | discover-parity-001 | 4093 | 4052 | -1.00 % | The footer stands 41 px higher | none: Discover is ema-test's |
| 209 | Discover | /de/en/travel-inspiration/inspiration/destinations/santorini | 1440 | discover-parity-001 | 7656 | 7708 | +0.68 % | Within 1 % in Chrome | none: Discover is ema-test's |
