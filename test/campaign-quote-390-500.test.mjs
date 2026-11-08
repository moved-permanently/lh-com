/* eslint-disable max-len */
/* Brief 500 item 2, /de/en/100-years/campaigns at 390: an author quote alone in its AEM section (campaign-section)
   sat 33 px higher than www's three times (148 px from the poster above to the quote's first line on www, ours 115);
   below it as www's, and at 1440 as www's. Below 768 px such a quote has 93 px above it (60 + 33). Pages: campaigns (3),
   chronicle (1).
   Run: node --test test/campaign-quote-390-500.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync('styles/styles.css', 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');

test('below 768 px: a quote alone in its campaign-section, 93 px above it', () => {
  assert.ok(css.includes('@media (width < 768px) { body.brand-lufthansa main > .section.campaign-section > .default-content-wrapper:only-child > blockquote:only-child { margin-top: 93px; } }'));
});
