/* eslint-disable max-len, import/extensions -- tests */
/* tools/importer/tap-airports.mjs: TAP's airport sheets for the booking box (booking-spec.md 5.3):
   one originSearch per root with its language and market, the answer's entries as the sheet's
   rows (code, city, cityName, airportName, country, countryName, tapRoute, railway), anything
   but JSON refused. Run: timeout 60 node --test test/tap-airports.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ROOTS, requestBody, rowOf, rowsOf, sheetOf, parseAnswer, COLUMNS, PAUSE_MS, ENDPOINT,
} from '../tools/importer/tap-airports.mjs';

// the spec's example entry (booking-spec.md 5.3), as originSearch gives it for pt-pt
const PAR = {
  city: 'PAR', state: null, airport: 'PAR', country: 'FR', area: null, airlineId: [], alias: null, interline: true, firstOperationDate: null, lastOperationDate: null, tapRoute: true, starAllianceRoute: true, weakFlight: null, commercialRoute: true, resident: null, student: null, milesAndGo: null, isRailway: false, cityName: 'Paris', airportName: 'todos os aeroportos', countryName: 'França',
};
const OPO = {
  ...PAR, city: 'OPO', airport: 'OPO', country: 'PT', cityName: 'Porto', airportName: 'Francisco Sá Carneiro', countryName: 'Portugal',
};
const RAIL = {
  ...PAR, city: 'ZFJ', airport: 'XHN', country: 'BE', tapRoute: false, isRailway: true, cityName: 'Bruxelas', airportName: 'Estação Bruxelas-Sul', countryName: 'Bélgica',
};

test('the seven live roots, each with its language and market', () => {
  assert.deepEqual(Object.keys(ROOTS), ['pt-pt', 'en-pt', 'es-es', 'fr-fr', 'de-de', 'it-it', 'pl-pl', 'pt-br']);
  assert.deepEqual(ROOTS['pt-br'], { language: 'pt', market: 'BR' }, 'pt-br: Portuguese, market BR');
  assert.deepEqual(ROOTS['en-pt'], { language: 'en', market: 'PT' });
  assert.deepEqual(ROOTS['pl-pl'], { language: 'pl', market: 'PL' });
});

test('the request: originSearch, the spec\'s body with the root\'s language and market, 10 s or more apart', () => {
  assert.equal(ENDPOINT, 'https://www.flytap.com/api/flight?functionName=originSearch');
  assert.equal(JSON.stringify(requestBody('pt-pt')), '{"airlineIds":["TP"],"language":"pt","latitude":38.7071,"longitude":-9.13549,"market":"PT","payWithMiles":false,"tripType":"R"}');
  assert.equal(requestBody('de-de').language, 'de');
  assert.equal(requestBody('de-de').market, 'DE');
  assert.equal(requestBody('pt-br').market, 'BR');
  assert.throws(() => requestBody('pt-xx'), /pt-xx/);
  assert.ok(PAUSE_MS >= 10000);
});

test('an entry as a row: the eight columns, code from the airport, the flags as true/false', () => {
  assert.deepEqual(COLUMNS, ['code', 'city', 'cityName', 'airportName', 'country', 'countryName', 'tapRoute', 'railway']);
  assert.deepEqual(rowOf(PAR), {
    code: 'PAR', city: 'PAR', cityName: 'Paris', airportName: 'todos os aeroportos', country: 'FR', countryName: 'França', tapRoute: 'true', railway: 'false',
  });
  assert.deepEqual(rowOf(RAIL), {
    code: 'XHN', city: 'ZFJ', cityName: 'Bruxelas', airportName: 'Estação Bruxelas-Sul', country: 'BE', countryName: 'Bélgica', tapRoute: 'false', railway: 'true',
  });
  assert.equal(rowOf({ airport: 'LIS' }).cityName, '', 'missing names are empty, not "undefined"');
});

test('the rows in TAP\'s order, every entry kept; an entry without an airport code is left out', () => {
  const rows = rowsOf([PAR, OPO, RAIL, { city: 'X' }]);
  assert.deepEqual(rows.map((r) => r.code), ['PAR', 'OPO', 'XHN']);
});

test('the sheet: DA\'s single-sheet JSON with every row', () => {
  const s = sheetOf(rowsOf([PAR, OPO]));
  assert.equal(s[':type'], 'sheet');
  assert.equal(s[':sheetname'], 'data');
  assert.equal(s.total, 2);
  assert.equal(s.limit, 2);
  assert.equal(s.offset, 0);
  assert.deepEqual(Object.keys(s.data[0]), COLUMNS);
});

test('the answer: JSON only (an array, or an object holding one); anything else stops', () => {
  assert.equal(parseAnswer({ status: 200, contentType: 'application/json; charset=utf-8', body: JSON.stringify([PAR]) }).length, 1);
  assert.equal(parseAnswer({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [PAR, OPO] }) }).length, 2);
  assert.throws(() => parseAnswer({ status: 200, contentType: 'text/html', body: '<html>Just a moment…</html>' }), /not JSON/);
  assert.throws(() => parseAnswer({ status: 403, contentType: 'application/json', body: '{}' }), /403/);
  assert.throws(() => parseAnswer({ status: 200, contentType: 'application/json', body: '{"error":"x"}' }), /no airport list/);
  assert.throws(() => parseAnswer({ status: 200, contentType: 'application/json', body: 'not json' }), /not JSON/);
});
