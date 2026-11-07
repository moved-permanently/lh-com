/* eslint-disable max-len -- dev tooling */
/* Austrian's core forms (brief 445 item 5, /at/de/notfallkontakt and the emergency-contact pages): www's maui theme
   os draws the fields as 300 x 50 boxes (1 px #262626 border, 8 px radius, #f6f6f6 fill, the label inside 12 px
   from the left), each band's description beside its card 72 px under the band's top, the card 24 px padded and
   the subsection titles CoreSans 500 (austrian-parity-002 capture of /at/de/notfallkontakt at 1440 and 390).
   Ours had lufthansa.com's 335 x 58 underlined fields. Run: node --max-old-space-size=256 --test test/austrian-core-forms.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('the theme: Austrian core form fields as www\'s boxes, the bands and cards spaced as www\'s', () => {
  const css = fs.readFileSync(new URL('../styles/themes/austrian.css', import.meta.url), 'utf8').replace(/\s+/g, ' ');
  assert.match(css, /body\.brand-austrian \.form\.core \{ --form-field-height: 50px; --form-field-max-width: 300px; \}/);
  assert.match(css, /body\.brand-austrian \.form\.core :is\(\.form-field-text, [^)]*\) > \.form-control \{ padding: 19px 12px 5px; border: 1px solid #262626; border-radius: 8px; background-color: #f6f6f6; line-height: 24px; \}/);
  assert.match(css, /body\.brand-austrian \.form\.core \.form-step \{ padding: 72px 0 36px; \}/);
  assert.match(css, /body\.brand-austrian \.form\.core \.form-step-card \{ padding: 24px; \}/);
  assert.match(css, /body\.brand-austrian \.form\.core \.form-subsection-title \{ color: inherit; font-family: var\(--body-font-family\); font-size: 16px; font-weight: 500;/);
  // the underline's tick at the right end goes with the underline
  assert.match(css, /body\.brand-austrian \.form\.core :is\(\.form-field-text, \.form-field-email, \.form-field-tel, \.form-field-number\)::after \{ content: none; \}/);
});
