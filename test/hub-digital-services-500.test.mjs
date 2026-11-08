/* eslint-disable max-len */
/* Brief 500 item 1, /de/en/digital-self-services (hub; no AEM sections on www: its groups are one-column views in the page
   column, each with a title and two rows of partner teasers, every row a three-column view of its own nested in the group,
   padded). Ours: one Cards Icon Text (partner) block per row after the title. Against lh-parity-002 at 1440: the first row
   40 px further under the title, 56 px more between the rows, 39 px more under the last row; at 390 20, 56 and 60. Only these documents have
   partner blocks after a heading or one right after another (the local documents: 7 versions of this page; giftvoucher,
   gefaehrliche-gegenstaende and the others have one flat row view).
   Run: node --test test/hub-digital-services-500.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync('styles/styles.css', 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const A = 'body.brand-lufthansa main .default-content-wrapper:has(> :is(h2, h3):last-child) + .cards-icon-text-wrapper > .cards-icon-text.partner';
const B = 'body.brand-lufthansa main .cards-icon-text-wrapper:has(> .cards-icon-text.partner) + .cards-icon-text-wrapper > .cards-icon-text.partner';
const C = 'body.brand-lufthansa main .cards-icon-text-wrapper:has(> .cards-icon-text.partner) + .cards-icon-text-wrapper:not(:has(+ .cards-icon-text-wrapper)) > .cards-icon-text.partner';

test('partner rows nested in a titled group: 20 / 56 / 60 px below 768 px', () => {
  assert.ok(css.includes(`${A} { padding-top: 20px; } ${B} { padding-top: 56px; } ${C} { padding-bottom: 60px; }`));
});

test('from 768 px: 40 px under the title, 39 under the last row (56 between them as below)', () => {
  assert.ok(css.includes(`@media (width >= 768px) { ${A} { padding-top: 40px; } ${C} { padding-bottom: 39px; } }`));
});
