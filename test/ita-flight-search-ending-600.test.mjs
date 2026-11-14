/* eslint-disable max-len */
/* ITA row 53 (standing order 16 of 2026-11-14, item 3): a page that ends with the flight-search band
   (/it/en/book-and-prepare/offers/territorial-continuity/alghero, ita-parity-004; the only recorded ITA page that does): from
   768 px www keeps 82 px from the band's "Find flights" button to the footer, ours 42 (the last section's margin is 0 by an
   earlier rule, so the band gets 40 px of padding under it). 1440 2281 -> 2321 (www 2328, -2.02 -> -0.30 %); on phones www
   keeps 70 px, ours 68, as before. Run: node --test test/ita-flight-search-ending-600.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/ita.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const SEL = 'body.brand-ita main > .section.flight-search-container:last-child';

test('from 768 px a page ending with the flight-search band keeps 40 px under it', () => {
  const q = css.indexOf(`@media (width >= 768px) { ${SEL} {`);
  assert.ok(q >= 0, 'the rule, from 768 px');
  const i = css.indexOf(`${SEL} {`, q);
  assert.match(css.slice(i, css.indexOf('}', i)), /padding-bottom: 40px;/);
  assert.equal(css.split(`${SEL} {`).length - 1, 1, 'only there');
});
