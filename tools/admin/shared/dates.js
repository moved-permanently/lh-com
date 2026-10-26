// Date inputs of the report apps: a default range and a small form.
import { h } from './admin.js';

const iso = (d) => d.toISOString().slice(0, 10);

/** From/to date fields with a default of the last `days` days (today included). */
export function rangeFields(days = 7) {
  const to = new Date();
  const from = new Date(to.getTime() - (days - 1) * 86400000);
  return [
    h('label', {}, 'From', h('input', {
      type: 'date', name: 'from', required: true, value: iso(from),
    })),
    h('label', {}, 'To', h('input', {
      type: 'date', name: 'to', required: true, value: iso(to),
    })),
  ];
}

/** ?from=&to= for the API from a form with rangeFields. */
export function rangeQuery(form) {
  const fd = new FormData(form);
  return new URLSearchParams({ from: String(fd.get('from') || ''), to: String(fd.get('to') || '') });
}
