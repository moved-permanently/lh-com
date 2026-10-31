/* eslint-disable max-len */
/* lh-com's sitemaps on a brand host (src/index.js siteRespond): the code's /sitemap/sitemap_lh.xml
   names www.lufthansa.com's sitemaps; on ITA's, Discover's, Cargo's and Air Dolomiti's hosts
   /sitemap/sitemap_lh* answers 404 (www's are sitemap_ita, sitemap_four_y: not on the replica).
   lh-com's hosts as before. */
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import HTMLRewriter from './htmlrewriter-shim.mjs';
import worker from '../src/index.js';

globalThis.HTMLRewriter = HTMLRewriter;
const INDEX = '<?xml version="1.0"?><sitemapindex><sitemap><loc>https://www.lufthansa.com/sitemap/sitemap_lh_de_en.xml.gz</loc></sitemap></sitemapindex>';
const env = () => ({
  ORIGIN: 'main--lh-com--moved-permanently.aem.live',
  WWW_HOST: 'www.lufthansa.com',
  SITE_HOSTS: 'discover.turnsthe.page=discover; ita.turnsthe.page=ita; cargo.turnsthe.page=cargo; airdolomiti.turnsthe.page=airdolomiti',
  SITE_ORIGINS: 'discover=main--lh-discover--moved-permanently.aem.live; ita=main--lh-ita--moved-permanently.aem.live; cargo=main--lh-cargo--moved-permanently.aem.live; airdolomiti=main--lh-airdolomiti--moved-permanently.aem.live',
  SITE_WWW_HOSTS: 'discover=www.discover-airlines.com; ita=www.ita-airways.com; cargo=www.lufthansa-cargo.com; airdolomiti=www.airdolomiti.it',
});
let calls;
beforeEach(() => {
  calls = [];
  globalThis.fetch = async (input, init = {}) => {
    const req = input instanceof Request ? input : new Request(input, init);
    const u = new URL(req.url);
    calls.push(`${u.hostname}${u.pathname}`);
    if (u.pathname.endsWith('.json')) return Response.json({ data: [] });
    if (/^\/sitemap\//.test(u.pathname)) return new Response(INDEX, { headers: { 'content-type': 'application/xml' } });
    return new Response('<html>page</html>', { headers: { 'content-type': 'text/html' } });
  };
});
const get = (host, path) => worker.fetch(new Request(`https://${host}${path}`), env(), { waitUntil: () => {} });

test('a brand host: lh-com\'s sitemaps answer 404, without asking the origin', async () => {
  for (const host of ['ita.turnsthe.page', 'discover.turnsthe.page', 'cargo.turnsthe.page', 'airdolomiti.turnsthe.page']) { // eslint-disable-line no-restricted-syntax
    for (const path of ['/sitemap/sitemap_lh.xml', '/sitemap/sitemap_lh_de_en.xml', '/sitemap/sitemap_lh_de_en.xml.gz']) { // eslint-disable-line no-restricted-syntax
      calls = [];
      const resp = await get(host, path); // eslint-disable-line no-await-in-loop
      assert.equal(resp.status, 404, `${host}${path}`);
      assert.equal(resp.headers.get('x-lh-edge-route'), 'site-sitemap');
      assert.ok(!calls.some((c) => c.includes('/sitemap/')), `${host}${path}: no origin call`);
    }
  }
});

test('lh-com\'s host: its sitemap index as before', async () => {
  const resp = await get('lufthansa.turnsthe.page', '/sitemap/sitemap_lh.xml');
  assert.equal(resp.status, 200);
  assert.match(await resp.text(), /sitemap_lh_de_en/);
});
