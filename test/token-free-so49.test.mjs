/* eslint-disable max-len, import/extensions -- dev tooling */
/* Standing order 49 of 2026-11-19 (token-free content; narrower second tries of order 48's held patterns), theme rules only:
   - Brussels: a one-section page of a sidebar view (title and one paragraph) over a four-up card grid: 33 px above the view
     from 768 (be/fr travel-classes' "{spacer-24 from-768}");
   - ITA: a hub (title section, then the intro paragraph over one card grid, not grey): 32 px above the cards from 768
     (corporate-b2b's "{spacer-31 from-768}", www's 56 px on ita-parity-015's baggage hub too);
   - Discover: on phones a closing section of only a heading over a card row: 36 px to the footer.
   Run: node --test test/token-free-so49.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = (f) => fs.readFileSync(new URL(`../styles/themes/${f}`, import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');

test('Brussels: the sidebar view over one four-up grid, from 768 only', () => {
  assert.ok(css('brussels.css').includes('@media (width >= 768px) { body.brand-brussels main > .section.section.section:only-child:not(:has(> :nth-child(4))) > .columns-media-wrapper:has(> .columns-media.sidebar:not(.in-column) .columns-media-text > h1:first-child + p:last-child):has(+ .carousel-cards-wrapper:last-child > .carousel-cards.grid.four-up) { padding-top: 33px; } }'));
});

test('ITA: a one-grid hub keeps 32 px above its cards from 768; grey hubs and two-grid hubs are not taken', () => {
  const t = css('ita.css');
  assert.ok(t.includes('@media (width >= 768px) { body.brand-ita main > .section.section:has(> .default-content-wrapper:last-child > h1:only-child) + .section.section:not(.grey) > .default-content-wrapper:first-child:has(> p:only-child) + .carousel-cards-wrapper:last-child { padding-top: 32px; } }'));
});

test('Discover: a closing heading-and-cards section on phones', () => {
  assert.ok(css('discover.css').includes('@media (width < 768px) { body.brand-discover main > .section.section.section:last-child:has(> .default-content-wrapper:first-child > :is(h2, h3, h4):only-child):has(> .carousel-cards-wrapper:last-child):not(:has(> :nth-child(3))) { margin-bottom: 36px; } }'));
});
