/* eslint-disable */
/* global WebImporter */

/**
 * Parser for table-striped (Lufthansa AEM "div.table" with a <maui-table> in light DOM; fleet
 * technical data). Also accepts a plain <table> inside the component.
 *
 * Output (blocks/table-striped README): one row per table row, no header row (every row is
 * data). Header rows (maui-table-head / thead) are kept as the first data rows. Rows are padded
 * with empty cells to the widest row. A non-empty <maui-table-caption> / <caption> is emitted as
 * a paragraph before the block (default content).
 */
export default function parse(element, { document }) {
  const SKIP = '.sr-only, .visually-hidden, maui-screen-reader-label, [slot="box"], script, style';
  const clean = (s) => (s || '').replace(/[\u200B-\u200D\uFEFF]/g, '').replace(/ /g, ' ').replace(/\s+/g, ' ').trim();

  const cellContent = (cell) => {
    const c = cell.cloneNode(true);
    c.querySelectorAll(SKIP).forEach((n) => n.remove());
    const nodes = [...c.childNodes].filter((n) => n.nodeType !== 8);
    if (!clean(c.textContent) && !c.querySelector('img')) return '';
    // a single text run stays a string; rich content keeps its nodes
    if (nodes.every((n) => n.nodeType === 3)) return clean(c.textContent);
    return nodes;
  };

  const rowEls = [...element.querySelectorAll('maui-table-row, tr')]
    .filter((r) => !r.parentElement.closest('maui-table-row, tr'));
  let rows = rowEls.map((r) => [...r.children]
    .filter((c) => /^(MAUI-TABLE-CELL|MAUI-TABLE-HEADER-CELL|MAUI-TABLE-HEAD-CELL|TD|TH)$/.test(c.tagName)
      || c.getAttribute('role') === 'cell' || c.getAttribute('role') === 'columnheader' || c.getAttribute('role') === 'rowheader')
    .map(cellContent));
  rows = rows.filter((cells) => cells.some((c) => c !== ''));
  const width = Math.max(1, ...rows.map((r) => r.length));
  const cells = rows.map((r) => (r.length < width ? [...r, ...Array(width - r.length).fill('')] : r));

  const before = [];
  const caption = element.querySelector('maui-table-caption, caption');
  if (caption && clean(caption.textContent)) {
    const p = document.createElement('p');
    p.textContent = clean(caption.textContent);
    before.push(p);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'table-striped', cells });
  element.replaceWith(...before, block);
}
