/* eslint-disable max-len, import/no-relative-packages */
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import worker from '../src/index.js';
import { resetSearchCache, searchLocale } from '../src/search.js';
import {
  terms, words, search, prepareRow, excerpt, excerptHtml,
} from '../../../../scripts/site-search.js';

const ORIGIN = 'main--lh-com--moved-permanently.aem.live';
const env = { ORIGIN, PUBLIC_HOST: 'lhcom.example', EDGE_TTL: '60' };
const ROWS = {
  'de/en': [
    {
      path: '/de/en/during-your-trip/lhg-wifi', title: 'Lufthansa Group Wi-Fi | Lufthansa', description: 'Stay connected on board.', headings: '["Lufthansa Group Wi-Fi"]', content: '["If the portal does not open automatically, please enter wifi.lufthansa.com in your browser."]', parent: '/de/en/during-your-trip', 'hide-in-search': '',
    },
    {
      path: '/de/en/internet-overview', title: 'Internet | Lufthansa', description: 'Discover our internet options on board.', headings: '["Internet"]', content: '["Free Wi-Fi messaging on all flights."]', parent: '', 'hide-in-search': '',
    },
    {
      path: '/de/en/secret', title: 'Wifi test page | Lufthansa', description: 'wifi', headings: '[]', content: '[]', parent: '', 'hide-in-search': 'true',
    },
    {
      path: '/de/en/baggage', title: 'Baggage | Lufthansa', description: 'All about baggage.', headings: '["Baggage"]', content: '["Carry-on baggage and checked baggage."]', parent: '', 'hide-in-search': '',
    },
  ],
  'de/de': [
    {
      path: '/de/de/gepaeck', title: 'Gepäck | Lufthansa', description: 'Alles zum Gepäck.', headings: '["Gepäck", "Handgepäckstücke"]', content: '["Ihr Gepäckstück und Handgepäck."]', parent: '', 'hide-in-search': '',
    },
  ],
};

let calls;
beforeEach(() => {
  resetSearchCache();
  calls = [];
  globalThis.fetch = async (input) => {
    const req = input instanceof Request ? input : new Request(input);
    const u = new URL(req.url);
    calls.push(u.pathname + u.search);
    const m = u.pathname.match(/^\/([a-z]{2}\/[a-z]{2})\/search-index\.json$/);
    if (m && ROWS[m[1]]) {
      return Response.json({
        total: ROWS[m[1]].length, offset: 0, limit: 1000, data: ROWS[m[1]], ':type': 'sheet',
      });
    }
    return new Response('Not found', { status: 404 });
  };
});

const post = (body, headers = { 'X-Portal': 'LH', 'X-Portal-Site': 'DE', 'X-Portal-Language': 'en' }) => worker.fetch(new Request('https://lh-edge.example/service/secured/api/search', {
  method: 'POST', headers: { 'content-type': 'application/json', ...headers }, body: JSON.stringify(body),
}), env, {});

test('site search: folding, terms, joined words, compounds', () => {
  assert.deepEqual(terms('Miles & More'), ['miles', 'more']);
  assert.deepEqual(terms('miles and more'), ['miles', 'more']);
  assert.deepEqual(terms('Gepäck'), ['gepack']);
  assert.ok(words('Wi-Fi').includes('wifi'));
  const rows = ROWS['de/de'].map(prepareRow);
  assert.equal(search(rows, 'Gepäck').length, 1);
  assert.equal(search(rows, 'handgepack').length, 1);
  assert.equal(search(rows, 'Gepäck Flughafen').length, 0, 'every term must match');
});

test('site search: excerpt with the matches in <strong>', () => {
  const [hit] = search(ROWS['de/en'].map(prepareRow), 'wifi');
  const ex = excerpt(hit.prepared, 'wifi');
  assert.match(excerptHtml(ex), /<strong>wifi<\/strong>\.lufthansa\.com/);
});

test('search route: www\'s shape and headers, hidden pages left out', async () => {
  const resp = await post({ phrase: 'wifi' });
  assert.equal(resp.status, 200);
  assert.equal(resp.headers.get('content-type'), 'application/json');
  assert.equal(resp.headers.get('cache-control'), null);
  const body = await resp.json();
  assert.deepEqual(Object.keys(body).sort(), ['pageSize', 'results', 'total']);
  assert.equal(body.pageSize, 10);
  assert.equal(body.total, body.results.length);
  assert.deepEqual(body.results.map((r) => r.link), ['/de/en/during-your-trip/lhg-wifi', '/de/en/internet-overview']);
  assert.deepEqual(Object.keys(body.results[0]).sort(), ['description', 'headline', 'link']);
  assert.equal(body.results[0].headline, 'Lufthansa Group Wi-Fi');
  // without search data (none here) the locale's index is read, as before
  assert.ok(calls.some((c) => c.startsWith('/de/en/search-index.json')));
});

test('search route: 400 without X-Portal headers or phrase, as www', async () => {
  const invalid = { error: 'Invalid input', errors: [], validationErrors: [] };
  const noHeaders = await post({ phrase: 'wifi' }, {});
  assert.equal(noHeaders.status, 400);
  assert.deepEqual(await noHeaders.json(), invalid);
  const empty = await post({ phrase: '' });
  assert.equal(empty.status, 400);
  assert.deepEqual(await empty.json(), invalid);
  const none = await post({ phrase: 'xqzvyk' });
  assert.deepEqual(await none.json(), { results: [], total: 0, pageSize: 10 });
});

test('search route: markets without a replica search the same language', () => {
  assert.equal(searchLocale('DE', 'de'), 'de/de');
  assert.equal(searchLocale('CH', 'de'), 'de/de');
  assert.equal(searchLocale('US', 'en'), 'de/en');
  assert.equal(searchLocale('GB', 'en'), 'gb/en');
  assert.equal(searchLocale('FR', 'fr'), null);
});
