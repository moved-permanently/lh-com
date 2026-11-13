/* eslint-disable max-len, import/extensions */
/* Standing order 17 of 2026-11-13, item 1: the offline copy (tools/importer/offline-importer.mjs, every importer's
   default since abd3ad6e) aborts every request of the snapshot render with page.route, but Chromium's resource hints
   do not pass the routing: through a logging proxy, three recorded info snapshots (/de/en/cash-and-miles,
   special-meals, childrens-menus-on-board) opened 88 connections to shop.lufthansa.com (the booking app's
   <link rel="prefetch">). The copy now also
   - drops a snapshot's resource hints (prefetch, preload, modulepreload, preconnect, dns-prefetch, prerender) before
     setContent, and
   - starts its browser behind a dead local proxy (127.0.0.1:9; loopback stays direct), so whatever still gets past the
     routing fails on this machine;
   and writes a new mark, so copies built before (another session's /tmp/excat-offline) are rebuilt.
   Run: node --max-old-space-size=256 --test test/offline-importer-hints-so17.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { OFFLINE_MARK } from '../tools/importer/bulk-importer.mjs';

const SET = "      await page.setContent(savedHtml, { waitUntil: 'domcontentloaded', timeout: PAGE_TIMEOUT });";
const ARGS = '  const args = [\n    \'--no-sandbox\',\n  ];';
const runner = `async function launchBrowser() {\n${ARGS}\n  return args;\n}\nasync function run(page, url, savedHtml) {\n${SET}\n  await page.goto(url, {});\n}\n`;

const build = () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'offline-hints-'));
  const plugin = path.join(tmp, 'plugin');
  const src = path.join(plugin, 'skills/excat-content-import/scripts');
  fs.mkdirSync(path.join(src, 'node_modules'), { recursive: true });
  fs.mkdirSync(path.join(plugin, 'utils'), { recursive: true });
  fs.writeFileSync(path.join(src, 'run-bulk-import.js'), runner);
  const scripts = execFileSync('node', ['tools/importer/offline-importer.mjs', path.join(tmp, 'out')], {
    encoding: 'utf8', env: { ...process.env, EXCAT_IMPORT_SCRIPTS_SOURCE: src },
  }).trim();
  const s = fs.readFileSync(path.join(scripts, 'run-bulk-import.js'), 'utf8');
  fs.rmSync(tmp, { recursive: true, force: true });
  return s;
};

test('the snapshot is set without its resource hints; everything else of it stays', () => {
  const s = build();
  const m = s.match(/const hintless = savedHtml\.replace\((\/.+\/gi), ''\);/);
  assert.ok(m, 'the hints dropped');
  assert.ok(s.indexOf('const hintless') < s.indexOf('setContent(hintless'), 'before setContent');
  assert.ok(!s.includes('setContent(savedHtml'), 'the original snapshot is not set');
  // eslint-disable-next-line no-eval -- the copy's own regular expression literal
  const re = eval(m[1]);
  const html = [
    '<link rel="prefetch" as="script" crossorigin="" href="https://shop.lufthansa.com/lh/statics/booking/app/31.1.0/1021.js">',
    "<LINK REL='modulepreload' href='https://www.lufthansa.com/x.js'>",
    '<link href="https://www.swiss.com/f.woff2" rel="preload" as="font">',
    '<link rel=preconnect href=https://assets.example>',
    '<link rel="dns-prefetch" href="//cdn.example">',
    '<link rel="prerender" href="https://www.austrian.com/next">',
  ].join('\n');
  assert.equal(html.replace(re, '').trim(), '');
  const keep = '<link rel="stylesheet" href="/etc/x.css"><link rel="canonical" href="https://www.lufthansa.com/de/en/x"><link rel="icon" href="/f.ico"><p>prefetch preload</p>';
  assert.equal(keep.replace(re, ''), keep);
});

test('the browser starts behind a dead local proxy; the route abort and the live-fetch guard stay', () => {
  const s = build();
  assert.ok(s.includes("  const args = [\n    '--proxy-server=http://127.0.0.1:9',"), 'the dead proxy first in the launch arguments');
  assert.ok(s.includes("await page.route('**/*', (route) => route.abort());"), 'requests aborted');
  assert.ok(s.includes("throw new Error('offline importer: live fetch disabled')"), 'no live goto');
});

test('a new mark: copies built before this change are rebuilt', () => {
  const s = build();
  assert.ok(s.includes(OFFLINE_MARK));
  assert.match(OFFLINE_MARK, /resource hints/);
});
