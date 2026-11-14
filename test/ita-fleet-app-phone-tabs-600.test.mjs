/* eslint-disable max-len, import/extensions -- dev tooling */
/* ITA short-haul and ita-airways-app on phones as www's first loads (ema-lufthansa, standing order 20 of 2026-11-14, item 1):
   ita-parity-008 loads each page at 390 x 844 (manifest: loadedSeparately) and shows every tab panel closed, as long-haul's
   (delta-so19-ita-long-haul-tabs-closed.txt, live). delta-so20-ita-fleet-app-tabs-closed.txt: each page's Metadata row
   "Tabs open | none" (scripts/section-tabs.js), with tools/importer/ita-fragment-insert-apply.mjs. short-haul 390 5315 ->
   3014 (www 2955), ita-airways-app 5807 -> 5313 (www 5197); 1440 unchanged (the first tab stays selected from 768 px).
   Run: node --test test/ita-fleet-app-phone-tabs-600.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { applyFragments, readyPaths } from '../tools/importer/ita-fragment-insert-apply.mjs';

const PATHS = ['/it/en/world-of-ita-airways/discover-ita-airways/fleet/short-haul', '/it/en/world-of-ita-airways/discover-ita-airways/ita-airways-app'];
const data = JSON.parse(fs.readFileSync(new URL('../tools/reports/parity-2026-11-09/delta-so20-ita-fleet-app-tabs-closed.json', import.meta.url), 'utf8'));
const list = fs.readFileSync(new URL('../tools/reports/parity-2026-11-09/delta-so20-ita-fleet-app-tabs-closed.txt', import.meta.url), 'utf8');

test('each page: one metadata row "Tabs open | none", placed once, a second run refused', () => {
  assert.deepEqual(Object.keys(data).sort(), [...PATHS].sort());
  PATHS.forEach((p) => {
    const [row] = data[p];
    assert.equal(data[p].length, 1);
    assert.equal(row.html, '<div><div>Tabs open</div><div>none</div></div>');
    assert.match(row.before, /^<div><div>[^<]+<\/div><div>[^<]+<\/div><\/div>$/, 'before a metadata row');
    const doc = `<main><div><div class="metadata">${row.before}</div></div></main>`;
    const r = applyFragments(doc, data[p]);
    assert.deepEqual(r.problems, []);
    assert.ok(r.html.includes(`${row.html}${row.before}`));
    assert.ok(applyFragments(r.html, data[p]).problems.length);
  });
});

test('the list: both READY, status first, the header naming the tool and its data, www\'s phone heights', () => {
  assert.deepEqual(readyPaths(list).sort(), [...PATHS].sort());
  assert.match(list.split('\n')[0], /node tools\/importer\/ita-fragment-insert-apply\.mjs --data tools\/reports\/parity-2026-11-09\/delta-so20-ita-fleet-app-tabs-closed\.json/);
  assert.match(list.split('\n')[0], /Expected change only/);
  assert.match(list, /\t2955\t/);
  assert.match(list, /\t5197\t/);
});
