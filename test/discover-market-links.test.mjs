/* Links into a site's market roots (tools/importer/site-postprocess.mjs, the allowlist's
   marketRoots: lh-discover's us/en, ca/en, xx/en -> de/en, us/de, xx/de -> de/de, ca/fr -> xx/fr):
   lh-edge answers /<root>/<x> from the language version's /<version>/<x> and passes a root's own
   documents (brief 157: the market homepages, new-destinations) through unchanged, so such links
   are site pages where the language version has the document: www's become relative, relative
   ones stay relative (a later run no longer sends them back to www); links to pages the language
   version lacks go to www as before. Run: node --test test/*.test.mjs */
/* eslint-disable import/extensions -- the importer tooling is .mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import { postprocess } from '../tools/importer/site-postprocess.mjs';

const W = 'https://www.discover-airlines.com';
const sitePaths = new Set(['/de/en/book/baggage', '/de/en/homepage', '/de/de/book/baggage', '/xx/fr/book/baggage', '/us/en/homepage']);
const marketRoots = {
  'us/en': 'de/en', 'ca/en': 'de/en', 'xx/en': 'de/en', 'us/de': 'de/de', 'xx/de': 'de/de', 'ca/fr': 'xx/fr',
};
const run = (html) => postprocess(html, {
  sourceHost: 'www.discover-airlines.com', sitePaths, mapHosts: false, marketRoots,
}).html;

test("www's links into a market root: relative where the language version has the document", () => {
  const out = run(`<a href="${W}/us/en/book/baggage">a</a><a href="${W}/us/en/book/baggage?x=1#fees">b</a><a href="${W}/us/en/book/flights/offers">c</a><a href="${W}/xx/de/book/baggage">d</a><a href="${W}/ca/fr/book/baggage">e</a>`);
  assert.match(out, /href="\/us\/en\/book\/baggage"/);
  assert.match(out, /href="\/us\/en\/book\/baggage\?x=1#fees"/);
  assert.match(out, new RegExp(`href="${W}/us/en/book/flights/offers"`), 'no document in the language version: www');
  assert.match(out, /href="\/xx\/de\/book\/baggage"/);
  assert.match(out, /href="\/ca\/fr\/book\/baggage"/);
});

test('relative links into a market root stay relative; those to pages it lacks go to www', () => {
  const out = run('<a href="/xx/en/book/baggage">a</a><a href="/xx/en/book/flights/offers">b</a><a href="/us/en/homepage">c</a>');
  assert.match(out, /href="\/xx\/en\/book\/baggage"/);
  assert.match(out, new RegExp(`href="${W}/xx/en/book/flights/offers"`));
  assert.match(out, /href="\/us\/en\/homepage"/, 'its own document');
});

test('without marketRoots (lh-com, other sites) as before', () => {
  const out = postprocess(`<a href="${W}/us/en/book/baggage">a</a><a href="/us/en/book/baggage">b</a>`, { sourceHost: 'www.discover-airlines.com', sitePaths, mapHosts: false }).html;
  assert.match(out, new RegExp(`href="${W}/us/en/book/baggage">a`));
  assert.match(out, new RegExp(`href="${W}/us/en/book/baggage">b`));
});
