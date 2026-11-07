/* eslint-disable max-len, import/no-extraneous-dependencies -- dev tooling; linkedom is a dev dependency */
/* Insights articles: an empty headline (brief 461; www's know-before-you-go-berlin and -algiers
   carry <div class="headline commonevent"><h3 class="heading-copytext-large">&nbsp;</h3></div>
   between the article header and the first image). www renders the empty heading's line and
   margins: the first image 43 px lower at 1440 (40 at 768, 39 at 390) than the replica, which
   dropped it. The insights template now keeps it as "{spacer-42}" (42 + 1 px); other templates
   and headings with text as before.
   Run: node --max-old-space-size=256 --test test/insights-empty-headline-461.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';
import transform from '../tools/importer/transformers/lufthansa-cleanup.js';

globalThis.WebImporter = { Blocks: { getMetadata: () => ({}), getMetadataBlock: (document) => document.createElement('table') } };

const URL_KB = 'https://www.lufthansa.com/de/en/articles/explore-the-world/know-before-you-go-berlin';
const empty = '<div class="headline commonevent"><h3 class="heading-copytext-large">&nbsp;</h3></div>';
const image = '<div class="image parbase"><div class="image-wrapper"><figure><img src="https://www.lufthansa.com/b.jpg" alt=""></figure></div></div>';
const titled = '<div class="headline commonevent"><h3 class="heading-copytext-large">Getting there</h3></div>';

const run = (inner, template) => {
  const { document } = parseHTML(`<html><head><title>T | Lufthansa</title></head><body><main><div class="section"><div class="section-content">${inner}</div></div></main></body></html>`);
  const payload = {
    document, url: URL_KB, params: { originalURL: URL_KB }, template: { name: template },
  };
  transform('beforeTransform', document.body, payload);
  transform('afterTransform', document.body, payload);
  return { texts: [...document.querySelectorAll('p, h3')].map((e) => e.textContent.trim()).filter(Boolean), document };
};

test('insights: an empty headline becomes {spacer-42} before the image', () => {
  const { texts, document } = run(`${empty}${image}`, 'insights');
  assert.deepEqual(texts, ['{spacer-42}']);
  assert.ok(!document.querySelector('h3'));
});

test('a headline with text stays a heading', () => {
  assert.deepEqual(run(`${titled}${image}`, 'insights').texts, ['Getting there']);
});

test('other templates: dropped as before', () => {
  assert.deepEqual(run(`${empty}${image}`, 'info').texts, []);
});
