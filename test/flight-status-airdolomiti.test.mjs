/* eslint-disable max-len, no-await-in-loop, no-restricted-syntax */
/* Air Dolomiti's flight status by route and airport (blocks/flight-status in the format
   airdolomiti: rows Submit method post and Format airdolomiti, brand airdolomiti), as
   www.airdolomiti.it/stato-volo does it (recorded 2026-11-01, test/fixtures/airdolomiti-api; no
   live calls): the route and airport searches list the flights from api.airdolomiti.it
   (GET /v1/flights/by-route/<ORIG>-<DEST>?date=dd/mm/yyyy, /v1/flights/by-airport/<CODE>?date=&type=
   departure|destination), shown as www's result cards; a card asks POST /v1/bookings/flight-status
   {flight_date, flight_number} and posts the answer's payload to its url (the engine). The number
   search keeps its direct POST (the same fields www ends with). Without the Format row, and on
   other brands, route and airport stay the GET link to www.
   DOM nodes are compared with assert.ok(a === b) only.
   Run: node --max-old-space-size=512 --test test/flight-status-airdolomiti.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';

const fixture = (f) => JSON.parse(fs.readFileSync(new URL(`./fixtures/airdolomiti-api/${f}`, import.meta.url), 'utf8'));
const AIRPORTS = fixture('airports.json');
const ROUTE = fixture('flights-by-route-MUC-VRN.json');
const BY_AIRPORT = fixture('flights-by-airport-MUC.json');
const STATUS = fixture('flight-status-EN2156.json');

const HOST = 'main--lh-airdolomiti--moved-permanently.aem.page';
const { window } = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
window.hlx = { codeBasePath: '' };
window.origin = `https://${HOST}`;
window.matchMedia = () => ({ matches: false, addEventListener: () => {}, addListener: () => {} });
globalThis.window = window;
globalThis.Event = window.Event;
globalThis.CSS = { escape: (v) => String(v) };
const api = await import('../scripts/airdolomiti-api.js');
const block = await import('../blocks/flight-status/flight-status.js');

const tick = () => new Promise((r) => { setTimeout(r, 0); });
const settle = async () => { for (let i = 0; i < 8; i += 1) await tick(); };
const recorded = (status, answer) => {
  const calls = [];
  return {
    calls,
    fetchImpl: async (url, init = {}) => {
      calls.push({ url: String(url), init });
      return new Response(JSON.stringify(answer), { status, headers: { 'content-type': 'application/json' } });
    },
  };
};

test('API: www\'s requests byte for byte (route, airport departure and destination, flight status)', async () => {
  const r = recorded(200, ROUTE.answer);
  assert.deepEqual(await api.fetchFlightsByRoute('MUC', 'VRN', '2026-11-01', 'it', r.fetchImpl), ROUTE.answer);
  assert.equal(r.calls[0].url, ROUTE.url);
  assert.deepEqual(r.calls[0].init.headers, { 'Content-Type': 'application/json', 'Accept-Language': 'it' });
  assert.equal(r.calls[0].init.method || 'GET', 'GET');
  const d = recorded(200, BY_AIRPORT.departure.answer);
  await api.fetchFlightsByAirport('MUC', '2026-11-01', 'departure', 'it', d.fetchImpl);
  assert.equal(d.calls[0].url, BY_AIRPORT.departure.url);
  const a = recorded(200, BY_AIRPORT.destination.answer);
  await api.fetchFlightsByAirport('MUC', '2026-11-01', 'arrival', 'de', a.fetchImpl);
  assert.equal(a.calls[0].url, BY_AIRPORT.destination.url, 'arrivals: type=destination, as www');
  assert.equal(a.calls[0].init.headers['Accept-Language'], 'de');
  const req = api.flightStatusRequest({ flightNumber: 'EN2156', date: '2026-11-01' }, 'it');
  assert.equal(req.url, STATUS.request.url);
  assert.equal(req.init.method, 'POST');
  assert.deepEqual(req.init.headers, { 'Content-Type': 'application/json', 'Accept-Language': 'it' });
  assert.equal(req.init.body, JSON.stringify(STATUS.request.body));
  const s = recorded(201, STATUS.request.answer);
  const handoff = await api.requestFlightStatus({ flightNumber: 'EN2156', date: '2026-11-01' }, 'it', s.fetchImpl);
  assert.equal(handoff.action, STATUS.request.answer.url);
  assert.deepEqual(Object.entries(handoff.fields), STATUS.handoff.fields, 'www\'s three fields, in its order');
  await assert.rejects(api.requestFlightStatus({ flightNumber: 'EN2156', date: '2026-11-01' }, 'it', recorded(201, { url: 'https://evil.example/x', payload: {} }).fetchImpl), /engine/);
  await assert.rejects(api.fetchFlightsByRoute('MUC', 'VRN', '2026-11-01', 'it', recorded(500, []).fetchImpl), /500/);
  assert.throws(() => api.flightStatusRequest({ flightNumber: '', date: '2026-11-01' }, 'it'), /flight number/);
  await assert.rejects(api.fetchFlightsByAirport('MUC', '2026-11-01', 'sideways', 'it', d.fetchImpl), /direction/);
});

const ROWS = [
  ['Tabs', 'Numero di volo, Tratta del volo, Aeroporto'], ['Airlines', 'EN'],
  ['Submit URL', 'https://digital.airdolomiti.it/booking/flight-status?lang=it-IT'], ['Submit method', 'post'],
  ['Airline field', 'airlineCode'], ['Flight number field', 'flightNumber'], ['Date field', 'departureDate'], ['Format', 'airdolomiti'],
];

/** A status page with the block; its API calls, posts and navigations. */
async function statusPage(rows, { brand = 'airdolomiti', path = '/stato-volo', answers = {} } = {}) {
  const navigations = [];
  window.location = {
    hostname: HOST, pathname: path, search: '', hash: '', origin: `https://${HOST}`, href: `https://${HOST}${path}`, assign: (u) => navigations.push(u), replace: () => {},
  };
  const { document } = parseHTML(`<!DOCTYPE html><html><head>${brand ? `<meta name="brand" content="${brand}">` : ''}</head><body><main><div class="flight-status">${rows.map(([k, v]) => `<div><div>${k}</div><div>${v}</div></div>`).join('')}</div></main></body></html>`);
  globalThis.document = document;
  const calls = [];
  const posts = [];
  globalThis.fetch = async (url, init = {}) => {
    const u = String(url);
    calls.push({
      url: u, method: init.method || 'GET', headers: init.headers || {}, body: init.body,
    });
    const hit = Object.entries(answers).find(([part]) => u.includes(part));
    if (!hit) return new Response('{}', { status: 404 });
    return new Response(JSON.stringify(hit[1][1]), { status: hit[1][0], headers: { 'content-type': 'application/json' } });
  };
  // (linkedom's createElement('form') has no submit(): the hand-off form records itself)
  const create = document.createElement.bind(document);
  document.createElement = (tag, ...rest) => {
    const node = create(tag, ...rest);
    if (String(tag).toLowerCase() === 'form') {
      node.submit = () => posts.push({ action: node.action || node.getAttribute('action'), fields: [...node.querySelectorAll('input')].map((i) => [i.name, i.value]) });
    }
    return node;
  };
  const el = document.querySelector('.flight-status');
  await block.default(el);
  await settle();
  return {
    document, el, calls, posts, navigations,
  };
}
const choose = (select, value) => {
  [...select.options].forEach((o) => { o.selected = false; });
  const o = [...select.options].find((x) => x.value === value);
  if (o) o.selected = true;
  select.dispatchEvent(new window.Event('change', { bubbles: true }));
};
const selectedValue = (select) => ([...select.options].find((o) => o.selected) || { value: '' }).value;
const submit = (form) => form.dispatchEvent(new window.Event('submit', { cancelable: true, bubbles: true }));
const click = (n) => n.dispatchEvent(new window.Event('click', { bubbles: true }));
const ddmmyyyy = (iso) => iso.split('-').reverse().join('/');

const ANSWERS = {
  '/v1/airports': [200, AIRPORTS],
  '/v1/flights/by-route/MUC-VRN': [200, ROUTE.answer],
  '/v1/flights/by-airport/MUC': [200, BY_AIRPORT.departure.answer],
  '/v1/bookings/flight-status': [201, STATUS.request.answer],
};

test('route (it): Air Dolomiti\'s airports, the route\'s flights as www\'s cards, a card hands its flight to the engine', async () => {
  const p = await statusPage(ROWS, { answers: ANSWERS });
  const panel = p.el.querySelector('.flight-status-panel-route');
  const from = panel.querySelector('select[name="origin"]');
  const to = panel.querySelector('select[name="destination"]');
  assert.ok(from && to, 'airport selects');
  assert.equal([...from.options].filter((o) => o.value).length, AIRPORTS.length);
  assert.ok([...from.options].some((o) => o.textContent === 'Monaco di Baviera'));
  assert.deepEqual([...panel.querySelectorAll('label')].map((l) => l.textContent.trim()).slice(0, 2), ['Origine', 'Destinazione']);
  assert.equal(panel.querySelector('.flight-status-swap').getAttribute('aria-label'), 'Scambia origine e destinazione');
  choose(from, 'MUC');
  await settle();
  const muc = AIRPORTS.find((a) => a.iata_code === 'MUC');
  assert.deepEqual([...to.options].filter((o) => o.value).map((o) => o.value).sort(), muc.connections.map((c) => c.iata_code).sort());
  choose(to, 'VRN');
  const date = selectedValue(panel.querySelector('select[id$="-date"]'));
  submit(panel.querySelector('form'));
  await settle();
  const list = p.calls.find((c) => c.url.includes('/by-route/'));
  assert.equal(list.url, `https://api.airdolomiti.it/v1/flights/by-route/MUC-VRN?date=${ddmmyyyy(date)}`);
  assert.deepEqual(list.headers, { 'Content-Type': 'application/json', 'Accept-Language': 'it' });
  const results = panel.querySelector('.flight-status-results');
  assert.match(results.querySelector('h2').textContent, new RegExp(`^Risultati per \\S+ ${ddmmyyyy(date).replace(/\//g, '\\/')}$`));
  const cards = [...results.querySelectorAll('.flight-status-result')];
  assert.equal(cards.length, ROUTE.answer.length);
  assert.equal(cards[0].tagName, 'BUTTON');
  assert.equal(cards[0].getAttribute('aria-label'), 'Dettagli del volo EN2156 da Monaco a Verona');
  // the card's texts as www's: the cities and codes, "Numero di volo", the flight
  assert.deepEqual([...cards[0].querySelectorAll('span')].filter((s) => !s.querySelector('span') && s.textContent.trim()).map((s) => s.textContent.trim()), ['Monaco', 'MUC', 'Verona', 'VRN', 'Numero di volo', 'EN2156']);
  click(cards[0]);
  await settle();
  const status = p.calls.find((c) => c.url.endsWith('/v1/bookings/flight-status'));
  assert.equal(status.method, 'POST');
  assert.equal(status.body, JSON.stringify({ flight_date: ddmmyyyy(date), flight_number: 'EN2156' }));
  assert.equal(p.posts.length, 1);
  assert.equal(p.posts[0].action, STATUS.request.answer.url);
  assert.deepEqual(p.posts[0].fields, STATUS.handoff.fields);
  assert.equal(p.navigations.length, 0, 'no GET link');
});

test('airport (it): departures type=departure, arrivals type=destination; nothing found: www\'s "Nessun risultato trovato"', async () => {
  const p = await statusPage(ROWS, { answers: ANSWERS });
  const panel = p.el.querySelector('.flight-status-panel-airport');
  assert.deepEqual([...panel.querySelectorAll('.flight-status-radio')].map((l) => l.textContent.trim()), ['Partenza', 'Arrivo']);
  const airport = panel.querySelector('select[name="airport"]');
  choose(airport, 'MUC');
  submit(panel.querySelector('form'));
  await settle();
  assert.match(p.calls.find((c) => c.url.includes('/by-airport/')).url, /\/by-airport\/MUC\?date=\d{2}\/\d{2}\/\d{4}&type=departure$/);
  assert.equal(panel.querySelectorAll('.flight-status-result').length, BY_AIRPORT.departure.answer.length);
  const arrival = [...panel.querySelectorAll('.flight-status-radio input')].find((i) => i.value === 'arrival');
  arrival.checked = true;
  arrival.dispatchEvent(new window.Event('change', { bubbles: true }));
  const empty = await statusPage(ROWS, { answers: { ...ANSWERS, '/v1/flights/by-airport/MUC': [200, []] } });
  const panel2 = empty.el.querySelector('.flight-status-panel-airport');
  const arr2 = [...panel2.querySelectorAll('.flight-status-radio input')].find((i) => i.value === 'arrival');
  arr2.checked = true;
  arr2.dispatchEvent(new window.Event('change', { bubbles: true }));
  choose(panel2.querySelector('select[name="airport"]'), 'MUC');
  submit(panel2.querySelector('form'));
  await settle();
  assert.match(empty.calls.find((c) => c.url.includes('/by-airport/')).url, /&type=destination$/);
  assert.equal(panel2.querySelector('.flight-status-results').textContent.trim(), 'Nessun risultato trovato');
  // no airport chosen: nothing asked
  const none = await statusPage(ROWS, { answers: ANSWERS });
  submit(none.el.querySelector('.flight-status-panel-airport form'));
  await settle();
  assert.ok(!none.calls.some((c) => c.url.includes('/by-airport/')));
});

test('English and German: www\'s texts (Search results for / Suchergebnisse für, card labels, no results)', async () => {
  const en = await statusPage([...ROWS.filter(([k]) => k !== 'Tabs'), ['Tabs', 'Flight number, Flight route, Airport']], { path: '/en/flight-status', answers: ANSWERS });
  const panel = en.el.querySelector('.flight-status-panel-route');
  assert.deepEqual([...panel.querySelectorAll('label')].map((l) => l.textContent.trim()).slice(0, 2), ['From', 'To']);
  choose(panel.querySelector('select[name="origin"]'), 'MUC');
  await settle();
  choose(panel.querySelector('select[name="destination"]'), 'VRN');
  submit(panel.querySelector('form'));
  await settle();
  assert.match(panel.querySelector('.flight-status-results h2').textContent, /^Search results for \S+ \d{2}\/\d{2}\/\d{4}$/);
  assert.equal(panel.querySelector('.flight-status-result').getAttribute('aria-label'), 'Flight details for EN2156 from Monaco to Verona');
  assert.ok(en.calls.find((c) => c.url.includes('/by-route/')).headers['Accept-Language'] === 'en');
  const de = await statusPage(ROWS, { path: '/de/flug-status', answers: { ...ANSWERS, '/v1/flights/by-route/MUC-VRN': [200, []] } });
  const dp = de.el.querySelector('.flight-status-panel-route');
  assert.deepEqual([...dp.querySelectorAll('label')].map((l) => l.textContent.trim()).slice(0, 2), ['Von', 'Nach']);
  choose(dp.querySelector('select[name="origin"]'), 'MUC');
  await settle();
  choose(dp.querySelector('select[name="destination"]'), 'VRN');
  submit(dp.querySelector('form'));
  await settle();
  assert.equal(dp.querySelector('.flight-status-results').textContent.trim(), 'keine Ergebnisse gefunden');
});

test('an API failure: the error text, no hand-off; the number search posts directly as before', async () => {
  const p = await statusPage([...ROWS, ['Search error', 'Servizio non disponibile']], { answers: { ...ANSWERS, '/v1/bookings/flight-status': [500, {}] } });
  const panel = p.el.querySelector('.flight-status-panel-route');
  choose(panel.querySelector('select[name="origin"]'), 'MUC');
  await settle();
  choose(panel.querySelector('select[name="destination"]'), 'VRN');
  submit(panel.querySelector('form'));
  await settle();
  click(panel.querySelector('.flight-status-result'));
  await settle();
  assert.equal(p.posts.length, 0);
  assert.equal(panel.querySelector('.flight-status-error').textContent, 'Servizio non disponibile');
  // number: the direct POST (88d6a6d), no API call
  const n = await statusPage(ROWS, { answers: ANSWERS });
  const number = n.el.querySelector('.flight-status-panel-number');
  number.querySelector('input[name="flightNumber"]').value = 'EN8840';
  const before = n.calls.length;
  submit(number.querySelector('form'));
  await settle();
  assert.equal(n.calls.slice(before).filter((c) => c.url.includes('flight-status')).length, 0);
  assert.equal(n.posts.length, 1);
  assert.deepEqual(n.posts[0].fields.map(([k]) => k), ['airlineCode', 'flightNumber', 'departureDate']);
  assert.deepEqual(n.posts[0].fields.slice(0, 2), [['airlineCode', 'EN'], ['flightNumber', '8840']]);
});

test('without the Format row (today\'s pages) and on other brands: route and airport keep the GET link, no Air Dolomiti call', async () => {
  for (const [rows, brand] of [[ROWS.filter(([k]) => k !== 'Format'), 'airdolomiti'], [ROWS, 'austrian'], [ROWS, '']]) {
    const p = await statusPage(rows, { brand, answers: ANSWERS });
    assert.ok(!p.calls.some((c) => c.url.includes('api.airdolomiti.it')), `${brand} ${rows.length}`);
    assert.ok(!p.el.querySelector('select[name="origin"]'), 'the lufthansa.com airport fields');
    assert.ok(!p.el.querySelector('.flight-status-results'));
  }
});
