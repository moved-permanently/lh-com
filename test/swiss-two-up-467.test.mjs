/* eslint-disable max-len, import/extensions */
/* SWISS row 41 (brief 467): the fleet subpages (airbus-longhaul, 12 languages), the new
   destinations, corporate careers and SDG pages and one local page still showed www's two-column
   card views three to a row (their documents were imported before withTwoUpCards, brief 450).
   withTwoUpCards on DA's copy of /ch/en/discover/fleet/airbus-longhaul and www's page: its three
   grids get two-up, nothing else changes; run again, it changes nothing.
   Run: node --max-old-space-size=256 --test test/swiss-two-up-467.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import zlib from 'node:zlib';
import { withTwoUpCards } from '../tools/importer/swiss-import.mjs';

const da = fs.readFileSync(new URL('./fixtures/swiss-two-up/ch-en-airbus-longhaul-da.html', import.meta.url), 'utf8');
const www = zlib.gunzipSync(fs.readFileSync(new URL('./fixtures/swiss-two-up/ch-en-airbus-longhaul-www.html.gz', import.meta.url))).toString('utf8');

test('airbus-longhaul: the three grids two-up, the rest as it was', () => {
  const { doc, made } = withTwoUpCards(da, www);
  assert.equal(made, 3);
  assert.equal((doc.match(/class="carousel-cards grid two-up"/g) || []).length, 3);
  assert.equal(doc.replace(/ two-up"/g, '"'), da);
});

test('once more: nothing to do', () => {
  const once = withTwoUpCards(da, www).doc;
  assert.equal(withTwoUpCards(once, www).made, 0);
});
