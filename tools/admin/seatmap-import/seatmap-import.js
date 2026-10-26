// Seat map import: read the airline's Excel workbook in the browser, check it (dry run, nothing is
// written), then import exactly that workbook. The service lists every problem it finds.
import {
  SHEETJS_URL, api, busy, h, loadModule, setStatus, start, table,
} from '../shared/admin.js';
import { SEATMAP_MAX_BYTES, jsonBytes, workbookToImport } from '../shared/helpers.js';

const content = document.getElementById('content');
let body = null;
let dryRunToken = null;

function showAnswer(answer, isCheck) {
  const out = document.getElementById('result');
  const errors = answer.errors || [];
  const protocol = answer.protocol || [];
  out.replaceChildren(
    h('h2', {}, isCheck ? 'Check result' : 'Import result'),
    h('p', {}, answer.message || ''),
    answer.hint ? h('p', { class: 'admin-note' }, answer.hint) : null,
    errors.length ? h('ol', { class: 'admin-errors' }, errors.map((e) => h('li', {}, e))) : null,
    protocol.length
      ? table(['Document', 'Change'], protocol.map((p) => [p.fragmentPath, p.updateInfo]), { caption: isCheck ? 'What the import would change' : 'What changed' })
      : null,
    !isCheck && (answer.publish || []).length
      ? h('div', {}, h('h3', {}, 'Publish these documents'), h('ul', {}, answer.publish.map((p) => h('li', {}, p))))
      : null,
  );
}

async function readWorkbook(file, airline) {
  const XLSX = await loadModule(SHEETJS_URL);
  const wb = XLSX.read(await file.arrayBuffer(), { cellDates: false });
  const sheets = wb.SheetNames.map((name) => ({
    name,
    rows: XLSX.utils.sheet_to_json(wb.Sheets[name], {
      header: 1, raw: true, blankrows: true, defval: null,
    }),
  }));
  return workbookToImport(airline, sheets);
}

async function check(form) {
  const fd = new FormData(form);
  const file = fd.get('file');
  const airline = String(fd.get('airline') || '').trim().toUpperCase();
  if (!file || !file.name) {
    setStatus('Choose the Excel file first.', 'warning');
    return;
  }
  dryRunToken = null;
  document.getElementById('import').disabled = true;
  body = await readWorkbook(file, airline);
  const size = jsonBytes(body);
  if (size > SEATMAP_MAX_BYTES) {
    setStatus(`The workbook is too large for one import (${Math.round(size / 1024)} KB, at most ${SEATMAP_MAX_BYTES / 1024} KB).`, 'error');
    return;
  }
  const answer = await api('/admin/seatmap/import?dryRun=true', { method: 'POST', body });
  showAnswer(answer, true);
  const clean = answer.status === 'success' && !(answer.errors || []).length && answer.dryRunToken;
  dryRunToken = clean ? answer.dryRunToken : null;
  const changes = (answer.protocol || []).length;
  document.getElementById('import').disabled = !(clean && changes);
  if (!clean) setStatus('The workbook has errors. Fix them in Excel and check again.', 'error');
  else if (!changes) setStatus('The workbook matches the current data. There is nothing to import.', 'success');
  else setStatus(`Check passed: ${changes} documents would change. Import within 30 minutes.`, 'success');
}

async function runImport() {
  if (!body || !dryRunToken) return;
  // eslint-disable-next-line no-alert
  if (!window.confirm(`Import the seat maps of ${body.airline} now?`)) return;
  try {
    const answer = await api('/admin/seatmap/import', { method: 'POST', body: { ...body, dryRunToken } });
    showAnswer(answer, false);
    setStatus(answer.status === 'success' ? 'Import done.' : 'The import found errors.', answer.status === 'success' ? 'success' : 'error');
  } finally {
    dryRunToken = null;
    document.getElementById('import').disabled = true;
  }
}

(async function init() {
  const app = await start({ tool: 'seatmap' });
  if (!app) return;
  const form = h(
    'form',
    { class: 'admin-form' },
    h('label', {}, 'Airline code', h('input', {
      type: 'text', name: 'airline', required: true, pattern: '[A-Za-z0-9]{2,3}', maxlength: 3, autocomplete: 'off',
    })),
    h('label', {}, 'Excel workbook', h('input', {
      type: 'file', name: 'file', required: true, accept: '.xls,.xlsx',
    })),
    h(
      'div',
      { class: 'admin-actions wide' },
      h('button', { type: 'submit' }, 'Check workbook'),
      h('button', {
        type: 'button', id: 'import', disabled: true, onclick: (e) => busy(e.target, runImport),
      }, 'Import'),
    ),
  );
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    busy(form.querySelector('button[type=submit]'), () => check(form));
  });
  form.addEventListener('change', () => {
    dryRunToken = null;
    document.getElementById('import').disabled = true;
  });
  content.append(form, h('div', { id: 'result' }));
}());
