/* eslint-disable max-len */
/* Brief 582, rule 6: below 768px www draws a page's tabs as collapsible items whose label and open content sit 20 px in
   (/de/en/carry-on-baggage and unterhaltung-an-bord at 390: the text at x 43, ours at 23, its lines wrapping wider).
   Brand-scoped: the toggle's label padded 20 px, the panel's wrappers 20 px more than the layout margin.
   Measured at 390: advance-seat-reservation 22.5 -> 12.0 %, baggage-irregularities 18.3 -> 8.2, lufthansa-terminal-
   muenchen 19.7 -> 10.1, unterhaltung-an-bord 18.8 -> 14.8, climate-protection-projects 10.3 -> 8.0, carry-on-baggage
   7.0 -> 6.4, first-class and passengers-using-wheelchairs the same; 1440 untouched.
   Run: node --max-old-space-size=256 --test test/section-tab-inset-582.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/section-tabs.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');

test('below 768px: a tab\'s label and content 20 px in (lufthansa.com)', () => {
  assert.ok(css.includes('@media (width < 768px) { body.brand-lufthansa main > .section.section-tab-panel > .section-tab-toggle { padding-right: 20px; padding-left: 20px; } body.brand-lufthansa main > .section:is(.section-tab-panel, .section-tab-part) > div:not(.section-tab-toggle) { padding-right: calc(var(--layout-margin, 22px) + 20px); padding-left: calc(var(--layout-margin, 22px) + 20px); } }'));
});
