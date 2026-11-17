/* eslint-disable max-len */
/* SWISS icon teasers (carousel-cards usp; standing order 65, item 5): the grid cards' 40 px under the text (SWISS row 53,
   test/swiss-card-foot-585.test.mjs) reached the usp teasers too, so each one was 20 px taller than www's (teaser usp:
   h1.teaser-heading padding-bottom 20, swiss-parity-002b ch/de terms-conditions). The usp teasers keep their 20 px.
   Run: node --max-old-space-size=256 --test test/swiss-usp-teaser-foot-so65.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (p) => fs.readFileSync(new URL(`../${p}`, import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
const css = read('styles/themes/swiss.css');
const GRID = 'body.brand-swiss .carousel-cards:is(.grid, .four-up) .carousel-cards-slide:not(.carousel-cards-text-only, .carousel-cards-wide) .carousel-cards-body:not(:has(> .carousel-cards-cta:last-child))';
const USP = 'body.brand-swiss .carousel-cards.usp:is(.grid, .four-up) .carousel-cards-slide:not(.carousel-cards-text-only, .carousel-cards-wide) .carousel-cards-body:not(:has(> .carousel-cards-cta:last-child))';
const block = (sel) => {
  const i = css.indexOf(`${sel} {`);
  return i < 0 ? null : { at: i, body: css.slice(i, css.indexOf('}', i)) };
};

test('usp teasers keep 20 px under the title, after the grid cards\' 40 px', () => {
  const grid = block(GRID);
  const usp = block(USP);
  assert.ok(grid && usp, 'both rules found');
  assert.match(grid.body, /padding-bottom: 40px;/);
  assert.match(usp.body, /padding-bottom: 20px;/);
  assert.ok(usp.at > grid.at, 'the usp rule comes after the grid rule');
});

test('the usp rule is not inside a media query (every width)', () => {
  const before = css.slice(0, block(USP).at);
  const opens = (before.match(/@media[^{]*\{/g) || []).length;
  const depth = [...before].reduce((d, c) => (c === '{' ? d + 1 : c === '}' ? d - 1 : d), 0);
  assert.equal(depth, 0, `top level (media queries opened before it: ${opens})`);
});
