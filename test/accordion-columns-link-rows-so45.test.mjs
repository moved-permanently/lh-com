/* eslint-disable max-len -- list lines */
/* Standing order 45, item 2: accordion-columns option `link-rows`: a row whose only content is one link is a link line
   in the list (an item's title, no disclosure), as www's Cargo image lists draw "Global Partner", "Premium Partner" and
   "Business Partner" after "The program" on /en/ci/partnerships-subsidiaries. Without the option every row stays an
   item, as before. The partnerships row (delta-so45-cargo-partnerships-links.txt) and the gate.
   Run: node --max-old-space-size=256 --test test/accordion-columns-link-rows-so45.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';
// eslint-disable-next-line import/extensions -- the tool is an .mjs module
import { applyTextInserts, listPaths } from '../tools/importer/text-inserts-apply.mjs';

const { window, document } = parseHTML('<!DOCTYPE html><html lang="en"><head></head><body></body></html>');
window.location = {
  hostname: 'main--lh-cargo--moved-permanently.aem.page', pathname: '/en/ci/partnerships-subsidiaries', search: '', hash: '', href: 'https://main--lh-cargo--moved-permanently.aem.page/en/ci/partnerships-subsidiaries', origin: 'https://main--lh-cargo--moved-permanently.aem.page',
};
Object.defineProperty(window, 'origin', { value: 'https://main--lh-cargo--moved-permanently.aem.page', configurable: true });
window.matchMedia = () => ({ matches: false, addEventListener: () => {}, addListener: () => {} });
globalThis.window = window;
globalThis.document = document;
globalThis.NodeFilter = { SHOW_ELEMENT: 1, SHOW_TEXT: 4 };
globalThis.Node = window.Node;

const { default: decorate } = await import('../blocks/accordion-columns/accordion-columns.js');

const read = (p) => fs.readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const R = 'tools/reports/parity-2026-11-09';
const ROWS = '<div><div>The program</div><div><p>Partnership is an important asset.</p></div></div>'
  + '<div><div><a href="/partner?aid=global-partners-anchor">Global Partner</a></div></div>'
  + '<div><div><a href="/partner?aid=premium-partners-anchor">Premium Partner</a></div><div></div></div>'
  + '<div><div><p>See the <a href="/partner">partner page</a></p></div></div>';
const build = async (classes) => {
  const el = document.createElement('div');
  el.className = `accordion-columns ${classes}`;
  el.innerHTML = ROWS;
  document.body.replaceChildren(el);
  await decorate(el);
  return el;
};

test('with link-rows: a one-link row is a link line, in place, the rest items', async () => {
  const el = await build('faq exclusive link-rows');
  const kids = [...el.children].map((c) => `${c.tagName.toLowerCase()}.${c.className}`);
  assert.deepEqual(kids, [
    'details.accordion-columns-item',
    'div.accordion-columns-item accordion-columns-link',
    'div.accordion-columns-item accordion-columns-link',
    'details.accordion-columns-item',
  ]);
  const links = [...el.querySelectorAll('.accordion-columns-link > a.accordion-columns-title')].map((a) => `${a.textContent}|${a.getAttribute('href')}`);
  assert.deepEqual(links, ['Global Partner|/partner?aid=global-partners-anchor', 'Premium Partner|/partner?aid=premium-partners-anchor']);
  assert.equal(el.querySelectorAll('details').length, 2, 'a row of a link and more text stays an item');
});

test('without the option: every row an item, as before', async () => {
  const el = await build('faq exclusive');
  assert.equal(el.querySelectorAll(':scope > details.accordion-columns-item').length, 4);
  assert.equal(el.querySelectorAll('.accordion-columns-link').length, 0);
});

test('the partnerships row: the option and three one-link rows, READY with its figures', () => {
  const [row] = JSON.parse(read(`${R}/delta-so45-cargo-partnerships-links.json`));
  assert.equal(row.path, '/en/ci/partnerships-subsidiaries');
  assert.equal(row.inserts.length, 2);
  assert.match(row.inserts[0].text, /<div class="accordion-columns faq exclusive link-rows">$/);
  assert.equal((row.inserts[1].text.match(/<div><div><a href="[^"]+">[A-Za-z]+ Partner<\/a><\/div><\/div>/g) || []).length, 3);
  const doc = `<main><div><h2>x</h2>${row.inserts[0].replace}<div><div>The program</div><div><p>More</p>${row.inserts[1].replace}</div></div></main>`;
  const once = applyTextInserts(doc, row.inserts);
  assert.deepEqual(once.results, ['inserted', 'inserted']);
  assert.deepEqual(applyTextInserts(once.html, row.inserts).results, ['present', 'present']);
  const txt = read(`${R}/delta-so45-cargo-partnerships-links.txt`);
  assert.deepEqual([...new Set(listPaths(txt))], ['/en/ci/partnerships-subsidiaries']);
  assert.match(txt, /^READY\t\/en\/ci\/partnerships-subsidiaries\t390\t.*\t2767 \(-0\.50 %\)\t/m);
  assert.match(txt, /^READY\t\/en\/ci\/partnerships-subsidiaries\t1440\t.*\t4707 \(-0\.11 %\)\t/m);
});

test('the capture gate: ten page-widths, each with its status', () => {
  const rows = read(`${R}/gate-so45-cargo-007-airdolomiti-011.txt`).split('\n').filter((l) => /^[A-Z]+\t(cargo|airdolomiti)\t/.test(l));
  assert.equal(rows.length, 10);
  assert.ok(rows.every((l) => ['PASS', 'READY', 'HOLD', 'OUTSIDE', 'OWNER'].includes(l.split('\t')[0])));
  assert.ok(rows.some((l) => /^READY\tcargo\t\/en\/ci\/partnerships-subsidiaries\t390\t/.test(l)));
});
