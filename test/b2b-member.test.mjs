/* eslint-disable max-len, import/no-extraneous-dependencies -- dev tooling; linkedom is a dev dependency */
/* blocks/b2b-member (Lufthansa Group for Business' member pages): one variant per view, its texts
   from the block's rows, its data from lh-backends on the site's own host, read as the brief's
   contract describes it (and nothing more):
   - session: { company: { firstName, lastName, email, loginType, home }, experts: { name, surname,
     email, country, language, home } }, each null when not signed in that way;
   - user/roles: { accounts: [{ accountId, accountName, companyId, companyName, programme, roles }] },
     401 when not signed in;
   - csf/accounts/{id}, …/orders/history, companies/{companyId}/users, POST
     reporting/overview/{companyId}: 403 without the rights.
   The views: dashboard (greeting, the document's tiles, the accounts), profile (the person's
   fields, company and account), accounts (the companies and their accounts); fund, history, users
   and reports show the answer as it comes (an object as a list of its fields, a list of objects as
   a table; labels and values from the rows "Label <field>" and "Value <value>", "Hide | fields").
   401: the login page and back; 403: "Forbidden"; nothing to show: "Empty"; anything else: "Error".
   Fixtures are invented. Run: node --max-old-space-size=256 --test test/b2b-member.test.mjs */
/* global globalThis */
import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
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
// (the brief's shapes; every right on both accounts: test/b2b-member-roles.test.mjs has the roles)
const SESSION = {
  company: {
    firstName: 'Anna', lastName: 'Example', email: 'anna@example.test', loginType: 'EXT', home: '/de/en/home',
  },
  experts: null,
};
const ROLES = {
  accounts: [
    {
      accountId: 'A-1', accountName: 'Example GmbH, Germany', companyId: 'C-1', companyName: 'Example GmbH', programme: 'Programme X', roles: ['CSF', 'REPORTING', 'ADMIN'],
    },
    {
      accountId: 'A-2', accountName: 'Example GmbH, Austria', companyId: 'C-2', companyName: 'Example Austria', programme: 'Programme X', roles: ['CSF', 'REPORTING', 'ADMIN'],
    },
  ],
};
let api;
let calls;
const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
beforeEach(() => {
  assigned = null;
  calls = [];
  api = {
    [`GET ${API}/session`]: () => json(200, SESSION),
    [`GET ${API}/user/roles`]: () => json(200, ROLES),
    [`GET ${API}/csf/accounts/A-1`]: () => json(200, { remaining: 1200.5, expires: '2027-01-31', usableFor: ['Seats', 'Upgrades'] }),
    [`GET ${API}/csf/accounts/A-1/orders/history`]: () => json(200, { entries: [{ day: '2026-10-28', what: 'Seat', sum: -45, state: 'done' }] }),
    [`GET ${API}/companies/C-1/users`]: () => json(200, [{ name: 'Ben Booker', duty: 'booker' }]),
    [`POST ${API}/reporting/overview/C-1`]: () => json(200, { trips: 412, summary: { km: 123456 } }),
  };
  globalThis.fetch = async (url, init = {}) => {
    const key = `${init.method || 'GET'} ${String(url)}`;
    calls.push(key);
    const h = api[key];
    return h ? h() : json(404, {});
  };
});
const { default: decorate } = await import('../blocks/b2b-member/b2b-member.js');

const block = async (variant, rows = []) => {
  const b = document.createElement('div');
  b.className = `b2b-member ${variant}`;
  b.innerHTML = rows.map(([k, v]) => `<div><div>${k}</div><div>${v}</div></div>`).join('');
  document.querySelector('main').replaceChildren(b);
  await decorate(b);
  return b;
};
const text = (b) => b.innerHTML.replace(/<[^>]+>/g, ' ').replace(/&nbsp;|&#160;| | /g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ')
  .trim();
const tiles = (b) => [...b.querySelectorAll('.b2b-member-tiles a')].map((a) => [a.textContent, a.getAttribute('href')]);

test('dashboard: the greeting with the session\'s name, the document\'s tiles, the accounts', async () => {
  at('/de/en/home');
  const b = await block('dashboard', [['Greeting', 'Welcome, {name}'], ['Accounts title', 'Your accounts'], ['Fund tile', '<a href="/de/en/fund">Fund</a>'], ['Reports tile', '<a href="/de/en/reports">Reports</a>']]);
  assert.match(text(b), /Welcome, Anna Example/);
  assert.match(text(b), /Your accounts Example GmbH, Germany/);
  assert.deepEqual(tiles(b), [['Fund', '/de/en/fund'], ['Reports', '/de/en/reports']]);
  // no tile rows: the four member pages with the built-in texts
  const plain = await block('dashboard');
  assert.deepEqual(tiles(plain).map(([, h]) => h), ['/de/en/fund', '/de/en/history', '/de/en/reports', '/de/en/usermanagement']);
  assert.ok(!calls.some((c) => c.includes('/csf/') || c.includes('/reporting/')), 'the dashboard asks for no view data');
});

test('fund: the first account\'s answer as a list of its fields, in the page\'s language; labels from the rows', async () => {
  at('/de/en/fund');
  const b = await block('fund', [['Label remaining', 'Balance']]);
  assert.ok(calls.includes(`GET ${API}/csf/accounts/A-1`));
  assert.match(text(b), /Balance 1,200\.5/);
  assert.match(text(b), /Expires (Jan 31, 2027|31 Jan 2027)/);
  assert.deepEqual([...b.querySelectorAll('.b2b-member-view li')].map((li) => li.textContent), ['Seats', 'Upgrades']);
  at('/de/de/fund');
  const de = await block('fund', [['Label remaining', 'Guthaben']]);
  assert.match(text(de), /Guthaben 1\.200,5/);
  assert.match(text(de), /31\.01\.2027/);
});

test('history: a list of objects as a table; values from the rows', async () => {
  at('/de/en/history');
  const b = await block('history', [['Label what', 'Product'], ['Value done', 'Completed']]);
  assert.deepEqual([...b.querySelectorAll('thead th')].map((th) => th.textContent), ['Day', 'Product', 'Sum', 'State']);
  const cells = [...b.querySelectorAll('tbody td')].map((td) => td.textContent);
  assert.deepEqual(cells.slice(1), ['Seat', '-45', 'Completed']);
  assert.match(cells[0], /Oct 28, 2026|28 Oct 2026/);
});

test('users and reports: the company of the first account, or ?company=', async () => {
  at('/de/en/usermanagement');
  const u = await block('users');
  assert.ok(calls.includes(`GET ${API}/companies/C-1/users`));
  assert.match(text(u), /Ben Booker/);
  at('/de/en/reports');
  const r = await block('reports');
  assert.ok(calls.includes(`POST ${API}/reporting/overview/C-1`));
  assert.match(text(r), /Trips 412/);
  assert.match(text(r), /Km 123,456/);
  at('/de/en/usermanagement', '?company=C-2');
  api[`GET ${API}/companies/C-2/users`] = () => json(200, []);
  const c2 = await block('users', [['Empty', 'No users yet.']]);
  assert.ok(calls.includes(`GET ${API}/companies/C-2/users`));
  assert.match(text(c2), /No users yet\./);
});

test('?account= picks that account', async () => {
  at('/de/en/fund', '?account=A-2');
  api[`GET ${API}/csf/accounts/A-2`] = () => json(200, { remaining: 5 });
  await block('fund');
  assert.ok(calls.includes(`GET ${API}/csf/accounts/A-2`));
});

test('profile: the person\'s fields (home left out), company and account; accounts: the companies', async () => {
  at('/de/en/profile');
  const p = await block('profile', [['Label email', 'E-mail']]);
  assert.match(text(p), /Name Anna Example/);
  assert.match(text(p), /E-mail anna@example\.test/);
  assert.match(text(p), /Company Example GmbH/);
  assert.match(text(p), /Account Example GmbH, Germany/);
  assert.ok(!/\/de\/en\/home/.test(text(p)), 'no home');
  at('/de/en/lhghome');
  const a = await block('accounts');
  assert.deepEqual([...a.querySelectorAll('.b2b-member-company-name')].map((n) => n.textContent), ['Example GmbH', 'Example Austria']);
  assert.match(text(a), /Programme X/);
});

test('Hide: fields left out', async () => {
  at('/de/en/fund');
  const b = await block('fund', [['Hide', 'expires, usableFor']]);
  assert.match(text(b), /Remaining 1,200\.5/);
  assert.ok(!/Expires|Seats/.test(text(b)));
});

test('401 (roles or the view): the login page, back to this page after it', async () => {
  at('/de/en/fund', '?account=A-1');
  api[`GET ${API}/user/roles`] = () => json(401, {});
  await block('fund');
  assert.equal(assigned, '/de/en/login?redirect=%2Fde%2Fen%2Ffund%3Faccount%3DA-1');
  assigned = null;
  api[`GET ${API}/user/roles`] = () => json(200, ROLES);
  api[`GET ${API}/csf/accounts/A-1`] = () => json(401, {});
  at('/de/en/fund');
  await block('fund');
  assert.equal(assigned, '/de/en/login?redirect=%2Fde%2Fen%2Ffund');
});

test('403, empty and errors: the page\'s texts', async () => {
  at('/de/en/fund');
  api[`GET ${API}/csf/accounts/A-1`] = () => json(403, {});
  const f = await block('fund', [['Forbidden', 'You have no access to the fund.']]);
  assert.match(text(f), /You have no access to the fund\./);
  api[`GET ${API}/csf/accounts/A-1`] = () => json(200, {});
  const e = await block('fund', [['Empty', 'Nothing here yet.']]);
  assert.match(text(e), /Nothing here yet\./);
  api[`GET ${API}/user/roles`] = () => json(200, { accounts: [] });
  const none = await block('history', [['Empty', 'Nothing here yet.']]);
  assert.match(text(none), /Nothing here yet\./);
  api[`GET ${API}/user/roles`] = () => json(500, {});
  const x = await block('history', [['Error', 'Something went wrong.']]);
  assert.match(text(x), /Something went wrong\./);
  assert.equal(assigned, null);
});
