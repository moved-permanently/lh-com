/* The tag manager and data layer (scripts/martech.js), off by default: the hook's condition, the
   modes, the refusals, consent gating and the fallback banner's bridge. A linkedom page, no
   network: every request goes to a stub, and no test uses a real container URL (the hosts below
   are test rows, not real profiles). Run: node --test test/*.test.mjs */
/* global globalThis */
import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseHTML } from 'linkedom';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const IDS = fs.readFileSync(path.join(root, 'data/aem-page-ids.json'), 'utf8');
const store = () => {
  const m = new Map();
  return {
    getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k), clear: () => m.clear(),
  };
};
let requests;
// what the module sets on window (linkedom's window keeps unknown properties on the global object)
const GLOBALS = ['lhgData', 'utag', 'utag_data', 'utag_cfg_ovrd', 'dataLayer', 'OnetrustActiveGroups'];
const page = (hostname, pathname = '/de/de/handgepaeck', search = '') => {
  GLOBALS.forEach((k) => { delete globalThis[k]; if (globalThis.window) delete globalThis.window[k]; });
  const { window, document } = parseHTML('<!DOCTYPE html><html><head><title>Handgepäck | Lufthansa</title></head><body><main></main></body></html>');
  window.location = {
    hostname, pathname, search, href: `https://${hostname}${pathname}${search}`, origin: `https://${hostname}`, ancestorOrigins: [],
  };
  window.localStorage = store();
  window.hlx = { codeBasePath: '' };
  Object.defineProperty(window, 'origin', { value: `https://${hostname}`, configurable: true });
  Object.defineProperty(window, 'self', { value: window, configurable: true });
  Object.defineProperty(window, 'top', { value: window, configurable: true });
  globalThis.window = window;
  globalThis.document = document;
  globalThis.localStorage = window.localStorage;
  globalThis.CustomEvent = window.CustomEvent;
  return window;
};
page('lhcom.bbird.live');
globalThis.fetch = async (url) => { requests.push(String(url)); return new Response(IDS); };
const { MARTECH_HOSTS, martechWanted } = await import('../scripts/consent.js');
const martech = await import('../scripts/martech.js');
const { resetPageIds } = await import('../scripts/data-layer.js');
const {
  default: initMartech, modeOf, containerUrl, loadContainer, bridgeConsent, resetMartech,
} = martech;

// test rows: plain names that are no real account or profile
const LIVE = { 'live.test': { mode: 'live', tealium: { account: 'test-account', profile: 'test-profile', env: 'qa' } } };
const now = () => Promise.resolve();
const scripts = () => [...document.querySelectorAll('script')].map((s) => s.src);
const tick = (ms = 0) => new Promise((r) => { setTimeout(r, ms); });

beforeEach(() => {
  requests = [];
  resetMartech();
  resetPageIds();
});

test('the host table is empty: every current host is off, and the hook loads nothing', () => {
  assert.deepEqual(MARTECH_HOSTS, {});
  ['lhcom.bbird.live', 'lhedge.bbird.live', 'lufthansa.turnsthe.page', 'lufthansa-edge.turnsthe.page', 'main--lh-com--moved-permanently.aem.page', 'www.lufthansa.com', 'localhost']
    .forEach((hostname) => {
      assert.equal(martechWanted({ hostname, search: '' }), false, hostname);
      assert.equal(modeOf(hostname, ''), 'off', hostname);
    });
  assert.equal(martechWanted({ hostname: 'lhcom.bbird.live', search: '?martech=dry' }), true);
  assert.equal(martechWanted({ hostname: 'live.test', search: '' }, LIVE), true);
  // scripts.js imports martech.js only behind that condition
  const src = fs.readFileSync(path.join(root, 'scripts/scripts.js'), 'utf8');
  assert.equal(src.match(/import\('\.\/martech\.js'\)/g).length, 1);
  assert.match(src, /if \(martechWanted\(\)\) \{\s*window\.setTimeout\(\(\) => \{\s*import\('\.\/martech\.js'\)/);
});

test('off: no request, no lhgData, utag, utag_cfg_ovrd or dataLayer, no script', async () => {
  page('lhcom.bbird.live');
  assert.equal(await initMartech({ wait: now }), 'off');
  assert.deepEqual(requests, []);
  ['lhgData', 'utag', 'utag_cfg_ovrd', 'dataLayer', 'OnetrustActiveGroups'].forEach((k) => assert.equal(window[k], undefined, k));
  assert.deepEqual(scripts(), []);
});

test('dry (?martech=dry): lhgData, noview, the meta fallbacks, one martech.view; no vendor request, no script', async () => {
  page('lhcom.bbird.live', '/de/de/handgepaeck', '?martech=dry');
  const views = [];
  window.addEventListener('martech.view', (e) => views.push(e.detail));
  assert.equal(await initMartech({ wait: now }), 'dry');
  assert.equal(window.lhgData.page.pageInfo.pageId, 'prepare-for-your-trip/baggage/carry-on-baggage_de_de');
  assert.equal(window.lhgData.page.attributes.htmlTitle, 'Handgepäck');
  assert.deepEqual(window.utag_cfg_ovrd, { noview: true });
  const meta = (n) => document.querySelector(`meta[name="${n}"]`).getAttribute('content');
  assert.deepEqual([meta('X-Portal-Site'), meta('X-Portal-Language'), meta('language')], ['DE', 'de', 'de']);
  assert.equal(views.length, 1);
  assert.equal(views[0], window.lhgData);
  assert.deepEqual(requests, ['/data/aem-page-ids.json'], 'only the site\'s own ids file');
  assert.deepEqual(scripts(), []);
  assert.equal(window.utag, undefined);
  assert.equal(window.dataLayer, undefined);
  // once per page view
  await initMartech({ wait: now });
  assert.equal(views.length, 1);
});

test('off wins: ?martech=off, an authoring context, the app view; and no query parameter makes live', async () => {
  for (const [host, p, q] of [['lhcom.bbird.live', '/de/en/homepage', '?martech=dry&martech=off'], ['lhcom.bbird.live', '/de/en/homepage', '?martech=dry&dapreview=1'], ['lhcom.bbird.live', '/de/en/baggage.solo_continue', '?martech=dry']]) { // eslint-disable-line no-restricted-syntax
    page(host, p, q);
    resetMartech();
    assert.equal(await initMartech({ wait: now }), 'off', `${p}${q}`); // eslint-disable-line no-await-in-loop
    assert.equal(window.lhgData, undefined);
  }
  assert.equal(modeOf('lhcom.bbird.live', '?martech=live'), 'off');
  assert.equal(modeOf('lhcom.bbird.live', '?martech=live&martech=dry'), 'dry');
  assert.equal(modeOf('live.test', '?martech=dry', LIVE), 'live', 'a live row stays live');
});

test('live refuses: a hostname without a row, placeholders, other hosts and paths, prod without a row, non-tiqcdn URLs', () => {
  assert.equal(containerUrl('live.test', LIVE), 'https://tags.tiqcdn.com/utag/test-account/test-profile/qa/utag.js');
  assert.equal(containerUrl('lhcom.bbird.live', LIVE), null);
  assert.equal(containerUrl('live.test', {}), null);
  const row = (tealium) => ({ 'live.test': { mode: 'live', tealium } });
  assert.equal(containerUrl('live.test', row({ account: '<TEALIUM_ACCOUNT>', profile: '<TEALIUM_PROFILE>', env: '<TEALIUM_ENV>' })), null, 'the placeholders never load');
  [{ account: 'evil.example/x', profile: 'p', env: 'qa' }, { account: '..', profile: 'p', env: 'qa' }, { account: 'a', profile: 'p@evil.example', env: 'qa' }, { account: 'a', profile: 'p', env: '' }]
    .forEach((t) => assert.equal(containerUrl('live.test', row(t)), null, JSON.stringify(t)));
  assert.equal(containerUrl('other.test', row({ account: 'a', profile: 'p', env: 'prod' })), null, 'prod without a row');
  assert.equal(containerUrl('live.test', { 'live.test': { mode: 'dry', tealium: { account: 'a', profile: 'p', env: 'qa' } } }), null, 'a dry row');
  page('live.test');
  ['https://evil.example/utag.js', 'http://tags.tiqcdn.com/utag/a/p/qa/utag.js', 'https://tags.tiqcdn.com.evil.example/utag.js', 'not a url']
    .forEach((u) => assert.equal(loadContainer(u), false, u));
  assert.deepEqual(scripts(), []);
});

test('live with only C0001 accepted: nothing loads; the fallback banner\'s choice is bridged, then the container and the view', async () => {
  page('live.test', '/de/en/homepage');
  window.localStorage.setItem('lh-consent', JSON.stringify({ groups: ['C0001'], source: 'fallback' }));
  let result = null;
  initMartech({ hosts: LIVE, wait: now }).then((r) => { result = r; });
  await tick(20);
  assert.equal(result, null, 'waiting for a choice');
  assert.deepEqual(scripts(), [], 'nothing before a non-necessary category');
  assert.equal(window.OnetrustActiveGroups, undefined);
  assert.ok(window.lhgData, 'the data layer is there (dry part)');
  window.dispatchEvent(new CustomEvent('consent.update', { detail: { consented: false, groups: ['C0001'], source: 'fallback' } }));
  await tick(20);
  assert.deepEqual(scripts(), []);
  window.dispatchEvent(new CustomEvent('consent.update', { detail: { consented: true, groups: ['C0001', 'C0002'], source: 'fallback' } }));
  await tick(20);
  assert.equal(window.OnetrustActiveGroups, ',C0001,C0002,');
  assert.deepEqual(window.dataLayer, [{ event: 'OneTrustGroupsUpdated', OnetrustActiveGroups: ',C0001,C0002,' }]);
  assert.deepEqual(scripts(), ['https://tags.tiqcdn.com/utag/test-account/test-profile/qa/utag.js']);
  const el = document.getElementById('utag-unique');
  assert.equal(el.async, true);
  const views = [];
  window.utag_data = { page_name: 'homepage' };
  window.utag = { view: (d) => views.push(d) };
  await tick(250);
  assert.equal(result, 'live');
  assert.deepEqual(views, [{ page_name: 'homepage' }]);
  assert.equal(window.lhgData.page.pageInfo.pageId, 'homepage_de_en');
  assert.ok(!requests.some((u) => /tiqcdn|google|facebook|bing|pinterest|quantum|monetate|exactag/.test(u)), 'no vendor request from our code');
});

test('live with OneTrust\'s own choice: no bridge (OneTrust sets both itself); a stored choice counts at start', async () => {
  page('live.test', '/de/en/homepage');
  window.localStorage.setItem('lh-consent', JSON.stringify({ groups: ['C0001', 'C0004'], source: 'onetrust' }));
  const run = initMartech({ hosts: LIVE, wait: now });
  await tick(20);
  assert.equal(window.OnetrustActiveGroups, undefined);
  assert.equal(window.dataLayer, undefined);
  assert.equal(scripts().length, 1);
  window.utag = { view: () => {} };
  assert.equal(await run, 'live');
  // the bridge on its own
  assert.equal(bridgeConsent(['C0002', 'C0005']), ',C0001,C0002,C0005,');
});
