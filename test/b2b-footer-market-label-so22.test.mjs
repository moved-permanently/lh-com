/* eslint-disable max-len */
/* Standing order 22 of 2026-11-14: Group for Business's footer names the page's market. Its ch/en and
   xx pages use the de/en or de/de footer (page Metadata "footer"), whose market button reads "DE | EN";
   www shows the page's own root there: "CH | EN" on ch/en (b2b-parity-010), "XX | EN" / "XX | DE" on
   xx/en / xx/de, "DE | EN" on de/en (b2b-parity-009). On a B2B page the button now shows the page's
   root in that form; a label of another form, and every other brand, as before.
   Run: node --test test/b2b-footer-market-label-so22.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
window.hlx = { codeBasePath: '' };
window.location = {
  hostname: 'b2b.turnsthe.page', pathname: '/', search: '', hash: '', replace: () => {}, href: 'https://b2b.turnsthe.page/', origin: 'https://b2b.turnsthe.page',
};
window.origin = window.location.origin;
window.matchMedia = () => ({ matches: false, addEventListener: () => {}, addListener: () => {} });
globalThis.window = window;
globalThis.document = document;

const { marketLabel } = await import('../blocks/footer/footer.js');

test('a B2B page: the market button shows the page\'s root, as www', () => {
  assert.equal(marketLabel('DE | EN', { root: 'ch/en' }, 'b2b'), 'CH | EN');
  assert.equal(marketLabel('DE | EN', { root: 'xx/en' }, 'b2b'), 'XX | EN');
  assert.equal(marketLabel('DE | DE', { root: 'xx/de' }, 'b2b'), 'XX | DE');
  assert.equal(marketLabel('DE | EN', { root: 'de/en' }, 'b2b'), 'DE | EN');
  assert.equal(marketLabel(' DE|EN ', { root: 'ch/en' }, 'b2b'), 'CH | EN');
});

test('another form, no root, or another brand: the footer\'s own label', () => {
  assert.equal(marketLabel('Germany – English', { root: 'ch/en' }, 'b2b'), 'Germany – English');
  assert.equal(marketLabel('DE | EN', { root: '' }, 'b2b'), 'DE | EN');
  assert.equal(marketLabel('DE | EN', { root: 'ch/en' }, ''), 'DE | EN', 'lufthansa.com');
  assert.equal(marketLabel('DE | EN', { root: 'ch/en' }, 'discover'), 'DE | EN');
});

test('the footer\'s market button takes its label through marketLabel with the page\'s brand', () => {
  const src = fs.readFileSync(new URL('../blocks/footer/footer.js', import.meta.url), 'utf8');
  assert.match(src, /const label = marketLabel\(text\(para\), getLocale\(\), getMetadata\('brand'\)\);/);
});
