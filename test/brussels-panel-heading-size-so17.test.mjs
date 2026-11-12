/* eslint-disable max-len */
/* Standing order 17, item 4 (Brussels P50's second blocker): www's headings in an accordion panel carry their size
   class (/be/en/legal-notices/terms-and-conditions-conditions-of-carriage: 70 h3.headline.heading-small in its
   panels, 28 / 30.8 px, 22 px below). The accordion parser wrote them as bare h3s, which the Brussels theme draws
   18 / 19.8 px with 20 px below: each 25 px short, 1,750 px on the page at 1440 once its text has www's 938 px column.
   On Brussels pages the parser keeps the size class on a panel heading, so the cleanup's heading markers
   (markHeadingStyles) write "{heading-small}"; the theme sizes such a heading as www's. Other brands' panels as
   before (lufthansa.com's own parity is not this order's).
   A linkedom page and a createBlock stand-in, no network.
   Run: node --max-old-space-size=256 --test test/brussels-panel-heading-size-so17.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
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

const PANEL = '<div class="headline"><h3 class="headline heading-small "> General</h3></div><div class="text"><div class="richtext "><p>2.1. These Conditions are the Conditions of Carriage.</p></div></div>'
  + '<div class="headline"><h3 class="headline "> Charters</h3></div><div class="text"><div class="richtext "><p>2.2. If carriage is performed pursuant to a charter agreement.</p></div></div>';
const PAGE = `<!DOCTYPE html><html><body><main><div class="section-content"><div class="accordion commonevent section"><maui-collapsible theme="sn"><div class="accordionitem commonevent"><maui-collapsible-item headline="Article 2: Scope of application" expanded="" theme="sn"><div>${PANEL}</div></maui-collapsible-item></div></maui-collapsible></div></div></main></body></html>`;

const headingsOf = (origin) => {
  const { document } = parseHTML(PAGE);
  const url = `${origin}/be/en/legal-notices/terms-and-conditions-conditions-of-carriage`;
  parse(document.querySelector('.accordion'), { document, url, params: { originalURL: url } });
  return [...document.querySelectorAll('table[data-name] h3')].map((h) => `${h.textContent.trim()}|${h.className}`);
};

test('Brussels: a panel heading keeps www\'s size class (the cleanup writes it as a marker)', () => {
  assert.deepEqual(headingsOf('https://www.brusselsairlines.com'), ['General|heading-small', 'Charters|']);
});

test('lufthansa.com: panel headings as before, without a class', () => {
  assert.deepEqual(headingsOf('https://www.lufthansa.com'), ['General|', 'Charters|']);
});

test('the Brussels theme: a panel heading-small by the heading-small tokens (www: 28 / 30.8 px, 22 below at 1440; 22 / 24.2, 18 below at 390)', () => {
  const css = fs.readFileSync(new URL('../styles/themes/brussels.css', import.meta.url), 'utf8').replace(/\s+/g, ' ');
  assert.match(css, /body\.brand-brussels main \.accordion-columns \.accordion-columns-panel :is\(h2, h3, h4\)\.heading-small \{ margin-bottom: var\(--heading-margin-l\); font-size: var\(--heading-font-size-l\); line-height: var\(--heading-line-height\); \}/);
});

// the Brussels templates with an accordion parser (brussels-import.mjs templateOf; app-entry has none)
test('the import bundles carry it (the Brussels import runs import-<template>.bundle.js)', () => {
  ['info', 'hub', 'insights', 'flight-status', 'homepage'].forEach((t) => {
    const code = fs.readFileSync(new URL(`../tools/importer/import-${t}.bundle.js`, import.meta.url), 'utf8');
    assert.ok(code.includes('KEEP_HEADING_SIZE && HEADING_SIZES'), t);
  });
});
