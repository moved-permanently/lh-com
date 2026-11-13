/* eslint-disable max-len */
/* TAP's inspiration categories as www's chips (the standing order of the night of 2026-11-10, item e; TAP row 136;
   tap-parity-004 /en-pt/destinations/get-inspired at 1440): www draws the categories as pills (40 px, 1 px #e0dfe2,
   the chosen one #65c922) centred in two rows under the centred title "Destinations and tips not to be missed", the
   chosen category's title centred 28 / 33.6 under them, as its FAQ picker (row 65). Row 134 makes the categories one
   section-tabs set named "categories"; the TAP theme styles that set's tab list and panels so (other tab sets as before).
   Run: node --test test/tap-inspire-chips-585.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/tap.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
const LIST = 'body.brand-tap main > .section.section-tabs:has(+ .section-tab-panel[data-tabs="categories"])';
const rule = (sel) => {
  const i = css.indexOf(`${sel} {`);
  assert.ok(i >= 0, `no rule ${sel}`);
  return css.slice(i, css.indexOf('}', i));
};

test('the categories\' tab list centred pills, the chosen one green', () => {
  assert.match(rule(`${LIST} .section-tabs-list`), /display: flex;[\s\S]*flex-wrap: wrap;[\s\S]*justify-content: center;/);
  const tab = rule(`${LIST} [role="tab"]`);
  ['min-height: 40px;', 'border: 1px solid #e0dfe2;', 'border-radius: 999px;', 'flex: 0 0 auto;'].forEach((d) => assert.ok(tab.includes(d), d));
  assert.match(rule(`${LIST} [role="tab"][aria-selected="true"]`), /background-color: #65c922;/);
});

test('the chosen category\'s title centred 28 / 33.6, the set\'s title centred', () => {
  assert.match(rule('body.brand-tap main > .section.section-tab-panel[data-tabs="categories"] > .default-content-wrapper:first-of-type > h2:first-child'), /text-align: center;/);
  assert.match(rule('body.brand-tap main > .section:has(+ .section.section-tabs + .section-tab-panel[data-tabs="categories"]) > .default-content-wrapper:last-child > h2:last-child'), /text-align: center;/);
});
