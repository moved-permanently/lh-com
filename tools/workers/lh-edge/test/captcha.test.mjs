/* AMS rest A6: www's bot check URL over the lh-forms binding (BotCheck.verify) */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import worker, { routeOf } from '../src/index.js';
import { CAPTCHA_PATH } from '../src/captcha.js';

const HOST = 'https://lh-edge.example';
const VERIFY_URL = `${HOST}${CAPTCHA_PATH}`;
// lh-forms' BotCheck as it answers with Cloudflare's always-pass test secret: any token is valid,
// except the ones this fake treats as failing
const calls = [];
const BOT_CHECK = {
  verify: async (token, ip) => {
    calls.push({ token, ip });
    if (token === 'throw') throw new Error('binding down');
    return token !== 'bad-token';
  },
};
const env = (extra = {}) => ({ ORIGIN: 'main--lh-com--moved-permanently.aem.live', BOT_CHECK, ...extra });
const post = (body, headers = {}) => new Request(VERIFY_URL, {
  method: 'POST', body, headers: { 'CF-Connecting-IP': '203.0.113.5', ...headers },
});

async function check(res, success) {
  assert.equal(res.status, 200);
  assert.equal(res.headers.get('content-type'), 'application/json');
  assert.equal(res.headers.get('access-control-allow-origin'), '*');
  assert.equal(res.headers.get('cache-control'), 'no-store');
  assert.deepEqual(await res.json(), { success });
}

test('captcha verify: the route comes before the backends route', () => {
  assert.equal(routeOf(new Request(VERIFY_URL, { method: 'POST' })).name, 'captcha-verify');
  assert.equal(routeOf(new Request(VERIFY_URL)).name, 'captcha-verify');
  assert.equal(routeOf(new Request(`${HOST}/service/secured/api/captcha/other`)).name, 'backends');
});

test('captcha verify: a valid token → {"success":true}; the token and IP go to lh-forms', async () => {
  calls.length = 0;
  await check(await worker.fetch(post(new URLSearchParams({ token: 'XXXX.DUMMY.TOKEN.XXXX' })), env()), true);
  const fd = new FormData();
  fd.append('token', 'XXXX.DUMMY.TOKEN.XXXX');
  await check(await worker.fetch(post(fd), env()), true);
  assert.deepEqual(calls, [
    { token: 'XXXX.DUMMY.TOKEN.XXXX', ip: '203.0.113.5' },
    { token: 'XXXX.DUMMY.TOKEN.XXXX', ip: '203.0.113.5' },
  ]);
});

test('captcha verify: everything else → 200 {"success":false}', async () => {
  calls.length = 0;
  const cases = [
    () => worker.fetch(post(new URLSearchParams({ token: 'bad-token' })), env()),
    () => worker.fetch(post(new URLSearchParams({ token: 'throw' })), env()),
    () => worker.fetch(post(new URLSearchParams({ other: 'x' })), env()),
    () => worker.fetch(post(new URLSearchParams({ token: '   ' })), env()),
    () => worker.fetch(post('{"token":"x"', { 'content-type': 'multipart/form-data; boundary=zz' }), env()),
    () => worker.fetch(post(new URLSearchParams({ token: 'x'.repeat(20000) })), env()),
    () => worker.fetch(post(new URLSearchParams({ token: 'ok' })), env({ BOT_CHECK: undefined })),
    () => worker.fetch(new Request(`${VERIFY_URL}?token=ok`), env()),
    () => worker.fetch(new Request(VERIFY_URL, { method: 'PUT', body: 'token=ok' }), env()),
  ];
  // eslint-disable-next-line no-restricted-syntax
  for (const run of cases) {
    // eslint-disable-next-line no-await-in-loop
    await check(await run(), false);
  }
  assert.deepEqual(calls.map((c) => c.token), ['bad-token', 'throw'], 'lh-forms only asked with a token');
});

test('captcha verify: the preflight answers 200 with CORS for any origin', async () => {
  const res = await worker.fetch(new Request(VERIFY_URL, {
    method: 'OPTIONS', headers: { Origin: 'https://example.com', 'Access-Control-Request-Method': 'POST' },
  }), env());
  assert.equal(res.status, 200);
  assert.equal(res.headers.get('access-control-allow-origin'), '*');
  assert.match(res.headers.get('access-control-allow-methods'), /POST/);
});
