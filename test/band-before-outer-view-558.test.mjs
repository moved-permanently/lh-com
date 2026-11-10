/* eslint-disable max-len */
/* lufthansa.com: a grey band right before a heading that opens an outer column view ({... column-start-outer} on the next
   section's first heading; brief 558, rule 6, /de/en/exclusive-charter's "This might also be of interest to you", the
   only recorded page so): www's heading 24 px of ink under the band at 390 and 45 at 1440 (lh-parity-002a), ours 71 and
   92 with the band's 48 px section gap on top of the view's own padding. Such a band has no section gap.
   Run: node --max-old-space-size=256 --test test/band-before-outer-view-558.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/styles.css', import.meta.url), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');

test('a grey band before an outer column view\'s heading: no section gap', () => {
  assert.ok(css.includes('body.brand-lufthansa main > .section.grey:has(+ .section > .default-content-wrapper:first-child > :is(h2, h3, h4).column-start-outer:first-child) { margin-bottom: 0; }'));
});
