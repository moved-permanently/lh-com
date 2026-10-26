// Message Center overview: every message of this site from /message-center/index.json, one line
// per message with its languages and validity. Read-only; messages are edited in DA.
import {
  busy, h, saveBlob, setStatus, start, table,
} from '../shared/admin.js';
import { groupMessages, toCsv } from '../shared/helpers.js';

const content = document.getElementById('content');
const PAGE = 500;
let messages = [];
let site = null; // { org, site } from DA, for the editor links

async function loadIndex() {
  const rows = [];
  let offset = 0;
  let total = Infinity;
  while (offset < total && offset < 20000) {
    // eslint-disable-next-line no-await-in-loop
    const res = await fetch(`/message-center/index.json?offset=${offset}&limit=${PAGE}`, { cache: 'no-store' });
    if (res.status === 404) throw new Error('This site has no Message Center index yet.');
    if (!res.ok) throw new Error(`The Message Center index could not be read (status ${res.status}).`);
    // eslint-disable-next-line no-await-in-loop
    const json = await res.json();
    const data = Array.isArray(json.data) ? json.data : [];
    rows.push(...data);
    total = Number(json.total) || rows.length;
    if (!data.length) break;
    offset += data.length;
  }
  return rows;
}

function draw() {
  const type = document.getElementById('type').value;
  const show = document.getElementById('show').value;
  const list = messages.filter((m) => (!type || m.type === type) && (!show || m.state === show));
  const editLink = (m) => {
    const ctx = site;
    const lang = m.languages[0];
    if (!ctx?.org || !lang) return m.id;
    return h('a', {
      href: `https://da.live/form#/${ctx.org}/${ctx.site}/message-center/${m.type}/${m.id}/${lang}`, target: '_blank', rel: 'noopener',
    }, m.id);
  };
  document.getElementById('list').replaceChildren(
    h('p', {}, `${list.length} of ${messages.length} messages.`),
    table(['Type', 'Title', 'Message ID', 'Languages', 'Priority', 'Valid from', 'Valid to', 'Status'], list.map((m) => [
      m.type, m.title, editLink(m), m.languages.join(', '), m.criticality, m.from || 'open', m.to || 'open',
      h('span', { class: `state-${m.state}` }, m.state),
    ])),
  );
}

function exportCsv() {
  const rows = [['type', 'title', 'id', 'languages', 'priority', 'from', 'to', 'status'],
    ...messages.map((m) => [m.type, m.title, m.id, m.languages.join(' '), m.criticality, m.from, m.to, m.state])];
  saveBlob(new Blob([toCsv(rows)], { type: 'text/csv;charset=utf-8' }), 'message-center-overview.csv');
}

(async function init() {
  const app = await start({ optional: true });
  if (app) site = { org: app.context.org, site: app.context.repo || app.context.site };
  const typeSelect = h('select', { id: 'type', onchange: draw }, h('option', { value: '' }, 'All types'));
  const showSelect = h(
    'select',
    { id: 'show', onchange: draw },
    h('option', { value: '' }, 'All'),
    ['active', 'upcoming', 'expired'].map((s) => h('option', { value: s }, s)),
  );
  content.append(
    h('div', { class: 'admin-form' }, h('label', {}, 'Type', typeSelect), h('label', {}, 'Status', showSelect)),
    h('div', { class: 'admin-actions' }, h('button', { type: 'button', class: 'secondary', onclick: exportCsv }, 'Download CSV')),
    h('div', { id: 'list' }),
  );
  await busy(null, async () => {
    messages = groupMessages(await loadIndex());
    [...new Set(messages.map((m) => m.type))].forEach((t) => typeSelect.append(h('option', { value: t }, t)));
    if (!messages.length) setStatus('The index has no messages.', 'warning');
    draw();
  });
}());
