# lufthansa.com against lh-parity-004a/b: the capture list's 84 pages (brief 538 item 2)

ema-adobe, 2026-11-09. The capture child's recordings of [capture-list-lh-hub-video.txt](capture-list-lh-hub-video.txt)
(brief 521 item 3), lh-parity-004a.tar.gz (44 pages) and lh-parity-004b.tar.gz (40), from the R2 drop. Their sha256
values match the brief: 643a8e35… and b2b2f085…. They are kept in logs/b538/arch, unpacked in logs/b538/x, and not
committed. All 84 pages are recorded, the four lounges roots by their target: www now answers `/<root>/lounges` with
`/<root>/during-your-trip/lounges`.

Method as [sweep-lh-recheck.md](../parity-2026-11-08/sweep-lh-recheck.md): each published page on
lufthansa.turnsthe.page with the deployed code (logs/b538/sweep-shard.sh, a copy of logs/b505's), at 1440 and 390,
against the recording (tools/parity/compare.js, the first 8,000 px), plus the drift steps (logs/b460/offsets.mjs).
That makes 168 page-widths; ranked by logs/b538/rank.mjs. No request to www. Nothing uploaded or published.

## Per page type

| page type | part | page-widths | mean % | median % | >= 20 % | worst |
| --- | --- | --- | --- | --- | --- | --- |
| hub (incl. lounges and the meetings-and-events roots) | A, C | 120 | 13.7 | 10.3 | 19 | 47.6 (/de/de/fluege 390) |
| insights (video documents) | B | 18 | 16.5 | 14.9 | 4 | 28.0 (/gb/en/articles/highlights/all-it-takes-is-a-yes 1440) |
| campaign (video and re-import documents) | B, C | 30 | 11.6 | 10.35 | 2 | 25.7 (/at/de/100-years/destinations 1440) |

By part: A (hub without a recording) 104 page-widths, mean 12.9 %; B (video documents) 36, mean 14.9 %; C (pages
that settle a cause) 28, mean 14.4 %.

## Worst first, with the cause

| page-widths | % | cause | whose / status |
| --- | --- | --- | --- |
| /de/de/fluege, /at/de/fluege, /gb/en/flights, /de/en/flights (8) | 38.6-47.6 | the destination finder's offers are live data: ours shows "No results for your current origin selection" on this machine, www's grid of 40+ offers (8,000 px vs 3,900-5,500) | not a layout cause; the user checks the finder on our host from a normal browser |
| /de/en, /de/de, /at/de, /gb/en overview-manage 390 (4) | 39.8-41.6 | the recording settles brief 505's question: www's Check-in card has no picture, at 1440 and 390, on both recordings (11-06 and 11-09). Our documents carry it: de/en is the stale document (its fresh draft from lh-snapshots-085 is 19.6 %), and the other three are from 2026-10-24 | a re-import of the four with the hub bundle; harness list reimport-497 part 2 (de/en); de/de, at/de, gb/en added below |
| /xx/hk/meetings-and-events 390 / 1440 | 34.4 / 15.8 | ours 454 / 217 px shorter: the steps' text width (below, fixed) and the hk page's own text | the re-import below |
| /de/de, /at/de, /gb/en meetings-and-events and the six others at 1440 (10) | 9.0-10.6 | **the steps' text at two thirds of the card** (www .richtext.limited-width) | **fixed, 0c9f092** (parser + block); re-import list reimport-538-card-text-width-lh-com.txt (10) |
| /gb/en/articles/highlights/all-it-takes-is-a-yes 1440 | 28.0 | waits for its re-import (brief 507: its draft is 9-16 points better than DA's document) | the harness's re-import list |
| /de/de, /at/de 100-years/destinations 1440 | 25.6-25.7 | both 8,000 px (truncated); drift in the carousel rows | open, below 1 row |
| /gb/en, /de/de, /at/de airport-information 390, overview-travel-information 390, lufthansa-travel-classes 390 (12) | 18.6-25.4 | **our text runs 1.3-1.4 % narrower than www's** at the same size (18 px LufthansaText: the intro line 288 px vs 292). Fewer lines wrap, so the page drifts up 27 px per paragraph that loses a line. At 390 the footer's legal row also loses a line on de pages ("Passagierrechte" and "Erklärung zur Barrierefreiheit" fit in one row on ours, -41 px) | open: font files or rendering; the cause is the same on every page, so I measure before changing anything |
| /de/de, /at/de, /de/en, /gb/en during-your-trip/lounges 1440 (4) | 10.5-17.4 | three steps that compensate each other: -47 px in the lounge finder's band (its live data from www's API is refused on our host, CORS) and the intro (one line less), then **+50 px after the grey band**. The documents open the next column view with `{column-start}` twice (64 px; www 64 px in all after the band) | measured: one start's padding (a CSS rule `p.column-start + p.column-start { padding-top: 0 }`) brings the page 32 px nearer www in height but 17.4 -> 22.1 %, because the -47 px above is no longer compensated. Not committed; settle after the finder renders on the real host |
| /de/de/meetings-and-events 1440 (and its roots) | +/- 35 | the partner logo row (columns-media cell-slider) 35 px shorter than www's | ema-cashub's parser (brief 515) |
| meetings-and-events steps | +20 | www's card has a 20 px separator (hr-no-layout) between its text and the button; the parser drops it | open (cards-teaser parser: a separator in a card cell has no stand-in yet) |
| lufthansa-travel-classes 390 | -26 | the space between the grey band and the card stack below: www 50 px, ours 24 | open |

## Found on the way (functional, before parity by Ben's order)

- **The lounges hub moved on www.** `/de/de/lounges` now answers 301 to `/de/de/during-your-trip/lounges` (de/en,
  at/de, gb/en the same). Our host does the opposite: `/de/en/during-your-trip/lounges` answers 301 to `/de/en/lounges`.
  Moving a document and its redirect is a slug and content decision (ema-cashub's tools/slugs, yours). I changed
  nothing.
- **The lounge finder on lufthansa.turnsthe.page** asks www's API (`/service/api/catalogs/lounges/cities`,
  `/service/api/labels/loungefinder/…`) from our origin, and the browser refuses it (CORS): no cities, a short band.
  On www's own host the request is same-origin. This matters only while lufthansa.com is served from our host.

## Documents

- reimport-538-card-text-width-lh-com.txt: the ten meetings-and-events documents in release order, for the fix of
  0c9f092 (the local import harness re-imports, uploads and previews them; they are published in the next round, Ben's
  rule).
- overview-manage: /de/en is on the harness's reimport-497 list (part 2). /de/de, /at/de and /gb/en are from
  2026-10-24, and their re-import with the hub bundle drops the Check-in picture that www no longer shows. Release
  order: /de/en, /de/de, /at/de, /gb/en.
