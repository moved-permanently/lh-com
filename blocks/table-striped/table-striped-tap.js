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
