/* eslint-disable max-len */
/* SWISS's magazine serif from our copies (brief 403): www.swiss.com's magazine loads Pensum Pro from
   /etc.clientlibs/swissstoryhub/clientlibs/clientlib-site/resources/fonts/Pensum-Pro-Regular.woff(2);
   www refuses the font to other sites. Our copies are committed under /etc.clientlibs-copies/ (the
   site's origin serves them byte for byte, as /digitalhangar-copies/). On the SWISS hosts
   (swiss.turnsthe.page, swiss-cn) lh-edge answers those two paths from the copy (x-lh-edge-route
   etc-clientlibs, x-lh-edge-copy origin), www never asked; a missing copy is a 404, not www. Other
   /etc.clientlibs/ paths and the other sites' hosts as before (the origin's answer). */
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import HTMLRewriter from './htmlrewriter-shim.mjs';
import worker from '../src/index.js';
import { isEtcCopyPath, etcCopyPath } from '../src/digitalhangar.js';

globalThis.HTMLRewriter = HTMLRewriter;

const FONT = '/etc.clientlibs/swissstoryhub/clientlibs/clientlib-site/resources/fonts/Pensum-Pro-Regular';
const env = {
  ORIGIN: 'main--lh-com--moved-permanently.aem.live',
  WWW_HOST: 'www.lufthansa.com',
  SITE_HOSTS: 'swiss.example=swiss; swiss-cn.example=swiss; ita.example=ita',
  SITE_ORIGINS: 'swiss=main--lh-swiss--moved-permanently.aem.live; ita=main--lh-ita--moved-permanently.aem.live',
  SITE_WWW_HOSTS: 'swiss=www.swiss.com; ita=www.ita-airways.com',
  SITE_DESIGN_HOSTS: 'swiss=www.lufthansa.com; ita=www.ita-airways.com',
  ALIAS_HOSTS: 'swiss-cn.example',
};
let calls;
let copies;
beforeEach(() => {
  calls = [];
  copies = new Set([`${etcCopyPath(`${FONT}.woff2`)}`, `${etcCopyPath(`${FONT}.woff`)}`]);
  globalThis.fetch = async (input, init = {}) => {
    const req = input instanceof Request ? input : new Request(input, init);
    calls.push({ url: req.url, method: req.method });
    const u = new URL(req.url);
    if (u.hostname === 'main--lh-swiss--moved-permanently.aem.live' && copies.has(u.pathname)) {
      const type = u.pathname.endsWith('.woff2') ? 'font/woff2' : 'font/woff';
      return new Response(req.method === 'HEAD' ? null : `bytes of ${u.pathname.split('/').pop()}`, { headers: { 'content-type': type, 'cache-control': 'max-age=7200', 'set-cookie': 'x=1' } });
    }
    return new Response('<html>origin</html>', { status: 404, headers: { 'content-type': 'text/html' } });
  };
});
const get = (host, path, method = 'GET') => worker.fetch(new Request(`https://${host}${path}`, { method }), env, { waitUntil() {} });

test('the two font paths, nothing else', () => {
  assert.equal(isEtcCopyPath(`${FONT}.woff2`), true);
  assert.equal(isEtcCopyPath(`${FONT}.woff`), true);
  assert.equal(isEtcCopyPath(`${FONT}.ttf`), false);
  assert.equal(isEtcCopyPath('/etc.clientlibs/swissstoryhub/clientlibs/clientlib-site.75aa8d3c1e405044e292889dd29789ae.css'), false);
  assert.equal(etcCopyPath(`${FONT}.woff2`), '/etc.clientlibs-copies/swissstoryhub/clientlibs/clientlib-site/resources/fonts/Pensum-Pro-Regular.woff2');
});

test('SWISS\'s host: the font from our copy on its origin, www not asked', async () => {
  const check = async (ext) => {
    calls = [];
    const r = await get('swiss.example', `${FONT}.${ext}`);
    assert.equal(r.status, 200, ext);
    assert.equal(await r.text(), `bytes of Pensum-Pro-Regular.${ext}`);
    assert.equal(r.headers.get('content-type'), ext === 'woff2' ? 'font/woff2' : 'font/woff');
    assert.equal(r.headers.get('x-lh-edge-route'), 'etc-clientlibs');
    assert.equal(r.headers.get('x-lh-edge-copy'), 'origin');
    assert.equal(r.headers.get('set-cookie'), null);
    assert.deepEqual(calls.map((c) => new URL(c.url).hostname), ['main--lh-swiss--moved-permanently.aem.live']);
    assert.equal(new URL(calls[0].url).pathname, etcCopyPath(`${FONT}.${ext}`));
  };
  await check('woff2');
  await check('woff');
});

test('the alias host the same; HEAD without a body', async () => {
  const r = await get('swiss-cn.example', `${FONT}.woff2`, 'HEAD');
  assert.equal(r.status, 200);
  assert.equal(r.body, null);
  assert.equal(r.headers.get('x-lh-edge-route'), 'etc-clientlibs');
});

test('no copy: 404, www not asked', async () => {
  copies.clear();
  const r = await get('swiss.example', `${FONT}.woff2`);
  assert.equal(r.status, 404);
  assert.equal(r.headers.get('x-lh-edge-route'), 'etc-clientlibs');
  assert.ok(calls.every((c) => !new URL(c.url).hostname.startsWith('www.')));
});

test('other sites and other /etc.clientlibs/ paths: not this route', async () => {
  const ita = await get('ita.example', `${FONT}.woff2`);
  assert.notEqual(ita.headers.get('x-lh-edge-route'), 'etc-clientlibs');
  const css = await get('swiss.example', '/etc.clientlibs/swissstoryhub/clientlibs/clientlib-site.css');
  assert.notEqual(css.headers.get('x-lh-edge-route'), 'etc-clientlibs');
  assert.ok(calls.every((c) => !new URL(c.url).pathname.startsWith('/etc.clientlibs-copies/')), 'no copy asked for them');
});
