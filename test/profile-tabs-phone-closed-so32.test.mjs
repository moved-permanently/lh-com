/* eslint-disable max-len, import/extensions -- dev tooling */
/* ITA (ema-lufthansa, standing order 32 of 2026-11-16, item 1): business-class-medium-haul at 390 against its phone first
   load ita-parity-011 (www 4919 px, ours 6635: +34.89 %, all of it in the profile-tabs block before "Airbus A321neo"):
   www's first load opens no tab panel on phones, ours opened the first (option content). A block option "phone-closed"
   keeps every panel closed below 768px on load; from 768px the first tab stays selected, as before. Without the option
   nothing changes (onboard-delights and the other content tabs keep their first panel open).
   Run: node --test test/profile-tabs-phone-closed-so32.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html><head></head><body><main></main></body></html>');
const wide = false;
window.matchMedia = () => ({ get matches() { return wide; }, addEventListener: () => {}, addListener: () => {} });
window.location = {
  hash: '', pathname: '/', href: 'https://ita.turnsthe.page/', origin: 'https://ita.turnsthe.page',
};
window.history = { replaceState: () => {} };
window.hlx = { codeBasePath: '' };
window.origin = window.location.origin;
globalThis.window = window;
globalThis.document = document;
const { default: decorate } = await import('../blocks/profile-tabs/profile-tabs.js');

const blockOf = (classes) => {
  const block = document.createElement('div');
  block.className = classes;
  block.innerHTML = ['All the benefits', 'Dedicated airport services', 'Please Note:']
    .map((l) => `<div><div>${l}</div><div><p>${l} text</p></div></div>`).join('');
  document.querySelector('main').append(block);
  return block;
};
const openPanels = (block) => [...block.querySelectorAll('[role="tabpanel"], .profile-tabs-panel')].filter((p) => !p.hidden).length;

test('option content: the first panel open on phones, as before', async () => {
  const block = blockOf('profile-tabs content');
  await decorate(block);
  assert.equal(openPanels(block), 1);
});

test('option content and phone-closed: every panel closed on phones', async () => {
  const block = blockOf('profile-tabs content phone-closed');
  await decorate(block);
  assert.equal(openPanels(block), 0);
});

test('the list: READY, the option on both of the page\'s blocks, nothing else', async () => {
  const fs = await import('node:fs');
  const { readyPaths } = await import('../tools/importer/ita-fragment-insert-apply.mjs');
  const R = '../tools/reports/parity-2026-11-09/';
  const data = JSON.parse(fs.readFileSync(new URL(`${R}delta-so32-ita-business-class-phone-tabs-closed.json`, import.meta.url), 'utf8'));
  const list = fs.readFileSync(new URL(`${R}delta-so32-ita-business-class-phone-tabs-closed.txt`, import.meta.url), 'utf8');
  const PATH = '/it/en/world-of-ita-airways/travel-classes/business-class-medium-haul';
  assert.deepEqual(readyPaths(list), [PATH]);
  const [r] = data[PATH];
  assert.equal(r.count, 2);
  assert.equal(r.to, r.from.replace('content"', 'content phone-closed"'));
  assert.match(list.split('\n')[0], /\.token-free-backup\/2026-11-ita-so32-business-class-phone-tabs-closed\//);
});
