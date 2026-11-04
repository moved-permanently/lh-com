/* eslint-disable max-len, import/extensions */
/* TAP, brief 363 (tools/reports/tap/parity.md rows 80, 81 and the accessibility rows):
   - row 80, the stage's previous and next as www's: Material's thin chevron (weight 300) in TAP's
     dark green, on a white disc from 1025 px; at the first slide previous, at the last next shown
     unavailable (www: a grey disc at 20 %), aria-disabled and inert while it stays focusable
     (blocks/hero-campaign/hero-campaign-tap.js, styles/themes/tap.css);
   - row 81, the single inner banner's picture as www's: a flat 20 % veil, no gradient.
   Boolean asserts around linkedom nodes. Run: node --max-old-space-size=512 --test test/tap-363.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html lang="en"><head></head><body><main></main></body></html>');
window.matchMedia = () => ({ matches: true });
globalThis.window = window;
globalThis.document = document;

const css = fs.readFileSync(new URL('../styles/themes/tap.css', import.meta.url), 'utf8');
const { default: decorateTapSlider } = await import('../blocks/hero-campaign/hero-campaign-tap.js');

test('row 80: previous unavailable at the first slide, next at the last; a click on it does nothing', () => {
  const block = document.createElement('div');
  const track = document.createElement('div');
  track.id = 'track-1';
  const slides = [0, 1, 2].map(() => { const s = document.createElement('div'); track.append(s); return s; });
  block.append(track);
  document.querySelector('main').append(block);
  let index = 0;
  const moves = [];
  const goTo = (i) => { moves.push(i); };
  const button = (dir) => {
    const b = document.createElement('button');
    b.className = `hero-campaign-${dir}`;
    b.setAttribute('aria-label', dir);
    // hero-campaign.js's step wraps around
    b.addEventListener('click', () => goTo((index + (dir === 'next' ? 1 : -1) + 3) % 3));
    return b;
  };
  const dots = document.createElement('ol');
  decorateTapSlider(block, {
    slides, track, prev: button('prev'), next: button('next'), dots, goTo, current: () => index, motion: null, lang: 'en',
  });
  const prev = block.querySelector('.hero-campaign-controls .hero-campaign-prev');
  const next = block.querySelector('.hero-campaign-controls .hero-campaign-next');
  assert.equal(prev.getAttribute('aria-label'), 'prev', 'the same button, its name kept');
  assert.equal(prev.getAttribute('aria-disabled'), 'true');
  assert.equal(next.getAttribute('aria-disabled'), 'false');
  prev.dispatchEvent(new window.Event('click', { bubbles: true }));
  assert.deepEqual(moves, [], 'previous at the first slide: no step back to the last');
  next.dispatchEvent(new window.Event('click', { bubbles: true }));
  assert.deepEqual(moves, [1]);
  index = 2;
  track.dispatchEvent(new window.Event('scroll'));
  assert.equal(prev.getAttribute('aria-disabled'), 'false');
  assert.equal(next.getAttribute('aria-disabled'), 'true');
  assert.equal(next.hasAttribute('disabled'), false, 'still focusable');
  next.dispatchEvent(new window.Event('click', { bubbles: true }));
  assert.deepEqual(moves, [1]);
  block.remove();
});

test('row 80: the arrows\' look', () => {
  assert.match(css, /body\.brand-tap \.hero-campaign-tap :is\(\.hero-campaign-prev, \.hero-campaign-next\)::before \{\s*mask-image: url\("data:image\/svg\+xml,[^"]*M9\.7 18 8\.65 16\.95 13\.6 12 8\.65 7\.05 9\.7 6l6 6z[^"]*"\);/);
  assert.match(css, /body\.brand-tap \.hero-campaign-tap :is\(\.hero-campaign-prev, \.hero-campaign-next\)\[aria-disabled="true"\] \{\s*background-color: #c6c5c9;\s*opacity: 0\.2;\s*cursor: default;/);
  assert.match(css, /@media \(width >= 1024px\) \{[^@]*body\.brand-tap \.hero-campaign-tap \.hero-campaign-prev,\s*body\.brand-tap \.hero-campaign-tap \.hero-campaign-next \{\s*background: #fff;\s*color: var\(--lh-green\);/);
});

test('row 81: the single banner\'s picture under www\'s flat 20 % veil', () => {
  assert.match(css, /body\.brand-tap \.hero-campaign\.narrow:not\(\.slider, \.hero-campaign-slide\) \.hero-campaign-media::after \{\s*background: rgb\(0 0 0 \/ 20%\);\s*mix-blend-mode: normal;/);
});
