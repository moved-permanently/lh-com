/* eslint-disable max-len */
/* Standing order 15, the Austrian ranking (Austrian row 51): the title of a column view with a picture (our Columns Media's
   text column h3: entryregulations' "Entry regulations for the USA", bangkok-airways, travel-id, healthy-travel,
   accessible-travel, austrian-app, doctor-on-board, sustainable-flying, the Schengen page; 18 of the recordings' h3s,
   austrian-parity-015) is www's maui headline heading-small: Portada 700, 28 / 30.8 px with 36 px under it from 1025 px,
   22 / 24.2 px with 24 on phones. Ours had the default h3, CoreSans 500 18 / 19.8 px with 32 under it. The numbered
   steps (option steps, online-check-in) keep their own rule. Reads austrian.css as written.
   Run: node --max-old-space-size=256 --test test/austrian-column-titles-so15.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/austrian.css', import.meta.url), 'utf8');
const SEL = 'body.brand-austrian main .columns-media:not(.steps) .columns-media-text > h3';
const at = css.indexOf(`${SEL} {`);
const rule = (from) => css.slice(from, css.indexOf('}', from));

test('a column view\'s title as www\'s heading-small on phones', () => {
  assert.ok(at >= 0, 'the rule');
  const r = rule(at);
  assert.match(r, /font-family: var\(--heading-font-family\);/);
  assert.match(r, /font-weight: var\(--heading-light-weight\);/);
  assert.match(r, /font-size: 22px;/);
  assert.match(r, /line-height: 1\.1;/);
  assert.match(r, /margin-bottom: 24px;/);
});

test('from 1025 px 28 / 30.8 with 36 under it', () => {
  const w = css.indexOf(`  ${SEL} {`, at + 1);
  assert.ok(w > 0);
  assert.match(css.slice(css.lastIndexOf('@media', w), w), /@media \(width >= 1025px\)/);
  const r = rule(w);
  assert.match(r, /font-size: 28px;/);
  assert.match(r, /margin-bottom: 36px;/);
});

test('before the app part (whose test reads to the end of the file)', () => {
  assert.ok(at < css.indexOf('/* the app part under the numbered steps'));
});
