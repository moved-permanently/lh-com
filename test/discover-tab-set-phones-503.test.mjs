/* eslint-disable max-len */
/* Discover, a tab set on phones (brief 503, Discover row 37; the sweep after 501 on preview against
   discover-parity-001: Business Class +7 % at 390, Santorini +6 %): below 768 px a tab set is a
   stack of closed toggles (scripts/section-tabs.js) and www's sits in its text's flow, 32 px under
   the text above and the next heading right under the last toggle; ours kept the sections' 56 px
   gaps around it (89 px above the first toggle, 57 under the last). Below 768 px the section before
   a tab set, the set's placeholder section and its last panel's section without their gap. Discover's
   theme only. Run: node --max-old-space-size=512 --test test/discover-tab-set-phones-503.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/discover.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const phone = css.split('@media (width < 768px)').slice(1).join(' ');

test('row 37: below 768 px the tab set without the sections\' gaps around it', () => {
  assert.ok(phone.includes('body.brand-discover main > .section:has(+ .section.section-tabs), body.brand-discover main > .section.section-tabs, body.brand-discover main > .section.section-tab-panel:not(:has(+ .section.section-tab-panel)) { margin-bottom: 0; }'));
});

test('row 37: from 768 px the tab set\'s spacing as before (no such rule outside the phone block)', () => {
  const desktop = css.split('@media (width < 768px)').map((part, i) => (i ? part.slice(part.indexOf('}') + 1) : part)).join(' ');
  assert.ok(!desktop.includes('main > .section.section-tabs, body'), 'the rule only below 768 px');
});
