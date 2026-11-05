import { cleanText, stripZeroWidth, decorateExternalLinks } from '../../scripts/block-config.js';

/** A first cell is a row label when it holds short text only (no number-only value). */
function isLabel(cell, cellCount) {
  if (cellCount < 2) return false;
  const text = cleanText(cell);
  if (!text || text.length > 80) return false;
  if (cell.querySelector('img, picture, ul, ol, table')) return false;
  return !/^[\d\s.,:%+\-–/()€$£]+$/.test(text);
}

/** The (i)'s name in the page's language (English for any other). */
const INFO_LABELS = {
  en: 'More information',
  de: 'Weitere Informationen',
  es: 'Más información',
  fr: 'Plus d’informations',
  it: 'Maggiori informazioni',
  pl: 'Więcej informacji',
  pt: 'Mais informações',
};

const meaningful = (nodes) => nodes.filter((n) => n.nodeType !== 3 || n.textContent.trim());

/**
 * A cell's note: italic text after a line break at the cell's end (the TAP import's "text|note",
 * www.flytap.com's (i) tooltips) becomes an (i) button after the text, the note its data-tooltip.
 * @returns {Element|null} the button
 */
function noteAsInfo(cell) {
  const only = meaningful([...cell.childNodes]);
  const box = only.length === 1 && only[0].tagName === 'P' ? only[0] : cell;
  const nodes = meaningful([...box.childNodes]);
  const [em, br] = [nodes[nodes.length - 1], nodes[nodes.length - 2]];
  if (nodes.length < 3 || !em || !['EM', 'I'].includes(em.tagName) || !br || br.tagName !== 'BR') return null;
  const note = cleanText(em);
  if (!note) return null;
  while (box.lastChild !== br) box.lastChild.remove();
  br.remove();
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'table-striped-info';
  const lang = (document.documentElement.lang || '').slice(0, 2).toLowerCase();
  button.setAttribute('aria-label', INFO_LABELS[lang] || INFO_LABELS.en);
  button.dataset.tooltip = note;
  box.append(button);
  return button;
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
 * A box that scrolls (wider or taller than it is) is a Tab stop, so the keyboard scrolls it (axe
 * scrollable-region-focusable; brief 370); one that fits is none. Again on each resize.
 * @param {Element} box
 */
export function keepScrollFocusable(box) {
  const update = () => {
    if (box.scrollWidth > box.clientWidth || box.scrollHeight > box.clientHeight) box.tabIndex = 0;
    else box.removeAttribute('tabindex');
  };
  update();
  if (window.ResizeObserver && !box.dataset.scrollFocusable) {
    box.dataset.scrollFocusable = 'true';
    new ResizeObserver(update).observe(box);
  }
}

/**
 * Striped table, any number of columns. A short text first cell becomes a row header.
 * Option "header": the first authored row is the column header row (thead, th scope col),
 * drawn white with a line under it as the Lufthansa maui-table-head (/green-fare); else every
 * authored row is a data row. Option "matrix": wide comparison tables (table-striped-matrix.js).
 * A cell ending in a line break and italic text: that text its note, behind an (i) after the text.
 * @param {Element} block
 */
export default async function decorate(block) {
  const rows = [...block.children]
    .map((row) => [...row.children])
    .filter((cells) => cells.some((c) => cleanText(c) || c.querySelector('img')));
  const columns = Math.max(1, ...rows.map((cells) => cells.length));
  // the cells' notes: an (i) after the text (before a first cell is judged a label by its text)
  const notes = rows.flat().map(noteAsInfo).filter(Boolean);

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
  keepScrollFocusable(block);
  cleanTextNodes(table);
  decorateExternalLinks(table);
  // option matrix (wide comparison tables): sticky first column, the link titles as tooltips;
  // its own file, loaded only by the tables that ask for it (or have notes: its tooltip)
  if (block.classList.contains('matrix')) {
    const { default: decorateMatrix } = await import('./table-striped-matrix.js');
    decorateMatrix(block);
  } else if (notes.length) {
    const { decorateTooltips } = await import('./table-striped-matrix.js');
    decorateTooltips(block, notes);
  }
}
