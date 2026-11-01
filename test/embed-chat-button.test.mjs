/* Austrian's floating chat button (Cognigy webchat from www.austrian.com/digitalassistant/support,
   not AEM) behind the site flag chat-button, as www's tag manager loads it (Tealium os-main tag
   110, 2026-11-01; OneTrust group C0001, strictly necessary: no consent wait): window.webchatConfig
   {loadTealiumScripts: false, isInitiallyOpened} first, then webchat_init.js with the language
   (DE on /de/de, fr/es/it on their roots; else ?language=<page language> only with a start id)
   and &start=DYNAMIC_web-<start id>. Which pages and which start id: the page's metadata
   chat-button (www's clean.url table: a start id, or "open" for its TRUE|FALSE rows: no start id,
   the window opened). Off, no metadata, another language or brand: nothing loaded.
   Run: node --max-old-space-size=512 --test test/embed-chat-button.test.mjs */
/* global globalThis */
import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
window.hlx = { codeBasePath: '' };
const at = (pathname) => {
  window.location = {
    hostname: 'main--lh-austrian--moved-permanently.aem.page', pathname, search: '', replace: () => {}, href: `https://main--lh-austrian--moved-permanently.aem.page${pathname}`, origin: 'https://main--lh-austrian--moved-permanently.aem.page',
  };
};
at('/');
window.origin = window.location.origin;
window.matchMedia = () => ({ matches: false, addEventListener: () => {}, addListener: () => {} });
globalThis.window = window;
globalThis.document = document;

const INIT = 'https://www.austrian.com/digitalassistant/support/webchat_init.js';
let flagRows;
let calls;
const page = async (pathname, { chat, lang = pathname.split('/')[2] } = {}) => {
  at(pathname);
  document.head.innerHTML = `<meta name="brand" content="austrian"><meta name="language" content="${lang}">${chat ? `<meta name="chat-button" content="${chat}">` : ''}<script nonce="n0nce-os" src="/scripts/scripts.js" type="module"></script>`;
  document.body.innerHTML = '<main></main>';
};
beforeEach(async () => {
  calls = [];
  flagRows = [{ flag: 'chat-button', value: 'on' }];
  globalThis.fetch = async (url) => {
    calls.push(String(url));
    if (String(url) === '/config/flags.json' && flagRows) {
      return new Response(JSON.stringify({ data: flagRows }), { headers: { 'content-type': 'application/json' } });
    }
    return new Response('', { status: 404 });
  };
  (await import('../scripts/flags.js')).resetFlags();
  delete window.webchatConfig;
});

const scripts = () => [...document.querySelectorAll('script[src*="webchat_init.js"]')];
const { BRANDS } = await import('../scripts/brands.js');
const { default: loadSiteEmbeds, webchatInit } = await import('../scripts/site-embeds.js');

test('brands.js: Austrian\'s webchat script, no other brand has one', () => {
  assert.deepEqual(BRANDS.austrian.embeds['chat-button'], { script: INIT });
  Object.entries(BRANDS).filter(([k]) => !['austrian', 'brussels'].includes(k)).forEach(([k, b]) => assert.ok(!(b.embeds && b.embeds['chat-button']), k));
});

test('webchatInit: www\'s tag 110, the script URL and config per page', () => {
  const cases = [
    ['baggage', '/at/en/baggage', 'en', `${INIT}?language=EN&start=DYNAMIC_web-baggage`, false],
    ['baggage', '/at/de/gepaeck', 'de', `${INIT}?language=DE&start=DYNAMIC_web-baggage`, false],
    ['Lounges', '/de/de/lounges', 'de', `${INIT}?language=DE&start=DYNAMIC_web-Lounges`, false],
    ['Lounges', '/fr/fr/salons', 'fr', `${INIT}?language=fr&start=DYNAMIC_web-Lounges`, false],
    ['open', '/at/en/contact', 'en', INIT, true],
    ['open', '/de/de/kontakt', 'de', `${INIT}?language=DE`, true],
  ];
  cases.forEach(([value, path, lang, src, opened]) => {
    const got = webchatInit(INIT, value, path, lang);
    assert.equal(got.src, src, `${value} ${path}`);
    assert.deepEqual(got.config, { loadTealiumScripts: false, isInitiallyOpened: opened }, `${value} ${path}`);
  });
  assert.equal(webchatInit(INIT, 'baggage', '/at/ru/baggage', 'ru'), null, 'www: en, de, es, it, fr only');
  assert.equal(webchatInit(INIT, 'bag&start=x', '/at/en/baggage', 'en'), null, 'a start id is a word');
});

test('flag on, a page with chat-button: the config first, then the script with the page\'s nonce', async () => {
  await page('/at/en/baggage', { chat: 'baggage' });
  await loadSiteEmbeds();
  const expected = { loadTealiumScripts: false, isInitiallyOpened: false };
  assert.deepEqual({ ...window.webchatConfig }, expected);
  assert.equal(scripts().length, 1);
  assert.equal(scripts()[0].getAttribute('src'), `${INIT}?language=EN&start=DYNAMIC_web-baggage`);
  assert.equal(scripts()[0].getAttribute('nonce'), 'n0nce-os');
});

test('no chat-button metadata: nothing loaded, no flags read', async () => {
  await page('/at/en/fly');
  await loadSiteEmbeds();
  assert.equal(scripts().length, 0);
  assert.equal(window.webchatConfig, undefined);
  assert.deepEqual(calls, []);
});

const offWith = (rows) => async () => {
  flagRows = rows;
  (await import('../scripts/flags.js')).resetFlags();
  await page('/at/en/baggage', { chat: 'baggage' });
  await loadSiteEmbeds();
  assert.equal(scripts().length, 0);
  assert.equal(window.webchatConfig, undefined);
};
test('flag off: no row', offWith([]));
test('flag off: "off"', offWith([{ flag: 'chat-button', value: 'off' }]));
test('flag off: no sheet', offWith(null));

test('another brand with the metadata: nothing loaded', async () => {
  await page('/de/en/baggage', { chat: 'baggage' });
  document.querySelector('meta[name="brand"]').setAttribute('content', 'discover');
  await loadSiteEmbeds();
  assert.equal(scripts().length, 0);
});
