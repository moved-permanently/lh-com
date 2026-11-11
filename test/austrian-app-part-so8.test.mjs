/* eslint-disable max-len */
/* Standing order 8 (2026-11-11): the app part under online-check-in's numbered steps on Austrian pages. www's "Austrian
   App" heading is heading-medium (36 / 39.6 px, 36 px under it from 1025 px; 28 / 30.8 px, 24 on phones), 65 / 61 px
   under the steps row, and "Good to know" 133 / 145 px under the store buttons (austrian-parity-017). The rules reach
   only the default content right after a Columns Media with option steps (online-check-in's, nine languages) and
   need no nested :has (the browser drops such a rule). */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/austrian.css', import.meta.url), 'utf8');
const part = css.slice(css.indexOf('/* the app part under the numbered steps'));
const body = part.slice(part.indexOf('*/') + 2);
const SCOPE = 'body.brand-austrian main .columns-media-wrapper:has(> .columns-media.steps) + .default-content-wrapper >';
const rule = (sel, from = body) => {
  const at = from.indexOf(`${sel} {`);
  return at < 0 ? null : from.slice(at, from.indexOf('}', at));
};

test('the heading and the gap: scoped to the default content after the steps row', () => {
  assert.ok(part.length > 0 && body.length > 0);
  const phone = rule(`${SCOPE} h3:first-child`);
  assert.match(phone, /padding-top: 38px;/);
  assert.match(phone, /font-size: 28px;/);
  assert.match(phone, /line-height: 30\.8px;/);
  assert.match(phone, /margin-bottom: 24px;/);
  assert.match(rule(`${SCOPE} .spacer + h2`), /margin-top: 60px;/);
  const wide = body.slice(body.indexOf('@media (width >= 1025px)'));
  const h = rule(`  ${SCOPE} h3:first-child`, wide);
  assert.match(h, /padding-top: 41px;/);
  assert.match(h, /font-size: 36px;/);
  assert.match(h, /line-height: 39\.6px;/);
  assert.match(h, /margin-bottom: 36px;/);
  assert.match(rule(`  ${SCOPE} .spacer + h2`, wide), /margin-top: 48px;/);
});

test('every selector of the part names the steps option and nests no :has', () => {
  const selectors = [...body.matchAll(/^\s*([^@{}/][^{}]*?)\s*\{/gm)].map((m) => m[1].trim()).filter((s) => !s.startsWith('@'));
  assert.equal(selectors.length, 4);
  selectors.forEach((s) => {
    assert.ok(s.startsWith(SCOPE), s);
    assert.doesNotMatch(s, /:has\([^)]*:has\(/);
  });
});
