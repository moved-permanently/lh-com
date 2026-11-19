/* Standing order 75 (SWISS and Group for Business, token-free):
   - Item 1: SWISS's column beside the aside at www's 794 px (781 px in a tab panel) from 1025 px, and 64 px more under
     a last sidebar section whose column ends with a card row or an accordion in its last part.
   - Item 2: the block options narrow-text (Columns Media) and padded-cells (Table Striped), and their READY lists.
   - Item 3: rail-fly's icons as a held list, with each picture's source and DA path.
   Strings only in assertions (no DOM node goes into one).
   Run: node --max-old-space-size=256 --test test/swiss-b2b-so75.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { BLOCK_OPTIONS, BLOCK_OPTION_LABELS, readBlockOptions } from '../scripts/style-markers.js';
import { listPaths, applyTextInserts, removeTextInserts } from '../tools/importer/text-inserts-apply.mjs';

const read = (f) => fs.readFileSync(new URL(f, import.meta.url), 'utf8');
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const swiss = read('../styles/themes/swiss.css');
const b2b = read('../styles/themes/b2b.css');
const DIR = '../tools/reports/parity-2026-11-09/';
const list = (n) => ({ txt: read(`${DIR}${n}.txt`), data: JSON.parse(read(`${DIR}${n}.json`)) });

test('swiss.css: the column at 794 px, 781 in a tab panel, the page end under a card row or an accordion part', () => {
  const block = swiss.slice(swiss.indexOf('standing order 75, item 1'));
  const col = 'body.brand-swiss main > .section.with-aside:not(.section-tab-panel, .section-tab-part) > :not(.section-aside, .breadcrumb-wrapper, .columns-media-wrapper:has(> .columns-media.sidebar))';
  const tab = 'body.brand-swiss main > .section.with-aside:is(.section-tab-panel, .section-tab-part) > :not(.section-aside, .breadcrumb-wrapper, .columns-media-wrapper:has(> .columns-media.sidebar))';
  const end = 'body.brand-swiss main > .section.with-aside:not(:has(~ .section:not(:empty))):is(:has(> .columns-media-wrapper + .section-aside), :has(> .section-part:nth-last-child(2) > .accordion-columns-wrapper:last-child))';
  assert.match(block, new RegExp(`@media \\(width >= 1025px\\) \\{\\s*${esc(col)} \\{\\s*padding-right: 48px;\\s*\\}\\s*${esc(tab)} \\{\\s*padding-right: 62px;\\s*\\}\\s*${esc(end)} \\{\\s*padding-bottom: 64px;\\s*\\}\\s*\\}`));
  assert.doesNotMatch(block, /:has\([^)]*:has\(/);
});

test('the options: registered with labels, read as text and cells, drawn by b2b.css only', () => {
  ['narrow-text', 'padded-cells'].forEach((o) => assert.ok(BLOCK_OPTIONS[o] && BLOCK_OPTION_LABELS[o], o));
  assert.equal(readBlockOptions(['columns-media', 'narrow-text']).text, 'narrow');
  assert.equal(readBlockOptions(['table-striped', 'padded-cells']).cells, 'padded');
  assert.match(b2b, /@media \(width >= 1025px\) \{\s*body\.brand-b2b main \.columns-media\.narrow-text \.columns-media-text > :is\(p, ul, ol\):not\(\.button-wrapper, :has\(> picture\)\) \{\s*box-sizing: border-box;\s*max-width: 66%;/);
  assert.match(b2b, /body\.brand-b2b main \.table-striped\.padded-cells :is\(th, td\) \{\s*padding-top: 117px;\s*padding-bottom: 117px;\s*\}/);
  assert.match(b2b, /\.table-striped\.padded-cells:not\(\.beside, \.beside-end, \.columns, \.matrix\):has\(> table tr:first-child > :nth-child\(5\)\) > table \{\s*height: auto;/);
  fs.readdirSync(new URL('../styles/themes/', import.meta.url)).filter((f) => f !== 'b2b.css' && f.endsWith('.css'))
    .forEach((f) => assert.doesNotMatch(read(`../styles/themes/${f}`), /narrow-text|padded-cells/, f));
});

test('the option lists: READY paths are the JSON\'s, each row adds the option to one block and nothing else', () => {
  [['delta-so75-b2b-narrow-text', 'narrow-text', 4], ['delta-so75-b2b-padded-cells', 'padded-cells', 3]].forEach(([n, opt, count]) => {
    const { txt, data } = list(n);
    assert.equal(data.length, count, n);
    assert.deepEqual([...new Set(listPaths(txt))].sort(), data.map((d) => d.path).sort(), n);
    data.forEach(({ path, inserts }) => {
      assert.equal(inserts.length, 1, path);
      const [{ replace, text }] = inserts;
      const tag = replace.match(/^<div class="[^"]*">/)[0];
      assert.equal(text, replace.replace(tag, tag.replace(/">$/, ` ${opt}">`)), path);
      assert.doesNotMatch(text, /\{[^}<]*\}/, path);
    });
  });
});

test('rail-fly\'s icons: held, three pictures per copy, each with its www source and DA path', () => {
  const { txt, data } = list('delta-so75-b2b-rail-fly-icons');
  assert.deepEqual(listPaths(txt), []);
  assert.equal((txt.match(/^HOLD\t/gm) || []).length, 4);
  assert.equal(data.length, 2);
  const icons = ['lh-icon-train-front.svg', 'lh-icon-voucher.svg', 'train-side-a.svg'];
  icons.forEach((i) => assert.match(txt, new RegExp(`https://business\\.lufthansagroup\\.com/content/dam/lh/icons/(irreg/)?${esc(i)}\\t/media-da/b2b/icons/${esc(i)}`)));
  data.forEach(({ inserts }) => {
    assert.equal(inserts.length, 3);
    inserts.forEach((x, k) => assert.ok(x.text.includes(`<picture><img src="/media-da/b2b/icons/${icons[k]}" alt=""></picture>`)));
  });
});

test('a row on a copy of its shape: inserted once, present the second time, back byte for byte', () => {
  const [row] = list('delta-so75-b2b-padded-cells').data;
  const copy = `<main><div>${row.inserts[0].replace}x</div></div></div></main>`;
  const once = applyTextInserts(copy, row.inserts);
  assert.deepEqual(once.results, ['inserted']);
  assert.deepEqual(applyTextInserts(once.html, row.inserts).results, ['present']);
  assert.equal(removeTextInserts(once.html, once.inserts), copy);
});
