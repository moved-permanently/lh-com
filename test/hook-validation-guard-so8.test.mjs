/* eslint-disable max-len, import/extensions */
/* global globalThis */
/* Standing order 8 of 2026-11-12, item 1: the workspace's parser and transformer checks (the excat plugin's
   PostToolUse hooks, outside this repo) validate an edited importer against the first URL page-templates.json gives
   them: the parser check the first template with a block of the parser's name, the transformer check the first
   template with URLs. Those were www.lufthansa.com pages (/de/en/homepage): every edit of an importer sent a request to
   an airline host (the hook's egress probe, then the page load). The hooks probe only http(s) URLs and skip
   validation for anything else, without a request. tools/importer/hook-validation-guard.mjs puts a template of its own
   first (validationOnly: every parser's block, its URL a local snapshot path, not http), which both lookups find
   before any www page; build-bundles.mjs makes no bundle of it.
   Run: node --test test/hook-validation-guard-so8.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const root = new URL('..', import.meta.url).pathname;
const { templates } = JSON.parse(fs.readFileSync(path.join(root, 'tools/importer/page-templates.json'), 'utf8'));
const parsers = fs.readdirSync(path.join(root, 'tools/importer/parsers')).filter((f) => f.endsWith('.js')).map((f) => f.slice(0, -3));
const isHttp = (u) => /^https?:/i.test(String(u || '').trim());

// the parser hook's lookup (parser-validator-hook.js findMatchingUrlForParser): the first template that has a block of
// the parser's name and a first URL
const parserUrl = (name) => {
  const t = templates.find((x) => (x.blocks || []).some((b) => (b.name || '').toLowerCase() === name.toLowerCase()) && x.urls && x.urls[0]);
  return t ? t.urls[0] : null;
};
// the transformer hook's lookup (transformer-validator-hook.js findUrlForTransformer): the first template with URLs
const transformerUrl = () => (templates.find((t) => (t.urls || []).length) || {}).urls?.[0];

test('every parser\'s check finds a URL that is no http(s) page, so no airline host', () => {
  const reached = parsers.filter((p) => isHttp(parserUrl(p)));
  assert.ok(reached.length === 0, `parsers whose check would load a live page: ${reached.join(', ')}`);
});

test('the transformers\' check finds a URL that is no http(s) page', () => {
  assert.ok(!isHttp(transformerUrl()), `transformer check URL: ${transformerUrl()}`);
});

test('the guard is the first template, validation only, and build-bundles makes no bundle of it', () => {
  assert.ok(templates[0].validationOnly === true && templates[0].name === '_hook-validation');
  const src = fs.readFileSync(path.join(root, 'tools/importer/build-bundles.mjs'), 'utf8');
  assert.ok(src.includes('templates.filter((t) => !t.validationOnly)'));
  const pt = fs.readFileSync(path.join(root, 'tools/importer/build-page-templates.js'), 'utf8');
  assert.ok(pt.includes('hook-validation-guard.mjs'), 'a rebuilt page-templates.json gets the guard back');
});

test('the guard lists every parser (a new parser without it would reach www again)', async () => {
  const { guardTemplate } = await import('../tools/importer/hook-validation-guard.mjs');
  const names = new Set(templates[0].blocks.map((b) => b.name));
  assert.ok(parsers.every((p) => names.has(p)), `missing: ${parsers.filter((p) => !names.has(p)).join(', ')}`);
  assert.ok(guardTemplate(path.join(root, 'tools/importer/parsers')).blocks.length === parsers.length);
});

// where the plugin is installed: its egress probe on the guard's URL makes no request
const utils = path.join(os.homedir(), '.excat-marketplaces/excat-marketplace/excat/hooks/hook-utils.js');
test('the plugin\'s probe skips the guard\'s URL without a request', { skip: !fs.existsSync(utils) && 'excat plugin not installed' }, async () => {
  const { probeImportUrlReachable } = await import(utils);
  const realFetch = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = async () => { calls += 1; throw new Error('no network in tests'); };
  try {
    const ok = await probeImportUrlReachable(templates[0].urls[0]);
    assert.ok(ok === false && calls === 0, `probe ${ok}, fetch calls ${calls}`);
  } finally {
    globalThis.fetch = realFetch;
  }
});
