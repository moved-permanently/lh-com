/* eslint-disable max-len */
/* Standing order 18, item 4 (Austrian row 56 from 768 px, carried over from order 16): accessible-travel's partner link
   tiles (cards-icon-text partner without text). www's .teaser.partner box is the same at every width (app.css: padding
   2.15rem 2.4rem 3.6rem, the heading 1.8rem above the box's end), the heading copytext-large at the heading-small size
   (28 / 30.8 px at 1440, austrian-parity-015), the tiles 34.5 px apart row to row (245 px pitch at 1440 with four-line
   titles), the first row 115 px under the picture above. Ours from 768 px: lufthansa.com's rows 125 px apart, titles
   24 / 26.4 px, 24 px under the picture: the page 2.44 % short at 1440. Phones keep row 56's rules. Each row of four is
   a block of its own, so the space above the first block and between blocks are separate rules. Reads austrian.css
   as written.
   Run: node --max-old-space-size=256 --test test/austrian-partner-tiles-768-so18.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/austrian.css', import.meta.url), 'utf8').replace(/\s+/g, ' ');
const LI = 'body.brand-austrian main .cards-icon-text.partner > ul > li:not(:has(.cards-icon-text-body > p))';

test('from 768 px the tiles as www\'s boxes: 33.5 / 24 / 36 px, the title at the heading-small size, 18 px over the box\'s end', () => {
  const at = css.indexOf('@media (width >= 768px) { body.brand-austrian main :not(.cards-icon-text-wrapper) + .cards-icon-text-wrapper > .cards-icon-text.partner');
  assert.ok(at > 0, 'the media block');
  const block = css.slice(at, css.indexOf(' } }', at) + 4);
  assert.ok(block.includes(`${LI} > .cards-icon-text-card { padding: 33.5px 24px 36px; }`));
  assert.ok(block.includes(`${LI} .cards-icon-text-title { margin-bottom: 18px; font-size: var(--heading-font-size-l); line-height: var(--heading-line-height); }`));
  assert.ok(block.includes('body.brand-austrian main .cards-icon-text.partner > ul:not(:has(.cards-icon-text-body > p)) { row-gap: 34.5px; }'));
  assert.ok(block.includes('body.brand-austrian main :not(.cards-icon-text-wrapper) + .cards-icon-text-wrapper > .cards-icon-text.partner:not(:has(.cards-icon-text-body > p)) { margin-top: 90px; }'));
  assert.ok(block.includes('body.brand-austrian main .cards-icon-text-wrapper + .cards-icon-text-wrapper > .cards-icon-text.partner:not(:has(.cards-icon-text-body > p)) { margin-top: 34.5px; }'));
});

test('phones: row 56\'s rules as they were', () => {
  assert.ok(css.includes(`@media (width < 768px) { body.brand-austrian main .cards-icon-text.partner > ul:not(:has(.cards-icon-text-body > p)) { row-gap: 0; } ${LI} { margin-bottom: 56px; }`));
});

// standing order 19, item 4: on phones the first row 94 px under the block above as well (www: the first title 128 px
// under the picture at 390, ours 58): accessible-travel 390 -2.52 -> -2.16 %, the other 60 recorded pages unchanged
test('phones: the first row of tiles 94 px under the block above', () => {
  assert.ok(css.includes('@media (width < 768px) { body.brand-austrian main :not(.cards-icon-text-wrapper) + .cards-icon-text-wrapper > .cards-icon-text.partner:not(:has(.cards-icon-text-body > p)) { margin-top: 94px; } }'));
});
