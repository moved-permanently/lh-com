/* eslint-disable max-len, import/extensions */
/* lh-discover's markets rows against www's sitemaps (tools/importer/discover-markets.mjs): a
   language document served on market roots where www has no page is a gap, with the row www's
   roots give; documents in no sitemap are listed apart. Run: node --test test/*.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import { listedRoots, marketsGaps } from '../tools/importer/discover-markets.mjs';

const ROOTS = ['de/en', 'de/de', 'xx/fr', 'us/en', 'ca/en', 'xx/en', 'us/de', 'xx/de', 'ca/fr'];
const W = 'https://www.discover-airlines.com';
const listed = listedRoots({
  'de/en': [`${W}/de/en/book/north-america-promotion`, `${W}/de/en/book/x/register-ammunition/thank-you`, `${W}/de/en/legal/imprint.html`],
  'ca/en': [`${W}/ca/en/book/x/register-ammunition/thank-you`, `${W}/ca/en/legal/imprint`],
  'us/en': [`${W}/us/en/legal/imprint/`],
  'xx/en': [`${W}/xx/en/legal/imprint`],
});
const doc = (suffix, markets = null) => ({ version: 'de/en', suffix, markets });

test('listedRoots: the page suffix per sitemap root (.html and trailing slash dropped)', () => {
  assert.deepEqual([...listed.get('/legal/imprint')].sort(), ['ca/en', 'de/en', 'us/en', 'xx/en']);
  assert.deepEqual([...listed.get('/book/north-america-promotion')], ['de/en']);
});

test('marketsGaps: the rows www\'s roots give where the document is served elsewhere', () => {
  const { gaps, unlisted } = marketsGaps([
    doc('/book/north-america-promotion'),
    doc('/book/x/register-ammunition/thank-you'),
    doc('/legal/imprint'),
    doc('/book/x/add-sports-baggage/thank-you'),
  ], listed, ROOTS);
  assert.deepEqual(gaps.map((g) => [g.doc, g.want, g.served.join(' ')]), [
    ['/de/en/book/north-america-promotion', 'de', 'de/en us/en ca/en xx/en'],
    ['/de/en/book/x/register-ammunition/thank-you', 'de, ca', 'de/en us/en ca/en xx/en'],
  ]);
  assert.deepEqual(unlisted.map((u) => u.doc), ['/de/en/book/x/add-sports-baggage/thank-you']);
});

test('marketsGaps: a row that matches www is no gap; an exclude row counts', () => {
  const { gaps } = marketsGaps([
    doc('/book/north-america-promotion', 'de'),
    doc('/book/x/register-ammunition/thank-you', 'de, ca'),
    doc('/legal/imprint', '-us'),
  ], listed, ROOTS);
  assert.deepEqual(gaps.map((g) => [g.doc, g.served.join(' '), g.www.join(' ')]), [['/de/en/legal/imprint', 'de/en ca/en xx/en', 'de/en us/en ca/en xx/en']]);
});
