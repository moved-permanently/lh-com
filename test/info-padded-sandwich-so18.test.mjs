/* eslint-disable max-len */
/* Standing order 18 (2026-11-13), item 2: /de/en/passengers-with-sensory-impairment. www has a padded AEM section without
   .mb-default ("Hidden Disabilities Sunflower", a sidebar), an unpadded one with .mb-default ("Travelling with a
   companion") and a padded one ("Travelling with an assistance dog"). lufthansa-sections kept the unpadded one with the
   padded one before it (info), so that section's bottom padding came after the companion text, plus our section gap:
   the assistance-dog section 66px lower than www's at 1440. Such an unpadded AEM section between two padded ones now
   starts a section of its own with style spaced (its .mb-default, styles.css), the padded one before keeps spaced or
   flush (as fleet's split, test/fleet-padded-split-so6). Drafts on our host against lh-parity-002b: 11.0 -> 9.4 % off
   www at 1440, the step gone. Not after a stage (tips-senior-travellers: unmeasured), not on the brand sites, not when
   the unpadded section has no .mb-default or nothing padded follows it.
   Run: node --max-old-space-size=256 --test test/info-padded-sandwich-so18.test.mjs */
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
  ['onLoad', 'beforeTransform', 'afterTransform'].forEach((hook) => sectionsTransform(hook, main, { document, template, url, params: { originalURL: url } }));
  return main.innerHTML.split('<hr>').map((html) => {
    const doc = parseHTML(`<html><body>${html}</body></html>`).document;
    const style = [...doc.querySelectorAll('table tr')].slice(1).map((tr) => tr.children[1].textContent).join('');
    doc.querySelectorAll('table').forEach((t) => t.remove());
    return { text: [...doc.querySelectorAll('h1, h2, p')].map((e) => e.textContent.trim()).filter(Boolean).join(' '), style: style.split(/,\s*/).filter(Boolean).sort() };
  }).filter((x) => x.text || x.style.length);
};


// /de/en/passengers-with-sensory-impairment's shape (headlines and texts for its components)
const PAGE = [
  aem('<div class="headline"><h1>Passengers with invisible impairments</h1></div>', { pad: false }),
  aem('<div class="headline"><h2>Hidden Disabilities Sunflower</h2></div><div class="text"><p>Sunflower</p></div>', { mb: false }),
  aem('<div class="headline"><h2>Travelling with a companion</h2></div><div class="text"><p>Companion</p></div>', { pad: false }),
  aem('<div class="headline"><h2>Travelling with an assistance dog</h2></div><div class="text"><p>Dog</p></div>'),
].join('');

test('info: the unpadded AEM section between two padded ones is a section of its own, spaced; the padded one before flush', () => {
  const s = run('info', PAGE);
  assert.deepEqual(s.map((x) => x.text), ['Passengers with invisible impairments', 'Hidden Disabilities Sunflower Sunflower', 'Travelling with a companion Companion', 'Travelling with an assistance dog Dog'], JSON.stringify(s));
  assert.deepEqual(s[1].style, ['flush', 'padded']);
  assert.deepEqual(s[2].style, ['spaced']);
  assert.deepEqual(s[3].style, ['padded']);
});

test('as before: no .mb-default on the unpadded one, nothing padded after it, a brand site', () => {
  const merged = 'Hidden Disabilities Sunflower Sunflower Travelling with a companion Companion';
  const noMb = PAGE.replace('<div class="mb-default"><div class="section-content container-fluid section-regular "><div class="headline"><h2>Travelling with a companion', '<div class=""><div class="section-content container-fluid section-regular "><div class="headline"><h2>Travelling with a companion');
  assert.notEqual(noMb, PAGE, 'the page changed');
  assert.ok(run('info', noMb).some((x) => x.text === merged));
  const last = PAGE.slice(0, PAGE.lastIndexOf('<div class="section">'));
  assert.ok(run('info', last).some((x) => x.text === merged));
  assert.ok(!run('info', PAGE, 'https://www.austrian.com/at/en/x').some((x) => x.text === 'Travelling with a companion Companion'), 'a brand site keeps it with its neighbours');
});
