/* Standing order 77 (2026-11-19), item 1: below 768px the flight-status block's three tabs
   shared the bar in thirds and their labels did not wrap, so on /ch/el and /ch/ru
   fly/flight-information/arrival-departure at 390 the Greek and Russian labels ran 3 to 26px
   into the next tab. www's maui-tab-control (.tab.spread) sizes a tab from its own label and
   shares out the rest; SWISS's tabs do the same, and a label that cannot fit wraps inside its
   tab. The shared thirds (other brands) stay.
   Run: node --test test/flight-status-tabs-swiss-so77.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../blocks/flight-status/flight-status.css', import.meta.url), 'utf8');
const phones = css.match(/@media \(width < 768px\) \{\s*\.flight-status \.flight-status-tab \{[^}]*\}([\s\S]*?)\n\}/);

test('SWISS tabs below 768px: sized from their label, a label that cannot fit wraps', () => {
  assert.ok(phones, 'the phone rule of the tabs');
  const m = phones[1].match(/body\.brand-swiss \.flight-status \.flight-status-tab \{([^}]*)\}/);
  assert.ok(m, 'the SWISS rule inside the phone media query');
  assert.match(m[1], /flex: 1 1 auto;/);
  assert.match(m[1], /min-width: auto;/);
  assert.match(m[1], /white-space: normal;/);
});

test('the shared tabs keep their thirds and one-line labels', () => {
  assert.match(phones[0], /\.flight-status \.flight-status-tab \{\s*flex: 1 1 0;\s*min-width: 0;\s*padding-inline: 4px;/);
  assert.match(css, /\n\.flight-status \.flight-status-tab \{[^}]*white-space: nowrap;/);
});
