import { getLocale } from '../../scripts/locale.js';
import {
  toConfigKey, cleanText, resolveLabels, stripZeroWidth,
} from '../../scripts/block-config.js';

/**
 * UI strings; authors override them with a two-cell row such as "Show more label | Mehr".
 */
const DEFAULT_LABELS = {
  en: { 'show more label': 'Show more' },
  de: { 'show more label': 'Mehr anzeigen' },
};

const DEFAULT_VISIBLE = 5;
const CONFIG_KEYS = ['visible-rows', ...Object.keys(DEFAULT_LABELS.en).map(toConfigKey)];
const CELL_CLASSES = ['origin', 'destination', 'date', 'price'];

let instanceCount = 0;

/** Splits authored rows into config rows (exactly 2 cells, known key) and data rows. */
function readRows(block) {
  const config = {};
  const rows = [];
  [...block.children].forEach((row) => {
    const cells = [...row.children];
    const key = cells.length === 2 ? toConfigKey(cleanText(cells[0])) : '';
    if (CONFIG_KEYS.includes(key)) {
      if (!config[key]) config[key] = { text: cleanText(cells[1]) };
      return;
    }
    const filled = cells.filter((c) => cleanText(c) || c.querySelector('img'));
    if (filled.length) rows.push(cells);
  });
  return { config, rows };
}

/** Moves the cell content into a span, unwrapping links (the whole row becomes the link). */
function buildCell(cell, index) {
  const span = document.createElement('span');
  span.className = `table-deals-${CELL_CLASSES[index] || 'extra'}`;
  cell.querySelectorAll('a').forEach((a) => a.replaceWith(...a.childNodes));
  // block-level wrappers are not allowed inside the row link: keep their inline content
  cell.querySelectorAll('p, div').forEach((p) => p.replaceWith(...p.childNodes, ' '));
  span.append(...cell.childNodes);
  span.normalize();
  const walker = document.createTreeWalker(span, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode();
  while (node) {
    node.textContent = stripZeroWidth(node.textContent);
    node = walker.nextNode();
  }
  // a plain price text "from 423 €" gets its prefix and amount styled apart, like the source
  // (.last-minute-deals__price-label / __price-value)
  const price = CELL_CLASSES[index] === 'price' && !span.children.length
    && span.textContent.trim().match(/^(\D*?)\s*(\d.*)$/);
  if (price) {
    const [, prefix, amount] = price;
    const value = document.createElement('span');
    value.className = 'table-deals-price-value';
    value.textContent = amount;
    span.replaceChildren();
    if (prefix) {
      const label = document.createElement('span');
      label.className = 'table-deals-price-label';
      label.textContent = prefix;
      span.append(label, ' ');
    }
    span.append(value);
  }
  return span;
}

function buildRow(cells) {
  const li = document.createElement('li');
  li.className = 'table-deals-item';
  const link = cells.map((c) => c.querySelector('a[href]')).find(Boolean);
  let row;
  if (link) {
    row = document.createElement('a');
    row.href = link.href;
    row.rel = 'nofollow';
    if (link.title) row.title = link.title;
  } else {
    row = document.createElement('div');
  }
  row.className = 'table-deals-row';
  cells.forEach((cell, i) => {
    if (!cleanText(cell) && !cell.querySelector('img')) {
      // keep the column position of empty cells so the grid stays aligned
      const empty = document.createElement('span');
      empty.className = `table-deals-${CELL_CLASSES[i] || 'extra'}`;
      row.append(empty);
      return;
    }
    row.append(buildCell(cell, i));
  });
  li.append(row);
  return li;
}

/**
 * Frozen list of deals: one row per deal (Origin | Destination | Date | Price); the first link
 * of a row becomes the whole-row link. The first N rows are visible, a button reveals the rest.
 * @param {Element} block
 */
export default function decorate(block) {
  instanceCount += 1;
  const { config, rows } = readRows(block);
  const labels = resolveLabels(DEFAULT_LABELS, config, getLocale().lang);
  const parsed = parseInt((config['visible-rows'] || {}).text, 10);
  const visible = Number.isNaN(parsed) || parsed < 1 ? DEFAULT_VISIBLE : parsed;

  const list = document.createElement('ul');
  list.className = 'table-deals-list';
  list.id = `table-deals-${instanceCount}`;
  const items = rows.map(buildRow);
  items.forEach((li, i) => { if (i >= visible) li.hidden = true; });
  list.append(...items);
  block.replaceChildren(list);

  if (items.length <= visible) return;

  const button = document.createElement('button');
  button.type = 'button';
  // .last-minute-deals__load-more.btn-secondary: the global secondary button
  button.className = 'table-deals-more button secondary';
  button.textContent = labels['show more label'];
  button.setAttribute('aria-controls', list.id);
  button.setAttribute('aria-expanded', 'false');
  button.addEventListener('click', () => {
    items.forEach((li) => { li.hidden = false; });
    button.setAttribute('aria-expanded', 'true');
    button.hidden = true;
    const first = items[visible].querySelector('a');
    if (first) first.focus();
  });
  block.append(button);
}
