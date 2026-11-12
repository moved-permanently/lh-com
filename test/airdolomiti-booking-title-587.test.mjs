/* eslint-disable max-len */
/* Air Dolomiti's booking pages (standing order 4 of 2026-11-11, item 4, the ranking; AD row 114; airdolomiti-parity-001
   /prenotazioni, /en/booking, /de/buchung +18 px each at 1440): www's booking widget box starts 30 px under the title
   (TitleMargin's), ours 48 (the sections' gap), the box itself the same 352 px. A title section followed by the full
   search (not the strip of the hubs and destination pages) keeps 30 px under it, from 930 px (on phones www shows its
   sticky widget, another layout).
   Run: node --test test/airdolomiti-booking-title-587.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/airdolomiti.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');

test('the booking search 30 px under the title', () => {
  const sel = '  body.brand-airdolomiti main > .section:has(> .default-content-wrapper:last-child > h1:last-child):has(+ .section.flight-search-container .flight-search:not(.strip)) {';
  const i = css.indexOf(sel);
  assert.ok(i > 0, 'the rule');
  assert.match(css.slice(i, css.indexOf('}', i)), /margin-bottom: 30px;/);
  assert.ok(css.lastIndexOf('@media (width >= 930px)', i) > css.lastIndexOf('}\n}', i), 'from 930 px (www\'s phone widget is its own layout)');
});
