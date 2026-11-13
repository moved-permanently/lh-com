/* eslint-disable max-len */
/* SWISS row 54 (standing order 12 of 2026-11-13, item 2, a code cause): a page that ends with a grid of plain-view
   teasers (the importer's option plain-view: the special requests and travel information hubs; /ch/en/prepare,
   swiss-parity-005) has www's footer 20 px under the last teaser on phones and 40 px from 768 px; ours kept the section
   gap, 48 px. Such a last section keeps www's 20 / 40 px: prepare 1440 1277 -> 1269 (www 1268), 390 1781 -> 1753 (www
   1732); the four other recorded SWISS pages unchanged (book-and-manage ends with a grid without plain-view, www 52 px:
   the earlier shared rule failed there). One :has() level.
   Run: node --test test/swiss-plain-view-ending-596.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/swiss.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const SEL = 'body.brand-swiss main > .section:last-child:has(> .carousel-cards-wrapper:last-child > .carousel-cards.plain-view)';

test('a last section ending with plain-view teasers: 20 px to the footer, 40 px from 768 px', () => {
  const plain = css.indexOf(`${SEL} {`);
  assert.ok(plain >= 0, 'the rule');
  assert.ok(!css.slice(0, plain).trimEnd().endsWith('{'), 'the phone value outside any media query');
  assert.match(css.slice(plain, css.indexOf('}', plain)), /margin-bottom: 20px;/);
  const q = css.indexOf(`@media (width >= 768px) { ${SEL} {`);
  assert.ok(q >= 0, 'the 768 px value');
  const i = css.indexOf(`${SEL} {`, q);
  assert.match(css.slice(i, css.indexOf('}', i)), /margin-bottom: 40px;/);
});

test('only plain-view grids, and no :has() inside another', () => {
  assert.doesNotMatch(SEL, /:has\([^)]*:has\(/);
  assert.ok(!css.includes('body.brand-swiss main > .section:last-child:has(> .carousel-cards-wrapper:last-child) {'), 'not every teaser ending');
});
