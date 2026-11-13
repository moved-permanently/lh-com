/* eslint-disable max-len */
/* Standing order 19 (2026-11-13), item 2: the two sensory-impairment gaps order 18 wrote as rows for DA's copy, taught to
   lufthansa-sections. Both are our 48px section gap where www has one .mb-default (2.4rem):
   - "Assistance on your trip": an unpadded AEM section with .mb-default between two padded ones, where the padded one
     before follows the stage (the stage rules give it its break later, so order 18's rule found none): it starts a
     section of its own with style spaced all the same;
   - the padded assistance-dog section (.mb-default) right before a grey AEM section without one ("Please tell us in
     advance"): padded spaced (before a grey section with .mb-default our gap is right: cognitive-impairment).
   Measured as rows on DA's copy (order 18): 10.2 / 4.9 -> 7.7 / 3.9 % off www at 1440 / 390.
   Run: node --max-old-space-size=256 --test test/info-padded-gaps-so19.test.mjs */
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



const stage = '<div class="section"><div class="mb-default"><div class="section-content container-fluid section-regular "><div class="inspirationteaser"><h1>Passengers with invisible impairments</h1></div></div></div></div>';
const grey = '<div class="section"><div class="section-regular container-gray"><div class="section-content container-fluid section-regular section-padding-y-regular"><div class="headline"><h2>Please tell us in advance</h2></div><div class="text"><p>Grey</p></div></div></div></div>';
// /de/en/passengers-with-sensory-impairment's shape (headlines and texts for its components)
const PAGE = [
  stage,
  aem('<div class="headline"><h2>Invisible but real</h2></div><div class="text"><p>Invisible</p></div>'),
  aem('<div class="headline"><h2>Assistance on your trip</h2></div><div class="text"><p>Assistance</p></div>', { pad: false }),
  aem('<div class="headline"><h2>Hidden Disabilities Sunflower</h2></div><div class="text"><p>Sunflower</p></div>', { mb: false }),
  aem('<div class="headline"><h2>Travelling with a companion</h2></div><div class="text"><p>Companion</p></div>', { pad: false }),
  aem('<div class="headline"><h2>Travelling with an assistance dog</h2></div><div class="text"><p>Dog</p></div>'),
  grey,
  aem('<div class="headline"><h2>Questions</h2></div><div class="text"><p>End</p></div>', { pad: false }),
].join('');
const at = (s, start) => s.find((x) => x.text.startsWith(start));

test('the stage\'s padded neighbour, then an unpadded AEM section between two padded ones: a section of its own, spaced', () => {
  const s = run('info', PAGE);
  const a = at(s, 'Assistance on your trip');
  assert.ok(a, JSON.stringify(s));
  assert.equal(a.text, 'Assistance on your trip Assistance', 'its own section');
  assert.deepEqual(a.style, ['spaced']);
  assert.ok(at(s, 'Invisible but real').text.endsWith('Invisible'), 'the padded one before ends before it');
});

test('a padded AEM section with .mb-default right before a grey AEM section: padded spaced', () => {
  const s = run('info', PAGE);
  assert.deepEqual(at(s, 'Travelling with an assistance dog').style, ['padded', 'spaced'], JSON.stringify(s));
  // without .mb-default: as before (no gap token)
  const noMb = PAGE.replace('<div class="mb-default"><div class="section-content container-fluid section-regular section-padding-y-regular"><div class="headline"><h2>Travelling with an assistance dog', '<div class=""><div class="section-content container-fluid section-regular section-padding-y-regular"><div class="headline"><h2>Travelling with an assistance dog');
  assert.notEqual(noMb, PAGE, 'the page changed');
  assert.deepEqual(at(run('info', noMb), 'Travelling with an assistance dog').style, ['padded']);
  // a grey section with .mb-default of its own: as before (cognitive-impairment: our gap is right there)
  const greyMb = PAGE.replace('<div class="section-regular container-gray">', '<div class="section-regular container-gray mb-default">');
  assert.notEqual(greyMb, PAGE, 'the page changed');
  assert.deepEqual(at(run('info', greyMb), 'Travelling with an assistance dog').style, ['padded']);
});

test('order 18\'s companion split as it was; a brand site as before', () => {
  const s = run('info', PAGE);
  assert.deepEqual(at(s, 'Travelling with a companion').style, ['spaced']);
  assert.deepEqual(at(s, 'Hidden Disabilities Sunflower').style, ['flush', 'padded']);
  const brand = run('info', PAGE, 'https://www.austrian.com/at/en/x');
  assert.ok(!brand.some((x) => x.style.includes('spaced') && x.text.startsWith('Assistance')), JSON.stringify(brand));
});
