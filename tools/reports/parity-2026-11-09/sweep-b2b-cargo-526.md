# The brief after 523: Group for Business and Cargo against the recordings (ema-lufthansa)

The published pages of lh-b2b on b2b.turnsthe.page and of lh-cargo on cargo.turnsthe.page against the
business.lufthansagroup.com and www.lufthansa-cargo.com pages recorded in brief 470 (b2b-parity-001, 26 pages, and
cargo-parity-001, 24 pages: 22 of ours, the feedback views share one path), offline, at 1440 and 390 px: the page height,
worst first by the larger difference (the method of sweep-austrian-brussels-cashub.md).

- **Published:** Group for Business 56,216 pages in its 187 sitemaps on b2b.turnsthe.page (612 language documents); Cargo:
  the 950 published pages outside the recorded ones (brief 510's list).
- **Not recorded:** listed, not guessed: `b2b-unrecorded-526.txt` (586 language documents, the market root dropped) and
  `cargo-unrecorded-526.txt` (950 pages).
- **Ours:** the published pages on the brand hosts (.scratch's sweep-ours.mjs and compare-471.mjs: the captures' settle
  method, www's hosts unresolvable); the causes from pixel rows of both screenshots and the recordings' measurements. After
  values: the brand hosts with this tree's CSS injected.
- **Sign-in pages:** /de/en and /de/de lhg4b-search-prelogin measure as www's (900 / 844 px); the login logic was not
  touched and no test account was used here.
- **Hosts:** b2b.turnsthe.page, cargo.turnsthe.page (pages, sitemaps). No request to any www.

## Fixed (one row per commit)

| Commit | Brand | Row | Pages | 1440 | 390 |
| --- | --- | --- | --- | --- | --- |
| `84fc8d14` | Cargo | 43: Support & Contact's support band: the opening hours as www's small print (12 / 20), the band ending 20 px above the footer (cargo.css) | en, de support-and-contact | 2435 -> 2335 px (www 2301, +5.8 -> +1.5 %) | 3254 -> 3130 (www 3066, +6.1 -> +2.1 %) |
| `fb5e1502` | Cargo | 44: eBooking's features text col-5 beside its picture, as both recordings (cargo.css; row 25 had col-4 from an earlier capture) | en, de ebooking-info | en 3915 -> 3853 (www 3771), de 3986 -> 3906 (www 3907) | unchanged (stacked) |
| `da6b22fc` | B2B | 34: contact's hotline finder as www's PartnerPlusBenefit box: the title a B2B h3 on one line, 30 px above, 48 / 30 below (b2b.css) | de/de, de/en about-us/contact | the box 811 + 487 (www 814 + 487); the page 3417 -> 3397 (www 3499) | the box 893 + 500 (www 896 + 510); 4056 -> 4102 (www 4153) |

Three rows per brand were asked for: Cargo two, B2B one. Cargo's three worst rows are a re-import, data and a recording;
of the rest, the article and fleet pairs have several small causes and no single rule in Cargo's files that I could measure
across pages. Group for Business has no page beyond 3 %: its other high rows are one page's own styling (Ben's rule keeps the
common style) or need the importer to tell two kinds of column view apart (below).

## Open: causes in the brands' own files that need more than one rule

- **B2B, a two-item column view under text in a white section (about-us de/de and de/en; celebrating-shared-stories):**
  www's .column-view has 4rem above (64 px from 768 px, 44 at 390); ours comes in as a carousel in the text's section, 24 px
  under it. The same arrangement on experts ("Lufthansa"), experts/news and route-network ("Für Unternehmen", "For
  companies") is within 2 % today and no recording of mine measures those three spots, so one rule for all of them is a
  guess. What decides it: those three pages' gaps in a recording, then a b2b.css rule
  `body.brand-b2b main > .section:not(.grey) .default-content-wrapper + .carousel-cards-wrapper` (44 px, 64 from 768 px).
- **B2B, nested column views (lufthansa-group-airlines de/en, de/de, +2.4 % at 1440):** www's airline rows are two-item views
  inside one view, 83 px apart; the homepage's rows are top-level views with a separator between, 106 apart (b2b.css row 10).
  Both import as rows of one columns-media block. The change: the B2B importer gives a block made of nested views an option
  (columns-media (nested)), b2b.css spaces its rows 83 px; then a re-import of the two documents.
- **Cargo, the story articles (142 arctic temperatures, en and de) and fleet (en, de):** listed in the ranking.

## Causes in other files (for their owners)

- **B2B contact, below the hotline finder (-40 px at 1440, -20 at 390):** the separator after the finder (`{divider}`, a
  `p.spacer.divider`) sits 4 px under the section's top on ours (the shared grey-after-grey join pulls the next grey section
  up), 20 / 40 px on www (the section's padding), and 26 px above the next picture (www 46 / 66). The divider markers are
  ema-test's and the grey join is the shared styles.css; not changed.

## Group for Business: the ranking

| # | Page | 1440 www / ours | 390 www / ours | Cause | Owner |
| --- | --- | --- | --- | --- | --- |
| 1 | /de/de/news/celebrating-shared-stories | 7754 / 7528 (-2.9 %) | 12092 / 11910 (-1.5 %) | www's own spacing on this page (48 px under its heading-small headings, 60 at 390; every other recorded page has the common 32 / 24) and a card title that wraps on www's narrower card (-24); the interview carousel 30 px higher (see about-us) | this page's www styling: Ben's rule keeps the common style; the carousel: B2B theme, open (below) |
| 2 | /de/de/about-us | 2771 / 2716 (-2.0 %) | 3497 / 3405 (-2.6 %) | the two-item column view under the text: www's .column-view has 4rem above (64 px from 768 px, 44 at 390); ours is a carousel in the text's section, 24 px under it | B2B theme / importer, open (below) |
| 3 | /de/en/travel-solutions/lufthansa-group-airlines | 4013 / 4108 (+2.4 %) | 5286 / 5312 (+0.5 %) | www's airline rows are two-item views nested in one view, 83 px apart; our columns-media rows get b2b.css's 106 px (row 10, measured on the homepage's top-level views with a separator between) | B2B importer, open (below) |
| 4 | /de/de/about-us/contact | 3499 / 3417 (-2.3 %) | 4153 / 4056 (-2.3 %) | the hotline finder: its title 18 / 24 bold in a 386 px column (www a B2B h3 on one line), 20 / 40 px around it (www 30 above, 48 / 30 below) | B2B theme: fixed, row 34 (da6b22fc) |
| 5 | /de/en/about-us | 2761 / 2706 (-2.0 %) | 3305 / 3261 (-1.3 %) | as /de/de/about-us | B2B theme / importer, open |
| 6 | /de/de/program/partner-plus-benefit | 3349 / 3282 (-2.0 %) | 5361 / 5262 (-1.8 %) | not traced (-2.0 %) | - |
| 7 | /de/en/program/experts | 4952 / 4865 (-1.8 %) | 9638 / 9559 (-0.8 %) | not traced (-1.8 %) | - |
| 8 | /de/en/travel-management/route-network | 4037 / 4061 (+0.6 %) | 5739 / 5839 (+1.7 %) | under 2 % | - |
| 9 | /de/de/travel-management/route-network | 4173 / 4154 (-0.5 %) | 5915 / 6015 (+1.7 %) | under 2 % | - |
| 10 | /de/de/travel-solutions/lufthansa-group-airlines | 4071 / 4142 (+1.7 %) | 5454 / 5432 (-0.4 %) | as /de/en/travel-solutions/lufthansa-group-airlines | B2B importer, open |
| 11 | /de/en/news/travel-id-now-required-for-online-check-in | 2520 / 2553 (+1.3 %) | 4457 / 4528 (+1.6 %) | under 2 % | - |
| 12 | /de/en/news/celebrating-shared-stories | 8265 / 8144 (-1.5 %) | 12438 / 12276 (-1.3 %) | as /de/de/news/celebrating-shared-stories | as above |
| 13 | /de/en/about-us/contact | 3070 / 3026 (-1.4 %) | 3832 / 3805 (-0.7 %) | as /de/de/about-us/contact | B2B theme: fixed, row 34 |
| 14 | /de/de/news/travel-id-now-required-for-online-check-in | 2530 / 2563 (+1.3 %) | 4605 / 4652 (+1.0 %) | under 2 % | - |
| 15 | /de/de/homepage | 5379 / 5320 (-1.1 %) | 8273 / 8318 (+0.5 %) | under 2 % | - |
| 16 | /de/de/travel-solutions/ndc | 1693 / 1675 (-1.1 %) | 2107 / 2109 (+0.1 %) | under 2 % | - |
| 17 | /de/en/news | 4161 / 4198 (+0.9 %) | 1298 / 1296 (-0.2 %) | under 2 % | - |
| 18 | /de/de/news | 4316 / 4352 (+0.8 %) | 1294 / 1292 (-0.2 %) | under 2 % | - |
| 19 | /de/de/program/experts/news | 5375 / 5343 (-0.6 %) | 18044 / 17982 (-0.3 %) | under 2 % | - |
| 20 | /de/en/program/experts/news | 5089 / 5115 (+0.5 %) | 15698 / 15694 (+0.0 %) | under 2 % | - |
| 21 | /de/de/program/experts | 4931 / 4915 (-0.3 %) | 9807 / 9761 (-0.5 %) | under 2 % | - |
| 22 | /de/en/homepage | 5200 / 5181 (-0.4 %) | 7892 / 7861 (-0.4 %) | under 2 % | - |
| 23 | /de/en/program/partner-plus-benefit | 3287 / 3280 (-0.2 %) | 5061 / 5042 (-0.4 %) | under 2 % | - |
| 24 | /de/en/travel-solutions/ndc | 1635 / 1641 (+0.4 %) | 1963 / 1965 (+0.1 %) | under 2 % | - |
| 25 | /de/en/lhg4b-search/lhg4b-search-prelogin | 900 / 900 (+0.0 %) | 844 / 844 (+0.0 %) | the sign-in page: the same height as www's | - |
| 26 | /de/de/lhg4b-search/lhg4b-search-prelogin | 900 / 900 (+0.0 %) | 844 / 844 (+0.0 %) | the sign-in page: the same height as www's | - |

## Cargo: the ranking

| # | Page | 1440 www / ours | 390 www / ours | Cause | Owner |
| --- | --- | --- | --- | --- | --- |
| 1 | /en/contact-us?reason=General%20request&subreason=Feedback%20%2F%20Complaints | 2301 / 1938 (-15.8 %) | 3105 / 2356 (-24.1 %) | the feedback form's view waits for its re-import (reimport-490-cargo.txt) | the harness (document) |
| 2 | /en/notification-overview | 1648 / 1486 (-9.8 %) | 1316 / 1283 (-2.5 %) | the header picture is not in DA | data |
| 3 | /de/notification-overview | 1648 / 1486 (-9.8 %) | 1355 / 1312 (-3.2 %) | the header picture is not in DA | data |
| 4 | /de/ci/facts-figures | 4952 / 4511 (-8.9 %) | 12482 / 13166 (+5.5 %) | the timeline: www's script sets each item's height | a recording (capture-list-brands.txt) |
| 5 | /en/ci/facts-figures | 4848 / 4547 (-6.2 %) | 11916 / 12398 (+4.0 %) | the timeline: www's script sets each item's height | a recording (capture-list-brands.txt) |
| 6 | /en/support-and-contact | 2301 / 2435 (+5.8 %) | 3105 / 3254 (+4.8 %) | the support band: its opening hours 18 px body text (the importer's <small> does not survive the conversion), 108 px before the footer (www 20) | Cargo theme: fixed, row 43 (84fc8d14): 1440 2435 -> 2335 (www 2301), 390 3254 -> 3130 (www 3066) |
| 7 | /de/news/142-arktische-temperaturen-an-bord | 7925 / 7609 (-4.0 %) | 8856 / 9157 (+3.4 %) | the story layout: www's stage pictures inset with a 'next story' chevron under each, more space around the text columns; ours wider, no chevrons (1440 shorter, 390 taller) | Cargo importer / theme, open: one article pair, no single rule |
| 8 | /en/ebooking-info | 3771 / 3915 (+3.8 %) | 5393 / 5516 (+2.3 %) | the features text col-4 (416 px; row 25, from an earlier capture), www col-5 (526) | Cargo theme: fixed, row 44 (fb5e1502): 1440 3915 -> 3853 (www 3771) |
| 9 | /en/fleet-ulds/fleet | 3043 / 3106 (+2.1 %) | 3841 / 3973 (+3.4 %) | several small: the picture first on phones and check-mark list items on www, 26 px more before 'Our fleet in detail', 50 px more before the footer (the home pages end as www's) | Cargo theme, open: no single rule |
| 10 | /en/news/142-arctic-temperatures-on-board | 7829 / 7561 (-3.4 %) | 8389 / 8640 (+3.0 %) | as /de/news/142-arktische-temperaturen-an-bord | Cargo, open |
| 11 | /de/fleet-ulds/fleet | 3089 / 3130 (+1.3 %) | 3918 / 4050 (+3.4 %) | as /en/fleet-ulds/fleet | Cargo, open |
| 12 | /en/ci/newsroom | 4430 / 4556 (+2.8 %) | 10631 / 10736 (+1.0 %) | not traced | - |
| 13 | /de/ci/newsroom | 4430 / 4556 (+2.8 %) | 10670 / 10788 (+1.1 %) | not traced | - |
| 14 | /de/ebooking-info | 3907 / 3986 (+2.0 %) | 5688 / 5834 (+2.6 %) | as /en/ebooking-info | Cargo theme: fixed, row 44: 1440 3986 -> 3906 (www 3907) |
| 15 | /de/ci/whats-up-now | 2732 / 2741 (+0.3 %) | 2713 / 2645 (-2.5 %) | not traced | - |
| 16 | /en/ci/sustainable-development-goals | 2363 / 2362 (+0.0 %) | 1735 / 1777 (+2.4 %) | not traced | - |
| 17 | /de/ci/sustainable-development-goals | 2363 / 2386 (+1.0 %) | 1870 / 1914 (+2.4 %) | not traced | - |
| 18 | /en/ci/whats-up-now | 2732 / 2741 (+0.3 %) | 2674 / 2616 (-2.2 %) | not traced | - |
| 19 | /en/industries-in-focus | 2515 / 2564 (+1.9 %) | 5347 / 5302 (-0.8 %) | under 2 % | - |
| 20 | /de/industries-in-focus | 2515 / 2540 (+1.0 %) | 5434 / 5427 (-0.1 %) | under 2 % | - |
| 21 | /en/home | 6064 / 6116 (+0.9 %) | 8389 / 8380 (-0.1 %) | under 2 % | - |
| 22 | /de/home | 6117 / 6168 (+0.8 %) | 8486 / 8491 (+0.1 %) | under 2 % | - |
