/* eslint-disable max-len, import/extensions, import/no-extraneous-dependencies -- dev tooling; linkedom is a dev dependency */
/* Brief 505 (the token-free plan for TAP): tap-import.mjs runs no import bundle, so nothing collapsed its output; it
   wrote TAP's empty line <p><sub>{blank}</sub></p> (447 on preview, in 156 documents: Accordion Columns 268, Cards
   Teaser 102, Columns Media 69, Cards 8; no other marker). Now both TAP writers (tap-import.mjs, tap-markets.mjs) end
   with ema-test's marker collapse (collapseTap -> marker-collapse.mjs collapseHtml, brand tap), gated as the bundles
   (72026ccf): until TAP's theme is live the output is byte for byte as before; forced (a site's pass) no marker is left.
   tap.css then gives the paragraph pairs of card and accordion texts the gap that replaces the blank line (live only).
   Run: node --max-old-space-size=256 --test test/tap-collapse-505.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { collapseTap } from '../tools/importer/tap-import.mjs';
import { isThemeLive } from '../scripts/style-markers.js';

const DOC = '<div><h1>Navigator experiences</h1></div><div><div class="cards-teaser"><div><div><picture><img src="./media_1.jpg" alt=""></picture></div><div><h3>Lisbon by night</h3><p>A guided walk through Alfama.</p><p><sub>{blank}</sub></p><p>From 25,000 miles.</p></div></div></div></div>'
  + '<div><div class="accordion-columns"><div><div><p>How do I book?</p></div><div><p>Choose the experience.</p><p><sub>{blank}</sub></p><p>Then pay with miles.</p></div></div></div></div>';

test('TAP\'s theme not live: collapseTap gives the document back byte for byte', () => {
  assert.equal(isThemeLive('tap'), false, 'the switch is off in this release');
  assert.equal(collapseTap(DOC, '/en-pt/miles-and-go/promotions/navigator-experiences'), DOC);
  const plain = '<div><h1>Plain</h1><p>No marker here.</p></div>';
  assert.equal(collapseTap(plain, '/en-pt/plain'), plain);
});

test('forced (a site\'s pass): no marker left, the texts\' paragraphs kept', () => {
  const out = collapseTap(DOC, '/en-pt/miles-and-go/promotions/navigator-experiences', { force: true });
  assert.doesNotMatch(out, /\{[a-z][a-z0-9 ,:-]*\}/);
  assert.doesNotMatch(out, /<sub>/);
  ['A guided walk through Alfama.', 'From 25,000 miles.', 'Choose the experience.', 'Then pay with miles.'].forEach((t) => assert.ok(out.includes(`<p>${t}</p>`), t));
  assert.equal(collapseTap(out, '/en-pt/x', { force: true }), out, 'idempotent');
});

test('both TAP writers end with the collapse (the last step before the file is written)', () => {
  const src = (f) => fs.readFileSync(new URL(`../tools/importer/${f}`, import.meta.url), 'utf8');
  assert.match(src('tap-import.mjs'), /const write = \(doc, raw\) => \{[\s\S]*?const html = collapseTap\(raw, doc\);[\s\S]*?fs\.writeFileSync\(out, html\);/);
  assert.match(src('tap-markets.mjs'), /const write = \(doc, raw\) => \{[\s\S]*?const html = collapseTap\(raw, doc\);[\s\S]*?fs\.writeFileSync\(f, html\);/);
});

test('tap.css: the paragraph gap of card and accordion texts that replaces the blank line, for the live theme only', () => {
  const css = fs.readFileSync(new URL('../styles/themes/tap.css', import.meta.url), 'utf8').replace(/\s+/g, ' ');
  assert.match(css, /body\.brand-tap main:where\(\.theme-live \*\) :is\(\.cards-teaser, \.cards, \.columns-media\.feature, \.columns-media\.feature-small, \.accordion-columns\) p \+ p \{ margin-top: var\(--tap-paragraph-gap\); \}/);
  // today's gap + 12 px (the margins collapse: the value is the whole gap): cards-teaser 0, feature views 8, cards and accordions 24
  assert.match(css, /body\.brand-tap main:where\(\.theme-live \*\) \.cards-teaser \{ --tap-paragraph-gap: 12px; \}/);
  assert.match(css, /body\.brand-tap main:where\(\.theme-live \*\) :is\(\.columns-media\.feature, \.columns-media\.feature-small\) \{ --tap-paragraph-gap: 20px; \}/);
  assert.match(css, /body\.brand-tap main:where\(\.theme-live \*\) :is\(\.cards, \.accordion-columns\) \{ --tap-paragraph-gap: 36px; \}/);
  // nothing of it without the live theme
  assert.doesNotMatch(css.replace(/body\.brand-tap main:where\(\.theme-live \*\)[^{]*\{[^}]*\}/g, ''), /--tap-paragraph-gap/);
});
