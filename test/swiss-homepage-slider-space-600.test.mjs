/* eslint-disable max-len */
/* SWISS row 55 (ema-lufthansa, standing order 18 of 2026-11-14): from 768 px the homepage's "Flight offers from" slider keeps
   www's space around it (swiss-parity-008, ch/en at 1440: about 50 px more above its heading and 65 px more under its
   buttons than ours); phones as before (ours is taller there already). Counted with the recording's 15 priced cards:
   ch/en 1440 4275 -> 4390 (www 4433, -3.56 -> -0.97 %), ch/de 4298 -> 4413 (www 4480, -4.06 -> -1.50 %); 390 unchanged; the
   offers grid (its own section) excluded; the homepages are the recorded SWISS pages with the slider.
   Run: node --test test/swiss-homepage-slider-space-600.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/swiss.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const SEL = 'body.brand-swiss main > .section.destination-finder-container:not(:has(.destination-finder.grid))';

test('from 768 px the slider\'s section keeps www\'s space above and under it, not the grid\'s', () => {
  const q = css.indexOf(`@media (width >= 768px) { ${SEL} {`);
  assert.ok(q >= 0, 'the 768 px rule');
  const i = css.indexOf(`${SEL} {`, q);
  const rule = css.slice(i, css.indexOf('}', i));
  assert.match(rule, /padding-top: 50px;/);
  assert.match(rule, /padding-bottom: 65px;/);
  assert.equal(css.split(`${SEL} {`).length - 1, 1, 'only there');
});
