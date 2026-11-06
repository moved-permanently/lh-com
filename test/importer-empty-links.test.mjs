/* eslint-disable max-len, import/no-extraneous-dependencies -- dev tooling; linkedom is a dev dependency */
/* Links without anything to read (www's articles: <a href="…/fluege/stadt/muenchen">&#8203;</a>
   before the real link, the text only a zero-width space): screen readers announce an unnamed link
   and the target is a few pixels wide (axe link-name and target-size, the 2026-11-06 accessibility
   pass, /de/en/articles/explore-the-world/experience-nature). The cleanup
   (tools/importer/transformers/lufthansa-cleanup.js) drops them; links with text, an image or a
   label stay.
   Run: node --max-old-space-size=256 --test test/importer-empty-links.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';
import transform from '../tools/importer/transformers/lufthansa-cleanup.js';

const links = (body) => {
  const url = 'https://www.lufthansa.com/de/en/articles/explore-the-world/experience-nature';
  const { document } = parseHTML(`<html><head><title>T | Lufthansa</title></head><body><main><div class="section">${body}</div></main></body></html>`);
  const payload = { document, url, params: { originalURL: url } };
  transform('beforeTransform', document.body, payload);
  transform('afterTransform', document.body, payload);
  return [...document.querySelectorAll('a')].map((a) => a.textContent.replace(/\u200B/g, '') || a.getAttribute('aria-label') || (a.querySelector('img') ? 'img' : ''));
};

test('a link with nothing to read goes', () => {
  assert.deepEqual(links('<p><a href="https://www.lufthansa.com/de/de/fluege/stadt/muenchen" linkscheme="Hyperlink">​</a><em class="lh lh-arrow-right">​</em><a href="https://www.lufthansa.com/de/en/book-and-manage/offers-and-destination?City=SJO">Find flights</a></p>'), ['Find flights']);
  assert.deepEqual(links('<p>Text <a href="/de/en/flights"> </a></p>'), []);
});

test('links with text, an image or a label stay', () => {
  assert.deepEqual(links('<p><a href="/de/en/flights">Flights</a> <a href="/de/en/baggage" aria-label="Baggage"></a> <a href="/de/en/x"><img src="https://www.lufthansa.com/a.jpg" alt="A"></a></p>'), ['Flights', 'Baggage', 'img']);
});
