/* eslint-disable max-len, import/no-extraneous-dependencies -- dev tooling; linkedom is a dev dependency */
/* The offer cards keep their pictures through the whole cleanup (brief 464, item 1). The cleanup's
   tracking filter (TRACKING_URL, which names monetate) removed every image on sb.monetate.net,
   the four offer cards' pictures included, after convertOfferCards had built the block: every
   image cell came out empty (offer-cards-460 called the conversion alone). Here both hooks run on
   www's de/en homepage of 2026-11-06 (lh-snapshots-061, gzipped): the block keeps its four
   pictures; the page's other Monetate images (tracking pixels) still go.
   Run: node --max-old-space-size=512 --test test/offer-cards-pictures-464.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import zlib from 'node:zlib';
import { parseHTML } from 'linkedom';
import transform from '../tools/importer/transformers/lufthansa-cleanup.js';

globalThis.WebImporter = {
  Blocks: {
    getMetadata: () => ({}),
    getMetadataBlock: (document) => document.createElement('table'),
    createBlock: (document, { name, cells }) => {
      const t = document.createElement('table');
      t.dataset.name = name;
      cells.forEach((row) => {
        const tr = document.createElement('tr');
        row.forEach((c) => {
          const td = document.createElement('td');
          if (c && c.nodeType) td.append(c); else td.textContent = c || '';
          tr.append(td);
        });
        t.append(tr);
      });
      return t;
    },
  },
};

const html = zlib.gunzipSync(fs.readFileSync(new URL('./fixtures/offer-cards/de-en-homepage-061.html.gz', import.meta.url))).toString('utf8');
const URL_DE_EN = 'https://www.lufthansa.com/de/en/homepage';

test('the whole cleanup on the homepage snapshot: the offer cards keep their four pictures', () => {
  const { document } = parseHTML(html);
  const payload = {
    document, url: URL_DE_EN, params: { originalURL: URL_DE_EN }, template: { name: 'homepage' },
  };
  transform('beforeTransform', document.body, payload);
  transform('afterTransform', document.body, payload);
  const block = document.querySelector('table[data-name="Cards Icon Text (mini)"]');
  assert.ok(block, 'the offer cards block');
  const srcs = [...block.querySelectorAll('img')].map((i) => i.getAttribute('src'));
  assert.deepEqual(srcs, [6183407, 6183404, 6183405, 6183406].map((n) => `https://sb.monetate.net/img/1/1476/${n}.jpg`));
  assert.ok(!block.querySelector('img[data-lh-offer-image]'), 'no marker left');
  const outside = [...document.querySelectorAll('img')].filter((i) => /monetate/.test(i.getAttribute('src') || '') && !block.contains(i));
  assert.equal(outside.length, 0, 'other Monetate images still go');
});
