/* eslint-disable max-len */
/* Brief 505 item 2, /de/en/overview-special-request at 390 (24.1 %) and services-at-the-airport: a Cards Teaser whose
   cards are titled with h2 and with h3 {heading-small}: www's h2 titles are h2.headline.heading-medium (36 px at 1440,
   28 at 390), ours 22 px: the rule for h2 titles applied only when no card had an h3 title. An unmarked h2 card title
   is heading-medium's size and margin in any Cards Teaser (the cleanup writes a marker where www's size differs from
   the level's); the h3 cards keep their markers.
   Run: node --test test/cards-teaser-h2-titles-505.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync('blocks/cards-teaser/cards-teaser.css', 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');

test('h2 card titles: heading-medium\'s size in any Cards Teaser', () => {
  assert.ok(css.includes('.cards-teaser :where(.cards-teaser-body > h2.cards-teaser-title) { margin-bottom: var(--heading-margin-xl); font-size: var(--heading-font-size-xl); }'));
  assert.ok(!css.includes(':not(:has(:is(h3, h4, h5, h6).cards-teaser-title))'), 'no condition on the other cards\' titles');
});
