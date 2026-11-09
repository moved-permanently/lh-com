/* eslint-disable max-len */
/* lufthansa.com's importer (lufthansa-sections.js), the brief after 523 item 1 (ema-adobe's handover
   tools/reports/parity-2026-11-09/hub-campaign-521.md, section 1): www pads every stage AEM section
   (.section-padding-y-regular); a stage after an unpadded AEM section stayed unpadded here ("not for a
   stage", the brief after 479): destinations' New York and Cape Town stages 40 px less above and below at
   1440, 20 at 390. Now such a stage gets style padded too; not when a padded AEM section follows it (style
   before-padded holds that space already: economy-class's Allegris stage measured worse padded, 23.2 to
   30.3 %). The brand sites' imports as before.
   Run: node --max-old-space-size=256 --test test/hub-stage-padded-526.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

const { default: transform } = await import('../tools/importer/transformers/lufthansa-sections.js');

globalThis.WebImporter = {
  Blocks: {
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

// linkedom's Range lacks what the transformer uses (setStart, a setEndBefore that works on any
// node): a stand-in by document order, cloneContents the nodes wholly between the boundaries
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

const run = (document, template = { name: 'info', blocks: [], sections: [] }, url = 'https://www.lufthansa.com/de/en/book-and-manage/flights/ana/faq') => {
  const main = document.querySelector('main');
  document.createRange = () => rangeFor(document);
  // linkedom's compareDocumentPosition misses a node after an ancestor's sibling: by document order
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
  const params = { originalURL: url };
  transform('beforeTransform', main, { document, template, params });
  transform('afterTransform', main, { document, template, params });
  return main;
};
// the sections of the result: the content between breaks, each with its metadata rows
const sections = (main) => main.innerHTML.split('<hr>').map((html) => {
  const doc = parseHTML(`<html><body>${html}</body></html>`).document;
  const meta = [...doc.querySelectorAll('table tr')].slice(1).map((tr) => [...tr.children].map((c) => c.textContent).join(': '));
  return { text: doc.body.textContent.replace(/\s+/g, ' ').trim(), meta };
});

const aem = (text, mb = true) => `<div class="section">${mb ? '<div class="mb-default">' : '<div>'}<div class="section-content section-padding-y-regular"><p>${text}</p></div></div></div>`;
const page = (secs) => parseHTML(`<html><body><main><div class="container-content">${secs.join('')}</div></main></body></html>`).document;
const styleOf = (s, re) => s.find((x) => re.test(x.text)).meta.find((m) => m.startsWith('style: ')) || '';

const plain = (text) => `<div class="section"><div><div class="section-content section-regular"><p>${text}</p></div></div></div>`;
const stage = (title) => `<div class="section"><div class="mb-default"><div class="section-content section-padding-y-regular"><div class="inspirationteaser"><h2>${title}</h2><p>A stage.</p></div></div></div></div>`;
const styles = (s, re) => (styleOf(s, re).replace('style: ', '') || '').split(', ').filter(Boolean).sort();

test('a padded stage after an unpadded AEM section: style padded, as www pads it (New York, Cape Town)', () => {
  const s = sections(run(page([plain('Intro'), stage('New York'), plain('After New York')])));
  assert.deepEqual(styles(s, /New YorkA stage/), ['padded', 'stage']);
});

test('a padded stage after an unpadded AEM section with a padded one after it: as today (economy-class\'s Allegris stage)', () => {
  const s = sections(run(page([plain('Intro'), stage('Allegris'), aem('Next')])));
  assert.deepEqual(styles(s, /AllegrisA stage/), ['before-padded', 'stage']);
});

test('a padded stage after a padded AEM section: as before (Berlin)', () => {
  const s = sections(run(page([aem('Intro'), stage('Berlin'), plain('After Berlin')])));
  assert.deepEqual(styles(s, /BerlinA stage/), ['padded', 'stage']);
});

test('a brand site\'s page (www.austrian.com): a stage after an unpadded AEM section as before', () => {
  const s = sections(run(page([plain('Intro'), stage('Vienna'), plain('After Vienna')]), undefined, 'https://www.austrian.com/at/en/destinations'));
  assert.deepEqual(styles(s, /ViennaA stage/), ['stage']);
});
