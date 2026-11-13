/* eslint-disable max-len */
/* Air Dolomiti: a photo inside a heading, after its text (standing order 22 of 2026-11-13, item 3). www draws it as a
   photo (airdolomiti-parity-005: street-food-in-munich's H3 "Last but not least, the Wiener Markt…" ends with a 1024 x 683
   picture at 1440); ours drew it as a heading icon, 26 x 26 (styles.css: a default-content heading's picture is an icon,
   2.6rem square), so the page was 742 px short at 1440 (-12.0 %). In the 1,569 local Air Dolomiti documents such a
   picture is in 9 headings (street-food-in-munich and the archistar airport articles in it, en, de: airport photos); the
   4 headings that open with their picture keep the icon. The theme draws a heading's picture that does not open it as a
   picture of its own: its own size, at most the column's width, on its own line.
   Run: node --test test/airdolomiti-heading-photo-so22.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/airdolomiti.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
const base = fs.readFileSync(new URL('../styles/styles.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
const HEADING = 'body.brand-airdolomiti main .default-content-wrapper :is(h2, h3, h4, h5, h6):not(:has(> picture:first-child))';
const rule = (src, sel) => {
  const i = src.indexOf(`${sel} {`);
  return i < 0 ? '' : src.slice(i, src.indexOf('}', i));
};

test('a heading\'s picture after its text: its own size, at most the column, on its own line', () => {
  const pic = rule(css, `${HEADING} > picture`);
  const img = rule(css, `${HEADING} > picture img`);
  assert.ok(pic, 'the picture rule');
  assert.ok(img, 'the img rule');
  assert.match(pic, /display: block;/);
  assert.match(pic, /position: static;/);
  assert.match(pic, /margin-right: 0;/);
  assert.match(img, /width: auto;/);
  assert.match(img, /height: auto;/);
  assert.match(img, /max-width: 100%;/);
});

test('the heading icon (a picture that opens its heading) stays the shared 26 px rule, untouched', () => {
  assert.match(rule(base, 'main .default-content-wrapper :is(h2, h3, h4, h5, h6) > picture img'), /width: 26px;\s*height: 26px;/);
  assert.match(base, /main \.default-content-wrapper :is\(h2, h3, h4, h5, h6\):has\(> picture:first-child\) \{\s*display: flex;/);
  assert.ok(!/:has\(> picture:first-child\)\) > picture img \{[^}]*26px/.test(css), 'the theme does not resize the icon');
});

test('the rule outside any media query (every width)', () => {
  const i = css.indexOf(`${HEADING} > picture img {`);
  assert.ok(i >= 0, 'the rule');
  const depth = [...css.slice(0, i)].reduce((d, ch) => d + (ch === '{' ? 1 : ch === '}' ? -1 : 0), 0);
  assert.equal(depth, 0, 'at the top level');
});
