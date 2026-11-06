/* eslint-disable max-len, import/extensions, import/no-extraneous-dependencies -- dev tooling */
/* Lufthansa Group for Business, the first visual-parity pass (brief 418, capture b2b-parity-001 of
   business.lufthansagroup.com, 26 pages at 1440 and 390; tools/reports/b2b/parity.md):
   - text: www's .b2b-neo p { max-width: 80rem } on every paragraph of the content (800 px), not
     only the homepage stage's (b2b-scoped);
   - outlined buttons: www's buttonsecondary b2b-blue #4d7b93 (text and 2 px border) on no fill
     (b2b theme; the fill a token, white by default);
   - a heading marker (heading-medium, heading-small, copytext) resets the theme's h1 uppercase
     (route network's h1.heading-small: www 28 px, normal case; brand-neutral, lh-com's h1 is not
     uppercase);
   - the import (lh-com's info template): two-column views of a.teaser.card and top-level swipers
     of them as carousel-cards (about-us, homepage, route network: bordered cards, not full-width
     pictures; the 100-years interviews), partner teasers in two- and one-column views as
     cards-icon-text partner (the homepage's LinkedIn row, Product & Service News' archive link);
     the icon modules keep their column view's title (the homepage's "Travel solutions");
   - the Newsroom's category tabs (www's maui-tab-control-responsive) as Tab sections
     (b2b-import.mjs, swiss-import.mjs's markers), on phones every item closed as www's;
   - the pre-login search page without a query: the search box alone, as www's.
   Run: node --max-old-space-size=512 --test test/b2b-parity-418.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';

const read = (p) => fs.readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const flat = (p) => read(p).replace(/\s+/g, ' ');

test('text: every paragraph of a B2B page at most 800 px (www .b2b-neo p 80rem), the homepage-only rule gone', () => {
  const css = flat('styles/styles.css');
  // a paragraph that holds a picture keeps the column (about-us' stage picture 1264 px as www's)
  assert.match(css, /body\.brand-b2b main p:not\(:has\(> picture\)\) \{ max-width: 800px; \}/);
  assert.doesNotMatch(css, /body\.brand-b2b main > \.section:first-child > \.default-content-wrapper > p:has\(> picture\) \+ h1 ~ p/);
});

test('outlined buttons: b2b-blue text and border on no fill; the fill a token (white as before elsewhere)', () => {
  const theme = flat('styles/themes/b2b.css');
  assert.match(theme, /--button-secondary-color: #4d7b93;/);
  assert.match(theme, /--button-secondary-surface: transparent;/);
  const css = flat('styles/styles.css');
  assert.match(css, /a\.button\.secondary, button\.button\.secondary \{ border-color: var\(--button-secondary-color, var\(--lh-deepblue\)\); background-color: var\(--button-secondary-surface, var\(--lh-white\)\);/);
});

test('heading markers reset the theme\'s uppercase (an h1 marked heading-small reads as www\'s 28 px normal-case title)', () => {
  const css = flat('styles/styles.css');
  ['heading-medium', 'heading-small', 'heading-copytext-large', 'heading-copytext-medium'].forEach((m) => {
    const rule = css.match(new RegExp(`main :is\\(h1, h2, h3, h4, h5, h6\\)\\.${m} \\{([^}]*)\\}`));
    assert.ok(rule, m);
    assert.match(rule[1], /text-transform: none;/, m);
  });
});

test('info template: two-column teaser cards and top-level swipers of them as carousel-cards, partner teasers in two- and one-column views as cards-icon-text', () => {
  const { templates } = JSON.parse(read('tools/importer/page-templates.json'));
  const info = templates.find((t) => t.name === 'info');
  const of = (name) => info.blocks.find((b) => b.name === name).instances;
  assert.ok(of('carousel-cards').includes(':is(.section-content, .container-content) > .twocolumn:has(> .column-view > .row > .column-view-item > .teaser > a.teaser.card):not(:has(> .column-view > .row > .column-view-item > :not(.teaser)))'));
  assert.ok(of('carousel-cards').includes(':is(.section-content, .container-content) > .carousel:has(> .new-carousel a.teaser.card)'));
  assert.ok(of('cards-icon-text').includes(':is(.section-content, .container-content) > :is(.twocolumn, .onecolumn):has(> .column-view > .row > .column-view-item > .teaser > a.teaser.partner):not(:has(> .column-view > .row > .column-view-item > :not(.teaser)))'));
  // and the generated import script carries them
  const script = read('tools/importer/import-info.js');
  assert.ok(script.includes('.carousel:has(> .new-carousel a.teaser.card)'));
  assert.ok(script.includes('a.teaser.partner):not(:has(> .column-view > .row > .column-view-item > :not(.teaser)))'));
});

globalThis.WebImporter = {
  Blocks: {
    createBlock(doc, { name, variants = [], cells }) {
      const t = doc.createElement('table');
      t.setAttribute('data-name', [name, ...variants].join(' '));
      cells.forEach((row) => {
        const tr = doc.createElement('tr');
        row.forEach((c) => {
          const td = doc.createElement('td');
          if (Array.isArray(c)) c.forEach((n) => td.append(n)); else if (c) td.append(c);
          tr.append(td);
        });
        t.append(tr);
      });
      return t;
    },
  },
};

test('the icon modules keep their column view\'s title before the block (the homepage\'s "Travel solutions")', async () => {
  const { default: parse } = await import('../tools/importer/parsers/cards-icon-text.js');
  const { document } = parseHTML(`<!DOCTYPE html><html><body><main><div class="container-content">
    <div class="b2b-iconmodules fourcolumn column event"><div class="column-view flex-column"><div><h2 class="heading-medium">Travel solutions</h2></div>
    <div class="row"><div class="col-lg column-view-item"><div class="iconmodule section"><div class="icon-module"><img class="icon-module__icon" src="/content/dam/b2b/icon.svg" alt=""><h3 class="icon-module__heading">Travel ID</h3><p class="icon-module__description">One login</p><a class="icon-module__cta" href="/de/en/travel-id">More</a></div></div></div></div></div></div>
  </div></main></body></html>`);
  parse(document.querySelector('.b2b-iconmodules'), { document });
  const block = document.querySelector('table[data-name]');
  assert.equal(block.getAttribute('data-name'), 'cards-icon-text stacked');
  const before = block.previousElementSibling;
  assert.ok(before && before.tagName === 'H2', 'the title before the block');
  assert.equal(before.textContent.trim(), 'Travel solutions');
  assert.equal(before.className, 'heading-medium');
});

test('b2b-import.mjs: the tab sets as Tab sections (swiss-import.mjs\'s markers before the import, the sections after it)', () => {
  const src = read('tools/importer/b2b-import.mjs');
  assert.match(src, /import \{ withTabMarkers, splitTabSections \} from '\.\/swiss-import\.mjs';/);
  assert.match(src, /withTabMarkers\(/);
  assert.match(src, /splitTabSections\(/);
});

test('search page without a query: the box alone on B2B as www\'s pre-login search', async () => {
  const { resultState } = await import('../blocks/search-results/search-results.js');
  assert.equal(resultState('', false, 'b2b'), 'empty');
  assert.equal(resultState('', false, 'swiss'), 'empty');
  assert.equal(resultState('', false, ''), 'failed', 'lh-com as before');
  assert.equal(resultState('ndc', false, 'b2b'), 'results');
});

test('a Tab section with nothing but its metadata hands Tab and Tabs to the section after it (the Newsroom\'s grey panels: one set of three, the cards in the panels)', async () => {
  const { withTabPanels } = await import('../tools/importer/b2b-import.mjs');
  const meta = (rows) => `<div class="section-metadata">${rows.map(([k, v]) => `<div><div>${k}</div><div>${v}</div></div>`).join('')}</div>`;
  const doc = [
    '<div><h1>News</h1></div>',
    `<div>${meta([['Tab', 'Product &amp; Services'], ['Tabs', '1']])}</div>`,
    `<div><h2>What's new: Product &amp; Services</h2><div class="carousel-cards grid"><div><div>a</div></div></div>${meta([['style', 'grey']])}</div>`,
    `<div>${meta([['Tab', 'Connections'], ['Tabs', '1']])}</div>`,
    `<div><h2>What's new: Connections</h2>${meta([['style', 'grey']])}</div>`,
    `<div>${meta([['Tab', 'Partner'], ['Tabs', '1']])}</div>`,
    '<div><h2>What\'s new: Partner</h2></div>',
    '<div><div class="metadata"><div><div>Title</div><div>News</div></div></div></div>',
  ].join('\n');
  const out = withTabPanels(doc);
  const sections = out.split('\n');
  assert.equal(sections.length, 5);
  assert.match(sections[1], /^<div><h2>What's new: Product &amp; Services<\/h2><div class="carousel-cards grid">.*<div class="section-metadata"><div><div>style<\/div><div>grey<\/div><\/div><div><div>Tab<\/div><div>Product &amp; Services<\/div><\/div><div><div>Tabs<\/div><div>1<\/div><\/div><\/div><\/div>$/);
  assert.match(sections[2], /<div><div>Tab<\/div><div>Connections<\/div><\/div>/);
  // a section without its own metadata gets a block of it
  assert.match(sections[3], /^<div><h2>What's new: Partner<\/h2><div class="section-metadata"><div><div>Tab<\/div><div>Partner<\/div><\/div><div><div>Tabs<\/div><div>1<\/div><\/div><\/div><\/div>$/);
  assert.equal(withTabPanels(out), out, 'idempotent');
  assert.equal(withTabPanels('<div><p>x</p></div>'), '<div><p>x</p></div>');
  const src = read('tools/importer/b2b-import.mjs');
  assert.match(src, /withTabPanels\(splitTabSections\(doc\)\)/);
});
