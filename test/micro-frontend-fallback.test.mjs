/* eslint-disable max-len */
/* The micro-frontend block's optional Fallback row (blocks/micro-frontend): ITA's and Austrian's
   help-center pages hold only the help-center-web app, which renders nothing on our hosts (its data
   come from the airline's Travel ID service, which refuses them). With a Fallback row the block
   shows the row's content (www's text around the app: headings, text, lists, links, a nested
   accordion block) at once and mounts the app next to it, hidden; once the app's element has
   rendered visible content (a height and text, in its shadow root or light DOM) it replaces the
   fallback, else after a few seconds the fallback stays and the element is removed. Without the
   row the block as before (no fallback, the element shown), and the row is no data- attribute.
   Run: node --max-old-space-size=512 --test test/micro-frontend-fallback.test.mjs */
/* global globalThis */
import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
window.hlx = { codeBasePath: '' };
const at = (pathname, meta) => {
  window.location = {
    hostname: 'main--lh-ita--moved-permanently.aem.page', pathname, search: '', hash: '', replace: () => {}, href: `https://main--lh-ita--moved-permanently.aem.page${pathname}`, origin: 'https://main--lh-ita--moved-permanently.aem.page',
  };
  document.head.innerHTML = Object.entries(meta).map(([k, v]) => `<meta name="${k}" content="${v}">`).join('');
};
at('/', {});
window.origin = window.location.origin;
window.matchMedia = () => ({ matches: false, addEventListener: () => {}, addListener: () => {} });
globalThis.window = window;
globalThis.document = document;
globalThis.Node = window.Node;
// linkedom's classList has no index access (aem.js decorateBlock reads classList[0], as browsers allow)
Object.defineProperty(Object.getPrototypeOf(document.createElement('div').classList), '0', {
  configurable: true,
  get() { return [...this][0]; },
});
const mf = await import('../blocks/micro-frontend/micro-frontend.js');
const { BRANDS } = await import('../scripts/brands.js');
const { getLocale } = await import('../scripts/locale.js');

const sleep = (ms) => new Promise((r) => { setTimeout(r, ms); });
const FALLBACK = '<h2>Wie können wir Ihnen helfen?</h2><p>Hier finden Sie Antworten auf häufige Fragen.</p><ul><li><a href="/it/de/help-and-contact/baggage">Gepäck</a></li></ul>';
const blockOf = (rows) => {
  const block = document.createElement('div');
  block.className = 'micro-frontend';
  block.innerHTML = rows.map((cells) => `<div>${cells.map((c) => `<div>${c}</div>`).join('')}</div>`).join('');
  document.body.replaceChildren(block);
  return block;
};
// the design system and the app "already loaded" (loadCSS/loadScript resolve for a present tag)
const preload = (block) => {
  const plan = mf.mountPlan(block, BRANDS.ita, getLocale());
  document.head.insertAdjacentHTML('beforeend', `<link rel="stylesheet" href="${plan.css}">${plan.scripts.map((s) => `<script src="${s.src}"></script>`).join('')}`);
};
const page = () => at('/it/de/help-and-contact', { brand: 'ita', language: 'de' });
beforeEach(() => {
  mf.FALLBACK_TIMING.wait = 300;
  mf.FALLBACK_TIMING.every = 20;
});

test('without a Fallback row: as before; the row is no data- attribute', async () => {
  page();
  const plain = blockOf([['help-center-web']]);
  preload(plain);
  await mf.default(plain);
  assert.deepEqual([...plain.children].map((c) => c.tagName.toLowerCase()), ['help-center-web']);
  assert.ok(!plain.firstElementChild.classList.contains('micro-frontend-pending'));
  const withRow = blockOf([['help-center-web'], ['Fallback', FALLBACK]]);
  assert.equal('data-fallback' in mf.mountPlan(withRow, BRANDS.ita, getLocale()).attributes, false);
});

test('Fallback: shown at once; the app mounted hidden; the app replaces it once it shows content', async () => {
  page();
  const block = blockOf([['help-center-web'], ['Fallback', FALLBACK]]);
  preload(block);
  await mf.default(block);
  const fallback = block.querySelector(':scope > .micro-frontend-fallback');
  assert.ok(fallback, 'the fallback');
  assert.equal(fallback.querySelector('h2').textContent, 'Wie können wir Ihnen helfen?');
  assert.ok(fallback.querySelector('ul li a') !== null);
  await sleep(10);
  const app = block.querySelector('help-center-web');
  assert.ok(app, 'the app mounted');
  assert.ok(app.classList.contains('micro-frontend-pending'));
  assert.equal(app.getAttribute('aria-hidden'), 'true');
  assert.ok(app.hasAttribute('inert'));
  // the app renders: a height and text in its shadow root
  app.getBoundingClientRect = () => ({ height: 420, width: 1200 });
  app.attachShadow({ mode: 'open' }).innerHTML = '<style>.x{color:red}</style><section><h1>Hilfe-Center</h1></section>';
  await sleep(60);
  assert.equal(block.querySelector('.micro-frontend-fallback'), null, 'the fallback is gone');
  assert.ok(!app.classList.contains('micro-frontend-pending'));
  assert.ok(!app.hasAttribute('aria-hidden') && !app.hasAttribute('inert'));
});

test('Fallback: an app that renders nothing within the wait is removed, the fallback stays', async () => {
  page();
  const block = blockOf([['help-center-web'], ['Fallback', FALLBACK]]);
  preload(block);
  await mf.default(block);
  await sleep(10);
  const app = block.querySelector('help-center-web');
  // what our hosts get: styles only (no text), and no height
  app.attachShadow({ mode: 'open' }).innerHTML = '<style>:host{display:block}</style>';
  await sleep(400);
  assert.equal(block.querySelector('help-center-web'), null, 'the element is removed');
  assert.ok(block.querySelector('.micro-frontend-fallback h2') !== null, 'the fallback stays');
});

test('hasRendered: a height and text (shadow root, nested shadow roots, light DOM); styles or a height alone are not', () => {
  const el = (html, height) => {
    const e = document.createElement('x-app');
    document.body.append(e);
    e.getBoundingClientRect = () => ({ height });
    if (html !== null) e.attachShadow({ mode: 'open' }).innerHTML = html;
    return e;
  };
  assert.equal(mf.hasRendered(el('<p>Text</p>', 100)), true);
  assert.equal(mf.hasRendered(el('<style>p{}</style>', 100)), false, 'styles only');
  assert.equal(mf.hasRendered(el('<p>Text</p>', 0)), false, 'no height');
  const nested = el('<div><x-inner></x-inner></div>', 80);
  nested.shadowRoot.querySelector('x-inner').attachShadow({ mode: 'open' }).innerHTML = '<span>Gepäck</span>';
  assert.equal(mf.hasRendered(nested), true, 'text in a nested shadow root');
  const light = el(null, 50);
  light.innerHTML = '<p>Light DOM</p>';
  assert.equal(mf.hasRendered(light), true, 'light DOM');
  const detached = document.createElement('x-app');
  detached.getBoundingClientRect = () => ({ height: 100 });
  detached.textContent = 'Text';
  assert.equal(mf.hasRendered(detached), false, 'not on the page');
});

test('Fallback: a nested block (an accordion the importer writes) is decorated as a block', async () => {
  page();
  const block = blockOf([['help-center-web'], ['Fallback', '<h2>Häufige Fragen</h2><div class="accordion"><div><div>Wie viel Gepäck?</div><div>23 kg.</div></div></div>']]);
  preload(block);
  await mf.default(block);
  const accordion = block.querySelector('.micro-frontend-fallback .accordion');
  assert.ok(accordion.classList.contains('block'));
  assert.equal(accordion.dataset.blockName, 'accordion');
  assert.ok(accordion.parentElement.classList.contains('accordion-wrapper'));
  assert.ok(!block.querySelector('.micro-frontend-fallback').classList.contains('accordion-wrapper'), 'its own wrapper');
});

test('README: the Fallback row', () => {
  assert.match(fs.readFileSync('blocks/micro-frontend/README.md', 'utf8'), /`Fallback`/);
});
