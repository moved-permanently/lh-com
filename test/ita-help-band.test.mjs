/* eslint-disable max-len */
/* ITA row 14 (brief 437, item 4): the help app's FAQs card (help-center-web's
   .topic-selection-info-cards-container.full-width-bg, its own markup, no shadow root) on a band
   across the page, as www.ita-airways.com (ita-parity-001: #f8f8f9 from the left edge to the right at
   1440 and 390; www's page CSS gives .full-width-bg its negative margins, which ours lacks). ITA's
   theme draws the band past the column with a shadow clipped to the sides.
   Run: node --max-old-space-size=512 --test test/ita-help-band.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/ita.css', import.meta.url), 'utf8').replace(/\s+/g, ' ');

test('the help app\'s FAQs band across the page', () => {
  assert.ok(/body\.brand-ita \.micro-frontend \.topic-selection-info-cards-container\.full-width-bg \{ box-shadow: 0 0 0 100vmax #f8f8f9; clip-path: inset\(0 -100vmax\); \}/.test(css));
});
