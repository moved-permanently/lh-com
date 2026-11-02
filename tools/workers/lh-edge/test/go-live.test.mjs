/* eslint-disable max-len, import/extensions */
/* The go-live switch in lh-edge (tools/reports/markets/go-live.md): a wave's market roots become
   live rows of the locale table, and the main host's front door sends their paths to lh-edge's
   market route: the countries of live market roots and of the host's PILOT_COUNTRIES_BY_HOST
   (today ch only: the same paths as the fixed ch rule before). lh-edge's search keeps the roots with
   documents of their own (a live market root searches its language version's data, as a pilot
   root on lufthansa-edge does); the llms list names a live market root once; the language-switch
   endpoint maps a live market root's page through its language version's row.
   Run: node --import ./test/cloudflare-workers-shim.mjs --test test/go-live.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import { frontDoorTarget, frontDoorCountries } from '../src/front-door.js';
import { searchLocale } from '../src/search.js';
import { localesOf } from '../src/llms.js';
import { switchTarget } from '../src/changelocale.js';

const MAIN = 'lufthansa.turnsthe.page';
const ENV = {
  PILOT_COUNTRIES_BY_HOST: `${MAIN}=ch`, FRONT_DOOR_HOSTS: MAIN,
};
const row = (country, lang, status, documents) => ({
  country, lang, status, documents,
});
const TODAY = {
  'de/en': row('de', 'en', 'live', 'own'), 'de/de': row('de', 'de', 'live', 'own'), 'ch/en': row('ch', 'en', 'pilot', 'language'), 'ae/en': row('ae', 'en', 'pilot', 'language'),
};
const WAVE1 = { ...TODAY, 'ae/en': row('ae', 'en', 'live', 'language'), 'ae/de': row('ae', 'de', 'live', 'language') };

test('front door countries: today ch (the host\'s pilot countries); a wave adds its live market roots\' countries', () => {
  assert.deepEqual([...frontDoorCountries(MAIN, ENV, TODAY)], ['ch']);
  assert.deepEqual([...frontDoorCountries(MAIN, ENV)].sort(), ['ch'], 'the real table: no live market root yet');
  assert.deepEqual([...frontDoorCountries(MAIN, ENV, WAVE1)].sort(), ['ae', 'ch']);
  assert.deepEqual([...frontDoorCountries('other.example', ENV, WAVE1)], ['ae'], 'another host: live ones only');
});

test('front door targets with today\'s countries: exactly the fixed ch rule as before', () => {
  const ch = new Set(['ch']);
  [['/ch/en/baggage', 'edge'], ['/ch/de/gepaeck', 'edge'], ['/ch/fr/homepage', 'edge'], ['/sitemap/sitemap_lh_ch_en.xml', 'edge'], ['/sitemap/sitemap_lh.xml', 'edge'],
    ['/ae/en/baggage', 'origin'], ['/sitemap/sitemap_lh_ae_en.xml', 'origin'], ['/de/en/baggage', 'origin'], ['/us/en/ccpa', 'origin'], ['/ch', 'edge'], ['/ae', 'edge'], ['/ae/en', 'edge'],
    ['/sitemap/sitemap_lh_ae_en.xml.gz', 'edge'], ['/migration-status', 'gate']].forEach(([p, t]) => assert.equal(frontDoorTarget(p, ch), t, p));
});

test('front door targets with a wave live: its countries\' pages and sitemap files to lh-edge', () => {
  const on = new Set(['ch', 'ae']);
  [['/ae/en/baggage', 'edge'], ['/ae/de/gepaeck', 'edge'], ['/sitemap/sitemap_lh_ae_en.xml', 'edge'], ['/ch/en/baggage', 'edge'],
    ['/us/en/ccpa', 'origin'], ['/de/en/baggage', 'origin']].forEach(([p, t]) => assert.equal(frontDoorTarget(p, on), t, p));
});

test('search: a live market root searches its language version (the roots with own documents)', () => {
  assert.equal(searchLocale('AE', 'en'), 'de/en', 'today');
  assert.equal(searchLocale('AE', 'en', ['de/en', 'de/de', 'at/de', 'gb/en']), 'de/en');
  assert.equal(searchLocale('AT', 'de', ['de/en', 'de/de', 'at/de', 'gb/en']), 'at/de');
});

test('llms: a live market root listed once', () => {
  const locales = { 'de/en': {}, 'ae/en': {}, 'ae/de': {} };
  assert.deepEqual(localesOf('/ae/llms.txt', ['ae/en', 'ae/de'], locales), ['ae/de', 'ae/en']);
  assert.deepEqual(localesOf('/ae/en/llms.txt', ['ae/en'], locales), ['ae/en']);
});

test('the language switch endpoint: a live market root\'s counterpart through its language version\'s row', () => {
  const rows = [{ 'de/en': '/de/en/baggage', 'de/de': '/de/de/gepaeck' }];
  const live = { 'de/en': row('de', 'en', 'live', 'own'), 'de/de': row('de', 'de', 'live', 'own'), 'ae/de': row('ae', 'de', 'live', 'language') };
  assert.equal(switchTarget('/de/en/baggage', 'de', 'de', rows), '/de/de/gepaeck', 'as before');
  assert.equal(switchTarget('/de/en/baggage', 'ae', 'de', rows, live), '/ae/de/gepaeck');
  assert.match(switchTarget('/de/en/baggage', 'ae', 'de', rows), /^https:\/\/www\.lufthansa\.com\/ae\/de\/homepage$/, 'today: ae is not live, www');
});
