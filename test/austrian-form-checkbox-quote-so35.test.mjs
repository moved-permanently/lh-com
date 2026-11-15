/* eslint-disable max-len -- rule notes */
/* Standing order 35 (2026-11-15), items 1 and 2: three Austrian theme rules, as www's components draw them.
   - The core form's card on phones: 22 px from both edges, as www's (the shared card is 10 px wider on each side): the
     five recorded form pages at 390 have www's white card at x 22-367.
   - A checkbox's label as www's maui-checkbox, theme os: 16 px with 20 px lines, 0.45 px tracking, 12 px after the box
     (gated on austrian-parity-021's 390 first loads and the 1440 loads, Turnstile left out on both sides:
     gate-so35-austrian-form-checkbox.txt).
   - The author quote as www's .author-quote .quote-text: 22 px with 0.25 px tracking, 28 px untracked from 768 px.
   The rules stand before "the end of online-check-in", whose tests count selectors from there to the end of the file.
   Run: node --test test/austrian-form-checkbox-quote-so35.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const raw = fs.readFileSync(new URL('../styles/themes/austrian.css', import.meta.url), 'utf8');
const css = raw.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const at = (needle) => raw.indexOf(needle);

test('the form card on phones: no bleed, from 768 px the shared card', () => {
  assert.match(css, /@media \(width < 768px\) \{ body\.brand-austrian \.form\.core \.form-step-card \{ margin-inline: 0; \} \}/);
  assert.match(css, /body\.brand-austrian \.form\.core \.form-step-card \{ padding: 24px; \}/);
  assert.doesNotMatch(css, /@media \(width >= 768px\) \{ body\.brand-austrian \.form\.core \.form-step-card \{ margin-inline/);
});

test('a checkbox label: www\'s maui-checkbox tokens, the checkbox options only', () => {
  assert.match(css, /body\.brand-austrian \.form\.core \.form-option:has\(> input\[type="checkbox"\]\) \{ gap: 12px; line-height: 20px; letter-spacing: 0\.45px; \}/);
  assert.doesNotMatch(css, /\.form-option:has\(> input\[type="radio"\]\)/);
});

test('the author quote: 22 px tracked 0.25 px, 28 px untracked from 768 px; article quotes untouched', () => {
  const q = 'body\\.brand-austrian main:not\\(:has\\(\\.article-header\\)\\) \\.default-content-wrapper > blockquote > :first-child';
  assert.match(css, new RegExp(`${q} \\{ font-size: 22px; letter-spacing: 0\\.25px; \\}`));
  assert.match(css, new RegExp(`@media \\(width >= 768px\\) \\{ ${q} \\{ font-size: 28px; letter-spacing: 0; \\} \\}`));
  assert.doesNotMatch(css, /main:has\(\.article-header\)[^{]*blockquote/);
});

test('the rules stand before the end of online-check-in', () => {
  const end = at('/* the end of online-check-in');
  assert.ok(end > 0);
  ['.form.core .form-option:has(> input[type="checkbox"])', '.default-content-wrapper > blockquote > :first-child', 'margin-inline: 0;'].forEach((s) => {
    const i = at(s);
    assert.ok(i > 0 && i < end, s);
  });
});
