/* eslint-disable max-len */
/* The brief after 534, item 3 (Brussels' ranking, brussels-parity-004): /be/en/local-page/offers has www's live fare
   recommender (.fareteaserdynamicevo: "Flight offers from Brussels", a slider of 16 destinations with live prices),
   which the homepage template maps to the destination-finder block; the page is an info page, whose template did not
   map it, so its rendered slides came in as 16 stacked 720 px pictures with links (1440 +190 %, 390 +81 %). The info
   template maps it now, as the homepage's (the same parser), right after the flight search. On disk only Brussels'
   offers page has the component outside a homepage (lufthansa.com, SWISS: homepages only).
   Run: node --max-old-space-size=256 --test test/info-destination-finder-539.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const { templates } = JSON.parse(fs.readFileSync(new URL('../tools/importer/page-templates.json', import.meta.url), 'utf8'));
const info = templates.find((t) => t.name === 'info');
const home = templates.find((t) => t.name === 'homepage');

test('the info template maps the live fare recommender to destination-finder, as the homepage', () => {
  const block = info.blocks.find((b) => b.name === 'destination-finder');
  assert.ok(block, 'mapped');
  assert.deepEqual(block.instances, home.blocks.find((b) => b.name === 'destination-finder').instances);
  const order = info.blocks.map((b) => b.name);
  assert.ok(order.indexOf('destination-finder') < order.indexOf('columns-media'), 'before the column views take its slides');
});

test('the info import script and its bundle carry the parser', () => {
  const script = fs.readFileSync(new URL('../tools/importer/import-info.js', import.meta.url), 'utf8');
  assert.match(script, /import destinationFinderParser from '\.\/parsers\/destination-finder\.js';/);
  const bundle = fs.readFileSync(new URL('../tools/importer/import-info.bundle.js', import.meta.url), 'utf8');
  assert.match(bundle, /tools\/importer\/parsers\/destination-finder\.js/);
});
