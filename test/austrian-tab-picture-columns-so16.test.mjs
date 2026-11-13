/* eslint-disable max-len */
/* Standing order 16, item 2 (Austrian row 55): travel-id at 1440 (+8 % against austrian-parity-015). Its tab panels
   ("Website", "Chat assistant", "App", "FlyNet": text, a button, then a picture) are two-column views on www: the text
   622 px wide on the left (half of the 1264 px content less 20), the picture beside it, both from the top; the heading
   heading-small (Portada 700 28 / 30.8 px). Ours had the picture full width under the text (+468 px in the stretch).
   From 1025 px a tab panel's default content whose last paragraph holds only a picture is laid out so; phones as
   before (no recording of their layout here). Reads austrian.css as written.
   Run: node --max-old-space-size=256 --test test/austrian-tab-picture-columns-so16.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/austrian.css', import.meta.url), 'utf8');
const W = 'body.brand-austrian main > .section.section-tab-panel > .default-content-wrapper:has(> p:last-child > picture:only-child)';
const at = (sel) => css.indexOf(`  ${sel} {`);
const body = (sel) => {
  const i = at(sel);
  return i < 0 ? '' : css.slice(i, css.indexOf('}', i));
};

test('from 1025 px: two equal columns 20 px apart, from the top', () => {
  const i = at(W);
  assert.ok(i > 0, 'the rule');
  assert.match(css.slice(css.lastIndexOf('@media', i), i), /@media \(width >= 1025px\)/);
  const r = body(W);
  assert.match(r, /display: grid;/);
  assert.match(r, /grid-template-columns: repeat\(2, minmax\(0, 1fr\)\);/);
  assert.match(r, /column-gap: 20px;/);
  assert.match(r, /align-items: start;/);
});

test('the text in the first column, the picture beside it over every row; the heading heading-small', () => {
  assert.match(body(`${W} > *`), /grid-column: 1;/);
  const pic = body(`${W} > p:last-child`);
  assert.match(pic, /grid-column: 2;/);
  assert.match(pic, /grid-row: 1 \/ span 20;/);
  const h = body(`${W} > h3:first-child`);
  assert.match(h, /font-family: var\(--heading-font-family\);/);
  assert.match(h, /font-size: 28px;/);
  assert.match(h, /line-height: 1\.1;/);
});

test('before the online-check-in parts (their tests read their own slices); no :has in a :has', () => {
  assert.ok(at(W) < css.indexOf('/* the end of online-check-in'));
  assert.doesNotMatch(W, /:has\([^)]*:has\(/);
});
