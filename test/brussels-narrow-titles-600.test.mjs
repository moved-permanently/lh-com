/* eslint-disable max-len, import/extensions -- dev tooling */
/* Brussels (ema-lufthansa, standing order 24 of 2026-11-15, item 2): on the checked-baggage pages www's accordion questions
   wrap in a 257 px text box on phones (button.header 331 px, padding 13px 20px, the 24 px chevron and a 10 px gap;
   brussels-parity-011, be/fr), ours in 280. A rule for every accordion moves other pages further (mpl-cadet-program,
   student-fares, problems-with-your-baggage, ita-airways: brussels-so24-accordion-titles.txt), so five of the six pages get a
   variant, "narrow-titles", by a delta row (delta-so24-brussels-checked-baggage-narrow-titles.txt), and below 768 px its
   questions keep www's 10 px gap before the chevron. 390 closer on the five (es/es, whose questions fit either way, unchanged and left out); 1440 unchanged.
   Run: node --test test/brussels-narrow-titles-600.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { readyPaths } from '../tools/importer/ita-fragment-insert-apply.mjs';
import { applyReplacements } from '../tools/importer/ita-fragment-replace-apply.mjs';

const css = fs.readFileSync(new URL('../styles/themes/brussels.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const SEL = 'body.brand-brussels main .accordion-columns.narrow-titles .accordion-columns-title';
const PATHS = ['be/en', 'be/fr', 'be/nl', 'de/de', 'it/it'].map((l) => `/${l}/extra-services/baggage/checked-baggage`);
const data = JSON.parse(fs.readFileSync(new URL('../tools/reports/parity-2026-11-09/delta-so24-brussels-checked-baggage-narrow-titles.json', import.meta.url), 'utf8'));
const list = fs.readFileSync(new URL('../tools/reports/parity-2026-11-09/delta-so24-brussels-checked-baggage-narrow-titles.txt', import.meta.url), 'utf8');

test('below 768 px a narrow-titles accordion\'s questions 54 px from the right edge, only there', () => {
  const q = css.indexOf(`@media (width < 768px) { ${SEL} {`);
  assert.ok(q >= 0, 'below 768 px');
  const i = css.indexOf(`${SEL} {`, q);
  assert.match(css.slice(i, css.indexOf('}', i)), /padding-right: 54px;/);
  assert.equal(css.split('.narrow-titles').length - 1, 1, 'no other rule names the variant');
});

test('the delta: the five pages, the variant added to the block\'s class once; a second run changes nothing', () => {
  assert.deepEqual(Object.keys(data).sort(), [...PATHS].sort());
  PATHS.forEach((p) => {
    const rows = data[p];
    assert.equal(rows.length, 1);
    assert.equal(rows[0].from, '<div class="accordion-columns faq limited-width">');
    assert.equal(rows[0].to, '<div class="accordion-columns faq limited-width narrow-titles">');
    const doc = `<main><div>${rows[0].from}<div><div>q</div><div>a</div></div></div></div></main>`;
    const r = applyReplacements(doc, rows);
    assert.deepEqual(r.problems, []);
    assert.ok(applyReplacements(r.html, rows).problems.length);
  });
});

test('the list: five READY rows, the header naming the tool and its data', () => {
  assert.deepEqual(readyPaths(list).sort(), [...PATHS].sort());
  assert.match(list.split('\n')[0], /node tools\/importer\/ita-fragment-replace-apply\.mjs --data tools\/reports\/parity-2026-11-09\/delta-so24-brussels-checked-baggage-narrow-titles\.json/);
  assert.match(list.split('\n')[0], /Expected change only/);
});
