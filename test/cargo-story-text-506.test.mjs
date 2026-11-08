/* eslint-disable max-len */
/* Lufthansa Cargo, the transport stories' text on phones (the brief after 505, item 2; Cargo row 41):
   www's story text (story-text-background > .row > .col-md-12, 18/24) runs 380 px wide from x 5 at
   390 (cargo-parity-001, story 142 en and de); ours kept the page's 16 px margins (358 px), so each
   paragraph took more lines (story 142 +5.6 % and +6.1 % at 390). Below 768 px the text columns
   (columns-media) in a story's sections (those with its picture modules, hero-card-overlay (light))
   11 px into the margins on each side. Cargo's theme only.
   Run: node --max-old-space-size=512 --test test/cargo-story-text-506.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/cargo.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');

test('row 41: below 768 px a story\'s text columns 380 px wide from x 5, as www\'s', () => {
  const phone = css.split('@media (width < 768px)').slice(1).join(' ');
  assert.ok(phone.includes('body.brand-cargo main > .section:has(.hero-card-overlay.light) .columns-media .columns-media-text { margin-inline: -11px; }'));
});
