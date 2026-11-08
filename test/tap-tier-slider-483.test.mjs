/* eslint-disable max-len, import/extensions */
/* TAP's Miles&Go tier cards on phones (brief 483, tools/reports/tap/parity.md row 124; sweep 2026-11-08): www's
   swiper of 247 px cards 24 px apart with previous / next (40 px, green chevrons, the unavailable one faded) and a dot
   per card under them; ours a row to swipe without controls (the section about 110 px shorter at 390). On brand tap
   cards.js hands a list of cards with a picture (not three-up or four-up) to cards-tap.js, which adds the controls; the
   look is tap.css (from 1024 px the four cards in a row, no controls). Boolean asserts around linkedom nodes.
   Run: node --max-old-space-size=256 --test test/tap-tier-slider-483.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html lang="pt"><body></body></html>');
globalThis.window = window;
globalThis.document = document;
const { default: tierSlider, slideAt, TIER_LABELS } = await import('../blocks/cards/cards-tap.js');

const block = (n) => {
  document.body.innerHTML = `<div class="cards block"><ul>${Array.from({ length: n }, (_, i) => `<li><div class="cards-card-image"><picture><img src="/l${i}.jpg" alt=""></picture></div><div class="cards-card-body"><h3>Tier ${i}</h3></div></li>`).join('')}</ul></div>`;
  return document.querySelector('.cards');
};

test('four tier cards: previous, a dot each, next under the list; previous unavailable at the start; the labels in the page\'s language', () => {
  const b = block(4);
  tierSlider(b);
  const nav = b.querySelector(':scope > ul + .cards-tap-nav');
  assert.ok(nav, 'the controls after the list');
  const kids = [...nav.children];
  assert.ok(kids[0].matches('button.cards-tap-prev') && kids.at(-1).matches('button.cards-tap-next'));
  assert.equal(nav.querySelectorAll('.cards-tap-dot').length, 4);
  assert.equal(nav.querySelector('.cards-tap-prev').getAttribute('aria-disabled'), 'true');
  assert.equal(nav.querySelector('.cards-tap-next').getAttribute('aria-disabled'), 'false');
  assert.equal(nav.querySelector('.cards-tap-prev').getAttribute('aria-label'), TIER_LABELS.pt.prev);
  assert.equal(nav.querySelector('.cards-tap-dot[aria-current="true"]').getAttribute('aria-label'), `${TIER_LABELS.pt.slide} 1`);
});

test('the card in view from the scroll position; one card or a list without pictures: nothing added', () => {
  assert.equal(slideAt(0, 271, 4), 0);
  assert.equal(slideAt(140, 271, 4), 1);
  assert.equal(slideAt(5000, 271, 4), 3);
  assert.equal(slideAt(100, 0, 4), 0);
  const one = block(1);
  tierSlider(one);
  assert.ok(!one.querySelector('.cards-tap-nav'));
});

test('cards.js hands such a list to cards-tap.js on brand tap only; tap.css: 24 px apart, the controls on phones only', () => {
  const js = fs.readFileSync(new URL('../blocks/cards/cards.js', import.meta.url), 'utf8');
  assert.match(js, /if \(getMetadata\('brand'\)\.trim\(\)\.toLowerCase\(\) === 'tap' && !block\.matches\('\.three-up, \.four-up'\) && ul\.querySelector\(':scope > li > \.cards-card-image'\)\) \{\s+import\('\.\/cards-tap\.js'\)\.then\(\(m\) => m\.default\(block\)\);\s+\}/);
  const css = fs.readFileSync(new URL('../styles/themes/tap.css', import.meta.url), 'utf8');
  const part = css.slice(css.indexOf('the tier cards\' swiper controls (brief 483'));
  assert.ok(part.length > 100);
  assert.match(part, /body\.brand-tap \.cards \.cards-tap-nav \{\s+display: flex;/);
  assert.match(part, /@media \(width >= 1024px\) \{\s+body\.brand-tap \.cards \.cards-tap-nav \{\s+display: none;/);
  assert.match(part, /gap: 24px;/);
});
