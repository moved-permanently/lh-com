/* eslint-disable max-len */
/* lufthansa.com styles, brief 552 (lh-parity-004a, the four lounges roots): a column-view section right before a grey
   column band ("Welcome Lounge", then "Kostenloses WLAN in den Lounges"). www stacks the views: the text 37 px above the
   band at 1440 (the view's own 32 px padding); ours added the 48 px section gap (84 px). The view keeps no section gap
   before a grey column band, lufthansa.com only; the mirror of the band-before-view rule (brief 540).
   Run: node --max-old-space-size=256 --test test/column-view-band-gap-552.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/styles.css', import.meta.url), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const SEL = 'body.brand-lufthansa main > .section.column-view:not(.grey):has(+ .section.grey.column-band)';

test('a column view before a grey column band: no section gap below it', () => {
  const i = css.indexOf(`${SEL} {`);
  assert.ok(i >= 0, 'the rule');
  assert.match(css.slice(i + SEL.length, css.indexOf('}', i)), /margin-bottom: 0;/);
});

test('one :has() level, lufthansa.com only', () => {
  assert.ok(!/:has\([^()]*:has\(/.test(SEL));
  assert.ok(SEL.startsWith('body.brand-lufthansa '));
});
