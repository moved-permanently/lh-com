/* Site flags (scripts/flags.js): the site's sheet /config/flags (DA), published as
   /config/flags.json, columns flag | value. On only for a row whose value is "on"; a missing sheet
   (404), a missing row, "off" or any other value, a failed or slow fetch: off. One fetch per page,
   shared by every caller.
   Run: node --max-old-space-size=512 --test test/flags.test.mjs */
/* global globalThis */
import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';

const sheet = (data) => new Response(JSON.stringify({
  total: data.length, offset: 0, limit: data.length, data, ':type': 'sheet',
}), { headers: { 'content-type': 'application/json' } });

let calls;
let answer;
beforeEach(async () => {
  calls = [];
  globalThis.fetch = async (url, init) => {
    calls.push(String(url));
    return answer(url, init);
  };
  const { resetFlags } = await import('../scripts/flags.js');
  resetFlags();
});

const { isFlagOn, loadFlags } = await import('../scripts/flags.js');

test('a missing sheet (404): every flag off', async () => {
  answer = () => new Response('', { status: 404 });
  assert.equal(await isFlagOn('live-chat'), false);
  assert.deepEqual(calls, ['/config/flags.json']);
});

test('a missing row: off; "off" and other values: off; "on": on', async () => {
  answer = () => sheet([
    { flag: 'live-chat', value: 'off' },
    { flag: 'esim-widget', value: 'on' },
    { flag: 'chat-button', value: 'yes' },
    { flag: 'newsletter-form', value: '' },
    { flag: ' Chat-Widget ', value: ' On ' },
  ]);
  assert.equal(await isFlagOn('live-chat'), false, 'off');
  assert.equal(await isFlagOn('esim-widget'), true, 'on');
  assert.equal(await isFlagOn('chat-button'), false, 'another value');
  assert.equal(await isFlagOn('newsletter-form'), false, 'empty');
  assert.equal(await isFlagOn('missing-row'), false, 'no row');
  assert.equal(await isFlagOn('chat-widget'), true, 'names and values trimmed, any case');
  assert.equal(calls.length, 1, 'one fetch for every call on the page');
});

test('a fetch error, a broken answer or a slow sheet: off, and the callers are not kept waiting', async () => {
  answer = () => Promise.reject(new TypeError('Failed to fetch'));
  assert.equal(await isFlagOn('esim-widget'), false, 'network error');
  const { resetFlags } = await import('../scripts/flags.js');
  resetFlags();
  answer = () => new Response('<html>', { status: 200, headers: { 'content-type': 'text/html' } });
  assert.equal(await isFlagOn('esim-widget'), false, 'not JSON');
  resetFlags();
  answer = () => new Response(JSON.stringify({ data: 'nope' }), { status: 200 });
  assert.equal(await isFlagOn('esim-widget'), false, 'no rows');
  resetFlags();
  // a sheet that never answers: off after the timeout (the fetch is aborted)
  let aborted = false;
  answer = (url, init) => new Promise((resolve, reject) => {
    init.signal.addEventListener('abort', () => { aborted = true; reject(new Error('aborted')); });
  });
  const t0 = Date.now();
  const flags = await loadFlags({ timeout: 50 });
  assert.equal(flags.size, 0);
  assert.ok(aborted, 'the fetch is aborted');
  assert.ok(Date.now() - t0 < 1000);
});

test('the sheet is read once per page: later callers share the first answer', async () => {
  answer = () => sheet([{ flag: 'live-chat', value: 'on' }]);
  const [a, b] = await Promise.all([isFlagOn('live-chat'), isFlagOn('live-chat')]);
  assert.ok(a === true && b === true);
  await isFlagOn('esim-widget');
  assert.equal(calls.length, 1);
});
