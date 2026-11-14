/* eslint-disable max-len */
/* Standing order 27, item 4: an Austrian in-column grey band (www's .column-view.container-gray nested in a column item)
   that ends with a link line keeps 32 px under it, not the in-column 60 / 72 px (brief 462, measured on a band that ends
   with text). /at/en/healthy-travel's "Medical Travel Companions" band: www's grey ends about 44 px under the link's text,
   ours 84. Ranked on the four recorded documents with in-column bands: only healthy-travel moves, 1440 +1.47 -> +0.86 %,
   390 +0.75 -> +0.43 %. The in-column rule itself stays as it is.
   Run: node --max-old-space-size=256 --test test/austrian-in-column-link-end-so27.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/austrian.css', import.meta.url), 'utf8').replace(/\s+/g, ' ');
const SEL = 'body.brand-austrian main > .section.grey.in-column:has(> .default-content-wrapper:last-child > p.link-wrapper:last-child)';
const rule = (sel) => {
  const at = css.indexOf(`${sel} {`);
  return at < 0 ? '' : css.slice(at, css.indexOf('}', at));
};

test('an in-column band that ends with a link line: 32 px under it', () => {
  assert.match(rule(SEL), /padding-bottom: 32px;/);
});

test('the in-column band keeps 48 px above, 60 px below (72 from 768 px) otherwise', () => {
  assert.match(rule('body.brand-austrian main > .section.grey.in-column'), /padding: 48px 0 60px;/);
  assert.match(css, /@media \(width >= 768px\) \{ body\.brand-austrian main > \.section\.grey\.in-column \{ padding-bottom: 72px; \}/);
});

test('the link-line rule comes after the 768 px in-column rule (same weight below it would lose)', () => {
  const wide = css.indexOf('@media (width >= 768px) { body.brand-austrian main > .section.grey.in-column {');
  assert.ok(wide > 0 && css.indexOf(`${SEL} {`) > wide);
});
