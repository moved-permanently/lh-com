/*
 * table-striped on brand tap (TAP Air Portugal): www.flytap.com's comparison tables outside the
 * fare pages (the Economy Prime pages: Prime and Top Prime; brief 406, R4-8) look as on its fare
 * pages: fare columns as cards from 1024 px, a table that scrolls sideways on phones, ✓ / ✕ icons,
 * the notes as (i)s, the legend and notes in a box under it. The import writes them as a
 * table-striped (header) with ✓ / ✕ values, then the legend's H2 and list and the notes' H2 and
 * text (tools/importer/tap-import.mjs, ComponentTableModel). Such a table becomes a fare-comparison
 * block of one table (blocks/fare-comparison/README.md), the legend and notes its Caption and Notes
 * rows (their headings its label rows), taken from the page. A matrix (the Club's wide tables) and
 * any other table stay table-striped.
 */
import { buildBlock, decorateBlock, loadBlock } from '../../scripts/aem.js';

const MARK = /^[✓✔✕✗✘×]$/;

const text = (node) => (node ? node.textContent.replace(/\s+/g, ' ').trim() : '');

/** The default content right after the block in its section (its next wrapper's children). */
function following(block) {
  const wrapper = block.parentElement;
  const next = wrapper && wrapper.nextElementSibling;
  return next && next.classList.contains('default-content-wrapper') ? [...next.children] : [];
}

/**
 * The fare-comparison rows of a TAP comparison table, or null: a table-striped (header), not
 * matrix, with ✓ / ✕ values, followed by a heading and a list (the legend), then maybe a heading
 * and text (the notes).
 * @param {Element} block the undecorated table-striped block
 * @returns {{rows: string[][], taken: Element[]}|null} rows as cells' HTML; taken: the page's
 *   elements the rows came from
 */
export function comparisonRows(block) {
  if (!block.classList.contains('header') || block.classList.contains('matrix')) return null;
  const rows = [...block.children].map((row) => [...row.children]);
  if (rows.length < 2 || rows[0].length < 2) return null;
  if (!rows.slice(1).some((cells) => cells.slice(1).some((c) => MARK.test(text(c).split(' ')[0])))) return null;
  const after = following(block);
  const [legendTitle, legend] = after;
  if (!legendTitle || !/^H[2-6]$/.test(legendTitle.tagName) || !legend || legend.tagName !== 'UL') return null;
  const taken = [legendTitle, legend];
  const out = [['Caption label', text(legendTitle)]];
  const notesTitle = after[2];
  const notes = [];
  if (notesTitle && /^H[2-6]$/.test(notesTitle.tagName)) {
    after.slice(3).every((node) => {
      if (/^H[1-6]$/.test(node.tagName) || node.tagName === 'DIV') return false;
      notes.push(node);
      return true;
    });
  }
  if (notes.length) {
    out.push(['Notes label', text(notesTitle)]);
    taken.push(notesTitle, ...notes);
  }
  rows.forEach((cells) => out.push(cells.map((c) => c.innerHTML.trim())));
  out.push(['Caption', legend.outerHTML]);
  if (notes.length) out.push(['Notes', notes.map((n) => n.outerHTML).join('')]);
  return { rows: out, taken };
}

/**
 * The table as a fare-comparison block in its place (its wrapper and section named for it), the
 * legend and notes taken from the page, the block loaded.
 * @param {Element} block
 * @param {{load?: (block: Element) => Promise<unknown>}} [opts] the loader (tests)
 * @returns {Promise<Element|null>} the new block, or null when the table is none
 */
export async function toComparison(block, { load = loadBlock } = {}) {
  const found = comparisonRows(block);
  if (!found) return null;
  const fc = buildBlock('fare-comparison', found.rows.map((cells) => cells.map((html) => {
    const cell = document.createElement('div');
    cell.innerHTML = html;
    return { elems: [...cell.childNodes] };
  })));
  const nextWrapper = block.parentElement.nextElementSibling;
  found.taken.forEach((node) => node.remove());
  if (nextWrapper && nextWrapper.classList.contains('default-content-wrapper') && !nextWrapper.children.length) nextWrapper.remove();
  const wrapper = block.parentElement;
  const section = wrapper.closest('.section');
  wrapper.classList.remove('table-striped-wrapper');
  block.replaceWith(fc);
  if (section && !section.querySelector('.table-striped')) section.classList.remove('table-striped-container');
  // its wrapper and section named for it (fare-comparison-wrapper, -container)
  decorateBlock(fc);
  await load(fc);
  return fc;
}

let columnSets = 0;
// a cell's note at its end: a line break, then italic text (table-striped.js noteAsInfo)
const NOTE = /<br>\s*<(em|i)>[\s\S]*<\/\1>\s*(<\/p>)?$/;

const div = (className, ...children) => {
  const d = document.createElement('div');
  if (className) d.className = className;
  d.append(...children);
  return d;
};

/** A cell's content: its nodes (or a copy), a single paragraph unwrapped. */
function content(cell, copy) {
  if (!cell) return [];
  const nodes = [...cell.childNodes].filter((n) => n.nodeType !== 3 || n.textContent.trim());
  const inner = nodes.length === 1 && nodes[0].tagName === 'P' ? [...nodes[0].childNodes] : [...cell.childNodes];
  return copy ? inner.map((n) => n.cloneNode(true)) : inner;
}

/**
 * www.flytap.com's rich-text tables (TAP row 146: every recorded one, tap-parity-007 and -009):
 * from 1024 px one card per column side by side (the first column's the row labels, white, also
 * when its first cell holds text: lounges, wheelchair; the others grey with a dark top line, the
 * column's head over its values; the rows as high across the cards: a subgrid), below 1024 px one
 * closed accordion per value column (its head the column's; inside, each row's label over its
 * value). Both views are built, the
 * stylesheet shows one (table-striped.css, .table-striped.columns). A comparison table (✓ / ✕),
 * a table with notes, one row or one column: none (false).
 * @param {Element} block the undecorated table-striped block
 * @returns {boolean} whether the table became the two views
 */
export function toColumns(block) {
  const rows = [...block.children].map((row) => [...row.children])
    .filter((cells) => cells.some((c) => text(c) || c.querySelector('img')));
  const n = Math.max(0, ...rows.map((cells) => cells.length));
  if (rows.length < 2 || n < 2) return false;
  if (rows.some((cells) => cells.some((c) => MARK.test(text(c))))) return false;
  // a cell with a note (italic after a line break: table-striped.js's (i)s) keeps the table
  if (rows.some((cells) => cells.some((c) => NOTE.test(c.innerHTML.trim())))) return false;
  columnSets += 1;
  const id = `table-striped-columns-${columnSets}`;
  // the accordions first (copies), then the cards take the cells' own nodes
  const items = [];
  for (let i = 1; i < n; i += 1) {
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'table-striped-acc-toggle';
    toggle.setAttribute('aria-expanded', 'false');
    toggle.append(...content(rows[0][i], true));
    const panel = div('table-striped-acc-panel', ...rows.slice(1).map((cells) => div(
      'table-striped-acc-row',
      div('table-striped-acc-label', ...content(cells[0], true)),
      div('table-striped-acc-value', ...content(cells[i], true)),
    )));
    panel.id = `${id}-${i}`;
    panel.hidden = true;
    toggle.setAttribute('aria-controls', panel.id);
    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') !== 'true';
      toggle.setAttribute('aria-expanded', String(open));
      panel.hidden = !open;
    });
    items.push(div('table-striped-acc', toggle, panel));
  }
  const cards = [];
  for (let i = 0; i < n; i += 1) {
    const card = div(`table-striped-card${i === 0 ? ' table-striped-card-labels' : ''}`, ...rows.map((cells, r) => div(
      r === 0 ? 'table-striped-cell table-striped-cell-head' : 'table-striped-cell',
      ...content(cells[i], false),
    )));
    cards.push(card);
  }
  const grid = div('table-striped-cards', ...cards);
  grid.style.setProperty('--table-striped-cols', String(n));
  grid.style.setProperty('--table-striped-rows', String(rows.length));
  block.classList.add('columns');
  block.replaceChildren(grid, div('table-striped-accordions', ...items));
  return true;
}
