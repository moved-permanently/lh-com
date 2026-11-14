/* eslint-disable max-len */
/* Standing order 21 (2026-11-14), item 4: www's .contentpage.pt-0 (no 2.5rem above the content) on a page that opens with
   a stage and has no profile navigation: the stage right under the header. Ours started every page 25px below it
   (styles.css), so the whole page was 25px low: /de/en/book-and-manage/flights/wetlease-hub 10.3 / 14.9 -> 7.1 / 8.7 % at
   1440 / 390 with style top-flush on its first section (a draft with working-copy styles). The importer writes it on
   lufthansa.com when the first AEM section is the stage. Census of the 3,397 www snapshots: .contentpage.pt-0 on 70 pages;
   without the profile navigation (which has its own flush, parsers/profile-nav.js) and opening with a stage: wetlease-hub
   (7 documents), local-page/south-africa-winter-promotion (2), local-page/black-friday (1). culinaryjourney (7) opens with
   a headline, not a stage: as before.
   Run: node --max-old-space-size=256 --test test/stage-top-flush-so21.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

const { default: sectionsTransform } = await import('../tools/importer/transformers/lufthansa-sections.js');

globalThis.WebImporter = {
  Blocks: {
    getMetadata: () => ({}),
    getMetadataBlock: (document) => document.createElement('table'),
    createBlock: (document, { name, cells }) => {
      const table = document.createElement('table');
      const head = document.createElement('tr');
      head.innerHTML = `<th>${name}</th>`;
      table.append(head);
      Object.entries(cells).forEach(([k, v]) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${k}</td><td>${v}</td>`;
        table.append(tr);
      });
      return table;
    },
  },
};

function rangeFor(document) {
  const pre = new Map();
  const post = new Map();
  let c = 0;
  const walk = (n) => {
    pre.set(n, c += 1);
    [...n.childNodes].forEach(walk);
    post.set(n, c += 1);
  };
  walk(document.documentElement);
  let start = 0;
  let end = Infinity;
  const inside = (n) => pre.has(n) && pre.get(n) > start && post.get(n) < end;
  return {
    setStart(node) { start = pre.get(node); },
    setStartAfter(node) { start = post.get(node); },
    setEndBefore(node) { end = pre.get(node); },
    cloneContents() {
      const frag = document.createElement('div');
      const add = (n) => {
        if (inside(n) && !inside(n.parentNode)) frag.append(n.cloneNode(true));
        else [...n.childNodes].forEach(add);
      };
      add(document.documentElement);
      return frag;
    },
  };
}

// www's AEM section: wrapper (mb-default or not) > section-content (padded or not) > components
const aem = (inner, { mb = true, pad = true } = {}) => `<div class="section"><div class="${mb ? 'mb-default' : ''}"><div class="section-content container-fluid section-regular ${pad ? 'section-padding-y-regular' : ''}">${inner}</div></div></div>`;
const run = (name, PAGE, url, { pt0 = true, nav = false } = {}) => {
  const { document } = parseHTML(`<html><body>${nav ? '<maui-sub-navigation><maui-sub-navigation-tab name="Economy" href="/x"></maui-sub-navigation-tab></maui-sub-navigation>' : ''}<main><div class="contentpage${pt0 ? ' pt-0' : ''}"><div class="container-content">${PAGE}</div></div></main></body></html>`);
  const main = document.querySelector('main');
  document.createRange = () => rangeFor(document);
  const order = () => {
    const at = new Map();
    let c = 0;
    const walk = (n) => { at.set(n, c += 1); [...n.childNodes].forEach(walk); };
    walk(document.documentElement);
    return at;
  };
  Object.getPrototypeOf(Object.getPrototypeOf(main)).compareDocumentPosition = function position(other) {
    const at = order();
    return at.get(other) > at.get(this) ? 4 : 2;
  };
  const template = { name, blocks: [], sections: [] };
  ['onLoad', 'beforeTransform', 'afterTransform'].forEach((hook) => sectionsTransform(hook, main, {
    document, template, url, params: { originalURL: url },
  }));
  return main.innerHTML.split('<hr>').map((html) => {
    const doc = parseHTML(`<html><body>${html}</body></html>`).document;
    const style = [...doc.querySelectorAll('table tr')].slice(1).map((tr) => tr.children[1].textContent).join('');
    doc.querySelectorAll('table').forEach((t) => t.remove());
    return { text: [...doc.querySelectorAll('h1, h2, p')].map((e) => e.textContent.trim()).filter(Boolean).join(' '), style: style.split(/,\s*/).filter(Boolean).sort() };
  }).filter((x) => x.text || x.style.length);
};


const stage = (t) => `<div class="section"><div class=""><div class="section-content container-fluid section-wide"><div class="inspirationteaser"><h2>${t}</h2></div></div></div></div>`;
const PAGE = [
  stage('Wet lease'),
  aem('<div class="headline"><h2>Flights operated by partners</h2></div><div class="text"><p>Partners</p></div>'),
].join('');
const PAGE_URL = 'https://www.lufthansa.com/de/en/book-and-manage/flights/wetlease-hub';
const styleOf = (page, start, opts, url = PAGE_URL) => run('info', page, url, opts).find((x) => x.text.startsWith(start)).style;

test('.contentpage.pt-0, a stage first, no profile navigation: the stage section gets top-flush', () => {
  assert.ok(styleOf(PAGE, 'Wet lease').includes('top-flush'), JSON.stringify(styleOf(PAGE, 'Wet lease')));
  assert.ok(!styleOf(PAGE, 'Flights operated').includes('top-flush'), 'only the first section');
});

test('not without pt-0, not with the profile navigation, not when the page opens with something else, not on a brand site', () => {
  assert.ok(!styleOf(PAGE, 'Wet lease', { pt0: false }).includes('top-flush'));
  assert.ok(!styleOf(PAGE, 'Wet lease', { nav: true }).includes('top-flush'));
  const headlineFirst = [aem('<div class="headline"><h1>Culinary journey</h1></div><div class="text"><p>Food</p></div>'), stage('Wet lease')].join('');
  assert.ok(!styleOf(headlineFirst, 'Wet lease').includes('top-flush'));
  assert.ok(!styleOf(PAGE, 'Wet lease', {}, 'https://www.austrian.com/at/en/x').includes('top-flush'));
});

test('styles.css: a first section with top-flush starts right under the header', async () => {
  const fs = await import('node:fs');
  const css = fs.readFileSync(new URL('../styles/styles.css', import.meta.url), 'utf8');
  const at = css.indexOf('body.appear main > .section.top-flush:first-of-type:not(.breadcrumb-container) {');
  assert.ok(at > css.indexOf('body.appear main > .section:first-of-type:not(.breadcrumb-container) {'), 'after the 25px rule');
  assert.match(css.slice(at, css.indexOf('}', at)), /margin-top: 0;/);
});
