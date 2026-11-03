/* eslint-disable max-len */
/* The search-results block without a search word (brief 305): on SWISS's pages (the header
   magnifier, /ch/en/search-results) the empty search box, no heading and no error, as www.swiss.com
   shows it today; lufthansa.com and the other brands as recorded (www's API refuses an empty query:
   "could not be loaded"); a failed index is a failure everywhere. A linkedom page, no network.
   Run: timeout 60 node --max-old-space-size=256 --test test/search-results-empty.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
window.hlx = { codeBasePath: '' };
window.location = {
  hostname: 'swiss.turnsthe.page', pathname: '/ch/en/search-results', search: '', hash: '', replace: () => {}, href: 'https://swiss.turnsthe.page/ch/en/search-results', origin: 'https://swiss.turnsthe.page',
};
window.matchMedia = () => ({ matches: false, addEventListener: () => {}, addListener: () => {} });
globalThis.window = window;
globalThis.document = document;
const { resultState } = await import('../blocks/search-results/search-results.js');

test('no search word: SWISS the empty box; lufthansa.com and the other brands the recorded failure', () => {
  assert.equal(resultState('', false, 'swiss'), 'empty');
  assert.equal(resultState('   ', false, 'swiss'), 'empty');
  assert.equal(resultState('', false, undefined), 'failed', 'lufthansa.com as before');
  assert.equal(resultState('', false, 'austrian'), 'failed', 'Austrian as before');
  assert.equal(resultState('', false, 'brussels'), 'failed');
});

test('with a search word: the results, or the failure when the index does not load (every brand)', () => {
  assert.equal(resultState('baggage', false, 'swiss'), 'results');
  assert.equal(resultState('baggage', true, 'swiss'), 'failed');
  assert.equal(resultState('Gepäck', false, undefined), 'results');
  assert.equal(resultState('Gepäck', true, undefined), 'failed');
});
