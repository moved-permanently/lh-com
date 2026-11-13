/* eslint-disable max-len */
/* Standing order 7 (2026-11-12), item 4: a flush grey band (lufthansa-sections: its AEM section has no .mb-default)
   before a padded section kept our 48 px section gap; www has only the padded section's top padding there. With no
   gap (injected on our live host, % off www at 1440 / 390): economy-class 17.9 / 29.7 -> 15.9 / 28.1, lhg-wifi
   13.6 / 14.7 -> 11.8 / 13.5, travel-insurances 15.1 / 14.6 -> 10.1 / 11.0, tips-senior-travellers unchanged. Before an
   unpadded section the gap stays: dropping it there made 35 recorded page-widths better and 35 worse.
   Run: node --max-old-space-size=256 --test test/grey-flush-padded-so7.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/styles.css', import.meta.url), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const SEL = 'body.brand-lufthansa main > .section.grey.flush:has(+ .section.padded)';

test('a flush grey band before a padded section: no section gap', () => {
  const i = css.indexOf(`${SEL} {`);
  assert.ok(i >= 0, 'the rule');
  assert.match(css.slice(i + SEL.length, css.indexOf('}', i)), /margin-bottom: 0;/);
});

test('only before a padded section, lufthansa.com only', () => {
  assert.ok(!css.includes('body.brand-lufthansa main > .section.grey.flush:not(:last-child)'), 'no blanket flush rule');
  assert.ok(SEL.startsWith('body.brand-lufthansa '));
});
