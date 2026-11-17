/* eslint-disable max-len, import/extensions -- dev tooling */
/* Brussels (ema-lufthansa, standing order 42 of 2026-11-17): the closing related-topics band given www's spacing on
   the recorded pages where www's band is roomier (delta-so42-brussels-related-topics-band.txt).
   Run: node --test test/brussels-related-topics-band-so42.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { readyPaths } from '../tools/importer/ita-fragment-insert-apply.mjs';

const R = '../tools/reports/parity-2026-11-09/';
const data = JSON.parse(fs.readFileSync(new URL(`${R}delta-so42-brussels-related-topics-band.json`, import.meta.url), 'utf8'));
const list = fs.readFileSync(new URL(`${R}delta-so42-brussels-related-topics-band.txt`, import.meta.url), 'utf8');
const LANGS = ['be/en', 'be/fr', 'be/nl', 'de/de', 'es/es', 'it/it'];

test('checked-baggage in all six languages and bon, two rows each: under the band heading and after the cards', () => {
  assert.deepEqual(Object.keys(data).sort(), [...LANGS.map((l) => `/${l}/extra-services/baggage/checked-baggage`), '/be/en/extra-services/meals/bon'].sort());
  Object.values(data).forEach(([head, end]) => {
    assert.match(head.from, /<\/h2>$/);
    assert.ok(head.to.startsWith(head.from));
    assert.match(end.from, /<\/a><\/h4><\/div><\/div><\/div>$/);
    assert.ok(end.to.startsWith(end.from));
    [head, end].forEach((r) => assert.equal(r.count, 1));
  });
});

test('checked-baggage gets www\'s band at both widths, bon on phones only', () => {
  LANGS.forEach((l) => {
    const [head, end] = data[`/${l}/extra-services/baggage/checked-baggage`];
    assert.equal(head.to.slice(head.from.length), '<p>{spacer-36 from-768}</p><p>{spacer-47 below-768}</p>');
    assert.equal(end.to.slice(end.from.length), '<p>{spacer-35 from-768}</p><p>{spacer-89 below-768}</p>');
  });
  const [head, end] = data['/be/en/extra-services/meals/bon'];
  assert.equal(head.to.slice(head.from.length), '<p>{spacer-47 below-768}</p>');
  assert.equal(end.to.slice(end.from.length), '<p>{spacer-57 below-768}</p>');
});

test('the list: all seven READY with their gate, no page-end rule, the backup named', () => {
  assert.deepEqual(readyPaths(list).sort(), Object.keys(data).sort());
  assert.doesNotMatch(list, /FURTHER/);
  assert.match(list, /So no page-end rule/);
  assert.match(list, /\.token-free-backup\/2026-11-brussels-so42-related-topics-band\//);
});
