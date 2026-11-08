/* eslint-disable max-len -- dev tooling */
/* Brief 510 item 2 (TAP /en-pt/promos and its languages): the market rules put a list's cards in sections of their own
   (data-markets: the Portugal Stopover card in "-br,-ca,-pt,-us" / "-pt,-us", the pt-only cards in "pt"), apart from the
   section of their heading ("News & Highlights"). TAP's section gap (64 px) then opens between the heading and its cards:
   www 58 px from the heading to the first card (28 on phones), ours 81 (48) (es-es 1440: the card 1781 against 1756; en-pt 1757 against
   1732). A section of a heading alone followed by a market section opening with a card list (14 pages) keeps 12 px, 41 from 728 px (TAP only).
   Run: node --test test/tap-market-heading-510.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/tap.css', import.meta.url), 'utf8').replace(/\s+/g, ' ');

const rule = 'body.brand-tap main > .section:has(> .default-content-wrapper:only-child > :is(h1, h2, h3):only-child):has(+ .section[data-markets] > .cards-teaser-wrapper:first-child)';

test('a heading-only section before a market section: 12 px below it on phones, not the 32 px section gap', () => {
  assert.ok(css.includes(`*/ ${rule} { margin-bottom: 12px; }`));
});

test('the heading keeps no margin of its own there (it would collapse through the section\'s)', () => {
  assert.ok(css.includes(`${rule} > .default-content-wrapper > :only-child { margin-bottom: 0; }`));
});

test('from 728 px: 41 px, not the 64 px section gap', () => {
  assert.ok(css.includes(`@media (width >= 728px) { ${rule} { margin-bottom: 41px; } }`));
});
