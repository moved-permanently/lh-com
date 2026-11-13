/* eslint-disable max-len, import/extensions */
/* Standing order 17 of 2026-11-13, item 1: tools/importer/text-inserts-apply.mjs, a delta on DA's copy as plain text
   inserts: per insert an anchor (a piece of DA's text found exactly once) and the text to put before or after it.
   Nothing else changes; removing the inserts gives back DA's copy byte for byte (the gate). An anchor not found
   once changes nothing; a copy that has every insert already is left as it is.
   Run: node --test test/text-inserts-apply-so17.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import { applyTextInserts, removeTextInserts, listPaths } from '../tools/importer/text-inserts-apply.mjs';

const DA = '<body><header></header><main><div><h1 id="t">Title &amp; more</h1><div class="columns-media divider-above nested"><div><div><p><picture><img src="https://x/a-1440x815.png" alt=""></picture></p><h3 id="h">Heading</h3></div></div><div><div><h2 id="cs">Case</h2></div></div></div></div></main><footer></footer></body>';
const INSERTS = [
  { before: '<h1 id="t">', text: '<p>{column-start-outer}</p>' },
  { after: 'a-1440x815.png" alt=""></picture></p>', text: '<p>{spacer-39}</p>' },
  { before: '</h3>', text: ' {heading-copytext-large}' },
  { after: '<div class="columns-media divider-above nested', text: ' equal-cells' },
  { before: '<div><div><h2 id="cs">', text: '</div><div class="columns-media divider-above nested equal-cells">' },
];

test('the inserts at their anchors, the rest byte for byte, and the gate', () => {
  const { html, results, inserts } = applyTextInserts(DA, INSERTS);
  assert.ok(results.every((r) => r === 'inserted'));
  assert.equal(html, '<body><header></header><main><div><p>{column-start-outer}</p><h1 id="t">Title &amp; more</h1><div class="columns-media divider-above nested equal-cells"><div><div><p><picture><img src="https://x/a-1440x815.png" alt=""></picture></p><p>{spacer-39}</p><h3 id="h">Heading {heading-copytext-large}</h3></div></div></div><div class="columns-media divider-above nested equal-cells"><div><div><h2 id="cs">Case</h2></div></div></div></div></main><footer></footer></body>');
  assert.equal(removeTextInserts(html, inserts), DA);
});

test('an anchor not found once changes nothing; a second run changes nothing', () => {
  const miss = applyTextInserts(DA, [...INSERTS, { before: '<h4>', text: 'x' }]);
  assert.equal(miss.html, DA);
  assert.equal(miss.results[5], 'anchor found 0 times');
  const twice = applyTextInserts(DA, [{ before: '<div>', text: 'x' }]);
  assert.equal(twice.html, DA);
  const once = applyTextInserts(DA, INSERTS).html;
  const again = applyTextInserts(once, INSERTS);
  assert.equal(again.html, once);
  assert.ok(again.results.every((r) => r === 'present'));
});

test('a list\'s READY rows, READY / HOLD first (order 18) or last (order 17)', () => {
  const txt = ['# header', 'READY\t/a\tx', 'HOLD\t/b\tx', '/c\trec\tchange\tREADY', '/d\trec\tchange\tHOLD (why)'].join('\n');
  assert.deepEqual(listPaths(txt), ['/a', '/c']);
});
