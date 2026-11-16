/* eslint-disable max-len */
/* Standing order 38 of 2026-11-16, items 2 and 3 (delta-so38-lh-com-rows.txt):
   - the dangerous-goods symbol legend in www's two columns, its titles 18px on 21px lines, from 768px
     (gefaehrliche-gegenstaende 1440 9.76 -> 7.29 %);
   - a text cell's linked picture right under its heading: no 55px badge margin, 38px under it, its links 5px taller
     (airline-apps 390 9.41 -> 4.11 %, 1440 4.19 -> 2.19 %).
   Run: node --max-old-space-size=256 --test test/lh-com-shared-so38.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (f) => fs.readFileSync(new URL(`../${f}`, import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const LEGEND = 'body.brand-lufthansa main > .section.column-band.grey .cards-icon-text.partner > ul:has(> li:nth-child(7):last-child):not(:has(.cards-icon-text-body > :not(.cards-icon-text-title)))';

test('the symbol legend: two columns down, 18 / 21px titles from 768px', () => {
  const css = read('styles/styles.css');
  assert.ok(css.includes(`@media (width >= 768px) { ${LEGEND} { display: block; width: calc((100% - 40px) / 3 * 2 + 20px); columns: 2; column-gap: 20px; }`));
  assert.ok(css.includes(`${LEGEND} > li { break-inside: avoid; margin-bottom: 12px; }`));
  assert.ok(css.includes(`${LEGEND} .cards-icon-text-title { margin-bottom: 0; font-size: 18px; line-height: 21px; } }`));
});

test('a linked picture under a text cell heading', () => {
  const css = read('blocks/columns-media/columns-media.css');
  assert.ok(css.includes('body.brand-lufthansa .columns-media .columns-media-text > :is(h2, h3, h4) + p:has(> a > picture) { margin-top: 0; margin-bottom: 38px; }'));
  assert.ok(css.includes('body.brand-lufthansa .columns-media .columns-media-text:has(> :is(h2, h3, h4) + p > a > picture) > p.link-wrapper:not(.copytext-small, .copytext-medium, .copytext-large) { padding-bottom: 5px; }'));
});

test('Accordion Columns option rich-lists', () => {
  const css = read('blocks/accordion-columns/accordion-columns.css');
  assert.ok(css.includes('body.brand-lufthansa .accordion-columns.rich-lists .accordion-columns-intro > ul { padding-left: 28px; list-style-position: outside; }'));
  assert.ok(css.includes('body.brand-lufthansa .accordion-columns.rich-lists .accordion-columns-intro > ul > li + li { margin-top: 10px; }'));
  assert.ok(css.includes('@media (width >= 1025px) { body.brand-lufthansa main:has(.subpage-nav) .accordion-columns.rich-lists .accordion-columns-intro > :is(p, ul, ol) { max-width: none; } }'));
});
