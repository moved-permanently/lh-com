/* eslint-disable max-len, import/extensions */
/* The cn/en footer's public security emblem (standing order 31). www.austrian.com/cn/en's legal row
   (austrian-parity-003, its PNGs at 1440 and 390) draws the "沪公网安备 31010102005102号" link as the
   arrow on a line of its own, then the emblem (27 px, 5 px before the text) and the text; from
   768 px the item takes the rest of its row and "Change Privacy Settings" starts a new one. The
   emblem is lh-austrian's /media-da/austrian/legal-cn/icon-beian.svg (brand-media-004), in the
   link before its text in the footer document. A picture in the legal row used to make the footer
   take that row for the logo row; the logo row is now the first section whose links are mostly
   pictures. Every brand's footer fixture decorates as before (footer-logos-first.test.mjs).
   Run: node --max-old-space-size=512 --test test/austrian-footer-emblem-so31.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const { footerOf, hashOf } = await import('./footer-harness.mjs');
const EMBLEM_TEXT = '沪公网安备 31010102005102号';

const legalOf = (block) => [...block.querySelectorAll('.footer-legal > li')].map((li) => li.textContent.replace(/\s+/g, ' ').trim());

test('cn/en footer without the emblem: nine legal links, text only, the logo row as before', async () => {
  const block = await footerOf('austrian', 'austrian-cn-en', '/cn/en/homepage');
  const legal = legalOf(block);
  assert.equal(legal.length, 9);
  assert.equal(block.querySelectorAll('.footer-legal img, .footer-legal picture').length, 0);
  assert.equal(block.querySelectorAll('.footer-legal-has-image').length, 0);
  assert.ok(block.querySelector('.footer-logos'), 'a logo row');
});

test('cn/en footer with the emblem: the picture and the text in the link, the rest unchanged', async () => {
  const plain = await footerOf('austrian', 'austrian-cn-en', '/cn/en/homepage');
  const plainLegal = legalOf(plain);
  const plainLogos = hashOf(plain.querySelector('.footer-logos'));
  const block = await footerOf('austrian', 'austrian-cn-en-emblem', '/cn/en/homepage');
  assert.deepEqual(legalOf(block), plainLegal, 'the same nine links and texts');
  assert.equal(hashOf(block.querySelector('.footer-logos')), plainLogos, 'the logo row as before');
  const items = block.querySelectorAll('.footer-legal-has-image');
  assert.equal(items.length, 1);
  const link = items[0].querySelector('a.footer-link.footer-link-has-image');
  assert.ok(link.getAttribute('href').startsWith('http://www.beian.gov.cn/'));
  const kids = [...link.children].map((c) => c.getAttribute('class') || c.tagName.toLowerCase());
  assert.deepEqual(kids.slice(0, 2), ['lh-icon lh-icon-arrow-right', 'footer-link-image-text'], 'the arrow, then the picture and text');
  const both = link.querySelector('.footer-link-image-text');
  assert.equal(both.children[0].tagName, 'PICTURE');
  assert.equal(both.children[1].textContent.trim(), EMBLEM_TEXT);
  const img = both.querySelector('img');
  assert.equal(img.getAttribute('src'), '/media-da/austrian/legal-cn/icon-beian.svg');
  assert.equal(img.getAttribute('alt'), '');
  assert.equal(img.getAttribute('aria-hidden'), 'true');
});

test('footer.css: the emblem line as www\'s, the row break from 768 px only', () => {
  const css = fs.readFileSync(new URL('../blocks/footer/footer.css', import.meta.url), 'utf8');
  assert.match(css, /\.footer \.footer-legal \.footer-link-image \{\s*width: 27px;\s*height: 27px;\s*margin-right: 5px;/);
  const wide = css.indexOf('@media (width >= 768px) {\n  .footer .footer-legal .footer-legal-has-image {');
  assert.ok(wide > 0, 'the row rules inside the 768 px query');
  assert.match(css.slice(wide), /^@media \(width >= 768px\) \{\n {2}\.footer \.footer-legal \.footer-legal-has-image \{\n {4}flex: 1 1 auto;\n {2}\}\n\n {2}\.footer \.footer-legal \.footer-legal-has-image \+ li \{\n {4}flex-basis: 100%;/);
});
