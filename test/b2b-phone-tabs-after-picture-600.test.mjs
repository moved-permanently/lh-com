/* eslint-disable max-len */
/* Group for Business (ema-lufthansa, standing order 21 of 2026-11-15, item 1): below 768 px a tab set right after a section
   that ends with a picture keeps www's 67 px under the picture (b2b-parity-013, de/en and xx/en programs-and-groups, phone
   first loads: www's first tab at 553, ours 514; the tab items match, 51 px apart). Census: of the 102 recorded B2B pages
   only these two have that shape. 390 1323 -> 1360 (www 1364, -3.01 -> -0.29 %) on both; 1440 unchanged; gb/en (its tab
   set after other content) unchanged. Run: node --test test/b2b-phone-tabs-after-picture-600.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/b2b.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const SEL = 'body.brand-b2b main > .section:has(> .default-content-wrapper:last-child > p:last-child > picture) + .section.section-tabs + .section.section-tab-panel';

test('below 768 px the first tab item 67 px under a closing picture', () => {
  const q = css.indexOf(`@media (width < 768px) { ${SEL} {`);
  assert.ok(q >= 0, 'below 768 px');
  const i = css.indexOf(`${SEL} {`, q);
  assert.match(css.slice(i, css.indexOf('}', i)), /margin-top: 67px;/);
  assert.equal(css.split(`${SEL} {`).length - 1, 1, 'only there');
});
