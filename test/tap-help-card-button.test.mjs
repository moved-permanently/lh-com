/* eslint-disable max-len */
/* TAP's help cards (row 15, brief 416; www.flytap.com/pt-pt/ajuda, en-pt/help, every version, at
   1440 and 390, 2026-11-06): the cards' small buttons carry www's chevron_right after the label (its
   24 px icon box, 4 px from the text: flex-row-reverse gap-1) in the text's colour, www's gray-1200
   (#424045, not black). The chevron itself came with 0e6d273 (16 px, 8 px gap); here its size, gap
   and colour as www's. Run: node --test test/tap-help-card-button.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/tap.css', import.meta.url), 'utf8');
const rule = (sel) => {
  const esc = sel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return [...css.matchAll(new RegExp(`(?:^|\\n)${esc} \\{([^}]*)\\}`, 'g'))].map((m) => m[1]).join('\n');
};
const BUTTON = 'body.brand-tap .cards:is(.three-up, .two-up) a.button:any-link';

test('the label in www\'s gray-1200, 4 px from the chevron', () => {
  const r = rule(BUTTON);
  assert.match(r, /gap: 4px;/);
  assert.match(r, /color: #424045;/);
});

test('the chevron in a 24 px box as www\'s icon, in the text\'s colour', () => {
  const r = rule(`${BUTTON}::after`);
  assert.match(r, /width: 24px;/);
  assert.match(r, /height: 24px;/);
  assert.match(r, /background-color: currentcolor;/);
  assert.match(r, /M8\.6 5\.4/, 'Material\'s chevron_right');
});
