/* eslint-disable max-len */
/* Standing order 26, item 3: a heading marked heading-copytext-large on an Austrian page is www's heading-copytext-large:
   CoreSans 500, 16 px / 110 % with 0.19 px letter spacing below 768 px, 18 px without it from 768 px; 12 px below it, 24
   from 1281 px; no space of its own above it (www's headline component: the paragraph's 24 px before it). styles.css drew
   it as lh-com's (the heading font 700, 20 px, 32 px above): os401crewstory's six story headings 24 px too tall each at
   390, sustainable-flying's three and accessible-travel's two too. The fare teaser's title keeps its own rule.
   Run: node --max-old-space-size=256 --test test/austrian-heading-copytext-large-so26.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/austrian.css', import.meta.url), 'utf8').replace(/\s+/g, ' ');
const SEL = 'body.brand-austrian main > .section:not(.fare-teaser-container) :is(h1, h2, h3, h4, h5, h6).heading-copytext-large';
const rule = (from) => {
  const at = from.indexOf(`${SEL} {`);
  return at < 0 ? '' : from.slice(at, from.indexOf('}', at));
};
const after = (q) => {
  const i = css.indexOf(`@media ${q} { ${SEL} {`);
  return i < 0 ? '' : css.slice(i);
};

test('below 768 px: CoreSans 500, 16 px / 1.1, 0.19 px apart, 12 px below, none above', () => {
  const r = rule(css);
  assert.match(r, /margin-top: 0;/);
  assert.match(r, /margin-bottom: 12px;/);
  assert.match(r, /font-family: var\(--body-font-family\);/);
  assert.match(r, /font-size: 16px;/);
  assert.match(r, /font-weight: 500;/);
  assert.match(r, /line-height: 1\.1;/);
  assert.match(r, /letter-spacing: 0\.19px;/);
});

test('from 768 px 18 px without the letter spacing, from 1281 px 24 px below', () => {
  const m = rule(after('(width >= 768px)'));
  assert.match(m, /font-size: 18px;/);
  assert.match(m, /letter-spacing: 0;/);
  assert.match(rule(after('(width >= 1281px)')), /margin-bottom: 24px;/);
});
