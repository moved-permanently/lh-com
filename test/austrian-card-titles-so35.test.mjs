/* eslint-disable max-len -- rule notes */
/* Standing order 35 (2026-11-15), item 2: Austrian's grid and phone-slider picture cards take www's .teaser-heading
   tracking, 0 from 768 px (the two-up cards had it since standing order 33); below 768 px nothing changes. Census at
   1440 over the 832 Austrian documents with such a grid: two titles a line shorter, both as www's.
   Run: node --test test/austrian-card-titles-so35.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const raw = fs.readFileSync(new URL('../styles/themes/austrian.css', import.meta.url), 'utf8');
const css = raw.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const SEL = 'body\\.brand-austrian \\.carousel-cards:is\\(\\.grid, \\.phone-slider\\) \\.carousel-cards-slide:not\\(\\.carousel-cards-wide, \\.carousel-cards-text-only\\) \\.carousel-cards-body > :is\\(h1, h2, h3, h4, h5, h6\\)';

test('every grid picture card: the title untracked from 768 px', () => {
  assert.match(css, new RegExp(`@media \\(width >= 768px\\) \\{ ${SEL} \\{ letter-spacing: 0; \\} \\}`));
});

test('below 768 px the title keeps its tracking: no rule for it outside the media query', () => {
  const outside = css.replace(/@media \(width >= 768px\) \{[^@]*?\} \}/g, '');
  assert.doesNotMatch(outside, new RegExp(`${SEL} \\{ letter-spacing`));
});

test('the rule stands before the end of online-check-in', () => {
  const end = raw.indexOf('/* the end of online-check-in');
  const at = raw.indexOf('.carousel-cards:is(.grid, .phone-slider) .carousel-cards-slide:not(.carousel-cards-wide, .carousel-cards-text-only) .carousel-cards-body > :is(h1, h2, h3, h4, h5, h6) {\n    letter-spacing: 0;');
  assert.ok(at > 0 && at < end);
});
