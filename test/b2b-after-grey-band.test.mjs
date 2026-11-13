/* eslint-disable max-len */
/* The brief after e035d652 / 6a7de8fe, item 2 (Group for Business, B2B theme): the space after a grey band. www's
   band is a column view with a full-width grey background; what follows starts under it with only its own space: the
   documents' {spacer-25} (58 of the white sections after a band), {spacer-30} (18), {spacer-60} (47), none (21).
   The collapse turns the 60 into the section's space-m style (its own spacer) and drops the 25 and 30; ours kept the
   48 px section gap on top. Measured on the 17 recorded pages with a band (b2b-parity-001 to -003): ours 48 px over
   www's after a space-m section (contact, celebrating-shared-stories, lhg-ita-airways), 22 over after a dropped
   spacer-25 (travel-id-now-required's "Published", corporates-start-of-booking). The rule before the collapse (a band
   before a spacer and text: no gap) no longer matched.
   Run: node --test test/b2b-after-grey-band.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/b2b.css', import.meta.url), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const body = (sel) => {
  const i = css.indexOf(`${sel} {`);
  return i < 0 ? null : css.slice(i + sel.length + 2, css.indexOf('}', i));
};

test('B2B: a grey band before a white section keeps 25 px under it (www\'s commonest spacer)', () => {
  const b = body('body.brand-b2b main > .section.grey:has(+ .section:not(.grey))');
  assert.ok(b, 'the rule');
  assert.match(b, /margin-bottom: 25px;/);
});

test('a white section that brings its own space (space-m, space-l, a divider) starts right under the band', () => {
  const b = body('body.brand-b2b main > .section.grey:has(+ .section:not(.grey):is(.space-m, .space-l, .divider))');
  assert.ok(b, 'the rule');
  assert.match(b, /margin-bottom: 0;/);
  assert.ok(css.indexOf('main > .section.grey:has(+ .section:not(.grey)) {') < css.indexOf('main > .section.grey:has(+ .section:not(.grey):is(.space-m, .space-l, .divider)) {'), 'after the 25 px rule');
});
