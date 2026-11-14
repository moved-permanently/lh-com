/* eslint-disable max-len */
/* Standing order 26 (2026-11-14), item 3: the card-row gap on phones (branch so26-card-row-gap). Below 768px, in a
   lufthansa.com Columns Media block that is not padded, sidebar or separated: the row after a row of text cells without a
   picture cell sits 24px closer (www's stacked column views); a text cell before an empty last cell keeps 24px under it
   (www stacks the empty item with its margin: online-check-in-info's page end); in a cell with a picture after its first
   element (the group airlines' tiles) the links are 5px taller (report-baggage, delayed-baggage-lhg: 55px from link to
   link, ours 50). Census (published copies): 214 documents with such a row, 140 with such an empty cell, 95 with such a
   tile. Gate (working-copy code of the branch, 29 page-widths at 390 against lh-parity-002a-d): see the branch's commit.
   Run: node --test test/columns-media-card-row-gap-so26.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../blocks/columns-media/columns-media.css', import.meta.url), 'utf8');
const rule = (selector) => {
  const at = css.indexOf(`${selector} {`);
  assert.ok(at > 0, selector);
  const media = css.slice(css.lastIndexOf('@media', at), css.indexOf('{', css.lastIndexOf('@media', at))).trim();
  return { media, body: css.slice(at, css.indexOf('}', at)) };
};

test('below 768px: the row after a text-only row 24px closer', () => {
  const r = rule('body.brand-lufthansa .columns-media:not(.padded, .sidebar, .separated) > .columns-media-row:has(> .columns-media-text):not(:has(> .columns-media-media)) + .columns-media-row');
  assert.equal(r.media, '@media (width < 768px)');
  assert.match(r.body, /margin-top: -24px;/);
});

test('below 768px: 24px under a text cell before an empty last cell; the tiles\' links 5px taller', () => {
  const e = rule('body.brand-lufthansa .columns-media:not(.padded, .sidebar, .separated) .columns-media-row > .columns-media-text:has(+ div:empty:last-child)');
  assert.equal(e.media, '@media (width < 768px)');
  assert.match(e.body, /margin-bottom: 24px;/);
  const l = rule('body.brand-lufthansa .columns-media .columns-media-text:has(> p:not(:first-child) > picture) > p.link-wrapper:not(.copytext-small, .copytext-medium, .copytext-large)');
  assert.equal(l.media, '@media (width < 768px)');
  assert.match(l.body, /padding-bottom: 5px;/);
});

test('as before: the empty last cell hidden and no margin before it in other blocks', () => {
  assert.match(css, /@media \(width < 768px\) \{\n {2}\.columns-media \.columns-media-row > div:empty \{\n {4}display: none;\n {2}\}\n\n {2}\.columns-media \.columns-media-row > div:has\(\+ div:empty:last-child\) \{\n {4}margin-bottom: 0;/);
});
