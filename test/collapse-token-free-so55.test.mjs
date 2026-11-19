/* eslint-disable max-len, import/no-extraneous-dependencies, import/extensions -- dev tooling; linkedom is a dev dependency */
/* Standing order 55 of 2026-11-17 (token-free content, Ben: "if the content isn't token-free, that's a miss"): the collapse
   leaves no separator marker in a document on any brand. 3771d3a3 had Discover keep a separator of 31 px or less between
   two components as {spacer-N} (componentSpacers), an earlier change had Brussels keep one between running text and a
   heading (textSpacers); both are near values now and go. A phone-only run ({spacer-N below-768}, 4c010541) becomes the
   Spacer block's option, never a marker.
   Run: node --max-old-space-size=512 --test test/collapse-token-free-so55.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';
import { collapseHtml } from '../tools/importer/marker-collapse.mjs';
import { THEMES } from '../scripts/style-markers.js';

const accordion = '<div class="accordion-columns faq"><div><div>Q</div><div><p>A.</p></div></div></div>';
const SEP = /\{(?:spacer|divider)-\d+[^}]*\}/;
const run = (html, brand) => collapseHtml(html, { path: '/xx/en/page', brand, parse: parseHTML, force: true }).html;
const brands = Object.keys(THEMES);

test('no theme keeps small separators as markers', () => {
  brands.forEach((b) => {
    assert.equal(Boolean(THEMES[b].textSpacers), false, `${b} textSpacers`);
    assert.equal(Boolean(THEMES[b].componentSpacers), false, `${b} componentSpacers`);
  });
});

test('every brand: a separator of 31 px or less between text, before a heading, between components goes', () => {
  const html = `<div><h1>T</h1><p>One.</p><p>{spacer-17}</p><p>Two.</p><p>{spacer-28}</p><h2>H</h2><p>x</p>${accordion}<p>{spacer-30}</p>${accordion}<p>y</p></div>`;
  brands.forEach((b) => {
    const out = run(html, b);
    assert.equal(SEP.test(out), false, `${b}: ${(out.match(SEP) || [])[0]}`);
  });
});

test('every brand: in a block cell a small separator before a heading goes', () => {
  const cell = '<div><div class="accordion-columns faq"><div><div>Article 2</div><div><p>2.1. Text.</p><p>{spacer-11}</p><h3>Charters</h3><p>2.2.</p></div></div></div></div>';
  brands.forEach((b) => assert.equal(SEP.test(run(cell, b)), false, b));
});

test('a phone-only run is the Spacer block option below-768, no marker', () => {
  const out = run('<div><h1>T</h1><p>One.</p><p>{spacer-60 below-768}</p><p>Two.</p></div>', 'lufthansa');
  assert.equal(SEP.test(out), false, out.slice(0, 200));
  // lufthansa.com's near-value step for 60 (standing order 59): M+
  assert.equal(/class="spacer( m-plus)? below-768"/.test(out), true, out.slice(0, 300));
});
