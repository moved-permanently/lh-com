/* eslint-disable max-len */
/* Cargo's transport story text on phones as www's one text (the standing order of 2026-11-10, item 6; cargo-parity-001's
   142 story at 390: ours 8,696 / 9,213 px en / de against www's 8,389 / 8,856). www's story-textWrap runs its text on
   in one column below 768 px; the import writes it as two cells of a columns-media, which stacked 36 px apart (the
   block's stacked cells), five modules on 142. Below 768 px a story's text cells join without that gap.
   Run: node --test test/cargo-story-cells-567.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/cargo.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
const phone = css.split('@media (width < 768px) {').slice(1).map((p) => p.slice(0, p.indexOf('\n}\n'))).join('\n}\n');
const SEL = 'body.brand-cargo main > .section:has(.hero-card-overlay.light) .columns-media .columns-media-row > .columns-media-text:not(:last-child)';

test('below 768 px a story\'s text cells without the gap between them', () => {
  const i = phone.indexOf(`${SEL} {`);
  assert.ok(i >= 0, SEL);
  assert.match(phone.slice(i, phone.indexOf('}', i)), /margin-bottom: 0;/);
});

test('only in a story\'s sections (the picture modules\' light stage), only on phones', () => {
  const base = css.replace(/@media[^{]*\{[\s\S]*?\n\}\n/g, '');
  assert.equal(base.includes(SEL), false);
});
