/* eslint-disable max-len */
/* Lufthansa Cargo's old article addresses (/<lang>/-/<url title>, Liferay's) that aem.live refuses
   before it reads lh-cargo's /redirects sheet: German titles with umlauts or „ quotes (%-escapes:
   "Unsupported characters in path", 111), two with a trailing dot ("invalid path") and three German
   ones with a double slash (400). lh-edge answers them on the Cargo host (src/url-forms.js
   cargoArticleTarget, src/cargo-articles.js): the title decoded, tools/importer/cargo-paths.mjs's
   slug, 301 to /<lang>/news/<slug> when the site's index has that page, else for de the English
   /en/news/<slug> when that exists, else the path as it is (the sheet's other 630 stay the
   sheet's, collisions included). */
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import HTMLRewriter from './htmlrewriter-shim.mjs';
import worker from '../src/index.js';
import { cargoSlug, cargoArticleTarget } from '../src/url-forms.js';
// eslint-disable-next-line import/no-relative-packages -- the importer's rule, the one to match
import { slug as importerSlug } from '../../../importer/cargo-paths.mjs';

globalThis.HTMLRewriter = HTMLRewriter;

const CARGO = 'main--lh-cargo--moved-permanently.aem.live';
const ROWS = JSON.parse(fs.readFileSync(new URL('../../../importer/cargo-redirects.json', import.meta.url), 'utf8'));
// the sheet's rows aem.live refuses: a non-ASCII title (%-escaped) or a trailing dot
const REFUSED = ROWS.filter((r) => /%[0-9A-F]{2}/i.test(r.Source) || r.Source.endsWith('.'));
const DOUBLE = ['/de/-//de/it-does-fly-54', '/de/-//de/cool-cooler-opticooler-9', '/de/-//de/continent-of-opportunities-21'];
// the two German articles without a page (Änderungen im Vorstand … 2018, Ökoglobe-Preis: no row
// in the sheet, no document): addresses of their shape, in neither index
const NO_PAGE = ['/de/-/%C3%84nderungen-im-vorstand-von-lufthansa-cargo-2018', '/de/-/%C3%96koglobe-preis-f%C3%BCr-lufthansa-cargo'];

const env = () => ({
  ORIGIN: 'main--lh-com--moved-permanently.aem.live',
  WWW_HOST: 'www.lufthansa.com',
  SITE_HOSTS: 'cargo.turnsthe.page=cargo',
  SITE_ORIGINS: `cargo=${CARGO}`,
  SITE_WWW_HOSTS: 'cargo=www.lufthansa-cargo.com',
  SITE_DESIGN_HOSTS: 'cargo=www.lufthansa.com',
});
// the site's indexes: every Destination of the sheet; the double-slash slugs in English only
const indexOf = (lang) => {
  const paths = ROWS.map((r) => r.Destination).filter((p) => p.startsWith(`/${lang}/news/`));
  if (lang === 'en') paths.push('/en/news/it-does-fly-54', '/en/news/cool-cooler-opticooler-9', '/en/news/continent-of-opportunities-21');
  return {
    total: paths.length, offset: 0, limit: paths.length, data: paths.map((path) => ({ path })), ':type': 'sheet',
  };
};
let calls;
beforeEach(() => {
  calls = [];
  globalThis.fetch = async (input, init = {}) => {
    const req = input instanceof Request ? input : new Request(input, init);
    const u = new URL(req.url);
    calls.push(`${u.hostname}${u.pathname}`);
    if (u.hostname === CARGO) {
      const idx = u.pathname.match(/^\/(en|de)\/search-index\.json$/);
      if (idx) return Response.json(indexOf(idx[1]));
      if (u.pathname === '/metadata.json') return Response.json({ total: 0, data: [], ':type': 'sheet' });
      return new Response('<html>404</html>', { status: 404, headers: { 'content-type': 'text/html' } });
    }
    return new Response('other', { status: 200 });
  };
});
const get = (path, method = 'GET') => worker.fetch(new Request(`https://cargo.turnsthe.page${path}`, { method, redirect: 'manual' }), env(), { waitUntil() {} });

test('cargoSlug: tools/importer/cargo-paths.mjs\'s slug (decoded, German letters spelled out, other accents dropped, anything else a hyphen, none at either end)', () => {
  ['%E2%80%9Emehr-logistik-mit-weniger-co2', 'lufthansa-cargo-gr%C3%BC%C3%9Ft-kanada-mit-%E2%80%9Ehello-bonjour-canada-.', '129.-check-in-for-freight.', 'Caf%C3%A9-cr%C3%A8me', '_x_'].forEach((t) => {
    assert.equal(cargoSlug(t), importerSlug(t), t);
  });
  assert.equal(cargoSlug('lufthansa-cargo-gr%C3%BC%C3%9Ft-kanada-mit-%E2%80%9Ehello-bonjour-canada-.'), 'lufthansa-cargo-gruesst-kanada-mit-hello-bonjour-canada');
});

test('cargoArticleTarget: only the article paths aem.live refuses (%-escapes, a trailing dot, a double slash); a leading de/ dropped', () => {
  const t = (p) => cargoArticleTarget(new URL(`https://cargo.turnsthe.page${p}`));
  assert.deepEqual(t('/de/-/%E2%80%9Eni-hao-china-lufthansa-cargo-schickt-neue-boeing-777f-t%C3%A4glich-nach-schanghai'), { lang: 'de', slug: 'ni-hao-china-lufthansa-cargo-schickt-neue-boeing-777f-taeglich-nach-schanghai' });
  assert.deepEqual(t('/en/-/129.-check-in-for-freight.'), { lang: 'en', slug: '129-check-in-for-freight' });
  assert.deepEqual(t('/de/-/10-jahre-cargo-human-care-e.v.'), { lang: 'de', slug: '10-jahre-cargo-human-care-e-v' });
  assert.deepEqual(t('/de/-//de/it-does-fly-54'), { lang: 'de', slug: 'it-does-fly-54' });
  // the sheet answers these (collisions included: /en/-/ver-di-trade-union-strike's twin)
  assert.equal(t('/en/-/be-bold-for-logistic-innovation'), null);
  assert.equal(t('/en/-/-be-bold-for-logistic-innovation-'), null);
  assert.equal(t('/en/news/129-check-in-for-freight'), null);
  assert.equal(t('/fr/-/t%C3%A4glich'), null, 'Cargo\'s two languages only');
});

test('the sheet\'s 114 rows the rule takes: its target is the sheet\'s Destination (111 with %-escapes, 3 more with a trailing dot: two aem.live refuses, the third, china-post-…-bekannt., it answers from the sheet, to the same page)', () => {
  assert.equal(REFUSED.length, 114);
  assert.equal(REFUSED.filter((r) => /%[0-9A-F]{2}/i.test(r.Source)).length, 111);
  REFUSED.forEach((r) => {
    const a = cargoArticleTarget(new URL(`https://cargo.turnsthe.page${r.Source}`));
    assert.ok(a, r.Source);
    assert.equal(`/${a.lang}/news/${a.slug}`, r.Destination, r.Source);
  });
});

test('the worker: 301 to the version\'s page, else de to the English one, else the path as it is; the query kept', async () => {
  await Promise.all(REFUSED.map(async (r) => {
    const resp = await get(r.Source);
    assert.equal(resp.status, 301, r.Source);
    assert.equal(resp.headers.get('location'), r.Destination, r.Source);
    assert.equal(resp.headers.get('x-lh-edge-route'), 'cargo-article');
  }));
  await Promise.all(NO_PAGE.map(async (p) => {
    const resp = await get(p);
    assert.equal(resp.status, 404, `${p}: no page in either index, the path as it is`);
  }));
  await Promise.all(DOUBLE.map(async (p) => {
    const resp = await get(p);
    assert.equal(resp.status, 301, p);
    assert.equal(resp.headers.get('location'), p.replace(/^\/de\/-\/\/de\//, '/en/news/'), `${p}: the English page (no German one)`);
  }));
  const q = await get('/en/-/129.-check-in-for-freight.?utm_source=x');
  assert.equal(q.headers.get('location'), '/en/news/129-check-in-for-freight?utm_source=x');
  const head = await get('/de/-/10-jahre-cargo-human-care-e.v.', 'HEAD');
  assert.equal(head.status, 301);
});

test('the worker: an article path the sheet answers is passed through, no index read', async () => {
  calls = [];
  const resp = await get('/en/-/be-bold-for-logistic-innovation');
  assert.equal(resp.status, 404, 'the origin\'s answer (aem.live reads its sheet there)');
  assert.ok(!calls.some((c) => c.includes('search-index')), 'no index read');
});
