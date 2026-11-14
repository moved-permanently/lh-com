/* eslint-disable max-len, import/extensions -- dev tooling */
/* ITA electronic-devices-and-batteries' lithium section as www's (standing order 17 of 2026-11-14, item 1):
   delta-so17-ita-electronic-devices-lithium.txt with tools/importer/ita-fragment-insert-apply.mjs. www's grey band opens
   with an empty text (32 px) and ends 38 px under its link; its two dividers (above "If you would like..." and above the
   PDF links); "Other Transportation Information" a heading-small H3; 37 px more before "Related". Every marker is one
   scripts/style-markers.js knows; each place found once; the list READY, status first.
   Run: node --test test/ita-electronic-devices-lithium-600.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { applyFragments, readyPaths } from '../tools/importer/ita-fragment-insert-apply.mjs';
import { HEADING_SIZES, SEPARATOR } from '../scripts/style-markers.js';

const PATH = '/it/en/book-and-prepare/travel-information/baggage/electronic-devices-and-batteries';
const data = JSON.parse(fs.readFileSync(new URL('../tools/reports/parity-2026-11-09/delta-so17-ita-electronic-devices-lithium.json', import.meta.url), 'utf8'));
const list = fs.readFileSync(new URL('../tools/reports/parity-2026-11-09/delta-so17-ita-electronic-devices-lithium.txt', import.meta.url), 'utf8');
const rows = data[PATH];

test('six rows, each a marker the page code knows', () => {
  assert.equal(rows.length, 6);
  rows.forEach((r) => {
    const t = r.html.replace(/^<p>|<\/p>$/g, '').trim();
    assert.ok(SEPARATOR.test(t) || HEADING_SIZES.includes(t.replace(/^\{|\}$/g, '')), `known: ${r.html}`);
    assert.equal(r.count, 1, 'found once');
  });
});

test('on a document of the section\'s shape every row lands, and a second run changes nothing', () => {
  // each place once: the band's end runs into "If you would like to bring", the divider's place
  const doc = `<main>${rows.reduce((d, r) => (d.includes(r.before) ? d : `${d}<div>x</div>${r.before}`), '')}</main>`;
  const r = applyFragments(doc, rows);
  assert.deepEqual(r.problems, []);
  // the start of each place (the divider lands inside the band end's place, which runs into it)
  rows.forEach((row) => assert.ok(r.html.includes(`${row.html}${row.before.slice(0, 40)}`), row.html));
  assert.ok(r.html.includes('<p>{spacer-13}</p><div class="section-metadata">') && r.html.includes('</div></div></div></div><div><p>{divider-4}</p><p>If you would like to bring'), 'the band ends, then the divider opens the next section');
  assert.ok(r.html.includes('</h3> {heading-small}') === false && r.html.includes(' {heading-small}</h3><ul>'), 'the heading marker inside the H3');
  assert.ok(applyFragments(r.html, rows).problems.length, 'refused the second time');
});

test('the list: the row READY, status first, the header naming the tool, its data and the gate', () => {
  assert.deepEqual(readyPaths(list), [PATH]);
  const head = list.split('\n')[0];
  assert.match(head, /node tools\/importer\/ita-fragment-insert-apply\.mjs --data tools\/reports\/parity-2026-11-09\/delta-so17-ita-electronic-devices-lithium\.json/);
  assert.match(head, /Expected change only/);
  assert.match(list.split('\n')[2], /^READY\t/);
  assert.match(list.split('\n')[2], /5133 \/ 8029/, 'www\'s heights in the row');
});
