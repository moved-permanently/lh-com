/* eslint-disable max-len, import/extensions */
/* Brussels' destination finder pages (offline package 2026-11-06, item 5, axe page-has-heading-one):
   www's finder titles its offers itself (maui-headline type h1: "Best offers", "Meilleures offres",
   "Las mejores ofertas"). A capture with the widget rendered keeps that title in the import
   (/es/es/book-a-flight/our-destinations); the be/en and be/fr captures have the widget unrendered,
   so their documents had no title at all. The importer now gives a finder page without an h1 www's
   title in the page's language, above the finder; nothing on the homepages (www's homepage finder
   has no title) or for languages no capture shows (tools/importer/brussels-import.mjs withFinderTitle). Run: node --test test/brussels-finder-title.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import { withFinderTitle, FINDER_TITLES } from '../tools/importer/brussels-import.mjs';

const doc = '<div><div class="destination-finder grid"><div><div>Origin</div><div>BRU</div></div></div></div>';

test('a finder page without a title gets www\'s, in its language, right above the finder', () => {
  assert.deepEqual(FINDER_TITLES, { en: 'Best offers', fr: 'Meilleures offres', es: 'Las mejores ofertas' });
  assert.equal(withFinderTitle(doc, '/be/en/book-a-flight/our-destinations'), '<div><h1>Best offers</h1><div class="destination-finder grid"><div><div>Origin</div><div>BRU</div></div></div></div>');
  assert.match(withFinderTitle(doc, '/be/fr/book-a-flight/our-destinations'), /^<div><h1>Meilleures offres<\/h1><div class="destination-finder grid">/);
});

test('the finder as the import writes it (no option yet) gets the title too', () => {
  assert.equal(withFinderTitle('<div><div class="destination-finder"><div></div></div></div>', '/be/en/book-a-flight/our-destinations'), '<div><h1>Best offers</h1><div class="destination-finder"><div></div></div></div>');
});

test('nothing when the page has a title, is a homepage, has no finder, or its language\'s label is not known', () => {
  const titled = `<div><h1 id="las-mejores-ofertas">Las mejores ofertas</h1>${doc.slice(5)}`;
  assert.equal(withFinderTitle(titled, '/es/es/book-a-flight/our-destinations'), titled);
  const slider = '<div><div class="destination-finder"><div></div></div></div>';
  assert.equal(withFinderTitle(slider, '/be/en/homepage'), slider);
  assert.equal(withFinderTitle('<div><p>Text</p></div>', '/be/en/book-a-flight'), '<div><p>Text</p></div>');
  assert.equal(withFinderTitle(doc, '/be/nl/book-a-flight/our-destinations'), doc);
  assert.equal(withFinderTitle(doc, '/it/it/book-a-flight/our-destinations'), doc);
});
