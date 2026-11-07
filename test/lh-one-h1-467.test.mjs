/* eslint-disable max-len */
/* global globalThis */
/* lufthansa.com's importer (the brief after 467, item 2): www's own pages have no h1 (book-and-manage/flights/giftvoucher,
   five of the 100-years pages: the campaign stage's title is an h2), or several (100-years/chronicle 5, global-network 2,
   electronic-devices-and-batteries 2). As for Austrian, one h1 per page, the look kept: the cleanup's oneMainHeading
   (info and campaign, lufthansa.com only), right before the size markers are written, promotes the first heading to h1
   where there is none (its size: an h2's heading-medium unless it has one), and writes every later h1 as h2 at its size
   (its heading-* class, else heading-large). The hero-campaign block styles every heading level alike.
   Run: node --max-old-space-size=256 --test test/lh-one-h1-467.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';
import transform from '../tools/importer/transformers/lufthansa-cleanup.js';

globalThis.WebImporter = { Blocks: { getMetadata: () => ({}), getMetadataBlock: (document) => document.createElement('table') } };

const run = (inner, { url = 'https://www.lufthansa.com/de/en/100-years/chronicle', template = 'campaign' } = {}) => {
  const { document } = parseHTML(`<html><head><title>T | Lufthansa</title></head><body><main><div class="section"><div class=" mb-default "><div class="section-content container-fluid section-regular ">${inner}</div></div></div></main></body></html>`);
  const payload = {
    document, url, params: { originalURL: url }, template: { name: template },
  };
  transform('beforeTransform', document.body, payload);
  transform('afterTransform', document.body, payload);
  return [...document.querySelectorAll('h1, h2, h3')].map((h) => `${h.tagName}:${h.textContent.trim()}`);
};
const hl = (tag, cls, text) => `<div class="headline section"><${tag} class="headline ${cls}">${text}</${tag}></div>`;

test('several h1: the first stays, the later ones h2 at their size', () => {
  assert.deepEqual(run(`${hl('h1', '', 'A century of movement')}${hl('h1', 'heading-medium', '1938')}${hl('h1', '', '1933-1945')}`), ['H1:A century of movement', 'H2:1938', 'H2:1933-1945 {heading-large}']);
});

test('no h1: the first heading promoted, its size kept', () => {
  assert.deepEqual(run(`${hl('h2', '', 'A century above the clouds')}${hl('h2', 'heading-small', 'Next')}`, { url: 'https://www.lufthansa.com/de/en/100-years/history' }), ['H1:A century above the clouds {heading-medium}', 'H2:Next {heading-small}']);
  assert.deepEqual(run(`${hl('h3', 'heading-copytext-large', 'Small first')}`, { url: 'https://www.lufthansa.com/de/en/book-and-manage/flights/giftvoucher', template: 'info' }), ['H1:Small first {heading-copytext-large}']);
});

test('one h1 as it was; other templates and other brands untouched', () => {
  assert.deepEqual(run(`${hl('h2', '', 'Stage')}${hl('h1', '', 'Pioneers')}`), ['H2:Stage', 'H1:Pioneers']);
  assert.deepEqual(run(`${hl('h1', '', 'A')}${hl('h1', '', 'B')}`, { template: 'hub' }), ['H1:A', 'H1:B']);
  assert.deepEqual(run(`${hl('h1', '', 'A')}${hl('h1', '', 'B')}`, { url: 'https://www.austrian.com/at/en/sustainable-flying', template: 'info' }), ['H1:A', 'H1:B']);
});
