/* eslint-disable max-len */
/* accordion-columns option tabs (blocks/accordion-columns/accordion-columns.js buildTabs): the
   accordion's items as they are; from 1025px a tab bar (WAI-ARIA tabs) shows one panel at a
   time, below it the accordion. Without the option nothing changes. Run: node --test test/*.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
window.location = {
  hostname: 'cargo.turnsthe.page', pathname: '/en/speed-flash', search: '', href: 'https://cargo.turnsthe.page/en/speed-flash', origin: 'https://cargo.turnsthe.page',
};
Object.defineProperty(window, 'origin', { value: 'https://cargo.turnsthe.page', configurable: true });
globalThis.window = window;
globalThis.document = document;
const { buildTabs, TABS_MEDIA } = await import('../blocks/accordion-columns/accordion-columns.js');

/** A media query whose state the test sets. */
const media = (matches) => {
  const listeners = [];
  return {
    matches,
    addEventListener: (t, fn) => listeners.push(fn),
    set(v) { this.matches = v; listeners.forEach((fn) => fn()); },
  };
};
/** A decorated accordion: details.accordion-columns-item with summary and panel. */
const accordion = (classes, titles) => {
  const block = document.createElement('div');
  block.className = `accordion-columns ${classes}`;
  const items = titles.map((t, i) => {
    const d = document.createElement('details');
    d.className = 'accordion-columns-item';
    d.innerHTML = `<summary class="accordion-columns-title">${t}</summary><div class="accordion-columns-panel"><p>Panel ${i + 1}</p></div>`;
    block.append(d);
    return d;
  });
  document.body.append(block);
  return { block, items };
};
const state = (block) => [...block.querySelectorAll('.accordion-columns-tab')].map((t) => `${t.textContent}:${t.getAttribute('aria-selected')}:${t.getAttribute('tabindex')}`);

test('the tab bar from 1025px: one tab per item, the first selected, panels labelled by their tabs', () => {
  assert.equal(TABS_MEDIA, '(width >= 1025px)');
  const { block, items } = accordion('faq tabs', ['Benefits', 'Conditions', 'Booking']);
  const m = media(true);
  buildTabs(block, items, m);
  const bar = block.firstElementChild;
  assert.equal(bar.getAttribute('role'), 'tablist');
  assert.ok(block.classList.contains('is-tabbed'));
  assert.deepEqual(state(block), ['Benefits:true:0', 'Conditions:false:-1', 'Booking:false:-1']);
  const tabs = [...bar.children];
  items.forEach((item, i) => {
    const panel = item.querySelector('.accordion-columns-panel');
    assert.equal(panel.getAttribute('role'), 'tabpanel');
    assert.equal(tabs[i].getAttribute('aria-controls'), panel.id);
    assert.equal(panel.getAttribute('aria-labelledby'), tabs[i].id);
    assert.equal(item.hasAttribute('open'), true, 'all items open: the CSS shows the selected one');
    assert.equal(panel.getAttribute('aria-hidden'), String(i !== 0));
  });
  assert.ok(items[0].classList.contains('is-selected'));
  tabs[2].dispatchEvent(new window.Event('click'));
  assert.deepEqual(state(block), ['Benefits:false:-1', 'Conditions:false:-1', 'Booking:true:0']);
  assert.ok(items[2].classList.contains('is-selected') && !items[0].classList.contains('is-selected'));
});

test('keyboard: arrows, Home and End move and select (wrapping), other keys do nothing', () => {
  const { block, items } = accordion('tabs', ['A', 'B', 'C']);
  buildTabs(block, items, media(true));
  const bar = block.firstElementChild;
  const key = (k) => {
    const e = new window.Event('keydown');
    e.key = k;
    bar.dispatchEvent(e);
  };
  key('ArrowRight');
  assert.deepEqual(state(block)[1], 'B:true:0');
  key('ArrowLeft');
  key('ArrowLeft');
  assert.deepEqual(state(block)[2], 'C:true:0', 'wraps to the last');
  key('Home');
  assert.deepEqual(state(block)[0], 'A:true:0');
  key('End');
  assert.deepEqual(state(block)[2], 'C:true:0');
  key('Enter');
  assert.deepEqual(state(block)[2], 'C:true:0');
});

test('below 1025px the accordion as it is; switching back keeps the selected item open', () => {
  const { block, items } = accordion('faq tabs', ['One', 'Two']);
  const m = media(false);
  buildTabs(block, items, m);
  assert.ok(!block.classList.contains('is-tabbed'));
  items.forEach((item) => {
    const panel = item.querySelector('.accordion-columns-panel');
    assert.equal(panel.getAttribute('role'), null);
    assert.equal(panel.getAttribute('aria-hidden'), null);
    assert.equal(item.hasAttribute('open'), false, 'the accordion starts closed, as today');
  });
  m.set(true);
  assert.ok(block.classList.contains('is-tabbed'));
  block.querySelectorAll('.accordion-columns-tab')[1].dispatchEvent(new window.Event('click'));
  m.set(false);
  assert.ok(!block.classList.contains('is-tabbed'));
  assert.deepEqual(items.map((i) => i.hasAttribute('open')), [false, true]);
  assert.equal(items[1].querySelector('.accordion-columns-panel').getAttribute('role'), null);
});

test('one item: no tab bar', () => {
  const { block, items } = accordion('tabs', ['Only']);
  assert.equal(buildTabs(block, items, media(true)), null);
  assert.equal(block.querySelector('.accordion-columns-tablist'), null);
});

test('the option is opt-in: decorate adds the bar for tabs only (the source of decorate)', async () => {
  const fs = await import('node:fs');
  const src = fs.readFileSync(new URL('../blocks/accordion-columns/accordion-columns.js', import.meta.url), 'utf8');
  assert.match(src, /if \(block\.classList\.contains\('tabs'\)\) buildTabs\(block, items\);/);
  const css = fs.readFileSync(new URL('../blocks/accordion-columns/accordion-columns.css', import.meta.url), 'utf8');
  const tabRules = css.slice(css.indexOf('option tabs'));
  assert.ok(tabRules.split('\n').filter((l) => /^\s*[.a-z][^{]*\{\s*$/.test(l)).every((l) => l.includes('.accordion-columns.tabs')), 'every rule of the option scoped to .accordion-columns.tabs');
});
