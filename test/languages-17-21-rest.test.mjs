/* eslint-disable max-len, no-new-func, import/no-extraneous-dependencies, import/extensions -- dev tooling; js-yaml is a dev dependency */
/* The rest of Italian, Greek, Japanese, Korean and Polish before their waves (batches 17-21):
   - the query indexes of xx/it, xx/el, xx/ja, xx/ko and xx/pl: search-xx-<ll> as xx/zh's (its
     include, its language's excludes, its columns with the markets column), market-model-xx-<ll>
     and market-llms-xx-<ll> as tools/markets/lean-indexes.mjs makes them; after xx/zh's, SWISS's
     pair still last, every other index as before;
   - the form's built-in texts in pl: the submit button, the file row's drop prompt and select
     button as www's xx/pl feedback form has them (its previewed document, imported from www's
     capture), the rest the replica's own; it, el and ja
     wait (their tables would change the brand sites' forms too);
   - the timetable's weekdays in el, ja, ko and pl (the browser's short names; www has no
     timetable in them);
   - zh, hk, pt and ru: every form key, www's three form texts, their weekdays (no gap).
   Run: node --max-old-space-size=512 --test test/languages-17-21-rest.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import yaml from 'js-yaml';
import { leanDefinitions, ROOTS } from '../tools/markets/lean-indexes.mjs';

const BEFORE = 'c41ea1fa';
const LANGS = ['it', 'el', 'ja', 'ko', 'pl'];

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
const show = (rev, file) => (rev ? execFileSync('git', ['show', `${rev}:${file}`], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }) : fs.readFileSync(file, 'utf8'));

test('the query indexes of xx/it, xx/el, xx/ja, xx/ko, xx/pl: as xx/zh\'s, after them; every other index as before', () => {
  const { indices } = yaml.load(show(null, 'helix-query.yaml'));
  const { indices: old } = yaml.load(show(BEFORE, 'helix-query.yaml'));
  const swap = (def, l) => JSON.parse(JSON.stringify(def).replace(/xx\/zh/g, `xx/${l}`).replace(/xx-zh/g, `xx-${l}`));
  LANGS.forEach((l) => {
    ['search', 'market-model', 'market-llms'].forEach((kind) => {
      const name = `${kind}-xx-${l}`;
      assert.ok(indices[name], name);
      assert.ok(!old[name], `${name} is new`);
      assert.deepEqual(indices[name], swap(indices[`${kind}-xx-zh`], l), `${name} as xx/zh's`);
    });
    const s = indices[`search-xx-${l}`];
    assert.deepEqual(s.include, [`/xx/${l}/**`]);
    assert.ok(s.exclude.includes(`/xx/${l}/nav`) && s.exclude.includes(`/xx/${l}/**/confirmation`), `${l}: its own excludes`);
    assert.ok(s.exclude.every((e) => e.startsWith(`/xx/${l}/`)), `${l}: no other language's paths`);
    assert.equal(s.target, `/xx/${l}/search-index.json`);
    assert.equal(indices[`market-model-xx-${l}`].target, `/market-model/xx-${l}.json`);
    assert.equal(indices[`market-llms-xx-${l}`].target, `/market-llms/xx-${l}.json`);
    ['search', 'market-model', 'market-llms'].forEach((kind) => assert.ok(indices[`${kind}-xx-${l}`].properties.markets, `${kind}-xx-${l}: markets`));
    assert.ok(ROOTS.includes(`xx/${l}`), `lean-indexes ROOTS: xx/${l}`);
  });
  // the lean copies as lean-indexes.mjs makes them (its --check)
  const lean = leanDefinitions(indices);
  Object.entries(lean).forEach(([k, def]) => assert.deepEqual(indices[k], def, k));
  const keys = Object.keys(indices);
  const at = keys.indexOf('market-llms-xx-zh');
  assert.deepEqual(keys.slice(at + 1, at + 16), LANGS.flatMap((l) => [`search-xx-${l}`, `market-model-xx-${l}`, `market-llms-xx-${l}`]), 'after xx/zh\'s');
  assert.deepEqual(keys.slice(-2), ['search-medicalservices-en', 'search-medicalservices-de'], 'SWISS\'s pair still last');
  Object.entries(old).forEach(([name, def]) => assert.deepEqual(indices[name], def, `${name} as before`));
});

// www's xx/<ll> feedback form (feedback-past-flight, its previewed document)
const WWW = {
  pl: ['Prześlij', 'Przeciągnij i upuść pliki tutaj', 'Wybierz plik(i)'],
  // ko's drop prompt is the replica's (www: 여기에 파일을 가져다 놓으십시오.), kept as it was
  ko: ['제출', '여기에 파일을 끌어다 놓으십시오', '파일 선택'],
  zh: ['提交', '请将您的文件拖放到这里', '选择文件'],
  hk: ['提交', '請將檔案拖放到此處', '選擇檔案'],
  pt: ['Submeter', 'Arraste e largue os seus ficheiros aqui', 'Selecionar ficheiro(s)'],
  ru: ['Отправить', 'Перетащите сюда файлы', 'Выбрать файл(-ы)'],
};

test('the form\'s built-in texts in pl (and every language with a table): every en key, the same placeholders, not the English text; www\'s submit, drop prompt and select', () => {
  const src = show(null, 'blocks/form/form.js');
  const t = table(src, 'DEFAULT_LABELS');
  const totals = table(src, 'FILE_TOTAL_LABELS');
  const ph = (v) => (String(v).match(/\{[A-Z_]+\}/g) || []).sort();
  Object.entries(WWW).forEach(([l, [submit, prompt, select]]) => {
    assert.ok(t[l], `form: ${l}`);
    assert.deepEqual(Object.keys(t[l]).sort(), Object.keys(t.en).sort(), `${l}: en's keys`);
    Object.entries(t.en).forEach(([k, v]) => {
      assert.ok(typeof t[l][k] === 'string' && t[l][k].trim(), `${l} ${k}`);
      assert.deepEqual(ph(t[l][k]), ph(v), `${l} ${k} placeholders`);
      if (/[a-z]{3}/i.test(v)) assert.notEqual(t[l][k], v, `${l} ${k} is the English text`);
    });
    assert.deepEqual([t[l]['submit label'], t[l]['file prompt'], t[l]['file select']], [submit, prompt, select], `${l}: www's`);
  });
  // the total line as FILE_TOTAL_LABELS has it; "Remove" as www's destination finder writes it
  assert.equal(t.pl['file total'], totals.pl);
  assert.equal(t.pl['repeat remove'], 'Usuń');
  assert.equal(t.pl.no, 'Nie');
  ['it', 'el', 'ja'].forEach((l) => assert.equal(t[l], undefined));
  // every other language as before
  const b = table(show(BEFORE, 'blocks/form/form.js'), 'DEFAULT_LABELS');
  Object.keys(b).forEach((l) => assert.deepEqual(t[l], b[l], `${l} as before`));
  assert.deepEqual(totals, table(show(BEFORE, 'blocks/form/form.js'), 'FILE_TOTAL_LABELS'));
});

test('the timetable\'s weekdays in el, ja, ko, pl, Monday first; zh, hk, pt, ru have theirs; the others as before', () => {
  const w = table(show(null, 'blocks/flight-timetable/flight-timetable.js'), 'WEEKDAYS');
  assert.deepEqual(w.el, ['Δευ', 'Τρί', 'Τετ', 'Πέμ', 'Παρ', 'Σάβ', 'Κυρ']);
  assert.deepEqual(w.ja, ['月', '火', '水', '木', '金', '土', '日']);
  assert.deepEqual(w.ko, ['월', '화', '수', '목', '금', '토', '일']);
  assert.deepEqual(w.pl, ['pon', 'wt', 'śr', 'czw', 'pt', 'sob', 'niedz']);
  ['zh', 'hk', 'pt', 'ru', 'it'].forEach((l) => assert.equal(w[l].length, 7, l));
  const old = table(show(BEFORE, 'blocks/flight-timetable/flight-timetable.js'), 'WEEKDAYS');
  Object.keys(old).forEach((l) => assert.deepEqual(w[l], old[l], l));
});
