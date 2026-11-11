/* eslint-disable max-len */
/* Brief 582: a markets-section step merges a covered root's page (the variant) into the language version's document.
   lh-edge's market route rewrites the document's links into the language version to the requesting root, not links
   into another root, so the variant's own links (/gb/en/fly-more-sustainabl in /de/en/flight-search's -de section,
   uploaded tonight) sent every en root to gb/en's page. The merge now rewrites the variant's links into its root to the
   version's root (market-steps passes both from the row's paths).
   Run: node --max-old-space-size=256 --test test/market-root-links-582.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import { withRootLinks } from '../tools/importer/market-sections.mjs';
import { runRow } from '../tools/importer/market-steps.mjs';

test('withRootLinks: root-relative and www links into the root, nothing else', () => {
  const html = '<a href="/gb/en/fly-more-sustainabl">x</a> <a href="https://www.lufthansa.com/gb/en/a#b">y</a> <a href="/gb/engine">z</a> <a href="/gb/en">h</a> <a href="https://www.miles-and-more.com/gb/en/x">m</a>';
  assert.equal(withRootLinks(html, 'gb/en', 'de/en'), '<a href="/de/en/fly-more-sustainabl">x</a> <a href="https://www.lufthansa.com/de/en/a#b">y</a> <a href="/gb/engine">z</a> <a href="/de/en">h</a> <a href="https://www.miles-and-more.com/gb/en/x">m</a>');
  assert.equal(withRootLinks(html, null, 'de/en'), html);
});

test('a markets-section row: the variant\'s section links into the version\'s root', () => {
  const version = '<div><h1>Flights</h1></div>\n<div><h2>Offer</h2><p><a href="/de/en/miles">Miles</a></p></div>';
  const variant = '<div><h1>Flights</h1></div>\n<div><h2>Offer</h2><p><a href="/gb/en/fly-more-sustainabl">CO2</a></p></div>';
  const docs = { '/de/en/flight-search': version, '/gb/en/flight-search': variant };
  const r = runRow({ action: 'markets-section', document: '/de/en/flight-search', variant: '/gb/en/flight-search', markets: 'de|-de' }, (p) => docs[p] ?? null);
  assert.ok(r.html.includes('href="/de/en/fly-more-sustainabl"'), r.html);
  assert.ok(!r.html.includes('/gb/en/'), r.html);
  assert.ok(r.html.includes('href="/de/en/miles"'));
});
