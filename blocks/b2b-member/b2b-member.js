import { readConfigRows, resolveLabels, toConfigKey } from '../../scripts/block-config.js';
import {
  fetchJson, loadSession, loginUrl, pageRoot, ROLES_PATH,
} from '../../scripts/b2b-session.js';

/*
 * Lufthansa Group for Business' member pages (lh-b2b /<root>/home, fund, history, usermanagement,
 * reports, profile, lhghome): one variant per view, its texts from the block's rows, its data from
 * lh-backends on the site's own host. What the block reads is the brief's contract, nothing more:
 * the session ({ company, experts }: the person's name, e-mail and home), the accounts of
 * user/roles ({ accountId, accountName, companyId, companyName, programme, roles }; 401 signed
 * out) and the views' endpoints (403 without the rights). The fund, history, users and reports
 * answers are shown as they come: an object as the list of its fields, a list of objects as a
 * table (labels "Label <field>", values "Value <value>", "Hide | fields"). README.md.
 */

const API = '/service/secured/api/b2bneo';
const VIEWS = ['dashboard', 'fund', 'history', 'users', 'reports', 'profile', 'accounts'];

/** Built-in texts (the rows override them; the documents carry the page's own). */
const TEXTS = {
  en: {
    loading: 'Loading …',
    empty: 'There is nothing to show here yet.',
    forbidden: 'Your account has no access to this page.',
    error: 'This information is not available at the moment. Please try again later.',
    greeting: 'Welcome, {name}',
    'accounts title': 'Your accounts',
    'fund tile': 'Corporate Service Fund',
    'history tile': 'Order history',
    'reports tile': 'Reports',
    'users tile': 'User management',
    'name label': 'Name',
    'company label': 'Company',
    'account label': 'Account',
    'programme label': 'Programme',
    'roles label': 'Roles',
  },
  de: {
    loading: 'Wird geladen …',
    empty: 'Hier gibt es noch nichts anzuzeigen.',
    forbidden: 'Ihr Konto hat keinen Zugriff auf diese Seite.',
    error: 'Diese Informationen sind im Moment nicht verfügbar. Bitte versuchen Sie es später noch einmal.',
    greeting: 'Willkommen, {name}',
    'accounts title': 'Ihre Konten',
    'fund tile': 'Corporate Service Fund',
    'history tile': 'Bestellhistorie',
    'reports tile': 'Berichte',
    'users tile': 'Benutzerverwaltung',
    'name label': 'Name',
    'company label': 'Unternehmen',
    'account label': 'Konto',
    'programme label': 'Programm',
    'roles label': 'Rollen',
  },
};

/** The dashboard's tiles: row key, page. */
const TILES = [['fund tile', 'fund'], ['history tile', 'history'], ['reports tile', 'reports'], ['users tile', 'usermanagement']];

function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => {
    if (v === null || v === undefined || v === false) return;
    if (k === 'className') node.className = v;
    else node.setAttribute(k, v === true ? '' : v);
  });
  children.flat(Infinity).forEach((c) => {
    if (c === null || c === undefined || c === '') return;
    node.append(typeof c === 'string' || typeof c === 'number' ? document.createTextNode(String(c)) : c);
  });
  return node;
}

const DATE = /^\d{4}-\d{2}-\d{2}(?:T[\d:.]+(?:Z|[+-]\d{2}:?\d{2})?)?$/;

/**
 * The generic view of an answer: fields' labels and values from the rows, numbers and dates in
 * the page's language.
 */
function presenter(config, lang) {
  const hidden = new Set(((config.hide && config.hide.text) || '').split(',').map((x) => x.trim()).filter(Boolean));
  const label = (key) => {
    const row = config[toConfigKey(`label ${key}`)];
    if (row && row.text) return row.text;
    const words = String(key).replace(/([a-z\d])([A-Z])/g, '$1 $2').replace(/[_-]+/g, ' ').trim()
      .toLowerCase();
    return words.charAt(0).toUpperCase() + words.slice(1);
  };
  const scalar = (v) => {
    if (typeof v === 'number') return new Intl.NumberFormat(lang).format(v);
    if (typeof v === 'boolean') return String(v);
    const s = String(v);
    const row = config[toConfigKey(`value ${s}`)];
    if (row && row.text) return row.text;
    if (DATE.test(s)) {
      const day = !/T/.test(s);
      const time = Date.parse(day ? `${s}T00:00:00Z` : s);
      if (!Number.isNaN(time)) {
        return new Intl.DateTimeFormat(lang, { dateStyle: 'medium', timeZone: day ? 'UTC' : undefined }).format(new Date(time));
      }
    }
    return s;
  };
  const isScalar = (v) => v === null || ['string', 'number', 'boolean'].includes(typeof v);
  const empty = (v) => v === null || v === undefined || v === '';
  const entries = (o) => Object.entries(o).filter(([k, v]) => !hidden.has(k) && !empty(v));
  const inline = (v) => {
    if (isScalar(v)) return empty(v) ? '' : scalar(v);
    if (Array.isArray(v)) return v.map(inline).filter(Boolean).join(', ');
    return entries(v).map(([, x]) => inline(x)).filter(Boolean).join(' ');
  };
  const show = (v) => {
    if (empty(v)) return null;
    if (isScalar(v)) return scalar(v);
    if (Array.isArray(v)) {
      const items = v.filter((x) => !empty(x));
      if (!items.length) return null;
      if (items.every(isScalar)) return el('ul', { className: 'b2b-member-list' }, items.map((x) => el('li', {}, scalar(x))));
      const rows = items.filter((x) => typeof x === 'object' && !Array.isArray(x));
      const keys = [];
      rows.forEach((r) => entries(r).forEach(([k]) => { if (!keys.includes(k)) keys.push(k); }));
      if (!keys.length) return null;
      return el(
        'table',
        { className: 'b2b-member-table' },
        el('thead', {}, el('tr', {}, keys.map((k) => el('th', { scope: 'col' }, label(k))))),
        el('tbody', {}, rows.map((r) => el('tr', {}, keys.map((k) => el('td', {}, empty(r[k]) ? '' : inline(r[k])))))),
      );
    }
    const pairs = entries(v).map(([k, x]) => [k, show(x)]).filter(([, x]) => x !== null);
    if (!pairs.length) return null;
    return el('dl', { className: 'b2b-member-facts' }, pairs.map(([k, x]) => [el('dt', {}, label(k)), el('dd', {}, x)]));
  };
  return { show, hidden };
}

/** The account a view shows: ?account= / ?company= when the visitor has it, else the first. */
export function pickAccount(accounts, wanted = {}) {
  const list = accounts || [];
  return list.find((a) => (wanted.account && a.accountId === wanted.account)
    || (wanted.company && a.companyId === wanted.company)) || list[0] || null;
}

const nameOf = (p) => (p && typeof p.name === 'string' ? p.name.trim() : '');

/** A row's link (text and href) or the built-in text with the default page. */
function tileOf(config, key, text, href) {
  const row = config[toConfigKey(key)];
  const a = row && row.link;
  return el('a', { href: a ? a.getAttribute('href') : href, className: 'b2b-member-tile' }, a ? a.textContent.trim() : text);
}

function facts(pairs) {
  const shown = pairs.filter(([, v]) => v !== '' && v !== null && v !== undefined);
  return shown.length ? el('dl', { className: 'b2b-member-facts' }, shown.map(([k, v]) => [el('dt', {}, k), el('dd', {}, v)])) : null;
}

/** A state from an answer's status, or null for a 200 with data. */
const stateOf = (r) => {
  if (r.status === 401) return { state: 'login' };
  if (r.status === 403) return { state: 'forbidden' };
  if (r.status !== 200 || r.data === null || r.data === undefined) return { state: 'error' };
  return null;
};

function companiesOf(accounts) {
  const companies = [];
  accounts.forEach((a) => {
    let c = companies.find((x) => x.companyId === a.companyId);
    if (!c) {
      c = {
        companyId: a.companyId, companyName: a.companyName, programme: a.programme, accounts: [],
      };
      companies.push(c);
    }
    c.accounts.push(a);
  });
  return companies;
}

/**
 * A view's content from the backend, or a state: { node } | { state: 'empty' | 'forbidden' |
 * 'error' | 'login' }.
 */
async function render(view, ctx) {
  const {
    t, root, config, wanted, lang,
  } = ctx;
  const roles = await fetchJson(ROLES_PATH);
  const bad = stateOf(roles);
  if (bad) return bad;
  const accounts = Array.isArray(roles.data.accounts) ? roles.data.accounts : [];

  if (view === 'dashboard') {
    const session = await loadSession();
    const person = session && (session.company || session.experts);
    const authored = TILES.filter(([key]) => config[toConfigKey(key)]);
    const tiles = (authored.length ? authored : TILES).map(([key, page]) => tileOf(config, key, t[key], `/${root}/${page}`));
    return {
      node: el(
        'div',
        {},
        nameOf(person) ? el('h2', { className: 'b2b-member-greeting' }, t.greeting.replace('{name}', nameOf(person))) : null,
        el('ul', { className: 'b2b-member-tiles' }, tiles.map((x) => el('li', {}, x))),
        accounts.length ? el('h3', {}, t['accounts title']) : null,
        accounts.length ? el('ul', { className: 'b2b-member-accounts' }, accounts.map((a) => el('li', {}, a.accountName || a.accountId, a.companyName && a.companyName !== a.accountName ? el('span', { className: 'b2b-member-company' }, ` (${a.companyName})`) : null))) : null,
      ),
    };
  }

  if (view === 'profile') {
    const session = await loadSession();
    const person = session && (session.company || session.experts);
    if (!person) return { state: 'empty' };
    const { show, hidden } = presenter(config, lang);
    const own = Object.entries(person)
      .filter(([k, v]) => k !== 'home' && k !== 'name' && !hidden.has(k) && v !== null && typeof v !== 'object');
    const first = accounts[0];
    const parts = [
      facts([[t['name label'], nameOf(person)]]),
      own.length ? show(Object.fromEntries(own)) : null,
      facts([
        [t['company label'], first ? first.companyName || '' : ''],
        [t['account label'], first ? first.accountName || first.accountId || '' : ''],
      ]),
    ].filter(Boolean);
    return parts.length ? { node: el('div', {}, parts) } : { state: 'empty' };
  }

  if (view === 'accounts') {
    if (!accounts.length) return { state: 'empty' };
    return {
      node: el('ul', { className: 'b2b-member-companies' }, companiesOf(accounts).map((c) => el(
        'li',
        { className: 'b2b-member-company-item' },
        el('h3', { className: 'b2b-member-company-name' }, c.companyName || c.companyId),
        facts([
          [t['programme label'], c.programme || ''],
          [t['account label'], c.accounts.map((a) => a.accountName || a.accountId).join(', ')],
          [t['roles label'], [...new Set(c.accounts.flatMap((a) => a.roles || []))].join(', ')],
        ]),
      ))),
    };
  }

  const account = pickAccount(accounts, wanted);
  if (!account) return { state: 'empty' };
  const id = encodeURIComponent(view === 'users' || view === 'reports' ? account.companyId : account.accountId);
  const request = {
    fund: [`${API}/csf/accounts/${id}`],
    history: [`${API}/csf/accounts/${id}/orders/history`],
    users: [`${API}/companies/${id}/users`],
    reports: [`${API}/reporting/overview/${id}`, { method: 'POST', body: {} }],
  }[view];
  if (!request) return { state: 'error' };
  const r = await fetchJson(...request);
  const state = stateOf(r);
  if (state) return state;
  const node = presenter(config, lang).show(r.data);
  return node && typeof node === 'object' ? { node } : { state: 'empty' };
}

export default async function decorate(block) {
  const view = VIEWS.find((v) => block.classList.contains(v)) || 'dashboard';
  const config = readConfigRows(block);
  const { lang, root } = pageRoot();
  const t = resolveLabels(TEXTS, config, lang);
  const params = new URLSearchParams(window.location.search);
  const status = el('p', { className: 'b2b-member-status', role: 'status' }, t.loading);
  block.replaceChildren(status);
  let result;
  try {
    result = await render(view, {
      t, lang, root, config, wanted: { account: params.get('account'), company: params.get('company') },
    });
  } catch (e) {
    result = { state: 'error' };
  }
  if (result.state === 'login') {
    const login = config['login-page'] && config['login-page'].link;
    const back = `${window.location.pathname}${window.location.search}`;
    window.location.assign(login ? login.getAttribute('href') : loginUrl(root, back));
    return;
  }
  if (result.state) {
    block.replaceChildren(el('p', { className: `b2b-member-status b2b-member-${result.state}` }, t[result.state]));
    return;
  }
  block.replaceChildren(el('div', { className: 'b2b-member-view' }, result.node));
}
