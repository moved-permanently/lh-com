/* eslint-disable max-len */
/* Standing order 56: Air Dolomiti's link tiles (three-up cards of a picture, a title and its link: support, baggage,
   extra services) as www's CardIllustrationsSmall (padding 30px 20px): the chip 30 px down its picture, 20 px in; under
   a title and its line the tile grid 30 px down, not the 40 px kept for other cards there. On all 6 recorded pages
   (airdolomiti-parity-001, 390 and 1440) the texts stay where they were and the page ends 10 px higher, at www's height.
   Run: node --max-old-space-size=256 --test test/airdolomiti-link-tiles-so56.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/airdolomiti.css', import.meta.url), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const TILE = '.cards-teaser-image + .cards-teaser-body > .cards-teaser-title:first-child + .cards-teaser-cta:last-child';
const body = (sel) => {
  const i = css.indexOf(`${sel} {`);
  return i < 0 ? null : css.slice(i + sel.length + 2, css.indexOf('}', i)).trim();
};

test('the chip 30 px down its picture, 20 px in', () => {
  const b = body(`body.brand-airdolomiti .cards-teaser.three-up:not(.routes) > ul > li:has(> ${TILE}) .cards-teaser-title`);
  assert.ok(b);
  assert.match(b, /top: 30px;/);
  assert.match(b, /left: 20px;/);
});

test('under a title and its line: the tiles 30 px down, other cards 40', () => {
  const after = 'body.brand-airdolomiti main .default-content-wrapper:has(> h1 + p:last-child) + .cards-teaser-wrapper';
  assert.equal(body(after), 'margin-top: 40px;');
  assert.equal(body(`${after}:has(> .cards-teaser.three-up > ul > li > ${TILE})`), 'margin-top: 30px;');
  assert.ok(css.indexOf(`${after} {`) < css.indexOf(`${after}:has(`), 'the tiles\' rule after the general one');
});
