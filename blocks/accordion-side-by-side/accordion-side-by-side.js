import { cleanText, stripZeroWidth, decorateExternalLinks } from '../../scripts/block-config.js';

const HEADINGS = 'h1, h2, h3, h4, h5, h6';

let instanceCount = 0;

function cleanTextNodes(root) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode();
  while (node) {
    const cleaned = stripZeroWidth(node.textContent);
    if (cleaned !== node.textContent) node.textContent = cleaned;
    node = walker.nextNode();
  }
}

/** Phrasing content of the title cell; an authored heading keeps its level as the wrapper. */
function readTitle(cell) {
  const heading = cell.querySelector(HEADINGS);
  const source = heading || cell;
  const nodes = [];
  [...source.childNodes].forEach((node) => {
    if (node.nodeType === Node.ELEMENT_NODE && ['P', 'DIV'].includes(node.tagName)) {
      nodes.push(...node.childNodes, document.createTextNode(' '));
    } else {
      nodes.push(node);
    }
  });
  // a link in the title would be nested inside the toggle button: keep its text only
  const wrapper = document.createElement('span');
  wrapper.append(...nodes);
  wrapper.querySelectorAll('a').forEach((a) => a.replaceWith(...a.childNodes));
  return { tag: heading ? heading.tagName.toLowerCase() : 'div', content: wrapper };
}

/**
 * Accordion whose items sit side by side in equal columns on wide screens.
 * One row per item: cell 1 title, cell 2 content (usually a list of links).
 * @param {Element} block
 */
export default function decorate(block) {
  instanceCount += 1;
  const items = [];
  [...block.children].forEach((row, index) => {
    const cells = [...row.children].filter((c) => cleanText(c) || c.querySelector('img'));
    if (!cells.length) return;

    const item = document.createElement('div');
    item.className = 'accordion-side-by-side-item';
    const { tag, content } = readTitle(cells[0]);
    const title = document.createElement(tag);
    title.className = 'accordion-side-by-side-title';
    content.className = 'accordion-side-by-side-label';
    item.append(title);

    const panelNodes = cells.slice(1).flatMap((c) => [...c.childNodes]);
    if (!panelNodes.length) {
      item.classList.add('accordion-side-by-side-static');
      title.append(content);
      items.push(item);
      return;
    }

    const id = `accordion-side-by-side-${instanceCount}-${index}`;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'accordion-side-by-side-button';
    button.id = `${id}-button`;
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-controls', `${id}-panel`);
    button.append(content);
    title.append(button);

    const panel = document.createElement('div');
    panel.className = 'accordion-side-by-side-panel';
    panel.id = `${id}-panel`;
    panel.setAttribute('role', 'region');
    panel.setAttribute('aria-labelledby', button.id);
    panel.hidden = true;
    panel.append(...panelNodes);
    item.append(panel);

    button.addEventListener('click', () => {
      const open = button.getAttribute('aria-expanded') !== 'true';
      button.setAttribute('aria-expanded', String(open));
      panel.hidden = !open;
      item.classList.toggle('accordion-side-by-side-open', open);
    });
    items.push(item);
  });

  block.replaceChildren(...items);
  cleanTextNodes(block);
  decorateExternalLinks(block);
}
