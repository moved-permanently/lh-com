/* eslint-disable max-len, import/no-extraneous-dependencies -- dev tooling; linkedom is a dev dependency */
/* Lufthansa Group for Business' member pages after the end-to-end test on b2b.turnsthe.page (the
   brief after 456), on the brief's contract:
   1. the person's name: session.company = { firstName, lastName, email, loginType, home },
      session.experts = { name, surname, email, country, language, home }: the header's Login item
      and the member home's greeting (company users and staff had none);
   2. the member home's tiles from GET user/roles (accounts[].roles): CSF the fund and the history,
      REPORTING the reports, ADMIN or KAM the user management; the views ask for the account that
      has the right and say "Forbidden" without asking when no account has it; without any roles in
      the answer, every tile and the backend's 403 as before;
   3. words, not codes: labels from the rows "Label <words of the field>" (accountId, account_id:
      "Label account id"), booleans and the type and status values from the rows "Value <value>"
      (built-in yes/no), role codes as words (rows "Role <code>", built-in for the four known);
      unknown role codes, loginType and the name fields not shown;
   4. phones: the member facts and tables fit the page (the facts stack, a table scrolls in its own
      box). Fixtures are invented.
   Run: node --max-old-space-size=256 --test test/b2b-member-roles.test.mjs */
/* global globalThis */
import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html lang="en"><head></head><body><main></main></body></html>');
globalThis.window = window;
globalThis.document = document;
let assigned;
const at = (pathname, search = '') => {
  window.location = {
    hostname: 'b2b.turnsthe.page', pathname, search, href: `https://b2b.turnsthe.page${pathname}${search}`, origin: 'https://b2b.turnsthe.page', assign: (u) => { assigned = u; },
  };
};

const API = '/service/secured/api/b2bneo';
const COMPANY = {
  firstName: 'Max', lastName: 'Mustermann', email: 'max@example.test', loginType: 'EXT', home: '/de/de/home',
};
const EXPERTS = {
  name: 'Petra', surname: 'Hahn', email: 'petra@example.test', country: 'DE', language: 'de', home: '/de/de/experts-members',
};
const account = (id, companyId, roles) => ({
  accountId: id, accountName: `Konto ${id}`, companyId, companyName: `Firma ${companyId}`, programme: 'Programm X', roles,
});
let session;
let roles;
let api;
let calls;
const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
beforeEach(() => {
  assigned = null;
  calls = [];
  session = { company: COMPANY, experts: null };
  roles = { accounts: [account('A-1', 'C-1', ['CSF', 'REPORTING', 'ADMIN'])] };
  api = {
    [`GET ${API}/session`]: () => json(200, session),
    [`GET ${API}/user/roles`]: () => json(200, roles),
  };
  globalThis.fetch = async (url, init = {}) => {
    const key = `${init.method || 'GET'} ${String(url)}`;
    calls.push(key);
    const h = api[key];
    return h ? h() : json(404, {});
  };
});
const { default: decorate } = await import('../blocks/b2b-member/b2b-member.js');
const { withSession } = await import('../blocks/header/header-b2b-session.js');
const { personName } = await import('../scripts/b2b-session.js');

const block = async (variant, rows = []) => {
  const b = document.createElement('div');
  b.className = `b2b-member ${variant}`.trim();
  b.innerHTML = rows.map(([k, v]) => `<div><div>${k}</div><div>${v}</div></div>`).join('');
  document.querySelector('main').replaceChildren(b);
  await decorate(b);
  return b;
};
const text = (b) => b.innerHTML.replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
const tiles = (b) => [...b.querySelectorAll('.b2b-member-tiles a')].map((a) => a.getAttribute('href'));

test('1. the name: firstName and lastName (company, staff), name and surname (eXperts)', async () => {
  assert.equal(personName(COMPANY), 'Max Mustermann');
  assert.equal(personName(EXPERTS), 'Petra Hahn');
  assert.equal(personName({ firstName: 'Max' }), 'Max');
  assert.equal(personName({ email: 'x@example.test' }), '');
  assert.equal(personName(null), '');
  at('/de/de/home');
  const home = await block('', [['Greeting', 'Willkommen, {name}']]);
  assert.match(text(home), /Willkommen, Max Mustermann/);
  session = { company: null, experts: EXPERTS };
  const ex = await block('', [['Greeting', 'Willkommen, {name}']]);
  assert.match(text(ex), /Willkommen, Petra Hahn/);
  const login = (href) => {
    const a = document.createElement('a');
    a.setAttribute('href', href);
    a.textContent = 'x';
    return a;
  };
  const menu = [{ label: 'Login', link: null, groups: [{ label: 'Für Unternehmen', links: [login('/de/de/login')] }] }];
  assert.equal(withSession(menu, { company: COMPANY, experts: null }, { lang: 'de', root: 'de/de' })[0].label, 'Max Mustermann');
  assert.equal(withSession(menu, { company: null, experts: EXPERTS }, { lang: 'de', root: 'de/de' })[0].label, 'Petra Hahn');
});

test('2. the tiles from the roles: CSF fund and history, REPORTING reports, ADMIN or KAM user management', async () => {
  at('/de/de/home');
  const all = ['/de/de/fund', '/de/de/history', '/de/de/reports', '/de/de/usermanagement'];
  assert.deepEqual(tiles(await block('')), all);
  roles = { accounts: [account('A-1', 'C-1', ['CSF'])] };
  assert.deepEqual(tiles(await block('')), ['/de/de/fund', '/de/de/history'], 'a booker: no reports, no user management');
  roles = { accounts: [account('A-1', 'C-1', ['REPORTING']), account('A-2', 'C-2', ['KAM'])] };
  assert.deepEqual(tiles(await block('')), ['/de/de/reports', '/de/de/usermanagement'], 'the roles of all the accounts');
  roles = { accounts: [account('A-1', 'C-1', ['csf'])] };
  assert.deepEqual(tiles(await block('')), ['/de/de/fund', '/de/de/history'], 'codes in any case');
  roles = { accounts: [account('A-1', 'C-1', [])] };
  assert.deepEqual(tiles(await block('')), [], 'no rights: no tiles');
  const { roles: _, ...noRoles } = account('A-1', 'C-1', []);
  roles = { accounts: [noRoles] };
  assert.deepEqual(tiles(await block('')), all, 'no roles in the answer: every tile, the backend decides (403)');
});

test('2. the views ask for the account with the right; none has it: "Forbidden" without asking', async () => {
  roles = { accounts: [account('A-1', 'C-1', ['REPORTING']), account('A-2', 'C-2', ['CSF', 'ADMIN'])] };
  api[`GET ${API}/csf/accounts/A-2`] = () => json(200, { balance: 5 });
  api[`GET ${API}/companies/C-2/users`] = () => json(200, [{ email: 'b@example.test' }]);
  at('/de/de/fund');
  await block('fund');
  assert.ok(calls.includes(`GET ${API}/csf/accounts/A-2`), 'the account with CSF');
  at('/de/de/usermanagement');
  await block('users');
  assert.ok(calls.includes(`GET ${API}/companies/C-2/users`), 'the company of the account with ADMIN');
  roles = { accounts: [account('A-1', 'C-1', ['CSF'])] };
  calls = [];
  at('/de/de/reports');
  const r = await block('reports', [['Forbidden', 'Kein Zugriff.']]);
  assert.match(text(r), /Kein Zugriff\./);
  assert.ok(!calls.some((c) => c.includes('/reporting/')), 'no request without the right');
  // ?account= still picks that account when it has the right
  roles = { accounts: [account('A-1', 'C-1', ['CSF']), account('A-3', 'C-1', ['CSF'])] };
  api[`GET ${API}/csf/accounts/A-3`] = () => json(200, { balance: 1 });
  at('/de/de/fund', '?account=A-3');
  await block('fund');
  assert.ok(calls.includes(`GET ${API}/csf/accounts/A-3`));
});

test('3. labels by the field\'s words; booleans and type and status values as words', async () => {
  api[`GET ${API}/csf/accounts/A-1`] = () => json(200, {
    accountId: 'A-1', balance: 1200.5, active: true, blocked: false, categories: [{ category_id: 'SEAT', amount: 3 }],
  });
  at('/de/de/fund');
  const f = await block('fund', [['Label account id', 'Kontonummer'], ['Label balance', 'Guthaben'], ['Label active', 'Aktiv'], ['Label blocked', 'Gesperrt'], ['Label categories', 'Kategorien'], ['Label category id', 'Kategorie'], ['Label amount', 'Anzahl'], ['Value SEAT', 'Sitzplatz']]);
  const t = text(f);
  assert.match(t, /Kontonummer A-1/);
  assert.match(t, /Guthaben 1\.200,5/);
  assert.match(t, /Aktiv Ja/);
  assert.match(t, /Gesperrt Nein/);
  assert.deepEqual([...f.querySelectorAll('thead th')].map((th) => th.textContent), ['Kategorie', 'Anzahl']);
  assert.match(t, /Sitzplatz 3/);
  assert.ok(!/true|false|Account id|Category id/.test(t), t);
  api[`GET ${API}/csf/accounts/A-1/orders/history`] = () => json(200, [{ transactionId: 'T-1', type: 'ORDER', status: 'COMPLETED', refundable: true }]);
  at('/de/de/history');
  const h = await block('history', [['Label transaction id', 'Transaktionsnummer'], ['Label type', 'Art'], ['Label status', 'Status'], ['Label refundable', 'Erstattbar'], ['Value order', 'Bestellung'], ['Value completed', 'Abgeschlossen'], ['Value true', 'ja']]);
  assert.deepEqual([...h.querySelectorAll('thead th')].map((th) => th.textContent), ['Transaktionsnummer', 'Art', 'Status', 'Erstattbar']);
  assert.deepEqual([...h.querySelectorAll('tbody td')].map((td) => td.textContent), ['T-1', 'Bestellung', 'Abgeschlossen', 'ja']);
  at('/de/en/history');
  const en = await block('history');
  assert.deepEqual([...en.querySelectorAll('tbody td')].map((td) => td.textContent).slice(-1), ['Yes'], 'built-in yes in English');
});

test('3. role codes as words; unknown codes, loginType and the name fields not shown', async () => {
  roles = { accounts: [account('A-1', 'C-1', ['CSF', 'REPORTING', 'ADMIN', 'KAM', 'X_INTERNAL'])] };
  at('/de/de/lhghome');
  const a = await block('accounts', [['Role ADMIN', 'Benutzerverwaltung']]);
  const t = text(a);
  assert.match(t, /Rollen Corporate Service Fund, Berichte, Benutzerverwaltung, Kundenbetreuung/);
  assert.ok(!/X_INTERNAL|CSF|REPORTING/.test(t), t);
  at('/de/de/profile');
  const p = await block('profile', [['Label email', 'E-Mail']]);
  const pt = text(p);
  assert.match(pt, /Name Max Mustermann/);
  assert.match(pt, /E-Mail max@example\.test/);
  assert.ok(!/EXT|Login type|First name|Last name|Mustermann.*Mustermann/.test(pt), pt);
});

test('4. phones: the facts stack below 600px, their values may shrink, a table scrolls in its own box', () => {
  const css = fs.readFileSync('blocks/b2b-member/b2b-member.css', 'utf8');
  assert.match(css, /\.b2b-member \.b2b-member-facts \{[^}]*grid-template-columns: minmax\(0, 1fr\);/);
  assert.match(css, /@media \(width >= 600px\) \{[^@]*\.b2b-member \.b2b-member-facts \{[^}]*grid-template-columns: max-content minmax\(0, 1fr\);/);
  assert.match(css, /\.b2b-member \.b2b-member-facts dd \{[^}]*min-width: 0;/);
  assert.match(css, /\.b2b-member \.b2b-member-table \{[^}]*display: block;[^}]*overflow-x: auto;/);
  assert.match(css, /\.b2b-member \.b2b-member-view \{[^}]*min-width: 0;/);
});
