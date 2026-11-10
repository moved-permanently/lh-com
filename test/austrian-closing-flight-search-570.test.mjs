/* eslint-disable max-len */
/* The standing order after 570 item 3: Austrian /us/en/local-page/ski-campaign-2026, -5.3 % at 1440 on austrian.turnsthe.page.
   The page is one stage section (campaign stage, fare teaser, the h3 "Find your winter adventure", the flight-search band).
   On www (austrian-parity-003) the closing title is heading-small at 28 px (31 px tall; 22 px at 390), 90 px under the fare
   teaser's Conditions link (ours 54) and 58 px over the band's picture (ours 42), and the footer starts 54 px under the band
   (ours at once). Ours drew the title at the stage's 36 px. The Austrian theme draws a stage section that ends with a
   flight-search band so. Two documents have it (gb/en, us/en ski-campaign-2026).
   With the rule added on the live us/en page: 1440 -5.3 -> -1.6 %; 390 -4.5 -> -5.3 % (the title one line as www's; at 390
   www shows the flight search on white, no band picture: not changed here).
   Run: node --max-old-space-size=256 --test test/austrian-closing-flight-search-570.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/austrian.css', import.meta.url), 'utf8').replace(/\s+/g, ' ');
const TITLE = 'body\\.brand-austrian main > \\.section\\.stage > \\.default-content-wrapper:has\\(> h3:only-child\\):has\\(\\+ \\.flight-search-wrapper\\.flight-search-band:last-child\\)';

test('the closing title: 22 px (28 from 1025 px), www\'s line height', () => {
  assert.match(css, new RegExp(`${TITLE} > h3 \\{ font-size: 22px; line-height: 1\\.1; \\}`));
  assert.match(css, new RegExp(`${TITLE} > h3 \\{ margin-bottom: 36px; font-size: 28px; \\}`));
});

test('from 1025 px: 36 px more above the title, 54 px under the band before the footer', () => {
  assert.match(css, new RegExp(`${TITLE} \\{ margin-top: calc\\(var\\(--spacing-default\\) \\+ 36px\\); \\}`));
  assert.match(css, /body\.brand-austrian main > \.section\.stage:last-child:has\(> \.flight-search-wrapper\.flight-search-band:last-child\) \{ margin-bottom: 54px; \}/);
});
