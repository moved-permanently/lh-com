/* eslint-disable max-len, import/extensions */
/* www.swiss.com's pinned stages (brief 450, item 5: ch/de's A350 0.31 and SWISS Senses 0.64 of
   www's height): their .inspiration-teaser-animation teasers stay at the top of the window while
   the page scrolls on by half of the window's and the stage's height together (GSAP pin spacers:
   tall 810 px + 855 px at a 900 px window, 827 px at 844; regular 640 px + 770 / 742 px).
   - blocks/hero-campaign option pinned: the stage sticky at the top, its wrapper that much longer;
   - swiss-import.mjs withPinnedTeasers: the hero-campaign block of an animated teaser (by its
     heading) gets pinned and www's height option (tall: none, narrow, regular).
   Run: node --max-old-space-size=512 --test test/hero-pinned-450.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { withPinnedTeasers } from '../tools/importer/swiss-import.mjs';

const teaser = (cls, title) => `<div class="inspirationteaser image parbase section"><div class="cms-inspiration-teaser px-0 ${cls}"><div class="campaign-information"><h2>${title}</h2></div></div></div>`;
const SNAP = `<html><body>${teaser('full-width-bg inspiration-teaser-no-animation inspiration-teaser-tall', 'Airbus A350-900')}${teaser('inspiration-teaser-animation inspiration-teaser-tall', 'Zahlen und Fakten')}${teaser('inspiration-teaser-animation inspiration-teaser-regular', 'SWISS Senses&#8203;')}</body></html>`;
const hero = (opts, h, title) => `<div class="hero-campaign${opts}"><div><div><picture><img src="a.jpg"></picture></div></div><div><div><${h}>${title}</${h}></div></div></div>`;
const DOC = `<body><header></header><main><div>${hero(' narrow', 'h1', 'Airbus A350-900')}</div><div>${hero(' right narrow', 'h2', 'Zahlen und Fakten')}</div><div>${hero(' narrow', 'h2', 'SWISS Senses')}</div></main><footer></footer></body>`;

test('withPinnedTeasers: the animated teasers\' blocks pinned with www\'s height; a teaser without animation its height only; once', () => {
  const r = withPinnedTeasers(DOC, SNAP);
  assert.equal(r.made, 3);
  assert.ok(r.doc.includes(hero('', 'h1', 'Airbus A350-900')), 'tall: no height option, not pinned');
  assert.ok(r.doc.includes(hero(' right pinned', 'h2', 'Zahlen und Fakten')));
  assert.ok(r.doc.includes(hero(' regular pinned', 'h2', 'SWISS Senses')));
  assert.equal(withPinnedTeasers(r.doc, SNAP).made, 0);
  assert.equal(withPinnedTeasers(DOC, '<html><body></body></html>').doc, DOC);
});

test('the block\'s CSS: pinned sticky at the top, the wrapper half the window and the stage longer', () => {
  const css = fs.readFileSync(new URL('../blocks/hero-campaign/hero-campaign.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
  assert.ok(css.includes('.hero-campaign-wrapper:has(> .hero-campaign.pinned) { --hero-campaign-stage: 810px; padding-bottom: calc((100vh + var(--hero-campaign-stage)) / 2); }'));
  assert.ok(css.includes('.hero-campaign-wrapper:has(> .hero-campaign.pinned.narrow) { --hero-campaign-stage: 350px; }'));
  assert.ok(css.includes('.hero-campaign-wrapper:has(> .hero-campaign.pinned.regular) { --hero-campaign-stage: 640px; }'));
  assert.ok(css.includes('.hero-campaign.pinned { position: sticky; top: 0; }'));
});
