/* eslint-disable import/extensions */
/* tools/loc/check-config.mjs sourceChecks: translate.json against the released localisation app
   (adobe/da-nx 69006f3b, release 1.29.1, live on da.live since 2026-10-29), with the app's own
   functions (downloaded once into the temp folder by tools/loc/da-nx.mjs, never into the repo):
   source.language.detect is read (isSourceDetectEnabled), resolveSourceLang takes a project's
   source folder from its URLs (/de/en or /de/de; a mix is refused with the URLs to uncheck),
   filterLangsBySource leaves a /de/de project only German with Rollout and Skip, the options
   view goes to rollout, and the rollout keeps paths 1:1 (/de/de/kinder-an-bord ->
   /at/de/kinder-an-bord).
   Run: node --max-old-space-size=512 --test test/loc-config-check.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { loadApp, DA_NX_COMMIT } from '../tools/loc/da-nx.mjs';
import { sourceChecks } from '../tools/loc/check-config.mjs';

const config = JSON.parse(fs.readFileSync(new URL('../tools/loc/translate.json', import.meta.url), 'utf8'));
const app = await loadApp();
const byName = (results) => Object.fromEntries(results.map((r) => [r.name, r]));

test('pinned to the released app', () => {
  assert.equal(DA_NX_COMMIT, '69006f3b54984630e06f77e287e329bde12738d0');
});

test('every source check passes on translate.json', () => {
  const results = sourceChecks(app, config);
  assert.equal(results.length, 7, `${results.length} checks`);
  results.forEach((r) => assert.ok(r.ok, `${r.name}: ${r.detail}`));
});

test('the checks: detection on, /de/en, /de/de, the mix, the /de/de options, the 1:1 rollout', () => {
  const r = byName(sourceChecks(app, config));
  const names = Object.keys(r).join('\n');
  ['source.language.detect', '/de/en URLs', '/de/de URLs', 'mixed', 'filterLangsBySource', 'rollout view', 'kinder-an-bord']
    .forEach((k) => assert.ok(names.includes(k), `a check about ${k}`));
});

test('detection off (a site without the row): /de/de URLs are not detected, the check says so', () => {
  const off = structuredClone(config);
  off.config.data = off.config.data.filter((row) => row.key !== 'source.language.detect');
  const r = sourceChecks(app, off);
  assert.ok(r.some((x) => !x.ok && /source\.language\.detect/.test(x.name)));
});
