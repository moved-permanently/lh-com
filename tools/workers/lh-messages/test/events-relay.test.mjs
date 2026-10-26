/* eslint-disable no-console, max-len -- the cron logs; one-line fakes */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import worker, { pollEvents } from '../src/index.js';

test('cron: polls lh-edge\'s publish event relay over the service binding, next to the message cron', async () => {
  const polls = [];
  const waited = [];
  const env = {
    EVENTS_RELAY: { poll: async () => { polls.push(1); return { ok: true, added: 0 }; } },
    // the message cron fails here (no source): the event poll runs anyway
    SOURCE_ORIGIN: 'https://source.invalid',
  };
  globalThis.fetch = async () => { throw new Error('offline'); };
  worker.scheduled({ scheduledTime: Date.now() }, env, { waitUntil: (p) => waited.push(p) });
  await Promise.allSettled(waited);
  assert.equal(polls.length, 1);
  assert.equal(waited.length, 2);
});

test('event poll: a failing relay is logged, not thrown; without the binding nothing is called', async () => {
  assert.equal(await pollEvents({ EVENTS_RELAY: { poll: async () => { throw new Error('relay down'); } } }), null);
  assert.equal(await pollEvents({ EVENTS_RELAY: { poll: () => { throw new Error('sync throw'); } } }), null);
  assert.equal(await pollEvents({}), null);
  assert.deepEqual(await pollEvents({ EVENTS_RELAY: { poll: async () => ({ ok: true }) } }), { ok: true });
});
