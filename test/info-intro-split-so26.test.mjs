/* eslint-disable max-len */
/* Standing order 26 (2026-11-14), item 2: the business-class pages' intro section. www has the intro (headline, text,
   separator, picture carousel) in a padded AEM section; the next AEM section is unpadded, opens with the two-column view
   "Détente absolue sur les vols de courte distance" and holds the grey band of column views after it. lufthansa-sections
   kept the view in the intro's section: order 18's split skips an AEM section that holds a break already (the grey
   band's) and wants a padded section after it that is not grey. Such an unpadded AEM section (with .mb-default, right
   after a padded one that is neither grey nor a stage) whose first break is a grey band's after its first component now
   starts a section of its own there, without a style, as delta-so25-business-class-intro-split-lh-com.txt made the
   sixteen published copies (drafts against lh-snapshots-117: xx/el 25.5 / 27.4 -> 13.2 / 17.5 % at 1440 / 390).
   Input: the first four AEM sections of www's /fr/fr/prepare-for-your-trip/travel-classes/business-class
   (lh-snapshots-118, 1440; test/fixtures/lufthansa-sections), through the cleanup and the sections transformer.
   Run: node --max-old-space-size=256 --test test/info-intro-split-so26.test.mjs */
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

const fixture = fs.readFileSync(new URL('./fixtures/lufthansa-sections/business-class-fr-118-intro.html', import.meta.url), 'utf8');
const URL_FR = 'https://www.lufthansa.com/fr/fr/prepare-for-your-trip/travel-classes/business-class';
const run = (name, html, url = URL_FR) => {
  const { document } = parseHTML(`<html><head><title>T</title></head><body><main><div class="contentpage pt-0">${html}</div></main></body></html>`);
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
    return { text: [...doc.querySelectorAll('h1, h2, h3')].map((e) => e.textContent.trim()).filter(Boolean).join(' | '), style: style.split(/,\s*/).filter(Boolean).sort() };
  }).filter((x) => x.text || x.style.length);
};

test('fr/fr\'s intro: the two-column view after the carousel starts a section of its own, no style; the grey band as before', () => {
  const s = run('info', fixture);
  const at = s.findIndex((x) => x.text.startsWith('Détente absolue'));
  assert.ok(at > 0, JSON.stringify(s));
  assert.ok(s[at - 1].text.startsWith('Voyagez comme vous le souhaitez'), JSON.stringify(s));
  assert.deepEqual(s[at].style, [], JSON.stringify(s[at]));
  assert.ok(s[at + 1].style.includes('grey'), JSON.stringify(s[at + 1]));
});

test('as before: without .mb-default on that AEM section, on a brand site', () => {
  const together = (s) => s.some((x) => x.text.startsWith('Voyagez') && x.text.includes('Détente absolue'));
  const at = fixture.indexOf('Détente absolue');
  const open = fixture.lastIndexOf('<div class="section"><div class="', at);
  const noMb = `${fixture.slice(0, open)}${fixture.slice(open).replace(/^<div class="section"><div class="[^"]*">/, '<div class="section"><div class="">')}`;
  assert.notEqual(noMb, fixture, 'the fixture changed');
  assert.ok(together(run('info', noMb)), 'no .mb-default');
  assert.ok(together(run('info', fixture, 'https://www.austrian.com/at/en/x')), 'a brand site');
});
