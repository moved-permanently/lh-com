/* eslint-disable max-len, import/extensions */
/* The regional differences (tools/loc/regional-diff.mjs) with either translation setup
   (setup-lib.mjs): today's rows compare /at/de against /de/de and /gb/en against /de/en, as before
   (the same pairs, normalisation and report files); the global source's rows
   (test/fixtures/loc/translate-gc.json) compare every rollout pair against the gc tree: /de/en and
   /gb/en against /gc/en, /de/de and /at/de against /gc/de (own slugs from pages.csv). The gc tree is
   the de market's documents with their relative links under /gc (www.lufthansa.com links, media and
   query values keep de: /gc/de/gepaeck in DA, 2026-11-02), so a market page's relative
   /<cc>/<ll>/ counts as /gc/<ll>/ and its market elsewhere as de. A fake DA, no network.
   Run: node --max-old-space-size=512 --test test/loc-regional-diff.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { locSetup } from '../tools/loc/setup-lib.mjs';
import {
  regionalPairs, normalizeUrl, digest, compare, run, report, readPages, reportName,
} from '../tools/loc/regional-diff.mjs';

const read = (u) => JSON.parse(fs.readFileSync(new URL(u, import.meta.url), 'utf8'));
const TODAY = locSetup(read('../tools/loc/translate.json'));
const GC = locSetup(read('./fixtures/loc/translate-gc.json'));
const byName = (pairs) => Object.fromEntries(pairs.map((p) => [p.name, p]));

test('today\'s rows: the two pairs of today\'s report, in its order', () => {
  assert.deepEqual(regionalPairs(TODAY).map(({
    name, from, to, cc, global,
  }) => ({
    name, from, to, cc, global,
  })), [
    {
      name: 'at/de vs de/de', from: 'de/de', to: 'at/de', cc: ['de', 'at'], global: false,
    },
    {
      name: 'gb/en vs de/en', from: 'de/en', to: 'gb/en', cc: ['de', 'gb'], global: false,
    },
  ]);
});

test('the gc rows: every rollout pair against the gc tree; the tree\'s market de', () => {
  const pairs = regionalPairs(GC);
  assert.deepEqual(pairs.map((p) => p.name), ['at/de vs gc/de', 'de/de vs gc/de', 'de/en vs gc/en', 'gb/en vs gc/en']);
  pairs.forEach((p) => {
    assert.equal(p.global, true);
    assert.equal(p.cc[0], 'de');
  });
});

test('normalizeUrl with today\'s rows: as before', () => {
  const at = byName(regionalPairs(TODAY))['at/de vs de/de'];
  const gb = byName(regionalPairs(TODAY))['gb/en vs de/en'];
  assert.equal(normalizeUrl('/at/de/gepaeck', at), '/de/de/gepaeck');
  assert.equal(normalizeUrl('https://main--lh-com--moved-permanently.aem.live/at/de/gepaeck', at), '/de/de/gepaeck');
  assert.equal(normalizeUrl('https://www.lufthansa.com/at/de/travel-briefing?country=AT', at), 'https://www.lufthansa.com/de/de/travel-briefing?country=DE');
  assert.equal(normalizeUrl('/content/lh/markets/at/de/x.pdf', at), '/content/lh/markets/de/de/x.pdf');
  assert.equal(normalizeUrl('https://x.example/y?market=at', at), 'https://x.example/y?market=de');
  assert.equal(normalizeUrl('/content/dam/lh/images/at_de.jpg', at), '/content/dam/lh/images/de_de.jpg');
  assert.equal(normalizeUrl('/de/en/baggage', at), '/de/en/baggage', 'other languages stay (as before)');
  assert.equal(normalizeUrl('/gb/en/baggage?x=1', gb), '/de/en/baggage?x=1');
});

test('normalizeUrl with the gc rows: relative market paths count as /gc/<ll>, www/media/query markets as de', () => {
  const p = byName(regionalPairs(GC));
  const at = p['at/de vs gc/de'];
  const de = p['de/de vs gc/de'];
  const gb = p['gb/en vs gc/en'];
  assert.equal(normalizeUrl('/at/de/gepaeck', at), '/gc/de/gepaeck');
  assert.equal(normalizeUrl('/de/de/gepaeck', de), '/gc/de/gepaeck');
  assert.equal(normalizeUrl('/gc/de/gepaeck', de), '/gc/de/gepaeck', 'the source\'s own prefix');
  assert.equal(normalizeUrl('/de/en/baggage#x', de), '/gc/en/baggage#x', 'the market\'s other language: the gc tree\'s');
  assert.equal(normalizeUrl('/de/en/baggage', at), '/gc/en/baggage', 'an /at/de page\'s /de/en link: the tree has /gc/en there');
  assert.equal(normalizeUrl('/fr/fr/x', at), '/fr/fr/x', 'other markets stay');
  assert.equal(normalizeUrl('https://main--lh-com--moved-permanently.aem.page/at/de/gepaeck', at), '/gc/de/gepaeck');
  assert.equal(normalizeUrl('https://www.lufthansa.com/at/de/travel-briefing?country=AT', at), 'https://www.lufthansa.com/de/de/travel-briefing?country=DE');
  assert.equal(normalizeUrl('https://www.lufthansa.com/de/de/travel-briefing', de), 'https://www.lufthansa.com/de/de/travel-briefing');
  assert.equal(normalizeUrl('/content/lh/markets/at/de/x.pdf', at), '/content/lh/markets/de/de/x.pdf');
  assert.equal(normalizeUrl('/content/dam/lh/images/at_de.jpg', at), '/content/dam/lh/images/de_de.jpg');
  assert.equal(normalizeUrl('/gb/en/baggage', gb), '/gc/en/baggage');
  assert.equal(normalizeUrl('https://www.lufthansa.com/gb/en/flights?country=GB', gb), 'https://www.lufthansa.com/de/en/flights?country=DE');
});

const doc = (main) => `<body><header></header><main>${main}</main><footer></footer></body>`;
const GC_DE = doc('<div><h1>Gepäck</h1><p>Mehr unter <a href="/gc/de/freigepaeck-regeln">Freigepäck</a> und <a href="https://www.lufthansa.com/de/de/travel-briefing">Travel briefing</a>.</p><p><a href="/gc/en/baggage">English</a></p><picture><img src="https://www.lufthansa.com/content/dam/lh/images/a.jpg"></picture><div class="metadata"><div><div>Parent</div><div><a href="/gc/de/homepage">/gc/de/homepage</a></div></div></div></div>');
const DE_DE = GC_DE.replace(/href="\/gc\//g, 'href="/de/');
const AT_DE = DE_DE.replace(/href="\/de\/de\//g, 'href="/at/de/').replace('www.lufthansa.com/de/de/', 'www.lufthansa.com/at/de/').replace('<a href="/de/en/baggage">English</a>', '<a href="/de/en/baggage">English</a> Österreich');

test('digest and compare with the gc rows: the market copy of a gc page is identical; a market edit shows', () => {
  const p = byName(regionalPairs(GC));
  assert.deepEqual(compare(digest(GC_DE, p['de/de vs gc/de']), digest(DE_DE, p['de/de vs gc/de'])), {});
  const d = compare(digest(GC_DE, p['at/de vs gc/de']), digest(AT_DE, p['at/de vs gc/de']));
  assert.deepEqual(Object.keys(d), ['text']);
  assert.deepEqual(d.text.added, ['English Österreich']);
});

/** A fake DA: path -> html. */
const fake = (docs) => async (page) => docs[page] ?? null;

test('run with the gc rows: source and target paths from pages.csv (own slugs), --pages limits the rows', async () => {
  const docs = {
    '/gc/de/gepaeck': GC_DE, '/de/de/gepaeck': DE_DE, '/at/de/gepaeck': AT_DE, '/gc/de/fluege': GC_DE, '/de/de/fluege': DE_DE,
  };
  const results = await run({ setup: GC, source: fake(docs), pages: ['/gc/de/gepaeck', '/de/en/flights'] });
  const rows = Object.fromEntries(results.map((r) => [r.pair, r.rows.map((x) => `${x.source} ${x.target} ${x.status}`)]));
  assert.deepEqual(rows['de/de vs gc/de'].sort(), ['/gc/de/fluege /de/de/fluege identical', '/gc/de/gepaeck /de/de/gepaeck identical']);
  assert.deepEqual(rows['at/de vs gc/de'].sort(), ['/gc/de/fluege /at/de/fluege missing in DA: /at/de/fluege', '/gc/de/gepaeck /at/de/gepaeck differs']);
  assert.deepEqual(rows['gb/en vs gc/en'].sort(), ['/gc/en/baggage /gb/en/baggage missing in DA: /gc/en/baggage, /gb/en/baggage', '/gc/en/flights /gb/en/flights missing in DA: /gc/en/flights, /gb/en/flights']);
  const md = report(results, GC);
  assert.match(md, /## at\/de vs gc\/de/);
  assert.match(md, /the global source's rows/);
});

test('run with today\'s rows: the columns as before', async () => {
  const docs = { '/de/de/gepaeck': DE_DE, '/at/de/gepaeck': AT_DE.replace(/\/gc\//g, '/de/') };
  const results = await run({ setup: TODAY, source: fake(docs), pages: ['/de/de/gepaeck'] });
  assert.deepEqual(results.map((r) => r.pair), ['at/de vs de/de', 'gb/en vs de/en']);
  assert.deepEqual(results[0].rows.map((x) => `${x.source} ${x.target}`), ['/de/de/gepaeck /at/de/gepaeck']);
  assert.ok(!report(results, TODAY).includes('global source'), 'today\'s report text as before');
});

test('--pages: a comma list or a file (one path per line, # comments); the report files per setup', () => {
  assert.deepEqual(readPages('/gc/de/gepaeck, /de/en/flights/'), ['/gc/de/gepaeck', '/de/en/flights']);
  const file = new URL('./fixtures/loc/regional-diff-pages.txt', import.meta.url).pathname;
  assert.deepEqual(readPages(file), ['/gc/en/baggage', '/gc/de/gepaeck']);
  assert.equal(reportName(TODAY), 'loc-regional-diff');
  assert.equal(reportName(GC), 'loc-regional-diff-gc');
});
