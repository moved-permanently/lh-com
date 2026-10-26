/* eslint-disable import/extensions, max-len, no-console */
/**
 * The feed indexes of helix-query.yaml ("feed-*") computed from the local documents
 * (content/data/**.plain.html), for tests and the local diff before the documents are
 * published: rows { path, html, lastModified } as the site's index has them (html = the
 * document's first section). The site's index renders the documents through Edge Delivery
 * (rich texts normalized); here they are as imported.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const CONTENT = path.join(root, 'content');

const walk = (d) => (fs.existsSync(d) ? fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => {
  const p = path.join(d, e.name);
  return e.isDirectory() ? walk(p) : [p];
}) : []);

/** Index configs of helix-query.yaml whose name starts with feed-. */
function feedIndexes() {
  const yaml = fs.readFileSync(path.join(root, 'helix-query.yaml'), 'utf8');
  const out = [];
  const re = /\n {2}(feed-[\w-]+):\n {4}include:\n((?: {6}- .+\n)+)(?: {4}exclude:\n(?: {6}- .+\n)+)? {4}target: (.+)\n/g;
  let m = re.exec(yaml);
  while (m) {
    out.push({ name: m[1], include: m[2].trim().split('\n').map((l) => l.replace(/^\s*- /, '').trim()), target: m[3].trim() });
    m = re.exec(yaml);
  }
  return out;
}

const glob = (pattern) => new RegExp(`^${pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*\*/g, '§').replace(/\*/g, '[^/]+').replace(/§/g, '.*')}$`);

/** target path -> { total, data: rows } */
export default function buildFeedIndexes() {
  const docs = walk(path.join(CONTENT, 'data')).filter((f) => f.endsWith('.plain.html'))
    .map((f) => ({ file: f, path: `/${path.relative(CONTENT, f).replace(/\.plain\.html$/, '')}` }));
  const result = {};
  feedIndexes().forEach((ix) => {
    const res = ix.include.map(glob);
    const data = docs.filter((d) => res.some((r) => r.test(d.path))).map((d) => {
      const html = fs.readFileSync(d.file, 'utf8').trim().replace(/^<div>/, '').replace(/<\/div>$/, '');
      return { path: d.path, html, lastModified: String(Math.floor(fs.statSync(d.file).mtimeMs / 1000)) };
    });
    result[ix.target] = {
      total: data.length, offset: 0, limit: data.length, data, ':type': 'sheet',
    };
  });
  const tmc = path.join(root, 'tools/importer/tmc-translations-sheet.json');
  if (fs.existsSync(tmc)) result['/data/lufthansa-group/ancillary/tmc/tmc-web-translations/tmc-translations.json'] = JSON.parse(fs.readFileSync(tmc, 'utf8'));
  return result;
}

// node feed-index.mjs --write: the test fixture (test/fixtures/graphql-feeds.json)
if (process.argv[1] === fileURLToPath(import.meta.url) && process.argv.includes('--write')) {
  const out = path.join(path.dirname(fileURLToPath(import.meta.url)), 'test/fixtures/graphql-feeds.json');
  fs.writeFileSync(out, JSON.stringify(buildFeedIndexes()));
  console.log(`written ${path.relative(root, out)}`);
}
