/* eslint-disable max-len */
/* Standing order 19, item 4 (Austrian row 57): a tab panel on phones (section-tab-panel, www's maui-tab-control-panel-
   responsive as an accordion below 768 px). www's open panel puts its content 12 px further in from each side (the text
   322 px wide at 390, ours 346: travel-id's "Austrian.com" paragraph one line longer on www) and 24 px more under the
   open header. Below 768 px the panel's parts get the layout margin plus 12 px at the sides, the first part 24 px more
   on top. Measured on the 61 recorded Austrian pages at 390: travel-id -2.79 -> -2.25 %, online-check-in -1.63 -> -1.21,
   austrian-app -0.04 -> +0.49; the others unchanged; from 768 px as before. Reads austrian.css as written.
   Run: node --max-old-space-size=256 --test test/austrian-tab-panel-inset-so19.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/austrian.css', import.meta.url), 'utf8').replace(/\s+/g, ' ');

test('below 768 px a tab panel\'s parts 12 px further in, the first 24 px lower', () => {
  assert.ok(css.includes('@media (width < 768px) { body.brand-austrian main > .section:is(.section-tab-panel, .section-tab-part) > div:not(.section-tab-toggle) { padding-right: calc(var(--layout-margin, 22px) + 12px); padding-left: calc(var(--layout-margin, 22px) + 12px); } body.brand-austrian main > .section.section-tab-panel > .section-tab-toggle + div { padding-top: 24px; } }'));
});
