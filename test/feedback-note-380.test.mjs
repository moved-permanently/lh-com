/* The feedback block's optional note (brief 380, www.swiss.com's contact page: "Is there a topic
   missing?", "Please note that your feedback will not be answered...", Yes / No): a third cell
   between the question and the answers; two-cell blocks as before.
   Run: node --max-old-space-size=512 --test test/feedback-note-380.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html><head></head><body><main></main></body></html>');
globalThis.window = window;
globalThis.document = document;
globalThis.Node = window.Node;
const { default: decorate } = await import('../blocks/feedback/feedback.js');

const block = (html) => {
  const b = document.createElement('div');
  b.className = 'feedback block';
  b.innerHTML = html;
  document.querySelector('main').append(b);
  return b;
};
const text = (e) => (e ? e.textContent.replace(/\s+/g, ' ').trim() : null);

test('a third cell is the note, between the question and the answers', () => {
  const b = block('<div><div><p>Is there a topic missing?</p></div></div><div><div><p>Yes</p><p>No</p></div></div><div><div><p>Please note that your feedback will not be answered, but it will help to improve our service.</p></div></div>');
  decorate(b);
  const fs = b.querySelector('fieldset.feedback-question');
  assert.ok(fs, 'fieldset');
  const kids = [...fs.children].map((e) => e.className);
  assert.deepEqual(kids, ['feedback-label', 'feedback-note', 'feedback-options']);
  assert.equal(text(fs.querySelector('.feedback-note')), 'Please note that your feedback will not be answered, but it will help to improve our service.');
  assert.equal(fs.querySelector('.feedback-note').tagName, 'P');
  assert.deepEqual([...fs.querySelectorAll('input')].map((i) => i.value), ['Yes', 'No']);
});

test('two cells: no note, as before', () => {
  const b = block('<div><div>Was this information helpful?</div><div>Yes, No</div></div>');
  decorate(b);
  const fs = b.querySelector('fieldset.feedback-question');
  assert.deepEqual([...fs.children].map((e) => e.className), ['feedback-label', 'feedback-options']);
  assert.equal(b.querySelector('.feedback-note'), null);
});
