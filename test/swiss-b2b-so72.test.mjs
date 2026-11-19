/* Standing order 72 (SWISS and Group for Business themes, token-free):
   - Item 1: Group for Business only a five-column table fills the 840 px box from
     768 px (www's maui-table draws the others at their own height, b2b-parity-018).
   - Item 2: SWISS the column 96 / 76 px under the lead when it is split into parts;
     from 1025 px a tab set 24 px under the lead; from 1025 px the H3 that opens a
     card row in the column 52 px under the running text.
   - Item 1's phone tables: Group for Business table cells at least 200 px wide below
     768 px (www's maui-table cells).
   - Item 3: Group for Business a stacked text's button 11 px above its own picture
     on phones; SWISS usp teasers as www's teaser-heading.
   Strings only in assertions (no DOM node goes into one).
   Run: node --max-old-space-size=256 --test test/swiss-b2b-so72.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (f) => fs.readFileSync(new URL(f, import.meta.url), 'utf8');
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const swiss = read('../styles/themes/swiss.css');
const b2b = read('../styles/themes/b2b.css');

test('b2b.css: the 840 px table box only for a five-column table', () => {
  const sel = 'body.brand-b2b main .table-striped:not(.beside, .beside-end, .columns, .matrix):has(> table tr:first-child > :nth-child(5))';
  assert.match(b2b, new RegExp(`@media \\(width >= 768px\\) \\{\\s*${esc(sel)} \\{\\s*height: 840px;\\s*\\}\\s*${esc(sel)} > table \\{\\s*height: 100%;`));
  assert.doesNotMatch(b2b, /\.matrix\) > table \{\s*height: 100%;/);
});

test('b2b.css: phone table cells at least 200 px wide, not five-column or header-row tables', () => {
  const sel = 'body.brand-b2b main .table-striped:not(.beside, .beside-end, .columns, .matrix, .header, :has(> table tr:first-child > :nth-child(5))) > table';
  assert.match(b2b, new RegExp(`@media \\(width < 768px\\) \\{\\s*${esc(sel)} \\{\\s*width: auto;\\s*min-width: 100%;\\s*table-layout: auto;\\s*\\}\\s*${esc(sel)} :is\\(th, td\\) \\{\\s*min-width: 200px;`));
});

test('b2b.css: a stacked text\'s button 11 px above its own picture below 768 px', () => {
  const sel = 'body.brand-b2b main .columns-media .columns-media-row > .columns-media-text:not(:last-child):has(> p.button-wrapper:last-child):has(+ .columns-media-media picture)';
  assert.match(b2b, new RegExp(`@media \\(width < 768px\\) \\{\\s*${esc(sel)} \\{\\s*margin-bottom: 11px;`));
});

test('swiss.css: the split column under the lead, the tab set under the lead, the card row heading', () => {
  const lead = 'body.brand-swiss main > .section:has(> .default-content-wrapper:last-child > h1 + p.copytext-large:last-child)';
  const parts = `${lead} + .section.with-aside:has(> .section-part:first-child > .default-content-wrapper:first-child > h2:first-child)`;
  assert.match(swiss, new RegExp(`\\*/\\n${esc(parts)} \\{\\s*margin-top: 76px;\\s*\\}\\n\\n@media \\(width >= 768px\\) \\{\\s*${esc(parts)} \\{\\s*margin-top: 96px;`));
  assert.match(swiss, new RegExp(`@media \\(width >= 1025px\\) \\{\\s*${esc(`${lead}:has(+ .section.section-tabs + .section:not(.embed-container))`)} \\{\\s*margin-bottom: 24px;`));
  const card = 'body.brand-swiss main > .section.with-aside .default-content-wrapper:has(+ .columns-media-wrapper) > p + h3:last-child';
  assert.match(swiss, new RegExp(`@media \\(width >= 1025px\\) \\{\\s*${esc(card)} \\{\\s*margin-top: 52px;`));
});

test('swiss.css: the column 100 px under a stage that is not flush, from 1025 px', () => {
  assert.match(swiss, /@media \(width >= 1025px\) \{\s*body\.brand-swiss main > \.section\.stage:not\(\.flush\) \+ \.section\.with-aside \{\s*margin-top: 100px;/);
});

test('swiss.css: the usp teaser title the full width, its own line height, 12 px under it', () => {
  assert.match(swiss, /\.carousel-cards\.usp:is\(\.grid, \.four-up\) \.carousel-cards-slide:not\(\.carousel-cards-text-only, \.carousel-cards-wide\) \.carousel-cards-body:not\(:has\(> \.carousel-cards-cta:last-child\)\) \{\s*padding-bottom: 20px;\s*padding-inline: 0;/);
  assert.match(swiss, /\.carousel-cards\.usp \.carousel-cards-body :is\(h1, h2, h3, h4, h5, h6\) a:any-link \{\s*color: inherit;\s*text-decoration: none;\s*vertical-align: top;/);
  assert.match(swiss, /\.carousel-cards\.usp:is\(\.grid, \.four-up\) \.carousel-cards-track:has\(> \.carousel-cards-slide:not\(\.carousel-cards-text-only\)\) > \.carousel-cards-slide:not\(\.carousel-cards-text-only\) \.carousel-cards-body > :is\(h1, h2, h3, h4, h5, h6\) \{\s*margin-bottom: 12px;/);
});

test('the new rules: no nested :has', () => {
  [swiss, b2b].forEach((css) => css.split('\n').filter((l) => l.includes('standing order 72') || l.includes('nth-child(5)') || l.includes('section-part:first-child')).forEach((l) => assert.doesNotMatch(l, /:has\([^)]*:has\(/)));
});
