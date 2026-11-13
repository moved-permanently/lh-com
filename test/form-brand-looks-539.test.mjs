/* eslint-disable max-len */
/* The brief after 534, item 2: the core forms' look on Brussels and Austrian against the recordings.
   - Brussels (brussels-parity-004, /be/en/contact/feedback/general/other at 1440): band headlines Intelo Bold 36 / 39.6, their
     descriptions bold 18 / 19.8, subsection titles bold 18; the fields 50 px boxes (1 px sngrey8, 4 px corners, #f8f8f8),
     the checkboxes in sn-blue-3. Ours had lh-com's light headlines and underlined 58 px fields: +14 % on that page.
   - Austrian (austrian-parity-003): a band with a headline has it 36 px under its top (exclusive-charter-enquiry,
     private-check-in-counter, invoice-request-hungary: 72 px from a card to the next headline, ours 108), bold; the
     bands without one (notfallkontakt, emergency-contact) keep brief 445's 72 px.
   Run: node --max-old-space-size=256 --test test/form-brand-looks-539.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = (brand) => fs.readFileSync(new URL(`../styles/themes/${brand}.css`, import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const rule = (src, sel) => (src.match(new RegExp(`(?:^|\\} )${sel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')} \\{([^}]*)\\}`)) || [])[1] || '';

test('Brussels: 50 px boxed fields, bold band headlines and descriptions, sn-blue-3 controls', () => {
  const b = css('brussels');
  assert.match(rule(b, 'body.brand-brussels .form.core'), /--form-field-height: 50px; --form-control-border: var\(--lh-marble-blue\);/);
  assert.match(rule(b, 'body.brand-brussels .form.core .form-step-title'), /font-weight: 700;/);
  assert.match(rule(b, 'body.brand-brussels .form.core .form-step-description'), /font-weight: 700;/);
  assert.match(b, /body\.brand-brussels \.form\.core :is\(\.form-field-text[^{]*\) > \.form-control \{ padding: 19px 11px 5px; border: 1px solid var\(--lh-grey-8\); border-radius: 4px; background-color: var\(--lh-grey-1\);/);
  assert.ok(!/body\.brand-brussels \.form(?!\.core)/.test(b), 'only the core forms');
});

test('Austrian: a band with a headline 36 px padded at the top and its headline bold; the others as brief 445', () => {
  const a = css('austrian');
  assert.match(rule(a, 'body.brand-austrian .form.core .form-step'), /padding: 72px 0 36px;/);
  assert.match(rule(a, 'body.brand-austrian .form.core .form-step:has(.form-step-title)'), /padding-top: 36px;/);
  assert.match(rule(a, 'body.brand-austrian .form.core .form-step-title'), /font-weight: 700;/);
});
