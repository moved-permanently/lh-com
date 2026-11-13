/* eslint-disable max-len */
/* Standing order 20, item 3: a Brussels article's gallery right after text on phones. www's column view below 768 px is
   .column-view { padding-top: 2rem } plus its item's padding-top 1rem (rem 10 px; 4rem / 0 from 768 px, our P51 rule):
   30 px more above the gallery than ours (text -> picture 48-51 px on www, 18-21 on ours, the-gambia, milan-citytrip,
   sun-in-march at 390; brussels-parity-009 / -010). A gallery opening its section (after the price bar or the header)
   is as www already and stays. Measured on the 15 recorded articles at 390: milan-citytrip -2.35 -> -1.27 %, prague
   -1.10 -> -0.10, manchester -1.20 -> -0.75, kenya -0.75 -> +0.32, vibrant-senegal -0.70 -> +0.40, tenerife -0.61 ->
   +0.30; sun-in-march +0.43 -> +0.92 (0.49 points further), the-gambia -0.55 -> +0.60 (0.05); 1440 untouched.
   Reads the theme CSS as written.
   Run: node --max-old-space-size=256 --test test/brussels-article-gallery-phone-so20.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/brussels.css', import.meta.url), 'utf8').replace(/\s+/g, ' ');

test('on phones a gallery right after text 30 px under it', () => {
  const at = css.indexOf('@media (width < 768px) { body.brand-brussels main:has(.article-header) .default-content-wrapper + .columns-media-wrapper > .columns-media.stacked {');
  assert.ok(at >= 0, 'no phone rule for an article gallery after text');
  const rule = css.slice(at, css.indexOf('}', at));
  assert.match(rule, /padding-top: 30px;/);
});

test('from 768 px the galleries keep P51\'s 40 / 20 px', () => {
  assert.match(css, /@media \(width >= 768px\) \{[^@]*body\.brand-brussels main:has\(\.article-header\) \.columns-media\.stacked \{ padding-block: 40px 20px; \}/);
});
