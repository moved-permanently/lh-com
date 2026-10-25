/* Destination page (blocks/destination-offer) and the price routes. Run: node --test test/ */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { formatMessage, readRoute, flightFacts } from '../blocks/destination-offer/destination-offer.js';
import {
  mapFlightPrices, flightPricesRequest, mapTeaserPrice, mapDestinationFinderOffers,
} from '../scripts/lh-api.js';
import { isPriceRoute } from '../scripts/lh-data.js';
import { sliderOrder } from '../blocks/destination-finder/destination-finder.js';

// www's answers, recorded once for tests (bd-record-api.mjs --set destination, 2026-10-25)
const WATCHED = new URL('../tools/source-export/feeds/destination/', import.meta.url);
const answers = (file) => fs.readFileSync(new URL(file, WATCHED), 'utf8').split('\n').filter(Boolean)
  .map((l) => JSON.parse(l)).filter((d) => d.status === 200 && d.text);
const find = (file, part) => JSON.parse(answers(file).find((d) => d.url.includes(part)).text);

test('www label syntax: placeholders and select', () => {
  const sub = 'From {ORIGIN} to {DESTINATION} {SHOWPRICE, select, true {from {MINPRICE}} other {}}';
  assert.equal(formatMessage(sub, {
    ORIGIN: 'Frankfurt', DESTINATION: 'Chicago', SHOWPRICE: true, MINPRICE: '601 €',
  }), 'From Frankfurt to Chicago from 601 €');
  assert.equal(formatMessage(sub, { ORIGIN: 'Frankfurt', DESTINATION: 'Chicago', SHOWPRICE: false }), 'From Frankfurt to Chicago');
  const time = 'From {HOURS, select, 0 {} other {{HOURS}h }}{MINUTES, select, 0 {} other {{MINUTES}min}}';
  assert.equal(formatMessage(time, { HOURS: 9, MINUTES: 5 }), 'From 9h 5min');
  assert.equal(formatMessage(time, { HOURS: 9, MINUTES: 0 }), 'From 9h');
  assert.equal(formatMessage('From {STOPS} {STOPS, select, 1 {stop} other {stops}}', { STOPS: 1 }), 'From 1 stop');
});

test('route from the URL: fare teaser and destination finder links', () => {
  assert.deepEqual(readRoute('?OriginCode=FRA&DestinationCode=CHI&TripDuration=7&Cabin=E'), {
    origin: 'FRA', destination: 'CHI', cabin: 'E', tripType: 'RETURN', tripDuration: 7,
  });
  assert.equal(readRoute('?OriginCode=FRA&tripType=ONEWAY&DestinationCode=NYC').tripDuration, 0);
  assert.equal(readRoute('?OriginCode=FRA&DestinationCode=NYC', { tripDuration: 14 }).tripDuration, 14);
  assert.equal(readRoute(''), null);
  assert.equal(readRoute('?OriginCode=FRA&DestinationCode=FRA'), null);
});

test('recorded answers of the four routes map as the page shows them', () => {
  const months = mapFlightPrices(find('de-en.ndjson', 'flight-prices/FRA/CHI/E/2026-10-25T23:00:00/7?mode=MONTHS'));
  assert.equal(months.originName, 'Frankfurt');
  assert.equal(months.fares.length, 12);
  assert.equal(Math.min(...months.fares.map((f) => f.price)), 601.14);
  const days = mapFlightPrices(find('gb-en.ndjson', 'mode=DAYS'));
  assert.equal(days.currency, 'GBP');
  assert.ok(days.fares.some((f) => f.best));
  // days without a price (before today) are left out
  assert.ok(days.fares.every((f) => f.price > 0));
  const labels = {
    'flight time label': 'Flight Time', 'flight time value': 'From {HOURS}h {MINUTES}min', 'stops label': 'Stops', 'stops value': 'From {STOPS} stops', 'nonstop label': 'Nonstop available', 'frequency label': 'Frequency',
  };
  assert.deepEqual(flightFacts(find('gb-en.ndjson', 'flightinfo/LON'), 'CPT', labels).map((f) => f.value), ['From 13h 35min', 'From 1 stops', '4']);
  assert.equal(flightFacts(find('de-de.ndjson', 'flightinfo/MUC'), 'NYC', labels)[1].value, 'Nonstop available');
  ['de-en.ndjson', 'de-de.ndjson', 'at-de.ndjson', 'gb-en.ndjson'].forEach((f) => {
    assert.ok(find(f, 'destination/content/').overview.cityHighlights);
  });
});

test('price routes: never from the recordings; the requests www sends', () => {
  ['/service/api/flight-prices/FRA/CHI/E/x/7', '/service/api/teaser/price/BER', '/service/api/destinationfinder/destination/finder/FRA/E?months=0_11&tripType=RETURN', '/service/api/lhg-fare-teaser/fareteaser/manual']
    .forEach((r) => assert.equal(isPriceRoute(r), true, r));
  ['/service/api/lhg-fare-teaser/fareteaser/recommend', '/service/api/labels/singleOfferDisplay/lh/en', '/service/api/destinationfinder/destination/content/CHI']
    .forEach((r) => assert.equal(isPriceRoute(r), false, r));
  assert.equal(flightPricesRequest({
    origin: 'FRA', destination: 'CHI', cabin: 'E', start: '2026-10-25T23:00:00', tripDuration: 7,
  }).route, '/service/api/flight-prices/FRA/CHI/E/2026-10-25T23%3A00%3A00/7?mode=MONTHS');
  assert.deepEqual(mapTeaserPrice({ currency: 'EUR', destination: 'Berlin', price: 141.26 }), { price: 141.26, currency: 'EUR', name: 'Berlin' });
  assert.equal(mapTeaserPrice(null), null);
});

test('destination finder slider: top deals first, then by price', () => {
  const { offers } = mapDestinationFinderOffers({
    currencyInfo: { currency: 'EUR' },
    destinationFinderOffers: [
      { city: 'AAA', price: 100 }, { city: 'BBB', price: 300, topDeal: true }, { city: 'CCC', price: 50 }, { city: 'DDD', price: 200, topDeal: true },
    ],
  });
  assert.deepEqual(sliderOrder(offers).map((o) => o.code), ['DDD', 'BBB', 'CCC', 'AAA']);
});
