/* eslint-disable max-len */
/* Brief 488 item 2: the campaign pages brief 484's section rule made worse against lh-parity-002.
   - crane at 1440 (9.0 -> 11.8 %): a separator opening an AEM section ("New beginnings and new
     designs") or between two of its components was dropped (the cleanup keeps 50 px and more); www
     draws maui-divider's 1 px box and the .hr's margin (2.5rem unless inline). Every empty separator
     among a campaign section's components is a spacer now ("{spacer-25}"; .hidden-sm-down ones
     "{spacer-N from-768}"), drawn as live's: 1 px, then its margin, which collapses with the next
     component's or wrapper's (crane: text, separator, carousel 50 px).
   - new-onboard-experience: its first AEM section is the intro text, unpadded, with no gap on www
     before the next one; ours had the 48 px section gap. An unpadded first AEM section followed by
     others is a campaign-section too.
   - chronicle at 390 (14.8 -> 21.1 %): the jump links' column view stacks its empty second column
     under the links on www, 89 px from the last link to the next section (ours 43).
   WebImporter's createBlock and linkedom's Range are stand-ins (as importer-tab-sections).
   Run: node --max-old-space-size=256 --test test/campaign-sections-488.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';

const { default: sectionsTransform } = await import('../tools/importer/transformers/lufthansa-sections.js');
const { default: campaignTransform } = await import('../tools/importer/transformers/campaign-sections.js');

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

const aem = (inner, { mb = true, pad = true } = {}) => `<div class="section"><div class="${mb ? 'mb-default' : ''}"><div class="section-content container-fluid section-regular ${pad ? 'section-padding-y-regular' : ''}">${inner}</div></div></div>`;
const sep = (cls = 'hr hr-no-layout', style = '') => `<div class="separator section"><div aria-hidden="true" ${style ? `style="${style}" ` : ''}class="${cls}"><maui-divider></maui-divider></div></div>`;
const text = (t) => `<div class="text section"><div class="richtext"><p>${t}</p></div></div>`;
const headline = (t) => `<div class="headline section"><h2>${t}</h2></div>`;

const run = (html) => {
  const { document } = parseHTML(`<html><body><main><div class="container-content">${html}</div></main></body></html>`);
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
  const template = { name: 'campaign', blocks: [], sections: [] };
  ['onLoad', 'beforeTransform', 'afterTransform'].forEach((hook) => [sectionsTransform, campaignTransform].forEach((t) => t(hook, main, { document, template })));
  return main.innerHTML.split('<hr>').map((h) => {
    const doc = parseHTML(`<html><body>${h}</body></html>`).document;
    const style = [...doc.querySelectorAll('table tr')].slice(1).map((tr) => tr.children[1].textContent).join('');
    doc.querySelectorAll('table').forEach((t) => t.remove());
    return { text: [...doc.querySelectorAll('h1, h2, p')].map((e) => e.textContent.trim()).filter(Boolean).join(' '), style: style.split(/,\s*/).filter(Boolean).sort() };
  }).filter((x, i, all) => i < all.length - 1 || x.text || x.style.length);
};

test('every empty separator among a campaign section\'s components is a spacer: at its start, between components, from 768 px only', () => {
  const s = run(aem(text('Intro'), { pad: false })
    + aem(`${sep()}${headline('New beginnings')}${text('Text')}${sep('hr hr-no-layout hidden-sm-down', 'margin-bottom: 50px;')}${text('More')}`, { mb: false, pad: false }));
  assert.deepEqual(s.map((x) => x.text), ['Intro', '{spacer-25} New beginnings Text {spacer-50 from-768} More']);
});

test('a separator with a line is the cleanup\'s (a divider), not a spacer here', () => {
  const s = run(aem(text('Intro'), { pad: false }) + aem(`${text('A')}${sep('hr ')}${text('B')}`, { pad: false }));
  assert.ok(!s.some((x) => /\{spacer-25\}/.test(x.text)), JSON.stringify(s));
});

test('an unpadded first AEM section followed by others is a campaign-section; alone or padded it is not', () => {
  const s = run(aem(text('Creating a new travel experience'), { mb: false, pad: false }) + aem(text('Next')));
  assert.deepEqual(s[0].style, ['campaign-section', 'flush']);
  assert.deepEqual(s[1].style, ['campaign-section', 'padded', 'spaced']);
  assert.deepEqual(run(aem(text('Alone'), { pad: false }))[0].style, []);
  assert.deepEqual(run(aem(text('Padded first')) + aem(text('Next')))[0].style, []);
});

test('styles.css: spacers as live\'s separators; a spacer wrapper opening a section; the jump links\' stacked column below 768 px', () => {
  const css = fs.readFileSync('styles/styles.css', 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
  const S = 'body.brand-lufthansa main > .section.campaign-section';
  assert.ok(css.includes(`${S} .default-content-wrapper > p.spacer:not(.divider) { height: 1px; margin-bottom: var(--spacer-size, 25px); }`));
  assert.ok(css.includes(`${S} > .default-content-wrapper:first-child:not(:has(> :not(p.spacer))) { margin-top: 0; }`));
  assert.ok(css.includes(`@media (width < 768px) { ${S} > .jump-links-wrapper:last-child > .jump-links.columns { padding-bottom: 46px; } }`));
});
