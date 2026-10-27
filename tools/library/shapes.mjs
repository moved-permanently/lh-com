/* eslint-disable no-console, max-len, import/no-extraneous-dependencies, import/extensions -- dev tooling */
/**
 * The structures of one variant on all its pages, to see why blocks differ from the library:
 * per block its rows as shapes (rowShape: per cell the field types, i image, t text, l list),
 * grouped and counted; --fit: the library entries chooseModels gives them (structure.mjs).
 * Usage: node tools/library/shapes.mjs [--fit] "columns-media (sidebar)" [...]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  parse, describeBlockDiv, rowShape, chooseModels,
} from './structure.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const CONTENT = path.join(root, 'content');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'tools/library/library-variants.json'), 'utf8'));

/** Every block of a variant on its pages: [{page, d}]. */
export function variantBlocks(key) {
  const info = manifest[key];
  if (!info) throw new Error(`no variant ${key}`);
  const want = [info.block, ...(info.variant ? info.variant.split(', ') : [])].join(' ');
  return info.pages.flatMap((page) => {
    const file = path.join(CONTENT, `${page}.plain.html`);
    if (!fs.existsSync(file)) return [];
    const doc = parse(`<main>${fs.readFileSync(file, 'utf8')}</main>`);
    return [...doc.querySelectorAll('main > div > div[class]')]
      .filter((b) => b.className.trim().split(/\s+/).join(' ') === want)
      .map((b) => ({ page, d: describeBlockDiv(b), block: b }));
  });
}

const modelText = (m) => m.map((c) => c.map((t) => t[0]).join('')).join('|');

/** The entries chooseModels gives the variant, with the blocks each one fits. */
export function fitReport(key, multi) {
  const blocks = variantBlocks(key).map((b) => b.d);
  return {
    key,
    blocks: blocks.length,
    entries: chooseModels(blocks, multi).map((e) => ({ model: multi ? modelText(e.model) : e.model.map(modelText).join(' / '), fit: e.fit.length })),
  };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  if (process.argv[2] === '--fit') {
    const multiBlocks = new Set(JSON.parse(fs.readFileSync(path.join(CONTENT, 'library/blocks.json'), 'utf8')).editor.data.map((r) => r.block));
    process.argv.slice(3).forEach((key) => {
      const r = fitReport(key, multiBlocks.has(manifest[key].block));
      console.log(`${key}: ${r.blocks} blocks; ${r.entries.map((e) => `${e.model.slice(0, 70)} fits ${e.fit}`).join('; ')}`);
    });
    process.exit(0);
  }
  process.argv.slice(2).forEach((key) => {
    const blocks = variantBlocks(key);
    const groups = new Map();
    blocks.forEach((b) => {
      const s = b.d.rows.map(rowShape).join(' / ');
      if (!groups.has(s)) groups.set(s, []);
      groups.get(s).push(b.page);
    });
    console.log(`\n${key}: ${blocks.length} blocks, ${groups.size} structures; sample ${manifest[key].sample}`);
    [...groups].sort((a, b) => b[1].length - a[1].length).slice(0, 12).forEach(([s, pages]) => console.log(`  ${String(pages.length).padStart(4)}  ${s.slice(0, 150)}   e.g. ${pages[0]}`));
  });
}
