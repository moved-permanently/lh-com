/* eslint-disable max-len */
/* Standing order 11 (2026-11-12), item 2: /de/en/lufthansa-travel-classes went from 2.7 to 8.2 % off www at 1440. Its
   grey column-view band (flush) is followed by the cards' padded campaign section; standing order 7's rule (a flush grey
   band before a padded section has no section gap, measured on info pages' intros) took the band's gap away there too:
   the cards 31px higher than www's. Before a padded campaign section the band keeps 24px. Injected on our host (now ->
   48px -> 24px), % off www at 1440 / 390: lufthansa-travel-classes (de/en, gb/en) 8.2 / 14.8 -> 6.4 / 11.9 -> 3.9 / 8.0,
   lufthansa-reiseklassen (de/de, at/de) 8.3 / 14.6 -> 3.9 / 7.9; gepaeck and 100-years/history/menu-on-board as before.
   Run: node --max-old-space-size=256 --test test/band-before-campaign-so11.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/styles.css', import.meta.url), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const SEL = 'body.brand-lufthansa main > .section.grey.flush:has(+ .section.padded.campaign-section)';
const SO7 = 'body.brand-lufthansa main > .section.grey.flush:has(+ .section.padded)';

test('a flush grey band before a padded campaign section keeps 24px', () => {
  const i = css.indexOf(`${SEL} {`);
  assert.ok(i >= 0, 'the rule');
  assert.match(css.slice(i, css.indexOf('}', i)), /margin-bottom: 24px;/);
});

test('standing order 7\'s rule stays for the other padded sections, and this one comes after it', () => {
  const j = css.indexOf(`${SO7} {`);
  assert.ok(j >= 0, 'the band rule of 7d58bb1');
  assert.match(css.slice(j, css.indexOf('}', j)), /margin-bottom: 0;/);
  assert.ok(css.indexOf(`${SEL} {`) > j);
});
