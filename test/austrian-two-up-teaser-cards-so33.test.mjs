/* eslint-disable max-len */
/* Austrian's two-up grid cards as www's a.teaser.card (standing order 33, item 3): the title 32 px under the picture, the
   link's 24 px line 36 px over the card's end (ours: a 25 px line, 3 px under it, the body's 32 px), the copy tracked 0.19 px, the title 0.25 px below 768 px and 0 from it. /at/en/baggage 390 -2.83 -> -1.08 %, 1440 -0.90 -> -0.09 %;
   /at/de/gepaeck likewise; the other 26 recorded page-widths with picture-card grids keep their heights (the rule is two-up
   only). The other grids keep row 18's 30 px (austrian-parity-406.test.mjs).
   Run: node --max-old-space-size=512 --test test/austrian-two-up-teaser-cards-so33.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const raw = fs.readFileSync(new URL('../styles/themes/austrian.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
const C = 'body.brand-austrian .carousel-cards.grid.two-up .carousel-cards-slide:not(.carousel-cards-wide, .carousel-cards-text-only) .carousel-cards-body';
const top = raw.replace(/@media[^{]*\{(?:[^{}]*\{[^{}]*\})*[^{}]*\}/g, '');
const media = [...raw.matchAll(/@media ([^{]*)\{((?:[^{}]*\{[^{}]*\})*)[^{}]*\}/g)].map((m) => [m[1].trim(), m[2]]);
const rules = (css, sel) => [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].filter((m) => m[1].split(/,(?![^(]*\))/).map((s) => s.trim()).includes(sel)).map((m) => m[2].trim());

test('the card body: 32 px over the title and under the copy or link, 30 px at the sides', () => {
  assert.deepEqual(rules(top, C), ['padding: 32px 30px;']);
});

test('the link: 3 px under its 25 px line, so 36 px over the card\'s end as www\'s', () => {
  assert.deepEqual(rules(top, `${C} > .carousel-cards-cta`), ['padding-bottom: 3px;']);
});

test('the copy tracked 0.19 px, the title 0.25 px, the title 0 from 768 px', () => {
  assert.deepEqual(rules(top, `${C} > p:not(.carousel-cards-cta, .carousel-cards-eyebrow)`), ['letter-spacing: 0.19px;']);
  assert.deepEqual(rules(top, `${C} > :is(h1, h2, h3, h4, h5, h6)`), ['letter-spacing: 0.25px;']);
  const at768 = media.filter(([q]) => q === '(width >= 768px)').flatMap(([, body]) => rules(body, `${C} > :is(h1, h2, h3, h4, h5, h6)`));
  assert.deepEqual(at768, ['letter-spacing: 0;']);
});

test('only the two-up grid: no other Austrian card rule sets the body\'s 32 px or the tracking', () => {
  const other = [...raw.matchAll(/([^{}]+)\{([^{}]*)\}/g)].filter((m) => m[1].includes('.carousel-cards') && !m[1].includes('.two-up') && /padding: 32px 30px|letter-spacing: 0\.19px/.test(m[2]));
  assert.deepEqual(other.map((m) => m[1].trim()), []);
});
