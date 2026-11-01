/* eslint-disable max-len */
/* Brussels' fare widgets link a destination to its own page on the site (scripts/brands.js
   brussels: destinationPath /book-a-flight/destination, destinationOnSite): the destination
   finder (homepage slider, offers grid: blocks/destination-finder buildDestinationLink) and the
   fare teaser (blocks/fare-teaser fareTeaserLink) open /<root>/book-a-flight/destination, the
   site's page with live prices (/be/en/book-and-manage/destination: a 404 there); ITA, Austrian
   and Discover keep their www page, lufthansa.com its /<root>/book-and-manage/destination; an
   authored Destination page row or Link pattern first, as before.
   Run: node --max-old-space-size=512 --test test/brussels-destination-links.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
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
const { fareTeaserLink } = await import('../blocks/fare-teaser/fare-teaser.js');
const { BRANDS } = await import('../scripts/brands.js');

const ret = {
  origin: 'BRU', destination: 'FIH', tripType: 'RETURN', tripDuration: 7,
};
const route = {
  origin: 'BRU', destination: 'FIH', tripDuration: 7, cabin: 'E',
};

test('Brussels: the destination finder opens the site\'s own destination page', () => {
  assert.equal(BRANDS.brussels.destinationPath, '/book-a-flight/destination');
  assert.equal(BRANDS.brussels.destinationOnSite, true);
  assert.equal(
    buildDestinationLink(ret, { base: '/be/en', brand: 'brussels' }, '', BRANDS.brussels),
    '/be/en/book-a-flight/destination?OriginCode=BRU&tripType=RETURN&DestinationCode=FIH&TripDuration=7',
  );
  assert.equal(
    buildDestinationLink({ ...ret, tripType: 'ONEWAY' }, { base: '/gb/en', brand: 'brussels' }, '', BRANDS.brussels),
    '/gb/en/book-a-flight/destination?OriginCode=BRU&tripType=ONEWAY&DestinationCode=FIH',
  );
  // an authored Destination page row wins
  assert.equal(
    buildDestinationLink(ret, { base: '/be/en' }, '/be/en/x', BRANDS.brussels),
    '/be/en/x?OriginCode=BRU&tripType=RETURN&DestinationCode=FIH&TripDuration=7',
  );
});

test('the other brands and lufthansa.com: the destination finder as before', () => {
  assert.match(buildDestinationLink(ret, { base: '/it/en' }, '', BRANDS.ita), /^https:\/\/www\.ita-airways\.com\/it\/en\/book-and-prepare\/destination\?/);
  assert.match(buildDestinationLink(ret, { base: '/at/en' }, '', BRANDS.austrian), /^https:\/\/www\.austrian\.com\/at\/en\/book\/destination\?/);
  assert.match(buildDestinationLink(ret, { base: '/de/en' }, '', BRANDS.discover), /^https:\/\/www\.discover-airlines\.com\/de\/en\/book\/destination\?/);
  assert.equal(buildDestinationLink(ret, { base: '/de/en' }), '/de/en/book-and-manage/destination?OriginCode=BRU&tripType=RETURN&DestinationCode=FIH&TripDuration=7');
});

test('the fare teaser: Brussels\' own page; the others\' default as before; a Link pattern first', () => {
  assert.equal(fareTeaserLink(route, { base: '/be/fr' }, '', BRANDS.brussels), '/be/fr/book-a-flight/destination?OriginCode=BRU&DestinationCode=FIH&TripDuration=7&Cabin=E');
  ['ita', 'austrian', 'discover'].forEach((b) => assert.equal(fareTeaserLink(route, { base: '/it/it' }, '', BRANDS[b]), '/it/it/book-and-manage/destination?OriginCode=BRU&DestinationCode=FIH&TripDuration=7&Cabin=E', b));
  assert.equal(fareTeaserLink(route, { base: '/de/en' }, ''), '/de/en/book-and-manage/destination?OriginCode=BRU&DestinationCode=FIH&TripDuration=7&Cabin=E');
  assert.equal(fareTeaserLink(route, { base: '/be/en' }, 'https://x.example/d?o={origin}&d={destination}', BRANDS.brussels), 'https://x.example/d?o=BRU&d=FIH');
});
