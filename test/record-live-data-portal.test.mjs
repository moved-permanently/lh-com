/* tools/importer/record-live-data.mjs: a brand's answer (X-Portal OS) is indexed under its
   portal ("OS:at/de|GET ...", os-at-de-<hash>.json), lh-com's (X-Portal LH or none) as before;
   a portal file no longer referenced is removed like the others.
   Run: node --max-old-space-size=512 --test test/record-live-data-portal.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { requestKey, fnv1a } from '../scripts/lh-data.js';

const script = path.resolve('tools/importer/record-live-data.mjs');

test('portal answers get their own entries and files; lh-com\'s keep theirs', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rec-portal-'));
  const src = path.join(dir, 'src');
  const out = path.join(dir, 'out');
  fs.mkdirSync(path.join(src, 'api'), { recursive: true });
  fs.mkdirSync(out);
  const line = (portal, text) => JSON.stringify({
    locale: 'at/de', method: 'GET', url: '/service/api/defaultAirport', status: 200, text, ...(portal ? { portal } : {}),
  });
  fs.writeFileSync(path.join(src, 'api', 'at-de.ndjson'), `${[
    line(null, '{"airport":"VIE","who":"lh"}'),
    line('OS', '{"airport":"VIE","who":"os"}'),
    line('LH', '{"airport":"MUC","who":"lh-again"}'),
    line('bad portal', '{"who":"bad"}'),
  ].join('\n')}\n`);
  fs.writeFileSync(path.join(out, 'os-at-de-00000000.json'), '{}\n');
  try {
    execFileSync(process.execPath, [script, '--src', src, '--out', out], { stdio: 'pipe' });
    const { entries } = JSON.parse(fs.readFileSync(path.join(out, 'index.json'), 'utf8'));
    const key = requestKey('GET', '/service/api/defaultAirport');
    const hash = fnv1a(key);
    assert.deepEqual(Object.keys(entries).sort(), [`OS:at/de|${key}`, `at/de|${key}`]);
    assert.equal(entries[`at/de|${key}`].file, `at-de-${hash}.json`);
    assert.equal(entries[`OS:at/de|${key}`].file, `os-at-de-${hash}.json`);
    const read = (f) => JSON.parse(fs.readFileSync(path.join(out, f), 'utf8'));
    assert.equal(read(`at-de-${hash}.json`).who, 'lh', 'first answer wins; LH and none are the same portal');
    assert.equal(read(`os-at-de-${hash}.json`).who, 'os');
    assert.equal(fs.existsSync(path.join(out, 'os-at-de-00000000.json')), false, 'stale portal file removed');
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
