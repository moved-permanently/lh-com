/* eslint-disable max-len, import/no-extraneous-dependencies -- dev tooling; linkedom is a dev dependency */
/* The brief after 596, item 2: Austrian numbered steps. The columns-media parser writes option steps for a row whose
   every column opens with an h2 of a one- or two-digit number (www's online-check-in "How to get your boarding pass",
   austrian-parity-017), on Austrian pages only; the theme sizes the numbers as www's and draws a list of secondary links as
   www's row of secondary buttons. Run: node --max-old-space-size=256 --test test/austrian-numbered-steps-596.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';

globalThis.WebImporter = {
  Blocks: {
    createBlock: (document, { name, variants = [], cells }) => {
      const table = document.createElement('table');
      const tr = document.createElement('tr');
      const th = document.createElement('th');
      th.textContent = variants.length ? `${name} (${variants.join(', ')})` : name;
      tr.append(th);
      table.append(tr);
      cells.forEach((row) => {
        const r = document.createElement('tr');
        row.forEach((c) => { const td = document.createElement('td'); (Array.isArray(c) ? c : [c]).forEach((n) => n && td.append(typeof n === 'string' ? document.createTextNode(n) : n)); r.append(td); });
        table.append(r);
      });
      return table;
    },
  },
};
const { default: parse } = await import('../tools/importer/parsers/columns-media.js');
const item = (h2, h3) => `<div class="col-md-6 col-lg column-view-item"><div class="headline section"><h2 class="headline heading-large"> ${h2}</h2></div><div class="headline section"><h3 class="headline heading-copytext-large">${h3}</h3></div><div class="text section"><div class="richtext"><p>Text of ${h3}.</p></div></div></div>`;
const row = (items) => `<div class="section-content"><div class="fourcolumn column event section"><div class="column-view flex-column" data-identifier="fourcolumn"><div class="row">${items}</div></div></div></div>`;
const header = (html, url) => {
  const { document } = parseHTML(`<html><body>${html}</body></html>`);
  parse(document.querySelector('.fourcolumn'), { document, url, params: { originalURL: url } });
  return (document.querySelector('table th') || {}).textContent || '';
};
const STEPS = row([item('1', 'Find your booking'), item('2', 'Sign in with Travel ID'), item('3', 'Complete your travel details'), item('4', 'Personalize your flight')].join(''));

test('an Austrian row of numbered steps: option steps', () => {
  assert.match(header(STEPS, 'https://www.austrian.com/at/en/online-check-in'), /\(.*steps.*\)$/);
});

test('not on another brand, not when a column has no number', () => {
  assert.ok(!header(STEPS, 'https://www.lufthansa.com/de/en/online-check-in').includes('steps'));
  const mixed = row([item('1', 'A'), item('Two', 'B')].join(''));
  assert.ok(!header(mixed, 'https://www.austrian.com/at/en/x').includes('steps'));
});

test('the theme: the numbers 36 / 48 px, a list of secondary links as buttons (no nested :has)', () => {
  const css = fs.readFileSync(new URL('../styles/themes/austrian.css', import.meta.url), 'utf8').replace(/\s+/g, ' ');
  assert.ok(css.includes('body.brand-austrian main .columns-media.steps > div > div > h2:first-child { font-size: 36px; line-height: 39.6px; margin-bottom: 36px; }'));
  assert.ok(css.includes('@media (width >= 1025px) { body.brand-austrian main .columns-media.steps > div > div > h2:first-child { font-size: 48px; line-height: 52.8px; margin-bottom: 60px; }'));
  assert.ok(css.includes('ul:has(> li > em:only-child > a:only-child):not(:has(> li > :not(em), > li > em > :not(a))) { display: flex; flex-wrap: wrap; gap: 12px;'));
  assert.ok(!/:has\([^)]*:has\(/.test(css.slice(css.indexOf('numbered steps'))));
});
