# lufthansa.com info pages, standing order 32 (2026-11-15)

Every info page lh-parity-002a-d hold (173 pages, the same 346 page-widths as sweep-lh-baseline.md's info row of
2026-11-09), as published on lufthansa.turnsthe.page with the code deployed at ~18:20-18:50 UTC (main to 7a6744b8;
ema-lufthansa's columns-media commits 28468fc8 and a4e99c2e landed during the run), at 1440 and 390, against the newest
recording (tools/parity/compare.js, the first 8,000 px; full Chrome, the drops' fonts). Newest recording: lh-parity-002a-d (2026-11-06) for 167 pages; for 6 pages the 116 lh-snapshots drops (sha256 in logs/p4/so32/snaps-fetched.txt) hold a newer one, lh-snapshots-115 (2026-11-13): its 1440 is used; its 390 is a resize from 1440, so 390 stays on 002's phone first load, the resize's figure noted. No request to www or any airline
host. Runner: logs/p4/so32/sweep.sh (not in git).

Two things changed in how pages are measured, so read the figures with them:
- the live boxes each capture records (video stages, live widgets) are masked (compare.js --mask <capture>.json); the
  11-09 baseline did not mask them. Unmasked, the median is 6.5 % and 16 page-widths are at 20 % or more;
- since standing order 12 a capture refuses every host but ours. The four car-rental pages' partner widget (Meili,
  direct-ux.meili.travel, not an airline host) was refused, which cut those pages to a third of www's height (48 % on
  lh-rentalcar 1440). They are measured again with that one host let through (a scratch copy of the tools, not in git)
  and masked (the widget is a live box); those are the figures below. YouTube embeds are refused too and are not live
  boxes (business-class-on-long-haul-routes): their box counts as a difference.

## Summary

| | 2026-11-09 | now |
| --- | --- | --- |
| page-widths | 346 | 346 |
| median % | 9.1 | 6.4 |
| at 20 % or more | 26 | 8 |
| at 15 % or more | | 18 |
| at 10 % or more | | 65 |

## Every page-width at 12 % or more, worst first

| Page | Width | % | Height www / ours | Masked % of the page | 11-09 % (where the baseline lists it) |
| --- | --- | --- | --- | --- | --- |
| /content/lh/markets/de/en/during-your-trip/lounges/loungenet/fra-first-class-lounge-b | 390 | 28.1 | 6129 / 5997 | 0.0 | 36.7 |
| /content/lh/markets/de/en/during-your-trip/lounges/loungenet/muc-first-class-lounge | 390 | 28.1 | 6129 / 5997 | 0.0 | 36.7 |
| /de/en/lufthansa-business-class-on-long-haul-routes | 390 | 23.9 | 4467 / 4532 | 0.0 | 31.3 |
| /de/en/first-class-terminal | 390 | 23.0 | 8000 / 8000 | 10.1 | 32.2 |
| /de/en/first-class | 390 | 22.3 | 8000 / 8000 | 8.0 | 27.7 |
| /de/en/traveltricks | 390 | 22.2 | 4536 / 4467 | 0.0 | 32.2 |
| /de/en/discover-lufthansa/miles-and-more-credit-card | 390 | 21.3 | 8000 / 8000 | 0.0 | 21.7 |
| /de/en/traveltricks | 1440 | 20.3 | 3772 / 3692 | 0.0 | 20.5 |
| /de/en/book-and-manage/flights/giftvoucher | 390 | 19.8 | 6926 / 6838 | 0.0 | 24 |
| /de/en/lufthansa-business-class-on-long-haul-routes | 1440 | 17.6 | 3169 / 3208 | 0.0 | 29 |
| /de/en/with-children-at-the-airport | 390 | 17.6 (against lh-snapshots-115's 390, a resize from 1440: 8.7) | 4239 / 4030 | 0.0 |  |
| /de/en/unterhaltung-an-bord | 1440 | 16.5 | 2960 / 3064 | 0.0 | 18.6 |
| /de/en/lh-rentalcar | 390 | 16.3 | 3591 / 3472 | 50.6 | 16.5 |
| /de/en/carry-on-baggage | 1440 | 16.1 | 6601 / 6355 | 0.0 | 18.9 |
| /de/en/lufthansa-aviation-group | 1440 | 15.7 | 2750 / 2703 | 0.0 | 15.9 |
| /de/en/unterhaltung-an-bord | 390 | 15.4 | 3681 / 3553 | 0.0 | 18.7 |
| /de/en/travelling-healthy | 390 | 15.4 | 4656 / 4911 | 0.0 |  |
| /de/en/economy-class | 390 | 15.0 | 8000 / 8000 | 10.1 | 34.1 |
| /de/en/tips-senior-travellers | 1440 | 14.6 | 8000 / 8000 | 1.8 | 25.5 |
| /de/en/during-your-trip/internet-overview | 390 | 14.3 | 4671 / 4713 | 0.0 | 22.5 |
| /de/en/lounge-companions | 390 | 14.2 | 4765 / 5025 | 0.0 |  |
| /de/en/advance-seat-reservation | 1440 | 14.0 | 8000 / 8000 | 0.0 |  |
| /de/en/lufthansa-aviation-group | 390 | 14.0 | 3807 / 3783 | 0.0 |  |
| /de/en/prepare-for-your-trip/entry-regulations/entering-schengen/entry-exit-system | 390 | 13.7 | 8000 / 8000 | 0.0 | 19.3 |
| /de/en/premium-economy-class | 390 | 13.4 | 8000 / 8000 | 10.1 | 23.2 |
| /de/en/business-class-on-short-and-medium-haul | 1440 | 13.3 | 2867 / 2836 | 0.0 |  |
| /de/en/prepare-for-your-trip/travelling-with-children/child-in-businessclass | 390 | 13.3 | 5792 / 5931 | 0.0 |  |
| /de/en/book-and-manage/flights/giftvoucher | 1440 | 13.2 | 4431 / 4368 | 0.0 |  |
| /de/en/gefaehrliche-gegenstaende | 390 | 13.2 | 8000 / 8000 | 0.0 |  |
| /de/en/cash-and-miles | 390 | 13.1 | 4197 / 4094 | 10.1 |  |
| /de/en/lufthansa-at-berlin-airport | 390 | 13.1 | 4307 / 4462 | 0.0 |  |
| /de/en/discover-lufthansa/miles-and-more-credit-card | 1440 | 13.0 | 5118 / 4989 | 0.0 |  |
| /de/en/prepare-for-your-trip/getting-to-and-from-the-airport/lufthansa-express-rail-briefing | 390 | 13.0 | 3561 / 3477 | 0.0 |  |
| /de/en/prepare-for-your-trip/special-travel-needs/travel-with-needs/cognitive-impairment | 1440 | 12.9 | 7577 / 7287 | 0.0 |  |
| /de/en/lufthansa-express-bus | 390 | 12.8 | 7755 / 7869 | 0.0 |  |
| /de/en/discover-lufthansa/flightreservation-priceguarantee | 390 | 12.7 | 4784 / 4781 | 0.0 |  |
| /de/en/prepare-for-your-trip/travel-classes/economy-basic | 390 | 12.3 | 4969 / 4933 | 0.0 |  |
| /de/en/tips-senior-travellers | 390 | 12.3 | 8000 / 8000 | 0.0 | 15.4 |
| /de/en/advance-seat-reservation | 390 | 12.1 | 8000 / 8000 | 0.0 | 22.6 |
| /de/en/during-your-trip/lhg-wifi | 390 | 12.0 | 6043 / 6173 | 0.0 | 17.9 |
| /de/en/lufthansa-corporate-customers | 390 | 12.0 | 4115 / 4147 | 0.0 |  |

## The worst ten: cause and fix

All located on the captures (crops of www's recording and ours at the drift's steps). The fixes are not shipped
tonight; why is in each line. Two reasons repeat: the cause is in Columns Media, which ema-lufthansa changed twice in
the last hour (28468fc8, a4e99c2e) and which every lufthansa.com template uses, so a rule there moves pages this sweep
did not measure; or the cause is section-level spacing in styles/styles.css (shared, changed at 17:29 UTC by
8bf6a686). The order allows no unmeasured page to move by more than 0.5 points, so each is handed over as a
located draft.

| # | Page, width, % | Cause (located) | Fix | Status |
| --- | --- | --- | --- | --- |
| 1 | /content/lh/markets/de/en/during-your-trip/lounges/loungenet/fra-first-class-lounge-b 390, 28.1 | the page is one fragment (/de/en/fragments/loungenet-first-class-lounge): its Columns Media teasers set the link 36 px under the picture, www 53 (-17 px per teaser), plus a few heading gaps | Columns Media on lufthansa.com phones: a link-only paragraph after a picture paragraph 17 px further (block-scoped) | HOLD: Columns Media is in another session's hands tonight; reaches every template |
| 2 | /content/lh/markets/de/en/during-your-trip/lounges/loungenet/muc-first-class-lounge 390, 28.1 | the same fragment as #1 | as #1 | HOLD (as #1) |
| 3 | /de/en/lufthansa-business-class-on-long-haul-routes 390, 23.9 | the YouTube embed is refused in the capture (a box of 346 x 194 px counts as different); and the flush grey band after the section that ends with the video's Columns Media 25 px lower than www's (our 48 px section gap, www's about 23) | the band gap: section-level (styles.css) for a section ending with Columns Media before a flush band or a stage, lufthansa.com only | HOLD: styles.css (shared, changed tonight); census needed across lufthansa.com's templates |
| 4 | /de/en/first-class-terminal 390, 23.0 (25.7 unmasked) | the stage video's frame (masked now); the text to the next full-width stage 96 px, www 71 (the same +25 as #3) | as #3 | HOLD (as #3) |
| 5 | /de/en/first-class 390, 22.3 | stacked Columns Media pictures 32 px apart on phones, www 57 (-25 px a pair, eight times down the page) | Columns Media on lufthansa.com phones: stacked picture-only cells 25 px further apart | HOLD (as #1) |
| 6 | /de/en/traveltricks 390, 22.2 | the store buttons and the gaps around them (-51 px at www y 1000, -70 at 3000): rows by another session, uploaded and not published (8bf6a686, b3ed366c) | theirs; measure again once published | not mine tonight |
| 7 | /de/en/discover-lufthansa/miles-and-more-credit-card 390, 21.3 | www's text in the padded Columns Media is narrower (lines end by about 357 px, ours 368): each text wraps a line later on ours, -28 to -32 px a text block | Columns Media padded on lufthansa.com phones: www's narrower text column (the measure from www's column-view padding) | HOLD (as #1) |
| 8 | /de/en/traveltricks 1440, 20.3 | as #6 | as #6 | not mine tonight |
| 9 | /de/en/book-and-manage/flights/giftvoucher 390, 19.8 | the line under a Carousel Cards card ("Visit the FAQs"): ours 10 px under the card (order 24's rule), www's ink 47 px under it on phones, and the next card 27 px lower | carousel-cards.css, lufthansa.com below 768 px: .carousel-cards-below top calc(100% + 42px), the slide's margin-bottom 61px | HOLD: 7 lufthansa.com documents have the shape; de/de giftvoucher (the same cards, not recorded) would move, by about as much as de/en (more than 0.5 points), unmeasured |
| 10 | /de/en/lufthansa-business-class-on-long-haul-routes 1440, 17.6 | as #3 at 1440 (the embed refused; the band gap) | as #3 | HOLD (as #3) |

Not in the ten after all: /de/en/with-children-at-the-airport (390 17.6 against 11-06, 8.7 against 11-13; 1440 14.2 -> 5.0): www dropped a sentence and two links after 11-06 (order 27's reimport-so27-with-children-at-the-airport-lh-com.txt), our page is already as www's now. Also over 15 %: /de/en/unterhaltung-an-bord 1440 / 390 (16.5 / 15.4),
/de/en/lh-rentalcar 390 (16.3, with the partner widget), /de/en/carry-on-baggage 1440 (16.1) - not diagnosed tonight.
