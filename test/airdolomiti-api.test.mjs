/* eslint-disable max-len, no-await-in-loop, no-restricted-syntax, no-script-url */
/* Air Dolomiti's API (scripts/airdolomiti-api.js) as www.airdolomiti.it's widgets call it: the
   airports, a route's dates, the timetable search and the booking retrieval, each answered with
   the engine's address and what to post there. The requests must be www's byte for byte (recorded
   2026-11-01 on www.airdolomiti.it and .eu, test/fixtures/airdolomiti-api; no live calls here).
   Run: node --max-old-space-size=512 --test test/airdolomiti-api.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  AD_API, NO_CONSENT, adLang, apiDate, isoDate, fetchAirports, fetchFlightDates,
  timetableRequest, requestTimetable, manageRequest, requestManage, adHandoffUrl,
} from '../scripts/airdolomiti-api.js';

const fixture = (f) => JSON.parse(fs.readFileSync(new URL(`./fixtures/airdolomiti-api/${f}`, import.meta.url), 'utf8'));
const ONEWAY = fixture('timetable-oneway-it.json');
const RETURN = fixture('timetable-return-en.json');
const PNR = fixture('retrieve-pnr-it.json');

/** A fetch answering one recorded call; the calls it saw. */
function recorded(status, answer) {
  const calls = [];
  const fetchImpl = async (url, init = {}) => {
    calls.push({ url: String(url), init });
    return new Response(JSON.stringify(answer), { status, headers: { 'content-type': 'application/json' } });
  };
  return { calls, fetchImpl };
}

test('the page\'s language: it on the Italian root, en and de on theirs; the engine\'s Accept-Language', () => {
  assert.equal(adLang('/orario-voli'), 'it');
  assert.equal(adLang('/en/flight-timetables'), 'en');
  assert.equal(adLang('/de/flugplan'), 'de');
  assert.equal(adLang('/content/de/flugplan'), 'de', 'the local dev server\'s /content prefix');
  assert.equal(adLang('/fr/x'), 'it');
  assert.equal(apiDate('2026-11-15'), '15/11/2026');
  assert.equal(isoDate('15/11/2026'), '2026-11-15');
  assert.equal(isoDate('31/02/2026'), null);
});

test('airports and dates: GET as www\'s widget, the answers as they come', async () => {
  const airports = fixture('airports.json');
  const a = recorded(200, airports);
  assert.deepEqual(await fetchAirports(a.fetchImpl), airports);
  assert.equal(a.calls[0].url, `${AD_API}/airports`);
  assert.equal(a.calls[0].init.method || 'GET', 'GET');
  const dates = fixture('dates-MUC-VRN.json');
  const d = recorded(200, dates);
  assert.deepEqual(await fetchFlightDates('MUC', 'VRN', d.fetchImpl), dates);
  assert.equal(d.calls[0].url, `${AD_API}/flights/dates/MUC-VRN`);
  await assert.rejects(fetchFlightDates('MUC', 'VRN', recorded(500, {}).fetchImpl));
  await assert.rejects(fetchFlightDates('MU C', 'VRN', d.fetchImpl), /code/);
});

test('timetable: www\'s request byte for byte (one way: return 01/01/1970; round trip: R and its return), consent not given', () => {
  const one = timetableRequest({
    origin: 'MUC', destination: 'VRN', departureDate: '2026-11-15', tripType: 'O',
  }, 'it');
  assert.equal(one.url, `${AD_API}/bookings/timetable`);
  assert.equal(one.init.method, 'POST');
  assert.deepEqual(one.init.headers, { 'Content-Type': 'application/json', 'Accept-Language': 'it' });
  assert.equal(one.init.body, JSON.stringify(ONEWAY.request.body));
  const ret = timetableRequest({
    origin: 'MUC', destination: 'VRN', departureDate: '2026-11-15', returnDate: '2026-11-20', tripType: 'R',
  }, 'en');
  assert.equal(ret.init.headers['Accept-Language'], 'en');
  assert.equal(ret.init.body, JSON.stringify(RETURN.request.body));
  assert.deepEqual(NO_CONSENT, {
    statistics_consent: false, marketing_consent: false, experience_consent: false, consent_date: null, consent_id: null,
  });
  assert.throws(() => timetableRequest({ origin: 'MUC', destination: 'VRN', tripType: 'O' }, 'it'), /date/);
  assert.throws(() => timetableRequest({
    origin: 'MUC', destination: 'VRN', departureDate: '2026-11-15', tripType: 'R',
  }, 'it'), /return/);
});

test('timetable hand-off: the answer\'s url, one field search = JSON of payload.search (www\'s post)', async () => {
  for (const rec of [ONEWAY, RETURN]) {
    const { fetchImpl, calls } = recorded(rec.request.status, rec.request.answer);
    const { body } = rec.request;
    const handoff = await requestTimetable({
      origin: body.departure_airport, destination: body.destination_airport, departureDate: isoDate(body.departure_date), returnDate: body.trip_type === 'R' ? isoDate(body.return_date) : '', tripType: body.trip_type,
    }, rec.request.headers['accept-language'], fetchImpl);
    assert.equal(calls.length, 1);
    assert.equal(handoff.action, rec.request.answer.url);
    assert.deepEqual(Object.keys(handoff.fields), ['search']);
    // www's form field, its own (Google Analytics' _gl parameter on www's action aside)
    assert.equal(handoff.fields.search, Object.fromEntries(rec.handoff.fields).search);
    assert.equal(handoff.action, rec.handoff.action.replace(/&_gl=.*$/, ''));
  }
});

test('manage booking: www\'s request, the hand-off with recLoc, lastName, dxMMBTripFlow and portalFacts', async () => {
  const req = manageRequest({ surname: 'Rossi', bookingCode: 'ABC123' }, 'it');
  assert.equal(req.url, `${AD_API}/bookings/retrieve-pnr`);
  assert.equal(req.init.method, 'POST');
  assert.deepEqual(req.init.headers, { Accept: 'application/json', 'Content-Type': 'application/json', 'Accept-Language': 'it' });
  assert.equal(req.init.body, JSON.stringify(PNR.request.body));
  assert.equal(manageRequest({ surname: ' Rossi ', bookingCode: ' ABC123 ' }, 'it').init.body, JSON.stringify(PNR.request.body), 'trimmed');
  const { fetchImpl } = recorded(201, PNR.request.answer);
  const handoff = await requestManage({ surname: 'Rossi', bookingCode: 'ABC123' }, 'it', fetchImpl);
  assert.equal(handoff.action, PNR.request.answer.url);
  assert.deepEqual(Object.entries(handoff.fields), PNR.handoff.fields, 'www\'s four fields, in its order and with its values');
  // an answer without portalFacts: the car rental fact with the current date and time
  const { payload } = PNR.request.answer;
  const bare = recorded(201, { url: PNR.request.answer.url, payload: { recLoc: payload.recLoc, lastName: payload.lastName, dxMMBTripFlow: payload.dxMMBTripFlow } });
  const now = new Date('2026-11-01T10:15:30Z');
  const own = await requestManage({ surname: 'Rossi', bookingCode: 'ABC123' }, 'it', bare.fetchImpl, now);
  assert.deepEqual(JSON.parse(own.fields.portalFacts), [{ key: 'carsDateandTime', value: '2026-11-01T10:15:30.000Z' }]);
  assert.throws(() => manageRequest({ surname: '', bookingCode: 'ABC123' }, 'it'), /surname/);
  assert.throws(() => manageRequest({ surname: 'Rossi', bookingCode: '' }, 'it'), /booking code/);
});

test('only Air Dolomiti\'s engine is posted to: another host, http or a broken answer is refused', async () => {
  assert.ok(adHandoffUrl('https://digital.airdolomiti.it/booking/timetable?lang=it-IT'));
  ['http://digital.airdolomiti.it/booking', 'https://digital.airdolomiti.it.example.com/x', 'https://evil.example/booking', 'javascript:alert(1)', '']
    .forEach((u) => assert.ok(!adHandoffUrl(u), u));
  const query = {
    origin: 'MUC', destination: 'VRN', departureDate: '2026-11-15', tripType: 'O',
  };
  await assert.rejects(requestTimetable(query, 'it', recorded(201, { url: 'https://evil.example/booking', payload: { search: {} } }).fetchImpl), /engine/);
  await assert.rejects(requestTimetable(query, 'it', recorded(201, { url: ONEWAY.request.answer.url }).fetchImpl), /search/);
  await assert.rejects(requestTimetable(query, 'it', recorded(500, { error: 'x' }).fetchImpl), /500/);
  await assert.rejects(requestManage({ surname: 'Rossi', bookingCode: 'ABC123' }, 'it', recorded(201, { url: PNR.request.answer.url, payload: { recLoc: 'ABC123' } }).fetchImpl), /dxMMBTripFlow/);
});
