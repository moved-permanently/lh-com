/* eslint-disable max-len, import/extensions */
/* The go-live switch (tools/reports/markets/go-live.md): tools/markets/locale-data.json `liveWaves`
   (rollout batches by number, ch by "ch") makes those pilot rows `live` in scripts/locale-table.js;
   with `liveWaves: []` the table is the same as before, byte for byte. A live row whose documents
   are the language version's (a market root) is migrated for the site (local links, the language
   switch, lh-edge serves it on every lh-com host), but not a root with documents of its own:
   LIVE_ROOTS (lh-edge's search data, the search tools) and the country dialog's list keep the four;
   the dialog adds the page's own country roots when the page is a live market root's. The
   language switch maps a live market root's page through its language version's row of the
   locale map. Synthetic tables (no wave is live yet).
   Run: node --max-old-space-size=512 --test test/go-live.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { buildTable, OUT } from '../tools/markets/build-locale-table.mjs';
import {
  LIVE_ROOTS, ownRoots, liveOwnRoots, dialogRoots, counterpartIn,
} from '../scripts/locale.js';

const read = (u) => JSON.parse(fs.readFileSync(new URL(u, import.meta.url), 'utf8'));
const ROOTS = read('../tools/source-export/feeds/sitemaps/roots.json').roots;
const DATA = read('../tools/markets/locale-data.json');

test('liveWaves []: the table as without the setting, every rollout row pilot; the committed table follows the setting', () => {
  assert.ok(Array.isArray(DATA.liveWaves), 'the setting is there');
  const none = buildTable(ROOTS, { ...DATA, liveWaves: [] });
  const without = { ...DATA };
  delete without.liveWaves;
  assert.deepEqual(none, buildTable(ROOTS, without));
  assert.equal(Object.values(none.rows).filter((r) => r.status === 'live').length, 4);
  // ae/en (wave 1) in scripts/locale-table.js as the committed setting says
  const ae = DATA.liveWaves.includes(1) ? 'live' : 'pilot';
  assert.ok(fs.readFileSync(OUT, 'utf8').includes(`'ae/en': { country: 'ae', lang: 'en', hreflang: 'en-AE', status: '${ae}'`));
});

test('liveWaves [1]: batch 1\'s rows live, batch 2\'s and ch pilot; ["ch"]: ch\'s rows; an unknown wave is an error', () => {
  const one = buildTable(ROOTS, { ...DATA, liveWaves: [1] }).rows;
  const batch = (n) => Object.keys(DATA.roots).filter((k) => DATA.roots[k].batch === n);
  assert.equal(batch(1).length, 19);
  batch(1).forEach((k) => assert.equal(one[k].status, 'live', k));
  batch(2).forEach((k) => assert.equal(one[k].status, 'pilot', k));
  assert.equal(one['ch/en'].status, 'pilot');
  assert.equal(one['ae/en'].documents, 'language', 'still answered from the language version');
  const ch = buildTable(ROOTS, { ...DATA, liveWaves: ['ch'] }).rows;
  assert.equal(ch['ch/en'].status, 'live');
  assert.equal(ch['ch/de'].status, 'live');
  assert.equal(ch['ae/en'].status, 'pilot');
  assert.throws(() => buildTable(ROOTS, { ...DATA, liveWaves: [99] }), /wave 99: no pilot rows/);
});

// a table with wave 1's ae live (and ch pilot), as the locale table after `liveWaves: [1]`
const row = (country, lang, status, documents) => ({
  country, lang, status, documents, name: `${country} ${lang}`,
});
const TABLE = {
  'de/en': row('de', 'en', 'live', 'own'),
  'de/de': row('de', 'de', 'live', 'own'),
  'at/de': row('at', 'de', 'live', 'own'),
  'gb/en': row('gb', 'en', 'live', 'own'),
  'ae/en': row('ae', 'en', 'live', 'language'),
  'ae/de': row('ae', 'de', 'live', 'language'),
  'ch/en': row('ch', 'en', 'pilot', 'language'),
};
const LIVE = Object.fromEntries(Object.entries(TABLE).filter(([, r]) => r.status === 'live'));
const VERSIONS = { en: 'de/en', de: 'de/de' };

test('LIVE_ROOTS: the live roots with documents of their own (today the four); a live market root is not one', () => {
  assert.deepEqual(LIVE_ROOTS, ['de/en', 'de/de', 'at/de', 'gb/en']);
  assert.deepEqual(liveOwnRoots(TABLE), ['de/en', 'de/de', 'at/de', 'gb/en']);
});

test('the country dialog: the four own roots; on a live market root\'s page its country\'s live roots too', () => {
  assert.deepEqual(ownRoots(() => ''), LIVE_ROOTS, 'lh-com today: the four, as before');
  assert.deepEqual(dialogRoots(LIVE, 'de/en'), ['de/en', 'de/de', 'at/de', 'gb/en']);
  assert.deepEqual(dialogRoots(LIVE, 'ae/en'), ['de/en', 'de/de', 'at/de', 'gb/en', 'ae/de', 'ae/en']);
  assert.deepEqual(dialogRoots(LIVE, 'ch/en'), ['de/en', 'de/de', 'at/de', 'gb/en'], 'a pilot root: as before');
});

const MAP = [{
  'de/en': '/de/en/baggage', 'de/de': '/de/de/gepaeck', 'at/de': '/at/de/gepaeck', 'gb/en': '/gb/en/baggage',
}];
test('the language switch: a live market root\'s page through its language version\'s row; pilot roots as before', () => {
  const to = (path, key) => counterpartIn(MAP, path, key, LIVE, VERSIONS);
  assert.equal(to('/de/en/baggage', 'de/de'), '/de/de/gepaeck', 'the four: the map as before');
  assert.equal(to('/de/en/baggage', 'ae/de'), '/ae/de/gepaeck', 'into a live market root: its language version\'s path');
  assert.equal(to('/ae/en/baggage', 'ae/de'), '/ae/de/gepaeck', 'within a live market country');
  assert.equal(to('/ae/en/baggage', 'gb/en'), '/gb/en/baggage', 'from a live market root');
  assert.equal(to('/ae/en/no-such-page', 'ae/de'), '/ae/de/homepage');
  assert.equal(to('/ch/en/baggage', 'de/de'), '/de/de/homepage', 'ch is pilot here: as today');
});
