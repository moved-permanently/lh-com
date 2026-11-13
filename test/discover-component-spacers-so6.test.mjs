/* eslint-disable max-len, import/no-extraneous-dependencies, import/extensions -- dev tooling; linkedom is a dev dependency */
/* rows-for-ema-test.md row 4 (standing order 6 of 2026-11-12, item 1): www.discover-airlines.com's separators add 31 px
   between two components; the cleanup keeps them for Discover as "{spacer-30}" (52d5f939), and the collapse now carries
   them on THEMES.discover (componentSpacers): a run of 31 px or less between two components (blocks, headings, text) stays
   one "{spacer-N}"; at a section's start or end it goes as before; other brands as before; idempotent. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';
import { collapseHtml } from '../tools/importer/marker-collapse.mjs';
import { themeFor } from '../scripts/style-markers.js';

const accordion = '<div class="accordion-columns faq"><div><div>Travel agency tickets</div><div><p>If you purchased your flight…</p></div></div></div>';
const run = (html, brand = 'discover', path = '/de/en/my-bookings/manage/customer-service') => collapseHtml(html, {
  path, brand, parse: parseHTML, force: true,
}).html;
const markers = (html) => (html.match(/\{(spacer|divider)-\d+[^}]*\}/g) || []);

test('Discover: a 30 px separator between an accordion and a heading stays one {spacer-30}', () => {
  assert.equal(themeFor('discover').componentSpacers, true);
  const out = run(`<div><h1>Customer service</h1>${accordion}<p>{spacer-30}</p><h2>Rebooking a flight</h2><p>You can rebook online.</p></div>`);
  assert.deepEqual(markers(out), ['{spacer-30}']);
  assert.equal(out.includes('</div></div></div><p>{spacer-30}</p><h2'), true, 'right between the two');
  assert.equal(run(out), out, 'a second run leaves it');
});

test('Discover: between two blocks, between text and a block; two in a row as their sum', () => {
  const two = run(`<div><h1>T</h1>${accordion}<p>{spacer-30}</p>${accordion}<p>Text.</p><p>{spacer-30}</p>${accordion}</div>`);
  assert.deepEqual(markers(two), ['{spacer-30}', '{spacer-30}']);
  const sum = run('<div><h1>T</h1><p>Text.</p><p>{spacer-15}</p><p>{spacer-15}</p><h2>Next</h2></div>');
  assert.deepEqual(markers(sum), ['{spacer-30}']);
});

test('Discover: at a section\'s start or end, as before (none); larger spacers as before', () => {
  assert.deepEqual(markers(run('<div><p>{spacer-30}</p><h2>Rebooking</h2><p>Text.</p></div><div><h2>B</h2><p>x</p><p>{spacer-30}</p></div>')), []);
  const m = run(`<div><h1>T</h1>${accordion}<p>{spacer-60}</p><h2>Next</h2><p>x</p></div>`);
  assert.equal(markers(m).length, 0, 'a 60 px spacer is a Spacer block (or a section style), as before');
});

test('other brands: the same 30 px separator goes, as before', () => {
  ['lufthansa', 'b2b', 'austrian'].forEach((brand) => {
    assert.equal(Boolean(themeFor(brand).componentSpacers), false, brand);
    assert.deepEqual(markers(run(`<div><h1>T</h1>${accordion}<p>{spacer-30}</p><h2>Next</h2><p>x</p></div>`, brand, '/de/en/x')), [], brand);
  });
});

test('the list: 4 READY documents, each with data rows for the spacer delta', async () => {
  const fs = await import('node:fs');
  const { listPaths } = await import('../tools/importer/b2b-view-spacers-apply.mjs');
  const list = fs.readFileSync(new URL('../tools/reports/parity-2026-11-09/reimport-so6-lh-discover-separators.txt', import.meta.url), 'utf8');
  const data = JSON.parse(fs.readFileSync(new URL('../tools/reports/parity-2026-11-09/discover-separators-so6.json', import.meta.url), 'utf8'));
  const ready = listPaths(list);
  assert.deepEqual(ready, ['/de/de/book/special-requests/families', '/de/de/my-bookings/manage/customer-service', '/de/de/travel-inspiration/inspiration/destinations/punta-cana', '/de/en/my-bookings/manage/customer-service']);
  assert.equal(ready.every((p) => data.some((r) => r.path === p && r.px <= 31)), true);
});
