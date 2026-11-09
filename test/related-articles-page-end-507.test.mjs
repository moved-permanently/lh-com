/* eslint-disable max-len */
/* Brief 507 item 1 (Insights articles at 390: eat-see-do-algiers 20.0 %, be-picky-frankfurt-insider-tips 17.6 %): www's
   related articles end the page (.dcep-related-articles, then the footer): 34 px from the last card's title to the footer
   at 390 (the card's 10 px padding and the title's 24 px; 40 on flying-high-christoph-quarch). Ours added the section gap
   (48 px; the empty metadata section after it adds nothing more): 82 px. All 24 published documents with a Related
   Articles block have it in their last section.
   The brief after 539: at 1440 too. lh-parity-004a/b's allegris-premium-economy-san-diego (de/de, gb/en): www 34 px from
   the last card's text to the footer, ours 83. With the rule at every width they measure 12.9 -> 11.5 % and 12.0 -> 10.7 %
   (the brief 507 note "from 768 px the heights match" was the whole page's height, where other differences made up for it).
   Run: node --test test/related-articles-page-end-507.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync('styles/styles.css', 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');

test('no section gap under the related articles that end the page, nor from the empty section after them, at every width', () => {
  assert.ok(css.includes('} body.brand-lufthansa main > .section.related-articles-container { margin-bottom: 0; } body.brand-lufthansa main > .section.related-articles-container ~ .section:last-child:not(:has(*)) { margin-bottom: 0; }'));
  assert.ok(!css.includes('@media (width < 768px) { body.brand-lufthansa main > .section.related-articles-container {'), 'no longer phones only');
});
