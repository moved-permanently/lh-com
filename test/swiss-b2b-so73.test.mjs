/* Standing order 73 (SWISS and Group for Business: content rows, token-free):
   - Item 1: Group for Business an Embed with option small draws www's iframe component (YouTube at most 560 x 315 px);
     the video rows (cash-and-points en READY, de HOLD here, READY with the FAQ in the content list); SWISS
     womenseuro22's player in the column.
   - Item 2: Group for Business a Table Striped beside-end drawn as www's two-column view (rows at their own height,
     a box 40 px taller above and below from 768 px; the served stack on phones); the German cash-and-points FAQ as an
     accordion; SWISS green-fare h3-large, new-destinations' Spacer-only section gone, the newsletter text out of its
     sidebar Columns Media.
   Strings only in assertions (no DOM node goes into one).
   Run: node --max-old-space-size=256 --test test/swiss-b2b-so73.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { listPaths, applyTextInserts, removeTextInserts } from '../tools/importer/text-inserts-apply.mjs';

const read = (f) => fs.readFileSync(new URL(f, import.meta.url), 'utf8');
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const b2b = read('../styles/themes/b2b.css');
const DIR = '../tools/reports/parity-2026-11-09/';
const list = (n) => ({ txt: read(`${DIR}${n}.txt`), data: JSON.parse(read(`${DIR}${n}.json`)) });
const NAMES = ['delta-so73-b2b-video-embeds', 'delta-so73-b2b-content', 'delta-so73-swiss-video-embeds', 'delta-so73-swiss-content'];

test('b2b.css: an Embed with option small is a 560 x 315 YouTube player, at every width', () => {
  const sel = 'body.brand-b2b main .embed.small .media-embed-youtube';
  assert.match(b2b, new RegExp(`\\*/\\n${esc(sel)} \\{\\s*max-width: 560px;\\s*height: 315px;\\s*aspect-ratio: auto;\\s*\\}`));
  assert.equal(b2b.replace(/\/\*[\s\S]*?\*\//g, '').split('.embed.small').length - 1, 1);
});

test('b2b.css: a Table Striped beside-end as www\'s two-column view, the served stack on phones', () => {
  const t = 'body.brand-b2b main .table-striped.beside-end';
  assert.match(b2b, new RegExp(`@media \\(width >= 768px\\) \\{\\s*${esc(t)} :is\\(th, td\\) \\{\\s*padding-bottom: 32px;\\s*\\}\\s*${esc(t)} \\.table-striped-table \\{\\s*padding: 40px 0;`));
  assert.match(b2b, new RegExp(`@media \\(width < 768px\\) \\{\\s*${esc(t)} > \\.table-striped-main > \\.table-striped-table \\{\\s*margin-top: 32px;\\s*\\}\\s*${esc(t)} > \\.table-striped-aside \\{\\s*margin-top: 40px;\\s*\\}\\s*${esc(t)} > \\.table-striped-aside img \\{\\s*aspect-ratio: auto;\\s*\\}\\s*${esc(t)} > \\.table-striped-aside > :last-child \\{\\s*margin-bottom: 0;`));
});

test('the other themes don\'t carry order 73\'s rules', () => {
  const others = fs.readdirSync(new URL('../styles/themes/', import.meta.url)).filter((f) => !['swiss.css', 'b2b.css'].includes(f) && f.endsWith('.css'));
  others.forEach((f) => assert.doesNotMatch(read(`../styles/themes/${f}`), /standing order 73/, f));
});

test('the lists: READY paths are exactly the JSON\'s, the held de copies only in the video list', () => {
  NAMES.forEach((n) => {
    const { txt, data } = list(n);
    assert.deepEqual([...new Set(listPaths(txt))].sort(), data.map((d) => d.path).sort(), n);
  });
  const v = list('delta-so73-b2b-video-embeds');
  assert.deepEqual([...new Set(listPaths(v.txt))].sort(), ['/de/en/program/partner-plus-benefit/cash-and-points', '/xx/en/program/partner-plus-benefit/cash-and-points']);
  assert.match(v.txt, /^HOLD\t\/de\/de\/program\/partner-plus-benefit\/cash-and-points\t1440/m);
  assert.doesNotMatch(read(`${DIR}delta-so73-swiss-content.txt`), /^READY\t\/ch\/en\/fly\/on-board\/food-and-beverage/m);
});

test('the rows: token-free, each a block, an option, a section style or a block gone', () => {
  NAMES.forEach((n) => list(n).data.forEach(({ path, inserts }) => inserts.forEach((i) => {
    const anchor = i.replace ?? i.before ?? i.after;
    (i.text.match(/\{[^}<]*\}/g) || []).forEach((tok) => assert.ok(anchor.includes(tok), `${n} ${path}: ${tok}`));
    assert.ok(!i.text.includes(anchor) || i.text === '', `${n} ${path}: the text holds its anchor (a second run would apply it again)`);
  })));
  const b = list('delta-so73-b2b-content').data;
  assert.ok(b.filter((d) => /cash-and-points/.test(d.path)).every((d) => d.inserts.some((i) => i.text.includes('<div class="embed small">')) && d.inserts.some((i) => (i.text.match(/<div><div>\d\. /g) || []).length === 5)));
  assert.ok(b.filter((d) => /a350-1000/.test(d.path)).every((d) => d.inserts[0].text.startsWith('<div class="table-striped beside-end"><div><div><p><picture>')));
  const s = list('delta-so73-swiss-content').data;
  assert.equal(s.filter((d) => d.inserts[0].text === '<div class="section-metadata"><div><div>Style</div><div>h3-large</div></div></div>').length, 10);
  assert.equal(s.filter((d) => d.inserts[0].text === '' && (d.inserts[0].replace || '').startsWith('<div><div class="spacer l">')).length, 11);
  assert.equal(s.filter((d) => (d.inserts[0].replace || '').startsWith('<div class="columns-media sidebar">')).length, 11);
});

test('a row on a copy of its shape: inserted once, present the second time, back byte for byte', () => {
  const [row] = list('delta-so73-b2b-video-embeds').data;
  const copy = `<main><div>${row.inserts[0].replace}<p>x</p></div></main>`;
  const once = applyTextInserts(copy, row.inserts);
  assert.deepEqual(once.results, ['inserted']);
  assert.ok(once.html.includes('<div class="embed small"><div><div><p><a href="https://www.youtube.com/embed/61-yM0_dZro'));
  assert.deepEqual(applyTextInserts(once.html, row.inserts).results, ['present']);
  assert.equal(removeTextInserts(once.html, once.inserts), copy);
});
