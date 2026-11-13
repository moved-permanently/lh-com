/* eslint-disable max-len */
/* Standing order 20 (2026-11-13), item 1: the general grey-band rule (no section gap under a grey column band before an
   unstyled section) and /de/en/book-and-manage/flights/ana. ana's band is a whole grey AEM section with .mb-default whose
   next AEM section is padded on www (.section-padding-y-regular: the FAQs). There www draws the band's .mb-default and the
   padding, which our unstyled next section does not have: at 390 our 48px gap is right (the FAQ title 1px off www's), at
   1440 23px short, and neither 0, 24 nor 24 + the padding fits both widths (8.0 / 9.3 % off www today, 10.3 / 6.9 with
   the rule). Such a band gets style before-padded now (as the stages before a padded section): no CSS draws it on a grey
   section, the band rule skips it, so the page stays as it is.
   Run: node --max-old-space-size=256 --test test/grey-before-padded-so20.test.mjs */
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
const run = (name, PAGE, url = 'https://www.lufthansa.com/de/en/passengers-with-sensory-impairment') => {
  const { document } = parseHTML(`<html><body><main><div class="container-content">${PAGE}</div></main></body></html>`);
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

const band = (mb) => `<div class="section"><div class="section-regular container-gray${mb ? ' mb-default' : ''}"><div class="section-content container-fluid section-regular"><div class="twocolumn column"><div class="column-view"><div class="row"><div class="column-view-item"><div class="headline"><h2>The Lufthansa and ANA apps</h2></div></div></div></div></div></div></div></div>`;
const PAGE = (mb = true, nextPad = true) => [
  aem('<div class="headline"><h1>Your travel with Lufthansa and ANA</h1></div><div class="text"><p>Intro</p></div>', { pad: false }),
  band(mb),
  aem('<div class="headline"><h2>FAQs on travel with Lufthansa and ANA</h2></div><div class="text"><p>FAQ</p></div>', { pad: nextPad }),
].join('');
const bandStyle = (page) => run('info', page).find((x) => x.text.startsWith('The Lufthansa and ANA apps')).style;

test('a whole grey AEM section with .mb-default before a padded AEM section: before-padded', () => {
  assert.ok(bandStyle(PAGE()).includes('before-padded'), JSON.stringify(bandStyle(PAGE())));
});

test('not before an unpadded AEM section, not without .mb-default (flush)', () => {
  assert.ok(!bandStyle(PAGE(true, false)).includes('before-padded'));
  const flush = bandStyle(PAGE(false, true));
  assert.ok(!flush.includes('before-padded') && flush.includes('flush'), JSON.stringify(flush));
});
