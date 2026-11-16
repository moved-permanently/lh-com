/* eslint-disable max-len -- dev tooling */
/* Standing order 47 of 2026-11-16, item 1: Cargo's /en/live-animals, www's tab band without a layout row (the closed rows
   alone at 390). Below 768 px a grey flush section that holds only a tab set has no padding (styles/themes/cargo.css);
   the row gives the live-animals section the style flush (delta-so47-cargo-live-animals-flush.txt). The product pages
   keep their padding: www's general-cargo and emergency put their tab sets in a row with 20 px padding.
   Run: node --max-old-space-size=256 --test test/cargo-live-animals-flush-so47.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { applySectionStyle } from '../tools/importer/section-style-apply.mjs';

const dir = new URL('../tools/reports/parity-2026-11-09/', import.meta.url);
const read = (f) => fs.readFileSync(new URL(f, dir), 'utf8');
const css = fs.readFileSync(new URL('../styles/themes/cargo.css', import.meta.url), 'utf8');
const SEL = 'body.brand-cargo main > .section.grey.flush:has(> .accordion-columns-wrapper:only-child > .accordion-columns.tabs) {';

test('the rule: a grey flush tab section without padding, below 768 px only, Cargo only', () => {
  const i = css.indexOf(SEL);
  assert.ok(i > 0, 'the rule is there');
  assert.equal(css.indexOf(SEL, i + 1), -1, 'once');
  const media = css.lastIndexOf('@media', i);
  assert.ok(media > css.lastIndexOf('}\n}', i), 'inside a media query');
  assert.equal(css.slice(media, css.indexOf('{', media)).trim(), '@media (width < 768px)');
  const body = css.slice(i, css.indexOf('}', i));
  assert.match(body, /padding-top: 0;/);
  assert.match(body, /padding-bottom: 0;/);
  assert.doesNotMatch(body, /margin/);
});

test('no rule takes the padding off a grey tab section without flush (order 45\'s shared rule stays out)', () => {
  assert.doesNotMatch(css, /\.section\.grey(?!\.flush)[^{]*:has\(> \.accordion-columns-wrapper:only-child > \.accordion-columns\.tabs\)[^{]*\{[^}]*padding-top: 0/);
});

test('the row: live-animals only, the tab section, flush; READY in its list', () => {
  const rows = JSON.parse(read('delta-so47-cargo-live-animals-flush.json'));
  assert.deepEqual(rows, [{ path: '/en/live-animals', block: 'accordion-columns', add: 'flush' }]);
  const list = read('delta-so47-cargo-live-animals-flush.txt');
  assert.match(list, /^READY\t\/en\/live-animals\tsection-style-apply \{"block": "accordion-columns", "add": "flush"\}/m);
  assert.doesNotMatch(list, /overview-manage/);
  const doc = '<body><header></header><main><div><h1>Live Animals</h1></div><div><div class="accordion-columns faq tabs"><div><div>Features</div><div><p>x</p></div></div></div><div class="section-metadata"><div><div>Style</div><div>grey</div></div></div></div></main><footer></footer></body>';
  const r = applySectionStyle(doc, rows.map(({ block, add }) => ({ block, add })));
  assert.equal(r.results[0].result, 'placed');
  assert.equal(r.html, doc.replace('<div>grey</div>', '<div>grey, flush</div>'));
});
