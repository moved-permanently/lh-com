# Token-free styling: decisions

Ben's rule decides: a near value collapses to the brand's default, and nothing is kept as an exception. Each line
below was raised by a pass check (tools/reports/token-free/<site>-pass-check.md, the brief after 503) and settled
in the brief after 506. Each lists the decision and the reason.

1. **Text in column views** (a heading and its text, an intro paragraph, a table and its notes) loses its column
   view's padding. The plan stays: there is no Padded section per group and no gap rule, so Austrian's 80 px between
   two headed groups becomes the theme's 32 px. Reason: the group's padding is a near value of the theme's spacing,
   and a carrier per group would be an exception.
2. **B2B's text width** keeps the brand's two-thirds default. The 301 sections that are mostly wide keep the section
   style Wide text (301 carriers). Reason: the default stays the brand's. A wide default would widen the 272 sections
   www draws at two thirds, and there would be no carrier to narrow them.
3. **`from-768` separators** keep their space and show on phones too (SWISS carry-on baggage +140 px at 390).
   Reason: "from 768" is a near value of the separator itself. A Spacer option for it would be an exception.
4. **Separators of 21 to 31 px** are dropped (the collapse table: 0-31 px none). Reason: none is the nearer value
   (M is 60 px), and keeping them would be an exception.
5. **Numbered steps written as headings** take the section's default when they are a minority of its headings (a
   section style needs more than half). Reason: the section's majority is its default, and a carrier for a minority
   run would be an exception.

These lines don't change the collapse: each is what marker-collapse.mjs already does.

**lufthansa.com's column views have a carrier of their own**, settled in brief 511, item 1 (ema-adobe's handover,
tools/reports/parity-2026-11-08/column-view-handover.md): the section style Column view (`column-view`), one
section per www column view. ema-adobe's hub transformer writes it on import, and the collapse
writes it from the column marks for brand lufthansa (THEMES.lufthansa.columnViews.carrier). Decision 1 holds for
every brand site.

6. **lufthansa.com's column view carrier is on every page type** (hub, info, legal, fleet, campaign: wherever the
   cleanup wrote column marks), as the collapse writes it for brand lufthansa. Reason: the carrier is the brand's
   common style for www's column views, so it is one rule for the brand. A hub-only condition would itself be an
   exception, and the theme's page types can't tell hub from fleet or legal pages. Measured in lh-com-pass-check.md:
   info pages 0.9 % mean height difference instead of 3.0 %, fleet 0.6 % instead of 0.8 %.
7. **Headings with www's limited width outside column views** take the text width (14 of 173 section H2s on
   lufthansa.com's www). Reason: the limited width is a near value of the text width, and a heading style for the
   minority would be an exception. Cost: miles-and-more's first H2 at 1440, 39 px.

Lines 6 and 7 are brief 515's answers, by Ben's rule (ema-adobe's lh-com-handover-ema-test.md, item 6).
