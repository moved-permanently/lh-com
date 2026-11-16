/* eslint-disable max-len */
/* Standing order 37, item 1: related-articles option fixed. The authored cards only, with no picks from the article
   index: www shows exactly the articles its page names, two on livery-iconic-moments (lh-parity-008 and -013), where
   ours drew three (+407 px at 390). Without the option, or with no authored card, the block picks as before. No
   published document carries the option before delta-so37-livery-related-lh-com.
   Run: node --test test/related-articles-fixed-so37.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const js = fs.readFileSync(new URL('../blocks/related-articles/related-articles.js', import.meta.url), 'utf8');

test('option fixed: no picks when the block has authored cards', () => {
  assert.match(js, /const fixed = block\.classList\.contains\('fixed'\) && cards\.length > 0;/);
  assert.match(js, /\}, priority, fixed \? 0 : Math\.max\(0, MAX_CARDS - cards\.length\)\);/);
});

test('without the option the picks fill up to three, as before', () => {
  assert.match(js, /const MAX_CARDS = 3;/);
});
