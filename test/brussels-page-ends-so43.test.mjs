/* eslint-disable max-len, import/extensions -- dev tooling */
/* Brussels (ema-lufthansa, standing order 43 of 2026-11-17): the two check-in hub pages and us-traveling-with-disabilities
   given www's gap to the footer by a spacer pair after their last block (delta-so43-brussels-page-ends.txt).
   Run: node --test test/brussels-page-ends-so43.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { readyPaths } from '../tools/importer/ita-fragment-insert-apply.mjs';

const R = '../tools/reports/parity-2026-11-09/';
const data = JSON.parse(fs.readFileSync(new URL(`${R}delta-so43-brussels-page-ends.json`, import.meta.url), 'utf8'));
const list = fs.readFileSync(new URL(`${R}delta-so43-brussels-page-ends.txt`, import.meta.url), 'utf8');

test('each row only adds a spacer pair after the page\'s last block', () => {
  Object.values(data).forEach((rows) => {
    assert.equal(rows.length, 1);
    const [r] = rows;
    assert.equal(r.count, 1);
    assert.ok(r.to.startsWith(r.from));
    assert.match(r.from, /<\/div><\/div><\/div>$/);
    assert.match(r.to.slice(r.from.length), /^(<p>\{spacer-\d+ (below|from)-768\}<\/p>){2}$/);
  });
});

test('the hub pages give back the card-end padding; us-traveling gets www\'s gap', () => {
  ['/be/en/check-in-options-and-info', '/be/fr/check-in-options-and-info'].forEach((p) => {
    const [r] = data[p];
    assert.equal(r.to.slice(r.from.length), '<p>{spacer-208 below-768}</p><p>{spacer-79 from-768}</p>');
  });
  const [u] = data['/be/en/legal-notices/us-traveling-with-disabilities'];
  assert.match(u.from, /^U\.S\. Department of Transportation<\/a>/);
  assert.equal(u.to.slice(u.from.length), '<p>{spacer-52 from-768}</p><p>{spacer-62 below-768}</p>');
});

test('the list: all three READY, none further, the backup named', () => {
  assert.deepEqual(readyPaths(list).sort(), Object.keys(data).sort());
  assert.doesNotMatch(list, /FURTHER/);
  assert.match(list, /\.token-free-backup\/2026-11-brussels-so43-page-ends\//);
});
