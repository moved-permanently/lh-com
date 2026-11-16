# lufthansa.com's other page types, standing order 35 (2026-11-16)

The recorded lufthansa.com pages that neither sweep-so34-lh-adobe.md (insights, campaign, hub, homepage) nor
sweep-so32-lh-info.md (info) covers: every page of the legal, form, fleet, app-entry and flight-status templates
(tools/importer/page-templates.json) with a recording, plus 10 recorded roots that no template lists (the four
during-your-trip/lounges and six meetings-and-events language roots, recorded under their short addresses). That is
63 pages, 126 page-widths, as published on lufthansa.turnsthe.page with the code deployed at 00:45-01:00 CET (main
at 78a0df3, before this order's commits), at 1440 and 390, against the newest recording (lh-parity-004a/b of 11-09,
else -002a-d / -003 of 11-06; lh-snapshots-115 holds none of these pages; tools/parity/compare.js, the first
8,000 px, live boxes masked). The same method and flags as sweep-so34-lh-adobe.md. No request to www or any airline
host; all 126 answers 200. Runner: logs/b635/sweep-shard.sh (4 shards), ranking logs/b635/rank.py (not in git).

One measuring fault: this machine draws Chinese text only with a configured face (Noto Sans CJK), and the sweep
ran without one. That makes /xx/hk/meetings-and-events (the only Chinese page here) 33.3 / 10.9 % at 390 / 1440;
with Noto Sans CJK TC it is 13.3 / 5.4 % (the recording is drawn with PingFang, so its last 59 px at 390 is the
face). The tables keep the sweep's figure; the worst ten below give both.

## Per template

| Template | Page-widths | Median % now | >= 20 % | >= 15 % | >= 10 % | Median 11-09 (sweep-lh-baseline.md, the same pages) |
| --- | --- | --- | --- | --- | --- | --- |
| legal | 58 | 5.2 | 0 | 0 | 4 | 7.5 (58 page-widths) |
| form | 18 | 7.6 | 0 | 0 | 6 | 9.8 (18 page-widths) |
| fleet | 16 | 6.3 | 0 | 1 | 3 | 17.3 (16 page-widths) |
| app-entry | 12 | 7.3 | 1 | 1 | 3 | 9.9 (12 page-widths) |
| flight-status | 2 | 4.6 | 0 | 0 | 0 | 8.6 (2 page-widths) |
| none | 20 | 6.0 | 1 | 1 | 2 | - (0 page-widths) |
| all | 126 | 6.0 | 2 | 3 | 18 | 8.4 |

Against sweep-lh-baseline.md (11-09, 106 of these page-widths): 59 are 2 points or more closer to www now, 4
2 points or more further. Against sweep-lh-004.md (11-09, the lh-parity-004 pages, 20 of these page-widths):
median 10.5 then, 6.0 now. The rest have no figure there (their recording is newer, or the
baseline did not list them: the 004 pages, tonight's recordings).

## Every page-width at 12 % or more, worst first

| Page | Template | Width | % | Height www / ours | Masked % | Recording | 11-09 baseline | 11-09 lh-004 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| /de/en/online-check-in | app-entry | 390 | 34.0 | 5650/4030 | 0.0 | lh-parity-002 | 37.4 |  |
| /xx/hk/meetings-and-events | none | 390 | 33.3 | 3531/3095 | 0.0 | lh-parity-004 |  | 34.4 |
| /de/en/discover-lufthansa/lufthansa-fleet/351 | fleet | 390 | 15.4 | 8000/8000 | 0.0 | lh-parity-002 | 15.7 |  |
| /de/en/discover-lufthansa/lufthansa-fleet/351 | fleet | 1440 | 13.9 | 7761/7761 | 0.0 | lh-parity-002 | 16.9 |  |
| /de/en/farealert/best-price-alert | form | 390 | 12.8 | 5363/5321 | 0.0 | lh-parity-002 | 15.8 |  |
| /de/en/advance-seat-reservations-terms-and-conditions | legal | 1440 | 12.7 | 1602/1602 | 0.0 | lh-parity-002 | 12.3 |  |
| /de/en/common/compensation-voucher | legal | 390 | 12.6 | 6707/6516 | 0.0 | lh-parity-002 | 13.8 |  |

## Moved most since the 11-09 baseline (2 points or more)

| Page | Width | 11-09 | now |
| --- | --- | --- | --- |
| /de/en/feedback/feedbackai | 1440 | 29.6 | 6.8 |
| /de/en/my-logbook | 390 | 27.2 | 9.4 |
| /de/en/my-logbook | 1440 | 20.8 | 4.6 |
| /de/en/data-collection-usa | 390 | 18.7 | 4.7 |
| /de/en/359 | 1440 | 17.7 | 3.7 |
| /de/en/feedback/feedbackai | 390 | 24.8 | 11.1 |
| /de/en/320 | 1440 | 18.1 | 4.4 |
| /de/en/320 | 390 | 19.3 | 5.7 |
| /de/en/boeing787 | 390 | 20.5 | 7.4 |
| /de/en/32n | 1440 | 18.8 | 5.9 |
| /de/en/32n | 390 | 19.3 | 7.6 |
| /de/en/boeing787 | 1440 | 16.9 | 5.4 |
| /de/en/data-collection-canada | 1440 | 20.8 | 9.5 |
| /de/en/data-collection-usa | 1440 | 15.4 | 4.3 |
| /de/en/feedback | 1440 | 13.3 | 2.5 |
| /de/en/744 | 1440 | 15.7 | 5.0 |
| /de/en/359 | 390 | 17.9 | 7.8 |
| /de/en/data-collection-canada | 390 | 18.9 | 9.6 |
| /de/en/prepare-for-your-trip/baggage/baggage-irregularities/report-baggage | 1440 | 14.5 | 5.3 |
| /de/en/business-terms-and-conditions | 1440 | 11.5 | 2.3 |

## The worst ten, each with its cause and fix

| # | Page-width | % | Cause (located) | Fix |
| --- | --- | --- | --- | --- |
| 1 | /de/en/online-check-in 390 | 34.0 | The booking lookup's collapsible items started closed. www opens its active first item on phones (lh-parity-002: the form and, inside the same panel, the "How to get your boarding pass" steps); ours hid 1,620 px. Brief 404 had both closed after lufthansa-parity-001. | **Shipped (a868f03, pushed as 6ad63e0):** the first item open below 768px, lufthansa.com only. 34.0 -> 11.3 % (4,030 -> 5,694 px, www 5,650); 1440 and manage-my-bookings unchanged. The other 18 documents with tabs (online-check-in in 14 more markets, manage-my-bookings in 3) rendered with and without: no sideways scroll, failed picture, overlap, clipped text or missing H1. Phones +1,420 to +1,821 px on online-check-in; 1440 and manage-my-bookings unchanged. |
| 2 | /xx/hk/meetings-and-events 390 | 33.3 | A measuring fault: the sweep drew the Chinese text without a face (empty boxes, narrower). With Noto Sans CJK TC: 13.3 % at 390, 5.4 at 1440; the last -59 px at 390 is Noto against the recording's PingFang. | None needed. |
| 3-4 | /de/en/discover-lufthansa/lufthansa-fleet/351 390 / 1440 | 15.4 / 13.9 | Three steps at 1440: after the grey band the seat-map heading 26 px lower (the shared section gap after a grey section); after the seat-map slideshow the next heading about 25 px lower; the PDF link wraps to two lines where www's fits one (our text column narrower). | Hand-over item 9 (section gap). |
| 5, 9 | /de/en/farealert/best-price-alert 390 / 1440 | 12.8 / 11.4 | The numbered steps are one columns-media padded block: ours about 37 px short from a step's picture to the next number at 1440, 8 px from the number to its heading. | Columns Media: hand-over item 8. |
| 6 | /de/en/advance-seat-reservations-terms-and-conditions 1440 | 12.7 | The four icon teasers are one columns-media padded block: about 76 px from a teaser's text to its "Further questions" link (www 48); the first row 24 px later. | Columns Media: hand-over item 7. |
| 7 | /de/en/common/compensation-voucher 390 | 12.6 | Its numbered clause headings ("{heading-copytext-large}") sit closer under the paragraph before them than www's: www's grid columns keep the paragraph's 24 px and the headline's margin apart, ours collapsed them (24 px at 390, 40 at 1440, www about 50 at both). -26 / -10 px per heading. | **Shipped (b74de66, pushed as 04c87ac):** 50 px on legal pages. 6.4 / 12.6 -> 5.4 / 9.0 % at 1440 / 390; the other 56 recorded legal page-widths within 0.5. 8 documents reach it; the 6 unrecorded rendered with and without: no breakage. compensation-voucher +84 / +92 px at 1440, +212 / +236 at 390; terms-of-service-group / befoerderungsbedingungen-group unchanged. |
| 8 | /de/en/744 390 | 11.6 | The paired half in-view seat-map slideshows, 30 px too much after them (standing order 30). They are on 7 fleet pages in every version, only 744 is recorded, and nothing in the documents marks the phone-only case. | None tonight: no mark to scope a row or a rule to. |
| 10 | /de/en/feedback/feedbackai 390 | 11.1 | Both pages show only the breadcrumb (the feedback app draws on neither); ours leaves 40 px more white space below it, the empty section's gap. | Section gap; minor, no rule (an empty page). |

Below the ten: register-ammunition and the other forms move by small steps through their fields (the form
sub-section question held since standing order 30). Four page-widths moved 2 points or more further from www since
11-09:
- refund-form 390 (6.2 -> 8.9), my-bookings 390 (7.0 -> 10.1) and register-ammunition 390 (7.9 -> 11.0): form and
  booking pages, small steps through their fields;
- datenschutz 1440 (3.5 -> 6.5, before standing order 30's legal rules too): its stack of standalone links stands a
  little taller than www's (about 51 px a link against 49.6) and starts about 18 px lower after the paragraph.

Their causes, found later in the night:
- **datenschutz 1440 (6.5 %): the column view's end mark sits before its links.** The importer's placeColumnMarks
  counts no bare link as a view's leaf, so "{column-end-outer}" lands on the text and its padding draws between the
  text and the first link. There are 719 such ends in lh-com's documents, on 44 recorded documents.
  - Rows: delta-so35-column-end-links-lh-com.txt, 15 READY (datenschutz 6.5 -> 3.4 / 9.6 -> 7.8, ten
    meetings-and-events versions, airport and parking pages).
  - Gate: all 44 recorded documents. 15 closer, 23 unchanged, 6 worse; the 6 get no row.
  - Not changed tonight: the importer, until the six worse pages are understood.
- **register-ammunition 390 (11.0 %) and the forms' small steps: two type sizes in the core form.** A sub-section
  title (www h3.heading-copytext-large, 20px on phones) is a fixed 24px in ours. A radio group's question (www's
  maui-radio-group label) is bold on www and regular in ours.
  - Gate, injected on the 9 recorded form pages (18 page-widths): `.form.core .form-subsection-title { font-size:
    var(--heading-font-size-m) }` and `.form.core .form-group-radio > legend.form-label { font-weight: 700 }`,
    lufthansa.com only.
  - Result: register-animal-cabin 390 10.1 -> 8.9, anmeldung-tiere-frachtraum 7.9 -> 7.3, refund-form 8.9 -> 8.6,
    register-ammunition 11.0 -> 10.8; the other 14 page-widths within 0.1.
  - **Shipped (blocks/form/form.css, test/form-core-type-so35).** The 164 unrecorded documents with a core form
    rendered with and without the rules at 1440 and 390, 328 pairs, all 200. None has sideways scroll, a failed
    picture, an overlap, clipped text, a form title overlapping its fields or a missing H1. 1440 is unchanged
    everywhere (the titles are 24px there as before). Phones are 0 to 129px shorter (median 20; xx/ru special-needs
    -129).
- **refund-form 390 (8.9 %): the same form steps.** The rules take it to 8.6; what is left is field spacing of
  a few pixels a field (-33 to +70 px across the page).
- **my-bookings 390 (10.1 %): the page end.** Its last section ends with a cards-teaser three-up block, and ours
  draws no space after it (the footer starts at the block's last link; www about 54px, 57 at 1440). It is the
  shared section-gap rules, so it went to ema-test as hand-over item 10.

## Places 11 to 30 (standing order 36, item 4)

The page-widths ranked 11 to 30 above, measured again as served at 05:20 CET (after order 35's rows and code went
live), with each page's located cause and its fix. Same recordings and method; drift steps from logs/b460/offsets.mjs
and box values from injected queries (logs/b636, not in git). "Now" is the figure as served before this order's
changes.

| # | Page-width | Sweep -> now % | Cause (located) | Fix |
| --- | --- | --- | --- | --- |
| 11 | /de/en/feedback-past-flight 390 | 11.0 -> 10.9 | (1) The core form's fields sit a few pixels lower each than www's, from the card's top padding on: +4 px at y 560 to +65 by y 2,560. (2) Order 35's bold radio question was wrong here: "Please select an option:" sits straight in the section's card and is regular on www, the same maui-radio-group label that is bold inside a sub-section (register-ammunition). | (2) **Shipped:** bold only inside a sub-section (blocks/form/form.css), gated on the 9 recorded form pages: all 18 page-widths unchanged (0.0); the groups it reaches go back to their weight before 6555376, the "without" state of order 35's 328 no-breakage pairs. (1) The form's field spacing is the sub-section question held since order 30; no rule tonight. |
| 12 | .../register-ammunition 390 | 11.0 -> 10.8 | Order 35's form type rules took 0.2. What is left is the same field spacing as #11 (+28 to +92 px through the fields, then +53 at y 5,120 before the last section). | As #11 (1). |
| 13 | /xx/hk/meetings-and-events 1440 | 10.9 -> 4.0 | A measuring fault (no CJK face) and the column-end row, live since round 468: 5.4 -> 4.0 with Noto Sans CJK TC. | None needed. |
| 14 | /de/en/flight-search 1440 | 10.5 -> 10.5 | "This might also be of interest to you": www draws the heading inside the teaser grid's threecolumn .column-view (bd-snapshot), so the view's 32px stand above the heading. Ours puts the 32px between heading and pictures (cards-teaser `> ul { padding-top: 32px }`): 66 px from the heading's ink to the first picture, www 32. | **Shipped** (blocks/cards-teaser/cards-teaser.css): no top padding for a grid right after its heading from 768px too, as below 768 since brief 467. 10.5 -> 4.6. Gate: the 6 recorded documents with the pattern, flight-search and online-check-in 1440 better, the four baggage / gepaeck versions unchanged at both widths. No-breakage: the 79 unrecorded documents, with and without at 1440 and 390, 158 pairs, all 200, no sideways scroll, failed picture, overlap, clipped text or missing H1; 1440 32 to 96 px shorter (one to three grids, median 32), 390 unchanged. |
| 15 | .../seatreservation-condtions/seat-reservations 390 | 10.1 -> 10.1 | The FAQ titles (accordion-columns faq) wrap more than www's: the title's text box is 270 px (20px left, 56px right of a 346 px item), and lines like "Can an advance seat reservation" measure 270.1 px. They fit on www, which keeps a slightly wider box (the chevron at the same x 328-343 on both). One more line per affected title, +3 to +80 px down the list. | **No fix.** Tried 52px instead of 56 on the right of these titles below 768, on all 72 recorded documents the rule reaches: 5 better (rail-and-fly 8.6 -> 7.0), 4 worse (cancellations-and-refunds 7.7 -> 13.0, onboard-delights/faq 2.6 -> 7.5, first-class-lounges 3.6 -> 5.6, and seat-reservations itself 10.1 -> 10.7), net +6.9 points. The breaks hinge on fractions of a pixel (270.1 against 270), so no one inset matches www's breaks on every page. |
| 16 | /de/en/my-bookings 390 | 10.1 -> 10.1 | The page end after a cards-teaser three-up: no space before the footer (www about 54 px). | Hand-over item 10 (order 35). |
| 17 | /de/en/register-animal-cabin 390 | 10.1 -> 8.9 | Order 35's form type rules. The rest is the form's field spacing (#11). | As #11 (1). |
| 18 | .../privacy-statement/privacy-statement-group 390 | 10.0 -> 10.0 | (1) Standalone links (p.link-wrapper) on phones: two-line links have 27 px lines, www 24 (72 px from one link to the next, ours 78), and our arrow is centred on the link where www's sits by the first line. (2) www shows its external arrow for the other airlines' pages; ours shows the plain arrow. (3) The list starts 31 px higher than www's under the H1. | (1) **No fix yet, tried:** link-wrapper line-height 24px with the arrow by the first line below 768, on the 63 pages of this sweep at 390. 7 got better (datenschutz 7.8 -> 5.5, 359 7.8 -> 6.6, this page 10.0 -> 9.0, besondere-bus 9.1 -> 8.2) and 9 worse (data-collection-canada 9.6 -> 13.2, boeing787 7.4 -> 9.9, data-collection-usa 4.7 -> 6.6), net +4.4 points. www's standalone links don't share one line height on phones, so the rule needs to know which www component a link comes from first: an importer mark, not a stylesheet rule. (3) Hand-over item 11 (the space under the page title). |
| 19 | /de/en/online-check-in 1440 | 9.8 -> 9.8 | (1) "Your check-in with Lufthansa": the same heading-in-the-view grid as #14 (+30 px). (2) The booking lookup's tab bar sits about 20 px higher than www's under "Check in online now". | (1) **Shipped** with #14: 9.8 -> 5.8. (2) Not tonight: a booking-lookup spacing, 1440 only. |
| 20 | /de/en/data-collection-canada 390 | 9.6 -> 9.6 | (1) www's first teaser card text ends with "<br>&nbsp;" (bd-snapshot), an empty line before its link; the import dropped it. (2) The page end after the cards-teaser grid: 40 px less before the footer than www (as #16). | (1) **Row, READY** (delta-so36-lh-rest-rows.txt): 9.6 -> 9.9 at 390 (within 0.5), 9.5 -> 8.2 at 1440. (2) Hand-over item 10. |
| 21 | /de/en/datenschutz 390 | 9.6 -> 7.8 | Order 35's column-end row (live). The rest is the standalone-link line height (#18). | As #18 (1). |
| 22 | /de/en/data-collection-canada 1440 | 9.5 -> 9.5 | As #20: the first card is 27 px short (its empty line); the page end after the grid is 40 px short (-106 px by the footer). | As #20. |
| 23 | /de/en/my-logbook 390 | 9.4 -> 9.4 | Hardly any drift (within 16 px). The PDF link ("Junior Pilot certificate as a PDF") stands 14 px closer to the next heading than on www: the space after a standalone link before a heading, which order 30's 48px rule gives only on legal pages. The rest is the standalone-link line height (#18). | As #18 (1). The link-before-heading space on app-entry pages is part of the same proposal (no rule tonight: it touches every template). |
| 24 | /de/en/besondere-befoerderungsbedingungen-bus 390 | 9.1 -> 9.1 | Its ten jump links: 24 px lines on www, 27 ours (+2 to +3 px a link, +22 px by the tenth). www draws a different icon there (a "24" circle glyph), ours the down arrow. | As #18 (1). The icon: www's glyph looks like a missing icon on the recording machine, so no change. |
| 25 | .../refund/refund-form 390 | 8.9 -> 8.6 | Order 35's form rules. The rest is field spacing (-33 to +70 px, #11). | As #11 (1). |
| 26 | /de/en/rail-fly-terms-and-conditions 390 | 8.6 -> 8.6 | Dense legal text drawn in the same places: no drift until y 4,720 (-25 px), and the same line breaks. The figure is glyph-level difference over a page of small text. | No fix: nothing is placed differently. |
| 27 | /de/en/feedback 390 | 8.5 -> 8.5 | Section spacing: (1) the first section's heading 33 px nearer the H1 than www's; (2) between the link of one section and the next heading, 14 px more than www, then 7 px less. | Hand-over item 11 (the shared section-gap rules). |
| 28 | /de/en/anmeldung-tiere-frachtraum 390 | 7.9 -> 7.3 | Order 35's form rules. The rest is field spacing (#11). | As #11 (1). |
| 29 | /de/en/359 390 | 7.8 -> 7.8 | (1) The seat-map PDF links: the standalone-link line height (#18). (2) "Technical data" 38 px lower than www's: the space after the seat-map download view, the nested-view case of item 2. (3) The technical data table's "Max. take-off weight" wraps in ours. | (1) As #18 (1). (2) Hand-over item 12. (3) Not tonight: table column widths (+24 px). |
| 30 | /xx/ru/meetings-and-events 390 | 7.8 -> 6.9 | Order 35's column-end row (live). The rest are steps of 10 to 37 px (-37 by y 1,840) between its sections, under 1 % of the page. | None tonight (section spacing, small). |

## Places 31 to 50 (standing order 37, item 4)

The page-widths ranked 31 to 50 above, measured again as served at 07:30 CET, with each page's located cause and its
fix. Same recordings and method as places 11 to 30; drift steps from logs/b460/offsets.mjs, boxes from injected
queries (logs/b637, not in git). Several causes recur from the places above:
- the standalone-link line height on phones (#18: no fix without an importer mark);
- section and view spacing (hand-over items 11-14);
- dense text drawn in the same places (#26).

| # | Page-width | Sweep -> now % | Cause (located) | Fix |
| --- | --- | --- | --- | --- |
| 31 | /de/en/32n 390 | 7.6 -> 7.6 | The seat-map view starts 24 px lower than www's (www 139 px from the text to "Seat maps Airbus A320neo", ours 163); the rest within 13 px. | Hand-over item 14 (view spacing). |
| 32 | .../booking-services/manage-my-bookings 390 | 7.6 -> 7.6 | (1) The booking lookup's "Find Bookings" button stands 11 px nearer the checkbox above it (www 46 px, ours 35). (2) The page end after the lookup is 28 px longer than www's. | (1) **Tried, no fix:** 33px under the checkbox below 768 measured worse (7.6 -> 8.7); online-check-in unchanged. (2) Hand-over item 14. |
| 33 | /de/en/boeing787 390 | 7.4 -> 7.4 | The seat-map views: 35 px less than www's before "Seat maps of the Boeing 787-9" and again before "Downloadable seat maps"; the PDF links' phone line height (#18). | Hand-over item 14; #18. |
| 34 | /de/en/common/accessibility-statement 390 | 7.4 -> 7.4 | No drift at all; the figure is evenly spread (6-11 % in every 200 px band of dense text). | No fix: the text is in www's places (#26). |
| 35 | /de/en/seat-maps 390 | 7.4 -> 7.4 | Steps of +20 and -12 px between its sections; the rest is pictures and dense text. | None: under 1 % of the page. |
| 36 | /de/en/passenger-rights 390 | 7.3 -> 7.3 | 47 px more white space above the grey "Refunds" band (www 45 px, ours 92); then constant (+44 to +52). | Hand-over item 14. |
| 37 | .../register-ammunition 1440 | 7.2 -> 7.2 | The form sections (item 3): sections 10 px late, the card's first title 12-13 px low. | **Shipped with item 3:** 7.2 -> 6.6. The 164 unrecorded core-form documents rendered with and without (328 pairs, all 200, no breakage): 1440 0 to 63 px shorter (median 27), 390 0 to 105 shorter (median 39). |
| 38 | /de/en/flight-search 390 | 7.1 -> 7.1 | Within 10 px everywhere (the teaser grid after its heading already has no padding below 768, brief 467); the figure is spread over the page, nothing placed differently. | None needed. |
| 39 | /de/en/imprint 390 | 7.1 -> 7.1 | "Lufthansa Insights legal notice" is 21 px further below the paragraph before it than on www; then constant (+24 to +30). | Hand-over item 14 (the heading-after-paragraph rule). |
| 40 | .../baggage-irregularities/report-baggage 390 | 7.1 -> 7.1 | Each airline heading ("Austrian Airlines") is 22 px nearer the text above it than on www (-24 px by y 960, -34 by the end). | Hand-over item 14. |
| 41 | /de/en/terms-and-conditions-lh 390 | 6.9 -> 6.9 | Its jump-link list and standalone links: +12 to +35 px from the links' phone line height (#18). | As #18. |
| 42 | .../agb-extra-services-at-online-check-in/conditions-seat-reservation 390 | 6.8 -> 6.8 | Within 16 px; dense text. | No fix (#26). |
| 43 | .../privacy-statement/privacy-statement-group 1440 | 6.8 -> 6.8 | A `{spacer-34 from-768}` between the first and the second link (order 21's row): 87 px from link to link where www has 51. Order 21's gate (8.53 -> 6.68) predates the later link and spacing rules. | **Row, READY** (delta-so37-lh-rest-rows.txt): the spacer goes. 6.8 -> 3.5 % at 1440, 390 unchanged (10.0). |
| 44 | /de/en/feedback/feedbackai 1440 | 6.8 -> 6.8 | The page shows only its breadcrumb (www's app draws nothing either); ours leaves 22 px more below it. | None: an empty page's section gap (as #10 of the worst ten). |
| 45 | /de/en/common/accessibility-statement 1440 | 6.7 -> 6.7 | Each h2 after a paragraph is 16 px lower than www's (+16, +31, ... +122 px by the 8th), from `* + h2 { margin-top: var(--section-padding) }`, 40 px at 1440 against www's 24. | Hand-over item 14. A legal-only 24px was tried: 4 better (this page 6.7 -> 4.5), 4 worse (seat-reservations +2.5, agb-extra-services +2.4), net -1.1 on the 29 recorded legal pages. Not shipped. |
| 46 | /de/en/lufthansa-first-class-fleet 1440 | 6.7 -> 6.7 | Our text column is about 10 px wider than www's (pictures 941 against 931 px wide, so a little taller, +25 px by y 3,440). | No fix tonight: the column width rule is shared by every column page. |
| 47 | /de/en/common/agb-extra-services-at-online-check-in 390 | 6.6 -> 6.6 | Steps of -17 and +17 px; dense text. | None: under 1 %. |
| 48 | /de/en/travel-id-terms-conditions 390 | 6.6 -> 6.6 | +14 px at y 1,760, then constant; the figure is dense text (8-11 % in every band). | No fix (#26). |
| 49 | /de/en/datenschutz 1440 | 6.5 -> 3.4 | Order 35's column-end row (live). | None needed. |
| 50 | /de/en/common/compensation-voucher 1440 | 6.4 -> 5.4 | Order 35's clause-heading rule took 1.0. The first clause ("1. General") right after the H1 and the version line now stands 26 px lower than www's: www keeps the paragraph's 24 px there, the 50 px only between clauses. | **Shipped** (styles.css, legal pages only): a clause heading right after the H1 and its paragraph keeps 24 px. 5.4 / 9.0 -> 2.8 / 7.4 % at 1440 / 390; the other 56 recorded legal page-widths within 0.2. The 14 unrecorded documents with this pattern rendered with and without (28 pairs, all 200, no breakage): at/de, de/de, gb/en 26 px shorter at both widths, the 11 xx versions unchanged (no legal template). |
