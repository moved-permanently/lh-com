/* eslint-disable max-len */
/* Standing order 15, the Austrian ranking (Austrian row 54): a padded column view (our Columns Media option padded) after
   another block or after text starts lower on www than on ours. www's recordings (austrian-parity-015 / -017): on
   entryregulations the column titles 446 px apart within a block at 390 and 489 across the boundary into the padded
   one (ours 442 / 439); at 1440 a column's last line to the padded block's first picture 102 px (ours 59); on
   culinary-services the hero banner's text to it 99 px (ours 56). The padded block's top padding 82 px on phones and 75
   from 1025 px (ours 32 at every width) where it follows a block or text; after a heading as before (no recording of
   that case), and not in a section with a separator style above (space-s to -xl: austrian-app's space is www's already;
   with it the page went 1.41 points further). Reads austrian.css as written.
   Run: node --max-old-space-size=256 --test test/austrian-padded-columns-so15.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/austrian.css', import.meta.url), 'utf8');
const SEL = 'body.brand-austrian main > .section:not(.space-s, .space-m, .space-l, .space-xl) > :is(.columns-media-wrapper, .hero-banner-wrapper, .default-content-wrapper:not(:has(> :is(h1, h2, h3, h4, h5, h6):last-child))) + .columns-media-wrapper > .columns-media.padded:not(.sidebar)';
const rule = (sel, from = 0) => {
  const at = css.indexOf(`${sel} {`, from);
  return at < 0 ? { at, body: '' } : { at, body: css.slice(at, css.indexOf('}', at)) };
};

test('82 px above the first row on phones, after a block or text', () => {
  const r = rule(SEL);
  assert.ok(r.at >= 0);
  assert.match(r.body, /padding-top: 82px;/);
});

test('75 px from 1025 px', () => {
  const r = rule(`  ${SEL}`);
  assert.ok(r.at > 0);
  assert.match(css.slice(css.lastIndexOf('@media', r.at), r.at), /@media \(width >= 1025px\)/);
  assert.match(r.body, /padding-top: 75px;/);
});

test('no :has nested in a :has, and before the online-check-in parts', () => {
  assert.doesNotMatch(SEL, /:has\([^)]*:has\(/);
  assert.ok(rule(SEL).at < css.indexOf('/* the end of online-check-in'));
});
