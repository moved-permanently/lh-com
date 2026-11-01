/* eslint-disable max-len */
/* Own-host hand-offs (scripts/handoff.js, brief 207): on the airline's own www host the manage
   booking tab (booking-lookup my-bookings), the hotel tab (flight-search) and the check-in form
   (booking-lookup, ITA) do what www's AEM components do: post to the AEM endpoint (rebuilt outside
   AEM) and open the answer's target as www does (a form with the parameters, POST unless methodGet,
   a new window if newWindow). Everywhere else (turnsthe.page, aem.page, aem.live) as before, so the
   test-data backend never gets a visitor's booking data; ?handoff=post switches it on for a test on
   turnsthe.page and aem.page only.
   www's calls (component chunks 6cafccc7, b85ee87e, 53b206f4):
   - manage booking: POST /service/secured/api/core/filekeylogin {filekey, firstname, lastname}
     (sets the session cookie), then GET /service/secured/api/core/booking/bookingdetailslink?layout=L
     → {hasIrreg, linkTarget: {targetURL, parameters, newWindow, methodGet}};
   - hotel: POST /service/secured/api/core/booking/hotel {cityName, checkInDate, checkOutDate} → LinkTarget;
   - check-in: POST /service/secured/api/core/checkin/fktn {firstName, lastName, fileKey, layout} → LinkTarget,
     400 {"error":"checkin.error.bookingNotFound"} (www's text: common.checkin.error.bookingNotFound).
   The answers below are the test-data backend's (lufthansa.turnsthe.page, made-up values, 2026-11-01).
   Run: node --max-old-space-size=512 --test test/post-handoff.test.mjs */
/* global globalThis */
import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
let assigned;
let opened;
const at = (host, pathname, search = '') => {
  window.location = {
    hostname: host, pathname, search, hash: '', href: `https://${host}${pathname}${search}`, origin: `https://${host}`, assign: (u) => { assigned = u; },
  };
};
at('www.lufthansa.com', '/de/en/homepage');
window.open = (u, t) => { opened = [u, t]; };
window.matchMedia = (q) => ({ matches: q.includes('768') ? window.small : false, addEventListener: () => {}, addListener: () => {} });
window.small = false;
globalThis.window = window;
globalThis.document = document;
globalThis.Event = window.Event;
// the forms the hand-off submits (linkedom has no form.submit)
let submitted;
window.HTMLElement.prototype.submit = function submit() {
  submitted.push({
    action: this.getAttribute('action'),
    method: this.getAttribute('method'),
    target: this.getAttribute('target'),
    fields: [...this.querySelectorAll('input')].map((i) => [i.name, i.value]),
  });
};

// the test-data backend's answers (recorded 2026-11-01)
const BOOKING_LINK = {
  hasIrreg: false,
  linkTarget: {
    targetURL: 'https://mock.lh-backends.example/amadeus-b2/booking/manage-booking/retrieve?lang=en-GB&portalCountry=DE', newWindow: false, methodGet: false, external: true, parameters: [{ key: 'lastName', values: ['Doe'] }, { key: 'recLoc', values: ['ABC123'] }], headers: [],
  },
};
const HOTEL = {
  targetURL: 'https://mock.lh-backends.example/booking-com/searchresults.html', newWindow: false, methodGet: true, external: false, parameters: [{ key: 'ss', values: ['Frankfurt am Main'] }, { key: 'checkin', values: ['2026-12-01'] }, { key: 'checkout', values: ['2026-12-03'] }, { key: 'lang', values: ['en'] }],
};
const CHECKIN = {
  targetURL: 'https://mock.lh-backends.example/checkin/ita', newWindow: true, methodGet: false, external: true, parameters: [{ key: 'pnr', values: ['ABC123'] }, { key: 'lastName', values: ['Doe'] }, { key: 'seg', values: ['1', '2'] }],
};
const NOT_FOUND = { error: 'checkin.error.bookingNotFound', errors: [], validationErrors: [] };

let calls;
let answers;
const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json' } });
beforeEach(() => {
  calls = [];
  submitted = [];
  assigned = null;
  opened = null;
  window.small = false;
  answers = {
    filekeylogin: () => new Response('', { status: 200, headers: { 'content-type': 'text/plain' } }),
    bookingdetailslink: () => json(BOOKING_LINK),
    hotel: () => json(HOTEL),
    fktn: () => json(CHECKIN),
  };
  globalThis.fetch = async (url, init = {}) => {
    const href = String(url);
    calls.push({
      href, method: init.method || 'GET', headers: init.headers || {}, body: init.body ? JSON.parse(init.body) : undefined, credentials: init.credentials,
    });
    const name = href.split('?')[0].split('/').pop();
    if (answers[name]) return answers[name]();
    // the label bundles: none (the built-in texts)
    return json({}, 404);
  };
});

const handoff = await import('../scripts/handoff.js');
const { default: decorateLookup } = await import('../blocks/booking-lookup/booking-lookup.js');
const { default: decorateSearch } = await import('../blocks/flight-search/flight-search.js');

const tick = () => new Promise((r) => { setImmediate(r); });
const flush = () => Array.from({ length: 20 }).reduce((p) => p.then(tick), Promise.resolve());
const page = (meta) => { document.head.innerHTML = Object.entries(meta).map(([k, v]) => `<meta name="${k}" content="${v}">`).join(''); };

test('the post mode: on the airline\'s own www host only; ?handoff=post on turnsthe.page and aem.page', () => {
  const on = (host, meta = {}, search = '') => {
    at(host, '/de/en/x', search);
    page(meta);
    return handoff.postHandoffOn();
  };
  assert.equal(on('www.lufthansa.com'), true);
  assert.equal(on('www.ita-airways.com', { brand: 'ita' }), true);
  assert.equal(on('www.austrian.com', { brand: 'austrian' }), true);
  assert.equal(on('www.discover-airlines.com', { brand: 'discover' }), true);
  // another airline's host, the replica's hosts, the Edge Delivery hosts: as before
  assert.equal(on('www.lufthansa.com', { brand: 'ita' }), false);
  assert.equal(on('lufthansa.turnsthe.page'), false);
  assert.equal(on('ita.turnsthe.page', { brand: 'ita' }), false);
  assert.equal(on('main--lh-com--moved-permanently.aem.page'), false);
  assert.equal(on('main--lh-com--moved-permanently.aem.live'), false);
  // the test switch
  assert.equal(on('lufthansa.turnsthe.page', {}, '?handoff=post'), true);
  assert.equal(on('ita.turnsthe.page', { brand: 'ita' }, '?handoff=post'), true);
  assert.equal(on('main--lh-com--moved-permanently.aem.page', {}, '?handoff=post'), true);
  assert.equal(on('main--lh-com--moved-permanently.aem.live', {}, '?handoff=post'), false, 'not on aem.live');
  assert.equal(on('lufthansa.turnsthe.page', {}, '?handoff=1'), false);
  assert.deepEqual(handoff.POST_HANDOFF_HOSTS.lh, ['www.lufthansa.com']);
  assert.deepEqual(handoff.POST_HANDOFF_HOSTS.ita, ['www.ita-airways.com']);
});

test('openTarget: a form with one field per value, POST unless methodGet, a new window if newWindow', () => {
  handoff.openTarget(BOOKING_LINK.linkTarget);
  handoff.openTarget(HOTEL);
  handoff.openTarget(CHECKIN);
  assert.deepEqual(submitted, [
    {
      action: BOOKING_LINK.linkTarget.targetURL, method: 'POST', target: '_self', fields: [['lastName', 'Doe'], ['recLoc', 'ABC123']],
    },
    {
      action: HOTEL.targetURL, method: 'GET', target: '_self', fields: [['ss', 'Frankfurt am Main'], ['checkin', '2026-12-01'], ['checkout', '2026-12-03'], ['lang', 'en']],
    },
    {
      action: CHECKIN.targetURL, method: 'POST', target: '_blank', fields: [['pnr', 'ABC123'], ['lastName', 'Doe'], ['seg', '1'], ['seg', '2']],
    },
  ]);
  assert.equal(document.querySelectorAll('form.handoff-form').length, 0, 'the form is removed after the submit');
});

/** A booking-lookup block on a page (rows: label | value), decorated. */
const lookup = (classes, rows) => {
  const block = document.createElement('div');
  block.className = `booking-lookup ${classes}`.trim();
  block.innerHTML = rows.map(([k, v]) => `<div><div>${k}</div><div>${v}</div></div>`).join('');
  document.body.replaceChildren(block);
  decorateLookup(block);
  return block;
};
const fill = (block, values) => {
  Object.entries(values).forEach(([name, value]) => { block.querySelector(`input[name="${name}"]`).value = value; });
  block.querySelector('form').dispatchEvent(new window.Event('submit', { cancelable: true }));
};

test('manage booking (my-bookings) on www.lufthansa.com: filekeylogin, then bookingdetailslink, its target opened', async () => {
  at('www.lufthansa.com', '/de/en/book-and-manage/booking-services/manage-my-bookings');
  page({});
  const block = lookup('my-bookings', [['Tab', 'My bookings']]);
  fill(block, { reference: 'abc123', lastName: 'Doe' });
  await flush();
  assert.deepEqual(calls.filter((c) => !c.href.includes('/labels/')).map((c) => [c.method, c.href]), [
    ['POST', '/service/secured/api/core/filekeylogin'],
    ['GET', '/service/secured/api/core/booking/bookingdetailslink?layout=L'],
  ]);
  const login = calls.find((c) => c.href.endsWith('/filekeylogin'));
  assert.deepEqual(login.body, { filekey: 'ABC123', lastname: 'Doe' });
  assert.equal(login.headers['X-Portal'], 'LH');
  assert.equal(login.headers['X-Portal-Site'], 'DE');
  assert.equal(login.headers['X-Portal-Language'], 'en');
  assert.equal(login.credentials, 'same-origin', 'the session cookie is kept for the link call');
  assert.equal(submitted.length, 1);
  assert.equal(submitted[0].action, BOOKING_LINK.linkTarget.targetURL);
  assert.equal(submitted[0].method, 'POST');
  assert.equal(assigned, null, 'no navigation to www');
});

test('manage booking: an unknown booking shows www\'s message, nothing opens; a phone sends layout S', async () => {
  at('www.lufthansa.com', '/de/en/book-and-manage/booking-services/manage-my-bookings');
  page({});
  answers.filekeylogin = () => new Response('', { status: 403, headers: { 'content-type': 'text/plain' } });
  const block = lookup('my-bookings', [['Tab', 'My bookings']]);
  fill(block, { reference: 'ABC123', lastName: 'Doe' });
  await flush();
  assert.equal(submitted.length, 0);
  const alert = block.querySelector('[role="alert"].booking-lookup-handoff-error');
  assert.match(alert.textContent, /Your booking could not be found/);
  answers.filekeylogin = () => new Response('', { status: 200 });
  window.small = true;
  fill(block, { reference: 'ABC123', lastName: 'Doe' });
  await flush();
  assert.ok(calls.some((c) => c.href.endsWith('bookingdetailslink?layout=S')));
  assert.equal(alert.hidden, true, 'the message goes with a new try');
});

test('manage booking elsewhere: as before (the page on www, no call)', async () => {
  at('lufthansa.turnsthe.page', '/de/en/book-and-manage/booking-services/manage-my-bookings');
  page({});
  const block = lookup('my-bookings', [['Tab', 'My bookings']]);
  fill(block, { reference: 'ABC123', lastName: 'Doe' });
  await flush();
  assert.equal(assigned, 'https://www.lufthansa.com/de/en/book-and-manage/booking-services/manage-my-bookings');
  assert.equal(calls.filter((c) => c.href.includes('/service/secured/')).length, 0);
});

const ITA_CHECKIN = [['Submit URL', 'https://www.ita-airways.com/it/en/manage-my-bookings/manage/check-in'], ['Reference label', 'Booking reference or ticket number']];

test('ITA check-in on www.ita-airways.com: fktn with ITA\'s headers, its target opened (new window)', async () => {
  at('www.ita-airways.com', '/it/en/manage-my-bookings/manage/check-in');
  page({ brand: 'ita' });
  const block = lookup('', ITA_CHECKIN);
  fill(block, { reference: 'abc123', firstName: 'John', lastName: 'Doe' });
  await flush();
  const call = calls.find((c) => c.href.endsWith('/checkin/fktn'));
  assert.ok(call);
  assert.equal(call.method, 'POST');
  assert.equal(call.href, '/service/secured/api/core/checkin/fktn');
  assert.deepEqual(call.body, {
    firstName: 'John', lastName: 'Doe', fileKey: 'ABC123', layout: 'L',
  });
  assert.deepEqual([call.headers['X-Portal'], call.headers['X-Portal-Site'], call.headers['X-Portal-Language']], ['ITA', 'IT', 'en']);
  assert.deepEqual(submitted.map((s) => [s.action, s.method, s.target]), [[CHECKIN.targetURL, 'POST', '_blank']]);
  assert.equal(assigned, null);
});

test('ITA check-in: an unknown booking shows www\'s message (common.checkin.error.bookingNotFound); a phone sends layout S', async () => {
  at('www.ita-airways.com', '/it/en/manage-my-bookings/manage/check-in');
  page({ brand: 'ita' });
  answers.fktn = () => json(NOT_FOUND, 400);
  window.small = true;
  const block = lookup('', ITA_CHECKIN);
  fill(block, { reference: 'ABC123', firstName: 'John', lastName: 'Doe' });
  await flush();
  assert.equal(calls.find((c) => c.href.endsWith('/checkin/fktn')).body.layout, 'S');
  assert.equal(submitted.length, 0);
  assert.equal(block.querySelector('.booking-lookup-handoff-error').textContent, 'Your booking could not be found. Please verify your booking code, the name entered for your booking and try again.');
  // another code of www's: its text; an unknown one: the link error
  answers.fktn = () => json({ error: 'checkin.error.notInCheckinWindow' }, 400);
  fill(block, { reference: 'ABC123', firstName: 'John', lastName: 'Doe' });
  await flush();
  assert.match(block.querySelector('.booking-lookup-handoff-error').textContent, /not yet available for check-in/);
  answers.fktn = () => json({}, 500);
  fill(block, { reference: 'ABC123', firstName: 'John', lastName: 'Doe' });
  await flush();
  assert.match(block.querySelector('.booking-lookup-handoff-error').textContent, /redirection to check-in didn't work/);
});

test('ITA check-in elsewhere: the Submit URL as before (no call)', async () => {
  at('ita.turnsthe.page', '/it/en/manage-my-bookings/manage/check-in');
  page({ brand: 'ita' });
  const block = lookup('', ITA_CHECKIN);
  fill(block, { reference: 'ABC123', firstName: 'John', lastName: 'Doe' });
  await flush();
  assert.equal(assigned, 'https://www.ita-airways.com/it/en/manage-my-bookings/manage/check-in');
  assert.equal(calls.filter((c) => c.href.includes('/service/secured/')).length, 0);
});

test('?handoff=post on lufthansa.turnsthe.page: the test-data backend\'s check-in (as on www)', async () => {
  at('ita.turnsthe.page', '/it/en/manage-my-bookings/manage/check-in', '?handoff=post');
  page({ brand: 'ita' });
  const block = lookup('', ITA_CHECKIN);
  fill(block, { reference: 'ABC123', firstName: 'John', lastName: 'Doe' });
  await flush();
  assert.ok(calls.some((c) => c.href === '/service/secured/api/core/checkin/fktn'));
  assert.equal(submitted.length, 1);
});

/** A hotel-only flight search on a page, searched for Frankfurt. */
const hotelSearch = async () => {
  const block = document.createElement('div');
  block.className = 'flight-search';
  block.innerHTML = '<div><div>Tabs</div><div>Hotel</div></div>';
  document.body.replaceChildren(block);
  decorateSearch(block);
  await flush();
  const form = block.querySelector('.flight-search-hotel-form');
  form.querySelector('input[name="cityName"]').value = 'Frankfurt am Main';
  form.querySelector('input[name="checkInDate"]').value = '2026-12-01';
  form.querySelector('input[name="checkOutDate"]').value = '2026-12-03';
  form.dispatchEvent(new window.Event('submit', { cancelable: true }));
  await flush();
  return block;
};

test('hotel tab on www.lufthansa.com: POST hotel with www\'s fields, its target opened (methodGet: GET)', async () => {
  at('www.lufthansa.com', '/de/en/hotel-offers');
  page({});
  await hotelSearch();
  const call = calls.find((c) => c.href.endsWith('/booking/hotel'));
  assert.equal(call.method, 'POST');
  assert.equal(call.href, '/service/secured/api/core/booking/hotel');
  assert.deepEqual(call.body, { cityName: 'Frankfurt am Main', checkInDate: '2026-12-01T00:00:00.000Z', checkOutDate: '2026-12-03T00:00:00.000Z' });
  assert.equal(call.headers['X-Portal'], 'LH');
  assert.deepEqual(submitted.map((s) => [s.action, s.method]), [[HOTEL.targetURL, 'GET']]);
  assert.equal(opened, null, 'not the page on www');
});

test('hotel tab elsewhere: the page on www in a new tab, as before (no call)', async () => {
  at('lufthansa.turnsthe.page', '/de/en/hotel-offers');
  page({});
  await hotelSearch();
  assert.equal(calls.filter((c) => c.href.includes('/service/secured/')).length, 0);
  assert.ok(opened && opened[0].startsWith('https://www.lufthansa.com/'));
});
