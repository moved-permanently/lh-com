/* eslint-disable max-len */
/* Standing order 47, item 2 (places 61, 62 of order 43's sweep: by/en, ru/en 390): on a homepage whose carousel band is
   followed by the cards-icon band (no destination finder), www keeps the carousel's own spacing, 79 px from its dots to the
   next heading (xx/en at 390 and 1440); ours had the section gap, 48. The rule is in the homepage band block
   (styles/themes/austrian.css), with its condition, and needs a fare teaser: ca/en and ca/fr stay out.
   Run: node --max-old-space-size=256 --test test/austrian-carousel-no-finder-so47.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/austrian.css', import.meta.url), 'utf8');
const SEL = 'body.brand-austrian main:has(a[href*="/fragments/modals/"], :where(.section.flight-search-container:first-child + .section.hero-card-overlay-container + .section.fare-teaser-container)):has(> .section.flight-search-container:first-child):has(> .section.fare-teaser-container) > .section.carousel-cards-container:has(+ .section.cards-icon-container) {';

test('the rule: +31 px over the section gap, at every width, inside the homepage band block', () => {
  const i = css.indexOf(SEL);
  assert.ok(i > 0, 'the rule is there');
  assert.equal(css.indexOf(SEL, i + 1), -1, 'once');
  const start = css.indexOf('the homepage after its footer-disclaimer patch');
  const end = css.indexOf('/* numbered steps', start);
  assert.ok(start > 0 && i > start && i < end, 'inside the band block');
  assert.equal(css.slice(start, i).includes('@media'), false, 'before the block\'s media query: at every width');
  assert.equal(css.slice(i + SEL.length, css.indexOf('}', i)).trim(), 'margin-bottom: calc(var(--section-gap) + 31px);');
});

test('the finder case keeps its own values', () => {
  assert.ok(css.includes('> .section.carousel-cards-container:has(+ .section.destination-finder-container) { margin-bottom: calc(var(--section-gap) + 81px); }'));
  assert.ok(css.includes('> .section.carousel-cards-container:has(+ .section.destination-finder-container) { margin-bottom: calc(var(--section-gap) + 86px); }'));
});
