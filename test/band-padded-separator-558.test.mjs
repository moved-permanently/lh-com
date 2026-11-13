/* eslint-disable max-len */
/* lufthansa.com on phones: a padded campaign section right after a grey band that opens with a separator (brief 558
   item 4, /de/de/gepaeck and /at/de/gepaeck's "Weitere Informationen" after the "Gepäckservices" band): www puts the
   heading 58 px of ink under the band's end at 390 (lh-parity-004a), ours 82 with the padded section's 20 px above
   the separator. Below 768 px no padding there. From 768 px the 40 px stay for now: www's 80 px at 1440 would need
   them gone too, but the band itself sits 37 px early there (the Bag-Free Travel text, the parked no-break-space
   re-import), so 1440 waits for that re-import.
   Run: node --max-old-space-size=256 --test test/band-padded-separator-558.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/styles.css', import.meta.url), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');

test('below 768 px: no top padding on a padded campaign section that opens with a separator after a band', () => {
  assert.ok(css.includes('@media (width < 768px) { body.brand-lufthansa main > .section.grey + .section.campaign-section.padded:has(> .default-content-wrapper:first-child > p.spacer:first-child) { padding-top: 0; } }'));
});
