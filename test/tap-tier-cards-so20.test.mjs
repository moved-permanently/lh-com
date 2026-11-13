/* eslint-disable max-len */
/* Standing order 20, item 3: the Miles&Go tier cards (row 32) spaced as www's card markup, the same on builds PJpl4JX and
   sJsYPUB (tap-parity-002 and -010): the card component 64 px under the intro from 728 px (www's components 64 apart;
   ours took the title-with-description 32 px rule, but www's intro here is a rich text of its own), the logo in a 72 px
   box (h-[72px]), 32 px from the logo to the title (gap-4 + mt-4) and from the title to the list (gap-4 + mt-4), each line
   24 px high (its 24 px chevron). Only a plain cards block with pictures (no one-up ... four-up): /en-pt/miles-and-go
   among the recorded pages. 1440 -1.62 -> +0.34 %, 390 -0.68 -> +0.19. Reads the theme CSS as written.
   Run: node --max-old-space-size=256 --test test/tap-tier-cards-so20.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/tap.css', import.meta.url), 'utf8').replace(/\s+/g, ' ');
const TIER = 'body.brand-tap .cards:not(.one-up, .two-up, .three-up, .four-up) > ul > li:has(> .cards-card-image)';
const rule = (sel) => {
  const at = css.indexOf(`${sel} {`);
  assert.ok(at >= 0, `no rule ${sel}`);
  return css.slice(at, css.indexOf('}', at));
};

test('the tier cards 64 px under the intro from 728 px', () => {
  const sel = 'body.brand-tap :where(header:not(.tap-home)) ~ main > .section > .default-content-wrapper + .cards-wrapper:has(> .cards:not(.one-up, .two-up, .three-up, .four-up) > ul > li > .cards-card-image)';
  assert.ok(css.includes(`@media (width >= 728px) { ${sel} {`), 'the 64 px rule from 728 px');
  assert.match(rule(sel), /margin-top: 64px;/);
});

test('the logo in a 72 px box, 32 px to the title and from the title to the list, 24 px lines', () => {
  assert.match(rule(`${TIER} .cards-card-image`), /min-height: 72px;/);
  assert.match(rule(`${TIER} .cards-card-body`), /margin-top: 32px;/);
  assert.match(rule(`${TIER} .cards-card-body > :is(h2, h3, h4) + ul`), /margin-top: 32px;/);
  assert.match(rule(`${TIER} .cards-card-body li`), /min-height: 24px;/);
});
