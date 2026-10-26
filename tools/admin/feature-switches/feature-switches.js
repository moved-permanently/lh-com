// Feature switches: which airline and market each switch is on for. One line per rule:
// "<airline or ALL> <market or ALL>", e.g. "LH DE" or "ALL ALL". No lines = off everywhere.
import {
  api, busy, h, setStatus, start, table,
} from '../shared/admin.js';
import { rowsToText, textToRows } from '../shared/helpers.js';

const content = document.getElementById('content');
let render;

function editor(sw, onDone) {
  const area = h('textarea', { name: 'rows', rows: Math.max(4, (sw.rows || []).length + 2), spellcheck: 'false' }, rowsToText(sw.rows));
  const form = h(
    'form',
    { class: 'admin-form' },
    h('p', { class: 'wide' }, `Rules for ${sw.id}: one per line, airline code (or ALL) and two-letter market (or ALL). `
      + 'Leave empty to switch it off everywhere.'),
    h('label', { class: 'wide' }, 'Rules', area),
    h(
      'div',
      { class: 'admin-actions wide' },
      h('button', { type: 'submit' }, 'Save'),
      h('button', { type: 'button', class: 'secondary', onclick: () => onDone() }, 'Cancel'),
    ),
  );
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const { rows, bad } = textToRows(area.value);
    if (bad.length) {
      setStatus(`Lines ${bad.join(', ')} need exactly an airline and a market.`, 'error');
      return;
    }
    busy(form.querySelector('button[type=submit]'), async () => {
      const r = await api(`/admin/feature-switches/${encodeURIComponent(sw.id)}`, { method: 'PUT', body: { rows } });
      setStatus(`${r.id} saved: ${r.rows.length ? `${r.rows.length} rules` : 'off everywhere'}.`, 'success');
      onDone();
    });
  });
  return form;
}

let switches = [];

function draw() {
  const filter = (document.getElementById('filter')?.value || '').toLowerCase();
  const list = switches.filter((s) => s.id.toLowerCase().includes(filter));
  const panel = document.getElementById('panel');
  document.getElementById('list').replaceChildren(table(['Switch', 'On for', 'Used by the site code', ''], list.map((s) => [
    s.id,
    (s.rows || []).length ? s.rows.map((r) => `${r.tenant} ${r.market}`).join(', ') : 'off',
    s.known ? 'yes' : 'no',
    h('button', {
      type: 'button',
      class: 'secondary',
      onclick: () => {
        panel.replaceChildren(editor(s, async () => {
          panel.replaceChildren();
          await busy(null, render);
        }));
        panel.scrollIntoView({ behavior: 'smooth' });
      },
    }, 'Edit'),
  ])));
}

render = async () => {
  switches = (await api('/admin/feature-switches')).switches || [];
  draw();
};

(async function init() {
  const app = await start({ tool: 'feature-switches' });
  if (!app) return;
  const filter = h('input', {
    type: 'search', id: 'filter', placeholder: 'Filter by name', oninput: draw,
  });
  content.append(h('div', { class: 'admin-form' }, h('label', {}, 'Filter', filter)), h('div', { id: 'panel' }), h('div', { id: 'list' }));
  await busy(null, render);
}());
