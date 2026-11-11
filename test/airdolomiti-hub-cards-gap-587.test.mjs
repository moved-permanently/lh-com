/* eslint-disable max-len */
/* Air Dolomiti's destination hub cards on phones (standing order 4 of 2026-11-11, item 4; AD row 109; airdolomiti-parity-001
   /en/destinations, /destinazioni, /de/reiseziele at 390): www's GridTreNews cards are 470 px high and 20 px apart, a
   card every 490 px. Ours stepped 526: the block's stacked margin (36 px between two cards below 768 px) on top of the
   theme's 20 px gap, whose reset is for grids that are not three-up. The hub cards' rule now sets their margin to 0, so
   the gap alone parts them; other grids unchanged.
   Run: node --test test/airdolomiti-hub-cards-gap-587.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/airdolomiti.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
const CARD = 'body.brand-airdolomiti .cards-teaser.three-up:not(.routes) > ul > li:has(> .cards-teaser-image + .cards-teaser-body > .cards-teaser-title:first-child + p:not(.cards-teaser-cta) + .cards-teaser-cta:last-child) {';

test('the hub card without a margin of its own (the grid\'s 20 px gap parts them, as www\'s)', () => {
  const i = css.indexOf(CARD);
  assert.ok(i > 0, 'the card rule');
  const rule = css.slice(i, css.indexOf('}', i));
  assert.match(rule, /height: 470px;/);
  assert.match(rule, /margin-top: 0;/);
});

test('the block\'s stacked margin it overrides is the 36 px between two cards', () => {
  const block = fs.readFileSync(new URL('../blocks/cards-teaser/cards-teaser.css', import.meta.url), 'utf8');
  assert.match(block, /\.cards-teaser > ul > li \+ li \{\n {2}margin-top: 36px;/);
});
