/* eslint-disable no-console, no-await-in-loop, max-len */
/**
 * The documents' links to www's PDFs (https://www.lufthansa.com/content/dam/...pdf) become links
 * to the site's copies (/content/dam/<Edge Delivery name>, scripts/dam-path.js edsDamPath, copied
 * by dam-copy.mjs from tools/source-export/feeds/dam/linked-assets.csv). A link is switched only
 * when its copy is published (aem.live answers it: 301 to the media file) or lh-edge serves it
 * from R2 (PDFs over Edge Delivery's 20 MB limit, the 27.6 MB poster: src/dam-media.js, answer
 * with x-lh-edge-route dam-media); the others keep www's link (the PDFs gone on www, copies not
 * published yet). Idempotent: run it again after more publishing.
 *
 * Usage: node tools/importer/switch-dam-pdfs.mjs [--dry]
 *   writes tools/importer/dam-pdf-documents.txt (the documents changed by this run, for
 *   da-upload.mjs) and tools/reports/dam/dam-pdf-documents.{md,json}
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { edsDamPath, decodePath } from '../../scripts/dam-path.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const dry = process.argv.includes('--dry');
const LIVE_SITE = 'https://main--lh-com--moved-permanently.aem.live';
// lh-edge's demo host: the PDFs it serves from R2 (aem.live has no copy of them)
const EDGE_HOST = process.env.LH_EDGE_HOST || 'https://lhedge.bbird.live';
const CONTENT = path.join(root, 'content');
const WWW_PDF = /href="https:\/\/www\.lufthansa\.com(\/content\/dam\/[^"?#]+\.pdf)"/gi;

const decode = (s) => s.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&amp;/g, '&');
const walk = (d) => (fs.existsSync(d) ? fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => {
  const p = path.join(d, e.name);
  if (e.isSymbolicLink()) return [];
  return e.isDirectory() ? walk(p) : [p];
}) : []);

const docs = walk(CONTENT).filter((f) => f.endsWith('.plain.html') && !/\/(lhg|drafts)\//.test(f)).map((file) => ({
  file, docPath: `/${path.relative(CONTENT, file).replace(/\.plain\.html$/, '')}`, html: fs.readFileSync(file, 'utf8'),
})).filter((d) => d.html.match(WWW_PDF));

const assets = [...new Set(docs.flatMap((d) => [...d.html.matchAll(WWW_PDF)].map((m) => decodePath(decode(m[1])))))].sort();
const published = new Map();
for (let i = 0; i < assets.length; i += 8) {
  await Promise.all(assets.slice(i, i + 8).map(async (a) => {
    const r = await fetch(`${LIVE_SITE}${edsDamPath(a)}`, { method: 'HEAD', redirect: 'manual' });
    if (r.status === 200 || r.status === 301) {
      published.set(a, 'published');
      return;
    }
    const edge = await fetch(`${EDGE_HOST}${edsDamPath(a)}`, { method: 'HEAD', redirect: 'manual' });
    const fromR2 = edge.status === 200 && edge.headers.get('x-lh-edge-route') === 'dam-media';
    // 'published' for the switch below: lh-edge answers the site's path from R2
    published.set(a, fromR2 ? 'published' : `not published (${r.status})`);
    if (fromR2) console.log(`${a}: served from R2 by lh-edge`);
  }));
}

const changed = [];
let links = 0;
docs.forEach(({ file, docPath, html: before }) => {
  const html = before.replace(WWW_PDF, (all, raw) => {
    const asset = decodePath(decode(raw));
    if (published.get(asset) !== 'published') return all;
    links += 1;
    return `href="${edsDamPath(asset)}"`;
  });
  if (html !== before) {
    changed.push(docPath);
    if (!dry) fs.writeFileSync(file, html);
  }
});

const waiting = assets.filter((a) => published.get(a) !== 'published');
const report = {
  checkedAt: new Date().toISOString(), documents: docs.length, changedNow: changed.length, links, pdfs: assets.length, waiting: waiting.map((a) => ({ www: a, eds: edsDamPath(a), status: published.get(a) })), changed,
};
fs.mkdirSync(path.join(root, 'tools/reports/dam'), { recursive: true });
fs.writeFileSync(path.join(root, 'tools/reports/dam/dam-pdf-documents.json'), `${JSON.stringify(report, null, 1)}\n`);
fs.writeFileSync(path.join(root, 'tools/reports/dam/dam-pdf-documents.md'), [
  '# Documents that link the site\'s own PDFs', '', report.checkedAt, '',
  `${docs.length} documents still link www's PDFs (${assets.length} PDFs); this run switched ${links} links in ${changed.length} documents${dry ? ' (dry run: nothing written)' : ''}.`, '',
  `## PDFs that keep www's link (${waiting.length})`, '', ...waiting.map((a) => `- ${a} -> ${edsDamPath(a)}: ${published.get(a)}`), '',
  `## Documents changed (${changed.length})`, '', ...changed.sort().map((d) => `- ${d}`), '',
].join('\n'));
if (!dry) fs.writeFileSync(path.join(root, 'tools/importer/dam-pdf-documents.txt'), `${changed.sort().join('\n')}\n`);
console.log(`switch-dam-pdfs: ${docs.length} documents, ${assets.length} PDFs, ${assets.length - waiting.length} published; ${links} links switched in ${changed.length} documents${dry ? ' (dry)' : ''}`);
