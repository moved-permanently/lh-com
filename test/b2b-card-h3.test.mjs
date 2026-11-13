/* eslint-disable max-len */
/* The brief after e035d652 / 6a7de8fe, item 2 (Group for Business, B2B theme): a Columns Media card's H3 without a size class.
   www sets every card H3 of a column view in heading-small: 28 px on 32 px lines at 400 (1440), 24.06 on 28.06 at 390
   (b2b-parity-001 to -003: 32 marked {heading-small} in DA and 8 unmarked, all so). The collapse drops the mark in a
   block (163 card H3s across B2B's documents), and ours drew them on 24 px lines at 300 (columns-media.css's light
   heading, b2b.css's copytext line): lufthansa-group-airlines' airline cards 8 px short a row, lighter.
   Run: node --test test/b2b-card-h3.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/b2b.css', import.meta.url), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const rule = (sel) => {
  const i = css.indexOf(`${sel} {`);
  if (i < 0) return null;
  return css.slice(i + sel.length + 2, css.indexOf('}', i));
};

test('B2B: a card H3 without a size class is heading-small\'s line and weight', () => {
  const body = rule('body.brand-b2b main .columns-media-text > h3:not([class*="heading-"])');
  assert.ok(body, 'the rule');
  assert.match(body, /line-height: calc\(var\(--heading-font-size-l\) \+ 4px\);/);
  assert.match(body, /font-weight: 400;/);
});

test('the copytext line stays for default content H3/H4, card H4s and the hotline finder', () => {
  const sel = 'body.brand-b2b main .hotline-finder :is(h3, h4), body.brand-b2b main .default-content-wrapper > :is(h3, h4):not([class*="heading-"]), body.brand-b2b main .columns-media-text > h4:not([class*="heading-"])';
  const body = rule(sel);
  assert.ok(body, 'the rule, without the card H3');
  assert.match(body, /line-height: 24px;/);
});
