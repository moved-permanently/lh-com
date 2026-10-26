/* Flight status: fleet links of aircraft types (AMS rest A3). Run: node --test test/ */
import test from 'node:test';
import assert from 'node:assert/strict';
import { aircraftLink } from '../blocks/flight-status/flight-status.js';

const FLEET = [
  { path: '/de/en/359', 'aircraft-code': '359' },
  { path: '/de/en/32n', 'aircraft-code': '32n' },
  { path: '/de/en/boeing787', 'aircraft-code': '789' },
  { path: '/de/de/359', 'aircraft-code': '359' },
];

test('aircraft types of the locale\'s fleet link to their fleet page, others do not', () => {
  assert.equal(aircraftLink('359', FLEET, '/de/en'), '/de/en/discover-lufthansa/lufthansa-fleet/359');
  assert.equal(aircraftLink('32N', FLEET, '/de/en'), '/de/en/discover-lufthansa/lufthansa-fleet/32n');
  assert.equal(aircraftLink(' 789 ', FLEET, '/de/en'), '/de/en/discover-lufthansa/lufthansa-fleet/789');
  assert.equal(aircraftLink('388', FLEET, '/de/en'), null);
  assert.equal(aircraftLink('32N', FLEET, '/de/de'), null, 'only the locale\'s own fleet pages');
  assert.equal(aircraftLink('', FLEET, '/de/en'), null);
  assert.equal(aircraftLink('359', [], '/gb/en'), null);
});
