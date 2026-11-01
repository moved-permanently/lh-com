/* eslint-disable import/extensions */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  edsPath, docOf, langOf, sourceKey, targetOf, BLOG_CATEGORIES, LIVE_TOOLS,
} from '../tools/importer/airdolomiti-paths.mjs';

test('the posts\' category pages are pages of the site, path for path', () => {
  assert.equal(BLOG_CATEGORIES.length, 15);
  assert.ok(BLOG_CATEGORIES.map(edsPath).includes('/de/artikel/reiseziele'));
  assert.equal(BLOG_CATEGORIES.filter((u) => langOf(u) === 'de').length, 5);
  assert.ok(BLOG_CATEGORIES.map(edsPath).includes('/articoli/avgeek'));
  assert.ok(BLOG_CATEGORIES.map(edsPath).includes('/articoli/didyouknow'));
  assert.ok(BLOG_CATEGORIES.map(edsPath).includes('/en/articles/dyk'));
  assert.ok(BLOG_CATEGORIES.map(edsPath).includes('/en/articles/avgeek-en'));
  assert.equal(BLOG_CATEGORIES.filter((u) => langOf(u) === 'it').length, 5);
  assert.equal(BLOG_CATEGORIES.filter((u) => langOf(u) === 'en').length, 5);
});

test('www\'s live tools pages are pages of the site: booking and flight status in three languages', () => {
  assert.equal(edsPath(Object.keys(LIVE_TOOLS).find((u) => LIVE_TOOLS[u] === 'status' && langOf(u) === 'de')), '/de/flug-status');
  assert.equal(Object.values(LIVE_TOOLS).filter((k) => k === 'booking').length, 3);
  assert.ok(Object.keys(LIVE_TOOLS).map(edsPath).includes('/prenotazioni'));
});

test('the three language domains become one site, path for path', () => {
  assert.equal(edsPath('https://www.airdolomiti.it/tratte/volo-verona-monaco-di-baviera'), '/tratte/volo-verona-monaco-di-baviera');
  assert.equal(edsPath('https://www.airdolomiti.eu/routes/flight-munich-verona'), '/en/routes/flight-munich-verona');
  assert.equal(edsPath('https://www.airdolomiti.de/routen/flug-muenchen-verona'), '/de/routen/flug-muenchen-verona');
  assert.equal(edsPath('https://www.example.com/x'), null);
});

test('the homepages and their documents', () => {
  assert.equal(edsPath('https://www.airdolomiti.it'), '/');
  assert.equal(edsPath('https://www.airdolomiti.eu/'), '/en');
  assert.equal(docOf('/'), '/index');
  assert.equal(docOf('/en'), '/en/index');
  assert.equal(docOf('/de'), '/de/index');
  assert.equal(docOf('/de/flughaefen'), '/de/flughaefen');
});

test('segments Edge Delivery cannot keep become hyphens', () => {
  assert.equal(edsPath('https://www.airdolomiti.eu/articles/dyk/up_in_the_air'), '/en/articles/dyk/up-in-the-air');
  assert.equal(edsPath('https://www.airdolomiti.de/artikel/travellers-de/mit_tieren_fliegen/'), '/de/artikel/travellers-de/mit-tieren-fliegen');
});

test('languages, keys and the target an alias names', () => {
  assert.equal(langOf('https://www.airdolomiti.de/buchung'), 'de');
  assert.equal(sourceKey('https://www.airdolomiti.it/faq/'), 'www.airdolomiti.it/faq');
  assert.equal(targetOf({ note: 'duplicate of canonical https://www.airdolomiti.it/bagaglio/franchigia' }), 'https://www.airdolomiti.it/bagaglio/franchigia');
  assert.equal(targetOf({ note: 'redirects to https://www.airdolomiti.it/faq' }), 'https://www.airdolomiti.it/faq');
  assert.equal(targetOf({ note: '' }), null);
});
