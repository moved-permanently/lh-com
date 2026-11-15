/* eslint-disable max-len */
/* Standing order 37 of 2026-11-15, item 3 (finish-cargo.txt, /en/onerecord): a quotation in Cargo's running text as
   www's citation-CF23 (cargo-parity-003, laid out with its own CSS: the quote LufthansaText 18 / 24 italic across the
   column, 20 px over the name in LufthansaHead bold 18 / 24), not the Insights author quote of styles.css (32 px bold,
   622 px wide, 80 px above and below). Cargo's theme only.
   Run: node --max-old-space-size=512 --test test/cargo-onerecord-quote-so37.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/cargo.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const rule = (sel) => {
  const m = css.match(new RegExp(`(?:^|[;{}]) *${esc(sel)} \\{([^}]*)\\}`));
  assert.ok(m, `no rule for ${sel}`);
  return m[1];
};
const Q = 'body.brand-cargo main .default-content-wrapper > blockquote';

test('the quotation across the column with no margin of its own', () => {
  const r = rule(Q);
  assert.match(r, /max-width: none;/);
  assert.match(r, /margin: 0;/);
});

test('the quote LufthansaText 18 / 24 italic, 20 px over the name; the name LufthansaHead bold 18 / 24', () => {
  const q = rule(`${Q} > p:first-child`);
  assert.match(q, /margin: 0 0 20px;/);
  assert.match(q, /font-family: var\(--body-font-family\);/);
  assert.match(q, /font-size: 18px;/);
  assert.match(q, /font-style: italic;/);
  assert.match(q, /font-weight: 400;/);
  assert.match(q, /line-height: 24px;/);
  const n = rule(`${Q} > p:not(:first-child)`);
  assert.match(n, /margin: 0;/);
  assert.match(n, /font-family: var\(--heading-font-family\);/);
  assert.match(n, /font-size: 18px;/);
  assert.match(n, /font-weight: 700;/);
  assert.match(n, /line-height: 24px;/);
});

test('outside any media query: the same at every width (www\'s citation is one style)', () => {
  const at = css.indexOf(`${Q} {`);
  const before = css.slice(0, at);
  const open = (before.match(/\{/g) || []).length - (before.match(/\}/g) || []).length;
  assert.equal(open, 0);
});
