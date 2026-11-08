/* eslint-disable max-len */
/* Brief 505 item 1, /de/en/lufthansa-travel-classes at 390 (12.9 %): a grey band, then a padded AEM section (the
   Allegris cards): www 53 px from the band's end to the first card at 390 (ours 68: our 48 px section gap and the
   section's padding), 17 px less at 1440 too. A grey band right before a padded campaign-section keeps 32 px.
   Run: node --test test/campaign-grey-band-padded-505.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync('styles/styles.css', 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');

test('a grey band before a padded campaign-section: 32 px', () => {
  assert.ok(css.includes('body.brand-lufthansa main > .section.grey:has(+ .section.campaign-section.padded) { margin-bottom: 32px; }'));
});
