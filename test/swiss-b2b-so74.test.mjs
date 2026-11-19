/* Standing order 74 (SWISS and Group for Business, token-free):
   - Item 1: SWISS a footnote list at the page's end in small print (ch/de imprint).
   - Item 2: Group for Business a table followed by a heading 71 px above it (www's box: rows + 40, then 31 to the
     heading); a button or an accordion right before a Spacer without a gap of its own (the Spacer is www's gap).
   - Item 3: the Spacer blocks where the cleanup took a marker out and nothing draws its space now
     (delta-so74-b2b-spacing-lost, spacing-lost-so74.txt).
   Strings only in assertions (no DOM node goes into one).
   Run: node --max-old-space-size=256 --test test/swiss-b2b-so74.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { listPaths, applyTextInserts, removeTextInserts } from '../tools/importer/text-inserts-apply.mjs';

const read = (f) => fs.readFileSync(new URL(f, import.meta.url), 'utf8');
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const b2b = read('../styles/themes/b2b.css');
const swiss = read('../styles/themes/swiss.css');
const DIR = '../tools/reports/parity-2026-11-09/';
const rule = (css, sel, body) => assert.match(css, new RegExp(`\\*/\\n(?:[^\\n]*\\n\\n)*?${esc(sel)} \\{\\s*${body}\\s*\\}`), sel);

test('swiss.css: a footnote list at the page\'s end is small print, only on a page with a footnote link', () => {
  const sel = 'body.brand-swiss main:has(a[href^="#"] > sup) > .section:last-child > .default-content-wrapper:last-child > ol:last-child';
  assert.match(swiss, new RegExp(`\\*/\\n${esc(sel)} \\{\\s*font-size: var\\(--body-font-size-xs\\);\\s*\\}`));
  assert.equal(swiss.split(sel).length - 1, 1);
});

test('swiss.css: a Profile Tabs panel\'s lists over two thirds of the content from 1025 px, its paragraphs not', () => {
  const sel = 'body.brand-swiss main .profile-tabs.content .profile-tabs-panel > :is(ul, ol):not(.full-width)';
  assert.match(swiss, new RegExp(`@media \\(width >= 1025px\\) \\{\\s*${esc(sel)} \\{\\s*box-sizing: border-box;\\s*max-width: 66%;\\s*\\}\\s*\\}`));
  assert.doesNotMatch(swiss, /\.profile-tabs-panel > p:not/);
});

test('b2b.css: the gap under a table before a heading, and no gap of its own before a Spacer', () => {
  const t = 'body.brand-b2b main .table-striped-wrapper:has(+ .default-content-wrapper > h2:first-child) > .table-striped:not(.beside, .beside-end)';
  const b = 'body.brand-b2b main .default-content-wrapper > p.button-wrapper:has(+ p.spacer)';
  const a = 'body.brand-b2b main > .section > .accordion-columns-wrapper + .default-content-wrapper:has(> p.spacer:first-child)';
  const m = 'body.brand-b2b main .accordion-columns-wrapper + .default-content-wrapper > p.column-mark.column-start-outer:first-child';
  rule(b2b, t, 'margin-bottom: 71px;');
  assert.match(b2b, new RegExp(`${esc(b)} \\{\\s*margin-bottom: 0;\\s*\\}`));
  assert.match(b2b, new RegExp(`${esc(a)} \\{\\s*margin-top: 0;\\s*\\}`));
  assert.match(b2b, new RegExp(`\\*/\\n${esc(m)} \\{\\s*padding-top: 0;\\s*\\}`));
  [t, b, a, m].forEach((s) => assert.equal(b2b.split(`${s} {`).length - 1, 1, s));
});

test('the other themes don\'t carry order 74\'s rules', () => {
  const others = fs.readdirSync(new URL('../styles/themes/', import.meta.url)).filter((f) => !['swiss.css', 'b2b.css'].includes(f) && f.endsWith('.css'));
  others.forEach((f) => assert.doesNotMatch(read(`../styles/themes/${f}`), /standing order 74/, f));
});

test('the spacing list: READY paths are exactly the JSON\'s, each one Spacer block, token-free', () => {
  const txt = read(`${DIR}delta-so74-b2b-spacing-lost.txt`);
  const data = JSON.parse(read(`${DIR}delta-so74-b2b-spacing-lost.json`));
  assert.deepEqual([...new Set(listPaths(txt))].sort(), data.map((d) => d.path).sort());
  assert.deepEqual(data.map((d) => d.path), ['/de/de/homepage', '/de/en/homepage', '/de/de/travel-solutions/lufthansa-group-airlines', '/de/en/about-us/help-alliance']);
  data.forEach(({ path, inserts }) => {
    assert.equal(inserts.length, 1, path);
    const [i] = inserts;
    assert.match(i.text, /^<div class="spacer( from-768)?"><div><div><\/div><\/div><\/div>$/, path);
    assert.ok(i.before && !i.text.includes(i.before), path);
    assert.doesNotMatch(i.text, /\{[^}<]*\}/, path);
  });
  assert.equal(data.filter((d) => d.inserts[0].text.includes('from-768')).length, 2);
  assert.doesNotMatch(txt, /^READY\t\/de\/en\/travel-solutions\/lufthansa-group-airlines/m);
});

test('the quote list: the author\'s line break in all five cash-and-points copies, nothing else', () => {
  const txt = read(`${DIR}delta-so74-b2b-quote-author.txt`);
  const data = JSON.parse(read(`${DIR}delta-so74-b2b-quote-author.json`));
  assert.deepEqual([...new Set(listPaths(txt))].sort(), data.map((d) => d.path).sort());
  assert.equal(data.length, 5);
  data.forEach(({ path, inserts }) => {
    assert.match(path, /^\/(de|xx|cn)\/(en|de)\/program\/partner-plus-benefit\/cash-and-points$/);
    assert.equal(inserts.length, 1);
    const [i] = inserts;
    assert.equal(i.text, i.replace.replace('</strong>Cimpress', '</strong><br>Cimpress'));
    assert.ok(!i.text.includes(i.replace));
  });
});

test('the census file names every marker the cleanup took out, and what draws it now', () => {
  const t = read(`${DIR}spacing-lost-so74.txt`);
  const rows = t.split('\n').filter((l) => l && !l.startsWith('#'));
  assert.ok(rows.length >= 30);
  rows.forEach((l) => assert.equal(l.split('\t').length, 5, l.slice(0, 60)));
  assert.equal(rows.filter((l) => l.endsWith('delta-so74-b2b-spacing-lost') || /\tREADY: delta-so74-b2b-spacing-lost/.test(l)).length, 4);
});

test('a row on a copy of its shape: inserted once, present the second time, back byte for byte', () => {
  const [row] = JSON.parse(read(`${DIR}delta-so74-b2b-spacing-lost.json`));
  const copy = `<main><div><h1>x</h1><p>y</p>${row.inserts[0].before}</div></div></div></div></main>`;
  const once = applyTextInserts(copy, row.inserts);
  assert.deepEqual(once.results, ['inserted']);
  assert.ok(once.html.includes(`<div class="spacer from-768"><div><div></div></div></div>${row.inserts[0].before}`));
  assert.deepEqual(applyTextInserts(once.html, row.inserts).results, ['present']);
  assert.equal(removeTextInserts(once.html, once.inserts), copy);
});
