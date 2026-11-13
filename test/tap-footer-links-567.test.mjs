/* eslint-disable max-len */
/* TAP's footer as www's (the standing order of 2026-11-10, item 6; TAP row 131, tap-parity-002, every recorded page at
   1440 37 to 38 px taller from the footer). www's footer links are text-body-s (14 px / 21 px; "Legal Information Hub"
   141 px wide against our 169 at 16 px, so "TAP Miles&Go Terms and Conditions" took two lines), and the footer's cards
   start at its top (lg:mt-16 under the page, no space inside), its rows 44 px apart (li 24 px, gap 20); ours had 16 / 24 px
   links and 16 px over the cards from 1024 px.
   Run: node --test test/tap-footer-links-567.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/tap.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
// the declarations of every rule with exactly this selector, in file order, merged (later wins)
const decls = (sel, media) => {
  const out = {};
  const re = /(@media[^{]*\{)|([^{}]+)\{([^{}]*)\}|(\})/g;
  let m;
  let inMedia = null;
  // eslint-disable-next-line no-cond-assign
  while ((m = re.exec(css))) {
    if (m[1]) inMedia = m[1].replace(/\s*\{$/, '').trim();
    else if (m[4]) inMedia = null;
    else if (m[2].trim() === sel && (media ? inMedia === media : !inMedia)) {
      m[3].split(';').map((d) => d.trim()).filter(Boolean).forEach((d) => { const [k, ...v] = d.split(':'); out[k.trim()] = v.join(':').trim(); });
    }
  }
  return out;
};

test('the links 14 px / 21 px (www\'s text-body-s), 44 px apart, none under the last', () => {
  const d = decls('body.brand-tap .footer .footer-tap-links .footer-link');
  assert.equal(d['font-size'], '14px');
  assert.equal(d['line-height'], '21px');
  assert.equal(d['margin-bottom'], '23px');
  assert.equal(decls('body.brand-tap .footer .footer-tap-links li:last-child > .footer-link')['margin-bottom'], '0');
});

test('from 1024 px no space over the cards', () => {
  assert.equal(decls('body.brand-tap .footer .footer-inner.footer-tap', '@media (width >= 1024px)')['padding-top'], '0');
});
