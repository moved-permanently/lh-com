/* eslint-disable max-len, import/extensions -- dev tooling */
/* Standing order 48 of 2026-11-19 (spacing lost when the separator markers came out; the token-free rule stays): the
   carriers of space the removed "{spacer-N}" / "{heading-medium}" markers drew, each scoped by structure:
   - Brussels: the title-large FAQ accordion's H3s after text 12 px lower (terms and conditions' 57 "{spacer-11}"), a
     sidebar-h1 page's closing lone link 31 px lower from 768 (refund-for-cancelled-flights);
   - ITA: an H2 opening the section after a boarding-table section 26 px lower from 768 (group-boarding);
   No rule writes a style token into a document: these are theme rules only.
   Run: node --test test/token-free-so48b.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = (f) => fs.readFileSync(new URL(`../styles/themes/${f}`, import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');

test('Brussels: the title-large accordion H3 space and the closing link space, scoped', () => {
  const b = css('brussels.css');
  assert.ok(b.includes('body.brand-brussels main .section.section.section .accordion-columns.title-large .accordion-columns-panel :is(p, ul, ol, table) + h3 { padding-top: 12px; }'));
  assert.ok(b.includes('@media (width >= 768px) { body.brand-brussels main > .section.section.section.sidebar-h1:not(:has(~ .section:not(:empty))) > .default-content-wrapper:last-child > p:not(.link-wrapper) + p.link-wrapper:last-child { padding-top: 31px; } }'));
  // not every accordion's H3s
  assert.ok(!b.includes('.accordion-columns .accordion-columns-panel :is(p, ul, ol, table) + h3 { padding-top: 12px'));
});

test('ITA: the H2 after a boarding-table section, from 768 only', () => {
  const t = css('ita.css');
  assert.ok(t.includes('@media (width >= 768px) { body.brand-ita main > .section.section:has(> .table-striped-wrapper:last-child) + .section.section > .default-content-wrapper:first-child > h2:first-child { padding-top: 26px; } }'));
});
