/* eslint-disable max-len */
/* ITA row 45 (standing order 10 of 2026-11-13, item 3: /it/en/support/utilities/contact -5.3 % at 1440, -7.6 % at 390,
   ita-parity-005): www's contact rows are three-column views of their own, each padded 32 px above and below, so the
   next row's heading starts 89 px under the last text of the row before (479 -> 568 at 1440); ours, one Columns Media
   block with option padded, kept lufthansa.com's 66 px between its rows (row step 242 against www's 265). On ITA a
   padded Columns Media keeps 89 px between its rows.
   Run: node --test test/ita-padded-rows-593.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/ita.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');

test('an ITA padded Columns Media: 89 px between its rows', () => {
  const i = css.indexOf('body.brand-ita .columns-media.padded {');
  assert.ok(i >= 0, 'the rule');
  assert.match(css.slice(i, css.indexOf('}', i)), /gap: 89px;/);
});
