/* Where a demo host's / goes (scripts/scripts.js loadPage, scripts/locale.js rootRedirectPath):
   lh-com's German homepage as before; a brand with <cc>/<ll> roots its first language version's
   homepage, the target of lh-edge's entry redirect for / (src/sites.js SITES, versions); a brand
   without roots none (Air Dolomiti: its homepage is the document /index at /; Cargo: its hosts
   answer / with a redirect to /en/home before any page code runs, unchanged).
   Run: node --max-old-space-size=512 --test test/root-redirect.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';
import { rootRedirectPath } from '../scripts/locale.js';
import { BRAND_SITES } from '../scripts/brands.js';
// eslint-disable-next-line import/no-relative-packages
import { SITES } from '../tools/workers/lh-edge/src/sites.js';

const read = (meta) => (name) => (meta[name] || '');

test('lh-com (no brand, an unknown brand): /de/de/homepage, as before', () => {
  assert.equal(rootRedirectPath(read({})), '/de/de/homepage');
  assert.equal(rootRedirectPath(read({ brand: 'lufthansa' })), '/de/de/homepage');
});

test('a brand with roots: its first language version\'s homepage, as lh-edge\'s entry redirect', () => {
  assert.equal(rootRedirectPath(read({ brand: 'discover' })), '/de/en/homepage');
  assert.equal(rootRedirectPath(read({ brand: 'ita' })), '/it/en/homepage');
  assert.equal(rootRedirectPath(read({ brand: 'austrian' })), '/at/en/homepage');
  Object.keys(BRAND_SITES).forEach((brand) => {
    // lh-edge src/index.js siteRespond: / to `/${Object.values(site.tables.versions)[0]}/homepage`
    const edge = `/${Object.values(SITES[brand].versions)[0]}/homepage`;
    assert.equal(rootRedirectPath(read({ brand })), edge, brand);
  });
});

test('a brand without roots: no redirect (Air Dolomiti\'s / is its homepage; Cargo\'s hosts redirect /)', () => {
  assert.equal(rootRedirectPath(read({ brand: 'airdolomiti' })), '');
  assert.equal(rootRedirectPath(read({ brand: 'cargo' })), '');
});

test('loadPage redirects / only to rootRedirectPath, only when it names one', () => {
  const src = fs.readFileSync('scripts/scripts.js', 'utf8');
  const body = src.slice(src.indexOf('async function loadPage()'), src.indexOf('loadPage();'));
  assert.ok(!body.includes("'/de/de/homepage"), 'no fixed target in loadPage');
  assert.ok(!body.includes('`/de/de/homepage'), 'no fixed target in loadPage');
  assert.ok(/const home = rootRedirectPath\(\);/.test(body), 'the target from rootRedirectPath');
  assert.ok(/if \(home && window\.location\.pathname === '\/'/.test(body), 'only when there is one');
});

test('the page\'s metadata decides (a brand 404 page gets its brand from /metadata.json first)', () => {
  const { document } = parseHTML('<!DOCTYPE html><html><head><meta name="brand" content="Discover"></head><body></body></html>');
  globalThis.document = document;
  try {
    assert.equal(rootRedirectPath(), '/de/en/homepage');
  } finally {
    delete globalThis.document;
  }
  assert.equal(rootRedirectPath(), '/de/de/homepage', 'no page: lh-com');
});
