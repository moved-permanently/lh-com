/* eslint-disable max-len */
// A page path with "&" on SWISS's host (src/sites.js AMPERSAND_SITES): www's spelling of a page the
// importer named with "and" (/us/en/local-pages/baggage-&-other-fees ->
// /us/en/local-pages/baggage-and-other-fees, the document's name, swiss-import.mjs docName). aem.live
// answers such a path 404 ("Unsupported characters in path") before it reads the site's redirects,
// so lh-edge sends the 301 (raw "&" or "%26", the query kept); the other sites' paths as before.
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import HTMLRewriter from './htmlrewriter-shim.mjs';
import worker from '../src/index.js';
import { resetMarketCache } from '../src/markets.js';
import { ampersandTarget } from '../src/url-forms.js';

globalThis.HTMLRewriter = HTMLRewriter;

const SWISS = 'main--lh-swiss--moved-permanently.aem.live';
const BRUSSELS = 'main--lh-brussels--moved-permanently.aem.live';
const env = () => ({
  ORIGIN: 'main--lh-com--moved-permanently.aem.live',
  WWW_HOST: 'www.lufthansa.com',
  PILOT_HOSTS: '',
  EDGE_TTL: '60',
  SITE_HOSTS: 'brussels.example=brussels; swiss.example=swiss',
  SITE_ORIGINS: `brussels=${BRUSSELS}; swiss=${SWISS}`,
  SITE_WWW_HOSTS: 'brussels=www.brusselsairlines.com; swiss=www.swiss.com',
});
let calls;
beforeEach(() => {
  resetMarketCache();
  calls = [];
  globalThis.fetch = async (input, init = {}) => {
    const req = input instanceof Request ? input : new Request(input, init);
    calls.push(new URL(req.url).pathname);
    return new Response('<html>404</html>', { status: 404, headers: { 'content-type': 'text/html' } });
  };
});
const get = (url) => worker.fetch(new Request(url), env(), { waitUntil() {} });

test('ampersandTarget: a page path\'s "&" (raw or %26) as the importer names it ("-and-", one hyphen between words); none in the path: null', () => {
  assert.equal(ampersandTarget(new URL('https://x/us/en/local-pages/baggage-&-other-fees')), '/us/en/local-pages/baggage-and-other-fees');
  assert.equal(ampersandTarget(new URL('https://x/us/en/local-pages/baggage-%26-other-fees?a=1')), '/us/en/local-pages/baggage-and-other-fees?a=1');
  assert.equal(ampersandTarget(new URL('https://x/us/en/local-pages/rock&roll')), '/us/en/local-pages/rock-and-roll');
  assert.equal(ampersandTarget(new URL('https://x/us/en/local-pages/baggage-and-other-fees')), null);
  // not a page path (files, the code, DAM): as before
  assert.equal(ampersandTarget(new URL('https://x/content/dam/lx/a&b.jpg')), null);
  assert.equal(ampersandTarget(new URL('https://x/us/en/a&b.pdf')), null);
});

test('swiss: /us/en/local-pages/baggage-&-other-fees is a 301 to the document\'s path, without asking the origin', async () => {
  const answers = await Promise.all(['/us/en/local-pages/baggage-&-other-fees', '/us/en/local-pages/baggage-%26-other-fees']
    .map((path) => get(`https://swiss.example${path}`)));
  answers.forEach((resp) => {
    assert.equal(resp.status, 301);
    assert.equal(resp.headers.get('location'), '/us/en/local-pages/baggage-and-other-fees');
  });
  assert.equal(calls.length, 0);
});

test('another site\'s path with "&": as before (the origin answers)', async () => {
  const resp = await get('https://brussels.example/be/en/a-&-b');
  assert.equal(resp.status === 404 && calls.length > 0, true);
});
