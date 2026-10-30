/* eslint-disable max-len -- assertions */
/* The shop handoff (scripts/shop-handoff.js): Lufthansa's shop unless the block names its own. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { buildShopHandoff } from '../scripts/shop-handoff.js';

test('shop handoff: Lufthansa by default, a brand site\'s own shop from the block row', () => {
  const locale = { key: 'it/en', country: 'it' };
  const query = { departureDate: '2026-12-24', origin: 'ROM', destination: 'JFK' };
  assert.match(buildShopHandoff(query, locale).action, /^https:\/\/shop\.lufthansa\.com\/booking\/availability\?/);
  assert.match(buildShopHandoff(query, locale, 'https://shop.ita-airways.com/booking/availability').action, /^https:\/\/shop\.ita-airways\.com\/booking\/availability\?lang=/);
  assert.match(buildShopHandoff(query, locale, 'http://shop.example.com/booking').action, /^https:\/\/shop\.lufthansa\.com\//, 'only https shop hosts');
});
