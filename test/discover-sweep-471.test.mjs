/* eslint-disable max-len */
/* Discover Airlines, the parity sweep after brief 470 (discover.turnsthe.page against
   discover-parity-001 at 1440 and 390; tools/reports/parity-2026-11-08/sweep-brands.md, rows in
   tools/reports/discover/parity.md). Row 31 (the phone tab sets closed) is in
   test/section-tabs.test.mjs.
   Run: node --max-old-space-size=512 --test test/discover-sweep-471.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const theme = () => fs.readFileSync(new URL('../styles/themes/discover.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');

test('row 30: two-up teaser cards as www\'s rows of .twocolumn (Additional services): from 768 px each row 80 px under the one above (the column view\'s 40 px above and below), the columns 20 px apart', () => {
  const css = theme();
  const wide = css.split('@media (width >= 768px)').slice(1).join(' ');
  assert.ok(/body\.brand-discover \.carousel-cards\.grid\.two-up \.carousel-cards-track \{[^}]*row-gap: 80px;/.test(wide), 'row-gap 80px from 768px');
});
