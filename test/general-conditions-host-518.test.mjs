/* eslint-disable max-len */
/* The footer disclaimers' dialog documents for every brand host (the brief after 514, item 2): a
   homepage import links "General Conditions" to /{cc}/{ll}/fragments/modals/{label}
   (transformers/lufthansa-cleanup.js), and tools/importer/general-conditions-dialogs.mjs writes that
   document from the snapshots. It read www.lufthansa.com only, so a SWISS re-import's link had no
   document; --host names the snapshots' host (www.lufthansa.com when not given).
   Run: node --max-old-space-size=512 --test test/general-conditions-host-518.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const script = new URL('../tools/importer/general-conditions-dialogs.mjs', import.meta.url).pathname;
const snapshot = fs.readFileSync(new URL('./fixtures/swiss-conditions/de-de-homepage-snapshot.html', import.meta.url), 'utf8');

test('--host www.swiss.com: the SWISS homepage\'s dialog document at the path its link names', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gc-host-'));
  try {
    fs.mkdirSync(path.join(dir, 'www.swiss.com/de/de'), { recursive: true });
    fs.writeFileSync(path.join(dir, 'www.swiss.com/de/de/homepage.html'), snapshot);
    const out = execFileSync('node', [script, '--html-dir', dir, '--host', 'www.swiss.com', '--out', path.join(dir, 'content')], { encoding: 'utf8' });
    assert.match(out, /^\/de\/de\/fragments\/modals\/allgemeine-bedingungen: written \(from \/de\/de\/homepage\)$/m);
    const doc = fs.readFileSync(path.join(dir, 'content/de/de/fragments/modals/allgemeine-bedingungen.plain.html'), 'utf8');
    assert.ok(doc.startsWith('<div><h2>Allgemeine Bedingungen</h2><p>Die angezeigten Preise können abweichen'));
    // without --host: lufthansa.com's snapshots only, as before
    const before = execFileSync('node', [script, '--html-dir', dir, '--dry'], { encoding: 'utf8' });
    assert.match(before, /no footer disclaimer with a dialog in these snapshots/);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
