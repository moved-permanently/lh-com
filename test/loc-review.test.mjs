/* eslint-disable max-len, import/extensions -- dev tooling */
/* The review tools (tools/loc/clear-review.mjs, block-check.mjs, review-lib.mjs) on hand-made
   fixtures (test/fixtures/loc/review): a heading with and without an id, a da-metadata block that
   rejects it, the merge output with the heading dropped, the control. A fake DA, no network.
   Run: node --test test/ */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import { removeDaMetadata, blockItems, missingItems } from '../tools/loc/review-lib.mjs';
import { clearReview } from '../tools/loc/clear-review.mjs';
import { daClient } from '../tools/loc/slug-step.mjs';

const dir = new URL('./fixtures/loc/review/', import.meta.url);
const fx = (f) => fs.readFileSync(new URL(f, dir), 'utf8');
const BEFORE = fx('before.html');
const REVIEWED = fx('target-with-review.html');

test('blockItems: headings, paragraphs, metadata rows, images, blocks; ids, <p> in metadata cells, <source> and da-metadata ignored', () => {
  const items = blockItems(BEFORE);
  assert.deepEqual(items.filter((i) => i.kind === 'heading').map((i) => i.text), ['h1 Rebooking', 'h2 Contact']);
  assert.deepEqual(items.filter((i) => i.kind === 'metadata').map((i) => i.text), ['Title: Rebooking | Example', 'Parent: /xx/de/homepage']);
  assert.deepEqual(items.filter((i) => i.kind === 'image').map((i) => i.text), ['./media_aaa.jpg']);
  assert.deepEqual(items.filter((i) => i.kind === 'block').map((i) => i.text), ['columns-media sidebar']);
  assert.ok(items.some((i) => i.kind === 'paragraph' && i.text === 'See the fare conditions.'), 'paragraphs inside blocks count');
  assert.deepEqual(blockItems(REVIEWED), items, 'the da-metadata block is not content');
  assert.deepEqual(missingItems(BEFORE, fx('reserialised.html')), [], 'the editor re-serialisation loses nothing');
});

test('the rejected heading: the merge output without it is reported, only-incoming too; the control keeps both', () => {
  const dropped = missingItems(REVIEWED, fx('merged-heading-dropped.html'));
  assert.deepEqual(dropped, [{ kind: 'heading', text: 'h1 Rebooking', note: 'not in the page after the step' }]);
  const pending = missingItems(BEFORE, fx('merged-heading-pending.html'));
  assert.deepEqual(pending, [{ kind: 'heading', text: 'h1 Rebooking', note: 'only in an incoming merge block (gone if that block is rejected)' }]);
  assert.deepEqual(missingItems(BEFORE, fx('merged-control.html')), [], 'no da-metadata: the own heading kept (marked local), the incoming one marked');
  // a heading twice before needs it twice after
  const twice = BEFORE.replace('<h2 id="contact">Contact</h2>', '<h2 id="contact">Contact</h2><h2>Contact</h2>');
  assert.deepEqual(missingItems(twice, BEFORE).map((m) => m.text), ['h2 Contact']);
});

test('removeDaMetadata: the block goes, the rest stays byte for byte; its rows are listed', () => {
  const r = removeDaMetadata(REVIEWED);
  assert.ok(r.changed);
  assert.ok(!r.html.includes('da-metadata'));
  assert.equal(r.html, REVIEWED.replace(/<div class="da-metadata">.*?<\/div><\/div><\/div><footer>/, '<footer>'));
  assert.deepEqual(r.removed, [{ acceptedhashes: '9f8e7d', rejectedhashes: '1a2b3c', 'diff-label-local': 'Local' }]);
  assert.deepEqual(removeDaMetadata(BEFORE), { html: BEFORE, removed: [], changed: false });
});

/** An in-memory DA: path -> html; records the calls. */
function fakeDa(docs, { keepBlock = false } = {}) {
  const calls = [];
  return {
    calls,
    docs,
    get: async (p) => { calls.push(['GET', p]); return docs[p] ?? null; },
    put: async (p, html) => { calls.push(['POST', p]); docs[p] = keepBlock ? REVIEWED : html; },
    version: async (p, label) => { calls.push(['VERSION', p, label]); },
    remove: async () => { throw new Error('never deletes'); },
  };
}

test('clearReview: dry run reads only; --apply: labelled version, write, read-back; refusals', async () => {
  const dry = fakeDa({ '/de/de/x': REVIEWED });
  const d = await clearReview('/de/de/x', { da: dry });
  assert.equal(d.status, 'would remove');
  assert.deepEqual(dry.calls, [['GET', '/de/de/x']]);

  const da = fakeDa({ '/drafts/loc-test/de/de/x': REVIEWED });
  const r = await clearReview('/de/de/x', {
    da, apply: true, rootDir: '/drafts/loc-test', today: '2026-10-27',
  });
  assert.equal(r.status, 'removed');
  assert.deepEqual(da.calls.map((c) => c.slice(0, 3)), [
    ['GET', '/drafts/loc-test/de/de/x'], ['VERSION', '/drafts/loc-test/de/de/x', 'before clear-review 2026-10-27'], ['POST', '/drafts/loc-test/de/de/x'], ['GET', '/drafts/loc-test/de/de/x']]);
  assert.ok(!da.docs['/drafts/loc-test/de/de/x'].includes('da-metadata'));

  await assert.rejects(clearReview('/de/de/x', { da: fakeDa({ '/de/de/x': REVIEWED }, { keepBlock: true }), apply: true }), /still holds a da-metadata block/);
  assert.equal((await clearReview('/de/de/y', { da: fakeDa({ '/de/de/y': BEFORE }), apply: true })).status, 'no da-metadata block');
  assert.equal((await clearReview('/de/de/login', { da: fakeDa({}), apply: true })).status, 'refused (lhg, login or profile)');
  assert.equal((await clearReview('/lhg/de/de/x', { da: fakeDa({}), apply: true })).status, 'refused (lhg, login or profile)');
});

test('daClient.version: POST to versionsource with the label and the login', async () => {
  const calls = [];
  const da = daClient(async (url, opts) => { calls.push({ url, opts }); return new Response('{}', { status: 201 }); }, 'tok');
  await da.version('/de/de/x', 'before clear-review 2026-10-27');
  assert.equal(calls[0].url, 'https://admin.da.live/versionsource/moved-permanently/lh-com/de/de/x.html');
  assert.equal(calls[0].opts.method, 'POST');
  assert.equal(JSON.parse(calls[0].opts.body).label, 'before clear-review 2026-10-27');
  assert.equal(calls[0].opts.headers.authorization, 'Bearer tok');
});

test('block-check CLI on files: exit 1 and the missing heading; exit 0 for the control', () => {
  const run = (after) => spawnSync(process.execPath, [new URL('../tools/loc/block-check.mjs', import.meta.url).pathname, '--before', new URL('target-with-review.html', dir).pathname, '--after', new URL(after, dir).pathname], { encoding: 'utf8' });
  const bad = run('merged-heading-dropped.html');
  assert.equal(bad.status, 1, bad.stderr);
  assert.match(bad.stdout, /MISSING .*1 items of the before copy missing\n {2}heading: h1 Rebooking/);
  const ok = run('merged-control.html');
  assert.equal(ok.status, 0, ok.stderr);
  assert.match(ok.stdout, /^ok/);
});
