/* The LCP image of a page whose first section has none (scripts/lcp-image.js, loadEager).
   Run: node --test test/*.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';
import prioritizeSecondSectionImage from '../scripts/lcp-image.js';

const IMG = (n) => `<picture><source type="image/webp" srcset="./m${n}.jpg?width=750&format=webply"><img loading="lazy" alt="" src="./m${n}.jpg?width=750&format=jpg"></picture>`;
const mainOf = (...sections) => parseHTML(`<html><body><main>${sections.map((s) => `<div class="section" data-section-status="initialized" style="display: none;">${s}</div>`).join('')}</main></body></html>`).document.querySelector('main');

test('a first section without an image: the second section\'s first image, eager and high priority', () => {
  const main = mainOf('<h1>Baggage</h1><div class="jump-links block"></div>', `<h2>Types</h2><div class="cards-teaser block">${IMG(1)}${IMG(2)}</div>`, IMG(3));
  const img = prioritizeSecondSectionImage(main);
  assert.equal(img.getAttribute('src'), './m1.jpg?width=750&format=jpg');
  assert.equal(img.getAttribute('loading'), 'eager');
  assert.equal(img.getAttribute('fetchpriority'), 'high');
  const others = [...main.querySelectorAll('img')].slice(1);
  assert.deepEqual(others.map((i) => [i.getAttribute('loading'), i.getAttribute('fetchpriority')]), [['lazy', null], ['lazy', null]]);
  assert.equal(img.closest('.section').style.display, 'none', 'its section stays hidden');
});

test('nothing changes when the first section has an image, the second none, or there is no second', () => {
  const withHero = mainOf(`<div class="hero block">${IMG(1)}</div>`, IMG(2));
  assert.equal(prioritizeSecondSectionImage(withHero), null);
  assert.deepEqual([...withHero.querySelectorAll('img')].map((i) => i.getAttribute('loading')), ['lazy', 'lazy']);
  assert.equal(prioritizeSecondSectionImage(mainOf('<h1>Text</h1>', '<p>More text</p>', IMG(3))), null);
  assert.equal(prioritizeSecondSectionImage(mainOf('<h1>Only</h1>')), null);
  assert.equal(prioritizeSecondSectionImage(null), null);
});
