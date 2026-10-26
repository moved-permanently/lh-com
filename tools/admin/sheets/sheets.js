// Admin data sheets (/data/admin/...): check a DA sheet against its schema, Excel export and
// import in the browser, save to DA, and the sync to the back office (manual sync, status,
// failures, retry). Editors still preview and publish the sheet in DA as usual.
import {
  SHEETJS_URL, api, busy, daSource, h, loadModule, openApi, saveBlob, setStatus, start, table,
} from '../shared/admin.js';
import {
  cellText, objectsToSheetRows, readDaSheet, sheetRowsToObjects, writeDaSheet,
} from '../shared/helpers.js';

const content = document.getElementById('content');
const state = {
  org: '', site: '', schemas: [], schema: null, existing: null, sheetName: 'data', data: null, columns: [], valid: false,
};

const fileName = (path) => `${path.split('/').filter(Boolean).slice(2).join('-') || 'sheet'}.xlsx`;
const columnText = (c) => [
  c.type,
  c.length ? `max ${c.length}` : '',
  c.mandatory ? 'required' : '',
  c.unique ? 'unique' : '',
  c.readOnly ? 'filled by the system' : '',
  Array.isArray(c.values) ? `one of: ${c.values.join(', ')}` : '',
].filter(Boolean).join(', ');

function showSchema() {
  const s = state.schema;
  const out = document.getElementById('schema');
  if (!s) { out.replaceChildren(); return; }
  out.replaceChildren(
    h('p', {}, `${s.title || s.path}: ${s.writeMode === 'replace' ? 'the sheet replaces the whole list' : 'rows are added or updated; rows missing from the sheet stay'}.`),
    table(['Column', 'Rules'], (s.columns || []).map((c) => [c.name, columnText(c)])),
  );
}

function showResult(result) {
  const out = document.getElementById('result');
  const problems = [...(result.errors || []).map((e) => ({ ...e, level: 'error' })),
    ...(result.warnings || []).map((e) => ({ ...e, level: 'warning' }))];
  const where = (p) => [p.row ? `row ${p.row}` : 'sheet', p.column ? `column ${p.column}` : ''].filter(Boolean).join(', ');
  out.replaceChildren(
    h('p', {}, result.valid
      ? `The sheet is valid: ${result.count} rows.`
      : `The sheet has ${(result.errors || []).length} errors. Fix them before saving.`),
    result.truncated ? h('p', { class: 'admin-note' }, 'Only the first problems are listed.') : '',
    problems.length ? h('ul', { class: 'admin-errors' }, problems.map((p) => h('li', { class: p.level }, `${where(p)}: ${p.message}`))) : '',
  );
  setStatus(result.valid ? 'Check passed.' : 'Check found errors.', result.valid ? 'success' : 'error');
}

async function check() {
  if (!state.schema || !state.data) {
    setStatus('Load the sheet from DA or import an Excel file first.', 'warning');
    return;
  }
  const result = await openApi('/admin-sync/validate', {
    method: 'POST', body: { path: state.schema.path, data: state.data, columns: state.columns },
  });
  state.valid = Boolean(result.valid);
  document.getElementById('save').disabled = !state.valid || !state.imported;
  showResult(result);
}

function showData(source) {
  document.getElementById('data').replaceChildren(h('p', {}, `${source}: ${state.data.length} rows, columns ${state.columns.join(', ') || 'none'}.`));
}

async function loadFromDa() {
  state.imported = false;
  document.getElementById('save').disabled = true;
  const res = await daSource(state.org, state.site, `${state.schema.path}.json`);
  state.loaded = res.ok || res.status === 404;
  if (res.status === 404) {
    state.existing = null;
    state.data = [];
    state.columns = [];
    setStatus('There is no sheet at this path in DA yet. Import an Excel file to create it.', 'warning');
    showData('DA');
    return;
  }
  if (res.status === 401 || res.status === 403) throw new Error('DA did not allow reading this sheet with your account.');
  if (!res.ok) throw new Error(`DA answered with status ${res.status}.`);
  state.existing = await res.json();
  const sheet = readDaSheet(state.existing);
  state.sheetName = sheet.name || 'data';
  state.data = sheet.data;
  state.columns = sheet.columns;
  showData(`DA sheet "${state.sheetName}"`);
  await check();
}

async function exportExcel() {
  if (!state.data) await loadFromDa();
  const XLSX = await loadModule(SHEETJS_URL);
  const schemaColumns = (state.schema.columns || []).map((c) => c.name);
  const columns = state.columns.length ? state.columns : schemaColumns;
  const ws = XLSX.utils.aoa_to_sheet(objectsToSheetRows(state.data, columns));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, state.sheetName.slice(0, 31));
  const bytes = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const name = fileName(state.schema.path);
  saveBlob(new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), name);
  setStatus(`Downloaded ${name}.`, 'success');
}

async function importExcel(file) {
  const XLSX = await loadModule(SHEETJS_URL);
  const wb = XLSX.read(await file.arrayBuffer(), { cellDates: true });
  const name = wb.SheetNames.includes(state.sheetName) ? state.sheetName : wb.SheetNames[0];
  const rows = XLSX.utils.sheet_to_json(wb.Sheets[name], {
    header: 1, raw: true, blankrows: false, defval: '',
  }).map((r) => r.map(cellText));
  state.data = sheetRowsToObjects(rows);
  state.columns = rows.length ? rows[0].map((c) => String(c).trim()).filter(Boolean) : [];
  state.imported = true;
  if (!state.loaded) {
    // keep other sheets of the DA document: read it first if it exists
    const res = await daSource(state.org, state.site, `${state.schema.path}.json`);
    state.existing = res.ok ? await res.json() : null;
    state.loaded = true;
  }
  showData(`Excel file ${file.name}, sheet "${name}"`);
  await check();
}

async function saveToDa() {
  if (!state.valid || !state.imported) return;
  // eslint-disable-next-line no-alert
  if (!window.confirm(`Replace the DA sheet ${state.schema.path} with the ${state.data.length} rows of the Excel file?`)) return;
  const json = writeDaSheet(state.existing, state.sheetName, state.data);
  const form = new FormData();
  form.append('data', new Blob([JSON.stringify(json)], { type: 'application/json' }));
  const res = await daSource(state.org, state.site, `${state.schema.path}.json`, { method: 'POST', body: form });
  if (!res.ok) throw new Error(`DA did not save the sheet (status ${res.status}).`);
  state.existing = json;
  state.imported = false;
  document.getElementById('save').disabled = true;
  setStatus('Saved in DA. Preview the sheet in DA to send it as work data; publish it to send it live.', 'success');
}

// --- sync ---

const time = (ms) => (ms ? new Date(ms).toLocaleString() : '');

function jobsTable(jobs, withRetry, refresh) {
  return table(['Path', 'Action', 'State', 'Result', 'Tries', 'Last error', 'Updated', ''], jobs.map((j) => [
    j.path, j.action, j.state, j.outcome || '', String(j.attempts ?? 0), j.lastError || '', time(j.updatedAt),
    withRetry && ['dead', 'rejected'].includes(j.state) ? h('button', {
      type: 'button',
      class: 'secondary',
      onclick: (e) => busy(e.target, async () => {
        const r = await api('/admin/admin-sync/retry', { method: 'POST', body: { id: j.id } });
        setStatus(`${r.requeued} job sent again.`, 'success');
        await refresh();
      }),
    }, 'Retry') : '',
  ]));
}

async function showSync() {
  const out = document.getElementById('sync-status');
  const [status, failures] = await Promise.all([api('/admin/admin-sync/status'), api('/admin/admin-sync/failures')]);
  const counts = Object.entries(status.counts || {});
  const failed = failures.failures || [];
  out.replaceChildren(
    h('p', {}, `Jobs: ${counts.map(([k, v]) => `${k} ${v}`).join(', ') || 'none'}.`
      + `${status.persistent ? '' : ' (The job list is kept in memory only.)'}`),
    status.recent?.length ? jobsTable(status.recent, false) : '',
    h('h3', {}, 'Data written'),
    status.datasets?.length
      ? table(['Path', 'Stage', 'Version', 'Written', 'Unpublished'], status.datasets.map((d) => [
        d.path, d.stage, (d.version || '').slice(0, 12), time(d.writtenAt), time(d.unpublishedAt),
      ]))
      : h('p', { class: 'admin-note' }, 'Nothing written yet.'),
    Object.keys(status.releaseStates || {}).length
      ? table(['List', 'Release'], Object.entries(status.releaseStates)) : '',
    h('h3', {}, `Failed jobs (${failed.length})`),
    failed.length ? h('div', {}, jobsTable(failed, true, showSync), h('button', {
      type: 'button',
      class: 'secondary',
      onclick: (e) => busy(e.target, async () => {
        const r = await api('/admin/admin-sync/retry', { method: 'POST', body: { state: 'dead' } });
        setStatus(`${r.requeued} jobs sent again.`, 'success');
        await showSync();
      }),
    }, 'Retry all dead jobs'), failed.filter((f) => f.errors?.length).map((f) => h(
      'details',
      {},
      h('summary', {}, `${f.path}: ${f.errors.length} problems`),
      h('ul', { class: 'admin-errors' }, f.errors.map((e) => h('li', {}, `${e.row ? `row ${e.row}` : 'sheet'}${e.column ? `, column ${e.column}` : ''}: ${e.message}`))),
    ))) : h('p', { class: 'admin-note' }, 'No failed jobs.'),
  );
}

async function syncNow(action) {
  const r = await api('/admin/admin-sync/sync', { method: 'POST', body: { path: state.schema.path, action } });
  const job = r.jobs?.[0] || {};
  setStatus(job.state === 'duplicate' ? 'This change was already sent.' : `Sync ${action} sent (${job.state || 'queued'}).`, 'success');
  await showSync();
}

(async function init() {
  const app = await start({ tool: null });
  if (!app) return;
  state.org = app.context.org;
  state.site = app.context.repo || app.context.site;
  const answer = await busy(null, () => openApi('/admin-sync/schemas'));
  if (!answer) return;
  state.schemas = (answer.schemas || []).sort((a, b) => a.path.localeCompare(b.path));
  const select = h('select', { name: 'path' }, state.schemas.map((s) => h('option', { value: s.path }, s.title ? `${s.path} (${s.title})` : s.path)));
  const pick = () => {
    state.schema = state.schemas.find((s) => s.path === select.value) || null;
    Object.assign(state, {
      existing: null, data: null, columns: [], valid: false, imported: false, loaded: false, sheetName: 'data',
    });
    document.getElementById('data').replaceChildren();
    document.getElementById('result').replaceChildren();
    document.getElementById('save').disabled = true;
    showSchema();
  };
  select.addEventListener('change', pick);
  const file = h('input', { type: 'file', accept: '.xlsx,.xls,.csv', hidden: true });
  file.addEventListener('change', () => {
    if (file.files[0]) busy(null, () => importExcel(file.files[0]));
    file.value = '';
  });
  const canSync = app.tools.includes('admin-sync');
  content.append(
    h('div', { class: 'admin-form' }, h('label', { class: 'wide' }, 'Sheet', select)),
    h(
      'div',
      { class: 'admin-actions' },
      h('button', { type: 'button', onclick: (e) => busy(e.target, loadFromDa) }, 'Load from DA and check'),
      h('button', { type: 'button', class: 'secondary', onclick: (e) => busy(e.target, exportExcel) }, 'Download Excel'),
      h('button', { type: 'button', class: 'secondary', onclick: () => file.click() }, 'Import Excel'),
      h('button', {
        type: 'button', id: 'save', disabled: true, onclick: (e) => busy(e.target, saveToDa),
      }, 'Save to DA'),
      file,
    ),
    h('div', { id: 'data' }),
    h('div', { id: 'result' }),
    h('details', {}, h('summary', {}, 'Columns and rules'), h('div', { id: 'schema' })),
    canSync ? h(
      'section',
      {},
      h('h2', {}, 'Sync to the back office'),
      h('p', { class: 'admin-note' }, 'Previewing or publishing the sheet in DA starts the sync. Use these buttons when that did not happen.'),
      h(
        'div',
        { class: 'admin-actions' },
        h('button', { type: 'button', class: 'secondary', onclick: (e) => busy(e.target, () => syncNow('preview')) }, 'Sync preview now'),
        h('button', { type: 'button', class: 'secondary', onclick: (e) => busy(e.target, () => syncNow('publish')) }, 'Sync published sheet now'),
        h('button', { type: 'button', class: 'secondary', onclick: (e) => busy(e.target, showSync) }, 'Refresh status'),
      ),
      h('div', { id: 'sync-status' }),
    ) : h('p', { class: 'admin-note' }, 'Your account cannot start the sync or see its status.'),
  );
  pick();
  if (canSync) await busy(null, showSync);
}());
