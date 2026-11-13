/* eslint-disable max-len */
/* ITA row 43 (standing order 9 of 2026-11-13, item 1's rest: the last section over the footer): a shared 20 px gap on
   ITA and SWISS failed the 0.5-point gate (21 pages), as www's gap depends on what ends the page; under a padded AEM
   section it is only that section's padding (residents-in-sicily: 40 px at 1440, 20 at 390, ita-parity-005), ours the
   padding and the section gap of 48 px. A padded last section (or the section that draws a heading-only padded
   section's padding, row 41) keeps no gap under it.
   Run: node --test test/ita-padded-last-592.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/ita.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');

test('a padded last section: no gap to the footer', () => {
  const sel = 'body.brand-ita main > .section.padded:last-child, body.brand-ita main > .section.padded:has(> .default-content-wrapper:only-child > :is(h2, h3):only-child) + .section:last-child';
  const i = css.indexOf(`${sel} {`);
  assert.ok(i >= 0, 'the rule');
  assert.match(css.slice(i, css.indexOf('}', i)), /margin-bottom: 0;/);
});
