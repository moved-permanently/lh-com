/* eslint-disable max-len, no-new-func, import/no-extraneous-dependencies, import/extensions -- dev tooling; js-yaml is a dev dependency */
/* Portuguese for lufthansa.com, its shared parts (brief 306; tools/reports/markets/pt.md): the
   locale rows (xx/pt the language version with its own documents, hreflang pt; ao/pt, br/pt, pt/pt
   its market roots; all pilot, batch 13; the switch and the four live roots as before), xx/pt's
   query indexes (search-xx-pt as xx/es's, its lean model and llms copies; no other index changed),
   and the Portuguese of the built-in texts 299 left out (form, the flight search's picker options,
   the article dates, the flight timetable's weekdays, the accordion filter), en, de and the other
   languages as before. Not search results: lufthansa.com has no xx/pt search page, and SWISS's
   Portuguese search pages author their own rows (test/swiss-search-pages.test.mjs).
   Run: node --max-old-space-size=512 --test test/portuguese.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import yaml from 'js-yaml';
import { LANGUAGE_VERSIONS } from '../scripts/locale-table.js';
import { getLocale, liveOwnRoots, LOCALE_TABLE } from '../scripts/locale.js';
import { formatArticleDate } from '../scripts/articles.js';
import { buildTable } from '../tools/markets/build-locale-table.mjs';
import { withoutSwissContentCap } from './query-later.mjs';

const BEFORE = '70a732f';

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
// the table as built with the pinned commit's go-live setting (tools/reports/markets/go-live.md: the
// switch turns pilot rows live; as test/go-live.test.mjs, these checks hold with any liveWaves)
const PINNED = buildTable(undefined, { ...JSON.parse(show(null, 'tools/markets/locale-data.json')), liveWaves: JSON.parse(show(BEFORE, 'tools/markets/locale-data.json')).liveWaves }).rows;

test('the rows: xx/pt the language version (own documents, hreflang pt), ao/pt, br/pt, pt/pt its market roots; all pilot, batch 13', () => {
  const data = JSON.parse(fs.readFileSync('tools/markets/locale-data.json', 'utf8'));
  assert.equal(LANGUAGE_VERSIONS.pt, 'xx/pt');
  assert.equal(data.languageVersions.pt, 'xx/pt');
  assert.deepEqual(liveOwnRoots(PINNED), ['de/en', 'de/de', 'at/de', 'gb/en']);
  const pt = Object.entries(LOCALE_TABLE).filter(([, r]) => r.lang === 'pt').map(([k]) => k).sort();
  assert.deepEqual(pt, ['ao/pt', 'br/pt', 'pt/pt', 'xx/pt']);
  const expect = {
    'xx/pt': ['Outros países | Português', 'FRA', 'EUR', 'own'],
    'ao/pt': ['Angola | Português', 'LAD', 'USD', 'language'],
    'br/pt': ['Brasil | Português', 'SAO', 'BRL', 'language'],
    'pt/pt': ['Portugal | Português', 'LIS', 'EUR', 'language'],
  };
  Object.entries(expect).forEach(([k, [name, airport, currency, documents]]) => {
    const r = data.roots[k];
    assert.deepEqual([r.name, r.homeAirport, r.currency, r.documents, r.status, r.batch], [name, airport, currency, documents, 'pilot', 13], k);
    assert.equal(PINNED[k].status, 'pilot', k);
  });
  assert.equal(LOCALE_TABLE['xx/pt'].hreflang, 'pt');
  assert.equal(LOCALE_TABLE['br/pt'].hreflang, 'pt-BR');
  assert.equal(getLocale('/xx/pt/homepage').key, 'xx/pt');
  ['ao/pt', 'br/pt', 'pt/pt'].forEach((k) => assert.equal(getLocale(`/${k}/bagagem`).versionBase, '/xx/pt', k));
  // every row that was there stays as it was
  const before = JSON.parse(show(BEFORE, 'tools/markets/locale-data.json'));
  Object.entries(before.roots).forEach(([k, r]) => assert.deepEqual(data.roots[k], r, k));
  Object.entries(before.languageVersions).forEach(([l, v]) => assert.equal(data.languageVersions[l], v, l));
});

test('xx/pt\'s query indexes: search-xx-pt as xx/es\'s, its lean copies; no other index changed', () => {
  // SWISS's ch/el and ch/ru content cap (standing order 11) read as before (test/query-later.mjs)
  const indices = withoutSwissContentCap(yaml.load(fs.readFileSync('helix-query.yaml', 'utf8')).indices);
  const { indices: old } = yaml.load(show(BEFORE, 'helix-query.yaml'));
  const es = indices['search-xx-es'];
  const pt = indices['search-xx-pt'];
  assert.ok(pt, 'search-xx-pt');
  assert.deepEqual(pt, JSON.parse(JSON.stringify(es).replace(/xx\/es/g, 'xx/pt')));
  assert.equal(pt.target, '/xx/pt/search-index.json');
  assert.equal(indices['market-model-xx-pt'].target, '/market-model/xx-pt.json');
  assert.ok(indices['market-llms-xx-pt']);
  // message-center's weight (TAP's order, brief 326) came later; everything else as before
  // and the card-image rule keeping Edge Delivery's ./media_ address (brief 338)
  const CARD = 'match(attribute(el, "content"), "^(?:https:\\/\\/[^/]+)?((?:[.])?/.*)$")';
  const CARD_BEFORE = 'match(attribute(el, "content"), "https:\\/\\/[^/]+(/.*)")';
  const cardAsBefore = (d) => (d && d.properties ? {
    ...d,
    properties: Object.fromEntries(Object.entries(d.properties).map(([k, p]) => [k, p && p.value === CARD ? { ...p, value: CARD_BEFORE } : p])),
  } : d);
  // and market-pages' markets column (brief 411, lh-edge's donor documents)
  const pagesAsBefore = (name, d) => (name === 'market-pages' && d ? {
    ...d, properties: Object.fromEntries(Object.entries(d.properties).filter(([k]) => k !== 'markets')),
  } : d);
  const later = (name, d) => cardAsBefore(name === 'message-center' && d ? {
    ...d, properties: Object.fromEntries(Object.entries(d.properties).filter(([k]) => k !== 'weight')),
  } : d);
  Object.entries(old).forEach(([name, def]) => assert.deepEqual(later(name, pagesAsBefore(name, indices[name])), def, `${name} as before`));
  // appended after the indexes of 70a732f (later additions may follow them)
  const keys = Object.keys(indices);
  const lastOld = Math.max(...Object.keys(old).map((k) => keys.indexOf(k)));
  ['search-xx-pt', 'market-model-xx-pt', 'market-llms-xx-pt'].forEach((k, i) => assert.equal(keys.indexOf(k), lastOld + 1 + i, `${k} after the existing ones`));
});

const PT_TABLES = {
  'blocks/form/form.js': 'DEFAULT_LABELS',
  'blocks/flight-search/picker-options.js': 'PICKER_OPTION_LABELS',
  'blocks/accordion-columns/accordion-columns.js': 'FILTER_LABELS',
};
const SAME = new Set(['*']);

test('the built-in texts in Portuguese: form, picker options, accordion filter (every en key, the same placeholders, no English)', () => {
  const ph = (v) => (String(v).match(/\{[A-Z_]+\}/g) || []).sort();
  Object.entries(PT_TABLES).forEach(([file, name]) => {
    const t = table(show(null, file), name);
    assert.ok(t.pt, `${file} ${name}: pt`);
    Object.entries(t.en).forEach(([k, v]) => {
      assert.ok(typeof t.pt[k] === 'string' && t.pt[k].trim(), `${file} ${k}`);
      assert.deepEqual(ph(t.pt[k]), ph(v), `${file} ${k} placeholders`);
      if (/[a-z]{3}/i.test(v) && !SAME.has(v)) assert.notEqual(t.pt[k], v, `${file} ${k} is the English text`);
    });
    const b = table(show(BEFORE, file), name);
    Object.keys(b).forEach((l) => assert.deepEqual(t[l], b[l], `${file} ${name} ${l} as before`));
  });
  // www's xx/pt feedback form (preview document): its own wording
  const form = table(show(null, 'blocks/form/form.js'), 'DEFAULT_LABELS').pt;
  assert.equal(form['submit label'], 'Submeter');
  assert.equal(form['file prompt'], 'Arraste e largue os seus ficheiros aqui');
  assert.equal(form['file select'], 'Selecionar ficheiro(s)');
});

test('article dates in Portuguese ("3 de novembro de 2026"); the other languages as before', () => {
  assert.equal(formatArticleDate('2026-11-03', { lang: 'pt', country: 'xx' }), '3 de novembro de 2026');
  assert.equal(formatArticleDate('2026-03-15', { lang: 'pt', country: 'br' }), '15 de março de 2026');
  assert.equal(formatArticleDate('2026-11-03', { lang: 'de', country: 'de' }), '3. November 2026');
  assert.equal(formatArticleDate('2026-11-03', { lang: 'en', country: 'gb' }), 'November 3, 2026');
  assert.equal(formatArticleDate('2026-11-03', { lang: 'en', country: 'de' }), '3. November 2026');
  const months = table(show(null, 'scripts/articles.js'), 'MONTHS');
  const old = table(show(BEFORE, 'scripts/articles.js'), 'MONTHS');
  Object.keys(old).forEach((l) => assert.deepEqual(months[l], old[l], l));
});

test('the flight timetable\'s weekdays: Portuguese, and a language without its own the English ones (it threw before)', () => {
  const src = show(null, 'blocks/flight-timetable/flight-timetable.js');
  const w = table(src, 'WEEKDAYS');
  assert.equal(w.pt.length, 7);
  assert.ok(w.pt.every((d, i) => d && d !== w.en[i]));
  assert.match(src, /\(WEEKDAYS\[lang\] \|\| WEEKDAYS\.en\)/);
});
