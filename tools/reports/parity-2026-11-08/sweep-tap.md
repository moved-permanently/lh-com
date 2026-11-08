# Parity sweep: TAP (2026-11-08, brief 478)

www.flytap.com against ours on tap.turnsthe.page, at 1440 x 900 and 390 x 844: **41 pages, 82 page widths**. The
homepages of pt-pt, en-pt, es-es, fr-fr, de-de, it-it, pl-pl, pt-br and en-us; on en-pt and pt-pt help, baggage,
check-in, Miles&Go, promos, destinations, fares and the legal hub; two or three of those per other language; en-us
promos. Worst first (pixel difference plus the height difference in %); the cause where one was found.

## How it was measured

- Both hosts in the same headless Chromium (Playwright's 1208, a desktop user agent), one browser and profile per host,
  one page at a time, closed after reading; on www.flytap.com one page every 2.5 s at the soonest. No Cloudflare
  challenge in 84 requests to www (82 pages and widths, the one page below again, and two of the destinations widget
  measured), plus the two of the probe; no other www host.
- The same settle method on both: the DOM, the load event (at most 20 s: www's third parties keep it from firing),
  network quiet for 1.5 s (at most 15 s), the consent banner closed the same way (its accept-all button: OneTrust's on
  www; ours showed none), our showcase notice acknowledged, scrolled to the bottom in 0.8-viewport steps of 350 ms,
  the pictures complete, the fonts ready, back to the top.
- Recorded: the page height; each h1 and h2 outside the header and footer (matched by text), its top; the blocks'
  tops (ours); the pictures in main of 40 px or more (rendered size); a full-page PNG (pixelmatch, threshold 0.1,
  over the area both have). The screenshots, the HTML and the metrics stay out of git
  (migration-work/parity-478/caps).
- www's /pt-pt/miles-and-go at 390 went on its own to booking.flytap.com/lite/ in the first run (nothing was clicked);
  it was captured once more.
- "After the fix (local)": the same capture of this tree's code on the local dev server (aem up on lh-tap's preview
  content); for promos at 390 with the document as the re-import writes it.

| # | Page | Width | www height | ours | Δ % | pixels % | h1/h2 matched | max shift px | pictures www/ours | after the fix (local) | Cause |
| ---: | --- | ---: | ---: | ---: | ---: | ---: | --- | ---: | --- | --- | --- |
| 1 | /en-pt/destinations | 1440 | 2990 | 3789 | +26.7 | 28.9 | 2/19 | 32 | 17/32 | 2865 (-4.2%), 22.5% | **fixed, row 112:** the destination list and the map stacked (a 3-column grid, the map below it); www's widget is one piece, the list a 365 px column scrolling beside the 790 px map at 1440, the map between the bar and the list on phones. Left: Smartvel's map style and zoom, the cards' order on www at 390, the chips' icons |
| 2 | /pt-pt/destinos | 1440 | 2990 | 3767 | +26 | 28.8 | 2/19 | 32 | 17/32 | 2865 (-4.2%), 22.5% | **fixed, row 112:** the destination list and the map stacked (a 3-column grid, the map below it); www's widget is one piece, the list a 365 px column scrolling beside the 790 px map at 1440, the map between the bar and the list on phones. Left: Smartvel's map style and zoom, the cards' order on www at 390, the chips' icons |
| 3 | /de-de/reiseziele | 1440 | 2990 | 3749 | +25.4 | 28.7 | 2/19 | 8 | 17/32 |  | **fixed, row 112:** the destination list and the map stacked (a 3-column grid, the map below it); www's widget is one piece, the list a 365 px column scrolling beside the 790 px map at 1440, the map between the bar and the list on phones. Left: Smartvel's map style and zoom, the cards' order on www at 390, the chips' icons |
| 4 | /it-it/destinazioni | 1440 | 2990 | 3749 | +25.4 | 28.7 | 2/19 | 8 | 17/32 |  | **fixed, row 112:** the destination list and the map stacked (a 3-column grid, the map below it); www's widget is one piece, the list a 365 px column scrolling beside the 790 px map at 1440, the map between the bar and the list on phones. Left: Smartvel's map style and zoom, the cards' order on www at 390, the chips' icons |
| 5 | /en-pt/destinations | 390 | 5116 | 5354 | +4.7 | 46.3 | 2/19 | 0 | 17/26 | 5242 (+2.5%), 39% | **fixed, row 112:** the destination list and the map stacked (a 3-column grid, the map below it); www's widget is one piece, the list a 365 px column scrolling beside the 790 px map at 1440, the map between the bar and the list on phones. Left: Smartvel's map style and zoom, the cards' order on www at 390, the chips' icons |
| 6 | /it-it/destinazioni | 390 | 5108 | 5363 | +5 | 45 | 2/19 | 12 | 17/26 |  | **fixed, row 112:** the destination list and the map stacked (a 3-column grid, the map below it); www's widget is one piece, the list a 365 px column scrolling beside the 790 px map at 1440, the map between the bar and the list on phones. Left: Smartvel's map style and zoom, the cards' order on www at 390, the chips' icons |
| 7 | /pt-pt/destinos | 390 | 5084 | 5331 | +4.9 | 44.3 | 2/19 | 0 | 17/26 | 5219 (+2.7%), 37% | **fixed, row 112:** the destination list and the map stacked (a 3-column grid, the map below it); www's widget is one piece, the list a 365 px column scrolling beside the 790 px map at 1440, the map between the bar and the list on phones. Left: Smartvel's map style and zoom, the cards' order on www at 390, the chips' icons |
| 8 | /de-de/reiseziele | 390 | 5156 | 5410 | +4.9 | 43.1 | 2/19 | 12 | 17/26 |  | **fixed, row 112:** the destination list and the map stacked (a 3-column grid, the map below it); www's widget is one piece, the list a 365 px column scrolling beside the 790 px map at 1440, the map between the bar and the list on phones. Left: Smartvel's map style and zoom, the cards' order on www at 390, the chips' icons |
| 9 | /pl-pl | 1440 | 4585 | 4183 | -8.8 | 28.9 | 7/7 | 402 | 14/14 |  | the Miles&Go cards: www stacks them as sticky cards (each scrolls over the one before), so the section is taller (3 cards) or shorter (4) than our flat cards; our stage's slide titles are h2 (www none). ema-adobe (homepage, hero-campaign) |
| 10 | /de-de | 1440 | 4596 | 4197 | -8.7 | 28.6 | 7/7 | 402 | 14/14 |  | the Miles&Go cards: www stacks them as sticky cards (each scrolls over the one before), so the section is taller (3 cards) or shorter (4) than our flat cards; our stage's slide titles are h2 (www none). ema-adobe (homepage, hero-campaign) |
| 11 | /it-it | 1440 | 4577 | 4197 | -8.3 | 28.5 | 7/7 | 402 | 14/14 |  | the Miles&Go cards: www stacks them as sticky cards (each scrolls over the one before), so the section is taller (3 cards) or shorter (4) than our flat cards; our stage's slide titles are h2 (www none). ema-adobe (homepage, hero-campaign) |
| 12 | /fr-fr | 1440 | 4629 | 4224 | -8.7 | 27.7 | 7/7 | 427 | 14/14 |  | the Miles&Go cards: www stacks them as sticky cards (each scrolls over the one before), so the section is taller (3 cards) or shorter (4) than our flat cards; our stage's slide titles are h2 (www none). ema-adobe (homepage, hero-campaign) |
| 13 | /es-es | 1440 | 4577 | 4197 | -8.3 | 27.6 | 7/7 | 402 | 14/14 |  | the Miles&Go cards: www stacks them as sticky cards (each scrolls over the one before), so the section is taller (3 cards) or shorter (4) than our flat cards; our stage's slide titles are h2 (www none). ema-adobe (homepage, hero-campaign) |
| 14 | /pt-br | 1440 | 4569 | 4809 | +5.3 | 30 | 9/9 | 606 | 17/17 |  | the Miles&Go cards: www stacks them as sticky cards (each scrolls over the one before), so the section is taller (3 cards) or shorter (4) than our flat cards; our stage's slide titles are h2 (www none). ema-adobe (homepage, hero-campaign) |
| 15 | /en-us | 1440 | 4569 | 4809 | +5.3 | 29.9 | 9/9 | 606 | 16/16 |  | the Miles&Go cards: www stacks them as sticky cards (each scrolls over the one before), so the section is taller (3 cards) or shorter (4) than our flat cards; our stage's slide titles are h2 (www none). ema-adobe (homepage, hero-campaign) |
| 16 | /en-pt | 1440 | 4621 | 4836 | +4.7 | 28.4 | 9/9 | 581 | 16/16 |  | the Miles&Go cards: www stacks them as sticky cards (each scrolls over the one before), so the section is taller (3 cards) or shorter (4) than our flat cards; our stage's slide titles are h2 (www none). ema-adobe (homepage, hero-campaign) |
| 17 | /pt-pt | 1440 | 4621 | 4836 | +4.7 | 27.9 | 9/9 | 581 | 16/16 |  | the Miles&Go cards: www stacks them as sticky cards (each scrolls over the one before), so the section is taller (3 cards) or shorter (4) than our flat cards; our stage's slide titles are h2 (www none). ema-adobe (homepage, hero-campaign) |
| 18 | /pt-pt/informacoes/bagagem | 1440 | 2544 | 2076 | -18.4 | 13.9 | 2/2 | 56 | 1/1 |  | www keeps about 400 px empty for the LUGGit widget (painted on scroll; ours links to www there); **fixed, row 114:** the picture over the title 40 px too high at 1440, the title 16 px too close (at 390 16 px too far) |
| 19 | /de-de | 390 | 4454 | 4491 | +0.8 | 30.7 | 7/7 | 47 | 14/14 |  | heights within 1 %: the stage's slide at the capture (both autoplay) and the stacked cards' picture crops make the pixels; ema-adobe (homepage) |
| 20 | /en-pt/promos | 390 | 4009 | 4370 | +9 | 22.4 | 2/2 | 72 | 6/6 | 3993 (-0.4%), 18.6% | **fixed, row 113:** News & Highlights is a swiper on www's phones (one card a view, dots), ours a column (the importer's phone-slider; the 4 promos documents uploaded, the other languages in the re-import list) |
| 21 | /es-es | 390 | 4475 | 4514 | +0.9 | 30.5 | 7/7 | 49 | 14/14 |  | heights within 1 %: the stage's slide at the capture (both autoplay) and the stacked cards' picture crops make the pixels; ema-adobe (homepage) |
| 22 | /it-it | 390 | 4433 | 4470 | +0.8 | 30.5 | 7/7 | 47 | 14/14 |  | heights within 1 %: the stage's slide at the capture (both autoplay) and the stacked cards' picture crops make the pixels; ema-adobe (homepage) |
| 23 | /pt-br | 390 | 4928 | 4967 | +0.8 | 30.5 | 9/9 | 49 | 17/17 |  | heights within 1 %: the stage's slide at the capture (both autoplay) and the stacked cards' picture crops make the pixels; ema-adobe (homepage) |
| 24 | /pl-pl | 390 | 4441 | 4478 | +0.8 | 30.4 | 7/7 | 47 | 14/14 |  | heights within 1 %: the stage's slide at the capture (both autoplay) and the stacked cards' picture crops make the pixels; ema-adobe (homepage) |
| 25 | /pt-pt/promos | 390 | 4028 | 4341 | +7.8 | 23.2 | 2/2 | 72 | 6/6 |  | **fixed, row 113:** News & Highlights is a swiper on www's phones (one card a view, dots), ours a column (the importer's phone-slider; the 4 promos documents uploaded, the other languages in the re-import list) |
| 26 | /en-us | 390 | 4873 | 4910 | +0.8 | 30.1 | 9/9 | 47 | 16/16 |  | heights within 1 %: the stage's slide at the capture (both autoplay) and the stacked cards' picture crops make the pixels; ema-adobe (homepage) |
| 27 | /en-pt/information/baggage | 1440 | 2528 | 2076 | -17.9 | 11.3 | 2/2 | 56 | 1/1 | 2132 (-15.7%), 6.7% | www keeps about 400 px empty for the LUGGit widget (painted on scroll; ours links to www there); **fixed, row 114:** the picture over the title 40 px too high at 1440, the title 16 px too close (at 390 16 px too far) |
| 28 | /fr-fr/miles-and-go | 1440 | 3839 | 3545 | -7.7 | 20.4 | 5/5 | 440 | 8/8 |  | www's Miles&Go banner for fr, de and es is 404 px with a green diagonal (1,176 px wide, 32 px lower); our hero-campaign 305 px. ema-adobe (hero-campaign) |
| 29 | /en-pt/information/baggage | 390 | 3274 | 2891 | -11.7 | 15.8 | 2/2 | 16 | 1/1 | 2875 (-12.2%), 13% | www keeps about 400 px empty for the LUGGit widget (painted on scroll; ours links to www there); **fixed, row 114:** the picture over the title 40 px too high at 1440, the title 16 px too close (at 390 16 px too far) |
| 30 | /pt-pt/miles-and-go | 390 | 4753 | 4649 | -2.2 | 25.3 | 5/5 | 315 | 11/8 |  | the stage 16 px lower; at 390 www shows 3 more pictures (the tier logos); not traced further |
| 31 | /pt-pt/informacoes/bagagem | 390 | 3329 | 2929 | -12 | 14.4 | 2/2 | 16 | 1/1 |  | www keeps about 400 px empty for the LUGGit widget (painted on scroll; ours links to www there); **fixed, row 114:** the picture over the title 40 px too high at 1440, the title 16 px too close (at 390 16 px too far) |
| 32 | /de-de/miles-and-go | 1440 | 3818 | 3579 | -6.3 | 19.8 | 5/5 | 440 | 8/8 |  | www's Miles&Go banner for fr, de and es is 404 px with a green diagonal (1,176 px wide, 32 px lower); our hero-campaign 305 px. ema-adobe (hero-campaign) |
| 33 | /es-es/miles-and-go | 1440 | 3812 | 3587 | -5.9 | 20.1 | 5/5 | 440 | 8/8 |  | www's Miles&Go banner for fr, de and es is 404 px with a green diagonal (1,176 px wide, 32 px lower); our hero-campaign 305 px. ema-adobe (hero-campaign) |
| 34 | /en-pt/miles-and-go | 390 | 4747 | 4667 | -1.7 | 23.6 | 5/5 | 315 | 11/8 |  | the stage 16 px lower; at 390 www shows 3 more pictures (the tier logos); not traced further |
| 35 | /pt-br/miles-and-go | 390 | 4757 | 4660 | -2 | 22.4 | 5/5 | 88 | 10/7 |  | the stage 16 px lower; at 390 www shows 3 more pictures (the tier logos); not traced further |
| 36 | /fr-fr/miles-and-go | 390 | 4368 | 4331 | -0.8 | 23.5 | 5/5 | 204 | 8/5 |  | at 390 the title 89 px lower and 3 pictures fewer (the tier cards' logos) on ours; not traced further |
| 37 | /en-us/promos | 390 | 3809 | 3716 | -2.4 | 21.8 | 2/2 | 72 | 5/5 |  | **fixed, row 113:** News & Highlights is a swiper on www's phones (one card a view, dots), ours a column (the importer's phone-slider; the 4 promos documents uploaded, the other languages in the re-import list) |
| 38 | /es-es/promos | 390 | 3972 | 3869 | -2.6 | 20.6 | 2/2 | 72 | 5/5 |  | **fixed, row 113:** News & Highlights is a swiper on www's phones (one card a view, dots), ours a column (the importer's phone-slider; the 4 promos documents uploaded, the other languages in the re-import list) |
| 39 | /pt-br/ajuda | 1440 | 3275 | 3714 | +13.4 | 9.8 | 4/4 | 417 | 1/1 |  | the contacts: our hotline-finder lists three groups for pt-br (Miles&Go, Contact Center, TAP Partner), www one; ema-test (hotline-finder and its sheets) |
| 40 | /es-es/miles-and-go | 390 | 4392 | 4358 | -0.8 | 21.1 | 5/5 | 192 | 8/5 |  | at 390 the title 89 px lower and 3 pictures fewer (the tier cards' logos) on ours; not traced further |
| 41 | /pt-pt | 390 | 5141 | 5153 | +0.2 | 21 | 9/9 | 24 | 16/16 |  | heights within 1 %: the stage's slide at the capture (both autoplay) and the stacked cards' picture crops make the pixels; ema-adobe (homepage) |
| 42 | /en-pt | 390 | 5016 | 5025 | +0.2 | 20.1 | 9/9 | 22 | 16/16 |  | heights within 1 %: the stage's slide at the capture (both autoplay) and the stacked cards' picture crops make the pixels; ema-adobe (homepage) |
| 43 | /fr-fr | 390 | 4506 | 4518 | +0.3 | 20 | 7/7 | 22 | 14/14 |  | heights within 1 %: the stage's slide at the capture (both autoplay) and the stacked cards' picture crops make the pixels; ema-adobe (homepage) |
| 44 | /pl-pl/informacje-prawne | 390 | 2672 | 2679 | +0.3 | 17.4 | 1/1 | 16 | 1/1 |  | **fixed, row 114:** the picture over the title (40 px high at 1440, the title 16 px off); left: the picture's crop |
| 45 | /pt-pt/info-legal | 390 | 2644 | 2650 | +0.2 | 17.1 | 1/1 | 16 | 1/1 | 2634 (-0.4%), 12.8% | **fixed, row 114:** the picture over the title (40 px high at 1440, the title 16 px off); left: the picture's crop |
| 46 | /en-pt/legal-info | 390 | 2596 | 2602 | +0.2 | 17 | 1/1 | 16 | 1/1 | 2586 (-0.4%), 12.9% | **fixed, row 114:** the picture over the title (40 px high at 1440, the title 16 px off); left: the picture's crop |
| 47 | /de-de/miles-and-go | 390 | 4354 | 4345 | -0.2 | 16.3 | 5/5 | 204 | 8/5 |  | at 390 the title 89 px lower and 3 pictures fewer (the tier cards' logos) on ours; not traced further |
| 48 | /en-pt/promos | 1440 | 2796 | 2900 | +3.7 | 11.6 | 2/2 | 44 | 6/6 | 2900 (+3.7%), 11.6% | the cards 44 px lower from the second row (not traced further) |
| 49 | /pt-pt/promos | 1440 | 2796 | 2900 | +3.7 | 11.6 | 2/2 | 44 | 6/6 |  | the cards 44 px lower from the second row (not traced further) |
| 50 | /es-es/promos | 1440 | 2767 | 2872 | +3.8 | 11.3 | 2/2 | 44 | 5/5 |  | the cards 44 px lower from the second row (not traced further) |
| 51 | /pt-pt/info-legal | 1440 | 1888 | 1886 | -0.1 | 14.9 | 1/1 | 56 | 1/1 | 1942 (+2.9%), 10.8% | **fixed, row 114:** the picture over the title (40 px high at 1440, the title 16 px off); left: the picture's crop |
| 52 | /en-us/promos | 1440 | 2748 | 2852 | +3.8 | 11.1 | 2/2 | 44 | 5/5 |  | the cards 44 px lower from the second row (not traced further) |
| 53 | /en-pt/legal-info | 1440 | 1888 | 1886 | -0.1 | 14.7 | 1/1 | 56 | 1/1 | 1942 (+2.9%), 10.7% | **fixed, row 114:** the picture over the title (40 px high at 1440, the title 16 px off); left: the picture's crop |
| 54 | /de-de/hilfe | 1440 | 3304 | 3443 | +4.2 | 10.3 | 4/4 | 117 | 1/1 |  | the contacts' picture 32 px lower at 1440 (hotline-finder; ema-test); otherwise within 1.5 % |
| 55 | /pl-pl/informacje-prawne | 1440 | 1896 | 1896 | +0 | 13.6 | 1/1 | 56 | 1/1 |  | **fixed, row 114:** the picture over the title (40 px high at 1440, the title 16 px off); left: the picture's crop |
| 56 | /pt-pt/reservas/tarifas-tap | 390 | 3394 | 3407 | +0.4 | 11.3 | 6/6 | 34 | 0/0 |  | within 3.3 % and 9 % pixels: no single cause |
| 57 | /pt-br/miles-and-go | 1440 | 3791 | 3742 | -1.3 | 10.3 | 5/5 | 103 | 10/10 |  | the stage 16 px lower; at 390 www shows 3 more pictures (the tier logos); not traced further |
| 58 | /en-pt/miles-and-go | 1440 | 3770 | 3740 | -0.8 | 9.6 | 5/5 | 436 | 11/11 |  | the stage 16 px lower; at 390 www shows 3 more pictures (the tier logos); not traced further |
| 59 | /en-pt/check-in-information | 390 | 3182 | 3139 | -1.4 | 8.6 | 4/4 | 18 | 0/0 |  | within 3.3 % and 9 % pixels: no single cause |
| 60 | /en-pt/bookings/tap-fares | 390 | 3326 | 3328 | +0.1 | 8.8 | 6/6 | 11 | 0/0 |  | within 3.3 % and 9 % pixels: no single cause |
| 61 | /pt-pt/miles-and-go | 1440 | 3773 | 3764 | -0.2 | 8.3 | 5/5 | 436 | 11/11 |  | the stage 16 px lower; at 390 www shows 3 more pictures (the tier logos); not traced further |
| 62 | /fr-fr/aide | 390 | 6279 | 6258 | -0.3 | 8.1 | 7/7 | 24 | 1/1 |  | the contacts' picture 32 px lower at 1440 (hotline-finder; ema-test); otherwise within 1.5 % |
| 63 | /en-pt/help | 390 | 6407 | 6318 | -1.4 | 6.9 | 8/8 | 80 | 1/1 |  | the contacts' picture 32 px lower at 1440 (hotline-finder; ema-test); otherwise within 1.5 % |
| 64 | /pl-pl/pomoc | 390 | 5695 | 5646 | -0.9 | 7.2 | 5/5 | 40 | 1/1 |  | the contacts' picture 32 px lower at 1440 (hotline-finder; ema-test); otherwise within 1.5 % |
| 65 | /pl-pl/pomoc | 1440 | 3145 | 3177 | +1 | 6.9 | 5/5 | 32 | 1/1 |  | the contacts' picture 32 px lower at 1440 (hotline-finder; ema-test); otherwise within 1.5 % |
| 66 | /pt-pt/ajuda | 390 | 6422 | 6352 | -1.1 | 6.8 | 8/8 | 60 | 1/1 |  | the contacts' picture 32 px lower at 1440 (hotline-finder; ema-test); otherwise within 1.5 % |
| 67 | /es-es/ayuda | 1440 | 3197 | 3236 | +1.2 | 6.5 | 6/6 | 32 | 1/1 |  | the contacts' picture 32 px lower at 1440 (hotline-finder; ema-test); otherwise within 1.5 % |
| 68 | /es-es/ayuda | 390 | 5913 | 5867 | -0.8 | 6.8 | 6/6 | 36 | 1/1 |  | the contacts' picture 32 px lower at 1440 (hotline-finder; ema-test); otherwise within 1.5 % |
| 69 | /fr-fr/informations-enregistrement | 1440 | 2810 | 2716 | -3.3 | 4.3 | 4/4 | 32 | 0/0 |  | within 3.3 % and 9 % pixels: no single cause |
| 70 | /it-it/assistenza | 1440 | 3255 | 3294 | +1.2 | 6.4 | 6/6 | 32 | 1/1 |  | the contacts' picture 32 px lower at 1440 (hotline-finder; ema-test); otherwise within 1.5 % |
| 71 | /it-it/assistenza | 390 | 5932 | 5887 | -0.8 | 6.7 | 6/6 | 36 | 1/1 |  | the contacts' picture 32 px lower at 1440 (hotline-finder; ema-test); otherwise within 1.5 % |
| 72 | /de-de/hilfe | 390 | 6395 | 6350 | -0.7 | 6.7 | 7/7 | 36 | 1/1 |  | the contacts' picture 32 px lower at 1440 (hotline-finder; ema-test); otherwise within 1.5 % |
| 73 | /fr-fr/aide | 1440 | 3404 | 3443 | +1.1 | 6.3 | 7/7 | 32 | 1/1 |  | the contacts' picture 32 px lower at 1440 (hotline-finder; ema-test); otherwise within 1.5 % |
| 74 | /fr-fr/informations-enregistrement | 390 | 3507 | 3512 | +0.1 | 7.3 | 4/4 | 30 | 0/0 |  | within 3.3 % and 9 % pixels: no single cause |
| 75 | /pt-pt/informacoes-check-in | 1440 | 2770 | 2713 | -2.1 | 5.3 | 4/4 | 7 | 0/0 |  | within 3.3 % and 9 % pixels: no single cause |
| 76 | /en-pt/check-in-information | 1440 | 2700 | 2644 | -2.1 | 5.2 | 4/4 | 32 | 0/0 |  | within 3.3 % and 9 % pixels: no single cause |
| 77 | /en-pt/bookings/tap-fares | 1440 | 3088 | 3142 | +1.7 | 5.2 | 6/6 | 32 | 0/0 |  | within 3.3 % and 9 % pixels: no single cause |
| 78 | /pt-pt/reservas/tarifas-tap | 1440 | 3088 | 3142 | +1.7 | 5.2 | 6/6 | 32 | 0/0 |  | within 3.3 % and 9 % pixels: no single cause |
| 79 | /pt-pt/ajuda | 1440 | 3642 | 3675 | +0.9 | 5.7 | 8/8 | 32 | 1/1 |  | the contacts' picture 32 px lower at 1440 (hotline-finder; ema-test); otherwise within 1.5 % |
| 80 | /pt-pt/informacoes-check-in | 390 | 3307 | 3304 | -0.1 | 6.2 | 4/4 | 22 | 0/0 |  | within 3.3 % and 9 % pixels: no single cause |
| 81 | /pt-br/ajuda | 390 | 6509 | 6480 | -0.4 | 5.6 | 7/7 | 28 | 1/1 |  | the contacts' groups (as at 1440); ema-test |
| 82 | /en-pt/help | 1440 | 3661 | 3675 | +0.4 | 5.2 | 8/8 | 32 | 1/1 |  | the contacts' picture 32 px lower at 1440 (hotline-finder; ema-test); otherwise within 1.5 % |

## Fixed (TAP's code and importer; tools/reports/tap/parity.md rows 112 to 114)

1. **Destinations (row 112):** `blocks/destination-grid` takes the page's poi-map into the grid (placeMap): the map
   between the bar and the list on phones, from 1024 px the list a 365 px column scrolling in a 790 px box beside the
   790 px map, the search 302 px, the map's region pills left out (www's Filters panel has the areas). 1440: 3,789 to
   2,865 px (www 2,990), pixels 28.9 to 22.5 %; 390: pixels 46.3 to 39 %. Code only: the 8 destinations pages change
   on release, no document.
2. **Promos' News & Highlights and every list www swipes on phones (row 113):** the importer writes cards-teaser's
   option phone-slider for a card list with mobileType slider (one card a view, dots below 1025 px); the dots in TAP's
   look (styles/themes/tap.css). en-pt promos at 390: 4,370 to 3,993 px (www 4,009), pixels 22.4 to 18.6 %.
3. **The picture over an inner page's title (row 114):** styles/themes/tap.css, the picture where a first title starts
   (24 px under the trail on phones, 64 from 1025 px) and the title 32 / 64 px under it: picture and h1 at www's
   positions on baggage and the legal hubs at both widths (pixels 14.7 to 10.7 % on the legal hub at 1440).

Documents: 6 uploaded to DA and previewed with the option phone-slider (DA's copies with only that changed: they hold
brief 462's market sections or DA's edits, so a re-import must not rewrite them):
`tools/reports/parity-2026-11-08/publish-list-tap-478.txt`. The other 18 documents with such a list:
`tools/reports/parity-2026-11-08/reimport-tap-478.txt`, for the harness (the language versions' pages of the
2026-11-07 fetch; a page that fetch didn't read is not in it).

## For you: causes in other agents' files

- **ema-adobe, homepage:** www's Miles&Go cards on the homepages are sticky cards that stack as one scrolls (each over
  the one before); ours are flat cards one under the other. Every homepage at 1440: ±5 to 9 % height, the headings
  after them 400 to 600 px off.
- **ema-adobe, hero-campaign:** our stage's slide titles are h2 (three or four per homepage; www's have no heading).
  The Miles&Go banner of fr-fr, de-de and es-es: www's is 404 px high, 1,176 px wide, 32 px lower, with a green
  diagonal; ours 305 px (the title 163 px higher at 1440).
- **ema-test, hotline-finder:** pt-br's help lists three contact groups (Miles&Go, Contact Center, TAP Partner) where
  www shows one: +439 px at 1440. On every help page the contacts' picture is 32 px lower than www's at 1440.
- **Not ours to fix:** www's baggage pages keep about 400 px empty for the LUGGit widget (ours links to www there).

## Brief 480: the causes in the other agents' files, scoped to TAP (parity.md rows 115 to 120)

Measured on the local dev server with this tree's code and lh-tap's preview content, against this sweep's www
captures (no new www page read):

| Page | Width | Before (ours) | After | www |
| --- | ---: | --- | --- | --- |
| /pt-pt (Miles&Go pin, row 115) | 1440 | 4,836 px | 4,580 px | 4,621 px |
| /de-de (pin; stage 25 px, row 119) | 1440 | 4,197 px, pixels 28.6 % | 4,528 px, 18.8 %, the title 8 px from www's | 4,596 px |
| /de-de (stage, row 119) | 390 | the title 29 px lower, 30.7 % | 4 px, 20.5 % | |
| /pt-br (stage) | 390 | 31 px lower, 30.5 % | 6 px, 21.2 % | |
| /fr-fr/miles-and-go (one-slide banner, row 117) | 1440 | -7.7 %, banner 1,120 x 305 | -3 %, 1,176 x 404 at www's place | |
| /en-pt/help, /pt-pt/ajuda (FAQ gap, row 118) | 1440 | the contacts 32 px lower | at www's place; pt-pt 3 % pixels | |
| /en-pt/promos (two-up rows, row 120) | 1440 | the second row 43 px lower, 11.6 % | 1 px, 8.1 % | |

Corrections to the list above: pt-br help's "three contact groups where www shows one" was www's contacts finder still
loading in the capture (its grey placeholders); en-pt's capture shows www's groups as ours. "The contacts' picture 32
px lower" was the FAQ's title gap (row 118), not the finder.

Left: the homepages' pixels (www's pin drawn as one still card in a full-page capture, the stage's slide at the
capture); the Miles&Go banner's title wrap on phones (en-pt, pt-br: 25 px); the legal hubs' phone picture (www's
mobile crop; ours the desktop picture: a default-content picture has no art direction) and the hub's one-line tile
labels (cards-icon, ema-test's).

