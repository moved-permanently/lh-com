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
