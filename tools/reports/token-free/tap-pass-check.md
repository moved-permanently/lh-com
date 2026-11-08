# TAP's collapse pass: a check before the switch (brief 505)

TAP's importers (tools/importer/tap-import.mjs, tap-markets.mjs) run no import bundle, so the bundles' last step (marker-collapse.mjs, 72026ccf) never reached their output. Both writers now end with it (tap-import.mjs `collapseTap`, brand tap), gated as the bundles: until TAP's theme is live (scripts/style-markers.js, no `tap` entry: off) the document comes back byte for byte. The pass and the switch ship in one release, as ITA's; nothing switched here.

## What TAP's documents carry

- **Preview** (main--lh-tap--moved-permanently.aem.page, the 1452 documents of tools/importer/sites/lh-tap.json, read 2026-11-08): 447 `<p><sub>{blank}</sub></p>` in 156 documents, no other marker: accordion-columns 268, cards-teaser 102, columns-media 69, cards 8. The importer writes no `{spacer-N}` (tap-import.mjs has no separator step; none on preview either).
- **Where the blank lines stand** (their neighbours in the cell): p | p 243; p | h3 76; p | edge 60; p | link 26; p | blank 12; p | picture 9; blank | edge 6; ul | h3 4 (p | p: between two paragraphs; edge: a cell's start or end).
- **The workspace's copies** (content-sites/lh-tap/content, 900 documents) hold 3 blank lines: not DA's documents (the harness collapses DA's, as for ITA).

## The gate

- Live off: `collapseTap` over the 156 preview documents with a blank line and the 900 local ones: every one byte for byte (test/tap-collapse-505.test.mjs: the switch off, a document back unchanged).
- Forced (`force: true`, a site's pass): all 156 + 3 changed, no marker left, idempotent (a second pass changes nothing).

## The paragraph gap (tap.css, live only)

The rules read `body.brand-tap main:where(.theme-live *) …` (the theme file's rules all start with the brand's body class: test/brand.test.mjs; `:where` adds no weight); scripts/token-free.js puts `theme-live` on the body when the theme is live.

Today a blank line is a 24 px line between two paragraphs. Collapsed, it goes; one gap per block stands for it, today's gap + 12 px, so every paragraph pair is within 12 px of its old gap (+12 without a blank line before, -12 with one): Cards Teaser 0 -> 12 px, the feature views (Columns Media feature, feature-small) 8 -> 20, Cards and Accordion Columns 24 -> 36 (measured on the local dev server: the margins collapse with the paragraph's own margin-bottom, so the value is the whole gap). A blank line before a heading (80) or at a cell's edge (66) has no pair: it goes, -24 px.

## The render check

10 TAP pages (the most blank lines per block type, the inspiration page whose accordion loads the category fragments, and the en-pt FAQ: accordions without a blank line), at 1440 x 900 and 390 x 844, two ways on the local dev server (`aem up`, this tree's code, preview content; the TAP sweep's settle method):

- **today**: as served;
- **collapsed + live**: the page's document and every fragment collapsed on the fly in the browser (marker-collapse.mjs, brand tap, force) and TAP's theme forced on in the browser only (scripts/style-markers.js answered with `tap: { live: true }`).

Collapsed documents: 18 (/de-de/an-bord/economy-prime, /de-de/buchungen/time-to-think, /de-de/informationen/reisen-mit-tieren/haustier, /de-de/verwalten-buchungen/extras/upgrades/auktionen, /en-pt/destinations/get-inspired, /en-pt/fragments/get-inspired/adventure, /en-pt/fragments/get-inspired/beach, /en-pt/fragments/get-inspired/culture, /en-pt/fragments/get-inspired/culture-2, /en-pt/fragments/get-inspired/family, /en-pt/fragments/get-inspired/gastronomy, /en-pt/fragments/get-inspired/nature, /en-pt/fragments/get-inspired/night, /en-pt/fragments/get-inspired/romance, /en-pt/miles-and-go/partners, /en-pt/miles-and-go/promotions/navigator-experiences, /en-pt/miles-and-go/statuses, /en-pt/miles-and-go/use-miles/donate-miles). Flag: height more than 2 %.

| page | width | today | collapsed + live | height | pixels | blank lines (accordion) | markers left |
| --- | --- | --- | --- | --- | --- | --- | --- |
| /en-pt/miles-and-go/use-miles/donate-miles | 1440 | 6193 | 6301 | +1.7 % | 12.7 % | 0 | 0 |
| /en-pt/miles-and-go/use-miles/donate-miles | 390 | 6037 | 6121 | +1.4 % | 14.4 % | 0 | 0 |
| /de-de/verwalten-buchungen/extras/upgrades/auktionen | 1440 | 2757 | 2793 | +1.3 % | 5.5 % | 2 | 0 |
| /en-pt/miles-and-go/promotions/navigator-experiences | 1440 | 4237 | 4285 | +1.1 % | 6.2 % | 0 | 0 |
| /de-de/verwalten-buchungen/extras/upgrades/auktionen | 390 | 3535 | 3571 | +1 % | 10.2 % | 2 | 0 |
| /en-pt/miles-and-go/promotions/navigator-experiences | 390 | 3887 | 3912 | +0.6 % | 8.7 % | 0 | 0 |
| /de-de/an-bord/economy-prime | 390 | 8435 | 8476 | +0.5 % | 15 % | 0 | 0 |
| /de-de/buchungen/time-to-think | 1440 | 2192 | 2180 | -0.5 % | 2.2 % | 1 | 0 |
| /de-de/buchungen/time-to-think | 390 | 3116 | 3104 | -0.4 % | 3.3 % | 1 | 0 |
| /de-de/informationen/reisen-mit-tieren/haustier | 390 | 6543 | 6567 | +0.4 % | 8.7 % | 0 | 0 |
| /en-pt/miles-and-go/partners | 390 | 2812 | 2824 | +0.4 % | 2.2 % | 4 | 0 |
| /de-de/an-bord/economy-prime | 1440 | 7195 | 7217 | +0.3 % | 3.2 % | 0 | 0 |
| /de-de/informationen/reisen-mit-tieren/haustier | 1440 | 5060 | 5072 | +0.2 % | 3.8 % | 0 | 0 |
| /en-pt/destinations/get-inspired | 1440 | 39589 | 39589 | +0 % | 0 % | 46 | 0 |
| /en-pt/destinations/get-inspired | 390 | 42646 | 42658 | +0 % | 8.9 % | 46 | 0 |
| /en-pt/help/frequently-asked-questions | 1440 | 2079 | 2079 | +0 % | 0 % | 0 | 0 |
| /en-pt/help/frequently-asked-questions | 390 | 2340 | 2340 | +0 % | 0 % | 0 | 0 |
| /en-pt/miles-and-go/partners | 1440 | 2518 | 2518 | +0 % | 0 % | 4 | 0 |
| /en-pt/miles-and-go/statuses | 1440 | 3947 | 3947 | +0 % | 0 % | 8 | 0 |
| /en-pt/miles-and-go/statuses | 390 | 4185 | 4185 | +0 % | 0 % | 8 | 0 |

Every accordion item open (the four pages with accordions; the panels' paragraph pairs then count):

| page | width | today | collapsed + live | height | pixels |
| --- | --- | --- | --- | --- | --- |
| /en-pt/miles-and-go/partners | 1440 | 3832 | 3886 | +1.4 % | 3.8 % |
| /en-pt/miles-and-go/partners | 390 | 4574 | 4640 | +1.4 % | 8.3 % |
| /en-pt/miles-and-go/statuses | 1440 | 11483 | 11567 | +0.7 % | 3.2 % |
| /en-pt/miles-and-go/statuses | 390 | 15720 | 15804 | +0.5 % | 7.9 % |
| /en-pt/help/frequently-asked-questions | 1440 | 3175 | 3187 | +0.4 % | 2.2 % |
| /en-pt/help/frequently-asked-questions | 390 | 4068 | 4080 | +0.3 % | 4.7 % |
| /de-de/verwalten-buchungen/extras/upgrades/auktionen | 1440 | 6397 | 6385 | -0.2 % | 5.7 % |
| /de-de/verwalten-buchungen/extras/upgrades/auktionen | 390 | 10324 | 10312 | -0.1 % | 11.6 % |

**All within 2 %** (the largest 1.7 %: donate-miles's card texts, +12 px a pair without a blank line); no marker left; the theme ran live on every page. /en-pt/destinations/get-inspired's heading "shift" is the matcher pairing repeated headings in its fragments (its 1440 screenshot is the same pixel for pixel).

## Before the pass

- TAP's switch (`tap: { live: true }` in scripts/style-markers.js THEMES, ema-test's file) and the pass ship in one release. Nothing switched here.
- The harness runs `marker-collapse-cli.mjs --content <DA copy> --brand tap --force` on DA's documents (the 156 with a blank line on preview today; DA's may differ).
