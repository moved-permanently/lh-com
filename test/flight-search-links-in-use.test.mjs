/* eslint-disable max-len */
/* The flight search's "Where we fly" row shows while the search is in use (blocks/flight-search,
   class flight-search-in-use): at once when the focus comes by keyboard, after the click when it
   comes with a press (mouse, touch). On a band page (the local promotion pages) the card sits at
   the band's bottom and grows upwards, so the row appearing between press and release moved the
   pressed control 34px up at 1440 and its first click was lost (the traveller line did not open
   the panel). Without the Where we fly row nothing changes.
   Run: node --max-old-space-size=512 --test test/flight-search-links-in-use.test.mjs */
/* global globalThis */
import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
window.location = {
  hostname: 'main--lh-com--moved-permanently.aem.page', pathname: '/gb/en/local-page/ski-campaign-2026', search: '', hash: '', href: 'https://main--lh-com--moved-permanently.aem.page/gb/en/local-page/ski-campaign-2026', origin: 'https://main--lh-com--moved-permanently.aem.page',
};
window.matchMedia = () => ({ matches: false, addEventListener: () => {}, addListener: () => {} });
globalThis.window = window;
globalThis.document = document;
globalThis.Event = window.Event;
beforeEach(() => {
  globalThis.fetch = async () => new Response('{}', { status: 404, headers: { 'content-type': 'application/json' } });
});

const { default: decorate } = await import('../blocks/flight-search/flight-search.js');

const tick = () => new Promise((r) => { setTimeout(r, 5); });
const flush = () => Array.from({ length: 20 }).reduce((p) => p.then(() => new Promise((r) => { setImmediate(r); })), Promise.resolve());
const blockOf = (rows) => {
  const block = document.createElement('div');
  block.className = 'flight-search standalone';
  [['Passenger picker', 'yes'], ...rows].forEach(([k, v]) => {
    const row = document.createElement('div');
    row.innerHTML = `<div>${k}</div><div>${v}</div>`;
    block.append(row);
  });
  document.body.replaceChildren(block, document.createElement('footer'));
  return block;
};
const WHERE = ['Where we fly', '<a href="https://www.lufthansa.com/xx/en/flights">Explore our destinations.</a>'];
const fire = (target, type, init = {}) => {
  const e = new window.Event(type, { bubbles: true, ...init });
  Object.entries(init).forEach(([k, v]) => { if (!['bubbles'].includes(k)) Object.defineProperty(e, k, { value: v }); });
  target.dispatchEvent(e);
};
const inUse = (block) => block.classList.contains('flight-search-in-use');

test('by keyboard: the row shows when the focus comes in, hides when it leaves the block', async () => {
  const block = blockOf([WHERE]);
  decorate(block);
  await flush();
  assert.ok(block.querySelector('.flight-search-links'));
  assert.ok(block.classList.contains('flight-search-deferred-links'));
  const line = block.querySelector('.flight-search-travellers');
  fire(line, 'focusin');
  assert.equal(inUse(block), true);
  // to another control of the search: still in use
  fire(line, 'focusout', { relatedTarget: block.querySelector('input') });
  assert.equal(inUse(block), true);
  // out of the search
  fire(line, 'focusout', { relatedTarget: document.querySelector('footer') });
  assert.equal(inUse(block), false);
  fire(line, 'focusin');
  fire(line, 'focusout', { relatedTarget: null });
  assert.equal(inUse(block), false);
});

test('with a press: the row shows after the release\'s click, not before', async () => {
  const block = blockOf([WHERE]);
  decorate(block);
  await flush();
  const line = block.querySelector('.flight-search-travellers');
  fire(line, 'pointerdown');
  fire(line, 'focusin');
  assert.equal(inUse(block), false, 'not between press and release');
  fire(line, 'pointerup');
  assert.equal(inUse(block), false, 'not before the click');
  fire(line, 'click');
  await tick();
  assert.equal(inUse(block), true, 'after the click');
});

test('a press that leaves the focus outside, or a cancelled one: the row stays hidden', async () => {
  const block = blockOf([WHERE]);
  decorate(block);
  await flush();
  const line = block.querySelector('.flight-search-travellers');
  fire(block, 'pointerdown');
  fire(block, 'pointerup');
  await tick();
  assert.equal(inUse(block), false);
  fire(line, 'pointerdown');
  fire(line, 'focusin');
  fire(line, 'pointercancel');
  await tick();
  assert.equal(inUse(block), true, 'the focus is in: shown once the press is over');
  // the next keyboard focus is not taken for a press
  fire(line, 'focusout', { relatedTarget: null });
  fire(line, 'focusin');
  assert.equal(inUse(block), true);
});

test('without the Where we fly row: no class, as before', async () => {
  const block = blockOf([]);
  decorate(block);
  await flush();
  assert.equal(block.querySelector('.flight-search-links'), null);
  assert.equal(block.classList.contains('flight-search-deferred-links'), false);
  fire(block.querySelector('.flight-search-travellers'), 'focusin');
  assert.equal(inUse(block), false);
});

test('the styles: the row by the class where the block sets it, by :focus-within where it does not', () => {
  const css = fs.readFileSync(new URL('../blocks/flight-search/flight-search.css', import.meta.url), 'utf8').replace(/\s+/g, ' ');
  assert.ok(css.includes('.flight-search.flight-search-in-use .flight-search-links, .flight-search:not(.flight-search-deferred-links):focus-within .flight-search-links'));
  assert.ok(!/\.flight-search:focus-within \.flight-search-links/.test(css));
});
