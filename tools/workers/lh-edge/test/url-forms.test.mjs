/* eslint-disable max-len */
/* Other spellings of a page URL (src/url-forms.js), against www's recorded answers
   (tools/source-export/feeds/url-forms): one 301 to the page; what no URL form may touch answers as
   before; the China hosts' home (src/entry.js aliasHome). */
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import HTMLRewriter from './htmlrewriter-shim.mjs';
import worker from '../src/index.js';
import { urlFormTarget } from '../src/url-forms.js';
import { aliasHome } from '../src/entry.js';
import { resetRouterCache } from '../src/router.js';
import { resetMarketCache } from '../src/markets.js';

globalThis.HTMLRewriter = HTMLRewriter;
const here = path.dirname(fileURLToPath(import.meta.url));
const RECORDED = JSON.parse(fs.readFileSync(path.join(here, '../../../source-export/feeds/url-forms/index.json'), 'utf8'));
const ORIGIN = 'main--lh-com--moved-permanently.aem.live';
const env = (extra = {}) => ({
  ORIGIN,
  WWW_HOST: 'www.lufthansa.com',
  EDGE_TTL: '60',
  ALIAS_HOSTS: 'lufthansa-cn.turnsthe.page',
  ALIAS_HOME_ROOT: 'cn/en',
  FRONT_DOOR_HOSTS: 'lufthansa.turnsthe.page',
  BACKENDS: { fetch: async () => new Response('backends', { headers: { 'content-type': 'text/plain' } }) },
  MESSAGES: { fetch: async () => Response.json({ data: {} }) },
  ...extra,
});
beforeEach(() => {
  resetRouterCache();
  resetMarketCache();
  globalThis.fetch = async (input) => {
    const u = new URL((input instanceof Request ? input : new Request(input)).url);
    if (u.pathname.endsWith('.json')) {
      return Response.json({
        total: 0, offset: 0, limit: 0, data: [], ':type': 'sheet',
      });
    }
    return new Response(`<html><head></head><body>eds ${u.pathname}</body></html>`, { status: u.pathname.startsWith('/de/en/homepage') && !u.pathname.includes('.') ? 200 : 404, headers: { 'content-type': 'text/html; charset=utf-8' } });
  };
});
const fetchOn = (host, p, extra) => worker.fetch(new Request(`https://${host}${p}`, { redirect: 'manual' }), env(extra), { waitUntil: () => {} });
const answer = async (resp) => ({
  status: resp.status, location: resp.headers.get('location'), route: resp.headers.get('x-lh-edge-route'), body: await resp.text(),
});

test('www\'s recorded forms: the page URL (one 301), the other selectors stay 404', () => {
  const want = {
    '/de/en/Homepage': '/de/en/homepage',
    '/de/de/Handgepaeck': '/de/de/handgepaeck',
    '/de/en/CARRY-ON-BAGGAGE': '/de/en/carry-on-baggage',
    '/de/en/homepage.html': '/de/en/homepage',
    '/de/en/carry-on-baggage.html': '/de/en/carry-on-baggage',
    '/de/en/carry-on-baggage/': '/de/en/carry-on-baggage',
    '/de/de/handgepaeck/': '/de/de/handgepaeck',
    '/content/lh/markets/de/en/homepage': '/de/en/homepage',
    '/content/lh/markets/de/en/homepage.html': '/de/en/homepage',
    '/content/lh/markets/de/de/prepare-for-your-trip/baggage/carry-on-baggage.html': '/de/de/prepare-for-your-trip/baggage/carry-on-baggage',
    '/content/lh/markets/gb/en/homepage.html': '/gb/en/homepage',
    '/de/en/homepage.nocache.html': '/de/en/homepage',
    '/de/en/homepage.external.html': null,
    '/de/en/homepage.solo.html': null,
    '/content/dam/hcl/FF_pdp.jpg': null,
  };
  const recorded = RECORDED.urls || RECORDED;
  Object.keys(want).forEach((p) => assert.ok(JSON.stringify(recorded).includes(p), `${p} recorded`));
  Object.entries(want).forEach(([p, to]) => assert.equal(urlFormTarget(new URL(`https://x${p}`)), to, p));
  // combined, one hop; the query kept; the fleet pages keep www's upper case; market roots too
  assert.equal(urlFormTarget(new URL('https://x/DE/EN/Carry-On-Baggage.html?a=1')), '/de/en/carry-on-baggage?a=1');
  assert.equal(urlFormTarget(new URL('https://x/de/en/discover-lufthansa/lufthansa-fleet/32N')), null);
  assert.equal(urlFormTarget(new URL('https://x/de/en/discover-lufthansa/lufthansa-fleet/32N.html')), '/de/en/discover-lufthansa/lufthansa-fleet/32N');
  assert.equal(urlFormTarget(new URL('https://x/ch/en/Baggage')), '/ch/en/baggage');
  assert.equal(urlFormTarget(new URL('https://x/content/lh/markets/de/en')), '/de/en');
  assert.equal(urlFormTarget(new URL('https://x/DE/EN')), '/de/en');
  // the entry paths, other selector forms and two letters that are no country
  ['/de/en', '/de/en/', '/de/en/homepage', '/de/en/homepage.sdui.html', '/xf/lh/footer/', '/de/en/x.solo.continue.html'].forEach((p) => assert.equal(urlFormTarget(new URL(`https://x${p}`)), null, p));
});

// every path family no URL form may touch (the brief's list), in lower and upper case
const UNTOUCHED = [
  '/de/en/homepage.plain.html', '/de/en/nav.plain.html', '/de/en/Homepage.plain.html',
  '/blocks/header/header.js', '/scripts/aem.js', '/styles/styles.css', '/icons/arrow.svg', '/fonts/roboto.woff2',
  '/tools/admin/sheets/index.html', '/tools/admin/G4T/', '/library/blocks.html', '/drafts/Page', '/drafts/x.html',
  '/content/dam/lh/images/X.JPG', '/content/dam/hcl/FF_pdp.jpg', '/service/secured/api/core/X', '/service/api/labels/X',
  '/deeplink/Cockpit', '/graphql/execute.json/Message-Center/lhgIrregMessageList', '/api/content/graphql/execute.json/A/B',
  '/etc/designs/Dcep/x.png', '/sitemap/sitemap_lh.xml', '/sitemap/sitemap_lh.xml.gz', '/sitemap.xml', '/.well-known/assetlinks.json',
  '/content/mobile/lh/en/homepage.sdui', '/content/mobile/lh/en/Articles.sdui', '/de/en/addresses-worldwide.sdui', '/de/en/x.v2.sdui',
  '/de/en/baggage.solo_continue', '/de/de/homepage.solo.continue.solo_continue',
  '/content/lh/markets/de/en/homepage.csi-offline.json', '/content/lh/markets/de/en/homepage.csi-owa-header.json',
  '/content/lh/markets/de/en/addresses-worldwide.sdui', '/content/experience-fragments/lh/x.csi-xf.json',
  '/migration-status', '/migration-status/Batch-4', '/_lh-auth/login', '/de/en/homepage', '/', '/de', '/de/en', '/de/en/',
];

test('every path no URL form may touch answers as before (URL forms on = off), on lhedge and on the front door', async () => {
  for (const host of ['lufthansa-edge.turnsthe.page', 'lufthansa.turnsthe.page']) { // eslint-disable-line no-restricted-syntax
    for (const p of UNTOUCHED) { // eslint-disable-line no-restricted-syntax
      assert.equal(urlFormTarget(new URL(`https://${host}${p}`)), null, p);
      const on = await answer(await fetchOn(host, p)); // eslint-disable-line no-await-in-loop
      resetRouterCache();
      resetMarketCache();
      const off = await answer(await fetchOn(host, p, { URL_FORMS: 'off' })); // eslint-disable-line no-await-in-loop
      assert.deepEqual(on, off, `${host}${p}`);
      assert.notEqual(on.route, 'url-form', `${host}${p}`);
    }
  }
});

test('the 301 itself: GET and HEAD, the page URL, cacheable; other methods and URL_FORMS off as before', async () => {
  const r = await fetchOn('lufthansa.turnsthe.page', '/de/en/Homepage.html?x=1');
  assert.deepEqual([r.status, r.headers.get('location'), r.headers.get('x-lh-edge-route')], [301, '/de/en/homepage?x=1', 'url-form']);
  const head = await worker.fetch(new Request('https://lufthansa-edge.turnsthe.page/content/lh/markets/de/en/homepage', { method: 'HEAD' }), env(), {});
  assert.equal(head.headers.get('location'), '/de/en/homepage');
  const post = await worker.fetch(new Request('https://lufthansa-edge.turnsthe.page/de/en/Homepage', { method: 'POST', body: 'x' }), env(), {});
  assert.notEqual(post.status, 301);
  assert.equal((await fetchOn('lufthansa-edge.turnsthe.page', '/de/en/Homepage', { URL_FORMS: 'off' })).status, 404);
});

// DA documents at the long path (aem.live answers them 200; their short paths are 404)
const LOUNGENET = [
  '/content/lh/markets/de/en/during-your-trip/lounges/loungenet',
  '/content/lh/markets/de/en/during-your-trip/lounges/loungenet/fra-first-class-lounge-b',
  '/content/lh/markets/de/en/during-your-trip/lounges/loungenet/muc-first-class-lounge',
];

test('a long path the site has a page at answers as itself; its other spellings go to it (www: .html a 302)', async () => {
  const seen = [];
  globalThis.fetch = async (input, init = {}) => {
    const req = input instanceof Request ? input : new Request(input);
    const u = new URL(req.url);
    seen.push(`${init.method || req.method} ${u.pathname}`);
    const page = LOUNGENET.includes(u.pathname);
    return new Response(page ? `<html><body>eds ${u.pathname}</body></html>` : 'not found', { status: page ? 200 : 404, headers: { 'content-type': 'text/html; charset=utf-8' } });
  };
  for (const host of ['lufthansa-edge.turnsthe.page', 'lufthansa.turnsthe.page']) { // eslint-disable-line no-restricted-syntax
    for (const p of LOUNGENET) { // eslint-disable-line no-restricted-syntax
      seen.length = 0;
      const on = await answer(await fetchOn(host, p)); // eslint-disable-line no-await-in-loop
      assert.equal(on.status, 200, `${host}${p}`);
      assert.equal(on.body, `<html><body>eds ${p}</body></html>`, `${host}${p}`);
      assert.notEqual(on.route, 'url-form', `${host}${p}`);
      // the page's own answer decided: one origin request, no extra HEAD
      assert.deepEqual(seen, [`GET ${p}`], `${host}${p}`);
      const off = await answer(await fetchOn(host, p, { URL_FORMS: 'off' })); // eslint-disable-line no-await-in-loop
      assert.deepEqual(on, off, `${host}${p}`);
      const head = await worker.fetch(new Request(`https://${host}${p}`, { method: 'HEAD' }), env(), {}); // eslint-disable-line no-await-in-loop
      assert.equal(head.status, 200, `HEAD ${host}${p}`);
      // www's recorded answer for a long path with .html: 302 to the long path
      const html = await fetchOn(host, `${p}.html?a=1`); // eslint-disable-line no-await-in-loop
      assert.deepEqual([html.status, html.headers.get('location'), html.headers.get('x-lh-edge-route')], [302, `${p}?a=1`, 'url-form'], `${host}${p}.html`);
      // the other spellings: one 301 to the long path
      for (const form of [`${p}/`, `${p}.nocache.html`, p.replace('/loungenet', '/LoungeNet'), p.replace('/markets/de/en/', '/markets/DE/EN/')]) { // eslint-disable-line no-restricted-syntax
        const r = await fetchOn(host, form); // eslint-disable-line no-await-in-loop
        assert.deepEqual([r.status, r.headers.get('location')], [301, p], `${host}${form}`);
      }
    }
    // a long path with no page at it: the 301 to the short path, as before
    const missing = '/content/lh/markets/de/en/during-your-trip/lounges/no-such-lounge';
    for (const form of [missing, `${missing}.html`, `${missing}/`]) { // eslint-disable-line no-restricted-syntax
      const r = await fetchOn(host, form); // eslint-disable-line no-await-in-loop
      assert.deepEqual([r.status, r.headers.get('location'), r.headers.get('x-lh-edge-route')], [301, '/de/en/during-your-trip/lounges/no-such-lounge', 'url-form'], `${host}${form}`);
    }
  }
});

test('China hosts: / to /cn/en/homepage once the host serves cn/en; until then by country, as today', async () => {
  const lhcn = new Request('https://lufthansa-cn.turnsthe.page/', { headers: { 'cf-ipcountry': 'DE' } });
  const cn = new Request('https://lufthansa-cn.turnsthe.page/', { headers: { 'cf-ipcountry': 'DE' } });
  // today: no cn/en row
  assert.equal(aliasHome(lhcn, env()), null);
  for (const host of ['lufthansa-cn.turnsthe.page']) { // eslint-disable-line no-restricted-syntax
    const r = await worker.fetch(new Request(`https://${host}/`, { headers: { 'cf-ipcountry': 'DE', 'accept-language': 'de' } }), env(), {}); // eslint-disable-line no-await-in-loop
    assert.equal(r.headers.get('location'), '/de/de/homepage', host);
  }
  // with a cn/en row the host serves (a live row, or a pilot row with cn in PILOT_COUNTRIES_BY_HOST)
  const table = {
    'cn/en': {
      country: 'cn', lang: 'en', status: 'pilot', documents: 'language',
    },
  };
  assert.equal(aliasHome(lhcn, env(), table, ['cn/en']), '/cn/en/homepage');
  assert.equal(aliasHome(cn, env(), table, ['cn/en']), '/cn/en/homepage');
  // a pilot cn/en row the host does not serve (rollout batch 7: lufthansa-cn without cn in
  // PILOT_COUNTRIES_BY_HOST; its documents are on preview only): by country, as today
  assert.equal(aliasHome(lhcn, env(), table, []), null);
  assert.equal(aliasHome(lhcn, env(), table), null, 'served roots from the env: no cn pilot root');
  // not on the other hosts, not without the var
  assert.equal(aliasHome(new Request('https://lufthansa-edge.turnsthe.page/'), env(), table, ['cn/en']), null);
  assert.equal(aliasHome(lhcn, env({ ALIAS_HOME_ROOT: '' }), table, ['cn/en']), null);
});

test('wrangler.toml: lufthansa-cn serves no pilot country (cn waits for its published documents)', () => {
  const toml = fs.readFileSync(path.join(here, '../wrangler.toml'), 'utf8');
  const value = (toml.match(/^PILOT_COUNTRIES_BY_HOST = "([^"]*)"/m) || [])[1];
  assert.equal(value, 'lufthansa.turnsthe.page=ch');
});
