/* The lounge finder's data on our hosts (brief 539, scripts/lounge-data.js through scripts/lh-data.js lhFetch): www's
   lounge API refuses our origins (CORS) and a Worker (bot rule), so on the demo hosts the three routes the finder calls
   (labels/loungefinder, catalogs/lounges/cities, catalogs/lounges/<STATUS>/<CITY>) are answered from www's recorded
   answers under /data/lounges and never sent to www; on www's own host (production) nothing changes. de pages read de,
   every other language en; a recorded empty answer is an empty list without a file; a status and city never recorded
   throws (no data), as a failed live call did. Run: node --max-old-space-size=256 --test test/lounge-data-539.test.mjs */
/* global globalThis */
import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { lhFetch } from '../scripts/lh-data.js';
import { loungeAnswer, isLoungeRoute, loungeLanguage, resetLoungeData } from '../scripts/lounge-data.js';

const store = () => {
  const m = new Map();
  return {
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => m.set(k, String(v)),
    clear: () => m.clear(),
  };
};
const at = (hostname, pathname = '/de/de/during-your-trip/lounges') => {
  globalThis.window = { sessionStorage: store(), localStorage: store(), location: { pathname, hostname } };
};
const MANIFEST = {
  lounges: {
    en: { BUS: { FRA: 8, NQZ: 0 }, FIR: { FRA: 14 } },
    de: { BUS: { FRA: 8 } },
  },
};
const FILES = {
  '/data/lounges/manifest.json': MANIFEST,
  '/data/lounges/labels-en.json': { 'loungefinder.title': 'Find your lounge' },
  '/data/lounges/labels-de.json': { 'loungefinder.title': 'Finden Sie Ihre Lounge' },
  '/data/lounges/cities-en.json': { cities: [{ code: 'ALG', city: 'Algiers' }] },
  '/data/lounges/cities-de.json': { cities: [{ code: 'ALG', city: 'Algier' }] },
  '/data/lounges/en/BUS/FRA.json': { lounges: [{ loungeid: '14552', plainLocation: 'Business Lounge Z50' }] },
  '/data/lounges/de/BUS/FRA.json': { lounges: [{ loungeid: '14552', plainLocation: 'Business Lounge Z50 (de)' }] },
  '/data/lounges/en/FIR/FRA.json': { lounges: [{ loungeid: '1' }, { loungeid: '2' }] },
};
let calls;
beforeEach(() => {
  resetLoungeData();
  calls = [];
  globalThis.fetch = async (url, init) => {
    const href = String(url);
    calls.push(href);
    if (href.startsWith('/data/recorded/')) return new Response(JSON.stringify({ entries: {} }), { status: 200 });
    if (FILES[href]) return new Response(JSON.stringify(FILES[href]), { status: 200, headers: { 'content-type': 'application/json' } });
    if (href.startsWith('/data/')) return new Response('', { status: 404 });
    return new Response(JSON.stringify({ live: href, credentials: init && init.credentials }), { status: 200, headers: { 'content-type': 'application/json' } });
  };
});
const www = () => calls.filter((c) => /^https?:\/\//.test(c) || c.startsWith('/service/'));

test('the three routes, nothing else', () => {
  ['/service/api/labels/loungefinder/lh/fr', '/service/api/catalogs/lounges/cities', '/service/api/catalogs/lounges/SEN/FRA'].forEach((r) => assert.ok(isLoungeRoute(r), r));
  ['/service/api/labels/common/lh/de', '/service/api/catalogs/airportnames', '/service/api/catalogs/lounges/BUS/FRA/airport', '/service/api/defaultAirport'].forEach((r) => assert.ok(!isLoungeRoute(r), r));
  assert.equal(loungeLanguage('de'), 'de');
  assert.equal(loungeLanguage('fr'), 'en');
  assert.equal(loungeLanguage(''), 'en');
});

test('our host: labels, cities and a search from /data/lounges, no call to www', async () => {
  at('lufthansa.turnsthe.page');
  const labels = await lhFetch('/service/api/labels/loungefinder/lh/de', { market: 'de/de' });
  assert.equal(labels.data['loungefinder.title'], 'Finden Sie Ihre Lounge');
  assert.equal(labels.source, 'recorded');
  const cities = await lhFetch('/service/api/catalogs/lounges/cities', { market: 'de/de' });
  assert.equal(cities.data.cities[0].city, 'Algier');
  const bus = await lhFetch('/service/api/catalogs/lounges/BUS/FRA', { market: 'de/de' });
  assert.equal(bus.data.lounges[0].plainLocation, 'Business Lounge Z50 (de)');
  assert.deepEqual(www(), [], `no call to www: ${calls.join(' ')}`);
});

test('another language: English (labels, city names, the answer); a status only recorded in en for a de page: en', async () => {
  at('lufthansa.turnsthe.page', '/fr/fr/during-your-trip/lounges');
  assert.equal((await lhFetch('/service/api/labels/loungefinder/lh/fr', { market: 'fr/fr' })).data['loungefinder.title'], 'Find your lounge');
  assert.equal((await lhFetch('/service/api/catalogs/lounges/cities', { market: 'fr/fr' })).data.cities[0].city, 'Algiers');
  assert.equal((await lhFetch('/service/api/catalogs/lounges/BUS/FRA', { market: 'fr/fr' })).data.lounges[0].plainLocation, 'Business Lounge Z50');
  at('lufthansa.turnsthe.page');
  assert.equal((await lhFetch('/service/api/catalogs/lounges/FIR/FRA', { market: 'de/de' })).data.lounges.length, 2);
  assert.deepEqual(www(), []);
});

test('a recorded empty answer: an empty list, no file read; never recorded: no data (throws)', async () => {
  at('lufthansa.turnsthe.page');
  const empty = await lhFetch('/service/api/catalogs/lounges/BUS/NQZ', { market: 'gb/en' });
  assert.deepEqual(empty.data, { lounges: [] });
  assert.ok(!calls.some((c) => c.includes('/BUS/NQZ')), 'no file for an empty answer');
  await assert.rejects(() => lhFetch('/service/api/catalogs/lounges/SEN/MUC', { market: 'gb/en' }), /no recorded lounges/);
  assert.deepEqual(www(), []);
});

test("www's own host (production): the finder's calls stay live and same-origin, no /data/lounges read", async () => {
  at('www.lufthansa.com');
  const r = await lhFetch('/service/api/catalogs/lounges/BUS/FRA', { market: 'de/de' });
  assert.equal(r.source, 'live');
  assert.equal(r.via, 'same-origin');
  assert.ok(!calls.some((c) => c.startsWith('/data/lounges')), calls.join(' '));
});

test('loungeAnswer: null for another route', async () => {
  assert.equal(await loungeAnswer('/service/api/labels/common/lh/de', 'de/de'), null);
});

test('tools/lounges/build-lounge-data.mjs: www answers in, the folder and manifest out (empty answers without a file)', async () => {
  const { execFileSync } = await import('node:child_process');
  const fs = await import('node:fs');
  const os = await import('node:os');
  const path = await import('node:path');
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'lounges-'));
  const onload = path.join(tmp, '001');
  [['de-de', 'de'], ['de-en', 'en']].forEach(([page, ll]) => {
    fs.mkdirSync(path.join(onload, page, 'responses'), { recursive: true });
    fs.writeFileSync(path.join(onload, page, 'responses', 'c.json'), JSON.stringify({ cities: [{ code: 'FRA', city: ll === 'de' ? 'Frankfurt am Main' : 'Frankfurt' }] }));
    fs.writeFileSync(path.join(onload, page, 'responses', 'l.json'), JSON.stringify({ 'loungefinder.title': ll }));
    fs.writeFileSync(path.join(onload, page, 'requests.jsonl'), [
      { url: 'https://www.lufthansa.com/service/api/catalogs/lounges/cities', status: 200, bodyFile: 'responses/c.json' },
      { url: `https://www.lufthansa.com/service/api/labels/loungefinder/lh/${ll}`, status: 200, bodyFile: 'responses/l.json' },
    ].map((r) => JSON.stringify(r)).join('\n'));
  });
  const answers = path.join(tmp, '003');
  fs.mkdirSync(path.join(answers, 'BUS'), { recursive: true });
  fs.writeFileSync(path.join(answers, 'BUS', 'FRA.json'), JSON.stringify({ lounges: [{ loungeid: '14552' }] }));
  fs.writeFileSync(path.join(answers, 'BUS', 'NQZ.json'), JSON.stringify({ lounges: [] }));
  fs.writeFileSync(path.join(answers, 'index.jsonl'), [
    { status: 'BUS', code: 'FRA', kind: 'city', http: 200, file: 'BUS/FRA.json' },
    { status: 'BUS', code: 'NQZ', kind: 'city', http: 200, file: 'BUS/NQZ.json' },
  ].map((r) => JSON.stringify(r)).join('\n'));
  const out = path.join(tmp, 'out');
  execFileSync(process.execPath, [new URL('../tools/lounges/build-lounge-data.mjs', import.meta.url).pathname, '--onload', onload, '--answers', answers, '--out', out], { stdio: 'pipe' });
  const read = (f) => JSON.parse(fs.readFileSync(path.join(out, f), 'utf8'));
  assert.deepEqual(read('manifest.json').lounges, { en: { BUS: { FRA: 1, NQZ: 0 } } });
  assert.equal(read('en/BUS/FRA.json').lounges[0].loungeid, '14552');
  assert.ok(!fs.existsSync(path.join(out, 'en/BUS/NQZ.json')), 'no file for an empty answer');
  assert.equal(read('cities-de.json').cities[0].city, 'Frankfurt am Main');
  assert.equal(read('labels-en.json')['loungefinder.title'], 'en');
  fs.rmSync(tmp, { recursive: true, force: true });
});
