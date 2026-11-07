/* eslint-disable max-len, import/no-extraneous-dependencies -- dev tooling; linkedom is a dev dependency */
/* blocks/b2b-member (Lufthansa Group for Business' member pages): one variant per view, its texts
   from the block's rows, its data from lh-backends (the site's own host):
   - dashboard: greeting with the name (session), the accounts (user/roles), tiles to fund and history
     (role CSF), reports (REPORTING), user management (ADMIN or KAM) as the roles allow;
   - fund (csf/accounts/{id}), history (…/orders/history), users (companies/{id}/users), reports
     (POST reporting/overview/{id}): the first account or company with the role, or ?account= /
     ?company= when the visitor has the role there;
   - profile (name, e-mail, company, account), accounts (staff: the companies they look after);
   - 401: the root's login page, back to this page after it; 403: the page's "Forbidden" text; no
     data: "Empty"; anything else: "Error"; numbers and dates for the page's language.
   Run: node --max-old-space-size=256 --test test/b2b-member.test.mjs */
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

const SESSION = {
  company: {
    firstName: 'Anna', lastName: 'Example', email: 'anna@example.test', loginType: 'EXT', home: '/de/en/home',
  },
  experts: null,
};
const ROLES = {
  accounts: [
    {
      accountId: 'U-1', accountName: 'Example GmbH, Germany', companyId: 'C-1', companyName: 'Example GmbH', programme: 'CIP', roles: ['BOOKER'],
    },
    {
      accountId: 'U-2', accountName: 'Example GmbH, Austria', companyId: 'C-1', companyName: 'Example GmbH', programme: 'CIP', roles: ['CSF', 'REPORTING', 'ADMIN'],
    },
  ],
};
let api;
let calls;
const json = (status, body, headers = {}) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', ...headers } });
beforeEach(() => {
  assigned = null;
  calls = [];
  api = {
    'GET /service/secured/api/b2bneo/session': () => json(200, SESSION),
    'GET /service/secured/api/b2bneo/user/roles': () => json(200, ROLES),
    'GET /service/secured/api/b2bneo/csf/accounts/U-2': () => json(200, { balance: { amount: 12450.5, currency: 'EUR' }, validUntil: '2027-03-31', categories: [{ categoryId: 'upgrades', name: 'Upgrade vouchers' }] }),
    'GET /service/secured/api/b2bneo/csf/accounts/U-2/orders/history': () => json(200, {
      transactions: [{
        transactionId: 'T-1', date: '2026-10-28', type: 'ORDER', product: 'Upgrade voucher', amount: -450, currency: 'EUR', status: 'COMPLETED',
      }],
    }),
    'GET /service/secured/api/b2bneo/companies/C-1/users': () => json(200, {
      users: [{
        userId: 'u1', firstName: 'Ben', lastName: 'Booker', email: 'ben@example.test', roles: ['BOOKER'],
      }],
    }),
    'POST /service/secured/api/b2bneo/reporting/overview/C-1': () => json(200, {
      period: { from: '2026-01-01', to: '2026-10-31' }, flights: 412, segments: 1688, revenue: { amount: 318400, currency: 'EUR' }, co2: { tonnes: 211.4 }, topRoutes: [{ route: 'FRA-JFK', segments: 64 }],
    }),
  };
  globalThis.fetch = async (url, init = {}) => {
    const key = `${init.method || 'GET'} ${String(url)}`;
    calls.push(key);
    const h = api[key];
    return h ? h() : json(404, { error: 'not-found' });
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
const text = (b) => b.innerHTML.replace(/<[^>]+>/g, ' ').replace(/&nbsp;|&#160;|\u00a0|\u202f/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ')
  .trim();

test('dashboard: the greeting with the name, the accounts, the tiles the roles allow', async () => {
  at('/de/en/home');
  const b = await block('dashboard', [['Greeting', 'Welcome, {name}'], ['Accounts title', 'Your accounts'], ['Fund tile', '<a href="/de/en/fund">Corporate Service Fund</a>'], ['History tile', '<a href="/de/en/history">Order history</a>'], ['Reports tile', '<a href="/de/en/reports">Reports</a>'], ['Users tile', '<a href="/de/en/usermanagement">User management</a>']]);
  assert.match(text(b), /Welcome, Anna Example/);
  assert.match(text(b), /Example GmbH, Germany/);
  assert.deepEqual([...b.querySelectorAll('.b2b-member-tiles a')].map((a) => [a.textContent, a.getAttribute('href')]), [['Corporate Service Fund', '/de/en/fund'], ['Order history', '/de/en/history'], ['Reports', '/de/en/reports'], ['User management', '/de/en/usermanagement']]);
  // a booker: the fund tiles only
  api['GET /service/secured/api/b2bneo/user/roles'] = () => json(200, { accounts: [{ ...ROLES.accounts[0], roles: ['BOOKER', 'CSF'] }] });
  const booker = await block('dashboard', [['Fund tile', '<a href="/de/en/fund">Fund</a>'], ['History tile', '<a href="/de/en/history">History</a>'], ['Reports tile', '<a href="/de/en/reports">Reports</a>'], ['Users tile', '<a href="/de/en/usermanagement">Users</a>']]);
  assert.deepEqual([...booker.querySelectorAll('.b2b-member-tiles a')].map((a) => a.textContent), ['Fund', 'History']);
});

test('fund: the account with CSF, its balance and validity for the page\'s language', async () => {
  at('/de/en/fund');
  const b = await block('fund', [['Balance label', 'Balance'], ['Valid until label', 'Valid until']]);
  assert.ok(calls.includes('GET /service/secured/api/b2bneo/csf/accounts/U-2'));
  assert.match(text(b), /Balance €12,450\.50/);
  assert.match(text(b), /Valid until 31 Mar 2027|Valid until Mar 31, 2027/);
  assert.match(text(b), /Upgrade vouchers/);
  at('/de/de/fund');
  const de = await block('fund', [['Balance label', 'Guthaben']]);
  assert.match(text(de), /Guthaben 12\.450,50\s€/);
});

test('history: the transactions, amounts and dates formatted', async () => {
  at('/de/en/history');
  const b = await block('history', [['Date label', 'Date'], ['Product label', 'Product'], ['Amount label', 'Amount']]);
  const cells = [...b.querySelectorAll('tbody td')].map((td) => td.textContent);
  assert.ok(cells.includes('Upgrade voucher'));
  assert.ok(cells.some((c) => /-€450\.00|−€450\.00/.test(c)), cells.join('|'));
  assert.ok([...b.querySelectorAll('thead th')].some((th) => th.textContent === 'Product'));
});

test('users and reports: the company with the role', async () => {
  at('/de/en/usermanagement');
  const u = await block('users', [['Name label', 'Name'], ['Email label', 'E-mail']]);
  assert.ok(calls.includes('GET /service/secured/api/b2bneo/companies/C-1/users'));
  assert.match(text(u), /Ben Booker/);
  at('/de/en/reports');
  const r = await block('reports', [['Flights label', 'Flights'], ['Segments label', 'Segments'], ['Top routes title', 'Top routes']]);
  assert.ok(calls.includes('POST /service/secured/api/b2bneo/reporting/overview/C-1'));
  assert.match(text(r), /Flights 412/);
  assert.match(text(r), /Segments 1,688/);
  assert.match(text(r), /FRA-JFK/);
});

test('profile and accounts', async () => {
  at('/de/en/profile');
  const p = await block('profile', [['Name label', 'Name'], ['Email label', 'E-mail'], ['Company label', 'Company']]);
  assert.match(text(p), /Name Anna Example/);
  assert.match(text(p), /anna@example\.test/);
  assert.match(text(p), /Company Example GmbH/);
  at('/de/en/lhghome');
  api['GET /service/secured/api/b2bneo/user/roles'] = () => json(200, {
    accounts: [{
      accountId: 'U-1', accountName: 'A', companyId: 'C-1', companyName: 'Example GmbH', programme: 'CIP', roles: ['KAM'],
    }, {
      accountId: 'U-9', accountName: 'B', companyId: 'C-9', companyName: 'Sample AG', programme: 'PPB', roles: ['KAM'],
    }],
  });
  const a = await block('accounts', [['Company label', 'Company']]);
  assert.deepEqual([...a.querySelectorAll('.b2b-member-company-name')].map((n) => n.textContent), ['Example GmbH', 'Sample AG']);
});

test('401: the login page, back to this page after it', async () => {
  at('/de/en/fund', '?account=U-2');
  api['GET /service/secured/api/b2bneo/user/roles'] = () => json(401, { error: 'not-signed-in' });
  await block('fund');
  assert.equal(assigned, '/de/en/login?redirect=%2Fde%2Fen%2Ffund%3Faccount%3DU-2');
});

test('403, empty and errors: the page\'s texts', async () => {
  at('/de/en/fund');
  api['GET /service/secured/api/b2bneo/csf/accounts/U-2'] = () => json(403, { error: 'forbidden' });
  const f = await block('fund', [['Forbidden', 'You have no access to the fund.'], ['Empty', 'Nothing here yet.'], ['Error', 'Something went wrong.']]);
  assert.match(text(f), /You have no access to the fund\./);
  // no account with the role: empty
  api['GET /service/secured/api/b2bneo/user/roles'] = () => json(200, { accounts: [ROLES.accounts[0]] });
  const e = await block('fund', [['Forbidden', 'No access.'], ['Empty', 'Nothing here yet.']]);
  assert.match(text(e), /Nothing here yet\./);
  api['GET /service/secured/api/b2bneo/user/roles'] = () => json(500, {});
  const x = await block('history', [['Error', 'Something went wrong.']]);
  assert.match(text(x), /Something went wrong\./);
  assert.equal(assigned, null);
});

test('?account= picks that account only when it has the role', async () => {
  at('/de/en/fund', '?account=U-1');
  await block('fund');
  assert.ok(calls.includes('GET /service/secured/api/b2bneo/csf/accounts/U-2'), 'U-1 has no CSF: the account with it');
});
