/* eslint-disable max-len */
/* ITA row 55 (standing order 17 of 2026-11-14, item 1): a spacer paragraph in a table cell ("{spacer-54}", the lines
   www's fare cells end with, "...<br><br><br>", which publishing drops) has its size; styles.css sizes spacers in default
   content only, so in a cell it had none. baggage-and-strollers with delta-so17-ita-baggage-and-strollers-cells.txt:
   1440 4108 -> 4237 (www 4446), 390 7005 -> 7530 (www 7882); none of the 39 recorded ITA pages has a spacer in a cell
   today, so no other page changes. Run: node --test test/ita-cell-spacer-600.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/ita.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const SEL = 'body.brand-ita main :is(td, th) > p.spacer';

test('a spacer in a cell has its size and no margin, at every width', () => {
  const i = css.indexOf(`${SEL} {`);
  assert.ok(i >= 0, 'the rule');
  const rule = css.slice(i, css.indexOf('}', i));
  assert.match(rule, /height: var\(--spacer-size\);/);
  assert.match(rule, /margin: 0;/);
  assert.equal(css.split(`${SEL} {`).length - 1, 1, 'only there');
  const before = css.slice(0, i);
  assert.equal((before.match(/@media/g) || []).length, (before.match(/@media[^{]*\{[^{}]*(\{[^{}]*\}[^{}]*)*\}/g) || []).length, 'not inside a media query');
});
