/* eslint-disable max-len */
/* The feedback question inside the help app as www's questionnaire there (the brief after 531, item 1;
   swiss-parity-003 /ch/en/help-center, ita-parity-003 /it/en/help-and-contact at 1440): the question bold (maui-label
   forms), the note copy-medium 14 px in half the column from 768 px (www's col-md-6: SWISS's two lines, ITA's one), 40 px above the
   answers (mb-5), the answers' segmented control 50 px high with each answer 15 px in (Yes 57 px, No 53 px). Ours: the
   question regular, the note 16 px across the column 20 px above 42 px answers 80 px wide. Elsewhere (lufthansa.com's
   /de/de/fluege, the pages' own questionnaire) the block as before.
   Run: node --max-old-space-size=512 --test test/feedback-in-help-app-535.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../blocks/feedback/feedback.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
const rule = (selector) => {
  const i = css.indexOf(`${selector} {`);
  assert.ok(i >= 0, selector);
  const body = css.slice(i + selector.length + 2, css.indexOf('}', i));
  return Object.fromEntries(body.split(';').map((d) => d.trim()).filter(Boolean).map((d) => d.split(/:\s*/)));
};
const IN = '.feedback-form-container .feedback';

test('in the help app: the question bold, the note 14 px in half the column 40 px above the answers', () => {
  assert.equal(rule(`${IN} .feedback-label`)['font-weight'], '700');
  const note = rule(`${IN} .feedback-note`);
  assert.deepEqual([note['margin-bottom'], note['font-size']], ['40px', '14px']);
  assert.equal(note['max-width'], '600px', 'www\'s 600 px column (the brief after 540: SWISS\'s note on two lines, ITA\'s on one)');
  const lx = rule(`body.maui-theme-lx ${IN} .feedback-note`);
  assert.deepEqual([lx['font-size'], lx['line-height']], ['16px', '24px'], 'SWISS\'s copy-medium 16 / 24 px');
});

test('in the help app: the answers 48 px high inside the control\'s border, 15 px in, no minimum width', () => {
  const o = rule(`${IN} .feedback-option`);
  assert.deepEqual([o['min-width'], o['min-height'], o.padding], ['0', '48px', '12px 15px']);
});

test('elsewhere the block as before', () => {
  const o = rule('.feedback .feedback-option');
  assert.deepEqual([o['min-width'], o['min-height'], o.padding], ['80px', '40px', '8px 24px']);
  assert.equal(rule('.feedback .feedback-note').margin, '0 0 20px');
});
