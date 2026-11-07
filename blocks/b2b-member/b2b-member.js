import { readConfigRows, resolveLabels, toConfigKey } from '../../scripts/block-config.js';
import {
  fetchJson, loadSession, loginUrl, pageRoot, personName, ROLES_PATH,
} from '../../scripts/b2b-session.js';

/*
 * Lufthansa Group for Business' member pages (lh-b2b /<root>/home, fund, history, usermanagement,
 * reports, profile, lhghome): one variant per view, its texts from the block's rows, its data from
 * lh-backends on the site's own host. What the block reads is the brief's contract, nothing more:
 * the session ({ company: { firstName, lastName, email, loginType, home }, experts: { name,
 * surname, email, country, language, home } }), the accounts of user/roles ({ accountId,
 * accountName, companyId, companyName, programme, roles }; 401 signed out) and the views' endpoints
 * (403 without the rights). The roles decide the member home's tiles and the account a view asks
 * for (RIGHTS); an answer without roles leaves it to the backend's 403. The fund, history, users
 * and reports answers are shown as they come: an object as the list of its fields, a list of
 * objects as a table (labels "Label <the field's words>", values "Value <value>", booleans as
 * yes / no, role codes as "Role <code>", "Hide | fields"). README.md.
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
    'value true': 'Yes',
    'value false': 'No',
    'role csf': 'Corporate Service Fund',
    'role reporting': 'Reports',
    'role admin': 'User management',
    'role kam': 'Key Account Management',
    'role booker': 'Booking',
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
    'value true': 'Ja',
    'value false': 'Nein',
    'role csf': 'Corporate Service Fund',
    'role reporting': 'Berichte',
    'role admin': 'Benutzerverwaltung',
    'role kam': 'Kundenbetreuung',
    'role booker': 'Buchung',
  },
};

/** The dashboard's tiles: row key, page, view. */
const TILES = [['fund tile', 'fund', 'fund'], ['history tile', 'history', 'history'], ['reports tile', 'reports', 'reports'], ['users tile', 'usermanagement', 'users']];

/** The roles (user/roles accounts[].roles) that open a view (the brief). */
const RIGHTS = {
  fund: ['CSF'], history: ['CSF'], reports: ['REPORTING'], users: ['ADMIN', 'KAM'],
};

/** An account's role codes in capitals, or null when the answer gives it none. */
const rolesOf = (a) => (a && Array.isArray(a.roles) ? a.roles.filter((r) => typeof r === 'string').map((r) => r.trim().toUpperCase()) : null);
const mayOpen = (a, view) => (rolesOf(a) || []).some((r) => RIGHTS[view].includes(r));

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

/** Role codes as words (rows "Role <code>", the built-in four); codes without words left out. */
const roleWords = (codes, t, config = {}) => [...new Set(codes.map((c) => {
  const row = config[toConfigKey(`role ${c}`)];
  return (row && row.text) || t[`role ${c.toLowerCase()}`];
}).filter(Boolean))];

const DATE = /^\d{4}-\d{2}-\d{2}(?:T[\d:.]+(?:Z|[+-]\d{2}:?\d{2})?)?$/;

/**
 * The generic view of an answer: fields' labels and values from the rows, numbers and dates in
 * the page's language.
 */
function presenter(config, lang, t) {
  const hidden = new Set(((config.hide && config.hide.text) || '').split(',').map((x) => x.trim()).filter(Boolean));
  // a field's words: accountId, account_id and account-id are "account id"
  const wordsOf = (key) => String(key).replace(/([a-z\d])([A-Z])/g, '$1 $2').replace(/[_-]+/g, ' ').trim()
    .toLowerCase();
  const label = (key) => {
    const row = config[toConfigKey(`label ${key}`)] || config[toConfigKey(`label ${wordsOf(key)}`)];
    if (row && row.text) return row.text;
    const words = wordsOf(key);
    return words.charAt(0).toUpperCase() + words.slice(1);
  };
  const scalar = (v) => {
    if (typeof v === 'number') return new Intl.NumberFormat(lang).format(v);
    if (typeof v === 'boolean') return t[`value ${v}`];
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
  // a field "roles" (the users' role codes): the role words, codes without words left out
  const roles = (key, v) => (key === 'roles' && Array.isArray(v)
    ? roleWords(v.filter((x) => typeof x === 'string').map((x) => x.trim().toUpperCase()), t, config).join(', ')
    : null);
  const inline = (v, key = '') => {
    const words = roles(key, v);
    if (words !== null) return words;
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
        el('tbody', {}, rows.map((r) => el('tr', {}, keys.map((k) => el('td', {}, empty(r[k]) ? '' : inline(r[k], k)))))),
      );
    }
    const pairs = entries(v).map(([k, x]) => [k, roles(k, x) || show(x)]).filter(([, x]) => x !== null && x !== '');
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
  // with roles in the answer they decide; without, every tile and the backend's 403
  const known = accounts.some((a) => rolesOf(a) !== null);

  if (view === 'dashboard') {
    const session = await loadSession();
    const person = session && (session.company || session.experts);
    const authored = TILES.filter(([key]) => config[toConfigKey(key)]);
    const tiles = (authored.length ? authored : TILES)
      .filter(([, , v]) => !known || accounts.some((a) => mayOpen(a, v)))
      .map(([key, page]) => tileOf(config, key, t[key], `/${root}/${page}`));
    return {
      node: el(
        'div',
        {},
        personName(person) ? el('h2', { className: 'b2b-member-greeting' }, t.greeting.replace('{name}', personName(person))) : null,
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
    const { show, hidden } = presenter(config, lang, t);
    // the name once (its fields), no home and no sign-in type (a code)
    const skip = ['home', 'name', 'surname', 'firstName', 'lastName', 'loginType'];
    const own = Object.entries(person)
      .filter(([k, v]) => !skip.includes(k) && !hidden.has(k) && v !== null && typeof v !== 'object');
    const first = accounts[0];
    const parts = [
      facts([[t['name label'], personName(person)]]),
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
          [t['roles label'], roleWords(c.accounts.flatMap((a) => rolesOf(a) || []), t, config).join(', ')],
        ]),
      ))),
    };
  }

  if (!RIGHTS[view]) return { state: 'error' };
  const open = known ? accounts.filter((a) => mayOpen(a, view)) : accounts;
  if (known && !open.length) return { state: 'forbidden' };
  const account = pickAccount(open, wanted);
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
  const node = presenter(config, lang, t).show(r.data);
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
