/* eslint-disable max-len */
/* Standing order 27 (2026-11-15), item 3: the Allegris tag pages (/<cc>/<ll>/articles/tags/allegris). Between the intro
   picture (a single-cell Columns Media block) and the article overview, www draws the heading "All Articles on Lufthansa
   Allegris" 26-27px lower than ours (picture to its first line 59 / 57px at 1440 / 390, ours 32 / 31). A lufthansa.com
   default-content block between a Columns Media block and a Blog Overview has 50px above it (the section's 24 + 26).
   Census (published copies): the four tags/allegris documents. Gate (injected against lh-parity): 6 of 8 page-widths
   better (1440 by 3.1 to 3.6 points, de/en and gb/en 390 by 4.4 and 4.8), de/de and at/de 390 +0.4.
   Run: node --test test/tag-overview-heading-so27.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/styles.css', import.meta.url), 'utf8');

test('50px above the heading between a Columns Media block and the article overview', () => {
  const sel = 'body.brand-lufthansa main > .section > .columns-media-wrapper + .default-content-wrapper:has(+ .blog-overview-wrapper)';
  const at = css.indexOf(`${sel} {`);
  assert.ok(at > 0, 'the rule');
  assert.match(css.slice(at, css.indexOf('}', at)), /margin-top: 50px;/);
  const before = css.slice(Math.max(0, at - 2000), at);
  assert.ok(!/@media[^{]*\{[^}]*$/.test(before.slice(before.lastIndexOf('}') + 1)), 'at every width');
});
