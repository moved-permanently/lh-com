/* eslint-disable max-len, no-new-func */
/* French on French pages (brief 268, wave 11): the header, footer, form and search texts the site
   brings itself have a French entry with every en key and the same {placeholders}, and no French
   text is the English one (words that are the same in both languages listed); what a French page
   of fr/fr and its market roots resolves (block-config.js resolveLabels) is French. en and de stay
   as they are. Run: node --max-old-space-size=512 --test test/french-labels.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { resolveLabels } from '../scripts/block-config.js';
import { getLocale } from '../scripts/locale.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TABLES = {
  'blocks/header/header.js': ['LABELS'],
  'blocks/footer/footer.js': ['LABELS'],
  'blocks/form/form.js': ['DEFAULT_LABELS'],
  'blocks/search-results/search-results.js': ['DEFAULT_LABELS'],
};
// the same in French and English (or a sign, a name)
const SAME = new Set(['*', 'Navigation', 'Menu', 'Page {PAGE}', 'Lufthansa', 'Miles & More', 'Travel ID', 'Login', 'OK', 'E-mail', 'Newsletter', 'Business Class', 'First Class', 'Economy Class', 'Premium Economy Class']);

/** The object literal of `const NAME = {...}` in a source, evaluated (plain data only). */
function table(src, name) {
  const at = src.indexOf(`const ${name} = {`);
  assert.ok(at >= 0, name);
  let i = src.indexOf('{', at);
  const start = i;
  let depth = 0;
  let quote = null;
  for (; i < src.length; i += 1) {
    const c = src[i];
    if (quote) {
      if (c === '\\') i += 1;
      else if (c === quote) quote = null;
    } else if (c === "'" || c === '"' || c === '`') quote = c;
    else if (c === '{') depth += 1;
    else if (c === '}') { depth -= 1; if (depth === 0) break; }
  }
  return new Function(`return (${src.slice(start, i + 1)});`)();
}
const placeholders = (v) => JSON.stringify(v).match(/\{[A-Za-z]+\}/g)?.sort() || [];
const flat = (o, p = '') => Object.entries(o).flatMap(([k, v]) => (v && typeof v === 'object' ? flat(v, `${p}${k}.`) : [[`${p}${k}`, v]]));

test('the header, footer, form and search tables: French with every en key and placeholder, no English text', () => {
  Object.entries(TABLES).forEach(([file, names]) => {
    const src = fs.readFileSync(path.join(root, file), 'utf8');
    names.forEach((name) => {
      const t = table(src, name);
      assert.ok(t.fr, `${file} ${name}: fr`);
      const fr = Object.fromEntries(flat(t.fr));
      flat(t.en).forEach(([k, v]) => {
        assert.ok(k in fr, `${file} ${name} fr: ${k}`);
        assert.deepEqual(placeholders(fr[k]), placeholders(v), `${file} ${name} fr: ${k} placeholders`);
        if (typeof v === 'string' && /[a-z]{3}/i.test(v) && !SAME.has(v.trim())) assert.notEqual(fr[k], v, `${file} ${name} fr: ${k} is the English text`);
      });
    });
  });
});

test('a French page of fr/fr and of a French market root resolves the form and search texts in French', () => {
  ['/fr/fr/feedback-past-flight', '/ch/fr/feedback-past-flight', '/be/fr/support/search/search-result'].forEach((p) => {
    const { lang } = getLocale(p);
    assert.equal(lang, 'fr', p);
    ['blocks/form/form.js', 'blocks/search-results/search-results.js'].forEach((file) => {
      const t = table(fs.readFileSync(path.join(root, file), 'utf8'), 'DEFAULT_LABELS');
      const labels = resolveLabels(t, {}, lang);
      Object.entries(labels).forEach(([k, v]) => {
        if (typeof v === 'string' && /[a-z]{3}/i.test(v) && !SAME.has(v.trim())) assert.notEqual(v, t.en[k], `${p} ${file}: ${k}`);
      });
    });
  });
});

test('en and de of the tables as before', () => {
  Object.entries(TABLES).forEach(([file, names]) => {
    const before = execFileSync('git', ['show', `9241ab9:${file}`], { cwd: root, encoding: 'utf8' });
    const now = fs.readFileSync(path.join(root, file), 'utf8');
    names.forEach((name) => ['en', 'de'].forEach((l) => assert.deepEqual(table(now, name)[l], table(before, name)[l], `${file} ${name} ${l}`)));
  });
});
