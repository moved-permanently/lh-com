/* eslint-disable max-len, import/no-extraneous-dependencies, import/extensions -- dev tooling; linkedom is a dev dependency */
/* Standing order 8 of 2026-11-12, item 2 (rows-for-ema-test.md row 5): www.brusselsairlines.com's small separators
   (.separator .hr-no-layout, no line, 11 to 30 px) between a text component and the next headline: the heading 48 to
   51 px under the paragraph on www, 32 ours. The cleanup keeps such a separator as "{spacer-28}"; the collapse removed
   it (textSpacers wanted running text on both sides). On Brussels (the one theme with textSpacers) a run of 31 px or
   less between running text and the next heading now stays as one {spacer-N}; the same on a second run. A spacer after
   a heading, before a block, at a section's start, and on other brands: as before.
   Run: node --test test/brussels-heading-spacers-so8.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';
import { collapseHtml } from '../tools/importer/marker-collapse.mjs';

const run = (html, brand = 'brussels') => collapseHtml(html, {
  path: '/be/en/contact/service-charges', brand, parse: parseHTML, force: true,
}).html;

test('Brussels: a small spacer between a paragraph and an H2, and a list and an H3, stays', () => {
  const html = '<div><h1>Service charges</h1><p>Fees apply.</p><p>{spacer-28}</p><h2>Ticket service fee for other countries</h2><ul><li>One</li></ul><p>{spacer-28}</p><h3>Next</h3><p>Text</p></div>';
  const once = run(html);
  assert.ok(once.includes('<p>Fees apply.</p><p>{spacer-28}</p><h2'), 'paragraph -> H2: kept');
  assert.ok(once.includes('</ul><p>{spacer-28}</p><h3'), 'list -> H3: kept');
  assert.ok(run(once).split('{spacer-28}').length === 3, 'second run: both still there');
});

test('Brussels: a run before a heading is one spacer of its sum (31 px or less)', () => {
  const once = run('<div><p>Text</p><p>{spacer-11}</p><p>{spacer-17}</p><h2>H</h2><p>x</p></div>');
  assert.ok(once.includes('<p>Text</p><p>{spacer-28}</p><h2'), once.slice(0, 200));
});

test('Brussels: after a heading, before a block, at the section\'s start: removed as before', () => {
  const once = run('<div><p>{spacer-28}</p><h2>A</h2><p>{spacer-28}</p><h2>B</h2><p>t</p><p>{spacer-28}</p><div class="cards"><div><div>c</div></div></div></div>');
  assert.ok(!once.includes('{spacer-28}'), once.slice(0, 300));
});

test('other brands: a small spacer before a heading removed as before', () => {
  const html = '<div><h1>T</h1><p>Fees apply.</p><p>{spacer-28}</p><h2>H</h2><p>x</p></div>';
  ['lufthansa', 'austrian', 'b2b'].forEach((brand) => {
    assert.ok(!run(html, brand).includes('{spacer-28}'), brand);
  });
});

test('the delta (text-spacers-apply.mjs, kind separator): www\'s separator size between the text and the heading, H2 or H3', async () => {
  const { applyTextSpacers } = await import('../tools/importer/text-spacers-apply.mjs');
  const html = '<div><h1>Service charges</h1><p>Fees apply.</p><h2>Ticket service fee for other countries</h2><ul><li>Last item</li></ul><h3>Next one</h3><p>x</p></div>';
  const rows = [
    {
      site: 'brussels', path: '/x', kind: 'separator', after: 'Fees apply.', before: 'Ticket service fee for other countries', level: 2, n: 28,
    },
    {
      site: 'brussels', path: '/x', kind: 'separator', after: 'Last item', before: 'Next one', level: 3, n: 28,
    },
  ];
  const { html: out, results } = applyTextSpacers(html, rows);
  assert.ok(results.every((r) => r.result === '{spacer-28}'), JSON.stringify(results.map((r) => r.result)));
  assert.ok(out.includes('<p>Fees apply.</p><p>{spacer-28}</p><h2') && out.includes('</ul><p>{spacer-28}</p><h3'));
  assert.ok(applyTextSpacers(out, rows).results.every((r) => r.result === 'present'), 'idempotent');
  // a separator row whose heading is not the next element: nothing
  const moved = applyTextSpacers('<div><p>Fees apply.</p><p>Other</p><h2>Ticket service fee for other countries</h2></div>', [rows[0]]);
  assert.ok(!moved.html.includes('{spacer-'), moved.results[0].result);
});

test('the list: 9 READY of the 14 (reimport-589-brussels-heading-spacers.txt), the data 26 separators from the recordings', async () => {
  const fs = await import('node:fs');
  const { listPaths } = await import('../tools/importer/text-spacers-apply.mjs');
  const list = fs.readFileSync(new URL('../tools/reports/parity-2026-11-09/reimport-589-brussels-heading-spacers.txt', import.meta.url), 'utf8');
  const data = JSON.parse(fs.readFileSync(new URL('../tools/reports/parity-2026-11-09/brussels-heading-spacers-so8.json', import.meta.url), 'utf8'));
  assert.ok(list.split('\n').filter((l) => l.startsWith('/')).length === 14);
  assert.ok(listPaths(list).length === 9, String(listPaths(list).length));
  assert.ok(data.length === 26 && data.every((r) => r.kind === 'separator' && r.n >= 11 && r.n <= 30));
});
