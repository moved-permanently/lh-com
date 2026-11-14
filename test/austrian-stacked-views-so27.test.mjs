/* eslint-disable max-len */
/* Standing order 27, item 4: an Austrian section that opens with a padded Columns Media right after a section that ends with
   one keeps www's space between the two column views: 99 px from one view's content to the next on www (each view its own AEM
   section, /at/en/special-requirements), ours 88 (the 48 px section gap and the views' 32 + 8). As padding (a margin would
   collapse into the section gap). Ranked on the 242 recorded Austrian page-widths: only special-requirements and
   besondere-anforderungen match, all four closer (en 1440 -1.22 -> -0.34 %, 390 -0.97 -> -0.37 %; de -0.48 -> -0.19 %,
   -0.45 -> -0.25 %).
   Run: node --max-old-space-size=256 --test test/austrian-stacked-views-so27.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/austrian.css', import.meta.url), 'utf8').replace(/\s+/g, ' ');
const SEL = 'body.brand-austrian main > .section:has(> .columns-media-wrapper:last-child > .columns-media.padded:not(.sidebar)) + .section > .columns-media-wrapper:first-child > .columns-media.padded:not(.sidebar)';
const rule = () => {
  const at = css.indexOf(`${SEL} {`);
  return at < 0 ? '' : css.slice(at, css.indexOf('}', at));
};

test('a padded view that opens a section after one that ends a section: 43 px above (32 + 11)', () => {
  assert.match(rule(), /padding-top: 43px;/);
  assert.doesNotMatch(rule(), /margin-top/);
});

test('the padded option itself keeps 32 px above', () => {
  const block = fs.readFileSync(new URL('../blocks/columns-media/columns-media.css', import.meta.url), 'utf8').replace(/\s+/g, ' ');
  assert.match(block, /\.columns-media\.padded \{ padding: 32px 0 8px; \}/);
});
