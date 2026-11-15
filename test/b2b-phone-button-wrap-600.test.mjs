/* eslint-disable max-len */
/* Group for Business (ema-lufthansa, standing order 26 of 2026-11-15, item 3): below 768 px a button label that does not
   fit wraps instead of hiding its end behind the base button's ellipsis, as Brussels' rule (item 1). Census of every
   recorded B2B page at 390 and 1440 (cut-labels-so26.txt): one cut label, /de/en/allegris/intermediaries-start-of-booking's
   "“Advance seat reservation” factsheet" at 390 (342 of 347 px): 9101 -> 9125 (b2b-parity-012's phone first load 9053,
   +0.53 -> +0.80 %), the label whole. Run: node --test test/b2b-phone-button-wrap-600.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/b2b.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const SEL = 'body.brand-b2b :is(a.button:any-link, button.button)';

test('below 768 px a B2B button\'s label wraps', () => {
  const q = css.indexOf(`@media (width < 768px) { ${SEL} {`);
  assert.ok(q >= 0, 'below 768 px');
  const i = css.indexOf(`${SEL} {`, q);
  assert.match(css.slice(i, css.indexOf('}', i)), /white-space: normal;/);
});
