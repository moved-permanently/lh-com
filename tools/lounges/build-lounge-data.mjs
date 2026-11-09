#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * Writes data/lounges (scripts/lounge-data.js) from the capture child's lounge archives
 * (lh-lounges-api-NNN, unpacked): the finder's on-load answers and its searches, www's own JSON,
 * nothing changed. Brief 539.
 *
 *   node tools/lounges/build-lounge-data.mjs --onload <dir of lh-lounges-api-001> \
 *     --answers <dir> [--answers <dir> …] [--out data/lounges]
 *
 * --onload: <page>/requests.jsonl + <page>/responses/*.json per page (de-de, de-en, at-de,
 *   gb-en): catalogs/lounges/cities and labels/loungefinder/lh/<ll>, de from de-de, en from de-en.
 * --answers, any of three layouts (later ones win for the same status, city and language):
 *   - index.jsonl rows {status, code, file, lang?} with <file> beside it (lh-lounges-api-003; a row
 *     whose file isn't in that folder, another archive's, is skipped: -006 lists all 970 calls);
 *   - search/responses/<ll>-<STATUS>-<CITY>.json (lh-lounges-api-002; "-airport" ones skipped);
 *   - lounges.json {<STATUS>: {<CITY>: answer}} or {<ll>: {<STATUS>: {<CITY>: answer}}}.
 *   A row without a language is en (the recorder's default header).
 * Output: cities-<ll>.json, labels-<ll>.json, <ll>/<STATUS>/<CITY>.json for answers with lounges,
 * manifest.json {recordedAt, archives, lounges: {<ll>: {<STATUS>: {<CITY>: count}}}}. The folder is
 * replaced as a whole. A refresh: a new archive, this script, a commit.
 */
import fs from 'node:fs';
import path from 'node:path';

const argv = process.argv.slice(2);
const all = (name) => argv.flatMap((a, i) => (a === `--${name}` ? [argv[i + 1]] : []));
const [onload] = all('onload');
const answersDirs = all('answers');
const out = all('out')[0] || 'data/lounges';
if (!onload || !answersDirs.length) {
  console.error('usage: build-lounge-data.mjs --onload <dir> --answers <dir> [--answers <dir> …] [--out data/lounges]');
  process.exit(2);
}
const STATUSES = ['FIR', 'BUS', 'ECO', 'HON', 'SEN', 'FTL', 'STA'];
const readJson = (f) => JSON.parse(fs.readFileSync(f, 'utf8'));
const isAnswer = (a) => a && typeof a === 'object' && Array.isArray(a.lounges);

/** The on-load answer of a route in one page folder, or null. */
function onloadAnswer(page, test) {
  const dir = path.join(onload, page);
  const rows = fs.readFileSync(path.join(dir, 'requests.jsonl'), 'utf8').trim().split('\n').map((l) => JSON.parse(l));
  const row = rows.find((r) => r.status === 200 && test(new URL(r.url).pathname) && r.bodyFile);
  return row ? readJson(path.join(dir, row.bodyFile)) : null;
}

const answers = {}; // lang -> status -> city -> answer
const put = (lang, status, city, answer) => {
  const s = String(status).toUpperCase(); const c = String(city).toUpperCase();
  if (!STATUSES.includes(s) || !/^[A-Z0-9]{3}$/.test(c) || !isAnswer(answer)) return false;
  answers[lang] ||= {}; answers[lang][s] ||= {};
  answers[lang][s][c] = answer;
  return true;
};
const archives = [];
answersDirs.forEach((dir) => {
  let n = 0;
  const index = path.join(dir, 'index.jsonl');
  if (fs.existsSync(index)) {
    fs.readFileSync(index, 'utf8').trim().split('\n').filter(Boolean).forEach((l) => {
      const r = JSON.parse(l);
      if (r.http !== undefined && r.http !== 200) return;
      if (r.kind && r.kind !== 'city') return;
      const file = path.join(dir, r.file);
      if (!fs.existsSync(file)) return;
      if (put(r.lang || 'en', r.status, r.code, readJson(file))) n += 1;
    });
  }
  const search = path.join(dir, 'search', 'responses');
  if (fs.existsSync(search)) {
    fs.readdirSync(search).forEach((f) => {
      const m = f.match(/^([a-z]{2})-([A-Z]{3})-([A-Z0-9]{3})\.json$/);
      if (m && put(m[1], m[2], m[3], readJson(path.join(search, f)))) n += 1;
    });
  }
  const merged = path.join(dir, 'lounges.json');
  if (fs.existsSync(merged)) {
    const data = readJson(merged);
    const byLang = Object.keys(data).every((k) => /^[a-z]{2}$/.test(k)) ? data : { en: data };
    Object.entries(byLang).forEach(([lang, statuses]) => Object.entries(statuses).forEach(([s, cities]) => Object.entries(cities)
      .forEach(([c, a]) => { if (put(lang, s, c, a)) n += 1; })));
  }
  archives.push({ dir: path.basename(path.resolve(dir)), answers: n });
});

fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });
const write = (rel, data) => {
  const f = path.join(out, rel);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, `${JSON.stringify(data)}\n`);
};
const LANG_PAGES = { de: 'de-de', en: 'de-en' };
Object.entries(LANG_PAGES).forEach(([lang, page]) => {
  const cities = onloadAnswer(page, (p) => p === '/service/api/catalogs/lounges/cities');
  const labels = onloadAnswer(page, (p) => p === `/service/api/labels/loungefinder/lh/${lang}`);
  if (!cities || !labels) throw new Error(`${page}: cities or labels missing`);
  write(`cities-${lang}.json`, cities);
  write(`labels-${lang}.json`, labels);
});
const manifest = { recordedAt: new Date().toISOString().slice(0, 10), archives, lounges: {} };
let files = 0;
Object.entries(answers).forEach(([lang, statuses]) => Object.entries(statuses).forEach(([s, cities]) => Object.entries(cities).forEach(([c, a]) => {
  manifest.lounges[lang] ||= {}; manifest.lounges[lang][s] ||= {};
  manifest.lounges[lang][s][c] = a.lounges.length;
  if (a.lounges.length) { write(`${lang}/${s}/${c}.json`, a); files += 1; }
})));
write('manifest.json', manifest);
const counts = Object.entries(manifest.lounges).map(([l, ss]) => `${l}: ${Object.entries(ss).map(([s, cs]) => `${s} ${Object.keys(cs).length}`).join(', ')}`);
console.log(`${out}: ${files} answers with lounges; recorded ${counts.join(' | ')}`);
