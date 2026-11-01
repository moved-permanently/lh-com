/* Air Dolomiti's digital assistant (Engagent) behind the site flag live-chat, as www.airdolomiti.it
   loads it through its tag manager (GTM-SH94, 2026-11-01): on every page tag 997's
   digital-assistant.js?cid=<cid>&view.mobileMode=detect (Engagent's rules pick what shows); on the
   chat page (block live-chat) the plain script, then DA.init({cid, baseUrl, view: {mobileMode:
   'enabled', htmlId: 'da_airdolomiti_support', adaptiveParentScroll: false}, hooks: {onReady}}) in
   the chat container, shown 200 ms after onReady. No consent wait (www loads it before any choice).
   Off (no row, 404, "off"), another brand, DA's authoring views: nothing loaded, the block's link
   to www's chat page as today.
   Run: node --max-old-space-size=512 --test test/embed-live-chat.test.mjs */
/* global globalThis */
import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
window.hlx = { codeBasePath: '' };
const at = (pathname, search = '') => {
  window.location = {
    hostname: 'main--lh-airdolomiti--moved-permanently.aem.page', pathname, search, replace: () => {}, href: `https://main--lh-airdolomiti--moved-permanently.aem.page${pathname}${search}`, origin: 'https://main--lh-airdolomiti--moved-permanently.aem.page',
  };
};
at('/');
window.origin = window.location.origin;
window.matchMedia = () => ({ matches: false, addEventListener: () => {}, addListener: () => {} });
globalThis.window = window;
globalThis.document = document;
globalThis.MutationObserver = window.MutationObserver;

const CID = 'c67b400ea554ae044b5da9a6ad05fd7b19e59cde';
const SCRIPT = 'https://engagent.h-care.eu/webplayer/latest/js/digital-assistant.js';
let flagRows;
let calls;
beforeEach(async () => {
  calls = [];
  flagRows = null;
  globalThis.fetch = async (url) => {
    calls.push(String(url));
    if (String(url) === '/config/flags.json' && flagRows) {
      return new Response(JSON.stringify({ data: flagRows }), { headers: { 'content-type': 'application/json' } });
    }
    return new Response('', { status: 404 });
  };
  (await import('../scripts/flags.js')).resetFlags();
  delete window.DA;
  at('/');
  document.head.innerHTML = '<meta name="brand" content="airdolomiti"><script nonce="n0nce-xyz" src="/scripts/scripts.js" type="module"></script>';
  document.body.innerHTML = '<main></main>';
});

const sleep = (ms) => new Promise((r) => { setTimeout(r, ms); });
const vendorScripts = () => [...document.querySelectorAll('script[src*="engagent.h-care.eu"]')];
const { BRANDS } = await import('../scripts/brands.js');
const { default: loadSiteEmbeds } = await import('../scripts/site-embeds.js');
const { default: decorate } = await import('../blocks/live-chat/live-chat.js');

const chatBlock = () => {
  const block = document.createElement('div');
  block.className = 'live-chat';
  block.innerHTML = '<div><div><p><a href="https://www.airdolomiti.it/hai-bisogno-di-aiuto/live-chat-supporto">Chat with us</a></p></div></div>';
  document.querySelector('main').append(block);
  return block;
};

test('brands.js: Air Dolomiti\'s Engagent configuration, no other brand has one', () => {
  assert.deepEqual(BRANDS.airdolomiti.embeds['live-chat'], {
    script: SCRIPT, cid: CID, baseUrl: 'https://engagent.h-care.eu/webplayer/latest/', htmlId: 'da_airdolomiti_support',
  });
  Object.entries(BRANDS).filter(([k]) => k !== 'airdolomiti').forEach(([k, b]) => assert.ok(!(b.embeds && b.embeds['live-chat']), k));
});

test('site-wide, flag on: www\'s tag 997 script with the cid and mobile mode, the page\'s nonce', async () => {
  flagRows = [{ flag: 'live-chat', value: 'on' }];
  await loadSiteEmbeds();
  const scripts = vendorScripts();
  assert.equal(scripts.length, 1);
  assert.equal(scripts[0].getAttribute('src'), `${SCRIPT}?cid=${CID}&view.mobileMode=detect`);
  assert.equal(scripts[0].getAttribute('nonce'), 'n0nce-xyz');
  assert.ok(scripts[0].async);
});

test('site-wide, flag off (no sheet, no row, "off"): nothing loaded', async () => {
  await loadSiteEmbeds();
  assert.equal(vendorScripts().length, 0, 'no sheet');
  (await import('../scripts/flags.js')).resetFlags();
  flagRows = [{ flag: 'esim-widget', value: 'on' }];
  await loadSiteEmbeds();
  assert.equal(vendorScripts().length, 0, 'no row');
  (await import('../scripts/flags.js')).resetFlags();
  flagRows = [{ flag: 'live-chat', value: 'off' }];
  await loadSiteEmbeds();
  assert.equal(vendorScripts().length, 0, 'off');
});

test('another brand or none, DA\'s authoring views: nothing loaded, no flags read', async () => {
  flagRows = [{ flag: 'live-chat', value: 'on' }];
  document.head.innerHTML = '<meta name="brand" content="ita">';
  await loadSiteEmbeds();
  document.head.innerHTML = '';
  await loadSiteEmbeds();
  assert.equal(vendorScripts().length, 0);
  assert.deepEqual(calls, [], 'the flags sheet is not read');
  document.head.innerHTML = '<meta name="brand" content="airdolomiti">';
  at('/', '?dapreview=on');
  await loadSiteEmbeds();
  assert.equal(vendorScripts().length, 0, 'authoring');
});

test('chat page, flag off: the block keeps its link to www\'s chat page, nothing loaded', async () => {
  const block = chatBlock();
  await decorate(block);
  await sleep(20);
  assert.equal(block.querySelector('a').getAttribute('href'), 'https://www.airdolomiti.it/hai-bisogno-di-aiuto/live-chat-supporto');
  assert.equal(block.querySelector('.live-chat-frame'), null);
  assert.equal(vendorScripts().length, 0);
});

test('chat page, flag on: the plain script, DA.init as www\'s chat page tag, shown after onReady; no site-wide script', async () => {
  flagRows = [{ flag: 'live-chat', value: 'on' }];
  const block = chatBlock();
  await decorate(block);
  await sleep(20);
  await loadSiteEmbeds();
  const scripts = vendorScripts();
  assert.equal(scripts.length, 1, 'only the chat page\'s script');
  assert.equal(scripts[0].getAttribute('src'), SCRIPT);
  assert.equal(scripts[0].getAttribute('nonce'), 'n0nce-xyz');
  const frame = block.querySelector('.live-chat-frame');
  assert.ok(frame.hasAttribute('hidden'), 'hidden until the player is ready');
  assert.ok(frame.querySelector('#da_airdolomiti_support') !== null);
  let options;
  window.DA = { init: (o) => { options = o; } };
  scripts[0].dispatchEvent(new window.Event('load'));
  await sleep(150);
  assert.equal(options.cid, CID);
  assert.equal(options.baseUrl, 'https://engagent.h-care.eu/webplayer/latest/');
  assert.deepEqual(options.view, { mobileMode: 'enabled', htmlId: 'da_airdolomiti_support', adaptiveParentScroll: false });
  assert.equal(typeof options.hooks.onReady, 'function');
  assert.ok(block.querySelector('.live-chat-fallback').hasAttribute('hidden') === false, 'the link until the player is ready');
  // ready, but Engagent rendered nothing (no rule for the host: what our hosts get): the link stays
  options.hooks.onReady();
  await sleep(250);
  assert.ok(frame.hasAttribute('hidden'), 'an empty player stays hidden');
  assert.ok(!block.querySelector('.live-chat-fallback').hasAttribute('hidden'), 'the link stays');
  // the player's template arrives: the chat replaces the link
  frame.querySelector('#da_airdolomiti_support').innerHTML = '<div class="hda-template-reloaded"></div>';
  await sleep(20);
  assert.ok(!frame.hasAttribute('hidden'));
  assert.ok(block.querySelector('.live-chat-fallback').hasAttribute('hidden'), 'the chat replaces the link');
});

test('chat page, the script fails: the link stays, no chat container', async () => {
  flagRows = [{ flag: 'live-chat', value: 'on' }];
  const block = chatBlock();
  await decorate(block);
  await sleep(20);
  vendorScripts()[0].dispatchEvent(new window.Event('error'));
  await sleep(20);
  assert.equal(block.querySelector('.live-chat-frame'), null);
  assert.ok(!block.querySelector('.live-chat-fallback').hasAttribute('hidden'));
});
