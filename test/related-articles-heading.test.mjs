/* eslint-disable max-len, import/extensions */
/* Row 24 of tools/reports/lufthansa/parity.md (brief 407): lh-com's article documents lack www's
   heading over the related articles ("Related Articles" / "Ähnliche Artikel", a maui-headline h3 at
   the h2 size). tools/importer/related-articles-heading.mjs reads each document from DA (or a
   folder), adds `<h3>… {heading-medium}</h3>` right before the related-articles block where no
   heading is there, writes the changed documents to a folder and lists every document's outcome;
   it uploads nothing. Run: node --test test/related-articles-heading.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { addRelatedHeading, langOf, RELATED_LABELS } from '../tools/importer/related-articles-heading.mjs';

const doc = (main) => `<body><header></header><main>${main}</main><footer></footer></body>`;
const ARTICLE = '<div><h1>Miami</h1><p>Intro</p></div>\n<div><p>Text</p><p><em><sup>*Prices</sup></em></p></div>\n<div><div class="related-articles"></div></div>\n<div><div class="metadata"><div><div>Title</div><div>Miami</div></div></div></div>';

test('langOf: the article\'s language from its path (de/en, de/de), else null', () => {
  assert.equal(langOf('/de/en/articles/explore-the-world/x'), 'en');
  assert.equal(langOf('/de/de/articles/highlights/y'), 'de');
  assert.equal(langOf('/ch/fr/articles/z'), null);
});

test('a document without the heading: www\'s h3 right before the block, the rest byte for byte', () => {
  const before = doc(ARTICLE);
  const r = addRelatedHeading(before, 'en');
  assert.equal(r.status, 'changed');
  assert.equal(r.html, before.replace('<div class="related-articles">', '<h3>Related Articles {heading-medium}</h3><div class="related-articles">'));
  assert.equal(addRelatedHeading(before, 'de').html.includes('<h3>Ähnliche Artikel {heading-medium}</h3><div class="related-articles">'), true);
  assert.deepEqual(RELATED_LABELS, { en: 'Related Articles', de: 'Ähnliche Artikel' });
});

test('a document with a heading before the block (in its section or ending the section before) and a second run: unchanged', () => {
  const own = doc(ARTICLE.replace('<div><div class="related-articles">', '<div><h3>Ähnliche Artikel {heading-medium}</h3><div class="related-articles">'));
  assert.deepEqual(addRelatedHeading(own, 'de'), { status: 'has-heading', html: own });
  const prevSection = doc(ARTICLE.replace('<sup>*Prices</sup></em></p></div>', '<sup>*Prices</sup></em></p><h2>More</h2></div>'));
  assert.equal(addRelatedHeading(prevSection, 'en').status, 'has-heading');
  const once = addRelatedHeading(doc(ARTICLE), 'en').html;
  assert.equal(addRelatedHeading(once, 'en').status, 'has-heading', 'idempotent');
});

test('no block, two blocks, no language or not a DA document: nothing changed, the reason given', () => {
  assert.equal(addRelatedHeading(doc('<div><p>x</p></div>'), 'en').status, 'no-block');
  const two = doc(`${ARTICLE}<div><div class="related-articles"></div></div>`);
  assert.equal(addRelatedHeading(two, 'en').status, 'skipped');
  assert.equal(addRelatedHeading(doc(ARTICLE), null).status, 'skipped');
  assert.equal(addRelatedHeading('<main><div class="related-articles"></div></main>', 'en').status, 'skipped');
});

test('CLI --from a folder: the changed documents in --out (DA shape), changes.tsv and changed-paths.txt; a second run resumes', () => {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'related-heading-'));
  const from = path.join(tmp, 'from');
  const out = path.join(tmp, 'out');
  const put = (p, html) => { fs.mkdirSync(path.dirname(path.join(from, p)), { recursive: true }); fs.writeFileSync(path.join(from, `${p}.html`), html); };
  put('/de/en/articles/a/one', doc(ARTICLE));
  put('/de/de/articles/a/two', doc(ARTICLE.replace('<div><div class="related-articles">', '<div><h3>Ähnliche Artikel {heading-medium}</h3><div class="related-articles">')));
  put('/de/de/articles/a/three', doc('<div><h1>x</h1></div>'));
  const list = path.join(tmp, 'paths.txt');
  fs.writeFileSync(list, '/de/en/articles/a/one\n/de/de/articles/a/two\n/de/de/articles/a/three\n/de/de/articles/a/missing\n');
  const cli = path.join(root, 'tools/importer/related-articles-heading.mjs');
  const run = () => execFileSync('node', [cli, '--from', from, '--list', list, '--out', out], { encoding: 'utf8', timeout: 20000 });
  const log = run();
  assert.match(log, /1 changed, 1 has-heading, 1 no-block, 1 error/);
  const changed = fs.readFileSync(path.join(out, 'de/en/articles/a/one.html'), 'utf8');
  assert.equal(changed, addRelatedHeading(doc(ARTICLE), 'en').html);
  assert.equal(fs.existsSync(path.join(out, 'de/de/articles/a/two.html')), false, 'only changed documents are written');
  assert.equal(fs.readFileSync(path.join(out, 'changed-paths.txt'), 'utf8'), '/de/en/articles/a/one\n');
  const rows = fs.readFileSync(path.join(out, 'changes.tsv'), 'utf8').trim().split('\n').map((l) => l.split('\t').slice(0, 2));
  assert.deepEqual(rows, [['path', 'status'], ['/de/en/articles/a/one', 'changed'], ['/de/de/articles/a/two', 'has-heading'], ['/de/de/articles/a/three', 'no-block'], ['/de/de/articles/a/missing', 'error']]);
  // resumed: the documents already listed are not read again (the error is retried)
  assert.match(run(), /3 already done, 0 changed, 0 has-heading, 0 no-block, 1 error/);
  fs.rmSync(tmp, { recursive: true, force: true });
});
