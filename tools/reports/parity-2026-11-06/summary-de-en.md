# Visual parity, lufthansa.com de/en, 2026-11-06

Full pixel run of the 305 de/en jobs of tools/parity/jobs.json at 1440, 768 and 390 against
2026-10-25's (tools/reports/parity-report.md, all four locales; its de/en rows here).

- **www**: fresh captures by the user's capture child (segment parity-full-2026-11-06, parts
  lh-parity-002a to -002d, sha256 checked, 296 of 305 pages; overlay scrollbar, layout width =
  viewport, as capture.json gives it per page). Two differences to 2026-10-25: classic scrollbar
  then (1425 px of layout), full consent on www now (C0001, C0002, C0004, C0005).
- **Ours**: https://main--lh-com--moved-permanently.aem.live (published content), tools/parity
  capture.js and compare.js --mask (live-data widgets masked as before), the code of main at
  2026-11-06 06:00 UTC (the fixes below included). Thresholds as report.mjs: pass <= 8 %
  unmasked at every width with no overflow or failed image, review <= 20 %, fail worse.
- **Full detail** (report.mjs's per-page report, 5.7 MB markdown, 6.9 MB JSON) stays out of git;
  this summary, the rows and the path lists are committed.

## Summary

Locale de/en: 305 pages, report of 2026-11-06T06:52:16.498Z against 2026-10-25T08:21:02.840Z (305 pages).

| Status | pages now | then |
|---|---:|---:|
| pass | 40 | 6 |
| review | 160 | 140 |
| fail | 96 | 159 |
| pending | 9 | 0 |
| error | 0 | 0 |

Per template and width (page-widths: pass / review / fail, mean unmasked mismatch), worst mean now first:

| Template | Width | Page-widths | pass | review | fail | Mean now | Mean then | pass / review / fail then |
|---|---:|---:|---:|---:|---:|---:|---:|---|
| homepage | 1440 | 1 | 0 | 0 | 1 | 50.0% | 22.6% | 0 / 0 / 1 |
| homepage | 768 | 1 | 0 | 0 | 1 | 46.1% | 35.8% | 0 / 0 / 1 |
| homepage | 390 | 1 | 0 | 0 | 1 | 45.0% | 22.3% | 0 / 0 / 1 |
| campaign | 1440 | 21 | 1 | 8 | 12 | 24.0% | 34.7% | 0 / 5 / 16 |
| campaign | 768 | 21 | 0 | 11 | 10 | 23.6% | 39.8% | 0 / 3 / 18 |
| campaign | 390 | 21 | 1 | 8 | 12 | 22.7% | 32.1% | 0 / 4 / 17 |
| hub | 390 | 16 | 2 | 8 | 6 | 19.8% | 22.3% | 1 / 5 / 11 |
| app-entry | 390 | 6 | 2 | 2 | 2 | 18.1% | 20.3% | 0 / 4 / 2 |
| hub | 768 | 16 | 2 | 10 | 4 | 17.0% | 25.0% | 1 / 7 / 9 |
| insights | 390 | 32 | 1 | 23 | 8 | 16.9% | 28.7% | 0 / 1 / 31 |
| insights | 768 | 32 | 1 | 22 | 9 | 16.7% | 24.3% | 0 / 10 / 22 |
| hub | 1440 | 16 | 4 | 7 | 5 | 16.5% | 21.4% | 1 / 4 / 12 |
| insights | 1440 | 32 | 4 | 17 | 11 | 16.1% | 22.4% | 0 / 16 / 16 |
| fleet | 1440 | 8 | 3 | 3 | 2 | 15.3% | 15.0% | 3 / 4 / 1 |
| info | 768 | 173 | 49 | 84 | 40 | 14.8% | 19.1% | 17 / 100 / 64 |
| info | 390 | 173 | 47 | 91 | 35 | 14.6% | 17.7% | 6 / 126 / 49 |
| fleet | 390 | 8 | 2 | 5 | 1 | 14.5% | 15.9% | 1 / 6 / 1 |
| fleet | 768 | 8 | 3 | 4 | 1 | 13.8% | 30.5% | 1 / 1 / 6 |
| info | 1440 | 173 | 77 | 66 | 30 | 13.0% | 13.0% | 66 / 81 / 34 |
| form | 390 | 9 | 2 | 6 | 1 | 12.9% | 18.8% | 0 / 7 / 2 |
| flight-status | 390 | 1 | 0 | 1 | 0 | 12.7% | 9.7% | 0 / 1 / 0 |
| form | 768 | 9 | 3 | 5 | 1 | 12.6% | 19.6% | 2 / 4 / 3 |
| form | 1440 | 9 | 5 | 3 | 1 | 11.8% | 14.4% | 4 / 3 / 2 |
| app-entry | 768 | 6 | 2 | 3 | 1 | 11.8% | 18.6% | 1 / 3 / 2 |
| legal | 390 | 29 | 12 | 14 | 3 | 11.3% | 17.7% | 0 / 25 / 4 |
| legal | 768 | 29 | 11 | 16 | 2 | 10.8% | 15.8% | 1 / 24 / 4 |
| legal | 1440 | 29 | 16 | 11 | 2 | 10.3% | 12.4% | 7 / 18 / 4 |
| app-entry | 1440 | 6 | 2 | 3 | 1 | 10.2% | 11.3% | 3 / 2 / 1 |
| flight-status | 768 | 1 | 0 | 1 | 0 | 9.7% | 9.3% | 0 / 1 / 0 |
| flight-status | 1440 | 1 | 1 | 0 | 0 | 4.7% | 5.1% | 1 / 0 / 0 |
| **all** | | 888 | | | | 15.0% | 19.2% | |

30 worst page-widths now:

| Page | Template | Width | Unmasked | Diverges at | Worst bands (y: share) | Height live / replica |
|---|---|---:|---:|---|---|---|
| /de/en/book-and-manage/stopover | campaign | 1440 | 56.5% | y≈200 | 600: 98.1%, 800: 93.8%, 200: 89.8% | 8000 / 8000 |
| /de/en/discover-lufthansa/take-off | campaign | 1440 | 51.5% | y≈800 | 6000: 79.4%, 5800: 79.3%, 3600: 79.0% | 4512 / 8000 |
| /de/en/book-and-manage/stopover | campaign | 768 | 51.3% | y≈200 | 600: 98.3%, 800: 93.3%, 4200: 89.8% | 8000 / 8000 |
| /de/en/book-and-manage/pax-receipt | info | 1440 | 50.6% | y≈800 | 1800: 97.6%, 1600: 97.4%, 1200: 95.6% | 2088 / 1530 |
| /de/en/first-class | info | 1440 | 50.5% | y≈400 | 3000: 88.5%, 5000: 88.3%, 4800: 81.0% | 8000 / 8000 |
| /de/en/homepage | homepage | 1440 | 50.0% | y≈400 | 4600: 97.8%, 4000: 96.8%, 4400: 96.3% | 5065 / 4364 |
| /de/en/discover-lufthansa/take-off | campaign | 768 | 49.7% | y≈600 | 6800: 96.0%, 6600: 92.1%, 3800: 90.1% | 4221 / 7148 |
| /de/en/book-and-manage/pax-receipt | info | 390 | 49.3% | y≈1000 | 2000: 96.0%, 1800: 93.5%, 1200: 90.0% | 2484 / 1846 |
| /de/en/book-and-manage/pax-receipt | info | 768 | 48.2% | y≈800 | 1800: 96.4%, 1600: 95.3%, 1000: 91.0% | 2087 / 1570 |
| /de/en/flights | hub | 390 | 48.0% | y≈1000 | 4800: 90.7%, 5000: 87.7%, 4600: 85.9% | 8000 / 5399 |
| /de/en/homepage | homepage | 768 | 46.1% | y≈400 | 5400: 96.6%, 4600: 94.0%, 5200: 93.5% | 5738 / 4911 |
| /de/en/doctor-on-board-news | info | 390 | 45.8% | y≈1400 | 2400: 95.1%, 2600: 94.9%, 2000: 89.0% | 2383 / 3087 |
| /de/en/business-class-on-short-and-medium-haul | info | 390 | 45.7% | y≈600 | 3800: 84.1%, 3000: 80.0%, 1000: 66.5% | 3900 / 4127 |
| /de/en/book-and-manage/digital-self-services/airline-apps | info | 768 | 45.2% | y≈1000 | 1800: 96.0%, 1200: 92.6%, 1000: 77.6% | 2234 / 1733 |
| /de/en/homepage | homepage | 390 | 45.0% | y≈600 | 5600: 95.5%, 5800: 94.1%, 5000: 93.7% | 6175 / 5529 |
| /de/en/first-class | info | 768 | 44.8% | y≈400 | 4800: 88.2%, 6200: 84.5%, 800: 82.2% | 8000 / 8000 |
| /de/en/first-class | info | 390 | 44.5% | y≈400 | 2200: 88.8%, 1600: 86.7%, 800: 84.6% | 8000 / 8000 |
| /de/en/advance-seat-reservation | info | 1440 | 44.4% | y≈1200 | 6400: 78.3%, 5600: 77.3%, 3200: 76.9% | 8000 / 8000 |
| /de/en/faq-data-security | legal | 390 | 44.3% | y≈800 | 1600: 93.9%, 1400: 93.7%, 1000: 87.8% | 1550 / 1999 |
| /de/en/during-your-trip/internet-overview | info | 390 | 44.0% | y≈200 | 800: 79.9%, 4600: 64.1%, 3000: 64.0% | 4671 / 4883 |
| /de/en/prepare-for-your-trip/special-travel-needs/medical-travel-companions | info | 390 | 44.0% | y≈600 | 2800: 95.1%, 3000: 94.9%, 2400: 85.6% | 2747 / 3479 |
| /de/en/discover-lufthansa/take-off | campaign | 390 | 43.9% | y≈800 | 6400: 94.9%, 5600: 88.2%, 5800: 82.1% | 6888 / 6458 |
| /de/en/articles/tags | insights | 768 | 43.2% | y≈800 | 1800: 97.4%, 1200: 88.1%, 1000: 75.8% | 2180 / 1770 |
| /de/en/during-your-trip/internet-overview | info | 1440 | 42.5% | y≈200 | 800: 80.0%, 2000: 76.0%, 2400: 70.0% | 3133 / 3296 |
| /de/en/traveltricks | info | 390 | 42.1% | y≈1400 | 3800: 95.6%, 4600: 94.9%, 4400: 93.3% | 4536 / 5083 |
| /de/en/first-class-terminal | info | 768 | 41.8% | y≈1400 | 4400: 86.6%, 4200: 76.2%, 1600: 75.7% | 8000 / 8000 |
| /de/en/lufthansa-first-class-fleet | fleet | 1440 | 41.8% | y≈800 | 4400: 98.2%, 4200: 95.3%, 3800: 93.9% | 4157 / 4741 |
| /de/en/special-meals | info | 1440 | 41.7% | y≈200 | 6200: 98.3%, 6000: 95.2%, 4800: 91.4% | 5051 / 6520 |
| /de/en/overview-manage | hub | 390 | 41.7% | y≈400 | 4200: 90.2%, 3600: 78.1%, 800: 65.3% | 4356 / 4550 |
| /de/en/discover-lufthansa/new-onboard-experience | campaign | 390 | 41.4% | y≈600 | 7400: 89.1%, 7200: 86.4%, 6400: 84.9% | 8000 / 8000 |

## Fixed in this pass (lufthansa.com only: body.brand-lufthansa, the brand sites unchanged)

| What | Template | Commit | Measured against |
|---|---|---|---|
| Teaser rows (cards-teaser) 32 px under the intro, as www's .column-view padding; the card titles' own margins (32 px at 1440, 28 px at 390), which a body rule had outranked (every title 24 px) | hub (and every plain cards-teaser) | 6713a23a | www's archived /de/en/services-on-board (1440, 390) |
| Header 144 px on phones with the quick links 4 px lower (was 140: everything below the header 4 px too high at 390) | every page at 390 | 92293015 | capture.json of all 293 www pages; the quick links at y=95 |
| Article tag chips 16 px with 14 px padding (were 18 / 16, 8 to 13 px wider each) | insights | ad29435b | www's archived article, the chip's shadow DOM |
| The importer: a two-column row of teaser cards on insights pages as carousel-cards (info got it with 65afd3a2) | insights, info | 2b85374b | xx/hk's snapshot of childrens-menus-on-board, imported offline |
| The parity runner: a www screenshot that is not there yet waits instead of failing the page | (tooling) | 9f583b34 | test |

## Fixed in pass 2 (brief 424; lufthansa.com only where styling)

| What | Template | Commit | Measured against |
|---|---|---|---|
| Tab panels with picture and text rows (www's maui tab control) as Tab sections, their rows as columns-media; scripts/section-tabs.js forms the tabs (a tab list from 768 px, accordions below) | info, campaign (importer) | 515475be | xx/hk's snapshot of advance-seat-reservation, imported offline with a scratch bundle |
| The passenger receipt form (passenger-receipt block): www's fields, rules, errors, accent table and texts (en and de www's, 11 more languages ours), the hand-off; the importer maps www's passenger-receipt-portal to it | info | 333e172e, 601f9428 | www's pax-receipt capture (lh-parity-003 pax-receipt/, 1440 and 390) |
| Teaser rows straight in www's page column (option spacious): the first image 40 px (20) under the intro, 80 px (40) between rows, 40 px (20) to the footer, as www's .column-view there; ours had 32, 66, 48 | hub, info, campaign, app-entry, insights (importer + block) | 4cb9f04c | www's /de/en/overview-travel-information (lh-parity-003 html/) |
| Rows of column accordions: the title 64 px (44) under the text, 72 px to the accordions from 768 px, 30 px between stacked accordions, 80 px (40) to the next heading, as www's page-column .threecolumn and .accordion-maui | insights | f5d01a3c | www's /de/en/articles/tags (lh-parity-003 html/) |

## The re-imports and the chat-panel recaptures on aem.page (offline package of 2026-11-06, item 3)

The 45 re-import pages that have parity jobs (the 5 explore-the-world articles have none) and the 6
chat-panel pages, at 1440, 768 and 390, on main--lh-com--moved-permanently.aem.page (previewed, not
published) against www: this morning's lh-parity-002 screenshots, the chat-panel pages lh-parity-003's
recaptures with the chat closed. 144 page-widths compared (9 without a www screenshot:
south-africa-winter-promotion, a 404 on www, and the alias pages business-class and flynet, which
redirect there). Against report-final (aem.live, before):

| | then | now |
|---|---|---|
| mean unmasked mismatch | 21.8 % | 17.7 % |
| pass / review / fail | 17 / 55 / 72 | 20 / 75 / 49 |

42 page-widths better by more than 2 points, none worse by more than 2. The largest: the homepage
50.0 -> 16.5 % (1440), 45.0 -> 9.5 % (390); special-meals 41.7 -> 9.4 %; contact-form-confirmation
(390) 39.3 -> 10.7 %; internet-overview 42.5 -> 13.9 %. Unchanged: the pages whose documents did not
change (seat-maps, shopping, meetings-and-events: 061 imports it as DA has it, its difference is
not in the document). Every page-width: reimport-then-now.md.

## Open rows

| Row | Pages | Kind | Owner |
|---|---|---|---|
| www's chat panel in the www screenshots: recaptured with the chat closed (lh-parity-003) and compared again (item 3 below) | chat-panel.txt | www capture | done |
| Not captured on www: 6 aliases redirect (lounges, business-class, digital-travel-companion, flynet, freigepaeck-regeln, rechnungsbeleg); 3 are www 404s now (child-restraint-systems, local-page/south-africa-winter-promotion, event/dghm-2026) | 9 | content | the user: keep, redirect or retire the 3 pages www dropped |
| Content changed on www since our import: re-imported from lh-snapshots-061/062 and previewed (offline package, item 2), except business-class and first-class, held for a person's DA edit | reimport-content.txt | content | done; the 2 held: Ben |
| Imported before the importer could: re-imported with rebuilt bundles and previewed (offline package, item 2), 2 held (above) | reimport-importer-fixes.txt (48) | import | done |
| The flights hub's destination finder: www's grid full of offers, ours empty (the offer API does not answer this environment); masked, but the page is 4,000 px shorter | /de/en/flights | live data (impossible.md) | none |
| pax-receipt's receipt form: built (passenger-receipt, pass 2). Open: on the own www host the block needs www's runtime-config (the receipt service's URL and key) on its origin to download; off it, a valid form opens www's page | 16 pax-receipt pages (preview-pax-receipt.txt) | functional | the user: who serves the config on the own host (lh-edge or a backend) |
| Tabs whose panels hold image and text rows: the importer makes them Tab sections (pass 2); the documents come with a re-import once the info and campaign bundles are rebuilt | reimport-tabs.txt (7) | import | the user's harness: rebuild the bundles, re-import |
| The overview hubs' rows: fixed (pass 2, option spacious); other markets and the de/en pages whose page-column rows are other blocks get it with their next import | preview-spacious.txt (6, de/en) | import | the user's harness: rebuild the hub, info, campaign, app-entry and insights bundles |
| The article tags overview: fixed (pass 2). At 390 www's headed capture wraps the intro one line longer (27 px) than ours; the same text at the same width wraps alike in a headless browser (the renderer, not CSS) | /de/en/articles/tags | renderer | none |
| Moving images and stage videos at another frame; the sticky price bar over the lede in www's phone screenshots | campaign, insights | impossible.md (animated content, live data) | none |
| Consent: www was captured with full consent (C0001, C0002, C0004, C0005), ours necessary-only | all | by design (impossible.md) | none |

Path lists in this folder: reimport-importer-fixes.txt (48), reimport-content.txt (3), chat-panel.txt (www recaptures); pass 2: reimport-tabs.txt (7, after the info and campaign bundles are rebuilt), preview-pax-receipt.txt (16, the form, uploaded and previewed), preview-spacious.txt (6, the option spacious, uploaded and previewed). Nothing published.
