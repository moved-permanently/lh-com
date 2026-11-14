/* eslint-disable max-len */
/* Brussels P57 (ema-lufthansa, standing order 19 of 2026-11-14, item 3): from 768 px the "Flight offers from" slider keeps
   www's space around it, as SWISS row 55 (50 px above its heading, 65 px under its buttons); phones as before. Counted with
   each page's recorded cards answered in the measuring browser (brussels-so19-homepages.txt): be/en 1440 -3.87 -> -1.07 %,
   be/fr -3.43 -> -0.69 %, ke/en -4.55 -> -1.75 %, be/en local-page/offers -14.79 -> -12.31 %; fr/fr with its conditions
   row (delta-so15-brussels-conditions-link.txt, READY now) +1.33 -> -1.54 %, 390 +5.44 -> -4.08 %. The offers grid
   excluded. Run: node --test test/brussels-homepage-slider-space-600.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/brussels.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const SEL = 'body.brand-brussels main > .section.destination-finder-container:not(:has(.destination-finder.grid))';

test('from 768 px the slider\'s section keeps www\'s space above and under it, not the grid\'s', () => {
  const q = css.indexOf(`@media (width >= 768px) { ${SEL} {`);
  assert.ok(q >= 0, 'the 768 px rule');
  const i = css.indexOf(`${SEL} {`, q);
  const rule = css.slice(i, css.indexOf('}', i));
  assert.match(rule, /padding-top: 50px;/);
  assert.match(rule, /padding-bottom: 65px;/);
  assert.equal(css.split(`${SEL} {`).length - 1, 1, 'only there');
});

test('fr/fr\'s conditions row is READY with it', () => {
  const list = fs.readFileSync(new URL('../tools/reports/parity-2026-11-09/delta-so15-brussels-conditions-link.txt', import.meta.url), 'utf8');
  assert.match(list, /^READY\t\/fr\/fr\/homepage\t/m);
});
