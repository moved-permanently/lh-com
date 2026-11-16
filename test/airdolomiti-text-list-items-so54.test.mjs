/* eslint-disable max-len */
/* Standing order 54, item 1 (the assistance pages): the list items of a title's text line under line, as www's rich
   text (ol li, ul li { margin-bottom: 0 }): www's contacts stand 37 to 38 px a line, ours stood 48 (the 10 px of
   main .default-content-wrapper li). Lists under a section heading (h2 ~, the 16 px text) keep their 10 px.
   Run: node --max-old-space-size=256 --test test/airdolomiti-text-list-items-so54.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/airdolomiti.css', import.meta.url), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const T = 'body.brand-airdolomiti main .default-content-wrapper:has(> h1 ~ p ~ p)';

test('a title\'s text: its list items without the 10 px between them', () => {
  assert.ok(css.includes(`${T} > :is(ul, ol):not(h2 ~ *) > li { margin-bottom: 0; }`));
});

test('the lists themselves keep their line under them, and lists under a section heading are not reached', () => {
  assert.ok(css.includes(`${T} > :is(ul, ol) { max-width: none; margin: 0 0 37.4px;`));
  const rules = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].filter((m) => m[1].includes(T) && /> li\b/.test(m[1]));
  assert.equal(rules.length, 1);
  assert.ok(rules[0][1].includes(':not(h2 ~ *)'));
});
