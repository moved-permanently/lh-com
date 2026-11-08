/* eslint-disable max-len, import/no-extraneous-dependencies, import/extensions -- dev tooling; linkedom is a dev dependency */
/* The brief after 503, items 2 and 3: theme rules from the pass checks (tools/reports/token-free/<site>-pass-check.md) and
   for fewer carriers, all of Ben's kind (a brand's or page type's default by what most of www's pages draw):
   - the level's heading size per brand and page type (Austrian, Brussels, B2B flow H3s; SWISS, Discover flow H2s:
     heading-small), weighed by the collapse against the page type the site will see (a page with column marks becomes a
     flow page);
   - a brand's blocks that are column views of their own on flow pages (Discover: Columns Media; B2B: Columns Media,
     Carousel Images, Quote, also at a section's end): the column view's edges as the markers drew them;
   - lufthansa.com's Insights tag pages: the rule above an info box, as on articles;
   - SWISS's FAQ hub: the heading before its topic teasers starts their group once the theme is live (the grid's key).
   Run: node --max-old-space-size=512 --test test/token-free-theme-504.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';
import { THEMES, themeFor, pageTypeOf } from '../scripts/style-markers.js';
import { collapseHtml } from '../tools/importer/marker-collapse.mjs';

const read = (f) => fs.readFileSync(new URL(f, import.meta.url), 'utf8');
const page = (mainHtml) => {
  const { document } = parseHTML(`<html><head></head><body><main>${mainHtml}</main></body></html>`);
  globalThis.document = document;
  return document.querySelector('main');
};
const { default: decorateTokenFree } = await import('../scripts/token-free.js');
const live = (brand, fn) => {
  const key = brand || 'lufthansa';
  const had = THEMES[key];
  THEMES[key] = { ...(had || {}), live: true };
  try { fn(); } finally { if (had) THEMES[key] = had; else delete THEMES[key]; }
};
const flowRead = (k) => (k === 'theme' ? 'flow-spacing' : '');
const BLOCK = (name) => `<div class="${name}"><div><div>x</div></div></div>`;
// the section's children as a short sequence: tag or block name, column marks as start / end
const seq = (main) => [...main.querySelector(':scope > div').children].map((el) => {
  if (el.classList.contains('column-mark')) return el.classList.contains('column-start-outer') ? 'start' : 'end';
  return el.tagName === 'DIV' ? el.className.split(' ')[0] : el.tagName.toLowerCase();
}).join(' ');

test('the brands\' heading defaults per page type; the Insights tag pages\' type', () => {
  assert.equal(themeFor('austrian', 'flow').headings.h3, 'heading-small');
  assert.equal(themeFor('austrian', 'service').headings.h3, 'heading-copytext-large');
  assert.equal(themeFor('brussels', 'flow').headings.h3, 'heading-small');
  assert.equal(themeFor('brussels', 'service').headings.h2, 'heading-medium', 'as www: most service H2s unmarked');
  assert.equal(themeFor('brussels', 'flow').headings.h2, 'heading-medium');
  assert.equal(themeFor('swiss', 'flow').headings.h2, 'heading-small');
  assert.equal(themeFor('discover', 'flow').headings.h2, 'heading-small');
  assert.equal(themeFor('b2b', 'flow').headings.h3, 'heading-small');
  assert.equal(themeFor('ita', 'flow').headings.h2, 'heading-medium', 'ITA as checked');
  assert.deepEqual(themeFor('discover', 'flow').columnViews.blocks, ['columns-media']);
  assert.equal(themeFor('discover', 'service').columnViews.blocks, undefined);
  assert.equal(themeFor('b2b', 'flow').columnViews.endEdge, true);
  assert.equal(pageTypeOf({ path: '/de/en/articles/tags/frankfurt' }), 'insights-tag');
  assert.equal(pageTypeOf({ path: '/de/en/articles/frankfurt-tips', articleHeader: true }), 'article');
  assert.deepEqual(themeFor('lufthansa', 'insights-tag').rules, ['rule-before-info-box']);
  ['austrian', 'brussels', 'swiss', 'discover', 'b2b', 'lufthansa'].forEach((b) => assert.equal(themeFor(b, 'flow').live, false, b));
});

test('the site: a brand\'s column-view blocks on a live flow page get the column view\'s edges', () => {
  const doc = `<div><h1>T</h1><p>Text</p>${BLOCK('columns-media')}<p>More</p><h2>H</h2>${BLOCK('columns-media')}${BLOCK('accordion-columns')}${BLOCK('columns-media')}</div>`;
  live('discover', () => {
    const main = page(doc);
    decorateTokenFree(main, { brand: 'discover', path: '/de/en/x', read: flowRead });
    // after text or a heading: both edges; at the section's end: none below (its padding); other blocks untouched
    assert.equal(seq(main), 'h1 p start columns-media end p h2 start columns-media end accordion-columns start columns-media');
    const first = page(`<div>${BLOCK('columns-media')}<p>Text</p></div>`);
    decorateTokenFree(first, { brand: 'discover', path: '/de/en/x', read: flowRead });
    assert.equal(seq(first), 'columns-media end p', 'at the section\'s start: none above');
    const service = page(doc);
    decorateTokenFree(service, { brand: 'discover', path: '/de/en/x' });
    assert.ok(!service.querySelector('.column-mark'), 'not on a service page');
    const tab = page(doc.replace('<div>', '<div data-tab="One">'));
    decorateTokenFree(tab, { brand: 'discover', path: '/de/en/x', read: flowRead });
    assert.ok(!tab.querySelector('.column-mark'), 'not in a tab panel');
  });
  live('b2b', () => {
    const main = page(`<div><p>Text</p>${BLOCK('columns-media')}</div>`);
    decorateTokenFree(main, { brand: 'b2b', path: '/de/en/x', read: flowRead });
    assert.equal(seq(main), 'p start columns-media end', 'B2B: the edge below at the section\'s end too');
  });
  const off = page(`<div><p>Text</p>${BLOCK('columns-media')}</div>`);
  decorateTokenFree(off, { brand: 'discover', path: '/de/en/x', read: flowRead });
  assert.ok(!off.querySelector('.column-mark'), 'a theme that is off: nothing');
});

test('the collapse weighs headings against the page type the site will see (column marks: a flow page)', () => {
  const META = '<div class="metadata"><div><div>Template</div><div>info</div></div></div>';
  const marked = `<div><h2 id="a">A</h2><p>{column-start}</p><h3 id="x-heading-medium">X {heading-medium}</h3><p>T</p><p>{column-end}</p>${META}</div>`;
  const flow = collapseHtml(marked, {
    path: '/at/en/x', brand: 'austrian', parse: parseHTML, force: true,
  }).html;
  assert.ok(!/h3-large/.test(flow) && /flow-spacing/.test(flow) && !/\{/.test(flow), flow);
  const plain = `<div><h2 id="a">A</h2><h3 id="x-heading-medium">X {heading-medium}</h3><p>T</p>${META}</div>`;
  const service = collapseHtml(plain, {
    path: '/at/en/x', brand: 'austrian', parse: parseHTML, force: true,
  }).html;
  assert.match(service, /h3-large/, 'a service page: two steps from its H3 default, the section style');
});

test('lufthansa.com\'s Insights tag pages: the info box\'s rule is the theme\'s', () => {
  const doc = `<div>${BLOCK('blog-overview')}<p>{divider-25}</p>${BLOCK('columns-media')}</div>`;
  const tag = collapseHtml(doc, {
    path: '/de/en/articles/tags/frankfurt', brand: 'lufthansa', parse: parseHTML, force: true,
  }).html;
  assert.ok(!/divider/.test(tag), tag);
  const other = collapseHtml(doc, {
    path: '/de/en/frankfurt', brand: 'lufthansa', parse: parseHTML, force: true,
  }).html;
  assert.match(other, /columns-media divider-above/);
  live('', () => {
    const main = page(`<div>${BLOCK('blog-overview')}${BLOCK('columns-media')}</div>`);
    decorateTokenFree(main, { brand: '', path: '/de/en/articles/tags/frankfurt' });
    assert.ok(main.querySelector('.columns-media').previousElementSibling.matches('p.spacer.divider'));
  });
});

test('SWISS\'s FAQ hub: on a live theme the heading before a run of topic teasers starts their group, as its marker did', () => {
  const TEASER = (t) => `<h3><a href="/x"><picture><img src="/icons/i.svg" alt=""></picture>${t}</a></h3>`;
  const doc = `<div><h1>FAQ</h1><h2>Book</h2>${TEASER('One')}${TEASER('Two')}<h2>Prepare</h2>${TEASER('Three')}<p>Text</p></div>`;
  live('swiss', () => {
    const main = page(doc);
    decorateTokenFree(main, { brand: 'swiss', path: '/ch/en/customer-support/faq', read: flowRead });
    assert.deepEqual([...main.querySelectorAll('.column-start')].map((h) => h.textContent), ['Book', 'Prepare']);
    // the styles.css and swiss.css grid rules key on it
    assert.match(read('../styles/styles.css'), /body\.brand-swiss main \.default-content-wrapper:has\(> \.column-start\):has\(> :is\(h2, h3, h4\) > a > picture:first-child\) \{\s*display: grid;/);
  });
  const off = page(doc);
  decorateTokenFree(off, { brand: 'swiss', path: '/ch/en/customer-support/faq', read: flowRead });
  assert.equal(off.querySelectorAll('.column-start').length, 0, 'off: the markers do it');
});
