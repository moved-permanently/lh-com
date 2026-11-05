/* The network-blocked importer copy (tools/importer/offline-importer.mjs) takes the importer
   scripts it copies from EXCAT_IMPORT_SCRIPTS_SOURCE (default: excat's install, as before), and the
   utils beside them as the scripts import them (../../../utils), so a local harness with the plugin
   elsewhere runs it unchanged. A stand-in plugin in a temporary folder: its run-bulk-import.js
   patched (the route abort before setContent, no live goto), its utils copied, node_modules linked.
   Run: node --max-old-space-size=256 --test test/offline-importer.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const SET = "      await page.setContent(savedHtml, { waitUntil: 'domcontentloaded', timeout: PAGE_TIMEOUT });";

test('EXCAT_IMPORT_SCRIPTS_SOURCE: the scripts copied from there, its utils beside them, the copy patched', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'offline-importer-'));
  try {
    const plugin = path.join(tmp, 'plugin');
    const src = path.join(plugin, 'skills/excat-content-import/scripts');
    fs.mkdirSync(path.join(src, 'node_modules'), { recursive: true });
    fs.mkdirSync(path.join(plugin, 'utils'), { recursive: true });
    fs.writeFileSync(path.join(src, 'run-bulk-import.js'), `async function run(page, url, savedHtml) {\n${SET}\n  await page.goto(url, {});\n}\n`);
    fs.writeFileSync(path.join(src, 'other.js'), 'export const x = 1;\n');
    fs.writeFileSync(path.join(plugin, 'utils/playwright-browser.js'), 'export const y = 2;\n');
    const dest = path.join(tmp, 'out');
    const out = execFileSync('node', ['tools/importer/offline-importer.mjs', dest], {
      encoding: 'utf8', env: { ...process.env, EXCAT_IMPORT_SCRIPTS_SOURCE: src },
    }).trim();
    const scripts = path.join(dest, 'skills/excat-content-import/scripts');
    assert.equal(out, scripts);
    const s = fs.readFileSync(path.join(scripts, 'run-bulk-import.js'), 'utf8');
    assert.ok(s.includes("await page.route('**/*', (route) => route.abort());"), 'requests aborted');
    assert.ok(s.indexOf('route.abort()') < s.indexOf('setContent'), 'before setContent');
    assert.ok(s.includes("throw new Error('offline importer: live fetch disabled')"), 'no live goto');
    assert.equal(fs.readFileSync(path.join(scripts, 'other.js'), 'utf8'), 'export const x = 1;\n');
    assert.equal(fs.readFileSync(path.join(dest, 'utils/playwright-browser.js'), 'utf8'), 'export const y = 2;\n');
    assert.equal(fs.readlinkSync(path.join(scripts, 'node_modules')), path.join(src, 'node_modules'));
    assert.equal(fs.readlinkSync(path.join(dest, 'node_modules')), path.join(src, 'node_modules'));
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test('without it: excat\'s install, as before', () => {
  const s = fs.readFileSync('tools/importer/offline-importer.mjs', 'utf8');
  assert.match(s, /process\.env\.EXCAT_IMPORT_SCRIPTS_SOURCE \|\| '\/home\/node\/\.excat-marketplaces\/excat-marketplace\/excat\/skills\/excat-content-import\/scripts'/);
});
