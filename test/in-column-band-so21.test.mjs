/* eslint-disable max-len */
/* Standing order 21 (2026-11-14), item 4: /de/en/lufthansa-express-bus. Its grey band sits inside a column view (style
   in-column); the column ends in the next section ("{column-end}" first, then the next column's "{column-start}"). www
   has the column's padding there, inside the view; ours added the section gap too: "Book Lufthansa Express Bus" 50 px
   lower. No section gap under such a band now: 14.5 / 10.1 -> 12.9 / 9.2 % at 390 / 1440 (injected trial). Census of the
   9,912 published copies: express-bus's 4 documents.
   Run: node --test test/in-column-band-so21.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/styles.css', import.meta.url), 'utf8');

test('an in-column grey band whose column ends in the next section has no section gap', () => {
  const at = css.indexOf('body.brand-lufthansa main > .section.grey.in-column:has(+ .section > .default-content-wrapper:first-child > p.column-end:first-child) {');
  assert.ok(at > 0, 'the rule');
  assert.match(css.slice(at, css.indexOf('}', at)), /margin-bottom: 0;/);
});
