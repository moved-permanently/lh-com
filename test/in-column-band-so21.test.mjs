/* eslint-disable max-len */
/* Standing order 21 (2026-11-14), item 4: /de/en/lufthansa-express-bus. Its grey band sits inside a column view (style
   in-column); the column ends in the next section ("{column-end}" first, then the next column's "{column-start}"). www
   has the column's padding there, inside the view; ours added the section gap too: "Book Lufthansa Express Bus" 50 px
   lower. No section gap under such a band now: 14.5 / 10.1 -> 12.9 / 9.2 % at 390 / 1440 (injected trial). Census of the
   9,912 published copies: express-bus's 4 documents. Standing order 22 widened it to any grey band before its column's
   end, {column-end-outer} too (menus-on-long-haul-flights 10.99 / 18.26 -> 4.45 / 15.32 at 1440 / 390; 21 documents).
   Run: node --test test/in-column-band-so21.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/styles.css', import.meta.url), 'utf8');

test('a grey band whose column ends in the next section has no section gap (standing order 22: any grey band, {column-end} or {column-end-outer})', () => {
  const at = css.indexOf('body.brand-lufthansa main > .section.grey:has(+ .section > .default-content-wrapper:first-child > p.column-mark:is(.column-end, .column-end-outer):first-child) {');
  assert.ok(at > 0, 'the rule');
  assert.match(css.slice(at, css.indexOf('}', at)), /margin-bottom: 0;/);
});
