/* eslint-disable max-len, import/extensions -- dev tooling */
/* Standing order 47 of 2026-11-19 (token-free content, the last two marked pages of Brussels and Discover):
   - Brussels ao/fr aviation-services-law: its four "{spacer-28}" go; www's default-state recording (brussels-parity-015)
     gives the carriers, scoped to the notice's shape (a sidebar-h1 section whose text opens with title, paragraph, list):
     the list's space under the opening paragraph, the space above each heading after text, the closing accordion's
     space to the footer;
   - Brussels' closing link-list end (order 46) sits on the list itself and takes link lists only (order 46's form
     also took 14 terms pages' closing bullet lists);
   - Discover punta-cana de/de: its "{spacer-30}" goes without a carrier (the migration session's decision).
   The rows (delta-so47-*-token-free.json) remove markers only.
   Run: node --test test/token-free-so47.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const R = '../tools/reports/parity-2026-11-09/';
const TOKEN = /\{(spacer|divider|heading|copytext|column-start|column-end)[^}]*\}|(below|from)-768/;
const css = (f) => fs.readFileSync(new URL(`../styles/themes/${f}`, import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const rows = (b) => JSON.parse(fs.readFileSync(new URL(`${R}delta-so47-${b}-token-free.json`, import.meta.url), 'utf8'));
const NOTICE = 'body.brand-brussels main > .section.sidebar-h1:has(> .default-content-wrapper > h1 + p + :is(ul, ol))';

test('the rows remove markers only and write nothing else', () => {
  ['brussels', 'discover'].forEach((b) => {
    Object.values(rows(b)).flat().forEach((r) => {
      assert.match(r.from, /<p>\{spacer-\d+\}<\/p>/, `${b}: a row removes a separator paragraph`);
      assert.doesNotMatch(r.to, TOKEN, `${b}: and writes no token`);
      assert.equal(r.to, r.from.replace(/<p>\{spacer-\d+\}<\/p>/g, ''), `${b}: nothing else changes`);
    });
  });
  assert.deepEqual(Object.keys(rows('brussels')), ['/ao/fr/legal-notices/aviation-services-law']);
  assert.deepEqual(Object.keys(rows('discover')), ['/de/de/travel-inspiration/inspiration/destinations/punta-cana']);
});

test('Brussels: the notice carriers, scoped to the notice shape', () => {
  const b = css('brussels.css');
  assert.ok(b.includes(`${NOTICE} > .default-content-wrapper > h1 + p + :is(ul, ol) { padding-top: 50px; }`));
  assert.ok(b.includes(`${NOTICE} > .default-content-wrapper > :is(p, ul, ol) + h2 { padding-top: 12px; }`));
  assert.ok(b.includes(`${NOTICE}:has(> .accordion-columns-wrapper:last-child):not(:has(~ .section:not(:empty))) { padding-bottom: 22px; }`));
  ['padding-top: 32px;', 'padding-top: 17px;', 'padding-bottom: 40px;'].forEach((v) => assert.ok(b.includes(v), v));
  // not page-wide: no unscoped form of the heading or accordion-end carrier
  assert.ok(!b.includes('body.brand-brussels main > .section.sidebar-h1 > .default-content-wrapper > :is(p, ul, ol) + h2'));
});

test('Brussels: the closing link-list end takes link lists only', () => {
  const b = css('brussels.css');
  assert.ok(b.includes('> ul:last-child:has(> li > a):not(:has(> li > :not(a))) { padding-bottom: 54px; }'));
  assert.ok(!b.includes(':has(> .default-content-wrapper:last-child > ul:last-child):not(:has(~ .section:not(:empty))) { padding-bottom: 54px; }'));
});
