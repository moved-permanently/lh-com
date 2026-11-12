/* eslint-disable max-len, import/extensions */
/* TAP's rich-text tables on phones (table-striped columns, row 146; standing order 13's ranking): below 1024 px one
   accordion per value column, each 16 px over the next. www's stack (its lg:hidden container) keeps the last
   accordion's 16 px inside it, so the text after a table is 32 px under its last accordion and a heading 48; ours let
   that margin collapse through the stack into the gap after it: 16 and 32, every table 16 px short (tap-parity-009 fees
   at 390: six tables, 96 of the page's 156 px; by flying two). The stack is a block formatting context of its own
   (display: flow-root) below 1024 px; from 1024 px it stays hidden. Reads the block's CSS as written.
   Run: node --max-old-space-size=256 --test test/tap-table-phone-stack-so13.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../blocks/table-striped/table-striped.css', import.meta.url), 'utf8');
// the rules outside any media query, and those inside (width >= 1024px)
const desktopAt = css.indexOf('@media (width >= 1024px)');
const base = css.slice(0, desktopAt);
const desktop = css.slice(desktopAt);
const rule = (src, sel) => {
  const m = src.match(new RegExp(`(^|\\n)\\s*${sel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\{([^}]*)\\}`));
  return m ? m[2] : null;
};

test('below 1024 px the accordion stack keeps its last accordion\'s 16 px (a block formatting context)', () => {
  const r = rule(base, '.table-striped.columns .table-striped-accordions');
  assert.ok(r !== null, 'a rule for the stack');
  assert.match(r, /display:\s*flow-root;/);
  assert.match(rule(base, '.table-striped.columns .table-striped-acc'), /margin-bottom:\s*16px;/, 'each accordion 16 px over the next');
});

test('from 1024 px the stack stays hidden (the cards stand for it)', () => {
  assert.match(rule(desktop, '.table-striped.columns .table-striped-accordions'), /display:\s*none;/);
});
