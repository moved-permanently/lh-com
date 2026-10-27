/* eslint-disable no-console, max-len */
/**
 * Writes tools/importer/tag-priority-sheet.json, the sheet /articles/config/tag-priority that
 * related-articles reads (columns locale, priority-1, priority-2: comma lists of tag ids). www's
 * own priorities are not public; the tag overview page of each locale (/<cc>/<ll>/articles/tags)
 * splits the tags into "Destinations" and "Further Topics": destinations are priority 1, the
 * topics (interests and the series tags such as be-picky or perfect-day) priority 2.
 * Not written to DA by this script.
 *
 * Usage: node tools/importer/build-tag-priority.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { LIVE_ROOTS } from '../../scripts/locale.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const LOCALES = LIVE_ROOTS;
const OUT = path.join(root, 'tools/importer/tag-priority-sheet.json');

const tagsIn = (html) => [...new Set([...html.matchAll(/\/articles\/tags\/([a-z0-9-]+)"/g)].map((m) => `articles:${m[1]}`))];

const data = LOCALES.map((locale) => {
  const file = path.join(root, 'content', locale, 'articles/tags.plain.html');
  const html = fs.readFileSync(file, 'utf8');
  // the section headings: <h3 ...>Destinations {heading-small}</h3>, <h3 ...>Further Topics ...</h3>
  const heads = [...html.matchAll(/<h3[^>]*>[^<]*\{heading-small\}<\/h3>/g)].map((m) => m.index);
  if (heads.length < 2) throw new Error(`${locale}: tag sections not found`);
  const end = html.indexOf('class="cards-teaser', heads[1]);
  const p1 = tagsIn(html.slice(heads[0], heads[1]));
  const p2 = tagsIn(html.slice(heads[1], end > 0 ? end : undefined)).filter((t) => !p1.includes(t));
  console.log(`${locale}: ${p1.length} destination tags, ${p2.length} topic tags`);
  return { locale, 'priority-1': p1.join(', '), 'priority-2': p2.join(', ') };
});

fs.writeFileSync(OUT, `${JSON.stringify({
  total: data.length, offset: 0, limit: data.length, data, ':type': 'sheet',
}, null, 2)}\n`);
console.log(`written ${path.relative(root, OUT)}`);
