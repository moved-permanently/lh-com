/* eslint-disable max-len */
/* lufthansa.com's teaser cards (blocks/cards-teaser, the hub pages' grid) as www's column-view,
   measured in the 2026-11-06 parity run against www's archived /de/en/services-on-board (1440 and
   390) and the screenshots of /de/en/overview-travel-information:
   - www's rows have 32 px of padding above the first image (.column-view p32): ours started the
     grid 24 px under the intro, 32 px higher;
   - the card titles keep their own margins (h2-only cards: heading-margin-xl, 32 px at 1440,
     28 px at 390; h3 titles heading-margin-l; three-up 24 px): the block's
     ".cards-teaser-body > * { margin: 0 0 24px }" outranked the :where() title rules, so every
     title had 24 px. Titles with a size marker keep the marker's margin.
   Scoped to body.brand-lufthansa (the brand sites' grids stay as their own parity passes left
   them); overlay tiles and a grid right after a grid (its 91 px) unchanged.
   Run: node --max-old-space-size=256 --test test/lufthansa-parity-cards-teaser.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../blocks/cards-teaser/cards-teaser.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const has = (re, msg) => assert.ok(re.test(css), msg ? `${msg}: ${re}` : String(re));

test('the first row 32 px under what comes before it, as www\'s column-view padding', () => {
  has(/body\.brand-lufthansa \.cards-teaser:not\(\.overlay\) > ul \{ padding-top: 32px; \}/);
  has(/body\.brand-lufthansa \.cards-teaser-wrapper \+ \.cards-teaser-wrapper > \.cards-teaser:not\(\.overlay\) > ul \{ padding-top: 0; \}/, 'a grid right after a grid keeps its 91 px');
});

test('the titles\' own margins win over the body rule (no size marker)', () => {
  has(/body\.brand-lufthansa \.cards-teaser:not\(\.overlay\) \.cards-teaser-body > \.cards-teaser-title:not\(\[class\*="heading-"\]\) \{ margin-bottom: var\(--heading-margin-l\); \}/);
  // h2 titles next to h3 titles too (brief 505, overview-special-request; test/cards-teaser-h2-titles-505.test.mjs)
  has(/body\.brand-lufthansa \.cards-teaser:not\(\.overlay, \.three-up\) \.cards-teaser-body > h2\.cards-teaser-title:not\(\[class\*="heading-"\]\) \{ margin-bottom: var\(--heading-margin-xl\); \}/);
  has(/body\.brand-lufthansa \.cards-teaser\.three-up:not\(\.overlay\) \.cards-teaser-body > \.cards-teaser-title:not\(\[class\*="heading-"\]\) \{ margin-bottom: var\(--spacing-default\); \}/);
});

test('the shared rules as before (the brand sites)', () => {
  has(/\.cards-teaser \.cards-teaser-body > \* \{ margin: 0 0 var\(--spacing-default\); \}/);
  has(/\.cards-teaser > ul \{ display: grid; grid-template-columns: minmax\(0, 1fr\); gap: 0 var\(--grid-gutter\); margin: 0; padding: 0; list-style: none; \}/);
  assert.ok(!/(^|\})\s*\.cards-teaser[^{}]*padding-top: 32px/.test(css), 'no unscoped padding-top');
});
