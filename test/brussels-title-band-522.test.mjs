/* eslint-disable max-len */
/* The brief after 521, item 2 (Brussels' ranking row 5, /be/en/extra-services/travel-insurances +8.0 % at 1440, +10.0 % at 390):
   the page title alone in a padded section, then a one-line grey band (the residents notice), then the page's text. www has
   the band right under the title and the text right under the band: the title to the band's text 84 px at 1440, the
   band's text to the next text 87 px (48 at 390); ours 161 and 136 (96 at 390): the title section's padding below and the
   section gap (40 + 48 at 1440, 20 + 48 at 390), and the band's section gap. The pair is on the travel-insurances documents
   (en, fr) only, so the rule names it: no padding below the title section and no gap after it on phones (12 px from 768
   px), no gap after the band.
   Run: node --max-old-space-size=256 --test test/brussels-title-band-522.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/brussels.css', import.meta.url), 'utf8').replace(/\s+/g, ' ');
const title = 'body\\.brand-brussels main > \\.section\\.padded:has\\(> \\.default-content-wrapper:last-child > h1:only-child\\):has\\(\\+ \\.section\\.grey\\)';

test('the title section before a grey band: no padding below, no gap on phones, 12 px from 768 px', () => {
  assert.match(css, new RegExp(`${title} \\{ padding-bottom: 0; margin-bottom: 0; \\}`));
  assert.match(css, new RegExp(`@media \\(width >= 768px\\) \\{ ${title} \\{ margin-bottom: 12px; \\} \\}`));
});

test('the band after it: no gap before the text', () => {
  assert.match(css, /body\.brand-brussels main > \.section\.padded:has\(> \.default-content-wrapper:last-child > h1:only-child\) \+ \.section\.grey \{ margin-bottom: 0; \}/);
});
