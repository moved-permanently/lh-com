/* eslint-disable max-len, import/extensions */
/* The loc tools with either translation setup, read from the languages rows of the translate.json
   they are given (tools/loc/setup-lib.mjs): today's rows (tools/loc/translate.json: /de/en source,
   /de/de German, rollouts /gb/en and /at/de) and the global source (brief 250, the fixture
   test/fixtures/loc/translate-gc.json: /gc/en source, /gc/de German, English rollout to /de/en and
   /gb/en, German rollout to /de/de and /at/de). The link step's pairs and the slug step's paths
   follow the rows; /gc/<ll> paths are the pages.csv de_<ll> row's with the market replaced (own
   German slugs included). A fake DA, no network.
   Run: node --max-old-space-size=512 --test test/loc-gc-setup.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import { locSetup, readConfig } from '../tools/loc/setup-lib.mjs';
import {
  pairMap, localizeHref, localizeDoc, localePath,
} from '../tools/loc/link-lib.mjs';
import { runLinkStep } from '../tools/loc/link-step.mjs';
import {
  translationPath, germanPath, germanize, plan, rolloutUrls,
} from '../tools/loc/slug-lib.mjs';
import { runStep } from '../tools/loc/slug-step.mjs';
import { checkPairs } from '../tools/loc/marker-check.mjs';
import { scopeRows } from '../tools/loc/regional-diff.mjs';

const read = (u) => JSON.parse(fs.readFileSync(new URL(u, import.meta.url), 'utf8'));
const TODAY = read('../tools/loc/translate.json');
const GC = read('./fixtures/loc/translate-gc.json');
const GC_FILE = new URL('./fixtures/loc/translate-gc.json', import.meta.url).pathname;
const MAP = read('../tools/loc/slug-map.json');
const ROWS = scopeRows();

test('setup from today\'s rows: source de/en, the three pairs as before', () => {
  const s = locSetup(TODAY);
  assert.equal(s.source, 'de/en');
  assert.deepEqual(s.pairs, { 'de/en>gb/en': 'rollout', 'de/de>at/de': 'rollout', 'de/en>de/de': 'translation' });
  assert.deepEqual(s.translation, { from: 'de/en', to: 'de/de', locales: ['at/de'] });
  assert.equal(s.global, false);
});

test('setup from the gc rows: source gc/en, four rollouts and the translation', () => {
  const s = locSetup(GC);
  assert.equal(s.source, 'gc/en');
  assert.deepEqual(s.pairs, {
    'gc/en>de/en': 'rollout', 'gc/en>gb/en': 'rollout', 'gc/de>de/de': 'rollout', 'gc/de>at/de': 'rollout', 'gc/en>gc/de': 'translation',
  });
  assert.deepEqual(s.translation, { from: 'gc/en', to: 'gc/de', locales: ['de/de', 'at/de'] });
  assert.equal(s.global, true);
});

test('readConfig: the repo copy by default, a file, DA\'s copy (a read with the login)', async () => {
  assert.equal(locSetup(await readConfig()).source, 'de/en');
  assert.equal(locSetup(await readConfig(GC_FILE)).source, 'gc/en');
  const seen = [];
  const fetchImpl = async (url, opts) => {
    seen.push([url, opts.headers.authorization, opts.method || 'GET']);
    return new Response(JSON.stringify(GC), { status: 200 });
  };
  assert.equal(locSetup(await readConfig('da', { fetchImpl, token: 't0k' })).source, 'gc/en');
  assert.deepEqual(seen, [['https://admin.da.live/source/moved-permanently/lh-com/.da/translate.json', 'Bearer t0k', 'GET']]);
  await assert.rejects(readConfig('da', { fetchImpl: async () => new Response('', { status: 401 }), token: '' }), /DA 401/);
});

test('gc paths from pages.csv: the de_en/de_de row with the market replaced, own slugs included', () => {
  const row = ROWS.find((r) => r.de_en === '/de/en/flights');
  assert.equal(localePath(row, 'gc/en'), '/gc/en/flights');
  assert.equal(localePath(row, 'gc/de'), '/gc/de/fluege');
  assert.equal(localePath(row, 'at/de'), '/at/de/fluege');
  assert.throws(() => localePath(row, 'fr/fr'), /no pages\.csv column/);
  const t = pairMap(ROWS, 'gc/en', 'gc/de');
  assert.equal(t.paths['/gc/en/flight-search'], '/gc/de/flugsuche');
  assert.equal(t.paths['/gc/en'], '/gc/de');
  const de = pairMap(ROWS, 'gc/de', 'de/de');
  assert.equal(de.paths['/gc/de/flugsuche'], '/de/de/flugsuche');
  assert.equal(pairMap(ROWS, 'gc/en', 'gb/en').paths['/gc/en/baggage'], '/gb/en/baggage');
});

const GC_DE_PAGE = `<body><header></header><main><div><h1>Gepäck</h1>
<p><a href="/gc/de/gepaeck">Gepäck</a> <a href="https://main--lh-com--moved-permanently.aem.live/gc/de/flugsuche?x=1">Suche</a> <a href="/gc/en/baggage">English</a> <a href="/gc/de/no-such-page">weg</a></p>
<div class="metadata"><div><div>Parent</div><div><a href="/gc/de/homepage">/gc/de/homepage</a></div></div><div><div>primary-language-url</div><div>/gc/en/baggage</div></div></div></div></main><footer></footer></body>`;

test('rollout gc/de -> de/de: /de/de links, /gc/en links the market\'s English page, primary-language-url /de/en, no /gc left', () => {
  const map = pairMap(ROWS, 'gc/de', 'de/de', { others: ['gc/en'] });
  const doc = localizeDoc(GC_DE_PAGE, map);
  assert.match(doc.html, /href="\/de\/de\/gepaeck"/);
  assert.match(doc.html, /href="\/de\/de\/flugsuche\?x=1"/);
  assert.match(doc.html, /href="\/de\/en\/baggage">English/);
  assert.match(doc.html, /Parent<\/div><div><a href="\/de\/de\/homepage">\/de\/de\/homepage<\/a>/);
  assert.match(doc.html, /<div>primary-language-url<\/div><div>\/de\/en\/baggage<\/div>/);
  assert.deepEqual(doc.unmapped, ['/gc/de/no-such-page']);
  assert.ok(!/href="\/gc\/(en|de)\/(?!no-such-page)/.test(doc.html), 'only the unmapped link keeps /gc');
  assert.equal(localizeDoc(doc.html, map).links, 0, 'a second run changes nothing');
});

test('rollout gc/de -> at/de: /at/de links; a /gc/en link has no at/en page: left and listed; primary-language-url /de/en', () => {
  const map = pairMap(ROWS, 'gc/de', 'at/de', { others: ['gc/en'] });
  const doc = localizeDoc(GC_DE_PAGE, map);
  assert.match(doc.html, /href="\/at\/de\/gepaeck"/);
  assert.match(doc.html, /href="\/gc\/en\/baggage">English/);
  assert.deepEqual(doc.unmapped, ['/gc/de/no-such-page', '/gc/en/baggage']);
  assert.match(doc.html, /<div>primary-language-url<\/div><div>\/de\/en\/baggage<\/div>/);
});

test('rollout gc/en -> de/en and gb/en; the translation gc/en -> gc/de keeps the gc tree', () => {
  assert.equal(localizeHref('/gc/en/flight-search', pairMap(ROWS, 'gc/en', 'de/en')), '/de/en/flight-search');
  assert.equal(localizeHref('https://lufthansa.turnsthe.page/gc/en/baggage', pairMap(ROWS, 'gc/en', 'gb/en')), '/gb/en/baggage');
  assert.equal(localizeHref('https://main--lh-com--moved-permanently.aem.page/gc/en/flight-search', pairMap(ROWS, 'gc/en', 'gc/de')), '/gc/de/flugsuche');
  const translated = localizeDoc('<body><main><div><div class="metadata"><div><div>primary-language-url</div><div>/gc/en/baggage</div></div></div></div></main></body>', pairMap(ROWS, 'gc/en', 'gc/de'));
  assert.equal(translated.links, 0, 'a gc page keeps its primary-language-url');
});

test('today\'s pairs unchanged: a de/de -> at/de rollout leaves /de/en links alone and reports nothing new', () => {
  const doc = localizeDoc('<body><main><div><p><a href="/de/de/gepaeck">a</a> <a href="/de/en/baggage">b</a></p></div></main></body>', pairMap(ROWS, 'de/de', 'at/de'));
  assert.equal(doc.links, 1);
  assert.deepEqual(doc.unmapped, []);
});

/** An in-memory DA: path -> html; records writes. */
function fakeDa(docs) {
  const calls = [];
  return {
    calls,
    docs,
    get: async (p) => { calls.push(['GET', p]); return docs[p] ?? null; },
    put: async (p, html) => { calls.push(['POST', p]); docs[p] = html; },
    remove: async (p) => { calls.push(['DELETE', p]); delete docs[p]; },
  };
}

test('runLinkStep takes its pairs from the setup: gc pairs with the gc rows, today\'s refused there and vice versa', async () => {
  const gc = locSetup(GC);
  const da = fakeDa({ '/de/de/gepaeck': GC_DE_PAGE });
  const [r] = await runLinkStep({
    from: 'gc/de', to: 'de/de', pages: ['/de/de/gepaeck'], rows: ROWS, da, apply: true, setup: gc,
  });
  assert.equal(r.status, 'written');
  assert.match(da.docs['/de/de/gepaeck'], /href="\/de\/en\/baggage"/);
  await assert.rejects(runLinkStep({
    from: 'de/de', to: 'at/de', pages: [], rows: ROWS, da, setup: gc,
  }), /not a rollout or translation pair of this translate\.json \(gc\/en>de\/en/);
  await assert.rejects(runLinkStep({
    from: 'gc/de', to: 'de/de', pages: [], rows: ROWS, da,
  }), /not a rollout or translation pair/, 'without a setup: today\'s rows (the repo copy)');
});

test('link-step CLI --config: the gc pairs; --apply without --page stops before DA', () => {
  const script = new URL('../tools/loc/link-step.mjs', import.meta.url).pathname;
  const run = (...a) => spawnSync(process.execPath, [script, '--config', GC_FILE, ...a], { encoding: 'utf8', env: { ...process.env, DA_TOKEN: '' } });
  const bare = run('--from', 'gc/de', '--to', 'at/de', '--apply');
  assert.equal(bare.status, 1, bare.stdout + bare.stderr);
  assert.match(bare.stderr, /--apply needs --page \/at\/de\//);
  const old = run('--from', 'de/de', '--to', 'at/de', '--apply', '--page', '/at/de/gepaeck');
  assert.equal(old.status, 1);
  assert.match(old.stderr, /not a rollout or translation pair of this translate\.json/);
});

test('slug step with the gc rows: /gc/en/flights -> /gc/de/fluege; the copy at /gc/de/<english slug>', () => {
  const t = locSetup(GC).translation;
  assert.equal(translationPath('/gc/en/flights', t), '/gc/de/flights');
  assert.equal(germanPath('/gc/en/flights', MAP, t), '/gc/de/fluege');
  assert.equal(germanPath('/gc/en/homepage', MAP, t), undefined, 'same slug');
  assert.equal(germanPath('/de/en/flights', MAP), '/de/de/fluege', 'today\'s rows by default');
  assert.deepEqual(plan('/gc/en/flights', MAP, { copyExists: true, targetExists: false }, t), {
    action: 'move', enPath: '/gc/en/flights', copy: '/gc/de/flights', target: '/gc/de/fluege',
  });
  assert.equal(plan('/gc/en/homepage', MAP, {}, t).action, 'skip-same-slug');
});

test('germanize with the gc rows: /gc/de links, primary-language-url the /de/en page (what the sitemap pairs by)', () => {
  const t = locSetup(GC).translation;
  const html = '<body><main><div><p><a href="https://main--lh-com--moved-permanently.aem.page/gc/en/baggage">b</a></p><div class="metadata"><div><div>Parent</div><div><a href="https://main--lh-com--moved-permanently.aem.page/gc/en/homepage">https://main--lh-com--moved-permanently.aem.page/gc/en/homepage</a></div></div></div></div></main></body>';
  const g = germanize(html, '/gc/en/flights', MAP, t);
  assert.match(g.html, /href="\/gc\/de\/gepaeck"/);
  assert.match(g.html, /Parent<\/div><div><a href="\/gc\/de\/homepage">\/gc\/de\/homepage<\/a>/);
  assert.match(g.html, /<div>primary-language-url<\/div><div>\/de\/en\/flights<\/div>/);
});

test('runStep with the gc rows: reads /gc/de/<english slug>, writes the own slug under /gc/de, deletes the copy', async () => {
  const t = locSetup(GC).translation;
  const da = fakeDa({ '/gc/de/flights': '<body><main><div><p><a href="https://main--lh-com--moved-permanently.aem.page/gc/en/baggage">b</a></p></div></main></body>' });
  const [r] = await runStep({
    pages: ['/gc/en/flights'], map: MAP, da, merge: async () => null, apply: true, translation: t,
  });
  assert.equal(r.action, 'move');
  assert.deepEqual(da.calls.filter(([m]) => m !== 'GET'), [['POST', '/gc/de/fluege'], ['DELETE', '/gc/de/flights']]);
  assert.match(da.docs['/gc/de/fluege'], /href="\/gc\/de\/gepaeck"/);
  await assert.rejects(runStep({
    pages: ['/de/en/flights'], map: MAP, da, merge: async () => null, translation: t,
  }), /\/de\/en\/flights is no \/gc\/en page/);
});

test('marker check with the gc rows: the /gc/en page against /gc/de/<english slug>, then its German page', () => {
  const t = locSetup(GC).translation;
  assert.deepEqual(checkPairs(ROWS, ['/gc/en/flights', '/gc/en/homepage'], t), [
    { source: '/gc/en/flights', targets: ['/gc/de/flights', '/gc/de/fluege'] },
    { source: '/gc/en/homepage', targets: ['/gc/de/homepage'] },
  ]);
  assert.deepEqual(checkPairs(ROWS, ['/de/en/flights']), [{ source: '/de/en/flights', targets: ['/de/de/flights', '/de/de/fluege'] }], 'today\'s rows as before');
  assert.ok(checkPairs(ROWS, [], t).every((p) => p.source.startsWith('/gc/en')));
});

test('rolloutUrls with the gc rows: the /gc/de pages (one German rollout writes /de/de and /at/de)', () => {
  const t = locSetup(GC).translation;
  assert.deepEqual(rolloutUrls(['/gc/en/flights', '/gc/en/homepage'], MAP, t), [
    'https://main--lh-com--moved-permanently.aem.page/gc/de/fluege',
    'https://main--lh-com--moved-permanently.aem.page/gc/de/homepage',
  ]);
  assert.throws(() => rolloutUrls(['/de/en/flights'], MAP, t), /no \/gc\/en page/);
  const script = new URL('../tools/loc/slug-step.mjs', import.meta.url).pathname;
  const r = spawnSync(process.execPath, [script, '--config', GC_FILE, '--rollout-urls', '--page', '/gc/en/flights'], { encoding: 'utf8', env: { ...process.env, DA_TOKEN: '' } });
  assert.equal(r.status, 0, r.stderr);
  assert.equal(r.stdout, 'https://main--lh-com--moved-permanently.aem.page/gc/de/fluege\n');
  assert.match(r.stderr, /German Rollout of these URLs writes \/de\/de and \/at\/de/);
});
