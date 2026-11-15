/* eslint-disable max-len */
/* Standing order 28 (2026-11-15), item 3: /de/en/during-your-trip/lhg-wifi. www has the stage, a padded AEM section
   without .mb-default (the intro with its button) and another padded one ("Your benefits at a glance"): between the button
   and that heading only their paddings, 58px at 390. Ours kept the section gap there as well (102px). On lufthansa.com's
   info pages the section after the stage gets flush when the padded AEM section in it has no .mb-default and the next
   AEM section is padded too (neither grey nor a stage). Drafts of lhg-wifi so (against lh-parity-002a): 13.5 / 10.3 ->
   12.2 / 10.0 % at 390 / 1440; economy-class, first-class-terminal and internet-overview with it the same. Input: www's
   lhg-wifi (bd-snapshot), its title block and first three AEM sections' first components (test/fixtures).
   Run: node --max-old-space-size=256 --test test/info-stage-padded-flush-so28.test.mjs */
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

const fixture = fs.readFileSync(new URL('./fixtures/lufthansa-sections/lhg-wifi-stage-padded.html', import.meta.url), 'utf8');
const URL_WIFI = 'https://www.lufthansa.com/de/en/during-your-trip/lhg-wifi';
const run = (name, html, url = URL_WIFI) => {
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
    return { text: [...doc.querySelectorAll('h1, h2')].map((e) => e.textContent.trim().slice(0, 30)).join(' | '), style: style.split(/,\s*/).filter(Boolean).sort() };
  }).filter((x) => x.text || x.style.length);
};

test('lhg-wifi: the section after the stage flush, the next padded one padded', () => {
  const s = run('info', fixture);
  const st = s.findIndex((x) => x.style.includes('stage'));
  assert.ok(st >= 0, JSON.stringify(s));
  assert.deepEqual(s[st + 1].style, ['flush'], JSON.stringify(s));
  assert.ok(s[st + 2].style.includes('padded'), JSON.stringify(s));
});

test('as before: with .mb-default on the intro section, an unpadded section after it, a brand site', () => {
  const after = (s) => s[s.findIndex((x) => x.style.includes('stage')) + 1].style;
  const intro = fixture.indexOf('section-padding-y-regular');
  const open = fixture.lastIndexOf('<div class="section"><div', intro);
  const withMb = `${fixture.slice(0, open)}${fixture.slice(open).replace(/^<div class="section"><div(?: class="[^"]*")?>/, '<div class="section"><div class="mb-default">')}`;
  assert.notEqual(withMb, fixture);
  assert.deepEqual(after(run('info', withMb)), [], 'with .mb-default');
  const last = fixture.lastIndexOf('section-padding-y-regular');
  const unpadded = `${fixture.slice(0, last)}${fixture.slice(last + 'section-padding-y-regular'.length)}`;
  assert.deepEqual(after(run('info', unpadded)), [], 'the next one unpadded');
  assert.deepEqual(after(run('info', fixture, 'https://www.austrian.com/at/en/x')), [], 'a brand site');
});
