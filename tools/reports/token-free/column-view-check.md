# lufthansa.com's column view carrier in the collapse: the check (the brief after 506, item 1)

ema-adobe settled the carrier in brief 511, item 1 (tools/reports/parity-2026-11-08/column-view-handover.md): the
section style Column view (`column-view`). Its hub transformer writes the style on import, and styles.css ("the
column view carrier") draws it. This brief adds the collapse's side:
- for brand lufthansa (`THEMES.lufthansa.columnViews.carrier`), every outermost column group of a section's own
  content becomes a section of its own;
- that section takes the section's styles plus `column-view`, `padded` for an "-outer" group, and `flush` where more
  of the original section follows;
- the separators right before a group open its section;
- a section that already is one group (a re-imported hub document) keeps its styles;
- groups across a section break or inside a block get no carrier.

The DA library offers the style as **Column view**: `SECTION_STYLE_LABELS`; the Style choices end in
`Padded=padded|Column view=column-view`. The brand sites keep decision 1 (decisions.md). Tests:
test/column-view-collapse-507.test.mjs (6: per family, the brand sites, the label, the loss check on each).

## The four pages

The documents are as previewed today (main--lh-com--moved-permanently.aem.page `.plain.html` with their page
metadata). miles-and-more, meetings-and-events and digital-self-services have column marks. baggage has none and is
the control.

Each was rendered locally three ways:
- **marks**: today's documents and code;
- **carrier**: through the collapse with lufthansa forced live in the browser only;
- **no carrier**: the collapse before this change (dffce9ef).

main's height in px, and the difference to the marks render:

| page | width | marks (today) | collapsed, carrier | collapsed, no carrier |
| --- | --- | --- | --- | --- |
| /de/en/miles-and-more | 1440 | 2,546 | 2,555 (+0.4 %) | 2,531 (-0.6 %) |
| | 390 | 3,134 | 3,182 (+1.5 %) | 3,158 (+0.8 %) |
| /de/en/meetings-and-events | 1440 | 2,552 | 2,540 (-0.5 %) | 2,272 (-11.0 %) |
| | 390 | 3,011 | 3,009 (-0.1 %) | 2,941 (-2.3 %) |
| /de/en/digital-self-services | 1440 | 3,673 | 3,690 (+0.5 %) | 3,490 (-5.0 %) |
| | 390 | 4,477 | 4,527 (+1.1 %) | 4,487 (+0.2 %) |
| /de/en/baggage (no column marks) | 1440 | 3,837 | 3,917 (+2.1 %) | 3,917 (+2.1 %) |
| | 390 | 6,414 | 6,490 (+1.2 %) | 6,490 (+1.2 %) |

With the carrier, the three hub pages stay within 1.5 % of today's marks render. Without it, meetings-and-events is
11 % short and digital-self-services 5 %: their "-outer" column views lose 40 px above and below each.
- In the collapsed documents, miles-and-more's three column views become sections `column-view` (the last also
  `flush`, the "Register now" button following). meetings-and-events' five and digital-self-services' four become
  `column-view, padded, flush`.
- What remains, by the element comparison (logs/p4/s504/classify.mjs):
  - the marks' boxes go (B: -192 to -400 px), and the column-view sections give their spacing back (the rest:
    +198 to +388 px);
  - miles-and-more's first H2 loses `{limited-width}` (one line instead of two), as ema-adobe's handover notes.
- baggage's +80 px are separators rounded to the table's sizes (C, decisions.md). It is the same with or without the
  carrier.

The loss check (collapse-loss-check.mjs) passes for all four documents.

Against www: ema-adobe's handover has the same pages against www (lh-parity-002). There the marks are already off
(7 to 39 %), and the carrier brings the collapsed pages back to about the marks' level (miles-and-more 14.6 / 11.9 %
against 25.4 / 21.5 % without).

## Before lufthansa.com's switch

- The documents that ema-adobe's transformer hasn't re-imported get their sections from the collapse now. The
  re-import list (tools/reports/parity-2026-11-08/reimport-506-column-view-lh-com.txt, 12 documents) is no longer a
  precondition for the switch, though a re-import gives the same sections.
- lufthansa.com has no switch branch yet; it isn't among this brief's brands. Its pass would follow
  harness-pass-ita.md with brand lufthansa.
- The collapse's loss check on lh-com's 5,153 changed documents: 3 failures. All three are the internal author and
  tech guides under /migration-status/, which quote markers as text. Leave them out of lufthansa.com's pass.
