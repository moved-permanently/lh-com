/* eslint-disable max-len */
/* Air Dolomiti's news text: a separator paragraph draws its height (standing order 31, item 2). www's
   in-flight-entertainment-system opens its third paragraph with two line breaks ("<p><br><br>The new solution offers
   ..."); our 33 px paragraph margin stands in for one. A leading <br> in DA does not survive the pipeline (the served
   copy had none after the upload), so the second break is a "{spacer-33}" paragraph before that paragraph. In the news
   text the separator paragraph had no height (its margins met through it, 0 px); now it is its --spacer-size high, with no
   margin above it, so the page gains exactly its N px (drafted: footer top 1,518 / 2,247, www 1,521 / 2,250). No published
   news block holds a separator today (1,559 documents, 72 news blocks, 0).
   Run: node --test test/airdolomiti-news-spacer-so31.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/airdolomiti.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
const SPACER = 'body.brand-airdolomiti .columns-media.news .columns-media-text p.spacer {';
const PP = 'body.brand-airdolomiti .columns-media.news .columns-media-text p + p {';

test('a separator paragraph in the news text: its --spacer-size high, no margin above it', () => {
  const i = css.indexOf(SPACER);
  assert.ok(i >= 0, 'the rule');
  const rule = css.slice(i, css.indexOf('}', i));
  assert.match(rule, /height: var\(--spacer-size\);/);
  assert.match(rule, /margin-top: 0;/);
});

test('it follows the paragraphs\' 33 px rule (and outweighs it: one class more)', () => {
  assert.ok(css.indexOf(PP) >= 0 && css.indexOf(SPACER) > css.indexOf(PP));
});
