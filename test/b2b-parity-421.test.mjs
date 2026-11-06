/* eslint-disable max-len -- dev tooling */
/* B2B round 2 (brief 421, tools/reports/b2b/parity.md rows 10, 14-22): B2B-scoped rules against the
   capture b2b-parity-001 and www's CSS (styles.*.css, b2b.css v1.38.0):
   - row 10: two-column rows 106 px apart from 768 px (www's .column-view: 4rem above, 2rem below,
     the item's 2rem, 2.6rem to the next view), not columns-media's 66;
   Run: node --max-old-space-size=512 --test test/b2b-parity-421.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const theme = () => fs.readFileSync(new URL('../styles/themes/b2b.css', import.meta.url), 'utf8').replace(/\s+/g, ' ');

test('row 10: columns-media rows 106 px apart from 768 px on B2B (www\'s column views), 66 below as before', () => {
  assert.match(theme(), /@media \(width >= 768px\) \{ body\.brand-b2b \.columns-media \{ gap: 106px; \} \}/);
});
