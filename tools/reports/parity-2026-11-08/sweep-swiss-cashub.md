# The brief after 510: SWISS against the recordings (ema-cashub)

The published pages of lh-swiss on swiss.turnsthe.page against the www.swiss.com pages recorded in brief 497 (the swiss-parity-001 /
-002a / -002b archives), offline, at 1440 and 390 px: the page height, worst first by the larger difference.

- **Published:** 67414 pages in the site's 227 sitemaps (every market's copies).
- **Recorded:** 84 pages. 74 are in the sitemaps; the other 10 (magazine pages) are not
  in a sitemap but answer 200 on swiss.turnsthe.page, so they are ranked too.
- **Not recorded:** 67340 published pages, 3192 language documents, of which 3120 have no recorded copy in
  any market: listed in `swiss-unrecorded.txt`, not guessed.
- **Ours:** captured on swiss.turnsthe.page (the published pages). After values (→): a local dev server with this tree (lh-swiss's
  preview content, equal to the published pages before the change) for the 19 pages with picture-and-text rows.
- **Hosts:** swiss.turnsthe.page, localhost. No request went to www.swiss.com.

84 pages; 57 at 2 % or more, 30 at 5 % or more (before the row fix).

## Fixed

| Commit | Row | Pages | 1440 | 390 |
| --- | --- | --- | --- | --- |
| `47272dc8` | picture-and-text rows: a row's next heading 48 px under it, 64 px from 1025 px (swiss.css) | the 19 recorded pages with such rows | mean \|diff\| 3.80 → 2.45 % | 2.89 → 2.17 % |

The other high rows are live data, a link-out widget, third-party ads, the homepage import's conditions text (ema-lufthansa) and
single pages without a shared cause. Their causes and owners are listed below.

## The ranking

| Rank | Path | 1440 www / ours | 390 www / ours | Cause | Owner |
| --- | --- | --- | --- | --- | --- |
| 1 | /ch/en/offers | 32383 / 10047 (-69.0 %) | 31952 / 16508 (-48.3 %) | live data: www's offers finder (a fares grid of 150 to 312 pictures), ours the static page | not a layout cause |
| 2 | /ch/de/book-and-manage/pax-receipt | 2234 / 1704 (-23.7 %) | 2402 / 1761 (-26.7 %) | widget: www's booking-details form (about 600 px), ours a link to it on www (link-out by design) | none (by design) |
| 3 | /magazine/de/inside-swiss/behind-the-scenes/a350-special-livery | 6860 / 6619 (-3.5 %) | 7834 / 6703 (-14.4 %) | phones: www's advertisement slots (about 300 px each, between the sections), ours none; 1440 within 7 % | none (third-party ads) |
| 4 | /magazine/de | 6975 / 6901 (-1.1 %) | 10414 / 8967 (-13.9 %) | phones: www's advertisement slots (about 300 px each, between the sections), ours none; 1440 within 7 % | none (third-party ads) |
| 5 | /magazine/en/inside-swiss/behind-the-scenes/a350-special-livery | 6925 / 6738 (-2.7 %) | 7936 / 6844 (-13.8 %) | phones: www's advertisement slots (about 300 px each, between the sections), ours none; 1440 within 7 % | none (third-party ads) |
| 6 | /magazine/en | 7022 / 6864 (-2.3 %) | 10381 / 8967 (-13.6 %) | phones: www's advertisement slots (about 300 px each, between the sections), ours none; 1440 within 7 % | none (third-party ads) |
| 7 | /magazine/en/travel/destinations/hello-boston | 7467 / 6955 (-6.9 %) | 6809 / 5921 (-13.0 %) | phones: www's advertisement slots (about 300 px each, between the sections), ours none; 1440 within 7 % | none (third-party ads) |
| 8 | /magazine/en/travel | 6845 / 6810 (-0.5 %) | 9990 / 8793 (-12.0 %) | phones: www's advertisement slots (about 300 px each, between the sections), ours none; 1440 within 7 % | none (third-party ads) |
| 9 | /magazine/de/inside-swiss | 7068 / 7013 (-0.8 %) | 10413 / 9189 (-11.8 %) | phones: www's advertisement slots (about 300 px each, between the sections), ours none; 1440 within 7 % | none (third-party ads) |
| 10 | /de/de/homepage | 4480 / 4446 (-0.8 %) | 5196 / 5683 (+9.4 %) | the fares' disclaimer and conditions as 612 px of page text after the destination finder (www: only in the fares widget's dialog; the parser already copies them into the block's Conditions row) | swiss-import.mjs / the homepage import (ema-lufthansa): drop the conditions dialog's source after the destination-finder parser has taken it |
| 11 | /ch/de/culinaryjourney | 1277 / 1251 (-2.0 %) | 1396 / 1521 (+9.0 %) | the culinary hub micro-frontend (mfe) | not investigated (an app) |
| 12 | /us/en/homepage | 4467 / 4260 (-4.6 %) | 4920 / 5310 (+7.9 %) | as /de/de/homepage (the conditions text after the destination finder) | swiss-import.mjs (ema-lufthansa) |
| 13 | /ch/de/book-and-manage/partner-offers/travel-insurances | 2272 / 2392 (+5.3 %) | 2092 / 2254 (+7.7 %) | 390: +93 px before "Versicherungsbedingungen" (the intro and the partner box) | not investigated further (one page) |
| 14 | /magazine/de/inside-swiss/behind-the-scenes/up-front-and-flying-high | 11771 / 12672 (+7.7 %) | 14310 / 13486 (-5.8 %) | phones: www's advertisement slots (about 300 px each, between the sections), ours none; 1440 within 7 % | none (third-party ads) |
| 15 | /ch/de/fly/check-in/online-check-in | 3728 / 3446 (-7.6 %) → 3486 (-6.5 %) | 5567 / 5475 (-1.7 %) → 5499 (-1.2 %) | picture-and-text rows: the next heading 24 px under a row, www 48 / 65 px (fixed, 47272dc8; after values →) | swiss.css (fixed) |
| 16 | /ch/en/fly/on-board/travel-classes/swiss-premium-economy | 4120 / 3806 (-7.6 %) → 4032 (-2.1 %) | 7682 / 7234 (-5.8 %) → 7402 (-3.6 %) | picture-and-text rows: the next heading 24 px under a row, www 48 / 65 px (fixed, 47272dc8; after values →) | swiss.css (fixed) |
| 17 | /ch/de/fly/on-board/entertainment-on-board | 2554 / 2470 (-3.3 %) | 2837 / 2625 (-7.5 %) | 390: -50 px before "Let SWISS entertain you", then the media rows (no heading jump) | not investigated further |
| 18 | /ch/de/prepare/travel-regulations | 1547 / 1446 (-6.5 %) | 2696 / 2686 (-0.4 %) | 1440: below the h1 (-76 px to the footer; the travel-regulations widget) | not investigated further |
| 19 | /ch/en/prepare/special-care/health-and-travel | 3150 / 2946 (-6.5 %) | 4873 / 4732 (-2.9 %) | 1440: -24 px per section (the aside's boxes) | not investigated further |
| 20 | /ch/en/book-and-manage/swiss-choice/upgrade-options | 2888 / 2702 (-6.4 %) → 2822 (-2.3 %) | 3904 / 3651 (-6.5 %) → 3723 (-4.6 %) | the intro: www's p.copytext-large (18 / 30 px, 834 px wide), ours a plain paragraph (on 2 of the 69 recorded pages: a per-page style, no theme default); and the rows (fixed) | the intro: ema-test (token-free carriers) / swiss-import.mjs; rows: fixed |
| 21 | /ch/de/fly/on-board/swiss-business | 4655 / 4364 (-6.3 %) → 4724 (+1.5 %) | 6821 / 6465 (-5.2 %) → 6681 (-2.1 %) | picture-and-text rows: the next heading 24 px under a row, www 48 / 65 px (fixed, 47272dc8; after values →) | swiss.css (fixed) |
| 22 | /magazine/en/switzerland/discover-switzerland/jungfrau-region | 14025 / 14283 (+1.8 %) | 13014 / 12233 (-6.0 %) | phones: www's advertisement slots (about 300 px each, between the sections), ours none; 1440 within 7 % | none (third-party ads) |
| 23 | /ch/en/fly/on-board/green-fare | 6240 / 5869 (-5.9 %) | 7481 / 7598 (+1.6 %) | not investigated | - |
| 24 | /ch/de/fly/on-board/swiss-economy | 3989 / 3766 (-5.6 %) → 4006 (+0.4 %) | 6755 / 6552 (-3.0 %) → 6696 (-0.9 %) | picture-and-text rows: the next heading 24 px under a row, www 48 / 65 px (fixed, 47272dc8; after values →) | swiss.css (fixed) |
| 25 | /ch/en/book-and-manage/partner-offers/swiss-airrail | 6269 / 6609 (+5.4 %) → 6649 (+6.1 %) | 9662 / 9999 (+3.5 %) → 10047 (+4.0 %) | picture-and-text rows (the row rule applies; after values →) | swiss.css |
| 26 | /ch/en/fly/flight-information/mobile-apps | 2152 / 2081 (-3.3 %) | 2643 / 2500 (-5.4 %) | not investigated | - |
| 27 | /ch/en/customer-support/feedback | 1855 / 1927 (+3.9 %) | 2167 / 2281 (+5.3 %) | not investigated | - |
| 28 | /magazine/de/inside-swiss/behind-the-scenes/swiss-behind-the-wings | 19390 / 19842 (+2.3 %) | 20171 / 19129 (-5.2 %) | phones: www's advertisement slots (about 300 px each, between the sections), ours none; 1440 within 7 % | none (third-party ads) |
| 29 | /ch/en/discover/fleet | 1635 / 1550 (-5.2 %) | 2040 / 1949 (-4.5 %) | not investigated | - |
| 30 | /ch/de/prepare/special-care/children-travelling/unaccompanied-minors | 3414 / 3242 (-5.0 %) | 4483 / 4501 (+0.4 %) | not investigated | - |
| 31 | /ch/de/terms-conditions/imprint | 2196 / 2272 (+3.5 %) | 2134 / 2239 (+4.9 %) | not investigated | - |
| 32 | /ch/en/book-and-manage/offers/miles-and-more | 3427 / 3489 (+1.8 %) → 3553 (+3.7 %) | 5194 / 4957 (-4.6 %) → 5005 (-3.6 %) | picture-and-text rows (the row rule applies; after values →) | swiss.css |
| 33 | /ch/de/fly/on-board/internet-overview | 3085 / 3117 (+1.0 %) | 3961 / 4137 (+4.4 %) | picture-and-text rows (the row rule applies; after values →) | swiss.css |
| 34 | /ch/en/homepage | 4412 / 4231 (-4.1 %) | 5010 / 5224 (+4.3 %) | as /de/de/homepage; +201 px before "Current topics" (the market's promotions, brief 505) | swiss-import.mjs (ema-lufthansa) |
| 35 | /ch/de/homepage | 4480 / 4297 (-4.1 %) | 5141 / 5278 (+2.7 %) | as /ch/en/homepage | swiss-import.mjs (ema-lufthansa) |
| 36 | /ch/en/book-and-manage/rebook | 1792 / 1719 (-4.1 %) → 1759 (-1.8 %) | 2064 / 2059 (-0.2 %) → 2083 (+0.9 %) | picture-and-text rows: the next heading 24 px under a row, www 48 / 65 px (fixed, 47272dc8; after values →) | swiss.css (fixed) |
| 37 | /ch/en/book-and-manage/offers/vouchers | 3328 / 3400 (+2.2 %) | 4189 / 4356 (+4.0 %) | not investigated | - |
| 38 | /ch/de/fly/on-board/swiss-first | 4322 / 4155 (-3.9 %) → 4238 (-1.9 %) | 8116 / 7849 (-3.3 %) → 8017 (-1.2 %) | picture-and-text rows: the next heading 24 px under a row, www 48 / 65 px (fixed, 47272dc8; after values →) | swiss.css (fixed) |
| 39 | /ch/en/book-and-manage/swiss-choice/advance-seat-reservation | 7124 / 6850 (-3.8 %) → 6890 (-3.3 %) | 9348 / 9357 (+0.1 %) → 9381 (+0.4 %) | picture-and-text rows: the next heading 24 px under a row, www 48 / 65 px (fixed, 47272dc8; after values →) | swiss.css (fixed) |
| 40 | /ch/en/prepare/special-care/animals-travelling | 5121 / 4988 (-2.6 %) | 7771 / 7482 (-3.7 %) | not investigated | - |
| 41 | /ch/de/book-and-manage/swiss-choice/additional-bag | 2387 / 2300 (-3.6 %) | 2816 / 2732 (-3.0 %) | not investigated | - |
| 42 | /ch/de/discover/new-destinations | 6070 / 6281 (+3.5 %) | 5676 / 5772 (+1.7 %) | not investigated | - |
| 43 | /ch/en/customer-support/faq | 2739 / 2834 (+3.5 %) | 5343 / 5371 (+0.5 %) | not investigated | - |
| 44 | /ch/en/fly/on-board/food-and-beverage | 4473 / 4317 (-3.5 %) → 4477 (+0.1 %) | 6747 / 6679 (-1.0 %) → 6775 (+0.4 %) | picture-and-text rows: the next heading 24 px under a row, www 48 / 65 px (fixed, 47272dc8; after values →) | swiss.css (fixed) |
| 45 | /ch/de/terms-conditions | 1818 / 1843 (+1.4 %) | 3147 / 3256 (+3.5 %) | not investigated | - |
| 46 | /ch/en/discover/swiss-recraft-collection | 4053 / 4191 (+3.4 %) | 5441 / 5355 (-1.6 %) | picture-and-text rows (the row rule applies; after values →) | swiss.css |
| 47 | /ch/en/customer-support/faq/payment-options | 2365 / 2288 (-3.3 %) | 1990 / 1956 (-1.7 %) | not investigated | - |
| 48 | /ch/de/customer-support/newsletter | 2015 / 2078 (+3.1 %) | 2176 / 2221 (+2.1 %) | picture-and-text rows (the row rule applies; after values →) | swiss.css |
| 49 | /ch/en/book-and-manage/overview-extra-services | 2956 / 2949 (-0.2 %) | 6203 / 6018 (-3.0 %) | not investigated | - |
| 50 | /ch/en/terms-conditions | 1790 / 1843 (+3.0 %) | 3147 / 3232 (+2.7 %) | not investigated | - |
| 51 | /ch/en/fly/flight-information/arrival-departure | 2001 / 1976 (-1.2 %) | 1690 / 1646 (-2.6 %) | not investigated | - |
| 52 | /ch/de/book-and-manage/overview-extra-services | 3071 / 3037 (-1.1 %) | 6423 / 6261 (-2.5 %) | not investigated | - |
| 53 | /ch/en/fly/on-board | 1399 / 1407 (+0.6 %) | 2191 / 2240 (+2.2 %) | not investigated | - |
| 54 | /ch/de/fly/on-board | 1448 / 1429 (-1.3 %) | 2235 / 2284 (+2.2 %) | not investigated | - |
| 55 | /ch/de/customer-support/refunds | 1989 / 1945 (-2.2 %) | 1934 / 1957 (+1.2 %) | not investigated | - |
| 56 | /ch/de/fly/airport | 2014 / 1973 (-2.0 %) | 3184 / 3158 (-0.8 %) | not investigated | - |
| 57 | /ch/en/fly/on-board/food-and-beverage/special-meals | 2592 / 2547 (-1.7 %) → 2587 (-0.2 %) | 3167 / 3105 (-2.0 %) → 3129 (-1.2 %) | picture-and-text rows: the next heading 24 px under a row, www 48 / 65 px (fixed, 47272dc8; after values →) | swiss.css (fixed) |
| 58 | /ch/en/discover/overview-inspiration | 1394 / 1402 (+0.6 %) | 2557 / 2603 (+1.8 %) | not investigated | - |
| 59 | /ch/en/customer-support/contact-us | 2116 / 2112 (-0.2 %) | 2326 / 2366 (+1.7 %) | not investigated | - |
| 60 | /ch/de/customer-support/contact-us | 2143 / 2112 (-1.4 %) | 2409 / 2449 (+1.7 %) | not investigated | - |
| 61 | /ch/de/prepare/baggage/baggage-irregularities | 3841 / 3903 (+1.6 %) → 3983 (+3.7 %) | 5081 / 5005 (-1.5 %) → 5053 (-0.6 %) | picture-and-text rows (the row rule applies; after values →) | swiss.css |
| 62 | /ch/en/various/accessibility-statement | 5901 / 5942 (+0.7 %) | 8362 / 8499 (+1.6 %) | not investigated | - |
| 63 | /ch/de/fly/on-board/duty-free-shop | 1516 / 1492 (-1.6 %) | 1173 / 1182 (+0.8 %) | not investigated | - |
| 64 | /ch/de/book-and-manage/corporate-customers/group-travel-and-charter | 2281 / 2246 (-1.5 %) | 2034 / 2039 (+0.2 %) | picture-and-text rows (the row rule applies; after values →) | swiss.css |
| 65 | /ch/en/prepare/overview-travel-information | 1916 / 1924 (+0.4 %) | 3387 / 3433 (+1.4 %) | not investigated | - |
| 66 | /ch/de/book-and-manage/overview-manage | 2437 / 2405 (-1.3 %) | 4851 / 4865 (+0.3 %) | not investigated | - |
| 67 | /ch/en/fly/airport/lounges | 1931 / 1926 (-0.3 %) | 3142 / 3101 (-1.3 %) | not investigated | - |
| 68 | /ch/en/prepare/special-care/children-travelling | 1422 / 1439 (+1.2 %) | 2647 / 2681 (+1.3 %) | not investigated | - |
| 69 | /ch/de/discover/overview-inspiration | 1465 / 1447 (-1.2 %) | 2645 / 2672 (+1.0 %) | not investigated | - |
| 70 | /ch/en/prepare/special-care/accessible-travel | 6680 / 6689 (+0.1 %) | 9918 / 10036 (+1.2 %) | not investigated | - |
| 71 | /ch/de/fly/check-in | 2558 / 2539 (-0.7 %) | 5026 / 5079 (+1.1 %) | not investigated | - |
| 72 | /ch/de/prepare/overview-travel-information | 1944 / 1924 (-1.0 %) | 3453 / 3477 (+0.7 %) | not investigated | - |
| 73 | /ch/de/prepare/special-care | 1966 / 1946 (-1.0 %) | 3585 / 3612 (+0.8 %) | not investigated | - |
| 74 | /ch/de/fly/on-board/travel-classes | 1988 / 1968 (-1.0 %) | 2741 / 2745 (+0.1 %) | not investigated | - |
| 75 | /ch/de/book-and-manage/corporate-customers | 1944 / 1924 (-1.0 %) | 3224 / 3245 (+0.7 %) | not investigated | - |
| 76 | /ch/en/prepare/special-care | 1938 / 1946 (+0.4 %) | 3497 / 3527 (+0.9 %) | not investigated | - |
| 77 | /ch/en/terms-conditions/privacy-statement | 16127 / 16257 (+0.8 %) | 29546 / 29679 (+0.5 %) | not investigated | - |
| 78 | /ch/en/prepare/baggage | 2993 / 3001 (+0.3 %) | 6024 / 5982 (-0.7 %) | not investigated | - |
| 79 | /ch/de/discover/swiss-senses | 8411 / 8458 (+0.6 %) | 8199 / 8260 (+0.7 %) | picture-and-text rows (the row rule applies; after values →) | swiss.css |
| 80 | /ch/de/prepare/overview-flights | 1892 / 1880 (-0.6 %) | 3374 / 3382 (+0.2 %) | not investigated | - |
| 81 | /ch/de/discover/a350 | 8283 / 8283 (+0.0 %) | 8075 / 8119 (+0.5 %) | not investigated | - |
| 82 | /ch/en/prepare/overview-flights | 1862 / 1861 (-0.1 %) | 3328 / 3316 (-0.4 %) | not investigated | - |
| 83 | /ch/en/fly/on-board/travel-classes | 1938 / 1946 (+0.4 %) | 2697 / 2701 (+0.1 %) | not investigated | - |
| 84 | /ch/en/book-and-manage/overview-manage | 2362 / 2357 (-0.2 %) | 4719 / 4711 (-0.2 %) | not investigated | - |
