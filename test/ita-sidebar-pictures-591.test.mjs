/* eslint-disable max-len */
/* ITA row 40 (standing order 8 of 2026-11-12, item 2, the next worst single ITA page: /it/en/world-of-ita-airways/
   discover-ita-airways/sustainability/iris -6.0 % at 390, ita-parity-005): www stacks the two pictures of the sidebar's
   media column (the SDG badges, the "Planet" circle) at the column's full width, about 32 px apart; ours set them side
   by side, each half as wide (163 x 54 and 163 x 163 at 390). The ITA theme stacks a sidebar's several pictures as the
   block's option stacked does, 32 px apart.
   Run: node --test test/ita-sidebar-pictures-591.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/ita.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const rule = (sel) => {
  const i = css.indexOf(`${sel} {`);
  assert.ok(i >= 0, `the rule ${sel}`);
  return css.slice(i, css.indexOf('}', i));
};

test('a sidebar\'s several pictures one under the other, 32 px apart', () => {
  const r = rule('body.brand-ita .columns-media.sidebar .columns-media-multi');
  assert.match(r, /flex-direction: column;/);
  assert.match(r, /gap: 32px;/);
  assert.match(r, /align-items: stretch;/);
});

test('each at the column\'s full width', () => {
  const r = rule('body.brand-ita .columns-media.sidebar .columns-media-multi > *');
  assert.match(r, /flex: none;/);
  assert.match(r, /width: 100%;/);
});
