/* eslint-disable max-len */
/* Standing order 26, item 1: Austrian's column views at 390 with an empty last item, and the end of a page whose last AEM
   section has no space below (www: no .mb-default, the importer's and the documents' "flush").
   - Below 768 px www gives every column-view item 12 px of padding above and 12 px of margin below, an empty one too, so
     an empty last item keeps the space under the item before it (44 px). Ours hid the empty cell and took the margin
     off the cell before it: Austrian keeps that cell's stacked spacing (text 36, media 50).
   - A page that ends with a column view ends on www with the view's 32 px, plus 36 px when its AEM section has
     .mb-default. Ours ends with the padded block's 8 px and the section gap: a flush last section keeps 24 px of it
     (book/flights). Without "flush" the section gap stays (special-requirements, overview-extra-services: .mb-default).
   Run: node --max-old-space-size=256 --test test/austrian-column-view-end-so26.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/austrian.css', import.meta.url), 'utf8').replace(/\s+/g, ' ');

// the rules of every block of one media query: each from its opening to the next "@media" or the end
const mediaBlock = (query) => {
  const parts = [];
  let i = css.indexOf(`@media ${query} {`);
  while (i >= 0) {
    const j = css.indexOf('@media', i + 1);
    parts.push(css.slice(i, j < 0 ? css.length : j));
    i = css.indexOf(`@media ${query} {`, i + 1);
  }
  return parts.join(' ');
};

test('below 768 px the text cell before an empty last cell keeps its 36 px (Austrian)', () => {
  assert.ok(mediaBlock('(width < 768px)').includes('body.brand-austrian main .columns-media .columns-media-row > .columns-media-text:has(+ div:empty:last-child) { margin-bottom: 36px; }'));
});

test('below 768 px the media cell before an empty last cell keeps its 50 px (Austrian)', () => {
  assert.ok(mediaBlock('(width < 768px)').includes('body.brand-austrian main .columns-media .columns-media-row > .columns-media-media:has(+ div:empty:last-child) { margin-bottom: 50px; }'));
});

test('a flush last section that ends with a padded columns-media block: 24 px below it (the view\'s 32 with the block\'s 8)', () => {
  assert.ok(css.includes('body.brand-austrian main > .section.flush:last-child:not(.grey):has(> .columns-media-wrapper:last-child > .columns-media.padded) { margin-bottom: 24px; }'));
});

test('no shorter end without flush (www keeps .mb-default\'s 36 px there)', () => {
  assert.ok(!css.includes('body.brand-austrian main > .section:last-child:has(> .columns-media-wrapper:last-child > .columns-media.padded) {'));
});
