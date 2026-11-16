/* eslint-disable max-len */
/* Standing order 35, item 3: lufthansa.com's legal pages (body.legal, the Metadata Template of standing order 30): a
   numbered clause heading ("{heading-copytext-large}") right after a paragraph sits 50px under it at every width, as
   www (its grid columns keep the paragraph's 24px and the headline's margin apart; ours collapsed them to 24px at 390,
   40 at 1440). Gate (injected, recordings): /de/en/common/compensation-voucher 6.4 / 12.6 -> 5.4 / 9.0 % at 1440 / 390,
   the other 56 recorded legal page-widths within 0.5; 8 documents reach it, the 6 unrecorded rendered with and without
   (no sideways scroll, failed picture, overlap, clipped text or missing H1).
   Run: node --test test/legal-clause-heading-so35.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/styles.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');

test('legal pages: a clause heading after a paragraph 50px under it', () => {
  assert.ok(css.includes('body.brand-lufthansa.legal main .default-content-wrapper > p + :is(h2, h3, h4).heading-copytext-large { margin-top: 50px; }'));
});
