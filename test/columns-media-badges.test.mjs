/* blocks/columns-media: the linked badge images of a text paragraph (the app store badges on
   /online-check-in: two linked pictures in one paragraph) are 40 px high side by side from 768 px.
   The rule took any linked picture in a paragraph that is not the cell's first, so the airline
   apps' icons on /de/en/book-and-manage/digital-self-services/airline-apps (one linked picture
   after the heading) shrank to 48 x 40 px from 768 px (www: full width; the worst page-width of the
   2026-11-06 parity summary at 768, 45 %). Now a linked picture right after the cell's opening
   heading is the cell's picture, as one that opens the cell (only the airline apps pages have it).
   Run: node --test test/columns-media-badges.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../blocks/columns-media/columns-media.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');

test('a linked picture after the cell\'s opening heading is no badge', () => {
  const m = css.match(/@media \(width >= 768px\) \{(?:(?!@media).)*/g).join(' ');
  const P = '.columns-media .columns-media-text p:not(:first-child, :is(h1, h2, h3, h4, h5, h6):first-child + p)';
  assert.ok(m.includes(`${P}:has(> a > picture) { flex-flow: row wrap; gap: var(--grid-gutter); }`));
  assert.ok(m.includes(`${P} > a:has(> picture) { width: auto; }`));
  assert.ok(m.includes(`${P} > a > picture img { width: auto; height: 40px; }`));
});
