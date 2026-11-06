/* eslint-disable max-len, import/no-extraneous-dependencies -- dev tooling; linkedom is a dev dependency */
/* www's typo of a root path as a protocol-relative URL (/xx/ru/register-animal-cabin:
   href="//content/dam/…/LH_Animals_in_Cabin_Form_AUG26.pdf", a host called "content"): the cleanup
   (tools/importer/transformers/lufthansa-cleanup.js rewriteHref) left it as it was, a dead link on
   every host. Now //content/… is www's /content/…, rewritten like any www link (here to www's
   PDF; switch-dam-pdfs.mjs moves it to the site's copy once that is published). Other
   protocol-relative links (//www.lufthansa.com/…, //example.com/…) as before.
   Run: node --max-old-space-size=256 --test test/importer-protocol-relative.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';
import transform from '../tools/importer/transformers/lufthansa-cleanup.js';

const hrefs = (body) => {
  const url = 'https://www.lufthansa.com/xx/ru/register-animal-cabin';
  const { document } = parseHTML(`<html><head><title>T | Lufthansa</title></head><body><main><div class="section">${body}</div></main></body></html>`);
  const payload = { document, url, params: { originalURL: url } };
  transform('beforeTransform', document.body, payload);
  transform('afterTransform', document.body, payload);
  return [...document.querySelectorAll('a')].map((a) => a.getAttribute('href'));
};

test('//content/… is www\'s /content/…', () => {
  assert.deepEqual(
    hrefs('<p><a href="//content/dam/lh/documents/x/LH_Animals_in_Cabin_Form_AUG26.pdf">Form</a></p>'),
    ['https://www.lufthansa.com/content/dam/lh/documents/x/LH_Animals_in_Cabin_Form_AUG26.pdf'],
  );
});

test('other protocol-relative links as before', () => {
  assert.deepEqual(
    hrefs('<p><a href="//www.lufthansa.com/de/en/flights">a</a> <a href="//example.com/x">b</a></p>'),
    ['/de/en/flights', '//example.com/x'],
  );
});
