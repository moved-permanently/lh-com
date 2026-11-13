/* eslint-disable max-len */
/* Standing order 7 (2026-11-12), item 4: the lufthansa.com ranking. /de/en/premium-economy-class and
   /de/en/tips-senior-travellers share a cause: www's stage (an AEM section with .inspirationteaser), then a padded AEM
   section (the intro), then an unpadded one ("Your personal space", a sidebar). The stage's before-padded held the
   intro's top padding, but the unpadded AEM section stayed in the intro's section, so the intro's bottom padding and
   .mb-default went missing (premium-economy-class: the sidebar 40 px higher than www's at 1440). For info and fleet
   pages, when the intro has .mb-default, it now is style padded spaced, the stage loses before-padded (the same space
   above it), and the unpadded section starts a section of its own. An intro without .mb-default stays as before
   (first-class-terminal measured worse). With styles.css's flush grey band before a padded section (the same order),
   drafts on our host, % off www at 1440 / 390: premium-economy-class 19.4 / 19.5 -> 8.0 / 16.9, hearing-impairment
   8.4 / 7.1 -> 5.8 / 6.5, visual-impairment 9.8 / 6.1 -> 7.7 / 6.3, passengers-with-sensory-impairment
   5.6 / 6.5 -> 6.0 / 6.7.
   Run: node --max-old-space-size=256 --test test/stage-padded-split-so7.test.mjs */
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
// /de/en/premium-economy-class's shape
const page = (introMb = true) => [
  aem('<div class="inspirationteaser"><h1>Premium Economy</h1></div>', { pad: false }),
  aem('<div class="headline"><h2>A little something extra</h2></div><div class="text"><p>Intro</p></div>', { mb: introMb }),
  aem('<div class="headline"><h2>Your personal space</h2></div><div class="text"><p>Sidebar</p></div>', { pad: false }),
  aem('<div class="headline"><h2>Comfort</h2></div><div class="text"><p>More</p></div>', { pad: false }),
].join('');

const run = (name, url = 'https://www.lufthansa.com/de/en/premium-economy-class', introMb = true) => {
  const { document } = parseHTML(`<html><body><main><div class="container-content">${page(introMb)}</div></main></body></html>`);
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
  ['onLoad', 'beforeTransform', 'afterTransform'].forEach((hook) => sectionsTransform(hook, main, { document, template, url, params: { originalURL: url } }));
  return main.innerHTML.split('<hr>').map((html) => {
    const doc = parseHTML(`<html><body>${html}</body></html>`).document;
    const style = [...doc.querySelectorAll('table tr')].slice(1).map((tr) => tr.children[1].textContent).join('');
    doc.querySelectorAll('table').forEach((t) => t.remove());
    return { text: [...doc.querySelectorAll('h1, h2, p')].map((e) => e.textContent.trim()).filter(Boolean).join(' '), style: style.split(/,\s*/).filter(Boolean).sort() };
  }).filter((x) => x.text || x.style.length);
};

test('info: the intro after the stage is padded (spaced), the stage loses before-padded, the unpadded AEM section is a section of its own', () => {
  const s = run('info');
  assert.deepEqual(s.map((x) => x.text), ['Premium Economy', 'A little something extra Intro', 'Your personal space Sidebar Comfort More'], JSON.stringify(s));
  assert.deepEqual(s[0].style, ['stage']);
  assert.deepEqual(s[1].style, ['padded', 'spaced']);
  assert.deepEqual(s[2].style, []);
});

test('an intro without .mb-default: as before (before-padded stays, one section)', () => {
  const s = run('info', 'https://www.lufthansa.com/de/en/premium-economy-class', false);
  assert.ok(s[0].style.includes('before-padded'), JSON.stringify(s));
  assert.ok(s.some((x) => x.text === 'A little something extra Intro Your personal space Sidebar Comfort More'), JSON.stringify(s));
});

test('as before on other templates and other brands: before-padded stays, the intro and the unpadded one together', () => {
  const s = run('hub');
  assert.ok(s[0].style.includes('before-padded'), JSON.stringify(s));
  assert.ok(s.some((x) => x.text === 'A little something extra Intro Your personal space Sidebar Comfort More'), JSON.stringify(s));
  const swiss = run('info', 'https://www.swiss.com/ch/en/x');
  assert.ok(swiss[0].style.includes('before-padded'), JSON.stringify(swiss));
});
