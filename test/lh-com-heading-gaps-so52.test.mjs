/* eslint-disable max-len */
/* Standing order 52 of 2026-11-17 (ema-adobe, hand-over items 18 and 19 of handover-so33-ema-test.txt), lufthansa.com
   shared stylesheet: the space above a heading where ours left less than www:
   - on hub phones, a heading-small h2 after a divider: 14px more (digital-self-services 390, 4 locales 7.0-7.2 -> 5.5-5.6);
   - from 768px, an h2 opening the section after a flush padded column view: 39px (frankfurt-fair 1440, 4 locales
     6.5-7.7 -> 4.5-5.6 %);
   - on phones, a campaign FAQ heading after Carousel Cards: 30px (speisen-und-getraenke, food-and-beverages 390);
   - from 768px, a heading-small h2 after the H1's intro paragraph: 66px (explore-the-world 1440 7.7 -> 5.5).
   Run: node --max-old-space-size=256 --test test/lh-com-heading-gaps-so52.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (f) => fs.readFileSync(new URL(`../${f}`, import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');

test('from 768px: 39px above an h2 opening the section after a flush padded column view', () => {
  assert.ok(read('styles/styles.css').includes('@media (width >= 768px) { body.brand-lufthansa main > .section.column-view.flush.padded:not(.grey) + .section:not(.grey, .padded, .stage, .spaced, .flush, .column-view, .column-band, .campaign-section) > .default-content-wrapper:first-child > h2:first-child { margin-top: 39px; } }'));
});

test('phones: 30px above a campaign section heading after Carousel Cards', () => {
  assert.ok(read('styles/styles.css').includes('@media (width < 768px) { body.brand-lufthansa main > .section.campaign-section.spaced:has(> .carousel-cards-wrapper:last-child) + .section.campaign-section.spaced > .default-content-wrapper:first-child > h2:first-child { margin-top: 30px; } }'));
});

test('from 768px: 66px above a heading-small h2 after the H1 intro, not on phones', () => {
  const css = read('styles/styles.css');
  assert.ok(css.includes('@media (width >= 768px) { body.brand-lufthansa main .default-content-wrapper > h1 + p + h2.heading-small { margin-top: 66px; } }'));
  assert.ok(!css.includes('@media (width < 768px) { body.brand-lufthansa main .default-content-wrapper > h1 + p + h2.heading-small'));
});

test('hubs on phones, not articles: 14px more above a heading-small h2 after a divider (hand-over item 19)', () => {
  assert.ok(read('styles/styles.css').includes('@media (width < 768px) { body.brand-lufthansa main:not(:has(.article-header)) p.spacer.divider + h2.heading-small { padding-top: 14px; } }'));
});

test('40px under a first section\'s stage picture before a column view of full-width text, not before a slider', () => {
  const css = read('styles/styles.css');
  assert.ok(css.includes('body.brand-lufthansa main > .section.breadcrumb-container:has(> .default-content-wrapper:last-child > p:last-child > picture):has(+ .section.column-view.flush.padded > .default-content-wrapper:first-child > p.full-width:first-child) { margin-bottom: 40px; }'));
  assert.ok(!css.includes(':has(+ .section.column-view.flush.padded) { margin-bottom: 40px; }'));
});
