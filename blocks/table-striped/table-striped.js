import { cleanText, stripZeroWidth, decorateExternalLinks } from '../../scripts/block-config.js';

/** A first cell is a row label when it holds short text only (no number-only value). */
function isLabel(cell, cellCount) {
  if (cellCount < 2) return false;
  const text = cleanText(cell);
  if (!text || text.length > 80) return false;
  if (cell.querySelector('img, picture, ul, ol, table')) return false;
  return !/^[\d\s.,:%+\-–/()€$£]+$/.test(text);
}

function cleanTextNodes(root) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode();
  while (node) {
    const cleaned = stripZeroWidth(node.textContent);
    if (cleaned !== node.textContent) node.textContent = cleaned;
    node = walker.nextNode();
  }
}

/**
 * Striped table, any number of columns. A short text first cell becomes a row header.
 * Option "header": the first authored row is the column header row (thead, th scope col),
 * drawn white with a line under it as the Lufthansa maui-table-head (/green-fare); else every
 * authored row is a data row.
 * @param {Element} block
 */
export default function decorate(block) {
  const rows = [...block.children]
    .map((row) => [...row.children])
    .filter((cells) => cells.some((c) => cleanText(c) || c.querySelector('img')));
  const columns = Math.max(1, ...rows.map((cells) => cells.length));

  const table = document.createElement('table');
  const tbody = document.createElement('tbody');
  if (block.classList.contains('header') && rows.length > 1) {
    const thead = document.createElement('thead');
    const tr = document.createElement('tr');
    const cells = rows.shift();
    cells.forEach((cell, i) => {
      const th = document.createElement('th');
      th.scope = 'col';
      th.append(...cell.childNodes);
      if (th.children.length === 1 && th.firstElementChild.tagName === 'P') {
        th.firstElementChild.replaceWith(...th.firstElementChild.childNodes);
      }
      if (i === cells.length - 1 && cells.length < columns) th.colSpan = columns - cells.length + 1;
      tr.append(th);
    });
    thead.append(tr);
    table.append(thead);
  }
  rows.forEach((cells) => {
    const tr = document.createElement('tr');
    cells.forEach((cell, i) => {
      const header = i === 0 && isLabel(cell, cells.length);
      const td = document.createElement(header ? 'th' : 'td');
      if (header) td.scope = 'row';
      td.append(...cell.childNodes);
      // a single paragraph wrapper adds unwanted margins inside a cell
      if (td.children.length === 1 && td.firstElementChild.tagName === 'P'
        && td.textContent.trim() === td.firstElementChild.textContent.trim()) {
        td.firstElementChild.replaceWith(...td.firstElementChild.childNodes);
      }
      // short rows: the last cell fills the remaining columns
      if (i === cells.length - 1 && cells.length < columns) td.colSpan = columns - cells.length + 1;
      tr.append(td);
    });
    tbody.append(tr);
  });
  table.append(tbody);

  block.replaceChildren(table);
  cleanTextNodes(table);
  decorateExternalLinks(table);
}
