/* eslint-disable max-len, import/no-extraneous-dependencies -- dev tooling; linkedom is a dev dependency */
/* Standing order 5 (2026-11-12), item 3: the legal template gets the column-view marks info and fleet have
   (lufthansa-cleanup.js COLUMN_MARK_TEMPLATES). 88 of its 120 pages hold their chapters in column views on www; without
   the marks each chapter heading sat 26 to 60 px higher than www's (/de/en/data-collection-canada 21.9 / 21.3 % off www
   at 1440 / 390; with the marks, as a draft on our host, 9.7 / 11.8). Re-import list:
   tools/reports/parity-2026-11-09/reimport-so5-legal-column-marks-lh-com.txt.
   Input: two chapter views of the Canada page's snapshot (test/fixtures/legal-column-marks-so5).
   Run: node --max-old-space-size=256 --test test/legal-column-marks-so5.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';
import transform from '../tools/importer/transformers/lufthansa-cleanup.js';

globalThis.WebImporter = { Blocks: { getMetadata: () => ({}), getMetadataBlock: (document) => document.createElement('table') } };

const URL_CA = 'https://www.lufthansa.com/de/en/data-collection-canada';
const chapters = fs.readFileSync(new URL('./fixtures/legal-column-marks-so5/canada-chapters.html', import.meta.url), 'utf8').replace(/^<!--.*-->\n/, '');

const marks = (template) => {
  const { document } = parseHTML(`<html><head><title>Entry requirements for Canada | Lufthansa</title></head><body><main><div class="container-content">${chapters}</div></main></body></html>`);
  const payload = {
    document, url: URL_CA, params: { originalURL: URL_CA }, template: { name: template, blocks: [] },
  };
  transform('beforeTransform', document.body, payload);
  transform('afterTransform', document.body, payload);
  return { found: document.body.textContent.match(/\{[a-z -]*column-(?:start|end)[a-z -]*\}/g) || [], document };
};

test('legal: each chapter view of the Canada page gets its start and end marks, the headings keep their text', () => {
  const { found, document } = marks('legal');
  assert.equal(found.filter((m) => /column-start/.test(m)).length, 2, found.join(' '));
  assert.equal(found.filter((m) => /column-end/.test(m)).length, 2, found.join(' '));
  const heads = [...document.querySelectorAll('h2')].map((h) => h.textContent.replace(/\s*\{[^}]*\}\s*$/, '').trim());
  assert.deepEqual(heads, ['API data collection', 'ArriveCAN app']);
});

test('main\'s other templates as before: info marks the same views, hub none', () => {
  assert.equal(marks('info').found.length, marks('legal').found.length);
  assert.equal(marks('hub').found.length, 0);
});

// the app-entry template too (20 of its 24 pages hold their chapters in column views: /de/en/my-logbook 20.7 / 27.2 % off
// www at 1440 / 390, with the marks 7.5 / 10.4 as drafts on our host; reimport-so5-app-entry-column-marks-lh-com.txt)
test('app-entry: the same views get the same marks', () => {
  assert.deepEqual(marks('app-entry').found, marks('legal').found);
});
