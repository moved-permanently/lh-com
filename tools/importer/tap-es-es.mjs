/* eslint-disable no-console -- tooling */
/**
 * TAP's Spanish version (es-es) with ema-cashub's tools as they are: tap-import.mjs and
 * tap-nav.mjs have texts in pt and en only (tap-import's LABELS, tap-nav's SETUP), so a page with
 * one of www's widgets or a video stops on LABELS.es, and the nav falls back to English. This
 * runs the current version of either tool with a Spanish entry added in memory, nothing else
 * changed: a copy in the system's temp folder (its root still this repository), started with the
 * arguments given. A tool that has its own `es` entry runs as it is. After an import run, the
 * run's /es-es documents get mergeMarks (below).
 *
 * Usage: node tools/importer/tap-es-es.mjs import <tap-import.mjs arguments>
 *        node tools/importer/tap-es-es.mjs nav <tap-nav.mjs arguments> (--locale es-es)
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
// the Spanish texts, as www's es-es pages write them (the help tab "Ayuda", /es-es/ayuda; the
// language switch: es-es's other language on www, en-es, not on lh-tap: linked on www)
export const ES = {
  import: { anchor: 'const LABELS = {', entry: "  es: { onWww: 'Ver en flytap.com', video: 'Ver el vídeo' }," },
  nav: {
    anchor: 'const SETUP = {',
    entry: "  es: {\n    logoAlt: 'TAP Air Portugal, volver a la página de inicio', menu: 'Menú', help: ['Ayuda', '/ayuda'], other: ['English', 'en-es'], appStore: 'App Store', googlePlay: 'Google Play',\n  },",
  },
};
const FILES = { import: 'tap-import.mjs', nav: 'tap-nav.mjs' };

/**
 * A bold run right after a bold-italic one (<em><strong>A</strong></em><strong>B</strong>, as
 * TAP's rich text marks a word inside a bold sentence) as one bold run
 * (<strong><em>A</em>B</strong>), and two bold runs that touch as one: the preview printed the
 * first form's marks as literal asterisks ("Cristo morto**,", "compartido*****").
 */
export function mergeMarks(html) {
  return html
    .replace(/<em><strong>((?:(?!<\/?(?:em|strong)>)[^])*?)<\/strong><\/em><strong>/g, '<strong><em>$1</em>')
    .replace(/<\/strong><strong>/g, '');
}

/**
 * Every /es-es document of the import run (runs/<name>-import.json: pages and fragments, also
 * those the run left as they were) with mergeMarks: the paths changed.
 */
function fixMarks(name) {
  const W = path.join(here, '../../content-sites/lh-tap');
  const report = path.join(W, 'runs', `${name}-import.json`);
  if (!fs.existsSync(report)) return [];
  const docs = Object.values(JSON.parse(fs.readFileSync(report, 'utf8'))).filter((r) => !r.skipped).flatMap((r) => [r.doc, ...(r.fragments || [])]);
  return [...new Set(docs)].filter((p) => p.startsWith('/es-es/') || p === '/es-es').filter((p) => {
    const f = path.join(W, 'content', `${p}.plain.html`);
    const html = fs.readFileSync(f, 'utf8');
    const out = mergeMarks(html);
    if (out !== html) fs.writeFileSync(f, out);
    return out !== html;
  });
}

/** The tool's source with the Spanish entry (null when it has one of its own). */
export function withSpanish(src, tool, file) {
  const { anchor, entry } = ES[tool];
  const start = src.indexOf(anchor);
  if (start < 0) throw new Error(`${FILES[tool]}: ${anchor} not found`);
  const end = src.indexOf('\n};', start);
  if (/\n\s+es:\s*\{/.test(src.slice(start, end))) return null;
  const rootLine = 'path.dirname(fileURLToPath(import.meta.url))';
  if (!src.includes(rootLine)) throw new Error(`${FILES[tool]}: root line not found`);
  return src
    .replace(anchor, `${anchor}\n${entry}`)
    .replace(rootLine, `path.dirname(fileURLToPath(${JSON.stringify(pathToFileURL(file).href)}))`)
    .replace(/from '\.\/tap-import\.mjs'/, `from ${JSON.stringify(pathToFileURL(path.join(here, 'tap-import.mjs')).href)}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [tool, ...args] = process.argv.slice(2);
  if (!FILES[tool]) { console.log('usage: tap-es-es.mjs import|nav <the tool\'s arguments>'); process.exit(1); }
  const file = path.join(here, FILES[tool]);
  const src = withSpanish(fs.readFileSync(file, 'utf8'), tool, file);
  let run = file;
  if (src) {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tap-es-es-'));
    run = path.join(dir, FILES[tool]);
    fs.writeFileSync(run, src);
  } else console.log(`${FILES[tool]} has its own es texts: run as it is`);
  const r = spawnSync(process.execPath, [run, ...args], { stdio: 'inherit', cwd: path.join(here, '../..') });
  if (r.status === 0 && tool === 'import' && !args.includes('--dry-run')) {
    const name = args.includes('--name') ? args[args.indexOf('--name') + 1] : 'batch';
    const fixed = fixMarks(name);
    console.log(`mergeMarks: ${fixed.length} es-es documents${fixed.length ? `: ${fixed.join(', ')}` : ''}`);
  }
  process.exit(r.status ?? 1);
}
