// Good for Train report: counts for a date range, CSV downloads of the traces and backend errors.
import {
  api, busy, h, saveBlob, setStatus, start, table,
} from '../shared/admin.js';
import { rangeFields, rangeQuery } from '../shared/dates.js';
import { countRows, filenameFromDisposition } from '../shared/helpers.js';

const content = document.getElementById('content');

const LABELS = {
  byStatus: 'By status',
  bySource: 'By source',
  byPassengerType: 'By passenger type',
  byTrainClass: 'By train class',
  byDay: 'By day',
};

function renderReport(report) {
  const out = document.getElementById('report');
  const t = report.tracing || {};
  const parts = [
    h('h2', {}, `Report ${report.from} to ${report.to}`),
    h('p', {}, `Traces: ${t.total ?? 0}. Vouchers generated: ${t.generatedVouchers ?? 0}. `
      + `Backend errors: ${report.backendErrors?.total ?? 0}.`),
  ];
  Object.entries(LABELS).forEach(([key, label]) => {
    const rows = key === 'byDay'
      ? Object.entries(t.byDay || {}).sort((a, b) => a[0].localeCompare(b[0]))
      : countRows(t[key]);
    if (rows.length) parts.push(table([label, 'Count'], rows));
  });
  const items = report.backendErrors?.items || [];
  if (items.length) {
    const rows = items.map((e) => [e.date, e.callId, e.error ?? '']);
    parts.push(table(['Date', 'Call ID', 'Error'], rows, { caption: 'Backend errors' }));
  }
  out.replaceChildren(...parts);
}

async function download(path, query, fallback) {
  const res = await api(`${path}?${query}`, { raw: true });
  const name = filenameFromDisposition(res.headers.get('content-disposition'), fallback);
  saveBlob(await res.blob(), name);
  setStatus(`Downloaded ${name}.`, 'success');
}

(async function init() {
  const app = await start({ tool: 'g4t' });
  if (!app) return;
  const form = h(
    'form',
    { class: 'admin-form' },
    ...rangeFields(7),
    h(
      'div',
      { class: 'admin-actions wide' },
      h('button', { type: 'submit' }, 'Show report'),
      h('button', {
        type: 'button',
        class: 'secondary',
        onclick: (e) => busy(e.target, () => download('/admin/g4t/export.csv', rangeQuery(form), 'good-for-train-report.csv')),
      }, 'Download traces (CSV)'),
      h('button', {
        type: 'button',
        class: 'secondary',
        onclick: (e) => busy(e.target, () => download('/admin/g4t/backend-errors.csv', rangeQuery(form), 'backend-errors.csv')),
      }, 'Download backend errors (CSV)'),
    ),
  );
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    busy(form.querySelector('button[type=submit]'), async () => {
      setStatus('');
      renderReport(await api(`/admin/g4t/report?${rangeQuery(form)}`));
    });
  });
  content.append(form, h('div', { id: 'report' }));
}());
