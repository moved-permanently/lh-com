/* eslint-disable max-len */
/* Brussels (ema-lufthansa, standing orders 25 and 26 of 2026-11-15): below 768 px a button whose label does not fit wraps
   onto more lines, as www's maui-button-link, instead of hiding its end behind an ellipsis (the base button: nowrap,
   text-overflow ellipsis). Census at 390 (brussels-so25-button-wrap.txt): five recorded pages had a cut label; with the
   rule be/fr checked-baggage -2.83 -> -2.48 %, cancel-and-refund -2.78 -> -2.03 %, manchester -0.75 -> -0.48 %,
   vibrant-senegal +0.28 -> +0.39 % and upgrades +0.50 -> +0.75 % (www wraps there too); 1440 unchanged.
   Run: node --test test/brussels-phone-button-wrap-600.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/brussels.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const SEL = 'body.brand-brussels :is(a.button:any-link, button.button)';

test('below 768 px a Brussels button\'s label wraps, its lines from the left', () => {
  const q = css.indexOf(`@media (width < 768px) { ${SEL} {`);
  assert.ok(q >= 0, 'below 768 px');
  const i = css.indexOf(`${SEL} {`, q);
  const body = css.slice(i, css.indexOf('}', i));
  assert.match(body, /white-space: normal;/);
  assert.match(body, /text-align: left;/);
});

test('from 768 px nothing changes: no other Brussels button rule sets white-space', () => {
  const before = css.slice(0, css.indexOf(`@media (width < 768px) { ${SEL} {`));
  assert.doesNotMatch(before, /:is\(a\.button:any-link, button\.button\) \{[^}]*white-space/);
});
