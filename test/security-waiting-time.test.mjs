/* eslint-disable max-len */
/* The security waiting time block (blocks/security-waiting-time), as www's component
   (dcep-security-waiting-time, chunk 3495e5e8: www.lufthansa.com /de/en/prepare-for-your-trip/
   airport-information/services-at-the-airport/security-waiting-time, ITA's /it/en/book-and-prepare/
   travel-information/at-the-airport/security-waiting-times, Discover's /de/en/book/travel-information/
   airport-info/security-check-time-slot): an airport select (GET /service/api/security-waiting-time/
   airports, named as www's saga asks: POST /service/api/catalogs/airportnames with the codes,
   {"airports":[{"code":"MUC"},…]}, in the portal's language; recorded answers of 2026-11-01 in
   test/fixtures/security-waiting-time), per terminal (tabs) and area the current
   waiting time ("5 - 10 min"), "open" or "closed", a workload dot (LOW green, MEDIUM amber, FULL red,
   OPEN grey, CLOSED navy) and "Last update: 3 minutes ago" (GET .../security-waiting-time/<IATA>/
   security). Labels: labels/securitywaitingtime/<tenant>/<lang> (securityWaitingTime.default.
   default.*), else built in. Live or nothing (scripts/lh-data.js, as the price routes): a failed
   call shows the link to the airline's www page, never other numbers.
   Run: node --max-old-space-size=512 --test test/security-waiting-time.test.mjs */
/* global globalThis */
import test, { beforeEach, afterEach, mock } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';

const fixture = (name) => JSON.parse(fs.readFileSync(new URL(`./fixtures/security-waiting-time/${name}.json`, import.meta.url), 'utf8'));
// www's names answer to the POST for the codes asked, in their order (the recorded answer per portal
// and language holds all 12 airports)
const namesFor = (recorded, init) => {
  const asked = JSON.parse(init.body).airports.map((a) => a.code);
  const known = new Map(fixture(recorded).airports.map((a) => [a.code, a]));
  return { airports: asked.map((c) => known.get(c)).filter(Boolean) };
};

const store = () => {
  const m = new Map();
  return {
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => m.set(k, String(v)),
    removeItem: (k) => m.delete(k),
    clear: () => m.clear(),
  };
};
const { window, document } = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
window.hlx = { codeBasePath: '' };
const setPage = (host, pathname, search = '') => {
  window.location = {
    hostname: host, pathname, search, hash: '', replace: () => {}, href: `https://${host}${pathname}${search}`, origin: `https://${host}`,
  };
};
setPage('lufthansa.turnsthe.page', '/');
window.origin = 'https://lufthansa.turnsthe.page';
window.matchMedia = () => ({ matches: false, addEventListener: () => {}, addListener: () => {} });
window.sessionStorage = store();
window.localStorage = store();
// linkedom's select has no value setter
Object.defineProperty(window.HTMLSelectElement.prototype, 'value', {
  configurable: true,
  get() { return (this.querySelector('option[selected]') || this.querySelector('option') || {}).value || ''; },
  set(v) { [...this.querySelectorAll('option')].forEach((o) => o.toggleAttribute('selected', o.value === v)); },
});
globalThis.window = window;
globalThis.document = document;
globalThis.NodeFilter = { SHOW_ELEMENT: 1, SHOW_TEXT: 4 };

const NOW = Date.parse('2026-11-01T12:00:00Z');
const LABELS = {
  'securityWaitingTime.default.default.selectAirport': 'Select Airport',
  'securityWaitingTime.default.default.lastUpdate': 'Last update',
  'securityWaitingTime.default.default.securityGateOpen': 'open',
  'securityWaitingTime.default.default.securityGateClosed': 'closed',
  'securityWaitingTime.default.default.securityGateMinutesAbbrev': 'min',
  'securityWaitingTime.default.default.airportDataMissing': 'Problems with getting the data',
};
const FRA = {
  name: 'Frankfurt/Main International',
  code: 'FRA',
  terminals: [
    {
      name: 'Terminal 1',
      areas: [
        {
          name: 'A', minTime: 5, maxTime: 10, workload: 'LOW', specialFeatures: [], lastupdate: '2026-11-01T11:57:00Z',
        },
        {
          name: 'B', minTime: 0, maxTime: 0, workload: 'CLOSED', specialFeatures: [], lastupdate: '2026-11-01T11:50:00Z',
        },
      ],
    },
    {
      name: 'Terminal 2',
      areas: [{
        name: 'D', minTime: 0, maxTime: 0, workload: 'OPEN', specialFeatures: [], lastupdate: '2026-11-01T11:59:30Z',
      }],
    },
  ],
};
let calls;
let answers;
const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json' } });
beforeEach(() => {
  window.sessionStorage.clear();
  calls = [];
  answers = {
    airports: () => json({ airports: ['BER', 'FRA', 'MUC'] }),
    security: () => json(FRA),
    labels: () => json(LABELS),
    // the POST with the codes: www's answer; the GET without codes (before 236): Frankfurt only
    names: (init) => (init.method === 'POST' ? json(namesFor('lh-names-en-post', init)) : json({ airports: [{ code: 'FRA', airport: 'Frankfurt/Main International' }] })),
  };
  mock.timers.enable({ apis: ['setTimeout', 'Date'], now: NOW });
  globalThis.fetch = async (url, init = {}) => {
    const href = String(url);
    if (href.includes('/data/recorded/')) return json({ entries: {} });
    calls.push({
      href, headers: init.headers || {}, method: init.method || 'GET', body: init.body,
    });
    if (href.includes('/security-waiting-time/airports')) return answers.airports();
    if (/\/security-waiting-time\/[A-Z]{3}\/security/.test(href)) return answers.security(href);
    if (href.includes('/labels/securitywaitingtime/')) return answers.labels();
    if (href.includes('/catalogs/airportnames')) return answers.names(init);
    return json({}, 404);
  };
});
afterEach(() => mock.timers.reset());

const { default: decorate } = await import('../blocks/security-waiting-time/security-waiting-time.js');
const { isDirectRoute, isPriceRoute } = await import('../scripts/lh-data.js');

const flush = () => new Promise((resolve) => { setImmediate(resolve); });
const advance = async (ms) => {
  for (let t = 0; t < ms; t += 100) {
    // eslint-disable-next-line no-await-in-loop
    await flush();
    mock.timers.tick(100);
  }
  await flush();
};
const page = async ({
  host = 'lufthansa.turnsthe.page', path = '/de/en/prepare-for-your-trip/airport-information/services-at-the-airport/security-waiting-time', search = '', meta = {}, rows = [],
} = {}) => {
  setPage(host, path, search);
  document.head.innerHTML = Object.entries(meta).map(([k, v]) => `<meta name="${k}" content="${v}">`).join('');
  const block = document.createElement('div');
  block.className = 'security-waiting-time';
  block.innerHTML = rows.map(([k, v]) => `<div><div>${k}</div><div>${v}</div></div>`).join('');
  document.body.replaceChildren(block);
  const done = decorate(block);
  await advance(3000);
  await done;
  await advance(500);
  return block;
};
const choose = async (block, code) => {
  const select = block.querySelector('select');
  select.value = code;
  select.dispatchEvent(new window.Event('change', { bubbles: true }));
  await advance(3000);
};
const areas = (block) => [...block.querySelectorAll('.security-waiting-time-area')].filter((a) => !a.closest('[hidden]'))
  .map((a) => [a.querySelector('.security-waiting-time-area-name').textContent, a.querySelector('.security-waiting-time-badge').textContent.trim(), a.dataset.workload]);

test('lh-data: the waiting time routes are direct and live-only (as the price routes)', () => {
  ['/service/api/security-waiting-time/airports', '/service/api/security-waiting-time/FRA/security'].forEach((r) => {
    assert.equal(isDirectRoute(r), true, r);
    assert.equal(isPriceRoute(r), true, r);
  });
});

test('the airports list: a labelled select, the API\'s airports in its order, named as www asks (POST with the codes)', async () => {
  const block = await page();
  const select = block.querySelector('select');
  assert.ok(select);
  assert.equal(block.querySelector(`label[for="${select.id}"]`).textContent, 'Select Airport');
  const options = [...select.querySelectorAll('option')].filter((o) => o.value).map((o) => [o.value, o.textContent]);
  assert.deepEqual(options, [['BER', 'Berlin - Brandenburg'], ['FRA', 'Frankfurt/Main International'], ['MUC', 'Munich']]);
  const names = calls.filter((c) => c.href.includes('/catalogs/airportnames'));
  assert.equal(names.length, 1, 'one names call');
  assert.equal(names[0].href, 'https://www.lufthansa.com/service/api/catalogs/airportnames');
  assert.equal(names[0].method, 'POST');
  assert.deepEqual(JSON.parse(names[0].body), { airports: [{ code: 'BER' }, { code: 'FRA' }, { code: 'MUC' }] });
  assert.equal(names[0].headers['Content-Type'], 'application/json');
  assert.deepEqual([names[0].headers['X-Portal'], names[0].headers['X-Portal-Site'], names[0].headers['X-Portal-Language']], ['LH', 'DE', 'en']);
  // lufthansa.com on a demo host: www directly, with the portal headers
  const airports = calls.find((c) => c.href.includes('/security-waiting-time/airports'));
  assert.equal(airports.href, 'https://www.lufthansa.com/service/api/security-waiting-time/airports');
  assert.equal(airports.headers['X-Portal'], 'LH');
  assert.equal(airports.headers['X-Portal-Site'], 'DE');
  assert.equal(airports.headers['X-Portal-Language'], 'en');
  assert.equal(block.querySelector('.security-waiting-time-area'), null, 'nothing before a choice');
});

test('an area with times, an open and a CLOSED area: per terminal, badge, dot, last update; screen reader text', async () => {
  const block = await page();
  await choose(block, 'FRA');
  const tabs = [...block.querySelectorAll('[role="tab"]')].map((t) => t.textContent);
  assert.deepEqual(tabs, ['Terminal 1', 'Terminal 2']);
  assert.deepEqual(areas(block), [['A', '5 - 10 min', 'LOW'], ['B', 'closed', 'CLOSED']]);
  const a = block.querySelector('.security-waiting-time-area');
  assert.equal(a.querySelector('.security-waiting-time-update').textContent, 'Last update: 3 minutes ago');
  assert.equal(a.querySelector('.security-waiting-time-sr').textContent, 'Terminal 1, Area A, Estimated wait time 5 to 10 minutes. Last update: 3 minutes ago');
  assert.equal(block.querySelectorAll('.security-waiting-time-area')[1].querySelector('.security-waiting-time-sr').textContent, 'Terminal 1, Area B, Security gate is closed. Last update: 10 minutes ago');
  // the second terminal
  block.querySelectorAll('[role="tab"]')[1].click();
  assert.deepEqual(areas(block), [['D', 'open', 'OPEN']]);
  assert.equal(block.dataset.lhSource, 'live');
  assert.ok(calls.some((c) => c.href === 'https://www.lufthansa.com/service/api/security-waiting-time/FRA/security'));
});

test('one terminal: its tab all the same (as www: Frankfurt\'s "Terminal 1", 2026-11-01)', async () => {
  answers.security = () => json({ ...FRA, terminals: [FRA.terminals[0]] });
  const block = await page({ search: '?airport=FRA' });
  assert.deepEqual([...block.querySelectorAll('[role="tab"]')].map((t) => t.textContent), ['Terminal 1']);
  assert.equal(areas(block).length, 2);
});

test('?airport= (as www) and the Airport row preselect an airport and load it', async () => {
  const fromUrl = await page({ search: '?airport=FRA' });
  assert.equal(fromUrl.querySelector('select').value, 'FRA');
  assert.equal(areas(fromUrl).length, 2);
  const fromRow = await page({ rows: [['Airport', 'FRA']] });
  assert.equal(areas(fromRow).length, 2);
});

test('missing labels: the built-in texts (English; German on a German page)', async () => {
  answers.labels = () => json({}, 404);
  const block = await page({ search: '?airport=FRA' });
  assert.equal(block.querySelector('label').textContent, 'Select Airport');
  assert.deepEqual(areas(block), [['A', '5 - 10 min', 'LOW'], ['B', 'closed', 'CLOSED']]);
  const de = await page({ path: '/de/de/reisevorbereitung/flughafeninformationen/services-am-flughafen/wartezeiten-sicherheitskontrolle', search: '?airport=FRA' });
  assert.equal(de.querySelector('label').textContent, 'Flughafen auswählen');
  // www's German labels (labels/securitywaitingtime/lh/de, 2026-11-01)
  assert.deepEqual(areas(de), [['A', '5 - 10 Min', 'LOW'], ['B', 'geschlossen', 'CLOSED']]);
});

test('failed call: the link to the airline\'s www page, never numbers; one late try after the backoff', async () => {
  answers.airports = () => new Response('<html>Just a moment...</html>', { status: 403, headers: { 'content-type': 'text/html' } });
  const block = await page();
  const link = block.querySelector('.security-waiting-time-fallback a');
  assert.ok(link, 'the fallback link');
  assert.equal(link.getAttribute('href'), 'https://www.lufthansa.com/de/en/prepare-for-your-trip/airport-information/services-at-the-airport/security-waiting-time');
  assert.equal(block.querySelector('select'), null);
  assert.equal(block.dataset.lhSource, 'none');
  // the late try answers: the select replaces the link
  answers.airports = () => json({ airports: ['FRA'] });
  await advance(6000);
  assert.ok(block.querySelector('select'));
  assert.equal(block.querySelector('.security-waiting-time-fallback'), null);
});

test('a failed waiting time call or an airport without terminals: www\'s message and the link, no numbers', async () => {
  answers.security = () => json({}, 500);
  const block = await page({ search: '?airport=FRA' });
  assert.equal(areas(block).length, 0);
  assert.equal(block.querySelector('.security-waiting-time-error').textContent, 'Problems with getting the data');
  assert.ok(block.querySelector('.security-waiting-time-fallback a'));
  answers.security = () => json({ name: 'Munich', code: 'MUC', terminals: [] });
  await choose(block, 'MUC');
  assert.equal(block.querySelector('.security-waiting-time-error').textContent, 'Problems with getting the data');
});

test('ITA on its demo host: www.lufthansa.com with X-Portal ITA, ITA\'s labels; the fallback is www.ita-airways.com', async () => {
  const block = await page({
    host: 'ita.turnsthe.page', path: '/it/en/book-and-prepare/travel-information/at-the-airport/security-waiting-times', meta: { brand: 'ita' },
  });
  const airports = calls.find((c) => c.href.includes('/security-waiting-time/airports'));
  assert.equal(airports.href, 'https://www.lufthansa.com/service/api/security-waiting-time/airports');
  assert.equal(airports.headers['X-Portal'], 'ITA');
  assert.ok(calls.some((c) => c.href.endsWith('/service/api/labels/securitywaitingtime/ita/en')));
  assert.ok(block.querySelector('select'));
  answers.airports = () => json({}, 500);
  window.sessionStorage.clear();
  const failed = await page({
    host: 'ita.turnsthe.page', path: '/it/en/book-and-prepare/travel-information/at-the-airport/security-waiting-times', meta: { brand: 'ita' },
  });
  assert.equal(failed.querySelector('.security-waiting-time-fallback a').getAttribute('href'), 'https://www.ita-airways.com/it/en/book-and-prepare/travel-information/at-the-airport/security-waiting-times');
});

test('the Live page row sets the fallback link', async () => {
  answers.airports = () => json({}, 500);
  const block = await page({ rows: [['Live page', '<a href="https://www.lufthansa.com/de/en/security-waiting-time">Waiting times</a>']] });
  assert.equal(block.querySelector('.security-waiting-time-fallback a').getAttribute('href'), 'https://www.lufthansa.com/de/en/security-waiting-time');
});

const ITA_IT = { host: 'ita.turnsthe.page', path: '/it/it/book-and-prepare/travel-information/at-the-airport/security-waiting-times', meta: { brand: 'ita' } };
const optionsOf = (block) => [...block.querySelectorAll('select option')].filter((o) => o.value).map((o) => [o.value, o.textContent]);

test('ITA it/it: the POST with ITA\'s portal and Italian; the 12 airports named in Italian, in the airports\' order', async () => {
  answers.airports = () => json(fixture('ita-airports'));
  answers.labels = () => json(fixture('ita-labels-it'));
  answers.names = (init) => (init.method === 'POST' ? json(namesFor('ita-names-it-post', init)) : json(fixture('ita-names-it-get')));
  const block = await page({ ...ITA_IT, search: '?airport=FRA' });
  const names = calls.filter((c) => c.href.includes('/catalogs/airportnames'));
  assert.equal(names.length, 1);
  assert.equal(names[0].href, 'https://www.lufthansa.com/service/api/catalogs/airportnames');
  assert.equal(names[0].method, 'POST');
  assert.deepEqual(JSON.parse(names[0].body).airports.map((a) => a.code), fixture('ita-airports').airports);
  assert.deepEqual([names[0].headers['X-Portal'], names[0].headers['X-Portal-Site'], names[0].headers['X-Portal-Language']], ['ITA', 'IT', 'it']);
  assert.deepEqual(optionsOf(block).map(([c]) => c), fixture('ita-airports').airports, 'the airports\' order');
  assert.deepEqual(optionsOf(block).slice(4, 6), [['FRA', 'Francoforte - Frankfurt/Main International'], ['MUC', 'Monaco']]);
  assert.ok(optionsOf(block).every(([c, name]) => name !== c), 'no code shown');
  // ITA's Italian labels (2026-11-01) hold www's screen-reader sentence in English, as www's widget
  // reads it out; the visible texts are Italian
  const sr = block.querySelector('.security-waiting-time-sr').textContent;
  assert.match(sr, /^Terminal 1, Area A, Estimated wait time 5 to 10 minutes\. Ultimo aggiornamento: /);
  assert.equal(block.querySelector('label').textContent, 'Seleziona l\'aeroporto');
});

test('lh-com de/de and Discover: the POST with each brand\'s portal and the page\'s language', async () => {
  answers.names = (init) => (init.method === 'POST' ? json(namesFor('lh-names-de-post', init)) : json({}));
  const de = await page({ path: '/de/de/reisevorbereitung/flughafeninformationen/services-am-flughafen/wartezeiten-sicherheitskontrolle' });
  let names = calls.filter((c) => c.href.includes('/catalogs/airportnames'));
  assert.deepEqual([names[0].method, names[0].headers['X-Portal'], names[0].headers['X-Portal-Site'], names[0].headers['X-Portal-Language']], ['POST', 'LH', 'DE', 'de']);
  assert.deepEqual(optionsOf(de), [['BER', 'Berlin - Brandenburg'], ['FRA', 'Frankfurt/Main International'], ['MUC', 'München - Franz Josef Strauss']]);
  calls = [];
  answers.names = (init) => (init.method === 'POST' ? json(namesFor('four_y-names-en-post', init)) : json({}));
  const discover = await page({
    host: 'discover.turnsthe.page', path: '/de/en/book/travel-information/airport-info/security-check-time-slot', meta: { brand: 'discover' },
  });
  names = calls.filter((c) => c.href.includes('/catalogs/airportnames'));
  assert.deepEqual([names[0].href, names[0].method, names[0].headers['X-Portal'], names[0].headers['X-Portal-Site'], names[0].headers['X-Portal-Language']], ['https://www.lufthansa.com/service/api/catalogs/airportnames', 'POST', 'FOUR_Y', 'DE', 'en']);
  assert.deepEqual(optionsOf(discover), [['BER', 'Berlin - Brandenburg'], ['FRA', 'Frankfurt/Main International'], ['MUC', 'Munich']]);
});

test('the names call fails: the codes, as before; no retries beyond lh-data\'s for a direct route', async () => {
  answers.names = () => new Response('<html>Just a moment...</html>', { status: 403, headers: { 'content-type': 'text/html' } });
  const block = await page({ search: '?airport=FRA' });
  assert.deepEqual(optionsOf(block), [['BER', 'BER'], ['FRA', 'FRA'], ['MUC', 'MUC']]);
  assert.deepEqual(areas(block), [['A', '5 - 10 min', 'LOW'], ['B', 'closed', 'CLOSED']], 'the waiting times all the same');
  const posts = () => calls.filter((c) => c.href.includes('/catalogs/airportnames')).length;
  assert.equal(posts(), 2, 'the call and lh-data\'s one retry of a direct route');
  await advance(60000);
  assert.equal(posts(), 2, 'no late try for the names');
  // the next page load of the session: lh-data skips the refused route (10 minutes), the codes
  await page();
  assert.equal(posts(), 2);
  // a partial answer: the names it has, the codes of the others
  window.sessionStorage.clear();
  answers.names = () => json({ airports: [{ code: 'MUC', airport: 'Munich' }] });
  assert.deepEqual(optionsOf(await page()), [['BER', 'BER'], ['FRA', 'FRA'], ['MUC', 'Munich']]);
});

test('no airports: no names call', async () => {
  answers.airports = () => json({}, 500);
  await page();
  assert.equal(calls.filter((c) => c.href.includes('/catalogs/airportnames')).length, 0);
});
