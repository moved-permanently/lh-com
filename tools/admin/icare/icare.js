// Feedback incidents: find incidents and send one again (the service only re-sends incidents
// that were sent before; it answers which ones it reset).
import {
  api, busy, h, setStatus, start, table,
} from '../shared/admin.js';
import { rangeFields, rangeQuery } from '../shared/dates.js';

const content = document.getElementById('content');

const select = (name, values, empty) => h(
  'select',
  { name },
  h('option', { value: '' }, empty),
  (values || []).map((v) => h('option', { value: v }, v)),
);

function renderList(answer, refresh) {
  const incidents = answer.incidents || [];
  const out = document.getElementById('list');
  if (!incidents.length) {
    out.replaceChildren(h('p', { class: 'admin-note' }, 'No incidents found.'));
    return;
  }
  const rows = incidents.map((i) => [
    i.id, i.provider, i.providerId, i.type, i.status, i.created || '', i.sent || '',
    h('button', {
      type: 'button',
      class: 'secondary',
      onclick: (e) => busy(e.target, async () => {
        const r = await api(`/admin/icare/incidents/${encodeURIComponent(i.id)}/resend`, { method: 'POST' });
        setStatus(r.resend
          ? `Incident ${i.id} will be sent again (status now ${r.incident.status}).`
          : `Incident ${i.id} was not changed: only incidents that were sent can be sent again.`, r.resend ? 'success' : 'warning');
        await refresh();
      }),
    }, 'Send again'),
  ]);
  out.replaceChildren(
    answer.truncated ? h('p', { class: 'admin-note' }, `Only the newest ${answer.limit} incidents are shown. Narrow the search.`) : null,
    table(['Number', 'Provider', 'Provider ID', 'Type', 'Status', 'Created', 'Sent', ''], rows),
  );
}

function searchForm(title, fields, query) {
  let last = null;
  const form = h('form', { class: 'admin-form' }, h('h2', { class: 'wide' }, title), ...fields, h(
    'div',
    { class: 'admin-actions wide' },
    h('button', { type: 'submit' }, 'Search'),
  ));
  const run = async () => renderList(await api(`/admin/icare/incidents?${last}`), run);
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    last = query(form);
    busy(form.querySelector('button[type=submit]'), async () => {
      setStatus('');
      await run();
    });
  });
  return form;
}

(async function init() {
  const app = await start({ tool: 'icare' });
  if (!app) return;
  const opts = await busy(null, () => api('/admin/icare/options'));
  if (!opts) return;
  const fd = (form) => new FormData(form);
  content.append(
    searchForm('By incident number', [
      h('label', {}, 'Incident number', h('input', {
        type: 'text', name: 'id', required: true, inputmode: 'numeric', pattern: '[1-9][0-9]*',
      })),
    ], (form) => new URLSearchParams({ id: String(fd(form).get('id')).trim() })),
    searchForm('By provider reference', [
      h('label', {}, 'Provider', select('provider', opts.providers, 'Choose')),
      h('label', {}, 'Provider ID', h('input', {
        type: 'text', name: 'providerId', required: true, inputmode: 'numeric',
      })),
    ], (form) => new URLSearchParams({ provider: String(fd(form).get('provider')), providerId: String(fd(form).get('providerId')).trim() })),
    searchForm('By date', [
      ...rangeFields(7),
      h('label', {}, 'Status', select('status', opts.statuses, 'Any')),
      h('label', {}, 'Type', select('type', opts.types, 'Any')),
    ], (form) => {
      const q = rangeQuery(form);
      ['status', 'type'].forEach((k) => { if (fd(form).get(k)) q.set(k, String(fd(form).get(k))); });
      return q;
    }),
    h('div', { id: 'list' }),
  );
}()).catch((err) => setStatus(err.message, 'error'));
