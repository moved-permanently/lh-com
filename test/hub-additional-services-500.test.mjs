/* eslint-disable max-len */
/* Brief 500 item 1, /de/en/additional-services (hub): each band is a stage, a separator, the service tiles (cards-icon
   padded: www's column view, 32 px above and below) and a separator. A wrapper of separators in a campaign-section takes
   24 px for the column view above it (columns-media padded has only 8 px of its 3.2rem, brief 488); after padded tiles
   that came on top: with the tiles padded again (test/cards-icon-padded-separators-500) the bands ran 26 px long at 1440
   (34 at 390). After padded tiles the separators' wrapper has no gap.
   Run: node --test test/hub-additional-services-500.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync('styles/styles.css', 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');

test('separators right after padded tiles in a campaign-section: no wrapper gap', () => {
  assert.ok(css.includes('body.brand-lufthansa main > .section.campaign-section > .cards-icon-wrapper:has(> .cards-icon.padded) + .default-content-wrapper:not(:has(> :not(p.spacer))) { margin-top: 0; }'));
  // the general rule (24 px) stays for other blocks
  assert.ok(css.includes('body.brand-lufthansa main > .section.campaign-section > .default-content-wrapper:not(:has(> :not(p.spacer))) { margin-top: 24px; }'));
});
