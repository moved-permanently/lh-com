/* eslint-disable max-len */
/* The destination finder's links to a destination's page (blocks/destination-finder
   buildDestinationLink): on a brand site without its own destination page, the airline's www page
   (scripts/brands.js destinationPath: ITA /<root>/book-and-prepare/destination as its www,
   Discover and Austrian /<root>/book/destination, their offers grids' baseRedirectUrl);
   lufthansa.com and its market roots our own /<root>/book-and-manage/destination as before; an
   authored Destination page row first, as before.
   Run: node --max-old-space-size=512 --test test/finder-destination-links.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
window.hlx = { codeBasePath: '' };
window.location = {
  hostname: 'main--lh-com--moved-permanently.aem.page', pathname: '/', search: '', replace: () => {}, href: 'https://main--lh-com--moved-permanently.aem.page/', origin: 'https://main--lh-com--moved-permanently.aem.page',
};
window.origin = window.location.origin;
window.matchMedia = () => ({ matches: false, addEventListener: () => {}, addListener: () => {} });
globalThis.window = window;
globalThis.document = document;
const { buildDestinationLink } = await import('../blocks/destination-finder/destination-finder.js');
const { BRANDS } = await import('../scripts/brands.js');

// the function as it was (74aedf9), lifted from the block's source
const src = execFileSync('git', ['show', '74aedf9:blocks/destination-finder/destination-finder.js'], { encoding: 'utf8' });
const start = src.indexOf('export function buildDestinationLink(');
const body = src.slice(start, src.indexOf('\n}\n', start) + 3).replace('export function', 'export default function');
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dest-link-'));
fs.writeFileSync(path.join(dir, 'before.mjs'), body);
const { default: before } = await import(path.join(dir, 'before.mjs'));

const ret = {
  origin: 'FRA', destination: 'NYC', tripType: 'RETURN', tripDuration: 14,
};
const one = {
  origin: 'FRA', destination: 'NYC', tripType: 'ONEWAY', tripDuration: 14,
};

test('lufthansa.com and its market roots: byte for byte as before', () => {
  ['/de/en', '/de/de', '/gb/en', '/ch/de', '/hu/en'].forEach((base) => {
    [ret, one].forEach((q) => assert.equal(buildDestinationLink(q, { base }), before(q, { base }), `${base} ${q.tripType}`));
    assert.equal(buildDestinationLink(ret, { base }, '/de/en/x'), before(ret, { base }, '/de/en/x'));
  });
  assert.equal(buildDestinationLink(ret, { base: '/de/en' }), '/de/en/book-and-manage/destination?OriginCode=FRA&tripType=RETURN&DestinationCode=NYC&TripDuration=14');
});

test('ITA: its www destination page', () => {
  assert.equal(BRANDS.ita.destinationPath, '/book-and-prepare/destination');
  assert.equal(
    buildDestinationLink({ ...ret, origin: 'ROM' }, { base: '/it/en', brand: 'ita' }, '', BRANDS.ita),
    'https://www.ita-airways.com/it/en/book-and-prepare/destination?OriginCode=ROM&tripType=RETURN&DestinationCode=NYC&TripDuration=14',
  );
});

test('Discover: its www destination page', () => {
  assert.equal(BRANDS.discover.destinationPath, '/book/destination');
  assert.equal(
    buildDestinationLink({ ...one, destination: 'HRG' }, { base: '/de/en', brand: 'discover' }, '', BRANDS.discover),
    'https://www.discover-airlines.com/de/en/book/destination?OriginCode=FRA&tripType=ONEWAY&DestinationCode=HRG',
  );
});

test('Austrian: its www destination page', () => {
  assert.equal(BRANDS.austrian.destinationPath, '/book/destination');
  assert.equal(
    buildDestinationLink({
      ...ret, origin: 'VIE', destination: 'LHR', tripDuration: 7,
    }, { base: '/at/de', brand: 'austrian' }, '', BRANDS.austrian),
    'https://www.austrian.com/at/de/book/destination?OriginCode=VIE&tripType=RETURN&DestinationCode=LHR&TripDuration=7',
  );
});

test('an authored Destination page row wins on a brand page too; a brand without a path: ours', () => {
  assert.equal(
    buildDestinationLink(ret, { base: '/de/en' }, 'https://www.discover-airlines.com/de/en/book/destination', BRANDS.discover),
    'https://www.discover-airlines.com/de/en/book/destination?OriginCode=FRA&tripType=RETURN&DestinationCode=NYC&TripDuration=14',
  );
  assert.equal(buildDestinationLink(ret, { base: '/de/en' }, '', BRANDS.cargo), before(ret, { base: '/de/en' }));
});
