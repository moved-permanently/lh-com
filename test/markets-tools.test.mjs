/* eslint-disable max-len, import/extensions -- dev tooling */
/* The market tools of choice B (tools/markets): the `markets` seed, the route check's helpers,
   the root documents' link rules. Run: node --test test/*.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  seed, withMarketsRow, marketsOf, marketsValue, isIndexedPath,
} from '../tools/markets/seed-markets.mjs';
import { wwwPaths, reason } from '../tools/markets/check-market-route.mjs';
import { rootMap, ownRootLinks } from '../tools/markets/root-docs.mjs';
import { batches, ownPages, homepageFacts } from '../tools/markets/rollout.mjs';

test('rollout: batches of about 10 countries (only en and de first), a small remainder joins the batch before', () => {
  const r = (root) => ({
    root, cc: root.slice(0, 2), ll: root.slice(3), ownSitemap: true,
  });
  const roots = ['de/en', 'de/de', 'at/de', 'at/en', 'aa/en', 'bb/de', 'cc/en', 'cc/fr', 'dd/en', 'dd/de', 'dd/es'].map(r);
  const table = {
    'de/en': {}, 'de/de': {}, 'at/de': {}, 'aa/en': { batch: 1 },
  };
  const b = batches(roots, table, 2);
  assert.deepEqual(b.map((x) => x.roots), [['aa/en', 'at/en', 'bb/de'], ['cc/en', 'dd/de', 'dd/en']]);
});

test('rollout: own pages without AEM configuration pages, stale-file URLs and test pages', () => {
  const o = ownPages('xy/en', { 'xy/en': [['/xy/en/local-page/offer', 'x'], ['/xy/en/configuration/seo-pages/a', 'x'], ['/xy/en/old', 'x'], ['/xy/en/testLTS', 'x'], ['/xy/en/test-page', 'x']] }, { urlsOnlyInStaleFiles: ['/xy/en/old'] });
  assert.deepEqual(o.keep, ['/xy/en/local-page/offer']);
  assert.deepEqual(o.left.map((x) => x.why), ['AEM configuration page', 'only in a stale sitemap file', 'test page', 'test page']);
});

test('rollout: homepage facts: the label of www, the preselected origin (else the fare teaser origin), the currency of the prices', () => {
  const dcep = (o) => `data-dcep="${JSON.stringify(o).replace(/"/g, '&quot;')}"`;
  const html = `<span class="country-language-text">Dänemark | Deutsch</span><div ${dcep({ preselectedOrigin: '' })}></div>
    <div ${dcep({ fareTeaserManualTravels: [{ origin: 'CPH' }, { origin: 'CPH' }] })}></div><a href="/x?OriginCode=AAL">a</a><a href="/y?OriginCode=AAL">b</a>
    <a aria-label="nach Rom ab 99 DKK">Rom</a><span>ab 120&nbsp;DKK</span><span>EUR 5</span>`;
  assert.deepEqual(homepageFacts(html), { label: 'Dänemark | Deutsch', airport: 'CPH', currency: 'DKK' });
  assert.deepEqual(homepageFacts('<span class="country-language-skeleton"></span>'), { label: null, airport: null, currency: null });
});

const ROOTS = ['de/en', 'gb/en', 'ch/en', 'at/en', 'us/en'].map((root) => ({ root, ll: 'en', ownSitemap: true }));
const g = (paths) => ({ paths });

test('seed: pages most markets of the language lack get an include list, the rest is left alone', () => {
  const r = seed({
    langRoot: 'de/en',
    pages: ['/de/en/everywhere', '/de/en/germany-only', '/de/en/two', '/de/en/new-page', '/de/en/local', '/de/en/nav', '/de/en/x/confirmation', '/de/en/set'],
    roots: ROOTS,
    groups: [
      g({
        'de/en': '/de/en/everywhere', 'gb/en': '/gb/en/everywhere', 'ch/en': '/ch/en/everywhere', 'at/en': '/at/en/everywhere',
      }),
      g({ 'de/en': '/de/en/germany-only' }),
      g({ 'de/en': '/de/en/two', 'at/en': '/at/en/two-other-slug' }),
      g({ 'de/en': '/de/en/set' }),
    ],
    marketOnly: { 'de/en': [['/de/en/local', '2026-10-01']] },
    existing: (p) => (p === '/de/en/set' ? 'de, ch' : ''),
  });
  assert.equal(r.markets, 4);
  assert.deepEqual(r.pages.map((p) => [p.path, p.value]), [['/de/en/germany-only', 'de'], ['/de/en/two', 'de, at'], ['/de/en/local', 'de']]);
  assert.deepEqual(r.unknown, ['/de/en/new-page']);
  assert.deepEqual(r.kept, ['/de/en/set']);
  assert.equal(marketsValue(['ch', 'de', 'at', 'ch'], 'de'), 'de, at, ch');
  assert.ok(!isIndexedPath('/de/en/support/search/x', 'de/en'));
  assert.ok(isIndexedPath('/de/en/baggage', 'de/en'));
});

test('seed: the Markets row goes at the end of the metadata block; read back as it is', () => {
  const doc = '<div><p>x</p></div><div><div class="metadata"><div><div>Title</div><div>T</div></div><div><div>Parent</div><div><a href="/de/en/homepage">/de/en/homepage</a></div></div></div></div>';
  const next = withMarketsRow(doc, 'de, at');
  assert.equal(next, doc.replace('</div></div></div></div>', '</div></div><div><div>Markets</div><div>de, at</div></div></div></div>'));
  assert.equal(marketsOf(next), 'de, at');
  assert.equal(marketsOf('<div><div><p>Markets</p></div><div><p>-ch</p></div></div>'), '-ch');
  assert.equal(marketsOf(doc), '');
  assert.equal(withMarketsRow('<div><p>no metadata</p></div>', 'de'), null);
});

test('route check: www\'s paths of a root (lists in groups too) and the reason for a 404', () => {
  const paths = wwwPaths('ch/en', [g({ 'ch/en': '/ch/en/a' }), g({ 'ch/en': ['/ch/en/343', '/ch/en/34p'] }), g({ 'de/en': '/de/en/b' })], { 'ch/en': [['/ch/en/own', 'x']] });
  assert.deepEqual(paths, ['/ch/en/343', '/ch/en/34p', '/ch/en/a', '/ch/en/own']);
  const docs = { '/de/en/x': '<div></div>', '/de/en/g': '<div><div>Markets</div><div>de</div></div>' };
  const has = (p) => Boolean(docs[p]);
  const read = (p) => docs[p];
  assert.equal(reason('/ch/en/missing', 'ch/en', has, read), 'no de/en document');
  assert.equal(reason('/ch/en/profile/x', 'ch/en', has, read), 'login or profile (left alone)');
  assert.equal(reason('/ch/en/g', 'ch/en', has, read), 'markets de');
});

test('root documents: a group with two URLs of the target maps to the same path; unserved own-root links stay on www', () => {
  const map = rootMap('de/de', 'ch/de', [g({ 'de/de': ['/de/de/flights', '/de/de/fluege'], 'ch/de': ['/ch/de/flights', '/ch/de/fluege'] }), g({ 'de/de': '/de/de/gepaeck', 'ch/de': '/ch/de/baggage' })]);
  assert.equal(map.paths['/de/de/fluege'], '/ch/de/fluege');
  assert.equal(map.paths['/de/de/flights'], '/ch/de/flights');
  assert.equal(map.paths['/de/de/gepaeck'], '/ch/de/baggage');
  const html = '<a href="https://www.lufthansa.com/ch/en/baggage">a</a><a href="/ch/en/payment-options">b</a><a href="https://www.lufthansa.com/ch/en/gone?x=1">c</a>';
  const r = ownRootLinks(html, 'ch/en', (p) => p === '/ch/en/baggage');
  assert.equal(r.html, '<a href="/ch/en/baggage">a</a><a href="https://www.lufthansa.com/ch/en/payment-options">b</a><a href="https://www.lufthansa.com/ch/en/gone?x=1">c</a>');
  assert.deepEqual(r.links, ['/ch/en/baggage']);
  assert.deepEqual(r.kept.sort(), ['/ch/en/gone', '/ch/en/payment-options']);
});
