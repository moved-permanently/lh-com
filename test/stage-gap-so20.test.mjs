/* eslint-disable max-len */
/* Standing order 20 (2026-11-13), item 2: /de/en/first-class-terminal's stages. www: the padded "Cigar Lounge" AEM section
   (no .mb-default), then the stage "Everything you need": the section's padding and nothing more. Our padded section kept
   the section gap after its padding, the stage 48px lower than www's (390). A padded AEM section without .mb-default
   right before a stage gets flush now (lufthansa.com's info pages). Drafts on our host, % off www at 1440 / 390:
   first-class-terminal 14.9 / 32.0 -> 12.7 / 28.4, economy-class 15.9 / 28.1 -> 13.5 / 22.9. With .mb-default (spaced)
   tips-senior-travellers got worse (21.9 -> 22.9): as before.
   Run: node --max-old-space-size=256 --test test/stage-gap-so20.test.mjs */
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

const stage = (t) => `<div class="section"><div class="mb-default"><div class="section-content container-fluid section-wide"><div class="inspirationteaser"><h2>${t}</h2></div></div></div></div>`;
const PAGE = (mb = false) => [
  stage('Welcome'),
  aem('<div class="headline"><h2>First-class drinks</h2></div><div class="text"><p>Drinks</p></div>', { mb: false }),
  aem('<div class="headline"><h2>Cigar Lounge</h2></div><div class="text"><p>Cigars</p></div>', { mb }),
  stage('Everything you need'),
  aem('<div class="headline"><h2>In the lounge</h2></div><div class="text"><p>End</p></div>'),
].join('');
const styleOf = (page, start) => run('info', page, 'https://www.lufthansa.com/de/en/first-class-terminal').find((x) => x.text.startsWith(start)).style;

test('a padded AEM section without .mb-default right before a stage: padded flush', () => {
  assert.deepEqual(styleOf(PAGE(false), 'Cigar Lounge'), ['flush', 'padded']);
});

test('with .mb-default as before (spaced measured worse: tips-senior-travellers); a brand site as before', () => {
  assert.deepEqual(styleOf(PAGE(true), 'Cigar Lounge'), ['padded']);
  const brand = run('info', PAGE(false), 'https://www.austrian.com/at/en/x').find((x) => x.text.startsWith('Cigar Lounge'));
  assert.ok(!brand || !brand.style.includes('flush'), JSON.stringify(brand));
});
