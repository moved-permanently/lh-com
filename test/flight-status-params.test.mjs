/* eslint-disable max-len */
/* The flight status handoff (blocks/flight-status buildFlightStatusUrl, flightStatusPost): www's own
   query parameters, captured 2026-10-31 on www.lufthansa.com, www.austrian.com,
   www.discover-airlines.com and www.ita-airways.com (the same component, the same names): the
   number tab flightStatus.flightStatusByFlightNumberRequest.airline/.flightNumber/.date, the
   route tab ...ByFlightRouteRequest.originCode.code/.destinationCode.code/.date, the airport tab
   ...ByAirportRequest.airport.code/.odType DEPARTURE|ARRIVAL/.date, and flightStatus.activeTab;
   www shows results for these codes-only URLs (the old tab/flightNumber/date: none). Air Dolomiti's
   engine takes a POST (Submit method post, the field name rows).
   Run: node --max-old-space-size=512 --test test/flight-status-params.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
// the block's imports load scripts.js: on a demo host's / it only redirects (stubbed)
window.hlx = { codeBasePath: '' };
window.location = {
  hostname: 'main--lh-com--moved-permanently.aem.page', pathname: '/', search: '', replace: () => {}, href: 'https://main--lh-com--moved-permanently.aem.page/', origin: 'https://main--lh-com--moved-permanently.aem.page',
};
window.origin = window.location.origin;
window.matchMedia = () => ({ matches: false, addEventListener: () => {}, addListener: () => {} });
globalThis.window = window;
globalThis.document = document;
const { buildFlightStatusUrl, flightStatusPost } = await import('../blocks/flight-status/flight-status.js');

const locale = { base: '/de/en' };
const params = (url) => [...new URL(url).searchParams.entries()].map(([k, v]) => `${k}=${v}`);

test('number tab: www\'s parameters', () => {
  const url = buildFlightStatusUrl({
    type: 'number', airline: 'LH', flightNumber: '400', date: '2026-11-01',
  }, locale);
  assert.match(url, /^https:\/\/www\.lufthansa\.com\/de\/en\/timetable-and-flight-status\?/);
  assert.deepEqual(params(url), [
    'flightStatus.flightStatusByFlightNumberRequest.airline=LH',
    'flightStatus.flightStatusByFlightNumberRequest.flightNumber=400',
    'flightStatus.flightStatusByFlightNumberRequest.date=2026-11-01T00:00:00',
    'flightStatus.activeTab=number',
  ]);
});

test('route and airport tabs: www\'s parameters, the direction as odType', () => {
  assert.deepEqual(params(buildFlightStatusUrl({
    type: 'route', origin: 'FRA', destination: 'MUC', date: '2026-11-01',
  }, locale)), [
    'flightStatus.flightStatusByFlightRouteRequest.originCode.code=FRA',
    'flightStatus.flightStatusByFlightRouteRequest.destinationCode.code=MUC',
    'flightStatus.flightStatusByFlightRouteRequest.date=2026-11-01T00:00:00',
    'flightStatus.activeTab=route',
  ]);
  assert.deepEqual(params(buildFlightStatusUrl({
    type: 'airport', airport: 'FRA', direction: 'arrival', date: '2026-11-01',
  }, locale)), [
    'flightStatus.flightStatusByAirportRequest.airport.code=FRA',
    'flightStatus.flightStatusByAirportRequest.odType=ARRIVAL',
    'flightStatus.flightStatusByAirportRequest.date=2026-11-01T00:00:00',
    'flightStatus.activeTab=airport',
  ]);
  assert.ok(params(buildFlightStatusUrl({
    type: 'airport', airport: 'FRA', direction: 'departure', date: '2026-11-01',
  }, locale)).includes('flightStatus.flightStatusByAirportRequest.odType=DEPARTURE'));
});

test('POST mode: Air Dolomiti\'s engine with its field names; without the rows none', () => {
  const rows = {
    method: 'post', airline: 'airlineCode', flightNumber: 'flightNumber', date: 'departureDate',
  };
  const query = {
    type: 'number', airline: 'EN', flightNumber: '8201', date: '2026-10-31',
  };
  assert.deepEqual(flightStatusPost(query, 'https://digital.airdolomiti.it/booking/flight-status?lang=it-IT', rows), {
    action: 'https://digital.airdolomiti.it/booking/flight-status?lang=it-IT',
    fields: { airlineCode: 'EN', flightNumber: '8201', departureDate: '2026-10-31' },
  });
  assert.equal(flightStatusPost(query, 'https://digital.airdolomiti.it/booking/flight-status?lang=it-IT', { method: '' }), null, 'no Submit method: the GET link');
  assert.equal(flightStatusPost(query, 'https://evil.example.com/x', rows), null, 'only the handoff hosts');
  assert.equal(flightStatusPost({ ...query, type: 'route' }, 'https://digital.airdolomiti.it/booking/flight-status', rows), null, 'number searches only');
});
