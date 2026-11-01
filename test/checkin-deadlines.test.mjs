/* eslint-disable max-len */
/* The check-in deadline search (blocks/checkin-deadlines), as www's CheckinDeadlineSearch
   (.checkindeadlinesearch > .dcep-checkin-deadline-search): travel class (ECE Economy/Premium
   Economy, FBE Business/First), country, airport, Search; the airport's terminal, counter and
   deadline, then its off-airport and on-airport services. Answers: www's own (fixtures from
   www.austrian.com's page, 2026-11-01).
   - requests: labels/checkindeadlinesearch/<portal>/<lang>, catalogs/checkin/info/countries,
     .../airports?country=AT, .../deadlines?airport=VIE&isEconomy=true (FBE: false, as www's
     onSubmit: cabin === "ECE");
   - the airports' duplicates dropped; deadlines with and without services; a service's
     CIS_Label_* name from the labels, a service www has no label for and no data left out;
   - the origin: Austrian's own www (answers our hosts cross-origin), Brussels' and lh-com's
     www.lufthansa.com (www.brusselsairlines.com sends no CORS headers), the brand's portal;
   - a failed call: the retries of the price routes, the link to the airline's www page, one late
     try that brings the form (or the results) in place.
   Time is mocked (setTimeout, Date): the test moves it in 100 ms steps.
   Run: node --max-old-space-size=512 --test test/checkin-deadlines.test.mjs */
/* global globalThis */
import test, { beforeEach, afterEach, mock } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';

const fixture = (name) => fs.readFileSync(new URL(`./fixtures/checkin-deadlines/${name}.json`, import.meta.url), 'utf8');
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
const at = (host, pathname) => {
  window.location = {
    hostname: host, pathname, search: '', hash: '', replace: () => {}, href: `https://${host}${pathname}`, origin: `https://${host}`,
  };
  window.origin = window.location.origin;
};
at('austrian.turnsthe.page', '/at/en/check-in-deadlines');
window.matchMedia = () => ({ matches: false, addEventListener: () => {}, addListener: () => {} });
window.sessionStorage = store();
window.localStorage = store();
Object.defineProperty(window.HTMLSelectElement.prototype, 'value', {
  configurable: true,
  get() { return (this.querySelector('option[selected]') || this.querySelector('option') || {}).value || ''; },
  set(v) { [...this.querySelectorAll('option')].forEach((o) => o.toggleAttribute('selected', o.value === v)); },
});
globalThis.window = window;
globalThis.document = document;
globalThis.NodeFilter = { SHOW_ELEMENT: 1, SHOW_TEXT: 4 };

const json = (text) => new Response(text, { status: 200, headers: { 'content-type': 'application/json' } });
const challenge = () => new Response('<html>Just a moment...</html>', { status: 403, headers: { 'content-type': 'text/html', 'cf-mitigated': 'challenge' } });
const NOW = Date.parse('2026-11-01T12:00:00Z');
let calls;
let plan;
let answers;
beforeEach(() => {
  window.sessionStorage.clear();
  calls = [];
  plan = {};
  answers = {
    '/service/api/labels/checkindeadlinesearch/os/en': fixture('os-labels-en'),
    '/service/api/labels/checkindeadlinesearch/os/de': fixture('os-labels-de'),
    '/service/api/labels/checkindeadlinesearch/sn/en': fixture('sn-labels-en'),
    '/service/api/catalogs/checkin/info/countries': fixture('os-countries'),
    '/service/api/catalogs/checkin/info/airports?country=AT': fixture('os-airports-AT'),
    '/service/api/catalogs/checkin/info/deadlines?airport=VIE&isEconomy=true': fixture('os-deadlines-VIE-eco'),
    '/service/api/catalogs/checkin/info/deadlines?airport=VIE&isEconomy=false': fixture('os-deadlines-VIE-bus'),
    '/service/api/catalogs/checkin/info/deadlines?airport=FRA&isEconomy=true': fixture('os-deadlines-FRA-eco'),
    '/service/api/catalogs/checkin/info/deadlines?airport=BRU&isEconomy=true': fixture('sn-deadlines-BRU-eco'),
  };
  mock.timers.enable({ apis: ['setTimeout', 'Date'], now: NOW });
  globalThis.fetch = async (url, init = {}) => {
    const href = String(url);
    if (href.includes('/data/recorded/')) return json(JSON.stringify({ entries: {} }));
    const u = new URL(href, 'https://austrian.turnsthe.page');
    const route = `${u.pathname}${u.search}`;
    if (!route.startsWith('/service/api/')) return new Response('', { status: 404 });
    calls.push({ origin: u.origin, route, headers: init.headers || {} });
    const pathOnly = u.pathname;
    const queue = plan[pathOnly];
    if (queue && queue.length && queue.shift() === 'challenge') return challenge();
    return answers[route] ? json(answers[route]) : new Response('{}', { status: 404, headers: { 'content-type': 'application/json' } });
  };
});
afterEach(() => mock.timers.reset());

const api = await import('../scripts/lh-api.js');
const { lhFetch, isLiveOnlyRoute, priceBackoffMs } = await import('../scripts/lh-data.js');
const { serviceOrigin } = await import('../scripts/locale.js');
const { default: decorate, serviceRows, checkinLabels } = await import('../blocks/checkin-deadlines/checkin-deadlines.js');

const flush = () => new Promise((resolve) => { setImmediate(resolve); });
const advance = async (ms) => {
  for (let t = 0; t < ms; t += 100) {
    // eslint-disable-next-line no-await-in-loop
    await flush();
    mock.timers.tick(100);
  }
  await flush();
};
const settle = async (promise) => {
  let done = false;
  promise.then(() => { done = true; }, () => { done = true; });
  for (let i = 0; i < 300 && !done; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    await advance(100);
  }
  return promise;
};
const onBrand = (brand) => { document.head.innerHTML = brand ? `<meta name="brand" content="${brand}">` : ''; };
const block = (brand, rows = []) => {
  onBrand(brand);
  const el = document.createElement('div');
  el.className = 'checkin-deadlines';
  el.innerHTML = rows.map(([k, v]) => `<div><div>${k}</div><div>${v}</div></div>`).join('');
  document.body.replaceChildren(el);
  return el;
};
const choose = async (select, value) => {
  select.value = value;
  select.dispatchEvent(new window.Event('change', { bubbles: true }));
  await advance(300);
};
const submit = async (el) => {
  el.querySelector('form').dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
  await advance(300);
};
const texts = (nodes) => [...nodes].map((n) => n.textContent.replace(/\s+/g, ' ').trim());

test('requests: www\'s routes; Business/First is isEconomy=false', () => {
  assert.deepEqual(api.checkinCountriesRequest(), { method: 'GET', route: '/service/api/catalogs/checkin/info/countries' });
  assert.deepEqual(api.checkinAirportsRequest('AT'), { method: 'GET', route: '/service/api/catalogs/checkin/info/airports?country=AT' });
  assert.equal(api.checkinDeadlinesRequest({ airport: 'VIE', cabin: 'ECE' }).route, '/service/api/catalogs/checkin/info/deadlines?airport=VIE&isEconomy=true');
  assert.equal(api.checkinDeadlinesRequest({ airport: 'VIE', cabin: 'FBE' }).route, '/service/api/catalogs/checkin/info/deadlines?airport=VIE&isEconomy=false');
  assert.equal(api.checkinDeadlinesRequest({ airport: 'VIE' }).route, '/service/api/catalogs/checkin/info/deadlines?airport=VIE&isEconomy=true', 'www\'s initial class: ECE');
  assert.deepEqual(api.CHECKIN_CABINS, ['ECE', 'FBE']);
  ['/service/api/catalogs/checkin/info/countries', '/service/api/catalogs/checkin/info/airports?country=AT', '/service/api/catalogs/checkin/info/deadlines?airport=VIE&isEconomy=true', '/service/api/labels/checkindeadlinesearch/os/en']
    .forEach((r) => assert.ok(isLiveOnlyRoute(r), r));
  assert.ok(!isLiveOnlyRoute('/service/api/labels/flightmanager/os/en'), 'other labels as before');
  assert.ok(!isLiveOnlyRoute('/service/api/catalogs/airportnames'), 'other catalogs as before');
});

test('country -> airports: the duplicates dropped, www\'s order', () => {
  const countries = api.mapCheckinCountries(JSON.parse(fixture('os-countries')));
  assert.equal(countries[0].code, 'AL');
  assert.deepEqual(countries.find((c) => c.code === 'AT'), { code: 'AT', name: 'Austria' });
  const airports = api.mapCheckinAirports(JSON.parse(fixture('os-airports-AT')));
  assert.deepEqual(airports.map((a) => a.code), ['GRZ', 'INN', 'KLU', 'LNZ', 'SZG', 'VIE'], '18 entries, 6 airports');
  assert.equal(airports[5].name, 'Vienna International');
  assert.deepEqual(api.mapCheckinAirports({}), []);
  assert.deepEqual(api.mapCheckinAirports({ airports: [{ code: 'VIE' }, null, { airport: 'x' }] }), [{ code: 'VIE', name: 'VIE' }], 'no name: the code; no code: left out');
});

test('deadlines: without services (VIE), with services (FRA, BRU)', () => {
  const vie = api.mapCheckinDeadlines(JSON.parse(fixture('os-deadlines-VIE-eco')));
  assert.deepEqual(vie, [{
    terminal: '3', counter: '332-361', deadline: '50', explanation: '', offAirport: [], atAirport: [],
  }]);
  const [fra] = api.mapCheckinDeadlines(JSON.parse(fixture('os-deadlines-FRA-eco')));
  assert.equal(fra.atAirport.length, 1);
  assert.deepEqual(fra.atAirport[0], {
    service: 'CIS_Label_26', availability: '2', deadline: '5:00 – 22:00 h, 23h before departure', link: '', linkText: 'Hall B, Fast Bag Drop', dropOffDeadline: '5:00 – 22:00 h, 23h before departure', dropOffLocation: 'Hall B, Fast Bag Drop',
  });
  const [bru] = api.mapCheckinDeadlines(JSON.parse(fixture('sn-deadlines-BRU-eco')));
  assert.deepEqual(bru.offAirport.map((s) => s.service), ['CIS_Label_31', 'CIS_Label_32', 'CIS_Label_33']);
  assert.deepEqual(api.mapCheckinDeadlines({ checkinInfos: [] }), []);
  assert.deepEqual(api.mapCheckinDeadlines(null), []);

  const labels = checkinLabels(JSON.parse(fixture('sn-labels-en')), {}, 'en');
  const rows = serviceRows(bru.atAirport, labels, '');
  assert.deepEqual(rows.map((r) => r.name), ['Kiosk Check-in', 'Late Night Check-in'], 'CIS_Label_35: no label on www and no data: left out');
  const osLabels = checkinLabels(JSON.parse(fixture('os-labels-en')), {}, 'en');
  const [late] = serviceRows(fra.atAirport, osLabels, '');
  assert.deepEqual(late, {
    name: 'Late night check-in', availability: 'All passengers', deadline: '5:00 – 22:00 h, 23h before departure', link: null, linkText: 'Hall B, Fast Bag Drop', dropOffDeadline: '5:00 – 22:00 h, 23h before departure', dropOffLocation: 'Hall B, Fast Bag Drop',
  });
  const [own] = serviceRows([{ service: 'CIS_Label_31', availability: '2', link: 'GET FROM AEM', linkText: 'Online check-in' }], osLabels, 'https://wci.austrian.com/app/ck.fly');
  assert.deepEqual(own.link, { href: 'https://wci.austrian.com/app/ck.fly', text: 'Online check-in' }, 'GET FROM AEM: the page\'s check-in link');
  const [plain] = serviceRows([{ service: 'CIS_Label_31', link: 'GET FROM AEM', linkText: 'Online check-in' }], osLabels, '');
  assert.equal(plain.link, null, 'no check-in link: the text');
});

test('origin: Austrian\'s own www; Brussels and lh-com www.lufthansa.com; the brand\'s portal', async () => {
  onBrand('austrian');
  assert.equal(serviceOrigin(), 'https://www.austrian.com');
  await lhFetch('/service/api/catalogs/checkin/info/countries', { market: 'at/en', origin: serviceOrigin() });
  assert.equal(calls[0].origin, 'https://www.austrian.com');
  assert.equal(calls[0].headers['X-Portal'], 'OS');
  onBrand('brussels');
  assert.equal(serviceOrigin(), 'https://www.lufthansa.com');
  onBrand('');
  assert.equal(serviceOrigin(), 'https://www.lufthansa.com');
  calls = [];
  answers['/service/api/catalogs/airportnames'] = '{"airportnames":[]}';
  await lhFetch('/service/api/catalogs/airportnames', { market: 'de/en' });
  assert.equal(calls[0].origin, 'https://www.lufthansa.com', 'without the option: as before');
});

test('Austrian: country -> airports -> Search: the airport\'s summary, no services', async () => {
  const el = block('austrian', [['Check-in link', 'https://wci.austrian.com/app/ck.fly'], ['Fallback', '<a href="https://www.austrian.com/at/en/check-in-deadlines">Check-in times</a>']]);
  await settle(decorate(el));
  const [cabin, country, airport] = el.querySelectorAll('select');
  assert.deepEqual(texts(el.querySelectorAll('label')), ['Travel class', 'Country', 'Airport']);
  assert.deepEqual(texts(cabin.querySelectorAll('option')), ['Economy/Premium Economy', 'Business/First']);
  assert.equal(cabin.value, 'ECE');
  assert.equal(country.querySelectorAll('option').length, JSON.parse(fixture('os-countries')).countries.length + 1, 'a blank first option');
  assert.ok(airport.disabled);
  assert.ok(el.querySelector('.checkin-deadlines-submit').disabled);
  assert.equal(el.querySelector('.checkin-deadlines-submit').textContent, 'Search');
  assert.ok(el.querySelector('.checkin-deadlines-fallback').hidden);
  assert.ok(calls.every((c) => c.origin === 'https://www.austrian.com'));
  await choose(country, 'AT');
  assert.equal(airport.disabled, false);
  assert.deepEqual([...airport.querySelectorAll('option')].map((o) => o.value), ['', 'GRZ', 'INN', 'KLU', 'LNZ', 'SZG', 'VIE']);
  await choose(airport, 'VIE');
  assert.equal(el.querySelector('.checkin-deadlines-submit').disabled, false);
  await submit(el);
  assert.equal(calls.at(-1).route, '/service/api/catalogs/checkin/info/deadlines?airport=VIE&isEconomy=true');
  assert.equal(el.querySelector('.checkin-deadlines-results h2').textContent, 'Airport Vienna International');
  assert.deepEqual(texts(el.querySelectorAll('.checkin-deadlines-summary th')), ['Terminal', 'Check-in counter', 'Check-in deadline before departure (in min.)']);
  assert.deepEqual(texts(el.querySelectorAll('.checkin-deadlines-summary td')), ['3', '332-361', '50']);
  assert.equal(el.querySelectorAll('.checkin-deadlines-results h3').length, 0, 'no services: no tables');
  assert.equal(el.dataset.lhSource, 'live');
});

test('Business/First: isEconomy=false and its counter', async () => {
  const el = block('austrian');
  await settle(decorate(el));
  const [cabin, country, airport] = el.querySelectorAll('select');
  await choose(cabin, 'FBE');
  await choose(country, 'AT');
  await choose(airport, 'VIE');
  await submit(el);
  assert.equal(calls.at(-1).route, '/service/api/catalogs/checkin/info/deadlines?airport=VIE&isEconomy=false');
  assert.deepEqual(texts(el.querySelectorAll('.checkin-deadlines-summary td')), ['3', 'Priority Check-in Zone', '40']);
});

test('Brussels: www.lufthansa.com with SN; services off-airport first, then at the airport', async () => {
  at('brussels.turnsthe.page', '/be/en/check-in-options-and-info/check-in-times');
  answers['/service/api/catalogs/checkin/info/airports?country=BE'] = '{"airports":[{"code":"BRU","airport":"Brussels - Airport"},{"code":"BRU","airport":"Brussels - Airport"}]}';
  try {
    const el = block('brussels');
    await settle(decorate(el));
    assert.ok(calls.length && calls.every((c) => c.origin === 'https://www.lufthansa.com' && c.headers['X-Portal'] === 'SN'));
    assert.ok(calls.some((c) => c.route === '/service/api/labels/checkindeadlinesearch/sn/en'));
    assert.equal(el.querySelector('.checkin-deadlines-submit').textContent, 'Show');
    const [, country, airport] = el.querySelectorAll('select');
    await choose(country, 'BE');
    assert.deepEqual([...airport.querySelectorAll('option')].map((o) => o.value), ['', 'BRU']);
    await choose(airport, 'BRU');
    await submit(el);
    assert.deepEqual(texts(el.querySelectorAll('.checkin-deadlines-results h3')), ['Off-airport services', 'On-airport services']);
    const tables = el.querySelectorAll('.checkin-deadlines-table');
    assert.deepEqual(texts(tables[0].querySelectorAll('thead th')), ['Check-in services', 'available for', 'until (in min) prior departure', 'Check-in and Information', 'Bag drop-off until (in min)', 'Bag drop-off location no.']);
    assert.deepEqual(texts(tables[0].querySelectorAll('tbody tr > :first-child')), ['Online Check-in', 'Mobile Check-in', 'Automated Check-in']);
    assert.deepEqual(texts(tables[1].querySelectorAll('tbody tr > :first-child')), ['Kiosk Check-in', 'Late Night Check-in']);
  } finally {
    at('austrian.turnsthe.page', '/at/en/check-in-deadlines');
  }
});

test('labels: German from www; an authored row wins; nothing loads: built-in English', async () => {
  at('austrian.turnsthe.page', '/at/de/check-in-annahmeschlusszeiten');
  try {
    const el = block('austrian', [['Submit label', 'Suchen']]);
    await settle(decorate(el));
    assert.deepEqual(texts(el.querySelectorAll('label')), ['Reiseklasse', 'Land', 'Flughafen']);
    assert.equal(el.querySelector('.checkin-deadlines-submit').textContent, 'Suchen', 'www: "Informationen finden"; the row wins');
  } finally {
    at('austrian.turnsthe.page', '/at/en/check-in-deadlines');
  }
  const built = checkinLabels({}, {}, 'en');
  assert.equal(built['submit label'], 'Display check-in data', 'www\'s own default');
  assert.equal(built['economy label'], 'Economy/Premium Economy Class');
});

test('failed call: the retries, the link to www, one late try brings the form', async () => {
  plan['/service/api/catalogs/checkin/info/countries'] = ['challenge', 'challenge', 'challenge'];
  const el = block('austrian', [['Fallback', '<a href="https://www.austrian.com/at/en/check-in-deadlines">Check-in times</a>']]);
  await settle(decorate(el));
  const countryCalls = () => calls.filter((c) => c.route.endsWith('/countries')).length;
  assert.equal(countryCalls(), 3, 'three attempts, as a price route');
  const fallback = el.querySelector('.checkin-deadlines-fallback');
  assert.equal(fallback.hidden, false);
  assert.equal(fallback.querySelector('a').getAttribute('href'), 'https://www.austrian.com/at/en/check-in-deadlines');
  assert.ok(el.querySelector('form').hidden);
  assert.equal(el.dataset.lhSource, 'none');
  await advance(priceBackoffMs(1) + 500);
  assert.equal(countryCalls(), 4, 'one late try');
  assert.equal(el.querySelector('form').hidden, false);
  assert.ok(fallback.hidden);
  assert.equal(el.dataset.lhSource, 'live');
  await advance(60000);
  assert.equal(countryCalls(), 4, 'nothing more');
});

test('failed call: no fallback row: www\'s page of the same path', async () => {
  plan['/service/api/catalogs/checkin/info/countries'] = Array(6).fill('challenge');
  const el = block('austrian');
  await settle(decorate(el));
  const link = el.querySelector('.checkin-deadlines-fallback a');
  assert.equal(link.getAttribute('href'), 'https://www.austrian.com/at/en/check-in-deadlines');
  assert.equal(link.textContent, 'Check-in deadlines');
  await advance(priceBackoffMs(1) + 500);
  assert.ok(el.querySelector('form').hidden, 'the late try failed too: the link stays');
});

test('failed search: the failure text and the link; the late try shows the results', async () => {
  const el = block('austrian');
  await settle(decorate(el));
  const [, country, airport] = el.querySelectorAll('select');
  await choose(country, 'AT');
  await choose(airport, 'VIE');
  plan['/service/api/catalogs/checkin/info/deadlines'] = ['challenge', 'challenge', 'challenge'];
  await submit(el);
  await advance(2000);
  assert.equal(el.querySelector('.checkin-deadlines-message').textContent, 'Results cannot be loaded.');
  assert.equal(el.querySelector('.checkin-deadlines-fallback').hidden, false);
  await advance(priceBackoffMs(1) + 500);
  assert.equal(el.querySelector('.checkin-deadlines-results h2').textContent, 'Airport Vienna International');
  assert.ok(el.querySelector('.checkin-deadlines-fallback').hidden);
});

test('no information for the airport: www\'s no-results text', async () => {
  answers['/service/api/catalogs/checkin/info/deadlines?airport=VIE&isEconomy=true'] = '{"checkinInfos":[]}';
  const el = block('austrian');
  await settle(decorate(el));
  const [, country, airport] = el.querySelectorAll('select');
  await choose(country, 'AT');
  await choose(airport, 'VIE');
  await submit(el);
  assert.equal(el.querySelector('.checkin-deadlines-message').textContent, 'Currently there is no information available for this airport.');
  assert.equal(el.querySelector('.checkin-deadlines-results h2'), null);
});
