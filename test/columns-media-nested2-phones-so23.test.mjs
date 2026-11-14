/* eslint-disable max-len */
/* Standing order 23 (2026-11-14), item 4: passengers-with-sensory-impairment's app badges at 390 (lh-snapshots-116).
   www's nested two-column view of images is .col-md-6.col-lg: below 768 px each image takes the whole cell, one under
   the other (the image's 4rem and the item's 1rem between them). Ours kept them side by side, small (option nested-2's
   picture strip). Census of the 9,912 published copies: nested-2 on passengers-with-sensory-impairment (15 documents)
   and digital-travel-companion (2). tools/parity/gate.mjs (injected trial): at/de, de/de, gb/en 13.5 / 13.5 / 13.8 ->
   8.6 / 8.6 / 8.6 at 390; de/en's older recording the same at 390 and 1440.
   Run: node --test test/columns-media-nested2-phones-so23.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../blocks/columns-media/columns-media.css', import.meta.url), 'utf8');

test('below 768px a nested-2 picture strip stacks its pictures at full width, 50px apart (lufthansa.com)', () => {
  const at = css.indexOf('body.brand-lufthansa .columns-media.nested-2 .columns-media-multi {');
  assert.ok(at > 0, 'the strip rule');
  const media = css.slice(css.lastIndexOf('@media', at), css.indexOf('{', css.lastIndexOf('@media', at))).trim();
  assert.equal(media, '@media (width < 768px)');
  const rule = css.slice(at, css.indexOf('}', at));
  assert.match(rule, /flex-direction: column;/);
  assert.match(rule, /gap: 50px;/);
  const item = css.indexOf('body.brand-lufthansa .columns-media.nested-2 .columns-media-multi > * {');
  assert.ok(item > at, 'the item rule');
  assert.match(css.slice(item, css.indexOf('}', item)), /width: 100%;/);
});
