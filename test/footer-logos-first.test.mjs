/* eslint-disable max-len, import/extensions */
/* The footer's sub-footer (blocks/footer, brief 255): a footer document whose logos section comes
   before its legal section (SWISS's, as www.swiss.com's sub-footer: SWISS logo and "Member of
   Lufthansa Group", the legal links, Star Alliance) gets the logo row in the legal row's place:
   logos left, the legal links in the middle, Star Alliance right, nothing below the link area.
   Every other brand's footer (their documents on preview, 2026-11-02: lufthansa.com, Discover,
   ITA, Austrian, Brussels, Cargo, Air Dolomiti, B2B) decorates as before: its markup's hash from
   before the change (test/fixtures/footers/hashes.json).
   Run: node --max-old-space-size=512 --test test/footer-logos-first.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const { footerOf, hashOf, FOOTERS } = await import('./footer-harness.mjs');
const HASHES = JSON.parse(fs.readFileSync(new URL('./fixtures/footers/hashes.json', import.meta.url), 'utf8'));

test('a footer\'s hash does not depend on where the checkout lives (aem.js: codeBasePath is its directory under node)', () => {
  const base = globalThis.window.hlx.codeBasePath;
  assert.ok(base, 'the checkout\'s directory');
  const icon = (src) => {
    const p = globalThis.document.createElement('p');
    p.innerHTML = `<img src="${src}" alt="">`;
    return p;
  };
  assert.equal(hashOf(icon(`${base}/icons/star-alliance.svg`)), hashOf(icon('/icons/star-alliance.svg')));
  assert.notEqual(hashOf(icon('/icons/star-alliance.svg')), hashOf(icon('/icons/other.svg')));
});

FOOTERS.forEach(([brand, file, page]) => {
  test(`${file}'s footer decorates as before`, async () => {
    assert.equal(hashOf(await footerOf(brand, file, page)), HASHES[file]);
  });
});

[['swiss', '/ch/en/homepage'], ['swiss-de', '/ch/de/homepage']].forEach(([file, page]) => {
  test(`SWISS's footer (${file}): the logo row in the legal row's place, logos left, legal links, Star Alliance right`, async () => {
    const block = await footerOf('swiss', file, page);
    assert.deepEqual([...block.children].map((c) => c.className), ['footer-main'], 'no logo row below the link area');
    const inner = block.querySelector('.footer-inner');
    assert.ok(inner.classList.contains('has-subfooter'));
    const sub = inner.querySelector(':scope > .footer-subfooter');
    assert.ok(sub, 'the sub-footer row');
    const prev = sub.previousElementSibling;
    assert.ok(prev && prev.classList.contains('footer-divider'), 'after the divider');
    assert.deepEqual([...sub.children].map((c) => c.className), ['footer-subfooter-logos', 'footer-legal', 'footer-subfooter-partner']);
    const logos = [...sub.querySelectorAll('.footer-subfooter-logos a')].map((a) => a.getAttribute('href'));
    assert.deepEqual(logos, ['https://www.swiss.com', 'https://www.lufthansagroup.com']);
    assert.ok(sub.querySelector('.footer-subfooter-logos img'), 'the logos are images');
    const partner = sub.querySelectorAll('.footer-subfooter-partner a');
    assert.equal(partner.length, 1);
    assert.equal(partner[0].getAttribute('href'), 'https://www.staralliance.com/');
    assert.ok(partner[0].classList.contains('footer-logo-star-alliance'));
    const legal = [...sub.querySelectorAll('.footer-legal a')].map((a) => a.getAttribute('href'));
    assert.equal(legal.length, 4);
    assert.equal(legal.at(-1), '#privacy-settings');
    assert.equal(inner.querySelectorAll('.footer-legal').length, 1, 'the legal links once');
    assert.ok(block.querySelector('.footer-badges a'), 'the social row as before');
  });
});

test('footer.css: the sub-footer row: three columns from 1025px, stacked below', () => {
  const css = fs.readFileSync('blocks/footer/footer.css', 'utf8');
  assert.match(css, /\.footer \.footer-subfooter \{[^}]*display: flex;/);
  assert.match(css, /@media \(width >= 1025px\) \{[^@]*\.footer \.footer-subfooter \{[^}]*justify-content: space-between;/);
});
