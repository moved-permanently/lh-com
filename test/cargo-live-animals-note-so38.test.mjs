/* eslint-disable max-len, import/extensions -- dev tooling */
/* Standing order 38 of 2026-11-15, item 4: Cargo /en/live-animals. www's update note sits between two separators (<hr>
   components) that the importer drops; the rows (delta-so38-cargo-live-animals.txt) put a {divider-N} paragraph before
   the note's H4 and before "Please note", with the page's tab row. paragraph-spacer-apply.mjs learns kind "divider" and
   tag "h4"; its rows of before (no kind, no tag) work as they did.
   Run: node --max-old-space-size=256 --test test/cargo-live-animals-note-so38.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { applyParagraphSpacer } from '../tools/importer/paragraph-spacer-apply.mjs';
import { applyCargoTabs } from '../tools/importer/cargo-tabs-apply.mjs';
import { readyPaths } from '../tools/importer/ita-fragment-insert-apply.mjs';

const dir = new URL('../tools/reports/parity-2026-11-09/', import.meta.url);
const read = (f) => fs.readFileSync(new URL(f, dir), 'utf8');

test('a divider before a heading or a paragraph; there already, not found or a bad row: no change', () => {
  const doc = '<div><h1>Live Animals</h1><p>Looking after</p><h4>Update February 05, 2026: Container requirements</h4><p>Effective March 01</p><p><strong>Please note:</strong> Private individuals must book via a freight forwarder.</p></div>';
  const rows = JSON.parse(read('delta-so38-cargo-live-animals-dividers.json'));
  const r = applyParagraphSpacer(doc, rows);
  assert.deepEqual(r.results.map((x) => x.result), ['placed', 'placed']);
  assert.equal(r.html, doc.replace('<h4>Update', '<p>{divider-50}</p><h4>Update').replace('<p><strong>Please', '<p>{divider-44}</p><p><strong>Please'));
  assert.deepEqual(applyParagraphSpacer(r.html, rows).results.map((x) => x.result), ['there already', 'there already']);
  assert.equal(applyParagraphSpacer(doc, [{ text: 'Update February', n: 50, kind: 'divider' }]).results[0].result, 'not found', 'a heading only with its tag');
  assert.equal(applyParagraphSpacer(doc, [{
    text: 'Update', n: 50, kind: 'rule', tag: 'h4',
  }]).results[0].result, 'bad row');
  assert.equal(applyParagraphSpacer(doc, [{ text: 'Update', n: 50, tag: 'div' }]).html, doc);
  assert.equal(applyParagraphSpacer(doc, [{ text: 'Effective', n: 56 }]).html, doc.replace('<p>Effective', '<p>{spacer-56}</p><p>Effective'), 'rows of before as they were');
});

test('the list: live-animals READY at 1440, its tab row and dividers named in the header', () => {
  const list = read('delta-so38-cargo-live-animals.txt');
  assert.deepEqual(readyPaths(list), ['/en/live-animals']);
  const head = list.split('\n').filter((l) => l.startsWith('#')).slice(0, 4).join('\n');
  assert.match(head, /cargo-tabs-apply\.mjs --data tools\/reports\/parity-2026-11-09\/delta-so38-cargo-live-animals-tabs\.json/);
  assert.match(head, /paragraph-spacer-apply\.mjs --data tools\/reports\/parity-2026-11-09\/delta-so38-cargo-live-animals-dividers\.json/);
  const tabs = JSON.parse(read('delta-so38-cargo-live-animals-tabs.json'));
  assert.deepEqual(Object.keys(tabs), ['/en/live-animals']);
  const s = tabs['/en/live-animals'];
  const cell = '<h3>Species-appropriate, individualized transport</h3><p>From pets, horses, and exotic animals to ornamental fish</p><h3>Transporting animals quickly, with the best care</h3><ul><li>With Lufthansa Cargo, live animals are accompanied</li></ul><p><picture><img src="a.jpg" alt=""></picture></p>';
  const block = `<div class="accordion-columns faq">${s.titles.map((t, i) => `<div><div>${t.replace('&', '&amp;')}</div><div>${i ? '<p>x</p>' : cell}</div></div>`).join('')}</div>`;
  const r = applyCargoTabs(`<main><div>${block}</div></main>`, s);
  assert.deepEqual(r.problems, []);
  assert.match(r.html, /accordion-columns faq tabs/);
  assert.match(r.html, /<table><tbody><tr><td><h3>Species[\s\S]*<\/ul><\/td><td><p><picture>/);
  // the so37 list keeps live-animals HOLD (the tab row alone) and points here
  const so37 = read('delta-so37-cargo-product-tabs.txt');
  assert.ok(!readyPaths(so37).includes('/en/live-animals'));
  assert.match(so37, /READY together with the note's separators in delta-so38-cargo-live-animals\.txt/);
});
