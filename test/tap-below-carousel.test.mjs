/* eslint-disable max-len, import/extensions */
/* TAP's homepage below "Plan your trip" (brief 331: www.flytap.com/en-pt at 1440 and 390 px):
   - the footer on brand tap (blocks/footer/footer-tap.js): www's two rounded cards, the link
     columns in one, a side card with the logo, "Follow us" and "TAP App" in the other, then the
     copyright bar; every other brand's footer as before (test/footer-logos-first.test.mjs keeps
     their markup's hashes);
   - the Miles&Go cards (columns-media option stack) and the Christmas banner (hero-card-overlay
     without its box): TAP-scoped rules in styles/themes/tap.css.
   Run: node --max-old-space-size=512 --test test/tap-below-carousel.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const { footerOf } = await import('./footer-harness.mjs');
const css = fs.readFileSync(new URL('../styles/themes/tap.css', import.meta.url), 'utf8');

test('footer on brand tap: the links card, the side card (logo, Follow us, TAP App), the copyright bar', async () => {
  const block = await footerOf('tap', 'tap', '/en-pt');
  const inner = block.querySelector('.footer-inner');
  assert.equal(inner.classList.contains('footer-tap'), true);
  assert.deepEqual([...inner.children].map((c) => c.className), ['footer-tap-links', 'footer-tap-side', 'footer-tap-bar']);
  const links = inner.querySelector('.footer-tap-links');
  assert.equal(links.querySelectorAll(':scope > .footer-columns > .footer-column').length, 3);
  const side = inner.querySelector('.footer-tap-side');
  const logo = side.firstElementChild;
  assert.equal(logo.className, 'footer-tap-logo');
  assert.equal(logo.querySelector('a').getAttribute('href'), '/en-pt');
  assert.ok(logo.querySelector('img[alt="TAP Air Portugal, back to the homepage"]'));
  assert.deepEqual([...side.querySelectorAll('.footer-badge-heading')].map((h) => h.textContent.trim()), ['Follow us', 'TAP App']);
  assert.equal(side.querySelectorAll('.footer-badges a').length, 7, 'five social links, two stores');
  const bar = inner.querySelector('.footer-tap-bar');
  assert.match(bar.textContent, /© 2026, TAP\. All rights reserved\./);
  assert.equal(block.querySelector('.footer-logos'), null, 'the logo row moved into the side card');
  assert.equal(block.querySelector('.footer-divider'), null);
});

test('footer: another brand\'s as before', async () => {
  const block = await footerOf('', 'lufthansa', '/de/en/homepage');
  assert.equal(block.querySelector('.footer-tap'), null);
  assert.equal(block.querySelector('.footer-tap-side'), null);
  const cargo = await footerOf('cargo', 'cargo', '/en/home');
  assert.equal(cargo.querySelector('.footer-tap'), null);
});

test('the Miles&Go cards and the Christmas banner: TAP-scoped rules for columns-media stack and hero-card-overlay', () => {
  assert.match(css, /body\.brand-tap \.columns-media\.stack > \.columns-media-row \{/);
  assert.match(css, /position: sticky;/);
  assert.match(css, /body\.brand-tap \.hero-card-overlay \.hero-card-overlay-card \{/);
  // every rule of the file under the brand's body class (test/brand.test.mjs checks the selectors)
  assert.doesNotMatch(css, /^\.columns-media|^\.hero-card-overlay|^\.footer/m);
});
