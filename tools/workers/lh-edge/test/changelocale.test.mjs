/* eslint-disable max-len */
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import worker from '../src/index.js';
import { resetSheetCache } from '../src/sheet.js';

const env = { ORIGIN: 'main--lh-com--moved-permanently.aem.live', PUBLIC_HOST: '', EDGE_TTL: '60' };
const MAP = {
  pages: [
    {
      'de/en': '/de/en/baggage', 'de/de': '/de/de/gepaeck', 'at/de': '/at/de/gepaeck', 'gb/en': '/gb/en/baggage',
    },
    { 'de/en': '/de/en/only-in-de-en' },
  ],
};
beforeEach(() => {
  resetSheetCache();
  globalThis.fetch = async (input) => {
    const u = new URL((input instanceof Request ? input : new Request(input)).url);
    if (u.pathname === '/data/locale-map.json') return new Response(JSON.stringify(MAP), { headers: { 'content-type': 'application/json' } });
    return new Response('not found', { status: 404 });
  };
});
const form = (path, body, headers = {}) => worker.fetch(new Request(`https://lh-edge.example${path}`, {
  method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded', ...headers }, body,
}), env, {});
const cookieOf = (resp) => resp.headers.get('set-cookie');

test('changelocale switch: the page in the chosen locale, the cookie as www sets it', async () => {
  const resp = await form('/de/en/baggage.changelocale', 'country=DE&language=de');
  assert.equal(resp.status, 302);
  assert.equal(resp.headers.get('location'), '/de/de/gepaeck');
  assert.equal(cookieOf(resp), 'dcep.prehpsettings=de/de; Path=/; Max-Age=34560000; Secure');
  assert.ok(!/HttpOnly/i.test(cookieOf(resp)), 'readable by scripts');
  // .changelocale.html, the page's query parameters go on
  const html = await form('/de/en/baggage.changelocale.html', 'country=gb&language=en&utm_source=x&a=1');
  assert.equal(html.headers.get('location'), '/gb/en/baggage?utm_source=x&a=1');
});

test('changelocale switch: a page without counterpart goes to the locale\'s homepage; an unknown market to www', async () => {
  const missing = await form('/de/en/only-in-de-en.changelocale', 'country=at&language=de');
  assert.equal(missing.headers.get('location'), '/at/de/homepage');
  assert.equal(cookieOf(missing), 'dcep.prehpsettings=at/de; Path=/; Max-Age=34560000; Secure');
  const unknown = await form('/de/en/baggage.changelocale', 'country=fr&language=fr');
  assert.equal(unknown.status, 302);
  assert.equal(unknown.headers.get('location'), 'https://www.lufthansa.com/fr/fr/homepage');
  assert.equal(cookieOf(unknown), 'dcep.prehpsettings=fr/fr; Path=/; Max-Age=34560000; Secure');
});

test('changelocale switch: only the language valid keeps the market; nothing valid or another body is 400', async () => {
  const lang = await form('/de/en/baggage.changelocale', 'country=Germany&language=de');
  assert.equal(lang.headers.get('location'), '/de/de/gepaeck');
  assert.equal(cookieOf(lang), 'dcep.prehpsettings=de/de; Path=/; Max-Age=34560000; Secure');
  assert.equal((await form('/de/en/baggage.changelocale', 'country=de')).status, 400);
  assert.equal((await form('/index.changelocale', 'language=de')).status, 400, 'no market to keep');
  assert.equal((await form('/de/en/baggage.changelocale', 'hello', { 'content-type': 'text/plain' })).status, 400);
});

test('changelocale country lookup: the visitor\'s country from the CDN, lower case, or empty', async () => {
  const ask = (headers, body = '{"geolocation":true,"language":"en"}') => worker.fetch(new Request('https://lh-edge.example/xx/en/homepage.changelocale', {
    method: 'POST', headers: { 'content-type': 'application/json', ...headers }, body,
  }), env, {});
  const de = await ask({ 'cf-ipcountry': 'DE' });
  assert.equal(de.status, 200);
  assert.equal(de.headers.get('content-type'), 'application/json');
  assert.deepEqual(await de.json(), { country: 'de' });
  assert.equal(de.headers.get('set-cookie'), null, 'nothing else happens');
  assert.deepEqual(await (await ask({ 'cf-ipcountry': 'XX' })).json(), { country: '' });
  assert.deepEqual(await (await ask({})).json(), { country: '' });
  assert.equal((await ask({}, '{"language":"en"}')).status, 400);
  assert.equal((await ask({}, 'not json')).status, 400);
});
