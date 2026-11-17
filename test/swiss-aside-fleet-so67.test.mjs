/* eslint-disable max-len -- test descriptions */
/* Standing order 67 (2026-11-17), item 1 (token-free): order 65's {spacer-39 below-768} aside rows and the fleet hub's
   {spacer-47} / {spacer-61} rows, withdrawn in their other language versions, as SWISS rules instead.
   - The aside below 768 px: 60 px under the content when it has content (lh-com's 40; www's 80 took five recorded long
     pages more than half a point further, 60 none of the 86 recorded 390 page-widths). An aside that still starts with
     a spacer row (the ten live ch/en, ch/de documents until the cleanup pass) keeps its gap from the row.
   - The fleet hub's two-up teaser grid after text at the end of the page's last section: 44 px over it and 46 px under
     it, as padding (the rows' +90 px at 390 and 1440; ch/en's served copy with its rows keeps its figures: the grid isn't
     the section's last child there).
   Run: node --test test/swiss-aside-fleet-so67.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/swiss.css', import.meta.url), 'utf8');
const rule = (selector) => {
  const at = css.indexOf(`${selector} {`);
  assert.ok(at >= 0, `rule ${selector}`);
  return css.slice(at, css.indexOf('}', at));
};
const ASIDE = 'body.brand-swiss main > .section.with-aside > .section-aside:not(:empty, :has(> .default-content-wrapper:first-child > p.spacer:first-child))';
const FLEET = 'body.brand-swiss main > .section:last-child > .default-content-wrapper + .carousel-cards-wrapper:last-child:has(> .carousel-cards.grid.two-up)';

test('the aside: 60 px on phones only, not when empty, not when a spacer row starts it', () => {
  assert.match(rule(ASIDE), /margin-top: 60px;/);
  const at = css.indexOf(`${ASIDE} {`);
  const media = css.lastIndexOf('@media', at);
  assert.equal(css.slice(media, css.indexOf('{', media)).trim(), '@media (width < 768px)');
  assert.ok(!css.slice(media, at).includes('}\n}'), 'inside that media block');
});

test('the fleet hub\'s teaser grid: 44 / 46 px of padding at every width', () => {
  const r = rule(FLEET);
  assert.match(r, /padding-top: 44px;/);
  assert.match(r, /padding-bottom: 46px;/);
  const at = css.indexOf(`${FLEET} {`);
  const before = css.slice(0, at);
  assert.ok(before.lastIndexOf('@media') < before.lastIndexOf('}\n}\n'), 'not inside a media block');
});
