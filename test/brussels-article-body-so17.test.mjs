/* eslint-disable max-len */
/* Standing order 17, item 3 (Brussels P51 and the articles' bodies). The recorded articles (the-gambia, vibrant-senegal) at
   1440 were -3.68 / -3.45 % against brussels-parity-009, for two reasons:
   - the header picture (P51, held in order 16): lufthansa.com's article-header draws it 16:9; www sets no ratio on it from
     768 px and shows it at its own proportions (the recorded pictures 2:1): the title 84 / 85 px lower than www's. Phones
     keep 16:9, as www.
   - the galleries (six a page: one picture left, two stacked right, in a two-column view of the article card): www's column
     view has 40 px padding on top and 20 below, and its items 20 px margin below (.column-view.flex-column, .column-view-item),
     so the text above ends 60 px over the pictures and the text below starts 40 px under them; ours 20 and 20. Six a page:
     the bodies 417 / 461 px short with the picture fixed. From 768 px (at 390 the pages kept their totals without it).
   With both, at 1440 the-gambia 8,722 -> 8,993 px (www 9,055; -0.68 %), vibrant-senegal 10,511 -> 10,841 (www 10,887;
   -0.42 %), the titles at www's y; 390 unchanged. Reads brussels.css as written.
   Run: node --max-old-space-size=256 --test test/brussels-article-body-so17.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/brussels.css', import.meta.url), 'utf8');
const M = 'body.brand-brussels .article-header .article-header-media';
const G = 'body.brand-brussels main:has(.article-header) .columns-media.stacked';
const at = (sel) => css.indexOf(`  ${sel} {`);
const body = (sel) => {
  const i = at(sel);
  return i < 0 ? '' : css.slice(i, css.indexOf('}', i));
};
// the @media block a rule sits in (its opening line), '' when the rule is outside one
const mediaOf = (sel) => {
  const i = at(sel);
  const m = css.lastIndexOf('@media', i);
  if (i < 0 || m < 0 || css.slice(m, i).includes('\n}')) return '';
  return css.slice(m, css.indexOf('\n', m));
};

test('from 768 px the header picture at its own proportions', () => {
  assert.ok(at(M) > 0, 'the rule');
  assert.equal(mediaOf(M), '@media (width >= 768px) {');
  assert.match(body(M), /aspect-ratio: auto;/);
  assert.match(body(`${M} :is(picture, img)`), /height: auto;/);
});

test('from 768 px the article galleries 40 px from the text above and below, as www\'s column view', () => {
  assert.ok(at(G) > 0, 'the rule');
  assert.equal(mediaOf(G), '@media (width >= 768px) {');
  assert.match(body(G), /padding-block: 40px 20px;/);
});

test('phones as before: no such rule below 768 px', () => {
  const outside = css.replace(/@media \(width >= 768px\) \{[\s\S]*?\n\}/g, '');
  assert.ok(!outside.includes(`${M} {`));
  assert.ok(!outside.includes(`${G} {`));
});
