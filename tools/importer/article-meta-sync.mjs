/* eslint-disable no-console */
/**
 * Post-import step for the Insights articles: sets the Metadata rows publication-date, author-id
 * and category of every article document to www's values in its list answer
 * (tools/importer/parsers/article-data.js ARTICLE_META, from the article export), as the
 * article-header parser writes them on import. For documents imported before the parser took a
 * value from there (publication-date with its time: www orders its lists by it). Idempotent.
 *
 * Usage: node tools/importer/article-meta-sync.mjs [--dry]
 *   prints the number of documents and rows changed; writes the changed paths to
 *   tools/importer/article-meta-sync.txt (input for da-upload.mjs --list)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ARTICLE_META } from './parsers/article-data.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const dry = process.argv.includes('--dry');
const ROWS = { 'publication-date': 'date', 'author-id': 'authorId', category: 'category' };
const escape = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const changed = [];
const counts = {};
Object.entries(ARTICLE_META).forEach(([p, www]) => {
  const file = path.join(root, 'content', `${p}.plain.html`);
  if (!fs.existsSync(file)) return;
  const html = fs.readFileSync(file, 'utf8');
  let next = html;
  Object.entries(ROWS).forEach(([key, field]) => {
    const value = www[field];
    if (!value) return;
    const row = new RegExp(`(<div><div>${key}</div><div>)([\\s\\S]*?)(</div></div>)`);
    const m = next.match(row);
    if (m) {
      if (m[2] === escape(value)) return;
      next = next.replace(row, (all, a, v, b) => `${a}${escape(value)}${b}`);
    } else {
      // after page-type, the row every article document has
      const anchor = /(<div><div>page-type<\/div><div>article<\/div><\/div>)/;
      if (!anchor.test(next)) return;
      next = next.replace(anchor, (all) => `${all}<div><div>${key}</div><div>${escape(value)}</div></div>`);
    }
    counts[key] = (counts[key] || 0) + 1;
  });
  if (next !== html) {
    changed.push(p);
    if (!dry) fs.writeFileSync(file, next);
  }
});
if (!dry) fs.writeFileSync(path.join(root, 'tools/importer/article-meta-sync.txt'), `${changed.join('\n')}\n`);
console.log(`article-meta-sync: ${Object.keys(ARTICLE_META).length} articles in www's lists, ${changed.length} documents ${dry ? 'would change' : 'changed'} ${JSON.stringify(counts)}`);
