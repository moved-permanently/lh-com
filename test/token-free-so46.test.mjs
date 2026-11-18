/* eslint-disable max-len, import/extensions -- dev tooling */
/* Standing order 46 of 2026-11-18 (token-free content, the last marked pages of Brussels, ITA and Discover): each marker
   gets a carrier the theme or the document's structure gives, never a token:
   - Brussels: a page closing with a link list in a plain section (be/en legal-notices) and the lounges hub (a four-up
     card grid in a section of its own after a padded sidebar intro) get their page end from brussels.css, in place of
     their width-scoped "{spacer-N from-768}" / "{spacer-N below-768}" pair;
   - ITA: a padded column view whose text closes with links keeps its H2 in heading-small (ita-airways-app's "Plan your
     next trip", eight language copies);
   - Discover: default content opening with an H2 right after an accordion or a column view gets the space its
     "{spacer-30}" gave.
   The rows (delta-so46-*-token-free.json) remove markers and add at most a block option.
   Run: node --test test/token-free-so46.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const R = '../tools/reports/parity-2026-11-09/';
const TOKEN = /\{(spacer|divider|heading|copytext|column-start|column-end)[^}]*\}|(below|from)-768/;
const css = (f) => fs.readFileSync(new URL(`../styles/themes/${f}`, import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const rows = (b) => JSON.parse(fs.readFileSync(new URL(`${R}delta-so46-${b}-token-free.json`, import.meta.url), 'utf8'));

test('the rows remove markers only; what they add is a block option', () => {
  ['ita', 'discover'].forEach((b) => {
    const data = rows(b);
    assert.ok(Object.keys(data).length > 0, b);
    Object.values(data).flat().forEach((r) => {
      assert.doesNotMatch(r.to, TOKEN, `${b}: a row writes no token`);
      assert.equal(r.count, 1);
      const unmarked = r.from.replace(/ \{heading-[a-z-]+\}/g, '').replace(/<p>\{spacer-[^}]*\}<\/p>/g, '');
      const uncarried = r.to.replace(' title-large', '');
      assert.equal(uncarried, unmarked, `${b}: only markers go and only a block option comes`);
    });
  });
  assert.deepEqual(Object.keys(rows('ita')).length, 8);
  assert.deepEqual(Object.keys(rows('discover')).length, 5);
});

test('ITA: a padded view closing with links keeps its H2 in heading-small', () => {
  assert.ok(css('ita.css').includes('body.brand-ita main .columns-media.padded .columns-media-text:has(> p.link-wrapper) > h2:first-child:not([class*="heading-"]) { margin-bottom: var(--heading-margin-l); font-size: var(--heading-font-size-l); }'));
});

test('Discover: an H2 opening the text after an accordion or a column view', () => {
  const d = css('discover.css');
  assert.ok(d.includes('body.brand-discover main .section > .accordion-columns-wrapper + .default-content-wrapper > h2:first-child { padding-top: 31px; }'));
  assert.ok(d.includes('padding-top: 48px;'));
});
