/* eslint-disable max-len */
/* The flight search names a prefilled airport code as www does (brief 347): www's airport names
   list holds only Frankfurt, so a code from the page URL (OriginCode, DestinationCode) or an
   authored one (Default origin, Default destination) that the list lacks is looked up afterwards
   with the airport suggestions call the field uses for typing (the code as the term), its
   matching entry's name shown ("Munich", "New York - JFK International, NY"); one request per
   field at most, after the form is shown; a code the names list has, a field with a name and the
   market default airport: no request; an unknown code keeps the code; a field the visitor
   changed meanwhile keeps the visitor's choice.
   Run: node --max-old-space-size=512 --test test/flight-search-airport-names.test.mjs */
/* global globalThis */
import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
const at = (pathname, search = '', hash = '') => {
  window.location = {
    hostname: 'lufthansa.turnsthe.page', pathname, search, hash, href: `https://lufthansa.turnsthe.page${pathname}${search}${hash}`, origin: 'https://lufthansa.turnsthe.page',
  };
};
window.history = { state: null, replaceState: () => {} };
window.matchMedia = () => ({ matches: false, addEventListener: () => {}, addListener: () => {} });
globalThis.window = window;
globalThis.document = document;
globalThis.Event = window.Event;

// www's answers: the names list with Frankfurt only; the suggestions per term (a city with its
// airports, an airport alone)
const SUGGESTIONS = {
  // a city and its airport under one code (as Dubai's recorded answer): the airport's name
  MUC: {
    items: [{
      airport: 'Munich, all airports',
      code: 'MUC',
      country: 'Germany',
      type: 'CITY',
      items: [{
        airport: 'Munich', code: 'MUC', country: 'Germany', type: 'AIRPORT',
      }],
    }],
  },
  JFK: {
    items: [{
      airport: 'New York, all airports',
      code: 'NYC',
      country: 'United States',
      type: 'CITY',
      items: [{
        airport: 'New York - JFK International, NY', code: 'JFK', country: 'United States', type: 'AIRPORT',
      }],
    }],
  },
  HAM: {
    items: [{
      airport: 'Hamburg', code: 'HAM', country: 'Germany', type: 'AIRPORT',
    }],
  },
  CPT: {
    items: [{
      airport: 'Cape Town', code: 'CPT', country: 'South Africa', type: 'AIRPORT',
    }],
  },
  LHR: {
    items: [{
      airport: 'London, all airports',
      code: 'LON',
      country: 'United Kingdom',
      type: 'CITY',
      items: [{
        airport: 'London Heathrow', code: 'LHR', country: 'United Kingdom', type: 'AIRPORT',
      }],
    }],
  },
  XYZ: { items: [] },
};
let suggestions;
beforeEach(() => {
  suggestions = [];
  globalThis.fetch = async (input) => {
    const url = new URL(typeof input === 'string' ? input : input.url, 'https://lufthansa.turnsthe.page');
    if (url.pathname.endsWith('/catalogs/airportnames')) return Response.json({ airports: [{ code: 'FRA', airport: 'Frankfurt/Main International' }] });
    if (url.pathname.endsWith('/defaultAirport')) return Response.json({ marketDefaultAirport: { iataCode: 'FRA', name: 'Frankfurt' } });
    if (url.pathname.endsWith('/suggestions/airports')) {
      const term = url.searchParams.get('query');
      suggestions.push(term);
      return Response.json(SUGGESTIONS[term] || { items: [] });
    }
    return new Response('{}', { status: 404, headers: { 'content-type': 'application/json' } });
  };
});

at('/de/en/homepage');
const { default: decorate } = await import('../blocks/flight-search/flight-search.js');
const tick = () => new Promise((r) => { setImmediate(r); });
const flush = () => Array.from({ length: 60 }).reduce((p) => p.then(tick), Promise.resolve());
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
const fields = (block) => ({
  origin: block.querySelector('.flight-search-origin input').value,
  destination: block.querySelector('.flight-search-destination input').value,
});
// every run its own address (the block reads a page's parameters once, also after it took them
// off the address bar)
let n = 0;
const run = async (rows, pathname, search = '', hash = '') => {
  n += 1;
  at(pathname, search || `?run=${n}`, hash);
  const block = blockOf(rows);
  decorate(block);
  const shown = fields(block);
  await flush();
  return { block, shown, ...fields(block) };
};
const ROWS = [['Trip types', 'Round trip, One-way'], ['Passenger picker', 'yes']];

test('the URL\'s codes named from the suggestions, one request per field, after the form is shown', async () => {
  const f = await run(ROWS, '/de/en/homepage', '?OriginCode=MUC&DestinationCode=JFK&TripType=roundtrip');
  assert.deepEqual(f.shown, { origin: 'MUC', destination: 'JFK' }, 'the form at once, with the codes');
  assert.equal(f.origin, 'Munich', 'the airport of the city entry with the same code, as www');
  assert.equal(f.destination, 'New York - JFK International, NY', 'the airport inside the city entry');
  assert.deepEqual(suggestions.sort(), ['JFK', 'MUC']);
  const h = await run(ROWS, '/de/de/homepage', '', '#OriginCode=HAM&DestinationCode=LHR');
  assert.equal(h.origin, 'Hamburg');
  assert.equal(h.destination, 'London Heathrow');
});

test('an authored code the names list lacks is named the same way; one it has needs no request', async () => {
  const f = await run([...ROWS, ['Default destination', 'CPT']], '/de/en/homepage');
  assert.equal(f.destination, 'Cape Town');
  assert.equal(f.origin, 'Frankfurt', 'the default airport, named by its answer');
  assert.deepEqual(suggestions, ['CPT'], 'no request for the default airport');
  const own = await run([...ROWS, ['Default origin', 'FRA'], ['Default destination', 'Cape Town (CPT)']], '/de/en/homepage');
  assert.equal(own.origin, 'Frankfurt/Main International');
  assert.equal(own.destination, 'Cape Town');
  assert.deepEqual(suggestions, ['CPT'], 'FRA from the names list, an authored name as it is: no request');
});

test('an unknown code keeps the code; no parameters and no codes: no request', async () => {
  const f = await run(ROWS, '/de/en/homepage', '?DestinationCode=XYZ');
  assert.equal(f.destination, 'XYZ');
  assert.deepEqual(suggestions, ['XYZ']);
  suggestions = [];
  const plain = await run(ROWS, '/de/en/homepage');
  assert.equal(plain.origin, 'Frankfurt');
  assert.equal(plain.destination, '');
  assert.deepEqual(suggestions, []);
});

test('a field the visitor changed before the name arrives keeps the visitor\'s choice', async () => {
  at('/de/en/homepage', '?OriginCode=MUC&DestinationCode=JFK');
  const block = blockOf(ROWS);
  let release;
  const held = new Promise((r) => { release = r; });
  const answer = globalThis.fetch;
  globalThis.fetch = async (input) => {
    const url = new URL(typeof input === 'string' ? input : input.url, 'https://lufthansa.turnsthe.page');
    if (url.pathname.endsWith('/suggestions/airports') && url.searchParams.get('query') === 'JFK') await held;
    return answer(input);
  };
  decorate(block);
  await flush();
  const input = block.querySelector('.flight-search-destination input');
  input.value = 'Boston';
  input.dispatchEvent(new window.Event('input', { bubbles: true }));
  input.dispatchEvent(new window.Event('change', { bubbles: true }));
  release();
  await flush();
  assert.notEqual(input.value, 'New York - JFK International, NY');
  assert.equal(block.querySelector('.flight-search-origin input').value, 'Munich');
});

test('the suggestions keep the airport\'s name under its city entry (the list as before)', async () => {
  const { mapAirportSuggestions } = await import('../scripts/lh-api.js');
  const list = mapAirportSuggestions(SUGGESTIONS.MUC);
  assert.equal(list.length, 1, 'one entry per code, as before');
  assert.equal(list[0].name, 'Munich, all airports');
  assert.equal(list[0].label, 'Munich, all airports (MUC), Germany');
  assert.equal(list[0].airportName, 'Munich');
  assert.equal(mapAirportSuggestions(SUGGESTIONS.HAM)[0].airportName, undefined, 'an airport alone: none');
});
