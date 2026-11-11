/* eslint-disable max-len, import/no-extraneous-dependencies -- dev tooling; linkedom is a dev dependency */
/* Standing order 3 item 5: the token-free switch on lufthansa.com's info pages (the 12 sampled column-mark documents,
   switched with their Theme as the collapse writes it). Four shared causes, each inert while the lufthansa theme is
   off (main today):
   A. an H3 marked heading-small (www's light 28px; 924 of the 1,462 H3s of the 1,862 published column-mark documents)
      is one step from the H3 default, so the collapse took the default (bold 24px). On flow pages the lufthansa theme
      keeps it as a choice: section style H3 large, drawn heading-small there (headingChoices / nearChoices of
      pageTypes.flow); other pages and brands as before.
   B. a column view that opens with its divider: the rule at the section's top edge (-32px, the view's padding), not
      the chapters' -24px (+8px per view on europa-tarife-economy-class).
   C. the image under the page title before a column view: 40px under it, not the fleet pages' 80px.
   D. a column view's headings two thirds wide only off flow pages once the theme is live (the hub transformer's
      documents): the column-mark documents' headings keep the full width (6,500 of 6,978 without {limited-width}).
      Until then as before: 143 published flow documents have column-view sections today.
   Run: node --max-old-space-size=256 --test test/info-switch-596.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';
import { collapseHtml } from '../tools/importer/marker-collapse.mjs';
import { headingChoice, themeFor } from '../scripts/style-markers.js';

const META = '<div><div class="metadata"><div><div>Title</div><div>Lounges</div></div></div></div>';
const COLUMN_DOC = `<div><h1 id="t">First Class Lounges</h1><p>Intro.</p></div><div><h3 id="a">First Class Lounges at Frankfurt {heading-small column-start}</h3><p>Terminal 1. {column-end}</p><h3 id="b">First Class Lounges at Munich {heading-small column-start}</h3><p>Both lounges. {column-end}</p></div>${META}`;
const PLAIN_DOC = `<div><h1 id="t">Lounges</h1><p>Intro.</p></div><div><h3 id="a">First Class Lounges at Frankfurt {heading-small}</h3><p>Terminal 1.</p></div>${META}`;
const run = (doc, brand = 'lufthansa') => collapseHtml(doc, { brand, force: true, path: '/de/en/first-class-lounges', parse: (h) => parseHTML(h) }).html;
const css = fs.readFileSync(new URL('../styles/styles.css', import.meta.url), 'utf8');

test('A: a column page (a flow page once collapsed): its H3s marked heading-small become H3 large, the marker goes', () => {
  const html = run(COLUMN_DOC);
  assert.ok(!html.includes('{heading-small'));
  assert.match(html, /<h3[^>]*>First Class Lounges at Frankfurt<\/h3>/);
  assert.match(html, /<div>Style<\/div><div>[^<]*h3-large[^<]*<\/div>/i);
  assert.match(html, /<div>Theme<\/div><div>flow-spacing<\/div>/i);
});

test('A: a page without column marks (no flow page) and another brand: the one-step H3 marker takes the default, as before', () => {
  assert.ok(!/h3-large/i.test(run(PLAIN_DOC)));
  assert.ok(!/h3-large/i.test(run(COLUMN_DOC, 'swiss')));
});

test('A: the site draws H3 large as heading-small on lufthansa.com flow pages only; the H1 near choice stays', () => {
  assert.equal(headingChoice(themeFor('lufthansa', 'flow'), 3, 'large'), 'heading-small');
  assert.equal(headingChoice(themeFor('lufthansa'), 3, 'large'), 'heading-medium');
  assert.equal(headingChoice(themeFor('lufthansa', 'flow'), 1, 'compact'), 'heading-medium');
  assert.equal(themeFor('lufthansa', 'flow').nearChoices.h1['heading-medium'], 'compact');
  assert.equal(headingChoice(themeFor('swiss', 'flow'), 3, 'large'), 'heading-medium');
  const h1 = run('<div><h1 id="t">Find your favourite place {heading-medium}</h1><p>Text. {column-start column-end}</p></div>');
  assert.match(h1, /h1-compact/i);
});

test('B, C: the divider and title-image rules only with the theme live (body.theme-live)', () => {
  assert.match(css, /body\.brand-lufthansa\.theme-live main > \.section\.column-view:not\(\.grey, \.padded\) > \.default-content-wrapper:first-child > p\.spacer\.divider:first-child \{\n {2}margin-top: -32px;/);
  assert.match(css, /body\.brand-lufthansa\.theme-live main > \.section:has\(\+ \.section\.column-view\) > \.default-content-wrapper > h1 \+ p:has\(> picture\):last-child \{\n {2}margin-bottom: 40px;/);
});

test('D: the two-thirds headings of a column view off flow pages only, once the theme is live (143 published flow documents with column views keep them)', () => {
  assert.match(css, /body\.brand-lufthansa:not\(\.theme-live\.flow-spacing\) main > \.section\.column-view:not\(\.grey, \.padded, :has\([^)]*\)\) > \.default-content-wrapper > :is\(h2, h3, h4\) \{\n {4}max-width: 66%;/);
  assert.ok(!/\n {2}body\.brand-lufthansa main > \.section\.column-view:not\(\.grey, \.padded, :has\([^)]*\)\) > \.default-content-wrapper > :is\(h2, h3, h4\) \{/.test(css));
});
