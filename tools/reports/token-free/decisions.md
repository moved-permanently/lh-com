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
