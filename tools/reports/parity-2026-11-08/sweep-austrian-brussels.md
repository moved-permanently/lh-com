# Visual parity sweep, Austrian and Brussels (the brief after 471, 2026-11-08)

- **www:** the existing captures, no new request to the live sites: austrian-parity-001 (22 pages, 2026-11-05; sha256
  `f59a943d…327d`, as recorded in tools/reports/austrian/parity.md: its .sha256 answers 404) and brussels-parity-003 (10 pages,
  2026-11-07; sha256 `f78cf1fc…ecb7e`, equal to its .sha256). Heights and the h1/h2 positions from the captures'
  measurements/, the screenshots for the pixel difference, picture widths from each capture's .shadow.html rendered locally by
  its serve.py (Chrome resolving no other host; the archives carry no images, so www's picture heights are known only where
  the layout fixes them).
- **Ours:** austrian.turnsthe.page and brussels.turnsthe.page (live), every captured page at 1440 x 900 and 390 x 844, the
  captures' settle method (load, 1.5 s without a new request, scrolled down in 0.8-viewport steps of 350 ms, images complete,
  fonts ready, back to the top); all 64 answered 200.
- **Columns:** page height www / ours and the difference; the pixel difference over the common area (share of pixels whose
  RGB differs by more than 30); h1 count www / ours and the heading offsets where they jump by 40 px or more; pictures (ours /
  www's local render, those whose width differs by over 10 %); the cause where found.
- Scripts and raw data: logs/p4/sweep471 (not in git).

| # | brand | page | width | www px | ours px | height | pixels | headings | pictures | cause |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Brussels | /be/en/articles | 1440 | 4635 | 10838 | +133.8 % | 75.8 % | h1 1/1; +6199 before "summer in athens a journey t" (www y 1673); -57 before "why lyon should be your next" (www y 2082); +79 before "valencia like a local" (www y 2491) | pictures 9/9 | the three "Guided by… our crew!" video items stacked full width (each video its own one-cell columns-media, about 2,060 px each: +6,199 px before the next heading): the insights template has no three-column columns-media mapping for www's three-column view of video items (ema-adobe: insights) — **list for you** |
| 2 | Brussels | /be/fr/articles | 1440 | 4740 | 10886 | +129.7 % | 75.9 % | h1 1/1; +6179 before "l été à athènes un voyage mê" (www y 1741); -57 before "pourquoi lyon est votre proc" (www y 2150); +79 before "valence la vraie" (www y 2559) | pictures 9/9 | the three "Guided by… our crew!" video items stacked full width (each video its own one-cell columns-media, about 2,060 px each: +6,199 px before the next heading): the insights template has no three-column columns-media mapping for www's three-column view of video items (ema-adobe: insights) — **list for you** |
| 3 | Austrian | /at/en/homepage | 1440 | 4885 | 4401 | -9.9 % | 56.8 % | h1 0/0; -203 before "discover austrian" (www y 1532); -253 before "looking for more than just a" (www y 3575) | pictures 19/28; cph-square.jpg www 370x555 ours 150x150 | homepage: www's alert strip ("Current restrictions on rail services", live), another campaign in the stage (content changed since the capture), the deals without prices and "Flight offers from Vienna" with only its fallback tile (live offers did not load in this session: the destination finder, not mine); **fixed**: "Winter deals" as www's heading-xl (Portada 36 / 28 px; injected +10 px) |
| 4 | Austrian | /at/de/homepage | 1440 | 4934 | 4449 | -9.8 % | 56.9 % | h1 0/0; -239 before "entdecken sie austrian" (www y 1568); -242 before "suchen sie mehr als nur eine" (www y 3624) | pictures 19/29; cph-square.jpg www 370x555 ours 150x150 | homepage: www's alert strip ("Current restrictions on rail services", live), another campaign in the stage (content changed since the capture), the deals without prices and "Flight offers from Vienna" with only its fallback tile (live offers did not load in this session: the destination finder, not mine); **fixed**: "Winter deals" as www's heading-xl (Portada 36 / 28 px; injected +10 px) |
| 5 | Austrian | /at/en/homepage | 390 | 6039 | 5536 | -8.3 % | 45.6 % | h1 0/0; -275 before "discover austrian" (www y 2113); -155 before "looking for more than just a" (www y 3684) | pictures 16/25 | homepage: www's alert strip ("Current restrictions on rail services", live), another campaign in the stage (content changed since the capture), the deals without prices and "Flight offers from Vienna" with only its fallback tile (live offers did not load in this session: the destination finder, not mine); **fixed**: "Winter deals" as www's heading-xl (Portada 36 / 28 px; injected +10 px) |
| 6 | Brussels | /be/fr/travel-classes/premium-economy | 1440 | 4620 | 4248 | -8.1 % | 33.9 % | h1 0/1; +44 before "relaxez vous de la tête aux " (www y 1474); -53 before "galerie de photos" (www y 2857); -282 before "autres sujets" (www y 3695) | pictures 9/8 | **fixed (carousel-lightbox option wide, Brussels)**: the photo gallery's preview half width (622 px) where www runs the content width (~1,250 px); injected: business -7.7 % -> -2.1 %, premium-economy -8.1 % -> -0.2 %. Rest: "Other topics" cards (carousel-cards) about 90 px shorter |
| 7 | Austrian | /at/de/homepage | 390 | 6186 | 5704 | -7.8 % | 44.8 % | h1 0/0; -265 before "entdecken sie austrian" (www y 2179); -146 before "suchen sie mehr als nur eine" (www y 3810) | pictures 16/26 | homepage: www's alert strip ("Current restrictions on rail services", live), another campaign in the stage (content changed since the capture), the deals without prices and "Flight offers from Vienna" with only its fallback tile (live offers did not load in this session: the destination finder, not mine); **fixed**: "Winter deals" as www's heading-xl (Portada 36 / 28 px; injected +10 px) |
| 8 | Brussels | /be/fr/travel-classes/business | 1440 | 6458 | 5960 | -7.7 % | 35.6 % | h1 1/1; +63 before "une expérience au delà de l " (www y 1735); -193 before "galerie de photos" (www y 4695); -281 before "autres sujets" (www y 5533) | pictures 13/13 | **fixed (carousel-lightbox option wide, Brussels)**: the photo gallery's preview half width (622 px) where www runs the content width (~1,250 px); injected: business -7.7 % -> -2.1 %, premium-economy -8.1 % -> -0.2 %. Rest: "Other topics" cards (carousel-cards) about 90 px shorter |
| 9 | Brussels | /be/fr/travel-classes/business | 390 | 8976 | 8285 | -7.7 % | 49.9 % | h1 1/1; -81 before "une expérience au delà de l " (www y 2071); -482 before "galerie de photos" (www y 6511); +120 before "autres sujets" (www y 6799) | pictures 13/13 | the gallery is full width at 390 on both; -482 px before the gallery: the columns-media rows above (text and picture heights) shorter than www's; not located further this round |
| 10 | Brussels | /be/en/articles | 390 | 7814 | 7353 | -5.9 % | 58.4 % | h1 1/1; -58 before "valencia like a local" (www y 4880); -84 before "warsaw a city of history and" (www y 5442); -79 before "vilnius a city that quietly " (www y 6025); -79 before "discover milan a city trip f" (www y 6608) | pictures 9/9 | each blog-overview card 57-84 px shorter than www's (the blog-overview block, insights: ema-adobe) — list for you |
| 11 | Brussels | /be/fr/articles | 390 | 8049 | 7591 | -5.7 % | 56.8 % | h1 1/1; -57 before "valence la vraie" (www y 5071); -83 before "varsovie une ville mêlant hi" (www y 5632); -79 before "vilnius une ville qui vous r" (www y 6215); -80 before "découvrez milan un city trip" (www y 6798) | pictures 9/9 | each blog-overview card 57-84 px shorter than www's (the blog-overview block, insights: ema-adobe) — list for you |
| 12 | Austrian | /at/en/discover/inspiration/fly-with-austrian | 1440 | 4507 | 4272 | -5.2 % | 46.9 % | h1 1/1; no jump over 40 px | pictures 13/5 | about 5 %: the carousel cards' heights; no heading jump over 40 px |
| 13 | Brussels | /be/en/travel-classes/economy | 390 | 5073 | 4811 | -5.2 % | 46.0 % | h1 0/1; no jump over 40 px | pictures 7/6 | small; www has no h1 on this page, ours one (the one-h1 rule) |
| 14 | Austrian | /at/de/discover/inspiration/fly-with-austrian | 1440 | 4649 | 4411 | -5.1 % | 45.9 % | h1 1/1; no jump over 40 px | pictures 13/2 | about 5 %: the carousel cards' heights; no heading jump over 40 px |
| 15 | Austrian | /at/en/discover/inspiration/fly-with-austrian | 390 | 8696 | 9137 | +5.1 % | 52.7 % | h1 1/1; no jump over 40 px | pictures 13/5 | about 5 %: the carousel cards' heights; no heading jump over 40 px |
| 16 | Brussels | /ke/en/homepage | 1440 | 4110 | 4317 | +5.0 % | 45.1 % | h1 0/1; +239 before "current topics and news" (www y 1341); -156 before "looking for more than just a" (www y 3275) | pictures 24/29; bru-square.jpg www 125x? ours 76x76; ams-square.jpg www 125x? ours 76x76; zrh-square.jpg www 125x? ours 76x76 | homepage (ema-adobe): +239 px / -55 px before "Current topics and news" (the stage and the flight search area differ: live content), the destination tiles 76 px squares where www's are 125 px wide; www has no h1, ours one — list for you |
| 17 | Austrian | /at/de/discover/inspiration/fly-with-austrian | 390 | 9114 | 9531 | +4.6 % | 52.9 % | h1 1/1; no jump over 40 px | pictures 13/2 | about 5 %: the carousel cards' heights; no heading jump over 40 px |
| 18 | Austrian | /at/en/special-requirements | 1440 | 3784 | 3652 | -3.5 % | 44.3 % | h1 1/1; no jump over 40 px | pictures 8/8 | within 4 %: not investigated further |
| 19 | Brussels | /fr/fr/homepage | 390 | 5464 | 5635 | +3.1 % | 35.0 % | h1 0/1; -55 before "actualités" (www y 1885); -99 before "vous souhaitez des services " (www y 3440) | pictures 16/26; nyc-square.jpg www 125x? ours 76x76; was-square.jpg www 125x? ours 76x76; bru-square.jpg www 125x? ours 76x76 | homepage (ema-adobe): +239 px / -55 px before "Current topics and news" (the stage and the flight search area differ: live content), the destination tiles 76 px squares where www's are 125 px wide; www has no h1, ours one — list for you |
| 20 | Brussels | /be/fr/our-company | 390 | 9803 | 9518 | -2.9 % | 50.4 % | h1 1/1; -157 before "notre flotte" (www y 5637); +49 before "icônes belges" (www y 7686) | pictures 16/4 | the fleet carousel (carousel-cards) 157 px shorter at 390 — not located further |
| 21 | Brussels | /be/en/articles/milan-citytrip | 390 | 8291 | 8055 | -2.8 % | 53.5 % | h1 1/1; no jump over 40 px | pictures 14/14 | within 3 %: the article's stage 68 px lower at 1440 (the price bar above it) |
| 22 | Brussels | /be/fr/articles/milan-citytrip | 390 | 8693 | 8449 | -2.8 % | 52.4 % | h1 1/1; no jump over 40 px | pictures 14/14 | within 3 %: the article's stage 68 px lower at 1440 (the price bar above it) |
| 23 | Brussels | /be/en/travel-classes/economy | 1440 | 3186 | 3097 | -2.8 % | 27.2 % | h1 0/1; no jump over 40 px | pictures 7/6 | small; www has no h1 on this page, ours one (the one-h1 rule) |
| 24 | Austrian | /at/de/book/overview-inspiration | 1440 | 1777 | 1730 | -2.6 % | 22.0 % | h1 1/1; no jump over 40 px | pictures 2/2 | within 4 %: not investigated further |
| 25 | Austrian | /at/en/book/overview-inspiration | 1440 | 1777 | 1730 | -2.6 % | 21.8 % | h1 1/1; no jump over 40 px | pictures 2/2 | within 4 %: not investigated further |
| 26 | Austrian | /at/en/book/overview-services-on-board | 390 | 2921 | 2846 | -2.6 % | 26.9 % | h1 1/1; no jump over 40 px | pictures 3/3 | within 4 %: not investigated further |
| 27 | Austrian | /at/de/book/overview-services-on-board | 390 | 2969 | 2894 | -2.5 % | 27.4 % | h1 1/1; no jump over 40 px | pictures 3/3 | within 4 %: not investigated further |
| 28 | Brussels | /be/fr/travel-classes/premium-economy | 390 | 6224 | 6074 | -2.4 % | 33.5 % | h1 0/1; -85 before "galerie de photos" (www y 3758); +119 before "autres sujets" (www y 4047) | pictures 9/8 | the gallery as www's at 390; the "Other topics" cards +119 px (carousel-cards) — not located further |
| 29 | Austrian | /at/de/fly/travel-classes | 390 | 2889 | 2822 | -2.3 % | 23.6 % | h1 1/1; no jump over 40 px | pictures 3/3 | within 4 %: not investigated further |
| 30 | Austrian | /at/en/fly/travel-classes | 390 | 2889 | 2822 | -2.3 % | 22.9 % | h1 1/1; no jump over 40 px | pictures 3/3 | within 4 %: not investigated further |
| 31 | Austrian | /at/en/special-requirements | 390 | 5456 | 5333 | -2.3 % | 44.8 % | h1 1/1; no jump over 40 px | pictures 8/8 | within 4 %: not investigated further |
| 32 | Brussels | /be/fr/articles/milan-citytrip | 1440 | 6007 | 5871 | -2.3 % | 40.7 % | h1 1/1; +68 before "découvrez milan un city trip" (www y 763) | pictures 14/14 | within 3 %: the article's stage 68 px lower at 1440 (the price bar above it) |
| 33 | Brussels | /be/en/articles/milan-citytrip | 1440 | 5796 | 5668 | -2.2 % | 42.0 % | h1 1/1; +68 before "discover milan a city trip f" (www y 763) | pictures 14/14 | within 3 %: the article's stage 68 px lower at 1440 (the price bar above it) |
| 34 | Brussels | /ke/en/homepage | 390 | 5227 | 5327 | +1.9 % | 32.6 % | h1 0/1; -55 before "current topics and news" (www y 1816); -91 before "looking for more than just a" (www y 3274) | pictures 16/26; bru-square.jpg www 125x? ours 76x76 | homepage (ema-adobe): +239 px / -55 px before "Current topics and news" (the stage and the flight search area differ: live content), the destination tiles 76 px squares where www's are 125 px wide; www has no h1, ours one — list for you |
| 35 | Austrian | /at/en/contact | 390 | 3022 | 3077 | +1.8 % | 18.9 % | h1 1/0; no jump over 40 px | pictures 2/2 | ours has no visible h1 at 390 (the help centre app draws the title; the app is the micro-frontend, ema-adobe) — list for you |
| 36 | Austrian | /at/de/book/overview-services-on-board | 1440 | 2447 | 2403 | -1.8 % | 19.2 % | h1 1/1; no jump over 40 px | pictures 3/3 | within 4 %: not investigated further |
| 37 | Austrian | /at/en/book/overview-services-on-board | 1440 | 2422 | 2379 | -1.8 % | 19.0 % | h1 1/1; no jump over 40 px | pictures 3/3 | within 4 %: not investigated further |
| 38 | Austrian | /at/en/book/overview-manage | 1440 | 3693 | 3628 | -1.8 % | 27.2 % | h1 1/1; no jump over 40 px | pictures 8/8 | within 4 %: not investigated further |
| 39 | Austrian | /at/de/besondere-anforderungen | 1440 | 3736 | 3676 | -1.6 % | 31.8 % | h1 1/1; no jump over 40 px | pictures 8/8 | within 4 %: not investigated further |
| 40 | Austrian | /at/en/book/overview-inspiration | 390 | 2299 | 2270 | -1.3 % | 24.0 % | h1 1/1; no jump over 40 px | pictures 2/2 | within 4 %: not investigated further |
| 41 | Austrian | /at/de/book/overview-inspiration | 390 | 2347 | 2318 | -1.2 % | 24.1 % | h1 1/1; no jump over 40 px | pictures 2/2 | within 4 %: not investigated further |
| 42 | Brussels | /fr/fr/homepage | 1440 | 4214 | 4164 | -1.2 % | 34.0 % | h1 0/1; -148 before "vous souhaitez des services " (www y 3322) | pictures 19/29; nyc-square.jpg www 125x? ours 76x76; was-square.jpg www 125x? ours 76x76; bru-square.jpg www 125x? ours 76x76 | homepage (ema-adobe): +239 px / -55 px before "Current topics and news" (the stage and the flight search area differ: live content), the destination tiles 76 px squares where www's are 125 px wide; www has no h1, ours one — list for you |
| 43 | Austrian | /at/en/book/overview-manage | 390 | 5103 | 5047 | -1.1 % | 30.4 % | h1 1/1; no jump over 40 px | pictures 8/8 | within 4 %: not investigated further |
| 44 | Austrian | /at/de/contact | 390 | 3130 | 3163 | +1.1 % | 17.2 % | h1 1/0; no jump over 40 px | pictures 2/2 | within 4 %: not investigated further |
| 45 | Brussels | /be/fr/our-company | 1440 | 6004 | 5937 | -1.1 % | 34.5 % | h1 1/1; no jump over 40 px | pictures 16/4 | the fleet carousel (carousel-cards) 157 px shorter at 390 — not located further |
| 46 | Austrian | /at/de/besondere-anforderungen | 390 | 5497 | 5446 | -0.9 % | 33.4 % | h1 1/1; no jump over 40 px | pictures 8/8 | within 4 %: not investigated further |
| 47 | Austrian | /at/en/contact | 1440 | 2438 | 2460 | +0.9 % | 12.5 % | h1 1/0; no jump over 40 px | pictures 2/2 | within 4 %: not investigated further |
| 48 | Austrian | /at/de/book/overview-extra-services | 1440 | 3669 | 3637 | -0.9 % | 24.7 % | h1 1/1; no jump over 40 px | pictures 7/7 | within 4 %: not investigated further |
| 49 | Austrian | /at/en/book/overview-extra-services | 1440 | 3604 | 3574 | -0.8 % | 23.7 % | h1 1/1; no jump over 40 px | pictures 7/7 | within 4 %: not investigated further |
| 50 | Austrian | /at/de/book/overview-manage | 1440 | 3721 | 3691 | -0.8 % | 25.6 % | h1 1/1; no jump over 40 px | pictures 8/8 | within 4 %: not investigated further |
| 51 | Austrian | /at/de/fly/travel-classes | 1440 | 2414 | 2395 | -0.8 % | 17.8 % | h1 1/1; no jump over 40 px | pictures 3/3 | within 4 %: not investigated further |
| 52 | Austrian | /at/en/fly/travel-classes | 1440 | 2414 | 2395 | -0.8 % | 17.6 % | h1 1/1; no jump over 40 px | pictures 3/3 | within 4 %: not investigated further |
| 53 | Austrian | /at/en/book/overview-extra-services | 390 | 4964 | 4936 | -0.6 % | 27.9 % | h1 1/1; no jump over 40 px | pictures 7/7 | within 4 %: not investigated further |
| 54 | Austrian | /at/de/book/overview-extra-services | 390 | 5155 | 5126 | -0.6 % | 29.2 % | h1 1/1; no jump over 40 px | pictures 7/7 | within 4 %: not investigated further |
| 55 | Austrian | /at/en/book/flights | 390 | 4693 | 4670 | -0.5 % | 29.5 % | h1 1/1; no jump over 40 px | pictures 7/7 | within 4 %: not investigated further |
| 56 | Austrian | /at/de/book/flights | 390 | 4850 | 4827 | -0.5 % | 29.4 % | h1 1/1; no jump over 40 px | pictures 7/7 | within 4 %: not investigated further |
| 57 | Austrian | /at/en/book/flights | 1440 | 3575 | 3589 | +0.4 % | 23.8 % | h1 1/1; no jump over 40 px | pictures 7/7 | within 4 %: not investigated further |
| 58 | Austrian | /at/de/book/overview-manage | 390 | 5259 | 5239 | -0.4 % | 29.3 % | h1 1/1; no jump over 40 px | pictures 8/8 | within 4 %: not investigated further |
| 59 | Austrian | /at/de/book/flights | 1440 | 3600 | 3613 | +0.4 % | 23.9 % | h1 1/1; no jump over 40 px | pictures 7/7 | within 4 %: not investigated further |
| 60 | Austrian | /at/en/book/overview-travel-information | 390 | 4069 | 4072 | +0.1 % | 25.0 % | h1 1/1; no jump over 40 px | pictures 5/5 | within 4 %: not investigated further |
| 61 | Austrian | /at/de/book/overview-travel-information | 390 | 4135 | 4137 | +0.0 % | 25.4 % | h1 1/1; no jump over 40 px | pictures 5/5 | within 4 %: not investigated further |
| 62 | Austrian | /at/de/contact | 1440 | 2459 | 2460 | +0.0 % | 11.2 % | h1 1/0; no jump over 40 px | pictures 2/2 | within 4 %: not investigated further |
| 63 | Austrian | /at/en/book/overview-travel-information | 1440 | 2996 | 2995 | -0.0 % | 23.3 % | h1 1/1; no jump over 40 px | pictures 5/5 | within 4 %: not investigated further |
| 64 | Austrian | /at/de/book/overview-travel-information | 1440 | 3044 | 3043 | -0.0 % | 23.3 % | h1 1/1; no jump over 40 px | pictures 5/5 | within 4 %: not investigated further |

## Fixed this round (mine; rows in the brands' parity.md)

| fix | pages | measured with the rule injected on the brand host (www / before / after) | documents |
| --- | --- | --- | --- |
| Brussels P43: carousel-lightbox option wide (the parser gives a brusselsairlines.com slideshow outside a column view the full width from 768 px; test/brussels-gallery-wide.test.mjs) | /be/fr/travel-classes/business 1440, premium-economy 1440 | business 6458 / 5960 / 6321 px (-7.7 % to -2.1 %), premium-economy 4620 / 4248 / 4609 px (-8.1 % to -0.2 %); 390 unchanged (8976 / 8285 / 8285: full width there already) | 51 to re-import (`reimport-brussels-galleries.txt`); a snapshot import of /be/fr/travel-classes/business with the rebuilt fleet bundle gives `carousel-lightbox wide` |
| Austrian 44: the fare teaser's title as www's heading-xl (styles/themes/austrian.css; test/austrian-fare-teaser-heading.test.mjs) | /at/en/homepage, /at/de/homepage | at/en 1440 4885 / 4401 / 4411, at/en 390 6039 / 5536 / 5539, at/de 1440 4934 / 4449 / 4459 (the rest is live content, below) | none (CSS) |

## Causes in other agents' files (not changed; for you)

1. **Brussels articles hubs (/be/en/articles, /be/fr/articles) at 1440, +130 %** (insights, ema-adobe): the three "Guided by…
   our crew!" video items are a three-column view on www; the import makes each its own one-cell columns-media, stacked at
   full width with portrait videos (about 2,060 px each). Needs a three-column mapping (one columns-media of three cells, or
   cards) in the insights template.
2. **Brussels articles hubs at 390, -6 %** (blog-overview, ema-adobe): each card 57-84 px shorter than www's (the teaser text
   or picture ratio).
3. **Austrian homepages, -8 to -10 %** (homepage blocks, ema-adobe): www's alert strip ("Current restrictions on rail
   services", live); the stage shows another campaign than the capture (content); the deals' prices and the "Flight offers
   from Vienna" destination finder (one fallback tile, -250 px) come from live offers that did not load in this session.
   Data, probably no code change; worth a look when the offers answer.
4. **Brussels ke/en and fr/fr homepages, +5 % / +3 %** (homepage, ema-adobe): +239 px before "Current topics and news" (the
   stage and the flight search area); the destination tiles 76 px squares where www's are 125 px wide.
5. **Austrian /at/en/contact at 390** (help centre micro-frontend, ema-adobe): no visible h1 (www has one).

## Not located this round (mine, next)

- /be/fr/travel-classes/business at 390: -482 px before the gallery (the columns-media rows above it).
- carousel-cards on Brussels ("Other topics", the fleet carousel): 90-160 px off in either direction.
- Austrian fly-with-austrian: about 5 %, spread over the carousel cards, no heading jump over 40 px.
