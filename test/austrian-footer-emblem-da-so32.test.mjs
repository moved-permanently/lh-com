/* eslint-disable max-len, import/extensions */
/* The cn/en footer's public security emblem as Document Authoring keeps it (standing order 32).
   Order 31's row put the emblem in the link before its text (austrian-cn-en-emblem.plain.html).
   DA cannot hold a picture and text in one link: the served copy after the upload (01db0303,
   fixture austrian-cn-en-emblem-da.plain.html, austrian.turnsthe.page/cn/en/footer as served on
   2026-11-14 at ~20:20 CET) has two links in that item, the picture alone and then the text, with
   the same href. The footer drew them as two legal items (+40 px at 1440, +41 at 390 against
   www's footer). A picture-only legal link followed by a link to the same address in the same
   item is one link: the picture before the text, as order 31's form.
   Run: node --max-old-space-size=512 --test test/austrian-footer-emblem-da-so32.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';

const { footerOf } = await import('./footer-harness.mjs');
const EMBLEM_TEXT = '沪公网安备 31010102005102号';

const legalOf = (block) => [...block.querySelectorAll('.footer-legal > li')].map((li) => li.textContent.replace(/\s+/g, ' ').trim());

test('DA\'s split emblem link: nine legal items as the order 31 form, the emblem item one link', async () => {
  const drafted = await footerOf('austrian', 'austrian-cn-en-emblem', '/cn/en/homepage');
  const want = legalOf(drafted);
  const block = await footerOf('austrian', 'austrian-cn-en-emblem-da', '/cn/en/homepage');
  const legal = legalOf(block);
  assert.equal(legal.length, 9);
  assert.deepEqual(legal, want, 'the same nine items and texts');
  const items = block.querySelectorAll('.footer-legal-has-image');
  assert.equal(items.length, 1);
  assert.equal(items[0].querySelectorAll('a').length, 1, 'one link in the emblem item');
  const link = items[0].querySelector('a.footer-link.footer-link-has-image');
  assert.ok(link.getAttribute('href').startsWith('http://www.beian.gov.cn/'));
  const kids = [...link.children].map((c) => c.getAttribute('class') || c.tagName.toLowerCase());
  assert.deepEqual(kids.slice(0, 2), ['lh-icon lh-icon-arrow-right', 'footer-link-image-text'], 'the arrow, then the picture and text');
  const both = link.querySelector('.footer-link-image-text');
  assert.equal(both.children[0].tagName, 'PICTURE');
  assert.equal(both.children[1].textContent.trim(), EMBLEM_TEXT);
  const img = both.querySelector('img');
  assert.equal(img.getAttribute('alt'), '');
  assert.equal(img.getAttribute('aria-hidden'), 'true');
});

test('the emblem\'s address once in the legal row, no address twice', async () => {
  const block = await footerOf('austrian', 'austrian-cn-en-emblem-da', '/cn/en/homepage');
  const hrefs = [...block.querySelectorAll('.footer-legal a')].map((a) => a.getAttribute('href'));
  assert.equal(hrefs.filter((h) => h.startsWith('http://www.beian.gov.cn/')).length, 1);
  assert.equal(new Set(hrefs).size, hrefs.length, 'no address twice');
});
