/* eslint-disable no-console */
/**
 * Adds the metadata `post-handler: true` to the pages of the `mfe` template (page-templates.json;
 * AMS rest A4 part 2): lh-edge answers POST <page>.mfe.html only for such pages and hands the
 * filtered fields to the page's micro-frontend block (tools/workers/lh-edge/src/mfe.js).
 * Idempotent; run after the import and head-metadata.mjs, before the DA upload.
 * Usage: node tools/importer/add-post-handler.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const { templates } = JSON.parse(fs.readFileSync(path.join(root, 'tools/importer/page-templates.json'), 'utf8'));
const pages = templates.find((t) => t.name === 'mfe').urls.map((u) => new URL(u).pathname.replace(/\/$/, ''));
const ROW = /<div><div>post-handler<\/div><div>[^<]*<\/div><\/div>/;
const CELL = '<div><div>post-handler</div><div>true</div></div>';

let changed = 0;
pages.forEach((page) => {
  const file = path.join(root, 'content', `${page}.plain.html`);
  if (!fs.existsSync(file)) {
    console.log(`  missing: ${page}`);
    return;
  }
  const html = fs.readFileSync(file, 'utf8');
  let next;
  if (ROW.test(html)) next = html.replace(ROW, CELL);
  else if (html.includes('<div class="metadata">')) next = html.replace('<div class="metadata">', `<div class="metadata">${CELL}`);
  else next = `${html.trimEnd()}\n<div><div class="metadata">${CELL}</div></div>`;
  if (next !== html) {
    fs.writeFileSync(file, next);
    changed += 1;
  }
});
console.log(`add-post-handler: ${pages.length} pages, ${changed} changed`);
