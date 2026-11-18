/* eslint-disable max-len, import/no-extraneous-dependencies, import/extensions -- dev tooling; linkedom is a dev dependency */
/* Standing order 56 of 2026-11-18: a section the collapse splits (column marks, chapters, a column view) keeps its
   market: lufthansa.com's /de/en/cash-and-miles has a "de" and a "-de" version of its booking section (one renders per
   market); the parts split off at {column-start} lost data-markets and showed on every market, the Flight Search twice.
   Run: node --max-old-space-size=256 --test test/collapse-split-markets-so56.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';
import { collapseHtml } from '../tools/importer/marker-collapse.mjs';

const run = (html) => collapseHtml(html, { path: '/de/en/cash-and-miles', brand: 'lufthansa', parse: parseHTML, force: true }).html;
const sections = (html) => {
  const { document } = parseHTML(`<html><body><main>${html}</main></body></html>`);
  return [...document.querySelector('main').children];
};

test('the parts of a market section keep data-markets', () => {
  const html = '<div data-markets="de"><h1>T</h1><p>a</p></div>'
    + '<div data-markets="-de"><h1>T</h1><p>a</p><p>{column-start}</p><h2>Book</h2><p>b</p><p>{column-end}</p><h2>More</h2><p>c</p></div>'
    + '<div><p>everyone</p></div>';
  const out = sections(run(html));
  const texts = out.map((s) => [s.getAttribute('data-markets'), s.textContent.replace(/\s+/g, ' ').trim().slice(0, 12)]);
  assert.ok(out.length > 3, `split: ${JSON.stringify(texts)}`);
  out.slice(1, -1).forEach((s) => assert.equal(s.getAttribute('data-markets'), '-de', JSON.stringify(texts)));
  assert.equal(out[0].getAttribute('data-markets'), 'de');
  assert.equal(out[out.length - 1].hasAttribute('data-markets'), false, 'a section for every market stays so');
});

test('a section without a market splits without one', () => {
  const out = sections(run('<div><h1>T</h1><p>a</p><p>{column-start}</p><h2>Book</h2><p>b</p><p>{column-end}</p><h2>More</h2><p>c</p></div>'));
  assert.ok(out.length > 1);
  out.forEach((s) => assert.equal(s.hasAttribute('data-markets'), false));
});
