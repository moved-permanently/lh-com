/* eslint-disable max-len, import/extensions */
/* Standing order 12 of 2026-11-13, item 3 (Group for Business): www writes some H1s in heading-small or heading-medium
   (route-network's timetable news, Allegris' "what's next", japan-joint-venture's Sustainability and Route network);
   4 of our documents render them heading-large. DA's copy plus the delta (delta-so12-b2b-h1-heading-sizes.txt,
   heading-size-marks-apply.mjs): 2 READY (route-network de/de, de/en), 2 HOLD (worse by more than 0.5 at one width).
   Run: node --test test/b2b-h1-heading-sizes-so12.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { applyHeadingSizeMarks, listPaths } from '../tools/importer/heading-size-marks-apply.mjs';

const read = (f) => fs.readFileSync(new URL(`../tools/reports/parity-2026-11-09/${f}`, import.meta.url), 'utf8');
const list = read('delta-so12-b2b-h1-heading-sizes.txt');
const data = JSON.parse(read('b2b-h1-heading-sizes-so12.json'));
const lines = list.split('\n').filter((l) => l.startsWith('/')).map((l) => l.split('\t'));

test('the list: 4 documents, route-network READY, the other two HOLD; the data H1s in heading-small / -medium', () => {
  assert.equal(lines.length, 4);
  assert.ok(lines.every((c) => c.length === 5 && /^(READY|HOLD \(worse at [0-9 and]+\))$/.test(c[4])));
  assert.deepEqual(listPaths(list).sort(), ['/de/de/travel-management/route-network', '/de/en/travel-management/route-network']);
  assert.equal(data.length, 5);
  assert.ok(data.every((r) => r.level === 1 && ['heading-small', 'heading-medium'].includes(r.size) && lines.some((c) => c[0] === r.path)));
});

test('READY / HOLD as the numbers say (0.5-point gate per width)', () => {
  lines.forEach(([p, , , result, verdict]) => {
    const [[a, b], [c, d]] = [...result.matchAll(/([\d.]+) -> ([\d.]+)/g)].map((m) => [Number(m[1]), Number(m[2])]);
    const worse = b - a > 0.5 || d - c > 0.5;
    assert.equal(verdict.startsWith('HOLD'), worse, p);
  });
});

test('a row marks the one H1 with its text, the rest of the document byte for byte', () => {
  const row = data.find((r) => r.path === '/de/en/travel-management/route-network');
  const doc = '<div><h1 id="a">Meet the whole world</h1><p><a href="/x?a=1&amp;b=2">x</a></p></div><div><h1 id="b">Lufthansa Group network and timetable updates</h1></div>';
  const { html, results } = applyHeadingSizeMarks(doc, [row]);
  assert.equal(results[0].result, '{heading-small}');
  assert.equal(html, doc.replace('timetable updates</h1>', 'timetable updates {heading-small}</h1>'));
});
