// Sweepstakes: entries per sweepstake for one airline, CSV export, delete all entries of one.
import {
  api, busy, h, saveBlob, setStatus, start, table,
} from '../shared/admin.js';
import { filenameFromDisposition } from '../shared/helpers.js';

const content = document.getElementById('content');

function confirmDelete(tenant, id, onDone) {
  const form = h(
    'form',
    { class: 'admin-form' },
    h('p', { class: 'wide' }, `This deletes every entry of sweepstake ${id} (${tenant}) for good. `
      + 'Export them first if you still need them. Type the sweepstake ID to confirm.'),
    h('label', {}, 'Sweepstake ID', h('input', {
      type: 'text', name: 'confirm', required: true, autocomplete: 'off',
    })),
    h(
      'div',
      { class: 'admin-actions wide' },
      h('button', { type: 'submit', class: 'danger' }, 'Delete all entries'),
      h('button', { type: 'button', class: 'secondary', onclick: () => onDone(false) }, 'Cancel'),
    ),
  );
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const typed = String(new FormData(form).get('confirm')).trim();
    if (typed !== id) {
      setStatus('The ID you typed does not match. Nothing was deleted.', 'warning');
      return;
    }
    busy(form.querySelector('button[type=submit]'), async () => {
      const q = new URLSearchParams({ tenant, confirm: typed });
      const r = await api(`/admin/sweepstakes/${encodeURIComponent(id)}?${q}`, { method: 'DELETE' });
      setStatus(`${r.deleted} entries of ${id} deleted.`, 'success');
      onDone(true);
    });
  });
  return form;
}

async function exportCsv(tenant, id) {
  const q = new URLSearchParams({ tenant });
  const res = await api(`/admin/sweepstakes/${encodeURIComponent(id)}/export.csv?${q}`, { raw: true });
  const name = filenameFromDisposition(res.headers.get('content-disposition'), `sweepstake-${id}.csv`);
  saveBlob(await res.blob(), name);
  const unreadable = Number(res.headers.get('x-undecryptable-entries') || 0);
  setStatus(unreadable
    ? `Downloaded ${name}. ${unreadable} entries could not be decrypted and are empty rows.`
    : `Downloaded ${name}.`, unreadable ? 'warning' : 'success');
}

async function load(tenant) {
  const out = document.getElementById('list');
  const answer = await api(`/admin/sweepstakes?${new URLSearchParams({ tenant })}`);
  const list = answer.sweepstakes || [];
  if (!list.length) {
    out.replaceChildren(h('p', { class: 'admin-note' }, `No sweepstake entries for ${answer.tenant}.`));
    return;
  }
  const panel = h('div', {});
  out.replaceChildren(table(['Sweepstake', 'Entries', ''], list.map((s) => [
    s.id,
    String(s.entries),
    h(
      'div',
      { class: 'admin-actions' },
      h('button', { type: 'button', class: 'secondary', onclick: (e) => busy(e.target, () => exportCsv(answer.tenant, s.id)) }, 'Export CSV'),
      h('button', {
        type: 'button',
        class: 'danger',
        onclick: () => panel.replaceChildren(confirmDelete(answer.tenant, s.id, async (deleted) => {
          panel.replaceChildren();
          if (deleted) await load(answer.tenant);
        })),
      }, 'Delete entries'),
    ),
  ]), { caption: `Airline ${answer.tenant}` }), panel);
}

(async function init() {
  const app = await start({ tool: 'sweepstakes' });
  if (!app) return;
  const own = app.tools.filter((t) => t.startsWith('sweepstakes:')).map((t) => t.split(':')[1]);
  const all = app.tools.includes('sweepstakes');
  const field = all || !own.length
    ? h('input', {
      type: 'text', name: 'tenant', required: true, pattern: '[A-Za-z0-9_]{2,10}', value: own[0] || 'LH',
    })
    : h('select', { name: 'tenant' }, own.map((t) => h('option', { value: t }, t)));
  const form = h(
    'form',
    { class: 'admin-form' },
    h('label', {}, 'Airline code', field),
    h('div', { class: 'admin-actions' }, h('button', { type: 'submit' }, 'Show sweepstakes')),
  );
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const tenant = String(new FormData(form).get('tenant')).trim().toUpperCase();
    busy(form.querySelector('button[type=submit]'), async () => {
      setStatus('');
      await load(tenant);
    });
  });
  content.append(form, h('div', { id: 'list' }));
}());
