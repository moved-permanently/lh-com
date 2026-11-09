/* eslint-disable max-len */
/* Brief 507 item 1 (Insights articles at 390: eat-see-do-algiers 20.0 %, be-picky-frankfurt-insider-tips 17.6 %): www's
   related articles end the page (.dcep-related-articles, then the footer): 34 px from the last card's title to the footer
   at 390 (the card's 10 px padding and the title's 24 px; 40 on flying-high-christoph-quarch). Ours added the section gap
   (48 px; the empty metadata section after it adds nothing more): 82 px. All 24 published documents with a Related
   Articles block have it in their last section. From 768 px the pages' heights match www's already (algiers 6549 / 6548
   at 1440): phones only.
   Run: node --test test/related-articles-page-end-507.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync('styles/styles.css', 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');

test('on phones no section gap under the related articles, nor from the empty section after them', () => {
  assert.ok(css.includes('@media (width < 768px) { body.brand-lufthansa main > .section.related-articles-container { margin-bottom: 0; } body.brand-lufthansa main > .section.related-articles-container ~ .section:last-child:not(:has(*)) { margin-bottom: 0; } }'));
});

test('from 768 px as before (no rule there)', () => {
  assert.ok(!/@media \(width >= 768px\) \{ body\.brand-lufthansa main > \.section\.related-articles-container \{/.test(css));
});
