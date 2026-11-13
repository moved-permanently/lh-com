/* eslint-disable max-len, import/no-extraneous-dependencies, import/extensions -- dev tooling; linkedom is a dev dependency */
/* The brief after d9cf2340, item 2: lhg-history-alliances-and-joint-ventures' Joint Ventures cards have H4s in www's
   heading-medium (32 on 38 px lines, b2b-parity-003's recording, b2b-snapshots-001/-002: "headline heading-medium"),
   DA {heading-medium} on all four. The collapse lost them: an H4's default is heading-copytext-large, heading-medium two
   steps larger, and an H4 had no "large" choice (headingChoices), so neither the block's title option nor a section
   style could carry it ("a size without a choice of its level goes"). H4 now has H3's large choice (heading-medium)
   for every brand: in a block the block's title-large, out of blocks the section style h4-large.
   Input: the band as DA held it before the collapse (test/fixtures/b2b-partial-grid).
   Run: node --max-old-space-size=512 --test test/heading-h4-large-569.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';
import { collapseHtml } from '../tools/importer/marker-collapse.mjs';
import { themeFor, headingChoice, SECTION_STYLES } from '../scripts/style-markers.js';

const band = fs.readFileSync(new URL('./fixtures/b2b-partial-grid/lhg-history-alliances-band-da.html', import.meta.url), 'utf8').replace(/^<!--.*-->\n/, '');
const PATH = '/de/en/about-us/lhg-history/lhg-history-alliances-and-joint-ventures';

test('H4 has a large choice, heading-medium, for every brand (as H3\'s)', () => {
  ['b2b', 'lufthansa', 'swiss', 'discover'].forEach((b) => assert.equal(headingChoice(themeFor(b, 'flow'), 4, 'large'), 'heading-medium', b));
  assert.deepEqual(SECTION_STYLES['h4-large'], { headings: { h4: 'large' } });
});

test('lhg-history-alliances: the Joint Ventures block gets title-large, its H4s their mark gone', () => {
  const { html } = collapseHtml(band, { path: PATH, parse: parseHTML, brand: 'b2b' });
  const { document } = parseHTML(`<main>${html}</main>`);
  const block = document.querySelector('div.columns-media');
  assert.ok(block.classList.contains('title-large'), block.className);
  const h4 = [...block.querySelectorAll('h4')];
  assert.equal(h4.length, 4);
  assert.ok(h4.every((h) => !/\{/.test(h.textContent)), 'no marks left');
});

test('token-free draws the block\'s H4s in heading-medium', async () => {
  const { html } = collapseHtml(band, { path: PATH, parse: parseHTML, brand: 'b2b' });
  const { document } = parseHTML(`<html><head></head><body><main>${html}</main></body></html>`);
  globalThis.document = document;
  const { default: decorateTokenFree } = await import('../scripts/token-free.js');
  const main = document.querySelector('main');
  decorateTokenFree(main, { brand: 'b2b', path: PATH, read: (k) => (k === 'theme' ? 'flow-spacing' : '') });
  assert.ok([...main.querySelectorAll('.columns-media h4')].every((h) => h.classList.contains('heading-medium')));
});

test('out of blocks an H4 marked heading-medium gives its section h4-large', () => {
  const { html } = collapseHtml('<div><h4>Our Joint Ventures {heading-medium}</h4><p>Text</p></div>', { path: PATH, parse: parseHTML, brand: 'b2b' });
  assert.match(html, /<div>Style<\/div><div>h4-large<\/div>|h4-large/);
  assert.ok(!/\{heading-medium\}/.test(html));
});
