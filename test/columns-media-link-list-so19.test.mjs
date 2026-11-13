/* Standing order 19 (2026-11-13), item 3: Columns Media's option link-list (www's .imagelinklist icon headings, the travel
   class columns of /de/en/carry-on-baggage and /de/en/lufthansa-express-rail) drew its headings 18px. www's are
   .heading-copytext-large, fluid: calc(2rem + .4 * (100vw - 37.5rem) / 106.5), 24px at 1440, 20px at 390, our
   --heading-font-size-m: "1 item of carry-on baggage" wraps on www and not on ours, each column 25-55px short.
   lufthansa.com's headings take the variable now (the brands keep 18px, unmeasured). Live + the rule, % off www at
   1440 / 390: carry-on-baggage 18.8 / 6.4 -> 16.1 / 6.5, lufthansa-express-rail 10.9 / 8.2 -> 6.8 / 7.7.
   Run: node --test test/columns-media-link-list-so19.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../blocks/columns-media/columns-media.css', import.meta.url), 'utf8');

test('lufthansa.com\'s link-list headings: www\'s .heading-copytext-large size', () => {
  const rule = css.match(/body\.brand-lufthansa \.columns-media\.link-list \.columns-media-row > \.columns-media-text :is\(h3, h4\):has\(> picture\) \{([^}]*)\}/);
  assert.ok(rule, 'the lufthansa.com rule');
  assert.match(rule[1], /font-size: var\(--heading-font-size-m\);/);
});

test('the shared rule keeps 18px for the brands', () => {
  const rule = css.match(/\n\.columns-media\.link-list \.columns-media-row > \.columns-media-text :is\(h3, h4\):has\(> picture\) \{([^}]*)\}/);
  assert.ok(rule);
  assert.match(rule[1], /font-size: 18px;/);
});
