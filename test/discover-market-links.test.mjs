/* Discover's market roots' own documents (brief 157: the us/en, ca/en, xx/en, us/de, xx/de
   homepages and new-destinations): lh-edge passes a root's own document through unchanged
   (src/markets.js market), so its links to www's pages of the same root become relative where the
   language version has the page as a document (the allowlist), and the market route answers them
   from it; links to pages it lacks stay on www. Run: node --test test/*.test.mjs */
/* eslint-disable import/extensions -- the importer tooling is .mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import { marketLinks } from '../tools/importer/discover-import.mjs';

const W = 'https://www.discover-airlines.com';
const paths = new Set(['/de/en/book/baggage', '/de/en/homepage', '/de/de/book/baggage', '/xx/fr/book/baggage']);

test("a market root's links to its own root's pages: relative where the language version has the document", () => {
  const doc = `<p><a href="${W}/us/en/book/baggage">Baggage</a> <a href="${W}/us/en/book/baggage?x=1#fees">Fees</a> <a href="${W}/us/en/book/flights/offers">Offers</a> <a href="${W}/us/en">Home</a></p>`;
  const out = marketLinks(doc, '/us/en/homepage', paths);
  assert.match(out, /href="\/us\/en\/book\/baggage"/);
  assert.match(out, /href="\/us\/en\/book\/baggage\?x=1#fees"/);
  assert.match(out, new RegExp(`href="${W}/us/en/book/flights/offers"`), 'no document in the language version: www');
  assert.match(out, /href="\/us\/en\/homepage"/, 'the locale root is the homepage');
});

test('other roots, other hosts and the language versions stay as they are', () => {
  const doc = `<a href="${W}/ca/en/book/baggage">ca</a><a href="https://www.lufthansa.com/us/en/book/baggage">lh</a><a href="/de/en/book/baggage">lang</a>`;
  assert.equal(marketLinks(doc, '/us/en/homepage', paths), doc);
  const lang = `<a href="${W}/de/en/book/baggage">x</a>`;
  assert.equal(marketLinks(lang, '/de/en/homepage', paths), lang, 'a language version document: unchanged');
});

test('German and French market roots use their language versions', () => {
  assert.match(marketLinks(`<a href="${W}/xx/de/book/baggage">x</a>`, '/xx/de/book/new-destinations', paths), /href="\/xx\/de\/book\/baggage"/);
  assert.match(marketLinks(`<a href="${W}/ca/fr/book/baggage">x</a>`, '/ca/fr/homepage', paths), /href="\/ca\/fr\/book\/baggage"/);
});
