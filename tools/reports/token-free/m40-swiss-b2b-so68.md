# M at 40 px: SWISS and Group for Business (standing order 68, item 1)

Ben, 18 Nov: decision 3 (M at 60) is lifted; M moves to 40 px on every brand where that brings the brand closer to www.
The test: on all recorded page-widths, M at 60 against M at 40 in the same load. Adopt 40 when the sum of % off www
goes down and the median does not go up. **Both brands fail both conditions, so both HOLD at 60.** Nothing was pushed
for this item.

## Method

- **Pages:** every recorded page-width of the two brands.
  - SWISS: 172 page-widths (86 pages at 390 and 1440; swiss-parity-001, -002a, -002b).
  - Group for Business: 184 page-widths (b2b-parity-001 to -017).
  - www's height is the recording's scrollHeight. Ours is the page's scrollHeight on swiss.turnsthe.page and
    b2b.turnsthe.page (the served documents, main's code).
- **The toggle:** after the load settled, every separator paragraph the token-free code draws at SPACE.m (`p.spacer`, not
  a divider, `--spacer-size: 60px`: Spacer M, the space-m options and styles) got 40 px in the same load. Then the
  height was read again. This is what `SPACE.m` 40 draws.
- **Unmeasured:**
  - SWISS homepages and /ch/en/offers (10 page-widths): their loads were still filling. They hold no M, so they are
    equal on both sides and left out.
  - B2B lhg4b-search-prelogin (4 page-widths): broken loads at the window height.
  - /de/en/about-us 1440 moved with no M on it. That was a filling load; read again alone, it was 2,748 on both sides.
- **Requests:** airline hosts, www.* and lh-proxy were refused per request and counted. None was sent.

## Result

| Brand | Page-widths | Sum % off www, M 60 | Sum, M 40 | Median, M 60 | Median, M 40 | Moved | Closer | Further | Further > 0.5 points |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| SWISS | 162 | 418.78 | 423.74 (+4.97) | 1.267 | 1.404 | 21 | 5 | 16 | 8 |
| Group for Business | 180 | 165.75 | 172.32 (+6.57) | 0.549 | 0.629 | 57 | 21 | 36 | 21 |

## Page-widths further by more than 0.5 points, and why

**What "www's gap" means:** the distance between the text box above our M and the text box below it, in www's recording
laid out offline (so23/rec-render.mjs with the brand's own CSS; margins are CSS and match, heights don't). Ours is
measured the same way, with M at 60 (M at 40 is 20 less).

**What it shows:**
- Where www's layout answers, M at 40 is locally right or closer in most places. www measures 79 to 100 px where ours is
  101 to 125.
- The pages still get further because they are already short of www elsewhere. Taking 20 px per M off moves them
  further from www's height. This is the shrinking-rule arithmetic: the page has to reach www first.
- www uses more than 60 in only two places it answers: the SWISS fleet hub's intro (102 px) and celebrating-shared-stories'
  last H2 (219 / 179 px).

| Page-width | www | M 60 | M 40 | % off (60 / 40) | Points | Cause |
| --- | --- | --- | --- | --- | --- | --- |
| /ch/de/book-and-manage/pax-receipt 1440 | 2,234 | 1,682 | 1,662 | 24.71 / 25.60 | +0.90 | page 25 % short (www's receipt form); the M under the intro not found in www's layout |
| /ch/de/book-and-manage/pax-receipt 390 | 2,402 | 1,715 | 1,695 | 28.60 / 29.43 | +0.83 | as 1440 |
| /ch/en/discover/fleet 390 | 2,040 | 2,051 | 2,011 | 0.54 / 1.42 | +0.88 | **www uses more:** under the intro www 102 px, ours 81 (61 with M at 40) |
| /ch/en/fly/flight-information/mobile-apps 390 | 2,643 | 2,566 | 2,546 | 2.91 / 3.67 | +0.76 | the aside's leading Spacer block (item 3): 101 px today, 81 with M at 40 (www's sidebar aside 80); page short |
| /ch/en/discover/swiss-recraft-collection 390 | 5,441 | 5,381 | 5,341 | 1.10 / 1.84 | +0.74 | an aside Spacer as above; an in-text M www 80, ours 101 (81): locally right at 40; page short |
| /ch/de/book-and-manage/swiss-choice/additional-bag 390 | 2,816 | 2,791 | 2,771 | 0.89 / 1.60 | +0.71 | the aside's Spacer block, as mobile-apps |
| /ch/de/fly/on-board/entertainment-on-board 390 | 2,837 | 2,686 | 2,666 | 5.32 / 6.03 | +0.70 | the aside's Spacer block; page 5 % short |
| /ch/en/book-and-manage/swiss-choice/upgrade-options 390 | 3,904 | 3,784 | 3,764 | 3.07 / 3.59 | +0.51 | the aside's Spacer block; page 3 % short |
| /de/en/program/partner-plus-benefit 1440 | 3,287 | 3,274 | 3,214 | 0.40 / 2.22 | +1.83 | three M: before "Register now" www 119, ours 292 (272); two after pictures not found |
| /de/de/program/partner-plus-benefit 1440 | 3,349 | 3,316 | 3,256 | 0.99 / 2.78 | +1.79 | as de/en (www 119, ours 268) |
| /de/en/news/celebrating-shared-stories 1440 | 8,265 | 8,216 | 8,116 | 0.59 / 1.80 | +1.21 | five M: under the intro www 60, ours 85 (65); **before "Anniversary of an icon" www 219**, ours 133 (113); three after pictures not found |
| /de/en/program/partner-plus-benefit 390 | 5,061 | 5,006 | 4,946 | 1.09 / 2.27 | +1.19 | before "Register now" www 79, ours 101 (81): locally right at 40; page short |
| /de/en/about-us/lhg-history 1440 | 1,690 | 1,604 | 1,584 | 5.09 / 6.27 | +1.18 | page 5 % short; the M before the history cards not found |
| /de/de/program/partner-plus-benefit 390 | 5,361 | 5,230 | 5,170 | 2.44 / 3.56 | +1.12 | as de/en 390 |
| /de/en/news/celebrating-shared-stories 390 | 12,438 | 12,345 | 12,245 | 0.75 / 1.55 | +0.80 | under the intro www 60, ours 85 (65); before "Anniversary of an icon" www 179, ours 113 (93) |
| /de/en/travel-management 1440 | 2,565 | 2,525 | 2,505 | 1.56 / 2.34 | +0.78 | page short; the M before "This might interest you" not found |
| /de/en/about-us/lhg-history/lhg-history-alliances-and-joint-ventures 1440 | 5,171 | 5,017 | 4,977 | 2.98 / 3.75 | +0.77 | page 3 % short; both M after pictures, not found |
| /de/en/travel-management/hygiene-and-safety 1440 (also xx/en) | 2,952 | 2,947 | 2,927 | 0.17 / 0.85 | +0.68 | under the intro www 100, ours 125 (105): locally closer at 40 |
| /de/de/travel-management/hygiene-and-safety 1440 (also xx/de) | 2,986 | 2,981 | 2,961 | 0.17 / 0.84 | +0.67 | as de/en |
| /de/de/news/celebrating-shared-stories 390 | 12,092 | 12,091 | 12,011 | 0.01 / 0.67 | +0.66 | under the intro www 60, ours 85 (65); three more not found |
| /de/en/about-us/lhg-history/lhg-history-alliances-and-joint-ventures 390 | 6,051 | 6,029 | 5,989 | 0.36 / 1.02 | +0.66 | as 1440 |
| /de/en/about-us/contact 1440 | 3,070 | 3,033 | 3,013 | 1.21 / 1.86 | +0.65 | page short; the M after an empty paragraph not found |
| /de/en/travel-management/hygiene-and-safety 390 (also xx/en) | 3,090 | 3,071 | 3,051 | 0.61 / 1.26 | +0.65 | under the intro www 80, ours 105 (85): locally closer at 40 |
| /de/de/travel-management/hygiene-and-safety 390 (also xx/de) | 3,170 | 3,151 | 3,131 | 0.60 / 1.23 | +0.63 | as de/en |
| /de/de/about-us/contact 1440 | 3,499 | 3,459 | 3,439 | 1.14 / 1.71 | +0.57 | as de/en |

Closer by more than 0.5 points with M at 40:
- SWISS (all four terms-conditions page-widths): ch/de 1440 -1.10, ch/en 1440 -1.12, ch/de 390 -0.64, ch/en 390 -0.64.
- B2B (nine page-widths):
  - lhg-ita-airways 1440 -3.52 and 390 -2.40
  - celebrating-shared-stories/sap 1440 -1.93 and 390 -1.36
  - de/de lhg-history 1440 -1.14
  - lhg-history-booking 1440 -1.08 and 390 -0.96
  - video-gallery 390 -0.53
  - contact de/en 390 -0.52

## What would let M at 40 pass

The page-widths that fail are mostly short pages. M at 40 is locally right on most of them. Their other shortfalls
come first: pax-receipt's form, the SWISS aside pages at 390, and partner-plus-benefit's gap before "Register now"
(ours 292 px at 1440 against www's 119). Once those are fixed, the same toggle census can be rerun:
so68/togm.mjs with so68/m40.js, summed by so68/msum.py.

Scratch: migration-work/parity-588/so68. This is not in git: the censuses (sw.*.tsv, b2b.*.tsv), the gap reads
(wg.*.tsv, wrec.txt) and the scripts.
