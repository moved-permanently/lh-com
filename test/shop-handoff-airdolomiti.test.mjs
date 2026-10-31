/* eslint-disable max-len */
/* Air Dolomiti's booking handoff (scripts/shop-handoff.js, scripts/brands.js airdolomiti.booking):
   a POST form to its Amadeus engine digital.airdolomiti.it (office EN01) with the fields
   www.airdolomiti.it's widget posts (captured 2026-10-31 on .it, .eu and .de, the post blocked:
   lang it-IT / en-GB / de-DE, travellers ADT, CHD, INF). lufthansa.com, Discover, ITA and
   Austrian build their handoff byte for byte as before (the code of HEAD at 052ba38).
   Run: node --max-old-space-size=512 --test test/shop-handoff-airdolomiti.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { buildShopHandoff } from '../scripts/shop-handoff.js';
import { BRANDS } from '../scripts/brands.js';

// the handoff before this change (its one import, the locale table, from the working tree)
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'handoff-'));
const old = execFileSync('git', ['show', '052ba38:scripts/shop-handoff.js'], { encoding: 'utf8' })
  .replace("from './locale-table.js'", `from '${path.resolve('scripts/locale-table.js')}'`);
fs.writeFileSync(path.join(dir, 'shop-handoff.mjs'), old);
const { buildShopHandoff: before } = await import(path.join(dir, 'shop-handoff.mjs'));

const query = {
  tripType: 'RETURN', origin: 'VRN', destination: 'MUC', departureDate: '2026-11-20', returnDate: '2026-11-27', adults: 1, children: 1, infants: 1, cabin: 'E', consentGroups: [],
};

test('lufthansa.com, Discover, ITA and Austrian: the handoff as before, byte for byte', () => {
  [
    [{ key: 'de/en', country: 'de' }, '', null],
    [{ key: 'de/de', country: 'de' }, '', BRANDS.discover],
    [{ key: 'it/it', country: 'it' }, 'https://shop.ita-airways.com/booking/availability', BRANDS.ita],
    [{ key: 'at/de', country: 'at' }, '', BRANDS.austrian],
  ].forEach(([locale, shop, brand]) => {
    assert.deepEqual(buildShopHandoff({ ...query, children: 0, infants: 0 }, locale, shop, brand), before({ ...query, children: 0, infants: 0 }, locale, shop), locale.key);
  });
});

test('Air Dolomiti: the booking entry and airline EN', () => {
  assert.equal(BRANDS.airdolomiti.airline, 'EN');
  assert.deepEqual(BRANDS.airdolomiti.booking, {
    format: 'airdolomiti', url: 'https://digital.airdolomiti.it/booking', officeId: 'EN01', langs: { it: 'it-IT', en: 'en-GB', de: 'de-DE' },
  });
});

test('Air Dolomiti: the form www posts, per language', () => {
  const it = buildShopHandoff(query, { key: 'de/en', country: 'de', lang: 'it' }, '', BRANDS.airdolomiti);
  assert.equal(it.action, 'https://digital.airdolomiti.it/booking?lang=it-IT&collectSensitiveData=true');
  assert.deepEqual(Object.keys(it.fields), ['search', 'portalFacts']);
  assert.equal(it.fields.search, '{"commercialFareFamilies":["MIXED"],"itineraries":[{"departureDateTime":"2026-11-20","originLocationCode":"VRN","destinationLocationCode":"MUC"},{"departureDateTime":"2026-11-27","originLocationCode":"MUC","destinationLocationCode":"VRN"}],"travelers":[{"passengerTypeCode":"ADT"},{"passengerTypeCode":"CHD"},{"passengerTypeCode":"INF"}]}');
  assert.equal(it.fields.portalFacts, '[{"key":"officeId","value":"EN01"},{"key":"statistics_consent","value":"denied"},{"key":"marketing_consent","value":"denied"},{"key":"experience_consent","value":"denied"},{"key":"consent_id","value":""},{"key":"consent_date","value":""}]');
  const lang = (l) => new URL(buildShopHandoff(query, { key: 'de/en', country: 'de', lang: l }, '', BRANDS.airdolomiti).action).searchParams.get('lang');
  assert.deepEqual(['it', 'en', 'de', 'fr'].map(lang), ['it-IT', 'en-GB', 'de-DE', 'it-IT'], 'another language: Italian');
  const oneWay = JSON.parse(buildShopHandoff({
    ...query, tripType: 'ONEWAY', children: 0, infants: 0, adults: 2,
  }, { key: 'de/en', country: 'de', lang: 'en' }, '', BRANDS.airdolomiti).fields.search);
  assert.equal(oneWay.itineraries.length, 1);
  assert.deepEqual(oneWay.travelers, [{ passengerTypeCode: 'ADT' }, { passengerTypeCode: 'ADT' }]);
});

test('the action allowlist: shop.* hosts and digital.airdolomiti.it, https only; else Lufthansa\'s shop', () => {
  const locale = { key: 'de/en', country: 'de', lang: 'en' };
  assert.match(buildShopHandoff(query, locale, 'https://shop.ita-airways.com/booking/availability').action, /^https:\/\/shop\.ita-airways\.com\//);
  assert.match(buildShopHandoff(query, locale, 'https://digital.airdolomiti.it/booking').action, /^https:\/\/digital\.airdolomiti\.it\/booking\?/);
  assert.match(buildShopHandoff(query, locale, 'https://evil.example.com/booking').action, /^https:\/\/shop\.lufthansa\.com\//);
  assert.match(buildShopHandoff(query, locale, 'http://digital.airdolomiti.it/booking').action, /^https:\/\/shop\.lufthansa\.com\//);
  const odd = { ...BRANDS.airdolomiti, booking: { ...BRANDS.airdolomiti.booking, url: 'https://evil.example.com/booking' } };
  assert.match(buildShopHandoff(query, locale, '', odd).action, /^https:\/\/digital\.airdolomiti\.it\/booking\?/, 'a booking URL off the list: the engine\'s own');
});
