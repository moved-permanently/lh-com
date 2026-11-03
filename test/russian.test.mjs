/* eslint-disable max-len, no-new-func, import/no-extraneous-dependencies, import/extensions -- dev tooling; js-yaml is a dev dependency */
/* Russian for lufthansa.com, its shared parts (brief 308; tools/reports/markets/ru.md): the locale
   rows (xx/ru the language version with its own documents, hreflang ru; by/ru, kz/ru, ru/ru its
   market roots; www's labels, English country names as www has them; currencies where www shows
   one (kz/ru KZT), else none; all pilot, batch 14; the switch and the four live roots as before),
   xx/ru's query indexes (search-xx-ru as xx/es's, its lean model and llms copies, after xx/pt's: no
   other index changed, SWISS's medical services pair stays last), and the Russian of the built-in
   texts 299 left out (form, the flight search's picker options, the article dates, the flight
   timetable's weekdays, the accordion filter), every other language as before. Not search results:
   lufthansa.com has no xx/ru search page, SWISS's Russian search pages author their own rows.
   Run: node --max-old-space-size=512 --test test/russian.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import yaml from 'js-yaml';
import { LANGUAGE_VERSIONS } from '../scripts/locale-table.js';
import { getLocale, LIVE_ROOTS, LOCALE_TABLE } from '../scripts/locale.js';
import { formatArticleDate } from '../scripts/articles.js';

const BEFORE = '4865efb';

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
const show = (rev, file) => (rev ? execFileSync('git', ['show', `${rev}:${file}`], { encoding: 'utf8' }) : fs.readFileSync(file, 'utf8'));

test('the rows: xx/ru the language version (own documents, hreflang ru), by/ru, kz/ru, ru/ru its market roots; all pilot, batch 14', () => {
  const data = JSON.parse(fs.readFileSync('tools/markets/locale-data.json', 'utf8'));
  assert.equal(LANGUAGE_VERSIONS.ru, 'xx/ru');
  assert.equal(data.languageVersions.ru, 'xx/ru');
  assert.deepEqual(data.liveWaves, JSON.parse(show(BEFORE, 'tools/markets/locale-data.json')).liveWaves, 'the switch as before');
  assert.deepEqual(LIVE_ROOTS, ['de/en', 'de/de', 'at/de', 'gb/en']);
  const ru = Object.entries(LOCALE_TABLE).filter(([, r]) => r.lang === 'ru').map(([k]) => k).sort();
  assert.deepEqual(ru, ['by/ru', 'kz/ru', 'ru/ru', 'xx/ru']);
  const expect = {
    'xx/ru': ['Другие страны | Русский', { en: null, de: null, ru: 'Другие страны' }, 'FRA', null, 'own'],
    'by/ru': ['Belarus | Русский', { en: 'Belarus', de: 'Belarus', ru: 'Belarus' }, 'FRA', null, 'language'],
    'kz/ru': ['Kazakhstan | Русский', { en: 'Kazakhstan', de: 'Kasachstan', ru: 'Kazakhstan' }, 'NQZ', 'KZT', 'language'],
    'ru/ru': ['Russian Federation | Русский', { en: 'Russian Federation', de: 'Russische Föderation', ru: 'Russian Federation' }, 'FRA', null, 'language'],
  };
  Object.entries(expect).forEach(([k, [name, countryName, airport, currency, documents]]) => {
    const r = data.roots[k];
    assert.deepEqual([r.name, r.countryName, r.homeAirport, r.currency, r.documents, r.status, r.batch], [name, countryName, airport, currency, documents, 'pilot', 14], k);
    if (currency === null) assert.ok(r.unverified.includes('currency'), `${k}: the currency unverified (www shows none)`);
    assert.equal(LOCALE_TABLE[k].status, 'pilot', k);
  });
  assert.equal(LOCALE_TABLE['xx/ru'].hreflang, 'ru');
  assert.equal(LOCALE_TABLE['kz/ru'].hreflang, 'ru-KZ');
  assert.equal(getLocale('/xx/ru/homepage').key, 'xx/ru');
  ['by/ru', 'kz/ru', 'ru/ru'].forEach((k) => assert.equal(getLocale(`/${k}/bagazh`).versionBase, '/xx/ru', k));
  // every row that was there stays as it was
  const before = JSON.parse(show(BEFORE, 'tools/markets/locale-data.json'));
  Object.entries(before.roots).forEach(([k, r]) => assert.deepEqual(data.roots[k], r, k));
  Object.entries(before.languageVersions).forEach(([l, v]) => assert.equal(data.languageVersions[l], v, l));
});

test('xx/ru\'s query indexes: search-xx-ru as xx/es\'s, its lean copies after xx/pt\'s; no other index changed', () => {
  const { indices } = yaml.load(fs.readFileSync('helix-query.yaml', 'utf8'));
  const { indices: old } = yaml.load(show(BEFORE, 'helix-query.yaml'));
  const es = indices['search-xx-es'];
  const ru = indices['search-xx-ru'];
  assert.ok(ru, 'search-xx-ru');
  assert.deepEqual(ru, JSON.parse(JSON.stringify(es).replace(/xx\/es/g, 'xx/ru')));
  assert.equal(ru.target, '/xx/ru/search-index.json');
  assert.equal(indices['market-model-xx-ru'].target, '/market-model/xx-ru.json');
  assert.ok(indices['market-llms-xx-ru']);
  Object.entries(old).forEach(([name, def]) => assert.deepEqual(indices[name], def, `${name} as before`));
  const keys = Object.keys(indices);
  const at = keys.indexOf('market-llms-xx-pt');
  assert.deepEqual(keys.slice(at + 1, at + 4), ['search-xx-ru', 'market-model-xx-ru', 'market-llms-xx-ru'], 'after xx/pt\'s');
  assert.deepEqual(keys.slice(-2), ['search-medicalservices-en', 'search-medicalservices-de'], 'SWISS\'s pair still last');
});

const RU_TABLES = {
  'blocks/form/form.js': 'DEFAULT_LABELS',
  'blocks/flight-search/picker-options.js': 'PICKER_OPTION_LABELS',
  'blocks/accordion-columns/accordion-columns.js': 'FILTER_LABELS',
};
const SAME = new Set(['*']);

test('the built-in texts in Russian: form, picker options, accordion filter (every en key, the same placeholders, no English)', () => {
  const ph = (v) => (String(v).match(/\{[A-Z_]+\}/g) || []).sort();
  Object.entries(RU_TABLES).forEach(([file, name]) => {
    const t = table(show(null, file), name);
    assert.ok(t.ru, `${file} ${name}: ru`);
    Object.entries(t.en).forEach(([k, v]) => {
      assert.ok(typeof t.ru[k] === 'string' && t.ru[k].trim(), `${file} ${k}`);
      assert.deepEqual(ph(t.ru[k]), ph(v), `${file} ${k} placeholders`);
      if (/[a-z]{3}/i.test(v) && !SAME.has(v)) assert.notEqual(t.ru[k], v, `${file} ${k} is the English text`);
    });
    const b = table(show(BEFORE, file), name);
    Object.keys(b).forEach((l) => assert.deepEqual(t[l], b[l], `${file} ${name} ${l} as before`));
  });
  // www's xx/ru feedback form (preview document): its own wording
  const form = table(show(null, 'blocks/form/form.js'), 'DEFAULT_LABELS').ru;
  assert.equal(form['submit label'], 'Отправить');
  assert.equal(form['file prompt'], 'Перетащите сюда файлы');
  assert.equal(form['file select'], 'Выбрать файл(-ы)');
});

test('article dates in Russian ("3 ноября 2026 г.", the genitive month); the other languages as before', () => {
  assert.equal(formatArticleDate('2026-11-03', { lang: 'ru', country: 'xx' }), '3 ноября 2026 г.');
  assert.equal(formatArticleDate('2026-03-15', { lang: 'ru', country: 'kz' }), '15 марта 2026 г.');
  assert.equal(formatArticleDate('2026-11-03', { lang: 'pt', country: 'xx' }), '3 de novembro de 2026');
  assert.equal(formatArticleDate('2026-11-03', { lang: 'de', country: 'de' }), '3. November 2026');
  assert.equal(formatArticleDate('2026-11-03', { lang: 'en', country: 'gb' }), 'November 3, 2026');
  const months = table(show(null, 'scripts/articles.js'), 'MONTHS');
  const old = table(show(BEFORE, 'scripts/articles.js'), 'MONTHS');
  Object.keys(old).forEach((l) => assert.deepEqual(months[l], old[l], l));
});

test('the flight timetable\'s weekdays in Russian', () => {
  const src = show(null, 'blocks/flight-timetable/flight-timetable.js');
  const w = table(src, 'WEEKDAYS');
  assert.equal(w.ru.length, 7);
  assert.ok(w.ru.every((d, i) => d && d !== w.en[i]));
  const old = table(show(BEFORE, 'blocks/flight-timetable/flight-timetable.js'), 'WEEKDAYS');
  Object.keys(old).forEach((l) => assert.deepEqual(w[l], old[l], l));
});
