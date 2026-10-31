/* eslint-disable import/extensions */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  edsPath, docOf, langOf, sourceKey, targetOf,
} from '../tools/importer/airdolomiti-paths.mjs';

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
