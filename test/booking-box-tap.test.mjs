/* booking-box's TAP format (brief 324; tools/reports/tap/booking-spec.md 5.2, 2.3, 5.3): the
   hand-off to booking.flytap.com (the spec's 11 cases), the check-in and manage-booking links,
   TAP's passenger rules and its airport matching on the per-root airport sheet.
   Run: node --max-old-space-size=512 --test test/booking-box-tap.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildTapDeeplink, tapCheckinUrl, tapManageUrl, isBookingCode, isUkRoute, UK_AIRPORTS,
  passengersValid, canChange, MAX_PASSENGERS, TAP_BOOKING_HOST,
} from '../blocks/booking-box/tap-format.js';
import {
  matchAirports, scoreAirport, airportsFromSheet, fold, fieldText, optionText,
} from '../blocks/booking-box/airport-match.js';

const U = '00000000-0000-4000-8000-000000000000';
const BASE = 'https://booking.flytap.com/booking/flights/deeplink?';
const TAIL = '&x_tap_source=WEB&x_tap_username=&x_tap_correlationid=00000000-0000-4000-8000-000000000000';
const R1 = {
  market: 'PT', language: 'pt', tripType: 'return', flights: [{ origin: 'LIS', destination: 'OPO', date: '2026-11-28' }], returnDate: '2026-12-02', adults: 1,
};

test('1. return LIS-OPO, PT/pt: as recorded R1 (apart from the UUID)', () => {
  assert.equal(buildTapDeeplink(R1, U), `${BASE}market=PT&language=pt&origin=LIS&destination=OPO&flexibleDates=false&flightType=return&adt=1&chd=0&inf=0&yth=0&depDate=28.11.2026&headerfooterhidden=false&retDate=02.12.2026${TAIL}`);
});

test('2. one way LIS-PAR: flightType single, no retDate (R2)', () => {
  const url = buildTapDeeplink({
    market: 'PT', language: 'pt', tripType: 'one-way', flights: [{ origin: 'LIS', destination: 'PAR', date: '2026-11-28' }], adults: 1,
  }, U);
  assert.equal(url, `${BASE}market=PT&language=pt&origin=LIS&destination=PAR&flexibleDates=false&flightType=single&adt=1&chd=0&inf=0&yth=0&depDate=28.11.2026&headerfooterhidden=false${TAIL}`);
});

test('3. en-pt: language en (R3); 4. es-es MAD-OPO, ES/es (R4); 10. pl-pl WAW-LIS', () => {
  assert.ok(buildTapDeeplink({ ...R1, language: 'en' }, U).startsWith(`${BASE}market=PT&language=en&origin=LIS&destination=OPO&`));
  assert.ok(buildTapDeeplink({
    ...R1, market: 'ES', language: 'es', flights: [{ origin: 'MAD', destination: 'OPO', date: '2026-11-28' }],
  }, U)
    .startsWith(`${BASE}market=ES&language=es&origin=MAD&destination=OPO&flexibleDates=false&flightType=return&`));
  assert.ok(buildTapDeeplink({
    ...R1, market: 'PL', language: 'pl', flights: [{ origin: 'WAW', destination: 'LIS', date: '2026-11-28' }],
  }, U)
    .startsWith(`${BASE}market=PL&language=pl&origin=WAW&destination=LIS&`));
  // lower case in, upper and lower case out; a 5-letter language tag sends its language
  assert.ok(buildTapDeeplink({ ...R1, market: 'pt', language: 'pt-BR' }, U).startsWith(`${BASE}market=PT&language=pt&`));
});

test('5. fr-fr one way PAR-LIS, 2 adults 1 child 1 infant (R5 plus the x_tap fields)', () => {
  const url = buildTapDeeplink({
    market: 'FR', language: 'fr', tripType: 'one-way', flights: [{ origin: 'PAR', destination: 'LIS', date: '2026-12-05' }], adults: 2, children: 1, infants: 1,
  }, U);
  assert.equal(url, `${BASE}market=FR&language=fr&origin=PAR&destination=LIS&flexibleDates=false&flightType=single&adt=2&chd=1&inf=1&yth=0&depDate=05.12.2026&headerfooterhidden=false${TAIL}`);
});

test('6. multi-city LIS-PAR, PAR-OPO, OPO-LIS: the multicity deeplink, flightType openJaw, origin1..', () => {
  const url = buildTapDeeplink({
    market: 'PT',
    language: 'pt',
    tripType: 'multi-city',
    flights: [{ origin: 'LIS', destination: 'PAR', date: '2026-12-05' }, { origin: 'PAR', destination: 'OPO', date: '2026-12-10' }, { origin: 'OPO', destination: 'LIS', date: '2026-12-15' }],
    adults: 1,
  }, U);
  assert.equal(url, `https://booking.flytap.com/booking/flights-multicity/deeplink?market=PT&language=pt&origin=LIS&destination=PAR&flexibleDates=false&flightType=openJaw&adt=1&chd=0&inf=0&yth=0&depDate=05.12.2026&headerfooterhidden=false&origin1=PAR&destination1=OPO&depDate1=10.12.2026&origin2=OPO&destination2=LIS&depDate2=15.12.2026${TAIL}`);
});

test('7. pay with miles: award=true at the end; 8. LHR-LIS with a young adult: yth=1; 9. date padding', () => {
  assert.equal(buildTapDeeplink({ ...R1, payWithMiles: true }, U), `${buildTapDeeplink(R1, U)}&award=true`);
  const uk = buildTapDeeplink({ ...R1, flights: [{ origin: 'LHR', destination: 'LIS', date: '2026-11-28' }], youngAdults: 1 }, U);
  assert.match(uk, /&adt=1&chd=0&inf=0&yth=1&/);
  assert.match(buildTapDeeplink({ ...R1, flights: [{ origin: 'LIS', destination: 'OPO', date: '2027-01-05' }], returnDate: '2027-01-09' }, U), /&depDate=05\.01\.2027&headerfooterhidden=false&retDate=09\.01\.2027&/);
  assert.equal(new URL(buildTapDeeplink(R1, U)).host, TAP_BOOKING_HOST);
});

test('11. guards: no return date, no destination, origin = destination, more than 6 flights throw; young adults off a UK route are yth=0', () => {
  assert.throws(() => buildTapDeeplink({ ...R1, returnDate: undefined }, U), /return/i);
  assert.throws(() => buildTapDeeplink({ ...R1, flights: [{ origin: 'LIS', destination: '', date: '2026-11-28' }] }, U), /destination/i);
  assert.throws(() => buildTapDeeplink({ ...R1, flights: [{ origin: 'LIS', destination: 'LIS', date: '2026-11-28' }] }, U), /same/i);
  const seven = Array.from({ length: 7 }, (_, i) => ({ origin: i % 2 ? 'OPO' : 'LIS', destination: i % 2 ? 'LIS' : 'OPO', date: `2026-12-${String(i + 1).padStart(2, '0')}` }));
  assert.throws(() => buildTapDeeplink({ ...R1, tripType: 'multi-city', flights: seven }, U), /6 flights/);
  assert.throws(() => buildTapDeeplink({ ...R1, returnDate: '2026-11-27' }, U), /return/i, 'a return before the departure');
  assert.throws(() => buildTapDeeplink({ ...R1, flights: [{ origin: 'LIS', destination: 'OPO', date: '28.11.2026' }] }, U), /date/i);
  assert.throws(() => buildTapDeeplink({ ...R1, adults: 0 }, U), /passengers/i);
  assert.match(buildTapDeeplink({ ...R1, youngAdults: 2 }, U), /&adt=1&chd=0&inf=0&yth=0&/);
});

test('check-in and manage booking: TAP\'s own links, the code and last name rules', () => {
  assert.equal(tapCheckinUrl({ code: 'ab12cd', lastName: 'Silva', language: 'pt' }), 'https://checkin.si.amadeus.net/static/PRD/TP/#/checkindirect?Redirected=true&ISurname=Silva&IFormOfIdentification=PNR&IIdentification=AB12CD&ln=pt');
  assert.equal(tapManageUrl({
    code: 'AB12CD', lastName: 'da Silva', market: 'pt', language: 'pt',
  }), 'https://myb.flytap.com/my-bookings/details/AB12CD/da%20Silva?market=PT&language=pt');
  assert.equal(isBookingCode('AB12CD'), true);
  assert.equal(isBookingCode(' ab12cd '), true);
  assert.equal(isBookingCode('0471234567890'), true, '13-digit ticket');
  ['AB12C', 'AB12CDE', '047123456789', 'AB-12C', ''].forEach((c) => assert.equal(isBookingCode(c), false, c));
});

test('passengers: at most 9, adults + young adults at least 1, one infant per adult, 7 children per adult, fewer with infants', () => {
  const p = (adults, children = 0, infants = 0, youngAdults = 0) => ({
    adults, youngAdults, children, infants,
  });
  assert.equal(MAX_PASSENGERS, 9);
  assert.equal(passengersValid(p(1)), true);
  assert.equal(passengersValid(p(0)), false);
  assert.equal(passengersValid(p(0, 0, 0, 1), true), true, 'a young adult alone on a UK route');
  assert.equal(passengersValid(p(0, 0, 0, 1), false), false, 'off a UK route young adults don\'t count');
  assert.equal(passengersValid(p(9)), true);
  assert.equal(passengersValid(p(9, 0, 1)), false, '10 with the infant');
  assert.equal(passengersValid(p(1, 0, 2)), false, 'two infants, one adult');
  assert.equal(passengersValid(p(2, 0, 2)), true);
  assert.equal(passengersValid(p(1, 7)), true);
  assert.equal(passengersValid(p(1, 8)), false);
  assert.equal(passengersValid(p(1, 3, 1)), true, 'TAP: 1 adult with 1 infant, at most 3 children');
  assert.equal(passengersValid(p(1, 4, 1)), false);
  // the steppers: what a + or - may do from a state
  assert.equal(canChange(p(1), 'adults', -1), false);
  assert.equal(canChange(p(1), 'infants', 1), true);
  assert.equal(canChange(p(1, 0, 1), 'infants', 1), false);
  assert.equal(canChange(p(1, 3, 1), 'children', 1), false);
  assert.equal(canChange(p(2, 0, 2), 'adults', -1), false, 'the infants need their adults');
  assert.equal(canChange(p(1), 'youngAdults', 1, false), false, 'no young adults off a UK route');
  assert.equal(canChange(p(1), 'youngAdults', 1, true), true);
});

// the spec (2.3) says 32 airports and lists 31 codes: the list as given
test('UK routes: the airports TAP offers young adults on (the spec\'s list)', () => {
  assert.equal(UK_AIRPORTS.size, 31);
  assert.equal(isUkRoute([{ origin: 'LIS', destination: 'LHR' }]), true);
  assert.equal(isUkRoute([{ origin: 'LON', destination: 'LIS' }]), true);
  assert.equal(isUkRoute([{ origin: 'LIS', destination: 'OPO' }, { origin: 'OPO', destination: 'MAN' }]), true);
  assert.equal(isUkRoute([{ origin: 'LIS', destination: 'DUB' }]), false);
});

const SHEET = {
  ':type': 'sheet',
  data: [
    {
      code: 'LIS', city: 'LIS', cityName: 'Lisboa', airportName: 'Humberto Delgado', country: 'PT', countryName: 'Portugal', tapRoute: 'true', railway: 'false',
    },
    {
      code: 'OPO', city: 'OPO', cityName: 'Porto', airportName: 'Porto', country: 'PT', countryName: 'Portugal', tapRoute: 'true', railway: 'false',
    },
    {
      code: 'PAR', city: 'PAR', cityName: 'Paris', airportName: 'todos os aeroportos', country: 'FR', countryName: 'França', tapRoute: 'true', railway: 'false',
    },
    {
      code: 'ORY', city: 'PAR', cityName: 'Paris', airportName: 'Orly', country: 'FR', countryName: 'França', tapRoute: 'true', railway: 'false',
    },
    {
      code: 'FAO', city: 'FAO', cityName: 'Faro', airportName: 'Faro', country: 'PT', countryName: 'Portugal', tapRoute: 'true', railway: 'false',
    },
    {
      code: 'GRU', city: 'SAO', cityName: 'São Paulo', airportName: 'Guarulhos', country: 'BR', countryName: 'Brasil', tapRoute: 'true', railway: 'false',
    },
    {
      code: 'ZYR', city: 'BRU', cityName: 'Bruxelas', airportName: 'Estação Midi', country: 'BE', countryName: 'Bélgica', tapRoute: '', railway: 'true',
    },
  ],
};

test('the airport sheet: rows to airports (codes upper case, the flags as booleans), empty rows left out', () => {
  const list = airportsFromSheet({ ...SHEET, data: [...SHEET.data, { code: '', cityName: 'x' }] });
  assert.equal(list.length, 7);
  assert.deepEqual(list[0], {
    code: 'LIS', city: 'LIS', cityName: 'Lisboa', airportName: 'Humberto Delgado', country: 'PT', countryName: 'Portugal', tapRoute: true, railway: false,
  });
  assert.equal(list[6].railway, true);
  assert.deepEqual(airportsFromSheet({ data: [{ code: 'lis', cityName: 'Lisboa' }] })[0].code, 'LIS');
  assert.deepEqual(airportsFromSheet(null), []);
  // a DA workbook (several sheets): its "data" sheet
  assert.equal(airportsFromSheet({ ':type': 'multi-sheet', data: { data: SHEET.data } }).length, 7);
});

// TAP's rules in its order, the first that matches gives the score
test('TAP\'s matching: its scores, accents folded, highest first, ties by city name, at most 30; empty: the first 30', () => {
  const list = airportsFromSheet(SHEET);
  const lis = list[0];
  assert.equal(fold('São Paulo'), 'sao paulo');
  assert.equal(scoreAirport(lis, 'Lisboa, Portugal'), 1);
  assert.equal(scoreAirport(lis, 'humberto delgado'), 0.92);
  assert.equal(scoreAirport(lis, 'lisboa'), 0.8);
  assert.equal(scoreAirport(lis, 'lis'), 0.79);
  assert.equal(scoreAirport(lis, 'portugal'), 0.72);
  assert.equal(scoreAirport(lis, 'pt'), 0.71);
  assert.equal(scoreAirport(list[5], 'paulo'), 0.8, 'a whole word of the city name');
  assert.equal(scoreAirport(lis, 'delgado'), 0.75, 'a whole word of the airport name');
  assert.equal(scoreAirport(lis, 'lisb'), 0.7, 'the city starts with the term');
  assert.equal(scoreAirport(lis, 'portu'), 0.5, 'the country starts with the term');
  assert.equal(scoreAirport(lis, 'tugal'), 0.68, '"city, country" ends with it, checked first');
  assert.equal(scoreAirport(lis, 'rtug'), 0.1, 'the country contains the term');
  assert.equal(scoreAirport(lis, 'xyz'), 0);
  assert.equal(scoreAirport(list[5], 'sao'), 0.8, 'accents folded: São');
  assert.deepEqual(matchAirports(list, 'paris').map((a) => a.code), ['PAR', 'ORY'], 'a tie (city name): the sheet\'s order');
  assert.deepEqual(matchAirports(list, 'portugal').map((a) => a.code), ['FAO', 'LIS', 'OPO'], 'equal scores by city name');
  assert.deepEqual(matchAirports(list, 'opo').map((a) => a.code), ['OPO']);
  assert.deepEqual(matchAirports(list, '').map((a) => a.code), list.map((a) => a.code), 'empty: the list as it is');
  const many = Array.from({ length: 40 }, (_, i) => ({ ...lis, code: `A${String(i).padStart(2, '0')}` }));
  assert.equal(matchAirports(many, '').length, 30);
  assert.equal(matchAirports(many, 'lisboa').length, 30);
});

test('texts: the field "City, Country", the list "City, Airport" with the country', () => {
  const [lis, , par] = airportsFromSheet(SHEET);
  assert.equal(fieldText(lis), 'Lisboa, Portugal');
  assert.deepEqual(optionText(par), { name: 'Paris, todos os aeroportos', country: 'França' });
  assert.equal(fieldText({ code: 'LIS' }), 'LIS', 'before the sheet: the code');
  assert.equal(fieldText(null), '');
});
