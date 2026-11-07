/* eslint-disable max-len, import/no-extraneous-dependencies -- dev tooling; linkedom is a dev dependency */
/* www's four-column views of icon teasers (brief 445 item 2): Austrian's /at/en/accessible-travel and digital-services
   (a.teaser.partner: the icon beside the title, four a row from 1025 px) and /<market>/<lang>/legal (a.teaser.usp: the
   icon centred over the label, four a row) came in as linked headings with small icons, stacked. Now:
   - cards-icon-text: a .fourcolumn of partner teasers gets the options partner four-up; the block lays partner tiles
     four a row from 1025 px with four-up (two from 768 px, one below, as partner);
   - the info template maps them (its partner selector takes .fourcolumn too; lh-com's cards-icon usp four-up, the
     hub's service tiles, for a .fourcolumn of usp teasers), so the Austrian info-based templates do.
   Brand-neutral. Run: node --max-old-space-size=256 --test test/icon-teasers-four-up.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';

let made;
globalThis.WebImporter = {
  Blocks: {
    createBlock: (document, { name, variants = [], cells }) => {
      made = { name, variants, rows: cells.length };
      const t = document.createElement('table');
      t.innerHTML = `<tr><th>${name}</th></tr>`;
      return t;
    },
  },
};
const { default: parse } = await import('../tools/importer/parsers/cards-icon-text.js');

const partner = (t) => `<div class="col-md-6 col-lg column-view-item"><div class="teaser event section"><a href="/at/en/x" class="teaser partner"><h2 class="heading-copytext-large teaser-heading"><img class="icon icon-svg" src="/content/dam/austrian/global/icons/os-phone_32px.svg" alt="Telephone icon"><div class="teaser-heading-text">${t}</div></h2></a></div></div>`;
const view = (cls, n) => `<div class="${cls} column event section"><div class="column-view flex-column"><div class="row">${Array.from({ length: n }, (_, i) => partner(`Tile ${i + 1}`)).join('')}</div></div></div>`;
const run = (cls, n) => {
  const { document } = parseHTML(`<html><body><div class="section-content">${view(cls, n)}</div></body></html>`);
  parse(document.querySelector(`.${cls}`), { document });
  return made;
};

test('the parser: a four-column view of partner teasers is partner four-up; a three-column one partner as before', () => {
  assert.deepEqual(run('fourcolumn', 8), { name: 'cards-icon-text', variants: ['partner', 'four-up'], rows: 8 });
  assert.deepEqual(run('threecolumn', 3), { name: 'cards-icon-text', variants: ['partner'], rows: 3 });
});

test('the block: partner four-up four a row from 1025 px', () => {
  const css = fs.readFileSync(new URL('../blocks/cards-icon-text/cards-icon-text.css', import.meta.url), 'utf8').replace(/\s+/g, ' ');
  assert.match(css, /@media \(width >= 1025px\) \{ \.cards-icon-text\.partner\.four-up > ul \{ grid-template-columns: repeat\(4, minmax\(0, 1fr\)\); \} \}/);
  const readme = fs.readFileSync(new URL('../blocks/cards-icon-text/README.md', import.meta.url), 'utf8');
  assert.match(readme, /\| `four-up` \|/);
});

test('the info template maps four-column icon teasers: partner to cards-icon-text, usp to cards-icon', () => {
  const { templates } = JSON.parse(fs.readFileSync(new URL('../tools/importer/page-templates.json', import.meta.url), 'utf8'));
  const info = templates.find((t) => t.name === 'info');
  const of = (name) => info.blocks.find((b) => b.name === name)?.instances || [];
  assert.ok(of('cards-icon-text').includes(':is(.threecolumn, .fourcolumn):has(> .column-view > .row > .column-view-item > .teaser > a.teaser.partner)'));
  assert.ok(of('cards-icon').includes('.fourcolumn:has(> .column-view > .row > .column-view-item > .teaser > a.teaser.usp)'));
});
