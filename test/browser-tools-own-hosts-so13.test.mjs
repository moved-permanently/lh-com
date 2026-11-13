/* eslint-disable max-len */
/* Standing order 13 of 2026-11-13, item 2: the repo's other tools that open our pages in a browser get capture.js's
   request block (69745426, f337aebb): only our hosts (aem.live, aem.page, the lh-edge hosts on turnsthe.page,
   localhost) and OneTrust's consent hosts, www's web fonts from PARITY_FONTS (the drops), everything else aborted, service
   workers blocked. tools/parity/guard.mjs: guardContext(context) for a tool that only ever opens our pages (whatever
   the URL: one of www's is aborted too), GUARD_CONTEXT the context options. The tools: cargo-render-check, ita-shots,
   austrian-shots, pass-widths, compare-roots, lh-edge's compare-solo.
   Run: node --test test/browser-tools-own-hosts-so13.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { guardContext, GUARD_CONTEXT } from '../tools/parity/guard.mjs';

const require = createRequire(import.meta.url);
const { ownHostFilter } = require('../tools/parity/lib.js');

const fakeContext = () => {
  const ctx = { routes: [] };
  ctx.route = async (match, handler) => { ctx.routes.push({ match, handler }); };
  return ctx;
};
const fakeRoute = (url) => {
  const r = { calls: [] };
  r.request = () => ({ url: () => url });
  r.fulfill = async (o) => { r.calls.push(['fulfill', o]); };
  r.abort = async (e) => { r.calls.push(['abort', e]); };
  return r;
};

test('lib.js: the lh-edge hosts on turnsthe.page are ours', () => {
  const allow = ownHostFilter('https://ita.turnsthe.page/it/en/homepage');
  assert.equal(typeof allow, 'function');
  assert.equal(allow(new URL('https://lufthansa-edge.turnsthe.page/x')), true);
  assert.equal(allow(new URL('https://turnsthe.page.example.com/x')), false);
  assert.equal(allow(new URL('https://www.lufthansa.com/x')), false);
});

test('guardContext: one route for every request not to our hosts; fonts from the directories, the rest aborted', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'guard-'));
  const rel = 'digitalhangar/design-system/releases/mausy-v1.40.1/standalone/fonts/lufthansa';
  fs.mkdirSync(path.join(dir, rel), { recursive: true });
  fs.writeFileSync(path.join(dir, rel, 'LufthansaTextWeb-Regular.woff2'), 'x');
  const ctx = fakeContext();
  const log = { fonts: [], aborted: [] };
  await guardContext(ctx, { fontDirs: [dir], log });
  assert.equal(ctx.routes.length, 1);
  const { match, handler } = ctx.routes[0];
  ['https://main--lh-com--moved-permanently.aem.page/de/en/homepage', 'http://localhost:3000/x', 'https://cdn.cookielaw.org/a.js', 'https://ita.turnsthe.page/x', 'data:image/png;base64,AA']
    .forEach((u) => assert.equal(match(new URL(u)), false, u));
  ['https://www.lufthansa.com/service/api/catalogs/regions', 'https://lh-proxy.benpeter.workers.dev/x', 'https://www.swiss.com/x', 'https://example.com/']
    .forEach((u) => assert.equal(match(new URL(u)), true, u));
  const font = fakeRoute(`https://www.lufthansa.com/${rel}/LufthansaTextWeb-Regular.woff2`);
  await handler(font);
  assert.deepEqual(font.calls, [['fulfill', { path: path.join(dir, rel, 'LufthansaTextWeb-Regular.woff2'), headers: { 'Access-Control-Allow-Origin': '*' } }]]);
  const api = fakeRoute('https://www.lufthansa.com/service/api/catalogs/regions');
  await handler(api);
  assert.deepEqual(api.calls, [['abort', 'blockedbyclient']]);
  assert.equal(log.fonts.length, 1);
  assert.equal(log.aborted.length, 1);
  fs.rmSync(dir, { recursive: true, force: true });
});

test('guardContext: PARITY_FONTS by default; GUARD_CONTEXT blocks service workers', async () => {
  assert.deepEqual(GUARD_CONTEXT, { serviceWorkers: 'block' });
  const ctx = fakeContext();
  const saved = process.env.PARITY_FONTS;
  process.env.PARITY_FONTS = '';
  await guardContext(ctx);
  const r = fakeRoute('https://www.lufthansa.com/digitalhangar/x/fonts/lufthansa/LufthansaTextWeb-Regular.woff2');
  await ctx.routes[0].handler(r);
  assert.deepEqual(r.calls, [['abort', 'blockedbyclient']]);
  if (saved === undefined) delete process.env.PARITY_FONTS; else process.env.PARITY_FONTS = saved;
});

const TOOLS = ['tools/importer/cargo-render-check.mjs', 'tools/importer/ita-shots.mjs', 'tools/importer/austrian-shots.mjs', 'tools/importer/pass-widths.mjs', 'tools/markets/compare-roots.mjs', 'tools/workers/lh-edge/compare-solo.mjs'];

test('every tool that opens our pages guards each context before its first page', () => {
  TOOLS.forEach((f) => {
    const src = fs.readFileSync(new URL(`../${f}`, import.meta.url), 'utf8');
    assert.match(src, /import \{ guardContext, GUARD_CONTEXT \} from '[./]+\/parity\/guard\.mjs';/, f);
    const contexts = [...src.matchAll(/(\w+) = await browser\.newContext\(\{ \.\.\.GUARD_CONTEXT, /g)].map((m) => m[1]);
    assert.ok(contexts.length >= 1, `${f}: a guarded context`);
    contexts.forEach((c) => {
      const at = src.indexOf(`await guardContext(${c})`);
      assert.ok(at > 0 && at < src.indexOf(`${c}.newPage()`), `${f}: ${c} guarded before its page`);
    });
    assert.doesNotMatch(src, /browser\.newPage\(/, `${f}: no page outside a guarded context`);
    assert.doesNotMatch(src, /browser\.newContext\(\{ (?!\.\.\.GUARD_CONTEXT)/, `${f}: every context guarded`);
  });
});
