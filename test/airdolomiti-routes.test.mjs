/* eslint-disable import/extensions */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { routeAirports } from '../tools/importer/airdolomiti-import.mjs';

test('a route page\'s origin and destination from its slug, in its language', () => {
  assert.deepEqual(routeAirports('https://www.airdolomiti.it/tratte/volo-verona-monaco-di-baviera'), { origin: 'VRN', destination: 'MUC' });
  assert.deepEqual(routeAirports('https://www.airdolomiti.it/tratte/volo-da-firenze-a-francoforte'), { origin: 'FLR', destination: 'FRA' });
  assert.deepEqual(routeAirports('https://www.airdolomiti.eu/routes/flight-from-munich-to-brindisi'), { origin: 'MUC', destination: 'BDS' });
  assert.deepEqual(routeAirports('https://www.airdolomiti.eu/routes/flight-from-london-city-to-frankfurt'), { origin: 'LCY', destination: 'FRA' });
  assert.deepEqual(routeAirports('https://www.airdolomiti.de/routen/flug-von-genf-nach-muenchen'), { origin: 'GVA', destination: 'MUC' });
});

test('German names the airport list does not have (Krakau, Triest)', () => {
  assert.deepEqual(routeAirports('https://www.airdolomiti.de/routen/flug-von-muenchen-nach-krakau'), { origin: 'MUC', destination: 'KRK' });
  assert.deepEqual(routeAirports('https://www.airdolomiti.de/routen/flug-von-frankfurt-nach-triest'), { origin: 'FRA', destination: 'TRS' });
});

test('an end outside Air Dolomiti\'s airports is left out, the other keeps its side', () => {
  assert.deepEqual(routeAirports('https://www.airdolomiti.it/tratte/amsterdam-francoforte'), { origin: null, destination: 'FRA' });
  assert.deepEqual(routeAirports('https://www.airdolomiti.eu/routes/flight-from-munich-to-palermo'), { origin: 'MUC', destination: null });
  assert.deepEqual(routeAirports('https://www.airdolomiti.de/routen/flug-von-dresden-nach-frankfurt'), { origin: null, destination: 'FRA' });
});
