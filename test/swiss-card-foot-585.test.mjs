/* eslint-disable max-len */
/* SWISS's teaser cards keep www's 40 px under their text (the standing order of the night of 2026-11-10, item e; SWISS
   row 53; swiss-parity-005 /ch/en/book-and-manage and /ch/en/prepare at 1440 and 390): www's .teaser.card .card-content
   is padded 20 px over and 40 px under its text (a title-only card 97 px under its picture at 390, 101 at 1440); ours
   20 / 20 (77 / 81). A card that ends in its link row keeps the 8 px under that row (its own rule).
   Run: node --test test/swiss-card-foot-585.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/swiss.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
const SEL = 'body.brand-swiss .carousel-cards:is(.grid, .four-up) .carousel-cards-slide:not(.carousel-cards-text-only, .carousel-cards-wide) .carousel-cards-body:not(:has(> .carousel-cards-cta:last-child))';

test('40 px under a grid card\'s text, not under a link row', () => {
  const i = css.indexOf(`${SEL} {`);
  assert.ok(i >= 0, 'the rule');
  assert.match(css.slice(i, css.indexOf('}', i)), /padding-bottom: 40px;/);
  assert.match(css, /body\.brand-swiss \.carousel-cards:is\(\.grid, \.four-up\) \.carousel-cards-body:has\(> \.carousel-cards-cta:last-child\) \{\s*padding-bottom: 8px;/, 'the link row\'s 8 px stays');
});
