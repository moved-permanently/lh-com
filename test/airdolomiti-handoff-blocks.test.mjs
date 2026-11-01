/* eslint-disable max-len, no-await-in-loop, no-restricted-syntax */
/* Air Dolomiti's timetable and manage booking hand-offs (blocks/flight-timetable,
   blocks/manage-booking; scripts/airdolomiti-api.js), brand airdolomiti only. Timetable: trip type,
   origin from GET /airports (the page's language), destination its connections, the calendars'
   days from GET /flights/dates/<ORIG>-<DEST> (the return's from the departure on), search POSTed,
   then a POST form to the answer's url with one field search. Manage booking: surname and booking
   code POSTed to /bookings/retrieve-pnr, then a POST form with recLoc, lastName, dxMMBTripFlow,
   portalFacts. Failures: the error text, no hand-off. Another brand: no API call, the authored
   link only. Recorded answers (test/fixtures/airdolomiti-api), no live calls.
   DOM nodes are compared with assert.ok(a === b) only.
   Run: node --max-old-space-size=512 --test test/airdolomiti-handoff-blocks.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';

const fixture = (f) => JSON.parse(fs.readFileSync(new URL(`./fixtures/airdolomiti-api/${f}`, import.meta.url), 'utf8'));
const AIRPORTS = fixture('airports.json');
const DATES = fixture('dates-MUC-VRN.json');
const ONEWAY = fixture('timetable-oneway-it.json');
const RETURN = fixture('timetable-return-en.json');
const PNR = fixture('retrieve-pnr-it.json');

const { window } = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
globalThis.window = window;
window.origin = 'https://main--lh-airdolomiti--moved-permanently.aem.page';
globalThis.Event = window.Event;
globalThis.CSS = { escape: (v) => String(v) };
const timetable = await import('../blocks/flight-timetable/flight-timetable.js');
const manage = await import('../blocks/manage-booking/manage-booking.js');

const tick = () => new Promise((r) => { setTimeout(r, 0); });
const settle = async () => { for (let i = 0; i < 6; i += 1) await tick(); };

/** A page with the block (rows label | value), brand, path; the API answers, the posts made. */
function page(name, rows, { brand = 'airdolomiti', path = '/orario-voli', answers = {} } = {}) {
  const host = 'main--lh-airdolomiti--moved-permanently.aem.page';
  window.location = {
    hostname: host, pathname: path, search: '', hash: '', origin: `https://${host}`, href: `https://${host}${path}`,
  };
  const { document } = parseHTML(`<!DOCTYPE html><html lang="it"><head>${brand ? `<meta name="brand" content="${brand}">` : ''}</head><body><main><div class="${name}">${rows.map(([k, v]) => `<div><div>${k}</div><div>${v}</div></div>`).join('')}</div></main></body></html>`);
  globalThis.document = document;
  const calls = [];
  globalThis.fetch = async (url, init = {}) => {
    const u = String(url);
    calls.push({
      url: u, method: init.method || 'GET', headers: init.headers || {}, body: init.body,
    });
    const hit = Object.entries(answers).find(([part]) => u.endsWith(part));
    if (!hit) return new Response('{}', { status: 404 });
    const [status, body] = hit[1];
    return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
  };
  const posts = [];
  // (linkedom's createElement('form') has no submit(): the hand-off form gets one that records it)
  const create = document.createElement.bind(document);
  document.createElement = (tag, ...rest) => {
    const node = create(tag, ...rest);
    if (String(tag).toLowerCase() === 'form') {
      node.submit = () => posts.push({
        action: node.action || node.getAttribute('action'), method: node.method || node.getAttribute('method'), fields: [...node.querySelectorAll('input')].map((i) => [i.name, i.value]),
      });
    }
    return node;
  };
  return {
    document, block: document.querySelector(`.${name}`), calls, posts,
  };
}

const TT_ANSWERS = {
  '/v1/airports': [200, AIRPORTS],
  '/v1/flights/dates/MUC-VRN': [200, DATES],
};
const choose = (select, value) => {
  [...select.options].forEach((o) => { o.selected = false; });
  const o = [...select.options].find((x) => x.value === value);
  if (o) o.selected = true;
  select.dispatchEvent(new window.Event('change', { bubbles: true }));
};
const click = (el) => el.dispatchEvent(new window.Event('click', { bubbles: true }));
const submit = (form) => form.dispatchEvent(new window.Event('submit', { cancelable: true, bubbles: true }));
/** Opens a date field's calendar and picks the day with that ISO date. */
async function pickDay(block, field, iso) {
  const button = block.querySelector(`[data-field="${field}"] .flight-timetable-date`);
  click(button);
  await settle();
  const cal = block.querySelector('.flight-timetable-calendar:not([hidden])');
  assert.ok(cal, `${field} calendar open`);
  const day = cal.querySelector(`button[data-date="${iso}"]`);
  assert.ok(day, `${iso} shown`);
  assert.equal(day.disabled, false, `${iso} enabled`);
  click(day);
  await settle();
}

const IT_ROWS = [['Trip types', 'Andata / Ritorno, Solo andata'], ['From label', 'Partenza'], ['From placeholder', 'Partenza da'], ['To label', 'Arrivo'], ['To placeholder', 'Arrivo a'], ['Departure label', 'Data partenza'], ['Return label', 'Data ritorno'], ['Submit label', 'Cerca']];

test('timetable: www\'s fields; origins from /airports by Italian name, destinations the origin\'s connections, days from the route\'s dates', async () => {
  const { block, calls } = page('flight-timetable', IT_ROWS, { answers: TT_ANSWERS });
  await timetable.default(block);
  await settle();
  assert.deepEqual([...block.querySelectorAll('.flight-timetable-trip label')].map((l) => l.textContent.trim()), ['Andata / Ritorno', 'Solo andata']);
  assert.deepEqual([...block.querySelectorAll('.flight-timetable-field > label')].map((l) => l.textContent.trim()), ['Partenza', 'Arrivo', 'Data partenza', 'Data ritorno']);
  assert.equal(block.querySelector('button[type="submit"]').textContent.trim(), 'Cerca');
  const origin = block.querySelector('select[name="origin"]');
  const destination = block.querySelector('select[name="destination"]');
  const names = [...origin.options].filter((o) => o.value).map((o) => o.textContent);
  assert.equal(names.length, AIRPORTS.length);
  assert.ok(names.includes('Monaco di Baviera') && names.includes('Verona'));
  assert.deepEqual(names, [...names].sort((a, b) => a.localeCompare(b, 'it')));
  assert.equal(origin.options[0].textContent, 'Partenza da');
  assert.ok(destination.disabled, 'no destination before an origin');
  assert.ok(block.querySelector('[data-field="departure"] .flight-timetable-date').disabled);
  choose(origin, 'MUC');
  await settle();
  const muc = AIRPORTS.find((a) => a.iata_code === 'MUC');
  assert.deepEqual([...destination.options].filter((o) => o.value).map((o) => o.value).sort(), muc.connections.map((c) => c.iata_code).sort());
  assert.equal(destination.disabled, false);
  choose(destination, 'VRN');
  await settle();
  assert.ok(calls.some((c) => c.url === 'https://api.airdolomiti.it/v1/flights/dates/MUC-VRN' && c.method === 'GET'));
  const dep = block.querySelector('[data-field="departure"] .flight-timetable-date');
  assert.equal(dep.disabled, false);
  assert.equal(dep.textContent.trim(), '--/--/--');
  assert.equal(dep.getAttribute('aria-label'), 'Data partenza: apri calendario');
  click(dep);
  await settle();
  const cal = block.querySelector('.flight-timetable-calendar:not([hidden])');
  assert.equal(cal.querySelector('.flight-timetable-month').textContent, 'novembre 2026');
  assert.deepEqual([...cal.querySelectorAll('.flight-timetable-weekday')].map((d) => d.textContent), ['lun', 'mar', 'mer', 'gio', 'ven', 'sab', 'dom']);
  const enabled = [...cal.querySelectorAll('button[data-date]')].filter((b) => !b.disabled).map((b) => b.dataset.date);
  assert.deepEqual(enabled, DATES.filter((d) => d.endsWith('/11/2026')).map((d) => d.split('/').reverse().join('-')));
  assert.equal(cal.querySelector('.flight-timetable-next').getAttribute('aria-label'), 'Mese successivo');
  assert.ok(cal.querySelector('.flight-timetable-prev').disabled, 'nothing before the first date');
});

test('timetable one way (it): www\'s POST, then a form to the answer\'s url with search', async () => {
  const { block, calls, posts } = page('flight-timetable', IT_ROWS, { answers: { ...TT_ANSWERS, '/v1/bookings/timetable': [201, ONEWAY.request.answer] } });
  await timetable.default(block);
  await settle();
  const oneWay = [...block.querySelectorAll('.flight-timetable-trip input')].find((i) => i.value === 'O');
  oneWay.checked = true;
  oneWay.dispatchEvent(new window.Event('change', { bubbles: true }));
  assert.ok(block.querySelector('[data-field="return"]').hidden, 'one way: no return date');
  choose(block.querySelector('select[name="origin"]'), 'MUC');
  await settle();
  choose(block.querySelector('select[name="destination"]'), 'VRN');
  await settle();
  await pickDay(block, 'departure', '2026-11-15');
  assert.equal(block.querySelector('[data-field="departure"] .flight-timetable-date').textContent.trim(), '15/11/2026');
  submit(block.querySelector('form'));
  await settle();
  const post = calls.find((c) => c.method === 'POST');
  assert.equal(post.url, 'https://api.airdolomiti.it/v1/bookings/timetable');
  assert.equal(post.body, JSON.stringify(ONEWAY.request.body));
  assert.equal(post.headers['Accept-Language'], 'it');
  assert.equal(posts.length, 1);
  assert.equal(posts[0].action, ONEWAY.request.answer.url);
  assert.equal(posts[0].method, 'post');
  assert.deepEqual(posts[0].fields, [['search', JSON.stringify(ONEWAY.request.answer.payload.search)]]);
});

test('timetable round trip (en): the return calendar from the departure on, trip type R', async () => {
  const rows = [['Trip types', 'Round trip, One way'], ['From label', 'Departure'], ['To label', 'Destination'], ['Departure label', 'Departure date'], ['Return label', 'Return date'], ['Submit label', 'Search']];
  const { block, calls, posts } = page('flight-timetable', rows, { path: '/en/flight-timetables', answers: { ...TT_ANSWERS, '/v1/bookings/timetable': [201, RETURN.request.answer] } });
  await timetable.default(block);
  await settle();
  const origin = block.querySelector('select[name="origin"]');
  assert.ok([...origin.options].some((o) => o.textContent === 'Munich'), 'English names');
  choose(origin, 'MUC');
  await settle();
  choose(block.querySelector('select[name="destination"]'), 'VRN');
  await settle();
  await pickDay(block, 'departure', '2026-11-15');
  click(block.querySelector('[data-field="return"] .flight-timetable-date'));
  await settle();
  const cal = block.querySelector('.flight-timetable-calendar:not([hidden])');
  assert.ok(cal.querySelector('button[data-date="2026-11-14"]').disabled, 'before the departure');
  assert.equal(cal.querySelector('button[data-date="2026-11-15"]').disabled, false);
  assert.equal(cal.querySelector('.flight-timetable-month').textContent, 'November 2026');
  click(cal.querySelector('button[data-date="2026-11-20"]'));
  await settle();
  submit(block.querySelector('form'));
  await settle();
  const post = calls.find((c) => c.method === 'POST');
  assert.equal(post.body, JSON.stringify(RETURN.request.body));
  assert.equal(post.headers['Accept-Language'], 'en');
  assert.deepEqual(posts[0].fields, [['search', JSON.stringify(RETURN.request.answer.payload.search)]]);
  assert.equal(posts[0].action, RETURN.request.answer.url);
});

test('timetable: an incomplete search posts nothing; an API failure shows the error and no hand-off', async () => {
  const { block, calls, posts } = page('flight-timetable', [...IT_ROWS, ['Error', 'Servizio non disponibile']], { answers: { ...TT_ANSWERS, '/v1/bookings/timetable': [500, { error: 'x' }] } });
  await timetable.default(block);
  await settle();
  submit(block.querySelector('form'));
  await settle();
  assert.ok(!calls.some((c) => c.method === 'POST'));
  assert.equal(block.querySelector('[data-field="origin"]').classList.contains('is-invalid'), true);
  choose(block.querySelector('select[name="origin"]'), 'MUC');
  await settle();
  choose(block.querySelector('select[name="destination"]'), 'VRN');
  await settle();
  await pickDay(block, 'departure', '2026-11-15');
  submit(block.querySelector('form'));
  await settle();
  assert.ok(block.querySelector('[data-field="return"]').classList.contains('is-invalid'), 'round trip without a return date');
  assert.ok(!calls.some((c) => c.method === 'POST'));
  await pickDay(block, 'return', '2026-11-20');
  submit(block.querySelector('form'));
  await settle();
  assert.equal(calls.filter((c) => c.method === 'POST').length, 1);
  assert.equal(posts.length, 0);
  const error = block.querySelector('.flight-timetable-error');
  assert.equal(error.hidden, false);
  assert.equal(error.textContent, 'Servizio non disponibile');
  assert.equal(block.querySelector('button[type="submit"]').disabled, false);
});

test('manage booking (it): www\'s labels, the retrieval POSTed, then www\'s four fields to the engine', async () => {
  const rows = [['Surname label', 'Cognome'], ['Surname placeholder', 'Cognome'], ['Booking code label', 'Codice di prenotazione'], ['Booking code placeholder', 'Codice di prenotazione'], ['Submit label', 'Cerca prenotazione']];
  const { block, calls, posts } = page('manage-booking', rows, { path: '/gestione-prenotazione-volo', answers: { '/v1/bookings/retrieve-pnr': [201, PNR.request.answer] } });
  await manage.default(block);
  assert.deepEqual([...block.querySelectorAll('label')].map((l) => l.textContent.trim()), ['Cognome', 'Codice di prenotazione']);
  assert.deepEqual([...block.querySelectorAll('input')].map((i) => [i.name, i.placeholder, i.required]), [['surname', 'Cognome', true], ['bookingCode', 'Codice di prenotazione', true]]);
  assert.equal(block.querySelector('button[type="submit"]').textContent.trim(), 'Cerca prenotazione');
  submit(block.querySelector('form'));
  await settle();
  assert.equal(calls.length, 0, 'empty: nothing sent');
  block.querySelector('input[name="surname"]').value = 'Rossi';
  block.querySelector('input[name="bookingCode"]').value = 'ABC123';
  submit(block.querySelector('form'));
  await settle();
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, 'https://api.airdolomiti.it/v1/bookings/retrieve-pnr');
  assert.equal(calls[0].body, JSON.stringify(PNR.request.body));
  assert.deepEqual(calls[0].headers, { Accept: 'application/json', 'Content-Type': 'application/json', 'Accept-Language': 'it' });
  assert.equal(posts.length, 1);
  assert.equal(posts[0].action, PNR.request.answer.url);
  assert.deepEqual(posts[0].fields, PNR.handoff.fields);
});

test('manage booking: an API failure shows the error, entries kept; German default texts', async () => {
  const { block, posts } = page('manage-booking', [], { path: '/de/bearbeitung-ihrer-buchungen', answers: { '/v1/bookings/retrieve-pnr': [502, {}] } });
  await manage.default(block);
  assert.deepEqual([...block.querySelectorAll('label')].map((l) => l.textContent.trim()), ['Nachname', 'Buchungscode']);
  block.querySelector('input[name="surname"]').value = 'Rossi';
  block.querySelector('input[name="bookingCode"]').value = 'ABC123';
  submit(block.querySelector('form'));
  await settle();
  assert.equal(posts.length, 0);
  const error = block.querySelector('.manage-booking-error');
  assert.equal(error.hidden, false);
  assert.ok(error.textContent.length > 10);
  assert.equal(block.querySelector('input[name="surname"]').value, 'Rossi');
  assert.equal(block.querySelector('button[type="submit"]').disabled, false);
});

test('another brand (or lh-com): no API call; the authored link to the live page only', async () => {
  for (const [name, mod] of [['flight-timetable', timetable], ['manage-booking', manage]]) {
    for (const brand of ['', 'austrian']) {
      const { block, calls } = page(name, [['Live page', '<a href="https://www.airdolomiti.it/orario-voli">Orario voli</a>']], { brand });
      await mod.default(block);
      await settle();
      assert.equal(calls.length, 0, `${name} ${brand}`);
      assert.ok(!block.querySelector('form'));
      assert.equal(block.querySelector('a').getAttribute('href'), 'https://www.airdolomiti.it/orario-voli');
    }
  }
});
