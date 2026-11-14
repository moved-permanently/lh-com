/* eslint-disable max-len, import/extensions -- dev tooling */
/* ITA long-haul on phones as www's newest first load (ema-lufthansa, standing order 19 of 2026-11-14, item 1):
   ita-parity-006 loads 390 x 844 on its own (manifest: loadedSeparately) and shows the fleet accordion closed; -005's open
   first item came from a resize of its 1440 load (resizedFrom 1440).
   - delta-so19-ita-long-haul-tabs-closed.txt: the page's Metadata row "Tabs open | none" (scripts/section-tabs.js reads
     tabs-open; first | none), with tools/importer/ita-fragment-insert-apply.mjs. 390 4931 -> 2897 (www 2809); 1440 unchanged.
   - ITA row 57 (styles/themes/ita.css): below 768 px a tab set's sections without the market variants' top margin
     (main > .section[data-markets] + .section, styles.css): a hidden market-variant table pushed the next closed item 24 px
     down. Long-haul with the row 2897 -> 2849 (+1.42 %); short-haul -0.45 -> -0.90 % (within the gate), ita-airways-app
     unchanged; 1440 unchanged. Run: node --test test/ita-long-haul-phone-tabs-600.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { applyFragments, readyPaths } from '../tools/importer/ita-fragment-insert-apply.mjs';

const PATH = '/it/en/world-of-ita-airways/discover-ita-airways/fleet/long-haul';
const data = JSON.parse(fs.readFileSync(new URL('../tools/reports/parity-2026-11-09/delta-so19-ita-long-haul-tabs-closed.json', import.meta.url), 'utf8'));
const list = fs.readFileSync(new URL('../tools/reports/parity-2026-11-09/delta-so19-ita-long-haul-tabs-closed.txt', import.meta.url), 'utf8');
const css = fs.readFileSync(new URL('../styles/themes/ita.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const tabs = fs.readFileSync(new URL('../scripts/section-tabs.js', import.meta.url), 'utf8');

test('the row: a metadata row "Tabs open | none" in the page\'s metadata block, once', () => {
  const [row] = data[PATH];
  assert.equal(data[PATH].length, 1);
  assert.equal(row.html, '<div><div>Tabs open</div><div>none</div></div>');
  assert.match(tabs, /getMetadata\('tabs-open'\)/);
  assert.match(tabs, /pageOpen === 'none'/);
  const doc = `<main><div><div class="metadata"><div><div>nav</div><div>/it/en/nav</div></div>${row.before}<div></div></main>`;
  const r = applyFragments(doc, data[PATH]);
  assert.deepEqual(r.problems, []);
  assert.ok(r.html.includes(`${row.html}${row.before}`));
  assert.ok(applyFragments(r.html, data[PATH]).problems.length, 'a second run changes nothing');
});

test('ITA row 57: below 768 px no market-variant margin inside a tab set', () => {
  const sel = 'body.brand-ita main > .section:is(.section-tab-panel, .section-tab-part):is([data-markets], [data-markets] + .section)';
  const q = css.indexOf(`@media (width < 768px) { ${sel} {`);
  assert.ok(q >= 0, 'below 768 px');
  const i = css.indexOf(`${sel} {`, q);
  assert.match(css.slice(i, css.indexOf('}', i)), /margin-top: 0;/);
  assert.equal(css.split(`${sel} {`).length - 1, 1, 'only there');
});

test('the list: READY, status first, the header naming the tool and its data, www\'s heights in the row', () => {
  assert.deepEqual(readyPaths(list), [PATH]);
  assert.match(list.split('\n')[0], /node tools\/importer\/ita-fragment-insert-apply\.mjs --data tools\/reports\/parity-2026-11-09\/delta-so19-ita-long-haul-tabs-closed\.json/);
  assert.match(list.split('\n')[0], /Expected change only/);
  assert.match(list.split('\n')[2], /^READY\t.*3526 \/ 2809/);
});
