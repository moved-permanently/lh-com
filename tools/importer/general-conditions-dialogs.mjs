/* eslint-disable no-console, import/no-extraneous-dependencies -- dev tooling (linkedom) */
/**
 * Post-import step: the dialog documents of www's footer disclaimers (brief 460). The import
 * (transformers/lufthansa-cleanup.js) links a page's "General Conditions" to
 * /{cc}/{ll}/fragments/modals/general-conditions and leaves the conditions out; this writes that
 * document (the label as H2, the modal's text) from the same snapshots, once per locale and label.
 * Pages of one locale that give the same document another text are reported, the homepage's wins.
 *
 * Run after the import, before the upload (the documents go with the pages). --host: the
 * snapshots' host (www.lufthansa.com when not given; www.swiss.com for SWISS's homepages, the brief
 * after 514).
 * Usage: node tools/importer/general-conditions-dialogs.mjs
 *          --html-dir <dir holding www.lufthansa.com> [--host www.swiss.com]
 *          [--locale de/en] [--out content] [--dry]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseHTML } from 'linkedom';
import { dialogDocument, dialogPath, readFooterDisclaimer } from './footer-disclaimer.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const argv = process.argv.slice(2);
const opt = (name) => (argv.includes(`--${name}`) ? argv[argv.indexOf(`--${name}`) + 1] : null);
const dry = argv.includes('--dry');
const htmlDir = opt('html-dir');
const only = opt('locale');
const out = path.resolve(root, opt('out') || 'content');
if (!htmlDir) {
  console.error('Usage: node tools/importer/general-conditions-dialogs.mjs --html-dir <dir> [--host www.swiss.com] [--locale cc/ll] [--out content] [--dry]');
  process.exit(1);
}

const host = path.join(path.resolve(htmlDir), opt('host') || 'www.lufthansa.com');
const pages = [];
const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).forEach((e) => {
  const p = path.join(dir, e.name);
  if (e.isDirectory()) walk(p);
  else if (e.name.endsWith('.html')) pages.push(p);
});
(only ? [path.join(host, only)] : [host]).filter((d) => fs.existsSync(d)).forEach(walk);

const docs = new Map(); // dialog path -> { html, from }
pages.forEach((file) => {
  const html = fs.readFileSync(file, 'utf8');
  if (!html.includes('footer-disclaimer')) return;
  const pagePath = `/${path.relative(host, file).replace(/\\/g, '/').replace(/\.html$/, '')}`;
  const { document } = parseHTML(html);
  const target = dialogPath(readFooterDisclaimer(document), pagePath);
  const doc = target && dialogDocument(document);
  if (!doc) return;
  const seen = docs.get(target);
  if (seen && seen.html !== doc) {
    console.warn(`${target}: ${pagePath} gives another text than ${seen.from}`);
    if (!pagePath.endsWith('/homepage')) return;
  }
  if (!seen || pagePath.endsWith('/homepage')) docs.set(target, { html: doc, from: pagePath });
});

docs.forEach(({ html, from }, target) => {
  const file = path.join(out, `${target}.plain.html`);
  const before = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : null;
  if (!dry && before !== html) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, html);
  }
  let state = dry ? 'would write' : 'written';
  if (before === html) state = 'unchanged';
  console.log(`${target}: ${state} (from ${from})`);
});
if (!docs.size) console.log('no footer disclaimer with a dialog in these snapshots');
