/* eslint-disable max-len, import/no-extraneous-dependencies, import/extensions -- dev tooling; linkedom is a dev dependency */
/* Standing order 70 item 1: lufthansa.com's kept documents. A section whose own headings of one level ask for different
   sizes is split where that level's wish changes, so each part's level-scoped section style draws its headings as the
   marked page did (tips-senior-travellers, the three impairment pages, first-class; 49 documents gated at 1440 and 390).
   Headings back to back (nothing between them) stay together, as before.
   Before, one style per level and section drew them all in the majority's size, or none in the minority's.
   Run: node --test test/collapse-heading-runs-so70.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';
import { collapseHtml } from '../tools/importer/marker-collapse.mjs';

const FLOW = '<div><div class="metadata"><div><div>Theme</div><div>flow-spacing</div></div></div></div>';
const run = (html, brand = 'lufthansa') => collapseHtml(html, {
  path: '/xx/es/x', brand, parse: parseHTML, force: true,
}).html;
// each section: its first own heading's text and its Style row ("A [h2-small]")
const outline = (html) => {
  const { document } = parseHTML(`<html><body><main>${html}</main></body></html>`);
  return [...document.querySelectorAll('main > div')].filter((s) => !s.querySelector(':scope > .metadata')).map((s) => {
    const h = s.querySelector(':scope > h2, :scope > h3, :scope > h4');
    const row = [...s.querySelectorAll(':scope > .section-metadata > div')].find((r) => /^style$/i.test(r.children[0].textContent.trim()));
    return `${h ? h.textContent.trim() : '-'} [${row ? row.children[1].textContent.trim() : ''}]`;
  });
};

test('an H2 heading-small, then an H2 that asks nothing: two parts, the first h2-small (tips-senior-travellers)', () => {
  const html = run(`<div><h2>More information {heading-small}</h2><div class="carousel-cards grid"><div><div><h3>Card</h3></div></div></div><p>{divider-25}</p><h2>More offers</h2><div class="carousel-cards grid two-up"><div><div><h4>Card</h4></div></div></div></div>${FLOW}`);
  const o = outline(html);
  assert.equal(o.length, 2, JSON.stringify(o));
  assert.ok(/^More information \[.*h2-small/.test(o[0]), JSON.stringify(o));
  assert.ok(/^More offers/.test(o[1]) && !/h2-/.test(o[1]), JSON.stringify(o));
  assert.ok(!/heading-small|\{/.test(html), html);
});

test('unmarked H3, H3 heading-small, unmarked H3: three parts, the middle h3-large (the impairment pages)', () => {
  const html = run(`<div><h2>Questions?</h2><h3>Our medical service</h3><p>Text</p><h3>Legal {heading-small}</h3><p>Text</p><h3>How it works {heading-small}</h3><p>Text</p><h3>Download links</h3><p>Text</p></div>${FLOW}`);
  const o = outline(html);
  assert.equal(o.length, 3, JSON.stringify(o));
  assert.ok(!/h3-/.test(o[0]) && /^Legal \[.*h3-large/.test(o[1]) && /^Download links/.test(o[2]) && !/h3-/.test(o[2]), JSON.stringify(o));
});

test('H2s heading-small, then an H2 heading-large: the last part h2-large (first-class)', () => {
  const html = run(`<div><h2>North America {heading-small}</h2><p>Routes</p><h2>Asia {heading-small}</h2><p>Routes</p><h2>Africa {heading-small}</h2><p>Routes</p><h2>The fleet {heading-large limited-width}</h2><h4>Flying {limited-width}</h4><p>Text</p></div>${FLOW}`);
  const o = outline(html);
  assert.equal(o.length, 2, JSON.stringify(o));
  assert.ok(/^North America \[.*h2-small/.test(o[0]), JSON.stringify(o));
  assert.ok(/^The fleet \[.*h2-large/.test(o[1]) && /limited-headings/.test(o[1]), JSON.stringify(o));
});

test('headings that all ask the same, headings back to back, and other brands: no split', () => {
  // bare headings in a row stay one section: the majority's style, a minority the default (marker-collapse.test.mjs)
  const bare = outline(run(`<div><h2>A {heading-copytext-large}</h2><h2>B {heading-copytext-large}</h2><h2>C</h2></div>${FLOW}`));
  assert.equal(bare.length, 1, JSON.stringify(bare));
  const same = outline(run(`<div><h2>A {heading-small}</h2><p>x</p><h2>B {heading-small}</h2><p>y</p></div>${FLOW}`));
  assert.equal(same.length, 1, JSON.stringify(same));
  const austrian = outline(run(`<div><h2>A {heading-small}</h2><p>x</p><h2>B</h2><p>y</p></div>${FLOW}`, 'austrian'));
  assert.equal(austrian.length, 1, JSON.stringify(austrian));
});
