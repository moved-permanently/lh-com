import { readConfigRows, resolveLabels } from '../../scripts/block-config.js';
import {
  fetchJson, loadSession, loginUrl, pageRoot, ROLES_PATH,
} from '../../scripts/b2b-session.js';

/*
 * Lufthansa Group for Business' member pages (lh-b2b /<root>/home, fund, history, usermanagement,
 * reports, profile, lhghome): one variant per view, its texts from the block's rows, its data from
 * lh-backends on the site's own host (the session and roles, the Corporate Service Fund, user
 * management, reporting). The roles as lh-backends checks them: CSF (fund and its history),
 * REPORTING (reports), ADMIN or KAM (user management). README.md.
 */

const API = '/service/secured/api/b2bneo';
const VIEWS = ['dashboard', 'fund', 'history', 'users', 'reports', 'profile', 'accounts'];
const ROLE = {
  fund: ['CSF'], history: ['CSF'], reports: ['REPORTING'], users: ['ADMIN', 'KAM'],
};

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
    'balance label': 'Balance',
    'valid until label': 'Valid until',
    'categories title': 'Available for',
    'date label': 'Date',
    'type label': 'Type',
    'product label': 'Product',
    'amount label': 'Amount',
    'status label': 'Status',
    'name label': 'Name',
    'email label': 'E-mail',
    'roles label': 'Roles',
    'company label': 'Company',
    'account label': 'Account',
    'programme label': 'Programme',
    'period label': 'Period',
    'flights label': 'Flights',
    'segments label': 'Segments',
    'revenue label': 'Revenue',
    'co2 label': 'CO₂ (tonnes)',
    'top routes title': 'Top routes',
    'route label': 'Route',
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
    'balance label': 'Guthaben',
    'valid until label': 'Gültig bis',
    'categories title': 'Einsetzbar für',
    'date label': 'Datum',
    'type label': 'Art',
    'product label': 'Produkt',
    'amount label': 'Betrag',
    'status label': 'Status',
    'name label': 'Name',
    'email label': 'E-Mail',
    'roles label': 'Rollen',
    'company label': 'Unternehmen',
    'account label': 'Konto',
    'programme label': 'Programm',
    'period label': 'Zeitraum',
    'flights label': 'Flüge',
    'segments label': 'Segmente',
    'revenue label': 'Umsatz',
    'co2 label': 'CO₂ (Tonnen)',
    'top routes title': 'Top-Strecken',
    'route label': 'Strecke',
  },
};

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

/** The page language's number, money and date formats. */
function formats(lang) {
  const money = (m) => (m && typeof m.amount === 'number' && m.currency
    ? new Intl.NumberFormat(lang, { style: 'currency', currency: m.currency }).format(m.amount) : '');
  const number = (n) => (typeof n === 'number' ? new Intl.NumberFormat(lang).format(n) : '');
  const date = (d) => {
    const t = Date.parse(`${d}${/T/.test(String(d)) ? '' : 'T00:00:00Z'}`);
    return Number.isNaN(t) ? String(d || '') : new Intl.DateTimeFormat(lang, { dateStyle: 'medium', timeZone: 'UTC' }).format(new Date(t));
  };
  return { money, number, date };
}

/**
 * The account (or company) a view shows: ?account= / ?company= when it has the role, else the
 * first.
 */
export function pickAccount(accounts, roles, wanted = {}) {
  const ok = (a) => !roles || (a.roles || []).some((r) => roles.includes(r));
  const allowed = (accounts || []).filter(ok);
  return allowed.find((a) => (wanted.account && a.accountId === wanted.account)
    || (wanted.company && a.companyId === wanted.company)) || allowed[0] || null;
}

const fullName = (p) => [p && (p.firstName || p.name), p && (p.lastName || p.surname)].filter(Boolean).join(' ');

/** A row's link (text and href) or the text with a default href. */
function tileOf(config, key, text, href) {
  const row = config[key.replace(/ /g, '-')];
  const a = row && row.link;
  return el('a', { href: a ? a.getAttribute('href') : href, className: 'b2b-member-tile' }, a ? a.textContent.trim() : text);
}

function definitionList(pairs) {
  return el('dl', { className: 'b2b-member-facts' }, pairs.filter(([, v]) => v !== '' && v !== null && v !== undefined)
    .map(([k, v]) => [el('dt', {}, k), el('dd', {}, v)]));
}

function table(head, rows) {
  return el(
    'table',
    { className: 'b2b-member-table' },
    el('thead', {}, el('tr', {}, head.map((h) => el('th', { scope: 'col' }, h)))),
    el('tbody', {}, rows.map((r) => el('tr', {}, r.map((c) => el('td', {}, c))))),
  );
}

/**
 * A view's content from the backend, or a state: { node } | { state: 'empty' | 'forbidden' |
 * 'error' | 'login' }.
 */
async function render(view, ctx) {
  const {
    t, f, root, config, wanted,
  } = ctx;
  const roles = await fetchJson(ROLES_PATH);
  if (roles.status === 401) return { state: 'login' };
  if (roles.status === 403) return { state: 'forbidden' };
  if (roles.status !== 200 || !roles.data) return { state: 'error' };
  const accounts = Array.isArray(roles.data.accounts) ? roles.data.accounts : [];
  const has = (list) => accounts.some((a) => (a.roles || []).some((r) => list.includes(r)));

  if (view === 'dashboard' || view === 'profile') {
    const session = await loadSession();
    const person = session && (session.company || session.experts);
    if (view === 'dashboard') {
      const tiles = [
        has(ROLE.fund) ? tileOf(config, 'fund tile', t['fund tile'], `/${root}/fund`) : null,
        has(ROLE.history) ? tileOf(config, 'history tile', t['history tile'], `/${root}/history`) : null,
        has(ROLE.reports) ? tileOf(config, 'reports tile', t['reports tile'], `/${root}/reports`) : null,
        has(ROLE.users) ? tileOf(config, 'users tile', t['users tile'], `/${root}/usermanagement`) : null,
      ].filter(Boolean);
      return {
        node: el(
          'div',
          {},
          person ? el('h2', { className: 'b2b-member-greeting' }, t.greeting.replace('{name}', fullName(person))) : null,
          tiles.length ? el('ul', { className: 'b2b-member-tiles' }, tiles.map((x) => el('li', {}, x))) : null,
          accounts.length ? el('h3', {}, t['accounts title']) : null,
          accounts.length ? el('ul', { className: 'b2b-member-accounts' }, accounts.map((a) => el('li', {}, a.accountName || a.accountId, a.companyName && a.companyName !== a.accountName ? el('span', { className: 'b2b-member-company' }, ` (${a.companyName})`) : null))) : null,
        ),
      };
    }
    if (!person) return { state: 'empty' };
    const first = accounts[0];
    return {
      node: definitionList([
        [t['name label'], fullName(person)],
        [t['email label'], person.email || ''],
        [t['company label'], first ? first.companyName || '' : ''],
        [t['account label'], first ? first.accountName || first.accountId : ''],
      ]),
    };
  }

  if (view === 'accounts') {
    if (!accounts.length) return { state: 'empty' };
    const companies = [];
    accounts.forEach((a) => {
      let c = companies.find((x) => x.companyId === a.companyId);
      if (!c) {
        companies.push(c = {
          companyId: a.companyId, companyName: a.companyName, programme: a.programme, accounts: [],
        });
      }
      c.accounts.push(a);
    });
    return {
      node: el('ul', { className: 'b2b-member-companies' }, companies.map((c) => el(
        'li',
        { className: 'b2b-member-company-item' },
        el('h3', { className: 'b2b-member-company-name' }, c.companyName || c.companyId),
        definitionList([[t['programme label'], c.programme || ''], [t['account label'], c.accounts.map((a) => a.accountName || a.accountId).join(', ')], [t['roles label'], [...new Set(c.accounts.flatMap((a) => a.roles || []))].join(', ')]]),
      ))),
    };
  }

  const account = pickAccount(accounts, ROLE[view], wanted);
  if (!account) return { state: 'empty' };
  const answer = (r) => {
    if (r.status === 401) return { state: 'login' };
    if (r.status === 403) return { state: 'forbidden' };
    if (r.status !== 200 || !r.data) return { state: 'error' };
    return null;
  };

  if (view === 'fund') {
    const r = await fetchJson(`${API}/csf/accounts/${encodeURIComponent(account.accountId)}`);
    const bad = answer(r);
    if (bad) return bad;
    const cats = Array.isArray(r.data.categories) ? r.data.categories : [];
    return {
      node: el(
        'div',
        {},
        definitionList([[t['account label'], account.accountName || account.accountId], [t['balance label'], f.money(r.data.balance)], [t['valid until label'], r.data.validUntil ? f.date(r.data.validUntil) : '']]),
        cats.length ? el('h3', {}, t['categories title']) : null,
        cats.length ? el('ul', { className: 'b2b-member-categories' }, cats.map((c) => el('li', {}, c.name || c.categoryId))) : null,
      ),
    };
  }
  if (view === 'history') {
    const r = await fetchJson(`${API}/csf/accounts/${encodeURIComponent(account.accountId)}/orders/history`);
    const bad = answer(r);
    if (bad) return bad;
    const list = Array.isArray(r.data.transactions) ? r.data.transactions : [];
    if (!list.length) return { state: 'empty' };
    const code = (kind, v) => {
      const row = config[`${kind}-${String(v || '').toLowerCase()}`];
      return row && row.text ? row.text : String(v || '');
    };
    return {
      node: table(
        [t['date label'], t['type label'], t['product label'], t['amount label'], t['status label']],
        list.map((x) => [f.date(x.date), code('type', x.type), x.product || '', f.money({ amount: x.amount, currency: x.currency }), code('status', x.status)]),
      ),
    };
  }
  if (view === 'users') {
    const r = await fetchJson(`${API}/companies/${encodeURIComponent(account.companyId)}/users`);
    const bad = answer(r);
    if (bad) return bad;
    const list = Array.isArray(r.data.users) ? r.data.users : [];
    if (!list.length) return { state: 'empty' };
    return { node: table([t['name label'], t['email label'], t['roles label']], list.map((u) => [fullName(u), u.email || '', (u.roles || []).join(', ')])) };
  }
  if (view === 'reports') {
    const r = await fetchJson(`${API}/reporting/overview/${encodeURIComponent(account.companyId)}`, { method: 'POST', body: {} });
    const bad = answer(r);
    if (bad) return bad;
    const d = r.data;
    const routes = Array.isArray(d.topRoutes) ? d.topRoutes : [];
    return {
      node: el(
        'div',
        {},
        definitionList([
          [t['company label'], account.companyName || account.companyId],
          [t['period label'], d.period ? `${f.date(d.period.from)} – ${f.date(d.period.to)}` : ''],
          [t['flights label'], f.number(d.flights)],
          [t['segments label'], f.number(d.segments)],
          [t['revenue label'], f.money(d.revenue)],
          [t['co2 label'], d.co2 ? f.number(d.co2.tonnes) : ''],
        ]),
        routes.length ? el('h3', {}, t['top routes title']) : null,
        routes.length ? table([t['route label'], t['segments label']], routes.map((x) => [x.route, f.number(x.segments)])) : null,
      ),
    };
  }
  return { state: 'error' };
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
      t, f: formats(lang), root, config, wanted: { account: params.get('account'), company: params.get('company') },
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
