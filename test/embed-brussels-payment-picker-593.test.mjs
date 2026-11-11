/* eslint-disable max-len */
/* The brief after 593, item 3: Brussels' payment methods country picker (www's our-payment-methods pages embed
   webv4.brusselsairlines.com's fop_standalone page in a 750 px iframe; it loads the chosen country's methods from
   Brussels' live systems) behind the site flag brussels-payment-picker (the rule of 2026-11-01: no row = off = today's
   link). With the flag off the page keeps the import's link to the page on www; with it on the iframe takes that
   paragraph's place; never in an authoring view; never on another page or for a link inside running text.
   Run: node --max-old-space-size=512 --test test/embed-brussels-payment-picker-593.test.mjs */
/* global globalThis */
import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
window.hlx = { codeBasePath: '' };
const at = (pathname) => {
  window.location = {
    hostname: 'main--lh-brussels--moved-permanently.aem.page', pathname, search: '', replace: () => {}, href: `https://main--lh-brussels--moved-permanently.aem.page${pathname}`, origin: 'https://main--lh-brussels--moved-permanently.aem.page',
  };
};
at('/');
window.origin = window.location.origin;
window.matchMedia = () => ({ matches: false, addEventListener: () => {}, addListener: () => {} });
globalThis.window = window;
globalThis.document = document;

const PAGE = '/be/fr/book-a-flight/our-payment-methods';
const BODY = `<main><div><h2>Options de paiement</h2><p>Voici un aperçu des <a href="https://www.brusselsairlines.com${PAGE}">modes de paiement sécurisés</a> proposés.</p><p><a href="https://www.brusselsairlines.com${PAGE}">Modes de paiement et informations</a></p><h2>Frais de paiement optionnels (OPC)</h2></div></main>`;
let flagRows;
const page = (pathname) => {
  at(pathname);
  document.head.innerHTML = '<meta name="brand" content="brussels"><meta name="language" content="fr">';
  document.body.innerHTML = BODY;
};
beforeEach(async () => {
  flagRows = null;
  globalThis.fetch = async (url) => {
    if (String(url) === '/config/flags.json' && flagRows) return new Response(JSON.stringify({ data: flagRows }), { headers: { 'content-type': 'application/json' } });
    return new Response('', { status: 404 });
  };
  (await import('../scripts/flags.js')).resetFlags();
});

const { BRANDS } = await import('../scripts/brands.js');
const { default: loadSiteEmbeds, paymentPickerTarget } = await import('../scripts/site-embeds.js');
const CFG = BRANDS.brussels.embeds['brussels-payment-picker'];
const frames = () => [...document.querySelectorAll('main iframe')];

test('brands.js: the picker page, its height, the page it belongs on', () => {
  assert.equal(CFG.src, 'https://webv4.brusselsairlines.com/prod/content/v3assets/misc/fop/new/fop_standalone_1_en.html');
  assert.equal(CFG.height, 750);
  assert.equal(CFG.path, '/book-a-flight/our-payment-methods');
});

test('the target: the paragraph of the one link to the page itself on www, not a link in running text', () => {
  page(PAGE);
  const t = paymentPickerTarget(document.querySelector('main'), CFG, window.location, 'www.brusselsairlines.com');
  assert.ok(t && t.textContent === 'Modes de paiement et informations');
  at('/be/fr/book-a-flight');
  assert.equal(paymentPickerTarget(document.querySelector('main'), CFG, window.location, 'www.brusselsairlines.com'), null);
});

test('no flags sheet, no row, or any value but on: the link stays, no iframe', async () => {
  for (const rows of [null, [], [{ flag: 'brussels-payment-picker', value: 'off' }], [{ flag: 'chat-button', value: 'on' }]]) {
    flagRows = rows;
    (await import('../scripts/flags.js')).resetFlags();
    page(PAGE);
    await loadSiteEmbeds();
    assert.equal(frames().length, 0);
    assert.equal(document.querySelectorAll('main a').length, 2);
  }
});

test('the flag on: the iframe in the link paragraph\'s place, 750 px, the link in running text kept', async () => {
  flagRows = [{ flag: 'brussels-payment-picker', value: 'on' }];
  page(PAGE);
  await loadSiteEmbeds();
  const f = frames();
  assert.equal(f.length, 1);
  assert.equal(f[0].getAttribute('src'), CFG.src);
  assert.equal(f[0].getAttribute('height'), '750');
  assert.equal(f[0].getAttribute('title'), 'Modes de paiement et informations');
  assert.equal(document.querySelectorAll('main a').length, 1);
  assert.ok(document.querySelector('main .payment-picker').previousElementSibling.tagName === 'P');
});

test('the flag on, another page: nothing', async () => {
  flagRows = [{ flag: 'brussels-payment-picker', value: 'on' }];
  page('/be/fr/book-a-flight/rebook');
  await loadSiteEmbeds();
  assert.equal(frames().length, 0);
});
