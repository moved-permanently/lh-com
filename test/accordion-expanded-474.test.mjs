/* eslint-disable max-len */
/* www's accordion items expanded at load (maui-collapsible-item expanded): the brief after 473, item 1.
   /de/en/gefaehrliche-gegenstaende opens its last item ("Other dangerous and prohibited goods", 27th
   of 27) on www, /de/en/group-travel and /gb/en/companion-special-business-class their first. The
   lufthansa.com import parser (tools/importer/parsers/accordion-columns.js) did not read the
   attribute, so ours showed every item closed (the dangerous goods page 731 px shorter at 1440, 1,484
   at 390).
   - the parser: expanded items that are the first N give the existing options open-first / open-N;
     any other expanded item gives open-item-K (its place among the block's items);
   - the block: open-item-K opens the K-th item (several allowed); not with tabs; with exclusive only
     the first of them. Brand-neutral; a block without these options is unchanged.
   A linkedom page and a createBlock stand-in, no network.
   Run: node --max-old-space-size=256 --test test/accordion-expanded-474.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';
import parse from '../tools/importer/parsers/accordion-columns.js';

globalThis.WebImporter = {
  Blocks: {
    createBlock(doc, { name, cells }) {
      const t = doc.createElement('table');
      t.setAttribute('data-name', name);
      cells.forEach((row) => {
        const tr = doc.createElement('tr');
        row.forEach((c) => {
          const td = doc.createElement('td');
          if (Array.isArray(c)) c.forEach((n) => td.append(n)); else if (c) td.append(c);
          tr.append(td);
        });
        t.append(tr);
      });
      return t;
    },
  },
};

const item = (title, open) => `<div class="accordionitem commonevent"><maui-collapsible-item headline="${title}"${open ? ' expanded=""' : ''} theme="lh"><div><div class="text"><div class="richtext"><p>${title} text.</p></div></div></div></maui-collapsible-item></div>`;
const accordion = (flags) => `<div class="accordion commonevent section"><maui-collapsible class="accordion-maui" theme="lh">${flags.map((f, i) => item(`Item ${i + 1}`, f)).join('')}</maui-collapsible></div>`;
const nameOf = (flags) => {
  const { document } = parseHTML(`<!DOCTYPE html><html><body><main><div class="section-content">${accordion(flags)}</div></main></body></html>`);
  parse(document.querySelector('.accordion'), { document });
  return document.querySelector('table[data-name]').getAttribute('data-name');
};

test('the parser: the last of 27 items expanded (www\'s dangerous goods) gives open-item-27', () => {
  const flags = Array.from({ length: 27 }, (_, i) => i === 26);
  assert.ok(nameOf(flags) === 'accordion-columns (faq, open-item-27)', nameOf(flags));
});

test('the parser: the first items expanded give open-first and open-N as before; none, no option', () => {
  assert.ok(nameOf([true, false, false]) === 'accordion-columns (faq, open-first)', nameOf([true, false, false]));
  assert.ok(nameOf([true, true, false]) === 'accordion-columns (faq, open-2)', nameOf([true, true, false]));
  assert.ok(nameOf([false, false, false]) === 'accordion-columns (faq)', nameOf([false, false, false]));
  assert.ok(nameOf([false, true, false, true]) === 'accordion-columns (faq, open-item-2, open-item-4)', nameOf([false, true, false, true]));
});

const { window, document } = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
window.location = {
  hostname: 'lufthansa.turnsthe.page', pathname: '/de/en/gefaehrliche-gegenstaende', search: '', href: 'https://lufthansa.turnsthe.page/de/en/gefaehrliche-gegenstaende', origin: 'https://lufthansa.turnsthe.page',
};
Object.defineProperty(window, 'origin', { value: 'https://lufthansa.turnsthe.page', configurable: true });
globalThis.window = window;
globalThis.document = document;
const { openFirst } = await import('../blocks/accordion-columns/accordion-columns.js');

const blockOf = (classes, n) => {
  const block = document.createElement('div');
  block.className = `accordion-columns ${classes}`;
  const items = Array.from({ length: n }, (_, i) => {
    const d = document.createElement('details');
    d.innerHTML = `<summary>Item ${i + 1}</summary><div><p>Panel ${i + 1}</p></div>`;
    block.append(d);
    return d;
  });
  return { block, items };
};
const opened = (items) => items.map((d) => (d.hasAttribute('open') ? 'open' : '-')).join(' ');

test('the block: open-item-K opens the K-th item, several allowed', () => {
  const one = blockOf('faq open-item-3', 3);
  assert.ok(openFirst(one.block, one.items) === true);
  assert.ok(opened(one.items) === '- - open', opened(one.items));
  const two = blockOf('faq open-item-2 open-item-4', 4);
  openFirst(two.block, two.items);
  assert.ok(opened(two.items) === '- open - open', opened(two.items));
});

test('the block: open-item-K not with tabs; with exclusive only the first; past the end nothing; other options as before', () => {
  const tabs = blockOf('faq tabs open-item-2', 2);
  assert.ok(openFirst(tabs.block, tabs.items) === false);
  assert.ok(opened(tabs.items) === '- -');
  const ex = blockOf('faq exclusive open-item-1 open-item-3', 3);
  openFirst(ex.block, ex.items);
  assert.ok(opened(ex.items) === 'open - -', opened(ex.items));
  const past = blockOf('faq open-item-9', 3);
  openFirst(past.block, past.items);
  assert.ok(opened(past.items) === '- - -');
  const first = blockOf('faq open-first', 3);
  openFirst(first.block, first.items);
  assert.ok(opened(first.items) === 'open - -');
});
