/* eslint-disable max-len */
/* Air Dolomiti, the footer's section rows on phones (the brief after 505, item 2; Air Dolomiti row
   71): www's toggle (FooterMobile, a flex row, space-between, no gap) gives the title the width up to
   the 25 px arrow, so "Assistenza al viaggiatore" (273 px at 19.44 px) stays on one line, every row
   59 px; ours kept the footer block's 16 px gap, the title 269 px wide, two lines and 87 px, the
   footer 28 px longer at 390 on every page. Below 930 px the toggle without the gap. Air Dolomiti's
   theme only. Run: node --max-old-space-size=512 --test test/airdolomiti-footer-toggle-506.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/airdolomiti.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');

test('row 71: below 930 px the footer\'s section toggle without a gap, the title up to the arrow', () => {
  const phone = css.split('@media (width < 930px)').slice(1).join(' ');
  assert.match(phone, /body\.brand-airdolomiti footer \.footer \.footer-column-toggle \{[^}]*display: flex;[^}]*gap: 0;/);
});
