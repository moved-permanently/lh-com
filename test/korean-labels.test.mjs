/* eslint-disable max-len, no-new-func */
/* Korean on SWISS's Korean root kr/ko (scripts/brands.js SWISS_OWN_ROOTS): every built-in label
   table the site's blocks bring in the languages of the built-in labels (en de it fr es nl pt el ja
   ru zh pl) has a Korean entry with every en key and the same {placeholders}, no English text; www's
   own Korean wording where www has it (the capture of 2026-11-03, swiss-snapshots-028 and -029: the
   flight search, the language selector, the carousels, the flash teaser, the "opens in a new tab"
   note); a kr/ko page (a pilot while its switch is off) resolves them.
   Run: node --max-old-space-size=512 --test test/korean-labels.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseHTML } from 'linkedom';
import { resolveLabels } from '../scripts/block-config.js';
import { getLocale } from '../scripts/locale.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TABLES = {
  'blocks/header/header.js': ['LABELS'],
  'blocks/footer/footer.js': ['LABELS'],
  'blocks/booking-lookup/booking-lookup.js': ['DEFAULT_LABELS'],
  'blocks/carousel-cards/carousel-cards.js': ['DEFAULT_LABELS'],
  'blocks/columns-media/columns-media.js': ['DEFAULT_LABELS'],
  'blocks/carousel-images/carousel-images.js': ['DEFAULT_LABELS'],
  'blocks/flight-search/flight-search.js': ['DEFAULT_LABELS'],
  'blocks/price-bar/price-bar.js': ['DEFAULT_LABELS'],
  'blocks/hero-campaign/hero-campaign.js': ['DEFAULT_LABELS'],
  'blocks/destination-finder/destination-finder.js': ['DEFAULT_LABELS'],
  'blocks/flash-teaser/flash-teaser.js': ['LABELS'],
  'blocks/fare-teaser/fare-teaser.js': ['DEFAULT_LABELS'],
  'blocks/flight-status/flight-status.js': ['DEFAULT_LABELS'],
  'scripts/media.js': ['LABELS'],
  'scripts/not-found.js': ['TEXT'],
  // the form block (18 of kr/ko's pages have forms; its table has en, de, fr, es)
  'blocks/form/form.js': ['DEFAULT_LABELS'],
};
// the same in Korean and English (a sign, a name, an empty text)
const SAME = new Set(['', '-', '*', '{n}/{total}']);

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
const hangul = (v) => /[가-힯]/.test(String(v));

test('the built-in label tables: Korean with every en key and placeholder, in Korean', () => {
  Object.entries(TABLES).forEach(([file, names]) => {
    const src = fs.readFileSync(path.join(root, file), 'utf8');
    names.forEach((name) => {
      const t = table(src, name);
      assert.ok(t.ko, `${file} ${name}: ko`);
      const ko = Object.fromEntries(flat(t.ko));
      flat(t.en).forEach(([k, v]) => {
        assert.ok(k in ko, `${file} ${name} ko: ${k}`);
        assert.deepEqual(placeholders(ko[k]), placeholders(v), `${file} ${name} ko: ${k} placeholders`);
        const text = String(ko[k]);
        if (!SAME.has(text) && !/^[a-z-]+$/.test(text)) assert.ok(hangul(text) || /^[A-Z][A-Za-z]+ /.test(text), `${file} ${name} ko: ${k} not Korean: ${text}`);
      });
    });
  });
});

test('www\'s own Korean wording where www has it', () => {
  const t = (file, name) => table(fs.readFileSync(path.join(root, file), 'utf8'), name).ko;
  assert.equal(t('blocks/flight-search/flight-search.js', 'DEFAULT_LABELS')['submit label'], '항공편 검색');
  assert.equal(t('blocks/flight-search/flight-search.js', 'DEFAULT_LABELS')['date label'], '출발 - 귀국');
  assert.equal(t('blocks/header/header.js', 'LABELS').localeTitle, '위치/언어');
  assert.equal(t('blocks/header/header.js', 'LABELS').newTab, '링크가 새 브라우저 탭에서 열립니다');
  assert.equal(t('blocks/flash-teaser/flash-teaser.js', 'LABELS').title, '최신 여행 정보, 알림 및 프로모션');
  assert.equal(t('blocks/carousel-images/carousel-images.js', 'DEFAULT_LABELS')['next label'], '다음 슬라이드');
});

test('a kr/ko page (a pilot while its switch is off) has the language ko and resolves Korean labels', () => {
  const { document } = parseHTML('<!DOCTYPE html><html><head><meta name="brand" content="swiss"></head><body></body></html>');
  const saved = globalThis.document;
  globalThis.document = document;
  try {
    const { lang } = getLocale('/kr/ko/fly/check-in');
    assert.equal(lang, 'ko');
    const src = fs.readFileSync(path.join(root, 'blocks/flight-search/flight-search.js'), 'utf8');
    assert.equal(resolveLabels(table(src, 'DEFAULT_LABELS'), {}, lang)['from label'], '출발');
  } finally {
    globalThis.document = saved;
  }
});
