/* eslint-disable max-len */
/* Standing order 12 of 2026-11-13, item 3 (Discover): www's page title (h1.heading-large) keeps 60 px under it at 1440
   on every recorded page (discover-parity-001's measurements; the offers page's 26 px aside); ours took styles.css's
   --heading-margin-xxl, 40 px. Where the title follows the breadcrumb (additional-services, baggage, entertainment,
   families, flight-search: www's title at y 192, ours 186) it also starts 6 px lower on www. From 768 px a title right
   under the breadcrumb: its wrapper 34 px under it (styles.css's 28 + 6) and 60 px under the title. Not on phones (36
   against 32 px: 12 better, 9 worse) nor under a stage (check-in +7.4, santorini +2.5 at 1440: their pages are long
   enough already), nor on the offers page (26 px above the destination finder on www).
   Run: node --test test/discover-title-margin-so12.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/discover.css', import.meta.url), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const SECTION = 'body.brand-discover main > .section.breadcrumb-container:not(.destination-finder-container) > .breadcrumb-wrapper + .default-content-wrapper:has(> h1.heading-large:first-child)';

test('Discover from 768 px: a title under the breadcrumb 34 px under it and 60 px above what follows', () => {
  assert.ok(css.includes(`@media (width >= 768px) { ${SECTION} { margin-top: 34px; } ${SECTION} > h1.heading-large:first-child { margin-bottom: 60px; } }`));
});

test('not on phones, not under a stage by this rule (order 13 gives the title after a stage-only section its own)', () => {
  assert.ok(!/body\.brand-discover main \.default-content-wrapper > h1\.heading-large[^{]*\{ margin-bottom: 36px; \}/.test(css));
  assert.equal(css.split('margin-bottom: 60px').length, 3);
  assert.ok(css.includes('+ .section > .default-content-wrapper:first-child > h1.heading-large { margin-bottom: 60px; }'));
});
