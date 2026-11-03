/* eslint-disable max-len, import/extensions -- tests */
/* tools/importer/tap-es-es.mjs: ema-cashub's TAP tools with a Spanish entry added in memory, the
   tools' files untouched; a tool with its own es entry runs as it is.
   Run: timeout 60 node --test test/tap-es-es.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { withSpanish, ES, mergeMarks } from '../tools/importer/tap-es-es.mjs';

const file = path.resolve('tools/importer/tap-import.mjs');
const navFile = path.resolve('tools/importer/tap-nav.mjs');

test('tap-import: LABELS gets es, the root stays this repository, nothing else changes', () => {
  const src = fs.readFileSync(file, 'utf8');
  const out = withSpanish(src, 'import', file);
  if (out === null) { assert.match(src, /\n\s+es:\s*\{/); return; }
  assert.ok(out.includes(`const LABELS = {\n${ES.import.entry}`));
  assert.ok(out.includes(JSON.stringify(pathToFileURL(file).href)), 'root from the tool\'s own path');
  const back = out.replace(`\n${ES.import.entry}`, '').replace(`fileURLToPath(${JSON.stringify(pathToFileURL(file).href)})`, 'fileURLToPath(import.meta.url)');
  assert.equal(back, src);
});

test('tap-nav: SETUP gets es (Ayuda, Menú), tap-import imported from the repository', () => {
  const src = fs.readFileSync(navFile, 'utf8');
  const out = withSpanish(src, 'nav', navFile);
  if (out === null) return;
  assert.match(out, /const SETUP = \{\n {2}es: \{\n.*help: \['Ayuda', '\/ayuda'\]/);
  assert.ok(!out.includes("from './tap-import.mjs'"));
  assert.ok(out.includes(JSON.stringify(pathToFileURL(file).href)));
});

test('a tool with its own es entry is left as it is', () => {
  const src = "const LABELS = {\n  pt: { onWww: 'x' },\n  es: { onWww: 'y' },\n};\nconst root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');\n";
  assert.equal(withSpanish(src, 'import', file), null);
});

test('a bold run right after a bold-italic one is one bold run (the preview printed it as literal asterisks)', () => {
  assert.equal(
    mergeMarks('<p><strong>la escultura </strong><em><strong>Compianto sul Cristo morto</strong></em><strong>, compuesta por siete estatuas</strong> de tamaño real.</p>'),
    '<p><strong>la escultura <em>Compianto sul Cristo morto</em>, compuesta por siete estatuas</strong> de tamaño real.</p>',
  );
  assert.equal(
    mergeMarks('<li><strong>Si es un vuelo de código </strong><em><strong>compartido</strong></em><strong>*</strong></li>'),
    '<li><strong>Si es un vuelo de código <em>compartido</em>*</strong></li>',
  );
  const other = '<p><em><strong>compartido</strong></em> y <strong>otro</strong> <a href="/x"><strong>a</strong></a></p>';
  assert.equal(mergeMarks(other), other, 'nothing else changes');
});
