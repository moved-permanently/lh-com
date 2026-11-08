/* eslint-disable max-len */
/* lufthansa.com's importer (lufthansa-sections.js), brief 444 follow-up (ema-cashub's brief 441, first-class-terminal
   +48 px twice): two padded AEM sections in a row (.section-padding-y-regular, 2rem / 4rem above and below) came
   in as two sections with style padded and our 48 px section gap between them; www has only the first one's
   .mb-default (2.4rem) there, or nothing. Now the earlier one gets style spaced (with .mb-default: a 24 px gap)
   or flush (without: none), styles.css main > .section.padded.spaced / .flush. In the lufthansa.com snapshots 471
   such pairs on 166 pages (328 with .mb-default: www 104 px between the contents at 1440, ours 128; 143 without:
   www 80, ours 128).
   Run: node --max-old-space-size=256 --test test/importer-padded-pairs.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
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

const run = (document, template = { name: 'info', blocks: [], sections: [] }) => {
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
  transform('beforeTransform', main, { document, template });
  transform('afterTransform', main, { document, template });
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

test('a padded section between two padded ones: spaced when it has .mb-default, flush when not', () => {
  const s = sections(run(page([aem('One'), aem('Two'), aem('Three', false), aem('Four')])));
  assert.equal(styleOf(s, /^One/), '', 'the first padded section opens no section of its own');
  assert.deepEqual(styleOf(s, /^Two/).replace('style: ', '').split(', ').sort(), ['padded', 'spaced']);
  assert.deepEqual(styleOf(s, /^Three/).replace('style: ', '').split(', ').sort(), ['flush', 'padded']);
  assert.equal(styleOf(s, /^Four/), 'style: padded', 'the last one keeps the section gap');
});

test('the theme: the gap after a padded section that a padded one follows', () => {
  const css = fs.readFileSync(new URL('../styles/styles.css', import.meta.url), 'utf8').replace(/\s+/g, ' ');
  assert.match(css, /main > \.section\.padded\.spaced \{ margin-bottom: var\(--spacing-default\); \}/);
  assert.match(css, /main > \.section\.padded\.flush \{ margin-bottom: 0; \}/);
});

// the brief after 479, item 3 (ema-lufthansa's row 42: /de/en/book-and-manage/flights/ana/faq, -8.8 %): www pads every AEM
// section with .section-padding-y-regular; a padded one right after an unpadded one stayed in that one's section (no
// padding). It opens a section with style padded too (not after a stage or a grey band, whose own spacing covers it).
const plain = (text) => `<div class="section"><div><div class="section-content section-regular"><p>${text}</p></div></div></div>`;
test('ANA FAQ: a padded section after an unpadded one opens a padded section; the unpadded one after it joins it', () => {
  const s = sections(run(page([plain('Onboard'), plain('Check-in'), aem('Non-stop', false), plain('Baggage'), aem('Assistance')])));
  assert.equal(styleOf(s, /Onboard/), '');
  assert.equal(styleOf(s, /Non-stop/), 'style: padded');
  assert.ok(s.find((x) => x.text.includes('Non-stop')).text.includes('Baggage'), 'the unpadded one after it stays in its section');
  assert.equal(styleOf(s, /Assistance/), 'style: padded');
  assert.equal(s.length, 3);
});

test('a padded section after a stage: as before (the stage\'s own spacing covers it)', () => {
  const stage = '<div class="section"><div class="mb-default"><div class="section-content"><div class="inspirationteaser"><h1>Stage</h1></div></div></div></div>';
  const s = sections(run(page([stage, aem('Next')])));
  const next = s.find((x) => x.text.includes('Next'));
  assert.ok(!next.meta.some((m) => m.split(/[:,]\s*/).includes('padded')), JSON.stringify(s));
});

test('after an author quote alone in its AEM section (first-class-terminal: the cleanup\'s quote spacers): as before', () => {
  const quote = '<div class="section"><div class="mb-default"><div class="section-content section-regular"><div class="authorquote"><p>Sojourn in style</p></div></div></div></div>';
  const s = sections(run(page([plain('Intro'), quote, aem('Carousel')])));
  const next = s.find((x) => x.text.includes('Carousel'));
  assert.ok(!next.meta.some((m) => m.split(/[:,]\s*/).includes('padded')), JSON.stringify(s));
});
