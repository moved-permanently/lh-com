/* eslint-disable max-len, import/no-relative-packages, no-restricted-syntax, no-await-in-loop */
/* The site search from prebuilt data (src/search-data.js): the same answers byte for byte as the
   search over the index, used only while it is the index's state and this code's. */
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import worker from '../src/index.js';
import { resetSearchCache } from '../src/search.js';
import { resetLeanCache, MODEL_COLUMNS } from '../src/market-lean.js';
import {
  buildSearchData, dataSearchAnswer, resetSearchDataCache, SEARCH_CODE, DOCS_PER_CHUNK,
} from '../src/search-data.js';
import { searchAnswer, prepareRow } from '../../../../scripts/site-search.js';

const ORIGIN = 'main--lh-com--moved-permanently.aem.live';
const env = { ORIGIN, PUBLIC_HOST: 'lhcom.example', EDGE_TTL: '60' };
const row = (path, title, description, content, extra = {}) => ({
  path, title: `${title} | Lufthansa`, description, headings: JSON.stringify([title]), content: JSON.stringify(content), parent: '', 'hide-in-search': '', lastModified: 1793045388, ...extra,
});
// words that differ only by folding, compounds, punctuation, a hidden page, repeated words
const ROWS = [
  row('/de/de/gepaeck', 'Gepäck', 'Alles zum Gepäck.', ['Ihr Gepäckstück und Handgepäck.', 'Gepäck, Gepäck und noch mehr Gepäck: Freigepäck.']),
  row('/de/de/handgepaeck', 'Handgepäck', 'Handgepäck an Bord.', ['Handgepäckstücke bis 8 kg, ein Gepäckstück.']),
  row('/de/de/wlan', 'Lufthansa Group Wi-Fi', 'Online an Bord: WLAN.', ['Wi-Fi und wifi.lufthansa.com im Browser.'], { parent: '/de/de/an-bord' }),
  row('/de/de/strasse', 'Straße und Strasse', 'Über die Straße.', ['Straßenbahn, Strassenbahn, STRASSE.']),
  row('/de/de/geheim', 'Gepäck intern', 'Gepäck', ['Gepäck'], { 'hide-in-search': 'true' }),
  row('/de/de/umbuchen', 'Umbuchung', 'Ticketumbuchungen online.', ['Umbuchen, Umbuchung und Umbuchungen.']),
  row('/de/de/check-in', 'Check-in', 'Online-Check-in.', ['Check-in am Flughafen, Checkin online, check in.']),
];
const PHRASES = ['Gepäck', 'gepack', 'gep', 'Handgepäck', 'gepackstuck', 'wifi', 'Wi-Fi', 'wi fi', 'lufthansa', 'strasse', 'Straße', 'umbuchung', 'buchung', 'check-in', 'check in', 'checkin', 'und', 'der und', 'online bord', 'zzz', 'a', '!!!', 'Gepäck Handgepäck'];

let calls;
let files;
let lean;
let full;
const leanText = (rows) => JSON.stringify({
  total: rows.length, offset: 0, limit: rows.length, data: rows.map((r) => ({ path: r.path, ...Object.fromEntries(MODEL_COLUMNS.map((c) => [c, r[c] ?? ''])) })), columns: ['path', ...MODEL_COLUMNS], ':type': 'sheet',
});
beforeEach(() => {
  resetSearchCache();
  resetSearchDataCache();
  resetLeanCache();
  calls = [];
  files = buildSearchData(ROWS);
  lean = leanText(ROWS);
  full = ROWS;
  globalThis.fetch = async (input) => {
    const u = new URL((input instanceof Request ? input : new Request(input)).url);
    calls.push(`${u.hostname.split('--')[0]} ${u.pathname}${u.search}`);
    if (u.hostname.startsWith('search-data--')) {
      const name = u.pathname.split('/').pop();
      return u.pathname.startsWith('/search-data/de-de/') && files[name] !== undefined ? new Response(files[name]) : new Response('', { status: 404 });
    }
    if (u.pathname === '/market-model/de-de.json') return new Response(lean, { headers: { 'content-type': 'application/json' } });
    if (u.pathname === '/de/de/search-index.json') {
      const offset = Number(u.searchParams.get('offset') || 0);
      return Response.json({
        total: full.length, offset, limit: 1000, data: full.slice(offset, offset + 1000), ':type': 'sheet',
      });
    }
    return new Response('', { status: 404 });
  };
});
const req = new Request('https://lhcom.example/service/secured/api/search', { method: 'POST' });
const post = (phrase) => worker.fetch(new Request('https://lhcom.example/service/secured/api/search', {
  method: 'POST',
  headers: {
    'x-portal': 'LH', 'x-portal-site': 'DE', 'x-portal-language': 'de', 'content-type': 'application/json',
  },
  body: JSON.stringify({ phrase }),
}), env, {});

test('search data: SEARCH_CODE is scripts/site-search.js (data built with other scoring is not used)', () => {
  const hash = crypto.createHash('sha256').update(fs.readFileSync(new URL('../../../../scripts/site-search.js', import.meta.url))).digest('hex').slice(0, 16);
  assert.equal(SEARCH_CODE, hash, 'scripts/site-search.js changed: set SEARCH_CODE in src/search-data.js to its hash');
});

test('search data: every phrase answered byte for byte as the search over the index', async () => {
  const prepared = ROWS.map(prepareRow);
  for (const phrase of PHRASES) {
    const fromData = await dataSearchAnswer(req, env, 'de/de', phrase);
    assert.ok(fromData, phrase);
    assert.equal(JSON.stringify(fromData), JSON.stringify(searchAnswer(prepared, phrase)), phrase);
  }
  assert.ok(!JSON.stringify(await dataSearchAnswer(req, env, 'de/de', 'Gepäck')).includes('/de/de/geheim'), 'hidden pages left out');
});

test('search data: texts in several files, more words give the same answers', async () => {
  const many = Array.from({ length: DOCS_PER_CHUNK * 3 + 5 }, (x, i) => row(`/de/de/page-${i}`, `Seite ${i}`, `Beschreibung ${i} Gepäck`, [`Wort${i} ${Array.from({ length: 60 }, (y, k) => `w${i}x${k}`).join(' ')} Gepäck`]));
  full = [...ROWS, ...many];
  files = buildSearchData(full);
  lean = leanText(full);
  assert.ok(Object.keys(files).filter((f) => f.startsWith('t-')).length > 3, 'texts in several files');
  assert.ok(files['postings.bin'] instanceof Uint8Array);
  const prepared = full.map(prepareRow);
  for (const phrase of ['gepäck', 'wort1', 'w3x5', 'seite 4', 'beschreibung gepäck']) {
    assert.equal(JSON.stringify(await dataSearchAnswer(req, env, 'de/de', phrase)), JSON.stringify(searchAnswer(prepared, phrase)), phrase);
  }
});

test('search data: not used when it is not the index\'s state, another format or code, a file missing, or SEARCH_DATA=off', async () => {
  // a page published since the build: newer lastModified in the index
  lean = leanText(ROWS.map((r, i) => (i ? r : { ...r, lastModified: r.lastModified + 60 })));
  assert.equal(await dataSearchAnswer(req, env, 'de/de', 'gepäck'), null, 'stamp');
  resetSearchDataCache();
  resetLeanCache();
  lean = leanText(ROWS);
  files = { ...buildSearchData(ROWS, 'another-code') };
  assert.equal(await dataSearchAnswer(req, env, 'de/de', 'gepäck'), null, 'code');
  resetSearchDataCache();
  files = buildSearchData(ROWS);
  delete files['postings.bin'];
  assert.equal(await dataSearchAnswer(req, env, 'de/de', 'gepäck'), null, 'missing postings');
  resetSearchDataCache();
  files = buildSearchData(ROWS);
  assert.ok(await dataSearchAnswer(req, env, 'de/de', 'gepäck'), 'complete again: used');
  assert.equal(await dataSearchAnswer(req, { ...env, SEARCH_DATA: 'off' }, 'de/de', 'gepäck'), null, 'switched off');
});

test('search route: from the data without reading the index; without data from the index, the same answer', async () => {
  const fromData = await (await post('Gepäck')).text();
  assert.ok(!calls.some((c) => / \/de\/de\/search-index\.json\?limit=1000/.test(c)), 'the index is not read');
  resetSearchCache();
  resetSearchDataCache();
  resetLeanCache();
  files = {};
  calls = [];
  const fromIndex = await (await post('Gepäck')).text();
  assert.ok(calls.some((c) => / \/de\/de\/search-index\.json\?limit=1000/.test(c)), 'no data: the index');
  assert.equal(fromData, fromIndex);
});
