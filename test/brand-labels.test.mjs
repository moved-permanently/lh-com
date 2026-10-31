/* eslint-disable max-len, no-new-func */
/* The built-in labels in the brand sites' languages (it, fr, es, nl, pt, el, ja: ITA's roots,
   Discover's xx/fr; the tenants' label bundles have no answer on the replica): every label table
   a visitor of a brand homepage, offers page or flight status meets has them, with every key of
   its en entry and the same {placeholders}; en and de exactly as before. The finder's airline
   filter names the brand ("Solo ITA Airways"), lh-com's "Lufthansa only" stays.
   Run: node --max-old-space-size=512 --test test/brand-labels.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const LANGS = ['it', 'fr', 'es', 'nl', 'pt', 'el', 'ja', 'ru', 'zh', 'pl'];
// file -> the label tables (their const names) and the en keys a language may leave out
const TABLES = {
  'blocks/flight-search/flight-search.js': ['DEFAULT_LABELS'],
  'blocks/header/header.js': ['LABELS'],
  'blocks/footer/footer.js': ['LABELS'],
  'blocks/flash-teaser/flash-teaser.js': ['LABELS'],
  'blocks/carousel-cards/carousel-cards.js': ['DEFAULT_LABELS'],
  'blocks/carousel-images/carousel-images.js': ['DEFAULT_LABELS'],
  'blocks/hero-campaign/hero-campaign.js': ['DEFAULT_LABELS'],
  'scripts/media.js': ['LABELS'],
  'blocks/columns-media/columns-media.js': ['DEFAULT_LABELS'],
  'blocks/fare-teaser/fare-teaser.js': ['DEFAULT_LABELS'],
  'blocks/price-bar/price-bar.js': ['DEFAULT_LABELS'],
  'blocks/flight-status/flight-status.js': ['DEFAULT_LABELS'],
  'blocks/destination-finder/destination-finder.js': ['DEFAULT_LABELS', 'GRID_DEFAULT_LABELS'],
  'scripts/not-found.js': ['TEXT'],
  'blocks/booking-lookup/booking-lookup.js': ['DEFAULT_LABELS'],
};
const OPTIONAL = ['intro', 'search', 'searchButton'];

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
const previous = (file) => execFileSync('git', ['show', `b62c01c:${file}`], { cwd: root, encoding: 'utf8' });

test('every table has the brand languages, every en key, the same placeholders', () => {
  Object.entries(TABLES).forEach(([file, names]) => {
    const src = fs.readFileSync(path.join(root, file), 'utf8');
    names.forEach((name) => {
      const t = table(src, name);
      LANGS.forEach((l) => {
        assert.ok(t[l], `${file} ${name} ${l}`);
        Object.entries(t.en).forEach(([k, v]) => {
          if (OPTIONAL.includes(k) && !(k in t[l])) return;
          assert.ok(k in t[l], `${file} ${name} ${l}: ${k}`);
          if (typeof v === 'string' && v) assert.ok(String(t[l][k]).trim(), `${file} ${name} ${l}: ${k} empty`);
          assert.deepEqual(placeholders(t[l][k]), placeholders(v), `${file} ${name} ${l}: ${k} placeholders`);
        });
        assert.deepEqual(Object.keys(t[l]).filter((k) => !(k in t.en)), [], `${file} ${name} ${l}: keys en lacks`);
      });
    });
  });
});

test('en and de exactly as before', () => {
  Object.entries(TABLES).forEach(([file, names]) => {
    const now = fs.readFileSync(path.join(root, file), 'utf8');
    const before = previous(file);
    names.forEach((name) => {
      ['en', 'de'].forEach((l) => assert.deepEqual(table(now, name)[l], table(before, name)[l], `${file} ${name} ${l}`));
    });
  });
});

test('the 404 links keep www\'s slugs in every language', () => {
  const t = table(fs.readFileSync(path.join(root, 'scripts/not-found.js'), 'utf8'), 'TEXT');
  LANGS.forEach((l) => assert.deepEqual(t[l].links.map(([, slug]) => slug), t.en.links.map(([, slug]) => slug), l));
});

test('the finder\'s airline filter names the brand on its pages', () => {
  const src = fs.readFileSync(path.join(root, 'blocks/destination-finder/destination-finder.js'), 'utf8');
  assert.match(src, /labels\['tenant only label'\] = labels\['tenant only label'\]\.replace\('Lufthansa', brand\.name\);/);
});
