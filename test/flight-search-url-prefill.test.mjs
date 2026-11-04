/* eslint-disable max-len */
/* The flight search prefilled from the page URL, as www.lufthansa.com's flight manager (brief 346,
   blocks/flight-search/url-prefill.js): the query string and the part after # (key=value&...,
   the hash wins), www's names (OriginCode, DestinationCode, TripType / IsOneWay, DepartureDate,
   ReturnDate, PaxAdults, PaxYoungAdults, PaxChildren, PaxInfants, Cabin), URL-decoded; codes of
   three letters, dates YYYY-MM-DD from today on (a return before the departure or on a one-way
   trip dropped), the counts within the picker's limits, young adults only where the Young adults
   row is on (else adults, as www where the route has none), www's N our premium economy P, a
   cabin the Cabins row doesn't offer ignored; afterwards exactly these parameters leave the
   address bar (history.replaceState). Without them: nothing changes.
   Run: node --max-old-space-size=512 --test test/flight-search-url-prefill.test.mjs */
/* global globalThis */
import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

const {
  PREFILL_PARAMS, readPrefillParams, parsePrefill, withoutPrefillParams,
} = await import('../blocks/flight-search/url-prefill.js');

const TODAY = '2026-11-04';
const parse = (query, options = {}) => parsePrefill(readPrefillParams(query, ''), { today: TODAY, ...options });

test('the names www reads, case-sensitive', () => {
  assert.deepEqual(PREFILL_PARAMS, ['OriginCode', 'DestinationCode', 'TripType', 'IsOneWay', 'DepartureDate', 'ReturnDate', 'PaxAdults', 'PaxYoungAdults', 'PaxChildren', 'PaxInfants', 'Cabin']);
  assert.deepEqual(readPrefillParams('?origincode=MUC&ORIGINCODE=FRA', ''), {}, 'other spellings: none');
  assert.deepEqual(readPrefillParams('?AccessCode=x&ActiveTab=flight&PaxInfantsOnSeat=1&Duration=7', ''), {}, 'www\'s other names: ignored');
  assert.deepEqual(readPrefillParams('', ''), {});
});

test('query and hash both count, URL-decoded; the hash wins on a clash', () => {
  assert.deepEqual(readPrefillParams('?OriginCode=MUC&DestinationCode=JFK&foo=1', '#DestinationCode=LHR&Cabin=B'), {
    OriginCode: 'MUC', DestinationCode: 'LHR', Cabin: 'B',
  });
  assert.deepEqual(readPrefillParams('', '#OriginCode=%48AM&TripType=one%77ay'), { OriginCode: 'HAM', TripType: 'oneway' });
  assert.equal(parse('?OriginCode=%E0%A4%A').origin, undefined, 'a broken escape: no error, no code');
  assert.deepEqual(readPrefillParams('', '#main'), {}, 'another hash: nothing');
});

test('www\'s two examples', () => {
  assert.deepEqual(parse('?OriginCode=MUC&DestinationCode=JFK&TripType=roundtrip&DepartureDate=2026-12-10&ReturnDate=2026-12-17&PaxAdults=2&PaxChildren=1&Cabin=B'), {
    origin: 'MUC',
    destination: 'JFK',
    tripType: 'RETURN',
    departureDate: '2026-12-10',
    returnDate: '2026-12-17',
    passengers: { adults: 2, children: 1, infants: 0 },
    cabin: 'B',
  });
  assert.deepEqual(parsePrefill(readPrefillParams('', '#OriginCode=HAM&DestinationCode=LHR&TripType=oneway&DepartureDate=2026-12-12&PaxAdults=1&PaxInfants=1&Cabin=N'), { today: TODAY }), {
    origin: 'HAM',
    destination: 'LHR',
    tripType: 'ONEWAY',
    departureDate: '2026-12-12',
    passengers: { adults: 1, children: 0, infants: 1 },
    cabin: 'P',
  });
});

test('codes: three letters, upper case; anything else ignored', () => {
  assert.equal(parse('?OriginCode=muc').origin, 'MUC');
  assert.equal(parse('?OriginCode=MUNICH').origin, undefined);
  assert.equal(parse('?DestinationCode=J1K').destination, undefined);
  assert.equal(parse('?OriginCode=').origin, undefined);
});

test('trip type: TripType roundtrip | oneway, IsOneWay as the second spelling; TripType first', () => {
  assert.equal(parse('?TripType=oneway').tripType, 'ONEWAY');
  assert.equal(parse('?TripType=roundtrip').tripType, 'RETURN');
  assert.equal(parse('?IsOneWay=true').tripType, 'ONEWAY');
  assert.equal(parse('?IsOneWay=false').tripType, 'RETURN');
  assert.equal(parse('?TripType=roundtrip&IsOneWay=true').tripType, 'RETURN');
  assert.equal(parse('?TripType=multicity').tripType, undefined);
});

test('dates: YYYY-MM-DD only, real, from today on; a return before the departure or on one way dropped', () => {
  assert.equal(parse('?DepartureDate=2026-11-04').departureDate, '2026-11-04', 'today');
  assert.equal(parse('?DepartureDate=2026-11-03').departureDate, undefined, 'past');
  assert.equal(parse('?DepartureDate=2026-02-30').departureDate, undefined, 'no such day');
  assert.equal(parse('?DepartureDate=10.12.2026').departureDate, undefined);
  assert.equal(parse('?DepartureDate=2026-12-1').departureDate, undefined);
  assert.equal(parse('?DepartureDate=2026-12-10&ReturnDate=2026-12-09').returnDate, undefined, 'before the departure');
  assert.equal(parse('?DepartureDate=2026-12-10&ReturnDate=2026-12-10').returnDate, '2026-12-10', 'the same day');
  assert.equal(parse('?TripType=oneway&DepartureDate=2026-12-10&ReturnDate=2026-12-17').returnDate, undefined, 'one way');
  assert.equal(parse('?IsOneWay=true&ReturnDate=2026-12-17').returnDate, undefined);
  assert.equal(parse('?ReturnDate=2026-12-17').returnDate, '2026-12-17', 'no trip type: the block decides');
});

test('passengers: within the picker\'s limits; nothing without a count', () => {
  assert.equal(parse('?OriginCode=MUC').passengers, undefined);
  assert.deepEqual(parse('?PaxAdults=12').passengers, { adults: 9, children: 0, infants: 0 });
  assert.deepEqual(parse('?PaxAdults=0').passengers, { adults: 1, children: 0, infants: 0 });
  assert.deepEqual(parse('?PaxAdults=6&PaxChildren=6').passengers, { adults: 6, children: 3, infants: 0 });
  assert.deepEqual(parse('?PaxAdults=2&PaxInfants=4').passengers, { adults: 2, children: 0, infants: 2 });
  assert.deepEqual(parse('?PaxChildren=2').passengers, { adults: 1, children: 2, infants: 0 }, 'the authored adults by default');
  assert.deepEqual(parse('?PaxChildren=2', { adults: 3 }).passengers, { adults: 3, children: 2, infants: 0 });
  assert.deepEqual(parse('?PaxAdults=two&PaxChildren=-1').passengers, { adults: 1, children: 0, infants: 0 }, 'no number: the default');
});

test('young adults: where the Young adults row is on; elsewhere added to the adults', () => {
  assert.deepEqual(parse('?PaxAdults=1&PaxYoungAdults=2', { youngAdults: true }).passengers, {
    adults: 1, youngAdults: 2, children: 0, infants: 0,
  });
  assert.deepEqual(parse('?PaxAdults=1&PaxYoungAdults=2').passengers, { adults: 3, children: 0, infants: 0 });
  assert.deepEqual(parse('?PaxAdults=5&PaxYoungAdults=3&PaxChildren=3', { youngAdults: true }).passengers, {
    adults: 5, youngAdults: 3, children: 1, infants: 0,
  });
  assert.deepEqual(parse('?PaxAdults=8&PaxYoungAdults=3').passengers, { adults: 9, children: 0, infants: 0 });
});

test('cabin: E, N (our P), P, B, F; only those the Cabins row offers', () => {
  assert.equal(parse('?Cabin=N').cabin, 'P');
  assert.equal(parse('?Cabin=P').cabin, 'P');
  assert.equal(parse('?Cabin=b').cabin, 'B');
  assert.equal(parse('?Cabin=F').cabin, 'F');
  assert.equal(parse('?Cabin=X').cabin, undefined);
  assert.equal(parse('?Cabin=F', { cabins: ['E', 'B'] }).cabin, undefined, 'not offered');
  assert.equal(parse('?Cabin=N', { cabins: ['E', 'P'] }).cabin, 'P');
});

test('the address bar: exactly these parameters off, every other parameter and hash kept', () => {
  assert.equal(withoutPrefillParams('https://lufthansa.turnsthe.page/de/en/homepage?OriginCode=MUC&DestinationCode=JFK&utm_source=x'), 'https://lufthansa.turnsthe.page/de/en/homepage?utm_source=x');
  assert.equal(withoutPrefillParams('https://lufthansa.turnsthe.page/de/de/homepage#OriginCode=HAM&Cabin=N'), 'https://lufthansa.turnsthe.page/de/de/homepage');
  assert.equal(withoutPrefillParams('https://x.test/p?Cabin=B&AccessCode=7#OriginCode=HAM&tab=2'), 'https://x.test/p?AccessCode=7#tab=2');
  assert.equal(withoutPrefillParams('https://x.test/p?a=1#main'), null, 'nothing to take off');
  assert.equal(withoutPrefillParams('https://x.test/p'), null);
});

/* The block (linkedom): dates in 2099, as tests run later too; the URL values over the authored rows and the default airport, the rest
   from the rows; no defaultAirport request with OriginCode; one way hides the return date; the
   picker and the traveller line; the address bar cleaned; without parameters as before. */
const { window, document } = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
let replaced;
const at = (pathname, search = '', hash = '') => {
  window.location = {
    hostname: 'lufthansa.turnsthe.page', pathname, search, hash, href: `https://lufthansa.turnsthe.page${pathname}${search}${hash}`, origin: 'https://lufthansa.turnsthe.page',
  };
};
window.history = { state: null, replaceState: (state, title, url) => { replaced.push(url); } };
window.matchMedia = () => ({ matches: false, addEventListener: () => {}, addListener: () => {} });
globalThis.window = window;
globalThis.document = document;
globalThis.Event = window.Event;
let requests;
beforeEach(() => {
  replaced = [];
  requests = [];
  globalThis.fetch = async (input) => {
    const url = new URL(typeof input === 'string' ? input : input.url, 'https://lufthansa.turnsthe.page');
    requests.push(url.pathname);
    if (url.pathname.endsWith('/catalogs/airportnames')) {
      return Response.json({ airports: [{ code: 'MUC', airport: 'Munich' }, { code: 'JFK', airport: 'New York - JFK International, NY' }, { code: 'HAM', airport: 'Hamburg' }, { code: 'LHR', airport: 'London Heathrow' }, { code: 'FRA', airport: 'Frankfurt' }] });
    }
    if (url.pathname.endsWith('/defaultAirport')) return Response.json({ marketDefaultAirport: { iataCode: 'FRA', name: 'Frankfurt' } });
    return new Response('{}', { status: 404, headers: { 'content-type': 'application/json' } });
  };
});

at('/de/en/homepage');
const { default: decorate } = await import('../blocks/flight-search/flight-search.js');
const tick = () => new Promise((r) => { setImmediate(r); });
const flush = () => Array.from({ length: 30 }).reduce((p) => p.then(tick), Promise.resolve());
const blockOf = (rows) => {
  const block = document.createElement('div');
  block.className = 'flight-search';
  rows.forEach(([k, v]) => {
    const row = document.createElement('div');
    row.innerHTML = `<div>${k}</div><div>${v}</div>`;
    block.append(row);
  });
  document.body.replaceChildren(block);
  return block;
};
const ROWS = [['Trip types', 'Round trip, One-way'], ['Passenger picker', 'yes'], ['Cabins', 'E, P, B, F'], ['Default destination', 'CPT']];
const run = async (rows, pathname, search = '', hash = '') => {
  at(pathname, search, hash);
  const block = blockOf(rows);
  decorate(block);
  await flush();
  const q = (s) => block.querySelector(s);
  return {
    block,
    origin: q('.flight-search-origin input').value,
    destination: q('.flight-search-destination input').value,
    tripType: q('select[name="tripType"]')?.value,
    departure: q('input[name="departure"]').value,
    ret: q('input[name="return"]').value,
    returnHidden: q('.flight-search-return').hidden,
    travellers: q('.flight-search-travellers')?.textContent,
  };
};

test('the block: www\'s first example on de/en (query), the address bar cleaned, no defaultAirport request', async () => {
  const f = await run(ROWS, '/de/en/homepage', '?OriginCode=MUC&DestinationCode=JFK&TripType=roundtrip&DepartureDate=2099-12-10&ReturnDate=2099-12-17&PaxAdults=2&PaxChildren=1&Cabin=B&utm_campaign=x');
  assert.equal(f.origin, 'Munich');
  assert.equal(f.destination, 'New York - JFK International, NY');
  assert.equal(f.tripType, 'RETURN');
  assert.equal(f.departure, '2099-12-10');
  assert.equal(f.ret, '2099-12-17');
  assert.equal(f.travellers, 'Business, 3 Travellers');
  assert.deepEqual(replaced, ['https://lufthansa.turnsthe.page/de/en/homepage?utm_campaign=x']);
  assert.ok(!requests.some((p) => p.endsWith('/defaultAirport')), 'OriginCode: no defaultAirport request');
});

test('the block: www\'s second example on de/de (hash): one way hides the return date', async () => {
  const f = await run(ROWS, '/de/de/homepage', '', '#OriginCode=HAM&DestinationCode=LHR&TripType=oneway&DepartureDate=2099-12-12&PaxAdults=1&PaxInfants=1&Cabin=N');
  assert.equal(f.origin, 'Hamburg');
  assert.equal(f.destination, 'London Heathrow');
  assert.equal(f.tripType, 'ONEWAY');
  assert.equal(f.departure, '2099-12-12');
  assert.equal(f.ret, '');
  assert.equal(f.returnHidden, true);
  assert.equal(f.travellers, 'Premium Economy, 2 Reisende');
  assert.deepEqual(replaced, ['https://lufthansa.turnsthe.page/de/de/homepage']);
});

test('the block: the authored rows for what the URL doesn\'t set; an unknown code shows the code', async () => {
  const f = await run([...ROWS, ['Default origin', 'Frankfurt (FRA)'], ['Adults', '2'], ['Cabin', 'B']], '/de/en/homepage', '?DestinationCode=XYZ&DepartureDate=2020-01-01');
  assert.equal(f.origin, 'Frankfurt');
  assert.equal(f.destination, 'XYZ');
  assert.equal(f.departure, '', 'a past date: dropped, no error');
  assert.equal(f.travellers, 'Business, 2 Travellers');
  assert.equal(f.block.querySelector('.flight-search-error').hidden, true);
});

test('the block: young adults only where the row is on for the root; else adults', async () => {
  const on = await run([...ROWS, ['Young adults', 'DE']], '/de/en/homepage', '?PaxAdults=1&PaxYoungAdults=2');
  assert.equal(on.block.querySelector('.flight-search-passenger-young-adults output').textContent, '2');
  assert.equal(on.travellers, 'Economy, 3 Travellers');
  const off = await run([...ROWS, ['Young adults', 'GB']], '/de/en/homepage', '?PaxAdults=1&PaxYoungAdults=2');
  assert.equal(off.block.querySelector('.flight-search-passenger-young-adults'), null);
  assert.equal(off.block.querySelector('.flight-search-passenger-adults output').textContent, '3');
});

test('the block without the Passenger picker row: adults and cabin fill the traveller line', async () => {
  const f = await run([['Traveller label', 'Economy, 1 Traveller'], ['Default destination', 'CPT']], '/de/en/homepage', '?PaxAdults=2&Cabin=F');
  assert.equal(f.travellers, 'First, 2 Travellers');
  const plain = await run([['Traveller label', 'Economy, 1 Traveller']], '/de/en/homepage', '?OriginCode=MUC');
  assert.equal(plain.travellers, 'Economy, 1 Traveller', 'no counts or cabin in the URL: the authored line');
});

test('the block without parameters: the same HTML and requests as before (the default airport)', async () => {
  const f = await run(ROWS, '/de/en/homepage', '?utm_source=x', '#main');
  assert.equal(f.origin, 'Frankfurt');
  assert.equal(f.departure, '');
  assert.equal(f.travellers, 'Economy, 1 Traveller');
  assert.ok(requests.some((p) => p.endsWith('/defaultAirport')));
  assert.deepEqual(replaced, [], 'the address bar untouched');
});
