/**
 * Tabs of the bookings page (live: maui-tab-control-responsive navigation-mode="deeplink"):
 * rows `label | panel` (optional third cell: the deep link id). From 768px a tab row, below an
 * accordion. Deep links #upcoming / #past select a tab; the ids follow the tab position, as
 * live uses the same hashes in every language. Option content: tabs of page content (image,
 * heading, text: /onboard-delights), the first panel open below 768px.
 */
import { loadBlock, toClassName } from '../../scripts/aem.js';

const POSITION_IDS = ['upcoming', 'past'];
const DESKTOP = window.matchMedia('(width >= 768px)');

/** Widget links in the panels became widget blocks before this block ran: load them. */
function loadNestedWidgets(block) {
  return Promise.all([...block.querySelectorAll('div.widget')].map((widget) => {
    widget.classList.add('block');
    widget.dataset.blockName = 'widget';
    widget.dataset.blockStatus = 'initialized';
    return loadBlock(widget);
  }));
}

export default async function decorate(block) {
  const rows = [...block.children].filter((row) => row.children.length >= 2);
  const used = new Set();
  const items = rows.map((row, i) => {
    const [labelCell, panelCell, idCell] = row.children;
    const label = labelCell.textContent.trim();
    let id = (idCell && toClassName(idCell.textContent)) || POSITION_IDS[i] || toClassName(label);
    if (!id || used.has(id) || document.getElementById(id)) id = `${id || 'tab'}-${i + 1}`;
    used.add(id);

    const tab = document.createElement('button');
    tab.type = 'button';
    tab.id = `${id}-tab`;
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', id);
    tab.textContent = label;

    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'profile-tabs-toggle';
    toggle.setAttribute('aria-controls', id);
    toggle.setAttribute('aria-expanded', 'false');
    toggle.textContent = label;

    const panel = document.createElement('div');
    panel.id = id;
    panel.className = 'profile-tabs-panel';
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', tab.id);
    panel.append(...panelCell.childNodes);
    // block decoration wrapped the cell's widget blocks into a paragraph
    panel.querySelectorAll(':scope > p:has(> div.widget)').forEach((para) => para.replaceWith(...para.childNodes));

    const item = document.createElement('div');
    item.className = 'profile-tabs-item';
    item.append(toggle, panel);
    return {
      id, tab, toggle, panel, item,
    };
  });

  const tablist = document.createElement('div');
  tablist.className = 'profile-tabs-list';
  tablist.setAttribute('role', 'tablist');
  tablist.append(...items.map((it) => it.tab));
  block.replaceChildren(tablist, ...items.map((it) => it.item));

  const fromHash = () => items.find((it) => `#${it.id}` === window.location.hash);
  let selected = fromHash() || items[0];
  // option content (tabs of page content, /onboard-delights): below 768px the first panel is
  // open on load, as live
  const initial = fromHash() || (block.classList.contains('content') ? items[0] : null);
  const expanded = new Set(initial ? [initial] : []);

  const render = () => {
    items.forEach((it) => {
      const isSelected = it === selected;
      it.tab.setAttribute('aria-selected', String(isSelected));
      it.tab.tabIndex = isSelected ? 0 : -1;
      it.toggle.setAttribute('aria-expanded', String(expanded.has(it)));
      it.panel.hidden = DESKTOP.matches ? !isSelected : !expanded.has(it);
    });
  };
  const select = (it, focus) => {
    selected = it;
    expanded.add(it);
    window.history.replaceState(null, '', `#${it.id}`);
    render();
    if (focus) it.tab.focus();
  };

  items.forEach((it, i) => {
    it.tab.addEventListener('click', () => select(it));
    it.tab.addEventListener('keydown', (e) => {
      const keys = {
        ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: items.length - 1,
      };
      if (!(e.key in keys)) return;
      e.preventDefault();
      select(items[(keys[e.key] + items.length) % items.length], true);
    });
    it.toggle.addEventListener('click', () => {
      if (expanded.has(it)) {
        expanded.delete(it);
        render();
      } else {
        select(it);
      }
    });
  });
  window.addEventListener('hashchange', () => {
    const it = fromHash();
    if (it && it !== selected) select(it);
  });
  DESKTOP.addEventListener('change', render);
  render();

  await loadNestedWidgets(block);
}
