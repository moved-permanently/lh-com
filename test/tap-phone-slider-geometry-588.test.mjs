/* eslint-disable max-len */
/* TAP row 143: card lists www swipes on phones (cards-teaser phone-slider below 1025 px). www's slide is 334 px at 390
   (calc(100% - 56px) of the 390 px row), 24 px apart, the card 16 px inside it (302 px, its picture 170 px high); ours
   was one card the column's width (358 px). Two sliders one after the other (navigator-experiences' "A decorrer"):
   www's cards 88 px apart from one slider to the next, ours 190 (lufthansa.com's 91 px between two card lists). At 390
   against the recordings: navigator-experiences +2.62 -> +1.88 %, get-inspired +0.79 -> -0.24, donating miles -1.25 ->
   -0.91, pt-pt inspire-se +0.91 -> +0.95.
   Run: node --test test/tap-phone-slider-geometry-588.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/tap.css', import.meta.url), 'utf8');
const phones = [...css.matchAll(/@media \(width < 1025px\) \{([\s\S]*?)\n\}/g)].map((m) => m[1]).join('\n');

test('a phone slider\'s slide as www\'s: calc(100% - 56px), 24 px apart, the card 16 px inside it', () => {
  assert.match(phones, /body\.brand-tap \.cards-teaser\.phone-slider > ul \{\s*gap: 24px;\s*\}/);
  assert.match(phones, /body\.brand-tap \.cards-teaser\.phone-slider > ul > li:nth-child\(n\) \{\s*flex: 0 0 calc\(100% - 56px\);\s*margin: 0 16px 16px;\s*\}/);
});

test('a phone slider right after another: no 91 px between them, only its wrapper\'s margin', () => {
  assert.match(phones, /body\.brand-tap \.cards-teaser-wrapper:has\(> \.cards-teaser\.phone-slider\) \+ \.cards-teaser-wrapper > \.cards-teaser\.phone-slider \{\s*margin-top: 0;\s*\}/);
});
