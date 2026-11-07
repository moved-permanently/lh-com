/* eslint-disable max-len */
/* lufthansa.com homepage parity (brief 460, de/en against www's captures of 2026-11-06):
   - the section after the stage 32 px lower: www's quick actions row below the stage (empty for a
     guest) ends with a transparent separator, margin-bottom 30px ("Winter deals" 87 px below the
     stage at 1440, ours 55; at 768 and 390 the same 32 px after the stage card); lufthansa.com only;
   - the fare teaser's row keeps a priced row's height while the price is missing (147 px then, 142
     with a price): the empty price gets a zero-width line, so the label and the price share a
     baseline as with a price (every brand: the reserve was meant to be a priced row's);
   - the destination finder 85 px further under the news carousel (69 px below 768 px): www's
     carousel section ends with the same 30 px separator and the finder's section-wide maui-section
     starts lower (dots to "Flight offers from" 157 / 157 / 142 px of ink at 1440 / 768 / 390,
     ours 72 / 71 / 73); lufthansa.com only.
   Run: node --max-old-space-size=512 --test test/lh-homepage-parity-460.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const flat = (f) => fs.readFileSync(new URL(f, import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const styles = flat('../styles/styles.css');
const fare = flat('../blocks/fare-teaser/fare-teaser.css');

test('the section after the homepage stage 32 px lower, lufthansa.com only', () => {
  assert.ok(styles.includes('body.brand-lufthansa main > .section.stage-promotions-container { margin-bottom: calc(var(--section-gap) + 32px); }'));
});

test('a fare row without its price as high as a priced row', () => {
  assert.ok(fare.includes('.fare-teaser .fare-teaser-price:empty::before { content: "\\200B"; }'));
});

test('the destination finder 85 px (69 px on phones) further under the news carousel, lufthansa.com only', () => {
  const S = 'body.brand-lufthansa main > .section.carousel-cards-container:has(+ .section.destination-finder-container)';
  assert.ok(styles.includes(`${S} { margin-bottom: calc(var(--section-gap) + 69px); }`));
  assert.ok(styles.includes(`@media (width >= 768px) { ${S} { margin-bottom: calc(var(--section-gap) + 85px); } }`));
});
