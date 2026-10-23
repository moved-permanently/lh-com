import { getLocale } from '../../scripts/locale.js';
import { toConfigKey, cleanText, resolveLabels } from '../../scripts/block-config.js';

/* ---------------------------------------------------------------------------------------------
 * "Flightplan" of the AirCore route pages (h2#flightplan-section + .fp.flight-table-wrapper):
 * outbound / return tabs with a moving underline, per flight departure and arrival (time and
 * airport), operator, duration, flight number and the seven weekdays (plane = operates,
 * "-" = not), the first rows visible and "Show more" for the rest, a disclaimer under each
 * panel. Frozen at import as authored rows: "Tab | Frankfurt → London" starts a direction,
 * flight rows have 6 cells Departure | Arrival | Flight | Duration | Operated by | Days.
 * ------------------------------------------------------------------------------------------- */

const DEFAULT_LABELS = {
  en: {
    weekdays: 'Mo, Tu, We, Th, Fr, Sa, Su',
    'duration label': 'Flight duration:',
    'operated by label': 'Operated by:',
    'show more label': 'Show more',
    'show less label': 'Show less',
    'flight day label': 'flight',
    'no flight label': 'no flight',
    disclaimer: 'Please note that the flight schedule changes regularly.',
    'tabs label': 'Flightplan',
  },
  de: {
    weekdays: 'Mo, Di, Mi, Do, Fr, Sa, So',
    'duration label': 'Flugdauer:',
    'operated by label': 'Durchgeführt von:',
    'show more label': 'Mehr anzeigen',
    'show less label': 'Weniger anzeigen',
    'flight day label': 'Flug',
    'no flight label': 'kein Flug',
    disclaimer: 'Bitte beachten Sie, dass sich der Flugplan regelmäßig ändert.',
    'tabs label': 'Flugplan',
  },
};
const CONFIG_KEYS = ['visible-rows', ...Object.keys(DEFAULT_LABELS.en).map(toConfigKey)];
const DEFAULT_VISIBLE = 6;
/** Weekday abbreviations understood in a Days cell besides the authored Weekdays row. */
const KNOWN_DAYS = [
  ['mo', 'mon', 'monday', 'montag'], ['tu', 'di', 'tue', 'tuesday', 'dienstag'],
  ['we', 'mi', 'wed', 'wednesday', 'mittwoch'], ['th', 'do', 'thu', 'thursday', 'donnerstag'],
  ['fr', 'fri', 'friday', 'freitag'], ['sa', 'sat', 'saturday', 'samstag'],
  ['su', 'so', 'sun', 'sunday', 'sonntag'],
];

let instanceCount = 0;

const split = (text) => String(text || '').split(/\s*[,;]\s*|\s+/).map((d) => d.trim()).filter(Boolean);

/** "10:55 FRA" or "10:55<br>FRA" → { time, airport } */
function timePlace(cell) {
  const text = cleanText(cell);
  const m = text.match(/(\d{1,2}:\d{2})\s*([A-Z]{3})?/);
  return m ? { time: m[1], airport: m[2] || '' } : { time: text, airport: '' };
}

/**
 * Reads the rows: options (2 cells, known key), tabs (Tab | label) and flights (≥ 5 cells).
 * @returns {{config: Object, tabs: Array<{label: string, flights: Array}>}}
 */
export function readFlightplan(block, weekdayLabels) {
  const config = {};
  const tabs = [];
  const flightRows = [];
  [...block.children].forEach((row) => {
    const cells = [...row.children];
    const first = cleanText(cells[0]);
    const key = toConfigKey(first);
    if (cells.length === 2 && key === 'tab') {
      tabs.push({ label: cleanText(cells[1]), flights: [] });
      return;
    }
    if (cells.length === 2 && CONFIG_KEYS.includes(key)) {
      if (!config[key]) config[key] = { text: cleanText(cells[1]) };
      return;
    }
    if (cells.length < 5) return;
    flightRows.push([cells, tabs.length]);
  });
  const days = (config.weekdays ? split(config.weekdays.text) : weekdayLabels)
    .map((d) => d.toLowerCase());
  const dayIndex = (word) => {
    const w = word.toLowerCase().replace(/\.$/, '');
    const i = days.indexOf(w);
    return i >= 0 ? i : KNOWN_DAYS.findIndex((names) => names.includes(w));
  };
  // flights before the first Tab row form an unnamed first tab
  const leading = { label: '', flights: [] };
  flightRows.forEach(([cells, tabCount]) => {
    const [dep, arr, flight, duration, operated, daysCell] = cells;
    const operates = new Array(7).fill(false);
    split(cleanText(daysCell)).forEach((word) => {
      const i = dayIndex(word);
      if (i >= 0 && i < 7) operates[i] = true;
    });
    (tabCount ? tabs[tabCount - 1] : leading).flights.push({
      departure: timePlace(dep),
      arrival: timePlace(arr),
      flight: cleanText(flight),
      duration: cleanText(duration),
      operatedBy: cleanText(operated),
      operates,
    });
  });
  return { config, tabs: [leading, ...tabs].filter((t) => t.flights.length) };
}

function el(tag, className, content) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (content !== undefined && content !== '') node.append(content);
  return node;
}

const plane = (className = '') => {
  const icon = el('span', `table-flightplan-plane ${className}`.trim());
  icon.setAttribute('aria-hidden', 'true');
  return icon;
};

/** Tab label "Frankfurt → London" as origin, plane, destination. */
function tabContent(label) {
  const parts = label.split(/\s*(?:→|->|–|—|\s-\s)\s*/).filter(Boolean);
  if (parts.length !== 2) return [el('span', '', label)];
  const sr = el('span', 'table-flightplan-sr-only', ' – ');
  return [el('span', '', parts[0]), plane('table-flightplan-plane-tab'), sr, el('span', '', parts[1])];
}

function buildRow(f, labels, weekdays, today) {
  const row = el('li', 'table-flightplan-row');
  const place = (p) => {
    const box = el('div', 'table-flightplan-place');
    box.append(el('span', 'table-flightplan-time', p.time), el('span', 'table-flightplan-airport', p.airport));
    return box;
  };
  const times = el('div', 'table-flightplan-times');
  times.append(place(f.departure), plane('table-flightplan-plane-times'), place(f.arrival));
  const main = el('div', 'table-flightplan-cell table-flightplan-route');
  main.append(times);
  if (f.operatedBy) main.append(el('div', 'table-flightplan-operated', `${labels['operated by label']} ${f.operatedBy}`));
  const info = el('div', 'table-flightplan-cell table-flightplan-info');
  info.append(
    el('div', 'table-flightplan-duration', f.duration ? `${labels['duration label']} ${f.duration}` : ''),
    el('div', 'table-flightplan-number', f.flight),
  );
  const schedule = el('div', 'table-flightplan-cell table-flightplan-schedule');
  const list = el('ul', 'table-flightplan-days');
  weekdays.forEach((day, i) => {
    const item = el('li', `table-flightplan-day${i === today ? ' today' : ''}`);
    item.setAttribute('aria-label', `${day}: ${f.operates[i] ? labels['flight day label'] : labels['no flight label']}`);
    const name = el('span', 'table-flightplan-day-name', day);
    name.setAttribute('aria-hidden', 'true');
    const mark = f.operates[i] ? plane('table-flightplan-plane-day') : el('span', 'table-flightplan-none', '-');
    mark.setAttribute('aria-hidden', 'true');
    item.append(name, mark);
    list.append(item);
  });
  schedule.append(list);
  row.append(main, info, schedule);
  return row;
}

/**
 * Flight plan with outbound / return tabs from frozen rows.
 * @param {Element} block
 */
export default function decorate(block) {
  instanceCount += 1;
  const { lang } = getLocale();
  const defaults = resolveLabels(DEFAULT_LABELS, {}, lang);
  const { config, tabs } = readFlightplan(block, split(defaults.weekdays));
  const labels = resolveLabels(DEFAULT_LABELS, config, lang);
  const weekdays = split(labels.weekdays).slice(0, 7);
  while (weekdays.length < 7) weekdays.push(split(defaults.weekdays)[weekdays.length]);
  const parsed = parseInt((config['visible-rows'] || {}).text, 10);
  const visible = Number.isNaN(parsed) || parsed < 1 ? DEFAULT_VISIBLE : parsed;
  // Monday first: Date#getDay() is 0 on Sunday
  const today = (new Date().getDay() + 6) % 7;
  const base = `table-flightplan-${instanceCount}`;

  const nav = el('div', 'table-flightplan-nav');
  const tablist = el('div', 'table-flightplan-tablist');
  tablist.setAttribute('role', 'tablist');
  tablist.setAttribute('aria-label', labels['tabs label']);
  const bar = el('span', 'table-flightplan-bar');
  bar.setAttribute('aria-hidden', 'true');
  nav.append(tablist, bar);

  const buttons = [];
  const panels = tabs.map((tab, t) => {
    const button = el('button', 'table-flightplan-tab');
    button.type = 'button';
    button.id = `${base}-tab-${t}`;
    button.setAttribute('role', 'tab');
    button.setAttribute('aria-controls', `${base}-panel-${t}`);
    button.append(...tabContent(tab.label));
    tablist.append(button);
    buttons.push(button);

    const panel = el('div', 'table-flightplan-panel');
    panel.id = `${base}-panel-${t}`;
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', button.id);
    const list = el('ul', 'table-flightplan-rows');
    list.id = `${base}-rows-${t}`;
    const rows = tab.flights.map((f) => buildRow(f, labels, weekdays, today));
    rows.forEach((r, i) => { if (i >= visible) r.hidden = true; });
    list.append(...rows);
    panel.append(list);
    if (labels.disclaimer) panel.append(el('p', 'table-flightplan-disclaimer', labels.disclaimer));
    if (rows.length > visible) {
      const toggle = el('button', 'table-flightplan-toggle', labels['show more label']);
      toggle.type = 'button';
      toggle.setAttribute('aria-controls', list.id);
      toggle.setAttribute('aria-expanded', 'false');
      toggle.addEventListener('click', () => {
        const open = toggle.getAttribute('aria-expanded') !== 'true';
        rows.forEach((r, i) => { if (i >= visible) r.hidden = !open; });
        toggle.setAttribute('aria-expanded', String(open));
        toggle.textContent = open ? labels['show less label'] : labels['show more label'];
        if (open) {
          const first = rows[visible];
          if (first && typeof first.scrollIntoView === 'function') first.scrollIntoView({ block: 'nearest' });
        }
      });
      panel.append(toggle);
    }
    return panel;
  });

  const moveBar = (button) => {
    if (!button || typeof button.offsetLeft !== 'number') return;
    // top as well: below 768px the tabs wrap onto two lines (live: moving-bar top 48px)
    const top = button.offsetTop + button.offsetHeight;
    bar.setAttribute('style', `left:${button.offsetLeft}px;top:${top}px;width:${button.offsetWidth}px`);
  };
  const select = (index, focus) => {
    buttons.forEach((b, i) => {
      const on = i === index;
      b.setAttribute('aria-selected', String(on));
      b.tabIndex = on ? 0 : -1;
      b.classList.toggle('active', on);
      panels[i].hidden = !on;
    });
    if (focus) buttons[index].focus();
    moveBar(buttons[index]);
  };
  buttons.forEach((b, i) => {
    b.addEventListener('click', () => select(i, false));
    b.addEventListener('keydown', (e) => {
      const keys = {
        ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: buttons.length - 1,
      };
      if (!(e.key in keys)) return;
      e.preventDefault();
      select((keys[e.key] + buttons.length) % buttons.length, true);
    });
  });

  const showNav = buttons.length > 1 || Boolean(tabs[0] && tabs[0].label);
  block.replaceChildren(...(showNav ? [nav] : []), ...panels);
  if (!panels.length) return;
  select(0, false);
  if (typeof window.ResizeObserver === 'function') {
    new window.ResizeObserver(() => moveBar(buttons.find((b) => b.classList.contains('active'))))
      .observe(tablist);
  }
}
