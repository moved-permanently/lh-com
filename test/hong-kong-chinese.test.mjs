/* eslint-disable max-len, no-new-func, import/no-extraneous-dependencies, import/extensions -- dev tooling; js-yaml is a dev dependency */
/* Traditional Chinese (hk) for lufthansa.com, its shared parts (brief 314; tools/reports/markets/hk.md):
   the locale rows (xx/hk the language version with its own documents; cn/hk, hk/hk, tw/hk its
   market roots; www's labels, the English country names www gives in German and Chinese too; no
   currency, www's homepages show none; all pilot, batch 15; the switch and the live roots as
   before), hreflang as www's sitemaps give it per root (xx/hk zh, hk/hk zh-HK, cn/hk zh-CN, tw/hk
   zh-TW: the table builder falls back to www's own value for an xx root, no other row changes),
   the page's <html lang> zh-HK (the path language hk is no language tag; www's own en-US is wrong),
   read back as hk by the accordion filter and the cookie banner; xx/hk's query indexes after
   xx/ru's; and the Traditional Chinese of the built-in texts (form, the flight search's picker
   options, the article dates, the timetable's weekdays, the accordion filter), every other language
   as before. Run: node --max-old-space-size=512 --test test/hong-kong-chinese.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import yaml from 'js-yaml';
import { LANGUAGE_VERSIONS } from '../scripts/locale-table.js';
import {
  getLocale, liveOwnRoots, LOCALE_TABLE, HTML_LANGS, htmlLangOf, pathLanguageOf,
} from '../scripts/locale.js';
import { formatArticleDate } from '../scripts/articles.js';
import { buildTable } from '../tools/markets/build-locale-table.mjs';
import { withoutSwissContentCap } from './query-later.mjs';

const BEFORE = '68b81ff';

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
// characters only Simplified Chinese writes (their Traditional forms differ)
const SIMPLIFIED = /[们这个选择档页输请关时间话语认证账号码错误载传删发开处无务换题类级飞机积馈仅为与总订]/;

test('the rows: xx/hk the language version (own documents), cn/hk, hk/hk, tw/hk its market roots; all pilot, batch 15, no currency', () => {
  const data = JSON.parse(fs.readFileSync('tools/markets/locale-data.json', 'utf8'));
  assert.equal(LANGUAGE_VERSIONS.hk, 'xx/hk');
  assert.equal(data.languageVersions.hk, 'xx/hk');
  assert.deepEqual(liveOwnRoots(PINNED), ['de/en', 'de/de', 'at/de', 'gb/en']);
  const hk = Object.entries(LOCALE_TABLE).filter(([, r]) => r.lang === 'hk').map(([k]) => k).sort();
  assert.deepEqual(hk, ['cn/hk', 'hk/hk', 'tw/hk', 'xx/hk']);
  const expect = {
    'xx/hk': ['其他国家 | 繁體中文', { en: null, de: null, hk: '其他国家' }, 'FRA', 'own'],
    'cn/hk': ['China (Mainland) | 繁體中文', { en: 'China (Mainland)', de: 'China (Mainland)', hk: 'China (Mainland)' }, 'SHA', 'language'],
    'hk/hk': ['Hong Kong, China | 繁體中文', { en: 'Hong Kong, China', de: 'Hong Kong, China', hk: 'Hong Kong, China' }, 'HKG', 'language'],
    'tw/hk': ['Taiwan, China | 繁體中文', { en: 'Taiwan, China', de: 'Taiwan, China', hk: 'Taiwan, China' }, 'TPE', 'language'],
  };
  Object.entries(expect).forEach(([k, [name, countryName, airport, documents]]) => {
    const r = data.roots[k];
    assert.deepEqual([r.name, r.countryName, r.homeAirport, r.currency, r.documents, r.status, r.batch], [name, countryName, airport, null, documents, 'pilot', 15], k);
    assert.ok(r.unverified.includes('currency'), `${k}: the currency unverified (www shows none)`);
    assert.equal(PINNED[k].status, 'pilot', k);
  });
  assert.equal(getLocale('/xx/hk/homepage').key, 'xx/hk');
  ['cn/hk', 'hk/hk', 'tw/hk'].forEach((k) => assert.equal(getLocale(`/${k}/baggage`).versionBase, '/xx/hk', k));
  // every row that was there stays as it was
  const before = JSON.parse(show(BEFORE, 'tools/markets/locale-data.json'));
  Object.entries(before.roots).forEach(([k, r]) => assert.deepEqual(data.roots[k], r, k));
  Object.entries(before.languageVersions).forEach(([l, v]) => assert.equal(data.languageVersions[l], v, l));
});

test('hreflang as www\'s sitemaps give it per root; every other row of the table as before', () => {
  assert.deepEqual(['xx/hk', 'hk/hk', 'cn/hk', 'tw/hk'].map((k) => LOCALE_TABLE[k].hreflang), ['zh', 'zh-HK', 'zh-CN', 'zh-TW']);
  const old = table(show(BEFORE, 'scripts/locale-table.js'), 'LOCALE_TABLE');
  Object.entries(old).forEach(([k, r]) => assert.deepEqual(PINNED[k], r, k));
  // the builder: an xx root takes www's own hreflang (zh), its language only when www gives none
  const roots = [{ root: 'de/de', hreflang: ['de-DE'], ownSitemap: true }, { root: 'xx/hk', hreflang: ['zh'], ownSitemap: false }, { root: 'xx/fr', hreflang: [], ownSitemap: false }];
  const row = { status: 'live', documents: 'own' };
  const built = buildTable(roots, {
    roots: { 'de/de': row, 'xx/hk': { ...row, status: 'pilot' }, 'xx/fr': { ...row, status: 'pilot' } }, languageVersions: { de: 'de/de', hk: 'xx/hk', fr: 'xx/fr' }, defaultLocale: 'de/de', fallbackLanguageVersion: 'de/de',
  });
  assert.deepEqual(['de/de', 'xx/hk', 'xx/fr'].map((k) => built.rows[k].hreflang), ['de-DE', 'zh', 'fr']);
});

test('the page\'s <html lang>: zh-HK for hk (no language tag), every other language its own code; read back as hk', () => {
  assert.deepEqual(HTML_LANGS, { hk: 'zh-HK' });
  assert.equal(htmlLangOf('hk'), 'zh-HK');
  ['de', 'en', 'fr', 'zh', 'ru', 'pt', 'it'].forEach((l) => assert.equal(htmlLangOf(l), l, l));
  assert.equal(pathLanguageOf('zh-HK'), 'hk');
  assert.equal(pathLanguageOf('zh-hk'), 'hk');
  assert.equal(pathLanguageOf('de'), 'de');
  assert.equal(pathLanguageOf('en-US'), 'en');
  assert.equal(pathLanguageOf('zh'), 'zh');
  assert.equal(pathLanguageOf(''), 'en');
  // since brief 353 a TAP market root's language and market first (test/tap-html-lang.test.mjs)
  assert.match(show(null, 'scripts/scripts.js'), /document\.documentElement\.lang = (?:htmlLangOfRoot\(window\.location\.pathname, locale\.siteLanguages\)\s*\|\| )?getMetadata\('language'\) \|\| htmlLangOf\(locale\.lang\);/);
  assert.match(show(null, 'blocks/accordion-columns/accordion-columns.js'), /const lang = pathLanguageOf\(document\.documentElement\.lang\);/);
  assert.match(show(null, 'scripts/consent-banner.js'), /const lang = pathLanguageOf\(document\.documentElement\.lang\);/);
});

test('xx/hk\'s query indexes: search-xx-hk as xx/es\'s, its lean copies after xx/ru\'s; no other index changed', () => {
  // SWISS's ch/el and ch/ru content cap (standing order 11) read as before (test/query-later.mjs)
  const indices = withoutSwissContentCap(yaml.load(fs.readFileSync('helix-query.yaml', 'utf8')).indices);
  const { indices: old } = yaml.load(show(BEFORE, 'helix-query.yaml'));
  const hk = indices['search-xx-hk'];
  assert.ok(hk, 'search-xx-hk');
  assert.deepEqual(hk, JSON.parse(JSON.stringify(indices['search-xx-es']).replace(/xx\/es/g, 'xx/hk')));
  assert.equal(hk.target, '/xx/hk/search-index.json');
  assert.equal(indices['market-model-xx-hk'].target, '/market-model/xx-hk.json');
  assert.ok(indices['market-llms-xx-hk']);
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
  const keys = Object.keys(indices);
  const at = keys.indexOf('market-llms-xx-ru');
  assert.deepEqual(keys.slice(at + 1, at + 4), ['search-xx-hk', 'market-model-xx-hk', 'market-llms-xx-hk'], 'after xx/ru\'s');
  assert.deepEqual(keys.slice(-2), ['search-medicalservices-en', 'search-medicalservices-de'], 'SWISS\'s pair still last');
});

const HK_TABLES = {
  'blocks/form/form.js': 'DEFAULT_LABELS',
  'blocks/flight-search/picker-options.js': 'PICKER_OPTION_LABELS',
  'blocks/accordion-columns/accordion-columns.js': 'FILTER_LABELS',
};
const SAME = new Set(['*']);

test('the built-in texts in Traditional Chinese: form, picker options, accordion filter (every en key, the same placeholders, no English, no Simplified characters)', () => {
  const ph = (v) => (String(v).match(/\{[A-Z_]+\}/g) || []).sort();
  Object.entries(HK_TABLES).forEach(([file, name]) => {
    const t = table(show(null, file), name);
    assert.ok(t.hk, `${file} ${name}: hk`);
    Object.entries(t.en).forEach(([k, v]) => {
      assert.ok(typeof t.hk[k] === 'string' && t.hk[k].trim(), `${file} ${k}`);
      assert.deepEqual(ph(t.hk[k]), ph(v), `${file} ${k} placeholders`);
      if (/[a-z]{3}/i.test(v) && !SAME.has(v)) assert.notEqual(t.hk[k], v, `${file} ${k} is the English text`);
      assert.doesNotMatch(t.hk[k], SIMPLIFIED, `${file} ${k}: Simplified`);
    });
    const b = table(show(BEFORE, file), name);
    Object.keys(b).forEach((l) => assert.deepEqual(t[l], b[l], `${file} ${name} ${l} as before`));
  });
  // www's xx/hk feedback form (preview document): its own wording
  const form = table(show(null, 'blocks/form/form.js'), 'DEFAULT_LABELS').hk;
  assert.equal(form['submit label'], '提交');
  assert.equal(form['file prompt'], '請將檔案拖放到此處');
  assert.equal(form['file select'], '選擇檔案');
});

test('article dates in Traditional Chinese ("2026年11月3日"); the other languages as before', () => {
  assert.equal(formatArticleDate('2026-11-03', { lang: 'hk', country: 'xx' }), '2026年11月3日');
  assert.equal(formatArticleDate('2026-03-15', { lang: 'hk', country: 'hk' }), '2026年3月15日');
  assert.equal(formatArticleDate('2026-11-03', { lang: 'ru', country: 'xx' }), '3 ноября 2026 г.');
  assert.equal(formatArticleDate('2026-11-03', { lang: 'pt', country: 'xx' }), '3 de novembro de 2026');
  assert.equal(formatArticleDate('2026-11-03', { lang: 'de', country: 'de' }), '3. November 2026');
  assert.equal(formatArticleDate('2026-11-03', { lang: 'en', country: 'gb' }), 'November 3, 2026');
  const months = table(show(null, 'scripts/articles.js'), 'MONTHS');
  const old = table(show(BEFORE, 'scripts/articles.js'), 'MONTHS');
  Object.keys(old).forEach((l) => assert.deepEqual(months[l], old[l], l));
});

test('the flight timetable\'s weekdays in Traditional Chinese', () => {
  const w = table(show(null, 'blocks/flight-timetable/flight-timetable.js'), 'WEEKDAYS');
  assert.deepEqual(w.hk, ['一', '二', '三', '四', '五', '六', '日']);
  const old = table(show(BEFORE, 'blocks/flight-timetable/flight-timetable.js'), 'WEEKDAYS');
  Object.keys(old).forEach((l) => assert.deepEqual(w[l], old[l], l));
});
