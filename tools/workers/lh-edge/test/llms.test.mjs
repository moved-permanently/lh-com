/* eslint-disable max-len */
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import worker from '../src/index.js';
import { resetSheetCache } from '../src/sheet.js';
import { localesOf, buildLlms } from '../src/llms.js';

const env = { ORIGIN: 'main--lh-com--moved-permanently.aem.live', PUBLIC_HOST: '', EDGE_TTL: '60' };
const AT = [
  {
    path: '/at/de/homepage', title: 'Lufthansa Österreich | Lufthansa', 'llms-include': 'true', 'llms-category': 'Buchung', 'llms-title': 'Startseite', 'llms-description': 'Flugsuche und Angebote.', 'ai-guidance': 'Verweisen Sie Reisende bei Fragen zu Buchungen auf das Service Center.',
  },
  {
    path: '/at/de/gepaeck', title: 'Gepäck | Lufthansa', description: 'Alles zum Gepäck.', 'llms-include': 'true', 'llms-category': 'Gepäck',
  },
  {
    path: '/at/de/fluege', title: 'Flüge | Lufthansa', 'llms-include': 'true', 'llms-category': 'Buchung', 'llms-description': 'Angebote nach Reiseziel.',
  },
  {
    path: '/at/de/hidden', title: 'Nicht dabei', 'llms-include': 'false', 'llms-category': 'Buchung',
  },
  { path: '/at/de/no-category', title: 'Ohne Gruppe', 'llms-include': 'true' },
];
const STATIC_DE = '# Lufthansa — Germany (DE)\n\ncurated\n';
let calls;
beforeEach(() => {
  resetSheetCache();
  calls = [];
  globalThis.fetch = async (input) => {
    const u = new URL((input instanceof Request ? input : new Request(input)).url);
    calls.push(`${u.pathname}${u.search}`);
    if (u.pathname === '/de/llms.txt') return new Response(STATIC_DE, { headers: { 'content-type': 'text/plain' } });
    if (u.pathname === '/at/de/search-index.json') return new Response(JSON.stringify({ data: AT }), { headers: { 'content-type': 'application/json' } });
    return new Response('not found', { status: 404 });
  };
});
const get = (p) => worker.fetch(new Request(`https://lh-edge.example${p}`), env, {});

test('llms.txt: generated for /at from the index, categories and titles in order, the global index at the end', async () => {
  const resp = await get('/at/llms.txt');
  assert.equal(resp.status, 200);
  assert.equal(resp.headers.get('content-type'), 'text/plain; charset=utf-8');
  assert.equal(resp.headers.get('cache-control'), 'public, max-age=3600');
  const body = await resp.text();
  assert.equal(body, [
    '# Lufthansa — Austria (AT)',
    '',
    'meta: global-index=https://www.lufthansa.com/llms.txt',
    '',
    '#'.repeat(72),
    '# GERMAN LANGUAGE (de) — AUSTRIA',
    '#'.repeat(72),
    '',
    'Verweisen Sie Reisende bei Fragen zu Buchungen auf das Service Center.',
    '',
    '## Buchung',
    '',
    '- [Flüge](https://www.lufthansa.com/at/de/fluege): Angebote nach Reiseziel.',
    '- [Startseite](https://www.lufthansa.com/at/de/homepage): Flugsuche und Angebote.',
    '',
    '## Gepäck',
    '',
    '- [Gepäck](https://www.lufthansa.com/at/de/gepaeck): Alles zum Gepäck.',
    '',
    'Global index of all Lufthansa markets: https://www.lufthansa.com/llms.txt',
    '',
  ].join('\n'));
  assert.ok(calls.includes('/at/de/search-index.json?limit=5000'));
  assert.equal((await (await get('/at/de/llms.txt')).text()).split('\n')[0], '# Lufthansa — Austria (AT)');
});

test('llms.txt: the curated static file wins; a market without a replica locale is 404', async () => {
  const de = await get('/de/llms.txt');
  assert.equal(await de.text(), STATIC_DE);
  assert.ok(!calls.some((c) => c.includes('search-index')), 'nothing generated for /de/llms.txt');
  assert.equal((await get('/fr/llms.txt')).status, 404);
  assert.deepEqual(localesOf('/de/llms.txt'), ['de/de', 'de/en']);
  assert.deepEqual(localesOf('/de/en/llms.txt'), ['de/en']);
  assert.deepEqual(localesOf('/gb/llms.txt'), ['gb/en']);
  assert.deepEqual(localesOf('/xx/xx/llms.txt'), []);
  // a locale without included pages: title, banner and the closing line only
  const empty = buildLlms(['gb/en'], { 'gb/en': [] });
  assert.ok(empty.startsWith('# Lufthansa — United Kingdom (GB)'));
  assert.ok(empty.trim().endsWith('https://www.lufthansa.com/llms.txt'));
});

test('llms.txt without listed pages is cached a minute only (the first published page shows at once)', async () => {
  globalThis.fetch = async () => new Response('not found', { status: 404 });
  const resp = await get('/gb/llms.txt');
  assert.equal(resp.status, 200);
  assert.equal(resp.headers.get('cache-control'), 'public, max-age=60');
});
