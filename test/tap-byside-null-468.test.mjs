/* eslint-disable max-len, import/extensions */
/* BySide's small print (brief 468): en-pt's call-back cards (8 of them, tools/importer/tap-click-to-call.json) link
   "For other subject, please contact us through the designated TAP service channels." to href="null" — www's widget
   writes the link so and it goes nowhere. tap-import.mjs bysideHtml keeps the text and drops such a link (null,
   undefined, '#', javascript:), its closing tag with it; real links as before.
   Run: node --max-old-space-size=256 --test test/tap-byside-null-468.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import { bysideHtml } from '../tools/importer/tap-import.mjs';

const c = { url: 'https://www.flytap.com/en-pt/miles-and-go/promotions', scope: new Set(), locale: 'en-pt' };

test('a link to "null" in BySide\'s HTML: its text without the link', () => {
  const v = 'This contact form is exclusive for the sale of flight extras. <a href="null">For other subject, please contact us through the designated TAP service channels.</a> TAP respects your privacy. To learn more, see: <a href="https://www.flytap.com/privacy">privacy policies</a>';
  assert.equal(bysideHtml(v, c), 'This contact form is exclusive for the sale of flight extras. For other subject, please contact us through the designated TAP service channels. TAP respects your privacy. To learn more, see: <a href="https://www.flytap.com/privacy">privacy policies</a>');
});

test('undefined, # and javascript: links the same; a nested strong kept', () => {
  assert.equal(bysideHtml('<a href="undefined"><b>a</b></a> <a href="#">b</a> <a href="javascript:void(0)">c</a>', c), '<strong>a</strong> b c');
});
