/* eslint-disable max-len, import/no-extraneous-dependencies -- dev tooling; linkedom is a dev dependency */
/* Standing order 20 (2026-11-14), item 2: www's blank lines from <br> runs in a rich-text paragraph
   (/de/en/wheelchair-batteries: "<p><br> <br> The following conditions…" and "approval is required.<br> <br> <br> The
   following…": two blank lines each, the page 54px shorter there on ours at 1440 and 390). The framework keeps at most a
   line break. onLoad notes the run on the paragraph after it (a run inside splits the paragraph), beforeTransform writes
   "{spacer-(27 x n)}" before it on the column-mark templates; elsewhere, and in panels, as before.
   Inputs: two text components of the wheelchair-batteries snapshot (test/fixtures/br-lines-so20).
   Run: node --max-old-space-size=256 --test test/br-lines-so20.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';
import transform from '../tools/importer/transformers/lufthansa-cleanup.js';

globalThis.WebImporter = { Blocks: { getMetadata: () => ({}), getMetadataBlock: (document) => document.createElement('table') } };

const URL_WB = 'https://www.lufthansa.com/de/en/wheelchair-batteries';
const fx = (name) => fs.readFileSync(new URL(`./fixtures/br-lines-so20/${name}`, import.meta.url), 'utf8').replace(/^<!--.*-->\n/, '');
const run = (html, template = 'info') => {
  const page = `<div class="section"><div class=""><div class="section-content container-fluid section-regular"><div class="headline section"><h2>Wheelchairs</h2></div>${html}</div></div></div>`;
  const { document } = parseHTML(`<html><head><title>Wheelchair batteries | Lufthansa</title></head><body><main><div class="container-content">${page}</div></main></body></html>`);
  const payload = {
    document, url: URL_WB, params: { originalURL: URL_WB }, template: { name: template, blocks: [] },
  };
  transform('onLoad', document.body, payload);
  // helix-importer's preprocessing between onLoad and the transforms: it drops empty paragraphs
  [...document.querySelectorAll('p')].filter((p) => !(p.textContent || '').replace(/[\s\u00a0]/g, '') && !p.querySelector('img, picture')).forEach((p) => p.remove());
  transform('beforeTransform', document.body, payload);
  transform('afterTransform', document.body, payload);
  return [...document.querySelectorAll('body p')].map((p) => p.textContent.replace(/\s+/g, ' ').trim()).filter(Boolean);
};

test('a run before the text: two lines, {spacer-54} before the paragraph', () => {
  const t = run(fx('wheelchair-batteries-text.html'));
  const i = t.findIndex((x) => x.startsWith('The following conditions'));
  assert.ok(i > 0, JSON.stringify(t));
  assert.equal(t[i - 1], '{spacer-54}');
});

test('three <br> inside a paragraph: split, {spacer-54} before the rest', () => {
  const t = run(fx('wheelchair-batteries-inner.html'));
  const i = t.findIndex((x) => x.startsWith('The following conditions'));
  assert.ok(i > 1, JSON.stringify(t));
  assert.equal(t[i - 1], '{spacer-54}');
  assert.match(t[i - 2], /approval is required\.$/);
});

test('not on templates without column marks', () => {
  assert.ok(!run(fx('wheelchair-batteries-text.html'), 'hub').some((x) => /^\{spacer-54\}$/.test(x)));
});

test('a single <br> before the text: as before (nothing on www: the Insights imprint)', () => {
  const one = '<div class="text section"><div class="richtext"><p>Editor</p><p><br> Head of Editorial</p></div></div>';
  const t = run(one);
  assert.ok(!t.some((x) => x.startsWith('{spacer-')), JSON.stringify(t));
});
