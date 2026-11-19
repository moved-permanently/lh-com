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
  ['brussels', 'ita', 'discover'].forEach((b) => {
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

test('Brussels: the two page ends', () => {
  const b = css('brussels.css');
  assert.ok(b.includes('body.brand-brussels main > .section:not(.padded, .grey, .sidebar, .sidebar-h1):has(> .default-content-wrapper:last-child > ul:last-child):not(:has(~ .section:not(:empty))) { padding-bottom: 54px; }'));
  assert.ok(b.includes('body.brand-brussels main > .section.padded:has(> .columns-media-wrapper:last-child > .columns-media.sidebar) + .section:has(> .carousel-cards-wrapper:last-child > .carousel-cards.grid.four-up):not(:has(~ .section:not(:empty))) { padding-bottom: 96px; }'));
});

test('ITA: a padded view closing with links keeps its H2 in heading-small', () => {
  assert.ok(css('ita.css').includes('body.brand-ita main .columns-media.padded .columns-media-text:has(> p.link-wrapper) > h2:first-child:not([class*="heading-"]) { margin-bottom: var(--heading-margin-l); font-size: var(--heading-font-size-l); }'));
});

test('Discover: an H2 opening the text after an accordion or a column view', () => {
  const d = css('discover.css');
  assert.ok(d.includes('body.brand-discover main .section > .accordion-columns-wrapper + .default-content-wrapper > h2:first-child { padding-top: 31px; }'));
  assert.ok(d.includes('padding-top: 48px;'));
});

/* item 5: ITA's stacked country columns on phones (order 12's rule) keyed on h2.heading-medium, which the token-free
   documents no longer carry since order 44: the rule reads the unmarked H2 too, when the next column opens with one */
test('ITA: the stacked columns rule reads the unmarked H2', () => {
  const t = css('ita.css');
  assert.ok(t.includes('.columns-media-text:not(:last-child):has(> h2:first-child:is(.heading-medium, :not([class*="heading-"]))):has(+ .columns-media-text > h2:first-child) { margin-bottom: 60px; }'));
  assert.doesNotMatch(t, /:has\(> h2\.heading-medium:first-child\)/);
});
