import { getLocale } from '../../scripts/locale.js';
import { cleanText, toConfigKey } from '../../scripts/block-config.js';

/**
 * www.flytap.com's texts of the fare comparison (2026-11-05, its fare pages in each language);
 * the scroll buttons have no name on www: ours are named. A label row of the block overrides any
 * of them (README).
 */
export const FARE_COMPARISON_LABELS = {
  en: {
    'compare label': 'Compare fares',
    'dialog note': 'You can select up to four fares to compare.',
    'clear label': 'Clear',
    'apply label': 'Compare',
    'close label': 'close',
    'info label': 'Info',
    'services label': 'Services',
    'previous label': 'Previous',
    'next label': 'Next',
    'caption label': 'Caption',
    'notes label': 'Notes',
  },
  pt: {
    'compare label': 'Comparar tarifas',
    'dialog note': 'Pode escolher até quatro tarifas para comparar.',
    'clear label': 'Limpar',
    'apply label': 'Comparar',
    'close label': 'close',
    'info label': 'Info',
    'services label': 'Serviços',
    'previous label': 'Anterior',
    'next label': 'Seguinte',
    'caption label': 'Legenda',
    'notes label': 'Notas',
  },
  es: {
    'compare label': 'Comparar tarifas',
    'dialog note': 'Puedes seleccionar hasta cuatro tarifas para comparar.',
    'clear label': 'Limpiar',
    'apply label': 'Comparar',
    'close label': 'close',
    'info label': 'Info',
    'services label': 'Servicios',
    'previous label': 'Anterior',
    'next label': 'Siguiente',
    'caption label': 'Leyenda',
    'notes label': 'Notas',
  },
  fr: {
    'compare label': 'Comparer les tarifs',
    'dialog note': 'Vous pouvez sélectionner jusqu’à quatre tarifs à comparer.',
    'clear label': 'Effacer',
    'apply label': 'Comparer',
    'close label': 'close',
    'info label': 'Info',
    'services label': 'Services',
    'previous label': 'Précédent',
    'next label': 'Suivant',
    'caption label': 'Légende',
    'notes label': 'Notes',
  },
  it: {
    'compare label': 'Confronta le tariffe',
    'dialog note': 'Puoi selezionare fino a quattro tariffe da confrontare.',
    'clear label': 'Cancella',
    'apply label': 'Confronta',
    'close label': 'close',
    'info label': 'Info',
    'services label': 'Servizi',
    'previous label': 'Precedente',
    'next label': 'Successivo',
    'caption label': 'Didascalia',
    'notes label': 'Note',
  },
  de: {
    'compare label': 'Tarife vergleichen',
    'dialog note': 'Sie können bis zu vier Tarife zum Vergleichen auswählen.',
    'clear label': 'Zurücksetzen',
    'apply label': 'Vergleichen',
    'close label': 'close',
    'info label': 'Info',
    'services label': 'Services',
    'previous label': 'Zurück',
    'next label': 'Weiter',
    'caption label': 'Legende',
    'notes label': 'Hinweise',
  },
};

// www: up to four fares side by side
const MAX_COMPARE = 4;
// a phone column (www: 128 px)
const COLUMN = 128;
const YES = /^[✓✔]$/;
const NO = /^[✕✗✘×]$/;

let instance = 0;

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

/** A cell's text and its note (its italic text, www's (i) tooltip). */
function readCell(cell) {
  const copy = cell.cloneNode(true);
  const note = [...copy.querySelectorAll('em, i')].map((e) => cleanText(e)).filter(Boolean).join(' ');
  copy.querySelectorAll('em, i').forEach((e) => e.remove());
  const text = cleanText(copy);
  let mark = '';
  if (YES.test(text)) mark = 'yes';
  else if (NO.test(text)) mark = 'no';
  return { text, note, mark };
}

/** The caption cell's legend: "✓ Service included" items as [mark, text]. */
function readCaption(cell) {
  return [...cell.querySelectorAll('li')].map((li) => {
    const text = cleanText(li);
    const [first] = text;
    let mark = '';
    if (YES.test(first)) mark = 'yes';
    else if (NO.test(first)) mark = 'no';
    return { mark, text: mark ? text.slice(1).trim() : text };
  });
}

/** The fare's colour key (www colours its column by the fare: README). */
const fareKey = (name) => name.toLowerCase().trim().replace(/\s+/g, '-');

/**
 * The block's rows (README): label rows, Group | name, Cabin | name, the cabin's header row (an
 * empty first cell, then the fares), its service rows, Caption | list, Notes | text.
 */
function readRows(block, labelKeys) {
  const labels = {};
  const groups = [];
  let group = null;
  let cabin = null;
  const shared = { caption: null, notes: null };
  [...block.children].forEach((row) => {
    const cells = [...row.children];
    if (!cells.length) return;
    const key = toConfigKey(cleanText(cells[0]));
    const value = cells[1];
    if (cells.length === 2 && labelKeys.includes(key)) {
      labels[key] = cleanText(value);
      return;
    }
    if (cells.length === 2 && key === 'group') {
      group = { title: cleanText(value), cabins: [] };
      groups.push(group);
      cabin = null;
      return;
    }
    if (cells.length === 2 && key === 'cabin' && group) {
      cabin = {
        name: cleanText(value), fares: null, rows: [], caption: null, notes: null, services: '',
      };
      group.cabins.push(cabin);
      return;
    }
    if (cells.length === 2 && (key === 'caption' || key === 'notes')) {
      const content = key === 'caption' ? readCaption(value) : [...value.childNodes];
      if (cabin) cabin[key] = content;
      else shared[key] = content;
      return;
    }
    if (!cabin) {
      // one table (README): no Group and no Cabin rows, its header row first
      if (groups.length) return;
      group = { title: '', cabins: [], single: true };
      groups.push(group);
      cabin = {
        name: '', fares: null, rows: [], caption: null, notes: null, services: '',
      };
      group.cabins.push(cabin);
    }
    if (!cabin.fares) {
      // the header row: the first cell (empty, or the "Services" text), then the fares
      cabin.services = cleanText(cells[0]);
      cabin.fares = cells.slice(1).map((c) => cleanText(c)).filter(Boolean)
        .map((name) => ({ name, key: fareKey(name), cabin: cabin.name }));
      return;
    }
    const [label, ...values] = cells.map(readCell);
    if (!label.text) return;
    cabin.rows.push({ label, values });
  });
  groups.forEach((g) => g.cabins.forEach((c) => {
    if (!c.caption) c.caption = shared.caption;
    if (!c.notes) c.notes = shared.notes;
    if (!c.fares) c.fares = [];
  }));
  return { labels, groups: groups.filter((g) => g.cabins.length) };
}

/* ------------------------------------------------------------------ tooltips ------------- */

let openTip = null;
let lastPointer = 'mouse';

function hideTip() {
  if (!openTip) return;
  openTip.tip.hidden = true;
  openTip = null;
}

function placeTip(button, tip) {
  if (typeof button.getBoundingClientRect !== 'function') return;
  const b = button.getBoundingClientRect();
  const width = Math.min(384, (window.innerWidth || 1024) - 32);
  tip.style.maxWidth = `${width}px`;
  // measured at the left edge, where it may take its full width (a fixed box shrinks to the room
  // right of where it stands)
  tip.style.left = '0px';
  tip.style.top = '0px';
  const t = tip.getBoundingClientRect();
  const right = (window.innerWidth || 1024) - 16 - t.width;
  const left = Math.max(16, Math.min(b.left + b.width / 2 - t.width / 2, right));
  tip.style.left = `${Math.round(left)}px`;
  tip.style.top = `${Math.round(b.top - t.height - 4)}px`;
}

function showTip(button, tip) {
  if (openTip && openTip.tip !== tip) hideTip();
  tip.hidden = false;
  openTip = { button, tip };
  placeTip(button, tip);
}

// the documents listened to (one in a page; tests make several)
const watched = new WeakSet();
function watchTips() {
  if (watched.has(document)) return;
  watched.add(document);
  document.addEventListener('pointerdown', (e) => {
    lastPointer = e.pointerType || 'mouse';
    if (openTip && !(e.target && e.target.closest && e.target.closest('.fare-comparison-info'))) hideTip();
  }, true);
  window.addEventListener('scroll', hideTip, { passive: true });
}

/** An (i) button with its note as a tooltip (www: hover, keyboard focus, a tap; Escape). */
function infoButton(note, id, label) {
  const wrap = el('span', 'fare-comparison-info-wrap');
  const button = el('button', 'fare-comparison-info');
  button.type = 'button';
  button.setAttribute('aria-label', label);
  const tip = el('span', 'fare-comparison-tooltip', note);
  tip.id = id;
  tip.setAttribute('role', 'tooltip');
  tip.hidden = true;
  button.setAttribute('aria-describedby', tip.id);
  button.addEventListener('pointerenter', (e) => { if (e.pointerType !== 'touch') showTip(button, tip); });
  button.addEventListener('pointerleave', (e) => { if (e.pointerType !== 'touch') hideTip(); });
  button.addEventListener('focus', () => showTip(button, tip));
  button.addEventListener('blur', () => { if (openTip && openTip.tip === tip) hideTip(); });
  button.addEventListener('keydown', (e) => { if (e.key === 'Escape') hideTip(); });
  // a tap focuses the button (which opens the tip) before its click: the press decides
  let openAtPress = false;
  button.addEventListener('pointerdown', () => { openAtPress = !tip.hidden; });
  button.addEventListener('click', () => {
    if (lastPointer === 'touch' && openAtPress) hideTip();
    else showTip(button, tip);
    openAtPress = !tip.hidden;
  });
  wrap.append(button, tip);
  return wrap;
}

/* ------------------------------------------------------------------ tabs ----------------- */

/** Tabs (role tab) with arrow, Home and End keys; onSelect(index) on a press or a key. */
function tabList(className, names, onSelect, label) {
  const list = el('div', className);
  list.setAttribute('role', 'tablist');
  if (label) list.setAttribute('aria-label', label);
  const tabs = names.map((name, i) => {
    const tab = el('button', 'fare-comparison-tab', name);
    tab.type = 'button';
    tab.setAttribute('role', 'tab');
    tab.addEventListener('click', () => onSelect(i));
    tab.addEventListener('keydown', (e) => {
      const last = tabs.length - 1;
      const next = {
        ArrowRight: i === last ? 0 : i + 1, ArrowLeft: i === 0 ? last : i - 1, Home: 0, End: last,
      }[e.key];
      if (next === undefined) return;
      e.preventDefault();
      onSelect(next);
      tabs[next].focus();
    });
    return tab;
  });
  list.append(...tabs);
  const select = (index) => tabs.forEach((tab, i) => {
    tab.setAttribute('aria-selected', String(i === index));
    if (index >= 0) tab.tabIndex = i === index ? 0 : -1;
  });
  return { list, tabs, select };
}

/* ------------------------------------------------------------------ the table ------------ */

function markIcon(mark) {
  const icon = el('span', 'fare-comparison-icon');
  icon.dataset.mark = mark;
  icon.setAttribute('aria-hidden', 'true');
  return icon;
}

/**
 * The table of some fares: columns [{ fare, cabin }], each with its cabin's rows; the rows of all
 * in order (a fare without a row: an empty cell).
 */
function buildTable(columns, ctx) {
  const { labels, uid } = ctx;
  const table = el('table', 'fare-comparison-table');
  const thead = el('thead');
  const head = el('tr');
  const corner = el('th');
  corner.scope = 'col';
  corner.append(el('span', 'fare-comparison-services', columns[0] && columns[0].cabin.services ? columns[0].cabin.services : labels['services label']));
  head.append(corner);
  columns.forEach(({ fare, cabin }) => {
    const th = el('th');
    th.scope = 'col';
    th.dataset.fare = fare.key;
    if (cabin.name) th.append(el('span', 'fare-comparison-fare-cabin', cabin.name));
    th.append(el('span', 'fare-comparison-fare', fare.name));
    head.append(th);
  });
  thead.append(head);
  // the rows: by label, in the order they first come
  const order = [];
  const byLabel = new Map();
  columns.forEach(({ cabin }) => cabin.rows.forEach((row) => {
    if (!byLabel.has(row.label.text)) {
      byLabel.set(row.label.text, row.label);
      order.push(row.label.text);
    }
  }));
  const tbody = el('tbody');
  order.forEach((text) => {
    const label = byLabel.get(text);
    const tr = el('tr');
    const th = el('th');
    th.scope = 'row';
    th.append(el('span', 'fare-comparison-label', label.text));
    if (label.note) {
      ctx.tips += 1;
      th.append(infoButton(label.note, `${uid}-tip-${ctx.tips}`, labels['info label']));
    }
    tr.append(th);
    columns.forEach(({ fare, cabin }) => {
      const td = el('td');
      const row = cabin.rows.find((r) => r.label.text === text);
      const index = cabin.fares.indexOf(fare);
      const value = row && row.values[index];
      if (value) {
        if (value.mark) {
          const legend = (cabin.caption || []).find((item) => item.mark === value.mark);
          td.append(markIcon(value.mark), el('span', 'fare-comparison-sr', legend ? legend.text : value.text));
        } else if (value.text) {
          td.append(el('span', 'fare-comparison-value', value.text));
        }
        if (value.note) {
          ctx.tips += 1;
          td.classList.add('fare-comparison-has-info');
          td.append(infoButton(value.note, `${uid}-tip-${ctx.tips}`, labels['info label']));
        }
      }
      tr.append(td);
    });
    tbody.append(tr);
  });
  table.append(thead, tbody);
  return table;
}

function buildCaption(cabin, labels) {
  const box = el('div', 'fare-comparison-caption');
  // Legend and Notes as www's H2s (brief 403, R4-2)
  box.append(el('h2', 'fare-comparison-caption-title', labels['caption label']));
  const inner = el('div', 'fare-comparison-caption-box');
  if (cabin.caption && cabin.caption.length) {
    const list = el('ul', 'fare-comparison-legend');
    cabin.caption.forEach((item) => {
      const li = el('li');
      if (item.mark) li.append(markIcon(item.mark));
      li.append(el('span', '', item.text));
      list.append(li);
    });
    inner.append(list);
  }
  if (cabin.notes && cabin.notes.length) {
    inner.append(el('h2', 'fare-comparison-notes-title', labels['notes label']));
    const notes = el('div', 'fare-comparison-notes');
    cabin.notes.forEach((n) => notes.append(n.cloneNode(true)));
    inner.append(notes);
  }
  box.append(inner);
  return box;
}

/* ------------------------------------------------------------------ the dialog ----------- */

function buildDialog(labels, uid) {
  const dialog = el('dialog', 'fare-comparison-dialog');
  const title = el('h2', 'fare-comparison-dialog-title', labels['compare label']);
  title.id = `${uid}-dialog-title`;
  dialog.setAttribute('aria-labelledby', title.id);
  const close = el('button', 'fare-comparison-dialog-close');
  close.type = 'button';
  close.setAttribute('aria-label', labels['close label']);
  const head = el('div', 'fare-comparison-dialog-head');
  head.append(title, close);
  const choices = el('div', 'fare-comparison-dialog-choices');
  const note = el('p', 'fare-comparison-dialog-note', labels['dialog note']);
  const clear = el('button', 'fare-comparison-clear button secondary', labels['clear label']);
  clear.type = 'button';
  const apply = el('button', 'fare-comparison-apply button primary', labels['apply label']);
  apply.type = 'button';
  const actions = el('div', 'fare-comparison-dialog-actions');
  actions.append(clear, apply);
  dialog.append(head, choices, note, actions);
  const native = typeof dialog.showModal === 'function';
  const state = { onApply: null };
  const shut = () => {
    if (native && dialog.open) dialog.close();
    else dialog.removeAttribute('open');
  };
  const boxes = () => [...choices.querySelectorAll('input[type="checkbox"]')];
  const limit = () => {
    const full = boxes().filter((b) => b.checked).length >= MAX_COMPARE;
    boxes().forEach((b) => { b.disabled = full && !b.checked; });
  };
  close.addEventListener('click', shut);
  clear.addEventListener('click', () => {
    boxes().forEach((b) => { b.checked = false; });
    limit();
  });
  apply.addEventListener('click', () => {
    const chosen = boxes().filter((b) => b.checked).map((b) => b.value);
    shut();
    if (state.onApply) state.onApply(chosen);
  });
  /** Opens with the group's cabins and fares, the chosen ones checked. */
  const open = (group, chosen, onApply) => {
    state.onApply = onApply;
    choices.replaceChildren(...group.cabins.map((cabin, c) => {
      const set = el('fieldset', 'fare-comparison-dialog-cabin');
      set.append(el('legend', '', cabin.name));
      cabin.fares.forEach((fare, f) => {
        const label = el('label', 'fare-comparison-dialog-fare');
        const box = el('input');
        box.type = 'checkbox';
        box.value = `${c}:${f}`;
        box.checked = chosen.includes(box.value);
        box.addEventListener('change', limit);
        label.append(box, el('span', '', fare.name));
        set.append(label);
      });
      return set;
    }));
    limit();
    if (native) dialog.showModal();
    else dialog.setAttribute('open', '');
  };
  return { dialog, open };
}

/* ------------------------------------------------------------------ the block ------------ */

/** The table's sideways scroller and its phone buttons (Previous, Next: a column each). */
function scrollParts(labels) {
  const scroller = el('div', 'fare-comparison-scroll');
  const nav = el('div', 'fare-comparison-nav');
  nav.append(...['previous', 'next'].map((dir) => {
    const b = el('button', `fare-comparison-${dir}`);
    b.type = 'button';
    b.setAttribute('aria-label', labels[`${dir} label`]);
    b.addEventListener('click', () => {
      if (typeof scroller.scrollBy === 'function') scroller.scrollBy({ left: dir === 'next' ? COLUMN : -COLUMN, behavior: 'smooth' });
    });
    return b;
  }));
  return { scroller, nav };
}

/** One table (no Group, no Cabin): its fares as columns, the scroll buttons, the caption box. */
function singleTable(block, cabin, ctx) {
  const body = el('div', 'fare-comparison-body fare-comparison-single');
  const { scroller, nav } = scrollParts(ctx.labels);
  scroller.append(buildTable(cabin.fares.map((fare) => ({ fare, cabin })), ctx));
  body.style.setProperty('--fare-comparison-columns', String(cabin.fares.length));
  body.append(scroller, nav, buildCaption(cabin, ctx.labels));
  block.replaceChildren(body);
}

/**
 * fare-comparison (TAP's fare pages, www.flytap.com): the route groups as pills, each with its
 * cabins as tabs, the cabin's fares as columns (from 1024 px) or a table that scrolls sideways
 * (phones), ✓ / ✕ as icons, the notes as (i) tooltips, "Compare fares" (up to four fares of the
 * group side by side), the caption and notes below; one table without route groups and cabins
 * (TAP's other comparison tables: table-striped-tap.js) only its table and caption box. The
 * authored table: README.
 * @param {Element} block
 */
export default function decorate(block) {
  instance += 1;
  const uid = `fare-comparison-${instance}`;
  const keys = Object.keys(FARE_COMPARISON_LABELS.en).map(toConfigKey);
  const { labels: authored, groups } = readRows(block, keys);
  const lang = (getLocale().lang || 'en').split('-')[0];
  const defaults = FARE_COMPARISON_LABELS[lang] || FARE_COMPARISON_LABELS.en;
  const labels = Object.fromEntries(Object.entries(defaults)
    .map(([k, v]) => [k, authored[toConfigKey(k)] || v]));
  if (!groups.length) {
    block.replaceChildren();
    block.hidden = true;
    return;
  }
  watchTips();
  const ctx = { labels, uid, tips: 0 };
  if (groups.length === 1 && groups[0].single) {
    singleTable(block, groups[0].cabins[0], ctx);
    return;
  }
  const { dialog, open } = buildDialog(labels, uid);

  const panels = groups.map((group, g) => {
    const panel = el('div', 'fare-comparison-group');
    panel.id = `${uid}-group-${g}`;
    panel.setAttribute('role', 'tabpanel');
    panel.append(el('h2', 'fare-comparison-group-title', group.title));
    const body = el('div', 'fare-comparison-body');
    body.id = `${uid}-group-${g}-body`;
    const cabinTitle = el('h2', 'fare-comparison-cabin-title');
    const tools = el('div', 'fare-comparison-tools');
    const compare = el('button', 'fare-comparison-compare');
    compare.type = 'button';
    compare.setAttribute('aria-haspopup', 'dialog');
    const compareText = el('span', 'fare-comparison-compare-text', labels['compare label']);
    compare.append(compareText, el('span', 'fare-comparison-filter'));
    compare.lastChild.setAttribute('aria-hidden', 'true');
    tools.append(compare);
    const { scroller, nav } = scrollParts(labels);
    const captions = group.cabins.map((cabin) => buildCaption(cabin, labels));
    body.append(cabinTitle, tools, scroller, nav, ...captions);
    const state = { cabin: 0, chosen: [] };
    let cabinTabs = null;
    const render = () => {
      hideTip();
      const comparing = state.chosen.length > 0;
      const column = ([c, f]) => ({ fare: group.cabins[c].fares[f], cabin: group.cabins[c] });
      const columns = comparing
        ? state.chosen.map((v) => column(v.split(':').map(Number)))
        : group.cabins[state.cabin].fares.map((fare, f) => column([state.cabin, f]));
      scroller.replaceChildren(buildTable(columns, ctx));
      cabinTitle.textContent = group.cabins[state.cabin].name;
      cabinTitle.hidden = comparing;
      cabinTabs.select(comparing ? -1 : state.cabin);
      const count = comparing ? ` (${state.chosen.length})` : '';
      compareText.textContent = `${labels['compare label']}${count}`;
      const shown = comparing ? Number(state.chosen[0].split(':')[0]) : state.cabin;
      captions.forEach((c, i) => { c.hidden = i !== shown; });
      body.classList.toggle('fare-comparison-comparing', comparing);
      body.style.setProperty('--fare-comparison-columns', String(columns.length));
    };
    cabinTabs = tabList('fare-comparison-cabins', group.cabins.map((c) => c.name), (i) => {
      state.cabin = i;
      state.chosen = [];
      render();
    });
    cabinTabs.tabs.forEach((t) => t.setAttribute('aria-controls', body.id));
    compare.addEventListener('click', () => open(group, state.chosen, (chosen) => {
      state.chosen = chosen;
      render();
    }));
    panel.append(cabinTabs.list, body);
    render();
    return panel;
  });

  const pills = tabList('fare-comparison-groups', groups.map((g) => g.title), (i) => {
    hideTip();
    panels.forEach((p, j) => { p.hidden = j !== i; });
    pills.select(i);
  });
  pills.tabs.forEach((tab, i) => {
    tab.id = `${uid}-pill-${i}`;
    tab.setAttribute('aria-controls', panels[i].id);
    panels[i].setAttribute('aria-labelledby', tab.id);
  });
  panels.forEach((p, i) => { p.hidden = i !== 0; });
  pills.select(0);
  block.replaceChildren(pills.list, ...panels, dialog);
}
