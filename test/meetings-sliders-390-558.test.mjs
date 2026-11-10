/* eslint-disable max-len */
/* lufthansa.com's meetings-and-events at 390 (brief 558 item 4, nine roots at 7.6 to 7.9 %): below 1025 px its two
   sliders as www draws them (lh-parity-004a/b).
   - The logo strip (columns-media cell-slider of pictures only): www's strip 61 px under the picture above, its dots
     78 px under the logos, the text 46 px under the dots; ours 45, 87 and 66.
   - The steps (cards-teaser three-up phone-slider): the card's button 49 px of ink under its text on www, ours 28
     (21 px more above the button, every width); the next section's heading 84 px under the dots, ours 53 (31 px
     under the dots). Spacious phone-sliders (digital-self-services) keep their dots' spacing.
   Run: node --max-old-space-size=256 --test test/meetings-sliders-390-558.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (p) => fs.readFileSync(new URL(p, import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');

test('logo strip below 1025 px: 16 px lower, dots 9 px up, 10 px under them', () => {
  assert.ok(read('../blocks/columns-media/columns-media.css').includes('@media (width < 1025px) { body.brand-lufthansa .columns-media.cell-slider:not(:has(.columns-media-text)) { margin-top: 16px; } body.brand-lufthansa .columns-media.cell-slider:not(:has(.columns-media-text)) .columns-media-dots { margin-top: -47px; margin-bottom: 10px; } }'));
});

test('steps: the button 21 px further from the text; below 1025 px 31 px under the dots, not spacious ones', () => {
  const css = read('../blocks/cards-teaser/cards-teaser.css');
  assert.ok(css.includes('body.brand-lufthansa .cards-teaser.phone-slider .cards-teaser-cta-button { margin-top: 21px; }'));
  assert.ok(css.includes('@media (width < 1025px) { body.brand-lufthansa .cards-teaser.phone-slider:not(.spacious) .cards-teaser-dots { margin-bottom: 31px; } }'));
});
