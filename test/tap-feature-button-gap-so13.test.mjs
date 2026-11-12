/* eslint-disable max-len, import/extensions */
/* TAP's feature views (columns-media feature / feature-small), standing order 13's ranking (TAP row 153): www's button
   is 24 px under the paragraph before it (brief 394: the paragraph's 8 px and the wrapper's 16). Brief 505's paragraph
   gap for the collapsed {blank} lines (p + p, 20 px in the feature views) also took the button's paragraph
   (p.button-wrapper), 36 px: a button is the component's own field after its rich text, never after a {blank} line.
   tap-parity-001 at 1440: leilões' "Como participar no leilão" www 24 px under its text, ours 36 (the block 24 px
   taller with the pair gap's 12); voar-economica's "Conhecer extras e Upgrades disponíveis" the same. The text pairs keep
   the brief 505 gap. Reads tap.css as written.
   Run: node --max-old-space-size=256 --test test/tap-feature-button-gap-so13.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/tap.css', import.meta.url), 'utf8');
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const body = (sel) => {
  const m = css.match(new RegExp(`(^|\\n)${esc(sel)}\\s*\\{([^}]*)\\}`));
  return m ? m[2] : null;
};
const PAIR = 'body.brand-tap main:where(.theme-live *) :is(.cards-teaser, .cards, .columns-media.feature, .columns-media.feature-small, .accordion-columns) p + p';
const BUTTON = 'body.brand-tap main:where(.theme-live *) :is(.columns-media.feature, .columns-media.feature-small) .columns-media-text > p + p.button-wrapper';

test('the text pairs keep brief 505\'s gap', () => {
  assert.match(body(PAIR) || '', /margin-top:\s*var\(--tap-paragraph-gap\);/);
});

test('a feature view\'s button paragraph is out of it: its 16 px and the paragraph\'s 8, as www\'s 24', () => {
  const r = body(BUTTON);
  assert.ok(r !== null, 'a rule for the button after a paragraph');
  assert.match(r, /margin-top:\s*0;/);
  // after the pair rule, so it wins at the same weight or more
  assert.ok(css.indexOf(BUTTON) > css.indexOf(PAIR));
});
