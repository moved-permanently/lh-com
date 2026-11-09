# The brands' own near values: what the collapse takes to the common style (brief 531 item 2)

ema-adobe, 2026-11-09. For Lufthansa Group for Business, Cargo and Air Dolomiti: the five largest differences
between a brand's documents or theme and the common style that the collapse would hide or change, so that the user
can say "collapse them" under Ben's rule. Counted in the brands' previewed documents (the census of the harness guides:
lh-b2b 733, lh-cargo 990, lh-airdolomiti 1,569, read from our preview hosts; logs/b531/near-values.mjs, not in git) and
read from the theme files. No theme was changed.

How the collapse treats them (scripts/style-markers.js, the collapse table): a separator of 0-30 px goes, 32-80 px
becomes M (60 px), 90-150 px L (120 px); a heading marker one size step from its level's default takes the default (two
steps or more get a carrier). The brand's CSS stays as it is: it decides what the default looks like.

## Lufthansa Group for Business: five near values the collapse changes

| # | what | how often | per instance | in all |
| --- | --- | --- | --- | --- |
| 1 | `{spacer-25}` goes (0-30 px: none) | 162 in 109 documents | -25 px | -4,050 px |
| 2 | `{spacer-30}` goes | 115 in 79 documents | -30 px | -3,450 px |
| 3 | an H1 marked heading-medium on a flow page takes heading-large | 79 in 39 documents | font 32 -> 42 px at 1281 px+ (28 -> 32 on phones) | one size up on 39 pages' titles |
| 4 | an H3 marked heading-small outside flow pages takes heading-copytext-large | 68 in 19 documents | font 28 -> 18 px at 1281 px+ (24 -> 18 on phones) | two of B2B's sizes apart (its copytext-large is 18 px, the common style's 24) |
| 5 | an H2 marked heading-small on a flow page takes heading-medium | 199 in 66 documents | font 28 -> 32 px at 1281 px+ (24 -> 28) | the most frequent |

Next in size: `{spacer-20}` goes (23 in 17 documents, -460 px), `{spacer-90}` becomes L (11 in 9, +30 px each),
`{spacer-15}` goes (21 in 6, -315 px), `{spacer-100}` becomes L (8 in 4, +20 px each), `{spacer-40}` becomes M (4 in 2,
+20 px each). Items 1 and 2 are decisions.md 4 (decided); 3 to 5 are heading sizes one step from the default (the ITA
pass's known kind D). The font sizes are B2B's own scale (styles/themes/b2b.css: heading-large 42, medium 32, small 28,
copytext-large 18, copytext-medium 16 px from 1281 px), not the common style's (48, 36, 28, 24, 18 px): the collapse
keeps B2B's scale, it only moves a heading to its level's default within it.

Already decided, not near values: running text at two thirds with Wide text on 332 sections (decisions.md 2); text in
column views losing its padding (decisions.md 1).

## Lufthansa Cargo: none

Cargo's documents carry no spacing or heading markers (0 separators, 0 heading markers in 990 documents); their only
markers are 30 `{controls round-play-button}`, which is the default player. **The collapse hides or changes no spacing
value and no heading size on Cargo.** Cargo's theme differs from the common style in its CSS, and keeps doing so after
the switch (for information; nothing to collapse):

| | Cargo (styles/themes/cargo.css, 1281 px+) | common style (styles/styles.css) |
| --- | --- | --- |
| heading-large / medium / small | 42 / 32 / 28 px | 48 / 36 / 28 px |
| heading-copytext-large | 28 px | 24 px |
| heading margins | 20 px below every size | 40 px below heading-large |
| on phones, heading-large / medium | 32 / 28 px | 36 / 28 px |

## Air Dolomiti: none

Air Dolomiti's documents carry no spacing or heading markers (0 separators, 0 heading markers in 1,569 documents);
their only markers are three `{selected}` in the newsletter forms. **The collapse hides or changes no spacing value and no
heading size on Air Dolomiti.** Its CSS draws headings by level, not by size class, and keeps doing so (for
information):

| | Air Dolomiti (styles/themes/airdolomiti.css) | common style |
| --- | --- | --- |
| H1 | 42 px light (38 below 930 px), 20 px below | heading-large 48 px bold, 40 px below |
| H2 | 38 px light (34 below 930 px) | heading-medium 36 px bold |
| H3 | 26 px regular | heading-copytext-large 24 px bold |
| a page stage's next section | 150 px below the stage (www's HeroFirst) | the section gap, 48 px |
| the intro paragraph after the H1 | 22 / 30 px | body text 18 px |

So of the three brands only B2B has near values to decide; the five above are the largest.
