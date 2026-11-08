/* Air Dolomiti's footer sections on phones (brief 474; ema-lufthansa's brand sweep, the footer rows):
   www's rows (airdolomiti-parity-001 at 390) end in its arrow (arrow.svg, 25 px: two light teal
   #afd3d8 bars forming a ">"), turned 90 degrees down while the section is open (as its menu's,
   states/en-home-phonemenu1-explore-390); ours ended in lh-com's chevron pointing down. The theme
   draws the same shape (our own SVG: www's file is not in the capture) in the toggle's icon.
   Run: node --max-old-space-size=256 --test test/airdolomiti-footer-arrow-474.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/airdolomiti.css', import.meta.url), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const T = 'body.brand-airdolomiti footer .footer .footer-column-toggle';

test('the row\'s icon is www\'s light teal ">", its chevron not drawn', () => {
  const rule = (css.match(new RegExp(`${T.replace(/\./g, '\\.')} \\.lh-icon \\{[^}]*\\}`, 'g')) || []).join(' ');
  assert.match(rule, /width: 25px; height: 25px;/);
  // (brief 492: www's own arrow.svg as a mask in the light teal; test/airdolomiti-footer-media-492)
  assert.match(rule, /background: #afd3d8; mask: url\("\/icons\/airdolomiti-arrow\.svg"\) center \/ 25px no-repeat;/);
  assert.ok(css.includes(`${T} .lh-icon > * { display: none; }`));
});

test('closed it points right, open down (www turns its arrow 90 degrees)', () => {
  assert.ok(css.includes(`${T} .lh-icon { transform: none; }`) || /footer-column-toggle \.lh-icon \{[^}]*transform: none;/.test(css));
  assert.ok(css.includes(`${T}[aria-expanded='true'] .lh-icon { transform: rotate(90deg); }`));
});
