/* eslint-disable max-len */
/* Standing order 21 (2026-11-14), item 4: /de/en/during-your-trip/lhg-wifi and book-and-manage/rebook/involuntary-rebooking.
   www's padded AEM section holds the FAQ heading and the accordion. The info template's section-2 (a break before the
   accordion) cut it in two: the heading alone in a padded section (its bottom padding and our section gap under it), the
   accordion in an unstyled one. On lufthansa.com the break is left out when the accordion's padded AEM section holds only
   headings before it. Drafts with the accordion in the heading's section, % off www at 1440 / 390: lhg-wifi 11.5 / 14.3 ->
   10.3 / 13.5, involuntary-rebooking 7.6 / 9.9 -> 6.8 / 8.7. Census of the 9,912 published copies: a padded section of
   only a heading before an accordion's section on these two pages (16 documents each). The 750 info snapshots imported
   offline before and after: 12 change, these two pages and flynet (4 roots each; flynet's FAQ heading opens its padded
   AEM section on www as well; no recording, no row). Unpadded AEM sections, other content
   before the accordion, where the importer writes no padded
   (ana: joined 390 +0.5) and a grey FAQ section (advance-seat-reservation: joined 1440 +0.6) as before.
   Run: node --max-old-space-size=256 --test test/faq-join-so21.test.mjs */
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
  const template = { name, blocks: [], sections: [{ id: 'section-1', selector: '.nothing' }, { id: 'section-2', selector: ['.container-content > .section .section-content > .accordion'] }] };
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


const FAQ = '<div class="headline"><h2>Frequently Asked Questions</h2></div><div class="accordion"><div class="accordionitem"><p>Q1</p></div></div>';
const PAGE = (faq, opts) => [
  aem('<div class="headline"><h2>Your benefits</h2></div><div class="text"><p>Benefits</p></div>'),
  aem(faq, opts),
].join('');
const URL_LH = 'https://www.lufthansa.com/de/en/during-your-trip/lhg-wifi';
const parts = (page, url = URL_LH) => run('info', page, url).map((x) => `${x.text} [${x.style.join(',')}]`);

test('lufthansa.com: a padded AEM section of a heading and an accordion stays one padded section', () => {
  assert.deepEqual(parts(PAGE(FAQ)), ['Your benefits Benefits []', 'Frequently Asked Questions Q1 [padded]']);
});

test('as before: an unpadded AEM section, text before the accordion, a brand site', () => {
  assert.deepEqual(parts(PAGE(FAQ, { pad: false })), ['Your benefits Benefits Frequently Asked Questions []', 'Q1 []']);
  const withText = '<div class="headline"><h2>Frequently Asked Questions</h2></div><div class="text"><p>Intro</p></div><div class="accordion"><div class="accordionitem"><p>Q1</p></div></div>';
  assert.deepEqual(parts(PAGE(withText)), ['Your benefits Benefits []', 'Frequently Asked Questions Intro [padded]', 'Q1 []']);
  assert.deepEqual(parts(PAGE(FAQ), 'https://www.austrian.com/at/en/x'), ['Your benefits Benefits []', 'Frequently Asked Questions [padded]', 'Q1 []']);
});

test('as before where the importer writes no padded (after a stage) and in a grey AEM section', () => {
  const stageSection = '<div class="section"><div class="mb-default"><div class="section-content container-fluid section-wide"><div class="inspirationteaser"><h2>Welcome</h2></div></div></div></div>';
  const afterStage = parts([stageSection, aem(FAQ)].join(''));
  assert.ok(afterStage.includes('Q1 []'), JSON.stringify(afterStage));
  const grey = (inner) => `<div class="section"><div class="mb-default container-gray"><div class="section-content container-fluid section-regular section-padding-y-regular">${inner}</div></div></div>`;
  const greyFaq = parts([aem('<div class="headline"><h2>Your benefits</h2></div><div class="text"><p>Benefits</p></div>'), grey(FAQ)].join(''));
  assert.ok(greyFaq.includes('Q1 []'), JSON.stringify(greyFaq));
});
