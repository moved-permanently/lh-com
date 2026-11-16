/* eslint-disable max-len */
/* Standing order 49, item 3: the Austrian table option tight-rows. www's maui-table pads its body cells 24 px above and
   below the text (ours 32): /at/en/fly/check-in/private-check-in-counter's fee rows are 72 px on www, 88 here (1440
   +1.34 -> -0.27 %, 390 +1.38 -> +0.06 %, Turnstile's 71 px left out). Per document: the 24 px for every table stays
   HOLD (standing order 28: accessible-travel's cells hold www's empty paragraphs, which the import drops). No served
   Austrian document had the option before this order.
   Run: node --max-old-space-size=256 --test test/austrian-table-tight-rows-so49.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/austrian.css', import.meta.url), 'utf8').replace(/\s+/g, ' ');

test('option tight-rows: 24 px above and below the text of an Austrian table\'s body cells', () => {
  assert.ok(css.includes('body.brand-austrian .table-striped.tight-rows td { padding-top: 24px; padding-bottom: 24px; }'));
});

test('no 24 px for every Austrian table (order 28\'s HOLD)', () => {
  assert.ok(!/body\.brand-austrian \.table-striped (td|:is\(td, th\)) \{[^}]*padding/.test(css));
});
