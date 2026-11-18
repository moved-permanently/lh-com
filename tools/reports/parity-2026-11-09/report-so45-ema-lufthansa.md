# ema-lufthansa: standing order 45 (2026-11-18, M at 40, the last keep rules)

About 17:20 to 21:50 UTC. Figures are in full Chrome, as served (or with the toggled theme value or draft rule in the same load), with airline hosts refused per request. Loads that came back at the 900 px viewport, at a wrong width or empty were measured again (13 in the M gates, 14 in the rule gates). Nothing was uploaded, previewed or published, and DA was read, never written.

## What is pushed

- **ea672c5d**: brussels.css and discover.css draw the M separator 40 px high (item 1); discover.css's intro view without its marks (item 2); ita.css's column-view H3 weight (item 3); delta-so45-discover-token-free and delta-so45-ita-token-free with their lists; tests m-separator-40-so45 and token-free-so45.
- **a46b6cf2**: THEMES.discover columnViews.oneElementViews removed, Discover's last keep rule (item 2). It went in at 21:13 UTC, after the two-hour windows of the other orders' style-markers.js commits: standing order 56 (7ccaff75, 17:17 UTC) and standing order 69 (9f86e8d2, 19:10 UTC). test/discover-one-element-views-so10 now checks that the collapse drops the marks.
- **This report.**

## 1. M at 40: Brussels and Discover adopt it, ITA HOLD

Method: every recorded page-width loaded once as served (M at 60), then with the brand's M separator at 40 px (a 41 px spacer, the 1 px included as styles.css does), then back. A load counts when all three settle and the back height equals the first. Rule: adopt 40 when the sum of |% off www| goes down and the median does not go up.

| brand | page-widths | with an M separator | moved | closer | > 0.5 points further | sum 60 -> 40 | median 60 -> 40 | result |
|---|---|---|---|---|---|---|---|---|
| Brussels | 208 | 56 | 55 | 31 | 18 | 393.96 -> 383.60 | 1.180 -> 0.990 | **adopted** (ea672c5d) |
| Discover | 54 | 14 | 10 | 6 | 2 | 358.64 -> 358.04 | 0.813 -> 0.813 | **adopted** (ea672c5d) |
| ITA | 80 | 14 | 8 | 2 | 1 | 95.02 -> 96.62 | 0.958 -> 0.980 | **HOLD**: the sum and the median both go up |

**Causes of the page-widths more than 0.5 points further.** For each M separator on them: the gap from the last line of text above it to the first line below it on our page (M at 60), and the gap between the same two texts in the www recording the newest height comes from (rendered offline, every other host refused). A gap over 150 px has a picture or block between the texts and is not measurable this way.

- **www about 60 there**: our gap within 10 px of www's. 7 separators: meals/bon (2 at 390, 3 at 1440), travel-comfortably-from-lille 1440 (1), be/fr connecting-africa 390 (1). There www does keep about our 60, and 40 is worse.
- **www smaller there**: our gap 15 px or more over www's. 22 separators: discover-warsaw, both connecting-africa pages, upgrades, short-notice-eu-us, local-page/offers, lille (2), our-payment-methods. There 40 is closer to www at the separator itself. The page height still moves further because these pages are short elsewhere, and the 60 px separator had made up for it.
- **Not measurable**: jobs/core-values, travel-classes/economy, be/fr my-bookings (a separator at the page end, no text after it), Discover's excess-baggage (our text-to-text gaps 36 and −24 px: its separators are not between those texts in the flow, and www's recording does not have the texts), ITA's fantasia-lounge (33 px ours, 117 www: the separator is not between those texts in the flow).

So the order's expected cause, www itself using 60 there, holds for 7 of the 29 measurable separators on these pages. For the other 22, the page total is the wrong measure: 40 is closer at the spot.

**Brussels page endings (order 44 item 1) with M at 40.** None of the three documents has an M separator, so M at 40 leaves them where they were. Re-gated with M at 40 in the base, the hub ending (A) still takes 12 page-widths more than 0.5 points further, against 16 in order 44. The sidebar-h1 accordion ending (B) still takes 9, against 10. M at 40 does not change which ending passes: neither does, and both stay HOLD. dsar-start and rebooking-request-birthright no longer move under B (order 44's load noise there: the form's late Turnstile box).

### The M tables

**Brussels.** 208 page-widths; with an M separator 56; moved 55 (31 closer); sum of |% off www| M 60 393.96, M 40 383.60 (-10.36); median 1.180 -> 0.990.

| page | width | M separators | height at 60 -> 40 | www | % off at 60 -> 40 | verdict | gaps ours at 60 / www (px, text to text) | cause |
|---|---|---|---|---|---|---|---|---|
| /be/en/articles/discover-warsaw | 390 | 3 | 6,334 -> 6,274 | 6,338 | 0.06 -> 1.01 | **> 0.5 further** | 377/170, 91/59, 99/70 | not measurable 1, www smaller there 2 |
| /be/en/articles/discover-warsaw | 1440 | 3 | 8,159 -> 8,099 | 8,194 | 0.43 -> 1.16 | **> 0.5 further** | 774/174, 95/59, 103/70 | not measurable 1, www smaller there 2 |
| /be/en/articles/the-gambia | 390 | 1 | 13,161 -> 13,141 | 13,059 | 0.78 -> 0.63 | closer |  |  |
| /be/en/articles/the-gambia | 1440 | 1 | 8,993 -> 8,973 | 9,055 | 0.68 -> 0.91 | further, within 0.5 |  |  |
| /be/en/book-a-flight/connecting-africa | 390 | 2 | 7,515 -> 7,475 | 7,454 | 0.82 -> 0.28 | closer |  |  |
| /be/en/book-a-flight/connecting-africa | 1440 | 2 | 3,948 -> 3,908 | 3,980 | 0.8 -> 1.81 | **> 0.5 further** | 77/57, 78/57 | www smaller there 2 |
| /be/en/extra-services/baggage/checked-baggage | 390 | 3 | 4,778 -> 4,718 | 4,720 | 1.23 -> 0.04 | closer |  |  |
| /be/en/extra-services/baggage/checked-baggage | 1440 | 3 | 4,047 -> 3,987 | 3,938 | 2.77 -> 1.24 | closer |  |  |
| /be/en/extra-services/meals/bon | 390 | 8 | 6,904 -> 6,744 | 6,886 | 0.26 -> 2.06 | **> 0.5 further** | 457/189, 457/189, 82/79, 291/135, 82/79, 291/135, 272/105, None/None | not measurable 6, www about 60 2 |
| /be/en/extra-services/meals/bon | 1440 | 8 | 4,810 -> 4,690 | 4,821 | 0.23 -> 2.72 | **> 0.5 further** | 1036/189, 1036/189, 86/79, 169/79, 87/79, 86/79, 191/98, None/None | not measurable 5, www about 60 3 |
| /be/en/extra-services/upgrades | 390 | 2 | 6,668 -> 6,628 | 6,649 | 0.29 -> 0.32 | further, within 0.5 |  |  |
| /be/en/extra-services/upgrades | 1440 | 2 | 3,967 -> 3,927 | 3,957 | 0.25 -> 0.76 | **> 0.5 further** | 91/27, 91/27 | www smaller there 2 |
| /be/en/jobs/core-values | 390 | 3 | 4,626 -> 4,606 | 4,527 | 2.19 -> 1.75 | closer |  |  |
| /be/en/jobs/core-values | 1440 | 3 | 3,053 -> 2,993 | 3,068 | 0.49 -> 2.44 | **> 0.5 further** | 179/113, 406/200, None/None | not measurable 3 |
| /be/en/jobs/mpl-cadet-program | 390 | 1 | 10,096 -> 10,076 | 9,951 | 1.46 -> 1.26 | closer |  |  |
| /be/en/jobs/mpl-cadet-program | 1440 | 1 | 6,873 -> 6,853 | 6,842 | 0.45 -> 0.16 | closer |  |  |
| /be/en/legal-notices/privacy-notice-applicants | 390 | 6 | 5,702 -> 5,582 | 5,577 | 2.24 -> 0.09 | closer |  |  |
| /be/en/legal-notices/privacy-notice-applicants | 1440 | 6 | 3,422 -> 3,302 | 3,331 | 2.73 -> 0.87 | closer |  |  |
| /be/en/legal-notices/short-notice-eu-us | 390 | 1 | 3,031 -> 3,011 | 3,064 | 1.08 -> 1.73 | **> 0.5 further** | 74/53 | www smaller there 1 |
| /be/en/legal-notices/short-notice-eu-us | 1440 | 1 | 1,927 -> 1,907 | 1,956 | 1.48 -> 2.51 | **> 0.5 further** | 78/61 | www smaller there 1 |
| /be/en/local-page/chase-the-sun-across-spain | 390 | 4 | 9,243 -> 9,163 | 8,991 | 2.8 -> 1.91 | closer |  |  |
| /be/en/local-page/chase-the-sun-across-spain | 1440 | 4 | 5,335 -> 5,255 | 5,225 | 2.11 -> 0.57 | closer |  |  |
| /be/en/local-page/offers | 390 | 2 | 5,922 -> 5,882 | 6,236 | 5.04 -> 5.68 | **> 0.5 further** | 126/38, 138/40 | www smaller there 2 |
| /be/en/local-page/offers | 1440 | 2 | 4,326 -> 4,286 | 4,630 | 6.57 -> 7.43 | **> 0.5 further** | 146/42, 157/40 | www smaller there 1, not measurable 1 |
| /be/en/local-page/student-fares | 390 | 2 | 7,760 -> 7,720 | 7,722 | 0.49 -> 0.03 | closer |  |  |
| /be/en/local-page/student-fares | 1440 | 2 | 5,222 -> 5,182 | 5,153 | 1.34 -> 0.56 | closer |  |  |
| /be/en/our-company/organisation | 390 | 2 | 5,288 -> 5,248 | 5,224 | 1.23 -> 0.46 | closer |  |  |
| /be/en/our-company/organisation | 1440 | 2 | 3,340 -> 3,300 | 3,299 | 1.24 -> 0.03 | closer |  |  |
| /be/en/travel-classes/economy | 390 | 1 | 4,972 -> 4,952 | 5,073 | 1.99 -> 2.39 | further, within 0.5 |  |  |
| /be/en/travel-classes/economy | 1440 | 1 | 3,109 -> 3,089 | 3,186 | 2.42 -> 3.04 | **> 0.5 further** | 412/2 | not measurable 1 |
| /be/en/travel-comfortably-from-lille | 390 | 3 | 5,263 -> 5,203 | 5,184 | 1.52 -> 0.37 | closer |  |  |
| /be/en/travel-comfortably-from-lille | 1440 | 3 | 3,140 -> 3,080 | 3,130 | 0.32 -> 1.6 | **> 0.5 further** | 78/47, 78/47, 111/105 | www smaller there 2, www about 60 1 |
| /be/fr/book-a-flight/connecting-africa | 390 | 2 | 7,834 -> 7,794 | 7,872 | 0.48 -> 0.99 | **> 0.5 further** | 73/67, 74/37 | www about 60 1, www smaller there 1 |
| /be/fr/book-a-flight/connecting-africa | 1440 | 2 | 4,069 -> 4,029 | 4,106 | 0.9 -> 1.88 | **> 0.5 further** | 77/57, 78/57 | www smaller there 2 |
| /be/fr/book-a-flight/our-payment-methods | 390 | 2 | 4,501 -> 4,461 | 5,393 | 16.54 -> 17.28 | **> 0.5 further** | 73/1284, 74/37 | not measurable 1, www smaller there 1 |
| /be/fr/book-a-flight/our-payment-methods | 1440 | 2 | 2,825 -> 2,785 | 3,752 | 24.71 -> 25.77 | **> 0.5 further** | 77/1073, 78/37 | not measurable 1, www smaller there 1 |
| /be/fr/extra-services/baggage/checked-baggage | 390 | 3 | 5,170 -> 5,110 | 5,131 | 0.76 -> 0.41 | closer |  |  |
| /be/fr/extra-services/baggage/checked-baggage | 1440 | 3 | 4,084 -> 4,024 | 4,016 | 1.69 -> 0.2 | closer |  |  |
| /be/fr/extra-services/upgrades | 390 | 2 | 7,239 -> 7,199 | 7,185 | 0.75 -> 0.19 | closer |  |  |
| /be/fr/extra-services/upgrades | 1440 | 2 | 4,148 -> 4,108 | 4,136 | 0.29 -> 0.68 | further, within 0.5 |  |  |
| /be/fr/my-bookings | 1440 | 1 | 1,517 -> 1,497 | 1,521 | 0.26 -> 1.58 | **> 0.5 further** | None/None | not measurable 1 |
| /be/fr/our-company | 390 | 7 | 10,456 -> 10,316 | 9,803 | 6.66 -> 5.23 | closer |  |  |
| /be/fr/our-company | 1440 | 7 | 6,245 -> 6,105 | 6,004 | 4.01 -> 1.68 | closer |  |  |
| /be/fr/travel-classes/business | 390 | 2 | 8,870 -> 8,830 | 8,976 | 1.18 -> 1.63 | further, within 0.5 |  |  |
| /be/fr/travel-classes/business | 1440 | 2 | 6,472 -> 6,432 | 6,458 | 0.22 -> 0.4 | further, within 0.5 |  |  |
| /be/fr/travel-classes/premium-economy | 390 | 1 | 6,276 -> 6,256 | 6,224 | 0.84 -> 0.51 | closer |  |  |
| /be/fr/travel-classes/premium-economy | 1440 | 1 | 4,663 -> 4,643 | 4,620 | 0.93 -> 0.5 | closer |  |  |
| /be/nl/extra-services/baggage/checked-baggage | 390 | 3 | 4,984 -> 4,924 | 4,902 | 1.67 -> 0.45 | closer |  |  |
| /be/nl/extra-services/baggage/checked-baggage | 1440 | 3 | 4,060 -> 4,000 | 3,992 | 1.7 -> 0.2 | closer |  |  |
| /de/de/extra-services/baggage/checked-baggage | 390 | 3 | 5,008 -> 4,948 | 4,969 | 0.78 -> 0.42 | closer |  |  |
| /de/de/extra-services/baggage/checked-baggage | 1440 | 3 | 4,060 -> 4,000 | 3,992 | 1.7 -> 0.2 | closer |  |  |
| /es/es/extra-services/baggage/checked-baggage | 390 | 3 | 4,977 -> 4,917 | 4,919 | 1.18 -> 0.04 | closer |  |  |
| /es/es/extra-services/baggage/checked-baggage | 1440 | 3 | 4,084 -> 4,024 | 4,016 | 1.69 -> 0.2 | closer |  |  |
| /it/it/extra-services/baggage/checked-baggage | 390 | 3 | 4,953 -> 4,893 | 4,914 | 0.79 -> 0.43 | closer |  |  |
| /it/it/extra-services/baggage/checked-baggage | 1440 | 3 | 4,084 -> 4,024 | 4,016 | 1.69 -> 0.2 | closer |  |  |

Order 44 item 1's three page-end documents with M at 60 and at 40 (none has an M separator, so M at 40 leaves them where they were):

| page | width | at 60 | at 40 | www |
|---|---|---|---|---|
| /be/en/check-in-options-and-info?country=BE&language=EN | 390 | 2,986 | 2,986 | 3,132 |
| /be/en/check-in-options-and-info?country=BE&language=EN | 1440 | 1,570 | 1,570 | 1,597 |
| /be/fr/check-in-options-and-info?country=BE&language=FR | 390 | 3,045 | 3,045 | 3,129 |
| /be/fr/check-in-options-and-info?country=BE&language=FR | 1440 | 1,684 | 1,684 | 1,708 |
| /be/en/legal-notices/us-traveling-with-disabilities | 390 | 1,823 | 1,823 | 1,874 |
| /be/en/legal-notices/us-traveling-with-disabilities | 1440 | 1,280 | 1,280 | 1,317 |

Both ending rules re-gated with M at 40 in the base (the page-widths each moved in order 44, the rule toggled in the same load): A, the hub ending, 14 closer, 12 more than 0.5 points further (order 44: 10 and 16); B, the sidebar-h1 accordion ending, 9 closer, 2 within 0.5, 9 further, 2 unchanged (order 44: 10, 2 and 10). M at 40 does not change which ending passes: neither does.

**Discover.** 54 page-widths; with an M separator 14; moved 10 (6 closer); sum of |% off www| M 60 358.64, M 40 358.04 (-0.60); median 0.813 -> 0.813.

| page | width | M separators | height at 60 -> 40 | www | % off at 60 -> 40 | verdict | gaps ours at 60 / www (px, text to text) | cause |
|---|---|---|---|---|---|---|---|---|
| /de/de/discover/travel-classes/business-class | 1440 | 2 | 4,244 -> 4,224 | 4,203 | 0.98 -> 0.5 | closer |  |  |
| /de/de/homepage | 390 | 1 | 5,644 -> 5,624 | 5,550 | 1.69 -> 1.33 | closer |  |  |
| /de/de/homepage | 1440 | 1 | 4,200 -> 4,180 | 4,260 | 1.41 -> 1.88 | further, within 0.5 |  |  |
| /de/de/my-bookings/check-in | 1440 | 1 | 2,416 -> 2,396 | 2,335 | 3.47 -> 2.61 | closer |  |  |
| /de/en/book/baggage/excess-baggage | 390 | 3 | 2,479 -> 2,459 | 2,487 | 0.32 -> 1.13 | **> 0.5 further** | 36/None, 36/None, 300/96 | not measurable 3 |
| /de/en/book/baggage/excess-baggage | 1440 | 3 | 2,669 -> 2,649 | 2,701 | 1.18 -> 1.93 | **> 0.5 further** | -24/None, -24/None, 455/111 | not measurable 3 |
| /de/en/discover/travel-classes/business-class | 1440 | 2 | 4,247 -> 4,227 | 4,233 | 0.33 -> 0.14 | closer |  |  |
| /de/en/homepage | 390 | 1 | 5,670 -> 5,650 | 5,648 | 0.39 -> 0.04 | closer |  |  |
| /de/en/homepage | 1440 | 1 | 4,196 -> 4,176 | 4,285 | 2.08 -> 2.54 | further, within 0.5 |  |  |
| /de/en/my-bookings/check-in | 1440 | 1 | 2,454 -> 2,434 | 2,373 | 3.41 -> 2.57 | closer |  |  |

**ITA.** 80 page-widths; with an M separator 14; moved 8 (2 closer); sum of |% off www| M 60 95.02, M 40 96.62 (+1.61); median 0.958 -> 0.980.

| page | width | M separators | height at 60 -> 40 | www | % off at 60 -> 40 | verdict | gaps ours at 60 / www (px, text to text) | cause |
|---|---|---|---|---|---|---|---|---|
| /it/en/book-and-prepare/other-requests/travelling-with-pets/pets-in-cabin | 1440 | 1 | 4,707 -> 4,687 | 4,693 | 0.3 -> 0.13 | closer |  |  |
| /it/en/book-and-prepare/travel-information/at-the-airport/group-boarding | 1440 | 1 | 4,854 -> 4,834 | 4,911 | 1.16 -> 1.57 | further, within 0.5 |  |  |
| /it/en/book-and-prepare/travel-information/at-the-airport/lounges/fantasia-lounge | 1440 | 1 | 3,749 -> 3,729 | 3,759 | 0.27 -> 0.8 | **> 0.5 further** | 33/117 | between 1 |
| /it/en/book-and-prepare/travel-information/baggage/electronic-devices-and-batteries | 390 | 2 | 8,273 -> 8,233 | 8,270 | 0.04 -> 0.45 | further, within 0.5 |  |  |
| /it/en/book-and-prepare/travel-information/baggage/electronic-devices-and-batteries | 1440 | 2 | 5,229 -> 5,189 | 5,211 | 0.35 -> 0.42 | further, within 0.5 |  |  |
| /it/en/book-and-prepare/travel-information/entry-regulations/entry-regulations-schengen/entry-exit-system | 390 | 2 | 9,228 -> 9,188 | 9,309 | 0.87 -> 1.3 | further, within 0.5 |  |  |
| /it/en/world-of-ita-airways/discover-ita-airways/network | 390 | 1 | 5,774 -> 5,754 | 5,517 | 4.66 -> 4.3 | closer |  |  |
| /it/en/world-of-ita-airways/discover-ita-airways/network | 1440 | 1 | 3,562 -> 3,542 | 3,557 | 0.14 -> 0.42 | further, within 0.5 |  |  |

## 2. Discover: the last keep rule and order 44's held H2s

- **oneElementViews (additional-services' intro view)**: the carrier is discover.css. The paragraph right after the H1, the last of its text, followed by a card grid in the same section or at the start of the next, gets www's one-paragraph view: the section padding above and below, no margin under it, the cards right under it on phones and 40 px under it from 768.
  - A first draft without the card condition also matched excess-baggage (intro followed by tabs) and took it from −1.18 to +1.78 % at 1440, so the condition stays.
  - Gate on all 54 recorded Discover page-widths: all unchanged.
  - The drafts without the marks render exactly as served: de/de 4,511 / 4,052, de/en 4,402 / 3,672 (390 / 1440).
  - The marked rule (discover.css, standing order 10) stays: it draws any copy that still has the marks.
  - THEMES.discover columnViews.oneElementViews is gone (a46b6cf2), so the collapse now drops the view's marks like any other's. The 14 import bundles inline THEMES and still carry the old entry until their next rebuild (standing order 56 rebuilt them at 17:17 UTC; theirs to rebuild). Until then a Discover import run from a bundle would keep the two marks, which discover.css still draws.
- **santorini and check-in (order 44's HOLD rows)**: the carriers already on main. A block whose H2s are all marked gets the block option title-compact; a section whose own H2s are all marked gets the section style h2-compact (added to its Section Metadata, or a Section Metadata block of its own). Renders: heights equal at both widths on all four documents.

READY (delta-so45-discover-token-free, checked against DA's copies read at about 18:26 to 18:28 UTC: applied once, no token left, the revert byte for byte):

| status | page | rows | height served -> with the rows (1440 / 390) |
|---|---|---|---|
| READY | /de/de/my-bookings/check-in | 2: 1 H2 marker removed, carrier title-compact | 2,396 -> 2,396 / 3,003 -> 3,003 |
| READY | /de/en/my-bookings/check-in | 2: 1 H2 marker removed, carrier title-compact | 2,434 -> 2,434 / 3,207 -> 3,207 |
| READY | /de/de/travel-inspiration/inspiration/destinations/santorini | 6: 4 H2 markers removed, carriers title-compact and h2-compact | 7,742 -> 7,742 / 9,299 -> 9,299 |
| READY | /de/en/travel-inspiration/inspiration/destinations/santorini | 6: 4 H2 markers removed, carriers title-compact and h2-compact | 7,708 -> 7,708 / 9,120 -> 9,120 |
| READY | /de/de/my-bookings/services/additional-services | 1: the intro view's marks removed | 4,052 -> 4,052 / 4,511 -> 4,511 |
| READY | /de/en/my-bookings/services/additional-services | 1: the intro view's marks removed | 3,672 -> 3,672 / 4,402 -> 4,402 |

Order: the intro rows only once ea672c5d is on main (it is). The H2 rows any time. With the intro rows applied, a re-import writes the intro without marks (a46b6cf2). On santorini, the render's "lost words" check names Style and h2-compact: the new Section Metadata cell, not page text.

The heights above were rendered again at 19:40 UTC on the pages as served after ea672c5d (with M at 40), and the list was corrected in a46b6cf2. The first renders had used served copies saved during order 44, from before order 44's rows (check-in 2,351 / 2,990 then, 2,396 / 3,003 now). The rows themselves were always built from DA's current copies, and they are unchanged. All six were applied by your job (625da4b7, 19:40 UTC: uploaded and previewed, not published). Measured as served at 19:55 UTC, all six match the drafts at both widths (12 of 12 heights; one H1, nothing lost or broken, no overflow).

## 3. ITA: keepSizesIn's last trace, ita-airways-app's five H3s

THEMES.ita keepSizesIn went in order 44. DA's copy of the app page (read about 18:00 UTC) still marks five feature H3s " {heading-small}".

- **Probed as served**: the marked and unmarked H3s have the same size (28 px at 1440, 22 at 390: Columns Media's rule for an unmarked H3 already gives heading-small's size) and the same margins. Only the weight differs: 700 with the marker (ITA draws its headings bold, --heading-light-weight), 300 without (columns-media.css's lufthansa.com value).
- **Carrier, not a near value**: ita.css gives an unmarked H3 that opens a column view's text ITA's bold weight. A first draft that set only the size and line height changed nothing; they were already those values.
- **Gate on all 80 recorded ITA page-widths**: 79 unchanged. seats-selection-economy 390 is within 0.5 points (1.37 -> 1.76 %): its six seat headings turn bold, as www's (heading-copytext-large) are, and one wraps a line further.
- **Render without the markers and with the rule**: as served at both widths (5,247 / 4,009), the H3s 28 / 22 px bold.

READY (delta-so45-ita-token-free, against DA's copy: applied, no token left, the revert byte for byte):

| status | page | rows | height served -> with the rows (1440 / 390) |
|---|---|---|---|
| READY | /it/en/world-of-ita-airways/discover-ita-airways/ita-airways-app | 5: 5 x {heading-small}</h3> removed | 4,009 -> 4,009 / 5,247 -> 5,247 |

Order: only once ea672c5d is on main (it is). Until then the five H3s would render light. Applied by your job publish-so45-ita-token-free-01 (014eedea, 19:37 UTC): DA's copy now has no marks, and the page as served renders as drafted (5,247 / 4,009, the five H3s 22 / 28 px bold).

## Held, with figures

- **ITA M at 40**: sum 95.02 -> 96.62, median 0.958 -> 0.980; ITA keeps M at 60.
- **Brussels page endings A and B** (with M at 40 too): A takes 12 page-widths more than 0.5 points further, B 9.
- Nothing else is held: every row in this order is READY.

## Checks

npm run lint (exit 0) before each push, stylelint on the three themes, the folder-reading tests and the full suite: ea672c5d: npm run lint exit 0 (before the push and after each rebase), stylelint exit 0 on the three themes, the full suite 4,816 pass / 0 fail and 4,820 / 0 after the rebase, the GitHub Build green, the smoke after the push with no code difference (two search indexes and one sitemap differ: content data). a46b6cf2: lint exit 0 before and after the rebase, the full suite 4,827 / 0, Build, test and deploy green, the smoke 0 differ on every host. The full suite includes the folder-reading tests. This report: see its commit.
