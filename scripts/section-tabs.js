/**
 * Tabs that hold blocks (www.swiss.com's and www.austrian.com's maui-tab-control-responsive with
 * column views, accordions and tables in its panels): consecutive sections with the section
 * metadata `Tab` (the tab's label) are one tab set; `Tabs` (any value) names the set, so two sets
 * that meet stay two. Each panel is a section of its own, so it holds any blocks. The set gets a
 * section before its panels with the tab list (role tablist; tabs with aria-selected,
 * aria-controls and a roving tabindex; arrow keys, Home and End select and focus; the panels
 * role tabpanel, aria-labelledby, the others hidden), shown from 768px; below 768px each panel is
 * an accordion item (a toggle with aria-expanded over it, the first open; on brands b2b and
 * discover all closed, as www's). A deep link (#id) into
 * a panel selects its tab. A section with the same `Tab` label (and set) as the one before it is a
 * part of that panel (www.austrian.com's austrian-app: a panel's text, then its image in a
 * full-bleed section; a grey box inside a panel): shown and hidden with the panel, its own section
 * style kept. Pages without such sections: nothing changes.
 * Styles: styles/section-tabs.css (loaded with the first set).
 */
import { getMetadata, loadCSS, toClassName } from './aem.js';

const DESKTOP = '(width >= 768px)';
// the brands whose www shows every accordion item closed below 768px (business.lufthansagroup.com's
// Newsroom, maui-tab-control-responsive theme b2b, brief 418; www.discover-airlines.com's, theme
// four_y, the sweep after brief 470; www.flytap.com's content tabs, tap-parity-001/-002 at 390);
// the others open the first
const CLOSED_BRANDS = ['b2b', 'discover', 'tap'];
let setCount = 0;

/**
 * The tab sets of a main: [[[panel, ...parts], ...], ...], consecutive Tab sections of one name;
 * a section with the label of the one before it is a part of that panel.
 */
function setsOf(main) {
  const sets = [];
  let current = null;
  // a section's parts too (scripts/section-aside.js: a tab set inside a sidebar's content)
  [...main.querySelectorAll(':scope > .section, :scope > .section > .section-part')].forEach((section) => {
    const label = section.dataset.tab;
    // a part that is no panel (a panel's grey box, a sidebar's intro) ends no set
    if (!label && section.classList.contains('section-part')) return;
    if (!label) { current = null; return; }
    const name = section.dataset.tabs || '';
    if (!current || current.name !== name) {
      current = { name, panels: [] };
      sets.push(current);
    }
    const last = current.panels[current.panels.length - 1];
    if (last && String(last[0].dataset.tab).trim() === String(label).trim()) last.push(section);
    else current.panels.push([section]);
  });
  return sets.map((s) => s.panels);
}

function button(className, text) {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = className;
  b.textContent = text;
  return b;
}

/** One tab set: the tab list section before its panels, the accordion toggles, the state. */
function buildSet(groups) {
  const panels = groups.map((g) => g[0]);
  setCount += 1;
  const base = `section-tabs-${setCount}`;
  const nav = document.createElement('div');
  nav.className = 'section section-tabs';
  nav.dataset.sectionStatus = 'initialized';
  const list = document.createElement('div');
  list.className = 'section-tabs-list';
  list.setAttribute('role', 'tablist');
  // in a content wrapper as the sections' (main > .section > div: the content width), so the
  // line under the tabs is as wide as the content
  const inner = document.createElement('div');
  inner.className = 'section-tabs-wrapper';
  inner.append(list);
  nav.append(inner);
  panels[0].before(nav);
  // inside a section beside an aside (its parts): the tab list one more row of its grid
  const host = nav.parentElement;
  if (host && host.classList.contains('with-aside')) {
    host.style.setProperty('--section-aside-rows', String([...host.children].filter((c) => !c.classList.contains('section-aside')).length));
  }

  const tabs = panels.map((panel, i) => {
    const label = String(panel.dataset.tab).trim();
    const id = `${base}-${toClassName(label) || 'tab'}-${i + 1}`;
    panel.id = panel.id || `${id}-panel`;
    panel.classList.add('section-tab-panel');
    panel.setAttribute('role', 'tabpanel');
    const tab = button('section-tabs-tab', label);
    tab.id = `${id}-tab`;
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', panel.id);
    panel.setAttribute('aria-labelledby', tab.id);
    // the panel's parts (its later sections of the same label): shown and hidden with it
    const parts = groups[i].slice(1);
    parts.forEach((part, k) => {
      part.id = part.id || `${id}-part-${k + 1}`;
      part.classList.add('section-tab-part');
    });
    const controls = [panel.id, ...parts.map((part) => part.id)].join(' ');
    tab.setAttribute('aria-controls', controls);
    list.append(tab);
    const toggle = button('section-tab-toggle', label);
    toggle.setAttribute('aria-controls', controls);
    panel.prepend(toggle);
    return {
      tab, toggle, panel, parts,
    };
  });

  const media = window.matchMedia(DESKTOP);
  let active = 0;
  // below 768px the first item open, or none on the closed brands; a page's own "Tabs open"
  // metadata (first | none) wins (B2B's meals-on-board and Allegris pages open the first)
  const pageOpen = getMetadata('tabs-open').trim().toLowerCase();
  let open = CLOSED_BRANDS.includes(getMetadata('brand').trim().toLowerCase()) ? -1 : 0;
  if (pageOpen === 'first') open = 0;
  if (pageOpen === 'none') open = -1;
  const render = () => {
    const desktop = media.matches;
    tabs.forEach(({
      tab, toggle, panel, parts,
    }, i) => {
      tab.setAttribute('aria-selected', String(i === active));
      tab.setAttribute('tabindex', i === active ? '0' : '-1');
      toggle.setAttribute('aria-expanded', String(i === open));
      panel.hidden = desktop && i !== active;
      [...panel.children].filter((c) => c !== toggle)
        .forEach((c) => { c.hidden = !desktop && i !== open; });
      parts.forEach((part) => {
        part.hidden = desktop ? i !== active : i !== open;
        [...part.children].forEach((c) => { c.hidden = !desktop && i !== open; });
      });
    });
  };
  const select = (i, focus) => {
    active = (i + tabs.length) % tabs.length;
    open = active;
    render();
    if (focus) tabs[active].tab.focus();
  };
  tabs.forEach(({ tab, toggle }, i) => {
    tab.addEventListener('click', () => select(i, false));
    toggle.addEventListener('click', () => {
      open = open === i ? -1 : i;
      if (open >= 0) active = open;
      render();
    });
  });
  list.addEventListener('keydown', (e) => {
    const keys = {
      ArrowRight: active + 1, ArrowLeft: active - 1, Home: 0, End: tabs.length - 1,
    };
    if (!(e.key in keys)) return;
    e.preventDefault();
    select(keys[e.key], true);
  });
  media.addEventListener?.('change', render);

  // a deep link into a panel selects its tab
  const hash = decodeURIComponent((window.location.hash || '').slice(1));
  const inside = (el) => el.id === hash || el.querySelector(`[id="${hash.replace(/"/g, '')}"]`);
  const target = hash && tabs.findIndex(({ panel, parts }) => [panel, ...parts].some(inside));
  if (target > 0) {
    active = target;
    open = target;
  }
  render();
}

/**
 * The page's tab sets (sections with `Tab` metadata), after decorateSections and decorateBlocks.
 * @param {Element} main
 */
export default function decorateSectionTabs(main) {
  const sets = setsOf(main);
  if (!sets.length) return;
  sets.forEach(buildSet);
  loadCSS(`${window.hlx?.codeBasePath || ''}/styles/section-tabs.css`);
}
