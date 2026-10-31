/* eslint-disable max-len */
/* Destination images per brand (scripts/brand.js destinationImageBase, scripts/lh-api.js
   destinationImageUrl, blocks/destination-offer's panorama): www's imageBaseUrl of each brand
   (Discover /content/dam/four_y/images/offers/destination, its snapshots; ITA
   /content/dam/ita/images/offers/destination), Lufthansa's folder for lh-com and the brands
   without one. Run: node --max-old-space-size=512 --test test/destination-images.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';

const { window } = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
window.location = {
  hostname: 'discover.turnsthe.page', pathname: '/de/en/homepage', search: '', href: 'https://discover.turnsthe.page/de/en/homepage', origin: 'https://discover.turnsthe.page',
};
window.hlx = { codeBasePath: '' };
globalThis.window = window;
const { destinationImageBase, DEFAULT_DESTINATION_IMAGES } = await import('../scripts/brand.js');
const { destinationImageUrl, damPathReady } = await import('../scripts/lh-api.js');

const meta = (brand) => (name) => (name === 'brand' ? brand : '');
/** Runs fn on a page whose metadata `brand` is the given value. */
const onPage = (brand, fn) => {
  const { document } = parseHTML(`<!DOCTYPE html><html><head>${brand ? `<meta name="brand" content="${brand}">` : ''}</head><body></body></html>`);
  globalThis.document = document;
  try {
    return fn();
  } finally {
    delete globalThis.document;
  }
};

test('destinationImageBase: the brand\'s folder on www, Lufthansa\'s otherwise', () => {
  assert.equal(DEFAULT_DESTINATION_IMAGES, '/content/dam/lh/images/offers/destination');
  assert.equal(destinationImageBase(meta('ita')), '/content/dam/ita/images/offers/destination');
  assert.equal(destinationImageBase(meta('discover')), '/content/dam/four_y/images/offers/destination');
  assert.equal(destinationImageBase(meta('cargo')), DEFAULT_DESTINATION_IMAGES);
  assert.equal(destinationImageBase(meta('')), DEFAULT_DESTINATION_IMAGES);
  assert.equal(destinationImageBase(), DEFAULT_DESTINATION_IMAGES, 'no page');
});

test('destinationImageUrl: the page\'s brand folder; lh-com exactly as before', async () => {
  await damPathReady();
  const lh = onPage('', () => destinationImageUrl('CUN', 720));
  assert.equal(lh, '/content/dam/lh/images/offers/destination/cun-square.jpg?width=720&format=jpeg&optimize=medium');
  assert.equal(onPage('discover', () => destinationImageUrl('CUN', 720)), '/content/dam/four_y/images/offers/destination/cun-square.jpg?width=720&format=jpeg&optimize=medium');
  assert.equal(onPage('ita', () => destinationImageUrl('JFK', 180)), '/content/dam/ita/images/offers/destination/jfk-square.jpg?width=180&format=jpeg&optimize=medium');
  assert.equal(onPage('ita', () => destinationImageUrl('x1', 180)), '', 'not a code');
});

test('destination-offer: the panorama from the brand folder', () => {
  const src = fs.readFileSync(new URL('../blocks/destination-offer/destination-offer.js', import.meta.url), 'utf8');
  assert.match(src, /localDamUrl\(`\$\{destinationImageBase\(\)\}\/\$\{route\.destination\.toLowerCase\(\)\}-panorama\.jpg`\)/);
  assert.doesNotMatch(src, /\/content\/dam\/lh\/images\/offers\/destination\//);
});
