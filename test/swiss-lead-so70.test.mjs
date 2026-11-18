/* eslint-disable max-len, import/no-extraneous-dependencies, import/extensions -- dev tooling; linkedom is a dev dependency */
/* Standing order 70 (2026-11-18), items 1 to 3 (token-free).
   - Item 1: SWISS's lead (THEMES.swiss rules 'lead-after-h1': the H1's paragraph when it ends its section gets
     copytext-large; swiss.css draws it as www's p.copytext-large, 18 / 30 px light), and the SWISS rules that close the
     four page-widths it took further from www: the one-section page's padding and end (duty-free-shop), the table cells
     (unaccompanied-minors), the accordion panel's picture beside its list (miles-and-more).
   - Item 2: from 768 px the title 31 px under the picture above it; on phones the footer's legal links 8 px closer to
     the logos (the lines keep 24 px for WCAG 2.5.8).
   - Item 3: celebrating-shared-stories de/de, its first section's space below M on phones only (a section style).
   Strings only in assertions (no DOM node goes into one).
   Run: node --max-old-space-size=256 --test test/swiss-lead-so70.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';
import { themeFor, THEMES, SECTION_STYLES } from '../scripts/style-markers.js';
import { applyTextInserts, removeTextInserts, listPaths } from '../tools/importer/text-inserts-apply.mjs';

const read = (f) => fs.readFileSync(new URL(f, import.meta.url), 'utf8');
const { default: decorateTokenFree } = await import('../scripts/token-free.js');

// the classes of each section's paragraphs after the site's token-free pass on a SWISS page
const leads = (mainHtml) => {
  const { document } = parseHTML(`<html><head></head><body><main>${mainHtml}</main></body></html>`);
  globalThis.document = document;
  const main = document.querySelector('main');
  decorateTokenFree(main, { brand: 'swiss', path: '/ch/en/x' });
  return [...main.querySelectorAll(':scope > div > p')].map((p) => `${p.textContent.slice(0, 6)}:${p.className}`).join(' ');
};

test('lead-after-h1: a SWISS theme rule only, on the H1\'s paragraph that ends its section', () => {
  assert.ok(themeFor('swiss').rules.includes('lead-after-h1'));
  Object.entries(THEMES).filter(([b]) => b !== 'swiss').forEach(([b]) => assert.ok(!themeFor(b).rules.includes('lead-after-h1'), b));
  if (!THEMES.swiss.live) return;
  const meta = '<div class="section-metadata"><div><div>Style</div><div>padded</div></div></div>';
  assert.equal(leads('<div><h1>Title</h1><p>Lead one</p></div>'), 'Lead o:copytext-large');
  assert.equal(leads(`<div><h1>Title</h1><p>Lead one</p>${meta}</div>`), 'Lead o:copytext-large', 'metadata after it');
  // the text pages: more text, a heading or a block after the title's paragraph
  assert.equal(leads('<div><h1>Title</h1><p>First</p><p>Second</p></div>'), 'First: Second:');
  assert.equal(leads('<div><h1>Title</h1><p>First</p><h2>Next</h2></div>'), 'First:');
  assert.equal(leads('<div><h1>Title</h1><p>First</p><div class="accordion-columns"><div><div>Q</div><div>A</div></div></div></div>'), 'First:');
  // a picture, an empty paragraph, a marker's size stay as they are
  assert.equal(leads('<div><h1>Title</h1><p><picture><img src="/a.jpg" alt=""></picture></p></div>'), ':');
  assert.equal(leads('<div><h1>Title</h1><p class="copytext-small">Small</p></div>'), 'Small:copytext-small');
});

test('swiss.css: the lead as www\'s copytext-large; the four pages\' rules; nothing in another theme', () => {
  const css = read('../styles/themes/swiss.css');
  const lead = css.match(/body\.brand-swiss main \.default-content-wrapper > h1 \+ p\.copytext-large \{[^}]*\}/);
  assert.ok(lead, 'the lead rule');
  ['margin-bottom: 20px', 'font-size: 18px', 'font-weight: 300', 'line-height: 30px', 'letter-spacing: 0.2px'].forEach((d) => assert.ok(lead[0].includes(d), d));
  // duty-free-shop: one padded section, its padding under the breadcrumb, no section gap at its end
  assert.match(css, /\.section\.padded:first-of-type:last-of-type > \.breadcrumb-wrapper:first-child \+ \.default-content-wrapper:not\(:has\(> h1:first-child\)\) \{\s*margin-top: calc\(var\(--spacing-default\) \+ var\(--section-padding\)\);/);
  assert.match(css, /\.section\.padded:first-of-type:last-of-type:has\(> \.default-content-wrapper:last-child > p:last-child:not\(\.link-wrapper, \.button-wrapper, \.spacer\)\) \{\s*margin-bottom: 0;/);
  // unaccompanied-minors: www's cells (24 px lines, 30 px above and below, 200 px wide on phones)
  assert.match(css, /body\.brand-swiss main \.table-striped td \{\s*padding-top: 30px;\s*padding-bottom: 30px;\s*line-height: 24px;/);
  assert.match(css, /@media \(width < 768px\) \{\s*body\.brand-swiss main \.table-striped table \{\s*width: auto;\s*min-width: 100%;\s*table-layout: auto;\s*\}\s*body\.brand-swiss main \.table-striped :is\(th, td\) \{\s*min-width: 200px;/);
  // miles-and-more: from 768 px the panel's picture beside its titled list
  assert.match(css, /@media \(width >= 768px\) \{\s*body\.brand-swiss main \.accordion-columns-intro > p:has\(> picture:only-child\):has\(\+ :is\(h2, h3, h4, h5, h6\) \+ :is\(ul, ol\)\) \{\s*float: left;/);
  // item 2: the title's picture from 768 only; the footer's legal row on phones, its lines still 24 px
  assert.match(css, /@media \(width >= 768px\) \{\s*\/\*[^*]*\*\/\s*body\.brand-swiss main \.section > \.default-content-wrapper > p:has\(> picture\):has\(\+ h1\):not\(\.column-end\) \{\s*margin-bottom: 31px;/);
  assert.equal((css.match(/p:has\(> picture\):has\(\+ h1\)/g) || []).length, 1, 'phones keep 40 px');
  assert.match(css, /@media \(width < 768px\) \{\s*body\.brand-swiss \.footer \.footer-legal \{\s*margin: -4px 0;/);
  assert.match(css, /body\.brand-swiss \.footer \.footer-legal \.footer-link \{\s*margin: 0;\s*line-height: 24px;/);
  const others = fs.readdirSync(new URL('../styles/themes/', import.meta.url)).filter((f) => f !== 'swiss.css' && f.endsWith('.css'));
  others.forEach((f) => assert.doesNotMatch(read(`../styles/themes/${f}`), /standing order 70/, f));
});

test('item 3: celebrating de/de READY, its first section\'s Style M on phones only; no token, byte for byte back', () => {
  assert.ok(SECTION_STYLES['space-below-m-below-768']);
  const list = read('../tools/reports/parity-2026-11-09/delta-so70-b2b-celebrating-de-space-phones.txt');
  const data = JSON.parse(read('../tools/reports/parity-2026-11-09/delta-so70-b2b-celebrating-de-space-phones.json'));
  assert.deepEqual([...new Set(listPaths(list))], ['/de/de/news/celebrating-shared-stories']);
  assert.doesNotMatch(list, /overview-manage/);
  assert.equal(data.length, 1);
  const [{ replace, text }] = data[0].inserts;
  assert.equal(data[0].inserts.length, 1);
  assert.equal(text, replace.replace('wide-text, space-below-m<', 'wide-text, space-below-m-below-768<'));
  assert.doesNotMatch(text, /\{[a-z]/);
  const copy = `<body><main><div><h1>We are the Journey</h1>${replace}</div></main></body>`;
  const once = applyTextInserts(copy, data[0].inserts);
  assert.deepEqual(once.results, ['inserted']);
  assert.equal(removeTextInserts(once.html, once.inserts) === copy, true);
  assert.deepEqual(applyTextInserts(once.html, data[0].inserts).results, ['present']);
});

test('item 4: travel-insurances\' grey note band under the title as www\'s (title section and band without their gaps)', () => {
  const css = read('../styles/themes/swiss.css');
  assert.match(css, /body\.brand-swiss main > \.section\.padded:first-of-type:has\(\+ \.section\.grey\.flush \+ \.section\.padded\) \{\s*padding-bottom: 0;\s*margin-bottom: 0;/);
  assert.match(css, /body\.brand-swiss main > \.section\.padded:first-of-type \+ \.section\.grey\.flush:has\(\+ \.section\.padded\) \{\s*margin-bottom: 0;/);
});
