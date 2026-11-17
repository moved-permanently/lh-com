# Full Chrome against the headless shell (ema-lufthansa, standing order 40, item 3, 2026-11-17)

The publish child measures in full Chrome. My captures used the headless shell until order 39. Text can wrap a line differently between the two, so the same page can have different heights.

## Method

- **Coverage:** 365 of the brand sweep's 498 recorded page-widths (SWISS, Brussels, Discover, Group for Business) were captured in full Chrome (capture.js PARITY_CHROME=1, ~01:49 to 03:28 UTC, main as deployed, airline hosts refused per request). Each was compared with its newest headless-shell capture on disk (orders 35 to 39). The sweep was stopped at 365 for time; the other 133 are not covered yet.
- **Re-check:** the 23 page-widths that differed by more than 1 % were captured again in both engines, one after the other (~03:28 to 03:35 UTC).
- **Six of the 23 do not differ:**
  - four first Chrome loads were bad (the window's 900 or 844 px, an unsettled offers grid, a 4,664 px load of lhg-history-alliances);
  - two shell figures were older than a live row (checked-baggage be/fr and be/nl 1440, round 512). Both engines now give 3,958 and 3,968.
- **Seventeen differ by more than 1 % in both re-captures.** They are listed below; the "first" column is the sweep's pair.

## Result

- **Group for Business:** 11 page-widths. Chrome is longer in 10 (+1.04 to +2.10 %): its text wraps a line more in German and in the long fare and route pages. our-european-fares de/en at 1440 is the one where Chrome is shorter (-1.10 %).
- **Brussels:** 6 page-widths, Chrome shorter in all (-1.19 to -2.52 %). The legal notices at 390 and checked-baggage be/en 390 lose a line in Chrome.
- **Where the lists' verdict changes:**
  - Group for Business /de/de/about-us at 390 is exactly www's height in Chrome (3,497). The shell gave -2.06 % (HOLD in finish-b2b.txt, sweep-so30).
  - Brussels be/en checked-baggage 390 is -1.74 % in Chrome against +0.81 % in the shell.
- **Everything else in the 365:** the engines agree within 1 %.

| brand | page | width | recording | www px | headless shell | full Chrome | Chrome vs shell | first pair (shell / Chrome) |
|---|---|---|---|---|---|---|---|---|
| Brussels | /be/en/extra-services/baggage/checked-baggage | 390 | brussels-parity-011 | 4720 | 4758 (+0.81 %) | 4638 (-1.74 %) | -2.52 % | 4758 / 4638 |
| Group for Business | /de/de/about-us | 390 | b2b-parity-001 | 3497 | 3425 (-2.06 %) | 3497 (+0.00 %) | +2.10 % | 3425 / 3497 |
| Group for Business | /de/de/news/lhg-invoice-receipt-download | 1440 | b2b-parity-006 | 1504 | 1518 (+0.93 %) | 1542 (+2.53 %) | +1.58 % | 1518 / 1542 |
| Group for Business | /de/en/travel-solutions/our-european-fares | 390 | b2b-parity-007 | 12053 | 12166 (+0.94 %) | 12358 (+2.53 %) | +1.58 % | 12166 / 12358 |
| Group for Business | /de/de/travel-solutions/ndc | 1440 | b2b-parity-001 | 1693 | 1677 (-0.95 %) | 1701 (+0.47 %) | +1.43 % | 1677 / 1701 |
| Group for Business | /de/de/about-us/lhg-history | 1440 | b2b-parity-006 | 1748 | 1734 (-0.80 %) | 1758 (+0.57 %) | +1.38 % | 1734 / 1758 |
| Brussels | /be/en/articles/mini-holiday | 1440 | brussels-parity-010 | 3860 | 3886 (+0.67 %) | 3834 (-0.67 %) | -1.34 % | 3886 / 3834 |
| Group for Business | /de/en/program/experts/route-network/lufthansa/kuala-lumpur | 390 | b2b-parity-013 | 5588 | 5724 (+2.43 %) | 5800 (+3.79 %) | +1.33 % | 5724 / 5800 |
| Brussels | /be/en/legal-notices/us-traveling-with-disabilities | 390 | brussels-parity-007 | 1874 | 1847 (-1.44 %) | 1823 (-2.72 %) | -1.30 % | 1847 / 1823 |
| Brussels | /be/en/legal-notices | 390 | brussels-parity-007 | 1867 | 1867 (+0.00 %) | 1843 (-1.29 %) | -1.29 % | 1867 / 1843 |
| Brussels | /be/fr/legal-notices | 390 | brussels-parity-009 | 1971 | 1980 (+0.46 %) | 1956 (-0.76 %) | -1.21 % | 1980 / 1956 |
| Brussels | /be/fr/contact/feedback | 390 | brussels-parity-006 | 2049 | 2025 (-1.17 %) | 2001 (-2.34 %) | -1.19 % | 2025 / 2001 |
| Group for Business | /de/de/travel-management/hygiene-and-safety | 390 | b2b-parity-006 | 3170 | 3115 (-1.74 %) | 3151 (-0.60 %) | +1.16 % | 3115 / 3151 |
| Group for Business | /xx/de/travel-management/hygiene-and-safety | 390 | b2b-parity-006 | 3170 | 3115 (-1.74 %) | 3151 (-0.60 %) | +1.16 % | 3115 / 3151 |
| Group for Business | /de/en/news/lhg-invoice-receipt-download | 390 | b2b-parity-006 | 2142 | 2134 (-0.37 %) | 2158 (+0.75 %) | +1.12 % | 2134 / 2158 |
| Group for Business | /de/en/travel-solutions/our-european-fares | 1440 | b2b-parity-007 | 9102 | 9203 (+1.11 %) | 9102 (+0.00 %) | -1.10 % | 9203 / 9102 |
| Group for Business | /de/de/news/lhg-invoice-receipt-download | 390 | b2b-parity-006 | 2302 | 2315 (+0.56 %) | 2339 (+1.61 %) | +1.04 % | 2315 / 2339 |
