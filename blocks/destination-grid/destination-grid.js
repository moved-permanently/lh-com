/*
 * destination-grid: TAP's destinations grid, as www.flytap.com's destinations page shows it in
 * Smartvel's Explore&Go widget (tools/reports/tap/parity.md row 84). One row: Source, the
 * version's sheet (`/<version>/destinations/destination-grid.json`,
 * tools/tap-data/destination-grid-sheet.mjs:
 * a row a destination, chip, area or label). Above the cards a search box (the destinations by
 * name or country, accents aside), Filters, and the category chips, which filter at once (every
 * selected one, as www's AND); Filters opens a panel with the areas (Worldwide first) and the
 * categories, Clear (both reset) and Apply (the panel's choice, then closed). The cards: the city,
 * its country, www's 200 characters of text, a picture only where the sheet has one (Smartvel's
 * are licensed; the sheet leaves them out), the city linked to www's page for it (the widget's
 * "Travel to" button). 16 at a time, "load more" for the next 16. The look: destination-grid.css.
 */

/** The widget's English texts, where the sheet has none. */
export const DESTINATION_GRID_LABELS = {
  SEARCH_PLACEHOLDER: 'Destinations',
  SEARCH_NO_RESULTS: 'No destinations found',
  FILTERS_BTN: 'Filters',
  FILTERS_TITLE: 'Filters',
  FILTERS_TEXT: 'What type of trip are you interested in?',
  AREA_LIST_TITLE: 'Search by area',
  EVERYWHERE: 'Worldwide',
  CATEGORIES_TITLE: 'Filter by categories',
  FILTERS_CLEAR_BTN: 'Clear filters',
  FILTERS_BTN_APPLY: 'Apply filters',
  DESTINATION_LIST: 'Destination list',
  DESTINATION_LIST_EMPTY: 'There are no results within selected area',
  LOAD_MORE_DESTINATIONS_BTN: 'Load more destinations',
  CLOSE_BTN: 'Close',
};

/** www's cards at a time (paginationItems) and the text's length (textMaxCharDesktop). */
export const PAGE_SIZE = 16;
export const TEXT_MAX = 200;

let instances = 0;

const node = (tag, attrs = {}, ...kids) => {
  const n = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => {
    if (k === 'className') n.className = v;
    else n.setAttribute(k, v);
  });
  n.append(...kids.filter((k) => k !== null && k !== undefined && k !== false));
  return n;
};

const fold = (s) => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

/** The text cut to max characters at a word, with www's three dots. */
export function cut(text, max = TEXT_MAX) {
  const t = String(text || '').trim();
  if (t.length <= max) return t;
  const head = t.slice(0, max);
  const at = head.lastIndexOf(' ');
  return `${(at > max * 0.6 ? head.slice(0, at) : head).replace(/[\s,.;:–-]+$/, '')}...`;
}

/** The sheet's rows as the grid's model. */
export function modelOf(json) {
  const rows = (json && Array.isArray(json.data)) ? json.data : [];
  const of = (type) => rows.filter((r) => String(r.type || '').trim() === type);
  const labels = { ...DESTINATION_GRID_LABELS };
  of('label').forEach((r) => { if (r.id && r.name) labels[r.id] = r.name; });
  return {
    destinations: of('destination').filter((r) => r.name).map((r) => ({
      id: String(r.id || ''),
      name: String(r.name),
      country: String(r.country || ''),
      area: String(r.area || ''),
      tags: String(r.tags || '').split(',').map((t) => t.trim()).filter(Boolean),
      text: String(r.text || ''),
      link: String(r.link || ''),
      image: String(r.image || ''),
    })),
    chips: of('chip').filter((r) => r.id && r.name).map((r) => ({ id: String(r.id), name: String(r.name) })),
    areas: of('area').filter((r) => r.id && r.name).map((r) => ({ id: String(r.id), name: String(r.name) })),
    labels,
  };
}

/** The destinations a choice keeps: the area, every chip, the search in the name or country. */
export function matches(d, { area = '', chips = [], query = '' }) {
  if (area && d.area !== area) return false;
  if (!chips.every((c) => d.tags.includes(c))) return false;
  const q = fold(query).trim();
  return !q || fold(d.name).includes(q) || fold(d.country).includes(q);
}

function card(d) {
  const title = node('h3', {}, d.link ? node('a', { href: d.link }, d.name) : d.name);
  const body = node(
    'div',
    { className: 'destination-grid-body' },
    title,
    d.country ? node('p', { className: 'destination-grid-country' }, d.country) : null,
    d.text ? node('p', { className: 'destination-grid-text' }, cut(d.text)) : null,
  );
  const media = d.image
    ? node('div', { className: 'destination-grid-media' }, node('img', { src: d.image, alt: '', loading: 'lazy' }))
    : null;
  return node('li', { className: `destination-grid-card${media ? '' : ' destination-grid-card-text'}` }, media, body);
}

/**
 * @param {Element} block
 */
export default async function decorate(block) {
  instances += 1;
  const uid = `destination-grid-${instances}`;
  const link = block.querySelector('a[href]');
  const source = (link ? link.getAttribute('href') : [...block.querySelectorAll(':scope > div > div')].map((c) => c.textContent.trim()).find((t) => /\.json(\?|$)/.test(t))) || '';
  block.replaceChildren();
  if (!source) return;
  let model;
  try {
    const resp = await fetch(source);
    if (!resp.ok) return;
    model = modelOf(await resp.json());
  } catch (e) {
    return;
  }
  if (!model.destinations.length) return;
  const t = model.labels;

  const state = { area: '', chips: [], query: '' };
  let shown = PAGE_SIZE;

  // the bar: the search, Filters, the chips
  const search = node('input', {
    type: 'search', className: 'destination-grid-search', placeholder: t.SEARCH_PLACEHOLDER, 'aria-label': t.SEARCH_PLACEHOLDER, autocomplete: 'off', 'aria-controls': `${uid}-list`,
  });
  const toggle = node('button', {
    type: 'button', className: 'destination-grid-filters-toggle', 'aria-expanded': 'false', 'aria-controls': `${uid}-panel`,
  }, node('span', { className: 'destination-grid-filters-label' }, t.FILTERS_BTN));
  const chipButtons = model.chips.map((c) => node('button', { type: 'button', 'aria-pressed': 'false', 'data-chip': c.id }, c.name));
  const chipRow = node('div', { className: 'destination-grid-chips', role: 'group', 'aria-label': t.CATEGORIES_TITLE }, ...chipButtons);
  const bar = node('div', { className: 'destination-grid-bar' }, search, node('div', { className: 'destination-grid-filters' }, toggle, chipRow));

  // the panel: the areas, the categories, Clear and Apply
  const radio = (id, name, checked) => {
    const input = node('input', { type: 'radio', name: `${uid}-area`, value: id });
    input.checked = checked;
    return node('label', { className: 'destination-grid-option' }, input, node('span', {}, name));
  };
  const areaInputs = [radio('', t.EVERYWHERE, true), ...model.areas.map((a) => radio(a.id, a.name, false))];
  const chipInputs = model.chips.map((c) => {
    const input = node('input', { type: 'checkbox', value: c.id });
    return node('label', { className: 'destination-grid-option' }, input, node('span', {}, c.name));
  });
  const clear = node('button', { type: 'button', className: 'destination-grid-clear' }, t.FILTERS_CLEAR_BTN);
  const apply = node('button', { type: 'button', className: 'destination-grid-apply' }, t.FILTERS_BTN_APPLY);
  const panel = node(
    'div',
    {
      className: 'destination-grid-panel', id: `${uid}-panel`, role: 'region', 'aria-label': t.FILTERS_TITLE,
    },
    node('p', { className: 'destination-grid-panel-text' }, t.FILTERS_TEXT),
    node('fieldset', {}, node('legend', {}, t.AREA_LIST_TITLE), ...areaInputs),
    node('fieldset', {}, node('legend', {}, t.CATEGORIES_TITLE), ...chipInputs),
    node('div', { className: 'destination-grid-panel-actions' }, clear, apply),
  );
  panel.hidden = true;

  const status = node('p', { className: 'destination-grid-status', role: 'status' });
  const list = node('ul', { className: 'destination-grid-list', id: `${uid}-list`, 'aria-label': t.DESTINATION_LIST });
  const more = node('button', { type: 'button', className: 'destination-grid-more' }, t.LOAD_MORE_DESTINATIONS_BTN);

  const render = () => {
    const kept = model.destinations.filter((d) => matches(d, state));
    list.replaceChildren(...kept.slice(0, shown).map(card));
    more.hidden = kept.length <= shown;
    let empty = '';
    if (!kept.length) empty = state.query.trim() ? t.SEARCH_NO_RESULTS : t.DESTINATION_LIST_EMPTY;
    status.textContent = empty;
    chipButtons.forEach((b) => b.setAttribute('aria-pressed', String(state.chips.includes(b.dataset.chip))));
    toggle.classList.toggle('destination-grid-filters-active', Boolean(state.area || state.chips.length));
  };
  const change = () => {
    shown = PAGE_SIZE;
    render();
  };
  const syncPanel = () => {
    areaInputs.forEach((l) => {
      const i = l.querySelector('input');
      i.checked = i.value === state.area;
    });
    chipInputs.forEach((l) => {
      const i = l.querySelector('input');
      i.checked = state.chips.includes(i.value);
    });
  };
  const open = (yes) => {
    if (yes) syncPanel();
    panel.hidden = !yes;
    toggle.setAttribute('aria-expanded', String(yes));
  };

  search.addEventListener('input', () => { state.query = search.value; change(); });
  chipButtons.forEach((b) => b.addEventListener('click', () => {
    const id = b.dataset.chip;
    const on = state.chips.includes(id);
    state.chips = on ? state.chips.filter((c) => c !== id) : [...state.chips, id];
    change();
  }));
  toggle.addEventListener('click', () => open(panel.hidden));
  clear.addEventListener('click', () => {
    state.area = '';
    state.chips = [];
    syncPanel();
    change();
  });
  apply.addEventListener('click', () => {
    const checked = areaInputs.map((l) => l.querySelector('input')).find((i) => i.checked);
    state.area = checked ? checked.value : '';
    state.chips = chipInputs.map((l) => l.querySelector('input')).filter((i) => i.checked).map((i) => i.value);
    open(false);
    change();
    toggle.focus();
  });
  panel.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    open(false);
    toggle.focus();
  });
  more.addEventListener('click', () => {
    shown += PAGE_SIZE;
    render();
  });

  block.replaceChildren(bar, panel, status, list, more);
  render();
}
