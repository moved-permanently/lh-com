# Published Cargo, Discover and Air Dolomiti pages outside the last sweep (2026-11-09, the brief after 509)

The pages published on the live hosts (a HEAD request per document on main--<site>--moved-permanently.aem.live) that
the sweep against the captures (sweep-brands.md) did not cover: **Cargo 950, Discover 533, Air Dolomiti 1509**. None
of them has a recording: the archives hold no other page of these brands that renders (s005's Cargo story snapshots
carry no CSS, m002 and m003 media only). So nothing here is compared with www and no www figure is guessed. The lists
are unrecorded-510-cargo.txt, unrecorded-510-discover.txt and unrecorded-510-airdolomiti.txt.

## What was checked (our side only)

Each page on its brand host (cargo, discover, airdolomiti .turnsthe.page: published content, main's code), one page
at a time in headless Chrome at 390 x 844 and 1440 x 900, www's hosts unresolvable, the showcase notice acknowledged
and consent chosen once. Recorded: the page wider than the screen, pictures in main that failed, same-host
responses of 400 and more, blocks with neither text nor media, the h1 count. A page that answered 400 or more: none.

## Ranked, worst first

| # | Pages | What | Cause | Owner | State |
| --- | --- | --- | --- | --- | --- |
| 1 | Air Dolomiti en/articles/destinations/street-food-in-munich | the page 813 px wide at 390 | an h3 holding a paragraph, bold words and a photo at its end took the icon heading's flex row | mine (styles.css) | fixed, Air Dolomiti row 74 (fd757777) |
| 2 | Cargo de/industrien-oel-gas, en/industries-oil-gas | 141 px past a 390 screen | the gallery's dots on one row | mine (Cargo theme) | fixed, Cargo row 42 (b256a7aa) |
| 3 | Air Dolomiti articoli/didyouknow/come-si-vernicia-…, en/articles/dyk/how-to-paint-an-aeroplane, de/artikel/did-you-know/wie-wird-ein-flugzeug-lackiert-… | 127 px past a 390 screen | a URL written as text in a paragraph, unbroken | mine (styles.css) | fixed, Air Dolomiti row 72 (ac445d11) |
| 4 | Air Dolomiti de/gepaeck/handgepaeck, elektronische-gegenstaende-und-batterien, gefaehrliche-gegenstaende, gepaeckinformationen; de/faq-de/an-bord, reisevorbereitungen-faq; de/fluginformationen | 8 to 105 px past a 390 screen | a 34 px accordion title's long German word, its flex item unable to shrink | mine (accordion-columns block) | fixed, Air Dolomiti row 73 (c87eaaa1) |
| 5 | Discover de/de/book/baggage/sports-baggage-and-special-baggage/register-hunting-firearm, register-sporting-firearm | 65 px past a 390 screen | a radio option's label, one word joined by slashes | mine (form block) | fixed, Discover row 39 (25d3e87c) |
| 6 | Air Dolomiti de/reisetipps/sicherheitskontrolle-am-flughafen, de/artikel/did-you-know/wer-hat-das-klapptischchen-im-flugzeug-erfunden | 33 and 26 px past a 390 screen | running text unbroken, as 3 (both 390 px wide with row 72's rule alone) | mine (styles.css) | fixed with row 72 |
| 7 | Cargo de/industrien-kunst, en/industries-fine-arts | 21 px past a 390 screen | as 2 | mine (Cargo theme) | fixed with row 42 |
| 8 | Discover de/de/travel-inspiration/winter-destinations | a broken picture (/icons/innen.svg) in running text | "Naturliebhaber:innen:" (the gender colon, then the sentence's colon): the document holds `:innen:` as an icon | the Discover importer and its document (mine), the icon syntax Edge Delivery's | open: wants your decision, how the document writes that word (the importer could keep the gender colon and drop the token, or write "Naturliebhaber*innen:"); then one re-import |
| 9 | Discover, 15 blocks on 14 pages (de/de, de/en, xx/fr book/baggage/excess-baggage, sports-baggage-and-special-baggage, book/travel-information/lounges, legal/data-protection-information/privacy-policy-of-discover-airlines, de/en/legal/passenger-rights) | an accordion-columns block with neither text nor media | the importer wrote an accordion with one empty cell (on excess-baggage right before "This might also be of interest to you"); what www has there is in no recording | the Discover importer (mine) | open: 0 px, nothing visible; the importer can drop an accordion without items, with the next Discover re-import |
| 10 | Cargo es, fr, it, pt /ci/sustainable-development-goals | no h1 | the document has none; www's page source has none either | content (Cargo) | as www, no change |
| 11 | Discover smart-destination-search, culinaryjourney, feedback (de/de, de/en, xx/fr) | no h1 | application pages whose app draws the heading | the apps | as built, no change |
| 12 | Discover, 7 flash-teaser and 3 security-waiting-time blocks | empty | filled at run time (the flash sale's feed, the waiting times' service), none offline | — | expected |
| 13 | Cargo, every page | 404 responses for other languages' pages | the header's language switch asks whether each language has the page (HEAD); a missing counterpart answers 404 | by design | no change |
| — | Discover tables (20), carousels on all three | elements past the screen's edge | inside scroll boxes and carousels; the page itself not wider | — | as built |

19 pages were wider than the screen at 390 (Cargo 4, Discover 2, Air Dolomiti 13), all fixed by rows 42, 39, 72, 73 and 74.
At 1440 no page of the three brands is wider than the screen, and nothing appears there that 390 does not show. One
reading said otherwise: Air Dolomiti's /aeroporti, the run's first page, 40 px wider with nothing in main past the edge
and 2,545 px shorter than the page is. Two fresh runs gave 0 for it and for /en/airports: measured while still loading.
