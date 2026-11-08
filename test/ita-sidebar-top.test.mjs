/* eslint-disable max-len */
/* The brief after 475, item 3 (ema-lufthansa's sweep, ita-parity-002: it/it online check-in): www's info page holds the h1 and
   the Quick Links in .airem-sidebar, whose padding (2rem, 4rem from 768 px) sets them below the breadcrumb; ours had the
   h1 41 px higher at 1440 and 21 at 390. A section with the aside that starts with the breadcrumb: the breadcrumb 20 px
   (40 px from 768 px) padding below it, which moves the content and the aside together (padding: no margin collapse).
   Run: node --max-old-space-size=256 --test test/ita-sidebar-top.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/ita.css', import.meta.url), 'utf8').replace(/\s+/g, ' ');

test('the breadcrumb of an aside section: 20 px below it, 40 px from 768 px', () => {
  assert.match(css, /body\.brand-ita main > \.section\.with-aside > \.breadcrumb-wrapper:first-child \{ padding-bottom: 20px; \}/);
  assert.match(css, /@media \(width >= 768px\) \{ body\.brand-ita main > \.section\.with-aside > \.breadcrumb-wrapper:first-child \{ padding-bottom: 40px; \} \}/);
});

// the brief after 479, item 4: it/en online check-in's content in sections of its own (the market passes: two of them
// markets-only), its h1's section after the picture's, the Quick Links joining the last of them. With the proposed document
// change (style sidebar-part on the sections between the h1's and the aside's: section-aside.js joins them as parts) the
// aside stands beside the h1; www's picture margin (34 px) and the sidebar's padding (40 px, 20 below 768 px) against our
// 48 px section gap: 26 px (6 px) more above, measured with the change simulated: h1 y 675 at 1440 and 372 at 390 (www's).
test('a section with the aside whose first part opens with the h1: 6 px above, 26 px from 768 px', () => {
  assert.match(css, /body\.brand-ita main > \.section\.with-aside:has\(> \.section-part:first-child > \.default-content-wrapper:first-child > h1:first-child\) \{ padding-top: 6px; \}/);
  assert.match(css, /@media \(width >= 768px\) \{ body\.brand-ita main > \.section\.with-aside:has\(> \.section-part:first-child > \.default-content-wrapper:first-child > h1:first-child\) \{ padding-top: 26px; \} \}/);
});
