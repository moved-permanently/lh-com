/* Air Dolomiti's eSIM widget (Breeze) behind the site flag esim-widget, as
   www.airdolomiti.it/en/extra-services/plans-esim embeds it (2026-11-01; a classic script loaded
   after the page is interactive, before any consent choice): widgets.breezesim.com/v1/embed.js (the
   brand's script) and a <breeze-widget> with the attributes of www's markup (the block's rows:
   widget-token, products, currency, colours...). The block's link to www's eSIM page until the
   widget is defined. Off, no token or products, another brand: nothing loaded.
   Run: node --max-old-space-size=512 --test test/embed-esim-widget.test.mjs */
/* global globalThis */
import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
window.hlx = { codeBasePath: '' };
window.location = {
  hostname: 'main--lh-airdolomiti--moved-permanently.aem.page', pathname: '/en/extra-services/plans-esim', search: '', replace: () => {}, href: 'https://main--lh-airdolomiti--moved-permanently.aem.page/en/extra-services/plans-esim', origin: 'https://main--lh-airdolomiti--moved-permanently.aem.page',
};
window.origin = window.location.origin;
window.matchMedia = () => ({ matches: false, addEventListener: () => {}, addListener: () => {} });
globalThis.window = window;
globalThis.document = document;

const SCRIPT = 'https://widgets.breezesim.com/v1/embed.js';
// www's English page's <breeze-widget> (2026-11-01), its attributes in order
const WWW = [
  ['widget-token', 'pk_2Q-SudQuU8uOCKt1mXO1JmQXlVGXzfDs'],
  ['products', 'IT:esimd_ULE_3D_IT_V2,DE:esimd_ULE_3D_DE_V2,Europe Lite:esimd_ULE_7D_REUL_V2,North America:esimd_ULE_7D_RNA_V2'],
  ['currency', 'EUR'],
  ['max-rows', '1'],
  ['max-rows-mobile', '3'],
  ['widget-background-color', '#f5f1ee'],
  ['widget-padding', '25px'],
  ['card-button-color', '#00798a'],
  ['region-icon-color', '#0a195c'],
];
let flagRows;
beforeEach(async () => {
  flagRows = [{ flag: 'esim-widget', value: 'on' }];
  globalThis.fetch = async (url) => {
    if (String(url) === '/config/flags.json' && flagRows) {
      return new Response(JSON.stringify({ data: flagRows }), { headers: { 'content-type': 'application/json' } });
    }
    return new Response('', { status: 404 });
  };
  (await import('../scripts/flags.js')).resetFlags();
  document.head.innerHTML = '<meta name="brand" content="airdolomiti"><script nonce="n0nce-en" src="/scripts/scripts.js" type="module"></script>';
  document.body.innerHTML = '<main></main>';
});

const sleep = (ms) => new Promise((r) => { setTimeout(r, ms); });
const scripts = () => [...document.querySelectorAll('script[src*="breezesim"]')];
const { BRANDS } = await import('../scripts/brands.js');
const { default: decorate } = await import('../blocks/esim-widget/esim-widget.js');

const esimBlock = (rows = WWW) => {
  const block = document.createElement('div');
  block.className = 'esim-widget';
  block.innerHTML = `${rows.map(([k, v]) => `<div><div>${k}</div><div>${v}</div></div>`).join('')}
    <div><div><p><a href="https://www.airdolomiti.eu/extra-services/plans-esim">Find your eSIM plan</a></p></div></div>`;
  document.querySelector('main').append(block);
  return block;
};

test('brands.js: Air Dolomiti\'s Breeze script, no other brand has one', () => {
  assert.deepEqual(BRANDS.airdolomiti.embeds['esim-widget'], { script: SCRIPT });
  Object.entries(BRANDS).filter(([k]) => k !== 'airdolomiti').forEach(([k, b]) => assert.ok(!(b.embeds && b.embeds['esim-widget']), k));
});

test('flag off: the link to www\'s eSIM page only, the rows hidden, nothing loaded', async () => {
  flagRows = [];
  const block = esimBlock();
  await decorate(block);
  await sleep(20);
  assert.equal(scripts().length, 0);
  assert.equal(block.querySelector('breeze-widget'), null);
  assert.equal(block.textContent.includes('pk_'), false, 'no token shown');
  assert.equal(block.querySelector('.esim-widget-fallback a').textContent, 'Find your eSIM plan');
});

test('flag on: <breeze-widget> with www\'s attributes and the script with the page\'s nonce; the widget replaces the link', async () => {
  const block = esimBlock();
  await decorate(block);
  await sleep(20);
  const widget = block.querySelector('breeze-widget');
  // (linkedom lists attribute names last first)
  assert.deepEqual([...widget.getAttributeNames()].sort(), WWW.map(([k]) => k).sort());
  WWW.forEach(([k, v]) => assert.equal(widget.getAttribute(k), v, k));
  assert.equal(scripts().length, 1);
  assert.equal(scripts()[0].getAttribute('src'), SCRIPT);
  assert.equal(scripts()[0].getAttribute('nonce'), 'n0nce-en');
  const frame = block.querySelector('.esim-widget-frame');
  const fallback = block.querySelector('.esim-widget-fallback');
  assert.ok(frame.hasAttribute('hidden'), 'hidden until the widget shows plans');
  window.customElements.define('breeze-widget', class extends window.HTMLElement {});
  scripts()[0].dispatchEvent(new window.Event('load'));
  // Breeze's error state (its API refuses the token: 403 on localhost, 2026-11-01): the link stays
  widget.attachShadow({ mode: 'open' });
  widget.shadowRoot.innerHTML = '<div class="error-state"><p class="error">Plans are unavailable right now.</p><button class="retry-button">Retry</button></div><div class="card-filler"></div>';
  await sleep(250);
  assert.ok(frame.hasAttribute('hidden'));
  assert.ok(!fallback.hasAttribute('hidden'), 'the link while there are no plans');
  // its plans (www: .card per product): the widget replaces the link
  widget.shadowRoot.innerHTML = '<div class="card"><div class="card-header">Italy</div></div>';
  await sleep(250);
  assert.ok(!frame.hasAttribute('hidden'));
  assert.ok(fallback.hasAttribute('hidden'));
});

test('rows: only attribute names, no event handlers; no token or products: nothing loaded', async () => {
  const block = esimBlock([...WWW, ['onclick', 'alert(1)'], ['Widget Label Color', '#002e54']]);
  await decorate(block);
  await sleep(20);
  const widget = block.querySelector('breeze-widget');
  assert.equal(widget.hasAttribute('onclick'), false);
  assert.equal(widget.getAttribute('widget-label-color'), '#002e54', 'authored names as attribute names');
  document.querySelector('main').replaceChildren();
  const noToken = esimBlock(WWW.filter(([k]) => k !== 'widget-token'));
  const before = scripts().length;
  await decorate(noToken);
  await sleep(20);
  assert.equal(noToken.querySelector('breeze-widget'), null);
  assert.equal(scripts().length, before);
});

test('flag on, the script fails: no widget, the link stays', async () => {
  const block = esimBlock();
  await decorate(block);
  await sleep(20);
  scripts().at(-1).dispatchEvent(new window.Event('error'));
  await sleep(20);
  assert.equal(block.querySelector('breeze-widget'), null);
  assert.ok(!block.querySelector('.esim-widget-fallback').hasAttribute('hidden'));
});

test('another brand: nothing loaded', async () => {
  document.querySelector('meta[name="brand"]').setAttribute('content', 'cargo');
  const before = scripts().length;
  const block = esimBlock();
  await decorate(block);
  await sleep(20);
  assert.equal(scripts().length, before);
  assert.equal(block.querySelector('breeze-widget'), null);
});
