/* eslint-disable max-len */
/* The brief after 517, item 3 (Austrian against the recordings, austrian.turnsthe.page): below 768 px a tab set is a list of
   collapsible items (styles/section-tabs.css). www.austrian.com's items, on all five recorded pages with tabs (online-check-in,
   missing-baggage, travelling-with-animals, austrian-app, unterhaltung-an-bord): CoreSans 24/28 500, 52 px a one-line row
   (12 px above and below the title), the open item's title red (#d81e05), the others #1a1a1a; ours lh-com's 16/24 bold in
   51 px rows. Below an open item's content www leaves 64 px before the next item's rule (plus the last component's own
   margin: 69 px under austrian-app's picture, 100 under missing-baggage's button, 125 under online-check-in's form); ours
   none (lh-com's items touch). Run: node --max-old-space-size=256 --test test/austrian-tab-items-519.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/austrian.css', import.meta.url), 'utf8').replace(/\s+/g, ' ');

test('the items\' titles in www\'s type: CoreSans 24/28 500, 12 px above and below, the open one red', () => {
  assert.match(css, /body\.brand-austrian \.section-tab-panel > \.section-tab-toggle \{ padding: 12px 0; color: #1a1a1a; font-family: var\(--body-font-family\); font-size: calc\(24px \* var\(--a11y-scale, 1\)\); font-weight: 500; line-height: calc\(28px \* var\(--a11y-scale, 1\)\); \}/);
  assert.match(css, /body\.brand-austrian \.section-tab-panel > \.section-tab-toggle\[aria-expanded="true"\] \{ color: #d81e05; \}/);
});

test('below 768 px, 64 px under an open item\'s content before the next item (its last part, or the panel itself)', () => {
  assert.match(css, /@media \(width < 768px\) \{ body\.brand-austrian main > \.section\.section-tab-panel:has\(> \.section-tab-toggle\[aria-expanded="true"\]\):has\(\+ \.section-tab-panel\), body\.brand-austrian main > \.section\.section-tab-part:not\(\[hidden\]\):has\(\+ \.section-tab-panel\) \{ padding-bottom: 64px; \} \}/);
});
