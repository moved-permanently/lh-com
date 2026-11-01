/* An app configuration with ":https:" (culinary-hub's "dmc:https://www…") comes out of DA as an
   icon span (<span class="icon icon-https">); decorateIcons then requested /icons/https.svg (404 on
   the culinary pages of Discover, Austrian and lh-com). scripts.js decorateMain gives the spans
   inside micro-frontend blocks back their :name: text before icons are decorated; every other
   icon is decorated as before.
   Run: node --max-old-space-size=512 --test test/micro-frontend-icon-text.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
window.hlx = { codeBasePath: '' };
// scripts.js on a demo host's "/" only redirects (stubbed): nothing else runs on import
window.location = {
  hostname: 'main--lh-discover--moved-permanently.aem.page', pathname: '/', search: '', hash: '', replace: () => {}, href: 'https://main--lh-discover--moved-permanently.aem.page/', origin: 'https://main--lh-discover--moved-permanently.aem.page',
};
window.origin = window.location.origin;
window.matchMedia = () => ({ matches: false, addEventListener: () => {}, addListener: () => {} });
globalThis.window = window;
globalThis.document = document;
globalThis.NodeFilter = { SHOW_ELEMENT: 1, SHOW_TEXT: 4 };
const { decorateMain } = await import('../scripts/scripts.js');

const HUB = '<div class="micro-frontend"><div><div>culinary-hub</div></div><div><div>Configuration</div><div>apiKey:k;dmc<span class="icon icon-https"></span>//www.discover-airlines.com/de/de/culinaryjourney;tmc:13806</div></div></div>';

test('icon spans in a micro-frontend block: their :name: text, no /icons/https.svg; other icons as before', () => {
  const main = document.createElement('main');
  main.innerHTML = `<div>${HUB}</div><div><p><span class="icon icon-search"></span> Search</p></div>`;
  document.body.replaceChildren(main);
  decorateMain(main);
  const srcs = [...main.querySelectorAll('img')].map((i) => i.getAttribute('src'));
  assert.ok(!srcs.some((s) => /icons\/https\.svg/.test(s)), `no https icon: ${srcs.join(' ')}`);
  assert.ok(srcs.some((s) => /icons\/search\.svg/.test(s)), 'the search icon outside the block is decorated as before');
  const cell = main.querySelector('.micro-frontend > div:nth-child(2) > div:nth-child(2)');
  assert.equal(cell.textContent, 'apiKey:k;dmc:https://www.discover-airlines.com/de/de/culinaryjourney;tmc:13806');
  assert.ok(cell.querySelector('span.icon') === null);
});
