/* eslint-disable max-len */
/* Lufthansa Cargo, the two-up card rows on phones (brief 503, Cargo row 39; the sweep after 501:
   Fleet & ULD +6.5 % at 390): www's CF9 (.two-columns) below 768 px stacks its cards without a gap,
   each card's picture across the screen (390 px at 16:9, past the column's 16 px padding), the title
   20 px under it, 20 px under the card's More link, and the next row 20 px lower (mobile-mt-20); ours
   had the picture inside the margins with 40 px under it, 36 px between cards and 91 between rows.
   cards-teaser without an option (the importer's CF9 rows) only. Cargo's theme only.
   Run: node --max-old-space-size=512 --test test/cargo-card-rows-503.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/cargo.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const phone = css.split('@media (width < 768px)').slice(1).join(' ');
const has = (s, re, msg) => assert.ok(re.test(s), msg ? `${msg}: ${re}` : String(re));
const C = 'body\\.brand-cargo \\.cards-teaser:not\\(\\.three-up, \\.four-up, \\.overlay, \\.mosaic, \\.boxed\\)';

test('row 39: below 768 px the card rows as www\'s CF9: cards stacked without a gap, 20 px under each', () => {
  has(phone, new RegExp(`${C} > ul > li:nth-child\\(n\\) \\{[^}]*margin-top: 0;[^}]*padding-bottom: 20px;`));
});

test('row 39: the card\'s picture across the screen (past the 16 px page margin) at 16:9, the title 20 px under it', () => {
  has(phone, new RegExp(`${C} > ul > li > \\.cards-teaser-image \\{[^}]*margin: 0 -16px 20px;`));
  has(phone, new RegExp(`${C} > ul > li > \\.cards-teaser-image img \\{[^}]*aspect-ratio: 16 / 9;`));
});

test('row 39: a card row right after another 20 px lower (www\'s mobile-mt-20), not the section gap', () => {
  has(phone, /body\.brand-cargo \.cards-teaser-wrapper \+ \.cards-teaser-wrapper > \.cards-teaser:not\(\.three-up, \.four-up, \.overlay, \.mosaic, \.boxed\) \{[^}]*margin-top: 0;/, 'the block\'s 91 px off (the wrapper\'s 20 px stays)');
});
