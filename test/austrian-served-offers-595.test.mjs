/* eslint-disable max-len */
/* The brief after 595, item 7: th/en promptpay's fare-teaser link went to https://www.austrian.com/th/en/offers-destinations
   after its re-import from the recording (the older document had the relative path from its 10-30 snapshot).
   /th/en/offers-destinations is no lh-austrian document, but our host serves it (the edge's fallback to
   /at/en/offers-destinations) on 61 of the 64 roots; not on at/de, de/de, ch/de (404: their page has another slug).
   tools/importer/sites/lh-austrian.json served lists those 61 paths, and austrian-import.mjs passes them to withOwnLinks
   as brussels-import.mjs does: such a link becomes relative, query kept; a German root's stays on www.
   Run: node --max-old-space-size=256 --test test/austrian-served-offers-595.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { ownServed, withOwnLinks } from '../tools/importer/own-links.mjs';

const served = ownServed('lh-austrian');
const link = (p) => `<div><p><a href="https://www.austrian.com${p}?hideMap=Y&#x26;Budget=25000,70000">View more offers</a></p></div>`;

test('lh-austrian.json served: 61 roots\' offers-destinations, not the three German roots', () => {
  const list = JSON.parse(fs.readFileSync(new URL('../tools/importer/sites/lh-austrian.json', import.meta.url), 'utf8')).served;
  assert.equal(list.length, 61);
  assert.ok(list.includes('/th/en/offers-destinations'));
  ['/at/de/offers-destinations', '/de/de/offers-destinations', '/ch/de/offers-destinations'].forEach((p) => assert.ok(!list.includes(p), p));
});

test('the promptpay link becomes relative with its query; a German root\'s stays on www', () => {
  const out = withOwnLinks(link('/th/en/offers-destinations'), 'www.austrian.com', new Set(), new Map(), { served }).doc;
  assert.ok(out.includes('href="/th/en/offers-destinations?hideMap=Y'), out);
  const de = withOwnLinks(link('/de/de/offers-destinations'), 'www.austrian.com', new Set(), new Map(), { served }).doc;
  assert.ok(de.includes('href="https://www.austrian.com/de/de/offers-destinations'), de);
});

test('austrian-import.mjs passes the served paths to withOwnLinks', () => {
  const src = fs.readFileSync(new URL('../tools/importer/austrian-import.mjs', import.meta.url), 'utf8');
  assert.match(src, /const served = ownServed\('lh-austrian'\);/);
  assert.match(src, /withOwnLinks\([^\n]*\{ linkOut: linkOutDocs\.has\(p\) \? p : null, served \}\)\.doc;/);
});
