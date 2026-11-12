/* eslint-disable max-len */
/* Standing order 6 (2026-11-12), item 1: the fleet pages after the so4 re-import. www builds /de/en/32n and /de/en/320 of
   AEM sections; a padded one (.section-padding-y-regular, 2rem / 4rem above and below, .mb-default's 2.4rem under it)
   followed by an unpadded one ("The quietest cabin in its class", a sidebar). lufthansa-sections kept the unpadded AEM
   section with the padded one before it, so its padding came after both: the quietest cabin 62 px higher than www's at
   1440, the space back under it. For fleet pages such an unpadded AEM section now starts a section of its own, the
   padded one keeps spaced (or flush). Drafts on our host (the published pictures swapped in), % off www at 1440 / 390:
   320 11.8 / 9.1 -> 8.8 / 7.8, 32n 11.3 / 9.8 -> 9.8 / 9.1; the six other recorded fleet pages import unchanged.
   WebImporter's createBlock and linkedom's Range are stand-ins (as campaign-sections-484).
   Run: node --max-old-space-size=256 --test test/fleet-padded-split-so6.test.mjs */
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
// /de/en/32n's shape: the title, a padded characteristics section, an unpadded sidebar section, a padded one
const PAGE = [
  aem('<div class="headline"><h1>Airbus A320neo</h1></div>', { pad: false }),
  aem('<div class="headline"><h2>Characteristics</h2></div><div class="text"><p>New engines</p></div>'),
  aem('<div class="headline"><h2>Quietest cabin</h2></div><div class="text"><p>Cabin</p></div>', { pad: false }),
  aem('<div class="headline"><h2>Technical data</h2></div><div class="text"><p>Data</p></div>'),
].join('');

const run = (name) => {
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
  ['onLoad', 'beforeTransform', 'afterTransform'].forEach((hook) => sectionsTransform(hook, main, { document, template, url: 'https://www.lufthansa.com/de/en/32n', params: { originalURL: 'https://www.lufthansa.com/de/en/32n' } }));
  return main.innerHTML.split('<hr>').map((html) => {
    const doc = parseHTML(`<html><body>${html}</body></html>`).document;
    const style = [...doc.querySelectorAll('table tr')].slice(1).map((tr) => tr.children[1].textContent).join('');
    doc.querySelectorAll('table').forEach((t) => t.remove());
    return { text: [...doc.querySelectorAll('h1, h2, p')].map((e) => e.textContent.trim()).filter(Boolean).join(' '), style: style.split(/,\s*/).filter(Boolean).sort() };
  }).filter((x) => x.text || x.style.length);
};

test('fleet: the unpadded AEM section after a padded one is a section of its own; the padded one keeps its gap (spaced)', () => {
  const s = run('fleet');
  assert.deepEqual(s.map((x) => x.text), ['Airbus A320neo', 'Characteristics New engines', 'Quietest cabin Cabin', 'Technical data Data'], JSON.stringify(s));
  assert.deepEqual(s[1].style, ['padded', 'spaced']);
  assert.ok(!s[2].style.includes('padded'), 'the unpadded one has no padding of its own');
});

test('info as before: the unpadded AEM section stays with the padded one before it', () => {
  const s = run('info');
  assert.ok(s.some((x) => x.text === 'Characteristics New engines Quietest cabin Cabin'), JSON.stringify(s));
});
