/* eslint-disable max-len, import/extensions */
/* TAP's stage and banner titles (brief 480, tools/reports/tap/parity.md row 116; sweep 2026-11-08): www.flytap.com's
   slides (the homepage stage, the inner pages' banners) carry their titles in a span, no heading; ours were h2s (three
   or four extra h2s on every homepage). On brand tap hero-campaign-tap.js turns a slide's h2 to h6 into a paragraph
   of the class hero-campaign-heading, its content kept; an h1 stays (one h1 a page); tap.css styles the class as the
   headings were. Another brand's hero-campaign is unchanged (hero-campaign-tap.js is loaded on brand tap only).
   Run: node --max-old-space-size=256 --test test/tap-stage-titles-480.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<html><body></body></html>');
globalThis.window = window;
globalThis.document = document;
const { plainTitles } = await import('../blocks/hero-campaign/hero-campaign-tap.js');

test('a slide\'s h2 becomes a paragraph hero-campaign-heading with its content; an h1 stays', () => {
  document.body.innerHTML = '<div class="hero-campaign slider"><div class="hero-campaign-slide"><div class="hero-campaign-content"><h2 id="portugal-stopover">Portugal <em>Stopover</em></h2><p class="hero-campaign-subtitle">Lead</p></div></div><div class="hero-campaign-slide"><div class="hero-campaign-content"><h3>Natal</h3></div></div><div class="hero-campaign-slide"><div class="hero-campaign-content"><h1>The page</h1></div></div></div>';
  const block = document.querySelector('.hero-campaign');
  plainTitles(block);
  assert.equal(block.querySelectorAll('h2, h3, h4, h5, h6').length, 0);
  const t = [...block.querySelectorAll('p.hero-campaign-heading')];
  assert.deepEqual(t.map((p) => p.innerHTML), ['Portugal <em>Stopover</em>', 'Natal']);
  assert.equal(block.querySelectorAll('h1').length, 1, 'the h1 kept');
  assert.equal(block.querySelector('.hero-campaign-subtitle').previousElementSibling.className, 'hero-campaign-heading');
});

test('the TAP slider calls it first; the theme styles the class as the headings were', () => {
  const js = fs.readFileSync(new URL('../blocks/hero-campaign/hero-campaign-tap.js', import.meta.url), 'utf8');
  assert.match(js, /block\.classList\.add\('hero-campaign-tap'\);\s+plainTitles\(block\);/);
  const css = fs.readFileSync(new URL('../styles/themes/tap.css', import.meta.url), 'utf8');
  assert.equal((css.match(/\.hero-campaign-tap(\.narrow)? \.hero-campaign-content :is\(h1, h2, h3, h4, h5, h6\)/g) || []).length, 0, 'every slide title rule has the class too');
  assert.ok((css.match(/\.hero-campaign-content :is\(h1, h2, h3, h4, h5, h6, \.hero-campaign-heading\)/g) || []).length >= 6);
  assert.match(css, /body\.brand-tap \.hero-campaign-tap \.hero-campaign-heading \{\s+color: inherit;\s+font-family: var\(--heading-font-family\);/);
});

test('the title paragraph is not padded as the slide\'s other text: TAP\'s padding reset reaches it (hero-campaign.css pads every child but headings and the subtitle by 64 px from 1025 px)', () => {
  const css = fs.readFileSync(new URL('../styles/themes/tap.css', import.meta.url), 'utf8');
  assert.match(css, /body\.brand-tap \.hero-campaign-tap \.hero-campaign-content > :not\(h1, h2, h3, h4, h5, h6, \.hero-campaign-subtitle\) \{\s+padding-left: 0;/);
});
