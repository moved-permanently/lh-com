/* eslint-disable max-len */
/* Air Dolomiti's lead with its picture at the page's top (columns-media, option news: www's DescritionNews; the standing
   order of 2026-11-10, item 6, AD row 95; airdolomiti-parity-001 /en/services-on-board/in-flight-entertainment-system,
   +3.6 % at 1440). www's picture starts at the page's top (0 to 600 px), its first 120 px (80 on phones) under the fixed
   bar, the trail on it, the title 50 px under the picture at 650 at both widths. Ours had the trail in its own row and the
   picture under it (186 to 786 at 1440, 176 to 776 at 390): the title at 836 / 826. The trail is laid over the picture
   (under the bar) and the picture moves up by the bar's height. Not for the section style lead-under-trail (www.airdolomiti.de's
   German lead, row 108: the trail in its own row, test/airdolomiti-german-lead-587.test.mjs).
   Run: node --test test/airdolomiti-news-stage-567.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/airdolomiti.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
const TRAIL = 'body.brand-airdolomiti main > .section.hidden-heading:not(.lead-under-trail):first-child:has(> .columns-media-wrapper > .columns-media.news) > .breadcrumb-wrapper:first-child';
const rules = (sel) => [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].filter((m) => m[1].trim() === sel).map((m) => m[2]);

test('the trail over the picture, under the bar', () => {
  const [base, wide] = rules(TRAIL);
  assert.match(base, /position: absolute;/);
  assert.match(base, /top: var\(--nav-height\);/);
  assert.match(base, /z-index: 3;/);
  assert.match(wide, /top: calc\(var\(--nav-height\) - 16px\);/, 'from 930 px 16 px higher, as www\'s');
});

test('the picture from the page\'s top: up by the bar\'s height, the hidden title\'s 24 px gone', () => {
  assert.match(rules('body.brand-airdolomiti main > .section.hidden-heading:not(.lead-under-trail):first-child > .breadcrumb-wrapper:first-child ~ .columns-media-wrapper:has(> .columns-media.news)')[0], /margin-top: calc\(-1 \* var\(--nav-height\)\);/);
  assert.match(rules('body.brand-airdolomiti main > .section.hidden-heading:not(.lead-under-trail):first-child > .breadcrumb-wrapper:first-child + .default-content-wrapper:has(+ .columns-media-wrapper > .columns-media.news)')[0], /margin-top: 0;/);
});
