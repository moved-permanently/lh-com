/* eslint-disable max-len */
/* Brussels' floating chat button (Cognigy webchat from www.brusselsairlines.com/digitalassistant/
   support, as Austrian's: scripts/site-embeds.js chat-button) behind the site flag chat-button (off
   until checked on brussels.turnsthe.page). www's pages load webchat_init.js?language=<LL> (EN, FR,
   NL, DE, IT, ES) and, with a start id, &start=DYNAMIC_web-<id> (be/en's check-in deadlines page:
   www's id with a space, "checkindeadlines -otherCheckinQuestions"); the page's metadata chat-button
   is the start id, or "button" for a page whose chat starts without one (the window closed).
   Austrian as before (test/embed-chat-button.test.mjs).
   Run: node --max-old-space-size=512 --test test/embed-chat-button-brussels.test.mjs */
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

const INIT = 'https://www.brusselsairlines.com/digitalassistant/support/webchat_init.js';
let flagRows;
const page = (pathname, { chat, lang = pathname.split('/')[2] } = {}) => {
  at(pathname);
  document.head.innerHTML = `<meta name="brand" content="brussels"><meta name="language" content="${lang}">${chat ? `<meta name="chat-button" content="${chat}">` : ''}<script nonce="n0nce-sn" src="/scripts/scripts.js" type="module"></script>`;
  document.body.innerHTML = '<main></main>';
};
beforeEach(async () => {
  flagRows = [{ flag: 'chat-button', value: 'on' }];
  globalThis.fetch = async (url) => {
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
const BRU = BRANDS.brussels.embeds['chat-button'];

test('brands.js: Brussels\' webchat script and its languages', () => {
  assert.equal(BRU.script, INIT);
  assert.deepEqual(BRU.languages, ['en', 'fr', 'nl', 'de', 'it', 'es']);
});

test('webchatInit for Brussels: ?language=<LL> on every page, the start id, the window closed', () => {
  assert.deepEqual(webchatInit(INIT, 'baggage', '/be/fr/extra-services/baggage', 'fr', BRU), {
    src: `${INIT}?language=FR&start=DYNAMIC_web-baggage`, config: { loadTealiumScripts: false, isInitiallyOpened: false },
  });
  assert.deepEqual(webchatInit(INIT, 'button', '/be/en/homepage', 'en', BRU), {
    src: `${INIT}?language=EN`, config: { loadTealiumScripts: false, isInitiallyOpened: false },
  });
  assert.equal(webchatInit(INIT, 'checkindeadlines -otherCheckinQuestions', '/be/en/check-in-options-and-info/check-in-times', 'en', BRU).src, `${INIT}?language=EN&start=DYNAMIC_web-checkindeadlines%20-otherCheckinQuestions`);
  assert.equal(webchatInit(INIT, 'Lounges', '/de/de/extra-services/lounges', 'de', BRU).src, `${INIT}?language=DE&start=DYNAMIC_web-Lounges`);
  assert.equal(webchatInit(INIT, 'baggage', '/xx/pt/x', 'pt', BRU), null, 'a language www has no chat in');
  assert.equal(webchatInit(INIT, 'bad"id', '/be/en/x', 'en', BRU), null);
  // Austrian's as before: open opens the window; a space is no start id there
  assert.deepEqual(webchatInit('https://www.austrian.com/digitalassistant/support/webchat_init.js', 'open', '/at/en/x', 'en'), {
    src: 'https://www.austrian.com/digitalassistant/support/webchat_init.js', config: { loadTealiumScripts: false, isInitiallyOpened: true },
  });
  assert.equal(webchatInit(INIT, 'a b', '/at/en/x', 'en'), null);
});

test('a Brussels page with the flag on: the script with the page\'s language and start id', async () => {
  page('/be/nl/extra-services/baggage', { chat: 'baggage' });
  await loadSiteEmbeds();
  assert.deepEqual(scripts().map((s) => s.getAttribute('src')), [`${INIT}?language=NL&start=DYNAMIC_web-baggage`]);
  assert.deepEqual(window.webchatConfig, { loadTealiumScripts: false, isInitiallyOpened: false });
});

test('the flag off (Brussels\' default), no metadata: nothing loaded', async () => {
  flagRows = [];
  page('/be/en/extra-services/baggage', { chat: 'baggage' });
  await loadSiteEmbeds();
  assert.equal(scripts().length, 0);
  flagRows = [{ flag: 'chat-button', value: 'on' }];
  (await import('../scripts/flags.js')).resetFlags();
  page('/be/en/extra-services/upgrades');
  await loadSiteEmbeds();
  assert.equal(scripts().length, 0);
});
