/* eslint-disable max-len */
/* Standing order 57, item 4 (place 282): a heading-icon carousel's title without an icon keeps the column's width.
   The heading-icon rule keeps 45px for the map icon after the title; the destinations' listings' closing title has
   none, so on /de/reiseziele at 390 "Nützliche Informationen für die Planung Ihrer Reise" ran to four lines in 326px
   (www: three in 351px). Run: node --max-old-space-size=256 --test test/airdolomiti-heading-icon-no-icon-so57.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/airdolomiti.css', import.meta.url), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const H2 = 'body.brand-airdolomiti main > .section.heading-icon:has(> .carousel-cards-wrapper > .carousel-cards:not(.promo, .destinations)) > .default-content-wrapper:first-child > h2';
const at = (sel) => css.indexOf(`${sel} {`);
const body = (sel) => (at(sel) < 0 ? null : css.slice(at(sel) + sel.length + 2, css.indexOf('}', at(sel))).trim());

test('a title with an icon keeps 45 px for it', () => {
  assert.match(body(H2), /max-width: calc\(100% \+ var\(--layout-margin\) - 45px\);/);
});

test('a title without an icon has the column\'s width, after the general rule', () => {
  const sel = `${H2}:not(:has(.heading-icon-image))`;
  assert.equal(body(sel), 'max-width: none;');
  assert.ok(at(H2) < at(sel));
});
