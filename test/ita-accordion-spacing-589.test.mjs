/* eslint-disable max-len */
/* ITA's accordions 40 px from what comes before and after them on wide screens (standing order 6 of 2026-11-12, item 1, the
   ranking against ita-parity-005: /it/en/book-and-prepare/other-requests/travelling-with-pets/pets-in-cabin -4.9 % at
   1440, flying-with-a-baby -4.0 %, group-boarding -4.7 %, the accordion pages). www's accordion component sits 40 px
   under a text or a headline and 40 px over the next component at 1440 (24 / 20 at 390); ours had the section's 24 (32
   under an H2: its margin). From 992 px (www's Bootstrap lg) an accordion that is not the first of its section and the
   component after it get 40 px; on phones as before.
   Run: node --test test/ita-accordion-spacing-589.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/ita.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');

test('from 992 px an ITA accordion 40 px under what comes before it and 40 px over what follows it', () => {
  const m = css.match(/@media \(width >= 992px\) \{ body\.brand-ita main > \.section > \.accordion-columns-wrapper:not\(:first-child\), body\.brand-ita main > \.section > \.accordion-columns-wrapper \+ div \{ margin-top: 40px; \} \}/);
  assert.ok(m, 'the rule, in the 992 px query');
});

test('no other margin for the accordion on phones', () => {
  const outside = css.replace(/@media \(width >= 992px\) \{ body\.brand-ita main > \.section > \.accordion-columns-wrapper[^}]*\} \}/, '');
  assert.doesNotMatch(outside, /body\.brand-ita main > \.section > \.accordion-columns-wrapper[^{]*\{ margin-top/);
});
