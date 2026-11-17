/* eslint-disable max-len, import/no-extraneous-dependencies, import/extensions -- dev tooling; linkedom is a dev dependency */
/* Standing order 44 of 2026-11-17 (token-free content): the Brussels, ITA and Discover importers and their collapse put no
   style token into a document. 6926f76b had the Brussels import write www's empty paragraphs (and the older empty lines)
   as {spacer-N}, kept by THEMES.brussels textSpacers; a63e8fe2 had the ITA import mark column-view H2s " {heading-medium}",
   kept by THEMES.ita keepSizesIn; 4d295672 had Discover keep {heading-copytext-large} (THEMES.discover keepSizes). Now:
   - none of those writers or keep rules is left;
   - the collapse of a document that still holds such a marker leaves none of them (marker to carrier or nothing);
   - the collapse rows for the live documents (delta-so44-*-token-free.json) remove markers only, add no token.
   Run: node --test test/token-free-importers-so44.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';
import { collapseHtml } from '../tools/importer/marker-collapse.mjs';
import { themeFor } from '../scripts/style-markers.js';

const src = (f) => fs.readFileSync(new URL(`../tools/importer/${f}`, import.meta.url), 'utf8');
const R = '../tools/reports/parity-2026-11-09/';
const TOKEN = /\{(spacer|divider|heading|copytext|column-start|column-end)[^}]*\}|(below|from)-768/;

test('the writers are gone from the brand importers', () => {
  assert.doesNotMatch(src('brussels-import.mjs'), /emptyLineSpacers|emptyParagraphSpacers|withEmptyParagraphSpacers|withEmptyLineSpacers/);
  assert.doesNotMatch(src('ita-import.mjs'), /withColumnViewHeadingSizes|\{heading-medium\}/);
});

test('no keep rule leaves these markers: Brussels textSpacers, ITA keepSizesIn, Discover keepSizes', () => {
  assert.equal(Boolean(themeFor('brussels').textSpacers), false);
  assert.equal(themeFor('ita').keepSizesIn, undefined);
  assert.equal(themeFor('discover').keepSizes, undefined);
});

const run = (html, brand, path) => collapseHtml(html, {
  path, brand, parse: parseHTML, force: true,
}).html;

test('the collapse leaves none of these markers on the three brands', () => {
  const bru = run('<div><h1>T</h1><p>a</p><p>{spacer-17}</p><p>b</p><p>{spacer-40}</p><h2>H</h2><p>c</p></div>', 'brussels', '/be/en/x');
  assert.doesNotMatch(bru, /\{spacer-/);
  const ita = run('<div><h1>C</h1><div class="columns-media padded"><div><div><h2>Albania {heading-medium}</h2><p>p</p></div><div><h2>B {heading-small}</h2><p>q</p></div></div></div></div>', 'ita', '/it/en/support/utilities/contact');
  assert.doesNotMatch(ita, /\{heading-(medium|small)\}/);
  const dis = run('<div><h1>T</h1><h2>Useful {heading-copytext-large}</h2><p>x</p><div class="columns-media"><div><div><h3>Seats {heading-copytext-large}</h3><p>y</p></div></div></div></div>', 'discover', '/de/en/x');
  assert.doesNotMatch(dis, /\{heading-copytext-large\}/);
});

test('the collapse rows remove markers only: no row adds a token', () => {
  ['brussels', 'ita', 'discover'].forEach((b) => {
    const data = JSON.parse(fs.readFileSync(new URL(`${R}delta-so44-${b}-token-free.json`, import.meta.url), 'utf8'));
    assert.ok(Object.keys(data).length > 0, b);
    Object.values(data).flat().forEach((r) => {
      assert.match(r.from, TOKEN, `${b}: a row removes a marker`);
      assert.doesNotMatch(r.to, TOKEN, `${b}: and writes no token`);
      assert.ok(r.count >= 1);
    });
  });
});
