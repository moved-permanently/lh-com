/* eslint-disable max-len */
/* Running text: a word longer than its line breaks instead of widening the page (the brief after
   509, item 2; Air Dolomiti row 72): an Air Dolomiti post (articoli/didyouknow/come-si-vernicia-...)
   writes https://www.facebook.com/AirDolomiti/videos/207181273460345/ as text in a paragraph, and at
   390 the page was 127 px wider than the screen (the self-check of the published pages). Headings
   and links already break such words (styles.css overflow-wrap: break-word); everything in main
   does too now, by inheritance, for every brand (one common rule, a no-op for every word that fits;
   a block that sets overflow-wrap: normal keeps its words whole).
   Run: node --max-old-space-size=512 --test test/text-wrap-510.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/styles.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');

test('row 72: running text in main breaks a word longer than the line', () => {
  assert.ok(css.includes('} main { overflow-wrap: break-word; }'));
});

test('row 72: no brand theme sets its own (the common rule only)', () => {
  fs.readdirSync(new URL('../styles/themes/', import.meta.url)).forEach((f) => {
    const theme = fs.readFileSync(new URL(`../styles/themes/${f}`, import.meta.url), 'utf8');
    assert.doesNotMatch(theme, /overflow-wrap/, f);
  });
});
