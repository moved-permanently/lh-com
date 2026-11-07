/* eslint-disable max-len */
/* Brief 456 (lufthansa.com parity, info): an h3 in a columns-media cell without a heading marker is
   www's default h3 (h3.headline.heading-copytext-large: 24 px bold, 24 px below). The rule of
   2026-10-22 made every unmarked h3 there 28 px light (heading-small) for documents imported before
   the heading markers; since then the importer marks a heading-small h3 ({heading-small}, /baggage,
   /online-check-in), so an unmarked one is the default. Measured on 45 de/en pages: all 41 unmarked
   column h3s are 24 px on www (26 px high at 1440, 22 at 390); ours rendered 24 of them at 28 px.
   lufthansa.com only (body.brand-lufthansa): the brand sites' importers write no heading markers;
   not on Insights articles (main:has(.article-header): ema-adobe's template, to be sequenced).
   Run: node --test test/columns-media-h3-default-456.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../blocks/columns-media/columns-media.css', import.meta.url), 'utf8').replace(/\s+/g, ' ');

test('lufthansa.com: an unmarked column h3 is 24 px bold with 24 px below, as the global h3', () => {
  assert.match(css, /body\.brand-lufthansa main:not\(:has\(\.article-header\)\) \.columns-media \.columns-media-text h3:not\(\[class\*="heading-"\], :has\(> picture\)\) \{ margin-bottom: var\(--spacing-default\); font-size: var\(--heading-font-size-m\); font-weight: 700; \}/);
});

test('lufthansa.com: a column h3 marked heading-copytext-large keeps 24 px below (not the 32 px of the column rule)', () => {
  assert.match(css, /body\.brand-lufthansa main:not\(:has\(\.article-header\)\) \.columns-media \.columns-media-text h3\.heading-copytext-large:not\(:has\(> picture\)\) \{ margin-bottom: var\(--spacing-default\); \}/);
});

// an icon heading (a.teaser.partner: picture in the heading) keeps its own 10 px below (the rule
// above outranked it: advance-seat-reservations-terms-and-conditions 69 px taller, 10.2 -> 15.3 %)
test('an icon heading keeps the icon-heading rule (10 px below)', () => {
  assert.match(css, /\.columns-media \.columns-media-row > \.columns-media-text :is\(h3, h4\):has\(> picture\) \{ position: relative; margin-bottom: 10px;/);
});

test('the brand sites keep the column h3 as before (28 px light, 32 px below)', () => {
  assert.match(css, /\.columns-media \.columns-media-text h3 \{ margin-bottom: var\(--heading-margin-l\); \}/);
  assert.match(css, /\.columns-media \.columns-media-text h3:not\(\[class\*="heading-"\]\) \{ font-size: var\(--heading-font-size-l\); font-weight: 300; \}/);
});
