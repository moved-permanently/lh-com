/* eslint-disable max-len */
/* Air Dolomiti's breadcrumb look (styles/themes/airdolomiti.css), brief 448: as www's Breadcrumbs
   (airdolomiti-parity-001): every crumb capitalised ("Home | Servizi | Parcheggi Convenzionati",
   www's text-transform: capitalize on lower-case labels), and every crumb but the page's semibold,
   the level without a page (blocks/breadcrumb Breadcrumb Levels, a span) too.
   Run: node --test test/airdolomiti-breadcrumb-448.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/airdolomiti.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');

test('the crumbs capitalised, the levels without a page semibold as the links', () => {
  assert.match(css, /body\.brand-airdolomiti \.breadcrumb ol \{[^}]*text-transform: capitalize;/);
  assert.match(css, /body\.brand-airdolomiti \.breadcrumb li:not\(\.breadcrumb-current\) > span \{[^}]*font-weight: 600;/);
});
