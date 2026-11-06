/* eslint-disable max-len */
/* accordion-columns option exclusive (Cargo parity round 3, www.lufthansa-cargo.com's image lists
   on Facts & Figures: one item's text at a time): the items share a details name (the browser
   closes the others when one opens), and opening one closes the others where name is not
   supported. Brand-neutral; without the option, and with tabs, nothing changes.
   Run: node --max-old-space-size=256 --test test/accordion-columns-exclusive.test.mjs */
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
const { exclusive } = await import('../blocks/accordion-columns/accordion-columns.js');

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

test('exclusive: one name for the block\'s items, another block another name', () => {
  const a = accordion('faq exclusive', 3);
  const b = accordion('faq exclusive', 2);
  assert.equal(exclusive(a.block, a.items), true);
  assert.equal(exclusive(b.block, b.items), true);
  const names = a.items.map((d) => d.getAttribute('name'));
  assert.ok(names[0] && names.every((n) => n === names[0]), names.join());
  assert.notEqual(b.items[0].getAttribute('name'), names[0]);
});

test('exclusive: opening an item closes the open one (where name does not)', () => {
  const { block, items } = accordion('faq exclusive', 3);
  exclusive(block, items);
  items[0].setAttribute('open', '');
  items[0].dispatchEvent(new window.Event('toggle'));
  items[2].setAttribute('open', '');
  items[2].dispatchEvent(new window.Event('toggle'));
  assert.equal(opened(items), '- - open');
});

test('without the option, or with tabs, no name', () => {
  const plain = accordion('faq', 2);
  assert.equal(exclusive(plain.block, plain.items), false);
  assert.ok(!plain.items[0].hasAttribute('name'));
  const tabs = accordion('faq tabs exclusive', 2);
  assert.equal(exclusive(tabs.block, tabs.items), false);
  assert.ok(!tabs.items[0].hasAttribute('name'));
});
