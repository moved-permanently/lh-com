/* eslint-disable max-len */
/* ITA row 51 (standing order 12 of 2026-11-13, item 1, a code cause): /it/en/support/utilities/contact (ita-parity-005,
   -5.24 % at 390). On phones www keeps 62 px between the stacked country columns of a row (each a heading-medium H2 with
   its lines), ours 38: the columns-media-text's 36 px margin, the row grid without a gap. Below 768 px a padded
   columns-media text column that opens with a heading-medium H2 and is not its row's last keeps 60 px under it: contact
   390 7318 -> 7786 (www 7723, +0.82 %); entry-exit-system 390 -2.46 -> -2.20 %; the 37 other recorded ITA pages
   unchanged; 1440 as before (row 45's 89 px between rows stays). Without the H2 condition three pages went further
   (residents-in-sicily, seats-selection-economy, ita-airways-app). One :has() level.
   Run: node --test test/ita-padded-columns-phones-596.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/ita.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const SEL = 'body.brand-ita .columns-media.padded .columns-media-row > .columns-media-text:not(:last-child):has(> h2.heading-medium:first-child)';

test('below 768 px: 60 px under a stacked column that opens with a heading-medium H2', () => {
  const q = css.indexOf(`@media (width < 768px) { ${SEL} {`);
  assert.ok(q >= 0, 'the rule, below 768 px');
  const i = css.indexOf(`${SEL} {`, q);
  assert.match(css.slice(i, css.indexOf('}', i)), /margin-bottom: 60px;/);
});

test('only there, and no :has() inside another', () => {
  assert.equal(css.split(`${SEL} {`).length - 1, 1);
  assert.ok(!css.includes('.columns-media.padded .columns-media-row > .columns-media-text:not(:last-child) {'), 'not every stacked column');
  assert.doesNotMatch(SEL, /:has\([^)]*:has\(/);
});
