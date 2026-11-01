/* eslint-disable max-len, import/extensions */
/* Air Dolomiti's language counterparts (tools/importer/airdolomiti-alternates.mjs): www's hreflang
   links (it is x-default, en and de alternates; some hrefs a bare host) become the page's
   metadata rows Alternate it | en | de with our paths, only for counterparts we import and that
   link back (both directions); none for the page's own language.
   Run: node --max-old-space-size=512 --test test/airdolomiti-alternates.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import { hreflangOf, alternateRows } from '../tools/importer/airdolomiti-alternates.mjs';

const head = (links) => `<html><head><title>x</title>${links.map(([hl, href, rel = 'alternate']) => `<link href="${href}" hreflang="${hl}" rel="${rel}">`).join('')}</head><body>…</body></html>`;
const HEADS = {
  'https://www.airdolomiti.it/orario-voli': head([['it', 'https://www.airdolomiti.it/orario-voli', 'x-default'], ['en', 'https://www.airdolomiti.eu/flight-timetables'], ['de', 'https://www.airdolomiti.de/flugplan']]),
  'https://www.airdolomiti.eu/flight-timetables': head([['it', 'https://www.airdolomiti.it/orario-voli', 'x-default'], ['en', 'https://www.airdolomiti.eu/flight-timetables'], ['de', 'https://www.airdolomiti.de/flugplan']]),
  'https://www.airdolomiti.de/flugplan': head([['it', 'https://www.airdolomiti.it/orario-voli', 'x-default'], ['en', 'https://www.airdolomiti.eu/flight-timetables'], ['de', 'https://www.airdolomiti.de/flugplan']]),
  // the homepages: bare hosts
  'https://www.airdolomiti.it': head([['it', 'www.airdolomiti.it', 'x-default'], ['en', 'www.airdolomiti.eu'], ['de', 'www.airdolomiti.de']]),
  'https://www.airdolomiti.eu': head([['it', 'www.airdolomiti.it', 'x-default'], ['en', 'www.airdolomiti.eu']]),
  // a one-way link: the English page names an Italian one that names another English page
  'https://www.airdolomiti.eu/one-way': head([['it', 'https://www.airdolomiti.it/solo-andata', 'x-default']]),
  'https://www.airdolomiti.it/solo-andata': head([['en', 'https://www.airdolomiti.eu/elsewhere']]),
  // a counterpart we do not import
  'https://www.airdolomiti.de/nur-de': head([['it', 'https://www.airdolomiti.it/out-of-scope', 'x-default']]),
};
const PATHS = {
  'www.airdolomiti.it/orario-voli': '/orario-voli',
  'www.airdolomiti.eu/flight-timetables': '/en/flight-timetables',
  'www.airdolomiti.de/flugplan': '/de/flugplan',
  'www.airdolomiti.it': '/',
  'www.airdolomiti.eu': '/en',
  'www.airdolomiti.de': '/de',
  'www.airdolomiti.eu/one-way': '/en/one-way',
  'www.airdolomiti.it/solo-andata': '/solo-andata',
  'www.airdolomiti.de/nur-de': '/de/nur-de',
};
const site = { headOf: (url) => HEADS[url] || '', paths: PATHS, exists: () => true };

test('hreflang links: the language and the href (bare hosts as https URLs)', () => {
  assert.deepEqual(hreflangOf(HEADS['https://www.airdolomiti.it/orario-voli']), { it: 'https://www.airdolomiti.it/orario-voli', en: 'https://www.airdolomiti.eu/flight-timetables', de: 'https://www.airdolomiti.de/flugplan' });
  assert.deepEqual(hreflangOf(HEADS['https://www.airdolomiti.it']), { it: 'https://www.airdolomiti.it', en: 'https://www.airdolomiti.eu', de: 'https://www.airdolomiti.de' });
  assert.deepEqual(hreflangOf('<html><head></head><body><link hreflang="en" href="https://www.airdolomiti.eu/x"></body></html>'), {}, 'the head only');
});

test('the other languages\' counterparts as our paths, each linking back', () => {
  assert.deepEqual(alternateRows('https://www.airdolomiti.it/orario-voli', site), [['Alternate en', '/en/flight-timetables'], ['Alternate de', '/de/flugplan']]);
  assert.deepEqual(alternateRows('https://www.airdolomiti.eu/flight-timetables', site), [['Alternate it', '/orario-voli'], ['Alternate de', '/de/flugplan']]);
  assert.deepEqual(alternateRows('https://www.airdolomiti.it', site), [['Alternate en', '/en']], 'the German homepage names no counterpart back: no German row');
});

test('no rows: a one-way link, a counterpart out of scope or not imported, no hreflang', () => {
  assert.deepEqual(alternateRows('https://www.airdolomiti.eu/one-way', site), []);
  assert.deepEqual(alternateRows('https://www.airdolomiti.de/nur-de', site), []);
  assert.deepEqual(alternateRows('https://www.airdolomiti.it/orario-voli', { ...site, exists: (eds) => eds !== '/de/flugplan' }), [['Alternate en', '/en/flight-timetables']]);
  assert.deepEqual(alternateRows('https://www.airdolomiti.it/unknown', site), []);
});
