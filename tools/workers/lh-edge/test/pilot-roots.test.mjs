/* eslint-disable max-len */
/* The pilot roots a host shows (PILOT_COUNTRIES_BY_HOST) by country or by root: the main host
   names ch/en and ch/de, so a French row of ch (ch/fr, wave 11) stays off it while lufthansa-edge
   (PILOT_HOSTS) serves every pilot row; a country entry ("ch") is all of its rows as before. The
   front door's countries are the entries' countries. A language version without an index yet (fr/fr
   before its publish: lean source and full index both 404) is an empty lean source, so the market
   model stays lean.
   Run: node --import ./test/cloudflare-workers-shim.mjs --test test/pilot-roots.test.mjs */
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { servedMarketRoots, resetMarketCache } from '../src/markets.js';
import { frontDoorCountries } from '../src/front-door.js';
import { leanSource, resetLeanCache } from '../src/market-lean.js';
import { tablesOf, LH_TABLES } from '../src/sites.js';

const MAIN = 'lufthansa.turnsthe.page';
const row = (country, lang, status, documents, batch) => ({
  country, lang, hreflang: `${lang}-${country.toUpperCase()}`, status, documents, batch,
});
const TABLE = tablesOf({
  'de/en': row('de', 'en', 'live', 'own'),
  'de/de': row('de', 'de', 'live', 'own'),
  'fr/fr': row('fr', 'fr', 'pilot', 'own', 11),
  'ch/en': row('ch', 'en', 'pilot', 'language'),
  'ch/de': row('ch', 'de', 'pilot', 'language'),
  'ch/fr': row('ch', 'fr', 'pilot', 'language', 11),
  'be/fr': row('be', 'fr', 'pilot', 'language', 11),
}, { en: 'de/en', de: 'de/de', fr: 'fr/fr' });
const env = (pilot) => ({
  ORIGIN: 'main--lh-com--moved-permanently.aem.live', PILOT_HOSTS: 'lufthansa-edge.turnsthe.page', PILOT_COUNTRIES_BY_HOST: pilot,
});
const served = (host, pilot, t = TABLE) => servedMarketRoots(new Request(`https://${host}/`), env(pilot), t).sort();

beforeEach(() => {
  resetMarketCache();
  resetLeanCache();
});

test('PILOT_COUNTRIES_BY_HOST by root: the main host keeps ch/en and ch/de, ch/fr off it; lufthansa-edge every pilot row', () => {
  assert.deepEqual(served(MAIN, `${MAIN}=ch/en|ch/de`), ['ch/de', 'ch/en']);
  assert.deepEqual(served(MAIN, `${MAIN}=ch`), ['ch/de', 'ch/en', 'ch/fr'], 'a country entry: all of its rows');
  assert.deepEqual(served(MAIN, `${MAIN}=ch/en|be`), ['be/fr', 'ch/en'], 'roots and countries mixed');
  assert.deepEqual(served('lufthansa-edge.turnsthe.page', `${MAIN}=ch/en|ch/de`), ['be/fr', 'ch/de', 'ch/en', 'ch/fr']);
  assert.deepEqual(served('other.example', `${MAIN}=ch/en|ch/de`), []);
});

test('wrangler.toml\'s value: the main host serves exactly ch/en and ch/de of the real table (as with "ch" before)', () => {
  const vars = fs.readFileSync(new URL('../wrangler.toml', import.meta.url), 'utf8');
  const value = vars.match(/^PILOT_COUNTRIES_BY_HOST = "([^"]*)"/m)[1];
  assert.equal(value, `${MAIN}=ch/en|ch/de`);
  assert.deepEqual(served(MAIN, value, LH_TABLES), ['ch/de', 'ch/en']);
  assert.deepEqual(served('lufthansa-cn.turnsthe.page', value, LH_TABLES), []);
});

test('the front door\'s countries from root entries: their countries', () => {
  const live = { 'de/en': row('de', 'en', 'live', 'own'), 'ch/fr': row('ch', 'fr', 'pilot', 'language') };
  assert.deepEqual([...frontDoorCountries(MAIN, env(`${MAIN}=ch/en|ch/de`), live)], ['ch']);
  assert.deepEqual([...frontDoorCountries(MAIN, env(`${MAIN}=ch`), live)], ['ch']);
  assert.deepEqual([...frontDoorCountries('other.example', env(`${MAIN}=ch/en|ch/de`), live)], []);
});

test('a language version without an index yet (lean source and full index 404): an empty lean source, not the full model\'s fallback', async () => {
  const seen = [];
  globalThis.fetch = async (input) => {
    const u = new URL(input instanceof Request ? input.url : input);
    seen.push(u.pathname);
    return new Response('', { status: 404 });
  };
  const request = new Request('https://lufthansa-edge.turnsthe.page/be/fr/homepage');
  const src = await leanSource(request, env(''), '/market-model/fr-fr.json', '/fr/fr/search-index.json');
  assert.ok(src, 'a source');
  assert.equal(src.total, 0);
  assert.equal(src.has('/fr/fr/homepage'), false);
  assert.equal(src.row('/fr/fr/homepage'), null);
  // an origin error is no evidence: no source (the full model reads the indexes as before)
  resetLeanCache();
  globalThis.fetch = async () => new Response('', { status: 503 });
  assert.equal(await leanSource(request, env(''), '/market-model/fr-fr.json', '/fr/fr/search-index.json'), null);
  // one of the two there: no source (a lean source still filling, or a missing definition)
  resetLeanCache();
  globalThis.fetch = async (input) => {
    const u = new URL(input instanceof Request ? input.url : input);
    return u.pathname === '/fr/fr/search-index.json' ? Response.json({
      total: 3, offset: 1000000, limit: 1, data: [],
    }) : new Response('', { status: 404 });
  };
  assert.equal(await leanSource(request, env(''), '/market-model/fr-fr.json', '/fr/fr/search-index.json'), null);
});
