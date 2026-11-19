/* eslint-disable max-len, import/extensions -- dev tooling */
/* Standing order 48 of 2026-11-19 (spacing lost when the separator markers came out; the token-free rule stays): the
   carriers of space the removed "{spacer-N}" / "{heading-medium}" markers drew, each scoped by structure:
   - ITA: a grey column view's H2 in heading-medium (online-check-in's ten copies; order 44 carried padded views only);
   - Discover: the homepage's offers section and destination finder section 42 / 57 px lower from 768.
   No rule writes a style token into a document: these are theme rules only.
   Run: node --test test/token-free-so48.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = (f) => fs.readFileSync(new URL(`../styles/themes/${f}`, import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');

test('ITA: a grey column view H2 in heading-medium, padded views with links keep heading-small', () => {
  const t = css('ita.css');
  assert.ok(t.includes('body.brand-ita main .columns-media.grey.grey .columns-media-text > h2:first-child:not([class*="heading-"]) { font-size: var(--heading-font-size-xl); line-height: 1.1; }'));
  // the padded-with-links exception still comes after it and still draws heading-small
  const a = t.indexOf('.columns-media.grey.grey .columns-media-text > h2');
  const b = t.indexOf('.columns-media.padded .columns-media-text:has(> p.link-wrapper) > h2:first-child');
  assert.ok(a > 0 && b > a);
  // plain column views in grey sections are not taken
  assert.ok(!t.includes('.section.grey .columns-media .columns-media-text > h2'));
});

test('Discover: the homepage offers section and destination finder from 768 only', () => {
  const d = css('discover.css');
  assert.ok(d.includes('@media (width >= 768px) { body.brand-discover main > .section.section.section > .default-content-wrapper:first-child:has(> h2:only-child):has(+ .fare-teaser-wrapper) > h2 { padding-top: 42px; } body.brand-discover main > .section.section.section > .destination-finder-wrapper:first-child { padding-top: 57px; } }'));
});
