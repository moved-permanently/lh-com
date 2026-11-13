/* eslint-disable max-len */
/* TAP's teaser cards (cards-teaser; standing order 14's ranking, TAP row 156): www draws a card with only a title and its
   link ("Find out more": hold baggage's sports equipment, musical instruments, weapons; voar-economica's) as every teaser
   card: 16 px inside its box (p-4), the title 24 / 28.8 px weight 500, the picture 326 / 183. Our card rules asked for a
   paragraph besides the CTA (li:has(> .cards-teaser-body > p:not(.cards-teaser-cta))), so such cards kept the block's
   defaults: 24 px apart, an 18 / 21.6 px bold title (hold baggage 1440 -1.38 %, 390 -2.00 %). The rules take any paragraph
   now, at the same weight (:not(.cards-teaser-title): one class, as before; dropping the :not lowered all 16 rules and
   moved 7 other recorded pages). Reads tap.css as written.
   Run: node --max-old-space-size=256 --test test/tap-teaser-cta-cards-so14.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/tap.css', import.meta.url), 'utf8');
const OLD = 'li:has(> .cards-teaser-body > p:not(.cards-teaser-cta))';
const NEW = 'li:has(> .cards-teaser-body > p:not(.cards-teaser-title))';

test('the teaser card rules take a card with any paragraph, its CTA alone too', () => {
  assert.equal(css.split(OLD).length - 1, 0, 'no rule asks for a paragraph besides the CTA');
  assert.equal(css.split(NEW).length - 1, 16, 'the 16 rules');
});

test('at the same weight as before: the condition keeps one class', () => {
  const [, arg] = NEW.match(/li:has\((.*)\)$/);
  assert.equal((arg.match(/\.[\w-]+/g) || []).length, 2, '.cards-teaser-body and the :not\'s class, as the old condition');
  assert.equal((OLD.match(/li:has\((.*)\)$/)[1].match(/\.[\w-]+/g) || []).length, 2);
});
