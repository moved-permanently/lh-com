# What a Spacer block costs, and the fix (brief 536 item 1)

ema-adobe, 2026-11-09. ITA's `/it/en/legal/terms-and-conditions-of-use` is 13 `{spacer-40}` markers that became 13
Spacer blocks. Measured on our hosts only: the branch preview
`token-free-ita-live--lh-ita--moved-permanently.aem.page` (theme live) against `ita.turnsthe.page` (published, markers,
theme off), at 1440 and 390. No request to www. Nothing written, uploaded or published. Scratch: logs/b536 (not in git).

## 1. One Spacer block, measured

| (1440, the page's first two Spacers) | host: `{spacer-40}` | branch: Spacer block (M) |
| --- | --- | --- |
| the paragraph before | 24 px margin below | 24 px margin below |
| the separator's box (`p.spacer`, margin 0) | 41 px (40 + 1) | 61 px (M 60 + 1) |
| the H2 after it: margin above | 0 | **32 px** |
| from the paragraph's text to the H2 | 65 px | 117 px (+52) |

With the theme live a Spacer block renders as `p.spacer` *inside the same default-content wrapper* as the text around
it (no section or block boundary, so there is no section gap and no block gap). The +52 px per Spacer comes from two
parts:

- **+20 px, decided:** 40 px is rounded to M, 60 px (decisions.md 3, brief 506 item 2). This is the collapse table
  working as designed.
- **+32 px, not intended:** on flow pages the theme gives a heading that follows other content its heading gap
  (styles.css "theme rules": `body.theme-live.flow-spacing main .default-content-wrapper > :not(h1, h2, h3, h4, h5, h6) +
  :is(h2, h3) { margin-top: var(--theme-heading-gap, 32px) }`). `p.spacer` counts as "other content", so the heading
  gets 32 px on top of the separator that already stands for www's gap. On www and on the host, the heading after a
  separator has no margin of its own.

So a Spacer block costs its M or L size, plus 32 px when a heading follows it on a flow page. It costs nothing more when
no heading follows it, or off flow pages (ITA's homepages: 8 Spacers, none before a heading).

The whole page:

| terms-and-conditions-of-use | host | branch now | branch + the fix (injected) |
| --- | --- | --- | --- |
| 1440 | 8,354 px | 9,030 (+676, +8.1 %) | 8,614 (+260, +3.1 %) |
| 390 | 19,067 px | 19,743 (+676, +3.5 %) | 19,327 (+260, +1.4 %) |
| "13. Governing Law" (the last H2) | | +676 px | +260 px (13 x 20, decision 3) |

## 2. How many documents

ITA: the 2,563 paths that ITA's upload state lists as previewed, all read from our preview
(`main--lh-ita--…aem.page/<path>.plain.html`, 200 ms apart, 0 missing). The brief counts 2,195 in DA's own tree; the
harness counts that tree, not this list. 1,061 were already collapsed on the preview. The other 1,502 still had markers
(the ITA pass is running), so I projected those with a dry run of the collapse CLI (`--brand ita --force`, the pass's
code; 0 left, 0 errors). Each document's Theme meta came from our preview's full page, since `.plain.html` drops the
Metadata block.

| ITA after the collapse | documents | Spacer blocks | Dividers | Spacers right before an H2/H3 (+32 px each) |
| --- | --- | --- | --- | --- |
| flow pages | 53 | 151 | 45 | **125** |
| other pages (homepage, homepage-new) | 8 | 8 | 0 | 0 |
| **all** | **61 of 2,563** | **159** | **45** | **125** |

**Documents with five or more Spacer blocks: 9.** All of them are `legal/terms-and-conditions-of-use`, with 13 each and
every one of the 13 before an H2, in br/pt, de/de, es/es, fr/fr, gr/el, it/en, it/it, jp/ja and nl/nl. Each is +676 px
today and +260 px with the fix. By page:

| page (per market, 9 markets) | Spacers / Dividers per page | Spacers before a heading |
| --- | --- | --- |
| legal/terms-and-conditions-of-use | 13 / 0 | 13 |
| manage-my-bookings/extra-services/upgrade/bid-upgrade (8 markets; the ninth has the Divider only) | 1 / 1 | 1 |
| world-of-ita-airways/discover-ita-airways/fleet/short-haul | 2 / 1 | 0 |
| legal | 0 / 2 | 0 (2 Dividers before headings) |
| book-and-prepare/travel-information/travel-briefing | 0 / 1 | 0 (a Divider before a heading) |
| legal/accessibility-statement-app (7), legal/accessibility-statement (1) | 1 / 0 | 0 |

(Per-document rows: logs/b536/ita-spacer-split.tsv.) This bears out ITA lesson 3 ("pages that carry many Spacer blocks
are the ones that fail page checks"): the only ITA pages over the 3 % flag from Spacers are those nine.

The brands next in line (their census dry runs, logs/b536/lh-b2b with Theme rows):

| | documents with Spacers | Spacers / Dividers | Spacers right before a heading (flow pages) | five or more |
| --- | --- | --- | --- | --- |
| Lufthansa Group for Business | 91 of 733 | 170 / 108 | 106 | 2: `/de/de` and `/de/en/news/lhg-ita-airways`, 8 each |
| Lufthansa Cargo | 0 of 990 | 0 | 0 | 0 |
| Air Dolomiti | 0 of 1,569 | 0 | 0 | 0 |

B2B, measured with the fix injected (collapsed document as `<main>` on b2b.turnsthe.page with the working copy's code
and the theme live, against the published page; logs/b507/capture-live.cjs):

| B2B page | host | collapsed | collapsed + the fix |
| --- | --- | --- | --- |
| /de/en/news/lhg-ita-airways 1440 | 5,531 | +277 (+5.0 %) | -11 (-0.2 %) |
| /de/en/news/lhg-ita-airways 390 | 6,016 | +271 (+4.5 %) | -17 (-0.3 %) |
| /de/en/program/experts/on-board/meals-on-board 1440 | 23,566 | +126 (+0.5 %) | -2 (-0.0 %) |
| /de/en/program/experts/on-board/meals-on-board 390 | 22,838 | +95 (+0.4 %) | -33 (-0.1 %) |

## 3. The fix: a pure CSS rule in the common theme (ema-test's file, not applied)

This is **a CSS change in styles/styles.css, the common theme's "theme rules"**. No change to the collapse, to
marker-collapse.mjs or to the documents. The heading gap skips a heading that follows a Spacer, because the Spacer
already stands for the gap. Dividers keep their behaviour: their own rules, styles.css `p.spacer.divider + :is(h2, h3)`
for Lufthansa and styles/themes/b2b.css for B2B, are untouched and were not measured here.

The exact change, one selector in the existing rule:

```diff
-body.theme-live.flow-spacing main .default-content-wrapper > :not(h1, h2, h3, h4, h5, h6) + :is(h2, h3) {
+body.theme-live.flow-spacing main .default-content-wrapper > :not(h1, h2, h3, h4, h5, h6, p.spacer:not(.divider)) + :is(h2, h3) {
   margin-top: var(--theme-heading-gap, 32px);
 }
```

The comment above the rule gains: "not after a Spacer: the Spacer is the gap (brief 536)". This is equivalent to the
override I injected for the measurements (`… > p.spacer:not(.divider) + :is(h2, h3) { margin-top: 0 }`). Narrowing the
rule is cleaner than overriding it, because nothing else has to win against it.

- Only where the theme is live (`body.theme-live`), only on flow pages (`.flow-spacing`). Published pages and pages of
  brands not yet switched don't change.
- A Spacer from 768 px (`p.spacer.from-768`) is hidden on phones. The heading after it then gets 0 + the paragraph's
  24 px, the same as the host.
- Every live brand's flow pages are affected: -32 px for each Spacer right before a heading. ema-test should run their
  pass-check sample on the brands already live before merging. I counted only ITA, B2B, Cargo and Air Dolomiti here.

The rejected alternative, the collapse writing the space into the neighbouring section (Section Metadata `space-m`
with a new section at each Spacer): on terms-and-conditions-of-use that means 13 new sections and 13 carriers in a
document a person edits. It adds the section gap (48 px) where the Spacer adds 20, and it is a change to ema-test's
collapse rather than to one rule. The CSS rule does better (+260 px instead of +676) without touching a document.

The test (ema-test's, to go with the change: `test/spacer-heading-gap-536.test.mjs`, the same form as
test/ruled-chapter-gap-526.test.mjs):

```js
/* eslint-disable max-len */
/* the common theme, brief 536 item 1: on flow pages with the theme live a heading after other content gets the brand's
   heading gap (32 px), but not right after a Spacer block: the Spacer is the gap (ITA's terms-and-conditions-of-use, 13
   Spacers before H2s, +676 px, +260 with this). Dividers keep their own rules.
   Run: node --max-old-space-size=256 --test test/spacer-heading-gap-536.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/styles.css', import.meta.url), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const SEL = 'body.theme-live.flow-spacing main .default-content-wrapper > :not(h1, h2, h3, h4, h5, h6, p.spacer:not(.divider)) + :is(h2, h3)';

test('the heading gap skips a heading right after a Spacer, the live theme on flow pages only', () => {
  const i = css.indexOf(`${SEL} {`);
  assert.ok(i >= 0, 'the rule');
  assert.match(css.slice(i + SEL.length, css.indexOf('}', i)), /margin-top: var\(--theme-heading-gap, 32px\);/);
  assert.ok(SEL.includes('.theme-live') && SEL.includes('.flow-spacing'));
});

test('no other rule gives the heading after every separator the gap again', () => {
  assert.ok(!css.includes('body.theme-live.flow-spacing main .default-content-wrapper > :not(h1, h2, h3, h4, h5, h6) + :is(h2, h3) {'), 'the old selector is gone');
});
```

Numbers to expect after the change: ITA's nine terms pages go from +8.1 % to +3.1 % at 1440 (still flagged over 3 % and
below 10 %, so by lesson 4 they aren't held), and from +3.5 % to +1.4 % at 390. ITA's eight bid-upgrade pages gain -32 px
(one Spacer before a heading each); no other ITA page changes. B2B's lhg-ita-airways pages go from about +5 % to under
0.5 % at both widths.

## 4. What is left

- The rule is ema-test's to apply, with the test, on main (and so in each switch branch once it carries main). I
  wrote it and measured it injected; I didn't apply it.
- The live brands' pass-check samples with the change (ema-test).
