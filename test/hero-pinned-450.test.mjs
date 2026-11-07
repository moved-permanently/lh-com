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
  // www's heading with &nbsp; (ch/es, ch/ru, brief 453)
  assert.equal(withPinnedTeasers(DOC, SNAP.replace('Airbus A350-900', 'Airbus&nbsp;A350-900')).made, 3);
});

test('the block\'s CSS: pinned sticky at the top, the wrapper half the window and the stage longer', () => {
  const css = fs.readFileSync(new URL('../blocks/hero-campaign/hero-campaign.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
  assert.ok(css.includes('.hero-campaign-wrapper:has(> .hero-campaign.pinned) { --hero-campaign-stage: 810px; }'));
  // the scroll room is a spacer inside the wrapper: padding is outside the content box a sticky stage moves in
  assert.ok(css.includes(".hero-campaign-wrapper:has(> .hero-campaign.pinned)::after { content: ''; display: block; height: calc((100vh + var(--hero-campaign-stage)) / 2); }"));
  assert.ok(!/hero-campaign\.pinned\) \{[^}]*padding-bottom/.test(css));
  assert.ok(css.includes('.hero-campaign-wrapper:has(> .hero-campaign.pinned.narrow) { --hero-campaign-stage: 350px; }'));
  assert.ok(css.includes('.hero-campaign-wrapper:has(> .hero-campaign.pinned.regular) { --hero-campaign-stage: 640px; }'));
  assert.ok(css.includes('.hero-campaign.pinned { position: sticky; top: 0; }'));
});

// brief 455: www's stages got texts and buttons after the snapshots (ch/de's A350, ch/en's onboard
// catering on 2026-11-06); a block without them gets them after its heading
test('withTeaserTexts: www\'s teaser text and button after the heading where the block lacks them; once', async () => {
  const { withTeaserTexts } = await import('../tools/importer/swiss-import.mjs');
  const www = '<html><body><div class="cms-inspiration-teaser px-0 inspiration-teaser-animation inspiration-teaser-tall"><div class="campaign-information"><h2 class="headline">Zahlen und Fakten </h2><div class="information"><div class="richtext"><p>Seit 2025 erweitert SWISS ihre Flotte um zehn Airbus A350-900.</p></div><maui-button-link type="secondary" href="/ch/de/discover/a350/facts" theme="lx"> Zu den Zahlen und Fakten </maui-button-link></div></div></div>'
    + '<div class="cms-inspiration-teaser px-0 inspiration-teaser-tall"><div class="campaign-information"><h2 class="headline">Hinter den Kulissen</h2><div class="information"><div class="richtext"><p>In Toulouse.</p></div></div></div></div></body></html>';
  const d = `<body><header></header><main><div>${hero(' right', 'h2', 'Zahlen und Fakten')}</div><div><div class="hero-campaign"><div><div><picture><img src="b.jpg"></picture></div></div><div><div><h2>Hinter den Kulissen</h2><p>In Toulouse.</p></div></div></div></div></main><footer></footer></body>`;
  const r = withTeaserTexts(d, www);
  assert.equal(r.made, 1);
  assert.ok(r.doc.includes('<div><div><h2>Zahlen und Fakten</h2><p>Seit 2025 erweitert SWISS ihre Flotte um zehn Airbus A350-900.</p><p><a href="/ch/de/discover/a350/facts">Zu den Zahlen und Fakten</a></p></div></div>'), r.doc);
  assert.ok(r.doc.includes('<h2>Hinter den Kulissen</h2><p>In Toulouse.</p></div>'), 'a block with the text as it is');
  assert.equal(withTeaserTexts(r.doc, www).made, 0);
});
