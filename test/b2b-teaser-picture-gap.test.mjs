/* eslint-disable max-len */
/* The standing order of 2026-11-10, item 2 (lh-b2b ranking, the homepages): a two-column teaser's linked picture
   under its heading. www's image component keeps 40 px under it, at 1440 and 390 alike (b2b-parity-001 de/de and
   de/en homepage: the PartnerPlusBenefit and eXperts pictures 40 px over their buttons); ours had the B2B rule's 24
   (657fae35, the import tooling's, not measured): each teaser row 16 px short.
   Run: node --test test/b2b-teaser-picture-gap.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../blocks/columns-media/columns-media.css', import.meta.url), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');

test('B2B: a linked picture under the cell\'s heading keeps 40 px under it, as www\'s image component', () => {
  const sel = 'body.brand-b2b .columns-media .columns-media-text > :is(h2, h3) + p:has(> a > picture) {';
  const i = css.indexOf(sel);
  assert.ok(i >= 0, 'the rule');
  const body = css.slice(i + sel.length, css.indexOf('}', i));
  assert.match(body, /display: block;/);
  assert.match(body, /margin: 0 0 40px;/);
});
