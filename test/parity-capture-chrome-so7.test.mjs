/* eslint-disable max-len */
/* Standing order 7 of 2026-11-12: tools/parity/capture.js launched playwright's default, the headless shell
   (chromium_headless_shell), which lays text out narrower than the full chrome build: at 390 our B2B pages wrapped a word
   later than www's recordings (celebrating-shared-stories' H1 in 3 lines, www's and full chrome's 4; the hub 49.10 % with
   the shell, 44.70 with chrome; hygiene-and-safety de/de 35.30 -> not in the worst 30). PARITY_CHROME=1 (or a path in
   PARITY_CHROME) launches the full build; without it the capture is as before. Run: node --test test/parity-capture-chrome-so7.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const src = fs.readFileSync(new URL('../tools/parity/capture.js', import.meta.url), 'utf8');

test('capture.js: PARITY_CHROME picks the full chrome build, the default stays the headless shell', () => {
  assert.match(src, /let CHROME = process\.env\.PARITY_CHROME \|\| null;/);
  assert.match(src, /\.\.\.\(CHROME \? \{ executablePath: CHROME \} : \{\}\)/);
  assert.match(src, /chromium-1208\/chrome-linux64\/chrome/);
});
