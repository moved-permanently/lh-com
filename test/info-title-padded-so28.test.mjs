/* eslint-disable max-len */
/* Standing order 28 (2026-11-15), item 2: free2move and digital-travel-companion. www has the page title outside the AEM
   sections (.contentpage's own h1) and a padded first AEM section that opens with the picture: 40px of padding between the
   title and the picture at 1440 (20 at 390), ours none (the title and the section's content shared one section). On
   lufthansa.com's info pages that first AEM section now starts a section of its own with style padded. Drafts of
   /de/en/free2move so (against lh-parity-002a): 17.7 / 13.0 -> 4.8 / 8.4 % at 1440 / 390. Input: www's /de/en/free2move
   (bd-snapshot), its title block and the first AEM section's first components (test/fixtures/lufthansa-sections).
   Run: node --max-old-space-size=256 --test test/info-title-padded-so28.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

import fs from 'node:fs';

const { default: sectionsTransform } = await import('../tools/importer/transformers/lufthansa-sections.js');
const { default: cleanupTransform } = await import('../tools/importer/transformers/lufthansa-cleanup.js');

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

const fixture = fs.readFileSync(new URL('./fixtures/lufthansa-sections/free2move-title-section.html', import.meta.url), 'utf8');
const URL_F2M = 'https://www.lufthansa.com/de/en/free2move';
const run = (name, html, url = URL_F2M) => {
  const { document } = parseHTML(`<html><head><title>T</title></head><body><main>${html}</main></body></html>`);
  document.createRange = () => rangeFor(document);
  const order = () => {
    const at = new Map();
    let c = 0;
    const walk = (n) => { at.set(n, c += 1); [...n.childNodes].forEach(walk); };
    walk(document.documentElement);
    return at;
  };
  Object.getPrototypeOf(Object.getPrototypeOf(document.body)).compareDocumentPosition = function position(other) {
    const at = order();
    return at.get(other) > at.get(this) ? 4 : 2;
  };
  const template = { name, blocks: [], sections: [] };
  const payload = {
    document, template, url, params: { originalURL: url },
  };
  ['onLoad', 'beforeTransform', 'afterTransform'].forEach((hook) => {
    cleanupTransform(hook, document.body, payload);
    sectionsTransform(hook, document.body, payload);
  });
  return document.body.innerHTML.split(/<hr[^>]*>/).map((part) => {
    const doc = parseHTML(`<html><body>${part}</body></html>`).document;
    const style = [...doc.querySelectorAll('table tr')].slice(1).map((tr) => tr.children[1].textContent).join('');
    doc.querySelectorAll('table').forEach((t) => t.remove());
    return { h1: !!doc.querySelector('h1'), img: !!doc.querySelector('img'), style: style.split(/,\s*/).filter(Boolean).sort() };
  }).filter((x) => x.h1 || x.img || x.style.length);
};

test('free2move: the title alone, the padded AEM section from its picture on a section of its own with style padded', () => {
  const s = run('info', fixture);
  const t = s.findIndex((x) => x.h1);
  assert.ok(t >= 0, JSON.stringify(s));
  assert.ok(!s[t].img, `the title's section holds no picture: ${JSON.stringify(s)}`);
  assert.deepEqual(s[t + 1].style, ['padded'], JSON.stringify(s));
  assert.ok(s[t + 1].img, JSON.stringify(s));
});

test('as before: an unpadded first AEM section, a brand site, another template', () => {
  const together = (s) => s.some((x) => x.h1 && x.img);
  assert.ok(together(run('info', fixture.replace('section-padding-y-regular', ''))), 'unpadded');
  assert.ok(together(run('info', fixture, 'https://www.austrian.com/at/en/free2move')), 'a brand site');
  assert.ok(together(run('campaign', fixture)), 'another template');
});
