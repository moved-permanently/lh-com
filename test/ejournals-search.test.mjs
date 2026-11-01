/* eslint-disable max-len */
/* eJournals (blocks/ejournals, brief 208), as www's component (@core/containers-ejournals, chunk
   e0840412; the same on Lufthansa, ITA, Austrian, Brussels):
   - on a brand site the lookup's live page and the login link are the brand's own www and Travel ID
     (scripts/brands.js www, travelId), not Lufthansa's;
   - the manual search: "Booking code or ticket number" and "Last name"; 13 digits = {ticketNumber,
     lastName}, 6 characters = {bookingCode, lastName}; POST /service/api/ejournals with the page's
     X-Portal headers (scripts/lh-data.js: direct on www.lufthansa.com from our hosts, live only);
   - the answer's tickets with their segments (flight, date, origin, destination) and "Download
     eJournals", a link to the ticket's deepLink (targetURL with its parameters, a new window when
     newWindow); no tickets: www's message; an error (400 text/html from www for a request it refuses,
     2026-11-01): a message and the page on www;
   - partner links: ?lastname=…&pnrfilekey=… (www's sessionValues names) prefill and submit;
   - signed in on the airline's own host only (and with a Trips endpoint row): the traveller's
     bookings from <endpoint>/flights/v3/me/upcoming-trips, a chosen one searched, "My flight is not
     displayed" opens the manual entry; inert everywhere else.
   Answers: from lufthansa.turnsthe.page over Bright Data with made-up data (2026-11-01): {"tickets":[]};
   a ticket in the shape of www's schema (EjournalsResponse: segments, deepLink).
   Run: node --max-old-space-size=512 --test test/ejournals-search.test.mjs */
/* global globalThis */
import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
window.hlx = { codeBasePath: '' };
const at = (host, pathname, search = '') => {
  window.location = {
    hostname: host, pathname, search, hash: '', replace: () => {}, href: `https://${host}${pathname}${search}`, origin: `https://${host}`,
  };
};
at('lufthansa.turnsthe.page', '/de/en/lufthansa-ejournals');
window.origin = 'https://lufthansa.turnsthe.page';
window.matchMedia = () => ({ matches: false, addEventListener: () => {}, addListener: () => {} });
const store = () => {
  const m = new Map();
  return {
    getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k), clear: () => m.clear(),
  };
};
window.sessionStorage = store();
window.localStorage = store();
globalThis.window = window;
globalThis.document = document;
globalThis.Event = window.Event;
globalThis.NodeFilter = { SHOW_ELEMENT: 1, SHOW_TEXT: 4 };

const TICKETS = {
  bookingCode: 'ABC123',
  tickets: [{
    segments: [
      {
        carrier: 'LH', flightNumber: '400', departureDate: '2026-12-01T10:15:00', origin: { code: 'FRA', airport: 'Frankfurt' }, destination: { code: 'JFK', airport: 'New York' },
      },
      {
        carrier: 'LH', flightNumber: '401', departureDate: '2026-12-08T18:30:00', origin: { code: 'JFK', airport: 'New York' }, destination: { code: 'FRA', airport: 'Frankfurt' },
      },
    ],
    deepLink: { targetURL: 'https://ejournals.example/kiosk', parameters: [{ key: 'token', values: ['t0k3n'] }, { key: 'lang', values: ['en'] }], newWindow: true },
  }],
};
const TRIPS = {
  totalElements: 1,
  content: [{
    meta: { bookingCode: 'XYZ999', identifyingPassenger: { lastName: 'Muster' } },
    departure: { airportCode: 'MUC', cityName: 'Munich', localDate: '15.12.2026' },
    arrival: { airportCode: 'LAX', cityName: 'Los Angeles' },
  }],
};
let calls;
let answers;
const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json' } });
beforeEach(() => {
  window.sessionStorage.clear();
  calls = [];
  answers = {
    ejournals: () => json(TICKETS),
    trips: () => json(TRIPS),
  };
  globalThis.fetch = async (url, init = {}) => {
    const href = String(url);
    if (href.includes('/data/recorded/')) return json({ entries: {} });
    calls.push({
      href, method: init.method || 'GET', headers: init.headers || {}, body: init.body ? JSON.parse(init.body) : undefined, credentials: init.credentials,
    });
    if (href.endsWith('/service/api/ejournals')) return answers.ejournals();
    if (href.endsWith('/flights/v3/me/upcoming-trips')) return answers.trips();
    return json({}, 404);
  };
});

const { default: decorate, readEjournalsSettings } = await import('../blocks/ejournals/ejournals.js');
const {
  isDirectRoute, isLiveOnlyRoute, isDirectRouteBlocked, lhFetch,
} = await import('../scripts/lh-data.js');
const { BRANDS } = await import('../scripts/brands.js');

const tick = () => new Promise((r) => { setImmediate(r); });
const flush = () => Array.from({ length: 30 }).reduce((p) => p.then(tick), Promise.resolve());
const meta = (m) => { document.head.innerHTML = Object.entries(m).map(([k, v]) => `<meta name="${k}" content="${v}">`).join(''); };
const block = async (rows = []) => {
  const el = document.createElement('div');
  el.className = 'ejournals';
  el.innerHTML = rows.map(([k, v]) => `<div><div>${k}</div><div>${v}</div></div>`).join('');
  document.body.replaceChildren(el);
  await decorate(el);
  await flush();
  return el;
};
const search = async (el, reference, lastName) => {
  el.querySelector('input[name="pnrOrTicketNumber"]').value = reference;
  el.querySelector('input[name="lastName"]').value = lastName;
  el.querySelector('form.ejournals-form').dispatchEvent(new window.Event('submit', { cancelable: true }));
  await flush();
};
const ejournalsCalls = () => calls.filter((c) => c.href.endsWith('/service/api/ejournals'));

test('brand sites: the live page and the login link are the brand\'s own www and Travel ID (scripts/brands.js)', () => {
  const cases = [
    [{}, 'lufthansa.turnsthe.page', '/de/en/lufthansa-ejournals', 'www.lufthansa.com', 'api.travelid.lufthansa.com', 'yA8iz2C5BnAIf2GKKdkAlgPPW9y6wjLO'],
    [{ brand: 'brussels' }, 'brussels.turnsthe.page', '/be/en/extra-services/inflight-services/ejournals', 'www.brusselsairlines.com', 'api.travelid.brusselsairlines.com', 'FuBoxl39ln5fAfvIAX18xIi2BI4d6rny'],
    [{ brand: 'ita' }, 'ita.turnsthe.page', '/it/en/book-and-prepare/travel-information/at-the-airport/digital-newsstand', 'www.ita-airways.com', 'api.travelid.ita-airways.com', '14eKnYUwomcAimITtmaa2GqBM5mhO8kAS3GjTyE6RDsFaWrI'],
    [{ brand: 'austrian' }, 'austrian.turnsthe.page', '/at/en/ejournals', 'www.austrian.com', 'api.travelid.austrian.com', 'dFquxAQT637lrYALS9UKBMieeibyGaVQ'],
    [{ brand: 'discover' }, 'discover.turnsthe.page', '/de/en/ejournals', 'www.discover-airlines.com', 'api.travelid.discover-airlines.com', 'NqkvGG8MB6OeCkb66a02D0ORHOFhQWJ4'],
  ];
  cases.forEach(([m, host, path, www, travelId, clientId]) => {
    meta(m);
    at(host, path);
    const s = readEjournalsSettings({}, { country: path.split('/')[1], lang: path.split('/')[2] });
    assert.equal(new URL(s.liveUrl).host, www, `${host} live page`);
    assert.equal(new URL(s.liveUrl).pathname, path);
    const login = new URL(s.loginUrl);
    assert.equal(login.host, travelId, `${host} Travel ID`);
    assert.equal(login.searchParams.get('client_id'), clientId);
    assert.equal(login.searchParams.get('redirect_uri'), `https://${www}`);
    assert.equal(login.searchParams.get('state'), path);
  });
  ['ita', 'austrian', 'brussels', 'discover'].forEach((k) => assert.ok(BRANDS[k].travelId && BRANDS[k].travelId.clientId, k));
});

test('lh-data: /service/api/ejournals is direct and live only (never a recorded answer), a failure never refuses the next search', async () => {
  assert.equal(isDirectRoute('/service/api/ejournals'), true);
  assert.equal(isLiveOnlyRoute('/service/api/ejournals'), true);
  meta({});
  at('lufthansa.turnsthe.page', '/de/en/lufthansa-ejournals');
  globalThis.fetch = async (url) => {
    calls.push({ href: String(url) });
    throw new TypeError('Failed to fetch');
  };
  await assert.rejects(lhFetch('/service/api/ejournals', { method: 'POST', body: { bookingCode: 'ABC123', lastName: 'Doe' }, market: 'de/en' }));
  assert.equal(calls.length, 3, 'the price routes\' two retries');
  assert.equal(isDirectRouteBlocked('/service/api/ejournals', 'https://www.lufthansa.com'), false);
  assert.equal(window.sessionStorage.getItem('lh-price-backoff'), null);
});

test('the manual search: 6 characters = bookingCode, 13 digits = ticketNumber, with the page\'s X-Portal headers', async () => {
  meta({});
  at('lufthansa.turnsthe.page', '/de/en/lufthansa-ejournals');
  answers.ejournals = () => json({ tickets: [] });
  const el = await block();
  await search(el, ' abc123 ', ' Doe ');
  await search(el, '2201234567890', 'Doe');
  const [first, second] = ejournalsCalls();
  assert.equal(first.href, 'https://www.lufthansa.com/service/api/ejournals');
  assert.equal(first.method, 'POST');
  assert.deepEqual(first.body, { bookingCode: 'ABC123', lastName: 'Doe' });
  assert.deepEqual(second.body, { ticketNumber: '2201234567890', lastName: 'Doe' });
  assert.deepEqual([first.headers['X-Portal'], first.headers['X-Portal-Site'], first.headers['X-Portal-Language']], ['LH', 'DE', 'en']);
});

test('the manual search: www\'s validation, nothing sent', async () => {
  meta({});
  at('lufthansa.turnsthe.page', '/de/en/lufthansa-ejournals');
  const el = await block();
  await search(el, 'AB12', '');
  assert.equal(ejournalsCalls().length, 0);
  const errors = [...el.querySelectorAll('.ejournals-error:not([hidden])')].map((e) => e.textContent);
  assert.deepEqual(errors, ['Invalid booking code or ticket number', 'Please enter your last name as booked.']);
});

test('tickets with segments: the booking code, the flights, "Download" (www\'s live label; the component default "Download eJournals") to the deep link; New search', async () => {
  meta({});
  at('lufthansa.turnsthe.page', '/de/en/lufthansa-ejournals');
  const el = await block();
  await search(el, 'ABC123', 'Doe');
  const results = el.querySelector('.ejournals-results');
  assert.ok(results);
  // www's live label "Booking code" has no {CODE}: the code after it
  assert.equal(results.querySelector('h2').textContent, 'Booking code: ABC123');
  assert.equal(results.querySelector('h3').textContent, 'Flights');
  const rows = [...results.querySelectorAll('.ejournals-flight')].map((r) => [
    r.querySelector('.ejournals-flight-number').textContent,
    r.querySelector('.ejournals-flight-date').textContent,
    r.querySelector('.ejournals-flight-route').textContent,
    r.querySelector('.ejournals-sr').textContent,
  ]);
  assert.deepEqual(rows, [
    ['LH 400', 'Tue, 01.12.2026', 'FRA – JFK', 'Frankfurt to New York'],
    ['LH 401', 'Tue, 08.12.2026', 'JFK – FRA', 'New York to Frankfurt'],
  ]);
  const download = results.querySelector('a.ejournals-download');
  assert.equal(download.textContent, 'Download');
  assert.equal(download.getAttribute('href'), 'https://ejournals.example/kiosk?token=t0k3n&lang=en');
  assert.equal(download.getAttribute('target'), '_blank');
  assert.equal(el.querySelector('form.ejournals-form').hidden, true, 'the form gives way to the results');
  el.querySelector('.ejournals-search-again').click();
  assert.equal(el.querySelector('form.ejournals-form').hidden, false);
  assert.equal(el.querySelector('.ejournals-results'), null);
});

test('no tickets: www\'s message, the form stays', async () => {
  meta({});
  at('lufthansa.turnsthe.page', '/de/en/lufthansa-ejournals');
  answers.ejournals = () => json({ tickets: [] });
  const el = await block();
  await search(el, 'ABC123', 'Doe');
  assert.equal(el.querySelector('.ejournals-message').textContent, 'Unfortunately, no tickets could be found for your search. Please check your input for spelling errors');
  assert.equal(el.querySelector('form.ejournals-form').hidden, false);
});

test('an error answer (www: 400 text/html): a message with the page on www, no tickets', async () => {
  meta({});
  at('lufthansa.turnsthe.page', '/de/en/lufthansa-ejournals');
  answers.ejournals = () => new Response('<!doctype html><title>HTTP Status 400 – Bad Request</title>', { status: 400, headers: { 'content-type': 'text/html;charset=utf-8' } });
  const el = await block();
  await search(el, 'ABC123', 'Doe');
  const message = el.querySelector('.ejournals-message');
  assert.match(message.textContent, /could not be loaded/);
  assert.equal(message.querySelector('a').getAttribute('href'), 'https://www.lufthansa.com/de/en/lufthansa-ejournals');
  assert.equal(el.querySelector('.ejournals-results'), null);
});

test('partner links: ?lastname and ?pnrfilekey (www\'s names) prefill and search', async () => {
  meta({});
  at('lufthansa.turnsthe.page', '/de/en/lufthansa-ejournals', '?pnrfilekey=abc123&lastname=Doe');
  const el = await block();
  assert.equal(el.querySelector('input[name="pnrOrTicketNumber"]').value, 'ABC123');
  assert.equal(el.querySelector('input[name="lastName"]').value, 'Doe');
  assert.deepEqual(ejournalsCalls().map((c) => c.body), [{ bookingCode: 'ABC123', lastName: 'Doe' }]);
  // one of the two: prefilled, not sent
  calls = [];
  at('lufthansa.turnsthe.page', '/de/en/lufthansa-ejournals', '?LastName=Doe');
  const half = await block();
  assert.equal(half.querySelector('input[name="lastName"]').value, 'Doe');
  assert.equal(ejournalsCalls().length, 0);
});

test('ITA: the search with X-Portal ITA, on www.lufthansa.com from its demo host', async () => {
  meta({ brand: 'ita' });
  at('ita.turnsthe.page', '/it/en/book-and-prepare/travel-information/at-the-airport/digital-newsstand');
  const el = await block();
  await search(el, 'ABC123', 'Doe');
  const [call] = ejournalsCalls();
  assert.equal(call.href, 'https://www.lufthansa.com/service/api/ejournals');
  assert.deepEqual([call.headers['X-Portal'], call.headers['X-Portal-Site'], call.headers['X-Portal-Language']], ['ITA', 'IT', 'en']);
});

test('Austrian: the search on www.austrian.com (its serviceOrigin answers our hosts: 200 {"tickets":[]}, 2026-11-01), X-Portal OS', async () => {
  meta({ brand: 'austrian' });
  at('austrian.turnsthe.page', '/at/en/ejournals');
  const el = await block();
  await search(el, 'ABC123', 'Doe');
  const [call] = ejournalsCalls();
  assert.equal(call.href, 'https://www.austrian.com/service/api/ejournals');
  assert.equal(call.headers['X-Portal'], 'OS');
});

const TRIPS_ROW = [['Trips endpoint', 'https://trips.example/api']];

test('signed in: inert on every host but the airline\'s own, and without the Trips endpoint row', async () => {
  meta({});
  at('lufthansa.turnsthe.page', '/de/en/lufthansa-ejournals');
  await block(TRIPS_ROW);
  at('www.lufthansa.com', '/de/en/lufthansa-ejournals');
  await block();
  assert.equal(calls.filter((c) => c.href.includes('upcoming-trips')).length, 0);
});

test('signed in on www.lufthansa.com: the bookings listed; a chosen one searched; "My flight is not displayed" opens the manual entry', async () => {
  meta({});
  at('www.lufthansa.com', '/de/en/lufthansa-ejournals');
  const el = await block(TRIPS_ROW);
  const trips = calls.find((c) => c.href.includes('upcoming-trips'));
  assert.equal(trips.href, 'https://trips.example/api/flights/v3/me/upcoming-trips');
  assert.equal(trips.credentials, 'include');
  assert.equal(trips.headers.tenant, 'LH');
  assert.equal(trips.headers.lang, 'en-DE');
  const list = el.querySelector('.ejournals-bookings');
  assert.ok(list);
  const choice = list.querySelector('button.ejournals-booking');
  assert.match(choice.textContent, /MUC/);
  assert.match(choice.textContent, /LAX/);
  assert.match(choice.textContent, /XYZ999/);
  assert.equal(el.querySelector('form.ejournals-form').hidden, true, 'the manual entry waits behind the list');
  choice.click();
  await flush();
  // same-origin on the airline's own host
  assert.deepEqual(ejournalsCalls().map((c) => [c.href, c.body]), [['/service/api/ejournals', { bookingCode: 'XYZ999', lastName: 'Muster' }]]);
  el.querySelector('.ejournals-search-again').click();
  el.querySelector('.ejournals-not-displayed').click();
  assert.equal(el.querySelector('form.ejournals-form').hidden, false);
});

test('signed out on www.lufthansa.com (the trips call refused): the manual entry as usual', async () => {
  meta({});
  at('www.lufthansa.com', '/de/en/lufthansa-ejournals');
  answers.trips = () => json({ error: 'unauthorized' }, 401);
  const el = await block(TRIPS_ROW);
  assert.equal(el.querySelector('.ejournals-bookings'), null);
  assert.equal(el.querySelector('form.ejournals-form').hidden, false);
});
