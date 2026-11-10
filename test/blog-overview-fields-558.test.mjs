/* eslint-disable max-len */
/* lufthansa.com's Insights list filter (brief 558, /de/en/articles/explore-flying and the tag pages, lh-parity-002):
   www's maui fields have an underline and no box (#333, 1px), the category select's label "Categories" shows above it
   (12 px, #666), the icons sit on the text line; on phones the search underline 79 px under the result count's ink
   and the label 47 px under it (ours had 48 px boxes 20 px apart); from 1025 px the two fields take 837 px together
   (www's x 514 to 1351 at 1440, ours 600 px). Other brands' lists as before.
   Run: node --max-old-space-size=256 --test test/blog-overview-fields-558.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../blocks/blog-overview/blog-overview.css', import.meta.url), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const rule = (sel) => {
  const i = css.indexOf(`${sel} {`);
  assert.ok(i >= 0, sel);
  return css.slice(i, css.indexOf('}', i));
};

test('the fields: an underline, no box', () => {
  const r = rule('body.brand-lufthansa .blog-overview .blog-overview-filter input, body.brand-lufthansa .blog-overview .blog-overview-filter select');
  assert.match(r, /border: 0;/);
  assert.match(r, /border-bottom: 1px solid var\(--lh-grey-8\);/);
  assert.match(r, /border-radius: 0;/);
});

test('the category label shows above its select', () => {
  const r = rule('body.brand-lufthansa .blog-overview .blog-overview-select > label.blog-overview-sr');
  assert.match(r, /position: static;/);
  assert.match(r, /clip-path: none;/);
  assert.match(r, /font-size: 12px;/);
});

test('after a separator that ends the text above: no wrapper gap', () => {
  assert.ok(css.includes('body.brand-lufthansa main .default-content-wrapper:has(> p.spacer:last-child) + .blog-overview-wrapper { margin-top: 0; }'));
});

test('from 1025 px the fields take 837 px', () => {
  assert.ok(css.includes('@media (width >= 1025px) { body.brand-lufthansa .blog-overview .blog-overview-filter { flex: 0 1 837px; } }'));
});
