/* eslint-disable max-len, import/extensions -- dev tooling */
/* Lost content (ema-lufthansa, standing order 26 of 2026-11-15, item 2; sweep-so26-lost-content-census.txt): Brussels
   travel-id's seven e-mail addresses back as mailto links, Discover customer-service's refund sentence back with its
   passenger-rights link (delta-so26-brussels-lost-content.txt, delta-so26-discover-lost-content.txt, with
   tools/importer/ita-fragment-replace-apply.mjs). Run: node --test test/lost-content-so26-600.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { readyPaths } from '../tools/importer/ita-fragment-insert-apply.mjs';
import { applyReplacements, revertReplacements } from '../tools/importer/ita-fragment-replace-apply.mjs';

const R = '../tools/reports/parity-2026-11-09/';
const read = (f) => fs.readFileSync(new URL(R + f, import.meta.url), 'utf8');
const bru = JSON.parse(read('delta-so26-brussels-lost-content.json'));
const disc = JSON.parse(read('delta-so26-discover-lost-content.json'));
const census = read('sweep-so26-lost-content-census.txt');

test('travel-id: each address once becomes its mailto link, text unchanged; reverting gives the copy back', () => {
  const rows = bru['/be/en/legal-notices/travel-id'];
  assert.equal(rows.length, 7);
  rows.forEach((r) => {
    const m = r.from.match(/^E-mail: ([^<]+)<\/td>$/)[1];
    assert.equal(r.to, `E-mail: <a href="mailto:${m}">${m}</a></td>`);
  });
  const doc = `<main><div><table><tbody>${rows.map((r) => `<tr><td>${r.from}</tr>`).join('')}</tbody></table></div></main>`;
  const a = applyReplacements(doc, rows);
  assert.deepEqual(a.problems, []);
  assert.equal(a.html.replace(/<a href="mailto:[^"]+">([^<]+)<\/a>/g, '$1'), doc, 'only the links added');
  assert.equal(revertReplacements(a.html, rows).html, doc);
  assert.ok(applyReplacements(a.html, rows).problems.length, 'a second run is refused');
});

test('customer-service: the list item with the lone link becomes www\'s sentence with the same link', () => {
  [['/de/en/my-bookings/manage/customer-service', '/de/en/legal/passenger-rights', 'Partially used tickets will be refunded proportionally.'], ['/de/de/my-bookings/manage/customer-service', '/de/de/legal/passenger-rights', 'Teilweise genutzte Tickets werden anteilig erstattet.']].forEach(([p, href, words]) => {
    const [r] = disc[p];
    assert.ok(r.from.includes(`<a href="${href}">`) && r.to.includes(`<a href="${href}">`), p);
    assert.ok(r.to.startsWith('</ul><p>') && r.to.includes(words) && r.to.endsWith('</p>'));
    const doc = `<main><div><ul><li>five hours.</li> ${r.from}<p>next</p></div></main>`;
    const a = applyReplacements(doc, [r]);
    assert.deepEqual(a.problems, []);
    assert.equal(revertReplacements(a.html, [r]).html, doc);
  });
});

test('the lists READY, naming the tool; the census lists these three pages as LOSS and no other', () => {
  assert.deepEqual(readyPaths(read('delta-so26-brussels-lost-content.txt')), ['/be/en/legal-notices/travel-id']);
  assert.deepEqual(readyPaths(read('delta-so26-discover-lost-content.txt')).sort(), Object.keys(disc).sort());
  const loss = census.split('\n').filter((l) => l.startsWith('LOSS\t')).map((l) => l.split('\t')[2]).sort();
  assert.deepEqual(loss, ['/be/en/legal-notices/travel-id', '/de/de/my-bookings/manage/customer-service', '/de/en/my-bookings/manage/customer-service']);
  assert.ok(!census.includes('/de/en/overview-manage'));
});
