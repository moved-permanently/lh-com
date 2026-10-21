import { decorateIcons } from '../../scripts/aem.js';
import { stripZeroWidth, decorateExternalLinks } from '../../scripts/block-config.js';
import { takeIconName } from '../../scripts/lh-icons.js';

const HEADINGS = 'h2, h3, h4, h5, h6';

/** Removes zero-width characters the source site puts around link texts. */
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
 * Splits panel content into columns: each heading of the first heading level used starts a
 * column; content before the first such heading becomes an intro spanning all columns.
 */
function buildPanel(nodes) {
  const panel = document.createElement('div');
  panel.className = 'accordion-columns-panel';
  const first = nodes.find((n) => n.nodeType === Node.ELEMENT_NODE && n.matches(HEADINGS));
  const level = first ? first.tagName : null;

  const intro = document.createElement('div');
  intro.className = 'accordion-columns-intro';
  const columns = document.createElement('div');
  columns.className = 'accordion-columns-columns';
  let current = null;

  nodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE && !node.textContent.trim()) return;
    if (level && node.nodeType === Node.ELEMENT_NODE && node.tagName === level) {
      current = document.createElement('div');
      current.className = 'accordion-columns-column';
      columns.append(current);
    }
    (current || intro).append(node);
  });

  if (intro.childNodes.length) panel.append(intro);
  if (columns.children.length) {
    columns.classList.add(`accordion-columns-${columns.children.length}-cols`);
    panel.append(columns);
  }
  return panel;
}

/**
 * Accordion whose panels split their content into columns at each heading.
 * One row per item: cell 1 title, cell 2 content. A single-cell row uses its first element
 * as the title.
 * @param {Element} block
 */
export default function decorate(block) {
  const items = [];
  [...block.children].forEach((row) => {
    const cells = [...row.children].filter((c) => c.textContent.trim() || c.querySelector('img'));
    if (!cells.length) return;
    let titleNodes;
    let panelNodes;
    if (cells.length >= 2) {
      titleNodes = [...cells[0].childNodes];
      panelNodes = cells.slice(1).flatMap((c) => [...c.childNodes]);
    } else {
      const children = [...cells[0].childNodes]
        .filter((n) => n.nodeType === Node.ELEMENT_NODE || n.textContent.trim());
      titleNodes = children.slice(0, 1);
      panelNodes = children.slice(1);
    }

    const details = document.createElement('details');
    details.className = 'accordion-columns-item';
    const summary = document.createElement('summary');
    summary.className = 'accordion-columns-title';
    // summary only allows phrasing content or a heading: unwrap authored paragraphs
    titleNodes.forEach((node) => {
      if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'P') summary.append(...node.childNodes);
      else summary.append(node);
    });
    // an undecorated leading ":name:" token (content served without the icon pipeline)
    const token = !summary.querySelector('span.icon') && takeIconName(summary);
    if (token) {
      const icon = document.createElement('span');
      icon.className = `icon icon-${token}`;
      summary.prepend(icon);
      decorateIcons(summary);
    }
    details.append(summary, buildPanel(panelNodes));
    items.push(details);
  });

  block.replaceChildren(...items);
  cleanTextNodes(block);
  decorateExternalLinks(block);
}
