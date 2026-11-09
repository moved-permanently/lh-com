/* eslint-disable max-len, import/extensions -- dev tooling */
/* tools/importer/da-upload.mjs and the slug maps (slug-write.mjs; tools/slugs/README.md), end to end in --sink mode (the
   upload bodies written to a folder, no request to DA, admin.hlx.page or any host; the state beside them):
   - flags off (the files as they are): every document at its www path, its links as they were;
   - a test copy of the map with at/de on: /at/de/zusatzgepaeck is written at /at/de/additional-baggage, its links to active
     aliases go to their canonical paths, nothing at the localized slug; a second run writes nothing new;
   - --keep-paths (a write at exactly the listed path): a localized slug of an active entry is refused with the canonical path;
   - lh-tap (no map): the same bytes at the same path as before.
   Run: node --test test/da-upload-slugs.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'da-slugs-'));
const write = (rel, text) => {
  fs.mkdirSync(path.dirname(path.join(tmp, rel)), { recursive: true });
  fs.writeFileSync(path.join(tmp, rel), text);
};
const doc = '<div><h1>Zusatzgepäck</h1><p><a href="/at/de/anreise-abreise">Anreise</a> <a href="/at/de/zusatzgepaeck?x=1#y">self</a> <a href="/at/de/homepage">home</a></p></div>';
write('content/at/de/zusatzgepaeck.plain.html', doc);
write('list.txt', '/at/de/zusatzgepaeck\n');
const map = JSON.parse(fs.readFileSync(path.join(root, 'tools/slugs/lh-austrian.json'), 'utf8'));
map.active['at/de'] = true;
write('map-on.json', JSON.stringify(map));
write('tap/content/en-pt/legal-info.plain.html', '<div><h1>Legal</h1><p><a href="/en-pt/legal-info/terms">Terms</a></p></div>');
const tapList = JSON.parse(fs.readFileSync(path.join(root, 'tools/importer/sites/lh-tap.json'), 'utf8')).paths;
const tapPath = tapList.find((p) => p === '/en-pt/legal-info') || tapList[0];
write('tap/list.txt', `${tapPath}\n`);
if (tapPath !== '/en-pt/legal-info') write(`tap/content${tapPath}.plain.html`, '<div><h1>TAP</h1><p><a href="/en-pt/legal-info/terms">Terms</a></p></div>');

const run = (args) => execFileSync('node', ['tools/importer/da-upload.mjs', ...args], { cwd: root, encoding: 'utf8', env: { ...process.env, SLUG_REPORT: path.join(tmp, 'unmapped.json') } });
const files = (d) => (fs.existsSync(d) ? fs.readdirSync(d, { recursive: true }).filter((f) => f.endsWith('.html')).map((f) => `/${f}`).sort() : []);

test('flags off: the document at its www path, its links as they were', () => {
  const sink = path.join(tmp, 'sink-off');
  const out = run(['--site', 'lh-austrian', '--content-dir', path.join(tmp, 'content'), '--list', path.join(tmp, 'list.txt'), '--sink', sink]);
  assert.match(out, /1 uploaded/);
  assert.deepEqual(files(sink), ['/at/de/zusatzgepaeck.html']);
  assert.ok(fs.readFileSync(path.join(sink, 'at/de/zusatzgepaeck.html'), 'utf8').includes('href="/at/de/anreise-abreise"'));
});

test('at/de on (a test copy): written at the canonical path with canonical links; a second run writes nothing new', () => {
  const sink = path.join(tmp, 'sink-on');
  const args = ['--site', 'lh-austrian', '--content-dir', path.join(tmp, 'content'), '--list', path.join(tmp, 'list.txt'), '--sink', sink, '--slug-map', path.join(tmp, 'map-on.json')];
  const first = run(args);
  assert.match(first, /1 uploaded/);
  assert.deepEqual(files(sink), ['/at/de/additional-baggage.html']);
  const body = fs.readFileSync(path.join(sink, 'at/de/additional-baggage.html'), 'utf8');
  assert.ok(body.includes('href="/at/de/arrival-departure"'));
  assert.ok(body.includes('href="/at/de/additional-baggage?x=1#y"'));
  assert.ok(body.includes('href="/at/de/homepage"'));
  const second = run(args);
  assert.match(second, /0 uploaded/);
  assert.deepEqual(files(sink), ['/at/de/additional-baggage.html']);
});

test('--keep-paths: a write at a localized slug of an active entry is refused, with the canonical path', () => {
  const sink = path.join(tmp, 'sink-keep');
  const out = run(['--site', 'lh-austrian', '--content-dir', path.join(tmp, 'content'), '--list', path.join(tmp, 'list.txt'), '--sink', sink, '--slug-map', path.join(tmp, 'map-on.json'), '--keep-paths']);
  assert.match(out, /\/at\/de\/zusatzgepaeck: a localized slug of an active entry .*\/at\/de\/additional-baggage, refused/);
  assert.deepEqual(files(sink), []);
  // flags off: --keep-paths writes it where it is
  const out2 = run(['--site', 'lh-austrian', '--content-dir', path.join(tmp, 'content'), '--list', path.join(tmp, 'list.txt'), '--sink', path.join(tmp, 'sink-keep-off'), '--keep-paths']);
  assert.match(out2, /1 uploaded/);
});

test('TAP has no map: the same path and the same bytes as the document', () => {
  const sink = path.join(tmp, 'sink-tap');
  const out = run(['--site', 'lh-tap', '--content-dir', path.join(tmp, 'tap/content'), '--list', path.join(tmp, 'tap/list.txt'), '--sink', sink]);
  assert.match(out, /1 uploaded/);
  assert.deepEqual(files(sink), [`${tapPath}.html`]);
  const src = fs.readFileSync(path.join(tmp, `tap/content${tapPath}.plain.html`), 'utf8');
  assert.ok(fs.readFileSync(path.join(sink, `${tapPath.slice(1)}.html`), 'utf8').includes(src));
});

test('two local documents for one page (the localized slug and its canonical path): refused, nothing written', () => {
  write('twin/content/at/de/zusatzgepaeck.plain.html', doc);
  write('twin/content/at/de/additional-baggage.plain.html', '<div><h1>Additional baggage</h1></div>');
  const sink = path.join(tmp, 'sink-twin');
  const out = run(['--site', 'lh-austrian', '--content-dir', path.join(tmp, 'twin/content'), '--list', path.join(tmp, 'list.txt'), '--sink', sink, '--slug-map', path.join(tmp, 'map-on.json')]);
  assert.match(out, /\/at\/de\/zusatzgepaeck: its page \/at\/de\/additional-baggage has a document of its own .*refused/);
  assert.deepEqual(files(sink), []);
});
