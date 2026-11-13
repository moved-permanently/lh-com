/* eslint-disable max-len */
/* Standing order 7 of 2026-11-12: tools/parity/capture.js launched playwright's default, the headless shell
   (chromium_headless_shell), which lays text out narrower than the full chrome build: at 390 our B2B pages wrapped a word
   later than www's recordings (celebrating-shared-stories' H1 in 3 lines, www's and full chrome's 4; the hub 49.10 % with
   the shell, 44.70 with chrome; hygiene-and-safety de/de 35.30 -> not in the worst 30). PARITY_CHROME=1 (or a path in
   PARITY_CHROME) launches the full build; without it the capture is as before.
   Standing order 11: the image's browsers moved from chromium-1208 to chromium-1254 while capture.js named 1208, so
   PARITY_CHROME=1 failed to launch, and the default shell (the repo's playwright-core expects its own revision) as well.
   lib.js installedBrowser finds the installed build of a kind in PLAYWRIGHT_BROWSERS_PATH (the highest revision);
   capture.js takes the full build from it, and the shell from it when playwright's own is not installed.
   Run: node --test test/parity-capture-chrome-so7.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const src = fs.readFileSync(new URL('../tools/parity/capture.js', import.meta.url), 'utf8');

test('capture.js: PARITY_CHROME picks the full chrome build, the default stays the headless shell', () => {
  assert.match(src, /let CHROME = process\.env\.PARITY_CHROME \|\| null;/);
  assert.match(src, /\.\.\.\(exe \? \{ executablePath: exe \} : \{\}\)/);
  assert.match(src, /browser = await launch\(CHROME\)/);
  assert.match(src, /installedBrowser\('chromium', 'chrome-linux64\/chrome'\)/);
  assert.doesNotMatch(src, /chromium-1208/);
});

test('lib.js installedBrowser: the highest installed revision of a kind, not another kind; null without one', () => {
  const { installedBrowser } = require('../tools/parity/lib.js');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pw-'));
  ['chromium-1208', 'chromium-1254', 'chromium_headless_shell-1300'].forEach((d) => fs.mkdirSync(path.join(dir, d, 'chrome-linux64'), { recursive: true }));
  fs.writeFileSync(path.join(dir, 'chromium-1254', 'chrome-linux64', 'chrome'), '');
  fs.writeFileSync(path.join(dir, 'chromium-1208', 'chrome-linux64', 'chrome'), '');
  assert.equal(installedBrowser('chromium', 'chrome-linux64/chrome', dir), path.join(dir, 'chromium-1254', 'chrome-linux64', 'chrome'));
  assert.equal(installedBrowser('firefox', 'firefox/firefox', dir), null);
  fs.rmSync(dir, { recursive: true, force: true });
});
