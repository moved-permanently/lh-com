/* eslint-disable max-len */
/* Brief 407, TAP (tools/reports/tap/parity.md):
   - R4-7, empty lines in card texts: www draws a card text's empty paragraph as a 24 px line; the
     importer writes the marker paragraph <sub>{blank}</sub> (an empty paragraph and a no-break
     space's are dropped by the pipeline, checked on aem.page; cards-teaser drops an emptied
     {spacer-24}), and the theme makes it one 24 px line with the word hidden (the card texts have
     no sub of their own);
   Run: node --max-old-space-size=512 --test test/tap-407.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/tap.css', import.meta.url), 'utf8');

test('R4-7: the {blank} marker paragraph in a card\'s text one 24 px line, its word hidden (cards-teaser, cards, the feature cards)', () => {
  const sel = 'body\\.brand-tap main :is\\(\\.cards-teaser, \\.cards, \\.columns-media\\.feature, \\.columns-media\\.feature-small\\) p:has\\(> sub:only-child\\)';
  assert.match(css, new RegExp(`${sel} \\{\\s*height: 24px;\\s*margin: 0;\\s*overflow: hidden;\\s*line-height: 24px;\\s*\\}`));
  assert.match(css, new RegExp(`${sel} > sub \\{\\s*visibility: hidden;\\s*\\}`));
});
