/* eslint-disable max-len, no-new-func */
/* The built-in texts of the blocks and scripts in the other languages with live pages (brief 291:
   el, it, ja, ko, nl, pl, pt, ru, zh on the brand sites): every table of
   test/fr-es-block-labels.test.mjs has an entry for each with every en key and the same
   {placeholders} (the branch words of a select or plural are no placeholders), no text is the
   English one (names and words that are the same listed), no stray line breaks; zh is Simplified;
   the flight timetable has its two trip types; the consent banner's links are www's banner links.
   Every language a table had before (en, de, fr, es and the existing it entries) stays exactly as
   it was. Run: node --max-old-space-size=512 --test test/live-languages-block-labels.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BEFORE = '06bed0d';
const LANGS = ['el', 'it', 'ja', 'ko', 'nl', 'pl', 'pt', 'ru', 'zh'];
const TABLES = {
  'scripts/consent-banner.js': ['TEXTS'],
  'scripts/handoff.js': ['ERROR_TEXTS'],
  'blocks/article-header/article-header.js': ['DEFAULT_LABELS'],
  'blocks/blog-overview/blog-overview.js': ['DEFAULT_LABELS', 'CATEGORY_NAMES'],
  'blocks/booking-lookup/booking-lookup.js': ['MY_BOOKINGS_LABELS'],
  'blocks/car-rental/car-rental.js': ['DEFAULT_LABELS'],
  'blocks/carousel-lightbox/carousel-lightbox.js': ['DEFAULT_LABELS'],
  'blocks/checkin-deadlines/checkin-deadlines.js': ['DEFAULT_LABELS'],
  'blocks/destination-offer/destination-offer.js': ['DEFAULT_LABELS', 'CABIN_NAMES'],
  'blocks/flight-timetable/flight-timetable.js': ['LABELS'],
  'blocks/hero-card-overlay/hero-card-overlay.js': ['COUNTDOWN_LABELS'],
  'blocks/lounge-finder/lounge-finder.js': ['DEFAULT_LABELS'],
  'blocks/manage-booking/manage-booking.js': ['LABELS'],
  'blocks/poi-map/poi-map.js': ['DEFAULT_LABELS'],
  'blocks/security-waiting-time/security-waiting-time.js': ['DEFAULT_LABELS'],
};
// the same in English and the language: names, signs, cabin and status names, the blog categories,
// and words the languages share (Tags, Weekend, Check-in, Terminal, min)
const SAME = new Set(['*', 'Page {PAGE}', 'Lufthansa', 'Miles & More', 'Travel ID', 'OK',
  'Business Class', 'First Class', 'Economy', 'Premium Economy', 'Business', 'First', 'Economy/Premium Economy Class', 'First/Business Class',
  'Senator', 'HON Circle Member', 'Frequent Traveller', 'Star Alliance Gold', 'Explore Flying', 'Explore the World', 'Highlights',
  'Facebook', 'LinkedIn', 'Tags', 'Weekend', 'Check-in', 'Terminal', 'min']);
// Traditional-only characters (their Simplified forms are what the live zh pages use)
const TRADITIONAL = /[預訂館機場東們這個資訊與於為開關國後時間會員點電話網頁碼號選擇請輸載顯稱體驗實際經過還達線費優證護聯繫]/;

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
// {NAME} and {NAME, select ...}; a branch body after its selector ("1 {stop}", "other {stops}") is text
// (the word before a placeholder holds no brace, so a placeholder directly before a word is counted)
const placeholders = (v) => [...String(v).matchAll(/([^\s{}]+\s)?\{([A-Za-z_]+)[},]/g)]
  .filter((m) => !/^(other|one|zero|two|few|many|=?-?\d+|true|false)\s$/.test(m[1] || ''))
  .map((m) => m[2]).sort();
const flat = (o, p = '') => Object.entries(o).flatMap(([k, v]) => (v && typeof v === 'object' ? flat(v, `${p}${k}.`) : [[`${p}${k}`, v]]));
const wording = (v) => String(v).replace(/\{[^{}]*\}/g, '').replace(/https?:\S+/g, '');
const tables = () => Object.entries(TABLES).flatMap(([file, names]) => {
  const src = fs.readFileSync(path.join(root, file), 'utf8');
  return names.map((name) => [file, name, table(src, name)]);
});

LANGS.forEach((lang) => {
  test(`the block and script tables: ${lang} with every en key and placeholder, no English text`, () => {
    tables().forEach(([file, name, t]) => {
      assert.ok(t[lang], `${file} ${name}: ${lang}`);
      const own = Object.fromEntries(flat(t[lang]));
      flat(t.en).forEach(([k, v]) => {
        assert.ok(k in own, `${file} ${name} ${lang}: ${k}`);
        assert.deepEqual(placeholders(own[k]), placeholders(v), `${file} ${name} ${lang}: ${k} placeholders`);
        if (typeof v === 'string' && /[a-z]{3}/i.test(wording(v)) && !SAME.has(v.trim())) assert.notEqual(own[k], v, `${file} ${name} ${lang}: ${k} is the English text`);
        if (typeof v === 'string') assert.ok(!/\r|\n|^\s|\s$/.test(own[k]), `${file} ${name} ${lang}: ${k} spacing`);
        if (lang === 'zh' && typeof own[k] === 'string') assert.ok(!TRADITIONAL.test(own[k]), `${file} ${name} zh: ${k} Simplified`);
      });
    });
  });
});

test('the flight timetable has its two trip types; the consent banner links are www banner links', () => {
  const tt = table(fs.readFileSync(path.join(root, 'blocks/flight-timetable/flight-timetable.js'), 'utf8'), 'LABELS');
  const texts = table(fs.readFileSync(path.join(root, 'scripts/consent-banner.js'), 'utf8'), 'TEXTS');
  LANGS.forEach((lang) => {
    assert.equal(tt[lang]['trip types'].split(', ').length, 2, lang);
    assert.equal(texts[lang].links.length, 3, lang);
    texts[lang].links.forEach(([label, href]) => {
      assert.ok(label.trim(), lang);
      assert.match(href, /^https:\/\/www\.lufthansa\.com\/[a-z]{2}\/[a-z]{2}\/(data-protection-information|cookie-policy|imprint)\?hidebanner=true$/, lang);
    });
  });
});

test('every language a table had before stays as it was (en, de, fr, es and the existing it)', () => {
  Object.entries(TABLES).forEach(([file, names]) => {
    const before = execFileSync('git', ['show', `${BEFORE}:${file}`], { cwd: root, encoding: 'utf8' });
    const now = fs.readFileSync(path.join(root, file), 'utf8');
    names.forEach((name) => {
      const b = table(before, name);
      const n = table(now, name);
      Object.keys(b).forEach((l) => assert.deepEqual(n[l], b[l], `${file} ${name} ${l}`));
    });
  });
});
