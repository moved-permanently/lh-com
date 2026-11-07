/* eslint-disable max-len, import/no-extraneous-dependencies -- dev tooling; linkedom is a dev dependency */
/* blocks/b2b-login (Lufthansa Group for Business' sign-in pages /<root>/login and /<root>/login_internal):
   a plain HTML form (POST /<cc>/<ll>/j_security_check: j_username, j_password, loginType, resource;
   it works without script: lh-backends then answers with redirects) that the script sends with
   j_validate=true; loginType DESMON with a row "Type | staff", else EXT; resource the page's
   ?redirect= when it is a path on this host; on 200 the visitor goes to the answer's redirectURL;
   the page's own texts for wrong credentials (403 invalid-login), no rights (auth_status
   NOT_AUTHORIZED), backend errors (login_status backend-not-available, anything else) and for
   ?error= after a sign-in without script. Show / hide password; the Forgotten Password link.
   Run: node --max-old-space-size=256 --test test/b2b-login.test.mjs */
/* global globalThis */
import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html lang="en"><head></head><body><main></main></body></html>');
globalThis.window = window;
globalThis.document = document;
globalThis.URLSearchParams = URLSearchParams;
let assigned;
const at = (pathname, search = '') => {
  window.location = {
    hostname: 'b2b.turnsthe.page', host: 'b2b.turnsthe.page', pathname, search, href: `https://b2b.turnsthe.page${pathname}${search}`, origin: 'https://b2b.turnsthe.page', assign: (u) => { assigned = u; },
  };
};
let posts;
let answer;
beforeEach(() => {
  assigned = null;
  posts = [];
  answer = () => new Response(JSON.stringify({ redirectURL: '/de/en/home', user: { firstName: 'A', lastName: 'B' } }), { status: 200, headers: { 'content-type': 'application/json' } });
  globalThis.fetch = async (url, init = {}) => {
    posts.push({ url: String(url), method: init.method, body: String(init.body) });
    return answer();
  };
});
const { default: decorate } = await import('../blocks/b2b-login/b2b-login.js');

const ROWS = [
  ['User name label', 'User name'], ['Password label', 'Password'], ['Show password', 'Show password'], ['Hide password', 'Hide password'],
  ['Forgotten password', '<a href="https://business.lufthansagroup.com/de/en/forgotten-password">Forgotten Password</a>'], ['Submit label', 'Login'],
  ['Invalid login', 'The user name or password is wrong.'], ['No rights', 'Your account has no access to this portal.'], ['Backend error', 'The login is not available right now.'],
];
const block = (extra = []) => {
  const b = document.createElement('div');
  b.className = 'b2b-login';
  b.innerHTML = [...ROWS, ...extra].map(([k, v]) => `<div><div>${k}</div><div>${v}</div></div>`).join('');
  document.querySelector('main').replaceChildren(b);
  decorate(b);
  return b;
};
const submit = async (b, user = 'someone', pass = 'secret') => {
  b.querySelector('input[name="j_username"]').value = user;
  b.querySelector('input[name="j_password"]').value = pass;
  const ev = new window.Event('submit', { cancelable: true });
  b.querySelector('form').dispatchEvent(ev);
  await new Promise((r) => { setTimeout(r, 20); });
  return ev;
};
const message = (b) => {
  const m = b.querySelector('.b2b-login-message');
  return m.hidden ? '' : m.textContent;
};

test('the plain form: action, fields, loginType EXT, resource the root\'s home; labels and link from the rows', () => {
  at('/de/en/login');
  const b = block();
  const form = b.querySelector('form');
  assert.equal(form.getAttribute('method'), 'post');
  assert.equal(form.getAttribute('action'), '/de/en/j_security_check');
  assert.equal(b.querySelector('input[name="j_username"]').getAttribute('autocomplete'), 'username');
  assert.equal(b.querySelector('input[name="j_password"]').getAttribute('type'), 'password');
  assert.equal(b.querySelector('input[name="loginType"]').value, 'EXT');
  assert.equal(b.querySelector('input[name="resource"]').value, '/de/en/home');
  assert.equal(b.querySelector('label[for]').textContent, 'User name');
  assert.equal(b.querySelector('button[type="submit"]').textContent, 'Login');
  assert.equal(b.querySelector('.b2b-login-forgotten a').getAttribute('href'), 'https://business.lufthansagroup.com/de/en/forgotten-password');
  assert.equal(message(b), '');
});

test('staff (Type | staff): DESMON, the staff home', () => {
  at('/de/de/login_internal');
  const b = block([['Type', 'staff']]);
  assert.equal(b.querySelector('input[name="loginType"]').value, 'DESMON');
  assert.equal(b.querySelector('input[name="resource"]').value, '/de/de/lhghome');
});

test('?redirect=: a path on this host only', () => {
  at('/de/en/login', '?redirect=%2Fde%2Fen%2Ffund%3Faccount%3D1');
  assert.equal(block().querySelector('input[name="resource"]').value, '/de/en/fund?account=1');
  ['?redirect=https%3A%2F%2Fevil.example%2Fx', '?redirect=%2F%2Fevil.example', '?redirect=%2F%5Cevil', '?redirect=javascript%3Aalert(1)'].forEach((s) => {
    at('/de/en/login', s);
    assert.equal(block().querySelector('input[name="resource"]').value, '/de/en/home', s);
  });
  at('/de/en/login', '?redirect=https%3A%2F%2Fb2b.turnsthe.page%2Fde%2Fen%2Freports');
  assert.equal(block().querySelector('input[name="resource"]').value, '/de/en/reports');
});

test('show / hide password', () => {
  at('/de/en/login');
  const b = block();
  const toggle = b.querySelector('.b2b-login-toggle');
  const input = b.querySelector('input[name="j_password"]');
  assert.equal(toggle.textContent, 'Show password');
  toggle.dispatchEvent(new window.Event('click'));
  assert.equal(input.getAttribute('type'), 'text');
  assert.equal(toggle.getAttribute('aria-pressed'), 'true');
  assert.equal(toggle.textContent, 'Hide password');
  toggle.dispatchEvent(new window.Event('click'));
  assert.equal(input.getAttribute('type'), 'password');
});

test('submit: j_validate=true with the fields; 200: to redirectURL', async () => {
  at('/de/en/login', '?redirect=%2Fde%2Fen%2Freports');
  const b = block();
  const ev = await submit(b);
  assert.ok(ev.defaultPrevented);
  assert.equal(posts.length, 1);
  assert.equal(posts[0].url, '/de/en/j_security_check');
  assert.equal(posts[0].method, 'POST');
  const sent = new URLSearchParams(posts[0].body);
  assert.deepEqual(Object.fromEntries(sent), {
    j_username: 'someone', j_password: 'secret', loginType: 'EXT', resource: '/de/en/reports', j_validate: 'true',
  });
  assert.equal(assigned, '/de/en/home');
});

test('a redirectURL off this host is not followed (the resource instead)', async () => {
  at('/de/en/login');
  answer = () => new Response(JSON.stringify({ redirectURL: 'https://evil.example/x' }), { status: 200, headers: { 'content-type': 'application/json' } });
  await submit(block());
  assert.equal(assigned, '/de/en/home');
});

test('the page\'s texts: wrong credentials, no rights, backend errors', async () => {
  at('/de/en/login');
  const cases = [
    [() => new Response('{"error":"invalid-login"}', { status: 403, headers: { 'content-type': 'application/json' } }), 'The user name or password is wrong.'],
    [() => new Response('{"error":"not-authorized"}', { status: 200, headers: { 'content-type': 'application/json', auth_status: 'NOT_AUTHORIZED' } }), 'Your account has no access to this portal.'],
    [() => new Response('{"error":"backend-not-available"}', { status: 200, headers: { 'content-type': 'application/json', login_status: 'backend-not-available' } }), 'The login is not available right now.'],
    [() => new Response('{"error":"cross-site"}', { status: 403, headers: { 'content-type': 'application/json' } }), 'The login is not available right now.'],
    [() => new Response('Not found', { status: 404 }), 'The login is not available right now.'],
    [() => { throw new Error('offline'); }, 'The login is not available right now.'],
  ];
  // eslint-disable-next-line no-restricted-syntax
  for (const [a, text] of cases) {
    answer = a;
    const b = block();
    // eslint-disable-next-line no-await-in-loop
    await submit(b);
    assert.equal(message(b), text);
    assert.equal(assigned, null);
    assert.equal(b.querySelector('.b2b-login-message').getAttribute('role'), 'alert');
  }
});

test('?error= after a sign-in without script: the same texts', () => {
  [['invalid-login', 'The user name or password is wrong.'], ['not-authorized', 'Your account has no access to this portal.'], ['backend-not-available', 'The login is not available right now.']].forEach(([code, text]) => {
    at('/de/en/login', `?error=${code}`);
    assert.equal(message(block()), text);
  });
});

test('German defaults when a row is missing', () => {
  at('/de/de/login');
  const b = document.createElement('div');
  b.className = 'b2b-login';
  document.documentElement.setAttribute('lang', 'de');
  document.querySelector('main').replaceChildren(b);
  decorate(b);
  assert.equal(b.querySelector('label[for]').textContent, 'Benutzername');
  assert.equal(b.querySelector('.b2b-login-forgotten a').getAttribute('href'), 'https://business.lufthansagroup.com/de/de/forgotten-password');
  document.documentElement.setAttribute('lang', 'en');
});
