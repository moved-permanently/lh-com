/* eslint-disable max-len */
/* Standing order 16, item 2 (Austrian row 56): accessible-travel at 390 (-6.85 % against austrian-parity-015). Its link
   tiles (cards-icon-text partner four-up: an icon and a title, no text) are www's .teaser.partner boxes: on phones
   21.5 px of padding over the title plus the column item's 12, 24 px at the sides, 36 below, the title 18 px over the
   box's end, 44 + 12 px to the next tile: the recorded titles 167 / 168 px apart (one line) and 192 (two lines), at x 91
   (ours 78 px apart, at x 73). Below 768 px a partner tile without a paragraph is drawn so; from 768 px as before (no
   model of www's taller rows there yet), and the icon steps with text (giftvoucher, row 40) as before.
   Reads austrian.css as written.
   Run: node --max-old-space-size=256 --test test/austrian-partner-tiles-so16.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/austrian.css', import.meta.url), 'utf8');
const LI = 'body.brand-austrian main .cards-icon-text.partner > ul > li:not(:has(.cards-icon-text-body > p))';
const at = (sel) => css.indexOf(`  ${sel} {`);
const body = (sel) => {
  const i = at(sel);
  return i < 0 ? '' : css.slice(i, css.indexOf('}', i));
};

test('below 768 px: the tile padded as www\'s box, 56 px to the next', () => {
  const i = at(`${LI} > .cards-icon-text-card`);
  assert.ok(i > 0, 'the rule');
  assert.match(css.slice(css.lastIndexOf('@media', i), i), /@media \(width < 768px\)/);
  assert.match(body(`${LI} > .cards-icon-text-card`), /padding: 33\.5px 24px 36px;/);
  assert.match(body(LI), /margin-bottom: 56px;/);
  assert.match(body('body.brand-austrian main .cards-icon-text.partner > ul:not(:has(.cards-icon-text-body > p))'), /row-gap: 0;/);
  assert.match(body(`${LI} .cards-icon-text-title`), /margin-bottom: 18px;/);
});

test('scoped: tiles with text keep their rule; before the online-check-in parts; no :has in a :has', () => {
  assert.ok(css.includes('body.brand-austrian .cards-icon-text.partner .cards-icon-text-body > p {'));
  assert.ok(at(LI) < css.indexOf('/* the end of online-check-in'));
  assert.doesNotMatch(LI, /:has\([^)]*:has\(/);
});
