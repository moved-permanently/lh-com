/* eslint-disable max-len */
/* lufthansa.com styles, brief 540 (lh-parity-004a, the four lounges roots at 1440 and 390): a grey column band (Section
   Metadata column-band, grey: "Lounge-News", "Kostenloses WLAN in den Lounges") right before a column-view section.
   www stacks the views: the band, then the next view's 32 px padding (64 px from the band to the "Zugang zu unseren
   Lounges" picture); ours added the 48 px section gap between them (112 px). The band keeps no section gap before a
   column view; lufthansa.com only. Since standing order 5 (2026-11-12) not a flush band (test/nested-column-views-so5.test.mjs).
   Run: node --max-old-space-size=256 --test test/column-band-view-gap-540.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/styles.css', import.meta.url), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const SEL = 'body.brand-lufthansa main > .section.grey.column-band:not(.flush):has(+ .section.column-view)';

test('a grey column band before a column view: no section gap below it', () => {
  const i = css.indexOf(`${SEL} {`);
  assert.ok(i >= 0, 'the rule');
  assert.match(css.slice(i + SEL.length, css.indexOf('}', i)), /margin-bottom: 0;/);
});
