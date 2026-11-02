/* eslint-disable import/extensions */
/* The capture's redirect checks (tools/importer/bd-paths.mjs): www answers some pages from
   another URL (an alias, or by the visitor's country: from a German exit every market-neutral
   /xx/<ll> page goes to /de/<ll>); bd-session --same-path saves only the page asked for.
   Run: node --test test/*.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import { redirectedTo, countryOfRedirect } from '../tools/importer/bd-paths.mjs';

const W = 'https://www.lufthansa.com';

test('redirectedTo: the final path when it is another page; the same path (case, slash, query, hash) is none', () => {
  assert.equal(redirectedTo(`${W}/xx/en/book-and-manage/stopover/munich-airport`, `${W}/xx/en/book-and-manage/stopover/munich-airport`), null);
  assert.equal(redirectedTo(`${W}/xx/en/a`, `${W}/xx/en/a/?x=1#y`), null);
  assert.equal(redirectedTo(`${W}/fr/fr/Yes`, `${W}/fr/fr/yes`), null);
  assert.equal(redirectedTo(`${W}/xx/en/book-and-manage/stopover/munich-airport`, `${W}/de/en/book-and-manage/stopover/munich-airport`), '/de/en/book-and-manage/stopover/munich-airport');
  assert.equal(redirectedTo(`${W}/xx/en/a`, 'chrome-error://chromewebdata/'), 'chrome-error://chromewebdata/');
});

test('countryOfRedirect: a market-neutral page sent into a country root names that country, else null', () => {
  assert.equal(countryOfRedirect(`${W}/xx/en/book-and-manage/stopover/munich-airport`, `${W}/de/en/book-and-manage/stopover/munich-airport`), 'de');
  assert.equal(countryOfRedirect(`${W}/xx/de/319`, `${W}/ch/de/319`), 'ch');
  assert.equal(countryOfRedirect(`${W}/xx/en/a`, `${W}/xx/en/b`), null, 'an alias inside xx');
  assert.equal(countryOfRedirect(`${W}/de/en/a`, `${W}/gb/en/a`), null, 'not a market-neutral page');
  assert.equal(countryOfRedirect(`${W}/xx/en/a`, `${W}/xx/en/a`), null);
  // www's own alias into a country root (another page there): no country, an alias
  assert.equal(countryOfRedirect(`${W}/xx/en/dcc`, `${W}/de/en/partner`), null);
  assert.equal(countryOfRedirect(`${W}/xx/en/articles/tags/munich-travel-guide`, `${W}/de/en/articles/tags/munich`), null);
});
