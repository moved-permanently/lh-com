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
