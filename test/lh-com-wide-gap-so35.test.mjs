/* eslint-disable max-len */
/* Standing order 35 of 2026-11-16, item 2: Columns Media option wide-gap, lufthansa.com on phones: rows 90px apart (the
   66px gap and 24px), www's card list on /de/en/discover-lufthansa/miles-and-more-credit-card (390: 15.58 -> 9.31 %
   against lh-parity-002). A rule for every padded view's picture-to-picture rows took crane, cabin-design and
   first-class-terminal further, so the option is set by a row where www's view is spaced so.
   Run: node --max-old-space-size=256 --test test/lh-com-wide-gap-so35.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../blocks/columns-media/columns-media.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');

test('option wide-gap: 24px more between rows on phones, lufthansa.com only', () => {
  assert.ok(css.includes('@media (width < 768px) { body.brand-lufthansa .columns-media.wide-gap > .columns-media-row + .columns-media-row { margin-top: 24px; } }'));
});
