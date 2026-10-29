/* eslint-disable no-console, max-len, no-await-in-loop, no-restricted-syntax -- tooling */
/**
 * The checks of a Discover batch (brief 124) against lh-discover's preview, per document of the
 * batch's upload list: the preview answers 200 (page and .plain.html), the H1, the blocks, the
 * images, and the links: every www.lufthansa.com URL of the document must be one Discover's own
 * page has (the source snapshot), never one the importers made of Discover's own link, and every
 * www.lufthansa.com link of the source page must not have become a Discover one (a post-process
 * run over an earlier batch). Links are read from the preview's .plain.html (what goes live), the
 * local document when the preview has none.
 * Writes content-sites/lh-discover/runs/<name>-check.json and prints a summary.
 *
 * Usage: node tools/importer/discover-check.mjs --list content-sites/lh-discover/runs/batch-01-upload.txt
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const argv = process.argv.slice(2);
const opt = (n) => (argv.includes(`--${n}`) ? argv[argv.indexOf(`--${n}`) + 1] : null);
const PREVIEW = opt('origin') || 'https://main--lh-discover--moved-permanently.aem.page';
const W = path.join(root, 'content-sites/lh-discover');
const SNAP = path.join(root, 'tools/importer/bd-snapshots/www.discover-airlines.com');

/** The www.lufthansa.com URLs of a document that its source page does not have. */
export function madeLufthansaLinks(doc, source) {
  const urls = [...new Set([...doc.matchAll(/https:\/\/www\.lufthansa\.com[^"'\s<)]*/g)].map((m) => m[0]))];
  return urls.filter((u) => !source.includes(u.replace(/&amp;/g, '&')) && !source.includes(u));
}

/** The www.lufthansa.com links of a source page that the document has on the source host instead. */
export function lostLufthansaLinks(doc, source, sourceHost = 'www.discover-airlines.com') {
  const paths = [...new Set([...source.matchAll(/href="https:\/\/www\.lufthansa\.com(\/[^"]+)"/g)].map((m) => m[1]))];
  return paths.filter((x) => doc.includes(`"https://${sourceHost}${x}"`) && !doc.includes(`"https://www.lufthansa.com${x}"`))
    .map((x) => `https://www.lufthansa.com${x}`);
}

const list = opt('list');
const name = path.basename(list).replace(/-upload\.txt$/, '');
const paths = fs.readFileSync(path.resolve(root, list), 'utf8').split('\n').map((p) => p.trim()).filter(Boolean);
const rows = [];
for (const p of paths) {
  const [page, plain] = await Promise.all([fetch(`${PREVIEW}${p}`), fetch(`${PREVIEW}${p}.plain.html`)]);
  const html = plain.ok ? await plain.text() : '';
  await page.arrayBuffer();
  const doc = fs.existsSync(path.join(W, 'content', `${p}.plain.html`)) ? fs.readFileSync(path.join(W, 'content', `${p}.plain.html`), 'utf8') : '';
  const srcFile = path.join(SNAP, `${p}.html`);
  const source = fs.existsSync(srcFile) ? fs.readFileSync(srcFile, 'utf8') : '';
  const blocks = [...html.matchAll(/<div class="([a-z][a-z0-9-]*)(?: [^"]*)?">/g)].map((m) => m[1]).filter((b) => !['section-metadata', 'metadata'].includes(b));
  const h1 = (html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) || [])[1]?.replace(/<[^>]+>/g, '').trim() || '';
  rows.push({
    path: p,
    page: page.status,
    plain: plain.status,
    h1,
    blocks: [...new Set(blocks)],
    images: (html.match(/<img /g) || []).length,
    text: html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().length,
    lufthansaMade: source ? madeLufthansaLinks(html || doc, source) : [],
    lufthansaLost: source ? lostLufthansaLinks(html || doc, source) : [],
    lufthansaKept: [...new Set([...(html || doc).matchAll(/https:\/\/www\.lufthansa\.com[^"'\s<)]*/g)].map((m) => m[0]))].length,
  });
}
fs.writeFileSync(path.join(W, 'runs', `${name}-check.json`), `${JSON.stringify(rows, null, 1)}\n`);
const bad = rows.filter((r) => r.page !== 200 || r.plain !== 200 || !r.h1 || r.lufthansaMade.length || r.lufthansaLost.length);
const blocks = {};
rows.forEach((r) => r.blocks.forEach((b) => { blocks[b] = (blocks[b] || 0) + 1; }));
console.log(`${name}: ${rows.length} documents, ${rows.filter((r) => r.page === 200 && r.plain === 200).length} preview 200, ${rows.filter((r) => r.h1).length} with an H1, ${rows.reduce((s, r) => s + r.images, 0)} images; www.lufthansa.com links kept from the source ${rows.reduce((s, r) => s + r.lufthansaKept, 0)}, made by the import ${rows.reduce((s, r) => s + r.lufthansaMade.length, 0)}, lost to Discover's host ${rows.reduce((s, r) => s + r.lufthansaLost.length, 0)}`);
console.log(`blocks: ${Object.entries(blocks).sort((a, b) => b[1] - a[1]).map(([b, n]) => `${b} ${n}`).join(', ')}`);
bad.forEach((r) => console.log(`  ${r.path}: page ${r.page}, plain ${r.plain}, h1 "${r.h1}", made ${r.lufthansaMade.join(' ')}, lost ${r.lufthansaLost.join(' ')}`));
