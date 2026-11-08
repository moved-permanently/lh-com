/* eslint-disable max-len, import/extensions */
/* TAP's inspiration pages (brief 488, tools/reports/tap/parity.md row 126; es-es/destinos/inspirate, de-de/reiseziele/
   inspirieren): www's CategoryAccordion holds articles (a country's accordion item each) whose sections include card
   lists www swipes on phones (162 a language, mobileType slider). An accordion cell holds no block, so the importer
   wrote them as plain text. Now, on a page imported with fragments (the inspiration pages: 2 MB), each article is a
   fragment document of its own (/<locale>/fragments/<page>/<article>, its sections as blocks: the card lists
   cards-teaser with phone-slider), written once however many categories hold it, and its accordion item's panel links
   it; accordion-columns-tap.js loads it into the panel when the item opens (the first one at once).
   Run: node --max-old-space-size=512 --test test/tap-inspire-articles-488.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';
import { convertPage } from '../tools/importer/tap-import.mjs';

const t = (value) => ({ nodeType: 'text', value });
const para = (...content) => ({ nodeType: 'paragraph', content });
const img = { __typename: 'ImageRef', _path: '/content/dam/tap/x.jpg', _dynamicUrl: '/adobe/dynamicmedia/deliver/dm-aid--x/x.jpg' };
const article = (slug, title) => ({
  __typename: 'CategoryItemModel',
  _path: `/content/dam/tap/master/es/components/destinos/inspire-se/${slug}`,
  question: title,
  answer: { json: [para()] },
  sections: [
    { __typename: 'ComponentRichTextBlockModel', richTextContent: { json: [para(t('Antiguo reino en el suroeste de Alemania.'))] } },
    {
      __typename: 'ComponentGenericCardListModel',
      desktopType: 'grid',
      mobileType: 'slider',
      itemsPerRow: 3,
      items: [{
        __typename: 'GenericCard1Model', title: 'Neuschwanstein', genericCard1Description: { json: [para(t('Un castillo.'))] }, image: img,
      }],
    },
  ],
});
const nd = {
  props: {
    pageProps: {
      page: {
        title: 'Inspírate',
        sections: [{ __typename: 'ComponentHeadingModel', title: 'Inspírate' }, {
          __typename: 'ComponentCategoryAccordionModel',
          categories: [
            { label: 'Aventura', subCategories: [{ label: 'Alemania', items: [article('como-um-conto-de-fadas', 'Múnich, como un cuento de hadas')] }] },
            { label: 'Cultura', subCategories: [{ label: 'Alemania', items: [article('como-um-conto-de-fadas', 'Múnich, como un cuento de hadas')] }] },
          ],
        }],
      },
    },
  },
};
const site = {
  url: 'https://www.flytap.com/es-es/destinos/inspirate', scope: new Set(), media: () => null, fragments: true,
};
const dom = (html) => parseHTML(`<html><body><main>${html}</main></body></html>`).document;

test('an article a fragment document of its own, its card list cards-teaser with phone-slider; written once for two categories', () => {
  const r = convertPage(nd, site);
  const docs = r.fragments.map((f) => f.doc);
  const art = '/es-es/fragments/inspirate/como-um-conto-de-fadas';
  assert.equal(docs.filter((d) => d === art).length, 1, 'once');
  const a = dom(r.fragments.find((f) => f.doc === art).html);
  assert.ok(a.querySelector('.cards-teaser.three-up.phone-slider'), 'the card list a block');
  assert.ok(a.querySelector('main').textContent.includes('Antiguo reino'));
  assert.ok(!a.querySelector('.accordion-columns'));
  // the categories' fragments: the accordion item's panel links the article
  const groups = r.fragments.filter((f) => f.doc !== art);
  assert.equal(groups.length, 2);
  groups.forEach((g) => {
    const d = dom(g.html);
    const panel = d.querySelector('.accordion-columns > div > div:last-child');
    // the article's path as code, not a link: scripts.js loads every /fragments/ link at once (108 articles a page)
    assert.equal(panel.querySelector('p > code:only-child').textContent, art, 'the panel names it');
    assert.ok(!panel.querySelector('a[href*="/fragments/"]'), 'not as a link');
    assert.ok(!panel.textContent.includes('Antiguo reino'), 'no copy of its text');
  });
});

test('accordion-columns-tap.js: a panel that links a fragment loads it when the item opens, the open one at once, once', async () => {
  const { window, document } = parseHTML('<!DOCTYPE html><html><body></body></html>');
  globalThis.window = window;
  globalThis.document = document;
  const { loadPanelFragments } = await import('../blocks/accordion-columns/accordion-columns-tap.js');
  document.body.innerHTML = '<div class="accordion-columns faq block"><details class="accordion-columns-item" open><summary>A</summary><div class="accordion-columns-panel"><p><code>/es-es/fragments/inspirate/a</code></p></div></details><details class="accordion-columns-item"><summary>B</summary><div class="accordion-columns-panel"><p><code>/es-es/fragments/inspirate/b</code></p></div></details><details class="accordion-columns-item"><summary>C</summary><div class="accordion-columns-panel"><p>Text and <code>/es-es/fragments/inspirate/c</code></p></div></details></div>';
  const loaded = [];
  // (a fragment decorated as a page gets the page's breadcrumb: scripts.js buildAutoBlocks; not in a panel)
  const load = async (p) => { loaded.push(p); const m = document.createElement('main'); m.innerHTML = `<div class="section"><div class="breadcrumb-wrapper"><div class="breadcrumb block"></div></div><p>${p} body</p></div>`; return m; };
  await loadPanelFragments(document.querySelector('.accordion-columns'), { load });
  assert.deepEqual(loaded, ['/es-es/fragments/inspirate/a'], 'the open item at once, the closed one not yet, a path in running text never');
  const [, b] = [...document.querySelectorAll('details')];
  b.open = true;
  b.dispatchEvent(new window.Event('toggle'));
  await new Promise((r) => { setTimeout(r, 0); });
  b.dispatchEvent(new window.Event('toggle'));
  await new Promise((r) => { setTimeout(r, 0); });
  assert.deepEqual(loaded, ['/es-es/fragments/inspirate/a', '/es-es/fragments/inspirate/b'], 'once each');
  assert.ok(b.querySelector('.accordion-columns-panel .section').textContent.includes('/b body'));
  assert.ok(!b.querySelector('.accordion-columns-panel code'), 'the path gives way to it');
  assert.ok(!document.querySelector('.accordion-columns-panel .breadcrumb'), 'no breadcrumb in a panel');
});

test('accordion-columns.js hands a TAP block with a fragment path in a panel to loadPanelFragments', async () => {
  const fs = await import('node:fs');
  const js = fs.readFileSync(new URL('../blocks/accordion-columns/accordion-columns.js', import.meta.url), 'utf8');
  assert.match(js, /if \(tapBrand && block\.querySelector\('\.accordion-columns-panel p > code:only-child'\)\) \{\s+const \{ loadPanelFragments \} = await import\('\.\/accordion-columns-tap\.js'\);\s+await loadPanelFragments\(block\);\s+\}/);
});
