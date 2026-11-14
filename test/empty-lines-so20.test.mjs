/* eslint-disable max-len, import/no-extraneous-dependencies -- dev tooling; linkedom is a dev dependency */
/* Standing order 20 (2026-11-13), item 1: www's visible empty line, a paragraph of only no-break spaces between two text
   paragraphs or lists of one rich text (/de/en/passenger-rights after the compensation list, /de/en/wheelchair-batteries
   twice): a line and a paragraph margin on www, 56px at 1440 and 390 (www's measurements: "Cancellation" 57px higher on
   ours, 5 with it). The framework dropped it; the cleanup writes "{spacer-56}" now (the column-mark templates: info,
   legal, fleet, app-entry). Not in accordion or tab panels (nothing shows there at 1440, the brief after 530), not at a
   rich text's start or end, not next to another empty line. The info and legal snapshots with one: 8 documents.
   helix-importer drops empty paragraphs between onLoad and beforeTransform: onLoad marks the text before the line, and
   the test drops them as the import does.
   Input: passenger-rights' text component (test/fixtures/empty-lines-so20).
   Run: node --max-old-space-size=256 --test test/empty-lines-so20.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';
import transform from '../tools/importer/transformers/lufthansa-cleanup.js';

globalThis.WebImporter = { Blocks: { getMetadata: () => ({}), getMetadataBlock: (document) => document.createElement('table') } };

const URL_PR = 'https://www.lufthansa.com/de/en/passenger-rights';
const fixture = fs.readFileSync(new URL('./fixtures/empty-lines-so20/passenger-rights-text.html', import.meta.url), 'utf8').replace(/^<!--.*-->\n/, '');
const run = (html, template = 'legal') => {
  const page = `<div class="section"><div class=""><div class="section-content container-fluid section-regular"><div class="headline section"><h2>Overbooking</h2></div>${html}</div></div></div>`;
  const { document } = parseHTML(`<html><head><title>Passenger rights | Lufthansa</title></head><body><main><div class="container-content">${page}</div></main></body></html>`);
  const payload = {
    document, url: URL_PR, params: { originalURL: URL_PR }, template: { name: template, blocks: [] },
  };
  transform('onLoad', document.body, payload);
  // helix-importer's preprocessing between onLoad and the transforms: it drops empty paragraphs
  [...document.querySelectorAll('p')].filter((p) => !(p.textContent || '').replace(/[\s\u00a0]/g, '') && !p.querySelector('img, picture')).forEach((p) => p.remove());
  transform('beforeTransform', document.body, payload);
  transform('afterTransform', document.body, payload);
  const all = [...document.querySelectorAll('body *')].filter((e) => !e.children.length && e.textContent.trim());
  return all.map((e) => e.textContent.trim());
};

test('the empty line after the list: {spacer-56} between the list and the next paragraph', () => {
  const t = run(fixture);
  const i = t.indexOf('{spacer-56}');
  assert.ok(i > 0, JSON.stringify(t.slice(-6)));
  assert.match(t[i - 1], /compensation amounts to €400\.00/);
  assert.match(t[i + 1], /^The distance is calculated/);
});

test('not in a panel, not on templates without column marks, not at the text\'s end', () => {
  const panel = `<div class="accordion"><div class="accordionitem">${fixture}</div></div>`;
  assert.ok(!run(panel).includes('{spacer-56}'));
  assert.ok(!run(fixture, 'hub').includes('{spacer-56}'));
  const atEnd = fixture.replace(/<p>&nbsp;<\/p>[\s\S]*<\/div> <\/div>\s*$/, '<p>&nbsp;</p></div> </div>');
  assert.notEqual(atEnd, fixture, 'the fixture changed');
  assert.ok(!run(atEnd).includes('{spacer-56}'));
});
