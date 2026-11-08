/* eslint-disable max-len */
/* Group for Business, the stage's button on phones (the brief after 505, item 2; B2B row 33): www's
   stage teasers in column views (PartnerPlusBenefit's "Anmelden", eXperts' "Mehr erfahren" / "Learn
   More"; b2b-parity-001, de/de and de/en) keep their small secondary button under the subheadline at
   390 as at 1440; ours hid it below 768 px (brief 421). The button now shows at every width, as www's.
   B2B's theme only. Run: node --max-old-space-size=512 --test test/b2b-stage-button-phones-506.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/b2b.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');

test('row 33: the stage\'s button not hidden on phones', () => {
  assert.ok(!/body\.brand-b2b \.columns-media\.stage \.columns-media-text:has\(> p:first-child > a > picture\) > p:has\(> em > a, > a\.button\) \{ display: none; \}/.test(css));
});

test('row 33: the button in the stage\'s third row at every width, clickable', () => {
  assert.ok(/body\.brand-b2b \.columns-media\.stage \.columns-media-text:has\(> p:first-child > a > picture\) > p:has\(> em > a, > a\.button\) \{ grid-row: 3; margin-top: 16px; pointer-events: auto; \}/.test(css));
});
