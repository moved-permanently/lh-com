/* eslint-disable max-len, no-new-func, import/extensions -- dev tooling */
/* Italian, Greek, Japanese, Korean and Polish for lufthansa.com, their shared parts (batches 17-21;
   tools/reports/markets/{it,el,ja,ko,pl}.md): the locale rows as the reports propose them (xx/<ll>
   each language's version with its own documents; ch/it, it/it, cy/el, gr/el, jp/ja, kr/ko, pl/pl
   its market roots; www's labels, jp/ja's as www writes it, "Japan | 日本語"; it/it's country names
   the right way round, pl/pl's English "Poland", kr/ko's currency KRW as its fare teaser's
   prices), all pilot, behind the switch: no new wave, the live roots as before, ch/it pilot in
   the ch wave while xx/it is; hreflang as www's sitemaps give it per root (as zh's and hk's), every
   other row as before. The built-in texts in the five languages: the flight search's picker
   options, the accordion filter, the article dates; every other language as before.
   Run: node --max-old-space-size=512 --test test/languages-17-21.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { LANGUAGE_VERSIONS } from '../scripts/locale-table.js';
import { getLocale, liveOwnRoots, LOCALE_TABLE } from '../scripts/locale.js';
import { formatArticleDate } from '../scripts/articles.js';
import { buildTable } from '../tools/markets/build-locale-table.mjs';

const BEFORE = 'c2f4521b';
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
const show = (rev, file) => (rev ? execFileSync('git', ['show', `${rev}:${file}`], { encoding: 'utf8' }) : fs.readFileSync(file, 'utf8'));
const data = JSON.parse(show(null, 'tools/markets/locale-data.json'));
const before = JSON.parse(show(BEFORE, 'tools/markets/locale-data.json'));
// the table as built with the pinned commit's go-live setting (as test/go-live.test.mjs: these
// checks hold with any liveWaves)
const PINNED = buildTable(undefined, { ...data, liveWaves: before.liveWaves }).rows;

const EXPECT = {
  'xx/it': ['Altri paesi | Italiano', { en: null, de: null, it: 'Altri paesi' }, 'FRA', 'EUR', 'own', 17, 'it'],
  'ch/it': ['Svizzera | Italiano', { en: 'Switzerland', de: 'Schweiz', it: 'Svizzera' }, 'ZRH', 'CHF', 'language', 17, 'it-CH'],
  'it/it': ['Italia | Italiano', { en: 'Italy', de: 'Italien', it: 'Italia' }, 'MIL', 'EUR', 'language', 17, 'it-IT'],
  'xx/el': ['Παγκόσμιος ιστότοπος | Ελληνικά', { en: null, de: null, el: 'Παγκόσμιος ιστότοπος' }, 'FRA', 'EUR', 'own', 18, 'el'],
  'cy/el': ['Κύπρος | Ελληνικά', { en: 'Cyprus', de: 'Zypern', el: 'Κύπρος' }, 'LCA', 'EUR', 'language', 18, 'el-CY'],
  'gr/el': ['Ελλάδα | Ελληνικά', { en: 'Greece', de: 'Griechenland', el: 'Ελλάδα' }, 'ATH', 'EUR', 'language', 18, 'el-GR'],
  'xx/ja': ['その他の国 | 日本語', { en: null, de: null, ja: 'その他の国' }, 'FRA', 'EUR', 'own', 19, 'ja'],
  'jp/ja': ['Japan | 日本語', { en: 'Japan', de: 'Japan', ja: 'Japan' }, 'TYO', 'JPY', 'language', 19, 'ja-JP'],
  'xx/ko': ['다른 국가들 | 한국어', { en: null, de: null, ko: '다른 국가들' }, 'FRA', 'EUR', 'own', 20, 'ko'],
  'kr/ko': ['대한민국 | 한국어', { en: 'Korea, Republic of', de: 'Korea, Republik', ko: '대한민국' }, 'SEL', 'KRW', 'language', 20, 'ko-KR'],
  'xx/pl': ['Inne kraje | Polski', { en: null, de: null, pl: 'Inne kraje' }, 'FRA', 'EUR', 'own', 21, 'pl'],
  'pl/pl': ['Polska | Polski', { en: 'Poland', de: 'Polen', pl: 'Polska' }, 'WAW', 'PLN', 'language', 21, 'pl-PL'],
};

test('the rows: each language\'s version xx/<ll> (own documents) and its market roots, as the reports propose with the user\'s calls; all pilot, batches 17-21', () => {
  LANGS.forEach((l) => {
    assert.equal(data.languageVersions[l], `xx/${l}`, l);
    assert.equal(LANGUAGE_VERSIONS[l], `xx/${l}`, l);
    const roots = Object.entries(LOCALE_TABLE).filter(([, r]) => r.lang === l).map(([k]) => k).sort();
    assert.deepEqual(roots, Object.keys(EXPECT).filter((k) => k.endsWith(`/${l}`)).sort(), l);
  });
  Object.entries(EXPECT).forEach(([k, [name, countryName, airport, currency, documents, batch]]) => {
    const r = data.roots[k];
    assert.deepEqual([r.name, r.countryName, r.homeAirport, r.currency, r.documents, r.status, r.batch], [name, countryName, airport, currency, documents, 'pilot', batch], k);
    assert.deepEqual(r.unverified, documents === 'own' ? ['countryName.en', 'countryName.de', 'timeZone', 'shopLang'] : ['timeZone', 'shopLang'], k);
    assert.equal(PINNED[k].status, 'pilot', k);
  });
  LANGS.forEach((l) => {
    assert.equal(getLocale(`/xx/${l}/homepage`).key, `xx/${l}`, l);
    Object.keys(EXPECT).filter((k) => k.endsWith(`/${l}`) && !k.startsWith('xx/')).forEach((k) => assert.equal(getLocale(`/${k}/baggage`).versionBase, `/xx/${l}`, k));
  });
  // every row that was there stays as it was (the go-live waves change liveWaves, not the rows)
  Object.entries(before.roots).forEach(([k, r]) => assert.deepEqual(data.roots[k], r, k));
  Object.entries(before.languageVersions).forEach(([l, v]) => assert.equal(data.languageVersions[l], v, l));
});

test('behind the switch: the live roots as before; ch/it pilot in the ch wave while xx/it is', () => {
  const old = buildTable(undefined, before).rows;
  assert.deepEqual(liveOwnRoots(PINNED), liveOwnRoots(old));
  Object.keys(EXPECT).forEach((k) => assert.equal(PINNED[k].status, 'pilot', k));
  assert.equal(data.liveWaves.includes('ch'), true);
  assert.equal(PINNED['ch/it'].status, 'pilot');
  // switched on, a wave turns its version and roots live together
  const on = buildTable(undefined, { ...data, liveWaves: [...before.liveWaves, 17] }).rows;
  ['xx/it', 'ch/it', 'it/it'].forEach((k) => assert.equal(on[k].status, 'live', k));
  ['xx/el', 'gr/el', 'jp/ja'].forEach((k) => assert.equal(on[k].status, 'pilot', k));
});

test('hreflang as www\'s sitemaps give it per root; every other row of the table as before', () => {
  Object.entries(EXPECT).forEach(([k, e]) => assert.equal(LOCALE_TABLE[k].hreflang, e[6], k));
  const old = buildTable(undefined, before).rows;
  Object.entries(old).forEach(([k, r]) => assert.deepEqual(PINNED[k], r, k));
});

const TABLES = {
  'blocks/flight-search/picker-options.js': 'PICKER_OPTION_LABELS',
  'blocks/accordion-columns/accordion-columns.js': 'FILTER_LABELS',
};

test('the built-in texts in the five languages: picker options, accordion filter (every en key, the same placeholders, not the English text); the others as before', () => {
  const ph = (v) => (String(v).match(/\{[A-Z_]+\}/g) || []).sort();
  Object.entries(TABLES).forEach(([file, name]) => {
    const t = table(show(null, file), name);
    LANGS.forEach((l) => {
      assert.ok(t[l], `${file} ${name}: ${l}`);
      Object.entries(t.en).forEach(([k, v]) => {
        assert.ok(typeof t[l][k] === 'string' && t[l][k].trim(), `${file} ${l} ${k}`);
        assert.deepEqual(ph(t[l][k]), ph(v), `${file} ${l} ${k} placeholders`);
        assert.notEqual(t[l][k], v, `${file} ${l} ${k} is the English text`);
      });
      assert.deepEqual(Object.keys(t[l]).sort(), Object.keys(t.en).sort(), `${file} ${l}: only en's keys`);
    });
    const b = table(show(BEFORE, file), name);
    // picker-options' hk took www's wording later (the brief after 462, test/hk-picker-labels.test.mjs)
    Object.keys(b).filter((l) => !(name === 'PICKER_OPTION_LABELS' && l === 'hk'))
      .forEach((l) => assert.deepEqual(t[l], b[l], `${file} ${name} ${l} as before`));
  });
  // the scripts the texts are written in
  const SCRIPT = {
    el: /^[Ͱ-Ͽἀ-῿\s\d()/.,;!-]+$/, ja: /[぀-ヿ一-鿿]/, ko: /[가-힯]/,
  };
  Object.entries(TABLES).forEach(([file, name]) => {
    const t = table(show(null, file), name);
    Object.entries(SCRIPT).forEach(([l, re]) => Object.entries(t[l]).forEach(([k, v]) => assert.match(v, re, `${file} ${l} ${k}`)));
  });
  // "Remove" as www's destination finder writes it in these languages
  const filter = table(show(null, 'blocks/accordion-columns/accordion-columns.js'), 'FILTER_LABELS');
  assert.deepEqual(['it', 'el', 'ja', 'pl'].map((l) => filter[l].clear), ['Rimuovi', 'Αφαίρεση', '削除', 'Usuń']);
});

test('article dates in the five languages; the other languages as before', () => {
  assert.equal(formatArticleDate('2026-11-03', { lang: 'it', country: 'xx' }), '3 novembre 2026');
  assert.equal(formatArticleDate('2026-03-15', { lang: 'it', country: 'ch' }), '15 marzo 2026');
  assert.equal(formatArticleDate('2026-11-03', { lang: 'el', country: 'gr' }), '3 Νοεμβρίου 2026');
  assert.equal(formatArticleDate('2026-05-21', { lang: 'el', country: 'cy' }), '21 Μαΐου 2026');
  assert.equal(formatArticleDate('2026-11-03', { lang: 'ja', country: 'jp' }), '2026年11月3日');
  assert.equal(formatArticleDate('2026-11-03', { lang: 'ko', country: 'kr' }), '2026년 11월 3일');
  assert.equal(formatArticleDate('2026-11-03', { lang: 'pl', country: 'pl' }), '3 listopada 2026');
  assert.equal(formatArticleDate('2026-09-30', { lang: 'pl', country: 'xx' }), '30 września 2026');
  // as the browser's long dates in these languages
  [['it', '2026-07-19'], ['el', '2026-08-01'], ['pl', '2026-01-12']].forEach(([l, iso]) => {
    assert.equal(formatArticleDate(iso, { lang: l, country: 'xx' }), new Intl.DateTimeFormat(l, {
      day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
    }).format(new Date(`${iso}T00:00:00Z`)), l);
  });
  assert.equal(formatArticleDate('2026-11-03', { lang: 'zh', country: 'xx' }), '2026年11月3日');
  assert.equal(formatArticleDate('2026-11-03', { lang: 'hk', country: 'xx' }), '2026年11月3日');
  assert.equal(formatArticleDate('2026-11-03', { lang: 'ru', country: 'xx' }), '3 ноября 2026 г.');
  assert.equal(formatArticleDate('2026-11-03', { lang: 'pt', country: 'xx' }), '3 de novembro de 2026');
  assert.equal(formatArticleDate('2026-11-03', { lang: 'de', country: 'de' }), '3. November 2026');
  assert.equal(formatArticleDate('2026-11-03', { lang: 'en', country: 'de' }), '3. November 2026');
  assert.equal(formatArticleDate('2026-11-03', { lang: 'en', country: 'gb' }), 'November 3, 2026');
  assert.equal(formatArticleDate('2026-11-03', { lang: 'fr', country: 'xx' }), '3. November 2026');
  const months = table(show(null, 'scripts/articles.js'), 'MONTHS');
  const old = table(show(BEFORE, 'scripts/articles.js'), 'MONTHS');
  Object.keys(old).forEach((l) => assert.deepEqual(months[l], old[l], l));
});
