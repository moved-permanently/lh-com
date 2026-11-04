/* eslint-disable max-len, no-new-func, import/no-extraneous-dependencies, import/extensions -- dev tooling; js-yaml is a dev dependency */
/* Simplified Chinese (zh) for lufthansa.com, its shared parts (brief 316; tools/reports/markets/zh.md):
   the locale rows (xx/zh the language version with its own documents; cn/zh, hk/zh, tw/zh its
   market roots; www's labels, the English country names www gives in German; the currencies the
   homepages' fare widgets show, cn/zh CNY, hk/zh HKD, tw/zh TWD, xx/zh's none; all pilot, batch 16;
   the switch and the live roots as before), hreflang as www's sitemaps give it per root (xx/zh zh,
   cn/zh zh-CN, hk/zh zh-HK, tw/zh zh-TW; no other row changes), the page's <html lang> zh (no new
   mapping), xx/zh's query indexes after xx/hk's, and the Simplified Chinese of the remaining
   built-in texts (form, the flight search's picker options, the article dates, the timetable's
   weekdays, the accordion filter), every other language as before.
   Run: node --max-old-space-size=512 --test test/simplified-chinese.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import yaml from 'js-yaml';
import { LANGUAGE_VERSIONS } from '../scripts/locale-table.js';
import {
  getLocale, LIVE_ROOTS, LOCALE_TABLE, HTML_LANGS, htmlLangOf, pathLanguageOf,
} from '../scripts/locale.js';
import { formatArticleDate } from '../scripts/articles.js';

const BEFORE = '27a3318';

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
// characters only Traditional Chinese writes (their Simplified forms differ)
const TRADITIONAL = /[們這個選擇檔頁輸請關時間話語認證帳號碼錯誤載傳刪發開處無務換題類級飛機積饋僅為與總訂體轉彈較艙數價優預覽謝欄資]/;

test('the rows: xx/zh the language version (own documents), cn/zh, hk/zh, tw/zh its market roots; all pilot, batch 16, the homepages\' currencies', () => {
  const data = JSON.parse(fs.readFileSync('tools/markets/locale-data.json', 'utf8'));
  assert.equal(LANGUAGE_VERSIONS.zh, 'xx/zh');
  assert.equal(data.languageVersions.zh, 'xx/zh');
  assert.deepEqual(data.liveWaves, JSON.parse(show(BEFORE, 'tools/markets/locale-data.json')).liveWaves, 'the switch as before');
  assert.deepEqual(LIVE_ROOTS, ['de/en', 'de/de', 'at/de', 'gb/en']);
  const zh = Object.entries(LOCALE_TABLE).filter(([, r]) => r.lang === 'zh').map(([k]) => k).sort();
  assert.deepEqual(zh, ['cn/zh', 'hk/zh', 'tw/zh', 'xx/zh']);
  const expect = {
    'xx/zh': ['其它国家 (Other countries) | 简体中文', { en: null, de: null, zh: '其它国家 (Other countries)' }, 'FRA', null, 'own'],
    'cn/zh': ['中国内地 (China Mainland) | 简体中文', { en: 'China (Mainland)', de: 'China (Mainland)', zh: '中国内地 (China Mainland)' }, 'SHA', 'CNY', 'language'],
    'hk/zh': ['中国香港 (Hong Kong, China) | 简体中文', { en: 'Hong Kong, China', de: 'Hong Kong, China', zh: '中国香港 (Hong Kong, China)' }, 'HKG', 'HKD', 'language'],
    'tw/zh': ['中国台湾 (Taiwan, China) | 简体中文', { en: 'Taiwan, China', de: 'Taiwan, China', zh: '中国台湾 (Taiwan, China)' }, 'TPE', 'TWD', 'language'],
  };
  Object.entries(expect).forEach(([k, [name, countryName, airport, currency, documents]]) => {
    const r = data.roots[k];
    assert.deepEqual([r.name, r.countryName, r.homeAirport, r.currency, r.documents, r.status, r.batch], [name, countryName, airport, currency, documents, 'pilot', 16], k);
    assert.equal(r.unverified.includes('currency'), currency === null, `${k}: the currency unverified only where www shows none`);
    assert.equal(LOCALE_TABLE[k].status, 'pilot', k);
  });
  assert.equal(getLocale('/xx/zh/homepage').key, 'xx/zh');
  ['cn/zh', 'hk/zh', 'tw/zh'].forEach((k) => assert.equal(getLocale(`/${k}/baggage`).versionBase, '/xx/zh', k));
  // every row that was there stays as it was
  const before = JSON.parse(show(BEFORE, 'tools/markets/locale-data.json'));
  Object.entries(before.roots).forEach(([k, r]) => assert.deepEqual(data.roots[k], r, k));
  Object.entries(before.languageVersions).forEach(([l, v]) => assert.equal(data.languageVersions[l], v, l));
});

test('hreflang as www\'s sitemaps give it per root; every other row of the table as before; <html lang> zh, no new mapping', () => {
  assert.deepEqual(['xx/zh', 'cn/zh', 'hk/zh', 'tw/zh'].map((k) => LOCALE_TABLE[k].hreflang), ['zh', 'zh-CN', 'zh-HK', 'zh-TW']);
  const old = table(show(BEFORE, 'scripts/locale-table.js'), 'LOCALE_TABLE');
  Object.entries(old).forEach(([k, r]) => assert.deepEqual(LOCALE_TABLE[k], r, k));
  assert.deepEqual(HTML_LANGS, { hk: 'zh-HK' });
  assert.equal(htmlLangOf('zh'), 'zh');
  assert.equal(pathLanguageOf('zh'), 'zh');
});

test('xx/zh\'s query indexes: search-xx-zh as xx/es\'s, its lean copies after xx/hk\'s; no other index changed', () => {
  const { indices } = yaml.load(fs.readFileSync('helix-query.yaml', 'utf8'));
  const { indices: old } = yaml.load(show(BEFORE, 'helix-query.yaml'));
  const zh = indices['search-xx-zh'];
  assert.ok(zh, 'search-xx-zh');
  assert.deepEqual(zh, JSON.parse(JSON.stringify(indices['search-xx-es']).replace(/xx\/es/g, 'xx/zh')));
  assert.equal(zh.target, '/xx/zh/search-index.json');
  assert.equal(indices['market-model-xx-zh'].target, '/market-model/xx-zh.json');
  assert.ok(indices['market-llms-xx-zh']);
  // message-center's weight (TAP's order, brief 326) came later; everything else as before
  // and the card-image rule keeping Edge Delivery's ./media_ address (brief 338)
  const CARD = 'match(attribute(el, "content"), "^(?:https:\\/\\/[^/]+)?((?:[.])?/.*)$")';
  const CARD_BEFORE = 'match(attribute(el, "content"), "https:\\/\\/[^/]+(/.*)")';
  const cardAsBefore = (d) => (d && d.properties ? {
    ...d,
    properties: Object.fromEntries(Object.entries(d.properties).map(([k, p]) => [k, p && p.value === CARD ? { ...p, value: CARD_BEFORE } : p])),
  } : d);
  const later = (name, d) => cardAsBefore(name === 'message-center' && d ? {
    ...d, properties: Object.fromEntries(Object.entries(d.properties).filter(([k]) => k !== 'weight')),
  } : d);
  Object.entries(old).forEach(([name, def]) => assert.deepEqual(later(name, indices[name]), def, `${name} as before`));
  const keys = Object.keys(indices);
  const at = keys.indexOf('market-llms-xx-hk');
  assert.deepEqual(keys.slice(at + 1, at + 4), ['search-xx-zh', 'market-model-xx-zh', 'market-llms-xx-zh'], 'after xx/hk\'s');
  assert.deepEqual(keys.slice(-2), ['search-medicalservices-en', 'search-medicalservices-de'], 'SWISS\'s pair still last');
});

const ZH_TABLES = {
  'blocks/form/form.js': 'DEFAULT_LABELS',
  'blocks/flight-search/picker-options.js': 'PICKER_OPTION_LABELS',
  'blocks/accordion-columns/accordion-columns.js': 'FILTER_LABELS',
};
const SAME = new Set(['*']);

test('the built-in texts in Simplified Chinese: form, picker options, accordion filter (every en key, the same placeholders, no English, no Traditional characters)', () => {
  const ph = (v) => (String(v).match(/\{[A-Z_]+\}/g) || []).sort();
  Object.entries(ZH_TABLES).forEach(([file, name]) => {
    const t = table(show(null, file), name);
    assert.ok(t.zh, `${file} ${name}: zh`);
    Object.entries(t.en).forEach(([k, v]) => {
      assert.ok(typeof t.zh[k] === 'string' && t.zh[k].trim(), `${file} ${k}`);
      assert.deepEqual(ph(t.zh[k]), ph(v), `${file} ${k} placeholders`);
      if (/[a-z]{3}/i.test(v) && !SAME.has(v)) assert.notEqual(t.zh[k], v, `${file} ${k} is the English text`);
      assert.doesNotMatch(t.zh[k], TRADITIONAL, `${file} ${k}: Traditional`);
    });
    const b = table(show(BEFORE, file), name);
    Object.keys(b).forEach((l) => assert.deepEqual(t[l], b[l], `${file} ${name} ${l} as before`));
  });
  // www's xx/zh feedback form (preview document): its own wording
  const form = table(show(null, 'blocks/form/form.js'), 'DEFAULT_LABELS').zh;
  assert.equal(form['submit label'], '提交');
  assert.equal(form['file prompt'], '请将您的文件拖放到这里');
  assert.equal(form['file select'], '选择文件');
});

test('article dates in Simplified Chinese ("2026年11月3日"); the other languages as before', () => {
  assert.equal(formatArticleDate('2026-11-03', { lang: 'zh', country: 'xx' }), '2026年11月3日');
  assert.equal(formatArticleDate('2026-03-15', { lang: 'zh', country: 'cn' }), '2026年3月15日');
  assert.equal(formatArticleDate('2026-11-03', { lang: 'hk', country: 'xx' }), '2026年11月3日');
  assert.equal(formatArticleDate('2026-11-03', { lang: 'ru', country: 'xx' }), '3 ноября 2026 г.');
  assert.equal(formatArticleDate('2026-11-03', { lang: 'pt', country: 'xx' }), '3 de novembro de 2026');
  assert.equal(formatArticleDate('2026-11-03', { lang: 'de', country: 'de' }), '3. November 2026');
  assert.equal(formatArticleDate('2026-11-03', { lang: 'en', country: 'gb' }), 'November 3, 2026');
  const months = table(show(null, 'scripts/articles.js'), 'MONTHS');
  const old = table(show(BEFORE, 'scripts/articles.js'), 'MONTHS');
  Object.keys(old).forEach((l) => assert.deepEqual(months[l], old[l], l));
});

test('the flight timetable\'s weekdays in Simplified Chinese', () => {
  const w = table(show(null, 'blocks/flight-timetable/flight-timetable.js'), 'WEEKDAYS');
  assert.deepEqual(w.zh, ['一', '二', '三', '四', '五', '六', '日']);
  const old = table(show(BEFORE, 'blocks/flight-timetable/flight-timetable.js'), 'WEEKDAYS');
  Object.keys(old).forEach((l) => assert.deepEqual(w[l], old[l], l));
});
