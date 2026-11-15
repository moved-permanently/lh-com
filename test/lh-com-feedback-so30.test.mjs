/* eslint-disable max-len */
/* Standing order 30 of 2026-11-15, item 2: lufthansa.com's feedback questionnaire as www's (feedback-eye; lh-parity-006's
   /ru/en/flights at 1440 and 390): 24 px in (www's questionnaire wrapper, 2.4rem; none on the right, so the question
   stays on one line at 390), the question 18 / 24 px bold, the answers as wide as their text and 15 px each side, 50 px
   high with www's 2 px #666 outline and divider, the text #666, 14 px below 768 px, 18 px from 768 px. lufthansa.com only
   (body.brand-lufthansa) and only in the block's own wrapper (the help app moves the block into its container).
   Gate: lh-parity-006's 14 recorded pages with the block, 1440 and 390, whole page: 2 better, 26 within 0.5, none worse.
   Run: node --max-old-space-size=256 --test test/lh-com-feedback-so30.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../blocks/feedback/feedback.css', import.meta.url), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const F = 'body.brand-lufthansa .feedback-wrapper > .feedback';

test('24 px in, on the left only', () => {
  assert.ok(css.includes(`${F} .feedback-question { padding-left: 24px; }`));
});

test('the question 18 / 24 px bold', () => {
  assert.ok(css.includes(`${F} .feedback-label { font-size: 18px; font-weight: 700; line-height: 24px; }`));
});

test('the answers: www\'s 2 px #666 outline and divider, 46 px inside (50 with the outline), 15 px each side, #666 text', () => {
  assert.ok(css.includes(`${F} .feedback-options { border: 2px solid var(--lh-grey-7); }`));
  assert.ok(css.includes(`${F} .feedback-option { min-width: 0; min-height: 46px; padding: 0 15px; color: var(--lh-grey-7); font-size: 14px; line-height: 20px; }`));
  assert.ok(css.includes(`${F} .feedback-option + .feedback-option { border-left: 2px solid var(--lh-grey-7); }`));
  assert.ok(css.includes(`@media (width >= 768px) { ${F} .feedback-option { font-size: 18px; line-height: 24px; } }`));
});

test('lufthansa.com only, and not the help app\'s block (moved out of its wrapper)', () => {
  const rules = css.match(/[^{}]*\.feedback-wrapper > \.feedback[^{]*\{/g) || [];
  assert.ok(rules.length >= 6);
  assert.ok(rules.every((r) => r.includes('body.brand-lufthansa')));
  assert.ok(!css.includes('.feedback-form-container .feedback-wrapper'));
});
