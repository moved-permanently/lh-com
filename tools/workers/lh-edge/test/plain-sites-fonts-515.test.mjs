/* eslint-disable max-len */
/* The brief after 515, item 1: the Lufthansa fonts styles/fonts.css names (mausy-v1.40.1's fonts/lufthansa/, five
   files) answered 404 on airdolomiti.turnsthe.page and tap.turnsthe.page (no design host: the origin's answer), so
   every page there loaded them from www.lufthansa.com's absolute URL, fonts.css's second src (on Air Dolomiti the
   fallback consent banner asks for LufthansaHead and LufthansaText). Both hosts now get /digitalhangar/ from
   www.lufthansa.com as the other brand hosts do (wrangler.toml SITE_DESIGN_HOSTS airdolomiti= and tap=): 200,
   font/woff2, a release file kept a year; never their own www (www.airdolomiti.it, www.flytap.com); their other
   paths from their origins as before.
   Run: node --test test/plain-sites-fonts-515.test.mjs */
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import HTMLRewriter from './htmlrewriter-shim.mjs';
import worker from '../src/index.js';
import { siteOf } from '../src/sites.js';

globalThis.HTMLRewriter = HTMLRewriter;

const toml = fs.readFileSync(new URL('../wrangler.toml', import.meta.url), 'utf8');
const tomlVar = (name) => (toml.match(new RegExp(`^${name} = "([^"]*)"`, 'm')) || [])[1] || '';
const env = () => ({
  ORIGIN: 'main--lh-com--moved-permanently.aem.live',
  WWW_HOST: 'www.lufthansa.com',
  SITE_HOSTS: tomlVar('SITE_HOSTS'),
  SITE_ORIGINS: tomlVar('SITE_ORIGINS'),
  SITE_WWW_HOSTS: tomlVar('SITE_WWW_HOSTS'),
  SITE_DESIGN_HOSTS: tomlVar('SITE_DESIGN_HOSTS'),
});
// the font files fonts.css names (its local src), one per face
const css = fs.readFileSync(new URL('../../../../styles/fonts.css', import.meta.url), 'utf8');
const FONTS = [...new Set([...css.matchAll(/url\('(\/digitalhangar\/[^']+\.woff2)'\)/g)].map((m) => m[1]))];
const ORIGINS = { airdolomiti: 'main--lh-airdolomiti--moved-permanently.aem.live', tap: 'main--lh-tap--moved-permanently.aem.live' };
let calls;
beforeEach(() => {
  calls = [];
  globalThis.fetch = async (input, init = {}) => {
    const req = input instanceof Request ? input : new Request(input, init);
    const u = new URL(req.url);
    calls.push(`${u.hostname}${u.pathname}`);
    if (u.hostname === 'www.lufthansa.com' && FONTS.includes(u.pathname)) {
      return new Response(new Uint8Array([119, 79, 70, 50]), { headers: { 'content-type': 'font/woff2', 'cache-control': 'public, max-age=300', 'access-control-allow-origin': '*' } });
    }
    if (Object.values(ORIGINS).includes(u.hostname)) return new Response(`<html>${u.hostname}${u.pathname}</html>`, { headers: { 'content-type': 'text/html' } });
    return new Response('<html>404</html>', { status: 404, headers: { 'content-type': 'text/html' } });
  };
});
const get = (url) => worker.fetch(new Request(url, { redirect: 'manual' }), env(), { waitUntil() {} });

test('fonts.css names the five Lufthansa files of mausy-v1.40.1 (the three the brief names among them)', () => {
  assert.equal(FONTS.length, 5);
  ['LufthansaTextWeb-Bold', 'LufthansaHeadWeb-Bold', 'LufthansaHeadWeb-Light'].forEach((f) => assert.ok(FONTS.some((p) => p.endsWith(`/fonts/lufthansa/${f}.woff2`)), f));
});

test('wrangler.toml: airdolomiti and tap take www.lufthansa.com as their design host; the other sites\' as before', () => {
  ['airdolomiti', 'tap'].forEach((name) => {
    assert.match(tomlVar('SITE_DESIGN_HOSTS'), new RegExp(`(^|; )${name}=www\\.lufthansa\\.com(;|$)`), name);
    assert.equal(siteOf(new Request(`https://${name}.turnsthe.page/`), env()).design, 'www.lufthansa.com', name);
  });
  ['discover=www.discover-airlines.com', 'ita=www.ita-airways.com', 'austrian=www.lufthansa.com', 'cargo=www.lufthansa.com', 'brussels=www.lufthansa.com', 'b2b=www.lufthansa.com', 'swiss=www.lufthansa.com']
    .forEach((e) => assert.ok(tomlVar('SITE_DESIGN_HOSTS').split('; ').includes(e), e));
});

['airdolomiti', 'tap'].forEach((name) => {
  test(`${name}.turnsthe.page: every font fonts.css names from www.lufthansa.com, 200 font/woff2 for a year`, async () => {
    for (const p of FONTS) { // eslint-disable-line no-restricted-syntax
      const resp = await get(`https://${name}.turnsthe.page${p}`); // eslint-disable-line no-await-in-loop
      assert.equal(resp.status, 200, p);
      assert.equal(resp.headers.get('content-type'), 'font/woff2', p);
      assert.equal(resp.headers.get('cache-control'), 'public, max-age=31536000, immutable', p);
      assert.equal(resp.headers.get('x-lh-edge-route'), 'digitalhangar', p);
    }
    assert.deepEqual([...new Set(calls.map((c) => c.split('/')[0]))], ['www.lufthansa.com'], 'never the brand\'s own www nor its origin');
  });

  test(`${name}.turnsthe.page: its pages from its origin as before`, async () => {
    const path = name === 'tap' ? '/pt-pt' : '/en/';
    const resp = await get(`https://${name}.turnsthe.page${path}`);
    assert.equal(await resp.text(), `<html>${ORIGINS[name]}${path}</html>`);
  });
});
