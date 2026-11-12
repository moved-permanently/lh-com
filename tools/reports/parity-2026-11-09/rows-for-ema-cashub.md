# Rows for ema-cashub from ema-lufthansa

Things found in ema-lufthansa's work that sit in ema-cashub's areas (TAP since standing order 3 of 2026-11-11, and
the files it last changed). Each row says what was found, the evidence and what ema-lufthansa did or left.

## 1. TAP: test/tap-faq-gap-567.test.mjs failed on main since e9b72c4d (2026-11-12)

- **Found:** e9b72c4d (05:21 UTC, TAP row 151: a FAQ page whose categories are a tab set) narrowed tap.css's rule
  "the section before the FAQ picker 32 px over it" to `body.brand-tap main > .section:not(.faq-picker-section):has(+
  .section.faq-picker-section)`. test/tap-faq-gap-567.test.mjs (ema-lufthansa's, TAP row 130) looked the rule up by the
  old selector text, so the full suite failed on main from 05:21 UTC (seen at 07:01 UTC in a ship's suite: 3757 pass,
  1 fail), and every push that reads the suite stopped.
- **Done (ema-lufthansa, the commit with this file):** the test looks for the narrowed selector and still checks the
  32 px from 768 px; tap.css untouched. If the narrowing was not meant as the rule's new shape, the test is the one to
  change back with it.

## 2. Austrian: test/carousel-dots-374.test.mjs failed on main since 517187a4 (2026-11-12)

- **Found:** 517187a4 (about 14:00 UTC, Austrian rows 52 and 53: the phone slider's dots 67 px under the cards) added
  `body.brand-austrian main .carousel-cards.phone-slider .carousel-cards-dots { margin-top; margin-bottom }` to
  austrian.css. test/carousel-dots-374.test.mjs (ema-lufthansa's, brief 374: the dots as 24 px targets, drawn in the
  carousel files) refused any `carousel-cards-dot…` in a brand theme, so the full suite failed on main (seen at 14:58
  UTC in a ship's suite: 3846 pass, 1 fail; nothing of that ship committed).
- **Done (ema-lufthansa, the commit with this file):** the test now lets a theme place the row of dots (margins only on
  `.carousel-(cards|images)-dots`) and still refuses any rule on a dot itself or other properties on the row;
  austrian.css untouched (it was committed by another EMA under 2 hours before).
- **Superseded the same hour:** 55714cf3 (15:13 UTC) moved row 53's spacing into blocks/carousel-cards/carousel-cards.css,
  so austrian.css no longer names the dots and the strict test passes; a110d97c (my loosening, pushed on its retry at
  15:25 UTC) is taken back in the next commit: the test is strict again (no theme rule names a carousel's dots).
