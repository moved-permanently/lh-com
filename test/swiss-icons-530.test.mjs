/* eslint-disable max-len, import/extensions */
/* SWISS's icon tiles (the brief after 526, item 2; SWISS row 46): row 12 (brief 380) gave the homepages' "Looking for
   more" tiles www's own icons (icons/swiss-*.svg) by changing the documents to :swiss-hotel: and the like; the importer
   still writes lufthansa.com's :hotel:, so a re-import (the capture round's SWISS homepages) brought lufthansa.com's
   navy icons back (the dry run: /ch/en/homepage from its held snapshot against DA's copy). swiss-import.mjs
   withSwissIcons: in a cards-icon block a token whose SWISS icon exists becomes that one; every other token as it is.
   Run: node --max-old-space-size=256 --test test/swiss-icons-530.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { withSwissIcons } from '../tools/importer/swiss-import.mjs';

const tiles = (names) => `<div class="cards-icon">${names.map((n) => `<div><div><span class="icon icon-${n}"></span></div><div><a href="/x">${n}</a></div></div>`).join('')}</div>`;
// the importer's cells: the token as the cell's text (no paragraph)
const tokens = (names) => `<div class="cards-icon">${names.map((n) => `<div><div>:${n}:</div><div><a href="/x">${n}</a></div></div>`).join('')}</div>`;

test('row 46: the tiles\' tokens with a SWISS icon become it (DA\'s homepages: :swiss-hotel: and the like)', () => {
  const doc = `<div><h2>Looking for more than just a flight?</h2>${tokens(['hotel', 'car-rental', 'airport-parking', 'stadium', 'plus-circle'])}</div>`;
  const out = withSwissIcons(doc);
  ['hotel', 'car-rental', 'airport-parking', 'stadium', 'plus-circle'].forEach((n) => {
    assert.ok(fs.existsSync(new URL(`../icons/swiss-${n}.svg`, import.meta.url)), n);
    assert.ok(out.includes(`<div>:swiss-${n}:</div>`), n);
  });
  assert.equal(withSwissIcons(out), out, 'twice as once');
});

test('row 46: the icon spans of an imported tile too, a token in a paragraph too; a token without a SWISS icon, or outside the tiles, as it is', () => {
  assert.ok(withSwissIcons(tiles(['hotel'])).includes('<span class="icon icon-swiss-hotel"></span>'));
  assert.ok(withSwissIcons('<div class="cards-icon"><div><div><p>:stadium:</p></div><div>x</div></div></div>').includes('<p>:swiss-stadium:</p>'));
  const other = tokens(['phone']);
  assert.equal(withSwissIcons(other), other);
  const text = '<div><p>Call :hotel: now</p></div>';
  assert.equal(withSwissIcons(text), text);
});
