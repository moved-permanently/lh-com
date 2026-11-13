/* eslint-disable max-len, import/extensions */
/* Standing order 17 of 2026-11-13, item 1: businesstogo's nested-block delta (text-inserts-apply.mjs): its expected
   change first, the command, READY / HOLD as the numbers say (0.5 per width); the data: per page its inserts, the
   German pages with the option and the split, every page with four zoom spacers.
   Run: node --test test/b2b-businesstogo-nested-list-so17.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (f) => fs.readFileSync(new URL(`../tools/reports/parity-2026-11-09/${f}`, import.meta.url), 'utf8');
const list = read('delta-so17-b2b-businesstogo-nested.txt');
const data = JSON.parse(read('b2b-businesstogo-nested-so17.json'));

test('the list: expected change, the command, READY / HOLD by the gate', () => {
  assert.match(list.split('\n')[0], /^# Expected change: businesstogo's feature block as www's/);
  assert.ok(list.includes('node tools/importer/text-inserts-apply.mjs --data tools/reports/parity-2026-11-09/b2b-businesstogo-nested-so17.json --list tools/reports/parity-2026-11-09/delta-so17-b2b-businesstogo-nested.txt'));
  const rows = list.split('\n').filter((l) => l.startsWith('/')).map((l) => l.split('\t'));
  assert.equal(rows.length, 4);
  rows.forEach(([p, , , result, verdict]) => {
    const [[a, b], [c, d]] = [...result.matchAll(/([\d.]+) -> ([\d.]+)/g)].map((m) => [Number(m[1]), Number(m[2])]);
    assert.equal(verdict.startsWith('HOLD'), b - a > 0.5 || d - c > 0.5, p);
  });
});

test('the data: four zoom spacers each; the German pages with the outer view, the option and the split', () => {
  assert.deepEqual(data.map((d) => d.path), ['/de/de/program/businesstogo', '/xx/de/program/businesstogo', '/de/en/program/businesstogo', '/xx/en/program/businesstogo']);
  data.forEach(({ path, inserts }) => {
    assert.equal(inserts.filter((i) => i.text === '<p>{spacer-39}</p>').length, 4, path);
    const german = path.endsWith('/de/program/businesstogo');
    assert.equal(inserts.some((i) => i.text === ' equal-cells'), german, path);
    assert.equal(inserts.some((i) => i.text.includes('<div class="columns-media divider-above nested equal-cells">')), german, path);
    assert.equal(inserts.some((i) => i.text === '<p>{column-start-outer}</p><p>{column-start-outer}</p>'), german, path);
    assert.ok(inserts.every((i) => (i.before || i.after) && i.text), path);
  });
});
