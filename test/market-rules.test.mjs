/* The `markets` rule of choice B (scripts/market-rules.js): page and section metadata.
   Run: node --test test/*.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import { marketAllows, sectionMarkets, dropMarketSections } from '../scripts/market-rules.js';

const meta = (value) => `<div class="section-metadata"><div><div><p>Markets</p></div><div><p>${value}</p></div></div></div>`;
const section = (body, value) => `<div>${body}${value === undefined ? '' : meta(value)}</div>`;

test('marketAllows: include, exclude, empty', () => {
  assert.ok(marketAllows('', 'de'));
  assert.ok(marketAllows('de', 'de'));
  assert.ok(!marketAllows('de', 'ch'));
  assert.ok(!marketAllows('-de', 'de'));
  assert.ok(marketAllows('-de', 'ch'));
  assert.ok(marketAllows('DE, AT', 'at'));
  // lh-ita's documents list market roots (cc/ll): a root counts as its country
  assert.ok(marketAllows('be/fr, ca/fr, ch/fr, tn/fr, xx/fr', 'ch'));
  assert.ok(!marketAllows('be/fr, ca/fr, ch/fr, tn/fr, xx/fr', 'de'));
  assert.ok(!marketAllows('-ch/fr', 'ch'));
});

test('sectionMarkets reads the Markets row of the section metadata only', () => {
  assert.equal(sectionMarkets(section('<p>x</p>', '-de')), '-de');
  assert.equal(sectionMarkets(section('<p>x</p>')), null);
  assert.equal(sectionMarkets('<div><div class="section-metadata"><div><div>Style</div><div>grey</div></div></div></div>'), null);
  // a Markets row of the page's metadata block is no section value
  assert.equal(sectionMarkets('<div><div class="metadata"><div><div>Markets</div><div>de</div></div></div></div>'), null);
  assert.equal(sectionMarkets('<div><div class="section-metadata"><div><div>Style</div><div>grey</div></div><div><div>markets</div><div>de, at</div></div></div></div>'), 'de, at');
  // as Edge Delivery renders it: an attribute of the section
  assert.equal(sectionMarkets('<div data-markets="-de"><p>x</p></div>'), '-de');
  assert.equal(sectionMarkets('<div class="x" data-markets="de, at"><p>x</p></div>'), 'de, at');
  assert.equal(sectionMarkets('<div><p data-markets="de">x</p></div>'), null, 'only the section\'s own attribute');
});

test('dropMarketSections on Edge Delivery\'s rendering (data-markets on the section)', () => {
  const head = '<div><h1>Flüge</h1></div>';
  const parking = '<div data-markets="de"><div class="carousel-cards"><div><div>Parken</div></div></div></div>';
  const entry = '<div data-markets="-de"><div class="carousel-cards"><div><div>Einreise</div></div></div></div>';
  const rest = '<div><h2>Mit Flugangeboten</h2></div>';
  const page = `<html><body><main>${head}${parking}${entry}${rest}</main></body></html>`;
  assert.equal(dropMarketSections(page, 'de'), page.replace(entry, ''));
  assert.equal(dropMarketSections(page, 'be'), page.replace(parking, ''));
  assert.equal(dropMarketSections(`${head}${parking}${entry}${rest}`, 'ch'), `${head}${entry}${rest}`);
});

test('dropMarketSections: another market\'s sections go, the rest stays byte for byte', () => {
  const head = section('<h1>Flüge</h1><div class="feedback"><div><div>x</div></div></div>');
  const parking = section('<div class="carousel-cards"><div><div>Parken am Terminal</div></div></div>', 'de');
  const entry = section('<div class="carousel-cards"><div><div>Einreisebestimmungen</div></div></div>', '-de');
  const rest = section('<p>{divider-25}</p><h2>Mit Flugangeboten</h2>');
  const plain = `${head}${parking}${entry}${rest}`;
  assert.equal(dropMarketSections(plain, 'de'), `${head}${parking}${rest}`);
  assert.equal(dropMarketSections(plain, 'ch'), `${head}${entry}${rest}`);
  const page = `<html><head><title>t</title></head><body><header></header><main>${plain}</main><footer></footer></body></html>`;
  assert.equal(dropMarketSections(page, 'ch'), page.replace(parking, ''));
  // without section metadata: unchanged
  assert.equal(dropMarketSections(`${head}${rest}`, 'ch'), `${head}${rest}`);
});
