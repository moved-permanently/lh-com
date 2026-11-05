/* eslint-disable max-len */
/* accordion-columns option open-first (brief 394, www.discover-airlines.com's /book/special-requests/families:
   the first maui-collapsible-item expanded): the first item starts open, the others closed. Brand-neutral;
   without the option, and with tabs (whose first tab is selected anyway), nothing changes.
   Run: node --max-old-space-size=256 --test test/accordion-columns-open-first.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
window.location = {
  hostname: 'discover.turnsthe.page', pathname: '/de/en/book/special-requests/families', search: '', href: 'https://discover.turnsthe.page/de/en/book/special-requests/families', origin: 'https://discover.turnsthe.page',
};
Object.defineProperty(window, 'origin', { value: 'https://discover.turnsthe.page', configurable: true });
globalThis.window = window;
globalThis.document = document;
const { openFirst } = await import('../blocks/accordion-columns/accordion-columns.js');

const accordion = (classes, n) => {
  const block = document.createElement('div');
  block.className = `accordion-columns ${classes}`;
  const items = Array.from({ length: n }, (_, i) => {
    const d = document.createElement('details');
    d.className = 'accordion-columns-item';
    d.innerHTML = `<summary class="accordion-columns-title">Item ${i + 1}</summary><div class="accordion-columns-panel"><p>Panel ${i + 1}</p></div>`;
    block.append(d);
    return d;
  });
  return { block, items };
};
const opened = (items) => items.map((d) => (d.hasAttribute('open') ? 'open' : '-')).join(' ');

test('open-first: the first item open, the others closed', () => {
  const { block, items } = accordion('faq open-first', 3);
  assert.equal(openFirst(block, items), true);
  assert.equal(opened(items), 'open - -');
});

test('without the option, or with tabs, the items stay as they are', () => {
  const plain = accordion('faq', 3);
  assert.equal(openFirst(plain.block, plain.items), false);
  assert.equal(opened(plain.items), '- - -');
  const tabs = accordion('faq tabs open-first', 2);
  assert.equal(openFirst(tabs.block, tabs.items), false);
  assert.equal(opened(tabs.items), '- -');
});
