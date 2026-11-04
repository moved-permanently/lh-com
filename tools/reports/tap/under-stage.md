# TAP's homepage under the stage: the booking box, the extras, "Plan your trip" (brief 330)

Status of 2026-11-04: **code only; nothing published and no document changed.**
- **Compared:** www.flytap.com/en-pt at 1440 × 900 and 390 px (cookie banner: necessary only)
  against the branch preview `cmp-330--lh-tap--moved-permanently.aem.page` (no browser cache).
- **Pages:** the eight root homepages and two inner pages each.
- **www load:** one page at a time, 5 to 6 s apart.

## What changed

| Where | What |
| --- | --- |
| `blocks/booking-box/over-hero.js` (new), `booking-box.js` | The pull-up is a pure function. The card comes up until its bottom is 18 px above the stage's bottom (www: 222 px of overlap at 1440). It stops short only of parts of the stage that sit within the **tab bar's** width; without a tab bar, the card's width counts. The pause button counts as a blocker too. |
| `blocks/booking-box/booking-box.css` | <ul><li>**Card:** www's look: 204 px high at 1440 (32 px padding, 40 below the fields, 8 px under the labels), the search aligned with the fields' line, the swap button centred on the fields.</li><li>**Shadow:** www's `shadow-sm` (`0 2px 8px rgb(0 0 0 / 10%)`) at every width, on the tab track as well.</li><li>**Text colours:** the airport placeholder slate grey (`#64748b`); an empty date or passenger field light grey (`#b0aeb4`).</li><li>**Phones:** tabs as wide as their texts, rows centred, no icons; the corporate link on the left.</li></ul> |
| `blocks/cards-icon/cards-icon-tap.js` (new), `cards-icon.js` | On brand `tap`, when **every** tile has an icon (www's AuxiliaryCarousel): www's pill carousel, i.e. previous, a native scrolling row with snap points, next. The buttons step one pill and are disabled at either end; labels in TAP's seven languages. Tiles without icons (www's LinkList tiles on inner pages) and every other brand are unchanged. |
| `blocks/carousel-cards/carousel-cards.js` | On brand `tap`, an option-less carousel whose cards are a picture and a linked title only (www's ClientNeedsCardList): class `carousel-cards-tap`, with previous, dots and next in one group under the row. Richer cards and other brands are unchanged. |
| `styles/themes/tap.css` | A new section, "TAP's homepage under the stage". Every rule is under `body.brand-tap`. |
| tests | `test/tap-under-stage.test.mjs` (9 tests). |

## Measured on the branch against www

Positions are page coordinates at 1440 × 900. The alerts bar is 52 px high on ours today; www's
en-pt showed 104 px of alerts that morning, so www's numbers are given relative to its stage too.

| | www | ours, before (077d0941) | ours, after |
| --- | --- | --- | --- |
| card, from the stage's bottom | 18 px above it (622 to 826, stage to 844) | ran 16 px below it (620 to 808, stage to 792) | 18 px above it (570 to 774, stage to 792) |
| card | 1120 × 204, radius 24, `0 2px 8px rgb(0 0 0/10%)` | 1120 × 188, no shadow | 1120 × 204, the same shadow |
| tab bar | stage + 454 | stage + 504 | stage + 454 |
| extras | 8 pills of 243 × 56, 4 visible in 1008 px, buttons at 160 and 1240 | 2 rows of 236 × 124 tiles | 8 pills of 243 × 56, 4 visible in 1008 px, buttons at 160 and 1240 (previous disabled at the start) |
| extras, from the stage's bottom (es-es, same stage) | 883 | (tiles at 856, en-pt) | 883 |
| "Plan your trip" | heading centred 40/48; 4 cards of 262 × 204, picture 262 × 112 | heading left; 262 × 241 cards, title left | heading centred 40/48; 4 cards of 262 × 204, picture 262 × 112; no buttons (all four fit, as on www) |

At 390 px:
- **Tabs:** 2 + 2 chips as wide as their texts, centred, as on www.
- **Card:** has www's shadow on the white page.
- **Extras:** 280 px pills that swipe, 56 px below the card (www: 56), the next one peeking in, no
  buttons.
- **"Plan your trip":** one 358 × 273 card at a time (www: 358 × 273), with a disabled grey
  previous, four green dots (the current one a pill) and a green next under it.
- Previous, next and swiping all work. No page scrolls sideways.

All eight homepages (seven, and pt-br) show the same at both widths. The extras have 8 pills on
pt-pt and en-pt and 7 on the others, as on www. pt-br has no booking box (see below). The inner
pages (TAP fares, travelling with animals) are unchanged: their tiles have no icons, and they have
no booking box and no plan cards.

**Screenshots (not committed):**
- **Before:** `/tmp/tap-330/before-en-pt-{1440,390}.png` and `-below.png`.
- **After:** `/tmp/tap-330/after-en-pt-{1440,390}.png` and `-below.png`.
- **www:** `/tmp/tap-330/www-en-pt-*.png`.
- **All homepages on the branch, full height:** `/tmp/tap-330/branch/`.

## Checks

- **Lint:** passes.
- **Full suite:** all test files pass (229 of 229 before the final rebase; rerun after it).
- **lufthansa.com's 19 comparison pages:** main against the warm branch, 18 of 19 equal. The
  other differs only in where the asynchronously loaded `styles/showcase-notice.css` link lands in
  the head, a timing effect that also shows up when main is compared with itself.
- **Brand homepages:** Discover, Austrian, Brussels, Lufthansa Group for Business, Cargo and Air
  Dolomiti are equal. ITA and SWISS differ only in the flash teaser's progress ring
  (`stroke-dashoffset`), an animation state.
- **lh-edge:** no file on the lh-edge deploy paths changed, so there is no deploy and no smoke run.

## For ema-cashub (content, no importer change made)

- **pt-br's homepage has no booking-box block.** www's pt-br has the box (its tab bar at 506), and
  the other seven homepages have the block.
- No content change is needed for the carousels: the TAP variants read the blocks as the importer
  writes them (cards-icon with icons from AuxiliaryCarousel; carousel-cards of a picture and an
  `h3` link from ClientNeedsCardList).

## Not as www

- www's buttons step one slide with a 1.2 s swiper animation; ours scroll smoothly by one pill,
  with no animation under reduced motion.
- At 1440, the booking box's tab bar is 554 px wide on en-pt (www: 564), because of the icons'
  sizes.

Rollback: `git revert` of the commit. No document or index needs undoing.
