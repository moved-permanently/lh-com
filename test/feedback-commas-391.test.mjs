/* The feedback block's comma-separated answers (brief 391): the page decoration wraps a text-only
   cell in a paragraph, so "Yes, No" arrives as one <p>: still two answers, as the README says.
   Lists and one paragraph per answer as before. (SWISS's ch/en and ch/de contact pages of brief 380
   and ITA's it/it one use the comma form.)
   Run: node --max-old-space-size=512 --test test/feedback-commas-391.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html><head></head><body><main></main></body></html>');
globalThis.window = window;
globalThis.document = document;
globalThis.Node = window.Node;
const { default: decorate } = await import('../blocks/feedback/feedback.js');

const answers = (cell) => {
  const b = document.createElement('div');
  b.className = 'feedback block';
  b.innerHTML = `<div><div><p>Manca un argomento?</p></div></div><div><div>${cell}</div></div>`;
  document.querySelector('main').append(b);
  decorate(b);
  return [...b.querySelectorAll('input')].map((i) => i.value);
};

test('one paragraph with commas (the decorated "Sì, No"): two answers', () => {
  assert.deepEqual(answers('<p>Sì, No</p>'), ['Sì', 'No']);
  assert.deepEqual(answers('<p>Yes, No</p>'), ['Yes', 'No']);
});

test('as before: bare text with commas, a list, one paragraph per answer, one answer alone', () => {
  assert.deepEqual(answers('Ja, Nein'), ['Ja', 'Nein']);
  assert.deepEqual(answers('<ul><li>Yes</li><li>No</li></ul>'), ['Yes', 'No']);
  assert.deepEqual(answers('<p>Yes</p><p>No, thanks</p>'), ['Yes', 'No, thanks'], 'paragraphs keep their commas');
  assert.deepEqual(answers('<p>Yes</p>'), ['Yes']);
});
