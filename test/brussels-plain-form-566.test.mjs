/* eslint-disable max-len */
/* The brief after 566 (the ranking against brussels-parity-004): /il/en/rebooking-request-birthright, +12.1 % at 1440 and
   +7.4 % at 390 on brussels.turnsthe.page. Its core form has no band (no step row: the only one of the 101 Brussels core
   forms), so the form block makes one plain step, and the core form's card stays in the right 7/12 with its white fill
   and 30 / 20 px padding. www draws those fields straight on the grey band from its left edge: the note 40 px under the
   band's top, the fields 335 x 50 px every 74 px, the button 56 px under the last field (1440: Last name 473, Comments
   986-1034, SEND 1090; 390: 730, 1248-1298, about 1360). On a Brussels core form without bands the step is now drawn
   that way: no card fill or padding, the card across the step, 40 px above, none below (the field's 24 px and the
   button's 30). Banded forms as before. (Our captures also carry Turnstile's checkbox, 71 px above the button on every core
   form: the headless browser gets the interactive challenge; that is the capture, not the page.)
   Run: node --max-old-space-size=256 --test test/brussels-plain-form-566.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/brussels.css', import.meta.url), 'utf8').replace(/\s+/g, ' ');
const formJs = fs.readFileSync(new URL('../blocks/form/form.js', import.meta.url), 'utf8');

test('a Brussels core form without bands: its step 40 px from the band\'s top and none below', () => {
  assert.match(css, /body\.brand-brussels \.form\.core \.form-step-plain \{ padding-top: 40px; padding-bottom: 0; \}/);
});

test('its card across the step, without fill or padding (the fields on the grey band, from its left edge)', () => {
  const rule = css.match(/body\.brand-brussels \.form\.core \.form-step-plain \.form-step-card \{[^}]*\}/)?.[0] || '';
  assert.match(rule, /grid-column: 1 \/ -1;/);
  assert.match(rule, /margin: 0;/);
  assert.match(rule, /padding: 0;/);
  assert.match(rule, /background: none;/);
  // after form.css's (width >= 768px) rule that keeps a core card in the right 7/12: more specific, so it wins at any width
  assert.ok(rule.length > 0);
});

test('only the plain step: the form block marks a step plain when the form has no band', () => {
  assert.match(formJs, /\} else \{\s*step\.classList\.add\('form-step-plain'\);/);
  assert.doesNotMatch(css, /body\.brand-brussels \.form\.core \.form-step(?:-card)? \{[^}]*background: none/);
});
