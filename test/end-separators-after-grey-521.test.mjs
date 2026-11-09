/* eslint-disable max-len */
/* lufthansa.com styles, brief 521 item 1: a page that ends with a section of separators only, right after a grey band
   (/de/en/airport-information and its three roots: "{spacer-70}" after "Buying a ticket, help and assistance at the
   airport"; the flights pages' "{spacer-25}" sections): on www that separator is all there is between the grey band and
   the footer (71 px at 1440, lh-parity-002a); ours added the grey band's 48 px section gap and the last section's own
   48 px around it (151 px). The last section takes the grey band's gap back (a negative top margin collapsing with it,
   with the wrapper's -16 px) and has none below. One :has() level: a :has() nested in another one drops the rule.
   Run: node --max-old-space-size=256 --test test/end-separators-after-grey-521.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/styles.css', import.meta.url), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const SEL = 'body.brand-lufthansa main > .section.grey + .section:last-child:not(:has(> .default-content-wrapper > :not(p.spacer)))';

test('the last section of separators after a grey band: no gap above (the grey band\'s taken back), none below', () => {
  const i = css.indexOf(`${SEL} {`);
  assert.ok(i >= 0, 'the rule');
  const body = css.slice(i + SEL.length, css.indexOf('}', i));
  assert.match(body, /margin-top: -48px;/);
  assert.match(body, /margin-bottom: 0;/);
});

test('the selector has one :has() level only (a nested one drops the whole rule)', () => {
  assert.equal((SEL.match(/:has\(/g) || []).length, 1);
});
