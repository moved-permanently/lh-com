/* eslint-disable max-len */
/* Discover's accordion panels as www's rich text (the standing order of the night of 2026-11-10, item e; ema-cashub's
   row D1 b, Discover row 43; discover-parity-001 /de/de/book/special-requests/families at 1440, "Gepäckbestimmungen für
   Kinder" open): www's panel text 12 px further in than the title's (x 112 against 100), paragraphs and lists 36 px
   apart, the list 40 px in with its items 10 px apart, as in default content. The brief-490 rule meant the panels too, but
   the block puts their text in .accordion-columns-intro, so ours had 28 px, lists flush and items 0 px apart.
   Run: node --test test/discover-accordion-text-585.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/discover.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
const INTRO = 'body.brand-discover main .accordion-columns-panel > .accordion-columns-intro';
const rule = (sel) => {
  const i = css.indexOf(`${sel} {`);
  assert.ok(i >= 0, `no rule ${sel}`);
  return css.slice(i, css.indexOf('}', i));
};

test('the panel text 12 px in', () => assert.match(rule(INTRO), /padding-inline: 12px;/));
test('paragraphs and lists 36 px apart', () => assert.match(rule(`${INTRO} > :is(p, ul, ol):not(:last-child)`), /margin-bottom: 36px;/));
test('lists 40 px in, their items 10 px apart', () => {
  assert.match(rule(`${INTRO} :is(ul, ol)`), /padding-left: 40px;/);
  assert.match(rule(`${INTRO} li`), /margin-bottom: 10px;/);
});
