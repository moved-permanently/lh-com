/* eslint-disable max-len, import/extensions */
/* ITA row 38 (standing order 7 of 2026-11-12, item 1: fleet/long-haul through ita-tabs-apply.mjs, DA's copy as it is):
   DA keeps the A350's and the A330neo's specification tables (two market variants each) and their seat map in sections of
   their own, so ITA row 34's two columns (a section's table and the picture paragraph after it, 20 px apart from 768 px, as
   www's col-md-6) did not reach them: at 1440 the map 1200 x 2000 under the table, the page 5337 px against www's 3526.
   On ITA, scripts/section-tabs.js puts a panel part that is only a picture paragraph into the panel section before it when
   that one is only a table (the same Tab; the part without a style of its own), before the tab list is built; elsewhere,
   and for other parts, nothing changes.
   Run: node --max-old-space-size=512 --test test/ita-tab-seat-maps-590.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html><head><meta name="brand" content="ita"></head><body></body></html>');
window.hlx = { codeBasePath: '' };
window.matchMedia = (q) => ({
  get matches() { return /width >= 768px/.test(q); }, addEventListener: () => {}, addListener: () => {}, removeEventListener: () => {},
});
window.location = {
  hostname: 'main--lh-ita--moved-permanently.aem.page', pathname: '/it/en/world-of-ita-airways/discover-ita-airways/fleet/long-haul', search: '', hash: '', href: 'https://main--lh-ita--moved-permanently.aem.page/it/en/world-of-ita-airways/discover-ita-airways/fleet/long-haul', origin: 'https://main--lh-ita--moved-permanently.aem.page', toString() { return this.href; },
};
Object.defineProperty(window, 'origin', { value: 'https://main--lh-ita--moved-permanently.aem.page', configurable: true });
globalThis.window = window;
globalThis.document = document;
globalThis.Node = window.Node;
globalThis.KeyboardEvent = window.KeyboardEvent || window.Event;

const { default: decorateSectionTabs } = await import('../scripts/section-tabs.js');

const text = (body, tab, cls = '') => `<div class="section${cls ? ` ${cls}` : ''}" data-tab="${tab}"><div class="default-content-wrapper">${body}</div></div>`;
const table = (tab) => `<div class="section table-striped-container" data-tab="${tab}"><div class="table-striped-wrapper"><div class="table-striped block"><table></table></div></div></div>`;
const map = (tab, cls = '') => text('<p><picture><img src="a350.jpg" alt="Seat map"></picture></p>', tab, cls);
const page = (html, brand = 'ita') => {
  document.head.querySelector('meta[name="brand"]').setAttribute('content', brand);
  const main = document.createElement('main');
  main.innerHTML = `<div class="section"><div class="default-content-wrapper"><h1>Long-Haul Fleet</h1></div></div>${html}<div class="section"><div class="default-content-wrapper"><p>After</p></div></div>`;
  document.body.replaceChildren(main);
  decorateSectionTabs(main);
  return main;
};
const A = 'Airbus A350-900';
const B = 'Airbus A330 Neo';

test('ITA: a panel\'s seat map part joins the table section before it', () => {
  const main = page(`${text('<p>Our Airbus A350-900</p><h2>Specifications</h2>', A)}${table(A)}${map(A)}${text('<p>The A330-900neo</p>', B)}${table(B)}${map(B)}`);
  const joined = [...main.querySelectorAll(':scope > .section.table-striped-container')];
  assert.equal(joined.length, 2);
  joined.forEach((s) => {
    assert.deepEqual([...s.children].filter((c) => !c.classList.contains('section-tab-toggle')).map((c) => c.className), ['table-striped-wrapper', 'default-content-wrapper']);
    assert.ok(s.querySelector(':scope > .default-content-wrapper > p:only-child > picture'));
  });
  assert.equal(main.querySelectorAll('picture').length, 2, 'no picture lost');
  // the tabs control only sections that are there
  main.querySelectorAll('[role="tab"]').forEach((tab) => String(tab.getAttribute('aria-controls')).split(' ').forEach((id) => assert.ok(document.getElementById(id), id)));
});

test('not across panels, not a part with a style of its own, not two pictures', () => {
  let main = page(`${text('<p>x</p>', A)}${table(A)}${map(B)}`);
  assert.equal(main.querySelector('.table-striped-container').children.length, 1, 'the next panel\'s picture stays');
  main = page(`${text('<p>x</p>', A)}${table(A)}${map(A, 'grey')}`);
  assert.equal(main.querySelector('.table-striped-container').querySelectorAll('picture').length, 0, 'a grey part stays');
  main = page(`${text('<p>x</p>', A)}${table(A)}${text('<p><picture><img src="a.jpg" alt=""></picture></p><p><picture><img src="b.jpg" alt=""></picture></p>', A)}`);
  assert.equal(main.querySelector('.table-striped-container').querySelectorAll('picture').length, 0, 'two pictures stay');
});

test('other brands: as before', () => {
  const main = page(`${text('<p>x</p>', A)}${table(A)}${map(A)}`, 'swiss');
  assert.equal(main.querySelector('.table-striped-container').querySelectorAll('picture').length, 0);
});
