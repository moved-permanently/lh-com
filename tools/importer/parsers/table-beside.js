/* eslint-disable */
/* global WebImporter */
import parseColumns from './columns-media.js';
import parseTable from './table-striped.js';

/**
 * Parser for table-striped with the option beside / beside-end (brief 478): a two-column view
 * whose one column holds a spec table (www's /de/en/100-years/fleet: each aircraft's data beside its
 * picture or text). www shows the columns side by side from 768 px, stacked below.
 *
 * Output: one table-striped block. Its first row: the other column's content (pictures, headings,
 * text, links: columns-media's parser on a copy without the table) in the first cell, and what the
 * table's own column has above the table (a picture) in a second cell when there is any; then the
 * table's rows (table-striped's parser on a copy). Option beside: the partner column is www's first
 * (left), beside-end: its second (right); header as table-striped gives it.
 */
export default function parse(element, { document, ...rest }) {
  const items = [...element.querySelectorAll(':scope > .column-view > .row > .column-view-item')];
  const t = items.findIndex((it) => it.querySelector('div.table'));
  if (items.length !== 2 || t < 0) return;

  // run a parser on a detached copy and keep what it would have made
  const capture = (fn, el) => {
    const original = WebImporter.Blocks.createBlock;
    let made = null;
    // only read: a placeholder, not the real block
    WebImporter.Blocks.createBlock = (doc, opts) => { made = opts; return doc.createElement('table'); };
    try {
      const box = document.createElement('div');
      box.append(el);
      fn(el, { document, ...rest });
    } finally {
      WebImporter.Blocks.createBlock = original;
    }
    return made;
  };

  const table = capture(parseTable, items[t].querySelector('div.table').cloneNode(true));
  if (!table || !table.cells || !table.cells.length) return;
  const view = element.cloneNode(true);
  view.querySelectorAll('div.table').forEach((n) => n.remove());
  const columns = capture(parseColumns, view);
  const cells = (columns && columns.cells && columns.cells[0]) || [];

  const filled = (c) => {
    const nodes = Array.isArray(c) ? c : [c];
    return nodes.some((n) => (typeof n === 'string' ? n.trim() : n && (n.textContent.trim() || (n.querySelector && n.querySelector('img')) || n.tagName === 'IMG')));
  };
  const partner = cells.length === 2 ? cells[1 - t] : (cells[0] || '');
  const above = cells.length === 2 ? cells[t] : '';
  const options = [];
  if (/\(header\)/i.test(table.name || '')) options.push('header');
  options.push(t === 1 ? 'beside' : 'beside-end');

  const first = filled(above) ? [partner, above] : [partner];
  const block = WebImporter.Blocks.createBlock(document, { name: `Table Striped (${options.join(', ')})`, cells: [first, ...table.cells] });
  element.replaceWith(block);
}
