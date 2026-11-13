/* eslint-disable max-len, import/no-extraneous-dependencies -- dev tooling; linkedom is a dev dependency */
/* Standing order 20 (2026-11-13), item 1: /de/en/flight-disruptions' jump links ("Rapid help", "Compensation", "Lufthansa
   app", "FAQs"). www's list is ul.responsive: one link per line below 768px, side by side from 768px (as .horizontal); the
   Jump Links block drew every list as one wrapping row, two per line at 390, the page 50px shorter there. A list of jump
   links in ul.responsive is "Jump Links (stacked)" now (lufthansa-cleanup convertJumpLinks), stacked below 768px
   (blocks/jump-links); ul.horizontal stays the plain block. The info snapshots with such a list: 16 documents
   (flight-disruptions, flynet, lufthansa-business-class-on-long-haul-routes, travel-briefing; four roots each).
   Input: the list of the flight-disruptions snapshot (test/fixtures/jump-links-stacked-so20).
   Run: node --max-old-space-size=256 --test test/jump-links-stacked-so20.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';

globalThis.WebImporter = {
  Blocks: {
    getMetadata: () => ({}),
    getMetadataBlock: (document) => document.createElement('table'),
    createBlock: (document, { name, variants = [], cells }) => {
      const table = document.createElement('table');
      const head = document.createElement('tr');
      const th = document.createElement('th');
      th.textContent = `${name}${variants.length ? ` (${variants.join(', ')})` : ''}`;
      head.append(th);
      table.append(head);
      cells.forEach((row) => {
        const tr = document.createElement('tr');
        row.forEach((c) => { const td = document.createElement('td'); td.append(c); tr.append(td); });
        table.append(tr);
      });
      return table;
    },
  },
};
const { default: cleanup } = await import('../tools/importer/transformers/lufthansa-cleanup.js');

const URL_FD = 'https://www.lufthansa.com/de/en/flight-disruptions';
const fixture = fs.readFileSync(new URL('./fixtures/jump-links-stacked-so20/flight-disruptions-links.html', import.meta.url), 'utf8').replace(/^<!--.*-->\n/, '');
const heads = (html) => {
  const page = `<div class="section"><div class=""><div class="section-content container-fluid section-regular"><div class="text section"><div class="richtext"><p>Intro</p></div></div>${html}</div></div></div>
    <div class="section"><div class=""><div class="section-content container-fluid section-regular"><div class="headline section"><h2 id="quickhelp">Rapid help in the event of delay</h2></div><div class="headline section"><h2 id="compensation">Compensation</h2></div><div class="headline section"><h2 id="app">Up to date with the app</h2></div><div class="headline section"><h2 id="faq">FAQs</h2></div></div></div></div>`;
  const { document } = parseHTML(`<html><head><title>Flight disruptions | Lufthansa</title></head><body><main><div class="container-content">${page}</div></main></body></html>`);
  const payload = {
    document, url: URL_FD, params: { originalURL: URL_FD }, template: { name: 'info', blocks: [] },
  };
  cleanup('beforeTransform', document.body, payload);
  cleanup('afterTransform', document.body, payload);
  return [...document.querySelectorAll('table th')].map((th) => th.textContent);
};

test('jump links in a ul.responsive: Jump Links (stacked)', () => {
  assert.deepEqual(heads(fixture).filter((h) => h.startsWith('Jump Links')), ['Jump Links (stacked)']);
});

test('in a ul.horizontal: the plain block, as before', () => {
  const horizontal = fixture.replace('<ul class="responsive"', '<ul class="horizontal"');
  assert.notEqual(horizontal, fixture, 'the fixture changed');
  assert.deepEqual(heads(horizontal).filter((h) => h.startsWith('Jump Links')), ['Jump Links']);
});

test('the block stacks the option below 768px only', () => {
  const css = fs.readFileSync(new URL('../blocks/jump-links/jump-links.css', import.meta.url), 'utf8');
  assert.match(css, /@media \(width < 768px\) \{\s*\.jump-links\.stacked \.jump-links-list \{\s*flex-direction: column;/);
});
