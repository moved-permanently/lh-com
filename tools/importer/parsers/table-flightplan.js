/* eslint-disable */
/* global WebImporter */

/**
 * Parser for table-flightplan: the "Flightplan" of the AirCore route pages
 * (`.column.event` with `h2#flightplan-section` + `.fp.flight-table-wrapper`,
 * blocks/table-flightplan README "Import").
 *
 * Table structure (EDS table convention: the first row holds only the block name, written by
 * createBlock; every further row is one row of the table, no header row; the block's own rows
 * as in its README):
 *   - `Tab | Frankfurt → New York` starts each direction (per `.fp-nav .fp-nav-element`, its
 *     panel by aria-controls)
 *   - one data row per `.fp-row` of that panel, 6 cells:
 *     Departure (10:55 FRA) | Arrival (13:35 JFK) | Flight (LH400) | Duration (08:40) |
 *     Operated by (UA, else empty) | Days (We, Th, Fr, Sa: the weekdays with a plane icon)
 *   - 2-cell label rows only where the page differs from the block defaults: Visible rows,
 *     Weekdays, Duration label, Operated by label, Show more / Show less label, Disclaimer
 * `h2#flightplan-section` stays a default-content h2 before the block (EDS gives it the id
 * `flightplan`, the target of the info cards' "Flights per week" links). The rendered UI
 * (moving bar, read-more toggle, icons, row aria-labels) is not written.
 */
const DEFAULTS = {
  en: {
    weekdays: 'Mo, Tu, We, Th, Fr, Sa, Su', duration: 'Flight duration:', operated: 'Operated by:',
    more: 'Show more', less: 'Show less', disclaimer: 'Please note that the flight schedule changes regularly.',
  },
  de: {
    weekdays: 'Mo, Di, Mi, Do, Fr, Sa, So', duration: 'Flugdauer:', operated: 'Durchgeführt von:',
    more: 'Mehr anzeigen', less: 'Weniger anzeigen', disclaimer: 'Bitte beachten Sie, dass sich der Flugplan regelmäßig ändert.',
  },
};

export default function parse(element, { document, params, url }) {
  const wrapper = element.matches('.fp.flight-table-wrapper') ? element : element.querySelector('.fp.flight-table-wrapper');
  if (!wrapper) return;
  const clean = (s) => String(s || '').replace(/[\u200B-\u200D\uFEFF]/g, '').replace(/\u00A0/g, ' ').replace(/\s+/g, ' ').trim();
  const text = (n) => (n ? clean(n.textContent) : '');
  let lang = 'en';
  try {
    const m = new URL((params && params.originalURL) || url).pathname.match(/^\/(?:lhg\/)?[a-z]{2}\/([a-z]{2})\//);
    if (m && DEFAULTS[m[1]]) lang = m[1];
  } catch (e) { /* default */ }
  const def = DEFAULTS[lang];

  const rows = [];
  let durationLabel = '';
  let operatedLabel = '';
  let weekdays = [];

  /** Text of the nodes before and after the plane icon of a tab (spans are unwrapped). */
  const tabLabel = (li) => {
    const parts = [[]];
    li.childNodes.forEach((n) => {
      if (n.nodeType === 1 && n.matches('.lh, [class*="lh-airplane"]')) parts.push([]);
      else parts[parts.length - 1].push(n.textContent);
    });
    const texts = parts.map((p) => clean(p.join(' '))).filter(Boolean);
    return texts.length >= 2 ? `${texts[0]} → ${texts[texts.length - 1]}` : (texts[0] || '');
  };

  const flightRow = (row) => {
    const times = row.querySelector('.times');
    const ends = times ? [...times.children].filter((c) => !c.matches('.icon')) : [];
    const dep = text(ends[0]);
    const arr = text(ends[ends.length - 1]);
    const info = row.querySelector('.flight-info > div') || row.querySelector('.flight-info');
    const infoParts = info ? [...info.children] : [];
    const durText = text(infoParts[0]);
    const dm = durText.match(/^(.*?:)\s*(\d{1,2}:\d{2}.*)$/);
    if (dm && !durationLabel) durationLabel = clean(dm[1]);
    const duration = dm ? clean(dm[2]) : durText;
    const flight = text(infoParts[infoParts.length - 1]);
    const opText = text(row.querySelector('.operated'));
    const om = opText.match(/^(.*?:)\s*(.*)$/);
    if (om && !operatedLabel) operatedLabel = clean(om[1]);
    const operated = om ? clean(om[2]) : opText;
    const items = [...row.querySelectorAll('.flight-schedule > div > div')];
    const labelOf = (item) => {
      const day = item.querySelector('[data-weekday]');
      if (day) return text(day);
      const c = item.cloneNode(true);
      c.querySelectorAll('.lh').forEach((n) => n.remove());
      return clean(c.textContent.replace(/(^|\s)-(\s|$)/g, ' '));
    };
    if (!weekdays.length) weekdays = items.map(labelOf).filter(Boolean);
    const days = items.filter((item) => item.querySelector('.lh-airplane-outbound, [class*="lh-airplane"]')).map(labelOf).filter(Boolean);
    if (!dep && !arr && !flight) return null;
    return [dep, arr, flight, duration, operated, days.join(', ')];
  };

  const tabs = [...wrapper.querySelectorAll('.fp-nav .fp-nav-element')];
  const panels = [...wrapper.querySelectorAll('.fp-tab')];
  if (tabs.length) {
    tabs.forEach((li, i) => {
      const id = li.getAttribute('aria-controls') || li.getAttribute('data-target');
      const panel = (id && wrapper.querySelector(`#${id}`)) || panels[i];
      rows.push(['Tab', tabLabel(li)]);
      if (panel) panel.querySelectorAll('.fp-row').forEach((r) => { const cells = flightRow(r); if (cells) rows.push(cells); });
    });
  } else {
    wrapper.querySelectorAll('.fp-row').forEach((r) => { const cells = flightRow(r); if (cells) rows.push(cells); });
  }

  const readMore = wrapper.querySelector('.read-more[data-visible-count]');
  const visible = readMore ? clean(readMore.getAttribute('data-visible-count')) : '';
  if (visible && visible !== '6') rows.push(['Visible rows', visible]);
  if (weekdays.length === 7 && weekdays.join(', ') !== def.weekdays) rows.push(['Weekdays', weekdays.join(', ')]);
  if (durationLabel && durationLabel !== def.duration) rows.push(['Duration label', durationLabel]);
  if (operatedLabel && operatedLabel !== def.operated) rows.push(['Operated by label', operatedLabel]);
  const more = text(wrapper.querySelector('.toggle-more'));
  const less = text(wrapper.querySelector('.toggle-less'));
  if (more && more !== def.more) rows.push(['Show more label', more]);
  if (less && less !== def.less) rows.push(['Show less label', less]);
  const disclaimer = text(wrapper.querySelector('.fp-disclaimer'));
  if (disclaimer && disclaimer !== def.disclaimer) rows.push(['Disclaimer', disclaimer]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'table-flightplan', cells: rows });
  const out = [];
  const heading = element.querySelector('h2#flightplan-section, h2');
  if (heading && element !== wrapper && !wrapper.contains(heading)) {
    const h2 = document.createElement('h2');
    h2.textContent = text(heading);
    out.push(h2);
  }
  out.push(block);
  element.replaceWith(...out);
}
