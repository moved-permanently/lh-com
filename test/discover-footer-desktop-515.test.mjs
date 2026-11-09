/* eslint-disable max-len */
/* Discover's footer from 768 px (the brief after 515, item 2): at 1440 px www's footer (discover-parity-001, its
   shadow HTML rendered from the capture) is 731 px on de/en pages, 669 on de/de; ours 541 / 503. Brief 474 matched
   the phones only; the desktop footer kept lh-com's spacing. www, from the footer's top: the column titles 84 px
   under it (the stripes, then 40 px), the links 60 px under the titles (18/19.8 with 4 px under, 36 px margin);
   "Follow us" 16/28 with 4 px under and 36 px margin over the icons; no line before the legal links, which start
   72 px under the columns' last links (the columns' 24 px margin and the row's 48 px), 24 px between their rows,
   12 px under the last; the logo band 110 px (25 px over the logos, 61 under). Ours: 40, 49 (24 px margin), 12 px
   under Follow us, a divider and 30 px, the legal rows touching, nothing under them, the band 79 px.
   Run: node --max-old-space-size=256 --test test/discover-footer-desktop-515.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/discover.css', import.meta.url), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const desktop = (css.match(/@media \(width >= 768px\) \{ body\.brand-discover \.footer \.footer-inner \{[\s\S]*?\} \}/) || [''])[0];

test('one block for the footer from 768 px', () => assert.ok(desktop, 'the @media (width >= 768px) footer block'));

test('the column titles 84 px under the top, their links 60 px under the titles; Follow us 16/28, 36 px over the icons', () => {
  assert.ok(desktop.includes('body.brand-discover .footer .footer-inner { padding-top: 84px; }'));
  assert.ok(desktop.includes('body.brand-discover .footer .footer-column-title { margin-bottom: 36px; }'));
  assert.ok(desktop.includes('body.brand-discover .footer .footer-badge-heading { margin-bottom: 36px; padding-bottom: 4px; line-height: 28px; }'));
});

test('no divider; the legal links 72 px under the columns, rows 24 px apart, 12 px under the last; the logo band 110 px', () => {
  assert.ok(desktop.includes('body.brand-discover .footer .footer-divider { display: none; }'));
  assert.ok(desktop.includes('body.brand-discover .footer .footer-legal { row-gap: 24px; padding: 72px 0 12px; }'));
  assert.ok(desktop.includes('body.brand-discover .footer .footer-logos-inner { padding-bottom: 61px; }'));
});

test('the phone block as before (brief 474)', () => {
  assert.ok(/@media \(width < 768px\) \{ body\.brand-discover \.footer \.footer-inner \{ padding-top: 84px; \}/.test(css));
});
