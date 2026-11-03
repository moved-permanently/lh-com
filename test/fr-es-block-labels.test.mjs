/* eslint-disable max-len, no-new-func */
/* French and Spanish built-in texts of the other blocks and scripts (brief 278, waves 11 and 12): the
   consent banner, the check-in hand-off errors, booking lookup and the other block tables with en
   and de entries have an fr and an es entry with every en key and the same {placeholders} (the
   branch words of a select or plural are no placeholders), and no French or Spanish text is the
   English one (names and words www keeps in English on its French and Spanish pages listed). en and
   de stay as they are. Not here: the tables only Air Dolomiti (it, en, de: accessibility.js,
   airdolomiti-status.js) and Cargo (en, de: notifications, header notifications, the tracking
   variant of booking lookup) show; neither has French or Spanish pages.
   Run: node --max-old-space-size=512 --test test/fr-es-block-labels.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { getLocale } from '../scripts/locale.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BEFORE = '931e6d0';
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
// the same in French or Spanish and English: names, signs, and what www keeps in English there
// (cabin and status names, the blog categories, OneTrust and www texts)
const SAME = new Set(['*', 'Navigation', 'Menu', 'Page {PAGE}', 'Lufthansa', 'Miles & More', 'Travel ID', 'Login', 'OK', 'E-mail', 'Newsletter',
  'Business Class', 'First Class', 'Economy Class', 'Premium Economy Class', 'Economy', 'Premium Economy', 'Business', 'First', 'Economy/Premium Economy Class',
  'Senator', 'HON Circle Member', 'Frequent Traveller', 'Star Alliance Gold', 'Explore Flying', 'Explore the World', 'Highlights',
  'Facebook', 'LinkedIn', 'Terminal', 'Minutes', 'min']);

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
const placeholders = (v) => [...String(v).matchAll(/(\S+\s)?\{([A-Za-z_]+)[},]/g)]
  .filter((m) => !/^(other|one|zero|two|few|many|=?-?\d+|true|false)\s$/.test(m[1] || ''))
  .map((m) => m[2]).sort();
const flat = (o, p = '') => Object.entries(o).flatMap(([k, v]) => (v && typeof v === 'object' ? flat(v, `${p}${k}.`) : [[`${p}${k}`, v]]));
const wording = (v) => String(v).replace(/\{[^{}]*\}/g, '').replace(/https?:\S+/g, '');
const tables = () => Object.entries(TABLES).flatMap(([file, names]) => {
  const src = fs.readFileSync(path.join(root, file), 'utf8');
  return names.map((name) => [file, name, table(src, name)]);
});

['fr', 'es'].forEach((lang) => {
  test(`the block and script tables: ${lang} with every en key and placeholder, no English text`, () => {
    tables().forEach(([file, name, t]) => {
      assert.ok(t[lang], `${file} ${name}: ${lang}`);
      const own = Object.fromEntries(flat(t[lang]));
      flat(t.en).forEach(([k, v]) => {
        assert.ok(k in own, `${file} ${name} ${lang}: ${k}`);
        assert.deepEqual(placeholders(own[k]), placeholders(v), `${file} ${name} ${lang}: ${k} placeholders`);
        if (typeof v === 'string' && /[a-z]{3}/i.test(wording(v)) && !SAME.has(v.trim())) assert.notEqual(own[k], v, `${file} ${name} ${lang}: ${k} is the English text`);
        if (typeof v === 'string') assert.ok(!/\r|\n|^\s|\s$/.test(own[k]), `${file} ${name} ${lang}: ${k} spacing`);
      });
    });
  });
});

test('French and Spanish pages pick those entries; the flight timetable has its two trip types', () => {
  [['/fr/fr/lounges', 'fr'], ['/be/fr/homepage', 'fr'], ['/xx/es/lounges', 'es'], ['/es/es/homepage', 'es']].forEach(([p, lang]) => {
    assert.equal(getLocale(p).lang, lang, p);
    tables().forEach(([file, name, t]) => assert.ok((t[lang] || t.en) === t[lang], `${p} ${file} ${name}`));
  });
  const { LABELS } = { LABELS: table(fs.readFileSync(path.join(root, 'blocks/flight-timetable/flight-timetable.js'), 'utf8'), 'LABELS') };
  ['fr', 'es'].forEach((lang) => assert.equal(LABELS[lang]['trip types'].split(', ').length, 2, lang));
});

test('the consent banner: French and Spanish links are www banner links of that language', () => {
  const { TEXTS } = { TEXTS: table(fs.readFileSync(path.join(root, 'scripts/consent-banner.js'), 'utf8'), 'TEXTS') };
  ['fr', 'es'].forEach((lang) => {
    assert.equal(TEXTS[lang].links.length, 3, lang);
    TEXTS[lang].links.forEach(([, href]) => assert.match(href, new RegExp(`^https://www\\.lufthansa\\.com/(xx|es)/${lang}/[a-z-]+\\?hidebanner=true$`), lang));
  });
});

test('en and de of the tables as before', () => {
  Object.entries(TABLES).forEach(([file, names]) => {
    const before = execFileSync('git', ['show', `${BEFORE}:${file}`], { cwd: root, encoding: 'utf8' });
    const now = fs.readFileSync(path.join(root, file), 'utf8');
    names.forEach((name) => ['en', 'de'].forEach((l) => assert.deepEqual(table(now, name)[l], table(before, name)[l], `${file} ${name} ${l}`)));
  });
});
