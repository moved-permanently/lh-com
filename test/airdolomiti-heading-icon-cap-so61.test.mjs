/* eslint-disable max-len */
/* Air Dolomiti's carousel title icons stay inside the 45 px kept for them (standing order 61): the "what to do" icon
   (a 200 x 163 picture, 36.8 px wide at 30 px high) ran 1.8 px past the screen on eight Italian and English destination
   pages at 390. The icon is at most 35 px wide, a wider picture scaled into its 35 x 30 box (contain).
   Run: node --test test/airdolomiti-heading-icon-cap-so61.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/airdolomiti.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');

test('the title icon at most 35 px wide, contained in its box', () => {
  const m = css.match(/> h2 \.heading-icon-image img \{([^}]*)\}/);
  assert.ok(m, 'rule found');
  ['max-width: 35px;', 'height: 30px;', 'object-fit: contain;'].forEach((d) => assert.ok(m[1].includes(d), d));
  // the 45 px the title keeps for the icon (10 px gap and the icon), unchanged
  assert.match(css, /max-width: calc\(100% \+ var\(--layout-margin\) - 45px\);/);
});
