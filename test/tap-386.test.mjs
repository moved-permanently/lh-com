/* eslint-disable max-len */
/* Brief 386, TAP (tools/reports/tap/parity.md):
   - row 66: the call-back card's title on phones as www's BySide window (up to 600 px its line
     break hidden: "Embrace the benefits of / the Club");
   Run: node --max-old-space-size=512 --test test/tap-386.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/tap.css', import.meta.url), 'utf8');

test('row 66: the call-back card\'s title without its line break up to 600 px, as BySide\'s window', () => {
  assert.match(css, /@media \(width <= 600px\) \{\s*body\.brand-tap \.click-to-call \.click-to-call-title br \{\s*display: none;\s*\}\s*\}/);
});
