/* eslint-disable max-len, import/extensions -- tests */
/* tools/importer/tap-languages.mjs: ema-cashub's TAP tools with a language's entry (es, fr) added in
   memory, the tools' files untouched; a tool with its own entry runs as it is; the merged
   emphasis runs. Run: timeout 60 node --test test/tap-languages.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import {
  withLanguage, TEXTS, mergeMarks, langOfLocale,
} from '../tools/importer/tap-languages.mjs';

const file = path.resolve('tools/importer/tap-import.mjs');
const navFile = path.resolve('tools/importer/tap-nav.mjs');

test('the languages: es and fr, from the locale (es-es, fr-fr); another locale is refused', () => {
  assert.deepEqual(Object.keys(TEXTS).sort(), ['es', 'fr']);
  assert.equal(langOfLocale('es-es'), 'es');
  assert.equal(langOfLocale('fr-fr'), 'fr');
  assert.throws(() => langOfLocale('pt-pt'), /pt-pt/);
  assert.throws(() => langOfLocale('it-it'), /it-it/);
});

['es', 'fr'].forEach((lang) => {
  test(`tap-import (${lang}): LABELS gets ${lang}, the root stays this repository, nothing else changes`, () => {
    const src = fs.readFileSync(file, 'utf8');
    const out = withLanguage(src, 'import', file, lang);
    if (out === null) { assert.match(src, new RegExp(`\\n\\s+${lang}:\\s*\\{`)); return; }
    assert.ok(out.includes(`const LABELS = {\n${TEXTS[lang].import}`));
    assert.ok(out.includes(JSON.stringify(pathToFileURL(file).href)), 'root from the tool\'s own path');
    const back = out.replace(`\n${TEXTS[lang].import}`, '').replace(`fileURLToPath(${JSON.stringify(pathToFileURL(file).href)})`, 'fileURLToPath(import.meta.url)');
    assert.equal(back, src);
  });

  test(`tap-nav (${lang}): SETUP gets ${lang}, tap-import imported from the repository`, () => {
    const src = fs.readFileSync(navFile, 'utf8');
    const out = withLanguage(src, 'nav', navFile, lang);
    if (out === null) return;
    assert.ok(out.includes(`const SETUP = {\n${TEXTS[lang].nav}`));
    assert.ok(!out.includes("from './tap-import.mjs'"));
    assert.ok(out.includes(JSON.stringify(pathToFileURL(file).href)));
  });
});

test('the texts: Spanish as before, French from www\'s fr-fr pages', () => {
  assert.match(TEXTS.es.import, /es: \{ onWww: 'Ver en flytap\.com', video: 'Ver el vídeo' \}/);
  assert.match(TEXTS.es.nav, /help: \['Ayuda', '\/ayuda'\], other: \['English', 'en-es'\]/);
  assert.match(TEXTS.fr.import, /fr: \{ onWww: 'Voir sur flytap\.com', video: 'Voir la vidéo' \}/);
  assert.match(TEXTS.fr.nav, /menu: 'Menu', help: \['Aide', '\/aide'\], other: \['English', 'en-fr'\]/);
  assert.match(TEXTS.fr.nav, /logoAlt: 'TAP Air Portugal, retour à la page d’accueil'/);
});

test('a tool with its own entry is left as it is', () => {
  const src = "const LABELS = {\n  pt: { onWww: 'x' },\n  fr: { onWww: 'y' },\n};\nconst root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');\n";
  assert.equal(withLanguage(src, 'import', file, 'fr'), null);
  assert.notEqual(withLanguage(src, 'import', file, 'es'), null, 'es still added');
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
