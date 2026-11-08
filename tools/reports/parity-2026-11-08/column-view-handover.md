# Column view carrier: handover for ema-test (brief 506 item 1)

ema-adobe, 2026-11-08. The carrier that blocks lufthansa.com's switch to token-free styling is settled: a section style
**Column view** (`column-view`). Everything on ema-adobe's side is on main (see "What is on main"). One change in
ema-test's files is needed for the DA library's friendly label; nothing in the collapse or the readers has to change for
the carrier to work. Two observations for the switch follow at the end.

## What is on main (ema-adobe)

- `tools/importer/transformers/hub-column-views.js` (hub template, afterTransform, after the cleanup wrote the marks and
  lufthansa-sections / campaign-sections the sections): every column view becomes a section of its own, its AEM
  section's styles plus `column-view`; a view directly in the container (`-outer` marks) also `padded` (www's
  20 / 40 px); `flush` where more of its AEM section follows (no gap to the next piece). Separators right before a view
  open its section. The marks stay where they are: until the collapse has run they keep working (a marker on an element
  wins), the collapse removes them as today. Nested views stay in their outer view's section; a view across a section
  break or in a block is left alone. Hub documents only (info and fleet keep the cleanup's own column handling).
- `styles/styles.css` (lufthansa.com only, "the column view carrier"): a `column-view` section 32 px above and below,
  64 between two views, 32 under the last, its last element without margin, its headings two thirds wide from
  1025 px; `column-view padded` the section padding; the section before a view keeps its text's 24 px; a `flush`
  view no section gap. Not grey bands (their existing `grey column-view` rule), and the paddings not while a mark is
  still in the section.
- Tests: `test/hub-column-view-sections-506.test.mjs` (the transformer, and that `collapseHtml` keeps the sections and
  removes the marks), `test/column-view-section-506.test.mjs` (the CSS).

## Measured (lh-parity-002, 1440 / 390; drafts from lh-snapshots-085 and bd-snapshots, main's hub bundle)

The collapse run read-only (`collapseHtml(..., { force: true })`), the page rendered with `body.theme-live` and
`--theme-heading-gap: 32px` as `token-free.js` sets them for a live theme.

| Page | Marks (today) | Collapsed, no carrier | Collapsed, carrier |
| --- | --- | --- | --- |
| miles-and-more | 7.2 / 13.9 % | 25.4 / 21.5 % | 14.6 / 11.9 % |
| meetings-and-events | 10.2 / 12.7 % | 25.2 / 10.1 % | 9.6 / 13.8 % |
| digital-self-services | 8.2 / 9.1 % | 12.2 / 8.6 % | 10.6 / 8.1 % |
| flights | 39.1 / 46.9 % | 39.2 / 45.8 % | 38.7 / 45.6 % |

With marks (today's documents) every page renders exactly as before the change (same heights); baggage,
additional-services, lufthansa-travel-classes and food-and-beverages (no column marks) import byte-identical.

## The one change in ema-test's files: the DA library's label

`scripts/style-markers.js`, so the DA library offers the style like the other section styles
(`tools/library/spec.mjs` builds the Section Metadata Style choices from `SECTION_STYLE_LABELS`):

```js
export const SECTION_STYLES = {
  // ...
  // the Lufthansa section padding (20 px, 40 px from 768 px) above and below
  padded: {},
  // one www column view (lufthansa.com: 32 px above and below, its headings two thirds wide; styles.css)
  'column-view': {},
};

export const SECTION_STYLE_LABELS = {
  // ...
  padded: 'Padded',
  'column-view': 'Column view',
};
```

Expected output: the library's Section Metadata `Style` choices end in `|Padded=padded|Column view=column-view`;
`readSectionStyle('Column view')` returns the empty style (as `padded`: the class does the work), nothing else changes.
AUTHORING.md's section styles row (`Parallax image`, `Narrow quote`, `Padded`) could add `Column view` (`column-view`):
"one column view: 32 px above and below, two views 64 px apart, its headings two thirds wide".

## For the switch (no change needed for the carrier)

1. **An outer view that a separator opens is not padded by the collapse.** `collapseColumns` pads an outside-a-section
   group only when its start mark is the section's first own content; www puts the separator component inside the
   outer column view, before its heading (digital-self-services' dividers), so the section starts with the separator.
   Hub documents don't need it any more (hub-column-views writes `padded` itself); info pages with the same shape would.
   If you want it in the collapse: let `spans` skip leading separator paragraphs / Spacer and Divider blocks
   (`own[0]` the first own content that is not a separator). Expected: digital-self-services' four views padded from
   the collapse alone.
2. **The heading width outside column views.** The collapse drops `{limited-width}` on every heading ("limited-width
   goes"). On www 14 of 173 section H2s (lh-snapshots-062, de/en) are limited width; miles-and-more's first H2 is one:
   one line instead of two, 39 px, 8.4 points at 1440 (6.2 % with it two thirds wide, 14.6 % without). By Ben's rule
   (near values to the brand default, no exceptions) it goes; listed so the cost is known.
3. **Documents.** The carrier comes with a re-import: hub documents imported before this change have no `column-view`
   sections. After the switch they render as the "no carrier" column above until re-imported with main's hub bundle.
