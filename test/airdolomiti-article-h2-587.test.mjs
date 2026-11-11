/* eslint-disable max-len */
/* Air Dolomiti's article headings (standing order 4 of 2026-11-11, item 4, the ranking; AD row 110; airdolomiti-parity-001
   the Adriatic article in en, de and it, +2.9 to +3.8 % at 390): www's HtmlContent H2s are 26 / 32 px regular (400) with
   12 px over them, from 930 px 45 / 56 px with 0.9 px letter-spacing (www's CSS: .HtmlContent_innerContent h2). Ours were
   the brand's H2, 34 / 42 light (300) on phones, 38 / 46 from 930 px. The theme sets www's on an article's text (the
   sections after a stage whose card holds an H2: the articles' "Fly with us"; the destination pages' card holds the H1).
   Run: node --test test/airdolomiti-article-h2-587.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/airdolomiti.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
const H2 = 'body.brand-airdolomiti main:has(> .section.hero-card-overlay-container .hero-card-overlay.destination .hero-card-overlay-card > h2) > .section:not(.hero-card-overlay-container) > .default-content-wrapper > h2';
const all = (sel) => {
  const out = [];
  let i = css.indexOf(`${sel} {`);
  while (i >= 0) {
    out.push(css.slice(i, css.indexOf('}', i)));
    i = css.indexOf(`${sel} {`, i + 1);
  }
  return out;
};

test('an article\'s H2 26 / 32 px regular, 12 px over it; from 930 px 45 / 56 px, 0.9 px apart', () => {
  const [base, wide] = all(H2);
  assert.ok(base && wide, 'two rules');
  assert.match(base, /font-size: 26px;/);
  assert.match(base, /line-height: 32px;/);
  assert.match(base, /font-weight: 400;/);
  assert.match(base, /margin-top: 12px;/);
  assert.match(wide, /font-size: 45px;/);
  assert.match(wide, /line-height: 56px;/);
  assert.match(wide, /letter-spacing: 0.9px;/);
  const q = css.lastIndexOf('@media (width >= 930px)', css.indexOf(wide));
  assert.ok(q > css.indexOf(base), 'the 45 px in a 930 px query after the base rule');
});
