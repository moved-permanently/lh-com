/* eslint-disable max-len */
/* Brief 488 item 4: www's Insights highlights and tags pages (all-it-takes-is-a-yes, tags/munich) put
   their components straight into .container-content, without AEM sections. There a headline has no
   margin above (text -> heading 24 px: ours 40 at 1440), an image component 4rem below (the hero ->
   h1 40 px: ours 24) and a column view .column-view's 2rem / 1rem, from 768 px 4rem / 2rem, its
   items 1rem / 2rem more below (text -> two-column view 64 px at 1440, 44 at 390: ours 24; the view
   -> heading 40 / 20 px). The Insights template's own transformer (insights-flow) gives such pages
   "Theme: insights-flow"; styles.css spaces them so. www's articles and author pages keep theirs.
   Run: node --test test/insights-flow-488.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';

const { default: transform } = await import('../tools/importer/transformers/insights-flow.js');

const theme = (body) => {
  const { document } = parseHTML(`<html><body>${body}</body></html>`);
  transform('beforeTransform', document.body, { document, template: { name: 'insights' } });
  return document.documentElement.getAttribute('data-lh-import-theme');
};

test('a page of components straight in .container-content gets Theme insights-flow, added to the cleanup\'s', () => {
  assert.equal(theme('<div class="container-content"><div class="image"></div><div class="headline"><h1>All It Takes Is a Yes</h1></div><div class="text"><p>Our lives</p></div><div class="twocolumn"></div></div>'), 'insights-flow');
  const { document } = parseHTML('<html><body><div class="container-content"><div class="text"><p>x</p></div></div></body></html>');
  document.documentElement.setAttribute('data-lh-import-theme', 'digital-assistant');
  transform('beforeTransform', document.body, { document });
  assert.equal(document.documentElement.getAttribute('data-lh-import-theme'), 'digital-assistant, insights-flow');
});

test('www\'s articles, author pages and pages with AEM sections keep their spacing', () => {
  assert.equal(theme('<div class="container-content"><div class="article-details-page"><div class="text"><p>x</p></div></div></div>'), null);
  assert.equal(theme('<div class="container-content"><div class="author-details-page"></div><div class="text"><p>x</p></div></div>'), null);
  assert.equal(theme('<div class="container-content"><div class="section"><div><div class="section-content"><div class="text"><p>x</p></div></div></div></div></div>'), null);
});

test('the Insights template runs it, in its import script and bundle', () => {
  const { templates } = JSON.parse(fs.readFileSync('tools/importer/page-templates.json', 'utf8'));
  assert.deepEqual(templates.find((t) => t.name === 'insights').transformers, ['insights-flow']);
  assert.match(fs.readFileSync('tools/importer/import-insights.js', 'utf8'), /const transformers = \[lufthansaCleanupTransformer, lufthansaSectionsTransformer, insightsFlowTransformer\];/);
  assert.ok(fs.readFileSync('tools/importer/import-insights.bundle.js', 'utf8').includes('insights-flow'));
});

test('styles.css: no heading margin above, 4rem under a picture, a two-column view\'s padding', () => {
  const css = fs.readFileSync('styles/styles.css', 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
  const F = 'body.brand-lufthansa.insights-flow main';
  assert.ok(css.includes(`${F} .default-content-wrapper > * + :is(h2, h3) { margin-top: 0; }`));
  assert.ok(css.includes(`${F} .default-content-wrapper > p:is(:has(> picture), :has(> a > picture)):not(:last-child, :has(+ p.caption)) { margin-bottom: 40px; }`));
  assert.ok(css.includes(`${F} > .section:not(.grey) > :not(.default-content-wrapper:has(> :last-child:is(h2, h3))) + .columns-media-wrapper > .columns-media:has(.columns-media-row > :nth-child(2)) { padding-top: 20px; }`));
  assert.match(css, new RegExp(`@media \\(width >= 768px\\) \\{ ${F.replace(/\./g, '\\.')} > \\.section:not\\(\\.grey\\) > :not\\(\\.default-content-wrapper:has\\(> :last-child:is\\(h2, h3\\)\\)\\) \\+ \\.columns-media-wrapper > \\.columns-media:has\\(\\.columns-media-row > :nth-child\\(2\\)\\) \\{ padding: 40px 0 16px; \\}`));
});
