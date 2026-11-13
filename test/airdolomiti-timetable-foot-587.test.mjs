/* eslint-disable max-len */
/* Air Dolomiti's timetable pages (standing order 4 of 2026-11-11, item 4, the ranking; AD row 111; airdolomiti-parity-001
   /orario-voli, /en/flight-timetables, /de/flugplan +1.4 to +2.3 % at 1440): www's WidgetFullPage box ends 20 px over the
   footer (margin-bottom 20px, row 60). Ours carried the 20 px on the block but its section's 48 px margin won, so the
   footer came 28 px lower on all three pages. A section that ends with the timetable now has no margin of its own.
   Run: node --test test/airdolomiti-timetable-foot-587.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/airdolomiti.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
const block = fs.readFileSync(new URL('../blocks/flight-timetable/flight-timetable.css', import.meta.url), 'utf8');

test('a section ending with the timetable keeps no margin under it', () => {
  const sel = 'body.brand-airdolomiti main > .section:has(> .flight-timetable-wrapper:last-child) {';
  const i = css.indexOf(sel);
  assert.ok(i > 0, 'the rule');
  assert.match(css.slice(i, css.indexOf('}', i)), /margin-bottom: 0;/);
});

test('the block\'s own 20 px under it stays (www\'s WidgetFullPage)', () => {
  assert.match(block, /margin: 150px 0 20px;/);
});
