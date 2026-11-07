/* eslint-disable max-len, import/no-extraneous-dependencies -- dev tooling; linkedom is a dev dependency */
/* Lufthansa Group for Business' member pages in German and English, with the member answers recorded
   on b2b.turnsthe.page (test/fixtures/b2b-member-answers-001: mock.travelmanager, mock.booker,
   mock.ppb; invented data) and the documents' rows (tools/importer/lh-b2b-member-rows.json):
   - the rows cover the answers: every field has a label row in both languages (by the field's words),
     every code value (types, statuses) a value row, every role code a role row; the category ids are
     hidden (Hide | categoryId);
   - rendered with the rows, no field shows its raw name or an English label on de/de, and no code
     value or role code shows raw (category names and product texts are the backend's data, as they
     come; currencies stay ISO codes);
   - the roles in an answer (users' roles) as role words, unknown codes left out; 403 answers the
     page's Forbidden text.
   Run: node --max-old-space-size=384 --test test/b2b-member-answers-001.test.mjs */
/* global globalThis */
import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html lang="de"><head></head><body><main></main></body></html>');
globalThis.window = window;
globalThis.document = document;
const at = (pathname) => {
  window.location = {
    hostname: 'b2b.turnsthe.page', pathname, search: '', href: `https://b2b.turnsthe.page${pathname}`, origin: 'https://b2b.turnsthe.page', assign: () => {},
  };
};

const FIX = 'test/fixtures/b2b-member-answers-001';
const answer = (account, call) => JSON.parse(fs.readFileSync(`${FIX}/${account}/${call}.json`, 'utf8'));
const ROWS = JSON.parse(fs.readFileSync('tools/importer/lh-b2b-member-rows.json', 'utf8')).pages;
const API = '/service/secured/api/b2bneo';
const VIEWS = {
  fund: { page: 'fund', call: 'fund' }, history: { page: 'history', call: 'history' }, users: { page: 'usermanagement', call: 'users' }, reports: { page: 'reports', call: 'reports' },
};
// the answers' status per account (the capture's README)
const FORBIDDEN = { 'mock.booker': ['users', 'reports'], 'mock.ppb': ['reports'] };
const ACCOUNTS = ['mock.travelmanager', 'mock.booker', 'mock.ppb'];

let current;
const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
beforeEach(() => {
  globalThis.fetch = async (url, init = {}) => {
    const u = String(url);
    const method = init.method || 'GET';
    const { account } = current;
    if (u === `${API}/session`) {
      return json(200, {
        company: {
          firstName: 'Anna', lastName: 'Berger', email: 'x@example.test', loginType: 'EXT', home: '/de/de/home',
        },
        experts: null,
      });
    }
    if (u === `${API}/user/roles`) return json(200, answer(account, 'roles'));
    const call = (u.endsWith('/orders/history') && 'history') || (u.includes('/csf/accounts/') && 'fund') || (u.includes('/users') && 'users') || (method === 'POST' && u.includes('/reporting/overview/') && 'reports');
    if (!call) return json(404, {});
    return json((FORBIDDEN[account] || []).includes(call) ? 403 : 200, answer(account, call));
  };
});
const { default: decorate } = await import('../blocks/b2b-member/b2b-member.js');

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const block = async (variant, rows) => {
  const b = document.createElement('div');
  b.className = `b2b-member ${variant}`;
  const cells = rows.map(([k, v]) => `<div><div>${esc(k)}</div><div>${esc(v)}</div></div>`).join('');
  b.innerHTML = `${cells}<div><div>Forbidden</div><div>Kein Zugriff.</div></div>`;
  document.querySelector('main').replaceChildren(b);
  await decorate(b);
  return b;
};
const words = (key) => String(key).replace(/([a-z\d])([A-Z])/g, '$1 $2').replace(/[_-]+/g, ' ').trim()
  .toLowerCase();
const keyOf = (t) => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const hidden = (rows) => ((rows.find(([k]) => k === 'Hide') || [])[1] || '').split(',').map((x) => x.trim()).filter(Boolean);
// a code value: capitals and underscores (ORDER, COMPLETED), not a currency (an ISO code)
const CODE = /^[A-Z][A-Z_]+$/;
const walk = (v, fn, key = '') => {
  if (Array.isArray(v)) v.forEach((x) => walk(x, fn, key));
  else if (v && typeof v === 'object') Object.entries(v).forEach(([k, x]) => { fn('key', k); walk(x, fn, k); });
  else fn('value', v, key);
};

test('the rows cover every field, code value and role of the recorded answers, in English and German', () => {
  const missing = [];
  ACCOUNTS.forEach((account) => Object.values(VIEWS).forEach(({ page, call }) => {
    if ((FORBIDDEN[account] || []).includes(call)) return;
    ['en', 'de'].forEach((lang) => {
      const rows = ROWS[page][lang];
      const keys = new Set(rows.map(([k]) => keyOf(k)));
      const hide = hidden(rows);
      walk(answer(account, call), (kind, x, key) => {
        if (kind === 'key' && !hide.includes(x) && !keys.has(keyOf(`label ${words(x)}`))) missing.push(`${lang} ${page}: Label ${words(x)}`);
        if (kind === 'value' && key === 'roles' && !keys.has(keyOf(`role ${x}`))) missing.push(`${lang} ${page}: Role ${x}`);
        if (kind === 'value' && key !== 'roles' && key !== 'currency' && typeof x === 'string' && CODE.test(x) && !keys.has(keyOf(`value ${x}`))) missing.push(`${lang} ${page}: Value ${x}`);
        if (kind === 'value' && typeof x === 'boolean' && !keys.has(keyOf(`value ${x}`))) missing.push(`${lang} ${page}: Value ${x}`);
      });
    });
  }));
  assert.ok(!missing.length, [...new Set(missing)].join('; '));
  // the accounts page (staff): the role words
  ['en', 'de'].forEach((lang) => ['CSF', 'REPORTING', 'ADMIN', 'BOOKER', 'KAM'].forEach((c) => assert.ok(ROWS.lhghome[lang].some(([k]) => k === `Role ${c}`), `${lang} lhghome Role ${c}`)));
});

const shown = (b) => ({
  labels: [...b.querySelectorAll('dt, th')].map((n) => n.textContent.trim()),
  values: [...b.querySelectorAll('dd, td, li')].filter((n) => !n.querySelector('dl, table, ul')).map((n) => n.textContent.trim()),
});
// a cell's parts (a list of values joined with commas)
const parts = (values) => values.flatMap((v) => v.split(/,\s*/));

test('de/de: every label German (a row\'s text, no field name), no code value or role code raw, no category id', async () => {
  const cases = ACCOUNTS.flatMap((account) => Object.entries(VIEWS).map(([view, v]) => ({ account, view, ...v })));
  // one after the other (the block reads the page's address and the shared fetch)
  await cases.reduce((done, {
    account, view, page, call,
  }) => done.then(async () => {
    at(`/de/de/${page}`);
    current = { account };
    const rows = ROWS[page].de;
    const b = await block(view, rows);
    if ((FORBIDDEN[account] || []).includes(call)) {
      assert.ok(b.textContent.includes('Kein Zugriff.'), `${account} ${view}: the Forbidden text`);
      return;
    }
    const { labels, values } = shown(b);
    const allowed = new Set(rows.map(([, v]) => v));
    const bad = labels.filter((l) => !allowed.has(l));
    assert.ok(!bad.length, `${account} ${view}: labels not from the rows: ${bad.join(', ')}`);
    const raw = parts(values).filter((v) => CODE.test(v) && !/^[A-Z]{3}$/.test(v) && !/^[A-Z]{3}-[A-Z]{3}$/.test(v));
    assert.ok(!raw.length, `${account} ${view}: raw codes: ${raw.join(', ')}`);
    ['upgrades', 'status', 'saf', 'true', 'false', 'ADMIN', 'BOOKER', 'REPORTING', 'CSF'].forEach((code) => assert.ok(!parts(values).includes(code), `${account} ${view}: ${code} shown`));
  }), Promise.resolve());
});

test('de/de examples: the fund, the history\'s codes, the users\' roles and the report\'s fields in German', async () => {
  current = { account: 'mock.travelmanager' };
  at('/de/de/fund');
  const f = shown(await block('fund', ROWS.fund.de));
  ['Konto-ID', 'Guthaben', 'Betrag', 'Währung', 'Gültig bis', 'Kategorien', 'Name', 'Verfügbar'].forEach((l) => assert.ok(f.labels.includes(l), `fund ${l}`));
  assert.ok(f.values.includes('Upgrade vouchers') && f.values.includes('Ja'), 'the categories: their names as they come, available Ja');
  assert.ok(!f.labels.includes('Category id') && !f.labels.includes('Kategorie-ID'), 'no id column');
  at('/de/de/history');
  const h = shown(await block('history', ROWS.history.de));
  ['Gutschrift', 'In Bearbeitung', 'Bestellung', 'Abgeschlossen'].forEach((v) => assert.ok(h.values.includes(v), `history ${v}`));
  ['Transaktionen', 'Produkt', 'Betrag', 'Währung'].forEach((l) => assert.ok(h.labels.includes(l), `history ${l}`));
  at('/de/de/usermanagement');
  const u = shown(await block('users', ROWS.usermanagement.de));
  ['Unternehmens-ID', 'Benutzer', 'Benutzer-ID', 'Vorname', 'Nachname', 'Rollen'].forEach((l) => assert.ok(u.labels.includes(l), `users ${l}`));
  assert.ok(u.values.includes('Benutzerverwaltung, Berichte, Corporate Service Fund'), `users: ${u.values.join(' | ')}`);
  assert.ok(u.values.includes('Buchung, Corporate Service Fund'), 'BOOKER, CSF');
  at('/de/de/reports');
  const r = shown(await block('reports', ROWS.reports.de));
  ['Unternehmens-ID', 'Zeitraum', 'Von', 'Bis', 'Flüge', 'Segmente', 'Umsatz', 'CO₂-Emissionen', 'Tonnen', 'Meistgeflogene Strecken', 'Strecke'].forEach((l) => assert.ok(r.labels.includes(l), `reports ${l}`));
  assert.ok(r.values.includes('211,4') && r.values.includes('FRA-JFK'), 'numbers in German, the routes as they come');
});

test('de/en: the same with the English rows', async () => {
  current = { account: 'mock.travelmanager' };
  at('/de/en/usermanagement');
  const u = shown(await block('users', ROWS.usermanagement.en));
  assert.ok(u.labels.includes('First name') && u.values.includes('Booking, Corporate Service Fund'), u.values.join(' | '));
  at('/de/en/history');
  const h = shown(await block('history', ROWS.history.en));
  assert.ok(h.values.includes('Credit') && h.values.includes('Pending'), h.values.join(' | '));
});

test('the role words built in without rows (BOOKER; KAM in German) and unknown role codes left out', async () => {
  current = { account: 'mock.travelmanager' };
  const roles = answer('mock.travelmanager', 'users');
  roles.users[0].roles = ['ADMIN', 'KAM', 'X_UNKNOWN'];
  const saved = globalThis.fetch;
  globalThis.fetch = async (url, init) => (String(url).endsWith('/users') ? json(200, roles) : saved(url, init));
  at('/de/de/usermanagement');
  const u = shown(await block('users', []));
  assert.ok(u.values.includes('Benutzerverwaltung, Kundenbetreuung'), u.values.join(' | '));
  assert.ok(u.values.includes('Buchung, Corporate Service Fund'), 'BOOKER built in');
  globalThis.fetch = saved;
});
