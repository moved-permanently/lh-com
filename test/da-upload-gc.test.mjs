/* eslint-disable max-len, import/extensions */
/* The global tree /gc/<ll> in tools/importer/da-upload.mjs (da-upload-sites.mjs): lh-com may send
   /gc/en/** and /gc/de/** documents; a document that comes as a full DA document (<path>.html,
   <body>…</body>, as DA's source API serves it) is sent byte for byte, a .plain.html as before
   (wrapped, and it wins when both exist); nothing under /gc/ is ever previewed, with or without
   --no-preview (on www the global tree is internal too). Other sites as before.
   Run: node --max-old-space-size=512 --test test/da-upload-gc.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  siteSettings, mayPreview, readDocument, uploadBody, GC_DOC,
} from '../tools/importer/da-upload-sites.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const loadScope = async () => new Set(['/de/en/homepage']);

test('lh-com may send the global tree\'s documents, /gc/en and /gc/de only', async () => {
  const s = await siteSettings(root, loadScope, {});
  ['/gc/en/baggage', '/gc/de/fluege', '/gc/en/fragments/stage-promotions', '/gc/en/articles/explore-flying/oktoberfest-traditional-bavarian-attire', '/gc/de/online-check-in-mit-der-ganzen-familie']
    .forEach((p) => assert.ok(s.allowed(p), p));
  ['/gc', '/gc/en', '/gc/fr/x', '/gcx/en/a', '/gc/en/../de/en/x', '/gc/en/Baggage', '/gc/en/x.html', '/de/gc/en/x']
    .forEach((p) => assert.ok(!s.allowed(p), p));
  assert.ok(GC_DOC.test('/gc/de/a/b-c'));
  const other = await siteSettings(root, async () => new Set(), { site: 'lh-discover' });
  assert.ok(!other.allowed('/gc/en/baggage'), 'other sites: their allowlist only');
});

test('never a preview under /gc/; every other path as before', () => {
  ['/gc', '/gc/', '/gc/en/baggage', '/gc/de/fluege', '/gc/fr/x'].forEach((p) => assert.equal(mayPreview(p), false, p));
  ['/de/en/homepage', '/gcx/en/a', '/de/en/gc/x', '/ch/en/nav'].forEach((p) => assert.equal(mayPreview(p), true, p));
});

test('documents: a .plain.html wrapped as before, a full DA document byte for byte, .plain.html first', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gc-docs-'));
  const write = (rel, text) => {
    fs.mkdirSync(path.dirname(path.join(dir, rel)), { recursive: true });
    fs.writeFileSync(path.join(dir, rel), text);
  };
  const DA = '\n<body>\n  <header></header>\n  <main><div><h1>Mit Lufthansa</h1></div></main>\n  <footer></footer>\n</body>\n';
  write('gc/de/frankfurt-fair.html', DA);
  write('de/en/baggage.plain.html', '<div><h1>Baggage</h1></div>');
  write('gc/en/both.html', DA);
  write('gc/en/both.plain.html', '<div><h1>Both</h1></div>');
  write('gc/en/not-a-document.html', '<html><head></head><body>x</body></html>');

  const full = readDocument(dir, '/gc/de/frankfurt-fair');
  assert.equal(full.kind, 'document');
  assert.equal(full.file, path.join(dir, 'gc/de/frankfurt-fair.html'));
  assert.equal(uploadBody(full.kind, full.text), DA, 'byte for byte, whitespace and all');

  const plain = readDocument(dir, '/de/en/baggage');
  assert.equal(plain.kind, 'plain');
  assert.equal(uploadBody(plain.kind, plain.text), '<body><header></header><main><div><h1>Baggage</h1></div></main><footer></footer></body>', 'as before');

  assert.equal(readDocument(dir, '/gc/en/both').kind, 'plain', 'the .plain.html wins');
  assert.equal(readDocument(dir, '/gc/en/not-a-document'), null, 'not DA\'s shape: no document');
  assert.equal(readDocument(dir, '/gc/en/missing'), null);
  fs.rmSync(dir, { recursive: true, force: true });
});
