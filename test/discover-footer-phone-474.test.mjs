/* Discover's footer on phones (brief 474; ema-lufthansa's brand sweep, the footer rows): www's footer at
   390 (discover-parity-001, its CSS rendered from the capture) starts its sections 84 px under the top
   (the stripes, then 40 px), titles LufthansaHead 14/15.4 bold in a 13 px padded row whose white line
   stops 22 px from each side, 24 px between the sections; "Follow us" 14/28 with 36 px under it; no
   line before the legal links, which start 60 px under the icons, 24 px apart, 12 px further in, 41 px
   over the logo band, whose night sky blue part is 63 px. Ours: titles 18 px on a
   full-width line 47 px apart, the links 38 px apart under a divider (802 px, www 1,271).
   Run: node --max-old-space-size=256 --test test/discover-footer-phone-474.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/discover.css', import.meta.url), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const phone = (css.match(/@media \(width < 768px\) \{ body\.brand-discover \.footer \.footer-inner \{[\s\S]*?\} \}/) || [''])[0];

test('one phone block for the footer', () => assert.ok(phone, 'the @media (width < 768px) footer block'));

test('sections 84 px under the top, 24 px apart, the title 14/15.4 in a row inset 22 px with a white line', () => {
  assert.ok(phone.includes('body.brand-discover .footer .footer-inner { padding-top: 84px; }'));
  assert.ok(phone.includes('body.brand-discover .footer .footer-column:not(.footer-column-badges) { margin-bottom: 24px; }'));
  assert.ok(phone.includes('body.brand-discover .footer .footer-column-toggle { width: calc(100% - 44px); margin: 0 22px; padding: 13px 28px 13px 0; border-bottom-color: #fff; font-size: 14px; line-height: 15.4px; }'));
});

test('Follow us 14/28, 36 px over the icons; the legal links 60 px under them, 24 px apart, no divider', () => {
  assert.ok(phone.includes('body.brand-discover .footer .footer-column-badges { padding-top: 0; }'));
  assert.ok(phone.includes('body.brand-discover .footer .footer-badge-heading { margin-bottom: 36px; font-size: 14px; line-height: 28px; }'));
  assert.ok(phone.includes('body.brand-discover .footer .footer-divider { display: none; }'));
  // a wrapping row since Discover row 47 (short links side by side, 24 px apart, as www's)
  assert.ok(phone.includes('body.brand-discover .footer .footer-legal { flex-direction: row; gap: 24px; padding: 60px 0 41px 12px; }'));
  assert.ok(phone.includes('body.brand-discover .footer .footer-logos-inner { padding-bottom: 97px; }'), 'the logo band 115 px dark sky blue, then 63 px night sky blue');
});
