import { decorateIcons } from '../../scripts/aem.js';
import { stripZeroWidth, decorateExternalLinks } from '../../scripts/block-config.js';
import { takeIconName } from '../../scripts/lh-icons.js';
import { decorateMedia } from '../../scripts/media.js';

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
 * Item grids: the import writes www's grid of image items in a panel (a column view whose items
 * are an image with a short text: /handgepaeck, /carry-on-baggage, Discover's families) as a
 * one-row table, one item per cell. Such a table (one row, a picture in every cell) becomes
 * div.accordion-columns-grid of div.accordion-columns-grid-item, the item count as
 * --accordion-columns-grid-count (CSS: www's col-md-6 col-lg, one column on phones, two from
 * 768px, all from 992px). Data tables (several rows, or a cell without a picture) stay tables.
 * @param {Element} root a panel (or any element holding panel content)
 */
export function buildGrids(root) {
  root.querySelectorAll('table').forEach((table) => {
    const rows = [...table.querySelectorAll('tr')];
    if (rows.length !== 1) return;
    const cells = [...rows[0].children];
    if (cells.length < 2 || !cells.every((c) => c.querySelector('picture, img'))) return;
    const grid = document.createElement('div');
    grid.className = 'accordion-columns-grid';
    grid.style.setProperty('--accordion-columns-grid-count', String(Math.min(cells.length, 4)));
    cells.forEach((c) => {
      const item = document.createElement('div');
      item.className = 'accordion-columns-grid-item';
      item.append(...c.childNodes);
      grid.append(item);
    });
    table.replaceWith(grid);
  });
}

/**
 * Splits panel content into columns: each heading of the first heading level used starts a
 * column; content before the first such heading becomes an intro spanning all columns.
 * With `single` (variant faq) nothing is split: the whole content is one column.
 */
function buildPanel(nodes, single) {
  const panel = document.createElement('div');
  panel.className = 'accordion-columns-panel';
  const first = !single
    && nodes.find((n) => n.nodeType === Node.ELEMENT_NODE && n.matches(HEADINGS));
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
 * Option column: the accordion is one column of a Lufthansa column view (/articles/tags
 * 'Destinations': North America | Europe | Asia). A run of consecutive column accordions is
 * wrapped in div.accordion-columns-row, which lays them out side by side (CSS).
 * @param {Element} block
 */
function groupColumns(block) {
  const isColumn = (el) => !!el && el.classList.contains('accordion-columns-wrapper')
    && !!el.querySelector(':scope > .accordion-columns.column');
  let first = block.parentElement;
  if (!isColumn(first) || first.parentElement.classList.contains('accordion-columns-row')) return;
  while (isColumn(first.previousElementSibling)) first = first.previousElementSibling;
  const run = [first];
  for (let next = first.nextElementSibling; isColumn(next); next = next.nextElementSibling) {
    run.push(next);
  }
  if (run.length < 2) return;
  const row = document.createElement('div');
  row.className = 'accordion-columns-row';
  row.style.setProperty('--accordion-columns-count', Math.min(run.length, 4));
  first.before(row);
  row.append(...run);
}

// option tabs: a tab bar from this width (www.lufthansa-cargo.com's tabs), the accordion below it
export const TABS_MEDIA = '(width >= 1025px)';
let tabsCount = 0;

/**
 * Option tabs: the same items as the accordion; from 1025px a tab bar (WAI-ARIA tabs: arrow keys,
 * Home and End move between the tabs and select them) shows one item's panel at a time, below it
 * the accordion as it is. The first item is selected; on the way back to the accordion the
 * selected item stays open, the others close.
 * @param {Element} block
 * @param {HTMLDetailsElement[]} items
 * @param {MediaQueryList} [media] the tab bar's media query (tests pass their own)
 */
export function buildTabs(block, items, media = window.matchMedia(TABS_MEDIA)) {
  if (items.length < 2) return null;
  tabsCount += 1;
  const id = `accordion-columns-tabs-${tabsCount}`;
  const bar = document.createElement('div');
  bar.className = 'accordion-columns-tablist';
  bar.setAttribute('role', 'tablist');
  let selected = 0;
  const tabs = items.map((item, i) => {
    const panel = item.querySelector(':scope > .accordion-columns-panel');
    panel.id = `${id}-panel-${i + 1}`;
    const tab = document.createElement('button');
    tab.type = 'button';
    tab.className = 'accordion-columns-tab';
    tab.id = `${id}-tab-${i + 1}`;
    tab.textContent = item.querySelector(':scope > summary').textContent.trim();
    tab.setAttribute('aria-controls', panel.id);
    bar.append(tab);
    return { tab, panel, item };
  });
  const applied = () => block.classList.contains('is-tabbed');
  const select = (index, focus) => {
    selected = index;
    tabs.forEach(({ tab, panel, item }, i) => {
      const on = i === index;
      tab.setAttribute('aria-selected', String(on));
      tab.setAttribute('tabindex', on ? '0' : '-1');
      item.classList.toggle('is-selected', on);
      if (applied()) {
        item.setAttribute('open', '');
        panel.setAttribute('aria-hidden', String(!on));
      } else {
        panel.removeAttribute('aria-hidden');
      }
    });
    if (focus) tabs[index].tab.focus();
  };
  const mode = () => {
    if (media.matches) {
      block.classList.add('is-tabbed');
      tabs.forEach(({ panel }, i) => {
        panel.setAttribute('role', 'tabpanel');
        panel.setAttribute('aria-labelledby', tabs[i].tab.id);
      });
    } else if (applied()) {
      block.classList.remove('is-tabbed');
      tabs.forEach(({ panel, item }, i) => {
        panel.removeAttribute('role');
        panel.removeAttribute('aria-labelledby');
        panel.removeAttribute('aria-hidden');
        if (i === selected) item.setAttribute('open', '');
        else item.removeAttribute('open');
      });
    }
    select(selected, false);
  };
  tabs.forEach(({ tab }, i) => tab.addEventListener('click', () => select(i, false)));
  bar.addEventListener('keydown', (e) => {
    const keys = {
      ArrowRight: selected + 1, ArrowLeft: selected - 1, Home: 0, End: tabs.length - 1,
    };
    if (!(e.key in keys)) return;
    e.preventDefault();
    select((keys[e.key] + tabs.length) % tabs.length, true);
  });
  block.prepend(bar);
  mode();
  media.addEventListener('change', mode);
  return { bar, select };
}

/**
 * Accordion whose panels split their content into columns at each heading.
 * One row per item: cell 1 title, cell 2 content. A single-cell row uses its first element
 * as the title. Videos (poster + .mp4 link) and embed links (YouTube, in-flight entertainment
 * widget) in a panel become players (scripts/media.js).
 * @param {Element} block
 */
export default async function decorate(block) {
  // an icon heading (C8, hrefless a.teaser): the document keeps the heading's SVG icon as a
  // paragraph of its own right after it; it goes back into the heading
  block.querySelectorAll(':is(h2, h3, h4, h5, h6) + p').forEach((p) => {
    const picture = p.querySelector(':scope > picture:only-child');
    const img = picture && picture.querySelector('img');
    if (!img || p.textContent.trim() || !/\.svg(?:$|[?#])/i.test(img.getAttribute('src') || '')) return;
    p.previousElementSibling.prepend(picture);
    p.remove();
  });
  if (block.classList.contains('column')) groupColumns(block);
  // faq: questions and answers (headings inside an answer stay in the one text column)
  const single = block.classList.contains('faq');
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
    details.append(summary, buildPanel(panelNodes, single));
    items.push(details);
  });

  block.replaceChildren(...items);
  if (block.classList.contains('tabs')) buildTabs(block, items);
  // item grids first (one-row tables of pictures), then the data tables that are left
  block.querySelectorAll('.accordion-columns-panel').forEach(buildGrids);
  // tables in a panel (Discover's fee and rule tables) scroll sideways in their own box
  block.querySelectorAll('.accordion-columns-panel table').forEach((table) => {
    const box = document.createElement('div');
    box.className = 'accordion-columns-table';
    table.before(box);
    box.append(table);
  });
  cleanTextNodes(block);
  decorateExternalLinks(block);
  await decorateMedia(block);
}
